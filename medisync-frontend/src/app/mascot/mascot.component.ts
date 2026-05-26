import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../core/services/auth.service';
import { MascotService } from './mascot.service';

@Component({
  selector: 'app-mascot',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (svc.visible()) {
      <div class="mascot-root">

        @if (svc.message()) {
          <div class="bubble" [class]="'bubble--' + svc.message()!.type">
            <div class="bubble-icon">
              <lucide-icon [name]="svc.message()!.icon" [size]="14" />
            </div>
            <span class="bubble-text">{{ svc.message()!.text }}</span>
            <button class="bubble-close" (click)="svc.dismiss()" aria-label="Fermer">
              <lucide-icon name="x" [size]="11" />
            </button>
          </div>
        }

        <div class="fox-container" [class]="'fox--' + svc.state()" (click)="onFoxClick()" role="button" aria-label="Medi - cliquez pour un conseil">
          <svg class="fox-svg" viewBox="0 0 80 104" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">

            <!-- Tail -->
            <path class="fox-tail" d="M 57,79 Q 82,60 76,88 Q 70,106 54,95 Q 48,90 52,83 Q 56,78 57,79 Z"/>

            <!-- Body -->
            <ellipse class="fox-body" cx="40" cy="82" rx="20" ry="15"/>

            <!-- Belly patch -->
            <ellipse class="fox-belly" cx="40" cy="84" rx="11" ry="10"/>

            <!-- Left ear outer -->
            <polygon class="fox-ear" points="14,45 25,13 38,45"/>
            <!-- Left ear inner -->
            <polygon class="fox-ear-inner" points="18,43 25,20 34,43"/>

            <!-- Right ear outer -->
            <polygon class="fox-ear" points="42,45 55,13 66,45"/>
            <!-- Right ear inner -->
            <polygon class="fox-ear-inner" points="46,43 55,20 62,43"/>

            <!-- Head -->
            <circle class="fox-head" cx="40" cy="52" r="21"/>

            <!-- Muzzle -->
            <ellipse class="fox-muzzle" cx="40" cy="61" rx="10" ry="7.5"/>

            <!-- Eyes -->
            <ellipse class="fox-eye-white" cx="33" cy="49" rx="4.5" ry="4"/>
            <ellipse class="fox-eye-white" cx="47" cy="49" rx="4.5" ry="4"/>
            <circle class="fox-pupil" cx="33" cy="50" r="2.8"/>
            <circle class="fox-pupil" cx="47" cy="50" r="2.8"/>
            <circle class="fox-shine" cx="34.2" cy="48.5" r="0.9"/>
            <circle class="fox-shine" cx="48.2" cy="48.5" r="0.9"/>

            <!-- Nose -->
            <ellipse class="fox-nose" cx="40" cy="59" rx="2.5" ry="2"/>

            <!-- Mouth -->
            <path class="fox-mouth idle-mouth" d="M 36.5,62.5 Q 40,65.5 43.5,62.5"/>
            <path class="fox-mouth happy-mouth" d="M 35,62 Q 40,67 45,62"/>

            <!-- Celebrate sparkles (hidden by default) -->
            <g class="sparkles">
              <circle cx="12" cy="30" r="2"/>
              <circle cx="68" cy="28" r="1.5"/>
              <circle cx="8"  cy="55" r="1.5"/>
              <circle cx="72" cy="52" r="2"/>
              <circle cx="18" cy="18" r="1.2"/>
              <circle cx="62" cy="16" r="1.2"/>
            </g>

          </svg>

          <span class="fox-label">Medi</span>
        </div>

        <button class="hide-btn" (click)="svc.hide()" aria-label="Reduire Medi">
          <lucide-icon name="minus" [size]="10" />
        </button>

      </div>
    } @else {
      <button class="fab-restore" (click)="svc.show()" aria-label="Afficher Medi">
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <polygon points="5,18 10,5 15,18" fill="#2A4A38"/>
          <polygon points="17,18 22,5 27,18" fill="#2A4A38"/>
          <circle cx="16" cy="22" r="10" fill="#2A4A38"/>
          <circle cx="13" cy="21" r="1.8" fill="white"/>
          <circle cx="19" cy="21" r="1.8" fill="white"/>
        </svg>
      </button>
    }
  `,
  styles: [`
    :host {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 200;
      pointer-events: none;
    }

    .mascot-root {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
      pointer-events: all;
    }

    /* ── Speech bubble ─────────────────────────────── */

    .bubble {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      max-width: 230px;
      padding: 10px 12px;
      border-radius: 14px 14px 4px 14px;
      font-size: 12px;
      line-height: 1.45;
      font-family: 'JetBrains Mono', monospace;
      box-shadow: 0 4px 16px rgba(27,37,32,0.14);
      animation: bubble-in 0.22s cubic-bezier(0.34,1.56,0.64,1) both;
      position: relative;
    }

    .bubble--info    { background: #EBF3EE; border: 1px solid #A8C8B4; color: #1B3A28; }
    .bubble--success { background: #D4EDDA; border: 1px solid #7BBD93; color: #0F3320; }
    .bubble--warning { background: #FDF3E0; border: 1px solid #E8C36A; color: #6B4C0A; }
    .bubble--tip     { background: #EEF1FF; border: 1px solid #A8B4E8; color: #1A2460; }

    .bubble-icon {
      flex-shrink: 0;
      margin-top: 1px;
      opacity: 0.75;
    }

    .bubble-text { flex: 1; }

    .bubble-close {
      flex-shrink: 0;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      opacity: 0.5;
      display: flex;
      align-items: center;
      margin-top: 1px;
      color: inherit;
      transition: opacity 0.12s;
      &:hover { opacity: 1; }
    }

    /* ── Fox container ─────────────────────────────── */

    .fox-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      cursor: pointer;
      user-select: none;
      transition: transform 0.2s ease;
      &:hover { transform: scale(1.05); }
      &:active { transform: scale(0.97); }
    }

    .fox-svg {
      width: 72px;
      height: auto;
      filter: drop-shadow(0 4px 12px rgba(27,37,32,0.22));
      transition: filter 0.2s ease;
    }

    .fox-container:hover .fox-svg {
      filter: drop-shadow(0 6px 18px rgba(27,37,32,0.32));
    }

    .fox-label {
      font-size: 10px;
      font-family: 'JetBrains Mono', monospace;
      color: #7A8A82;
      letter-spacing: 0.08em;
      font-weight: 600;
    }

    /* ── Fox SVG colours ───────────────────────────── */

    .fox-head, .fox-body, .fox-ear { fill: #2A4A38; }
    .fox-belly                     { fill: #3D6B4F; }
    .fox-muzzle                    { fill: #4A7A5E; }
    .fox-ear-inner, .fox-tail      { fill: #B8792A; }
    .fox-eye-white                 { fill: #FAFAF8; }
    .fox-pupil, .fox-nose          { fill: #1B2520; }
    .fox-shine                     { fill: #FAFAF8; }
    .fox-mouth {
      fill: none;
      stroke: #1B2520;
      stroke-width: 1.2;
      stroke-linecap: round;
    }
    .sparkles { fill: #B8792A; opacity: 0; }

    /* ── Idle state ─────────────────────────────────── */

    .fox--idle .happy-mouth   { display: none; }
    .fox--idle .idle-mouth    { display: block; }
    .fox--idle .fox-pupil     { transform-box: fill-box; transform-origin: center; }

    /* ── Alert state ────────────────────────────────── */

    .fox--alert .idle-mouth   { display: none; }
    .fox--alert .happy-mouth  { display: none; }
    .fox--alert .fox-eye-white {
      transform-box: fill-box;
      transform-origin: center;
    }
    .fox--alert .fox-pupil {
      transform-box: fill-box;
      transform-origin: center;
      r: 3.2;
    }
    .fox--alert .fox-svg {
      animation: alert-bob 1.2s ease-in-out infinite;
    }

    /* ── Celebrate state ────────────────────────────── */

    .fox--celebrate .idle-mouth  { display: none; }
    .fox--celebrate .happy-mouth { display: block; }
    .fox--celebrate .sparkles    { opacity: 1; animation: sparkle-pop 0.4s ease-out both; }
    .fox--celebrate .fox-svg     { animation: celebrate-bounce 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
    .fox--celebrate .fox-ear     { transform-box: fill-box; transform-origin: bottom center; animation: ear-wiggle 0.6s ease-in-out; }

    /* ── Control buttons ────────────────────────────── */

    .hide-btn {
      background: rgba(239,234,224,0.9);
      border: 1px solid rgba(42,74,56,0.15);
      border-radius: 50%;
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #7A8A82;
      padding: 0;
      transition: background 0.12s, color 0.12s;
      align-self: flex-end;
      &:hover { background: rgba(42,74,56,0.1); color: #2A4A38; }
    }

    .fab-restore {
      pointer-events: all;
      background: rgba(239,234,224,0.92);
      border: 1px solid rgba(42,74,56,0.18);
      border-radius: 14px;
      width: 48px;
      height: 48px;
      padding: 8px;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(27,37,32,0.16);
      transition: transform 0.15s, box-shadow 0.15s;
      &:hover {
        transform: scale(1.08);
        box-shadow: 0 6px 20px rgba(27,37,32,0.22);
      }
      svg { width: 100%; height: 100%; }
    }

    /* ── Keyframe animations ────────────────────────── */

    @keyframes bubble-in {
      from { opacity: 0; transform: translateY(8px) scale(0.92); }
      to   { opacity: 1; transform: translateY(0)  scale(1);     }
    }

    @keyframes alert-bob {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-4px); }
    }

    @keyframes celebrate-bounce {
      0%   { transform: translateY(0)    rotate(0deg);   }
      30%  { transform: translateY(-14px) rotate(-6deg); }
      60%  { transform: translateY(-8px)  rotate(4deg);  }
      100% { transform: translateY(0)    rotate(0deg);   }
    }

    @keyframes ear-wiggle {
      0%, 100% { transform: rotate(0deg);  }
      25%       { transform: rotate(-8deg); }
      75%       { transform: rotate(8deg);  }
    }

    @keyframes sparkle-pop {
      from { opacity: 0; transform: scale(0); }
      to   { opacity: 1; transform: scale(1); }
    }
  `],
})
export class MascotComponent implements OnInit, OnDestroy {

  constructor(
    public svc: MascotService,
    private auth: AuthService,
  ) {
    effect(() => {
      const role = this.auth.userRole();
      if (role) this.svc.setRole(role);
    });
  }

  ngOnInit(): void {}
  ngOnDestroy(): void {}

  onFoxClick(): void {
    if (this.svc.state() === 'idle') {
      this.svc.showHint();
    } else {
      this.svc.dismiss();
    }
  }
}
