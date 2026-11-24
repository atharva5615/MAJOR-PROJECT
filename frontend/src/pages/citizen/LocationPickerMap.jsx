import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Configure Leaflet's default marker assets for Vite.
const issueMarkerIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

// Recenter the map when GPS or manually entered coordinates change.
function MapRecenter({ center }) {
  const map = useMap();
  const [latitude, longitude] = center;

  useEffect(() => {
    map.setView([latitude, longitude], Math.max(map.getZoom(), 16), {
      animate: true,
    });
  }, [map, latitude, longitude]);

  return null;
}

// Update the selected location when the citizen clicks the map.
function MapClickHandler({ onLocationChange, disabled }) {
  useMapEvents({
    click(event) {
      if (disabled) return;

      onLocationChange(
        event.latlng.lat,
        event.latlng.lng
      );
    },
  });

  return null;
}

function LocationPickerMap({
  latitude,
  longitude,
  onLocationChange,
  disabled = false,
}) {
  const hasCoordinates =
    latitude !== "" &&
    longitude !== "" &&
    latitude != null &&
    longitude != null &&
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude)) &&
    Number(latitude) >= -90 &&
    Number(latitude) <= 90 &&
    Number(longitude) >= -180 &&
    Number(longitude) <= 180;

  if (!hasCoordinates) {
    return (
      <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
        <p className="text-sm font-medium text-slate-700">
          Map location not selected yet
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Detect your GPS location or enter valid coordinates
          to open the map.
        </p>
      </div>
    );
  }

  const center = [
    Number(latitude),
    Number(longitude),
  ];

  const handleMarkerDrag = (event) => {
    if (disabled) return;

    const position = event.target.getLatLng();

    onLocationChange(
      position.lat,
      position.lng
    );
  };

  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
      <div className="bg-blue-50 p-3">
        <p className="text-sm font-semibold text-blue-900">
          Adjust issue location on map
        </p>

        <p className="mt-1 text-xs text-blue-700">
          Click anywhere on the map or drag the pin to mark
          the exact location of the civic issue.
        </p>
      </div>

      <MapContainer
        center={center}
        zoom={16}
        scrollWheelZoom
        style={{
          height: "340px",
          width: "100%",
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter center={center} />

        <MapClickHandler
          onLocationChange={onLocationChange}
          disabled={disabled}
        />

        <Marker
          position={center}
          icon={issueMarkerIcon}
          draggable={!disabled}
          eventHandlers={{
            dragend: handleMarkerDrag,
          }}
        />
      </MapContainer>

      <div className="bg-slate-50 px-3 py-2 text-xs text-slate-500">
        Map data © OpenStreetMap contributors.
        Confirm the pin marks the actual civic issue location.
      </div>
    </div>
  );
}

export default LocationPickerMap;