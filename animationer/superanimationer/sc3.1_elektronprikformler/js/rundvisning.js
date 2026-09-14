/* =====================================================================
   rundvisning.js - spotlight-rundvisningen bag "?"-knappen

   Peger på ét element ad gangen og lukker sig selv, hvis eleven klikker
   udenfor eller trykker Esc. Samme opskrift som sc1.1_atombygger.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TRIN_KANDIDATER = [
        { sel: "#opgave-menu", tekst: "Vælg molekylet her. Det blå felt er den opgave, du er i gang med, og grøn skrift betyder, at opgaven er løst." },
        { sel: "#opsaetning-overlay", tekst: "Find atomet i det periodiske system, og klik på den firkant, der viser antallet af elektroner i dets yderste skal (valenselektroner)." },
        { sel: "footer", tekst: "Træk atomerne sammen for at danne bindinger. Klik på en binding for at skifte mellem enkelt-, dobbelt- og tripelbinding. Sidder du fast, kan du bede om et hint. Tryk \"Tjek svar\", når alle atomer opfylder oktetreglen." }
    ];

    var trin = [], trinIdx = 0, baggrund = null, boble = null;

    function elementErSynligt(sel) {
        var e = document.querySelector(sel);
        if (!e) return false;
        var r = e.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
    }

    NK.startRundvisning = function () {
        trin = TRIN_KANDIDATER.filter(function (t) { return elementErSynligt(t.sel); });
        if (!trin.length) return;
        if (!baggrund) {
            baggrund = document.createElement("div");
            baggrund.id = "rundvisning-baggrund";
            document.body.appendChild(baggrund);
            boble = document.createElement("div");
            boble.id = "rundvisning-boble";
            document.body.appendChild(boble);
        }
        visTrin(0);
    };

    function visTrin(i) {
        trinIdx = i;
        var t = trin[i];
        var maal = document.querySelector(t.sel);
        if (!maal) { afslutRundvisning(); return; }

        var r = maal.getBoundingClientRect();
        var p = 6;
        var x1 = Math.max(r.left - p, 0), y1 = Math.max(r.top - p, 0);
        var x2 = Math.min(r.right + p, window.innerWidth), y2 = Math.min(r.bottom + p, window.innerHeight);
        var poly = "polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, " +
            x1 + "px " + y1 + "px, " + x2 + "px " + y1 + "px, " + x2 + "px " + y2 + "px, " + x1 + "px " + y2 + "px, " + x1 + "px " + y1 + "px, 0 0)";
        baggrund.style.clipPath = poly;
        baggrund.style.webkitClipPath = poly;

        var sidste = i === trin.length - 1;
        var forrigeHtml = i > 0 ? '<button class="rundvisning-knap svag" id="rundvisning-forrige">◀ Forrige</button>' : "";
        boble.innerHTML =
            '<div class="rundvisning-taeller">Trin ' + (i + 1) + " af " + trin.length + "</div>" +
            '<div class="rundvisning-tekst">' + t.tekst + "</div>" +
            '<div class="rundvisning-nav">' +
            '<button class="rundvisning-knap svag" id="rundvisning-afslut">Afslut</button>' +
            '<div style="display:flex; gap:8px;">' + forrigeHtml +
            '<button class="rundvisning-knap" id="rundvisning-naeste">' + (sidste ? "Afslut ✔" : "Næste ▶") + "</button>" +
            "</div></div>";

        NK.el("rundvisning-afslut").addEventListener("click", afslutRundvisning);
        if (i > 0) NK.el("rundvisning-forrige").addEventListener("click", function () { visTrin(i - 1); });
        NK.el("rundvisning-naeste").addEventListener("click", function () { sidste ? afslutRundvisning() : visTrin(i + 1); });

        var br = boble.getBoundingClientRect();
        var top = y2 + 14;
        if (top + br.height > window.innerHeight - 10) {
            top = y1 - br.height - 14;
            if (top < 10) top = 10;
        }
        var left = r.left + r.width / 2 - br.width / 2;
        left = Math.max(10, Math.min(left, window.innerWidth - br.width - 10));
        boble.style.top = top + "px";
        boble.style.left = left + "px";
    }

    function afslutRundvisning() {
        if (baggrund) { baggrund.remove(); baggrund = null; }
        if (boble) { boble.remove(); boble = null; }
    }

    document.addEventListener("keydown", function (e) {
        if (!baggrund) return;
        if (e.key === "Escape") { afslutRundvisning(); return; }
        if (e.key === "ArrowRight" || e.key === "Enter") {
            if (trinIdx < trin.length - 1) visTrin(trinIdx + 1); else afslutRundvisning();
        } else if (e.key === "ArrowLeft") {
            if (trinIdx > 0) visTrin(trinIdx - 1);
        }
    });
}());
