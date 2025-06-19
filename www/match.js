firebase.initializeApp(window.firebaseConfig);

const matchId = localStorage.getItem("currentMatchId");
if (matchId) {
  const matchIdElement = document.getElementById("match-id");
  if (matchIdElement) {
    matchIdElement.textContent = `ID Partita: ${matchId}`;
  }
}

// Recupera il colore dal localStorage
const coloreSalvato = localStorage.getItem("campoColor");

// Se c'è un colore salvato, applicalo al campo
if (coloreSalvato) {
  document.getElementById("sezione-punti").style.backgroundColor =
    coloreSalvato;
}

function restoreButtonStates() {
  const savedState = JSON.parse(localStorage.getItem("buttonStates"));
  if (savedState) {
    const { buttons, sezionePuntiHeight } = savedState;

    // Ripristina lo stato dei bottoni
    buttons.forEach((state) => {
      const button = document.querySelector(`.${state.selector}`);
      if (button) {
        button.style.display = state.display;
        button.style.top = state.top;
      }
    });

    // Ripristina la height della sezione punti
    const sezionePunti = document.querySelector("#sezione-punti");
    if (sezionePunti) {
      sezionePunti.style.height = sezionePuntiHeight;
    }
  }
}
// Funzione per verificare l'orientamento dello schermo
function isLandscape() {
  return window.innerWidth > window.innerHeight;
}

// Modifica la funzione handleGameMode per gestire l'orientamento
function handleGameMode() {
  const matchSettings = JSON.parse(localStorage.getItem("matchSettings"));
  if (matchSettings) {
    const modalitaGioco = matchSettings.modalitaGioco;

    // Nascondi tutti i pulsanti solo se necessario
    if (modalitaGioco) {
      document.querySelectorAll(".sezione-punti button").forEach((button) => {
        button.style.display = "none";
      });

      // Mostra i pulsanti in base alla modalità di gioco
      if (modalitaGioco === "Lite") {
        document.querySelector(".btn-player1").style.display = "inline-block";
        document.querySelector(".btn-player2").style.display = "inline-block";
        document.querySelector(".btn-player1").style.top = "45%";
        document.querySelector(".btn-player2").style.top = "45%";
        document.querySelector("#sezione-punti").style.height = isLandscape()
          ? "25vh"
          : "15vh";
        document.querySelector(".div-servizio").style.top = isLandscape()
          ? "70%"
          : "78%";
      } else if (modalitaGioco === "Standard") {
        document.querySelector(".btn-player1").style.display = "inline-block";
        document.querySelector(".btn-player2").style.display = "inline-block";
        document.querySelector(".btn-player1").style.top = "23%";
        document.querySelector(".btn-player2").style.top = "23%";
        document.querySelector(".btn-erroreP1").style.display = "inline-block";
        document.querySelector(".btn-erroreP2").style.display = "inline-block";
        document.querySelector(".btn-erroreP1").style.top = "73%";
        document.querySelector(".btn-erroreP2").style.top = "73%";
        document.querySelector("#sezione-punti").style.height = isLandscape()
          ? "43vh"
          : "25vh";
        document.querySelector(".div-servizio").style.top = isLandscape()
          ? "83%"
          : "86%";
      } else if (modalitaGioco === "Pro") {
        // Mostra tutti i pulsanti
        document.querySelectorAll(".sezione-punti button").forEach((button) => {
          button.style.display = "inline-block";
        });
      }
      // Salva lo stato dei pulsanti nel localStorage
      const buttonStates = Array.from(
        document.querySelectorAll(".sezione-punti button")
      ).map((button) => ({
        selector: button.className,
        display: button.style.display,
        top: button.style.top,
        height: button.style.height,
      }));
      const sezionePuntiHeight =
        document.querySelector("#sezione-punti").style.height;

      localStorage.setItem(
        "buttonStates",
        JSON.stringify({ buttons: buttonStates, sezionePuntiHeight })
      );
    }
  }

  // Ripristina lo stato dei pulsanti salvato
  restoreButtonStates();
}

// Chiama handleGameMode quando il DOM è completamente caricato
window.addEventListener("DOMContentLoaded", () => {
  handleGameMode();
});

// Aggiungi un listener per gestire i cambiamenti di orientamento o dimensione della finestra
window.addEventListener("resize", () => {
  handleGameMode();
  // Controlla se il servizio è già stato selezionato
  const currentService = localStorage.getItem("currentService");
  if (currentService) {
    setService(parseInt(currentService, 10)); // Ripristina il servizio solo se è stato selezionato
  }
});

//Bottoni del campo
const btnPlayer1 = document.querySelector(".btn-player1");
const btnErrorPlayer1 = document.querySelector(".btn-erroreP1");
const btnAce1 = document.querySelector(".btn-aceP1");
const btnFallo1 = document.querySelector(".btn-FalloP1");
const btnPlayer2 = document.querySelector(".btn-player2");
const btnErrorPlayer2 = document.querySelector(".btn-erroreP2");
const btnAce2 = document.querySelector(".btn-aceP2");
const btnFallo2 = document.querySelector(".btn-FalloP2");
const ballServizio = document.querySelector(".div-servizio");

// Variabili per il punteggio
// const linkImp = document.getElementById("link.impostazioni");
const newMatch = document.getElementById("new-match");

const winGame1 = document.getElementById("win-game1");
const winSet1 = document.getElementById("win-set1");
const winGame2 = document.getElementById("win-game2");
const winSet2 = document.getElementById("win-set2");

const scoreDisplayPlayer1 = document.getElementById("score-player1");
const scoreDisplayAce1 = document.getElementById("score-aceP1");
const scoreDisplayFallo1 = document.getElementById("score-FalloP1");
const scoreDisplayPlayer2 = document.getElementById("score-player2");
const scoreDisplayAce2 = document.getElementById("score-aceP2");
const scoreDisplayFallo2 = document.getElementById("score-FalloP2");

let falloPointPlayer1 = 0;
let falloPointPlayer2 = 0;
let acePointPlayer1 = 0;
let acePointPlayer2 = 0;
let isTieBreak = false; // Stato del tie-break
let tieBreakPointsPlayer1 = 0;
let tieBreakPointsPlayer2 = 0;
let scorePlayer1 = 0;
let scorePlayer2 = 0;
let advantagePlayer = null; // Tiene traccia del giocatore in vantaggio
let totalGames = 1;
let totalSet = 1;
const tennisScores = [0, 15, 30, 40];

let isGamePointPlayer1 = false;
let isGamePointPlayer2 = false;
let isDeuceGamePointPlayer1 = false;
let isDeuceGamePointPlayer2 = false;
let historyStack = [];

// Funzione per disabilitare tutti i pulsanti tranne quelli del servizio
function disableAllButtonsExceptService() {
  const allButtons = document.querySelectorAll("button");
  allButtons.forEach((button) => {
    button.disabled = true; // Disabilita tutti i pulsanti
  });

  // Abilita solo i pulsanti del servizio
  const serviceButtons = document.querySelectorAll(
    "#servicePlayer1, #servicePlayer2"
  );
  serviceButtons.forEach((button) => {
    button.disabled = false; // Abilita i pulsanti del servizio
  });
}

// Funzione per abilitare tutti i pulsanti
function enableAllButtons() {
  const allButtons = document.querySelectorAll("button");
  allButtons.forEach((button) => {
    button.disabled = false; // Abilita tutti i pulsanti
  });
}

// Funzione per mostrare il popup di selezione del servizio
function askForService() {
  const servicePopup = document.createElement("div");
  servicePopup.id = "servicePopup";
  servicePopup.innerHTML = `
    <div class="popup-content">
      <p>Chi gioca il servizio?</p>
      <button id="servicePlayer1" class="service-button">${matchSettings.nameP1}</button>
      <button id="servicePlayer2" class="service-button">${matchSettings.nameP2}</button>
    </div>
  `;
  document.body.appendChild(servicePopup);

  disableAllButtonsExceptService(); // Disabilita tutti i pulsanti tranne quelli del servizio

  // Eventi per i pulsanti
  document.getElementById("servicePlayer1").addEventListener("click", () => {
    setService(1);
    initialService = 1; // Salva il servizio iniziale
    closeServicePopup();
    enableAllButtons(); // Riabilita tutti i pulsanti
    startMatch();
  });

  document.getElementById("servicePlayer2").addEventListener("click", () => {
    setService(2);
    initialService = 2; // Salva il servizio iniziale
    closeServicePopup();
    enableAllButtons(); // Riabilita tutti i pulsanti
    startMatch();
  });
}

