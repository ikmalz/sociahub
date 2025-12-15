import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getOutgoingFriendReqs,
  getPosts,
  getRecommendedUsers,
  getTimelineStories,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router";
import {
  CheckCircleIcon,
  MapPinIcon,
  UserPlusIcon,
  UsersIcon,
  Camera,
  MessageSquare,
  Sparkles,
  Clock,
  User,
  BuildingIcon,
} from "lucide-react";
import FriendCard from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import { capitalize } from "../lib/utils";
import PostForm from "../components/PostForm";
import PostCard from "../components/PostCard";
import StoriesPreview from "../components/StoriesPreview";
import StoryCreateModal from "../components/StoryCreateModal";
import StoriesCarousel from "../components/StoriesCarousel";

const getDepartmentIcon = (department) => {
  if (!department) return "👤";

  const deptLower = department?.toLowerCase() || "";
  const icons = {
    "human resources": "👥",
    hr: "👥",
    finance: "💰",
    marketing: "📈",
    sales: "📊",
    it: "💻",
    technology: "💻",
    operations: "⚙️",
    "customer service": "💁",
    "r&d": "🔬",
    research: "🔬",
    procurement: "📦",
    logistics: "🚚",
    administration: "📋",
    legal: "⚖️",
    executive: "👔",
  };

  return icons[deptLower] || "👤";
};

const HomePage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [showStories, setShowStories] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendsReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
  });

  const { data: storiesData } = useQuery({
    queryKey: ["stories"],
    queryFn: getTimelineStories,
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendsReqs"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendsReqs?.length > 0) {
      outgoingFriendsReqs.forEach((req) => outgoingIds.add(req.recipient._id));
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendsReqs]);

  const stories = storiesData?.stories || [];

  const handleOpenStories = (userIndex = 0, storyIndex = 0) => {
    setSelectedUserIndex(userIndex);
    setSelectedStoryIndex(storyIndex);
    setShowStories(true);
  };

  const shuffledRecommendedUsers = [...recommendedUsers]
    .sort(() => 0.5 - Math.random())
    .slice(0, 2);

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser?.user?._id || currentUser?._id;

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 sm:px-5 lg:px-8 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MAIN CONTENT */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-primary to-secondary text-primary-content rounded-xl p-4 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-semibold mb-0.5">
                    Welcome Back 👋
                  </h1>
                  <p className="text-sm opacity-85">
                    Stay updated with company activities
                  </p>
                </div>
                <BuildingIcon className="size-8 opacity-80 hidden md:block" />
              </div>
            </div>

            {/* Stories Preview - IMPROVED */}
            <div className="card bg-base-100 shadow rounded-xl">
              <div className="card-body p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                      <Camera className="size-3.5 text-base-100" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold">Stories</h2>
                      <p className="text-xs opacity-60">Latest moments</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowCreateStory(true)}
                    className="btn btn-primary btn-xs"
                  >
                    <Camera className="size-3 mr-1" />
                    Create Stories
                  </button>
                </div>

                {stories.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 mx-auto mb-3 bg-base-200 rounded-full flex items-center justify-center">
                      <Camera className="size-6 opacity-40" />
                    </div>
                    <p className="text-sm opacity-70 mb-3">
                      No stories from your friends yet
                    </p>
                    <button
                      onClick={() => setShowCreateStory(true)}
                      className="btn btn-outline btn-sm"
                    >
                      Be the first to share!
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
                    {/* Create Story Card */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => setShowCreateStory(true)}
                        className="flex flex-col items-center group"
                      >
                        <div className="relative mb-2">
                          <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 group-hover:border-primary transition-colors flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
                              <Camera className="size-6 text-primary" />
                            </div>
                          </div>
                          <div className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-base-100">
                            <span className="text-xs text-base-100 font-bold">
                              +
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-medium">Add Story</span>
                      </button>
                    </div>

                    {/* Friends' Stories */}
                    {stories.map((userStories, userIndex) => {
                      const user = userStories.user;
                      const userStoryCount = userStories.stories?.length || 0;
                      const hasUnviewed = userStories.hasUnviewed || false;

                      return (
                        <div key={user._id} className="flex-shrink-0">
                          <button
                            onClick={() => handleOpenStories(userIndex, 0)}
                            className="flex flex-col items-center group relative"
                          >
                            <div className="relative mb-2">
                              <div
                                className={`w-16 h-16 rounded-full p-0.5 ${
                                  hasUnviewed
                                    ? "bg-gradient-to-r from-primary to-secondary"
                                    : "bg-gradient-to-r from-gray-300 to-gray-400"
                                }`}
                              >
                                <div className="w-full h-full rounded-full overflow-hidden border border-base-100">
                                  <img
                                    src={
                                      user.profilePic || "/default-avatar.png"
                                    }
                                    alt={user.fullName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.src = "/default-avatar.png";
                                    }}
                                  />
                                </div>
                              </div>

                              {userStoryCount > 0 && (
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-base-100">
                                  <span className="text-xs text-base-100 font-bold">
                                    {userStoryCount}
                                  </span>
                                </div>
                              )}
                            </div>
                            <span className="text-[11px] font-medium truncate max-w-16">
                              {user._id === currentUserId
                                ? "You"
                                : user.fullName}
                            </span>

                            {hasUnviewed && (
                              <div className="absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Stories Stats */}
                {stories.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-base-300">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <UsersIcon className="size-4 opacity-70" />
                        <span>
                          {stories.length}{" "}
                          {stories.length === 1 ? "friend has" : "friends have"}{" "}
                          stories
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 opacity-70" />
                        <span>24h remaining</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Create Post */}
            <div className="card bg-base-100 shadow rounded-xl">
              <div className="card-body p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <MessageSquare className="size-4 text-primary-content" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold">Create Post</h2>
                    <p className="text-xs opacity-60">Share something</p>
                  </div>
                </div>

                <PostForm />
              </div>
            </div>

            {/* Timeline */}
            <div className="card bg-base-100 shadow rounded-xl">
              <div className="card-body p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-semibold">Recent Posts</h2>
                    <p className="text-xs opacity-60">Latest from network</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="badge badge-primary badge-sm">
                      {posts.length}
                    </span>
                    <Link to="/posts" className="btn btn-outline btn-xs">
                      View all
                    </Link>
                  </div>
                </div>

                {loadingPosts ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <span className="loading loading-spinner loading-lg text-primary mb-4" />
                    <p className="opacity-70">Loading posts...</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 bg-base-200 rounded-full flex items-center justify-center">
                      <MessageSquare className="size-10 opacity-40" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                    <p className="opacity-70 max-w-sm mx-auto">
                      Be the first to share your language learning journey!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {posts
                      ?.sort(
                        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                      )
                      ?.slice(0, 5)
                      ?.map((post) => (
                        <PostCard key={post._id} post={post} />
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            {/* FRIENDS LIST */}
            <div className="card bg-base-100 shadow-md rounded-xl">
              <div className="card-body p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-semibold">Connections</h2>
                    <p className="text-xs opacity-60">
                      {friends.length} connected
                    </p>
                  </div>
                  <Link to="/friends" className="btn btn-outline btn-xs">
                    <UsersIcon className="size-4 mr-1" />
                    View All
                  </Link>
                </div>

                {loadingFriends ? (
                  <div className="flex justify-center py-8">
                    <span className="loading loading-spinner loading-md text-primary" />
                  </div>
                ) : friends.length === 0 ? (
                  <NoFriendsFound />
                ) : (
                  <div className="space-y-3">
                    {friends.slice(0, 1).map((friend) => (
                      <div key={friend._id} className="group">
                        <FriendCard friend={friend} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RECOMMENDED USERS */}
            <div className="card bg-base-100 shadow-md rounded-xl">
              <div className="card-body p-4">
                <div className="flex items-center gap-3 p-2 border border-base-300 rounded-lg">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-success to-emerald-500 flex items-center justify-center">
                    <UserPlusIcon className="size-4 text-base-100" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Suggested Colleagues</h2>
                    <p className="text-sm opacity-70">
                      Connect with team members in your department
                    </p>
                  </div>
                </div>

                {loadingUsers ? (
                  <div className="flex justify-center py-8">
                    <span className="loading loading-spinner loading-md text-primary" />
                  </div>
                ) : recommendedUsers.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 mx-auto mb-3 bg-base-200 rounded-full flex items-center justify-center">
                      <UsersIcon className="size-6 opacity-40" />
                    </div>
                    <p className="text-sm opacity-70">
                      No recommendations available
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {shuffledRecommendedUsers.map((user) => {
                      const hasRequestBeenSent = outgoingRequestsIds.has(
                        user._id
                      );

                      return (
                        <div
                          key={user._id}
                          className="flex items-center gap-3 p-3 border border-base-300 rounded-xl hover:border-primary/30 transition-colors"
                        >
                          {/* Avatar */}
                          <div className="relative">
                            <div className="w-11 h-11 rounded-full overflow-hidden">
                              <img
                                src={user.profilePic || "/default-avatar.png"}
                                alt={user.fullName}
                                className="w-full h-full object-cover"
                                onError={(e) =>
                                  (e.target.src = "/default-avatar.png")
                                }
                              />
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {user.fullName}
                            </p>

                            {user.location && (
                              <p className="text-xs opacity-70 truncate flex items-center gap-1">
                                <MapPinIcon className="size-3" />
                                {user.location}
                              </p>
                            )}

                            <span className="badge badge-secondary badge-sm mt-1">
                              {getDepartmentIcon(user.department)}{" "}
                              {user.department}
                            </span>
                          </div>

                          {/* Action */}
                          <button
                            className={`btn btn-sm ${
                              hasRequestBeenSent
                                ? "btn-disabled opacity-50"
                                : "btn-outline btn-primary"
                            }`}
                            onClick={() => sendRequestMutation(user._id)}
                            disabled={hasRequestBeenSent || isPending}
                          >
                            {hasRequestBeenSent ? "Requested" : "Add"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20 p-5">
              <h3 className="font-bold mb-3">Your Network</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-base-100 p-3 rounded-lg border border-base-300">
                  <div className="text-lg font-bold text-primary">
                    {friends.length}
                  </div>
                  <div className="text-[11px] opacity-60">Friends</div>
                </div>

                <div className="bg-base-100 p-3 rounded-lg border border-base-300">
                  <div className="text-2xl font-bold text-secondary">
                    {posts.length}
                  </div>
                  <div className="text-xs opacity-70">Posts</div>
                </div>
                <div className="bg-base-100 p-3 rounded-lg border border-base-300">
                  <div className="text-2xl font-bold text-accent">
                    {stories.length}
                  </div>
                  <div className="text-xs opacity-70">Active Stories</div>
                </div>
                <div className="bg-base-100 p-3 rounded-lg border border-base-300">
                  <div className="text-2xl font-bold text-info">
                    {recommendedUsers.length}
                  </div>
                  <div className="text-xs opacity-70">Suggestions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowCreateStory(true)}
        className="fixed bottom-5 right-5 w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full shadow-md flex items-center justify-center z-40"
      >
        <Camera className="size-6 text-base-100" />
      </button>

      {showCreateStory && (
        <StoryCreateModal
          isOpen={showCreateStory}
          onClose={() => setShowCreateStory(false)}
        />
      )}

      {showStories && (
        <StoriesCarousel
          onClose={() => setShowStories(false)}
          initialStoryIndex={selectedStoryIndex}
          initialUserIndex={selectedUserIndex}
        />
      )}
    </div>
  );
};

export default HomePage;
