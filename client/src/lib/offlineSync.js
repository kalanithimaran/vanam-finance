import localforage from 'localforage';
import api from './api';

localforage.config({
  name: 'vanam_farm',
  storeName: 'offline_queue'
});

export const queueEntry = async (entry) => {
  const queue = await localforage.getItem('sync_queue') || [];
  queue.push(entry);
  await localforage.setItem('sync_queue', queue);
};

export const syncQueue = async () => {
  if (!navigator.onLine) return;

  const queue = await localforage.getItem('sync_queue') || [];
  if (queue.length === 0) return;

  const newQueue = [];
  for (let entry of queue) {
    try {
      if (entry.action === 'create') {
        await api.post('/api/entries', entry.data);
      } else if (entry.action === 'update') {
        await api.put(`/api/entries/${entry.id}`, entry.data);
      } else if (entry.action === 'delete') {
        await api.delete(`/api/entries/${entry.id}`);
      }
    } catch (err) {
      console.error('Sync error:', err);
      newQueue.push(entry);
    }
  }

  await localforage.setItem('sync_queue', newQueue);
};

window.addEventListener('online', syncQueue);
