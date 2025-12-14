import React from "react";

const PostCardSkeleton = () => {
  return (
    <div className="break-inside-avoid mb-5">
      <div className="card bg-base-100 border border-base-300 overflow-hidden shadow-sm h-full flex flex-col animate-pulse">
        {/* HEADER SKELETON */}
        <div className="card-body p-4 pb-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="avatar">
                <div className="w-8 h-8 rounded-full bg-base-300 ring ring-primary ring-offset-1" />
              </div>

              <div className="min-w-0 space-y-2">
                <div className="h-3 w-24 bg-base-300 rounded" />
                <div className="h-2 w-16 bg-base-300 rounded" />
              </div>
            </div>

            <div className="btn btn-ghost btn-xs btn-circle bg-base-300 opacity-50" />
          </div>

          {/* CONTENT SKELETON */}
          <div className="space-y-2 mb-3">
            <div className="h-3 bg-base-300 rounded w-full" />
            <div className="h-3 bg-base-300 rounded w-4/5" />
            <div className="h-3 bg-base-300 rounded w-3/5" />
          </div>

          {/* BADGES SKELETON */}
          <div className="flex flex-wrap gap-1 mb-3">
            <div className="h-5 w-16 bg-base-300 rounded-full" />
            <div className="h-5 w-12 bg-base-300 rounded-full" />
            <div className="h-5 w-14 bg-base-300 rounded-full" />
          </div>
        </div>

        {/* MEDIA SKELETON */}
        <div className="bg-base-200 h-48 w-full flex items-center justify-center">
          <div className="text-base-300">
            <svg
              className="w-12 h-12"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* ACTIONS SKELETON */}
        <div className="card-body p-4 pt-2">
          <div className="flex items-center justify-between pt-2 border-t border-base-300">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="h-4 w-4 bg-base-300 rounded" />
                <div className="h-3 w-6 bg-base-300 rounded" />
              </div>
              <div className="flex items-center gap-1">
                <div className="h-4 w-4 bg-base-300 rounded" />
                <div className="h-3 w-6 bg-base-300 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCardSkeleton;