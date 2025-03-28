document.addEventListener("DOMContentLoaded", () => {
  const savedMatchesContainer = document.getElementById("saved-matches");
  const finishedMatches =
    JSON.parse(localStorage.getItem("finishedMatches")) || [];

  function renderMatches() {
    if (finishedMatches.length > 0) {
      let matchInfo = "";
      finishedMatches.forEach((match, index) => {
        const sets = match.sets || [];
        const matchSettings = match.matchSettings || {};

        matchInfo += `<div id="match-${index}">`;
        matchInfo += `<h2 style="color: #f3ef16;">${
          matchSettings.nameMatch || "Sconosciuto"
        }:</h2> <h3 style="color: #f3ef16;">${
          matchSettings.nameP1 || "Giocatore 1"
        } vs ${matchSettings.nameP2 || "Giocatore 2"}</h3>`;

        sets.forEach((set, setIndex) => {
          let bgColor = setIndex % 2 === 0 ? "#222831" : "#393E46"; // Alterna i colori di sfondo
          matchInfo += `<div style="background-color: ${bgColor}; padding: 10px; border-radius: 10px; margin: 10px 0;">`;
          matchInfo += `<p style="color: #EEEEEE;">Set ${setIndex + 1}: ${
            matchSettings.nameP1 || "Giocatore 1"
          } - ${set.player1Games} VS ${
            matchSettings.nameP2 || "Giocatore 2"
          } - ${set.player2Games}</p>`;

          // Aggiungi il punteggio del tie-break se presente per il set
          if (set.isTieBreak) {
            matchInfo += `<p style="color: orange; font-weight: bold;">Tie-Break Set ${
              setIndex + 1
            }: ${set.tieBreakPointsPlayer1 || 0} - ${
              set.tieBreakPointsPlayer2 || 0
            }</p>`;
          }

          matchInfo += `</div>`; // Chiusura del div per il set
        });

        matchInfo += `<h2 style="color: red">${match.winner} ha vinto!</h2>`;
        matchInfo += `<button onclick="deleteMatch(${index})">Elimina</button>`;
        matchInfo += "<hr></div>";
      });
      savedMatchesContainer.innerHTML = matchInfo;
    } else {
      savedMatchesContainer.innerHTML = "<p>Nessuna partita salvata.</p>";
    }
  }

  window.deleteMatch = function (index) {
    finishedMatches.splice(index, 1);
    localStorage.setItem("finishedMatches", JSON.stringify(finishedMatches));
    renderMatches();
  };

  renderMatches();
});
