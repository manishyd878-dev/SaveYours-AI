import path from 'path';
import { fileURLToPath } from 'url';

const d = path.dirname(fileURLToPath(import.meta.url));

for (const f of ['../../.env', '../.env']) {
  try {
    process.loadEnvFile(path.join(d, f));
    console.log('Loaded env from:', f);
  } catch (e) {
    console.log('Could not load:', f, e.message);
  }
}

console.log('Gemini key loaded:', Boolean(process.env.GEMINI_API_KEY));

const { createApp } = await import('./app.js');
const p = process.env.PORT || 4000;

createApp().listen(p, () => {
  console.log(`EchoShield on http://localhost:${p}`);
});