// Funzione per aggiornare lo stato dei pulsanti in base al servizio
function updateServiceButtons(player) {
  if (player === 1) {
    // Abilita i pulsanti di Player 1 e disabilita quelli di Player 2
    btnAce1.disabled = false;
    btnFallo1.disabled = false;
    btnAce2.disabled = true;
    btnFallo2.disabled = true;

    // Aggiungi classe per annerire i pulsanti disabilitati
    btnAce1.classList.remove("disabled-button");
    btnFallo1.classList.remove("disabled-button");
    btnAce2.classList.add("disabled-button");
    btnFallo2.classList.add("disabled-button");
  } else if (player === 2) {
    // Abilita i pulsanti di Player 2 e disabilita quelli di Player 1
    btnAce1.disabled = true;
    btnFallo1.disabled = true;
    btnAce2.disabled = false;
    btnFallo2.disabled = false;

    // Aggiungi classe per annerire i pulsanti disabilitati
    btnAce1.classList.add("disabled-button");
    btnFallo1.classList.add("disabled-button");
    btnAce2.classList.remove("disabled-button");
    btnFallo2.classList.remove("disabled-button");
  }
}

// Nascondi il servizio all'inizio
ballServizio.style.display = "none";

// Funzione per impostare il servizio
function setService(player) {
  ballServizio.style.display = "block";
  const rightPos = isLandscape() ? "95.5%" : "93%";

  if (player === 1) {
    // Player 1: sinistra se left 25% o "", destra se left 75%
    ballServizio.style.left =
      !btnPlayer1.style.left || btnPlayer1.style.left === "25%"
        ? "0"
        : rightPos;
  } else if (player === 2) {
    // Player 2: destra se right 75%, sinistra se right 25%
    if (btnPlayer2.style.right === "75%") {
      ballServizio.style.left = "0";
    } else if (btnPlayer2.style.right === "25%") {
      ballServizio.style.left = rightPos;
    } else {
      // Default: se non è impostato, considera destra (come inizio partita)
      ballServizio.style.left = rightPos;
    }
  }

  localStorage.setItem("currentService", player);
  updateServiceButtons(player);

  currentService = player; // Aggiorna il servizio corrente
}
// Funzione per chiudere il popup
function closeServicePopup() {
  const servicePopup = document.getElementById("servicePopup");
  if (servicePopup) {
    servicePopup.remove();
  }
}

// Funzione per avviare la partita
function startMatch() {
  // Imposta che la partita è iniziata
  localStorage.setItem("gameInProgress", "true");

  // Verifica se è modalità allenamento
  const isTrainingMode = localStorage.getItem("isTieBreak") === "true";

  if (isTrainingMode) {
    // Avvia il tie-break direttamente in modalità allenamento
    isTieBreak = true;
    tieBreakPointsPlayer1 = 0;
    tieBreakPointsPlayer2 = 0;
    updateTieBreakDisplay(); // Aggiorna il display del tie-break
  } else {
    // Carica lo stato iniziale della partita
    loadMatchState();
    updateScoreDisplay(); // Aggiorna il display del punteggio
  }
}

function cambioCampo() {
  const sezionePunti = document.getElementById("sezione-punti");
  sezionePunti.classList.add("rotate-animation");

  // Rimuovi la classe dopo l'animazione per poterla riapplicare in futuro
  sezionePunti.addEventListener("animationend", function handler() {
    sezionePunti.classList.remove("rotate-animation");
    sezionePunti.removeEventListener("animationend", handler);
  });

  const btnPlayer1 = document.querySelector(".btn-player1");
  const btnErrorPlayer1 = document.querySelector(".btn-erroreP1");
  const btnAce1 = document.querySelector(".btn-aceP1");
  const btnFallo1 = document.querySelector(".btn-FalloP1");
  const btnDoppioFallo1 = document.querySelector(".btn-DoppioFalloP1");
  const btnPlayer2 = document.querySelector(".btn-player2");
  const btnErrorPlayer2 = document.querySelector(".btn-erroreP2");
  const btnAce2 = document.querySelector(".btn-aceP2");
  const btnFallo2 = document.querySelector(".btn-FalloP2");
  const btnDoppioFallo2 = document.querySelector(".btn-DoppioFalloP2");
  const ballServizio = document.querySelector(".div-servizio");
  const modalitaGioco = matchSettings.modalitaGioco;

  if (modalitaGioco === "Lite") {
    // Controlla la posizione corrente e inverte
    if (btnPlayer1.style.left === "75%") {
      btnPlayer1.style.left = "25%";
      btnPlayer2.style.right = "25%";
    } else {
      btnPlayer1.style.left = "75%";
      btnPlayer2.style.right = "75%";
    }
  } else if (modalitaGioco === "Standard") {
    // Controlla la posizione corrente e inverte
    if (btnPlayer1.style.left === "75%") {
      btnPlayer1.style.left = "25%";
      btnPlayer2.style.right = "25%";
      btnErrorPlayer1.style.left = "25%";
      btnErrorPlayer2.style.right = "25%";
    } else {
      btnPlayer1.style.left = "75%";
      btnPlayer2.style.right = "75%";
      btnErrorPlayer1.style.left = "75%";
      btnErrorPlayer2.style.right = "75%";
    }
  } else if (modalitaGioco === "Pro") {
    // Controlla la posizione corrente e inverte
    if (btnPlayer1.style.left === "75%") {
      btnPlayer1.style.left = "25%";
      btnPlayer2.style.right = "25%";
      btnErrorPlayer1.style.left = "25%";
      btnErrorPlayer2.style.right = "25%";
      btnAce1.style.left = "0";
      btnAce1.style.right = "auto";
      btnAce2.style.right = "0";
      btnAce2.style.left = "auto";
      btnFallo1.style.left = "95px";
      btnFallo1.style.right = "auto";
      btnFallo2.style.right = "95px";
      btnFallo2.style.left = "auto";
      // Muovi anche i doppio fallo
      if (btnDoppioFallo1) {
        btnDoppioFallo1.style.left = "95px";
        btnDoppioFallo1.style.right = "auto";
      }
      if (btnDoppioFallo2) {
        btnDoppioFallo2.style.right = "95px";
        btnDoppioFallo2.style.left = "auto";
      }
    } else {
      btnPlayer1.style.left = "75%";
      btnPlayer2.style.right = "75%";
      btnErrorPlayer1.style.left = "75%";
      btnErrorPlayer2.style.right = "75%";
      btnAce1.style.left = "auto";
      btnAce1.style.right = "0";
      btnAce2.style.left = "0";
      btnAce2.style.right = "auto";
      btnFallo1.style.right = "95px";
      btnFallo1.style.left = "auto";
      btnFallo2.style.left = "95px";
      btnFallo2.style.right = "auto";
      // Muovi anche i doppio fallo
      if (btnDoppioFallo1) {
        btnDoppioFallo1.style.right = "95px";
        btnDoppioFallo1.style.left = "auto";
      }
      if (btnDoppioFallo2) {
        btnDoppioFallo2.style.left = "95px";
        btnDoppioFallo2.style.right = "auto";
      }
    }
  }

  // Salva lo stato del campo nel localStorage
  const campoState = {
    btnPlayer1: btnPlayer1.style.left,
    btnPlayer2: btnPlayer2.style.right,
    btnErrorPlayer1: btnErrorPlayer1.style.left,
    btnErrorPlayer2: btnErrorPlayer2.style.right,
    btnAce1Left: btnAce1.style.left, // salva left
    btnAce1Right: btnAce1.style.right, // salva right
    btnAce2Left: btnAce2.style.left, // salva left
    btnAce2Right: btnAce2.style.right, // salva right
    btnFallo1Left: btnFallo1.style.left,
    btnFallo1Right: btnFallo1.style.right,
    btnFallo2Right: btnFallo2.style.right,
    btnFallo2Left: btnFallo2.style.left,
    ballServizio: ballServizio.style.left,
  };
  localStorage.setItem("campoState", JSON.stringify(campoState));

  const currentService = parseInt(localStorage.getItem("currentService"), 10);
  if (currentService) {
    setService(currentService);
  }
}
document.querySelector(".btn-cambioCampo").addEventListener("click", () => {
  cambioCampo();
});

