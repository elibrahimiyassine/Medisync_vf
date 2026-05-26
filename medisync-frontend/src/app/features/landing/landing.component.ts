import { Component, OnInit, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService, detectRole } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  template: `
<!-- ═══════════════════════  NAVBAR  ═══════════════════════ -->
<nav class="navbar" [class.scrolled]="navScrolled()">
  <div class="nav-inner">
    <div class="nav-brand">
      <div class="logo-mark">M</div>
      <div>
        <span class="logo-text">MediSync</span>
        <span class="logo-sub">Health Platform</span>
      </div>
    </div>
    <div class="nav-links">
      <a href="#features" class="nav-link">Fonctionnalités</a>
      <a href="#roles"    class="nav-link">Pour qui ?</a>
      <a href="#auth-section" class="nav-link">Connexion</a>
    </div>
    <div class="nav-actions">
      <button class="btn-ghost-nav" (click)="scrollToAuth('login')">Se connecter</button>
      <button class="btn-primary-nav" (click)="scrollToAuth('register')">S'inscrire</button>
    </div>
  </div>
</nav>

<!-- ═══════════════════════  HERO  ═══════════════════════ -->
<section class="hero">
  <div class="hero-bg-grid" aria-hidden="true"></div>

  <div class="hero-inner">
    <div class="hero-content">
      <div class="hero-badge animate-slide-down">
        <lucide-icon name="stethoscope" [size]="13" style="color:#2A4A38;" />
        Plateforme médicale nouvelle génération
      </div>

      <h1 class="hero-title animate-slide-up">
        La santé de demain,<br/>
        <span class="text-gradient">disponible aujourd'hui</span>
      </h1>

      <p class="hero-sub animate-slide-up">
        MediSync connecte patients, médecins, secrétaires et administrateurs dans un
        écosystème numérique sécurisé. Gérez rendez-vous, dossiers médicaux et ordonnances
        depuis un seul endroit.
      </p>

      <div class="hero-cta animate-slide-up">
        <button class="cta-primary" (click)="scrollToAuth('register')">
          Créer mon compte
          <lucide-icon name="arrow-right" [size]="16" />
        </button>
        <button class="cta-secondary" (click)="scrollToAuth('login')">
          Déjà inscrit ? Connexion
        </button>
      </div>
    </div>

    <!-- Floating role pills -->
    <div class="hero-visual">
      <div class="hero-card-stack">
        <div class="h-card h-card-1 glass-card animate-float-1">
          <div class="h-card-icon" style="background:rgba(42,74,56,0.12);color:#2A4A38;"><lucide-icon name="calendar" [size]="18" /></div>
          <div><p class="h-card-title">Prochain rendez-vous</p><p class="h-card-sub">Dr. Chen · 14h30</p></div>
        </div>
        <div class="h-card h-card-2 glass-card animate-float-2">
          <div class="h-card-icon" style="background:rgba(61,107,79,0.12);color:#3D6B4F;"><lucide-icon name="shield" [size]="18" /></div>
          <div><p class="h-card-title">Données sécurisées</p><p class="h-card-sub">Chiffrement AES-256</p></div>
        </div>
        <div class="h-card h-card-3 glass-card animate-float-3">
          <div class="h-card-icon" style="background:rgba(184,121,42,0.12);color:#B8792A;"><lucide-icon name="star" [size]="18" /></div>
          <div><p class="h-card-title">4.8 / 5 ★</p><p class="h-card-sub">500+ patients satisfaits</p></div>
        </div>
        <div class="h-card h-card-4 glass-card animate-float-4">
          <div class="h-card-icon" style="background:rgba(201,99,60,0.1);color:#C9633C;"><lucide-icon name="pill" [size]="18" /></div>
          <div><p class="h-card-title">Ordonnance prête</p><p class="h-card-sub">Télécharger le PDF</p></div>
        </div>
      </div>
    </div>
  </div>

  <!-- ECG line -->
  <div class="ecg-strip">
    <svg viewBox="0 0 1400 60" preserveAspectRatio="none" class="ecg-svg">
      <path class="ecg-path"
        d="M0,30 L200,30 L220,30 L235,6 L250,54 L265,6 L280,30 L500,30 L520,6 L535,54 L550,6 L565,30 L800,30 L815,6 L830,54 L845,6 L860,30 L1100,30 L1115,6 L1130,54 L1145,6 L1160,30 L1400,30"
        fill="none" stroke="#2A4A38" stroke-width="2" stroke-linecap="round"/>
    </svg>
  </div>
</section>

<!-- ═══════════════════════  STATS  ═══════════════════════ -->
<section class="stats-section">
  <div class="stats-inner">
    @for (s of stats; track s.label) {
      <div class="stat-item">
        <p class="stat-num text-gradient">{{ s.value }}</p>
        <p class="stat-lbl">{{ s.label }}</p>
      </div>
    }
  </div>
</section>

<!-- ═══════════════════════  FEATURES  ═══════════════════════ -->
<section id="features" class="features-section">
  <div class="section-header">
    <p class="section-tag">Fonctionnalités clés</p>
    <h2 class="section-title">Tout ce dont vous avez besoin</h2>
    <p class="section-sub">Une suite complète d'outils pour la gestion médicale moderne</p>
  </div>
  <div class="features-grid">
    @for (f of features; track f.title) {
      <div class="feat-card glass-card">
        <div class="feat-icon-wrap" [style.background]="f.iconBg">
          <lucide-icon [name]="f.icon" [size]="26" [style.color]="f.iconColor" />
        </div>
        <h3 class="feat-title">{{ f.title }}</h3>
        <p class="feat-desc">{{ f.desc }}</p>
        <ul class="feat-list">
          @for (item of f.items; track item) {
            <li><lucide-icon name="check" [size]="13" style="color:#2A4A38;flex-shrink:0;" /> {{ item }}</li>
          }
        </ul>
      </div>
    }
  </div>
</section>

<!-- ═══════════════════════  ROLES  ═══════════════════════ -->
<section id="roles" class="roles-section">
  <div class="section-header">
    <p class="section-tag">Accès par rôle</p>
    <h2 class="section-title">Pour qui est MediSync ?</h2>
    <p class="section-sub">Chaque acteur dispose d'un espace entièrement dédié à ses besoins</p>
  </div>
  <div class="roles-grid">
    @for (role of roles; track role.key) {
      <div class="role-card glass-card" [class.role-active]="selectedRole() === role.key">
        <div class="role-icon-wrap" [style.background]="role.iconBg">
          <lucide-icon [name]="role.icon" [size]="30" [style.color]="role.color" />
        </div>
        <h3 class="role-name">{{ role.label }}</h3>
        <p class="role-desc">{{ role.desc }}</p>
        <ul class="role-feats">
          @for (feat of role.features; track feat) {
            <li><lucide-icon name="check" [size]="11" [style.color]="role.color" style="flex-shrink:0;" /> {{ feat }}</li>
          }
        </ul>
        <button class="role-cta" [style.background]="role.color" (click)="quickLogin(role)">
          Connexion rapide
          <lucide-icon name="chevron-right" [size]="14" />
        </button>
      </div>
    }
  </div>
</section>

<!-- ═══════════════════════  AUTH SECTION  ═══════════════════════ -->
<section id="auth-section" class="auth-section">
  <div class="auth-inner">

    <!-- Left pitch -->
    <div class="auth-pitch">
      <p class="section-tag">Accès sécurisé</p>
      <h2 class="section-title" style="margin-bottom:16px;">Rejoignez MediSync</h2>
      <p style="color:#7A8A82;font-size:14px;line-height:1.8;margin-bottom:28px;">
        Créez votre compte en quelques secondes ou connectez-vous pour accéder
        à votre espace personnalisé.
      </p>
      <div class="auth-perks">
        @for (p of authPerks; track p.text) {
          <div class="auth-perk">
            <div class="perk-icon" [style.background]="p.bg">
              <lucide-icon [name]="p.icon" [size]="16" [style.color]="p.color" />
            </div>
            <span>{{ p.text }}</span>
          </div>
        }
      </div>

      <!-- Quick demo connections -->
      <div class="demo-quick">
        <p class="demo-quick-label">Connexion rapide démo :</p>
        <div class="demo-pills">
          @for (d of demoUsers; track d.role) {
            <button class="demo-pill" (click)="quickLogin(d)">
              <lucide-icon [name]="d.icon" [size]="13" />
              {{ d.label }}
            </button>
          }
        </div>
      </div>
    </div>

    <!-- Auth card -->
    <div class="auth-card glass-card">

      <!-- Tabs -->
      <div class="auth-tabs">
        <button class="auth-tab" [class.active]="activeTab() === 'login'"    (click)="setTab('login')">Se connecter</button>
        <button class="auth-tab" [class.active]="activeTab() === 'register'" (click)="setTab('register')">S'inscrire</button>
      </div>

      <!-- ── LOGIN ── -->
      @if (activeTab() === 'login') {
        <form [formGroup]="loginForm" (ngSubmit)="submitLogin()" class="auth-form animate-scale-in">

          <div class="form-group">
            <label>Adresse e-mail</label>
            <div class="input-wrap">
              <lucide-icon name="mail" [size]="15" class="input-icon" />
              <input type="email" formControlName="email" class="glass-input" placeholder="alice@example.fr" />
            </div>
            @if (loginForm.get('email')?.value) {
              <div style="display:flex;align-items:center;gap:5px;margin-top:4px;">
                <lucide-icon [name]="roleIconFor(loginEmailRole())" [size]="11" style="color:#2A4A38;" />
                <span style="font-size:11px;color:#2A4A38;font-weight:600;">{{ roleLabelFor(loginEmailRole()) }}</span>
              </div>
            }
            <p style="font-size:10px;color:#7A8A82;margin-top:3px;line-height:1.5;">
              Préfixe : <b>dr.</b> = médecin · <b>admin.</b> = admin · <b>sec.</b> = secrétaire
            </p>
          </div>

          <div class="form-group">
            <label>Mot de passe</label>
            <div class="input-wrap">
              <lucide-icon name="lock" [size]="15" class="input-icon" />
              <input [type]="showPwd() ? 'text' : 'password'" formControlName="password" class="glass-input" placeholder="••••••••" />
              <button type="button" class="pwd-eye" (click)="showPwd.update(v => !v)" tabindex="-1">
                <lucide-icon [name]="showPwd() ? 'eye-off' : 'eye'" [size]="14" />
              </button>
            </div>
          </div>

          @if (errorMsg()) {
            <div class="error-banner" style="display:flex;align-items:center;gap:8px;">
              <lucide-icon name="triangle-alert" [size]="14" style="flex-shrink:0;" /> {{ errorMsg() }}
            </div>
          }

          <button type="submit" class="submit-btn" [disabled]="submitting() || loginForm.invalid">
            @if (submitting()) { <span class="spinner"></span> Connexion... }
            @else { Se connecter }
          </button>

          <div class="auth-divider"><span>ou continuer avec</span></div>

          <div class="oauth-row-sm">
            <button type="button" class="oauth-btn-sm" (click)="openOAuth('google')" [disabled]="submitting()">
              <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.3 1.2 8.6 3.2l6.4-6.4C34.8 2.7 29.8.5 24 .5 14.8.5 7 5.9 3.2 13.6l7.5 5.8C12.4 13 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.7-.1-3.3-.4-4.8H24v9.1h12.7c-.5 2.9-2.2 5.4-4.7 7l7.3 5.7c4.3-4 6.8-9.8 7.2-17z"/><path fill="#FBBC05" d="M10.7 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6l-7.5-5.8A23.5 23.5 0 0 0 .5 24c0 3.8.9 7.4 2.5 10.6l7.7-6z"/><path fill="#34A853" d="M24 47.5c5.8 0 10.7-1.9 14.3-5.2l-7.3-5.7c-1.9 1.3-4.4 2-7 2-6.3 0-11.6-3.5-13.3-8.9l-7.7 6C7 42.1 14.8 47.5 24 47.5z"/></svg>
              Google
            </button>
            <button type="button" class="oauth-btn-sm" (click)="openOAuth('microsoft')" [disabled]="submitting()">
              <svg width="16" height="16" viewBox="0 0 23 23"><rect x="1" y="1" width="10" height="10" fill="#F25022"/><rect x="12" y="1" width="10" height="10" fill="#7FBA00"/><rect x="1" y="12" width="10" height="10" fill="#00A4EF"/><rect x="12" y="12" width="10" height="10" fill="#FFB900"/></svg>
              Microsoft
            </button>
          </div>

          <div class="auth-divider"><span>accès démo</span></div>

          <div class="demo-grid">
            @for (d of demoUsers; track d.role) {
              <button type="button" class="demo-btn" (click)="quickLogin(d)">
                <lucide-icon [name]="d.icon" [size]="13" />
                {{ d.label }}
              </button>
            }
          </div>

          <div style="text-align:center;margin-top:12px;">
            <a routerLink="/auth/forgot-password" class="auth-link">Mot de passe oublié ?</a>
          </div>
        </form>
      }

      <!-- ── REGISTER ── -->
      @if (activeTab() === 'register') {
        <form [formGroup]="registerForm" (ngSubmit)="submitRegister()" class="auth-form animate-scale-in">

          <div class="name-row">
            <div class="form-group">
              <label>Prénom *</label>
              <input type="text" formControlName="firstName" class="glass-input" placeholder="Alice" />
              @if (registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched) {
                <span class="error-msg">Champ obligatoire</span>
              }
            </div>
            <div class="form-group">
              <label>Nom *</label>
              <input type="text" formControlName="lastName" class="glass-input" placeholder="Bernard" />
              @if (registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched) {
                <span class="error-msg">Champ obligatoire</span>
              }
            </div>
          </div>

          <div class="form-group">
            <label>Adresse e-mail *</label>
            <div class="input-wrap">
              <lucide-icon name="mail" [size]="15" class="input-icon" />
              <input type="email" formControlName="email" class="glass-input" placeholder="alice@example.fr" />
            </div>
            @if (registerForm.get('email')?.value) {
              <div style="display:flex;align-items:center;gap:5px;margin-top:4px;">
                <lucide-icon [name]="roleIconFor(registerEmailRole())" [size]="11" style="color:#2A4A38;" />
                <span style="font-size:11px;color:#2A4A38;font-weight:600;">{{ roleLabelFor(registerEmailRole()) }}</span>
              </div>
            }
            @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
              <span class="error-msg">E-mail invalide</span>
            }
          </div>

          <div class="form-group">
            <label>Mot de passe *</label>
            <div class="input-wrap">
              <lucide-icon name="lock" [size]="15" class="input-icon" />
              <input [type]="showPwd() ? 'text' : 'password'" formControlName="password" class="glass-input" placeholder="Min. 8 caractères" />
              <button type="button" class="pwd-eye" (click)="showPwd.update(v => !v)" tabindex="-1">
                <lucide-icon [name]="showPwd() ? 'eye-off' : 'eye'" [size]="14" />
              </button>
            </div>
          </div>

          @if (errorMsg()) {
            <div class="error-banner" style="display:flex;align-items:center;gap:8px;">
              <lucide-icon name="triangle-alert" [size]="14" style="flex-shrink:0;" /> {{ errorMsg() }}
            </div>
          }

          <button type="submit" class="submit-btn" [disabled]="submitting() || registerForm.invalid">
            @if (submitting()) { <span class="spinner"></span> Création... }
            @else { Créer mon compte {{ roleLabelFor(registerEmailRole()) | lowercase }} }
          </button>

          <p class="rgpd-note">
            <lucide-icon name="shield" [size]="11" /> Données protégées selon le RGPD
          </p>
        </form>
      }
    </div>
  </div>
</section>

@if (oauthProvider()) {
  <div class="oauth-overlay" (click)="closeOAuth()">
    <div class="oauth-modal" (click)="$event.stopPropagation()">
      <div class="oauth-modal-head" [class.ms]="oauthProvider() === 'microsoft'">
        @if (oauthProvider() === 'google') {
          <svg width="28" height="28" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.3 1.2 8.6 3.2l6.4-6.4C34.8 2.7 29.8.5 24 .5 14.8.5 7 5.9 3.2 13.6l7.5 5.8C12.4 13 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.7-.1-3.3-.4-4.8H24v9.1h12.7c-.5 2.9-2.2 5.4-4.7 7l7.3 5.7c4.3-4 6.8-9.8 7.2-17z"/><path fill="#FBBC05" d="M10.7 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6l-7.5-5.8A23.5 23.5 0 0 0 .5 24c0 3.8.9 7.4 2.5 10.6l7.7-6z"/><path fill="#34A853" d="M24 47.5c5.8 0 10.7-1.9 14.3-5.2l-7.3-5.7c-1.9 1.3-4.4 2-7 2-6.3 0-11.6-3.5-13.3-8.9l-7.7 6C7 42.1 14.8 47.5 24 47.5z"/></svg>
        } @else {
          <svg width="28" height="28" viewBox="0 0 23 23"><rect x="1" y="1" width="10" height="10" fill="#F25022"/><rect x="12" y="1" width="10" height="10" fill="#7FBA00"/><rect x="1" y="12" width="10" height="10" fill="#00A4EF"/><rect x="12" y="12" width="10" height="10" fill="#FFB900"/></svg>
        }
        <div>
          <p class="oauth-modal-title">Se connecter avec {{ oauthProvider() === 'google' ? 'Google' : 'Microsoft' }}</p>
          <p class="oauth-modal-sub">Choisissez un compte</p>
        </div>
      </div>
      <div class="oauth-acct-list">
        @for (acct of currentOAuthAccounts(); track acct.email) {
          <button class="oauth-acct-btn" (click)="selectOAuthAccount(acct)" [disabled]="oauthLoading()">
            <div class="acct-avatar" [style.background]="acct.color">{{ acct.avatar }}</div>
            <div class="acct-info">
              <span class="acct-name">{{ acct.firstName }} {{ acct.lastName }}</span>
              <span class="acct-email">{{ acct.email }}</span>
            </div>
            @if (oauthLoading()) { <span class="oauth-spinner"></span> }
            @else { <lucide-icon name="chevron-right" [size]="14" style="color:#7A8A82;flex-shrink:0;" /> }
          </button>
        }
      </div>
      <div class="oauth-modal-foot">
        <button class="oauth-cancel" (click)="closeOAuth()">Annuler</button>
      </div>
    </div>
  </div>
}

<!-- ═══════════════════════  FOOTER  ═══════════════════════ -->
<footer class="footer">
  <div class="footer-inner">
    <div class="footer-brand">
      <div class="logo-mark" style="width:32px;height:32px;font-size:14px;">M</div>
      <div>
        <span class="logo-text" style="font-size:15px;">MediSync</span>
        <p style="font-size:11px;color:#7A8A82;margin-top:1px;">Health Platform</p>
      </div>
    </div>
    <p style="font-size:12px;color:#7A8A82;text-align:center;">
      © 2026 MediSync — Plateforme de gestion médicale · Projet universitaire
    </p>
    <div class="footer-links">
      <a routerLink="/auth/login"    class="footer-link">Connexion</a>
      <a routerLink="/auth/register" class="footer-link">Inscription</a>
    </div>
  </div>
</footer>
  `,
  styles: [`
    :host { display:block; background:#FAF7F1; }

    /* ── NAVBAR ── */
    .navbar { position:fixed;top:0;left:0;right:0;z-index:500;transition:all .3s; }
    .navbar.scrolled { background:rgba(250,247,241,0.92);backdrop-filter:blur(16px);border-bottom:1px solid rgba(42,74,56,0.1);box-shadow:0 2px 20px rgba(42,74,56,0.06); }
    .nav-inner { max-width:1200px;margin:0 auto;padding:0 32px;height:68px;display:flex;align-items:center;justify-content:space-between; }
    .nav-brand { display:flex;align-items:center;gap:10px; }
    .logo-mark { width:40px;height:40px;background:linear-gradient(135deg,#2A4A38,#3D6B4F);border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:800;color:#F2EDE4;font-size:18px;font-family:'Fraunces',Georgia,serif;flex-shrink:0; }
    .logo-text { font-weight:700;font-size:17px;color:#1B2520;font-family:'Fraunces',Georgia,serif;line-height:1; }
    .logo-sub { font-size:10px;color:#7A8A82;display:block;margin-top:1px;text-transform:uppercase;letter-spacing:.05em; }
    .nav-links { display:flex;gap:28px; }
    .nav-link { font-size:13px;font-weight:500;color:#3A5248;text-decoration:none;transition:color .2s; &:hover{color:#1B2520;} }
    .nav-actions { display:flex;gap:10px;align-items:center; }
    .btn-ghost-nav { background:none;border:1px solid rgba(42,74,56,0.2);border-radius:10px;padding:8px 18px;font-size:13px;font-weight:600;color:#2A4A38;cursor:pointer;transition:all .2s;font-family:'Geist','Inter',sans-serif; &:hover{background:rgba(42,74,56,0.06);} }
    .btn-primary-nav { background:#2A4A38;border:none;border-radius:10px;padding:9px 20px;font-size:13px;font-weight:600;color:#F2EDE4;cursor:pointer;transition:all .2s;font-family:'Geist','Inter',sans-serif; &:hover{background:#1B3028;transform:translateY(-1px);} }

    /* ── HERO ── */
    .hero { position:relative;min-height:100vh;display:flex;flex-direction:column;justify-content:center;padding:100px 32px 80px;overflow:hidden; }
    .hero-bg-grid { position:absolute;inset:0;background-image:linear-gradient(rgba(42,74,56,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(42,74,56,0.04) 1px,transparent 1px);background-size:48px 48px;pointer-events:none; }
    .hero-inner { max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;position:relative;z-index:1; }
    .hero-content { display:flex;flex-direction:column;gap:20px; }
    .hero-badge { display:inline-flex;align-items:center;gap:7px;padding:7px 14px;background:rgba(42,74,56,0.08);border:1px solid rgba(42,74,56,0.15);border-radius:999px;font-size:12px;font-weight:600;color:#2A4A38;width:fit-content; }
    .hero-title { font-size:clamp(36px,4.5vw,58px);font-weight:700;color:#1B2520;line-height:1.12;font-family:'Fraunces',Georgia,serif;margin:0; }
    .hero-sub { font-size:15px;color:#3A5248;line-height:1.75;max-width:500px;margin:0; }
    .hero-cta { display:flex;gap:14px;flex-wrap:wrap;align-items:center; }
    .cta-primary { display:inline-flex;align-items:center;gap:8px;background:#2A4A38;color:#F2EDE4;border:none;border-radius:12px;padding:14px 28px;font-size:15px;font-weight:700;cursor:pointer;transition:all .25s;font-family:'Geist','Inter',sans-serif; &:hover{background:#1B3028;transform:translateY(-2px);box-shadow:0 8px 24px rgba(42,74,56,0.25);} }
    .cta-secondary { background:none;border:1.5px solid rgba(42,74,56,0.2);border-radius:12px;padding:13px 24px;font-size:14px;font-weight:600;color:#3A5248;cursor:pointer;transition:all .2s;font-family:'Geist','Inter',sans-serif; &:hover{border-color:rgba(42,74,56,0.4);color:#1B2520;} }

    /* Hero visual cards */
    .hero-visual { position:relative;height:420px; }
    .hero-card-stack { position:relative;width:100%;height:100%; }
    .h-card { position:absolute;display:flex;align-items:center;gap:12px;padding:16px 20px;border-radius:14px;min-width:200px;box-shadow:0 8px 32px rgba(42,74,56,0.1); }
    .h-card-1 { top:40px;left:10px; }
    .h-card-2 { top:140px;right:0; }
    .h-card-3 { top:260px;left:30px; }
    .h-card-4 { top:340px;right:20px; }
    .h-card-icon { width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
    .h-card-title { font-size:12px;font-weight:700;color:#1B2520; }
    .h-card-sub { font-size:11px;color:#7A8A82;margin-top:2px; }

    @keyframes float1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
    @keyframes float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    @keyframes float3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
    @keyframes float4 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
    .animate-float-1 { animation:float1 4s ease-in-out infinite; }
    .animate-float-2 { animation:float2 4.5s ease-in-out infinite .5s; }
    .animate-float-3 { animation:float3 5s ease-in-out infinite 1s; }
    .animate-float-4 { animation:float4 4.2s ease-in-out infinite .8s; }

    /* ECG strip */
    .ecg-strip { width:100%;height:50px;overflow:hidden;position:relative;margin-top:40px; }
    .ecg-svg { width:100%;height:100%; }
    .ecg-path { stroke-dasharray:2000;animation:ecg-anim 5s linear infinite; }
    @keyframes ecg-anim { 0%{stroke-dashoffset:2000;opacity:.3} 40%{opacity:1} 100%{stroke-dashoffset:-2000;opacity:.3} }

    /* ── STATS ── */
    .stats-section { background:white;border-top:1px solid rgba(42,74,56,0.07);border-bottom:1px solid rgba(42,74,56,0.07); }
    .stats-inner { max-width:1200px;margin:0 auto;padding:40px 32px;display:grid;grid-template-columns:repeat(4,1fr);gap:24px; }
    .stat-item { text-align:center; }
    .stat-num { font-size:36px;font-weight:700;font-family:'Fraunces',Georgia,serif;line-height:1; }
    .stat-lbl { font-size:13px;color:#7A8A82;margin-top:6px;font-weight:500; }

    /* ── FEATURES ── */
    .features-section { padding:96px 32px;max-width:1200px;margin:0 auto; }
    .section-header { text-align:center;margin-bottom:56px; }
    .section-tag { display:inline-block;padding:5px 14px;background:rgba(42,74,56,0.08);border-radius:999px;font-size:11px;font-weight:700;color:#2A4A38;text-transform:uppercase;letter-spacing:.08em;margin-bottom:14px; }
    .section-title { font-size:clamp(26px,3vw,38px);font-weight:700;color:#1B2520;font-family:'Fraunces',Georgia,serif;margin:0 0 12px; }
    .section-sub { font-size:15px;color:#7A8A82;max-width:520px;margin:0 auto;line-height:1.65; }
    .features-grid { display:grid;grid-template-columns:repeat(2,1fr);gap:20px; }
    .feat-card { padding:28px;transition:all .25s; &:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(42,74,56,0.1);} }
    .feat-icon-wrap { width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center;margin-bottom:18px; }
    .feat-title { font-size:18px;font-weight:700;color:#1B2520;margin-bottom:8px;font-family:'Fraunces',Georgia,serif; }
    .feat-desc { font-size:13px;color:#7A8A82;line-height:1.65;margin-bottom:16px; }
    .feat-list { list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px; li{display:flex;align-items:center;gap:8px;font-size:13px;color:#3A5248;} }

    /* ── ROLES ── */
    .roles-section { padding:96px 32px;background:linear-gradient(180deg,#FAF7F1 0%,rgba(42,74,56,0.03) 100%); }
    .roles-section > .section-header { max-width:1200px;margin:0 auto 56px; }
    .roles-grid { max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:16px; }
    .role-card { padding:26px;display:flex;flex-direction:column;gap:12px;transition:all .25s;cursor:default; &:hover{transform:translateY(-6px);box-shadow:0 20px 60px rgba(42,74,56,0.12);} }
    .role-card.role-active { border-color:rgba(42,74,56,0.4);box-shadow:0 0 0 2px rgba(42,74,56,0.15); }
    .role-icon-wrap { width:60px;height:60px;border-radius:16px;display:flex;align-items:center;justify-content:center; }
    .role-name { font-size:17px;font-weight:700;color:#1B2520;font-family:'Fraunces',Georgia,serif;margin:0; }
    .role-desc { font-size:12px;color:#7A8A82;line-height:1.6;margin:0; }
    .role-feats { list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px;flex:1; li{display:flex;align-items:center;gap:6px;font-size:11px;color:#3A5248;} }
    .role-cta { display:flex;align-items:center;justify-content:center;gap:6px;border:none;border-radius:10px;padding:10px 16px;font-size:12px;font-weight:700;color:white;cursor:pointer;transition:all .2s;font-family:'Geist','Inter',sans-serif;margin-top:4px; &:hover{opacity:.85;transform:translateY(-1px);} }

    /* ── AUTH SECTION ── */
    .auth-section { padding:96px 32px;background:white; }
    .auth-inner { max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 480px;gap:64px;align-items:flex-start; }
    .auth-perks { display:flex;flex-direction:column;gap:14px;margin-bottom:32px; }
    .auth-perk { display:flex;align-items:center;gap:12px;font-size:13px;color:#3A5248;font-weight:500; }
    .perk-icon { width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
    .demo-quick { margin-top:0; }
    .demo-quick-label { font-size:11px;font-weight:700;color:#7A8A82;text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px; }
    .demo-pills { display:flex;flex-wrap:wrap;gap:8px; }
    .demo-pill { display:inline-flex;align-items:center;gap:5px;padding:7px 14px;border:1px solid rgba(42,74,56,0.15);border-radius:999px;background:rgba(42,74,56,0.04);font-size:12px;font-weight:600;color:#2A4A38;cursor:pointer;transition:all .2s; &:hover{background:rgba(42,74,56,0.1);border-color:rgba(42,74,56,0.3);} }

    /* Auth card */
    .auth-card { padding:32px; }
    .auth-tabs { display:flex;border:1px solid rgba(42,74,56,0.12);border-radius:12px;overflow:hidden;margin-bottom:24px; }
    .auth-tab { flex:1;padding:11px;background:transparent;border:none;font-size:13px;font-weight:600;color:#7A8A82;cursor:pointer;transition:all .2s;font-family:'Geist','Inter',sans-serif; &.active{background:#2A4A38;color:#F2EDE4;} &:hover:not(.active){background:rgba(42,74,56,0.06);color:#3A5248;} }
    .auth-form { display:flex;flex-direction:column;gap:14px; }
    .form-group { display:flex;flex-direction:column;gap:5px; label{font-size:11px;font-weight:700;color:#3A5248;text-transform:uppercase;letter-spacing:.04em;} }
    .name-row { display:grid;grid-template-columns:1fr 1fr;gap:12px; }
    .input-wrap { position:relative; }
    .input-icon { position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#7A8A82;pointer-events:none; }
    .input-wrap .glass-input { padding-left:36px; }
    .pwd-eye { position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:#7A8A82;cursor:pointer;padding:4px;display:flex;align-items:center; &:hover{color:#2A4A38;} }
    .error-banner { padding:10px 14px;background:rgba(194,64,64,0.08);border:1px solid rgba(194,64,64,0.2);border-radius:10px;font-size:12px;color:#C24040; }
    .error-msg { font-size:11px;color:#C24040;margin-top:2px; }
    .submit-btn { background:#2A4A38;color:#F2EDE4;border:none;border-radius:12px;padding:13px;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;font-family:'Geist','Inter',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px; &:hover:not(:disabled){background:#1B3028;} &:disabled{opacity:.6;cursor:not-allowed;} }
    .auth-divider { text-align:center;position:relative; &::before{content:'';position:absolute;top:50%;left:0;right:0;height:1px;background:rgba(42,74,56,0.1);} span{background:white;padding:0 12px;font-size:11px;color:#7A8A82;position:relative;} }
    .demo-grid { display:grid;grid-template-columns:1fr 1fr;gap:8px; }
    .demo-btn { display:flex;align-items:center;justify-content:center;gap:6px;padding:9px 12px;border:1px solid rgba(42,74,56,0.12);border-radius:10px;background:rgba(42,74,56,0.04);font-size:12px;font-weight:600;color:#3A5248;cursor:pointer;transition:all .2s; &:hover{background:rgba(42,74,56,0.1);border-color:#2A4A38;color:#1B2520;} }
    .auth-link { font-size:12px;color:#2A4A38;text-decoration:none; &:hover{text-decoration:underline;} }
    .rgpd-note { font-size:11px;color:#7A8A82;text-align:center;display:flex;align-items:center;justify-content:center;gap:4px;margin:0; }

    /* ── FOOTER ── */
    .footer { background:#1B2520;padding:32px; }
    .footer-inner { max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:24px; }
    .footer-brand { display:flex;align-items:center;gap:10px; }
    .footer-links { display:flex;gap:20px; }
    .footer-link { font-size:12px;color:#7A8A82;text-decoration:none;transition:color .2s; &:hover{color:#F2EDE4;} }

    /* ── TEXT GRADIENT ── */
    .text-gradient { background:linear-gradient(135deg,#2A4A38,#3D6B4F,#C9633C);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }

    /* ── OAuth buttons (auth card) ── */
    .oauth-row-sm { display:grid;grid-template-columns:1fr 1fr;gap:8px; }
    .oauth-btn-sm { display:flex;align-items:center;justify-content:center;gap:7px;padding:9px 12px;border:1px solid rgba(42,74,56,0.14);border-radius:10px;background:rgba(42,74,56,0.03);font-size:12px;font-weight:600;color:#3A5248;cursor:pointer;transition:all .2s;font-family:'Geist','Inter',sans-serif;
      &:hover:not(:disabled){background:rgba(42,74,56,0.08);border-color:rgba(42,74,56,0.25);}
      &:disabled{opacity:.5;cursor:not-allowed;}
    }

    /* ── OAuth modal ── */
    .oauth-overlay { position:fixed;inset:0;background:rgba(27,37,32,0.45);backdrop-filter:blur(4px);z-index:600;display:flex;align-items:center;justify-content:center;padding:24px; }
    .oauth-modal { background:#fff;border-radius:16px;width:100%;max-width:340px;box-shadow:0 24px 64px rgba(0,0,0,0.18);overflow:hidden; }
    .oauth-modal-head { display:flex;align-items:center;gap:14px;padding:22px 24px 18px;border-bottom:1px solid #f0f0f0; &.ms{border-top:3px solid #0078D4;} }
    .oauth-modal-title { font-size:15px;font-weight:700;color:#1B2520;margin:0; }
    .oauth-modal-sub { font-size:12px;color:#7A8A82;margin:2px 0 0; }
    .oauth-acct-list { padding:8px 0; }
    .oauth-acct-btn { width:100%;display:flex;align-items:center;gap:14px;padding:12px 24px;background:none;border:none;cursor:pointer;transition:background .15s;text-align:left;
      &:hover:not(:disabled){background:#f6f6f6;}
      &:disabled{opacity:.6;cursor:not-allowed;}
    }
    .acct-avatar { width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;flex-shrink:0; }
    .acct-info { flex:1;min-width:0; }
    .acct-name  { display:block;font-size:13px;font-weight:600;color:#1B2520; }
    .acct-email { display:block;font-size:11px;color:#7A8A82;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
    .oauth-modal-foot { padding:12px 24px 18px;border-top:1px solid #f0f0f0;text-align:center; }
    .oauth-cancel { background:none;border:none;font-size:13px;color:#7A8A82;cursor:pointer;font-family:'Geist','Inter',sans-serif; &:hover{color:#1B2520;} }
    .oauth-spinner { width:16px;height:16px;border:2px solid rgba(0,0,0,0.15);border-top-color:#2A4A38;border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0; }

    /* ── SPINNER ── */
    .spinner { width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;display:inline-block; }
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}

    /* ── ANIMATIONS ── */
    @keyframes slide-down { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes slide-up   { from{opacity:0;transform:translateY(20px)}  to{opacity:1;transform:translateY(0)} }
    .animate-slide-down { animation:slide-down .7s ease both; }
    .animate-slide-up   { animation:slide-up   .8s ease both .15s; }
  `],
})
export class LandingComponent implements OnInit {
  navScrolled       = signal(false);
  activeTab         = signal<'login' | 'register'>('login');
  submitting        = signal(false);
  errorMsg          = signal('');
  showPwd           = signal(false);
  selectedRole      = signal<string | null>(null);
  loginEmailRole    = signal<string>('PATIENT');
  registerEmailRole = signal<string>('PATIENT');
  oauthProvider     = signal<'google' | 'microsoft' | null>(null);
  oauthLoading      = signal(false);

