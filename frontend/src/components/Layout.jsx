import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children, showSidebar = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* Sidebar untuk desktop */}
      {showSidebar && (
        <>
          {/* Desktop Sidebar */}
          <div className="hidden md:block flex-shrink-0 sticky top-0 h-screen">
            <Sidebar />
          </div>
          
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <>
              <div 
                className="md:hidden fixed inset-0 bg-black/50 z-40"
                onClick={() => setSidebarOpen(false)}
              />
              <div className="md:hidden fixed inset-y-0 left-0 z-50 w-64">
                <Sidebar onClose={() => setSidebarOpen(false)} />
              </div>
            </>
          )}
        </>
      )}
      
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 w-full transition-all duration-300 ${showSidebar ? 'md:ml-0' : ''}`}>
        {/* Navbar dengan menu button untuk mobile */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto bg-base-100">
          <div className="p-4 md:p-6 pt-4 md:pt-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;