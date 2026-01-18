import React from "react";
import { MessageSquare, Mail, Phone, MapPin, Briefcase } from "lucide-react";
import { Link } from "react-router";

const FriendCard = ({ friend, compact = false }) => {
  if (!friend) return null;

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const truncateText = (text, maxLength = 20) => {
    if (!text) return "";
    return text.length <= maxLength
      ? text
      : text.substring(0, maxLength) + "...";
  };

  // COMPACT VERSION untuk sidebar
  if (compact) {
    return (
      <div className="card bg-base-100 border border-base-300 rounded-lg shadow-xs hover:shadow-sm transition-all duration-150">
        <div className="card-body p-2.5">
          <div className="flex items-center gap-2.5">
            {/* Avatar */}
            <div className="relative">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-base-300">
                {friend.profilePic ? (
                  <img
                    src={friend.profilePic}
                    alt={friend.fullName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/default-avatar.png";
                      e.target.onerror = null;
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-primary text-primary-content flex items-center justify-center text-xs font-medium">
                    {getInitials(friend.fullName)}
                  </div>
                )}
              </div>
              {/* Online Status */}
              {friend.isActive && (
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-success rounded-full border border-base-100"></div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">
                {friend.fullName}
              </h4>
              {friend.position && (
                <p className="text-xs opacity-70 truncate mt-0.5">
                  {truncateText(friend.position, 16)}
                </p>
              )}
            </div>
          </div>

          {/* Quick Action */}
          <div className="mt-2 pt-2 border-t border-base-300">
            <Link
              to={`/chat/${friend._id}`}
              className="btn btn-sm btn-outline h-7 w-full gap-1.5"
            >
              <MessageSquare className="size-3" />
              <span className="text-xs">Message</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // FULL VERSION untuk Friends Page
  return (
    <div className="card bg-base-100 border border-base-300 rounded-lg shadow-xs hover:shadow-sm transition-all duration-150 h-full min-h-[260px]">
      <div className="card-body p-3 flex flex-col h-full">
        {/* ================= CONTENT ================= */}
        <div className="flex flex-col gap-3 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between min-h-[64px]">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full overflow-hidden bg-base-300">
                  {friend.profilePic ? (
                    <img
                      src={friend.profilePic}
                      alt={friend.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary text-primary-content flex items-center justify-center text-xs font-medium">
                      {getInitials(friend.fullName)}
                    </div>
                  )}
                </div>
                {friend.isActive && (
                  <div className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-success rounded-full border border-base-100"></div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0">
                <h3 className="font-semibold text-sm truncate">
                  {friend.fullName}
                </h3>
                <p className="text-xs opacity-70 truncate">
                  {friend.position || "-"}
                </p>

                <div className="flex items-center gap-1 mt-0.5">
                  <Briefcase className="size-3 opacity-50 shrink-0" />
                  <span className="text-xs opacity-70 truncate">
                    {friend.department || "-"}
                  </span>
                </div>
              </div>
            </div>

            <Link
              to={`/chat/${friend._id}`}
              className="btn btn-circle btn-sm btn-primary h-7 w-7 min-h-0 shrink-0"
            >
              <MessageSquare className="size-3" />
            </Link>
          </div>

          {/* Contact Info (height konsisten) */}
          <div className="space-y-1.5 text-xs min-h-[48px]">
            <div className="flex items-center gap-1.5">
              <Mail className="size-3 opacity-50 shrink-0" />
              <span className="truncate">{friend.email || "-"}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Phone className="size-3 opacity-50 shrink-0" />
              <span className="truncate">{friend.phoneNumber || "-"}</span>
            </div>
          </div>

          {/* Expertise (dibatasi tinggi) */}
          <div className="min-h-[40px] overflow-hidden">
            {friend.expertise && (
              <div className="flex flex-wrap gap-0.5">
                {friend.expertise
                  .split(",")
                  .slice(0, 3)
                  .map((skill, idx) => (
                    <span
                      key={idx}
                      className="badge badge-xs badge-outline h-5 px-1.5 text-[10px] truncate max-w-20"
                    >
                      {skill.trim()}
                    </span>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="pt-2 border-t border-base-300 mt-auto">
          <Link
            to={`/profile/${friend._id}`}
            className="btn btn-sm btn-outline h-7 px-2.5 w-full"
          >
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FriendCard;
