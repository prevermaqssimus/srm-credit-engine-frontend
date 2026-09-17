import { Component, DestroyRef, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ReceivableService } from '../../services/receivable.service';
import { extractApiErrorMessage } from '../../services/api-error.util';
import { Currency, RECEIVABLE_TYPE_LABELS, ReceivableType } from '../../models/enums';
import { Receivable } from '../../models/receivable.model';
import { SimulationResult } from '../../models/simulation-result.model';

/**
 * Formulário de cadastro de recebível (Passo 5) -- consome
 * POST /api/receivables (ReceivableController.create) e
 * POST /api/receivables/simulate (preview de valor líquido em tempo real).
 *
 * Validação no frontend (Validators) é só uma camada de UX (feedback
 * imediato); a validação REAL e autoritativa continua sendo a Bean
 * Validation do backend (CreateReceivableRequest) -- se o frontend
 * deixar passar algo inválido por algum motivo, o backend rejeita mesmo
 * assim, e o erro 400 é exibido aqui.
 */
@Component({
  selector: 'app-receivable-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './receivable-form.component.html',
  styleUrl: './receivable-form.component.css',
})
export class ReceivableFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly receivableService = inject(ReceivableService);
  private readonly destroyRef = inject(DestroyRef);

  @Output() created = new EventEmitter<Receivable>();

  readonly receivableTypes = Object.values(ReceivableType);
  readonly typeLabels = RECEIVABLE_TYPE_LABELS;
  readonly currencies = Currency;

  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  loading = signal(false);

  /**
   * Prévia de valor líquido, recalculada em tempo real enquanto o operador
   * digita (requisito 4.2.1: simulação em tempo real). null enquanto o
   * form não tem os campos necessários preenchidos e válidos.
   */
  simulation = signal<SimulationResult | null>(null);
  simulating = signal(false);
  simulationError = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    type: [ReceivableType.DUPLICATA_MERCANTIL, Validators.required],
    faceValue: [null as number | null, [Validators.required, Validators.min(0.01)]],
    termMonths: [null as number | null, [Validators.required, Validators.min(1)]],
    paymentCurrency: [Currency.BRL, Validators.required],
    cedente: ['', Validators.required],
    sacado: ['', Validators.required],
  });

  constructor() {
    this.form.valueChanges
      .pipe(
        // 300ms: espera o operador parar de digitar antes de simular, em
        // vez de disparar uma chamada a cada tecla.
        debounceTime(300),
        distinctUntilChanged(
          (a, b) =>
            a.type === b.type &&
            a.faceValue === b.faceValue &&
            a.termMonths === b.termMonths &&
            a.paymentCurrency === b.paymentCurrency,
        ),
        switchMap((value) => {
          const { type, faceValue, termMonths, paymentCurrency } = value;
          if (
            !type ||
            !faceValue ||
            faceValue <= 0 ||
            !termMonths ||
            termMonths < 1 ||
            !paymentCurrency
          ) {
            this.simulation.set(null);
            this.simulationError.set(null);
            this.simulating.set(false);
            return of(null);
          }

          this.simulating.set(true);
          this.simulationError.set(null);
          return this.receivableService.simulate({ type, faceValue, termMonths, paymentCurrency });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          this.simulating.set(false);
          if (result) {
            this.simulation.set(result);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.simulating.set(false);
          this.simulation.set(null);
          this.simulationError.set(extractApiErrorMessage(err));
        },
      });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.loading.set(true);

    const value = this.form.getRawValue();

    this.receivableService
      .create({
        type: value.type,
        faceValue: value.faceValue!,
        termMonths: value.termMonths!,
        paymentCurrency: value.paymentCurrency,
        cedente: value.cedente,
        sacado: value.sacado,
      })
      .subscribe({
        next: (receivable) => {
          this.loading.set(false);
          this.successMessage.set(`Recebível #${receivable.id} cadastrado com sucesso.`);
          this.simulation.set(null);
          this.form.reset({
            type: ReceivableType.DUPLICATA_MERCANTIL,
            paymentCurrency: Currency.BRL,
            faceValue: null,
            termMonths: null,
            cedente: '',
            sacado: '',
          });
          this.created.emit(receivable);
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          this.errorMessage.set(extractApiErrorMessage(err));
        },
      });
  }
}