window.onload = function () {
  // Controlla se la partita è già in corso
  if (localStorage.getItem("gameInProgress") === "true") {
    // Ripristina lo stato salvato
    loadMatchState();
    updateScoreDisplay();

    // Ripristina lo stato del campo dal localStorage
    const savedCampoState = JSON.parse(localStorage.getItem("campoState"));
    if (savedCampoState) {
      const btnPlayer1 = document.querySelector(".btn-player1");
      const btnPlayer2 = document.querySelector(".btn-player2");
      const btnErrorPlayer1 = document.querySelector(".btn-erroreP1");
      const btnErrorPlayer2 = document.querySelector(".btn-erroreP2");
      const btnAce1 = document.querySelector(".btn-aceP1");
      const btnAce2 = document.querySelector(".btn-aceP2");
      const btnFallo1 = document.querySelector(".btn-FalloP1");
      const btnFallo2 = document.querySelector(".btn-FalloP2");
      const ballServizio = document.querySelector(".div-servizio");

      btnPlayer1.style.left = savedCampoState.btnPlayer1;
      btnPlayer2.style.right = savedCampoState.btnPlayer2;
      btnErrorPlayer1.style.left = savedCampoState.btnErrorPlayer1;
      btnErrorPlayer2.style.right = savedCampoState.btnErrorPlayer2;
      btnAce1.style.left = savedCampoState.btnAce1Left;
      btnAce1.style.right = savedCampoState.btnAce1Right;
      btnAce2.style.left = savedCampoState.btnAce2Left;
      btnAce2.style.right = savedCampoState.btnAce2Right;
      btnFallo1.style.left = savedCampoState.btnFallo1Left;
      btnFallo1.style.right = savedCampoState.btnFallo1Right;
      btnFallo2.style.left = savedCampoState.btnFallo2Left;
      btnFallo2.style.right = savedCampoState.btnFallo2Right;
      ballServizio.style.left = savedCampoState.ballServizio;
    }

    // Ripristina il servizio
    const currentService = localStorage.getItem("currentService");
    if (currentService) {
      setService(parseInt(currentService, 10)); // Ripristina il servizio
    }
  } else {
    // Controlla se il servizio è già stato selezionato
    const currentService = localStorage.getItem("currentService");
    if (!currentService) {
      // Mostra il popup per selezionare il servizio solo se non è stato selezionato
      askForService();
    } else {
      // Se il servizio è già stato selezionato, avvia la partita
      startMatch();
    }
  }

  // Ripristina lo stato del tie-break
  const savedState = JSON.parse(localStorage.getItem("matchState"));
  const isTrainingMode = localStorage.getItem("isTieBreak") === "true"; // Verifica se è modalità allenamento

  if (isTrainingMode) {
    // Modalità Allenamento
    if (
      savedState &&
      savedState.tieBreakPointsPlayer1 !== undefined &&
      savedState.tieBreakPointsPlayer2 !== undefined
    ) {
      // Ripristina i punti del tie-break se salvati
      isTieBreak = true;
      tieBreakPointsPlayer1 = savedState.tieBreakPointsPlayer1 || 0;
      tieBreakPointsPlayer2 = savedState.tieBreakPointsPlayer2 || 0;
      updateTieBreakDisplay(); // Aggiorna il display del tie-break
    } else {
      // Avvia il tie-break se non ci sono punti salvati
      startTieBreak();
    }
  } else {
    // Modalità Partita Normale
    if (savedState && savedState.isTieBreak) {
      isTieBreak = true;
      tieBreakPointsPlayer1 = savedState.tieBreakPointsPlayer1 || 0;
      tieBreakPointsPlayer2 = savedState.tieBreakPointsPlayer2 || 0;
      updateTieBreakDisplay(); // Aggiorna il display del tie-break
    } else {
      isTieBreak = false;
      updateScoreDisplay(); // Assicurati che il display sia aggiornato
    }
  }
};

// Funzione per salvare lo stato della partita nel localStorage
function saveMatchState() {
  const matchState = {
    scorePlayer1: scorePlayer1,
    scorePlayer2: scorePlayer2,
    winGame1: winGame1.textContent,
    winGame2: winGame2.textContent,
    winSet1: winSet1.textContent,
    winSet2: winSet2.textContent,
    acePointPlayer1: acePointPlayer1,
    acePointPlayer2: acePointPlayer2,
    falloPointPlayer1: falloPointPlayer1,
    falloPointPlayer2: falloPointPlayer2,
    tieBreakPointsPlayer1: tieBreakPointsPlayer1,
    tieBreakPointsPlayer2: tieBreakPointsPlayer2,
    advantagePlayer: advantagePlayer,
    isTieBreak: isTieBreak,
    btnPlayer1: btnPlayer1.textContent,
    btnErrorPlayer1: btnErrorPlayer1.textContent,
    btnAce1: btnAce1.textContent,
    btnFallo1: btnFallo1.textContent,
    btnPlayer2: btnPlayer2.textContent,
    btnErrorPlayer2: btnErrorPlayer2.textContent,
    btnAce2: btnAce2.textContent,
    btnFallo2: btnFallo2.textContent,
    isDoubleFaultP1: doubleFaultBtn1.parentNode !== null, // Salva se il pulsante "Doppio Fallo" è attivo per Player 1
    isDoubleFaultP2: doubleFaultBtn2.parentNode !== null, // Salva se il pulsante "Doppio Fallo" è attivo per Player 2
    scoreDisplayPlayer1: scoreDisplayPlayer1.textContent,
    scoreDisplayPlayer2: scoreDisplayPlayer2.textContent,
    totalGames: totalGames,
    totalSet: totalSet,
    currentSetWins: totalSet,
    sets: JSON.parse(localStorage.getItem("sets")) || [], // Aggiungi questa linea
    setCount: matchSettings.setCount,
  };
  localStorage.setItem("matchState", JSON.stringify(matchState));
}

// Funzione per caricare lo stato della partita dal localStorage
function loadMatchState() {
  const savedState = JSON.parse(localStorage.getItem("matchState"));
  if (savedState) {
    // Se ci sono dati nel localStorage, carica lo stato
    scorePlayer1 = savedState.scorePlayer1;
    scorePlayer2 = savedState.scorePlayer2;
    winGame1.textContent = savedState.winGame1;
    winGame2.textContent = savedState.winGame2;
    winSet1.textContent = savedState.winSet1;
    winSet2.textContent = savedState.winSet2;
    acePointPlayer1 = savedState.acePointPlayer1;
    acePointPlayer2 = savedState.acePointPlayer2;
    falloPointPlayer1 = savedState.falloPointPlayer1;
    falloPointPlayer2 = savedState.falloPointPlayer2;
    tieBreakPointsPlayer1 = savedState.tieBreakPointsPlayer1;
    tieBreakPointsPlayer2 = savedState.tieBreakPointsPlayer2;
    if (savedState.isDoubleFaultP1) {
      replaceWithDoubleFaultButton(1);
    }
    if (savedState.isDoubleFaultP2) {
      replaceWithDoubleFaultButton(2);
    }
    advantagePlayer = savedState.advantagePlayer;
    isTieBreak = savedState.isTieBreak;
    totalGames = savedState.totalGames;
    totalSet = savedState.totalSet;
    matchSettings.setCount = savedState.setCount;

    // Chiamate per aggiornare le interfacce utente
    updateScoreDisplay();
    updateAceDisplay();
    updateTieBreakDisplay();
    updateFalloDisplay();
    localStorage.setItem("gameInProgress", "true");
  } else {
    // Se non ci sono dati salvati, inizia la partita con i valori di default (azzerati)
    resetAll();
  }
}

let currentServiceValue = localStorage.getItem("currentService");
let currentService =
  currentServiceValue !== null && !isNaN(parseInt(currentServiceValue, 10))
    ? parseInt(currentServiceValue, 10)
    : null;

function saveLiveScore() {
  const matchId = localStorage.getItem("currentMatchId");
  if (!matchId) return;
  const liveScore = {
    scorePlayer1,
    scorePlayer2,
    winGame1: winGame1.textContent,
    winGame2: winGame2.textContent,
    winSet1: winSet1.textContent,
    winSet2: winSet2.textContent,
    nameP1: matchSettings.nameP1,
    nameP2: matchSettings.nameP2,
    nameMatch: matchSettings.nameMatch,
    tennisScores,
    advantagePlayer,
    displayPlayer1: isTieBreak
      ? tieBreakPointsPlayer1
      : scoreDisplayPlayer1.textContent,
    displayPlayer2: isTieBreak
      ? tieBreakPointsPlayer2
      : scoreDisplayPlayer2.textContent,
    currentService, // Salva il servizio corrente
    currentGameCount1: parseInt(winGame1.textContent, 10), // Aggiunto: numero di game vinti dal Player 1
    currentGameCount2: parseInt(winGame2.textContent, 10), // Aggiunto: numero di game vinti dal Player 2
    currentSetCount1: parseInt(winSet1.textContent, 10), // Aggiunto: numero di set vinti dal Player 1
    currentSetCount2: parseInt(winSet2.textContent, 10), // Aggiunto: numero di set vinti dal Player 2
    currentSet: totalSet, // Aggiunto: set corrente
    setCount: matchSettings.setCount, // Aggiunto: numero di set totali
    sets: JSON.parse(localStorage.getItem("sets")) || [], // Aggiunto: array dei set
    isTieBreak, // Aggiunto: stato del tie-break
    tieBreakPointsPlayer1, // Aggiunto: punti del tie-break per Player 1
    tieBreakPointsPlayer2, // Aggiunto: punti del tie-break per Player 2
    // aggiungi altri dati se vuoi
  };
  firebase
    .database()
    .ref("matches/" + matchId)
    .set(liveScore);
}

