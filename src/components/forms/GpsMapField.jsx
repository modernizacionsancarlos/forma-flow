import { useEffect, useMemo, useState, useCallback } from "react";
import L from "leaflet";
import {
  Circle,
  LayersControl,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
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
  /** Radio en metros del último fix GPS (HTML5); null si el punto lo fijó el usuario en el mapa. */
  const [accuracyRadiusM, setAccuracyRadiusM] = useState(null);

  useEffect(() => {
    if (parsed?.lat != null && parsed?.lng != null) {
      setCenter({ lat: parsed.lat, lng: parsed.lng });
    }
  }, [parsed?.lat, parsed?.lng]);

  const emitPoint = useCallback(
    async (lat, lng, opts = {}) => {
      if (disabled) return;
      const acc = opts.accuracyM;
      if (typeof acc === "number" && Number.isFinite(acc)) {
        setAccuracyRadiusM(Math.min(Math.max(acc, 6), 1500));
      } else {
        setAccuracyRadiusM(null);
      }

      setGeoError("");
      setGeocoding(true);
      try {
        const enriched = await reverseGeocodeLatLng(lat, lng);
        onChange({
          lat,
          lng,
          display: enriched.display,
          address: enriched.address,
          ...(typeof acc === "number" && Number.isFinite(acc) ? { accuracy_m: Math.round(acc) } : {}),
        });
        setCenter({ lat, lng });
      } catch (err) {
        console.warn("Reverse geocode:", err);
        setGeoError("No se pudo obtener la dirección. Coordenadas guardadas.");
        onChange({
          lat,
          lng,
          display: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          address: {},
          ...(typeof acc === "number" && Number.isFinite(acc) ? { accuracy_m: Math.round(acc) } : {}),
        });
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
        void emitPoint(pos.coords.latitude, pos.coords.longitude, {
          accuracyM: pos.coords.accuracy ?? undefined,
        }).finally(() => setLocatingBrowser(false));
      },
      () => {
        alert("No se pudo obtener la ubicación. Verifique permisos.");
        setLocatingBrowser(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 25000,
        maximumAge: 0,
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
          zoom={17}
          className="forma-flow-gps-map z-0 h-72 w-full"
          scrollWheelZoom={!disabled}
          dragging={!disabled}
          doubleClickZoom={!disabled}
        >
          <LayersControl position="topright">
            {/* Imagen aérea: permite ver manzanas, techos y orientarse (Esri World Imagery). */}
            <LayersControl.BaseLayer checked name="Satélite (edificios)">
              <TileLayer
                attribution='Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Mapa oscuro (calles)">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                subdomains="abcd"
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          <ClickToPlace disabled={disabled} onPick={(la, ln) => emitPoint(la, ln)} />
          <MapFitCenter lat={center.lat} lng={center.lng} accuracyM={accuracyRadiusM} />

          {accuracyRadiusM != null && accuracyRadiusM > 0 && (
            <Circle
              center={[center.lat, center.lng]}
              radius={accuracyRadiusM}
              pathOptions={{
                color: "#34d399",
                weight: 2,
                fillColor: "#10b981",
                fillOpacity: 0.12,
                dashArray: "6 8",
                interactive: false,
              }}
            />
          )}

          <Marker
            position={[center.lat, center.lng]}
            icon={gpsDivIcon}
            draggable={!disabled}
            eventHandlers={{
              dragend: (e) => {
                const { lat: la, lng: ln } = e.target.getLatLng();
                emitPoint(la, ln);
              },
            }}
          />
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
        <div className="space-y-1 text-[9px] font-bold uppercase tracking-tight text-slate-600">
          <p>
            El GPS del navegador puede desviarse varias cuadras (sobre todo en PC con Wi‑Fi). Si ves el círculo verde, tu posición probable está dentro de ese radio: tocá el mapa en satélite o arrastrá el punto hasta tu ubicación exacta.
          </p>
          <p>La dirección se consulta en OpenStreetMap (Nominatim) según las coordenadas del punto.</p>
        </div>
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
