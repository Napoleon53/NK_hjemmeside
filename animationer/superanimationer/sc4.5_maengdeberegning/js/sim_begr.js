/* =====================================================================
   sim_begr.js - fane 3: begraensende maengde

   To reaktanter med kendt masse (den gamle c4.5 opgave 4 med magnesium
   og saltsyre og fem andre). Eleven regner begge stofmaengder, vaelger
   det stof, der slipper op foerst, og regner saa produktet.

   Paa bordet ligger hvert stof foerst som et skilt med massen. Naar
   stofmaengden er fundet, staar stoffet som poser med 1 mol. Efter
   valget reagerer poserne i hele saet efter skemaet: et saet er lige
   saa mange poser af hvert stof, som koefficienterne siger. Det, der
   er til overs, faar en orange ring. Vaelger eleven forkert, sker det
   samme; saa ses det, hvad der slap op, og forklaringen kommer bagefter.
   Produktets poser kommer foerst ud af pilen, naar eleven har regnet dets
   stofmaengde; foer det ville antallet af poser vaere facit.

   Tallene: foerste gang de tal, der staar i D.BEGR. "Nye tal" traekker
   nye, hvor det begraensende stof giver 1 til 3 hele saet, og der er
   0,5 til 2 mol af det andet til overs.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;

    var SAET_TID = 1.25;     /* sekunder pr. saet */
    var SAET_AFSTAND = 0.55; /* forskydningen mellem to saet */

    function SimBegr() {
        this.startFane();
        this.brugt = {};
        this.bygValg();
        this.introNu = true;
        this.nr = -1;
        var i = this.naesteUloeste();
        this.vaelg(i >= 0 ? i : 0, false);
    }

    var P = SimBegr.prototype;

    NK.Fane.paa(P, { navn: "begr", opgaver: D.BEGR, naesteFane: null });

    /* ----- Tallene ---------------------------------------------------------------------
       Et saet med det begraensende stof L og det andet stof E: nL = kL · saet,
       nE = kE · saet + rest. */
    P.muligeTal = function (o) {
        var r = D.reaktion(o.r), ud = [];
        [o.a, o.b].forEach(function (L) {
            var E = L === o.a ? o.b : o.a;
            var kL = r.led[D.plads(r, L)].k, kE = r.led[D.plads(r, E)].k;
            [1, 2, 3].forEach(function (saet) {
                if (kL * saet > D.BEGR_MAKS) return;
                [0.5, 1, 1.5, 2].forEach(function (rest) {
                    if (kE * saet + rest > D.BEGR_MAKS) return;
                    if (rest / kE / saet < 0.2) return;
                    ud.push({ L: L, saet: saet, rest: rest });
                });
            });
        });
        return ud;
    };

    P.lavSpec = function (i, nyeTal) {
        var o = D.BEGR[i], r = D.reaktion(o.r);
        var tal = o.std;
        if (nyeTal || this.brugt[o.id]) {
            var mulige = this.muligeTal(o), sidst = this.brugt[o.id];
            var andre = mulige.filter(function (t) { return !sidst || t.L !== sidst.L || t.saet !== sidst.saet || t.rest !== sidst.rest; });
            tal = NK.tilfaeldig(andre.length ? andre : mulige);
        }
        this.brugt[o.id] = tal;
        var L = tal.L, E = L === o.a ? o.b : o.a;
        var kL = r.led[D.plads(r, L)].k, kE = r.led[D.plads(r, E)].k;
        var n = {};
        n[L] = kL * tal.saet;
        n[E] = kE * tal.saet + tal.rest;
        var givet = {};
        [o.a, o.b].forEach(function (s) { givet[s] = Math.round(n[s] * D.stof(s).M) / 100; });
        this.x = { o: o, tal: tal, L: L, E: E, n: n, givet: givet };
        return {
            r: r, givet: givet, kilde: L, visM: [o.a, o.b, o.p],
            spoerg: [[o.a, "n"], [o.b, "n"], "valg", [o.p, "n"], [o.p, "m"]]
        };
    };

    P.promptHTML = function () {
        var o = this.x.o, g = this.x.givet;
        return '<p class="opgave-prompt">' + D.tekstMasse(g[o.a]) + " g " + D.stof(o.a).formel + " + " +
            D.tekstMasse(g[o.b]) + " g " + D.stof(o.b).formel + "</p>" +
            '<p class="opgave-spm">' + NK.html(o.tekst) + "</p>";
    };

    P.nyOpgave = function () {
        var r = this.opg.r, o = this.x.o;
        this.jA = D.plads(r, o.a);
        this.jB = D.plads(r, o.b);
        this.jP = D.plads(r, o.p);
        this.a = { fase: 0, t: 0 };
        this.saet = this.x.tal.saet;
        this.valgtJ = -1;
        this.pTid = null;
        this.visValg();
    };

    /* ----- Valget ---------------------------------------------------------------------------- */
    P.bygValg = function () {
        var mig = this;
        this.el.valg = NK.el("begr-valg");
        this.el.valg.addEventListener("click", function (e) {
            var k = e.target.closest ? e.target.closest("button[data-j]") : null;
            if (k) mig.vaelgBegr(parseInt(k.getAttribute("data-j"), 10), "gaet");
        });
    };

    P.visValg = function () {
        if (!this.opg) return;
        var aktiv = this.skema.naeste() === "valg";
        var o = this.x.o;
        if (aktiv) {
            var html = "";
            [[this.jA, o.a], [this.jB, o.b]].forEach(function (x) {
                html += '<button class="knap" type="button" data-j="' + x[0] + '">' + D.stof(x[1]).formel + " slipper op først</button>";
            });
            NK.saetHTML("begr-valg", html);
        }
        this.el.valg.hidden = !aktiv;
    };

    P.valgTekst = function () {
        var o = this.x.o;
        return "Hvem slipper op først? Vælg " + D.stof(o.a).formel + " eller " + D.stof(o.b).formel + ".";
    };

    P.valgHint = function () {
        var r = this.opg.r, o = this.x.o;
        var kA = r.led[this.jA].k, kB = r.led[this.jB].k;
        return "Del hver stofmængde med sin koefficient: n(" + D.stof(o.a).formel + ") / " + kA + " og n(" +
            D.stof(o.b).formel + ") / " + kB + ". Det mindste tal slipper op først.";
    };

    /* Den paene begrundelse til panelet */
    P.valgHTML = function () {
        var r = this.opg.r, o = this.x.o, n = this.opg.n, br = NK.Skema.broek;
        var kA = r.led[this.jA].k, kB = r.led[this.jB].k;
        var A = D.stof(o.a).formel, B = D.stof(o.b).formel;
        return br("n(" + A + ")", kA) + " = " + br(D.tekstN(n[this.jA]) + " mol", kA) + " = " + D.tekstN(n[this.jA] / kA) + " mol og " +
            br("n(" + B + ")", kB) + " = " + br(D.tekstN(n[this.jB]) + " mol", kB) + " = " + D.tekstN(n[this.jB] / kB) + " mol. " +
            "<b>" + D.stof(this.x.L).formel + " slipper op først.</b>";
    };

    /* maade: "gaet" (eleven vaelger), eller "svar" (knappen Vis svaret) */
    P.vaelgBegr = function (j, maade) {
        var o = this.opg;
        if (!o || this.skema.naeste() !== "valg") return;
        var rigtig = j === o.kilde;
        o.valgt = true;
        this.valgtJ = j;
        this.valgRigtig = rigtig && maade !== "svar";
        if (!this.valgRigtig) this.brugtSvar = true;
        this.hjaelp = 0;
        this.ekstra.push({ trin: "valg", html: this.valgHTML(), svar: !this.valgRigtig });
        this.a = { fase: 1, t: 0 };
        this.visValg();
        this.visLinjer();
        this.visKnap();
        this.skema.byg();
        var L = D.stof(this.x.L).formel, E = D.stof(this.x.E).formel;
        /* Valget er delopgaven: Kemichael tier, medmindre han blev bedt om svaret */
        if (maade === "svar") {
            var svar = L + " slipper op først, og " + E + " er til overs. Se poserne.";
            if (!this.k.sig(svar, "svar", { lukVedSkriv: true })) this.besked(svar, "gul");
            else this.besked("Se, hvad der sker.", "");
        } else {
            this.k.tie();
            this.besked(rigtig ? "Rigtigt gættet. Se poserne reagere i hele sæt." : "Se, hvad der sker.", rigtig ? "god" : "");
        }
    };

    /* Efter reaktionen: forklaringen og naeste skridt */
    P.efterReaktion = function () {
        var L = D.stof(this.x.L).formel, E = D.stof(this.x.E).formel;
        var linje = L + " slap op. " + E + " er til overs.";
        if (this.valgtJ >= 0 && !this.valgRigtig && this.valgtJ !== this.opg.kilde) {
            var r = this.opg.r, n = this.opg.n;
            var jV = this.valgtJ, jL = this.opg.kilde;
            var V = D.stof(r.led[jV].s).formel;
            if (n[jV] < n[jL]) {
                linje = "Der var færre mol " + V + ", men " + L + " skal bruges " + r.led[jL].k + " ad gangen. " + L + " slap op.";
            } else {
                linje = L + " slap op, ikke " + V + ". Del stofmængderne med koefficienterne.";
            }
            this.besked(linje + " " + this.trinLinje(), "skidt");
            this.fokus();
            return;
        }
        this.naesteLinje(linje, "");
        this.fokus();
    };

    P.efterLoest = function (id) {
        if (id === this.jP + "_n") this.pTid = this.tid;
        this.visValg();
    };

    P.slutLinje = function () {
        return D.tekstMasse(this.opg.m[this.jP]) + " g " + D.stof(this.x.o.p).formel + ".";
    };

    /* ----- Layout ------------------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var baand = this.k.layout(W, H);
        lay.baand = baand;
        var kant = NK.klamp(W * 0.014, 8, 16);
        lay.bordY = Math.round(baand.y - NK.klamp(H * 0.035, 10, 26));
        var tH = NK.klamp(baand.y * 0.56, 190, 400);
        lay.tavle = { x: kant + 6, y: NK.klamp(H * 0.02, 8, 18), b: W - 2 * kant - 12, h: tH };
        var ind = NK.klamp(lay.tavle.b * 0.03, 8, 22);
        this.skema.layout({ x: lay.tavle.x + ind, y: lay.tavle.y + ind * 0.6, b: lay.tavle.b - 2 * ind, h: tH - ind * 1.2 }, this.L.ctx);
        var zoneTop = lay.tavle.y + tH + 18;
        var A = lay.bordY - zoneTop;
        /* Poserne: tre pr. raekke, hoejst to raekker */
        lay.pose = NK.klamp(Math.min(W * 0.065, (A - 50) / 2.2), 22, 62);
        lay.skiltY = lay.bordY - 2;
        lay.poseBund = lay.bordY - 30;
        lay.xA = kant + W * 0.13;
        lay.xB = kant + W * 0.33;
        lay.pilX0 = W * 0.47;
        lay.pilX1 = W * 0.62;
        lay.pilY = Math.max(zoneTop + 30, lay.poseBund - lay.pose * 1.1);
        lay.xP = W * 0.8;
        this.lay = lay;
        this.saetAnker("skema", lay.tavle.x, lay.tavle.y, lay.tavle.b, tH);
        this.saetAnker("bord", kant, zoneTop, W - 2 * kant, lay.bordY - zoneTop + 8);
        this.saetAnker("boble", this.k.lay.boble.x, this.k.lay.boble.y, this.k.lay.boble.b, this.k.lay.boble.h);
        this.saetAnker("laerer", this.k.lay.desk.x, baand.y, this.k.lay.desk.b, baand.h);
    };

    /* ----- Tid ---------------------------------------------------------------------------------- */
    P.reaktionTid = function () { return (this.saet - 1) * SAET_AFSTAND + SAET_TID + 0.4; };

    P.opdaterScene = function (dt) {
        var a = this.a;
        if (!a) return;
        a.t += dt;
        if (a.fase === 1 && a.t >= this.reaktionTid()) {
            this.a = { fase: 2, t: 0 };
            this.efterReaktion();
        }
    };

    /* ----- Tegning ------------------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay || !this.opg) return;
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 6);
        Tg.tavle(ctx, lay.tavle);
        this.skema.tegn(ctx, this.tid);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.baand.y);
        this.tegnBord(ctx);
        this.k.tegn(ctx);
    };

    /* Pladserne for et stofs poser: tre pr. raekke */
    P.pladser = function (n, cx) {
        return Tg.posePladser(n, cx, this.lay.poseBund, this.lay.pose, 3);
    };

    function bue(p0, p1, t, hoejde) {
        var u = NK.blod(t);
        return { x: NK.lerp(p0.x, p1.x, u), y: NK.lerp(p0.y, p1.y, u) - Math.sin(u * Math.PI) * hoejde };
    }

    P.tegnBord = function (ctx) {
        var lay = this.lay, o = this.x.o, r = this.opg.r, a = this.a, mig = this;
        var s = lay.pose, puls = 0.55 + 0.45 * Math.sin(this.tid * 6);
        var valgNu = this.skema.naeste() === "valg";
        var stoffer = [
            { j: this.jA, s: o.a, x: lay.xA },
            { j: this.jB, s: o.b, x: lay.xB }
        ];
        var pilStart = { x: lay.pilX0 + 6, y: lay.pilY }, pilSlut = { x: lay.pilX1 - 6, y: lay.pilY };
        var tekst = r.led.filter(function (l) { return l.side === 0; }).map(function (l) {
            return (l.k > 1 ? l.k + " " : "") + D.stof(l.s).formel;
        }).join(" + ") + " ⟶ " + (r.led[this.jP].k > 1 ? r.led[this.jP].k + " " : "") + D.stof(o.p).formel;
        Tg.reaktionsPil(ctx, lay.pilX0, lay.pilX1, lay.pilY, tekst, { lys: a.fase === 1 ? 0.7 : 0 });

        /* Reaktanterne */
        stoffer.forEach(function (x) {
            var st = D.stof(x.s), nLoest = mig.skema.celle(x.j + "_n").status;
            var vist = nLoest === "ok" || nLoest === "svar";
            /* Skiltet med massen */
            Tg.maerkat(ctx, x.x, lay.skiltY - 12, D.tekstMasse(mig.x.givet[x.s]) + " g " + st.formel,
                { farve: "#e9e6dc", px: NK.klamp(s * 0.34, 12, 14) });
            if (!vist) return;
            var n = mig.opg.n[x.j], k = r.led[x.j].k;
            var pl = mig.pladser(n, x.x);
            var tilbageX = [], tilbageY = lay.poseBund;
            /* Hvor mange hele poser der bruges: k pr. saet */
            var bruges = a.fase >= 1 ? k * mig.saet : 0;
            var hele = pl.filter(function (p) { return p.andel >= 1; }).length;
            pl.forEach(function (p, i) {
                /* De hele poser bruges fra hoejre mod venstre */
                var nrHel = p.andel >= 1 ? hele - 1 - i : -1;
                var brugt = nrHel >= 0 && nrHel < bruges;
                if (brugt) {
                    var saetNr = Math.floor(nrHel / k);
                    var t = a.fase === 1 ? NK.klamp((a.t - saetNr * SAET_AFSTAND) / (SAET_TID * 0.5), 0, 1) : 1;
                    if (t >= 1) return;
                    var q = bue(p, pilStart, t, s * 0.9);
                    Tg.pose(ctx, q.x, q.y, s * (1 - 0.45 * t), st, { andel: p.andel, alfa: 1 - NK.klamp((t - 0.7) / 0.3, 0, 1) });
                    return;
                }
                var rest = a.fase === 2;
                var lys = valgNu ? puls * 0.8 : 0;
                Tg.pose(ctx, p.x, p.y, s, st, { andel: p.andel, rest: rest, lys: lys });
                tilbageX.push(p.x);
                tilbageY = Math.min(tilbageY, p.y - s * (p.andel >= 1 ? 1.14 : 0.92));
            });
            if (a.fase === 2) {
                var tilbage = n - bruges;
                /* Maerkatet staar over de poser, der er tilbage */
                var mx = tilbageX.length ? tilbageX.reduce(function (u, v) { return u + v; }, 0) / tilbageX.length : x.x;
                if (tilbage > 0.01) Tg.maerkat(ctx, mx, tilbageY - 16, "til overs", { px: 12 });
                else Tg.maerkat(ctx, x.x, lay.poseBund - s * 0.5, "sluppet op", { px: 12, farve: "#9aa3b0" });
            }
        });

        /* Produktet: poserne kommer foerst ud af pilen, naar eleven har regnet
           stofmaengden. Foer det ville antallet af poser vaere facit. */
        var stP = D.stof(o.p);
        if (this.pTid !== null) {
            var plP = this.pladser(this.opg.n[this.jP], lay.xP), dtP = this.tid - this.pTid;
            plP.forEach(function (p, i) {
                var t = NK.klamp((dtP - i * 0.14) / 0.6, 0, 1);
                if (t <= 0) return;
                var q = bue(pilSlut, p, t, s * 0.5);
                Tg.pose(ctx, q.x, q.y, s * (0.55 + 0.45 * t), stP, { andel: p.andel, alfa: NK.klamp(t * 3, 0, 1) });
            });
        }
        var mP = this.skema.celle(this.jP + "_m").status;
        if (mP === "ok" || mP === "svar") {
            Tg.maerkat(ctx, lay.xP, lay.skiltY - 12, D.tekstMasse(this.opg.m[this.jP]) + " g " + stP.formel,
                { farve: "#bfe8cf", px: NK.klamp(s * 0.34, 12, 14) });
        }

        /* Forklaringen: én pose er 1 mol */
        var nA = this.skema.celle(this.jA + "_n").status;
        if (nA === "ok" || nA === "svar") {
            ctx.save();
            ctx.fillStyle = "#9aa3b0";
            ctx.font = Tg.font("600", 12);
            ctx.textAlign = "right";
            ctx.textBaseline = "top";
            ctx.fillText("1 pose = 1 mol", lay.W - 16, lay.tavle.y + lay.tavle.h + 16);
            ctx.restore();
        }
    };

    /* ----- Musen: poserne kan vaelges ------------------------------------------------------------ */
    P.hvilket = function (pt) {
        var lay = this.lay;
        if (!lay) return -1;
        var s = lay.pose;
        if (pt.y < lay.poseBund - s * 2.2 || pt.y > lay.bordY) return -1;
        if (Math.abs(pt.x - lay.xA) < s * 1.6) return this.jA;
        if (Math.abs(pt.x - lay.xB) < s * 1.6) return this.jB;
        return -1;
    };

    P.overScene = function (pt) {
        if (!pt || this.skema.naeste() !== "valg") return null;
        return this.hvilket(pt) >= 0 ? "pose" : null;
    };

    P.klikScene = function (pt) {
        var j = this.hvilket(pt);
        if (j < 0) return false;
        if (this.skema.naeste() === "valg") { this.vaelgBegr(j, "gaet"); return true; }
        var st = this.skema.stof(j), c = this.skema.celle(j + "_n");
        if (c.status === "ok" || c.status === "svar") this.kortBesked(D.tekstN(this.opg.n[j]) + " mol " + st.formel + ". Én pose er 1 mol.", 4);
        else this.kortBesked(D.tekstMasse(this.x.givet[st.id]) + " g " + st.formel + ". Regn stofmængden ud i skemaet.", 4);
        return true;
    };

    NK.SimBegr = SimBegr;
}());
