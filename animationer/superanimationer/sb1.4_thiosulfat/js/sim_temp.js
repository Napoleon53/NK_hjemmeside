/* =====================================================================
   sim_temp.js - fane 3: Temperatur

   Den samme blanding hver gang (D.TEMP_BLANDING). Begge opløsninger
   staar i vandbad, til de har den valgte temperatur, saa blandingen
   ogsaa har den. Eleven vaelger temperaturen og maaler; uret stopper
   selv. Grafen viser 1/Δt mod temperaturen, og opgaverne tjekker
   tommelfingerreglen om en fordobling pr. 10 °C.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var M = NK.Model;
    var R = NK.Raekke;
    var Tg = NK.Tegn;

    function SimTemp() {
        this.L = new NK.Laerred(NK.el("temp-laerred"));
        this.tid = 0;
        this.T = M.T_REF;
        this.forsoeg = [];
        this.naesteNr = 1;
        this.koersel = null;
        this.sidsteKoersel = null;
        this.lay = null;
        this.kort = new NK.Opgavekort("temp", D.TEMP_OPGAVER, this);
        this.bind();
        if (this.laererStart) this.laererStart();
        this.bygTilbud();
        this.visPanel();
    }

    var P = SimTemp.prototype;
    R.paa(P);

    P.skru = function (d) {
        if (this.koersel) return;
        var ny = this.T + d;
        if (ny < D.TEMP_MIN || ny > D.TEMP_MAKS) {
            this.besked(ny < D.TEMP_MIN ? "Koldere kan isvandet ikke gøre det." : "Varmere bliver det ikke her. Syren damper.", "gul");
            return;
        }
        this.T = ny;
        this.sidsteKoersel = null;      /* et nyt glas ved den nye temperatur */
        this.besked("", "");
        this.visPanel();
    };

    P.maal = function () {
        if (this.koersel) { this.spolFrem(); return; }
        var b = D.TEMP_BLANDING;
        this.startKoersel(M.blanding(b.thio, b.syre, b.vand), this.T);
        this.besked("", "");
    };

    P.lavRaekke = function (k) {
        return { T: k.T, dt: k.dtMaalt };
    };

    P.nulstil = function () {
        if (this.koersel) return;
        this.forsoeg = [];
        this.naesteNr = 1;
        this.sidsteKoersel = null;
        this.besked("", "");
        this.visPanel();
    };

    P.opsaetOpgave = function () {};
    P.slutOpgave = function () {};

    P.besked = function (tekst, art) {
        NK.saetTekst("temp-tabelbesked", tekst);
        NK.saetKlasse("temp-tabelbesked", "besked" + (art ? " " + art : ""));
    };

    P.bind = function () {
        var mig = this;
        NK.el("temp-ned").addEventListener("click", function () { mig.skru(-D.TEMP_TRIN); });
        NK.el("temp-op").addEventListener("click", function () { mig.skru(D.TEMP_TRIN); });
        NK.el("temp-maal").addEventListener("click", function () { mig.maal(); });
        NK.el("temp-ryd").addEventListener("click", function () { mig.nulstil(); });
        var cv = this.L.canvas;
        cv.addEventListener("pointerdown", function (e) {
            var p = mig.L.punkt(e);
            if (mig.laererIntroKlik && mig.laererIntroKlik(p.x, p.y)) return;
            if (mig.laererKlik && mig.laererKlik(p.x, p.y)) return;
            var lay = mig.lay;
            if (lay && p.x < lay.vis.x + lay.vis.b) {
                if (mig.koersel) mig.besked("Uret stopper selv, når krydset er væk.", "gul");
                else mig.besked("Vælg temperaturen til højre, og tryk Mål.", "gul");
            } else if (lay) {
                mig.besked("Hvert forsøg bliver et punkt her. Vælg en temperatur til højre, og tryk Mål.", "gul");
            }
        });
        cv.addEventListener("pointermove", function (e) {
            var p = mig.L.punkt(e);
            cv.style.cursor = mig.laererUnder && mig.laererUnder(p.x, p.y) ? "pointer" : "default";
        });
        NK.el("temp-spring").addEventListener("click", function () { mig.springIntro(); });
    };

    P.visPanel = function () {
        var b = D.TEMP_BLANDING;
        NK.saetTekst("temp-blanding", b.thio + " mL " + M.THIO_TEKST + " Na₂S₂O₃, " + b.syre + " mL 1,0 M HCl og " + b.vand +
            " mL vand. Begge opløsninger står først i vandbad ved temperaturen.");
        NK.saetTekst("temp-T", this.T + " °C");
        NK.el("temp-ned").disabled = !!this.koersel;
        NK.el("temp-op").disabled = !!this.koersel;
        NK.saetHTML("temp-maal", this.koersel ? "<span>Spol frem</span><span class=\"tegn\">⏩</span>"
            : "<span>Mål ved " + this.T + " °C</span><span class=\"tegn\">▶</span>");
        NK.saetKlasse("temp-maal", this.koersel ? "knap stor" : "knap stor groen");

        var h = "<thead><tr><th>Nr.</th><th>T / °C</th><th>Δt / s</th><th>1/Δt / s⁻¹</th></tr></thead><tbody>";
        if (!this.forsoeg.length) h += '<tr class="tom"><td colspan="4">Ingen forsøg endnu. Vælg en temperatur, og tryk Mål.</td></tr>';
        this.forsoeg.forEach(function (r) {
            h += '<tr><td><span class="nrchip" style="background-color:' + Tg.farve(r.nr) + '">' + r.nr + "</span></td>" +
                "<td>" + r.T + "</td><td><b>" + R.dtTekst(r.dt) + "</b></td><td>" + R.frekvensTekst(r.dt) + "</td></tr>";
        });
        NK.saetHTML("temp-tabel", h + "</tbody>");
    };

    /* ----- Tegning ------------------------------------------------------------ */
    P.tilpas = function () {
        var ny = this.L.tilpas();
        if (!ny && this.lay) return;
        var W = this.L.b, H = this.L.h;
        var visB = NK.klamp(W * 0.32, 210, 320);
        this.lay = {
            W: W, H: H,
            vis: { x: 70, y: 10, b: visB - 50, h: H - 20 },
            graf: { x0: visB + 110, x1: W - 36, y0: 64, y1: H - 56 }
        };
    };

    P.opdater = function (dt) {
        this.tid += dt;
        this.opdaterKoersel(dt);
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
    };

    P.tegn = function () {
        var L = this.L, ctx = L.ctx, lay = this.lay;
        L.ryd();
        if (!lay) return;
        var k = this.koersel || this.sidsteKoersel;
        this.tegnVisning(ctx, lay.vis, { termometer: this.koersel ? this.koersel.T : this.T });
        this.tegnPunkter(ctx, lay.graf, {
            x: function (r) { return r.T; },
            gruppe: function () { return "alle"; },   /* samme blanding: én serie */
            xMaks: D.TEMP_MAKS,
            xNavn: "T / °C",
            tom: "Hvert forsøg bliver et punkt her"
        });
        if (this.laererTegnOver) this.laererTegnOver(ctx);
        return k;
    };

    NK.Praesentation.kobl(P, { noegle: "nk-sb1.4-intro-temp", tilbud: "temp-tilbud", spring: "temp-spring" });

    NK.SimTemp = SimTemp;
}());
