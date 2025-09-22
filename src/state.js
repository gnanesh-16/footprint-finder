// centralize button state logic for simple smoke testing and reuse
// states: 'idle' | 'recording' | 'paused'
export function computeButtonStates(state) {
    const base = {
        start: false,
        pause: true,
        resume: true,
        stop: true,
    };
    if (state === 'recording') {
        return { start: true, pause: false, resume: true, stop: false };
    }
    if (state === 'paused') {
        return { start: true, pause: true, resume: false, stop: false };
    }
    return base; // idle
}