function saveState() {
  const currentState = {
    scorePlayer1,
    scorePlayer2,
    isGamePointPlayer1,
    isGamePointPlayer2,
    isDeuceGamePointPlayer1,
    isDeuceGamePointPlayer2,
    advantagePlayer,
    acePointPlayer1, // Aggiunto
    acePointPlayer2,
    falloPointPlayer1,
    falloPointPlayer2,
    winGame1: parseInt(winGame1.textContent, 10), // Salva il numero di game vinti dal Player 1
    winGame2: parseInt(winGame2.textContent, 10), // Salva il numero di game vinti dal Player 2
    winSet1: parseInt(winSet1.textContent, 10), // Salva il numero di set vinti dal Player 1
    winSet2: parseInt(winSet2.textContent, 10), // Salva il numero di set vinti dal Player 2
    tieBreakPointsPlayer1,
    tieBreakPointsPlayer2,
    isDoubleFaultP1: doubleFaultBtn1.parentNode !== null, // Aggiunto
    isDoubleFaultP2: doubleFaultBtn2.parentNode !== null, // Aggiunto
    isTieBreak,
    currentService: parseInt(localStorage.getItem("currentService"), 10), // Salva il servizio corrente

    // Salva le posizioni dei bottoni e della palla servizio
    btnPlayer1Left: btnPlayer1.style.left,
    btnPlayer2Right: btnPlayer2.style.right,
    btnErrorPlayer1Left: btnErrorPlayer1.style.left,
    btnErrorPlayer2Right: btnErrorPlayer2.style.right,
    btnAce1Left: btnAce1.style.left,
    btnAce1Right: btnAce1.style.right, // aggiungi questa riga
    btnAce2Left: btnAce2.style.left, // aggiungi questa riga
    btnAce2Right: btnAce2.style.right,
    btnFallo1Left: btnFallo1.style.left,
    btnFallo1Right: btnFallo1.style.right,
    btnFallo2Left: btnFallo2.style.left,
    btnFallo2Right: btnFallo2.style.right,
    ballServizioLeft: ballServizio.style.left,
  };
  historyStack.push(currentState);
}

let skipNextRecording = false; // Flag per saltare la registrazione del prossimo video
let isUndoingAction = false;

function undoLastAction() {
  if (historyStack.length > 0) {
    const previousState = historyStack.pop();

    if (previousState.btnPlayer1Left !== undefined)
      btnPlayer1.style.left = previousState.btnPlayer1Left;
    if (previousState.btnPlayer2Right !== undefined)
      btnPlayer2.style.right = previousState.btnPlayer2Right;
    if (previousState.btnErrorPlayer1Left !== undefined)
      btnErrorPlayer1.style.left = previousState.btnErrorPlayer1Left;
    if (previousState.btnErrorPlayer2Right !== undefined)
      btnErrorPlayer2.style.right = previousState.btnErrorPlayer2Right;
    if (previousState.btnAce1Left !== undefined)
      btnAce1.style.left = previousState.btnAce1Left;
    if (previousState.btnAce1Right !== undefined)
      btnAce1.style.right = previousState.btnAce1Right;
    if (previousState.btnAce2Left !== undefined)
      btnAce2.style.left = previousState.btnAce2Left;
    if (previousState.btnAce2Right !== undefined)
      btnAce2.style.right = previousState.btnAce2Right;
    if (previousState.btnFallo1Left !== undefined)
      btnFallo1.style.left = previousState.btnFallo1Left;
    if (previousState.btnFallo1Right !== undefined)
      btnFallo1.style.right = previousState.btnFallo1Right;
    if (previousState.btnFallo2Left !== undefined)
      btnFallo2.style.left = previousState.btnFallo2Left;
    if (previousState.btnFallo2Right !== undefined)
      btnFallo2.style.right = previousState.btnFallo2Right;
    if (previousState.ballServizioLeft !== undefined)
      ballServizio.style.left = previousState.ballServizioLeft;

    // Ripristina il servizio
    if (previousState.currentService) {
      setService(previousState.currentService); // Ripristina il servizio precedente
    }

    if (isRecording) {
      skipNextRecording = true;
    } // Flag per saltare la registrazione del prossimo video

    if (!isRecording) {
      removeLastScoreFromPage();
    }

    // Se siamo in tie-break, ripristina i punti del tie-break
    if (isTieBreak) {
      tieBreakPointsPlayer1 = previousState.tieBreakPointsPlayer1;
      tieBreakPointsPlayer2 = previousState.tieBreakPointsPlayer2;

      // Aggiorna il display del tie-break
      updateTieBreakDisplay();
    }

    // Se l'ultima azione è stata un incremento del set, ripristina il punteggio
    if (
      parseInt(winSet1.textContent, 10) > previousState.winSet1 ||
      parseInt(winSet2.textContent, 10) > previousState.winSet2
    ) {
      // Decrementa il numero di set vinti
      winSet1.textContent = previousState.winSet1;
      winSet2.textContent = previousState.winSet2;

      // Ripristina il punteggio dei game e dei punti
      winGame1.textContent = previousState.winGame1;
      winGame2.textContent = previousState.winGame2;
      scorePlayer1 = previousState.scorePlayer1;
      scorePlayer2 = previousState.scorePlayer2;
      isGamePointPlayer1 = previousState.isGamePointPlayer1;
      isGamePointPlayer2 = previousState.isGamePointPlayer2;
      isDeuceGamePointPlayer1 = previousState.isDeuceGamePointPlayer1;
      isDeuceGamePointPlayer2 = previousState.isDeuceGamePointPlayer2;
      advantagePlayer = previousState.advantagePlayer;

      isTieBreak = previousState.isTieBreak;
      tieBreakPointsPlayer1 = previousState.tieBreakPointsPlayer1;
      tieBreakPointsPlayer2 = previousState.tieBreakPointsPlayer2;
      updateTieBreakDisplay();

      // Ripristina lo stato del pulsante "Doppio Fallo"
      if (previousState.isDoubleFaultP1) {
        replaceWithDoubleFaultButton(1);
      } else {
        restoreFaultButton(1);
      }

      if (previousState.isDoubleFaultP2) {
        replaceWithDoubleFaultButton(2);
      } else {
        restoreFaultButton(2);
      }

      totalSet--; // Decrementa il contatore dei set

      totalGames =
        parseInt(previousState.winGame1, 10) +
        parseInt(previousState.winGame2, 10) +
        1;

      // Rimuovi l'ultimo set dall'array dei set conclusi
      let sets = JSON.parse(localStorage.getItem("sets")) || [];
      if (sets.length > 0) {
        sets.pop();
        localStorage.setItem("sets", JSON.stringify(sets));
      }

      // Aggiorna anche su Firebase il live score
      saveLiveScore();

      // Aggiorna i display
      updateScoreDisplay();
      updateFalloDisplay();
      updateAceDisplay();
      saveMatchState(); // Salva lo stato aggiornato

      historyStack = [];

      // Mostra un messaggio di notifica
      alert("Azione annullata per proseguire eseguire l'azione corretta");
      return;
    }

    // Se siamo in tie-break, ripristina i punti del tie-break
    if (isTieBreak) {
      tieBreakPointsPlayer1 = previousState.tieBreakPointsPlayer1;
      tieBreakPointsPlayer2 = previousState.tieBreakPointsPlayer2;

      // Aggiorna il display del tie-break
      updateTieBreakDisplay();
    }
    // Se l'ultima azione è stata un incremento del game, ripristina il punteggio
    if (
      parseInt(winGame1.textContent, 10) > previousState.winGame1 ||
      parseInt(winGame2.textContent, 10) > previousState.winGame2
    ) {
      // Decrementa il numero di game vinti
      winGame1.textContent = previousState.winGame1;
      winGame2.textContent = previousState.winGame2;

      // Ripristina il punteggio precedente
      scorePlayer1 = previousState.scorePlayer1;
      scorePlayer2 = previousState.scorePlayer2;
      isGamePointPlayer1 = previousState.isGamePointPlayer1;
      isGamePointPlayer2 = previousState.isGamePointPlayer2;
      isDeuceGamePointPlayer1 = previousState.isDeuceGamePointPlayer1;
      isDeuceGamePointPlayer2 = previousState.isDeuceGamePointPlayer2;
      advantagePlayer = previousState.advantagePlayer;

      // Ripristina lo stato del pulsante "Doppio Fallo"
      if (previousState.isDoubleFaultP1) {
        replaceWithDoubleFaultButton(1);
      } else {
        restoreFaultButton(1);
      }

      if (previousState.isDoubleFaultP2) {
        replaceWithDoubleFaultButton(2);
      } else {
        restoreFaultButton(2);
      }

      // Decrementa il contatore dei game
      totalGames--;

      // Aggiorna i display
      updateScoreDisplay();
      updateFalloDisplay();
      updateAceDisplay();
      saveMatchState(); // Salva lo stato aggiornato

      historyStack = [];

      // Mostra un messaggio di notifica
      alert("Azione annullata per proseguire eseguire l'azione corretta");
      return;
    }

    // Se siamo in tie-break, ripristina i punti del tie-break
    if (isTieBreak) {
      tieBreakPointsPlayer1 = previousState.tieBreakPointsPlayer1;
      tieBreakPointsPlayer2 = previousState.tieBreakPointsPlayer2;

      // Aggiorna il display del tie-break
      updateTieBreakDisplay();
    }

    // Ripristina lo stato precedente
    scorePlayer1 = previousState.scorePlayer1;
    scorePlayer2 = previousState.scorePlayer2;
    isGamePointPlayer1 = previousState.isGamePointPlayer1;
    isGamePointPlayer2 = previousState.isGamePointPlayer2;
    isDeuceGamePointPlayer1 = previousState.isDeuceGamePointPlayer1;
    isDeuceGamePointPlayer2 = previousState.isDeuceGamePointPlayer2;
    advantagePlayer = previousState.advantagePlayer;
    acePointPlayer1 = previousState.acePointPlayer1;
    acePointPlayer2 = previousState.acePointPlayer2;
    falloPointPlayer1 = previousState.falloPointPlayer1;
    falloPointPlayer2 = previousState.falloPointPlayer2;

    // Ripristina lo stato del pulsante "Doppio Fallo"
    if (previousState.isDoubleFaultP1) {
      replaceWithDoubleFaultButton(1);
    } else {
      restoreFaultButton(1);
    }

    if (previousState.isDoubleFaultP2) {
      replaceWithDoubleFaultButton(2);
    } else {
      restoreFaultButton(2);
    }

    // Aggiorna i display
    updateScoreDisplay();
    updateFalloDisplay();
    updateAceDisplay();
    saveMatchState(); // Salva lo stato aggiornato

    historyStack = [];

    // Mostra un messaggio di notifica
    alert("Azione annullata per proseguire eseguire l'azione corretta");
  } else {
    alert("Nessuna azione da annullare!");
  }
}

