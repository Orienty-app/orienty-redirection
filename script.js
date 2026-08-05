// 1. Initialisation du client Supabase
const SUPABASE_URL = 'https://bofuwdgprigtucyaawcq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_T09vHKFa8fnGOJuc7oQnoQ_aGEMnSnR';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Récupération des éléments du DOM
const loadingDiv = document.getElementById('loading');
const verifiedDiv = document.getElementById('verified');
const resetPasswordDiv = document.getElementById('reset-password');
const resetSuccessDiv = document.getElementById('reset-success');
const passwordForm = document.getElementById('password-form');
const newPasswordInput = document.getElementById('new-password');
const errorMsg = document.getElementById('error-msg');

// 3. Écoute automatique des événements d'authentification
supabaseClient.auth.onAuthStateChange((event, session) => {
    // Extraction des paramètres situés après le Hash (#)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const errorCode = hashParams.get('error_code');

    // Traitement des erreurs renvoyées dans le hash (ex: otp_expired)
    if (errorCode) {
        loadingDiv.classList.add('hidden');
        const description = hashParams.get('error_description') || "Lien invalide ou expiré.";
        verifiedDiv.innerHTML = `<h1>Lien expiré</h1><p>${decodeURIComponent(description).replace(/\+/g, ' ')}</p>`;
        verifiedDiv.classList.remove('hidden');
        return;
    }

    // Gestion de la réinitialisation de mot de passe
    if (event === 'PASSWORD_RECOVERY') {
        loadingDiv.classList.add('hidden');
        resetPasswordDiv.classList.remove('hidden');
    } else if (event === 'SIGNED_IN' && session) {
        loadingDiv.classList.add('hidden');
        verifiedDiv.classList.remove('hidden');
    }
});

// 4. Soumission du nouveau mot de passe
passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.classList.add('hidden');

    const newPassword = newPasswordInput.value;
    const { error } = await supabaseClient.auth.updateUser({ password: newPassword });

    if (error) {
        errorMsg.textContent = error.message;
        errorMsg.classList.remove('hidden');
    } else {
        resetPasswordDiv.classList.add('hidden');
        resetSuccessDiv.classList.remove('hidden');
    }
});