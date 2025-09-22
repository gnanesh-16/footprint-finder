import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

let map, userMarker, pathPolyline, parkedMarker;
let pathLatLngs = [];

export function initMap() {
    map = L.map('map', { zoomControl: false, attributionControl: false }).setView([0, 0], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
    }).addTo(map);
    userMarker = L.circleMarker([0, 0], { radius: 6, color: '#60A5FA', fillColor: '#60A5FA', fillOpacity: 1 }).addTo(map);
    pathPolyline = L.polyline([], { color: '#EAEAEA', opacity: 0.8, weight: 3, dashArray: '4 6' }).addTo(map);
}

export function getMap() { return map; }

export function updateUser(lat, lon) {
    userMarker.setLatLng([lat, lon]);
}

export function drawTrack(point) {
    const { lat, lon } = point;
    pathLatLngs.push([lat, lon]);
    pathPolyline.setLatLngs(pathLatLngs);
    updateUser(lat, lon);
}

export function recenter() {
    if (!pathLatLngs.length) return;
    map.setView(pathLatLngs[pathLatLngs.length - 1], map.getZoom());
}

export function setParkedPin([lat, lon], time) {
    if (parkedMarker) parkedMarker.remove();
    parkedMarker = L.circleMarker([lat, lon], { radius: 7, color: '#60A5FA', fillColor: '#60A5FA', fillOpacity: 1 }).addTo(map);
    parkedMarker.bindTooltip('Parked here');
}

export function resetPath() {
    pathLatLngs = [];
    pathPolyline.setLatLngs(pathLatLngs);
}
