/* =====================================================================
   sim_plastik.js - fane 3: Plastik

   Ethenmolekyler ligger loest paa bordet. Eleven traekker et hen til
   et andet: dobbeltbindingerne aabner sig, og carbonatomerne binder
   sig til nabomolekylet i stedet. Flere molekyler kan saettes paa i
   begge ender, saa der bliver en kaede. Hvert farvet felt i kaeden
   kommer fra ét ethenmolekyle, som i bogens figur.

   Fra det tredje maal er kaeden et udsnit af en meget laengere kaede:
   knappen Zoom ud viser hele kaeden med elevens stykke som en lille
   gul streg, og en frysepose. Til sidst proever eleven at saette brom
   paa kaeden; det kan ikke lade sig goere, for der er kun
   enkeltbindinger.

   Kemien er K.kaede i js/kemi.js: n ethenmolekyler giver 2n C og 4n H.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    var SAML_SEK = 0.9;        /* et molekyle saetter sig paa */
    var ZOOM_SEK = 1.7;        /* zoom ud eller ind */
    var SET_SEK = 1.1;         /* saa laenge skal billedet staa, foer det taeller */
    var AFVIS_SEK = 1.9;       /* brom, der ikke kan saette sig paa */
    var PLADSER = 6;           /* ethenmolekyler paa bordet */
    var NY_SEK = 0.6;          /* saa laenge gaar der, foer et nyt ligger klar */

    /* Et tal, der ser tilfaeldigt ud, men er det samme hver gang (mulberry32) */
    function tilfaeldig(froe) {
        var a = froe;
        return function () {
            a |= 0; a = a + 0x6D2B79F5 | 0;
            var t = Math.imul(a ^ a >>> 15, 1 | a);
            t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }

    function SimPlastik() {
        var mig = this;
        this.led = 0;             /* saa mange ethenmolekyler er kaeden lavet af */
        this.saml = null;         /* { t, ind: [{ fra, k }], foer, efter, skift } */
        this.pulje = [];
        for (var i = 0; i < PLADSER; i++) this.pulje.push({ x: 0, y: 0, til: true, alfa: 1, vent: 0, fase: NK.r(0, 6.28) });
        this.traek = null;        /* { slags: "ethen" | "brom", i, x, y, x0, y0 } */
        this.over = null;
        this.zoom = 0;
        this.zoomMaal = 0;
        this.zoomT = 0;
        this.afvis = null;        /* { t, fra } */
        this.bromSet = false;
        this.uK = 0;
        this.cyK = 0;
        this.uP = 0;
        this.zoomKnap = NK.el("p-zoom");
        this.vaerktoej = NK.el("p-vaerktoej");
        this.zoomKnap.addEventListener("click", function () { mig.skiftZoom(); mig.fokus(); });
        this.startFane(D.P_MAAL);
        this.visPanel();
        this.visVaerktoej();
    }

    var P = SimPlastik.prototype;
    NK.Fane.paa(P, { navn: "p" });

    /* ----- Maalene ------------------------------------------------------------------ */
    /* Fra maalet Zoom ud er kaeden et udsnit af en lang kaede */
    P.erUdsnit = function () { return this.idx(this.opg.o.id) >= this.idx("polymer"); };
    /* Brommolekylet hoerer kun til opgaven Fryseposen */
    P.harBrom = function () { return this.opg.o.id === "frysepose"; };

    P.nyOpgave = function (o) {
        var op = o.opstil;
        this.saml = null;
        this.traek = null;
        this.afvis = null;
        this.bromSet = false;
        this.zoom = 0;
        this.zoomMaal = 0;
        this.zoomT = 0;
        if (op && op.led !== undefined) this.led = op.led;
        else if (this.led >= o.forsoeg.krav) this.led = 2;       /* Byg en kaede begynder med 2 */
        this.pulje.forEach(function (p) { p.til = true; p.alfa = 1; p.vent = 0; });
        this.snap = true;
        if (this.status) { this.visPanel(); this.visVaerktoej(); }
    };

    P.nyFase = function () { this.visVaerktoej(); };
    P.efterGaet = function () { this.visVaerktoej(); };
    P.efterOpgave = function () { this.visPanel(); this.visVaerktoej(); };

    P.nulstilScene = function () {
        /* Ny kaede (og tasten R) hoerer til forsoeget */
        if (!this.iForsoeg()) return;
        var op = this.opg.o.opstil;
        this.saml = null;
        this.traek = null;
        this.afvis = null;
        this.zoomMaal = 0;
        this.led = op && op.led !== undefined ? op.led : 2;
        this.pulje.forEach(function (p) { p.til = true; p.alfa = 1; p.vent = 0; });
        this.visPanel();
        this.visVaerktoej();
    };

    P.kravNu = function () {
        var o = this.opg.o;
        return o.forsoeg ? o.forsoeg.krav : null;
    };

    /* Kortets opgavetekst siger, hvad der skal goeres. Linjen under den har
       kun det at tilfoeje, som scenen selv ved: hvor lang kaeden er, og hvad
       den lange streg er, naar der er zoomet ud. */
    P.sceneLinje = function () {
        var krav = this.kravNu();
        if (typeof krav !== "number") return "";
        if (this.saml) return "Dobbeltbindingen i ethen åbner sig, og ethenmolekylet binder sig til sin nabo.";
        if (this.led > 2 && this.led < krav) return "Kæden er lavet af " + this.led + " ethenmolekyler.";
        return "";
    };

    P.forsoegSvar = function (o) {
        var krav = o.forsoeg.krav;
        this.saml = null;
        this.traek = null;
        this.afvis = null;
        if (krav === "zoom") { this.zoomMaal = 1; this.zoom = 1; }
        else if (krav === "afvist") this.bromSet = true;
        else this.led = krav;
        this.visPanel();
        this.visVaerktoej();
    };

    /* ----- Zoom ------------------------------------------------------------------------ */
    P.skiftZoom = function () {
        /* Laasen: knappen hoerer til forsoeget i opgaven Zoom ud */
        if (this.spaer()) return;
        if (this.kravNu() !== "zoom") { this.kortBlink(); return; }
        this.zoomMaal = this.zoomMaal ? 0 : 1;
        this.zoomT = 0;
        this.nulstilHjaelp();
        this.visVaerktoej();
        this.naesteLinje("", "");
    };

    P.visVaerktoej = function () {
        /* Knappen Zoom ud er kun fremme i det forsoeg, den hoerer til */
        var krav = this.iForsoeg() ? this.kravNu() : null;
        this.vaerktoej.hidden = krav !== "zoom";
        this.zoomKnap.textContent = this.zoomMaal ? "Zoom ind" : "Zoom ud";
        this.zoomKnap.classList.toggle("banker", krav === "zoom" && !this.zoomMaal);
    };

    /* ----- Panelet --------------------------------------------------------------------- */
    P.visPanel = function () {
        var n = this.led, k = K.kaede(n), html = "";
        html += '<div class="talraekke"><span>Ethenmolekyler i kæden</span><span class="tal">' + n + "</span></div>";
        if (n && this.erLoest("to")) html += '<div class="talraekke"><span>Dobbeltbindinger i kæden</span><span class="tal">0</span></div>';
        if (n && this.erLoest("kaede")) {
            html += '<div class="talraekke"><span>Carbonatomer</span><span class="tal">' + k.C + "</span></div>" +
                '<div class="talraekke"><span>Hydrogenatomer</span><span class="tal">' + k.H + "</span></div>";
        }
        if (this.erLoest("polymer")) {
            html += '<div class="talraekke skema skil"><span>En hel kæde i polyethen</span><span class="tal">mange tusinde ethenmolekyler</span></div>';
        }
        NK.saetHTML("p-kaede", html);
    };

    /* ----- Kaeden: hvor molekylerne sidder ------------------------------------------------
       Et led er to carbonatomer med to hydrogenatomer paa hver. x1 er det
       venstre carbonatoms plads regnet fra kaedens midte i bindingslaengder. */
    function ledX(k, n) { return 2 * k - n + 0.5; }

    P.uFor = function (n) {
        var lay = this.lay;
        return NK.klamp(Math.min((lay.W - 60) / (2 * Math.max(n, 2) + 1.7), (lay.kBund - lay.kTop) / 3.7), 15, 46);
    };

    /* Leddene, som de staar lige nu: { x1, y, u, e, ny }. e er, hvor langt
       dobbeltbindingen er aabnet (0 = loest ethen, 1 = led i kaeden). */
    P.leddene = function () {
        var lay = this.lay, cx = lay.W / 2, cy = this.cyK, ud = [], k;
        if (!this.saml) {
            for (k = 0; k < this.led; k++) ud.push({ x1: cx + ledX(k, this.led) * this.uK, y: cy, u: this.uK, e: 1 });
            return ud;
        }
        var s = this.saml, e = NK.blod(s.t), u0 = this.uFor(s.foer), u1 = this.uFor(s.efter), uP = this.uP;
        for (k = 0; k < s.efter; k++) {
            var ind = null;
            s.ind.forEach(function (x) { if (x.k === k) ind = x; });
            var maalX = cx + ledX(k, s.efter) * u1;
            if (ind) {
                ud.push({ x1: NK.lerp(ind.fra.x - uP / 2, maalX, e), y: NK.lerp(ind.fra.y, cy, e), u: NK.lerp(uP, u1, e), e: e, ny: true });
            } else {
                var gl = k - s.skift;
                ud.push({ x1: NK.lerp(cx + ledX(gl, s.foer) * u0, maalX, e), y: cy, u: NK.lerp(u0, u1, e), e: 1 });
            }
        }
        return ud;
    };

    /* Atomerne og bindingerne i ét led (til T.molekyle). n0 er nummeret
       paa leddets foerste atom i den samlede liste. */
    function ledAtomer(L, n0, atomer, bindinger) {
        var u = L.u, e = L.e;
        var hx = NK.lerp(0.6, 0, e) * u, hy = NK.lerp(0.62, 0.95, e) * u;
        atomer.push({ el: "C", x: L.x1, y: L.y }, { el: "C", x: L.x1 + u, y: L.y },
            { el: "H", x: L.x1 - hx, y: L.y - hy }, { el: "H", x: L.x1 - hx, y: L.y + hy },
            { el: "H", x: L.x1 + u + hx, y: L.y - hy }, { el: "H", x: L.x1 + u + hx, y: L.y + hy });
        bindinger.push({ a: n0, b: n0 + 1, s: 2 - e }, { a: n0, b: n0 + 2, s: 1 }, { a: n0, b: n0 + 3, s: 1 },
            { a: n0 + 1, b: n0 + 4, s: 1 }, { a: n0 + 1, b: n0 + 5, s: 1 });
    }

    /* ----- Sammensaetningen ---------------------------------------------------------------- */
    /* Et ethenmolekyle fra bordet saetter sig paa. fra: hvor det blev sluppet.
       venstre: paa kaedens venstre ende. makker: det andet molekyle, naar der
       endnu ikke er nogen kaede. */
    P.saetPaa = function (i, fra, venstre, makker) {
        if (this.saml || !this.iForsoeg() || typeof this.kravNu() !== "number") return false;
        if (this.led >= K.MAX_LED) { this.kortBesked(D.P_FULD, 7); return false; }
        var p = this.pulje[i];
        this.nulstilHjaelp();
        if (this.led === 0) {
            var m = this.pulje[makker];
            var hoejre = fra.x >= m.x;
            this.saml = { t: 0, foer: 0, efter: 2, skift: 0, ind: [{ fra: { x: m.x, y: m.y }, k: hoejre ? 0 : 1 }, { fra: fra, k: hoejre ? 1 : 0 }] };
            m.til = false; m.vent = NY_SEK + SAML_SEK;
        } else {
            this.saml = { t: 0, foer: this.led, efter: this.led + 1, skift: venstre ? 1 : 0, ind: [{ fra: fra, k: venstre ? 0 : this.led }] };
        }
        p.til = false; p.vent = NY_SEK + SAML_SEK;
        this.naesteLinje("", "");
        return true;
    };

    P.naermeste = function (i) {
        var mig = this, bedst = -1, afst = 1e9;
        this.pulje.forEach(function (p, j) {
            if (j === i || !p.til) return;
            var d = Math.hypot(p.x - mig.pulje[i].x, p.y - mig.pulje[i].y);
            if (d < afst) { afst = d; bedst = j; }
        });
        return bedst;
    };

    /* ----- Scenen -------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, baand = this.baand(), Hs = baand.y;
        var lay = { W: W, H: this.L.h, Hs: Hs };
        var ph = NK.klamp(Hs * 0.2, 88, 128);
        lay.yPulje = Hs - ph - 6;
        lay.ph = ph;
        lay.bh = baand.h;
        /* Oeverst kortet med opgaven; kaeden staar under den plads, kortet har */
        lay.kTop = 10 + this.kortZone() + 8;
        lay.kBund = lay.yPulje - 10;
        this.vaerktoej.style.top = lay.kTop + "px";
        /* Brommolekylets brik: midt i baandet forneden */
        var bb = NK.klamp(W * 0.22, 130, 180), bh = Math.min(ph - 8, 100);
        lay.brom = { x: W / 2 - bb / 2, y: Hs - bh - 12, b: bb, h: bh };
        /* Udsnittet, naar der er zoomet ud: den lange kaede til venstre, posen til hoejre */
        var pb = NK.klamp(W * 0.17, 100, 150);
        var zy = lay.kTop + 54, zh = Math.max(80, Hs - zy - 16);
        lay.pose = { x: W - pb - 26, y: zy + Math.max(0, (zh - pb * 1.2 - 46) / 2), b: pb, h: pb * 1.2 };
        lay.lang = { x: 26, y: zy, b: lay.pose.x - 26 - 30, h: zh };
        this.lay = lay;
        this.lavLang();
        this.maalene();
        if (!this.uK) { this.uK = lay.uKMaal; this.cyK = lay.cyKMaal; this.uP = lay.uPMaal; this.pulje.forEach(function (p, i) { p.x = lay.plads[i].x; p.y = lay.plads[i].y; }); }
        var u = lay.uKMaal;
        this.saetAnker("kaede", 20, lay.cyKMaal - 1.5 * u, W - 40, 3 * u);
        this.saetAnker("pulje", 12, lay.yPulje, W - 24, ph);
        NK.el("p-anker-pulje").hidden = this.erUdsnit();
    };

    /* Hvor tingene skal staa lige nu: kaeden, og molekylerne paa bordet.
       Uden kaede ligger molekylerne midt i scenen i to raekker; med en
       kaede ligger de i én raekke forneden. */
    P.maalene = function () {
        var lay = this.lay, W = lay.W, e = this.el.skort, i;
        var n = this.saml ? this.saml.efter : this.led;
        var u = this.uFor(n);
        var cy = lay.kTop + (lay.kBund - lay.kTop) * 0.5;
        /* et gaet er hoejere end kortets plads: kaeden rykker ned, hvis den ellers ville ligge under det */
        if (this.gaetNu() && e) {
            var gk = e.offsetTop + e.offsetHeight + 10;
            if (cy - 1.4 * u < gk) {
                var bund = this.harBrom() ? lay.brom.y - 8 : lay.kBund;
                u = Math.min(u, Math.max(15, (bund - gk - 6) / 2.8));
                cy = gk + (bund - gk) / 2;
            }
        }
        lay.uKMaal = u;
        lay.cyKMaal = cy;
        lay.plads = [];
        if (n === 0) {
            var zone = lay.Hs - 12 - lay.kTop;
            var um = NK.klamp(Math.min(W / 3 / 4.4, zone / 2 / 3.3), 20, 42);
            lay.uPMaal = um;
            lay.yMidt = lay.kTop + zone * 0.5;
            for (i = 0; i < PLADSER; i++) lay.plads.push({ x: W * (i % 3 + 0.5) / 3, y: lay.kTop + zone * (i < 3 ? 0.25 : 0.76) });
        } else {
            lay.uPMaal = NK.klamp(Math.min(W / PLADSER / 3.1, lay.ph / 2.5), 18, 32);
            for (i = 0; i < PLADSER; i++) lay.plads.push({ x: W * (i + 0.5) / PLADSER, y: lay.yPulje + lay.ph * 0.5 });
        }
    };

    /* Den lange kaede: en streg, der snor sig rundt i feltet. Den er den
       samme hver gang, og elevens stykke er en lille del midt paa. */
    P.lavLang = function () {
        var R = this.lay.lang, n = 1500, skridt = Math.max(4.5, Math.sqrt(R.b * R.h) / 62);
        var noegle = Math.round(R.b) + "x" + Math.round(R.h);
        if (this.lang && this.lang.noegle === noegle) return;
        var rnd = tilfaeldig(20261009), p = [], x = R.b * 0.5, y = R.h * 0.5, v = rnd() * 6.28, dv = 0;
        for (var i = 0; i < n; i++) {
            dv = NK.klamp(dv + (rnd() - 0.5) * 0.5, -0.42, 0.42);
            v += dv;
            /* drej ind mod midten, naar stregen naermer sig kanten */
            var mx = R.b / 2 - x, my = R.h / 2 - y, kant = Math.max(Math.abs(mx) / (R.b / 2), Math.abs(my) / (R.h / 2));
            if (kant > 0.82) {
                var ind = Math.atan2(my, mx), forskel = Math.atan2(Math.sin(ind - v), Math.cos(ind - v));
                v += forskel * 0.3;
                dv *= 0.5;
            }
            x = NK.klamp(x + Math.cos(v) * skridt, 4, R.b - 4);
            y = NK.klamp(y + Math.sin(v) * skridt, 4, R.h - 4);
            p.push([x, y]);
        }
        this.lang = { noegle: noegle, p: p, n: n };
    };

    /* Elevens stykke af den lange kaede: numrene paa de punkter, det daekker */
    P.stykke = function () {
        var n = this.lang.n, antal = Math.max(2, Math.round(n * this.led / K.LANG_KAEDE));
        var midt = Math.round(n * 0.47);
        return { fra: midt, til: midt + antal };
    };

    P.opdaterScene = function (dt) {
        var lay = this.lay, g = this.opg, mig = this;
        if (!lay) return;
        if (this.baand().h !== lay.bh) { this.layout(); lay = this.lay; }
        this.maalene();
        if (this.snap) {
            this.snap = false;
            this.uK = lay.uKMaal; this.cyK = lay.cyKMaal; this.uP = lay.uPMaal;
            this.pulje.forEach(function (p, i) { p.x = lay.plads[i].x; p.y = lay.plads[i].y; });
        }
        if (!this.saml) this.uK = NK.mod(this.uK, lay.uKMaal, 9, dt);
        this.cyK = NK.mod(this.cyK, lay.cyKMaal, 9, dt);
        this.uP = NK.mod(this.uP, lay.uPMaal, 7, dt);
        this.pulje.forEach(function (p, i) {
            p.fase += dt * 1.4;
            p.x = NK.mod(p.x, lay.plads[i].x, 7, dt);
            p.y = NK.mod(p.y, lay.plads[i].y, 7, dt);
            if (!p.til) {
                p.vent -= dt;
                if (p.vent <= 0) { p.til = true; p.alfa = 0; }
            } else if (p.alfa < 1) p.alfa = Math.min(1, p.alfa + dt / 0.4);
        });

        if (this.saml) {
            this.saml.t += dt / SAML_SEK;
            if (this.saml.t >= 1) {
                this.led = this.saml.efter;
                this.saml = null;
                this.uK = this.uFor(this.led);
                this.visPanel();
                if (this.iForsoeg()) this.naesteLinje("", "");
            }
        }
        if (this.zoom !== this.zoomMaal) {
            var skridt = dt / ZOOM_SEK;
            this.zoom = this.zoomMaal > this.zoom ? Math.min(1, this.zoom + skridt) : Math.max(0, this.zoom - skridt);
        }
        if (this.afvis) {
            this.afvis.t += dt / AFVIS_SEK;
            if (this.afvis.t >= 1) {
                this.afvis = null;
                this.bromSet = true;
                if (this.iForsoeg() && this.kravNu() === "afvist") { this.forsoegKlaret(""); this.visVaerktoej(); return; }
            }
        }

        if (!this.iForsoeg()) return;
        var krav = this.kravNu();
        if (krav === "zoom") {
            if (this.zoom >= 1) {
                this.zoomT += dt;
                if (this.zoomT >= SET_SEK) { this.forsoegKlaret(g.o.forsoeg.set || ""); this.visVaerktoej(); }
            }
        } else if (krav !== "afvist") {
            if (!this.saml && this.led === krav) { this.forsoegKlaret(g.o.forsoeg.set || ""); this.visVaerktoej(); }
        }
    };

    /* Det, der skal bruges nu: "pulje", "brom" eller null */
    P.peger = function () {
        var g = this.opg;
        if (!this.iForsoeg() || this.traek || this.saml || this.afvis) return null;
        var krav = this.kravNu();
        if (krav === "zoom") return null;
        if (krav === "afvist") return this.zoom < 0.05 ? "brom" : null;
        return this.led < krav ? "pulje" : null;
    };

    /* ----- Tegning ------------------------------------------------------------------- */
    P.tegnEthen = function (ctx, x, y, u, alfa) {
        var atomer = [], bind = [];
        ledAtomer({ x1: x - u / 2, y: y, u: u, e: 0 }, 0, atomer, bind);
        Tg.molekyle(ctx, atomer, bind, u, { alfa: alfa });
    };

    P.tegnKaede = function (ctx, alfa) {
        var L = this.leddene(), atomer = [], bind = [], udsnit = this.erUdsnit(), u = this.uK;
        if (!L.length) return;
        if (this.saml) u = NK.lerp(this.uFor(this.saml.foer), this.uFor(this.saml.efter), NK.blod(this.saml.t));
        /* Felterne: ét for hvert ethenmolekyle */
        ctx.save();
        L.forEach(function (l, k) {
            var a = l.ny ? l.e : 1;
            ctx.globalAlpha = alfa * a;
            NK.rundtRekt(ctx, l.x1 - 0.44 * l.u, l.y - 1.36 * l.u, 1.88 * l.u, 2.72 * l.u, 0.22 * l.u);
            ctx.fillStyle = k % 2 === 0 ? "rgba(32, 150, 140, 0.26)" : "rgba(32, 150, 140, 0.13)";
            ctx.fill();
            ctx.lineWidth = 1.2;
            ctx.strokeStyle = "rgba(94, 200, 188, 0.5)";
            ctx.stroke();
        });
        ctx.restore();
        L.forEach(function (l, k) {
            ledAtomer(l, k * 6, atomer, bind);
            if (k > 0) {
                var s = l.ny || L[k - 1].ny ? NK.klamp((Math.min(l.e, L[k - 1].e) - 0.55) / 0.45, 0, 1) : 1;
                bind.push({ a: (k - 1) * 6 + 1, b: k * 6, s: s });
            }
        });
        Tg.molekyle(ctx, atomer, bind, u, { alfa: alfa });
        /* Enderne: en ledig plads, eller prikker, naar kaeden er et udsnit */
        var f = L[0], s2 = L[L.length - 1], faerdige = !this.saml;
        [[f.x1, f.y, -1, f.u], [s2.x1 + s2.u, s2.y, 1, s2.u]].forEach(function (e) {
            var x = e[0], y = e[1], r = e[2], uu = e[3];
            if (udsnit) {
                ctx.save();
                ctx.globalAlpha = alfa;
                ctx.strokeStyle = Tg.STREG;
                ctx.lineWidth = Math.max(2, uu * 0.065);
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(x + r * 0.3 * uu, y);
                ctx.lineTo(x + r * 0.85 * uu, y);
                ctx.stroke();
                ctx.restore();
                NK.tekst(ctx, "…", x + r * 1.12 * uu, y + 1, { font: Tg.font("700", Math.max(14, uu * 0.5)), justering: "center", linje: "middle", farve: "rgba(207, 214, 222, " + alfa + ")" });
            } else {
                Tg.plads(ctx, x, y, x + r * 0.95 * uu, y, uu, alfa * (faerdige ? 1 : 0.4));
            }
        });
    };

    P.tegnBrom = function (ctx, x, y, um, alfa) {
        Tg.molekyle(ctx, [{ el: "Br", x: x - 0.62 * um, y: y }, { el: "Br", x: x + 0.62 * um, y: y }], [{ a: 0, b: 1, s: 1 }], um, { alfa: alfa });
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, mig = this;
        if (!lay) return;
        ctx.fillStyle = "#14141a";
        ctx.fillRect(0, 0, lay.W, lay.H);
        var z = NK.blod(this.zoom), peger = this.peger(), udsnit = this.erUdsnit();

        /* Baandet forneden: bordet med de loese molekyler, eller brommolekylet */
        if (z < 0.98) {
            ctx.save();
            ctx.globalAlpha = 1 - z;
            if (this.led > 0 || this.saml || udsnit) {
                ctx.fillStyle = "#1b1c24";
                ctx.fillRect(0, lay.yPulje, lay.W, lay.Hs - lay.yPulje);
                ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
                ctx.fillRect(0, lay.yPulje, lay.W, 1);
            }
            ctx.restore();
        }

        /* Den lange kaede og fryseposen, naar der er zoomet ud */
        if (z > 0.01) this.tegnLang(ctx, z);

        /* Kaeden: skrumper ind til det lille gule stykke, naar der zoomes ud */
        if (z < 0.995 && (this.led > 0 || this.saml)) {
            if (z > 0.001) {
                var st = this.stykke(), P0 = this.lang.p[Math.round((st.fra + st.til) / 2)], R = lay.lang;
                var k = NK.lerp(1, 0.02, z);
                ctx.save();
                ctx.translate(NK.lerp(lay.W / 2, R.x + P0[0], z), NK.lerp(this.cyK, R.y + P0[1], z));
                ctx.scale(k, k);
                ctx.translate(-lay.W / 2, -this.cyK);
                this.tegnKaede(ctx, 1 - z * z);
                ctx.restore();
            } else {
                this.tegnKaede(ctx, 1);
            }
        }

        /* De loese ethenmolekyler */
        if (!udsnit && z < 0.5) {
            this.pulje.forEach(function (p, i) {
                if (!p.til) return;
                if (mig.traek && mig.traek.slags === "ethen" && mig.traek.i === i) return;
                var y = p.y + Math.sin(p.fase) * 2.5;
                if (mig.over === i && !mig.traek) {
                    ctx.save();
                    NK.rundtRekt(ctx, p.x - 1.5 * mig.uP, y - 1.05 * mig.uP, 3 * mig.uP, 2.1 * mig.uP, 10);
                    ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
                    ctx.fill();
                    ctx.restore();
                }
                mig.tegnEthen(ctx, p.x, y, mig.uP, p.alfa);
            });
            if (this.led > 0 || this.saml) NK.tekst(ctx, "ethen, C₂H₄", 14, lay.yPulje + 18, { font: Tg.font("600", 13.5), farve: "#8f97a3" });
            else NK.tekst(ctx, "Ethenmolekyler, C₂H₄", lay.W / 2, lay.yMidt + 5, { font: Tg.font("600", 15), justering: "center", farve: "#8f97a3" });
        }

        /* Brommolekylet til det fjerde maal */
        if (udsnit && this.harBrom() && z < 0.05) {
            var B = lay.brom, ude = (this.traek && this.traek.slags === "brom") || this.afvis;
            Tg.brik(ctx, B.x, B.y, B.b, B.h, { over: this.over === "brom" && !ude, alfa: ude ? 0.45 : 1 });
            this.tegnBrom(ctx, B.x + B.b / 2, B.y + B.h * 0.4, Math.min(34, B.h * 0.34), ude ? 0.3 : 1);
            NK.tekst(ctx, "brom, Br₂", B.x + B.b / 2, B.y + B.h - 13, { font: Tg.font("600", 15), justering: "center", farve: ude ? "#7e8590" : "#dfe5ec" });
            if (peger === "brom") {
                Tg.ring(ctx, B.x, B.y, B.b, B.h, this.tid);
                Tg.skilt(ctx, "Træk hen til kæden", B.x + B.b / 2, B.y - 12, 8, lay.W - 8);
            }
        }

        /* En rolig gul ring om kaeden, naar spoergsmaalet handler om den */
        if (this.omNu().indexOf("kaede") >= 0 && this.led > 0 && !this.saml && !this.traek && !this.afvis && z < 0.02) {
            var uo = this.uK, bo = (2 * this.led - 1 + 0.9) * uo;
            Tg.omRing(ctx, lay.W / 2 - bo / 2 - 0.1 * uo, this.cyK - 1.46 * uo, bo + 0.2 * uo, 2.92 * uo);
        }

        /* Maalet lyser op, mens noget holdes */
        if (this.traek && this.traek.slags === "ethen" && this.led === 0) {
            this.pulje.forEach(function (p, i) {
                if (p.til && i !== mig.traek.i) Tg.ring(ctx, p.x - 1.5 * mig.uP, p.y - 1.05 * mig.uP, 3 * mig.uP, 2.1 * mig.uP, mig.tid, 12);
            });
        }
        if (this.traek && this.traek.slags === "ethen" && this.led > 0) {
            var L = this.leddene(), u = this.uK;
            Tg.ring(ctx, L[0].x1 - 1.5 * u, this.cyK - 0.5 * u, u, u, this.tid, 14);
            Tg.ring(ctx, L[L.length - 1].x1 + 1.5 * u, this.cyK - 0.5 * u, u, u, this.tid, 14);
        }
        if (this.traek && this.traek.slags === "brom") {
            var u2 = this.uK, b2 = (2 * this.led + 0.6) * u2;
            Tg.ring(ctx, lay.W / 2 - b2 / 2, this.cyK - 1.4 * u2, b2, 2.8 * u2, this.tid, 18);
        }

        /* Brom, der ikke kan saette sig paa: hen, ryst og tilbage */
        if (this.afvis) {
            var t = this.afvis.t, B3 = lay.brom, uu = this.uK;
            var hen = { x: lay.W / 2, y: this.cyK - 1.95 * uu }, hjem = { x: B3.x + B3.b / 2, y: B3.y + B3.h * 0.4 };
            var x, y2, um = uu * 0.8;
            if (t < 0.28) {
                var e1 = NK.blod(t / 0.28);
                x = NK.lerp(this.afvis.fra.x, hen.x, e1); y2 = NK.lerp(this.afvis.fra.y, hen.y, e1);
            } else if (t < 0.68) {
                var v = (t - 0.28) / 0.4;
                x = hen.x + Math.sin(v * Math.PI * 6) * 9 * (1 - v);
                y2 = hen.y + Math.abs(Math.sin(v * Math.PI * 3)) * 0.4 * uu * (1 - v * 0.6);
                Tg.maerkat(ctx, "ingen ledig plads", hen.x, hen.y - 0.62 * uu - 10, { px: 15, farve: "#ffd7d2", bund: "rgba(224, 84, 70, 0.34)" });
            } else {
                var e2 = NK.blod((t - 0.68) / 0.32);
                x = NK.lerp(hen.x, hjem.x, e2); y2 = NK.lerp(hen.y, hjem.y, e2);
                um = NK.lerp(uu * 0.8, Math.min(34, B3.h * 0.34), e2);
            }
            this.tegnBrom(ctx, x, y2, um, 1);
        }

        /* Det gule skilt ved det molekyle, der kan traekkes nu */
        if (peger === "pulje") {
            var pp = this.pulje[this.led === 0 ? 1 : 2];
            if (pp.til) {
                Tg.ring(ctx, pp.x - 1.5 * this.uP, pp.y - 1.05 * this.uP, 3 * this.uP, 2.1 * this.uP, this.tid, 12);
                Tg.skilt(ctx, this.led === 0 ? "Træk hen til et andet ethenmolekyle" : "Træk hen til kædens ende", pp.x, pp.y - 1.05 * this.uP - 12, 8, lay.W - 8);
            }
        }

        /* Det, der holdes med musen */
        if (this.traek && this.traek.slags === "ethen") this.tegnEthen(ctx, this.traek.x, this.traek.y, this.uP, 1);
        if (this.traek && this.traek.slags === "brom") this.tegnBrom(ctx, this.traek.x, this.traek.y, this.uK * 0.8, 1);
        this.tegnSejr(ctx, lay.W, lay.Hs);
    };

    P.tegnLang = function (ctx, z) {
        var lay = this.lay, R = lay.lang, p = this.lang.p, st = this.stykke(), i;
        ctx.save();
        ctx.globalAlpha = z;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.strokeStyle = "rgba(174, 184, 197, 0.9)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (i = 0; i < p.length; i++) {
            if (i === 0) ctx.moveTo(R.x + p[i][0], R.y + p[i][1]); else ctx.lineTo(R.x + p[i][0], R.y + p[i][1]);
        }
        ctx.stroke();
        /* elevens stykke */
        ctx.strokeStyle = Tg.GUL;
        ctx.lineWidth = 5;
        ctx.beginPath();
        for (i = st.fra; i <= st.til; i++) {
            if (i === st.fra) ctx.moveTo(R.x + p[i][0], R.y + p[i][1]); else ctx.lineTo(R.x + p[i][0], R.y + p[i][1]);
        }
        ctx.stroke();
        var m = p[Math.round((st.fra + st.til) / 2)], mx = R.x + m[0], my = R.y + m[1];
        var op = my > R.y + 60;
        ctx.restore();
        if (z > 0.6) {
            ctx.save();
            ctx.globalAlpha = (z - 0.6) / 0.4;
            Tg.skilt(ctx, "Dit stykke på " + this.led, mx, op ? my - 12 : my + 12, 8, lay.W - 8, !op);
            /* overskriften staar til hoejre for knappen Zoom ind */
            var tx = Math.max(R.x + R.b / 2, 14 + 132 + 12 + 150);
            NK.tekst(ctx, "Én kæde i polyethen", tx, lay.kTop + 18, { font: Tg.font("700", 17), justering: "center", farve: "#ffffff" });
            NK.tekst(ctx, "mange tusinde ethenmolekyler efter hinanden", tx, lay.kTop + 39, { font: Tg.font("600", 14.5), justering: "center", farve: "#c9d0d9" });
            var Po = lay.pose;
            NK.Sprites.tegn(ctx, "frysepose", Po.x, Po.y, Po.b, Po.h);
            NK.tekst(ctx, "En frysepose", Po.x + Po.b / 2, Po.y + Po.h + 22, { font: Tg.font("700", 15), justering: "center", farve: "#ffffff" });
            NK.tekst(ctx, "er lavet af polyethen", Po.x + Po.b / 2, Po.y + Po.h + 41, { font: Tg.font("600", 13.5), justering: "center", farve: "#c9d0d9" });
            ctx.restore();
        }
    };

    /* ----- Musen ---------------------------------------------------------------------- */
    P.puljeVed = function (pt) {
        if (this.erUdsnit() || this.zoom > 0.05) return -1;
        var u = this.uP;
        for (var i = 0; i < this.pulje.length; i++) {
            var p = this.pulje[i];
            if (p.til && Math.abs(pt.x - p.x) <= 1.6 * u && Math.abs(pt.y - p.y) <= 1.15 * u) return i;
        }
        return -1;
    };

    P.bromVed = function (pt) {
        var B = this.lay.brom;
        if (!this.erUdsnit() || !this.harBrom() || this.zoom > 0.05) return false;
        return pt.x >= B.x && pt.x <= B.x + B.b && pt.y >= B.y && pt.y <= B.y + B.h;
    };

    P.kaedeVed = function (pt, bredt) {
        if (this.led === 0 || this.zoom > 0.05) return false;
        var u = this.uK, b = (2 * this.led + (bredt ? 4.4 : 1)) * u;
        return Math.abs(pt.x - this.lay.W / 2) <= b / 2 && Math.abs(pt.y - this.cyK) <= (bredt ? 2.1 : 1.4) * u;
    };

    P.overScene = function (pt) {
        this.over = null;
        if (!pt || !this.lay) return null;
        var krav = this.iForsoeg() ? this.kravNu() : null;
        var i = this.puljeVed(pt);
        if (i >= 0) { this.over = i; return typeof krav === "number" && !this.saml ? "greb" : "klik"; }
        if (this.bromVed(pt)) { this.over = "brom"; return krav === "afvist" && !this.afvis ? "greb" : "klik"; }
        return this.kaedeVed(pt) ? "klik" : null;
    };

    P.nedScene = function (pt) {
        if (this.saml || this.afvis) return false;
        var i = this.puljeVed(pt), brom = this.bromVed(pt);
        if (i < 0 && !brom) return false;
        /* Laasen: molekylerne kan kun traekkes, mens kortet viser det forsoeg, de
           hoerer til. Ellers blinker kortet. */
        if (this.spaer()) return false;
        var krav = this.kravNu();
        if (i >= 0) {
            if (typeof krav !== "number") { this.kortBlink(); return false; }
            this.traek = { slags: "ethen", i: i, x: pt.x, y: pt.y, x0: pt.x, y0: pt.y };
            return true;
        }
        if (krav !== "afvist") { this.kortBlink(); return false; }
        this.traek = { slags: "brom", x: pt.x, y: pt.y, x0: pt.x, y0: pt.y };
        return true;
    };

    P.flytScene = function (pt) {
        if (this.traek) { this.traek.x = pt.x; this.traek.y = pt.y; }
    };

    P.opScene = function (pt) {
        var t = this.traek, klik;
        this.traek = null;
        if (!t) return;
        klik = Math.hypot(pt.x - t.x0, pt.y - t.y0) < 8;
        if (t.slags === "brom") {
            var B = this.lay.brom;
            if (klik || this.kaedeVed(pt, true)) {
                this.nulstilHjaelp();
                this.afvis = { t: 0, fra: klik ? { x: B.x + B.b / 2, y: B.y + B.h * 0.4 } : { x: pt.x, y: pt.y } };
                this.naesteLinje("", "");
            } else this.kortBesked("Slip brommolekylet oven på kæden.", 5);
            return;
        }
        var p = this.pulje[t.i];
        if (this.led === 0) {
            /* ingen kaede endnu: slip paa et andet molekyle, eller klik */
            var makker = -1, mig = this;
            if (klik) makker = this.naermeste(t.i);
            else this.pulje.forEach(function (q, j) {
                if (j !== t.i && q.til && Math.abs(pt.x - q.x) <= 2.3 * mig.uP && Math.abs(pt.y - q.y) <= 1.7 * mig.uP) makker = j;
            });
            if (makker < 0) { this.kortBesked("Slip ethenmolekylet oven på et andet ethenmolekyle.", 5); return; }
            this.saetPaa(t.i, klik ? { x: p.x, y: p.y } : { x: pt.x, y: pt.y }, false, makker);
            return;
        }
        if (klik) { this.saetPaa(t.i, { x: p.x, y: p.y }, false); return; }
        if (this.kaedeVed(pt, true)) { this.saetPaa(t.i, { x: pt.x, y: pt.y }, pt.x < this.lay.W / 2); return; }
        this.kortBesked("Slip ethenmolekylet ved en af kædens ender.", 5);
    };

    P.klikScene = function (pt) {
        if (!this.lay) return;
        if (this.zoom > 0.5) {
            this.kortBesked("Den lange streg er én kæde i polyethen: mange tusinde ethenmolekyler efter hinanden.", 6);
            return;
        }
        if (!this.kaedeVed(pt) || this.saml) return;
        if (this.gaetNu()) { this.kortBlink(); return; }
        this.kortBesked("Kæden er lavet af " + this.led + " ethenmolekyler. Hvert farvet felt kommer fra ét af dem, og der er kun enkeltbindinger mellem carbonatomerne.", 7);
    };

    NK.SimPlastik = SimPlastik;
}());
