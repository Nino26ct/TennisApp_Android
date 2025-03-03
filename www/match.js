//Bottoni del campo
const btnPlayer1 = document.querySelector(".btn-player1");
const btnErrorPlayer1 = document.querySelector(".btn-erroreP1");
const btnAce1 = document.querySelector(".btn-aceP1");
const btnFallo1 = document.querySelector(".btn-FalloP1");
const btnPlayer2 = document.querySelector(".btn-player2");
const btnErrorPlayer2 = document.querySelector(".btn-erroreP2");
const btnAce2 = document.querySelector(".btn-aceP2");
const btnFallo2 = document.querySelector(".btn-FalloP2");

// Variabili per il punteggio
const linkImp = document.getElementById("link.impostazioni");
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

window.onload = function () {
  loadMatchState();
  updateScoreDisplay(); // Carica lo stato salvato

  // Imposta che il gioco è in corso se non è già stato fatto
  if (localStorage.getItem("gameInProgress") !== "true") {
    // Se la partita non è in corso, impostala come "in corso"
    localStorage.setItem("gameInProgress", "true");
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
    scoreDisplayPlayer1: scoreDisplayPlayer1.textContent,
    scoreDisplayPlayer2: scoreDisplayPlayer2.textContent,
    totalGames: totalGames,
    totalSet: totalSet,
    currentSetWins: totalSet,
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
    advantagePlayer = savedState.advantagePlayer;
    isTieBreak = savedState.isTieBreak;

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

//DOPPIO FALLO

function updateFalloDisplay() {
  scoreDisplayFallo1.textContent = falloPointPlayer1;
  scoreDisplayFallo2.textContent = falloPointPlayer2;
}

// Creazione dei pulsanti "Doppio Fallo" per entrambi i giocatori
const doubleFaultBtn1 = document.createElement("button");
doubleFaultBtn1.textContent = "Doppio Fallo";
doubleFaultBtn1.classList.add("btn-DoppioFalloP1");

const doubleFaultBtn2 = document.createElement("button");
doubleFaultBtn2.textContent = "Doppio Fallo";
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
    btnFallo1.parentNode.insertBefore(doubleFaultBtn1, btnFallo1.nextSibling);
  } else {
    btnFallo2.style.display = "none";
    btnFallo2.parentNode.insertBefore(doubleFaultBtn2, btnFallo2.nextSibling);
  }
}

// Eventi per il pulsante "Fallo" di entrambi i giocatori
btnFallo1.addEventListener("click", () => {
  falloPointPlayer1++;
  scoreDisplayFallo1.textContent = falloPointPlayer1;
  replaceWithDoubleFaultButton(1);
});

btnFallo2.addEventListener("click", () => {
  falloPointPlayer2++;
  scoreDisplayFallo2.textContent = falloPointPlayer2;
  replaceWithDoubleFaultButton(2);
});

// Eventi per i pulsanti "Doppio Fallo"
doubleFaultBtn1.addEventListener("click", () => {
  falloPointPlayer1++;
  scoreDisplayFallo1.textContent = falloPointPlayer1;
  restoreFaultButton(1);
});

doubleFaultBtn2.addEventListener("click", () => {
  falloPointPlayer2++;
  scoreDisplayFallo2.textContent = falloPointPlayer2;
  restoreFaultButton(2);
});

