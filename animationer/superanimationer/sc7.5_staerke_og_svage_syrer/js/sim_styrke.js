/* =====================================================================
   sim_styrke.js - fane 2: Staerk eller svag?

   Fem glas med 0,10 M syre og et stykke kalk (D.GLAS). Etiketterne
   mangler. Et klik paa et glas viser det i luppen. For glas A, B og C
   afgoer eleven ud fra luppen, om syren er staerk eller svag, og
   vaelger pilen i reaktionsskemaet. Glas D og E har faaet deres
   etiket, og her gaetter eleven foerst paa, hvad luppen viser.

   Der er kun én lup. Den viser det glas, der sidst er klikket paa.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    var SET_SEK = 1.2;

    function SimStyrke() {
        this.glas = D.GLAS.map(function (g) {
            var x = new NK.Glas({ id: g.b, syre: g.syre });
            x.kalkI(true);
            return x;
        });
        this.lup = new NK.Lup({});
        this.valgt = -1;
        this.valgtT = 0;
        this.navngivet = D.GLAS.map(function () { return false; });
        this.startFane(D.S_MAAL);
        this.visPanel();
    }

    var P = SimStyrke.prototype;
    NK.Fane.paa(P, { navn: "s", naesteFane: "fane-f", naesteNavn: "Fortyndet?" });

    /* ----- Maalene ------------------------------------------------------------------ */
    P.nyOpgave = function (o) {
        var mig = this;
        /* Navnene paa de glas, der er klaret, og paa dem, der har faaet etiket */
        this.opgaver.forEach(function (m, i) {
            if (mig.status[i].loest) mig.navngivet[m.glas] = true;
        });
        if (o.kendt) this.navngivet[o.glas] = true;
        this.valgt = -1;
        this.valgtT = 0;
        if (this.status) this.visPanel();
    };

    /* Naevner den nye del selv et glas ved navn, staar navnet ogsaa paa glassets seddel */
    P.nyFase = function (fase) {
        var mig = this, del = this.opg.o[fase];
        ((del && del.navngiv) || []).forEach(function (i) { mig.navngivet[i] = true; });
        this.visPanel();
    };

    /* Efter det foerste spoergsmaal faar glasset sit navn */
    P.efterDel = function () {
        this.navngivet[this.opg.o.glas] = true;
        this.visPanel();
    };

    P.efterOpgave = function () {
        this.navngivet[this.opg.o.glas] = true;
        this.visPanel();
    };

    P.vaelgGlas = function (i) {
        if (this.valgt === i) return;
        this.valgt = i;
        this.valgtT = 0;
        this.lup.bytter = true;
        this.lup.saet(this.glas[i].syre, this.glas[i].c, true);
    };

    P.bogstav = function (i) { return D.GLAS[i].b; };

    P.forsoegSvar = function (o) { this.vaelgGlas(o.glas); this.valgtT = SET_SEK; };

    /* Skal reaktionsskemaet vises paa kortet, og med hvilken pil? */
    P.skemaNu = function () {
        var g = this.opg, o = g.o;
        if (!o.spm2) return null;
        if (this.faerdig) return K.pil(D.GLAS[o.glas].syre);
        if (g.fase === "spm2") return "?";
        return null;
    };

    /* Skemaet staar paa kortet under spoergsmaalet om pilen. Naar pilen er
       fundet, staar hele skemaet i forklaringen paa det groenne kort. */
    P.kortEkstra = function () {
        if (this.skemaNu() !== "?") return "";
        var s = K.SYRE[D.GLAS[this.opg.o.glas].syre];
        return '<p class="sk-skema">' + NK.html(s.formel + " + H₂O") + '<span class="sk-pil">?</span>' + NK.html(s.ion + " + H₃O⁺") + "</p>";
    };

    /* ----- Panelet: de fem glas -------------------------------------------------------- */
    P.visPanel = function () {
        var mig = this, html = "";
        D.GLAS.forEach(function (g, i) {
            var s = K.SYRE[g.syre], loest = mig.status[i].loest;
            var hoejre = "ukendt";
            if (mig.navngivet[i]) hoejre = (s.staerk ? "stærk" : "svag") + (loest ? " " + K.pil(g.syre) : "");
            html += '<div class="talraekke"><span><b class="glasbogstav">' + g.b + "</b>" +
                (mig.navngivet[i] ? NK.html(K.Navn(g.syre)) : "") + '</span><span class="tal' +
                (mig.navngivet[i] ? (s.staerk ? " roed" : " blaa") : " mat") + '">' + hoejre + "</span></div>";
        });
        NK.saetHTML("s-glassene", html);
    };

    /* ----- Scenen -------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, baand = this.baand(), Hs = baand.y, n = this.glas.length;
        var lay = { W: W, H: this.L.h, Hs: Hs };
        lay.yBord = Hs - 30;
        var gh = Math.min(NK.klamp((Hs - 68) * 0.23, 108, 190), (W / n - 24) * 1.2);
        var gb = gh / 1.2;
        lay.gb = gb;
        this.glas.forEach(function (g, i) { g.plads(W * (i + 0.5) / n, lay.yBord, gb); });
        var glasTop = lay.yBord - gh;
        /* Oeverst kortet med opgaven, saa signaturen og under den luppen */
        lay.sigY = 10 + this.kortZone() + 8 + 16;
        var lb = Math.min(W - 40, 760), ly = lay.sigY + 22, lh = Math.max(100, glasTop - 30 - ly);
        lay.lup = { x: (W - lb) / 2, y: ly, b: lb, h: lh };
        this.lup.saetMaal(lb, lh);
        this.lay = lay;
        this.sig = null;
        this.saetAnker("glas", 6, glasTop - 4, W - 12, gh + 10);
        this.saetAnker("lup", lay.lup.x, lay.sigY - 18, lb, lh + 42);
    };

    P.opdaterScene = function (dt) {
        var g = this.opg;
        this.glas.forEach(function (x) { x.opdater(dt); });
        if (this.valgt >= 0) { this.lup.opdater(dt); this.valgtT += dt; }
        if (this.faerdig || this.venter || g.fase !== "forsoeg") return;
        if (this.valgt === g.o.glas && this.valgtT >= SET_SEK) this.forsoegKlaret(g.o.forsoeg.set || "");
    };

    P.peger = function () {
        var g = this.opg;
        if (this.faerdig || this.venter || g.fase === "gaet") return -1;
        return this.valgt === g.o.glas ? -1 : g.o.glas;
    };

    /* ----- Tegning ------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, mig = this;
        if (!lay) return;
        ctx.fillStyle = "#14141a";
        ctx.fillRect(0, 0, lay.W, lay.H);
        Tg.bord(ctx, lay.W, lay.yBord, lay.Hs);

        var peger = this.peger(), om = this.omNu();
        this.glas.forEach(function (g, i) {
            /* Sedlen paa glasset siger Glas A, som teksterne goer, og faar syrens navn,
               naar eleven har fundet det. Den kan ikke daekkes af linjen forneden. */
            g.tegn(ctx, {
                etiket: ["Glas " + mig.bogstav(i)].concat(mig.navngivet[i] ? [K.Navn(g.syre)] : []),
                ph: NK.visPH, tid: mig.tid, peg: peger === i, om: om.indexOf(i) >= 0
            });
        });

        var R = lay.lup;
        if (this.valgt >= 0) {
            var i = this.valgt, kendt = this.navngivet[i], s = K.SYRE[this.lup.syre];
            this.lup.tegn(ctx, R, { skilte: true });
            Tg.zoomRamme(ctx, R, this.glas[i].zoomFelt(), om.indexOf(i) >= 0);
            this.sig = Tg.signatur(ctx, R.x + R.b / 2, lay.sigY, this.lup.syre, kendt ? [
                { slags: "hel", tekst: s.formel }, { slags: "ion", tekst: s.ion }, { slags: "ox", tekst: "H₃O⁺" }
            ] : [
                { slags: "hel", tekst: "helt syremolekyle" }, { slags: "ion", tekst: "syrens ion" }, { slags: "ox", tekst: "H₃O⁺" }
            ], R.b);
        } else if (!this.gaetNu()) {
            /* Luppens plads, foer der er valgt et glas (under et gaet staar kortet der) */
            ctx.save();
            NK.rundtRekt(ctx, R.x, R.y, R.b, R.h, 12);
            ctx.setLineDash([7, 6]);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#3d4150";
            ctx.stroke();
            ctx.restore();
            NK.tekst(ctx, "Luppen", R.x + R.b / 2, R.y + R.h / 2 + 6, { font: Tg.font("700", 17), justering: "center", farve: "#6f7682" });
        }

        if (peger >= 0) {
            var gl = this.glas[peger], m = gl.maal();
            Tg.skilt(ctx, "Klik for at se i luppen", gl.x, m.y0 - 10, 8, lay.W - 8);
        }
        this.tegnSejr(ctx, lay.W, lay.Hs);
    };

    /* ----- Musen ---------------------------------------------------------------------- */
    P.glasVed = function (pt) {
        for (var i = 0; i < this.glas.length; i++) if (this.glas[i].rammer(pt)) return i;
        return -1;
    };

    P.iLup = function (pt) {
        var R = this.lay.lup;
        return this.valgt >= 0 && pt.x >= R.x && pt.x <= R.x + R.b && pt.y >= R.y && pt.y <= R.y + R.h;
    };

    P.overScene = function (pt) {
        if (!pt || !this.lay) return null;
        if (this.iForsoeg() && this.glasVed(pt) === this.opg.o.glas && this.valgt !== this.opg.o.glas) return "klik";
        if (this.valgt >= 0 && Tg.signaturVed(this.sig, pt)) return "klik";
        if (this.iLup(pt) && this.lup.ved(pt.x - this.lay.lup.x, pt.y - this.lay.lup.y)) return "klik";
        return null;
    };

    P.klikScene = function (pt) {
        if (!this.lay) return;
        /* At se naermere paa det, luppen viser, er altid i orden */
        var sl = this.valgt >= 0 ? Tg.signaturVed(this.sig, pt) : null;
        if (sl) { this.kortBesked(D.partikel(sl, this.lup.syre, this.navngivet[this.valgt]), 7); return; }
        if (this.iLup(pt)) {
            var hit = this.lup.ved(pt.x - this.lay.lup.x, pt.y - this.lay.lup.y);
            if (hit) this.kortBesked(D.partikel(hit.slags, this.lup.syre, this.navngivet[this.valgt]), 6);
            return;
        }
        var i = this.glasVed(pt);
        if (i < 0) return;
        /* Laasen: et glas kan kun aabnes i luppen, naar opgaven beder om netop det glas */
        if (this.spaer()) return;
        if (i !== this.opg.o.glas || this.valgt === i) { this.kortBlink(); return; }
        this.vaelgGlas(i);
        this.nulstilHjaelp();
    };

    NK.SimStyrke = SimStyrke;
}());
