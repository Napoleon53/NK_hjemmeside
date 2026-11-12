/* =====================================================================
   sim_denat.js - fane 3: Denaturering og hydrolyse

   Fire trin (D.DENAT):
     1 varme      et glas aeggehvide og et protein i luppen. Eleven skruer
                  temperaturen op; over 60 °C brydes de svage bindinger,
                  proteinet folder sig ud, og aeggehviden bliver hvid. Saa:
                  vaelg alle de bindinger, der er brudt.
     2 ph         et nyt glas. Eleven skruer pH ned eller op; under pKₛ for
                  asparaginsyres sidekaede optager −COO⁻ en hydron, og over
                  pKₛ for lysins sidekaede afgiver −NH₃⁺ en. Ionbindingen
                  forsvinder, og proteinet folder sig ud. Spoergsmaalet
                  foelger den vej, eleven valgte.
     3 hydrolyse  eleven klikker paa den binding, vand spalter, og hele
                  kaeden bliver til aminosyrer.
     4 sorter     fem eksempler traekkes i kasserne Denaturering og Hydrolyse.
   Bagefter er begge skydere fri, og panelet har et nyt glas aeggehvide.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var F = NK.Fane;
    var T = NK.Tegning;
    var Fm = NK.Formel;
    var Pr = NK.Protein;
    var NOEGLE = "nk-sb7.8-denat";

    var VENT_PH = 0.6;        /* fra ionbindingen forsvinder, til proteinet begynder at folde sig ud */
    var HYDRON = 0.7;         /* en hydron kommer eller gaar */
    var HYD = 2.4;            /* vandet spalter peptidbindingen */
    var SPALT = 2.6;          /* hele kaeden spaltes til aminosyrer */

    var PH_FARVER = [[-1, "#b8322a"], [0, "#d9483b"], [3, "#ee8a2c"], [5, "#e9c53a"], [7, "#5fb15a"], [9, "#2f8fae"], [11, "#3a5bd0"], [14, "#5b3fae"], [15, "#4b2f96"]];
    var T_FARVER = [[20, "#4a90d9"], [45, "#8fc0e8"], [60, "#e9c53a"], [80, "#ee8a2c"], [100, "#d9483b"]];

    function SimDenat() {
        var mig = this;
        this.trinListe = D.DENAT;
        this.hentStatus();
        this.startFane();
        NK.el("d-forfra").addEventListener("click", function () { mig.forfra(); });
        NK.el("d-nyt").addEventListener("click", function () { if (mig.fri) { mig.nytGlas(); mig.visKort(); } });
    }

    var P = SimDenat.prototype;
    F.paa(P, "d");

    /* ----- Hukommelsen ------------------------------------------------------------ */
    P.hentStatus = function () {
        var g = NK.hent(NOEGLE, {}) || {};
        this.status = { loest: !!g.l, stjerne: !!g.s };
    };
    P.gem = function () { NK.gem(NOEGLE, { l: this.status.loest ? 1 : 0, s: this.status.stjerne ? 1 : 0 }); };

    P.visListe = function () {
        var mig = this, html = "";
        this.trinListe.forEach(function (t, j) {
            var kl = j < mig.trinNr || (j === mig.trinNr && mig.groen) || mig.faerdig ? "faerdig" : (j === mig.trinNr ? "nu" : "");
            html += '<li class="' + kl + '"><span class="tr-nr">' + (j + 1) + "</span><span>" + NK.html(t.navn) + "</span></li>";
        });
        NK.saetHTML("d-trin", html);
        NK.saetTekst("d-maerke", this.status.stjerne ? "★ gennemført uden fejl" : (this.status.loest ? "✓ gennemført" : ""));
        NK.el("d-nyt").hidden = !this.fri;
    };

    /* ----- Proteinet i glasset ------------------------------------------------------------ */
    P.nytGlas = function () {
        this.p = { T: D.T_START, ph: D.PH_START, d: 0, svag: 1, aspQ: -1, lysQ: 1, denat: null, vent: null, hvid: 0 };
        this.hydroner = [];
    };

    /* ----- Forloebet ------------------------------------------------------------------ */
    P.vaelg = function () {
        this.fejl = false;
        this.sv = false;
        this.faerdig = false;
        this.fri = false;
        this.sejrT = null;
        this.startTrin(0);
    };

    P.startTrin = function (j) {
        this.trinNr = j;
        this.trin = this.trinListe[j];
        this.groen = null;
        this.valgt = null;
        this.valgte = {};
        this.forkert = {};
        this.hold = null;
        this.hyd = null;
        this.valgtBinding = null;
        this.besked("", "");
        this.nytGlas();
        if (j === 0 || j === 1) {
            this.fase = "forsoeg";
            this.variant = null;
        } else if (j === 2) {
            this.fase = "klik";
            this.mol = Fm.kaede(["ala", "gly"], { aabenN: true, aabenC: true });
        } else {
            this.fase = "sorter";
            this.brikker = this.trin.brikker.map(function (b, i) { return { id: b.id, t: b.t, rigtig: b.kasse, kasse: null, i: i, forkert: false }; });
        }
        this.nulstilHjaelp();
        this.layout();
        this.visKort();
        this.visListe();
    };

    P.spm = function () {
        if (this.trinNr === 1 && this.variant) return this.trin[this.variant];
        return this.trin;
    };

    P.kortData = function () {
        var mig = this, t = this.trin, chip = this.fri ? "Prøv selv" : "Trin " + (this.trinNr + 1) + " af " + this.trinListe.length;
        if (this.fri) return { slags: "opgave", chip: chip, tekst: D.DENAT_FRI };
        if (this.fase === "forsoeg") return { slags: "opgave", chip: chip, tekst: t.forsoegTekst };
        if (this.fase === "spm") {
            var q = this.spm();
            if (this.trinNr === 0) {
                return { slags: "spm", chip: chip, tekst: q.tekst,
                         svar: q.svar.map(function (s, j) { return { t: s, valgt: !!mig.valgte[j], forkert: !!mig.forkert[j] }; }) };
            }
            return { slags: "spm", chip: chip, tekst: q.tekst,
                     svar: q.svar.map(function (s, j) { return { t: s, valgt: mig.valgt === j, forkert: !!mig.forkert[j] }; }) };
        }
        return { slags: "spm", chip: chip, tekst: t.tekst };
    };

    P.skjulIndsend = function () { return this.fri || this.fase === "forsoeg"; };
    P.skjulHint = function () { return this.fri || (this.fase === "forsoeg" && !!this.p.denat); };

    P.svarValg = function (j) {
        if (this.fase !== "spm") return;
        if (this.trinNr === 0) this.valgte[j] = !this.valgte[j];
        else this.valgt = this.valgt === j ? null : j;
        this.visKort();
    };

    P.antalValgte = function () { var mig = this; return Object.keys(this.valgte).filter(function (k) { return mig.valgte[k]; }).length; };

    P.kanSendes = function () {
        if (this.fase === "spm") return this.trinNr === 0 ? this.antalValgte() > 0 : this.valgt !== null;
        if (this.fase === "klik") return !!this.valgtBinding && !this.hyd;
        if (this.fase === "sorter") return this.brikker.some(function (b) { return b.kasse !== null; });
        return false;
    };

    P.indsendTekst = function () {
        if (this.fase === "spm" && this.trinNr === 0 && this.antalValgte()) return "Indsend svar: " + D.antalTekst(this.antalValgte(), "binding", "bindinger");
        if (this.fase === "spm" && this.valgt !== null) return "Indsend svar: " + this.spm().svar[this.valgt];
        if (this.fase === "klik" && this.valgtBinding) return "Indsend svar: bindingen " + this.bindNavn(this.valgtBinding);
        if (this.fase === "sorter") {
            var n = this.brikker.filter(function (b) { return b.kasse !== null; }).length;
            return "Indsend svar: " + n + " af " + this.brikker.length + " sorteret";
        }
        return "Indsend svar";
    };

    P.ingentingTekst = function () {
        if (this.fase === "klik") return this.trin.fejlIntet;
        if (this.fase === "sorter") return this.trin.fejlIntet;
        return "Vælg et af svarene på kortet først.";
    };

    /* Bindingens slags i formlen: peptid, co, nh, nc, cc, cr */
    P.bindSlags = function (b) {
        var A = this.mol.ind[b.a], B = this.mol.ind[b.b];
        if (b.peptid) return "peptid";
        if (b.orden === 2) return "co";
        if (A.el === "H" || B.el === "H") return "nh";
        if (A.rolle === "R" || B.rolle === "R") return "cr";
        if (A.el === "N" || B.el === "N") return "nc";
        return "cc";
    };
    P.bindNavn = function (b) {
        var s = this.bindSlags(b);
        return { peptid: "C−N", co: "C=O", nh: "N−H", nc: "N−C", cc: "C−C", cr: "C−C" }[s];
    };

    P.indsend = function () { this.bedoem(false); };

    P.bedoem = function (vist) {
        var t = this.trin, mig = this;
        if (this.fase === "spm" && this.trinNr === 0) {
            var forkerte = Object.keys(this.valgte).filter(function (k) { return mig.valgte[k] && t.rigtige.indexOf(+k) < 0; });
            if (forkerte.length) {
                this.fejl = true;
                forkerte.forEach(function (k) { mig.forkert[k] = true; mig.valgte[k] = false; });
                this.visKort();
                this.fejlLinje(t.fejl[forkerte[0]]);
                return;
            }
            if (this.antalValgte() < t.rigtige.length) {
                this.fejl = true;
                this.fejlLinje(t.fejlMangler);
                return;
            }
            this.loes(vist, t.forkl);
            return;
        }
        if (this.fase === "spm") {
            var q = this.spm(), v = this.valgt;
            if (v !== q.rigtig) {
                this.fejl = true;
                this.forkert[v] = true;
                this.valgt = null;
                this.visKort();
                this.fejlLinje(q.fejl[v]);
                return;
            }
            this.loes(vist, q.forkl, q.rigtig);
            return;
        }
        if (this.fase === "klik") {
            var s = this.bindSlags(this.valgtBinding);
            if (s !== "peptid") {
                this.fejl = true;
                this.valgtBinding = null;
                this.fejlLinje(t.fejl[s]);
                return;
            }
            this.valgtBinding = null;
            this.hyd = { t: 0 };
            this.loes(vist, t.forkl);
            return;
        }
        if (this.fase === "sorter") {
            var uden = this.brikker.filter(function (b) { return b.kasse === null; }).length;
            if (uden) { this.kortBlink(); this.kortBesked(D.flet(t.fejlMangler, { antal: String(uden) }), 3.5); return; }
            var galt = this.brikker.filter(function (b) { return b.kasse !== b.rigtig; });
            if (galt.length) {
                this.fejl = true;
                galt.forEach(function (b) { b.kasse = null; b.forkert = true; });
                this.fejlLinje(t.brikker[galt[0].i].fejl);
                return;
            }
            this.loes(vist, t.forkl);
        }
    };

    P.loes = function (vist, tekst, svarNr) {
        var sidste = this.trinNr === this.trinListe.length - 1, foerste = false;
        if (sidste) {
            foerste = !this.status.loest;
            this.status.loest = true;
            this.status.stjerne = this.status.stjerne || (!this.fejl && !this.sv && !vist);
            this.gem();
            this.faerdig = true;
        }
        this.groen = { spm: true, svarNr: svarNr, maade: vist || this.sv ? "svar" : "selv", tekst: tekst,
                       knap: sidste ? "Prøv selv med temperatur og pH →" : "Næste trin →" };
        this.sejrT = 0;
        this.besked("", "");
        this.visKort();
        this.visListe();
        if (sidste && foerste) NK.konfettiRegn(NK.el("fane-d").querySelector(".scene"), 60);
    };

    P.videre = function () {
        if (this.trinNr < this.trinListe.length - 1) { this.startTrin(this.trinNr + 1); return; }
        /* Til sidst: begge skydere er fri */
        this.groen = null;
        this.fri = true;
        this.fase = "fri";
        this.nytGlas();
        this.layout();
        this.visKort();
        this.visListe();
    };

    P.forfra = function () {
        this.status = { loest: false, stjerne: false };
        this.gem();
        this.vaelg(0);
    };

    P.nulstil = function () { if (!this.groen && !this.hyd) this.vaelg(0); };

    P.hintNu = function () {
        if (this.groen || this.fri) return [];
        if (this.fase === "forsoeg") return this.p.denat ? [] : this.trin.forsoegHint;
        return this.trin.hint;
    };

    P.visSvar = function () {
        var mig = this;
        this.sv = true;
        if (this.fase === "forsoeg") {
            /* Skyderen glider selv derhen, hvor proteinet denatureres */
            if (this.trinNr === 0) this.glid = { slags: "T", til: 70 };
            else this.glid = { slags: "ph", til: 2 };
            return;
        }
        if (this.fase === "spm" && this.trinNr === 0) {
            this.valgte = {};
            this.trin.rigtige.forEach(function (k) { mig.valgte[k] = true; });
            this.bedoem(true);
            return;
        }
        if (this.fase === "spm") { this.valgt = this.spm().rigtig; this.bedoem(true); return; }
        if (this.fase === "klik") {
            this.valgtBinding = this.mol.bindinger.filter(function (b) { return b.peptid; })[0];
            this.bedoem(true);
            return;
        }
        if (this.fase === "sorter") {
            this.brikker.forEach(function (b) { b.kasse = b.rigtig; b.forkert = false; });
            this.bedoem(true);
        }
    };

    /* ----- Skyderne ------------------------------------------------------------------------ */
    P.tempAktiv = function () { return this.fri || (this.trinNr === 0 && this.fase === "forsoeg" && !this.groen); };
    P.phAktiv = function () { return this.fri || (this.trinNr === 1 && this.fase === "forsoeg" && !this.groen); };
    P.visTemp = function () { return this.fri || this.trinNr === 0; };
    P.visPh = function () { return this.fri || this.trinNr === 1; };

    P.saetT = function (v) {
        this.p.T = Math.round(NK.klamp(v, D.T_START, D.T_MAKS));
    };

    P.saetPh = function (v) {
        var p = this.p, ny = Math.round(NK.klamp(v, D.PH_MIN, D.PH_MAKS) / D.PH_SKRIDT) * D.PH_SKRIDT;
        p.ph = Math.round(ny * 10) / 10;
        /* Sidekaedernes grupper optager eller afgiver en hydron */
        var aq = p.ph < D.AMINOSYRER.asp.pks ? 0 : -1, lq = p.ph > D.AMINOSYRER.lys.pks ? 0 : 1;
        if (aq !== p.aspQ) { this.hydroner.push({ g: "asp", ind: aq === 0, t: 0 }); p.aspQ = aq; }
        if (lq !== p.lysQ) { this.hydroner.push({ g: "lys", ind: lq === 1, t: 0 }); p.lysQ = lq; }
    };

    /* Piletasterne flytter den skyder, der kan bruges */
    P.piltast = function (retning) {
        if (this.phAktiv() && !this.tempAktiv()) { this.saetPh(this.p.ph + retning * D.PH_SKRIDT * 5); return true; }
        if (this.tempAktiv() && !this.phAktiv()) { this.saetT(this.p.T + retning * 2); return true; }
        if (this.fri) { this.saetT(this.p.T + retning * 2); return true; }
        return false;
    };

    /* ----- Tiden ---------------------------------------------------------------------------- */
    P.opdaterScene = function (dt) {
        var p = this.p, mig = this;
        if (this.glid) {
            if (this.glid.slags === "T") {
                this.saetT(p.T + 30 * dt);
                if (p.T >= this.glid.til) this.glid = null;
            } else {
                this.saetPh(p.ph - 4 * dt);
                if (p.ph <= this.glid.til) this.glid = null;
            }
        }
        if (this.trinNr <= 1 || this.fri) {
            /* Varmen faar kaeden til at ryste */
            p.ryst = 0.075 * NK.klamp((p.T - 25) / 75, 0, 1);
            if (!p.denat && !p.vent) {
                if (p.T >= D.T_DENAT && (this.trinNr === 0 || this.fri)) p.denat = { aarsag: "varme", t: 0 };
                else if ((p.aspQ === 0 || p.lysQ === 0) && (this.trinNr === 1 || this.fri)) p.vent = { aarsag: p.aspQ === 0 ? "lav" : "hoej", t: 0 };
            }
            if (p.vent) {
                p.vent.t += dt;
                if (p.vent.t >= VENT_PH) { p.denat = { aarsag: p.vent.aarsag, t: 0 }; p.vent = null; }
            }
            if (p.denat) {
                p.denat.t += dt;
                p.svag = 1 - NK.klamp(p.denat.t / D.BRYD, 0, 1);
                p.d = NK.klamp((p.denat.t - D.BRYD * 0.6) / D.FOLD_UD, 0, 1);
                p.hvid = p.d * (p.denat.aarsag === "hoej" ? 0.35 : 1);
                if (p.d >= 1 && this.fase === "forsoeg" && !this.fri) {
                    this.fase = "spm";
                    if (this.trinNr === 1) this.variant = p.denat.aarsag === "hoej" ? "hoej" : "lav";
                    this.nulstilHjaelp();
                    this.visKort();
                    this.visListe();
                }
            }
        }
        this.hydroner.forEach(function (h) { h.t += dt; });
        this.hydroner = this.hydroner.filter(function (h) { return h.t < HYDRON; });
        if (this.hyd) { this.hyd.t += dt; if (this.hyd.t > HYD + SPALT) this.hyd.t = HYD + SPALT; }
        void mig;
    };

    /* ----- Layout ------------------------------------------------------------------------ */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle;
        this.saetAnker("tavle", t.x + 10, t.y + 6, t.b - 20, t.h - 12);
        /* Glasset til venstre, proteinet i luppen til hoejre og skyderen nederst */
        var gb = Math.round(NK.klamp(t.b * 0.075, 44, 74));
        var skY = t.y + t.h - 30;
        this.glasK = { x: t.x + 26, y: t.y + 34, b: gb, h: Math.min(t.h - 110, gb * 3.6) };
        var lx0 = this.glasK.x + gb + 46, lx1 = t.x + t.b - 12, ly0 = t.y + 10, ly1 = skY - 46;
        this.lupK = { x: lx0, y: ly0, b: lx1 - lx0, h: ly1 - ly0 };
        var x0 = -4.65, x1 = 4.85, y0 = -2.9, y1 = 2.35;
        var s = Math.min((this.lupK.b - 16) / (x1 - x0), (this.lupK.h - 12) / (y1 - y0), 100);
        this.view = { cx: lx0 + this.lupK.b / 2 - (x0 + x1) / 2 * s, cy: ly0 + this.lupK.h / 2 - (y0 + y1) / 2 * s, s: s };
        /* Skyderne: kun den, der bruges i trinnet (begge til sidst) */
        var sx0 = t.x + 120, sx1 = t.x + t.b - 50;
        var to = this.visTemp() && this.visPh();
        var mid = (sx0 + sx1) / 2;
        this.skT = { x: sx0, y: skY, b: to ? mid - sx0 - 70 : sx1 - sx0, min: D.T_START, maks: D.T_MAKS, trin: 10, navn: "Temperatur",
                     farver: T_FARVER, tekst: function (v) { return Math.round(v) + " °C"; }, tal: function (v) { return v % 20 === 0 ? String(v) : ""; } };
        this.skPh = { x: to ? mid + 70 : sx0, y: skY, b: to ? sx1 - mid - 70 : sx1 - sx0, min: D.PH_MIN, maks: D.PH_MAKS, trin: 1, navn: "pH", aaben: true,
                      farver: PH_FARVER, tekst: function (v) { return "pH " + D.komma1(v); },
                      tal: null };
        /* Alle tal fra −1 til 15, naar der er plads, ellers hvert andet */
        var skPh = this.skPh, hvert = skPh.b / 16 >= 34 ? 1 : (skPh.b / 16 >= 17 ? 2 : 4);
        skPh.tal = function (v) { return (v + 1) % hvert === 0 ? String(v).replace("-", "−") : ""; };
        if (to) { this.skT.x = sx0 + 4; this.skPh.navn = "pH"; }
        this.skT.skjult = !this.visTemp();
        this.skPh.skjult = !this.visPh();
        this.saetAnker("glas", this.glasK.x - 8, this.glasK.y - 10, gb + 16, this.glasK.h + 34);
        this.saetAnker("lup", this.lupK.x, this.lupK.y, this.lupK.b, this.lupK.h);
        this.saetAnker("skyder", t.x + 20, skY - 46, t.b - 40, 66);
        /* Hydrolysen */
        var L = Math.min((t.b - 60) / 8.0, (t.h - 150) / 3.6, 92);
        this.bl = L;
        this.fs = Math.round(NK.klamp(L * 0.37, 13, 30));
        this.o = { x: t.x + t.b / 2 - 2.6 * L, y: t.y + 20 + 1.5 * L };
        this.perleY = t.y + t.h - 52;
        /* Sorteringen */
        var kb = Math.min((t.b - 60) / 2, 340);
        this.kasserS = [{ x: t.x + t.b / 2 - kb - 12, y: t.y + 14, b: kb, h: Math.min(t.h - 96, 250) },
                        { x: t.x + t.b / 2 + 12, y: t.y + 14, b: kb, h: Math.min(t.h - 96, 250) }];
        this.bakkeSY = t.y + t.h - 34;
    };

    /* ----- Musen --------------------------------------------------------------------- */
    P.hpos = function (a) { return { x: this.o.x + a.x * this.bl, y: this.o.y + a.y * this.bl }; };

    P.bindingVed = function (pt) {
        var mig = this, P2 = {};
        this.mol.atomer.forEach(function (a) { P2[a.id] = mig.hpos(a); });
        return Fm.bindingVed(this.mol, P2, pt, 10);
    };

    P.brikPos = function (b) {
        var str = 14, mig = this;
        if (this.hold && this.hold.b === b) return { x: this.hold.x - this.hold.dx, y: this.hold.y - this.hold.dy };
        if (b.kasse !== null) {
            var k = this.kasserS[b.kasse];
            var i = this.brikker.filter(function (x) { return x.kasse === b.kasse; }).indexOf(b);
            return { x: k.x + k.b / 2, y: k.y + 56 + i * (str * 2 + 10) };
        }
        var fri = this.brikker.filter(function (x) { return x.kasse === null; });
        var j = fri.indexOf(b), t = this.lay.tavle, c = this.L.ctx;
        var bredder = fri.map(function (x) { return T.brikMaal(c, x.t, str); });
        var tot = bredder.reduce(function (a, v) { return a + v; }, 0) + 12 * (fri.length - 1);
        var x = t.x + t.b / 2 - tot / 2;
        for (var n = 0; n < j; n++) x += bredder[n] + 12;
        void mig;
        return { x: x + bredder[j] / 2, y: this.bakkeSY };
    };

    P.brikVed = function (pt) {
        var c = this.L.ctx, ud = null, mig = this;
        this.brikker.forEach(function (b) {
            var p = mig.brikPos(b), w = T.brikMaal(c, b.t, 14);
            if (Math.abs(pt.x - p.x) < w / 2 && Math.abs(pt.y - p.y) < 16) ud = b;
        });
        return ud;
    };

    P.overScene = function (pt) {
        if (!pt) return null;
        if (this.visTemp() && T.paaSkyder(this.skT, pt) && this.erForsoegsLayout()) return this.tempAktiv() ? "ew-resize" : "not-allowed";
        if (this.visPh() && T.paaSkyder(this.skPh, pt) && this.erForsoegsLayout()) return this.phAktiv() ? "ew-resize" : "not-allowed";
        if (this.groen) return null;
        if (this.fase === "klik" && !this.hyd) return this.bindingVed(pt) ? "pointer" : null;
        if (this.fase === "sorter") return this.brikVed(pt) ? "grab" : null;
        return null;
    };

    P.erForsoegsLayout = function () { return this.fri || this.trinNr <= 1; };

    P.nedScene = function (pt) {
        if (this.erForsoegsLayout()) {
            if (this.visTemp() && T.paaSkyder(this.skT, pt)) {
                if (!this.tempAktiv()) return false;
                this.grebSkyder = "T"; this.saetT(T.tilV(this.skT, pt.x)); this.glid = null; this.nulstilHjaelp();
                return true;
            }
            if (this.visPh() && T.paaSkyder(this.skPh, pt)) {
                if (!this.phAktiv()) return false;
                this.grebSkyder = "ph"; this.saetPh(T.tilV(this.skPh, pt.x)); this.glid = null; this.nulstilHjaelp();
                return true;
            }
        }
        if (this.groen) return false;
        if (this.fase === "sorter") {
            var b = this.brikVed(pt);
            if (b) {
                var p = this.brikPos(b);
                this.hold = { b: b, x: pt.x, y: pt.y, dx: pt.x - p.x, dy: pt.y - p.y, x0: pt.x, y0: pt.y };
                b.forkert = false;
                return true;
            }
        }
        return false;
    };

    P.flytScene = function (pt) {
        if (this.grebSkyder === "T") { this.saetT(T.tilV(this.skT, pt.x)); return; }
        if (this.grebSkyder === "ph") { this.saetPh(T.tilV(this.skPh, pt.x)); return; }
        if (this.hold) { this.hold.x = pt.x; this.hold.y = pt.y; }
    };

    P.opScene = function (pt) {
        if (this.grebSkyder) { this.grebSkyder = null; return; }
        if (this.hold) {
            var g = this.hold, b = g.b, mig = this;
            this.hold = null;
            var c = { x: g.x - g.dx, y: g.y - g.dy };
            var flyttet = Math.hypot(pt.x - g.x0, pt.y - g.y0) > 6;
            var ramt = null;
            this.kasserS.forEach(function (k, i) { if (c.x > k.x && c.x < k.x + k.b && c.y > k.y && c.y < k.y + k.h) ramt = i; });
            if (ramt !== null) b.kasse = ramt;
            else if (!flyttet && b.kasse !== null) b.kasse = null;      /* et klik i kassen sender brikken tilbage */
            else if (flyttet) b.kasse = null;
            this.besked("", "");
            this.visKort();
            void mig;
        }
    };

    P.klikScene = function (pt) {
        if (this.spaer()) return;
        if (this.fase === "klik" && !this.hyd) {
            var b = this.bindingVed(pt);
            if (b) {
                this.valgtBinding = this.valgtBinding === b ? null : b;
                this.besked("", "");
                this.visKort();
            }
            return;
        }
        if (this.fase === "spm") this.kortBlink();
    };

    /* ----- Tegning --------------------------------------------------------------------- */
    P.tegn = function () {
        var c = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var t = lay.tavle;
        if (t.b < 160) return;
        T.tavle(c, lay);
        if (this.erForsoegsLayout()) this.tegnForsoeg(c);
        else if (this.trinNr === 2) this.tegnHydrolyse(c);
        else this.tegnSorter(c);
        this.tegnSejr(c, t);
    };

    P.tilstand = function () {
        var p = this.p;
        return { d: p.d, svag: p.svag, ss: true, aspQ: p.aspQ, lysQ: p.lysQ, ryst: p.ryst || 0, tid: this.tid, dannet: [1, 1, 1, 1] };
    };

    P.tegnForsoeg = function (c) {
        var mig = this, g = this.glasK, l = this.lupK, p = this.p;
        /* Luppen: en lys flade med en streg til glasset */
        var lupX = g.x + g.b / 2, lupY = g.y + g.h * 0.62, lr = g.b * 0.32;
        c.save();
        c.strokeStyle = "rgba(90, 110, 130, 0.35)";
        c.lineWidth = 1.4;
        c.beginPath(); c.moveTo(lupX + lr * 0.7, lupY - lr * 0.7); c.lineTo(l.x + 8, l.y + 8); c.stroke();
        c.beginPath(); c.moveTo(lupX + lr * 0.7, lupY + lr * 0.7); c.lineTo(l.x + 8, l.y + l.h - 8); c.stroke();
        c.fillStyle = "rgba(255, 255, 255, 0.62)";
        NK.rundtRekt(c, l.x, l.y, l.b, l.h, 14);
        c.fill();
        c.strokeStyle = "rgba(90, 110, 130, 0.35)";
        c.stroke();
        c.restore();
        T.glas(c, g.x, g.y, g.b, g.h, p.hvid);
        T.ring(c, lupX, lupY, lr, "rgba(90, 110, 130, 0.55)", null, 1.6);
        NK.tekst(c, "æggehvide", g.x + g.b / 2, g.y + g.h + 18, { font: "700 13px " + T.FONT, farve: T.DAEMPET, justering: "center", linje: "middle" });
        Pr.tegn(c, this.tilstand(), this.view);
        /* Hydronerne, der kommer eller gaar */
        var ip = Pr.ionPunkter(this.tilstand(), this.view), r = Math.max(8, this.view.s * 0.15);
        this.hydroner.forEach(function (h) {
            var u = NK.blod(h.t / HYDRON), pk = h.g === "asp" ? ip.asp : ip.lys, ude = { x: pk.x + 1.3 * mig.view.s, y: pk.y - 0.4 * mig.view.s };
            var fra = h.ind ? ude : pk, til = h.ind ? pk : ude;
            T.hydron(c, fra.x + (til.x - fra.x) * u, fra.y + (til.y - fra.y) * u, r, h.ind ? Math.min(1, u * 3) : 1 - u);
        });
        /* Hvad der sker, i ét ord over luppen */
        var tekst = p.d >= 1 ? "denatureret protein" : (p.denat ? "de svage bindinger brydes" : "foldet protein");
        NK.tekst(c, tekst, l.x + l.b - 14, l.y + 16, { font: "800 14px " + T.FONT, farve: p.d >= 1 ? "#a3271f" : D.FARVE.groen, justering: "right", linje: "middle" });
        if (this.visTemp()) {
            T.skyder(c, this.skT, p.T, { laast: !this.tempAktiv(), greb: this.grebSkyder === "T" });
            if (this.tempAktiv() && !this.fri && !this.grebSkyder && p.T === D.T_START && !this.glid) {
                T.skilt(c, T.tilX(this.skT, p.T), this.skT.y - 46, "Skru op", { min: this.lay.tavle.x + 6, maks: this.lay.tavle.x + this.lay.tavle.b - 6 });
            }
        }
        if (this.visPh()) {
            T.skyder(c, this.skPh, p.ph, { laast: !this.phAktiv(), greb: this.grebSkyder === "ph" });
            if (this.phAktiv() && !this.fri && !this.grebSkyder && p.ph === D.PH_START && !this.glid) {
                T.skilt(c, T.tilX(this.skPh, p.ph), this.skPh.y - 46, "Træk ned eller op", { min: this.lay.tavle.x + 6, maks: this.lay.tavle.x + this.lay.tavle.b - 6 });
            }
        }
    };

    /* Trin 3: stykket af kaeden, vandet og til sidst hele kaeden */
    P.tegnHydrolyse = function (c) {
        var mig = this, L = this.bl, fs = this.fs, h = this.hyd, mol = this.mol, t = this.lay.tavle;
        var u = h ? NK.klamp(h.t / HYD, 0, 1) : 0;
        var spalt = u > 0.55 ? NK.blod((u - 0.55) / 0.45) : 0;
        var pos = function (a) {
            var p = mig.hpos(a);
            if (a.rest === 1 || a.id === "r0Cx") p.x += spalt * 1.1 * L;
            return p;
        };
        /* Peptidbindingens kasse */
        var C = pos(mol.ind.r0C), O = pos(mol.ind.r0O), N = pos(mol.ind.r1N), H = pos(mol.ind.r1H);
        var kA = 1 - spalt;
        if (kA > 0.01) {
            c.save(); c.globalAlpha *= kA;
            NK.rundtRekt(c, Math.min(C.x, N.x) - 0.4 * L, Math.min(O.y, C.y) - 0.4 * L, Math.abs(N.x - C.x) + 0.8 * L, Math.max(H.y, N.y) - Math.min(O.y, C.y) + 0.8 * L, 9);
            c.fillStyle = "rgba(215, 238, 234, 0.85)"; c.fill();
            c.strokeStyle = D.FARVE.groen; c.lineWidth = 1.6; c.stroke();
            c.restore();
        }
        Fm.tegn(c, mol, pos, fs, {
            bindAlfa: function (b) { return b.peptid ? 1 - NK.klamp((u - 0.45) / 0.1, 0, 1) : 1; },
            bindFarve: function (b) { return b.peptid ? D.FARVE.groen : null; }
        });
        /* Den valgte binding */
        if (this.valgtBinding) {
            var a = pos(mol.ind[this.valgtBinding.a]), b = pos(mol.ind[this.valgtBinding.b]);
            c.save();
            c.strokeStyle = "rgba(47, 111, 222, 0.45)";
            c.lineWidth = fs * 0.7;
            c.lineCap = "round";
            c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
            c.restore();
        }
        /* Vandet kommer ind og deler sig: OH paa carbonatomet og H paa nitrogenatomet */
        if (h) {
            var M = { x: (C.x + N.x) / 2, y: C.y - 2.2 * L }, ved = { x: (C.x + mig.hpos(mol.ind.r1N).x) / 2, y: (C.y + N.y) / 2 - 0.1 * L };
            if (u < 0.5) {
                var v = NK.blod(u / 0.45);
                T.vand(c, M.x + (ved.x - M.x) * v, M.y + (ved.y - M.y) * v, fs * 0.9, Math.min(1, u * 6));
            } else {
                var nyA = NK.klamp((u - 0.5) / 0.2, 0, 1);
                var pOH = { x: C.x + 0.8 * L, y: C.y + 0.45 * L }, pH = { x: N.x - 0.75 * L, y: N.y - 0.42 * L };
                c.save();
                c.globalAlpha *= nyA;
                c.strokeStyle = D.FARVE.groen; c.lineWidth = Math.max(2, fs * 0.12); c.lineCap = "round";
                c.beginPath(); c.moveTo(C.x, C.y); c.lineTo(pOH.x - 0.3 * L, pOH.y - 0.17 * L); c.stroke();
                c.beginPath(); c.moveTo(N.x - 0.32 * L, N.y - 0.18 * L); c.lineTo(pH.x + 0.24 * L, pH.y + 0.14 * L); c.stroke();
                Fm.tekst(c, "OH", pOH.x, pOH.y, fs, D.FARVE.groen, null, 0);
                Fm.tekst(c, "H", pH.x, pH.y, fs, D.FARVE.groen, "center");
                c.restore();
            }
        }
        /* Hele kaeden: alle peptidbindingerne spaltes */
        var n = D.OPSKRIFT.length, dx = Math.min((t.b - 80) / (n + 1.5), 74), pr = Math.round(NK.klamp(dx * 0.34, 15, 26));
        var x0 = t.x + t.b / 2 - (n - 1) / 2 * dx, y = this.perleY;
        var s2 = h ? NK.klamp((h.t - HYD) / SPALT, 0, 1) : 0;
        NK.tekst(c, s2 >= 1 ? "Aminosyrerne efter hydrolysen" : "Hele kæden", t.x + t.b / 2, y - pr - 18, { font: "800 14px " + T.FONT, farve: T.DAEMPET, justering: "center", linje: "middle" });
        var pp = [];
        for (var i = 0; i < n; i++) {
            var spr = NK.blod(NK.klamp(s2 * 1.4 - i * 0.05, 0, 1));
            pp.push({ x: x0 + (i - (n - 1) / 2) * dx * 0.35 * spr + (i - (n - 1) / 2) * 0 + 0, y: y + (i % 2 ? 1 : -1) * Math.min(dx * 0.22, 12) * (1 - spr) });
            pp[i].x = x0 + i * dx + (i - (n - 1) / 2) * dx * 0.35 * spr;
        }
        for (i = 1; i < n; i++) {
            var brudt = s2 > (i / n) * 0.8 + 0.05;
            if (!brudt) {
                c.save(); c.strokeStyle = D.FARVE.groen; c.lineWidth = Math.max(3, pr * 0.22); c.lineCap = "round";
                c.beginPath(); c.moveTo(pp[i - 1].x, pp[i - 1].y); c.lineTo(pp[i].x, pp[i].y); c.stroke(); c.restore();
            }
            var vt = s2 * SPALT - ((i / n) * 0.8 + 0.05) * SPALT;
            if (h && h.t > HYD && vt > -0.5 && vt < 0.4) {
                var mx = (pp[i - 1].x + pp[i].x) / 2, my = (pp[i - 1].y + pp[i].y) / 2;
                var w = NK.klamp((vt + 0.5) / 0.5, 0, 1);
                T.vand(c, mx, my - 34 * (1 - w), 12, vt < 0.2 ? Math.min(1, (vt + 0.5) * 3) : 1 - (vt - 0.2) / 0.2);
            }
        }
        for (i = 0; i < n; i++) T.perle(c, pp[i].x, pp[i].y, pr, D.kort(D.OPSKRIFT[i]), {});
    };

    /* Trin 4: de to kasser og brikkerne */
    P.tegnSorter = function (c) {
        var mig = this, t = this.trin;
        this.kasserS.forEach(function (k, i) {
            c.save();
            NK.rundtRekt(c, k.x, k.y, k.b, k.h, 14);
            c.fillStyle = i === 0 ? "rgba(15, 118, 110, 0.07)" : "rgba(194, 65, 12, 0.07)";
            c.fill();
            c.strokeStyle = i === 0 ? "rgba(15, 118, 110, 0.55)" : "rgba(194, 65, 12, 0.55)";
            c.lineWidth = 2;
            if (mig.hold) c.setLineDash([7, 5]);
            c.stroke();
            c.restore();
            NK.tekst(c, t.kasser[i], k.x + k.b / 2, k.y + 22, { font: "800 17px " + T.FONT, farve: i === 0 ? D.FARVE.groen : D.FARVE.orange, justering: "center", linje: "middle" });
            NK.tekst(c, i === 0 ? "kæden er hel" : "kæden spaltes", k.x + k.b / 2, k.y + k.h - 16, { font: "600 13px " + T.FONT, farve: T.DAEMPET, justering: "center", linje: "middle" });
        });
        var rig = !!this.groen;
        this.brikker.forEach(function (b) {
            if (mig.hold && mig.hold.b === b) return;
            var p = mig.brikPos(b);
            T.brik(c, p.x, p.y, b.t, { str: 14, forkert: b.forkert, valgt: b.kasse !== null && !rig, rigtig: rig });
        });
        if (this.hold) {
            var g = this.hold, p2 = this.brikPos(g.b);
            T.brik(c, p2.x, p2.y, g.b.t, { str: 14, greb: true });
        }
    };

    NK.SimDenat = SimDenat;
}());
