/* =====================================================================
   sim_find.js - fane 2: find det asymmetriske C-atom

   Molekylet staar paa tavlen som zigzagformel, tegnet af molekylemotoren
   (../../molekylemotor/). Eleven klikker paa de C-atomer, der har fire
   forskellige grupper (de faar en stjerne, som i bogen), og trykker Tjek,
   eller trykker Intet asymmetrisk C-atom. Knappen Vis alle H tegner
   strukturformlen med alle H, saa grupperne kan taelles.

   De asymmetriske C-atomer regnes af js/kiral.js ud fra molekylets graf,
   og et forkert klik faar grunden: to H, en dobbeltbinding eller to ens
   grupper (med gruppernes formel).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = NK.T;
    var K = NK.Kiral;

    function SimFind() {
        var mig = this;
        this.valg = NK.el("fi-valg");
        this.molekyler = D.FIND.map(function (o) {
            var mol = NK.Smiles.laes(o.smiles);
            var res = NK.Navn.analyser(mol);
            NK.Layout.zigzag(mol, res);
            return { mol: mol, asym: K.asymmetriske(mol) };
        });
        this.startFane(D.FIND, D.FIND_GRUPPER);
        this.vaelg(0);
        window.addEventListener("resize", function () { mig.layout(); });
    }

    var P = SimFind.prototype;
    NK.Fane.paa(P, { navn: "fi", naesteFane: "fane-rs", naesteNavn: "R eller S" });

    P.chipTekst = function (o, i) { return String(i + 1); };

    /* ----- Opgaven ------------------------------------------------------------------- */
    P.lavOpgave = function (i) {
        this.o = this.opgaver[i];
        this.mm = this.molekyler[i];
        this.mol = this.mm.mol;
        this.marker = {};
        this.forkerte = {};
        this.lys = null;
        this.visH = false;
        this.over = null;
        this.bygValg();
    };

    P.bygValg = function () {
        var mig = this;
        this.valg.innerHTML = "";
        this.knapper = {};
        function knap(tekst, noegle, klasse, fn) {
            var k = document.createElement("button");
            k.type = "button";
            k.className = "valgknap" + (klasse ? " " + klasse : "");
            k.textContent = tekst;
            k.addEventListener("click", function () { fn(); mig.fokus(); });
            mig.valg.appendChild(k);
            mig.knapper[noegle] = k;
        }
        knap("Vis alle H", "h", "vend", function () { mig.skiftH(); });
        knap("Tjek", "tjek", "tjek", function () { mig.tjek(); });
        knap("Intet asymmetrisk C-atom", "intet", "", function () { mig.intet(); });
    };

    P.skiftH = function (til) {
        this.visH = til === undefined ? !this.visH : til;
        this.knapper.h.textContent = this.visH ? "Skjul H igen" : "Vis alle H";
        this.knapper.h.classList.toggle("til", this.visH);
        this.bygTegning();
    };

    P.promptHTML = function () {
        return '<p class="maal-tekst">Klik på de asymmetriske C-atomer, og tryk Tjek.</p>' +
            '<p class="note-tekst">' + NK.html(this.o.visNavn) + ". Et asymmetrisk C-atom har fire forskellige grupper. Måske er der ingen.</p>";
    };

    P.trinLinje = function () {
        var n = this.antalMarker();
        if (!n) return "Klik på et C-atom med fire forskellige grupper. Er der ingen, så tryk Intet asymmetrisk C-atom.";
        return "Klik igen for at fjerne en stjerne. Tryk Tjek, når du er færdig.";
    };

    P.antalMarker = function () { return Object.keys(this.marker).length; };

    /* Det C-atom, der ligner et asymmetrisk mest, uden at vaere det */
    P.fristende = function () {
        var mol = this.mol, bedst = null, bedstN = -1;
        mol.atomer.forEach(function (a) {
            if (a.el !== "C") return;
            var gr = K.grupperPaa(mol, a.id);
            var n = {};
            gr.forEach(function (x) { n[x.noegle] = true; });
            var forsk = Object.keys(n).length + (gr.some(function (x) { return x.orden > 1; }) ? 0.5 : 0) - (mol.naboer(a.id).length < 2 ? 2 : 0);
            if (forsk > bedstN) { bedstN = forsk; bedst = a.id; }
        });
        return bedst;
    };

    /* ----- Hinttrappen og Vis svaret ------------------------------------------------- */
    P.hintTrin = function () {
        var asym = this.mm.asym, mig = this;
        var mangler = asym.filter(function (id) { return !mig.marker[id]; });
        var forkert = Object.keys(this.marker).map(Number).filter(function (id) { return asym.indexOf(id) < 0; });
        var t3;
        if (forkert.length) t3 = "Se på det C-atom, der lyser. " + K.grund(this.mol, forkert[0]);
        else if (mangler.length) t3 = "Se på det C-atom, der lyser. Det har " + K.grupperTekst(this.mol, mangler[0]) + ": fire forskellige grupper.";
        else if (!asym.length) t3 = "Se på det C-atom, der lyser. " + K.grund(this.mol, this.fristende()) + " Intet C-atom har fire forskellige grupper.";
        else t3 = "Du har fundet " + (asym.length === 1 ? "det" : "dem alle") + ". Tryk Tjek.";
        return [
            "Et asymmetrisk C-atom har fire forskellige grupper. Et C med to H eller med en dobbeltbinding kan ikke være det.",
            "Nu er alle H tegnet. Se på de C-atomer, der har ét H eller slet intet H, og tæl grupperne.",
            t3
        ];
    };

    P.efterHint = function (n) {
        if (n === 2) this.skiftH(true);
        if (n === 3) {
            var asym = this.mm.asym, mig = this;
            var forkert = Object.keys(this.marker).map(Number).filter(function (id) { return asym.indexOf(id) < 0; });
            var mangler = asym.filter(function (id) { return !mig.marker[id]; });
            this.lys = forkert.length ? forkert[0] : (mangler.length ? mangler[0] : (asym.length ? null : this.fristende()));
        }
    };

    P.visSvar = function () {
        var mig = this;
        this.marker = {};
        this.forkerte = {};
        this.mm.asym.forEach(function (id) { mig.marker[id] = true; });
        this.lys = null;
        this.loest(this.svarTekst());
    };

    P.svarTekst = function () {
        var mol = this.mol, asym = this.mm.asym;
        if (!asym.length) {
            var f = this.fristende();
            return "Intet C-atom har fire forskellige grupper. " + (f !== null ? K.grund(mol, f) : "");
        }
        if (asym.length === 1) return "Det asymmetriske C-atom har " + K.grupperTekst(mol, asym[0]) + ". Så findes " + this.o.navn + " i to enantiomerer.";
        return "Begge de markerede C-atomer har fire forskellige grupper: " + K.grupperTekst(mol, asym[0]) + ".";
    };

    /* ----- Svarene ----------------------------------------------------------------------- */
    P.tjek = function () {
        if (this.faerdig) return;
        var asym = this.mm.asym, mig = this;
        var valgte = Object.keys(this.marker).map(Number);
        if (!valgte.length) {
            this.fejlLinje("Du har ikke markeret noget. Klik på de asymmetriske C-atomer, eller tryk Intet asymmetrisk C-atom.");
            return;
        }
        var forkert = valgte.filter(function (id) { return asym.indexOf(id) < 0; });
        var mangler = asym.filter(function (id) { return !mig.marker[id]; });
        this.forkerte = {};
        if (forkert.length) {
            forkert.forEach(function (id) { mig.forkerte[id] = true; });
            this.fejlLinje(K.grund(this.mol, forkert[0]) + (forkert.length > 1 ? " Der er flere stjerner, der ikke passer." : ""));
            return;
        }
        if (mangler.length) {
            this.fejlLinje("De stjerner, du har sat, er rigtige. Men der er " + (mangler.length === 1 ? "et" : "to") + " asymmetrisk" +
                (mangler.length === 1 ? "" : "e") + " C-atom" + (mangler.length === 1 ? "" : "er") + " mere.");
            return;
        }
        this.loest(this.svarTekst());
    };

    P.intet = function () {
        if (this.faerdig) return;
        var asym = this.mm.asym;
        if (!asym.length) {
            this.marker = {};
            this.knapper.intet.classList.add("rigtig");
            this.loest(this.svarTekst());
            return;
        }
        this.knapper.intet.classList.add("forkert");
        this.fejlLinje("Der er " + (asym.length === 1 ? "et asymmetrisk C-atom" : "to asymmetriske C-atomer") + ". Se efter et C-atom med fire forskellige grupper.");
    };

    P.enter = function () { this.tjek(); };

    /* ----- Layout og tegningen --------------------------------------------------------- */
    P.layout = function () {
        var L = this.L, baand = this.baand();
        var top = 14, side = 18;
        var bund = L.h - Math.max(baand.h, 92) - 62 - 6;
        this.lay = { tavle: { x: side, y: top, b: L.b - side * 2, h: Math.max(200, bund - top) } };
        this.valg.style.bottom = (baand.h + 10) + "px";
        this.saetAnker("tavle", this.lay.tavle.x, top, this.lay.tavle.b, this.lay.tavle.h);
        this.bygTegning();
    };

    P.geoMed = function (s, ox, oy) {
        var mig = this;
        return NK.Struktur.geometri(this.mol, {
            skala: s, ox: ox, oy: oy, stil: this.visH ? "alle" : "zigzag",
            farve: T.KRIDT,
            skrift: NK.klamp(s * 0.38, 14, 28),
            linje: NK.klamp(s * 0.055, 2, 3.6),
            atomFarve: function (id) { return mig.mol.atom(id).el === "O" ? "#ff9d8f" : (mig.mol.atom(id).el === "N" ? "#9cc3ff" : null); }
        });
    };

    /* Tegningen skaleres, saa den fylder tavlen (uden at blive kaempestor) */
    P.bygTegning = function () {
        if (!this.lay || !this.mol) return;
        var tv = this.lay.tavle;
        var s0 = 60;
        var g = this.geoMed(s0, 0, 0);
        var b = (g.x1 - g.x0) || 1, h = (g.y1 - g.y0) || 1;
        var s = Math.min(s0 * (tv.b - 120) / b, s0 * (tv.h - 110) / h, 115);
        g = this.geoMed(s, 0, 0);
        var ox = tv.x + tv.b / 2 - (g.x0 + g.x1) / 2, oy = tv.y + tv.h / 2 + 10 - (g.y0 + g.y1) / 2;
        this.geo = this.geoMed(s, ox, oy);
        this.s = s;
    };

    P.atomVed = function (pt) {
        if (!this.geo) return null;
        var bedst = null, bd = this.s * 0.42;
        var mig = this;
        this.mol.atomer.forEach(function (a) {
            var p = mig.geo.P[a.id];
            if (!p) return;
            var d = Math.hypot(pt.x - p.x, pt.y - p.y);
            if (d < bd) { bd = d; bedst = a.id; }
        });
        return bedst;
    };

    P.overScene = function (pt) {
        if (!pt) { this.over = null; return null; }
        this.over = this.atomVed(pt);
        return this.over !== null && !this.faerdig ? "peg" : null;
    };

    P.klikScene = function (pt) {
        if (this.faerdig) return;
        var id = this.atomVed(pt);
        if (id === null) return;
        var a = this.mol.atom(id);
        if (a.el !== "C") { this.kortBesked("Det er et " + a.el + "-atom. Kun C-atomer kan være asymmetriske her.", 4); return; }
        if (this.marker[id]) delete this.marker[id];
        else this.marker[id] = true;
        delete this.forkerte[id];
        this.lys = null;
        this.nulstilHjaelp();
        this.naesteLinje("", "");
    };

    P.tegn = function () {
        var L = this.L, ctx = L.ctx, tv = this.lay.tavle, mig = this;
        L.ryd("#14141a");
        T.tavle(ctx, tv, this.faerdig ? "rgba(95,207,146,0.75)" : null);
        NK.tekst(ctx, this.o.visNavn, tv.x + 24, tv.y + 36, { font: "700 17px 'Segoe UI', sans-serif", farve: "#9fb1a9" });
        if (!this.geo) return;
        var s = this.s;
        /* Ringene under tegningen: musen, hintet, stjernerne */
        function ring(id, farve, fyld) {
            var p = mig.geo.P[id];
            ctx.save();
            ctx.beginPath();
            ctx.arc(p.x, p.y, s * 0.3, 0, Math.PI * 2);
            if (fyld) { ctx.fillStyle = fyld; ctx.fill(); }
            ctx.strokeStyle = farve;
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.restore();
        }
        if (this.over !== null && !this.faerdig && this.mol.atom(this.over).el === "C") ring(this.over, "rgba(242,197,61,0.6)", "rgba(242,197,61,0.08)");
        if (this.lys !== null) ring(this.lys, T.GUL, "rgba(242,197,61,0.18)");
        Object.keys(this.marker).forEach(function (k) {
            var id = Number(k);
            var farve = mig.forkerte[id] ? T.ROED : (mig.faerdig ? T.GROEN : T.GUL);
            ring(id, farve, mig.forkerte[id] ? "rgba(240,121,108,0.16)" : (mig.faerdig ? "rgba(95,207,146,0.16)" : "rgba(242,197,61,0.12)"));
        });
        NK.Struktur.tegnGeo(ctx, this.geo);
        /* Stjernen ved det markerede C-atom, som i bogen */
        Object.keys(this.marker).forEach(function (k) {
            var id = Number(k), p = mig.geo.P[id];
            var farve = mig.forkerte[id] ? T.ROED : (mig.faerdig ? T.GROEN : T.GUL);
            NK.tekst(ctx, "*", p.x + s * 0.3, p.y - s * 0.12, { font: "800 " + Math.round(s * 0.55) + "px 'Segoe UI', sans-serif", farve: farve, justering: "left" });
        });
    };

    P.fokusFelt = function () { };

    NK.SimFind = SimFind;
}());
