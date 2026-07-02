# FASE 0 — Assessment: superficie API, modello dati, ruoli

> Prodotto secondo `docs/PROMPT_AGENTE_ARCO.md` §FASE 0. Fonti: `Arcieri_database/ProgettoArcieri.sql`, `backend/controllers/`, `backend/services/`, `backend/repositories/`, `backend/dependencies/auth_deps.py`, `frontend/pages/`.

## 0. Vulnerabilità rilevata durante l'assessment — CORRETTA

**IDOR su `/allenamenti/{id_allenamento}/settimane/...` (`backend/controllers/dettaglioallenamenti_controller.py` + `backend/services/dettaglioallenamenti_service.py`).**
Tutte le route di dettaglio seduta (stretching, riscaldamento, tecforcor, allfisforres, allfiscor, note, sedute) controllavano solo che l'utente fosse `istruttore` (`solo_istruttore`), **non** che `id_allenamento` appartenesse a un atleta di quell'istruttore. Un istruttore autenticato poteva leggere/creare/modificare/cancellare i dettagli di sedute di allenamento di atleti seguiti da **altri** istruttori, semplicemente indovinando/iterando `id_allenamento`.

**Fix applicato (2026-07-02):** aggiunta `_autorizza(id_utente, id_allenamento)` in `dettaglioallenamenti_service.py`, identica al pattern `_verifica_allenamento` già presente in `pianogare_service.py`, su ogni funzione del servizio. Il controller ora passa `utente["id_utente"]` a ogni chiamata. In più, le query UPDATE/DELETE dei record di dettaglio (`dettaglioallenamenti_repository.py`) ora filtrano anche per `IDallenamento`, non solo per l'id del record, per impedire che un `id_allenamento` verificato venga usato per toccare righe di un altro allenamento tramite un `id_det` indovinato. Nessuna modifica al contratto API (path, payload, risposte invariati) — solo al livello di autorizzazione.

