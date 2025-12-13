import React from "react";
import { MapPinIcon, MessageSquare, PhoneIcon, MailIcon, BriefcaseIcon, UserIcon } from "lucide-react";
import { Link } from "react-router";

// Fungsi bantu untuk ikon departemen
const getDepartmentIcon = (department) => {
  if (!department) return '👤';
  const deptLower = department.toLowerCase();
  const icons = {
    'human resources': '👥', 'hr': '👥', 'finance': '💰', 'marketing': '📈',
    'sales': '📊', 'it': '💻', 'technology': '💻', 'operations': '⚙️',
    'customer service': '💁', 'r&d': '🔬', 'research': '🔬', 'procurement': '📦',
    'logistics': '🚚', 'administration': '📋', 'legal': '⚖️', 'executive': '👔',
    'engineering': '⚙️', 'quality': '✅', 'business': '💼', 'product': '📱',
  };
  return icons[deptLower] || '👤';
};

// Fungsi untuk format position badge color
const getPositionColor = (position) => {
  if (!position) return 'badge-outline';
  const posLower = position.toLowerCase();
  if (posLower.includes('manager') || posLower.includes('director') || posLower.includes('vp') || posLower.includes('ceo')) {
    return 'badge-primary';
  } else if (posLower.includes('senior') || posLower.includes('lead')) {
    return 'badge-secondary';
  } else if (posLower.includes('junior') || posLower.includes('associate')) {
    return 'badge-accent';
  }
  return 'badge-outline';
};

const FriendCard = ({ friend }) => {
  if (!friend) return null;

  const truncateText = (text, maxLength = 40) => {
    if (!text) return '';
    return text.length <= maxLength ? text : text.substring(0, maxLength) + '...';
  };

  return (
    <div className="card bg-base-100 border border-base-300 shadow-xs hover:shadow-sm transition-all duration-200 hover:border-primary/20 rounded-lg overflow-hidden group">
      <div className="card-body p-3">
        {/* HEADER - Avatar, Name, Position */}
        <div className="flex items-center gap-2 mb-2">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-full ring-1 ring-primary/10 overflow-hidden">
              <img 
                src={friend.profilePic || "/default-avatar.png"} 
                alt={friend.fullName}
                className="w-full h-full object-cover"
                onError={(e) => e.target.src = "/default-avatar.png"}
              />
            </div>
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-success rounded-full border border-base-100"></div>
          </div>

          {/* Name & Position */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <div className="min-w-0">
                <h3 className="font-semibold text-sm truncate text-base-content">
                  {friend.fullName || "Unknown User"}
                </h3>
                {friend.position && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <BriefcaseIcon className="size-2.5 text-base-content/50" />
                    <span className="text-xs text-primary font-medium truncate max-w-[100px]">
                      {friend.position}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Department Icon */}
              {friend.department && (
                <span className="text-sm" title={friend.department}>
                  {getDepartmentIcon(friend.department)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* CONTACT INFO ROW - Horizontal/Sejajar ke samping */}
        {(friend.location || friend.phoneNumber || friend.email) && (
          <div className="flex flex-wrap gap-2 mb-2">
            {/* Location */}
            {friend.location && (
              <div className="flex items-center gap-1 bg-base-200 px-2 py-1 rounded-md" title={friend.location}>
                <MapPinIcon className="size-2.5 text-base-content/60" />
                <span className="text-xs text-base-content/80 truncate max-w-[60px]">
                  {truncateText(friend.location, 15)}
                </span>
              </div>
            )}

            {/* Phone Number */}
            {friend.phoneNumber && (
              <div className="flex items-center gap-1 bg-base-200 px-2 py-1 rounded-md" title={friend.phoneNumber}>
                <PhoneIcon className="size-2.5 text-base-content/60" />
                <a 
                  href={`tel:${friend.phoneNumber}`}
                  className="text-xs text-base-content/80 hover:text-primary truncate max-w-[70px]"
                >
                  {truncateText(friend.phoneNumber.replace(/\D/g, '').replace(/^62/, '0'), 12)}
                </a>
              </div>
            )}

            {/* Email */}
            {friend.email && (
              <div className="flex items-center gap-1 bg-base-200 px-2 py-1 rounded-md" title={friend.email}>
                <MailIcon className="size-2.5 text-base-content/60" />
                <span className="text-xs text-base-content/80 truncate max-w-[70px]">
                  {truncateText(friend.email.split('@')[0], 12)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* DEPARTMENT & EMPLOYEE ID ROW */}
        <div className="flex items-center justify-between mb-2">
          {/* Department Badge */}
          {friend.department && (
            <span className="badge badge-sm badge-outline bg-base-200 border-base-300 px-2 py-0.5">
              <span className="text-xs truncate max-w-[80px]">{friend.department}</span>
            </span>
          )}
        </div>

        {/* BIO/EXPERTISE - Single Line */}
        {(friend.bio || friend.expertise) && (
          <div className="mb-2">
            <p className="text-xs text-base-content/70 truncate leading-tight" 
               title={friend.bio || friend.expertise}>
              {truncateText(friend.bio || friend.expertise, 60)}
            </p>
          </div>
        )}

        {/* SKILLS TAGS - Single Row Horizontal */}
        {friend.expertise && typeof friend.expertise === 'string' && (
          <div className="mb-2 flex flex-wrap gap-1 overflow-hidden">
            {friend.expertise.split(',').slice(0, 3).map((skill, idx) => (
              <span 
                key={idx} 
                className="badge badge-xs badge-outline bg-base-200 border-base-300 px-1.5 py-0.5 flex-shrink-0"
                title={skill.trim()}
              >
                <span className="truncate max-w-[50px] text-[10px]">{skill.trim()}</span>
              </span>
            ))}
            {friend.expertise.split(',').length > 3 && (
              <span className="badge badge-xs badge-ghost px-1.5 py-0.5 text-[10px] flex-shrink-0">
                +{friend.expertise.split(',').length - 3}
              </span>
            )}
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex gap-1.5 mt-1">
          <Link 
            to={`/chat/${friend._id}`} 
            className="btn btn-primary btn-xs flex-1 gap-1 py-1.5 h-auto"
          >
            <MessageSquare className="size-3" />
            <span className="text-xs">Chat</span>
          </Link>
          
          <Link 
            to={`/profile/${friend._id}`} 
            className="btn btn-outline btn-xs btn-square py-1.5 h-auto"
            title="View Profile"
          >
            <UserIcon className="size-3" />
          </Link>
        </div>

        {/* STATUS FOOTER - Minimal */}
        <div className="mt-2 pt-1 border-t border-base-300">
          <div className="flex items-center justify-between text-[10px] text-base-content/60">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
              <span>Online</span>
            </div>
            <span className="text-[10px] opacity-70">
              {friend.friends?.length || 0} conn
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendCard;