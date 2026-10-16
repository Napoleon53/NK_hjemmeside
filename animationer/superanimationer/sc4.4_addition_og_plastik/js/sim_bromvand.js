/* =====================================================================
   sim_bromvand.js - fane 2: Bromvand

   Fem reagensglas, A til E. Nederst i hvert glas staar orange
   bromvand, og oeverst ligger et farveloest carbonhydrid med seks
   carbonatomer. Eleven ryster et glas (et klik, eller ved at tage fat
   og ryste med musen) og ser, om farven forsvinder eller flytter op i
   det oeverste lag. Ud fra det afgoeres det, om stoffet er maettet
   eller umaettet. Saa faar glasset sit navn, og luppen viser det
   oeverste lag helt taet paa.

   Glassene er js/glas.js, luppen js/lup.js. Fanen bestemmer kun, hvad
   der er fremme, og hvornaar et maal er naaet.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    function SimBromvand() {
        this.glas = D.GLAS.map(function (g) { return new NK.Roer({ id: g.b, stof: g.stof }); });
        this.navngivet = D.GLAS.map(function () { return false; });
        this.set = D.GLAS.map(function () { return false; });       /* eleven har set, hvad der skete */
        this.valgt = -1;
        this.mikro = new NK.Mikro();
        this.mikroGlas = -1;
        this.traek = null;
        this.over = -1;
        this.andetKlik = 0;       /* klik paa glas, opgaven ikke handler om */
        this.startFane(D.B_MAAL);
        this.visPanel();
    }

    var P = SimBromvand.prototype;
    NK.Fane.paa(P, { navn: "b", naesteFane: "fane-p", naesteNavn: "Plastik" });

    /* ----- Maalene ------------------------------------------------------------------ */
    P.nyOpgave = function (o) {
        var mig = this;
        /* de glas, eleven har klaret foer, har stadig deres navn */
        if (!this.hentet) {
            this.hentet = true;
            this.opgaver.forEach(function (x, i) { if (mig.status[i].loest) mig.navngivet[x.glas] = true; });
        }
        this.traek = null;
        this.andetKlik = 0;
        this.glas[o.glas].nulstil();
        this.set[o.glas] = false;
        if (o.kendt) this.navngivet[o.glas] = true;
        this.valgt = -1;
        this.mikroGlas = -1;
        if (this.status) this.visPanel();
    };

    P.efterOpgave = function () {
        var i = this.opg.o.glas;
        this.navngivet[i] = true;
        this.glas[i].m = 1;
        this.set[i] = true;
        this.vaelgGlas(i);
        this.visPanel();
    };

    P.nulstilScene = function () {
        /* Et friskt glas (tasten R) hoerer til forsoeget */
        if (!this.iForsoeg()) return;
        var i = this.opg.o.glas;
        this.traek = null;
        this.glas[i].nulstil();
        this.set[i] = false;
        if (this.valgt === i) { this.valgt = -1; this.mikroGlas = -1; }
        this.visPanel();
    };

    P.glasNavn = function (i) {
        return this.navngivet[i] ? K.VAESKE[D.GLAS[i].stof].navn : "";
    };

    /* Luppen viser det valgte glas, naar det har faaet navn og er rystet */
    P.lupNu = function () {
        var i = this.valgt;
        if (i < 0 || this.gaetNu() || !this.navngivet[i] || this.glas[i].m < 1) return -1;
        return i;
    };

    P.vaelgGlas = function (i) {
        this.valgt = i;
        if (this.lupNu() === i && this.mikroGlas !== i) {
            this.mikro.saet(D.GLAS[i].stof);
            this.mikroGlas = i;
        }
    };

    /* Kortets opgavetekst siger, hvilket glas der skal rystes. Linjen under
       den har kun noget at tilfoeje, mens glasset er i gang. */
    P.sceneLinje = function () {
        var o = this.opg.o, gl = this.glas[o.glas], b = D.GLAS[o.glas].b;
        if (gl.rystes()) return gl.m >= 1 || gl.auto > 0 ? "" : "Glas " + b + " er ikke rystet nok endnu. Ryst glas " + b + " lidt mere.";
        if (gl.m >= 1) return "Vent, til de to lag i glas " + b + " har skilt sig igen.";
        if (gl.m > 0) return "Glas " + b + " er ikke rystet nok endnu. Ryst glas " + b + " lidt mere.";
        return "";
    };

    P.forsoegSvar = function (o) {
        var gl = this.glas[o.glas];
        gl.nulstil();
        gl.m = 1;
        this.set[o.glas] = true;
        this.vaelgGlas(o.glas);
        this.visPanel();
    };

    /* ----- Panelet: det, eleven har fundet ud af om hvert glas ---------------------------- */
    P.visPanel = function () {
        var mig = this, html = "";
        D.GLAS.forEach(function (g, i) {
            var v = K.VAESKE[g.stof], set = mig.set[i], loest = mig.status[i] && mig.status[i].loest;
            var navn = mig.navngivet[i] ? v.navn : "ukendt";
            var dom = "";
            if (set) dom = D.SET_KORT[K.udfald(g.stof)];
            if (loest) dom = v.aromatisk ? "ikke som en alken" : (K.erMaettet(g.stof) ? "mættet" : "umættet");
            html += '<div class="talraekke"><span><span class="glasbogstav">' + g.b + "</span>" + NK.html(navn) + "</span>" +
                '<span class="tal' + (dom ? (K.affarver(g.stof) ? " blaa" : " roed") : " mat") + '">' + NK.html(dom || "ikke rystet") + "</span></div>";
        });
        NK.saetHTML("b-glassene", html);
    };

    /* ----- Scenen -------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, baand = this.baand(), Hs = baand.y;
        var lay = { W: W, H: this.L.h, Hs: Hs };
        lay.yBord = Hs - 40;
        lay.bh = baand.h;
        /* Oeverst kortet med opgaven, saa luppen og nederst glassene */
        var kortBund = 10 + this.kortZone();
        var gh = NK.klamp((lay.yBord - kortBund) * 0.5, 136, 230), gb = gh * 60 / 230;
        lay.gb = gb;
        lay.gh = gh;
        var xs = [0.14, 0.32, 0.5, 0.68, 0.86].map(function (f) { return W * f; });
        this.glas.forEach(function (g, i) { g.plads(xs[i], lay.yBord, gb); });
        lay.glasTop = this.glas[0].maal().y0;
        var lb = Math.min(W - 40, 680), ly = kortBund + 8 + 26;
        lay.lup = { x: W / 2 - lb / 2, y: ly, b: lb, h: Math.max(64, lay.glasTop - 30 - ly) };
        this.mikro.saetMaal(lay.lup.b, lay.lup.h);
        this.lay = lay;
        this.saetAnker("glas", xs[0] - gb, lay.glasTop - 4, xs[4] - xs[0] + 2 * gb, gh + 52);
        this.saetAnker("lup", lay.lup.x, ly - 24, lb, lay.lup.h + 28);
        NK.el("b-anker-lup").hidden = this.lupNu() < 0;
    };

    P.opdaterScene = function (dt) {
        var g = this.opg, mig = this;
        if (this.lay && this.baand().h !== this.lay.bh) this.layout();
        this.glas.forEach(function (x, i) {
            var foer = x.faerdig();
            x.opdater(dt);
            /* glasset er lige blevet faerdigt: eleven har set, hvad der skete */
            if (!foer && x.faerdig() && !mig.set[i]) {
                mig.set[i] = true;
                mig.visPanel();
                if (mig.valgt === i) mig.vaelgGlas(i);
            }
        });
        var lup = this.lupNu();
        if (lup >= 0) {
            if (this.mikroGlas !== lup) this.vaelgGlas(lup);
            this.mikro.opdater(dt);
        }
        NK.el("b-anker-lup").hidden = lup < 0;
        if (!this.iForsoeg()) return;
        var i = g.o.glas;
        if (this.glas[i].faerdig()) {
            this.vaelgGlas(i);
            this.forsoegKlaret(g.o.forsoeg.set || "");
        }
    };

    /* Det glas, der skal rystes nu, eller -1 */
    P.peger = function () {
        var g = this.opg;
        if (!this.iForsoeg()) return -1;
        var gl = this.glas[g.o.glas];
        return gl.m > 0 || gl.rystes() ? -1 : g.o.glas;
    };

    /* ----- Tegning ------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, mig = this;
        if (!lay) return;
        ctx.fillStyle = "#14141a";
        ctx.fillRect(0, 0, lay.W, lay.H);
        Tg.bord(ctx, lay.W, lay.yBord, lay.Hs);

        var peger = this.peger(), lup = this.lupNu(), om = this.omNu();

        /* Luppen over glassene: det oeverste lag i det valgte glas */
        if (lup >= 0) {
            var R = lay.lup, v = K.VAESKE[D.GLAS[lup].stof];
            Tg.zoomRamme(ctx, R, this.glas[lup].rystes() ? null : this.glas[lup].zoomFelt(), om.indexOf(lup) >= 0);
            this.mikro.tegn(ctx, R);
            /* én linje over luppen: hvad den viser til venstre, hvad der sker til hoejre */
            NK.tekst(ctx, "Det øverste lag i glas " + D.GLAS[lup].b + ": " + v.navn, R.x + 4, R.y - 9, { font: Tg.font("700", 15), farve: "#e6eaef" });
            var a = this.mikro.antal(), under;
            if (K.affarver(D.GLAS[lup].stof)) under = a.frie ? "Brom finder dobbeltbindingerne" : "Brom har sat sig på dobbeltbindingerne";
            else under = "Brom, Br₂, er ikke brugt";
            NK.tekst(ctx, under, R.x + R.b - 4, R.y - 9, { font: Tg.font("600", 14), justering: "right", farve: K.affarver(D.GLAS[lup].stof) ? "#b8f0cf" : "#f7c9a0" });
        }

        this.glas.forEach(function (g, i) {
            var ude = g.rystes() || Math.abs(g.dy) > 1;
            if (ude) g.tegnHolder(ctx);
            g.tegn(ctx, { peg: peger === i, om: om.indexOf(i) >= 0, tid: mig.tid, bogstav: D.GLAS[i].b });
            if (!ude) g.tegnHolder(ctx);
            /* Navnet staar under glasset, naar eleven har fundet ud af, hvad der er i */
            var navn = mig.glasNavn(i);
            NK.tekst(ctx, navn || "Glas " + D.GLAS[i].b, g.x, lay.yBord + 25, { font: Tg.font(navn ? "700" : "600", 14.5), justering: "center", farve: navn ? (mig.status[i].loest ? "#9af0c0" : "#f2f3f5") : "#9aa3ae" });
        });

        if (peger >= 0 && !this.traek) {
            var gl = this.glas[peger];
            Tg.skilt(ctx, "Klik for at ryste", gl.x, gl.maal().y0 - 8, 8, lay.W - 8);
        }
        this.tegnSejr(ctx, lay.W, lay.Hs);
    };

    /* ----- Musen ---------------------------------------------------------------------- */
    P.glasVed = function (pt) {
        for (var i = 0; i < this.glas.length; i++) if (this.glas[i].rammer(pt)) return i;
        return -1;
    };

    P.lupVed = function (pt) {
        var R = this.lay.lup;
        if (this.lupNu() < 0) return null;
        if (pt.x < R.x || pt.x > R.x + R.b || pt.y < R.y || pt.y > R.y + R.h) return null;
        return this.mikro.ved(pt.x - R.x, pt.y - R.y);
    };

    P.overScene = function (pt) {
        this.over = -1;
        if (!pt || !this.lay) return null;
        var i = this.glasVed(pt);
        if (i >= 0) { this.over = i; return this.iForsoeg() && i === this.opg.o.glas ? "greb" : "klik"; }
        return this.lupVed(pt) ? "klik" : null;
    };

    P.nedScene = function (pt) {
        var i = this.glasVed(pt);
        if (i < 0 || this.glas[i].auto > 0) return false;
        /* Laasen: et glas kan kun rystes, mens kortet viser et forsoeg, og kun det
           glas, opgaven handler om. Ellers blinker kortet. */
        if (this.spaer()) return false;
        if (i !== this.opg.o.glas) { this.andetGlas(i); return false; }
        if (this.glas[i].m >= 1) return false;
        this.traek = { i: i, x0: pt.x, y0: pt.y, x: pt.x, y: pt.y, vej: 0 };
        this.glas[i].holdt = true;
        return true;
    };

    /* Et klik paa et glas, opgaven ikke handler om: det bliver ikke rystet */
    P.andetGlas = function (i) {
        var g = D.GLAS[i], navn = this.glasNavn(i), rystet = !!navn && this.glas[i].m >= 1;
        this.kortBlink();
        this.andetKlik++;
        if (this.andetKlik >= 4) { this.andetKlik = 0; this.kortBesked(D.PAASKE.ryst, 6); return; }
        /* et glas, der er faerdigt, kan ses i luppen igen */
        if (rystet) this.vaelgGlas(i);
        this.kortBesked(D.andetGlas(g.b, D.GLAS[this.opg.o.glas].b, rystet ? navn : "", rystet ? D.set(g.b, K.udfald(g.stof)) : "") +
            (rystet && g.stof === "benzen" ? " " + D.GLAS_KLIK.benzen : ""), 7);
    };

    P.flytScene = function (pt) {
        var t = this.traek;
        if (!t) return;
        var d = Math.hypot(pt.x - t.x, pt.y - t.y), gl = this.glas[t.i];
        t.x = pt.x; t.y = pt.y;
        t.vej += d;
        gl.dx = NK.klamp(pt.x - t.x0, -70, 70);
        gl.dy = NK.klamp(pt.y - t.y0, -110, 12);
        if (t.vej > 10) gl.rystMus(d);
    };

    P.opScene = function () {
        var t = this.traek;
        this.traek = null;
        if (!t) return;
        var gl = this.glas[t.i];
        gl.holdt = false;
        if (t.vej < 8) { this.klikGlas(t.i); return; }
        this.vaelgGlas(t.i);
        this.nulstilHjaelp();
        if (this.iForsoeg()) this.naesteLinje("", "");
    };

    /* Et klik paa et glas ryster det */
    P.klikGlas = function (i) {
        if (!this.iForsoeg() || i !== this.opg.o.glas) return;
        if (!this.glas[i].klikRyst()) return;
        this.vaelgGlas(i);
        this.nulstilHjaelp();
        this.naesteLinje("", "");
    };

    P.klikScene = function (pt) {
        if (!this.lay) return;
        var hit = this.lupVed(pt);
        if (!hit) return;
        var v = K.VAESKE[D.GLAS[this.lupNu()].stof];
        this.kortBesked(hit.slags === "br" ? D.lupBrom : D.lupStof(v, hit.reageret), 7);
    };

    NK.SimBromvand = SimBromvand;
}());
