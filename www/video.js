// Variabili per la videocamera
const videoDiv = document.getElementById("camera-container");
const videoElement = document.getElementById("camera-view");
const startCameraButton = document.getElementById("start-camera");
const stopCameraButton = document.getElementById("stop-camera");
const cameraError = document.getElementById("camera-error");
const videoContainer = document.getElementById("video-container"); // Contenitore per i video salvati
const mostraNascondiVideoBtn = document.getElementById("mostraNascondiVideo");
const mostraNascondiCameraBtn = document.getElementById("mostraNascondiCamera");
const campoPunteggio = document.getElementById("sezione-punti");

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
    campoPunteggio.style.height = "70vh";
  } else {
    // Mostra la videocamera
    startCameraButton.classList.remove("hidden");
    stopCameraButton.classList.remove("hidden");
    videoDiv.classList.remove("hidden");
    mostraNascondiCameraBtn.textContent = "Nascondi Camera"; // Cambia il testo del bottone
    campoPunteggio.style.height = "";
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
  videoContainer.innerHTML = ""; // Pulisce i video precedenti

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

// Funzione per aggiungere un video alla pagina
function addVideoToPage(blob, id, matchState, matchSettings) {
  // Crea un contenitore per il video
  const videoWrapper = document.createElement("div");
  videoWrapper.classList.add("video-wrapper");

  // Creazione dell'icona del video
  const videoIcon = document.createElement("img");
  videoIcon.src = "iconaVideo.webp"; // Sostituisci con l'URL della tua icona video
  videoIcon.classList.add("video-icon");
  videoIcon.alt = "Video salvato";
  videoIcon.addEventListener("click", () => openVideoPopup(blob));

  // Recupera il punteggio dai dati salvati
  const nameP1 = matchSettings.nameP1 || "Pippo";
  const nameP2 = matchSettings.nameP2 || "Pippa";
  const scoreDisplayPlayer1 = matchState.scoreDisplayPlayer1 || "0"; // Se non c'è, metti 0
  const scoreDisplayPlayer2 = matchState.scoreDisplayPlayer2 || "0"; // Se non c'è, metti 0
  const winSet1 = matchState.winSet1 || "0";
  const winSet2 = matchState.winSet2 || "0";
  const winGame1 = matchState.winGame1 || "0";
  const winGame2 = matchState.winGame2 || "0";
  // Aggiungi il testo dello stato del match
  const matchInfo = document.createElement("div");
  matchInfo.classList.add("score-in-video");

  // Struttura del menu a cascata
  matchInfo.innerHTML = `
     <div class="dropdown">
    <button class="dropbtn">Punteggio ▼</button>
    <div class="dropdown-content" style="display: none;">
    <p>Set: ${winSet1} <span> Game: ${winGame1} </span> <span>${nameP1} - ${scoreDisplayPlayer1}</span> </p>      
    <p>Set: ${winSet2} <span> Game: ${winGame2} </span> <span>${nameP2} - ${scoreDisplayPlayer2}</span> </p>

    </div>
  </div>
`;

  // Evento per aprire il punteggio
  matchInfo.querySelector(".dropbtn").addEventListener("click", function () {
    const dropdownContent = matchInfo.querySelector(".dropdown-content");
    dropdownContent.style.display =
      dropdownContent.style.display === "none" ? "block" : "none";
  });

  // Crea un link per scaricare il video
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = "video_" + new Date().toISOString() + ".webm";
  downloadLink.innerHTML = '<i class="fas fa-arrow-down"></i>';

  // Pulsante di eliminazione
  const deleteButton = document.createElement("button");
  deleteButton.innerHTML = `<i class="fas fa-trash"></i>`;
  deleteButton.classList.add("delete-video");
  deleteButton.addEventListener("click", () => deleteVideo(id, videoWrapper));

  // Aggiunge video, link e pulsante al contenitore
  videoWrapper.appendChild(videoIcon);
  videoWrapper.appendChild(matchInfo); // Mostra informazioni sul match
  videoWrapper.appendChild(downloadLink);
  videoWrapper.appendChild(deleteButton);
  videoContainer.appendChild(videoWrapper);
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

// Recupera lo stato di visibilità dal localStorage
document.addEventListener("DOMContentLoaded", () => {
  const isHidden = localStorage.getItem("videoContainerHidden") === "true";
  videoContainer.style.display = isHidden ? "none" : "flex";
  mostraNascondiVideoBtn.textContent = isHidden
    ? "Mostra Video"
    : "Nascondi Video";
});

// Per mostrare o nascondere i video e salvare lo stato
mostraNascondiVideoBtn.addEventListener("click", () => {
  const isCurrentlyHidden = videoContainer.style.display === "none";

  videoContainer.style.display = isCurrentlyHidden ? "flex" : "none";
  mostraNascondiVideoBtn.textContent = isCurrentlyHidden
    ? "Nascondi Video"
    : "Mostra Video";

  // Salva lo stato nel localStorage
  localStorage.setItem("videoContainerHidden", isCurrentlyHidden);
});

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
