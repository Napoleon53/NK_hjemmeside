/* =====================================================================
   sim_beregning.js - fane 2: beregningen

   To opgaver: maaling 1 og 2 fra fane 1 (eller et eksempel). I hvert
   trin skriver eleven formlen, mellemregningen i felter (med rigtig
   broekstreg) og resultatet med enhed: n(Fe) = m(Fe) / M(Fe),
   n(FeO) = n(Fe) (forholdet 2 : 2) og m(FeO) = n(FeO) · M(FeO). I maaling
   2 staar formlerne der i forvejen. Maaling 1 slutter med spoergsmaalet,
   hvorfor vaegten viste mindre end beregnet (som i den gamle c4.8).

   Over tavlen staar opgavens spoergsmaal. Paa bordet staar tre soejler:
   stålulden foer, det vaegten viste efter, og det, der er regnet ud.
   Den graa del er jernet, den roede ilten. Den sidste soejle staar
   stiplet med et "?", til massen af FeO er regnet.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    function SimBeregning() {
        this.over = null;
        this.startFane(D.BEREGNING);
        this.el.valg = NK.el("beregning-valg");
        this.regning = new NK.Regning({ vaert: NK.el("beregning-raekker"), fane: this });
        this.introNu = true;
        this.vaelg(0, false);
    }

    var P = SimBeregning.prototype;
    NK.Fane.paa(P, { navn: "beregning", naesteFane: "fane-forsoeg", naesteNavn: "Forsøget", slutTekst: "Tilbage til Forsøget →" });
    NK.Regning.paa(P);

    /* ----- Opgaven -------------------------------------------------------------- */
    P.lavOpgave = function (i) {
        var spec = D.BEREGNING[i];
        var o = { id: spec.id, titel: spec.titel, tal: NK.maaling(spec.maaling), maaling: spec.maaling,
                  kunTal: !!spec.kunTal, spm: !!spec.spm, trin: D.TRINLISTE };
        o.facit = K.facit(o);
        this.opg = o;
        this.spmOk = false;
        this.spmForkert = [];
        this.regning.saet(o);
        this.nyScene();
    };

    P.harNyeTal = function () { return false; };
    P.harForfra = function () { return false; };

    /* Fane 1 har en ny maaling: er opgaven ikke begyndt, bruges den med det samme */
    P.nyeMaalinger = function () {
        if (this.opg && this.regning.k === 0 && !this.faerdig && !this.regningBegyndt()) this.vaelg(this.nr, false);
    };

    P.regningBegyndt = function () {
        var f = this.regning.felter[0];
        if (!f) return false;
        return f.fase !== (this.opg.kunTal ? "indsaet" : "formel") || f.plads[0] !== null || f.plads[1] !== null;
    };

    P.promptHTML = function () {
        var o = this.opg, t = o.tal;
        var s = o.kunTal ? "Måling 2. Formlerne er de samme som i måling 1, så du skriver kun tallene." :
            "Regn ud, hvad stålulden højst kan veje, når den har brændt. Sammenlign med vægten.";
        var note = t.egen ? "" : '<p class="note">Tallene er et eksempel. Lav forsøget på fanen Forsøget for at regne på dine egne.</p>';
        return '<p class="maal-tekst">' + NK.html(s) + "</p>" + note;
    };

    /* Tavlens linjer med opgavens tal */
    P.data = function () {
        var t = this.opg.tal;
        return ["m(Fe) = m(før) = " + K.g2(t.mf) + " g", "m(efter) = " + K.g2(t.me) + " g",
                "M(Fe) = " + K.Mtekst("Fe") + " g/mol", "M(FeO) = " + K.Mtekst("FeO") + " g/mol"];
    };

    /* ----- Spoergsmaalet til sidst i maaling 1 --------------------------------------------- */
    var trinInfoRegning = P.trinInfo, trinLinjeRegning = P.trinLinje;

    P.spmAabent = function () { return this.opg.spm && this.regning.faerdig() && !this.spmOk; };

    P.opgaveFaerdig = function () { return this.regning.faerdig() && (!this.opg.spm || this.spmOk); };

    P.trinLinje = function () {
        if (this.spmAabent()) return "Vælg et af svarene herunder.";
        return trinLinjeRegning.call(this);
    };

    P.trinInfo = function () {
        var mig = this;
        if (this.spmAabent()) {
            var ret = D.HVORFOR.svar.map(function (s) { return !!s.ok; }).indexOf(true);
            return { hint: NK.html(D.HVORFOR.hint), svar: function () { mig.vaelgSvar(ret, "svar"); } };
        }
        return trinInfoRegning.call(this);
    };

    P.visKortEkstra = function () {
        var e = this.el.valg, mig = this, H = D.HVORFOR;
        if (!this.opg.spm || !this.regning.faerdig()) { e.hidden = true; e.innerHTML = ""; return; }
        e.hidden = false;
        e.innerHTML = '<p class="opgave-spm">' + NK.html(H.spm) + "</p>";
        H.svar.forEach(function (s, j) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "knap";
            b.textContent = s.t;
            var brugt = mig.spmForkert.indexOf(j) >= 0;
            if (mig.spmOk || brugt) b.disabled = true;
            if (brugt) b.classList.add("forkert");
            if (mig.spmOk && s.ok) b.classList.add("rigtig");
            b.addEventListener("click", function () { mig.vaelgSvar(j, "ok"); });
            e.appendChild(b);
        });
    };

    P.vaelgSvar = function (j, maade) {
        if (!this.spmAabent()) return;
        var s = D.HVORFOR.svar[j];
        if (s.ok) {
            this.spmOk = true;
            this.s.forskel = true;
            this.visKortEkstra();
            this.trinLoest(maade === "svar" ? "svar" : "ok", maade === "svar" ? NK.html("Den rigtige: " + s.t.toLowerCase()) : null);
            return;
        }
        this.brugtSvar = true;
        this.spmForkert.push(j);
        this.hjaelp = 0;
        this.k.tie();
        this.besked(NK.html(s.forkl + " Prøv et af de andre."), "skidt");
        this.visKortEkstra();
        this.visKnap();
    };

    P.slutLinje = function () {
        var o = this.opg, t = o.tal, f = o.facit;
        var s = "Vægten viste " + K.g2(t.me) + " g. Regnet ud: " + K.g2(f.m) + " g.";
        if (o.spm) s += " " + D.HVORFOR.efter.replace("{p}", K.pct(f.pct));
        else {
            s += " Her reagerede ca. " + K.pct(f.pct) + " % af jernet.";
            var t1 = NK.maaling(0), f1 = K.facit({ tal: t1 });
            s += " I måling 1 var det ca. " + K.pct(f1.pct) + " %.";
        }
        return NK.html(s);
    };

    /* ----- Scenen: de tre soejler ---------------------------------------------------------- */
    P.nyScene = function () {
        this.s = { teori: false, pop: 1, forskel: false };
    };

    P.efterTrin = function (id) {
        if (id === "m_feo") { this.s.teori = true; this.s.pop = 0; }
        this.visKortEkstra();
    };

    P.opdaterScene = function (dt) {
        if (this.s && this.s.pop < 1) this.s.pop = Math.min(1, this.s.pop + dt * 1.6);
    };

    /* ----- Musen ------------------------------------------------------------------ */
    P.hvad = function (pt) {
        var lay = this.lay;
        if (!lay || !pt) return null;
        for (var i = 0; i < lay.soejler.length; i++) {
            var sj = lay.soejler[i];
            if (pt.x >= sj.x - sj.b / 2 - 6 && pt.x <= sj.x + sj.b / 2 + 6 && pt.y >= lay.bordY - lay.sh - 24 && pt.y <= lay.bordY) return "s" + i;
        }
        return null;
    };

    P.overScene = function (pt) {
        this.over = this.hvad(pt);
        return this.over;
    };

    P.nedScene = function (pt) {
        var u = this.hvad(pt), o = this.opg, t = o.tal, f = o.facit;
        if (u === "s0") this.kortBesked("Stålulden før: " + K.g2(t.mf) + " g jern.");
        if (u === "s1") this.kortBesked("Vægten efter: " + K.g2(t.mf) + " g jern og " + K.g2(K.r2(t.me - t.mf)) + " g ilt, der har bundet sig.");
        if (u === "s2") {
            this.kortBesked(this.s.teori ? "Hvis alt jernet bliver til FeO: " + K.g2(f.m) + " g. Den røde del er ilten." :
                "Den kommer, når du har regnet massen af FeO ud.");
        }
        return false;
    };

    /* ----- Layout -------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h, ctx = this.L.ctx;
        var baand = this.k.layout(W, H);
        var Hs = baand.y;
        var lay = { W: W, H: H, Hs: Hs };
        lay.bordY = Math.round(Hs - NK.klamp(Hs * 0.08, 26, 44));
        lay.ot = Tg.overTavle(ctx, D.OVER_TAVLE, W - 60, NK.klamp(W / 44, 15, 20), 13);
        lay.otY = 12;
        var top = lay.otY + lay.ot.h + 14;
        /* Tavlen faar den hoejde, regnestykket skal bruge; resten gaar til soejlerne */
        lay.f = NK.klamp(Math.min(W / 40, Hs / 26), 13, 21);
        var tm = this.regning.tavleMaal(ctx, W - 32, this.data(), lay.f);
        while ((tm.h > (Hs - top) * 0.62 || lay.bordY - (top + tm.h + 22) < 100) && lay.f > 12.5) {
            lay.f -= 0.5;
            tm = this.regning.tavleMaal(ctx, W - 32, this.data(), lay.f);
        }
        var tavleH = Math.round(Math.max(120, tm.h));
        lay.tavle = { x: 16, y: top, b: W - 32, h: tavleH };
        var fri = lay.bordY - (top + tavleH + 22);
        /* Soejlerne faar resten; paa en lille skaerm bliver de lave */
        lay.sh = NK.klamp(fri - 26, 24, 230);
        var sb = NK.klamp(Math.min(W * 0.1, lay.sh * 0.6), 40, 90);
        lay.soejler = [0.24, 0.5, 0.76].map(function (a) { return { x: W * a, b: sb }; });
        this.lay = lay;
        this.saetAnker("opgave", 10, lay.otY - 4, W - 20, lay.ot.h + 8);
        this.saetAnker("tavle", lay.tavle.x, lay.tavle.y, lay.tavle.b, lay.tavle.h);
        this.saetAnker("soejler", W * 0.12, lay.bordY - lay.sh - 30, W * 0.76, lay.sh + 60);
        this.saetAnker("laerer", 0, baand.y, W * 0.45, baand.h);
    };

    /* ----- Tegn ----------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, s = this.s, o = this.opg;
        if (!lay || !s) return;
        this.L.ryd();
        Tg.rum(ctx, lay.W, lay.Hs, lay.bordY + 12);
        Tg.tegnOverTavle(ctx, lay.ot, 16, lay.otY);
        this.regning.tegnTavle(ctx, lay.tavle, this.data(), D.REAKTION, this.tid, lay.f);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.Hs);

        /* Soejlerne: hoejden foelger massen, og den stoerste er den, der er regnet ud */
        var t = o.tal, f = o.facit;
        var skala = (lay.sh - 6) / Math.max(f.mTeori, t.me);
        var hFe = t.mf * skala;
        var sj = lay.soejler, over = this.over;
        var tekstY = lay.bordY + 12 + (lay.Hs - lay.bordY - 12) / 2;
        var px = NK.klamp(sj[0].b * 0.22, 13, 16);
        function under(tekst, x, farve) {
            NK.tekst(ctx, tekst, x, tekstY, { font: Tg.font("700", px), justering: "center", linje: "middle", farve: farve || "#f5dd8a" });
        }
        Tg.soejle(ctx, sj[0].x, lay.bordY, sj[0].b, hFe, 0, { titel: "Før", lys: over === "s0" });
        under(K.g2(t.mf) + " g", sj[0].x);
        var hTeori = f.m * skala;
        var mangler = s.forskel ? Math.max(0, hTeori - t.me * skala) : 0;
        Tg.soejle(ctx, sj[1].x, lay.bordY, sj[1].b, hFe, (t.me - t.mf) * skala, { titel: "Vægten efter", lys: over === "s1", mangler: mangler });
        under(K.g2(t.me) + " g", sj[1].x);
        if (s.teori) {
            Tg.soejle(ctx, sj[2].x, lay.bordY, sj[2].b, hFe, hTeori - hFe, { titel: "Regnet ud", lys: over === "s2", pop: s.pop });
            under(K.g2(f.m) + " g", sj[2].x, "#7ee0a8");
        } else {
            Tg.soejle(ctx, sj[2].x, lay.bordY, sj[2].b, 0, 0, { titel: "Regnet ud", lys: over === "s2", stiplet: t.me * skala });
            under("? g", sj[2].x, "#aab3bf");
        }
        this.k.tegn(ctx);
    };

    NK.SimBeregning = SimBeregning;
}());
