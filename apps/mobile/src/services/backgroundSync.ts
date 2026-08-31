// src/backgroundSync.ts — registers a background task to sync the offline queue
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { processQueue } from './offlineQueue';
import { logger } from '../utils/logger';

const BACKGROUND_SYNC_TASK = 'background-sync-task';

TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    await processQueue();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundSync() {
  const status = await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
    minimumInterval: 15 * 60,
    stopOnTerminate: false,
    startOnBoot: true,
  });
  logger.info('[BackgroundSync] Registered:', { status });
}

export async function unregisterBackgroundSync() {
  await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
  logger.info('[BackgroundSync] Unregistered');
}
