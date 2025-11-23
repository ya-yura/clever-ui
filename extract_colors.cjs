const https = require('https');
const fs = require('fs');

const fileKey = 'PC5HmxTaWeYyUr8i1oI09w';
const token = fs.readFileSync('figma-token', 'utf-8').trim();
const nodeId = '11547:229'; // Android Compact - 22

const options = {
  hostname: 'api.figma.com',
  path: `/v1/files/${fileKey}/nodes?ids=${nodeId}`,
  method: 'GET',
  headers: {
    'X-Figma-Token': token
  }
};

console.log(`Fetching colors from node ${nodeId}...`);

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    if (res.statusCode === 200) {
      const json = JSON.parse(data);
      const node = json.nodes[nodeId];
      
      if (node && node.document) {
        const colors = new Map();
        
        function rgbaToHex(r, g, b, a = 1) {
          const toHex = (n) => {
            const hex = Math.round(n * 255).toString(16).padStart(2, '0');
            return hex;
          };
          return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        }
        
        function extractColors(node, path = '') {
          const name = node.name || 'unnamed';
          const fullPath = path ? `${path} > ${name}` : name;
          
          // Check background color
          if (node.backgroundColor) {
            const { r, g, b, a } = node.backgroundColor;
            const hex = rgbaToHex(r, g, b, a);
            colors.set(`BG: ${fullPath}`, hex);
          }
          
          // Check fills
          if (node.fills && Array.isArray(node.fills)) {
            node.fills.forEach((fill, idx) => {
              if (fill.type === 'SOLID' && fill.visible !== false && fill.color) {
                const { r, g, b, a } = fill.color;
                const opacity = fill.opacity !== undefined ? fill.opacity : 1;
                const hex = rgbaToHex(r, g, b, opacity);
                colors.set(`FILL ${idx}: ${fullPath}`, hex);
              }
            });
          }
          
          // Recurse into children
          if (node.children) {
            node.children.forEach(child => extractColors(child, fullPath));
          }
        }
        
        extractColors(node.document);
        
        console.log('\n=== EXTRACTED COLORS ===\n');
        colors.forEach((hex, name) => {
          console.log(`${hex} - ${name}`);
        });
        
        fs.writeFileSync('figma_colors_extracted.json', JSON.stringify(Array.from(colors.entries()), null, 2));
        console.log('\n✅ Colors saved to figma_colors_extracted.json');
      } else {
        console.error('Node not found or no document');
      }
    } else {
      console.error(`Error: ${res.statusCode}`);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();

