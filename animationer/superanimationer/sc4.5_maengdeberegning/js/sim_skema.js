/* =====================================================================
   sim_skema.js - fane 2: hele skemaet

   De fem opgaver fra den gamle c4.5 (kul, Haber-Bosch, methan og
   propan; magnesium og saltsyre er flyttet til fane 3) og fotosyntesen,
   hvor produktet er kendt. Eleven afstemmer, regner molarmasserne og
   udfylder skemaet. Trinvis aabner ét felt ad gangen som den gamle;
   Frit aabner dem alle (den gamle "oevet-tilstand").

   Naar alle masser skal findes (methan og propan), staar en skaalvaegt
   foran tavlen: reaktanterne i venstre skaal, produkterne i hoejre.
   Hver fundet masse laegges i sin skaal, og vaegten tipper, til den
   sidste masse er fundet. Saa staar den lige: massen er bevaret.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;

    var STIVHED = 26, DAEMPNING = 3.2;
    var NOEGLE_FRIT = "nk-sc4.5-skema-frit";

    function SimSkema() {
        this.trinvis = !NK.hent(NOEGLE_FRIT, false);
        this.startFane();
        this.sidstN = {};
        this.vinkel = 0;
        this.fart = 0;
        this.bygTilstand();
        this.introNu = true;
        this.nr = -1;
        var i = this.naesteUloeste();
        this.vaelg(i >= 0 ? i : 0, false);
    }

    var P = SimSkema.prototype;

    NK.Fane.paa(P, { navn: "skema", opgaver: D.SKEMA, naesteFane: "fane-begr", naesteNavn: "Begrænsende mængde" });

    /* ----- Trinvis eller frit ------------------------------------------------------- */
    P.bygTilstand = function () {
        var mig = this;
        var knapper = document.querySelectorAll("#skema-tilstand .vaelger");
        for (var i = 0; i < knapper.length; i++) {
            (function (k) {
                k.addEventListener("click", function () { mig.saetTrinvis(k.getAttribute("data-tilstand") === "trinvis"); });
            }(knapper[i]));
        }
        this.visTilstand();
    };

    P.visTilstand = function () {
        var knapper = document.querySelectorAll("#skema-tilstand .vaelger");
        for (var i = 0; i < knapper.length; i++) {
            var trinvis = knapper[i].getAttribute("data-tilstand") === "trinvis";
            knapper[i].classList.toggle("valgt", trinvis === this.trinvis);
        }
    };

    P.saetTrinvis = function (ja) {
        if (ja === this.trinvis) return;
        this.trinvis = ja;
        NK.gem(NOEGLE_FRIT, !ja);
        this.visTilstand();
        if (!this.opg) return;
        this.skema.trinvis = ja;
        this.skema.byg();
        this.hjaelp = 0;
        this.visKnap();
        if (!this.faerdig) this.naesteLinje(ja ? "Trinvis: ét felt ad gangen." : "Frit: alle felterne er åbne.", "");
        this.fokus();
    };

    /* ----- Opgaven -------------------------------------------------------------------- */
    P.lavSpec = function (i) {
        var o = D.SKEMA[i], st = D.stof(o.givet);
        var n = this.traek(o.n, this.sidstN[o.id]);
        this.sidstN[o.id] = n;
        this.x = { o: o, n: n, m: Math.round(n * st.M) / 100 };
        var givet = {};
        givet[o.givet] = this.x.m;
        return { r: D.reaktion(o.r), givet: givet, kilde: o.givet, spoerg: o.spoerg, afstem: !!o.afstem };
    };

    P.promptHTML = function () {
        var o = this.x.o;
        return '<p class="opgave-prompt">' + D.tekstMasse(this.x.m) + " g " + D.stof(o.givet).formel + "</p>" +
            '<p class="opgave-spm">' + NK.html(o.tekst) + "</p>";
    };

    P.nyOpgave = function () {
        this.vinkel = 0;
        this.fart = 0;
        this.balanceRost = false;
    };

    /* ----- Massebevarelsen ---------------------------------------------------------------
       Masserne, der er kendt nu, paa hver side. */
    P.kendteMasser = function () {
        var o = this.opg, ud = [[], []];
        o.r.led.forEach(function (l, j) {
            var c = o.celler[j + "_m"];
            var kendt = c.rolle === "givet" || c.status === "ok" || c.status === "svar";
            ud[l.side].push({ j: j, st: D.stof(l.s), m: o.m[j], kendt: kendt });
        });
        return ud;
    };

    function sum(liste) {
        return liste.reduce(function (a, x) { return a + (x.kendt ? Math.round(x.m * 100) : 0); }, 0) / 100;
    }

    P.alleMasser = function () {
        var km = this.kendteMasser();
        return km[0].concat(km[1]).every(function (x) { return x.kendt; });
    };

    P.sumTekst = function (liste) {
        var dele = liste.map(function (x) { return x.kendt ? D.tekstMasse(x.m) + " g" : "? g"; });
        var alle = liste.every(function (x) { return x.kendt; });
        return dele.join(" + ") + (alle && liste.length > 1 ? " = " + D.tekstMasse(sum(liste)) + " g" : "");
    };

    P.slutHTML = function () {
        if (!this.x.o.massebevarelse || !this.alleMasser()) return "";
        var km = this.kendteMasser();
        return '<div class="regn-linje">m(reaktanter) = ' + this.sumTekst(km[0]).replace(/= ([\d,]+ g)$/, "= <b>$1</b>") + "</div>" +
            '<div class="regn-linje">m(produkter) = ' + this.sumTekst(km[1]).replace(/= ([\d,]+ g)$/, "= <b>$1</b>") + "</div>";
    };

    P.slutLinje = function () {
        if (this.x.o.massebevarelse) {
            return "Vægten står lige: " + D.tekstMasse(sum(this.kendteMasser()[0])) + " g før og efter.";
        }
        var o = this.x.o, soegt = o.spoerg[o.spoerg.length - 1];
        var j = D.plads(this.opg.r, soegt[0]);
        return D.tekstMasse(this.x.m) + " g " + D.stof(o.givet).formel + " svarer til " +
            D.tekstMasse(this.opg.m[j]) + " g " + D.stof(soegt[0]).formel + ".";
    };

    /* Vinklen, vaegten falder til ro i. Positiv: hoejre side nede. */
    P.maalVinkel = function () {
        var km = this.kendteMasser();
        var d = sum(km[1]) - sum(km[0]);
        if (Math.abs(d) < 0.05) return 0;
        var grader = 3 + 11 * (1 - Math.exp(-Math.abs(d) / 60));
        return (d > 0 ? 1 : -1) * grader * Math.PI / 180;
    };

    /* ----- Layout ------------------------------------------------------------------------ */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var baand = this.k.layout(W, H);
        lay.baand = baand;
        var kant = NK.klamp(W * 0.014, 8, 16);
        var vaegt = this.x && this.x.o.massebevarelse;
        lay.vaegt = vaegt;
        lay.bordY = Math.round(baand.y - NK.klamp(H * 0.035, 10, 26));
        var top = NK.klamp(H * 0.02, 8, 18);
        var tH = vaegt ? NK.klamp((lay.bordY - top) * 0.6, 200, 420) : NK.klamp(lay.bordY - top - 18, 200, 460);
        lay.tavle = { x: kant + 6, y: top, b: W - 2 * kant - 12, h: tH };
        var ind = NK.klamp(lay.tavle.b * 0.03, 8, 22);
        this.skema.layout({ x: lay.tavle.x + ind, y: lay.tavle.y + ind * 0.6, b: lay.tavle.b - 2 * ind, h: tH - ind * 1.2 }, this.L.ctx);
        if (vaegt) {
            /* Skaalvaegten som i sc4.1: knivsaeggen midt i det frie rum */
            var zoneTop = lay.tavle.y + tH + 14;
            var A = lay.bordY - zoneTop;
            var L = NK.klamp(Math.min(W * 0.2, (A - 22) / 1.485, 230), 56, 230);
            var sk = 0.9 * L / NK.Sprites.MAAL.skaal_skaal.fladeB;
            var x = Math.round(W / 2);
            var yMin = zoneTop + 0.25 * L + 8;
            var yMax = lay.bordY - 12 - 1.235 * L;
            var y = yMax > yMin ? (yMin + yMax) / 2 : yMin;
            var Mf = NK.Sprites.MAAL.skaal_fod;
            lay.v = { x: x, y: y, L: L, sk: sk, k: (lay.bordY - y) / (Mf.bund - Mf.aegY) };
            lay.pose = NK.klamp(L * 0.42, 22, 50);
            /* Skiltene med summerne til venstre og hoejre for vaegten */
            var fri = x - L - 80 * sk - kant - 16;
            lay.skiltB = Math.max(90, fri);
            lay.skiltY = y + 0.2 * L;
            this.saetAnker("vaegt", x - L - 80 * sk, zoneTop, 2 * L + 160 * sk, lay.bordY - zoneTop);
        } else {
            this.saetAnker("vaegt", 0, 0, 1, 1);
        }
        this.lay = lay;
        this.saetAnker("skema", lay.tavle.x, lay.tavle.y, lay.tavle.b, tH);
        this.saetAnker("boble", this.k.lay.boble.x, this.k.lay.boble.y, this.k.lay.boble.b, this.k.lay.boble.h);
        this.saetAnker("laerer", this.k.lay.desk.x, baand.y, this.k.lay.desk.b, baand.h);
    };

    /* ----- Tid -------------------------------------------------------------------------------- */
    P.opdaterScene = function (dt) {
        if (!this.lay || !this.lay.vaegt) return;
        var maal = this.maalVinkel();
        var trin = Math.max(1, Math.ceil(dt / 0.005)), h = dt / trin;
        for (var i = 0; i < trin; i++) {
            var a = -STIVHED * (this.vinkel - maal) - DAEMPNING * this.fart;
            this.fart += a * h;
            this.vinkel += this.fart * h;
        }
    };

    /* ----- Tegning ----------------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay || !this.opg) return;
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 6);
        Tg.tavle(ctx, lay.tavle);
        this.skema.tegn(ctx, this.tid);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.baand.y);
        if (lay.vaegt) this.tegnVaegt(ctx);
        this.k.tegn(ctx);
    };

    P.tegnVaegt = function (ctx) {
        var lay = this.lay, v = lay.v, vinkel = this.vinkel;
        var fl = Tg.skaalFlader(v, vinkel);
        Tg.skaalvaegtFod(ctx, v, vinkel);
        Tg.skaalvaegtArm(ctx, v, vinkel);
        var km = this.kendteMasser(), s = lay.pose;
        [0, 1].forEach(function (side) {
            Tg.skaalvaegtSkaal(ctx, v, fl[side]);
            var kendte = km[side].filter(function (x) { return x.kendt; });
            var n = kendte.length;
            kendte.forEach(function (x, i) {
                var px = fl[side].x + (i - (n - 1) / 2) * s * 0.95;
                Tg.pose(ctx, px, fl[side].y - 2, s, x.st, { etiket: D.tekstMasse(x.m) + " g" });
            });
        });
        /* Summerne paa skilte ved siden af */
        var mig = this;
        [0, 1].forEach(function (side) {
            var titel = side === 0 ? "REAKTANTER" : "PRODUKTER";
            var tekst = mig.sumTekst(km[side]);
            var b = lay.skiltB, y = lay.skiltY;
            var x = side === 0 ? v.x - v.L - 80 * v.sk - 12 - b : v.x + v.L + 80 * v.sk + 12;
            ctx.save();
            ctx.textBaseline = "middle";
            ctx.textAlign = side === 0 ? "right" : "left";
            var tx = side === 0 ? x + b : x;
            ctx.fillStyle = "#9aa3b0";
            ctx.font = Tg.font("700", 12);
            ctx.fillText(titel, tx, y - 14);
            NK.passendeSkrift(ctx, tekst, b, 15, 10, "700");
            ctx.fillStyle = "#e7ecf2";
            ctx.fillText(tekst, tx, y + 6);
            ctx.restore();
        });
    };

    NK.SimSkema = SimSkema;
}());
