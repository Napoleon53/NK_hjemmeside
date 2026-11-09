/* =====================================================================
   sim_lige.js - fane 3: Ligevaegten

   Et vindue ind i opløsningen med 100 glucosemolekyler i et fast gitter
   (de vandrer ikke rundt, saa det eneste, der sker, er at ringe aabner
   og lukker sig). Ét forloeb i syv trin (D.LIGE): et gaet, opløsningen,
   to spoergsmaal, et gaet, Fehlings vaeske og et spoergsmaal.

   Modellen: en ring skifter form ved at aabne sig til kaeden og lukke sig
   igen. Antallet af α-glucose foelger maalet
     A(t) = 100 · (0,36 + 0,64 · e^(−k·t))
   (fra ren α-glucose mod ligevaegten med 36 % α og 64 % β), og oven i
   det skifter et α og et β plads hele tiden (den dynamiske ligevaegt).
   En kaede lever kun et kort oejeblik, saa der naesten aldrig er en kaede
   i vinduet (bogen: under 0,1 %). Med Fehlings vaeske reagerer en kaede,
   saa snart den dannes, og ringene bliver ved med at aabne sig, til
   naesten alt har reageret. Tiden er trykket sammen; den rigtige
   omdannelse tager timer, og der staar derfor ingen tid paa skaermen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var F = NK.Fane;
    var T = NK.Tegning;
    var NOEGLE = "nk-sb7.2-lige";

    var K_FART = 0.9;             /* hvor hurtigt fordelingen naermer sig ligevaegten (pr. sekund); ca. 6 s */
    var BYT = 1.1;                /* bytninger α <-> β pr. sekund ved ligevaegt */
    var FEHLING = 8;              /* aabninger pr. sekund med Fehlings vaeske */
    var AAB = 0.13, HOLD = 0.08, LUK = 0.13, REAG = 0.4;

    function SimLige() {
        var mig = this;
        this.trinListe = D.LIGE;
        this.hentStatus();
        this.startFane();
        NK.el("l-forfra").addEventListener("click", function () { mig.forfra(); });
        this.el.skort.addEventListener("click", function (e) {
            if (e.target.closest && e.target.closest("[data-udfoer]")) mig.udfoer();
        });
    }

    var P = SimLige.prototype;
    F.paa(P, "l");

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
        NK.saetHTML("l-trin", html);
        var m = this.status.stjerne ? "★ gennemført uden fejl" : (this.status.loest ? "✓ gennemført" : "");
        NK.saetTekst("l-maerke", m);
    };

    /* ----- Forloebet ------------------------------------------------------------------ */
    P.vaelg = function () {
        this.mol = [];
        for (var i = 0; i < D.ANTAL; i++) this.mol.push({ form: "alfa", ev: null });
        this.tid = 0;
        this.koer = null;          /* null, "oploes", "lige" eller "fehling" */
        this.tOpl = 0;
        this.bytGaeld = 0;
        this.fehGaeld = 0;
        this.ligeT = 0;
        this.gaet = {};
        this.fejl = false;
        this.sv = false;
        this.faerdig = false;
        this.sejrT = null;
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
        /* Under et gaet staar alt stille; under spoergsmaalene koerer ligevaegten */
        if (this.fase === "gaet") this.koer = this.koer === "fehling" ? "fehling" : null;
        if (this.fase === "spm" && this.trin.id !== "aabner") this.koer = "lige";
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
            var koerer = (t.id === "oploes" && this.koer === "oploes") || (t.id === "fehling" && this.koer === "fehling");
            return { slags: "opgave", chip: chip, tekst: koerer ? (t.id === "oploes" ? "Druesukkeret er opløst. Følg fordelingen ved siden af vinduet, til den ikke ændrer sig mere." :
                         "Fehlings væske er tilsat. Følg molekylerne i vinduet og tallene ved siden af.") : t.tekst,
                     ekstra: koerer ? "" : '<div class="sk-handling"><button type="button" class="knap blaa" data-udfoer="1">' + NK.html(t.knap) + "</button></div>" };
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
        if (sidste) {
            foerste = !this.status.loest;
            this.status.loest = true;
            this.status.stjerne = this.status.stjerne || (!this.fejl && !this.sv && !vist);
            this.gem();
            this.faerdig = true;
            if (foerste) tekst2 += " " + D.LIGE_FAERDIG;
        }
        this.groen = { spm: true, svarNr: t.rigtig, maade: vist || this.sv ? "svar" : "selv", tekst: tekst2,
                       knap: sidste ? "Se teorien →" : "Næste trin →" };
        this.sejrT = 0;
        this.besked("", "");
        this.visKort();
        this.visListe();
        if (sidste && foerste) NK.konfettiRegn(NK.el("fane-l").querySelector(".scene"), 60);
    };

    P.videre = function () {
        if (this.trinNr < this.trinListe.length - 1) { this.startTrin(this.trinNr + 1); return; }
        var e = NK.el("teori");
        if (e) e.classList.add("vis");
    };

    P.forfra = function () {
        this.status = { loest: false, stjerne: false };
        this.gem();
        this.vaelg(0);
    };

    P.nulstil = function () { if (!this.groen) this.vaelg(0); };

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
        if (this.fase !== "forsoeg") return;
        if (this.trin.id === "oploes" && this.koer !== "oploes") { this.koer = "oploes"; this.tOpl = 0; this.ligeT = 0; }
        else if (this.trin.id === "fehling" && this.koer !== "fehling") { this.koer = "fehling"; this.fehT = 0; }
        else return;
        this.visKort();
    };

    /* Formen, naar molekylets aabning er slut */
    function maal(m) { return m.ev && m.ev.til ? m.ev.til : m.form; }

    P.antal = function () {
        var n = { alfa: 0, beta: 0, kaede: 0, brugt: 0 };
        this.mol.forEach(function (m) {
            if (m.form === "brugt") { n.brugt++; return; }
            if (m.ev) {
                var t = m.ev.t;
                if (m.ev.type === "fehling") { if (t < AAB * 0.5) n[m.form]++; else n.kaede++; return; }
                if (t < AAB * 0.5) n[m.form]++;
                else if (t < AAB + HOLD + LUK * 0.5) n.kaede++;
                else n[m.ev.til]++;
                return;
            }
            n[m.form]++;
        });
        return n;
    };

    P.ledige = function (form) {
        var ud = [];
        this.mol.forEach(function (m, i) { if (!m.ev && m.form === form) ud.push(i); });
        return ud;
    };

    P.skift = function (form, til) {
        var l = this.ledige(form);
        if (!l.length) return false;
        var m = this.mol[NK.tilfaeldig(l)];
        m.ev = { type: "skift", til: til, t: 0 };
        return true;
    };

    P.opdaterScene = function (dt) {
        var mig = this;
        /* Molekylerne, der er ved at aabne og lukke sig */
        this.mol.forEach(function (m) {
            if (!m.ev) return;
            m.ev.t += dt;
            if (m.ev.type === "skift" && m.ev.t >= AAB + HOLD + LUK) { m.form = m.ev.til; m.ev = null; }
            else if (m.ev && m.ev.type === "fehling" && m.ev.t >= AAB + HOLD + REAG) { m.form = "brugt"; m.ev = null; }
        });
        if (!this.koer) return;

        if (this.koer === "oploes") {
            this.tOpl += dt;
            var A = Math.round(D.ANTAL * (D.ANDEL_ALFA + (1 - D.ANDEL_ALFA) * Math.exp(-K_FART * this.tOpl)));
            var nAlfa = this.mol.filter(function (m) { return maal(m) === "alfa" && m.form !== "brugt"; }).length;
            var gange = 0;
            while (nAlfa > A && gange < 6 && this.skift("alfa", "beta")) { nAlfa--; gange++; }
            this.byt(dt * Math.min(1, this.tOpl / 4));
            /* Ligevaegt: maalet er naaet, og intet er i gang i et stykke tid */
            if (A === Math.round(D.ANTAL * D.ANDEL_ALFA) && nAlfa === A) this.ligeT += dt; else this.ligeT = 0;
            if (this.ligeT > 1.0 && this.trin.id === "oploes") {
                this.koer = "lige";
                this.startTrin(this.trinNr + 1);
            }
            return;
        }
        if (this.koer === "lige") { this.byt(dt); return; }
        if (this.koer === "fehling") {
            this.fehT += dt;
            this.byt(dt * 0.5);
            this.fehGaeld += dt * FEHLING;
            while (this.fehGaeld >= 1) {
                this.fehGaeld -= 1;
                var a = this.ledige("alfa"), b = this.ledige("beta");
                if (!a.length && !b.length) break;
                /* Forholdet mellem ringene holdes, fordi ringene stadig er i ligevaegt */
                var tagA = a.length && (!b.length || a.length / (a.length + b.length) >= D.ANDEL_ALFA);
                var m = this.mol[NK.tilfaeldig(tagA ? a : b)];
                m.ev = { type: "fehling", t: 0 };
            }
            var tilbage = this.mol.filter(function (m) { return m.form !== "brugt"; }).length;
            if (tilbage === 0 && this.trin.id === "fehling") {
                this.koer = null;
                this.startTrin(this.trinNr + 1);
            }
            void mig;
        }
    };

    /* Den dynamiske ligevaegt: et α bliver til β, og et β bliver til α */
    P.byt = function (dt) {
        this.bytGaeld += dt * BYT;
        while (this.bytGaeld >= 1) {
            this.bytGaeld -= 1;
            if (this.ledige("alfa").length && this.ledige("beta").length) {
                this.skift("alfa", "beta");
                this.skift("beta", "alfa");
            }
        }
    };

    /* ----- Musen ------------------------------------------------------------------------- */
    P.overScene = function (pt) {
        if (this.fase === "forsoeg" && !this.koerer() && this.iVindue(pt)) return "pointer";
        return null;
    };

    P.koerer = function () {
        return (this.trin.id === "oploes" && this.koer === "oploes") || (this.trin.id === "fehling" && this.koer === "fehling");
    };

    P.iVindue = function (pt) {
        var v = this.v;
        return pt && v && pt.x > v.x && pt.x < v.x + v.b && pt.y > v.y && pt.y < v.y + v.h;
    };

    P.klikScene = function (pt) {
        if (this.spaer()) return;
        if (this.fase === "forsoeg" && !this.koerer() && this.iVindue(pt)) { this.udfoer(); return; }
        this.kortBlink();
    };

    /* ----- Layout ------------------------------------------------------------------------ */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle;
        var tb = Math.round(NK.klamp(t.b * 0.34, 220, 330));
        var side = Math.min(t.h - 64, t.b - tb - 70);
        side = Math.max(160, side);
        this.v = { x: t.x + 24, y: t.y + 32 + Math.max(0, (t.h - 64 - side) / 2), b: side, h: side };
        this.tal = { x: this.v.x + side + 34, y: this.v.y + 6, b: Math.min(tb, t.x + t.b - (this.v.x + side + 34) - 18) };
        this.saetAnker("vindue", this.v.x, this.v.y, this.v.b, this.v.h);
        this.saetAnker("tal", this.tal.x - 6, this.tal.y - 6, this.tal.b + 12, 250);
    };

    /* ----- Tegning --------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, mig = this;
        if (!lay) return;
        var t = lay.tavle, v = this.v;
        T.tavle(ctx, lay);

        /* Vinduet ind i opløsningen */
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.12)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 2;
        NK.rundtRekt(ctx, v.x, v.y, v.b, v.h, 18);
        var g = ctx.createLinearGradient(v.x, v.y, v.x, v.y + v.h);
        g.addColorStop(0, "#eef6fc");
        g.addColorStop(1, "#dcecf8");
        ctx.fillStyle = g;
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = "#7f9bb3";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        NK.tekst(ctx, "Glucose opløst i vand (100 molekyler)", v.x + 4, v.y - 10, { font: "700 13px " + T.FONT, farve: T.DAEMPET, linje: "alphabetic" });

        var n = 10, cel = (v.b - 24) / n, r = cel * 0.36;
        this.mol.forEach(function (m, i) {
            var x = v.x + 12 + (i % n + 0.5) * cel, y = v.y + 12 + (Math.floor(i / n) + 0.5) * cel;
            if (m.form === "brugt") { mig.brugt(ctx, x, y, r, 1); return; }
            if (!m.ev) { T.ikon(ctx, x, y, r, m.form, 0); return; }
            var tt = m.ev.t;
            if (m.ev.type === "fehling") {
                if (tt < AAB) T.ikon(ctx, x, y, r, m.form, tt / AAB);
                else if (tt < AAB + HOLD) T.ikon(ctx, x, y, r, "kaede", 1);
                else {
                    var u = (tt - AAB - HOLD) / REAG;
                    T.ikon(ctx, x, y, r, "kaede", 1, { alfa: 1 - u });
                    mig.brugt(ctx, x, y, r, u);
                }
                return;
            }
            if (tt < AAB) T.ikon(ctx, x, y, r, m.form, tt / AAB);
            else if (tt < AAB + HOLD) T.ikon(ctx, x, y, r, "kaede", 1);
            else T.ikon(ctx, x, y, r, m.ev.til, 1 - (tt - AAB - HOLD) / LUK);
        });

        /* Det, kortet spoerger om */
        if (this.fase === "spm" && !this.groen && (this.trin.id === "dynamisk" || this.trin.id === "aabner")) {
            T.gulRamme(ctx, v.x - 7, v.y - 7, v.b + 14, v.h + 14, 22);
        }

        this.tegnTal(ctx);

        if (this.fase === "forsoeg" && !this.koerer()) {
            T.skilt(ctx, v.x + v.b / 2, v.y + 2, "Klik: " + this.trin.knap.toLowerCase(), { min: t.x + 4, maks: t.x + t.b - 4 });
        }
        this.tegnSejr(ctx, t);
    };

    /* Et molekyle, der har reageret med Fehlings vaeske: en svag, stiplet cirkel */
    P.brugt = function (ctx, x, y, r, a) {
        ctx.save();
        ctx.globalAlpha = 0.55 * a;
        ctx.strokeStyle = "#9aa3b2";
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(x, y, r * 0.55, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
    };

    /* Tallene ved siden af vinduet: en bjaelke for hver form */
    P.tegnTal = function (ctx) {
        var tl = this.tal, n = this.antal(), mig = this;
        var raekker = [
            { id: "alfa", navn: "α-glucose", farve: T.ALFA, form: "alfa" },
            { id: "beta", navn: "β-glucose", farve: T.BETA, form: "beta" },
            { id: "kaede", navn: "Åben kæde", farve: T.KAEDE, form: "kaede" }
        ];
        if (this.koer === "fehling" || n.brugt > 0) raekker.push({ id: "brugt", navn: "Har reageret", farve: "#8a93a3", form: null });
        NK.tekst(ctx, "Antal molekyler", tl.x, tl.y + 8, { font: "800 14px " + T.FONT, farve: T.BLAEK, linje: "middle" });
        var y = tl.y + 30, rh = 44, bb = tl.b - 46;
        raekker.forEach(function (rk) {
            var cy = y + rh / 2;
            if (rk.form) T.ikon(ctx, tl.x + 12, cy - 4, 11, rk.form, rk.form === "kaede" ? 1 : 0);
            else mig.brugt(ctx, tl.x + 12, cy - 4, 11, 1.6);
            NK.tekst(ctx, rk.navn, tl.x + 32, cy - 10, { font: "700 13px " + T.FONT, farve: T.BLAEK, linje: "middle" });
            var bx = tl.x + 32, by = cy + 2, bh = 10, bw = bb - 32;
            ctx.save();
            ctx.fillStyle = "rgba(120, 132, 150, 0.16)";
            NK.rundtRekt(ctx, bx, by, bw, bh, 5); ctx.fill();
            var andel = n[rk.id] / D.ANTAL;
            if (andel > 0) {
                ctx.fillStyle = rk.farve;
                NK.rundtRekt(ctx, bx, by, Math.max(bh, bw * andel), bh, 5); ctx.fill();
            }
            ctx.restore();
            NK.tekst(ctx, String(n[rk.id]), tl.x + tl.b - 4, cy - 2, { font: "800 18px " + T.FONT, farve: rk.farve, justering: "right", linje: "middle" });
            if (rk.id === "kaede" && mig.fase === "spm" && mig.trin.id === "kaede" && !mig.groen) {
                T.gulRamme(ctx, tl.x - 6, y - 2, tl.b + 10, rh, 8);
            }
            y += rh;
        });
        /* Gaettene og det, der kom ud af dem */
        y += 10;
        var mig2 = this;
        [["gaet1", "oploes"], ["gaet2", "fehling"]].forEach(function (p) {
            var gi = mig2.gaet[p[0]];
            if (gi === undefined) return;
            var tr = D.LIGE.filter(function (x) { return x.id === p[0]; })[0];
            var vist = mig2.trinNr > D.LIGE.map(function (x) { return x.id; }).indexOf(p[1]);
            var ok = vist ? gi === tr.rigtig : null;
            var linje = "Dit gæt: " + tr.svar[gi];
            ctx.save();
            ctx.font = "600 13px " + T.FONT;
            var b = Math.min(tl.b, ctx.measureText(linje).width + 40), h = 26;
            ctx.fillStyle = ok === null ? "#fff8e1" : (ok ? "#e5f5ea" : "#fdecea");
            NK.rundtRekt(ctx, tl.x, y, b, h, 7); ctx.fill();
            ctx.strokeStyle = ok === null ? "#d69e0c" : (ok ? "#3fae72" : "#d9534f");
            ctx.lineWidth = 1.5; ctx.stroke();
            ctx.restore();
            NK.tekst(ctx, linje, tl.x + 10, y + h / 2 + 1, { font: "600 13px " + T.FONT, farve: T.BLAEK, linje: "middle" });
            if (ok !== null) NK.tekst(ctx, ok ? "✓" : "✗", tl.x + b - 14, y + h / 2 + 1, { font: "800 15px " + T.FONT, farve: ok ? "#2e8b57" : "#c0392b", justering: "center", linje: "middle" });
            y += h + 8;
        });
    };

    NK.SimLige = SimLige;
}());
