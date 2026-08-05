// 1. Initialisation du client Supabase
const SUPABASE_URL = 'https://bofuwdgprigtucyaawcq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_T09vHKFa8fnGOJuc7oQnoQ_aGEMnSnR';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Éléments du DOM
const loadingDiv = document.getElementById('loading');
const verifiedDiv = document.getElementById('verified');
const resetPasswordDiv = document.getElementById('reset-password');
const resetSuccessDiv = document.getElementById('reset-success');
const passwordForm = document.getElementById('password-form');
const newPasswordInput = document.getElementById('new-password');
const errorMsg = document.getElementById('error-msg');

// 3. Traitement de la redirection et vérification du lien
async function handleAuth() {
    // Lecture des paramètres depuis l'URL (?) ou le Hash (#)
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    const errorCode = searchParams.get('error_code') || hashParams.get('error_code');

    // Gestion du lien expiré
    if (errorCode === 'otp_expired') {
        loadingDiv.classList.add('hidden');
        verifiedDiv.innerHTML = "<h1>Lien expiré</h1><p>Ce lien de réinitialisation a expiré. Demande un nouveau lien depuis l'application.</p>";
        verifiedDiv.classList.remove('hidden');
        return;
    }

    // Récupération de la session créée automatiquement par le SDK via le hash
    const { data, error } = await supabaseClient.auth.getSession();
    const type = hashParams.get('type') || searchParams.get('type');

    loadingDiv.classList.add('hidden');

    if (type === 'recovery' && data.session) {
        resetPasswordDiv.classList.remove('hidden');
    } else if (type === 'signup' || type === 'invite' || type === 'email_change') {
        verifiedDiv.classList.remove('hidden');
    } else if (data.session) {
        verifiedDiv.classList.remove('hidden');
    } else {
        verifiedDiv.innerHTML = "<h1>Lien invalide</h1><p>Ce lien n'est pas valide ou a expiré. Essaie de te reconnecter depuis l'app.</p>";
        verifiedDiv.classList.remove('hidden');
    }
}

// 4. Traitement de la mise à jour du mot de passe
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

// 5. Exécution automatique au chargement du DOM
document.addEventListener('DOMContentLoaded', handleAuth);