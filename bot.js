import fetch from "node-fetch";
import cron from "node-cron";

// URL de l'API de couleur Tempo d'EDF
const tempoAPI = "https://www.api-couleur-tempo.fr/api/jourTempo/today";
const tempoAPItomorrow =
  "https://www.api-couleur-tempo.fr/api/jourTempo/tomorrow";

const serverURL = "https://tempobot.onrender.com"; // Remplace par l'URL de ton serveur

async function getTempoAndNotify() {
  try {
    // Appel à l'API pour récupérer le jour Tempo de demain
    const response = await fetch(tempoAPI, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des données Tempo");
    }

    // Récupérer la réponse JSON
    const tempoData = await response.json();
    console.log("Données Tempo reçues:", tempoData); // Ajout de log pour vérifier les données reçues
    let tempoDay = tempoData.codeJour; // Supposons que la réponse contient un champ 'codeJour'
    const today = new Date();

    let day = today.getDate();
    let month = today.getMonth() + 1;
    let year = today.getFullYear();

    day = day < 10 ? "0" + day : day;
    month = month < 10 ? "0" + month : month;

    // Format the date as dd/mm/yyyy
    const formattedDate = `${day}/${month}/${year}`;

    if (!tempoDay) {
      throw new Error("Erreur lors de la récupération du jour Tempo");
    }

    if (tempoDay == "2") {
      tempoDay = "⚪️ Blanc";
    } else if (tempoDay == "1") {
      tempoDay = "🔵 Bleu";
    } else if (tempoDay == "3") {
      tempoDay = "🔴 Rouge";
    }
    console.log(`${formattedDate} Tempo EDF: ${tempoDay}`);
  } catch (error) {
    console.error("Erreur lors de la récupération des données Tempo:", error);
  }
}

// Fonction pour garder le bot actif
async function keepAlive() {
  try {
    const response = await fetch(serverURL, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Erreur lors du ping du serveur");
    }

    console.log("Ping réussi:", new Date().toLocaleTimeString());
  } catch (error) {
    console.error("Erreur lors du ping du serveur:", error);
  }
}

// Ping le serveur toutes les 10 minutes pour le garder actif
setInterval(keepAlive, 600000);

console.log(new Date().toLocaleString());

cron.schedule("0 6 * * *", () => {
  // -1h car serveur -> different timezone
  console.log("Exécution de getTomorrow à", new Date().toLocaleString());
  getTomorrow();
});

cron.schedule("0 6 * * *", () => {
  // -1h car serveur -> different timezone
  console.log("Exécution de getTempoAndNotify à", new Date().toLocaleString());
  getTempoAndNotify();
});
