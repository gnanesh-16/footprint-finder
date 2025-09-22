import './styles/app.css';
import './styles/_tokens.css';
import { initMap, setParkedPin, drawTrack, getMap, updateUser } from './map.js';
import { startRecording, pauseRecording, resumeRecording, stopRecording } from './recording.js';
import { computeButtonStates } from './state.js';
import { showSummary } from './ui.js';

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
}

initMap();

const $ = (id) => document.getElementById(id);

// Try to center on user's current location on load
let lastKnown = null;
if (navigator.geolocation) {
    setGpsPending(true);
    navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        const map = getMap();
        map.setView([latitude, longitude], 17);
        updateUser(latitude, longitude);
        lastKnown = { lat: latitude, lon: longitude };
        setGpsPending(false);
    }, (err) => {
        toastGeoError(err);
        setGpsPending(false);
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
}

// Wire right-side controls
function recenterToCurrent() {
    if (!navigator.geolocation) return;
    setGpsPending(true);
    navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        const map = getMap();
        map.setView([latitude, longitude], 17);
        updateUser(latitude, longitude);
        lastKnown = { lat: latitude, lon: longitude };
        setGpsPending(false);
    }, (err) => {
        if (lastKnown) {
            const map = getMap();
            map.setView([lastKnown.lat, lastKnown.lon], 17);
            updateUser(lastKnown.lat, lastKnown.lon);
        } else {
            toastGeoError(err);
        }
        setGpsPending(false);
    }, { enableHighAccuracy: true, timeout: 8000, maximumAge: 5000 });
}
const onTap = (el, fn) => {
    el?.addEventListener('click', fn);
    el?.addEventListener('touchend', (e) => { e.preventDefault(); fn(e); }, { passive: false });
};
onTap($('#btn-center'), recenterToCurrent);
onTap($('#btn-parked'), () => {
    const map = getMap();
    const center = map.getCenter();
    setParkedPin([center.lat, center.lng], Date.now());
});
onTap($('#btn-compass'), () => { toastError('Compass coming soon'); });

// Bottom recording controls
onTap($('#btn-start'), async () => {
    try {
        setRecordingUI('recording');
        await startRecording((point) => drawTrack(point));
    } catch (e) {
        setRecordingUI('idle');
        toastError(e.message || 'Failed to start recording');
    }
});
onTap($('#btn-pause'), () => { pauseRecording(); setRecordingUI('paused'); });
onTap($('#btn-resume'), () => { resumeRecording((p) => drawTrack(p)); setRecordingUI('recording'); });
onTap($('#btn-stop'), async () => {
    const confirmStop = confirm('Stop recording?');
    if (!confirmStop) return;
    const state = await stopRecording();
    setRecordingUI('idle');
    disableHamburger(true);
    showSummary(state);
});

// Hamburger menu wiring
const menu = $('#menu');
const menuBackdrop = $('#menu-backdrop');
const openMenu = () => { menu?.classList.add('open'); menu?.setAttribute('aria-hidden', 'false'); };
const closeMenu = () => { menu?.classList.remove('open'); menu?.setAttribute('aria-hidden', 'true'); };
const btnMenu = $('#btn-menu');
btnMenu?.addEventListener('click', openMenu);
btnMenu?.addEventListener('touchend', (e) => { e.preventDefault(); openMenu(); }, { passive: false });
$('#btn-menu-close')?.addEventListener('click', closeMenu);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
menuBackdrop?.addEventListener('click', closeMenu);

// Menu actions mirror main controls
onTap($('#menu-center'), () => { recenterToCurrent(); closeMenu(); });
onTap($('#menu-parked'), () => {
    const map = getMap();
    const c = map.getCenter();
    setParkedPin([c.lat, c.lng], Date.now());
    closeMenu();
});
onTap($('#menu-start'), async () => {
    try {
        closeMenu();
        setRecordingUI('recording');
        await startRecording((p) => drawTrack(p));
    } catch (e) {
        setRecordingUI('idle');
        toastError(e.message || 'Failed to start recording');
    }
});
onTap($('#menu-pause'), () => { pauseRecording(); setRecordingUI('paused'); closeMenu(); });
onTap($('#menu-resume'), () => { resumeRecording((p) => drawTrack(p)); setRecordingUI('recording'); closeMenu(); });
onTap($('#menu-stop'), async () => {
    closeMenu();
    const confirmStop = confirm('Stop recording?');
    if (!confirmStop) return;
    const state = await stopRecording();
    setRecordingUI('idle');
    disableHamburger(true);
    showSummary(state);
});

function setRecordingUI(state) {
    const mapBtn = (el, disabled) => disabled ? el?.setAttribute('disabled', 'true') : el?.removeAttribute('disabled');
    const desktop = {
        start: $('#btn-start'), pause: $('#btn-pause'), resume: $('#btn-resume'), stop: $('#btn-stop')
    };
    const menu = {
        start: $('#menu-start'), pause: $('#menu-pause'), resume: $('#menu-resume'), stop: $('#menu-stop')
    };
    const states = computeButtonStates(state);
    mapBtn(desktop.start, states.start);
    mapBtn(desktop.pause, states.pause);
    mapBtn(desktop.resume, states.resume);
    mapBtn(desktop.stop, states.stop);
    mapBtn(menu.start, states.start);
    mapBtn(menu.pause, states.pause);
    mapBtn(menu.resume, states.resume);
    mapBtn(menu.stop, states.stop);
}

// Initialize to idle state
setRecordingUI('idle');

function toastGeoError(err) {
    const code = err?.code;
    let msg = 'Location error.';
    if (code === 1) msg = 'Location permission denied. Please allow location access.';
    else if (code === 2) msg = 'Location unavailable. Try moving to an open area.';
    else if (code === 3) msg = 'Location timeout. Try again.';
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        msg += ' Note: Most mobile browsers require HTTPS for GPS access.';
    }
    // Simple inline toast
    const sheet = document.getElementById('sheet');
    if (sheet && !sheet.classList.contains('open')) {
        sheet.innerHTML = `<div class="badge">${msg}</div>`;
        sheet.classList.add('open');
        setTimeout(() => sheet.classList.remove('open'), 4000);
    } else {
        alert(msg);
    }
}

function toastError(msg) {
    const sheet = document.getElementById('sheet');
    if (sheet && !sheet.classList.contains('open')) {
        sheet.innerHTML = `<div class="badge">${msg}</div>`;
        sheet.classList.add('open');
        setTimeout(() => sheet.classList.remove('open'), 3000);
    } else {
        alert(msg);
    }
}

function setGpsPending(pending) {
    const el = document.getElementById('gps-status');
    if (!el) return;
    if (pending) el.removeAttribute('hidden'); else el.setAttribute('hidden', '');
}

function disableHamburger(disabled) {
    const btn = document.getElementById('btn-menu');
    if (!btn) return;
    if (disabled) btn.setAttribute('disabled', 'true'); else btn.removeAttribute('disabled');
}
