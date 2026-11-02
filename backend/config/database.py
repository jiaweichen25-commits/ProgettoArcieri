import threading
import psycopg2
from psycopg2 import pool
from config.settings import DATABASE_URL

# Pool di connessioni: aprire una connessione a PostgreSQL costa (rete + autenticazione),
# quindi ne teniamo alcune aperte e le riusiamo. I repository non cambiano: chiamano
# get_db_conn() e conn.close() come prima, ma close() rimette la connessione nel pool.
POOL_MIN = 1
POOL_MAX = 10   # PostgreSQL di default accetta 100 connessioni in tutto

_pool = None
_pool_lock = threading.Lock()


def _get_pool():
    global _pool
    with _pool_lock:
        # creato al primo uso, non all'import: cosi' usa il DATABASE_URL di quel momento (i test lo cambiano)
        if _pool is None:
            _pool = pool.ThreadedConnectionPool(POOL_MIN, POOL_MAX, DATABASE_URL)
        return _pool


class _ConnessioneDalPool:
    """Si comporta come una connessione psycopg2, ma close() la restituisce al pool."""

    def __init__(self, conn):
        self._conn = conn

    def __getattr__(self, nome):   # cursor(), commit(), rollback()...: quelli della connessione vera
        return getattr(self._conn, nome)

    # "with conn" (commit alla fine, rollback se c'e' un errore) va inoltrato a mano:
    # Python cerca __enter__/__exit__ sulla classe, quindi __getattr__ non basta
    def __enter__(self):
        self._conn.__enter__()
        return self

    def __exit__(self, *errore):
        return self._conn.__exit__(*errore)

    def close(self):
        if self._conn is not None:
            # se e' rimasta aperta una transazione (anche solo per una SELECT), putconn fa rollback
            _get_pool().putconn(self._conn)
            self._conn = None


def get_db_conn():
    p = _get_pool()
    try:
        conn = p.getconn()
    except pool.PoolError:
        # tutte le connessioni del pool sono in uso: una normale, che close() chiude davvero
        return psycopg2.connect(DATABASE_URL)
    try:
        # una connessione rimasta nel pool puo' essere caduta (es. PostgreSQL riavviato): la proviamo
        with conn.cursor() as cur:
            cur.execute("SELECT 1")
        conn.rollback()
    except psycopg2.Error:
        p.putconn(conn, close=True)   # la buttiamo e ne apriamo una nuova
        conn = p.getconn()
    return _ConnessioneDalPool(conn)
