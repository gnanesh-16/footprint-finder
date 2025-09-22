import { describe, it, expect } from 'vitest';
import { computeButtonStates } from '../src/state.js';

describe('computeButtonStates', () => {
    it('idle -> only start enabled', () => {
        const s = computeButtonStates('idle');
        expect(s.start).toBe(false);
        expect(s.pause).toBe(true);
        expect(s.resume).toBe(true);
        expect(s.stop).toBe(true);
    });
    it('recording -> pause/stop enabled', () => {
        const s = computeButtonStates('recording');
        expect(s.start).toBe(true);
        expect(s.pause).toBe(false);
        expect(s.resume).toBe(true);
        expect(s.stop).toBe(false);
    });
    it('paused -> resume/stop enabled', () => {
        const s = computeButtonStates('paused');
        expect(s.start).toBe(true);
        expect(s.pause).toBe(true);
        expect(s.resume).toBe(false);
        expect(s.stop).toBe(false);
    });
});
