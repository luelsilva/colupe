export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmState {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  resolve: (value: boolean) => void;
}

let _active = $state<ConfirmState | null>(null);

export const confirm = {
  show(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      _active = {
        title: options.title ?? "Confirmação",
        message: options.message,
        confirmText: options.confirmText ?? "Confirmar",
        cancelText: options.cancelText ?? "Cancelar",
        resolve,
      };
    });
  },

  accept() {
    _active?.resolve(true);
    _active = null;
  },

  cancel() {
    _active?.resolve(false);
    _active = null;
  },

  get active() {
    return _active;
  },
};
