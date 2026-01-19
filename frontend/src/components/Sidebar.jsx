import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";
import {
  BellIcon,
  HomeIcon,
  ShipWheelIcon,
  UserIcon,
  FileTextIcon,
  ListIcon,
  ShieldIcon,
  BarChart3Icon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";

import useAuthUser from "../hooks/useAuthUser";
import useNotificationCount from "../hooks/useNotificationCount";

const Sidebar = ({ onClose }) => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;
  const notificationCount = Number(useNotificationCount() || 0);

  const sidebarRef = useRef(null);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const isAdminPage = currentPath.startsWith("/admin");

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    if (sidebarRef.current && !isMobile) {
      sidebarRef.current.style.overflowY = "auto";
      sidebarRef.current.style.height = "100vh";
      sidebarRef.current.style.position = "sticky";
      sidebarRef.current.style.top = "0";
    }

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, [isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      onClose?.();
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const handleLinkClick = () => {
    if (isMobile) {
      onClose?.();
    }
  };

  return (
    <>
      {/* Sidebar Container */}
      <aside
        ref={sidebarRef}
        className={`
          bg-base-200 border-r border-base-300
          flex flex-col
          transition-all duration-300 ease-in-out
          ${isMobile ? "w-64" : isCollapsed ? "w-20" : "w-64"}
          ${isMobile ? "shadow-2xl" : ""}
          z-50
          h-screen
          ${!isMobile ? "sticky top-0" : ""}
        `}
        style={{
          overflowY: "auto",
          scrollbarWidth: "thin",
          msOverflowStyle: "none",
        }}
      >
        {/* Style scrollbar */}
        <style>
          {`
            aside::-webkit-scrollbar {
              width: 4px;
            }
            aside::-webkit-scrollbar-track {
              background: transparent;
            }
            aside::-webkit-scrollbar-thumb {
              background: #888;
              border-radius: 2px;
            }
            aside::-webkit-scrollbar-thumb:hover {
              background: #555;
            }
          `}
        </style>

        {/* Mobile Close Button */}
        {isMobile && (
          <div className="p-4 border-b border-base-300 flex justify-end sticky top-0 bg-base-200 z-10">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-base-300 transition-colors"
            >
              <XIcon className="size-6" />
            </button>
          </div>
        )}

        {/* Header - LOGO */}
        <div className="p-5 border-b border-base-300 flex-none min-h-[80px] flex items-center justify-center sticky top-0 bg-base-200 z-10">
          <Link
            to={isAdminPage ? "/admin" : "/"}
            onClick={handleLinkClick}
            className={`
              flex items-center
              hover:opacity-80 transition-opacity
              ${isCollapsed && !isMobile ? "justify-center w-full" : "gap-2.5"}
            `}
          >
            <ShipWheelIcon className="size-9 text-primary flex-shrink-0" />
            {(!isCollapsed || isMobile) && (
              <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-secondary to-secondary tracking-wider">
                Sociahub
              </span>
            )}
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1">
          {/* Home */}
          <Link
            to={isAdminPage ? "/admin" : "/"}
            onClick={handleLinkClick}
            title="Home"
            className={`
              flex items-center w-full gap-3 px-3 py-3 rounded-lg
              transition-all duration-200
              hover:bg-base-300 active:scale-[0.98]
              ${
                currentPath === "/" || currentPath === "/admin"
                  ? "bg-base-300"
                  : ""
              }
              ${isCollapsed && !isMobile ? "justify-center px-0" : ""}
            `}
          >
            <div
              className={`flex items-center ${
                isCollapsed && !isMobile ? "justify-center w-full" : "gap-3"
              }`}
            >
              <HomeIcon className="size-5 opacity-70 flex-shrink-0" />
              {(!isCollapsed || isMobile) && (
                <span className="transition-all duration-200">Home</span>
              )}
            </div>
          </Link>

          {/* Friends */}
          <Link
            to="/friends"
            onClick={handleLinkClick}
            title="Friends"
            className={`
              flex items-center w-full gap-3 px-3 py-3 rounded-lg
              transition-all duration-200
              hover:bg-base-300 active:scale-[0.98]
              ${currentPath === "/friends" ? "bg-base-300" : ""}
              ${isCollapsed && !isMobile ? "justify-center px-0" : ""}
            `}
          >
            <div
              className={`flex items-center ${
                isCollapsed && !isMobile ? "justify-center w-full" : "gap-3"
              }`}
            >
              <UserIcon className="size-5 opacity-70 flex-shrink-0" />
              {(!isCollapsed || isMobile) && (
                <span className="transition-all duration-200">Friends</span>
              )}
            </div>
          </Link>

          {/* My Posts */}
          <Link
            to="/my-posts"
            onClick={handleLinkClick}
            title="My Posts"
            className={`
              flex items-center w-full gap-3 px-3 py-3 rounded-lg
              transition-all duration-200
              hover:bg-base-300 active:scale-[0.98]
              ${currentPath === "/my-posts" ? "bg-base-300" : ""}
              ${isCollapsed && !isMobile ? "justify-center px-0" : ""}
            `}
          >
            <div
              className={`flex items-center ${
                isCollapsed && !isMobile ? "justify-center w-full" : "gap-3"
              }`}
            >
              <FileTextIcon className="size-5 opacity-70 flex-shrink-0" />
              {(!isCollapsed || isMobile) && (
                <span className="transition-all duration-200">My Posts</span>
              )}
            </div>
          </Link>

          {/* View All Posts */}
          <Link
            to="/posts"
            onClick={handleLinkClick}
            title="View All Posts"
            className={`
              flex items-center w-full gap-3 px-3 py-3 rounded-lg
              transition-all duration-200
              hover:bg-base-300 active:scale-[0.98]
              ${currentPath === "/posts" ? "bg-base-300" : ""}
              ${isCollapsed && !isMobile ? "justify-center px-0" : ""}
            `}
          >
            <div
              className={`flex items-center ${
                isCollapsed && !isMobile ? "justify-center w-full" : "gap-3"
              }`}
            >
              <ListIcon className="size-5 opacity-70 flex-shrink-0" />
              {(!isCollapsed || isMobile) && (
                <span className="transition-all duration-200">View All</span>
              )}
            </div>
          </Link>

          {/* Notifications */}
          <Link
            to="/notifications"
            onClick={handleLinkClick}
            title="Notifications"
            className={`
              flex items-center w-full gap-3 px-3 py-3 rounded-lg
              transition-all duration-200
              hover:bg-base-300 active:scale-[0.98]
              ${currentPath === "/notifications" ? "bg-base-300" : ""}
              ${isCollapsed && !isMobile ? "justify-center px-0" : ""}
            `}
          >
            <div
              className={`flex items-center ${
                isCollapsed && !isMobile
                  ? "justify-center w-full relative"
                  : "gap-3"
              }`}
            >
              <div className="relative">
                <BellIcon className="size-5 opacity-70" />
                {notificationCount > 0 && (
                  <span className="badge badge-error badge-xs absolute -top-1.5 -right-2">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </div>
              {(!isCollapsed || isMobile) && (
                <div className="flex items-center gap-2">
                  <span className="transition-all duration-200">
                    Notifications
                  </span>
                </div>
              )}
            </div>
          </Link>

          {/* Admin Menu */}
          {authUser?.role === "admin" && (
            <div className="mt-4 pt-4 border-t border-base-300 space-y-1">
              {(!isCollapsed || isMobile) && (
                <p className="px-3 mb-2 text-xs font-semibold uppercase opacity-50">
                  Admin Panel
                </p>
              )}

              {/* User Approval */}
              <Link
                to="/admin/users"
                onClick={handleLinkClick}
                title="User Approval"
                className={`
                  flex items-center w-full gap-3 px-3 py-3 rounded-lg
                  transition-all duration-200
                  hover:bg-base-300 active:scale-[0.98]
                  ${currentPath.startsWith("/admin/users") ? "bg-base-300" : ""}
                  ${isCollapsed && !isMobile ? "justify-center px-0" : ""}
                `}
              >
                <div
                  className={`flex items-center ${
                    isCollapsed && !isMobile ? "justify-center w-full" : "gap-3"
                  }`}
                >
                  <ShieldIcon className="size-5 opacity-70" />
                  {(!isCollapsed || isMobile) && (
                    <span className="transition-all duration-200">
                      User Approval
                    </span>
                  )}
                </div>
              </Link>

              {/* Progress Dashboard */}
              <Link
                to="/admin/progress"
                onClick={handleLinkClick}
                title="Progress Dashboard"
                className={`
                  flex items-center w-full gap-3 px-3 py-3 rounded-lg
                  transition-all duration-200
                  hover:bg-base-300 active:scale-[0.98]
                  ${
                    currentPath.startsWith("/admin/progress")
                      ? "bg-base-300"
                      : ""
                  }
                  ${isCollapsed && !isMobile ? "justify-center px-0" : ""}
                `}
              >
                <div
                  className={`flex items-center ${
                    isCollapsed && !isMobile ? "justify-center w-full" : "gap-3"
                  }`}
                >
                  <BarChart3Icon className="size-5 opacity-70" />
                  {(!isCollapsed || isMobile) && (
                    <span className="transition-all duration-200">
                      Progress Dashboard
                    </span>
                  )}
                </div>
              </Link>

              {/* Assign Employee */}
              <Link
                to="/admin/assign-employee"
                onClick={handleLinkClick}
                title="Assign Employee"
                className={`
                  flex items-center w-full gap-3 px-3 py-3 rounded-lg
                  transition-all duration-200
                  hover:bg-base-300 active:scale-[0.98]
                  ${
                    currentPath.startsWith("/admin/assign-employee")
                      ? "bg-base-300"
                      : ""
                  }
                  ${isCollapsed && !isMobile ? "justify-center px-0" : ""}
                `}
              >
                <div
                  className={`flex items-center ${
                    isCollapsed && !isMobile ? "justify-center w-full" : "gap-3"
                  }`}
                >
                  <UserIcon className="size-5 opacity-70" />
                  {(!isCollapsed || isMobile) && (
                    <span className="transition-all duration-200">
                      Assign Employee
                    </span>
                  )}
                </div>
              </Link>
            </div>
          )}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-base-300 p-4 mt-auto sticky bottom-0 bg-base-200">
          <div
            className={`flex items-center ${
              isCollapsed && !isMobile ? "justify-center" : "gap-3"
            }`}
          >
            <div className="avatar flex-shrink-0">
              <div className="w-10 h-10 rounded-full">
                {authUser?.profilePic ? (
                  <img
                    src={authUser.profilePic}
                    alt="User Avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full bg-base-300 rounded-full flex items-center justify-center">
                    <UserIcon className="size-5 opacity-50" />
                  </div>
                )}
              </div>
            </div>

            {(!isCollapsed || isMobile) && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {authUser?.fullName || "User"}
                </p>
                <p className="text-xs flex items-center gap-1">
                  <span
                    className={`size-2 rounded-full flex-shrink-0 ${
                      isAdminPage ? "bg-error" : "bg-success"
                    }`}
                  />
                  <span className={isAdminPage ? "text-error" : "text-success"}>
                    {isAdminPage ? "Admin" : "Online"}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Desktop Toggle Button - DI LUAR SIDEBAR */}
      {!isMobile && (
        <button
          onClick={toggleSidebar}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`
            fixed
            top-1/2 -translate-y-1/2
            ${isCollapsed ? "left-20" : "left-64"}
            z-40
            flex items-center justify-center
            w-8 h-8
            rounded-full
            bg-base-200
            border border-base-300
            shadow-md
            hover:bg-base-300
            transition-all duration-300
            hover:scale-110
            transform -translate-y-1/2
            hidden md:flex
          `}
          style={{
            transition: "left 0.3s ease-in-out",
            marginLeft: "1px",
          }}
        >
          {isCollapsed ? (
            <ChevronRightIcon className="size-4" />
          ) : (
            <ChevronLeftIcon className="size-4" />
          )}
        </button>
      )}
    </>
  );
};

export default Sidebar;
