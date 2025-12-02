// Тест импорта JSON файлов
console.log('Testing imports...');

try {
  // Импорт как в loadInitialData
  import('./src/data/receiving.json').then(data => {
    console.log('✅ receiving.json loaded:', data.default.documents.length, 'documents');
  }).catch(err => {
    console.error('❌ receiving.json error:', err.message);
  });

  import('./src/data/employees.json').then(data => {
    console.log('✅ employees.json loaded:', data.default.length, 'employees');
  }).catch(err => {
    console.error('❌ employees.json error:', err.message);
  });

} catch (e) {
  console.error('Import error:', e.message);
}