const firebaseConfig = {
  apiKey: "AIzaSyA5Cib2bfjmmARWwUCin44FdSKPPphvjQw",
  authDomain: "tennis-points-569a7.firebaseapp.com",
  databaseURL:
    "https://tennis-points-569a7-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tennis-points-569a7",
  storageBucket: "tennis-points-569a7.firebasestorage.app",
  messagingSenderId: "1043880828352",
  appId: "1:1043880828352:web:4864880850fab9d6bc7c25",
};
firebase.initializeApp(firebaseConfig);

function tennisScore(score) {
  const scores = ["0", "15", "30", "40", "A"];
  return scores[score] !== undefined ? scores[score] : score;
}

function startLive() {
  document.querySelector(".container-live").style.marginTop = "20px";
  const matchId = document.getElementById("matchIdInput").value;
  firebase
    .database()
    .ref("matches/" + matchId)
    .on("value", (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Crea la stringa dei set
        let setsHtml = "";
        if (data.sets && data.sets.length > 0) {
          setsHtml = "<h4>Set conclusi:</h4><ul>";
          data.sets.forEach((set, idx) => {
            let tieBreakScore = "";
            if (
              set.isTieBreak &&
              set.tieBreakPointsPlayer1 !== undefined &&
              set.tieBreakPointsPlayer2 !== undefined
            ) {
              tieBreakScore = ` (Tie-break ${set.tieBreakPointsPlayer1}-${set.tieBreakPointsPlayer2})`;
            } else if (set.isTieBreak) {
              tieBreakScore = " (Tie-break)";
            }
            setsHtml += `<li>Set ${idx + 1}: ${data.nameP1} ${
              set.player1Games
            } - ${data.nameP2} ${set.player2Games} ${tieBreakScore}</li>`;
          });
          setsHtml += "</ul>";
        }

        document.getElementById("liveScore").innerHTML = `
    <h2>Live Score!</h2>
    <h2>Partita: ${data.nameMatch}</h2>
    <h3>Set: ${data.currentSet}</h3>
    <h4> Servizio: ${
      data.currentService === 1
        ? `<span style="color:lightgreen">${data.nameP1}</span>`
        : `<span style="color:red">${data.nameP2}</span>`
    }</h4>
    <p>
        <strong>${data.nameP1}</strong>: 
    <span style="font-size:1.5em">
      ${
        data.isTieBreak
          ? `Tie-break: ${data.tieBreakPointsPlayer1}`
          : data.displayPlayer1 ?? tennisScore(data.scorePlayer1)
      }
    </span>
    <br>Set: ${data.winSet1} | Game: ${data.winGame1}
</p>
<p>
    <strong>${data.nameP2}</strong>: 
    <span style="font-size:1.5em">
      ${
        data.isTieBreak
          ? `Tie-break: ${data.tieBreakPointsPlayer2}`
          : data.displayPlayer2 ?? tennisScore(data.scorePlayer2)
      }
    </span>
    <br>Set: ${data.winSet2} | Game: ${data.winGame2}
</p>
    ${setsHtml}
  `;
      } else {
        document.getElementById("liveScore").innerText = "Partita non trovata";
      }
    });
}
