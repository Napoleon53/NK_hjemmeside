// Et link direkte til en animation (fx fra Kemibogen, slides eller OneNote)
// sendes videre til animationspanelet, hvor animationen åbner i fuld skærm
// (11. nov. 2026). Hver animation i menuen indlæser filen øverst i <head>:
//
//   <script src="../../til_panelet.js" data-panel="samling_alt.html" data-emne="c7.1"></script>
//
// data-panel er det ydre panel, data-emne knappens data-emne. Fanen (#c7) følger med.
// Skal en bestemt fane til et andet panel, gives den som data-hash-<fane>, fx
// data-hash-b="samling_alt_b.html?emne=b.spil.organiske".
//
// Intet sker
// - inde i panelet (animationen vises i en iframe),
// - når adressen har en forespørgsel, fx index.html?alene (viser animationen alene),
// - når fanen bærer data, fx #kort=... i Kort og godt,
// - uden for kemiformler.dk, så lokale test virker som før (?tilpanel tvinger det).
(function () {
    var s = document.currentScript;
    if (!s || window.top !== window.self) return;
    var lokalTest = location.search === '?tilpanel';
    if (!lokalTest) {
        if (location.search) return;
        if (!/(^|\.)kemiformler\.dk$/i.test(location.hostname)) return;
    }
    var fane = location.hash;
    if (fane.indexOf('=') !== -1) return;

    var saer = fane ? s.getAttribute('data-hash-' + fane.slice(1).toLowerCase()) : null;
    var panel;
    try {
        if (saer) {
            panel = new URL(saer, s.src);
        } else {
            panel = new URL(s.getAttribute('data-panel'), s.src);
            panel.search = '?emne=' + encodeURIComponent(s.getAttribute('data-emne'));
            panel.hash = fane;
        }
    } catch (e) { return; }
    location.replace(panel.href);
})();
