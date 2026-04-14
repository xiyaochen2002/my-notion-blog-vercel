"use client";

import dynamic from "next/dynamic";

const NotionMap = dynamic(() => import("./NotionMap"), {
  ssr: false,
  loading: () => (
    <div className="notionMapLoading">
      <span>🗺️ 加载地图中…</span>
    </div>
  ),
});

interface Place {
  name: string;
  address: string;
}

export default function MapWrapper({ places }: { places: Place[] }) {
  return <NotionMap places={places} />;
}