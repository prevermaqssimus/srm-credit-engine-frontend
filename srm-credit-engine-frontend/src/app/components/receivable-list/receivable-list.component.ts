import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ReceivableService } from '../../services/receivable.service';
import { extractApiErrorMessage } from '../../services/api-error.util';
import { Receivable } from '../../models/receivable.model';
import { RECEIVABLE_TYPE_LABELS, SETTLEMENT_STATUS_LABELS, SettlementStatus } from '../../models/enums';

/**
 * Lista os recebíveis cadastrados -- consome GET /api/receivables
 * (ReceivableController.listAll). Sem paginação server-side (isso é
 * requisito Pleno+ para o EXTRATO DE LIQUIDAÇÃO, não para esta listagem
 * simples de recebíveis -- ver DECISIONS.md).
 */
@Component({
  selector: 'app-receivable-list',
  standalone: true,
  // CommonModule é necessário aqui pelo pipe/diretiva usados no template
  // (ex.: number, @if/@for do novo control flow do Angular ainda usam
  // CommonModule internamente em alguns casos, dependendo da versão).
  imports: [CommonModule],
  templateUrl: './receivable-list.component.html',
  styleUrl: './receivable-list.component.css',
})
export class ReceivableListComponent {
  // inject() é a forma moderna de injeção de dependência em componentes
  // standalone -- equivalente a receber ReceivableService no construtor,
  // mas sem precisar declarar o parâmetro explicitamente.
  private readonly receivableService = inject(ReceivableService);

  // Evento que este componente dispara para o componente pai (AppComponent)
  // quando o operador seleciona um recebível para liquidar. O pai escuta
  // isso com (selectForSettlement)="..." no template e decide o que fazer
  // (ex.: abrir o modal de liquidação) -- este componente não sabe nada
  // sobre modais, só avisa "isso aqui foi selecionado".
  @Output() selectForSettlement = new EventEmitter<Receivable>();

  // Mapas de tradução (enum -> texto legível), para não espalhar
  // if/switch de exibição pelo template -- o HTML só faz
  // typeLabels[receivable.type], sem lógica.
  readonly typeLabels = RECEIVABLE_TYPE_LABELS;
  readonly statusLabels = SETTLEMENT_STATUS_LABELS;
  readonly statuses = SettlementStatus;

  // signal() é o novo jeito do Angular de guardar estado reativo --
  // qualquer lugar do template que leia receivables() é automaticamente
  // atualizado quando o valor mudar, sem precisar de *ngIf/*ngFor com
  // ChangeDetectorRef manual.
  receivables = signal<Receivable[]>([]);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  // Carrega a lista assim que o componente é instanciado. Poderia estar
  // em ngOnInit() (mais idiomático para efeitos colaterais como chamada
  // HTTP), mas funciona igual aqui porque o componente não depende de
  // nenhum @Input estar resolvido antes de carregar.
  constructor() {
    this.reload();
  }

  /**
   * Busca a lista atualizada de recebíveis no backend. Público (não
   * privado) porque o AppComponent também precisa poder chamar isso de
   * fora -- por exemplo, depois que um novo recebível é cadastrado ou
   * uma liquidação é concluída, para a lista refletir o estado atual
   * sem precisar recarregar a página inteira.
   */
  reload(): void {
    this.loading.set(true);
    this.errorMessage.set(null); // limpa erro de uma tentativa anterior, se houver

    this.receivableService.listAll().subscribe({
      next: (list) => {
        this.receivables.set(list);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        // extractApiErrorMessage traduz o erro cru do backend (400/404/
        // 409/422/500) numa mensagem que o operador entende -- mesma
        // função reaproveitada em todos os componentes que chamam a API
        // (ver DECISIONS.md: sem interceptor central, cada componente
        // trata seu próprio erro).
        this.errorMessage.set(extractApiErrorMessage(err));
        this.loading.set(false);
      },
    });
  }
}