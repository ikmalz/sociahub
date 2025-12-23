import React, { useState } from "react";
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
  MenuIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";

import useAuthUser from "../hooks/useAuthUser";
import useNotificationCount from "../hooks/useNotificationCount";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;
  const notificationCount = useNotificationCount();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isAdminPage = currentPath.startsWith("/admin");

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleMobileSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-base-200 shadow-lg"
      >
        {isMobileOpen ? (
          <XIcon className="size-6" />
        ) : (
          <MenuIcon className="size-6" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          relative
          bg-base-200 border-r border-base-300
          flex flex-col h-screen
          transition-all duration-500 ease-in-out
          ${isCollapsed ? "w-20" : "w-64"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          fixed lg:sticky lg:top-0 z-40
          lg:flex-shrink-0
          overflow-visible
        `}
      >
        {/* Header - LOGO SAJA */}
        <div className="p-5 border-b border-base-300 flex-none min-h-[80px] flex items-center justify-center">
          <Link
            to={isAdminPage ? "/admin" : "/"}
            className={`
              flex items-center
              hover:opacity-80 transition-opacity
              ${isCollapsed ? "justify-center w-full" : "gap-2.5"}
            `}
          >
            <ShipWheelIcon className="size-9 text-primary flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-secondary to-secondary tracking-wider">
                Sociahub
              </span>
            )}
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
          {/* Home */}
          <Link
            to={isAdminPage ? "/admin" : "/"}
            title="Home"
            className={`
              flex items-center w-full gap-3 px-3 py-3 rounded-lg
              transition-all duration-300 ease-in-out
              hover:bg-base-300 active:scale-[0.98]
              ${
                currentPath === "/" || currentPath === "/admin"
                  ? "bg-base-300"
                  : ""
              }
              ${isCollapsed ? "justify-center px-0" : ""}
            `}
          >
            <div
              className={`flex items-center ${
                isCollapsed ? "justify-center w-full" : "gap-3"
              }`}
            >
              <HomeIcon className="size-5 opacity-70 flex-shrink-0" />
              {!isCollapsed && (
                <span className="transition-all duration-300 opacity-100">
                  Home
                </span>
              )}
            </div>
          </Link>

          {/* Friends */}
          <Link
            to="/friends"
            title="Friends"
            className={`
              flex items-center w-full gap-3 px-3 py-3 rounded-lg
              transition-all duration-300 ease-in-out
              hover:bg-base-300 active:scale-[0.98]
              ${currentPath === "/friends" ? "bg-base-300" : ""}
              ${isCollapsed ? "justify-center px-0" : ""}
            `}
          >
            <div
              className={`flex items-center ${
                isCollapsed ? "justify-center w-full" : "gap-3"
              }`}
            >
              <UserIcon className="size-5 opacity-70 flex-shrink-0" />
              {!isCollapsed && (
                <span className="transition-all duration-300 opacity-100">
                  Friends
                </span>
              )}
            </div>
          </Link>

          {/* My Posts */}
          <Link
            to="/my-posts"
            title="My Posts"
            className={`
              flex items-center w-full gap-3 px-3 py-3 rounded-lg
              transition-all duration-300 ease-in-out
              hover:bg-base-300 active:scale-[0.98]
              ${currentPath === "/my-posts" ? "bg-base-300" : ""}
              ${isCollapsed ? "justify-center px-0" : ""}
            `}
          >
            <div
              className={`flex items-center ${
                isCollapsed ? "justify-center w-full" : "gap-3"
              }`}
            >
              <FileTextIcon className="size-5 opacity-70 flex-shrink-0" />
              {!isCollapsed && (
                <span className="transition-all duration-300 opacity-100">
                  My Posts
                </span>
              )}
            </div>
          </Link>

          {/* View All Posts */}
          <Link
            to="/posts"
            title="View All Posts"
            className={`
              flex items-center w-full gap-3 px-3 py-3 rounded-lg
              transition-all duration-300 ease-in-out
              hover:bg-base-300 active:scale-[0.98]
              ${currentPath === "/posts" ? "bg-base-300" : ""}
              ${isCollapsed ? "justify-center px-0" : ""}
            `}
          >
            <div
              className={`flex items-center ${
                isCollapsed ? "justify-center w-full" : "gap-3"
              }`}
            >
              <ListIcon className="size-5 opacity-70 flex-shrink-0" />
              {!isCollapsed && (
                <span className="transition-all duration-300 opacity-100">
                  View All
                </span>
              )}
            </div>
          </Link>

          {/* Notifications */}
          <Link
            to="/notifications"
            title="Notifications"
            className={`
              flex items-center w-full gap-3 px-3 py-3 rounded-lg
              transition-all duration-300 ease-in-out
              hover:bg-base-300 active:scale-[0.98]
              ${currentPath === "/notifications" ? "bg-base-300" : ""}
              ${isCollapsed ? "justify-center px-0" : ""}
            `}
          >
            <div
              className={`flex items-center ${
                isCollapsed ? "justify-center w-full relative" : "gap-3"
              }`}
            >
              <div className="relative">
                <BellIcon className="size-5 opacity-70" />
                {notificationCount > 0 && (
                  <span className="badge badge-error badge-xs absolute -top-1.5 -right-2">
                    {notificationCount}
                  </span>
                )}
              </div>
              {!isCollapsed && (
                <span className="transition-all duration-300 opacity-100">
                  Notifications
                </span>
              )}
            </div>
          </Link>

          {/* Admin Menu */}
          {authUser?.role === "admin" && (
            <div className="mt-4 pt-4 border-t border-base-300 space-y-1">
              {!isCollapsed && (
                <p className="px-3 mb-2 text-xs font-semibold uppercase opacity-50 transition-all duration-300">
                  Admin Panel
                </p>
              )}

              {/* User Approval */}
              <Link
                to="/admin/users"
                title="User Approval"
                className={`
                  flex items-center w-full gap-3 px-3 py-3 rounded-lg
                  transition-all duration-300 ease-in-out
                  hover:bg-base-300 active:scale-[0.98]
                  ${
                    currentPath.startsWith("/admin/users")
                      ? "bg-base-300"
                      : ""
                  }
                  ${isCollapsed ? "justify-center px-0" : ""}
                `}
              >
                <div
                  className={`flex items-center ${
                    isCollapsed ? "justify-center w-full" : "gap-3"
                  }`}
                >
                  <ShieldIcon className="size-5 opacity-70" />
                  {!isCollapsed && (
                    <span className="transition-all duration-300 opacity-100">
                      User Approval
                    </span>
                  )}
                </div>
              </Link>

              {/* Progress Dashboard */}
              <Link
                to="/admin/progress"
                title="Progress Dashboard"
                className={`
                  flex items-center w-full gap-3 px-3 py-3 rounded-lg
                  transition-all duration-300 ease-in-out
                  hover:bg-base-300 active:scale-[0.98]
                  ${
                    currentPath.startsWith("/admin/progress")
                      ? "bg-base-300"
                      : ""
                  }
                  ${isCollapsed ? "justify-center px-0" : ""}
                `}
              >
                <div
                  className={`flex items-center ${
                    isCollapsed ? "justify-center w-full" : "gap-3"
                  }`}
                >
                  <BarChart3Icon className="size-5 opacity-70" />
                  {!isCollapsed && (
                    <span className="transition-all duration-300 opacity-100">
                      Progress Dashboard
                    </span>
                  )}
                </div>
              </Link>

              {/* Assign Employee */}
              <Link
                to="/admin/assign-employee"
                title="Assign Employee"
                className={`
                  flex items-center w-full gap-3 px-3 py-3 rounded-lg
                  transition-all duration-300 ease-in-out
                  hover:bg-base-300 active:scale-[0.98]
                  ${
                    currentPath.startsWith("/admin/assign-employee")
                      ? "bg-base-300"
                      : ""
                  }
                  ${isCollapsed ? "justify-center px-0" : ""}
                `}
              >
                <div
                  className={`flex items-center ${
                    isCollapsed ? "justify-center w-full" : "gap-3"
                  }`}
                >
                  <UserIcon className="size-5 opacity-70" />
                  {!isCollapsed && (
                    <span className="transition-all duration-300 opacity-100">
                      Assign Employee
                    </span>
                  )}
                </div>
              </Link>
            </div>
          )}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-base-300">
          <div className="p-4 flex-none">
            <div
              className={`flex items-center ${
                isCollapsed ? "justify-center" : "gap-3"
              }`}
            >
              <div className="avatar">
                <div className="w-10 rounded-full">
                  {authUser?.profilePic ? (
                    <img
                      src={authUser.profilePic}
                      alt="User Avatar"
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-base-300 rounded-full flex items-center justify-center">
                      <UserIcon className="size-5 opacity-50" />
                    </div>
                  )}
                </div>
              </div>

              {!isCollapsed && (
                <div className="flex-1 min-w-0 transition-all duration-300 overflow-hidden">
                  <p className="font-semibold text-sm truncate">
                    {authUser?.fullName}
                  </p>
                  <p className="text-xs flex items-center gap-1">
                    <span
                      className={`size-2 rounded-full ${
                        isAdminPage ? "bg-error" : "bg-success"
                      }`}
                    />
                    <span
                      className={isAdminPage ? "text-error" : "text-success"}
                    >
                      {isAdminPage ? "Admin" : "Online"}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Sidebar Toggle */}
        <button
          onClick={toggleSidebar}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`
            absolute
            top-1/2 -translate-y-1/2
            -right-4
            z-50
            flex items-center justify-center
            w-8 h-8
            rounded-full
            bg-base-200
            border border-base-300
            shadow-md
            hover:bg-base-300
            hover:translate-x-1
            transition-all duration-300
          `}
        >
          {isCollapsed ? (
            <ChevronRightIcon className="size-4" />
          ) : (
            <ChevronLeftIcon className="size-4" />
          )}
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
