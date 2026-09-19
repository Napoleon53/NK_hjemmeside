/* =====================================================================
   ovenfra.js - de fire baegerglas set ovenfra (del 2)

   Del 2 er fortyndingsproeven. To par glas: det ene par frugtfarve, det
   andet ligevaegtsblanding fra den samme kolbe. Begge glas i et par faar
   lige meget, og saa fortyndes det ene med vand.

   Set FRA SIDEN bliver begge glas lysere, og det siger ingenting: vejen
   gennem glasset er den samme, og koncentrationen er halveret. Set
   OVENFRA er vejen vaeskens dybde, og den er fordoblet. De to ophaever
   hinanden, og saa maaler man antallet af farvede molekyler i stedet for
   koncentrationen:

     frugtfarve            samme antal molekyler  ->  ser ENS ud
     ligevaegtsblanding    faerre FeSCN²⁺         ->  bliver LYSERE

   Forskellen mellem de to par er beviset for, at fortynding i sig selv
   er et indgreb i ligevaegten. Lysvejen ovenfra staar i motoren
   (NK.Udstyr.vejOvenfra, NK.Beholder.farve(gg, "ovenfra")); her staar
   praesentationen og parrene.

   Et par kendes paa sit INDHOLD og ikke paa sin plads, saa det virker
   ogsaa, hvis eleven bytter om paa parrene. Og et glas taeller som
   fortyndet, naar det har mindst FORTYNDING.min gange saa meget som det
   andet - uden oevre graense. Dobbelt rumfang er maalet, men haelder
   eleven mere vand i, er glasset stadig fortyndet, og forskellen bliver
   bare tydeligere.

   Facit regnes af verden i svaroejeblikket, som alle andre steder
   (journal.js): de to glas laegges paa hvidt papir, og lysheden
   sammenlignes (NK.Vilkaar.lyshed). Ikke en facitliste - hvis eleven har
   fyldt glassene anderledes end tiltaenkt, er det HANS glas, svaret
   maales mod.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var B = NK.Beholder;
    var V = NK.Vilkaar;

    var BAEGERE = ["baeger1", "baeger2", "baeger3", "baeger4"];
    var PAR = [[0, 1], [2, 3]];

    /* mL i hvert glas, foer parret taeller med. Ikke en tilfaeldig
       graense: ses der ned i en sjat paa bunden af et baegerglas, er
       lysvejen kun et par millimeter, og saa er selv en kraftig
       oploesning naesten farveloes. Der skal to portioner i hvert glas. */
    var MINDST = 30;
    var FORTYNDING = { min: 1.4 };   /* hi/lo; ingen oevre graense */
    var GRAENSE = 0.012;             /* forskel i lyshed, oejet kan se */

    var TYPER = ["farve", "lv"];

    /* ----- Hvad der er i glassene ---------------------------------------- */
    function ialt(o, navne) {
        var s = 0;
        navne.forEach(function (n) { s += o.n[n] || 0; });
        return s;
    }

    function indholdType(gg) {
        if (!gg || !gg.indhold) return "tom";
        var o = B.samlet(gg);
        if (o.V < 0.3) return "tom";
        var f = (o.n["farve"] || 0) > 0.01;
        var lv = ialt(o, ["Fe3+", "Fe2+", "FeSCN2+"]) > 0.01;
        if (f && lv) return "blanding";
        if (f) return "farve";
        if (lv) return "lv";
        return "vand";
    }

    /* Maengden af det farvede stof, parret handler om. Den viser, om de to
       glas fik lige meget - det er variabelkontrollen i proeven. */
    function maengde(gg, type) {
        var o = B.samlet(gg);
        return type === "farve" ? (o.n["farve"] || 0) : ialt(o, ["Fe3+", "Fe2+", "FeSCN2+"]);
    }

    function glas(bord, i) { return bord.g[BAEGERE[i]] || null; }

    function par(bord, n) {
        var a = glas(bord, PAR[n][0]), b = glas(bord, PAR[n][1]);
        return a && b ? [a, b] : null;
    }

    /* "farve", "lv" eller null: begge glas skal have den samme slags
       oploesning og mere end en sjat i sig */
    function parType(bord, n) {
        var p = par(bord, n);
        if (!p) return null;
        var t = indholdType(p[0]);
        if (t !== "farve" && t !== "lv") return null;
        return (indholdType(p[1]) === t &&
                B.volumen(p[0]) >= MINDST && B.volumen(p[1]) >= MINDST) ? t : null;
    }

    /* Nummeret paa det par, der har den oploesning - eller -1 */
    function parMed(type, bord) {
        for (var n = 0; n < PAR.length; n++) if (parType(bord, n) === type) return n;
        return -1;
    }

    /* Hvilket af parrets to glas er fortyndet? -1, hvis ingen af dem er */
    function fortyndet(p) {
        if (!p) return -1;
        var a = B.volumen(p[0]), b = B.volumen(p[1]);
        var lo = Math.min(a, b), hi = Math.max(a, b);
        if (lo < MINDST || hi / lo < FORTYNDING.min) return -1;
        return a > b ? 0 : 1;
    }

    /* Parret er klar til at blive noteret */
    function klar(type, bord) {
        var n = parMed(type, bord);
        return n >= 0 && fortyndet(par(bord, n)) >= 0;
    }

    function beggeKlar(bord) {
        return TYPER.every(function (t) { return klar(t, bord); });
    }

    /* ----- Sandheden: hvordan ser det fortyndede glas ud ovenfra? -------- */
    function facit(type, bord) {
        var n = parMed(type, bord);
        if (n < 0) return null;
        var p = par(bord, n), i = fortyndet(p);
        if (i < 0) return null;
        var d = V.lyshed(p[i], "ovenfra") - V.lyshed(p[1 - i], "ovenfra");
        if (d > GRAENSE) return "lysere";
        if (d < -GRAENSE) return "moerkere";
        return "ens";
    }

    var journal = NK.Journal.lav({
        id: "fortynding",
        kraevede: TYPER,
        facit: facit,
        /* Oejebliksbilledet: de to glas, som de saa ud, da der blev svaret */
        billede: function (type, bord) {
            var n = parMed(type, bord);
            if (n < 0) return null;
            var p = par(bord, n), i = fortyndet(p);
            function post(gg) {
                var f = B.farve(gg, "ovenfra");
                return {
                    V: B.volumen(gg),
                    vej: NK.Udstyr.vejOvenfra(gg.type, B.volumen(gg)),
                    farve: f ? { r: Math.round(f.r), g: Math.round(f.g), b: Math.round(f.b), a: f.a } : null
                };
            }
            return { fortyndet: i < 0 ? null : post(p[i]), reference: i < 0 ? null : post(p[1 - i]) };
        }
    });

    /* ----- Tegningen: glassene paa hvidt papir --------------------------- */
    var laerred = null;

    /* Et baegerglas set lige ned i. Vaesken er farven gennem dybden, og
       papiret er hvidt, saa en tynd vaeske bliver lys af sig selv. */
    function tegnOppefra(ctx, x, y, r, gg) {
        var tom = !gg || B.volumen(gg) < 0.3;
        var f = tom ? null : B.farve(gg, "ovenfra");
        ctx.save();
        ctx.fillStyle = "rgba(20, 26, 34, 0.16)";
        ctx.beginPath();
        ctx.arc(x + 2, y + 4, r + 6, 0, Math.PI * 2);
        ctx.fill();
        /* Glassets rand */
        ctx.fillStyle = "#e8eef2";
        ctx.beginPath();
        ctx.arc(x, y, r + 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(70, 86, 102, 0.5)";
        ctx.lineWidth = 2;
        ctx.stroke();
        /* Papiret inde i glasset, og vaesken oven paa det */
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        if (!f) {
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = "rgba(120, 132, 144, 0.6)";
            ctx.lineWidth = 1.4;
            ctx.stroke();
            ctx.setLineDash([]);
        } else {
            ctx.fillStyle = NK.css(f, f.a === undefined ? 1 : f.a);
            ctx.fill();
            var u = gg ? NK.Stof.uklar(B.samlet(gg)) : 0;
            if (u > 0.01) {
                ctx.fillStyle = "rgba(246, 247, 244, " + (NK.klamp(u, 0, 1) * 0.6).toFixed(3) + ")";
                ctx.fill();
            }
        }
        /* Glimtet i randen, saa det laeses som glas og ikke som en skive */
        ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(2, r - 5), Math.PI * 1.1, Math.PI * 1.45);
        ctx.stroke();
        ctx.restore();
    }

    function skriv(ctx, t, x, y, str, farve, fed) {
        NK.tekst(ctx, t, x, y, {
            font: (fed ? "700 " : "600 ") + str + "px 'Segoe UI', Arial, sans-serif",
            justering: "center", linje: "middle", farve: farve
        });
    }

    function tegn() {
        if (!laerred || !NK.Side.nu) return;
        var bord = NK.Side.nu.bord();
        laerred.tilpas();
        var ctx = laerred.ctx, b = laerred.b, h = laerred.h;
        ctx.clearRect(0, 0, b, h);

        /* Det hvide papir, glassene staar paa */
        ctx.save();
        ctx.fillStyle = "#f6f7f5";
        NK.rundtRekt(ctx, 4, 4, b - 8, h - 8, 10);
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
        ctx.lineWidth = 1;
        ctx.stroke();

        /* Skillelinjen mellem de to par */
        ctx.strokeStyle = "rgba(120, 132, 146, 0.45)";
        ctx.lineWidth = 1.4;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(b / 2, 16);
        ctx.lineTo(b / 2, h - 16);
        ctx.stroke();
        ctx.setLineDash([]);

        /* Laerredet kan vaere smalt (eller nul bredt, foer overlayet er
           synligt), saa radius holdes inden for noget, der kan tegnes */
        var r = NK.klamp((b / 4 - 28) / 2, 14, 52);
        var cy = h / 2 - 8;
        for (var n = 0; n < PAR.length; n++) {
            var midt = b * (n === 0 ? 0.25 : 0.75);
            var t = parType(bord, n);
            var p = par(bord, n);
            var f = fortyndet(p);
            for (var k = 0; k < 2; k++) {
                var gg = p ? p[k] : null;
                var x = midt + (k === 0 ? -(r + 12) : (r + 12));
                tegnOppefra(ctx, x, cy, r, gg);
                var Vg = gg ? B.volumen(gg) : 0;
                skriv(ctx, Vg < 0.3 ? "tomt" : Math.round(Vg) + " mL", x, cy + r + 22, 15, "#232830", true);
                var maerke = "";
                if (Vg >= 0.3) maerke = k === f ? "fortyndet" : (t ? "som hældt op" : "");
                skriv(ctx, maerke, x, cy + r + 40, 12, "#5a6570");
            }
        }
        ctx.restore();
    }

    /* ----- Knapperne under hvert par ------------------------------------- */
    var VALG = [
        { id: "moerkere", tekst: "Mørkere" },
        { id: "ens", tekst: "Som det andet glas" },
        { id: "lysere", tekst: "Lysere" }
    ];

    var TITEL = { farve: "Par med frugtfarve", lv: "Par med ligevægtsblanding" };

    /* Linjen under et par: hvor meget der er i, og om de to fik lige meget */
    function note(bord, type) {
        var n = parMed(type, bord);
        if (n < 0) return NK.TEKST["ovenfra-mangler"];
        var p = par(bord, n), f = fortyndet(p);
        if (f < 0) return NK.TEKST["ovenfra-ufortyndet"];
        var a = maengde(p[f], type), b2 = maengde(p[1 - f], type);
        var lige = a > 0 && b2 > 0 && Math.abs(a - b2) / Math.max(a, b2) < 0.1;
        var mL = Math.round(B.volumen(p[1 - f])) + " mL og " + Math.round(B.volumen(p[f])) + " mL";
        return mL + (lige ? " — lige meget stof i begge" : " — IKKE lige meget stof i de to glas");
    }

    function bygSvar(bord, vedSvar) {
        var boks = NK.el("ovenfra-svar");
        boks.innerHTML = "";
        TYPER.forEach(function (type) {
            var d = document.createElement("div");
            d.className = "ovenfra-par";
            d.dataset.par = type;
            var h = document.createElement("h3");
            h.textContent = TITEL[type];
            d.appendChild(h);
            var n = document.createElement("p");
            n.className = "ovenfra-note";
            d.appendChild(n);
            var rad = document.createElement("div");
            rad.className = "ovenfra-valg";
            VALG.forEach(function (v) {
                var k = document.createElement("button");
                k.type = "button";
                k.className = "knap ovenfra-knap";
                k.textContent = v.tekst;
                k.dataset.par = type;
                k.dataset.valg = v.id;
                k.addEventListener("click", function () {
                    if (!klar(type, bord)) {
                        NK.Side.nu.besked(NK.TEKST["ovenfra-ikke-klar"]);
                        return;
                    }
                    journal.noter(type, v.id, bord);
                    if (NK.Lyd && NK.Lyd.klik) NK.Lyd.klik();
                    visValgte(bord);
                    if (vedSvar) vedSvar();
                });
                rad.appendChild(k);
            });
            d.appendChild(rad);
            boks.appendChild(d);
        });
    }

    function visValgte(bord) {
        var boks = NK.el("ovenfra-svar");
        if (!boks) return;
        var pars = boks.querySelectorAll(".ovenfra-par");
        for (var i = 0; i < pars.length; i++) {
            var type = pars[i].dataset.par;
            pars[i].classList.toggle("laast", !klar(type, bord));
            var n = pars[i].querySelector(".ovenfra-note");
            if (n) n.textContent = note(bord, type);
        }
        var knapper = boks.querySelectorAll("button");
        for (var j = 0; j < knapper.length; j++) {
            var k = knapper[j];
            var valgt = journal.svar(k.dataset.par) === k.dataset.valg;
            k.classList.toggle("aktiv", valgt);
            k.setAttribute("aria-pressed", valgt ? "true" : "false");
        }
        NK.saetTekst("ovenfra-taeller", journal.antal() + " af " + TYPER.length + " noteret");
    }

    /* ----- Aabn og luk ---------------------------------------------------- */
    function aabn(bord, vedSvar) {
        if (!laerred) laerred = new NK.Laerred(NK.el("ovenfra-laerred"));
        bygSvar(bord, vedSvar);
        visValgte(bord);
        NK.el("ovenfra").classList.add("vis");
        tegn();
        /* Laerredet faar foerst sin stoerrelse, naar overlayet er synligt */
        window.requestAnimationFrame(tegn);
    }

    function luk() {
        NK.el("ovenfra").classList.remove("vis");
    }

    NK.OVENFRA = {
        journal: journal,
        BAEGERE: BAEGERE,
        TYPER: TYPER,
        MINDST: MINDST,
        FORTYNDING: FORTYNDING,
        GRAENSE: GRAENSE,
        aabn: aabn,
        luk: luk,
        tegn: tegn,
        facit: facit,
        indholdType: indholdType,
        maengde: maengde,
        par: par,
        parType: parType,
        parMed: parMed,
        fortyndet: fortyndet,
        klar: klar,
        beggeKlar: beggeKlar,
        /* Til selvtesten og konsollen: notér uden at klikke */
        noter: function (type, valg, bord) {
            journal.noter(type, valg, bord);
            if (NK.el("ovenfra-svar") && NK.el("ovenfra-svar").children.length) visValgte(bord);
        }
    };
}());
