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
  Video,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  VolumeX,
  Volume2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow, format } from "date-fns";
import PostForm from "./PostForm";
import { Link } from "react-router";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const PostCard = ({
  post,
  compact = false,
  fullscreen = false,
  showVideo = false,
  isActive = false,
}) => {
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
    setMediaError(true);
  };

  const handleVideoError = () => {
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
  const isLiked = post.likes?.includes(currentUserId);
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  const toggleSound = () => {
    if (!videoRef.current) return;

    const nextMuted = !muted;
    setMuted(nextMuted);
    videoRef.current.muted = nextMuted;
  };

  useEffect(() => {
    if (!videoRef.current) return;

    if (!isActive) {
      videoRef.current.pause();
      setIsPlaying(false);
      videoRef.current.muted = true;
    }
  }, [isActive]);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

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

  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      videoRef.current.play();
      videoRef.current.muted = muted;
    } else {
      videoRef.current.pause();
      videoRef.current.muted = true;
    }
  }, [isActive]);

  // FULLSCREEN VIEW
  if (fullscreen) {
    const isTextOnly = !mediaSrc && hasContent;

    const fullscreenVideoRef = useRef(null);

    useEffect(() => {
      if (!fullscreenVideoRef.current || mediaType !== "video") return;

      if (isActive) {
        setTimeout(() => {
          if (fullscreenVideoRef.current) {
            fullscreenVideoRef.current.play().catch((e) => {
              console.log("Autoplay prevented:", e);
            });
          }
        }, 100);
      } else {
        if (fullscreenVideoRef.current) {
          fullscreenVideoRef.current.pause();
        }
      }
    }, [isActive, mediaType]);

    useEffect(() => {
      const savedMuted = localStorage.getItem("globalVideoMuted");
      if (savedMuted !== null) {
        setMuted(savedMuted === "true");
      }
    }, []);

    const toggleSound = () => {
      const nextMuted = !muted;
      setMuted(nextMuted);
      localStorage.setItem("globalVideoMuted", String(nextMuted));
      if (fullscreenVideoRef.current) {
        fullscreenVideoRef.current.muted = nextMuted;
      }
    };

    useEffect(() => {
      const video = fullscreenVideoRef.current;
      if (!video || mediaType !== "video") return;

      const onPlay = () => setIsPlaying(true);
      const onPause = () => setIsPlaying(false);

      video.addEventListener("play", onPlay);
      video.addEventListener("pause", onPause);

      return () => {
        video.removeEventListener("play", onPlay);
        video.removeEventListener("pause", onPause);
      };
    }, [mediaType, fullscreenVideoRef.current]);

    const togglePlay = () => {
      if (!fullscreenVideoRef.current) return;

      if (fullscreenVideoRef.current.paused) {
        fullscreenVideoRef.current.play();
      } else {
        fullscreenVideoRef.current.pause();
      }
    };

    return (
      <div className="w-full min-h-[100svh] bg-base-300/20 flex justify-center">
        <div className="w-full flex justify-center">
          <div className="relative w-full min-h-[100svh] sm:w-[390px] sm:h-[88dvh] bg-base-100 overflow-hidden rounded-none sm:rounded-2xl shadow-xl flex flex-col">
            {/* TEXT ONLY */}
            {isTextOnly && (
              <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-b from-base-100 to-base-200">
                <div className="max-w-sm text-center space-y-3 px-4">
                  <p className="text-sm opacity-60">@{post.user?.fullName}</p>
                  <p className="text-lg sm:text-xl font-medium leading-relaxed">
                    {post.content}
                  </p>
                </div>
              </div>
            )}

            {mediaSrc && (
              <>
                {/* MEDIA */}
                <div className="relative flex-1 bg-black flex items-center justify-center min-h-0">
                  {mediaType === "image" ? (
                    <img
                      src={mediaSrc}
                      className="w-full h-full object-contain"
                      onError={handleImageError}
                      alt="Post media"
                    />
                  ) : (
                    <video
                      ref={fullscreenVideoRef}  
                      src={mediaSrc}
                      onClick={togglePlay}
                      className="w-full h-full object-contain"
                      muted={muted}
                      loop
                      playsInline
                      preload="metadata"
                    />
                  )}

                  {/* PLAY ICON */}
                  {mediaType === "video" && !isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <PlayCircle className="size-16 text-white/80" />
                    </div>
                  )}

                  {/* SOUND BUTTON */}
                  {mediaType === "video" && (
                    <button
                      onClick={toggleSound}
                      className="absolute top-4 right-4 text-white rounded-full bg-black/50 p-2"
                    >
                      {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                  )}

                  {/* HEADER */}
                  <div className="absolute top-4 left-4 flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-8 rounded-full">
                        <img
                          src={post.user?.profilePic || "/default-avatar.png"}
                          alt="Profile"
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {post.user?.fullName}
                      </p>
                      <p className="text-xs text-white/80">
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* BOTTOM INFO */}
                <div
                  className="shrink-0 bg-base-100 border-t border-base-200 px-4 py-3"
                  style={{
                    paddingBottom: "max(env(safe-area-inset-bottom), 20px)",
                    paddingTop: "16px",
                  }}
                >
                  {hasContent && (
                    <p className="text-sm mb-3 leading-relaxed break-words text-center sm:text-left">
                      {post.content}
                    </p>
                  )}

                  <div className="flex justify-center sm:justify-start items-center gap-6">
                    <button
                      onClick={() => likeMutation()}
                      className="flex items-center gap-2 group"
                    >
                      <Heart
                        className={`size-5 transition-colors ${
                          isLiked
                            ? "fill-error text-error"
                            : "text-neutral group-hover:text-error"
                        }`}
                      />
                      <span className="text-sm font-medium tabular-nums">
                        {likeCount}
                      </span>
                    </button>

                    <div className="flex items-center gap-2">
                      <MessageCircle className="size-5 text-neutral" />
                      <span className="text-sm font-medium tabular-nums">
                        {commentCount}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* SCROLL HINT */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 text-white/40 pointer-events-none">
              <ChevronUp className="size-4 animate-bounce" />
              <ChevronDown className="size-4 animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // posts page (COMPACT VIEW)
  if (compact) {
    return (
      <div className="break-inside-avoid mb-5 group">
        <div className="card bg-base-100 border border-base-300 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
          <div className="card-body p-4 pb-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="avatar">
                  <div className="w-8 h-8 rounded-full ring ring-primary/50 ring-offset-1 ring-offset-base-100">
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

                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate text-base-content">
                    {post.user?.fullName}
                  </p>
                  <p className="text-xs opacity-60 text-base-content/70">
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>

              {/* Owner Options (Compact) */}
              {isOwner && (
                <div className="relative">
                  <button
                    onClick={() => setShowOptions(!showOptions)}
                    className="btn btn-ghost btn-xs btn-circle hover:bg-base-200"
                  >
                    <MoreVertical className="size-3 text-base-content/70" />
                  </button>

                  {showOptions && (
                    <div className="absolute right-0 mt-2 w-32 bg-base-100 border border-base-300 rounded-lg shadow-lg z-20">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowOptions(false);
                        }}
                        className="w-full px-3 py-2 text-xs hover:bg-base-200 flex items-center gap-2 text-base-content"
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

            {/* CONTENT */}
            {hasContent && (
              <Link to={`/post/${post._id}`}>
                <p className="text-sm line-clamp-3 mb-3 hover:text-primary transition cursor-pointer text-base-content">
                  {post.content}
                </p>
              </Link>
            )}

            {/* BADGES (Location, Event Date, Mood) */}
            {(hasLocation || hasEventDate || hasMood) && (
              <div className="flex flex-wrap gap-2 mb-3">
                {hasLocation && (
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${post.location.lat}&mlon=${post.location.lng}#map=18/${post.location.lat}/${post.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="badge badge-outline badge-sm flex items-center gap-1.5 hover:badge-primary cursor-pointer px-2 py-1.5 min-h-0 h-auto border-base-300 text-base-content/80 hover:text-primary-content"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MapPin className="size-3 flex-shrink-0" />
                    <span className="truncate max-w-[90px] text-xs">
                      {post.location.name}
                    </span>
                  </a>
                )}

                {hasEventDate && (
                  <div className="badge badge-outline badge-sm flex items-center gap-1.5 px-2 py-1.5 min-h-0 h-auto border-base-300 text-base-content/80">
                    <Calendar className="size-3 flex-shrink-0" />
                    <span className="text-xs">
                      {format(new Date(post.eventDate), "MMM d")}
                    </span>
                  </div>
                )}

                {hasMood && (
                  <div className="badge badge-outline badge-sm flex items-center gap-1.5 px-2 py-1.5 min-h-0 h-auto border-base-300 text-base-content/80">
                    <span className="text-xs">
                      {moodIcons[post.mood] || "😊"}
                    </span>
                    <span className="text-xs truncate max-w-[70px]">
                      {post.mood.charAt(0).toUpperCase() + post.mood.slice(1)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* MEDIA */}
          {mediaSrc && (
            <Link to={`/post/${post._id}`} className="block flex-grow">
              <div className="relative overflow-hidden bg-base-200">
                {mediaError ? (
                  <div className="flex flex-col items-center justify-center p-6 bg-base-200 text-center h-48">
                    <AlertCircle className="size-8 text-error mb-2" />
                    <p className="text-xs font-medium text-base-content">
                      Media Failed to Load
                    </p>
                    <p className="text-xs text-base-content/60 mt-1">
                      Could not load {mediaType === "image" ? "image" : "video"}
                    </p>
                  </div>
                ) : mediaType === "image" ? (
                  <img
                    src={mediaSrc}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    loading="lazy"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="relative">
                    <video
                      src={mediaSrc}
                      className="w-full h-48 object-cover"
                      muted={muted}
                      loop
                      playsInline
                    />
                    <div className="absolute bottom-2 right-2 text-xs bg-black/70 text-white px-2 py-0.5 rounded">
                      Video
                    </div>
                  </div>
                )}
              </div>
            </Link>
          )}

          {/* ACTIONS (Footer) */}
          <div className="card-body p-4 pt-2 mt-auto">
            <div className="flex items-center justify-between pt-2 border-t border-base-300">
              <div className="flex items-center gap-4">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    likeMutation();
                  }}
                  className="flex items-center gap-1.5 btn btn-ghost btn-xs p-1 min-h-0 h-auto hover:bg-base-200 text-base-content/70"
                >
                  <Heart
                    className={`size-3.5 ${
                      post.likes?.includes(currentUserId)
                        ? "fill-error text-error"
                        : ""
                    }`}
                  />
                  <span className="text-xs font-medium">{likeCount || 0}</span>
                </button>

                <Link
                  to={`/post/${post._id}`}
                  className="flex items-center gap-1.5 btn btn-ghost btn-xs p-1 min-h-0 h-auto hover:bg-base-200 text-base-content/70"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MessageCircle className="size-3.5" />
                  <span className="text-xs font-medium">
                    {commentCount || 0}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal - Konsisten dengan tema */}
        {openDeleteModal && (
          <div className="modal modal-open">
            <div className="modal-box max-w-xs text-center bg-base-100 border border-base-300">
              <h3 className="font-bold text-sm mb-2 text-base-content">
                Delete Post?
              </h3>
              <p className="text-xs opacity-70 mb-4 text-base-content/70">
                This action cannot be undone.
              </p>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setOpenDeleteModal(false)}
                  className="btn btn-sm btn-ghost border border-base-300 hover:bg-base-200 text-base-content"
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
      </div>
    );
  }

  // FULL VIEW untuk HomePage
  return (
    <>
      {isEditing ? (
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

            {/* Media */}
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
