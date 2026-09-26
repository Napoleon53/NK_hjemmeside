/* =====================================================================
   sim_fortynd.js - fane 3: fortynding

   Flasken har 1,00 M kobber(II)sulfat. Foerste opgave goer eleven selv:
   klik paa en pipette (den tager sit rumfang op fra flasken), klik paa
   en maalekolbe (pipetten toemmes i den) og klik paa sproejteflasken
   (kolben fyldes op til maerket). Maalet er en opløsning, der er ti
   gange tyndere. De andre fire opgaver regnes med formlen foerst, og
   scenen goer det, eleven har regnet. Luppen over flasken og luppen
   over kolben viser de samme ioner fordelt i mere vand.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;
    var ST = D.stof("CuSO4");

    function SimFortynd() {
        this.sidstTal = {};
        this.over = null;
        this.part1 = new NK.Partikler(21);
        this.part2 = new NK.Partikler(33);
        this.startFane(D.FORTYND);
        this.regning = new NK.Regning({ vaert: NK.el("fortynd-raekker"), fane: this });
        this.introNu = true;
        this.vaelg(0, false);
    }

    var P = SimFortynd.prototype;
    NK.Fane.paa(P, { navn: "fortynd" });
    NK.Regning.paa(P);

    /* Regnetrinene gaelder ikke den foerste opgave, som eleven goer selv */
    var regnInfo = P.trinInfo, regnLinje = P.trinLinje, regnFaerdig = P.opgaveFaerdig;

    P.erGoer = function () { return this.opg && this.opg.slags === "goer"; };

    /* ----- Opgaven -------------------------------------------------------------------- */
    P.lavOpgave = function (i, nyeTal) {
        var spec = D.FORTYND[i];
        var o = { id: spec.id, fane: 3, titel: spec.titel, slags: spec.slags, tekst: spec.tekst, trin: spec.trin || [], glas: !!spec.glas };
        if (spec.tal) {
            var tal = nyeTal ? this.traek(spec.tal, this.sidstTal[spec.id]) : (this.sidstTal[spec.id] || spec.tal[0]);
            this.sidstTal[spec.id] = tal;
            o.tal = tal;
            o.facit = K.facitFortynd(o);
        } else {
            o.tal = {};
            o.facit = {};
            o.maal = spec.maal;
        }
        this.opg = o;
        this.regning.saet(o);
        this.goerFaerdig = false;
        this.maade = "ok";
        this.forklaring = "";
        this.nyScene();
    };

    P.harNyeTal = function () { return !this.erGoer(); };
    P.harForfra = function () { return this.erGoer(); };

    P.forfra = function () {
        if (this.auto || this.s.koe.length || this.s.aktiv) return;
        this.nyScene();
        if (!this.faerdig) this.besked("Kolberne er tømt. " + this.trinLinje(), "");
    };

    P.promptHTML = function () {
        var t = this.opg.tal;
        var s = this.opg.tekst
            .replace("{V1}", t.V1 !== undefined ? K.mL(t.V1) + " mL" : "").replace("{V2}", t.V2 !== undefined ? K.mL(t.V2) + " mL" : "")
            .replace("{c1}", t.c1 !== undefined ? K.c(t.c1) : "").replace("{c2}", t.c2 !== undefined ? K.c(t.c2) : "");
        return '<p class="maal-tekst">' + NK.html(s) + "</p>";
    };

    P.data = function () {
        var o = this.opg, t = o.tal;
        switch (o.id) {
        case "c2":
        case "formel": return ["c₁ = 1,00 M", "V₁ = " + K.mL(t.V1) + " mL", "V₂ = " + K.mL(t.V2) + " mL"];
        case "V1": return ["c₁ = 1,00 M", "c₂ = " + K.c(t.c2) + " M", "V₂ = " + K.mL(t.V2) + " mL"];
        case "vand": return ["V₁ = " + K.mL(t.V1) + " mL", "c₁ = " + K.c(t.c1) + " M", "c₂ = " + K.c(t.c2) + " M"];
        }
        return ["c₁ = 1,00 M"];
    };

    /* ----- Hint, svar og linjen ------------------------------------------------------------ */
    P.trinInfo = function () {
        if (!this.erGoer()) return regnInfo.call(this);
        if (this.faerdig) return null;
        var mig = this;
        return { hint: "Ti gange tyndere: kolben skal være ti gange større end det, pipetten tager.",
                 svar: function () { mig.visGoer(); } };
    };

    P.opgaveFaerdig = function () {
        return this.erGoer() ? this.goerFaerdig : regnFaerdig.call(this);
    };

    P.trinLinje = function () {
        if (!this.erGoer()) return regnLinje.call(this);
        var s = this.s;
        if (this.faerdig) return "";
        if (s.iHaand !== null) return "Klik på den målekolbe, pipetten skal tømmes i.";
        var k = this.kolbeMedVaeske();
        if (k) return "Klik på sprøjteflasken for at fylde op til mærket. Eller tag en portion mere.";
        return "Klik på en pipette. Den tager opløsning op fra flasken.";
    };

    P.slutLinje = function () { return this.forklaring; };

    /* ----- Scenen --------------------------------------------------------------------------- */
    P.nyScene = function () {
        var o = this.opg, t = o.tal;
        var s = { pip: [], kolber: [], iHaand: null, sidst: null, koe: [], aktiv: null, forsoeg: false,
                  sproejte: { dx: 0, dy: 0, v: 0, straale: 0, maal: null }, glasV: 0, glasN: 0, glasMaerke: 0 };
        var pipetter, kolber;
        if (this.erGoer()) { pipetter = D.PIPETTER; kolber = D.KOLBER; }
        else if (o.glas) { pipetter = []; kolber = []; s.glasV = t.V1; s.glasN = o.facit.n1; }
        else { pipetter = [o.id === "V1" ? o.facit.V1 : t.V1]; kolber = [t.V2]; }
        pipetter.forEach(function (V) { s.pip.push({ V: V, fyld: 0, synlig: o.id === "V1" ? 0 : 1, x: 0, top: 0, hjemme: true }); });
        kolber.forEach(function (V) { s.kolber.push({ V: V, mL: 0, n: 0, op: false, etiket: null }); });
        this.s = s;
        this.part1 = new NK.Partikler(21);
        this.part2 = new NK.Partikler(33);
        var n1 = Tg.prikker(o.glas ? t.c1 : D.STAM);
        this.part1.saet([n1, n1]);
        if (o.glas) this.part2.saet([n1, n1]);
        this.part1.p.concat(this.part2.p).forEach(function (q) { q.a = 1; });
        if (this.lay) this.placer();
    };

    P.kolbeMedVaeske = function () {
        var s = this.s;
        if (s.sidst !== null && s.kolber[s.sidst] && s.kolber[s.sidst].mL > 0 && !s.kolber[s.sidst].op) return s.kolber[s.sidst];
        for (var i = 0; i < s.kolber.length; i++) if (s.kolber[i].mL > 0 && !s.kolber[i].op) return s.kolber[i];
        return null;
    };

    /* Koncentrationen i en kolbe lige nu */
    function cKolbe(k) { return k.mL > 0 ? k.n / (k.mL / 1000) : 0; }

    /* ----- Koeen: trin, der koeres efter hinanden --------------------------------------------
       Et trin er { dur, start(), fn(u), slut() }. */
    P.trin = function (dur, fn, slut, start) {
        this.s.koe.push({ dur: dur, fn: fn, slut: slut, start: start, t: 0 });
    };

    P.travl = function () { return !!(this.s.aktiv || this.s.koe.length); };

    /* Pipetten fra stativet til flasken, op til maerket og op igen */
    P.fyldPipette = function (i) {
        var s = this.s, p = s.pip[i], lay = this.lay, mig = this;
        var fl = lay.flaske;
        var tipY = fl.y0 + 112 * fl.k, over = fl.hals.y - 24;
        var h = lay.pipH;
        var x0, t0;
        this.trin(0.35, function (u) { p.top = t0 - 40 * u; }, null, function () { x0 = p.x; t0 = p.top; p.hjemme = false; s.iHaand = i; });
        this.trin(0.6, function (u) { p.x = NK.lerp(x0, fl.cx, u); p.top = NK.lerp(t0 - 40, over - h, u); });
        this.trin(0.4, function (u) { p.top = NK.lerp(over - h, tipY - h * 0.98, u); });
        /* Pipetten bliver staaende i flasken, til eleven vaelger en kolbe */
        this.trin(0.8, function (u) { p.fyld = u; }, function () {
            if (mig.erGoer()) mig.besked(mig.trinLinje(), "");
        });
    };

    /* Pipetten op af flasken, over kolben, toemmes og tilbage i stativet */
    P.toemPipette = function (i, j) {
        var s = this.s, p = s.pip[i], k = s.kolber[j], lay = this.lay, mig = this;
        var kg = lay.kolber[j], fl = lay.flaske;
        var h = lay.pipH;
        var x0, t0, nPr = D.STAM * p.V / 1000;
        var tipY = kg.hals.y + 26;
        var hoejt = Math.min(fl.hals.y, kg.hals.y) - 24 - h;
        this.trin(0.4, function (u) { p.top = NK.lerp(t0, hoejt, u); }, null, function () { t0 = p.top; s.sidst = j; });
        this.trin(0.6, function (u) { p.x = NK.lerp(x0, kg.cx, u); p.top = NK.lerp(hoejt, tipY - h * 0.98 - 20, u); }, null,
            function () { x0 = p.x; });
        this.trin(0.25, function (u) { p.top = NK.lerp(tipY - h * 0.98 - 20, tipY - h * 0.98, u); });
        var mL0, n0;
        this.trin(0.8, function (u) { p.fyld = 1 - u; k.mL = mL0 + p.V * u; k.n = n0 + nPr * u; }, null,
            function () { mL0 = k.mL; n0 = k.n; });
        this.trin(0.8, function (u) { p.x = NK.lerp(kg.cx, p.hx, u); p.top = NK.lerp(tipY - h * 0.98, p.hy, u); }, function () {
            p.hjemme = true; p.fyld = 0; s.iHaand = null;
            if (mig.erGoer()) mig.besked(mig.trinLinje(), "");
        });
    };

    /* Sproejteflasken fylder kolben op til maerket */
    P.fyldOp = function (j, efter) {
        var s = this.s, k = s.kolber[j], lay = this.lay, sp = s.sproejte;
        var kg = lay.kolber[j], sg = lay.sproejte;
        var dx = kg.cx + 18 - sg.tud.x, dy = kg.hals.y - 30 - sg.tud.y;
        var mL0;
        this.trin(0.6, function (u) { sp.dx = dx * u; sp.dy = dy * u; sp.v = -0.5 * u; });
        this.trin(1.3, function (u) { sp.straale = 1; k.mL = NK.lerp(mL0, k.V, u); }, function () { sp.straale = 0; k.op = true; },
            function () { mL0 = k.mL; });
        this.trin(0.6, function (u) { sp.dx = dx * (1 - u); sp.dy = dy * (1 - u); sp.v = -0.5 * (1 - u); }, function () {
            k.etiket = [ST.formel, K.c(cKolbe(k)) + " M"];
            if (efter) efter();
        });
    };

    /* Sproejteflasken haelder vand i baegerglasset op til V₂ (opgave 4) */
    P.fyldGlas = function (V2) {
        var s = this.s, lay = this.lay, sp = s.sproejte, gg = lay.glas, sg = lay.sproejte;
        var dx = gg.ind.x1 - 20 * gg.k - sg.tud.x, dy = gg.ind.top - 26 - sg.tud.y;
        var V0;
        this.trin(0.6, function (u) { sp.dx = dx * u; sp.dy = dy * u; sp.v = -0.5 * u; });
        this.trin(1.6, function (u) { sp.straale = 1; s.glasV = NK.lerp(V0, V2, u); }, function () { sp.straale = 0; }, function () { V0 = s.glasV; });
        this.trin(0.6, function (u) { sp.dx = dx * (1 - u); sp.dy = dy * (1 - u); sp.v = -0.5 * (1 - u); });
    };

    P.opdaterScene = function (dt) {
        var s = this.s;
        if (!s) return;
        if (!s.aktiv && s.koe.length) {
            s.aktiv = s.koe.shift();
            if (s.aktiv.start) s.aktiv.start();
        }
        var a = s.aktiv;
        if (a) {
            a.t += dt / a.dur;
            a.fn(NK.blod(Math.min(1, a.t)));
            if (a.t >= 1) {
                s.aktiv = null;
                if (a.slut) a.slut();
                if (!s.koe.length) { this.auto = false; this.visKnap(); }
            }
        }
        /* Luppen over kolben: den kolbe, der sidst fik noget */
        var o = this.opg, c2 = 0;
        if (o.glas) c2 = s.glasV > 0 ? s.glasN / (s.glasV / 1000) : 0;
        else if (s.sidst !== null) c2 = cKolbe(s.kolber[s.sidst]);
        var n2 = Tg.prikker(c2);
        this.part2.saet([n2, n2]);
        this.part1.opdater(dt);
        this.part2.opdater(dt);
    };

    /* ----- Foerste opgave: eleven goer det selv ---------------------------------------------- */
    P.klikPipette = function (i) {
        var s = this.s;
        if (this.faerdig) { this.kortBesked("Opgaven er løst. Tryk på Næste opgave."); return; }
        if (s.iHaand !== null) { this.kortBesked("Tøm først pipetten i en målekolbe."); return; }
        if (s.forsoeg) { this.tomKolber(); }
        this.fyldPipette(i);
    };

    P.tomKolber = function () {
        var s = this.s;
        s.kolber.forEach(function (k) { k.mL = 0; k.n = 0; k.op = false; k.etiket = null; });
        s.sidst = null;
        s.forsoeg = false;
    };

    P.klikKolbe = function (j) {
        var s = this.s, k = s.kolber[j];
        if (this.faerdig) { this.kortBesked("Opgaven er løst. Tryk på Næste opgave."); return; }
        if (s.iHaand === null) { this.kortBesked("Tag først opløsning op med en pipette. Klik på en af dem."); return; }
        if (k.op) { this.kortBesked("Den kolbe er fyldt op. Vælg en anden, eller tryk på Start forfra."); return; }
        this.toemPipette(s.iHaand, j);
    };

    P.klikSproejte = function () {
        var s = this.s, mig = this;
        if (this.faerdig) { this.kortBesked("Opgaven er løst. Tryk på Næste opgave."); return; }
        if (s.iHaand !== null) { this.kortBesked("Tøm først pipetten i en målekolbe."); return; }
        var k = this.kolbeMedVaeske();
        if (!k) { this.kortBesked("Kom først opløsning i en kolbe med pipetten."); return; }
        var j = s.kolber.indexOf(k);
        this.fyldOp(j, function () { mig.vurder(j); });
    };

    /* Kolben er fyldt op: er den ti gange tyndere? */
    P.vurder = function (j) {
        var s = this.s, k = s.kolber[j], c = cKolbe(k), o = this.opg;
        var n = k.n, V2 = k.V;
        var regn = "n = " + K.mol(n) + " mol, og c₂ = " + K.mol(n) + " mol / " + K.L(V2) + " L = " + K.c(c) + " M.";
        if (Math.abs(c - o.maal) < 0.0005) {
            this.goerFaerdig = true;
            this.forklaring = NK.html(regn + " Stoffet fra pipetten fordeler sig i ti gange så meget væske.");
            this.trinLoest(this.maade, this.maade === "svar" ?
                NK.html("25 mL i en 250 mL kolbe. 10 mL i 100 mL og 50 mL i 500 mL giver det samme.") : null);
            this.visKort();
            return;
        }
        s.forsoeg = true;
        var gange = D.STAM / c;
        var g = Math.abs(gange - Math.round(gange)) < 0.01 ? String(Math.round(gange)) : NK.betydende(gange, 2);
        this.besked(NK.html("Det gav " + K.c(c) + " M. Det er " + g + " gange tyndere, ikke ti. Klik på en pipette for at prøve igen."), "skidt");
    };

    /* Vis svaret: 25 mL i 250 mL, fra start */
    P.visGoer = function () {
        if (this.travl()) return;
        var mig = this;
        this.nyScene();
        this.maade = "svar";
        this.brugtSvar = true;
        this.auto = true;
        this.svarVis(NK.html("25 mL i en 250 mL kolbe. 10 mL i 100 mL og 50 mL i 500 mL giver det samme."));
        this.fyldPipette(1);
        this.toemPipette(1, 1);
        this.fyldOp(1, function () { mig.vurder(1); });
        this.visKnap();
    };

    /* ----- Regneopgaverne: scenen goer det, eleven har regnet --------------------------------- */
    P.efterTrin = function (id) {
        var o = this.opg, s = this.s, mig = this;
        if (o.id === "c2" && id === "n1") this.fyldPipette(0);
        if (o.id === "c2" && id === "c2") { this.toemPipette(0, 0); this.fyldOp(0); }
        if (o.id === "V1" && id === "V1") {
            this.trin(0.5, function (u) { s.pip[0].synlig = u; });
            this.fyldPipette(0);
            this.toemPipette(0, 0);
            this.fyldOp(0);
        }
        if (o.id === "formel") { this.fyldPipette(0); this.toemPipette(0, 0); this.fyldOp(0); }
        if (o.id === "vand" && id === "V2") s.glasMaerke = o.facit.V2;
        if (o.id === "vand" && id === "vand") this.fyldGlas(o.facit.V2);
        void mig;
    };

    /* ----- Musen --------------------------------------------------------------------------------- */
    P.hvad = function (pt) {
        var lay = this.lay, s = this.s;
        if (!lay || !pt || !s) return null;
        var i;
        for (i = 0; i < s.pip.length; i++) {
            var p = s.pip[i], pg = lay.pipG[i];
            if (!pg || p.synlig < 0.5) continue;
            var b = Math.max(pg.b, 26);
            if (pt.x >= p.x - b / 2 && pt.x <= p.x + b / 2 && pt.y >= p.top && pt.y <= p.top + lay.pipH) return { slags: "pipette", i: i };
        }
        for (i = 0; i < lay.kolber.length; i++) {
            var kg = lay.kolber[i];
            if (pt.x >= kg.x0 && pt.x <= kg.x0 + kg.b && pt.y >= kg.y0 && pt.y <= kg.bund) return { slags: "kolbe", i: i };
        }
        var sg = lay.sproejte;
        if (sg && pt.x >= sg.x0 + 20 * sg.k && pt.x <= sg.x0 + sg.b && pt.y >= sg.y0 && pt.y <= sg.y0 + sg.h) return { slags: "sproejte" };
        var fl = lay.flaske;
        if (fl && pt.x >= fl.x0 && pt.x <= fl.x0 + fl.b && pt.y >= fl.y0 && pt.y <= fl.y0 + fl.h) return { slags: "flaske" };
        var gg = lay.glas;
        if (gg && pt.x >= gg.x0 && pt.x <= gg.x0 + gg.b && pt.y >= gg.y0 && pt.y <= gg.y0 + gg.h) return { slags: "glas" };
        return null;
    };

    P.overScene = function (pt) {
        var u = this.hvad(pt);
        this.over = u;
        return u && this.erGoer() ? u.slags : null;
    };

    P.nedScene = function (pt) {
        var u = this.hvad(pt);
        if (!u) return false;
        if (!this.erGoer()) {
            this.kortBesked(u.slags === "glas" ? "Der kommer vand i, når du har regnet, hvor meget." :
                "Scenen gør det, når du har regnet rigtigt.");
            return false;
        }
        if (this.travl()) { this.kortBesked("Vent lidt."); return false; }
        if (u.slags === "pipette") this.klikPipette(u.i);
        else if (u.slags === "kolbe") this.klikKolbe(u.i);
        else if (u.slags === "sproejte") this.klikSproejte();
        else if (u.slags === "flaske") this.kortBesked("Klik på en pipette. Den tager opløsning op fra flasken.");
        return false;
    };

    /* ----- Layout ------------------------------------------------------------------------------------ */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var baand = this.k.layout(W, H);
        var Hs = baand.y;
        var lay = { W: W, H: H, Hs: Hs };
        lay.bordY = Math.round(Hs - NK.klamp(Hs * 0.06, 14, 40));
        var zr = Math.round(NK.klamp(Math.min(Hs * 0.11, W * 0.075), 44, 88));
        lay.zr = zr;
        var zy = 16 + 24 + zr;
        lay.z1 = { x: 16 + zr + 8, y: zy };
        lay.z2 = { x: lay.z1.x + 2 * zr + NK.klamp(W * 0.04, 26, 60), y: zy };
        var tx = lay.z2.x + zr + NK.klamp(W * 0.04, 24, 50);
        lay.tavle = { x: tx, y: 16, b: W - tx - 18, h: Math.round(NK.klamp(Hs * 0.36, 150, 300)) };
        var topBund = Math.max(zy + zr + 60, lay.tavle.y + lay.tavle.h + 16);
        var plads = lay.bordY - topBund;
        lay.pipH = Math.round(NK.klamp(plads * 0.9, 140, 270));
        lay.kolbeH = Math.round(NK.klamp(plads * 0.92, 130, 300));
        var flH = NK.klamp(plads * 0.62, 90, 200);
        lay.flaske = Tg.flaskeGeo(W * 0.075 + flH * 0.32, lay.bordY, flH);
        var spH = NK.klamp(plads * 0.5, 70, 150);
        lay.sproejte = Tg.sproejteGeo(W - spH * 0.85 - 16, lay.bordY, spH);
        this.lay = lay;
        this.placer();
        this.saetAnker("tavle", lay.tavle.x, lay.tavle.y, lay.tavle.b, lay.tavle.h);
        this.saetAnker("lupper", lay.z1.x - zr, lay.z1.y - zr - 24, lay.z2.x + zr - lay.z1.x + zr, 2 * zr + 90);
        this.saetAnker("bord", 8, topBund - 10, W - 16, lay.bordY - topBund + 20);
        this.saetAnker("laerer", 0, baand.y, W * 0.45, baand.h);
    };

    /* Pipetterne, kolberne og glasset paa bordet */
    P.placer = function () {
        var lay = this.lay, s = this.s, o = this.opg;
        if (!lay || !s) return;
        var W = lay.W;
        var x0 = lay.flaske.x0 + lay.flaske.b + 30, x1 = lay.sproejte.x0 - 16;
        lay.pipG = [];
        lay.kolber = [];
        lay.glas = null;
        var fak = function (V, ref) { return NK.klamp(Math.pow(V / ref, 1 / 3), 0.7, 1.25); };
        if (o.glas) {
            var gh = NK.klamp(lay.kolbeH * 0.85, 120, 250);
            lay.glas = Tg.glasGeo((x0 + x1) / 2 - gh * 0.4, lay.bordY, gh);
            return;
        }
        var nP = s.pip.length, nK = s.kolber.length;
        var pipB = NK.klamp((x1 - x0) * 0.1, 48, 66);
        var pipX0 = x0 + 10;
        var kolX0 = pipX0 + nP * pipB + 40;
        var slotB = (x1 - kolX0) / Math.max(1, nK);
        s.pip.forEach(function (p, i) {
            var w = NK.klamp(Math.sqrt(p.V / 25), 0.75, 1.35);
            p.hx = pipX0 + pipB * (i + 0.5);
            p.hy = lay.bordY - 6 - lay.pipH;
            if (p.hjemme) { p.x = p.hx; p.top = p.hy; }
            lay.pipG[i] = Tg.pipetteGeo(p.x, p.top, lay.pipH, w);
        });
        s.kolber.forEach(function (k, j) {
            var h = lay.kolbeH * fak(k.V, 500);
            lay.kolber[j] = Tg.kolbeGeo(kolX0 + slotB * (j + 0.5), lay.bordY, h);
        });
        void W;
    };

    /* ----- Tegn ---------------------------------------------------------------------------------------- */
    P.tegnTavleGoer = function (ctx, r) {
        Tg.tavle(ctx, r);
        var s = this.s, f = NK.klamp(Math.min(r.h / 9, r.b / 26), 13, 20);
        var x = r.x + f * 1.1, y = r.y + f * 1.4, lh = f * 1.6;
        var moerk = "#1f2530", lille = Tg.font("700", NK.klamp(f * 0.72, 12, 14));
        NK.tekst(ctx, "FORTYNDINGEN", x, y, { font: lille, linje: "middle", farve: "#6a7280" });
        y += lh * 0.9;
        NK.tekst(ctx, "c₁ = 1,00 M i flasken. Målet: c₂ = 0,100 M.", x, y, { font: Tg.font("600", f), linje: "middle", farve: moerk });
        y += lh;
        var brugt = s.kolber.filter(function (k) { return k.mL > 0; });
        brugt.forEach(function (k) {
            var t = "V₂ = " + K.mL(k.V) + " mL: n = " + K.mol(k.n) + " mol";
            if (k.op) t += ", c₂ = " + K.c(cKolbe(k)) + " M";
            NK.passendeSkrift(ctx, t, r.b - f * 2.2, f, 12, "600");
            NK.tekst(ctx, t, x, y, { font: ctx.font, linje: "middle", farve: k.op && Math.abs(cKolbe(k) - 0.1) < 0.0005 ? "#1d7a48" : moerk });
            y += lh;
        });
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, s = this.s, o = this.opg, mig = this;
        if (!lay || !s) return;
        this.placer();
        this.L.ryd();
        Tg.rum(ctx, lay.W, lay.Hs, lay.bordY + 12);
        if (this.erGoer()) this.tegnTavleGoer(ctx, lay.tavle);
        else this.regning.tegnTavle(ctx, lay.tavle, this.data(), this.tid);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.Hs);
        var over = this.over;
        var lysT = function (slags, i) { return over && over.slags === slags && (i === undefined || over.i === i) ? 1 : 0; };

        /* Flasken eller baegerglasset */
        var c1 = o.glas ? o.tal.c1 : D.STAM;
        if (!o.glas) Tg.flaske(ctx, lay.flaske, Tg.vaeske(ST, D.STAM), [ST.formel, "1,00 M"], lysT("flaske"));
        if (lay.glas) {
            var cg = s.glasV > 0 ? s.glasN / (s.glasV / 1000) : 0;
            Tg.glas(ctx, lay.glas, s.glasV, Tg.vaeske(ST, cg), s.glasMaerke || 0);
        }

        /* Pipettestativet */
        if (s.pip.length) {
            var sx0 = s.pip[0].hx - 20, sx1 = s.pip[s.pip.length - 1].hx + 20;
            ctx.save();
            ctx.fillStyle = "#4a3a2a";
            NK.rundtRekt(ctx, sx0, lay.bordY - 12, sx1 - sx0, 12, 3);
            ctx.fill();
            ctx.fillStyle = "#6b5236";
            ctx.fillRect(sx0 + 4, lay.bordY - lay.pipH * 0.62, 6, lay.pipH * 0.62 - 10);
            NK.rundtRekt(ctx, sx0, lay.bordY - lay.pipH * 0.62 - 8, sx1 - sx0, 9, 3);
            ctx.fill();
            ctx.restore();
        }

        /* Kolberne */
        s.kolber.forEach(function (k, j) {
            var kg = lay.kolber[j];
            Tg.kolbe(ctx, kg, { fyld: k.mL / k.V, farve: Tg.vaeske(ST, cKolbe(k)), tekst: K.mL(k.V) + " mL", etiket: k.etiket,
                lys: mig.erGoer() ? lysT("kolbe", j) : 0 });
        });

        /* Sproejteflasken, evt. paa vej og med straale */
        var sg = lay.sproejte, sp = s.sproejte;
        ctx.save();
        ctx.translate(sp.dx, sp.dy);
        Tg.sproejte(ctx, sg, this.erGoer() ? lysT("sproejte") : 0, sp.v);
        ctx.restore();
        if (sp.straale) {
            var tx = sg.tud.x + sp.dx - 4, ty = sg.tud.y + sp.dy + 10;
            var bundY = lay.glas ? lay.glas.ymL(s.glasV) : (s.sidst !== null ? lay.kolber[s.sidst].hals.y + 30 : ty + 40);
            Tg.straale(ctx, tx, ty, bundY, 4, null, this.tid);
        }

        /* Pipetterne (den, der er i brug, tegnes til sidst) */
        s.pip.forEach(function (p, i) {
            if (p.synlig <= 0.01) {
                var pg0 = lay.pipG[i];
                ctx.save();
                ctx.strokeStyle = "rgba(220, 236, 248, 0.35)";
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(pg0.x0, pg0.y0, pg0.b, pg0.h);
                ctx.setLineDash([]);
                ctx.restore();
                NK.tekst(ctx, "? mL", p.x, p.top + lay.pipH * 0.45, { font: Tg.font("700", 15), justering: "center", farve: "rgba(238,246,252,0.7)" });
                return;
            }
            ctx.save();
            ctx.globalAlpha = p.synlig;
            Tg.pipette(ctx, lay.pipG[i], { fyld: p.fyld, farve: Tg.vaeske(ST, D.STAM), tekst: Math.round(p.V) + " mL", tekstOver: p.hjemme,
                lys: mig.erGoer() && p.hjemme ? lysT("pipette", i) : 0 });
            ctx.restore();
        });

        /* Lupperne */
        var zr = lay.zr;
        var titel1 = o.glas ? "Glasset før" : "Flasken", titel2 = o.glas ? "Glasset nu" : "Kolben";
        var c2 = 0;
        if (o.glas) c2 = s.glasV > 0 ? s.glasN / (s.glasV / 1000) : 0;
        else if (s.sidst !== null) c2 = cKolbe(s.kolber[s.sidst]);
        Tg.zoom(ctx, lay.z1.x, lay.z1.y, zr, { part: this.part1, st: ST, farve: Tg.vaeske(ST, c1), titel: titel1,
            tekst: K.c(c1) + " M", forklar: false });
        Tg.zoom(ctx, lay.z2.x, lay.z2.y, zr, { part: this.part2, st: ST, farve: Tg.vaeske(ST, c2), titel: titel2,
            tekst: c2 > 0 ? K.c(c2) + " M" : "tom", forklar: false });
        this.k.tegn(ctx);
    };

    NK.SimFortynd = SimFortynd;
}());
