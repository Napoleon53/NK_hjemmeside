/* =====================================================================
   sim_glas.js - fane 2: c eller n?

   Baegerglas paa 1 L med kobber(II)sulfat. Prikkerne i et glas er
   stoffet (én prik er 0,01 mol), saa antallet er stofmaengden n.
   Lupperne over glassene viser altid lige meget vaeske, saa ionerne i
   dem foelger koncentrationen c. Otte opgaver med korte spoergsmaal,
   hvor eleven skal skelne mellem n (mol) og c (M): hvilket glas har den
   stoerste stofmaengde eller koncentration, hvad der staar paa
   etiketten, hvad der sker, naar man haelder halvdelen over, haelder to
   glas sammen eller haelder vand i, og hvilken enhed et regnestykke
   giver (brugerens oenske 29. sept. 2026: mere traening i forskellen paa
   c og n, gerne med animationer).

   Spoergsmaalet staar med svarene side om side paa kortet oeverst i
   scenen, ikke i panelet (brugerens oenske 9. okt. 2026: eleverne kigger
   ikke ud i siden; kortData og js/fane.js). Der staar ingen tekst paa
   vaeggen mere: indledningen er kortets foerste linje.

   Et rigtigt svar faar scenen til at vise det: prikkerne taelles, tallet
   kommer i tabellen, etiketten kommer paa glasset, eller enhederne
   streges ud paa kortet. Et forkert svar forklares og kan ikke vaelges igen.

   Efter et rigtigt svar bliver kortet groent med svaret og forklaringen,
   og kortets knap hedder Naeste spoergsmaal: det naeste kommer foerst, naar
   eleven selv gaar videre. Det, tabellen viste, foer der blev haeldt, staar som
   en lille linje under de tal, der har aendret sig, og etiketten bliver
   paa et glas, der er haeldt tomt (brugerens oenske 3. okt. 2026).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;
    var ST = D.stof("CuSO4");
    /* Pladsen til kortet oeverst i scenen: almindelig skaerm og lav skaerm */
    var ZONE = [206, 176];

    function SimGlas() {
        this.over = null;
        this.startFane(D.GLAS);
        this.el.tabel = NK.el("glas-tabel");
        this.introNu = true;
        this.vaelg(0, false);
    }

    var P = SimGlas.prototype;
    NK.Fane.paa(P, { navn: "glas", naesteFane: "fane-kolbe", naesteNavn: "Målekolben", zone: ZONE });

    function cAf(g) { return g.V > 0 ? g.n / (g.V / 1000) : 0; }
    function antalPrikker(n) { return Math.round(n / D.PRIK_GLAS + 1e-9); }
    function talTekst(g, h) {
        return h === "n" ? K.to(g.n) + " mol" : (h === "V" ? K.to(g.V / 1000) + " L" : K.to(cAf(g)) + " M");
    }

    /* ----- Opgaven -------------------------------------------------------------- */
    P.lavOpgave = function (i) {
        var spec = D.GLAS[i], mig = this;
        this.opg = spec;
        this.froe = Tg.froe(101 + i * 17);
        this.glas = spec.glas.map(function (g, j) {
            var n = g.n !== undefined ? g.n : g.c * g.V / 1000;
            var gl = { navn: g.navn, V: g.V, n: n, visV: g.V / 1000, etiket: !!g.etiket, prikker: [],
                       kendt: { n: /n/.test(g.kendt), V: /V/.test(g.kendt), c: /c/.test(g.kendt) }, ny: {},
                       prikVis: spec.prikker ? 1 : 0, prikMaal: spec.prikker ? 1 : 0,
                       part: new NK.Partikler(31 + j * 7 + i * 3), pose: { dx: 0, dy: 0, vinkel: 0, spejl: false, tekst: 1 },
                       blink: 0, tael: null, taelVist: false, foerTal: null };
            mig.nyePrikker(gl, antalPrikker(n), null);
            gl.prikker.forEach(function (d) { d.a = 1; d.ny = 1; });
            var np = Tg.prikker(cAf(gl));
            gl.part.saet([np, np]);
            gl.part.p.forEach(function (q) { q.a = 1; });
            return gl;
        });
        this.spmNr = 0;
        this.maade = "ok";
        this.forklaring = "";
        this.koe = [];
        this.aktiv = null;
        this.auto = false;
        this.enhed = null;
        this.stroem = null;
        this.sproejte = { dx: 0, dy: 0, v: 0, straale: 0 };
        this.samlet = [];
        this.samletFaerdig = 0;
        this.venter = false;
        this.rigtigMaade = "ok";
        this.foerSpm = -1;
        this.overLinje = spec.linje || "";
        this.startSpm();
        if (this.lay) this.layout();
    };

    P.harForfra = function () { return true; };
    P.harNyeTal = function () { return false; };

    /* Start forfra: opgaven fra begyndelsen */
    P.forfra = function () {
        if (this.travl()) return;
        this.faerdig = false;
        this.hjaelp = 0;
        this.brugtSvar = false;
        this.lavOpgave(this.nr);
        this.visKort();
        this.besked("Opgaven er startet forfra.", "");
    };

    P.spm = function () { return this.opg.spm[this.spmNr]; };

    /* Et nyt spoergsmaal: foerst handlingen, hvis der er en */
    P.startSpm = function () {
        var s = this.spm();
        this.fase = s.foer ? "handling" : "spm";
        this.forkerte = [];
        this.rigtig = null;
        this.rigtigMaade = "ok";
        if (s.foer) this.overLinje = s.foer.linje;
        /* Svarene blandes, saa det rigtige ikke altid staar samme sted; glassene
           staar i orden (A, B, C) */
        var orden = s.svar.map(function (x, j) { return j; });
        this.orden = s.hvem ? orden : NK.bland(orden);
        this.enhed = null;
    };

    /* ----- Prikkerne ---------------------------------------------------------------
       Nye prikker spredes jaevnt: hver ny prik er den af tolv tilfaeldige
       pladser, der ligger laengst fra de andre (i glassets egne maal). */
    P.nyePrikker = function (g, antal, fra) {
        var r = this.froe, VL = Math.max(0.05, g.V / 1000);
        var hb = Math.max(0.3, VL * 180 / 124);
        for (var k = 0; k < antal; k++) {
            var bedst = null, bedstD = -1;
            for (var f = 0; f < 12; f++) {
                var u = r(), v = r(), d = 1e9;
                g.prikker.forEach(function (p) {
                    var du = p.u - u, dv = (p.v - v) * hb;
                    d = Math.min(d, du * du + dv * dv);
                });
                if (d > bedstD) { bedstD = d; bedst = { u: u, v: v }; }
            }
            g.prikker.push({ u: bedst.u, v: bedst.v, a: fra ? 1 : 0, lys: 0, fra: fra, ny: fra ? 0 : 1 });
        }
    };

    P.fjernPrikker = function (g, antal) {
        for (var k = 0; k < antal && g.prikker.length; k++) {
            var j = Math.floor(this.froe() * g.prikker.length);
            g.prikker.splice(j, 1);
        }
    };

    /* ----- Kortet oeverst i scenen ---------------------------------------------------
       Spoergsmaal: indledningen (det, der er i glassene, eller det, der lige
       er haeldt), spoergsmaalet og svarene. Handling: det, eleven skal klikke
       paa. Rigtigt svar: svaret, forklaringen og knappen videre. */
    P.kortData = function () {
        var s = this.spm(), mig = this, n = this.opg.spm.length;
        if (this.faerdig || this.venter) {
            var gul = this.rigtigMaade === "svar";
            return { slags: "loest", gul: gul, chip: gul ? "Svaret" : "Rigtigt ✓", svaret: s.regn ? "" : s.svar[this.rigtig].t,
                     foer: this.regnHTML(s, true), videre: this.videreTekst(),
                     html: NK.html(s.efter) + (this.faerdig && this.slutEkstra ? " " + NK.html(this.slutEkstra) : "") };
        }
        if (this.fase === "handling") return { slags: "opgave", chip: "Opgave " + (this.nr + 1), tekst: s.foer.linje };
        return { slags: "spm", chip: n > 1 ? "Spørgsmål " + (this.spmNr + 1) + " af " + n : "Spørgsmål",
                 intro: s.regn ? "" : this.overLinje, foer: this.regnHTML(s, false), tekst: s.tekst,
                 svar: this.orden.map(function (j) {
                     var forkert = mig.forkerte.indexOf(j) >= 0;
                     return { j: j, t: s.svar[j].t, forkert: forkert, rigtig: mig.rigtig === j, laast: forkert || mig.rigtig !== null };
                 }) };
    };

    P.kortValg = function (j) { this.vaelgSvar(j, "ok"); };

    /* Regnestykket i opgaven Enhederne: enheden er et gult ?, til svaret er
       rigtigt. Saa staar enheden der, og linjen under viser, hvad der gaar ud. */
    P.regnHTML = function (s, loest) {
        if (!s.regn) return "";
        var del = s.regn.lastIndexOf("?");
        var html = '<p class="kt-regn">' + NK.html(s.regn.slice(0, del)) +
            (loest ? '<b class="kt-enhed">' + NK.html(s.svar[this.rigtig].t) + "</b>" : '<span class="kt-ukendt">?</span>') + "</p>";
        if (loest && this.enhed) {
            html += '<p class="kt-enheder">Enhederne: ' + this.enhed.dele.map(function (d) {
                var t = NK.html(d.t);
                return d.s ? '<span class="streg">' + t + "</span>" : (d.fed ? "<b>" + t + "</b>" : t);
            }).join("") + "</p>";
        }
        return html;
    };

    P.visKortEkstra = function () { this.visTabel(); };

    /* Tabellen med glassenes tal: det, der ikke er kendt endnu, er et ? */
    P.visTabel = function () {
        var mig = this;
        var html = '<table class="glastabel"><thead><tr><th></th>';
        this.glas.forEach(function (g) { html += "<th>Glas " + g.navn + "</th>"; });
        html += "</tr></thead><tbody>";
        [["n", "Stofmængde, n"], ["V", "Rumfang, V"], ["c", "Koncentration, c"]].forEach(function (r) {
            html += "<tr><th>" + r[1] + "</th>";
            mig.glas.forEach(function (g) {
                var t, kl = "";
                if (g.V <= 0 && !mig.flytter(g)) t = "–";
                else if (!g.kendt[r[0]]) { t = "?"; kl = "ukendt"; }
                else t = talTekst(g, r[0]);
                if (g.ny[r[0]]) kl += " ny";
                /* Tallet fra foer der blev haeldt, naar det ikke er det, der staar nu */
                var foer = g.foerTal && g.foerTal[r[0]];
                html += '<td class="' + kl + '">' + t + (foer && foer !== t ? '<span class="foer">før ' + foer + "</span>" : "") + "</td>";
            });
            html += "</tr>";
        });
        html += "</tbody></table>";
        this.glas.forEach(function (g) { g.ny = {}; });
        this.el.tabel.innerHTML = html;
    };

    P.flytter = function (g) { return !!(this.aktiv && this.aktiv.glas === g); };

    /* ----- Svarene --------------------------------------------------------------------- */
    P.vaelgSvar = function (j, maade) {
        if (this.fase !== "spm" || this.faerdig || this.venter || this.travl()) return;
        var s = this.spm(), x = s.svar[j];
        if (this.forkerte.indexOf(j) >= 0) return;
        if (!x.ok) {
            this.forkerte.push(j);
            this.brugtSvar = true;
            if (x.glas !== undefined) this.glas[x.glas].blink = 0.9;
            this.fejlLinje(NK.html(x.forkl || "Det passer ikke."));
            this.visKort();
            return;
        }
        this.rigtigSvar(j, maade);
    };

    P.rigtigSvar = function (j, maade) {
        var s = this.spm(), mig = this, vis = s.vis || {};
        this.rigtig = j;
        this.rigtigMaade = maade;
        this.hjaelp = 0;
        if (maade === "svar") { this.brugtSvar = true; this.maade = "svar"; }
        /* Det, scenen viser efter svaret */
        (vis.c || []).forEach(function (i) { mig.saetKendt(i, "c"); });
        (vis.n || []).forEach(function (i) { mig.saetKendt(i, "n"); });
        (vis.etiket || []).forEach(function (i) { mig.glas[i].etiket = true; });
        (vis.prikker || []).forEach(function (i) { mig.glas[i].prikMaal = 1; });
        if (vis.tael) this.startTael(vis.tael);
        if (vis.enhed) this.enhed = { dele: D.ENHEDSLINJE[vis.enhed], t: 0 };
        var sidste = this.spmNr >= this.opg.spm.length - 1;
        if (sidste) {
            this.fase = "faerdig";
            this.forklaring = NK.html(s.efter);
            this.trinLoest(maade, null);
            return;
        }
        /* Svaret og forklaringen staar paa det groenne kort, til eleven selv gaar
           videre med kortets knap (ikke ros og et nyt spoergsmaal paa én gang) */
        this.venter = true;
        this.besked("", "");
        this.visKort();
    };

    P.naesteSpm = function () {
        this.venter = false;
        this.spmNr++;
        this.startSpm();
        this.visKort();
        this.besked(this.trinLinje(), "");
    };

    P.saetKendt = function (i, hvad) {
        var g = this.glas[i];
        if (!g.kendt[hvad]) g.ny[hvad] = true;
        g.kendt[hvad] = true;
    };

    /* ----- Knappen: hint og svar ------------------------------------------------------- */
    P.trinInfo = function () {
        if (this.faerdig || this.venter) return null;
        var s = this.spm(), mig = this;
        if (this.fase === "handling") {
            return { hint: NK.html(s.foer.hint), svar: function () { mig.goerHandling(true); } };
        }
        var ret = s.svar.map(function (x) { return !!x.ok; }).indexOf(true);
        return { hint: NK.html(s.hint), svar: function () { mig.vaelgSvar(ret, "svar"); } };
    };

    P.opgaveFaerdig = function () { return this.fase === "faerdig"; };

    /* Kortet siger selv, hvad der skal goeres: linjen under er kun til hint,
       fejl og det, et klik i scenen svarer */
    P.trinLinje = function () { return ""; };

    P.slutLinje = function () { return this.forklaring; };

    /* ----- Handlingerne: haeld over, haeld sammen, vand i ------------------------------ */
    P.travl = function () { return !!(this.aktiv || this.koe.length); };

    P.trin = function (dur, fn, slut, start, glas) {
        this.koe.push({ dur: dur, fn: fn, slut: slut, start: start, t: 0, glas: glas || null });
    };

    /* auto: Vis svaret goer det selv */
    P.goerHandling = function (auto) {
        var s = this.spm(), f = s.foer, mig = this;
        if (this.fase !== "handling" || this.travl()) return;
        if (auto) { this.auto = true; this.visKnap(); }
        this.skjulFoer();
        if (f.slags === "haeld") this.haeld(f.fra, f.til, f.V, function () { mig.handlingFaerdig(); });
        else if (f.slags === "vand") this.vand(f.glas, f.til, function () { mig.handlingFaerdig(); });
        else if (f.slags === "saml") {
            f.fra.forEach(function (i) { if (mig.samlet.indexOf(i) < 0) mig.samlIGlas(i); });
        }
    };

    /* Det, handlingen aendrer, og som eleven skal finde bagefter, skjules,
       naar handlingen begynder (ellers viser luppen og bordkanten svaret,
       mens der haeldes) */
    P.skjulFoer = function () {
        var mig = this;
        this.huskFoer();
        (this.spm().foer.kendt || []).forEach(function (x) {
            var g = mig.glas[x.glas];
            ["n", "V", "c"].forEach(function (h) { if (x[h] === false) g.kendt[h] = false; });
            if (x.etiket === false) g.etiket = false;
        });
        this.visTabel();
    };

    /* Det, tabellen viser om glassene, lige foer der haeldes (én gang pr.
       handling). Haelder man foerst og taenker bagefter, kan tallene stadig
       ses: i tabellen under det nye tal og paa etiketten af et tomt glas. */
    P.huskFoer = function () {
        if (this.foerSpm === this.spmNr) return;
        this.foerSpm = this.spmNr;
        this.glas.forEach(function (g) {
            g.foerTal = {};
            if (g.V <= 0) return;
            ["n", "V", "c"].forEach(function (h) { if (g.kendt[h]) g.foerTal[h] = talTekst(g, h); });
        });
    };

    /* Ét af glassene haeldes over i det store glas; naar alle er haeldt, er handlingen faerdig */
    P.samlIGlas = function (i) {
        var f = this.spm().foer, mig = this;
        if (!this.samlet.length) this.skjulFoer();
        this.samlet.push(i);
        this.haeld(i, f.til, this.glas[i].V, function () {
            mig.samletFaerdig++;
            if (mig.samletFaerdig === f.fra.length) mig.handlingFaerdig();
        });
    };

    P.handlingFaerdig = function () {
        var s = this.spm(), f = s.foer, mig = this;
        (f.kendt || []).forEach(function (x) {
            var g = mig.glas[x.glas];
            ["n", "V", "c"].forEach(function (h) {
                if (x[h] === true) mig.saetKendt(x.glas, h);
                if (x[h] === false) g.kendt[h] = false;
            });
            if (x.etiket === false) g.etiket = false;
        });
        this.fase = "spm";
        this.auto = false;
        /* Det, der lige er sket, er indledningen til spoergsmaalet paa kortet */
        this.overLinje = f.efter;
        this.besked("", "");
        this.visKort();
    };

    /* Glas i haelder V mL over i glas m: det loeftes, flyttes over m, haelder
       og kommer tilbage. Tuden vender mod m (glasset spejles, naar det
       haelder mod hoejre). */
    P.haeld = function (i, m, VmL, slut) {
        var mig = this, g = this.glas[i], t = this.glas[m];
        var lay = this.lay, gg = lay.glas[i], tg = lay.glas[m];
        var spejl = gg.cx < tg.cx;
        var hvilePiv = null, maal = null, nFlyt = 0, flyttet = 0, V0 = 0, Vt0 = 0, n0 = 0, nt0 = 0, prik0 = 0;
        var VINKEL = 1.05;
        this.trin(0.7, function (u) {
            g.pose.dx = (maal.x - hvilePiv.x) * u;
            g.pose.dy = (maal.y - hvilePiv.y) * u - Math.sin(u * Math.PI) * 30 * gg.k;
            g.pose.tekst = 1 - u;
            g.prikVis = 1 - u;
        }, null, function () {
            g.pose.spejl = spejl;
            hvilePiv = Tg.glas1Form(gg, { spejl: spejl }).piv;
            maal = { x: tg.cx + (spejl ? -0.12 : 0.12) * tg.b, y: tg.y0 - 30 * tg.k };
        }, g);
        this.trin(0.45, function (u) { g.pose.vinkel = (spejl ? 1 : -1) * VINKEL * u; }, null, null, g);
        this.trin(1.4, function (u) {
            g.V = V0 - VmL * u;
            g.visV = g.V / 1000;
            g.n = n0 - nFlyt * u;
            t.V = Vt0 + VmL * u;
            t.visV = t.V / 1000;
            t.n = nt0 + nFlyt * u;
            /* Prikkerne flytter med: de fjernes i det skjulte glas og falder ned i det andet */
            var skal = Math.round(prik0 * u);
            if (skal > flyttet) {
                mig.fjernPrikker(g, skal - flyttet);
                var st = mig.stroemPunkt(g, gg, t, tg);
                mig.nyePrikker(t, skal - flyttet, { x: st.x, y: st.y1 });
                flyttet = skal;
            }
            mig.stroem = mig.stroemPunkt(g, gg, t, tg);
        }, function () { mig.stroem = null; }, function () {
            V0 = g.V; Vt0 = t.V; n0 = g.n; nt0 = t.n;
            nFlyt = g.n * VmL / g.V;
            prik0 = antalPrikker(nFlyt);
            flyttet = 0;
            t.prikMaal = Math.max(t.prikMaal, g.prikMaal);
            t.prikVis = t.prikMaal;
        }, g);
        this.trin(0.45, function (u) { g.pose.vinkel = (spejl ? 1 : -1) * VINKEL * (1 - u); }, null, null, g);
        var dx1, dy1;
        this.trin(0.7, function (u) {
            g.pose.dx = dx1 * (1 - u);
            g.pose.dy = dy1 * (1 - u);
            g.pose.tekst = u;
            g.prikVis = g.prikMaal * u;
        }, function () {
            g.pose = { dx: 0, dy: 0, vinkel: 0, spejl: false, tekst: 1 };
            g.prikVis = g.prikMaal;
            if (slut) slut();
        }, function () { dx1 = g.pose.dx; dy1 = g.pose.dy; }, g);
    };

    /* Straalen fra tuden ned i glasset */
    P.stroemPunkt = function (g, gg, t, tg) {
        var F = Tg.glas1Form(gg, g.pose);
        var M = NK.Sprites.MAAL.glas1l;
        var p = F.verden((M.tudX - 4) * gg.k, (M.tudY + 2) * gg.k);
        var y1 = t.V > 0 ? tg.yV(t.V / 1000) : tg.ind.bund;
        return { x: p.x, y0: p.y, y1: y1, b: 7 * gg.k };
    };

    /* Sproejteflasken haelder vand i glasset op til maal mL */
    P.vand = function (i, maal, slut) {
        var mig = this, g = this.glas[i], lay = this.lay, gg = lay.glas[i], sg = lay.sproejte, sp = this.sproejte;
        var dx = gg.ind.x1 - 22 * gg.k - sg.tud.x, dy = gg.ind.top - 34 * gg.k - sg.tud.y;
        var V0;
        this.trin(0.6, function (u) { sp.dx = dx * u; sp.dy = dy * u; sp.v = -0.5 * u; });
        this.trin(1.8, function (u) { sp.straale = 1; g.V = NK.lerp(V0, maal, u); g.visV = g.V / 1000; },
            function () { sp.straale = 0; }, function () { V0 = g.V; });
        this.trin(0.6, function (u) { sp.dx = dx * (1 - u); sp.dy = dy * (1 - u); sp.v = -0.5 * (1 - u); }, function () {
            if (slut) slut();
        });
        void mig;
    };

    /* Prikkerne i et eller flere glas lyser op én ad gangen, og taelleren
       under glasset viser stofmaengden */
    P.startTael = function (liste) {
        var mig = this;
        liste.forEach(function (i) {
            var g = mig.glas[i];
            var orden = g.prikker.map(function (p, j) { return j; }).sort(function (a, b) {
                var pa = g.prikker[a], pb = g.prikker[b];
                return (pa.v - pb.v) * 3 + (pa.u - pb.u);
            });
            g.tael = { orden: orden, t: 0, hast: Math.max(10, orden.length / 1.4) };
        });
    };

    /* ----- Opdater -------------------------------------------------------------------- */
    P.opdaterScene = function (dt) {
        var mig = this;
        if (!this.aktiv && this.koe.length) {
            this.aktiv = this.koe.shift();
            if (this.aktiv.start) this.aktiv.start();
        }
        var a = this.aktiv;
        if (a) {
            a.t += dt / a.dur;
            a.fn(NK.blod(Math.min(1, a.t)));
            if (a.t >= 1) {
                this.aktiv = null;
                if (a.slut) a.slut();
                if (!this.koe.length) { this.visKnap(); this.visTabel(); }
            }
        }
        this.glas.forEach(function (g) {
            if (!mig.flytter(g)) g.prikVis = NK.mod(g.prikVis, g.prikMaal, 4, dt);
            g.prikker.forEach(function (p) {
                if (p.ny < 1) p.ny = Math.min(1, p.ny + dt / 0.8);
                if (p.a < 1) p.a = Math.min(1, p.a + dt * 3);
                if (p.lys > 0 && !g.tael) p.lys = Math.max(0, p.lys - dt * 0.8);
            });
            if (g.tael) {
                g.tael.t += dt;
                var nu = Math.min(g.tael.orden.length, Math.floor(g.tael.t * g.tael.hast));
                for (var k = 0; k < nu; k++) g.prikker[g.tael.orden[k]].lys = 1;
                if (nu >= g.tael.orden.length && g.tael.t * g.tael.hast > nu + 6) {
                    g.tael = null;
                    g.taelVist = true;
                }
            }
            if (g.blink > 0) g.blink = Math.max(0, g.blink - dt);
            var np = g.V > 0 ? Tg.prikker(cAf(g)) : 0;
            g.part.saet([np, np]);
            g.part.opdater(dt);
        });
    };

    /* ----- Musen ---------------------------------------------------------------------------- */
    P.hvad = function (pt) {
        var lay = this.lay;
        if (!lay || !pt) return null;
        for (var i = 0; i < lay.glas.length; i++) {
            var gg = lay.glas[i];
            if (pt.x >= gg.x0 && pt.x <= gg.x0 + gg.b && pt.y >= gg.y0 - 6 && pt.y <= lay.bordY + 4) return { slags: "glas", i: i };
            var z = lay.lup[i];
            if (Math.hypot(pt.x - z.x, pt.y - z.y) < z.r) return { slags: "lup", i: i };
        }
        var sg = lay.sproejte;
        if (sg && pt.x >= sg.x0 + 20 * sg.k && pt.x <= sg.x0 + sg.b && pt.y >= sg.y0 && pt.y <= sg.y0 + sg.h) return { slags: "sproejte" };
        return null;
    };

    /* Kan det, musen er over, bruges lige nu? */
    P.kanKlikkes = function (u) {
        if (!u || this.faerdig || this.travl() || this.venter) return false;
        var s = this.spm();
        if (this.fase === "handling") {
            var f = s.foer;
            if (f.slags === "vand") return u.slags === "sproejte";
            if (u.slags !== "glas") return false;
            if (f.slags === "haeld") return u.i === f.fra;
            return f.fra.indexOf(u.i) >= 0 && this.samlet.indexOf(u.i) < 0;
        }
        return this.fase === "spm" && !!s.hvem && u.slags === "glas";
    };

    P.overScene = function (pt) {
        var u = this.hvad(pt);
        this.over = this.kanKlikkes(u) ? u : null;
        return this.over ? "klik" : null;
    };

    P.nedScene = function (pt) {
        var u = this.hvad(pt);
        if (!u) return false;
        if (this.travl()) { this.kortBesked("Vent lidt."); return false; }
        var s = this.spm();
        if (this.fase === "handling" && this.kanKlikkes(u)) {
            if (s.foer.slags === "saml") this.samlIGlas(u.i);
            else this.goerHandling(false);
            return false;
        }
        /* Mens fanen venter paa Naeste spoergsmaal, svarer et klik paa et glas ikke */
        if (this.fase === "spm" && s.hvem && u.slags === "glas" && !this.venter) {
            var j = s.svar.map(function (x) { return x.glas; }).indexOf(u.i);
            if (j >= 0) this.vaelgSvar(j, "ok");
            return false;
        }
        if (u.slags === "lup") {
            this.kortBesked("Luppen viser lige meget væske fra glas " + this.glas[u.i].navn + ". Flere ioner i luppen er en højere koncentration.", 5);
            return false;
        }
        if (u.slags === "glas") {
            var g = this.glas[u.i];
            if (this.fase === "handling") this.kortBesked(NK.html(s.foer.hint), 4);
            else if (g.V <= 0) {
                var f0 = g.foerTal || {};
                this.kortBesked("Glas " + g.navn + " er tomt." + (f0.V && f0.c ? " Før var der " + f0.V + " af en " + f0.c + " opløsning i det." : ""), f0.V ? 5 : 3);
            }
            else this.kortBesked("Glas " + g.navn + ": " + K.to(g.V / 1000) + " L kobber(II)sulfat. Hver prik er 0,01 mol.", 4);
            return false;
        }
        if (u.slags === "sproejte") this.kortBesked(this.fase === "handling" ? NK.html(s.foer.hint) : "Der skal ikke vand i nu.", 3);
        return false;
    };

    /* ----- Layout ------------------------------------------------------------------------ */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var Hs = H;
        var lay = { W: W, H: H, Hs: Hs };
        lay.bordY = Math.round(Hs - NK.klamp(Hs * 0.075, 24, 42));
        var o = this.opg;
        /* Kortet med spoergsmaalet har pladsen oeverst; lupperne begynder under det */
        lay.zone = this.kortZone();
        var top = 10 + lay.zone + 2;
        lay.top = top;
        var nG = o.glas.length, spPlads = o.sproejte ? 1 : 0;
        var ghV = (lay.bordY - top - 42) / (227 / 240 + 0.5);
        var ghH = (W - 36) / ((nG + 0.75 * spPlads) * 0.75 * 1.45 + 0.1);
        var gh = NK.klamp(Math.min(ghV, ghH, 290), 70, 290);
        lay.gh = gh;
        var sp = null;
        if (o.sproejte) {
            var spH = NK.klamp(gh * 0.55, 70, 150);
            sp = Tg.sproejteGeo(W - spH * 0.85 - 18, lay.bordY, spH);
        }
        lay.sproejte = sp;
        var x0 = 18, x1 = sp ? sp.x0 - 10 : W - 18;
        var slot = (x1 - x0) / nG;
        var gb = gh * 180 / 240;
        lay.glas = [];
        lay.lup = [];
        var zr = Math.round(NK.klamp(Math.min(gh * 0.25, slot * 0.4), 18, 74));
        for (var i = 0; i < nG; i++) {
            var cx = x0 + slot * (i + 0.5);
            var geo = Tg.glas1Geo(cx - gb / 2, lay.bordY, gh);
            lay.glas.push(geo);
            lay.lup.push({ x: geo.cx, y: geo.y0 - 38 - zr, r: zr });
        }
        this.lay = lay;
        for (i = 0; i < nG; i++) {
            var g0 = lay.glas[i];
            this.saetAnker("glas" + i, g0.x0, lay.lup[i].y - zr, g0.b, lay.bordY - lay.lup[i].y + zr);
        }
        this.saetAnker("glassene", lay.glas[0].x0, lay.lup[0].y - zr, lay.glas[nG - 1].x0 + lay.glas[nG - 1].b - lay.glas[0].x0,
            lay.bordY + 24 - lay.lup[0].y + zr);
        this.saetAnker("lupper", lay.glas[0].x0, lay.lup[0].y - zr - 4, lay.glas[nG - 1].x0 + lay.glas[nG - 1].b - lay.glas[0].x0, 2 * zr + 30);
    };

    /* ----- Tegn ----------------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, mig = this;
        if (!lay || !this.glas) return;
        if (lay.glas.length !== this.glas.length) this.layout();
        lay = this.lay;
        this.L.ryd();
        Tg.rum(ctx, lay.W, lay.Hs, lay.bordY + 12);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.Hs);

        /* Lupperne over glassene */
        this.glas.forEach(function (g, i) {
            var z = lay.lup[i], gg = lay.glas[i];
            var c = cAf(g);
            var liquidY = g.V > 0 ? gg.yV(Math.min(g.visV, 1)) : gg.ind.bund;
            var pY = Math.max(liquidY + 12, NK.lerp(liquidY, gg.ind.bund, 0.35));
            if (g.V > 0 && !mig.flytter(g)) Tg.zoomLinje(ctx, gg.cx, pY, z.x, z.y + z.r);
            var tekst = g.V <= 0 ? "tom" : (g.kendt.c ? "c = " + K.to(c) + " M" : "c = ?");
            Tg.zoom(ctx, z.x, z.y, z.r, { part: g.part, st: ST, farve: Tg.vaeske(ST, c), tekst: tekst, forklar: false,
                lys: mig.over && mig.over.slags === "lup" && mig.over.i === i });
        });

        /* Navnene og stofmaengden paa bordets forkant */
        var fpx = NK.klamp((lay.Hs - lay.bordY - 12) * 0.62, 12, 16);
        this.glas.forEach(function (g, i) {
            var gg = lay.glas[i];
            var t = "Glas " + g.navn;
            if (g.tael) {
                var nu = Math.min(g.tael.orden.length, Math.floor(g.tael.t * g.tael.hast));
                t += "   n = " + K.to(nu * D.PRIK_GLAS) + " mol";
            } else if (g.kendt.n && g.V > 0) t += "   n = " + K.to(g.n) + " mol";
            /* Det sidste navn viger for knappen Start forfra i hjoernet */
            ctx.font = Tg.font("700", fpx);
            var tx = Math.min(gg.cx, lay.W - 142 - ctx.measureText(t).width / 2);
            NK.tekst(ctx, t, tx, lay.bordY + 12 + (lay.Hs - lay.bordY - 12) / 2 + 1, { font: Tg.font("700", fpx), justering: "center",
                linje: "middle", farve: g.tael ? "#f2c53d" : "#dfe6ee" });
        });

        /* Sproejteflasken */
        if (lay.sproejte) {
            var sg = lay.sproejte, sp = this.sproejte;
            ctx.save();
            ctx.translate(sp.dx, sp.dy);
            Tg.sproejte(ctx, sg, this.over && this.over.slags === "sproejte" ? 1 : 0, sp.v);
            ctx.restore();
            if (sp.straale) {
                var gi = this.spm().foer ? this.spm().foer.glas : 0;
                var gw = lay.glas[gi || 0];
                Tg.straale(ctx, sg.tud.x + sp.dx - 4, sg.tud.y + sp.dy + 10, gw.yV(this.glas[gi || 0].visV), 4, null, this.tid);
            }
        }

        /* Glassene (det, der flytter, tegnes til sidst) */
        var raekke = this.glas.map(function (g, i) { return i; }).sort(function (a, b) {
            return (mig.flytter(mig.glas[a]) ? 1 : 0) - (mig.flytter(mig.glas[b]) ? 1 : 0);
        });
        raekke.forEach(function (i) {
            var g = mig.glas[i], gg = lay.glas[i];
            var prikker = g.prikVis > 0.01 ? g.prikker.map(function (p) {
                return { u: p.u, v: p.v, a: p.a * g.prikVis, lys: p.lys, fra: p.fra, ny: p.ny };
            }) : null;
            var lys = mig.over && mig.over.slags === "glas" && mig.over.i === i ? 1 : 0;
            if (g.blink > 0) lys = 0;
            /* Et glas, der er haeldt tomt, beholder sin etiket */
            var paaEtiket = !g.etiket ? null : (g.V > 0 ? K.to(cAf(g)) + " M" : (g.foerTal && g.foerTal.c) || null);
            Tg.glas1(ctx, gg, { V: g.visV, farve: Tg.vaeske(ST, cAf(g)), prikker: prikker, vinkel: g.pose.vinkel, spejl: g.pose.spejl,
                dx: g.pose.dx, dy: g.pose.dy, tekst: g.pose.tekst, lys: lys,
                etiket: paaEtiket ? [ST.formel, paaEtiket] : null });
            if (g.blink > 0) {
                ctx.save();
                ctx.strokeStyle = "rgba(224, 84, 70, " + Math.min(1, g.blink * 1.5) + ")";
                ctx.lineWidth = 3;
                NK.rundtRekt(ctx, gg.x0 - 6, gg.y0 - 6, gg.b + 12, gg.h + 8, 12);
                ctx.stroke();
                ctx.restore();
            }
        });

        /* Straalen fra glasset, der haelder */
        if (this.stroem) {
            var st = this.stroem;
            Tg.straale(ctx, st.x, st.y0, st.y1, st.b, Tg.vaeske(ST, 0.6), this.tid);
        }

        /* En pil over det, der skal klikkes paa */
        var pil = this.pil();
        if (pil) {
            var hop = Math.sin(this.tid * 5) * 5;
            ctx.save();
            ctx.fillStyle = "#f2c53d";
            ctx.beginPath();
            ctx.moveTo(pil.x, pil.y + hop);
            ctx.lineTo(pil.x - 10, pil.y - 16 + hop);
            ctx.lineTo(pil.x + 10, pil.y - 16 + hop);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    };

    P.pil = function () {
        if (this.fase !== "handling" || this.travl() || this.faerdig) return null;
        var f = this.spm().foer, lay = this.lay;
        if (f.slags === "vand") return { x: lay.sproejte.x0 + lay.sproejte.b * 0.55, y: lay.sproejte.y0 - 8 };
        var i = f.slags === "haeld" ? f.fra : f.fra.filter(function (j) { return this.samlet.indexOf(j) < 0; }, this)[0];
        if (i === undefined) return null;
        var gg = lay.glas[i];
        return { x: gg.cx, y: gg.y0 + 6 };
    };

    SimGlas.ZONE = ZONE;
    NK.SimGlas = SimGlas;
}());
