/* =====================================================================
   sim_farve.js - fane 1: farven

   Øverst gaar hvidt lys fra lampen gennem kuvetten til øjet, og til
   hoejre staar farvecirklen. Nederst er absorptionsspektret.

   Byg farven: eleven traekker én top hen ad bølgelængderne, og kuvetten,
   farven og farvecirklen følger med. Stofferne (de fem fra den gamle
   b9.1): kuvetten er daekket, eleven klikker paa toppen af spektret og
   vaelger saa farven. Foerst da taendes lampen, og fotonerne viser, hvilket
   lys der bliver absorberet, og hvilket der slipper igennem.

   Alle farver regnes af spektret i js/farve.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var F = NK.Farve;
    var Tg = NK.Tg;

    /* Farven paa det lys, der bliver absorberet, som et af de seks svar */
    var LYS_TIL_SVAR = { violet: "Lilla", "blå": "Blå", "grøn": "Grøn", gul: "Gul", orange: "Orange", "rød": "Rød" };

    function SimFarve() {
        var mig = this;
        this.valg = NK.el("fa-valg");
        this.linjeEl = NK.el("fa-opgave");
        this.fotoner = [];
        this.blink = 0;
        this.startFane(D.FA, D.FA_GRUPPER);
        this.vaelg(0);
        window.addEventListener("resize", function () { mig.layout(); });
    }

    var P = SimFarve.prototype;
    NK.Fane.paa(P, { navn: "fa", naesteFane: "fane-ko", naesteNavn: "Konjugeringen" });

    P.chipTekst = function (o, i) { return String(i + 1); };

    /* ----- Opgaven ------------------------------------------------------------ */
    P.lavOpgave = function (i) {
        var o = this.opgaver[i];
        this.o = o;
        this.fotoner = [];
        this.hover = null;
        this.traek = false;
        this.forkerte = {};
        this.lysL = null;
        this.visLinjer = false;
        this.lysTone = undefined;
        this.glide = null;
        if (o.type === "byg") {
            this.trin = "byg";
            this.topL = o.start;
            this.lampe = true;
        } else {
            this.trin = "top";
            this.valgtL = null;
            this.lampe = false;
        }
        this.bygValg();
        this.visOpgavelinje();
    };

    P.toppe = function () {
        if (this.o.type === "byg") return [{ c: this.topL, w: D.FA_TOP.w, h: D.FA_TOP.h }];
        return this.o.toppe;
    };

    P.A = function (l) { return F.absorbans(this.toppe(), l); };

    /* Opløsningens farve, regnet af spektret (gemt, til spektret aendres) */
    P.farve = function () {
        var noegle = this.o.id + ":" + (this.o.type === "byg" ? Math.round(this.topL * 2) : "");
        if (this._fNoegle !== noegle) {
            this._fNoegle = noegle;
            var c = F.farve(this.toppe());
            this._f = { c: c, css: F.css(c), navn: F.navn(c), tone: F.hsv(c).h };
        }
        return this._f;
    };

    P.skjult = function () { return this.o.type === "stof" && !this.faerdig; };

    /* De toppe, der er markeret i farvecirklen */
    P.absorberet = function () {
        if (this.o.type === "byg") return [this.topL];
        if (this.valgtL === null) return [];
        var mig = this;
        return this.o.top.map(function (r) { return mig.maksI(r[0], r[1]); });
    };

    P.maksI = function (fra, til) {
        var bedst = fra, bedstA = -1;
        for (var l = fra; l <= til; l += 0.5) {
            var a = this.A(l);
            if (a > bedstA) { bedstA = a; bedst = l; }
        }
        return Math.round(bedst);
    };

    /* ----- Knapperne i scenen: de seks farver --------------------------------------- */
    P.bygValg = function () {
        var mig = this;
        this.valg.innerHTML = "";
        this.knapper = {};
        if (this.o.type !== "stof" || this.trin !== "farve") { this.layout(); return; }
        D.FARVER.forEach(function (f) {
            var k = document.createElement("button");
            k.type = "button";
            k.className = "valgknap farveknap";
            k.innerHTML = '<span class="fk-proeve" style="background:' + f.css + '"></span>' + NK.html(f.navn);
            k.addEventListener("click", function () { mig.svarFarve(f.navn); mig.fokus(); });
            if (mig.forkerte[f.navn]) { k.classList.add("forkert"); k.disabled = true; }
            mig.valg.appendChild(k);
            mig.knapper[f.navn] = k;
        });
        this.layout();
    };

    P.visOpgavelinje = function () {
        var o = this.o, t;
        if (o.type === "byg") t = this.faerdig ? "Opløsningen er " + o.maal.toLowerCase() + ". Prøv at trække toppen videre, og se farven skifte." :
            "Træk toppen, så opløsningen bliver " + o.maal.toLowerCase() + ".";
        else if (this.faerdig) t = "Opløsningen er " + o.farve.toLowerCase() + ". Hold musen over grafen for at se lyset ved hver bølgelængde.";
        else if (this.trin === "top") t = "Klik på toppen af kurven. Der absorberer stoffet mest lys.";
        else t = "Kuvetten er dækket. Hvilken farve har opløsningen? Vælg den under grafen.";
        NK.saetTekst("fa-opgave", t);
    };

    P.promptHTML = function () {
        var o = this.o;
        if (o.type === "byg") {
            return '<p class="maal-tekst">Træk toppen, så opløsningen bliver <b>' + NK.html(o.maal.toLowerCase()) + "</b>.</p>" +
                '<p class="note-tekst">Kurven viser, hvor meget lys stoffet absorberer ved hver bølgelængde. Lampen sender hvidt lys gennem kuvetten, og øjet ser det, der slipper igennem.</p>';
        }
        var trin1 = this.trin === "top" ? "aktiv" : "ok";
        var trin2 = this.faerdig ? "ok" : (this.trin === "farve" ? "aktiv" : "");
        var h = '<p class="stofnavn">' + NK.html(o.navn) + ' <span class="formel">' + NK.html(o.formel) + "</span></p>" +
            '<p class="note-tekst">' + NK.html(o.beskrivelse) + "</p>" +
            '<ol class="trinliste"><li class="' + trin1 + '">Find toppen' + (this.valgtL !== null ? ": " + this.valgtL + " nm" : "") + "</li>" +
            '<li class="' + trin2 + '">Vælg farven' + (this.faerdig ? ": " + NK.html(o.farve.toLowerCase()) : "") + "</li></ol>";
        if (this.faerdig) h += '<div class="forklaring"><p>' + NK.html(o.forklaring) + "</p>" +
            '<p class="maal">Et spektrofotometer måler ved toppen, ' + o.lmax + " nm, hvor stoffet absorberer mest.</p></div>";
        return h;
    };

    P.trinLinje = function () {
        if (this.trin === "byg") return "Træk i den gule knap på toppen, eller klik på grafen, hvor toppen skal stå.";
        if (this.trin === "top") return "Klik på grafen der, hvor kurven er højest.";
        return "Vælg farven med knapperne under grafen. Farvecirklen til højre kan hjælpe.";
    };

    /* ----- Hinttrappen og svaret ---------------------------------------------------- */
    P.hintTrin = function () {
        var o = this.o;
        if (this.trin === "byg") return [
            "Den farve, vi ser, står over for det lys, der bliver absorberet, i farvecirklen.",
            "Find " + o.maal.toLowerCase() + " i farvecirklen. Over for den står " + o.lys + ".",
            "Træk toppen til ca. " + o.svar + " nm."
        ];
        if (this.trin === "top") return [
            "Toppen er det sted, hvor kurven er højest. Der absorberer stoffet mest lys.",
            "Kurven er højest omkring " + o.lmax + " nm. Stedet lyser på grafen.",
            "Klik på grafen ved " + o.lmax + " nm."
        ];
        return [
            "Vi ser det lys, der slipper igennem kuvetten, ikke det lys, der bliver absorberet.",
            "Stoffet absorberer " + o.absorberer + ". Linjen i farvecirklen går fra det absorberede over til den farve, vi ser.",
            "Opløsningen er " + o.farve.toLowerCase() + "."
        ];
    };

    P.efterHint = function (n) {
        if (this.trin === "top" && n >= 2) this.lysL = this.o.lmax;
        if (this.trin === "farve" && n >= 2) this.visLinjer = true;
        if (this.trin === "byg" && n >= 2) {
            var mig = this;
            D.CIRKEL.forEach(function (c) { if (c.navn === mig.o.maal) mig.lysTone = c.tone; });
            this.visLinjer = true;
        }
        if (this.trin === "byg" && n >= 3) this.lysL = this.o.svar;
    };

    P.visSvar = function () {
        var o = this.o;
        if (this.trin === "byg") {
            this.glide = { fra: this.topL, til: o.svar, t: 0 };
            return;
        }
        if (this.trin === "top") {
            this.saetTop(o.lmax);
            this.besked('<span class="b-maerke">Svaret</span> ' + NK.html("Toppen ligger ved " + o.lmax + " nm. " + this.trinLinje()), "gul");
            return;
        }
        this.lampe = true;
        this.loest(o.forklaring);
        this.visOpgavelinje();
    };

    /* ----- Elevens handlinger --------------------------------------------------------- */
    P.saetTop = function (l) {
        this.valgtL = l;
        this.lysL = null;
        this.trin = "farve";
        this.hjaelp = 0;
        this.bygValg();
        this.visKort();
        this.visOpgavelinje();
    };

    /* Et klik paa grafen i trinnet Find toppen */
    P.vurderTop = function (l) {
        var o = this.o, mig = this;
        var ramt = null;
        o.top.forEach(function (r) { if (l >= r[0] - 2 && l <= r[1] + 2) ramt = r; });
        if (ramt) {
            var lm = this.maksI(ramt[0], ramt[1]);
            this.saetTop(lm);
            var navn = F.lysOrd(lm);
            this.godLinje("Toppen ligger ved " + lm + " nm. Der absorberer stoffet " + navn + " lys." +
                (o.top.length > 1 ? " Kurven har også en høj top ved " + this.maksI(o.top[1][0], o.top[1][1]) + " nm." : ""));
            return;
        }
        var anden = (o.andreToppe || []).some(function (r) { return l >= r[0] && l <= r[1]; });
        if (anden) {
            this.fejlLinje("Det er en top, men ikke den højeste. Find det sted, hvor kurven er allerhøjest.");
            return;
        }
        this.fejlLinje("Ved " + Math.round(l) + " nm er absorbansen kun " + Tg.tal(mig.A(l), 2) + ". Find det sted, hvor kurven er højest.");
    };

    P.svarFarve = function (navn) {
        var o = this.o;
        if (this.faerdig || this.trin !== "farve") return;
        if (navn === o.farve) {
            if (this.knapper[navn]) this.knapper[navn].classList.add("rigtig");
            this.lampe = true;
            this.fotoner = [];
            this.loest(o.forklaring);
            this.visOpgavelinje();
            for (var k in this.knapper) this.knapper[k].disabled = true;
            return;
        }
        this.forkerte[navn] = true;
        if (this.knapper[navn]) { this.knapper[navn].classList.add("forkert"); this.knapper[navn].disabled = true; }
        var absorberetSvar = LYS_TIL_SVAR[F.lysNavn(o.lmax)];
        var tekst = o.nej && o.nej[navn];
        if (!tekst && navn === absorberetSvar) tekst = "Det er farven på det lys, stoffet absorberer. Vi ser det lys, der slipper igennem.";
        if (!tekst) tekst = "Stoffet absorberer " + o.absorberer + ". Find det i farvecirklen, og se på farven over for det.";
        this.fejlLinje(tekst);
    };

    P.byggetFaerdig = function () {
        var o = this.o;
        var lt = Math.round(this.topL);
        this.loest("Toppen står ved " + lt + " nm. Stoffet absorberer " + F.lysOrd(lt) + " lys, og resten blander sig til " +
            o.maal.toLowerCase() + ". " + o.maal + " står over for " + o.lys + " i farvecirklen.");
        this.visOpgavelinje();
    };

    P.tjekByg = function () {
        if (this.faerdig || this.o.type !== "byg") return;
        if (this.farve().navn === this.o.maal) this.byggetFaerdig();
        else this.nulstilHjaelp();
    };

    P.enter = function () { if (this.faerdig) this.knap(); };

    /* Piletasterne flytter toppen */
    P.pil = function (r) {
        if (this.o.type !== "byg") return false;
        this.topL = NK.klamp(this.topL + r * 5, 400, 700);
        this.tjekByg();
        return true;
    };

    /* ----- Layout ------------------------------------------------------------------- */
    P.layout = function () {
        if (!this.L) return;
        this.L.tilpas();
        var W = this.L.b, H = this.L.h;
        var band = this.baand();
        var linjeBund = this.linjeEl ? this.linjeEl.offsetTop + this.linjeEl.offsetHeight : 40;
        var valgH = this.valg && this.valg.children.length ? this.valg.offsetHeight + 14 : 0;
        if (this.valg) this.valg.style.bottom = (band.h + 12) + "px";
        var top0 = linjeBund + 12;
        var bund = band.y - (valgH ? valgH + 8 : 14);
        var avail = Math.max(200, bund - top0);
        var r1h = NK.klamp(avail * 0.4, 130, 250);
        /* farvecirklen: plads til navnene over og under ringen */
        var R = Math.max(40, Math.min(r1h / 2 - 32, W * 0.11, 92));
        var lay = {
            W: W, H: H,
            r1: { x: 14, y: top0, b: W - 28, h: r1h },
            cirkel: { x: W - R - 58, y: top0 + 20 + (r1h - 20) / 2, R: R },
            graf: { x: 14, y: top0 + r1h + 10, b: W - 28, h: Math.max(140, bund - top0 - r1h - 10) }
        };
        var vejX0 = 30, vejX1 = lay.cirkel.x - R - 70;
        var vb = vejX1 - vejX0;
        lay.cy = top0 + r1h * 0.56;
        lay.lampe = { x: vejX0 + 24, y: lay.cy, s: Math.min(44, r1h * 0.26) };
        lay.kuv = { b: NK.klamp(r1h * 0.3, 40, 66), h: r1h * 0.66 };
        lay.kuv.x = vejX0 + vb * 0.46 - lay.kuv.b / 2;
        lay.kuv.y = lay.cy - lay.kuv.h * 0.55;
        lay.oeje = { x: vejX0 + vb * 0.86, y: lay.cy, s: Math.min(28, r1h * 0.15) };
        lay.straale = { y0: lay.cy - lay.kuv.h * 0.22, y1: lay.cy + lay.kuv.h * 0.3 };
        this.lay = lay;
        this.saetAnker("lys", vejX0 - 10, top0, vb + 40, r1h);
        this.saetAnker("cirkel", lay.cirkel.x - R - 50, top0, 2 * R + 100, r1h);
        this.saetAnker("graf", lay.graf.x, lay.graf.y, lay.graf.b, lay.graf.h);
    };

    /* ----- Tegneloekken ------------------------------------------------------------- */
    P.opdaterScene = function (dt) {
        var lay = this.lay;
        if (!lay) return;
        if (this.glide) {
            this.glide.t = Math.min(1, this.glide.t + dt / 0.9);
            this.topL = NK.lerp(this.glide.fra, this.glide.til, NK.blod(this.glide.t));
            if (this.glide.t >= 1) {
                this.glide = null;
                this.byggetFaerdig();
            }
        }
        if (this.blink > 0) this.blink = Math.max(0, this.blink - dt);

        /* fotonerne */
        var kuvX0 = lay.kuv.x, kuvX1 = lay.kuv.x + lay.kuv.b;
        if (this.lampe) {
            this.spawn = (this.spawn || 0) + dt * 70;
            while (this.spawn >= 1) {
                this.spawn -= 1;
                this.fotoner.push({
                    l: 400 + Math.random() * 300,
                    x: lay.lampe.x + lay.lampe.s * 0.5,
                    y: NK.r(lay.straale.y0, lay.straale.y1),
                    v: NK.r(220, 290), ude: false, flash: 0, besluttet: false, stop: null
                });
            }
        }
        for (var i = this.fotoner.length - 1; i >= 0; i--) {
            var p = this.fotoner[i];
            if (p.flash > 0) {
                p.flash -= dt;
                if (p.flash <= 0) this.fotoner.splice(i, 1);
                continue;
            }
            p.x += p.v * dt;
            if (!p.besluttet && p.x >= kuvX0) {
                p.besluttet = true;
                var T = Math.pow(10, -this.A(p.l));
                if (Math.random() > T) p.stop = NK.r(kuvX0 + 4, kuvX1 - 4);
            }
            if (p.stop !== null && p.x >= p.stop) { p.flash = 0.35; p.x = p.stop; continue; }
            if (p.x > lay.oeje.x - lay.oeje.s) this.fotoner.splice(i, 1);
        }
        if (this.fotoner.length > 400) this.fotoner.splice(0, this.fotoner.length - 400);
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        this.L.ryd();
        var f = this.farve();
        var skjul = this.skjult();
        var lys = this.lampe;

        /* straalen: hvid ind i kuvetten, farvet efter den */
        var y0 = lay.straale.y0, y1 = lay.straale.y1;
        ctx.save();
        if (lys) {
            ctx.fillStyle = "rgba(255, 255, 250, 0.10)";
            ctx.fillRect(lay.lampe.x, y0, lay.kuv.x - lay.lampe.x, y1 - y0);
            ctx.fillStyle = F.css(f.c, 0.16);
            ctx.fillRect(lay.kuv.x + lay.kuv.b, y0, lay.oeje.x - lay.kuv.x - lay.kuv.b - lay.oeje.s, y1 - y0);
        }
        ctx.restore();

        Tg.lampe(ctx, lay.lampe.x, lay.lampe.y, lay.lampe.s, lys);
        Tg.etiket(ctx, "Hvidt lys", lay.lampe.x - lay.lampe.s * 0.5, lay.r1.y + 14);

        /* fotonerne */
        ctx.save();
        this.fotoner.forEach(function (p) {
            var c = F.css(F.lys(p.l));
            if (p.flash > 0) {
                var t = 1 - p.flash / 0.35;
                ctx.strokeStyle = F.css(F.lys(p.l), 1 - t);
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3 + t * 9, 0, Math.PI * 2);
                ctx.stroke();
            } else {
                ctx.fillStyle = c;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2.6, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        ctx.restore();

        Tg.kuvette(ctx, lay.kuv.x, lay.kuv.y, lay.kuv.b, lay.kuv.h, { farve: skjul ? null : F.css(f.c, 0.88), skjult: skjul });
        Tg.etiket(ctx, "Kuvette", lay.kuv.x + lay.kuv.b / 2, lay.r1.y + 14, { just: "center" });

        /* øjet og det, vi ser */
        var oe = lay.oeje;
        Tg.oeje(ctx, oe.x, oe.y, oe.s, this.blink > 0 ? Math.sin(this.blink / 0.3 * Math.PI) : 0);
        Tg.etiket(ctx, "Det, vi ser", oe.x, lay.r1.y + 14, { just: "center" });
        /* proeven med farven og navnet inde i den */
        var pb = 84, ph = 30, px = oe.x - pb / 2, py = Math.min(oe.y + oe.s + 10, lay.r1.y + lay.r1.h - ph - 2);
        NK.rundtRekt(ctx, px, py, pb, ph, 7);
        ctx.fillStyle = skjul ? "#3b3e4a" : f.css;
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        NK.tekst(ctx, skjul ? "?" : f.navn, oe.x, py + 20.5, { font: "800 14px 'Segoe UI', sans-serif", farve: "#ffffff", justering: "center", kant: !skjul, kantFarve: "rgba(10, 10, 16, 0.7)" });

        /* farvecirklen */
        var c = lay.cirkel;
        var visSet = !skjul;
        Tg.cirkel(ctx, c.x, c.y, c.R, {
            absorberet: this.absorberet(),
            linjer: this.visLinjer || visSet,
            set: visSet ? { tone: f.tone, css: f.css } : null,
            lysTone: this.lysTone
        });
        Tg.etiket(ctx, "Farvecirklen", c.x, lay.r1.y + 14, { just: "center" });

        /* grafen */
        var mig = this;
        var mark = [];
        if (this.o.type === "stof" && this.valgtL !== null) mark.push({ l: this.valgtL, tekst: "λmax = " + this.valgtL + " nm" });
        this.g = Tg.graf(ctx, lay.graf, {
            xmin: 400, xmax: 700, ymax: 2,
            kurver: [{ A: function (l) { return mig.A(l); } }],
            mark: mark,
            hover: this.hover !== null && !this.traek ? { l: this.hover } : null,
            haandtag: this.o.type === "byg" ? { l: this.topL, A: this.A(this.topL), over: this.overHaandtag || this.traek } : null
        });
        /* hintet: et lysende baand omkring det sted, hintet handler om */
        if (this.lysL !== null && this.lysL !== undefined) {
            var x = this.g.l2x(this.lysL);
            var a = 0.18 + 0.12 * Math.sin(this.tid * 5);
            ctx.fillStyle = "rgba(242, 197, 61, " + a + ")";
            ctx.fillRect(x - 10, this.g.y0, 20, this.g.y1 - this.g.y0);
        }
    };

    /* ----- Musen --------------------------------------------------------------------- */
    P.paaHaandtag = function (pt) {
        if (!this.g || this.o.type !== "byg") return false;
        var hx = this.g.l2x(this.topL), hy = this.g.a2y(this.A(this.topL));
        return Math.hypot(pt.x - hx, pt.y - hy) < 22;
    };

    P.paaOeje = function (pt) {
        var oe = this.lay && this.lay.oeje;
        return oe && Math.abs(pt.x - oe.x) < oe.s * 1.2 && Math.abs(pt.y - oe.y) < oe.s;
    };

    P.overScene = function (pt) {
        if (!pt) { this.hover = null; this.overHaandtag = false; return null; }
        this.overHaandtag = this.paaHaandtag(pt);
        this.hover = this.g && this.g.inde(pt) ? NK.klamp(this.g.x2l(pt.x), 400, 700) : null;
        if (this.overHaandtag) return "greb";
        if (this.paaOeje(pt)) return "klik";
        if (this.hover !== null && (this.o.type === "byg" || (this.trin === "top" && !this.faerdig))) return "klik";
        return null;
    };

    P.nedScene = function (pt) {
        if (this.o.type !== "byg" || this.glide || !this.g) return false;
        if (this.paaHaandtag(pt) || this.g.inde(pt)) {
            this.traek = true;
            this.topL = NK.klamp(this.g.x2l(pt.x), 400, 700);
            return true;
        }
        return false;
    };

    P.flytScene = function (pt) {
        if (!this.traek) return;
        this.topL = NK.klamp(this.g.x2l(pt.x), 400, 700);
    };

    P.opScene = function () {
        if (!this.traek) return;
        this.traek = false;
        this.tjekByg();
    };

    P.klikScene = function (pt) {
        if (this.paaOeje(pt)) {
            this.blink = 0.3;
            this.kortBesked("Øjet har tre slags tappe: til rødt, grønt og blåt lys. Hver farve, du ser, er en blanding af de tre.", 6);
            return;
        }
        if (this.o.type === "stof" && this.trin === "top" && !this.faerdig && this.g && this.g.inde(pt)) {
            this.vurderTop(NK.klamp(this.g.x2l(pt.x), 400, 700));
        }
    };

    NK.SimFarve = SimFarve;
}());
