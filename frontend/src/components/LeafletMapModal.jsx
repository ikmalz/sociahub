import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, X, MapPin, Navigation } from "lucide-react";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const createCustomIcon = () => {
  return L.divIcon({
    html: `
      <div class="w-6 h-6 bg-primary rounded-full border-2 border-white shadow-md flex items-center justify-center">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });
};

function SetViewOnClick({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position && position.length === 2) {
      map.setView(position, 16, { animate: true });
    }
  }, [position, map]);
  return null;
}

function LocationMarker({ position, setPosition, setLocationName }) {
  const map = useMap();

  useEffect(() => {
    const handleClick = (e) => {
      const newPos = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      setLocationName("Location selected");
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [map, setPosition, setLocationName]);

  return position ? (
    <Marker position={position} icon={createCustomIcon()} />
  ) : null;
}

const LeafletMapModal = ({
  isOpen,
  onClose,
  onLocationSelect,
  userPosition,
  searchQuery: initialSearchQuery,
}) => {
  const [position, setPosition] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || "");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const searchTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);

  const defaultCenter = userPosition
    ? [userPosition.lat, userPosition.lng]
    : [-6.2088, 106.8456];
  const defaultZoom = userPosition ? 15 : 12;

  const searchLocation = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}+Indonesia&limit=5&addressdetails=1`
      );

      if (!response.ok) throw new Error("API error");

      const data = await response.json();

      if (data && data.length > 0) {
        const results = data.map((item) => {
          const address = item.address || {};
          return {
            name: item.display_name.split(",")[0],
            address: [address.city, address.state].filter(Boolean).join(", "),
            position: [parseFloat(item.lat), parseFloat(item.lon)],
          };
        });

        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchLocation(searchQuery);
      }, 500);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchLocation]);

  const handleSelectResult = (result) => {
    setPosition(result.position);
    setLocationName(result.name);
    setSearchResults([]);
    setSearchQuery(result.name);
  };

  const handleSave = () => {
    if (position) {
      onLocationSelect({
        name: locationName || "Selected Locations",
        lat: position[0],
        lng: position[1],
      });
      onClose();
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Browser does not support geolocation");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = [pos.coords.latitude, pos.coords.longitude];
        setPosition(newPos);
        setLocationName("Current Location");
      },
      (error) => {
        alert("Cannot access your location");
      }
    );
  };

  useEffect(() => {
    if (initialSearchQuery && isOpen) {
      setSearchQuery(initialSearchQuery);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, initialSearchQuery]);

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl p-0 max-h-[85vh] flex flex-col">
        <div className="p-4 border-b flex items-center justify-between bg-base-200">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg capitalize">
              Select location
            </h3>
          </div>

          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Section */}
        <div className="p-4 border-b bg-base-100 relative">
          <div className="relative">
            <Search className="w-4 h-4 opacity-60 absolute left-3 top-1/2 -translate-y-1/2" />

            <input
              ref={searchInputRef}
              type="text"
              className="input input-bordered w-full pl-10 pr-28"
              placeholder="Search location (Indonesia)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {isSearching ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <button
                  onClick={() => searchLocation(searchQuery)}
                  className="btn btn-primary btn-sm"
                >
                  Search
                </button>
              )}
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="absolute top-full left-4 right-4 mt-2 z-50">
              <ul className="menu bg-base-100 rounded-box shadow max-h-60 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      onClick={() => handleSelectResult(result)}
                      className="flex flex-col items-start"
                    >
                      <span className="font-medium text-sm">{result.name}</span>
                      {result.address && (
                        <span className="text-xs opacity-60">
                          {result.address}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Main Content - Simple Layout */}
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-4">
            {/* Map Section */}
            <div
              className="border rounded-lg overflow-hidden"
              style={{ height: "300px" }}
            >
              <MapContainer
                center={defaultCenter}
                zoom={defaultZoom}
                style={{ height: "100%", width: "100%" }}
                className="rounded-lg"
              >
                <TileLayer
                  attribution="© OpenStreetMap"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker
                  position={position}
                  setPosition={setPosition}
                  setLocationName={setLocationName}
                />
                <SetViewOnClick position={position} />
              </MapContainer>
            </div>

            <div className="card bg-base-200">
              <div className="card-body p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Selected location</h4>
                    <p className="text-sm opacity-70">
                      {position ? locationName : "No location selected"}
                    </p>
                  </div>
                </div>

                {position && (
                  <div className="mt-4">
                    <label className="label">
                      <span className="label-text">Location name</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleUseCurrentLocation}
                className="btn btn-outline btn-sm flex-1 flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                My location
              </button>
              <button
                onClick={() => {
                  setPosition([-6.2088, 106.8456]);
                  setLocationName("Jakarta");
                }}
                className="btn btn-outline btn-sm flex-1"
              >
                Jakarta
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-base-200">
          <div className="flex gap-2">
            <button onClick={onClose} className="btn btn-ghost flex-1">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!position}
              className="btn btn-primary flex-1"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeafletMapModal;
