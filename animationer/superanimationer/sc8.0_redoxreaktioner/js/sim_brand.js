/* =====================================================================
   sim_brand.js - fane 1: Magnesium braender

   Til venstre makroniveauet som i bogens figur mg-trin: en tang holder et
   magnesiumbaand over en skaal. Et klik paa baandet antaender det: et
   skarpt, hvidt lys loeber fra enden ind mod tangen, der stiger hvid roeg
   op, og et hvidt pulver af magnesiumoxid samler sig i skaalen. Til hoejre
   luppen (mikroniveauet, js/lup.js): de to oxygenatomer fra et dioxygen-
   molekyle kommer ned over to magnesiumatomer, og hvert magnesiumatom
   afgiver sine 2 yderste elektroner i en blaa bue til et oxygenatom.
   Bagefter ligger ionerne i et iongitter.

   Naar baandet har braendt, staar bogens tre knapper Foer, Braender og
   Efter under luppen. Braender (eller et klik paa luppen) viser forloebet
   igen, baade baandet og luppen, saa eleven kan se efter, mens et
   spoergsmaal staar paa kortet. Det er at se naermere paa det, der er
   fremme, og er derfor ikke laast.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;
    var ML = NK.MgLup;

    var T_LUP = 0.4;                         /* luppen begynder lidt efter lyset */
    var T_BRAND = 6.0;                       /* baandet er braendt */
    var T_FAERDIG = T_LUP + ML.T_SLUT + 0.2; /* alt staar stille */
    var FANER = [{ id: "foer", t: "Før" }, { id: "braender", t: "Brænder" }, { id: "efter", t: "Efter" }];

    function SimBrand() {
        this.tidS = -1;
        this.spiller = false;
        this.braendt = false;
        this.roeg = [];
        this.roegT = 0;
        this.over = null;
        this.startFane(D.B_MAAL);
    }

    var P = SimBrand.prototype;
    NK.Fane.paa(P, { navn: "b", naesteFane: "fane-d", naesteNavn: "Delreaktioner" });

    /* ----- Maalene ------------------------------------------------------------------- */
    P.nyOpgave = function (o) {
        this.roeg = [];
        if (o.forsoeg) {
            /* Et nyt baand */
            this.tidS = -1;
            this.spiller = false;
            this.braendt = false;
        } else {
            this.tidS = T_FAERDIG;
            this.spiller = false;
            this.braendt = true;
        }
    };

    P.nulstilScene = function () {
        if (!this.iForsoeg()) { this.vaelg(this.nr); return; }
        if (this.spiller) { this.kortBlink(); return; }
        this.nyOpgave(this.opg.o);
    };

    P.antaend = function () {
        if (this.spiller || this.braendt) return;
        this.tidS = 0;
        this.spiller = true;
        this.roeg = [];
        this.nulstilHjaelp();
    };

    /* Vis svaret i forsoeget: baandet braender for eleven */
    P.forsoegSvar = function () {
        if (!this.spiller && !this.braendt) { this.tidS = 0; this.spiller = true; this.roeg = []; }
        this.braendt = true;
        return "";
    };

    P.sceneLinje = function () { return ""; };

    /* ----- Knapperne under luppen ------------------------------------------------------ */
    P.visFaner = function () { return this.braendt && !(this.iForsoeg() && this.spiller); };

    P.aktivFane = function () {
        if (this.tidS < 0) return "foer";
        if (this.spiller) return "braender";
        return "efter";
    };

    P.vaelgFane = function (id) {
        this.roeg = [];
        if (id === "foer") { this.tidS = -1; this.spiller = false; }
        else if (id === "braender") { this.tidS = 0; this.spiller = true; }
        else { this.tidS = T_FAERDIG; this.spiller = false; }
    };

    /* ----- Scenen -------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var top = 10 + this.kortZone() + 8;
        var bordY = H - NK.klamp(H * 0.08, 34, 60);
        var hovedH = 26, fanerH = 34;
        var R = Math.min(W * 0.235, (bordY - top - hovedH - fanerH - 22) / 2);
        R = Math.max(70, R);
        var cx = W * 0.71, cy = top + hovedH + 6 + R;
        var lup = { cx: cx, cy: cy, R: R };
        /* Faneknapperne under luppen */
        var fb = NK.klamp(R * 0.5, 74, 104), fg = 10, fy = cy + R + 14;
        var faner = FANER.map(function (f, i) {
            return { id: f.id, t: f.t, x: cx - (3 * fb + 2 * fg) / 2 + i * (fb + fg), y: fy, b: fb, h: 30 };
        });
        /* Makroniveauet */
        var x0 = W * 0.03, x1 = W * 0.47;
        var sb = NK.klamp((x1 - x0) * 0.6, 150, 300);
        var sx = (x0 + x1) / 2 + (x1 - x0) * 0.12;
        var yB = Math.max(top + hovedH + 90, bordY - sb * 0.17 - NK.klamp((bordY - top) * 0.34, 80, 200));
        var tangSpids = { x: sx - sb * 0.5, y: yB };
        var tangHaandtag = { x: Math.max(x0 + 14, tangSpids.x - sb * 0.62), y: yB - sb * 0.42 };
        var ende = { x: sx + sb * 0.5, y: yB - sb * 0.08 };
        var kontrol = { x: (tangSpids.x + ende.x) / 2, y: yB + sb * 0.12 };
        this.lay = { W: W, H: H, top: top, bordY: bordY, lup: lup, faner: faner, x0: x0, x1: x1,
            skaal: { cx: sx, y: bordY, b: sb }, tang: { h: tangHaandtag, s: tangSpids }, bue: { a: tangSpids, k: kontrol, b: ende },
            bb: Math.max(6, sb * 0.034), hovedY: top + 12 };
        var minX = Math.min(tangHaandtag.x, tangSpids.x), maxX = ende.x + 10;
        this.saetAnker("makro", minX, tangHaandtag.y - 30, maxX - minX + 20, bordY - tangHaandtag.y + 30);
        this.saetAnker("lup", cx - R, cy - R, 2 * R, 2 * R);
        this.saetAnker("faner", faner[0].x, fy, faner[2].x + fb - faner[0].x, 30);
    };

    /* Et punkt paa baandet: s = 0 ved tangen, 1 ved enden */
    P.baandPunkt = function (s) {
        var b = this.lay.bue, u = 1 - s;
        return { x: u * u * b.a.x + 2 * u * s * b.k.x + s * s * b.b.x, y: u * u * b.a.y + 2 * u * s * b.k.y + s * s * b.b.y };
    };

    /* Hvor meget af baandet, der er braendt (0-1), og lysets styrke */
    P.braendtAndel = function () { return this.tidS < 0 ? 0 : NK.klamp(this.tidS / T_BRAND, 0, 1); };
    P.lysStyrke = function () {
        if (this.tidS < 0 || this.tidS > T_BRAND + 0.15) return 0;
        return NK.klamp(this.tidS / 0.25, 0, 1) * NK.klamp((T_BRAND + 0.15 - this.tidS) / 0.3, 0, 1);
    };
    P.braendpunkt = function () { return this.baandPunkt(1 - this.braendtAndel()); };

    P.lupT = function () { return this.tidS < 0 ? 0 : NK.klamp(this.tidS - T_LUP, 0, ML.T_SLUT); };

    /* Det felt, luppen forstoerrer */
    P.zoomFra = function () {
        var l = this.lay;
        if (this.tidS < 0) { var p = this.baandPunkt(0.72); return { x: p.x, y: p.y, r: 9 }; }
        if (this.tidS < T_BRAND) { var q = this.braendpunkt(); return { x: q.x, y: q.y, r: 9 }; }
        return { x: l.skaal.cx, y: l.skaal.y - l.skaal.b * 0.2, r: 9 };
    };

    P.opdaterScene = function (dt) {
        if (this.spiller) {
            this.tidS += dt;
            var bp = this.braendpunkt();
            if (this.tidS < T_BRAND) {
                this.roegT += dt;
                while (this.roegT > 0.11) {
                    this.roegT -= 0.11;
                    this.roeg.push({ x: bp.x + NK.r(-6, 6), y: bp.y - 6, r: NK.r(6, 11), alder: 0, vx: NK.r(-8, 8) });
                }
            }
            if (this.tidS >= T_FAERDIG) {
                this.tidS = T_FAERDIG;
                this.spiller = false;
                if (!this.braendt) {
                    this.braendt = true;
                    if (this.iForsoeg()) this.forsoegKlaret(this.opg.o.forsoeg.set);
                }
            }
        }
        var top = this.lay ? this.lay.top : 0;
        this.roeg.forEach(function (r) {
            r.alder += dt;
            r.y -= dt * 34;
            r.x += r.vx * dt;
            r.r += dt * 9;
        });
        this.roeg = this.roeg.filter(function (r) { return r.alder < 2.6 && r.y > top + 4; });
    };

    P.tegn = function () {
        var ctx = this.L.ctx, l = this.lay, mig = this;
        if (!l) return;
        var W = l.W, H = l.H;
        ctx.clearRect(0, 0, W, H);
        Tg.bord(ctx, W, l.bordY, H);
        var om = this.omNu();

        /* Overskrifterne som i bogens figur */
        Tg.maerkat(ctx, "Makroniveau", (l.x0 + l.x1) / 2, l.hovedY, { px: 13, farve: "#aeb6c2" });
        Tg.maerkat(ctx, "Mikroniveau", l.lup.cx, l.hovedY, { px: 13, farve: "#aeb6c2" });

        /* Skaalen med pulveret */
        Tg.skaal(ctx, l.skaal.cx, l.skaal.y, l.skaal.b, this.braendtAndel());

        /* Baandet: det, der er tilbage, fra tangen ud til braendpunktet */
        var rest = 1 - this.braendtAndel(), pkt = [];
        for (var i = 0; i <= 30; i++) pkt.push(this.baandPunkt(rest * i / 30));
        if (rest > 0.005) Tg.baand(ctx, pkt, l.bb);
        Tg.tang(ctx, l.tang.h.x, l.tang.h.y, l.tang.s.x + 6, l.tang.s.y, l.skaal.b * 0.3);

        /* Roegen og lyset */
        this.roeg.forEach(function (r) { Tg.roeg(ctx, r.x, r.y, r.r, 0.75 * (1 - r.alder / 2.6)); });
        var bp = this.braendpunkt();
        Tg.lys(ctx, bp.x, bp.y, NK.klamp(l.skaal.b * 0.09, 12, 26), this.lysStyrke(), this.tid);

        /* Det, opgaven handler om */
        var bx = Math.min(l.tang.s.x, pkt[0].x) - 8, by = l.tang.s.y - l.skaal.b * 0.12;
        if (om.indexOf("baand") >= 0 && !this.spiller && this.tidS < 0) {
            Tg.ring(ctx, bx, by, l.bue.b.x - bx + 12, l.skaal.b * 0.3, 14);
        }
        if (this.iForsoeg() && this.tidS < 0) {
            var sp = this.baandPunkt(0.96);
            this.skiltR = Tg.skilt(ctx, "Klik: antænd båndet", sp.x, sp.y - l.bb - 8, 6, l.x1 + 40);
        } else {
            this.skiltR = null;
        }

        /* Luppen */
        var t = this.lupT();
        Tg.lupRund(ctx, l.lup.cx, l.lup.cy, l.lup.R, this.zoomFra(), function (c) {
            ML.tegn(c, l.lup.cx, l.lup.cy, l.lup.R, t, {});
        }, om.indexOf("lup") >= 0);
        if (om.indexOf("lup") >= 0) Tg.omCirkel(ctx, l.lup.cx, l.lup.cy, l.lup.R);

        /* Foer, Braender og Efter under luppen */
        if (this.visFaner()) {
            var aktiv = this.aktivFane();
            l.faner.forEach(function (f) {
                Tg.knap(ctx, f, f.t, f.id === aktiv, true, 14);
                if (mig.over === f.id && f.id !== aktiv) {
                    NK.rundtRekt(ctx, f.x, f.y, f.b, f.h, f.h / 2);
                    ctx.save(); ctx.strokeStyle = "#f2c53d"; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
                }
            });
        }
        this.tegnSejr(ctx, W, H);
    };

    /* ----- Musen ----------------------------------------------------------------------- */
    P.paaBaand = function (pt) {
        if (!this.lay || this.tidS >= 0) return false;
        if (this.skiltR && Tg.inde(this.skiltR, pt, 2)) return true;
        for (var i = 0; i <= 20; i++) {
            var p = this.baandPunkt(i / 20);
            if (Math.hypot(p.x - pt.x, p.y - pt.y) < 16) return true;
        }
        return false;
    };

    P.faneVed = function (pt) {
        if (!this.lay || !this.visFaner()) return null;
        var ud = null;
        this.lay.faner.forEach(function (f) { if (Tg.inde(f, pt, 3)) ud = f.id; });
        return ud;
    };

    P.paaLup = function (pt) {
        var l = this.lay && this.lay.lup;
        return !!l && Math.hypot(pt.x - l.cx, pt.y - l.cy) <= l.R;
    };

    P.overScene = function (pt) {
        if (!pt) { this.over = null; return null; }
        var f = this.faneVed(pt);
        this.over = f;
        if (f) return "pointer";
        if (this.iForsoeg() && this.paaBaand(pt)) return "pointer";
        if (this.visFaner() && this.paaLup(pt)) return "pointer";
        return null;
    };

    P.klikScene = function (pt) {
        var f = this.faneVed(pt);
        if (f) { this.vaelgFane(f); return; }
        if (this.paaBaand(pt)) {
            if (this.spaer()) return;
            this.antaend();
            return;
        }
        if (this.paaLup(pt)) {
            if (this.visFaner()) { this.vaelgFane("braender"); return; }
            if (this.iForsoeg() && !this.spiller) {
                this.kortBlink();
                this.kortBesked("Luppen viser atomerne, når båndet brænder. Klik på enden af magnesiumbåndet.", 4);
            }
        }
    };

    NK.SimBrand = SimBrand;
}());
