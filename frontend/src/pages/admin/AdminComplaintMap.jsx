
import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import api from "../../services/api";

// Automatically adjust the map to show the visible complaints.
function FitComplaintPoints({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;

    const coordinates = points.map((point) => [
      Number(point.latitude),
      Number(point.longitude),
    ]);

    if (coordinates.length === 1) {
      map.setView(coordinates[0], 15);
    } else {
      map.fitBounds(coordinates, {
        padding: [120, 100],
        maxZoom: 15,
      });
    }
  }, [map, points]);

  return null;
}

function AdminComplaintMap() {
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");

  useEffect(() => {
    let active = true;

    const fetchGeospatialData = async () => {
      try {
        const response = await api.get("/dashboard/geospatial");

        if (active) {
          setGeoData(response.data);
        }
      } catch (err) {
        if (active) {
          const detail = err.response?.data?.detail;

          setError(
            typeof detail === "string"
              ? detail
              : "Unable to load geographic complaint data."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchGeospatialData();

    return () => {
      active = false;
    };
  }, []);

  const complaints = useMemo(
    () => geoData?.points ?? [],
    [geoData?.points]
    );

  const categories = useMemo(
    () => [...new Set(complaints.map((item) => item.category))].sort(),
    [complaints]
  );

  const filteredPoints = useMemo(() => {
    return complaints.filter((point) => {
      const matchesCategory =
        selectedCategory === "All" ||
        point.category === selectedCategory;

      const matchesStatus =
        selectedStatus === "All" ||
        point.status?.toLowerCase() === selectedStatus;

      const matchesPriority =
        selectedPriority === "All" ||
        point.priority?.toLowerCase() === selectedPriority;

      return (
        matchesCategory &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    complaints,
    selectedCategory,
    selectedStatus,
    selectedPriority,
  ]);

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "critical":
        return "#dc2626";
      case "high":
        return "#ea580c";
      case "medium":
        return "#eab308";
      case "low":
        return "#16a34a";
      default:
        return "#2563eb";
    }
  };

  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900">
          Geographic Complaint Distribution
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Explore reported civic issues across their geographic locations.
        </p>

        {!loading && !error && (
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span>
              Total: <strong>{geoData?.total_issues ?? 0}</strong>
            </span>

            <span className="text-green-700">
              Mapped: <strong>{geoData?.mapped_issues ?? 0}</strong>
            </span>

            <span className="text-orange-700">
              Unmapped: <strong>{geoData?.unmapped_issues ?? 0}</strong>
            </span>
          </div>
        )}
      </div>

      {!loading && !error && (
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white p-2 text-sm"
          >
            <option value="All">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white p-2 text-sm"
          >
            <option value="All">All Statuses</option>
            <option value="reported">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white p-2 text-sm"
          >
            <option value="All">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <span className="self-center text-sm text-slate-500">
            Showing {filteredPoints.length} of {complaints.length} mapped complaints
          </span>
        </div>
      )}

      {loading && (
        <p className="p-8 text-center text-slate-500">
          Loading geographic complaint data...
        </p>
      )}

      {error && (
        <p className="m-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <div className="relative z-0">
            <MapContainer
              center={[20, 0]}
              zoom={2}
              scrollWheelZoom
              style={{
                height: "460px",
                width: "100%",
              }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <FitComplaintPoints points={filteredPoints} />

              {filteredPoints.map((point) => (
                <CircleMarker
                  key={point.id}
                  center={[
                    Number(point.latitude),
                    Number(point.longitude),
                  ]}
                  radius={9}
                  pathOptions={{
                    color: getPriorityColor(point.priority),
                    fillColor: getPriorityColor(point.priority),
                    fillOpacity: 0.8,
                    weight: 2,
                  }}
                >
                  <Popup autoPanPadding={[80, 80]}>
                    <div className="min-w-48 space-y-2">
                      <strong>{point.title}</strong>

                      <p className="text-sm">
                        Category: {point.category}
                      </p>

                      <p className="text-sm">
                        Priority: {point.priority}
                      </p>

                      <p className="text-sm">
                        Status: {point.status}
                      </p>

                      {point.address && (
                        <p className="text-sm">
                          Location: {point.address}
                        </p>
                      )}
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>

          <div className="flex flex-wrap gap-5 border-t border-slate-200 p-4 text-xs text-slate-600">
            {[
              ["#dc2626", "Critical"],
              ["#ea580c", "High"],
              ["#eab308", "Medium"],
              ["#16a34a", "Low"],
              ["#2563eb", "Other"],
            ].map(([color, label]) => (
              <div key={label} className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {label}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default AdminComplaintMap;
