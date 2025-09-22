import express from 'express';
import path from 'path';
import compression from 'compression';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5174;

app.use(compression());

// Security headers
app.use((req, res, next) => {
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '0');
    res.setHeader('Permissions-Policy', 'geolocation=(self), microphone=(), camera=(), accelerometer=(self), gyroscope=(self)');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    // CSP allows OSM tiles and self assets; adjust as needed
    res.setHeader('Content-Security-Policy', [
        "default-src 'self'",
        "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://tile.openstreetmap.org",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "connect-src 'self' https://*.tile.openstreetmap.org https://tile.openstreetmap.org",
        "worker-src 'self' blob:",
        "child-src 'none'",
        "frame-ancestors 'none'"
    ].join('; '));
    next();
});

const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath, { maxAge: '1y', immutable: true }));

app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Footprints Finder web server running on http://localhost:${PORT}`);
});
