/* =====================================================================
   lup.js - luppen med ionerne (fane 2 og 3)

   1 prik = 1 ion. Fanen giver luppen koncentrationerne af H₃O⁺ og OH⁻
   (saet), og luppen zoomer selv: den vaelger det rum, hvor der er over
   10 og hoejst 100 af den ion, der er flest af (NK.Kemi.autoZoom). Saa
   bliver der aldrig flere prikker, end man kan se hver for sig, og
   rummet er aldrig stoerre end i rent vand.

   Luppen tager ét zoom ad gangen, saa eleven kan se dem: foerst en gul
   ring om det rum, der bliver det nye, saa glider prikkerne ud eller ind,
   og et skilt siger "10 gange mindre rum". Terningens side vokser med
   10^(1/3) = 2,15 pr. zoom. Er luppen bagud (eleven trak hurtigt), gaar
   zoomene hurtigere, og indtil den er fremme, tegnes hoejst MAKS_TEGN.

   Positionerne er i enhedscirklen (u, v), saa luppen kan tegnes i enhver
   stoerrelse.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    var MAKS_TEGN = 300;       /* kun mens luppen er bagud */
    var ZOOM_TID = 0.55;       /* ét zoom, naar luppen kun er ét bagud */
    var ZOOM_HURTIG = 0.25;    /* naar den er flere bagud */
    var PAUSE = 0.12;          /* mellem to zoom */
    var SKILT_TID = 1.8;
    var FALM = 0.35;
    var SIDE = Math.pow(10, 1 / 3);
    var SLAGS = ["h3o", "oh"];

    function Lup() {
        this.prikker = { h3o: [], oh: [] };
        this.c = { h3o: 0, oh: 0 };
        this.z = null;
        this.zMaal = null;
        this.vent = -1;
        this.zoomT = 1;
        this.zoomTid = ZOOM_TID;
        this.retning = 0;
        this.skilt = null;
    }

    Lup.MAKS_TEGN = MAKS_TEGN;
    Lup.SIDE = SIDE;
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
    function nyPrik(andre) {
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
        var fa = Math.random() * Math.PI * 2, fart = 0.02 + Math.random() * 0.05;
        return { u: bedst.u, v: bedst.v, fu: bedst.u, fv: bedst.v, vu: Math.cos(fa) * fart, vv: Math.sin(fa) * fart, alfa: 0, fjern: false };
    }

    /* ----- Hvad luppen viser --------------------------------------------------- */
    /* Gennemsnitligt antal af en ion i luppens rum lige nu */
    P.antal = function (s) {
        return this.z === null ? 0 : K.antal(this.c[s], this.z);
    };

    /* Faerdig med at zoome */
    P.rolig = function () {
        return this.zoomT >= 1 && this.z === this.zMaal;
    };

    /* Zoomer den, eller skal den til? +1 ud, -1 ind, 0 ingen */
    P.zoomerMod = function () {
        if (this.zoomT < 1) return this.retning;
        if (this.z === null || this.z === this.zMaal) return 0;
        return this.zMaal > this.z ? 1 : -1;
    };

    /* Koncentrationerne i det, luppen kigger paa. vent: sekunder, foer
       luppen begynder at zoome (fane 3 venter, saa man ser "10 gange
       faerre" foer zoomet). */
    P.saet = function (cH, cO, vent) {
        this.c.h3o = cH;
        this.c.oh = cO;
        var zNy = K.autoZoom(cH, cO);
        if (this.z === null) this.z = zNy;
        if (zNy !== this.zMaal && zNy !== this.z && this.zoomT >= 1) this.vent = vent === undefined ? PAUSE : vent;
        this.zMaal = zNy;
        this.tilpasPrikker();
    };

    /* Prikkerne efter antallet i det nuvaerende rum */
    P.tilpasPrikker = function () {
        var mig = this;
        SLAGS.forEach(function (s) {
            var n = mig.antal(s);
            var maal = Math.min(MAKS_TEGN, Lup.antal(n));
            var liste = mig.prikker[s].filter(function (p) { return !p.fjern; });
            if (liste.length > maal) {
                /* Tilfaeldige forsvinder, ikke dem i én side */
                for (var i = liste.length - 1; i > 0; i--) {
                    var j = Math.floor(Math.random() * (i + 1)), t = liste[i];
                    liste[i] = liste[j];
                    liste[j] = t;
                }
                for (i = maal; i < liste.length; i++) liste[i].fjern = true;
            } else {
                var alle = mig.prikker.h3o.concat(mig.prikker.oh).filter(function (p) { return !p.fjern; });
                for (var k = liste.length; k < maal; k++) {
                    var ny = nyPrik(alle);
                    mig.prikker[s].push(ny);
                    alle.push(ny);
                }
            }
        });
    };

    /* Ét zoom mod zMaal: prikkerne glider, og de nye kommer bagefter */
    P.zoomTrin = function () {
        var r = this.zMaal > this.z ? 1 : -1;
        var bagud = Math.abs(this.zMaal - this.z);
        var k = r > 0 ? 1 / SIDE : SIDE;
        this.rFra = this.relRadius();
        SLAGS.forEach(function (s) {
            this.prikker[s].forEach(function (p) {
                p.fu = p.u;
                p.fv = p.v;
                p.u *= k;
                p.v *= k;
                if (p.u * p.u + p.v * p.v > 0.9) p.fjern = true;
            });
        }, this);
        this.z += r;
        this.retning = r;
        this.zoomT = 0;
        this.zoomTid = bagud > 1 ? ZOOM_HURTIG : ZOOM_TID;
        this.vent = -1;
        this.skilt = { tekst: r > 0 ? "10 gange større rum" : "10 gange mindre rum", t: 0 };
        this.tilpasPrikker();
    };

    /* Straks det rigtige rum, uden at glide (et klik paa et glas, selvtest) */
    P.hop = function () {
        if (this.z === this.zMaal) return;
        SLAGS.forEach(function (s) {
            this.prikker[s].forEach(function (p) { p.fjern = true; });
        }, this);
        this.z = this.zMaal;
        this.zoomT = 1;
        this.vent = -1;
        this.skilt = null;
        this.tilpasPrikker();
    };

    P.nulstil = function () {
        this.prikker = { h3o: [], oh: [] };
        this.z = null;
        this.zMaal = null;
        this.zoomT = 1;
        this.vent = -1;
        this.skilt = null;
    };

    /* Straks paa plads uden at falme (skaermbilleder og selvtest) */
    P.straks = function () {
        if (this.z !== this.zMaal) this.hop();
        var mig = this;
        SLAGS.forEach(function (s) {
            mig.prikker[s] = mig.prikker[s].filter(function (p) { return !p.fjern; });
            mig.prikker[s].forEach(function (p) { p.alfa = 1; p.fu = p.u; p.fv = p.v; });
        });
        this.zoomT = 1;
        this.skilt = null;
    };

    /* Antallet af prikker, der er (eller er ved at blive) tegnet */
    P.synlige = function (s) {
        return this.prikker[s].filter(function (p) { return !p.fjern; }).length;
    };

    P.opdater = function (dt) {
        var mig = this;
        if (this.zoomT < 1) {
            this.zoomT = Math.min(1, this.zoomT + dt / this.zoomTid);
        } else if (this.z !== null && this.z !== this.zMaal) {
            if (this.vent < 0) this.vent = PAUSE;
            this.vent -= dt;
            if (this.vent <= 0) this.zoomTrin();
        }
        if (this.skilt) {
            this.skilt.t += dt;
            if (this.skilt.t > SKILT_TID && this.zoomT >= 1) this.skilt = null;
        }
        var zoomer = this.zoomT < 1;
        SLAGS.forEach(function (s) {
            mig.prikker[s].forEach(function (p) {
                if (p.fjern) {
                    p.alfa -= dt / (zoomer ? mig.zoomTid : FALM * 0.6);
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
        if (alle.length < 2 || alle.length > 120 || !this.sidsteR) return;
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

    /* Prikkens stoerrelse i forhold til luppen efter, hvor mange der er i
       alt. Under et zoom glider den fra den gamle stoerrelse til den nye. */
    P.relRadius = function () {
        var n = this.synlige("h3o") + this.synlige("oh");
        var ny = Math.min(0.5 / Math.sqrt(Math.max(n, 1)), 0.13);
        if (this.zoomT < 1 && this.rFra) return NK.lerp(this.rFra, ny, NK.blod(this.zoomT));
        return ny;
    };

    P.radius = function (R) {
        return Math.max(1.8, R * this.relRadius());
    };

    /* v.farve: et svagt skaer af opløsningens farve. v.lys: kanten lyser */
    P.tegn = function (ctx, cx, cy, R, tid, v) {
        v = v || {};
        var mig = this;
        this.sidsteR = R;
        Tg.lupStart(ctx, cx, cy, R, v.farve);
        var r = this.radius(R);
        var t = NK.blod(this.zoomT);
        SLAGS.forEach(function (s) {
            var liste = mig.prikker[s];
            var andre = mig.synlige(s === "h3o" ? "oh" : "h3o");
            /* En enkelt ion blandt mange skal kunne findes */
            var rr = r, ensom = liste.length > 0 && mig.synlige(s) <= 5 && andre > 60;
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
        this.tegnZoom(ctx, cx, cy, R, tid);
        Tg.lupSlut(ctx, cx, cy, R, { lys: v.lys });
    };

    /* Den gule ring om det rum, der bliver det nye, og skiltet */
    P.tegnZoom = function (ctx, cx, cy, R, tid) {
        var ring = -1, alfa = 0;
        if (this.zoomT < 1) {
            var t = NK.blod(this.zoomT);
            ring = this.retning < 0 ? NK.lerp(R / SIDE, R, t) : NK.lerp(R, R / SIDE, t);
            alfa = this.retning < 0 ? 1 - t : 1;
        } else if (this.z !== null && this.zMaal < this.z) {
            /* Varslet: her er det rum, luppen zoomer ind paa */
            ring = R / SIDE;
            alfa = 0.55 + 0.35 * Math.sin(tid * 8);
        } else if (this.skilt && this.retning > 0 && this.skilt.t < SKILT_TID) {
            /* Efter et zoom ud: det gamle rum i midten, en kort stund */
            ring = R / SIDE;
            alfa = 1 - this.skilt.t / SKILT_TID;
        }
        if (ring > 0 && alfa > 0.02) {
            ctx.save();
            ctx.strokeStyle = "rgba(242, 197, 61, " + (0.9 * alfa) + ")";
            ctx.lineWidth = 2.5;
            ctx.setLineDash([7, 5]);
            ctx.beginPath();
            ctx.arc(cx, cy, ring, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        var sk = this.skilt;
        if (!sk) return;
        var a = sk.t < 0.15 ? sk.t / 0.15 : (sk.t > SKILT_TID - 0.4 ? Math.max(0, (SKILT_TID - sk.t) / 0.4) : 1);
        if (this.zoomT < 1) a = Math.max(a, 0.9);
        if (a <= 0.02) return;
        var px = NK.klamp(R * 0.085, 13, 17);
        ctx.save();
        ctx.globalAlpha = a;
        ctx.font = Tg.font("800", px);
        var b = ctx.measureText(sk.tekst).width + px * 1.4, h = px * 1.8;
        var y = cy + R * 0.66;
        ctx.fillStyle = "rgba(20, 24, 32, 0.88)";
        NK.rundtRekt(ctx, cx - b / 2, y - h / 2, b, h, h / 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(242, 197, 61, 0.9)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = "#f2c53d";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(sk.tekst, cx, y + 1);
        ctx.restore();
    };

    /* Taellingen under luppen: H₃O⁺ og OH⁻ med tal og rummets stoerrelse.
       W: laerredets bredde (er der ikke plads, bliver linjen kortere).
       Returnerer, hvor langt ned teksten gaar. */
    Lup.taelling = function (ctx, cx, y, R, lup, px, W) {
        var nH = lup.antal("h3o"), nO = lup.antal("oh");
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
        if (lup.z !== null) {
            var rt = K.rumTekst(lup.z), plads = 2 * Math.min(cx, (W || 1e9) - cx) - 12;
            ctx.save();
            ctx.font = Tg.font("600", px);
            if (ctx.measureText(rt).width > plads) rt = K.rumTekst(lup.z, true);
            ctx.restore();
            NK.tekst(ctx, rt, cx, sy, {
                font: Tg.font("600", px), justering: "center", linje: "top", farve: "#c8ced6", kant: true
            });
            sy += px + 5;
        }
        return sy;
    };

    NK.Lup = Lup;
}());