function removeLastScoreFromPage() {
  isUndoingAction = true;

  let currentSet = totalSet;
  let found = false;

  while (currentSet > 0 && !found) {
    const setsContainer = document.querySelector(".sets-container");
    if (!setsContainer) return;

    const setWrapper = setsContainer.querySelector(
      `.set-wrapper[data-set="${currentSet}"]`
    );
    if (!setWrapper) {
      currentSet--;
      continue;
    }

    const setContent = setWrapper.querySelector(".set-content");
    if (!setContent) {
      currentSet--;
      continue;
    }

    // Trova tutti i game-container del set corrente, in ordine decrescente
    const gameContainers = Array.from(
      setContent.querySelectorAll(".game-container")
    ).reverse();

    for (const gameContainer of gameContainers) {
      const matchInfo = gameContainer.querySelector(".match-info:last-of-type");
      if (matchInfo) {
        const id = matchInfo.getAttribute("data-id");
        matchInfo.remove();

        // Elimina l'elemento da IndexedDB
        openDB((db) => {
          const transaction = db.transaction(DB_STORE, "readwrite");
          const store = transaction.objectStore(DB_STORE);
          store.delete(Number(id));
        });

        found = true;
        break;
      }
    }
    if (!found) currentSet--;
  }

  // Rimuovi l'ultimo stato salvato dallo stack della cronologia
  if (historyStack.length > 0) {
    historyStack.pop();
  }

  // Aggiorna lo stato salvato nel localStorage
  saveMatchState();
}
//DOPPIO FALLO

function updateFalloDisplay() {
  scoreDisplayFallo1.textContent = falloPointPlayer1;
  scoreDisplayFallo2.textContent = falloPointPlayer2;
}

// Creazione dei pulsanti "Doppio Fallo" per entrambi i giocatori
const doubleFaultBtn1 = document.createElement("button");
doubleFaultBtn1.textContent = "DOPPIO FALLO";
doubleFaultBtn1.classList.add("btn-DoppioFalloP1");

const doubleFaultBtn2 = document.createElement("button");
doubleFaultBtn2.textContent = "DOPPIO FALLO";
doubleFaultBtn2.classList.add("btn-DoppioFalloP2");

// Funzione per ripristinare il pulsante "Fallo" se viene premuto un altro pulsante
function restoreFaultButton() {
  if (doubleFaultBtn1.parentNode) {
    doubleFaultBtn1.remove();
    btnFallo1.style.display = "inline-block";
  }
  if (doubleFaultBtn2.parentNode) {
    doubleFaultBtn2.remove();
    btnFallo2.style.display = "inline-block";
  }
}

// Funzione per sostituire il pulsante "Fallo" con "Doppio Fallo"
function replaceWithDoubleFaultButton(player) {
  if (player === 1) {
    btnFallo1.style.display = "none";
    doubleFaultBtn1.style.left = btnFallo1.style.left;
    doubleFaultBtn1.style.right = btnFallo1.style.right;
    btnFallo1.parentNode.insertBefore(doubleFaultBtn1, btnFallo1.nextSibling);
  } else {
    btnFallo2.style.display = "none";
    doubleFaultBtn2.style.left = btnFallo2.style.left;
    doubleFaultBtn2.style.right = btnFallo2.style.right;
    btnFallo2.parentNode.insertBefore(doubleFaultBtn2, btnFallo2.nextSibling);
  }
}

// Eventi per il pulsante "Fallo" di entrambi i giocatori
btnFallo1.addEventListener("click", () => {
  saveState();
  falloPointPlayer1++;
  scoreDisplayFallo1.textContent = falloPointPlayer1;
  replaceWithDoubleFaultButton(1);
  saveMatchState();
});

btnFallo2.addEventListener("click", () => {
  saveState();
  falloPointPlayer2++;
  scoreDisplayFallo2.textContent = falloPointPlayer2;
  replaceWithDoubleFaultButton(2);
  saveMatchState();
});

// Eventi per i pulsanti "Doppio Fallo"
doubleFaultBtn1.addEventListener("click", () => {
  // saveState();
  falloPointPlayer1++;
  scoreDisplayFallo1.textContent = falloPointPlayer1;
  restoreFaultButton(1);
  saveMatchState();
  const matchSettings = JSON.parse(localStorage.getItem("matchSettings"));
  const nameP1 = matchSettings.nameP1;

  requestAnimationFrame(() => {
    stopAndSaveRecording(
      `<span class="actionTextRed"> Doppio Fallo: </span> <span> ${nameP1}</span>`
    );
  });
});

doubleFaultBtn2.addEventListener("click", () => {
  // saveState();
  falloPointPlayer2++;
  scoreDisplayFallo2.textContent = falloPointPlayer2;
  restoreFaultButton(2);
  saveMatchState();
  const matchSettings = JSON.parse(localStorage.getItem("matchSettings"));
  const nameP2 = matchSettings.nameP2;

  requestAnimationFrame(() => {
    stopAndSaveRecording(
      `<span class="actionTextRed"> Doppio Fallo: </span> <span> ${nameP2}</span>`
    );
  });
});
// Eventi per i pulsanti che annullano "Doppio Fallo" e ripristinano "Fallo"
btnPlayer1.addEventListener("click", () => restoreFaultButton(1));
btnAce1.addEventListener("click", () => restoreFaultButton(1));
btnErrorPlayer1.addEventListener("click", () => restoreFaultButton(1));
btnPlayer2.addEventListener("click", () => restoreFaultButton(2));
btnErrorPlayer2.addEventListener("click", () => restoreFaultButton(2));
btnAce2.addEventListener("click", () => restoreFaultButton(2));
document.getElementById("undoButton").addEventListener("click", undoLastAction);

// funziona per aggiornare punteggio degli ace
function updateScoreAce(player) {
  if (player === 1) {
    acePointPlayer1++;
  } else if (player === 2) {
    acePointPlayer2++;
  }
  updateAceDisplay();
  saveMatchState();
}

