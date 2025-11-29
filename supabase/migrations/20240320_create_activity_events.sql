-- Создание таблицы для аналитики событий
-- Соответствует интерфейсу ActivityEvent

CREATE TABLE IF NOT EXISTS public.activity_events (
    id UUID PRIMARY KEY,                          -- UUID v4, генерируется на клиенте
    event_type TEXT NOT NULL,                     -- Тип события (scan.success и т.д.)
    timestamp BIGINT NOT NULL,                    -- Unix timestamp события
    user_id TEXT,                                 -- ID пользователя (если есть)
    device_id TEXT,                               -- ID устройства
    payload JSONB DEFAULT '{}'::jsonb,            -- Все детали события
    
    -- Служебные поля сервера
    server_received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для ускорения аналитических запросов
CREATE INDEX IF NOT EXISTS idx_activity_events_event_type ON public.activity_events(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_events_timestamp ON public.activity_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_activity_events_user_id ON public.activity_events(user_id);

-- RLS Политики (Row Level Security)
-- Включаем RLS
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

-- Разрешаем вставку (INSERT) всем аутентифицированным пользователям или сервисной роли
-- В случае Edge Function мы будем использовать service_role ключ, который обходит RLS,
-- но для безопасности лучше настроить.
CREATE POLICY "Enable insert for authenticated users only" 
ON public.activity_events 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Разрешаем чтение только админам (пример, требует настройки ролей)
-- CREATE POLICY "Enable read for admins only" ...


