import { useState, useEffect, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Eye,
  Trash2,
  MoreVertical,
  Pause,
  Play,
  Users,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTimelineStories,
  markStoryAsViewed,
  deleteStory,
  getStoryViewers,
} from "../lib/api";
import { formatDistanceToNow, isValid } from "date-fns";
import toast from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser";

const StoriesCarousel = ({
  onClose,
  initialStoryIndex = 0,
  initialUserIndex = 0,
}) => {
  const queryClient = useQueryClient();
  const { data: storiesData, isLoading } = useQuery({
    queryKey: ["stories"],
    queryFn: getTimelineStories,
  });

  const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [viewersList, setViewersList] = useState([]);
  const [loadingViewers, setLoadingViewers] = useState(false);
  const [videoDuration, setVideoDuration] = useState(5000);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const optionsRef = useRef(null);
  const lastToggleTimeRef = useRef(0);
  const lastVideoTimeRef = useRef(0);
  const progressStartTimeRef = useRef(0);
  const elapsedTimeRef = useRef(0);

  const stories = storiesData?.stories || [];
  const currentUserStories = stories[currentUserIndex]?.stories || [];
  const currentStory = currentUserStories[currentStoryIndex];
  const viewedRef = useRef(new Set());

  // const currentUser = JSON.parse(localStorage.getItem("user"));
  // const currentUserId = currentUser?.user?._id || currentUser?._id;

  // const userRole = currentUser?.role || currentUser?.user?.role;

  const { authUser } = useAuthUser();

  const currentUserId = authUser?._id;
  const userRole = authUser?.role;

  const storyOwnerId =
    currentStory?.user?._id ?? currentStory?.user?.userId ?? currentStory?.user;

  const isOwner =
    currentUserId &&
    storyOwnerId &&
    String(storyOwnerId) === String(currentUserId);

  const isStoryOwner = isOwner || userRole === "admin";

  const actualViewerCount = currentStory?.views
    ? new Set(
        currentStory.views
          .map((v) => String(v.user || v._id))
          .filter((id) => id !== String(storyOwnerId))
      ).size
    : 0;

  const { mutate: deleteStoryMutation, isPending: isDeleting } = useMutation({
    mutationFn: deleteStory,
    onSuccess: () => {
      toast.success("Story deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      setShowDeleteModal(false);
      setShowOptions(false);

      setTimeout(() => {
        const updatedStories =
          queryClient.getQueryData(["stories"])?.stories || [];

        if (updatedStories.length === 0) {
          onClose();
          return;
        }

        const newUserIndex = Math.min(
          currentUserIndex,
          updatedStories.length - 1
        );
        const newUserStories = updatedStories[newUserIndex]?.stories || [];

        if (newUserStories.length > 0) {
          setCurrentUserIndex(newUserIndex);
          setCurrentStoryIndex(0);
        } else if (newUserIndex > 0) {
          setCurrentUserIndex(newUserIndex - 1);
          setCurrentStoryIndex(0);
        } else if (updatedStories.length > newUserIndex + 1) {
          setCurrentUserIndex(newUserIndex + 1);
          setCurrentStoryIndex(0);
        } else {
          onClose();
        }

        setProgress(0);
      }, 300);
    },
    onError: (error) => {
      console.error("Delete story error:", error);
      toast.error(error.response?.data?.message || "Failed to delete story");
    },
  });

  const loadViewers = async () => {
    if (!currentStory?._id || !isStoryOwner) return;

    setLoadingViewers(true);
    try {
      const viewers = await getStoryViewers(currentStory._id);

      const normalized = viewers
        .filter((v) => String(v.user?._id || v.user) !== String(currentUserId))
        .map((v) => {
          const user = v.user || v.viewer || {};

          return {
            _id: user._id || v.user,
            fullName: user.fullName || user.name || "Unknown User",
            profilePic: user.profilePic || user.avatar || "",
            viewedAt: v.viewedAt || v.createdAt,
          };
        });

      setViewersList(normalized);
    } catch (error) {
      console.error("Failed to load viewers:", error);
      toast.error("Failed to load viewers");
    } finally {
      setLoadingViewers(false);
    }
  };

  const handleViewersClick = async (e) => {
    e?.stopPropagation();
    if (!isStoryOwner) return;
    await loadViewers();
    setShowViewers(true);
  };

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current && currentStory?.mediaType === "video") {
      const duration = videoRef.current.duration;
      if (duration && duration > 0) {
        const cappedDuration = Math.min(duration, 30);
        setVideoDuration(cappedDuration * 1000);
        setVideoReady(true);
      } else {
        setVideoDuration(5000);
        setVideoReady(true);
      }
    }
  };

  const handleVideoError = () => {
    console.error("Video loading error");
    setVideoDuration(5000);
    setVideoReady(true);
  };

  const setupVideoAudio = () => {
    if (videoRef.current && currentStory?.mediaType === "video") {
      videoRef.current.volume = 1;
      videoRef.current.muted = false;
      videoRef.current.playsInline = true;
      videoRef.current.crossOrigin = "anonymous";
    }
  };

  const calculateProgressFromVideoTime = () => {
    if (videoRef.current && currentStory?.mediaType === "video") {
      const duration = videoDuration;
      const currentTime = videoRef.current.currentTime * 1000;
      const newProgress = Math.min((currentTime / duration) * 100, 100);
      setProgress(newProgress);
      return newProgress;
    }
    return progress;
  };

  const startProgressInterval = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    const duration = currentStory?.mediaType === "video" ? videoDuration : 5000;

    if (duration <= 0) {
      console.warn("Invalid duration, using default");
      return;
    }

    const elapsedMs = (progress / 100) * duration;

    progressStartTimeRef.current = Date.now() - elapsedMs;
    elapsedTimeRef.current = elapsedMs;

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - progressStartTimeRef.current;
      const newProgress = Math.min((elapsed / duration) * 100, 100);

      setProgress(newProgress);
      elapsedTimeRef.current = elapsed;

      if (newProgress >= 100) {
        goToNextStory();
      }
    }, 50);
  };

  const stopProgressInterval = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  useEffect(() => {
    if (!currentStory || isLoading) return;

    if (currentStory?.mediaType === "video" && !videoReady) {
      return;
    }

    if (isPaused) {
      stopProgressInterval();

      if (currentStory?.mediaType === "video" && videoRef.current) {
        const newProgress = calculateProgressFromVideoTime();
        elapsedTimeRef.current =
          (newProgress / 100) *
          (currentStory?.mediaType === "video" ? videoDuration : 5000);
      }
    } else {
      startProgressInterval();
    }

    return () => {
      stopProgressInterval();
    };
  }, [
    currentStoryIndex,
    currentUserIndex,
    isPaused,
    isLoading,
    videoDuration,
    videoReady,
  ]);

  useEffect(() => {
    setProgress(0);
    setVideoReady(false);
    if (currentStory?.mediaType !== "video") {
      setVideoDuration(5000);
      setVideoReady(true);
    }
    setShowOptions(false);
    setIsHovering(false);
    setShowViewers(false);
    setViewersList([]);
    setIsPaused(false);
    lastToggleTimeRef.current = 0;
    lastVideoTimeRef.current = 0;
    progressStartTimeRef.current = 0;
    elapsedTimeRef.current = 0;
  }, [currentStory]);

  useEffect(() => {
    if (
      currentStory?._id &&
      !isStoryOwner &&
      !viewedRef.current.has(currentStory._id)
    ) {
      viewedRef.current.add(currentStory._id);
      markStoryAsViewed(currentStory._id);
    }
  }, [currentStory?._id, isStoryOwner]);

  useEffect(() => {
    if (videoRef.current && currentStory?.mediaType === "video") {
      videoRef.current.currentTime = lastVideoTimeRef.current || 0;

      // Setup audio
      setupVideoAudio();

      if (!isPaused) {
        const playVideo = async () => {
          try {
            await videoRef.current.play();
          } catch (error) {
            console.log("Video play error:", error.message);

            if (error.name === "NotAllowedError") {
              videoRef.current.muted = true;
              try {
                await videoRef.current.play();
              } catch (mutedError) {
                console.log("Muted play failed:", mutedError.message);
              }
            }
          }
        };

        setTimeout(() => {
          if (videoRef.current) {
            playVideo();
          }
        }, 300);
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPaused, currentStory]);

  useEffect(() => {
    if (currentStory?.mediaType === "video" && videoRef.current) {
      const video = videoRef.current;

      const handleCanPlay = () => {
        setVideoReady(true);
      };

      video.addEventListener("canplay", handleCanPlay);

      return () => {
        video.removeEventListener("canplay", handleCanPlay);
      };
    }
  }, [currentStory]);

  const goToNextStory = () => {
    stopProgressInterval();

    setIsTransitioning(true);

    setTimeout(() => {
      if (currentStoryIndex < currentUserStories.length - 1) {
        setCurrentStoryIndex(currentStoryIndex + 1);
      } else if (currentUserIndex < stories.length - 1) {
        setCurrentUserIndex(currentUserIndex + 1);
        setCurrentStoryIndex(0);
      } else {
        onClose();
      }
      setIsTransitioning(false);
      setShowOptions(false);
      lastVideoTimeRef.current = 0;
    }, 100);
  };

  const goToPrevStory = () => {
    stopProgressInterval();

    setIsTransitioning(true);

    setTimeout(() => {
      if (currentStoryIndex > 0) {
        setCurrentStoryIndex(currentStoryIndex - 1);
      } else if (currentUserIndex > 0) {
        const prevUserIndex = currentUserIndex - 1;
        const prevUserStories = stories[prevUserIndex]?.stories || [];
        setCurrentUserIndex(prevUserIndex);
        setCurrentStoryIndex(prevUserStories.length - 1);
      }
      setIsTransitioning(false);
      setShowOptions(false);
      lastVideoTimeRef.current = 0;
    }, 100);
  };

  const handleDeleteStory = () => {
    if (currentStory?._id && isStoryOwner) {
      deleteStoryMutation(currentStory._id);
    }
  };

  const togglePause = (e) => {
    e?.stopPropagation();
    e?.preventDefault();

    const now = Date.now();
    if (now - lastToggleTimeRef.current < 300) {
      return;
    }
    lastToggleTimeRef.current = now;

    setIsPaused((prev) => {
      const newState = !prev;

      if (currentStory?.mediaType === "video" && videoRef.current) {
        if (newState) {
          // Simpan waktu video saat pause
          lastVideoTimeRef.current = videoRef.current.currentTime;
          videoRef.current.pause();

          calculateProgressFromVideoTime();
        } else {
          if (lastVideoTimeRef.current > 0) {
            videoRef.current.currentTime = lastVideoTimeRef.current;
          }
          videoRef.current.play().catch((err) => {
            console.error("Manual play error:", err);
          });

          startProgressInterval();
        }
      } else {
        if (!newState) {
          startProgressInterval();
        } else {
          stopProgressInterval();
        }
      }

      return newState;
    });
  };

  const openDeleteModal = (e) => {
    e?.stopPropagation();
    if (currentStory?._id && isStoryOwner) {
      setShowDeleteModal(true);
      setShowOptions(false);
    }
  };

  const handleVideoEnd = () => {
    lastVideoTimeRef.current = 0;
    goToNextStory();
  };

  const formatDateSafely = (date) => {
    if (!date || !isValid(new Date(date))) {
      return "recently";
    }
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-white"></span>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-center text-white p-6">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
            <User className="size-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold mb-3">No Stories Yet</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            When your friends post stories, they'll appear here. Be the first to
            share a moment!
          </p>
          <button
            onClick={onClose}
            className="btn btn-outline px-8 py-3 text-white border-white hover:bg-white hover:text-black transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black z-50">
        {/* Progress Bars */}
        <div className="absolute top-4 left-4 right-4 z-20">
          <div className="flex gap-1.5">
            {currentUserStories.map((_, index) => (
              <div
                key={index}
                className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden"
              >
                <div
                  className={`h-full ${
                    index === currentStoryIndex
                      ? isPaused
                        ? "bg-gray-400"
                        : "bg-white"
                      : index < currentStoryIndex
                      ? "bg-white"
                      : "bg-gray-800"
                  }`}
                  style={{
                    width:
                      index === currentStoryIndex
                        ? `${progress}%`
                        : index < currentStoryIndex
                        ? "100%"
                        : "0%",
                    transition: isPaused ? "none" : "width 0.05s linear",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Header */}
        <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/50">
                <img
                  src={currentStory?.user?.profilePic || "/default-avatar.png"}
                  alt={currentStory?.user?.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                {currentStory?.user?.fullName}
              </h4>
              <p className="text-xs text-gray-400">
                {formatDateSafely(currentStory?.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isStoryOwner && (
              <button
                onClick={handleViewersClick}
                className="text-white hover:bg-white/10 p-2 rounded-full transition-colors flex items-center gap-1"
              >
                <Eye className="size-5" />
                <span className="text-sm">{actualViewerCount}</span>
              </button>
            )}

            <div
              className={`text-white text-xs px-2 py-1 rounded-lg transition-opacity ${
                isPaused ? "opacity-100 bg-black/30" : "opacity-0"
              }`}
            >
              Paused
            </div>

            {/* Options button for story owner */}
            {isStoryOwner && (
              <div className="relative" ref={optionsRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOptions(!showOptions);
                  }}
                  className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
                >
                  <MoreVertical className="size-5" />
                </button>

                {showOptions && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-40 overflow-hidden">
                    <button
                      onClick={openDeleteModal}
                      className="w-full px-4 py-3.5 text-sm hover:bg-gray-800 flex items-center gap-3 text-left text-red-400 transition-colors"
                    >
                      <Trash2 className="size-4" />
                      <span>Delete Story</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={onClose}
              className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
            >
              <X className="size-6" />
            </button>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="absolute inset-0 flex items-center justify-between px-4 z-10">
          <button
            onClick={goToPrevStory}
            className="text-white hover:bg-black/20 p-4 rounded-full transition-colors"
            disabled={currentUserIndex === 0 && currentStoryIndex === 0}
          >
            <ChevronLeft className="size-8" />
          </button>

          <button
            onClick={goToNextStory}
            className="text-white hover:bg-black/20 p-4 rounded-full transition-colors"
          >
            <ChevronRight className="size-8" />
          </button>
        </div>

        <div
          className={`absolute inset-0 flex items-center justify-center pt-16 pb-32 transition-opacity duration-200 ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="w-full max-w-2xl h-full flex items-center justify-center">
            {currentStory?.mediaType === "image" ? (
              <div
                className="w-full h-full flex items-center justify-center cursor-pointer"
                onClick={togglePause}
              >
                <img
                  src={`${import.meta.env.VITE_API_URL}${
                    currentStory.mediaUrl
                  }`}
                  alt="Story"
                  className="max-w-full max-h-full object-contain rounded-lg"
                  key={`image-${currentStory?._id}`}
                />
              </div>
            ) : (
              <div
                className="relative w-full h-full flex items-center justify-center"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <video
                  ref={videoRef}
                  src={`${import.meta.env.VITE_API_URL}${
                    currentStory.mediaUrl
                  }`}
                  className="max-w-full max-h-full object-contain rounded-lg cursor-pointer"
                  playsInline
                  onLoadedMetadata={handleVideoLoadedMetadata}
                  onError={handleVideoError}
                  onEnded={handleVideoEnd}
                  key={`video-${currentStory?._id}`}
                  onClick={togglePause}
                  autoPlay
                  preload="metadata"
                />

                {currentStory?.mediaType === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <button
                      onClick={togglePause}
                      className={`p-5 rounded-full transition-all duration-200 bg-black/50 hover:bg-black/60 shadow-lg
                        ${
                          isPaused
                            ? "opacity-100 scale-100"
                            : isHovering
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-90"
                        }
                    `}
                    >
                      {isPaused ? (
                        <Play className="size-10 text-white ml-1" />
                      ) : (
                        <Pause className="size-10 text-white" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {currentStory?.caption && (
          <div className="absolute bottom-32 left-0 right-0 z-20 pointer-events-none">
            <div className="max-w-2xl mx-auto px-6">
              <div className="text-center">
                <p className="text-white text-lg leading-relaxed bg-black/50 backdrop-blur-sm inline-block px-4 py-3 rounded-2xl max-w-2xl">
                  {currentStory.caption}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm p-0 overflow-hidden bg-gray-900 border border-gray-700">
            <div className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-red-500/10 rounded-full flex items-center justify-center">
                <Trash2 className="size-10 text-red-400" />
              </div>

              <h3 className="text-xl font-bold text-white mb-3">
                Delete This Story?
              </h3>
              <p className="text-gray-400 mb-8">
                This story will be permanently deleted along with all its views.
                This action cannot be undone.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn btn-outline flex-1 border-gray-600 text-white hover:bg-gray-800"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteStory}
                  className="btn btn-error flex-1 text-white"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showViewers && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md p-0 overflow-hidden bg-gray-900 border border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Story Viewers
                  </h3>
                  <p className="text-sm text-gray-400">
                    {viewersList.length} people viewed this story
                  </p>
                </div>
                <button
                  onClick={() => setShowViewers(false)}
                  className="btn btn-ghost btn-sm btn-circle text-white"
                >
                  <X className="size-5" />
                </button>
              </div>

              {loadingViewers ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner loading-lg text-white"></span>
                </div>
              ) : viewersList.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                    <Users className="size-8 text-gray-400" />
                  </div>
                  <p className="text-gray-400">
                    No one has viewed this story yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {viewersList.map((viewer) => (
                    <div
                      key={viewer._id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img
                          src={viewer.profilePic || "/default-avatar.png"}
                          alt={viewer.fullName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-white">
                          {viewer.fullName}
                        </h4>
                        <p className="text-xs text-gray-400">
                          Viewed {formatDateSafely(viewer.viewedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StoriesCarousel;
