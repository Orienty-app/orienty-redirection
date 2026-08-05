// ======================================================
// 1. Initialisation Supabase
// ======================================================

const SUPABASE_URL = 'https://bofuwdgprigtucyaawcq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_T09vHKFa8fnGOJuc7oQnoQ_aGEMnSnR';

console.log("🚀 Initialisation Supabase...");

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

console.log("✅ Client Supabase créé");


// ======================================================
// 2. Récupération DOM
// ======================================================

const loadingDiv = document.getElementById("loading");
const verifiedDiv = document.getElementById("verified");
const resetPasswordDiv = document.getElementById("reset-password");
const resetSuccessDiv = document.getElementById("reset-success");

const passwordForm = document.getElementById("password-form");
const newPasswordInput = document.getElementById("new-password");
const errorMsg = document.getElementById("error-msg");

console.log("📄 DOM chargé");


// ======================================================
// 3. Analyse du hash URL
// ======================================================

function checkUrlHash() {

    console.log("🔎 Analyse du hash URL...");
    console.log("HASH :", window.location.hash);


    const hash = window.location.hash.substring(1);

    if (!hash) {
        console.log("ℹ️ Aucun hash trouvé");
        return null;
    }


    const params = new URLSearchParams(hash);

    const data = {
        error: params.get("error"),
        errorCode: params.get("error_code"),
        errorDescription: params.get("error_description"),
        accessToken: params.get("access_token"),
        refreshToken: params.get("refresh_token"),
        type: params.get("type")
    };


    console.log("📦 Données hash :", data);

    return data;
}


// ======================================================
// 4. Gestion des erreurs URL
// ======================================================

function displayError(message) {

    console.error("❌ Erreur :", message);


    loadingDiv.classList.add("hidden");


    verifiedDiv.innerHTML = `
        <h1>Lien invalide</h1>
        <p>${message}</p>
    `;


    verifiedDiv.classList.remove("hidden");
}


// ======================================================
// 5. Initialisation Auth
// ======================================================

async function initAuth() {

    console.log("🔐 Démarrage Auth...");


    const hashData = checkUrlHash();


    // Gestion erreurs venant de Supabase
    if(hashData && hashData.errorCode) {

        displayError(
            decodeURIComponent(
                hashData.errorDescription ||
                "Le lien est expiré ou invalide."
            ).replace(/\+/g, " ")
        );

        return;
    }



    console.log("⏳ Récupération session actuelle...");


    const {
        data,
        error
    } = await supabaseClient.auth.getSession();


    console.log("SESSION :", data.session);
    console.log("SESSION ERROR :", error);



    if(error) {

        displayError(error.message);
        return;

    }



    // Ecoute événements Supabase

    supabaseClient.auth.onAuthStateChange(
        async (event, session) => {


            console.log("==========================");
            console.log("🔥 AUTH EVENT :", event);
            console.log("👤 SESSION :", session);
            console.log("==========================");



            switch(event) {


                case "PASSWORD_RECOVERY":

                    console.log(
                        "🔑 Mode récupération mot de passe détecté"
                    );


                    loadingDiv.classList.add("hidden");

                    resetPasswordDiv
                        .classList
                        .remove("hidden");


                    break;



                case "SIGNED_IN":


                    console.log(
                        "✅ Utilisateur connecté"
                    );


                    loadingDiv.classList.add("hidden");


                    verifiedDiv
                        .classList
                        .remove("hidden");


                    break;



                case "INITIAL_SESSION":


                    console.log(
                        "ℹ️ Session initiale chargée"
                    );


                    break;



                default:

                    console.log(
                        "ℹ️ Event non géré :",
                        event
                    );

            }

        }
    );



    console.log("👂 Listener Auth activé");

}



initAuth();



// ======================================================
// 6. Changement du mot de passe
// ======================================================


passwordForm.addEventListener(
    "submit",
    async (e)=>{


        e.preventDefault();


        console.log(
            "📝 Envoi nouveau mot de passe..."
        );


        errorMsg.classList.add("hidden");



        const password =
            newPasswordInput.value;



        if(password.length < 6){

            errorMsg.textContent =
                "Le mot de passe doit contenir au moins 6 caractères.";

            errorMsg.classList.remove("hidden");

            return;
        }



        console.log(
            "🔄 Appel updateUser()"
        );



        const {
            data,
            error
        } =
        await supabaseClient.auth.updateUser({
            password
        });



        console.log(
            "UPDATE RESULT :",
            data
        );


        console.log(
            "UPDATE ERROR :",
            error
        );



        if(error){


            errorMsg.textContent =
                error.message;


            errorMsg
                .classList
                .remove("hidden");


            return;

        }



        console.log(
            "🎉 Mot de passe changé avec succès"
        );



        resetPasswordDiv
            .classList
            .add("hidden");


        resetSuccessDiv
            .classList
            .remove("hidden");



        // Nettoyage URL
        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );


    }
);