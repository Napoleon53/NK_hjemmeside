/* =====================================================================
   braet.js - brættet, brikkerne, saltet og tyngdekraften

   Ionerne er de syv tetrisbrikker (I, O, T, S, Z, J, L). De drejer
   efter SRS, den drejemaade, de fleste tetrisspil bruger, med de samme
   "vaegspark", der skubber en brik fri af kanten, naar den drejes.
   De graa sten har fem felter (alle 18 pentominoer) og en enkel
   drejning med et par vaegspark.

   Brættet har D.HOEJDE synlige raekker og D.SKJULT raekker ovenover,
   hvor brikkerne starter. y vokser nedad.

   En celle er null eller { id } for den brik, den hoerer til. Brikken
   staar i this.stykker[id]: { id, ion, orden, salt, enhed } for en ion
   og { id, sten: true, orden } for en sten.
   Ioner, der gaar lige op, bliver salt (s.salt). Spillet lader dem lyse
   op som pulver og fjerner dem saa med fjernSalt. Brikker, der ikke
   laengere hviler paa noget, falder ned hele (tyngdeSkridt), ikke celle
   for celle. Saa kan nye ioner komme til at roere hinanden, og det kan
   give en kaedereaktion.

   Stenene reagerer ikke. De forsvinder kun i fulde raekker, som i
   almindelig tetris (fjernRaekker); en fuld raekke tager ioner med.

   Filen tegner ikke. Se tegning.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Kemi = NK.Kemi;

    /* ----- Brikkerne ------------------------------------------------------
       Udgangsstillingen i en kasse paa n x n. De andre tre stillinger
       fremkommer ved at dreje kassen om sin midte. */
    var START = {
        I: { n: 4, c: [[0, 1], [1, 1], [2, 1], [3, 1]] },
        O: { n: 4, c: [[1, 0], [2, 0], [1, 1], [2, 1]], fast: true },
        T: { n: 3, c: [[1, 0], [0, 1], [1, 1], [2, 1]] },
        S: { n: 3, c: [[1, 0], [2, 0], [0, 1], [1, 1]] },
        Z: { n: 3, c: [[0, 0], [1, 0], [1, 1], [2, 1]] },
        J: { n: 3, c: [[0, 0], [0, 1], [1, 1], [2, 1]] },
        L: { n: 3, c: [[2, 0], [0, 1], [1, 1], [2, 1]] }
    };

    /* De graa sten har fem felter: alle 18 former, man kan faa, naar
       spejlvendte tæller for sig (12 pentominoer, heraf 6 med et spejlbillede). */
    var STEN = {
        s_I: { n: 5, c: [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2]] },
        s_L: { n: 4, c: [[0, 1], [1, 1], [2, 1], [3, 1], [3, 0]] },
        s_J: { n: 4, c: [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1]] },
        s_Y: { n: 4, c: [[0, 1], [1, 1], [2, 1], [3, 1], [1, 0]] },
        s_Ya: { n: 4, c: [[0, 1], [1, 1], [2, 1], [3, 1], [2, 0]] },
        s_N: { n: 4, c: [[0, 1], [1, 1], [1, 0], [2, 0], [3, 0]] },
        s_Na: { n: 4, c: [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1]] },
        s_P: { n: 3, c: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]] },
        s_Pa: { n: 3, c: [[0, 0], [1, 0], [0, 1], [1, 1], [1, 2]] },
        s_F: { n: 3, c: [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]] },
        s_Fa: { n: 3, c: [[0, 0], [1, 0], [1, 1], [2, 1], [1, 2]] },
        s_T: { n: 3, c: [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2]] },
        s_U: { n: 3, c: [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1]] },
        s_V: { n: 3, c: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]] },
        s_W: { n: 3, c: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2]] },
        s_X: { n: 3, c: [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]], fast: true },
        s_Z: { n: 3, c: [[0, 0], [1, 0], [1, 1], [1, 2], [2, 2]] },
        s_S: { n: 3, c: [[1, 0], [2, 0], [1, 1], [0, 2], [1, 2]] }
    };

    var FORMER = {};
    function bygForm(navn, s, sten) {
        var stillinger = [s.c];
        for (var r = 1; r < 4; r++) {
            var forrige = stillinger[r - 1];
            stillinger.push(s.fast ? forrige : forrige.map(function (p) { return [s.n - 1 - p[1], p[0]]; }));
        }
        FORMER[navn] = { navn: navn, n: s.n, stillinger: stillinger, sten: !!sten, fast: !!s.fast };
    }
    Object.keys(START).forEach(function (navn) { bygForm(navn, START[navn], false); });
    Object.keys(STEN).forEach(function (navn) { bygForm(navn, STEN[navn], true); });
    var FORM_NAVNE = ["I", "O", "T", "S", "Z", "J", "L"];
    var STEN_NAVNE = Object.keys(STEN);

    /* Stenene har ingen SRS-tabel. De proever at dreje paa stedet, saa én
       til siden, saa to, saa én op. */
    var SPARK_STEN = [[0, 0], [-1, 0], [1, 0], [-2, 0], [2, 0], [0, 1], [-1, 1], [1, 1]];

    /* Vaegsparkene (SRS). Tabellerne er skrevet med y opad, som de staar
       i reglerne; de vendes ved brug. Noeglen er "fra>til". */
    var SPARK = {
        "0>1": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
        "1>0": [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
        "1>2": [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
        "2>1": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
        "2>3": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
        "3>2": [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
        "3>0": [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
        "0>3": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]]
    };
    var SPARK_I = {
        "0>1": [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
        "1>0": [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
        "1>2": [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
        "2>1": [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
        "2>3": [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
        "3>2": [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
        "3>0": [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
        "0>3": [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]]
    };

    /* Cellerne for en brik i en given stilling og position */
    function celler(form, rot, x, y) {
        return FORMER[form].stillinger[rot].map(function (p) { return { x: x + p[0], y: y + p[1] }; });
    }

    /* ----- Brættet ------------------------------------------------------ */
    function Braet() {
        this.B = D.BREDDE;
        this.H = D.HOEJDE + D.SKJULT;
        this.nulstil();
    }

    var P = Braet.prototype;

    P.nulstil = function () {
        this.g = [];
        for (var y = 0; y < this.H; y++) this.g.push(this.tomRaekke());
        this.stykker = {};
        this.naesteId = 1;
        this.naesteEnhed = 1;
    };

    P.tomRaekke = function () {
        var r = [];
        for (var x = 0; x < this.B; x++) r.push(null);
        return r;
    };

    P.celle = function (x, y) {
        if (x < 0 || x >= this.B || y < 0 || y >= this.H) return null;
        return this.g[y][x];
    };

    P.stykke = function (x, y) {
        var c = this.celle(x, y);
        return c ? this.stykker[c.id] : null;
    };

    /* Kan brikken staa her? Over brættet (y < 0) er der frit. */
    P.passer = function (form, rot, x, y) {
        var cs = celler(form, rot, x, y);
        for (var i = 0; i < cs.length; i++) {
            var c = cs[i];
            if (c.x < 0 || c.x >= this.B || c.y >= this.H) return false;
            if (c.y >= 0 && this.g[c.y][c.x]) return false;
        }
        return true;
    };

    /* Drejning med vaegspark. retning 1: med uret, -1: mod uret.
       Giver { rot, x, y } eller null. */
    P.drej = function (a, retning) {
        var F = FORMER[a.form];
        if (F.fast) return null;
        var til = (a.rot + (retning > 0 ? 1 : 3)) % 4;
        var liste = F.sten ? SPARK_STEN : (a.form === "I" ? SPARK_I : SPARK)[a.rot + ">" + til];
        for (var i = 0; i < liste.length; i++) {
            var nx = a.x + liste[i][0], ny = a.y - liste[i][1];
            if (this.passer(a.form, til, nx, ny)) return { rot: til, x: nx, y: ny };
        }
        return null;
    };

    /* Hvor langt ned kan brikken falde? Giver y for skyggen. */
    P.bund = function (a) {
        var y = a.y;
        while (this.passer(a.form, a.rot, a.x, y + 1)) y++;
        return y;
    };

    /* Laeg brikken paa brættet. Giver dens id. orden er et loebenummer,
       saa aeldre brikker reagerer foer nyere, naar der er et valg. */
    P.placer = function (a) {
        var id = String(this.naesteId++);
        this.stykker[id] = a.sten
            ? { id: id, sten: true, orden: this.naesteId, salt: false }
            : { id: id, ion: Kemi.ion(a.ion), orden: this.naesteId, salt: false, enhed: 0 };
        var mig = this;
        celler(a.form, a.rot, a.x, a.y).forEach(function (c) {
            if (c.y >= 0 && c.y < mig.H) mig.g[c.y][c.x] = { id: id };
        });
        return id;
    };

    /* Ligger en brik helt oppe over de synlige raekker? */
    P.overBraettet = function (a) {
        return celler(a.form, a.rot, a.x, a.y).every(function (c) { return c.y < D.SKJULT; });
    };

    /* ----- Grafen over de brikker, der venter --------------------------- */
    P.graf = function () {
        var noder = {}, kanter = {}, x, y;
        for (y = 0; y < this.H; y++) {
            for (x = 0; x < this.B; x++) {
                var c = this.g[y][x];
                if (!c) continue;
                var s = this.stykker[c.id];
                if (s.salt || s.sten) continue;
                noder[s.id] = s;
                var naboer = [[1, 0], [0, 1]];
                for (var i = 0; i < naboer.length; i++) {
                    var n = this.celle(x + naboer[i][0], y + naboer[i][1]);
                    if (!n || n.id === c.id) continue;
                    var t = this.stykker[n.id];
                    if (t.salt || t.sten) continue;
                    (kanter[s.id] = kanter[s.id] || {})[t.id] = true;
                    (kanter[t.id] = kanter[t.id] || {})[s.id] = true;
                }
            }
        }
        return { noder: noder, kanter: kanter };
    };

    /* Lad alle de grupper reagere, der kan. Giver en liste over
       reaktionerne, hver med sine celler, saa de kan blinke. */
    P.reager = function (nyId) {
        var ud = [];
        for (var sikring = 0; sikring < 200; sikring++) {
            var gr = this.graf();
            var r = Kemi.findReaktion(gr.noder, gr.kanter, nyId);
            if (!r) break;
            var enhed = this.naesteEnhed++;
            var mig = this;
            r.ids.forEach(function (id) {
                var s = mig.stykker[id];
                s.salt = true;
                s.enhed = enhed;
                s.formel = r.formel;
                s.kat = r.kat;
                s.an = r.an;
            });
            r.enhed = enhed;
            r.celler = this.cellerFor(r.ids);
            ud.push(r);
        }
        return ud;
    };

    P.cellerFor = function (ids) {
        var ud = [], x, y;
        for (y = 0; y < this.H; y++) {
            for (x = 0; x < this.B; x++) {
                var c = this.g[y][x];
                if (c && ids.indexOf(c.id) >= 0) ud.push({ x: x, y: y });
            }
        }
        return ud;
    };

    /* Ville brikken blive til salt, hvis den blev lagt her? Proever uden at
       aendre noget. Giver reaktionen eller null. */
    P.proev = function (a) {
        if (a.sten) return null;
        var cs = celler(a.form, a.rot, a.x, a.y), mig = this;
        var id = "proeve";
        this.stykker[id] = { id: id, ion: Kemi.ion(a.ion), orden: 1e9, salt: false };
        cs.forEach(function (c) { if (c.y >= 0) mig.g[c.y][c.x] = { id: id }; });
        var gr = this.graf();
        var r = Kemi.findReaktion(gr.noder, gr.kanter, id);
        cs.forEach(function (c) { if (c.y >= 0) mig.g[c.y][c.x] = null; });
        delete this.stykker[id];
        return r && r.medNy ? r : null;
    };

    /* ----- Saltet forsvinder, og brikkerne falder ----------------------- */

    /* Fjern alle brikker, der er blevet til salt. Giver antallet af celler. */
    P.fjernSalt = function () {
        var n = 0, x, y;
        for (y = 0; y < this.H; y++) {
            for (x = 0; x < this.B; x++) {
                var c = this.g[y][x];
                if (c && this.stykker[c.id].salt) { this.g[y][x] = null; n++; }
            }
        }
        this.ryd();
        return n;
    };

    /* ----- Fulde raekker, som i almindelig tetris ----------------------- */
    P.fuld = function (y) {
        for (var x = 0; x < this.B; x++) if (!this.g[y][x]) return false;
        return true;
    };

    P.fuldeRaekker = function () {
        var ud = [];
        for (var y = 0; y < this.H; y++) if (this.fuld(y)) ud.push(y);
        return ud;
    };

    /* Fjerner raekkerne, og alt ovenover rykker ned (som i tetris, ingen
       tyngdekraft paa de enkelte brikker). Sten og ioner i raekkerne
       forsvinder. En ion, der mister alle sine celler, er vaek; den
       kommer igen i koeen (spil.js). Giver listen over de ioner. */
    P.fjernRaekker = function (liste) {
        var mig = this, ramt = {};
        liste.forEach(function (y) {
            for (var x = 0; x < mig.B; x++) {
                var s = mig.stykker[mig.g[y][x].id];
                if (!s.sten && !s.salt) ramt[s.id] = s;
            }
        });
        liste.slice().sort(function (a, b) { return a - b; }).forEach(function (y) {
            mig.g.splice(y, 1);
            mig.g.unshift(mig.tomRaekke());
        });
        this.ryd();
        var vaek = [];
        Object.keys(ramt).forEach(function (id) { if (!mig.stykker[id]) vaek.push(ramt[id].ion); });
        return vaek;
    };

    /* Ét skridt tyngdekraft: alle brikker, der ikke hviler paa bunden eller
       paa en brik, der gør, falder én raekke. Brikkerne falder hele, ikke
       celle for celle. Giver true, hvis noget faldt. */
    P.tyngdeSkridt = function () {
        var mig = this, x, y, id;
        var celleListe = {};
        for (y = 0; y < this.H; y++) {
            for (x = 0; x < this.B; x++) {
                var c = this.g[y][x];
                if (c) (celleListe[c.id] = celleListe[c.id] || []).push({ x: x, y: y });
            }
        }
        var hviler = {}, aendret = true;
        while (aendret) {
            aendret = false;
            for (id in celleListe) {
                if (hviler[id]) continue;
                var paa = celleListe[id].some(function (c) {
                    if (c.y === mig.H - 1) return true;
                    var under = mig.g[c.y + 1][c.x];
                    return !!under && under.id !== id && hviler[under.id];
                });
                if (paa) { hviler[id] = true; aendret = true; }
            }
        }
        var falder = Object.keys(celleListe).filter(function (i) { return !hviler[i]; });
        if (!falder.length) return false;
        falder.forEach(function (i) { celleListe[i].forEach(function (c) { mig.g[c.y][c.x] = null; }); });
        falder.forEach(function (i) { celleListe[i].forEach(function (c) { mig.g[c.y + 1][c.x] = { id: i }; }); });
        return true;
    };

    /* Glem brikker, der ikke har celler tilbage */
    P.ryd = function () {
        var brugt = {}, x, y;
        for (y = 0; y < this.H; y++) for (x = 0; x < this.B; x++) if (this.g[y][x]) brugt[this.g[y][x].id] = true;
        for (var id in this.stykker) if (!brugt[id]) delete this.stykker[id];
    };

    P.tomt = function () {
        for (var y = 0; y < this.H; y++) for (var x = 0; x < this.B; x++) if (this.g[y][x]) return false;
        return true;
    };

    /* Grupper, der venter, med deres ladning og den oeverste celle */
    P.ventende = function () {
        var gr = this.graf(), mig = this;
        return Kemi.grupper(gr.noder, gr.kanter).map(function (g) {
            var top = null;
            mig.cellerFor(g.ids).forEach(function (c) {
                if (!top || c.y < top.y || (c.y === top.y && c.x < top.x)) top = c;
            });
            g.top = top;
            return g;
        });
    };

    NK.Braet = Braet;
    NK.Braet.FORMER = FORMER;
    NK.Braet.FORM_NAVNE = FORM_NAVNE;
    NK.Braet.STEN_NAVNE = STEN_NAVNE;
    NK.Braet.celler = celler;
}());
