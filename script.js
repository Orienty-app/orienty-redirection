// ======================================================
// 1. Initialisation Supabase
// ======================================================

const SUPABASE_URL = 'https://bofuwdgprigtucyaawcq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_T09vHKFa8fnGOJuc7oQnoQ_aGEMnSnR';


console.log("🚀 Démarrage application");


const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


console.log("✅ Client Supabase initialisé");



// ======================================================
// ELEMENTS HTML
// ======================================================

const loadingDiv = document.getElementById("loading");
const verifiedDiv = document.getElementById("verified");
const resetPasswordDiv = document.getElementById("reset-password");
const resetSuccessDiv = document.getElementById("reset-success");

const passwordForm = document.getElementById("password-form");
const newPasswordInput = document.getElementById("new-password");
const errorMsg = document.getElementById("error-msg");


console.log("📄 Elements HTML récupérés");



// ======================================================
// AFFICHAGE ERREUR
// ======================================================

function showError(message) {

    console.error("❌ ERREUR :", message);


    loadingDiv.classList.add("hidden");


    verifiedDiv.innerHTML = `
        <h1>Erreur</h1>
        <p>${message}</p>
    `;


    verifiedDiv.classList.remove("hidden");
}



// ======================================================
// ANALYSE URL
// ======================================================

function debugUrl(){

    console.log("==============================");
    console.log("🌍 URL actuelle");
    console.log(window.location.href);


    console.log("SEARCH :");
    console.log(window.location.search);


    console.log("HASH :");
    console.log(window.location.hash);


    console.log("==============================");

}


debugUrl();



// ======================================================
// INITIALISATION AUTH SUPABASE
// ======================================================

async function initAuth(){


    console.log("🔐 Initialisation Auth");



    // --------------------------------------------------
    // 1) Gestion PKCE (?code=xxxx)
    // --------------------------------------------------

    const params = new URLSearchParams(
        window.location.search
    );


    const code = params.get("code");


    console.log("🔎 Code PKCE détecté :", code);



    if(code){


        console.log(
            "🔄 Echange du code contre une session..."
        );



        const {
            data,
            error
        } = await supabaseClient.auth.exchangeCodeForSession(
            code
        );



        console.log(
            "📦 Résultat échange session :",
            data
        );


        console.log(
            "⚠️ Erreur échange session :",
            error
        );



        if(error){

            showError(error.message);
            return;

        }



        console.log(
            "✅ Session créée avec succès"
        );



        loadingDiv.classList.add("hidden");


        resetPasswordDiv.classList.remove("hidden");



        // Nettoyage URL

        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );


    }



    // --------------------------------------------------
    // 2) Gestion ancien système HASH
    // --------------------------------------------------


    const hashParams =
        new URLSearchParams(
            window.location.hash.substring(1)
        );



    const hashObject =
        Object.fromEntries(hashParams);



    console.log(
        "🔎 Hash Supabase :",
        hashObject
    );



    const errorCode =
        hashParams.get("error_code");



    if(errorCode){


        const description =
            hashParams.get("error_description")
            ||
            "Lien expiré ou invalide.";



        showError(
            decodeURIComponent(description)
            .replace(/\+/g," ")
        );


        return;

    }



    // --------------------------------------------------
    // 3) Session existante
    // --------------------------------------------------


    const {
        data:sessionData,
        error:sessionError
    }
    =
    await supabaseClient.auth.getSession();



    console.log(
        "👤 Session actuelle :",
        sessionData.session
    );


    console.log(
        "⚠️ Erreur session :",
        sessionError
    );



    // --------------------------------------------------
    // 4) Listener Auth
    // --------------------------------------------------


    supabaseClient.auth.onAuthStateChange(
        (event, session)=>{


            console.log("==============================");
            console.log("🔥 EVENT AUTH :", event);
            console.log("👤 SESSION :", session);
            console.log("==============================");



            if(event === "PASSWORD_RECOVERY"){


                console.log(
                    "🔑 Mode récupération détecté"
                );



                loadingDiv.classList.add("hidden");


                resetPasswordDiv.classList.remove("hidden");

            }



            if(
                event === "SIGNED_IN"
                &&
                session
            ){


                console.log(
                    "✅ Utilisateur connecté"
                );



                loadingDiv.classList.add("hidden");


                verifiedDiv.classList.remove("hidden");

            }



        }
    );



    console.log(
        "👂 Listener Supabase actif"
    );


}



initAuth();




// ======================================================
// CHANGEMENT MOT DE PASSE
// ======================================================

passwordForm.addEventListener(
    "submit",
    async(event)=>{


        event.preventDefault();



        console.log(
            "📝 Tentative changement mot de passe"
        );



        errorMsg.classList.add("hidden");



        const password =
            newPasswordInput.value;



        console.log(
            "🔐 Taille mot de passe :",
            password.length
        );



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
        }
        =
        await supabaseClient.auth.updateUser({

            password: password

        });



        console.log(
            "📦 Réponse updateUser :",
            data
        );


        console.log(
            "⚠️ Erreur updateUser :",
            error
        );




        if(error){


            errorMsg.textContent =
                error.message;


            errorMsg.classList.remove("hidden");


            return;

        }




        console.log(
            "🎉 Mot de passe modifié avec succès"
        );



        resetPasswordDiv.classList.add("hidden");


        resetSuccessDiv.classList.remove("hidden");



        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );


    }
);