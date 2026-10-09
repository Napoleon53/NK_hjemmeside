/* =====================================================================
   sim_fortynd.js - fane 3: Fortyndet?

   Staerk er ikke det samme som koncentreret. Til venstre staar 0,10 M
   eddikesyre, til hoejre saltsyre, som eleven fortynder 10 gange ad
   gangen. Efter to fortyndinger (0,0010 M) er der lige saa faa
   oxoniumioner i saltsyren som i eddikesyren, men alle saltsyrens
   molekyler har stadig afgivet en hydron: den er fortyndet, ikke svag.

   I det sidste maal vaelger eleven to ord til hver af fire flasker paa
   en tavle (staerk eller svag, koncentreret eller fortyndet).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    var SET_SEK = 1.5;         /* saa laenge skal resultatet ses, foer det taeller */
    var FORT_SEK = 2.0;        /* en fortynding: haeld fra, fyld op */
    var SKIFT = 0.45;          /* her i forloebet skifter koncentrationen */

    function SimFortynd() {
        var mig = this;
        this.glas = [new NK.Glas({ id: "eddike", syre: "eddike" }), new NK.Glas({ id: "HCl", syre: "HCl" })];
        this.glas.forEach(function (g) { g.kalkI(true); });
        this.lup = [new NK.Lup({ syre: "eddike" }), new NK.Lup({ syre: "HCl" })];
        this.trin = 0;
        this.fort = null;
        this.setT = 0;
        this.ord = [];
        this.knapF = NK.el("f-fortynd");
        this.vaerktoej = NK.el("f-vaerktoej");
        this.tavle = NK.el("f-tavle");
        this.knapF.addEventListener("click", function () { mig.fortynd(); mig.fokus(); });
        this.tavle.addEventListener("click", function (e) {
            var k = e.target.closest ? e.target.closest("button") : null;
            if (!k) return;
            if (k.id === "f-tjek") { mig.tjek(); return; }
            if (k.hasAttribute("data-v")) mig.vaelgOrd(parseInt(k.getAttribute("data-r"), 10), k.getAttribute("data-g"), k.getAttribute("data-v") === "1");
        });
        this.startFane(D.F_MAAL);
        this.visPanel();
    }

    var P = SimFortynd.prototype;
    NK.Fane.paa(P, { navn: "f" });

    /* ----- Fortyndingen --------------------------------------------------------------- */
    P.saetTrin = function (n) {
        this.trin = n;
        this.fort = null;
        this.setT = 0;
        this.glas[1].c = K.TRIN[n];
        this.glas[1].niveau = 1;
        this.lup[1].saet("HCl", K.TRIN[n], true);
    };

    P.fortynd = function () {
        if (this.fort) return;
        if (this.erTavle()) return;
        if (this.gaetNu()) { this.gaetBlink(); return; }
        if (this.trin >= K.TRIN.length - 1) {
            this.kortBesked("Saltsyren er allerede fortyndet 1000 gange. Tryk på Ny saltsyre for at begynde forfra med 0,10 M saltsyre.", 6);
            return;
        }
        this.fort = { t: 0, skiftet: false };
        this.setT = 0;
        this.nulstilHjaelp();
        this.visVaerktoej();
        if (!this.faerdig && !this.venter) this.naesteLinje("", "");
    };

    P.nulstilScene = function () {
        var op = this.opg.o.opstil;
        this.saetTrin(op && op.trin !== undefined && this.opg.o.id !== "ti" ? op.trin : 0);
        if (this.erTavle()) this.byggTavle();
        this.visPanel();
        this.visVaerktoej();
    };

    /* ----- Maalene ------------------------------------------------------------------ */
    P.erTavle = function () { return !!(this.opg && this.opg.o.felter); };

    P.nyOpgave = function (o) {
        var op = o.opstil;
        if (op && op.trin !== undefined) this.saetTrin(op.trin);
        this.ord = D.ORD.map(function () { return { s: null, k: null }; });
        this.byggTavle();
        if (this.status) { this.visPanel(); this.visVaerktoej(); }
    };

    P.nyFase = function () { this.visVaerktoej(); };

    P.efterOpgave = function () { this.byggTavle(); this.visPanel(); this.visVaerktoej(); };

    P.sceneLinje = function () {
        var g = this.opg, o = g.o, krav = o.forsoeg ? o.forsoeg.krav : 0;
        if (g.fase === "felter") return "";
        if (this.fort) return this.fort.t < FORT_SEK * SKIFT ? "Ni tiendedele af saltsyren hældes fra." : "Glasset med saltsyre fyldes op med vand til 100 mL.";
        if (this.trin > krav && o.id === "ti") return "Saltsyren er fortyndet mere end 10 gange. Tryk på Ny saltsyre, og fortynd saltsyren kun én gang.";
        if (this.trin > krav) return "Nu er saltsyren " + K.konc(K.TRIN[this.trin]) + ", og saltsyren har færre oxoniumioner end eddikesyren. Tryk på Ny saltsyre, og prøv igen.";
        /* Ellers kun det, kortets opgavetekst ikke selv siger */
        if (this.trin === krav || this.trin === 0) return "";
        return "Saltsyren er nu " + K.konc(K.TRIN[this.trin]) + ". Fortynd saltsyren igen, hvis den stadig har flest røde oxoniumioner.";
    };

    /* Spoergsmaalene om de to glas gaelder saltsyre, der er fortyndet 100 gange */
    P.spmLinje = function () {
        var op = this.opg.o.opstil;
        if (op && op.trin !== undefined && this.trin !== op.trin && !this.fort) {
            return "Spørgsmålet gælder saltsyre på " + K.konc(K.TRIN[op.trin]) + ". Tryk på Ny saltsyre, og vælg så et svar på det gule kort.";
        }
        return "";
    };

    P.forsoegSvar = function (o) { this.saetTrin(o.forsoeg.krav); this.visPanel(); this.visVaerktoej(); };

    /* ----- Tavlen med de fire flasker --------------------------------------------------- */
    P.byggTavle = function () {
        var vis = this.erTavle(), mig = this;
        this.tavle.hidden = !vis;
        if (!vis) { if (this.lay) this.layout(); return; }
        var loest = this.faerdig;
        var html = '<span class="st-navn">To ord til hver flaske</span><div class="ord-raekker">';
        D.ORD.forEach(function (o, r) {
            var v = mig.ord[r] || { s: null, k: null };
            if (loest) v = { s: K.erStaerk(o.syre), k: o.konc };
            function knap(g, vaerdi, tekst) {
                var valgt = v[g] === vaerdi;
                return '<button type="button" class="ordknap' + (valgt ? " valgt" : "") + '" data-r="' + r + '" data-g="' + g + '" data-v="' + (vaerdi ? 1 : 0) + '"' +
                    (loest ? " disabled" : "") + ' aria-pressed="' + (valgt ? "true" : "false") + '">' + tekst + "</button>";
            }
            html += '<div class="ord-raekke" data-raekke="' + r + '"><span class="ord-flaske"><b>' + NK.html(K.Navn(o.syre)) + "</b> " + NK.html(o.c) + "</span>" +
                '<span class="ord-valg">' + knap("s", true, "stærk") + knap("s", false, "svag") + "</span>" +
                '<span class="ord-valg">' + knap("k", true, "koncentreret") + knap("k", false, "fortyndet") + "</span></div>";
        });
        html += "</div>";
        if (loest) html += '<span class="st-stempel">RIGTIGT ✓</span>';
        else html += '<button class="tjekknap" id="f-tjek" type="button">Tjek</button>';
        this.tavle.innerHTML = html;
        this.tavle.classList.toggle("faerdig", !!loest);
        if (this.lay) this.layout();
    };

    P.vaelgOrd = function (r, g, v) {
        if (this.faerdig || !this.ord[r]) return;
        this.ord[r][g] = v;
        var raekke = this.tavle.querySelector('[data-raekke="' + r + '"]');
        if (raekke) {
            raekke.classList.remove("forkert");
            var knapper = raekke.querySelectorAll('[data-g="' + g + '"]');
            for (var i = 0; i < knapper.length; i++) {
                var valgt = (knapper[i].getAttribute("data-v") === "1") === v;
                knapper[i].classList.toggle("valgt", valgt);
                knapper[i].setAttribute("aria-pressed", valgt ? "true" : "false");
            }
        }
        this.nulstilHjaelp();
        if (this.fast.klasse === "skidt") this.naesteLinje("", "");
    };

    P.tjek = function () {
        if (this.faerdig || this.opg.fase !== "felter") return;
        var mig = this, mangler = false, fejl = null;
        this.ord.forEach(function (v, r) {
            var raekke = mig.tavle.querySelector('[data-raekke="' + r + '"]');
            var o = D.ORD[r], galt = false;
            if (v.s === null || v.k === null) { mangler = true; galt = true; }
            else {
                if (v.s !== K.erStaerk(o.syre)) { galt = true; if (!fejl) fejl = { r: r, del: "s" }; }
                if (v.k !== o.konc) { galt = true; if (!fejl) fejl = { r: r, del: "k" }; }
            }
            if (raekke) raekke.classList.toggle("forkert", galt);
        });
        if (mangler) { this.fejlLinje(D.ORD_MANGLER); this.rystTavle(); return; }
        if (fejl) { this.fejlLinje(D.ordFejl(fejl.r, fejl.del)); this.rystTavle(); return; }
        this.loest("selv", this.opg.o.loest);
    };

    P.rystTavle = function () {
        var e = this.tavle;
        e.classList.remove("ryst");
        void e.offsetWidth;
        e.classList.add("ryst");
    };

    P.felterSvar = function (o) { this.loest("svar", o.loest); };

    P.enter = function () { if (this.erTavle()) this.tjek(); };

    /* ----- Knappen og panelet ------------------------------------------------------------ */
    P.visVaerktoej = function () {
        /* Under gaettet staar kortet, hvor lupperne er, og knappen venter */
        this.vaerktoej.hidden = this.erTavle() || this.gaetNu();
        NK.el("f-anker-lup").hidden = this.erTavle() || this.gaetNu();
        NK.el("f-anker-glas").hidden = this.erTavle();
        this.knapF.disabled = !!this.fort || this.trin >= K.TRIN.length - 1;
        var g = this.opg;
        var mangler = !this.faerdig && !this.venter && g && g.fase === "forsoeg" && !this.fort && this.trin < g.o.forsoeg.krav;
        this.knapF.classList.toggle("banker", !!mangler);
    };

    P.visPanel = function () {
        var e = K.iLup("eddike", K.C0), s = K.iLup("HCl", K.TRIN[this.trin]);
        var gange = Math.round(K.C0 / K.TRIN[this.trin]);
        var html = '<div class="talraekke"><span>Eddikesyre</span><span class="tal">' + K.konc(K.C0) + "</span></div>" +
            '<div class="talraekke"><span>H₃O⁺ i luppen</span><span class="tal roed">omkring ' + e.delte + "</span></div>" +
            '<div class="talraekke skil"><span>Saltsyre</span><span class="tal">' + K.konc(K.TRIN[this.trin]) + "</span></div>" +
            '<div class="talraekke"><span>H₃O⁺ i luppen</span><span class="tal roed">' + (s.delte > 0 ? s.delte : "under 1") + "</span></div>" +
            '<div class="talraekke"><span>Fortyndet</span><span class="tal">' + (gange > 1 ? gange + " gange" : "ikke endnu") + "</span></div>";
        NK.saetHTML("f-toglas", html);
    };

    /* ----- Scenen -------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, baand = this.baand(), Hs = baand.y;
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
        lay.glasTop = glasTop;
        this.lay = lay;
        this.sig = [null, null];
        /* Knappen staar mellem de to glas */
        var v = this.vaerktoej;
        v.style.left = Math.round(W / 2) + "px";
        v.style.top = Math.round(glasTop + gh * 0.5) + "px";
        /* Tavlen staar under kortets plads og flytter sig ikke, naar kortet skifter.
           Glassene er vaek imens (se tegn), saa der er plads til den. */
        this.tavle.style.top = (10 + this.kortZone() + 8) + "px";
        this.saetAnker("glas", xs[0] - gb / 2 - 6, glasTop - 4, xs[1] - xs[0] + gb + 12, gh + 10);
        this.saetAnker("lup", lay.lup[0].x, lay.sigY - 18, lay.lup[1].x + lb - lay.lup[0].x, lh + 42);
    };

    P.opdaterScene = function (dt) {
        var g = this.opg, mig = this;
        if (this.fort) {
            var f = this.fort;
            f.t += dt;
            var u = f.t / FORT_SEK;
            if (u < SKIFT) this.glas[1].niveau = NK.lerp(1, 0.1, NK.blod(u / SKIFT));
            else this.glas[1].niveau = NK.lerp(0.1, 1, NK.blod((u - SKIFT) / (1 - SKIFT)));
            if (!f.skiftet && u >= SKIFT) {
                f.skiftet = true;
                this.trin++;
                this.glas[1].c = K.TRIN[this.trin];
                this.lup[1].saet("HCl", K.TRIN[this.trin]);
                this.visPanel();
            }
            if (u >= 1) {
                this.glas[1].niveau = 1;
                this.fort = null;
                this.setT = 0;
                this.visVaerktoej();
            }
        }
        this.glas.forEach(function (x) { x.opdater(dt); });
        if (!this.erTavle()) this.lup.forEach(function (l) { l.opdater(dt); });
        if (this.faerdig || this.venter || g.fase !== "forsoeg" || this.fort) return;
        if (this.trin === g.o.forsoeg.krav) {
            this.setT += dt;
            if (this.setT >= SET_SEK) { this.forsoegKlaret(g.o.forsoeg.set || ""); this.visVaerktoej(); }
        }
    };

    /* ----- Tegning ------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, mig = this;
        if (!lay) return;
        ctx.fillStyle = "#14141a";
        ctx.fillRect(0, 0, lay.W, lay.H);
        Tg.bord(ctx, lay.W, lay.yBord, lay.Hs);

        /* Vandet, der fyldes paa under en fortynding */
        if (this.fort && this.fort.t / FORT_SEK >= SKIFT) {
            var g1 = this.glas[1], m = g1.maal();
            ctx.fillStyle = "rgba(150, 205, 250, 0.55)";
            ctx.fillRect(g1.x - 34 * m.k, m.top - 26, 5, m.flade - m.top + 26);
        }

        /* I det sidste maal hoerer tavlen til fire andre flasker: glassene er vaek */
        var om = this.omNu();
        if (!this.erTavle()) {
            this.glas.forEach(function (g, i) {
                g.tegn(ctx, { etiket: [K.Navn(g.syre), K.konc(g.c)], ph: NK.visPH, tid: mig.tid, om: om.indexOf(i) >= 0 });
            });
        }

        if (this.fort) {
            var gl = this.glas[1], mm = gl.maal();
            Tg.maerkat(ctx, this.fort.t / FORT_SEK < SKIFT ? "9 tiendedele hældes fra" : "vand fyldes på", gl.x, mm.y0 - 16, { px: 14, farve: "#a8d4f5" });
        }

        if (!this.erTavle() && !this.gaetNu()) {
            this.lup.forEach(function (l, i) {
                var R = lay.lup[i], s = K.SYRE[l.syre];
                l.tegn(ctx, R, { skilte: true });
                Tg.zoomRamme(ctx, R, mig.glas[i].zoomFelt(), om.indexOf(i) >= 0);
                mig.sig[i] = Tg.signatur(ctx, R.x + R.b / 2, lay.sigY, l.syre, [
                    { slags: "hel", tekst: s.formel }, { slags: "ion", tekst: s.ion }, { slags: "ox", tekst: "H₃O⁺" }
                ], R.b);
                if (l.antal().haeldt === 0 && !mig.fort) {
                    NK.tekst(ctx, "I gennemsnit under 1 molekyle", R.x + R.b / 2, R.y + R.h / 2 - 4, { font: Tg.font("700", 15), justering: "center", farve: "#a8d4f5" });
                    NK.tekst(ctx, "i et rum af denne størrelse", R.x + R.b / 2, R.y + R.h / 2 + 18, { font: Tg.font("600", 14), justering: "center", farve: "#a8d4f5" });
                }
            });
        }
        this.tegnSejr(ctx, lay.W, lay.Hs);
    };

    /* ----- Musen ---------------------------------------------------------------------- */
    P.lupVed = function (pt) {
        if (this.erTavle() || this.gaetNu()) return -1;
        for (var i = 0; i < this.lup.length; i++) {
            var R = this.lay.lup[i];
            if (pt.x >= R.x && pt.x <= R.x + R.b && pt.y >= R.y && pt.y <= R.y + R.h) return i;
        }
        return -1;
    };

    P.sigVed = function (pt) {
        if (this.erTavle() || this.gaetNu()) return null;
        for (var i = 0; i < this.lup.length; i++) {
            var sl = Tg.signaturVed(this.sig[i], pt);
            if (sl) return { slags: sl, syre: this.lup[i].syre };
        }
        return null;
    };

    P.overScene = function (pt) {
        if (!pt || !this.lay) return null;
        if (this.sigVed(pt)) return "klik";
        var i = this.lupVed(pt);
        if (i >= 0 && this.lup[i].ved(pt.x - this.lay.lup[i].x, pt.y - this.lay.lup[i].y)) return "klik";
        return null;
    };

    P.klikScene = function (pt) {
        if (!this.lay) return;
        var sg = this.sigVed(pt);
        if (sg) { this.kortBesked(D.partikel(sg.slags, sg.syre, true), 7); return; }
        var i = this.lupVed(pt);
        if (i >= 0) {
            var hit = this.lup[i].ved(pt.x - this.lay.lup[i].x, pt.y - this.lay.lup[i].y);
            if (hit) this.kortBesked(D.partikel(hit.slags, this.lup[i].syre, true), 6);
            return;
        }
        for (var j = 0; j < this.glas.length && !this.erTavle(); j++) {
            if (!this.glas[j].rammer(pt)) continue;
            if (this.gaetNu()) { this.gaetBlink(); return; }
            var g = this.glas[j];
            this.kortBesked("Glasset med " + K.navn(g.syre) + ", " + K.konc(g.c) + ". Luppen over glasset viser et lille rum i " + K.navn(g.syre) + "n." +
                (j === 1 && !this.erTavle() ? " Knappen Fortynd 10 gange står mellem glassene." : ""), 5);
            return;
        }
    };

    NK.SimFortynd = SimFortynd;
}());
