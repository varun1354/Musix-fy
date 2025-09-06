import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MainContentComponent } from './components/main-content/main-content.component';
import { MusicPlayerComponent } from './components/music-player/music-player.component';
import { LoginModalComponent } from './components/login-modal/login-modal.component';
import { PlayerControlService } from './services/player-control.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    NavbarComponent,
    MainContentComponent,
    MusicPlayerComponent,
    LoginModalComponent
  ]
})
export class AppComponent implements OnInit {
  title = 'musix-fy';
  showLoginModal = false;
  backgroundGradient = '';
  currentAlbumArt: string | null = null;
  fadeInBg = false;
  fadeTimeout: any = null;
  toastMessage: string | null = null;
  toastTimeout: any = null;

  constructor(private playerControl: PlayerControlService) {}

  ngOnInit() {
    this.playerControl.currentTrack$.subscribe(track => {
      if (track && track.albumArt) {
        if (this.fadeTimeout) {
          clearTimeout(this.fadeTimeout);
        }
        this.currentAlbumArt = track.albumArt;
        this.fadeInBg = false;
        setTimeout(() => {
          this.fadeInBg = true;
          this.fadeTimeout = setTimeout(() => {
            this.fadeInBg = false;
          }, 700);
        }, 10);
        this.generateGradientFromImage(track.albumArt).then(gradient => {
          this.backgroundGradient = gradient;
        });
      }
    });
    this.playerControl.addToQueue$.subscribe(track => {
      if (this.toastTimeout) {
        clearTimeout(this.toastTimeout);
      }
      this.toastMessage = `"${track.title}" added to queue`;
      this.toastTimeout = setTimeout(() => {
        this.toastMessage = null;
      }, 1500);
    });
  }

  async generateGradientFromImage(imageUrl: string): Promise<string> {
    // Use a simple average color extraction for demo; for production, use a library like color-thief
    return new Promise(resolve => {
      const img = new window.Image();
      img.crossOrigin = 'Anonymous';
      img.src = imageUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve('linear-gradient(135deg, #222, #444)');
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4 * 100) { // sample every 100th pixel
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);
        // Create a gradient with a lighter and darker version
        const color1 = `rgb(${r},${g},${b})`;
        const color2 = `rgb(${Math.min(255, r+40)},${Math.min(255, g+40)},${Math.min(255, b+40)})`;
        resolve(`linear-gradient(135deg, ${color1}, ${color2})`);
      };
      img.onerror = () => resolve('linear-gradient(135deg, #222, #444)');
    });
  }

  toggleLoginModal() {
    this.showLoginModal = !this.showLoginModal;
  }
}
