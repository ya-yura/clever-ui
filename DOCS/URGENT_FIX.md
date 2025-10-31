# ⚠️ СРОЧНОЕ ИСПРАВЛЕНИЕ - Белый экран

## Проблема
Vite не запускается из-за проблем с установкой зависимостей в Windows PowerShell.

## ✅ Решение (выполните по порядку):

### Шаг 1: Остановите все процессы
```powershell
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
```

### Шаг 2: Полностью очистите проект
```powershell
Remove-Item -Path "node_modules" -Recurse -Force
Remove-Item -Path "package-lock.json" -Force
```

### Шаг 3: Очистите npm cache
```powershell
npm cache clean --force
```

### Шаг 4: Переустановите зависимости
```powershell
npm install
```

### Шаг 5: Запустите через npx напрямую
```powershell
npx vite
```

## Альтернативный способ (если не помогло):

### Используйте CMD вместо PowerShell:
1. Откройте командную строку (CMD) — не PowerShell!
2. Перейдите в папку проекта:
   ```cmd
   cd O:\Dev\Cleverence\proto-3
   ```
3. Удалите node_modules:
   ```cmd
   rmdir /s /q node_modules
   del package-lock.json
   ```
4. Переустановите:
   ```cmd
   npm install
   ```
5. Запустите:
   ```cmd
   npm run dev
   ```

## Если CMD тоже не работает:

### Используйте Git Bash:
1. Откройте Git Bash
2. ```bash
   cd /o/Dev/Cleverence/proto-3
   rm -rf node_modules package-lock.json
   npm install
   npm run dev
   ```

## Проверка что работает:
1. В браузере откройте: http://localhost:3000
2. Вы должны увидеть главную страницу приложения
3. Если видите белый экран - откройте F12 Console и проверьте ошибки

## Если ничего не помогло:

Откройте новый терминал (CMD) и запустите:
```cmd
npm run dev 2>&1
```

Скопируйте весь вывод и сообщите разработчику.

