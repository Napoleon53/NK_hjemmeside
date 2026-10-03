/* =====================================================================
   sim_sammenlign.js - fane 2: sammenlign to stoffer

   Brugerens opgave med tabellerne som forsoeg: to stoffer i hver sit
   reagensglas i hver sit kammer, med hver sin lup over. Eleven gaetter,
   hvilket der koger ved den hoejeste temperatur (klik paa luppen), varmer
   begge op med termometeret og svarer saa paa hvorfor. De forkerte svar
   er de fejl, elever laver, og hver har sin forklaring.

   Fem par: OH-gruppen (propan og ethanol), kaeden, formen, to
   OH-grupper og et langt molekyle. Kogepunkterne kommer paa grafen i
   panelet, kogepunkt mod molarmasse, med alkanerne og alkoholerne.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;

    var FARVE = { a: "#64b5f6", b: "#ffb74d" };
    var BALLON = { a: "#4f8fd6", b: "#e3893a" };
    /* Navnene paa grafen skubbes lidt, hvor punkterne ligger taet */
    var ETIKET_DY = { pentan1ol: -11, butan1ol: 9, propan2ol: -8, propan1ol: 8 };

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

    /* ----- Opgaven ---------------------------------------------------------------- */
    P.lavOpgave = function (i) {
        var o = this.opgaver[i];
        var sa = D.STOF[o.a], sb = D.STOF[o.b];
        this.opg = { o: o, fase: "gaet", gaet: null, kogt: { a: false, b: false }, forkert: {}, rigtig: undefined };
        this.st = { a: sa, b: sb };
        this.Pr = {
            a: new NK.Proeve(sa, D.antalILup(sa), D.SAMMEN.Rm, 11 + i),
            b: new NK.Proeve(sb, D.antalILup(sb), D.SAMMEN.Rm, 23 + i)
        };
        this.Pr.a.nulstil(o.start);
        this.Pr.b.nulstil(o.start);
        this.termo.saet(o.start);
        this.valgt = null;
        this.valgtT = 0;
        this.grafNoegle = "";
    };

    P.hoejest = function () { return this.st.a.kp > this.st.b.kp ? "a" : "b"; };

    P.promptHTML = function () {
        var g = this.opg, o = g.o, sa = this.st.a, sb = this.st.b;
        var html = '<p class="note-tekst">' + NK.html(o.intro) + "</p>";
        if (g.fase === "gaet") {
            html += '<p class="maal-tekst">Hvilket stof koger ved den højeste temperatur? Gæt, og klik på dets lup.</p>';
            html += '<div class="knapper valgrad">' +
                '<button type="button" class="knap" data-valg="0"><span class="v-prik" style="background:' + FARVE.a + '"></span>' + NK.html(D.Stort(sa.navn)) + "</button>" +
                '<button type="button" class="knap" data-valg="1"><span class="v-prik" style="background:' + FARVE.b + '"></span>' + NK.html(D.Stort(sb.navn)) + "</button></div>";
        } else if (g.fase === "varm") {
            html += '<p class="maal-tekst">Varm op med termometeret, og se, hvilket stof der koger først.</p>';
            html += '<p class="note-tekst">Dit gæt: ' + NK.html(this.st[g.gaet].navn) + ".</p>";
        } else {
            html += '<p class="maal-tekst">' + NK.html(o.spm) + "</p>";
            html += '<div class="knapper valgrad">';
            o.svar.forEach(function (sv, j) {
                var kl = "knap", laast = g.rigtig !== undefined;
                if (g.forkert[j]) { kl += " forkert"; laast = true; }
                if (g.rigtig === j) kl += " rigtig";
                html += '<button type="button" class="' + kl + '" data-valg="' + j + '"' + (laast ? " disabled" : "") + ">" +
                    '<span class="v-bogstav">' + "ABC".charAt(j) + "</span>" + NK.html(sv.t) + "</button>";
            });
            html += "</div>";
        }
        return html;
    };

    P.trinLinje = function () {
        var g = this.opg;
        if (g.fase === "gaet") return "Gæt først: klik på luppen med det stof, du tror koger ved den højeste temperatur.";
        if (g.fase === "varm") {
            var k = g.kogt;
            if (!k.a && !k.b) return this.roertTermo ? "Varm videre. Begge stoffer er stadig væsker." : "Træk i det runde håndtag på termometeret, og varm op.";
            var x = k.a ? "a" : "b", y = k.a ? "b" : "a";
            return D.Stort(this.st[x].navn) + " koger ved " + D.kpTekst(this.st[x]) + ". Varm videre, til " + this.st[y].navn + " også koger.";
        }
        return "Vælg et svar i opgavekortet.";
    };

    P.hintTrin = function () {
        var g = this.opg;
        if (g.fase === "gaet") return ["Det er et gæt. Bagefter måler du det."];
        if (g.fase === "varm") {
            var maks = Math.max(this.st.a.kp, this.st.b.kp);
            return ["Træk i det runde håndtag på termometeret til højre.",
                    "Varm op, til begge stoffer koger. Ballonen fyldes, når et stof koger.",
                    "Træk termometeret op over " + D.grader(Math.ceil((maks + 8) / 10) * 10) + " °C."];
        }
        return g.o.hint;
    };

    P.visSvar = function () {
        var g = this.opg;
        if (g.fase === "gaet") {
            this.gaet(this.hoejest(), true);
        } else if (g.fase === "varm") {
            var maks = Math.max(this.st.a.kp, this.st.b.kp);
            this.termo.animerTil(Math.min(D.SAMMEN.omr.max, maks + 12), 90);
            this.roertTermo = true;
        } else {
            g.o.svar.forEach(function (sv, j) { if (sv.ok) g.rigtig = j; });
            this.loest("svar", g.o.loest);
        }
    };

    /* ----- Gaettet og svarene --------------------------------------------------------- */
    P.gaet = function (hvem, fraSvar) {
        var g = this.opg;
        if (g.fase !== "gaet") return;
        g.gaet = hvem;
        g.fase = "varm";
        this.hjaelp = 0;
        this.visKort();
        var t = "Dit gæt: " + this.st[hvem].navn + ". " + this.trinLinje();
        this.besked('<span class="b-maerke">' + (fraSvar ? "Svaret" : "Gættet") + "</span> " + NK.html(t), "peger");
        this.sidsteTrin = this.trinLinje();
    };

    P.svarValg = function (j) {
        var g = this.opg, o = g.o;
        if (this.faerdig) return;
        if (g.fase === "gaet") { this.gaet(j === 0 ? "a" : "b"); return; }
        if (g.fase !== "hvorfor") return;
        if (o.svar[j].ok) {
            g.rigtig = j;
            this.loest("selv", o.loest + " " + NK.tilfaeldig(D.ROS));
            return;
        }
        g.forkert[j] = true;
        this.visKort();
        this.fejlLinje(o.svar[j].f);
    };

    /* Begge har kogt: dommen over gaettet og saa spoergsmaalet */
    P.beggeKogt = function () {
        var g = this.opg, h = this.hoejest(), l = h === "a" ? "b" : "a";
        g.fase = "hvorfor";
        this.hjaelp = 0;
        this.visKort();
        var t = D.Stort(this.st[l].navn) + " koger ved " + D.kpTekst(this.st[l]) + " og " + this.st[h].navn + " ved " +
            D.kpTekst(this.st[h]) + ". ";
        if (g.gaet === h) this.besked('<span class="b-maerke">Godt gættet</span> ' + NK.html(t + "Svar nu på, hvorfor."), "god");
        else this.besked('<span class="b-maerke">Gættet holdt ikke</span> ' + NK.html(t + "Svar nu på, hvorfor."), "gul");
        this.sidsteTrin = this.trinLinje();
    };

    /* ----- Scenen ------------------------------------------------------------------------ */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var baand = this.baand();
        var lay = { W: W, H: H, baand: baand };
        var kant = NK.klamp(W * 0.016, 10, 18);
        lay.bordY = baand.y - NK.klamp(H * 0.035, 14, 26);
        lay.termo = Tg.termoMaal(W - kant - 50, lay.bordY - 4, lay.bordY - 4 - 16, D.SAMMEN.omr);
        var x0 = kant, x1 = lay.termo.x - 78;
        var colB = (x1 - x0) / 2;
        var arbH = lay.bordY - 10;
        var sk = NK.klamp(Math.min(arbH * 0.36 / 420, colB * 0.5 / 240), 0.2, 0.6);
        var lupBund = lay.bordY - 418 * sk - 10;
        var top = 52;
        var r = Math.max(50, Math.min(colB / 2 - 16, (lupBund - top) / 2));
        lay.kol = {};
        ["a", "b"].forEach(function (k, n) {
            var cx = x0 + colB * (n + 0.5);
            var K = Tg.kammerMaal(cx, lay.bordY, 300 * sk);
            var G = K.glas();
            lay.kol[k] = {
                kammer: K, glas: G,
                lup: { x: cx, y: top + r + Math.max(0, (lupBund - top - 2 * r) / 2), r: r },
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
        var g = this.opg, mig = this;
        if (!g) return;
        this.termo.opdater(dt);
        this.Pr.a.opdater(dt, this.termo.T);
        this.Pr.b.opdater(dt, this.termo.T);
        if (this.valgtT > 0) { this.valgtT -= dt; if (this.valgtT <= 0) this.valgt = null; }
        ["a", "b"].forEach(function (k) {
            var Pk = mig.Pr[k];
            if (!g.kogt[k] && Pk.T >= Pk.kp() && Pk.antalGas() > Pk.N / 2) {
                g.kogt[k] = true;
                mig.maalt[mig.st[k].id] = true;
                mig.grafNoegle = "";
            }
        });
        if (g.fase === "varm" && g.kogt.a && g.kogt.b) this.beggeKogt();
        if (!this.faerdig && !this.kortT && this.fast.klasse === "") {
            var t = this.trinLinje();
            if (t !== this.sidsteTrin) { this.sidsteTrin = t; this.naesteLinje("", ""); }
        } else if (!this.faerdig && this.fast.klasse === "peger" && g.fase === "varm" && (g.kogt.a || g.kogt.b)) {
            this.sidsteTrin = this.trinLinje();
            this.naesteLinje("", "");
        }
    };

    P.naesteLinjeGammel = P.naesteLinje;
    P.naesteLinje = function (foer, slags) {
        this.sidsteTrin = this.faerdig ? "" : this.trinLinje();
        this.naesteLinjeGammel(foer, slags);
    };

    P.efterOpgave = function () {
        this.grafNoegle = "";
        this.tabelKnap.hidden = this.antalLoest() < this.opgaver.length;
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, mig = this, g = this.opg;
        if (!lay || !g) return;
        Tg.rum(ctx, lay.W, lay.baand.y, lay.bordY + 10);
        Tg.bord(ctx, 0, lay.termo.x - 60, lay.bordY, lay.baand.y);
        ["a", "b"].forEach(function (k) {
            var c = lay.kol[k], st = mig.st[k], Pk = mig.Pr[k];
            Tg.kammerMedGlas(ctx, c.kammer, mig.termo.T, Pk.makro(), mig.tid, {
                ballonFarve: BALLON[k], lys: g.fase === "gaet" && mig.over === k ? 1 : 0
            });
            Tg.zoomTilLup(ctx, c.zoomFra, c.lup);
            Tg.lup(ctx, c.lup, Pk, {
                valgt: mig.valgt && mig.valgt.k === k ? mig.valgt.m : null, donorKant: true, tid: mig.tid,
                gaet: g.gaet === k, lys: g.fase === "gaet" && mig.over === k ? 1 : 0
            });
            var under = NK.formel(st.formel) + "  ·  " + D.Mtekst(st) + (g.kogt[k] ? "  ·  koger ved " + D.kpTekst(st) : "");
            Tg.etiket(ctx, c.lup.x, c.lup.y - c.lup.r - 30, D.Stort(st.navn) + (g.gaet === k ? "  (dit gæt)" : ""), under, { farve: FARVE[k], px: 16 });
        });
        var maerker = [];
        ["a", "b"].forEach(function (k) {
            if (g.kogt[k]) maerker.push({ t: mig.st[k].kp, tekst: D.kpTekst(mig.st[k]), farve: FARVE[k] });
        });
        /* To maerker taet paa hinanden skubbes fra hinanden */
        if (maerker.length === 2) {
            var dy = lay.termo.yFor(maerker[0].t) - lay.termo.yFor(maerker[1].t);
            if (Math.abs(dy) < 16) { var sk = (16 - Math.abs(dy)) / 2 * (dy < 0 ? -1 : 1); maerker[0].dy = sk; maerker[1].dy = -sk; }
        }
        Tg.termometer(ctx, lay.termo, this.termo.T, {
            trin: 20, store: 40, maerker: maerker, stue: true, tid: this.tid,
            haandtag: this.haandtagLys, traekker: this.termo.traekker,
            puls: g.fase === "varm" && !this.roertTermo
        });
        if (this.faerdig && this.sejrT < 0.9) {
            ctx.save();
            ctx.globalAlpha = 0.14 * (1 - this.sejrT / 0.9);
            ctx.fillStyle = "#3fae72";
            ctx.fillRect(0, 0, lay.W, lay.baand.y);
            ctx.restore();
        }
        this.tegnGraf();
    };

    /* ----- Grafen i panelet: kogepunkt mod molarmasse ----------------------------------- */
    P.tegnGraf = function () {
        var L = this.grafL;
        var nyStr = L.tilpas();
        var noegle = Object.keys(this.maalt).sort().join(",") + "|" + this.visTabel + "|" + L.b + "x" + L.h;
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
            [[D.ALKANER, "rgba(176, 190, 197, 0.55)"], [D.ALKOHOLER, "rgba(240, 104, 90, 0.55)"]].forEach(function (s) {
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

        /* Forskellen mellem en alkan og en alkohol, der vejer det samme */
        [["propan", "ethanol"], ["hexan", "pentan1ol"]].forEach(function (p) {
            if (!mig.maalt[p[0]] || !mig.maalt[p[1]]) return;
            var a = D.STOF[p[0]], b = D.STOF[p[1]], x = (X(a.M) + X(b.M)) / 2 + 9;
            ctx.strokeStyle = "rgba(242, 197, 61, 0.85)";
            ctx.setLineDash([3, 3]);
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x, Y(a.kp));
            ctx.lineTo(x, Y(b.kp));
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = "#f2c53d";
            ctx.font = Tg.font("700", 12);
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(Math.round(b.kp - a.kp) + " °C", x + 4, (Y(a.kp) + Y(b.kp)) / 2);
        });

        /* De maalte stoffer */
        Object.keys(this.maalt).forEach(function (id) {
            var st = D.STOF[id];
            var x = X(st.M), y = Y(st.kp);
            ctx.fillStyle = st.OH ? (st.OH > 1 ? "#c62828" : "#f0685a") : "#b0bec5";
            ctx.strokeStyle = "#14141a";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.font = Tg.font("600", 12);
            ctx.fillStyle = "#cfd6de";
            var hoejre = x < W * 0.62;
            ctx.textAlign = hoejre ? "left" : "right";
            ctx.textBaseline = "middle";
            ctx.fillText(st.navn, x + (hoejre ? 9 : -9), y + (ETIKET_DY[st.id] || 0));
        });
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
        this.over = null;
        if (t) return t;
        if (!pt) return null;
        var k = this.hvemVed(pt);
        if (k && this.opg.fase === "gaet") { this.over = k; return "pointer"; }
        return k && this.atomVed(pt, k) ? "pointer" : null;
    };

    P.nedScene = function (pt) { return this.termoNed(pt); };
    P.flytScene = function (pt) { this.termo.flyt(pt, this.lay.termo); };
    P.opScene = function () { this.termo.slip(); };

    P.klikScene = function (pt) {
        if (this.termoKugle(pt)) return;
        var k = this.hvemVed(pt);
        if (!k) return;
        if (this.opg.fase === "gaet") { this.gaet(k); return; }
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
