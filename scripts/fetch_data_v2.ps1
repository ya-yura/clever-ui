# $logFile = "fetch_data_v2.log"
# Start-Transcript -Path $logFile -Force

$baseUrl = "http://localhost:9000/MobileSMARTS/api/v1"
$outputDir = "src/data/demo"

# Ensure output directory exists
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

"Script started" | Set-Content -Path "$outputDir\debug_start.txt"

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
    # $expand = "`$expand=declaredItems,currentItems,combinedItems"
    $expand = ""
    
    Write-Host "Starting document fetch by type..."
    
    foreach ($type in $docTypes.value) {
        $uni = $type.uni
        Write-Host "Fetching docs for $uni..."
        
        # Using try-catch for individual type fetch to prevent full crash
        try {
             $docsData = Fetch-And-Save -Endpoint "Docs/$uni" -Query $expand -Filename "temp_$uni.json"
             if ($docsData -and $docsData.value) {
                 $allDocs[$uni] = $docsData.value
                 Write-Host "   Found $($docsData.value.Count) docs"
             } else {
                 $allDocs[$uni] = @()
             }
        } catch {
             Write-Host "   Failed to fetch docs for $uni"
             $allDocs[$uni] = @()
        }
        
        # Clean up temp file
        if (Test-Path "$outputDir\temp_$uni.json") {
            Remove-Item "$outputDir\temp_$uni.json" -ErrorAction SilentlyContinue
        }

        Start-Sleep -Milliseconds 200
    }
    
    Write-Host "Saving aggregated documents.json..."
    $allDocs | ConvertTo-Json -Depth 100 | Set-Content -Path "$outputDir\documents.json" -Encoding UTF8
    Write-Host "✅ Saved documents.json"
}

# Stop-Transcript

