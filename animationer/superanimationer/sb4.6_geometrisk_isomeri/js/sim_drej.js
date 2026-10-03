/* =====================================================================
   sim_drej.js - fane 1: dobbeltbindingen

   Kuglemodellen af to C-atomer og deres grupper, set lidt fra siden.
   Tre slags opgaver:

     drej  eleven tager fat i den hoejre halvdel og drejer den om
           bindingen i midten. En enkeltbinding drejer frit; en
           dobbeltbinding fjedrer tilbage, og stregerne bliver roede.
     to    to molekyler side om side (cis og trans). Er de det samme stof?
           Svaret viser kogepunkterne.
     byt   eleven bytter de to grupper til venstre, vender hele molekylet
           og sammenligner med et omrids af molekylet, som det var. Er
           det et nyt stof?

   Rummet: x mod hoejre langs bindingen, y nedad, z ind i skaermen.
   En gruppe sidder i vinklen phi rundt om bindingen: 0 er oppe, 180
   nede, 90 inde bag C-atomet.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = NK.T;
    var GRAD = Math.PI / 180;

    var C_KUGLE = { farve: "#3b4049", r: 22, tekst: "#ffffff" };
    var ENHED = 60;            /* kuglernes radius i data er i pixels ved s = ENHED */

    function SimDrej() {
        var mig = this;
        this.valg = NK.el("dr-valg");
        this.startFane(D.DREJ, D.DREJ_GRUPPER);
        this.vaelg(0);
        window.addEventListener("resize", function () { mig.layout(); });
    }

    var P = SimDrej.prototype;
    NK.Fane.paa(P, { navn: "dr", naesteFane: "fane-pr", naesteNavn: "Prioriteten" });

    P.chipTekst = function (o, i) { return String(i + 1); };

    /* ----- Opgaven ------------------------------------------------------------------- */
    P.lavOpgave = function (i) {
        var o = this.opgaver[i];
        this.o = o;
        this.theta = (o.drej || 0) * GRAD;   /* hoejre halvdel: elevens drejning */
        this.thetaVis = this.theta;          /* det, der vises (fjedrer ved en dobbeltbinding) */
        this.spaending = 0;
        this.proevet = false;
        this.hold = null;
        this.roert = false;
        this.venstre = o.v ? o.v.slice() : null;
        this.byttet = false;
        this.byt = null;                     /* { t } mens grupperne bytter plads */
        this.psi = 0;                        /* hele molekylet vendt om bindingen */
        this.psiMaal = 0;
        this.svar = null;
        this.autoMaal = null;
        this.bygValg();
    };

    P.bygValg = function () {
        var mig = this, o = this.o;
        this.valg.innerHTML = "";
        function knap(tekst, klasse, fn) {
            var k = document.createElement("button");
            k.type = "button";
            k.className = "valgknap" + (klasse ? " " + klasse : "");
            k.textContent = tekst;
            k.addEventListener("click", function () { fn(); mig.fokus(); });
            mig.valg.appendChild(k);
            return k;
        }
        this.knapper = {};
        if (o.slags === "to") {
            this.knapper.samme = knap("Det samme stof", "", function () { mig.svarTo("samme"); });
            this.knapper.to = knap("To forskellige stoffer", "", function () { mig.svarTo("to"); });
        } else if (o.slags === "byt") {
            this.knapper.vend = knap("Vend hele molekylet ↻", "vend", function () { mig.vend(); });
            this.knapper.samme = knap("Samme stof", "", function () { mig.svarByt("samme"); });
            this.knapper.nyt = knap("Nyt stof", "", function () { mig.svarByt("nyt"); });
        }
        this.valg.hidden = !this.valg.children.length;
    };

    P.promptHTML = function () {
        return '<p class="maal-tekst">' + NK.html(this.o.maal) + "</p>";
    };

    P.trinLinje = function () {
        var o = this.o;
        if (o.slags === "byt" && this.byttet) return "Tryk Vend hele molekylet, og sammenlign med det grå omrids. Svar så Samme stof eller Nyt stof.";
        return o.trin;
    };

    /* ----- Hinttrappen -------------------------------------------------------------- */
    P.hintTrin = function () {
        var o = this.o;
        if (o.id === "d1") return [
            "Tag fat i en af kuglerne på det højre C-atom med musen.",
            "Træk op eller ned. Hele den højre halvdel drejer om bindingen i midten.",
            "Bliv ved, til CH₃ til højre står øverst ligesom CH₃ til venstre."
        ];
        if (o.id === "d2") return [
            "Tag fat i CH₃ nederst til højre med musen.",
            "Træk den op. Mærk, at molekylet fjedrer tilbage.",
            "Træk hårdt. Dobbeltbindingen kan ikke drejes, for så skulle den ene af de to bindinger brydes."
        ];
        if (o.slags === "to") return [
            "Se på de to Cl i A og i B.",
            "I A sidder begge Cl øverst. I B sidder det ene øverst og det andet nederst.",
            "Dobbeltbindingen kan ikke drejes, så A kan ikke blive til B. Det er to forskellige stoffer."
        ];
        if (!this.byttet) return [
            "Træk CH₃ til venstre ned på H, eller klik på den. Så bytter de plads.",
            "Det grå omrids viser molekylet, som det var før byttet.",
            "Byt først. Vend så hele molekylet, og sammenlign med omridset."
        ];
        var hoejre = o.h.map(D.tekst).join(" og ");
        return [
            "Tryk Vend hele molekylet. Det må man gerne: det er det samme molekyle, bare set fra den anden side.",
            "Passer alle kuglerne med det grå omrids, er det det samme stof. Se især på " + hoejre + " til højre.",
            o.svar === "samme" ? "Til højre sidder " + hoejre + ". De er ens, så molekylet passer med omridset. Det er det samme stof." :
                "Til højre sidder " + hoejre + ". De passer ikke med omridset, og dobbeltbindingen kan ikke drejes. Det er et nyt stof."
        ];
    };

    P.visSvar = function () {
        var o = this.o;
        if (o.id === "d1") { this.autoMaal = 0; this.auto = true; return; }
        if (o.id === "d2") { this.proevet = true; this.ryk = 1; this.faerdigD2(); return; }
        if (o.slags === "to") { this.svarTo("to", true); return; }
        if (!this.byttet) this.startByt();
        this.psiMaal = Math.PI;
        this.svarByt(o.svar, true);
    };

    /* ----- Molekylet som kugler i rummet ------------------------------------------------- */
    function retning(side, alfa, phi) {
        return [side * Math.cos(alfa), -Math.sin(alfa) * Math.cos(phi), Math.sin(alfa) * Math.sin(phi)];
    }

    /* cfg: { binding, v, h, theta, psi, byt (0-1 eller null) } -> atomer og bindinger */
    function byg(cfg) {
        var d = cfg.binding === 2 ? 0.67 : 0.77;
        var alfa = (cfg.binding === 2 ? 60 : 70.5) * GRAD;
        var phis = cfg.binding === 2 ? [0, 180] : [0, 120, 240];
        var atomer = [
            { p: [-d, 0, 0], id: "C", side: "c", k: 0 },
            { p: [d, 0, 0], id: "C", side: "c", k: 1 }
        ];
        var bindinger = [];
        function laengde(id) { return id === "H" ? 0.86 : 1.02; }
        cfg.v.forEach(function (id, k) {
            var r = retning(-1, alfa, phis[k] * GRAD);
            var L = laengde(id);
            var p = [-d + r[0] * L, r[1] * L, r[2] * L];
            if (cfg.byt !== null && cfg.byt !== undefined && k < 2) {
                /* Grupperne bytter plads ude til venstre, den ene foran og den anden bagved */
                var t = NK.blod(cfg.byt);
                var r2 = retning(-1, alfa, phis[1 - k] * GRAD), L2 = laengde(id);
                var q = [-d + r2[0] * L2, r2[1] * L2, r2[2] * L2];
                var buk = Math.sin(Math.PI * t);
                p = [NK.lerp(p[0], q[0], t) - buk * 0.75, NK.lerp(p[1], q[1], t), NK.lerp(p[2], q[2], t) + (k === 0 ? -1 : 1) * buk * 0.55];
            }
            atomer.push({ p: p, id: id, side: "v", k: k });
            bindinger.push({ a: 0, b: atomer.length - 1, orden: 1 });
        });
        cfg.h.forEach(function (id, k) {
            var r = retning(1, alfa, phis[k] * GRAD + cfg.theta);
            var L = laengde(id);
            atomer.push({ p: [d + r[0] * L, r[1] * L, r[2] * L], id: id, side: "h", k: k });
            bindinger.push({ a: 1, b: atomer.length - 1, orden: 1 });
        });
        bindinger.push({ a: 0, b: 1, orden: cfg.binding });
        if (cfg.psi) atomer.forEach(function (a) { a.p = T.drejX(a.p, cfg.psi); });
        return { atomer: atomer, bindinger: bindinger, d: d };
    }

    /* Til selvtesten: molekylet som kugler i rummet */
    P.molekyle = function (cfg) { return byg(cfg); };

    P.cfg = function (ekstra) {
        var o = this.o;
        var c = { binding: o.binding, v: this.venstre || o.v, h: o.h, theta: this.thetaVis, psi: this.psi,
                  byt: this.byt ? this.byt.t : null };
        if (ekstra) for (var k in ekstra) c[k] = ekstra[k];
        return c;
    };

    /* ----- Layout --------------------------------------------------------------------- */
    P.layout = function () {
        var L = this.L;
        var baand = this.baand();
        var valgH = this.valg.hidden ? 0 : 64;
        var top = 16, bund = this.L.h - Math.max(baand.h, 92) - valgH - 4;
        var h = Math.max(160, bund - top);
        this.lay = { cx: L.b / 2, cy: top + h * 0.5, h: h, top: top, bund: bund };
        var s = Math.min(L.b * 0.17, h * 0.27);
        if (this.o && this.o.slags === "to") s = Math.min(L.b * 0.105, h * 0.22);
        this.lay.s = s;
        this.valg.style.bottom = (baand.h + 12) + "px";
        this.saetAnker("model", L.b * 0.12, top, L.b * 0.76, h);
    };

    P.kamera = function (cx, cy, s, yaw) {
        return { cx: cx, cy: cy, s: s, f: 7, yaw: yaw === undefined ? -24 * GRAD : yaw, pitch: 13 * GRAD };
    };

    /* ----- Musen -------------------------------------------------------------------- */
    /* De projicerede kugler for det store molekyle (forrest foerst) */
    P.kugler = function () {
        var m = byg(this.cfg());
        var kam = this.kamera(this.lay.cx, this.lay.cy, this.lay.s);
        var ud = m.atomer.map(function (a) {
            var pr = T.projekter(a.p, kam);
            var kug = a.id === "C" ? C_KUGLE : D.G[a.id].kugle;
            return { a: a, x: pr.x, y: pr.y, r: kug.r * pr.k * kam.s / ENHED, z: pr.z };
        });
        ud.sort(function (p, q) { return p.z - q.z; });
        return ud;
    };

    P.ramt = function (pt) {
        if (!pt || this.o.slags === "to") return null;
        var k = this.kugler();
        for (var i = 0; i < k.length; i++) {
            if (Math.hypot(pt.x - k[i].x, pt.y - k[i].y) <= k[i].r + 6) return k[i];
        }
        return null;
    };

    P.overScene = function (pt) {
        var k = this.ramt(pt);
        this.over = k ? k.a : null;
        if (!k || this.faerdig) return null;
        if (this.o.slags === "drej" && (k.a.side === "h" || (k.a.side === "c" && k.a.k === 1))) return "greb";
        if (this.o.slags === "byt" && k.a.side === "v" && !this.byt) return "greb";
        return "peg";
    };

    P.nedScene = function (pt) {
        if (this.faerdig || this.auto) return false;
        var k = this.ramt(pt);
        if (!k) return false;
        var o = this.o;
        if (o.slags === "drej" && (k.a.side === "h" || (k.a.side === "c" && k.a.k === 1))) {
            this.hold = { type: "drej", y: pt.y, phi: k.a.side === "h" ? k.a.k : 0, start: pt };
            this.roert = true;
            return true;
        }
        if (o.slags === "byt" && k.a.side === "v" && !this.byt) {
            this.hold = { type: "byt", k: k.a.k, start: pt, pt: pt };
            this.roert = true;
            return true;
        }
        return false;
    };

    P.flytScene = function (pt) {
        var g = this.hold;
        if (!g || this.faerdig) return;
        if (g.type === "drej") {
            var dy = pt.y - g.y;
            g.y = pt.y;
            /* Den kugle, der holdes, foelger musen: dy = sin(phi) dphi */
            var phis = this.o.binding === 2 ? [0, 180] : [0, 120, 240];
            var phi = phis[g.phi] * GRAD + this.theta;
            var s = Math.sin(phi);
            var fortegn = s >= -0.05 ? 1 : -1;
            this.theta += fortegn * dy * 1.15 * GRAD;
            this.nulstilHjaelp();
            if (this.o.binding === 2 && Math.abs(this.theta) > 55 * GRAD && !this.proevet) {
                this.proevet = true;
                this.besked('<span class="b-maerke">Fast</span> Dobbeltbindingen kan ikke drejes. Den ene af de to bindinger skulle brydes. Slip musen.', "gul");
            }
        } else if (g.type === "byt") {
            g.pt = pt;
        }
    };

    P.opScene = function (pt) {
        var g = this.hold;
        this.hold = null;
        if (!g) return;
        var flyttet = Math.hypot(pt.x - g.start.x, pt.y - g.start.y);
        if (g.type === "drej") {
            if (this.o.binding === 2) {
                if (this.proevet) this.faerdigD2();
                else if (flyttet < 6) this.kortBesked("Tag fat i kuglen, og træk op eller ned.", 4);
                else this.kortBesked("Træk længere. Kan du få CH₃ helt op?", 4);
            } else if (flyttet < 6) {
                this.kortBesked("Hold musen nede på kuglen, og træk op eller ned.", 4);
            }
            return;
        }
        if (g.type === "byt") {
            var andet = this.ramt(pt);
            if (flyttet < 6 || (andet && andet.a.side === "v" && andet.a.k !== g.k)) this.startByt();
            else this.kortBesked("Slip " + D.tekst(this.venstre[g.k]) + " oven på den anden gruppe til venstre, så bytter de plads.", 4);
        }
    };

    P.klikScene = function (pt) {
        var k = this.ramt(pt);
        if (!k) return;
        if (k.a.id === "C") { this.kortBesked("Et C-atom. Bindingen i midten er en " + (this.o.binding === 2 ? "dobbeltbinding." : "enkeltbinding."), 4); return; }
        if (this.o.slags === "drej" && k.a.side === "v") { this.kortBesked("Den venstre halvdel står fast. Tag fat i den højre.", 4); return; }
        if (this.o.slags === "byt" && k.a.side === "h") { this.kortBesked("Byt om på de to grupper til venstre.", 4); return; }
    };

    /* ----- Handlingerne ---------------------------------------------------------------- */
    P.startByt = function () {
        if (this.byt || this.byttet) {
            if (this.byttet) this.kortBesked("Grupperne har byttet plads. Tryk Forfra for at starte igen.", 4);
            return;
        }
        this.byt = { t: 0 };
        this.nulstilHjaelp();
    };

    P.vend = function () {
        if (this.faerdig && this.o.slags !== "byt") return;
        this.psiMaal = this.psiMaal ? 0 : Math.PI;
        this.vendt = true;
        if (!this.byttet && !this.byt) this.kortBesked("Hele molekylet vender. Byt så om på de to grupper til venstre.", 4);
    };

    P.svarTo = function (svar, vist) {
        if (this.faerdig) return;
        this.svar = svar;
        if (svar === "to") {
            this.loest("A og B er to forskellige stoffer: cis-1,2-dichlorethen koger ved 60 °C og trans-1,2-dichlorethen ved 48 °C. " +
                "Dobbeltbindingen kan ikke drejes, så det ene kan ikke blive til det andet.");
            this.markerValg("to", true);
        } else {
            this.markerValg("samme", false);
            this.fejlLinje("Se på de to Cl. I A sidder de på samme side, i B på hver sin side. Kan A drejes over i B?");
        }
        if (vist) this.markerValg("to", true);
    };

    P.svarByt = function (svar, vist) {
        if (this.faerdig) return;
        if (!this.byttet && !vist) {
            this.kortBesked("Byt først om på CH₃ og H til venstre. Træk den ene ned på den anden.", 4);
            return;
        }
        var o = this.o;
        if (svar === o.svar) {
            this.markerValg(svar, true);
            var tekst = {
                d4: "De to H på det højre C-atom er ens. Vendt om passer molekylet med omridset, så det er det samme stof. Propen har ingen cis/trans-isomeri.",
                d5: "Byttet laver cis-but-2-en om til trans-but-2-en. Selv vendt om passer det ikke med omridset, så det er et nyt stof.",
                d6: "Det højre C-atom har to ens CH₃. Vendt om passer molekylet med omridset, så det er det samme stof."
            }[o.id];
            if (vist) this.psiMaal = Math.PI;
            this.loest(tekst);
        } else {
            this.markerValg(svar, false);
            if (o.svar === "samme") this.fejlLinje("Vend hele molekylet, og se på det grå omrids. Til højre sidder " + o.h.map(D.tekst).join(" og ") + ". De er ens, så alle kuglerne passer.");
            else this.fejlLinje("Vend hele molekylet, og se på det grå omrids. CH₃ til højre passer ikke, og dobbeltbindingen kan ikke drejes.");
        }
    };

    P.markerValg = function (svar, rigtig) {
        var k = this.knapper[svar];
        if (!k) return;
        k.classList.remove("rigtig", "forkert");
        k.classList.add(rigtig ? "rigtig" : "forkert");
    };

    P.faerdigD2 = function () {
        if (this.faerdig) return;
        this.loest("Dobbeltbindingen kan ikke drejes. De to CH₃ bliver på hver sin side. Det er grunden til, at der findes to former af but-2-en.");
    };

    P.efterOpgave = function () {
        this.auto = false;
        this.visKnap();
    };

    /* ----- Tiden ---------------------------------------------------------------------- */
    P.opdaterScene = function (dt) {
        var o = this.o;
        if (o.slags === "drej") {
            if (this.autoMaal !== null) {
                /* Vis svaret: drej den korteste vej hen til CH₃ oppe (theta = 0) */
                var maal = this.theta - vinkelForskel(this.theta);
                this.theta = NK.mod(this.theta, maal, 3, dt);
            }
            if (o.binding === 2) {
                var maks = 20 * GRAD;
                if (!this.hold) this.theta = NK.mod(this.theta, 0, 7, dt);
                this.thetaVis = maks * Math.tanh(this.theta / maks);
                this.spaending = Math.min(1, Math.abs(this.theta) / (50 * GRAD));
                if (this.ryk) { this.ryk = Math.max(0, this.ryk - dt * 1.5); this.thetaVis += Math.sin(this.tid * 40) * 6 * GRAD * this.ryk; }
            } else {
                this.thetaVis = this.theta;
                /* Loest: CH₃ til hoejre (phi 0 + drejning) staar oppe */
                var v = vinkelForskel(this.theta);
                if (!this.faerdig && Math.abs(v) < (this.autoMaal !== null ? 2 : 22) * GRAD) {
                    this.hold = null;
                    this.theta = Math.round(this.theta / (2 * Math.PI)) * 2 * Math.PI;
                    this.thetaVis = this.theta;
                    this.autoMaal = null;
                    this.loest("De to CH₃ står nu på samme side. En enkeltbinding kan drejes frit, så butan med CH₃ på samme side og på hver sin side er det samme stof.");
                }
            }
        }
        if (this.byt) {
            this.byt.t += dt * 1.4;
            if (this.byt.t >= 1) {
                this.byt = null;
                this.venstre = [this.venstre[1], this.venstre[0]];
                this.byttet = true;
                this.naesteLinje("", "");
            }
        }
        this.psi = NK.mod(this.psi, this.psiMaal, 5, dt);
        if (Math.abs(this.psi - this.psiMaal) < 0.002) this.psi = this.psiMaal;
    };

    function vinkelForskel(v) {
        v = ((v + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
        return v;
    }

    /* ----- Tegningen ------------------------------------------------------------------ */
    P.tegn = function () {
        var L = this.L, ctx = L.ctx, o = this.o;
        L.ryd("#14141a");
        if (o.slags === "to") { this.tegnTo(ctx); return; }

        var kam = this.kamera(this.lay.cx, this.lay.cy, this.lay.s);
        /* Omridset: molekylet, som det var, foer der blev byttet */
        var sammenlign = null;
        if (o.slags === "byt" && (this.byttet || this.byt)) {
            var spoeg = byg({ binding: o.binding, v: o.v, h: o.h, theta: 0, psi: 0, byt: null });
            this.tegnMolekyle(ctx, spoeg, kam, { omrids: true });
            if (this.byttet && Math.abs(this.psi - this.psiMaal) < 0.01) sammenlign = spoeg;
        }
        var m = byg(this.cfg());
        this.tegnMolekyle(ctx, m, kam, { sammenlign: sammenlign, spaending: this.spaending, over: this.over });
        if (!this.faerdig && !this.roert && !this.hold) this.tegnPil(ctx, m, kam);

        /* Bindingens navn under molekylet */
        NK.tekst(ctx, o.binding === 2 ? "dobbeltbinding" : "enkeltbinding", this.lay.cx, this.lay.bund - 6,
            { font: "600 14px 'Segoe UI', sans-serif", farve: "#7e8590", justering: "center" });
        NK.tekst(ctx, o.navn, this.lay.cx, this.lay.top + 22,
            { font: "700 20px 'Segoe UI', sans-serif", farve: "#cfd6de", justering: "center" });
    };

    /* En stiplet pil, der viser, hvad der kan traekkes, til eleven har roert noget */
    P.tegnPil = function (ctx, m, kam) {
        var o = this.o, fra = null, til = null, ud = 1;
        function skaerm(p) { return T.projekter(p, kam); }
        if (o.slags === "drej") {
            var k = o.h.indexOf("CH3");
            var a = m.atomer.filter(function (x) { return x.side === "h" && x.k === k; })[0];
            /* Maalet: der, hvor CH3 til hoejre staar, naar den er drejet op */
            var phis = o.binding === 2 ? [0, 180] : [0, 120, 240];
            var maal = byg({ binding: o.binding, v: o.v, h: o.h, theta: -phis[k] * GRAD, psi: 0, byt: null });
            var b = maal.atomer.filter(function (x) { return x.side === "h" && x.k === k; })[0];
            fra = skaerm(a.p); til = skaerm(b.p);
        } else if (o.slags === "byt") {
            var v0 = m.atomer.filter(function (x) { return x.side === "v" && x.k === 0; })[0];
            var v1 = m.atomer.filter(function (x) { return x.side === "v" && x.k === 1; })[0];
            fra = skaerm(v0.p); til = skaerm(v1.p); ud = -1;
        }
        if (!fra) return;
        var puls = 0.55 + 0.45 * Math.sin(this.tid * 3.2);
        var mx = (fra.x + til.x) / 2 + ud * Math.abs(til.y - fra.y) * 0.45, my = (fra.y + til.y) / 2;
        var r = 26 * kam.s / ENHED;
        ctx.save();
        ctx.globalAlpha = puls;
        ctx.strokeStyle = T.GUL;
        ctx.fillStyle = T.GUL;
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        /* Start og slut lidt uden for kuglerne */
        var sx = fra.x + ud * r * 0.9, sy = fra.y + (til.y > fra.y ? r * 0.4 : -r * 0.4);
        var ex = til.x + ud * r * 0.9, ey = til.y + (til.y > fra.y ? -r * 0.4 : r * 0.4);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(mx + ud * r, my, ex, ey);
        ctx.stroke();
        ctx.setLineDash([]);
        var v = Math.atan2(ey - my, ex - (mx + ud * r));
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - 14 * Math.cos(v - 0.45), ey - 14 * Math.sin(v - 0.45));
        ctx.lineTo(ex - 14 * Math.cos(v + 0.45), ey - 14 * Math.sin(v + 0.45));
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };

    /* opt: omrids (kun stiplede ringe), sammenlign (molekyle at sammenligne med:
       groen ring, hvor gruppen passer, roed, hvor den ikke goer), spaending (0-1)

       Pindene starter og slutter ved kuglernes overflade (i rummet), og hver
       pind tegnes lige efter den bageste af sine to kugler. Bogstaverne
       tegnes til sidst, medmindre en kugle laengere fremme daekker dem. */
    P.tegnMolekyle = function (ctx, m, kam, opt) {
        opt = opt || {};
        var pr = m.atomer.map(function (a) {
            var p = T.projekter(a.p, kam);
            var kug = a.id === "C" ? C_KUGLE : D.G[a.id].kugle;
            return { a: a, x: p.x, y: p.y, k: p.k, z: p.z, r: kug.r * p.k * kam.s / ENHED, rm: kug.r / ENHED, kug: kug };
        });
        var ting = [];
        m.bindinger.forEach(function (b) {
            var za = pr[b.a].z, zb = pr[b.b].z;
            ting.push({ slags: "b", b: b, z: Math.max(za, zb) - 0.001 });
        });
        pr.forEach(function (p, i) { ting.push({ slags: "a", i: i, z: p.z }); });
        ting.sort(function (p, q) { return q.z - p.z; });

        /* En pind i rummet fra kugle A til kugle B, afkortet ved overfladerne */
        function pind3(pa, pb, ra, rb, oa, ob, bred, farve) {
            var d = [pb[0] - pa[0], pb[1] - pa[1], pb[2] - pa[2]];
            var L = Math.hypot(d[0], d[1], d[2]) || 1;
            var u = [d[0] / L, d[1] / L, d[2] / L];
            var s = [pa[0] + u[0] * ra * 0.8 + oa[0], pa[1] + u[1] * ra * 0.8 + oa[1], pa[2] + u[2] * ra * 0.8 + oa[2]];
            var e = [pb[0] - u[0] * rb * 0.8 + ob[0], pb[1] - u[1] * rb * 0.8 + ob[1], pb[2] - u[2] * rb * 0.8 + ob[2]];
            var ps = T.projekter(s, kam), pe = T.projekter(e, kam);
            T.pind(ctx, ps.x, ps.y, pe.x, pe.y, bred, farve);
        }

        var mig = this;
        ting.forEach(function (t) {
            if (t.slags === "b") {
                var A = pr[t.b.a], B = pr[t.b.b];
                var bred = 9 * (A.k + B.k) / 2 * kam.s / ENHED;
                if (opt.omrids) {
                    ctx.save();
                    ctx.setLineDash([5, 5]);
                    ctx.strokeStyle = "rgba(220,226,235,0.35)";
                    ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
                    ctx.restore();
                    return;
                }
                var pa = m.atomer[t.b.a].p, pb = m.atomer[t.b.b].p;
                if (t.b.orden === 2) {
                    /* To pinde i molekylets plan. Til hoejre foelger de drejningen */
                    var o1 = [0, -0.13, 0], o2 = T.drejX([0, -0.13, 0], mig.thetaVis);
                    if (mig.psi) { o1 = T.drejX(o1, mig.psi); o2 = T.drejX(o2, mig.psi); }
                    var farve = opt.spaending ? lerpFarve("#9aa3ad", "#e05446", opt.spaending) : "#9aa3ad";
                    [1, -1].forEach(function (sgn) {
                        pind3(pa, pb, A.rm * 0.7, B.rm * 0.7, [o1[0] * sgn, o1[1] * sgn, o1[2] * sgn],
                            [o2[0] * sgn, o2[1] * sgn, o2[2] * sgn], bred * 0.72, farve);
                    });
                } else {
                    pind3(pa, pb, A.rm, B.rm, [0, 0, 0], [0, 0, 0], bred, "#9aa3ad");
                }
                return;
            }
            var p = pr[t.i], a = p.a;
            if (opt.omrids) {
                if (a.id !== "C") T.kugle(ctx, p.x, p.y, p.r, p.kug.farve, "", { omrids: true });
                return;
            }
            var ring = null;
            if (opt.sammenlign && a.id !== "C") {
                var match = null;
                opt.sammenlign.atomer.forEach(function (s) {
                    if (s.id === "C") return;
                    var dd = Math.hypot(s.p[0] - a.p[0], s.p[1] - a.p[1], s.p[2] - a.p[2]);
                    if (dd < 0.3) match = s;
                });
                if (match) ring = match.id === a.id ? T.GROEN : T.ROED;
            } else if (opt.over === a && !mig.faerdig &&
                ((mig.o.slags === "drej" && (a.side === "h" || (a.side === "c" && a.k === 1))) || (mig.o.slags === "byt" && a.side === "v" && !mig.byttet))) {
                ring = "rgba(242,197,61,0.8)";
            }
            T.kugle(ctx, p.x, p.y, p.r, p.kug.farve, "", { ring: ring });
        });

        /* Bogstaverne: kun dem, ingen kugle laengere fremme daekker */
        if (!opt.omrids) {
            pr.forEach(function (p) {
                var daekket = pr.some(function (q) {
                    return q !== p && q.z < p.z - 0.05 && Math.hypot(q.x - p.x, q.y - p.y) < q.r * 0.85;
                });
                if (daekket) return;
                T.kugleTekst(ctx, p.x, p.y, p.r, p.a.id === "C" ? "C" : D.tekst(p.a.id), p.kug.tekst);
            });
        }

        /* Den gruppe, der holdes under et byt, foelger musen som en lille brik */
        if (this.hold && this.hold.type === "byt" && this.hold.pt) {
            var id = this.venstre[this.hold.k];
            var kg = D.G[id].kugle;
            T.kugle(ctx, this.hold.pt.x, this.hold.pt.y, kg.r * kam.s / ENHED * 0.9, kg.farve, D.tekst(id), { tekstFarve: kg.tekst, alfa: 0.75 });
        }
    };

    function lerpFarve(a, b, t) {
        var x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
        var r = Math.round(NK.lerp((x >> 16) & 255, (y >> 16) & 255, t));
        var g = Math.round(NK.lerp((x >> 8) & 255, (y >> 8) & 255, t));
        var bl = Math.round(NK.lerp(x & 255, y & 255, t));
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1);
    }

    /* To molekyler side om side, der vipper lidt, saa de ses i rummet */
    P.tegnTo = function (ctx) {
        var o = this.o, lay = this.lay, L = this.L;
        var yaw = -24 * GRAD + Math.sin(this.tid * 0.8) * 18 * GRAD;
        var mig = this;
        [["A", o.a, 0.28, 0], ["B", o.b, 0.72, 1]].forEach(function (x) {
            var kam = mig.kamera(L.b * x[2], lay.cy - lay.h * 0.04, lay.s, yaw);
            var m = byg({ binding: 2, v: x[1].v, h: x[1].h, theta: 0, psi: 0, byt: null });
            mig.tegnMolekyle(ctx, m, kam, {});
            NK.tekst(ctx, x[0], L.b * x[2], lay.top + 28, { font: "800 26px 'Segoe UI', sans-serif", farve: "#f2c53d", justering: "center" });
            if (mig.faerdig) {
                var navn = x[3] === 0 ? "cis-1,2-dichlorethen" : "trans-1,2-dichlorethen";
                NK.tekst(ctx, navn, L.b * x[2], lay.bund - 34, { font: "700 17px 'Segoe UI', sans-serif", farve: "#e9eee9", justering: "center" });
                NK.tekst(ctx, "koger ved " + o.kog[x[3]] + " °C", L.b * x[2], lay.bund - 10, { font: "600 16px 'Segoe UI', sans-serif", farve: "#b8f0cf", justering: "center" });
            }
        });
        /* Skillelinje */
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.beginPath();
        ctx.moveTo(L.b / 2, lay.top + 10);
        ctx.lineTo(L.b / 2, lay.bund - 10);
        ctx.stroke();
        ctx.restore();
    };

    P.fokusFelt = function () { /* ingen felter paa denne fane */ };

    NK.SimDrej = SimDrej;
}());
