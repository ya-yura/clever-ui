const http = require('http');

console.log('Starting request...');
http.get('http://localhost:9000/MobileSMARTS/api/v1/DocTypes', (res) => {
  console.log('StatusCode:', res.statusCode);
  res.on('data', (chunk) => { console.log('BODY: ' + chunk); });
}).on('error', (e) => {
  console.error('Error: ' + e.message);
});



