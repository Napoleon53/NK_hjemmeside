/* Mobilmenu. Siden fungerer fuldt ud uden denne fil - den goer blot
   hamburger-knappen aktiv paa smalle skaerme. */
(function () {
  var knap = document.querySelector('.menu-knap');
  var menu = document.getElementById('hovedmenu');
  if (!knap || !menu) return;

  function luk() {
    menu.classList.remove('aaben');
    knap.setAttribute('aria-expanded', 'false');
  }

  knap.addEventListener('click', function () {
    var aaben = menu.classList.toggle('aaben');
    knap.setAttribute('aria-expanded', aaben ? 'true' : 'false');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('aaben')) {
      luk();
      knap.focus();
    }
  });

  document.addEventListener('click', function (e) {
    if (menu.classList.contains('aaben') && !menu.contains(e.target) && !knap.contains(e.target)) luk();
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 860) luk();
  });
})();
