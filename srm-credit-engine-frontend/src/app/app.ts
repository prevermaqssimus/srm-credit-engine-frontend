import { Component, ViewChild, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ModalComponent } from './components/modal/modal.component';
import { ReceivableListComponent } from './components/receivable-list/receivable-list.component';
import { ReceivableFormComponent } from './components/receivable-form/receivable-form.component';
import { SettlementListComponent } from './components/settlement-list/settlement-list.component';
import { SettlementFormComponent } from './components/settlement-form/settlement-form.component';
import { Receivable } from './models/receivable.model';
import { Settlement } from './models/settlement.model';
import { RECEIVABLE_TYPE_LABELS } from './models/enums';

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
    DecimalPipe,
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
  // Usado no card de confirmação de cadastro, para exibir o nome
  // legível do tipo do recebível (ex: "Duplicata Mercantil") em vez do
  // valor bruto do enum ("DUPLICATA_MERCANTIL").
  readonly typeLabels = RECEIVABLE_TYPE_LABELS;

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
  // confirmação depois que o modal de liquidação fecha. Fechado
  // MANUALMENTE pelo operador (botão "Fechar resumo" no app.html), não
  // por timeout -- dá tempo de ler sem pressa.
  lastSettlement = signal<Settlement | null>(null);

  // Mesmo padrão do lastSettlement acima, aplicado ao cadastro: o
  // recebível recém-criado, exibido num card de confirmação FORA do
  // modal (que já fechou), com fechamento manual pelo operador.
  //
  // BUG CORRIGIDO: antes, onReceivableCreated() fechava o modal de forma
  // síncrona, no mesmo instante em que a successMessage() era setada
  // dentro do receivable-form -- o modal (e a mensagem junto) era
  // destruído antes do operador conseguir ler. Em vez de mascarar isso
  // com um setTimeout, a correção definitiva é espelhar o padrão que já
  // funciona para liquidação: fecha o modal IMEDIATAMENTE, mas guarda o
  // resultado num signal próprio, exibido num card FORA do modal, que só
  // some quando o operador clicar em "Fechar".
  lastCreatedReceivable = signal<Receivable | null>(null);

  // --- Fluxo 1: Cadastrar um recebível novo ---

  openCreateModal(): void {
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  /**
   * Chamado quando <app-receivable-form> emite (created) -- agora recebe
   * o Receivable criado (o EventEmitter já emitia isso; só não estava
   * sendo capturado aqui antes). A simulação em tempo real que acontece
   * DENTRO do form (debounce 300ms) nunca chega até aqui -- só o
   * cadastro de fato concluído.
   */
  onReceivableCreated(receivable: Receivable): void {
    this.lastCreatedReceivable.set(receivable);
    this.closeCreateModal();
  }

  /** Fecha o card de confirmação de cadastro -- ação manual do operador. */
  closeReceivableConfirmation(): void {
    this.lastCreatedReceivable.set(null);
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

  /** Fecha o card de resumo de liquidação -- ação manual do operador. */
  closeSettlementSummary(): void {
    this.lastSettlement.set(null);
  }
}