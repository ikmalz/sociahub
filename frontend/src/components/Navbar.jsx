import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, LogOutIcon, ShipWheelIcon, MenuIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";

const Navbar = ({ onMenuClick }) => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");
  const isPostDetailPage = location.pathname?.startsWith("/post/");

  const { logoutMutation } = useLogout();

  // Hide menu button on chat page and post detail page
  const showMenuButton = !isChatPage && !isPostDetailPage;

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between w-full">
          {/* Left: Menu Button (Mobile Only) */}
          <div className="flex items-center gap-3">
            {showMenuButton && (
              <button
                onClick={onMenuClick}
                className="md:hidden btn btn-ghost btn-circle p-2 hover:bg-base-300 transition-colors"
                aria-label="Open sidebar menu"
              >
                <MenuIcon className="h-5 w-5 text-base-content" />
              </button>
            )}

            {/* Logo - ONLY IN THE CHAT PAGE */}
            {isChatPage && (
              <div className="pl-2">
                <Link to="/" className="flex items-center gap-2.5">
                  <ShipWheelIcon className="size-7 text-primary" />
                  <span className="text-xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                    Sociahub
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Right: User Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to={"/notifications"}>
              <button className="btn btn-ghost btn-circle p-2 sm:p-3">
                <BellIcon className="h-5 w-5 sm:h-6 sm:w-6 text-base-content opacity-70" />
              </button>
            </Link>

            <ThemeSelector />

            <Link to="/profile" className="avatar cursor-pointer">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full ring-1 ring-base-300 overflow-hidden">
                <img 
                  src={authUser?.profilePic || "/default-avatar.png"} 
                  alt="User Avatar" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/default-avatar.png";
                  }}
                />
              </div>
            </Link>

            <button 
              className="btn btn-ghost btn-circle p-2 sm:p-3" 
              onClick={logoutMutation}
              aria-label="Logout"
            >
              <LogOutIcon className="h-5 w-5 sm:h-6 sm:w-6 text-base-content opacity-70" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;