// Funzione per aggiornare il punteggio
function updateScore(player) {
  saveState();

  if (isTieBreak) {
    // Gestione del tie-break
    if (player === 1) {
      tieBreakPointsPlayer1++;
    } else {
      tieBreakPointsPlayer2++;
    }

    // Cambia il servizio nel tie-break
    const totalTieBreakPoints = tieBreakPointsPlayer1 + tieBreakPointsPlayer2;
    if (totalTieBreakPoints === 1 || totalTieBreakPoints % 2 === 1) {
      // Cambia il servizio dopo il primo punto e poi ogni due punti
      const currentService = parseInt(
        localStorage.getItem("currentService"),
        10
      );
      const nextService = currentService === 1 ? 2 : 1; // Alterna tra 1 e 2
      setService(nextService);
    }

    saveMatchState();
    updateTieBreakDisplay();
    if (
      tieBreakPointsPlayer1 >= matchSettings.tieBreak &&
      tieBreakPointsPlayer1 - tieBreakPointsPlayer2 >= 2
    ) {
      endTieBreak(1);
    } else if (
      tieBreakPointsPlayer2 >= matchSettings.tieBreak &&
      tieBreakPointsPlayer2 - tieBreakPointsPlayer1 >= 2
    ) {
      endTieBreak(2);
    }
  } else {
    if (scorePlayer1 === 3 && scorePlayer2 === 3) {
      // Deuce (40-40)
      if (advantagePlayer === null) {
        advantagePlayer = player;
      } else if (advantagePlayer === 1) {
        if (player === 1) {
          isDeuceGamePointPlayer1 = true;
          isDeuceGamePointPlayer2 = false;
          showWinningPointDeuce(1);
        } else {
          advantagePlayer = null;
          isDeuceGamePointPlayer1 = false;
          isDeuceGamePointPlayer2 = false;
        }
      } else if (advantagePlayer === 2) {
        if (player === 2) {
          isDeuceGamePointPlayer2 = true;
          isDeuceGamePointPlayer1 = false;
          showWinningPointDeuce(2);
        } else {
          advantagePlayer = null;
          isDeuceGamePointPlayer1 = false;
          isDeuceGamePointPlayer2 = false;
        }
      }
      saveMatchState();
    } else {
      // Controllo normale
      if (player === 1) {
        if (scorePlayer1 === 3 && isGamePointPlayer1) {
          // Se il giocatore era già a "Game Point", cambia il game
          showWinningPoint(1);
        } else if (scorePlayer1 === 3) {
          // Se il giocatore arriva a 40 ora, al prossimo sarà "Game Point"
          isGamePointPlayer1 = true;
        } else {
          scorePlayer1++;
          isGamePointPlayer1 = false;
        }
        isGamePointPlayer2 = false;
      } else if (player === 2) {
        if (scorePlayer2 === 3 && isGamePointPlayer2) {
          // Se il giocatore era già a "Game Point", cambia il game
          showWinningPoint(2);
        } else if (scorePlayer2 === 3) {
          // Se il giocatore arriva a 40 ora, al prossimo sarà "Game Point"
          isGamePointPlayer2 = true;
        } else {
          scorePlayer2++;
          isGamePointPlayer2 = false;
        }
        isGamePointPlayer1 = false;
      }
    }
    updateScoreDisplay();
    saveMatchState();
    saveLiveScore(); // Salva il punteggio in tempo reale
  }
}

//Funzioni per aggiornare i vari display

//Funzione per aggiornare il display degli ace
function updateAceDisplay() {
  scoreDisplayAce1.textContent = acePointPlayer1;
  scoreDisplayAce2.textContent = acePointPlayer2;
}

// Funzione per aggiornare il display
function updateScoreDisplay() {
  if (isTieBreak) {
    scoreDisplayPlayer1.textContent = tieBreakPointsPlayer1;
    scoreDisplayPlayer2.textContent = tieBreakPointsPlayer2;
  } else {
    const currentGameCount1 = parseInt(winGame1.textContent, 10);
    const currentGameCount2 = parseInt(winGame2.textContent, 10);
    const maxGames = 6;

    // Situazione di Deuce
    if (scorePlayer1 === 3 && scorePlayer2 === 3) {
      if (isDeuceGamePointPlayer1) {
        // Controlla se è Set Point per il Giocatore 1
        if (
          (currentGameCount1 === maxGames - 1 &&
            currentGameCount1 - currentGameCount2 >= 1) ||
          (currentGameCount1 >= 6 &&
            currentGameCount1 - currentGameCount2 === 1)
        ) {
          scoreDisplayPlayer1.textContent = "Set Point (Deuce)";
        } else {
          scoreDisplayPlayer1.textContent = "Game Point (Deuce)";
        }
        scoreDisplayPlayer2.textContent = "40";
        return; // Evita ulteriori aggiornamenti
      } else if (isDeuceGamePointPlayer2) {
        // Controlla se è Set Point per il Giocatore 2
        if (
          (currentGameCount2 === maxGames - 1 &&
            currentGameCount2 - currentGameCount1 >= 1) ||
          (currentGameCount2 >= 6 &&
            currentGameCount2 - currentGameCount1 === 1)
        ) {
          scoreDisplayPlayer2.textContent = "Set Point (Deuce)";
        } else {
          scoreDisplayPlayer2.textContent = "Game Point (Deuce)";
        }
        scoreDisplayPlayer1.textContent = "40";
        return; // Evita ulteriori aggiornamenti
      }

      if (advantagePlayer === 1) {
        scoreDisplayPlayer1.textContent = "Adv";
        scoreDisplayPlayer2.textContent = "40";
      } else if (advantagePlayer === 2) {
        scoreDisplayPlayer1.textContent = "40";
        scoreDisplayPlayer2.textContent = "Adv";
      } else {
        scoreDisplayPlayer1.textContent = "40";
        scoreDisplayPlayer2.textContent = "40";
      }
    } else if (isGamePointPlayer1) {
      // Verifica se è Set Point per il Giocatore 1
      if (
        (currentGameCount1 === maxGames - 1 &&
          currentGameCount1 - currentGameCount2 >= 1) ||
        (currentGameCount1 >= 6 && currentGameCount1 - currentGameCount2 === 1)
      ) {
        scoreDisplayPlayer1.textContent = "Set Point";
      } else {
        scoreDisplayPlayer1.textContent = "Game Point";
      }
      scoreDisplayPlayer2.textContent = tennisScores[scorePlayer2];

      setTimeout(() => {
        showWinningPoint(1);
      }, 500);
    } else if (isGamePointPlayer2) {
      // Verifica se è Set Point per il Giocatore 2
      if (
        (currentGameCount2 === maxGames - 1 &&
          currentGameCount2 - currentGameCount1 >= 1) ||
        (currentGameCount2 >= 6 && currentGameCount2 - currentGameCount1 === 1)
      ) {
        scoreDisplayPlayer2.textContent = "Set Point";
      } else {
        scoreDisplayPlayer2.textContent = "Game Point";
      }
      scoreDisplayPlayer1.textContent = tennisScores[scorePlayer1];

      setTimeout(() => {
        showWinningPoint(2);
      }, 500);
    } else {
      // Mostra punteggio normale
      scoreDisplayPlayer1.textContent = tennisScores[scorePlayer1];
      scoreDisplayPlayer2.textContent = tennisScores[scorePlayer2];
    }
  }
  saveLiveScore(); // Salva il punteggio in tempo reale
}

// Funzione per mostrare il punto vincente e poi incrementare il game
function showWinningPoint(player) {
  setTimeout(() => {
    incrementGame(player);
    saveMatchState();
  }, 500);
}

function showWinningPointDeuce(player) {
  // Mostra la scritta per 500ms
  if (player === 1) {
    scoreDisplayPlayer1.textContent = "Game Point (Deuce)";
    scoreDisplayPlayer2.textContent = "40";
  } else {
    scoreDisplayPlayer2.textContent = "Game Point (Deuce)";
    scoreDisplayPlayer1.textContent = "40";
  }

  // Dopo 500ms incrementa il game
  setTimeout(() => {
    incrementGame(player);
    saveMatchState();
  }, 500);
}

// Funzione per aggiornare il display del tie-break
function updateTieBreakDisplay() {
  scoreDisplayPlayer1.textContent = tieBreakPointsPlayer1;
  scoreDisplayPlayer2.textContent = tieBreakPointsPlayer2;
  saveLiveScore(); // Salva il punteggio in tempo reale
}

