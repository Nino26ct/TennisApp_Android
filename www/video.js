// Variabili per la videocamera
const videoDiv = document.getElementById("camera-container");
const videoElement = document.getElementById("camera-view");
const startCameraButton = document.getElementById("start-camera");
const stopCameraButton = document.getElementById("stop-camera");
const cameraError = document.getElementById("camera-error");
const mostraNascondiCameraBtn = document.getElementById("mostraNascondiCamera");
const campoPunteggio = document.getElementById("sezione-punti");
const setContainer = document.getElementById("set-container");

let stream; // Flusso video
let mediaRecorder; // Oggetto per registrare il video
let recordedChunks = []; // Buffer per i chunk video
let isRecording = false; // Stato della registrazione
let isStoppingCamera = false; // Flag per evitare il salvataggio quando si spegne la fotocamera

// Funzione per nascondere o mostrare la videocamera
mostraNascondiCameraBtn.addEventListener("click", () => {
  // Se la registrazione è in corso, non nascondiamo la videocamera
  if (isRecording) {
    alert("La registrazione è in corso. Non puoi nascondere la videocamera.");
    return;
  }
  const isCameraVisible = !videoDiv.classList.contains("hidden"); // Verifica se la videocamera è visibile

  if (isCameraVisible) {
    // Nasconde la videocamera
    startCameraButton.classList.add("hidden");
    stopCameraButton.classList.add("hidden");
    videoDiv.classList.add("hidden");
    mostraNascondiCameraBtn.textContent = "Mostra Camera"; // Cambia il testo del bottone
  } else {
    // Mostra la videocamera
    startCameraButton.classList.remove("hidden");
    stopCameraButton.classList.remove("hidden");
    videoDiv.classList.remove("hidden");
    mostraNascondiCameraBtn.textContent = "Nascondi Camera"; // Cambia il testo del bottone
    mostraNascondiCameraBtn.style.zIndex = "10";
  }
});

// Funzione per avviare la videocamera e iniziare la registrazione
async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }, // Apertura videocamera posteriore
      audio: false,
    });
    videoElement.srcObject = stream;
    startCameraButton.style.display = "none";
    stopCameraButton.style.display = "inline-block";
    cameraError.style.display = "none";

    startRecording(); // Avvia automaticamente la registrazione
  } catch (error) {
    console.error("Errore nell'accesso alla videocamera:", error);
    cameraError.style.display = "block";
    cameraError.textContent = "Errore: " + error.message;
  }
}

// Funzione per avviare la registrazione
function startRecording() {
  let options;
  if (MediaRecorder.isTypeSupported("video/webm")) {
    options = { mimeType: "video/webm" };
  } else if (MediaRecorder.isTypeSupported("video/mp4")) {
    options = { mimeType: "video/mp4" };
  } else {
    console.error("Formato video non supportato dal browser.");
    return;
  }

  recordedChunks = []; // Reset dei chunk precedenti
  mediaRecorder = new MediaRecorder(stream, options);

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = () => {
    if (!isStoppingCamera) {
      saveVideo(); // Salva il video solo se non si sta spegnendo la fotocamera
    }
  };

  mediaRecorder.start(); // Avvia la registrazione
  isRecording = true;
}

// Funzione per fermare la registrazione e salvare il video
function stopAndSaveRecording() {
  if (isRecording && mediaRecorder.state !== "inactive") {
    isStoppingCamera = false; // Stiamo fermando la registrazione per salvarla
    mediaRecorder.stop();
    isRecording = false;

    // Dopo aver fermato, riparte automaticamente
    setTimeout(startRecording, 500); // Attendere un attimo e ripartire
  }
}

// Apri il database IndexedDB
const DB_NAME = "VideoDB";
const DB_STORE = "videos";

function openDB(callback) {
  const request = indexedDB.open(DB_NAME, 1);

  request.onupgradeneeded = (event) => {
    let db = event.target.result;
    if (!db.objectStoreNames.contains(DB_STORE)) {
      db.createObjectStore(DB_STORE, { keyPath: "id", autoIncrement: true });
    }
  };

  request.onsuccess = () => {
    callback(request.result);
  };

  request.onerror = (event) => {
    console.error("Errore IndexedDB:", event.target.errorCode);
  };
}

