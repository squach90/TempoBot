import fetch from "node-fetch";
import cron from "node-cron";
import http from "http";
const ntfyTopic = "temposquach";

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
    console.log(`Aujourd'hui (${formattedDate}) Tempo EDF: ${tempoDay}`);
    // Envoi de la notification via ntfy.sh
    const ntfyResponse = await fetch(`https://ntfy.sh/${ntfyTopic}`, {
      method: "POST",
      headers: {
        // "Content-Type": "text/plain",
        Markdown: "yes",
      },
      body: `Aujourd'hui (${formattedDate}): ${tempoDay}`,
    });
    if (!ntfyResponse.ok) {
      throw new Error("Erreur lors de l'envoi de la notification");
    }
    // Envoyer la notification (ajoutez votre logique d'envoi ici)
    console.log(`Notification envoyée pour le ${formattedDate}: ${tempoDay}`);
  } catch (error) {
    console.error("Erreur lors de la récupération des données Tempo:", error);
  }
}

async function getTomorrow() {
  try {
    // Appel à l'API pour récupérer le jour Tempo de demain
    const response = await fetch(tempoAPItomorrow, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des données Tempo");
    }

    const tempoData = await response.json();
    console.log("Données Tempo reçues:", tempoData); // Ajout de log pour vérifier les données reçues
    let tempoDay = tempoData.codeJour; // Supposons que la réponse contient un champ 'codeJour'
    const today = new Date();

    // Calculer la date de demain
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    let day = tomorrow.getDate();
    let month = tomorrow.getMonth() + 1; // Les mois sont indexés à partir de 0
    let year = tomorrow.getFullYear();

    day = day < 10 ? "0" + day : day;
    month = month < 10 ? "0" + month : month;

    // Format the date as dd/mm/yyyy
    const formattedDate = `${day}/${month}/${year}`;
    console.log(`Demain est le ${formattedDate}`);

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
    console.log(`Demain (${formattedDate}): ${tempoDay}`);
    // Envoi de la notification via ntfy.sh
    const ntfyResponse = await fetch(`https://ntfy.sh/${ntfyTopic}`, {
      method: "POST",
      headers: {
        // "Content-Type": "text/plain",
        Markdown: "yes",
      },
      body: `Demain (${formattedDate}): ${tempoDay}`,
    });
    if (!ntfyResponse.ok) {
      throw new Error("Erreur lors de l'envoi de la notification");
    }
    // Envoyer la notification (ajoutez votre logique d'envoi ici)
    console.log(`Notification envoyée pour le ${formattedDate}: ${tempoDay}`);
  } catch (error) {
    console.error("Erreur:", error);
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

// Créer un serveur HTTP pour écouter sur le port spécifié par Render
const port = process.env.PORT || 3000;
http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Bot is running\n");
  })
  .listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });

// Ping le serveur toutes les 10 minutes pour le garder actif
setInterval(keepAlive, 600000);

// Planifier la tâche pour récupérer et notifier les données Tempo tous les jours à 6h00
console.log(new Date().toLocaleString());

cron.schedule("30 6 * * *", () => {
  // -1h car serveur -> different timezone
  console.log("Exécution de getTempoAndNotify à", new Date().toLocaleString());
  getTempoAndNotify();
});

cron.schedule("30 6 * * *", () => {
  // -1h car serveur -> different timezone
  console.log("Exécution de getTomorrow à", new Date().toLocaleString());
  getTomorrow();
});
