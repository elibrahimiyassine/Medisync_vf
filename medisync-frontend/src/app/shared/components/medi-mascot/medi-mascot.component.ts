import { Component, Input, OnChanges, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export type MediState =
  | 'idle'
  | 'watching'
  | 'eyes-covered'
  | 'happy'
  | 'sad'
  | 'excited'
  | 'thinking'
  | 'tilting';

@Component({
  selector: 'app-medi-mascot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medi-mascot.component.html',
  styleUrls:  ['./medi-mascot.component.scss']
})
export class MediMascotComponent implements OnChanges {
  @Input() state: MediState = 'idle';
  @Input() size: number = 120;
  @Input() trackCursor = false;

  eyeOffsetX = 0;
  eyeOffsetY = 0;
  eyesCovered = false;
  isTilting   = false;
  isWagging   = false;
  isShaking   = false;
  isHappy     = false;

  ngOnChanges() {
    this.eyesCovered = this.state === 'eyes-covered';
    this.isTilting   = this.state === 'tilting';
    this.isWagging   = this.state === 'happy' || this.state === 'excited';
    this.isShaking   = this.state === 'sad';
    this.isHappy     = this.state === 'happy' || this.state === 'excited';
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.trackCursor || this.eyesCovered) return;
    const el = document.querySelector('.medi-eye-anchor') as HTMLElement;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    const angle = Math.atan2(event.clientY - cy, event.clientX - cx);
    const dist  = 3;
    this.eyeOffsetX = Math.cos(angle) * dist;
    this.eyeOffsetY = Math.sin(angle) * dist;
  }
}