Verificato con test end-to-end contro il backend live (due account istruttore reali, uno che attacca i dati dell'altro): 9 tentativi di accesso cross-istruttore su piani altrui, tutti bloccati con 404, incluso un attacco cross-piano (id_det rubato usato dentro un id_allenamento valido ma diverso). Nessuna regressione: il proprietario dei dati continua a leggere/scrivere normalmente.

## 0bis. Bug di cancellazione (500 su FK) — CORRETTO

Tutte le FK nello schema (`Arcieri_database/ProgettoArcieri.sql`) sono `ON DELETE NO ACTION`. Cancellare un piano di allenamento, una singola seduta, o un atleta con dati collegati (materiali, visite mediche, antidoping, allenamenti, sedute, gare) restituiva `500 Internal Server Error` invece di completare l'operazione, perché nessuna cancellazione a cascata era implementata né a livello di schema né a livello applicativo.

**Fix applicato (2026-07-02), a livello applicativo (nessuna modifica allo schema DB in uso):**
- `allenamenti_repository.elimina_allenamento` — elimina prima tutti i dettagli collegati al piano (stretching, riscaldamento, tecforcor, allfisforres, allfiscor, note, sedute, gare), poi il piano stesso, in un'unica transazione.
- `dettaglioallenamenti_repository.elimina_seduta` — stessa logica per la singola seduta (elimina prima i cinque tipi di dettaglio, poi la riga seduta).
- `atleti_repository.elimina_atleta` — elimina in cascata: dettagli di ogni piano dell'atleta, i piani stessi, materiali, visite mediche, antidoping, poi l'atleta; il servizio a monte (`atleti_service.elimina_atleta`) già cancellava anche l'account utente collegato.

**Attenzione — implicazione operativa:** questo fix rende `DELETE /atleti/{id_atleta}` realmente distruttivo: prima falliva silenziosamente (500, nessun dato perso) se l'atleta aveva storico; ora cancella in modo permanente e irreversibile visite mediche, autorizzazioni antidoping, materiali e l'intero storico allenamenti. Nessun soft-delete esiste nello schema. Coerente con H3 ("cancellazioni definitive: mai" per l'agente coach), l'agente non deve mai invocare questa DELETE senza conferma esplicita e rafforzata da parte dell'istruttore, e dovrebbe preferire di default il rifiuto salvo istruzione inequivocabile.

Verificato con test end-to-end: creato un piano con un record in ognuna delle cinque tabelle di dettaglio + nota + gara, cancellato direttamente — 204, nessun residuo. Stesso test per singola seduta. Per l'atleta: creato con materiale, visita medica, antidoping, piano con dettaglio e gara, cancellato direttamente — 204, atleta non più elencato, login dell'account collegato non più funzionante (401).

---

## 1. Modello dati (`Arcieri_database/ProgettoArcieri.sql`)

| Tabella | PK | FK principali | Ruolo |
|---|---|---|---|
| Tutenti | IDutente | — | account (email, hash password, Ruolo: istruttore\|atleta) |
| Tistruttori | IDistruttore | IDutente | profilo istruttore |
| Tatleti | IDatleta | IDutente, IDistruttore | profilo atleta, 1 istruttore assegnato |
| Tallenamenti | IDallenamento | IDatleta | piano di allenamento (data inizio/fine, obiettivi) |
| TdetAllenamenti | (IDallenamento, IDsettimana, IDseduta) | IDallenamento | griglia seduta settimanale |
| TdetStretching / TdetRiscaldamento / TdetTecForCor / TdetAllFisForRes / TdetAllFisCor | id proprio | composite → TdetAllenamenti + lookup | dettaglio esercizi per seduta, per giorno (Lun–Dom) |
| TdetNoteAtleta | IDnota | IDallenamento | nota settimanale |
| Tvisitemediche | IDvisita | IDatleta | visita medica + scadenza |
| Tantidoping | IDantidoping | IDatleta | autorizzazione FITARCO annuale |
| Tpianogare | IDpianogara | IDallenamento, IDtipogara | gara pianificata |
| Tmateriali | IDmateriale | IDatleta | scheda arco/attrezzatura, storico + corrente |
| TS* (stretching, riscaldamento, distanza, targa, descrizioneEsercizio, posizionePiedi, tabellaNumero, attrezzi, tipigare, serie) | id proprio | — | tabelle lookup |

**Gap rilevante per MODALITÀ 1 (analisi risultati):** non esiste alcuna tabella di **punteggio/score** per volée né di sedute di tiro effettivamente registrate con risultati. `TSserie` (es. "6x12") è solo un codice di volume pianificato (serie × frecce), non un punteggio realizzato. L'app oggi **non traccia risultati di tiro** — solo pianificazione (esercizi, volume teorico) e anagrafica (materiali, visite, antidoping, gare). **Trend punteggio medio, deviazione standard per volée, progressione verso obiettivo numerico: FUORI PERIMETRO, dato non disponibile via API.** La MODALITÀ 1 andrebbe riformulata per lavorare solo su: aderenza al piano (sessioni pianificate vs registrate), volume frecce pianificato per settimana/distanza, presenza/assenza di note tecnico.

---

## 2. Superficie API

Base: `http://localhost:8000` · Auth: JWT Bearer (HS256, 60 min) · Ruoli: `istruttore`, `atleta`.

### Auth (`/auth`) — pubblico
- `POST /auth/login` `{email, password, portale}` → `{access_token, token_type}`
- `POST /auth/register` `{email, password, ruolo, nome?, cognome?, qualifica?}` → token

### Istruttore — gestione atleti (`/atleti`, ruolo `istruttore`, scoping OK)
- `GET|POST /atleti/`, `PUT|DELETE /atleti/{id_atleta}`

### Istruttore — sotto-risorse atleta (ruolo `istruttore`, scoping verificato via `_verifica_atleta`)
- `/atleti/{id_atleta}/materiali/` — CRUD scheda arco
- `/atleti/{id_atleta}/visite/` — CRUD visite mediche
- `/atleti/{id_atleta}/antidoping/` — CRUD antidoping
- `/atleti/{id_atleta}/allenamenti/` — CRUD piani di allenamento

### Istruttore — dettaglio seduta (ruolo `istruttore`, scoping OK — vedi §0, corretto in questa sessione)
- `/allenamenti/{id_allenamento}/settimane/{id_settimana}/sedute/...` per: sedute, stretching, riscaldamento, tecforcor (+ `totale-frecce`), allfisforres, allfiscor, nota — GET/POST/PUT/DELETE dove applicabile

### Istruttore — gare (ruolo `istruttore`, scoping OK via `_verifica_allenamento`)
- `/allenamenti/{id_allenamento}/gare/` CRUD
- `/allenamenti/tipi-gara/` GET/POST/DELETE (lookup)

### Istruttore — lookup (ruolo `istruttore`, no scoping — dati condivisi, corretto)
- `/allenamenti/lookup/{stretching|riscaldamento|distanza|targa|descrizione-esercizio|posizione-piedi|tabella-numero|allfisforres-descrizione|attrezzi|allfiscor-descrizione|serie}/` — GET/POST/DELETE

### Atleta — solo lettura (`/me`, ruolo `atleta`, implicitamente scoped al proprio account)
- `GET /me/profilo`, `/me/materiali`, `/me/allenamenti`, `/me/visite`, `/me/antidoping`, `/me/piano-gare`, `/me/allenamenti/{id}/dettaglio`
- **Nessun endpoint di scrittura per l'atleta.** Un atleta non può creare/modificare nulla via API.

---

## 3. Matrice ruoli × operazioni

| Risorsa | Istruttore (proprio atleta) | Istruttore (atleta altrui) | Atleta (proprio) | Atleta (altrui) |
|---|---|---|---|---|
| Anagrafica atleta | R/W | negato (404, corretto) | R (parziale, via /me) | negato |
| Materiali | R/W | negato (404) | R | negato |
| Visite mediche | R/W | negato (404) | R | negato |
| Antidoping | R/W | negato (404) | R | negato |
| Piani allenamento | R/W | negato (404) | R | negato |
| **Dettaglio seduta** | R/W | negato (404, corretto in questa sessione) | R (via /me) | negato |
| Gare | R/W | negato (404) | R | negato |
| Lookup | R/W (condiviso) | R/W (condiviso, per design) | — | — |

---

## 4. Frontend — schermate esposte

| Pagina | File | Ruolo | Scrive? |
|---|---|---|---|
| Login atleta | pages/Autenticazione/Atleti.* | pubblico | — |
| Login/registrazione istruttore | pages/Autenticazione/Istruttore.* | pubblico | — |
| Dashboard istruttore (lista atleti) | pages/Dashboard/Dashboard.* | istruttore | sì |
| Allenamenti | pages/Dashboard/Allenamenti.* | istruttore | sì |
| Dettaglio allenamento (sedute) | pages/Dashboard/DettaglioAllenamento.* | istruttore | sì |
| Materiali | pages/Dashboard/Materiali.* | istruttore | sì |
| Visite mediche | pages/Dashboard/Visitemed.* | istruttore | sì |
| Antidoping | pages/Dashboard/Antidoping.* | istruttore | sì |
| Piano gare | pages/Dashboard/PianoGare.* | istruttore | sì |
| Area atleta (tutte le tab) | pages/AreaAtleta/Dashboard.* | atleta | no, sola lettura |

**Perimetro TUTOR:** per un atleta, spiegare solo tab Profilo/Materiali/Allenamenti/Visitemed/Antidoping/PianoGare/Dettaglio Allenamento in sola lettura. Per un istruttore, spiegare anche le funzioni di scrittura sulle stesse aree più la gestione anagrafica atleti e i lookup. Nessuna schermata di analisi statistica/punteggi esiste nel FE — coerente col gap dati di §1.

---

## 5. Gap noti (fuori perimetro per l'agente)

- Nessuna registrazione di punteggi/risultati di tiro (vedi §1) → MODALITÀ 1 non applicabile nella forma descritta dal system prompt.
- Nessun endpoint di audit/log esposto → il requisito H7 (tracciabilità) non è soddisfacibile via API oggi; le scritture vanno riepilogate solo in conversazione.
- Nessun soft-delete: tutte le DELETE sono cancellazioni definitive lato DB → H3 ("cancellazioni definitive: mai") va rispettato evitando del tutto le DELETE su richiesta diretta, o chiedendo conferma esplicita rafforzata.
- Nessun endpoint per operazioni bulk multi-atleta → coerente con H3, nessuna azione da intraprendere.
