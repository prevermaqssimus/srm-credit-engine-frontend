import { Component, signal } from '@angular/core';
import { ReceivableListComponent } from './components/receivable-list/receivable-list.component';

@Component({
  imports: [ReceivableListComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('srm-credit-engine-frontend');
}
