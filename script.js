const SUPABASE_URL = 'https://bofuwdgprigtucyaawcq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_T09vHKFa8fnGOJuc7oQnoQ_aGEMnSnR';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loadingDiv = document.getElementById("loading");
const verifiedDiv = document.getElementById("verified");
const resetPasswordDiv = document.getElementById("reset-password");
const resetSuccessDiv = document.getElementById("reset-success");

const passwordForm = document.getElementById("password-form");
const newPasswordInput = document.getElementById("new-password");
const errorMsg = document.getElementById("error-msg");

function showError(message) {
    loadingDiv.classList.add("hidden");
    resetPasswordDiv.classList.add("hidden");
    verifiedDiv.innerHTML = `
        <h1>Erreur</h1>
        <p>${message}</p>
    `;
    verifiedDiv.classList.remove("hidden");
}

// 1. ÉCOUTEUR AUTHENTIFICATION
supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log("🔥 EVENT AUTH :", event);
    
    if (event === "PASSWORD_RECOVERY") {
        loadingDiv.classList.add("hidden");
        resetPasswordDiv.classList.remove("hidden");
    } else if (event === "SIGNED_IN" && session) {
        loadingDiv.classList.add("hidden");
        verifiedDiv.classList.remove("hidden");
    }
});

// 2. INITIALISATION ET VÉRIFICATION DE L'URL
async function initAuth() {
    // A. Gestion des erreurs dans le HASH (#error=...)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const errorCode = hashParams.get("error_code");

    if (errorCode) {
        const description = hashParams.get("error_description") || "Lien expiré ou invalide.";
        showError(decodeURIComponent(description).replace(/\+/g, " "));
        return;
    }

    // B. Gestion du code PKCE (?code=...)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
        const { error } = await supabaseClient.auth.exchangeCodeForSession(code);
        if (error) {
            showError("Le lien de réinitialisation est invalide ou a été ouvert sur un autre appareil. Veuillez repasser en flux 'Implicit' dans le dashboard Supabase.");
            return;
        }
    }

    // C. Vérification de la session active après redirection
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        loadingDiv.classList.add("hidden");
        if (window.location.hash.includes("type=recovery") || window.location.search.includes("type=recovery")) {
            resetPasswordDiv.classList.remove("hidden");
        }
    }
}

initAuth();

// 3. FORMULAIRE DE MOT DE PASSE
passwordForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorMsg.classList.add("hidden");
    const password = newPasswordInput.value;

    if (password.length < 6) {
        errorMsg.textContent = "Le mot de passe doit contenir au moins 6 caractères.";
        errorMsg.classList.remove("hidden");
        return;
    }

    const { error } = await supabaseClient.auth.updateUser({ password });

    if (error) {
        errorMsg.textContent = error.message;
        errorMsg.classList.remove("hidden");
        return;
    }

    resetPasswordDiv.classList.add("hidden");
    resetSuccessDiv.classList.remove("hidden");
    window.history.replaceState({}, document.title, window.location.pathname);
});