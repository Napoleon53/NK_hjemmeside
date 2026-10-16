/* =====================================================================
   sim_fejl.js - fane 3: fejlkilderne

   To grupper laver forsoeget side om side. Gruppe A goer det rigtigt,
   gruppe B goer én ting anderledes: vejer lighteren vaad, taender den
   foerst, lader bobler slippe forbi, har luft i maaleglasset, slipper
   dobbelt saa meget gas ud eller arbejder ved 30 °C. Eleven gaetter
   foerst, om B's molarmasse bliver hoejere, lavere eller den samme. Saa
   koerer begge forsoeg (kemi.js, K.Forloeb), og tabellen i panelet
   viser, hvad de to grupper faar. Forklaringen gaelder det gaet, eleven
   valgte. Scenen er fast, 900 x 650 enheder, som paa fane 1.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;
    var TID = K.FORLOEB_TID;

    var SB = 900, SH = 650, BORD = 560, SK = 0.7;
    var CX = [215, 640];
    var GRAENSE = 0.02;      /* forskel paa molarmassen, der taeller som hoejere eller lavere */

    function SimFejl() {
        this.over = null;
        this.startFane(D.FEJL);
        this.el.valg = NK.el("fejl-valg");
        this.introNu = true;
        this.vaelg(0, false);
    }

    var P = SimFejl.prototype;
    NK.Fane.paa(P, { navn: "fejl" });

    /* ----- Opgaven -------------------------------------------------------------- */
    P.lavOpgave = function (i) {
        this.opg = D.FEJL[i];
        this.valgt = null;
        this.res = null;
        this.auto = null;
        this.forklaring = "";
        this.nyeForloeb();
        this.visTabel();
    };

    P.nyeForloeb = function () {
        var mig = this;
        this.st = [{}, this.opg.B].map(function (B, i) {
            var f = new K.Forloeb(B);
            return { f: f, geo: Tg.opstillingGeo(CX[i], BORD, SK, f.glas), bobler: new NK.Bobler(i * 5 + 2) };
        });
        this.koerer = false;
        void mig;
    };

    P.harNyeTal = function () { return false; };
    P.harForfra = function () { return this.valgt !== null && !this.koerer; };

    /* Koer igen: de samme to grupper forfra */
    P.forfra = function () {
        if (this.valgt === null || this.koerer) return;
        this.nyeForloeb();
        this.start();
    };

    P.promptHTML = function () {
        var o = this.opg;
        return '<p class="maal-tekst">' + NK.html(o.tekst) + "</p>" +
            (this.faerdig ? "" : '<p class="opgave-spm">' + NK.html(D.FEJL_SPM) + "</p>");
    };

    P.visKortEkstra = function () {
        var mig = this, e = this.el.valg, o = this.opg;
        e.hidden = false;
        e.innerHTML = "";
        D.FEJL_SVAR.forEach(function (s, j) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "knap";
            b.textContent = s.t;
            if (mig.valgt !== null) {
                b.disabled = true;
                if (j === mig.valgt) b.classList.add("valgt");
                if (mig.faerdig && s.id === o.rigtig) b.classList.add("rigtig");
                if (mig.faerdig && j === mig.valgt && s.id !== o.rigtig) b.classList.add("forkert");
            }
            b.addEventListener("click", function () { mig.vaelgSvar(j, "gaet"); });
            e.appendChild(b);
        });
    };

    P.vaelgSvar = function (j, maade) {
        if (this.valgt !== null) return;
        this.valgt = j;
        this.hjaelp = 0;
        if (maade === "svar") {
            this.brugtSvar = true;
            this.svarForud = NK.html("Den rigtige: " + D.FEJL_SVAR[j].t.toLowerCase() + ". Se forsøgene.");
        }
        this.start();
    };

    P.start = function () {
        this.koerer = true;
        this.auto = true;
        this.res = null;
        this.visTabel();
        this.visKort();
        var pre = this.svarForud || (this.brugtSvar ? "" : "Dit gæt: " + NK.html(D.FEJL_SVAR[this.valgt].t.toLowerCase()) + ".");
        this.svarForud = "";
        this.besked((pre ? pre + " " : "") + this.trinLinje(), this.brugtSvar ? "gul" : "");
    };

    /* ----- Knappen og linjen ------------------------------------------------------ */
    P.trinInfo = function () {
        var o = this.opg, mig = this;
        if (this.faerdig || this.valgt !== null) return null;
        var ret = D.FEJL_SVAR.map(function (s) { return s.id; }).indexOf(o.rigtig);
        return { hint: NK.html(o.hint), svar: function () { mig.vaelgSvar(ret, "svar"); } };
    };

    P.opgaveFaerdig = function () { return this.res !== null; };

    P.trinLinje = function () {
        if (this.valgt === null) return "Gæt først: vælg et af svarene herunder.";
        if (this.koerer) return "Begge grupper laver forsøget. Hold øje med måleglassene og tallene.";
        return "";
    };

    P.slutLinje = function () { return this.forklaring; };

    P.afslut = function () {
        var o = this.opg;
        this.koerer = false;
        this.auto = null;
        this.res = { A: this.st[0].f.resultat(), B: this.st[1].f.resultat() };
        var s = D.FEJL_SVAR[this.valgt];
        var pre = s.id === o.rigtig ? "Dit gæt holdt." : "Du gættede: " + s.t.toLowerCase() + ". " + o.fejl[s.id];
        this.forklaring = NK.html(pre + " " + o.forkl);
        this.visTabel();
        if (this.faerdig) {
            /* Koer igen efter en loest opgave: kun tabellen og linjen skifter */
            this.besked(this.forklaring, "god");
            this.visKort();
            return;
        }
        /* Et forkert gaet giver ingen stjerne, men opgaven er loest */
        var ret = s.id === o.rigtig, havde = this.status[this.nr].stjerne;
        this.trinLoest(ret && !this.brugtSvar ? "ok" : "svar", null);
        if (!ret) {
            this.status[this.nr].stjerne = havde;
            this.gem();
            this.visListe();
        }
    };

    /* Sammenligningen, som den ser ud i tabellen */
    P.retning = function () {
        var r = this.res;
        if (!r) return null;
        if (r.B.M > r.A.M * (1 + GRAENSE)) return "hoejere";
        if (r.B.M < r.A.M * (1 - GRAENSE)) return "lavere";
        return "samme";
    };

    /* Tabellen i panelet: A og B, efterhaanden som de skriver tallene */
    P.visTabel = function () {
        var st = this.st;
        function saet(id, a, b) {
            NK.saetTekst("fejl-t-" + id + "-a", a || "");
            NK.saetTekst("fejl-t-" + id + "-b", b || "");
        }
        var sa = st[0].f.t > 0 || this.res ? st[0].f.skrevet() : null;
        var sb = st[1].f.t > 0 || this.res ? st[1].f.skrevet() : null;
        function g(v) { return v !== null && v !== undefined ? K.g2(v) + " g" : ""; }
        function mL(v) { return v !== null && v !== undefined ? K.V(v) + " mL" : ""; }
        saet("mf", sa && g(sa.mf), sb && g(sb.mf));
        saet("V", sa && mL(sa.V), sb && mL(sb.V));
        saet("me", sa && g(sa.me), sb && g(sb.me));
        var r = this.res;
        saet("dm", r && K.g2(r.A.dm) + " g", r && K.g2(r.B.dm) + " g");
        saet("M", r && K.Mv(r.A.M) + " g/mol", r && K.Mv(r.B.M) + " g/mol");
        var tabel = NK.el("fejl-tabel");
        if (tabel) {
            var ret = this.retning();
            tabel.classList.toggle("hoejere", ret === "hoejere");
            tabel.classList.toggle("lavere", ret === "lavere");
        }
    };

    /* ----- Opdater ------------------------------------------------------------------ */
    P.opdaterScene = function (dt) {
        var mig = this;
        if (!this.lay) return;
        if (this.koerer) {
            var foer = this.st.map(function (s) { return s.f.skrevet(); });
            this.st.forEach(function (s) { s.f.opdater(dt); });
            var nu = this.st.map(function (s) { return s.f.skrevet(); });
            if (JSON.stringify(foer) !== JSON.stringify(nu)) this.visTabel();
            if (this.st[0].f.faerdig && this.st[1].f.faerdig) this.afslut();
        }
        this.st.forEach(function (s) {
            var f = s.f, geo = s.geo, gl = geo.glas;
            var p = mig.lighterBund(s);
            var g = Tg.lighterGeo(p.x, p.yb, geo.lh);
            var flow = f.giverGas() ? f.V20 / (TID.op - TID.gas) * 1.2 : 0;
            s.bobler.opdater(dt, { flow: flow, fang: 1 - f.forbi, kilde: { x: g.dyse.x, y: g.dyse.y - 3 }, fri: false,
                mund: { x: gl.cx, y: gl.mund, halv: (gl.ind1 - gl.ind0) / 2 }, niveau: gl.yV(f.Vnu()), overflade: geo.vandY, sk: SK });
        });
        if (this.pegT > 0) {
            this.pegT -= dt;
            this.el.valg.classList.toggle("peg", this.pegT > 0);
        }
    };

    /* Hvor lighteren staar i forloebet: paa bordet, i vandet eller paa vej */
    P.lighterBund = function (s) {
        var f = s.f, geo = s.geo, t = f.t;
        var bord = { x: geo.kar.x0 - 44 * SK, yb: BORD };
        var vand = { x: geo.plads.x, yb: geo.plads.yb };
        function tween(a, b, u) {
            u = NK.blod(u);
            return { x: NK.lerp(a.x, b.x, u), yb: NK.lerp(a.yb, b.yb, u) - Math.sin(u * Math.PI) * 50 * SK };
        }
        if (t < TID.ned) return bord;
        if (t < TID.gas) return tween(bord, vand, (t - TID.ned) / (TID.gas - TID.ned));
        if (t < TID.op) return vand;
        if (t < TID.vej) return tween(vand, bord, (t - TID.op) / (TID.vej - TID.op));
        return bord;
    };

    /* ----- Musen --------------------------------------------------------------------- */
    P.tilS = function (pt) {
        var l = this.lay;
        return { x: (pt.x - l.ox) / l.k, y: (pt.y - l.oy) / l.k };
    };

    P.hvad = function (pt) {
        if (!this.lay || !pt) return null;
        var s = this.tilS(pt);
        for (var i = 0; i < 2; i++) {
            var geo = this.st[i].geo;
            if (s.x >= geo.kar.x0 - 80 * SK && s.x <= geo.stativ.x0 + geo.stativ.b && s.y >= geo.glas.y0 - 30 && s.y <= BORD + 70) return i ? "b" : "a";
        }
        return null;
    };

    P.overScene = function (pt) {
        this.over = this.hvad(pt);
        return null;
    };

    P.nedScene = function (pt) {
        var u = this.hvad(pt);
        if (this.valgt === null && (u === "a" || u === "b")) {
            this.kortBesked("Gæt først: vælg et af svarene i kortet.");
            this.pegT = 1.6;
        } else if (u === "a") this.kortBesked(D.FEJL_A);
        else if (u === "b") this.kortBesked(NK.html(this.opg.tekst));
        return false;
    };

    /* ----- Layout -------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var k = Math.min(W / SB, H / SH);
        var lay = { W: W, H: H, k: k, ox: (W - SB * k) / 2, oy: H - SH * k };
        this.lay = lay;
        var mig = this;
        [0, 1].forEach(function (i) {
            var geo = mig.st[i].geo;
            var x0 = geo.kar.x0 - 80 * SK, x1 = geo.stativ.x0 + geo.stativ.b;
            mig.saetAnker(i ? "b" : "a", lay.ox + x0 * k, lay.oy + (geo.glas.y0 - 40) * k, (x1 - x0) * k, (BORD + 80 - geo.glas.y0) * k);
        });
    };

    /* ----- Tegn --------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, o = this.opg, mig = this;
        if (!lay) return;
        var k = lay.k, t = this.tid;
        this.L.ryd();
        Tg.rum(ctx, lay.W, lay.H, lay.oy + (BORD + 12) * k);
        Tg.bord(ctx, 0, lay.W, lay.oy + BORD * k, lay.H);
        ctx.save();
        ctx.translate(lay.ox, lay.oy);
        ctx.scale(k, k);
        this.st.forEach(function (s, i) {
            var f = s.f, geo = s.geo, V = f.Vnu();
            var p = mig.lighterBund(s);
            var g = Tg.lighterGeo(p.x, p.yb, geo.lh);
            var iVand = f.t >= TID.gas && f.t < TID.op;
            var gasTilbage = D.GAS_I - K.gram(f.V20 * (iVand ? f.gasAndel() : (f.t >= TID.op ? 1 : 0)));
            var st = { gas: gasTilbage, vand: 0, film: f.film > 0 && f.t >= TID.op ? f.film : 0, haette: true, pind: D.PIND_START,
                       knap: f.giverGas() || f.braender() ? 1 : 0, koger: f.giverGas() ? 0.5 : 0, tid: t, nr: i };
            Tg.opstillingBag(ctx, geo, { V: V, lys: mig.over === (i ? "b" : "a") });
            if (iVand) Tg.lighter(ctx, g, st);
            s.bobler.tegn(ctx);
            Tg.opstillingFor(ctx, geo, { V: V });
            if (!iVand) Tg.lighter(ctx, g, st);
            if (f.braender()) Tg.flamme(ctx, g.P(24, 14).x, g.P(24, 14).y, 26, t, false);
            /* Termometeret, naar temperaturen er en del af forskellen */
            if (o.B.t) Tg.termometer(ctx, geo.kar.x0 - 20 * SK, geo.vandY - 40, 110 * SK, f.tC, 15);
            /* Bogstavet, teksten under og det, gruppen har skrevet */
            Tg.maerke(ctx, geo.kar.x0 - 44 * SK, geo.glas.y0 + 16, 16, i ? "B" : "A", i ? "#9b6bd6" : "#3d9ee0");
            if (f.glas > 250) NK.tekst(ctx, "500 mL", geo.glas.cx, geo.glas.y0 - 10, { font: Tg.font("700", 14), justering: "center", farve: "#d9c6f5" });
            Tg.etiket(ctx, i ? o.kort : "som det skal være", geo.cx, BORD + 26, 16, i ? "#d9c6f5" : "#b8dcf5");
            var sk = f.skrevet(), linjer = [];
            if (f.t > 0) linjer.push("m(før) = " + K.g2(sk.mf) + " g");
            if (sk.V !== null) linjer.push("V = " + K.V(sk.V) + " mL");
            if (sk.me !== null) linjer.push("m(efter) = " + K.g2(sk.me) + " g");
            NK.tekst(ctx, linjer.join("   "), geo.cx, BORD + 52, { font: Tg.font("700", 15), justering: "center", linje: "middle", farve: "#f5dd8a" });
        });
        ctx.restore();
    };

    NK.SimFejl = SimFejl;
}());