// Funzione per incrementare il game
function incrementGame(player) {
  isGamePointPlayer1 = false;
  isGamePointPlayer2 = false;

  const currentGameCount1 = parseInt(winGame1.textContent, 10);
  const currentGameCount2 = parseInt(winGame2.textContent, 10);

  if (player === 1) {
    winGame1.textContent = currentGameCount1 + 1;
  } else if (player === 2) {
    winGame2.textContent = currentGameCount2 + 1;
  }
  totalGames++;

  // Cambia il servizio ad ogni game
  const currentService = parseInt(localStorage.getItem("currentService"), 10);
  const nextService = currentService === 1 ? 2 : 1; // Alterna tra 1 e 2
  setService(nextService); // Imposta il nuovo servizio

  // Attiva il tie-break se i game sono 6-6
  if (
    parseInt(winGame1.textContent, 10) === 6 &&
    parseInt(winGame2.textContent, 10) === 6
  ) {
    alert("Inizio Tie Break");
    startTieBreak();
  } else {
    checkSetWinner(player);
  }

  // Resetta lo stato del Game Point per il nuovo game solo dopo l'aggiornamento
  isDeuceGamePointPlayer1 = false;
  isDeuceGamePointPlayer2 = false;
  advantagePlayer = null;
  // Aspetta 500 ms per assicurarti che il display venga aggiornato

  scorePlayer1 = 0; // Resetta il punteggio
  scorePlayer2 = 0; // Resetta il punteggio
  updateScoreDisplay();
}

// Funzione per attivare il tie-break
function startTieBreak() {
  isTieBreak = true;
  tieBreakPointsPlayer1 = 0;
  tieBreakPointsPlayer2 = 0;
}

// Funzione per terminare il tie-break
function endTieBreak(winner) {
  const matchSettings = JSON.parse(localStorage.getItem("matchSettings"));

  // Mostra il punteggio finale del tie-break per 1 secondo
  updateTieBreakDisplay();

  setTimeout(() => {
    // Usa il numero di set definiti nelle impostazioni della partita
    if (winner === 1) {
      incrementSet(1, matchSettings.setCount, matchSettings);
    } else {
      incrementSet(2, matchSettings.setCount, matchSettings);
    }

    // Salva lo stato della partita
    saveMatchState();
  }, 500); // Ritardo di 1 secondo
}

// Funzione per verificare chi ha vinto il set
function checkSetWinner(player) {
  const matchSettings = JSON.parse(localStorage.getItem("matchSettings"));
  const maxGames = 6; // Numero massimo di game per vincere il set in condizioni normali
  const maxSets = matchSettings?.setCount; // Numero massimo di set per vincere la partita

  const currentGameCount1 = parseInt(winGame1.textContent, 10);
  const currentGameCount2 = parseInt(winGame2.textContent, 10);

  // Caso 5-5: Regola speciale
  if (currentGameCount1 >= 5 && currentGameCount2 >= 5) {
    if (
      player === 1 &&
      currentGameCount1 >= 7 &&
      currentGameCount1 - currentGameCount2 >= 2
    ) {
      incrementSet(1, maxSets, matchSettings);
    } else if (
      player === 2 &&
      currentGameCount2 >= 7 &&
      currentGameCount2 - currentGameCount1 >= 2
    ) {
      incrementSet(2, maxSets, matchSettings);
    }
  }
  // Condizione normale: Vince il primo che raggiunge 6 con almeno 2 game di vantaggio
  else if (
    player === 1 &&
    currentGameCount1 === maxGames &&
    currentGameCount1 - currentGameCount2 >= 2
  ) {
    incrementSet(1, maxSets, matchSettings);
  } else if (
    player === 2 &&
    currentGameCount2 === maxGames &&
    currentGameCount2 - currentGameCount1 >= 2
  ) {
    incrementSet(2, maxSets, matchSettings);
  }
}

// Funzione per terminare la partita
function endMatch(winnerName, fromLoad = false) {
  if (!fromLoad && localStorage.getItem("matchFinished") === "true") {
    return; // Evita di salvare la partita più volte
  }

  localStorage.setItem("matchFinished", "true");
  localStorage.setItem("winner", winnerName); // Salviamo il vincitore

  // Nascondi il link impostazioni
  // linkImp.style.display = "none";

  // Disabilita tutti i pulsanti che incrementano il punteggio
  const buttons = document.querySelectorAll(
    ".btn-player1, .btn-erroreP1, .btn-aceP1, .btn-FalloP1, .btn-player2, .btn-erroreP2, .btn-aceP2, .btn-FalloP2"
  );
  buttons.forEach((button) => {
    button.disabled = true;
  });

  // Se il messaggio di fine partita non esiste già, lo crea
  let endMessage = document.getElementById("endMessage");
  if (!endMessage) {
    endMessage = document.createElement("div");
    endMessage.id = "endMessage";
    document.body.appendChild(endMessage);
  }

  endMessage.innerHTML = `
  <p id="winnerMessage" class="winner-message">Fine Partita - ${winnerName} ha vinto!</p>
  <div id="newGameRequest" class="new-game-request">
    <p class="new-game-text">Vuoi iniziare una nuova partita?</p>
    <button id="newGameYes" class="new-game-button yes-button">Sì</button>
    <button id="newGameNo" class="new-game-button no-button">No</button>
  </div>
`;
  endMessage.style.position = "fixed";
  endMessage.style.top = "50%";
  endMessage.style.left = "50%";
  endMessage.style.transform = "translate(-50%, -50%)";
  endMessage.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  endMessage.style.color = "white";
  endMessage.style.paddingBottom = "30px";
  endMessage.style.paddingLeft = "15px";
  endMessage.style.width = "70%";
  endMessage.style.fontSize = "24px";
  endMessage.style.zIndex = "1000";

  // Aggiungi eventi ai pulsanti
  document.getElementById("newGameYes").addEventListener("click", () => {
    newMatch.click(); // Simula un click sul pulsante "newMatch"
  });

  document.getElementById("newGameNo").addEventListener("click", () => {
    const newGameRequest = document.getElementById("newGameRequest");
    if (newGameRequest) {
      newGameRequest.style.display = "none"; // Nasconde solo la richiesta di nuova partita
    }
  });

  // Salva lo stato della partita finita solo la prima volta
  if (!fromLoad) {
    saveFinishedMatch();
  }
}

// Quando la pagina viene caricata, controlla se la partita è finita
window.addEventListener("DOMContentLoaded", () => {
  const matchFinished = localStorage.getItem("matchFinished");
  const winner = localStorage.getItem("winner");

  if (matchFinished === "true" && winner) {
    endMatch(winner, true); // Ripristina il messaggio di fine partita e disabilita i pulsanti
  }
});

// Variabile per tracciare chi ha iniziato il servizio nel primo set
let initialService = 1; // 1 per Player 1, 2 per Player 2

// Funzione per incrementare il set
function incrementSet(player, maxSets, matchSettings) {
  const setsToWin = Math.ceil(maxSets / 2);
  const currentSet = {
    player1Games: parseInt(winGame1.textContent, 10),
    player2Games: parseInt(winGame2.textContent, 10),
    isTieBreak: isTieBreak, // Indica se il set è terminato in tie-break
    tieBreakPointsPlayer1: tieBreakPointsPlayer1 || 0,
    tieBreakPointsPlayer2: tieBreakPointsPlayer2 || 0,
  };

  let sets = JSON.parse(localStorage.getItem("sets")) || [];
  sets.push(currentSet);
  localStorage.setItem("sets", JSON.stringify(sets));

  if (player === 1) {
    let currentSetWins = parseInt(winSet1.textContent, 10);
    currentSetWins++;
    winSet1.textContent = currentSetWins;

    if (currentSetWins === setsToWin) {
      endMatch(matchSettings.nameP1);
      resetAll();
    } else {
      totalGames = 1;
      totalSet++;
      resetGameAndPoints();

      // Cambia il servizio per il nuovo set
      initialService = initialService === 1 ? 2 : 1;
      setService(initialService);

      // Attiva il tie-break per il nuovo set solo se siamo in allenamento
      if (localStorage.getItem("isTieBreak") === "true") {
        startTieBreak();
      }
      saveLiveScore(); // Salva il punteggio in tempo reale
    }
  } else if (player === 2) {
    let currentSetWins = parseInt(winSet2.textContent, 10);
    currentSetWins++;
    winSet2.textContent = currentSetWins;

    if (currentSetWins === setsToWin) {
      endMatch(matchSettings.nameP2);
      resetAll();
    } else {
      totalGames = 1;
      totalSet++;
      resetGameAndPoints();

      // Cambia il servizio per il nuovo set
      initialService = initialService === 1 ? 2 : 1;
      setService(initialService);

      // Attiva il tie-break per il nuovo set solo se siamo in allenamento
      if (localStorage.getItem("isTieBreak") === "true") {
        startTieBreak();
      }
      saveLiveScore(); // Salva il punteggio in tempo reale
    }
  }
}
// Funzione per resettare il punteggio
function resetGameAndPoints() {
  scorePlayer1 = 0;
  scorePlayer2 = 0;
  winGame1.textContent = 0;
  winGame2.textContent = 0;

  // Resetta anche i punteggi del tie-break
  tieBreakPointsPlayer1 = 0;
  tieBreakPointsPlayer2 = 0;
  isTieBreak = false; // Esci dalla modalità tie-break se attiva

  updateScoreDisplay();
  updateTieBreakDisplay(); // Aggiorna il display del tie-break
}

