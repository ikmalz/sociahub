import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  Building, 
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Calendar,
  Target,
  Loader2
} from "lucide-react";
import { getAdminAllProjects } from "../lib/api"; 
import useAuthUser from "../hooks/useAuthUser";
import PageLoader from "../components/PageLoader";

const AdminProgressPage = () => {
  const { authUser } = useAuthUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("progress-desc");
  const [expandedProject, setExpandedProject] = useState(null);

  const { data: allProjects = [], isLoading } = useQuery({
    queryKey: ["admin-all-projects"],
    queryFn: () => getAdminAllProjects(),
    enabled: authUser?.role === "admin",
  });

  // Calculate statistics
  const stats = {
    totalProjects: allProjects.length,
    completedProjects: allProjects.filter(p => p.status === 'completed').length,
    activeProjects: allProjects.filter(p => p.status === 'active').length,
    pendingProjects: allProjects.filter(p => !p.status || p.status === 'pending').length,
    averageProgress: allProjects.length > 0 
      ? Math.round(allProjects.reduce((sum, p) => sum + (p.progress || 0), 0) / allProjects.length)
      : 0,
    totalTeamMembers: allProjects.reduce((sum, p) => sum + (p.employees?.length || 0), 0),
  };

  // Filter and sort projects
  const filteredProjects = React.useMemo(() => {
    let filtered = allProjects;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch(sortBy) {
        case "progress-desc":
          return (b.progress || 0) - (a.progress || 0);
        case "progress-asc":
          return (a.progress || 0) - (b.progress || 0);
        case "date-desc":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "date-asc":
          return new Date(a.createdAt) - new Date(b.createdAt);
        default:
          return 0;
      }
    });

    return filtered;
  }, [allProjects, searchTerm, statusFilter, sortBy]);

  // Get status badge color
  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'badge-success';
      case 'active': return 'badge-primary';
      case 'pending': return 'badge-warning';
      default: return 'badge-neutral';
    }
  };

  // Get progress color class
  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-success';
    if (progress >= 50) return 'bg-primary';
    if (progress >= 20) return 'bg-warning';
    return 'bg-error';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const toggleProjectExpand = (projectId) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-base-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-base-content mb-2">Project Dashboard</h1>
          <p className="text-base-content/60">Monitor and track all project progress</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-base-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/60">Total Projects</p>
                <p className="text-2xl font-bold">{stats.totalProjects}</p>
              </div>
              <Briefcase className="size-8 text-primary opacity-70" />
            </div>
          </div>

          <div className="bg-base-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/60">Avg. Progress</p>
                <p className="text-2xl font-bold">{stats.averageProgress}%</p>
              </div>
              <TrendingUp className="size-8 text-success opacity-70" />
            </div>
          </div>

          <div className="bg-base-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/60">Active</p>
                <p className="text-2xl font-bold">{stats.activeProjects}</p>
              </div>
              <Users className="size-8 text-info opacity-70" />
            </div>
          </div>

          <div className="bg-base-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/60">Completed</p>
                <p className="text-2xl font-bold">{stats.completedProjects}</p>
              </div>
              <CheckCircle className="size-8 text-success opacity-70" />
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-base-200 rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-base-content/40" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="input input-bordered w-full pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select 
                className="select select-bordered select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>

              <select 
                className="select select-bordered select-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="progress-desc">Progress (High to Low)</option>
                <option value="progress-asc">Progress (Low to High)</option>
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Projects ({filteredProjects.length})
            </h2>
            <div className="text-sm text-base-content/60">
              Showing {filteredProjects.length} of {allProjects.length}
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="size-12 mx-auto mb-4 text-base-content/30" />
              <p className="text-base-content/60">No projects found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProjects.map((project) => (
                <div 
                  key={project._id} 
                  className="bg-base-200 rounded-xl border border-base-300 hover:border-primary/30 transition-colors"
                >
                  {/* Project Header - Always Visible */}
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => toggleProjectExpand(project._id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg truncate flex-1">
                            {project.title}
                          </h3>
                          <span className={`badge ${getStatusColor(project.status)}`}>
                            {project.status || 'pending'}
                          </span>
                        </div>
                        
                        {project.client && (
                          <div className="flex items-center gap-2 text-sm text-base-content/70 mb-3">
                            <Building className="size-3" />
                            <span className="truncate">
                              {project.client.fullName}
                              {project.client.institutionName && ` • ${project.client.institutionName}`}
                            </span>
                          </div>
                        )}

                        {/* Progress Bar */}
                        <div className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span className="font-semibold">{project.progress || 0}%</span>
                          </div>
                          <div className="w-full h-2 bg-base-300 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${getProgressColor(project.progress || 0)} transition-all duration-300`}
                              style={{ width: `${project.progress || 0}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="ml-4">
                        {expandedProject === project._id ? (
                          <ChevronUp className="size-5 text-base-content/40" />
                        ) : (
                          <ChevronDown className="size-5 text-base-content/40" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Content */}
                  {expandedProject === project._id && (
                    <div className="px-4 pb-4 border-t border-base-300 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Left Column */}
                        <div className="space-y-4">
                          {project.description && (
                            <div>
                              <p className="text-sm font-medium mb-2">Description</p>
                              <p className="text-sm text-base-content/70 bg-base-100 p-3 rounded-lg">
                                {project.description}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="size-4 text-base-content/50" />
                              <span>Created: {formatDate(project.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="size-4 text-base-content/50" />
                              <span>Updated: {formatDate(project.updatedAt)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                          {/* Team Members */}
                          {project.employees && project.employees.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2">
                                Team ({project.employees.length})
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {project.employees.slice(0, 5).map((employee, index) => (
                                  <div 
                                    key={index} 
                                    className="flex items-center gap-2 bg-base-100 px-3 py-2 rounded-lg"
                                    title={employee.fullName}
                                  >
                                    <div className="avatar">
                                      <div className="w-6 h-6 rounded-full">
                                        <img 
                                          src={employee.profilePic || "/default-avatar.png"} 
                                          alt={employee.fullName}
                                          className="object-cover"
                                        />
                                      </div>
                                    </div>
                                    <span className="text-sm truncate max-w-[100px]">
                                      {employee.fullName}
                                    </span>
                                  </div>
                                ))}
                                {project.employees.length > 5 && (
                                  <div className="bg-base-100 px-3 py-2 rounded-lg">
                                    <span className="text-sm">+{project.employees.length - 5} more</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats Footer */}
        <div className="mt-8 pt-6 border-t border-base-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-base-200 rounded-xl">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertCircle className="size-5 text-warning" />
                <span className="font-medium">Needs Attention</span>
              </div>
              <p className="text-2xl font-bold">
                {allProjects.filter(p => (p.progress || 0) < 20).length}
              </p>
            </div>

            <div className="text-center p-4 bg-base-200 rounded-xl">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="size-5 text-primary" />
                <span className="font-medium">On Track</span>
              </div>
              <p className="text-2xl font-bold">
                {allProjects.filter(p => (p.progress || 0) >= 20 && (p.progress || 0) < 80).length}
              </p>
            </div>

            <div className="text-center p-4 bg-base-200 rounded-xl">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BarChart3 className="size-5 text-success" />
                <span className="font-medium">Almost Done</span>
              </div>
              <p className="text-2xl font-bold">
                {allProjects.filter(p => (p.progress || 0) >= 80).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProgressPage;