/* =====================================================================
   sim_fejl.js - fane 3: fejlkilderne

   To grupper laver forsoeget side om side med 5,10 g natron. Gruppe 1
   goer det rigtigt: varmer i 5 minutter og vejer diglen, naar den er
   koelet af. Gruppe 2 goer én ting anderledes: varmer kun 2 minutter,
   vejer diglen varm, hoej flamme fra start, fugtig natron, varmer i 10
   minutter eller tager soda. Eleven gaetter foerst, om gruppe 2's digel
   til sidst vejer mere, mindre eller det samme. Saa koerer begge forsoeg
   i den samme model som paa fane 1, roligt: diglerne staar paa vaegtene,
   flyttes over paa trefoedderne og varmes, og et skilt over hver gruppe
   viser uret og til sidst slutmassen og tabet. Ingen graf (brugerens
   oenske 29. sept. 2026: der skete for meget).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var T = NK.Tjek;
    var Tg = NK.Tegn;

    var FOER_SEK = 1.6;     /* sekunder, diglerne staar paa vaegtene foer start */
    var SEK_PR_MIN = 1.5;   /* sekunder pr. minut paa uret, mens der varmes */
    var KOEL_FART = 2.5;    /* modellens minutter pr. sekund, mens diglen koeler af */
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
        this.startT = 0;
        this.slutT = 0;
    };

    function nyGruppe(B, nr) {
        return { f: new K.Forloeb(B), damp: new NK.Damp(nr * 5), korn: new NK.Korn(nr * 3), akku: 0, pos: 1 };
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
            (this.faerdig ? "" : '<p class="opgave-spm skarp">' + NK.html(D.FEJL_SPM) + "</p>");
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
        }
        this.start();
    };

    P.start = function () {
        this.koerer = true;
        this.auto = true;
        this.res = null;
        this.startT = 0;
        this.slutT = 0;
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
        if (this.koerer) return "Begge grupper laver forsøget. Hold øje med uret og vægtene.";
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

    /* ----- Opdater ------------------------------------------------------------------
       Diglerne staar foerst paa vaegtene. Saa flyttes de over paa
       trefoedderne; modellen koerer foerst, naar diglen er fremme. Tiden
       gaar dobbelt saa hurtigt for den gruppe, der varmer laengst, naar
       den anden er faerdig. */
    P.opdaterScene = function (dt) {
        var lay = this.lay, mig = this;
        if (!lay) return;
        if (this.koerer) {
            this.startT += dt;
            if (this.startT >= FOER_SEK) {
                this.G.forEach(function (g, i) {
                    var f = g.f;
                    f.start();
                    var maal = f.d.sted === "vaegt" ? 1 : 0;
                    if (Math.abs(g.pos - maal) > 0.05 || f.faerdig) return;
                    var fart = f.fase === "varm" ? D.FEJL_SKALA / SEK_PR_MIN * (mig.G[1 - i].f.faerdig ? 2 : 1) : KOEL_FART;
                    f.opdater(dt * fart);
                    if (f.d.sprojtRate > 0) {
                        g.akku += f.d.sprojtRate * dt * fart * 25;
                        var n = Math.floor(g.akku);
                        if (n > 0) { g.akku -= n; g.korn.sprojt(Math.min(n, 8)); }
                    }
                });
            }
            if (this.G[0].f.faerdig && this.G[1].f.faerdig) {
                this.slutT += dt;
                if (this.slutT >= 0.6) this.afslut();
            }
        }
        this.G.forEach(function (g, i) {
            var d = g.f.d;
            var maal = d.sted === "vaegt" ? 1 : 0;
            g.pos = NK.mod(g.pos, maal, 6, dt);
            if (Math.abs(g.pos - maal) < 0.01) g.pos = maal;
            g.damp.opdater(dt, mig.koerer && g.f.fase === "varm" ? d.gas / 2 : 0);
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
            if (pt.x >= st.x0 && pt.x <= st.x1 && pt.y >= lay.skiltY && pt.y <= lay.bordY) return "g" + (i + 1);
        }
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
        return false;
    };

    /* ----- Layout --------------------------------------------------------------------
       Skiltene oeverst, opstillingerne under dem. Uden grafen er der plads
       til stoerre opstillinger. */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var Hs = H;
        var lay = { W: W, H: H, Hs: Hs };
        lay.bordY = Math.round(Hs - NK.klamp(Hs * 0.08, 26, 48));
        lay.px = NK.klamp(Math.min(W / 58, Hs / 30), 12, 17);
        lay.skiltY = 14;
        lay.skiltH = Math.round(lay.px * 5.4);
        /* Trefoden saa stor, som hoejden og den halve bredde tillader */
        var gap = NK.klamp(W * 0.02, 8, 26), MT = NK.Sprites.MAAL.trefod;
        var plads = lay.bordY - lay.skiltY - lay.skiltH - 24;
        var thB = (W / 2 - 30 - gap) / 2.05 * MT.h / MT.b;
        var th = Math.round(NK.klamp(Math.min(plads / 1.45, thB), 80, 260));
        var tb = th * MT.b / MT.h;
        var vb = NK.klamp(tb * 1.05, 90, 230);
        var M = NK.Sprites.MAAL.vaegt;
        lay.st = [0.25, 0.75].map(function (fx) {
            var cx = W * fx;
            var samlet = tb + gap + vb;
            var x0 = cx - samlet / 2;
            var op = Tg.opstilling(x0 + tb / 2, lay.bordY, th);
            var vx = x0 + tb + gap + vb / 2;
            return { x: cx, x0: x0 - 6, x1: x0 + samlet + 6, op: op,
                     vaegt: { x: vx, b: vb, skaal: lay.bordY - (M.bund - M.skaalY) * vb / M.b } };
        });
        /* Skiltet er lige saa bredt som opstillingen, men mindst 240 px, og
           haenger over den med plads til diglen, naar den flyttes */
        lay.skiltY = Math.round(Math.max(14, lay.st[0].op.top - th * 0.5 - lay.skiltH));
        lay.st.forEach(function (st) {
            var b = Math.min(W / 2 - 16, Math.max(240, st.x1 - st.x0));
            st.skilt = { x: st.x - b / 2, y: lay.skiltY, b: b, h: lay.skiltH };
        });
        this.lay = lay;
        var a = lay.st[0], b = lay.st[1];
        this.saetAnker("g1", a.skilt.x, a.skilt.y, a.skilt.b, lay.bordY - a.skilt.y + 10);
        this.saetAnker("g2", b.skilt.x, b.skilt.y, b.skilt.b, lay.bordY - b.skilt.y + 10);
    };

    /* ----- Tegn --------------------------------------------------------------------- */
    /* Skiltet over en gruppe: navnet, uret med en bjaelke og til sidst
       slutmassen og tabet */
    P.skilt = function (ctx, st, g, i, maxTid) {
        var r = st.skilt, px = this.lay.px, f = g.f, o = this.opg;
        ctx.save();
        ctx.fillStyle = "rgba(12, 13, 18, 0.72)";
        NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 9);
        ctx.fill();
        ctx.strokeStyle = this.over === "g" + (i + 1) ? "rgba(242, 197, 61, 0.7)" : Tg.rgba(FARVE[i], 0.55);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
        var x = r.x + px * 0.8, b = r.b - px * 1.6, y = r.y + px * 1.05;
        Tg.maerke(ctx, x + px * 0.55, y, px * 0.62, String(i + 1), FARVE[i]);
        var navn = i ? "Gruppe 2: " + o.kort : "Gruppe 1: gør det rigtigt";
        var np = NK.passendeSkrift(ctx, navn, b - px * 1.6, px, 11, "700");
        NK.tekst(ctx, navn, x + px * 1.5, y + 1, { font: Tg.font("700", np), linje: "middle", farve: i ? "#d9c6f5" : "#b8dcf5" });
        /* Uret og bjaelken: hele bjaelken er den laengste opvarmning */
        y += px * 1.75;
        var ur = Math.min(f.ur(), f.tid);
        var urTekst = "Opvarmet " + K.min(ur) + " min";
        NK.tekst(ctx, urTekst, x, y, { font: Tg.font("700", px), linje: "middle", farve: f.fase === "varm" ? "#ffb38a" : "#dfe6ee" });
        ctx.font = Tg.font("700", px);
        var bx = x + ctx.measureText("Opvarmet 10 min").width + px * 0.8, bb = x + b - bx, bh = Math.max(6, px * 0.5);
        if (bb > 30) {
            ctx.save();
            ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
            NK.rundtRekt(ctx, bx, y - bh / 2, bb, bh, bh / 2);
            ctx.fill();
            ctx.fillStyle = FARVE[i];
            if (ur > 0) { NK.rundtRekt(ctx, bx, y - bh / 2, Math.max(bh, bb * ur / maxTid), bh, bh / 2); ctx.fill(); }
            /* Et streg pr. minut */
            ctx.fillStyle = "rgba(12, 13, 18, 0.55)";
            for (var m = 1; m < maxTid; m++) ctx.fillRect(bx + bb * m / maxTid - 0.5, y - bh / 2, 1, bh);
            ctx.restore();
        }
        /* Slutmassen og tabet, naar diglen er vejet */
        y += px * 1.7;
        if (f.faerdig) {
            var s = "Slutmasse " + K.g2(f.slut) + " g", tab = "tabt " + K.g2(K.r2(D.FEJL_M - f.slut)) + " g";
            NK.tekst(ctx, s, x, y, { font: Tg.font("800", px * 1.12), linje: "middle", farve: "#ffffff" });
            NK.tekst(ctx, tab, x + b, y, { font: Tg.font("700", px), linje: "middle", justering: "right", farve: "#c8ced6" });
        } else {
            var hvad = f.fase === "foer" ? "Før: " + K.g2(D.FEJL_M) + " g" : (f.fase === "varm" ? "Varmer" : "Køler af på vægten");
            NK.tekst(ctx, hvad, x, y, { font: Tg.font("600", px), linje: "middle", farve: "#aab3bf" });
        }
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, mig = this, t = this.tid;
        if (!lay) return;
        this.L.ryd();
        Tg.rum(ctx, lay.W, lay.Hs, lay.bordY + 12);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.Hs);
        var maxTid = Math.max(this.G[0].f.tid, this.G[1].f.tid);

        this.G.forEach(function (g, i) {
            var st = lay.st[i], op = st.op, d = g.f.d;
            var framme = g.pos < 0.05;
            Tg.trefodBag(ctx, op);
            Tg.braender(ctx, op, false);
            Tg.flamme(ctx, op.braender.x, op.braender.mund, op.braender.k * 0.95, mig.koerer && g.f.fase === "varm" && framme ? d.flamme : "", t);
            /* Vaegten viser kun noget, naar diglen staar paa den */
            var vis = g.pos > 0.95 ? d.visning() : null;
            Tg.vaegt(ctx, st.vaegt.x, lay.bordY, st.vaegt.b, vis === null ? "0,00 g" : K.g2(vis) + " g",
                { roed: vis !== null && !d.stille(), lys: mig.over === "g" + (i + 1) ? 1 : 0 });
            /* Diglen mellem trefoden og vaegten */
            var a = op.digel, bx = st.vaegt.x, bb = st.vaegt.skaal + 1;
            var u = NK.blod(g.pos);
            var x = NK.lerp(a.x, bx, u), y = NK.lerp(a.bund, bb, u) - Math.sin(u * Math.PI) * op.th * 0.3;
            var rand = Tg.digel(ctx, x, y, a.b, { fyld: NK.klamp(d.masse() / D.FEJL_M, 0, 1), reageret: d.reageret(),
                bobler: g.f.fase === "varm" ? d.gas : 0, varme: NK.klamp((d.T - 150) / 250, 0, 1), t: t });
            if (g.pos > 0.02 && g.pos < 0.98) Tg.tang(ctx, rand.x + rand.rx * 0.96, rand.y + 3, NK.klamp(a.b * 1.9, 80, 170), -0.12);
            Tg.flimmer(ctx, rand.x, rand.y - 4, a.b, NK.klamp((d.T - 80) / 200, 0, 1), t);
            g.damp.tegn(ctx, rand.x, rand.y - 2, a.b);
            g.korn.tegn(ctx, rand.x, rand.y, a.b);
            Tg.trefodFor(ctx, op);
            mig.skilt(ctx, st, g, i, maxTid);
        });
    };

    NK.SimFejl = SimFejl;
}());
