/* =====================================================================
   kredsloeb.js - del 1: pengenes kredsloeb

   Tegningen er et spor (en ellipse) mellem familierne til venstre og
   virksomhederne til hoejre. Kronerne koerer med uret: over toppen er
   de koeb af varer, under bunden er de loen. Antallet af kroner paa
   sporet er efterspoergslen. Inde i sporet staar de ti arbejdere, og
   over dem staten, som foerst vises, naar eleven kommer til den.

   NK.Kredsloeb.byg(svg)       tegner det hele og starter bevaegelsen
   NK.Kredsloeb.nulstil()      12 kroner, 10 i arbejde, intet skjult vist
   NK.Kredsloeb.pause(b)       intet bevaeger sig, mens eleven svarer
   NK.Kredsloeb.opdater(dt)    et skridt frem (kaldes af requestAnimationFrame
                               og af selvtesten)
   NK.Kredsloeb.spring()       alle kroner paa vej et sted hen er fremme
   sparOp(n), fjern(n), fyr(n), statGas(n), fraSparegris(n), ansaet(n)
   vis(hvad, b), skilt(hvor), ring(hvor), foelg(b), tal()
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var CX = 500, CY = 200, RX = 320, RY = 140;
    var FAM = { x: 125, y: 200 };       /* familiernes plade */
    var FAB = { x: 875, y: 200 };       /* virksomhedernes plade */
    var GRIS = { x: 125, y: 345 };      /* sparegrisen */
    var STAT = { x: 500, y: 150 };      /* staten */
    var ARB_Y = 258;
    var FART = 1 / 9;                   /* et omloeb paa 9 sekunder */

    var svg, spor, lagKroner, lagSkilt;
    var dele = {};
    var kroner = [];
    var arbejdere = [];                 /* status pr. arbejder: arbejde, ledig, vej */
    var fase = 0;                       /* hvor "toget" af kroner er paa sporet */
    var pauset = false;
    var sparet = 0;
    var brugt = 0;
    var foelges = false;
    var klikFn = null;
    var sidst = 0;

    /* ----- Sporet ---------------------------------------------------- */
    function punkt(t) {
        /* t = 0 er familierne (venstre), 0,25 toppen, 0,5 virksomhederne */
        var v = Math.PI + (t % 1 + 1) % 1 * 2 * Math.PI;
        return { x: CX + RX * Math.cos(v), y: CY + RY * Math.sin(v) };
    }

    function arbejderX(i) { return 338 + i * 36; }

    /* ----- Tegningen ------------------------------------------------- */
    function hus(g, x, y, s) {
        NK.svg("rect", { x: x - 11 * s, y: y - 4 * s, width: 22 * s, height: 18 * s, rx: 2, fill: "#efe6cf" }, g);
        NK.svg("path", { d: "M" + (x - 14 * s) + "," + (y - 3 * s) + " L" + x + "," + (y - 16 * s) + " L" + (x + 14 * s) + "," + (y - 3 * s) + " Z", fill: "#c0583f" }, g);
        NK.svg("rect", { x: x - 3 * s, y: y + 5 * s, width: 6 * s, height: 9 * s, fill: "#6b4a2f" }, g);
    }

    function byg(beholder) {
        svg = beholder;
        svg.innerHTML = "";
        dele = {};

        var defs = NK.svg("defs", null, svg);
        var mk = NK.svg("marker", { id: "pil", viewBox: "0 0 10 10", refX: 5, refY: 5, markerWidth: 6, markerHeight: 6, orient: "auto" }, defs);
        NK.svg("path", { d: "M0,0 L10,5 L0,10 Z", fill: "#8a919c" }, mk);

        /* Sporet: et bredt baand med en stiplet midterlinje */
        var d = "M" + (CX - RX) + "," + CY + " A" + RX + "," + RY + " 0 0 1 " + (CX + RX) + "," + CY + " A" + RX + "," + RY + " 0 0 1 " + (CX - RX) + "," + CY;
        NK.svg("path", { d: d, fill: "none", stroke: "rgba(255,255,255,0.055)", "stroke-width": 34 }, svg);
        spor = NK.svg("path", { d: d, fill: "none", stroke: "#4a4b5c", "stroke-width": 2, "stroke-dasharray": "6 8" }, svg);

        /* Pile paa sporet og ordene over og under */
        NK.svg("path", { d: "M492,52 L508,60 L492,68", fill: "none", stroke: "#8a919c", "stroke-width": 3, "stroke-linecap": "round", "stroke-linejoin": "round" }, svg);
        NK.svg("path", { d: "M508,332 L492,340 L508,348", fill: "none", stroke: "#8a919c", "stroke-width": 3, "stroke-linecap": "round", "stroke-linejoin": "round" }, svg);
        NK.svg("text", { x: 500, y: 30, "class": "k-spor-ord" }, svg, "Familierne køber varer →");
        NK.svg("text", { x: 500, y: 382, "class": "k-spor-ord" }, svg, "← Virksomhederne betaler løn");

        /* Familierne */
        var fam = NK.svg("g", { "class": "k-ting", "data-hvad": "familier" }, svg);
        dele.famPlade = NK.svg("circle", { cx: FAM.x, cy: FAM.y, r: 56, "class": "k-plade" }, fam);
        hus(fam, FAM.x - 24, FAM.y + 8, 1);
        hus(fam, FAM.x + 2, FAM.y - 14, 1.1);
        hus(fam, FAM.x + 24, FAM.y + 12, 0.9);
        NK.svg("text", { x: FAM.x, y: FAM.y + 82, "class": "k-navn" }, fam, "Familierne");

        /* Virksomhederne: en fabrik med savtakket tag og skorsten */
        var fab = NK.svg("g", { "class": "k-ting", "data-hvad": "fabrik" }, svg);
        dele.fabPlade = NK.svg("circle", { cx: FAB.x, cy: FAB.y, r: 56, "class": "k-plade" }, fab);
        NK.svg("rect", { x: FAB.x + 14, y: FAB.y - 40, width: 10, height: 34, fill: "#7d8594" }, fab);
        NK.svg("path", { d: "M" + (FAB.x - 30) + "," + (FAB.y + 26) + " L" + (FAB.x - 30) + "," + (FAB.y - 6) + " L" + (FAB.x - 16) + "," + (FAB.y - 18) + " L" + (FAB.x - 16) + "," + (FAB.y - 6) + " L" + (FAB.x - 2) + "," + (FAB.y - 18) + " L" + (FAB.x - 2) + "," + (FAB.y - 6) + " L" + (FAB.x + 12) + "," + (FAB.y - 18) + " L" + (FAB.x + 12) + "," + (FAB.y - 6) + " L" + (FAB.x + 30) + "," + (FAB.y - 6) + " L" + (FAB.x + 30) + "," + (FAB.y + 26) + " Z", fill: "#b9c0c9" }, fab);
        for (var w = 0; w < 3; w++) NK.svg("rect", { x: FAB.x - 24 + w * 18, y: FAB.y + 4, width: 10, height: 9, fill: "#f2c53d", "class": "k-vindue" }, fab);
        dele.roeg = NK.svg("g", { "class": "k-roeg" }, fab);
        NK.svg("circle", { cx: FAB.x + 19, cy: FAB.y - 50, r: 7 }, dele.roeg);
        NK.svg("circle", { cx: FAB.x + 26, cy: FAB.y - 62, r: 9 }, dele.roeg);
        NK.svg("text", { x: FAB.x, y: FAB.y + 82, "class": "k-navn" }, fab, "Virksomhederne");

        /* Sparegrisen (vises foerst, naar familierne sparer op) */
        var gris = NK.svg("g", { "class": "k-ting k-skjult", "data-hvad": "sparegris" }, svg);
        dele.gris = gris;
        NK.svg("ellipse", { cx: GRIS.x, cy: GRIS.y, rx: 30, ry: 21, fill: "#e89aaa" }, gris);
        NK.svg("circle", { cx: GRIS.x + 27, cy: GRIS.y - 2, r: 10, fill: "#e89aaa" }, gris);
        NK.svg("ellipse", { cx: GRIS.x + 34, cy: GRIS.y - 1, rx: 4, ry: 5, fill: "#d27a8d" }, gris);
        NK.svg("path", { d: "M" + (GRIS.x + 12) + "," + (GRIS.y - 19) + " l6,-10 l5,11 Z", fill: "#d27a8d" }, gris);
        NK.svg("rect", { x: GRIS.x - 8, y: GRIS.y - 22, width: 16, height: 4, rx: 2, fill: "#7a3a49" }, gris);
        [-18, -6, 8, 18].forEach(function (dx) {
            NK.svg("rect", { x: GRIS.x + dx - 3, y: GRIS.y + 15, width: 7, height: 12, rx: 2, fill: "#d27a8d" }, gris);
        });
        dele.grisTal = NK.svg("text", { x: GRIS.x - 6, y: GRIS.y + 7, "class": "k-gris-tal" }, gris, "");

        /* Staten (vises foerst i trinnet om staten) */
        var stat = NK.svg("g", { "class": "k-ting k-skjult", "data-hvad": "staten" }, svg);
        dele.stat = stat;
        NK.svg("rect", { x: STAT.x - 58, y: STAT.y - 18, width: 116, height: 48, rx: 3, fill: "#d9d2bf" }, stat);
        NK.svg("path", { d: "M" + (STAT.x - 64) + "," + (STAT.y - 18) + " L" + STAT.x + "," + (STAT.y - 36) + " L" + (STAT.x + 64) + "," + (STAT.y - 18) + " Z", fill: "#3f8f7a" }, stat);
        NK.svg("rect", { x: STAT.x - 9, y: STAT.y - 52, width: 18, height: 22, fill: "#3f8f7a" }, stat);
        NK.svg("path", { d: "M" + (STAT.x - 9) + "," + (STAT.y - 52) + " L" + STAT.x + "," + (STAT.y - 66) + " L" + (STAT.x + 9) + "," + (STAT.y - 52) + " Z", fill: "#3f8f7a" }, stat);
        for (var s = 0; s < 5; s++) NK.svg("rect", { x: STAT.x - 46 + s * 21, y: STAT.y - 10, width: 8, height: 34, fill: "#a99f86" }, stat);
        NK.svg("text", { x: STAT.x + 76, y: STAT.y + 14, "class": "k-navn venstre" }, stat, "Staten");

        /* Arbejderne */
        var arb = NK.svg("g", { "class": "k-ting", "data-hvad": "arbejdere" }, svg);
        dele.arb = [];
        for (var i = 0; i < 10; i++) {
            var ydre = NK.svg("g", { transform: "translate(" + arbejderX(i) + "," + ARB_Y + ")" }, arb);
            var krop = NK.svg("g", { "class": "arb arbejde" }, ydre);
            NK.svg("circle", { cx: 0, cy: -14, r: 8, "class": "arb-hoved" }, krop);
            NK.svg("path", { d: "M-10,18 L-10,2 Q-10,-4 -4,-4 L4,-4 Q10,-4 10,2 L10,18 Z", "class": "arb-krop" }, krop);
            NK.svg("path", { d: "M-9,-17 Q0,-29 9,-17 Z", "class": "arb-hjelm" }, krop);
            dele.arb.push(krop);
        }
        dele.arbTekst = NK.svg("text", { x: 500, y: 306, "class": "k-tal" }, arb, "");

        /* Taelleren for statens krone (samme plads som skiltet ved staten) */
        dele.taeller = NK.svg("text", { x: 500, y: 214, "class": "k-taeller", visibility: "hidden" }, svg, "");

        lagKroner = NK.svg("g", null, svg);
        lagSkilt = NK.svg("g", { "class": "k-skiltlag" }, svg);

        /* Ringen om det, teksten handler om, og skiltet med handlingen */
        dele.ring = NK.svg("circle", { "class": "k-ring", r: 0, visibility: "hidden" }, lagSkilt);
        dele.skilt = NK.svg("g", { "class": "k-skilt", visibility: "hidden" }, lagSkilt);
        dele.skiltBund = NK.svg("rect", { height: 30, rx: 7 }, dele.skilt);
        dele.skiltTekst = NK.svg("text", {}, dele.skilt, "");

        svg.addEventListener("click", function (ev) {
            var t = ev.target.closest("[data-hvad]");
            if (t && klikFn) klikFn(t.getAttribute("data-hvad"));
        });

        nulstil();
        if (!sidst) {
            sidst = -1;
            requestAnimationFrame(loekke);
        }
    }

    function loekke(nu) {
        if (sidst > 0) opdater(Math.min(0.05, (nu - sidst) / 1000));
        sidst = nu;
        requestAnimationFrame(loekke);
    }

    /* ----- Tilstanden ------------------------------------------------ */
    function nyKrone(slags) {
        var g = NK.svg("g", { "class": "k-krone " + slags, "data-hvad": "krone" }, lagKroner);
        NK.svg("circle", { r: 12, "class": "kr-ydre" }, g);
        NK.svg("circle", { r: 7, "class": "kr-indre" }, g);
        var k = { el: g, t: 0, fase: "loop", slags: slags, u: 0, vej: null, foelg: false, sidsteHalv: 0 };
        kroner.push(k);
        return k;
    }

    function nulstil() {
        kroner.forEach(function (k) { if (k.el.parentNode) k.el.parentNode.removeChild(k.el); });
        kroner = [];
        fase = 0;
        for (var i = 0; i < 12; i++) {
            var k = nyKrone("alm");
            k.t = i / 12;
        }
        arbejdere = [];
        for (var j = 0; j < 10; j++) arbejdere.push("arbejde");
        sparet = 0;
        brugt = 0;
        foelges = false;
        pauset = false;
        vis("sparegris", false);
        vis("staten", false);
        skilt(null);
        ring(null);
        dele.taeller.setAttribute("visibility", "hidden");
        tegnArbejdere();
        tegnGris();
        placer();
    }

    function vis(hvad, b) {
        var e = hvad === "sparegris" ? dele.gris : (hvad === "staten" ? dele.stat : null);
        if (e) e.classList.toggle("k-skjult", !b);
    }

    function tegnArbejdere() {
        var job = 0;
        arbejdere.forEach(function (s, i) {
            dele.arb[i].setAttribute("class", "arb " + s);
            if (s !== "ledig") job++;
        });
        dele.arbTekst.textContent = "I arbejde: " + job + " af 10";
        dele.roeg.setAttribute("class", "k-roeg" + (job >= 9 ? " fuld" : (job >= 7 ? " halv" : "")));
    }

    function tegnGris() {
        dele.grisTal.textContent = sparet > 0 ? sparet + " kr." : "";
    }

    /* ----- Bevaegelsen ----------------------------------------------- */
    function iSporet() {
        return kroner.filter(function (k) { return k.fase === "loop"; });
    }

    function opdater(dt) {
        if (!svg || pauset) return;
        fase += FART * dt;
        var paa = iSporet();
        var n = paa.length;
        if (n > 0) {
            /* Kronerne holder lige stor afstand: hver har sin plads i "toget" */
            paa.sort(function (a, b) { return ((a.t - fase) % 1 + 1) % 1 - ((b.t - fase) % 1 + 1) % 1; });
            paa.forEach(function (k, i) {
                var maal = fase + i / n;
                var d = ((maal - k.t) % 1 + 1.5) % 1 - 0.5;
                k.t += FART * dt + d * Math.min(1, 1.4 * dt);
                taelBrug(k);
            });
        }
        kroner.slice().forEach(function (k) {
            if (k.fase === "ud" || k.fase === "vaek" || k.fase === "ind") flyt(k, dt);
        });
        placer();
    }

    /* Statens krone taeller en brug, hver gang den passerer familierne
       (loen) eller virksomhederne (koeb af varer) */
    function taelBrug(k) {
        if (!k.foelg) return;
        var halv = Math.floor(k.t * 2);
        if (halv > k.sidsteHalv) {
            brugt += halv - k.sidsteHalv;
            k.sidsteHalv = halv;
            visTaeller();
        }
    }

    function visTaeller() {
        dele.taeller.textContent = "Statens krone er brugt " + brugt + (brugt === 1 ? " gang" : " gange");
        dele.taeller.setAttribute("visibility", foelges ? "visible" : "hidden");
    }

    function flyt(k, dt) {
        if (k.fase === "vaek") {
            k.u += dt / 0.7;
            if (k.u >= 1) fjernKrone(k);
            return;
        }
        if (k.fase === "ud") {
            k.u += dt / 0.9;
            if (k.u >= 1) { fjernKrone(k); sparet++; tegnGris(); }
            return;
        }
        /* ind: gennem en raekke punkter og saa ind i sporet ved familierne */
        k.u += dt / 0.8;
        while (k.u >= 1 && k.fase === "ind") {
            k.u -= 1;
            k.vej.shift();
            if (k.vej.length < 2) {
                k.fase = "loop";
                k.t = Math.round(fase) + 0.0001;
                while (k.t < fase - 0.5) k.t += 1;
                k.sidsteHalv = Math.floor(k.t * 2);
                if (k.vedAnkomst) k.vedAnkomst();
            }
        }
    }

    function fjernKrone(k) {
        if (k.el.parentNode) k.el.parentNode.removeChild(k.el);
        kroner.splice(kroner.indexOf(k), 1);
    }

    function placer() {
        kroner.forEach(function (k) {
            var p, op = 1, sk = 1;
            if (k.fase === "loop") {
                p = punkt(k.t);
            } else if (k.fase === "ud") {
                var u = Math.min(1, k.u);
                p = { x: k.fra.x + (GRIS.x - k.fra.x) * u, y: k.fra.y + (GRIS.y - 14 - k.fra.y) * u - 50 * Math.sin(Math.PI * u) };
                sk = 1 - 0.4 * u;
            } else if (k.fase === "vaek") {
                p = k.fra;
                op = 1 - Math.min(1, k.u);
                sk = 1 - 0.5 * Math.min(1, k.u);
            } else {
                var a = k.vej[0], b = k.vej[1] || k.vej[0], v = Math.max(0, Math.min(1, k.u));
                p = { x: a.x + (b.x - a.x) * v, y: a.y + (b.y - a.y) * v };
            }
            k.el.setAttribute("transform", "translate(" + p.x.toFixed(1) + "," + p.y.toFixed(1) + ") scale(" + sk.toFixed(3) + ")");
            k.el.style.opacity = op < 1 ? op.toFixed(3) : "";
            k.pos = p;
        });
        if (dele.ringKrone) {
            var kr = dele.ringKrone;
            if (kr.pos) { dele.ring.setAttribute("cx", kr.pos.x.toFixed(1)); dele.ring.setAttribute("cy", kr.pos.y.toFixed(1)); }
        }
    }

    /* Alt, der er paa vej, er fremme med det samme (bruges af selvtesten
       og naar eleven springer til en anden del) */
    function spring() {
        var gange = 0;
        while (kroner.some(function (k) { return k.fase !== "loop"; }) && gange < 200) {
            kroner.slice().forEach(function (k) { if (k.fase !== "loop") { k.u = 1; flyt(k, 0); } });
            gange++;
        }
        placer();
    }

    /* ----- Handlingerne ---------------------------------------------- */
    /* De kroner, der er naermest et sted paa sporet (t = 0 er familierne) */
    function naermest(t0, n) {
        return iSporet().filter(function (k) { return !k.foelg; }).sort(function (a, b) {
            var da = Math.abs(((a.t - t0) % 1 + 1.5) % 1 - 0.5), db = Math.abs(((b.t - t0) % 1 + 1.5) % 1 - 0.5);
            return da - db;
        }).slice(0, n);
    }

    function sparOp(n) {
        naermest(0, n).forEach(function (k) { k.fase = "ud"; k.u = 0; k.fra = k.pos || punkt(k.t); });
        vis("sparegris", true);
    }

    function fjern(n) {
        naermest(0.5, n).forEach(function (k) { k.fase = "vaek"; k.u = 0; k.fra = k.pos || punkt(k.t); });
    }

    function fyr(n) {
        for (var i = arbejdere.length - 1; i >= 0 && n > 0; i--) {
            if (arbejdere[i] === "arbejde") { arbejdere[i] = "ledig"; n--; }
        }
        tegnArbejdere();
    }

    function ansaet(n) {
        for (var i = 0; i < arbejdere.length && n > 0; i++) {
            if (arbejdere[i] === "ledig") { arbejdere[i] = "arbejde"; n--; }
        }
        tegnArbejdere();
    }

    /* Staten betaler loen til n arbejdsloese, som bliver vejarbejdere.
       Kronerne gaar fra staten til arbejderen og videre til familierne. */
    function statGas(n) {
        var ledige = [];
        arbejdere.forEach(function (s, i) { if (s === "ledig") ledige.push(i); });
        ledige.slice(0, n).forEach(function (i, nr) {
            var k = nyKrone("stat");
            k.fase = "ind";
            k.u = -nr * 0.35;
            k.vej = [{ x: STAT.x, y: STAT.y + 10 }, { x: arbejderX(i), y: ARB_Y - 30 }, { x: FAM.x + 40, y: FAM.y + 20 }, punkt(0)];
            k.vedAnkomst = null;
            arbejdere[i] = "vej";
        });
        tegnArbejdere();
        placer();
    }

    function fraSparegris(n) {
        for (var i = 0; i < n && sparet > 0; i++) {
            sparet--;
            var k = nyKrone("alm");
            k.fase = "ind";
            k.u = -i * 0.35;
            k.vej = [{ x: GRIS.x, y: GRIS.y - 14 }, { x: FAM.x + 30, y: FAM.y + 30 }, punkt(0)];
        }
        tegnGris();
        placer();
    }

    /* Ringen og taelleren paa statens krone */
    function foelg(b) {
        foelges = b;
        var k = null;
        kroner.forEach(function (x) { if (!k && x.slags === "stat") k = x; });
        kroner.forEach(function (x) { x.foelg = false; });
        if (b && k) {
            k.foelg = true;
            k.sidsteHalv = Math.floor(k.t * 2);
            brugt = 1;              /* foerste gang: som loen til vejarbejderen */
            dele.ringKrone = k;
            ring("krone");
        } else {
            dele.ringKrone = null;
        }
        visTaeller();
    }

    function ring(hvor) {
        var r = dele.ring;
        dele.ringKrone = hvor === "krone" ? dele.ringKrone : null;
        if (!hvor) { r.setAttribute("visibility", "hidden"); return; }
        var p = { familier: { x: FAM.x, y: FAM.y, r: 64 }, staten: { x: STAT.x, y: STAT.y - 10, r: 74 }, krone: { x: 0, y: 0, r: 19 } }[hvor];
        r.setAttribute("cx", p.x);
        r.setAttribute("cy", p.y);
        r.setAttribute("r", p.r);
        r.setAttribute("class", "k-ring" + (hvor === "krone" ? " lille" : ""));
        r.setAttribute("visibility", "visible");
        placer();
    }

    function skilt(hvor, tekst) {
        var s = dele.skilt;
        if (!hvor) { s.setAttribute("visibility", "hidden"); return; }
        var p = { familier: { x: FAM.x + 10, y: FAM.y - 92 }, staten: { x: STAT.x, y: STAT.y + 58 } }[hvor];
        dele.skiltTekst.textContent = tekst;
        dele.skiltTekst.setAttribute("x", p.x);
        dele.skiltTekst.setAttribute("y", p.y + 6);
        var b = Math.max(120, tekst.length * 8.6 + 26);
        dele.skiltBund.setAttribute("x", p.x - b / 2);
        dele.skiltBund.setAttribute("y", p.y - 15);
        dele.skiltBund.setAttribute("width", b);
        s.setAttribute("visibility", "visible");
    }

    function tal() {
        var job = 0;
        arbejdere.forEach(function (s) { if (s !== "ledig") job++; });
        return {
            kroner: iSporet().length,
            paaVej: kroner.length - iSporet().length,
            job: job,
            vej: arbejdere.filter(function (s) { return s === "vej"; }).length,
            sparet: sparet,
            brugt: brugt,
            foelges: foelges
        };
    }

    NK.Kredsloeb = {
        byg: byg,
        stop: function () { svg = null; },
        nulstil: nulstil,
        pause: function (b) { pauset = !!b; },
        pauset: function () { return pauset; },
        opdater: opdater,
        spring: spring,
        sparOp: sparOp,
        fjern: fjern,
        fyr: fyr,
        ansaet: ansaet,
        statGas: statGas,
        fraSparegris: fraSparegris,
        foelg: foelg,
        vis: vis,
        ring: ring,
        skilt: skilt,
        tal: tal,
        vedKlik: function (fn) { klikFn = fn; }
    };
}());
