/* =====================================================================
   sim_vandstraale.js - fane 4: forsoeg med vandstraalen og en ladet stav

   Over en vask sidder tre haner med vand, ethanol og heptan. Et klik
   aabner en hane (og lukker den, der var aaben), og straalen loeber, til
   hanen lukkes. Straalen er en raekke smaa partikler, der falder med
   tyngdekraften. En stav, der er gnedet med uldkluden, er ladet:
   plastik negativt, glas positivt. Holdes den taet paa straalen,
   traekker den i hver partikel med en kraft, der aftager med afstanden
   i anden potens og er proportional med vaeskens polaritet
   (D.VAESKER[].pol).

   Roerer staven straalen, bliver den vaad og mister ladningen. Et test
   registreres, naar en ladet stav har vaeret taet paa straalen i lidt
   over et sekund, og skrives i skemaet i panelet. Naar alle tre vaesker
   er testet med begge stave, er forsoeget slut, og tegneserien og
   opgaverne laases op.

   Alt tegnes med vand_tegning.js i scenens egne enheder (1000 x 640).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = NK.VandTegning;
    var MAAL = T.MAAL;

    var UDSLIP = 90;           /* straalepartikler pr. sekund */
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
    var STAV_ORDEN = ["plastik", "glas"];

    function stort(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

    function oplist(navne, og) {
        if (navne.length < 2) return navne.join("");
        return navne.slice(0, -1).join(", ") + " " + (og || "og") + " " + navne[navne.length - 1];
    }

    /* Hvad skemaet skriver om en vaeske. */
    function afboejning(v) {
        var p = D.VAESKER[v].pol;
        return p >= 0.8 ? "bøjer tydeligt" : p >= 0.3 ? "bøjer lidt" : "løber lige ned";
    }

    /* Skemaet: vaeskerne paa raekkerne, stavene i kolonnerne. Faar den
       celler med, gemmes cellerne der, saa panelet kan rette i dem. */
    function resultatTabel(sim, celler) {
        var tabel = document.createElement("table");
        tabel.className = "resultater";
        var hoved = document.createElement("tr");
        ["", "Plastikstav (−)", "Glasstav (+)"].forEach(function (t) {
            var th = document.createElement("th");
            th.textContent = t;
            hoved.appendChild(th);
        });
        tabel.appendChild(hoved);
        D.VAESKE_ORDEN.forEach(function (v) {
            var tr = document.createElement("tr");
            var th = document.createElement("th");
            th.textContent = stort(D.VAESKER[v].navn);
            tr.appendChild(th);
            STAV_ORDEN.forEach(function (id) {
                var td = document.createElement("td");
                td.textContent = sim.resultater[v][id] ? afboejning(v) : "?";
                if (!sim.resultater[v][id]) td.className = "ikke";
                if (celler) {
                    celler[v] = celler[v] || {};
                    celler[v][id] = td;
                }
                tr.appendChild(td);
            });
            tabel.appendChild(tr);
        });
        return tabel;
    }

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
        this.aaben = null;
        this.partikler = [];
        this.udslipRest = 0;
        this.naesteNr = 0;
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
        this.maalerNu = null;
        this.nyNoegle = null;
        this.nyTid = -10;
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
    P.antalResultater = function () {
        var mig = this;
        return D.VAESKE_ORDEN.reduce(function (n, v) { return n + Object.keys(mig.resultater[v]).length; }, 0);
    };

    P.faerdig = function (vaeske) {
        return !!(this.resultater[vaeske].plastik && this.resultater[vaeske].glas);
    };

    P.slut = function () {
        return D.VAESKE_ORDEN.every(this.faerdig, this);
    };

    /* Linjen over skemaet: det naeste, eleven skal goere. */
    P.naeste = function () {
        var mig = this;
        if (this.slut()) return "Skemaet er udfyldt. Se tegneserien, eller tag en opgave.";
        var v = this.aaben;
        if (!v || this.faerdig(v)) {
            if (!this.antalResultater()) return "Klik på en hane, så løber der en stråle.";
            var mangler = D.VAESKE_ORDEN.filter(function (x) { return !mig.faerdig(x); })
                .map(function (x) { return D.VAESKER[x].navn; });
            return "Åbn hanen med " + oplist(mangler, "eller") + ".";
        }
        var mulige = STAV_ORDEN.filter(function (id) { return !mig.resultater[v][id]; });
        var ladede = mulige.filter(function (id) { return mig.stave[id].ladning >= MIN_LADNING; });
        if (!ladede.length) {
            if (mulige.length > 1) return "Tag en stav, og gnid den frem og tilbage på uldkluden.";
            return "Gnid " + STAVE[mulige[0]].navn + " frem og tilbage på uldkluden.";
        }
        if (this.maalerNu) return "Hold staven stille lidt endnu.";
        var id = ladede.indexOf(this.holdt) >= 0 ? this.holdt : ladede[0];
        return "Hold " + STAVE[id].navn + " tæt på strålen af " + D.VAESKER[v].navn + " uden at røre den.";
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

    /* Aabner hanen med vaesken. En aaben hane lukkes, saa der kun loeber én straale. */
    P.aabn = function (vaeske) {
        if (this.aaben === vaeske) return;
        this.aaben = vaeske;
        this.naesteNr++;   /* et hul i nummereringen bryder straalen */
    };

    P.luk = function () {
        this.aaben = null;
    };

    P.skiftHane = function (vaeske) {
        if (this.aaben === vaeske) this.luk();
        else this.aabn(vaeske);
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
    P.flytPartikler = function (dt) {
        var st = this.holdt ? this.stave[this.holdt] : null;
        var traekker = st && st.ladning > 0.01 ? st : null;
        var antal = Math.max(1, Math.ceil(dt / 0.008));
        var h = dt / antal;
        var V = MAAL.VASK;
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
                if (p.y >= V.top && p.x > V.venstre && p.x < V.hoejre) { vaek = true; break; }
                if (p.y >= MAAL.BORD) {
                    this.besked("Strålen rammer ved siden af vasken.", "spild");
                    vaek = true;
                    break;
                }
                if (p.x < -50 || p.x > MAAL.W + 50) { vaek = true; break; }
            }
            if (vaek) continue;
            rest.push(p);
            if (st) {
                var d = afstand(st, p.x, p.y).d;
                if (d < this.minAfstand) { this.minAfstand = d; this.naermeste = p; }
            }
            if (p.y > V.top - 30) this.afboejningNu = Math.max(this.afboejningNu, Math.abs(p.x - p.x0));
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
        if (this.aaben && stykker.length) {
            var sidste = stykker[stykker.length - 1];
            if (sidste.vaeske === this.aaben) sidste.pts.push({ x: T.hane(this.aaben).x, y: MAAL.TUD_Y });
        }
        return stykker;
    };

    /* ----- Test og lup ------------------------------------------------------------ */
    P.registrer = function (dt) {
        this.maalerNu = null;
        var st = this.holdt ? this.stave[this.holdt] : null;
        if (!st || st.ladning < MIN_LADNING || !this.naermeste || this.minAfstand > TEST_AFSTAND || this.partikler.length < 15) return;
        var v = this.naermeste.vaeske;
        if (this.resultater[v][st.id]) return;
        var noegle = v + "|" + st.id;
        this.maalerNu = noegle;
        this.testTid[noegle] = (this.testTid[noegle] || 0) + dt;
        this.testMaks[noegle] = Math.max(this.testMaks[noegle] || 0, this.afboejningNu);
        if (this.testTid[noegle] >= TEST_TID) {
            this.resultater[v][st.id] = { afboejning: this.testMaks[noegle] };
            this.maalerNu = null;
            this.nyNoegle = noegle;
            this.nyTid = this.tid;
            this.besked(stort(D.VAESKER[v].navn) + " med " + st.navn + " er skrevet i skemaet.", "noteret");
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
        this.celler = {};
        NK.el("vand-skema").appendChild(resultatTabel(this, this.celler));
        NK.el("vand-forfra").addEventListener("click", function () { mig.nulstil(); });
    };

    P.signatur = function () {
        var mig = this;
        var ny = this.nyNoegle && this.tid - this.nyTid < 1.5 ? this.nyNoegle : "";
        return [
            D.VAESKE_ORDEN.map(function (v) { return Object.keys(mig.resultater[v]).sort().join("+"); }).join(","),
            this.maalerNu || "", ny, this.naeste(), this.serieSet, !!this.opgaver.opgave
        ].join("|");
    };

    P.opdaterPanel = function () {
        var sig = this.signatur();
        if (sig === this.sidsteSig) return;
        this.sidsteSig = sig;
        var mig = this;
        var ny = sig.split("|")[2];

        D.VAESKE_ORDEN.forEach(function (v) {
            STAV_ORDEN.forEach(function (id) {
                var td = mig.celler[v][id], noegle = v + "|" + id;
                if (mig.resultater[v][id]) {
                    td.textContent = afboejning(v);
                    td.className = noegle === ny ? "ny" : "";
                } else if (noegle === mig.maalerNu) {
                    td.textContent = "måler …";
                    td.className = "maaler";
                } else {
                    td.textContent = "?";
                    td.className = "ikke";
                }
            });
        });
        NK.saetTekst("vand-taeller", this.antalResultater() + "/6");
        NK.saetTekst("vand-naeste", this.naeste());

        var slut = this.slut();
        var knap = NK.el("vand-serieknap");
        knap.hidden = !slut;
        knap.classList.toggle("banker", slut && !this.serieSet);
        NK.saetTekst("vand-serie-tekst", slut ? "Forsøget er slut." : "Låses op, når skemaet er udfyldt.");

        NK.el("vand-opg-knap").disabled = !slut;
        if (!slut) NK.saetTekst("vand-opg-tekst", "Låses op, når skemaet er udfyldt.");
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
        for (var i = 0; i < MAAL.HANER.length; i++) {
            var h = MAAL.HANER[i];
            if (Math.abs(x - h.x) < 44 && y > MAAL.SKILT_Y - 6 && y < MAAL.TUD_Y + 8) return { slags: "hane", vaeske: h.vaeske };
        }
        var k = MAAL.KLUD;
        if (x > k.x && x < k.x + k.b && y > k.y && y < k.y + k.h) return { slags: "klud" };
        if (x > 180 && x < 620 && y > 456 && y < MAAL.BORD) return { slags: "vask" };
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
                mig.skiftHane(g.vaeske);
            } else if (g.slags === "klud") {
                mig.besked("Tag fat i en stav, og træk den frem og tilbage over kluden.", "klud");
            } else if (g.slags === "vask") {
                mig.besked("Afløbet tager det hele. Klik på en hane.", "vask");
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

        if (this.aaben) {
            var hane = T.hane(this.aaben);
            this.udslipRest += UDSLIP * dt;
            while (this.udslipRest >= 1) {
                this.udslipRest -= 1;
                this.partikler.push({ nr: this.naesteNr++, x: hane.x, x0: hane.x, y: MAAL.TUD_Y, vx: 0, vy: START_FART, vaeske: this.aaben });
            }
        } else {
            this.udslipRest = 0;
            this.naesteNr++;   /* et hul i nummereringen bryder straalen */
        }

        this.flytPartikler(dt);

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
        T.klud(ctx);
        T.vask(ctx);
        T.haner(ctx, this.aaben, this.hover && this.hover.slags === "hane" ? this.hover.vaeske : null);

        this.straalestykker().forEach(function (st) {
            T.straale(ctx, [st.pts], D.VAESKER[st.vaeske].farve);
        });

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
        this.opdaterPanel();
    };

    P.skiftVinkelmaaler = function () { /* ingen vinkelmaaler i forsoeget */ };

    NK.SimVandstraale.STAVE = STAVE;
    NK.SimVandstraale.STAV_ORDEN = STAV_ORDEN;
    NK.SimVandstraale.stort = stort;
    NK.SimVandstraale.afboejning = afboejning;
    NK.SimVandstraale.resultatTabel = resultatTabel;
}());