  private readonly _oauthAccounts = {
    google: [
      { email: 'sophie.martin@gmail.com',  firstName: 'Sophie', lastName: 'Martin', avatar: 'SM', color: '#4285F4' },
      { email: 'thomas.dupont@gmail.com',   firstName: 'Thomas', lastName: 'Dupont', avatar: 'TD', color: '#34A853' },
    ],
    microsoft: [
      { email: 'emma.petit@outlook.com',   firstName: 'Emma',   lastName: 'Petit',  avatar: 'EP', color: '#0078D4' },
      { email: 'lucas.moreau@hotmail.com', firstName: 'Lucas',  lastName: 'Moreau', avatar: 'LM', color: '#50E6FF' },
    ],
  };

  readonly currentOAuthAccounts = () =>
    this._oauthAccounts[this.oauthProvider() as 'google' | 'microsoft'] ?? [];

  loginForm!:    ReturnType<FormBuilder['group']>;
  registerForm!: ReturnType<FormBuilder['group']>;

  stats = [
    { value: '500+', label: 'Patients actifs' },
    { value: '50+',  label: 'Médecins experts' },
    { value: '4.8★', label: 'Satisfaction moyenne' },
    { value: '99%',  label: 'Disponibilité' },
  ];

  features = [
    {
      icon: 'shield', iconBg: 'rgba(42,74,56,0.1)', iconColor: '#2A4A38',
      title: 'Dossier médical sécurisé',
      desc: 'Centralisez l\'ensemble de votre historique médical dans un espace chiffré et accessible à tout moment.',
      items: ['Historique des consultations', 'Documents & imagerie médicale', 'Résultats de laboratoire'],
    },
    {
      icon: 'calendar', iconBg: 'rgba(61,107,79,0.1)', iconColor: '#3D6B4F',
      title: 'Rendez-vous intelligents',
      desc: 'Planifiez vos consultations en ligne avec les praticiens selon vos disponibilités en temps réel.',
      items: ['Créneaux disponibles en direct', 'Rappels et confirmations par e-mail', 'Gestion des urgences'],
    },
    {
      icon: 'pill', iconBg: 'rgba(201,99,60,0.08)', iconColor: '#C9633C',
      title: 'Ordonnances digitales',
      desc: 'Recevez et consultez vos prescriptions directement depuis votre espace patient, 24h/24.',
      items: ['Prescriptions horodatées', 'Historique médicamenteux complet', 'Export PDF sécurisé'],
    },
    {
      icon: 'chart-bar', iconBg: 'rgba(184,121,42,0.1)', iconColor: '#B8792A',
      title: 'Analyses & rapports',
      desc: 'Pilotez votre clinique avec des tableaux de bord analytiques mis à jour en temps réel.',
      items: ['Rapport financier détaillé', 'Statistiques de consultations', 'Journal d\'audit complet'],
    },
  ];

