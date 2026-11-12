/* =====================================================================
   sim_fordeling.js - fane 2: Fordelingsdiagrammet

   Tre trin (D.FORDELING):
     1 spor   eleven traekker pH-skyderen fra 0 til 14, og diagrammet
              tegnes dér, hvor skyderen har vaeret; vinduet viser 20
              valinmolekyler og deres former. Skyderen begynder ved pH 0,
              og knappen glider hoejst D.TEGNEFART pH pr. sekund, saa
              diagrammet tegnes roligt (brugeren 12. nov. 2026). Kortet
              bliver staaende, naar diagrammet er tegnet
     2 find   eleven stiller skyderen dér, hvor der er lige meget
              syreform og amfoion (pH = pKₛ = 2,32), og trykker Indsend
     3 tal    eleven regner pHᵢₛₒ = ½ · (2,32 + 9,62) = 5,97 og skriver det
   Bagefter staar linjen ved det isoelektriske punkt i diagrammet.

   Modellen: andelene er bogens (D.andele). De 20 molekyler har hver sin
   faste plads i en raekkefoelge, saa et molekyle skifter form, naar
   andelen gaar forbi det: de foerste er syreform, de sidste baseform.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var M = NK.Mol;
    var F = NK.Fane;
    var T = NK.Tegning;
    var NOEGLE = "nk-sb7.7-fordeling";
    var ANTAL_BIN = Math.round(14 / D.PH_SKRIDT) + 1;       /* 141 */
    var BLINK = 0.6;

    function SimFordeling() {
        var mig = this;
        this.trinListe = D.FORDELING;
        this.hentStatus();
        this.startFane();
        NK.el("d-forfra").addEventListener("click", function () { mig.forfra(); });
        /* Feltet paa kortet: det, eleven skriver, bliver husket, og Enter sender */
        this.el.skort.addEventListener("input", function (e) {
            if (e.target && e.target.id === "d-felt") { mig.talTekst = e.target.value; e.target.classList.remove("ryst"); mig.visIndsend(); }
        });
        this.el.skort.addEventListener("keydown", function (e) {
            if (e.target && e.target.id === "d-felt" && e.key === "Enter") { e.preventDefault(); mig.indsendKlik(); }
        });
        /* Molekylerne: en fast raekkefoelge og lidt liv */
        this.mol = [];
        var orden = NK.bland(Array.apply(null, { length: D.ANTAL_MOL }).map(function (x, i) { return i; }));
        for (var i = 0; i < D.ANTAL_MOL; i++) this.mol.push({ rang: orden[i], fase: Math.random() * 6.28, blink: 0, form: null });
    }

    var P = SimFordeling.prototype;
    F.paa(P, "d");

    /* ----- Hukommelsen ------------------------------------------------------------ */
    P.hentStatus = function () {
        var g = NK.hent(NOEGLE, {}) || {};
        this.status = { loest: !!g.l, stjerne: !!g.s };
    };
    P.gem = function () { NK.gem(NOEGLE, { l: this.status.loest ? 1 : 0, s: this.status.stjerne ? 1 : 0 }); };
    P.naesteUloeste = function () { return 0; };

    /* ----- Panelet ------------------------------------------------------------------ */
    P.visListe = function () {
        var mig = this, html = "";
        this.trinListe.forEach(function (t, j) {
            var kl = j < mig.trinNr || (j === mig.trinNr && mig.groen) || mig.faerdig ? "faerdig" : (j === mig.trinNr ? "nu" : "");
            html += '<li class="' + kl + '"><span class="tr-nr">' + (j + 1) + "</span><span>" + NK.Data.sub(NK.html(t.navn)) + "</span></li>";
        });
        NK.saetHTML("d-trin", html);
        NK.saetTekst("d-maerke", this.status.stjerne ? "★ gennemført uden fejl" : (this.status.loest ? "✓ gennemført" : ""));
    };

    /* ----- Antallet af hver form blandt de 20 (stoerste rest) ------------------------- */
    P.antal = function (ph) {
        var a = D.andele(ph), n = D.ANTAL_MOL;
        var r = [["syre", a.syre * n], ["amfo", a.amfo * n], ["base", a.base * n]];
        var hel = r.map(function (x) { return Math.floor(x[1]); }), sum = hel[0] + hel[1] + hel[2];
        var rest = r.map(function (x, i) { return { i: i, r: x[1] - hel[i] }; }).sort(function (p, q) { return q.r - p.r; });
        for (var k = 0; sum < n; k++, sum++) hel[rest[k].i]++;
        return { syre: hel[0], amfo: hel[1], base: hel[2] };
    };

    P.formAf = function (m) {
        var n = this.antalNu;
        if (m.rang < n.syre) return "syreform";
        if (m.rang >= D.ANTAL_MOL - n.base) return "baseform";
        return "amfoion";
    };
    var TILST = { syreform: { amino: 1, carboxyl: 1 }, amfoion: { amino: 1, carboxyl: 0 }, baseform: { amino: 0, carboxyl: 0 } };

    /* ----- Forloebet ------------------------------------------------------------------ */
    P.vaelg = function () {
        this.fejl = false;
        this.sv = false;
        this.faerdig = false;
        this.fri = true;
        this.sejrT = null;
        this.besoegt = [];
        for (var i = 0; i < ANTAL_BIN; i++) this.besoegt.push(false);
        this.visPks = false;
        this.visIso = false;
        this.phMaal = null;
        this.traekMaal = null;
        this.saetPh(0, true);
        this.mol.forEach(function (m) { m.form = null; m.blink = 0; });
        this.opdaterMol(true);
        this.startTrin(0);
    };

    P.startTrin = function (j) {
        this.trinNr = j;
        this.trin = this.trinListe[j];
        this.fase = this.trin.slags;
        this.groen = null;
        this.talTekst = "";
        this.besked("", "");
        this.nulstilHjaelp();
        this.visKort();
        this.visListe();
        this.layout();
    };

    P.kortData = function () {
        var t = this.trin, chip = "Trin " + (this.trinNr + 1) + " af " + this.trinListe.length;
        if (this.fase === "spor") return { slags: "opgave", chip: chip, tekst: t.tekst };
        if (this.fase === "tal") {
            var v = NK.html(this.talTekst || "");
            return { slags: "spm", chip: chip, tekst: t.tekst,
                     ekstra: '<div class="sk-felt"><label for="d-felt">pH<sub>iso</sub> =</label><input id="d-felt" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" value="' + v + '" placeholder="tallet med komma"></div>' };
        }
        return { slags: "spm", chip: chip, tekst: t.tekst };
    };

    P.skjulIndsend = function () { return this.fase === "spor"; };

    P.svarValg = function () { /* ingen svarknapper paa denne fane */ };

    P.kanSendes = function () {
        if (this.fase === "find") return true;
        if (this.fase === "tal") return !!(this.talTekst && this.talTekst.trim());
        return false;
    };
    P.indsendTekst = function () {
        if (this.fase === "find") return "Indsend svar: pH " + D.komma1(this.ph);
        return "Indsend svar";
    };
    P.ingentingTekst = function () { return this.trin.fejlIntet || "Skriv et tal først."; };

    P.tal = function () {
        var s = String(this.talTekst || "").replace(/pH|iso|=|\s/gi, "").replace(",", ".").replace("−", "-");
        if (!/^-?\d*\.?\d+$/.test(s)) return NaN;
        return parseFloat(s);
    };

    P.indsend = function () {
        var t = this.trin;
        if (this.fase === "find") {
            if (Math.abs(this.ph - t.maal) <= t.tol + 1e-9) { this.rigtigt(false); return; }
            this.fejl = true;
            this.fejlLinje(D.findFejl(this.ph));
            return;
        }
        if (this.fase === "tal") {
            var x = this.tal(), tekst = null;
            if (isNaN(x)) { this.kortBlink(); this.kortBesked(t.fejlIntet, 3.5); return; }
            if (Math.abs(x - t.maal) <= 0.006) { this.rigtigt(false); return; }
            if (Math.abs(x - (D.PKS1 + D.PKS2)) < 0.02) tekst = t.fejlSum;
            else if (Math.abs(x - (D.PKS2 - D.PKS1)) < 0.02) tekst = t.fejlDiff;
            else if (Math.abs(x - t.maal) < 0.06) tekst = t.fejlAfrund;
            else tekst = t.fejlAndet;
            this.fejl = true;
            this.fejlLinje(tekst);
            var f = NK.el("d-felt");
            if (f) { f.classList.remove("ryst"); void f.offsetWidth; f.classList.add("ryst"); }
        }
    };

    P.rigtigt = function (vist) {
        var t = this.trin, sidste = this.trinNr === this.trinListe.length - 1, tekst = t.forkl, foerste = false;
        if (this.fase === "find") this.visPks = true;
        if (this.fase === "tal") { this.visIso = true; this.phMaal = D.ISO; }
        if (sidste) {
            foerste = !this.status.loest;
            this.status.loest = true;
            this.status.stjerne = this.status.stjerne || (!this.fejl && !this.sv && !vist);
            this.gem();
            this.faerdig = true;
            tekst += " " + D.FORDELING_FAERDIG;
        }
        this.groen = { spm: true, maade: vist || this.sv ? "svar" : "selv", tekst: tekst,
                       knap: sidste ? "Videre til Det elektriske felt →" : "Næste trin →" };
        this.sejrT = 0;
        this.besked("", "");
        this.visKort();
        this.visListe();
        if (sidste && foerste) NK.konfettiRegn(NK.el("fane-d").querySelector(".scene"), 60);
    };

    P.videre = function () {
        if (this.trinNr < this.trinListe.length - 1) { this.startTrin(this.trinNr + 1); return; }
        if (NK.visFane) NK.visFane("fane-e");
    };

    P.forfra = function () {
        this.status = { loest: false, stjerne: false };
        this.gem();
        this.vaelg(0);
    };

    P.nulstil = function () { if (!this.groen) this.vaelg(0); };

    P.hintNu = function () {
        if (this.groen) return [];
        return this.trin.hint || [];
    };

    /* Diagrammet er tegnet: kortet bliver staaende med en knap videre */
    P.sporFaerdig = function (vist) {
        this.groen = { spm: true, maade: vist ? "svar" : "selv", maerke: vist ? "Svaret" : "Tegnet", tekst: this.trin.forkl, knap: "Næste trin →" };
        this.sejrT = 0;
        this.besked("", "");
        this.visKort();
        this.visListe();
    };

    P.visSvar = function () {
        this.sv = true;
        if (this.fase === "spor") {
            for (var i = 0; i < ANTAL_BIN; i++) this.besoegt[i] = true;
            this.sporFaerdig(true);
            return;
        }
        if (this.fase === "find") { this.saetPh(this.trin.maal); this.rigtigt(true); return; }
        if (this.fase === "tal") { this.talTekst = D.komma2(this.trin.maal); this.rigtigt(true); }
    };

    /* ----- pH, sporet og molekylerne --------------------------------------------------- */
    P.bin = function (ph) { return NK.klamp(Math.round(ph / D.PH_SKRIDT), 0, ANTAL_BIN - 1); };

    P.saetPh = function (ph, foerste) {
        ph = Math.round(NK.klamp(ph, 0, 14) / D.PH_SKRIDT) * D.PH_SKRIDT;
        var b1 = this.bin(ph);
        if (!foerste && this.ph !== undefined) {
            var b0 = this.bin(this.ph);
            for (var b = Math.min(b0, b1); b <= Math.max(b0, b1); b++) this.besoegt[b] = true;
        } else this.besoegt[b1] = true;
        this.ph = ph;
        this.opdaterMol(false);
        if (this.fase === "spor" && !this.groen && this.daekning() >= D.DAEKNING) this.sporFaerdig(false);
        if (this.fase === "find" && !this.groen) this.visIndsend();
    };

    P.daekning = function () {
        var n = 0;
        this.besoegt.forEach(function (b) { if (b) n++; });
        return n / ANTAL_BIN;
    };

    P.opdaterMol = function (stille) {
        var mig = this;
        this.antalNu = this.antal(this.ph);
        this.mol.forEach(function (m) {
            var f = mig.formAf(m);
            if (m.form !== f) { if (m.form && !stille) m.blink = BLINK; m.form = f; }
        });
    };

    P.opdaterScene = function (dt) {
        this.mol.forEach(function (m) { m.fase += dt * 1.3; if (m.blink > 0) m.blink = Math.max(0, m.blink - dt); });
        if (this.phMaal !== null) {
            var ny = NK.mod(this.ph, this.phMaal, 6, dt);
            if (Math.abs(ny - this.phMaal) < 0.02) { ny = this.phMaal; this.phMaal = null; }
            this.ph = ny;
            this.antalNu = this.antal(this.ph);
            var mig = this;
            this.mol.forEach(function (m) { var f = mig.formAf(m); if (m.form !== f) { m.blink = BLINK; m.form = f; } });
        }
        /* Mens diagrammet tegnes, glider knappen roligt hen mod musen */
        if (this.traekMaal !== null) {
            var skridt = D.TEGNEFART * dt, rest = this.traekMaal - this.glid;
            if (Math.abs(rest) <= skridt) { this.glid = this.traekMaal; this.traekMaal = null; }
            else this.glid += rest > 0 ? skridt : -skridt;
            this.saetPh(this.glid);
        }
    };

    /* ----- Musen --------------------------------------------------------------------- */
    P.overScene = function (pt) {
        if (!pt) return null;
        if (T.paaSkala(this.skala, pt)) return "ew-resize";
        return null;
    };

    P.langsom = function () { return this.fase === "spor" && !this.groen; };

    /* Skyderen: i trin 1 glider knappen hen mod musen, ellers foelger den musen */
    P.traekTil = function (ph) {
        if (this.langsom()) {
            if (this.traekMaal === null) this.glid = this.ph;
            this.traekMaal = NK.klamp(ph, 0, 14);
        } else {
            this.traekMaal = null;
            this.saetPh(ph);
        }
    };

    P.nedScene = function (pt) {
        if (!T.paaSkala(this.skala, pt)) return false;
        this.grebSkyder = true;
        this.phMaal = null;
        this.traekTil(T.xTilPh(this.skala, pt.x));
        return true;
    };

    P.flytScene = function (pt) { if (this.grebSkyder) this.traekTil(T.xTilPh(this.skala, pt.x)); };
    P.opScene = function () { this.grebSkyder = false; };

    P.klikScene = function () {
        if (this.groen) { this.kortBlink(); return; }
        this.kortBlink();
        this.kortBesked("Træk i pH-skyderen under diagrammet.", 3);
    };

    /* ----- Layout ------------------------------------------------------------------------ */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle;
        /* Vinduet til venstre, diagrammet til hoejre og skyderen under diagrammet */
        var vb = Math.round(NK.klamp(t.b * 0.3, 210, 320));
        var ph = Math.round((vb - 28) / 4);                      /* bredden af en plads i vinduet */
        var vh = Math.min(t.h - 96, Math.round(ph * 0.62 * 5 + 30));
        this.vindue = { x: t.x + 18, y: t.y + 40, b: vb, h: Math.max(150, vh) };
        var dx0 = this.vindue.x + vb + 78, dx1 = t.x + t.b - 26;
        var dy0 = t.y + 34, dy1 = t.y + t.h - 122;
        this.dia = { x0: dx0, x1: dx1, y0: dy0, y1: dy1 };
        this.skala = { x: dx0, y: t.y + t.h - 30, b: dx1 - dx0 };
        this.saetAnker("vindue", this.vindue.x - 4, this.vindue.y - 30, vb + 8, this.vindue.h + 92);
        this.saetAnker("dia", dx0 - 60, dy0 - 18, dx1 - dx0 + 70, dy1 - dy0 + 50);
        this.saetAnker("skyder", dx0 - 36, this.skala.y - 46, dx1 - dx0 + 72, 70);
    };

    P.X = function (ph) { return this.dia.x0 + (this.dia.x1 - this.dia.x0) * ph / 14; };
    P.Y = function (andel) { return this.dia.y1 - (this.dia.y1 - this.dia.y0) * andel; };

    /* ----- Tegning --------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var t = lay.tavle;
        if (t.b < 160) return;
        T.tavle(ctx, lay);
        this.tegnVindue(ctx);
        this.tegnDiagram(ctx);
        T.phSkala(ctx, this.skala, this.ph, { greb: this.grebSkyder, navn: false });
        NK.tekst(ctx, "pH", this.skala.x - 14, this.skala.y + 1, { font: "800 14px " + T.FONT, farve: T.BLAEK, justering: "right", linje: "middle" });
        if (this.fase === "spor" && !this.groen && this.daekning() < 0.2) {
            T.skilt(ctx, T.phTilX(this.skala, this.ph), this.skala.y - 44, "Træk i skyderen", { min: t.x + 6, maks: t.x + t.b - 6 });
        }
        this.tegnSejr(ctx, t);
    };

    P.tegnVindue = function (ctx) {
        var v = this.vindue, mig = this, F2 = D.FARVE;
        NK.tekst(ctx, "20 valinmolekyler", v.x + v.b / 2, v.y - 16, { font: "800 14px " + T.FONT, farve: T.BLAEK, justering: "center", linje: "middle" });
        T.vindue(ctx, v.x, v.y, v.b, v.h);
        var kol = 4, rk = 5, cb = (v.b - 20) / kol, ch = (v.h - 16) / rk;
        var pb = Math.min(cb - 8, 76), phh = Math.min(ch - 10, pb * 0.36);
        this.mol.forEach(function (m, i) {
            var c = i % kol, r = Math.floor(i / kol);
            var x = v.x + 10 + cb * (c + 0.5) + Math.sin(m.fase) * 2.5, y = v.y + 8 + ch * (r + 0.5) + Math.cos(m.fase * 0.8) * 2;
            T.pille(ctx, x, y, pb, phh, TILST[m.form], { vinkel: Math.sin(m.fase * 0.6) * 0.08, blink: m.blink / BLINK });
        });
        /* Antallet af hver form */
        var n = this.antalNu, y0 = v.y + v.h + 20;
        [["syreform", n.syre, F2.syre], ["amfoion", n.amfo, F2.amfo], ["baseform", n.base, F2.base]].forEach(function (d, k) {
            var x = v.x + v.b * (k + 0.5) / 3;
            NK.tekst(ctx, d[0], x, y0, { font: "700 13px " + T.FONT, farve: d[2], justering: "center", linje: "middle" });
            NK.tekst(ctx, String(d[1]), x, y0 + 18, { font: "800 16px " + T.FONT, farve: d[2], justering: "center", linje: "middle" });
        });
        void mig;
    };

    P.tegnDiagram = function (ctx) {
        var d = this.dia, mig = this, F2 = D.FARVE;
        /* Fladen og nettet som i bogens grafer */
        ctx.save();
        var g = ctx.createLinearGradient(0, d.y0, 0, d.y1);
        g.addColorStop(0, "#f7fbfb");
        g.addColorStop(1, "#edf3f2");
        ctx.fillStyle = g;
        ctx.fillRect(d.x0, d.y0, d.x1 - d.x0, d.y1 - d.y0);
        ctx.strokeStyle = "#d5e2e0";
        ctx.lineWidth = 1;
        [0.25, 0.5, 0.75, 1].forEach(function (a) { ctx.beginPath(); ctx.moveTo(d.x0, mig.Y(a)); ctx.lineTo(d.x1, mig.Y(a)); ctx.stroke(); });
        ctx.strokeStyle = "#556766";
        ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(d.x0, d.y0 - 6); ctx.lineTo(d.x0, d.y1); ctx.lineTo(d.x1 + 4, d.y1); ctx.stroke();
        ctx.restore();
        [0, 25, 50, 75, 100].forEach(function (a) {
            NK.tekst(ctx, String(a), d.x0 - 8, mig.Y(a / 100), { font: "600 12px " + T.FONT, farve: "#556766", justering: "right", linje: "middle" });
        });
        for (var p = 0; p <= 14; p += 2) {
            NK.tekst(ctx, String(p), this.X(p), d.y1 + 14, { font: "600 12px " + T.FONT, farve: "#556766", justering: "center", linje: "middle" });
        }
        NK.tekst(ctx, "pH", (d.x0 + d.x1) / 2, d.y1 + 32, { font: "600 13px " + T.FONT, farve: "#556766", justering: "center", linje: "middle" });
        ctx.save();
        ctx.translate(d.x0 - 40, (d.y0 + d.y1) / 2);
        ctx.rotate(-Math.PI / 2);
        NK.tekst(ctx, "andel i procent", 0, 0, { font: "600 13px " + T.FONT, farve: "#556766", justering: "center", linje: "middle" });
        ctx.restore();

        /* Linjen ved det isoelektriske punkt */
        if (this.visIso) {
            ctx.save();
            ctx.strokeStyle = "#8fa3a1";
            ctx.lineWidth = 1.4;
            ctx.beginPath(); ctx.moveTo(this.X(D.ISO), d.y0 - 4); ctx.lineTo(this.X(D.ISO), d.y1); ctx.stroke();
            ctx.restore();
            NK.tekst(ctx, "isoelektrisk punkt", this.X(D.ISO), d.y0 - 12, { font: "700 13px " + T.FONT, farve: "#556766", justering: "center", linje: "middle" });
        }

        /* Kurverne, dér hvor skyderen har vaeret */
        ctx.save();
        ctx.beginPath(); ctx.rect(d.x0, d.y0 - 4, d.x1 - d.x0 + 2, d.y1 - d.y0 + 8); ctx.clip();
        [["syre", F2.syre], ["base", F2.base], ["amfo", F2.amfo]].forEach(function (k) {
            ctx.strokeStyle = k[1];
            ctx.lineWidth = 3;
            ctx.lineJoin = "round";
            ctx.lineCap = "round";
            ctx.beginPath();
            var tegner = false;
            for (var b = 0; b < ANTAL_BIN; b++) {
                if (!mig.besoegt[b]) { tegner = false; continue; }
                for (var s = 0; s < 4; s++) {
                    if (s > 0 && (b === ANTAL_BIN - 1 || !mig.besoegt[b + 1])) break;
                    var phv = (b + s / 4) * D.PH_SKRIDT, x = mig.X(phv), y = mig.Y(D.andele(phv)[k[0]]);
                    if (!tegner) { ctx.moveTo(x, y); tegner = true; } else ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        });
        ctx.restore();

        /* Navnene paa kurverne, naar deres omraade er tegnet */
        var bes = function (ph) { return mig.besoegt[mig.bin(ph)]; };
        [[0.3, 0.42, "syreform", "ladning +1", F2.syre, "left", 1.0], [D.ISO, 0.76, "amfoion", "ladning 0", F2.amfo, "center", D.ISO],
         [13.7, 0.42, "baseform", "ladning −1", F2.base, "right", 13]].forEach(function (l) {
            if (!bes(l[6])) return;
            var kant = { kant: true, kantFarve: "#f4f8f8", kantBredde: 5 };
            NK.tekst(ctx, l[2], mig.X(l[0]), mig.Y(l[1]), Object.assign({ font: "800 14px " + T.FONT, farve: l[4], justering: l[5], linje: "middle" }, kant));
            NK.tekst(ctx, l[3], mig.X(l[0]), mig.Y(l[1]) + 17, Object.assign({ font: "600 13px " + T.FONT, farve: l[4], justering: l[5], linje: "middle" }, kant));
        });

        /* Krydspunkterne, naar pKₛ er fundet */
        if (this.visPks) {
            [D.PKS1, D.PKS2].forEach(function (q) {
                var x = mig.X(q), y = mig.Y(0.5);
                ctx.save();
                ctx.beginPath(); ctx.arc(x, y, 6.5, 0, Math.PI * 2); ctx.fillStyle = "#ffffff"; ctx.fill();
                ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.lineWidth = 1.8; ctx.strokeStyle = D.FARVE.blaek; ctx.stroke();
                ctx.restore();
                M.tekst(ctx, "pK_s = " + D.komma2(q).replace(".", ","), x + 10, y + 18, 13, "#556766", "left");
            });
        }

        /* Markoeren ved skyderens pH med en prik paa hver kurve */
        var xc = this.X(this.ph), a = D.andele(this.ph);
        ctx.save();
        ctx.strokeStyle = "rgba(42, 51, 66, 0.55)";
        ctx.lineWidth = 1.4;
        ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.moveTo(xc, d.y0); ctx.lineTo(xc, this.skala.y - 12); ctx.stroke();
        ctx.restore();
        [["syre", F2.syre], ["amfo", F2.amfo], ["base", F2.base]].forEach(function (k) {
            ctx.save();
            ctx.beginPath(); ctx.arc(xc, mig.Y(a[k[0]]), 5.5, 0, Math.PI * 2);
            ctx.fillStyle = k[1];
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        });
    };

    NK.SimFordeling = SimFordeling;
}());
