const https = require('https');
const fs = require('fs');

const fileKey = 'PC5HmxTaWeYyUr8i1oI09w';
const token = fs.readFileSync('figma-token', 'utf-8').trim();

// Search for frames with these specific text elements
const searchTerms = ['Приход', 'Остатки', 'Подбор', '139', '73', '11'];

const options = {
  hostname: 'api.figma.com',
  path: `/v1/files/${fileKey}`,
  method: 'GET',
  headers: {
    'X-Figma-Token': token
  }
};

console.log('Searching for tile frames in Figma file...');

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    if (res.statusCode === 200) {
      const json = JSON.parse(data);
      const found = [];
      
      function rgbaToHex(r, g, b, a = 1) {
        const toHex = (n) => Math.round(n * 255).toString(16).padStart(2, '0');
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
      }
      
      function search(node, path = '') {
        const name = node.name || '';
        const fullPath = path ? `${path} / ${name}` : name;
        
        // Look for frames that might be our tiles
        if (node.type === 'FRAME' || node.type === 'COMPONENT') {
          const hasTargetText = searchTerms.some(term => 
            name.includes(term) || 
            (node.children && node.children.some(c => 
              c.name && c.name.includes(term)
            ))
          );
          
          if (hasTargetText) {
            const info = {
              id: node.id,
              name: node.name,
              path: fullPath,
              type: node.type,
              colors: {}
            };
            
            // Get background color
            if (node.backgroundColor) {
              info.colors.background = rgbaToHex(
                node.backgroundColor.r,
                node.backgroundColor.g,
                node.backgroundColor.b
              );
            }
            
            // Get fills
            if (node.fills && Array.isArray(node.fills)) {
              node.fills.forEach((fill, idx) => {
                if (fill.type === 'SOLID' && fill.visible !== false && fill.color) {
                  info.colors[`fill_${idx}`] = rgbaToHex(
                    fill.color.r,
                    fill.color.g,
                    fill.color.b
                  );
                }
              });
            }
            
            // Get text styles from children
            if (node.children) {
              node.children.forEach(child => {
                if (child.type === 'TEXT' && child.characters) {
                  const textInfo = {
                    text: child.characters,
                    fontSize: child.style?.fontSize,
                    fontWeight: child.style?.fontWeight,
                    fontFamily: child.style?.fontFamily,
                  };
                  
                  if (child.fills && child.fills[0] && child.fills[0].color) {
                    textInfo.color = rgbaToHex(
                      child.fills[0].color.r,
                      child.fills[0].color.g,
                      child.fills[0].color.b
                    );
                  }
                  
                  info.colors[`text_${child.characters}`] = textInfo;
                }
              });
            }
            
            found.push(info);
          }
        }
        
        if (node.children) {
          node.children.forEach(child => search(child, fullPath));
        }
      }
      
      search(json.document);
      
      console.log('\n=== FOUND TILE FRAMES ===\n');
      found.forEach(item => {
        console.log(`\nID: ${item.id}`);
        console.log(`Name: ${item.name}`);
        console.log(`Path: ${item.path}`);
        console.log('Colors:', JSON.stringify(item.colors, null, 2));
      });
      
      fs.writeFileSync('found_tiles.json', JSON.stringify(found, null, 2));
      console.log('\n✅ Results saved to found_tiles.json');
      
      // If we found specific tiles, print their IDs for detailed fetch
      if (found.length > 0) {
        console.log('\n=== NODE IDs TO FETCH ===');
        found.forEach(f => console.log(`${f.name}: ${f.id}`));
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

