// PostCard.jsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likePost, deletePost } from "../lib/api";
import {
  Heart,
  MessageCircle,
  Trash2,
  MoreVertical,
  Edit2,
  PlayCircle,
  Image as ImageIcon,
  AlertCircle,
  MapPin,
  Calendar,
  Smile,
} from "lucide-react";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import PostForm from "./PostForm"; // Import PostForm untuk edit

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const PostCard = ({ post }) => {
  const queryClient = useQueryClient();
  const [showOptions, setShowOptions] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mediaSrc, setMediaSrc] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [mediaError, setMediaError] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser?.user?._id || currentUser?._id;

  const postUserId = typeof post.user === "string" ? post.user : post.user?._id;
  const isOwner = currentUserId === postUserId;

  // Mood icons mapping
  const moodIcons = {
    happy: "😊",
    sad: "😢",
    angry: "😡",
    love: "😍",
    laugh: "😂",
    thinking: "🤔",
    sleepy: "😴",
    excited: "🤩",
  };

  // Setup media source
  useEffect(() => {
    if (post.imageUrl) {
      let url = post.imageUrl;
      if (!url.startsWith("http") && !url.startsWith("blob:")) {
        if (!url.startsWith("/")) {
          url = "/" + url;
        }
        url = `${API_BASE_URL}${url}`;
      }
      setMediaSrc(url);
      setMediaType("image");
      setMediaError(false);
    } else if (post.videoUrl) {
      let url = post.videoUrl;
      if (!url.startsWith("http") && !url.startsWith("blob:")) {
        if (!url.startsWith("/")) {
          url = "/" + url;
        }
        url = `${API_BASE_URL}${url}`;
      }
      setMediaSrc(url);
      setMediaType("video");
      setMediaError(false);
    } else {
      setMediaSrc(null);
      setMediaType(null);
      setMediaError(false);
    }
  }, [post.imageUrl, post.videoUrl]);

  const handleImageError = () => {
    console.error("❌ Failed to load image:", mediaSrc);
    setMediaError(true);
  };

  const handleVideoError = () => {
    console.error("❌ Failed to load video:", mediaSrc);
    setMediaError(true);
  };

  const { mutate: likeMutation } = useMutation({
    mutationFn: () => likePost(post._id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }),
  });

  const { mutate: deleteMutation, isPending: isDeleting } = useMutation({
    mutationFn: () => deletePost(post._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setOpenDeleteModal(false);
    },
  });

  const likeCount = post.likes?.length || 0;
  const commentCount = post.comments?.length || 0;
  const hasMedia = !!post.imageUrl || !!post.videoUrl;
  const hasContent = post.content && post.content.trim() !== "";
  const hasLocation = !!post.location?.name;
  const hasEventDate = !!post.eventDate;
  const hasMood = !!post.mood;

  // Format event date
  const formatEventDate = () => {
    if (!post.eventDate) return "";
    const date = new Date(post.eventDate);
    const now = new Date();
    const diffTime = Math.abs(date - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 7) return `In ${diffDays} days`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <>
      {isEditing ? (
        // Edit Mode - Show PostForm
        <div className="mb-4">
          <PostForm
            postId={post._id}
            initialData={{
              content: post.content,
              imageUrl: post.imageUrl,
              videoUrl: post.videoUrl,
              location: post.location,
              eventDate: post.eventDate,
              mood: post.mood,
            }}
            isEditMode={true}
            onClose={() => setIsEditing(false)}
          />
        </div>
      ) : (
        // View Mode - Show Post Card
        <div className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition-all duration-300 mb-4">
          <div className="card-body p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="avatar">
                  <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-1">
                    <img
                      src={post.user?.profilePic || "/default-avatar.png"}
                      alt={post.user?.fullName}
                      className="object-cover"
                      onError={(e) => {
                        e.target.src = "/default-avatar.png";
                      }}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm">
                    {post.user?.fullName}
                  </h3>
                  <p className="text-[11px] opacity-70">
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>

              {/* Owner Options */}
              {isOwner && (
                <div className="relative">
                  <button
                    onClick={() => setShowOptions(!showOptions)}
                    className="btn btn-ghost btn-xs btn-circle"
                  >
                    <MoreVertical className="size-4" />
                  </button>

                  {showOptions && (
                    <div className="absolute right-0 mt-2 w-32 bg-base-100 border border-base-300 rounded-lg shadow-lg z-20">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowOptions(false);
                        }}
                        className="w-full px-3 py-2 text-xs hover:bg-base-200 flex items-center gap-2"
                      >
                        <Edit2 className="size-3" /> Edit
                      </button>
                      <button
                        onClick={() => {
                          setOpenDeleteModal(true);
                          setShowOptions(false);
                        }}
                        className="w-full px-3 py-2 text-xs text-error hover:bg-base-200 flex items-center gap-2"
                      >
                        <Trash2 className="size-3" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Content */}
            {hasContent && (
              <p className="mb-3 text-sm whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>
            )}

            {(hasLocation || hasEventDate || hasMood) && (
              <div className="flex flex-wrap gap-2 mb-3">
                {hasLocation && (
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${post.location.lat}&mlon=${post.location.lng}#map=18/${post.location.lat}/${post.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="badge badge-outline badge-sm flex items-center gap-1 hover:badge-primary cursor-pointer"
                  >
                    <MapPin className="size-3" />
                    {post.location.name}
                  </a>
                )}

                {hasEventDate && (
                  <div className="badge badge-outline badge-sm flex items-center gap-1">
                    <Calendar className="size-3" />
                    {formatEventDate()}
                  </div>
                )}

                {hasMood && (
                  <div className="badge badge-outline badge-sm flex items-center gap-1">
                    <span className="text-sm">
                      {moodIcons[post.mood] || "😊"}
                    </span>
                    {post.mood.charAt(0).toUpperCase() + post.mood.slice(1)}
                  </div>
                )}
              </div>
            )}

            {/* Icon indicator if no content but has media */}
            {!hasContent && hasMedia && (
              <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
                {post.imageUrl ? (
                  <ImageIcon className="size-4" />
                ) : (
                  <PlayCircle className="size-4" />
                )}
                <span>Shared a {post.imageUrl ? "photo" : "video"}</span>
              </div>
            )}

            {/* Media (Image or Video) */}
            {mediaSrc && (
              <div className="mb-3 rounded-lg overflow-hidden border border-base-300">
                {mediaError ? (
                  <div className="flex flex-col items-center justify-center p-8 bg-base-200 text-center">
                    <AlertCircle className="size-12 text-error mb-3" />
                    <p className="font-medium">Media Failed to Load</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Could not load {mediaType === "image" ? "image" : "video"}
                    </p>
                  </div>
                ) : mediaType === "image" ? (
                  <img
                    src={mediaSrc}
                    alt="Post"
                    className="w-full max-h-[500px] object-contain bg-base-200"
                    loading="lazy"
                    onError={handleImageError}
                  />
                ) : mediaType === "video" ? (
                  <div className="relative">
                    <video
                      src={mediaSrc}
                      controls
                      className="w-full max-h-[500px] bg-black"
                      onError={handleVideoError}
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                      Video
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-base-300">
              <div className="flex items-center gap-5">
                <button
                  onClick={() => likeMutation()}
                  className="flex items-center gap-1 btn btn-ghost btn-xs"
                >
                  <Heart
                    className={`size-4 ${
                      post.likes?.includes(currentUserId)
                        ? "fill-red-500 text-red-500"
                        : ""
                    }`}
                  />
                  <span className="text-xs">{likeCount}</span>
                </button>

                {/* COMMENT BUTTON */}
                <button className="flex items-center gap-1 btn btn-ghost btn-xs">
                  <MessageCircle className="size-4" />
                  <span className="text-xs">{commentCount}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {openDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-xs text-center">
            <h3 className="font-bold text-sm mb-2">Delete Post?</h3>
            <p className="text-xs opacity-70 mb-4">
              This action cannot be undone.
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setOpenDeleteModal(false)}
                className="btn btn-sm"
              >
                No
              </button>

              <button
                onClick={() => deleteMutation()}
                className="btn btn-error btn-sm"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostCard;
