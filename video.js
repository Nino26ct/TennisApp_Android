// Variabili per la videocamera
const videoElement = document.getElementById("camera-view");
const startCameraButton = document.getElementById("start-camera");
const stopCameraButton = document.getElementById("stop-camera");
const cameraError = document.getElementById("camera-error");
const videoContainer = document.getElementById("video-container"); // Contenitore per i video salvati
const mostraNascondiVideoBtn = document.getElementById("mostraNascondiVideo");

let stream; // Flusso video
let mediaRecorder; // Oggetto per registrare il video
let recordedChunks = []; // Buffer per i chunk video
let isRecording = false; // Stato della registrazione
let isStoppingCamera = false; // Flag per evitare il salvataggio quando si spegne la fotocamera

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

  openDB((db) => {
    const transaction = db.transaction(DB_STORE, "readwrite");
    const store = transaction.objectStore(DB_STORE);
    store.add({ video: blob });

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
      request.result.forEach((data) => addVideoToPage(data.video, data.id));
    };
  });
}

// Funzione per aggiungere un video alla pagina
function addVideoToPage(blob, id) {
  const videoItem = document.createElement("video");
  videoItem.src = URL.createObjectURL(blob);
  videoItem.controls = true;
  videoItem.classList.add("video-salvati");

  // Crea un contenitore per il video
  const videoWrapper = document.createElement("div");
  videoWrapper.classList.add("video-wrapper");

  // Crea un link per scaricare il video
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = "video_" + new Date().toISOString() + ".webm";
  downloadLink.textContent = "Scarica video";

  // Pulsante di eliminazione
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Elimina";
  deleteButton.classList.add("delete-video");
  deleteButton.addEventListener("click", () => deleteVideo(id, videoWrapper));

  // Aggiunge video, link e pulsante al contenitore
  videoWrapper.appendChild(videoItem);
  videoWrapper.appendChild(downloadLink);
  videoWrapper.appendChild(deleteButton);
  videoContainer.appendChild(videoWrapper);
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
