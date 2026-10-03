/* =====================================================================
   sim_spejl.js - fane 1: spejlbilledet

   Til venstre molekylet, til hoejre dets spejlbillede, og et spejl
   imellem. Eleven drejer molekylet med musen (som en kugle) og proever
   at faa det til at passe med spejlbilledet. Slipper eleven taet paa en
   stilling, hvor kuglerne ligger oven i spejlbilledets, klikker det paa
   plads, og groenne og roede ringe viser, hvilke grupper der passer.

   Har molekylet to ens grupper, kan alle fire komme til at passe. Har
   det fire forskellige, passer hoejst to: saa trykker eleven Det kan
   ikke lade sig goere. I opgave 3 bytter eleven to grupper (klik paa
   dem), og saa passer det.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = NK.T;
    var R = NK.Rum;
    var Q = R.Q;

    /* Startstillingen: den foerste gruppe peger op og den anden til hoejre,
       vippet lidt, saa de to bageste ikke daekker hinanden. Spejlbilledets
       tre nederste grupper ligger saa 60 grader forskudt, og molekylet skal
       drejes et godt stykke, foer det kan passe */
    var OP = [0, -1, 0];
    var HOEJRE = [0.943, 1 / 3, 0];
    var Q0 = Q.gange(Q.akse([1, 0, 0], 0.38), R.ramme(R.BASIS[0], R.BASIS[1], OP, HOEJRE));

    function SimSpejl() {
        var mig = this;
        this.valg = NK.el("sb-valg");
        this.startFane(D.SPEJL, D.SPEJL_GRUPPER);
        this.vaelg(0);
        window.addEventListener("resize", function () { mig.layout(); });
    }

    var P = SimSpejl.prototype;
    NK.Fane.paa(P, { navn: "sb", naesteFane: "fane-fi", naesteNavn: "Find C-atomet" });

    P.chipTekst = function (o, i) { return String(i + 1); };

    /* ----- Opgaven ------------------------------------------------------------------- */
    P.lavOpgave = function (i) {
        var o = this.opgaver[i];
        this.o = o;
        this.m = D.MOL[o.mol];
        this.grupper = this.m.g.slice();
        this.q = Q0.slice();
        this.maalQ = null;
        this.match = null;
        this.valgt = null;
        this.byttet = false;
        this.hold = null;
        this.over = null;
        this.roert = false;
        this.spejlRet = R.BASIS.map(function (b) { return R.spejl(Q.drej(Q0, b)); });
        this.bygValg();
    };

    P.bygValg = function () {
        var mig = this;
        this.valg.innerHTML = "";
        var k = document.createElement("button");
        k.type = "button";
        k.className = "valgknap";
        k.textContent = "Det kan ikke lade sig gøre";
        k.addEventListener("click", function () { mig.umuligt(); mig.fokus(); });
        this.valg.appendChild(k);
        this.umuligKnap = k;
    };

    P.promptHTML = function () {
        var o = this.o;
        var t = o.byt ? "Byt om på to af grupperne. Kan molekylet så drejes, så det passer med spejlbilledet?" :
            "Kan du dreje molekylet, så det passer med spejlbilledet?";
        return '<p class="maal-tekst">' + NK.html(t) + "</p>" +
            '<p class="note-tekst">' + NK.html(D.navn(this.m)) + ": " + NK.html(this.m.g.map(D.tekst).join(", ")) + "</p>";
    };

    P.trinLinje = function () {
        if (this.o.byt && !this.byttet) {
            return this.valgt === null ? "Klik på to af grupperne til venstre for at bytte dem." : "Klik på den gruppe, " + D.tekst(this.grupper[this.valgt]) + " skal bytte plads med.";
        }
        if (this.match) {
            var n = this.antalMatch();
            if (n === 4) return "";
            return n + " af 4 grupper passer. Drej videre, eller tryk Det kan ikke lade sig gøre.";
        }
        return "Træk i molekylet til venstre for at dreje det. Slip, når det ligner spejlbilledet.";
    };

    /* ----- Hinttrappen og Vis svaret ------------------------------------------------- */
    P.hintTrin = function () {
        var o = this.o, g = this.m.g;
        if (o.byt && !this.byttet) return [
            "Klik på to af grupperne til venstre, fx Cl og F. Så bytter de plads.",
            "Når to grupper har byttet plads, er molekylet blevet til sit spejlbillede.",
            "Klik på Cl og så på F, og drej bagefter molekylet, til alle fire passer."
        ];
        if (o.kan) {
            var ens = g.filter(function (x, i) { return g.indexOf(x) !== i; })[0];
            var forsk = g.filter(function (x) { return x !== ens; });
            return [
                "Træk i molekylet til venstre. Slip, når det ligner spejlbilledet. Er det tæt på, klikker det på plads.",
                "Start med at få " + D.tekst(forsk[0]) + " til at pege samme vej som " + D.tekst(forsk[0]) + " i spejlbilledet.",
                o.byt ? "Drej så om " + D.tekst(forsk[0]) + ", til de andre også passer." :
                    "Drej så om " + D.tekst(forsk[0]) + ", til " + D.tekst(forsk[1]) + " også passer. De to " + D.tekst(ens) + " passer så af sig selv."
            ];
        }
        return [
            "Træk i molekylet til venstre. Slip, når det ligner spejlbilledet. Er det tæt på, klikker det på plads.",
            "Få to grupper til at passe. Se så på de to andre.",
            "To grupper kan altid komme til at passe, men så har de to andre byttet plads. Molekylet har fire forskellige grupper."
        ];
    };

    P.visSvar = function () {
        var o = this.o;
        if (!o.kan) { this.umuligt(true); return; }
        if (o.byt && !this.byttet) this.byt(1, 2);
        this.maalQ = this.bedsteJustering(true).q;
        this.auto = true;
    };

    /* ----- Justeringen: drejninger, hvor kuglerne ligger oven i spejlbilledets ---------------- */
    P.justeringer = function () {
        return R.justeringer(R.BASIS, this.spejlRet);
    };

    /* Den naermeste justering (kunFire: kun dem, hvor alle fire grupper passer) */
    P.bedsteJustering = function (kunFire) {
        var mig = this, bedst = null;
        this.justeringer().forEach(function (j) {
            if (kunFire && mig.antalMatch(j.perm) !== 4) return;
            var v = Q.vinkel(mig.q, j.q);
            if (!bedst || v < bedst.v) bedst = { q: j.q, perm: j.perm, v: v };
        });
        return bedst;
    };

    P.antalMatch = function (perm) {
        perm = perm || (this.match && this.match.perm);
        if (!perm) return 0;
        var g = this.grupper, s = this.m.g;
        return [0, 1, 2, 3].filter(function (i) { return g[i] === s[perm[i]]; }).length;
    };

    /* Kuglerne ligger oven i spejlbilledets: hvad passer? */
    P.vurder = function (j) {
        this.match = { perm: j.perm };
        var n = this.antalMatch();
        if (n === 4) {
            if (this.o.kan) { this.loest(this.slutTekst()); return; }
        }
        var g = this.grupper, s = this.m.g, mig = this;
        var galt = [0, 1, 2, 3].filter(function (i) { return g[i] !== s[j.perm[i]]; });
        if (n === 4) return;
        if (n === 2 && galt.length === 2) {
            this.besked('<span class="b-maerke">' + n + " af 4</span> " + NK.html(D.tekst(g[galt[0]]) + " og " + D.tekst(g[galt[1]]) +
                " sidder byttet om i forhold til spejlbilledet. Drej videre, eller tryk Det kan ikke lade sig gøre."), "gul");
        } else {
            this.besked('<span class="b-maerke">' + n + " af 4</span> " + NK.html(mig.trinLinje()), "gul");
        }
    };

    P.slutTekst = function () {
        return {
            s1: "Bromchlormethan har to H og passer med sit spejlbillede. Det er det samme molekyle, og det er ikke kiralt.",
            s3: "Et bytte af to grupper gav spejlbilledet. Molekylet til venstre er nu den anden enantiomer.",
            s4: "Propan-2-ol har to CH₃ og passer med sit spejlbillede. Det er ikke kiralt."
        }[this.o.id] || "Molekylet passer med sit spejlbillede.";
    };

    P.umuligt = function (vist) {
        if (this.faerdig) return;
        var o = this.o;
        if (!o.kan) {
            this.umuligKnap.classList.add("rigtig");
            this.loest({
                s2: "To grupper kan komme til at passe, men så har de to andre byttet plads. Molekylet og spejlbilledet er to forskellige stoffer. De kaldes enantiomerer.",
                s5: "Butan-2-ol har fire forskellige grupper: OH, CH₂CH₃, CH₃ og H. Det midterste C-atom er asymmetrisk, og der findes to enantiomerer.",
                s6: "Alanin har fire forskellige grupper på det midterste C-atom. Aminosyrer findes i to enantiomerer, og kroppen bruger kun den ene."
            }[o.id]);
            return;
        }
        this.umuligKnap.classList.add("forkert");
        if (o.byt && !this.byttet) this.fejlLinje("Byt først to af grupperne. Så kan det godt lade sig gøre.");
        else this.fejlLinje("Det kan godt lade sig gøre. " + (o.byt ? "Efter byttet er molekylet spejlbilledet. Drej, til alle fire passer." :
            "Molekylet har to ens grupper. Drej, til de to andre passer."));
        void vist;
    };

    P.byt = function (i, j) {
        var g = this.grupper, t = g[i];
        g[i] = g[j];
        g[j] = t;
        this.byttet = true;
        this.valgt = null;
        this.match = null;
        this.nulstilHjaelp();
    };

    /* ----- Layout ------------------------------------------------------------------- */
    P.layout = function () {
        var L = this.L, baand = this.baand();
        var top = 14, bund = L.h - Math.max(baand.h, 92) - 62 - 4;
        var h = Math.max(200, bund - top);
        var s = Math.min(L.b * 0.115, h * 0.2);
        this.lay = { top: top, bund: bund, h: h, s: s, cy: top + h * 0.52, vx: L.b * 0.26, hx: L.b * 0.74, mx: L.b / 2 };
        this.valg.style.bottom = (baand.h + 10) + "px";
        this.saetAnker("molekyle", 0, top, L.b * 0.48, h);
        this.saetAnker("spejl", L.b * 0.52, top, L.b * 0.48, h);
    };

    P.kamV = function () { return { cx: this.lay.vx, cy: this.lay.cy, s: this.lay.s, f: 8 }; };
    P.kamH = function () { return { cx: this.lay.hx, cy: this.lay.cy, s: this.lay.s, f: 8 }; };
    P.venstre = function () { return { g: this.grupper, q: this.q }; };
    P.hoejre = function () { return { g: this.m.g, retninger: this.spejlRet }; };

    /* ----- Musen -------------------------------------------------------------------- */
    P.overScene = function (pt) {
        if (!pt) { this.over = null; return null; }
        var k = R.ramt(this.venstre(), this.kamV(), pt);
        this.over = k && k.i >= 0 ? k.i : null;
        if (pt.x < this.lay.mx - 10 && !this.faerdig) return this.o.byt && !this.byttet && this.over !== null ? "peg" : "greb";
        if (Math.abs(pt.x - this.lay.mx) < 14) return "peg";
        return null;
    };

    P.nedScene = function (pt) {
        if (this.faerdig || this.auto || pt.x > this.lay.mx - 10) return false;
        this.hold = { start: pt, sidst: pt, flyttet: 0 };
        this.roert = true;
        return true;
    };

    P.flytScene = function (pt) {
        var h = this.hold;
        if (!h || this.faerdig) return;
        var dx = pt.x - h.sidst.x, dy = pt.y - h.sidst.y;
        h.sidst = pt;
        h.flyttet = Math.max(h.flyttet, Math.hypot(pt.x - h.start.x, pt.y - h.start.y));
        if (h.flyttet < 4) return;
        var kk = 0.011;
        var dq = Q.gange(Q.akse([0, 1, 0], -dx * kk), Q.akse([1, 0, 0], dy * kk));
        this.q = Q.norm(Q.gange(dq, this.q));
        if (this.match) { this.match = null; this.naesteLinje("", ""); }
        this.nulstilHjaelp();
    };

    P.opScene = function (pt) {
        var h = this.hold;
        this.hold = null;
        if (!h) return;
        if (h.flyttet < 4) { this.klikPaa(pt); return; }
        /* Klik paa plads, hvis molekylet er taet paa en justering */
        var j = this.bedsteJustering(false);
        if (j && j.v < 40 * Math.PI / 180) { this.maalQ = j.q; }
        else this.kortBesked("Ikke helt. Prøv at få en af grupperne til at pege samme vej som i spejlbilledet.", 4);
    };

    P.klikPaa = function (pt) {
        var k = R.ramt(this.venstre(), this.kamV(), pt);
        if (!k) return;
        if (k.i < 0) { this.kortBesked("Det midterste C-atom. Det har fire grupper.", 3); return; }
        if (this.o.byt && !this.byttet) {
            if (this.valgt === null) { this.valgt = k.i; this.naesteLinje("", ""); return; }
            if (this.valgt === k.i) { this.valgt = null; this.naesteLinje("", ""); return; }
            this.byt(this.valgt, k.i);
            this.naesteLinje("", "");
            return;
        }
        this.kortBesked(D.tekst(this.grupper[k.i]) + ". Træk for at dreje molekylet.", 3);
    };

    P.klikScene = function (pt) {
        if (Math.abs(pt.x - this.lay.mx) < 14 && pt.y > this.lay.top && pt.y < this.lay.bund) this.kortBesked(D.CARVON, 7);
    };

    /* ----- Tiden og tegningen ---------------------------------------------------------- */
    P.opdaterScene = function (dt) {
        if (this.maalQ) {
            this.q = Q.mod(this.q, this.maalQ, this.auto ? 3.5 : 9, dt);
            if (Q.vinkel(this.q, this.maalQ) < 0.004) {
                this.q = this.maalQ;
                this.maalQ = null;
                this.auto = false;
                var j = this.bedsteJustering(false);
                if (j && j.v < 0.01) this.vurder(j);
                this.visKnap();
            }
        }
    };

    P.efterOpgave = function () { this.auto = false; this.visKnap(); };

    P.tegn = function () {
        var L = this.L, ctx = L.ctx, lay = this.lay;
        L.ryd("#14141a");
        /* Spejlet */
        ctx.save();
        var g = ctx.createLinearGradient(lay.mx - 8, 0, lay.mx + 8, 0);
        g.addColorStop(0, "rgba(160, 200, 230, 0.05)");
        g.addColorStop(0.5, "rgba(190, 225, 250, 0.35)");
        g.addColorStop(1, "rgba(160, 200, 230, 0.05)");
        ctx.fillStyle = g;
        ctx.fillRect(lay.mx - 8, lay.top + 20, 16, lay.h - 40);
        ctx.restore();
        NK.tekst(ctx, "spejl", lay.mx, lay.bund - 4, { font: "600 13px 'Segoe UI', sans-serif", farve: "#7e8590", justering: "center" });
        NK.tekst(ctx, "Molekylet", lay.vx, lay.top + 24, { font: "700 19px 'Segoe UI', sans-serif", farve: "#cfd6de", justering: "center" });
        NK.tekst(ctx, "Spejlbilledet", lay.hx, lay.top + 24, { font: "700 19px 'Segoe UI', sans-serif", farve: "#cfd6de", justering: "center" });

        var ringV = {}, ringH = {};
        if (this.match) {
            var g2 = this.grupper, s = this.m.g, perm = this.match.perm;
            [0, 1, 2, 3].forEach(function (i) {
                var f = g2[i] === s[perm[i]] ? T.GROEN : T.ROED;
                ringV[i] = f;
                ringH[perm[i]] = f;
            });
        }
        if (this.valgt !== null) ringV[this.valgt] = T.GUL;
        R.tegn(ctx, this.venstre(), this.kamV(), { ring: ringV, over: this.faerdig ? null : this.over });
        R.tegn(ctx, this.hoejre(), this.kamH(), { ring: ringH });

        if (this.match) {
            var n = this.antalMatch();
            NK.tekst(ctx, n + " af 4 grupper passer", lay.vx, lay.bund - 6,
                { font: "700 17px 'Segoe UI', sans-serif", farve: n === 4 ? "#7ee0a8" : "#f5dd8a", justering: "center" });
        } else if (!this.roert && !this.faerdig) {
            NK.tekst(ctx, "↔  træk for at dreje  ↕", lay.vx, lay.bund - 6,
                { font: "600 15px 'Segoe UI', sans-serif", farve: "rgba(242,197,61," + (0.55 + 0.4 * Math.sin(this.tid * 3)) + ")", justering: "center" });
        }
    };

    P.fokusFelt = function () { };

    NK.SimSpejl = SimSpejl;
}());
