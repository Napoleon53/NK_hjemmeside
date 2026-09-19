/* =====================================================================
   billede.js - billedet af glas 1 til 7

   Eleven tager et billede af stativet og noterer under hvert glas, om det
   blev moerkere, lysere eller ser ud som glas 7. Det er her forsoeget
   bliver til laering: motoren har vidst hele tiden, hvad der skete, men
   det taeller foerst, naar eleven har set det og sagt det.

   Optagelsen og bedoemmelsen ligger i motoren
   (../../laboratoriet/js/journal.js). Her staar kun praesentationen: de syv
   glas i raekke og knapperne under dem. Vil et andet forsoeg have samme
   slags billede, traekkes det ud - men foerst naar der er to.

   Billedet er et oejebliksbillede. Glassene tegnes, som de saa ud, da der
   blev trykket, og de bliver staaende saadan, ogsaa efter at glassene er
   haeldt ud. Svaret og det, der blev svaret paa, hoerer sammen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = NK.Tegning;
    var Stof = NK.Stof;
    var V = NK.Vilkaar;

    var GLAS = ["glas1", "glas2", "glas3", "glas4", "glas5", "glas6"];
    var ALLE = GLAS.concat(["glas7"]);
    var GRAENSE = 0.03;          /* samme forskel, som trinnene bruger */
    var AFSTAND = 92;            /* mellem glassene i billedet */

    /* Sandheden: hvordan ser glasset ud mod glas 7 lige nu? */
    function facit(id, bord) {
        var d = V.lysstyrke(bord.g[id]) - V.lysstyrke(bord.g.glas7);
        if (d < -GRAENSE) return "moerkere";
        if (d > GRAENSE) return "lysere";
        return "ens";
    }

    var journal = NK.Journal.lav({
        id: "billede",
        kraevede: GLAS,
        facit: facit,
        /* Oejebliksbilledet: farven til skemaet, og hele opskriften paa
           det, der stod i glasset, saa tegneserien kan tegne glasset, som
           det saa ud - ogsaa efter at det er haeldt ud (tegneserie.js). */
        billede: function (id, bord) {
            var gg = bord.g[id];
            var f = NK.Beholder.farve(gg);
            return {
                farve: f ? { r: Math.round(f.r), g: Math.round(f.g), b: Math.round(f.b) } : null,
                opl: Stof.opskrift(NK.Beholder.samlet(gg)),
                /* Referencen hoerer med. Svaret er ikke "moerk", men
                   "moerkere END GLAS 7", saa det, der blev sammenlignet
                   med, skal gemmes sammen med svaret - ellers kan
                   tegneserien ikke tegne de to ved siden af hinanden
                   bagefter. */
                ref: Stof.opskrift(NK.Beholder.samlet(bord.g.glas7))
            };
        }
    });

    var laerred = null;
    var optagelse = null;        /* kopierne af glassene, som de saa ud */

    /* En kopi af glasset, der kan tegnes for sig selv */
    function kopi(gg, x, y) {
        return {
            navn: gg.navn, type: gg.type, anker: gg.anker, skala: gg.skala,
            kan: gg.kan, titel: gg.titel, etiket: gg.etiket, nr: gg.nr,
            indhold: Stof.kopi(gg.indhold), lag: gg.lag ? Stof.kopi(gg.lag) : null,
            lagBund: gg.lagBund, bund: 1, korn: [], niveau: null,
            p: { x: x, y: y, v: 0 }, valgt: false, skjult: false, spec: gg.spec
        };
    }

    function tag(bord) {
        optagelse = ALLE.map(function (navn, i) {
            return kopi(bord.g[navn], 46 + i * AFSTAND, 18);
        });
    }

    function tegn() {
        if (!laerred || !optagelse) return;
        laerred.tilpas();
        var ctx = laerred.ctx;
        ctx.clearRect(0, 0, laerred.b, laerred.h);
        optagelse.forEach(function (k) { T.tegnBeholder(ctx, k, 0, {}); });
    }

    /* ----- Knapperne under glassene ------------------------------------- */
    var VALG = [
        { id: "moerkere", tekst: "Mørkere" },
        { id: "ens", tekst: "Som glas 7" },
        { id: "lysere", tekst: "Lysere" }
    ];

    function bygSvar(bord, vedSvar) {
        var boks = NK.el("billede-svar");
        boks.innerHTML = "";
        ALLE.forEach(function (navn) {
            var soejle = document.createElement("div");
            soejle.className = "billede-soejle";
            if (navn === "glas7") {
                soejle.innerHTML = '<span class="billede-ref">referencen</span>';
                boks.appendChild(soejle);
                return;
            }
            VALG.forEach(function (v) {
                var k = document.createElement("button");
                k.type = "button";
                k.className = "knap billede-valg";
                k.textContent = v.tekst;
                k.dataset.glas = navn;
                k.dataset.valg = v.id;
                if (journal.svar(navn) === v.id) k.classList.add("aktiv");
                k.addEventListener("click", function () {
                    journal.noter(navn, v.id, bord);
                    visValgte();
                    if (vedSvar) vedSvar();
                });
                soejle.appendChild(k);
            });
            boks.appendChild(soejle);
        });
    }

    function visValgte() {
        var knapper = NK.el("billede-svar").querySelectorAll("button");
        for (var i = 0; i < knapper.length; i++) {
            var k = knapper[i];
            var valgt = journal.svar(k.dataset.glas) === k.dataset.valg;
            k.classList.toggle("aktiv", valgt);
            k.setAttribute("aria-pressed", valgt ? "true" : "false");
        }
        NK.saetTekst("billede-taeller", journal.antal() + " af " + GLAS.length + " noteret");
    }

    /* ----- Aabn og luk --------------------------------------------------- */
    function aabn(bord, vedSvar) {
        if (!laerred) laerred = new NK.Laerred(NK.el("billede-laerred"));
        tag(bord);
        bygSvar(bord, vedSvar);
        visValgte();
        NK.el("billede").classList.add("vis");
        tegn();
        /* Laerredet faar foerst sin stoerrelse, naar overlayet er synligt */
        window.requestAnimationFrame(tegn);
    }

    function luk() {
        NK.el("billede").classList.remove("vis");
    }

    NK.BILLEDE = {
        journal: journal,
        aabn: aabn,
        luk: luk,
        tegn: tegn,
        facit: facit,
        glas: GLAS,
        /* Til selvtesten og konsollen: notér uden at klikke */
        noter: function (navn, valg, bord) {
            journal.noter(navn, valg, bord);
            if (NK.el("billede-svar") && NK.el("billede-svar").children.length) visValgte();
        }
    };
}());
