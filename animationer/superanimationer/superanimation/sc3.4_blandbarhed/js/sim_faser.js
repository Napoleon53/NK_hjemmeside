/* =====================================================================
   sim_faser.js - fane 2: varme, kogepunkt og destillation

   En kolbe med molekyler i staar paa en varmeplade. Drejeknappen paa
   pladen saetter dens temperatur; vaesken foelger efter. Naar den
   naar kogepunktet, bliver den staaende dér, saa laenge der er vaeske
   tilbage: al varmen gaar til at rive molekylerne fri af hinanden.

   Dampen gaar op gennem halsen og ud i sidearmen. I koeleren bliver
   den til draaber, der drypper ned i modtageglasset.

   Er der to stoffer i kolben, fordeler dampen sig efter, hvor langt
   hvert stof er over sit eget kogepunkt:

       vaegt(stof) = mL · e^(0,06 · (T − kogepunkt))

   Derfor er det foerste, der kommer over, rigt paa det stof, der koger
   ved den laveste temperatur. Det er destillation.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = NK.Tegn;
    var M = NK.Mol;

    var K = T.MAAL_FASER;

    var RUMFANG = 250;           /* kolbens rumfang i mL */
    var START_ML = 90;           /* der haeldes saa meget i */
    var GRUND_SKALA = 7;         /* tegneenheder pr. binding */
    var TAU = 7.5;              /* sekunder: hvor traegt vaesken foelger pladen */
    var T_MIN = -130, T_MAKS = 360;   /* fasestregens akse i panelet */

    /* Varmepladens ti trin. 0 er slukket (stuetemperatur). */
    function pladeTemp(trin) { return trin <= 0 ? 20 : 20 + trin * 28; }

    /* ------------------------------------------------------------------
       VALGENE: de fem rene vaesker og én blanding
       ------------------------------------------------------------------ */
    var VALG = [
        { id: "vand",    dele: [["vand", 1]] },
        { id: "ethanol", dele: [["ethanol", 1]] },
        { id: "hexanol", dele: [["hexanol", 1]] },
        { id: "heptan",  dele: [["heptan", 1]] },
        { id: "olie",    dele: [["olie", 1]] },
        { id: "blanding", navn: "vand + ethanol", dele: [["vand", 0.5], ["ethanol", 0.5]] }
    ];

    function valgNavn(v) {
        return v.navn || D.vaeske(v.id).navn;
    }

    /* ------------------------------------------------------------------
       SIMULATIONEN
       ------------------------------------------------------------------ */
    NK.SimFaser = function () {
        this.L = new NK.Laerred(NK.el("faser-laerred"));
        this.br = NK.Brat(this.L);
        this.tid = 0;

        this.valgNr = 5;              /* blandingen som udgangspunkt */
        this.trin = 0;
        this.temp = 20;
        this.koger = false;
        this.visDelta = false;

        this.kolbe = {};              /* id -> mL */
        this.modtag = {};             /* id -> mL */
        this.mol = [];                /* molekylerne i kolben */
        this.slags = {};              /* id -> { r, skala, mLprMol, form } */
        this.iArmen = [];             /* damp og draaber paa vej til glasset */
        this.bobler = [];
        this.rest = {};               /* fordampning, der endnu ikke fylder ét molekyle */

        this.mus = { x: 0, y: 0, inde: false };
        this.traekKnap = false;
        this.besked = "";
        this.beskedUr = 0;

        this.koblPanel();
        this.koblMus();
        this.tilpas();
        if (this.laererStart) this.laererStart();
        this.fyld();
        this.opgaver = new NK.Opgaver("faser", OPGAVER, this, "Faser og kogepunkt");
        this.opdaterPanel();
    };

    var Pr = NK.SimFaser.prototype;

    Pr.tilpas = function () {
        this.L.tilpas();
        this.br = NK.Brat(this.L);
    };

    Pr.valg = function () { return VALG[this.valgNr]; };

    /* ----- Fyld kolben op igen ------------------------------------------- */
    Pr.fyld = function () {
        var valg = this.valg();
        var flaskeAreal = Math.PI * Math.pow(K.r - K.vaeg, 2);
        var i;

        this.kolbe = {};
        this.modtag = {};
        this.mol = [];
        this.slags = {};
        this.iArmen = [];
        this.bobler = [];
        this.rest = {};
        this.temp = 20;
        this.koger = false;

        for (i = 0; i < valg.dele.length; i++) {
            var id = valg.dele[i][0];
            var mL = START_ML * valg.dele[i][1];
            var v = D.vaeske(id);
            var form = M.form(v);

            /* Molekylerne skal fylde lige saa stor en del af kolben, som
               vaesken goer. Store molekyler fylder mest, og der er
               derfor faerre af dem i den samme mL. */
            var areal = flaskeAreal * (mL / RUMFANG) * 0.80;
            var antal = NK.klamp(Math.round(areal / (Math.PI * Math.pow(form.yder * GRUND_SKALA, 2))), 6, 150);
            var r = Math.sqrt(areal / (Math.PI * antal));

            this.kolbe[id] = mL;
            this.rest[id] = 0;
            this.slags[id] = {
                form: form, r: r, skala: r / form.yder,
                mLprMol: mL / antal, farve: v.farve
            };
            for (var j = 0; j < antal; j++) this.nytMolekyle(id);
        }
        this.opdaterPanel();
    };

    Pr.nytMolekyle = function (id) {
        var s = this.slags[id];
        var vinkel = Math.random() * Math.PI * 2;
        var l = Math.sqrt(Math.random()) * (K.r - K.vaeg - s.r);
        this.mol.push({
            id: id, form: s.form, r: s.r, skala: s.skala,
            x: K.cx + Math.cos(vinkel) * l,
            y: K.cy + Math.sin(vinkel) * l * 0.6 + 40,
            vx: 0, vy: 0,
            vinkel: Math.random() * Math.PI * 2,
            dv: NK.r(-0.6, 0.6),
            gas: false
        });
    };

    Pr.mLIKolben = function () {
        var s = 0;
        for (var id in this.kolbe) {
            if (Object.prototype.hasOwnProperty.call(this.kolbe, id)) s += this.kolbe[id];
        }
        return s;
    };

    Pr.mLIGlasset = function () {
        var s = 0;
        for (var id in this.modtag) {
            if (Object.prototype.hasOwnProperty.call(this.modtag, id)) s += this.modtag[id];
        }
        return s;
    };

    /* Det stof i kolben, der koger ved den laveste temperatur. */
    Pr.lavesteKp = function () {
        var lav = Infinity;
        for (var id in this.kolbe) {
            if (this.kolbe[id] > 0.05) lav = Math.min(lav, D.vaeske(id).kp);
        }
        return lav;
    };

    /* ----- Panelet --------------------------------------------------------- */
    Pr.koblPanel = function () {
        var mig = this;

        var vaert = NK.el("faser-valg");
        VALG.forEach(function (valg, i) {
            var v = valg.dele.length === 1 ? D.vaeske(valg.id) : null;
            var b = document.createElement("button");
            b.type = "button";
            b.className = "vaeskeknap";
            b.innerHTML = '<span class="vformel"></span><span class="vnavn"></span>';
            b.querySelector(".vformel").textContent = v ? v.formel : "H₂O + C₂H₅OH";
            b.querySelector(".vnavn").textContent = valgNavn(valg);
            b.style.setProperty("--v-farve", v ? v.farve : "#8f8ad6");
            b.addEventListener("click", function () { mig.vaelg(i); });
            vaert.appendChild(b);
        });

        NK.el("faser-trin").addEventListener("input", function () {
            mig.saetTrin(parseFloat(this.value));
        });
        NK.el("faser-forfra").addEventListener("click", function () { mig.fyld(); });
        NK.el("faser-delta").addEventListener("change", function () {
            mig.visDelta = this.checked;
        });
    };

    Pr.vaelg = function (i) {
        if (i === this.valgNr) return;
        this.valgNr = i;
        this.trin = 0;
        NK.el("faser-trin").value = "0";
        this.fyld();
    };

    Pr.saetTrin = function (t) {
        this.trin = NK.klamp(Math.round(t), 0, 10);
        NK.el("faser-trin").value = String(this.trin);
        if (NK.Lyd) NK.Lyd.kontakt();
    };

    Pr.nulstil = function () { this.fyld(); };

    Pr.sig = function (tekst) {
        this.besked = tekst;
        this.beskedUr = tekst ? 6 : 0;
    };

    /* ----- Musen ------------------------------------------------------------ */
    Pr.koblMus = function () {
        var mig = this;
        var c = this.L.canvas;

        function pos(e) {
            var r = c.getBoundingClientRect();
            return NK.tilBord(mig.br, e.clientX - r.left, e.clientY - r.top);
        }

        c.addEventListener("mousemove", function (e) {
            var p = pos(e);
            mig.mus.x = p.x; mig.mus.y = p.y; mig.mus.inde = true;
            if (mig.traekKnap) mig.knapFraMus(p);
        });
        c.addEventListener("mouseleave", function () { mig.mus.inde = false; mig.traekKnap = false; });

        c.addEventListener("mousedown", function (e) {
            var p = pos(e);
            mig.mus.x = p.x; mig.mus.y = p.y;
            var r = c.getBoundingClientRect();
            if (mig.laererKlik && mig.laererKlik(e.clientX - r.left, e.clientY - r.top)) return;

            var kn = T.pladeKnap();
            if (Math.hypot(p.x - kn.x, p.y - kn.y) < kn.r + 9) {
                mig.traekKnap = true;
                mig.knapFraMus(p);
            }
        });
        window.addEventListener("mouseup", function () { mig.traekKnap = false; });
    };

    /* Knappen foelger musen: vinklen om knappens midte bliver til et trin. */
    Pr.knapFraMus = function (p) {
        var kn = T.pladeKnap();
        var v = Math.atan2(p.x - kn.x, -(p.y - kn.y));      /* 0 er lodret op */
        var t = NK.klamp((v + 2.2) / 4.4, 0, 1);
        this.saetTrin(Math.round(t * 10));
    };

    Pr.knapVinkel = function () { return -2.2 + (this.trin / 10) * 4.4; };

    /* ----- Tiden ------------------------------------------------------------ */
    Pr.opdater = function (dt) {
        this.tid += dt;
        if (this.beskedUr > 0) {
            this.beskedUr -= dt;
            if (this.beskedUr <= 0) this.besked = "";
        }

        this.opdaterTemperatur(dt);
        this.opdaterFordampning(dt);
        this.opdaterMolekyler(dt);
        this.opdaterArmen(dt);
        this.opdaterBobler(dt);

        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        if (this.opgaver) this.opgaver.opdater();
        this.opdaterTal();
    };

    Pr.opdaterTemperatur = function (dt) {
        var maal = pladeTemp(this.trin);
        var kp = this.lavesteKp();
        var harVaeske = this.mLIKolben() > 0.05;

        if (harVaeske && maal > kp && this.temp >= kp - 0.35) {
            /* Kogepunktsplateauet: temperaturen staar stille, mens
               stoffet koger vaek. */
            this.temp = kp;
            this.koger = true;
        } else {
            var t = 1 - Math.exp(-dt / TAU);
            this.temp += (maal - this.temp) * t;
            if (harVaeske && this.temp > kp) this.temp = kp;
            this.koger = harVaeske && this.temp >= kp - 0.35 && maal > kp;
        }
    };

    /* Hvor meget af hvert stof, der gaar over i damp. Vaegten er
       Raoults lov med en simpel temperaturafhaengighed. */
    Pr.dampVaegte = function () {
        var ud = [], sum = 0;
        for (var id in this.kolbe) {
            if (this.kolbe[id] <= 0.02) continue;
            var v = D.vaeske(id);
            var w = this.kolbe[id] * Math.exp(0.06 * (this.temp - v.kp));
            ud.push({ id: id, w: w });
            sum += w;
        }
        for (var i = 0; i < ud.length; i++) ud[i].w /= sum || 1;
        return ud;
    };

    Pr.opdaterFordampning = function (dt) {
        if (this.mLIKolben() <= 0.02) return;

        var fart;
        if (this.koger) {
            /* mL pr. sekund. Farten er sat, saa en fuld kolbe tager over
               et minut at koge vaek: eleven skal kunne naa at se, at
               destillatet aendrer sig undervejs. */
            fart = 0.5 + NK.klamp(pladeTemp(this.trin) - this.lavesteKp(), 0, 120) * 0.008;
        } else {
            /* Overfladefordampning: svag, men den er der. */
            var f = 0;
            for (var id in this.kolbe) {
                if (this.kolbe[id] > 0.02) f = Math.max(f, D.fordampning(D.vaeske(id), this.temp));
            }
            fart = f * 0.45;
        }
        if (fart <= 0) return;

        var vaegte = this.dampVaegte();
        for (var i = 0; i < vaegte.length; i++) {
            var vid = vaegte[i].id;
            this.rest[vid] = (this.rest[vid] || 0) + fart * vaegte[i].w * dt;
            var s = this.slags[vid];
            while (this.rest[vid] >= s.mLprMol && this.kolbe[vid] > 0.001) {
                this.rest[vid] -= s.mLprMol;
                this.fordampEt(vid);
            }
        }
    };

    /* Ét molekyle river sig loes fra vaesken og bliver til gas. */
    Pr.fordampEt = function (id) {
        var bedst = -1, bedstY = Infinity;
        for (var i = 0; i < this.mol.length; i++) {
            if (this.mol[i].id !== id || this.mol[i].gas) continue;
            if (this.mol[i].y < bedstY) { bedstY = this.mol[i].y; bedst = i; }
        }
        if (bedst < 0) return;
        var m = this.mol[bedst];
        m.gas = true;
        m.vx = NK.r(-40, 40);
        m.vy = -NK.r(60, 130);
        m.fri = this.koger ? 1 : 0;     /* kogende damp slipper altid ud */
    };

    /* ----- Molekylerne i kolben ---------------------------------------------- */
    Pr.opdaterMolekyler = function (dt) {
        var skridt = Math.min(dt, 0.032);
        var i, j;
        var mol = this.mol;
        var inderR = K.r - K.vaeg;
        var varme = NK.klamp((this.temp - 20) / 150, 0, 1);

        for (i = 0; i < mol.length; i++) {
            var a = mol[i];
            if (a.gas) continue;
            for (j = i + 1; j < mol.length; j++) {
                var b = mol[j];
                if (b.gas) continue;
                var dx = b.x - a.x, dy = b.y - a.y;
                var d2 = dx * dx + dy * dy;
                var mind = a.r + b.r;
                if (d2 > mind * mind * 2.5 || d2 < 1e-6) continue;
                var d = Math.sqrt(d2);
                var nx = dx / d, ny = dy / d;
                if (d < mind) {
                    var skub = (mind - d) * 30;
                    a.vx -= nx * skub * skridt; a.vy -= ny * skub * skridt;
                    b.vx += nx * skub * skridt; b.vy += ny * skub * skridt;
                } else {
                    /* Sammenhaengskraften: det er den, kogningen bryder. */
                    var f = 20 * (1 - (d - mind) / (mind * 0.6));
                    a.vx += nx * f * skridt; a.vy += ny * f * skridt;
                    b.vx -= nx * f * skridt; b.vy -= ny * f * skridt;
                }
            }
        }

        for (i = 0; i < mol.length; i++) {
            var m = mol[i];
            if (m.gas) {
                m.vy -= 190 * skridt;                       /* dampen stiger */
                m.vx += NK.r(-1, 1) * 220 * skridt;
                m.vy += NK.r(-1, 1) * 160 * skridt;
                /* Oppe under kolbens loft traekker udgangen i dampen.
                   Uden det samler de smaa molekyler sig i toppen i
                   stedet for at gaa ud i armen, og destillatet kommer
                   til at se renere ud, end kogningen giver grund til. */
                if (m.y < K.cy) m.vx += (K.cx - m.x) * 2.2 * skridt;
                m.vx *= Math.pow(0.35, skridt);
                m.vy *= Math.pow(0.35, skridt);
            } else {
                m.vy += 340 * skridt;                       /* tyngdekraften */
                m.vx += NK.r(-1, 1) * (60 + varme * 260) * skridt;
                m.vy += NK.r(-1, 1) * (60 + varme * 260) * skridt;
                m.vx *= Math.pow(0.03, skridt);
                m.vy *= Math.pow(0.03, skridt);
            }
            m.x += m.vx * skridt;
            m.y += m.vy * skridt;
            m.vinkel += m.dv * (0.6 + varme * 3) * skridt;

            /* Halsen: dampen kan gaa op gennem den og ud i armen. */
            if (m.gas && m.y < K.cy - inderR * 0.55 && Math.abs(m.x - K.cx) < K.halsB / 2) {
                if (m.y < K.halsTop + 60) { this.udIArmen(m); i--; continue; }
                if (m.x < K.cx - K.halsB / 2 + m.r) { m.x = K.cx - K.halsB / 2 + m.r; m.vx = Math.abs(m.vx); }
                if (m.x > K.cx + K.halsB / 2 - m.r) { m.x = K.cx + K.halsB / 2 - m.r; m.vx = -Math.abs(m.vx); }
                continue;
            }

            /* Kuglens vaeg */
            var dxc = m.x - K.cx, dyc = m.y - K.cy;
            var l = Math.hypot(dxc, dyc);
            if (l > inderR - m.r) {
                var nx2 = dxc / l, ny2 = dyc / l;
                m.x = K.cx + nx2 * (inderR - m.r);
                m.y = K.cy + ny2 * (inderR - m.r);
                var prik = m.vx * nx2 + m.vy * ny2;
                m.vx -= 1.4 * prik * nx2;
                m.vy -= 1.4 * prik * ny2;
                /* Damp preller af; vaeske falder tungt til ro. */
                var tab = m.gas ? 0.9 : 0.5;
                m.vx *= tab; m.vy *= tab;

                /* Damp, der rammer det kolde glas over vaesken uden at
                   have naaet halsen, falder ned igen. */
                if (m.gas && !m.fri && ny2 < -0.3) {
                    m.gas = false;
                    m.vy = 30;
                }
            }
        }
    };

    /* Et molekyle forlader kolben og gaar ud i sidearmen. */
    Pr.udIArmen = function (m) {
        var s = this.slags[m.id];
        this.kolbe[m.id] = Math.max(0, this.kolbe[m.id] - s.mLprMol);
        this.iArmen.push({
            id: m.id, form: m.form, skala: m.skala * 0.85,
            t: 0, vinkel: m.vinkel, draabe: false, mL: s.mLprMol
        });
        var nr = this.mol.indexOf(m);
        if (nr >= 0) this.mol.splice(nr, 1);
    };

    Pr.opdaterArmen = function (dt) {
        for (var i = this.iArmen.length - 1; i >= 0; i--) {
            var d = this.iArmen[i];
            d.t += (d.draabe ? 0.30 : 0.46) * dt;
            d.vinkel += dt * 1.6;
            if (!d.draabe && d.t > K.kappe0 + 0.12) d.draabe = true;
            if (d.t >= 1) {
                this.modtag[d.id] = (this.modtag[d.id] || 0) + d.mL;
                this.iArmen.splice(i, 1);
                if (NK.Lyd && Math.random() < 0.25) NK.Lyd.plip();
            }
        }
    };

    /* Vaeskeoverfladen: det hoejeste molekyle, der ikke er gas. Boblerne
       hoerer hjemme under den og forsvinder, naar de naar op til den. */
    Pr.overflade = function () {
        var y = K.cy + K.r;
        for (var i = 0; i < this.mol.length; i++) {
            if (!this.mol[i].gas && this.mol[i].y < y) y = this.mol[i].y;
        }
        return y;
    };

    Pr.opdaterBobler = function (dt) {
        var i;
        var top = this.overflade();
        var bund = K.cy + K.r - K.vaeg;

        if (this.koger && this.mLIKolben() > 0.05 && bund - top > 18) {
            if (Math.random() < dt * 14) {
                this.bobler.push({
                    x: K.cx + NK.r(-62, 62),
                    y: NK.lerp(bund, top, NK.r(0, 0.35)),
                    r: NK.r(3.5, 8),
                    fart: NK.r(60, 120)
                });
            }
        }
        for (i = this.bobler.length - 1; i >= 0; i--) {
            var b = this.bobler[i];
            b.y -= b.fart * dt;
            b.r = Math.min(13, b.r + dt * 4);
            if (b.y < top + 4) this.bobler.splice(i, 1);
        }
    };

    /* ----- Tal i panelet ------------------------------------------------------ */
    Pr.opdaterTal = function () {
        NK.saetTekst("faser-temp-tal", NK.tal(this.temp, 0) + " °C");
        NK.saetTekst("faser-trin-tal", String(this.trin));
        NK.saetTekst("faser-plade-tal", this.trin === 0 ? "slukket" : NK.tal(pladeTemp(this.trin), 0) + " °C");
        NK.saetTekst("faser-kolbe", NK.tal(this.mLIKolben(), 0) + " mL");
        NK.saetTekst("faser-modtag", NK.tal(this.mLIGlasset(), 0) + " mL");

        var valg = this.valg();
        var samlet = this.mLIGlasset();
        if (valg.dele.length > 1) {
            var e = this.modtag.ethanol || 0;
            NK.saetTekst("faser-renhed", samlet < 0.5 ? "-" : NK.tal(100 * e / samlet, 0) + " % ethanol");
        } else {
            NK.saetTekst("faser-renhed", samlet < 0.5 ? "-" : "rent " + D.vaeske(valg.dele[0][0]).navn);
        }

        var tilstandsTekst;
        if (this.koger) tilstandsTekst = "koger";
        else if (this.mLIKolben() < 0.05) tilstandsTekst = "kolben er tom";
        else tilstandsTekst = "flydende";
        NK.saetTekst("faser-tilstand", tilstandsTekst);
        NK.saetKlasse("faser-tilstand", "maerke " + (this.koger ? "orange" : "groen"));

        NK.saetTekst("faser-status", this.statusTekst());
    };

    Pr.statusTekst = function () {
        if (this.besked) return this.besked;
        if (this.trin === 0) return "Drej på varmepladens knap, eller brug skyderen i panelet.";
        if (this.mLIKolben() < 0.05) return "Kolben er tom. Alt er destilleret over i modtageglasset.";
        if (this.trin === 10 && !this.koger && this.temp > pladeTemp(10) - 8) {
            return D.vaeske(this.valg().dele[0][0]).navn + " koger først ved " +
                   NK.tal(this.lavesteKp(), 0) + " °C. Varmepladen kan ikke komme højere op end " +
                   NK.tal(pladeTemp(10), 0) + " °C.";
        }
        if (this.koger) {
            var kp = this.lavesteKp();
            return "Det koger ved " + NK.tal(kp, 0) + " °C. Temperaturen står stille, så længe der er væske tilbage.";
        }
        if (this.temp > 30) return "Temperaturen stiger mod varmepladens " + NK.tal(pladeTemp(this.trin), 0) + " °C.";
        return "Pladen varmer. Se på termometeret.";
    };

    /* Fasestregen i panelet: hvor smelte- og kogepunkt ligger, og hvor
       temperaturen er nu. Tegnes som procentdele af en fast akse. */
    Pr.opdaterPanel = function () {
        var knapper = NK.el("faser-valg").querySelectorAll(".vaeskeknap");
        for (var i = 0; i < knapper.length; i++) {
            knapper[i].classList.toggle("valgt", i === this.valgNr);
            knapper[i].setAttribute("aria-pressed", i === this.valgNr ? "true" : "false");
        }

        var valg = this.valg();
        var h;

        if (valg.dele.length > 1) {
            /* En blanding har ikke ét smelte- og kogepunkt. Her er det
               forskellen mellem de to stoffer, der er pointen. */
            h = "";
            valg.dele.forEach(function (d) {
                var s = D.vaeske(d[0]);
                h += '<div class="talraekke"><span><i class="prik" style="background:' + s.farve +
                     '"></i>' + s.navn + "</span><span class=\"tal gul\">koger ved " + NK.tal(s.kp, 0) + " °C</span></div>";
            });
            h += '<p class="note">Ethanol koger 22 °C før vandet. Derfor er den damp, der går ud i køleren, rig på ethanol, og destillatet bliver stærkere end det, der blev hældt i.</p>';
            NK.saetHTML("faser-fakta", h);
            return;
        }

        var v = D.vaeske(valg.dele[0][0]);

        function pct(t) { return NK.klamp((t - T_MIN) / (T_MAKS - T_MIN), 0, 1) * 100; }

        /* Et felt faar kun sit navn skrevet i sig, naar det er bredt nok
           til, at ordet kan staa der. */
        function felt(klasse, navn, fra, til) {
            var b = til - fra;
            return '<div class="fase ' + klasse + '" style="left:' + fra.toFixed(1) +
                   "%;width:" + b.toFixed(1) + '%">' + (b > 15 ? navn : "") + "</div>";
        }

        var smp = pct(v.smp), kp = pct(v.kp);
        h = '<div class="fasestreg">' +
            felt("fast", "fast", 0, smp) +
            felt("flydende", "flydende", smp, kp) +
            felt("gas", "gas", kp, 100) +
            '<div class="fasemaerke" id="faser-naal"></div>' +
            "</div>" +
            '<div class="faseskala"><span>' + T_MIN + " °C</span><span>0 °C</span><span>" + T_MAKS + " °C</span></div>" +
            '<div class="talraekke"><span>Smeltepunkt</span><span class="tal blaa">' + NK.tal(v.smp, 0) + " °C</span></div>" +
            '<div class="talraekke"><span>Kogepunkt</span><span class="tal gul">' + NK.tal(v.kp, 0) + " °C</span></div>" +
            '<div class="talraekke"><span>Tæthed</span><span class="tal">' + NK.tal(v.taethed, 2) + " g/mL</span></div>" +
            '<div class="talraekke"><span>Mellem molekylerne</span><span class="tal">' + v.kraft + "</span></div>";
        NK.saetHTML("faser-fakta", h);
        this.flytNaal();
    };

    Pr.flytNaal = function () {
        var n = NK.el("faser-naal");
        if (!n) return;
        n.style.left = (NK.klamp((this.temp - T_MIN) / (T_MAKS - T_MIN), 0, 1) * 100).toFixed(2) + "%";
    };

    /* ----- Tegningen ---------------------------------------------------------- */
    Pr.tegn = function () {
        var ctx = this.L.ctx;
        var br = this.br;
        var i;

        this.flytNaal();
        this.L.ryd("#0f1217");
        ctx.save();
        ctx.translate(br.dx, br.dy);
        ctx.scale(br.s, br.s);

        T.rum(ctx, T.BREDDE, T.HOEJDE);
        T.bord(ctx, T.BREDDE);

        /* Modtageglasset med det, der er destilleret over */
        var lag = [];
        var samlet = this.mLIGlasset();
        if (samlet > 0.02) {
            var farve = null, under = 0;
            for (var id in this.modtag) {
                if (!this.modtag[id]) continue;
                under += this.modtag[id];
                var f = D.vaeske(id).farve;
                farve = farve === null ? f : T.blandFarve(farve, f, this.modtag[id] / under);
            }
            lag.push({ farve: farve, mL: samlet, uklar: 0 });
        }
        T.skygge(ctx, (K.modtag.x0 + K.modtag.x1) / 2, T.BORD + 3, 60);
        T.baegerglas(ctx, K.modtag.x0, K.modtag.x1, K.modtag.top, K.modtag.bund, lag,
                     { etiket: "destillat", maks: START_ML });

        /* Varmepladen under kolben */
        T.skygge(ctx, (K.plade.x0 + K.plade.x1) / 2, T.BORD + 2, 150);
        T.varmeplade(ctx, this.gloed(), this.knapVinkel(), this.overKnap());

        /* Koeleren bag kolben */
        T.koeler(ctx);

        /* Molekylerne klippes til kolbens inderside */
        ctx.save();
        T.kolbeSti(ctx, true);
        ctx.clip();
        for (i = 0; i < this.bobler.length; i++) {
            var b = this.bobler[i];
            ctx.strokeStyle = "rgba(226, 240, 255, 0.4)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.stroke();
        }
        for (i = 0; i < this.mol.length; i++) {
            var m = this.mol[i];
            M.tegn(ctx, m.form, m.x, m.y, m.vinkel, m.skala,
                   { delta: this.visDelta, alpha: m.gas ? 0.75 : 1 });
        }
        ctx.restore();

        T.kolbe(ctx);
        T.termometer(ctx, this.temp, -20, 360);

        /* Det, der er paa vej gennem armen */
        for (i = 0; i < this.iArmen.length; i++) {
            var d = this.iArmen[i];
            var p = T.armPunkt(d.t);
            if (d.draabe) {
                T.draabe(ctx, p.x, p.y, 6, D.vaeske(d.id).farve, 0.95);
            } else {
                M.tegn(ctx, d.form, p.x, p.y, d.vinkel, d.skala, { alpha: 0.8, enkel: true });
            }
        }

        /* Damp over halsen, naar det koger kraftigt */
        if (this.koger) {
            var n = 3;
            for (i = 0; i < n; i++) {
                var fase = (this.tid * 0.5 + i / n) % 1;
                T.dampsky(ctx, K.cx + Math.sin((this.tid + i) * 1.4) * 14,
                          K.halsTop - 10 - fase * 60, 20 + fase * 26, (1 - fase) * 0.4);
            }
        }

        if (this.laererTegnOver) this.laererTegnOver(ctx);
        ctx.restore();
    };

    Pr.gloed = function () {
        return NK.klamp((this.trin - 0.2) / 4, 0, 1);
    };

    Pr.overKnap = function () {
        if (!this.mus.inde) return false;
        var kn = T.pladeKnap();
        return Math.hypot(this.mus.x - kn.x, this.mus.y - kn.y) < kn.r + 9;
    };

    Pr.laererPladsBord = function () {
        return 700;
    };

    /* ------------------------------------------------------------------
       OPGAVERNE
       ------------------------------------------------------------------ */
    function vaelgValg(sim, id) {
        for (var i = 0; i < VALG.length; i++) {
            if (VALG[i].id === id) { sim.valgNr = i; sim.fyld(); return; }
        }
    }

    /* 1. Kog et stof, og aflaes kogepunktet paa termometeret. */
    function opgKog(sim) {
        var m = NK.tilfaeldig(["ethanol", "heptan", "vand", "hexanol"]);
        var v = D.vaeske(m);
        return {
            tekst: "Varm " + v.navn + " op, til det koger, og aflæs temperaturen.",
            valg: ["56 °C", "78 °C", "98 °C", "100 °C", "157 °C", "210 °C"],
            rigtig: ["56", "78", "98", "100", "157", "210"].indexOf(String(v.kp)),
            hint: "Skru helt op på pladen. Temperaturen holder op med at stige, når det koger.",
            svar: v.navn + " koger ved " + v.kp + " °C. Temperaturen står stille dér, så længe der er væske tilbage.",
            start: function (s) { vaelgValg(s, m); s.saetTrin(0); },
            visSvar: function (s) { vaelgValg(s, m); s.saetTrin(10); s.temp = v.kp; }
        };
    }

    /* 2. Kogepunktet foelger kraefterne, ikke massen. */
    function opgKraefter() {
        return {
            tekst: "Ethanol vejer mere end vand og koger alligevel ved den laveste temperatur. Hvorfor?",
            valg: [
                "Hvert vandmolekyle danner flere hydrogenbindinger",
                "Ethanol er et upolært stof",
                "Vand er et større molekyle",
                "Ethanol har ingen kræfter mellem molekylerne"
            ],
            rigtig: 0,
            hint: "Se på, hvor mange OH-grupper hvert molekyle har i forhold til sin størrelse.",
            svar: "Vand har to hydrogener på hvert oxygen og kan binde til flere naboer på én gang. Ethanol har kun én OH-gruppe og en upolær hale.",
            start: function (s) { vaelgValg(s, "ethanol"); s.saetTrin(0); },
            visSvar: function (s) { vaelgValg(s, "vand"); s.saetTrin(10); }
        };
    }

    /* 3. Destillér blandingen, og se hvad der kommer over foerst. */
    function opgDestiller(sim) {
        return {
            tekst: "Destillér blandingen af vand og ethanol. Stop, når du har samlet ca. 15 mL, og aflæs hvad destillatet består af.",
            hint: "Ethanol koger ved 78 °C og vand ved 100 °C. Skru op, til det koger, og sluk pladen igen, når der er nok i modtageglasset.",
            svar: "De første milliliter er rige på ethanol, fordi ethanol koger ved den laveste temperatur. Koger man hele kolben tør, får man det hele med, og så er der ikke skilt noget ad.",
            start: function (s) { vaelgValg(s, "blanding"); s.saetTrin(0); },
            tjek: function (s) {
                if (s.valg().dele.length < 2) return "Vælg blandingen af vand og ethanol.";
                if (s.mLIGlasset() < 15) return false;
                return true;
            },
            visSvar: function (s) {
                if (s.valg().dele.length < 2) vaelgValg(s, "blanding");
                s.saetTrin(7);
            }
        };
    }

    /* 4. Kogepunktsplateauet. */
    function opgPlateau() {
        return {
            tekst: "Et stof koger, og du skruer varmepladen helt op. Hvad sker der med temperaturen i kolben?",
            valg: [
                "Den bliver stående ved kogepunktet",
                "Den stiger til pladens temperatur",
                "Den falder",
                "Den svinger op og ned"
            ],
            rigtig: 0,
            hint: "Prøv det: skru op, mens det koger, og hold øje med termometeret.",
            svar: "Al den ekstra varme går til at rive molekylerne fri af hinanden. Temperaturen stiger først, når det sidste væske er kogt væk.",
            start: function (s) { vaelgValg(s, "ethanol"); s.saetTrin(6); },
            visSvar: function (s) { s.saetTrin(10); }
        };
    }

    /* 5. Tilstandsformen ved en given temperatur. */
    function opgTilstand(sim) {
        var m = NK.tilfaeldig([
            { id: "vand", t: -20, svar: "fast" },
            { id: "heptan", t: -100, svar: "fast" },
            { id: "ethanol", t: 90, svar: "gas" },
            { id: "heptan", t: 120, svar: "gas" },
            { id: "hexanol", t: 100, svar: "flydende" },
            { id: "olie", t: 200, svar: "flydende" }
        ]);
        var v = D.vaeske(m.id);
        return {
            tekst: "Hvilken tilstandsform har " + v.navn + " ved " + NK.tal(m.t, 0) + " °C?",
            valg: ["fast", "flydende", "gas"],
            rigtig: ["fast", "flydende", "gas"].indexOf(m.svar),
            hint: "Se på fasestregen i kortet med stoffets tal.",
            svar: v.navn + " smelter ved " + NK.tal(v.smp, 0) + " °C og koger ved " + NK.tal(v.kp, 0) +
                  " °C. Ved " + NK.tal(m.t, 0) + " °C er det derfor " + m.svar + ".",
            start: function (s) { vaelgValg(s, m.id); }
        };
    }

    var OPGAVER = [opgKog, opgKraefter, opgDestiller, opgPlateau, opgTilstand];
}());
