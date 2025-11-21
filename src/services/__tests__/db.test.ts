/// <reference types="vitest" />

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WarehouseDatabase } from '../db';
import type { ActivityEvent } from '@/types/activity';

describe('База данных WarehouseDatabase — таблица activityEvents', () => {
  let db: WarehouseDatabase;

  beforeEach(async () => {
    db = new WarehouseDatabase();
    await db.open();
    await db.activityEvents.clear();
  });

  afterEach(async () => {
    await db.delete();
  });

  it('сохраняет и читает событие активности', async () => {
    const event: ActivityEvent = {
      id: 'test-event',
      eventType: 'app.start',
      timestamp: Date.now(),
      payload: {
        module: 'system',
        metadata: { message: 'проверка' },
      },
      status: 'pending',
      retryCount: 0,
      createdAt: Date.now(),
    };

    await db.activityEvents.put(event);
    const stored = await db.activityEvents.get(event.id);

    expect(stored).toBeTruthy();
    expect(stored?.eventType).toBe('app.start');
    expect(stored?.status).toBe('pending');
  });
});


