// Initialisation du client Supabase
const supabaseClient = supabase.createClient(
    "https://bofuwdgprigtucyaawcq.supabase.co",
    "sb_publishable_T09vHKFa8fnGOJuc7oQnoQ_aGEMnSnR"
);

const loadingDiv = document.getElementById('loading');
const verifiedDiv = document.getElementById('verified');
const resetPasswordDiv = document.getElementById('reset-password');
const resetSuccessDiv = document.getElementById('reset-success');
const errorMsg = document.getElementById('error-msg');

async function handleAuth() {
    // 1. Récupération de la session
    const { data: { session }, error } = await supabaseClient.auth.getSession();

    // 2. Extraction robuste du type d'événement
    // On nettoie le hash pour enlever le '#' et l'éventuel '/' au début (ex: #/access_token...)
    const cleanHash = window.location.hash.replace(/^#\/?/, '');
    const hashParams = new URLSearchParams(cleanHash);
    const queryParams = new URLSearchParams(window.location.search);

    // On cherche 'type' dans le hash EN PREMIER, sinon dans l'URL classique
    const type = hashParams.get('type') || queryParams.get('type');

    // Logs pour le débogage (fais F12 pour voir si 'type' est bien détecté)
    console.log("Hash nettoyé:", cleanHash);
    console.log("Type détecté:", type);
    console.log("Session active:", !!session);

    loadingDiv.classList.add('hidden');

    // 3. Logique d'affichage
    if (type === 'recovery') {
        // Cas : Réinitialisation de mot de passe
        resetPasswordDiv.classList.remove('hidden');
    } else if (type === 'signup' || type === 'invite') {
        // Cas : Confirmation d'email
        verifiedDiv.classList.remove('hidden');
    } else if (session) {
        // Cas : Connecté mais pas de type 'recovery' détecté
        // ATTENTION : Si le lien de recovery perd le paramètre 'type', on peut tomber ici par erreur.
        // Mais avec la correction ci-dessus, cela ne devrait plus arriver.
        verifiedDiv.classList.remove('hidden');
    } else {
        // Cas : Lien invalide ou expiré
        verifiedDiv.innerHTML = "<h1>Lien expiré ou invalide</h1><p>Essaie de te reconnecter depuis l'app.</p>";
        verifiedDiv.classList.remove('hidden');
    }
}

// Gestion du formulaire de nouveau mot de passe
document.getElementById('password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById('new-password').value;
    const btn = e.target.querySelector('button');
    
    btn.textContent = 'Mise à jour...';
    btn.disabled = true;

    const { data, error } = await supabaseClient.auth.updateUser({
        password: newPassword
    });

    if (error) {
        errorMsg.textContent = error.message;
        errorMsg.classList.remove('hidden');
        btn.textContent = 'Mettre à jour';
        btn.disabled = false;
    } else {
        resetPasswordDiv.classList.add('hidden');
        resetSuccessDiv.classList.remove('hidden');
    }
});

// Lancement
handleAuth();