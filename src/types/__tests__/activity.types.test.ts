/// <reference types="vitest" />

import { describe, it, expectTypeOf } from 'vitest';
import {
  ActivityEvent,
  ActivityEventPayload,
  ErrorEventPayload,
  EventSeverity,
  ReceivingEventPayload,
  ScanEventPayload,
} from '../activity';

describe('Типы событий активности', () => {
  it('поддерживают payload приёмки', () => {
    const receivingEvent: ActivityEvent<ReceivingEventPayload> = {
      id: 'receiving-test',
      eventType: 'receiving.line.scan',
      timestamp: Date.now(),
      payload: {
        module: 'receiving',
        userId: 'user-1',
        documentId: 'DOC-1',
        lineId: 'LINE-1',
        productId: 'PRD-1',
        expectedQty: 10,
        actualQty: 5,
        difference: -5,
      },
      status: 'pending',
      retryCount: 0,
      createdAt: Date.now(),
    };

    expectTypeOf(receivingEvent.payload).toMatchTypeOf<ActivityEventPayload>();
  });

  it('требует обязательную серьёзность для ошибок', () => {
    const errorEvent: ActivityEvent<ErrorEventPayload> = {
      id: 'error-test',
      eventType: 'app.error',
      timestamp: Date.now(),
      payload: {
        module: 'system',
        severity: 'error',
        message: 'Тестовая ошибка',
      },
      status: 'pending',
      retryCount: 0,
      createdAt: Date.now(),
    };

    expectTypeOf(errorEvent.payload.severity).toMatchTypeOf<EventSeverity>();
  });

  it('валидирует сканирования с обязательным штрихкодом', () => {
    const scanEvent: ActivityEvent<ScanEventPayload> = {
      id: 'scan-test',
      eventType: 'scan.barcode',
      timestamp: Date.now(),
      payload: {
        module: 'scanner',
        userId: 'user-2',
        barcode: '1234567890123',
        scanContext: 'product',
        isValid: true,
      },
      status: 'pending',
      retryCount: 0,
      createdAt: Date.now(),
    };

    expectTypeOf(scanEvent.payload.barcode).toBeString();
  });
});




