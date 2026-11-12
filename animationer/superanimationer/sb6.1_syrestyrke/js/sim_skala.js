/* =====================================================================
   sim_skala.js - fane 1: Syreskalaen

   Bogens skala (b6-pks-skala) med Kₛ-skalaen lige over pKₛ-skalaen, saa
   eleven ser, at den ene vender omvendt af den anden. Fem flasker
   (D.SKALA) kommer én ad gangen paa hylden med Kₛ paa skiltet. Eleven
   traekker flasken op paa skalaen (eller klikker paa skalaen), og
   markoeren viser Kₛ og pKₛ dér. Luppen viser 100 af syrens partikler i
   0,10 M ved markoerens Kₛ, saa eleven ser, hvad tallet betyder.
   Intet bedoemmes, foer eleven trykker Indsend svar. Til sidst et
   spoergsmaal om faktoren 10 (D.SKALA_SPM).

   Luppen er skjult, til flasken foerste gang roerer skalaen (brugerens
   oenske om ro i baggrunden), og den staar stille, naar markoeren ikke
   flyttes.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var F = NK.Formel;
    var T = NK.Tegning;
    var NOEGLE = "nk-sb6.1-skala";

    function SimSkala() {
        var mig = this;
        this.hentStatus();
        this.startFane();
        this.lup = new NK.Lup();
        NK.el("k-forfra").addEventListener("click", function () { mig.forfra(); });
    }

    var P = SimSkala.prototype;
    NK.Fane.paa(P, "k");

    /* ----- Hukommelsen ------------------------------------------------------------ */
    P.hentStatus = function () {
        var g = NK.hent(NOEGLE, {}) || {};
        this.status = { loest: !!g.l, stjerne: !!g.s };
    };
    P.gem = function () { NK.gem(NOEGLE, { l: this.status.loest ? 1 : 0, s: this.status.stjerne ? 1 : 0 }); };

    /* ----- Panelet ------------------------------------------------------------------ */
    P.visListe = function () {
        var mig = this, html = "";
        D.SKALA.forEach(function (f, j) {
            var kl = j < mig.nr || (j === mig.nr && mig.groen) ? "faerdig" : (j === mig.nr ? "nu" : "");
            html += '<li class="' + kl + '"><span class="tr-nr">' + (j + 1) + "</span><span>" + NK.html(D.Navn(f.id)) + "</span></li>";
        });
        var j6 = D.SKALA.length, kl6 = this.faerdig ? "faerdig" : (this.nr === j6 ? "nu" : "");
        html += '<li class="' + kl6 + '"><span class="tr-nr">' + (j6 + 1) + "</span><span>Faktoren 10</span></li>";
        NK.saetHTML("k-trin", html);
        NK.saetTekst("k-maerke", this.status.stjerne ? "★ uden fejl" : (this.status.loest ? "✓ gennemført" : ""));
    };

    /* ----- Forloebet ------------------------------------------------------------------ */
    P.vaelg = function () {
        this.nr = 0;
        this.fejl = false;
        this.sv = false;
        this.faerdig = false;
        this.placeret = [];
        this.sejrT = null;
        this.startFlaske(0);
    };

    P.erSpm = function () { return this.nr >= D.SKALA.length; };

    P.startFlaske = function (j) {
        this.nr = j;
        this.groen = null;
        this.valgt = null;
        this.forkerte = {};
        this.besked("", "");
        if (!this.erSpm()) {
            this.id = D.SKALA[j].id;
            this.flaske = { p: null, greb: false, mus: null, over: false, rykket: false };
            this.lupVist = false;
            this.lup.saetSyre(this.id);
        }
        this.nulstilHjaelp();
        this.visKort();
        this.visListe();
        this.layout();
    };

    P.kortData = function () {
        if (this.erSpm()) {
            var q = D.SKALA_SPM, mig = this;
            return { slags: "spm", chip: "Spørgsmål", tekst: q.tekst,
                     svar: q.svar.map(function (t, j) { return { t: t, valgt: mig.valgt === j, forkert: !!mig.forkerte[j] }; }) };
        }
        return { slags: "opgave", chip: "Flaske " + (this.nr + 1) + " af " + D.SKALA.length, tekst: D.skalaTekst(this.id) };
    };

    P.svarValg = function (j) {
        if (!this.erSpm() || this.groen) return;
        this.valgt = j;
        this.visKort();
    };

    P.kanSendes = function () {
        if (this.erSpm()) return this.valgt !== null;
        return this.flaske.p !== null && !this.flaske.greb;
    };

    P.indsendTekst = function () {
        if (!this.erSpm() && this.flaske.p !== null) return "Indsend svar: pKₛ = " + D.tal1(this.flaske.p);
        return "Indsend svar";
    };

    P.ingentingTekst = function () {
        return this.erSpm() ? "Vælg et svar på kortet først." : "Træk flasken op på pKₛ-skalaen først.";
    };

    P.indsend = function () {
        if (this.erSpm()) {
            var q = D.SKALA_SPM;
            if (this.valgt === q.rigtig) { this.rigtigt(false); return; }
            this.fejl = true;
            this.forkerte[this.valgt] = true;
            var v = this.valgt;
            this.valgt = null;
            this.visKort();
            this.fejlLinje(q.fejl[v] || "Ikke rigtigt.");
            return;
        }
        var s = D.SYRER[this.id];
        if (Math.abs(this.flaske.p - s.pks) <= D.SKALA_TOL + 1e-9) { this.rigtigt(false); return; }
        this.fejl = true;
        this.fejlLinje(D.skalaFejl(this.id, this.flaske.p));
    };

    P.rigtigt = function (vist) {
        var sidste = this.erSpm(), tekst, foerste = false;
        if (vist) this.sv = true;
        if (!sidste) {
            var s = D.SYRER[this.id];
            this.flaske.p = s.pks;
            this.flaske.over = false;
            this.lupVist = true;
            this.lup.saetKs(s.ks, false);
            this.placeret.push({ id: this.id, p: s.pks, ny: 0 });
            tekst = D.SKALA[this.nr].forkl;
            this.groen = { spm: true, maade: vist ? "svar" : "selv", tekst: tekst,
                           knap: this.nr < D.SKALA.length - 1 ? "Næste flaske →" : "Næste spørgsmål →" };
        } else {
            foerste = !this.status.loest;
            this.status.loest = true;
            this.status.stjerne = this.status.stjerne || (!this.fejl && !this.sv);
            this.gem();
            this.faerdig = true;
            this.groen = { spm: true, maade: vist ? "svar" : "selv", svarNr: D.SKALA_SPM.rigtig, tekst: D.SKALA_SPM.forkl,
                           knap: "Videre til Regn på syren →" };
        }
        this.sejrT = 0;
        this.besked("", "");
        this.visKort();
        this.visListe();
        if (sidste && foerste) NK.konfettiRegn(NK.el("fane-k").querySelector(".scene"), 60);
    };

    P.videre = function () {
        if (this.faerdig) { if (NK.visFane) NK.visFane("fane-r"); return; }
        this.startFlaske(this.nr + 1);
    };

    P.forfra = function () {
        this.status = { loest: false, stjerne: false };
        this.gem();
        this.vaelg(0);
    };
    P.nulstil = function () { if (!this.groen) this.vaelg(0); };

    P.hintNu = function () {
        if (this.groen) return [];
        return this.erSpm() ? D.SKALA_SPM.hint : D.skalaHint(this.id);
    };

    P.visSvar = function () {
        this.sv = true;
        if (this.erSpm()) { this.valgt = D.SKALA_SPM.rigtig; this.rigtigt(true); return; }
        this.rigtigt(true);
    };

    /* ----- Markoeren og luppen ---------------------------------------------------------- */
    P.snap = function (x) {
        var p = Math.round(T.xTilPks(this.s, x) / D.SKALA_SKRIDT) * D.SKALA_SKRIDT;
        return Math.round(NK.klamp(p, D.SKALA_MIN, D.SKALA_MAX) * 10) / 10;
    };

    P.saetP = function (p) {
        if (p === this.flaske.p) return;
        this.flaske.p = p;
        if (p !== null) {
            this.lupVist = true;
            this.lup.saetKs(D.ksFraPks(p), false);
        }
        this.visIndsend();
    };

    /* Piletasterne flytter flasken 0,1 */
    P.pil = function (r) {
        if (this.groen || this.erSpm() || this.flaske.p === null) return;
        this.saetP(Math.round(NK.klamp(this.flaske.p + r * D.SKALA_SKRIDT, D.SKALA_MIN, D.SKALA_MAX) * 10) / 10);
    };

    P.opdaterScene = function (dt) {
        this.lup.opdater(dt);
        this.placeret.forEach(function (f) { f.ny += dt; });
    };

    /* ----- Musen ------------------------------------------------------------------------- */
    P.paaFlaske = function (pt) {
        if (!pt || this.erSpm() || this.groen) return false;
        var f = this.flaske;
        if (f.p === null) {
            var k = this.flaskeKasse;
            return k && pt.x > k.x - 6 && pt.x < k.x + k.w + 6 && pt.y > k.y - 6 && pt.y < k.y + k.h + 6;
        }
        var x = T.pksTilX(this.s, f.p);
        return Math.abs(pt.x - x) < 18 && pt.y > this.s.yKtal - 14 && pt.y < this.s.bund + 8;
    };

    P.overScene = function (pt) {
        if (!pt) return null;
        if (this.paaFlaske(pt)) return this.flaske.greb ? "grabbing" : "grab";
        if (!this.groen && !this.erSpm() && T.paaSkala(this.s, pt)) return "pointer";
        return null;
    };

    P.nedScene = function (pt) {
        if (this.groen || this.erSpm()) return false;
        var f = this.flaske;
        if (this.paaFlaske(pt) || T.paaSkala(this.s, pt)) {
            f.greb = true;
            f.rykket = true;
            f.mus = pt;
            this.flytScene(pt);
            return true;
        }
        return false;
    };

    P.flytScene = function (pt) {
        var f = this.flaske;
        if (!f.greb) return;
        f.mus = pt;
        if (T.paaSkala(this.s, pt, 12)) {
            f.over = true;
            this.saetP(this.snap(pt.x));
        } else {
            f.over = false;
        }
    };

    P.opScene = function (pt) {
        var f = this.flaske;
        if (!f.greb) return;
        if (pt) this.flytScene(pt);
        f.greb = false;
        if (!f.over) { f.p = null; }
        f.over = false;
        this.visIndsend();
    };

    P.klikScene = function () {
        if (this.groen) { this.kortBlink(); return; }
        this.kortBlink();
        this.kortBesked(this.erSpm() ? "Vælg et svar på kortet, og tryk Indsend svar." : "Træk flasken op på pKₛ-skalaen, eller klik på skalaen.", 3);
    };

    /* ----- Layout --------------------------------------------------------------------------- */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle;
        var k = NK.klamp((t.h - 150) / 220, 0.78, 1.12);
        this.s = T.skalaLay(t.x + 10, t.y + 10, t.b - 20, k);
        var y0 = this.s.bund + 14 * k, ned = t.y + t.h - y0 - 10;
        /* Hylden med flasken og skiltet til venstre, luppen til hoejre */
        var fb = Math.round(NK.klamp((ned - 26) / 1.625, 44, 70));
        this.hylde = { x: t.x + 20, y: y0 + 6, b: 250, h: ned - 6, fb: fb };
        this.flaskeKasse = { x: this.hylde.x + 6, y: t.y + t.h - 14 - fb * 1.625, w: fb, h: fb * 1.625 };
        var lh = Math.max(110, ned - 24 - 50);
        var lx = this.hylde.x + this.hylde.b + 24, lb = Math.max(200, Math.min(t.x + t.b - 16 - lx, lh * 2.6 + 40));
        this.lupR = { x: lx, y: y0 + 22, b: lb, h: lh };
        var s = this.s;
        this.saetAnker("skala", s.x0 - 70, s.y - 4, s.x1 - s.x0 + 84, s.bund - s.y + 6);
        this.saetAnker("hylde", this.hylde.x - 6, this.hylde.y - 4, this.hylde.b + 12, this.hylde.h + 6);
        this.saetAnker("lup", lx - 4, y0, lb + 8, lh + 56);
    };

    /* ----- Tegning ------------------------------------------------------------------------ */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var t = lay.tavle, s = this.s, mig = this;
        if (t.b < 200) return;
        T.tavle(ctx, lay);
        T.skala(ctx, s, { pil: false });

        /* Syrerne, der staar paa skalaen */
        var gule = this.erSpm() && !this.faerdig ? D.SKALA_SPM.gule : [];
        var liste = this.placeret.map(function (f) { return { p: f.p, tekst: D.SYRER[f.id].syre + " " + D.tal2(f.p), id: f.id, ny: f.ny }; });
        var raekker = T.flagRaekker(ctx, s, liste);
        liste.forEach(function (f, i) {
            var ny = f.ny < 1.2 && mig.groen && !mig.erSpm() && f.id === mig.id;
            T.flag(ctx, s, f.p, f.tekst, raekker[i], { gul: gule.indexOf(f.id) >= 0, fyld: ny ? "#e6f6ec" : "#ffffff", kant: ny ? T.GROEN : undefined });
        });
        /* Under spoergsmaalet: Kₛ ved de to gule */
        if (gule.length) {
            gule.forEach(function (id, j) {
                var p = D.SYRER[id].pks;
                T.markoer(ctx, s, p, { farve: "#8a6d12", side: j === 0 ? "venstre" : "hoejre", tekstK: "K_s = " + D.potensC(D.SYRER[id].ks, 2) + " M", tekstP: "pK_s = " + D.tal2(p) });
            });
        }

        if (!this.erSpm()) this.tegnFlaske(ctx, t);
        if (this.lupVist && !this.erSpm()) this.tegnLup(ctx);
        this.tegnSejr(ctx, t);
    };

    P.tegnFlaske = function (ctx, t) {
        var f = this.flaske, s = this.s, h = this.hylde, syre = D.SYRER[this.id];
        /* Hylden */
        ctx.save();
        var hy = this.flaskeKasse.y + this.flaskeKasse.h;
        var g = ctx.createLinearGradient(0, hy, 0, hy + 10);
        g.addColorStop(0, "#c9b28c");
        g.addColorStop(1, "#8f7650");
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, h.x - 4, hy, h.b + 8, 9, 3);
        ctx.fill();
        ctx.restore();
        /* Skiltet ved flasken: navn, formel og Kₛ */
        var kx = this.flaskeKasse.x + this.flaskeKasse.w + 14, ky = this.flaskeKasse.y + 4, kb = h.x + h.b - kx;
        var fs = NK.klamp(s.k * 15, 13, 16);
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.12)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = "#fffdf5";
        NK.rundtRekt(ctx, kx, ky, kb, fs * 4.6, 8);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = "#cdbf96";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
        NK.tekst(ctx, D.Navn(this.id), kx + 10, ky + fs * 1.0, { font: "800 " + fs + "px " + T.FONT, farve: T.BLAEK, linje: "middle" });
        F.tekst(ctx, syre.syre, kx + 10, ky + fs * 2.25, fs, T.DAEMPET, "left", { vaegt: 700 });
        F.tekst(ctx, "K_s = " + D.potensC(syre.ks, 2) + " M", kx + 10, ky + fs * 3.5, fs, "#1f4f8f", "left", { vaegt: 800 });

        var etiket = [{ t: syre.syre, fs: 11 }];
        /* Flasken: paa hylden, i haanden eller paa skalaen */
        if (f.greb && !f.over && f.mus) {
            var b = this.flaskeKasse.w;
            T.flaske(ctx, f.mus.x - b / 2, f.mus.y - b * 0.8, b, etiket, { loeftet: true });
            return;
        }
        if (f.p === null) {
            T.flaske(ctx, this.flaskeKasse.x, this.flaskeKasse.y, this.flaskeKasse.w, etiket, {});
            if (!f.rykket && !this.groen) {
                T.skilt(ctx, this.flaskeKasse.x + this.flaskeKasse.w / 2, this.flaskeKasse.y - 2, "Træk flasken op på skalaen", { min: t.x + 6, maks: t.x + t.b - 6 });
            }
            return;
        }
        /* Paa skalaen: markoeren og en lille flaske ved den */
        var loest = !!this.groen;
        T.markoer(ctx, s, f.p, { farve: loest ? T.GROEN : (f.greb ? T.VALG : "#2a3342"),
                                 tekstP: "pK_s = " + (loest ? D.tal2(f.p) : D.tal1(f.p)),
                                 tekstK: loest ? "K_s = " + D.potensC(syre.ks, 2) + " M" : undefined });
        if (!loest) {
            var mb = Math.min(30, (s.bund - s.yFlag) / 1.7), mx = T.pksTilX(s, f.p);
            T.flaske(ctx, mx - mb / 2, s.yFlag + 2, mb, [], { loeftet: f.greb });
        }
    };

    P.tegnLup = function (ctx) {
        var R = this.lupR, syre = D.SYRER[this.id] || D.SYRER.eddike, id = this.id;
        var fs = 14;
        NK.tekst(ctx, "Luppen: 100 partikler i 0,10 M " + syre.navn, R.x, R.y - 11, { font: "800 " + fs + "px " + T.FONT, farve: T.BLAEK, linje: "middle" });
        this.lup.tegn(ctx, R);
        /* Signaturen med antallet under vinduet */
        var a = this.lup.antal(), y = R.y + R.h + 17, x = R.x + 4, k = NK.klamp(R.h / 150, 0.9, 1.25);
        [["hel", syre.syre, a.hele], ["ion", syre.base, a.delte], ["ox", "H_3O^+", a.ox]].forEach(function (d) {
            NK.Lup.ikon(ctx, d[0], id, x + 12, y, k);
            var tb = F.tekst(ctx, d[1], x + 28, y, 14, T.BLAEK, "left", { vaegt: 700 });
            NK.tekst(ctx, String(d[2]), tb.x + tb.w + 6, y + 1, { font: "800 14px " + T.FONT, farve: "#1f4f8f", linje: "middle" });
            x = tb.x + tb.w + 46;
        });
        var p = this.flaske.p, ks = this.lup.ks;
        if (ks) {
            var pct = 100 * D.andel(ks, D.LUP_C);
            var pt = pct >= 99.95 ? "100 %" : (pct < 0.01 ? "under 0,01 %" : NK.betydende(pct, 2) + " %");
            var lt = "Omdannelsesgrad: " + pt;
            NK.tekst(ctx, lt, R.x + 4, y + 22, { font: "600 13px " + T.FONT, farve: T.DAEMPET, linje: "middle" });
        }
        void p;
    };

    NK.SimSkala = SimSkala;
}());
