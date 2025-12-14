import { Link } from "react-router";
import Sidebar from "./Sidebar";
import { ArrowLeft, LayoutDashboard } from "lucide-react";

const PostDetailLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-base-300/30">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 relative">
        <div className="absolute bottom-6 left-6 z-10 lg:top-4 lg:left-4 lg:bottom-auto">
          <Link
            to="/posts"
            className="btn btn-circle btn-ghost bg-black/30 backdrop-blur-sm text-white hover:bg-black/50"
          >
            <LayoutDashboard className="size-5 block lg:hidden" />
            <ArrowLeft className="size-5 hidden lg:block" />
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
};

export default PostDetailLayout;