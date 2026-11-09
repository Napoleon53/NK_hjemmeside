/* =====================================================================
   sim_skift.js - fane 1: Farveskiftet

   Syv reagensglas med kendt pH (0, 2, 4, ..., 12) staar paa pH-aksen,
   hvert glas over sin pH. Hver opgave er én indikator (D.SKIFT):
     gaet     (kun BTB og roedkaalssaft) et gratis gaet foer forsoeget;
              svaret staar som et lille maerke i scenen bagefter
     forsoeg  draabeflasken drypper indikatoren i glassene (knappen paa
              kortet eller et klik paa flasken)
     spm      ét spoergsmaal, der bedoemmes ved Indsend svar (thymolblaat:
              vaelg begge steder)
   Naar svaret er rigtigt, males indikatorens bjaelke paa farvekortet
   under aksen. Farvekortet vokser med én bjaelke pr. indikator og er det
   samme som bogens figur (fane 2 bruger det som vaerktoej).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var F = NK.Fane;
    var T = NK.Tegning;
    var NOEGLE = "nk-sc7.7-skift";
    var FONT = T.FONT;

    var FLYV = 0.45, STEP = 0.42, OPHOLD = 0.16, FALD = 0.22, BLAND = 0.9, SWEEP = 1.1;
    var VD = Math.PI - 0.32;              /* flaskens haeldning, naar den drypper */

    function SimSkift() {
        var mig = this;
        this.opgaver = D.SKIFT;
        this.hentStatus();
        this.startFane();
        this.bygListe();
        NK.el("s-forfra").addEventListener("click", function () { mig.forfra(); });
        NK.el("s-liste").addEventListener("click", function (e) {
            var k = e.target.closest ? e.target.closest("[data-opg]") : null;
            if (k) mig.vaelg(parseInt(k.getAttribute("data-opg"), 10));
        });
        this.el.skort.addEventListener("click", function (e) {
            if (e.target.closest && e.target.closest("[data-udfoer]")) mig.udfoer();
        });
    }

    var P = SimSkift.prototype;
    F.paa(P, "s");

    /* ----- Hukommelsen ------------------------------------------------------------ */
    P.hentStatus = function () {
        var gemt = NK.hent(NOEGLE, {}) || {};
        this.status = this.opgaver.map(function (o) {
            var g = gemt[o.ind] || {};
            return { loest: !!g.l, stjerne: !!g.s };
        });
    };

    P.gem = function () {
        var ud = {}, mig = this;
        this.status.forEach(function (s, i) { ud[mig.opgaver[i].ind] = { l: s.loest ? 1 : 0, s: s.stjerne ? 1 : 0 }; });
        NK.gem(NOEGLE, ud);
    };

    P.antalLoest = function () { return this.status.filter(function (s) { return s.loest; }).length; };

    P.naesteUloeste = function () {
        var n = this.status.length;
        for (var d = 1; d <= n; d++) {
            var i = (this.nr + d + n) % n;
            if (!this.status[i].loest) return i;
        }
        return -1;
    };

    /* ----- Panelet ------------------------------------------------------------------ */
    P.bygListe = function () {
        var html = "";
        this.opgaver.forEach(function (o, i) {
            html += '<button type="button" class="opg-chip" data-opg="' + i + '"><span class="oc-f"><b>' + (i + 1) + "</b> " +
                NK.html(D.ind(o.ind).navn) + '</span><i class="oc-m"></i></button>';
        });
        NK.el("s-liste").innerHTML = html;
    };

    P.visListe = function () {
        var chips = NK.el("s-liste").querySelectorAll("[data-opg]");
        for (var k = 0; k < chips.length; k++) {
            var i = parseInt(chips[k].getAttribute("data-opg"), 10), s = this.status[i];
            chips[k].classList.toggle("valgt", i === this.nr);
            chips[k].classList.toggle("loest", s.loest);
            chips[k].classList.toggle("stjerne", s.stjerne);
            chips[k].querySelector(".oc-m").textContent = s.stjerne ? "★" : (s.loest ? "✓" : "");
        }
        NK.saetTekst("s-loest", String(this.antalLoest()));
    };

    /* ----- En opgave ------------------------------------------------------------------ */
    P.vaelg = function (i) {
        var mig = this;
        this.nr = i;
        this.opg = this.opgaver[i];
        this.ind = this.opg.ind;
        this.fase = this.opg.gaet ? "gaet" : "forsoeg";
        this.valgt = null;
        this.flere = this.opg.spm.rigtig.length > 1;
        this.forkert = {};
        this.fejl = false;
        this.sv = false;
        this.groen = null;
        this.gaetNr = null;
        this.drypT = null;
        this.barT = null;
        this.sejrT = null;
        this.hover = false;
        /* Glassene: forud har indikatoren fra start */
        var forud = this.opg.forud || [];
        this.glas = D.GLAS_PH.map(function (ph) {
            var med = forud.indexOf(ph) >= 0;
            return { ph: ph, farve: med ? K.vaeske(mig.ind, ph) : null, blandet: med ? 1 : 0, forud: med };
        });
        this.drypListe = [];
        this.glas.forEach(function (g, j) { if (!g.forud) mig.drypListe.push(j); });
        this.besked("", "");
        this.nulstilHjaelp();
        this.visKort();
        this.visListe();
        this.layout();
    };

    P.kortData = function () {
        var mig = this, o = this.opg, chip = "Opgave " + (this.nr + 1);
        if (this.fase === "gaet") {
            return {
                slags: "spm", chip: chip + " · Gæt først", tekst: o.gaet.tekst,
                svar: o.gaet.svar.map(function (s, j) { return { t: s, valgt: mig.valgt === j }; })
            };
        }
        if (this.fase === "forsoeg") {
            var navn = D.ind(this.ind).kort;
            return {
                slags: "opgave", chip: chip, tekst: o.forsoeg,
                ekstra: this.drypT === null ? '<div class="sk-handling"><button type="button" class="knap blaa" data-udfoer="1">Dryp ' +
                    NK.html(navn) + "</button></div>" : ""
            };
        }
        return {
            slags: "spm", chip: chip, tekst: o.spm.tekst,
            svar: o.spm.svar.map(function (s, j) { return { t: s, valgt: mig.erValgt(j), forkert: !!mig.forkert[j] }; })
        };
    };

    P.erValgt = function (j) {
        if (this.flere) return !!(this.valgt && this.valgt.indexOf(j) >= 0);
        return this.valgt === j;
    };

    P.skjulIndsend = function () { return this.fase === "forsoeg"; };
    P.skjulHint = function () { return this.fase === "forsoeg" || this.fase === "gaet"; };

    P.svarValg = function (j) {
        if (this.fase === "forsoeg") return;
        if (this.flere && this.fase === "spm") {
            var v = (this.valgt || []).slice(), k = v.indexOf(j);
            if (k >= 0) v.splice(k, 1); else v.push(j);
            v.sort();
            this.valgt = v.length ? v : null;
        } else {
            this.valgt = this.valgt === j ? null : j;
        }
        this.visKort();
    };

    P.kanSendes = function () { return this.fase !== "forsoeg" && this.valgt !== null; };

    P.indsendTekst = function () {
        if (this.valgt === null) return "Indsend svar";
        if (this.fase === "gaet") return "Indsend svar: " + this.opg.gaet.svar[this.valgt];
        if (this.flere) return "Indsend svar: " + (this.valgt.length === 1 ? "1 valgt" : this.valgt.length + " valgt");
        return "Indsend svar: " + this.opg.spm.svar[this.valgt];
    };

    P.ingentingTekst = function () {
        return this.flere ? "Vælg begge steder på kortet først." : "Vælg et af svarene på kortet først.";
    };

    P.indsend = function () {
        if (this.fase === "gaet") {
            /* Et gaet er gratis: det bliver husket, og forsoeget kommer */
            this.gaetNr = this.valgt;
            this.valgt = null;
            this.fase = "forsoeg";
            this.besked("", "");
            this.visKort();
            return;
        }
        this.bedoem(false);
    };

    P.bedoem = function (vist) {
        var s = this.opg.spm, rigtig = s.rigtig, mig = this;
        var valg = this.flere ? (this.valgt || []) : [this.valgt];
        var forkerte = valg.filter(function (j) { return rigtig.indexOf(j) < 0; });
        if (forkerte.length || valg.length !== rigtig.length) {
            this.fejl = true;
            var tekst;
            if (forkerte.length) {
                tekst = s.fejl[forkerte[0]];
                forkerte.forEach(function (j) { mig.forkert[j] = true; });
                if (this.flere) {
                    this.valgt = valg.filter(function (j) { return rigtig.indexOf(j) >= 0; });
                    if (!this.valgt.length) this.valgt = null;
                } else this.valgt = null;
            } else tekst = s.halv;
            this.visKort();
            this.fejlLinje(tekst);
            return;
        }
        var st = this.status[this.nr], foerste = !st.loest;
        st.loest = true;
        st.stjerne = st.stjerne || (!this.fejl && !this.sv && !vist);
        this.gem();
        this.barT = 0;
        this.sejrT = 0;
        var alle = this.antalLoest() === this.opgaver.length;
        var tekst2 = s.forkl + (alle && foerste ? " " + D.SKIFT_FAERDIG : "");
        var naeste = this.naesteUloeste();
        this.groen = {
            spm: true, svarNr: this.flere ? undefined : this.valgt, maade: vist || this.sv ? "svar" : "selv", tekst: tekst2,
            knap: naeste >= 0 ? "Næste indikator →" : "Videre til Den ukendte prøve →"
        };
        this.besked("", "");
        this.visKort();
        this.visListe();
        if (alle && foerste) NK.konfettiRegn(NK.el("fane-s").querySelector(".scene"), 140);
        else NK.konfetti(this.el.skort, 36);
    };

    /* Kortets knap gaar altid fremad. Begynd forfra staar i panelet */
    P.videre = function () {
        var naeste = this.naesteUloeste();
        if (naeste >= 0) { this.vaelg(naeste); return; }
        if (NK.visFane) NK.visFane("fane-p");
    };

    P.forfra = function () {
        this.status = this.opgaver.map(function () { return { loest: false, stjerne: false }; });
        this.gem();
        this.vaelg(0);
    };

    P.nulstil = function () {
        if (this.groen) return;
        this.vaelg(this.nr);
    };

    /* ----- Hjaelpen ------------------------------------------------------------------- */
    P.hintNu = function () {
        if (this.groen || this.fase !== "spm") return [];
        return this.opg.spm.hint;
    };

    P.visSvar = function () {
        this.sv = true;
        var r = this.opg.spm.rigtig;
        this.valgt = this.flere ? r.slice() : r[0];
        this.bedoem(true);
    };

    /* ----- Forsoeget ------------------------------------------------------------------- */
    P.udfoer = function () {
        if (this.fase !== "forsoeg" || this.drypT !== null) return;
        this.drypT = 0;
        this.visKort();
    };

    P.ankomst = function (j) { return FLYV + j * STEP; };

    P.drypSlut = function () {
        var n = this.drypListe.length;
        return Math.max(this.ankomst(n - 1) + FALD + BLAND, this.ankomst(n - 1) + OPHOLD + FLYV) + 0.1;
    };

    P.opdaterScene = function (dt) {
        var mig = this;
        if (this.barT !== null && this.barT < SWEEP + 0.1) this.barT += dt;
        if (this.drypT === null || this.fase !== "forsoeg") return;
        this.drypT += dt;
        this.drypListe.forEach(function (gi, j) {
            var g = mig.glas[gi], t0 = mig.ankomst(j) + FALD;
            if (mig.drypT >= t0) {
                if (!g.farve) g.farve = K.vaeske(mig.ind, g.ph);
                g.blandet = NK.klamp((mig.drypT - t0) / BLAND, 0, 1);
            }
        });
        if (this.drypT >= this.drypSlut()) {
            this.fase = "spm";
            this.valgt = null;
            this.nulstilHjaelp();
            this.visKort();
        }
    };

    /* Flaskens spids og haeldning paa tidspunktet t i forsoeget */
    P.flaskePos = function (t) {
        var k = this.k, n = this.drypListe.length, mig = this;
        var hjem = { x: k.hjem.x, y: k.hjem.y, v: 0 };
        function over(j) {
            var g = mig.glas[mig.drypListe[j]];
            return { x: mig.akse.P(g.ph), y: k.glasTop - 3, v: VD };
        }
        function mel(a, b, u, bue) {
            return { x: NK.lerp(a.x, b.x, u), y: NK.lerp(a.y, b.y, u) - (bue || 0) * Math.sin(Math.PI * u), v: NK.lerp(a.v, b.v, u) };
        }
        if (t === null || t <= 0) return hjem;
        if (t < FLYV) return mel(hjem, over(0), NK.blod(t / FLYV), 18);
        for (var j = 0; j < n; j++) {
            var a = this.ankomst(j);
            if (t < a + OPHOLD) return over(j);
            if (j < n - 1 && t < this.ankomst(j + 1)) return mel(over(j), over(j + 1), NK.blod((t - a - OPHOLD) / (STEP - OPHOLD)), 10);
        }
        var sidst = this.ankomst(n - 1) + OPHOLD;
        if (t < sidst + FLYV) return mel(over(n - 1), hjem, NK.blod((t - sidst) / FLYV), 18);
        return hjem;
    };

    /* ----- Musen: kun flasken kan bruges, og kun mens kortet viser forsoeget ----------- */
    P.paaFlaske = function (pt) {
        if (!pt || !this.k) return false;
        var h = this.k.fh, s = h / 100;
        var x = this.k.hjem.x, y = this.k.hjem.y;
        return pt.x > x - 30 * s && pt.x < x + 30 * s && pt.y > y - 4 && pt.y < y + 100 * s;
    };

    P.overScene = function (pt) {
        this.hover = this.fase === "forsoeg" && this.drypT === null && this.paaFlaske(pt);
        return this.hover ? "pointer" : null;
    };

    P.klikScene = function (pt) {
        if (this.spaer()) return;
        if (this.fase === "forsoeg" && this.drypT === null) {
            if (this.paaFlaske(pt) || this.paaGlas(pt)) { this.udfoer(); return; }
            this.kortBlink();
            return;
        }
        this.kortBlink();
    };

    P.paaGlas = function (pt) {
        var k = this.k;
        return pt && pt.y > k.glasTop && pt.y < k.akseY && pt.x > this.akse.x0 - k.gb && pt.x < this.akse.x1 + k.gb;
    };

    /* ----- Layout ------------------------------------------------------------------------ */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle, pad = 14;
        var navnB = Math.round(NK.klamp(t.b * 0.18, 112, 176));
        var x0 = t.x + pad + navnB + 34, x1 = t.x + t.b - 30;
        this.akse = T.lavAkse(x0, x1);
        var h = t.h, n = this.opgaver.length;
        var fz = NK.klamp(h * 0.2, 56, 92);
        var gh = NK.klamp(h * 0.3, 76, 150);
        var akseLab = 26, mellem = 12;
        var rest = h - 8 - fz - gh - akseLab - mellem - 18 - 8;
        var rowH = NK.klamp(rest / n, 18, 36);
        if (rest / n < 18) gh = Math.max(60, gh - (18 * n - rest));
        var glasTop = t.y + 8 + fz;
        var akseY = glasTop + gh * 0.95;
        var gb = Math.min(gh * 0.3, this.akse.enhed * 2 * 0.62);
        gh = gb / 0.3;
        var fh = NK.klamp(fz * 0.98, 50, 86);
        this.k = {
            pad: pad, navnB: navnB, fz: fz, gh: gh, gb: gb, glasTop: akseY - gh * 0.95, akseY: akseY,
            kortTop: akseY + akseLab + mellem + 18, rowH: rowH, barH: Math.max(14, rowH * 0.72),
            fh: fh,
            /* Flasken staar paa hylden (aksens hoejde) i navnekolonnen */
            hjem: { x: t.x + pad + navnB * 0.5, y: akseY - T.FLASKE_SPIDS * fh / 100 }
        };
        this.saetAnker("glas", x0 - gb, this.k.glasTop - fz + 4, x1 - x0 + 2 * gb, fz + gh + akseLab - 4);
        this.saetAnker("kort", t.x + 4, this.k.kortTop - 22, t.b - 8, n * rowH + 24);
        this.saetAnker("flaske", this.k.hjem.x - fh * 0.32, this.k.hjem.y - 4, fh * 0.64, fh + 6);
    };

    P.glasRamme = function (g) {
        var k = this.k;
        return { x: this.akse.P(g.ph) - k.gb / 2, y: k.glasTop, b: k.gb, h: k.gh };
    };

    /* ----- Tegning --------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, k = this.k, a = this.akse, mig = this;
        if (!lay || !k) return;
        T.tavle(ctx, lay);

        /* Den gule ramme om det glas, gaettet spoerger om */
        var gaet = this.opg.gaet;
        if (this.fase === "gaet" && gaet && gaet.ph !== undefined) {
            var gx = a.P(gaet.ph);
            T.gulRamme(ctx, gx - k.gb * 0.95, k.glasTop - 6, k.gb * 1.9, k.akseY - k.glasTop + 30, 10);
        }

        /* Glassene */
        this.glas.forEach(function (g) { T.reagensglas(ctx, mig.glasRamme(g), g.farve, g.blandet); });
        T.akse(ctx, a, k.akseY);

        /* Farvens navn over hvert glas, naar indikatoren er blandet */
        var maksB = a.enhed * 2 - 6;
        this.glas.forEach(function (g) {
            if (!g.farve || g.blandet < 0.85) return;
            var navn = K.navn(mig.ind, g.ph);
            ctx.save();
            var st = NK.passendeSkrift(ctx, navn, maksB, 13, 9, "700");
            ctx.restore();
            NK.tekst(ctx, navn, a.P(g.ph), k.glasTop - 6, { font: "700 " + st + "px " + FONT, farve: T.BLAEK, justering: "center", linje: "alphabetic" });
        });

        /* Gaettet staar som et maerke over glassene */
        this.tegnGaet(ctx);

        /* Flasken og draaberne */
        this.tegnFlaske(ctx);

        /* Farvekortet under aksen */
        this.tegnKort(ctx);
        this.tegnSejr(ctx, lay.tavle);
    };

    P.tegnFlaske = function (ctx) {
        var k = this.k, t = this.drypT, mig = this;
        var p = this.fase === "forsoeg" ? this.flaskePos(t) : { x: k.hjem.x, y: k.hjem.y, v: 0 };
        var loeft = this.hover ? 4 : 0;
        /* Draaberne, der falder */
        if (t !== null && this.fase === "forsoeg") {
            this.drypListe.forEach(function (gi, j) {
                var a = mig.ankomst(j) + 0.02, u = (t - a) / (FALD - 0.02);
                if (u < 0 || u > 1) return;
                var g = mig.glas[gi], x = mig.akse.P(g.ph);
                var y0 = k.glasTop - 3, y1 = k.glasTop + k.gh * 0.48;
                T.draabe(ctx, x, y0 + (y1 - y0) * u * u, Math.max(2.6, k.gb * 0.11), K.vaeske(mig.ind, 7));
            });
        }
        T.flaske(ctx, p.x, p.y - loeft, k.fh, this.ind, p.v, { skygge: t !== null && p.v > 0.3 });
        if (this.fase === "forsoeg" && t === null) {
            T.skilt(ctx, k.hjem.x, k.hjem.y - 6, "Klik: dryp", { min: this.lay.tavle.x + 4 });
        }
    };

    P.tegnGaet = function (ctx) {
        var g = this.opg.gaet, k = this.k, a = this.akse;
        if (!g || this.gaetNr === null) return;
        var faerdig = this.fase !== "forsoeg";
        if (this.fase === "forsoeg" && this.drypT !== null) return;
        var x, svar = g.svar[this.gaetNr], linje2 = null, ok = null;
        if (g.slags === "farve") {
            x = a.P(g.ph);
            if (faerdig) {
                var blev = K.navn(this.ind, g.ph);
                linje2 = "Det blev " + blev;
                ok = svar === blev;
            }
        } else {
            x = (a.P(D.GLAS_PH[0]) + a.P(D.GLAS_PH[D.GLAS_PH.length - 1])) / 2;
            if (faerdig) {
                var antal = K.antalFarver(this.ind);
                linje2 = "Det blev " + antal + " farver";
                ok = (antal >= 5 && this.gaetNr === 2) || (antal === 2 && this.gaetNr === 1) || (antal === 1 && this.gaetNr === 0);
            }
        }
        var y = k.glasTop - (faerdig ? 22 : 8);
        var linjer = ["Dit gæt: " + svar];
        if (linje2) linjer.push(linje2);
        ctx.save();
        var b = Math.max.apply(null, linjer.map(function (l, i) {
            ctx.font = (i === 1 ? "800 " : "600 ") + "13px " + FONT;
            return ctx.measureText(l).width + (i === 1 ? 22 : 0);
        })) + 22;
        var h = linjer.length * 17 + 10;
        var bx = NK.klamp(x - b / 2, a.x0 - 20, a.x1 + 20 - b), by = y - h;
        ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = ok === null ? "#fff8e1" : (ok ? "#e5f5ea" : "#fdecea");
        NK.rundtRekt(ctx, bx, by, b, h, 7);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = ok === null ? "#d69e0c" : (ok ? "#3fae72" : "#d9534f");
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
        linjer.forEach(function (l, i) {
            NK.tekst(ctx, l, bx + 10, by + 15 + i * 17, { font: (i === 1 ? "800 " : "600 ") + "13px " + FONT, farve: T.BLAEK, linje: "middle" });
        });
        if (ok !== null) NK.tekst(ctx, ok ? "✓" : "✗", bx + b - 12, by + 15 + 17, { font: "800 15px " + FONT, farve: ok ? "#2e8b57" : "#c0392b", justering: "center", linje: "middle" });
    };

    P.tegnKort = function (ctx) {
        var k = this.k, a = this.akse, mig = this, t = this.lay.tavle;
        var synlige = [];
        this.opgaver.forEach(function (o, i) { if (mig.status[i].loest || i === mig.nr) synlige.push(i); });
        if (!synlige.length) return;
        NK.tekst(ctx, "Farvekortet", t.x + k.pad, k.kortTop - 10, { font: "800 13px " + FONT, farve: T.DAEMPET, linje: "alphabetic" });
        /* Raekkerne staar i opgavernes raekkefoelge, saa en ny bjaelke kommer nederst */
        this.opgaver.forEach(function (o, i) {
            if (synlige.indexOf(i) < 0) return;
            var y = k.kortTop + i * k.rowH, h = k.barH;
            var navn = D.ind(o.ind).navn, nu = i === mig.nr;
            var andel = mig.status[i].loest ? 1 : 0;
            if (nu && mig.barT !== null) andel = NK.blod(mig.barT / SWEEP);
            else if (nu && !mig.groen && !mig.status[i].loest) andel = 0;
            ctx.save();
            var st = NK.passendeSkrift(ctx, navn, k.navnB + 18, 14, 10, nu ? "800" : "700");
            ctx.restore();
            NK.tekst(ctx, navn, a.x0 - 14, y + h / 2 + 1, { font: (nu ? "800 " : "700 ") + st + "px " + FONT, farve: nu ? "#8a6200" : T.BLAEK, justering: "right", linje: "middle" });
            T.bjaelke(ctx, o.ind, a, y, h, andel);
            if (andel >= 1) T.bjaelkeNavne(ctx, o.ind, a, y, h, andel);
        });
    };

    NK.SimSkift = SimSkift;
}());
