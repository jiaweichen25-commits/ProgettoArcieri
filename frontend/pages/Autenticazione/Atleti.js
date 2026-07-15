const API_URL = "http://localhost:8000";
const PORTALE = "atleta";
const AREA_ATLETA = "../AreaAtleta/Dashboard.html";

function showMsg(testo, tipo) {
    const box = document.getElementById("msgBox");
    if(box) {
        box.textContent = testo;
        box.className = "msg-box " + tipo;
    }
}

function showChangePwdMsg(testo, tipo) {
    const box = document.getElementById("changePwdMsgBox");
    if(box) {
        box.textContent = testo;
        box.className = "msg-box " + tipo;
    }
}

function parseToken(token) {
    return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
}

function redirectByRuolo(token) {
    try {
        const payload = parseToken(token);
        if (payload.ruolo !== "atleta") {
            localStorage.removeItem("access_token");
            localStorage.removeItem("currentUser");
            showMsg("Questo accesso è riservato agli atleti.", "error");
            return;
        }
        const currentUser = { role: payload.ruolo, email: payload.sub };
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        window.location.href = AREA_ATLETA;
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
            body:    JSON.stringify({ email, password, portale: PORTALE })
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

        if (data.must_change_password) {
            // Mostra modale cambio password
            document.getElementById("changePwdMsgBox").className = "msg-box";
            document.getElementById("newPassword").value = "";
            document.getElementById("changePasswordModal").classList.add("open");
        } else {
            redirectByRuolo(data.access_token);
        }

    } catch {
        showMsg("Impossibile contattare il server. Verifica che il backend sia avviato.", "error");
    } finally {
        btn.disabled    = false;
        btn.textContent = "Accedi";
    }
}

async function handleChangePassword() {
    const newPassword = document.getElementById("newPassword").value;
    const oldPassword = document.getElementById("loginPassword").value;
    const btn = document.getElementById("changePwdBtn");
    
    if (newPassword.length < 6) {
        showChangePwdMsg("La password deve essere di almeno 6 caratteri.", "error");
        return;
    }

    btn.disabled = true;
    btn.textContent = "Salvataggio...";

    try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${API_URL}/auth/change-password`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ 
                old_password: oldPassword, 
                new_password: newPassword 
            })
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            showChangePwdMsg(err.detail || "Errore nel cambio password.", "error");
            return;
        }

        document.getElementById("changePasswordModal").classList.remove("open");
        
        // Rifacciamo il login
        const email = document.getElementById("loginEmail").value.trim();
        document.getElementById("loginPassword").value = newPassword;
        await handleLogin({preventDefault: () => {}});

    } catch (e) {
        showChangePwdMsg("Errore di connessione al server.", "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "Salva Nuova Password";
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
            const payload = parseToken(token);
            if (payload.ruolo === "atleta") redirectByRuolo(token);
        } catch { /* token invalido, resta sulla login */ }
    }
});
