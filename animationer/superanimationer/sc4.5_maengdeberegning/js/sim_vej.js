/* =====================================================================
   sim_vej.js - fane 1: vejen fra gram til gram

   Et kendt stof ligger paa vaegten til venstre, det soegte stofs vaegt
   staar tom til hoejre. Eleven udfylder skemaet paa tavlen i tre trin,
   og hvert rigtigt tal viser, hvad det betyder:

     n(kendt)  pulveret paa vaegten bliver til poser med 1 mol
     n(soegt)  poserne gaar gennem reaktionspilen og kommer ud i
               forholdet mellem koefficienterne
     m(soegt)  de nye poser saettes paa vaegten, og displayet viser massen

   Det andet stof er i overskud og regnes der ikke paa. Molarmasserne
   staar i skemaet og paa krukkerne; fane 2 ejer at regne dem.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;

    function SimVej() {
        this.startFane();
        this.introNu = true;
        this.sidstN = {};
        this.nr = -1;
        var i = this.naesteUloeste();
        this.vaelg(i >= 0 ? i : 0, false);
    }

    var P = SimVej.prototype;

    NK.Fane.paa(P, { navn: "vej", opgaver: D.VEJ, naesteFane: "fane-skema", naesteNavn: "Skemaet" });

    /* ----- Opgaven -------------------------------------------------------------- */
    P.lavSpec = function (i) {
        var o = D.VEJ[i], st = D.stof(o.kendt);
        var n = this.traek(o.n, this.sidstN[o.id]);
        this.sidstN[o.id] = n;
        this.x = { o: o, n: n, m: Math.round(n * st.M) / 100 };
        var givet = {};
        givet[o.kendt] = this.x.m;
        return {
            r: D.reaktion(o.r), givet: givet, kilde: o.kendt, visM: [o.kendt, o.soegt],
            spoerg: [[o.kendt, "n"], [o.soegt, "n"], [o.soegt, "m"]]
        };
    };

    P.promptHTML = function () {
        var o = this.x.o;
        return '<p class="opgave-prompt">' + D.tekstMasse(this.x.m) + " g " + D.stof(o.kendt).formel + "</p>" +
            '<p class="opgave-spm">' + NK.html(o.tekst) + "</p>";
    };

    /* Scenen starter forfra: pulveret ligger paa vaegten */
    P.nyOpgave = function () {
        var o = this.x.o, r = this.opg.r;
        this.jK = D.plads(r, o.kendt);
        this.jS = D.plads(r, o.soegt);
        this.a = { fase: 0, t: 0 };
        this.visHoejre = 0;     /* det, displayet til hoejre viser (gram) */
        this.visVenstre = this.x.m;
    };

    /* ----- Layout ---------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var baand = this.k.layout(W, H);
        lay.baand = baand;
        var kant = NK.klamp(W * 0.014, 8, 16);
        var top = baand.y;
        lay.bordY = Math.round(top - NK.klamp(H * 0.035, 10, 26));
        /* Tavlen oeverst. Skemaet skal have hoved, tre raekker og plads til pilen paa tvaers */
        var tH = NK.klamp(top * 0.5, 190, 380);
        lay.tavle = { x: kant + 6, y: NK.klamp(H * 0.02, 8, 18), b: W - 2 * kant - 12, h: tH };
        var ind = NK.klamp(lay.tavle.b * 0.03, 8, 22);
        this.skema.layout({ x: lay.tavle.x + ind, y: lay.tavle.y + ind * 0.6, b: lay.tavle.b - 2 * ind, h: tH - ind * 1.2 }, this.L.ctx);
        /* Vaegtene og krukkerne paa bordet */
        var zoneTop = lay.tavle.y + tH + 16;
        var A = lay.bordY - zoneTop;
        var vb = NK.klamp(Math.min(W * 0.22, A * 1.2), 100, 250);
        var vh = Tg.vaegtHoejde(vb);
        var jh = NK.klamp(Math.min(vb * 0.66, A * 0.66), 54, 140);
        var jb = Tg.krukkeBredde(jh);
        lay.vb = vb;
        lay.vh = vh;
        lay.jh = jh;
        lay.krukkeV = { x: kant + 8 + jb / 2, y: lay.bordY };
        lay.vaegtV = { x: lay.krukkeV.x + jb / 2 + 12 + vb / 2, y: lay.bordY };
        lay.krukkeH = { x: W - kant - 8 - jb / 2, y: lay.bordY };
        lay.vaegtH = { x: lay.krukkeH.x - jb / 2 - 12 - vb / 2, y: lay.bordY };
        var sk = NK.Sprites.MAAL.vaegt, k = vb / sk.b;
        lay.skaalY = lay.bordY - sk.bund * k + sk.skaalY * k;
        /* Poserne: hoejden af én pose */
        lay.pose = NK.klamp(Math.min(vb * 0.26, (lay.skaalY - zoneTop) * 0.42), 26, 58);
        /* Reaktionspilen mellem vaegtene */
        lay.pilX0 = lay.vaegtV.x + vb / 2 + 14;
        lay.pilX1 = lay.vaegtH.x - vb / 2 - 14;
        lay.pilY = Math.max(zoneTop + 26, lay.skaalY - lay.pose * 1.9);
        /* Ventepladsen for de nye poser: paa bordet under pilen */
        lay.venteX = (lay.pilX0 + lay.pilX1) / 2;
        this.lay = lay;
        this.saetAnker("skema", lay.tavle.x, lay.tavle.y, lay.tavle.b, tH);
        this.saetAnker("vaegte", kant, zoneTop, W - 2 * kant, lay.bordY - zoneTop + 10);
        this.saetAnker("boble", this.k.lay.boble.x, this.k.lay.boble.y, this.k.lay.boble.b, this.k.lay.boble.h);
        this.saetAnker("laerer", this.k.lay.desk.x, baand.y, this.k.lay.desk.b, baand.h);
    };

    /* ----- Scenen foelger skemaet ------------------------------------------------------ */
    P.efterLoest = function (id) {
        if (id === this.jK + "_n") this.a = { fase: 1, t: 0 };
        else if (id === this.jS + "_n") this.a = { fase: 2, t: 0 };
        else if (id === this.jS + "_m") this.a = { fase: 3, t: 0 };
    };

    P.slutLinje = function () {
        var o = this.x.o;
        return D.tekstMasse(this.x.m) + " g " + D.stof(o.kendt).formel + " giver " +
            D.tekstMasse(this.opg.m[this.jS]) + " g " + D.stof(o.soegt).formel + ".";
    };

    P.opdaterScene = function (dt) {
        var a = this.a;
        if (!a) return;
        a.t += dt;
        var mS = this.opg.m[this.jS];
        /* Displayene: venstre falder til 0, naar poserne er gaaet; hoejre
           taeller op, naar de nye er paa vaegten */
        if (a.fase >= 2 && a.t > 0.9) this.visVenstre = NK.mod(this.visVenstre, 0, 6, dt);
        if (a.fase === 3 && a.t > 0.8) {
            this.visHoejre = NK.mod(this.visHoejre, mS, 5, dt);
            if (Math.abs(this.visHoejre - mS) < 0.005) this.visHoejre = mS;
        }
    };

    /* Pladserne for poserne paa en vaegt eller paa bordet */
    P.pladser = function (n, cx, bund) {
        return Tg.posePladser(n, cx, bund, this.lay.pose, 3);
    };

    function bue(p0, p1, t, hoejde) {
        var u = NK.blod(t);
        return { x: NK.lerp(p0.x, p1.x, u), y: NK.lerp(p0.y, p1.y, u) - Math.sin(u * Math.PI) * hoejde };
    }

    /* ----- Tegning --------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay || !this.opg) return;
        var o = this.x.o, stK = D.stof(o.kendt), stS = D.stof(o.soegt);
        var a = this.a, puls = 0.55 + 0.45 * Math.sin(this.tid * 6);
        var fh = this.skema.fremhaev;
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 6);
        Tg.tavle(ctx, lay.tavle);
        this.skema.tegn(ctx, this.tid);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.baand.y);

        /* Krukkerne */
        Tg.krukke(ctx, lay.krukkeV.x, lay.krukkeV.y, lay.jh, stK, { fremhaev: fh === this.jK + "_n" ? puls : 0 });
        Tg.krukke(ctx, lay.krukkeH.x, lay.krukkeH.y, lay.jh, stS, { fyld: 0.3, fremhaev: fh === this.jS + "_m" ? puls : 0 });

        /* Vaegtene */
        var vV = Tg.vaegt(ctx, lay.vaegtV.x, lay.vaegtV.y, lay.vb, Tg.gram(this.visVenstre), { lys: fh === this.jK + "_n" ? puls : 0 });
        var vH = Tg.vaegt(ctx, lay.vaegtH.x, lay.vaegtH.y, lay.vb, Tg.gram(this.visHoejre), { lys: a.fase === 3 ? 0.6 : 0 });
        var bb = vV.b * 0.72;
        /* Pulveret i baaden til venstre: forsvinder, mens poserne kommer */
        var tBunke = a.fase === 0 ? 1 : (a.fase === 1 ? 1 - NK.klamp(a.t / 0.7, 0, 1) : 0);
        Tg.bunke(ctx, vV.x, vV.y, bb, stK, tBunke, lay.pose * 0.7, 3);
        Tg.bunke(ctx, vH.x, vH.y, bb, stS, 0, lay.pose * 0.7, 5);

        /* Reaktionspilen med forholdet */
        var r = this.opg.r, lK = r.led[this.jK], lS = r.led[this.jS];
        var pilTekst = (lK.k > 1 ? lK.k + " " : "") + stK.formel + " ⟶ " + (lS.k > 1 ? lS.k + " " : "") + stS.formel;
        var pilLys = a.fase === 2 && a.t > 0.5 && a.t < 1.6 ? 0.8 : (fh === this.jS + "_n" ? puls : 0);
        Tg.reaktionsPil(ctx, lay.pilX0, lay.pilX1, lay.pilY, pilTekst, { lys: pilLys });

        this.tegnPoser(ctx, vV, vH, stK, stS);

        /* Pilen, der viser vejen fra pulveret, foer eleven er i gang */
        if (a.fase === 0 && this.hjaelp === 0 && !this.status[this.nr].loest) {
            /* Pilen gaar fra pulveret til feltet, hvor stofmaengden skrives */
            var felt = this.skema.feltRekt(this.jK + "_n");
            if (felt) Tg.buePil(ctx, vV.x + vV.b * 0.35, vV.y - lay.pose * 0.9, felt.cx, felt.y + felt.h + 6, this.tid);
        }

        this.k.tegn(ctx);
    };

    /* Poserne: paa vaegten til venstre (fase 1), paa vej gennem pilen
       (fase 2), paa bordet under pilen og til sidst paa vaegten til hoejre */
    P.tegnPoser = function (ctx, vV, vH, stK, stS) {
        var lay = this.lay, a = this.a, s = lay.pose;
        var nK = this.opg.n[this.jK], nS = this.opg.n[this.jS];
        var fraV = this.pladser(nK, vV.x, vV.y - 3);
        var vente = this.pladser(nS, lay.venteX, lay.bordY);
        var paaH = this.pladser(nS, vH.x, vH.y - 3);
        var pilStart = { x: lay.pilX0 + 8, y: lay.pilY }, pilSlut = { x: lay.pilX1 - 8, y: lay.pilY };
        if (a.fase === 1) {
            fraV.forEach(function (p, i) {
                var t = NK.klamp((a.t - 0.2 - i * 0.14) / 0.35, 0, 1);
                if (t <= 0) return;
                Tg.pose(ctx, p.x, p.y, s * NK.pop(t), stK, { andel: p.andel });
            });
        } else if (a.fase === 2) {
            /* De kendte poser loefter sig og gaar ind i pilen */
            fraV.forEach(function (p, i) {
                var t = NK.klamp((a.t - i * 0.12) / 0.7, 0, 1);
                var q = bue(p, pilStart, t, s * 0.9);
                Tg.pose(ctx, q.x, q.y, s * (1 - 0.5 * t), stK, { andel: p.andel, alfa: 1 - NK.klamp((t - 0.75) / 0.25, 0, 1) });
            });
            /* De nye kommer ud i forholdet og lander paa bordet */
            vente.forEach(function (p, i) {
                var t = NK.klamp((a.t - 1.0 - i * 0.14) / 0.7, 0, 1);
                if (t <= 0) return;
                var q = bue(pilSlut, p, t, s * 0.5);
                Tg.pose(ctx, q.x, q.y, s * (0.5 + 0.5 * t), stS, { andel: p.andel, alfa: NK.klamp(t * 3, 0, 1) });
            });
        } else if (a.fase >= 3) {
            paaH.forEach(function (p, i) {
                var t = NK.klamp((a.t - i * 0.1) / 0.6, 0, 1);
                var q = bue(vente[i], p, t, s * 0.8);
                Tg.pose(ctx, q.x, q.y, s, stS, { andel: p.andel });
            });
        }
    };

    /* ----- Musen ---------------------------------------------------------------------- */
    P.klikScene = function (pt) {
        var lay = this.lay, o = this.x.o;
        if (!lay) return false;
        var dx = Math.abs(pt.x - lay.vaegtV.x), dx2 = Math.abs(pt.x - lay.vaegtH.x);
        if (pt.y > lay.skaalY - lay.pose * 2 && pt.y < lay.bordY) {
            if (dx < lay.vb / 2) {
                this.kortBesked(D.tekstMasse(this.x.m) + " g " + D.stof(o.kendt).formel + ". Den masse står også i skemaet.", 4);
                return true;
            }
            if (dx2 < lay.vb / 2) {
                this.kortBesked(this.faerdig ? "Den vejer det, du regnede ud." : "Den er tom, til du har regnet massen ud.", 4);
                return true;
            }
        }
        return false;
    };

    P.overScene = function (pt) {
        if (!pt || !this.lay) return null;
        var lay = this.lay;
        if (pt.y > lay.skaalY - lay.pose * 2 && pt.y < lay.bordY &&
            (Math.abs(pt.x - lay.vaegtV.x) < lay.vb / 2 || Math.abs(pt.x - lay.vaegtH.x) < lay.vb / 2)) return "vaegt";
        return null;
    };

    NK.SimVej = SimVej;
}());
