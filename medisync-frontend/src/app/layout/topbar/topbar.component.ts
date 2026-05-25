import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrls:  ['./topbar.component.scss']
})
export class TopbarComponent {
  @Input() pageTitle = 'Tableau de bord';
  unreadCount = 3;
  showNotifications = false;

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }
}
