/* =====================================================================
   sim_fejl.js - fane 3: fejlkilderne

   To grupper laver forsoeget side om side. Gruppe 1 goer det rigtigt,
   gruppe 2 goer én ting anderledes: vejer kun én gang, vejer diglen
   varm, hoej flamme fra start, fugtig natron, varmer dobbelt saa laenge
   eller tager soda. Eleven gaetter foerst, om gruppe 2's slutmasse
   bliver hoejere, lavere eller den samme. Saa koerer begge forsoeg i den
   samme model som paa fane 1, hurtigt, og grafen og tabellen viser, hvad
   de to grupper faar, og hvilken hypotese deres masse passer med.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var T = NK.Tjek;
    var Tg = NK.Tegn;

    var TEMPO = 6;          /* minutter i laboratoriet pr. sekund */
    var TEMPO_SLUT = 15;    /* naar kun gruppe 2 mangler */
    var FARVE = ["#3d9ee0", "#b58be8"];

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
        this.G = [nyGruppe({}, 1), nyGruppe(this.opg.B, 2)];
        this.koerer = false;
    };

    function nyGruppe(B, nr) {
        return { f: new K.Forloeb(B), damp: new NK.Damp(nr * 5), korn: new NK.Korn(nr * 3), akku: 0, pos: 0 };
    }

    P.harNyeTal = function () { return false; };
    P.harForfra = function () { return this.valgt !== null && !this.koerer; };

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
            this.svarVis(NK.html("Den rigtige: " + D.FEJL_SVAR[j].t.toLowerCase() + ". Se forsøgene."));
        } else {
            this.k.tie();
        }
        this.start();
    };

    P.start = function () {
        this.koerer = true;
        this.auto = true;
        this.res = null;
        this.visTabel();
        this.visKort();
        this.besked((this.brugtSvar ? "" : "Dit gæt: " + NK.html(D.FEJL_SVAR[this.valgt].t.toLowerCase()) + ". ") + this.trinLinje(), "");
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
        if (this.koerer) return "Begge grupper laver forsøget. Tiden går hurtigt. Hold øje med grafen.";
        return "";
    };

    P.slutLinje = function () { return this.forklaring; };

    P.afslut = function () {
        var o = this.opg;
        this.koerer = false;
        this.auto = null;
        this.res = this.G.map(function (g) { return { mf: D.FEJL_M, slut: g.f.slut }; });
        var s = D.FEJL_SVAR[this.valgt];
        var pre = s.id === o.rigtig ? "Dit gæt holdt." : "Du gættede: " + s.t.toLowerCase() + ". " + o.fejl[s.id];
        this.forklaring = NK.html(pre + " " + o.forkl);
        this.visTabel();
        if (this.faerdig) {
            this.besked(this.forklaring, "god");
            this.visKort();
            return;
        }
        var ret = s.id === o.rigtig, havde = this.status[this.nr].stjerne;
        this.trinLoest(ret && !this.brugtSvar ? "ok" : "svar", null);
        if (!ret) {
            this.status[this.nr].stjerne = havde;
            this.gem();
            this.visListe();
        }
    };

    /* Tabellen i panelet: gruppe 1 og 2 */
    P.visTabel = function () {
        var r = this.res, forv = K.forventet(D.FEJL_M);
        function saet(id, a, b) {
            NK.saetTekst("fejl-t-" + id + "-1", r ? a : "");
            NK.saetTekst("fejl-t-" + id + "-2", r ? b : "");
        }
        function passer(x) {
            var h = K.naermest(x.slut, forv);
            return h ? h + ": " + T.P(h) : "ingen";
        }
        var A = r && r[0], B = r && r[1];
        saet("mf", A && K.g2(A.mf) + " g", B && K.g2(B.mf) + " g");
        saet("slut", A && K.g2(A.slut) + " g", B && K.g2(B.slut) + " g");
        saet("tab", A && K.g2(K.r2(A.mf - A.slut)) + " g", B && K.g2(K.r2(B.mf - B.slut)) + " g");
        saet("hyp", A && passer(A), B && passer(B));
        var tabel = NK.el("fejl-tabel");
        if (tabel && A && B) {
            tabel.classList.toggle("hoejere", B.slut > A.slut + 0.005);
            tabel.classList.toggle("lavere", B.slut < A.slut - 0.005);
        } else if (tabel) { tabel.classList.remove("hoejere"); tabel.classList.remove("lavere"); }
    };

    /* ----- Opdater ------------------------------------------------------------------ */
    P.opdaterScene = function (dt) {
        var lay = this.lay, mig = this;
        if (!lay) return;
        if (this.koerer) {
            var sp = this.G[0].f.faerdig ? TEMPO_SLUT : TEMPO;
            this.G.forEach(function (g) { if (!g.f.faerdig) g.f.opdater(dt * sp); });
            if (this.G[0].f.faerdig && this.G[1].f.faerdig) this.afslut();
        }
        this.G.forEach(function (g, i) {
            var d = g.f.d;
            var maal = d.sted === "vaegt" ? 1 : 0;
            g.pos = NK.mod(g.pos, maal, 7, dt);
            if (Math.abs(g.pos - maal) < 0.01) g.pos = maal;
            g.damp.opdater(dt, mig.koerer && !g.f.faerdig ? d.gas / 3 : 0);
            if (d.sprojtRate > 0 && mig.koerer) {
                g.akku += d.sprojtRate * dt * 60;
                var n = Math.floor(g.akku);
                if (n > 0) { g.akku -= n; g.korn.sprojt(Math.min(n, 8)); }
            }
            var st = lay.st[i];
            g.korn.opdater(dt, (lay.bordY - st.op.digel.bund + Tg.digelHoejde(st.op.digel.b) * 0.87) / st.op.digel.b);
        });
        if (this.pegT > 0) {
            this.pegT -= dt;
            this.el.valg.classList.toggle("peg", this.pegT > 0);
        }
    };

    /* ----- Musen --------------------------------------------------------------------- */
    P.hvad = function (pt) {
        var lay = this.lay;
        if (!lay || !pt) return null;
        for (var i = 0; i < 2; i++) {
            var st = lay.st[i];
            if (pt.x >= st.x0 && pt.x <= st.x1 && pt.y >= st.op.top - 40 && pt.y <= lay.bordY) return "g" + (i + 1);
        }
        var g = lay.graf;
        if (pt.x >= g.x && pt.x <= g.x + g.b && pt.y >= g.y && pt.y <= g.y + g.h) return "graf";
        return null;
    };

    P.overScene = function (pt) {
        this.over = this.hvad(pt);
        return null;
    };

    P.nedScene = function (pt) {
        var u = this.hvad(pt);
        if (this.valgt === null && (u === "g1" || u === "g2")) {
            this.kortBesked("Gæt først: vælg et af svarene i kortet.");
            this.pegT = 1.6;
        } else if (u === "g1") this.kortBesked(D.FEJL_1);
        else if (u === "g2") this.kortBesked(this.opg.tekst);
        else if (u === "graf") this.kortBesked("Grafen viser begge gruppers vejninger og de tre hypotesers forventede masse for 5,10 g natron.");
        return false;
    };

    /* ----- Layout -------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var baand = this.k.layout(W, H);
        var Hs = baand.y;
        var lay = { W: W, H: H, Hs: Hs };
        lay.bordY = Math.round(Hs - NK.klamp(Hs * 0.13, 50, 76));
        var gh = Math.round(NK.klamp(Hs * 0.38, 120, 230));
        lay.graf = { x: 16, y: 12, b: W - 32, h: gh };
        var th = Math.round(NK.klamp(Math.min((lay.bordY - gh - 50) * 0.8, W * 0.16), 80, 180));
        var tb = th * NK.Sprites.MAAL.trefod.b / NK.Sprites.MAAL.trefod.h;
        var vb = NK.klamp(tb * 1.05, 90, 190);
        var M = NK.Sprites.MAAL.vaegt;
        lay.st = [0.25, 0.75].map(function (fx) {
            var cx = W * fx, gap = NK.klamp(W * 0.02, 8, 26);
            var samlet = tb + gap + vb;
            var x0 = cx - samlet / 2;
            var op = Tg.opstilling(x0 + tb / 2, lay.bordY, th);
            var vx = x0 + tb + gap + vb / 2;
            return { x: cx, x0: x0 - 6, x1: x0 + samlet + 6, op: op,
                     vaegt: { x: vx, b: vb, skaal: lay.bordY - (M.bund - M.skaalY) * vb / M.b } };
        });
        this.lay = lay;
        var a = lay.st[0], b = lay.st[1];
        this.saetAnker("g1", a.x0, a.op.top - 30, a.x1 - a.x0, lay.bordY - a.op.top + 90);
        this.saetAnker("g2", b.x0, b.op.top - 30, b.x1 - b.x0, lay.bordY - b.op.top + 90);
        this.saetAnker("graf", lay.graf.x, lay.graf.y, lay.graf.b, lay.graf.h);
        this.saetAnker("laerer", 0, baand.y, W * 0.45, baand.h);
    };

    /* ----- Tegn --------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, o = this.opg, mig = this, t = this.tid;
        if (!lay) return;
        this.L.ryd();
        Tg.rum(ctx, lay.W, lay.Hs, lay.bordY + 12);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.Hs);
        var px = NK.klamp(lay.W / 70, 12, 15);

        /* Grafen med begge grupper */
        var xMax = 20;
        this.G.forEach(function (g) { xMax = Math.max(xMax, Math.ceil((g.f.d.opv + 1) / 5) * 5); });
        Tg.graf(ctx, lay.graf, { serier: this.G.map(function (g, i) { return { punkter: g.f.vejninger, farve: FARVE[i] }; }),
            linjer: K.forventet(D.FEJL_M), yMax: 6, xMax: xMax, titel: "Gruppe 1 (blå) og gruppe 2 (lilla)" });

        this.G.forEach(function (g, i) {
            var st = lay.st[i], op = st.op, d = g.f.d;
            Tg.trefodBag(ctx, op);
            Tg.braender(ctx, op, false);
            Tg.flamme(ctx, op.braender.x, op.braender.mund, op.braender.k * 0.95, mig.koerer || g.f.fase ? d.flamme : "", t);
            /* Vaegten viser foerst noget, naar diglen staar paa den */
            var vis = g.pos > 0.95 ? d.visning() : null;
            Tg.vaegt(ctx, st.vaegt.x, lay.bordY, st.vaegt.b, vis === null ? "0,00 g" : K.g2(vis) + " g", { roed: vis !== null && !d.stille(), lys: mig.over === "g" + (i + 1) ? 1 : 0 });
            /* Diglen mellem trefoden og vaegten */
            var a = op.digel, bx = st.vaegt.x, bb = st.vaegt.skaal + 1;
            var u = NK.blod(g.pos);
            var x = NK.lerp(a.x, bx, u), y = NK.lerp(a.bund, bb, u) - Math.sin(u * Math.PI) * op.th * 0.3;
            var rand = Tg.digel(ctx, x, y, a.b, { fyld: NK.klamp(d.masse() / D.FEJL_M, 0, 1), reageret: d.reageret(), bobler: mig.koerer ? d.gas : 0,
                varme: NK.klamp((d.T - 150) / 250, 0, 1), t: t });
            if (g.pos > 0.02 && g.pos < 0.98) Tg.tang(ctx, rand.x + rand.rx * 0.96, rand.y + 3, NK.klamp(a.b * 1.9, 80, 170), -0.12);
            Tg.flimmer(ctx, rand.x, rand.y - 4, a.b, NK.klamp((d.T - 80) / 200, 0, 1), t);
            g.damp.tegn(ctx, rand.x, rand.y - 2, a.b);
            g.korn.tegn(ctx, rand.x, rand.y, a.b);
            Tg.trefodFor(ctx, op);
            /* Nummeret og teksten under */
            Tg.maerke(ctx, st.x0 + 14, op.top - 8, NK.klamp(op.th * 0.09, 11, 16), String(i + 1), FARVE[i]);
            Tg.bordEtiket(ctx, i ? "Gruppe 2: " + o.kort : "Gruppe 1: gør det rigtigt", st.x, lay.bordY + 26, px, i ? "#d9c6f5" : "#b8dcf5");
            var sidste = g.f.vejninger[g.f.vejninger.length - 1];
            var linje = "opvarmet " + K.min(d.opv) + " min" + (g.f.vejninger.length > 1 ? ", vejet " + K.g2(sidste.m) + " g" : "");
            if (g.f.faerdig) linje = "slutmasse " + K.g2(g.f.slut) + " g efter " + K.min(d.opv) + " min";
            if (d.opv > 0 || g.f.faerdig) NK.tekst(ctx, linje, st.x, lay.bordY + 26 + px + 8, { font: Tg.font("600", px), justering: "center", linje: "middle", farve: "#aab3bf" });
        });
        this.k.tegn(ctx);
    };

    NK.SimFejl = SimFejl;
}());
