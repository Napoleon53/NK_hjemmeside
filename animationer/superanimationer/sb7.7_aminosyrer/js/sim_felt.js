/* =====================================================================
   sim_felt.js - fane 3: Det elektriske felt

   Fire trin (D.FELT):
     1 gaet     asparaginsyre, valin og lysin midt paa et papir med pH 6;
                hvilken vandrer mod minuspolen?
     2 stroem   strømmen sluttes: formlerne viser formerne ved pH 6, og
                pletterne vandrer efter deres ladning
     3 lysin    hvorfor vandrer lysin mod minuspolen?
     4 ph1      ved hvilken pH vandrer alle tre mod minuspolen? (pH 1, og
                saa koerer forsoeget igen ved pH 1)
   Bagefter er pH-skyderen fri, og pletterne vandrer igen, naar eleven
   slipper den.

   Modellen: en plet flytter sig D.VANDRING af den halve strimmel for hver
   ladning (gennemsnittet D.ladning ved pH). d er positiv mod minuspolen til
   venstre, saa en positiv aminosyre vandrer mod minuspolen. Stoerrelsen er
   ikke med.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var M = NK.Mol;
    var F = NK.Fane;
    var T = NK.Tegning;
    var NOEGLE = "nk-sb7.7-felt";

    var KOER = 2.4;          /* sekunder, strømmen er sluttet */
    var EFTER = 0.8;         /* pause efter forsoeget, foer spoergsmaalet */
    var IGEN = 0.35;         /* pletterne kommer tilbage til start */

    function SimFelt() {
        var mig = this;
        this.trinListe = D.FELT;
        this.hentStatus();
        this.startFane();
        NK.el("e-forfra").addEventListener("click", function () { mig.forfra(); });
        this.el.skort.addEventListener("click", function (e) {
            if (e.target.closest && e.target.closest("[data-udfoer]")) mig.udfoer();
        });
    }

    var P = SimFelt.prototype;
    F.paa(P, "e");

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
            html += '<li class="' + kl + '"><span class="tr-nr">' + (j + 1) + "</span><span>" + NK.html(t.navn) + "</span></li>";
        });
        NK.saetHTML("e-trin", html);
        NK.saetTekst("e-maerke", this.status.stjerne ? "★ gennemført uden fejl" : (this.status.loest ? "✓ gennemført" : ""));
    };

    /* ----- Forloebet ------------------------------------------------------------------ */
    P.vaelg = function () {
        this.fejl = false;
        this.sv = false;
        this.faerdig = false;
        this.fri = false;
        this.sejrT = null;
        this.gaet = {};
        this.ph = 6;
        this.vis = "bog";
        this.koer = null;
        this.igen = null;
        this.efterT = null;
        this.d = {};
        this.d0 = {};
        this.dMaal = {};
        var mig = this;
        D.FELT_RAEKKE.forEach(function (id) { mig.d[id] = 0; mig.d0[id] = 0; mig.dMaal[id] = 0; });
        this.startTrin(0);
    };

    P.startTrin = function (j) {
        this.trinNr = j;
        this.trin = this.trinListe[j];
        this.fase = this.trin.slags;
        this.valgt = null;
        this.forkert = {};
        this.groen = null;
        this.besked("", "");
        this.nulstilHjaelp();
        this.visKort();
        this.visListe();
        this.layout();
    };

    P.kortData = function () {
        var mig = this, t = this.trin, chip = "Trin " + (this.trinNr + 1) + " af " + this.trinListe.length;
        if (this.fase === "gaet") {
            return { slags: "spm", chip: chip + " · Gæt først", tekst: t.tekst,
                     svar: t.svar.map(function (s, j) { return { t: s, valgt: mig.valgt === j }; }) };
        }
        if (this.fase === "forsoeg") {
            if (this.koer || this.efterT !== null) return { slags: "opgave", chip: chip, tekst: t.koerer };
            return { slags: "opgave", chip: chip, tekst: t.tekst,
                     ekstra: '<div class="sk-handling"><button type="button" class="knap blaa" data-udfoer="1">' + NK.html(t.knap) + "</button></div>" };
        }
        return { slags: "spm", chip: chip, tekst: t.tekst,
                 svar: t.svar.map(function (s, j) { return { t: s, valgt: mig.valgt === j, forkert: !!mig.forkert[j] }; }) };
    };

    P.skjulIndsend = function () { return this.fase === "forsoeg"; };
    P.skjulHint = function () { return this.fase === "forsoeg" || this.fase === "gaet"; };

    P.svarValg = function (j) {
        if (this.fase === "forsoeg") return;
        this.valgt = this.valgt === j ? null : j;
        this.visKort();
    };

    P.kanSendes = function () { return this.fase !== "forsoeg" && this.valgt !== null; };
    P.indsendTekst = function () {
        if (this.valgt === null) return "Indsend svar";
        if (this.fase === "gaet") return "Indsend svar: " + this.trin.svar[this.valgt];
        return "Indsend svar";
    };
    P.ingentingTekst = function () { return "Vælg et af svarene på kortet først."; };

    P.indsend = function () {
        if (this.fase === "gaet") {
            /* Et gaet er gratis: det bliver husket, og forsoeget kommer */
            this.gaet[this.trin.id] = this.valgt;
            this.startTrin(this.trinNr + 1);
            return;
        }
        this.bedoem(false);
    };

    P.bedoem = function (vist) {
        var t = this.trin;
        if (this.valgt !== t.rigtig) {
            this.fejl = true;
            var tekst = t.fejl[this.valgt];
            this.forkert[this.valgt] = true;
            this.valgt = null;
            this.visKort();
            this.fejlLinje(tekst);
            return;
        }
        var sidste = this.trinNr === this.trinListe.length - 1, tekst2 = t.forkl, foerste = false;
        if (t.id === "ph1") this.nyRunde(t.ph);
        if (sidste) {
            foerste = !this.status.loest;
            this.status.loest = true;
            this.status.stjerne = this.status.stjerne || (!this.fejl && !this.sv && !vist);
            this.gem();
            this.faerdig = true;
            this.fri = true;
            tekst2 += " " + D.FELT_FAERDIG;
        }
        this.groen = { spm: true, svarNr: t.rigtig, maade: vist || this.sv ? "svar" : "selv", tekst: tekst2,
                       knap: sidste ? "Se teorien →" : "Næste trin →" };
        this.sejrT = 0;
        this.besked("", "");
        this.visKort();
        this.visListe();
        if (sidste && foerste) NK.konfettiRegn(NK.el("fane-e").querySelector(".scene"), 60);
    };

    P.videre = function () {
        if (this.trinNr < this.trinListe.length - 1) { this.startTrin(this.trinNr + 1); return; }
        var e = NK.el("teori");
        if (e) { e.classList.add("vis"); if (NK.tegnTeori) NK.tegnTeori(); }
    };

    P.forfra = function () {
        this.status = { loest: false, stjerne: false };
        this.gem();
        this.vaelg(0);
    };

    P.nulstil = function () { if (!this.groen && !this.koer) this.vaelg(0); };

    P.hintNu = function () {
        if (this.groen || this.fase !== "spm") return [];
        return this.trin.hint;
    };

    P.visSvar = function () {
        this.sv = true;
        this.valgt = this.trin.rigtig;
        this.bedoem(true);
    };

    /* ----- Forsoeget -------------------------------------------------------------------- */
    P.udfoer = function () {
        if (this.fase !== "forsoeg" || this.koer || this.efterT !== null) return;
        this.vis = "ion";
        this.startKoer();
        this.visKort();
    };

    P.ladning = function (id) { return D.ladning(D.AMINOSYRER[id], this.ph); };

    P.startKoer = function () {
        var mig = this;
        this.koer = { t: 0 };
        D.FELT_RAEKKE.forEach(function (id) {
            mig.d0[id] = mig.d[id];
            mig.dMaal[id] = NK.klamp(mig.ladning(id) * D.VANDRING, -0.92, 0.92);
        });
    };

    /* Pletterne kommer tilbage til start, og forsoeget koerer ved en ny pH */
    P.nyRunde = function (ph) {
        var mig = this;
        this.ph = Math.round(ph / D.PH_SKRIDT) * D.PH_SKRIDT;
        this.vis = "ion";
        this.koer = null;
        D.FELT_RAEKKE.forEach(function (id) { mig.d[id] = 0; });
        this.igen = { t: 0 };
    };

    P.opdaterScene = function (dt) {
        var mig = this;
        if (this.igen) {
            this.igen.t += dt;
            if (this.igen.t >= IGEN) { this.igen = null; this.startKoer(); }
        }
        if (this.koer) {
            this.koer.t += dt;
            var u = NK.blod(this.koer.t / KOER);
            D.FELT_RAEKKE.forEach(function (id) { mig.d[id] = NK.lerp(mig.d0[id], mig.dMaal[id], u); });
            if (this.koer.t >= KOER) {
                this.koer = null;
                if (this.fase === "forsoeg" && !this.groen) { this.efterT = EFTER; this.visKort(); }
            }
        }
        if (this.efterT !== null) {
            this.efterT -= dt;
            if (this.efterT <= 0) { this.efterT = null; if (this.fase === "forsoeg") this.startTrin(this.trinNr + 1); }
        }
    };

    /* ----- Musen --------------------------------------------------------------------- */
    P.paaPapir = function (pt) {
        var s = this.strimmel;
        return pt && s && pt.x > s.x - 50 && pt.x < s.x + s.b + 50 && pt.y > s.y && pt.y < s.y + s.h;
    };

    P.overScene = function (pt) {
        if (!pt) return null;
        if (T.paaSkala(this.skala, pt)) return this.fri ? "ew-resize" : "not-allowed";
        if (this.fase === "forsoeg" && !this.koer && this.efterT === null && this.paaPapir(pt)) return "pointer";
        return null;
    };

    P.nedScene = function (pt) {
        if (!T.paaSkala(this.skala, pt) || !this.fri) return false;
        this.grebSkyder = true;
        this.saetPh(T.xTilPh(this.skala, pt.x));
        return true;
    };

    P.saetPh = function (ph) {
        this.ph = Math.round(ph / D.PH_SKRIDT) * D.PH_SKRIDT;
        this.vis = "ion";
    };

    P.flytScene = function (pt) { if (this.grebSkyder) this.saetPh(T.xTilPh(this.skala, pt.x)); };
    P.opScene = function () {
        if (!this.grebSkyder) return;
        this.grebSkyder = false;
        this.nyRunde(this.ph);
    };

    P.klikScene = function (pt) {
        if (T.paaSkala(this.skala, pt)) {
            if (!this.fri) { this.kortBlink(); this.kortBesked("Skyderen er låst, til de fire trin er løst.", 3); }
            return;
        }
        if (this.spaer()) return;
        if (this.fase === "forsoeg" && !this.koer && this.efterT === null && this.paaPapir(pt)) { this.udfoer(); return; }
        this.kortBlink();
    };

    /* ----- Layout ------------------------------------------------------------------------ */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle;
        /* En lav tavle (baerbar i menuen) faar en smallere strimmel og en skyder
           med tallet til venstre, saa formlerne stadig kan laeses */
        this.kompakt = t.h < 440;
        var skalaPlads = this.kompakt ? 44 : 82;
        var stribeH = Math.round(NK.klamp(t.h * 0.26, 84, 170));
        var kortB = (t.b - 4 * 14) / 3;
        var ledig = t.h - 12 - 26 - stribeH - 14 - skalaPlads;
        var fs = Math.round(NK.klamp(Math.min((ledig - 10) / 13.2, kortB / 10.8), 10, 17) * 2) / 2;
        this.fs = fs;
        var kortH = Math.min(ledig, Math.round(13.2 * fs + 10));
        this.kort = D.FELT_RAEKKE.map(function (id, i) { return { id: id, x: t.x + 14 + i * (kortB + 14), y: t.y + 12, b: kortB, h: kortH }; });
        var sy = t.y + 12 + kortH + 26 + Math.max(0, (ledig - kortH) * 0.5);
        this.strimmel = { x: t.x + 74, y: sy, b: t.b - 148, h: stribeH };
        this.skala = { x: t.x + 70 + (this.kompakt ? 30 : 0), y: t.y + t.h - (this.kompakt ? 30 : 34), b: t.b - 140 - (this.kompakt ? 30 : 0) };
        this.saetAnker("formler", t.x + 8, t.y + 6, t.b - 16, kortH + 12);
        this.saetAnker("papir", this.strimmel.x - 60, sy - 24, this.strimmel.b + 120, stribeH + 46);
        this.saetAnker("skyder", this.skala.x - 40, this.skala.y - 46, this.skala.b + 80, 70);
    };

    /* ----- Tegning --------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, mig = this;
        if (!lay) return;
        var t = lay.tavle;
        if (t.b < 160) return;
        T.tavle(ctx, lay);
        this.kort.forEach(function (k) { mig.tegnKort(ctx, k); });
        this.tegnPapir(ctx);
        T.phSkala(ctx, this.skala, this.ph, { laast: !this.fri, greb: this.grebSkyder, kompakt: this.kompakt });
        this.tegnSejr(ctx, t);
    };

    /* Den uladede formel, som i bogens figur af de syv aminosyrer */
    function bogTilst(aa) {
        var t = { amino: 0, carboxyl: 1 };
        if (aa.grupper.side !== undefined) t.side = aa.sideSlags === "amino" ? 0 : 1;
        return t;
    }

    P.tegnKort = function (ctx, k) {
        var aa = D.AMINOSYRER[k.id], fs = this.fs, F2 = D.FARVE;
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.10)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
        NK.rundtRekt(ctx, k.x, k.y, k.b, k.h, 12);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = "#cfd8de";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
        var ion = this.vis === "ion";
        var tilst = ion ? D.tilstand(aa, this.ph) : bogTilst(aa);
        M.tegn(ctx, aa, tilst, k.x + k.b / 2, k.y + 10 + 0.62 * fs, fs, { gloed: ion ? 1 : 0 });
        var yN = k.y + k.h - 2.1 * fs;
        NK.tekst(ctx, aa.navn, k.x + k.b / 2, yN, { font: "800 " + Math.round(fs * 0.95) + "px " + M.FONT, farve: F2.blaek, justering: "center", linje: "middle" });
        var linje2 = aa.om + (ion ? " · ladning " + NK.fortegn(D.tilstandLadning(aa, tilst)) : "");
        NK.tekst(ctx, linje2, k.x + k.b / 2, yN + 1.15 * fs, { font: "600 " + Math.round(fs * 0.78) + "px " + M.FONT, farve: ion ? F2.amfo : F2.daempet, justering: "center", linje: "middle" });
        if (this.fase === "spm" && !this.groen && this.trin.om === k.id) T.gulRamme(ctx, k.x - 4, k.y - 4, k.b + 8, k.h + 8, 14);
    };

    P.tegnPapir = function (ctx) {
        var s = this.strimmel, mig = this, F2 = D.FARVE, t = this.lay.tavle;
        var stroem = !!this.koer || (this.vis === "ion" && this.trinNr >= 1);
        /* Polerne */
        [[s.x - 50, "−", "minuspol", F2.base], [s.x + s.b + 6, "+", "pluspol", F2.syre]].forEach(function (p) {
            ctx.save();
            var g = ctx.createLinearGradient(p[0], 0, p[0] + 44, 0);
            g.addColorStop(0, "#5c6673");
            g.addColorStop(0.5, "#8b95a1");
            g.addColorStop(1, "#5c6673");
            ctx.fillStyle = g;
            NK.rundtRekt(ctx, p[0], s.y - 4, 44, s.h + 8, 8);
            ctx.fill();
            if (stroem) { ctx.strokeStyle = p[3]; ctx.lineWidth = 3; ctx.stroke(); }
            ctx.restore();
            NK.tekst(ctx, p[1], p[0] + 22, s.y + s.h / 2, { font: "800 30px " + T.FONT, farve: "#ffffff", justering: "center", linje: "middle" });
            NK.tekst(ctx, p[2], p[0] + 22, s.y - 18, { font: "700 13px " + T.FONT, farve: p[3], justering: "center", linje: "middle" });
        });
        /* Papiret, fugtet med opløsningen */
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.12)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        var pg = ctx.createLinearGradient(0, s.y, 0, s.y + s.h);
        pg.addColorStop(0, "#f4efe3");
        pg.addColorStop(1, "#e8e0cd");
        ctx.fillStyle = pg;
        ctx.fillRect(s.x, s.y, s.b, s.h);
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = "#c9bea5";
        ctx.lineWidth = 1;
        ctx.strokeRect(s.x, s.y, s.b, s.h);
        /* Startlinjen */
        ctx.strokeStyle = "rgba(90, 80, 60, 0.45)";
        ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.moveTo(s.x + s.b / 2, s.y + 4); ctx.lineTo(s.x + s.b / 2, s.y + s.h - 4); ctx.stroke();
        ctx.restore();
        NK.tekst(ctx, "start", s.x + s.b / 2, s.y - 10, { font: "600 12px " + T.FONT, farve: T.DAEMPET, justering: "center", linje: "middle" });

        /* Pletterne */
        var halv = s.b / 2, rh = s.h / 3, alfa = this.igen ? NK.klamp(this.igen.t / IGEN, 0, 1) : 1;
        D.FELT_RAEKKE.forEach(function (id, i) {
            var aa = D.AMINOSYRER[id], x = s.x + halv - mig.d[id] * halv, y = s.y + rh * (i + 0.5);
            var q = mig.vis === "ion" ? D.tilstandLadning(aa, D.tilstand(aa, mig.ph)) : 0;
            var farve = mig.vis !== "ion" || q === 0 ? "#7d8896" : (q > 0 ? F2.syre : F2.base);
            ctx.save();
            ctx.globalAlpha = alfa;
            var g = ctx.createRadialGradient(x, y, 2, x, y, 18);
            g.addColorStop(0, farve);
            g.addColorStop(0.65, farve);
            g.addColorStop(1, "rgba(255, 255, 255, 0)");
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.ellipse(x, y, 19, Math.min(13, rh * 0.32), 0, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
            NK.tekst(ctx, aa.kort, x, y - Math.min(13, rh * 0.32) - 9, { font: "800 13px " + T.FONT, farve: T.BLAEK, justering: "center", linje: "middle" });
        });

        /* Gaettet og det, der kom ud af det */
        var gi = this.gaet.gaet;
        if (gi !== undefined) {
            var tr = this.trinListe[0], vist = this.trinNr >= 2;
            var ok = vist ? gi === tr.rigtig : null;
            T.maerke(ctx, s.x + 8, s.y - 16, "Dit gæt: " + tr.svar[gi], { fyld: ok === null ? "#fff8e1" : (ok ? "#e5f5ea" : "#fdecea"),
                kant: ok === null ? "#d69e0c" : (ok ? "#3fae72" : "#d9534f"), tegn: ok === null ? "" : (ok ? "✓" : "✗"), tegnFarve: ok ? "#2e8b57" : "#c0392b" });
        }
        if (this.fase === "forsoeg" && !this.koer && this.efterT === null) {
            T.skilt(ctx, s.x + s.b / 2, s.y + 2, "Klik: slut strømmen", { min: t.x + 4, maks: t.x + t.b - 4 });
        }
    };

    NK.SimFelt = SimFelt;
}());