// Funzione per salvare il video
function saveVideo() {
  const blob = new Blob(recordedChunks, { type: mediaRecorder.mimeType });

  // Ottieni lo stato del match
  const matchState = JSON.parse(localStorage.getItem("matchState"));
  const matchSettings = JSON.parse(localStorage.getItem("matchSettings"));
  openDB((db) => {
    const transaction = db.transaction(DB_STORE, "readwrite");
    const store = transaction.objectStore(DB_STORE);
    store.add({
      video: blob,
      matchState: matchState,
      matchSettings: matchSettings, // Aggiungi lo stato del match
    });

    transaction.oncomplete = () => {
      loadSavedVideos(); // Aggiorna la lista dei video sulla pagina
    };
  });
}

// Funzione per caricare i video salvati
function loadSavedVideos() {
  openDB((db) => {
    const transaction = db.transaction(DB_STORE, "readonly");
    const store = transaction.objectStore(DB_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      request.result.forEach((data) =>
        addVideoToPage(data.video, data.id, data.matchState, data.matchSettings)
      );
    };
  });
}

//  // Variabile per tenere traccia dell'ultimo valore di totalGames

function addVideoToPage(blob, id, matchState, matchSettings) {
  const nameP1 = matchSettings.nameP1 || "Pippo";
  const nameP2 = matchSettings.nameP2 || "Pippa";
  const scoreDisplayPlayer1 = matchState.scoreDisplayPlayer1 || "0";
  const scoreDisplayPlayer2 = matchState.scoreDisplayPlayer2 || "0";
  const totalGames = matchState.totalGames || "1";
  const currentSetWins = matchState.currentSetWins || 1; // Usa currentSet

  // Recupera il numero totale di set dal localStorage
  const savedSettings = JSON.parse(localStorage.getItem("matchSettings")) || {};
  const setCount = savedSettings.setCount || 1; // Default 1 set

  // Recuperiamo o creiamo il contenitore generale per tutti i set
  let setsContainer = document.querySelector(".sets-container");
  if (!setsContainer) {
    setsContainer = document.createElement("div");
    setsContainer.classList.add("sets-container");
    document.body.appendChild(setsContainer);
  }

  // Creiamo i set mancanti fino al numero di setCount
  for (let setNumber = 1; setNumber <= setCount; setNumber++) {
    let setWrapper = setsContainer.querySelector(
      `.set-wrapper[data-set="${setNumber}"]`
    );

    if (!setWrapper) {
      setWrapper = document.createElement("div");
      setWrapper.classList.add("set-wrapper");
      setWrapper.setAttribute("data-set", setNumber);

      // Bottone "Set X"
      const setButton = document.createElement("button");
      setButton.innerText = `Set: ${setNumber}`;
      setButton.classList.add("set-button");

      // Contenitore dei game per questo set
      const setContent = document.createElement("div");
      setContent.classList.add("set-content", "hidden");

      // Toggle per mostrare/nascondere i game
      setButton.addEventListener("click", () => {
        setContent.classList.toggle("hidden");
      });

      setWrapper.appendChild(setButton);
      setWrapper.appendChild(setContent);
      setsContainer.appendChild(setWrapper);
    }
  }

  // Recuperiamo il contenitore del set corretto
  let setWrapper = setsContainer.querySelector(
    `.set-wrapper[data-set="${currentSetWins}"]`
  );
  let setContent = setWrapper.querySelector(".set-content");

  // Recuperiamo o creiamo il contenitore per il game
  let gameContainer = setContent.querySelector(
    `div[data-game="${totalGames}"]`
  );
  if (!gameContainer) {
    gameContainer = document.createElement("div");
    gameContainer.classList.add("game-container");
    gameContainer.setAttribute("data-game", totalGames);

    // Bottone "Game X"
    const gameButton = document.createElement("button");
    gameButton.classList.add("game-button");
    gameButton.innerText = `Game ${totalGames}`;

    // Contenitore per le info del game
    const gameContent = document.createElement("div");
    gameContent.classList.add("game-content", "hidden");

    // Toggle per mostrare/nascondere il game
    gameButton.addEventListener("click", (event) => {
      event.stopPropagation();
      gameContent.classList.toggle("hidden");
    });

    gameContainer.appendChild(gameButton);
    gameContainer.appendChild(gameContent);
    setContent.appendChild(gameContainer);
  }

  // Verifica se le info per questo game sono già presenti
  let existingMatchInfo = gameContainer.querySelector(
    `.match-info[data-id="${id}"]`
  );
  if (!existingMatchInfo) {
    // Creazione dell'icona del video
    const videoIcon = document.createElement("img");
    videoIcon.src = "iconaVideo.webp";
    videoIcon.classList.add("video-icon");
    videoIcon.alt = "Video salvato";
    videoIcon.addEventListener("click", () => openVideoPopup(blob));

    // Creazione delle info del match
    const matchInfo = document.createElement("div");
    matchInfo.classList.add("match-info");
    matchInfo.setAttribute("data-id", id);
    matchInfo.innerHTML = `
      <span>${nameP1} - <span class="scoreDisplayPlayer1">${scoreDisplayPlayer1}</span></span> <span class="vs">VS</span>
      <span>${nameP2} - <span class="scoreDisplayPlayer2">${scoreDisplayPlayer2}</span></span>
    `;

    // Aggiungi icona video alle info
    matchInfo.appendChild(videoIcon);

    // Aggiungi info del match al contenitore del game
    gameContainer.querySelector(".game-content").appendChild(matchInfo);
  }
}

