import './styles/app.css';
import './styles/_tokens.css';
import { initMap, recenter, setParkedPin, drawTrack, getMap } from './map.js';
import { startRecording, pauseRecording, resumeRecording, stopRecording } from './recording.js';
import { showSummary } from './ui.js';

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
}

initMap();

const $ = (id) => document.getElementById(id);

// Try to center on user's current location on load
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        const map = getMap();
        map.setView([latitude, longitude], 17);
    }, (err) => {
        toastGeoError(err);
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
}

// Wire right-side controls
$('#btn-center')?.addEventListener('click', recenter);
$('#btn-parked')?.addEventListener('click', () => {
    const map = getMap();
    const center = map.getCenter();
    setParkedPin([center.lat, center.lng], Date.now());
});
$('#btn-compass')?.addEventListener('click', () => {
    toastError('Compass coming soon');
});

// Bottom recording controls
$('#btn-start')?.addEventListener('click', async () => {
    try {
        setRecordingUI('recording');
        await startRecording((point) => drawTrack(point));
    } catch (e) {
        setRecordingUI('idle');
        toastError(e.message || 'Failed to start recording');
    }
});
$('#btn-pause')?.addEventListener('click', () => { pauseRecording(); setRecordingUI('paused'); });
$('#btn-resume')?.addEventListener('click', () => { resumeRecording((p) => drawTrack(p)); setRecordingUI('recording'); });
$('#btn-stop')?.addEventListener('click', async () => {
    const confirmStop = confirm('Stop recording?');
    if (!confirmStop) return;
    const state = await stopRecording();
    setRecordingUI('idle');
    showSummary(state);
});

// Hamburger menu wiring
const menu = $('#menu');
const menuBackdrop = $('#menu-backdrop');
const openMenu = () => { menu?.classList.add('open'); menu?.setAttribute('aria-hidden', 'false'); };
const closeMenu = () => { menu?.classList.remove('open'); menu?.setAttribute('aria-hidden', 'true'); };
$('#btn-menu')?.addEventListener('click', openMenu);
$('#btn-menu-close')?.addEventListener('click', closeMenu);
menuBackdrop?.addEventListener('click', closeMenu);

// Menu actions mirror main controls
$('#menu-center')?.addEventListener('click', () => { recenter(); closeMenu(); });
$('#menu-parked')?.addEventListener('click', () => {
    const map = getMap();
    const c = map.getCenter();
    setParkedPin([c.lat, c.lng], Date.now());
    closeMenu();
});
$('#menu-start')?.addEventListener('click', async () => {
    try {
        closeMenu();
        setRecordingUI('recording');
        await startRecording((p) => drawTrack(p));
    } catch (e) {
        setRecordingUI('idle');
        toastError(e.message || 'Failed to start recording');
    }
});
$('#menu-pause')?.addEventListener('click', () => { pauseRecording(); setRecordingUI('paused'); closeMenu(); });
$('#menu-resume')?.addEventListener('click', () => { resumeRecording((p) => drawTrack(p)); setRecordingUI('recording'); closeMenu(); });
$('#menu-stop')?.addEventListener('click', async () => {
    closeMenu();
    const confirmStop = confirm('Stop recording?');
    if (!confirmStop) return;
    const state = await stopRecording();
    setRecordingUI('idle');
    showSummary(state);
});

function setRecordingUI(state) {
    const start = $('#btn-start');
    const pause = $('#btn-pause');
    const resume = $('#btn-resume');
    const stop = $('#btn-stop');
    // Desktop buttons
    if (state === 'recording') {
        start?.setAttribute('disabled', 'true');
        pause?.removeAttribute('disabled');
        resume?.setAttribute('disabled', 'true');
        stop?.removeAttribute('disabled');
    } else if (state === 'paused') {
        start?.setAttribute('disabled', 'true');
        pause?.setAttribute('disabled', 'true');
        resume?.removeAttribute('disabled');
        stop?.removeAttribute('disabled');
    } else { // idle
        start?.removeAttribute('disabled');
        pause?.setAttribute('disabled', 'true');
        resume?.setAttribute('disabled', 'true');
        stop?.setAttribute('disabled', 'true');
    }
    // Mirror menu buttons
    const mStart = $('#menu-start');
    const mPause = $('#menu-pause');
    const mResume = $('#menu-resume');
    const mStop = $('#menu-stop');
    if (state === 'recording') {
        mStart?.setAttribute('disabled', 'true');
        mPause?.removeAttribute('disabled');
        mResume?.setAttribute('disabled', 'true');
        mStop?.removeAttribute('disabled');
    } else if (state === 'paused') {
        mStart?.setAttribute('disabled', 'true');
        mPause?.setAttribute('disabled', 'true');
        mResume?.removeAttribute('disabled');
        mStop?.removeAttribute('disabled');
    } else {
        mStart?.removeAttribute('disabled');
        mPause?.setAttribute('disabled', 'true');
        mResume?.setAttribute('disabled', 'true');
        mStop?.setAttribute('disabled', 'true');
    }
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
