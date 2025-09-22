import { resetPath } from './map.js';

export function showSummary(state) {
    const el = document.getElementById('sheet');
    const { distanceMeters, durationMs, startedAt, endedAt } = state;
    const km = (distanceMeters / 1000).toFixed(2);
    const dur = formatDuration(durationMs);
    el.innerHTML = `
    <div class="badge">Distance <strong>${km} km</strong></div>
    <div class="badge">Duration <strong>${dur}</strong></div>
    <div style="margin-top:12px; display:flex; gap:12px;">
      <button id="btn-export-json">Export JSON</button>
      <button id="btn-snapshot">Save snapshot</button>
      <button id="btn-close">Close</button>
    </div>
  `;
    el.classList.add('open');

    document.getElementById('btn-close').onclick = () => {
        el.classList.remove('open');
    };
    document.getElementById('btn-export-json').onclick = () => exportJson(state);
    document.getElementById('btn-snapshot').onclick = () => snapshot();
}

function formatDuration(ms) {
    const sec = Math.floor(ms / 1000); const m = Math.floor(sec / 60); const s = sec % 60; return `${m}m ${s}s`;
}

function exportJson(state) {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `footprints-${new Date(state.startedAt).toISOString()}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function snapshot() {
    // Basic canvas capture using CSS paint; libraries like html2canvas can improve fidelity.
    alert('Snapshot functionality will render current map view in phase beta.');
}
