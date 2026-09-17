import { Component, ViewChild, signal } from '@angular/core';
import { ModalComponent } from './components/modal/modal.component';
import { ReceivableListComponent } from './components/receivable-list/receivable-list.component';
import { ReceivableFormComponent } from './components/receivable-form/receivable-form.component';
import { SettlementListComponent } from './components/settlement-list/settlement-list.component';
import { SettlementFormComponent } from './components/settlement-form/settlement-form.component';
import { Receivable } from './models/receivable.model';
import { Settlement } from './models/settlement.model';

/**
 * Orquestração final (Passo 8) -- ver FRONTEND_FLOW.md, Seções 4-6.
 *
 * 3 sinais controlam o que aparece/desaparece na tela:
 *   - showCreateModal: modal "Cadastrar Recebível" (aberto/fechado)
 *   - showSettleModal: modal "Liquidar Recebível" (aberto/fechado)
 *   - showReceivablesPanel: painel de recebíveis cadastrados (visível/oculto)
 *
 * A Grid de liquidações NÃO tem sinal de visibilidade -- ela sempre
 * aparece na tela, porque é o conteúdo principal (ver Seção 2 do
 * FRONTEND_FLOW.md).
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ModalComponent,
    ReceivableListComponent,
    ReceivableFormComponent,
    SettlementListComponent,
    SettlementFormComponent,
  ],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  // Referência direta ao componente da Grid, pra poder chamar .reload()
  // nele de fora (ver DECISIONS.md: escolha consciente de @ViewChild em
  // vez de Signal Store/NgRx, simplicidade suficiente pro escopo do case).
  @ViewChild(SettlementListComponent) settlementList!: SettlementListComponent;

  showCreateModal = signal(false);
  showSettleModal = signal(false);
  showReceivablesPanel = signal(false);

  // Qual recebível está sendo liquidado no momento -- null quando
  // nenhum modal de liquidação está aberto. Passado como @Input pro
  // SettlementFormComponent quando o modal abre.
  selectedForSettlement = signal<Receivable | null>(null);

  // Resumo da última liquidação concluída -- exibido num card de
  // confirmação depois que o modal de liquidação fecha.
  lastSettlement = signal<Settlement | null>(null);

  // --- Fluxo 1: Cadastrar um recebível novo ---

  openCreateModal(): void {
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  /**
   * Chamado quando <app-receivable-form> emite (created). A simulação
   * em tempo real que acontece DENTRO do form (debounce 300ms) nunca
   * chega até aqui -- só o cadastro de fato concluído.
   */
  onReceivableCreated(): void {
    this.closeCreateModal();
  }

  // --- Fluxo 2: Ver e selecionar um recebível para liquidar ---

  toggleReceivablesPanel(): void {
    this.showReceivablesPanel.update((v) => !v);
  }

  onSelectForSettlement(receivable: Receivable): void {
    this.selectedForSettlement.set(receivable);
    this.showSettleModal.set(true);
  }

  // --- Fluxo 3: Liquidar e ver o resultado ---

  closeSettleModal(): void {
    this.showSettleModal.set(false);
    this.selectedForSettlement.set(null);
  }

  /**
   * Chamado quando <app-settlement-form> emite (settled). Este é o
   * ponto em que várias partes da tela precisam reagir juntas:
   * mostrar o resumo, fechar o modal, e recarregar a Grid principal --
   * exatamente o que o FRONTEND_FLOW.md (Seção 5) descreve.
   */
  onSettled(settlement: Settlement): void {
    this.lastSettlement.set(settlement);
    this.closeSettleModal();

    // Recarrega a Grid principal via @ViewChild -- o recebível liquidado
    // muda de status (PENDING -> SETTLED), então tanto a Grid quanto o
    // painel de recebíveis (se aberto) precisam refletir isso.
    this.settlementList.reload();
  }
}
