/**
 * Geocodificación inversa vía OpenStreetMap Nominatim.
 * Políticas de uso: https://operations.osmfoundation.org/policies/nominatim/
 * Solo una petición cuando el usuario fija punto; Identificación vía User-Agent genérico.
 */
const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/reverse";

export async function reverseGeocodeLatLng(lat, lng) {
  const url = new URL(NOMINATIM_ENDPOINT);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("accept-language", "es");
  /* zoom 18 = máximo detalle en dirección (calle/número cuando exista en OSM). */
  url.searchParams.set("zoom", "18");

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Nominatim ${res.status}`);
  }

  const data = await res.json();
  const a = data.address || {};

  return {
    display: data.display_name || "",
    lat,
    lng,
    address: {
      road: a.road || a.pedestrian || a.path || "",
      house_number: a.house_number || "",
      suburb: a.suburb || a.neighbourhood || a.city_district || "",
      locality: a.city || a.town || a.village || a.municipality || a.city_district || "",
      municipality: a.municipality || a.county || "",
      province: a.state || a.region || "",
      country: a.country || "",
      postcode: a.postcode || "",
    },
    raw: data,
  };
}