  roles = [
    {
      key: 'PATIENT', icon: 'user', label: 'Patient',
      color: '#2A4A38', iconBg: 'rgba(42,74,56,0.1)',
      desc: 'Gérez votre santé à distance, consultez votre dossier et prenez rendez-vous en toute autonomie.',
      features: ['Prise de rendez-vous en ligne', 'Dossier médical personnel', 'Ordonnances & factures'],
      email: 'alice.bernard@email.fr', password: 'Patient123!',
    },
    {
      key: 'DOCTOR', icon: 'stethoscope', label: 'Médecin',
      color: '#3D6B4F', iconBg: 'rgba(61,107,79,0.1)',
      desc: 'Consultez vos patients, gérez votre planning quotidien et émettez vos prescriptions numériquement.',
      features: ['Planning & consultations', 'Dossiers patients complets', 'Prescriptions digitales'],
      email: 'dr.chen@medisync.ma', password: 'Doctor123!',
    },
    {
      key: 'SECRETARY', icon: 'clipboard-list', label: 'Secrétaire',
      color: '#C9633C', iconBg: 'rgba(201,99,60,0.08)',
      desc: 'Coordonnez les rendez-vous, gérez le registre des patients et pilotez la facturation.',
      features: ['Gestion des rendez-vous', 'Registre des patients', 'Facturation & paiements'],
      email: 'secretary@medisync.ma', password: 'Secretary123!',
    },
    {
      key: 'ADMIN', icon: 'briefcase', label: 'Administrateur',
      color: '#B8792A', iconBg: 'rgba(184,121,42,0.1)',
      desc: 'Supervisez l\'ensemble de la clinique, le personnel, les finances et les paramètres système.',
      features: ['Gestion du personnel', 'Rapports financiers', 'Paramètres & permissions'],
      email: 'admin@medisync.ma', password: 'Admin123!',
    },
  ];

  demoUsers = [
    { role: 'PATIENT',   icon: 'user',          label: 'Patient',    email: 'alice.bernard@email.fr', password: 'Patient123!' },
    { role: 'DOCTOR',    icon: 'stethoscope',    label: 'Médecin',    email: 'dr.chen@medisync.ma',    password: 'Doctor123!' },
    { role: 'SECRETARY', icon: 'clipboard-list', label: 'Secrétaire', email: 'secretary@medisync.ma',  password: 'Secretary123!' },
    { role: 'ADMIN',     icon: 'briefcase',      label: 'Admin',      email: 'admin@medisync.ma',      password: 'Admin123!' },
  ];

  authPerks = [
    { icon: 'shield',     color: '#2A4A38', bg: 'rgba(42,74,56,0.1)',  text: 'Données chiffrées et protégées RGPD' },
    { icon: 'lock',       color: '#3D6B4F', bg: 'rgba(61,107,79,0.1)', text: 'Authentification sécurisée' },
    { icon: 'user-check', color: '#C9633C', bg: 'rgba(201,99,60,0.1)', text: 'Accès personnalisé par rôle' },
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notifSvc: NotificationService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName:  ['', Validators.required],
      email:     ['', [Validators.required, Validators.email]],
      password:  ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/patient/dashboard']);
    }
    this.loginForm.get('email')?.valueChanges.subscribe(v => this.loginEmailRole.set(detectRole(v || '')));
    this.registerForm.get('email')?.valueChanges.subscribe(v => this.registerEmailRole.set(detectRole(v || '')));
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.navScrolled.set(window.scrollY > 60);
  }

  scrollToAuth(tab: 'login' | 'register'): void {
    this.activeTab.set(tab);
    this.errorMsg.set('');
    setTimeout(() => {
      document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }

  setTab(tab: 'login' | 'register'): void {
    this.activeTab.set(tab);
    this.errorMsg.set('');
  }

  quickLogin(user: { email: string; password: string }): void {
    this.loginForm.patchValue({ email: user.email, password: user.password });
    this.errorMsg.set('');
    this.activeTab.set('login');
    setTimeout(() => {
      document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => this.submitLogin(), 400);
    }, 50);
  }

  roleIconFor(role: string): string {
    const m: Record<string, string> = { PATIENT: 'user', DOCTOR: 'stethoscope', SECRETARY: 'clipboard-list', ADMIN: 'briefcase' };
    return m[role] || 'user';
  }

  roleLabelFor(role: string): string {
    const m: Record<string, string> = { PATIENT: 'Patient', DOCTOR: 'Médecin', SECRETARY: 'Secrétaire', ADMIN: 'Administrateur' };
    return m[role] || 'Patient';
  }

  submitLogin(): void {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.submitting.set(true);
    this.errorMsg.set('');
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next:  () => this.submitting.set(false),
      error: (e) => {
        this.submitting.set(false);
        this.errorMsg.set(e.error?.message || 'Identifiants invalides');
      },
    });
  }

  openOAuth(provider: 'google' | 'microsoft'): void {
    this.oauthProvider.set(provider);
  }

  closeOAuth(): void {
    if (this.oauthLoading()) return;
    this.oauthProvider.set(null);
  }

  selectOAuthAccount(acct: { email: string; firstName: string; lastName: string }): void {
    this.oauthLoading.set(true);
    this.authService.loginWithOAuth(acct.email, { firstName: acct.firstName, lastName: acct.lastName })
      .subscribe({
        next: () => {
          this.oauthLoading.set(false);
          this.oauthProvider.set(null);
        },
        error: () => { this.oauthLoading.set(false); },
      });
  }

  submitRegister(): void {
    if (this.registerForm.invalid) { this.registerForm.markAllAsTouched(); return; }
    this.submitting.set(true);
    this.errorMsg.set('');
    this.authService.register(this.registerForm.value).subscribe({
      next:  () => this.submitting.set(false),
      error: (e) => {
        this.submitting.set(false);
        this.errorMsg.set(e.error?.message || 'Échec de l\'inscription');
      },
    });
  }
}
