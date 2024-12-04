import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapComponent = () => {
  return (
<MapContainer
  center={[21.0285, 105.8542]}  // Tọa độ Hà Nội
  zoom={12}  // Mức zoom phù hợp với thành phố
  style={{ height: "100vh" }}
>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
  />
</MapContainer>

  );
};

export default MapComponent;