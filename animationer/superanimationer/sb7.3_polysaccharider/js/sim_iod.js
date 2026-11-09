/* =====================================================================
   sim_iod.js - fane 3: Spyt og iod

   Ét forloeb i seks trin (D.IOD): et gaet, iodprøven paa kartoffel og
   vat, et spoergsmaal, et gaet, spyt paa kogt stivelse og vat (og bagefter
   iodopløsning) og et spoergsmaal.

   Scenen har to raekker. Til venstre staar proeven (det, man ser), og til
   hoejre en lup med molekylerne (bogens regel: mikro og makro hver for
   sig). Stivelse er en spiral af amylose, cellulose er lige kaeder med
   hydrogenbindinger. Triiodidionerne laegger sig inde i spiralen, og saa
   bliver kartoflen blåsort. Amylase klipper α-bindingerne i spiralen til
   maltose, men preller af paa cellulose. Alt, der bevaeger sig, er regnet
   af tiden siden forsoeget begyndte, saa et skaermbillede kan stilles.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var E = NK.Enhed;
    var F = NK.Fane;
    var T = NK.Tegning;
    var NOEGLE = "nk-sb7.3-iod";

    var IOD_SLUT = 3.0;        /* iodprøven er faerdig efter 3 s */
    var SPYT_SLUT = 6.6;       /* spyttet og iodprøven bagefter */
    var SPYT_IOD = 4.5;        /* her kommer iodopløsningen paa i spyt-forsoeget */

    /* Spiralen i luppen (maal i luppens radius) */
    var SP = { n: 10, h: 0.088 };
    var PLADSER_I3 = [-0.4, 0.02, 0.44];
    /* Klippene i spiralen: [enzym, enhed foer bindingen, tid]. Hvert klip
       giver et stykke maltose med to glucoseenheder. */
    var KLIP = [[0, 1, 1.3], [1, 3, 1.7], [0, 5, 2.1], [1, 7, 2.5]];
    /* Hvor de fem stykker maltose ender: [x, y, vinkel] */
    var MALTOSE = [[-0.52, -0.48, 0.4], [0.32, -0.56, -0.3], [-0.6, 0.34, -0.2], [0.04, 0.04, 0.5], [0.52, 0.42, 0.1]];
    var PAR = 1.25;            /* halv afstand mellem de to enheder i maltose (i h) */

    function SimIod() {
        var mig = this;
        this.trinListe = D.IOD;
        this.hentStatus();
        this.startFane();
        NK.el("i-forfra").addEventListener("click", function () { mig.forfra(); });
        this.el.skort.addEventListener("click", function (e) {
            if (e.target.closest && e.target.closest("[data-udfoer]")) mig.udfoer();
        });
    }

    var P = SimIod.prototype;
    F.paa(P, "i");

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
            html += '<li class="' + kl + '"><span class="tr-nr">' + (j + 1) + "</span>" + NK.html(t.navn) + "</li>";
        });
        NK.saetHTML("i-trin", html);
        NK.saetTekst("i-maerke", this.status.stjerne ? "★ gennemført uden fejl" : (this.status.loest ? "✓ gennemført" : ""));
    };

    /* ----- Forloebet ------------------------------------------------------------------ */
    P.vaelg = function () {
        this.tA = null;            /* tid siden iodopløsningen kom paa (saet A) */
        this.tB = null;            /* tid siden spyttet kom paa (saet B) */
        this.koer = null;
        this.gaet = {};
        this.fejl = false;
        this.sv = false;
        this.faerdig = false;
        this.sejrT = null;
        this.saetU = 0;
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

    /* Fra trin 4 er det kogt stivelse og vat i skaale (saet B) */
    P.saetB = function () { return this.trinNr >= 3; };

    P.kortData = function () {
        var mig = this, t = this.trin, chip = "Trin " + (this.trinNr + 1) + " af " + this.trinListe.length;
        if (this.fase === "gaet") {
            return { slags: "spm", chip: chip + " · Gæt først", tekst: t.tekst,
                     svar: t.svar.map(function (s, j) { return { t: s, valgt: mig.valgt === j }; }) };
        }
        if (this.fase === "forsoeg") {
            if (this.koer) return { slags: "opgave", chip: chip, tekst: t.koerer };
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
        if (sidste) {
            foerste = !this.status.loest;
            this.status.loest = true;
            this.status.stjerne = this.status.stjerne || (!this.fejl && !this.sv && !vist);
            this.gem();
            this.faerdig = true;
            if (foerste) tekst2 += " " + D.IOD_FAERDIG;
        }
        this.groen = { spm: true, svarNr: t.rigtig, maade: vist || this.sv ? "svar" : "selv", tekst: tekst2,
                       knap: sidste ? "Se teorien →" : "Næste trin →" };
        this.sejrT = 0;
        this.besked("", "");
        this.visKort();
        this.visListe();
        if (sidste && foerste) NK.konfettiRegn(NK.el("fane-i").querySelector(".scene"), 60);
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

    /* ----- Forsoegene ------------------------------------------------------------------- */
    P.udfoer = function () {
        if (this.fase !== "forsoeg" || this.koer) return;
        if (this.trin.id === "iod") { this.tA = 0; this.koer = "iod"; }
        else if (this.trin.id === "spyt") { this.tB = 0; this.koer = "spyt"; }
        this.visKort();
    };

    P.opdaterScene = function (dt) {
        this.saetU = NK.mod(this.saetU, this.saetB() ? 1 : 0, 6, dt);
        if (this.tA !== null) this.tA += dt;
        if (this.tB !== null) this.tB += dt;
        if (this.koer === "iod" && this.tA >= IOD_SLUT) { this.koer = null; this.startTrin(this.trinNr + 1); }
        else if (this.koer === "spyt" && this.tB >= SPYT_SLUT) { this.koer = null; this.startTrin(this.trinNr + 1); }
    };

    /* ----- Musen ------------------------------------------------------------------------- */
    P.overScene = function (pt) {
        if (this.fase === "forsoeg" && !this.koer && this.paaTavle(pt)) return "pointer";
        return null;
    };

    P.paaTavle = function (pt) {
        var t = this.lay && this.lay.tavle;
        return pt && t && pt.x > t.x && pt.x < t.x + t.b && pt.y > t.y && pt.y < t.y + t.h;
    };

    P.klikScene = function (pt) {
        if (this.spaer()) return;
        if (this.fase === "forsoeg" && !this.koer && this.paaTavle(pt)) { this.udfoer(); return; }
        this.kortBlink();
    };

    /* ----- Layout ------------------------------------------------------------------------ */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle, rh = (t.h - 16) / 2;
        var forkl = t.b > 760;
        var R = Math.min(rh * 0.43, t.b * (forkl ? 0.17 : 0.21));
        var pb = Math.min(t.b * 0.2, rh * 1.15, 190);
        this.r = [0, 1].map(function (k) {
            var cy = t.y + 8 + rh * (k + 0.5);
            return { cy: cy, top: t.y + 8 + rh * k, h: rh,
                     px: t.x + t.b * (forkl ? 0.17 : 0.2), py: cy - rh * 0.08, pb: pb, ph: pb * 0.62,
                     lx: t.x + t.b * (forkl ? 0.5 : 0.62), ly: cy, R: R };
        });
        this.forklaring = forkl ? { x: t.x + t.b * 0.72, y: t.y + 24 } : null;
        var r0 = this.r[0], r1 = this.r[1];
        this.saetAnker("proever", r0.px - pb / 2 - 10, r0.top + 6, pb + 20, rh * 2 - 12);
        this.saetAnker("lupper", r0.lx - R - 6, r0.ly - R - 6, 2 * R + 12, r1.ly - r0.ly + 2 * R + 12);
    };

    /* ----- Tegning --------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, mig = this;
        if (!lay) return;
        var t = lay.tavle;
        if (t.b < 160) return;          /* fanen er skjult og har ingen bredde */
        T.tavle(ctx, lay);
        ctx.save();
        ctx.strokeStyle = "rgba(120, 132, 150, 0.22)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(t.x + 12, this.r[1].top); ctx.lineTo(t.x + t.b - 12, this.r[1].top); ctx.stroke();
        ctx.restore();
        var b = this.saetU;
        if (b < 0.99) { ctx.save(); ctx.globalAlpha = 1 - b; this.tegnSaet(ctx, "A"); ctx.restore(); }
        if (b > 0.01) { ctx.save(); ctx.globalAlpha = b; this.tegnSaet(ctx, "B"); ctx.restore(); }
        if (this.forklaring) this.tegnForklaring(ctx);

        /* Det, kortet spoerger om */
        if (this.fase === "spm" && !this.groen) {
            var lup = this.trin.id === "spiral" ? [0] : [0, 1];
            lup.forEach(function (k) {
                var r = mig.r[k];
                T.gulRamme(ctx, r.lx - r.R - 9, r.ly - r.R - 9, 2 * r.R + 18, 2 * r.R + 18, r.R + 9);
            });
        }
        if (this.fase === "forsoeg" && !this.koer) {
            var r0 = this.r[0];
            T.skilt(ctx, r0.px, r0.py - r0.ph / 2 - 6, "Klik: " + this.trin.knap.toLowerCase(), { min: t.x + 4, maks: t.x + t.b - 4 });
        }
        this.tegnSejr(ctx, t);
    };

    /* Proeverne og lupperne i saet A (kartoffel og vat) eller B (kogt stivelse og vat med spyt) */
    P.tegnSaet = function (ctx, saet) {
        var mig = this;
        [0, 1].forEach(function (k) {
            var r = mig.r[k], stiv = k === 0;
            /* Proeven */
            if (saet === "A") {
                if (stiv) T.kartoffel(ctx, r.px, r.py, r.pb, r.ph);
                else T.vat(ctx, r.px, r.py, r.pb * 0.9, r.ph * 1.1);
            } else T.skaal(ctx, r.px, r.py, r.pb, r.ph, stiv ? "stivelse" : "vat");
            var plet = mig.plet(saet, stiv);
            var spot = { x: r.px + r.pb * 0.06, y: r.py - r.ph * 0.02 };
                        if (plet.a > 0) T.plet(ctx, spot.x, spot.y, r.ph * (saet === "B" ? 0.3 : 0.24), plet.farve, plet.a);
            if (plet.draabe) T.draabe(ctx, spot.x, plet.draabe.y, r.ph * 0.09, plet.draabe.farve, plet.draabe.a);
            /* Navnet og farven under proeven */
            var navn = saet === "A" ? (stiv ? "Kartoffel" : "Vat") : (stiv ? "Kogt stivelse" : "Vat");
            T.billedtekst(ctx, r.px, r.py + r.ph / 2 + 16, navn, { str: 15 });
            var under = "";
            if (saet === "B" && mig.tB !== null) under = "med spyt ved 37 °C";
            if (plet.navn) under = (under ? under + ", " : "") + plet.navn;
            if (under) T.billedtekst(ctx, r.px, r.py + r.ph / 2 + 34, under, { str: 13, vaegt: "600", farve: plet.navn === "blåsort" ? "#2a3170" : T.DAEMPET });
            if (saet === "B" && mig.tB !== null && mig.tB > SPYT_IOD - 0.4 && mig.tB < SPYT_IOD + 1.2 && stiv) {
                T.maerke(ctx, r.px, r.py - r.ph / 2 - 16, "10 minutter senere", { justering: "center", h: 22, str: 12 });
            }
            /* Luppen */
            T.lupStart(ctx, r.lx, r.ly, r.R, spot);
            if (stiv) mig.lupStivelse(ctx, r, saet);
            else mig.lupCellulose(ctx, r, saet);
            T.lupSlut(ctx, r.lx, r.ly, r.R);
        });
    };

    /* Farven paa proeven og draaben, der falder */
    P.plet = function (saet, stiv) {
        var ud = { a: 0, farve: D.GULBRUN, navn: "", spyt: 0, draabe: null };
        var r = this.r[stiv ? 0 : 1];
        if (saet === "A") {
            var t = this.tA;
            if (t === null) return ud;
            if (t < 0.5) { ud.draabe = { y: r.py - r.ph * 1.2 + (t / 0.5) * r.ph * 1.2, farve: D.GULBRUN, a: 1 }; return ud; }
            ud.a = NK.klamp((t - 0.5) / 0.2, 0, 1);
            if (stiv) {
                var u = NK.klamp((t - 0.6) / 1.2, 0, 1);
                ud.farve = blandFarve(D.GULBRUN, D.BLAASORT, u);
                if (u > 0.6) ud.navn = "blåsort";
            } else if (t > 1.0) ud.navn = "gulbrun";
            return ud;
        }
        var tb = this.tB;
        if (tb === null) return ud;
        if (tb < 0.5) { ud.draabe = { y: r.py - r.ph * 1.2 + (tb / 0.5) * r.ph * 1.2, farve: "rgba(235, 232, 220, 0.95)", a: 1 }; return ud; }
        ud.spyt = NK.klamp((tb - 0.5) / 0.3, 0, 1) * 0.8;
        if (tb >= SPYT_IOD && tb < SPYT_IOD + 0.5) {
            ud.draabe = { y: r.py - r.ph * 1.2 + ((tb - SPYT_IOD) / 0.5) * r.ph * 1.2, farve: D.GULBRUN, a: 1 };
        }
        if (tb >= SPYT_IOD + 0.5) {
            ud.a = NK.klamp((tb - SPYT_IOD - 0.5) / 0.2, 0, 1);
            if (tb > SPYT_IOD + 1.0) ud.navn = "gulbrun";
        }
        return ud;
    };

    function hex2rgb(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
    function blandFarve(a, b, u) {
        var x = hex2rgb(a), y = hex2rgb(b);
        return "rgb(" + [0, 1, 2].map(function (i) { return Math.round(NK.lerp(x[i], y[i], u)); }).join(",") + ")";
    }

    /* ----- Luppen med stivelse: spiralen, triiodidionerne og amylase ---------------------- */
    P.spiralPladser = function (r, saet) {
        var ud = [], R = r.R, tb = saet === "B" ? this.tB : null;
        var los = tb === null ? 0 : NK.blod(NK.klamp((tb - 3.0) / 1.0, 0, 1));
        for (var i = 0; i < SP.n; i++) {
            var sp = D.spiralPunkt(i, SP.h);
            var p = { x: sp.x - (SP.n - 1) * D.SPIRAL.dx * SP.h / 2, y: sp.y, z: sp.z };
            if (los > 0) {
                var m = MALTOSE[Math.floor(i / 2)], side = i % 2 ? 1 : -1;
                var mx = m[0] + side * Math.cos(m[2]) * PAR * SP.h, my = m[1] + side * Math.sin(m[2]) * PAR * SP.h;
                p.x = NK.lerp(p.x, mx, los); p.y = NK.lerp(p.y, my, los); p.z = NK.lerp(p.z, 0, los);
            }
            ud.push({ x: r.lx + p.x * R, y: r.ly + p.y * R, z: p.z });
        }
        return ud;
    };

    /* Er bindingen efter enhed i klippet? */
    P.klippet = function (i, saet) {
        if (saet !== "B" || this.tB === null) return false;
        var tb = this.tB;
        return KLIP.some(function (k) { return k[1] === i && tb >= k[2]; });
    };

    P.lupStivelse = function (ctx, r, saet) {
        var mig = this, R = r.R, h = SP.h * R, pl = this.spiralPladser(r, saet);
        var i3 = this.ionerStivelse(r, saet);
        /* Det bagerste foerst, saa ionerne ligger inde i spiralen */
        var pts = pl.map(function (p, i) { return { x: p.x, y: p.y, z: p.z, brud: mig.klippet(i, saet) }; });
        var los = saet === "B" && this.tB !== null ? NK.blod(NK.klamp((this.tB - 3.0) / 1.0, 0, 1)) : 0;
        var bane = function (i, u) {
            var sp = D.spiralPunkt(i + u, SP.h);
            var hx = r.lx + (sp.x - (SP.n - 1) * D.SPIRAL.dx * SP.h / 2) * R, hy = r.ly + sp.y * R;
            var lx = NK.lerp(pl[i].x, pl[i + 1].x, u), ly = NK.lerp(pl[i].y, pl[i + 1].y, u);
            return { x: NK.lerp(hx, lx, los), y: NK.lerp(hy, ly, los), z: sp.z * (1 - los) };
        };
        ["bag", "for"].forEach(function (lag) {
            E.roer(ctx, pts, { w: Math.max(2, h * 0.42), lag: lag, bane: bane });
            pl.forEach(function (p) {
                if ((p.z < 0) !== (lag === "bag")) return;
                E.hex(ctx, p.x, p.y, h * (1 + 0.12 * p.z), { alfa: 0.6 + 0.4 * (p.z + 1) / 2 });
            });
            /* Ionerne inde i spiralen ligger mellem det bagerste og det forreste */
            if (lag === "bag") i3.forEach(function (ion) { if (ion.inde) T.triiodid(ctx, ion.x, ion.y, h * 0.36, { alfa: ion.a, vinkel: ion.v }); });
        });
        i3.forEach(function (ion) { if (!ion.inde) T.triiodid(ctx, ion.x, ion.y, h * 0.36, { alfa: ion.a, vinkel: ion.v }); });
        if (saet === "B") this.tegnAmylase(ctx, r, pl, h);
    };

    /* Triiodidionerne i luppen med stivelse: tre laegger sig inde i spiralen (saet A) */
    P.ionerStivelse = function (r, saet) {
        var R = r.R, ud = [], t, inde = saet === "A";
        if (saet === "A") t = this.tA === null ? null : this.tA - 0.6;
        else t = this.tB === null ? null : this.tB - SPYT_IOD - 0.5;
        if (t === null || t < 0) return ud;
        var maal = inde ? PLADSER_I3.map(function (x) { return [x, 0, 0]; }).concat([[-0.55, 0.62, 0.5], [0.5, -0.66, -0.4]])
                        : [[-0.62, -0.2, 0.3], [-0.15, -0.72, -0.4], [0.3, 0.25, 0.6], [0.62, -0.2, 0.1], [-0.2, 0.7, -0.2]];
        maal.forEach(function (m, j) {
            var start = [-0.9 + j * 0.42, -1.25];
            var u = NK.blod(NK.klamp((t - j * 0.12) / 1.1, 0, 1));
            var fri = !(inde && j < PLADSER_I3.length);
            var vx = fri ? 0.04 * Math.sin(1.3 * t + j * 1.9) : 0, vy = fri ? 0.04 * Math.cos(1.1 * t + j * 2.3) : 0;
            ud.push({ x: r.lx + (NK.lerp(start[0], m[0], u) + vx * u) * R, y: r.ly + (NK.lerp(start[1], m[1], u) + vy * u) * R,
                      v: m[2] * u, a: NK.klamp((t - j * 0.12) / 0.25, 0, 1), inde: !fri && u > 0.6 });
        });
        return ud;
    };

    /* Amylase klipper spiralen til maltose; for hvert klip bruges et vandmolekyle.
       Hvert enzym kommer ind udefra, klipper sine bindinger én ad gangen og gaar igen. */
    P.tegnAmylase = function (ctx, r, pl, h) {
        var tb = this.tB;
        if (tb === null || tb < 0.5) return;
        var R = r.R, IND = 0.5, UD = 3.1, HOLD = 0.12;
        var start = [[-1.25, 0.95], [1.25, -0.95]], slut = [[-1.3, 1.1], [1.3, -1.1]];
        [0, 1].forEach(function (z) {
            var side = z === 0 ? 1 : -1;
            var punkter = [{ p: [r.lx + start[z][0] * R, r.ly + start[z][1] * R], t: IND }];
            KLIP.forEach(function (k) {
                if (k[0] !== z) return;
                var a = pl[k[1]], b = pl[k[1] + 1];
                punkter.push({ p: [(a.x + b.x) / 2, (a.y + b.y) / 2 + side * h * 1.7], t: k[2], klip: true });
            });
            punkter.push({ p: [r.lx + slut[z][0] * R, r.ly + slut[z][1] * R], t: UD });
            /* Hvor enzymet er lige nu */
            var pos = punkter[0].p, mund = 1;
            for (var j = 0; j < punkter.length - 1; j++) {
                var A = punkter[j], B = punkter[j + 1];
                var tA = A.t + (A.klip ? HOLD : 0), tB = B.t - (B.klip ? 0.08 : 0);
                if (tb >= A.t && tb < tA) { pos = A.p; mund = 0.3; break; }
                if (tb >= tA && tb < tB) { pos = lerpP(A.p, B.p, NK.blod((tb - tA) / Math.max(0.05, tB - tA))); break; }
                if (tb >= tB && tb < B.t) { pos = B.p; break; }
                pos = B.p;
            }
            var a = NK.klamp((tb - IND) / 0.3, 0, 1) * (tb > 3.6 ? NK.klamp(1 - (tb - 3.6) / 0.4, 0, 1) : 1);
            T.enzym(ctx, pos[0], pos[1], h * 1.25, side > 0 ? -Math.PI / 2 : Math.PI / 2, { alfa: a, mund: mund });
        });
        /* Vandmolekylerne, der bruges ved klippene */
        KLIP.forEach(function (k) {
            var dt = tb - k[2];
            if (dt < -0.3 || dt > 0.3) return;
            var a = pl[k[1]], b = pl[k[1] + 1], side = k[0] === 0 ? 1 : -1;
            T.vand(ctx, (a.x + b.x) / 2, (a.y + b.y) / 2 - side * h * 1.7, Math.max(10, h * 0.95), 1 - Math.abs(dt) / 0.3);
        });
    };

    function lerpP(a, b, u) { return [NK.lerp(a[0], b[0], u), NK.lerp(a[1], b[1], u)]; }

    /* ----- Luppen med cellulose: lige kaeder, hydrogenbindinger og frie ioner ------------- */
    P.lupCellulose = function (ctx, r, saet) {
        var R = r.R, h = 0.11 * R, dxc = 0.27 * R, raekker = [-0.42, 0, 0.42];
        ctx.save();
        ctx.strokeStyle = "#e05446";
        ctx.lineWidth = 1.6;
        ctx.setLineDash([2, 3.5]);
        ctx.lineCap = "round";
        for (var j = 0; j < 6; j += 2) {
            var x = r.lx + (j - 2.5) * dxc + h * 0.7;
            for (var k = 0; k < 2; k++) {
                ctx.beginPath();
                ctx.moveTo(x, r.ly + raekker[k] * R + h * 0.95);
                ctx.lineTo(x, r.ly + raekker[k + 1] * R - h * 0.95);
                ctx.stroke();
            }
        }
        ctx.restore();
        raekker.forEach(function (ry) {
            var y = r.ly + ry * R;
            ctx.save();
            ctx.strokeStyle = T.BRUN;
            ctx.lineWidth = Math.max(1.4, h * 0.28);
            ctx.beginPath(); ctx.moveTo(r.lx - R, y); ctx.lineTo(r.lx + R, y); ctx.stroke();
            ctx.restore();
            for (var i = -1; i <= 6; i++) E.hex(ctx, r.lx + (i - 2.5) * dxc, y, h);
        });
        /* Frie triiodidioner */
        var t = saet === "A" ? (this.tA === null ? null : this.tA - 0.6) : (this.tB === null ? null : this.tB - SPYT_IOD - 0.5);
        if (t !== null && t >= 0) {
            var maal = [[-0.6, -0.2, 0.2], [-0.05, 0.22, -0.3], [0.45, -0.22, 0.4], [0.62, 0.22, 0], [-0.3, -0.62, 0.1]];
            maal.forEach(function (m, j) {
                var u = NK.blod(NK.klamp((t - j * 0.12) / 1.1, 0, 1));
                var sx = -0.9 + j * 0.42, sy = -1.25;
                var x = NK.lerp(sx, m[0], u) + 0.04 * Math.sin(1.3 * t + j) * u, y = NK.lerp(sy, m[1], u) + 0.03 * Math.cos(1.1 * t + j * 2) * u;
                T.triiodid(ctx, r.lx + x * R, r.ly + y * R, h * 0.36, { alfa: NK.klamp((t - j * 0.12) / 0.25, 0, 1), vinkel: m[2] * u });
            });
        }
        /* Amylase preller af paa cellulose */
        if (saet === "B" && this.tB !== null && this.tB > 0.5) {
            var tb = this.tB;
            var veje = [
                [[-1.2, 0.95], [-0.25, 0.42 + 0.2], 0.5, 1.4, 1.6, 2.3, [-0.75, 0.95]],
                [[1.2, -0.95], [0.32, -0.42 - 0.2], 0.7, 1.6, 1.8, 2.5, [0.8, -0.95]]
            ];
            veje.forEach(function (v, z) {
                var s0 = [r.lx + v[0][0] * R, r.ly + v[0][1] * R], m = [r.lx + v[1][0] * R, r.ly + v[1][1] * R], e = [r.lx + v[6][0] * R, r.ly + v[6][1] * R];
                var pos, mund = 1;
                if (tb < v[3]) pos = lerpP(s0, m, NK.blod((tb - v[2]) / (v[3] - v[2])));
                else if (tb < v[4]) { pos = m; mund = 0.6; }
                else pos = lerpP(m, e, NK.blod((tb - v[4]) / (v[5] - v[4])));
                var a = NK.klamp((tb - v[2]) / 0.3, 0, 1) * NK.klamp(1 - (tb - 3.2) / 0.4, 0, 1);
                T.enzym(ctx, pos[0], pos[1], h * 1.4, z === 0 ? -Math.PI / 2 : Math.PI / 2, { alfa: a, mund: mund });
            });
        }
    };

    /* ----- Forklaringen af tegnene i lupperne -------------------------------------------- */
    P.tegnForklaring = function (ctx) {
        var f = this.forklaring, h = 9, y = f.y;
        NK.tekst(ctx, "I lupperne", f.x, y, { font: "800 13px " + T.FONT, farve: T.BLAEK, linje: "middle" });
        y += 24;
        E.hex(ctx, f.x + 10, y, h);
        NK.tekst(ctx, "en glucoseenhed", f.x + 28, y, { font: "600 13px " + T.FONT, farve: T.BLAEK, linje: "middle" });
        y += 26;
        T.triiodid(ctx, f.x + 10, y + 2, 3.6);
        NK.tekst(ctx, "en triiodidion, I₃⁻", f.x + 28, y, { font: "600 13px " + T.FONT, farve: T.BLAEK, linje: "middle" });
        if (!this.saetB()) return;
        y += 26;
        T.enzym(ctx, f.x + 10, y, 9, Math.PI);
        NK.tekst(ctx, "et enzym (amylase)", f.x + 28, y, { font: "600 13px " + T.FONT, farve: T.BLAEK, linje: "middle" });
    };

    NK.SimIod = SimIod;
}());
