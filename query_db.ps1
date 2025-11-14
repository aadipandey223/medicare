# Medicare Database Query Tool - PowerShell Wrapper
# This script provides a simple way to query the Medicare database

$dbPath = Join-Path $PSScriptRoot "medicare.db"
$pythonPath = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"

if (-not (Test-Path $dbPath)) {
    Write-Host "❌ Database file not found: $dbPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $pythonPath)) {
    Write-Host "❌ Python not found at: $pythonPath" -ForegroundColor Red
    exit 1
}

# Create a temporary Python script
$tempScript = [System.IO.Path]::GetTempFileName() + ".py"

$pythonCode = @"
import sqlite3
from tabulate import tabulate
import sys

db_path = r'$dbPath'

def show_overview():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    tables = [row[0] for row in cursor.fetchall()]
    
    print()
    print('='*70)
    print('🏥 MEDICARE DATABASE OVERVIEW')
    print('='*70)
    print()
    
    data = []
    total = 0
    
    for table in sorted(tables):
        cursor.execute(f'SELECT COUNT(*) FROM {table}')
        count = cursor.fetchone()[0]
        total += count
        data.append([table, count])
    
    print(tabulate(data, headers=['Table Name', 'Records'], tablefmt='grid'))
    print()
    print(f'✅ Total Tables: {len(tables)}')
    print(f'✅ Total Records: {total}')
    print()
    
    conn.close()

def show_tables():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    tables = [row[0] for row in cursor.fetchall()]
    
    print()
    print('📋 AVAILABLE TABLES:')
    print()
    
    for i, table in enumerate(sorted(tables), 1):
        cursor.execute(f'SELECT COUNT(*) FROM {table}')
        count = cursor.fetchone()[0]
        print(f'  {i:2d}. {table:<30s} ({count:>4d} records)')
    
    print()
    conn.close()

if __name__ == '__main__':
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == 'overview':
            show_overview()
        elif command == 'tables':
            show_tables()
        elif command == 'query' and len(sys.argv) > 2:
            query = sys.argv[2]
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            try:
                cursor.execute(query)
                
                if cursor.description:
                    rows = cursor.fetchall()
                    if rows:
                        columns = [description[0] for description in cursor.description]
                        data = [list(row) for row in rows]
                        print()
                        print(tabulate(data, headers=columns, tablefmt='grid', maxcolwidths=40))
                        print()
                        print(f'✅ Rows returned: {len(rows)}')
                        print()
                    else:
                        print('⚠️  No results')
                else:
                    print(f'✅ Query executed. Rows affected: {cursor.rowcount}')
            except Exception as e:
                print(f'❌ Error: {e}')
            
            conn.close()
        else:
            print()
            print('📌 USAGE:')
            print()
            print('  Show database overview:')
            print('    .\\query_db.ps1 overview')
            print()
            print('  Show all tables:')
            print('    .\\query_db.ps1 tables')
            print()
            print('  Run SQL query:')
            print('    .\\query_db.ps1 query "SELECT * FROM users LIMIT 5"')
            print()
    else:
        show_overview()
"@

# Write the Python code to temp file
$pythonCode | Out-File -FilePath $tempScript -Encoding UTF8

# Execute the Python script
& $pythonPath $tempScript @args

# Clean up
Remove-Item $tempScript -Force
