import { Link } from "react-router";
import Sidebar from "./Sidebar";
import { ArrowLeft, Menu } from "lucide-react";
import { useState } from "react";

const PostDetailLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-base-300/30">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-screen z-30">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="lg:hidden fixed inset-y-0 left-0 z-50">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="lg:ml-0 min-h-screen relative">
        {/* Mobile Menu Button */}
        <div className="lg:hidden fixed top-4 left-4 z-40 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2.5 rounded-lg bg-base-200/90 backdrop-blur-sm border border-base-300 shadow-sm hover:bg-base-300 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="size-5 text-base-content" />
          </button>
        </div>

        {/* Back Button */}
        <div className="fixed top-4 z-40 right-4 lg:right-6">
          <Link
            to="/posts"
            className="p-2.5 rounded-lg bg-base-200/90 backdrop-blur-sm border border-base-300 shadow-sm hover:bg-base-300 transition-colors flex items-center justify-center"
            aria-label="Back to posts"
          >
            <ArrowLeft className="size-5 text-base-content" />
          </Link>
        </div>

        {/* Content Area */}
        <div className="pt-20 lg:pt-8 pb-8 px-4 lg:px-8 min-h-screen">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailLayout;