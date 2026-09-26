/* =====================================================================
   raekke.js - det, fane 2 og 3 har til faelles

   Begge faner laver en raekke forsoeg, hvor uret stopper selv, naar
   krydset er vaek. Et forsoeg koerer hurtigt: uret gaar op til nogle
   gange hurtigere end virkeligheden, saa et forsoeg varer hoejst ca.
   4,5 s paa skaermen. Den maalte tid har lidt spredning (± 3 %), som
   naar man selv trykker (NK.Model.maaling).

   NK.Raekke.paa(P, { p: "konc" }) giver fanens prototype:
     startKoersel(bl, T, info)   et nyt forsoeg med blandingen bl ved T °C
     koer(sek)                   tiden frem i smaa skridt (selvtesten)
     spolFrem()                  forsoeget slutter med det samme
     opdaterKoersel(dt)          kaldes fra fanens opdater
     tegnVisning(ctx, v)         glasset oppefra og uret i omraadet v
     tegnPunkter(ctx, g, o)      en graf med et punkt pr. forsoeg
   Fanen skal selv have lavRaekke(koersel), der giver tabellens raekke,
   og visPanel().
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var M = NK.Model;
    var Tg = NK.Tegn;
    var SKRIFT = Tg.SKRIFT;
    var VARIGHED = 4.5;        /* sekunder paa skaermen, hoejst */

    function paa(P) {
        P.startKoersel = function (bl, T, info) {
            if (this.koersel) return null;
            var f = M.forloeb(bl, T);
            var maalt = M.maaling(f.dtKryds);
            var slut = isFinite(maalt) ? maalt : M.MAKS_TID;
            this.koersel = {
                forl: f, bl: bl, T: T, info: info || {},
                tid: 0, dtMaalt: maalt, slut: slut,
                faktor: Math.max(1, slut / VARIGHED)
            };
            this.visPanel();
            return this.koersel;
        };

        P.opdaterKoersel = function (dt) {
            var k = this.koersel;
            if (!k) return;
            k.tid += dt * k.faktor;
            if (k.tid >= k.slut) this.afslutKoersel();
        };

        P.spolFrem = function () {
            if (this.koersel) this.afslutKoersel();
        };

        P.afslutKoersel = function () {
            var k = this.koersel;
            k.tid = k.slut;
            this.koersel = null;
            this.sidsteKoersel = k;
            var r = this.lavRaekke(k);
            r.nr = this.naesteNr++;
            this.forsoeg.push(r);
            while (this.forsoeg.length > D.MAKS_FORSOEG) this.forsoeg.shift();
            this.nyRaekke = r.nr;
            this.visPanel();
            return r;
        };

        P.koer = function (sek) {
            var n = Math.max(1, Math.ceil(sek / 0.02));
            for (var i = 0; i < n; i++) this.opdater(sek / n);
        };

        /* Glasset oppefra med uret under. v = { x, y, b, h } */
        P.tegnVisning = function (ctx, v, o) {
            o = o || {};
            var k = this.koersel || this.sidsteKoersel;
            var r = Math.max(40, Math.min(v.b * 0.42, (v.h - 90) / 2));
            var cx = v.x + v.b / 2, cy = v.y + 28 + r;
            var kontrast = k ? k.forl.kontrast(k.tid) : 1;
            var titel = this.koersel ? "FORSØG " + this.naesteNr : (k ? "FORSØG " + (this.naesteNr - 1) : "SET OPPEFRA");
            NK.tekst(ctx, titel, cx, v.y + 14, { font: "700 13px " + SKRIFT, justering: "center", farve: "#9fa6af" });
            Tg.oppefra(ctx, cx, cy, r, { vaeske: !!k, kontrast: kontrast, tid: this.tid,
                hvirvel: this.koersel ? NK.klamp(1 - this.koersel.tid / this.koersel.faktor / 1.5, 0, 1) : 0 });
            if (o.termometer !== undefined) {
                var th = r * 2.1;
                Tg.termometer(ctx, cx - r - 30, cy - th / 2 - 6, th, o.termometer);
                NK.tekst(ctx, Math.round(o.termometer) + " °C", cx - r - 30, cy + th / 2 + 22,
                    { font: "700 15px " + SKRIFT, justering: "center", farve: "#ff9b8f" });
            }
            var tekst, farve = "#9fa6af";
            if (this.koersel) {
                tekst = NK.tal(this.koersel.tid, 1) + " s";
                farve = "#f2c53d";
            } else if (k) {
                tekst = isFinite(k.dtMaalt) ? "Δt = " + NK.tal(k.dtMaalt, 1) + " s" : "Krydset forsvandt ikke";
                farve = "#ffffff";
            } else {
                tekst = "0,0 s";
            }
            NK.tekst(ctx, tekst, cx, cy + r + 34, { font: "700 22px " + SKRIFT, justering: "center", farve: farve });
            if (this.koersel && this.koersel.faktor > 1.05) {
                NK.tekst(ctx, "uret går " + Math.round(this.koersel.faktor) + " gange hurtigere", cx, cy + r + 56,
                    { font: "600 13px " + SKRIFT, justering: "center", farve: "#9fa6af" });
            } else if (!this.koersel && k && !isFinite(k.dtMaalt)) {
                NK.tekst(ctx, "på " + Math.round(M.MAKS_TID / 60) + " minutter", cx, cy + r + 56,
                    { font: "600 13px " + SKRIFT, justering: "center", farve: "#9fa6af" });
            }
        };

        /* Et punkt pr. forsoeg. o = { x(r), xNavn, xMaks, tom, gruppe(r) } */
        P.tegnPunkter = function (ctx, g, o) {
            var mig = this;
            var punkter = this.forsoeg.map(function (r) {
                var x = o.x(r);
                return x === null || x === undefined ? null : { r: r, x: x, y: isFinite(r.dt) ? 1 / r.dt : 0 };
            }).filter(function (q) { return q; });
            var yMaks = 0.02;
            punkter.forEach(function (q) { yMaks = Math.max(yMaks, q.y * 1.15); });
            var sx = Tg.skala(o.xMaks, 5), sy = Tg.skala(yMaks, 4);
            var a = Tg.akser(ctx, g, {
                xMaks: sx.maks, yMaks: sy.maks, xTrin: sx.trin, yTrin: sy.trin, xDec: sx.dec, yDec: sy.dec,
                xNavn: o.xNavn, yNavn: "1/Δt / s⁻¹"
            });
            if (!punkter.length) {
                NK.tekst(ctx, o.tom, (g.x0 + g.x1) / 2, (g.y0 + g.y1) / 2,
                    { font: "600 15px " + SKRIFT, justering: "center", farve: "#9fa6af" });
                return a;
            }
            /* En serie: forsoeg, hvor alt andet er ens (o.gruppe), forbindes
               med en svag stiplet linje, saa man kan se, hvad der er aendret */
            if (o.gruppe) {
                var grupper = {};
                punkter.forEach(function (q) {
                    var n = o.gruppe(q.r);
                    (grupper[n] = grupper[n] || []).push(q);
                });
                ctx.save();
                ctx.setLineDash([5, 5]);
                ctx.strokeStyle = "rgba(200, 206, 214, 0.35)";
                ctx.lineWidth = 1.5;
                Object.keys(grupper).forEach(function (n) {
                    var liste = grupper[n].slice().sort(function (p1, p2) { return p1.x - p2.x; });
                    if (liste.length < 2 || liste[0].x === liste[liste.length - 1].x) return;
                    ctx.beginPath();
                    liste.forEach(function (q, i) {
                        if (i === 0) ctx.moveTo(a.X(q.x), a.Y(q.y)); else ctx.lineTo(a.X(q.x), a.Y(q.y));
                    });
                    ctx.stroke();
                });
                ctx.restore();
            }
            punkter.forEach(function (q) {
                var farve = Tg.farve(q.r.nr), px = a.X(q.x), py = a.Y(q.y);
                var ny = mig.nyRaekke === q.r.nr;
                ctx.save();
                if (ny) {
                    ctx.strokeStyle = "rgba(242, 197, 61, 0.6)";
                    ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.arc(px, py, 12 + Math.sin(mig.tid * 5) * 2, 0, Math.PI * 2); ctx.stroke();
                }
                ctx.fillStyle = farve;
                ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = "#14141a";
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();
                NK.tekst(ctx, String(q.r.nr), px + 10, py - 9, { font: "700 14px " + SKRIFT, farve: farve, kant: true });
            });
            return a;
        };
    }

    /* Tal i tabellen: Δt og 1/Δt */
    function dtTekst(dt) { return isFinite(dt) ? NK.tal(dt, 1) : "intet"; }
    function frekvensTekst(dt) { return isFinite(dt) ? NK.bet(1 / dt, 3) : "0"; }

    NK.Raekke = { paa: paa, dtTekst: dtTekst, frekvensTekst: frekvensTekst };
}());
