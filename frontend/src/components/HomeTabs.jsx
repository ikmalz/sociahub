import { useState } from "react";
import { Briefcase, Camera, MessageSquare, FileText, Users, Bell, TrendingUp } from "lucide-react";

const HomeTabs = ({ 
  userRole, 
  children, 
  defaultTab = "projects" 
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  const isClient = userRole === "client";
  const isEmployee = userRole === "employee";
  
  const tabs = [
    {
      id: "projects",
      label: isEmployee ? "My Projects" : "Projects",
      icon: <Briefcase className="size-4" />,
      show: isClient || isEmployee,
    },
    {
      id: "posts",
      label: "Posts",
      icon: <MessageSquare className="size-4" />,
      show: !isClient,
    },
    {
      id: "create",
      label: "Create Post",
      icon: <FileText className="size-4" />,
      show: !isClient,
    },
  ].filter(tab => tab.show);

  return (
    <div className="card bg-base-100 shadow rounded-xl">
      {/* Tabs Header */}
      <div className="border-b border-base-300">
        <div className="tabs tabs-boxed bg-base-200 m-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab tab-sm flex items-center gap-2 ${
                activeTab === tab.id ? "tab-active" : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs Content */}
      <div className="card-body p-4">
        {children[activeTab]}
      </div>
    </div>
  );
};

export default HomeTabs;