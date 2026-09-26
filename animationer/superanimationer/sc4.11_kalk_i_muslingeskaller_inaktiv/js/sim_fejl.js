/* =====================================================================
   sim_fejl.js - fane 3: fejlkilderne

   To grupper laver forsoeget side om side. Gruppe A goer som i
   vejledningen, gruppe B goer én ting anderledes: mere syre, fugtigt
   pulver, stopper for tidligt, alt paa én gang, spilder pulver eller
   knuser ikke skallerne. Eleven gaetter foerst, om B's kalkindhold
   bliver hoejere, lavere eller det samme. Saa koerer begge forsoeg i
   den samme model som paa fane 1, og tabellen i panelet viser, hvad
   de to grupper faar. Forklaringen gaelder det gaet, eleven valgte.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    var TEMPO = 4;          /* forsoegets sekunder pr. sekund, mens A koerer */
    var TEMPO_SLUT = 14;    /* naar kun B mangler */
    var MIN_PR_S = 0.1;     /* minutter paa uret pr. sekund i modellen */

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
        this.A = nytForloeb({}, 1);
        this.B = nytForloeb(this.opg.B, 2);
        this.koerer = false;
    };

    function nytForloeb(B, nr) {
        return { f: new K.Forloeb(B), bobler: new NK.Bobler(nr * 5), pust: new NK.Pust(nr * 7), draaber: new NK.Draaber(nr * 3),
                 sidstSprojt: 0, akku: 0, fald: [], skum: 0, baad: 1.00, vip: 0 };
    }

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
        if (this.koerer) return "Begge grupper laver forsøget. Hold øje med vægtene.";
        return "";
    };

    P.slutLinje = function () { return this.forklaring; };

    P.afslut = function () {
        var o = this.opg;
        this.koerer = false;
        this.auto = null;
        this.res = { A: this.A.f.resultat(), B: this.B.f.resultat() };
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

    /* Tabellen i panelet: A og B */
    P.visTabel = function () {
        var r = this.res;
        function saet(id, a, b) {
            NK.saetTekst("fejl-t-" + id + "-a", r ? a : "");
            NK.saetTekst("fejl-t-" + id + "-b", r ? b : "");
        }
        var A = r && r.A, B = r && r.B;
        saet("mf", A && K.g2(A.mf) + " g", B && K.g2(B.mf) + " g");
        saet("me", A && K.g2(A.me) + " g", B && K.g2(B.me) + " g");
        saet("dm", A && K.g2(A.dm) + " g", B && K.g2(B.dm) + " g");
        saet("pct", A && K.pct1(A.pct) + " %", B && K.pct1(B.pct) + " %");
        var tabel = NK.el("fejl-tabel");
        if (tabel && B && A) {
            tabel.classList.toggle("hoejere", B.pct > A.pct + 0.5);
            tabel.classList.toggle("lavere", B.pct < A.pct - 0.5);
        } else if (tabel) { tabel.classList.remove("hoejere"); tabel.classList.remove("lavere"); }
    };

    /* ----- Opdater ------------------------------------------------------------------ */
    P.opdaterScene = function (dt) {
        var lay = this.lay, mig = this;
        if (!lay) return;
        if (this.koerer) {
            var sp = this.A.f.faerdig ? TEMPO_SLUT : TEMPO;
            [this.A, this.B].forEach(function (s, i) {
                if (s.f.faerdig) return;
                var nye = s.f.opdater(dt * sp);
                var g = lay.st[i].kolbe;
                nye.forEach(function (p) {
                    s.baad = Math.max(0, s.baad - p.m - p.bord);
                    s.vip = 1;
                    if (p.m > 0) s.fald.push({ x: g.mund.x + 10 * g.k, y: g.mund.y - 50 * g.k, vy: 0, m: p.m, slut: g.yV(s.f.kolbe.syreV) });
                    if (p.bord > 0) s.fald.push({ x: lay.st[i].x + lay.st[i].b * 0.62, y: g.mund.y - 40 * g.k, vy: 0, m: p.bord, slut: lay.bordY, bord: true });
                });
            });
            if (this.A.f.faerdig && this.B.f.faerdig) this.afslut();
        }
        [this.A, this.B].forEach(function (s, i) {
            var g = lay.st[i].kolbe, k = s.f.kolbe;
            var ds = k.sprojt - s.sidstSprojt;
            s.sidstSprojt = k.sprojt;
            if (ds > 0) {
                s.akku += ds * 1500;
                var n = Math.floor(s.akku);
                if (n > 0) { s.akku -= n; s.draaber.sprojt(n); }
            }
            s.bobler.opdater(dt, mig.koerer ? k.rate : 0);
            s.pust.opdater(dt, mig.koerer ? k.rate : 0);
            s.draaber.opdater(dt, lay.bordY - g.mund.y);
            s.skum = NK.mod(s.skum, NK.klamp((k.rate - 0.03) / 0.08, 0, 1), 3, dt);
            s.vip = Math.max(0, s.vip - dt * 2);
            s.fald.forEach(function (p) { p.vy += 1300 * dt; p.y += p.vy * dt; if (p.y >= p.slut) p.nede = true; });
            s.fald = s.fald.filter(function (p) { return !p.nede; });
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
            if (pt.x >= st.x - st.b / 2 && pt.x <= st.x + st.b / 2 && pt.y >= st.kolbe.y0 - 40 && pt.y <= lay.bordY) return i ? "b" : "a";
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
        else if (u === "b") this.kortBesked(this.opg.tekst);
        return false;
    };

    /* ----- Layout -------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var baand = this.k.layout(W, H);
        var Hs = baand.y;
        var lay = { W: W, H: H, Hs: Hs };
        lay.bordY = Math.round(Hs - NK.klamp(Hs * 0.16, 64, 92));
        var vb = NK.klamp(W * 0.27, 140, 240), vh = Tg.vaegtHoejde(vb);
        var kh = NK.klamp(Math.min(lay.bordY - vh - 120, vb * 1.15), 100, 260);
        var M = NK.Sprites.MAAL.vaegt;
        var skaalY = lay.bordY - (M.bund - M.skaalY) * vb / M.b;
        lay.st = [0.28, 0.72].map(function (fx) {
            var x = W * fx;
            return { x: x, b: vb, h: vh, kolbe: Tg.kolbeGeo(x, skaalY + 3, kh) };
        });
        this.lay = lay;
        var a = lay.st[0], b = lay.st[1];
        this.saetAnker("a", a.x - vb / 2 - 10, a.kolbe.y0 - 60, vb + 20, lay.bordY - a.kolbe.y0 + 100);
        this.saetAnker("b", b.x - vb / 2 - 10, b.kolbe.y0 - 60, vb + 20, lay.bordY - b.kolbe.y0 + 100);
        this.saetAnker("laerer", 0, baand.y, W * 0.45, baand.h);
    };

    /* ----- Tegn --------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, o = this.opg, mig = this;
        if (!lay) return;
        this.L.ryd();
        Tg.rum(ctx, lay.W, lay.Hs, lay.bordY + 12);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.Hs);
        var px = NK.klamp(lay.st[0].b * 0.07, 13, 16);
        [this.A, this.B].forEach(function (s, i) {
            var st = lay.st[i], g = st.kolbe, f = s.f, k = f.kolbe;
            var navn = i ? "B" : "A";
            var v = Tg.vaegt(ctx, st.x, lay.bordY, st.b, K.g2(k.visning()) + " g", { lys: mig.over === (i ? "b" : "a") ? 1 : 0 });
            s.pust.tegn(ctx, g.mund.x, g.mund.y - 6, g.k);
            Tg.kolbe(ctx, g, { V: k.syreV, kalk: k.kalk, rest: k.ind * (1 - D.SKAL.andel), grov: !!f.B.grov,
                skum: s.skum, uklar: NK.klamp(k.kalk / 0.25, 0, 1), bobler: s.bobler });
            s.draaber.tegn(ctx, g.mund.x, g.mund.y, lay.bordY - g.mund.y);
            /* Vejebaaden over kolben, der tipper, naar en portion kommer i */
            if (s.baad > 0.001 || s.vip > 0) {
                var bb = 78 * g.k, bx = g.mund.x + 46 * g.k, by = g.mund.y - 44 * g.k;
                ctx.save();
                ctx.translate(bx, by);
                ctx.rotate(-0.5 * s.vip);
                Tg.bunke(ctx, 0, 0, bb, Tg.PULVER, s.baad / 1.00, NK.klamp(bb * 0.24, 6, 20), i + 7);
                ctx.restore();
            }
            /* Det, der falder: ned i kolben eller paa bordet */
            s.fald.forEach(function (p) {
                if (f.B.grov && !p.bord) Tg.stykker(ctx, p.x, p.y, 16 * g.k, 5, 2);
                else Tg.pulver(ctx, p.x, p.y, 16 * g.k, 7 * g.k, Tg.PULVER, 2);
            });
            if (f.bord > 0) Tg.pulver(ctx, st.x + st.b * 0.62, lay.bordY + 1, 30, 7, Tg.PULVER, 6);
            /* Bogstavet og teksten under */
            Tg.maerke(ctx, st.x - st.b * 0.36, g.y0 + 14, NK.klamp(st.b * 0.075, 13, 18), navn, i ? "#9b6bd6" : "#3d9ee0");
            Tg.etiket(ctx, i ? o.kort : "som i vejledningen", st.x, lay.bordY + 24, px, i ? "#d9c6f5" : "#b8dcf5");
            /* Det, gruppen skrev som m(efter), og uret */
            if (f.noteret !== null) {
                var tekst = "m(efter) = " + K.g2(f.noteret) + " g";
                NK.tekst(ctx, tekst, st.x, lay.bordY + 24 + px + 8, { font: Tg.font("700", px), justering: "center", linje: "middle",
                    farve: f.B.stop ? "#f0918a" : "#f5dd8a" });
                if (f.B.stop && !f.faerdig) {
                    NK.tekst(ctx, "aflæst her", v.disp.x + v.disp.b / 2, v.top - 8, { font: Tg.font("700", px), justering: "center", farve: "#f0918a" });
                }
            }
            var tid = Math.max(1, Math.round((f.tidNoteret !== null ? f.tidNoteret : f.t) * MIN_PR_S));
            if (f.t > 0) NK.tekst(ctx, (f.noteret !== null ? "aflæst efter " : "tid: ") + tid + " min", st.x, lay.bordY + 24 + 2 * (px + 8),
                { font: Tg.font("600", px), justering: "center", linje: "middle", farve: "#aab3bf" });
        });
        this.k.tegn(ctx);
    };

    NK.SimFejl = SimFejl;
}());
