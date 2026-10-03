/* =====================================================================
   sim_lys.js - fane 1: Lyset

   Lampen sender lys med én bølgelængde gennem kuvetten til detektoren.
   Fotonerne er prikker; hver foton, der naar vaesken, bliver absorberet
   med sandsynligheden 1 − T, og dybden traekkes efter I(x), saa de
   fleste absorberes tidligt (js/lb.js). Kurven over straalen viser,
   hvor meget lys der er tilbage gennem kuvetten, og tavlen under viser
   A = ε · l · c med tallene sat ind.

   Fanen har seks forudsigelser: eleven gaetter foerst, saa stilles
   kuvetten tilbage til start, og eleven proever det selv med skyderne
   eller ved at traekke i kuvettens hoejre side. Modellen er facit.

   Faser: "gaet" > "proev" > "slut".
   Paaskeaegget: klik paa detektoren, naar en forudsigelse er slut.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var LB = NK.LB;
    var Tg = NK.Tegn;

    var BRILLER_A = 0.30;

    function SimLys() {
        var mig = this;
        this.laerred = new NK.Laerred(NK.el("lys-laerred"));
        this.cSkyder = NK.el("lys-c");
        this.lSkyder = NK.el("lys-l");
        this.stof = D.STOFFER.mno4;
        this.c = 0.20;
        this.l = 1.00;
        this.fotoner = [];
        this.pust = [];
        this.spawnRest = 0;
        this.langsom = false;
        this.briller = false;
        this.auto = null;
        this.traek = null;
        this.pool = [];
        for (var i = 0; i < 400; i++) this.pool.push({ u: Math.random(), v: Math.random() });

        this.startFane(D.FORUD, [{ id: "alle", titel: "" }]);

        this.cSkyder.addEventListener("input", function () { mig.saetC(parseFloat(mig.cSkyder.value), true); });
        this.cSkyder.addEventListener("change", function () { mig.sluppet(); });
        this.lSkyder.addEventListener("input", function () { mig.saetL(parseFloat(mig.lSkyder.value), true); });
        this.lSkyder.addEventListener("change", function () { mig.sluppet(); });

        var stofKnapper = document.querySelectorAll("#lys-stoffer .stof-knap");
        Array.prototype.forEach.call(stofKnapper, function (k) {
            k.addEventListener("click", function () { mig.vaelgStof(k.getAttribute("data-stof"), true); });
        });
        NK.el("lys-langsom").addEventListener("click", function () {
            mig.langsom = !mig.langsom;
            NK.el("lys-langsom").classList.toggle("til", mig.langsom);
            NK.el("lys-langsom").textContent = mig.langsom ? "Normal fart" : "Langsomt lys";
            mig.fotoner.forEach(function (p) { p.v = mig.fart(); });
        });

        var cv = this.laerred.canvas;
        cv.addEventListener("pointerdown", function (e) { mig.ned(e); });
        cv.addEventListener("pointermove", function (e) { mig.flyt(e); });
        cv.addEventListener("pointerup", function (e) { mig.op(e); });
        cv.addEventListener("pointercancel", function () { mig.traek = null; });

        var foerste = this.status.map(function (s) { return s.loest; }).indexOf(false);
        this.vaelg(foerste >= 0 ? foerste : 0);
    }

    var P = SimLys.prototype;
    NK.Fane.paa(P, { navn: "lys", naesteFane: "fane-kurve", naesteNavn: "Standardkurven", naesteTekst: "Næste forudsigelse →" });

    /* ----- Modellen ----------------------------------------------------------------- */
    P.A = function () { return LB.A(this.stof.eps, this.l, this.c); };
    P.T = function () { return LB.T(this.A()); };
    P.Avis = function () { return this.A() + (this.briller ? BRILLER_A : 0); };
    P.forud = function () { return this.opgaver[this.nr]; };
    P.fart = function () { return this.langsom ? NK.r(80, 100) : NK.r(260, 320); };

    P.cTekst = function (c) { return NK.dk(c === undefined ? this.c : c, this.stof.cDec) + " mM"; };
    P.lTekst = function (l) { return NK.dk(l === undefined ? this.l : l, 2) + " cm"; };

    /* ----- Skyderne og stoffet ---------------------------------------------------------- */
    P.saetC = function (v, afEleven) {
        var s = this.stof;
        this.c = NK.klamp(Math.round(v / s.cTrin) * s.cTrin, 0, s.cMax);
        if (Math.abs(parseFloat(this.cSkyder.value) - this.c) > 1e-9) this.cSkyder.value = this.c;
        if (afEleven) this.skruet();
        this.visTal();
    };

    P.saetL = function (v, afEleven) {
        this.l = NK.klamp(Math.round(v / D.L_TRIN) * D.L_TRIN, D.L_MIN, D.L_MAX);
        if (Math.abs(parseFloat(this.lSkyder.value) - this.l) > 1e-9) this.lSkyder.value = this.l;
        if (afEleven) this.skruet();
        this.visTal();
    };

    P.vaelgStof = function (id, afEleven) {
        var s = D.STOFFER[id];
        if (!s) return;
        var f = this.forud();
        if (afEleven && this.fase === "proev" && id !== f.start.stof) {
            this.kortBesked("Forudsigelsen handler om " + D.STOFFER[f.start.stof].navn + ". Vælg det stof igen for at prøve den.", 5);
        }
        this.stof = s;
        this.cSkyder.max = s.cMax;
        this.cSkyder.step = s.cTrin;
        this.saetC(Math.min(this.c, s.cMax), false);
        var knapper = document.querySelectorAll("#lys-stoffer .stof-knap");
        Array.prototype.forEach.call(knapper, function (k) { k.classList.toggle("valgt", k.getAttribute("data-stof") === id); });
        NK.saetTekst("lys-lambda", "λ = " + s.lambda + " nm");
        this.fotoner = [];
        if (afEleven) this.skruet();
        this.visTal();
    };

    P.visTal = function () {
        NK.saetTekst("lys-c-tal", this.cTekst());
        NK.saetTekst("lys-l-tal", this.lTekst());
    };

    /* Eleven har skruet paa noget */
    P.skruet = function () {
        if (this.auto) return;
        if (this.fase === "gaet" && !this.sagtSkru) {
            this.sagtSkru = true;
            this.kortBesked("Du kan skrue frit. Når du vælger et svar, stilles kuvetten tilbage til start.", 5);
        }
    };

    /* Skyderen er sluppet, eller kuvetten er trukket: er maalet naaet? */
    P.sluppet = function () {
        if (this.fase !== "proev" || this.faerdig || this.auto) return;
        if (this.naaet()) this.dom(false);
    };

    P.naaet = function () {
        var f = this.forud(), m = f.maal, e = 1e-9;
        if (this.stof.id !== f.start.stof) return false;
        if (m.c && (this.c < m.c[0] - e || this.c > m.c[1] + e)) return false;
        if (m.l && (this.l < m.l[0] - e || this.l > m.l[1] + e)) return false;
        if (m.A) {
            var A = this.A();
            if (A < m.A[0] || A > m.A[1]) return false;
        }
        return true;
    };

    /* ----- Forudsigelsen ------------------------------------------------------------------- */
    P.lavOpgave = function (i) {
        var f = this.opgaver[i];
        this.fase = "gaet";
        this.valgt = null;
        this.auto = null;
        this.sagtSkru = false;
        this.briller = false;
        this.tilStart();
        NK.saetTekst("lys-spm", f.spm);
        this.bygValg();
    };

    P.tilStart = function () {
        var s = this.forud().start;
        this.vaelgStof(s.stof, false);
        this.saetL(s.l, false);
        this.saetC(s.c, false);
        this.fotoner = [];
        this.pust = [];
    };

    P.bygValg = function () {
        var mig = this, f = this.forud(), raekke = NK.el("lys-valg");
        raekke.innerHTML = "";
        f.valg.forEach(function (v, j) {
            var k = document.createElement("button");
            k.type = "button";
            k.className = "valg-kort";
            k.innerHTML = '<span class="vk-t">' + NK.html(v.t) + '</span><span class="vk-n">' + NK.html(v.n) + "</span>";
            k.addEventListener("click", function () { mig.vaelgSvar(j); });
            raekke.appendChild(k);
        });
        this.visValg();
    };

    P.visValg = function () {
        var f = this.forud(), mig = this;
        var kort = NK.el("lys-valg").querySelectorAll(".valg-kort");
        Array.prototype.forEach.call(kort, function (k, j) {
            var slut = mig.fase === "slut";
            k.classList.toggle("valgt", j === mig.valgt);
            k.classList.toggle("rigtig", slut && !!f.valg[j].ok);
            k.classList.toggle("forkert", slut && j === mig.valgt && !f.valg[j].ok);
            k.classList.toggle("laast", mig.fase !== "gaet");
            k.setAttribute("aria-pressed", j === mig.valgt ? "true" : "false");
        });
    };

    P.vaelgSvar = function (j) {
        if (this.fase !== "gaet") {
            if (this.fase === "proev") this.kortBesked("Dit gæt står. Prøv det nu i scenen.", 4);
            return;
        }
        this.valgt = j;
        this.fase = "proev";
        this.tilStart();
        this.hjaelp = 0;
        this.hintLys = null;
        this.visValg();
        this.visKort();
        this.visHintLys();
        this.naesteLinje('<span class="b-maerke">Dit gæt: ' + NK.html(this.forud().valg[j].t) + "</span>", "");
    };

    /* Det, detektoren viser, som en saetning */
    P.resultatTekst = function () {
        var f = this.forud(), A = this.A();
        if (f.id === "vand") return "Detektoren viser T = 100 % og A = 0,000.";
        if (f.facit.T !== undefined) return "Detektoren viser T = " + NK.procent(LB.T(A)) + " og A = " + NK.dk(A, 3) + ".";
        return "Detektoren viser A = " + NK.dk(A, 3) + ".";
    };

    P.dom = function (vist) {
        var f = this.forud(), v = f.valg[this.valgt];
        this.fase = "slut";
        var tekst = (v.ok || vist ? "" : "Du gættede " + v.t + ". ") + this.resultatTekst() + " " + f.forklaring;
        this.loest(vist ? "svar" : (v.ok ? "ok" : "gaet"), NK.html(tekst), vist ? "Svaret" : (v.ok ? "Rigtigt ✓" : "Prøvet"));
        this.visValg();
    };

    P.promptHTML = function () {
        var f = this.forud();
        if (this.fase === "gaet") {
            return '<p class="note-tekst">Gæt først: klik på et af de tre svar over scenen. Så prøver du det selv med skyderne.</p>';
        }
        var v = f.valg[this.valgt];
        var html = '<p class="note-tekst">Dit gæt: <b>' + NK.html(v.t) + "</b> (" + NK.html(v.n) + ")" +
            (this.fase === "slut" ? (v.ok ? " ✓" : "") : "") + "</p>";
        if (this.fase === "proev") return html + '<p class="note-tekst">' + NK.html(f.handling) + "</p>";
        return html + '<div class="forklaring"><p>' + NK.html(f.forklaring) + "</p></div>";
    };

    P.trinLinje = function () {
        if (this.fase === "gaet") return "Gæt først: klik på det svar over scenen, du tror på.";
        if (this.fase === "proev") return NK.html(this.forud().handling);
        return "";
    };

    /* ----- Hint og svar ------------------------------------------------------------------- */
    P.hintTrin = function () {
        var f = this.forud();
        if (this.fase === "gaet") return { trin: f.hint.map(NK.html), lys: "valg" };
        if (this.fase !== "proev") return null;
        var m = f.maal, trin, lys;
        if (this.stof.id !== f.start.stof) {
            return { trin: ["Forudsigelsen handler om " + D.STOFFER[f.start.stof].navn + ". Vælg det i panelet til højre."], lys: "stof" };
        }
        if (m.A) {
            trin = ["Se på A i displayet under detektoren, mens du skruer.",
                "Skyderen c står i panelet til højre. A vokser, når c vokser.",
                "Ved l = " + this.lTekst() + " giver c = " + this.cTekst(this.maalC()) + " en absorbans tæt på 1,00."];
            lys = "c";
        } else if (m.c && m.l) {
            trin = [NK.html(f.handling),
                "Skyderen c og skyderen l står i panelet til højre. Du kan også trække i kuvettens højre side.",
                "c skal være " + this.cTekst(this.maalC()) + ", og l skal være " + this.lTekst(this.maalL()) + "."];
            lys = "begge";
        } else if (m.l) {
            trin = [NK.html(f.handling),
                "Træk i grebet på kuvettens højre side, eller brug skyderen l i panelet til højre.",
                "l skal være " + this.lTekst(this.maalL()) + "."];
            lys = "l";
        } else {
            trin = [NK.html(f.handling),
                "Skyderen c står i panelet til højre.",
                "c skal være " + this.cTekst(this.maalC()) + "."];
            lys = "c";
        }
        return { trin: trin, lys: lys };
    };

    P.maalC = function () {
        var f = this.forud(), m = f.maal;
        if (m.c) return (m.c[0] + m.c[1]) / 2;
        if (m.A) {
            var c = 1 / (this.stof.eps * this.l);
            c = Math.round(c / this.stof.cTrin) * this.stof.cTrin;
            return NK.klamp(c, 0, this.stof.cMax);
        }
        return this.c;
    };

    P.maalL = function () {
        var m = this.forud().maal;
        return m.l ? (m.l[0] + m.l[1]) / 2 : this.l;
    };

    P.visHintLys = function () {
        var lys = this.faerdig ? null : this.hintLys;
        NK.el("lys-c-boks").classList.toggle("lys", lys === "c" || lys === "begge");
        NK.el("lys-l-boks").classList.toggle("lys", lys === "l" || lys === "begge");
        NK.el("lys-stoffer").classList.toggle("lys", lys === "stof");
        NK.el("lys-valg").classList.toggle("lys", lys === "valg");
    };

    P.visSvar = function () {
        var f = this.forud();
        if (this.fase === "gaet") {
            var j = 0;
            f.valg.forEach(function (v, k) { if (v.ok) j = k; });
            this.valgt = j;
            this.fase = "proev";
            this.tilStart();
            this.visValg();
            this.visKort();
            this.svarVist = true;
        } else {
            this.svarVist = false;
        }
        if (this.stof.id !== f.start.stof) this.vaelgStof(f.start.stof, false);
        /* Skyderne glider hen til maalet, og saa kommer svaret */
        this.auto = { t: 0, c0: this.c, l0: this.l, c1: this.maalC(), l1: this.maalL() };
        this.besked("Se detektoren …", "gul");
    };

    P.enter = function () { if (this.faerdig) this.knap(); };
    P.nulstil = function () { this.vaelg(this.nr); };

    /* ----- Geometrien paa laerredet ----------------------------------------------------- */
    P.tilpas = function () {
        this.laerred.tilpas();
    };

    P.geo = function () {
        var W = this.laerred.b, H = this.laerred.h, pad = 16;
        var g = { W: W, H: H, pad: pad };
        g.px = NK.klamp(Math.min(W / 52, H / 30), 13, 18);
        /* Fra neden: tavlen, saa kuvetten med maal og stof, og kurven oeverst */
        g.tavleH = NK.klamp(H * 0.19, 78, 125);
        g.tavleY = H - pad - 6 - g.tavleH;
        g.cuvH = NK.klamp(H * 0.30, 90, 190);
        var cbund = g.tavleY - 12 - g.px * 3.9;
        g.kTop = NK.klamp(H * 0.05, 12, 34) + 16;
        if (cbund - g.cuvH - 26 - g.kTop < 90) g.cuvH = Math.max(80, cbund - 26 - 90 - g.kTop);
        g.ct = cbund - g.cuvH;
        g.yc = Math.round(g.ct + g.cuvH * 0.58);
        g.lb = NK.klamp(W * 0.085, 56, 86);
        g.lh = g.lb * 1.3;
        g.detB = NK.klamp(W * 0.13, 96, 132);
        g.detH = NK.klamp(g.cuvH * 0.8, 80, 150);
        g.lx = pad + 4;
        g.ly = g.yc - g.lh / 2;
        g.dx = W - pad - g.detB;
        g.dy = g.yc - g.detH / 2;
        g.x0 = g.lx + g.lb;
        g.x1 = g.dx;
        g.cx = (g.x0 + g.x1) / 2;
        g.pxCm = NK.klamp((g.x1 - g.x0 - 120) / 3.15, 40, 115);
        g.beamH = NK.klamp(g.cuvH * 0.34, 26, 56);
        g.cb = this.l * g.pxCm;
        g.cl = g.cx - g.cb / 2;
        g.cr = g.cx + g.cb / 2;
        g.cbund = g.ct + g.cuvH;
        g.vt = g.ct + g.cuvH * 0.12;          /* vaeskens overflade */
        g.kBund = g.ct - 26;
        g.tavleX = pad + 8;
        g.tavleB = g.dx - 24 - g.tavleX;
        g.dispY = g.dy + g.detH + 12;
        return g;
    };

    /* ----- Musen: traek i kuvettens hoejre side, klik paa udstyret ----------------------- */
    P.hvad = function (p) {
        var g = this.geo();
        if (Math.abs(p.x - g.cr) <= 12 && p.y >= g.ct - 4 && p.y <= g.cbund + 18) return "vaeg";
        if (p.x >= g.dx - 14 && p.x <= g.dx + g.detB && p.y >= g.dy && p.y <= g.dispY + 80) return "detektor";
        if (p.x >= g.cl && p.x <= g.cr && p.y >= g.ct && p.y <= g.cbund) return "kuvette";
        if (p.x >= g.lx && p.x <= g.x0 + 6 && p.y >= g.ly && p.y <= g.ly + g.lh + 24) return "lampe";
        if (p.y >= g.kTop - 18 && p.y <= g.kBund && p.x >= g.x0 && p.x <= g.x1) return "kurve";
        return null;
    };

    P.ned = function (e) {
        var p = this.laerred.punkt(e);
        var h = this.hvad(p);
        this.traek = { hvad: h, x: p.x, y: p.y, flyttet: false };
        if (h === "vaeg") {
            try { this.laerred.canvas.setPointerCapture(e.pointerId); } catch (x) { /* ingen capture */ }
            e.preventDefault();
        }
    };

    P.flyt = function (e) {
        var p = this.laerred.punkt(e);
        var t = this.traek;
        if (t && t.hvad === "vaeg") {
            if (this.auto) return;
            var g = this.geo();
            t.flyttet = true;
            var l = 2 * (p.x - g.cx) / g.pxCm;
            if (Math.abs(l - this.l) >= D.L_TRIN / 2) this.saetL(l, true);
            this.laerred.canvas.style.cursor = "ew-resize";
            return;
        }
        var h = this.hvad(p);
        this.laerred.canvas.style.cursor = h === "vaeg" ? "ew-resize" : (h ? "pointer" : "default");
    };

    P.op = function (e) {
        var t = this.traek;
        this.traek = null;
        if (!t) return;
        if (t.hvad === "vaeg") {
            try { this.laerred.canvas.releasePointerCapture(e.pointerId); } catch (x) { /* ingen capture */ }
            if (t.flyttet) { this.sluppet(); return; }
        }
        this.klik(t.hvad);
    };

    P.klik = function (h) {
        var s = this.stof;
        if (h === "detektor") {
            if (this.fase === "slut") {
                this.briller = !this.briller;
                this.fotoner = [];
                if (this.briller) {
                    this.kortBesked("Detektoren har fået solbriller på. Nu viser den 0,30 for meget ved alle målinger, også ved rent vand. " +
                        "Derfor nulstiller man altid spektrofotometret med en blindprøve. Klik igen for at tage dem af.", 9);
                } else {
                    this.kortBesked("Solbrillerne er taget af. Displayet viser igen kun det, kuvetten absorberer.", 4);
                }
            } else {
                this.kortBesked("Detektoren måler det lys, der slipper gennem kuvetten. T og A står i displayet under den.", 5);
            }
        } else if (h === "kuvette" || h === "vaeg") {
            this.kortBesked("Kuvetten med " + s.navn + ", " + this.cTekst() + ". Lyset går " + this.lTekst() +
                " gennem væsken. Træk i grebet på højre side for at gøre kuvetten bredere.", 6);
        } else if (h === "lampe") {
            this.kortBesked("Lampen sender lys med kun én bølgelængde: " + s.lambda + " nm. Det er det lys, " + s.navn + " absorberer mest.", 6);
        } else if (h === "kurve") {
            this.kortBesked("Kurven viser, hvor meget af lyset der er tilbage på vejen fra lampen til detektoren.", 5);
        }
    };

    /* ----- Fotonerne ---------------------------------------------------------------------- */
    P.opdater = function (dt) {
        this.opdaterBesked(dt);
        var g = this.geo(), mig = this;

        /* Vis svaret: skyderne glider hen til maalet */
        if (this.auto) {
            var a = this.auto;
            a.t += dt / 0.9;
            var u = NK.blod(a.t);
            this.saetL(NK.lerp(a.l0, a.l1, u), false);
            this.saetC(NK.lerp(a.c0, a.c1, u), false);
            if (a.t >= 1) {
                this.saetL(a.l1, false);
                this.saetC(a.c1, false);
                this.auto = null;
                this.dom(!!this.svarVist);
                this.svarVist = false;
            }
        }

        var rate = this.langsom ? 12 : 42;
        this.spawnRest += dt * rate;
        while (this.spawnRest >= 1) {
            this.spawnRest -= 1;
            this.fotoner.push({ x: g.x0 + 2, y: g.yc + (Math.random() - 0.5) * g.beamH * 0.7, v: this.fart(), afgjort: false, ved: null, briller: null });
        }
        var T = this.T();
        var eps = this.stof.eps, c = this.c, l = this.l;
        for (var i = this.fotoner.length - 1; i >= 0; i--) {
            var p = this.fotoner[i];
            p.x += p.v * dt;
            if (!p.afgjort && p.x >= g.cl) {
                p.afgjort = true;
                if (Math.random() > T) p.ved = g.cl + LB.absorbX(eps, c, l, Math.random()) * g.pxCm;
            }
            if (p.ved !== null && p.x >= p.ved) {
                this.pust.push({ x: p.ved, y: p.y, t: 0, rgb: this.stof.lys });
                this.fotoner.splice(i, 1);
                continue;
            }
            if (this.briller && p.briller === null && p.x >= g.x1 - 16) {
                p.briller = Math.random() < 1 - Math.pow(10, -BRILLER_A);
                if (p.briller) {
                    this.pust.push({ x: g.x1 - 16, y: p.y, t: 0, rgb: [60, 60, 60] });
                    this.fotoner.splice(i, 1);
                    continue;
                }
            }
            if (p.x >= g.x1) this.fotoner.splice(i, 1);
        }
        this.pust = this.pust.filter(function (q) { q.t += dt; return q.t < 0.4; });
        mig.tegn();
    };

    /* ----- Tegningen ---------------------------------------------------------------------- */
    P.tegn = function () {
        var L = this.laerred, ctx = L.ctx, g = this.geo();
        if (L.b < 50 || L.h < 50) return;
        L.ryd();
        var s = this.stof, rgb = s.lys;
        var A = this.A(), T = LB.T(A), eps = s.eps, c = this.c, l = this.l;

        this.tegnKurve(ctx, g, T);

        /* Straalen: fuld foer kuvetten, svagere og svagere inde i den, T efter */
        Tg.straale(ctx, g.x0, g.cl, g.yc, g.beamH, rgb, 1);
        Tg.straaleInde(ctx, g.cl, g.cr, g.yc, g.beamH, rgb, function (u) { return LB.lysEfter(eps, c, u * l); });
        Tg.straale(ctx, g.cr, g.x1, g.yc, g.beamH, rgb, T);

        /* Kuvetten og molekylerne i den */
        var farve = Tg.vaeskeFarve(s, c);
        Tg.kuvette(ctx, g.cl, g.ct, g.cb, g.cuvH, { rgb: farve, lys: this.hintLys === "l" || this.hintLys === "begge" ? "rgba(242, 197, 61, 0.9)" : null });
        this.tegnMolekyler(ctx, g);
        /* Straalen igen ovenpaa vaesken, saa den kan ses gennem farven */
        Tg.straaleInde(ctx, g.cl, g.cr, g.yc, g.beamH * 0.6, rgb, function (u) { return 0.5 * LB.lysEfter(eps, c, u * l); });

        /* Fotonerne og pustene, hvor de blev absorberet */
        ctx.save();
        ctx.fillStyle = Tg.rgba([Math.min(255, rgb[0] + 90), Math.min(255, rgb[1] + 20), Math.min(255, rgb[2] + 90)], 1);
        ctx.shadowColor = Tg.rgba(rgb, 1);
        ctx.shadowBlur = 6;
        this.fotoner.forEach(function (p) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.6, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
        ctx.save();
        this.pust.forEach(function (q) {
            var u = q.t / 0.4;
            ctx.strokeStyle = Tg.rgba(q.rgb, 0.8 * (1 - u));
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(q.x, q.y, 2 + 8 * u, 0, Math.PI * 2);
            ctx.stroke();
        });
        ctx.restore();

        /* Grebet paa kuvettens hoejre side */
        this.tegnGreb(ctx, g);

        /* Lampe og detektor */
        Tg.lampe(ctx, g.lx, g.ly, g.lb, g.lh, rgb);
        Tg.detektor(ctx, g.dx, g.dy, g.detB, g.detH, g.beamH + 10);
        if (this.briller) Tg.solbriller(ctx, g.x1 - 16, g.yc, g.beamH * 0.7);

        /* Etiketter */
        var px = g.px;
        NK.tekst(ctx, "λ = " + s.lambda + " nm", g.lx + g.lb / 2, g.ly + g.lh + px * 1.3, { font: Tg.font("700", px), justering: "center", farve: Tg.rgba(rgb, 1) });
        NK.tekst(ctx, "Lampe", g.lx + g.lb / 2, g.ly - 8, { font: Tg.font("600", px * 0.9), justering: "center", farve: "#a9b0ba" });
        NK.tekst(ctx, "Detektor", g.dx + g.detB / 2, g.dy - 8, { font: Tg.font("600", px * 0.9), justering: "center", farve: "#a9b0ba" });
        NK.tekst(ctx, "I₀", (g.x0 + g.cl) / 2, g.yc - g.beamH / 2 - 6, { font: Tg.font("700", px * 1.05), justering: "center", farve: "#e9eef4", kant: true });
        NK.tekst(ctx, "I", (g.cr + g.x1) / 2, g.yc - g.beamH / 2 - 6, { font: Tg.font("700", px * 1.05), justering: "center", farve: "#e9eef4", kant: true });

        /* Kuvettebredden under kuvetten og stoffet under den */
        var my = g.cbund + px * 1.1;
        Tg.maalPil(ctx, g.cl, g.cr, my, "#cfd6de");
        NK.tekst(ctx, "l = " + this.lTekst(), g.cx, my + px * 1.35, { font: Tg.font("700", px), justering: "center", farve: "#e9eef4" });
        NK.tekst(ctx, s.Navn + ", " + s.formel + ": c = " + this.cTekst(), g.cx, my + px * 2.6, { font: Tg.font("600", px * 0.92), justering: "center", farve: "#c8ced6" });

        /* Displayet under detektoren */
        var Av = this.Avis(), Tv = LB.T(Av);
        Tg.display(ctx, g.dx, g.dispY, g.detB, [
            { etiket: "T", tal: Av > 3 ? "< 0,1 %" : NK.procent(Tv) },
            { etiket: "A", tal: Av > 3 ? "> 3" : NK.dk(Av, 3), farve: "#ffe28a" }
        ], NK.klamp(g.detB / 6.4, 14, 19));

        this.tegnTavle(ctx, g);
    };

    P.tegnMolekyler = function (ctx, g) {
        var s = this.stof;
        var n = Math.round(34 * this.c / s.cMax * this.l * (g.cuvH / 150));
        if (n <= 0) return;
        var mork = Tg.vaeskeFarve(s, s.cMax * 1.6);
        ctx.save();
        ctx.fillStyle = Tg.rgba(mork, 0.85);
        var h = g.cbund - g.vt - 8, b = g.cb - 8;
        for (var i = 0; i < n && i < this.pool.length; i++) {
            var q = this.pool[i];
            ctx.beginPath();
            ctx.arc(g.cl + 4 + q.u * b, g.vt + 4 + q.v * h, 2.3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    };

    P.tegnGreb = function (ctx, g) {
        var y = g.ct + g.cuvH * 0.84, h = 26, b = 16;
        ctx.save();
        var lys = this.hintLys === "l" || this.hintLys === "begge";
        ctx.fillStyle = lys ? "rgba(242, 197, 61, 0.95)" : "rgba(61, 158, 224, 0.95)";
        NK.rundtRekt(ctx, g.cr - b / 2, y - h / 2, b, h, 5);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(g.cr - 3, y - 6); ctx.lineTo(g.cr - 3, y + 6);
        ctx.moveTo(g.cr + 3, y - 6); ctx.lineTo(g.cr + 3, y + 6);
        ctx.stroke();
        ctx.restore();
    };

    /* Kurven "Lys tilbage" over straalen: 100 % foer kuvetten, faldende
       inde i den og T efter. Prikker ved hver hele centimeter. */
    P.tegnKurve = function (ctx, g, T) {
        var top = g.kTop, bund = g.kBund;
        if (bund - top < 50) return;
        var s = this.stof, eps = s.eps, c = this.c, l = this.l, px = g.px;
        function y(f) { return bund - f * (bund - top); }
        ctx.save();
        /* Akse og gitter */
        ctx.strokeStyle = "rgba(255, 255, 255, 0.10)";
        ctx.lineWidth = 1;
        [0, 0.5, 1].forEach(function (f) {
            ctx.beginPath();
            ctx.moveTo(g.x0, y(f));
            ctx.lineTo(g.x1, y(f));
            ctx.stroke();
            NK.tekst(ctx, f === 1 ? "100 %" : (f === 0.5 ? "50 %" : "0 %"), g.x0 - 6, y(f) + 4,
                { font: Tg.font("600", px * 0.85), justering: "right", farve: "#8d93a3" });
        });
        NK.tekst(ctx, "Lys tilbage", g.x0, top - 8, { font: Tg.font("700", px * 0.9), farve: "#cfd6de" });
        /* Lodrette hjaelpelinjer fra kuvettens vaegge */
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = "rgba(225, 235, 245, 0.22)";
        [g.cl, g.cr].forEach(function (x) {
            ctx.beginPath();
            ctx.moveTo(x, top);
            ctx.lineTo(x, g.ct);
            ctx.stroke();
        });
        ctx.setLineDash([]);
        /* Selve kurven */
        var farve = Tg.rgba(s.lys, 1);
        ctx.strokeStyle = farve;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(g.x0, y(1));
        ctx.lineTo(g.cl, y(1));
        var n = 40;
        for (var i = 1; i <= n; i++) {
            var u = i / n;
            ctx.lineTo(g.cl + u * g.cb, y(LB.lysEfter(eps, c, u * l)));
        }
        var xb = this.briller ? g.x1 - 16 : g.x1;
        ctx.lineTo(xb, y(T));
        if (this.briller) {
            var Tb = T * Math.pow(10, -BRILLER_A);
            ctx.lineTo(xb + 4, y(Tb));
            ctx.lineTo(g.x1, y(Tb));
        }
        ctx.stroke();
        /* Prikker med procent ved indgangen, hver hele centimeter og udgangen */
        var prikker = [{ x: g.cl, f: 1 }];
        for (var cm = 1; cm < l - 0.25; cm++) prikker.push({ x: g.cl + cm * g.pxCm, f: LB.lysEfter(eps, c, cm), cm: cm });
        prikker.push({ x: g.cr, f: T });
        prikker.forEach(function (q, j) {
            ctx.fillStyle = farve;
            ctx.beginPath();
            ctx.arc(q.x, y(q.f), 4.5, 0, Math.PI * 2);
            ctx.fill();
            var etiket = q.f >= 0.0995 ? Math.round(q.f * 100) + " %" : NK.procent(q.f);
            var ty = y(q.f) - 10;
            if (ty < top + 4) ty = y(q.f) + 20;
            NK.tekst(ctx, j === 0 ? "100 %" : etiket, q.x, ty, { font: Tg.font("700", px * 0.9), justering: "center", farve: "#e9eef4", kant: true });
        });
        ctx.restore();
    };

    /* Tavlen: A = ε · l · c med tallene sat ind */
    P.tegnTavle = function (ctx, g) {
        if (g.tavleH < 54 || g.tavleB < 200) return;
        var s = this.stof, A = this.A();
        var x = g.tavleX, y = g.tavleY, b = g.tavleB, h = g.tavleH;
        Tg.tavle(ctx, x, y, b, h);
        var lilla = "#c9a6ff", gul = "#ffe28a";
        var linje1 = [{ t: "A = ε · l · c" }];
        var linje2 = [
            { t: "= " },
            { t: NK.dk(s.eps, s.eps >= 10 ? 1 : 2) + " mM⁻¹·cm⁻¹", farve: lilla },
            { t: " · " + this.lTekst() + " · " + this.cTekst() + " = " },
            { t: NK.dk(A, 3), farve: gul, vaegt: "800" }
        ];
        var f = NK.klamp(Math.min(h / 3.4, b / 26), 14, 26);
        ctx.save();
        ctx.textBaseline = "alphabetic";
        while (f > 13 && Tg.dele(ctx, [{ t: "A " }].concat(linje2), 0, 0, f, false) > b - f * 2) f -= 0.5;
        var x0 = x + f;
        var y1 = y + f * 1.45, y2 = y1 + f * 1.5;
        Tg.dele(ctx, linje1, x0, y1, f);
        ctx.font = Tg.font("600", f);
        var ind = ctx.measureText("A ").width;
        Tg.dele(ctx, linje2, x0 + ind, y2, f);
        var lille = NK.klamp(f * 0.6, 12.5, 15);
        if (y2 + lille * 1.8 < y + h - 4) {
            NK.tekst(ctx, "ε er en konstant for " + s.navn + " ved " + s.lambda + " nm. Kun l og c kan ændres.", x0, y2 + lille * 1.9,
                { font: Tg.font("600", lille), farve: lilla });
        }
        ctx.restore();
    };

    NK.SimLys = SimLys;
}());
