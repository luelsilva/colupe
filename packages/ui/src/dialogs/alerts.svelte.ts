export type AlertType = "success" | "error" | "warning" | "info";

export interface AlertItem {
  id: string;
  type: AlertType;
  message: string;
  duration: number;
}

let _items = $state<AlertItem[]>([]);

function push(type: AlertType, message: string, duration = 4000) {
  const id = `alert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  _items = [..._items, { id, type, message, duration }];

  if (duration > 0) {
    setTimeout(() => dismiss(id), duration);
  }
}

function dismiss(id: string) {
  _items = _items.filter((a) => a.id !== id);
}

function clear() {
  _items = [];
}

export const alert = {
  success: (msg: string, duration?: number) => push("success", msg, duration),
  error: (msg: string, duration?: number) => push("error", msg, duration ?? 6000),
  warning: (msg: string, duration?: number) => push("warning", msg, duration),
  info: (msg: string, duration?: number) => push("info", msg, duration),
  dismiss,
  clear,
  get items() {
    return _items;
  },
};
