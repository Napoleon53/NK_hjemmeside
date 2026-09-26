/* =====================================================================
   lup.js - luppen med ionerne (fane 2 og 3)

   1 prik = 1 ion. Fanen fortaeller, hvor mange H₃O⁺ og OH⁻ der i
   gennemsnit er i luppens rum (saet), og luppen holder styr paa
   prikkerne: nye kommer til og falmer ind, overskydende forsvinder, og de
   driver lidt rundt. Er der flere end MAKS af en slags, tegnes de som en
   taet taage i stedet.

   Et zoomklik (zoom) er et 10 gange stoerre eller mindre rum. Terningens
   side vokser saa med 10^(1/3) = 2,15, og prikkerne glider ind mod eller
   ud fra midten, foer de nye kommer.

   Positionerne er i enhedscirklen (u, v), saa luppen kan tegnes i enhver
   stoerrelse.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var Tg = NK.Tegn;

    var MAKS = 1000;           /* flere prikker af én slags bliver til taage */
    var ZOOM_TID = 0.45;
    var FALM = 0.35;
    var SIDE = Math.pow(10, 1 / 3);
    var SLAGS = ["h3o", "oh"];

    function Lup() {
        this.prikker = { h3o: [], oh: [] };
        this.forventet = { h3o: 0, oh: 0 };
        this.taage = { h3o: 0, oh: 0 };
        this.taageMaal = { h3o: 0, oh: 0 };
        this.zoomT = 1;
    }

    Lup.MAKS = MAKS;
    var P = Lup.prototype;

    /* Antallet, der tegnes: gennemsnittet rundet, 0 under en halv */
    Lup.antal = function (n) {
        return n < 0.5 ? 0 : Math.round(n);
    };

    function tilfaeldigPlads() {
        var a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random()) * 0.9;
        return { u: Math.cos(a) * d, v: Math.sin(a) * d };
    }

    /* Er der faa prikker, vaelges den bedste af flere pladser: den, der
       ligger laengst fra de andre (saa de ikke ligger oven i hinanden) */
    function nyPrik(u, v, andre) {
        if (u === undefined) {
            var bedst = tilfaeldigPlads();
            if (andre && andre.length && andre.length < 150) {
                var bedstD = -1;
                for (var f = 0; f < 14; f++) {
                    var p = f === 0 ? bedst : tilfaeldigPlads(), mind = 9;
                    for (var i = 0; i < andre.length; i++) {
                        var du = andre[i].u - p.u, dv = andre[i].v - p.v, d2 = du * du + dv * dv;
                        if (d2 < mind) mind = d2;
                    }
                    if (mind > bedstD) { bedstD = mind; bedst = p; }
                }
            }
            u = bedst.u;
            v = bedst.v;
        }
        var fa = Math.random() * Math.PI * 2, fart = 0.02 + Math.random() * 0.05;
        return { u: u, v: v, fu: u, fv: v, vu: Math.cos(fa) * fart, vv: Math.sin(fa) * fart, alfa: 0, fjern: false };
    }

    /* Gennemsnitligt antal af hver slags i luppens rum */
    P.saet = function (nH, nO) {
        this.forventet.h3o = nH;
        this.forventet.oh = nO;
        var mig = this;
        SLAGS.forEach(function (s) {
            var n = mig.forventet[s];
            var maal = n > MAKS ? 0 : Lup.antal(n);
            mig.taageMaal[s] = n > MAKS ? 1 : 0;
            var liste = mig.prikker[s].filter(function (p) { return !p.fjern; });
            if (liste.length > maal) {
                /* De sidste forsvinder */
                for (var i = maal; i < liste.length; i++) liste[i].fjern = true;
            } else {
                var alle = mig.prikker.h3o.concat(mig.prikker.oh).filter(function (p) { return !p.fjern; });
                for (var j = liste.length; j < maal; j++) {
                    var ny = nyPrik(undefined, undefined, alle);
                    mig.prikker[s].push(ny);
                    alle.push(ny);
                }
            }
        });
    };

    /* retning +1: zoom ud (10 gange stoerre rum), -1: zoom ind */
    P.zoom = function (retning) {
        var k = retning > 0 ? 1 / SIDE : SIDE;
        var mig = this;
        SLAGS.forEach(function (s) {
            mig.prikker[s].forEach(function (p) {
                p.fu = p.u;
                p.fv = p.v;
                p.u *= k;
                p.v *= k;
                if (p.u * p.u + p.v * p.v > 0.9) p.fjern = true;
            });
        });
        this.zoomT = 0;
    };

    P.nulstil = function () {
        this.prikker = { h3o: [], oh: [] };
        this.taage = { h3o: 0, oh: 0 };
        this.zoomT = 1;
    };

    /* Straks paa plads uden at falme (skaermbilleder og selvtest) */
    P.straks = function () {
        var mig = this;
        SLAGS.forEach(function (s) {
            mig.prikker[s] = mig.prikker[s].filter(function (p) { return !p.fjern; });
            mig.prikker[s].forEach(function (p) { p.alfa = 1; p.fu = p.u; p.fv = p.v; });
            mig.taage[s] = mig.taageMaal[s];
        });
        this.zoomT = 1;
    };

    /* Antallet af prikker, der er (eller er ved at blive) tegnet */
    P.synlige = function (s) {
        return this.prikker[s].filter(function (p) { return !p.fjern; }).length;
    };

    P.opdater = function (dt) {
        var mig = this;
        if (this.zoomT < 1) this.zoomT = Math.min(1, this.zoomT + dt / ZOOM_TID);
        var zoomer = this.zoomT < 1;
        SLAGS.forEach(function (s) {
            mig.taage[s] = NK.mod(mig.taage[s], mig.taageMaal[s], 6, dt);
            mig.prikker[s].forEach(function (p) {
                if (p.fjern) {
                    p.alfa -= dt / (zoomer ? ZOOM_TID : FALM * 0.6);
                } else if (!zoomer || p.alfa > 0.5) {
                    p.alfa = Math.min(1, p.alfa + dt / FALM);
                }
                if (zoomer) return;
                p.fu = p.u;
                p.fv = p.v;
                p.u += p.vu * dt;
                p.v += p.vv * dt;
                var r2 = p.u * p.u + p.v * p.v;
                if (r2 > 0.9) {
                    /* Tilbage mod midten */
                    p.vu = -p.u * 0.05 + (Math.random() - 0.5) * 0.03;
                    p.vv = -p.v * 0.05 + (Math.random() - 0.5) * 0.03;
                }
                if (Math.random() < dt * 0.4) {
                    var a = Math.random() * Math.PI * 2, f = 0.02 + Math.random() * 0.05;
                    p.vu = Math.cos(a) * f;
                    p.vv = Math.sin(a) * f;
                }
            });
            mig.prikker[s] = mig.prikker[s].filter(function (p) { return !(p.fjern && p.alfa <= 0); });
        });
        if (!zoomer) this.skilAd(dt);
    };

    /* Faa prikker skubber blidt til hinanden, saa de ikke klumper */
    P.skilAd = function (dt) {
        var alle = this.prikker.h3o.concat(this.prikker.oh).filter(function (p) { return !p.fjern; });
        if (alle.length < 2 || alle.length > 90 || !this.sidsteR) return;
        var min = 2.3 * this.radius(this.sidsteR) / this.sidsteR, k = Math.min(1, dt * 6);
        for (var i = 0; i < alle.length; i++) {
            for (var j = i + 1; j < alle.length; j++) {
                var a = alle[i], b = alle[j];
                var du = b.u - a.u, dv = b.v - a.v, d = Math.sqrt(du * du + dv * dv) || 0.001;
                if (d >= min) continue;
                var f = (min - d) / d * 0.5 * k;
                a.u -= du * f; a.v -= dv * f;
                b.u += du * f; b.v += dv * f;
            }
        }
        alle.forEach(function (p) {
            var r = Math.sqrt(p.u * p.u + p.v * p.v);
            if (r > 0.92) { p.u *= 0.92 / r; p.v *= 0.92 / r; }
        });
    };

    /* Prikkens stoerrelse efter, hvor mange der er i alt */
    P.radius = function (R) {
        var n = this.synlige("h3o") + this.synlige("oh");
        return NK.klamp(R * 0.5 / Math.sqrt(Math.max(n, 1)), 1.8, R * 0.13);
    };

    /* v.farve: et svagt skaer af opløsningens farve */
    P.tegn = function (ctx, cx, cy, R, tid, v) {
        v = v || {};
        var mig = this;
        this.sidsteR = R;
        Tg.lupStart(ctx, cx, cy, R, v.farve);
        SLAGS.forEach(function (s) {
            if (mig.taage[s] > 0.01) Tg.taage(ctx, cx, cy, R, s, mig.taage[s]);
        });
        var r = this.radius(R);
        var t = NK.blod(this.zoomT);
        SLAGS.forEach(function (s) {
            var liste = mig.prikker[s];
            var andre = mig.synlige(s === "h3o" ? "oh" : "h3o") + (mig.taageMaal[s === "h3o" ? "oh" : "h3o"] ? MAKS : 0);
            /* En enkelt ion blandt mange skal kunne findes */
            var rr = r, ensom = liste.length > 0 && liste.length <= 5 && andre > 60;
            if (ensom) rr = Math.max(r, 5.5);
            liste.forEach(function (p) {
                if (p.alfa <= 0) return;
                var u = t < 1 ? NK.lerp(p.fu, p.u, t) : p.u, w = t < 1 ? NK.lerp(p.fv, p.v, t) : p.v;
                var x = cx + u * R, y = cy + w * R;
                if (ensom && !p.fjern) {
                    ctx.save();
                    ctx.strokeStyle = "rgba(242, 197, 61, " + (0.45 + 0.4 * Math.sin(tid * 5)) + ")";
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(x, y, rr + 5, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();
                }
                Tg.ion(ctx, s, x, y, rr, NK.klamp(p.alfa, 0, 1));
            });
        });
        Tg.lupSlut(ctx, cx, cy, R, { lys: v.lys });
    };

    /* Taellingen under luppen: H₃O⁺ og OH⁻ med tal, og terningens stoerrelse.
       Returnerer, hvor langt ned teksten gaar. */
    Lup.taelling = function (ctx, cx, y, R, nH, nO, z, px) {
        var K = NK.Kemi;
        var tH = "H₃O⁺  " + K.antalTekst(nH), tO = "OH⁻  " + K.antalTekst(nO);
        var fpx = NK.klamp(R * 0.11, 14, 19);
        ctx.save();
        ctx.font = Tg.font("800", fpx);
        var bH = ctx.measureText(tH).width, bO = ctx.measureText(tO).width;
        ctx.restore();
        var mellem = NK.klamp(R * 0.2, 18, 34), ialt = 18 + bH + mellem + 18 + bO;
        var x = cx - ialt / 2;
        Tg.ion(ctx, "h3o", x + 7, y + fpx * 0.55, 7);
        NK.tekst(ctx, tH, x + 18, y, { font: Tg.font("800", fpx), linje: "top", farve: "#ffb3aa", kant: true });
        x += 18 + bH + mellem;
        Tg.ion(ctx, "oh", x + 7, y + fpx * 0.55, 7);
        NK.tekst(ctx, tO, x + 18, y, { font: Tg.font("800", fpx), linje: "top", farve: "#a8d4fa", kant: true });
        var sy = y + fpx + 7;
        NK.tekst(ctx, "Terning på " + K.sideTekst(z) + ", som " + K.sammenligning(z), cx, sy, {
            font: Tg.font("600", px), justering: "center", linje: "top", farve: "#c8ced6", kant: true
        });
        sy += px + 5;
        var linje = "";
        if (nO > 0 && nO < 0.5 && nH >= 0.5) linje = "OH⁻ i gennemsnit: " + K.gennemsnitTekst(nO);
        else if (nH > 0 && nH < 0.5 && nO >= 0.5) linje = "H₃O⁺ i gennemsnit: " + K.gennemsnitTekst(nH);
        if (linje) {
            NK.tekst(ctx, linje, cx, sy, { font: Tg.font("600", px), justering: "center", linje: "top", farve: "#a9b0ba", kant: true });
            sy += px + 5;
        }
        return sy;
    };

    NK.Lup = Lup;
}());
