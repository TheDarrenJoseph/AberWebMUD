import psycopg2

databaseConnection = None

def print_version():
    cursor = databaseConnection.cursor()
    cursor.execute('SELECT version()')
    print(cursor.fetchone())

#Using try, except, finally to handle filesystem exceptions
try:
    databaseConnection = psycopg2.connect(database='aber-web-mud-db', user='webmud')
    print('--DB-ONLINE--')
    print_version()

except psycopg2.DatabaseError:
    print('--DB-ERROR--')

finally:
    if databaseConnection is not None:
        databaseConnection.close()
        print('--DB-CLOSED--: ')
