import React, { useMemo } from "react";
import { useParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  MapPinIcon,
  MailIcon,
  PhoneIcon,
  BriefcaseIcon,
  ArrowLeftIcon,
  UsersIcon,
  Building2Icon,
  UserCogIcon,
  TargetIcon,
  ShieldCheckIcon,
  CalendarIcon,
  MessageSquareIcon,
  BookOpenIcon,
  StarIcon,
  BadgeCheckIcon,
  AwardIcon,
  UserIcon,
} from "lucide-react";
import { getUserById, getUserFriends } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";

const UserProfilePage = () => {
  const { userId } = useParams();
  const { authUser } = useAuthUser();

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });

  const { data: userFriends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends", authUser?._id],
    queryFn: getUserFriends,
    enabled: !!authUser,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const isCurrentUser = useMemo(() => {
    return authUser?._id === user?._id;
  }, [authUser, user]);

  const isFriend = useMemo(() => {
    if (!authUser || !user || !userFriends || userFriends.length === 0) {
      return false;
    }

    return userFriends.some((friend) => {
      if (!friend || !friend._id) return false;
      return friend._id === user._id;
    });
  }, [authUser, user, userFriends]);

  const canMessage = useMemo(() => {
    if (!authUser || !user) return false;
    if (authUser._id === user._id) return false;
    if (!isFriend) return false;
    if (user.isActive === false) return false;
    return true;
  }, [authUser, user, isFriend]);

  const formatRole = (role) => {
    const roles = {
      admin: "Administrator",
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

  const hasField = (field) => {
    if (!user || !user[field]) return false;
    const value = user[field];
    return (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      (!Array.isArray(value) || value.length > 0)
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="text-center py-20 px-4">
        <div className="alert alert-error max-w-md mx-auto">
          <p className="font-semibold">User not found</p>
        </div>
        <Link to="/friends" className="btn btn-primary btn-sm mt-6 gap-1.5">
          <ArrowLeftIcon className="size-3.5" />
          Back to Friends
        </Link>
      </div>
    );
  }

  const userRole = user?.role || "unassigned";
  const isEmployee = userRole === "employee";
  const isClient = userRole === "client";

  // Contact info items
  const contactItems = [
    hasField("email") && {
      icon: <MailIcon className="size-3.5 text-primary" />,
      label: "Email",
      value: user.email,
      color: "primary",
    },
    hasField("phoneNumber") && {
      icon: <PhoneIcon className="size-3.5 text-secondary" />,
      label: "Phone",
      value: user.phoneNumber,
      color: "secondary",
    },
    hasField("location") && {
      icon: <MapPinIcon className="size-3.5 text-accent" />,
      label: "Location",
      value: user.location,
      color: "accent",
    },
    {
      icon: <UsersIcon className="size-3.5 text-info" />,
      label: "Connections",
      value: user.friends?.length || 0,
      color: "info",
    },
    hasField("companyName") && {
      icon: <Building2Icon className="size-3.5 text-warning" />,
      label: "Company",
      value: user.companyName,
      color: "warning",
    },
    user.createdAt && {
      icon: <CalendarIcon className="size-3.5 text-neutral" />,
      label: "Member Since",
      value: formatDate(user.createdAt),
      color: "neutral",
    },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-base-200 py-3 sm:py-4 px-2 sm:px-4">
      <div className="max-w-6xl mx-auto">
        {/* HEADER SECTION */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3">
            <Link
              to="/friends"
              className="btn btn-ghost btn-sm hover:bg-base-300 gap-1.5"
            >
              <ArrowLeftIcon className="size-3.5" />
              <span className="text-xs font-medium">Back</span>
            </Link>

            <div className="flex items-center gap-2">
              {isCurrentUser && (
                <span className="badge badge-outline badge-sm px-2">
                  <span className="text-xs font-medium">Your Profile</span>
                </span>
              )}
              {isFriend && !isCurrentUser && (
                <span className="badge badge-success badge-sm gap-1 px-2">
                  <UsersIcon className="size-2.5" />
                  <span className="text-xs font-medium">Friend</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-base-content mb-1">
                {user.fullName}
              </h1>
              {hasField("position") && (
                <p className="flex items-center gap-1.5 text-primary font-medium text-sm">
                  <BriefcaseIcon className="size-3.5" />
                  <span>{user.position}</span>
                </p>
              )}
            </div>

            <div className="flex gap-2">
              {loadingFriends ? (
                <button className="btn btn-outline btn-sm gap-1.5" disabled>
                  <span className="loading loading-spinner loading-xs"></span>
                  <span className="text-xs">Checking...</span>
                </button>
              ) : canMessage ? (
                <Link
                  to={`/chat/${user._id}`}
                  className="btn btn-primary btn-sm gap-1.5 min-w-[100px]"
                >
                  <MessageSquareIcon className="size-3.5" />
                  <span className="text-xs font-medium">Message</span>
                </Link>
              ) : !isCurrentUser && !isFriend ? (
                <div className="tooltip" data-tip="Connect first to message">
                  <button
                    className="btn btn-outline btn-sm gap-1.5 opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <MessageSquareIcon className="size-3.5" />
                    <span className="text-xs font-medium">Message</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* LEFT COLUMN - Main Profile */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {/* PROFILE CARD */}
            <div className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body p-3 sm:p-4 md:p-5">
                <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                  {/* AVATAR SECTION */}
                  <div className="flex flex-col items-center sm:items-start">
                    <div className="avatar">
                      <div className="w-24 sm:w-28 md:w-32 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-base-100">
                        <img
                          src={user.profilePic || "/default-avatar.png"}
                          alt={user.fullName}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </div>

                    {/* STATUS BADGES */}
                    <div className="mt-3 flex flex-wrap gap-1.5 justify-center sm:justify-start">
                      <div
                        className={`badge badge-sm ${getRoleBadgeClass(
                          userRole
                        )} px-2`}
                      >
                        <span className="text-xs font-medium">
                          {formatRole(userRole)}
                        </span>
                      </div>

                      <div
                        className={`badge badge-sm ${
                          user.isActive
                            ? "badge-success"
                            : "badge-error"
                        } px-2`}
                      >
                        <ShieldCheckIcon className="size-2.5" />
                        <span className="text-xs font-medium ml-0.5">
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* USER INFO */}
                  <div className="flex-1 space-y-3 md:space-y-4">
                    {/* Department */}
                    {hasField("department") && (
                      <div className="flex items-center gap-2">
                        <Building2Icon className="size-4 text-base-content/60" />
                        <span className="badge badge-outline badge-sm px-2">
                          <span className="text-xs font-medium">
                            {user.department}
                          </span>
                        </span>
                      </div>
                    )}

                    {/* Bio */}
                    {hasField("bio") && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <UserIcon className="size-4 text-base-content/70" />
                          <h3 className="text-sm font-semibold">About</h3>
                        </div>
                        <p className="text-base-content/80 text-sm leading-relaxed">
                          {user.bio}
                        </p>
                      </div>
                    )}

                    {/* Expertise */}
                    {hasField("expertise") && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <AwardIcon className="size-4 text-warning" />
                          <h3 className="text-sm font-semibold">Expertise</h3>
                        </div>
                        <p className="text-primary font-medium text-sm">
                          {user.expertise}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* CONTACT INFO GRID */}
                {contactItems.length > 0 && (
                  <>
                    <div className="divider my-3 sm:my-4"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                      {contactItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2.5 bg-base-200 p-2.5 sm:p-3 rounded-lg"
                        >
                          <div
                            className={`p-1.5 rounded-lg bg-${item.color}/10`}
                          >
                            {item.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-base-content/60 mb-0.5">
                              {item.label}
                            </p>
                            <p className="text-sm font-medium truncate">
                              {item.value}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* SKILLS SECTION */}
            {hasField("skills") && (
              <div className="card bg-base-100 border border-base-300 shadow-sm">
                <div className="card-body p-3 sm:p-4">
                  <div className="flex items-center gap-1.5 mb-3">
                    <StarIcon className="size-4 text-warning" />
                    <h3 className="text-sm font-semibold">Skills</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {user.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="badge badge-sm badge-primary badge-outline hover:badge-primary hover:text-primary-content transition-colors px-2.5 py-1.5"
                      >
                        <span className="text-xs font-medium">{skill}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* INSTITUTION INFO - For Clients */}
            {isClient &&
              (hasField("institutionName") ||
                hasField("institutionType") ||
                hasField("governmentLevel") ||
                hasField("projectInterests")) && (
                <div className="card bg-base-100 border border-base-300 shadow-sm">
                  <div className="card-body p-3 sm:p-4">
                    <div className="flex items-center gap-1.5 mb-3">
                      <Building2Icon className="size-4 text-secondary" />
                      <h3 className="text-sm font-semibold">
                        Institution Details
                      </h3>
                    </div>
                    <div className="space-y-2.5">
                      {hasField("institutionName") && (
                        <div>
                          <p className="text-xs text-base-content/60 mb-1">
                            Institution Name
                          </p>
                          <p className="text-sm bg-base-200 p-2.5 rounded-lg">
                            {user.institutionName}
                          </p>
                        </div>
                      )}
                      {hasField("institutionType") && (
                        <div>
                          <p className="text-xs text-base-content/60 mb-1">
                            Institution Type
                          </p>
                          <p className="text-sm bg-base-200 p-2.5 rounded-lg">
                            {user.institutionType}
                          </p>
                        </div>
                      )}
                      {hasField("governmentLevel") && (
                        <div>
                          <p className="text-xs text-base-content/60 mb-1">
                            Government Level
                          </p>
                          <p className="text-sm bg-base-200 p-2.5 rounded-lg">
                            {user.governmentLevel}
                          </p>
                        </div>
                      )}
                      {hasField("projectInterests") && (
                        <div>
                          <p className="text-xs text-base-content/60 mb-1">
                            Project Interests
                          </p>
                          <p className="text-sm bg-base-200 p-2.5 rounded-lg">
                            {user.projectInterests}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            {/* EMPLOYEE INFO */}
            {isEmployee &&
              (hasField("employeeId") ||
                hasField("employmentType") ||
                hasField("approvalStatus")) && (
                <div className="card bg-base-100 border border-base-300 shadow-sm">
                  <div className="card-body p-3 sm:p-4">
                    <div className="flex items-center gap-1.5 mb-3">
                      <UserCogIcon className="size-4 text-primary" />
                      <h3 className="text-sm font-semibold">
                        Employment Details
                      </h3>
                    </div>
                    <div className="space-y-2.5">
                      {hasField("employeeId") && (
                        <div>
                          <p className="text-xs text-base-content/60 mb-1">
                            Employee ID
                          </p>
                          <div className="text-sm bg-base-200 p-2.5 rounded-lg font-mono">
                            {user.employeeId}
                          </div>
                        </div>
                      )}
                      {hasField("employmentType") && (
                        <div>
                          <p className="text-xs text-base-content/60 mb-1">
                            Employment Type
                          </p>
                          <div className="text-sm bg-base-200 p-2.5 rounded-lg">
                            <span className="capitalize">
                              {user.employmentType}
                            </span>
                          </div>
                        </div>
                      )}
                      {hasField("approvalStatus") &&
                        user.approvalStatus !== "pending" && (
                          <div>
                            <p className="text-xs text-base-content/60 mb-1">
                              Approval Status
                            </p>
                            <div
                              className={`text-sm p-2.5 rounded-lg ${
                                user.approvalStatus === "approved"
                                  ? "bg-success/10 border border-success/20"
                                  : user.approvalStatus === "rejected"
                                  ? "bg-error/10 border border-error/20"
                                  : "bg-warning/10 border border-warning/20"
                              }`}
                            >
                              <span
                                className={`badge badge-sm ${
                                  user.approvalStatus === "approved"
                                    ? "badge-success"
                                    : user.approvalStatus === "rejected"
                                    ? "badge-error"
                                    : "badge-warning"
                                }`}
                              >
                                {user.approvalStatus.charAt(0).toUpperCase() +
                                  user.approvalStatus.slice(1)}
                              </span>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* RIGHT COLUMN - Sidebar */}
          <div className="space-y-3 sm:space-y-4">
            {/* QUICK ACTIONS */}
            <div className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body p-3 sm:p-4">
                <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  {loadingFriends ? (
                    <button
                      className="btn btn-outline btn-sm btn-block gap-1.5"
                      disabled
                    >
                      <span className="loading loading-spinner loading-xs"></span>
                      <span className="text-xs">Loading...</span>
                    </button>
                  ) : canMessage ? (
                    <Link
                      to={`/chat/${user._id}`}
                      className="btn btn-primary btn-sm btn-block gap-1.5"
                    >
                      <MessageSquareIcon className="size-3.5" />
                      <span className="text-xs font-medium">Send Message</span>
                    </Link>
                  ) : !isCurrentUser && !isFriend ? (
                    <div
                      className="tooltip"
                      data-tip="Connect first to send messages"
                    >
                      <button
                        className="btn btn-outline btn-sm btn-block gap-1.5 opacity-50 cursor-not-allowed"
                        disabled
                      >
                        <MessageSquareIcon className="size-3.5" />
                        <span className="text-xs font-medium">Send Message</span>
                      </button>
                    </div>
                  ) : null}

                  {isEmployee &&
                    hasField("expertise") &&
                    !isCurrentUser && (
                      <button className="btn btn-outline btn-secondary btn-sm btn-block gap-1.5">
                        <BookOpenIcon className="size-3.5" />
                        <span className="text-xs font-medium">
                          View Portfolio
                        </span>
                      </button>
                    )}

                  {isClient && !isCurrentUser && (
                    <button className="btn btn-outline btn-secondary btn-sm btn-block gap-1.5">
                      <TargetIcon className="size-3.5" />
                      <span className="text-xs font-medium">View Projects</span>
                    </button>
                  )}

                  {isCurrentUser && (
                    <Link
                      to="/profile"
                      className="btn btn-primary btn-sm btn-block gap-1.5"
                    >
                      <UserIcon className="size-3.5" />
                      <span className="text-xs font-medium">Edit Profile</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* ACCOUNT INFO */}
            <div className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body p-3 sm:p-4">
                <h3 className="text-sm font-semibold mb-3">Account Info</h3>
                <div className="space-y-2.5 text-sm">
                  {hasField("employeeId") && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-base-content/70">Employee ID:</span>
                      <span className="font-medium">{user.employeeId}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-1">
                    <span className="text-base-content/70">Role:</span>
                    <span
                      className={`badge badge-xs ${getRoleBadgeClass(
                        userRole
                      )} px-2`}
                    >
                      <span className="text-xs font-medium">
                        {formatRole(userRole)}
                      </span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-base-content/70">Status:</span>
                    <span
                      className={`badge badge-xs ${
                        user.isActive ? "badge-success" : "badge-error"
                      } px-2`}
                    >
                      <span className="text-xs font-medium">
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </span>
                  </div>

                  {isFriend && !isCurrentUser && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-base-content/70">Connection:</span>
                      <span className="badge badge-xs badge-success gap-1 px-2">
                        <UsersIcon className="size-2.5" />
                        <span className="text-xs font-medium">Friend</span>
                      </span>
                    </div>
                  )}

                  {user.isOnBoarded && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-base-content/70">Onboarded:</span>
                      <span className="badge badge-xs badge-info gap-1 px-2">
                        <BadgeCheckIcon className="size-2.5" />
                        <span className="text-xs font-medium">Yes</span>
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-1">
                    <span className="text-base-content/70">Joined:</span>
                    <span className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="pt-2.5 border-t border-base-300">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-base-content/70">Connections:</span>
                      <span className="font-medium text-base">
                        {user.friends?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;