/* =====================================================================
   sim_elektroner.js - fane 2: elektronerne

   Molekylet staar paa tavlen som en elektronprikformel, som i bogen.
   Hver prik har farven fra det atom, elektronen kom fra, og tallet ved
   hvert atom er elektronegativiteten. Opgaven har tre bidder:

     1. Gaet: eleven skriver sit gaet paa oxidationstallet i opgavekortet
        (med reglerne fra fane 1 eller elektronegativiteten).
     2. Fordel: eleven traekker hvert elektronpar i en binding hen til det
        atom, der traekker hårdest. Et par mellem to ens atomer deles. Et
        par, der ender hos det forkerte atom, bliver roedt, og linjen siger
        hvorfor. Man kan ogsaa klikke paa parret og saa paa atomet.
     3. Regnskabet: naar alle par er paa plads, faar hvert atom en ring om
        sine elektroner og sit oxidationstal (valenselektroner minus de
        elektroner, det har nu), og gaettet sammenlignes.

   Undtagelserne fra reglerne (H₂, O₂, H₂O₂, OF₂) og ionerne (OH⁻ med en
   ekstra elektron, NH₄⁺ med én for lidt) kommer af sig selv af modellen i
   js/ox.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var O = NK.Ox;
    var T = NK.Tegn;

    var SIDEVEKTOR = { op: [0, -1], ned: [0, 1], hoejre: [1, 0], venstre: [-1, 0] };

    function SimElektroner() {
        this.gaetEl = NK.el("ek-gaet");
        this.startFane(D.MOLEKYLER, [{ id: "alle", titel: "Molekyler og ioner" }]);
        this.introNu = true;
        this.vaelg(0);
    }

    var P = SimElektroner.prototype;
    NK.Fane.paa(P, { navn: "ek" });

    P.chipTekst = function (o) { return NK.formel(o.f) + NK.ladningHaevet(o.q); };

    /* ----- Opgaven ------------------------------------------------------------- */
    P.lavOpgave = function (i) {
        var def = this.opgaver[i], m = O.molekyle(def), mig = this;
        this.m = m;
        this.trin = "gaet";
        this.gaet = {};
        this.valgt = null;
        this.traek = null;
        this.venter = 0;
        this.regnVist = false;
        this.regnAlfa = 0;
        this.svarHTML = "";
        this.auto = false;
        this.snap = true;

        this.enheder = m.bindinger.map(function (b) {
            var e = [], n;
            for (n = 0; n < b.orden; n++) e.push({ fra: b.a, x: 0, y: 0 });
            for (n = 0; n < b.orden; n++) e.push({ fra: b.b, x: 0, y: 0 });
            return { b: b, hos: null, forkert: false, e: e, blink: 0 };
        });

        /* De frie elektroner. Ionens ekstra elektron sidder i parret
           modsat bindingen (OH⁻). */
        this.frie = [];
        m.atomer.forEach(function (a) {
            var ekstraSide = null;
            if (a.ekstra) {
                var bundne = Object.keys(a.sider);
                var modsat = bundne.length === 1 ? O.MODSAT[bundne[0]] : null;
                ekstraSide = modsat && a.par.indexOf(modsat) >= 0 ? modsat : a.par[a.par.length - 1];
            }
            a.par.forEach(function (side) {
                for (var n = 0; n < 2; n++) {
                    var ekstra = side === ekstraSide && n === 1;
                    mig.frie.push({ atom: a.i, side: side, n: n, ekstra: ekstra, x: 0, y: 0 });
                }
            });
        });
        this.bygGaet();
        this.visRegnskab();
    };

    P.opgaveFaerdig = function () { return this.regnVist; };

    P.spurgte = function () { return this.m.def.spoerg; };

    function liste(ord) {
        if (ord.length < 2) return ord.join("");
        return ord.slice(0, -1).join(", ") + " og " + ord[ord.length - 1];
    }

    P.promptHTML = function () {
        return '<p class="maal-tekst">Find oxidationstallet for ' + liste(this.spurgte()) + " i " + this.m.tekst + ".</p>";
    };

    P.trinLinje = function () {
        var s = this.spurgte();
        if (this.trin === "gaet") {
            var mangler = s.filter(function (x) { return this.gaet[x] === undefined; }, this);
            return "Gæt først: skriv oxidationstallet for " + liste(mangler) + " i " + (mangler.length > 1 ? "felterne" : "feltet") +
                " i opgavekortet, og tryk Enter.";
        }
        if (this.trin === "fordel") {
            return "Træk hvert elektronpar hen til det atom, der trækker hårdest. Tallet ved atomet er elektronegativiteten.";
        }
        return "";
    };

    /* ----- Hjaelpen ---------------------------------------------------------------- */
    P.trinInfo = function () {
        var mig = this;
        if (this.trin === "gaet") {
            return {
                hint: "Brug reglerne: H er som regel +I, O er som regel −II, og summen er ladningen. Du kan også bruge tallene ved atomerne.",
                svarNavn: "Spring gættet over",
                svar: function () { mig.springGaet(); }
            };
        }
        if (this.trin === "fordel") {
            return {
                hint: "Tallet ved hvert atom er elektronegativiteten. Parret går til atomet med det største tal. Er tallene ens, deles parret.",
                svar: function () { mig.visFordeling(); }
            };
        }
        return null;
    };

    /* ----- Gaettet i opgavekortet --------------------------------------------------- */
    P.bygGaet = function () {
        var mig = this;
        this.gaetEl.innerHTML = "";
        this.gaetFelter = {};
        this.spurgte().forEach(function (s) {
            var rk = document.createElement("div");
            rk.className = "gaet-rk";
            var navn = document.createElement("span");
            navn.className = "gaet-s";
            navn.textContent = s;
            navn.style.color = D.GRUNDSTOF[s].farve;
            var felt = document.createElement("div");
            felt.className = "felt aktiv";
            var inp = document.createElement("input");
            inp.type = "text";
            inp.placeholder = "dit gæt";
            inp.autocomplete = "off";
            inp.spellcheck = false;
            inp.setAttribute("aria-label", "Dit gæt på oxidationstallet for " + s);
            var ok = document.createElement("button");
            ok.type = "button";
            ok.className = "felt-ok";
            ok.textContent = "↵";
            ok.title = "Gæt (Enter)";
            var svar = document.createElement("span");
            svar.className = "felt-svar";
            svar.hidden = true;
            inp.addEventListener("keydown", function (e) {
                if (e.key === "Enter") { e.preventDefault(); mig.gaetTjek(s); }
            });
            inp.addEventListener("input", function () { felt.classList.remove("ryst"); mig.k.skriver(); });
            ok.addEventListener("click", function () { mig.gaetTjek(s); });
            felt.appendChild(inp);
            felt.appendChild(ok);
            felt.appendChild(svar);
            rk.appendChild(navn);
            rk.appendChild(felt);
            mig.gaetEl.appendChild(rk);
            mig.gaetFelter[s] = { felt: felt, inp: inp, ok: ok, svar: svar };
        });
        this.visGaet();
    };

    P.gaetTjek = function (s) {
        if (this.trin !== "gaet" || this.gaet[s] !== undefined) return;
        var f = this.gaetFelter[s], v = O.laesOx(f.inp.value);
        if (v === null || isNaN(v)) {
            f.felt.classList.remove("ryst");
            void f.felt.offsetWidth;
            f.felt.classList.add("ryst");
            this.fejlLinje(v === null ? "Skriv dit gæt i feltet først." : "Skriv et oxidationstal, fx −II, +I eller 0.");
            return;
        }
        this.gaet[s] = v;
        this.visGaet();
        var mangler = this.spurgte().filter(function (x) { return this.gaet[x] === undefined; }, this);
        if (mangler.length) {
            this.besked("Skriv også dit gæt for " + liste(mangler) + ".", "");
            this.fokus();
            return;
        }
        this.trin = "fordel";
        this.nytTrin("Dit gæt er skrevet ned. Nu viser elektronerne, om det passer.");
    };

    P.springGaet = function () {
        var mig = this;
        this.spurgte().forEach(function (s) { if (mig.gaet[s] === undefined) mig.gaet[s] = null; });
        this.trin = "fordel";
        this.visGaet();
        this.nytTrin("Du gætter ikke denne gang.");
    };

    P.visGaet = function () {
        var mig = this;
        this.spurgte().forEach(function (s) {
            var f = mig.gaetFelter[s], g = mig.gaet[s];
            var sand = O.oxFor(mig.m, s);
            var aaben = g === undefined && mig.trin === "gaet";
            f.inp.hidden = !aaben;
            f.ok.hidden = !aaben;
            f.svar.hidden = aaben;
            f.felt.className = "felt";
            if (aaben) { f.felt.classList.add("aktiv"); return; }
            var t;
            if (g === null || g === undefined) t = "Intet gæt";
            else t = "Dit gæt: <b>" + O.ox(g) + "</b>";
            if (mig.regnVist) {
                if (g !== null && g !== undefined && g === sand) { f.felt.classList.add("ok"); t += " ✓"; }
                else { f.felt.classList.add(g === null || g === undefined ? "laast" : "forkert"); t += ". Elektronerne giver <b>" + O.ox(sand) + "</b>."; }
            } else f.felt.classList.add("gaettet");
            f.svar.innerHTML = t;
        });
    };

    P.fokusFelt = function () {
        if (this.trin !== "gaet") return;
        var s = this.spurgte().filter(function (x) { return this.gaet[x] === undefined; }, this)[0];
        if (s && document.activeElement !== this.gaetFelter[s].inp) this.gaetFelter[s].inp.focus();
    };

    /* ----- Fordelingen ------------------------------------------------------------------ */
    P.paaPlads = function (u) {
        if (u.b.mest === -1) return u.hos === "delt";
        return u.hos === u.b.mest;
    };

    P.enNavn = function (a) { return a.en.toFixed(1).replace(".", ","); };

    /* Parret u gives til atom i (eleven har sluppet det der) */
    P.tildel = function (u, i, stille) {
        var m = this.m, til = m.atomer[i], mod = m.atomer[i === u.b.a ? u.b.b : u.b.a];
        this.valgt = null;
        if (u.b.mest === -1) {
            u.hos = "delt";
            u.forkert = false;
            if (!stille) this.besked(NK.html("To " + til.s + " trækker lige hårdt. Parret deles: " +
                (u.b.orden > 1 ? "to elektroner" : "én elektron") + " til hver."), "god");
        } else if (u.b.mest === i) {
            u.hos = i;
            u.forkert = false;
            if (!stille) this.besked(NK.html("Rigtigt. " + til.s + " (" + this.enNavn(til) + ") trækker hårdere end " + mod.s +
                " (" + this.enNavn(mod) + ")."), "god");
        } else {
            u.hos = i;
            u.forkert = true;
            u.blink = 1;
            if (!stille) this.fejlLinje(til.s + " har " + this.enNavn(til) + ", og " + mod.s + " har " + this.enNavn(mod) + ". " +
                mod.s + " trækker hårdest, så parret skal hen til " + mod.s + ".");
        }
        if (this.afvisTilbud) this.afvisTilbud();
        this.tjekFordelt();
    };

    P.tjekFordelt = function () {
        var mig = this;
        if (this.trin !== "fordel") return;
        if (!this.enheder.every(function (u) { return mig.paaPlads(u); })) return;
        this.trin = "regnskab";
        this.venter = 0.6;
        this.auto = true;
        this.visKnap();
    };

    /* Vis svaret: resten af parrene gaar paa plads */
    P.visFordeling = function () {
        var mig = this, m = this.m, set = {}, dele = [];
        this.enheder.forEach(function (u) {
            var A = m.atomer[u.b.a], B = m.atomer[u.b.b];
            var noegle = [A.s, B.s].sort().join("-");
            if (!set[noegle]) {
                set[noegle] = true;
                if (u.b.mest === -1) dele.push("Parret mellem to " + A.s + " deles.");
                else {
                    var mest = m.atomer[u.b.mest], mind = u.b.mest === u.b.a ? B : A;
                    dele.push(mest.s + " (" + mig.enNavn(mest) + ") trækker hårdere end " + mind.s + " (" + mig.enNavn(mind) + ").");
                }
            }
            if (!mig.paaPlads(u)) mig.tildel(u, u.b.mest === -1 ? u.b.a : u.b.mest, true);
        });
        this.svarHTML = NK.html(dele.join(" "));
        this.svarMaade = "svar";
    };

    /* Regnskabet: kaldes, naar alle par er paa plads og lidt tid er gaaet */
    P.gorRegnskabOp = function () {
        this.regnVist = true;
        this.auto = false;
        this.visGaet();
        this.visRegnskab();
        this.trinLoest(this.svarMaade || "selv", this.svarHTML);
        this.svarMaade = null;
    };

    P.gaetRigtigt = function () {
        var mig = this;
        return this.spurgte().every(function (s) { return mig.gaet[s] !== null && mig.gaet[s] === O.oxFor(mig.m, s); });
    };

    P.stjerneNu = function () { return !this.brugtSvar && this.gaetRigtigt(); };

    P.slutLinje = function () {
        var mig = this, dele = [];
        var gaettet = this.spurgte().filter(function (s) { return mig.gaet[s] !== null && mig.gaet[s] !== undefined; });
        if (gaettet.length) {
            if (this.gaetRigtigt()) dele.push("Dit gæt passede.");
            else {
                gaettet.forEach(function (s) {
                    var sand = O.oxFor(mig.m, s);
                    if (mig.gaet[s] !== sand) dele.push("Du gættede " + O.ox(mig.gaet[s]) + " for " + s + ". Elektronerne giver " + O.ox(sand) + ".");
                });
            }
        }
        dele.push(this.m.def.forklar);
        return NK.html(dele.join(" "));
    };

    /* ----- Regnskabet i panelet ---------------------------------------------------------- */
    P.visRegnskab = function () {
        var m = this.m;
        if (!this.regnVist) {
            NK.saetHTML("ek-regnskab", '<p class="note rs-vent">Regnskabet kommer, når alle elektronpar er fordelt.</p>');
            return;
        }
        var rk = O.regnskab(m), spurgt = this.spurgte();
        var html = '<table class="rs-tabel"><thead><tr><th></th><th>valens&shy;elektroner</th><th>har nu</th><th>oxidations&shy;tal</th></tr></thead><tbody>';
        /* Mellemregningen med almindelige tal, oxidationstallet med romertal */
        rk.forEach(function (r) {
            html += '<tr class="' + (spurgt.indexOf(r.s) >= 0 ? "spurgt" : "") + '"><th style="color:' + D.GRUNDSTOF[r.s].farve + '">' + r.s +
                "</th><td>" + r.v + "</td><td>" + r.nu + '</td><td class="ox">' + r.v + " − " + r.nu + " = " + O.lad(r.ox) +
                '<b class="rs-rom">' + O.ox(r.ox) + "</b></td></tr>";
        });
        html += "</tbody></table>";
        html += '<p class="rs-sum">Summen: ' + NK.html(this.sumTekst()) + "</p>";
        NK.saetHTML("ek-regnskab", html);
    };

    P.sumTekst = function () {
        var rk = O.regnskab(this.m);
        return rk.map(function (r) { return (r.antal > 1 ? r.antal + " · " : "") + O.talP(r.ox); }).join(" + ") +
            " = " + O.lad(this.m.q) + (this.m.q ? ", ionens ladning" : "");
    };

    /* ----- Geometrien -------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var baand = this.k.layout(W, H);
        var kant = NK.klamp(W * 0.025, 10, 30), top = NK.klamp(H * 0.03, 8, 22);
        var tv = { x: kant, y: top, b: W - 2 * kant, h: Math.max(180, baand.y - top - NK.klamp(H * 0.025, 8, 18)) };
        var ramme = NK.klamp(tv.b * 0.012, 7, 12);
        var hoved = NK.klamp(tv.h * 0.12, 34, 56);
        var ind = { x: tv.x + ramme + 16, y: tv.y + ramme + hoved, b: tv.b - 2 * ramme - 32, h: tv.h - 2 * ramme - hoved - 40 };
        this.lay = { W: W, H: H, baand: baand, tv: tv, ramme: ramme, ind: ind, hoved: hoved };
        this.geometri();
        this.snap = true;
        var g = this.geo;
        this.saetAnker("molekyle", g.bx0, g.by0, g.bx1 - g.bx0, g.by1 - g.by0);
        this.saetAnker("en", tv.x + tv.b - ramme - 310, tv.y + ramme + 4, 304, hoved - 6);
        this.saetAnker("laerer", 0, baand.y, W * 0.45, baand.h);
    };

    P.geometri = function () {
        var m = this.m, ind = this.lay.ind, ctx = this.L.ctx;
        var gx = m.atomer.map(function (a) { return a.gx; }), gy = m.atomer.map(function (a) { return a.gy; });
        var minX = Math.min.apply(null, gx), maxX = Math.max.apply(null, gx);
        var minY = Math.min.apply(null, gy), maxY = Math.max.apply(null, gy);
        var ion = m.q !== 0;
        var L = Math.min(ind.b / (maxX - minX + (ion ? 2.2 : 1.7)), ind.h / (maxY - minY + (ion ? 2.1 : 1.8)), 240);
        var F = NK.klamp(L * 0.35, 24, 78);
        var cx = ind.x + ind.b / 2 - (minX + maxX) / 2 * L;
        var cy = ind.y + ind.h / 2 - (minY + maxY) / 2 * L;
        ctx.save();
        ctx.font = T.font("700", F);
        var pos = m.atomer.map(function (a) {
            return { x: cx + a.gx * L, y: cy + a.gy * L, hb: ctx.measureText(a.s).width / 2 };
        });
        ctx.restore();
        this.geo = {
            L: L, F: F, r: Math.max(3.3, F * 0.085), s: F * 0.13, s2: F * 0.14, pos: pos,
            bx0: cx + minX * L - F * 1.2, bx1: cx + maxX * L + F * 1.2,
            by0: cy + minY * L - F * 1.2, by1: cy + maxY * L + F * 1.2
        };
    };

    /* Afstanden fra atomets midte ud til elektronerne paa en side */
    P.sideAfstand = function (i, side) {
        var g = this.geo, p = g.pos[i];
        if (side === "op" || side === "ned") return g.F * 0.58 + g.r;
        return p.hb + g.F * 0.16 + g.r * 0.6;
    };

    function vinkelret(v) { return [-v[1], v[0]]; }

    /* Hvor en elektron skal staa lige nu */
    P.maalFri = function (e) {
        var g = this.geo, p = g.pos[e.atom], v = SIDEVEKTOR[e.side], pv = vinkelret(v);
        var d = this.sideAfstand(e.atom, e.side), s = (e.n ? 1 : -1) * g.s;
        return { x: p.x + v[0] * d + pv[0] * s, y: p.y + v[1] * d + pv[1] * s };
    };

    P.enhedGeo = function (u) {
        var g = this.geo, A = g.pos[u.b.a], B = g.pos[u.b.b];
        var dx = B.x - A.x, dy = B.y - A.y, l = Math.sqrt(dx * dx + dy * dy) || 1;
        var ax = [dx / l, dy / l];
        return { A: A, B: B, ax: ax, pv: vinkelret(ax), mid: { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 } };
    };

    /* Parrets form i midten af bindingen, som forskydninger fra midten */
    P.formMidt = function (u) {
        var g = this.geo, eg = this.enhedGeo(u), ud = [], o = u.b.orden;
        u.e.forEach(function (e, k) {
            var fraA = e.fra === u.b.a, j = fraA ? k : k - o;
            var s = (fraA ? -1 : 1) * g.s, a = 0;
            if (o === 2) { s = (j ? 1 : -1) * g.s; a = (fraA ? -1 : 1) * g.s2; }
            ud.push({ x: eg.ax[0] * a + eg.pv[0] * s, y: eg.ax[1] * a + eg.pv[1] * s });
        });
        return ud;
    };

    P.maalEnhed = function (u) {
        var mig = this, g = this.geo, eg = this.enhedGeo(u), o = u.b.orden;
        var form = this.formMidt(u);
        if (u.hos === null || u.hos === undefined) {
            return form.map(function (f) { return { x: eg.mid.x + f.x, y: eg.mid.y + f.y }; });
        }
        if (u.hos === "delt") {
            return u.e.map(function (e, k) {
                var fraA = e.fra === u.b.a, i = e.fra, p = g.pos[i];
                var side = fraA ? u.b.sideA : u.b.sideB, v = SIDEVEKTOR[side], pv = vinkelret(v);
                var d = mig.sideAfstand(i, side), j = fraA ? k : k - o;
                var s = o === 1 ? 0 : (j ? 1 : -1) * g.s;
                return { x: p.x + v[0] * d + pv[0] * s, y: p.y + v[1] * d + pv[1] * s };
            });
        }
        /* Hos ét atom: parret ligger paa atomets side mod det andet atom.
           En dobbeltbinding ligger i to raekker; atomets egne inderst. */
        var i = u.hos, p = g.pos[i], hosA = i === u.b.a;
        var side = hosA ? u.b.sideA : u.b.sideB, v = SIDEVEKTOR[side], pv = vinkelret(v);
        var d = this.sideAfstand(i, side);
        return u.e.map(function (e, k) {
            var egen = e.fra === i, j = e.fra === u.b.a ? k : k - o;
            var dd = o === 1 ? d : d + (egen ? 0 : 2 * g.s2);
            var s = o === 1 ? (e.fra === u.b.a ? -1 : 1) * g.s : (j ? 1 : -1) * g.s;
            return { x: p.x + v[0] * dd + pv[0] * s, y: p.y + v[1] * dd + pv[1] * s };
        });
    };

    P.midte = function (u) {
        var x = 0, y = 0;
        u.e.forEach(function (e) { x += e.x; y += e.y; });
        return { x: x / u.e.length, y: y / u.e.length };
    };

    /* ----- Tid ---------------------------------------------------------------------------- */
    P.opdaterScene = function (dt) {
        var mig = this;
        if (!this.geo) return;
        var hurtig = this.snap ? 1e6 : 12;
        this.frie.forEach(function (e) {
            var p = mig.maalFri(e);
            e.x = NK.mod(e.x, p.x, hurtig, dt || 1);
            e.y = NK.mod(e.y, p.y, hurtig, dt || 1);
        });
        this.enheder.forEach(function (u) {
            if (u.blink > 0) u.blink = Math.max(0, u.blink - dt / 1.2);
            if (mig.traek && mig.traek.u === u && mig.traek.flyttet) {
                var form = mig.formMidt(u), pt = mig.traek.pt;
                u.e.forEach(function (e, k) { e.x = pt.x + form[k].x; e.y = pt.y + form[k].y; });
                return;
            }
            var maal = mig.maalEnhed(u);
            u.e.forEach(function (e, k) {
                e.x = NK.mod(e.x, maal[k].x, hurtig, dt || 1);
                e.y = NK.mod(e.y, maal[k].y, hurtig, dt || 1);
            });
        });
        this.snap = false;
        if (this.venter > 0) {
            this.venter -= dt;
            if (this.venter <= 0) { this.venter = 0; this.gorRegnskabOp(); }
        }
        this.regnAlfa = this.regnVist ? Math.min(1, this.regnAlfa + dt / 0.6) : 0;
    };

    /* ----- Musen ------------------------------------------------------------------------------ */
    P.enhedUnder = function (pt) {
        var g = this.geo, bedst = null, bd = 1e9;
        if (!g || !pt) return null;
        var mig = this;
        this.enheder.forEach(function (u) {
            var d = 1e9;
            u.e.forEach(function (e) { d = Math.min(d, Math.hypot(pt.x - e.x, pt.y - e.y)); });
            var c = mig.midte(u);
            if (u.hos === null) d = Math.min(d, Math.hypot(pt.x - c.x, pt.y - c.y) - g.F * 0.12);
            if (d < g.F * 0.34 + 4 && d < bd) { bd = d; bedst = u; }
        });
        return bedst;
    };

    P.atomUnder = function (pt) {
        var g = this.geo;
        if (!g || !pt) return -1;
        for (var i = 0; i < g.pos.length; i++) {
            var p = g.pos[i];
            if (Math.abs(pt.x - p.x) <= Math.max(p.hb, g.F * 0.36) + 6 && Math.abs(pt.y - p.y) <= g.F * 0.42 + 4) return i;
        }
        return -1;
    };

    P.friUnder = function (pt) {
        var g = this.geo;
        if (!g || !pt) return null;
        for (var n = 0; n < this.frie.length; n++) {
            var e = this.frie[n];
            if (Math.hypot(pt.x - e.x, pt.y - e.y) < g.r + 7) return e;
        }
        return null;
    };

    P.overScene = function (pt) {
        this.overU = pt ? this.enhedUnder(pt) : null;
        this.overA = pt ? this.atomUnder(pt) : -1;
        if (this.overU && this.trin === "fordel") return "greb";
        if (this.overA >= 0 || this.overU || (pt && this.friUnder(pt))) return "info";
        return null;
    };

    /* Et par, der ikke kan flyttes endnu, svarer med en besked, og det
       klik, der foelger efter, maa ikke skrive noget andet oven i den */
    P.nedScene = function (pt) {
        this.ignorerKlik = false;
        var u = this.enhedUnder(pt);
        if (!u) return false;
        if (this.trin === "gaet") {
            this.kortBesked("Gæt først. Skriv dit gæt i opgavekortet og tryk Enter.", 4);
            this.ignorerKlik = true;
            return false;
        }
        if (this.trin !== "fordel") {
            this.kortBesked("Parrene er fordelt. Start forfra, hvis du vil prøve igen.", 4);
            this.ignorerKlik = true;
            return false;
        }
        this.traek = { u: u, start: pt, pt: pt, flyttet: false };
        return true;
    };

    P.flytScene = function (pt) {
        var t = this.traek;
        if (!t) return;
        t.pt = pt;
        if (!t.flyttet && Math.abs(pt.x - t.start.x) + Math.abs(pt.y - t.start.y) > 6) {
            t.flyttet = true;
            this.valgt = null;
        }
    };

    P.opScene = function (pt) {
        var t = this.traek;
        this.traek = null;
        if (!t) return;
        var u = t.u;
        if (!t.flyttet) {
            this.valgt = u;
            this.kortBesked("Klik nu på det atom, parret skal hen til. Du kan også trække det derhen.", 5);
            return;
        }
        var maal = this.naermest(u, pt);
        if (maal >= 0) { this.tildel(u, maal); return; }
        if (this.k.inde() && this.k.under(pt) === "kop") { this.k.svar(NK.html(D.KAFFE_PAR), "", 4); return; }
        this.kortBesked("Slip parret tæt på et af de to atomer, det sidder imellem.", 4);
    };

    /* Det af parrets to atomer, der er taettest paa punktet, hvis det er taet nok */
    P.naermest = function (u, pt) {
        var g = this.geo, A = g.pos[u.b.a], B = g.pos[u.b.b];
        var dA = Math.hypot(pt.x - A.x, pt.y - A.y), dB = Math.hypot(pt.x - B.x, pt.y - B.y);
        var d = Math.min(dA, dB);
        if (d > g.L * 0.85) return -1;
        return dA <= dB ? u.b.a : u.b.b;
    };

    P.klikScene = function (pt) {
        if (this.ignorerKlik) { this.ignorerKlik = false; return; }
        var m = this.m, i = this.atomUnder(pt);
        if (this.valgt) {
            var u = this.valgt;
            if (i === u.b.a || i === u.b.b) { this.tildel(u, i); return; }
            this.valgt = null;
        }
        if (i >= 0) {
            var a = m.atomer[i];
            var t = a.s + " har elektronegativiteten " + this.enNavn(a) + " og " + a.v + " valenselektron" + (a.v > 1 ? "er" : "") + ".";
            if (this.trin === "fordel") t += " Træk et elektronpar hen til atomet.";
            this.kortBesked(NK.html(t), 5);
            return;
        }
        var e = this.friUnder(pt);
        if (e) {
            this.kortBesked(NK.html(e.ekstra ? "Ionens ekstra elektron. Den gør ionen negativ." :
                "Et frit elektronpar. Det tilhører allerede " + m.atomer[e.atom].s + "."), 4);
        }
    };

    P.tast = function () { return false; };

    /* ----- Tegning ------------------------------------------------------------------------------ */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, g = this.geo, m = this.m, mig = this;
        if (!lay || !g) return;
        T.vaeg(ctx, lay.W, lay.baand.y);
        T.tavle(ctx, lay.tv, lay.ramme);
        this.tegnHoved(ctx);

        var tid = this.tid;
        /* Sporene mellem bundne atomer */
        ctx.save();
        ctx.strokeStyle = "rgba(233, 238, 233, 0.13)";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 6]);
        this.enheder.forEach(function (u) {
            var eg = mig.enhedGeo(u), ha = g.pos[u.b.a].hb + g.F * 0.12, hb = g.pos[u.b.b].hb + g.F * 0.12;
            var va = u.b.sideA === "op" || u.b.sideA === "ned" ? g.F * 0.45 : ha;
            var vb = u.b.sideB === "op" || u.b.sideB === "ned" ? g.F * 0.45 : hb;
            ctx.beginPath();
            ctx.moveTo(eg.A.x + eg.ax[0] * va, eg.A.y + eg.ax[1] * va);
            ctx.lineTo(eg.B.x - eg.ax[0] * vb, eg.B.y - eg.ax[1] * vb);
            ctx.stroke();
        });
        ctx.restore();

        /* Ringene om hvert atoms elektroner i regnskabet */
        if (this.regnAlfa > 0) {
            m.atomer.forEach(function (a) {
                var p = g.pos[a.i];
                ctx.save();
                ctx.globalAlpha = mig.regnAlfa;
                ctx.beginPath();
                ctx.arc(p.x, p.y, g.F * 1.02, 0, Math.PI * 2);
                ctx.fillStyle = hexAlfa(a.farve, 0.09);
                ctx.fill();
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = hexAlfa(a.farve, 0.45);
                ctx.stroke();
                ctx.restore();
            });
        }

        if (m.q) T.klammer(ctx, g.bx0, g.by0, g.bx1, g.by1, m.q > 0 ? (m.q > 1 ? m.q + "+" : "+") : (m.q < -1 ? -m.q + "−" : "−"), g.F);

        /* Atomerne: symbolet, elektronegativiteten og ringene, naar et par holdes */
        var holdt = this.traek && this.traek.flyttet ? this.traek.u : null;
        var maalAtom = holdt ? this.naermest(holdt, this.traek.pt) : -1;
        m.atomer.forEach(function (a) {
            var p = g.pos[a.i];
            if (holdt && (a.i === holdt.b.a || a.i === holdt.b.b)) {
                T.ring(ctx, p.x, p.y, g.F * 0.62, a.i === maalAtom ? "rgba(242, 197, 61, 0.95)" : "rgba(242, 197, 61, 0.3)", a.i === maalAtom ? 3 : 2);
            } else if (mig.valgt && (a.i === mig.valgt.b.a || a.i === mig.valgt.b.b)) {
                T.ring(ctx, p.x, p.y, g.F * 0.62, "rgba(242, 197, 61, " + (0.45 + 0.35 * Math.sin(tid * 5)) + ")", 2, [5, 4]);
            } else if (mig.overA === a.i) {
                T.ring(ctx, p.x, p.y, g.F * 0.62, "rgba(233, 238, 233, 0.25)", 1.5);
            }
            ctx.save();
            ctx.font = T.font("700", g.F);
            ctx.textAlign = "center";
            ctx.textBaseline = "alphabetic";
            ctx.fillStyle = a.farve;
            ctx.fillText(a.s, p.x, p.y + g.F * 0.35);
            var epx = Math.max(13, Math.round(g.F * 0.27));
            ctx.font = T.font("600", epx);
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillStyle = T.KRIDT_SVAG;
            ctx.fillText(mig.enNavn(a), p.x + p.hb + g.F * 0.06, p.y + g.F * 0.3);
            ctx.restore();
        });

        /* Den elektron, NH₄⁺ mangler */
        m.atomer.forEach(function (a) {
            if (!a.mangler) return;
            var p = g.pos[a.i];
            T.tomPrik(ctx, p.x - p.hb - g.F * 0.12, p.y - g.F * 0.46, g.r + 0.5);
        });

        /* De frie elektroner */
        this.frie.forEach(function (e) {
            T.prik(ctx, e.x, e.y, g.r, e.ekstra ? D.EKSTRA_FARVE : m.atomer[e.atom].farve);
        });

        /* Bindingernes elektroner (det holdte par til sidst) */
        this.enheder.forEach(function (u) { if (u !== holdt) mig.tegnEnhed(ctx, u); });
        if (holdt) this.tegnEnhed(ctx, holdt);

        /* Oxidationstallene i regnskabet */
        if (this.regnAlfa > 0) {
            var spurgt = this.spurgte();
            m.atomer.forEach(function (a) {
                var p = g.pos[a.i], er = spurgt.indexOf(a.s) >= 0;
                ctx.save();
                ctx.globalAlpha = mig.regnAlfa;
                ctx.font = T.font("800", Math.max(16, Math.round(g.F * (er ? 0.46 : 0.36))));
                ctx.textAlign = "left";
                ctx.textBaseline = "bottom";
                ctx.lineWidth = 4;
                ctx.strokeStyle = "rgba(20, 30, 26, 0.9)";
                var t = O.ox(m.ox[a.i]);
                ctx.strokeText(t, p.x + p.hb + g.F * 0.04, p.y - g.F * 0.3);
                ctx.fillStyle = er ? "#f5d34f" : "#dfe6e1";
                ctx.fillText(t, p.x + p.hb + g.F * 0.04, p.y - g.F * 0.3);
                ctx.restore();
            });
            this.tegnSum(ctx);
        }

        this.k.tegn(ctx);
    };

    P.tegnEnhed = function (ctx, u) {
        var g = this.geo, m = this.m, tid = this.tid;
        var c = this.midte(u), rad = (u.b.orden > 1 ? 1.35 : 1) * g.F * 0.3;
        if (u.forkert) {
            T.ring(ctx, c.x, c.y, rad + 2, "rgba(240, 110, 96, " + (0.75 + 0.25 * u.blink) + ")", 2.5);
        } else if (this.valgt === u) {
            T.ring(ctx, c.x, c.y, rad + 2, "rgba(242, 197, 61, 0.95)", 2.5);
        } else if (this.trin === "fordel" && !this.paaPlads(u) && u.hos === null) {
            /* Parrene, der mangler, banker stille: dem kan man flytte */
            var puls = 0.5 + 0.5 * Math.sin(tid * 3.2 + u.b.i * 0.9);
            T.ring(ctx, c.x, c.y, rad + 1 + 3 * puls, "rgba(242, 197, 61, " + (0.18 + 0.3 * puls) + ")", 2);
        } else if (this.overU === u && this.trin === "fordel") {
            T.ring(ctx, c.x, c.y, rad + 2, "rgba(233, 238, 233, 0.4)", 1.5);
        }
        u.e.forEach(function (e) { T.prik(ctx, e.x, e.y, g.r, m.atomer[e.fra].farve); });
    };

    P.tegnHoved = function (ctx) {
        var lay = this.lay, tv = lay.tv, r = lay.ramme, m = this.m;
        var x = tv.x + r + 16, y = tv.y + r + lay.hoved * 0.5;
        ctx.save();
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.font = T.font("700", 17);
        ctx.fillStyle = T.KRIDT;
        ctx.fillText(m.def.navn, x, y);
        var b = ctx.measureText(m.def.navn).width;
        ctx.font = T.font("600", 20);
        ctx.fillStyle = T.KRIDT_SVAG;
        ctx.fillText(m.tekst, x + b + 12, y);
        /* Forklaringen oppe til hoejre */
        ctx.textAlign = "right";
        ctx.font = T.font("600", 13);
        ctx.fillStyle = T.KRIDT_SVAG;
        var hx = tv.x + tv.b - r - 14;
        ctx.fillText("Tallet ved atomet: elektronegativiteten", hx, y - 9);
        ctx.fillText("Prikkens farve: det atom, elektronen kom fra", hx, y + 9);
        /* Ionens ekstra eller manglende elektron */
        var ex = x, ey = y + lay.hoved * 0.5 + 8;
        ctx.textAlign = "left";
        m.atomer.forEach(function (a) {
            if (!a.ekstra && !a.mangler) return;
            if (a.ekstra) T.prik(ctx, ex + 5, ey, 4.5, D.EKSTRA_FARVE);
            else T.tomPrik(ctx, ex + 5, ey, 5);
            ctx.fillStyle = T.KRIDT_SVAG;
            ctx.fillText(a.ekstra ? "ionens ekstra elektron" : "den elektron, ionen mangler", ex + 16, ey);
        });
        ctx.restore();
    };

    P.tegnSum = function (ctx) {
        var lay = this.lay, tv = lay.tv, r = lay.ramme;
        ctx.save();
        ctx.globalAlpha = this.regnAlfa;
        ctx.font = T.font("700", NK.klamp(Math.round(this.geo.F * 0.36), 16, 22));
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = T.KRIDT;
        ctx.fillText("Summen: " + this.sumTekst(), tv.x + tv.b / 2, tv.y + tv.h - r - 12);
        ctx.restore();
    };

    function hexAlfa(hex, a) {
        var n = parseInt(hex.slice(1), 16);
        return "rgba(" + (n >> 16 & 255) + ", " + (n >> 8 & 255) + ", " + (n & 255) + ", " + a + ")";
    }

    NK.SimElektroner = SimElektroner;
}());
