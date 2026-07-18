import { api } from './apiClient';

export interface QueuedRequest {
      id: string;
      method: 'POST' | 'PUT';
      url: string;
      body: any;
      timestamp: number;
      attempts: number;
}

const QUEUE_KEY = 'offline_sync_queue';
const MAX_ATTEMPTS = 5;

/**
 * Le a fila do localStorage. Entradas do formato antigo da fila (type/table/data)
 * sao descartadas silenciosamente.
 */
export const getQueue = (): QueuedRequest[] => {
      try {
            const raw = localStorage.getItem(QUEUE_KEY);
            const parsed: any[] = raw ? JSON.parse(raw) : [];
            const valid = parsed.filter(
                  (a) => a && typeof a.url === 'string' && (a.method === 'POST' || a.method === 'PUT')
            );
            if (valid.length !== parsed.length) saveQueue(valid as QueuedRequest[]);
            return valid as QueuedRequest[];
      } catch {
            return [];
      }
};

const saveQueue = (queue: QueuedRequest[]): void => {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const queueRequest = (method: 'POST' | 'PUT', url: string, body: any): void => {
      const queue = getQueue();
      queue.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
            method,
            url,
            body,
            timestamp: Date.now(),
            attempts: 0
      });
      saveQueue(queue);
};

const removeFromQueue = (id: string): void => {
      saveQueue(getQueue().filter((a) => a.id !== id));
};

const persistAttempts = (action: QueuedRequest): void => {
      saveQueue(getQueue().map((a) => (a.id === action.id ? action : a)));
};

const isNetworkError = (err: unknown): boolean => err instanceof TypeError;

const sendRequest = async (method: 'POST' | 'PUT', url: string, body: any): Promise<void> => {
      if (method === 'POST') {
            await api.post(url, body);
      } else {
            await api.put(url, body);
      }
};

/**
 * Reenvia a fila em ordem (FIFO). Para no primeiro erro para preservar a ordem;
 * um item que falhar MAX_ATTEMPTS vezes e descartado para nao travar a fila.
 */
export const syncQueue = async (): Promise<{ success: number; failed: number }> => {
      const queue = getQueue().sort((a, b) => a.timestamp - b.timestamp);
      let success = 0;

      for (const action of queue) {
            try {
                  await sendRequest(action.method, action.url, action.body);
                  removeFromQueue(action.id);
                  success++;
            } catch (err) {
                  action.attempts = (action.attempts || 0) + 1;
                  if (action.attempts >= MAX_ATTEMPTS) {
                        console.error('Descartando acao offline apos varias falhas:', action, err);
                        removeFromQueue(action.id);
                  } else {
                        persistAttempts(action);
                  }
                  break;
            }
      }

      return { success, failed: getQueue().length };
};

export const isOnline = (): boolean => navigator.onLine;

export const getQueueSize = (): number => getQueue().length;

/**
 * Escuta a volta da conexao e sincroniza. Tambem drena a fila imediatamente
 * se ja estiver online ao montar (ex.: reabrir o app depois de gravar offline).
 */
export const setupAutoSync = (
      onSync?: (result: { success: number; failed: number }) => void
): (() => void) => {
      const handleOnline = async () => {
            console.log('Back online, syncing queued actions...');
            const result = await syncQueue();
            if (onSync) onSync(result);
      };

      window.addEventListener('online', handleOnline);
      if (isOnline() && getQueueSize() > 0) {
            handleOnline();
      }

      return () => {
            window.removeEventListener('online', handleOnline);
      };
};

/**
 * Envia agora se der; enfileira se estiver offline ou a rede falhar.
 * Erros HTTP (4xx/5xx) NAO sao enfileirados: sobem para o chamador tratar.
 */
export const safeRequest = async (
      method: 'POST' | 'PUT',
      url: string,
      body: any
): Promise<{ success: boolean; queued?: boolean }> => {
      if (!isOnline()) {
            queueRequest(method, url, body);
            return { success: true, queued: true };
      }

      try {
            await sendRequest(method, url, body);
            return { success: true };
      } catch (err) {
            if (isNetworkError(err)) {
                  queueRequest(method, url, body);
                  return { success: false, queued: true };
            }
            throw err;
      }
};
