import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children, showSidebar = false }) => {
  return (
    <div className="min-h-screen flex">
      {showSidebar && <Sidebar />}
      
      <div className="flex flex-col flex-1 min-w-0 transition-all duration-300">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-base-100">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;