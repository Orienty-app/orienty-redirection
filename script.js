// Récupération depuis window.config
const supabase = supabase.createClient(
    window.config.SUPABASE_URL, 
    window.config.SUPABASE_ANON_KEY
);

const loadingDiv = document.getElementById('loading');
const verifiedDiv = document.getElementById('verified');
const resetPasswordDiv = document.getElementById('reset-password');
const resetSuccessDiv = document.getElementById('reset-success');
const errorMsg = document.getElementById('error-msg');

async function handleAuth() {
    // Supabase met le token dans le hash de l'URL (#access_token=...)
    // La librairie supabase-js gère cela automatiquement lors de l'initialisation de la session
    
    const { data: { session }, error } = await supabase.auth.getSession();

    // On regarde aussi le hash manuellement pour détecter le type d'événement si besoin
    const hash = window.location.hash;
    const type = new URLSearchParams(hash.substring(1)).get('type'); 
    // type peut être 'recovery', 'signup', 'invite'

    loadingDiv.classList.add('hidden');

    if (type === 'recovery') {
        // C'est un reset de mot de passe
        resetPasswordDiv.classList.remove('hidden');
    } else if (type === 'signup' || type === 'invite') {
        // C'est une confirmation d'email
        verifiedDiv.classList.remove('hidden');
    } else if (session) {
        // Si on a une session mais pas de type explicite, on suppose une connexion réussie
        verifiedDiv.classList.remove('hidden');
    } else {
        // Cas par défaut ou erreur
        verifiedDiv.innerHTML = "<h1>Lien expiré ou invalide</h1><p>Essaie de te reconnecter depuis l'app.</p>";
        verifiedDiv.classList.remove('hidden');
    }
}

// Gestionnaire du formulaire de changement de mot de passe
document.getElementById('password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById('new-password').value;
    const btn = e.target.querySelector('button');
    
    btn.textContent = 'Mise à jour...';
    btn.disabled = true;

    const { data, error } = await supabase.auth.updateUser({
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

// Lancer la logique au chargement
handleAuth();