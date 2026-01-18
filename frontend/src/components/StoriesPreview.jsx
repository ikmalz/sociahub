// components/StoriesPreview.jsx - KEMBALIKAN SEPERTI INI
import { useState } from "react";
import { Plus, Users, Camera } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getTimelineStories } from "../lib/api";
import StoriesCarousel from "./StoriesCarousel";

const StoriesPreview = ({ onCreateStory }) => {
  const { data: storiesData } = useQuery({
    queryKey: ["stories"],
    queryFn: getTimelineStories,
  });

  const [showStories, setShowStories] = useState(false);
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);

  const stories = storiesData?.stories || [];
  const hasUnviewedStories = stories.some(story => story.hasUnviewed);

  const handleUserClick = (index) => {
    setSelectedUserIndex(index);
    setShowStories(true);
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Stories</h3>
          <p className="text-sm opacity-70">Your friends' updates</p>
        </div>
        
        <div className="flex items-center gap-4 overflow-x-auto pb-2">
          {/* Create Story Card */}
          <button
            onClick={onCreateStory}
            className="flex-shrink-0 w-24 flex flex-col items-center group"
          >
            <div className="relative w-20 h-20 rounded-full border-2 border-dashed border-base-300 flex items-center justify-center mb-2 hover:border-primary transition-colors group-hover:scale-105">
              <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center">
                <Plus className="size-8 opacity-40 group-hover:opacity-70" />
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-base-100">
                <Camera className="size-4 text-base-100" />
              </div>
            </div>
            <span className="text-xs font-medium">Your Story</span>
          </button>

          {/* Friends' Stories */}
          {stories.map((userStory, index) => (
            <button
              key={userStory.user._id}
              onClick={() => handleUserClick(index)}
              className="flex-shrink-0 w-24 flex flex-col items-center group"
            >
              <div className="relative w-20 h-20 mb-2 group-hover:scale-105 transition-transform">
                <div className={`w-full h-full rounded-full p-1 ${
                  userStory.hasUnviewed 
                    ? 'bg-gradient-to-r from-primary to-secondary' 
                    : 'bg-base-300'
                }`}>
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-base-100">
                    <img
                      src={userStory.user.profilePic || "/default-avatar.png"}
                      alt={userStory.user.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                {userStory.storyCount > 1 && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center border-2 border-base-100">
                    <span className="text-xs font-bold text-base-100">
                      {userStory.storyCount}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-xs font-medium truncate max-w-full px-1">
                {userStory.user.fullName}
              </span>
            </button>
          ))}

          {/* No Stories State */}
          {stories.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center py-6">
              <Users className="size-12 opacity-30 mb-3" />
              <p className="opacity-70 text-sm">No stories yet</p>
              <p className="opacity-50 text-xs">Be the first to share!</p>
            </div>
          )}
        </div>
      </div>

      {/* Stories Carousel Modal */}
      {showStories && (
        <StoriesCarousel
          onClose={() => setShowStories(false)}
          initialUserIndex={selectedUserIndex}
        />
      )}
    </>
  );
};

export default StoriesPreview;