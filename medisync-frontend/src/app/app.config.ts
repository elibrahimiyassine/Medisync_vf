import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
<<<<<<< HEAD
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
=======
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567

import { routes } from './app.routes';
import { AuthService } from './core/services/auth.service';
import { LUCIDE_ICONS, LucideIconProvider } from 'lucide-angular';
import {
  LayoutDashboard, Calendar, ClipboardList, Pill, Star, Users, Receipt,
  ChartBar, Search, Settings, User, LogOut, ChevronLeft, ChevronRight,
<<<<<<< HEAD
  Building2, Banknote, CircleDollarSign, DoorOpen, Shield, ShieldCheck, LockKeyhole,
=======
  Building2, Banknote, CircleDollarSign, DoorOpen, Shield, LockKeyhole,
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
  Key, Stethoscope, Euro, TriangleAlert, X, Download, Mail, Bell,
  TreePalm, ArrowLeft, Lock, Briefcase, Paperclip, FileText, Folder,
  Image, Microscope, Inbox, Coffee, Siren, ChevronUp, ChevronDown,
  AlertCircle, Scan, UserCheck, ClipboardCheck, Clock,
  Check, Eye, EyeOff, ArrowRight,
  Info, Home, Minus, UserPlus, TrendingUp, GripVertical,
} from 'lucide-angular';

function initAuth(auth: AuthService) {
  return () => auth.initializeAuth();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withRouterConfig({ onSameUrlNavigation: 'reload' })),
    provideAnimations(),
<<<<<<< HEAD
    provideHttpClient(withInterceptors([authInterceptor])),
=======
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
    {
      provide:  APP_INITIALIZER,
      useFactory: initAuth,
      deps:     [AuthService],
      multi:    true,
    },
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        LayoutDashboard, Calendar, ClipboardList, Pill, Star, Users, Receipt,
        ChartBar, Search, Settings, User, LogOut, ChevronLeft, ChevronRight,
<<<<<<< HEAD
        Building2, Banknote, CircleDollarSign, DoorOpen, Shield, ShieldCheck, LockKeyhole,
=======
        Building2, Banknote, CircleDollarSign, DoorOpen, Shield, LockKeyhole,
>>>>>>> 70d4349ce362b98ae279bafeba0f294995e85567
        Key, Stethoscope, Euro, TriangleAlert, X, Download, Mail, Bell,
        TreePalm, ArrowLeft, Lock, Briefcase, Paperclip, FileText, Folder,
        Image, Microscope, Inbox, Coffee, Siren, ChevronUp, ChevronDown,
        AlertCircle, Scan, UserCheck, ClipboardCheck, Clock,
        Check, Eye, EyeOff, ArrowRight,
        Info, Home, Minus, UserPlus, TrendingUp, GripVertical,
      }),
    },
  ],
};
