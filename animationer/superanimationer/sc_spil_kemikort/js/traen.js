/* =====================================================================
   traen.js - fane 1: Træn

   Ét kort ad gangen. Eleven ser den ene side, gætter selv og vender
   kortet. Kunne han det, ryger kortet ud af bunken; kunne han det ikke,
   kommer det igen lidt senere i den samme runde. Runden er slut, naar
   alle kort er kommet ud af bunken.

   Kortene, eleven misser, taelles og staar i panelet, saa han kan se,
   hvilke der driller.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var el = NK.el;

    var T = NK.Traen = {};

    var saet = null;
    var koe = [];          /* indeks paa de kort, der er tilbage i bunken */
    var kan = {};          /* indeks -> true, naar kortet er klaret */
    var misset = {};       /* indeks -> antal gange, det blev misset */
    var retning = "fb";    /* fb: forside -> bagside, bf: omvendt, bl: blandet */
    var aktuel = null;     /* { i, vendtSide } */
    var vendt = false;
    var faerdig = false;
    var vendinger = 0;     /* paaskeaegget: hvor mange gange samme kort er vendt */

    function antal() { return saet ? saet.kort.length : 0; }

    function antalKan() {
        var n = 0;
        for (var k in kan) { if (kan[k]) n++; }
        return n;
    }

    /* Hvilken side vender opad paa det kort, der er i tur */
    function sideFor(i) {
        if (retning === "fb") return 0;
        if (retning === "bf") return 1;
        return (i + koe.length) % 2;
    }

    T.saetSaet = function (nyt) {
        saet = nyt;
        T.nulstil();
    };

    T.nulstil = function () {
        koe = [];
        kan = {};
        misset = {};
        aktuel = null;
        vendt = false;
        faerdig = false;
        vendinger = 0;
        if (!saet) return;
        var alle = [];
        for (var i = 0; i < saet.kort.length; i++) alle.push(i);
        koe = NK.bland(alle);
        naesteKort();
        tegn();
    };

    T.bland = function () {
        if (faerdig) { T.nulstil(); return; }
        koe = NK.bland(koe);
        vendt = false;
        naesteKort();
        tegn();
        status("Bunken er blandet.");
    };

    T.saetRetning = function (r) {
        if (retning === r) return;
        retning = r;
        vendt = false;
        vendinger = 0;
        if (aktuel) aktuel.side = sideFor(aktuel.i);
        tegn();
    };

    T.retning = function () { return retning; };

    function naesteKort() {
        vendinger = 0;
        if (!koe.length) {
            aktuel = null;
            faerdig = true;
            return;
        }
        aktuel = { i: koe[0], side: sideFor(koe[0]) };
        vendt = false;
    }

    T.vend = function () {
        if (!aktuel || faerdig) return;
        vendt = !vendt;
        vendinger++;
        tegn();
        if (vendinger === 7) {
            status("Syvende vending. Bagsiden bliver ikke en anden af at blive set på.");
        } else if (vendt) {
            status("Kunne du det?");
        } else {
            status("Gæt selv, og vend så kortet.");
        }
    };

    /* kunne = true: kortet ud af bunken. false: det kommer igen. */
    T.svar = function (kunne) {
        if (!aktuel || faerdig || !vendt) return;
        var i = aktuel.i;
        koe.shift();
        if (kunne) {
            kan[i] = true;
            status(koe.length ? "Ude af bunken. " + koe.length + " kort tilbage." : "Ude af bunken.");
        } else {
            misset[i] = (misset[i] || 0) + 1;
            /* Kortet laegges tre kort laengere nede, saa det kommer igen,
               men ikke med det samme. */
            var plads = Math.min(3, koe.length);
            koe.splice(plads, 0, i);
            status("Kortet kommer igen om lidt.");
        }
        naesteKort();
        tegn();
        if (faerdig) status("Alle " + antal() + " kort er klaret. Prøv vendespillet eller parringen.");
    };

    function status(tekst) {
        NK.saetTekst("tr-status", tekst);
    }

    /* ----- Tegning ------------------------------------------------------ */
    function saetSide(idEtiket, idTekst, etiket, tekst) {
        NK.saetTekst(idEtiket, etiket);
        var e = el(idTekst);
        e.textContent = tekst;
        e.className = NK.tekstklasse(tekst, "kort-tekst ");
    }

    function tegn() {
        var kortEl = el("tr-kort");
        var faerdigEl = el("tr-faerdig");
        if (!saet) return;

        /* Svarknapperne skjules med visibility, saa kortet ikke hopper,
           naar de kommer frem. */
        el("tr-svar").classList.toggle("vis", vendt && !faerdig);
        kortEl.hidden = faerdig;
        faerdigEl.hidden = !faerdig;
        kortEl.classList.toggle("vendt", vendt);

        if (aktuel) {
            var k = saet.kort[aktuel.i];
            var forsideFoerst = aktuel.side === 0;
            saetSide("tr-for-etiket", "tr-for-tekst",
                saet.sider[forsideFoerst ? 0 : 1], forsideFoerst ? k.forside : k.bagside);
            saetSide("tr-bag-etiket", "tr-bag-tekst",
                saet.sider[forsideFoerst ? 1 : 0], forsideFoerst ? k.bagside : k.forside);
        }

        var klaret = antalKan();
        NK.saetTekst("tr-taeller", "Kort " + Math.min(klaret + 1, antal()) + " af " + antal());
        NK.saetTekst("tr-kan", klaret + " af " + antal());
        NK.saetTekst("tr-bunke", String(koe.length));
        el("tr-bjaelke").style.width = (antal() ? (klaret / antal()) * 100 : 0) + "%";
        NK.saetTekst("tr-faerdig-tekst", "Du kom igennem alle " + antal() + " kort.");

        tegnSvaere();

        var knapper = el("tr-retning").querySelectorAll("button");
        for (var i = 0; i < knapper.length; i++) {
            var r = knapper[i].getAttribute("data-retning");
            knapper[i].classList.toggle("valgt", r === retning);
        }
        NK.saetTekst("tr-retning-fb", saet.sider[0] + " → " + saet.sider[1]);
        NK.saetTekst("tr-retning-bf", saet.sider[1] + " → " + saet.sider[0]);
    }

    function tegnSvaere() {
        var liste = [];
        for (var k in misset) {
            if (misset[k]) liste.push({ i: +k, n: misset[k] });
        }
        liste.sort(function (a, b) { return b.n - a.n; });
        var boks = el("tr-svaere");
        if (!liste.length) {
            boks.innerHTML = '<p class="tom">Kort, du misser, samler sig her.</p>';
            return;
        }
        boks.innerHTML = liste.slice(0, 8).map(function (x) {
            var k = saet.kort[x.i];
            return '<div class="svaert' + (kan[x.i] ? " klaret" : "") + '">'
                + '<b>' + NK.html(k.forside) + "</b><span>" + NK.html(k.bagside) + "</span>"
                + '<i title="Misset ' + x.n + ' gange">' + x.n + "</i></div>";
        }).join("");
    }

    /* ----- Tastatur ------------------------------------------------------ */
    T.tast = function (e) {
        if (e.key === " " || e.key === "Enter") { T.vend(); return true; }
        if (faerdig && (e.key === "r" || e.key === "R")) { T.nulstil(); return true; }
        if (!vendt) return false;
        if (e.key === "1" || e.key === "j" || e.key === "J" || e.key === "ArrowRight") { T.svar(true); return true; }
        if (e.key === "2" || e.key === "n" || e.key === "N" || e.key === "ArrowLeft") { T.svar(false); return true; }
        return false;
    };

    T.aktiver = function () {
        tegn();
        status(vendt ? "Kunne du det?" : "Gæt selv, og vend så kortet.");
    };

    function init() {
        el("tr-kort").addEventListener("click", T.vend);
        el("tr-svar").addEventListener("click", function (e) {
            var b = e.target.closest("button[data-svar]");
            if (b) T.svar(b.getAttribute("data-svar") === "ja");
        });
        el("tr-retning").addEventListener("click", function (e) {
            var b = e.target.closest("button[data-retning]");
            if (b) T.saetRetning(b.getAttribute("data-retning"));
        });
        el("tr-bland").addEventListener("click", T.bland);
        el("tr-forfra").addEventListener("click", function () { T.nulstil(); status("Alle kort er tilbage i bunken."); });
        el("tr-igen").addEventListener("click", function () { T.nulstil(); status("Alle kort er tilbage i bunken."); });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
}());
