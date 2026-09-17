import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { SettlementService } from '../../services/settlement.service';
import { extractApiErrorMessage, generateIdempotencyKey } from '../../services/api-error.util';
import { Receivable } from '../../models/receivable.model';
import { Settlement } from '../../models/settlement.model';
import { Currency } from '../../models/enums';

/**
 * Modal de liquidação (Passo 7). Recebe o Receivable já selecionado pelo
 * AppComponent (ver FRONTEND_FLOW.md, Seção 4/5) e confirma a liquidação
 * dele via POST /api/settlements.
 *
 * Dois pontos que este componente resolve explicitamente, ambos exigidos
 * pela SPEC.md (idempotência, Critério de Aceite 2):
 *   1. A chave de idempotência é gerada UMA ÚNICA VEZ, quando o modal
 *      abre -- nunca a cada clique em "Confirmar".
 *   2. O botão "Confirmar" fica desabilitado enquanto a requisição está
 *      em voo -- previne duplo clique físico do operador.
 */
@Component({
  selector: 'app-settlement-form',
  standalone: true,
  // FormsModule é necessário aqui pelo [(ngModel)] do <select> de moeda
  // no template -- não usamos ReactiveForms aqui porque é um único
  // campo simples, sem validação complexa, então template-driven é
  // suficiente e mais direto.
  imports: [CommonModule, FormsModule],
  templateUrl: './settlement-form.component.html',
  styleUrl: './settlement-form.component.css',
})
export class SettlementFormComponent implements OnInit {
  private readonly settlementService = inject(SettlementService);

  // @Input: o recebível que o AppComponent já selecionou (ver
  // receivable-list.component.ts, evento selectForSettlement). Este
  // componente não busca nada sozinho -- só recebe o que já foi
  // escolhido na tela anterior.
  @Input({ required: true }) receivable!: Receivable;

  // Evento emitido quando a liquidação é concluída com sucesso -- o
  // AppComponent escuta isso pra fechar o modal, mostrar o resumo
  // (lastSettlement) e recarregar a Grid principal (Passo 8).
  @Output() settled = new EventEmitter<Settlement>();

  readonly currencies = Currency;

  // Moeda de liquidação escolhida pelo operador no modal -- por padrão,
  // a mesma moeda de pagamento já definida no cadastro do recebível.
  selectedCurrency = signal<Currency>(Currency.BRL);

  // isSubmitting: true enquanto a requisição HTTP está em andamento.
  // O template usa isso pra desabilitar o botão "Confirmar" -- é a
  // defesa client-side contra duplo clique, complementar (não
  // substituta) à idempotência real, que vive no backend.
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  // A chave de idempotência em si. Fica guardada aqui, no estado do
  // componente, e NÃO dentro do método de submit -- é isso que garante
  // que ela é a MESMA em qualquer tentativa de reenvio (ex.: primeira
  // tentativa falhou por erro de rede, operador clica de novo) dentro
  // da mesma "sessão" deste modal aberto.
  private idempotencyKey = '';

  ngOnInit(): void {
    // Gerada uma única vez, no momento em que o modal nasce -- nunca
    // dentro de confirm(), que seria chamado de novo a cada clique.
    this.idempotencyKey = generateIdempotencyKey();

    // Moeda de liquidação parte pré-selecionada com a moeda de
    // pagamento já cadastrada no recebível -- o operador ainda pode
    // trocar antes de confirmar, se quiser liquidar em moeda diferente.
    this.selectedCurrency.set(this.receivable.paymentCurrency);
  }

  confirm(): void {
    // Guarda extra: se por algum motivo confirm() for chamado enquanto
    // uma requisição anterior ainda está em voo (ex.: um clique físico
    // muito rápido que passou pelo `disabled` do botão por race
    // condition do navegador), aborta aqui também -- defesa em
    // profundidade, mesma filosofia do backend (idempotência na
    // aplicação E constraint UNIQUE no banco).
    if (this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.settlementService
      .settle({
        receivableId: this.receivable.id,
        currency: this.selectedCurrency(),
        // Mesma chave gerada no ngOnInit, reaproveitada aqui -- é isso
        // que faz um eventual segundo clique (se o primeiro falhar e o
        // operador tentar de novo) ser tratado como idempotente pelo
        // backend, em vez de criar uma segunda liquidação.
        idempotencyKey: this.idempotencyKey,
      })
      .subscribe({
        next: (settlement) => {
          this.isSubmitting.set(false);
          this.settled.emit(settlement);
        },
        error: (err: HttpErrorResponse) => {
          this.isSubmitting.set(false);
          // Não gera uma chave nova aqui -- o erro pode ser transitório
          // (ex.: 422, câmbio indisponível no momento). Se o operador
          // tentar de novo, deve ser com a MESMA chave, não uma nova.
          this.errorMessage.set(extractApiErrorMessage(err));
        },
      });
  }
}
