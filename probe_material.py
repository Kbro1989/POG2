import sqlite3

def probe_material(db_path, material_id):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [t[0] for t in cursor.fetchall()]
    print(f"Tables: {len(tables)} - {tables}")
    
    for table in tables:
        try:
            cursor.execute(f"PRAGMA table_info({table})")
            columns = [c[1] for c in cursor.fetchall()]
            id_cols = [c for c in columns if c.lower() in ('id', 'rowid', 'dbrowid', 'key', 'index')]
            
            for id_col in id_cols:
                cursor.execute(f"SELECT * FROM {table} WHERE {id_col} = ? LIMIT 1", (material_id,))
                row = cursor.fetchone()
                if row:
                    print(f"\n*** FOUND {material_id} in {table}.{id_col} ***")
                    for col, val in zip(columns, row):
                        print(f"  {col}: {val}")
                    return table, columns, row
        except Exception as e:
            pass
    
    print(f"\n{material_id} not found")
    return None, None, None

probe_material('C:/ProgramData/Jagex/RuneScape-BETA/js5-26.jcache', 2082)
probe_material('C:/ProgramData/Jagex/RuneScape-BETA/js5-26.jcache', 2109)
