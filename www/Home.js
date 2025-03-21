document.addEventListener("DOMContentLoaded", function () {
  // Controlla se la partita è in corso
  if (localStorage.getItem("gameInProgress") === "true") {
    window.location.href = "match.html"; // Se la partita è in corso, vai direttamente alla pagina match
  } else {
    document.body.classList.remove("hidden"); // Mostra il contenuto solo se l'utente rimane su index.html
  }

  // Recupera i dati salvati e li inserisce nei campi
  const savedSettings = JSON.parse(localStorage.getItem("matchSettings"));
  if (savedSettings) {
    document.getElementById("nameMatch").value = savedSettings.nameMatch || "";
    document.getElementById("nameP1").value = savedSettings.nameP1 || "";
    document.getElementById("nameP2").value = savedSettings.nameP2 || "";
    document.getElementById("game").value = savedSettings.gameCount || "";
    document.getElementById("set").value = savedSettings.setCount || "";
    document.getElementById("tieBreak").value = savedSettings.tieBreak || "";
  }
});

// Funzione per salvare i dati mentre vengono inseriti
function saveInputData() {
  const nameMatch = document
    .getElementById("nameMatch")
    .value.trim()
    .toUpperCase();
  const nameP1 = document.getElementById("nameP1").value.trim().toUpperCase();
  const nameP2 = document.getElementById("nameP2").value.trim().toUpperCase();
  const gameCount = document.getElementById("game").value;
  const setCount = document.getElementById("set").value;
  const tieBreak = document.getElementById("tieBreak").value;

  localStorage.setItem(
    "matchSettings",
    JSON.stringify({ nameMatch, nameP1, nameP2, gameCount, setCount, tieBreak })
  );
}

// Aggiunge un event listener a ogni campo per salvare i dati mentre l'utente digita
document.getElementById("nameMatch").addEventListener("input", saveInputData);
document.getElementById("nameP1").addEventListener("input", saveInputData);
document.getElementById("nameP2").addEventListener("input", saveInputData);
document.getElementById("game").addEventListener("input", saveInputData);
document.getElementById("set").addEventListener("input", saveInputData);
document.getElementById("tieBreak").addEventListener("input", saveInputData);

const startMatchButton = document.getElementById("start-match");

startMatchButton.addEventListener("click", () => {
  // Raccogli i dati inseriti dall'utente
  const nameMatch = document
    .getElementById("nameMatch")
    .value.trim()
    .toUpperCase();
  const nameP1 = document.getElementById("nameP1").value.trim().toUpperCase();
  const nameP2 = document.getElementById("nameP2").value.trim().toUpperCase();
  const gameCount = document.getElementById("game").value;
  const setCount = document.getElementById("set").value;
  const tieBreak = document.getElementById("tieBreak").value;

  // Verifica che i campi obbligatori siano compilati
  if (!nameMatch || !nameP1 || !nameP2 || !setCount || !tieBreak) {
    alert("Per favore, completa tutti i campi obbligatori.");
    return;
  }

  // Salva i dati nel localStorage
  localStorage.setItem(
    "matchSettings",
    JSON.stringify({
      nameMatch,
      nameP1,
      nameP2,
      gameCount: parseInt(gameCount, 10),
      setCount: parseInt(setCount, 10),
      tieBreak: parseInt(tieBreak, 10),
    })
  );

  // Imposta che la partita è iniziata
  localStorage.setItem("gameInProgress", "true");
  localStorage.removeItem("matchFinished");

  // Reindirizza alla pagina match.html
  window.location.href = "match.html";
});
