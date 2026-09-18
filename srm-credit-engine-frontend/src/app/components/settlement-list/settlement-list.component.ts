import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { debounceTime } from 'rxjs/operators';
import { SettlementService } from '../../services/settlement.service';
import { extractApiErrorMessage } from '../../services/api-error.util';
import { Currency } from '../../models/enums';
import { Settlement } from '../../models/settlement.model';
import { Page } from '../../models/page.model';

/**
 * Grid de liquidações (Passo 6) -- histórico com paginação server-side e
 * filtros dinâmicos. Consome GET /api/settlements
 * (SettlementController.extrato) -- CADA mudança de página ou filtro
 * dispara uma nova requisição ao backend; nunca busca tudo de uma vez e
 * pagina em memória no navegador (isso não seria "server-side").
 *
 * 4 gatilhos de busca, todos convergindo em load():
 *   1. ngOnInit -- abertura da tela, sem filtro
 *   2. filterForm.valueChanges -- qualquer filtro mudou (debounce 400ms)
 *   3. previousPage()/nextPage() -- navegação de página
 *   4. clearFilters() -- reseta o form, o que dispara o gatilho 2 sozinho
 */
@Component({
  selector: 'app-settlement-list',
  standalone: true,
  // ReactiveFormsModule é necessário porque o filtro usa FormGroup
  // (filterForm), não simples [(ngModel)] -- reactive forms dão acesso
  // ao Observable valueChanges, que é a peça central do Gatilho 2.
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settlement-list.component.html',
  styleUrl: './settlement-list.component.css',
})
export class SettlementListComponent implements OnInit {
  private readonly settlementService = inject(SettlementService);
  private readonly fb = inject(FormBuilder);

  // Exposto pro template poder montar o <select> de moedas iterando
  // sobre os valores do enum, sem hardcoded 'BRL'/'USD' no HTML.
  readonly currencies = Currency;

  // Tamanho de página fixo -- poderia virar um seletor pro operador
  // escolher (10/25/50), mas não é requisito da SPEC, então fica simples.
  readonly pageSize = 10;

  // signal() com a página atual retornada pelo backend (Page<Settlement>)
  // -- null antes da primeira busca completar, para o template saber
  // diferenciar "ainda carregando" de "buscou e veio vazio".
  page = signal<Page<Settlement> | null>(null);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  // Número da página que VAMOS pedir ao backend na próxima chamada --
  // diferente de page().number, que é a página que o backend DE FATO
  // retornou na última resposta. Os dois só ficam dessincronizados
  // durante o tempo entre "usuário clicou next" e "resposta chegou".
  currentPage = signal(0);

  // nonNullable.group garante que os valores do form nunca são
  // `string | null`, só `string` -- evita checagem de null espalhada
  // pelo resto da classe ao ler filterForm.getRawValue().
  filterForm = this.fb.nonNullable.group({
    cedente: [''],
    currency: [''],
    startDate: [''],
    endDate: [''],
  });

  ngOnInit(): void {
    // Gatilho 1: carrega a primeira página assim que o componente nasce,
    // sem esperar nenhuma ação do operador.
    this.load();

    // Gatilho 2: qualquer campo do filtro mudando dispara uma busca nova,
    // mas só depois de 400ms SEM nova mudança (debounce) -- evita mandar
    // uma requisição a cada letra digitada no campo "Cedente".
    this.filterForm.valueChanges.pipe(debounceTime(400)).subscribe(() => {
      this.currentPage.set(0); // qualquer novo filtro volta pra página 0 --
      // se o resultado sem filtro tinha 3 páginas e o filtro novo reduz
      // pra 1, não faria sentido continuar "na página 3" de algo que não
      // existe mais.
      this.load();
    });
  }

  /**
   * Método único que todos os 4 gatilhos chamam no final. Sempre lê o
   * estado ATUAL do filtro e da página juntos -- isso é o que garante
   * que filtro e paginação nunca ficam dessincronizados entre si (ex.:
   * aplicar um filtro novo enquanto está na página 2 de um filtro
   * antigo).
   */
  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null); // limpa erro de uma tentativa anterior

    const { cedente, currency, startDate, endDate } = this.filterForm.getRawValue();

    this.settlementService
      .extrato({
        // string vazia vira `undefined` -- assim o service não manda
        // esses parâmetros pro backend quando o operador não preencheu
        // (evita mandar cedente='' como se fosse um filtro de verdade).
        cedente: cedente || undefined,
        currency: currency || undefined,
        // Input de data HTML devolve string tipo "2026-01-15" -- o
        // backend espera ISO-8601 completo, daí o new Date(...).toISOString().
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        page: this.currentPage(),
        size: this.pageSize,
      })
      .subscribe({
        next: (result) => {
          this.page.set(result);
          this.loading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage.set(extractApiErrorMessage(err));
          this.loading.set(false);
        },
      });
  }

  /** Gatilho 3 (parte 1): pula direto pra uma página específica. */
  goToPage(pageNumber: number): void {
    this.currentPage.set(pageNumber);
    this.load();
  }

  /**
   * Gatilho 3 (parte 2): botão "Anterior". `current.first` vem do
   * backend (convenção Spring Data Page) -- true quando já estamos na
   * primeira página, e nesse caso o método não faz nada (o template
   * também desabilita visualmente o botão nessa condição).
   */
  previousPage(): void {
    const current = this.page();
    if (current && !current.first) {
      this.goToPage(current.number - 1);
    }
  }

  /** Gatilho 3 (parte 3): botão "Próxima", mesma lógica do anterior. */
  nextPage(): void {
    const current = this.page();
    if (current && !current.last) {
      this.goToPage(current.number + 1);
    }
  }

  /**
   * Gatilho 4: NÃO chama load() diretamente -- só reseta os valores do
   * form. Como o Gatilho 2 já está escutando valueChanges o tempo todo,
   * resetar o form dispara o valueChanges sozinho, que chama load() 400ms
   * depois. Ou seja: limpar filtros aciona a busca de forma indireta,
   * pelo mesmo mecanismo do Gatilho 2 -- não é um quinto caminho separado.
   */
  clearFilters(): void {
    this.filterForm.reset({ cedente: '', currency: '', startDate: '', endDate: '' });
  }

  /**
   * Chamado de FORA deste componente, pelo AppComponent (via
   * @ViewChild, Passo 8), depois que uma nova liquidação é concluída --
   * assim a grid principal reflete o novo registro sem o operador
   * precisar atualizar a página manualmente. É só um alias público de
   * load(), existindo separado por clareza de intenção no ponto de
   * chamada (reload() comunica melhor "atualizar por causa de algo
   * externo" do que reaproveitar load() genérico).
   */
  reload(): void {
    this.load();
  }
}
