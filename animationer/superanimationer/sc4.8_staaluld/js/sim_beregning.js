/* =====================================================================
   sim_beregning.js - fane 2: beregningen

   To opgaver: maaling 1 og 2 fra fane 1 (eller et eksempel). Paa tavlen
   staar et maengdeberegningsskema (js/skema.js): reaktionsskemaet med m,
   M og n under hvert stof. I panelet skriver eleven hvert trin som en
   paen beregning: formlen, mellemregningen i felter (med rigtig
   broekstreg) og resultatet med enhed. Linjen med naeste skridt, fejl
   og hint staar lige under det felt, eleven er ved, med hint-knappen.

   Omskifteren over tavlen vaelger reaktionsskemaet (brugerens oenske
   5. okt. 2026):
     Let:  2 Fe + O₂ → 2 FeO, forholdet 1 : 1 (som den gamle c4.8)
     Svær: 3 Fe + 2 O₂ → Fe₃O₄, forholdet 3 : 1 (det oxid, der mest dannes)
   Linket index.html#svaer vaelger Svær. Hvert skema har sit eget saet
   af loeste opgaver.

   I maaling 2 staar formlerne der i forvejen. Maaling 1 slutter med
   spoergsmaalet, hvorfor vaegten viste mindre end beregnet (som i den
   gamle c4.8).

   Paa bordet staar tre soejler: stålulden foer, det vaegten viste efter,
   og det, der er regnet ud. Den graa del er jernet, den roede ilten. Den
   sidste soejle staar stiplet med et "?", til massen af oxidet er regnet.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    var NOEGLE_SKEMA = "nk-sc4.8-skema";

    function SimBeregning() {
        var mig = this;
        this.over = null;
        this.variant = NK.hent(NOEGLE_SKEMA, D.SKEMAER[0]);
        if (D.SKEMAER.indexOf(this.variant) < 0) this.variant = D.SKEMAER[0];
        this.startFane(D.BEREGNING);
        /* Loest og stjerne for hvert reaktionsskema (det foerste uden suffiks) */
        this.statusFor = {};
        D.SKEMAER.forEach(function (id, i) { mig.statusFor[id] = i === 0 ? mig.status : mig.hentStatus("_" + id); });
        this.status = this.statusFor[this.variant];
        this.el.valg = NK.el("beregning-valg");
        this.el.skift = NK.el("beregning-skift");
        this.el.hjaelp = NK.el("beregning-hjaelp");
        this.skema = new NK.Skema();
        this.regning = new NK.Regning({ vaert: NK.el("beregning-raekker"), fane: this });
        this.bygSkift();
        this.vaelg(0, false);
    }

    var P = SimBeregning.prototype;
    NK.Fane.paa(P, { navn: "beregning", naesteFane: "fane-forsoeg", naesteNavn: "Forsøget", slutTekst: "Tilbage til Forsøget →" });
    NK.Regning.paa(P);

    /* ----- Omskifteren Let / Svær ---------------------------------------------------- */
    P.bygSkift = function () {
        var mig = this, e = this.el.skift;
        e.innerHTML = '<span class="skift-navn">' + NK.html(D.SKEMA_TITEL) + '</span><div class="niveau" role="group" aria-label="' +
            NK.html(D.SKEMA_TITEL) + '"></div>';
        e.title = D.SKEMA_TIP;
        var g = e.querySelector(".niveau");
        D.SKEMAER.forEach(function (id) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "niveauknap";
            b.setAttribute("data-skema", id);
            b.textContent = D.SKEMA[id].knap;
            b.title = K.skema(id).reaktion;
            b.addEventListener("click", function () { mig.vaelgSkema(id); });
            g.appendChild(b);
        });
        this.visSkift();
    };

    P.visSkift = function () {
        var v = this.variant;
        [].forEach.call(this.el.skift.querySelectorAll(".niveauknap"), function (b) {
            var valgt = b.getAttribute("data-skema") === v;
            b.classList.toggle("aktiv", valgt);
            b.setAttribute("aria-pressed", valgt ? "true" : "false");
        });
    };

    /* Et andet reaktionsskema: opgaven begynder forfra med det nye skema */
    P.vaelgSkema = function (id) {
        if (D.SKEMAER.indexOf(id) < 0 || id === this.variant) return;
        this.variant = id;
        NK.gem(NOEGLE_SKEMA, id);
        this.status = this.statusFor[id];
        this.visSkift();
        this.vaelg(this.nr || 0, false);
    };

    /* ----- Opgaven -------------------------------------------------------------- */
    P.lavOpgave = function (i) {
        var spec = D.BEREGNING[i];
        var o = { id: spec.id, titel: spec.titel, tal: NK.maaling(spec.maaling), maaling: spec.maaling,
                  kunTal: !!spec.kunTal, spm: !!spec.spm, trin: D.TRINLISTE, sk: K.skema(this.variant) };
        o.facit = K.facit(o);
        this.opg = o;
        this.spmOk = false;
        this.spmForkert = [];
        this.regning.saet(o);
        this.skema.saet(o, this.regning);
        this.nyScene();
        this.placerHjaelp();
    };

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
        var o = this.opg;
        return (o.kunTal ? '<p class="note stor">' + NK.html(D.KUN_TAL) + "</p>" : "") +
            (o.tal.egen ? "" : '<p class="note">' + NK.html(D.EKSEMPEL_NOTE) + "</p>");
    };

    P.overTavle = function () { return D.OVER_TAVLE.replace("{ox}", this.opg.sk.oxid); };

    /* Linjen og knappen staar lige under det trin, eleven er ved; naar
       regnestykket er faerdigt, staar de nederst i kortet */
    P.placerHjaelp = function () {
        var blok = this.el.hjaelp, aktiv = this.regning.vaert.querySelector(".raekke.aktiv");
        if (!blok) return;
        var sted = aktiv || this.el.kort;
        if (blok.parentNode !== sted) sted.appendChild(blok);
    };

    /* Linjen og knappen skal kunne ses, ogsaa naar kortet er blevet langt */
    P.visHjaelp = function () {
        var blok = this.el.hjaelp;
        if (!blok || !blok.scrollIntoView || !NK.el("fane-beregning").classList.contains("aktiv")) return;
        try { blok.scrollIntoView({ block: "nearest" }); } catch (x) { /* gammel browser */ }
    };

    var beskedFaelles = P.besked;
    P.besked = function (html, klasse) {
        this.placerHjaelp();
        beskedFaelles.call(this, html, klasse);
        this.visHjaelp();
    };

    var visKnapFaelles = P.visKnap;
    P.visKnap = function () {
        this.placerHjaelp();
        visKnapFaelles.call(this);
    };

    /* ----- Spoergsmaalet til sidst i maaling 1 --------------------------------------------- */
    var trinInfoRegning = P.trinInfo, trinLinjeRegning = P.trinLinje;

    P.spmAabent = function () { return this.opg.spm && this.regning.faerdig() && !this.spmOk; };

    P.opgaveFaerdig = function () { return this.regning.faerdig() && (!this.opg.spm || this.spmOk); };

    P.trinLinje = function () {
        if (this.spmAabent()) return "Vælg et af svarene.";
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
            var f1 = K.facit({ tal: NK.maaling(0), sk: o.sk });
            s += " I måling 1 var det ca. " + K.pct(f1.pct) + " %.";
        }
        return NK.html(s);
    };

    /* ----- Scenen: skemaet og de tre soejler ------------------------------------------------- */
    P.nyScene = function () {
        this.s = { teori: false, pop: 1, forskel: false };
    };

    P.efterTrin = function (id) {
        if (id === "m_ox") { this.s.teori = true; this.s.pop = 0; }
        this.skema.loest(id);
        this.visKortEkstra();
    };

    P.opdaterScene = function (dt) {
        if (this.s && this.s.pop < 1) this.s.pop = Math.min(1, this.s.pop + dt * 1.6);
        this.skema.opdater(dt);
    };

    /* ----- Musen ------------------------------------------------------------------ */
    P.hvad = function (pt) {
        var lay = this.lay;
        if (!lay || !pt) return null;
        for (var i = 0; i < lay.soejler.length; i++) {
            var sj = lay.soejler[i];
            if (pt.x >= sj.x - sj.b / 2 - 6 && pt.x <= sj.x + sj.b / 2 + 6 && pt.y >= lay.bordY - lay.sh - 24 && pt.y <= lay.bordY) return "s" + i;
        }
        var c = this.skema.ramt(pt);
        return c && this.celleTekst(c) ? c : null;
    };

    /* Det, et klik paa en celle i skemaet siger */
    P.celleTekst = function (id) {
        var o = this.opg, sk = o.sk, C = D.CELLE;
        function fyld(s) { return s.replace(/\{ox\}/g, sk.oxid).replace("{MFe}", K.MFeTekst).replace("{MOx}", sk.Mtekst); }
        if (C[id]) return fyld(C[id]);
        if (id.indexOf("o2_") === 0) return C.o2;
        var trin = NK.Skema.trinFor(id);
        if (!trin) return "";
        var nr = o.trin.indexOf(trin) + 1;
        return (this.regning.loest(trin) ? C.fundet : C.skjult).replace("{nr}", nr);
    };

    P.overScene = function (pt) {
        this.over = this.hvad(pt);
        return this.over;
    };

    P.nedScene = function (pt) {
        var u = this.hvad(pt), o = this.opg, t = o.tal, f = o.facit;
        if (u === "s0") this.kortBesked("Stålulden før: " + K.g2(t.mf) + " g jern.");
        else if (u === "s1") this.kortBesked("Vægten efter: " + K.g2(t.mf) + " g jern og " + K.g2(K.r2(t.me - t.mf)) + " g ilt, der har bundet sig.");
        else if (u === "s2") {
            this.kortBesked(this.s.teori ? "Hvis alt jernet bliver til " + o.sk.oxid + ": " + K.g2(f.m) + " g. Den røde del er ilten." :
                "Den kommer, når du har regnet massen af " + o.sk.oxid + " ud.");
        } else if (u) this.kortBesked(NK.html(this.celleTekst(u)));
        return false;
    };

    /* ----- Layout -------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h, ctx = this.L.ctx;
        var Hs = this.baand().y;
        var lay = { W: W, H: H, Hs: Hs };
        lay.bordY = Math.round(Hs - NK.klamp(Hs * 0.08, 26, 44));
        /* Linjen over tavlen deler plads med omskifteren til hoejre */
        var skift = this.el.skift;
        var skiftB = skift ? skift.offsetWidth : 0, skiftH = skift ? skift.offsetHeight : 0;
        lay.ot = Tg.overTavle(ctx, this.overTavle(), Math.max(160, W - 46 - skiftB - (skiftB ? 26 : 0)), NK.klamp(W / 44, 15, 20), 13);
        var linjeH = Math.max(lay.ot.h, skiftH);
        lay.otY = 12 + (linjeH - lay.ot.h) / 2;
        var top = 12 + linjeH + 14;
        /* Tavlen faar den hoejde, skemaet skal bruge; resten gaar til soejlerne */
        var rh = NK.klamp(Math.min(W / 19, Hs / 12.5), 26, 58);
        while (lay.bordY - (top + NK.Skema.hoejde(rh) + 22) < 110 && rh > 24) rh -= 1;
        lay.rh = rh;
        lay.tavle = { x: 16, y: top, b: W - 32, h: NK.Skema.hoejde(rh) };
        this.skema.layout(ctx, lay.tavle, rh);
        var fri = lay.bordY - (top + lay.tavle.h + 22);
        /* Soejlerne faar resten; paa en lille skaerm bliver de lave */
        lay.sh = NK.klamp(fri - 26, 24, 300);
        var sb = NK.klamp(Math.min(W * 0.1, lay.sh * 0.6), 40, 104);
        lay.soejler = [0.24, 0.5, 0.76].map(function (a) { return { x: W * a, b: sb }; });
        this.lay = lay;
        this.saetAnker("opgave", 10, 8, Math.max(100, W - 30 - skiftB - (skiftB ? 16 : 0)), linjeH + 8);
        this.saetAnker("tavle", lay.tavle.x, lay.tavle.y, lay.tavle.b, lay.tavle.h);
        this.saetAnker("soejler", W * 0.12, lay.bordY - lay.sh - 30, W * 0.76, lay.sh + 60);
    };

    /* ----- Tegn ----------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, s = this.s, o = this.opg;
        if (!lay || !s) return;
        this.L.ryd();
        Tg.rum(ctx, lay.W, lay.Hs, lay.bordY + 12);
        Tg.tegnOverTavle(ctx, lay.ot, 16, lay.otY);
        Tg.tavle(ctx, lay.tavle);
        this.skema.tegn(ctx, this.tid, { hint: this.hjaelp > 0, over: this.over });
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
    };

    NK.SimBeregning = SimBeregning;
}());
