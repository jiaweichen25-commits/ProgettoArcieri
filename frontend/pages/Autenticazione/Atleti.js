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

// ══════════════════════════════════════════════
// Recupero Password
// ══════════════════════════════════════════════

function showForgotMsg(testo, tipo) {
    const box = document.getElementById("forgotMsgBox");
    if (box) {
        box.textContent = testo;
        box.className = "msg-box " + tipo;
    }
}

function openForgotPasswordModal() {
    const modal = document.getElementById("forgotPasswordModal");
    const loginInput = document.getElementById("loginEmail").value.trim();
    if (loginInput.includes("@")) {
        document.getElementById("forgotEmail").value = loginInput;
    }
    document.getElementById("forgotStep1").style.display = "block";
    document.getElementById("forgotStep2").style.display = "none";
    document.getElementById("forgotModalDesc").textContent = "Inserisci la tua email per ricevere un codice di verifica a 6 cifre.";
    const box = document.getElementById("forgotMsgBox");
    if (box) box.className = "msg-box";
    modal.classList.add("open");
}

function closeForgotPasswordModal() {
    document.getElementById("forgotPasswordModal").classList.remove("open");
}

async function handleSendResetCode() {
    const email = document.getElementById("forgotEmail").value.trim();
    if (!email) {
        showForgotMsg("Inserisci l'indirizzo email", "error");
        return;
    }

    const btn = document.getElementById("btnSendResetCode");
    btn.disabled = true;
    btn.textContent = "Invio in corso...";

    try {
        const res = await fetch(`${API_URL}/auth/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            showForgotMsg(data.detail || "Errore durante la richiesta di recupero.", "error");
            return;
        }

        showForgotMsg("Se l'email è registrata, abbiamo inviato il codice a 6 cifre.", "success");
        document.getElementById("forgotStep1").style.display = "none";
        document.getElementById("forgotStep2").style.display = "block";
        document.getElementById("forgotModalDesc").textContent = "Inserisci il codice ricevuto e la tua nuova password.";
        document.getElementById("resetCode").focus();

    } catch (err) {
        showForgotMsg("Errore di connessione al server.", "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "Invia Codice";
    }
}

async function handleResetPassword() {
    const email = document.getElementById("forgotEmail").value.trim();
    const code = document.getElementById("resetCode").value.trim();
    const new_password = document.getElementById("resetNewPassword").value;
    const confirm_password = document.getElementById("resetConfirmPassword").value;

    if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
        showForgotMsg("Inserisci il codice numerico a 6 cifre", "error");
        return;
    }

    if (!new_password || new_password.length < 6) {
        showForgotMsg("La password deve essere di almeno 6 caratteri", "error");
        return;
    }

    if (new_password !== confirm_password) {
        showForgotMsg("Le password non coincidono", "error");
        return;
    }

    const btn = document.getElementById("btnResetPassword");
    btn.disabled = true;
    btn.textContent = "Reimpostazione...";

    try {
        const res = await fetch(`${API_URL}/auth/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code, new_password })
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            showForgotMsg(data.detail || "Codice non valido o scaduto.", "error");
            return;
        }

        showForgotMsg("Password reimpostata con successo! Ora puoi accedere.", "success");
        setTimeout(() => {
            closeForgotPasswordModal();
            document.getElementById("loginEmail").value = email;
            document.getElementById("loginPassword").value = "";
            document.getElementById("loginPassword").focus();
            showMsg("Password reimpostata! Inserisci la nuova password per accedere.", "success");
        }, 1500);

    } catch (err) {
        showForgotMsg("Errore di connessione al server.", "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "Reimposta";
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
