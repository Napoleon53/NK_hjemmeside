/* =====================================================================
   sim_beregning.js - fane 2: beregningen

   Tre opgaver: maaling 1 og 2 fra fane 1 (eller et eksempel) og én,
   der gaar baglaens fra kalkindholdet til det, vaegten falder. I hvert
   trin skriver eleven formlen og saa tallet; i maaling 2 staar
   formlerne der, som i vejledningen. Omskifteren i toplinjen vaelger
   vejen: uden mol (m(CaCO₃) = m(CO₂) · 2,27) eller med mol (n = m / M,
   forholdet 1 : 1 og m = n · M).

   Tavlen viser reaktionen, opgavens tal og beregningerne. Under den
   staar kaeden, der bliver udfyldt, mens eleven regner: CO₂-skyen,
   kalken i en vejebaad og soejlen med proeven, hvor kalken er den hvide
   del. Opsummeringen i panelet er vejledningens skema.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var T = NK.Tjek;
    var Tg = NK.Tegn;

    function SimBeregning() {
        this.sidstTal = {};
        this.over = null;
        this.opsum = [{}, {}];
        this.startFane(D.BEREGNING);
        this.regning = new NK.Regning({ vaert: NK.el("beregning-raekker"), fane: this });
        this.introNu = true;
        this.vaelg(0, false);
    }

    var P = SimBeregning.prototype;
    NK.Fane.paa(P, { navn: "beregning", naesteFane: "fane-fejl", naesteNavn: "Fejlkilder" });
    NK.Regning.paa(P);

    /* ----- Opgaven -------------------------------------------------------------- */
    P.lavOpgave = function (i, nyeTal) {
        var spec = D.BEREGNING[i], tal;
        if (spec.baglaens) tal = nyeTal ? this.traek(spec.tal, this.sidstTal[spec.id]) : (this.sidstTal[spec.id] || spec.tal[0]);
        else tal = NK.maaling(spec.maaling);
        this.sidstTal[spec.id] = tal;
        var niveau = NK.niveau === "nf" ? "nf" : "mol";
        var o = { id: spec.id, titel: spec.titel, tal: tal, niveau: niveau, baglaens: !!spec.baglaens, kunTal: !!spec.kunTal,
                  maaling: spec.maaling, trin: D.VEJE[niveau][spec.baglaens ? "bag" : "maaling"] };
        o.facit = K.facit(o);
        this.opg = o;
        this.regning.saet(o);
        if (!o.baglaens) this.opsum[o.maaling] = {};
        this.nyScene();
        this.visOpsum();
    };

    P.harNyeTal = function () { return !!(this.opg && this.opg.baglaens); };
    P.harForfra = function () { return false; };

    /* Omskifteren er flyttet: samme opgave, ny vej */
    P.nytNiveau = function () { this.vaelg(this.nr, false); };

    /* Fane 1 har en ny maaling: er opgaven ikke begyndt, bruges den med det samme */
    P.nyeMaalinger = function () {
        if (this.opg && !this.opg.baglaens && this.regning.k === 0 && !this.faerdig) this.vaelg(this.nr, false);
    };

    P.promptHTML = function () {
        var o = this.opg, t = o.tal;
        if (o.baglaens) {
            return '<p class="maal-tekst">' + NK.html("En prøve på " + K.g2(t.m) + " g knust " + t.skal + " indeholder " + t.p +
                " % kalk. Hvor meget falder vægten, når prøven reagerer med saltsyren?") + "</p>";
        }
        var s = o.kunTal ? "Find kalkindholdet i måling 2. Formlerne er de samme som i måling 1, så du skriver kun tallene." :
            "Find kalkindholdet i måling " + (o.maaling + 1) + ".";
        var note = t.egen ? "" : '<p class="note">Tallene er et eksempel. Lav forsøget på fanen Forsøget for at regne på dine egne.</p>';
        return '<p class="maal-tekst">' + NK.html(s) + "</p>" + note;
    };

    /* Tavlens linjer */
    P.info = function () {
        var o = this.opg, t = o.tal;
        return {
            reaktion: "CaCO₃ + 2 HCl → CaCl₂ + CO₂ + H₂O",
            M: o.niveau === "mol" ? ["M(CaCO₃) = " + K.Mtekst("CaCO3") + " g/mol", "M(CO₂) = " + K.Mtekst("CO2") + " g/mol"] : null,
            tal: o.baglaens ? ["m(prøve) = " + K.g2(t.m) + " g", "kalkindhold = " + t.p + " %"] :
                ["m(før) = " + K.g2(t.mf) + " g", "m(efter) = " + K.g2(t.me) + " g"]
        };
    };

    P.slutLinje = function () {
        var o = this.opg, f = o.facit;
        if (o.baglaens) {
            return NK.html("Vægten falder " + K.g(f.mc) + " g. Det er CO₂, der forlader kolben.");
        }
        var p = f.pct, s = "Kalkindholdet er " + K.pct(p) + " %.";
        if (p > 100) s += " Over 100 % kan ikke passe. Noget andet end CO₂ har forladt kolben. Se fanen Fejlkilder.";
        else if (p < 93) s += " Det er lavere end de " + D.TYPISK + ", muslingeskaller typisk har. Fanen Fejlkilder giver bud på hvorfor.";
        else s += " Muslingeskaller har typisk " + D.TYPISK + ".";
        var anden = this.opsum[1 - o.maaling];
        if (anden && anden.pct !== undefined) s += " Den anden måling gav " + K.pct(anden.pct) + " %.";
        if (o.niveau === "mol" && !o.kunTal) s += " Genvejen: " + K.Mtekst("CaCO3") + " / " + K.Mtekst("CO2") + " = 2,27. Derfor kan man også gange m(CO₂) med 2,27.";
        return NK.html(s);
    };

    /* ----- Kaeden i scenen ------------------------------------------------------ */
    P.nyScene = function () {
        this.s = { co2: [], kalk: [], pct: null, fald: false, pop: { co2: 0, kalk: 0, pct: 0 } };
    };

    P.efterTrin = function (id) {
        var o = this.opg, f = o.facit, s = this.s, sum = o.baglaens ? null : this.opsum[o.maaling];
        var tekst = T.facitTekst(id, o);
        if (id === "dm" || id === "mc_f" || id === "mc_n") { s.co2 = s.co2.filter(function (l) { return !/g$/.test(l); }).concat([tekst]); s.pop.co2 = 0; }
        if (id === "n_co2" || id === "nc_k") { s.co2.push(tekst); s.pop.co2 = 0; }
        if (id === "n_kalk" || id === "nk_m") { s.kalk.push(tekst); s.pop.kalk = 0; }
        if (id === "mk_f" || id === "mk_n" || id === "mk_p") { s.kalk.unshift(tekst); s.pop.kalk = 0; }
        if (id === "pct") { s.pct = f.pct; s.pop.pct = 0; }
        if (o.baglaens && (id === "mc_f" || id === "mc_n")) s.fald = true;
        if (sum) {
            if (id === "dm") sum.dm = f.dm;
            if (id === "mk_f" || id === "mk_n") sum.mk = f.mk;
            if (id === "pct") sum.pct = f.pct;
            this.visOpsum();
        }
    };

    /* Vejledningens skema: masse af CO₂, masse af CaCO₃ og kalkindholdet */
    P.visOpsum = function () {
        var mig = this;
        [0, 1].forEach(function (i) {
            var s = mig.opsum[i] || {};
            NK.saetTekst("beregning-o-co2-" + i, s.dm !== undefined ? K.g2(s.dm) + " g" : "");
            NK.saetTekst("beregning-o-kalk-" + i, s.mk !== undefined ? K.g(s.mk) + " g" : "");
            NK.saetTekst("beregning-o-pct-" + i, s.pct !== undefined ? K.pct(s.pct) + " %" : "");
        });
    };

    P.opdaterScene = function (dt) {
        var p = this.s && this.s.pop;
        if (!p) return;
        p.co2 = Math.min(1, p.co2 + dt * 2.5);
        p.kalk = Math.min(1, p.kalk + dt * 2.5);
        p.pct = Math.min(1, p.pct + dt * 1.5);
    };

    /* ----- Musen ------------------------------------------------------------------ */
    P.hvad = function (pt) {
        var lay = this.lay;
        if (!lay || !pt) return null;
        var ks = lay.kaede;
        for (var n in ks) {
            if (!Object.prototype.hasOwnProperty.call(ks, n)) continue;
            var r = ks[n];
            if (pt.x >= r.x - r.b / 2 && pt.x <= r.x + r.b / 2 && pt.y >= r.y0 && pt.y <= lay.bordY) return n;
        }
        return null;
    };

    P.overScene = function (pt) {
        this.over = this.hvad(pt);
        return this.over;
    };

    P.nedScene = function (pt) {
        var u = this.hvad(pt);
        if (u === "co2") this.kortBesked("CO₂ er den masse, kolben tabte. Den forsvandt op i luften.");
        if (u === "kalk") this.kortBesked("Kalken i prøven. Al CO₂ kom fra den.");
        if (u === "pct") this.kortBesked("Hele prøven. Den hvide del er kalk, resten er mest protein og vand.");
        return false;
    };

    /* ----- Layout -------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var baand = this.k.layout(W, H);
        var Hs = baand.y;
        var lay = { W: W, H: H, Hs: Hs };
        lay.bordY = Math.round(Hs - NK.klamp(Hs * 0.05, 12, 30));
        var kh = Math.round(NK.klamp(Hs * 0.3, 100, 190));
        lay.kh = kh;
        lay.tavle = { x: 20, y: 16, b: W - 40, h: Math.max(140, lay.bordY - kh - 44 - 16) };
        var y0 = lay.bordY - kh;
        var bag = this.opg && this.opg.baglaens;
        var xs = bag ? [0.8, 0.5, 0.2] : [0.2, 0.5, 0.8];
        var sb = NK.klamp(kh * 0.34, 34, 60);
        var bb = NK.klamp(kh * 0.95, 90, 160);
        var cr = NK.klamp(kh * 0.36, 36, 66);
        lay.kaede = {
            co2: { x: W * xs[0], b: cr * 2.6, y0: y0 },
            kalk: { x: W * xs[1], b: bb, y0: y0 },
            pct: { x: W * xs[2], b: sb + 40, y0: y0 }
        };
        lay.sb = sb; lay.bb = bb; lay.cr = cr;
        this.lay = lay;
        this.saetAnker("tavle", lay.tavle.x, lay.tavle.y, lay.tavle.b, lay.tavle.h);
        this.saetAnker("kaede", 10, y0 - 12, W - 20, kh + 12);
        this.saetAnker("laerer", 0, baand.y, W * 0.45, baand.h);
    };

    /* ----- Tegn ----------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, s = this.s, o = this.opg;
        if (!lay || !s) return;
        if (lay.bag !== o.baglaens) { this.layout(); lay = this.lay; lay.bag = o.baglaens; }
        this.L.ryd();
        Tg.rum(ctx, lay.W, lay.Hs, lay.bordY + 12);
        this.regning.tegnTavle(ctx, lay.tavle, this.info(), this.tid);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.Hs);
        var kd = lay.kaede, kh = lay.kh;
        var aktiv = this.regning.aktivt();
        var aid = aktiv ? aktiv.id : null;

        /* Pilene mellem leddene */
        var mol = o.niveau === "mol";
        var yp = lay.bordY - kh * 0.45;
        var a1, a2, t1, t2, akt1, akt2;
        if (!o.baglaens) {
            a1 = [kd.co2.x + lay.cr * 1.25, kd.kalk.x - lay.bb * 0.55];
            a2 = [kd.kalk.x + lay.bb * 0.55, kd.pct.x - lay.sb * 0.9];
            t1 = mol ? "÷ M, 1 : 1, · M" : "· 2,27";
            t2 = "÷ m(før) · 100 %";
            akt1 = aid === "mk_f" || aid === "n_co2" || aid === "n_kalk" || aid === "mk_n";
            akt2 = aid === "pct";
        } else {
            a1 = [kd.pct.x + lay.sb * 0.9, kd.kalk.x - lay.bb * 0.55];
            a2 = [kd.kalk.x + lay.bb * 0.55, kd.co2.x - lay.cr * 1.25];
            t1 = "· kalkindhold";
            t2 = mol ? "÷ M, 1 : 1, · M" : "÷ 2,27";
            akt1 = aid === "mk_p";
            akt2 = aid === "mc_f" || aid === "nk_m" || aid === "nc_k" || aid === "mc_n";
        }
        if (a1[1] - a1[0] > 30) Tg.pil(ctx, a1[0], a1[1], yp, t1, akt1);
        if (a2[1] - a2[0] > 30) Tg.pil(ctx, a2[0], a2[1], yp, t2, akt2);

        /* CO₂-skyen */
        var pop = s.pop;
        var cs = 0.85 + 0.15 * NK.pop(pop.co2);
        var co2Linjer = s.co2.length ? s.co2 : ["? g"];
        Tg.sky(ctx, kd.co2.x, lay.bordY - kh * 0.55, lay.cr * cs, co2Linjer, s.co2.length ? 1 : 0.55);
        if (s.fald) {
            NK.tekst(ctx, "Vægten falder " + K.g(o.facit.mc) + " g", kd.co2.x, lay.bordY + 24,
                { font: Tg.font("700", 15), justering: "center", linje: "middle", farve: "#f5dd8a" });
        }

        /* Kalken i vejebaaden */
        var kalkKendt = s.kalk.length > 0;
        ctx.save();
        ctx.globalAlpha = kalkKendt ? 1 : 0.45;
        var mk = o.baglaens ? o.facit.mk_p : (o.facit.mk || 1);
        Tg.bunke(ctx, kd.kalk.x, lay.bordY, lay.bb, "#fbf7ee", NK.klamp(mk / 2, 0.25, 1), NK.klamp(lay.bb * 0.26, 12, 36), 5);
        ctx.restore();
        var ky = lay.bordY - lay.bb * 0.3 - 16;
        var kp = NK.klamp(lay.bb * 0.12, 14, 17);
        var kLinjer = kalkKendt ? s.kalk : ["? g"], kn = kLinjer.length;
        NK.tekst(ctx, "CaCO₃", kd.kalk.x, ky - kn * (kp + 4), { font: Tg.font("800", kp + 1), justering: "center", linje: "middle", farve: "#eef2f6" });
        kLinjer.forEach(function (l, i) {
            var sk = kalkKendt ? 0.85 + 0.15 * NK.pop(pop.kalk) : 1;
            NK.tekst(ctx, l, kd.kalk.x, ky - (kn - 1 - i) * (kp + 4), { font: Tg.font("700", Math.max(13, kp * sk)),
                justering: "center", linje: "middle", farve: kalkKendt ? "#f5dd8a" : "#aab3bf" });
        });

        /* Soejlen med proeven: kalken er kendt fra start, naar der regnes baglaens */
        var mProeve = o.baglaens ? o.tal.m : o.tal.mf;
        var andel = o.baglaens ? o.tal.p / 100 : (s.pct !== null ? s.pct / 100 * NK.blod(pop.pct) : null);
        var pctTekst = o.baglaens ? o.tal.p + " %" : (s.pct !== null ? K.pct(s.pct) + " %" : "? %");
        Tg.soejle(ctx, kd.pct.x, lay.bordY, lay.sb, kh * 0.82, andel, "Prøven " + K.g2(mProeve) + " g", pctTekst);

        this.k.tegn(ctx);
    };

    NK.SimBeregning = SimBeregning;
}());