// Eventi per i pulsanti che annullano "Doppio Fallo" e ripristinano "Fallo"
btnPlayer1.addEventListener("click", () => restoreFaultButton(1));
btnAce1.addEventListener("click", () => restoreFaultButton(1));
btnErrorPlayer1.addEventListener("click", () => restoreFaultButton(1));
btnPlayer2.addEventListener("click", () => restoreFaultButton(2));
btnErrorPlayer2.addEventListener("click", () => restoreFaultButton(2));
btnAce2.addEventListener("click", () => restoreFaultButton(2));

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
  if (isTieBreak) {
    // Gestione del tie-break
    if (player === 1) {
      tieBreakPointsPlayer1++;
    } else {
      tieBreakPointsPlayer2++;
    }
    saveMatchState();
    updateTieBreakDisplay();

    if (
      tieBreakPointsPlayer1 >= 7 &&
      tieBreakPointsPlayer1 - tieBreakPointsPlayer2 >= 2
    ) {
      endTieBreak(1);
    } else if (
      tieBreakPointsPlayer2 >= 7 &&
      tieBreakPointsPlayer2 - tieBreakPointsPlayer1 >= 2
    ) {
      endTieBreak(2);
    }
  } else {
    if (scorePlayer1 === 3 && scorePlayer2 === 3) {
      // Deuce (40-40)
      if (advantagePlayer === null) {
        advantagePlayer = player;
      } else if (advantagePlayer === player) {
        showWinningPoint(player);
      } else {
        advantagePlayer = null;
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
    if (scorePlayer1 === 3 && scorePlayer2 === 3) {
      // Deuce
      scoreDisplayPlayer1.textContent = advantagePlayer === 1 ? "Adv" : "40";
      scoreDisplayPlayer2.textContent = advantagePlayer === 2 ? "Adv" : "40";
      isGamePointPlayer1 = false;
      isGamePointPlayer2 = false;
    } else if (advantagePlayer === 1 && isGamePointPlayer1 === true) {
      // Player 1 has advantage
      scoreDisplayPlayer1.textContent = "Game Point";
      scoreDisplayPlayer2.textContent = "40";
      setTimeout(() => {
        showWinningPoint(1);
      }, 500);
    } else if (advantagePlayer === 2 && isGamePointPlayer2 === true) {
      // Player 2 has advantage
      scoreDisplayPlayer1.textContent = "40";
      scoreDisplayPlayer2.textContent = "Game Point";
      setTimeout(() => {
        showWinningPoint(1);
      }, 500);
    } else if (isGamePointPlayer1) {
      // Mostra "Game Point" e cambia game dopo 1 secondo
      scoreDisplayPlayer1.textContent = "Game Point";
      scoreDisplayPlayer2.textContent = tennisScores[scorePlayer2];
      setTimeout(() => {
        showWinningPoint(1);
      }, 500);
    } else if (isGamePointPlayer2) {
      // Mostra "Game Point" e cambia game dopo 1 secondo
      scoreDisplayPlayer2.textContent = "Game Point";
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
}
// Funzione per mostrare il punto vincente e poi incrementare il game
function showWinningPoint(player) {
  setTimeout(() => {
    incrementGame(player);
    saveMatchState();
  }, 500);
}

// Funzione per aggiornare il display del tie-break
function updateTieBreakDisplay() {
  scoreDisplayPlayer1.textContent = tieBreakPointsPlayer1;
  scoreDisplayPlayer2.textContent = tieBreakPointsPlayer2;
}

// Funzione per incrementare il game
function incrementGame(player) {
  // Resetta lo stato del Game Point per il nuovo game
  isGamePointPlayer1 = false;
  isGamePointPlayer2 = false;
  advantagePlayer = null;

  const currentGameCount1 = parseInt(winGame1.textContent, 10);
  const currentGameCount2 = parseInt(winGame2.textContent, 10);

  if (player === 1) {
    winGame1.textContent = currentGameCount1 + 1;
  } else if (player === 2) {
    winGame2.textContent = currentGameCount2 + 1;
  }
  totalGames++;

  // Attiva il tie-break se i game sono 6-6
  if (
    parseInt(winGame1.textContent, 10) === 6 &&
    parseInt(winGame2.textContent, 10) === 6
  ) {
    alert("inizio Tie Break");
    startTieBreak();
  } else {
    checkSetWinner(player);
  }

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
  isTieBreak = false;
  const matchSettings = JSON.parse(localStorage.getItem("matchSettings"));

  // Usa il numero di set definiti nelle impostazioni della partita
  if (winner === 1) {
    incrementSet(1, matchSettings.setCount, matchSettings);
  } else {
    incrementSet(2, matchSettings.setCount, matchSettings);
  }

  updateTieBreakDisplay();
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
function endMatch(winnerName) {
  localStorage.setItem("matchFinished", "true");
  localStorage.setItem("winner", winnerName); // Salviamo il vincitore

  // Disabilita tutti i pulsanti che incrementano il punteggio
  const buttons = document.querySelectorAll(
    ".btn-player1, .btn-erroreP1, .btn-aceP1, .btn-FalloP1, .btn-player2, .btn-erroreP2, .btn-aceP2, .btn-FalloP2"
  );
  buttons.forEach((button) => {
    button.disabled = true;
  });

  // Crea il messaggio "Fine Partita"
  const endMessage = document.createElement("div");
  endMessage.textContent = `Fine Partita - ${winnerName} ha vinto!`;
  endMessage.style.position = "fixed";
  endMessage.style.top = "50%";
  endMessage.style.left = "50%";
  endMessage.style.transform = "translate(-50%, -50%)";
  endMessage.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  endMessage.style.color = "white";
  endMessage.style.padding = "20px";
  endMessage.style.fontSize = "24px";
  endMessage.style.zIndex = "1000";
  document.body.appendChild(endMessage);
}

// Quando la pagina viene caricata, controlla se la partita è finita
window.addEventListener("DOMContentLoaded", () => {
  const matchFinished = localStorage.getItem("matchFinished");
  const winner = localStorage.getItem("winner");

  if (matchFinished === "true" && winner) {
    endMatch(winner); // Ricrea il messaggio di fine partita
  }
});
// Funzione per incrementare il set
function incrementSet(player, maxSets, matchSettings) {
  const setsToWin = Math.ceil(maxSets / 2);
  if (player === 1) {
    let currentSetWins = parseInt(winSet1.textContent, 10);
    currentSetWins++;
    winSet1.textContent = currentSetWins;

    if (currentSetWins === setsToWin) {
      // alert(`${matchSettings.nameP1} ha vinto la partita!`);
      totalGames = "Match Point";
      endMatch(matchSettings.nameP1);
      resetAll();
      // localStorage.removeItem("gameInProgress");
    } else {
      totalGames = 1;
      totalSet++;
      resetGameAndPoints();
    }
  } else if (player === 2) {
    let currentSetWins = parseInt(winSet2.textContent, 10);
    currentSetWins++;
    winSet2.textContent = currentSetWins;

    if (currentSetWins === setsToWin) {
      // alert(`${matchSettings.nameP2} ha vinto la partita!`);
      totalGames = "Match Point";
      endMatch(matchSettings.nameP1);
      resetAll();
      // localStorage.removeItem("gameInProgress");
    } else {
      totalGames = 1;
      totalSet++;
      resetGameAndPoints();
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

//player1
btnPlayer1.addEventListener("click", () => updateScore(1));
btnErrorPlayer1.addEventListener("click", () => updateScore(2));
btnAce1.addEventListener("click", () => updateScore(1));
btnAce1.addEventListener("click", () => updateScoreAce(1));
doubleFaultBtn1.addEventListener("click", () => updateScore(2));
//player2
btnPlayer2.addEventListener("click", () => updateScore(2));
btnErrorPlayer2.addEventListener("click", () => updateScore(1));
btnAce2.addEventListener("click", () => updateScore(2));
btnAce2.addEventListener("click", () => updateScoreAce(2));
doubleFaultBtn2.addEventListener("click", () => updateScore(1));

linkImp.addEventListener("click", () => {
  localStorage.setItem("gameInProgress", "false");
}); // Imposta a false per indicare che la partita non è in corso})

// Ascoltatore per iniziare una nuova partita
newMatch.addEventListener("click", () => {
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

  totalGames = 1;
  totalSet = 1;

  // 2. Pulisci il localStorage per eliminare le impostazioni della partita
  localStorage.setItem("gameInProgress", "false"); // Imposta a false per indicare che la partita non è in corso
  localStorage.removeItem("matchState");
  localStorage.removeItem("matchFinished");

  // 3. Cancella i video da IndexedDB
  deleteAllVideos();

  // 4. Ricarica la pagina per iniziare una nuova partita
  window.location.href = "index.html"; // Assicurati che questa sia la pagina di partenza
});

// Recupera le impostazioni della partita
const matchSettings = JSON.parse(localStorage.getItem("matchSettings"));

if (matchSettings) {
  // console.log("Impostazioni partita:", matchSettings);
  // Usa questi dati nella logica della partita
  const { nameMatch, nameP1, nameP2, gameCount, setCount } = matchSettings;

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
