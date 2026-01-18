import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import FriendCard from "../components/FriendCard";
import PageLoader from "../components/PageLoader";
import { getUserFriends } from "../lib/api";
import {
  Search,
  Users,
  Building2,
  Briefcase,
  X,
  UserPlus,
  Filter,
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router";

const FriendsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedPosition, setSelectedPosition] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const { data: friends = [], isLoading, error } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  if (isLoading) return <PageLoader />;

  // Filter friends
  const getFilteredFriends = () => {
    let filtered = friends;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (friend) =>
          friend.fullName?.toLowerCase().includes(term) ||
          friend.email?.toLowerCase().includes(term) ||
          friend.position?.toLowerCase().includes(term) ||
          friend.department?.toLowerCase().includes(term)
      );
    }

    if (selectedDepartment !== "all") {
      filtered = filtered.filter(
        (friend) => friend.department === selectedDepartment
      );
    }

    if (selectedPosition !== "all") {
      filtered = filtered.filter(
        (friend) => friend.position === selectedPosition
      );
    }

    return filtered;
  };

  const filteredFriends = getFilteredFriends();

  // Get unique values for filters
  const departments = [
    ...new Set(
      friends
        .map((friend) => friend.department)
        .filter((dept) => dept && dept.trim() !== "")
    ),
  ];

  const positions = [
    ...new Set(
      friends
        .map((friend) => friend.position)
        .filter((pos) => pos && pos.trim() !== "")
    ),
  ];

  // Stats
  const onlineCount = friends.filter((f) => f.isActive).length || 0;

  return (
    <div className="min-h-screen bg-base-100 px-3 py-4">
      <div className="max-w-7xl mx-auto">
        {/* Compact Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Connections</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs opacity-60">
                  {friends.length} total • {onlineCount} online
                </span>
                {departments.length > 0 && (
                  <span className="text-xs opacity-60">
                    • {departments.length} dept
                  </span>
                )}
              </div>
            </div>

            <Link
              to="/network"
              className="btn btn-primary btn-sm h-8 px-2 gap-1"
            >
              <UserPlus className="size-3" />
              <span className="text-xs">Add</span>
            </Link>
          </div>

          {/* Compact Search Bar */}
          <div className="card bg-base-100 border border-base-300 mb-3">
            <div className="card-body p-3">
              <div className="flex gap-1.5">
                {/* Search */}
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <Search className="size-3 text-base-content/40" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search connections..."
                    className="input input-bordered input-sm h-8 w-full pl-7 text-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center"
                    >
                      <X className="size-2.5 text-base-content/40" />
                    </button>
                  )}
                </div>

                {/* Filter Toggle */}
                <button
                  className={`btn btn-sm h-8 w-8 p-0 ${showFilters ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="size-3" />
                </button>
              </div>

              {/* Compact Filters */}
              {showFilters && (
                <div className="mt-2.5 space-y-1.5">
                  <div className="grid grid-cols-2 gap-1.5">
                    {/* Department Filter */}
                    <div>
                      <label className="label py-0.5">
                        <span className="label-text text-xs opacity-70">Department</span>
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-2 top-1/2 transform -translate-y-1/2 size-2.5 text-base-content/40" />
                        <select
                          className="select select-bordered select-sm h-7 w-full pl-6 text-xs"
                          value={selectedDepartment}
                          onChange={(e) => setSelectedDepartment(e.target.value)}
                        >
                          <option value="all">All</option>
                          {departments.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Position Filter */}
                    <div>
                      <label className="label py-0.5">
                        <span className="label-text text-xs opacity-70">Position</span>
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-2 top-1/2 transform -translate-y-1/2 size-2.5 text-base-content/40" />
                        <select
                          className="select select-bordered select-sm h-7 w-full pl-6 text-xs"
                          value={selectedPosition}
                          onChange={(e) => setSelectedPosition(e.target.value)}
                        >
                          <option value="all">All</option>
                          {positions.map((pos) => (
                            <option key={pos} value={pos}>
                              {pos}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Active Filters */}
                  {(selectedDepartment !== "all" || selectedPosition !== "all") && (
                    <div className="flex flex-wrap items-center gap-1 text-[11px]">
                      <span className="opacity-60">Filters:</span>
                      {selectedDepartment !== "all" && (
                        <div className="badge badge-outline badge-xs h-4 gap-0.5 px-1">
                          <Building2 className="size-1.5" />
                          <span className="truncate max-w-16">{selectedDepartment}</span>
                          <button 
                            onClick={() => setSelectedDepartment("all")}
                            className="hover:opacity-70"
                          >
                            <X className="size-1.5" />
                          </button>
                        </div>
                      )}
                      {selectedPosition !== "all" && (
                        <div className="badge badge-outline badge-xs h-4 gap-0.5 px-1">
                          <Briefcase className="size-1.5" />
                          <span className="truncate max-w-16">{selectedPosition}</span>
                          <button 
                            onClick={() => setSelectedPosition("all")}
                            className="hover:opacity-70"
                          >
                            <X className="size-1.5" />
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setSelectedDepartment("all");
                          setSelectedPosition("all");
                        }}
                        className="text-primary text-[11px] hover:underline ml-1"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {error ? (
          <div className="alert alert-error alert-sm py-2">
            <span className="text-xs">Error loading connections</span>
          </div>
        ) : filteredFriends.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-2.5 bg-base-200 rounded-full flex items-center justify-center">
              <Users className="size-5 opacity-40" />
            </div>
            <h3 className="text-sm font-medium mb-0.5">
              {friends.length === 0 ? "No connections yet" : "No matches"}
            </h3>
            <p className="text-xs opacity-60 max-w-xs mx-auto mb-2.5">
              {friends.length === 0
                ? "Connect with colleagues to get started"
                : "Try different search or filters"}
            </p>
            {friends.length === 0 && (
              <Link to="/network" className="btn btn-primary btn-sm h-8 px-3 gap-1">
                <UserPlus className="size-3" />
                <span className="text-xs">Find Connections</span>
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <h2 className="text-sm font-medium">
                  {filteredFriends.length} connection{filteredFriends.length !== 1 ? 's' : ''}
                </h2>
                {friends.length !== filteredFriends.length && (
                  <p className="text-xs opacity-60">
                    of {friends.length} total
                  </p>
                )}
              </div>
              <div className="text-xs opacity-60 flex items-center gap-0.5">
                <Filter className="size-2.5" />
                <span>Filtered</span>
              </div>
            </div>

            {/* Compact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5">
              {filteredFriends.map((friend) => (
                <FriendCard key={friend._id} friend={friend} />
              ))}
            </div>

            {/* Department Stats (Compact) */}
            {departments.length > 1 && filteredFriends.length > 0 && (
              <div className="mt-5 pt-3 border-t border-base-300">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-xs font-medium">By Department</h3>
                  <ChevronDown className="size-2.5 opacity-50" />
                </div>
                <div className="space-y-1.5">
                  {departments.slice(0, 3).map((dept) => {
                    const count = friends.filter((f) => f.department === dept).length;
                    const percentage = friends.length > 0 ? Math.round((count / friends.length) * 100) : 0;
                    
                    return (
                      <div key={dept} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <Building2 className="size-2.5 opacity-50" />
                          <span className="truncate max-w-[80px]">{dept}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 bg-base-200 rounded-full h-1">
                            <div 
                              className="bg-primary h-1 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="font-medium min-w-6 text-right text-xs">
                            {count}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {departments.length > 3 && (
                    <div className="text-center pt-0.5">
                      <button className="text-primary text-xs hover:underline">
                        +{departments.length - 3} more
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;