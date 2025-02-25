document.addEventListener("DOMContentLoaded", function () {
  // Controlla se la partita è in corso
  if (localStorage.getItem("gameInProgress") === "true") {
    window.location.href = "match.html"; // Se la partita è in corso, vai direttamente alla pagina match
  }
});

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

  // Verifica che i campi obbligatori siano compilati
  if (!nameMatch || !nameP1 || !nameP2 || !setCount) {
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
    })
  );

  // Imposta che la partita è iniziata
  localStorage.setItem("gameInProgress", "true");
  localStorage.removeItem("matchFinished");

  // Reindirizza alla pagina match.html
  window.location.href = "match.html";
});
