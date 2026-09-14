/* =====================================================================
   mikro.js - partikelniveauet i zoomboblerne

   Hver beholder (kolben og de to reagensglas) har sin egen lille
   partikelmodel i en cirkel med radius 100 enheder. Modellen er ikke
   pynt: kolbens farve paa scenen styres af, hvor meget Br2 der er
   tilbage herinde, og testene i glassene er faerdige, naar alle
   Cu2+ har faaet 4 NH3, eller naar alt Br- er faeldet som AgBr.

   Kolben:  Br2 rammer kobberoverfladen. To elektroner (e−) springer fra
            et Cu-atom til Br2, og der dannes en Cu2+-ion og to Br−-ioner.
            Jo kraftigere der rystes, jo hurtigere bevaeger Br2 sig, og
            jo oftere rammer de kobberet.
   Glas:    NH3 saetter sig paa Cu2+ (4 pr. ion). Ag+ og Br− danner AgBr,
            der synker til bunds. NO3− er tilskuerion og goer ingenting.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var M = NK.Model;
    var R = 100;
    var r = NK.r;

    var RADIUS = { cu: 9.5, cu2: 8.5, br2: 8.5, br: 10, nh3: 8, ag: 8.5, no3: 8, agbr: 11 };
    var FART = { br2: 26, cu2: 20, br: 18, nh3: 30, ag: 24, no3: 20 };
    var E_TID = 0.5;                  /* sekunder, elektronerne er undervejs */

    /* Kobbergitteret i bunden af boblen: tre raekker taet pakket */
    var GITTER = [];
    (function () {
        var raekker = [{ y: 58, n: 9 }, { y: 74, n: 8 }, { y: 90, n: 5 }];
        raekker.forEach(function (rk) {
            for (var i = 0; i < rk.n; i++) GITTER.push({ x: (i - (rk.n - 1) / 2) * 18, y: rk.y });
        });
    }());

    /* Pladserne til AgBr i bunden */
    var BUNDPLADS = [{ x: 0, y: 76 }, { x: -27, y: 74 }, { x: 27, y: 74 }, { x: -13, y: 56 }, { x: 13, y: 56 }, { x: -40, y: 55 }, { x: 40, y: 55 }, { x: 0, y: 38 }];

    NK.Mikro = function (navn) {
        this.navn = navn;
        this.nulstil();
    };

    NK.Mikro.GITTER = GITTER.length;
    var P = NK.Mikro.prototype;

    P.nulstil = function () {
        this.partikler = [];
        this.haendelser = [];
        this.blink = [];
        this.vaeske = false;
        this.brStart = 0;
        this.bund = 0;
        this.farve = null;
    };

    P.ny = function (type, x, y, vx, vy) {
        var p = { type: type, x: x, y: y, vx: vx || 0, vy: vy || 0, a: r(0, 6.28), va: r(-1.5, 1.5), rad: RADIUS[type], alfa: 0 };
        this.partikler.push(p);
        return p;
    };

    P.fjern = function (p) {
        var i = this.partikler.indexOf(p);
        if (i >= 0) this.partikler.splice(i, 1);
    };

    P.antal = function (type) {
        var n = 0;
        for (var i = 0; i < this.partikler.length; i++) if (this.partikler[i].type === type) n++;
        return n;
    };

    /* Et tilfaeldigt sted i den oeverste del af boblen */
    function plads(ymax) {
        for (var n = 0; n < 40; n++) {
            var x = r(-72, 72), y = r(-78, ymax);
            if (x * x + y * y < 78 * 78) return { x: x, y: y };
        }
        return { x: 0, y: 0 };
    }

    /* ----- Tilsaetninger ------------------------------------------------ */
    P.tilfoejKobber = function () {
        for (var i = 0; i < GITTER.length; i++) {
            var c = this.ny("cu", GITTER[i].x, GITTER[i].y);
            c.fast = true;
            c.alfa = 1;
        }
    };

    P.tilfoejBrom = function () {
        this.vaeske = true;
        for (var i = 0; i < M.MAENGDE.BR2; i++) {
            var q = plads(20);
            this.ny("br2", q.x, q.y - 40 - i * 4, r(-20, 20), r(10, 40));
        }
        this.brStart = M.MAENGDE.BR2;
    };

    /* Halvdelen af ionerne fra kolben. del er 0 eller 1. */
    P.fyldFra = function (kilde, del) {
        this.vaeske = true;
        var cu2 = 0, br = 0;
        for (var i = 0; i < kilde.partikler.length; i++) {
            var k = kilde.partikler[i];
            if (k.type === "cu2") { if (cu2++ % 2 === del) { var q = plads(60); this.ny(k.type, q.x, q.y, r(-15, 15), r(-15, 15)); } }
            else if (k.type === "br") { if (br++ % 2 === del) { var q2 = plads(60); this.ny(k.type, q2.x, q2.y, r(-15, 15), r(-15, 15)); } }
        }
    };

    /* Vaesken er haeldt fra: kun kobberet bliver tilbage. */
    P.fjernIoner = function () {
        this.partikler = this.partikler.filter(function (p) { return p.type === "cu"; });
        this.haendelser = [];
        this.vaeske = false;
    };

    P.tilfoejNH3 = function () {
        for (var i = 0; i < M.MAENGDE.NH3_PR_DRAABE; i++) {
            this.ny("nh3", r(-30, 30), -86 + r(-4, 4), r(-30, 30), r(40, 70));
        }
    };

    P.tilfoejAgNO3 = function () {
        for (var i = 0; i < M.MAENGDE.AG_PR_DRAABE; i++) {
            this.ny("ag", r(-30, 30), -86 + r(-4, 4), r(-30, 30), r(40, 70));
            this.ny("no3", r(-30, 30), -80 + r(-4, 4), r(-30, 30), r(30, 60));
        }
    };

    /* ----- Til resten af animationen ------------------------------------ */
    P.brAndel = function () {
        if (!this.brStart) return 0;
        return this.antal("br2") / this.brStart;
    };

    P.kobberAndel = function () {
        return this.antal("cu") / GITTER.length;
    };

    P.kompleksAndel = function () {
        var n = 0, fuld = 0;
        for (var i = 0; i < this.partikler.length; i++) {
            var p = this.partikler[i];
            if (p.type === "cu2") { n++; fuld += Math.min(4, p.ligander ? p.ligander.length : 0); }
        }
        return n ? fuld / (4 * n) : 0;
    };

    P.bundfaldAndel = function () {
        return this.antal("agbr") / M.MAENGDE.BR_PR_GLAS;
    };

    P.travl = function () {
        return this.haendelser.length > 0;
    };

    /* ----- Tidens gang --------------------------------------------------- */
    function naermeste(liste, p, filter) {
        var bedst = null, afst = Infinity;
        for (var i = 0; i < liste.length; i++) {
            var q = liste[i];
            if (!filter(q)) continue;
            var d = (q.x - p.x) * (q.x - p.x) + (q.y - p.y) * (q.y - p.y);
            if (d < afst) { afst = d; bedst = q; }
        }
        return bedst;
    }

    P.opdater = function (dt, ryst) {
        var i, j, p, q;
        var liste = this.partikler;
        ryst = ryst || 0;

        for (i = 0; i < liste.length; i++) {
            p = liste[i];
            p.alfa = Math.min(1, p.alfa + dt * 3);
            if (p.fast || p.laast || p.vaert) continue;

            if (p.type === "agbr") {
                var bp = BUNDPLADS[p.plads % BUNDPLADS.length];
                p.x = NK.mod(p.x, bp.x, 2.2, dt);
                p.y = NK.mod(p.y, bp.y, 1.6, dt);
                continue;
            }

            /* Varmebevaegelse: retningen skifter tilfaeldigt, farten soeger
               mod typens fart. Rystning blander vaesken, saa alt i den
               bevaeger sig hurtigere. */
            var ligander = p.ligander ? p.ligander.length : 0;
            var maal = (FART[p.type] || 20) * (1 + 3.2 * ryst) * (ligander ? 0.6 : 1);
            var fart = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            var retning = fart > 0.01 ? Math.atan2(p.vy, p.vx) : r(0, 6.28);
            retning += (Math.random() - 0.5) * (5 + 8 * ryst) * dt;
            fart = NK.mod(fart, maal, 2.5, dt);
            p.vx = Math.cos(retning) * fart;
            p.vy = Math.sin(retning) * fart;

            /* NH3 soeger mod en Cu2+ med ledig plads, Ag+ mod en fri Br− */
            var mod = null;
            if (p.type === "nh3") mod = naermeste(liste, p, function (c) { return c.type === "cu2" && (!c.ligander || c.ligander.length < 4); });
            else if (p.type === "ag") mod = naermeste(liste, p, function (c) { return c.type === "br"; });
            if (mod) {
                var mx = mod.x - p.x, my = mod.y - p.y, md = Math.sqrt(mx * mx + my * my) || 1;
                p.vx += mx / md * 90 * dt;
                p.vy += my / md * 90 * dt;
                p.jagt = (p.jagt || 0) + dt;
            } else {
                p.jagt = 0;
            }
            if (ryst > 0.05) p.vy += r(-1, 1.6) * 120 * ryst * dt;

            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.a += p.va * (1 + 3 * ryst) * dt;

            var d = Math.sqrt(p.x * p.x + p.y * p.y);
            var graense = R - p.rad - 2;
            if (d > graense) {
                var nx = p.x / d, ny = p.y / d;
                p.x = nx * graense;
                p.y = ny * graense;
                var vn = p.vx * nx + p.vy * ny;
                if (vn > 0) { p.vx -= 2 * vn * nx; p.vy -= 2 * vn * ny; }
            }
            if (p.koel > 0) p.koel -= dt;
        }

        /* Sammenstoed */
        for (i = 0; i < liste.length; i++) {
            p = liste[i];
            if (p.fast || p.laast || p.vaert || p.type === "agbr") continue;

            /* Sikkerhedsnet: en NH3 eller Ag+, der har soegt sin partner i
               over 4 s uden at naa frem, reagerer med den naermeste. Saa
               kan en test aldrig gaa i staa. */
            if (p.jagt > 4) {
                var partner = naermeste(liste, p, p.type === "nh3" ? aabenCu : friBr);
                if (partner) {
                    if (p.type === "nh3") this.bind(p, partner); else this.faeld(p, partner);
                    i = -1;
                    continue;
                }
            }

            for (j = 0; j < liste.length; j++) {
                q = liste[j];
                if (q === p || q.laast || q.vaert || q.type === "agbr") continue;
                var dx = p.x - q.x, dy = p.y - q.y;
                var min = p.rad + q.rad + 0.5;
                var dd = dx * dx + dy * dy;
                if (dd >= min * min) continue;
                var afst = Math.sqrt(dd) || 0.01;
                var ux = dx / afst, uy = dy / afst;

                if (p.type === "br2" && q.type === "cu" && !(p.koel > 0)) {
                    p.koel = 0.25;
                    if (Math.random() < 0.03 + 0.8 * ryst) { this.startReaktion(q, p); break; }
                }
                var nh3 = p.type === "nh3" ? p : (q.type === "nh3" ? q : null);
                var cu2 = p.type === "cu2" ? p : (q.type === "cu2" ? q : null);
                if (nh3 && cu2 && aabenCu(cu2)) { this.bind(nh3, cu2); break; }
                var ag = p.type === "ag" ? p : (q.type === "ag" ? q : null);
                var br = p.type === "br" ? p : (q.type === "br" ? q : null);
                if (ag && br) { this.faeld(ag, br); i = -1; break; }

                var skub = (min - afst) * (q.fast ? 1 : 0.5);
                p.x += ux * skub;
                p.y += uy * skub;
                var vn2 = p.vx * ux + p.vy * uy;
                if (vn2 < 0) { p.vx -= 2 * vn2 * ux; p.vy -= 2 * vn2 * uy; }
            }
        }

        /* NH3, der sidder paa en Cu2+, foelger den rundt */
        for (i = 0; i < liste.length; i++) {
            p = liste[i];
            if (!p.vaert) continue;
            var v = p.vaert.a * 0.4 + p.nr * Math.PI / 2 + Math.PI / 4;
            var afs = p.vaert.rad + p.rad - 1.5;
            p.x = p.vaert.x + Math.cos(v) * afs;
            p.y = p.vaert.y + Math.sin(v) * afs;
        }

        this.opdaterHaendelser(dt);

        for (i = this.blink.length - 1; i >= 0; i--) {
            this.blink[i].liv -= dt * 2.2;
            if (this.blink[i].liv <= 0) this.blink.splice(i, 1);
        }
    };

    function aabenCu(c) { return c.type === "cu2" && (!c.ligander || c.ligander.length < 4); }
    function friBr(c) { return c.type === "br"; }

    /* NH3 saetter sig paa en Cu2+ med ledig plads */
    P.bind = function (nh3, cu2) {
        cu2.ligander = cu2.ligander || [];
        if (cu2.ligander.length >= 4) return false;
        nh3.vaert = cu2;
        nh3.nr = cu2.ligander.length;
        nh3.jagt = 0;
        cu2.ligander.push(nh3);
        return true;
    };

    /* Ag+ og Br- danner AgBr, der synker til bunds */
    P.faeld = function (ag, br) {
        var ab = this.ny("agbr", (ag.x + br.x) / 2, (ag.y + br.y) / 2);
        ab.alfa = 1;
        ab.plads = this.bund++;
        this.blink.push({ x: ab.x, y: ab.y, liv: 1, farve: "255, 240, 170" });
        this.fjern(ag);
        this.fjern(br);
        return true;
    };

    P.startReaktion = function (cu, br2) {
        cu.laast = true;
        br2.laast = true;
        this.haendelser.push({ cu: cu, br2: br2, t: 0 });
    };

    /* Br-atomernes pladser i et Br2-molekyle */
    function bromAtomer(m) {
        var c = Math.cos(m.a), s = Math.sin(m.a);
        return [{ x: m.x - c * 6.8, y: m.y - s * 6.8 }, { x: m.x + c * 6.8, y: m.y + s * 6.8 }];
    }

    P.opdaterHaendelser = function (dt) {
        for (var i = this.haendelser.length - 1; i >= 0; i--) {
            var h = this.haendelser[i];
            h.t += dt;
            if (h.t < E_TID) continue;
            var atomer = bromAtomer(h.br2);
            var c2 = this.ny("cu2", h.cu.x, h.cu.y - 3, r(-25, 25), r(-70, -45));
            c2.alfa = 1;
            for (var k = 0; k < 2; k++) {
                var ud = k === 0 ? -1 : 1;
                var b = this.ny("br", atomer[k].x, atomer[k].y, Math.cos(h.br2.a) * 45 * ud, Math.sin(h.br2.a) * 45 * ud - 15);
                b.alfa = 1;
            }
            this.blink.push({ x: h.cu.x, y: h.cu.y, liv: 1, farve: "130, 210, 255" });
            this.fjern(h.cu);
            this.fjern(h.br2);
            this.haendelser.splice(i, 1);
        }
    };

    /* ================================================================
       TEGNING
       ================================================================ */
    var UDSEENDE = {
        cu:   { lys: "#f3b684", moerk: "#8a4518", tekst: "#2a1406" },
        cu2:  { lys: "#c9ecff", moerk: "#2f8fc9", tekst: "#062038" },
        br:   { lys: "#ffd9b8", moerk: "#b0552a", tekst: "#2e1204" },
        br2:  { lys: "#ff9c70", moerk: "#8f2410", tekst: "#ffffff" },
        nh3:  { lys: "#c1d2ff", moerk: "#3a56b8", tekst: "#ffffff" },
        ag:   { lys: "#ffffff", moerk: "#8a949e", tekst: "#1a1d22" },
        no3:  { lys: "#dcebd0", moerk: "#6b8a5a", tekst: "#16210f" },
        agbr: { lys: "#fff6c4", moerk: "#bba64c", tekst: "#3a300a" }
    };

    var ETIKET = {
        cu: M.formel("Cu"), cu2: M.formel("Cu2+"), br: M.formel("Br-"), br2: M.formel("Br2"),
        nh3: M.formel("NH3"), ag: M.formel("Ag+"), no3: M.formel("NO3-"), agbr: M.formel("AgBr")
    };
    NK.Mikro.ETIKET = ETIKET;

    function etiket(ctx, tekst, x, y, farve, stoerrelse) {
        ctx.font = "700 " + stoerrelse + "px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = farve;
        ctx.fillText(tekst, x, y + 0.5);
    }

    function tegnPartikel(ctx, p) {
        var u = UDSEENDE[p.type];
        ctx.globalAlpha = NK.klamp(p.alfa, 0, 1);
        if (p.type === "br2") {
            var at = bromAtomer(p);
            NK.kugle(ctx, at[0].x, at[0].y, p.rad, u.lys, u.moerk);
            NK.kugle(ctx, at[1].x, at[1].y, p.rad, u.lys, u.moerk);
            etiket(ctx, ETIKET.br2, p.x, p.y, u.tekst, 7.5);
        } else if (p.type === "nh3") {
            var c = Math.cos(p.a), s = Math.sin(p.a);
            for (var k = 0; k < 3; k++) {
                var v = p.a + k * 2.1;
                NK.kugle(ctx, p.x + Math.cos(v) * 7.5, p.y + Math.sin(v) * 7.5, 3.3, "#ffffff", "#9aa6b3");
            }
            NK.kugle(ctx, p.x + c * 0, p.y + s * 0, p.rad, u.lys, u.moerk);
            etiket(ctx, ETIKET.nh3, p.x, p.y, u.tekst, 6.2);
        } else if (p.type === "agbr") {
            NK.kugle(ctx, p.x + 5, p.y, 9.5, UDSEENDE.agbr.lys, UDSEENDE.agbr.moerk);
            NK.kugle(ctx, p.x - 7, p.y, 7, "#ffffff", "#a4acb4");
            etiket(ctx, ETIKET.agbr, p.x - 1, p.y + 0.5, u.tekst, 6.5);
        } else if (p.type === "cu2") {
            var n = p.ligander ? p.ligander.length : 0;
            var lys = n ? "#b8c4ff" : u.lys, moerk = n ? mix("#2f8fc9", "#1a2a9e", n / 4) : u.moerk;
            NK.kugle(ctx, p.x, p.y, p.rad, lys, moerk);
            etiket(ctx, ETIKET.cu2, p.x, p.y, n >= 2 ? "#ffffff" : u.tekst, 7);
        } else {
            NK.kugle(ctx, p.x, p.y, p.rad, u.lys, u.moerk);
            etiket(ctx, ETIKET[p.type], p.x, p.y, u.tekst, p.type === "no3" ? 6 : 7.2);
        }
        ctx.globalAlpha = 1;
    }

    function mix(a, b, t) {
        function hex(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
        var x = hex(a), y = hex(b);
        return "rgb(" + Math.round(NK.lerp(x[0], y[0], t)) + ", " + Math.round(NK.lerp(x[1], y[1], t)) + ", " + Math.round(NK.lerp(x[2], y[2], t)) + ")";
    }

    /* Tegner boblen b = { x, y, r } med modellen indeni. */
    P.tegn = function (ctx, b, alfa, titel, tid) {
        if (alfa < 0.01) return;
        var k = (b.r - 4) / R;
        var i;
        ctx.save();
        ctx.globalAlpha = alfa;
        ctx.translate(b.x, b.y);

        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
        ctx.shadowBlur = 18;
        ctx.fillStyle = "#12151b";
        ctx.beginPath();
        ctx.arc(0, 0, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, b.r - 2, 0, Math.PI * 2);
        ctx.clip();
        if (this.vaeske && this.farve) {
            ctx.fillStyle = NK.css({ r: this.farve.r, g: this.farve.g, b: this.farve.b, a: 0.26 });
            ctx.fillRect(-b.r, -b.r, b.r * 2, b.r * 2);
        }
        ctx.scale(k, k);

        var lag = [[], []];
        for (i = 0; i < this.partikler.length; i++) {
            var p = this.partikler[i];
            lag[p.fast || p.type === "agbr" ? 0 : 1].push(p);
        }
        for (i = 0; i < lag[0].length; i++) tegnPartikel(ctx, lag[0][i]);
        for (i = 0; i < lag[1].length; i++) tegnPartikel(ctx, lag[1][i]);

        /* Elektronerne paa vej fra Cu til Br2 */
        for (i = 0; i < this.haendelser.length; i++) {
            var h = this.haendelser[i];
            var t = NK.blod(h.t / E_TID);
            var at = bromAtomer(h.br2);
            NK.skaer(ctx, h.cu.x, h.cu.y, 22, "rgba(255, 230, 120, 0.7)", 0.6 * (1 - t));
            for (var e = 0; e < 2; e++) {
                var ex = NK.lerp(h.cu.x, at[e].x, t);
                var ey = NK.lerp(h.cu.y, at[e].y, t) - Math.sin(t * Math.PI) * 14;
                NK.skaer(ctx, ex, ey, 9, "rgba(255, 236, 110, 0.9)");
                NK.kugle(ctx, ex, ey, 3.2, "#fffbd0", "#e0b020");
                etiket(ctx, "e" + NK.ladningHaevet(-1), ex + 7, ey - 7, "#ffe98a", 7);
            }
        }

        for (i = 0; i < this.blink.length; i++) {
            var bl = this.blink[i];
            ctx.globalAlpha = alfa * NK.klamp(bl.liv, 0, 1) * 0.8;
            ctx.strokeStyle = "rgba(" + bl.farve + ", 1)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(bl.x, bl.y, 12 + (1 - bl.liv) * 22, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();

        /* Kant og genskin */
        ctx.globalAlpha = alfa;
        var ring = ctx.createLinearGradient(-b.r, -b.r, b.r, b.r);
        ring.addColorStop(0, "#e3e8ee");
        ring.addColorStop(0.5, "#7b8490");
        ring.addColorStop(1, "#c7ced7");
        ctx.strokeStyle = ring;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, 0, b.r - 1, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, b.r - 9, Math.PI * 1.1, Math.PI * 1.45);
        ctx.stroke();

        if (titel) {
            ctx.font = "700 11px 'Segoe UI', sans-serif";
            var bredde = ctx.measureText(titel).width + 16;
            ctx.fillStyle = "rgba(20, 22, 28, 0.9)";
            NK.rundtRekt(ctx, -bredde / 2, b.r - 8, bredde, 19, 9.5);
            ctx.fill();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
            ctx.lineWidth = 1;
            ctx.stroke();
            NK.tekst(ctx, titel, 0, b.r + 1.5, { font: "700 11px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#dfe5ec" });
        }
        ctx.restore();
    };
}());
