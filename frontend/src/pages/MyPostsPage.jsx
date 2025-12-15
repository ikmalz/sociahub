import React from "react";
import { FileText } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import useMyPosts from "../hooks/useMyPosts"; 
import PostCard from "../components/PostCard";

const MyPostsPage = () => {
  const { authUser } = useAuthUser();
  const { data: posts = [], isLoading } = useMyPosts();

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-5">
        <h1 className="text-lg font-bold">My Posts</h1>
        <p className="text-sm opacity-70">
          All posts you’ve shared
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <span className="loading loading-spinner loading-md" />
        </div>
      ) : posts.length === 0 ? (
        <div className="card bg-base-200 border border-base-300 p-6 text-center">
          <FileText className="size-10 mx-auto opacity-40 mb-3" />
          <p className="font-medium text-sm">No posts yet</p>
          <p className="text-xs opacity-70">
            Start sharing your first post
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPostsPage;