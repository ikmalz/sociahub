import React from "react";
import { useQuery } from "@tanstack/react-query";
import FriendCard from "../components/FriendCard";
import PageLoader from "../components/PageLoader";
import { getUserFriends } from "../lib/api";

const FriendsPage = () => {
  const { data: friends = [], isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends, 
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-base-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Connections</h1>
          <p className="text-base-content/70">
            {friends.length} {friends.length === 1 ? 'colleague' : 'colleagues'} connected
          </p>
        </div>

        {friends.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-base-200 rounded-full flex items-center justify-center">
              <span className="text-4xl">👥</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">No connections yet</h3>
            <p className="opacity-70 max-w-md mx-auto">
              Start connecting with your colleagues to collaborate and communicate
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {friends.map((friend) => (
              <FriendCard key={friend._id} friend={friend} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPage;