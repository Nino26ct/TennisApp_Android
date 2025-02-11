//Menu Hambuerger//
document.addEventListener("DOMContentLoaded", function () {
  const menu = document.getElementById("menu");
  const btn = document.getElementById("hamburger-btn");

  btn.addEventListener("click", function (event) {
    event.stopPropagation(); // Evita la chiusura immediata quando clicchi il pulsante
    menu.classList.toggle("show");
  });

  // Chiudi il menu se si clicca fuori
  document.addEventListener("click", function (event) {
    if (!menu.contains(event.target) && !btn.contains(event.target)) {
      menu.classList.remove("show");
    }
  });
});
