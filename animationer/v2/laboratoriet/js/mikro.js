/* =====================================================================
   mikro.js - partikelniveauet i zoomboblen

   Boblen viser den valgte beholder i en cirkel med radius R. Hvor mange
   partikler der skal vaere af hver slags, kommer fra oploesningen
   (NK.Stof.partikelTal). Boblen afstemmer sig selv mod de tal: nye
   partikler falder ned oppefra, overfloedige toner ud. Fast stof synker
   til bunds og bliver liggende.

   Hver partikel er én kugle med formlen paa: en sammensat ion som NO₃⁻
   er én kugle, ikke fire, der sidder sammen. Farven er stoffets farve i
   oploesning eller graa, naar det er farveloest. Vandmolekylerne ligger
   svagt i baggrunden.

   Det er et modelbillede af, hvad der sker, ikke et regnskab.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var Stof = NK.Stof;
    var r = NK.r;

    NK.Mikro = function (R) {
        this.R = R || 120;
        this.nulstil();
        this.foerste = true;
    };

    var P = NK.Mikro.prototype;

    P.nulstil = function () {
        this.partikler = [];
        this.spawnUr = 0;
        this.foerste = false;
        this.fast = null;
        this.s = { ryst: 0 };
    };

    P.toem = function () { this.nulstil(); };

    /* Faa, store kugler: en enkelt ion er 14 enheder, lange formler op til 22 */
    function radius(navn) {
        var s = Stof.STOFFER[navn];
        if (!s) return 14;
        if (s.fase === "s") return 16;
        var l = (s.kort || s.formel).replace(/[₀-₉]/g, "").length;
        return NK.klamp(11 + l * 1.9, 14, 22);
    }

    function farveAf(navn) {
        var s = Stof.STOFFER[navn];
        if (s && s.farve) return s.farve;
        if (s && s.q > 0) return { r: 214, g: 190, b: 150 };
        if (s && s.q < 0) return { r: 150, g: 190, b: 214 };
        return { r: 190, g: 196, b: 205 };
    }

    P.ny = function (navn, x, y, vx, vy) {
        var s = Stof.STOFFER[navn];
        var p = {
            navn: navn, x: x, y: y, vx: vx || 0, vy: vy || 0, rad: radius(navn), alfa: 0,
            fast: !!(s && s.fase === "s"), tekst: s && s.kort ? s.kort : Stof.formel(navn), farve: farveAf(navn), fase: r(0, 6.28), doer: false
        };
        this.partikler.push(p);
        return p;
    };

    P.antal = function (navn) {
        var n = 0;
        for (var i = 0; i < this.partikler.length; i++) if (this.partikler[i].navn === navn && !this.partikler[i].doer) n++;
        return n;
    };

    /* Foerste gang boblen fyldes, ligger partiklerne bare fordelt i den.
       Der er ikke tilsat noget: det er en beholder, man kigger ned i, og
       saa skal indholdet ikke falde ned oppefra. Fast stof ligger i
       bunden. */
    P.fyldOp = function (maal) {
        var R = this.R, mig = this;
        Object.keys(maal).forEach(function (navn) {
            for (var i = mig.antal(navn); i < maal[navn]; i++) {
                var rad = radius(navn), fast = Stof.STOFFER[navn] && Stof.STOFFER[navn].fase === "s";
                var v = r(0, 6.28), d = Math.sqrt(Math.random()) * (R - rad - 6);
                var p = mig.ny(navn, Math.cos(v) * d, fast ? r(R * 0.3, R * 0.6) : Math.sin(v) * d, 0, 0);
                p.alfa = 1;
            }
        });
    };

    /* Fast stof: boblen viser stoffets gitter (Stof.gitter) i stedet for
       partikler i en oploesning */
    P.visFast = function (f) {
        this.nulstil();
        this.fast = f || null;
    };

    /* maal: { stof: antal }. s: { ryst } */
    P.opdater = function (dt, maal, s) {
        var R = this.R, i, p;
        this.s = s || this.s;
        if (this.fast) return;
        maal = maal || {};
        var ryst = this.s.ryst || 0;
        if (this.foerste) { this.foerste = false; this.fyldOp(maal); }

        /* Afstem antallet mod maalet, én partikel ad gangen */
        this.spawnUr -= dt;
        if (this.spawnUr <= 0) {
            this.spawnUr = 0.12;
            var navne = Object.keys(maal), gjort = false;
            for (i = 0; i < navne.length && !gjort; i++) {
                var n = navne[i], har = this.antal(n);
                if (har < maal[n]) { this.ny(n, r(-R * 0.6, R * 0.6), -R - 10, r(-10, 10), r(40, 90)); gjort = true; }
            }
            if (!gjort) {
                for (i = this.partikler.length - 1; i >= 0; i--) {
                    p = this.partikler[i];
                    if (!p.doer && (!maal[p.navn] || this.antal(p.navn) > maal[p.navn])) { p.doer = true; break; }
                }
            }
        }

        for (i = this.partikler.length - 1; i >= 0; i--) {
            p = this.partikler[i];
            p.alfa = NK.mod(p.alfa, p.doer ? 0 : 1, 4, dt);
            if (p.doer && p.alfa < 0.03) { this.partikler.splice(i, 1); continue; }
            var fart = p.fast ? 0 : 16 + 60 * ryst;
            if (p.fast) {
                p.vy += 120 * dt;
                p.vx *= Math.exp(-3 * dt);
                if (ryst > 0.3) { p.vx += r(-200, 200) * ryst * dt; p.vy -= r(0, 300) * ryst * dt; }
            } else {
                p.vx += r(-1, 1) * fart * 8 * dt;
                p.vy += r(-1, 1) * fart * 8 * dt;
                var v = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                if (v > fart * 2) { p.vx *= fart * 2 / v; p.vy *= fart * 2 / v; }
            }
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            /* Inden for cirklen */
            var d = Math.sqrt(p.x * p.x + p.y * p.y), maks = R - p.rad - 2;
            if (d > maks) {
                var nx = p.x / d, ny = p.y / d;
                p.x = nx * maks; p.y = ny * maks;
                var dot = p.vx * nx + p.vy * ny;
                if (dot > 0) { p.vx -= 1.6 * dot * nx; p.vy -= 1.6 * dot * ny; }
                if (p.fast) { p.vx *= 0.3; p.vy = Math.min(p.vy, 0); }
            }
        }

        /* Partiklerne skubber hinanden lidt fra sig */
        for (i = 0; i < this.partikler.length; i++) {
            for (var j = i + 1; j < this.partikler.length; j++) {
                var a = this.partikler[i], b = this.partikler[j];
                var dx = b.x - a.x, dy = b.y - a.y, dd = Math.sqrt(dx * dx + dy * dy) || 0.01;
                var min = a.rad + b.rad + 1;
                if (dd < min) {
                    var k = (min - dd) * 0.5;
                    a.x -= dx / dd * k; a.y -= dy / dd * k;
                    b.x += dx / dd * k; b.y += dy / dd * k;
                }
            }
        }
    };

    P.tegnKant = function (ctx, alfa) {
        var R = this.R;
        ctx.globalAlpha = alfa;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(-R * 0.35, -R * 0.35, R * 0.55, Math.PI * 1.1, Math.PI * 1.55);
        ctx.stroke();
    };

    /* Et udsnit af det faste stof: iongitteret med stoffets eget
       formelforhold, eller ens byggesten, der ligger taet */
    P.tegnGitter = function (ctx) {
        var R = this.R, f = this.fast, x, y;
        var celle = [];
        if (f.dele) f.dele.forEach(function (d) { for (var i = 0; i < d.antal; i++) celle.push(d.navn); });
        var mol = f.molekyle || null;
        var trin = R * 0.27;
        var rad = mol ? trin * 0.5 : trin * 0.44;
        var raekkeH = mol ? trin * 0.87 : trin;
        var raekke = 0;
        for (y = -R - trin; y < R + trin; y += raekkeH, raekke++) {
            var soejle = 0;
            for (x = -R - trin + (mol && raekke % 2 ? trin / 2 : 0); x < R + trin; x += trin, soejle++) {
                var navn = mol || celle[(raekke + soejle) % celle.length];
                var fa = farveAf(navn);
                NK.kugle(ctx, x, y, rad,
                    NK.css({ r: Math.min(255, fa.r + 60), g: Math.min(255, fa.g + 60), b: Math.min(255, fa.b + 60) }),
                    NK.css({ r: fa.r * 0.55, g: fa.g * 0.55, b: fa.b * 0.55 }));
                var st = Stof.STOFFER[navn];
                var tekst = st && st.kort ? st.kort : Stof.formel(navn);
                var str = tekst.length > 5 ? rad * 0.5 : (tekst.length > 3 ? rad * 0.62 : rad * 0.78);
                NK.tekst(ctx, tekst, x, y + 0.5, { font: "800 " + str.toFixed(1) + "px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#ffffff", kant: true, kantBredde: 3, kantFarve: "rgba(0,0,0,0.55)" });
            }
        }
    };

    /* Forklaringen staar inde i boblen, hvor der er bredde nok til den */
    P.tegnGitterTekst = function (ctx, alfa) {
        var R = this.R, ly0 = R * 0.6;
        ctx.globalAlpha = alfa;
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(-R, ly0, R * 2, 24);
        NK.tekst(ctx, this.fast.tekst, 0, ly0 + 12, { font: "600 11px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#f2f4f7" });
    };

    /* Boblen tegnes med centrum i (cx, cy). forbind: punktet, den hoerer til */
    P.tegn = function (ctx, cx, cy, alfa, tid, forbind, farve) {
        if (alfa < 0.02) return;
        var R = this.R, i;
        ctx.save();
        ctx.globalAlpha = alfa;

        if (forbind) {
            var dx = forbind.x - cx, dy = forbind.y - cy, d = Math.sqrt(dx * dx + dy * dy) || 1;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
            ctx.lineWidth = 1.4;
            ctx.setLineDash([4, 5]);
            ctx.beginPath();
            ctx.moveTo(cx + dx / d * R, cy + dy / d * R);
            ctx.lineTo(forbind.x, forbind.y);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.beginPath();
            ctx.arc(forbind.x, forbind.y, 3.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.translate(cx, cy);
        var g = ctx.createRadialGradient(-R * 0.3, -R * 0.3, R * 0.1, 0, 0, R);
        var f = farve || { r: 40, g: 60, b: 80 };
        g.addColorStop(0, NK.css({ r: f.r + 30, g: f.g + 30, b: f.b + 30, a: 0.96 }));
        g.addColorStop(1, NK.css({ r: f.r * 0.6, g: f.g * 0.6, b: f.b * 0.6, a: 0.96 }));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.clip();

        /* Fast stof: gitteret i stedet for partikler i vand */
        if (this.fast) {
            this.tegnGitter(ctx);
            this.tegnGitterTekst(ctx, alfa);
            ctx.restore();
            this.tegnKant(ctx, alfa);
            ctx.restore();
            return;
        }

        /* Vand i baggrunden */
        ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
        for (i = 0; i < 14; i++) {
            var wx = Math.sin(i * 2.7 + tid * 0.3) * R * 0.8, wy = Math.cos(i * 1.9 + tid * 0.25) * R * 0.8;
            ctx.beginPath();
            ctx.arc(wx, wy, 6, 0, Math.PI * 2);
            ctx.fill();
        }

        for (i = 0; i < this.partikler.length; i++) {
            var p = this.partikler[i];
            ctx.globalAlpha = alfa * p.alfa;
            var lys = { r: Math.min(255, p.farve.r + 60), g: Math.min(255, p.farve.g + 60), b: Math.min(255, p.farve.b + 60) };
            var moerk = { r: p.farve.r * 0.55, g: p.farve.g * 0.55, b: p.farve.b * 0.55 };
            NK.kugle(ctx, p.x, p.y, p.rad, NK.css(lys), NK.css(moerk));
            if (p.fast) {
                ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.rad, 0, Math.PI * 2);
                ctx.stroke();
            }
            var str = p.tekst.length > 5 ? 11 : (p.tekst.length > 3 ? 13 : 15);
            NK.tekst(ctx, p.tekst, p.x, p.y + 0.5, { font: "800 " + str + "px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#ffffff", kant: true, kantBredde: 3, kantFarve: "rgba(0,0,0,0.55)" });
        }

        /* Legende for de forkortede navne, nederst i boblen */
        var legende = [], set = {};
        for (i = 0; i < this.partikler.length; i++) {
            var q = this.partikler[i], sq = Stof.STOFFER[q.navn];
            if (sq && sq.kort && !set[q.navn] && q.alfa > 0.2) { set[q.navn] = true; legende.push(sq.kort + " = " + sq.dansk); }
        }
        if (legende.length) {
            ctx.globalAlpha = alfa;
            var lh = 14, ly0 = R - 10 - legende.length * lh;
            ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
            ctx.fillRect(-R, ly0 - 6, R * 2, R - ly0 + 6);
            legende.forEach(function (tekst, k) {
                NK.tekst(ctx, tekst, 0, ly0 + k * lh + lh / 2, { font: "600 11px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#f2f4f7" });
            });
        }
        ctx.restore();
        this.tegnKant(ctx, alfa);
        ctx.restore();
    };
}());
