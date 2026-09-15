/* =====================================================================
   sim_vandstraale.js - fane 4: forsoeg med vandstraalen og en ladet stav

   En burette fyldes med vand, ethanol eller heptan, og hanen aabnes.
   Straalen er en raekke smaa partikler, der falder med tyngdekraften.
   En stav, der er gnedet med uldkluden, er ladet: plastik negativt,
   glas positivt. Holdes den taet paa straalen, traekker den i hver
   partikel med en kraft, der aftager med afstanden i anden potens og
   er proportional med vaeskens polaritet (D.VAESKER[].pol).

   Roerer staven straalen, bliver den vaad og mister ladningen. Et test
   registreres, naar en ladet stav har vaeret taet paa straalen i lidt
   over et sekund. Naar alle tre vaesker er testet, og vand er testet
   med begge stave, er forsoeget slut, og tegneserien laases op.

   Alt tegnes med vand_tegning.js i scenens egne enheder (1000 x 640).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = NK.VandTegning;
    var MAAL = T.MAAL;

    var FYLD = 30;             /* mL, der haeldes i buretten */
    var FLOW = 2;              /* mL pr. sekund, naar hanen er aaben */
    var UDSLIP = 90;           /* straalepartikler pr. sekund */
    var VOL_P = FLOW / UDSLIP; /* mL pr. partikel */
    var TYNGDE = 1000;         /* enheder pr. s² */
    var START_FART = 70;
    var K = 2.0e6;             /* stavens traek */
    var MIN_AFSTAND = 16;
    var VAAD = 6;
    var HOLD_VINKEL = 16 * Math.PI / 180;
    var TEST_AFSTAND = 80;
    var TEST_TID = 1.2;
    var MIN_LADNING = 0.3;

    var STAVE = {
        plastik: { navn: "plastikstaven", sprite: "plastikstav", tegn: -1, hvile: { x: 560, y: 590 } },
        glas:    { navn: "glasstaven", sprite: "glasstav", tegn: 1, hvile: { x: 560, y: 616 } }
    };

    function stort(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

    function oplist(navne) {
        if (navne.length < 2) return navne.join("");
        return navne.slice(0, -1).join(", ") + " og " + navne[navne.length - 1];
    }

    /* ----- Forloebet ------------------------------------------------------ */
    var TRIN = [
        { id: "fyldt", tekst: "Fyld buretten fra en flaske",
          hint: function () { return "Klik på en af flaskerne. Buretten skal være tom, og hanen skal være lukket."; } },
        { id: "aabnet", tekst: "Åbn hanen, så der løber en stråle",
          hint: function () { return "Klik på det orange hanegreb nederst på buretten."; } },
        { id: "gnedet", tekst: "Gnid en stav med uldkluden",
          hint: function () { return "Tag fat i en stav, og træk den frem og tilbage hen over uldkluden."; } },
        { id: "holdt", tekst: "Hold staven tæt på strålen",
          hint: function () { return "Hold museknappen nede, og før spidsen af staven tæt på strålen uden at røre den."; } },
        { id: "alle", tekst: "Test alle tre væsker",
          hint: function (sim) {
              var mangler = D.VAESKE_ORDEN.filter(function (v) { return !sim.testet(v); }).map(function (v) { return D.VAESKER[v].navn; });
              return "Mangler: " + oplist(mangler) + ". Lad buretten løbe tom, og fyld den med den næste væske.";
          } },
        { id: "begge", tekst: "Test vand med begge stave",
          hint: function (sim) {
              var stav = sim.resultater.vand.plastik ? "glasstaven" : "plastikstaven";
              return "Fyld buretten med vand, og hold " + stav + " ved strålen.";
          } }
    ];

    /* ----- Opgaverne: laases op, naar forsoeget er slut ------------------- */
    function valgopgave(tekst, svar, hint, forklaring) {
        return function () {
            var orden = NK.bland([0, 1, 2, 3]);
            return {
                tekst: tekst,
                valg: orden.map(function (i) { return svar[i]; }),
                rigtig: orden.indexOf(0),
                hint: hint,
                svar: forklaring
            };
        };
    }

    var OPGAVER = [
        valgopgave("Hvorfor bøjer vandstrålen mod den ladede stav?",
            ["Vandmolekylerne er polære og drejer den modsat ladede ende mod staven", "Vandet er elektrisk ladet", "Staven er magnetisk", "Vandet fordamper hen mod staven"],
            "Tænk på δ+ og δ− i vandmolekylet.",
            "Vandmolekylet er polært. Det drejer, så δ− vender mod en positiv stav og δ+ mod en negativ, og trækkes hen mod staven."),
        valgopgave("Hvorfor bøjer strålen af heptan ikke?",
            ["Heptan er upolært", "Heptan er tungere end vand", "Heptan er positivt ladet", "Heptanstrålen er for tyk"],
            "Heptan består kun af C og H. Hvor stor er forskellen i elektronegativitet?",
            "C og H har næsten samme elektronegativitet, så heptan er upolært. Molekylerne drejer sig ikke mod staven."),
        valgopgave("Vandstrålen bøjer mod både den positive og den negative stav. Hvad viser det?",
            ["Vandet er ikke ladet, men molekylerne har en positiv og en negativ ende", "Vandet er positivt ladet", "Vandet er negativt ladet", "Stavene har samme ladning"],
            "Et ladet stof ville blive frastødt af den ene stav.",
            "Var vandet ladet, ville det blive frastødt af den ene stav. Molekylerne er neutrale, men polære, og drejer sig efter staven."),
        valgopgave("Hvorfor bøjer ethanol mindre end vand?",
            ["Ethanol har en upolær carbonkæde og er mindre polært end vand", "Ethanol er helt upolært", "Ethanol har ingen O-H-binding", "Ethanol er tungere end vand"],
            "Se på, hvilken del af ethanolmolekylet der er polær.",
            "Ethanol har en polær OH-gruppe, men resten af molekylet er upolært. Derfor bøjer strålen mindre end vandstrålen.")
    ];

    /* ----- Simulationen ------------------------------------------------------- */
    NK.SimVandstraale = function () {
        this.laerred = new NK.Laerred(NK.el("vand-laerred"));
        this.s = 1;
        this.ox = 0;
        this.oy = 0;
        this.TRIN = TRIN;
        this.OPGAVER = OPGAVER;
        this.opgaver = new NK.Opgaver("vand", OPGAVER, this);
        this.nulstilForsoeg();
        this._bindPanel();
        this._bindMus();
    };

    var P = NK.SimVandstraale.prototype;

    P.nulstilForsoeg = function () {
        var mig = this;
        this.tid = 0;
        this.vaeske = null;
        this.vol = 0;
        this.visVol = 0;
        this.haneAaben = false;
        this.partikler = [];
        this.udslipRest = 0;
        this.naesteNr = 0;
        this.baeger = { vand: 0, ethanol: 0, heptan: 0 };
        this.pytter = [];
        this.gnister = [];
        this.stave = {};
        Object.keys(STAVE).forEach(function (id) {
            var s = STAVE[id];
            mig.stave[id] = { id: id, navn: s.navn, sprite: s.sprite, tegn: s.tegn, hvile: s.hvile,
                tip: { x: s.hvile.x, y: s.hvile.y }, vinkel: 0, ladning: 0, holdt: false, t: 0, greb: null };
        });
        this.holdt = null;
        this.resultater = { vand: {}, ethanol: {}, heptan: {} };
        this.testTid = {};
        this.testMaks = {};
        this.gjort = { fyldt: false, aabnet: false, gnedet: false, holdt: false };
        this.minAfstand = Infinity;
        this.naermeste = null;
        this.afboejningNu = 0;
        this.lupAlfa = 0;
        this.lupVaeske = null;
        this.lupTegn = -1;
        this.lupStyrke = 0;
        this.lupPunkt = null;
        this.hover = null;
        this.serieSet = false;
        this.sidsteBesked = {};
        this.sidsteSig = null;
    };

    /* ----- Forloebet --------------------------------------------------------- */
    P.testet = function (vaeske) {
        return Object.keys(this.resultater[vaeske]).length > 0;
    };

    P.trinGjort = function (id) {
        if (id === "alle") return D.VAESKE_ORDEN.every(this.testet, this);
        if (id === "begge") return !!(this.resultater.vand.plastik && this.resultater.vand.glas);
        return !!this.gjort[id];
    };

    P.aktueltTrin = function () {
        for (var i = 0; i < TRIN.length; i++) if (!this.trinGjort(TRIN[i].id)) return TRIN[i];
        return null;
    };

    P.slut = function () {
        return this.trinGjort("alle") && this.trinGjort("begge");
    };

    /* ----- Handlinger ---------------------------------------------------------- */
    P.besked = function (tekst, noegle) {
        noegle = noegle || tekst;
        if (this.sidsteBesked[noegle] !== undefined && this.tid - this.sidsteBesked[noegle] < 4) return;
        this.sidsteBesked[noegle] = this.tid;
        var e = NK.el("vand-besked");
        e.textContent = tekst;
        e.classList.remove("vis");
        void e.offsetWidth;
        e.classList.add("vis");
        window.clearTimeout(this._beskedUr);
        this._beskedUr = window.setTimeout(function () { e.classList.remove("vis"); }, 3000);
    };

    P.fyld = function (vaeske) {
        if (this.haneAaben) { this.besked("Luk hanen, før du fylder buretten."); return false; }
        if (this.vol > 0.5) { this.besked("Buretten er ikke tom endnu. Åbn hanen, og lad den løbe ud."); return false; }
        this.vaeske = vaeske;
        this.vol = FYLD;
        this.visVol = Math.min(this.visVol, 0);
        this.gjort.fyldt = true;
        return true;
    };

    P.saetHane = function (aaben) {
        if (aaben && this.vol <= 0.01) { this.besked("Buretten er tom. Klik på en flaske for at fylde den."); return false; }
        this.haneAaben = !!aaben;
        if (aaben) this.gjort.aabnet = true;
        return true;
    };

    P.toemBaeger = function () {
        if (this.baeger.vand + this.baeger.ethanol + this.baeger.heptan < 0.5) return;
        this.baeger = { vand: 0, ethanol: 0, heptan: 0 };
        this.besked("Bægerglasset er tømt.");
    };

    /* ----- Stavene ------------------------------------------------------------- */
    function ender(st) {
        return {
            a: st.tip,
            b: { x: st.tip.x + Math.cos(st.vinkel) * MAAL.STAV_L, y: st.tip.y + Math.sin(st.vinkel) * MAAL.STAV_L }
        };
    }

    /* Afstanden fra (x, y) til staven og det naermeste punkt paa den. */
    function afstand(st, x, y) {
        var e = ender(st);
        var dx = e.b.x - e.a.x, dy = e.b.y - e.a.y;
        var t = NK.klamp(((x - e.a.x) * dx + (y - e.a.y) * dy) / (dx * dx + dy * dy), 0, 1);
        var px = e.a.x + t * dx, py = e.a.y + t * dy;
        return { d: Math.hypot(x - px, y - py), px: px, py: py, t: t };
    }
    P.afstand = afstand;

    P.stavVed = function (x, y) {
        var ids = Object.keys(this.stave);
        for (var i = ids.length - 1; i >= 0; i--) {
            var a = afstand(this.stave[ids[i]], x, y);
            if (a.d < 13) return { id: ids[i], t: a.t };
        }
        return null;
    };

    P.grib = function (id, x, y, t) {
        var st = this.stave[id];
        if (!st) return;
        st.holdt = true;
        st.t = t === undefined ? 0.8 : t;
        st.greb = { x: x, y: y };
        this.holdt = id;
        this.sidstePunkt = { x: x, y: y };
    };

    P.flytStav = function (x, y) {
        var st = this.holdt ? this.stave[this.holdt] : null;
        if (!st) return;
        st.greb = { x: NK.klamp(x, 0, MAAL.W), y: NK.klamp(y, 0, MAAL.H - 10) };
        this.placerHoldt(st);
        if (this.gnider(st)) {
            var laengde = Math.hypot(x - this.sidstePunkt.x, y - this.sidstePunkt.y);
            if (laengde > 0.5) {
                st.ladning = Math.min(1, st.ladning + laengde * 0.0045);
                var p = ender(st);
                var tt = 0.3 + Math.random() * 0.6;
                this.gnister.push({ x: p.a.x + (p.b.x - p.a.x) * tt, y: p.a.y + (p.b.y - p.a.y) * tt - 6, liv: 1 });
                if (st.ladning >= 0.5) this.gjort.gnedet = true;
            }
        }
        this.sidstePunkt = { x: x, y: y };
    };

    P.slip = function () {
        var st = this.holdt ? this.stave[this.holdt] : null;
        if (st) { st.holdt = false; st.greb = null; }
        this.holdt = null;
    };

    P.placerHoldt = function (st) {
        st.tip = {
            x: st.greb.x - st.t * MAAL.STAV_L * Math.cos(st.vinkel),
            y: st.greb.y - st.t * MAAL.STAV_L * Math.sin(st.vinkel)
        };
    };

    P.gnider = function (st) {
        var k = MAAL.KLUD, e = ender(st);
        for (var t = 0.1; t < 0.95; t += 0.1) {
            var x = e.a.x + (e.b.x - e.a.x) * t, y = e.a.y + (e.b.y - e.a.y) * t;
            if (x > k.x - 4 && x < k.x + k.b + 4 && y > k.y - 4 && y < k.y + k.h + 4) return true;
        }
        return false;
    };

    P.bliverVaad = function (st) {
        st.ladning = 0;
        this.besked("Staven rørte strålen og mistede sin ladning. Gnid den igen.", "vaad");
    };

    /* ----- Straalen ------------------------------------------------------------ */
    P.spild = function (p) {
        this.besked("Strålen rammer ved siden af bægerglasset.", "spild");
        for (var i = 0; i < this.pytter.length; i++) {
            var q = this.pytter[i];
            if (q.vaeske === p.vaeske && Math.abs(q.x - p.x) < 30) { q.vol += VOL_P; return; }
        }
        this.pytter.push({ x: p.x, vaeske: p.vaeske, vol: VOL_P });
    };

    P.flytPartikler = function (dt) {
        var st = this.holdt ? this.stave[this.holdt] : null;
        var traekker = st && st.ladning > 0.01 ? st : null;
        var antal = Math.max(1, Math.ceil(dt / 0.008));
        var h = dt / antal;
        var B = MAAL.BAEGER;
        var total = this.baeger.vand + this.baeger.ethanol + this.baeger.heptan;
        var rest = [];
        this.minAfstand = Infinity;
        this.naermeste = null;
        this.afboejningNu = 0;

        for (var i = 0; i < this.partikler.length; i++) {
            var p = this.partikler[i];
            var vaek = false;
            for (var n = 0; n < antal; n++) {
                var ax = 0, ay = TYNGDE;
                if (traekker) {
                    var a = afstand(traekker, p.x, p.y);
                    if (a.d < VAAD) {
                        this.bliverVaad(traekker);
                        traekker = null;
                    } else {
                        var kraft = K * traekker.ladning * D.VAESKER[p.vaeske].pol / Math.pow(Math.max(a.d, MIN_AFSTAND), 2);
                        ax += kraft * (a.px - p.x) / a.d;
                        ay += kraft * (a.py - p.y) / a.d;
                    }
                }
                p.vx += ax * h;
                p.vy += ay * h;
                p.x += p.vx * h;
                p.y += p.vy * h;
                if (p.y >= B.top && p.x > B.venstre && p.x < B.hoejre) {
                    if (total < B.maks) {
                        this.baeger[p.vaeske] += VOL_P;
                        total += VOL_P;
                    } else {
                        this.besked("Bægerglasset er fuldt. Klik på det for at tømme det.", "fuldt");
                    }
                    vaek = true;
                    break;
                }
                if (p.y >= MAAL.BORD) { this.spild(p); vaek = true; break; }
                if (p.x < -50 || p.x > MAAL.W + 50) { vaek = true; break; }
            }
            if (vaek) continue;
            rest.push(p);
            if (st) {
                var d = afstand(st, p.x, p.y).d;
                if (d < this.minAfstand) { this.minAfstand = d; this.naermeste = p; }
            }
            if (p.y > B.top - 30) this.afboejningNu = Math.max(this.afboejningNu, Math.abs(p.x - MAAL.TIP.x));
        }
        this.partikler = rest;
    };

    /* Straalen som sammenhaengende stykker til tegningen. */
    P.straalestykker = function () {
        var stykker = [], stykke = null, forrige = null;
        this.partikler.forEach(function (p) {
            if (!stykke || p.nr !== forrige.nr + 1 || p.vaeske !== forrige.vaeske || Math.hypot(p.x - forrige.x, p.y - forrige.y) > 45) {
                stykke = { vaeske: p.vaeske, pts: [] };
                stykker.push(stykke);
            }
            stykke.pts.push({ x: p.x, y: p.y });
            forrige = p;
        });
        if (this.haneAaben && this.vol > 0 && stykker.length) {
            var sidste = stykker[stykker.length - 1];
            sidste.pts.push({ x: MAAL.TIP.x, y: MAAL.TIP.y });
        }
        return stykker;
    };

    /* ----- Test og lup ------------------------------------------------------------ */
    P.registrer = function (dt) {
        var st = this.holdt ? this.stave[this.holdt] : null;
        if (!st || st.ladning < MIN_LADNING || !this.naermeste || this.minAfstand > TEST_AFSTAND || this.partikler.length < 15) return;
        var v = this.naermeste.vaeske;
        var noegle = v + "|" + st.id;
        this.testTid[noegle] = (this.testTid[noegle] || 0) + dt;
        this.testMaks[noegle] = Math.max(this.testMaks[noegle] || 0, this.afboejningNu);
        if (this.testTid[noegle] >= TEST_TID && !this.resultater[v][st.id]) {
            this.resultater[v][st.id] = { afboejning: this.testMaks[noegle] };
            this.gjort.holdt = true;
        }
    };

    P.opdaterLup = function (dt) {
        var st = this.holdt ? this.stave[this.holdt] : null;
        var vis = !!(st && st.ladning >= 0.15 && this.naermeste && this.minAfstand < 130);
        this.lupAlfa = NK.mod(this.lupAlfa, vis ? 1 : 0, 6, dt);
        if (vis) {
            this.lupVaeske = this.naermeste.vaeske;
            this.lupTegn = st.tegn;
            this.lupStyrke = NK.klamp(st.ladning * (1.25 - this.minAfstand / 130), 0, 1);
            this.lupPunkt = { x: this.naermeste.x, y: this.naermeste.y };
        }
    };

    /* ----- Panelet ---------------------------------------------------------------- */
    P._bindPanel = function () {
        var mig = this;
        NK.el("vand-hint-knap").addEventListener("click", function () { mig.visHint(); });
        NK.el("vand-forfra").addEventListener("click", function () { mig.nulstil(); });
    };

    P.visHint = function () {
        var t = this.aktueltTrin();
        var e = NK.el("vand-hint");
        if (!t) { e.hidden = true; return; }
        e.textContent = t.hint(this);
        e.hidden = false;
    };

    P.signatur = function () {
        var mig = this;
        var t = this.aktueltTrin();
        return [
            TRIN.map(function (x) { return mig.trinGjort(x.id) ? 1 : 0; }).join(""),
            D.VAESKE_ORDEN.map(function (v) { return Object.keys(mig.resultater[v]).sort().join("+"); }).join(","),
            t ? t.id : "", this.serieSet, !!this.opgaver.opgave
        ].join("|");
    };

    P.opdaterPanel = function () {
        var sig = this.signatur();
        if (sig === this.sidsteSig) return;
        var forrigeTrin = this.sidsteSig ? this.sidsteSig.split("|")[2] : null;
        this.sidsteSig = sig;
        var mig = this;
        var aktiv = this.aktueltTrin();

        var ol = NK.el("vand-trin");
        ol.innerHTML = "";
        var antalGjort = 0;
        TRIN.forEach(function (t, i) {
            var gjort = mig.trinGjort(t.id);
            var li = document.createElement("li");
            if (gjort) { li.className = "gjort"; antalGjort++; }
            else if (aktiv && t.id === aktiv.id) li.className = "aktiv";
            var nr = document.createElement("span");
            nr.className = "nr";
            nr.textContent = gjort ? "✓" : String(i + 1);
            li.appendChild(nr);
            var tekst = t.tekst;
            if (t.id === "alle") tekst += " (" + D.VAESKE_ORDEN.filter(mig.testet, mig).length + "/3)";
            li.appendChild(document.createTextNode(tekst));
            ol.appendChild(li);
        });
        NK.saetTekst("vand-taeller", antalGjort + "/" + TRIN.length);
        if (!aktiv || aktiv.id !== forrigeTrin) NK.el("vand-hint").hidden = true;
        NK.el("vand-hint-knap").disabled = !aktiv;

        var slut = this.slut();
        var knap = NK.el("vand-serieknap");
        knap.hidden = !slut;
        knap.classList.toggle("banker", slut && !this.serieSet);
        NK.saetTekst("vand-serie-tekst", slut ? "Forsøget er slut." : "Låses op, når forsøget er slut.");

        NK.el("vand-opg-knap").disabled = !slut;
        if (!slut) NK.saetTekst("vand-opg-tekst", "Låses op, når forsøget er slut.");
        else if (!this.opgaver.opgave) NK.saetTekst("vand-opg-tekst", "");
    };

    /* ----- Musen ------------------------------------------------------------------- */
    P.tilScene = function (e) {
        var r = this.laerred.canvas.getBoundingClientRect();
        return { x: (e.clientX - r.left - this.ox) / this.s, y: (e.clientY - r.top - this.oy) / this.s };
    };

    P.genstandVed = function (x, y) {
        var st = this.stavVed(x, y);
        if (st) return { slags: "stav", id: st.id, t: st.t };
        if (Math.hypot(x - MAAL.HANE.x, y - MAAL.HANE.y) < 26) return { slags: "hane" };
        for (var i = 0; i < MAAL.FLASKER.length; i++) {
            var f = MAAL.FLASKER[i];
            if (x > f.x - 40 && x < f.x + 40 && y > MAAL.FLASKE_TOP && y < MAAL.BORD) return { slags: "flaske", vaeske: f.vaeske };
        }
        if (x > 315 && x < 465 && y > 440 && y < MAAL.BORD) return { slags: "baeger" };
        return null;
    };

    P._bindMus = function () {
        var mig = this;
        var cvs = this.laerred.canvas;

        cvs.addEventListener("pointerdown", function (e) {
            var p = mig.tilScene(e);
            var g = mig.genstandVed(p.x, p.y);
            if (!g) return;
            if (g.slags === "stav") {
                mig.grib(g.id, p.x, p.y, g.t);
                try { cvs.setPointerCapture(e.pointerId); } catch (fejl) { /* ignoreres */ }
                cvs.style.cursor = "grabbing";
            } else if (g.slags === "hane") {
                mig.saetHane(!mig.haneAaben);
            } else if (g.slags === "flaske") {
                mig.fyld(g.vaeske);
            } else if (g.slags === "baeger") {
                mig.toemBaeger();
            }
        });

        cvs.addEventListener("pointermove", function (e) {
            var p = mig.tilScene(e);
            if (mig.holdt) { mig.flytStav(p.x, p.y); return; }
            var g = mig.genstandVed(p.x, p.y);
            mig.hover = g;
            cvs.style.cursor = !g ? "default" : g.slags === "stav" ? "grab" : "pointer";
        });

        function slip() {
            if (!mig.holdt) return;
            mig.slip();
            cvs.style.cursor = "grab";
        }
        cvs.addEventListener("pointerup", slip);
        cvs.addEventListener("pointercancel", slip);
        cvs.addEventListener("pointerleave", function () { if (!mig.holdt) mig.hover = null; });
    };

    /* ----- Faelles graenseflade: tilpas / opdater / tegn / nulstil ---------------- */
    P.tilpas = function () {
        this.laerred.tilpas();
        var b = this.laerred.b, h = this.laerred.h;
        this.s = Math.min(b / MAAL.W, h / MAAL.H);
        this.ox = (b - MAAL.W * this.s) / 2;
        this.oy = (h - MAAL.H * this.s) / 2;
    };

    P.opdater = function (dt) {
        var mig = this;
        this.tid += dt;
        var k = 1 - Math.exp(-12 * dt);

        Object.keys(this.stave).forEach(function (id) {
            var st = mig.stave[id];
            if (st.holdt) {
                st.vinkel += (HOLD_VINKEL - st.vinkel) * k;
                mig.placerHoldt(st);
            } else {
                st.tip.x += (st.hvile.x - st.tip.x) * k;
                st.tip.y += (st.hvile.y - st.tip.y) * k;
                st.vinkel += (0 - st.vinkel) * k;
            }
            st.ladning *= Math.exp(-dt / 90);
        });

        if (this.haneAaben && this.vol > 0) {
            var ud = Math.min(this.vol, FLOW * dt);
            this.vol -= ud;
            this.udslipRest += ud / VOL_P;
            while (this.udslipRest >= 1) {
                this.udslipRest -= 1;
                this.partikler.push({ nr: this.naesteNr++, x: MAAL.TIP.x, y: MAAL.TIP.y, vx: 0, vy: START_FART, vaeske: this.vaeske });
            }
            if (this.vol < 1e-6) this.vol = 0;
        } else {
            this.naesteNr++;   /* et hul i nummereringen bryder straalen */
        }

        this.flytPartikler(dt);
        if (this.vol === 0 && !this.partikler.length) this.vaeske = null;
        this.visVol = NK.mod(this.visVol, this.vol, this.visVol < this.vol ? 3 : 20, dt);

        this.gnister.forEach(function (g) { g.liv -= dt * 2.2; g.y -= 18 * dt; });
        this.gnister = this.gnister.filter(function (g) { return g.liv > 0; });

        this.registrer(dt);
        this.opdaterLup(dt);
        this.opgaver.opdater();
        this.opdaterPanel();
    };

    P.tegn = function () {
        var ctx = this.laerred.ctx;
        var mig = this;
        T.vaeg(ctx, this.laerred.b, this.laerred.h);
        ctx.save();
        ctx.translate(this.ox, this.oy);
        ctx.scale(this.s, this.s);

        T.bord(ctx);
        T.pytter(ctx, this.pytter);
        T.flasker(ctx, this.hover && this.hover.slags === "flaske" ? this.hover.vaeske : null);
        T.klud(ctx);
        T.burette(ctx, this.visVol, this.vaeske, this.haneAaben);

        if (this.hover && this.hover.slags === "hane") {
            ctx.strokeStyle = "rgba(242, 197, 61, 0.8)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(MAAL.HANE.x, MAAL.HANE.y, 24, 0, Math.PI * 2);
            ctx.stroke();
        }

        this.straalestykker().forEach(function (st) {
            T.straale(ctx, [st.pts], D.VAESKER[st.vaeske].farve);
        });
        T.baeger(ctx, this.baeger);

        Object.keys(this.stave).forEach(function (id) { if (!mig.stave[id].holdt) T.stav(ctx, mig.stave[id]); });
        if (this.holdt) T.stav(ctx, this.stave[this.holdt]);
        T.gnister(ctx, this.gnister);

        if (this.lupAlfa > 0.02 && this.lupVaeske) {
            var L = MAAL.LUP;
            if (this.lupPunkt) {
                ctx.save();
                ctx.globalAlpha = this.lupAlfa * 0.7;
                ctx.setLineDash([5, 6]);
                ctx.strokeStyle = "#d6eaf8";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(this.lupPunkt.x, this.lupPunkt.y);
                var vx = this.lupPunkt.x - L.x, vy = this.lupPunkt.y - L.y, vl = Math.hypot(vx, vy) || 1;
                ctx.lineTo(L.x + vx / vl * L.r, L.y + vy / vl * L.r);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(this.lupPunkt.x, this.lupPunkt.y, 10, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
            T.lup(ctx, L.x, L.y, L.r, this.lupVaeske, this.lupTegn, this.lupStyrke, this.tid, this.lupAlfa);
        }
        ctx.restore();
    };

    P.nulstil = function () {
        this.opgaver.nulstil();
        this.nulstilForsoeg();
        NK.el("vand-hint").hidden = true;
        this.opdaterPanel();
    };

    P.skiftVinkelmaaler = function () { /* ingen vinkelmaaler i forsoeget */ };

    NK.SimVandstraale.STAVE = STAVE;
    NK.SimVandstraale.stort = stort;
}());
