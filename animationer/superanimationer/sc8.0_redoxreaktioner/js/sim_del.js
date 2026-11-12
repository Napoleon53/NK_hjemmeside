/* =====================================================================
   sim_del.js - fane 2: Delreaktioner

   Et lyst ark med faste pladser fra start (brugerens roligt ark i sc8.4):
   oeverst reaktionen (foerst i ord, med tal, naar der afgives lige saa
   mange elektroner, som der optages), og under den de to delreaktioner.
   Hver delreaktion har en stiplet plads til e⁻ paa hver side af pilen og
   en plads til mærkaten foran. Under arket ligger brikkerne: elektroner
   (altid nok) eller mærkaterne, opgaven bruger.

   Eleven traekker en e⁻ hen paa en plads (eller klikker paa pladsen) og
   faar én elektron mere dér; et klik paa minus eller et traek vaek tager
   én af. Mærkaterne traekkes hen paa deres plads (eller klikkes og saa
   pladsen). Intet bedoemmes, foer eleven trykker Indsend svar.

   arket.foer: det, der er loest foer opgaven ("ox", "red", "gange",
   "navne"), saa en opgave aabnet fra listen staar rigtigt.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;

    var RAEKKER = ["ox", "red"];

    function SimDel() {
        this.traek = null;
        this.valgtBrik = null;
        this.overPlads = null;
        this.overBrik = null;
        this.flyttet = false;
        this.startFane(D.D_MAAL);
    }

    var P = SimDel.prototype;
    NK.Fane.paa(P, { navn: "d", naesteFane: "fane-s", naesteNavn: "Syre/base og redox" });

    /* ----- Arket ------------------------------------------------------------------------ */
    P.nyOpgave = function (o) {
        var r = D.REAK[o.reak], foer = o.foer || [];
        this.ark = {
            reak: o.reak,
            e: { ox: { v: 0, h: 0 }, red: { v: 0, h: 0 } },
            loest: { ox: foer.indexOf("ox") >= 0, red: foer.indexOf("red") >= 0 },
            gange: foer.indexOf("gange") >= 0,
            navne: foer.indexOf("navne") >= 0 ? { ox: "oxidation", red: "reduktion" } : { ox: null, red: null },
            navneLoest: foer.indexOf("navne") >= 0,
            midler: { ox: null, red: null },
            midlerLoest: false,
            groen: {}
        };
        var mig = this;
        RAEKKER.forEach(function (rk) {
            if (mig.ark.loest[rk]) mig.ark.e[rk][r[rk].rigtig.side] = r[rk].rigtig.n;
        });
        this.traek = null;
        this.valgtBrik = null;
        this.vistSkilt = false;
    };

    /* Pladserne, opgaven bruger lige nu */
    P.brugerE = function () { return this.iForsoeg() && (this.opg.o.brikker || []).indexOf("e") >= 0; };
    P.brugerNavne = function () { return (this.opg.o.brikker || []).indexOf("oxidation") >= 0; };
    P.brugerMidler = function () { return (this.opg.o.brikker || []).indexOf("reduktionsmiddel") >= 0; };
    P.aktivRaekke = function (rk) { return this.brugerE() && (this.opg.o.aktiv || []).indexOf(rk) >= 0; };

    /* Brikkerne i bakken (de mærkater, der allerede sidder paa arket, er ikke i bakken) */
    P.bakkeBrikker = function () {
        if (!this.iForsoeg()) return [];
        var a = this.ark, liste = (this.opg.o.brikker || []).slice();
        return liste.filter(function (b) {
            if (b === "e") return true;
            return a.navne.ox !== b && a.navne.red !== b && a.midler.ox !== b && a.midler.red !== b;
        });
    };

    P.nulstilScene = function () {
        if (!this.iForsoeg()) { this.kortBlink(); return; }
        var o = this.opg.o, mig = this;
        RAEKKER.forEach(function (rk) { if (mig.aktivRaekke(rk)) mig.ark.e[rk] = { v: 0, h: 0 }; });
        if (this.brugerNavne()) this.ark.navne = { ox: null, red: null };
        if (this.brugerMidler()) this.ark.midler = { ox: null, red: null };
        this.valgtBrik = null;
        this.visIndsend();
        void o;
    };

    /* ----- Indsend svar ------------------------------------------------------------------- */
    P.kanIndsendes = function () {
        var a = this.ark, mig = this;
        if (this.brugerE()) return RAEKKER.some(function (rk) { return mig.aktivRaekke(rk) && (a.e[rk].v + a.e[rk].h) > 0; });
        if (this.brugerNavne()) return !!(a.navne.ox && a.navne.red);
        if (this.brugerMidler()) return !!(a.midler.ox && a.midler.red);
        return false;
    };

    P.ikkeKlar = function () {
        if (this.brugerE()) return "Træk først elektroner, e⁻, hen på en af de stiplede pladser.";
        return "Sæt begge mærkater på arket først.";
    };

    P.indsendTekst = function () { return "Indsend svar"; };

    P.forsoegIndsend = function () {
        var a = this.ark, o = this.opg.o, mig = this, fejl = "";
        if (this.brugerE()) {
            RAEKKER.forEach(function (rk) {
                if (fejl || !mig.aktivRaekke(rk)) return;
                var e = a.e[rk];
                if (e.v + e.h === 0) { fejl = "Delreaktionen for " + D.REAK[a.reak][rk].navn + " mangler elektroner."; return; }
                fejl = D.eFejl(a.reak, rk, e);
            });
            if (fejl) { this.fejlLinje(fejl); return; }
            RAEKKER.forEach(function (rk) { if (mig.aktivRaekke(rk)) { a.loest[rk] = true; a.groen[rk] = 0; } });
        } else if (this.brugerNavne()) {
            fejl = D.navneFejl(a.navne);
            if (fejl) { this.fejlLinje(fejl); return; }
            a.navneLoest = true;
            a.groen.navne = 0;
        } else if (this.brugerMidler()) {
            fejl = D.midlerFejl(a.midler);
            if (fejl) { this.fejlLinje(fejl); return; }
            a.midlerLoest = true;
            a.groen.midler = 0;
        }
        this.nulstilHjaelp();
        this.valgtBrik = null;
        this.forsoegKlaret(o.forsoeg.set);
    };

    /* Vis svaret i et forsoeg: arket udfyldes rigtigt */
    P.forsoegSvar = function (o) {
        var a = this.ark, r = D.REAK[a.reak], mig = this;
        if (this.brugerE()) {
            RAEKKER.forEach(function (rk) {
                if (!mig.aktivRaekke(rk)) return;
                a.e[rk] = { v: 0, h: 0 };
                a.e[rk][r[rk].rigtig.side] = r[rk].rigtig.n;
                a.loest[rk] = true;
            });
        } else if (this.brugerNavne()) {
            a.navne = { ox: "oxidation", red: "reduktion" };
            a.navneLoest = true;
        } else if (this.brugerMidler()) {
            a.midler = { ox: "reduktionsmiddel", red: "oxidationsmiddel" };
            a.midlerLoest = true;
        }
        this.valgtBrik = null;
        void o;
        return "";
    };

    /* Efter et rigtigt svar paa et spoergsmaal: arket viser det (dér, hvor det hoerer til) */
    P.efterSpm = function () {
        var o = this.opg.o, a = this.ark;
        if ((o.id === "lige" || o.id === "fe") && this.opg.fase === "spm" && !a.gange) { a.gange = true; a.groen.gange = 0; }
        if (o.id === "fe" && this.opg.fase === "spm2" && !a.midlerLoest) {
            a.midler = { ox: "reduktionsmiddel", red: "oxidationsmiddel" };
            a.midlerLoest = true;
            a.groen.midler = 0;
        }
    };
    P.efterDel = function () { this.efterSpm(); };
    P.efterOpgave = function () { this.efterSpm(); };

    P.sceneLinje = function () { return ""; };

    /* ----- Geometrien -------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h, ctx = this.L.ctx;
        var top = 10 + this.kortZone() + 8;
        var a = this.ark, r = D.REAK[a.reak];
        var arkB = Math.min(W - 40, 940);
        var bakkeH = NK.klamp(H * 0.11, 62, 86);
        var rum = H - top - 14 - bakkeH - 14;

        /* Skriftstoerrelsen: saa stor, at raekkerne kan vaere paa arket */
        var F = 44, m;
        for (var k = 0; k < 30; k++) {
            m = this.maal(ctx, F, r);
            var hoejde = F * 1.3 + F * 1.15 + F * 0.5 + 2 * F * 1.95 + F * 0.9;
            if (m.bredde <= arkB - 2 * F * 0.6 && hoejde <= rum) break;
            F -= 1.5;
            if (F < 16) { F = 16; m = this.maal(ctx, F, r); break; }
        }
        var arkH = Math.min(rum, F * 1.3 + F * 1.15 + F * 0.5 + 2 * F * 1.95 + F * 0.9 + 16);
        var ark = { x: W / 2 - arkB / 2, y: top, b: arkB, h: arkH };
        var venstre = W / 2 - m.bredde / 2;
        var ySamlet = ark.y + F * 0.45 + F * 0.65;
        var yMiddel = ySamlet + F * 0.62 + F * 0.55;
        var yOx = yMiddel + F * 0.55 + F * 0.5 + F * 0.95;
        var yRed = yOx + F * 1.95;
        var bakke = { x: ark.x, y: ark.y + ark.h + 14, b: arkB, h: bakkeH };
        this.lay = { W: W, H: H, top: top, F: F, m: m, ark: ark, venstre: venstre, ySamlet: ySamlet, yMiddel: yMiddel,
            y: { ox: yOx, red: yRed }, bakke: bakke };
        this.saetAnker("ark", ark.x, ark.y, ark.b, ark.h);
        this.saetAnker("bakke", bakke.x, bakke.y, bakke.b, bakke.h);
        this.pladser = this.lavPladser();
    };

    /* Kolonnernes bredder ved skriftstoerrelsen F */
    P.maal = function (ctx, F, r) {
        var fb = function (s) { return Tg.formelBredde(ctx, s, F); };
        var lpx = Math.round(F * 0.5);
        var m = {
            lpx: lpx,
            wLabel: Math.max(Tg.brikBredde(ctx, "Oxidation", lpx), Tg.brikBredde(ctx, "Reduktion", lpx)) + 6,
            gapL: F * 0.45,
            wK: fb("12") + F * 0.4,
            wStof: Math.max(fb(r.ox.stof), fb(r.red.stof)),
            wIon: Math.max(fb(r.ox.ion), fb(r.red.ion)),
            wPlus: fb("+") + F * 0.55,
            wSlot: fb("12 e^−") + F * 0.45,
            wPil: F * 1.9,
            luft: F * 0.3
        };
        m.bredde = m.wLabel + m.gapL + m.wK + m.wStof + m.wPlus + m.wSlot + m.luft + m.wPil + m.luft + m.wK + m.wIon + m.wPlus + m.wSlot;
        return m;
    };

    /* Raekkens dele: x-positionerne */
    P.raekkeX = function () {
        var l = this.lay, m = l.m, x = l.venstre, ud = {};
        ud.label = x; x += m.wLabel + m.gapL;
        ud.k = x + m.wK - l.F * 0.3; ud.stof = x + m.wK; x += m.wK + m.wStof;
        ud.plusV = x + m.wPlus / 2; ud.slotV = x + m.wPlus; x += m.wPlus + m.wSlot + m.luft;
        ud.pil = x; x += m.wPil + m.luft;
        ud.kIon = x + m.wK - l.F * 0.3; ud.ion = x + m.wK; x += m.wK + m.wIon;
        ud.plusH = x + m.wPlus / 2; ud.slotH = x + m.wPlus; x += m.wPlus + m.wSlot;
        ud.slut = x;
        return ud;
    };

    /* Alle pladser paa arket med deres felter */
    P.lavPladser = function () {
        var l = this.lay, F = l.F, X = this.raekkeX(), ud = [], mig = this;
        var sh = F * 1.35;
        RAEKKER.forEach(function (rk) {
            var y = l.y[rk];
            ud.push({ id: rk + ".v", slags: "e", rk: rk, side: "v", x: X.slotV, y: y - sh / 2, b: l.m.wSlot, h: sh });
            ud.push({ id: rk + ".h", slags: "e", rk: rk, side: "h", x: X.slotH, y: y - sh / 2, b: l.m.wSlot, h: sh });
            ud.push({ id: rk + ".navn", slags: "navn", rk: rk, x: X.label, y: y - F * 0.55, b: l.m.wLabel, h: F * 1.1 });
        });
        /* Midlernes pladser under stofferne i reaktionen oeverst */
        var s = this.samletPos();
        var mb = Math.max(Tg.brikBredde(this.L.ctx, "Reduktionsmiddel", l.m.lpx), Tg.brikBredde(this.L.ctx, "Oxidationsmiddel", l.m.lpx)) + 6;
        var c = [s.stoffer.ox, s.stoffer.red];
        if (c[1] - c[0] < mb + 14) {
            var midt = (c[0] + c[1]) / 2;
            c = [midt - (mb + 14) / 2, midt + (mb + 14) / 2];
        }
        ["ox", "red"].forEach(function (rk, i) {
            ud.push({ id: "middel." + rk, slags: "middel", rk: rk, x: c[i] - mb / 2, y: l.yMiddel - F * 0.5, b: mb, h: F * 1.0, stofX: s.stoffer[rk] });
        });
        void mig;
        return ud;
    };

    /* Reaktionen oeverst: delene og midten af de to stoffer (til midlernes pladser) */
    P.samletPos = function () {
        var l = this.lay, ctx = this.L.ctx, r = D.REAK[this.ark.reak], F = l.F * 0.92;
        var dele = [], x = 0, stoffer = {};
        r.samlet.forEach(function (d) {
            if (d.pil) { dele.push({ pil: true, x: x, b: F * 1.8 }); x += F * 1.8 + F * 0.35; return; }
            if (d.t) { var bp = Tg.formelBredde(ctx, d.t, F); dele.push({ t: d.t, x: x, b: bp }); x += bp + F * 0.35; return; }
            var kt = d.k > 1 ? String(d.k) : "", kb = kt ? Tg.formelBredde(ctx, kt + " ", F) : 0, fb = Tg.formelBredde(ctx, d.f, F);
            dele.push({ k: kt, f: d.f, x: x, kb: kb, b: kb + fb, middel: d.middel });
            if (d.middel) stoffer[d.middel] = x + kb + fb / 2;
            x += kb + fb + F * 0.35;
        });
        var bredde = x - F * 0.35, x0 = l.W / 2 - bredde / 2;
        dele.forEach(function (d) { d.x += x0; });
        Object.keys(stoffer).forEach(function (k) { stoffer[k] += x0; });
        return { dele: dele, stoffer: stoffer, F: F, x0: x0, bredde: bredde };
    };

    /* Er pladsen fremme (kan bruges eller viser noget) */
    P.pladsAktiv = function (p) {
        if (!this.iForsoeg()) return false;
        if (p.slags === "e") return this.aktivRaekke(p.rk);
        if (p.slags === "navn") return this.brugerNavne();
        if (p.slags === "middel") return this.brugerMidler();
        return false;
    };

    P.pladsVed = function (pt, slags) {
        var ud = null, mig = this;
        (this.pladser || []).forEach(function (p) {
            if (slags && p.slags !== slags) return;
            if (!mig.pladsAktiv(p)) return;
            if (Tg.inde(p, pt, 6)) ud = p;
        });
        return ud;
    };

    /* Minus-knappen ved en plads med elektroner */
    P.minusRekt = function (p) {
        var r = Math.max(9, this.lay.F * 0.24);
        return { x: p.x + p.b - r * 1.2, y: p.y - r * 0.8, b: r * 2, h: r * 2, r: r };
    };

    /* Brikkerne i bakken og deres felter */
    P.bakkeFelter = function () {
        var l = this.lay, ctx = this.L.ctx, liste = this.bakkeBrikker(), px = l.m.lpx;
        if (!liste.length) return [];
        var felter = liste.map(function (b) {
            if (b === "e") { var r = NK.klamp(l.F * 0.48, 15, 24); return { brik: b, b: r * 2, h: r * 2, r: r }; }
            return { brik: b, b: Tg.brikBredde(ctx, D.BRIKKER[b].tekst, px), h: px * 2 };
        });
        var gap = 24, samlet = felter.reduce(function (s, f) { return s + f.b; }, 0) + gap * (felter.length - 1);
        var x = l.W / 2 - samlet / 2, cy = l.bakke.y + l.bakke.h / 2;
        felter.forEach(function (f) { f.x = x; f.y = cy - f.h / 2; f.cx = x + f.b / 2; f.cy = cy; x += f.b + gap; });
        return felter;
    };

    P.brikVed = function (pt) {
        var ud = null;
        this.bakkeFelter().forEach(function (f) { if (Tg.inde(f, pt, 6)) ud = f; });
        return ud;
    };

    /* ----- Tegningen ------------------------------------------------------------------------ */
    P.opdaterScene = function (dt) {
        var g = this.ark && this.ark.groen;
        if (!g) return;
        Object.keys(g).forEach(function (k) { g[k] += dt; if (g[k] > 1.6) delete g[k]; });
    };

    P.tegn = function () {
        var ctx = this.L.ctx, l = this.lay, a = this.ark, mig = this;
        if (!l) return;
        var W = l.W, H = l.H, F = l.F, r = D.REAK[a.reak], om = this.omNu(), X = this.raekkeX();
        ctx.clearRect(0, 0, W, H);
        Tg.ark(ctx, l.ark, false);

        /* Reaktionen oeverst */
        var s = this.samletPos();
        if (a.gange) {
            var groenS = a.groen.gange !== undefined;
            s.dele.forEach(function (d) {
                if (d.pil) { Tg.reaktionspil(ctx, d.x + 4, d.x + d.b - 4, l.ySamlet, Tg.BLAEK, Math.max(2, F * 0.055)); return; }
                if (d.t) { Tg.formel(ctx, d.t, d.x, l.ySamlet, s.F, { justering: "left", vaegt: "600", farve: "#5a6170" }); return; }
                if (d.k) Tg.formel(ctx, d.k, d.x, l.ySamlet, s.F, { justering: "left", farve: Tg.GROEN });
                Tg.formel(ctx, d.f, d.x + d.kb, l.ySamlet, s.F, { justering: "left" });
            });
            if (groenS) this.groenGlimt(ctx, s.x0 - 10, l.ySamlet - s.F * 0.75, s.bredde + 20, s.F * 1.5, a.groen.gange);
        } else {
            ctx.save();
            ctx.font = Tg.font("600", Math.round(F * 0.62));
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#4a5160";
            ctx.fillText(r.ord, W / 2, l.ySamlet);
            ctx.restore();
        }
        if (om.indexOf("samlet") >= 0) {
            var rx0 = s.x0 - 14, rx1 = s.x0 + s.bredde + 14, ry1 = l.ySamlet + F * 0.7;
            if (this.brugerMidler() || a.midlerLoest) {
                this.pladser.forEach(function (p) {
                    if (p.slags !== "middel") return;
                    rx0 = Math.min(rx0, p.x - 8); rx1 = Math.max(rx1, p.x + p.b + 8); ry1 = Math.max(ry1, p.y + p.h + 6);
                });
            }
            Tg.ring(ctx, rx0, l.ySamlet - F * 0.7, rx1 - rx0, ry1 - (l.ySamlet - F * 0.7), 12);
        }

        /* Midlerne under stofferne */
        this.pladser.forEach(function (p) {
            if (p.slags !== "middel") return;
            var b = a.midler[p.rk];
            if (b || mig.pladsAktiv(p)) {
                ctx.save();
                ctx.strokeStyle = "rgba(90, 97, 112, 0.45)";
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(p.stofX, l.ySamlet + s.F * 0.55);
                ctx.lineTo(p.x + p.b / 2, p.y - 2);
                ctx.stroke();
                ctx.restore();
            }
            if (b) mig.tegnBrikPaa(ctx, b, p, a.midlerLoest, a.groen.midler);
            else if (mig.pladsAktiv(p)) Tg.plads(ctx, p, mig.overPlads === p);
        });

        /* Delreaktionerne */
        RAEKKER.forEach(function (rk) { mig.tegnRaekke(ctx, rk, X, r[rk]); });

        /* Ringene om det, opgaven handler om */
        RAEKKER.forEach(function (rk) {
            if (om.indexOf(rk) < 0) return;
            Tg.ring(ctx, X.stof - F * 0.35, l.y[rk] - F * 0.82, X.slut - X.stof + F * 0.6, F * 1.64, 12);
        });
        if (om.indexOf("maerker") >= 0) {
            Tg.ring(ctx, X.label - 8, l.y.ox - F * 0.72, l.m.wLabel + 16, l.y.red - l.y.ox + F * 1.44, 12);
        }

        /* Bakken med brikkerne */
        var felter = this.bakkeFelter();
        if (felter.length) {
            NK.rundtRekt(ctx, l.bakke.x, l.bakke.y, l.bakke.b, l.bakke.h, 12);
            ctx.save();
            ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
            ctx.fill();
            ctx.setLineDash([4, 6]);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();
            felter.forEach(function (f) {
                var valgt = mig.valgtBrik === f.brik, over = mig.overBrik === f.brik;
                if (f.brik === "e") {
                    /* en lille stak elektroner: der er altid nok */
                    Tg.elektron(ctx, f.cx + 7, f.cy + 5, f.r * 0.92, 0.5);
                    Tg.elektron(ctx, f.cx + 3.5, f.cy + 2.5, f.r * 0.96, 0.75);
                    mig.tegnEBrik(ctx, f.cx, f.cy, f.r);
                    if (valgt || over) { ctx.save(); ctx.beginPath(); ctx.arc(f.cx, f.cy, f.r + 5, 0, Math.PI * 2); ctx.strokeStyle = "#f2c53d"; ctx.lineWidth = 3; ctx.stroke(); ctx.restore(); }
                } else {
                    var bk = D.BRIKKER[f.brik];
                    Tg.brik(ctx, bk.tekst, f.cx, f.cy, l.m.lpx, { farve: bk.farve, b: f.b, h: f.h });
                    if (valgt || over) Tg.ring(ctx, f.x, f.y, f.b, f.h, 11);
                }
            });
            /* Det gule skilt, til eleven har sat noget paa arket */
            if (!this.vistSkilt && this.iForsoeg() && !this.traek) {
                var f0 = felter[0], tekst = f0.brik === "e" ? "Træk: e⁻ op på arket" : "Træk: mærkaterne op på arket";
                Tg.skilt(ctx, tekst, f0.cx, f0.y - 6, 8, W - 8);
            }
        }

        /* Det, eleven traekker */
        if (this.traek && this.flyttet) {
            if (this.traek.brik === "e") this.tegnEBrik(ctx, this.traek.x, this.traek.y, NK.klamp(F * 0.48, 15, 24), true);
            else {
                var bt = D.BRIKKER[this.traek.brik];
                Tg.brik(ctx, bt.tekst, this.traek.x, this.traek.y, l.m.lpx, { farve: bt.farve, loeftet: true });
            }
        }
        this.tegnSejr(ctx, W, H);
    };

    /* En e⁻-brik: elektronen med e⁻ ved siden af, saa den kan kendes fra lupperne */
    P.tegnEBrik = function (ctx, cx, cy, r, loeftet) {
        if (loeftet) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx + 3, cy + 6, r, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
            ctx.fill();
            ctx.restore();
        }
        Tg.kugle(ctx, cx, cy, r, Tg.FARVE.e);
        Tg.formel(ctx, "e^−", cx - r * 0.06, cy + r * 0.02, Math.round(r * 0.95), { farve: "#ffffff" });
    };

    P.groenGlimt = function (ctx, x, y, b, h, t) {
        if (t === undefined) return;
        var alfa = 0.35 * (1 - NK.klamp(t / 1.6, 0, 1));
        ctx.save();
        NK.rundtRekt(ctx, x, y, b, h, 10);
        ctx.fillStyle = "rgba(63, 174, 114, " + alfa + ")";
        ctx.fill();
        ctx.restore();
    };

    /* En mærkat paa sin plads. loest: farvet som i bogen */
    P.tegnBrikPaa = function (ctx, brik, p, loest, groenT) {
        var bk = D.BRIKKER[brik], l = this.lay;
        Tg.brik(ctx, bk.tekst, p.x + p.b / 2, p.y + p.h / 2, l.m.lpx, { farve: bk.farve, b: p.b - 4, h: p.h - 2, groen: loest && groenT !== undefined, bund: loest ? "#fffdf6" : "#ffffff" });
    };

    P.tegnRaekke = function (ctx, rk, X, rr) {
        var l = this.lay, a = this.ark, F = l.F, y = l.y[rk], mig = this;
        var aktiv = this.aktivRaekke(rk), loest = a.loest[rk];
        var dim = !aktiv && !loest && this.brugerE();
        ctx.save();
        if (dim) ctx.globalAlpha = 0.38;
        var gange = a.gange ? D.REAK[a.reak][rk].gange : 1;
        var kStof = gange > 1 ? String(gange) : "", kIon = gange * rr.ionK > 1 ? String(gange * rr.ionK) : "";
        var groenK = a.gange;
        if (kStof) Tg.formel(ctx, kStof, X.k, y, F, { justering: "right", farve: groenK ? Tg.GROEN : Tg.BLAEK });
        Tg.formel(ctx, rr.stof, X.stof, y, F, { justering: "left" });
        Tg.reaktionspil(ctx, X.pil + 4, X.pil + l.m.wPil - 4, y, Tg.BLAEK, Math.max(2, F * 0.06));
        if (kIon) Tg.formel(ctx, kIon, X.kIon, y, F, { justering: "right", farve: groenK && gange > 1 ? Tg.GROEN : Tg.BLAEK });
        Tg.formel(ctx, rr.ion, X.ion, y, F, { justering: "left" });

        /* Pladserne til elektronerne */
        ["v", "h"].forEach(function (side) {
            var p = mig.plads(rk + "." + side), n = a.e[rk][side] * gange;
            var plusX = side === "v" ? X.plusV : X.plusH;
            if (loest) {
                if (n > 0) {
                    Tg.formel(ctx, "+", plusX, y, F, { farve: Tg.BLAEK });
                    Tg.formel(ctx, n + " e^−", p.x + F * 0.12, y, F, { justering: "left", farve: a.gange && gange > 1 ? Tg.GROEN : Tg.E });
                }
                return;
            }
            Tg.formel(ctx, "+", plusX, y, F, { farve: n > 0 ? Tg.BLAEK : "#b9b2a0" });
            if (n > 0) {
                NK.rundtRekt(ctx, p.x, p.y, p.b, p.h, 9);
                ctx.save();
                ctx.fillStyle = mig.overPlads === p ? "rgba(242, 197, 61, 0.3)" : "#ffffff";
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = mig.overPlads === p ? "#c99400" : "#9fb3d8";
                ctx.stroke();
                ctx.restore();
                Tg.formel(ctx, n + " e^−", p.x + p.b / 2, y, F, { farve: Tg.E });
                if (aktiv) {
                    var mr = mig.minusRekt(p);
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(mr.x + mr.r, mr.y + mr.r, mr.r, 0, Math.PI * 2);
                    ctx.fillStyle = mig.overMinus === p.id ? "#c4473a" : "#8a3328";
                    ctx.fill();
                    ctx.strokeStyle = "#ffffff";
                    ctx.lineWidth = Math.max(2, mr.r * 0.28);
                    ctx.beginPath();
                    ctx.moveTo(mr.x + mr.r * 0.5, mr.y + mr.r);
                    ctx.lineTo(mr.x + mr.r * 1.5, mr.y + mr.r);
                    ctx.stroke();
                    ctx.restore();
                }
            } else if (aktiv || dim) {
                Tg.plads(ctx, p, aktiv && mig.overPlads === p);
            }
        });
        if (loest && a.groen[rk] !== undefined) this.groenGlimt(ctx, X.stof - F * 0.3, y - F * 0.75, X.slut - X.stof + F * 0.5, F * 1.5, a.groen[rk]);
        ctx.restore();

        /* Mærkaten foran */
        var pn = this.plads(rk + ".navn"), b = a.navne[rk];
        if (b) {
            if (a.navneLoest) {
                Tg.formel(ctx, D.BRIKKER[b].tekst + ":", pn.x + pn.b, y, Math.round(F * 0.56), { justering: "right", farve: rk === "ox" ? Tg.OX : Tg.RED });
                if (a.groen.navne !== undefined) this.groenGlimt(ctx, pn.x - 4, pn.y - 2, pn.b + 8, pn.h + 4, a.groen.navne);
            } else {
                this.tegnBrikPaa(ctx, b, pn, false);
            }
        } else if (this.pladsAktiv(pn)) {
            Tg.plads(ctx, pn, this.overPlads === pn);
        }
    };

    P.plads = function (id) {
        var ud = null;
        this.pladser.forEach(function (p) { if (p.id === id) ud = p; });
        return ud;
    };

    /* ----- At saette noget paa en plads ------------------------------------------------------ */
    P.passer = function (brik, p) {
        if (!p) return false;
        if (brik === "e") return p.slags === "e";
        if (brik === "oxidation" || brik === "reduktion") return p.slags === "navn";
        return p.slags === "middel";
    };

    P.saetPaa = function (brik, p) {
        var a = this.ark;
        if (!this.passer(brik, p)) return false;
        if (p.slags === "e") {
            if (a.e[p.rk][p.side] >= 12) { this.kortBesked("Der er ikke plads til flere elektroner på pladsen.", 3); return false; }
            a.e[p.rk][p.side]++;
        } else if (p.slags === "navn") {
            a.navne[p.rk] = brik;
        } else {
            a.midler[p.rk] = brik;
        }
        this.vistSkilt = true;
        this.nulstilHjaelp();
        this.visIndsend();
        return true;
    };

    P.tagAf = function (p) {
        var a = this.ark;
        if (p.slags === "e") { if (a.e[p.rk][p.side] > 0) a.e[p.rk][p.side]--; }
        else if (p.slags === "navn") a.navne[p.rk] = null;
        else a.midler[p.rk] = null;
        this.nulstilHjaelp();
        this.visIndsend();
    };

    /* ----- Musen -------------------------------------------------------------------------- */
    P.overScene = function (pt) {
        this.overBrik = null;
        this.overMinus = null;
        if (!pt || !this.lay) { this.overPlads = null; return null; }
        if (!this.iForsoeg()) { this.overPlads = null; return null; }
        var f = this.brikVed(pt);
        if (f) { this.overBrik = f.brik; this.overPlads = null; return "greb"; }
        var mig = this, minus = null;
        this.pladser.forEach(function (p) {
            if (p.slags === "e" && mig.pladsAktiv(p) && mig.ark.e[p.rk][p.side] > 0 && Tg.inde(mig.minusRekt(p), pt, 2)) minus = p;
        });
        if (minus) { this.overMinus = minus.id; this.overPlads = null; return "pointer"; }
        var p = this.pladsVed(pt);
        this.overPlads = this.valgtBrik && this.passer(this.valgtBrik, p) ? p : null;
        if (p) return (p.slags === "e" || this.harBrik(p)) ? "greb" : "pointer";
        return null;
    };

    P.harBrik = function (p) {
        var a = this.ark;
        if (p.slags === "e") return a.e[p.rk][p.side] > 0;
        if (p.slags === "navn") return !!a.navne[p.rk];
        return !!a.midler[p.rk];
    };

    P.brikPaa = function (p) {
        var a = this.ark;
        if (p.slags === "e") return "e";
        if (p.slags === "navn") return a.navne[p.rk];
        return a.midler[p.rk];
    };

    P.nedScene = function (pt) {
        if (!this.lay) return false;
        var f = this.brikVed(pt);
        var p = f ? null : this.pladsVed(pt);
        if (!f && !p) {
            /* et klik paa en plads, der ikke bruges nu, eller paa arket uden for et forsoeg */
            if (!this.iForsoeg() && Tg.inde(this.lay.ark, pt)) this.kortBlink();
            return false;
        }
        if (this.spaer()) return false;
        this.flyttet = false;
        this.start = { x: pt.x, y: pt.y };
        if (f) { this.traek = { brik: f.brik, x: pt.x, y: pt.y, fra: null }; return true; }
        /* Fra en plads: et traek tager brikken (eller én elektron) med; et klik er et klik */
        this.traek = { brik: this.harBrik(p) ? this.brikPaa(p) : null, x: pt.x, y: pt.y, fra: p };
        return true;
    };

    P.flytScene = function (pt) {
        if (!this.traek) return;
        if (!this.flyttet && Math.hypot(pt.x - this.start.x, pt.y - this.start.y) > 6) {
            if (!this.traek.brik) { this.traek = null; return; }
            this.flyttet = true;
            if (this.traek.fra) this.tagAf(this.traek.fra);
        }
        this.traek.x = pt.x;
        this.traek.y = pt.y;
        if (this.flyttet) {
            var p = this.pladsVed(pt);
            this.overPlads = this.passer(this.traek.brik, p) ? p : null;
        }
    };

    P.opScene = function (pt) {
        var t = this.traek;
        this.traek = null;
        if (!t) return;
        if (!this.flyttet) { this.klikPaa(pt); return; }
        this.flyttet = false;
        var p = this.pladsVed(pt);
        this.overPlads = null;
        if (p && this.passer(t.brik, p)) { this.saetPaa(t.brik, p); return; }
        if (p) {
            this.kortBesked(t.brik === "e" ? "Elektronerne skal på en af de stiplede pladser ved pilen." : "Mærkaten skal på en af de stiplede pladser til mærkater.", 3.5);
        }
        this.visIndsend();
    };

    /* Et klik (uden traek): vaelg en brik, saet den valgte paa, eller én e⁻ mere eller mindre */
    P.klikPaa = function (pt) {
        var f = this.brikVed(pt);
        if (f) {
            this.valgtBrik = this.valgtBrik === f.brik ? null : f.brik;
            if (this.valgtBrik) this.kortBesked(f.brik === "e" ? "Klik nu på en stiplet plads ved pilen." : "Klik nu på den plads, mærkaten skal sidde på.", 3);
            return;
        }
        var mig = this, minus = null;
        this.pladser.forEach(function (p) {
            if (p.slags === "e" && mig.pladsAktiv(p) && mig.ark.e[p.rk][p.side] > 0 && Tg.inde(mig.minusRekt(p), pt, 2)) minus = p;
        });
        if (minus) { this.tagAf(minus); return; }
        var p = this.pladsVed(pt);
        if (!p) return;
        if (p.slags === "e") { this.saetPaa("e", p); return; }
        if (this.valgtBrik && this.passer(this.valgtBrik, p)) {
            this.saetPaa(this.valgtBrik, p);
            this.valgtBrik = null;
            return;
        }
        if (this.harBrik(p)) { this.tagAf(p); return; }
        this.kortBesked("Træk en mærkat fra bakken under arket hen på pladsen.", 3);
    };

    NK.SimDel = SimDel;
}());
