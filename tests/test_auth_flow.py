"""
Test suite end-to-end per il modulo di autenticazione e sicurezza:
1. Richiesta OTP recupero password (/auth/forgot-password)
2. Reset password con codice OTP (/auth/reset-password)
3. Login con nuova password (/auth/login)
4. Lettura del profilo utente (/auth/me)
5. Aggiornamento e rimozione username (/auth/username)
6. Rate limiting e blocco account dopo 5 tentativi errati (lockout)
"""

import sys
import os

# Aggiungi cartella backend al path di Python
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from fastapi.testclient import TestClient
from main import app
from config.database import get_db_conn
from repositories import user_repository

def run_all_tests():
    client = TestClient(app)

    print("=" * 60)
    print("AVVIO TEST SUITE AUTENTICAZIONE E SICUREZZA")
    print("=" * 60)

    # 1. Recupera utenti presenti nel database di sviluppo
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute('SELECT "IDutente", "E-mail", "Username", "Ruolo", tentativi_falliti, bloccato_fino_al FROM "Tutenti"')
    users = cur.fetchall()
    conn.close()

    print(f"\n[INFO] Utenti rilevati nel database: {len(users)}")
    if not users:
        print("[ERRORE] Nessun utente presente nel database per eseguire il test.")
        return

    # Seleziona un utente atleta o istruttore per il test
    test_user = users[0]
    id_utente = test_user[0]
    test_email = test_user[1]
    ruolo = test_user[3]
    print(f"[TARGET TEST] ID: {id_utente} | Email: {test_email} | Ruolo: {ruolo}")

    # Assicuriamoci che l'account sia sbloccato prima di iniziare
    user_repository.reset_failed_attempts(id_utente)

    # ------------------------------------------------------------------
    # TEST 1: Richiesta OTP Password Dimenticata
    # ------------------------------------------------------------------
    print("\n--- 1. Test Richiesta Codice OTP (/auth/forgot-password) ---")
    res = client.post('/auth/forgot-password', json={'email': test_email})
    assert res.status_code == 200, f"Atteso 200, ottenuto {res.status_code}"
    print(f" -> Risposta API: {res.status_code} {res.json()}")

    # Recupera il codice OTP dal database
    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute('SELECT reset_token, reset_token_scadenza FROM "Tutenti" WHERE "IDutente" = %s', (id_utente,))
    otp_code, otp_expiry = cur.fetchone()
    conn.close()
    assert otp_code is not None and len(otp_code) == 6, f"Codice OTP non valido: {otp_code}"
    print(f" -> OTP generato nel DB: {otp_code} (scadenza: {otp_expiry})")

    # ------------------------------------------------------------------
    # TEST 2: Reset Password con OTP
    # ------------------------------------------------------------------
    print("\n--- 2. Test Reset Password con OTP (/auth/reset-password) ---")
    
    # 2a. Codice errato
    res_err = client.post('/auth/reset-password', json={
        'email': test_email,
        'code': '000000',
        'new_password': 'NuovaPasswordSicura123!'
    })
    assert res_err.status_code == 400, "Dovrebbe fallire con codice errato"
    print(" -> Verifica codice errato (respinta corretta): 400 OK")

    # 2b. Codice corretto
    nuova_pwd = 'NuovaPasswordSicura123!'
    res_ok = client.post('/auth/reset-password', json={
        'email': test_email,
        'code': otp_code,
        'new_password': nuova_pwd
    })
    assert res_ok.status_code == 200, f"Reset fallito: {res_ok.text}"
    print(" -> Verifica codice corretto (reset riuscito): 200 OK")

    # ------------------------------------------------------------------
    # TEST 3: Login con la Nuova Password
    # ------------------------------------------------------------------
    print("\n--- 3. Test Login con la Nuova Password (/auth/login) ---")
    res_login = client.post('/auth/login', json={
        'email': test_email,
        'password': nuova_pwd,
        'portale': ruolo
    })
    assert res_login.status_code == 200, f"Login fallito con nuova password: {res_login.text}"
    token = res_login.json()['access_token']
    auth_headers = {'Authorization': f'Bearer {token}'}
    print(f" -> Login riuscito: token JWT ricevuto per ruolo '{ruolo}'")

    # ------------------------------------------------------------------
    # TEST 4: Profilo Utente (/auth/me)
    # ------------------------------------------------------------------
    print("\n--- 4. Test Lettura Profilo (/auth/me) ---")
    res_me = client.get('/auth/me', headers=auth_headers)
    assert res_me.status_code == 200
    me_data = res_me.json()
    print(f" -> Profilo ottenuto: {me_data}")
    assert me_data['email'].lower() == test_email.lower()

    # ------------------------------------------------------------------
    # TEST 5: Aggiornamento e Gestione Username (/auth/username)
    # ------------------------------------------------------------------
    print("\n--- 5. Test Aggiornamento Username (/auth/username) ---")
    test_username = 'arciere_test_99'
    res_upd = client.put('/auth/username', headers=auth_headers, json={'username': test_username})
    assert res_upd.status_code == 200, f"Aggiornamento username fallito: {res_upd.text}"
    print(f" -> Username aggiornato a '{test_username}': 200 OK")

    # Verifica da /auth/me
    res_me_check = client.get('/auth/me', headers=auth_headers)
    assert res_me_check.json()['username'] == test_username
    print(" -> Verifica profilo: username confermato correttamente")

    # Ripristino username a None
    client.put('/auth/username', headers=auth_headers, json={'username': None})
    print(" -> Ripristino username originale: completato")

    # ------------------------------------------------------------------
    # TEST 6: Protezione Brute-Force e Lockout Account
    # ------------------------------------------------------------------
    print("\n--- 6. Test Brute-Force e Lockout (5 tentativi errati) ---")
    for attempt in range(1, 5):
        r_fail = client.post('/auth/login', json={
            'email': test_email,
            'password': 'PasswordTotalmenteErrata!',
            'portale': ruolo
        })
        assert r_fail.status_code == 401
        detail = r_fail.json().get('detail', '')
        rimanenti = 5 - attempt
        print(f" -> Tentativo {attempt}/5: 401 Unauthorized | Messaggio: '{detail}'")
        assert f"{rimanenti}/5" in detail

    # 5° tentativo: scatta il blocco temporaneo (403 Forbidden)
    r_lock = client.post('/auth/login', json={
        'email': test_email,
        'password': 'PasswordTotalmenteErrata!',
        'portale': ruolo
    })
    assert r_lock.status_code == 403, f"Atteso 403 Forbidden per lockout, ottenuto {r_lock.status_code}"
    print(f" -> Tentativo 5/5 (LOCKOUT SCATTATO): {r_lock.status_code} Forbidden")
    print(f"    Messaggio utente: '{r_lock.json().get('detail')}'")

    # Pulizia finale DB: reset blocco e tentativi
    user_repository.reset_failed_attempts(id_utente)
    print("\n[PULIZIA] Reset lockout e contatori completato sul database.")

    print("\n" + "=" * 60)
    print("TUTTI I 6 TEST COMPLETATI CON SUCCESSO SENZA ERRORI!")
    print("=" * 60)

if __name__ == '__main__':
    run_all_tests()
