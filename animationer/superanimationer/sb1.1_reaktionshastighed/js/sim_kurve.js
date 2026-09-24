/* =====================================================================
   sim_kurve.js - fane 1: Kurven

   Bogens reaktion 5 Br⁻ + BrO₃⁻ + 6 H⁺ → 3 Br₂ + 3 H₂O. Til venstre
   baegerglasset, der bliver gult af Br₂, til hoejre kurverne for [Br₂]
   og [BrO₃⁻]. Kurverne tegnes, mens reaktionen afspilles.

   Tre vaerktoejer paa den valgte kurve:
     aflaes    et tidspunkt: koncentrationerne
     sekant    to tidspunkter: gennemsnitshastigheden
     tangent   en lineal, eleven selv drejer i enderne. Rører den kun
               kurven i punktet, er dens hældning hastigheden lige dér.

   Tallene kommer fra NK.Model.bromat. Opgavekortet (js/opgave.js)
   stiller scenen op og kan laase vaerktoejet og skjule facit.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var B = NK.Model.bromat;

    var FARVE = { br2: "#f0a830", bro3: "#5fb6f0" };
    var SEKANT = "#57d18c";
    var LINEAL = "#e9eef4";
    var NAVN = { br2: "Br₂", bro3: "BrO₃⁻" };
    var FART = 42;              /* simulerede sekunder pr. sekund */
    var TOLERANCE = 0.10;       /* linealen godkendes som tangent inden for 10 % */
    var SKRIFT = "'Segoe UI', sans-serif";

    function SimKurve() {
        this.L = new NK.Laerred(NK.el("kurve-laerred"));
        this.tid = 0;
        this.t = 0;                 /* tidspunktet i aflaes */
        this.vist = 0;              /* kurverne er tegnet hertil */
        this.spiller = false;
        this.vaerktoej = "aflaes";
        this.stof = "br2";
        this.t1 = 80;
        this.t2 = 120;
        this.tT = 100;
        this.lineal = 0;            /* linealens hældning i M/s */
        this.laas = false;          /* opgaven har laast vaerktoejet */
        this.skjul = false;         /* opgaven skjuler facit i aflaesningen */
        this.traek = null;
        this.over = null;
        this.lay = null;
        this.kort = new NK.Opgavekort("kurve", D.KURVE_OPGAVER, this);
        this.bind();
        this.visPanel();
    }

    var P = SimKurve.prototype;

    /* ----- Layout ------------------------------------------------------ */
    P.tilpas = function () {
        var ny = this.L.tilpas();
        if (!ny && this.lay) return;
        var W = this.L.b, H = this.L.h;
        var bw = NK.klamp(W * 0.16, 100, 180);
        var bh = bw * 240 / 200;
        var lay = {
            W: W, H: H,
            bx: 20, bw: bw, bh: bh,
            by: Math.max(30, H * 0.46 - bh / 2),
            gx0: 20 + bw + 86,
            gx1: W - 34,
            gy0: 40,
            gy1: H - 58
        };
        lay.sx = (lay.gx1 - lay.gx0) / B.T_MAKS;       /* px pr. sekund */
        lay.sy = (lay.gy1 - lay.gy0) / B.Y_MAKS;       /* px pr. M */
        this.lay = lay;
    };

    P.X = function (t) { return this.lay.gx0 + t * this.lay.sx; };
    P.Y = function (c) { return this.lay.gy1 - NK.klamp(c, 0, B.Y_MAKS) * this.lay.sy; };
    P.tidAf = function (x) { return NK.klamp((x - this.lay.gx0) / this.lay.sx, 0, B.T_MAKS); };

    /* Det tidspunkt, glasset viser */
    P.aktivTid = function () {
        if (this.vaerktoej === "sekant") return this.t2;
        if (this.vaerktoej === "tangent") return this.tT;
        return this.t;
    };

    /* Linealens endepunkter i pixels */
    P.linealEnder = function () {
        var lay = this.lay;
        var px = this.X(this.tT), py = this.Y(B.konc(this.stof, this.tT));
        var m = -this.lineal * lay.sy / lay.sx;            /* pixelhaeldning */
        var n = Math.sqrt(1 + m * m), ux = 1 / n, uy = m / n;
        var halv = NK.klamp((lay.gx1 - lay.gx0) * 0.3, 90, 190);
        /* Hver ende saa langt ud, som grafen tillader, men aldrig saa
           kort, at den ikke kan gribes */
        function laengde(retning) {
            var l = halv, dx = ux * retning, dy = uy * retning;
            var x0 = lay.gx0 + 12, x1 = lay.gx1 - 12, y0 = lay.gy0 + 6, y1 = lay.gy1 - 6;
            if (dx < 0) l = Math.min(l, (px - x0) / -dx); else if (dx > 0) l = Math.min(l, (x1 - px) / dx);
            if (dy < 0) l = Math.min(l, (py - y0) / -dy); else if (dy > 0) l = Math.min(l, (y1 - py) / dy);
            return Math.max(l, 40);
        }
        var la = laengde(-1), lb = laengde(1);
        return {
            p: { x: px, y: py },
            a: { x: px - ux * la, y: py - uy * la },
            b: { x: px + ux * lb, y: py + uy * lb }
        };
    };

    /* ----- Opdatering ---------------------------------------------------- */
    P.opdater = function (dt) {
        this.tid += dt;
        if (this.spiller) {
            this.t = Math.min(B.T_MAKS, this.t + dt * FART);
            this.vist = Math.max(this.vist, this.t);
            if (this.t >= B.T_MAKS) this.spiller = false;
            this.visPanel();
        }
    };

    P.afspil = function () {
        if (this.laas) return;
        if (this.spiller) { this.spiller = false; this.visPanel(); return; }
        if (this.t >= B.T_MAKS) { this.t = 0; this.vist = 0; }
        if (this.vaerktoej !== "aflaes") this.saetVaerktoej("aflaes");
        this.spiller = true;
        this.visPanel();
    };

    P.forfra = function () {
        if (this.laas) return;
        this.spiller = false;
        this.t = 0;
        this.vist = 0;
        if (this.vaerktoej !== "aflaes") this.saetVaerktoej("aflaes");
        this.visPanel();
    };

    P.nulstil = P.forfra;

    P.saetVaerktoej = function (v) {
        this.vaerktoej = v;
        if (v !== "aflaes") {
            this.spiller = false;
            this.vist = B.T_MAKS;       /* sekant og tangent skal bruge hele kurven */
        }
        this.visPanel();
    };

    /* ----- Opgaverne ------------------------------------------------------ */
    P.opsaetOpgave = function (o) {
        var s = o.opsaet;
        this.spiller = false;
        this.vaerktoej = s.vaerktoej;
        this.stof = s.stof || "br2";
        if (s.t !== undefined) this.t = s.t;
        if (s.t1 !== undefined) { this.t1 = s.t1; this.t2 = s.t2; }
        if (s.tT !== undefined) this.tT = s.tT;
        if (s.lineal === "tangent") this.lineal = B.haeldning(this.stof, this.tT);
        else if (s.lineal !== undefined) this.lineal = s.lineal;
        if (s.helKurve || s.vaerktoej !== "aflaes") this.vist = B.T_MAKS;
        this.laas = !!s.laas;
        this.skjul = !!s.skjul;
        this.visPanel();
    };

    P.slutOpgave = function () {
        this.laas = false;
        this.skjul = false;
        this.visPanel();
    };

    P.visSvar = function (o) {
        if (o.tangent) {
            this.lineal = B.haeldning(this.stof, this.tT);
            this.skjul = false;
            this.visPanel();
        }
    };

    /* Linealen er sluppet under tangentopgaven: er den en tangent? */
    P.tjekLineal = function () {
        var o = this.kort.opgave;
        if (!o || !o.tangent || o.loest || o.vist) return;
        var sand = B.haeldning(this.stof, this.tT);
        var fejl = (this.lineal - sand) / sand;
        if (Math.abs(fejl) <= TOLERANCE) {
            this.skjul = false;
            this.kort.klaret("Rigtigt. " + o.rigtigTekst);
            this.visPanel();
        } else if (fejl > 0) {
            this.kort.saet("besked", "For stejl. Linealen skærer kurven lige efter punktet.", "besked skidt");
        } else {
            this.kort.saet("besked", "For flad. Linealen skærer kurven lige før punktet.", "besked skidt");
        }
    };

    /* ----- Mus og finger -------------------------------------------------- */
    P.bind = function () {
        var mig = this, cv = this.L.canvas;
        cv.addEventListener("pointerdown", function (e) {
            var p = mig.L.punkt(e);
            if (NK.laererFanger && NK.laererFanger(p)) return;
            var hit = mig.ramt(p);
            if (!hit) return;
            e.preventDefault();
            mig.traek = hit;
            try { cv.setPointerCapture(e.pointerId); } catch (fejl) { /* fx et kunstigt tryk */ }
            mig.flyt(p);
        });
        cv.addEventListener("pointermove", function (e) {
            var p = mig.L.punkt(e);
            if (mig.traek) { mig.flyt(p); return; }
            var hit = mig.ramt(p);
            mig.over = hit;
            var laerer = NK.laererUnder && NK.laererUnder(p);
            cv.style.cursor = laerer ? "pointer" : (hit ? (hit.indexOf("lineal") === 0 ? "grab" : "ew-resize") : "default");
        });
        function slip() {
            if (!mig.traek) return;
            var var_lineal = mig.traek.indexOf("lineal") === 0;
            mig.traek = null;
            if (var_lineal) mig.tjekLineal();
        }
        cv.addEventListener("pointerup", slip);
        cv.addEventListener("pointercancel", slip);

        NK.el("kurve-afspil").addEventListener("click", function () { mig.afspil(); });
        NK.el("kurve-forfra").addEventListener("click", function () { mig.forfra(); });
        NK.el("kurve-tangentknap").addEventListener("click", function () {
            mig.lineal = B.haeldning(mig.stof, mig.tT);
            mig.visPanel();
        });
        Array.prototype.forEach.call(document.querySelectorAll("#kurve-vaerktoej [data-vaerktoej]"), function (k) {
            k.addEventListener("click", function () { if (!mig.laas) mig.saetVaerktoej(k.getAttribute("data-vaerktoej")); });
        });
        Array.prototype.forEach.call(document.querySelectorAll("#kurve-vaerktoej [data-stof]"), function (k) {
            k.addEventListener("click", function () {
                if (mig.laas) return;
                var gammel = mig.stof;
                mig.stof = k.getAttribute("data-stof");
                /* Linealen foelger med over paa den anden kurve */
                if (gammel !== mig.stof) mig.lineal = -mig.lineal / (gammel === "br2" ? 3 : 1 / 3);
                mig.visPanel();
            });
        });
    };

    /* Hvad rammer musen? null, "t", "t1", "t2", "tT", "lineala", "linealb" */
    P.ramt = function (p) {
        var lay = this.lay;
        if (!lay) return null;
        var iGraf = p.x > lay.gx0 - 14 && p.x < lay.gx1 + 14 && p.y > lay.gy0 - 20 && p.y < lay.gy1 + 14;
        function naer(q, r) { return Math.hypot(p.x - q.x, p.y - q.y) <= (r || 16); }
        if (this.vaerktoej === "tangent") {
            var e = this.linealEnder();
            if (naer(e.a)) return "lineala";
            if (naer(e.b)) return "linealb";
            if (this.laas) return null;
            if (naer(e.p) || iGraf) return "tT";
            return null;
        }
        if (!iGraf) return null;
        if (this.vaerktoej === "sekant") {
            if (this.laas) return null;
            return Math.abs(p.x - this.X(this.t1)) < Math.abs(p.x - this.X(this.t2)) ? "t1" : "t2";
        }
        return "t";
    };

    P.flyt = function (p) {
        var t = this.tidAf(p.x);
        switch (this.traek) {
        case "t":
            this.t = t;
            this.vist = Math.max(this.vist, t);
            this.spiller = false;
            break;
        case "t1": this.t1 = Math.min(t, this.t2 - 5); break;
        case "t2": this.t2 = Math.max(t, this.t1 + 5); break;
        case "tT": this.tT = t; break;
        case "lineala":
        case "linealb":
            var q = this.linealEnder().p;
            var dx = p.x - q.x, dy = p.y - q.y;
            if (Math.abs(dx) < 6) return;
            var m = dy / dx;
            var maks = 40 * B.Y_MAKS / B.T_MAKS;
            this.lineal = NK.klamp(-m * this.lay.sx / this.lay.sy, -maks, maks);
            break;
        }
        this.visPanel();
    };

    /* ----- Panelet ------------------------------------------------------- */
    function raekke(navn, vaerdi, klasse) {
        return '<div class="raekke' + (klasse ? " " + klasse : "") + '"><span>' + navn + "</span><b>" + vaerdi + "</b></div>";
    }
    function konc(c) { return c < 1e-9 ? "0 M" : NK.sci(c, 3) + " M"; }
    function sek(t) { return Math.round(t) + " s"; }

    P.visPanel = function () {
        var mig = this, X = NAVN[this.stof];
        var knap = NK.el("kurve-afspil");
        var slut = this.t >= B.T_MAKS && !this.spiller;
        NK.saetHTML("kurve-afspil", this.spiller ? "<span>Pause</span><span class=\"tegn\">❚❚</span>"
            : (slut ? "<span>Afspil igen</span><span class=\"tegn\">↻</span>" : "<span>Afspil</span><span class=\"tegn\">▶</span>"));
        knap.disabled = this.laas;
        NK.el("kurve-forfra").disabled = this.laas;

        Array.prototype.forEach.call(document.querySelectorAll("#kurve-vaerktoej [data-vaerktoej]"), function (k) {
            k.classList.toggle("aktiv", k.getAttribute("data-vaerktoej") === mig.vaerktoej);
            k.disabled = mig.laas;
        });
        Array.prototype.forEach.call(document.querySelectorAll("#kurve-vaerktoej [data-stof]"), function (k) {
            k.classList.toggle("aktiv", k.getAttribute("data-stof") === mig.stof);
            k.disabled = mig.laas;
        });
        NK.el("kurve-stofvalg").hidden = this.vaerktoej === "aflaes";

        var h = "";
        if (this.vaerktoej === "aflaes") {
            h += raekke("t", sek(this.t));
            h += raekke("[Br₂]", konc(B.br2(this.t)), "br2");
            h += raekke("[BrO₃⁻]", konc(B.bro3(this.t)), "bro3");
        } else if (this.vaerktoej === "sekant") {
            var c1 = B.konc(this.stof, this.t1), c2 = B.konc(this.stof, this.t2);
            h += raekke("t₁ og t₂", sek(this.t1) + " og " + sek(this.t2));
            h += raekke("[" + X + "] ved t₁", konc(c1), this.stof);
            h += raekke("[" + X + "] ved t₂", konc(c2), this.stof);
            if (!this.skjul) {
                h += raekke("Δt", sek(this.t2 - this.t1));
                h += raekke("Δ[" + X + "]", NK.sci(c2 - c1, 3) + " M");
                h += raekke(this.stof === "br2" ? "v = Δ[Br₂]/Δt" : "v = −Δ[BrO₃⁻]/Δt",
                    NK.sci(B.gennemsnit(this.stof, this.t1, this.t2), 3) + " M/s", "resultat");
            } else {
                h += raekke("v(" + X + ")", "?", "resultat");
            }
        } else {
            h += raekke("t", sek(this.tT));
            h += raekke("[" + X + "]", konc(B.konc(this.stof, this.tT)), this.stof);
            h += raekke("Linealens hældning", NK.sci(this.lineal, 3) + " M/s");
            if (!this.skjul) {
                h += raekke(this.stof === "br2" ? "v(Br₂) = hældningen" : "v(BrO₃⁻) = −hældningen",
                    NK.sci(this.stof === "br2" ? this.lineal : -this.lineal, 3) + " M/s", "resultat");
            }
        }
        NK.saetHTML("kurve-aflaesning", h);
        NK.el("kurve-tangentknap").hidden = this.vaerktoej !== "tangent" || this.skjul || this.laas;
    };

    /* ----- Tegning ------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        this.L.ryd();
        if (!lay) return;
        this.tegnBaeger(ctx);
        this.tegnAkser(ctx);
        var helt = this.vaerktoej !== "aflaes" ? B.T_MAKS : this.vist;
        this.tegnKurve(ctx, "bro3", helt);
        this.tegnKurve(ctx, "br2", helt);
        if (helt <= 0) {
            NK.tekst(ctx, "Tryk Afspil", (lay.gx0 + lay.gx1) / 2, (lay.gy0 + lay.gy1) / 2,
                { font: "600 17px " + SKRIFT, justering: "center", farve: "#9fa6af" });
        }
        if (this.vaerktoej === "aflaes") this.tegnAflaes(ctx, helt);
        else if (this.vaerktoej === "sekant") this.tegnSekant(ctx);
        else this.tegnTangent(ctx);
    };

    P.tegnBaeger = function (ctx) {
        var lay = this.lay, s = lay.bw / 200;
        var x = lay.bx, y = lay.by;
        var t = this.aktivTid();
        var f = NK.klamp(B.br2(t) / B.BR2_SLUT, 0, 1);
        /* Klar opløsning til gul af Br₂ */
        var r = Math.round(NK.lerp(175, 244, f)), g = Math.round(NK.lerp(205, 186, f)), b = Math.round(NK.lerp(235, 40, f));
        var a = NK.lerp(0.14, 0.78, f);
        ctx.save();
        NK.rundtRekt(ctx, x + 21 * s, y + 92 * s, 158 * s, 137 * s, 7 * s);
        ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + a.toFixed(3) + ")";
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.10)";
        ctx.fillRect(x + 21 * s, y + 92 * s, 158 * s, 3);
        ctx.restore();
        NK.Sprites.tegn(ctx, "baegerglas", x, y, lay.bw, lay.bh);
        NK.tekst(ctx, "t = " + Math.round(t) + " s", x + lay.bw / 2, y + lay.bh + 30,
            { font: "700 18px " + SKRIFT, justering: "center", farve: "#f2f3f5" });
        NK.tekst(ctx, "Br₂ farver gult", x + lay.bw / 2, y + lay.bh + 52,
            { font: "13px " + SKRIFT, justering: "center", farve: "#9fa6af" });
    };

    P.tegnAkser = function (ctx) {
        var lay = this.lay;
        ctx.save();
        ctx.font = "13px " + SKRIFT;
        ctx.fillStyle = "#9fa6af";
        ctx.lineWidth = 1;
        /* Gitter og tal */
        ctx.textAlign = "center";
        for (var t = 0; t <= B.T_MAKS; t += 100) {
            var x = this.X(t);
            ctx.strokeStyle = "rgba(255,255,255,0.06)";
            ctx.beginPath(); ctx.moveTo(x, lay.gy0); ctx.lineTo(x, lay.gy1); ctx.stroke();
            ctx.fillText(String(t), x, lay.gy1 + 19);
        }
        ctx.textAlign = "right";
        for (var c = 0; c <= B.Y_MAKS + 1e-9; c += 0.5e-3) {
            var y = this.Y(c);
            ctx.strokeStyle = "rgba(255,255,255,0.06)";
            ctx.beginPath(); ctx.moveTo(lay.gx0, y); ctx.lineTo(lay.gx1, y); ctx.stroke();
            ctx.fillText(NK.tal(c * 1000, 1), lay.gx0 - 8, y + 4);
        }
        /* Akserne */
        ctx.strokeStyle = "#6b7280";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(lay.gx0, lay.gy0 - 8);
        ctx.lineTo(lay.gx0, lay.gy1);
        ctx.lineTo(lay.gx1 + 8, lay.gy1);
        ctx.stroke();
        ctx.fillStyle = "#c8ced6";
        ctx.font = "600 13px " + SKRIFT;
        ctx.textAlign = "center";
        ctx.fillText("t / s", (lay.gx0 + lay.gx1) / 2, lay.gy1 + 42);
        ctx.translate(lay.gx0 - 52, (lay.gy0 + lay.gy1) / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText("Koncentration / 10⁻³ M", 0, 0);
        ctx.restore();
    };

    P.tegnKurve = function (ctx, stof, til) {
        if (til <= 0) return;
        var valgt = this.vaerktoej === "aflaes" || stof === this.stof;
        ctx.save();
        ctx.strokeStyle = FARVE[stof];
        ctx.globalAlpha = valgt ? 1 : 0.4;
        ctx.lineWidth = 3;
        ctx.lineJoin = "round";
        ctx.beginPath();
        var trin = 2;
        for (var t = 0; t <= til; t += trin) {
            var x = this.X(t), y = this.Y(B.konc(stof, t));
            if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.lineTo(this.X(til), this.Y(B.konc(stof, til)));
        ctx.stroke();
        ctx.restore();
        /* Navnet ved kurvens ende */
        var ex = this.X(til), ey = this.Y(B.konc(stof, til));
        var ny = stof === "br2" ? ey - 12 : ey + 22;
        if (ny > this.lay.gy1 - 6) ny = ey - 10;           /* ikke ned over tidsaksen */
        NK.tekst(ctx, NAVN[stof], Math.min(ex + 6, this.lay.gx1 - 40), ny,
            { font: "700 15px " + SKRIFT, farve: FARVE[stof], kant: true, alfa: valgt ? 1 : 0.55 });
    };

    function stiplet(ctx, x1, y1, x2, y2, farve) {
        ctx.save();
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = farve || "rgba(255,255,255,0.4)";
        ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.restore();
    }

    P.tegnAflaes = function (ctx, helt) {
        var lay = this.lay, t = this.t, x = this.X(t);
        if (helt <= 0 && t <= 0) return;
        stiplet(ctx, x, lay.gy0 - 4, x, lay.gy1);
        var aktiv = this.traek === "t" || this.over === "t";
        NK.greb(ctx, x, this.Y(B.bro3(t)), FARVE.bro3, false);
        NK.greb(ctx, x, this.Y(B.br2(t)), FARVE.br2, aktiv);
        NK.tekst(ctx, "t = " + Math.round(t) + " s", NK.klamp(x, lay.gx0 + 30, lay.gx1 - 30), lay.gy0 - 12,
            { font: "700 13px " + SKRIFT, justering: "center", farve: "#f2f3f5", kant: true });
    };

    P.tegnSekant = function (ctx) {
        var stof = this.stof, farve = FARVE[stof];
        var x1 = this.X(this.t1), y1 = this.Y(B.konc(stof, this.t1));
        var x2 = this.X(this.t2), y2 = this.Y(B.konc(stof, this.t2));
        /* Trekanten: Δt vandret, Δ[stof] lodret */
        stiplet(ctx, x1, y1, x2, y1);
        stiplet(ctx, x2, y1, x2, y2);
        NK.tekst(ctx, "Δt", (x1 + x2) / 2, y1 + (y2 < y1 ? 18 : -8),
            { font: "600 14px " + SKRIFT, justering: "center", farve: "#e9eef4", kant: true });
        NK.tekst(ctx, "Δ[" + NAVN[stof] + "]", x2 + 8, (y1 + y2) / 2 + 5,
            { font: "600 14px " + SKRIFT, farve: "#e9eef4", kant: true });
        /* Sekanten, lidt forlaenget til begge sider */
        var dx = x2 - x1, dy = y2 - y1, n = Math.hypot(dx, dy) || 1, ud = 26;
        ctx.save();
        ctx.strokeStyle = SEKANT;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(x1 - dx / n * ud, y1 - dy / n * ud);
        ctx.lineTo(x2 + dx / n * ud, y2 + dy / n * ud);
        ctx.stroke();
        ctx.restore();
        NK.greb(ctx, x1, y1, farve, !this.laas && (this.traek === "t1" || this.over === "t1"));
        NK.greb(ctx, x2, y2, farve, !this.laas && (this.traek === "t2" || this.over === "t2"));
        NK.tekst(ctx, "t₁", x1 - 6, y1 - 14, { font: "700 14px " + SKRIFT, justering: "right", farve: "#f2f3f5", kant: true });
        NK.tekst(ctx, "t₂", x2 - 6, y2 - 14, { font: "700 14px " + SKRIFT, justering: "right", farve: "#f2f3f5", kant: true });
    };

    P.tegnTangent = function (ctx) {
        var lay = this.lay, e = this.linealEnder();
        var dx = e.b.x - e.a.x, dy = e.b.y - e.a.y, n = Math.hypot(dx, dy) || 1;
        var nx = -dy / n, ny = dx / n, bred = 9;
        ctx.save();
        ctx.beginPath();
        ctx.rect(lay.gx0 - 30, lay.gy0 - 30, lay.gx1 - lay.gx0 + 60, lay.gy1 - lay.gy0 + 60);
        ctx.clip();
        /* Linealen: en gennemsigtig liste med streger */
        ctx.beginPath();
        ctx.moveTo(e.a.x + nx * bred, e.a.y + ny * bred);
        ctx.lineTo(e.b.x + nx * bred, e.b.y + ny * bred);
        ctx.lineTo(e.b.x - nx * bred, e.b.y - ny * bred);
        ctx.lineTo(e.a.x - nx * bred, e.a.y - ny * bred);
        ctx.closePath();
        ctx.fillStyle = "rgba(233, 238, 244, 0.10)";
        ctx.fill();
        ctx.strokeStyle = "rgba(233, 238, 244, 0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.strokeStyle = "rgba(233, 238, 244, 0.45)";
        for (var i = 1; i < 16; i++) {
            var f = i / 16, sx = e.a.x + dx * f, sy = e.a.y + dy * f, l = i % 4 === 0 ? 7 : 4;
            ctx.beginPath(); ctx.moveTo(sx + nx * bred, sy + ny * bred); ctx.lineTo(sx + nx * (bred - l), sy + ny * (bred - l)); ctx.stroke();
        }
        ctx.strokeStyle = LINEAL;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(e.a.x, e.a.y); ctx.lineTo(e.b.x, e.b.y); ctx.stroke();
        ctx.restore();
        NK.greb(ctx, e.a.x, e.a.y, LINEAL, this.traek === "lineala" || this.over === "lineala");
        NK.greb(ctx, e.b.x, e.b.y, LINEAL, this.traek === "linealb" || this.over === "linealb");
        NK.greb(ctx, e.p.x, e.p.y, FARVE[this.stof], !this.laas && (this.traek === "tT" || this.over === "tT"));
        NK.tekst(ctx, "t = " + Math.round(this.tT) + " s", e.p.x + 12, e.p.y + (this.stof === "br2" ? 24 : -14),
            { font: "700 13px " + SKRIFT, farve: "#f2f3f5", kant: true });
    };

    NK.SimKurve = SimKurve;
}());
