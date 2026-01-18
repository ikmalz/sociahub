import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import {
  UsersIcon,
  SearchIcon,
  UserPlusIcon,
  Building2Icon,
  BriefcaseIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  MessageSquareIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ArrowLeftIcon,
  UserIcon,
  XIcon,
  CheckCircleIcon,
} from "lucide-react";
import {
  getRecommendedUsers,
  sendFriendRequest,
  getOutgoingFriendReqs,
  getUserFriends, // Tambahkan ini
} from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import { getVisibleRoles } from "../utils/roleFilter";
import { useState, useEffect } from "react";

const NetworkPage = () => {
  const queryClient = useQueryClient();
  const { authUser } = useAuthUser();

  const userRole = authUser?.role;
  const isClient = userRole === "client";
  const isEmployee = userRole === "employee";
  const isAdmin = userRole === "admin";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const [friendIds, setFriendIds] = useState(new Set());

  const {
    data: allUsers = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["network-users", userRole],
    queryFn: async () => {
      console.log("🔄 Fetching all users for role:", userRole);
      const data = await getRecommendedUsers();
      console.log("📊 Raw API data received:", data);
      console.log("👥 Total users from API:", data?.length || 0);

      if (data && data.length > 0) {
        const roleCount = {};
        data.forEach((user) => {
          roleCount[user.role] = (roleCount[user.role] || 0) + 1;
        });
        console.log("🎭 Role distribution:", roleCount);

        console.log("👤 All users detail:");
        data.forEach((user, index) => {
          console.log(
            `  ${index + 1}. ${user.fullName} (${user.role}) - ID: ${user._id}`
          );
        });
      }

      return data;
    },
    enabled: !!userRole,
  });

  const { data: outgoingFriendsReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { data: userFriends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
      queryClient.invalidateQueries({ queryKey: ["network-users"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.refetchQueries({ queryKey: ["friends"] });
    },
  });

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendsReqs?.length > 0) {
      outgoingFriendsReqs.forEach((req) => outgoingIds.add(req.recipient._id));
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendsReqs]);

  useEffect(() => {
    const friendIdSet = new Set();
    if (userFriends?.length > 0) {
      userFriends.forEach((friend) => {
        friendIdSet.add(friend._id);
      });
    }
    setFriendIds(friendIdSet);
  }, [userFriends]);

  const allowedRoles = getVisibleRoles(userRole);
  console.log("👑 Current user role:", userRole);
  console.log("✅ Allowed roles for this user:", allowedRoles);
  console.log("👥 Current user friends:", userFriends?.length || 0);
  console.log("🤝 Friend IDs:", Array.from(friendIds));

  const getAllowedUsers = () => {
    if (!Array.isArray(allUsers)) {
      console.log("⚠️ allUsers is not an array:", allUsers);
      return [];
    }

    console.log("🔍 Filtering users...");
    console.log("📋 All users count:", allUsers.length);
    console.log("🎯 Allowed roles:", allowedRoles);
    console.log("👥 User friends IDs:", Array.from(friendIds));

    const filtered = allUsers.filter((user) => {
      if (user._id === authUser?._id) {
        console.log(`❌ Filtered out: ${user.fullName} (current user)`);
        return false;
      }

      const isRoleAllowed = allowedRoles.includes(user.role);
      if (!isRoleAllowed) {
        console.log(
          `❌ Filtered out: ${user.fullName} (role: ${
            user.role
          } not in [${allowedRoles.join(", ")}])`
        );
        return false;
      }

      const isActive = user.isActive !== false;
      if (!isActive) {
        console.log(`❌ Filtered out: ${user.fullName} (inactive)`);
        return false;
      }

      const isAlreadyFriend = friendIds.has(user._id);
      if (isAlreadyFriend) {
        console.log(`❌ Filtered out: ${user.fullName} (already a friend)`);
        return false;
      }

      const hasPendingRequest = outgoingRequestsIds.has(user._id);
      if (hasPendingRequest) {
        console.log(`❌ Filtered out: ${user.fullName} (pending request)`);
        return false;
      }

      console.log(`✅ Allowed: ${user.fullName} (${user.role})`);
      return true;
    });

    console.log("✅ Allowed users count:", filtered.length);
    console.log(
      "👥 Allowed users:",
      filtered.map((u) => `${u.fullName} (${u.role})`)
    );

    return filtered;
  };

  const allowedUsers = getAllowedUsers();

  const getFilteredUsers = () => {
    let users = allowedUsers;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      users = users.filter(
        (user) =>
          user.fullName?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term) ||
          user.position?.toLowerCase().includes(term) ||
          user.department?.toLowerCase().includes(term)
      );
    }

    if (selectedRole !== "all") {
      users = users.filter((user) => user.role === selectedRole);
    }

    if (selectedDepartment !== "all") {
      users = users.filter((user) => user.department === selectedDepartment);
    }

    return users;
  };

  const filteredUsers = getFilteredUsers();

  const availableRoles = [...new Set(allowedUsers.map((user) => user.role))];

  const availableDepartments = [
    ...new Set(
      allowedUsers
        .map((user) => user.department)
        .filter((dept) => dept && dept.trim() !== "")
    ),
  ];

  const getPageTitle = () => {
    if (isAdmin) return "All Users";
    if (isEmployee) return "Network";
    if (isClient) return "Team Members";
    return "Network";
  };

  const getPageDescription = () => {
    if (isAdmin) return "Manage and connect with all users";
    if (isEmployee) return "Connect with colleagues and clients";
    if (isClient) return "Browse and connect with team members";
    return "Explore and connect with other users";
  };

  const formatRole = (role) => {
    const roles = {
      admin: "Admin",
      employee: "Employee",
      client: "Client",
      unassigned: "Unassigned",
    };
    return roles[role] || role;
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "admin":
        return "badge-error";
      case "employee":
        return "badge-primary";
      case "client":
        return "badge-secondary";
      default:
        return "badge-neutral";
    }
  };

  const isFriend = (userId) => {
    return friendIds.has(userId);
  };

  useEffect(() => {
    console.log("=== NETWORK PAGE DATA DEBUG ===");
    console.log("All users count:", allUsers.length);
    console.log("Friends from API:", userFriends?.length || 0);
    console.log("Friend IDs:", Array.from(friendIds));
    console.log("Outgoing request IDs:", Array.from(outgoingRequestsIds));

    const usersWhoShouldBeHidden = allUsers.filter(
      (user) => friendIds.has(user._id) || outgoingRequestsIds.has(user._id)
    );

    console.log("Users who should be hidden:", usersWhoShouldBeHidden.length);
    console.log(
      "Their names:",
      usersWhoShouldBeHidden.map((u) => u.fullName)
    );
  }, [allUsers, friendIds, outgoingRequestsIds, userFriends]);

  return (
    <div className="min-h-screen bg-base-200 py-4 px-3">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Link to="/" className="btn btn-ghost btn-sm">
                <ArrowLeftIcon className="size-3" />
              </Link>
              <div>
                <h1 className="text-lg font-bold">{getPageTitle()}</h1>
                <p className="text-xs opacity-70">{getPageDescription()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="badge badge-sm badge-primary">
                <UsersIcon className="size-3 mr-1" />
                <span className="text-xs">{filteredUsers.length}</span>
              </div>
              {userFriends?.length > 0 && (
                <div className="badge badge-sm badge-success">
                  <UsersIcon className="size-3 mr-1" />
                  <span className="text-xs">{userFriends.length} friends</span>
                </div>
              )}
            </div>
          </div>

          {/* FILTERS */}
          <div className="card bg-base-100 border border-base-300 shadow-sm mb-4">
            <div className="card-body p-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                {/* Search */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <SearchIcon className="size-4 text-base-content/50" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search name, email, position..."
                      className="input input-bordered input-sm w-full pl-8 text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute inset-y-0 right-0 pr-2 flex items-center"
                      >
                        <XIcon className="size-3 text-base-content/50" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Role Filter */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <UserIcon className="size-4 text-base-content/50" />
                    </div>
                    <select
                      className="select select-bordered select-sm w-full pl-8 text-sm"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                    >
                      <option value="all">All Roles</option>
                      {availableRoles.map((role) => (
                        <option key={role} value={role}>
                          {formatRole(role)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Department Filter */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <Building2Icon className="size-4 text-base-content/50" />
                    </div>
                    <select
                      className="select select-bordered select-sm w-full pl-8 text-sm"
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                    >
                      <option value="all">All Depts</option>
                      {availableDepartments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {(selectedRole !== "all" || selectedDepartment !== "all") && (
                <div className="mt-3 flex flex-wrap items-center gap-1 text-xs">
                  <span className="opacity-70">Filters:</span>
                  {selectedRole !== "all" && (
                    <div className="badge badge-outline badge-xs gap-0.5">
                      <UserIcon className="size-2.5" />
                      {formatRole(selectedRole)}
                      <button onClick={() => setSelectedRole("all")}>
                        <XIcon className="size-2.5" />
                      </button>
                    </div>
                  )}
                  {selectedDepartment !== "all" && (
                    <div className="badge badge-outline badge-xs gap-0.5">
                      <Building2Icon className="size-2.5" />
                      {selectedDepartment}
                      <button onClick={() => setSelectedDepartment("all")}>
                        <XIcon className="size-2.5" />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setSelectedRole("all");
                      setSelectedDepartment("all");
                    }}
                    className="text-primary text-xs hover:underline ml-1"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DEBUG INFO */}
        {error && (
          <div className="alert alert-error mb-4">
            <div className="text-xs">Error loading users: {error.message}</div>
          </div>
        )}

        {/* CONTENT */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <span className="loading loading-spinner loading-md text-primary"></span>
            <span className="ml-2 text-sm">Loading users...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-base-300 rounded-full flex items-center justify-center">
              <UsersIcon className="size-8 opacity-40" />
            </div>
            <h3 className="text-base font-semibold mb-2">No users found</h3>
            <p className="opacity-70 text-sm max-w-md mx-auto mb-4">
              {searchTerm ||
              selectedRole !== "all" ||
              selectedDepartment !== "all"
                ? "Try adjusting your search or filters"
                : "There are no users available to display"}
            </p>
            {(searchTerm ||
              selectedRole !== "all" ||
              selectedDepartment !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedRole("all");
                  setSelectedDepartment("all");
                }}
                className="btn btn-primary btn-sm"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredUsers.map((user) => {
              const hasRequestBeenSent = outgoingRequestsIds.has(user._id);
              const isAlreadyFriend = isFriend(user._id);
              const canMessage = isAlreadyFriend && user.isActive;

              return (
                <div
                  key={user._id}
                  className="card bg-base-100 border border-base-300 shadow-xs hover:shadow-sm transition-shadow"
                >
                  <div className="card-body p-3">
                    {/* User Header */}
                    <div className="flex items-start gap-2 mb-3">
                      {/* Avatar */}
                      <div className="avatar">
                        <div className="w-12 rounded-full ring-1 ring-primary ring-offset-base-100 ring-offset-1">
                          <img
                            src={user.profilePic || "/default-avatar.png"}
                            alt={user.fullName}
                            className="object-cover"
                          />
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm truncate">
                              {user.fullName}
                            </h3>
                            {user.position && (
                              <p className="text-primary font-medium text-xs flex items-center gap-1 mt-0.5">
                                <BriefcaseIcon className="size-3" />
                                <span className="truncate">
                                  {user.position}
                                </span>
                              </p>
                            )}
                          </div>

                          {/* Role Badge */}
                          <div
                            className={`badge badge-xs ${getRoleBadgeClass(
                              user.role
                            )} ml-1`}
                          >
                            <span className="text-[10px]">
                              {formatRole(user.role)}
                            </span>
                          </div>
                        </div>

                        {/* Department */}
                        {user.department && (
                          <div className="flex items-center gap-1 mt-1">
                            <Building2Icon className="size-2.5 opacity-70" />
                            <span className="text-xs opacity-80 truncate">
                              {user.department}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contact Info - Minimal */}
                    <div className="space-y-1.5 mb-3">
                      {user.email && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <MailIcon className="size-3 opacity-70 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Status & Info */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {user.isActive ? (
                        <div className="badge badge-success badge-xs gap-0.5">
                          <ShieldCheckIcon className="size-2.5" />
                          <span className="text-[10px]">Active</span>
                        </div>
                      ) : (
                        <div className="badge badge-error badge-xs gap-0.5">
                          <ShieldCheckIcon className="size-2.5" />
                          <span className="text-[10px]">Inactive</span>
                        </div>
                      )}

                      {user.isOnBoarded && (
                        <div className="badge badge-info badge-xs gap-0.5">
                          <CheckCircleIcon className="size-2.5" />
                          <span className="text-[10px]">Onboarded</span>
                        </div>
                      )}

                      {/* Friend Status Badge */}
                      {isAlreadyFriend && (
                        <div className="badge badge-success badge-xs gap-0.5">
                          <UsersIcon className="size-2.5" />
                          <span className="text-[10px]">DEBUG: Friend</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5 mt-2">
                      <Link
                        to={`/profile/${user._id}`}
                        className="btn btn-outline btn-xs flex-1"
                      >
                        <span className="text-xs">Profile</span>
                      </Link>

                      {isAlreadyFriend ? (
                        <div className="tooltip" data-tip="Already friends">
                          <button
                            className="btn btn-success btn-xs flex-1 gap-0.5"
                            disabled
                          >
                            <UsersIcon className="size-3" />
                            <span className="text-xs">Friends</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          className={`btn btn-xs flex-1 gap-0.5 ${
                            hasRequestBeenSent ? "btn-disabled" : "btn-primary"
                          }`}
                          onClick={() => sendRequestMutation(user._id)}
                          disabled={hasRequestBeenSent || isPending}
                        >
                          {hasRequestBeenSent ? (
                            <>
                              <UserPlusIcon className="size-3" />
                              <span className="text-xs">Requested</span>
                            </>
                          ) : (
                            <>
                              <UserPlusIcon className="size-3" />
                              <span className="text-xs">Connect</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Quick Message - Hanya tampil jika sudah berteman */}
                    {canMessage ? (
                      <Link
                        to={`/chat/${user._id}`}
                        className="btn btn-outline btn-xs btn-block mt-1.5 gap-0.5"
                      >
                        <MessageSquareIcon className="size-3" />
                        <span className="text-xs">Message</span>
                      </Link>
                    ) : (
                      <div
                        className="tooltip mt-1.5"
                        data-tip="Connect first to message"
                      >
                        <button
                          className="btn btn-outline btn-xs btn-block gap-0.5 opacity-50 cursor-not-allowed"
                          disabled
                        >
                          <MessageSquareIcon className="size-3" />
                          <span className="text-xs">Message</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* INFO FOOTER */}
        {filteredUsers.length > 0 && (
          <div className="mt-6 pt-4 border-t border-base-300">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="text-xs opacity-70">
                <p>
                  Showing{" "}
                  <span className="font-medium">{filteredUsers.length}</span> of{" "}
                  <span className="font-medium">{allowedUsers.length}</span>{" "}
                  users
                  {selectedRole !== "all" &&
                    ` (filtered by ${formatRole(selectedRole)})`}
                </p>
                {userFriends?.length > 0 && (
                  <p className="mt-1">
                    <span className="font-medium">{userFriends.length}</span>{" "}
                    connected friends
                  </p>
                )}
              </div>

              <div className="text-xs opacity-70 flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-error"></div>
                  <span>Admin</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span>Employee</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-secondary"></div>
                  <span>Client</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-success"></div>
                  <span>Friend</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkPage;
