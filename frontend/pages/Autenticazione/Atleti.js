const API_URL = "http://localhost:8000";

function showMsg(testo, tipo) {
    const box = document.getElementById("msgBox");
    box.textContent = testo;
    box.className = "msg-box " + tipo;
}

function showModalMsg(testo, tipo) {
    const box = document.getElementById("modalMsgBox");
    box.textContent = testo;
    box.className = "msg-box " + tipo;
}

function redirectByRuolo(token) {
    try {
        const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        const currentUser = { role: payload.ruolo, email: payload.sub };
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        const dest = payload.ruolo === "istruttore"
            ? "../Dashboard/Dashboard.html"
            : "../Dashboard/AtletaDashboard.html";
        window.location.href = dest;
    } catch (e) {
        console.error("Errore nel reindirizzamento:", e);
        showMsg("Errore nella lettura dei dati di accesso.", "error");
    }
}

async function handleLogin(e) {
    e.preventDefault();
    document.getElementById("msgBox").className = "msg-box";

    const email    = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const btn      = document.getElementById("submitBtn");

    btn.disabled    = true;
    btn.textContent = "Accesso in corso...";

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ email, password })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            showMsg(err.detail || "Credenziali non valide.", "error");
            return;
        }

        const data = await res.json();
        localStorage.setItem("access_token", data.access_token);

        if (document.getElementById("rememberLogin").checked) {
            localStorage.setItem("remember_email", email);
        } else {
            localStorage.removeItem("remember_email");
        }

        redirectByRuolo(data.access_token);

    } catch {
        showMsg("Impossibile contattare il server. Verifica che il backend sia avviato.", "error");
    } finally {
        btn.disabled    = false;
        btn.textContent = "Accedi";
    }
}

function openRegisterModal() {
    document.getElementById("regEmail").value    = "";
    document.getElementById("regPassword").value = "";
    document.getElementById("modalMsgBox").className = "msg-box";
    document.getElementById("registerModal").classList.add("open");
}

function closeRegisterModal() {
    document.getElementById("registerModal").classList.remove("open");
}

async function handleRegister() {
    const email    = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;
    const btn      = document.getElementById("regBtn");

    if (!email || !password) { showModalMsg("Compila tutti i campi.", "error"); return; }
    if (password.length < 6) { showModalMsg("Password di almeno 6 caratteri.", "error"); return; }

    btn.disabled    = true;
    btn.textContent = "Registrazione...";

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ email, password, ruolo: "atleta" })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            showModalMsg(err.detail || "Errore durante la registrazione.", "error");
            return;
        }

        const data = await res.json();
        localStorage.setItem("access_token", data.access_token);
        closeRegisterModal();
        redirectByRuolo(data.access_token);

    } catch {
        showModalMsg("Impossibile contattare il server.", "error");
    } finally {
        btn.disabled    = false;
        btn.textContent = "Registrati";
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem("remember_email");
    if (saved) {
        document.getElementById("loginEmail").value = saved;
        document.getElementById("rememberLogin").checked = true;
    }
    const token = localStorage.getItem("access_token");
    if (token) {
        try {
            const p = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
            if (p.ruolo === "atleta") redirectByRuolo(token);
        } catch {}
    }
});