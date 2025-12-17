import React from "react";
import useAuthUser from "../hooks/useAuthUser";
import { Link, useLocation } from "react-router";
import {
  BellIcon,
  HomeIcon,
  ShipWheelIcon,
  UserIcon,
  FileTextIcon,
  ListIcon,
  ShieldIcon,
} from "lucide-react";
import useNotificationCount from "../hooks/useNotificationCount";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;
  const notificationCount = useNotificationCount();

  return (
    <aside className="w-64 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0">
      {/* LOGO */}
      <div className="p-5 border-b border-base-300">
        <Link to="/" className="flex items-center gap-2.5">
          <ShipWheelIcon className="size-9 text-primary" />
          <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-secondary to-secondary tracking-wider">
            Sociahub
          </span>
        </Link>
      </div>

      {/* NAV */}
      <nav className="flex-1 p-4 space-y-1">
        {/* HOME */}
        <Link
          to="/"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/" ? "btn-active" : ""
          }`}
        >
          <HomeIcon className="size-5 opacity-70" />
          <span>Home</span>
        </Link>

        {/* FRIENDS */}
        <Link
          to="/friends"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/friends" ? "btn-active" : ""
          }`}
        >
          <UserIcon className="size-5 opacity-70" />
          <span>Friends</span>
        </Link>

        {/* POSTS (PLACEHOLDER) */}
        <Link
          to="/my-posts"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/my-posts" ? "btn-active" : ""
          }`}
        >
          <FileTextIcon className="size-5 opacity-70" />
          <span>My Posts</span>
        </Link>

        {/* VIEW ALL */}
        <Link
          to="/posts"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/posts" ? "btn-active" : ""
          }`}
        >
          <ListIcon className="size-5 opacity-70" />
          <span>View All Post</span>
        </Link>

        {/* NOTIFICATIONS */}
        <Link
          to="/notifications"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case relative ${
            currentPath === "/notifications" ? "btn-active" : ""
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

          <span>Notifications</span>
        </Link>

        {/* ADMIN MENU */}
        {authUser?.role === "admin" && (
          <Link
            to="/admin"
            className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
              currentPath === "/admin" ? "btn-active" : ""
            }`}
          >
            <ShieldIcon className="size-5 opacity-70 text-error" />
            <span className="text-error font-semibold">Admin Panel</span>
          </Link>
        )}
      </nav>

      {/* USER PROFILE */}
      <div className="p-4 border-t border-base-300 mt-auto">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-10 rounded-full">
              {authUser?.profilePic ? (
                <img src={authUser.profilePic} alt="User Avatar" />
              ) : (
                <div className="w-full h-full bg-base-300 rounded-full" />
              )}
            </div>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{authUser?.fullName}</p>
            <p className="text-xs text-success flex items-center gap-1">
              <span className="size-2 rounded-full bg-success inline-block" />
              Online
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
