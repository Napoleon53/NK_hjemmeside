/* =====================================================================
   sim_regn.js - fane 3: Regn paa Y

   En tavle i scenen (HTML, saa eleven kan skrive i felterne) med
   reaktionsskemaet, oplysningerne, reaktionsbroeken og regnestykket, og
   under tavlen tallinjen med Y og K. Hvert maal gaar i trin som i
   Kemibogens eksempel i B2.4: vaelg reaktionsbroeken (brok), skriv
   koncentrationerne ind i broeken og regn Y ud (felter), og sammenlign
   med K (spm). To maal har et indgreb foer regnestykket (forsoeg: Pump
   ... ind).

   Felterne har rigtig broekstreg (brugerens regel om broekfelter), og
   enheden M staar efter hvert felt. Resultatet skrives med enhed, naar
   Y har en.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var M = NK.Model;
    var Tg = NK.Tegn;

    var LOEB = 2.6;   /* sekunder, Y bruger paa at naa K, naar maalet er loest */

    function SimRegn() {
        var mig = this;
        this.tavle = NK.el("r-tavle");
        this.tavle.addEventListener("click", function (e) {
            if (e.target.closest && e.target.closest("#r-pump")) { mig.pump(); return; }
            if (e.target.closest && e.target.closest("#r-tjek")) { mig.tjek(); }
        });
        this.tavle.addEventListener("keydown", function (e) {
            if (e.key === "Enter" && e.target.tagName === "INPUT") { e.preventDefault(); mig.tjek(); }
        });
        this.tavle.addEventListener("input", function (e) {
            if (e.target.tagName === "INPUT") { e.target.classList.remove("forkert"); mig.nulstilHjaelp(); }
        });
        this.startFane(D.R_MAAL);
    }

    var P = SimRegn.prototype;
    NK.Fane.paa(P, { navn: "r", naesteFane: "fane-i", naesteNavn: "Indgreb" });

    function tal(v) {
        if (v > 0 && v < 0.001) return NK.potens(v, 2);
        return NK.betydende(v, 2);
    }
    P.tal = tal;

    /* Det, eleven skriver: et tal (dansk komma, potens med · 10^ eller e) og
       eventuelt en enhed bagefter */
    P.tolk = function (s) {
        var t = NK.ascii(s || "").replace(/\s+/g, " ").trim();
        var m = /^([+-]?\d*(?:[.,]\d+)?|[+-]?\d+[.,]?)\s*(?:(?:·|\*|x|×)\s*10\s*\^?\s*([+-]?\d+))?\s*(?:[eE]\s*([+-]?\d+))?\s*(.*)$/.exec(t);
        if (!m || !m[1] || !/\d/.test(m[1])) return { tom: !t, v: NaN, enhed: t };
        var v = parseFloat(m[1].replace(",", "."));
        if (m[2]) v *= Math.pow(10, parseInt(m[2], 10));
        if (m[3]) v *= Math.pow(10, parseInt(m[3], 10));
        var e = (m[4] || "").replace(/\s+/g, "").replace(/\^/g, "").replace(/²/g, "2");
        if (/^mol\/?l$/i.test(e)) e = "M";
        if (/^mol2\/?l2$/i.test(e)) e = "M2";
        return { tom: false, v: v, enhed: e };
    };

    function ens(a, b) { return Math.abs(a - b) <= 1e-6 * Math.max(Math.abs(a), Math.abs(b), 1e-12); }

    /* ----- Maalene ------------------------------------------------------------------ */
    P.nyOpgave = function (o) {
        this.r = D.REAK[o.r];
        this.c = JSON.parse(JSON.stringify(o.c));
        this.pumpet = false;
        this.regnet = false;
        this.yVis = null;
        this.loebT = 0;
        this.byg();
    };

    P.nyFase = function () { this.byg(); };
    P.efterOpgave = function () { this.loebT = 0; this.byg(); };
    P.nulstilScene = function () { this.nyOpgave(this.opg.o); };

    /* ----- Tavlen -------------------------------------------------------------------- */
    function broekHTML(r) {
        var over = r.over.map(function (d) { return "[" + d.f + "]" + (d.n > 1 ? NK.haevet(d.n) : ""); }).join(" · ");
        var under = r.under.map(function (d) { return "[" + d.f + "]" + (d.n > 1 ? NK.haevet(d.n) : ""); }).join(" · ");
        return D.brok(over, under);
    }

    P.byg = function () {
        var o = this.opg.o, r = this.r, g = this.opg, mig = this;
        var fase = this.faerdig ? "slut" : g.fase;
        /* Linje 1: reaktionsskemaet */
        NK.saetHTML("r-skema", NK.html(r.skema));
        /* Linje 2: K og koncentrationerne. Efter indgrebet staar tallet foer
           indgrebet med lille skrift under det nye. */
        var html = '<span class="rt-chip k">K = ' + NK.html(r.Ktekst) + "</span>";
        var harIndgreb = !!o.efter;
        if (harIndgreb) html += '<span class="rt-etiket">' + (this.pumpet ? "Lige efter indgrebet:" : "Ligevægt:") + "</span>";
        var stoffer = r.under.concat(r.over);
        stoffer.forEach(function (d) {
            var nu = mig.c[d.s], skiftet = harIndgreb && mig.pumpet && !ens(o.c[d.s], o.efter[d.s]);
            html += '<span class="rt-chip' + (skiftet ? " ny" : "") + '">[' + d.f + "] = " + tal(nu) + " M" +
                (skiftet ? '<small>før: ' + tal(o.c[d.s]) + " M</small>" : "") + "</span>";
        });
        if (o.forsoeg && !this.pumpet && fase === "forsoeg") {
            var om = this.omNu().indexOf("pump") >= 0;
            html += '<button type="button" class="tidknap rt-pump' + (om ? " om" : "") + '" id="r-pump">Pump ' + D.REAK[o.r].over.concat(D.REAK[o.r].under).filter(function (d) { return d.s === o.forsoeg.pump; })[0].f + " ind ▶</button>";
        }
        NK.saetHTML("r-oplyst", html);
        /* Linje 3: reaktionsbroeken (kendt eller fundet i brok) */
        var broekKendt = o.givet || !o.brok || g.faser.indexOf("brok") < g.fi || this.faerdig;
        if (o.brok && g.fase === "brok" && g.rigtig !== undefined) broekKendt = true;
        NK.saetHTML("r-formel", '<span class="rt-v">Y =</span>' + (broekKendt ? broekHTML(r) : '<span class="rt-sp">?</span>') +
            (o.givet && !this.faerdig ? '<span class="rt-note">Der er ligevægt før indgrebet, så Y = K.</span>' : ""));
        /* Linje 4: regnestykket. Felterne bygges én gang pr. maal, saa det,
           eleven skriver, bliver staaende. */
        var regn = NK.el("r-regn");
        var vis = g.faser.indexOf("felter") <= g.fi || this.faerdig;
        if (vis && !this.feltByg) this.bygFelter();
        if (!vis) { regn.innerHTML = ""; this.feltByg = false; }
        regn.style.visibility = vis ? "visible" : "hidden";
        var laast = this.regnet || this.faerdig || g.fase !== "felter";
        Array.prototype.forEach.call(regn.querySelectorAll("input"), function (f) { f.disabled = laast; });
        var tj = NK.el("r-tjek");
        if (tj) tj.hidden = laast;
        regn.classList.toggle("loest", this.regnet);
        this.visTrin();
    };

    P.bygFelter = function () {
        var r = this.r;
        function led(d) {
            var f = '<input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" class="rt-felt" data-s="' + d.s + '" aria-label="[' + d.f + ']">' +
                '<span class="rt-enh">M</span>';
            return d.n > 1 ? '<span class="rt-par">(</span>' + f + '<span class="rt-par">)' + NK.haevet(d.n) + "</span>" : f;
        }
        var over = r.over.map(led).join('<span class="rt-gange">·</span>');
        var under = r.under.map(led).join('<span class="rt-gange">·</span>');
        var broek = under ? '<span class="brok felter"><span class="bt">' + over + '</span><span class="bn">' + under + "</span></span>" :
            '<span class="brok enkel felter">' + over + "</span>";
        var html = '<span class="rt-v">Y =</span>' + broek + '<span class="rt-v">=</span>' +
            '<input type="text" autocomplete="off" spellcheck="false" class="rt-felt res" data-s="Y" aria-label="Y">' +
            '<button type="button" class="tjekknap" id="r-tjek">Tjek</button>';
        NK.el("r-regn").innerHTML = html;
        this.feltByg = true;
    };

    P.felt = function (s) { return NK.el("r-regn").querySelector('input[data-s="' + s + '"]'); };

    /* Panelet: trinene i maalet */
    P.visTrin = function () {
        var g = this.opg, o = g.o, mig = this;
        var trin = [];
        if (o.brok) trin.push(["brok", "Vælg reaktionsbrøken"]);
        if (o.forsoeg) trin.push(["forsoeg", "Lav indgrebet"]);
        trin.push(["felter", "Sæt tallene ind, og regn Y ud"]);
        trin.push(["spm", "Sammenlign Y med K"]);
        if (o.spm2) trin.push(["spm2", "Et fast stof"]);
        var html = "";
        trin.forEach(function (t, i) {
            var idx = g.faser.indexOf(t[0]);
            var klar = mig.faerdig || idx < g.fi || (idx === g.fi && mig.venter);
            var nu = !klar && idx === g.fi;
            html += '<div class="trin-raekke' + (klar ? " klar" : "") + (nu ? " nu" : "") + '"><span class="tr-nr">' + (klar ? "✓" : i + 1) + "</span>" + t[1] + "</div>";
        });
        NK.saetHTML("r-trin", html);
    };

    /* ----- Indgrebet ----------------------------------------------------------------- */
    P.pump = function () {
        var o = this.opg.o;
        if (this.spaer()) return;
        if (!o.efter || this.pumpet) return;
        this.c = JSON.parse(JSON.stringify(o.efter));
        this.pumpet = true;
        this.byg();
        this.forsoegKlaret("");
        this.byg();
    };

    P.forsoegSvar = function () {
        var o = this.opg.o;
        if (!this.pumpet && o.efter) {
            this.c = JSON.parse(JSON.stringify(o.efter));
            this.pumpet = true;
        }
        this.byg();
    };

    /* ----- Tjek af regnestykket ------------------------------------------------------- */
    P.tjek = function () {
        var g = this.opg, r = this.r, mig = this;
        if (this.faerdig || g.fase !== "felter" || this.regnet) return;
        var led = r.over.concat(r.under), fejl = null;
        /* Tomme felter */
        led.forEach(function (d) {
            var f = mig.felt(d.s);
            if (!fejl && !f.value.trim()) { fejl = { f: f, t: "Skriv [" + d.f + "] i feltet under [" + d.f + "] i reaktionsbrøken." }; }
        });
        /* Hvert felt skal have koncentrationen af sit eget stof */
        if (!fejl) led.forEach(function (d) {
            if (fejl) return;
            var f = mig.felt(d.s), t = mig.tolk(f.value);
            if (isNaN(t.v)) { fejl = { f: f, t: "Skriv et tal i feltet ved [" + d.f + "], fx 0,10." }; return; }
            if (t.enhed && t.enhed.toUpperCase() !== "M") { fejl = { f: f, t: "Skriv kun tallet. Enheden M står allerede efter feltet." }; return; }
            if (!ens(t.v, mig.c[d.s])) {
                /* Et tal fra et andet stof: foerst paa samme side af broekstregen */
                var side = r.over.indexOf(d) >= 0 ? r.over : r.under;
                var andet = side.concat(led).filter(function (e) { return e.s !== d.s && ens(t.v, mig.c[e.s]); })[0];
                fejl = { f: f, t: andet ? "Feltet ved [" + d.f + "] skal have koncentrationen af " + d.f + ", ikke af " + andet.f + "." :
                    "Tallet ved [" + d.f + "] passer ikke. Find [" + d.f + "] i oplysningerne på tavlen." };
            }
        });
        var res = this.felt("Y"), Ys = this.opg.o.Y;
        if (!fejl) {
            var t = this.tolk(res.value);
            if (!res.value.trim()) fejl = { f: res, t: "Regn brøken ud, og skriv Y i feltet efter lighedstegnet." };
            else if (isNaN(t.v)) fejl = { f: res, t: "Skriv Y som et tal, fx 0,50." };
            else if (Math.abs(t.v - Ys) > 0.02 * Ys) {
                var uden = M.Y({ over: r.over.map(function (d) { return { s: d.s, n: 1 }; }), under: r.under }, this.c);
                if (r.over.some(function (d) { return d.n > 1; }) && Math.abs(t.v - uden) <= 0.02 * uden) fejl = { f: res, t: "Husk, at [NO₂] står i anden. Gang tallet med sig selv, før du deler." };
                else if (Math.abs(t.v - 1 / Ys) <= 0.02 / Ys) fejl = { f: res, t: "Du har regnet brøken på hovedet. Det, der står over brøkstregen, skal deles med det, der står under." };
                else fejl = { f: res, t: "Regn efter. Gang tallene over brøkstregen, gang tallene under, og del." };
            } else {
                var e = (t.enhed || "").replace(/\s+/g, "").toUpperCase();
                var skal = r.enhed === "M²" ? "M2" : r.enhed;
                if (!skal && e) fejl = { f: res, t: "Y har ingen enhed her, fordi enhederne over og under brøkstregen går ud med hinanden." };
                else if (skal === "M" && e !== "M") fejl = { f: res, t: "Husk enheden. Over brøkstregen står M², under står M, så Y har enheden M." };
                else if (skal === "M2" && e !== "M2") fejl = { f: res, t: "Husk enheden. M · M giver M², så skriv M2 eller M² efter tallet." };
            }
        }
        if (fejl) {
            fejl.f.classList.add("forkert");
            this.fejlLinje(fejl.t);
            try { fejl.f.focus(); } catch (x) { /* intet fokus */ }
            return;
        }
        this.regnetRigtigt("selv");
    };

    P.regnetRigtigt = function () {
        var r = this.r;
        this.regnet = true;
        this.yVis = this.opg.o.Y;
        var res = this.felt("Y"), mig = this;
        res.value = tal(this.opg.o.Y) + (r.enhed ? " " + r.enhed : "");
        /* Tallene staar bagefter med dansk komma, som i en pæn beregning */
        r.over.concat(r.under).forEach(function (d) { mig.felt(d.s).value = tal(mig.c[d.s]); });
        Array.prototype.forEach.call(NK.el("r-regn").querySelectorAll("input"), function (f) { f.classList.remove("forkert"); f.classList.add("rigtig"); });
        this.naesteFase();
        this.godLinje("Y = " + res.value + ". Nu skal Y sammenlignes med K.");
        this.byg();
    };

    P.felterSvar = function (o) {
        var mig = this, r = this.r;
        if (!this.feltByg) this.bygFelter();
        r.over.concat(r.under).forEach(function (d) { mig.felt(d.s).value = tal(mig.c[d.s]); });
        this.regnetRigtigt("svar");
        void o;
    };

    P.fokusFelt = function () {
        if (this.opg.fase !== "felter" || this.regnet || this.faerdig) return;
        var f = Array.prototype.filter.call(NK.el("r-regn").querySelectorAll("input"), function (x) { return !x.value.trim() || x.classList.contains("forkert"); })[0];
        if (f) { try { f.focus({ preventScroll: true }); } catch (x) { /* intet fokus */ } }
    };

    P.enter = function () { this.tjek(); };

    /* ----- Scenen -------------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, Hs = this.baand().y;
        var lay = { W: W, H: this.L.h, Hs: Hs };
        lay.y0 = 10 + this.kortZone() + 8;
        lay.tb = Math.min(W - 40, 820);
        lay.tx = (W - lay.tb) / 2;
        this.tavle.style.left = Math.round(lay.tx) + "px";
        this.tavle.style.top = Math.round(lay.y0) + "px";
        this.tavle.style.width = Math.round(lay.tb) + "px";
        lay.tlW = Math.min(W - 70, 700);
        lay.tlX = (W - lay.tlW) / 2;
        this.lay = lay;
        this.byg();
        this.ankre();
    };

    /* Tallinjen staar under tavlen; tavlens hoejde maales */
    P.tlY = function () {
        var lay = this.lay, hT = this.tavle.offsetHeight || 220;
        return Math.min(lay.y0 + hT + 62, lay.Hs - 62);
    };

    P.ankre = function () {
        var lay = this.lay, y = this.tlY();
        this.saetAnker("tallinje", lay.tlX - 10, y - 40, lay.tlW + 20, 100);
        this.saetAnker("tavle", lay.tx, lay.y0, lay.tb, this.tavle.offsetHeight || 220);
    };

    P.opdaterScene = function (dt) {
        if (this.faerdig) this.loebT += dt;
        this.byg();
    };

    /* Y paa tallinjen: efter regnestykket, og naar maalet er loest, glider Y
       hen til K, fordi reaktionen forloeber */
    P.yNu = function () {
        if (this.yVis === null) return null;
        var K = this.r.K, Y = this.yVis;
        if (!this.faerdig) return Y;
        var t = NK.blod(Math.max(0, this.loebT - 0.6) / LOEB);
        return Math.exp(Math.log(Y) + (Math.log(K) - Math.log(Y)) * t);
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        ctx.fillStyle = "#14141a";
        ctx.fillRect(0, 0, lay.W, lay.H);
        var tlY = this.tlY();
        var y = this.yNu(), o = this.opg.o, K = this.r.K;
        var loeber = this.faerdig && y !== null && Math.abs(Math.log(y / K)) > 0.01;
        Tg.tallinje(ctx, lay.tlX, tlY, lay.tlW, {
            K: K, Ktekst: this.r.Ktekst,
            Y: y,
            yTekst: y === null ? "Y" : (this.faerdig && Math.abs(Math.log(y / K)) <= 0.01 && !ens(this.yVis, K) ? "Y = K" : "Y = " + tal(this.yVis) + (this.r.enhed ? " " + this.r.enhed : "")),
            foer: o.efter && this.pumpet ? K : null,
            maal: loeber
        });
        this.ankre();
        if (this.omNu().indexOf("tallinje") >= 0) Tg.omRing(ctx, lay.tlX - 8, tlY - 40, lay.tlW + 16, 86, 12);
        if (this.faerdig && y !== null && !ens(this.yVis, K)) {
            var tekst = this.yVis < K ? "Reaktionen går mod højre, indtil Y = K." : "Reaktionen går mod venstre, indtil Y = K.";
            NK.tekst(ctx, tekst, lay.W / 2, tlY + 74, { font: Tg.font("700", 14), farve: this.yVis < K ? Tg.HOEJRE : Tg.VENSTRE, justering: "center" });
        }
        this.tegnSejr(ctx, lay.W, lay.Hs);
    };

    /* Et klik i scenen uden for tavlen goer intet */
    P.klikScene = function () {};

    NK.SimRegn = SimRegn;
}());
