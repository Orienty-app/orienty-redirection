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
    verifiedDiv.innerHTML = `<h1>Erreur</h1><p>${message}</p>`;
    verifiedDiv.classList.remove("hidden");
}

// 1. ÉCOUTEUR AUTH (Placé EN PREMIER pour ne rater aucun événement)
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

// 2. INITIALISATION ET TRAITEMENT DES URLS
async function initAuth() {
    // Vérification des erreurs dans le HASH (#error=...)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const errorCode = hashParams.get("error_code");

    if (errorCode) {
        const description = hashParams.get("error_description") || "Lien expiré ou invalide.";
        showError(decodeURIComponent(description).replace(/\+/g, " "));
        return;
    }

    // Traitement du code PKCE (?code=...)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
        const { error } = await supabaseClient.auth.exchangeCodeForSession(code);
        if (error) {
            showError(error.message);
            return;
        }
        loadingDiv.classList.add("hidden");
        resetPasswordDiv.classList.remove("hidden");
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
    }

    // Sécurité : masquer le loader si aucune action ni session n'est détectée
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session && !window.location.hash.includes("access_token")) {
        showError("Lien invalide ou aucune session active.");
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