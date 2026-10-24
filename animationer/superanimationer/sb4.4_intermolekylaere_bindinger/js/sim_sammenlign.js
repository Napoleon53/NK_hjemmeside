/* =====================================================================
   sim_sammenlign.js - fane 2: sammenlign to stoffer

   Brugerens opgave med tabellerne som forsoeg: to stoffer i hver sit
   reagensglas i hver sit kammer, med hver sin lup over. Eleven gaetter
   paa kortet, hvilket der koger ved den hoejeste temperatur, finder
   saa kogepunktet for hvert stof med termometeret og sender det ind
   (Indsend svar: termometeret loeser intet af sig selv), og svarer til
   sidst paa hvorfor. De forkerte svar er de fejl, elever laver, og hver
   har sin forklaring.

   Tre par: OH-gruppen (propan og ethanol), kaeden (ethanol og
   butan-1-ol) og to OH-grupper (ethanol og ethan-1,2-diol). Bagefter
   ledes eleven videre til Rangér. Kogepunkterne kommer paa grafen i
   panelet, kogepunkt mod molarmasse.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;

    var FARVE = { a: "#64b5f6", b: "#ffb74d" };
    var BALLON = { a: "#4f8fd6", b: "#e3893a" };

    function SimSammenlign() {
        var mig = this;
        this.termo = new NK.Termostat(D.SAMMEN.omr, 20);
        this.maalt = {};
        this.grafL = new NK.Laerred(NK.el("s-graf"));
        this.visTabel = false;
        this.tabelKnap = NK.el("s-tabel");
        this.tabelKnap.addEventListener("click", function () {
            mig.visTabel = !mig.visTabel;
            mig.tabelKnap.textContent = mig.visTabel ? "Skjul tabellen" : "Vis hele tabellen";
            mig.grafNoegle = "";
        });
        this.startFane(D.PAR, [{ id: "alle", titel: "", lodret: true }]);
        var mig2 = this;
        D.PAR.forEach(function (o, i) {
            if (mig2.status[i].loest) { mig2.maalt[o.a] = true; mig2.maalt[o.b] = true; }
        });
        this.nr = this.opgaver.length - 1;
        var start = this.naesteUloeste();
        this.vaelg(start >= 0 ? start : 0);
    }

    var P = SimSammenlign.prototype;
    NK.Fane.paa(P, { navn: "s", naesteFane: "fane-r", naesteNavn: "Rangér" });

    P.chipTekst = function (o, i) {
        return '<span class="oc-nr">' + (i + 1) + "</span>" + NK.html(o.navn);
    };

    /* ----- Opgaven ----------------------------------------------------------------
       Et par har fire dele: gaettet, kogepunktet for a, kogepunktet for b og
       spoergsmaalet om hvorfor. Et kogepunkt, eleven har fundet i et andet
       par, skal ikke findes igen. Naar begge kogepunkter er kendt, staar de
       paa et groent kort med dommen over gaettet, foer spoergsmaalet kommer. */
    P.lavOpgave = function (i) {
        var o = this.opgaver[i];
        var sa = D.STOF[o.a], sb = D.STOF[o.b];
        this.opg = { o: o, fase: "gaet", gaet: null, maaler: null, forkert: {} };
        this.st = { a: sa, b: sb };
        this.Pr = {
            a: new NK.Proeve(sa, D.antalILup(sa), D.SAMMEN.Rm, 11 + i),
            b: new NK.Proeve(sb, D.antalILup(sb), D.SAMMEN.Rm, 23 + i)
        };
        this.Pr.a.nulstil(o.start);
        this.Pr.b.nulstil(o.start);
        this.termo.saet(o.start);
        this.roertTermo = false;
        this.valgt = null;
        this.valgtT = 0;
        this.grafNoegle = "";
    };

    P.hoejest = function () { return this.st.a.kp > this.st.b.kp ? "a" : "b"; };

    P.kendt = function (k) { return !!this.maalt[this.st[k].id]; };

    P.delNu = function () {
        var g = this.opg, o = g.o, sa = this.st.a, sb = this.st.b;
        if (g.fase === "gaet") {
            return { slags: "gaet", intro: o.intro, tekst: "Hvilket stof koger ved den højeste temperatur?",
                svar: [{ t: D.Stort(sa.navn), prik: FARVE.a }, { t: D.Stort(sb.navn), prik: FARVE.b }] };
        }
        if (g.fase === "maal") {
            var n = this.st[g.maaler].navn;
            return { slags: "opgave", chip: "Mål", tekst: "Find kogepunktet for " + n + ": stil termometeret på den temperatur, hvor " + n + " begynder at koge.",
                ekstra: '<p class="sk-gaet">Dit gæt: <b>' + NK.html(D.Stort(this.st[g.gaet].navn)) + " koger ved den højeste temperatur.</b></p>" };
        }
        return { slags: "spm", tekst: o.spm, svar: o.svar, forkert: g.forkert };
    };

    P.sceneLinje = function () {
        var g = this.opg;
        if (g.fase === "maal" && this.roertTermo) return "Stil termometeret på kogepunktet for " + this.st[g.maaler].navn + ", og tryk Indsend svar.";
        return "";
    };

    P.hintTrin = function () {
        var g = this.opg;
        if (g.fase === "maal") return D.maalHint(this.st[g.maaler]);
        return g.o.hint;
    };

    /* Gaettet: videre til det foerste kogepunkt, eleven ikke kender */
    P.gaetValg = function (j) {
        var g = this.opg;
        g.gaet = j === 0 ? "a" : "b";
        this.naesteMaal();
    };

    P.naesteMaal = function () {
        var g = this.opg;
        this.roertTermo = false;
        var k = !this.kendt("a") ? "a" : (!this.kendt("b") ? "b" : null);
        if (k) {
            g.fase = "maal";
            g.maaler = k;
            this.nyDel();
            this.layout();
            return;
        }
        /* Begge kendt: dommen over gaettet og kogepunkterne */
        g.fase = "kendt";
        g.maaler = null;
        var h = this.hoejest(), l = h === "a" ? "b" : "a";
        var t = D.Stort(this.st[l].navn) + " koger ved " + D.kpTekst(this.st[l]) + ", og " + this.st[h].navn + " koger ved " + D.kpTekst(this.st[h]) + ".";
        var holdt = g.gaet === h;
        this.mellemsvar("selv", (holdt ? "Dit gæt holdt. " : "Dit gæt holdt ikke. ") + t, holdt ? "Godt gættet ✓" : "Målt ✓", "Næste spørgsmål →");
        this.layout();
    };

    /* Naeste paa det groenne kort: spoergsmaalet om hvorfor */
    P.videre = function () {
        this.opg.fase = "spm";
        this.nyDel();
        this.layout();
    };

    P.kanIndsende = function () { return this.opg.fase === "maal" && !!this.roertTermo; };

    P.indsendTekst = function () { return this.opg.fase === "maal" ? this.indsendTemp() : ""; };

    P.indsend = function () {
        var g = this.opg;
        if (g.fase !== "maal") return;
        var k = g.maaler, st = this.st[k], T = this.Tnu();
        if (Math.abs(T - this.Pr[k].kp()) <= D.TOL) { this.fundetKp(k, false); return; }
        this.fejlLinje(D.tempFejl(st.navn, T, this.Pr[k]));
    };

    /* Et kogepunkt er fundet (eller vist med Vis svaret) */
    P.fundetKp = function (k, svar) {
        var st = this.st[k];
        this.maalt[st.id] = true;
        this.grafNoegle = "";
        var andet = k === "a" ? "b" : "a";
        if (!this.kendt(andet)) {
            this.naesteMaal();
            this.besked('<span class="b-maerke">' + (svar ? "Svaret" : "Rigtigt") + "</span> " +
                NK.html(D.Stort(st.navn) + " koger ved " + D.kpTekst(st) + "."), svar ? "gul" : "god");
            return;
        }
        this.naesteMaal();
    };

    P.spmLoest = function (d) {
        this.loest("selv", this.opg.o.loest, this.svarTekst(d));
    };

    P.visSvar = function () {
        var g = this.opg;
        if (g.fase === "maal") {
            var k = g.maaler;
            this.termo.animerTil(Math.round(this.Pr[k].kp()) + 2, 90);
            this.fundetKp(k, true);
            return;
        }
        if (g.fase === "spm") {
            var d = this.delNu();
            this.loest("svar", g.o.loest, this.svarTekst(d));
        }
    };

    /* ----- Scenen ------------------------------------------------------------------------ */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var baand = this.baand();
        var lay = { W: W, H: H, baand: baand, top: this.top() };
        var kant = NK.klamp(W * 0.016, 10, 18);
        lay.bordY = baand.y - NK.klamp(H * 0.035, 14, 26);
        lay.termo = Tg.termoMaal(W - kant - 50, lay.bordY - 4, lay.bordY - 4 - lay.top - 4, D.SAMMEN.omr);
        var x0 = kant, x1 = lay.termo.x - 78;
        var colB = (x1 - x0) / 2;
        /* Navnet og formlen over hver lup, saa luppen, og kammeret nederst.
           Kamrene er smaa, saa lupperne kan vaere store. */
        var etiket = 50;
        var top = lay.top + etiket;
        var r = Math.max(50, Math.min(colB / 2 - 14, (lay.bordY - top - 140) / 2));
        var kamH = lay.bordY - (top + 2 * r) - 12;
        var sk = NK.klamp(Math.min(kamH / 418, colB * 0.5 / 240), 0.2, 0.6);
        lay.kol = {};
        ["a", "b"].forEach(function (k, n) {
            var cx = x0 + colB * (n + 0.5);
            var K = Tg.kammerMaal(cx, lay.bordY, 300 * sk);
            var G = K.glas();
            lay.kol[k] = {
                kammer: K, glas: G,
                lup: { x: cx, y: top + r, r: r },
                zoomFra: { x: G.ind.x0 + 2, y: G.ind.bund - G.fuld * 0.55, b: G.ind.x1 - G.ind.x0 - 4, h: G.fuld * 0.4 }
            };
        });
        this.lay = lay;
        var A = lay.kol.a.lup, B = lay.kol.b.lup;
        this.saetAnker("lupper", A.x - r, A.y - r - 44, B.x + r - (A.x - r), 2 * r + 44);
        this.saetAnker("kamre", lay.kol.a.kammer.x, lay.kol.a.glas.top - 30 * sk, lay.kol.b.kammer.x + lay.kol.b.kammer.b - lay.kol.a.kammer.x, lay.bordY - lay.kol.a.glas.top + 30 * sk);
        this.saetAnker("termometer", lay.termo.venstre - 30, lay.termo.top, lay.termo.b + 74, lay.termo.h);
    };

    P.opdaterScene = function (dt) {
        var g = this.opg;
        if (!g) return;
        this.termo.opdater(dt);
        this.Pr.a.opdater(dt, this.termo.T);
        this.Pr.b.opdater(dt, this.termo.T);
        if (this.valgtT > 0) { this.valgtT -= dt; if (this.valgtT <= 0) this.valgt = null; }
    };

    P.efterOpgave = function () {
        this.grafNoegle = "";
        this.tabelKnap.hidden = this.antalLoest() < this.opgaver.length;
    };

    /* Kogepunktet staar ved et stof, naar eleven har fundet det, men ikke under gaettet */
    P.visKp = function (k) {
        return this.opg.fase !== "gaet" && this.kendt(k);
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, mig = this, g = this.opg;
        if (!lay || !g) return;
        Tg.rum(ctx, lay.W, lay.baand.y, lay.bordY + 10);
        Tg.bord(ctx, 0, lay.termo.x - 60, lay.bordY, lay.baand.y);
        var maaler = !this.faerdig && !this.venter && g.fase === "maal" ? g.maaler : null;
        ["a", "b"].forEach(function (k) {
            var c = lay.kol[k], st = mig.st[k], Pk = mig.Pr[k];
            /* Det stof, kortet spoerger om, har en gul ring om luppen og glasset */
            var lys = maaler === k ? 0.6 + 0.4 * Math.sin(mig.tid * 4) : 0;
            Tg.kammerMedGlas(ctx, c.kammer, mig.termo.T, Pk.makro(), mig.tid, { ballonFarve: BALLON[k], lys: lys });
            Tg.zoomTilLup(ctx, c.zoomFra, c.lup);
            Tg.lup(ctx, c.lup, Pk, {
                valgt: mig.valgt && mig.valgt.k === k ? mig.valgt.m : null, donorKant: true, tid: mig.tid, lys: lys
            });
            var under = NK.formel(st.formel) + "  ·  " + D.Mtekst(st) + (mig.visKp(k) ? "  ·  koger ved " + D.kpTekst(st) : "");
            Tg.etiket(ctx, c.lup.x, c.lup.y - c.lup.r - 30, D.Stort(st.navn), under, { farve: FARVE[k], px: 16 });
        });
        var maerker = [];
        ["a", "b"].forEach(function (k) {
            if (mig.visKp(k)) maerker.push({ t: mig.st[k].kp, tekst: D.kpTekst(mig.st[k]), farve: FARVE[k] });
        });
        /* To maerker taet paa hinanden skubbes fra hinanden */
        if (maerker.length === 2) {
            var dy = lay.termo.yFor(maerker[0].t) - lay.termo.yFor(maerker[1].t);
            if (Math.abs(dy) < 16) { var sk = (16 - Math.abs(dy)) / 2 * (dy < 0 ? -1 : 1); maerker[0].dy = sk; maerker[1].dy = -sk; }
        }
        Tg.termometer(ctx, lay.termo, this.termo.T, {
            trin: 20, store: 40, maerker: maerker, stue: true, tid: this.tid,
            haandtag: this.haandtagLys, traekker: this.termo.traekker,
            puls: !!maaler && !this.roertTermo
        });
        this.tegnSejr(ctx, lay.W, lay.baand.y);
        this.tegnGraf();
    };

    /* ----- Grafen i panelet: kogepunkt mod molarmasse -----------------------------------
       Brugeren 24. okt. 2026: "Goer grafen lidt mindre forvirrende" (navnene
       laa oven i hinanden, og "120 °C" svaevede for sig selv). Nu:
         * navnene placeres, saa de aldrig rammer hinanden eller et punkt
           (grafBokse husker pladserne, saa selvtesten kan tjekke det)
         * det par, eleven arbejder med, har navnene i samme blaa og orange
           som over lupperne og lidt stoerre punkter
         * forskellen vises kun for det par, eleven arbejder med, naar begge
           kogepunkter er fundet: en trappe fra det laveste punkt over til det
           hoejeste med teksten "120 °C højere" */
    P.tegnGraf = function () {
        var L = this.grafL, g = this.opg;
        var nyStr = L.tilpas();
        var parNu = g && g.fase !== "gaet" ? g.o : null;
        var noegle = Object.keys(this.maalt).sort().join(",") + "|" + this.visTabel + "|" + L.b + "x" + L.h + "|" +
            (parNu ? parNu.id + (this.visKp("a") ? "a" : "") + (this.visKp("b") ? "b" : "") : "");
        if (!nyStr && noegle === this.grafNoegle) return;
        this.grafNoegle = noegle;
        var ctx = L.ctx, W = L.b, H = L.h, mig = this;
        L.ryd();
        var v = 40, h = 12, o = 22, u = 42;
        var Mmin = 0, Mmax = 100, Tmin = -180, Tmax = 220;
        function X(M) { return v + (M - Mmin) / (Mmax - Mmin) * (W - v - h); }
        function Y(t) { return o + (Tmax - t) / (Tmax - Tmin) * (H - o - u); }
        ctx.save();
        ctx.font = Tg.font("600", 12);
        ctx.fillStyle = "#9aa3ae";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1;
        ctx.textBaseline = "middle";
        ctx.textAlign = "right";
        for (var t = -150; t <= 200; t += 50) {
            ctx.beginPath();
            ctx.moveTo(v, Math.round(Y(t)) + 0.5);
            ctx.lineTo(W - h, Math.round(Y(t)) + 0.5);
            ctx.stroke();
            if (t % 100 === 0) ctx.fillText(D.grader(t), v - 5, Y(t));
        }
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        for (var M = 0; M <= 100; M += 20) ctx.fillText(String(M), X(M), H - u + 4);
        ctx.fillText("molarmasse i g/mol", (v + W - h) / 2, H - 17);
        ctx.textAlign = "left";
        ctx.fillText("kogepunkt i °C", 4, 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        ctx.beginPath();
        ctx.moveTo(v, o);
        ctx.lineTo(v, H - u);
        ctx.lineTo(W - h, H - u);
        ctx.stroke();

        /* Hele tabellen som svage linjer */
        if (this.visTabel) {
            [[D.ALKANER, "rgba(176, 190, 197, 0.45)"], [D.ALKOHOLER, "rgba(240, 104, 90, 0.45)"]].forEach(function (s) {
                ctx.strokeStyle = s[1];
                ctx.fillStyle = s[1];
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                s[0].forEach(function (id, i) {
                    var st = D.STOF[id];
                    if (i) ctx.lineTo(X(st.M), Y(st.kp)); else ctx.moveTo(X(st.M), Y(st.kp));
                });
                ctx.stroke();
                s[0].forEach(function (id) {
                    var st = D.STOF[id];
                    ctx.beginPath();
                    ctx.arc(X(st.M), Y(st.kp), 2.5, 0, Math.PI * 2);
                    ctx.fill();
                });
            });
        }

        /* Pladserne, der er optaget: punkterne, trappen og navnene */
        var bokse = [];
        var omraade = { x0: v + 2, y0: o - 6, x1: W - 2, y1: H - u - 2 };
        function rammer(r) {
            for (var i = 0; i < bokse.length; i++) {
                var q = bokse[i];
                if (r.x < q.x + q.b && q.x < r.x + r.b && r.y < q.y + q.h && q.y < r.y + r.h) return true;
            }
            return false;
        }
        function inde(r) { return r.x >= omraade.x0 && r.x + r.b <= omraade.x1 && r.y >= omraade.y0 && r.y + r.h <= omraade.y1; }

        var ids = Object.keys(this.maalt);
        var farveNu = {};
        if (parNu) {
            if (this.maalt[parNu.a]) farveNu[parNu.a] = FARVE.a;
            if (this.maalt[parNu.b]) farveNu[parNu.b] = FARVE.b;
        }
        ids.forEach(function (id) {
            var st = D.STOF[id], r = farveNu[id] ? 6 : 5;
            bokse.push({ x: X(st.M) - r - 1, y: Y(st.kp) - r - 1, b: 2 * r + 2, h: 2 * r + 2, punkt: id });
        });

        /* Trappen for det aktuelle par: vandret fra det laveste punkt, lodret op
           til det hoejeste, og forskellen ved siden af den lodrette streg */
        if (parNu && this.visKp("a") && this.visKp("b")) {
            var lo = D.STOF[parNu.a], hi = D.STOF[parNu.b];
            if (lo.kp > hi.kp) { var tmp = lo; lo = hi; hi = tmp; }
            var xs = X(hi.M), y0 = Y(lo.kp), y1 = Y(hi.kp);
            ctx.strokeStyle = "rgba(242, 197, 61, 0.9)";
            ctx.lineWidth = 1.5;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(X(lo.M), y0);
            ctx.lineTo(xs, y0);
            ctx.lineTo(xs, y1 + 7);
            ctx.stroke();
            ctx.setLineDash([]);
            /* Pilespids op mod det hoejeste punkt */
            ctx.fillStyle = "#f2c53d";
            ctx.beginPath();
            ctx.moveTo(xs, y1 + 7);
            ctx.lineTo(xs - 4, y1 + 13);
            ctx.lineTo(xs + 4, y1 + 13);
            ctx.closePath();
            ctx.fill();
            bokse.push({ x: Math.min(X(lo.M), xs) - 2, y: y0 - 2, b: Math.abs(xs - X(lo.M)) + 4, h: 4 });
            bokse.push({ x: xs - 3, y: y1, b: 6, h: y0 - y1 });
            ctx.font = Tg.font("700", 12);
            var tekst = Math.round(hi.kp - lo.kp) + " °C højere", tb = ctx.measureText(tekst).width;
            /* Ved siden af den lodrette streg, helst midt paa den; ellers laengere
               op eller ned. Teksten er altid inde i grafen. */
            var ym = (y0 + y1) / 2 - 7, kand = [];
            [0, -12, 12, -24, 24, -36, 36].forEach(function (dy) {
                kand.push({ x: xs + 6, y: ym + dy }, { x: xs - 6 - tb, y: ym + dy });
            });
            var pl = null;
            kand.forEach(function (k) { var r = { x: k.x, y: k.y, b: tb, h: 14 }; if (!pl && inde(r) && !rammer(r)) pl = r; });
            if (!pl) {
                var x0 = Math.min(Math.max(xs - 6 - tb, omraade.x0), omraade.x1 - tb);
                pl = { x: x0, y: Math.max(omraade.y0, Math.min(ym, omraade.y1 - 14)), b: tb, h: 14 };
            }
            ctx.fillStyle = "#f2c53d";
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillText(tekst, pl.x, pl.y);
            bokse.push(pl);
        }

        /* De maalte stoffer: punkterne */
        ids.forEach(function (id) {
            var st = D.STOF[id], nu = !!farveNu[id];
            ctx.fillStyle = st.OH ? (st.OH > 1 ? "#c62828" : "#f0685a") : "#b0bec5";
            ctx.strokeStyle = nu ? "#ffffff" : "#14141a";
            ctx.lineWidth = nu ? 2 : 1.5;
            ctx.beginPath();
            ctx.arc(X(st.M), Y(st.kp), nu ? 6 : 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });

        /* Navnene: det aktuelle par foerst, og hvert navn paa den foerste plads,
           der ikke rammer noget */
        ids.sort(function (p, q) { return (farveNu[q] ? 1 : 0) - (farveNu[p] ? 1 : 0); });
        var etiketter = [];
        ids.forEach(function (id) {
            var st = D.STOF[id], nu = !!farveNu[id];
            ctx.font = Tg.font(nu ? "700" : "600", 12);
            var b = ctx.measureText(st.navn).width, hh = 14, x = X(st.M), y = Y(st.kp);
            var kand = [
                { x: x + 10, y: y - 7 }, { x: x - 10 - b, y: y - 7 },
                { x: x + 8, y: y - 21 }, { x: x - 8 - b, y: y - 21 },
                { x: x + 8, y: y + 7 }, { x: x - 8 - b, y: y + 7 },
                { x: x - b / 2, y: y - 24 }, { x: x - b / 2, y: y + 10 }
            ];
            var pl = null;
            kand.forEach(function (k) { var r = { x: k.x, y: k.y, b: b, h: hh }; if (!pl && inde(r) && !rammer(r)) pl = r; });
            if (!pl) {
                /* Ingen ledig plads: laengere vaek, til hoejre eller venstre */
                for (var dy = 14; dy <= 60 && !pl; dy += 14) {
                    [{ x: x + 10, y: y - 7 - dy }, { x: x + 10, y: y - 7 + dy }, { x: x - 10 - b, y: y - 7 - dy }, { x: x - 10 - b, y: y - 7 + dy }].forEach(function (k) {
                        var r = { x: k.x, y: k.y, b: b, h: hh };
                        if (!pl && inde(r) && !rammer(r)) pl = r;
                    });
                }
            }
            if (!pl) pl = { x: x + 10, y: y - 7, b: b, h: hh };
            bokse.push(pl);
            etiketter.push({ id: id, r: pl, nu: nu });
            /* Er navnet flyttet vaek fra punktet, viser en tynd streg, hvor det hoerer til */
            var cx = Math.max(pl.x, Math.min(x, pl.x + b)), cy = Math.max(pl.y, Math.min(y, pl.y + hh));
            if (Math.hypot(cx - x, cy - y) > 14) {
                ctx.strokeStyle = "rgba(207, 214, 222, 0.45)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(cx, cy);
                ctx.stroke();
            }
            ctx.fillStyle = nu ? farveNu[id] : "#aab3bd";
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillText(st.navn, pl.x, pl.y + 1);
        });
        this.grafBokse = bokse;
        this.grafEtiketter = etiketter;
        ctx.restore();
    };

    /* ----- Musen -------------------------------------------------------------------------- */
    P.hvemVed = function (pt) {
        var lay = this.lay;
        if (!lay) return null;
        for (var k in lay.kol) {
            var c = lay.kol[k];
            if (Math.hypot(pt.x - c.lup.x, pt.y - c.lup.y) <= c.lup.r) return k;
            var K = c.kammer;
            if (pt.x >= K.x && pt.x <= K.x + K.b && pt.y >= c.glas.top - 30 && pt.y <= K.bund) return k;
        }
        return null;
    };

    P.atomVed = function (pt, k) {
        var c = this.lay.kol[k], L = c.lup, Pk = this.Pr[k];
        if (Math.hypot(pt.x - L.x, pt.y - L.y) > L.r) return null;
        var s = L.r / Pk.Rm, A = Pk.F.atomer;
        var mx = (pt.x - L.x) / s, my = (pt.y - L.y) / s, bedst = null, bd = 1e9;
        Pk.mol.forEach(function (m) {
            if (!m.wx) return;
            for (var i = 0; i < A.length; i++) {
                var d = Math.hypot(m.wx[i] - mx, m.wy[i] - my), r = A[i].r + 0.15;
                if (d < r && d / r < bd) { bd = d / r; bedst = m; }
            }
        });
        return bedst;
    };

    P.overScene = function (pt) {
        var t = this.termoOver(pt);
        if (t) return t;
        if (!pt) return null;
        var k = this.hvemVed(pt);
        return k && this.atomVed(pt, k) ? "pointer" : null;
    };

    P.nedScene = function (pt) { return this.termoNed(pt); };
    P.flytScene = function (pt) { this.termo.flyt(pt, this.lay.termo); };
    P.opScene = function () { this.termo.slip(); };

    P.klikScene = function (pt) {
        if (this.termoKugle(pt)) return;
        if (this.paaTermo(pt)) return;
        var k = this.hvemVed(pt);
        if (!k) return;
        /* Under gaettet: kortet blinker, for gaettet staar paa kortet */
        if (this.gaetNu()) { this.kortBlink(); return; }
        var m = this.atomVed(pt, k);
        if (!m) return;
        var Pk = this.Pr[k], st = this.st[k];
        this.valgt = { k: k, m: m };
        this.valgtT = 6;
        if (m.gas) {
            this.kortBesked("Et molekyle " + st.navn + " i dampen. Det har ingen bindinger til andre molekyler.", 5);
            return;
        }
        var nh = Pk.hbListe.filter(function (b) { return b.a === m || b.b === m; }).length;
        var nl = Pk.lonListe.filter(function (b) { return b.a === m || b.b === m; }).length;
        var t = "Et molekyle " + st.navn + " i væsken. Lige nu: ";
        t += st.OH ? nh + " hydrogenbinding" + (nh === 1 ? "" : "er") + " og " : "ingen hydrogenbindinger, for der er ingen OH-gruppe, og ";
        t += nl + " London-kraft" + (nl === 1 ? "" : "er") + ".";
        this.kortBesked(t, 6);
    };

    /* Forfra: samme par fra starttemperaturen */
    P.nulstil = function () { this.vaelg(this.nr); };

    NK.SimSammenlign = SimSammenlign;
}());
