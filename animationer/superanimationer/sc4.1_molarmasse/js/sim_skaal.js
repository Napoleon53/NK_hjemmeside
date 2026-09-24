/* =====================================================================
   sim_skaal.js - fane 2: skaalvaegten

   1 mol af to stoffer ligger i hver sin skaal. Vaegten er laast, og
   eleven forudsiger, hvilken side der synker: venstre, lige eller
   hoejre. Saa slippes laasen, armen svinger og falder til ro, og
   molarmasserne staar under skaalene.

   Parrene er valgt efter fejlen "flest atomer vejer mest": CH4 mod O2,
   H2 mod He, Ar mod K. En runde er ni par, tre fra hvert niveau.
   Skaalvaegten kan maerke 0,05 g (D.FOELSOMHED); mindre forskelle
   staar lige. Rekorden huskes under NOEGLE.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;

    var NOEGLE = "nk-sc4.1-skaal";
    var STIVHED = 26, DAEMPNING = 3.2;

    function SimSkaal() {
        this.L = new NK.Laerred(NK.el("skaal-laerred"));
        this.tid = 0;
        this.lay = null;
        this.over = null;
        this.vinkel = 0;
        this.fart = 0;
        this.rekord = (NK.hent(NOEGLE, {}) || {}).rekord || 0;
        this.g = { kaffekop: { skjult: true, iHaand: false } };

        this.bygPanel();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.nyRunde();
    }

    var P = SimSkaal.prototype;

    /* ----- Runden ---------------------------------------------------------- */
    P.nyRunde = function () {
        var runde = [];
        D.RUNDE.forEach(function (antal, niveau) {
            var puljen = NK.bland(D.PAR.filter(function (p) { return p.niveau === niveau; }));
            runde = runde.concat(puljen.slice(0, antal));
        });
        this.runde = runde.map(function (p) {
            var byt = Math.random() < 0.5;
            return { v: byt ? p.b : p.a, h: byt ? p.a : p.b, niveau: p.niveau, hvorfor: p.hvorfor };
        });
        this.nr = 0;
        this.point = 0;
        this.stime = 0;
        this.slut = false;
        this.nytPar();
    };

    P.nytPar = function () {
        this.par = this.runde[this.nr];
        this.svar = null;
        this.hjaelp = 0;
        this.visteSvar = false;
        this.laast = true;
        this.laasT = 0;
        this.vinkel = 0;
        this.fart = 0;
        this.besked("", "");
        if (this.lay) this.skalaMolekyler();
        this.visPanel();
    };

    /* Den side, der synker: "v", "l" eller "h" */
    P.facit = function () {
        var d = this.par.h.M - this.par.v.M;
        if (Math.abs(d) < D.FOELSOMHED) return "l";
        return d > 0 ? "h" : "v";
    };

    /* Den vinkel, armen falder til ro i. Positiv: hoejre side nede. */
    P.maalVinkel = function () {
        var d = this.par.h.M - this.par.v.M;
        if (Math.abs(d) < D.FOELSOMHED) return 0;
        var grader = 3 + 11 * (1 - Math.exp(-Math.abs(d) / 800));
        return (d > 0 ? 1 : -1) * grader * Math.PI / 180;
    };

    P.vaelgSvar = function (s) {
        if (this.slut || this.svar || !this.par) return;
        this.svar = s;
        var rigtigt = s === this.facit() && !this.visteSvar;
        this.rigtigt = rigtigt;
        if (rigtigt) { this.point++; this.stime++; } else { this.stime = 0; }
        this.laast = false;
        this.laasT = 0;
        var f = this.facit();
        var ord = { v: "venstre side synker", h: "højre side synker", l: "den står lige" };
        var start = this.visteSvar ? "Svaret: " + ord[f] + "." : (rigtigt ? "Rigtigt, " + ord[f] + "." : "Nej, " + ord[f] + ".");
        this.besked("<b>" + start + "</b> " + NK.html(this.par.hvorfor), this.visteSvar ? "gul" : (rigtigt ? "god" : "skidt"));
        if (this.nr === this.runde.length - 1) this.afslut();
        this.visPanel();
    };

    P.afslut = function () {
        var ny = this.point > this.rekord;
        if (ny) {
            this.rekord = this.point;
            NK.gem(NOEGLE, { rekord: this.rekord });
        }
        this.slutVent = { t: 2.4, rekord: ny && this.point > 0 };
    };

    P.knap = function () {
        if (this.slut) { this.nyRunde(); return; }
        if (this.svar) {
            if (this.nr >= this.runde.length - 1) {
                this.slut = true;
                this.besked("<b>Runden er slut: " + this.point + " af " + this.runde.length + " rigtige.</b>", this.point >= 6 ? "god" : "");
                this.visPanel();
                return;
            }
            this.nr++;
            this.nytPar();
            return;
        }
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.besked("<b>Hint:</b> Atommasserne står nu i beregningerne på skiltet. Regn dem ud for begge sider.", "gul");
            this.visPanel();
        } else {
            this.visteSvar = true;
            this.vaelgSvar(this.facit());
        }
    };

    P.nulstil = function () { this.nyRunde(); };

    /* ----- Panelet ---------------------------------------------------------- */
    P.bygPanel = function () {
        var mig = this;
        this.el = {
            knap: NK.el("skaal-knap"),
            besked: NK.el("skaal-besked"),
            valg: document.querySelectorAll("#skaal-valg .valgknap")
        };
        this.el.knap.addEventListener("click", function () { mig.knap(); });
        Array.prototype.forEach.call(this.el.valg, function (k) {
            k.addEventListener("click", function () { mig.vaelgSvar(k.getAttribute("data-svar")); });
        });
        NK.el("skaal-spring").addEventListener("click", function () { mig.springIntro(); });
    };

    P.besked = function (html, klasse) {
        this.el.besked.innerHTML = html;
        this.el.besked.className = "besked" + (klasse ? " " + klasse : "");
    };

    P.visPanel = function () {
        var mig = this, f = this.par ? this.facit() : null;
        NK.saetTekst("skaal-point", String(this.point));
        NK.saetTekst("skaal-nr", String(Math.min(this.nr + 1, this.runde.length)));
        NK.saetTekst("skaal-antal", String(this.runde.length));
        NK.saetTekst("skaal-stime", String(this.stime));
        NK.saetTekst("skaal-rekord", String(this.rekord));
        Array.prototype.forEach.call(this.el.valg, function (k) {
            var s = k.getAttribute("data-svar");
            k.disabled = !!mig.svar || mig.slut;
            k.classList.toggle("rigtig", !!mig.svar && s === f);
            k.classList.toggle("forkert", !!mig.svar && s === mig.svar && s !== f);
        });
        var tekst, klasse = "knap";
        if (this.slut) { tekst = "Ny runde"; klasse = "knap blaa banker"; }
        else if (this.svar) { tekst = this.nr >= this.runde.length - 1 ? "Se resultatet" : "Næste par →"; klasse = "knap blaa banker"; }
        else tekst = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
        this.el.knap.textContent = tekst;
        this.el.knap.className = klasse;
        NK.el("skaal-kort").classList.toggle("sejr", this.slut && this.point >= 6);
        this.visStatus();
    };

    P.visStatus = function () {
        if (!this.par) return;
        if (this.svar) {
            NK.saetHTML("skaal-status", NK.html("1 mol " + this.par.v.tekst + " vejer " + NK.komma(this.par.v.M) + " g, og 1 mol " +
                this.par.h.tekst + " vejer " + NK.komma(this.par.h.M) + " g."));
        } else {
            NK.saetHTML("skaal-status", "Hvilken side synker, når låsen slippes? Svar til højre, eller brug piletasterne.");
        }
    };

    /* Tastatur: pilene svarer, mens vaegten er laast */
    P.tast = function (key) {
        if (this.svar || this.slut) return false;
        if (key === "ArrowLeft") { this.vaelgSvar("v"); return true; }
        if (key === "ArrowRight") { this.vaelgSvar("h"); return true; }
        if (key === "ArrowDown") { this.vaelgSvar("l"); return true; }
        return false;
    };

    P.enter = function () { if (this.svar || this.slut) this.knap(); };
    P.fokus = function () {};

    /* ----- Layout --------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var kant = NK.klamp(W * 0.014, 8, 16);
        /* Bordet staar lidt hoejere end paa de andre faner, saa skiltet med
           beregningerne kan sidde paa bordets forside */
        lay.bordY = Math.round(H - NK.klamp(H * 0.16, 58, 120));
        lay.p = Tg.plakatLay(kant, kant, W - 2 * kant, H * 0.34);
        var zoneTop = lay.p.y + lay.p.h + NK.klamp(H * 0.02, 6, 16);
        /* Ved 14,5 grader loefter armen sig 0,25 L og saenker sig lige saa
           meget, og skaalen haenger 0,985 L under krogen (medregnet bunden).
           Knivsaeggen staar midt i det interval, hvor intet rammer plakaten
           eller bordet. */
        var A = lay.bordY - zoneTop;
        var L = NK.klamp(Math.min(W * 0.28, (A - 22) / 1.485, 300), 70, 300);
        var sk = 0.9 * L / NK.Sprites.MAAL.skaal_skaal.fladeB;
        var x = Math.round(W * 0.56);
        x = NK.klamp(x, L + 80 * sk + kant, W - L - 80 * sk - kant);
        var yMin = zoneTop + 0.25 * L + 8;
        var yMax = lay.bordY - 12 - 1.235 * L;
        var y = yMax > yMin ? (yMin + yMax) / 2 : yMin;
        var Mf = NK.Sprites.MAAL.skaal_fod;
        lay.v = { x: x, y: y, L: L, sk: sk, k: (lay.bordY - y) / (Mf.bund - Mf.aegY) };
        /* Skiltet paa bordets forside: én linje pr. skaal */
        var sb = Math.min(W - 2 * kant, 820);
        lay.skilt = { x: NK.klamp(x - sb / 2, kant, W - kant - sb), y: lay.bordY + 16, b: sb, h: H - lay.bordY - 22 };
        this.lay = lay;
        this.skalaMolekyler();

        this.saetAnker("skaal-anker-vaegt", x - L - 80 * sk, y - 30, 2 * L + 160 * sk, lay.bordY - y + 30);
        this.saetAnker("skaal-anker-kort", lay.skilt.x, lay.skilt.y, lay.skilt.b, lay.skilt.h);
        this.saetAnker("skaal-anker-plakat", lay.p.x, lay.p.y, lay.p.b, lay.p.h);
    };

    P.saetAnker = function (id, x, y, b, h) {
        var e = NK.el(id);
        if (!e) return;
        e.style.left = Math.round(x) + "px";
        e.style.top = Math.round(y) + "px";
        e.style.width = Math.round(b) + "px";
        e.style.height = Math.round(h) + "px";
    };

    P.tilpas = function () {
        if (this.L.tilpas() || !this.lay) this.layout();
    };

    /* Samme stoerrelse paa begge molekyler, saa de kan sammenlignes */
    P.skalaMolekyler = function () {
        var lay = this.lay, v = lay.v, par = this.par;
        if (!par) return;
        var b = 148 * v.sk * 1.05, h = (140 * v.sk - 18) * 0.85;
        var loft = NK.klamp(lay.H * 0.075, 30, 60);
        this.u = Math.min(Tg.strukturSkala(par.v.struktur, b, h, loft), Tg.strukturSkala(par.h.struktur, b, h, loft));
    };

    /* ----- Tegneloekken ------------------------------------------------------ */
    P.opdater = function (dt) {
        this.tid += dt;
        if (!this.laast) {
            this.laasT = Math.min(1, this.laasT + dt / 0.35);
            if (this.laasT >= 1) {
                var maal = this.maalVinkel();
                var trin = Math.max(1, Math.ceil(dt / 0.005)), h = dt / trin;
                for (var i = 0; i < trin; i++) {
                    var a = -STIVHED * (this.vinkel - maal) - DAEMPNING * this.fart;
                    this.fart += a * h;
                    this.vinkel += this.fart * h;
                }
            }
        }
        if (this.slutVent) {
            this.slutVent.t -= dt;
            if (this.slutVent.t <= 0 && this.laererSlut) {
                var sv = this.slutVent;
                this.slutVent = null;
                this.laererSlut(this.point, sv.rekord);
            }
        }
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
    };

    P.tegn = function () {
        var L = this.L, ctx = L.ctx, lay = this.lay;
        if (!lay || !this.par) return;
        var mig = this;
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 6);
        Tg.plakat(ctx, lay.p, { tid: this.tid, lys: this.over && this.over.slags === "celle" ? this.over.s : null });
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.H + 10);

        var v = lay.v, vinkel = this.vinkel;
        var fl = Tg.skaalFlader(v, vinkel);

        Tg.skaalvaegtFod(ctx, v, vinkel);

        /* Laasen: to stolper under skaalene, der trykkes ned, naar den slippes */
        var stolpe = 1 - NK.blod(this.laasT);
        if (stolpe > 0.01) {
            var fl0 = Tg.skaalFlader(v, 0);
            fl0.forEach(function (f) {
                var top = f.y + 18 * v.sk;
                var hh = (lay.bordY - top) * stolpe;
                ctx.fillStyle = "#6e531f";
                ctx.fillRect(f.x - 3, lay.bordY - hh, 6, hh);
                ctx.fillStyle = "#c9a24f";
                NK.rundtRekt(ctx, f.x - 12, lay.bordY - hh - 4, 24, 5, 2);
                ctx.fill();
                ctx.fillStyle = "#3d2f16";
                NK.rundtRekt(ctx, f.x - 14, lay.bordY - 5, 28, 6, 2);
                ctx.fill();
            });
        }

        this.tegnSkilt(ctx);

        Tg.skaalvaegtArm(ctx, v, vinkel);
        var u = this.u || 20;
        [this.par.v, this.par.h].forEach(function (st, i) {
            Tg.skaalvaegtSkaal(ctx, v, fl[i]);
            Tg.molekyle(ctx, st.struktur, fl[i].x, 0, u, {}, mig.molekylPladser(st, fl[i], u));
        });

        this.tegnBobler(ctx);
        if (this.laererTegnOver) this.laererTegnOver(ctx);
    };

    /* Molekylet hviler paa skaalens flade */
    P.molekylPladser = function (st, flade, u) {
        var m = Tg.strukturMaal(st.struktur);
        var cy = flade.y - 3 - (m.y1 - m.my) * u;
        return st.struktur.atomer.map(function (a) {
            return { x: flade.x + (a[1] - m.mx) * u, y: cy + (a[2] - m.my) * u };
        });
    };

    /* Regnestykket for massen af 1 mol, skrevet som en pæn beregning:
       m = 1 mol · (2 · 1,01 + 16,00) g/mol = 18,02 g
       trin 0: foer hintet, 1: hintet, 2: efter svaret */
    P.regnestykke = function (st, trin) {
        if (trin === 0) return { venstre: "m = 1 mol · M(" + st.tekst + ")", resultat: "" };
        var led = st.orden.map(function (s) {
            var n = st.antal[s], m = NK.komma(D.grundstof(s).m);
            return n > 1 ? n + " · " + m : m;
        });
        var M = led.length > 1 ? "(" + led.join(" + ") + ")" : led[0];
        return { venstre: "m = 1 mol · " + M + " g/mol", resultat: trin === 2 ? "= " + NK.komma(st.M) + " g" : "" };
    };

    /* Skiltet: én linje pr. skaal med pilen, stoffet og beregningen, og
       beregningerne staar under hinanden. Skriften er den stoerste, der
       kan vaere der. par: et andet par end det aktuelle (til selvtesten). */
    var PIL_PAD = 12;
    P.skiltPlan = function (ctx, trin, par) {
        var lay = this.lay, s = lay.skilt, mig = this;
        par = par || this.par;
        var raekker = [["←", par.v], ["→", par.h]].map(function (r) {
            var rg = mig.regnestykke(r[1], trin);
            return { pil: r[0], titel: r[1].tekst + " " + r[1].navn, regn: rg.resultat ? rg.venstre + " " + rg.resultat : rg.venstre };
        });
        var px = NK.klamp((s.h - 8) / 2 / 1.3, 9, 16);
        var maal;
        function maalAlt() {
            ctx.font = "700 " + px + "px 'Segoe UI', sans-serif";
            var titelB = Math.max.apply(null, raekker.map(function (r) { return ctx.measureText(r.titel).width; }));
            var pilB = ctx.measureText("→").width + px * 0.6;
            ctx.font = "600 " + px + "px 'Segoe UI', sans-serif";
            var regnB = Math.max.apply(null, raekker.map(function (r) { return ctx.measureText(r.regn).width; }));
            return { titelB: titelB, pilB: pilB, regnB: regnB, i_alt: 2 * PIL_PAD + pilB + titelB + px * 1.2 + regnB };
        }
        maal = maalAlt();
        while (px > 9 && maal.i_alt > s.b) {
            px -= 0.5;
            maal = maalAlt();
        }
        maal.px = px;
        maal.raekker = raekker;
        return maal;
    };

    /* Skiltet paa bordets forside. Beregningen staar foer hintet som
       m = 1 mol · M(H2O), hintet saetter atommasserne ind, og svaret
       giver resultatet. */
    P.tegnSkilt = function (ctx) {
        var s = this.lay.skilt;
        var trin = this.svar ? 2 : (this.hjaelp > 0 ? 1 : 0);
        var plan = this.skiltPlan(ctx, trin);
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fillRect(s.x + 3, s.y + 4, s.b, s.h);
        ctx.fillStyle = "#fbfbf7";
        NK.rundtRekt(ctx, s.x, s.y, s.b, s.h, 5);
        ctx.fill();
        var lh = s.h / 2;
        var x0 = s.x + PIL_PAD, xRegn = x0 + plan.pilB + plan.titelB + plan.px * 1.2;
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        plan.raekker.forEach(function (r, i) {
            var y = s.y + lh * (i + 0.5);
            ctx.fillStyle = i === 0 ? "#3d9ee0" : "#e6892a";
            ctx.fillRect(s.x + 1, s.y + (i === 0 ? 1 : lh), 5, lh - 1);
            ctx.font = "700 " + plan.px + "px 'Segoe UI', sans-serif";
            ctx.fillText(r.pil, x0, y);
            ctx.fillStyle = "#1c1f26";
            ctx.fillText(r.titel, x0 + plan.pilB, y);
            ctx.font = "600 " + plan.px + "px 'Segoe UI', sans-serif";
            ctx.fillStyle = ["#7a808a", "#6a5210", "#1d7a48"][trin];
            ctx.fillText(r.regn, xRegn, y);
        });
        ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(s.x + 8, s.y + lh);
        ctx.lineTo(s.x + s.b - 8, s.y + lh);
        ctx.stroke();
        ctx.restore();
    };

    P.tegnBobler = function (ctx) {
        var u = this.over, lay = this.lay;
        if (u && u.slags === "celle") Tg.plakatBoble(ctx, lay.p, u.s, lay.W);
    };

    /* ----- Musen ---------------------------------------------------------------- */
    P.hvadErUnder = function (pt) {
        var lay = this.lay;
        if (!lay) return null;
        if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return { slags: "laerer" };
        var s = Tg.plakatCelle(lay.p, pt.x, pt.y);
        if (s) return { slags: "celle", s: s };
        return null;
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointermove", function (e) {
            mig.over = mig.hvadErUnder(mig.L.punkt(e));
            c.style.cursor = mig.over && mig.over.slags === "laerer" ? "pointer" : "default";
        });
        c.addEventListener("pointerleave", function () { mig.over = null; c.style.cursor = "default"; });
        c.addEventListener("click", function (e) {
            var pt = mig.L.punkt(e);
            if (mig.laererIntroKlik && mig.laererIntroKlik(pt.x, pt.y)) return;
            if (mig.laererKlik) mig.laererKlik(pt.x, pt.y);
        });
    };

    /* ----- Kemichaels praesentation ---------------------------------------- */
    P.startIntro = function (tving) {
        if (!this.laererIntro) return;
        if (!tving && NK.hent("nk-sc4.1-intro-skaal", false)) return;
        NK.gem("nk-sc4.1-intro-skaal", true);
        this.introVent = tving ? 0.1 : 0.9;
    };

    P.springIntro = function () {
        this.introVent = 0;
        return !!(this.laererIntroVaek && this.laererIntroVaek());
    };

    P.opdaterIntro = function (dt) {
        if (this.introVent > 0) {
            this.introVent -= dt;
            if (this.introVent <= 0 && this.laererIntro) this.laererIntro();
        }
        var iIntro = !!(this.laererIIntro && this.laererIIntro());
        if (iIntro !== this.visesSpring) {
            this.visesSpring = iIntro;
            NK.el("skaal-spring").hidden = !iIntro;
        }
        NK.el("skaal-valg").classList.toggle("peg", iIntro && this.introTrin === 2);
    };

    NK.SimSkaal = SimSkaal;
}());
