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

/** Centra el mapa y ajusta zoom según precisión del GPS (radio más pequeño → más zoom). */
function MapFitCenter({ lat, lng, accuracyM }) {
  const map = useMap();
  useEffect(() => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    let zoom = 17;
    if (accuracyM != null && Number.isFinite(accuracyM)) {
      if (accuracyM <= 15) zoom = 19;
      else if (accuracyM <= 35) zoom = 18;
      else if (accuracyM <= 80) zoom = 17;
      else zoom = 16;
    }
    map.setView([lat, lng], zoom);
  }, [lat, lng, accuracyM, map]);
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

  /**
   * Varías lecturas GPS con watchPosition y nos quedamos con la de mejor precisión (menor radio).
   * Una sola llamada a getCurrentPosition suele dar ~50–200 m en desktop; esto reduce el error típico.
   */
  const locateBrowser = () => {
    if (disabled || typeof navigator === "undefined" || !navigator.geolocation) {
      alert("Geolocalización no disponible en este dispositivo.");
      return;
    }

    setLocatingBrowser(true);
    setGeoError("");

    let best = null;
    let watchId = null;
    let timeoutId = null;
    let settled = false;
    const started = Date.now();
    const MAX_MS = 22000;
    /** Si llegamos a este radio (metros), podemos cortar antes (GPS real en teléfono). */
    const GOOD_ENOUGH_M = 22;
    const MIN_MS_BEFORE_EARLY_EXIT = 2800;

    const cleanupWatch = () => {
      if (watchId != null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
    };

    const done = async (reading) => {
      if (settled) return;
      settled = true;
      if (timeoutId != null) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }
      cleanupWatch();
      if (!reading) {
        setLocatingBrowser(false);
        setGeoError("No se obtuvo ubicación. Revisá permisos o marcá el punto en el mapa.");
        return;
      }
      await emitPoint(reading.lat, reading.lng, { accuracyM: reading.accuracy });
      setLocatingBrowser(false);
    };

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const acc = pos.coords.accuracy ?? 99999;
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (!best || acc < best.accuracy) {
          best = { lat, lng, accuracy: acc };
        }
        const elapsed = Date.now() - started;
        if (acc <= GOOD_ENOUGH_M && elapsed >= MIN_MS_BEFORE_EARLY_EXIT) {
          void done(best);
        }
      },
      () => {
        void done(best);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 28000 }
    );

    timeoutId = window.setTimeout(() => void done(best), MAX_MS);
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
            {/* Calles OSM estándar: suele alinearse mejor con coordenadas GPS que fotos aéreas antiguas/desplazadas. */}
            <LayersControl.BaseLayer name="Calles OSM (referencia GPS)">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
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
            Esperamos unos segundos para tomar la lectura más precisa. Si el pin sigue corrido respecto al satélite, probá la capa{" "}
            <span className="text-slate-400">«Calles OSM (referencia GPS)»</span>: a veces la foto aérea está desfasada respecto al GPS real.
          </p>
          <p>
            Arrastrá el punto hasta tu entrada si hace falta: las coordenadas guardadas son las del pin, no una estimación automática.
          </p>
          <p>La dirección se obtiene por Nominatim según esas coordenadas.</p>
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
