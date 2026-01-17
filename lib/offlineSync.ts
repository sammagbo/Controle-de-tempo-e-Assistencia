import { supabase } from './supabaseClient';

interface QueuedAction {
      id: string;
      type: 'insert' | 'update' | 'delete';
      table: string;
      data: any;
      timestamp: number;
}

const QUEUE_KEY = 'offline_sync_queue';

/**
 * Get all queued actions
 */
export const getQueue = (): QueuedAction[] => {
      try {
            const queue = localStorage.getItem(QUEUE_KEY);
            return queue ? JSON.parse(queue) : [];
      } catch {
            return [];
      }
};

/**
 * Save queue to localStorage
 */
const saveQueue = (queue: QueuedAction[]): void => {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

/**
 * Add an action to the offline queue
 */
export const queueAction = (action: Omit<QueuedAction, 'id' | 'timestamp'>): void => {
      const queue = getQueue();
      queue.push({
            ...action,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now()
      });
      saveQueue(queue);
};

/**
 * Remove an action from the queue
 */
const removeFromQueue = (id: string): void => {
      const queue = getQueue();
      const filtered = queue.filter(a => a.id !== id);
      saveQueue(filtered);
};

/**
 * Process a single queued action
 */
const processAction = async (action: QueuedAction): Promise<boolean> => {
      try {
            switch (action.type) {
                  case 'insert':
                        const { error: insertError } = await supabase
                              .from(action.table)
                              .insert(action.data);
                        if (insertError) throw insertError;
                        break;

                  case 'update':
                        const { id, ...updateData } = action.data;
                        const { error: updateError } = await supabase
                              .from(action.table)
                              .update(updateData)
                              .eq('id', id);
                        if (updateError) throw updateError;
                        break;

                  case 'delete':
                        const { error: deleteError } = await supabase
                              .from(action.table)
                              .delete()
                              .eq('id', action.data.id);
                        if (deleteError) throw deleteError;
                        break;
            }
            return true;
      } catch (error) {
            console.error('Error processing queued action:', error);
            return false;
      }
};

/**
 * Sync all queued actions when back online
 */
export const syncQueue = async (): Promise<{ success: number; failed: number }> => {
      const queue = getQueue();
      let success = 0;
      let failed = 0;

      // Sort by timestamp to maintain order
      queue.sort((a, b) => a.timestamp - b.timestamp);

      for (const action of queue) {
            const result = await processAction(action);
            if (result) {
                  removeFromQueue(action.id);
                  success++;
            } else {
                  failed++;
            }
      }

      return { success, failed };
};

/**
 * Check if we're online
 */
export const isOnline = (): boolean => {
      return navigator.onLine;
};

/**
 * Get queue size
 */
export const getQueueSize = (): number => {
      return getQueue().length;
};

/**
 * Listen for online status and auto-sync
 */
export const setupAutoSync = (onSync?: (result: { success: number; failed: number }) => void): () => void => {
      const handleOnline = async () => {
            console.log('Back online, syncing queued actions...');
            const result = await syncQueue();
            if (onSync) onSync(result);
      };

      window.addEventListener('online', handleOnline);

      // Return cleanup function
      return () => {
            window.removeEventListener('online', handleOnline);
      };
};

/**
 * Safe insert - queues if offline
 */
export const safeInsert = async (table: string, data: any): Promise<{ success: boolean; queued?: boolean }> => {
      if (!isOnline()) {
            queueAction({ type: 'insert', table, data });
            return { success: true, queued: true };
      }

      try {
            const { error } = await supabase.from(table).insert(data);
            if (error) throw error;
            return { success: true };
      } catch (error) {
            // Queue for later if online insert fails
            queueAction({ type: 'insert', table, data });
            return { success: false, queued: true };
      }
};

/**
 * Safe update - queues if offline
 */
export const safeUpdate = async (table: string, id: string, data: any): Promise<{ success: boolean; queued?: boolean }> => {
      if (!isOnline()) {
            queueAction({ type: 'update', table, data: { id, ...data } });
            return { success: true, queued: true };
      }

      try {
            const { error } = await supabase.from(table).update(data).eq('id', id);
            if (error) throw error;
            return { success: true };
      } catch (error) {
            queueAction({ type: 'update', table, data: { id, ...data } });
            return { success: false, queued: true };
      }
};
