// components/StoryCreateModal.jsx - SIMPLIFIED VERSION
import { useState, useRef } from "react";
import { X, Camera, XCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStory } from "../lib/api";
import toast from "react-hot-toast";

const StoryCreateModal = ({ isOpen, onClose }) => {
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { mutate: createStoryMutation } = useMutation({
    mutationFn: createStory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      toast.success("Story posted successfully!");
      handleClose();
    },
    onError: (error) => {
      console.error("Story creation error:", error);
      toast.error(error.response?.data?.message || "Failed to post story");
      setIsUploading(false);
    },
  });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 15MB for stories)
    if (file.size > 15 * 1024 * 1024) {
      toast.error("File size must be less than 15MB");
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/mov", "video/avi", "video/webm"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select an image or video file (JPEG, PNG, GIF, MP4, MOV, AVI, WEBM)");
      return;
    }

    setMedia(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result);
    };
    
    if (file.type.startsWith("image/")) {
      reader.readAsDataURL(file);
    } else {
      // For videos, create object URL
      const videoUrl = URL.createObjectURL(file);
      setMediaPreview(videoUrl);
    }
  };

  const handleSubmit = () => {
    if (!media) {
      toast.error("Please select a photo or video");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("media", media);
    if (caption.trim()) {
      formData.append("caption", caption.trim());
    }

    console.log("📤 Submitting story with data:", {
      hasMedia: !!media,
      mediaType: media.type,
      caption: caption.trim(),
      formDataKeys: Array.from(formData.keys())
    });

    createStoryMutation(formData);
  };

  const handleClose = () => {
    // Clean up object URL if exists
    if (mediaPreview && media?.type?.startsWith("video/")) {
      URL.revokeObjectURL(mediaPreview);
    }
    
    setMedia(null);
    setMediaPreview(null);
    setCaption("");
    setIsUploading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md p-0 overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Create Story</h3>
              <p className="text-sm opacity-70">Share a moment that disappears in 24 hours</p>
            </div>
            <button
              onClick={handleClose}
              className="btn btn-ghost btn-circle hover:bg-base-200"
              disabled={isUploading}
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Media Upload Area */}
          <div className="mb-4">
            {!mediaPreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-base-300 rounded-2xl p-10 text-center cursor-pointer hover:border-primary transition-colors bg-base-200"
              >
                <Camera className="size-12 opacity-40 mx-auto mb-4" />
                <p className="font-medium mb-2">Add Photo or Video</p>
                <p className="text-sm opacity-70">Click to select a file</p>
                <p className="text-xs opacity-50 mt-2">Max 15MB • JPEG, PNG, GIF, MP4, MOV</p>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-base-300">
                {media?.type?.startsWith("image/") ? (
                  <img
                    src={mediaPreview}
                    alt="Story preview"
                    className="w-full h-64 object-contain bg-base-300"
                  />
                ) : (
                  <video
                    src={mediaPreview}
                    className="w-full h-64 object-contain bg-black"
                    controls
                  />
                )}
                <button
                  onClick={() => {
                    if (media?.type?.startsWith("video/")) {
                      URL.revokeObjectURL(mediaPreview);
                    }
                    setMedia(null);
                    setMediaPreview(null);
                  }}
                  className="absolute top-2 right-2 bg-black/70 text-base-100 p-1.5 rounded-full hover:bg-black"
                >
                  <XCircle className="size-5" />
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Caption */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Add a caption (optional)
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's happening?"
              className="textarea textarea-bordered w-full h-24"
              maxLength={2200}
              disabled={isUploading}
            />
            <div className="text-xs opacity-70 text-right mt-1">
              {caption.length}/2200
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-base-100 border-t border-base-300 p-4">
          <button
            onClick={handleSubmit}
            className={`btn w-full ${isUploading ? "btn-disabled" : "btn-primary"}`}
            disabled={!media || isUploading}
          >
            {isUploading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Posting Story...
              </>
            ) : (
              "Post Story"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryCreateModal;