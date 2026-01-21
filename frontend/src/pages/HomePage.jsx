import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  getOutgoingFriendReqs,
  getPosts,
  getRecommendedUsers,
  getTimelineStories,
  getUserFriends,
  sendFriendRequest,
  getMyProjects,
  getAllowedEmployees,
  markProjectAsComplete,
} from "../lib/api";
import { Link } from "react-router";
import {
  CheckCircleIcon,
  UserPlusIcon,
  UsersIcon,
  Camera,
  MessageSquare,
  Clock,
  User,
  BuildingIcon,
  Briefcase,
  FileText,
  Landmark,
  Target,
  Home,
  FolderOpen,
  TrendingUp,
  PlusCircle,
  BarChart3,
  Image,
  Video,
} from "lucide-react";
import FriendCard from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import PostForm from "../components/PostForm";
import PostCard from "../components/PostCard";
import StoryCreateModal from "../components/StoryCreateModal";
import StoriesCarousel from "../components/StoriesCarousel";
import useAuthUser from "../hooks/useAuthUser";
import { getVisibleRoles } from "../utils/roleFilter";
import ProjectCreateModal from "../components/ProjectCreateModal";
import ProjectProgressUpdate from "../components/ProjectProgressUpdate";
import ProjectNoteModal from "../components/ProjectNoteModal";
import ProjectNotesDisplay from "../components/ProjectNoteDisplay";

const getDepartmentIcon = (department) => {
  if (!department) return "👤";
  const deptLower = department?.toLowerCase() || "";
  const icons = {
    "human resources": "👥",
    hr: "👥",
    finance: "💰",
    marketing: "📈",
    sales: "📊",
    it: "💻",
    technology: "💻",
    operations: "⚙️",
    "customer service": "💁",
    "r&d": "🔬",
    research: "🔬",
    procurement: "📦",
    logistics: "🚚",
    administration: "📋",
    legal: "⚖️",
    executive: "👔",
  };
  return icons[deptLower] || "👤";
};

