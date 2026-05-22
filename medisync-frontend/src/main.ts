import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => {
    console.error(err);
    document.body.style.background = '#0a0a0a';
    document.body.innerHTML = `
      <div style="color:#ff4d6d;background:#0d1526;border:1px solid #ff4d6d;padding:32px;
                  margin:40px auto;max-width:800px;border-radius:12px;font-family:monospace;">
        <h2 style="color:#ff4d6d;margin:0 0 16px;">Bootstrap Error</h2>
        <pre style="color:#e8f4fd;white-space:pre-wrap;font-size:13px;margin:0;">${
          (err?.message || String(err)) + '\n\n' + (err?.stack || '')
        }</pre>
      </div>`;
  });
