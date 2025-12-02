// === 📁 scripts/fetchServerData.ts ===
// Утилита для загрузки данных с сервера MobileSMARTS и сохранения в JSON файлы

import fs from 'fs';
import path from 'path';
import axios, { AxiosInstance } from 'axios';

interface FetchOptions {
  serverUrl: string;
  outputDir: string;
  username?: string;
  password?: string;
}

class ServerDataFetcher {
  private client: AxiosInstance;
  private outputDir: string;

  constructor(options: FetchOptions) {
    this.outputDir = options.outputDir;
    
    this.client = axios.create({
      baseURL: options.serverUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log('🚀 Initialized fetcher for:', options.serverUrl);
  }

  /**
   * Создать директорию если не существует
   */
  private ensureDir(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log('📁 Created directory:', dirPath);
    }
  }

  /**
   * Сохранить данные в JSON файл
   */
  private saveToFile(filename: string, data: any) {
    const filepath = path.join(this.outputDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
    console.log('✅ Saved:', filepath);
  }

  /**
   * Получить данные с endpoint
   */
  private async fetchData(endpoint: string): Promise<any> {
    try {
      console.log(`🔍 Fetching: ${endpoint}`);
      const response = await this.client.get(endpoint);
      console.log(`✅ Success: ${endpoint} (${response.status})`);
      return response.data;
    } catch (error: any) {
      console.error(`❌ Error fetching ${endpoint}:`, error.message);
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Data:`, error.response.data);
      }
      return null;
    }
  }

  /**
   * Загрузить типы документов
   */
  async fetchDocTypes() {
    const data = await this.fetchData('/DocTypes');
    if (data) {
      this.saveToFile('doctypes.json', data);
      return data.value || [];
    }
    return [];
  }

  /**
   * Загрузить документы для конкретного типа
   */
  async fetchDocsByType(docTypeUni: string) {
    const data = await this.fetchData(`/Docs/${docTypeUni}`);
    if (data) {
      return data.value || [];
    }
    return [];
  }

  /**
   * Загрузить все документы
   */
  async fetchAllDocuments(docTypes: any[]) {
    const allDocuments: Record<string, any[]> = {};

    for (const docType of docTypes) {
      console.log(`\n📄 Fetching documents for: ${docType.displayName} (${docType.uni})`);
      
      try {
        // Попытка 1: Специализированный endpoint
        let docs = await this.fetchDocsByType(docType.uni);
        
        if (!docs || docs.length === 0) {
          // Попытка 2: С фильтром
          const data = await this.fetchData(`/Docs?$filter=documentTypeName eq '${docType.uni}'`);
          docs = data?.value || [];
        }

        if (!docs || docs.length === 0) {
          // Попытка 3: Все документы (будем фильтровать позже)
          const data = await this.fetchData('/Docs');
          const allDocs = data?.value || [];
          docs = allDocs.filter((doc: any) => 
            doc.documentTypeName === docType.uni || 
            doc.documentTypeUni === docType.uni
          );
        }

        allDocuments[docType.uni] = docs;
        console.log(`   ✅ Found ${docs.length} documents`);
        
        // Задержка между запросами
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        console.error(`   ❌ Error:`, error.message);
        allDocuments[docType.uni] = [];
      }
    }

    this.saveToFile('documents.json', allDocuments);
    return allDocuments;
  }

  /**
   * Загрузить товары
   */
  async fetchProducts() {
    const data = await this.fetchData('/Products');
    if (data) {
      this.saveToFile('products.json', data);
      return data.value || [];
    }
    return [];
  }

  /**
   * Загрузить ячейки
   */
  async fetchCells() {
    const data = await this.fetchData('/Cells');
    if (data) {
      this.saveToFile('cells.json', data);
      return data.value || [];
    }
    return [];
  }

  /**
   * Загрузить контрагентов
   */
  async fetchPartners() {
    const data = await this.fetchData('/Partners');
    if (data) {
      this.saveToFile('partners.json', data);
      return data.value || [];
    }
    return [];
  }

  /**
   * Загрузить сотрудников
   */
  async fetchEmployees() {
    const data = await this.fetchData('/Employees');
    if (data) {
      this.saveToFile('employees.json', data);
      return data.value || [];
    }
    return [];
  }

  /**
   * Загрузить склады
   */
  async fetchWarehouses() {
    const data = await this.fetchData('/Warehouses');
    if (data) {
      this.saveToFile('warehouses.json', data);
      return data.value || [];
    }
    return [];
  }

  /**
   * Загрузить все данные
   */
  async fetchAll() {
    console.log('\n🚀 Starting data fetch...\n');
    
    this.ensureDir(this.outputDir);

    const stats = {
      docTypes: 0,
      documents: 0,
      products: 0,
      cells: 0,
      partners: 0,
      employees: 0,
      warehouses: 0,
    };

    // 1. Типы документов
    console.log('\n📋 Fetching document types...');
    const docTypes = await this.fetchDocTypes();
    stats.docTypes = docTypes.length;

    // 2. Документы
    console.log('\n📄 Fetching documents...');
    const documents = await this.fetchAllDocuments(docTypes);
    stats.documents = Object.values(documents).reduce((sum, docs) => sum + docs.length, 0);

    // 3. Товары
    console.log('\n📦 Fetching products...');
    const products = await this.fetchProducts();
    stats.products = products.length;

    // 4. Ячейки
    console.log('\n🏪 Fetching cells...');
    const cells = await this.fetchCells();
    stats.cells = cells.length;

    // 5. Контрагенты
    console.log('\n👥 Fetching partners...');
    const partners = await this.fetchPartners();
    stats.partners = partners.length;

    // 6. Сотрудники
    console.log('\n👨‍💼 Fetching employees...');
    const employees = await this.fetchEmployees();
    stats.employees = employees.length;

    // 7. Склады
    console.log('\n🏭 Fetching warehouses...');
    const warehouses = await this.fetchWarehouses();
    stats.warehouses = warehouses.length;

    // Сохранить статистику
    this.saveToFile('_stats.json', {
      timestamp: new Date().toISOString(),
      stats,
    });

    console.log('\n✅ Data fetch complete!');
    console.log('\n📊 Statistics:');
    console.log(`   Document Types: ${stats.docTypes}`);
    console.log(`   Documents: ${stats.documents}`);
    console.log(`   Products: ${stats.products}`);
    console.log(`   Cells: ${stats.cells}`);
    console.log(`   Partners: ${stats.partners}`);
    console.log(`   Employees: ${stats.employees}`);
    console.log(`   Warehouses: ${stats.warehouses}`);
    console.log(`\n📁 Output directory: ${this.outputDir}\n`);

    return stats;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  const serverUrl = args[0] || 'http://localhost:9000/MobileSMARTS/api/v1';
  const outputDir = args[1] || path.join(__dirname, '../src/data/demo');
  const username = args[2];
  const password = args[3];

  console.log('═══════════════════════════════════════════════');
  console.log('  MobileSMARTS Data Fetcher');
  console.log('═══════════════════════════════════════════════');
  console.log(`Server: ${serverUrl}`);
  console.log(`Output: ${outputDir}`);
  if (username) {
    console.log(`Auth: ${username}`);
  }
  console.log('═══════════════════════════════════════════════\n');

  const fetcher = new ServerDataFetcher({
    serverUrl,
    outputDir,
    username,
    password,
  });

  try {
    await fetcher.fetchAll();
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { ServerDataFetcher, FetchOptions };