function saveMatchInfoToDatabase(blob, id, matchState, matchSettings) {
  // Aggiungi il matchInfo a IndexedDB
  openDB((db) => {
    const transaction = db.transaction(DB_STORE, "readwrite");
    const store = transaction.objectStore(DB_STORE);
    store.put({
      id: id,
      video: blob,
      matchState: matchState,
      matchSettings: matchSettings,
    });
    transaction.oncomplete = () => console.log("Match info saved to IndexedDB");
  });
}

// Funzione per aprire il pop-up con il video
function openVideoPopup(blob) {
  const popup = document.createElement("div");
  popup.classList.add("video-popup");

  // Creazione del video
  const videoElement = document.createElement("video");
  videoElement.src = URL.createObjectURL(blob);
  videoElement.controls = true;
  videoElement.autoplay = true;
  videoElement.classList.add("popup-video");

  // Pulsante di chiusura
  const closeButton = document.createElement("button");
  closeButton.textContent = "✖";
  closeButton.classList.add("close-popup");
  closeButton.addEventListener("click", () => {
    document.body.removeChild(popup);
  });

  // Aggiungere gli elementi al pop-up
  popup.appendChild(videoElement);
  popup.appendChild(closeButton);
  document.body.appendChild(popup);
}

// Funzione per eliminare un video salvato
function deleteVideo(id, videoElement) {
  openDB((db) => {
    const transaction = db.transaction(DB_STORE, "readwrite");
    const store = transaction.objectStore(DB_STORE);
    store.delete(id);

    transaction.oncomplete = () => {
      videoElement.remove();
    };
  });
}

// Carica i video salvati quando la pagina viene caricata
document.addEventListener("DOMContentLoaded", loadSavedVideos);

//FUNZIONE PER ELIMINARE TUTTI I VIDEO CON NUOVA PARTITA
function deleteAllVideos() {
  openDB((db) => {
    const transaction = db.transaction(DB_STORE, "readwrite");
    const store = transaction.objectStore(DB_STORE);
    const request = store.clear(); // Cancella tutti i dati dallo store

    request.onsuccess = () => {
      //   console.log("Tutti i video eliminati da IndexedDB");
    };

    request.onerror = (event) => {
      console.error(
        "Errore nella cancellazione dei video:",
        event.target.error
      );
    };
  });
}

// Ferma la videocamera e interrompe la registrazione **senza salvare il video**
stopCameraButton.addEventListener("click", () => {
  if (stream) {
    isStoppingCamera = true; // Indica che stiamo spegnendo la fotocamera
    if (isRecording && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop(); // Ferma la registrazione, ma senza salvare
    }
    stream.getTracks().forEach((track) => track.stop());
    videoElement.srcObject = null;
    stream = null;

    // Aggiorna lo stato della registrazione
    isRecording = false; // Assicura che il flag venga aggiornato quando la registrazione è fermata
  }
  startCameraButton.style.display = "inline-block";
  stopCameraButton.style.display = "none";
});

// Avvia la videocamera al click
startCameraButton.addEventListener("click", startCamera);

// Assegna la funzione `stopAndSaveRecording()` a tutti i pulsanti della partita
document
  .querySelectorAll(
    ".btn-player1, .btn-player2, .btn-aceP1, .btn-FalloP1, .btn-erroreP1, .btn-aceP2, .btn-FalloP2, .btn-erroreP2"
  )
  .forEach((button) => button.addEventListener("click", stopAndSaveRecording));
