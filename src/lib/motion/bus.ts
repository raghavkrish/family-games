type Handler = (payload?: Record<string, unknown>) => void;

const listeners = new Map<string, Set<Handler>>();

export const motionBus = {
  on(event: string, handler: Handler) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event)!.add(handler);
    return () => listeners.get(event)?.delete(handler);
  },
  emit(event: string, payload?: Record<string, unknown>) {
    listeners.get(event)?.forEach((h) => h(payload));
    listeners.get("*")?.forEach((h) => h({ event, ...payload }));
  },
};
