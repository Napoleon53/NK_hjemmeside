/* =====================================================================
   tegning.js - labyrinten paa laerredet

   Tegner det, NK.Spil siger: mure, gange, de fire svarrum med svarene,
   skjoldet, spilleren og spoegelserne. Tegningen roerer ikke reglerne.
   Spilleren og spoegelserne hopper ét felt ad gangen i reglerne; her
   glider de kort imellem felterne, saa det er lettere at foelge dem.

   Felternes stoerrelse (T) foelger laerredet, saa labyrinten fylder
   det, der er plads til, ogsaa paa en projektor. Murene tegnes én gang
   pr. stoerrelse i et lag for sig.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    var FARVE = {
        bund: "#05060f",
        gang: "#0a0c1e",
        mur: "#111540",
        murKant: "#4a63ff",
        prik: "#2d3470",
        spiller: "#ffd84a",
        skjold: "#5ee7ff",
        moent: "#ffd23f",
        rigtig: "#4ade80",
        forkert: "#ff4757"
    };

    /* Svarene: Tahoma har tvaerstreger paa stort I, saa CaI₂ ikke kan
       laeses som Cal₂ */
    var SKRIFT = "Tahoma, Verdana, 'Segoe UI', sans-serif";

    var GLID_SPILLER = 70;   /* ms */
    var GLID_SPOEGELSE = 120;

    /* Svarrummenes kasser (i felter), fundet i kortet */
    var KASSER = (function () {
        var k = {};
        D.KORT.forEach(function (r, y) {
            r.forEach(function (v, x) {
                if (v < 2) return;
                var b = k[v] || (k[v] = { x0: x, y0: y, x1: x, y1: y });
                b.x0 = Math.min(b.x0, x); b.y0 = Math.min(b.y0, y);
                b.x1 = Math.max(b.x1, x); b.y1 = Math.max(b.y1, y);
            });
        });
        return k;
    }());

    function Tegning(canvas) {
        this.L = new NK.Laerred(canvas);
        this.T = 30;
        this.ox = 0;
        this.oy = 0;
        this.lag = null;
        this.lagNoegle = "";
        this.konfetti = [];
        this.vp = null;
    }

    var P = Tegning.prototype;

    P.tilpas = function () {
        this.L.tilpas();
        var b = this.L.b, h = this.L.h;
        var T = Math.max(8, Math.floor(Math.min(b / D.KOLONNER, h / D.RAEKKER)));
        this.T = T;
        this.ox = Math.round((b - T * D.KOLONNER) / 2);
        this.oy = Math.round((h - T * D.RAEKKER) / 2);
    };

    /* Midten af et felt i pixels */
    P.px = function (x) { return this.ox + (x + 0.5) * this.T; };
    P.py = function (y) { return this.oy + (y + 0.5) * this.T; };

    /* Hele banen i pixels (til rundvisningen og beskeder) */
    P.banen = function () {
        return { x: this.ox, y: this.oy, b: this.T * D.KOLONNER, h: this.T * D.RAEKKER, T: this.T };
    };

    /* ----- Det faste lag: gange, prikker og mure ------------------------ */
    P.bygLag = function () {
        var T = this.T, dpr = window.devicePixelRatio || 1;
        var noegle = T + ":" + dpr;
        if (this.lag && this.lagNoegle === noegle) return;
        this.lagNoegle = noegle;
        var c = this.lag || document.createElement("canvas");
        this.lag = c;
        c.width = Math.round(T * D.KOLONNER * dpr);
        c.height = Math.round(T * D.RAEKKER * dpr);
        var ctx = c.getContext("2d");
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, T * D.KOLONNER, T * D.RAEKKER);

        function erMur(x, y) { return NK.Spil.mur(x, y); }

        /* Gange og prikker */
        ctx.fillStyle = FARVE.gang;
        ctx.fillRect(0, 0, T * D.KOLONNER, T * D.RAEKKER);
        ctx.fillStyle = FARVE.prik;
        D.KORT.forEach(function (r, y) {
            r.forEach(function (v, x) {
                if (v !== 0) return;
                ctx.beginPath();
                ctx.arc((x + 0.5) * T, (y + 0.5) * T, Math.max(1.5, T * 0.07), 0, Math.PI * 2);
                ctx.fill();
            });
        });

        /* Murene: fyld og en lysende kant der, hvor muren moeder en gang */
        ctx.fillStyle = FARVE.mur;
        D.KORT.forEach(function (r, y) {
            r.forEach(function (v, x) { if (v === 1) ctx.fillRect(x * T, y * T, T, T); });
        });
        var lw = Math.max(2, T * 0.08), ind = lw / 2 + T * 0.06;
        ctx.save();
        ctx.strokeStyle = FARVE.murKant;
        ctx.lineWidth = lw;
        ctx.lineCap = "round";
        ctx.shadowColor = "rgba(74, 99, 255, 0.7)";
        ctx.shadowBlur = T * 0.25;
        ctx.beginPath();
        D.KORT.forEach(function (r, y) {
            r.forEach(function (v, x) {
                if (v !== 1) return;
                var x0 = x * T, y0 = y * T, x1 = x0 + T, y1 = y0 + T;
                /* Kanten ligger lidt inde i muren; hjoernerne forlaenges,
                   hvor muren fortsaetter, saa linjerne moedes */
                var vn = !erMur(x - 1, y), hn = !erMur(x + 1, y), on = !erMur(x, y - 1), nn = !erMur(x, y + 1);
                if (on) { ctx.moveTo(vn ? x0 + ind : x0, y0 + ind); ctx.lineTo(hn ? x1 - ind : x1, y0 + ind); }
                if (nn) { ctx.moveTo(vn ? x0 + ind : x0, y1 - ind); ctx.lineTo(hn ? x1 - ind : x1, y1 - ind); }
                if (vn) { ctx.moveTo(x0 + ind, on ? y0 + ind : y0); ctx.lineTo(x0 + ind, nn ? y1 - ind : y1); }
                if (hn) { ctx.moveTo(x1 - ind, on ? y0 + ind : y0); ctx.lineTo(x1 - ind, nn ? y1 - ind : y1); }
            });
        });
        ctx.stroke();
        ctx.restore();
    };

    /* ----- Glidning mellem felterne ----------------------------------- */
    function glid(obj, v, nu, varighed, spring) {
        if (!v || spring) return { x: obj.x, y: obj.y, fx: obj.x, fy: obj.y, tx: obj.x, ty: obj.y, t0: nu };
        if (v.tx !== obj.x || v.ty !== obj.y) {
            var t = NK.klamp((nu - v.t0) / varighed, 0, 1);
            var cx = NK.lerp(v.fx, v.tx, NK.blod(t)), cy = NK.lerp(v.fy, v.ty, NK.blod(t));
            /* Et hop over mere end ét felt (nulstilling) glider ikke */
            if (Math.abs(obj.x - v.tx) + Math.abs(obj.y - v.ty) > 1) return glid(obj, null, nu);
            v.fx = cx; v.fy = cy; v.tx = obj.x; v.ty = obj.y; v.t0 = nu;
        }
        var s = NK.blod(NK.klamp((nu - v.t0) / varighed, 0, 1));
        v.x = NK.lerp(v.fx, v.tx, s);
        v.y = NK.lerp(v.fy, v.ty, s);
        return v;
    }

    /* ----- Hele billedet ------------------------------------------------- */
    /* nu: tid i ms (performance.now), spil: NK.Spil */
    P.tegn = function (spil, nu) {
        this.tilpas();
        this.bygLag();
        var ctx = this.L.ctx, T = this.T;
        ctx.fillStyle = FARVE.bund;
        ctx.fillRect(0, 0, this.L.b, this.L.h);
        ctx.drawImage(this.lag, this.ox, this.oy, T * D.KOLONNER, T * D.RAEKKER);

        var iSpil = spil.skaerm !== "start" && spil.q;
        if (iSpil && spil.skaerm !== "slut") {
            this.tegnRum(ctx, spil, nu);
            this.tegnSkjolde(ctx, spil, nu);
            var sov = spil.vaagnerOm() > 0;
            for (var i = 0; i < spil.spoegelser.length; i++) this.tegnSpoegelse(ctx, spil.spoegelser[i], spil, nu, sov);
            this.tegnSpiller(ctx, spil, nu);
        }
        if (spil.skaerm === "slut") this.tegnKonfetti(ctx, nu);
    };

    /* Skiltenes faelles skriftstoerrelse, saa det laengste svar kan vaere
       der, og alle skilte er lige store. Paa en lille skaerm, hvor
       skriften ville blive under MIN_PX, deles svar med mellemrum i to
       linjer, hvis det giver stoerre skrift. */
    var MIN_PX = 12;

    function delITo(t) {
        var midt = t.length / 2, bedst = -1;
        for (var i = 0; i < t.length; i++) {
            if (t[i] === " " && (bedst < 0 || Math.abs(i - midt) < Math.abs(bedst - midt))) bedst = i;
        }
        return bedst < 0 ? [t] : [t.slice(0, bedst), t.slice(bedst + 1)];
    }

    P.skilte = function (ctx, tekster) {
        var T = this.T, maksB = 4 * T - T * 0.5;
        function stoerst(linjer) {
            var s = T * 0.62, bred = 0;
            for (; s > T * 0.26; s *= 0.94) {
                ctx.font = "700 " + s + "px " + SKRIFT;
                bred = 0;
                linjer.forEach(function (ls) { ls.forEach(function (l) { bred = Math.max(bred, ctx.measureText(l).width); }); });
                if (bred + T * 0.5 <= maksB) break;
            }
            return { s: s, bred: bred };
        }
        ctx.save();
        var linjer = tekster.map(function (t) { return [t]; });
        var r = stoerst(linjer);
        if (r.s < MIN_PX && tekster.some(function (t) { return t.indexOf(" ") > 0; })) {
            var delt = tekster.map(delITo), r2 = stoerst(delt);
            if (r2.s > r.s) { linjer = delt; r = r2; }
        }
        ctx.restore();
        var antal = Math.max.apply(null, linjer.map(function (l) { return l.length; }));
        return { s: r.s, linjer: linjer, antal: antal, b: Math.min(maksB, Math.max(2.2 * T, r.bred + T * 0.6)) };
    };

    /* Svarrummene: farvet gulv, en ramme og svaret paa en skilt midt i */
    P.tegnRum = function (ctx, spil, nu) {
        var T = this.T, mig = this;
        var visRigtig = spil.skaerm === "rigtigt" || spil.skaerm === "tabt";
        var lay = this.skilte(ctx, spil.rum.map(function (r) { return r.t; }));
        var s = lay.s, linjeH = s * 1.2;
        var skiltB = lay.b;
        var skiltH = s * 1.75 + linjeH * (lay.antal - 1);

        spil.rum.forEach(function (r) {
            var info = D.RUM[r.z], k = KASSER[r.z];
            var x0 = mig.ox + k.x0 * T, y0 = mig.oy + k.y0 * T;
            var b = (k.x1 - k.x0 + 1) * T, h = (k.y1 - k.y0 + 1) * T;
            var farve = info.farve;
            var lys = visRigtig && r.ok;
            ctx.save();
            if (r.proevet) ctx.globalAlpha = 0.45;
            ctx.fillStyle = lys ? "rgba(74, 222, 128, 0.22)" : farve + "1f";
            ctx.fillRect(x0, y0, b, h);
            ctx.lineWidth = Math.max(2, T * 0.07);
            ctx.strokeStyle = lys ? FARVE.rigtig : farve + "99";
            if (lys) { ctx.shadowColor = FARVE.rigtig; ctx.shadowBlur = T * 0.6 * (0.7 + 0.3 * Math.sin(nu / 180)); }
            NK.rundtRekt(ctx, x0 + T * 0.12, y0 + T * 0.12, b - T * 0.24, h - T * 0.24, T * 0.3);
            ctx.stroke();
            ctx.shadowBlur = 0;

            /* Skiltet med svaret, midt i rummet */
            var cx = x0 + b / 2, cy = y0 + h / 2;
            ctx.fillStyle = "rgba(4, 5, 14, 0.88)";
            NK.rundtRekt(ctx, cx - skiltB / 2, cy - skiltH / 2, skiltB, skiltH, skiltH * 0.3);
            ctx.fill();
            ctx.lineWidth = Math.max(1.5, T * 0.045);
            ctx.strokeStyle = lys ? FARVE.rigtig : farve;
            ctx.stroke();
            ctx.font = "700 " + s + "px " + SKRIFT;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = lys ? "#d7ffe6" : farve;
            var linjer = lay.linjer[spil.rum.indexOf(r)];
            linjer.forEach(function (l, i) {
                ctx.fillText(l, cx, cy + s * 0.04 + (i - (linjer.length - 1) / 2) * linjeH);
            });
            if (r.proevet) {
                ctx.globalAlpha = 1;
                ctx.strokeStyle = FARVE.forkert;
                ctx.lineWidth = Math.max(2, T * 0.08);
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(cx - skiltB / 2 + T * 0.2, cy);
                ctx.lineTo(cx + skiltB / 2 - T * 0.2, cy);
                ctx.stroke();
            }
            ctx.restore();
        });
    };

    /* Skjoldet: en gul moent med et skjold paa, der pulserer svagt */
    P.tegnSkjolde = function (ctx, spil, nu) {
        var T = this.T, mig = this;
        spil.skjolde.forEach(function (m) {
            var x = mig.px(m.x), y = mig.py(m.y), r = T * 0.26 * (1 + 0.06 * Math.sin(nu / 160));
            ctx.save();
            ctx.shadowColor = FARVE.moent;
            ctx.shadowBlur = T * 0.5;
            ctx.fillStyle = FARVE.moent;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            /* Skjoldet paa moenten */
            ctx.fillStyle = "#6b4a00";
            var s = r * 0.62;
            ctx.beginPath();
            ctx.moveTo(x, y - s);
            ctx.lineTo(x + s * 0.8, y - s * 0.62);
            ctx.quadraticCurveTo(x + s * 0.78, y + s * 0.45, x, y + s);
            ctx.quadraticCurveTo(x - s * 0.78, y + s * 0.45, x - s * 0.8, y - s * 0.62);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        });
    };

    /* Pacman: gul med en mund, der aabner og lukker, naar han flytter sig */
    P.tegnSpiller = function (ctx, spil, nu) {
        var sp = spil.spiller, T = this.T;
        var ny = !this.vp || this.vp.flyt !== sp.flyt;
        this.vp = glid(sp, ny ? null : this.vp, nu, GLID_SPILLER, ny);
        this.vp.flyt = sp.flyt;
        var x = this.ox + (this.vp.x + 0.5) * T, y = this.oy + (this.vp.y + 0.5) * T;
        var r = T * 0.4;

        /* Munden gaar, lige efter et skridt */
        var aktiv = nu - this.vp.t0 < 260 && (this.vp.fx !== this.vp.tx || this.vp.fy !== this.vp.ty);
        var mund = aktiv ? 0.08 + 0.3 * Math.abs(Math.sin(nu / 55)) : 0.22;
        var v = Math.atan2(sp.vendt.y, sp.vendt.x);

        ctx.save();
        /* Skjold eller fredet tid: en ring, der skrumper, mens tiden gaar */
        if (sp.skjold && sp.skjoldMax > 0) {
            var andel = NK.klamp(sp.skjoldMs / sp.skjoldMax, 0, 1);
            ctx.strokeStyle = FARVE.skjold;
            ctx.lineWidth = Math.max(2, T * 0.07);
            ctx.globalAlpha = 0.35;
            ctx.beginPath();
            ctx.arc(x, y, T * 0.5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 0.95;
            ctx.shadowColor = FARVE.skjold;
            ctx.shadowBlur = T * 0.3;
            ctx.beginPath();
            ctx.arc(x, y, T * 0.5, -Math.PI / 2, -Math.PI / 2 + andel * Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }
        ctx.fillStyle = FARVE.spiller;
        ctx.shadowColor = "rgba(255, 216, 74, 0.6)";
        ctx.shadowBlur = T * 0.25;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, r, v + mund * Math.PI, v + (2 - mund) * Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        /* Oejet sidder over munden */
        var ov = v - Math.PI / 2 * (sp.vendt.x < 0 ? -1 : 1);
        if (sp.vendt.y !== 0) ov = v - Math.PI / 2;
        ctx.fillStyle = "#1a1400";
        ctx.beginPath();
        ctx.arc(x + Math.cos(ov) * r * 0.5 + Math.cos(v) * r * 0.12, y + Math.sin(ov) * r * 0.5 + Math.sin(v) * r * 0.12, Math.max(1.5, r * 0.13), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    /* Et spoegelse med boelget skoert og oejne, der kigger efter spilleren.
       Mens de sover, er oejnene lukkede, og der stiger et z op. */
    P.tegnSpoegelse = function (ctx, g, spil, nu, sover) {
        var T = this.T;
        g._v = glid(g, g._v, nu, GLID_SPOEGELSE, false);
        var x = this.ox + (g._v.x + 0.5) * T, y = this.oy + (g._v.y + 0.5) * T;
        var r = T * 0.4, top = y - r * 0.15, bund = y + r * 0.95;
        ctx.save();
        ctx.fillStyle = g.farve;
        ctx.shadowColor = g.farve;
        ctx.shadowBlur = sover ? 0 : T * 0.25;
        if (sover) ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(x, top, r, Math.PI, 0);
        ctx.lineTo(x + r, bund);
        var boelger = 3, bw = 2 * r / boelger, fase = (nu / 140 + g.nr) % 2 < 1 ? 1 : -1;
        for (var i = 0; i < boelger; i++) {
            var xa = x + r - i * bw;
            ctx.quadraticCurveTo(xa - bw / 2, bund - r * 0.28 * fase, xa - bw, bund);
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        var ex = r * 0.38, ey = top - r * 0.05;
        if (sover) {
            ctx.strokeStyle = "#1b1030";
            ctx.lineWidth = Math.max(1.5, r * 0.12);
            ctx.lineCap = "round";
            [-1, 1].forEach(function (s) {
                ctx.beginPath();
                ctx.arc(x + s * ex, ey, r * 0.18, 0.15 * Math.PI, 0.85 * Math.PI);
                ctx.stroke();
            });
            /* z stiger op */
            var f = (nu / 1400 + g.nr * 0.37) % 1;
            NK.tekst(ctx, "z", x + r * 0.6 + f * r * 0.5, top - r * 0.9 - f * r * 0.9, {
                font: "700 " + Math.round(r * (0.55 + f * 0.35)) + "px 'Segoe UI', sans-serif",
                farve: "#dfe6ff", alfa: 1 - f, justering: "center", linje: "middle"
            });
        } else {
            var sp = spil.spiller;
            var dx = sp.x - g.x, dy = sp.y - g.y, l = Math.sqrt(dx * dx + dy * dy) || 1;
            [-1, 1].forEach(function (s) {
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.ellipse(x + s * ex, ey, r * 0.24, r * 0.3, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#1a2a8a";
                ctx.beginPath();
                ctx.arc(x + s * ex + dx / l * r * 0.1, ey + dy / l * r * 0.12, r * 0.12, 0, Math.PI * 2);
                ctx.fill();
            });
        }
        ctx.restore();
    };

    /* ----- Konfetti, naar et emne er gennemfoert ---------------------- */
    P.startKonfetti = function () {
        this.konfetti = [];
        for (var i = 0; i < 110; i++) {
            this.konfetti.push({
                x: Math.random(), y: -Math.random(),
                vy: 0.12 + Math.random() * 0.14, sv: Math.random() * 6,
                farve: "hsl(" + Math.floor(Math.random() * 360) + ", 95%, 60%)",
                s: 0.5 + Math.random() * 0.5
            });
        }
        this.konfettiStart = null;
    };

    P.tegnKonfetti = function (ctx, nu) {
        if (!this.konfetti.length) return;
        if (this.konfettiStart === null) this.konfettiStart = nu;
        var t = (nu - this.konfettiStart) / 1000, b = this.L.b, h = this.L.h, T = this.T;
        ctx.save();
        this.konfetti.forEach(function (p) {
            var y = ((p.y + p.vy * t) % 1.1 + 1.1) % 1.1 - 0.05;
            var x = p.x + Math.sin(t * 2 + p.sv) * 0.015;
            ctx.fillStyle = p.farve;
            var s = T * 0.22 * p.s;
            ctx.save();
            ctx.translate(x * b, y * h);
            ctx.rotate(t * 3 + p.sv);
            ctx.fillRect(-s / 2, -s / 4, s, s / 2);
            ctx.restore();
        });
        ctx.restore();
    };

    NK.Tegning = Tegning;
}());