// Funzione per resettare tutto (set e game)
function resetAll() {
  // Reset dei punteggi dei giocatori
  scorePlayer1 = 0;
  scorePlayer2 = 0;
  winGame1.textContent = 0;
  winGame2.textContent = 0;
  winSet1.textContent = 0;
  winSet2.textContent = 0;

  // Reset dei punteggi degli ace
  acePointPlayer1 = 0;
  acePointPlayer2 = 0;
  scoreDisplayAce1.textContent = 0;
  scoreDisplayAce2.textContent = 0;

  // Reset dei punteggi dei falli
  falloPointPlayer1 = 0;
  falloPointPlayer2 = 0;
  scoreDisplayFallo1.textContent = 0;
  scoreDisplayFallo2.textContent = 0;

  // Reset del vantaggio, tie-break e punteggi di gioco
  isTieBreak = false;
  tieBreakPointsPlayer1 = 0;
  tieBreakPointsPlayer2 = 0;
  advantagePlayer = null;

  // Resetta tutti gli altri display e variabili
  updateAceDisplay();
  updateScoreDisplay();
  updateTieBreakDisplay();
}

// Ascoltatori eventi per i bottoni dei giocatori

// Funzione per disabilitare temporaneamente i bottoni del punteggio
function disableButtonsTemporarily() {
  const buttons = document.querySelectorAll(
    ".btn-player1, .btn-erroreP1, .btn-aceP1, .btn-FalloP1, .btn-player2, .btn-erroreP2, .btn-aceP2, .btn-FalloP2"
  );
  buttons.forEach((button) => {
    button.disabled = true;
  });

  setTimeout(() => {
    buttons.forEach((button) => {
      button.disabled = false;
    });
  }, 1000); // 1000 millisecondi = 1 secondo
}

btnPlayer1.addEventListener("click", () => {
  updateScore(1);
  disableButtonsTemporarily();
});
btnErrorPlayer1.addEventListener("click", () => {
  updateScore(2);
  disableButtonsTemporarily();
});
btnAce1.addEventListener("click", () => {
  updateScore(1);
  updateScoreAce(1);
  disableButtonsTemporarily();
});
doubleFaultBtn1.addEventListener("click", () => {
  updateScore(2);
  disableButtonsTemporarily();
});

//player2
btnPlayer2.addEventListener("click", () => {
  updateScore(2);
  disableButtonsTemporarily();
});
btnErrorPlayer2.addEventListener("click", () => {
  updateScore(1);
  disableButtonsTemporarily();
});
btnAce2.addEventListener("click", () => {
  updateScore(2);
  updateScoreAce(2);
  disableButtonsTemporarily();
});
doubleFaultBtn2.addEventListener("click", () => {
  updateScore(1);
  disableButtonsTemporarily();
});

// linkImp.addEventListener("click", () => {
//   localStorage.setItem("gameInProgress", "false");
// }); // Imposta a false per indicare che la partita non è in corso})

// Funzione per salvare lo stato della partita finita
function saveFinishedMatch() {
  const finishedMatchState = {
    scorePlayer1: scorePlayer1,
    scorePlayer2: scorePlayer2,
    winGame1: winGame1.textContent,
    winGame2: winGame2.textContent,
    winSet1: winSet1.textContent,
    winSet2: winSet2.textContent,
    acePointPlayer1: acePointPlayer1,
    acePointPlayer2: acePointPlayer2,
    falloPointPlayer1: falloPointPlayer1,
    falloPointPlayer2: falloPointPlayer2,
    tieBreakPointsPlayer1: tieBreakPointsPlayer1,
    tieBreakPointsPlayer2: tieBreakPointsPlayer2,
    advantagePlayer: advantagePlayer,
    isTieBreak: isTieBreak,
    totalGames: totalGames,
    totalSet: totalSet,
    sets: JSON.parse(localStorage.getItem("sets")) || [],
    winner: localStorage.getItem("winner"),
    matchSettings: matchSettings,
  };
  const finishedMatches =
    JSON.parse(localStorage.getItem("finishedMatches")) || [];
  finishedMatches.push(finishedMatchState);
  localStorage.setItem("finishedMatches", JSON.stringify(finishedMatches));
}

// // Funzione per generare un numero casuale di 6 cifre come stringa
// function generateNumericId(length = 6) {
//   let id = "";
//   for (let i = 0; i < length; i++) {
//     id += Math.floor(Math.random() * 10);
//   }
//   return id;
// }

// // Funzione per generare un ID numerico di 6 cifre NON duplicato su Firebase
// async function generateUniqueMatchId() {
//   let matchId;
//   let exists = true;
//   while (exists) {
//     matchId = generateNumericId(6);
//     const snapshot = await firebase
//       .database()
//       .ref("matches/" + matchId)
//       .once("value");
//     exists = snapshot.exists();
//   }
//   return matchId;
// }

// Ascoltatore per iniziare una nuova partita
newMatch.addEventListener("click", () => {
  // Genera un identificatore univoco per la nuova partita
  // const matchId = await generateUniqueMatchId();
  localStorage.setItem("currentMatchId", matchId);

  // 1. Reset dei punteggi e delle variabili
  scorePlayer1 = 0;
  scorePlayer2 = 0;
  winGame1.textContent = 0;
  winGame2.textContent = 0;
  winSet1.textContent = 0;
  winSet2.textContent = 0;

  acePointPlayer1 = 0;
  acePointPlayer2 = 0;
  scoreDisplayAce1.textContent = 0;
  scoreDisplayAce2.textContent = 0;

  falloPointPlayer1 = 0;
  falloPointPlayer2 = 0;
  scoreDisplayFallo1.textContent = 0;
  scoreDisplayFallo2.textContent = 0;

  // Reset del vantaggio, tie-break e punteggi di gioco
  isTieBreak = false;
  tieBreakPointsPlayer1 = 0;
  tieBreakPointsPlayer2 = 0;
  advantagePlayer = null;
  isDeuceGamePointPlayer1 = false;
  isDeuceGamePointPlayer2 = false;
  isGamePointPlayer1 = false;
  isGamePointPlayer2 = false;

  totalGames = 1;
  totalSet = 1;

  // 2. Pulisci il localStorage per eliminare le impostazioni della partita
  localStorage.setItem("gameInProgress", "false"); // Imposta a false per indicare che la partita non è in corso
  localStorage.removeItem("matchState");
  localStorage.removeItem("matchFinished");
  localStorage.removeItem("sets");
  localStorage.removeItem("winner");
  localStorage.removeItem("matchSettings");
  localStorage.removeItem("currentService");
  localStorage.removeItem("campoState");

  // Azzeramento variabili servizio e stato
  initialService = 1;
  ballServizio.style.display = "none";
  ballServizio.style.left = "0";

  // Resetta il colore salvato
  localStorage.removeItem("campoColor");

  // 3. Cancella i video da IndexedDB
  deleteAllVideos(matchId);

  // 4. Ricarica la pagina per iniziare una nuova partita
  window.location.href = "index.html"; // Assicurati che questa sia la pagina di partenza
});

// Recupera le impostazioni della partita
const matchSettings = JSON.parse(localStorage.getItem("matchSettings"));

if (matchSettings) {
  // Usa questi dati nella logica della partita
  const { nameMatch, nameP1, nameP2, gameCount, setCount, tieBreak } =
    matchSettings;

  // Puoi aggiornare il display con i nomi
  document.querySelector(".nameMatch").textContent = nameMatch;
  document.querySelector(".name-player1").textContent = nameP1;
  document.querySelector(".name-player2").textContent = nameP2;
  document.querySelector(".btn-player1").textContent = nameP1;
  document.querySelector(".btn-erroreP1").textContent = nameP1;
  document.querySelector(".btn-player2").textContent = nameP2;
  document.querySelector(".btn-erroreP2").textContent = nameP2;
  document.querySelector("#score-game").textContent = gameCount;
  document.querySelector("#score-set").textContent = setCount;
}

document.getElementById("link-match").addEventListener("click", () => {
  const matchId = localStorage.getItem("currentMatchId");
  const matchSettings = JSON.parse(localStorage.getItem("matchSettings"));

  if (matchId && matchSettings) {
    const { nameMatch, nameP1, nameP2 } = matchSettings;
    const textToShare = `Guarda LIVE! ID Partita: ${matchId}\nGiocatori: ${nameP1} vs ${nameP2}`;
    const encodedText = encodeURIComponent(textToShare);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;

    // Apri il link WhatsApp
    window.open(whatsappUrl, "_blank");
  } else {
    alert(
      "Impossibile condividere. Assicurati che la partita sia configurata correttamente."
    );
  }
});
