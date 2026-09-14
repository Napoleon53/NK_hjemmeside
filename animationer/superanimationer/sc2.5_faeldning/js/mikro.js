/* =====================================================================
   mikro.js - ionerne i zoomcirklen

   Ionerne er ikke pynt. Hver draabe har lige mange formelenheder
   (samme koncentration), saa en draabe Na₃PO₄ giver tre gange saa
   mange Na⁺ som PO₄³⁻. Naar et bundfald dannes, samles praecis saa
   mange ioner, som reaktionsskemaet tillader. Resten bliver i
   opløsningen: tilskuerionerne og det, der er i overskud.

   Ionerne i bundfaldet synker ned og lægger sig i et lag i bunden af
   cirklen. De frie bevaeger sig tilfaeldigt rundt.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var S = NK.Scene;

    var FART = 38;               /* frie ioners fart, tegneenheder pr. sekund */
    var REAKTIONSTID = 2.6;      /* sekunder om at samle hele bundfaldet */
    var AFSTAND = 25;            /* afstand mellem ionerne i bundfaldet */

    function r(a, b) { return a + Math.random() * (b - a); }

    NK.Mikro = function () {
        this.ioner = [];
        this.noegle = "";
        this.enheder = 0;
        this.bundfald = null;
    };

    var M = NK.Mikro.prototype;

    /* Formelenheder pr. draabe. Faa draaber: flere ioner, saa det kan
       ses. Mange draaber: faerre pr. draabe, saa cirklen ikke flyder over. */
    M.PR_DRAABE = function (antalDraaber) {
        return antalDraaber <= 2 ? 6 : 3;
    };

    /* Byg ionerne op paa ny, men kun hvis draabens indhold har aendret sig. */
    M.byg = function (draaber, noegle) {
        noegle = noegle + "|" + JSON.stringify(draaber);
        if (noegle === this.noegle) return;
        this.noegle = noegle;

        var antal = 0, id;
        for (id in draaber) antal += draaber[id];
        var fe = this.PR_DRAABE(antal);

        var taelling = {};
        D.OPLOESNINGER.forEach(function (o) {
            var d = draaber[o.id] || 0;
            if (!d) return;
            taelling[o.kat] = (taelling[o.kat] || 0) + o.p * fe * d;
            taelling[o.an] = (taelling[o.an] || 0) + o.n * fe * d;
        });

        /* Frie ioner først */
        var Z = S.ZOOM;
        var ioner = [];
        D.ION_ORDEN.forEach(function (ionId) {
            for (var i = 0; i < (taelling[ionId] || 0); i++) {
                var v = r(0, Math.PI * 2), afst = Math.sqrt(Math.random()) * (Z.r - 22);
                var fv = r(0, Math.PI * 2);
                ioner.push({
                    id: ionId, x: Z.x + Math.cos(v) * afst, y: Z.y + Math.sin(v) * afst,
                    vx: Math.cos(fv) * FART, vy: Math.sin(fv) * FART,
                    bundet: false, enhed: -1, plads: null, fremme: false
                });
            }
        });

        /* Saa bundfaldet: saa mange hele formelenheder, som der er ioner til */
        var analyse = D.analyser(draaber);
        var enheder = [];
        analyse.bundfald.forEach(function (b) {
            var k = D.koefficienter(b.kat, b.an);
            var frieK = ioner.filter(function (x) { return x.id === b.kat && !x.bundet; });
            var frieA = ioner.filter(function (x) { return x.id === b.an && !x.bundet; });
            var n = Math.min(Math.floor(frieK.length / k.kat), Math.floor(frieA.length / k.an));
            for (var e = 0; e < n; e++) {
                var enhed = [];
                var j;
                for (j = 0; j < k.an; j++) enhed.push(frieA[e * k.an + j]);
                for (j = 0; j < k.kat; j++) enhed.splice(Math.min(enhed.length, 1 + 2 * j), 0, frieK[e * k.kat + j]);
                enhed.forEach(function (ion) { ion.bundet = true; ion.enhed = enheder.length; ion.info = b.info; });
                enheder.push(enhed);
            }
        });

        /* Pladserne i bundfaldet: rækker nedefra, fra venstre mod hoejre */
        var pladser = [];
        var raekke = 0;
        var antalBundet = 0;
        enheder.forEach(function (e) { antalBundet += e.length; });
        while (pladser.length < antalBundet && raekke < 12) {
            var y = Z.y + Z.r - 18 - raekke * AFSTAND * 0.88;
            var halv = Math.sqrt(Math.max(0, (Z.r - 16) * (Z.r - 16) - (y - Z.y) * (y - Z.y)));
            var forskyd = raekke % 2 ? AFSTAND / 2 : 0;
            var nx = Math.floor((2 * halv - forskyd) / AFSTAND);
            var x0 = Z.x - (nx - 1) * AFSTAND / 2 + forskyd / 2;
            for (var c = 0; c < nx && pladser.length < antalBundet; c++) pladser.push({ x: x0 + c * AFSTAND, y: y });
            raekke++;
        }
        var p = 0;
        enheder.forEach(function (e) {
            e.forEach(function (ion) { ion.plads = pladser[p++] || { x: Z.x, y: Z.y + Z.r - 18 }; });
        });

        this.ioner = ioner;
        this.enheder = enheder.length;
        this.bundfald = analyse.bundfald.length ? analyse.bundfald[0] : null;
    };

    /* Taelling til panelet og selvtesten: { Ag: { fri, bundet } } */
    M.optael = function () {
        var ud = {};
        this.ioner.forEach(function (ion) {
            var t = ud[ion.id] || (ud[ion.id] = { fri: 0, bundet: 0 });
            if (ion.bundet) t.bundet++; else t.fri++;
        });
        return ud;
    };

    /* grad: hvor langt reaktionen er naaet, 0-1 (fra forsoeg.js). */
    M.opdater = function (dt, grad) {
        var Z = S.ZOOM;
        for (var i = 0; i < this.ioner.length; i++) {
            var ion = this.ioner[i];
            var R = D.IONER[ion.id].r;
            var aktiv = ion.bundet && grad * this.enheder > ion.enhed;
            if (aktiv) {
                ion.x = NK.mod(ion.x, ion.plads.x, 2.8, dt);
                ion.y = NK.mod(ion.y, ion.plads.y, 2.8, dt);
                var dx = ion.plads.x - ion.x, dy = ion.plads.y - ion.y;
                ion.fremme = dx * dx + dy * dy < 2;
                continue;
            }
            /* Tilfaeldig bevaegelse: retningen drejer lidt hele tiden */
            var fart = Math.sqrt(ion.vx * ion.vx + ion.vy * ion.vy) || FART;
            var retning = Math.atan2(ion.vy, ion.vx) + (Math.random() - 0.5) * 6 * dt;
            fart = NK.mod(fart, FART * (1 - 0.25 * R / 15), 2, dt);
            ion.vx = Math.cos(retning) * fart;
            ion.vy = Math.sin(retning) * fart;
            ion.x += ion.vx * dt;
            ion.y += ion.vy * dt;
            var ex = ion.x - Z.x, ey = ion.y - Z.y;
            var l = Math.sqrt(ex * ex + ey * ey), maks = Z.r - R - 2;
            if (l > maks) {
                var ux = ex / l, uy = ey / l;
                ion.x = Z.x + ux * maks;
                ion.y = Z.y + uy * maks;
                var prik = ion.vx * ux + ion.vy * uy;
                ion.vx -= 2 * prik * ux;
                ion.vy -= 2 * prik * uy;
            }
        }
        this.skilAd(dt, grad);
    };

    /* Frie ioner skubber let til hinanden, saa de ikke ligger oven i
       hinanden. Ioner paa vej ind i bundfaldet staar fast. */
    M.skilAd = function (dt, grad) {
        var n = this.ioner.length, styrke = Math.min(1, dt * 12);
        for (var i = 0; i < n; i++) {
            var a = this.ioner[i];
            var aFast = a.bundet && grad * this.enheder > a.enhed;
            for (var j = i + 1; j < n; j++) {
                var b = this.ioner[j];
                var bFast = b.bundet && grad * this.enheder > b.enhed;
                if (aFast && bFast) continue;
                var dx = b.x - a.x, dy = b.y - a.y;
                var min = D.IONER[a.id].r + D.IONER[b.id].r + 1;
                var d2 = dx * dx + dy * dy;
                if (d2 >= min * min || d2 < 0.0001) continue;
                var d = Math.sqrt(d2);
                var skub = (min - d) * styrke;
                var ux = dx / d, uy = dy / d;
                if (aFast) { b.x += ux * skub; b.y += uy * skub; }
                else if (bFast) { a.x -= ux * skub; a.y -= uy * skub; }
                else {
                    a.x -= ux * skub / 2; a.y -= uy * skub / 2;
                    b.x += ux * skub / 2; b.y += uy * skub / 2;
                }
            }
        }
    };

    function tegnIon(ctx, ion) {
        var I = D.IONER[ion.id];
        var R = I.r;
        var g = ctx.createRadialGradient(ion.x - R * 0.35, ion.y - R * 0.4, R * 0.1, ion.x, ion.y, R);
        g.addColorStop(0, "#ffffff");
        g.addColorStop(0.35, I.farve);
        g.addColorStop(1, I.farve);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(ion.x, ion.y, R, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
        ctx.lineWidth = 1;
        ctx.stroke();
        NK.tekst(ctx, D.ionTekst(ion.id), ion.x, ion.y + 0.5, {
            str: 10, vaegt: 700, justering: "center", linje: "middle", farve: "#14161b", maks: R * 2 - 3
        });
    }

    M.tegn = function (ctx) {
        var i;
        /* Et svagt skaer i bundfaldets farve bag de ioner, der er fremme */
        for (i = 0; i < this.ioner.length; i++) {
            var ion = this.ioner[i];
            if (ion.bundet && ion.fremme && ion.info) {
                NK.skaer(ctx, ion.x, ion.y, 24, NK.rgba(ion.info.farve, 0.5), 0.5);
            }
        }
        /* Frie ioner først, saa bundfaldet ligger ovenpaa */
        for (i = 0; i < this.ioner.length; i++) if (!this.ioner[i].bundet) tegnIon(ctx, this.ioner[i]);
        for (i = 0; i < this.ioner.length; i++) if (this.ioner[i].bundet) tegnIon(ctx, this.ioner[i]);
    };
}());
