"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// 修复 Leaflet 默认 marker 图标在 Next.js 里丢失的问题
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Place {
  name: string;
  address: string;
}

interface GeocodedPlace extends Place {
  lat: number;
  lng: number;
}

// 自动调整地图视野以包含所有 marker
function FitBounds({ places }: { places: GeocodedPlace[] }) {
  const map = useMap();
  useEffect(() => {
    if (places.length === 0) return;
    if (places.length === 1) {
      map.setView([places[0].lat, places[0].lng], 14);
    } else {
      const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [places, map]);
  return null;
}

export default function NotionMap({ places }: { places: Place[] }) {
  const [geocoded, setGeocoded] = useState<GeocodedPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function geocodeAll() {
      try {
        const results = await Promise.all(
          places.map(async (place) => {
            // 用 Nominatim（OpenStreetMap 免费地理编码）把地址转成坐标
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              place.address
            )}&limit=1`;
            const res = await fetch(url, {
              headers: { "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8" },
            });
            const data = await res.json();
            if (data && data[0]) {
              return {
                ...place,
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
              };
            }
            return null;
          })
        );
        setGeocoded(results.filter(Boolean) as GeocodedPlace[]);
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    geocodeAll();
  }, [places]);

  if (loading) {
    return (
      <div className="notionMapLoading">
        <span>🗺️ 加载地图中…</span>
      </div>
    );
  }

  if (error || geocoded.length === 0) {
    return (
      <div className="notionMapEmpty">
        <p>📍 无法加载地图位置。</p>
      </div>
    );
  }

  // 初始中心点取第一个地点
  const center: [number, number] = [geocoded[0].lat, geocoded[0].lng];

  return (
    <div className="notionMap">
      <MapContainer
        center={center}
        zoom={13}
        className="notionMapIframe"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds places={geocoded} />
        {geocoded.map((place, i) => (
          <Marker key={i} position={[place.lat, place.lng]} icon={defaultIcon}>
            <Popup>
              <strong>{place.name}</strong>
              <br />
              <span style={{ color: "#666", fontSize: "12px" }}>{place.address}</span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* 地点列表 */}
      <ul className="notionMapList">
        {geocoded.map((p, i) => (
          <li key={i} className="notionMapItem">
            <span className="notionMapPin">📍</span>
            <div>
              <strong>{p.name}</strong>
              <span>{p.address}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}