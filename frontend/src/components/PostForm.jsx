import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost, updatePost } from "../lib/api";
import {
  ImageIcon,
  X,
  Smile,
  Video,
  MapPin,
  Calendar,
  Loader2,
  Navigation,
  Globe,
} from "lucide-react";
import toast from "react-hot-toast";
import LeafletMapModal from "./LeafletMapModal";

const moods = [
  { icon: "😊", label: "Happy", value: "happy" },
  { icon: "😢", label: "Sad", value: "sad" },
  { icon: "😡", label: "Angry", value: "angry" },
  { icon: "😍", label: "Love", value: "love" },
  { icon: "😂", label: "Laugh", value: "laugh" },
  { icon: "🤔", label: "Thinking", value: "thinking" },
  { icon: "😴", label: "Sleepy", value: "sleepy" },
  { icon: "🤩", label: "Excited", value: "excited" },
  { icon: "💼", label: "Working", value: "working" },
  { icon: "👥", label: "Meeting", value: "meeting" },
  { icon: "🏢", label: "Office", value: "office" },
  { icon: "🎯", label: "Goal", value: "goal" },
];

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const PostForm = ({
  postId = null,
  initialData = null,
  onClose = null,
  isEditMode = false,
}) => {
  const queryClient = useQueryClient();

  // Form states
  const [text, setText] = useState(initialData?.content || "");
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(
    initialData?.imageUrl || initialData?.videoUrl || null
  );
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showLeafletMapModal, setShowLeafletMapModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showMoodModal, setShowMoodModal] = useState(false);

  const [locationName, setLocationName] = useState(
    initialData?.location?.name || ""
  );
  const [userPosition, setUserPosition] = useState(null);
  const [eventDate, setEventDate] = useState(
    initialData?.eventDate
      ? new Date(initialData.eventDate).toISOString().split("T")[0]
      : ""
  );
  const [eventTime, setEventTime] = useState(
    initialData?.eventDate
      ? new Date(initialData.eventDate).toTimeString().slice(0, 5)
      : ""
  );
  const [selectedMood, setSelectedMood] = useState(initialData?.mood || "");

  const fileInputRef = useRef(null);
  const [lat, setLat] = useState(initialData?.location?.lat || "");
  const [lng, setLng] = useState(initialData?.location?.lng || "");

  useEffect(() => {
    if (isEditMode && initialData) {
      setText(initialData.content || "");

      // ✅ FIX PREVIEW URL
      if (initialData.imageUrl) {
        setPreview(
          initialData.imageUrl.startsWith("http")
            ? initialData.imageUrl
            : `${API_BASE_URL}${initialData.imageUrl}`
        );
      } else if (initialData.videoUrl) {
        setPreview(
          initialData.videoUrl.startsWith("http")
            ? initialData.videoUrl
            : `${API_BASE_URL}${initialData.videoUrl}`
        );
      } else {
        setPreview(null);
      }

      setLocationName(initialData.location?.name || "");
      setLat(initialData.location?.lat || "");
      setLng(initialData.location?.lng || "");

      if (initialData.eventDate) {
        const date = new Date(initialData.eventDate);
        setEventDate(date.toISOString().split("T")[0]);
        setEventTime(date.toTimeString().slice(0, 5));
      }

      setSelectedMood(initialData.mood || "");
    }
  }, [isEditMode, initialData]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Browser does not support geolocation");
      return;
    }

    toast.loading("Get your location...", { id: "location" });
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          setUserPosition({ lat: latitude, lng: longitude });

          const nominatimResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=id`
          );

          let locationName = "Your current location";
          if (nominatimResponse.ok) {
            const locationData = await nominatimResponse.json();
            if (locationData.display_name) {
              const addressParts = locationData.display_name.split(",");
              locationName =
                addressParts.slice(0, 2).join(", ").trim() ||
                locationData.display_name;
            }
          }

          setLocationName(locationName);
          setLat(latitude);
          setLng(longitude);

          toast.dismiss("location");
          toast.success(`📍 Location successfully found: ${locationName}`);
          setShowLocationModal(false);
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          toast.dismiss("location");
          setLocationName("Your current location");
          setLat(latitude);
          setLng(longitude);
          toast.success("📍Current location added");
          setShowLocationModal(false);
        }
      },
      (error) => {
        toast.dismiss("location");
        console.error("Geolocation error:", error);

        let errorMessage = "Can't get location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location permission denied. Enable it in browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is not available.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleLocationSelect = (location) => {
    setLocationName(location.name);
    if (location.lat && location.lng) {
      setLat(location.lat);
      setLng(location.lng);
    }
    toast.success(`📍 Location selected: ${location.name}`);
    setShowLocationModal(false);
  };

  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      resetForm();
      toast.success("Post created successfully! 🎉");
      if (onClose) onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create post");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (formData) => updatePost(postId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      resetForm();
      toast.success("Post updated successfully! ✨");
      if (onClose) onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update post");
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const resetForm = () => {
    setText("");
    setMedia(null);
    setPreview(null);
    setLocationName("");
    setEventDate("");
    setEventTime("");
    setSelectedMood("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast.error("Please select an image or video file");
      return;
    }

    setMedia(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setMedia(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() && !media && !preview) {
      toast.error("Please add content or media");
      return;
    }

    const formData = new FormData();
    formData.append("content", text);

    if (media) formData.append("image", media);
    if (locationName) {
      formData.append("locationName", locationName);
      if (lat) formData.append("lat", lat);
      if (lng) formData.append("lng", lng);
    }
    if (eventDate)
      formData.append(
        "eventDate",
        eventTime ? `${eventDate}T${eventTime}` : eventDate
      );
    if (selectedMood) formData.append("mood", selectedMood);

    if (isEditMode && postId) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const getMoodIcon = (moodValue) => {
    const mood = moods.find((m) => m.value === moodValue);
    return mood ? mood.icon : "😊";
  };

  const isVideoPreview = () => {
    if (media) return media.type.startsWith("video/");
    if (!preview) return false;

    return (
      (preview.includes("/uploads") &&
        (preview.includes("video") ||
          preview.endsWith(".mp4") ||
          preview.endsWith(".webm") ||
          preview.endsWith(".mov"))) ||
      preview.startsWith("data:video")
    );
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-base-100 border border-base-300 p-4 rounded-xl shadow-sm transition-all"
      >
        {/* TEXTAREA */}
        <textarea
          className="textarea textarea-bordered w-full min-h-[80px] resize-none bg-base-100 rounded-lg text-sm leading-relaxed focus:border-primary focus:outline-none"
          placeholder="Edit your post..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
        />

        {preview && (
          <div className="relative mt-4 rounded-xl overflow-hidden border border-base-300 bg-black">
            {/* VIDEO */}
            {isVideoPreview() ? (
              <video
                src={preview}
                controls
                className="w-full max-h-80 object-contain bg-black"
              />
            ) : (
              <>
                {/* IMAGE */}
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-h-80 object-contain bg-black"
                />

                {/* OVERLAY HANYA UNTUK IMAGE */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              </>
            )}

            {/* REMOVE BUTTON */}
            <button
              type="button"
              onClick={removeMedia}
              className="
        absolute top-3 right-3 z-30
        bg-black/70 backdrop-blur
        text-white p-2 rounded-full
        hover:bg-red-600 transition
        shadow-lg
      "
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* META INFO */}
        {(locationName || eventDate || selectedMood) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {locationName && (
              <div className="badge badge-outline badge-sm flex items-center gap-1">
                <MapPin className="size-3" />
                <span className="truncate max-w-[150px]">{locationName}</span>
              </div>
            )}

            {eventDate && (
              <div className="badge badge-outline badge-sm flex items-center gap-1">
                <Calendar className="size-3" />
                <span className="text-xs">
                  {eventDate} {eventTime && `• ${eventTime}`}
                </span>
              </div>
            )}

            {selectedMood && (
              <div className="badge badge-outline badge-sm flex items-center gap-1">
                <span>{getMoodIcon(selectedMood)}</span>
                <span className="text-xs">
                  {moods.find((m) => m.value === selectedMood)?.label}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="divider my-3" />

        {/* ACTION BAR */}
        <div className="flex items-center gap-2">
          {/* LEFT ACTIONS */}
          <label className="btn btn-ghost btn-sm btn-circle">
            <ImageIcon className="size-4" />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          <button
            type="button"
            onClick={() => setShowLocationModal(true)}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <MapPin className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowCalendarModal(true)}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <Calendar className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowMoodModal(true)}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <Smile className="size-4" />
          </button>

          {/* RIGHT ACTIONS */}
          <div className="ml-auto flex items-center gap-2">
            {isEditMode && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost btn-sm"
                disabled={isPending}
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={isPending || (!text.trim() && !media && !preview)}
              className="btn btn-primary btn-sm px-5"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={14} />
                  <span className="text-xs">Updating...</span>
                </span>
              ) : (
                "Post"
              )}
            </button>
          </div>
        </div>
      </form>

      {/* ================== SIMPLIFIED Location Modal ================== */}
      {showLocationModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <MapPin className="size-5" />
                Add Location
              </h3>
              <button
                onClick={() => {
                  setShowLocationModal(false);
                }}
                className="btn btn-sm btn-ghost"
              >
                ✕
              </button>
            </div>

            {/* SIMPLIFIED: Only 2 options */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={handleUseCurrentLocation}
                className="card bg-base-100 border p-4 flex flex-col items-center justify-center hover:bg-base-200 transition hover:border-primary"
              >
                <Navigation className="size-6 mb-3 text-primary" />
                <span className="text-sm font-medium">
                  Your current location
                </span>
                <span className="text-xs text-gray-500 mt-1">Use gps</span>
              </button>

              <button
                onClick={() => setShowLeafletMapModal(true)}
                className="card bg-base-100 border p-4 flex flex-col items-center justify-center hover:bg-base-200 transition hover:border-primary"
              >
                <Globe className="size-6 mb-3 text-primary" />
                <span className="text-sm font-medium">Select on the map</span>
                <span className="text-xs text-gray-500 mt-1">
                  Select manual
                </span>
              </button>
            </div>

            {/* Selected Location Preview */}
            {locationName && (
              <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="font-medium flex items-center gap-2">
                  <MapPin className="size-4 text-primary" />
                  Selected locations:
                </div>
                <div className="mt-1 font-semibold">{locationName}</div>
                {lat && lng && (
                  <div className="text-xs text-gray-500 mt-1">
                    Koordinat: {lat.toFixed(6)}, {lng.toFixed(6)}
                  </div>
                )}
                <button
                  onClick={() => {
                    setLocationName("");
                    setLat("");
                    setLng("");
                    toast.success("Location deleted");
                  }}
                  className="btn btn-ghost btn-xs mt-2"
                >
                  Delete Location
                </button>
              </div>
            )}

            <div className="modal-action mt-6">
              <button
                onClick={() => {
                  setShowLocationModal(false);
                }}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (locationName) {
                    toast.success(`✅ Lokasi disimpan: ${locationName}`);
                    setShowLocationModal(false);
                  } else {
                    toast.error("Pilih lokasi terlebih dahulu");
                  }
                }}
                className="btn btn-primary btn-sm"
              >
                Save location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leaflet Map Modal */}
      <LeafletMapModal
        isOpen={showLeafletMapModal}
        onClose={() => {
          setShowLeafletMapModal(false);
        }}
        onLocationSelect={(location) => {
          handleLocationSelect(location);
        }}
        userPosition={userPosition}
      />

      {/* Calendar Modal */}
      {showCalendarModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <h3 className="font-bold text-lg mb-4">set the event date</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text text-sm">Date</label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label-text text-sm">Time (opsional)</label>
                  <input
                    type="time"
                    className="input input-bordered w-full"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {["Today", "Tomorrow", "Next Week"].map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      const date = new Date();
                      if (label === "Tomorrow")
                        date.setDate(date.getDate() + 1);
                      if (label === "Next Week")
                        date.setDate(date.getDate() + 7);
                      setEventDate(date.toISOString().split("T")[0]);
                      toast.success(`Date: ${label}`);
                    }}
                    className="btn btn-xs btn-outline"
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="modal-action">
                <button
                  onClick={() => setShowCalendarModal(false)}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (eventDate) {
                      toast.success("Saved date");
                      setShowCalendarModal(false);
                    } else {
                      toast.error("Select a date first");
                    }
                  }}
                  className="btn btn-primary btn-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mood Modal */}
      {showMoodModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <h3 className="font-bold text-lg mb-4">Choose a mood</h3>
            <div className="grid grid-cols-4 gap-2">
              {moods.slice(0, 8).map((mood) => (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => {
                    setSelectedMood(mood.value);
                    toast.success(`Mood: ${mood.label}`);
                    setShowMoodModal(false);
                  }}
                  className={`flex flex-col items-center p-2 rounded-lg hover:bg-base-200 transition ${
                    selectedMood === mood.value
                      ? "bg-primary/10 ring-1 ring-primary"
                      : ""
                  }`}
                >
                  <span className="text-2xl">{mood.icon}</span>
                  <span className="text-xs mt-1">{mood.label}</span>
                </button>
              ))}
            </div>
            <div className="modal-action mt-4">
              <button
                onClick={() => {
                  setSelectedMood("");
                  setShowMoodModal(false);
                }}
                className="btn btn-ghost btn-sm"
              >
                Delete
              </button>
              <button
                onClick={() => setShowMoodModal(false)}
                className="btn btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostForm;
