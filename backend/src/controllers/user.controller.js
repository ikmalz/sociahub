import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user.id;
    const currentUser = req.user;

    const friendRequests = await FriendRequest.find({
      $or: [
        { sender: currentUserId, status: "accepted" },
        { recipient: currentUserId, status: "accepted" }
      ]
    });

    const friendIds = friendRequests.map(request => 
      request.sender.toString() === currentUserId 
        ? request.recipient.toString() 
        : request.sender.toString()
    );

    const allFriendIds = [...currentUser.friends.map(id => id.toString()), ...friendIds];
    const uniqueFriendIds = [...new Set(allFriendIds)];

    const pendingRequests = await FriendRequest.find({
      $or: [
        { sender: currentUserId, status: "pending" },
        { recipient: currentUserId, status: "pending" }
      ]
    });

    const pendingIds = pendingRequests.map(request => 
      request.sender.toString() === currentUserId 
        ? request.recipient.toString() 
        : request.sender.toString()
    );

    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } },
        { _id: { $nin: uniqueFriendIds } }, 
        { _id: { $nin: pendingIds } }, 
        { isOnBoarded: true },
        { isActive: true },
        { approvalStatus: "approved" },
      ],
    }).select("-password -refreshToken");

    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("Error in getRecommendedUsers controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user.id).select("friends").populate({
      path: "friends",
      select:
        "fullName profilePic department position email phoneNumber location bio expertise skills isOnBoarded nativeLanguange learningLanguange createdAt", // HAPUS employeeId
    });

    res.status(200).json(user.friends || []);
  } catch (error) {
    console.error("Error in getMyFriends controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;

    // prevent sending req to yourself
    if (myId === recipientId) {
      return res
        .status(400)
        .json({ message: "You can't send friend request to yourself" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // check if user is already friends
    if (recipient.friends.includes(myId)) {
      return res
        .status(400)
        .json({ message: "You are already friends with this user" });
    }

    if (!recipient.isActive || recipient.approvalStatus !== "approved") {
      return res.status(400).json({
        message: "You cannot send a friend request to this user",
      });
    }

    // check if a req already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "A friend request already exists between you and this user",
      });
    }

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    res.status(201).json(friendRequest);
  } catch (error) {
    console.error("Error in sendFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Verify the current user is the recipient
    if (friendRequest.recipient.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to accept this request" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    // add each user to the other's friends array
    // $addToSet: adds elements to an array only if they do not already exist.
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.log("Error in acceptFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getFriendRequests(req, res) {
  try {
    const userId = req.user.id;

    console.log("🔍 [BACKEND] Fetching friend requests for user:", userId);

    // INCOMING: Request yang dikirim ke user (status pending)
    const incomingReqs = await FriendRequest.find({ 
      recipient: userId, 
      status: 'pending' 
    })
      .populate({
        path: 'sender',
        select: 'fullName profilePic role position department institutionName companyName location bio email',
      })
      .sort({ createdAt: -1 });

    console.log("📥 [BACKEND] Found incoming requests:", incomingReqs.length);

    // GET ALL FRIENDS (accepted connections)
    // Cara 1: Dari field friends di User model
    const user = await User.findById(userId).select('friends').populate({
      path: 'friends',
      select: 'fullName profilePic role position department institutionName companyName location bio',
      options: { limit: 10, sort: { updatedAt: -1 } }
    });

    const acceptedReqs = user.friends || [];

    console.log("✅ [BACKEND] Found friends:", acceptedReqs.length);

    res.status(200).json({
      success: true,
      incomingReqs,
      acceptedReqs: acceptedReqs.map(friend => ({
        _id: `friend_${friend._id}`,
        sender: friend, // Friend menjadi "sender" untuk konsistensi
        recipient: { _id: userId },
        status: 'accepted',
        updatedAt: friend.updatedAt || new Date()
      }))
    });
  } catch (error) {
    console.error("❌ [BACKEND] Error in getFriendRequests:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal Server Error" 
    });
  }
}

export async function getOutgoingFriendReqs(req, res) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate(
      "recipient",
      "fullName profilePic nativeLanguange learningLanguange"
    );

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.log("Error in getOutgoingFriendReqs controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getUserById(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select(
      "fullName profilePic department position email phoneNumber location bio expertise friends"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserById controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getAllUsers(req, res) {
  try {
    const users = await User.find({})
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });
    
    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getAllUsers controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}