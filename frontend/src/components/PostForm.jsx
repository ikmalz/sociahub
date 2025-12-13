// PostForm.jsx - VERSION FINAL (Improved Location Interface)
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
  Search,
  Navigation,
  Globe,
  Building2,
  MapPinned,
  Map,
  Users,
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

const officeLocations = [
  { name: "Head Office", lat: -6.2088, lng: 106.8456, icon: "🏢", type: "Kantor Pusat" },
  { name: "Meeting Room A", lat: -6.209, lng: 106.8458, icon: "👥", type: "Ruang Meeting" },
  { name: "Cafeteria", lat: -6.2085, lng: 106.845, icon: "🍽️", type: "Kantin" },
  { name: "Training Center", lat: -6.2095, lng: 106.846, icon: "🎓", type: "Pusat Pelatihan" },
  { name: "Parking Area", lat: -6.208, lng: 106.8445, icon: "🅿️", type: "Parkir" },
  { name: "IT Department", lat: -6.2087, lng: 106.8452, icon: "💻", type: "Departemen IT" },
  { name: "HR Office", lat: -6.2089, lng: 106.8454, icon: "📋", type: "HR" },
  { name: "Lobby", lat: -6.2086, lng: 106.8451, icon: "🏛️", type: "Lobi" },
];

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

  // Location states
  const [locationName, setLocationName] = useState(
    initialData?.location?.name || ""
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");

  const [userPosition, setUserPosition] = useState(null);
  const [nearbyOffices, setNearbyOffices] = useState([]);

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
  const searchTimeout = useRef(null);
  const [lat, setLat] = useState(initialData?.location?.lat || "");
  const [lng, setLng] = useState(initialData?.location?.lng || "");

  // Initialize form with existing data if editing
  useEffect(() => {
    if (isEditMode && initialData) {
      setText(initialData.content || "");
      setPreview(initialData.imageUrl || initialData.videoUrl || null);
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

  // ================== 1. PERBAIKAN: Cari Tempat (Popup PostForm) ==================
  const searchLocations = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Filter office locations
      const filteredOffices = officeLocations.filter((loc) =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.type.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Search external locations with better parameters for Indonesia
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=8&lang=id&location_bias=rect:95,-11,141,6`
      );

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();

      let photonResults = [];
      if (data?.features) {
        photonResults = data.features.map((feature) => {
          const props = feature.properties || {};
          const coords = feature.geometry?.coordinates || [0, 0];
          
          // Better name extraction for Indonesian locations
          let name = props.name || props.street || "Lokasi";
          let address = "";
          
          // Build better address for Indonesian context
          const addressParts = [];
          if (props.street) addressParts.push(props.street);
          if (props.city) addressParts.push(props.city);
          if (props.state) addressParts.push(props.state);
          if (props.country === "Indonesia" && addressParts.length > 0) {
            address = addressParts.join(", ");
          } else if (props.country) {
            address = addressParts.concat(props.country).join(", ");
          }

          return {
            name: name,
            address: address,
            lat: coords[1],
            lng: coords[0],
            source: "photon",
            icon: getLocationIcon(props),
          };
        }).filter(result => result.address.includes("Indonesia") || result.address === "");
      }

      // Combine and prioritize Indonesian results
      const allResults = [...filteredOffices, ...photonResults];
      
      // Sort by relevance: exact matches first, then partial
      const exactMatches = allResults.filter(r => 
        r.name.toLowerCase() === searchQuery.toLowerCase()
      );
      const partialMatches = allResults.filter(r => 
        !exactMatches.includes(r)
      );
      
      setSearchResults([...exactMatches, ...partialMatches]);
      
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Gagal mencari lokasi. Coba kata kunci lain.");
    } finally {
      setIsSearching(false);
    }
  };

  const getLocationIcon = (props) => {
    if (props.amenity === "restaurant" || props.cuisine) return "🍽️";
    if (props.amenity === "cafe") return "☕";
    if (props.amenity === "bank") return "🏦";
    if (props.shop) return "🛍️";
    if (props.tourism) return "🏨";
    if (props.office) return "🏢";
    return "📍";
  };

  const handleLocationSelect = (location) => {
    setLocationName(location.name);
    if (location.lat && location.lng) {
      setLat(location.lat);
      setLng(location.lng);
    }
    toast.success(`📍 Lokasi dipilih: ${location.name}`);
    setShowLocationModal(false);
    setSearchResults([]);
    setSelectedOption("");
  };

  // Distance calculation
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getNearbyOffices = (userLat, userLng) => {
    if (!userLat || !userLng) return officeLocations;

    const officesWithDistance = officeLocations.map((office) => ({
      ...office,
      distance: calculateDistance(userLat, userLng, office.lat, office.lng),
    }));

    return officesWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 6); // Limit to 6 nearest offices
  };

  const handleUseCurrentLocation = () => {
    setSelectedOption("current");

    if (!navigator.geolocation) {
      toast.error("Browser tidak mendukung geolocation");
      return;
    }

    toast.loading("Mendapatkan lokasi Anda...", { id: "location" });
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          setUserPosition({ lat: latitude, lng: longitude });

          const nearby = getNearbyOffices(latitude, longitude);
          setNearbyOffices(nearby);

          const nominatimResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=id`
          );

          if (!nominatimResponse.ok) {
            throw new Error("Gagal mendapatkan alamat");
          }

          const locationData = await nominatimResponse.json();

          let locationName = "Lokasi Saat Ini";
          if (locationData.display_name) {
            const addressParts = locationData.display_name.split(",");
            locationName =
              addressParts.slice(0, 2).join(", ").trim() ||
              locationData.display_name;
          }

          setLocationName(locationName);
          setLat(latitude);
          setLng(longitude);

          toast.dismiss("location");
          toast.success(`✅ Lokasi berhasil didapatkan: ${locationName}`);
          setShowLocationModal(false);
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          toast.dismiss("location");
          setLocationName("Lokasi Saat Ini");
          setLat(latitude);
          setLng(longitude);
          toast.success("📍 Lokasi saat ini ditambahkan");
          setShowLocationModal(false);
        }
      },
      (error) => {
        toast.dismiss("location");
        console.error("Geolocation error:", error);

        let errorMessage = "Tidak bisa mendapatkan lokasi";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Izin lokasi ditolak. Aktifkan di pengaturan browser.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Informasi lokasi tidak tersedia.";
            break;
          case error.TIMEOUT:
            errorMessage = "Permintaan lokasi timeout.";
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

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedOption("search");

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (value.trim()) {
      searchTimeout.current = setTimeout(() => searchLocations(), 500);
    } else {
      setSearchResults([]);
    }
  };

  // Mutation hooks
  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      resetForm();
      toast.success("Post berhasil dibuat! 🎉");
      if (onClose) onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal membuat post");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (formData) => updatePost(postId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      resetForm();
      toast.success("Post berhasil diperbarui! ✨");
      if (onClose) onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal memperbarui post");
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
    setSearchQuery("");
    setSearchResults([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ukuran file harus kurang dari 10MB");
      return;
    }

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast.error("Silakan pilih file gambar atau video");
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
      toast.error("Silakan tambahkan konten atau media");
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

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-base-200 p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
      >
        <textarea
          className="textarea textarea-bordered w-full min-h-[70px] max-h-[220px] resize-none bg-base-100 rounded-xl shadow-sm transition-all duration-300 focus:border-primary"
          placeholder="Bagikan pembaruan, pengumuman, atau pencapaian kerja..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
        />

        {preview && (
          <div className="relative mt-4 group">
            {preview.includes("video") ||
            (media && media.type.startsWith("video/")) ? (
              <video
                src={preview}
                controls
                className="rounded-xl w-full max-h-80 object-cover"
              />
            ) : (
              <img
                src={preview}
                alt="Preview"
                className="rounded-xl w-full max-h-80 object-cover group-hover:opacity-90 transition"
              />
            )}
            <button
              type="button"
              onClick={removeMedia}
              className="absolute top-3 right-3 bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Selected Features Preview */}
        <div className="mt-3 flex flex-wrap gap-2">
          {locationName && (
            <div className="badge badge-outline badge-sm flex items-center gap-1">
              <MapPin className="size-3" />
              <span className="max-w-[150px] truncate">{locationName}</span>
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
              <span className="text-sm">{getMoodIcon(selectedMood)}</span>
              <span className="text-xs">
                {moods.find((m) => m.value === selectedMood)?.label}
              </span>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <label className="cursor-pointer btn btn-ghost btn-sm rounded-full hover:bg-base-300 flex items-center gap-2">
            <ImageIcon className="size-4" />
            <span className="text-xs">Media</span>
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
            className="btn btn-ghost btn-sm rounded-full hover:bg-base-300 flex items-center gap-2"
          >
            <MapPin className="size-4" />
            <span className="text-xs">
              {locationName ? "Ubah Lokasi" : "Lokasi"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowCalendarModal(true)}
            className="btn btn-ghost btn-sm rounded-full hover:bg-base-300 flex items-center gap-2"
          >
            <Calendar className="size-4" />
            <span className="text-xs">Acara</span>
          </button>

          <button
            type="button"
            onClick={() => setShowMoodModal(true)}
            className="btn btn-ghost btn-sm rounded-full hover:bg-base-300 flex items-center gap-2"
          >
            <Smile className="size-4" />
            <span className="text-xs">Mood</span>
          </button>

          <button
            type="submit"
            disabled={isPending || (!text.trim() && !media && !preview)}
            className="ml-auto btn btn-primary btn-sm rounded-full px-4 shadow-md hover:shadow-lg transition disabled:opacity-50"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                <span className="text-xs">
                  {isEditMode ? "Memperbarui..." : "Memposting..."}
                </span>
              </span>
            ) : isEditMode ? (
              "Perbarui"
            ) : (
              "Bagikan"
            )}
          </button>

          {isEditMode && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm"
              disabled={isPending}
            >
              <span className="text-xs">Batal</span>
            </button>
          )}
        </div>
      </form>

      {/* ================== IMPROVED Location Modal ================== */}
      {showLocationModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <MapPinned className="size-5" />
                Pilih Lokasi
              </h3>
              <button
                onClick={() => {
                  setShowLocationModal(false);
                  setSearchQuery("");
                  setSearchResults([]);
                  setSelectedOption("");
                }}
                className="btn btn-sm btn-ghost"
              >
                ✕
              </button>
            </div>

            {/* Quick Action Cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => {
                  setSelectedOption("search");
                  setTimeout(() => document.getElementById("searchInput")?.focus(), 100);
                }}
                className={`card bg-base-100 border p-3 flex flex-col items-center justify-center hover:bg-base-200 transition ${
                  selectedOption === "search" ? "border-primary shadow-md" : ""
                }`}
              >
                <Search className="size-5 mb-2 text-primary" />
                <span className="text-sm font-medium">Cari Tempat</span>
              </button>

              <button
                onClick={handleUseCurrentLocation}
                className={`card bg-base-100 border p-3 flex flex-col items-center justify-center hover:bg-base-200 transition ${
                  selectedOption === "current" ? "border-primary shadow-md" : ""
                }`}
              >
                <Navigation className="size-5 mb-2 text-primary" />
                <span className="text-sm font-medium">Lokasi Saat Ini</span>
              </button>

              <button
                onClick={() => setSelectedOption("office")}
                className={`card bg-base-100 border p-3 flex flex-col items-center justify-center hover:bg-base-200 transition ${
                  selectedOption === "office" ? "border-primary shadow-md" : ""
                }`}
              >
                <Building2 className="size-5 mb-2 text-primary" />
                <span className="text-sm font-medium">Lokasi Kantor</span>
              </button>

              <button
                onClick={() => setShowLeafletMapModal(true)}
                className={`card bg-base-100 border p-3 flex flex-col items-center justify-center hover:bg-base-200 transition ${
                  selectedOption === "map" ? "border-primary shadow-md" : ""
                }`}
              >
                <Globe className="size-5 mb-2 text-primary" />
                <span className="text-sm font-medium">Pilih di Peta</span>
              </button>
            </div>

            {/* ================== 1. SEARCH SECTION ================== */}
            {selectedOption === "search" && (
              <div className="mb-4">
                <div className="relative">
                  <input
                    id="searchInput"
                    type="text"
                    placeholder="Cari tempat di Indonesia (restoran, hotel, kantor, dll)..."
                    className="input input-bordered w-full pl-10 pr-20"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyPress={(e) => e.key === 'Enter' && searchLocations()}
                    autoFocus
                  />
                  <Search className="absolute left-3 top-3 size-4 text-gray-400" />
                  <button
                    onClick={searchLocations}
                    disabled={isSearching}
                    className="absolute right-2 top-2 btn btn-primary btn-xs"
                  >
                    {isSearching ? 'Mencari...' : 'Cari'}
                  </button>
                </div>
                
                {isSearching && (
                  <div className="flex justify-center items-center py-4">
                    <Loader2 className="animate-spin size-5 mr-2" />
                    <span className="text-sm">Mencari lokasi di Indonesia...</span>
                  </div>
                )}
                
                {searchResults.length > 0 && !isSearching && (
                  <div className="mt-3 border rounded-lg max-h-64 overflow-y-auto">
                    <div className="p-2 text-sm font-medium border-b bg-base-100">
                      Hasil Pencarian ({searchResults.length})
                    </div>
                    <div className="divide-y">
                      {searchResults.map((result, index) => (
                        <div
                          key={index}
                          onClick={() => handleLocationSelect(result)}
                          className="p-3 hover:bg-base-200 cursor-pointer transition"
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-xl mt-1">{result.icon || (result.source === 'photon' ? '📍' : '🏢')}</div>
                            <div className="flex-1">
                              <div className="font-medium">{result.name}</div>
                              {result.address && (
                                <div className="text-xs text-gray-500 mt-1 truncate">{result.address}</div>
                              )}
                              {result.type && (
                                <div className="text-xs text-primary mt-1">{result.type}</div>
                              )}
                              {result.source === 'photon' && (
                                <div className="text-xs text-gray-400 mt-1">
                                  📍 {result.lat.toFixed(6)}, {result.lng.toFixed(6)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {searchResults.length === 0 && searchQuery && !isSearching && (
                  <div className="mt-3 p-4 text-center border rounded-lg">
                    <div className="text-gray-400">Tidak ada hasil untuk "{searchQuery}"</div>
                    <div className="text-xs text-gray-500 mt-1">Coba kata kunci lain</div>
                  </div>
                )}
              </div>
            )}

            {/* ================== 2. IMPROVED OFFICE LOCATIONS ================== */}
            {selectedOption === "office" && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-medium">📍 Lokasi Kantor</div>
                  {userPosition && (
                    <div className="badge badge-sm badge-outline">
                      {nearbyOffices.length > 0 ? 'Terdekat' : 'Semua'}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {(nearbyOffices.length > 0 ? nearbyOffices : officeLocations).map((place, index) => (
                    <button
                      key={index}
                      onClick={() => handleLocationSelect(place)}
                      className="bg-base-100 border rounded-lg p-3 hover:bg-base-200 transition text-left"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{place.icon}</div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{place.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{place.type}</div>
                          {place.distance !== undefined && (
                            <div className="text-xs text-primary mt-2">
                              {place.distance < 1
                                ? `${(place.distance * 1000).toFixed(0)} m`
                                : `${place.distance.toFixed(1)} km`}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                
                {userPosition && nearbyOffices.length > 0 && (
                  <div className="mt-3 p-2 bg-primary/5 rounded text-xs text-gray-600">
                    ※ Menampilkan {nearbyOffices.length} kantor terdekat dari lokasi Anda
                  </div>
                )}
              </div>
            )}

            {/* Current Location Preview */}
            {selectedOption === "current" && !isSearching && (
              <div className="mb-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Navigation className="size-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Lokasi Saat Ini</div>
                    <div className="text-sm text-gray-500">
                      Tekan tombol di atas untuk mendapatkan lokasi Anda
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Selected Location Preview */}
            {locationName && (
              <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="font-medium flex items-center gap-2">
                  <MapPin className="size-4 text-primary" />
                  Lokasi terpilih:
                </div>
                <div className="mt-1 font-semibold">{locationName}</div>
                <button
                  onClick={() => {
                    setLocationName("");
                    setLat("");
                    setLng("");
                    toast.success("Lokasi dihapus");
                  }}
                  className="btn btn-ghost btn-xs mt-2"
                >
                  Hapus lokasi
                </button>
              </div>
            )}

            <div className="modal-action mt-6">
              <button
                onClick={() => {
                  setShowLocationModal(false);
                  setSearchQuery("");
                  setSearchResults([]);
                  setSelectedOption("");
                }}
                className="btn btn-ghost btn-sm"
              >
                Batal
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
                Simpan Lokasi
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
          setSelectedOption("");
        }}
        onLocationSelect={(location) => {
          handleLocationSelect(location);
          setSelectedOption("");
        }}
        userPosition={userPosition}
        searchQuery={searchQuery}
      />

      {/* Calendar Modal */}
      {showCalendarModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <h3 className="font-bold text-lg mb-4">Atur Tanggal Acara</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text text-sm">Tanggal</label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label-text text-sm">Waktu (opsional)</label>
                  <input
                    type="time"
                    className="input input-bordered w-full"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {["Hari Ini", "Besok", "Minggu Depan"].map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      const date = new Date();
                      if (label === "Besok") date.setDate(date.getDate() + 1);
                      if (label === "Minggu Depan")
                        date.setDate(date.getDate() + 7);
                      setEventDate(date.toISOString().split("T")[0]);
                      toast.success(`Tanggal: ${label}`);
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
                  Batal
                </button>
                <button
                  onClick={() => {
                    if (eventDate) {
                      toast.success("Tanggal disimpan!");
                      setShowCalendarModal(false);
                    } else {
                      toast.error("Pilih tanggal terlebih dahulu");
                    }
                  }}
                  className="btn btn-primary btn-sm"
                >
                  Simpan
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
            <h3 className="font-bold text-lg mb-4">Pilih Mood</h3>
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
                Hapus
              </button>
              <button
                onClick={() => setShowMoodModal(false)}
                className="btn btn-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostForm;