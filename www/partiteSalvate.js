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
        matchInfo += `<h2>Match ${matchSettings.nameMatch || "Sconosciuto"}: ${
          match.winner
        } ha vinto!</h2>`;
        matchInfo += `<h3>${matchSettings.nameP1 || "Giocatore 1"} vs ${
          matchSettings.nameP2 || "Giocatore 2"
        }</h3>`;
        sets.forEach((set, setIndex) => {
          matchInfo += `<p>Set ${setIndex + 1}: ${
            matchSettings.nameP1 || "Giocatore 1"
          } - ${set.player1Games} | ${
            matchSettings.nameP2 || "Giocatore 2"
          } - ${set.player2Games}</p>`;
        });
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
