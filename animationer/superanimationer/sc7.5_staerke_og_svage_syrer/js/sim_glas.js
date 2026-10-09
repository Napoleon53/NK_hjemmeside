/* =====================================================================
   sim_glas.js - fane 1: To glas

   To baegerglas med samme koncentration, 0,10 M: saltsyre og
   eddikesyre. Eleven kommer et stykke kalk i hvert glas og ser, at det
   bruser kraftigt i saltsyren og naesten ikke i eddikesyren. Et klik
   paa et glas aabner luppen over det: i saltsyren har alle 100
   molekyler afgivet en hydron, i eddikesyren kun 1.

   Glassene er js/glas.js, lupperne js/lup.js. Fanen bestemmer kun,
   hvad der er fremme, og hvornaar et maal er naaet.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    var SET_SEK = 1.2;        /* saa laenge skal en lup have vaeret aaben */
    var BRUS_SEK = 2.5;       /* saa laenge skal kalken have bruset */

    function SimGlas() {
        this.glas = [new NK.Glas({ id: "HCl", syre: "HCl" }), new NK.Glas({ id: "eddike", syre: "eddike" })];
        this.lup = [new NK.Lup({ syre: "HCl" }), new NK.Lup({ syre: "eddike" })];
        this.aaben = [false, false];
        this.aabenT = [0, 0];
        this.traek = null;
        this.over = null;
        this.aeg = 0;
        this.byt0 = 0;
        this.startFane(D.G_MAAL);
        this.visPanel();
    }

    var P = SimGlas.prototype;
    NK.Fane.paa(P, { navn: "g", naesteFane: "fane-s", naesteNavn: "Stærk eller svag?" });

    /* ----- Maalene ------------------------------------------------------------------ */
    P.nyOpgave = function (o) {
        var op = o.opstil || {}, mig = this;
        this.traek = null;
        this.glas.forEach(function (g) { if (op.kalk) g.kalkI(true); else g.toem(); });
        (op.lup || []).forEach(function (til, i) {
            if (til) mig.aabn(i, true); else { mig.aaben[i] = false; mig.aabenT[i] = 0; }
        });
        /* I eddikesyren staar antallet stille, til eleven har talt */
        var bytter = this.idx(o.id) >= this.idx("balance");
        this.lup[1].bytter = bytter;
        this.lup[1].hast = o.id === "balance" ? 2.4 : 1;
        if (!bytter) this.lup[1].saet("eddike", K.C0, true);
        if (o.id === "balance") this.lup[1].vent = 1.6;
        this.byt0 = this.lup[1].byt;
        this.aeg = 0;
        this.visAnkre();
        if (this.status) this.visPanel();
    };

    P.nyFase = function () { this.byt0 = this.lup[1].byt; };

    P.efterOpgave = function () { this.visPanel(); };

    P.nulstilScene = function () { this.nyOpgave(this.opg.o); };

    P.aabn = function (i, straks) {
        if (!this.aaben[i]) this.aabenT[i] = 0;
        this.aaben[i] = true;
        if (straks) this.aabenT[i] = SET_SEK;
        this.visAnkre();
    };

    /* Rundvisningen peger kun paa lupperne, naar mindst én er aaben */
    P.visAnkre = function () {
        NK.el("g-anker-lup").hidden = !(this.aaben[0] || this.aaben[1]);
        NK.el("g-anker-skaal").hidden = this.harKalk() === 2;
    };

    P.harKalk = function () { return this.glas.filter(function (g) { return g.kalk; }).length; };

    /* Lupperne kommer foerst frem, naar kalken er proevet */
    P.kanLup = function () { return this.erLoest("kalk") || this.idx(this.opg.o.id) > 0; };

    P.sceneLinje = function () {
        var id = this.opg.o.id, n = this.harKalk();
        /* Kun det, kortets opgavetekst ikke selv siger */
        if (id === "kalk") {
            if (n === 1) return "Kom også et stykke kalk i glasset med " + K.navn(this.glas[this.glas[0].kalk ? 1 : 0].syre) + ".";
            return n === 2 ? "Se, hvor meget kalken bruser i de to glas." : "";
        }
        if (id === "balance" && !this.aaben[1]) return "Klik på glasset med eddikesyre, så luppen over eddikesyren åbner.";
        return "";
    };

    P.spmLinje = function () {
        var id = this.opg.o.id;
        if (id === "lup-hcl" && !this.aaben[0]) return "Klik på glasset med saltsyre, så luppen viser det. Vælg så et svar på det gule kort.";
        if ((id === "lup-eddike" || id === "balance") && !this.aaben[1]) return "Klik på glasset med eddikesyre, så luppen viser det. Vælg så et svar på det gule kort.";
        return "";
    };

    P.forsoegSvar = function (o) {
        if (o.id === "kalk") this.glas.forEach(function (g) { g.kalkI(true); });
        if (o.id === "lup-hcl") this.aabn(0, true);
        if (o.id === "lup-eddike" || o.id === "balance") this.aabn(1, true);
    };

    /* ----- Panelet: det, eleven har talt i lupperne ---------------------------------- */
    P.visPanel = function () {
        var html = "";
        if (this.erLoest("lup-hcl")) {
            html += '<div class="talraekke"><span>Saltsyre: hele</span><span class="tal">0 af 100</span></div>' +
                '<div class="talraekke"><span>Saltsyre: H₃O⁺</span><span class="tal roed">100</span></div>';
        }
        if (this.erLoest("lup-eddike")) {
            html += '<div class="talraekke skil"><span>Eddikesyre: hele</span><span class="tal">99 af 100</span></div>' +
                '<div class="talraekke"><span>Eddikesyre: H₃O⁺</span><span class="tal roed">omkring 1</span></div>';
        }
        NK.saetHTML("g-regnskab", html);
        NK.el("g-regnkort").hidden = !html;
    };

    /* ----- Scenen -------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, baand = this.baand(), Hs = baand.y, mig = this;
        var lay = { W: W, H: this.L.h, Hs: Hs };
        lay.yBord = Hs - 30;
        var gh = NK.klamp((Hs - 68) * 0.235, 112, 200), gb = gh / 1.2;
        lay.gb = gb;
        var xs = [W * 0.27, W * 0.73];
        this.glas.forEach(function (g, i) { g.plads(xs[i], lay.yBord, gb); });
        var glasTop = lay.yBord - gh;
        /* Oeverst kortet med opgaven, saa signaturen og under den lupperne */
        lay.sigY = 10 + this.kortZone() + 8 + 16;
        var lb = Math.min(W * 0.46 - 14, 560), ly = lay.sigY + 22, lh = Math.max(100, glasTop - 30 - ly);
        lay.lup = xs.map(function (x) { return { x: NK.klamp(x - lb / 2, 12, W - lb - 12), y: ly, b: lb, h: lh }; });
        this.lup.forEach(function (l, i) { l.saetMaal(lay.lup[i].b, lay.lup[i].h); });
        var sb = Math.min(gb * 1.0, xs[1] - xs[0] - gb - 26), sh = sb * 64 / 150;
        lay.skaal = { x: W / 2 - sb / 2, y: lay.yBord - sh * 60 / 64, b: sb, h: sh };
        this.lay = lay;
        this.sig = [null, null];
        this.saetAnker("glas", xs[0] - gb / 2 - 6, glasTop - 4, xs[1] - xs[0] + gb + 12, gh + 10);
        this.saetAnker("skaal", lay.skaal.x - 4, lay.skaal.y - 4, sb + 8, sh + 8);
        this.saetAnker("lup", lay.lup[0].x, lay.sigY - 18, lay.lup[1].x + lb - lay.lup[0].x, lh + 42);
    };

    P.opdaterScene = function (dt) {
        var g = this.opg, id = g.o.id, mig = this;
        this.glas.forEach(function (x) { x.opdater(dt); });
        this.lup.forEach(function (l, i) {
            if (!mig.aaben[i]) return;
            l.opdater(dt);
            mig.aabenT[i] += dt;
        });
        if (this.faerdig || this.venter || g.fase !== "forsoeg") return;
        if (id === "kalk") {
            if (this.glas[0].bruset >= BRUS_SEK && this.glas[1].bruset >= BRUS_SEK) this.forsoegKlaret("");
        } else if (id === "lup-hcl") {
            if (this.aaben[0] && this.aabenT[0] >= SET_SEK) this.forsoegKlaret(g.o.forsoeg.set);
        } else if (id === "lup-eddike") {
            if (this.aaben[1] && this.aabenT[1] >= SET_SEK) this.forsoegKlaret(g.o.forsoeg.set);
        } else if (id === "balance") {
            if (this.aaben[1] && this.lup[1].byt > this.byt0) this.forsoegKlaret(g.o.forsoeg.set);
        }
    };

    /* Den roede oxoniumion faar en gul ring, naar hintet peger paa den */
    P.ringI = function (i) {
        var g = this.opg;
        if (i !== 1 || this.faerdig || g.o.id !== "lup-eddike" || g.fase !== "spm" || this.hjaelp < 2) return null;
        var ox = this.lup[1].ox.filter(function (o) { return !o.ud; });
        return ox.length ? ox[0] : null;
    };

    /* Det, der skal klikkes paa eller traekkes i lige nu: "skaal", 0, 1 eller null */
    P.peger = function () {
        var g = this.opg;
        if (this.faerdig || this.venter || g.fase !== "forsoeg") return null;
        if (g.o.id === "kalk") return this.harKalk() < 2 ? "skaal" : null;
        if (g.o.id === "lup-hcl") return this.aaben[0] ? null : 0;
        return this.aaben[1] ? null : 1;
    };

    /* ----- Tegning ------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, mig = this;
        if (!lay) return;
        ctx.fillStyle = "#14141a";
        ctx.fillRect(0, 0, lay.W, lay.H);
        Tg.bord(ctx, lay.W, lay.yBord, lay.Hs);

        var peger = this.peger(), om = this.omNu();
        var S = lay.skaal;
        ctx.save();
        if (this.harKalk() === 2) ctx.globalAlpha = 0.45;
        NK.Sprites.tegn(ctx, "kalkskaal", S.x, S.y, S.b, S.h);
        ctx.restore();
        if (this.harKalk() < 2) NK.tekst(ctx, "Kalk", S.x + S.b / 2, lay.yBord + 22, { font: Tg.font("700", 14), justering: "center", farve: "#e6eaef" });

        this.glas.forEach(function (g, i) {
            g.tegn(ctx, {
                etiket: [K.Navn(g.syre), K.konc(g.c)], ph: NK.visPH, tid: mig.tid,
                peg: peger === i || (mig.traek && !g.kalk), om: om.indexOf(i) >= 0
            });
        });

        this.lup.forEach(function (l, i) {
            if (!mig.aaben[i]) return;
            var R = lay.lup[i], s = K.SYRE[l.syre];
            l.tegn(ctx, R, { skilte: l.bytter, ring: mig.ringI(i) });
            Tg.zoomRamme(ctx, R, mig.glas[i].zoomFelt(), om.indexOf(i) >= 0);
            mig.sig[i] = Tg.signatur(ctx, R.x + R.b / 2, lay.sigY, l.syre, [
                { slags: "hel", tekst: s.formel }, { slags: "ion", tekst: s.ion }, { slags: "ox", tekst: "H₃O⁺" }
            ], R.b);
        });

        /* Det gule skilt ved det, der skal bruges nu */
        if (peger === "skaal" && !this.traek) {
            Tg.ring(ctx, S.x, S.y, S.b, S.h, this.tid);
            Tg.skilt(ctx, "Træk kalken ned i et glas", S.x + S.b / 2, S.y - 14, 8, lay.W - 8);
        } else if (peger === 0 || peger === 1) {
            var gl = this.glas[peger], m = gl.maal();
            Tg.skilt(ctx, "Klik for at se i luppen", gl.x, m.y0 - 12, 8, lay.W - 8);
        }

        /* Kalkstykket under musen */
        if (this.traek) {
            var kb = 44 * lay.gb / 200 * 1.2;
            NK.Sprites.tegn(ctx, "kalk", this.traek.x - kb / 2, this.traek.y - kb * 30 / 44 / 2, kb);
        }
        this.tegnSejr(ctx, lay.W, lay.Hs);
    };

    /* ----- Musen ---------------------------------------------------------------------- */
    P.iSkaal = function (pt) {
        var S = this.lay.skaal;
        return pt.x >= S.x - 6 && pt.x <= S.x + S.b + 6 && pt.y >= S.y - 8 && pt.y <= this.lay.yBord + 30;
    };

    P.glasVed = function (pt) {
        for (var i = 0; i < this.glas.length; i++) if (this.glas[i].rammer(pt)) return i;
        return -1;
    };

    /* Et klik paa et maerke i signaturen forklarer partiklen */
    P.sigVed = function (pt) {
        for (var i = 0; i < this.lup.length; i++) {
            var sl = this.aaben[i] ? Tg.signaturVed(this.sig[i], pt) : null;
            if (sl) return { slags: sl, syre: this.lup[i].syre };
        }
        return null;
    };

    P.lupVed = function (pt) {
        for (var i = 0; i < this.lup.length; i++) {
            var R = this.lay.lup[i];
            if (this.aaben[i] && pt.x >= R.x && pt.x <= R.x + R.b && pt.y >= R.y && pt.y <= R.y + R.h) return i;
        }
        return -1;
    };

    P.overScene = function (pt) {
        if (!pt || !this.lay) return null;
        if (this.gaetNu()) return this.iSkaal(pt) || this.glasVed(pt) >= 0 ? "klik" : null;
        if (this.iSkaal(pt) && this.harKalk() < 2) return "greb";
        if (this.glasVed(pt) >= 0 || this.sigVed(pt)) return "klik";
        var i = this.lupVed(pt);
        if (i >= 0 && this.lup[i].ved(pt.x - this.lay.lup[i].x, pt.y - this.lay.lup[i].y)) return "klik";
        return null;
    };

    P.nedScene = function (pt) {
        if (this.gaetNu()) return false;          /* gaettet foerst: klikket faar kortet til at blinke */
        if (!this.iSkaal(pt) || this.harKalk() >= 2) return false;
        this.traek = { x: pt.x, y: pt.y, x0: pt.x, y0: pt.y };
        return true;
    };

    P.flytScene = function (pt) {
        if (this.traek) { this.traek.x = pt.x; this.traek.y = pt.y; }
    };

    P.opScene = function (pt) {
        var t = this.traek;
        this.traek = null;
        if (!t) return;
        var i = this.glasVed(pt);
        if (i < 0) {
            /* et glas lige under musen taeller ogsaa: kalken slippes over glasset */
            for (var j = 0; j < this.glas.length; j++) {
                var g = this.glas[j];
                if (Math.abs(pt.x - g.x) < g.b * 0.6 && pt.y < g.bund) { i = j; break; }
            }
        }
        if (i >= 0) { this.kalkNed(i); return; }
        if (Math.hypot(pt.x - t.x0, pt.y - t.y0) < 8) this.kortBesked("Skålen med kalk. Træk et stykke kalk hen over et glas, og slip. Et klik på et glas virker også.", 6);
        else this.kortBesked("Slip kalken over et af de to glas.", 4);
    };

    P.kalkNed = function (i) {
        var g = this.glas[i];
        if (this.gaetNu()) { this.gaetBlink(); return; }
        if (!g.kalkI(false)) { this.kortBesked("Der ligger allerede et stykke kalk i glasset med " + K.navn(g.syre) + ".", 4); return; }
        this.visAnkre();
        this.nulstilHjaelp();
        if (!this.faerdig) this.naesteLinje("", "");
    };

    P.klikScene = function (pt) {
        if (!this.lay) return;
        if (this.gaetNu()) {
            if (this.iSkaal(pt) || this.glasVed(pt) >= 0) this.gaetBlink();
            return;
        }
        var sg = this.sigVed(pt);
        if (sg) { this.kortBesked(D.partikel(sg.slags, sg.syre, true), 7); return; }
        var i = this.lupVed(pt);
        if (i >= 0) {
            var l = this.lup[i], hit = l.ved(pt.x - this.lay.lup[i].x, pt.y - this.lay.lup[i].y);
            if (!hit) return;
            if (hit.slags === "ox" && i === 1) {
                this.aeg++;
                if (this.aeg >= 3) { this.aeg = 0; this.kortBesked(D.PAASKE.ox, 6); return; }
            }
            this.kortBesked(D.partikel(hit.slags, l.syre, true), 6);
            return;
        }
        i = this.glasVed(pt);
        if (i < 0) return;
        var g = this.glas[i];
        if (!g.kalk) { this.kalkNed(i); return; }
        if (!this.kanLup()) {
            this.kortBesked("Glasset med " + K.navn(g.syre) + ". Boblerne er carbondioxid, CO₂, fra kalken.", 5);
            return;
        }
        if (this.aaben[i]) { this.kortBesked("Luppen over glasset med " + K.navn(g.syre) + " viser et lille rum i " + K.navn(g.syre) + "n.", 5); return; }
        this.aabn(i, false);
        this.nulstilHjaelp();
        if (!this.faerdig && !this.venter) this.naesteLinje("", "");
    };

    NK.SimGlas = SimGlas;
}());
