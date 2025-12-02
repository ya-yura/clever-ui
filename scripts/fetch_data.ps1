$logFile = "fetch_data_debug.log"
Start-Transcript -Path $logFile -Force

$baseUrl = "http://localhost:9000/MobileSMARTS/api/v1"
$outputDir = "src/data/demo"

# Ensure output directory exists
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

function Fetch-And-Save {
    param (
        [string]$Endpoint,
        [string]$Filename,
        [string]$Query = ""
    )

    $url = "$baseUrl/$Endpoint"
    if ($Query) {
        $url = "$url?$Query"
    }

    Write-Host "Fetching $url..."
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -Method Get
        if ($response.StatusCode -eq 200) {
            # Parse to ensure it's valid JSON and maybe format it
            $json = $response.Content | ConvertFrom-Json
            $json | ConvertTo-Json -Depth 100 | Set-Content -Path "$outputDir\$Filename" -Encoding UTF8
            Write-Host "✅ Saved $Filename"
            return $json
        } else {
            Write-Host "❌ Error fetching $Endpoint : $($response.StatusCode)"
            return $null
        }
    } catch {
        Write-Host "❌ Exception fetching $Endpoint : $_"
        return $null
    }
}

# 1. DocTypes
$docTypes = Fetch-And-Save -Endpoint "DocTypes" -Filename "doctypes.json"

# 2. Products
Fetch-And-Save -Endpoint "Products" -Filename "products.json"

# 3. Cells
Fetch-And-Save -Endpoint "Cells" -Filename "cells.json"

# 4. Partners
Fetch-And-Save -Endpoint "Partners" -Filename "partners.json"

# 5. Employees
Fetch-And-Save -Endpoint "Employees" -Filename "employees.json"

# 6. Warehouses
Fetch-And-Save -Endpoint "Warehouses" -Filename "warehouses.json"

# 7. Documents
if ($docTypes) {
    $allDocs = @{}
    $expand = "`$expand=declaredItems,currentItems,combinedItems"
    
    # Try fetching all docs at once first with expansion
    # Note: URL escaping for $ might be tricky in PS strings, using backtick
    $allDocsResponse = Fetch-And-Save -Endpoint "Docs" -Query $expand -Filename "documents_raw.json"
    
    if ($allDocsResponse -and $allDocsResponse.value) {
        # Group by type
        foreach ($doc in $allDocsResponse.value) {
            $type = $doc.documentTypeName
            if (-not $allDocs.ContainsKey($type)) {
                $allDocs[$type] = @()
            }
            $allDocs[$type] += $doc
        }
    } else {
        # Fallback: Fetch by type
        foreach ($type in $docTypes.value) {
            $uni = $type.uni
            Write-Host "Fetching docs for $uni..."
            $docsData = Fetch-And-Save -Endpoint "Docs/$uni" -Query $expand -Filename "temp_$uni.json"
            if ($docsData) {
                $allDocs[$uni] = $docsData.value
            }
            Remove-Item "$outputDir\temp_$uni.json" -ErrorAction SilentlyContinue
        }
    }
    
    $allDocs | ConvertTo-Json -Depth 100 | Set-Content -Path "$outputDir\documents.json" -Encoding UTF8
    Write-Host "✅ Saved documents.json grouped by type"
}

Stop-Transcript

