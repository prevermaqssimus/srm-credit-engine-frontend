import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Modal genérico e reutilizável (Passo 8) -- usado tanto para o
 * cadastro de recebível quanto para a liquidação (ver FRONTEND_FLOW.md,
 * Seções 3 e 4). Este componente não sabe NADA sobre recebíveis ou
 * liquidações -- só sabe "mostrar um título, um conteúdo (via
 * ng-content) e um jeito de fechar". Quem decide o que aparece dentro é
 * o componente pai, via <ng-content>.
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})
export class ModalComponent {
  @Input({ required: true }) title!: string;

  // Emitido quando o modal deve fechar -- por clique no X ou no
  // backdrop. O componente pai decide o que fazer (ex.: showCreateModal.set(false)),
  // este componente não sabe nada sobre esse estado, só avisa "feche-me".
  @Output() closed = new EventEmitter<void>();

  /**
   * Só fecha se o clique foi no backdrop em si, não em algo DENTRO do
   * modal. Sem essa checagem, clicar em qualquer lugar dentro do modal
   * (um input, um botão) também fecharia ele sem querer, porque o
   * evento de clique "borbulha" (bubbles) até o elemento pai (o
   * backdrop) -- event.target é onde o clique realmente aconteceu,
   * event.currentTarget é o elemento que tem o listener (o backdrop).
   * Só são iguais quando o clique foi direto no backdrop.
   */
  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closed.emit();
    }
  }
}
