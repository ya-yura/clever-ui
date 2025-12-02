const fs = require('fs');
const path = require('path');
const axios = require('axios');

class ServerDataFetcher {
  constructor(options) {
    this.outputDir = options.outputDir;
    this.client = axios.create({
      baseURL: options.serverUrl,
      timeout: 10000, // 10s
    });
    console.log('🚀 Initialized fetcher for:', options.serverUrl);
  }

  ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  saveToFile(filename, data) {
    const filepath = path.join(this.outputDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
    console.log('✅ Saved:', filepath);
  }

  async fetchData(endpoint) {
    try {
      const response = await this.client.get(endpoint);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching ${endpoint}:`, error.message);
      return null;
    }
  }

  async fetchAll() {
    this.ensureDir(this.outputDir);

    // 1. DocTypes
    const docTypesData = await this.fetchData('/DocTypes');
    if (docTypesData) {
      this.saveToFile('doctypes.json', docTypesData);
    }

    // 2. Products
    const productsData = await this.fetchData('/Products');
    if (productsData) {
      this.saveToFile('products.json', productsData);
    }

    // 3. Cells
    const cellsData = await this.fetchData('/Cells');
    if (cellsData) {
      this.saveToFile('cells.json', cellsData);
    }

    // 4. Partners
    const partnersData = await this.fetchData('/Partners');
    if (partnersData) {
      this.saveToFile('partners.json', partnersData);
    }

    // 5. Employees
    const employeesData = await this.fetchData('/Employees');
    if (employeesData) {
      this.saveToFile('employees.json', employeesData);
    }

    // 6. Warehouses
    const warehousesData = await this.fetchData('/Warehouses');
    if (warehousesData) {
      this.saveToFile('warehouses.json', warehousesData);
    }

    // 7. Documents
    const allDocs = {};
    if (docTypesData && docTypesData.value) {
      for (const type of docTypesData.value) {
        const uni = type.uni;
        const docsData = await this.fetchData(`/Docs/${uni}`); // No expand for safety
        if (docsData && docsData.value) {
          allDocs[uni] = docsData.value;
        } else {
          allDocs[uni] = [];
        }
        // Sleep 100ms
        await new Promise(r => setTimeout(r, 100));
      }
      this.saveToFile('documents.json', allDocs);
    }
  }
}

async function main() {
  const serverUrl = 'http://localhost:9000/MobileSMARTS/api/v1';
  const outputDir = path.join(__dirname, '../src/data/demo');
  
  const fetcher = new ServerDataFetcher({ serverUrl, outputDir });
  await fetcher.fetchAll();
}

if (require.main === module) {
  main();
}
