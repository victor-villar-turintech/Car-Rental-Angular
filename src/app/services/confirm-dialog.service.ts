import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ConfirmDialogRequest {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface ConfirmDialogState extends ConfirmDialogRequest {
  visible: boolean;
}

const HIDDEN_STATE: ConfirmDialogState = {
  visible: false,
  title: 'Confirm action',
  message: '',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  danger: false,
};

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly state$ = new BehaviorSubject<ConfirmDialogState>(HIDDEN_STATE);
  private currentResolver: ((result: boolean) => void) | undefined;

  readonly state: Observable<ConfirmDialogState> = this.state$.asObservable();

  confirm(request: ConfirmDialogRequest): Promise<boolean> {
    if (this.currentResolver) {
      this.currentResolver(false);
      this.currentResolver = undefined;
    }
    return new Promise<boolean>((resolve) => {
      this.currentResolver = resolve;
      this.state$.next({
        visible: true,
        title: request.title || 'Confirm action',
        message: request.message,
        confirmLabel: request.confirmLabel || 'Confirm',
        cancelLabel: request.cancelLabel || 'Cancel',
        danger: !!request.danger,
      });
    });
  }

  resolve(result: boolean): void {
    const resolver = this.currentResolver;
    this.currentResolver = undefined;
    this.state$.next({ ...this.state$.value, visible: false });
    if (resolver) { resolver(result); }
  }
}
