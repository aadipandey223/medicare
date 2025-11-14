#!/usr/bin/env python3
"""
Medicare Database Query Tool
Simple script to query and explore the medicare.db SQLite database
Usage: python query_db.py
"""

import sqlite3
import sys
from pathlib import Path
from tabulate import tabulate

# Database path
DB_PATH = Path(__file__).parent / 'medicare.db'

def connect_db():
    """Connect to the database"""
    if not DB_PATH.exists():
        print(f"❌ Database not found at {DB_PATH}")
        sys.exit(1)
    
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row  # Return rows as dictionaries
    return conn

def get_tables(conn):
    """Get list of all tables"""
    cursor = conn.cursor()
    cursor.execute("""
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
        ORDER BY name
    """)
    return [row[0] for row in cursor.fetchall()]

def get_table_schema(conn, table_name):
    """Get column information for a table"""
    cursor = conn.cursor()
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = cursor.fetchall()
    return columns

def get_table_row_count(conn, table_name):
    """Get row count for a table"""
    cursor = conn.cursor()
    cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
    return cursor.fetchone()[0]

def display_table_schema(conn, table_name):
    """Display table structure"""
    print(f"\n{'='*80}")
    print(f"📋 Table: {table_name}")
    print(f"{'='*80}")
    
    count = get_table_row_count(conn, table_name)
    print(f"Total records: {count}")
    print(f"\nColumns:")
    
    schema = get_table_schema(conn, table_name)
    header = ['Column', 'Type', 'NotNull', 'Default', 'PK']
    rows = []
    
    for col in schema:
        rows.append([
            col[1],  # name
            col[2],  # type
            '✓' if col[3] else '✗',  # notnull
            col[4] if col[4] else '-',  # dflt_value
            '✓' if col[5] else '✗'  # pk
        ])
    
    print(tabulate(rows, headers=header, tablefmt='grid'))

def display_table_data(conn, table_name, limit=10):
    """Display sample data from table"""
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM {table_name} LIMIT {limit}")
    
    rows = cursor.fetchall()
    if not rows:
        print(f"\n⚠️  No data in {table_name}")
        return
    
    # Convert rows to list of lists
    data = [list(row) for row in rows]
    columns = [description[0] for description in cursor.description]
    
    print(f"\n📊 Sample Data (first {limit} rows):")
    print(tabulate(data, headers=columns, tablefmt='grid', maxcolwidths=30))

def show_all_tables_overview(conn):
    """Show overview of all tables"""
    tables = get_tables(conn)
    
    print(f"\n{'='*80}")
    print("🗄️  DATABASE OVERVIEW - MEDICARE.DB")
    print(f"{'='*80}\n")
    
    data = []
    total_records = 0
    
    for table in tables:
        count = get_table_row_count(conn, table)
        schema = get_table_schema(conn, table)
        columns = len(schema)
        total_records += count
        
        data.append([table, columns, count])
    
    header = ['Table Name', 'Columns', 'Records']
    print(tabulate(data, headers=header, tablefmt='grid'))
    print(f"\nTotal tables: {len(tables)}")
    print(f"Total records: {total_records}")

def execute_custom_query(conn, query):
    """Execute custom SQL query"""
    try:
        cursor = conn.cursor()
        cursor.execute(query)
        
        # Check if it's a SELECT query
        if cursor.description:
            rows = cursor.fetchall()
            data = [list(row) for row in rows]
            columns = [description[0] for description in cursor.description]
            
            print(f"\n✅ Query executed successfully!")
            print(f"Rows returned: {len(data)}\n")
            
            if data:
                print(tabulate(data, headers=columns, tablefmt='grid', maxcolwidths=40))
            else:
                print("No results")
        else:
            # INSERT/UPDATE/DELETE query
            print(f"\n✅ Query executed successfully!")
            print(f"Rows affected: {cursor.rowcount}")
    
    except sqlite3.Error as e:
        print(f"\n❌ SQL Error: {e}")
    except Exception as e:
        print(f"\n❌ Error: {e}")

def interactive_mode():
    """Interactive query mode"""
    conn = connect_db()
    print("\n" + "="*80)
    print("🏥 MEDICARE DATABASE QUERY TOOL")
    print("="*80)
    
    while True:
        print("\n📌 OPTIONS:")
        print("  1. Show all tables overview")
        print("  2. View table schema and data")
        print("  3. Execute custom SQL query")
        print("  4. List all tables")
        print("  5. Exit")
        
        choice = input("\nEnter your choice (1-5): ").strip()
        
        if choice == '1':
            show_all_tables_overview(conn)
        
        elif choice == '2':
            tables = get_tables(conn)
            print("\nAvailable tables:")
            for i, table in enumerate(tables, 1):
                print(f"  {i}. {table}")
            
            try:
                table_num = int(input("\nSelect table number: ")) - 1
                if 0 <= table_num < len(tables):
                    table_name = tables[table_num]
                    display_table_schema(conn, table_name)
                    display_table_data(conn, table_name)
                else:
                    print("❌ Invalid selection")
            except ValueError:
                print("❌ Please enter a valid number")
        
        elif choice == '3':
            print("\n💡 Examples:")
            print("  SELECT * FROM users WHERE role='doctor';")
            print("  SELECT COUNT(*) as total FROM consultations;")
            print("  SELECT u.name, d.specialization FROM users u JOIN doctors d ON u.id = d.user_id;")
            
            query = input("\nEnter SQL query: ").strip()
            if query:
                execute_custom_query(conn, query)
        
        elif choice == '4':
            tables = get_tables(conn)
            print(f"\n📋 All tables ({len(tables)} total):")
            for i, table in enumerate(tables, 1):
                count = get_table_row_count(conn, table)
                print(f"  {i:2d}. {table:<30s} ({count} records)")
        
        elif choice == '5':
            print("\n👋 Goodbye!")
            break
        
        else:
            print("❌ Invalid choice. Please try again.")
    
    conn.close()

if __name__ == '__main__':
    # Check for command line arguments
    if len(sys.argv) > 1:
        # Execute SQL query from command line
        query = ' '.join(sys.argv[1:])
        conn = connect_db()
        execute_custom_query(conn, query)
        conn.close()
    else:
        # Interactive mode
        interactive_mode()
