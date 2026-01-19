// Configuration du client
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
    // 1. IMPORTANT : On récupère le hash TOUT DE SUITE, avant que Supabase ne le nettoie
    const hash = window.location.hash;
    
    // On nettoie le hash pour enlever le '#' initial, et parfois un '/' qui traîne
    const cleanHash = hash.replace(/^#\/?/, ''); 
    const params = new URLSearchParams(cleanHash);
    const type = params.get('type'); 
    
    console.log("Type détecté:", type); // Pour le debug

    // 2. Ensuite on laisse Supabase gérer la session
    const { data: { session }, error } = await supabaseClient.auth.getSession();

    loadingDiv.classList.add('hidden');

    // 3. Logique d'affichage
    if (type === 'recovery') {
        // C'est un reset de mot de passe
        resetPasswordDiv.classList.remove('hidden');
    } else if (type === 'signup' || type === 'invite') {
        // C'est une confirmation d'email
        verifiedDiv.classList.remove('hidden');
    } else if (session) {
        // Si on a une session mais pas de type explicite (et ce n'est pas un recovery raté)
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

// Lancer la logique au chargement
handleAuth();