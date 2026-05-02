import { useEffect, useMemo, useState, useCallback } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { MapPin, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { reverseGeocodeLatLng } from "../../lib/nominatim";
import { parseGpsFormValue } from "../../lib/gpsValue";

/** Marcador circular acorde al tema esmeralda / oscuro — evita sprites rotos en Vite. */
const gpsDivIcon = L.divIcon({
  className: "leaflet-gps-pin",
  html: `<div style="width:16px;height:16px;border-radius:9999px;background:#10b981;border:2px solid #f8fafc;box-shadow:0 2px 12px rgba(16,185,129,0.45)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const DEFAULT_LATLNG = { lat: -34.6037, lng: -58.3816 };

function MapFitCenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      map.setView([lat, lng], map.getZoom() < 13 ? 15 : map.getZoom());
    }
  }, [lat, lng, map]);
  return null;
}

function ClickToPlace({ disabled, onPick }) {
  useMapEvents({
    click(e) {
      if (disabled) return;
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/**
 * Selector de punto en mapa (tema oscuro Carto) + dirección estimada por Nominatim.
 */
export default function GpsMapField({ value, onChange, label, error, disabled }) {
  const parsed = useMemo(() => parseGpsFormValue(value), [value]);

  const [center, setCenter] = useState(() => ({
    lat: parsed?.lat ?? DEFAULT_LATLNG.lat,
    lng: parsed?.lng ?? DEFAULT_LATLNG.lng,
  }));
  const [geocoding, setGeocoding] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [locatingBrowser, setLocatingBrowser] = useState(false);

  useEffect(() => {
    if (parsed?.lat != null && parsed?.lng != null) {
      setCenter({ lat: parsed.lat, lng: parsed.lng });
    }
  }, [parsed?.lat, parsed?.lng]);

  const emitPoint = useCallback(
    async (lat, lng) => {
      if (disabled) return;
      setGeoError("");
      setGeocoding(true);
      try {
        const enriched = await reverseGeocodeLatLng(lat, lng);
        onChange({
          lat,
          lng,
          display: enriched.display,
          address: enriched.address,
        });
        setCenter({ lat, lng });
      } catch (err) {
        console.warn("Reverse geocode:", err);
        setGeoError("No se pudo obtener la dirección. Coordenadas guardadas.");
        onChange({ lat, lng, display: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, address: {} });
        setCenter({ lat, lng });
      } finally {
        setGeocoding(false);
      }
    },
    [disabled, onChange]
  );

  const locateBrowser = () => {
    if (disabled || typeof navigator === "undefined" || !navigator.geolocation) {
      alert("Geolocalización no disponible en este dispositivo.");
      return;
    }
    setLocatingBrowser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void emitPoint(pos.coords.latitude, pos.coords.longitude).finally(() => setLocatingBrowser(false));
      },
      () => {
        alert("No se pudo obtener la ubicación. Verifique permisos.");
        setLocatingBrowser(false);
      }
    );
  };

  const { road, house_number, suburb, locality, municipality, province, country } = parsed?.address || {};

  return (
    <div className={`space-y-4 ${disabled ? "opacity-60" : ""}`}>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</label>

      <div className="overflow-hidden rounded-2xl border-2 border-slate-800 bg-slate-950 shadow-inner ring-1 ring-white/5">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={15}
          className="forma-flow-gps-map z-0 h-64 w-full"
          scrollWheelZoom={!disabled}
          dragging={!disabled}
          doubleClickZoom={!disabled}
        >
          {/* Capa oscura acorde al panel municipal (Carto Dark Matter — OSM attribution). */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
          />
          <ClickToPlace disabled={disabled} onPick={emitPoint} />
          <MapFitCenter lat={center.lat} lng={center.lng} />
          <Marker position={[center.lat, center.lng]} icon={gpsDivIcon} draggable={!disabled} eventHandlers={{
            dragend: (e) => {
              const { lat: la, lng: ln } = e.target.getLatLng();
              emitPoint(la, ln);
            },
          }} />
        </MapContainer>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={locateBrowser}
          disabled={disabled || locatingBrowser || geocoding}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl transition-colors hover:bg-slate-800 disabled:opacity-50"
        >
          {locatingBrowser ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
          {parsed ? "GPS del dispositivo" : "Usar mi ubicación"}
        </button>
        {(geocoding || locatingBrowser) && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/80">
            Actualizando dirección…
          </span>
        )}
      </div>

      {(road || locality || suburb || province || country || parsed?.display) && (
        <dl className="grid gap-2 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 text-[11px] text-slate-300">
          <div className="col-span-full text-[10px] font-black uppercase tracking-wider text-emerald-500/90">
            Dirección (autocompletada)
          </div>
          {[
            ["Calle y altura", [road, house_number].filter(Boolean).join(" ").trim()],
            ["Barrio / localidad", suburb || locality || municipality],
            ["Provincia / departamento", province],
            ["País", country],
          ].map(([title, txt]) =>
            txt ? (
              <div key={title} className="border-b border-slate-800/60 pb-2 last:border-0 md:grid md:grid-cols-[8rem_1fr] md:gap-2">
                <dt className="text-slate-500">{title}</dt>
                <dd className="font-semibold text-slate-200">{txt}</dd>
              </div>
            ) : null
          )}
          {parsed?.display && !(road || locality) && (
            <p className="col-span-full text-[11px] leading-relaxed text-slate-400">{parsed.display}</p>
          )}
        </dl>
      )}

      {geoError && <p className="text-[10px] font-bold uppercase text-amber-500/90">{geoError}</p>}
      {!disabled && (
        <p className="text-[9px] font-bold uppercase tracking-tight text-slate-600">
          Toca el mapa o arrastra el punto. La dirección se consulta en OpenStreetMap (Nominatim).
        </p>
      )}

      {error && (
        <p className="flex items-center space-x-2 text-[10px] font-black uppercase text-red-500">
          <span>{error}</span>
        </p>
      )}

      <style>{`
        .forma-flow-gps-map .leaflet-control-attribution {
          font-size: 10px !important;
          background: rgba(15,23,42,0.92) !important;
          color: #94a3b8 !important;
        }
      `}</style>
    </div>
  );
}
