# Demo Data

This directory contains JSON files used for "No Authorization" (Demo) mode.

## Data Source

These files are used by `demoDataService.ts` to simulate the MobileSMARTS API when the user logs in without a server connection.

## How to update data

To fetch current data from your local MobileSMARTS server (default: `http://localhost:9000/MobileSMARTS/api/v1`), run:

```bash
npm run fetch-data:custom
```

This will execute `scripts/fetchServerData.js` and overwrite the JSON files in this directory with actual data from the server.

**Note:** If the server is unreachable, the script will fail. You can manually edit these JSON files to update the demo dataset.

## Files

- `doctypes.json` - Document types definitions
- `documents.json` - Grouped documents by type
- `products.json` - Products catalog
- `cells.json` - Storage cells
- `partners.json` - Business partners
- `employees.json` - Employees list
- `warehouses.json` - Warehouses list
