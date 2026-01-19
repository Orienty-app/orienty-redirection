async function handleAuth() {
    // 1. Vérifier d'abord les paramètres d'erreur
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const errorCode = hashParams.get('error_code');
    
    if (errorCode === 'otp_expired') {
        loadingDiv.classList.add('hidden');
        verifiedDiv.innerHTML = "<h1>Lien expiré</h1><p>Ce lien de réinitialisation a expiré. Demande un nouveau lien depuis l'application.</p>";
        verifiedDiv.classList.remove('hidden');
        return;
    }

    // 2. Laisser Supabase gérer le hash automatiquement
    const { data, error } = await supabaseClient.auth.getSession();

    // 3. Vérifier le type d'événement depuis le hash
    const type = hashParams.get('type');
    
    console.log("Type détecté:", type);
    console.log("Session active:", !!data.session);
    console.log("Hash complet:", window.location.hash);

    loadingDiv.classList.add('hidden');

    // 4. Logique d'affichage
    if (type === 'recovery' && data.session) {
        // Cas : Réinitialisation de mot de passe
        resetPasswordDiv.classList.remove('hidden');
    } else if (type === 'signup' || type === 'invite' || type === 'email_change') {
        // Cas : Confirmation d'email
        verifiedDiv.classList.remove('hidden');
    } else if (data.session && !type) {
        // Session active mais sans type spécifique
        verifiedDiv.classList.remove('hidden');
    } else {
        // Cas : Lien invalide ou expiré
        verifiedDiv.innerHTML = "<h1>Lien invalide</h1><p>Ce lien n'est pas valide ou a expiré. Essaie de te reconnecter depuis l'app.</p>";
        verifiedDiv.classList.remove('hidden');
    }
}