let watchId = null;
let points = [];
let segments = [];
let startedAt = null;

export function getState() {
    return { points, segments, startedAt };
}

export async function startRecording(onPoint) {
    points = [];
    segments = [];
    startedAt = Date.now();
    segments.push({ type: 'start', startedAt });
    if (!('geolocation' in navigator)) throw new Error('Geolocation not supported');
    return new Promise((resolve, reject) => {
        let firstFix = false;
        watchId = navigator.geolocation.watchPosition((pos) => {
            const p = {
                lat: pos.coords.latitude,
                lon: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
                altitude: pos.coords.altitude,
                heading: pos.coords.heading,
                speed: pos.coords.speed,
                timestamp: pos.timestamp
            };
            points.push(p);
            onPoint?.(p);
            if (!firstFix) { firstFix = true; resolve(); }
        }, (err) => {
            console.warn('geo error', err);
            reject(err);
        }, { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 });
        // Resolve anyway after a timeout to avoid hanging UI, even if no fix yet
        setTimeout(() => { if (!firstFix) resolve(); }, 3000);
    });
}

export function pauseRecording() {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
        segments.push({ type: 'pause', startedAt: Date.now() });
    }
}

export async function resumeRecording(onPoint) {
    segments.push({ type: 'resume', startedAt: Date.now() });
    return startRecording(onPoint);
}

export async function stopRecording() {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
    const endedAt = Date.now();
    segments.push({ type: 'stop', startedAt, endedAt });
    const distanceMeters = calcDistance(points);
    const durationMs = endedAt - startedAt;
    return { points, segments, startedAt, endedAt, distanceMeters, durationMs };
}

function calcDistance(pts) {
    let d = 0; for (let i = 1; i < pts.length; i++) { d += haversine(pts[i - 1], pts[i]); } return d;
}
function haversine(a, b) {
    const R = 6371000; const toRad = (x) => x * Math.PI / 180;
    const dLat = toRad(b.lat - a.lat); const dLon = toRad(b.lon - a.lon);
    const lat1 = toRad(a.lat); const lat2 = toRad(b.lat);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
}
