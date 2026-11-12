/* =====================================================================
   sim_afstem.js - fane 2: Afstem forbraendingen

   Reaktionsskemaet staar paa en lys tavle som i bogens figurer
   (propan-afstem-trin-1 til 4): formlerne med et felt foran, kugle-
   modellerne under, og regnskabet med foer og efter til hoejre. Eleven
   afstemmer i den faste raekkefoelge carbon, hydrogen og oxygen, ét trin
   ad gangen: kun feltet foran det stof, trinnet handler om, kan stilles
   (pilene over og under feltet, og paa oxygentrinnet en knap ½), og
   Indsend svar sender tallet. Kuglemodellerne foelger tallet med det samme,
   saa eleven kan taelle atomerne. Regnskabet foelger de indsendte tal, og
   i det trin, eleven staar i, viser det et spoergsmaalstegn, til tallet er
   sendt (saa regnskabet ikke loeser opgaven af sig selv).

   Faar O₂ et halvt tal, kommer et spoergsmaal om hele tal til sidst, og
   naar det er besvaret, ganges hele skemaet med 2 paa tavlen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;

    var STOFFER = ["br", "O2", "cp", "H2O"];
    var MELLEM = ["+", "→", "+"];
    var MAX = 20;

    function SimAfstem() {
        this.over = null;
        this.indsendT = "";
        this.pop = {};
        this.startFane(D.A_MAAL);
    }

    var P = SimAfstem.prototype;
    NK.Fane.paa(P, { navn: "a" });

    /* Formlen for et af de fire led i den aktuelle opgave */
    P.formel = function (s) {
        var r = this.opg.o.r;
        if (s === "br") return D.STOF[r.br].f;
        if (s === "cp") return D.STOF[r.cp].f;
        return s === "O2" ? "O₂" : "H₂O";
    };

    P.molType = function (s) {
        var r = this.opg.o.r;
        if (s === "br") return r.br;
        if (s === "cp") return r.cp;
        return s;
    };

    /* ----- Maalene --------------------------------------------------------------- */
    P.nyOpgave = function () {
        this.felt = { cp: null, H2O: null, O2: null };
        this.sendt = { cp: 1, H2O: 1, O2: 1 };
        this.vistSendt = false;
        this.dobbelt = false;
        this.dobT = 0;
        this.pop = {};
    };

    P.nyFase = function (del) {
        this.aktiv = del.type === "forsoeg" ? del.stof : null;
        this.vistSendt = false;
    };

    P.efterOpgave = function () {
        if (this.opg.o.k.halv && !this.dobbelt) { this.dobbelt = true; this.dobT = 0; }
    };

    P.efterDel = function () { this.vistSendt = true; };

    /* Tallet foran et led, som tavlen viser det. 0 betyder tomt felt. */
    P.vist = function (s) {
        if (this.dobbelt) return this.opg.o.hel[s];
        if (s === "br") return 1;
        return this.felt[s] || 0;
    };

    /* Tallene, regnskabet regner med: de indsendte (1, til et tal er sendt) */
    P.regnTal = function () {
        if (this.dobbelt) return this.opg.o.hel;
        return { br: 1, O2: this.sendt.O2, cp: this.sendt.cp, H2O: this.sendt.H2O };
    };

    P.regnskab = function () {
        var r = this.opg.o.r, b = D.STOF[r.br], p = D.STOF[r.cp], k = this.regnTal();
        return {
            C: [k.br * b.C, k.cp * p.C],
            H: [k.br * b.H, 2 * k.H2O],
            O: [2 * k.O2, k.cp * p.O + k.H2O]
        };
    };

    P.nulstilScene = function () { this.vaelg(this.nr); };

    /* Vis svaret: tallet, trinnet beder om */
    P.forsoegSvar = function (o, del) {
        var s = del.stof, v = s === "cp" ? o.k.cp : (s === "H2O" ? o.k.H2O : o.k.O2);
        this.felt[s] = v;
        this.sendt[s] = v;
        this.pop[s] = 0;
        return del.rigtigt;
    };

    /* ----- Indsend svar -------------------------------------------------------------- */
    P.kanIndsendes = function () { return !!this.aktiv && this.felt[this.aktiv] > 0; };

    P.indsendTekst = function () {
        var s = this.aktiv;
        if (!s || !this.felt[s]) return "Indsend svar";
        return "Indsend svar: " + D.halv(this.felt[s]) + " " + this.formel(s);
    };

    P.ikkeKlar = function () { return D.vaelgTal(this.formel(this.aktiv)); };

    P.forsoegIndsend = function () {
        var o = this.opg.o, del = this.opg.del, s = del.stof, v = this.felt[s];
        var facit = s === "cp" ? o.k.cp : (s === "H2O" ? o.k.H2O : o.k.O2);
        this.sendt[s] = v;
        this.vistSendt = true;
        if (Math.abs(v - facit) < 0.01) { this.forsoegKlaret(del.rigtigt, "Rigtigt"); return; }
        this.fejlLinje(D.aFejl(del.trin, v, o));
    };

    /* ----- Scenen --------------------------------------------------------------------- */
    P.maal = function (ctx, F) {
        var mig = this, ud = { F: F, led: [] };
        ctx.font = Tg.font("700", F);
        STOFFER.forEach(function (s) {
            ud.led.push({ s: s, tekstB: ctx.measureText(mig.formel(s)).width });
        });
        return ud;
    };

    /* Gitteret af kuglemodeller under et led: hoejst 4 i hoejden */
    P.gitter = function (s, r) {
        var n = this.vist(s) || 1, hel = Math.floor(n + 1e-9), halv = n - hel > 0.25;
        var antal = hel + (halv ? 1 : 0);
        var k = Tg.kasse(this.molType(s));
        var mb = k.b * r, mh = k.h * r, gap = 0.55 * r;
        var raek = Math.min(4, antal), kol = Math.ceil(antal / 4);
        return { n: n, hel: hel, halv: halv, antal: antal, kol: kol, raek: raek, mb: mb, mh: mh, gap: gap,
                 b: kol * mb + (kol - 1) * gap, h: raek * mh + (raek - 1) * gap };
    };

    P.layout = function () {
        var W = this.L.b, H = this.L.h, ctx = this.L.ctx;
        var lay = { W: W, H: H };
        var top = 10 + this.kortZone() + 12;
        var R = { x: 14, y: top, b: W - 28, h: H - 14 - top };
        lay.tavle = R;
        var regB = NK.klamp(R.b * 0.2, 172, 214);
        lay.regn = { x: R.x + R.b - regB - 18, b: regB };
        var x0 = R.x + 22, x1 = lay.regn.x - 26, tilraad = x1 - x0;
        /* Stoerrelsen: formlerne og kuglerne skaleres sammen, til det hele kan vaere der.
           Gitteret regnes med det stoerste antal, opgaven faar (efter hele tal). */
        var mig = this, o = this.opg.o, F = 42, r = 15;
        var stoerst = o.k.halv ? o.hel : { br: 1, O2: Math.ceil(o.k.O2), cp: o.k.cp, H2O: o.k.H2O };
        function bredde(F, r) {
            var m = mig.maal(ctx, F), ialt = 0;
            m.led.forEach(function (l) {
                var k = Tg.kasse(mig.molType(l.s)), n = stoerst[l.s], kol = Math.ceil(n / 4);
                var gb = kol * k.b * r + (kol - 1) * 0.55 * r;
                l.feltB = F * 1.45;
                l.b = Math.max(l.feltB + 8 + l.tekstB, gb) + 10;
                ialt += l.b;
            });
            m.sep = [F * 1.0, F * 2.0, F * 1.0];
            ialt += m.sep[0] + m.sep[1] + m.sep[2];
            m.ialt = ialt;
            return m;
        }
        function hoejde(F, r) {
            var h = 0;
            STOFFER.forEach(function (s) {
                var k = Tg.kasse(mig.molType(s)), n = stoerst[s], raek = Math.min(4, n);
                h = Math.max(h, raek * k.h * r + (raek - 1) * 0.55 * r);
            });
            return 44 + 30 + F * 1.25 + 30 + 18 + h + 16;
        }
        var m = bredde(F, r), s = Math.min(1, tilraad / m.ialt, (R.h - 40) / hoejde(F, r));
        F = Math.max(18, F * s); r = Math.max(7, r * s);
        m = bredde(F, r);
        lay.F = F;
        lay.r = r;
        lay.m = m;
        /* Vandret: leddene centreret i det, der er til raadighed */
        var x = x0 + Math.max(0, (tilraad - m.ialt) / 2);
        lay.kol = {};
        m.led.forEach(function (l, i) {
            lay.kol[l.s] = { x: x, b: l.b, feltB: l.feltB, tekstB: l.tekstB };
            x += l.b;
            if (i < 3) { lay["sep" + i] = { x: x, b: m.sep[i] }; x += m.sep[i]; }
        });
        /* Lodret: titlen, pilen op, feltet, pilen ned og kuglerne */
        lay.titelY = R.y + 30;
        ctx.font = Tg.font("700", 17);
        var titelB = ctx.measureText(o.r.titel).width;
        ctx.font = Tg.font("700", 14);
        var trinB = this.trinNavne().reduce(function (a, t) { return a + ctx.measureText("✓ " + t).width + 26; }, 0);
        var toLinjer = 22 + titelB + 30 + trinB + 18 > R.b;
        lay.trinY = toLinjer ? lay.titelY + 30 : lay.titelY;
        var ekstra = toLinjer ? 30 : 0;
        var hIalt = hoejde(F, r) + ekstra;
        var y0 = R.y + ekstra + Math.max(0, (R.h - hIalt) / 2);
        lay.felth = F * 1.25;
        lay.raekkeY = Math.max(y0 + 44 + 30, R.y + 44 + 30) + lay.felth / 2;
        lay.gitterY = lay.raekkeY + lay.felth / 2 + 30 + 18;
        lay.regn.y = lay.raekkeY - 46;
        lay.regn.h = 4 * 34 + 20;
        this.lay = lay;
        this.saetAnker("tavle", R.x, R.y, lay.regn.x - R.x - 8, R.h);
        this.saetAnker("regn", lay.regn.x - 6, lay.regn.y - 6, lay.regn.b + 12, lay.regn.h + 12);
    };

    /* Feltet foran et led og pilene over og under det */
    P.feltRekt = function (s) {
        var lay = this.lay, c = lay.kol[s];
        return { x: c.x, y: lay.raekkeY - lay.felth / 2, b: c.feltB, h: lay.felth };
    };

    P.pilRekt = function (s, op) {
        var f = this.feltRekt(s), h = 26;
        return { x: f.x + 4, y: op ? f.y - h - 4 : f.y + f.h + 4, b: f.b - 8, h: h };
    };

    P.halvRekt = function () {
        var f = this.feltRekt("O2"), c = this.lay.kol.O2;
        return { x: f.x + f.b + 8, y: f.y + f.h + 4, b: Math.max(44, c.tekstB), h: 26 };
    };

    P.opdaterScene = function (dt) {
        var mig = this;
        Object.keys(this.pop).forEach(function (s) { mig.pop[s] = Math.min(1, mig.pop[s] + dt / 0.35); });
        if (this.dobbelt) this.dobT += dt;
        if (this.erForsoeg()) {
            var t = this.indsendTekst() + (this.kanIndsendes() ? "+" : "-");
            if (t !== this.indsendT) { this.indsendT = t; this.visIndsend(); }
        }
    };

    /* ----- Tegning --------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, mig = this;
        if (!lay) return;
        var o = this.opg.o, R = lay.tavle, F = lay.F, r = lay.r;
        ctx.fillStyle = "#14141a";
        ctx.fillRect(0, 0, lay.W, lay.H);
        Tg.tavle(ctx, R);

        /* Titlen og trinnene C, H, O (og hele tal) */
        NK.tekst(ctx, o.r.titel, R.x + 22, lay.titelY, { font: Tg.font("700", 17), farve: Tg.BLAEK });
        this.tegnTrin(ctx);

        var aktiv = this.iForsoeg() ? this.aktiv : null;
        STOFFER.forEach(function (s, i) {
            var c = lay.kol[s], f = mig.feltRekt(s), v = mig.vist(s);
            var erAktiv = s === aktiv;
            var klar = mig.erKlar(s);
            /* feltet */
            if (erAktiv) {
                NK.rundtRekt(ctx, f.x, f.y, f.b, f.h, 8);
                ctx.fillStyle = "#fff3c4";
                ctx.fill();
                ctx.lineWidth = 2.5;
                ctx.strokeStyle = "#d6a400";
                ctx.stroke();
            }
            var tekst = v ? D.halv(v) : (erAktiv ? "?" : "");
            if (tekst) {
                var p = mig.pop[s] !== undefined ? mig.pop[s] : 1;
                var sk = 1 + 0.25 * (1 - NK.pop(p)) * (p < 1 ? 1 : 0);
                var farve = !v ? "#a39a80" : (v === 1 && !erAktiv ? "#b9b2a0" : (klar ? "#1d6b3f" : Tg.BLAEK));
                if (s === "br" && mig.dobbelt) farve = "#1d6b3f";
                ctx.save();
                ctx.translate(f.x + f.b / 2, lay.raekkeY);
                ctx.scale(sk, sk);
                NK.tekst(ctx, tekst, 0, F * 0.36, { font: Tg.font("700", F), justering: "center", farve: farve });
                ctx.restore();
            }
            /* formlen */
            NK.tekst(ctx, mig.formel(s), c.x + c.feltB + 8, lay.raekkeY + F * 0.36, { font: Tg.font("700", F), farve: Tg.BLAEK });
            /* kuglemodellerne */
            mig.tegnGitter(ctx, s, c.x + c.b / 2 - 5, lay.gitterY, r);
            /* pilene */
            if (erAktiv) {
                Tg.knap(ctx, mig.pilRekt(s, true), "▲", { px: 13, over: mig.over === s + "+", bund: "#e9e3d2", kant: "#b8ad8c", farve: "#4a3f1e" });
                Tg.knap(ctx, mig.pilRekt(s, false), "▼", { px: 13, over: mig.over === s + "-", bund: "#e9e3d2", kant: "#b8ad8c", farve: "#4a3f1e" });
                if (s === "O2") {
                    var harHalv = v && v - Math.floor(v + 1e-9) > 0.25;
                    Tg.knap(ctx, mig.halvRekt(), "½", { px: 16, bund: harHalv ? "#ffdf6b" : "#e9e3d2", kant: harHalv ? "#c99400" : "#b8ad8c", farve: "#4a3f1e" });
                }
            }
            if (i < 3) {
                var sp = lay["sep" + i];
                NK.tekst(ctx, MELLEM[i], sp.x + sp.b / 2, lay.raekkeY + F * 0.33, { font: Tg.font("600", MELLEM[i] === "→" ? F * 1.05 : F * 0.85), justering: "center", farve: "#4d5563" });
                NK.tekst(ctx, MELLEM[i], sp.x + sp.b / 2, lay.gitterY + F * 0.3, { font: Tg.font("600", F * 0.7), justering: "center", farve: "#8a8f99" });
            }
        });

        /* Den gule ring om tavlen, naar spoergsmaalet om hele tal handler om skemaet */
        this.tegnRegnskab(ctx);
        if (this.erSpm() && !this.venter && !this.faerdig) {
            var fO = this.feltRekt("O2");
            Tg.omRing(ctx, fO.x, fO.y, fO.b, fO.h, "#c99400");
        }
        this.tegnSejr(ctx, lay.W, lay.H);
    };

    /* Er leddet afstemt (trinnet er loest)? */
    P.erKlar = function (s) {
        var g = this.opg, n = g.o.dele.length, fi = g.fi;
        var trin = { cp: 0, H2O: 1, O2: 2 }[s];
        if (trin === undefined) return this.dobbelt;
        return fi > trin || ((this.venter || this.faerdig) && fi === trin);
    };

    P.tegnGitter = function (ctx, s, cx, y, r) {
        var g = this.gitter(s, r), type = this.molType(s);
        var x0 = cx - g.b / 2;
        var nye = this.dobbelt ? NK.klamp(this.dobT / 0.5, 0, 1) : 1;
        var k = this.opg.o.k;
        var foer = this.dobbelt ? { br: 1, O2: Math.floor(k.O2 + 1e-9), cp: k.cp, H2O: k.H2O }[s] : 0;
        for (var i = 0; i < g.antal; i++) {
            var kol = Math.floor(i / 4), raek = i % 4;
            var mx = x0 + kol * (g.mb + g.gap) + g.mb / 2, my = y + raek * (g.mh + g.gap) + g.mh / 2;
            var alfa = this.dobbelt && i >= foer ? nye : 1;
            if (g.halv && i === g.antal - 1) Tg.halvO2(ctx, mx, my, r, alfa);
            else Tg.molekyle(ctx, type, mx, my, r, 0, alfa);
        }
    };

    /* Trinnene oeverst paa tavlen: 1 C, 2 H, 3 O (og 4 hele tal) med det
       loeste i groent og det aktuelle i gult */
    P.tegnTrin = function (ctx) {
        var g = this.opg, lay = this.lay, dele = g.o.dele;
        var navne = this.trinNavne();
        var fs = 15, x = lay.tavle.x + lay.tavle.b - 18, y = lay.trinY;
        ctx.save();
        ctx.font = Tg.font("700", fs);
        for (var i = navne.length - 1; i >= 0; i--) {
            var t = navne[i], b = ctx.measureText(t).width + 18;
            x -= b;
            var loest = i < g.fi || ((this.venter || this.faerdig) && i === g.fi);
            var nu = i === g.fi && !loest;
            NK.rundtRekt(ctx, x, y - 17, b, 24, 12);
            ctx.fillStyle = loest ? "#d6efdf" : (nu ? "#fff3c4" : "#ece8dc");
            ctx.fill();
            ctx.lineWidth = 1.2;
            ctx.strokeStyle = loest ? "#5aa877" : (nu ? "#d6a400" : "#cfc8b6");
            ctx.stroke();
            NK.tekst(ctx, (loest ? "✓ " : "") + t, x + b / 2, y, { font: Tg.font("700", fs - 1), justering: "center", farve: loest ? "#1d6b3f" : (nu ? "#5b4500" : "#8a8473") });
            x -= 8;
        }
        ctx.restore();
    };

    P.trinNavne = function () {
        return this.opg.o.dele.map(function (d, i) { return (i + 1) + " " + (d.trin || "hele tal"); });
    };

    /* Regnskabet: foer og efter pilen for C, H og O, som i bogens figur */
    P.tegnRegnskab = function (ctx) {
        var lay = this.lay, R = lay.regn, rg = this.regnskab();
        var trin = this.aktiv && this.iForsoeg() ? { cp: "C", H2O: "H", O2: "O" }[this.aktiv] : null;
        var asked = trin && !this.vistSendt;
        ctx.save();
        NK.rundtRekt(ctx, R.x, R.y, R.b, R.h, 10);
        ctx.fillStyle = "#eef3ef";
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = "#c9d6cc";
        ctx.stroke();
        var c0 = R.x + 26, c1 = R.x + R.b * 0.47, c2 = R.x + R.b * 0.74, c3 = R.x + R.b - 18;
        NK.tekst(ctx, "før", c1, R.y + 24, { font: Tg.font("700", 13), justering: "center", farve: "#5e6b62" });
        NK.tekst(ctx, "efter", c2, R.y + 24, { font: Tg.font("700", 13), justering: "center", farve: "#5e6b62" });
        ["C", "H", "O"].forEach(function (e, i) {
            var y = R.y + 40 + i * 36, v = rg[e];
            if (e === trin) {
                NK.rundtRekt(ctx, R.x + 6, y, R.b - 12, 32, 7);
                ctx.fillStyle = "#fff3c4";
                ctx.fill();
            }
            var cy = y + 22;
            NK.tekst(ctx, e, c0, cy, { font: Tg.font("700", 19), justering: "center", farve: "#1f2430" });
            var foer = D.halv(v[0]), efter = D.halv(v[1]);
            /* Spoergsmaalstegnet staar kun ved det tal, trinnet spoerger om: efter
               pilen for C og H, foer pilen for O (det er O₂, der stilles) */
            var spF = asked && e === trin && e === "O", spE = asked && e === trin && e !== "O";
            var ok = Math.abs(v[0] - v[1]) < 0.01;
            var farve = ok ? "#1d6b3f" : "#b3261e";
            NK.tekst(ctx, spF ? "?" : foer, c1, cy, { font: Tg.font("700", 19), justering: "center", farve: spF ? "#8a7a3a" : farve });
            NK.tekst(ctx, spE ? "?" : efter, c2, cy, { font: Tg.font("700", 19), justering: "center", farve: spE ? "#8a7a3a" : farve });
            if (!(asked && e === trin)) NK.tekst(ctx, ok ? "✓" : "✗", c3, cy, { font: Tg.font("700", 19), justering: "center", farve: farve });
        });
        ctx.restore();
    };

    /* ----- Musen --------------------------------------------------------------------- */
    P.hvad = function (pt) {
        var lay = this.lay, mig = this;
        if (!lay || !pt) return null;
        var a = this.iForsoeg() ? this.aktiv : null;
        if (a) {
            if (Tg.inde(this.pilRekt(a, true), pt, 3)) return a + "+";
            if (Tg.inde(this.pilRekt(a, false), pt, 3)) return a + "-";
            if (a === "O2" && Tg.inde(this.halvRekt(), pt, 3)) return "halv";
        }
        var ud = null;
        STOFFER.forEach(function (s) {
            var c = lay.kol[s];
            if (pt.x >= c.x && pt.x <= c.x + c.b && pt.y >= lay.raekkeY - lay.felth && pt.y <= lay.gitterY + 4 * 3.6 * lay.r) ud = "led:" + s;
        });
        return ud;
    };

    P.overScene = function (pt) {
        this.over = this.hvad(pt);
        return this.over && this.over.indexOf("led:") !== 0 ? "klik" : null;
    };

    P.skift = function (s, d) {
        if (this.spaer()) return;
        var v = this.felt[s] || 0, frac = v - Math.floor(v + 1e-9) > 0.25 ? 0.5 : 0;
        if (d === "halv") {
            v = frac ? v - 0.5 : v + 0.5;
            if (v <= 0) v = 0;
        } else if (d > 0) {
            v = v ? Math.min(MAX + frac, v + 1) : 1;
        } else {
            v = v ? Math.max(frac ? 0.5 : 1, v - 1) : 1;
        }
        this.felt[s] = v || null;
        this.pop[s] = 0;
        this.vistSendt = false;
        this.nulstilHjaelp();
        if (this.fast.klasse === "skidt") this.naesteLinje("", "");
        this.visIndsend();
    };

    P.klikScene = function (pt) {
        var h = this.hvad(pt);
        if (!h) return;
        if (h === "halv") { this.skift("O2", "halv"); return; }
        if (/[+-]$/.test(h)) { this.skift(h.slice(0, -1), h.slice(-1) === "+" ? 1 : -1); return; }
        var s = h.slice(4);
        if (!this.iForsoeg()) { this.kortBlink(); return; }
        if (s === this.aktiv) { this.kortBesked(D.vaelgTal(this.formel(s)), 4); return; }
        if (s === "br") { this.kortBesked(D.raekkefoelge.braend, 5); return; }
        var trin = this.opg.del.trin;
        if (trin === "C") this.kortBesked(D.raekkefoelge.C + this.formel("cp") + ".", 5);
        else if (trin === "H") this.kortBesked(D.raekkefoelge.H, 5);
        else this.kortBesked(D.raekkefoelge.O, 5);
    };

    /* Pil op og ned stiller feltet, Enter sender */
    P.tast = function (e) {
        if (e.key === "Enter") {
            if (e.target && e.target.tagName === "BUTTON") return false;
            this.indsendKlik();
            return true;
        }
        if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return false;
        if (!this.aktiv || !this.iForsoeg()) { this.kortBlink(); return true; }
        this.skift(this.aktiv, e.key === "ArrowUp" ? 1 : -1);
        return true;
    };

    NK.SimAfstem = SimAfstem;
}());
