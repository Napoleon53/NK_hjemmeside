/* =====================================================================
   bord.js - arbejdsbordet paa byggefanen

   Oeverst en hylde med de positive ioner, nederst en med de negative.
   Klikker man paa en ion, flyver den ned paa bordet som et kort, der er
   lige saa bredt, som ionen har ladning: Al³⁺ fylder tre felter, NO₃⁻
   ét. Hvert felt har et plus eller et minus paa kanten ind mod midten,
   og dér skal de moedes to og to - som taenderne i en lynlaas.

   Lynlaasen lukker kun hele vejen, naar der er lige mange plusser og
   minusser. Det er hele reglen for et neutralt salt, og den kan ses
   uden at regne: den korteste raekke skal have en ion mere.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var MAKS = 6;                 /* flest ioner af hver slags paa bordet */

    NK.Bord = function (scene, opt) {
        opt = opt || {};
        this.scene = scene;
        this.canvas = scene.querySelector("canvas");
        this.l = new NK.Laerred(this.canvas);
        this.lyt = opt.lyt || function () {};
        this.kat = null;          /* den positive ion paa bordet */
        this.an = null;           /* den negative ion paa bordet */
        this.nKat = 0;
        this.nAn = 0;
        this.kort = [];           /* de tegnede kort, ogsaa dem der er ved at forsvinde */
        this.lynlaas = [];        /* hvor lukket hvert felt er, 0..1 */
        this.land = { kat: 0, an: 0 };   /* felter, der er landet paa bordet */
        this.laast = false;
        this.visFormel = !!opt.visFormel;   /* formlen under bordet (kun fane 1) */
        this.demo = null;         /* "Afstem for mig" i gang */
        this.besked = null;       /* kortvarig besked */
        this.ur = 0;
        this.mus = null;
        this.traek = null;        /* ion paa vej fra hylden ned paa bordet */
        this.kortTraek = null;    /* kort, der traekkes rundt paa bordet */
        this.maerkeX = NaN;
        this.g = null;

        this.bygHylder();
        this.bygStyr();
        this.koblMus();
        this.saetNavne(opt.navne !== false);
        this.opdaterKnapper();
    };

    /* ----- Hylderne ------------------------------------------------------- */
    NK.Bord.prototype.bygHylder = function () {
        var mig = this;
        this.chips = {};

        function chip(ion) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "chip " + (ion.q > 0 ? "kat" : "an") + (ion.sammensat ? " sammensat" : "");
            b.innerHTML = '<span class="cformel">' + D.ionTekst(ion) + '</span><span class="cnavn">' + D.ionNavn(ion) + "</span>";
            b.addEventListener("click", function () {
                if (mig.slugKlik) { mig.slugKlik = false; return; }
                mig.vaelg(ion, b);
            });
            b.addEventListener("pointerdown", function (e) { mig.startTraek(ion, b, e); });
            mig.chips[ion.id] = b;
            return b;
        }
        function gruppe(titel, ioner, sammensat) {
            var g = document.createElement("div");
            g.className = "hylde-gruppe" + (sammensat ? " sammensat" : "");
            var m = document.createElement("span");
            m.className = "hylde-mrk";
            m.textContent = titel;
            var r = document.createElement("div");
            r.className = "chips";
            ioner.forEach(function (ion) { r.appendChild(chip(ion)); });
            g.appendChild(m);
            g.appendChild(r);
            return g;
        }
        function hylde(klasse, titel, ioner) {
            var h = document.createElement("div");
            h.className = "hylde " + klasse;
            h.appendChild(gruppe(titel, ioner.filter(function (i) { return !i.sammensat; }), false));
            h.appendChild(gruppe("Sammensatte", ioner.filter(function (i) { return i.sammensat; }), true));
            mig.scene.appendChild(h);
            return h;
        }
        this.hyldeTop = hylde("top", "Positive ioner", D.KATIONER);
        this.hyldeBund = hylde("bund", "Negative ioner", D.ANIONER);
    };

    /* Minus, antal og plus ud for hver raekke. */
    NK.Bord.prototype.bygStyr = function () {
        var mig = this;
        function styr(side) {
            var s = document.createElement("div");
            s.className = "styr " + side;
            s.innerHTML = '<button type="button" class="talknap" aria-label="Én ion færre">−</button>'
                + '<span class="styr-antal">1 ×</span>'
                + '<button type="button" class="talknap plus" aria-label="Én ion mere">+</button>';
            var k = s.querySelectorAll("button");
            k[0].addEventListener("click", function () { mig.fjern(side); });
            k[1].addEventListener("click", function () { mig.tilfoej(side); });
            mig.scene.appendChild(s);
            return { el: s, minus: k[0], plus: k[1], antal: s.querySelector(".styr-antal") };
        }
        this.styr = { kat: styr("kat"), an: styr("an") };
    };

    /* Et klik paa et kort fjerner netop den ion. */
    NK.Bord.prototype.koblMus = function () {
        var mig = this;
        function pos(e) {
            var r = mig.canvas.getBoundingClientRect();
            return { x: e.clientX - r.left, y: e.clientY - r.top };
        }
        /* Et kort kan baade klikkes vaek og traekkes vaek. */
        this.canvas.addEventListener("pointerdown", function (e) {
            if (mig.laast || e.button > 0) return;
            var p = pos(e);
            var k = mig.kortVed(p);
            if (!k) return;
            mig.kortTraek = { kort: k, dx: k.x - p.x, dy: k.y - p.y, x0: p.x, y0: p.y, flyttet: false };
            k.fastholdt = true;
            try { mig.canvas.setPointerCapture(e.pointerId); } catch (fejl) {}
        });
        this.canvas.addEventListener("pointermove", function (e) {
            var p = pos(e);
            mig.mus = p;
            var t = mig.kortTraek;
            if (t) {
                if (Math.abs(p.x - t.x0) + Math.abs(p.y - t.y0) > 5) t.flyttet = true;
                t.kort.x = p.x + t.dx;
                t.kort.y = p.y + t.dy;
                mig.canvas.style.cursor = "grabbing";
                return;
            }
            mig.canvas.style.cursor = (!mig.laast && mig.kortVed(p)) ? "grab" : "default";
        });
        function slipKort(e) {
            var t = mig.kortTraek;
            if (!t) return;
            mig.kortTraek = null;
            t.kort.fastholdt = false;
            mig.canvas.style.cursor = "default";
            var p = pos(e);
            var g = mig.g;
            var udenfor = !!g && (p.y < g.y0 - 24 || p.y > g.y1 + 24);
            /* Et klik fjerner ionen - og et traek ud af bordet goer det samme. */
            if (!t.flyttet || udenfor) mig.fjern(t.kort.side, t.kort);
        }
        this.canvas.addEventListener("pointerup", slipKort);
        this.canvas.addEventListener("pointercancel", slipKort);
        this.canvas.addEventListener("pointerleave", function () {
            mig.mus = null;
            if (!mig.kortTraek) mig.canvas.style.cursor = "default";
        });
    };

    NK.Bord.prototype.kortVed = function (p) {
        for (var i = this.kort.length - 1; i >= 0; i--) {
            var k = this.kort[i];
            if (k.doer || k.vent > 0) continue;
            if (p.x >= k.x && p.x <= k.x + k.b && p.y >= k.y && p.y <= k.y + k.h) return k;
        }
        return null;
    };

    /* ----- Tilstanden ------------------------------------------------------ */
    NK.Bord.prototype.antal = function (side) { return side === "kat" ? this.nKat : this.nAn; };
    NK.Bord.prototype.saetAntal = function (side, n) { if (side === "kat") this.nKat = n; else this.nAn = n; };
    NK.Bord.prototype.plus = function () { return this.kat ? this.nKat * this.kat.q : 0; };
    NK.Bord.prototype.minus = function () { return this.an ? this.nAn * -this.an.q : 0; };
    NK.Bord.prototype.neutral = function () { return !!(this.kat && this.an) && this.plus() === this.minus(); };
    NK.Bord.prototype.forkortet = function () { return this.neutral() && NK.gcd(this.nKat, this.nAn) === 1; };

    NK.Bord.prototype.nytKort = function (side, vent, fra) {
        var ion = this[side];
        this.kort.push({ side: side, ion: ion, x: NaN, y: NaN, b: 0, h: 0, a: 0, felt: 0,
            mx: 0, my: 0, mb: 0, mh: 0, ma: 1, doer: false, vent: vent || 0, fra: fra || this.chips[ion.id], slip: this.slipPunkt || null });
    };

    NK.Bord.prototype.tilfoejIntern = function (side, fra) {
        if (!this[side] || this.antal(side) >= MAKS) return false;
        this.saetAntal(side, this.antal(side) + 1);
        this.nytKort(side, 0, fra);
        return true;
    };

    NK.Bord.prototype.fjernIntern = function (side, kort) {
        var n = this.antal(side);
        if (n <= 0) return false;
        if (!kort) {
            for (var i = this.kort.length - 1; i >= 0; i--) {
                if (this.kort[i].side === side && !this.kort[i].doer) { kort = this.kort[i]; break; }
            }
        }
        if (kort) kort.doer = true;
        this.saetAntal(side, n - 1);
        if (n - 1 === 0) this[side] = null;
        return true;
    };

    NK.Bord.prototype.fjernAlle = function (side) {
        for (var i = 0; i < this.kort.length; i++) {
            if (this.kort[i].side === side) this.kort[i].doer = true;
        }
        this.saetAntal(side, 0);
        this[side] = null;
    };

    /* Klik paa en ion paa hylden: samme ion igen = én mere,
       en anden ion = skift den ud (et salt har én slags af hver her). */
    NK.Bord.prototype.vaelg = function (ion, chip) {
        if (this.laast) return;
        this.demo = null;
        var side = ion.q > 0 ? "kat" : "an";
        if (this[side] === ion) { this.tilfoej(side, chip); return; }
        this.fjernAlle(side);
        this[side] = ion;
        this.tilfoejIntern(side, chip);
        this.aendret("ny", side);
    };

    NK.Bord.prototype.tilfoej = function (side, fra) {
        if (this.laast) return;
        this.demo = null;
        if (!this.tilfoejIntern(side, fra)) {
            if (this[side]) this.besked = { tekst: "Der er ikke plads til flere " + D.ionTekst(this[side]) + " på bordet.", t: 2.4 };
            return;
        }
        this.aendret("mere", side);
    };

    NK.Bord.prototype.fjern = function (side, kort) {
        if (this.laast) return;
        this.demo = null;
        if (this.fjernIntern(side, kort)) this.aendret("faerre", side);
    };

    NK.Bord.prototype.ryd = function () {
        this.demo = null;
        this.besked = null;
        this.fjernAlle("kat");
        this.fjernAlle("an");
        this.aendret("ryd");
    };

    /* Laeg et bestemt salt paa bordet - bruges af "Vis svaret". */
    NK.Bord.prototype.saet = function (kat, nKat, an, nAn) {
        this.demo = null;
        this.fjernAlle("kat");
        this.fjernAlle("an");
        this.kat = kat;
        this.an = an;
        var i;
        for (i = 0; i < nKat; i++) this.nytKort("kat", 0.14 * i);
        for (i = 0; i < nAn; i++) this.nytKort("an", 0.14 * i + 0.07);
        this.nKat = nKat;
        this.nAn = nAn;
        this.aendret("saet");
    };

    /* "Afstem for mig": start med én af hver, og giv saa hele tiden den
       korteste raekke én ion mere, til de er lige lange. Det giver altid
       det mindste forhold. */
    NK.Bord.prototype.afstem = function () {
        if (this.laast || !this.kat || !this.an) return false;
        this.demo = null;
        while (this.nKat > 1) this.fjernIntern("kat", null);
        while (this.nAn > 1) this.fjernIntern("an", null);
        this.demo = { t: 1.0, tekst: "Vi starter med én af hver: <b>" + this.plus() + "+</b> mod <b>" + this.minus() + "−</b>." };
        this.aendret("demo");
        return true;
    };

    NK.Bord.prototype.demoTrin = function () {
        var p = this.plus(), m = this.minus();
        if (p === m) {
            this.demo = null;
            this.aendret("afstemt");
            return;
        }
        var side = p < m ? "kat" : "an";
        this.tilfoejIntern(side);
        this.demo.t = 0.9;
        this.demo.tekst = "<b>" + p + "+</b> mod <b>" + m + "−</b>: der mangler " + (side === "kat" ? "plus" : "minus")
            + " → én " + D.ionTekst(this[side]) + " mere.";
        this.aendret("demo");
    };

    NK.Bord.prototype.laas = function (laast) {
        this.laast = !!laast;
        this.demo = null;
        this.scene.classList.toggle("laast", this.laast);
        this.opdaterKnapper();
    };

    /* Navnet paa chippen kan skjules med CSS, men title-attributten
       (museover-tooltippen) er ikke en del af siden CSS kan skjule -
       den skal opdateres for sig, ellers lækker den navnet alligevel. */
    NK.Bord.prototype.saetNavne = function (vis) {
        this.navne = !!vis;
        this.scene.classList.toggle("skjul-navne", !this.navne);
        for (var id in this.chips) {
            if (!Object.prototype.hasOwnProperty.call(this.chips, id)) continue;
            var ion = D.ion(id);
            this.chips[id].title = this.navne ? (D.ionNavn(ion) + "  " + D.ionTekst(ion)) : D.ionTekst(ion);
        }
    };

    NK.Bord.prototype.aendret = function (hvad, side) {
        this.opdaterKnapper();
        this.lyt("aendret", { hvad: hvad, side: side });
    };

    NK.Bord.prototype.opdaterKnapper = function () {
        for (var id in this.chips) {
            if (!Object.prototype.hasOwnProperty.call(this.chips, id)) continue;
            var ion = D.ion(id);
            this.chips[id].classList.toggle("valgt", ion === this.kat || ion === this.an);
            this.chips[id].disabled = this.laast;
        }
        var sider = ["kat", "an"];
        for (var i = 0; i < sider.length; i++) {
            var side = sider[i], s = this.styr[side], n = this.antal(side);
            s.antal.textContent = n + " ×";
            s.minus.disabled = this.laast || n <= 0;
            s.plus.disabled = this.laast || n >= MAKS || !this[side];
            s.el.style.display = this[side] ? "" : "none";
        }
    };

    /* Én saetning om, hvad der mangler lige nu. */
    NK.Bord.prototype.beskriv = function () {
        if (this.besked) return this.besked.tekst;
        if (this.demo) return this.demo.tekst;
        if (!this.kat && !this.an) return "Træk en <b>positiv ion</b> ned fra hylden øverst og en <b>negativ ion</b> op fra hylden nederst — eller klik på dem.";
        if (!this.an) return "Træk nu en <b>negativ ion</b> op fra hylden nederst.";
        if (!this.kat) return "Træk nu en <b>positiv ion</b> ned fra hylden øverst.";
        var p = this.plus(), m = this.minus();
        var regn = "<b>" + p + "+</b> mod <b>" + m + "−</b>";
        if (p > m) return regn + ": der mangler minus. Læg en negativ ion mere.";
        if (m > p) return regn + ": der mangler plus. Læg en positiv ion mere.";
        var g = NK.gcd(this.nKat, this.nAn);
        if (g > 1) {
            return "Neutral — men der ligger <b>" + g + " ens enheder</b> på bordet (de gule streger). "
                + "Formlen viser den mindste: " + (this.nKat / g) + " : " + (this.nAn / g) + ".";
        }
        return "<b>" + p + "+</b> og <b>" + m + "−</b> går lige op. Forbindelsen er neutral.";
    };

    /* ----- Placering og bevaegelse --------------------------------------- */
    NK.Bord.prototype.tilpas = function () { this.l.tilpas(); };

    NK.Bord.prototype.layout = function () {
        var l = this.l, W = l.b, H = l.h;
        var cr = this.canvas.getBoundingClientRect();
        var tr = this.hyldeTop.getBoundingClientRect();
        var br = this.hyldeBund.getBoundingClientRect();
        var y0 = tr.bottom - cr.top + 16;
        var y1 = Math.min(br.top - cr.top, H) - 16;
        if (y1 - y0 < 180) { var midt = (y0 + y1) / 2; y0 = midt - 90; y1 = midt + 90; }
        var felter = Math.max(this.plus(), this.minus(), 6);
        var smal = W < 640;
        var venstre = smal ? 102 : 136, hoejre = smal ? 54 : 96;
        var U = NK.klamp((W - venstre - hoejre) / felter, 30, 84);
        var r = NK.klamp(U * 0.15, 7, 11);
        var gab = r + 3;
        var hc = NK.klamp((y1 - y0) / 2 - gab - 12, 56, 128);
        var x0 = venstre + Math.max(0, (W - venstre - hoejre - felter * U) / 2);
        return { W: W, H: H, y0: y0, y1: y1, zy: (y0 + y1) / 2, U: U, r: r, gab: gab, hc: hc, x0: x0,
                 felter: felter, styrB: smal ? 98 : 128 };
    };

    NK.Bord.prototype.startKort = function (k, g) {
        var cr = this.canvas.getBoundingClientRect();
        var fx = NaN, fy = NaN;
        if (k.slip) { fx = k.slip.x; fy = k.slip.y; }
        else if (k.fra) {
            var r = k.fra.getBoundingClientRect();
            if (r.width) { fx = r.left + r.width / 2 - cr.left; fy = r.top + r.height / 2 - cr.top; }
        }
        if (isNaN(fx)) { fx = k.mx + k.mb / 2; fy = k.side === "kat" ? g.y0 : g.y1; }
        k.x = fx - 12; k.y = fy - 12; k.b = 24; k.h = 24; k.a = 0;
    };

    NK.Bord.prototype.opdater = function (dt) {
        this.ur += dt;
        if (this.besked) { this.besked.t -= dt; if (this.besked.t <= 0) this.besked = null; }
        if (this.demo) { this.demo.t -= dt; if (this.demo.t <= 0) this.demoTrin(); }

        var g = this.g = this.layout();
        var felt = { kat: 0, an: 0 };
        var land = { kat: 0, an: 0 };
        var i, k;
        for (i = 0; i < this.kort.length; i++) {
            k = this.kort[i];
            var q = Math.abs(k.ion.q);
            if (!k.doer) {
                k.felt = felt[k.side];
                felt[k.side] += q;
                k.mx = g.x0 + k.felt * g.U + 3;
                k.mb = q * g.U - 6;
                k.mh = g.hc;
                k.my = k.side === "kat" ? g.zy - g.gab - g.hc : g.zy + g.gab;
                k.ma = 1;
            } else {
                /* Paa vej tilbage mod hylden. */
                k.my = k.side === "kat" ? g.y0 - g.hc * 0.7 : g.y1 - g.hc * 0.3;
                k.ma = 0;
            }
            if (isNaN(k.x)) this.startKort(k, g);
            if (k.vent > 0) { k.vent -= dt; continue; }
            if (k.fastholdt) {
                /* Kortet sidder under fingeren. Det taeller ikke med i
                   lynlaasen, saa laasen aabner sig, mens ionen er loeftet. */
                k.a = NK.mod(k.a, 1, 9, dt);
                continue;
            }
            k.x = NK.mod(k.x, k.mx, 11, dt);
            k.y = NK.mod(k.y, k.my, 11, dt);
            k.b = NK.mod(k.b, k.mb, 11, dt);
            k.h = NK.mod(k.h, k.mh, 11, dt);
            k.a = NK.mod(k.a, k.ma, k.doer ? 7 : 9, dt);
            if (!k.doer && k.a > 0.75) land[k.side] += q;
        }
        this.kort = this.kort.filter(function (kk) { return !(kk.doer && kk.a < 0.03); });
        this.land = land;

        /* Lynlaasen lukker fra venstre mod hoejre, ét felt ad gangen. */
        var par = (this.kat && this.an) ? Math.min(land.kat, land.an) : 0;
        for (i = 0; i < g.felter; i++) {
            var nu = this.lynlaas[i] || 0;
            if (i < par) {
                if (i === 0 || (this.lynlaas[i - 1] || 0) > 0.55) nu = Math.min(1, nu + dt * 7);
            } else {
                nu = Math.max(0, nu - dt * 9);
            }
            this.lynlaas[i] = nu;
        }
        this.lynlaas.length = g.felter;

        var maalX = g.x0 + Math.max(this.plus(), this.minus(), 1) * g.U + 36;
        this.maerkeX = isNaN(this.maerkeX) ? maalX : NK.mod(this.maerkeX, maalX, 9, dt);
    };

    /* ----- Tegning -------------------------------------------------------- */
    NK.Bord.prototype.tegn = function () {
        var l = this.l, c = l.ctx, g = this.g;
        l.ryd("#14141a");
        if (!g) return;
        var i, j, k, u, ux;
        var p = this.plus(), m = this.minus();
        var begge = !!(this.kat && this.an);
        var par = begge ? Math.min(this.land.kat, this.land.an) : 0;

        this.tegnSkinne(c, g);
        if (!this.kat) this.tegnPladsholder(c, g, "kat");
        if (!this.an) this.tegnPladsholder(c, g, "an");

        for (i = 0; i < this.kort.length; i++) {
            k = this.kort[i];
            if (k.vent > 0 || k.a < 0.01) continue;
            this.tegnKort(c, g, k);
        }

        /* Broerne mellem de plusser og minusser, der har fundet hinanden. */
        for (u = 0; u < g.felter; u++) {
            var lk = this.lynlaas[u] || 0;
            if (lk <= 0.01) continue;
            ux = g.x0 + (u + 0.5) * g.U;
            c.save();
            c.globalAlpha = lk;
            c.fillStyle = "rgba(126, 224, 168, 0.9)";
            NK.rundtRekt(c, ux - g.r * 0.45, g.zy - g.gab, g.r * 0.9, g.gab * 2, g.r * 0.45);
            c.fill();
            c.restore();
        }

        /* Ladningsmaerkerne paa kortenes inderkant. De, der mangler en
           partner, banker. */
        var puls = 1 + 0.1 * Math.sin(this.ur * 6.5);
        var har = { kat: [], an: [] };
        for (i = 0; i < this.kort.length; i++) {
            k = this.kort[i];
            if (k.vent > 0 || k.a < 0.05) continue;
            var q = Math.abs(k.ion.q);
            var enhed = (k.b + 6) / q;
            var my = k.side === "kat" ? k.y + k.h : k.y;
            for (j = 0; j < q; j++) {
                var uu = k.felt + j;
                var ensom = !k.doer && uu >= par && begge;
                NK.ladningsprik(c, k.x - 3 + (j + 0.5) * enhed, my, g.r * (ensom ? puls : 1), k.side === "kat", k.a);
                if (!k.doer && k.a > 0.75) har[k.side][uu] = true;
            }
        }

        /* Stiplede pladser, hvor en partner mangler. */
        for (u = 0; u < g.felter; u++) {
            var hk = !!har.kat[u], ha = !!har.an[u];
            if (hk === ha) continue;
            ux = g.x0 + (u + 0.5) * g.U;
            c.save();
            c.globalAlpha = 0.5 + 0.25 * Math.sin(this.ur * 4 + u);
            c.setLineDash([3, 3]);
            c.lineWidth = 1.5;
            c.strokeStyle = hk ? "#8fcaf0" : "#f39a8f";
            c.beginPath();
            c.arc(ux, hk ? g.zy + g.gab : g.zy - g.gab, g.r, 0, Math.PI * 2);
            c.stroke();
            c.restore();
        }

        if (begge && p === m && this.land.kat === p && this.land.an === m) {
            var enheder = NK.gcd(this.nKat, this.nAn);
            if (enheder > 1) this.tegnEnheder(c, g, enheder);
            /* Formlen staar under bordet, saa man ser den blive til:
               antallet af kort bliver til de smaa tal i formlen. */
            var plads = g.y1 - (g.zy + g.gab + g.hc);
            if (this.visFormel && plads > 46) {
                NK.tekstDele(c, [
                    { t: D.formeldel(this.kat, this.nKat / enheder), farve: "#f7a79d" },
                    { t: D.formeldel(this.an, this.nAn / enheder), farve: "#97cff5" }
                ], g.x0 + p * g.U / 2, g.zy + g.gab + g.hc + Math.min(34, plads * 0.5), {
                    font: "600 " + NK.klamp(plads * 0.5, 20, 32).toFixed(0) + "px 'Segoe UI', sans-serif", kant: true
                });
            }
            if (this.laast) {
                c.save();
                c.strokeStyle = "rgba(63, 174, 114, 0.75)";
                c.lineWidth = 2;
                NK.rundtRekt(c, g.x0 - 8, g.zy - g.gab - g.hc - 8, p * g.U + 16, 2 * (g.gab + g.hc) + 16, 14);
                c.stroke();
                c.restore();
            }
        }
        this.tegnMaerke(c, g, p, m, begge);
        if (this.traek) this.tegnTraek(c, g);
        this.placerStyr(g);
    };

    NK.Bord.prototype.tegnSkinne = function (c, g) {
        var xEnd = g.x0 + g.felter * g.U;
        var u, ux;
        c.save();
        c.strokeStyle = "rgba(169, 176, 186, 0.2)";
        c.setLineDash([5, 6]);
        c.lineWidth = 1.5;
        c.beginPath();
        c.moveTo(g.x0 - 8, g.zy);
        c.lineTo(xEnd + 8, g.zy);
        c.stroke();
        c.setLineDash([]);
        c.strokeStyle = "rgba(126, 224, 168, 0.85)";
        c.lineWidth = 2.5;
        for (u = 0; u < g.felter; u++) {
            var lk = this.lynlaas[u] || 0;
            if (lk <= 0.01) continue;
            c.globalAlpha = lk;
            c.beginPath();
            c.moveTo(g.x0 + u * g.U, g.zy);
            c.lineTo(g.x0 + (u + 1) * g.U, g.zy);
            c.stroke();
        }
        c.globalAlpha = 1;
        c.fillStyle = "rgba(169, 176, 186, 0.18)";
        for (u = 0; u < g.felter; u++) {
            ux = g.x0 + (u + 0.5) * g.U;
            c.beginPath(); c.arc(ux, g.zy - g.gab, 2.2, 0, Math.PI * 2); c.fill();
            c.beginPath(); c.arc(ux, g.zy + g.gab, 2.2, 0, Math.PI * 2); c.fill();
        }
        c.restore();
    };

    NK.Bord.prototype.tegnPladsholder = function (c, g, side) {
        var kat = side === "kat";
        var b = Math.min(3, g.felter) * g.U - 6;
        var x = g.x0 + 3;
        var y = kat ? g.zy - g.gab - g.hc : g.zy + g.gab;
        c.save();
        c.setLineDash([6, 5]);
        c.lineWidth = 1.5;
        c.strokeStyle = kat ? "rgba(224, 84, 70, 0.35)" : "rgba(61, 158, 224, 0.35)";
        NK.rundtRekt(c, x, y, b, g.hc, 10);
        c.stroke();
        c.restore();
        NK.tekst(c, kat ? "Træk en positiv ion herned  ↑" : "Træk en negativ ion herop  ↓", x + b / 2, y + g.hc / 2, {
            font: "600 13px 'Segoe UI', sans-serif", justering: "center", linje: "middle",
            farve: kat ? "rgba(243, 154, 143, 0.8)" : "rgba(143, 202, 240, 0.8)"
        });
    };

    NK.Bord.prototype.tegnKort = function (c, g, k) {
        var kat = k.side === "kat";
        var f = kat ? NK.FARVE.kat : NK.FARVE.an;
        var over = !k.doer && !this.laast && this.mus &&
            this.mus.x >= k.x && this.mus.x <= k.x + k.b && this.mus.y >= k.y && this.mus.y <= k.y + k.h;

        c.save();
        c.globalAlpha = k.a;
        NK.rundtRekt(c, k.x, k.y, k.b, k.h, 10);
        c.fillStyle = "rgba(" + f.glorie + ", " + (over ? 0.24 : 0.14) + ")";
        c.fill();
        c.lineWidth = 1.5;
        c.strokeStyle = "rgba(" + f.glorie + ", " + (over ? 1 : 0.7) + ")";
        c.stroke();

        var fs = NK.klamp(g.U * 0.19, 11, 16);
        NK.tekst(c, D.ionTekst(k.ion), k.x + k.b / 2, kat ? k.y + 7 : k.y + k.h - 6, {
            font: "600 " + fs.toFixed(1) + "px 'Segoe UI', sans-serif", justering: "center",
            linje: kat ? "top" : "bottom", farve: kat ? "#ffd2cc" : "#d2ecff"
        });

        if (over) {
            /* Et lille kryds i yderhjoernet: klik fjerner ionen. */
            var kx = k.x + k.b - 9, ky = kat ? k.y + 9 : k.y + k.h - 9;
            c.fillStyle = "rgba(20, 20, 26, 0.9)";
            c.beginPath(); c.arc(kx, ky, 7, 0, Math.PI * 2); c.fill();
            c.strokeStyle = "#f2f3f5";
            c.lineWidth = 1.6;
            c.beginPath();
            c.moveTo(kx - 3, ky - 3); c.lineTo(kx + 3, ky + 3);
            c.moveTo(kx + 3, ky - 3); c.lineTo(kx - 3, ky + 3);
            c.stroke();
        }
        c.restore();

        var top = kat ? k.y + 7 + fs + 5 : k.y + g.r + 5;
        var bund = kat ? k.y + k.h - g.r - 5 : k.y + k.h - 6 - fs - 5;
        var geo = NK.ionGeo(k.ion);
        var s = Math.min((k.b - 14) / (2 * geo.halvB), (bund - top) / (2 * geo.halvH), 34);
        if (s > 2) NK.tegnIon(c, k.ion, k.x + k.b / 2, (top + bund) / 2, s, { alpha: k.a });
    };

    /* Naar forholdet kan forkortes: gule streger mellem formelenhederne. */
    NK.Bord.prototype.tegnEnheder = function (c, g, antal) {
        var bredde = (this.plus() / antal) * g.U;
        var top = g.zy - g.gab - g.hc - 8, bund = g.zy + g.gab + g.hc + 8;
        var navn = D.formel(this.kat, this.an, this.nKat / antal, this.nAn / antal);
        var i;
        c.save();
        c.strokeStyle = "rgba(242, 197, 61, 0.8)";
        c.lineWidth = 1.5;
        c.setLineDash([5, 4]);
        for (i = 1; i < antal; i++) {
            var x = g.x0 + i * bredde;
            c.beginPath(); c.moveTo(x, top); c.lineTo(x, bund); c.stroke();
        }
        c.restore();
        for (i = 0; i < antal; i++) {
            NK.tekst(c, navn, g.x0 + (i + 0.5) * bredde, top - 1, {
                font: "700 12px 'Segoe UI', sans-serif", justering: "center", linje: "bottom", farve: "#f2c53d", kant: true
            });
        }
    };

    /* Den samlede ladning for enden af lynlaasen. */
    NK.Bord.prototype.tegnMaerke = function (c, g, p, m, begge) {
        if (!this.kat && !this.an) return;
        var sum = p - m;
        var x = this.maerkeX, y = g.zy;
        var kant = sum > 0 ? "#e05446" : (sum < 0 ? "#3d9ee0" : "#3fae72");
        var tekst = sum > 0 ? "#f39a8f" : (sum < 0 ? "#8fcaf0" : "#7ee0a8");
        c.save();
        c.beginPath();
        c.arc(x, y, 20, 0, Math.PI * 2);
        c.fillStyle = "#1b1b21";
        c.fill();
        c.lineWidth = 2.5;
        c.strokeStyle = kant;
        c.stroke();
        c.restore();
        NK.tekst(c, NK.fortegn(sum), x, y + 1, {
            font: "700 15px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: tekst
        });
        NK.tekst(c, begge && sum === 0 ? "neutral" : "i alt", x, y + 33, {
            font: "600 11px 'Segoe UI', sans-serif", justering: "center", linje: "middle",
            farve: begge && sum === 0 ? "#7ee0a8" : "#7e8590"
        });
    };

    /* ----- Traek en ion fra hylden ned paa bordet -------------------------
       Klik virker stadig; traekket er bare den vej, de fleste proever
       foerst. Ionen foelger fingeren i laerredet, og den raekke, den
       lander i, lyser op undervejs. */
    NK.Bord.prototype.startTraek = function (ion, chip, e) {
        if (this.laast || e.button > 0) return;
        var mig = this;
        var startX = e.clientX, startY = e.clientY;
        var aktiv = false;
        try { chip.setPointerCapture(e.pointerId); } catch (fejl) {}

        function flyt(ev) {
            if (!aktiv) {
                if (Math.abs(ev.clientX - startX) + Math.abs(ev.clientY - startY) < 6) return;
                aktiv = true;
                mig.demo = null;
                mig.scene.classList.add("traekker");
            }
            mig.traek = mig.traekPunkt(ion, ev);
        }
        function slip(ev) {
            chip.removeEventListener("pointermove", flyt);
            chip.removeEventListener("pointerup", slip);
            chip.removeEventListener("pointercancel", slip);
            try { chip.releasePointerCapture(ev.pointerId); } catch (fejl) {}
            mig.scene.classList.remove("traekker");
            mig.traek = null;
            if (!aktiv) return;
            mig.slugKlik = true;            /* klikket bagefter skal ikke ogsaa taelle */
            var p = mig.traekPunkt(ion, ev);
            if (!p.over) return;
            mig.slipPunkt = { x: p.x, y: p.y };
            mig.vaelg(ion, chip);
            mig.slipPunkt = null;
        }
        chip.addEventListener("pointermove", flyt);
        chip.addEventListener("pointerup", slip);
        chip.addEventListener("pointercancel", slip);
    };

    /* Hvor er fingeren i laerredet - og er den over bordet? */
    NK.Bord.prototype.traekPunkt = function (ion, ev) {
        var r = this.canvas.getBoundingClientRect();
        var x = ev.clientX - r.left, y = ev.clientY - r.top;
        var g = this.g;
        return { ion: ion, x: x, y: y,
                 over: !!g && x > 0 && x < g.W && y > g.y0 - 24 && y < g.y1 + 24 };
    };

    NK.Bord.prototype.tegnTraek = function (c, g) {
        var t = this.traek;
        var kat = t.ion.q > 0;
        var f = kat ? NK.FARVE.kat : NK.FARVE.an;
        if (t.over) {
            var y = kat ? g.zy - g.gab - g.hc : g.zy + g.gab;
            c.save();
            c.setLineDash([7, 5]);
            c.lineWidth = 2;
            c.strokeStyle = "rgba(" + f.glorie + ", 0.85)";
            NK.rundtRekt(c, g.x0 - 7, y - 7, g.felter * g.U + 14, g.hc + 14, 13);
            c.stroke();
            c.restore();
        }
        c.save();
        c.globalAlpha = t.over ? 1 : 0.55;
        NK.tegnIon(c, t.ion, t.x, t.y, Math.min(30, g.U * 0.42), { glorie: true, ladning: true });
        c.restore();
    };

    NK.Bord.prototype.placerStyr = function (g) {
        var x = Math.max(4, g.x0 - g.styrB);
        var yk = g.zy - g.gab - g.hc / 2, ya = g.zy + g.gab + g.hc / 2;
        var noegle = Math.round(x) + "|" + Math.round(yk) + "|" + Math.round(ya);
        if (noegle === this._styrNoegle) return;
        this._styrNoegle = noegle;
        this.styr.kat.el.style.left = x + "px";
        this.styr.kat.el.style.top = yk + "px";
        this.styr.an.el.style.left = x + "px";
        this.styr.an.el.style.top = ya + "px";
    };
}());
