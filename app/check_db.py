import sqlite3
import settings

conn = sqlite3.connect(settings.DB_DF)
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
print('Tables:', tables)
for table in tables:
    cursor.execute(f'SELECT * FROM {table[0]}')
    data = cursor.fetchall()
    print(f'{table[0]} data:', data)
conn.close()
