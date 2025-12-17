import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import FriendCard from "../components/FriendCard";
import PageLoader from "../components/PageLoader";
import { getUserFriends } from "../lib/api";
import {
  SearchIcon,
  UsersIcon,
  Building2Icon,
  BriefcaseIcon,
  XIcon,
  UserPlusIcon,
  FilterIcon,
  ChevronDownIcon,
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
    <div className="min-h-screen bg-base-100 p-3 md:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Compact Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold">Connections</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-base-content/70">
                  {friends.length} total • {onlineCount} online
                </span>
                {departments.length > 0 && (
                  <span className="text-xs text-base-content/70">
                    • {departments.length} departments
                  </span>
                )}
              </div>
            </div>

            <Link
              to="/network"
              className="btn btn-primary btn-sm gap-1.5"
            >
              <UserPlusIcon className="size-3.5" />
              <span className="hidden sm:inline text-xs">Add</span>
            </Link>
          </div>

          {/* Compact Search Bar */}
          <div className="card bg-base-100 border border-base-300 mb-3">
            <div className="card-body p-3">
              <div className="flex gap-2">
                {/* Search */}
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <SearchIcon className="size-3.5 text-base-content/50" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search connections..."
                    className="input input-bordered input-sm w-full pl-8 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center"
                    >
                      <XIcon className="size-3 text-base-content/50" />
                    </button>
                  )}
                </div>

                {/* Filter Toggle */}
                <button
                  className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FilterIcon className="size-3.5" />
                </button>
              </div>

              {/* Compact Filters */}
              {showFilters && (
                <div className="mt-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Department Filter */}
                    <div>
                      <label className="label py-0">
                        <span className="label-text text-xs">Department</span>
                      </label>
                      <div className="relative">
                        <Building2Icon className="absolute left-2 top-1/2 transform -translate-y-1/2 size-3 text-base-content/50" />
                        <select
                          className="select select-bordered select-sm w-full pl-7 text-xs"
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
                      <label className="label py-0">
                        <span className="label-text text-xs">Position</span>
                      </label>
                      <div className="relative">
                        <BriefcaseIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 size-3 text-base-content/50" />
                        <select
                          className="select select-bordered select-sm w-full pl-7 text-xs"
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
                    <div className="flex flex-wrap items-center gap-1 text-xs">
                      <span className="text-base-content/60">Filters:</span>
                      {selectedDepartment !== "all" && (
                        <div className="badge badge-outline badge-xs gap-0.5">
                          <Building2Icon className="size-2" />
                          {selectedDepartment}
                          <button onClick={() => setSelectedDepartment("all")}>
                            <XIcon className="size-2" />
                          </button>
                        </div>
                      )}
                      {selectedPosition !== "all" && (
                        <div className="badge badge-outline badge-xs gap-0.5">
                          <BriefcaseIcon className="size-2" />
                          {selectedPosition}
                          <button onClick={() => setSelectedPosition("all")}>
                            <XIcon className="size-2" />
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setSelectedDepartment("all");
                          setSelectedPosition("all");
                        }}
                        className="text-primary text-xs hover:underline ml-1"
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
          <div className="alert alert-error alert-sm">
            <span className="text-xs">Error: {error.message}</span>
          </div>
        ) : filteredFriends.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-3 bg-base-200 rounded-full flex items-center justify-center">
              <UsersIcon className="size-8 text-base-content/40" />
            </div>
            <h3 className="text-sm font-semibold mb-1">
              {friends.length === 0 ? "No connections yet" : "No matches"}
            </h3>
            <p className="text-xs opacity-70 max-w-xs mx-auto mb-3">
              {friends.length === 0
                ? "Connect with colleagues to get started"
                : "Try different search or filters"}
            </p>
            {friends.length === 0 && (
              <Link to="/network" className="btn btn-primary btn-sm gap-1.5">
                <UserPlusIcon className="size-3.5" />
                <span className="text-xs">Find Connections</span>
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold">
                  {filteredFriends.length} connection{filteredFriends.length !== 1 ? 's' : ''}
                </h2>
                {friends.length !== filteredFriends.length && (
                  <p className="text-xs text-base-content/70">
                    of {friends.length} total
                  </p>
                )}
              </div>
              <div className="text-xs text-base-content/70 flex items-center gap-1">
                <FilterIcon className="size-3" />
                <span>Filtered</span>
              </div>
            </div>

            {/* Compact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {filteredFriends.map((friend) => (
                <FriendCard key={friend._id} friend={friend} />
              ))}
            </div>

            {/* Department Stats (Compact) */}
            {departments.length > 1 && filteredFriends.length > 0 && (
              <div className="mt-6 pt-4 border-t border-base-300">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold">By Department</h3>
                  <ChevronDownIcon className="size-3.5 text-base-content/50" />
                </div>
                <div className="space-y-2">
                  {departments.slice(0, 3).map((dept) => {
                    const count = friends.filter((f) => f.department === dept).length;
                    const percentage = friends.length > 0 ? Math.round((count / friends.length) * 100) : 0;
                    
                    return (
                      <div key={dept} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <Building2Icon className="size-3 text-base-content/60" />
                          <span className="truncate max-w-[100px]">{dept}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-base-200 rounded-full h-1.5">
                            <div 
                              className="bg-primary h-1.5 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="font-medium min-w-8 text-right text-xs">
                            {count}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {departments.length > 3 && (
                    <div className="text-center pt-1">
                      <button className="text-primary text-xs hover:underline">
                        +{departments.length - 3} more departments
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