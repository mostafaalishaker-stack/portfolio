import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `
    <div class="skeleton-card" [style.height]="height()" role="status" aria-label="Loading">
      <div class="skeleton-shimmer"></div>
    </div>
  `,
  styles: [`
    .skeleton-card {
      background: #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      position: relative;
    }
    .skeleton-shimmer {
      height: 100%;
      background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `],
})
export class SkeletonComponent {
  height = input('200px');
}
