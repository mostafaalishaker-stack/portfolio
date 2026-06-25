import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="text-center py-16 px-4" role="status">
      <div class="text-6xl mb-4">{{ icon() }}</div>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">{{ title() }}</h3>
      @if (message()) {
        <p class="text-gray-400 max-w-md mx-auto">{{ message() }}</p>
      }
      @if (linkLabel() && linkUrl()) {
        <a [routerLink]="linkUrl()" class="inline-block mt-4 text-indigo-600 hover:underline font-medium">
          {{ linkLabel() }}
        </a>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  icon = input('📦');
  title = input('');
  message = input('');
  linkLabel = input('');
  linkUrl = input('');
}
