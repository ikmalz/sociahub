import React from "react";
import {
  MapPinIcon,
  MessageSquare,
  PhoneIcon,
  MailIcon,
  BriefcaseIcon,
  Building2Icon,
  StarIcon,
  UsersIcon,
  ChevronRightIcon,
} from "lucide-react";
import { Link } from "react-router";
import moment from "moment";

const getDepartmentIcon = (department) => {
  if (!department) return "🏢";
  const deptLower = department.toLowerCase();
  const icons = {
    "human resources": "👥", hr: "👥", finance: "💰", marketing: "📈",
    sales: "📊", it: "💻", technology: "💻", operations: "⚙️",
    "customer service": "💁", "r&d": "🔬", research: "🔬", procurement: "📦",
    logistics: "🚚", administration: "📋", legal: "⚖️", executive: "👔",
    engineering: "⚙️", quality: "✅", business: "💼", product: "📱",
    design: "🎨", support: "🛠️",
  };
  return icons[deptLower] || "🏢";
};

const FriendCard = ({ friend }) => {
  if (!friend) return null;

  const truncateText = (text, maxLength = 25) => {
    if (!text) return "";
    return text.length <= maxLength ? text : text.substring(0, maxLength) + "...";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return moment(dateString).format("MMM 'YY");
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="card bg-base-100 border border-base-300 shadow-xs hover:shadow-sm transition-all duration-200 hover:border-primary/30 rounded-lg overflow-hidden group">
      {/* Compact Header */}
      <div className="p-3 pb-2 border-b border-base-300">
        <div className="flex items-center gap-2">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full ring-1 ring-primary/10 overflow-hidden">
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
                <div className="w-full h-full bg-primary text-primary-content flex items-center justify-center font-medium text-sm">
                  {getInitials(friend.fullName)}
                </div>
              )}
            </div>
            {/* Online Status */}
            <div
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${
                friend.isActive ? "bg-success" : "bg-base-content/30"
              } rounded-full border border-base-100`}
            ></div>
          </div>

          {/* Name & Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                  {friend.fullName || "Unknown User"}
                </h3>
                {friend.position && (
                  <p className="text-xs text-base-content/70 truncate mt-0.5">
                    {friend.position}
                  </p>
                )}
              </div>
              
              {/* Quick Chat */}
              <Link
                to={`/chat/${friend._id}`}
                className="btn btn-circle btn-xs btn-primary flex-shrink-0"
                title="Chat"
              >
                <MessageSquare className="size-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Body */}
      <div className="p-3 pt-2">
        {/* Department & Contact */}
        <div className="space-y-1.5 mb-2">
          {/* Department */}
          {friend.department && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-xs opacity-70">{getDepartmentIcon(friend.department)}</span>
              <span className="text-xs font-medium truncate">{friend.department}</span>
            </div>
          )}

          {/* Email */}
          {friend.email && (
            <div className="flex items-center gap-1.5 text-xs">
              <MailIcon className="size-3 opacity-60 flex-shrink-0" />
              <a
                href={`mailto:${friend.email}`}
                className="truncate hover:text-primary transition-colors text-xs"
                title={friend.email}
              >
                {truncateText(friend.email.split('@')[0], 15)}
              </a>
            </div>
          )}

          {/* Location */}
          {friend.location && (
            <div className="flex items-center gap-1.5 text-xs">
              <MapPinIcon className="size-3 opacity-60 flex-shrink-0" />
              <span className="truncate" title={friend.location}>
                {truncateText(friend.location, 18)}
              </span>
            </div>
          )}
        </div>

        {/* Expertise Tags */}
        {friend.expertise && typeof friend.expertise === 'string' && (
          <div className="mb-2">
            <div className="flex flex-wrap gap-1 overflow-hidden">
              {friend.expertise
                .split(',')
                .slice(0, 2)
                .map((skill, idx) => (
                  <span
                    key={idx}
                    className="badge badge-xs bg-base-200 border-base-300 px-1.5 py-0.5 flex-shrink-0"
                    title={skill.trim()}
                  >
                    <span className="text-[10px] truncate max-w-[50px]">{skill.trim()}</span>
                  </span>
                ))}
              {friend.expertise.split(',').length > 2 && (
                <span className="badge badge-xs badge-ghost px-1.5 py-0.5">
                  <span className="text-[10px]">+{friend.expertise.split(',').length - 2}</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-base-300">
          <div className="flex items-center gap-1.5">
            <UsersIcon className="size-3 opacity-60" />
            <span className="font-medium">{friend.friends?.length || 0}</span>
          </div>
          
          <div className="text-xs opacity-70">
            {friend.createdAt ? formatDate(friend.createdAt) : 'New'}
          </div>
        </div>

        {/* View Profile Button */}
        <div className="mt-2">
          <Link
            to={`/profile/${friend._id}`}
            className="btn btn-outline btn-xs btn-block group-hover:btn-primary transition-colors gap-1.5 py-1.5"
          >
            <span className="text-xs">Profile</span>
            <ChevronRightIcon className="size-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FriendCard;