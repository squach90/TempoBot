import fetch from "node-fetch";

// Nom du topic ntfy.sh
const ntfyTopic = "temposquach"; // Remplace par ton topic

// URL de l'API de couleur Tempo d'EDF
const tempoAPI = "https://www.api-couleur-tempo.fr/api/jourTempo/today";

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

    // Envoi de la notification via ntfy.sh
    const ntfyResponse = await fetch(`https://ntfy.sh/${ntfyTopic}`, {
      method: "POST",
      headers: {
        // "Content-Type": "text/plain",
        Markdown: "yes",
      },
      body: `${formattedDate} Tempo EDF: ${tempoDay}`,
    });

    if (!ntfyResponse.ok) {
      throw new Error("Erreur lors de l'envoi de la notification");
    }

    console.log("Notification envoyée avec succès !");
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Lancer la fonction
getTempoAndNotify();
