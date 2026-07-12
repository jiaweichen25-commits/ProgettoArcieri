(function() {
  const stiliWidget = `
    .backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4); opacity: 0; pointer-events: none; transition: opacity 0.25s ease-out; z-index: 998; }
    .backdrop.open { opacity: 1; pointer-events: auto; }
    .panel-ai { position: fixed; right: 0; top: 0; height: 100vh; width: 400px; max-width: 90vw; background: #1a1a1a; border-left: 1px solid #333; transform: translateX(100%); transition: transform 0.25s ease-out; z-index: 999; overflow-y: auto; display: flex; flex-direction: column; padding: 24px; box-sizing: border-box; box-shadow: 0 12px 24px rgba(0, 0, 0, 0.45); }
    .panel-ai.open { transform: translateX(0); }
    .panel-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; border-left: 3px solid #c0392b; padding-left: 12px; flex-wrap: wrap; }
    .panel-header h3 { font-size: 1.05rem; font-weight: 600; margin: 0; color: #fff; }
    .ai-selected-pill { display: inline-block; font-size: 0.68rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #888; background: #111; border: 1px solid #333; padding: 4px 10px; border-radius: 2px; }
    .ai-selected-pill.active { color: #fff; background: rgba(192, 57, 43, 0.2); border-color: #c0392b; }
    .ai-hint { color: #888; font-size: 0.85rem; line-height: 1.5; margin-bottom: 18px; }
    #sectionAi .field textarea { width: 100%; min-height: 110px; padding: 12px 14px; background: #111; border: 1px solid #333; border-radius: 2px; color: white; font-size: 0.95rem; font-family: inherit; resize: vertical; transition: border-color 0.2s; }
    #sectionAi .field textarea:focus { outline: none; border-color: #c0392b; }
    #sectionAi .field textarea::placeholder { color: #444; }
    .ai-history { display: flex; flex-direction: column; gap: 12px; margin-top: 14px; max-height: 450px; overflow-y: auto; padding-right: 8px; }
    .ai-history::-webkit-scrollbar { width: 6px; }
    .ai-history::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
    .ai-bubble { padding: 12px 16px; border-radius: 8px; font-size: 0.85rem; line-height: 1.6; white-space: pre-wrap; max-width: 90%; }
    .user-bubble { background: #222; color: #fff; align-self: flex-end; border: 1px solid #333; border-bottom-right-radius: 2px; }
    .ai-bubble-response { background: #111; color: #ccc; align-self: flex-start; border-left: 3px solid #c0392b; border-bottom-left-radius: 2px; }
    .ai-debug-info { margin-top: 12px; font-size: 0.75rem; color: #777; border-top: 1px solid #222; padding-top: 6px; }
    .ai-loading { display: none; color: #888; font-size: 0.8rem; letter-spacing: 0.5px; margin-top: 10px; }
    .ai-loading.show { display: block; }
  `;
  const styleEl = document.createElement('style');
  styleEl.innerHTML = stiliWidget;
  document.head.appendChild(styleEl);

  // Inject HTML structure
  const widgetHtml = `
    <button class="btn btn-red" type="button" id="btnAssistenteIA" style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">+ Assistente IA</button>
    
    <div class="backdrop" id="aiBackdrop"></div>

    <div class="panel-ai" id="sectionAi">
      <div class="panel-header">
        <h3>Chiedi all'Agente AI</h3>
        <span class="ai-selected-pill" id="aiSelectedPill">Nessun atleta selezionato</span>
      </div>
      <p class="ai-hint">
        Fai una domanda contestuale sull'atleta selezionato oppure chiedi consigli generali.
      </p>

      <div class="field">
        <label>La tua domanda</label>
        <textarea id="aiDomanda" rows="4" placeholder="Es. quali materiali ha in prestito questo atleta?"></textarea>
      </div>

      <div class="modal-actions">
        <button class="btn btn-outline" type="button" id="aiBtnClose">Chiudi</button>
        <button class="btn btn-red" type="button" id="aiBtnInvia">Invia</button>
      </div>

      <div class="ai-history" id="aiHistory"></div>
      <div class="ai-loading" id="aiLoading">L'agente sta elaborando...</div>
    </div>
  `;
  
  const container = document.createElement('div');
  container.innerHTML = widgetHtml;
  document.body.appendChild(container);

  // Variables
  let aiSelectedAtletaId = null;
  const API_URL = "http://localhost:8000";

  // Elements
  const btnAssistente = document.getElementById("btnAssistenteIA");
  const sectionAi = document.getElementById("sectionAi");
  const aiBackdrop = document.getElementById("aiBackdrop");
  const aiSelectedPill = document.getElementById("aiSelectedPill");
  const aiDomanda = document.getElementById("aiDomanda");
  const aiBtnClose = document.getElementById("aiBtnClose");
  const aiBtnInvia = document.getElementById("aiBtnInvia");
  const historyBox = document.getElementById("aiHistory");
  const loadingBox = document.getElementById("aiLoading");

  // Event Listeners
  btnAssistente.addEventListener("click", () => {
    sectionAi.classList.toggle("open");
    aiBackdrop.classList.toggle("open");
    if (sectionAi.classList.contains("open")) {
      aiDomanda.focus();
    }
  });

  const closePanel = () => {
    sectionAi.classList.remove("open");
    aiBackdrop.classList.remove("open");
  };

  aiBackdrop.addEventListener("click", closePanel);
  aiBtnClose.addEventListener("click", closePanel);

  // Initialize context from URL
  const initContext = () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("atleta");
    const nome = params.get("nome");
    const cognome = params.get("cognome");

    if (id) {
      aiSelectedAtletaId = Number(id);
      aiSelectedPill.textContent = `${nome || ""} ${cognome || ""}`.trim() || `Atleta #${id}`;
      aiSelectedPill.classList.add("active");
    } else {
      aiSelectedAtletaId = null;
      aiSelectedPill.textContent = "Nessun atleta selezionato";
      aiSelectedPill.classList.remove("active");
    }
  };

  // Expose function globally so Dashboard.js can set the context dynamically when clicking "Assistente IA" on a specific row
  window.aiWidgetSelezionaAtleta = (atleta) => {
    aiSelectedAtletaId = atleta.IDatleta;
    aiSelectedPill.textContent = `${atleta.nome} ${atleta.cognome}`;
    aiSelectedPill.classList.add("active");
    
    sectionAi.classList.add("open");
    aiBackdrop.classList.add("open");
    
    // Non azzeriamo più la cronologia per mantenere il flusso
    aiDomanda.focus();
  };

  // Send Logic
  const inviaDomanda = async () => {
    const domanda = aiDomanda.value.trim();
    if (!domanda) return;

    // Aggiungi bubble utente
    const userBubble = document.createElement("div");
    userBubble.className = "ai-bubble user-bubble";
    userBubble.textContent = domanda;
    historyBox.appendChild(userBubble);
    historyBox.scrollTop = historyBox.scrollHeight;

    aiDomanda.value = "";
    loadingBox.classList.add("show");

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_URL}/ai_assistant/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          domanda,
          id_atleta: aiSelectedAtletaId,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        showError(body.detail || "Errore durante la richiesta all'agente.");
        return;
      }

      const data = await res.json();
      const aiBubble = document.createElement("div");
      aiBubble.className = "ai-bubble ai-bubble-response";
      aiBubble.textContent = data.risposta || "Nessuna risposta ricevuta.";
      
      if (data.provider && data.model) {
        const debugInfo = document.createElement("div");
        debugInfo.className = "ai-debug-info";
        debugInfo.textContent = `⚡ Generato da: ${data.model} (tramite ${data.provider}) - Task: ${data.task || "generale"}`;
        aiBubble.appendChild(debugInfo);
      }
      
      historyBox.appendChild(aiBubble);
      historyBox.scrollTop = historyBox.scrollHeight;

    } catch (err) {
      showError("Impossibile contattare il server.");
    } finally {
      loadingBox.classList.remove("show");
    }
  };

  const showError = (msg) => {
    const errBubble = document.createElement("div");
    errBubble.className = "ai-bubble ai-bubble-response";
    errBubble.style.borderColor = "#c0392b";
    errBubble.style.color = "#e74c3c";
    errBubble.textContent = msg;
    historyBox.appendChild(errBubble);
    historyBox.scrollTop = historyBox.scrollHeight;
  };

  aiBtnInvia.addEventListener("click", inviaDomanda);

  aiDomanda.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      inviaDomanda();
    }
  });

  // Run init
  initContext();

})();
