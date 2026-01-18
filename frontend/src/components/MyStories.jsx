import { useState } from "react";
import { Trash2, Eye, Clock, Camera, Video } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyStories, deleteStory } from "../lib/api";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

const MyStories = () => {
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  
  const { data: storiesData, isLoading } = useQuery({
    queryKey: ["my-stories"],
    queryFn: getMyStories,
  });
  
  const { mutate: deleteStoryMutation, isPending: isDeleting } = useMutation({
    mutationFn: deleteStory,
    onSuccess: () => {
      toast.success("Story deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["my-stories"] });
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      setShowDeleteModal(null);
    },
    onError: (error) => {
      console.error("Delete story error:", error);
      toast.error("Failed to delete story");
    },
  });
  
  const stories = storiesData?.stories || [];
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }
  
  return (
    <div className="bg-base-100 rounded-xl p-6">
      <h3 className="text-lg font-bold mb-4">My Stories</h3>
      
      {stories.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-3 bg-base-200 rounded-full flex items-center justify-center">
            <Camera className="size-8 opacity-40" />
          </div>
          <p className="opacity-70">You haven't posted any stories yet</p>
          <p className="text-sm opacity-50 mt-1">Stories disappear after 24 hours</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {stories.map((story) => (
            <div key={story._id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border border-base-300 bg-base-200">
                {story.mediaType === "image" ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL}${story.mediaUrl}`}
                    alt="Story"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-black flex items-center justify-center">
                    <div className="text-base-100 text-center">
                      <Video className="size-8 mx-auto mb-2" />
                      <div className="text-xs">Video Story</div>
                    </div>
                  </div>
                )}
                
                {/* Overlay with info */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowDeleteModal(story._id)}
                      className="btn btn-error btn-xs"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                  
                  <div className="text-base-100 text-xs">
                    <div className="flex items-center gap-1">
                      <Eye className="size-3" />
                      <span>{story.views?.length || 0} views</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="size-3" />
                      <span>
                        Expires {formatDistanceToNow(new Date(story.expiresAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {story.caption && (
                <p className="text-xs truncate mt-1 opacity-70 px-1">{story.caption}</p>
              )}
            </div>
          ))}
        </div>
      )}
      
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <h3 className="text-lg font-bold mb-4">Delete Story?</h3>
            <p className="mb-6">This story will be permanently deleted.</p>
            
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="btn btn-outline btn-sm"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteStoryMutation(showDeleteModal)}
                className="btn btn-error btn-sm"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyStories;