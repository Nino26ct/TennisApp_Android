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
    // Rimuovi la chiamata a saveVideo da qui *** // Salva il video solo se non si sta spegnendo la fotocamera
  };

  mediaRecorder.start(); // Avvia la registrazione
  isRecording = true;
}

// Funzione per fermare la registrazione e salvare il video
function stopAndSaveRecording(actionText) {
  if (isRecording && mediaRecorder.state !== "inactive") {
    isStoppingCamera = false;
    mediaRecorder.stop();
    isRecording = false;

    setTimeout(() => startRecording(), 500); // Riparte la registrazione

    // Salviamo il video con l'azione specifica
    saveVideo(actionText);
  }
}

// Funzione per salvare il video
function saveVideo(actionText) {
  const blob = new Blob(recordedChunks, { type: mediaRecorder.mimeType });
  const matchState = JSON.parse(localStorage.getItem("matchState"));
  const matchSettings = JSON.parse(localStorage.getItem("matchSettings"));
  const matchId = localStorage.getItem("currentMatchId");

  openDB((db) => {
    const transaction = db.transaction(DB_STORE, "readwrite");
    const store = transaction.objectStore(DB_STORE);
    store.add({
      video: blob,
      matchState: matchState,
      matchSettings: matchSettings,
      matchId: matchId,
      actionText: actionText, // Salva l'azione specifica
      hidden: false,
    });

    transaction.oncomplete = () => {
      loadSavedVideos();
    };
  });
}

// Funzione per caricare i video salvati
function loadSavedVideos() {
  const matchId = localStorage.getItem("currentMatchId"); // Ottieni l'identificatore della partita corrente

  openDB((db) => {
    const transaction = db.transaction(DB_STORE, "readonly");
    const store = transaction.objectStore(DB_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      request.result.forEach((data) => {
        if (!data.hidden && data.matchId === matchId) {
          // Mostra solo i video non nascosti e appartenenti alla partita corrente
          addVideoToPage(
            data.video,
            data.id,
            data.matchState,
            data.matchSettings,
            data.actionText
          );
        }
      });
    };
  });
}

function addVideoToPage(blob, id, matchState, matchSettings, actionText) {
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
       <span class="action-text">${actionText}</span>
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

// Carica i video salvati quando la pagina viene caricata
document.addEventListener("DOMContentLoaded", loadSavedVideos);

//FUNZIONE PER ELIMINARE TUTTI I VIDEO CON NUOVA PARTITA
function deleteAllVideos() {
  openDB((db) => {
    const transaction = db.transaction(DB_STORE, "readwrite");
    const store = transaction.objectStore(DB_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      const videos = request.result;
      videos.forEach((video) => {
        video.hidden = true; // Imposta la proprietà hidden su true
        store.put(video); // Aggiorna l'oggetto nel database
      });
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
    ".btn-player1, .btn-player2, .btn-aceP1, .btn-FalloP1, .btn-erroreP1, .btn-aceP2, .btn-FalloP2, .btn-erroreP2, .btn-DoppioFalloP1, .btn-DoppioFalloP2"
  )
  .forEach((button) => {
    button.addEventListener("click", (event) => {
      let actionText = "";
      const matchSettings = JSON.parse(localStorage.getItem("matchSettings"));
      const nameP1 = matchSettings.nameP1 || "Player 1";
      const nameP2 = matchSettings.nameP2 || "Player 2";

      // Controlla quale bottone è stato premuto
      if (event.target.classList.contains("btn-player1"))
        actionText = `Punto: ${nameP1}`;
      if (event.target.classList.contains("btn-player2"))
        actionText = `Punto: ${nameP2}`;
      if (event.target.classList.contains("btn-aceP1"))
        actionText = `Ace: ${nameP1}`;
      if (event.target.classList.contains("btn-erroreP1"))
        actionText = `Errore Forzato: ${nameP1}`;
      if (event.target.classList.contains("btn-aceP2"))
        actionText = `Ace: ${nameP2}`;
      if (event.target.classList.contains("btn-erroreP2"))
        actionText = `Errore Forzato: ${nameP2}`;
      if (event.target.classList.contains("btn-FalloP1"))
        actionText = `Fallo: ${nameP1}`;
      if (event.target.classList.contains("btn-DoppioFalloP1"))
        actionText = `Doppio Fallo: ${nameP1}`;
      if (event.target.classList.contains("btn-FalloP2"))
        actionText = `Fallo: ${nameP2}`;
      if (event.target.classList.contains("btn-DoppioFalloP2"))
        actionText = `Doppio Fallo: ${nameP2}`;

      // Chiama `stopAndSaveRecording` solo se `actionText` è definito e non è un primo fallo
      if (actionText) {
        stopAndSaveRecording(actionText);
      }
    });
  });

//Video Salvati ********//
function loadAllVideos() {
  openDB((db) => {
    const transaction = db.transaction(DB_STORE, "readonly");
    const store = transaction.objectStore(DB_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      const savedVideosContainer = document.getElementById("saved-videos");
      const videosByMatch = {};

      // Raggruppa i video per partita
      request.result.forEach((data) => {
        if (!videosByMatch[data.matchId]) {
          videosByMatch[data.matchId] = [];
        }
        videosByMatch[data.matchId].push(data);
      });

      // Aggiungi i video raggruppati alla pagina
      if (Object.keys(videosByMatch).length === 0) {
        const noVideosMessage = document.createElement("p");
        noVideosMessage.textContent = "Nessun video salvato";
        savedVideosContainer.appendChild(noVideosMessage);
      } else {
        Object.keys(videosByMatch).forEach((matchId) => {
          const matchContainer = document.createElement("div");
          matchContainer.classList.add("match-container");
          matchContainer.setAttribute("data-match-id", matchId);

          // Ottieni il nome del match dai matchSettings
          const matchName =
            videosByMatch[matchId][0].matchSettings.nameMatch ||
            `Partita ${matchId}`;
          const matchTitle = document.createElement("h3");
          matchTitle.textContent = matchName;
          matchContainer.appendChild(matchTitle);

          // Aggiungi pulsante di eliminazione della partita
          const deleteMatchButton = document.createElement("button");
          deleteMatchButton.textContent = "Elimina Partita";
          deleteMatchButton.classList.add("delete-match-button");
          deleteMatchButton.addEventListener("click", () =>
            deleteMatch(matchId, matchContainer)
          );
          matchContainer.appendChild(deleteMatchButton);

          videosByMatch[matchId].forEach((data) => {
            addVideoToPageForVideoSalvati(
              data.video,
              data.id,
              data.matchState,
              data.matchSettings,
              matchContainer,
              data.actionText
            );
          });
          savedVideosContainer.appendChild(matchContainer);
          const hr = document.createElement("hr");
          savedVideosContainer.appendChild(hr);
        });
      }
    };

    request.onerror = () => {
      console.error("Error retrieving videos from database:", request.error);
    };
  });
}

function deleteMatch(matchId, matchContainer) {
  openDB((db) => {
    const transaction = db.transaction(DB_STORE, "readwrite");
    const store = transaction.objectStore(DB_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      const videos = request.result;
      videos.forEach((video) => {
        if (video.matchId === matchId) {
          store.delete(video.id); // Elimina ogni video associato alla partita
        }
      });

      transaction.oncomplete = () => {
        matchContainer.remove(); // Rimuovi il contenitore della partita dalla pagina
      };
    };

    request.onerror = (event) => {
      console.error(
        "Errore nell'eliminazione della partita:",
        event.target.error
      );
    };
  });
}

function addVideoToPageForVideoSalvati(
  blob,
  id,
  matchState,
  matchSettings,
  matchContainer,
  actionText
) {
  const nameP1 = matchSettings.nameP1 || "Pippo";
  const nameP2 = matchSettings.nameP2 || "Pippa";
  const scoreDisplayPlayer1 = matchState.scoreDisplayPlayer1 || "0";
  const scoreDisplayPlayer2 = matchState.scoreDisplayPlayer2 || "0";
  const totalGames = matchState.totalGames || "1";
  const currentSetWins = matchState.currentSetWins || 1;
  const setCount = matchState.setCount || 1; // Usa setCount specifico per ogni partita

  // Recuperiamo o creiamo il contenitore generale per tutti i set
  let setsContainer = matchContainer.querySelector(".sets-container");
  if (!setsContainer) {
    setsContainer = document.createElement("div");
    setsContainer.classList.add("sets-container");
    matchContainer.appendChild(setsContainer);
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
          <span class="action-text">${actionText}</span>
        `;

    // Aggiungi icona video alle info
    matchInfo.appendChild(videoIcon);

    // Aggiungi pulsante di eliminazione con icona di cestino
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    deleteButton.style.backgroundColor = "red"; // Imposta il colore del pulsante su rosso

    // Usa SVG invece di un'immagine esterna
    deleteButton.innerHTML = `
       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
           <polyline points="3 6 5 6 21 6"></polyline>
           <path d="M19 6L18.5 19A2 2 0 0 1 16.5 21H7.5A2 2 0 0 1 5.5 19L5 6"></path>
           <line x1="10" y1="11" x2="10" y2="17"></line>
           <line x1="14" y1="11" x2="14" y2="17"></line>
           <path d="M9 6V3h6v3"></path>
       </svg>
   `;

    deleteButton.addEventListener("click", () => deleteVideo(id, matchInfo));

    // Aggiungi pulsante di eliminazione alle info
    matchInfo.appendChild(deleteButton);

    // Aggiungi info del match al contenitore del game
    gameContainer.querySelector(".game-content").appendChild(matchInfo);
  }
}

function deleteVideo(id, matchInfo) {
  openDB((db) => {
    const transaction = db.transaction(DB_STORE, "readwrite");
    const store = transaction.objectStore(DB_STORE);
    store.delete(id);

    transaction.oncomplete = () => {
      const gameContainer = matchInfo.closest(".game-container");
      const setWrapper = gameContainer.closest(".set-wrapper");
      const setContent = setWrapper.querySelector(".set-content");
      const matchContainer = setWrapper.closest(".match-container");

      matchInfo.remove(); // Rimuovi l'elemento dalla pagina

      // Verifica se ci sono altri video nel game
      if (gameContainer.querySelectorAll(".match-info").length === 0) {
        gameContainer.remove(); // Rimuovi il game se non ci sono altri video

        // Verifica se ci sono altri game nel set
        if (setContent.querySelectorAll(".game-container").length === 0) {
          setWrapper.remove(); // Rimuovi il set se non ci sono altri game

          // Verifica se ci sono altri set nella partita
          if (matchContainer.querySelectorAll(".set-wrapper").length === 0) {
            matchContainer.remove(); // Rimuovi il nome della partita se non ci sono altri set
          }
        }
      }
    };

    transaction.onerror = (event) => {
      console.error(
        "Errore nell'eliminazione del video:",
        event.target.errorCode
      );
    };
  });
}
