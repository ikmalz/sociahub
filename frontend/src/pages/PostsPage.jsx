import { useQuery } from "@tanstack/react-query";
import { getPosts } from "../lib/api";
import PostCard from "../components/PostCard";
import PostCardSkeleton from "../components/PostCardSkeleton"; // Import skeleton
import { MessageSquare, Search } from "lucide-react";
import { useState } from "react";

const PostsPage = () => {
  const {
    data: posts = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60,
    cacheTime: 1000 * 60 * 5,
  });

  const [query, setQuery] = useState("");

  // Loading state
  const isLoadingData = isLoading || isFetching;

  const filteredPosts = posts.filter((p) =>
    p.content?.toLowerCase().includes(query.toLowerCase()),
  );
  const sortedPosts = [...filteredPosts].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* HEADER */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Explore Posts</h1>
            <p className="text-sm opacity-70">
              Discover photos, videos, and stories
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 opacity-50" />
            <input
              type="text"
              placeholder="Search posts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input input-bordered w-full pl-9"
            />
          </div>
        </div>

        {/* CONTENT */}
        {isLoadingData ? (
          <div
            className="
              columns-1
              sm:columns-2
              lg:columns-3
              xl:columns-4
              2xl:columns-5
              gap-5
            "
          >
            {/* Render skeleton loading */}
            {Array.from({ length: 15 }).map((_, index) => (
              <PostCardSkeleton key={`skeleton-${index}`} />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-24">
            <MessageSquare className="mx-auto size-14 opacity-30 mb-4" />
            <h3 className="font-semibold text-lg mb-1">No posts found</h3>
            <p className="opacity-70 text-sm">
              {query ? "Try another keyword" : "No posts available yet"}
            </p>
          </div>
        ) : (
          <div
            className="
              columns-1
              sm:columns-2
              lg:columns-3
              xl:columns-4
              2xl:columns-5
              gap-5
            "
          >
            {sortedPosts.map((post) => (
              <PostCard key={post._id} post={post} compact showVideo={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostsPage;
