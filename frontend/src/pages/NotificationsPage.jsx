import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { acceptFriendRequest, getFriendRequests } from "../lib/api";
import {
  BellIcon,
  ClockIcon,
  MessageSquareIcon,
  UserCheckIcon,
  Briefcase,
  Building,
  Users,
  MapPin,
} from "lucide-react";
import NoNotificationsFound from "../components/NoNotificationsFound";
import { useEffect } from "react";

const NotificationsPage = () => {
  const queryClient = useQueryClient();

  const { data: friendRequests, isLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const { mutate: acceptRequestMutation, isPending } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const incomingRequest = friendRequests?.incomingReqs || [];
  const acceptedRequests = friendRequests?.acceptedReqs || [];

  useEffect(() => {
    acceptedRequests.forEach((notif) => {
      localStorage.setItem(`notif-read-${notif._id}`, "true");
    });
  }, [acceptedRequests]);

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { color: "badge-error", text: "Admin" },
      employee: { color: "badge-primary", text: "Employee" },
      client: { color: "badge-success", text: "Client" },
      unassigned: { color: "badge-warning", text: "Unassigned" },
    };
    const config = roleConfig[role] || roleConfig.unassigned;
    return (
      <span className={`badge badge-xs ${config.color}`}>{config.text}</span>
    );
  };

  const getUserInfo = (user) => {
    const info = [];

    if (user.position) {
      info.push({
        icon: <Briefcase className="h-3 w-3" />,
        text: user.position,
      });
    }

    if (user.department) {
      info.push({
        icon: <Building className="h-3 w-3" />,
        text: user.department,
      });
    }

    if (user.institutionName) {
      info.push({
        icon: <Users className="h-3 w-3" />,
        text: user.institutionName,
      });
    }

    if (user.location) {
      info.push({ icon: <MapPin className="h-3 w-3" />, text: user.location });
    }

    return info;
  };

  // Tambahkan setelah acceptedRequests
  console.log("🔍 DEBUG Accepted Requests Data:", {
    acceptedRequests,
    count: acceptedRequests.length,
    firstItem: acceptedRequests[0],
    firstRecipient: acceptedRequests[0]?.recipient,
    isRecipientCurrentUser:
      acceptedRequests[0]?.recipient?._id === "YOUR_USER_ID", // Ganti dengan ID Anda
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 flex items-center gap-2">
          Notification
          {incomingRequest.length + acceptedRequests.length > 0 && (
            <span className="badge badge-primary">
              {incomingRequest.length + acceptedRequests.length}
            </span>
          )}
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <>
            {incomingRequest.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <UserCheckIcon className="h-5 w-5 text-primary" />
                  Friend Request
                  <span className="badge badge-primary ml-2">
                    {incomingRequest.length}
                  </span>
                </h2>

                <div className="space-y-3">
                  {incomingRequest.map((request) => {
                    const userInfo = getUserInfo(request.sender);

                    return (
                      <div
                        key={request._id}
                        className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="card-body p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-start gap-3">
                              <div className="avatar">
                                <div className="w-14 h-14 rounded-full bg-base-300">
                                  <img
                                    src={
                                      request.sender.profilePic ||
                                      "/default-avatar.png"
                                    }
                                    alt={request.sender.fullName}
                                    className="object-cover"
                                    onError={(e) => {
                                      e.target.src = "/default-avatar.png";
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold">
                                    {request.sender.fullName}
                                  </h3>
                                  {getRoleBadge(request.sender.role)}
                                </div>

                                {/* User Information */}
                                {userInfo.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mb-2">
                                    {userInfo.map((info, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center gap-1 text-xs opacity-80"
                                      >
                                        {info.icon}
                                        <span>{info.text}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Company/Institution */}
                                {(request.sender.companyName ||
                                  request.sender.institutionName) && (
                                  <p className="text-sm opacity-70 mb-1">
                                    {request.sender.companyName ||
                                      request.sender.institutionName}
                                  </p>
                                )}
                              </div>
                            </div>

                            <button
                              className="btn btn-primary btn-sm self-start"
                              onClick={() => acceptRequestMutation(request._id)}
                              disabled={isPending}
                            >
                              {isPending ? "Accepting..." : "Accept"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ACCEPTED REQUESTS NOTIFICATIONS */}
            {/* ACCEPTED REQUESTS NOTIFICATIONS */}
            {acceptedRequests.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <BellIcon className="h-5 w-5 text-success" />
                  Connections
                  <span className="badge badge-success ml-2">
                    {acceptedRequests.length}
                  </span>
                </h2>

                <div className="space-y-3">
                  {acceptedRequests.map((notification) => {
                    // Data dari backend versi baru: notification.sender adalah teman
                    const friend = notification.sender;
                    const userInfo = getUserInfo(friend);

                    return (
                      <div
                        key={notification._id || `friend_${friend._id}`}
                        className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="card-body p-4">
                          <div className="flex items-start gap-3">
                            <div className="avatar mt-1">
                              <div className="size-10 rounded-full">
                                <img
                                  src={
                                    friend.profilePic || "/default-avatar.png"
                                  }
                                  alt={friend.fullName}
                                  className="object-cover w-full h-full"
                                  onError={(e) => {
                                    e.target.src = "/default-avatar.png";
                                  }}
                                />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">
                                  {friend.fullName}
                                </h3>
                                {getRoleBadge(friend.role)}
                              </div>

                              <p className="text-sm my-1">
                                Connected with {friend.fullName}
                              </p>

                              {/* User Information */}
                              {userInfo.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                  {userInfo.map((info, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-1 text-xs opacity-80"
                                    >
                                      {info.icon}
                                      <span>{info.text}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <p className="text-xs flex items-center opacity-70 mt-2">
                                <ClockIcon className="h-3 w-3 mr-1" />
                                Connected
                              </p>
                            </div>
                            <div className="badge badge-success gap-1">
                              <MessageSquareIcon className="h-3 w-3" />
                              Friend
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {incomingRequest.length === 0 && acceptedRequests.length === 0 && (
              <NoNotificationsFound />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
