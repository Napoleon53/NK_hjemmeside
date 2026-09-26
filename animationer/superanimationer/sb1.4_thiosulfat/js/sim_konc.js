/* =====================================================================
   sim_konc.js - fane 2: Koncentration

   Eleven vaelger rumfangene af Na₂S₂O₃, HCl og vand og maaler. Uret
   stopper selv. Hvert forsoeg bliver en raekke i tabellen, og eleven
   regner selv [S₂O₃²⁻] og [H₃O⁺] i blandingen ud. Foerst naar et tal
   er rigtigt, kommer punktet paa grafen for 1/Δt. Efter to rigtige i
   en kolonne regnes resten af den for eleven.

   Fejl blokeres ikke: glemmer eleven vandet, aendres begge
   koncentrationer, og vaesken bliver lavere. Det faar en konsekvens i
   modellen (kortere lysvej), og panelet siger, at rumfanget ikke er
   50 mL. Et forkert tal i tabellen giver et svar paa den typiske fejl,
   og anden gang staar hele beregningen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var M = NK.Model;
    var Tg = NK.Tegn;
    var R = NK.Raekke;
    var SKRIFT = Tg.SKRIFT;

    var STOF = {
        c: { navn: "[S₂O₃²⁻]", flaske: M.C_THIO, flaskeTekst: M.THIO_TEKST, vol: "vThio" },
        h: { navn: "[H₃O⁺]", flaske: M.C_SYRE, flaskeTekst: M.SYRE_TEKST, vol: "vSyre" }
    };

    function SimKonc() {
        this.L = new NK.Laerred(NK.el("konc-laerred"));
        this.tid = 0;
        this.vol = { thio: D.KONC_START.thio, syre: D.KONC_START.syre, vand: D.KONC_START.vand };
        this.akse = "c";
        this.forsoeg = [];
        this.naesteNr = 1;
        this.koersel = null;
        this.sidsteKoersel = null;
        this.rigtige = { c: 0, h: 0 };
        this.auto = { c: false, h: false };
        this.lay = null;
        this.kort = new NK.Opgavekort("konc", D.KONC_OPGAVER, this);
        this.bind();
        if (this.laererStart) this.laererStart();
        this.bygTilbud();
        this.visPanel();
    }

    var P = SimKonc.prototype;
    R.paa(P);

    /* ----- Forsoeg ------------------------------------------------------ */
    P.iAlt = function () {
        return this.vol.thio + this.vol.syre + this.vol.vand;
    };

    P.skru = function (stof, d) {
        if (this.koersel) return;
        var ny = this.vol[stof] + d;
        if (ny < 0 || ny > D.MAKS_ML) return;
        if (d > 0 && this.iAlt() + d > M.V_GLAS) {
            this.besked("Bægerglasset kan højst rumme " + M.V_GLAS + " mL.", "gul");
            return;
        }
        this.vol[stof] = ny;
        this.sidsteKoersel = null;      /* et nyt glas: det gamle resultat forsvinder fra visningen */
        this.visPanel();
    };

    P.maal = function () {
        if (this.koersel) { this.spolFrem(); return; }
        if (this.iAlt() <= 0) { this.besked("Glasset er tomt. Vælg rumfangene først.", "gul"); return; }
        var bl = M.blanding(this.vol.thio, this.vol.syre, this.vol.vand);
        this.startKoersel(bl, M.T_REF);
        this.besked("", "");
    };

    P.lavRaekke = function (k) {
        var bl = k.bl;
        return {
            vThio: bl.vThio, vSyre: bl.vSyre, vVand: bl.vVand, v: bl.v,
            c: bl.c, h: bl.h, dt: k.dtMaalt,
            svar: { c: this.auto.c ? { v: bl.c, auto: true } : null, h: this.auto.h ? { v: bl.h, auto: true } : null },
            forkerte: { c: 0, h: 0 }
        };
    };

    P.nulstil = function () {
        if (this.koersel) return;
        this.forsoeg = [];
        this.naesteNr = 1;
        this.sidsteKoersel = null;
        this.besked("", "");
        this.visPanel();
    };

    P.raekke = function (nr) {
        return this.forsoeg.filter(function (r) { return r.nr === nr; })[0] || null;
    };

    /* Den paene beregning: [S₂O₃²⁻] = 0,30 M · 20 mL / 50 mL = 0,12 M */
    P.beregning = function (r, stof) {
        var s = STOF[stof];
        return s.navn + " = " + s.flaskeTekst + " · " + r[s.vol] + " mL / " + r.v + " mL = " + NK.bet(r[stof], 2) + " M";
    };

    /* Eleven har skrevet et tal i tabellen */
    P.tjekFelt = function (nr, stof, tekst) {
        var r = this.raekke(nr), s = STOF[stof];
        if (!r || r.svar[stof]) return null;
        if (!String(tekst || "").trim()) return null;
        var v = NK.laesTal(tekst), sand = r[stof];
        if (!isFinite(v)) {
            this.besked("Skriv et tal, fx 0,060.", "gul");
            return { rigtig: false, grund: "tal" };
        }
        function naer(a, b, rel) { return Math.abs(a - b) <= Math.max(rel * Math.abs(b), 0.0006); }
        /* Rigtigt: inden for 2,5 %, eller tallet rigtigt afrundet til to betydende
           cifre (0,13 for 0,125) */
        var halvCiffer = sand > 0 ? 0.5 * Math.pow(10, Math.floor(Math.log10(sand)) - 1) * 1.001 : 0;
        if (naer(v, sand, 0.025) || Math.abs(v - sand) <= halvCiffer) {
            r.svar[stof] = { v: v };
            this.rigtige[stof]++;
            this.nyRaekke = nr;
            if (this.rigtige[stof] >= 2 && !this.auto[stof]) {
                this.auto[stof] = true;
                this.forsoeg.forEach(function (x) { if (!x.svar[stof]) x.svar[stof] = { v: x[stof], auto: true }; });
                this.besked("Rigtigt. To rigtige i kolonnen " + s.navn + ": resten af den regnes for dig.", "god");
            } else {
                this.besked("Rigtigt: " + this.beregning(r, stof) + ".", "god");
            }
            if (this.afvisTilbud) this.afvisTilbud();
            this.visPanel();
            return { rigtig: true };
        }
        r.forkerte[stof]++;
        var grund = "forkert", tekst2;
        var andre = [r.vVand, r.vThio + r.vSyre, r[s.vol] + r.vVand, r.v - r[s.vol]];
        var delt = andre.some(function (x) { return x > 0 && x !== r.v && naer(v, s.flaske * r[s.vol] / x, 0.03); });
        if (naer(v, s.flaske, 0.03)) {
            tekst2 = "Det er koncentrationen i flasken. I glasset er den fortyndet til " + r.v + " mL.";
            grund = "flaske";
        } else if (delt) {
            tekst2 = "Del med det samlede rumfang: " + r.vThio + " + " + r.vSyre + " + " + r.vVand + " = " + r.v + " mL.";
            grund = "rumfang";
        } else if (r[s.vol] > 0 && naer(v, s.flaske * r.v / r[s.vol], 0.03)) {
            tekst2 = "Brøken er vendt om. Gang med V(stof) / V(i alt).";
            grund = "vendt";
        } else if (naer(v, r[stof === "c" ? "h" : "c"], 0.03) && r.c !== r.h) {
            tekst2 = "Det er den anden koncentration. Tjek, hvilken flaske du skal bruge.";
            grund = "anden";
        } else if (naer(v, sand, 0.12)) {
            tekst2 = "Tæt på. Skriv tallet med to betydende cifre.";
            grund = "afrunding";
        } else {
            tekst2 = "Passer ikke. Brug c = c(flaske) · V(stof) / V(i alt).";
        }
        if (r.forkerte[stof] >= 2) {
            r.svar[stof] = { v: sand, vist: true };
            this.nyRaekke = nr;
            this.besked(tekst2 + " Sådan: " + this.beregning(r, stof) + ".", "gul");
        } else {
            this.besked(tekst2, "skidt");
        }
        this.visPanel();
        return { rigtig: false, grund: grund };
    };

    P.saetAkse = function (akse) {
        this.akse = akse;
        this.visPanel();
    };

    /* ----- Opgavekortet ---------------------------------------------------- */
    P.opsaetOpgave = function () {};
    P.slutOpgave = function () {};

    /* ----- Panel --------------------------------------------------------------- */
    P.besked = function (tekst, art) {
        NK.saetTekst("konc-tabelbesked", tekst);
        NK.saetKlasse("konc-tabelbesked", "besked" + (art ? " " + art : ""));
    };

    P.bind = function () {
        var mig = this;
        Array.prototype.forEach.call(document.querySelectorAll("#konc-forsoeg [data-stof]"), function (k) {
            k.addEventListener("click", function () {
                mig.skru(k.getAttribute("data-stof"), parseInt(k.getAttribute("data-d"), 10));
            });
        });
        NK.el("konc-maal").addEventListener("click", function () { mig.maal(); });
        NK.el("konc-ryd").addEventListener("click", function () { mig.nulstil(); });
        Array.prototype.forEach.call(document.querySelectorAll("#konc-akse button"), function (k) {
            k.addEventListener("click", function () { mig.saetAkse(k.getAttribute("data-akse")); });
        });
        /* Tallene i tabellen: tjekkes, naar feltet forlades eller Enter trykkes */
        NK.el("konc-tabel").addEventListener("change", function (e) {
            var f = e.target;
            if (!f || !f.classList.contains("svarfelt")) return;
            var nr = f.getAttribute("data-nr"), stof = f.getAttribute("data-stof");
            var svar = mig.tjekFelt(parseInt(nr, 10), stof, f.value);
            if (svar && svar.rigtig) {
                mig.fokusNaeste(stof);
            } else if (svar) {
                var igen = document.querySelector('#konc-tabel .svarfelt[data-nr="' + nr + '"][data-stof="' + stof + '"]');
                if (igen) { igen.focus(); igen.select(); }
            }
        });
        NK.el("konc-tabel").addEventListener("keydown", function (e) {
            if (e.key === "Enter" && e.target.classList.contains("svarfelt")) e.target.blur();
        });
        var cv = this.L.canvas;
        cv.addEventListener("pointerdown", function (e) {
            var p = mig.L.punkt(e);
            if (mig.laererIntroKlik && mig.laererIntroKlik(p.x, p.y)) return;
            if (mig.laererKlik && mig.laererKlik(p.x, p.y)) return;
            var lay = mig.lay;
            if (lay && p.x < lay.vis.x + lay.vis.b) {
                if (mig.koersel) mig.besked("Uret stopper selv, når krydset er væk.", "gul");
                else mig.besked("Vælg rumfangene til højre, og tryk Bland og mål.", "gul");
            } else if (lay) {
                var mangler = mig.forsoeg.some(function (r) { return !r.svar[mig.akse]; });
                mig.besked(!mig.forsoeg.length ? "Hvert forsøg bliver et punkt her. Vælg rumfangene til højre, og tryk Bland og mål." :
                    (mangler ? "Et punkt kommer, når du har regnet koncentrationen ud i tabellen." :
                    "Ét punkt pr. forsøg. Skift den vandrette akse øverst til højre."), "gul");
            }
        });
        cv.addEventListener("pointermove", function (e) {
            var p = mig.L.punkt(e);
            cv.style.cursor = mig.laererUnder && mig.laererUnder(p.x, p.y) ? "pointer" : "default";
        });
        NK.el("konc-spring").addEventListener("click", function () { mig.springIntro(); });
    };

    P.fokusNaeste = function (stof) {
        var felt = document.querySelector('#konc-tabel .svarfelt[data-stof="' + stof + '"]') ||
            document.querySelector("#konc-tabel .svarfelt");
        if (felt) felt.focus();
    };

    P.visPanel = function () {
        var mig = this, v = this.vol, iAlt = this.iAlt();
        NK.saetTekst("konc-thio-flaske", M.THIO_TEKST);
        NK.saetTekst("konc-thio", v.thio + " mL");
        NK.saetTekst("konc-syre", v.syre + " mL");
        NK.saetTekst("konc-vand", v.vand + " mL");
        NK.saetTekst("konc-ialt", iAlt + " mL");
        NK.saetKlasse("konc-ialt-raekke", "raekke" + (iAlt !== M.V_REF ? " advar" : ""));
        NK.saetTekst("konc-ialt-note", iAlt !== M.V_REF ? "Ikke " + M.V_REF + " mL: lyset går gennem " +
            (iAlt < M.V_REF ? "mindre" : "mere") + " væske." : "");
        Array.prototype.forEach.call(document.querySelectorAll("#konc-forsoeg [data-stof]"), function (k) {
            k.disabled = !!mig.koersel;
        });
        NK.saetHTML("konc-maal", this.koersel ? "<span>Spol frem</span><span class=\"tegn\">⏩</span>"
            : "<span>Bland og mål</span><span class=\"tegn\">▶</span>");
        NK.saetKlasse("konc-maal", this.koersel ? "knap stor" : "knap stor groen");
        Array.prototype.forEach.call(document.querySelectorAll("#konc-akse button"), function (k) {
            k.classList.toggle("aktiv", k.getAttribute("data-akse") === mig.akse);
        });
        this.bygTabel();
    };

    /* Tabellen bygges om, naar noget aendres. Det, eleven er ved at
       skrive, og hvor markoeren staar, bevares. */
    P.bygTabel = function () {
        var boks = NK.el("konc-tabel");
        var skrevet = {}, fokus = null;
        Array.prototype.forEach.call(boks.querySelectorAll(".svarfelt"), function (f) {
            var id = f.getAttribute("data-nr") + f.getAttribute("data-stof");
            skrevet[id] = f.value;
            if (document.activeElement === f) fokus = id;
        });
        var h = "<thead><tr><th>Nr.</th><th>Na₂S₂O₃ / mL</th><th>HCl / mL</th><th>Vand / mL</th>" +
            "<th>Δt / s</th><th>1/Δt / s⁻¹</th><th>[S₂O₃²⁻] / M</th><th>[H₃O⁺] / M</th></tr></thead><tbody>";
        if (!this.forsoeg.length) {
            h += '<tr class="tom"><td colspan="8">Ingen forsøg endnu. Vælg rumfangene, og tryk Bland og mål.</td></tr>';
        }
        this.forsoeg.forEach(function (r) {
            h += '<tr><td><span class="nrchip" style="background-color:' + Tg.farve(r.nr) + '">' + r.nr + "</span></td>" +
                "<td>" + r.vThio + "</td><td>" + r.vSyre + "</td><td>" + r.vVand + "</td>" +
                "<td><b>" + R.dtTekst(r.dt) + "</b></td><td>" + R.frekvensTekst(r.dt) + "</td>";
            ["c", "h"].forEach(function (stof) {
                var sv = r.svar[stof];
                if (sv) {
                    h += '<td class="' + (sv.vist ? "vist" : "rigtig") + '">' + NK.bet(r[stof], 2) + "</td>";
                } else {
                    var fejl = r.forkerte[stof] > 0 ? " fejl" : "";
                    h += '<td><input class="svarfelt' + fejl + '" type="text" inputmode="decimal" autocomplete="off" ' +
                        'data-nr="' + r.nr + '" data-stof="' + stof + '" placeholder="?" aria-label="' +
                        STOF[stof].navn + " i forsøg " + r.nr + '"></td>';
                }
            });
            h += "</tr>";
        });
        NK.saetHTML("konc-tabel", h + "</tbody>");
        Array.prototype.forEach.call(boks.querySelectorAll(".svarfelt"), function (f) {
            var id = f.getAttribute("data-nr") + f.getAttribute("data-stof");
            if (skrevet[id] !== undefined && f.value !== skrevet[id]) f.value = skrevet[id];
            if (fokus === id && document.activeElement !== f) f.focus();
        });
    };

    /* ----- Tegning ---------------------------------------------------------- */
    P.tilpas = function () {
        var ny = this.L.tilpas();
        if (!ny && this.lay) return;
        var W = this.L.b, H = this.L.h;
        var visB = NK.klamp(W * 0.3, 190, 300);
        this.lay = {
            W: W, H: H,
            vis: { x: 16, y: 10, b: visB, h: H - 20 },
            graf: { x0: visB + 100, x1: W - 36, y0: 64, y1: H - 56 }
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
        this.tegnVisning(ctx, lay.vis);
        var c = this.akse === "c";
        var xMaks = c ? M.C_THIO : 0.2;
        this.forsoeg.forEach(function (r) { if (!c) xMaks = Math.max(xMaks, r.h * 1.1); });
        var mig = this;
        this.tegnPunkter(ctx, lay.graf, {
            x: function (r) { return r.svar[mig.akse] ? r[mig.akse] : null; },
            /* samme anden koncentration og samme rumfang: en serie */
            gruppe: function (r) { return (c ? r.h : r.c).toFixed(5) + "/" + r.v; },
            xMaks: xMaks,
            xNavn: STOF[this.akse].navn + " / M",
            tom: this.forsoeg.length ? "Regn " + STOF[this.akse].navn + " ud i tabellen, så kommer punktet her"
                : "Hvert forsøg bliver et punkt her"
        });
        if (this.laererTegnOver) this.laererTegnOver(ctx);
    };

    NK.Praesentation.kobl(P, { noegle: "nk-sb1.4-intro-konc", tilbud: "konc-tilbud", spring: "konc-spring" });

    NK.SimKonc = SimKonc;
}());
