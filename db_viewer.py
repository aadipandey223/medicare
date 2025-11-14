"""
Simple Database Table Viewer - Interactive CLI
Select table by number, then choose to describe (d) or view (v)
"""

import sqlite3
import os

def get_connection():
    """Get database connection"""
    db_path = 'medicare.db'
    if not os.path.exists(db_path):
        print(f"Error: Database not found at {db_path}")
        return None
    return sqlite3.connect(db_path)

def list_tables(conn):
    """List all tables with numbers"""
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = [row[0] for row in cursor.fetchall()]
    return tables

def get_row_count(conn, table):
    """Get number of rows in table"""
    cursor = conn.cursor()
    cursor.execute(f"SELECT COUNT(*) FROM {table}")
    return cursor.fetchone()[0]

def describe_table(conn, table):
    """Show table structure"""
    cursor = conn.cursor()
    cursor.execute(f"PRAGMA table_info({table})")
    columns = cursor.fetchall()
    
    print(f"\n{'='*70}")
    print(f"Table: {table}")
    print(f"{'='*70}")
    print(f"{'Column':<20} {'Type':<15} {'Null':<8} {'Key':<8}")
    print(f"{'-'*70}")
    
    for col in columns:
        col_id, name, col_type, not_null, default_val, is_pk = col
        null_str = "NO" if not_null else "YES"
        key_str = "PK" if is_pk else ""
        print(f"{name:<20} {col_type:<15} {null_str:<8} {key_str:<8}")
    
    print(f"{'='*70}\n")

def view_table(conn, table):
    """Display table data"""
    cursor = conn.cursor()
    
    # Get columns
    cursor.execute(f"PRAGMA table_info({table})")
    columns = [col[1] for col in cursor.fetchall()]
    
    # Get data
    cursor.execute(f"SELECT * FROM {table}")
    rows = cursor.fetchall()
    
    if not rows:
        print(f"\nTable '{table}' is empty\n")
        return
    
    print(f"\n{'='*100}")
    print(f"Table: {table} ({len(rows)} rows)")
    print(f"{'='*100}")
    
    # Print header
    header = " | ".join(f"{col[:12]:12}" for col in columns)
    print(header)
    print("-" * len(header))
    
    # Print rows
    for row in rows:
        row_str = " | ".join(str(val)[:12].ljust(12) if val is not None else "NULL".ljust(12) for val in row)
        print(row_str)
    
    print(f"{'='*100}\n")

def main():
    """Main interactive loop"""
    conn = get_connection()
    if not conn:
        return
    
    print("\n" + "="*70)
    print(" DATABASE TABLE VIEWER")
    print("="*70)
    
    while True:
        # List tables
        tables = list_tables(conn)
        print("\nAvailable Tables:")
        print("-" * 70)
        
        for i, table in enumerate(tables, 1):
            count = get_row_count(conn, table)
            print(f"  {i}. {table:<30} ({count} rows)")
        
        print("-" * 70)
        print("\nEnter table number (or 'q' to quit): ", end="")
        choice = input().strip()
        
        if choice.lower() in ['q', 'quit', 'exit']:
            print("\nGoodbye!")
            break
        
        if not choice.isdigit():
            print("Invalid input. Please enter a number.")
            continue
        
        table_num = int(choice)
        if table_num < 1 or table_num > len(tables):
            print(f"Invalid table number. Choose between 1 and {len(tables)}")
            continue
        
        selected_table = tables[table_num - 1]
        
        while True:
            print(f"\nSelected: {selected_table}")
            print("Options:")
            print("  d - Describe (show structure)")
            print("  v - View (show data)")
            print("  b - Back to table list")
            print("\nYour choice: ", end="")
            
            action = input().strip().lower()
            
            if action == 'd':
                describe_table(conn, selected_table)
            elif action == 'v':
                view_table(conn, selected_table)
            elif action == 'b':
                break
            else:
                print("Invalid option. Use 'd', 'v', or 'b'")
    
    conn.close()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nInterrupted. Goodbye!")
    except Exception as e:
        print(f"\nError: {e}")