const HomePage = () => {
  const queryClient = useQueryClient();
  const { authUser } = useAuthUser();

  const userRole = authUser?.role;
  const isClient = userRole === "client";
  const isEmployee = userRole === "employee";
  const isAdmin = userRole === "admin";

  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [showStories, setShowStories] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [expandedProjects, setExpandedProjects] = useState({});
  const [activeTab, setActiveTab] = useState(isClient ? "projects" : "feed");
  const [postFormType, setPostFormType] = useState("text");
  const [localOutgoingIds, setLocalOutgoingIds] = useState(new Set());

  // Queries
  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["recommended-users", userRole],
    queryFn: getRecommendedUsers,
    enabled: !!userRole,
  });

  const { data: outgoingFriendsReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
  });

  const { data: storiesData } = useQuery({
    queryKey: ["stories"],
    queryFn: getTimelineStories,
  });

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ["my-projects", userRole],
    queryFn: getMyProjects,
    enabled: isClient || isEmployee,
  });

  // Mutations
  const { mutate: markAsCompleteMutation, isPending: isMarkingComplete } =
    useMutation({
      mutationFn: markProjectAsComplete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["my-projects", userRole] });
      },
    });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,

    onMutate: async (userId) => {
      setLocalOutgoingIds((prev) => new Set(prev).add(userId));
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["recommended-users"] });
    },

    onError: (err, userId) => {
      setLocalOutgoingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    },
  });

  const { data: availableEmployees = [], isLoading: loadingEmployees } =
    useQuery({
      queryKey: ["allowed-employees"],
      queryFn: getAllowedEmployees,
      enabled: isClient,
    });

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendsReqs?.length > 0) {
      outgoingFriendsReqs.forEach((req) => outgoingIds.add(req.recipient._id));
    }
    setOutgoingRequestsIds(outgoingIds);
    setLocalOutgoingIds(outgoingIds);
  }, [outgoingFriendsReqs]);

  // Handlers
  const handleOpenNoteModal = (projectId) => {
    setSelectedProjectId(projectId);
    setShowNoteModal(true);
  };

  const handleOpenStories = (userIndex = 0, storyIndex = 0) => {
    setSelectedUserIndex(userIndex);
    setSelectedStoryIndex(storyIndex);
    setShowStories(true);
  };

  const toggleProjectNotes = (projectId) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const handleMarkAsComplete = (projectId) => {
    if (window.confirm("Mark this project as completed?")) {
      markAsCompleteMutation(projectId);
    }
  };

  const handlePostButtonClick = (type = "text") => {
    setPostFormType(type);
    document.getElementById("post-form-modal")?.showModal();
  };

  // Data processing
  const stories = storiesData?.stories || [];
  const allowedRoles = getVisibleRoles(userRole);

  const filteredRecommendedUsers = recommendedUsers.filter((user) => {
    const isAllowedRole = allowedRoles.includes(user.role);
    const isNotCurrentUser = user._id !== authUser?._id;
    const isActive = user.isActive !== false;

    const isAlreadyFriend = friends.some((f) => f._id === user._id);
    const hasPendingRequest = outgoingRequestsIds.has(user._id);

    return (
      isAllowedRole &&
      isNotCurrentUser &&
      isActive &&
      !isAlreadyFriend &&
      !hasPendingRequest
    );
  });

  const shuffledRecommendedUsers = filteredRecommendedUsers
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  const ProjectCard = ({ project, showClientInfo = false }) => {
    const isExpanded = expandedProjects[project._id];
    const isCompleted = project.status === "completed";
    const isAssigned =
      isEmployee && project.employees?.some((emp) => emp._id === authUser?._id);
    const isClientProject = isClient && project.client?._id === authUser?._id;

    const canMarkComplete = isAssigned && !isCompleted && isEmployee;

    const renderClientProgressBar = () => {
      const progress = project.progress || 0;

      return (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs opacity-70">Progress</span>
            <span className="text-xs font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-base-300 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      );
    };

    const renderEmployeeProgressSection = () => {
      const progress = project.progress || 0;

      return (
        <div className="mb-3">
          {/* Progress bar untuk employee */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs opacity-70">Progress</span>
            <span className="text-xs font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-base-300 rounded-full h-2 mb-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {isAssigned && <ProjectProgressUpdate project={project} compact />}
        </div>
      );
    };

    const renderAdminProgressBar = () => {
      const progress = project.progress || 0;

      return (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs opacity-70">Progress</span>
            <span className="text-xs font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-base-300 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      );
    };

    return (
      <div className="card bg-base-100 border border-base-300 p-4 hover:shadow-md transition">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm mb-1">{project.title}</h4>
            <p className="text-xs opacity-70 line-clamp-2 mb-1">
              {project.description}
            </p>
            {showClientInfo && project.client && (
              <p className="text-xs opacity-70">
                Client: {project.client.fullName}
                {project.client.institutionName &&
                  ` (${project.client.institutionName})`}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {canMarkComplete && (
              <button
                onClick={() => handleMarkAsComplete(project._id)}
                className="btn btn-success btn-xs"
                disabled={isMarkingComplete}
                title="Mark as Complete"
              >
                <CheckCircleIcon className="size-3 mr-1" />
                Complete
              </button>
            )}

            <span
              className={`badge badge-xs ${
                isCompleted
                  ? "badge-success"
                  : project.status === "active"
                    ? "badge-warning"
                    : "badge-info"
              }`}
            >
              {project.status}
            </span>
          </div>
        </div>

        {/* Progress/Completed Status */}
        {!isCompleted ? (
          <>
            {isClient && renderClientProgressBar()}
            {isEmployee && renderEmployeeProgressSection()}
            {isAdmin && renderAdminProgressBar()}
          </>
        ) : (
          <div className="bg-success/10 border border-success/20 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 text-success">
              <CheckCircleIcon className="size-4" />
              <span className="text-sm font-medium">Project Completed</span>
            </div>
            <p className="text-xs opacity-70 mt-1">
              Completed on {new Date(project.updatedAt).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Notes Section */}
        {isExpanded && (
          <ProjectNotesDisplay
            projectId={project._id}
            notes={project.notes || []}
            project={project}
          />
        )}

        {/* Footer Actions */}
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-base-300">
          <div className="flex items-center gap-2">
            {project.notes?.length > 0 ? (
              <button
                onClick={() => toggleProjectNotes(project._id)}
                className="btn btn-ghost btn-xs"
              >
                <MessageSquare className="size-3 mr-1" />
                {isExpanded ? "Hide" : "Show"} Notes ({project.notes.length})
              </button>
            ) : (
              <span className="text-xs opacity-70">No notes yet</span>
            )}
          </div>
          <button
            onClick={() => handleOpenNoteModal(project._id)}
            className="btn btn-outline btn-xs"
          >
            <MessageSquare className="size-3 mr-1" />
            Add Note
          </button>
        </div>
      </div>
    );
  };

  // Stories Preview Component
  const StoriesPreview = () => (
    <div className="card bg-base-100 shadow rounded-xl">
      <div className="card-body p-3 md:p-4">
        {/* Header lebih kecil */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 md:w-7 md:h-7 rounded-md bg-primary flex items-center justify-center">
              <Camera className="size-3 md:size-3.5 text-base-100" />
            </div>
            <div>
              <h2 className="text-xs md:text-sm font-semibold">Stories</h2>
              <p className="text-[10px] md:text-xs opacity-60">
                Latest moments
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateStory(true)}
            className="btn btn-primary btn-xs md:btn-sm"
          >
            <Camera className="size-2.5 md:size-3 mr-1" />
            <span className="text-xs">Create</span>
          </button>
        </div>

        {stories.length === 0 ? (
          <div className="text-center py-6 md:py-7">
            <div className="w-16 h-16 md:w-18 md:h-18 mx-auto mb-3 bg-base-200 rounded-full flex items-center justify-center">
              <Camera className="size-5 md:size-6 opacity-40" />
            </div>
            <p className="text-xs md:text-sm opacity-70 mb-3">
              No stories from colleagues
            </p>
            <button
              onClick={() => setShowCreateStory(true)}
              className="btn btn-outline btn-xs md:btn-sm"
            >
              Share first!
            </button>
          </div>
        ) : (
          <>
            {/* Stories List - lebih kecil dengan margin atas */}
            <div className="relative mt-2">
              <div className="flex gap-2.5 md:gap-3 overflow-x-auto pb-3 md:pb-4 scrollbar-thin -mx-1 px-1">
                <div className="flex-shrink-0 pt-1">
                  <button
                    onClick={() => setShowCreateStory(true)}
                    className="flex flex-col items-center group"
                  >
                    <div className="relative mb-1.5">
                      <div className="w-16 h-16 md:w-18 md:h-18 rounded-full border-2 border-dashed border-gray-300 group-hover:border-primary transition-colors flex items-center justify-center">
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
                          <Camera className="size-4 md:size-5 text-primary" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 right-0 w-5 h-5 md:w-6 md:h-6 bg-primary rounded-full flex items-center justify-center border-2 border-base-100">
                        <span className="text-[10px] text-base-100 font-bold">
                          +
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] md:text-xs font-medium">
                      Add Story
                    </span>
                  </button>
                </div>

                {stories.map((userStories, userIndex) => {
                  const user = userStories.user;
                  const userStoryCount = userStories.stories?.length || 0;
                  const hasUnviewed = userStories.hasUnviewed || false;

                  return (
                    <div key={user._id} className="flex-shrink-0 pt-1">
                      <button
                        onClick={() => handleOpenStories(userIndex, 0)}
                        className="flex flex-col items-center group relative"
                      >
                        <div className="relative mb-1.5">
                          <div
                            className={`w-14 h-14 md:w-16 md:h-16 rounded-full p-0.5 ${
                              hasUnviewed
                                ? "bg-gradient-to-r from-primary to-secondary"
                                : "bg-gradient-to-r from-gray-300 to-gray-400"
                            }`}
                          >
                            <div className="w-full h-full rounded-full overflow-hidden border border-base-100">
                              <img
                                src={user.profilePic || "/default-avatar.png"}
                                alt={user.fullName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = "/default-avatar.png";
                                }}
                              />
                            </div>
                          </div>

                          {userStoryCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-primary rounded-full flex items-center justify-center border border-base-100">
                              <span className="text-[8px] md:text-[10px] text-base-100 font-bold">
                                {userStoryCount}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] md:text-xs font-medium truncate max-w-16 md:max-w-20">
                          {user.fullName}
                        </span>

                        {hasUnviewed && (
                          <div className="absolute top-0 left-0 w-2 h-2 md:w-2.5 md:h-2.5 bg-primary rounded-full animate-pulse"></div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Stories Stats lebih kecil */}
        {stories.length > 0 && (
          <div className="mt-4 md:mt-5 pt-3 md:pt-4 border-t border-base-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs md:text-sm">
              <div className="flex items-center gap-1.5 md:gap-2">
                <UsersIcon className="size-3 md:size-3.5 opacity-70" />
                <span>
                  {stories.length}{" "}
                  {stories.length === 1 ? "colleague" : "colleagues"} has
                  stories
                </span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                <Clock className="size-3 md:size-3.5 opacity-70" />
                <span>24h remaining</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const QuickStats = () => {
    const completedProjects = projects.filter(
      (p) => p.status === "completed",
    ).length;
    const activeProjects = projects.filter((p) => p.status === "active").length;

    return (
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm">Your Stats</h3>
          <BarChart3 className="size-4 opacity-70" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-base-100 p-3 rounded-lg border border-base-300">
            <div className="text-lg font-bold text-primary">
              {friends.length}
            </div>
            <div className="text-[10px] opacity-60">
              {isClient ? "Team Members" : "Connections"}
            </div>
          </div>

          {!isClient ? (
            <>
              <div className="bg-base-100 p-3 rounded-lg border border-base-300">
                <div className="text-lg font-bold text-secondary">
                  {posts.length}
                </div>
                <div className="text-[10px] opacity-60">Posts</div>
              </div>
              <div className="bg-base-100 p-3 rounded-lg border border-base-300">
                <div className="text-lg font-bold text-accent">
                  {stories.length}
                </div>
                <div className="text-[10px] opacity-60">Stories</div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-base-100 p-3 rounded-lg border border-base-300">
                <div className="text-lg font-bold text-success">
                  {completedProjects}
                </div>
                <div className="text-[10px] opacity-60">Completed</div>
              </div>
              <div className="bg-base-100 p-3 rounded-lg border border-base-300">
                <div className="text-lg font-bold text-warning">
                  {activeProjects}
                </div>
                <div className="text-[10px] opacity-60">Active</div>
              </div>
            </>
          )}

          <div className="bg-base-100 p-3 rounded-lg border border-base-300">
            <div className="text-lg font-bold text-info">{projects.length}</div>
            <div className="text-[10px] opacity-60">
              {isClient ? "Projects" : "Total Projects"}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div
          className={`rounded-xl p-4 shadow-md mb-6 ${
            isClient
              ? "bg-gradient-to-r from-primary/20 to-primary/10 border-l-4 border-primary"
              : "bg-gradient-to-r from-primary to-secondary text-primary-content"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {isClient ? (
                  <Landmark className="size-5" />
                ) : (
                  <Briefcase className="size-5" />
                )}
                <h1 className="text-lg font-semibold">
                  {isClient
                    ? `Welcome, ${
                        authUser?.institutionName || "Government Client"
                      } 👋`
                    : `Hi, ${authUser?.fullName?.split(" ")[0] || "Team"} 👋`}
                </h1>
              </div>
              <p
                className={`text-sm ${
                  isClient ? "text-base-content" : "opacity-85"
                }`}
              >
                {isClient
                  ? "Monitor your projects and collaborate with our team"
                  : "Stay updated with company activities"}
              </p>
            </div>
            <BuildingIcon
              className={`size-8 ${
                isClient ? "text-primary/40" : "opacity-80"
              } hidden md:block`}
            />
          </div>

          {!isClient && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              <button
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === "feed"
                    ? "bg-base-100 text-primary shadow-sm"
                    : "bg-base-100/50 text-base-content/70 hover:bg-base-100"
                }`}
                onClick={() => setActiveTab("feed")}
              >
                <div className="flex items-center gap-1.5">
                  <Home className="size-3.5" />
                  <span>Feed</span>
                </div>
              </button>

              {isEmployee && (
                <button
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "projects"
                      ? "bg-base-100 text-primary shadow-sm"
                      : "bg-base-100/50 text-base-content/70 hover:bg-base-100"
                  }`}
                  onClick={() => setActiveTab("projects")}
                >
                  <div className="flex items-center gap-1.5">
                    <FolderOpen className="size-3.5" />
                    <span>Projects</span>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {isClient && (
              <>
                {/* Projects Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Your Projects</h2>
                    <p className="text-xs opacity-60">
                      Monitor and manage your projects
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-primary">
                      {projects.length || 0}
                    </span>
                    <button
                      onClick={() => setShowProjectModal(true)}
                      className="btn btn-primary btn-sm"
                    >
                      <PlusCircle className="size-4 mr-1" />
                      New Project
                    </button>
                  </div>
                </div>

                {/* Projects Grid */}
                {loadingProjects ? (
                  <div className="flex justify-center py-12">
                    <span className="loading loading-spinner loading-lg text-primary" />
                  </div>
                ) : projects.length === 0 ? (
                  <div className="card bg-base-100 border border-dashed border-base-300 rounded-xl p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-base-200 rounded-full flex items-center justify-center">
                      <Target className="size-8 text-primary/60" />
                    </div>
                    <h3 className="font-medium mb-2">No projects yet</h3>
                    <p className="text-sm opacity-70 mb-4">
                      Create your first project to get started
                    </p>
                    <button
                      onClick={() => setShowProjectModal(true)}
                      className="btn btn-primary"
                    >
                      <FileText className="size-4 mr-1" />
                      Create Project
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {projects.map((project) => (
                      <ProjectCard key={project._id} project={project} />
                    ))}
                  </div>
                )}

                {/* Recent Updates Section */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold">Project Updates</h2>
                      <p className="text-xs opacity-60">
                        Latest updates from your projects
                      </p>
                    </div>
                    <Link to="/posts" className="btn btn-outline btn-xs">
                      View all
                    </Link>
                  </div>

                  {loadingPosts ? (
                    <div className="flex justify-center py-8">
                      <span className="loading loading-spinner loading-md text-primary" />
                    </div>
                  ) : posts.length === 0 ? (
                    <div className="card bg-base-100 border border-base-300 rounded-xl p-6 text-center">
                      <MessageSquare className="size-10 opacity-40 mx-auto mb-3" />
                      <p className="text-sm opacity-70">
                        No project updates yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {posts.slice(0, 3).map((post) => (
                        <PostCard key={post._id} post={post} compact />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ===== EMPLOYEE/ADMIN VIEW ===== */}
            {!isClient && (
              <>
                {/* Feed Tab */}
                {activeTab === "feed" && (
                  <div className="space-y-6">
                    {/* Create Post - SEPERTI DI AWAL */}
                    <div className="card bg-base-100 shadow rounded-xl">
                      <div className="card-body p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            <MessageSquare className="size-4 text-primary-content" />
                          </div>
                          <div>
                            <h2 className="text-sm font-semibold">
                              Create Post
                            </h2>
                            <p className="text-xs opacity-60">
                              Share updates with the team
                            </p>
                          </div>
                        </div>

                        <PostForm />
                      </div>
                    </div>

                    {/* Stories Preview */}
                    <StoriesPreview />

                    {/* Recent Posts */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold">Recent Posts</h3>
                        <Link
                          to="/posts"
                          className="text-xs text-primary hover:underline"
                        >
                          View all
                        </Link>
                      </div>
                      {loadingPosts ? (
                        <div className="flex justify-center py-8">
                          <span className="loading loading-spinner loading-md text-primary" />
                        </div>
                      ) : posts.length === 0 ? (
                        <div className="text-center py-8 opacity-70">
                          <p className="text-sm">No posts yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {posts.slice(0, 5).map((post) => (
                            <PostCard key={post._id} post={post} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Projects Tab */}
                {activeTab === "projects" && (
                  <div className="space-y-6">
                    <div className="card bg-base-100 shadow rounded-xl">
                      <div className="card-body p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Briefcase className="size-5 text-primary" />
                            </div>
                            <div>
                              <h2 className="text-base font-semibold">
                                My Projects
                              </h2>
                              <p className="text-xs opacity-60">
                                Projects assigned to you by clients
                              </p>
                            </div>
                          </div>
                          <span className="badge badge-primary">
                            {projects.length || 0}
                          </span>
                        </div>

                        {loadingProjects ? (
                          <div className="flex justify-center py-12">
                            <span className="loading loading-spinner loading-lg text-primary" />
                          </div>
                        ) : projects.length === 0 ? (
                          <div className="card bg-base-100 border border-dashed border-base-300 rounded-xl p-8 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-base-200 rounded-full flex items-center justify-center">
                              <Briefcase className="size-8 text-primary/60" />
                            </div>
                            <h3 className="font-medium mb-2">
                              No projects assigned yet
                            </h3>
                            <p className="text-sm opacity-70">
                              Clients will assign projects to you here
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {projects.map((project) => (
                              <ProjectCard
                                key={project._id}
                                project={project}
                                showClientInfo
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Stories Tab */}
              </>
            )}
          </div>

          {/* SIDEBAR - 1/3 width */}
          <div className="space-y-6">
            {/* Connections - HANYA SATU */}
            <div className="card bg-base-100 shadow-md rounded-xl">
              <div className="card-body p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold">
                      {isClient ? "Team Contacts" : "Your Connections"}
                    </h3>
                    <p className="text-xs opacity-60">
                      {friends.length} {isClient ? "team members" : "connected"}
                    </p>
                  </div>
                  <Link to="/friends" className="btn btn-outline btn-xs">
                    View All
                  </Link>
                </div>

                {loadingFriends ? (
                  <div className="flex justify-center py-4">
                    <span className="loading loading-spinner loading-sm text-primary" />
                  </div>
                ) : friends.length === 0 ? (
                  <NoFriendsFound compact />
                ) : (
                  <div className="space-y-3">
                    {/* HANYA TAMPILKAN 1 CONNECTION */}
                    {friends.slice(0, 1).map((friend) => (
                      <FriendCard key={friend._id} friend={friend} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Suggested Connections */}
            <div className="card bg-base-100 shadow-md rounded-xl">
              <div className="card-body p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-success to-emerald-500 flex items-center justify-center">
                    <UserPlusIcon className="size-4 text-base-100" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">
                      {isClient ? "Team Members" : "Suggestions"}
                    </h3>
                    <p className="text-xs opacity-60">
                      {isClient ? "Connect with team" : "Grow your network"}
                    </p>
                  </div>
                </div>

                {loadingUsers ? (
                  <div className="flex justify-center py-4">
                    <span className="loading loading-spinner loading-sm text-primary" />
                  </div>
                ) : shuffledRecommendedUsers.length === 0 ? (
                  <div className="text-center py-4 opacity-70">
                    <p className="text-xs">
                      {isClient
                        ? "No team members available"
                        : "No suggestions"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {shuffledRecommendedUsers.map((user) => {
                      const hasRequestBeenSent =
                        localOutgoingIds.has(user._id) ||
                        outgoingRequestsIds.has(user._id);

                      return (
                        <div
                          key={user._id}
                          className="flex items-center gap-3 p-2 border border-base-300 rounded-lg hover:border-primary/30 transition-colors"
                        >
                          <img
                            src={user.profilePic || "/default-avatar.png"}
                            alt={user.fullName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">
                              {user.fullName}
                            </p>
                            {user.position && (
                              <p className="text-[10px] opacity-70 truncate">
                                {user.position}
                              </p>
                            )}
                          </div>
                          <button
                            className={`btn btn-xs ${
                              hasRequestBeenSent
                                ? "btn-disabled opacity-60"
                                : "btn-outline btn-primary"
                            }`}
                            onClick={() => sendRequestMutation(user._id)}
                            disabled={hasRequestBeenSent || isPending}
                          >
                            {hasRequestBeenSent ? "Sent" : "Add"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <QuickStats />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateStory && (
        <StoryCreateModal
          isOpen={showCreateStory}
          onClose={() => setShowCreateStory(false)}
        />
      )}

      {showNoteModal && (
        <ProjectNoteModal
          projectId={selectedProjectId}
          isOpen={showNoteModal}
          onClose={() => setShowNoteModal(false)}
        />
      )}

      {showStories && (
        <StoriesCarousel
          onClose={() => setShowStories(false)}
          initialStoryIndex={selectedStoryIndex}
          initialUserIndex={selectedUserIndex}
        />
      )}

      {showProjectModal && (
        <ProjectCreateModal
          isOpen={showProjectModal}
          onClose={() => setShowProjectModal(false)}
          availableEmployees={availableEmployees}
        />
      )}

      {/* Post Form Modal */}
      <dialog id="post-form-modal" className="modal">
        <div className="modal-box max-w-2xl">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <PostForm
            onClose={() => document.getElementById("post-form-modal")?.close()}
            initialType={postFormType}
          />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* FAB for Stories - Mobile */}
      {!isClient && (
        <button
          onClick={() => setShowCreateStory(true)}
          className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-primary to-secondary rounded-full shadow-xl flex items-center justify-center z-40"
        >
          <Camera className="size-6 text-base-100" />
        </button>
      )}
    </div>
  );
};

export default HomePage;
