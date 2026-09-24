/* =====================================================================
   sim_udtryk.js - fane 3: Hastighedsudtryk

   En ukendt reaktion. Eleven vaelger startkoncentrationer, maaler
   starthastigheden og finder selv eksponenterne i hastighedsudtrykket.
   Hvert forsoeg giver en kurve for produktet med den stiplede tangent
   i t = 0: dens hældning er starthastigheden, som i fane 1.

   Kortet har den ene knap (Giv hint -> Vis svaret -> Ny opgave). Hintet
   bygges ud fra elevens egne forsoeg: har man to forsoeg, hvor kun ét
   stof er aendret, peges der paa dem, ellers bedes man lave dem.
   Tallene kommer fra NK.Model.udtryk og reaktionerne fra D.REAKTIONER.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var M = NK.Model.udtryk;

    var FARVER = ["#f0a830", "#5fb6f0", "#57d18c", "#c9a6ff", "#ff8a80", "#f2e06b"];
    var SKRIFT = "'Segoe UI', sans-serif";
    var LIG = 1e-9;

    function SimUdtryk() {
        this.L = new NK.Laerred(NK.el("udtryk-laerred"));
        this.tid = 0;
        this.antalLoest = 0;
        this.nr = 0;
        this.lay = null;
        this.bind();
        this.nyOpgave(0);
    }

    var P = SimUdtryk.prototype;

    /* ----- En opgave = en reaktion ---------------------------------------- */
    P.nyOpgave = function (nr) {
        this.nr = nr % D.REAKTIONER.length;
        var R = this.R = D.REAKTIONER[this.nr];
        var grund = {};
        this.valgt = {};
        this.eksp = {};
        R.reaktanter.forEach(function (r) {
            grund[r.id] = D.KONC[0];
            this.valgt[r.id] = D.KONC[0];
            this.eksp[r.id] = null;
        }, this);
        this.T = M.tidsakse(R, grund);
        this.forsoeg = [];
        this.naesteNr = 1;
        this.trin = "hint";
        this.vist = false;
        this.loest = false;
        this.bygVaelgere();
        this.bygUdtryk();
        this.besked("", "");
        this.saetHint("");
        this.visPanel();
    };

    P.nulstil = function () {
        this.forsoeg = [];
        this.naesteNr = 1;
        this.visPanel();
    };

    /* Et forsoeg med de valgte startkoncentrationer */
    P.maal = function (c0) {
        c0 = c0 || this.valgt;
        var kopi = {};
        Object.keys(c0).forEach(function (k) { kopi[k] = c0[k]; });
        var f = {
            nr: this.naesteNr++,
            c0: kopi,
            v0: M.starthastighed(this.R, kopi),
            kurve: M.forloeb(this.R, kopi, this.T, 120)
        };
        this.forsoeg.push(f);
        while (this.forsoeg.length > D.MAKS_FORSOEG) this.forsoeg.shift();
        this.visPanel();
        return f;
    };

    /* To forsoeg, hvor kun stoffet id er aendret. Det med den mindste
       koncentration kommer foerst. */
    P.findPar = function (id) {
        var fs = this.forsoeg, R = this.R;
        for (var i = 0; i < fs.length; i++) {
            for (var j = 0; j < fs.length; j++) {
                if (i === j) continue;
                var a = fs[i], b = fs[j];
                if (!(a.c0[id] < b.c0[id] - LIG)) continue;
                var resten = R.reaktanter.every(function (r) {
                    return r.id === id || Math.abs(a.c0[r.id] - b.c0[r.id]) < LIG;
                });
                if (resten) return [a, b];
            }
        }
        return null;
    };

    P.formel = function (id) {
        return this.R.reaktanter.filter(function (r) { return r.id === id; })[0].formel;
    };

    /* ----- Tjek ------------------------------------------------------------ */
    P.tjek = function () {
        var R = this.R, mig = this;
        if (this.loest || this.vist) return { rigtig: this.loest };
        var mangler = R.reaktanter.some(function (r) { return mig.eksp[r.id] === null; });
        if (mangler) {
            this.besked("Vælg en eksponent for hvert stof. Klik på firkanterne.", "gul");
            return { rigtig: false, grund: "mangler" };
        }
        var forkerte = R.reaktanter.filter(function (r) { return mig.eksp[r.id] !== R.orden[r.id]; });
        if (!forkerte.length) {
            this.loest = true;
            this.antalLoest++;
            this.trin = "ny";
            var nul = R.reaktanter.filter(function (r) { return R.orden[r.id] === 0; });
            var tekst = "Rigtigt: " + D.udtrykTekst(R, R.orden) + ".";
            if (nul.length) tekst += " [" + nul[0].formel + "] er ikke med: den påvirker ikke hastigheden.";
            this.besked(tekst, "god");
            this.visPanel();
            return { rigtig: true };
        }
        /* Den typiske fejl: eksponenterne er taget fra reaktionsskemaet */
        var fraSkema = R.reaktanter.every(function (r) { return mig.eksp[r.id] === Math.min(2, r.koef); })
            && R.reaktanter.some(function (r) { return Math.min(2, r.koef) !== R.orden[r.id]; });
        if (fraSkema) {
            this.besked("Det er tallene fra reaktionsskemaet. Hastighedsudtrykket kan kun findes ved forsøg.", "skidt");
            return { rigtig: false, grund: "skema" };
        }
        var r = forkerte[0], par = this.findPar(r.id);
        if (par) {
            var f = par[1].c0[r.id] / par[0].c0[r.id], g = par[1].v0 / par[0].v0;
            this.besked("[" + r.formel + "] passer ikke. I forsøg " + par[0].nr + " og " + par[1].nr + " blev [" + r.formel +
                "] ganget med " + NK.faktor(f) + ", og v₀ blev ganget med " + NK.faktor(g) + ".", "skidt");
        } else {
            this.besked("[" + r.formel + "] passer ikke. Lav to forsøg, hvor kun [" + r.formel + "] ændres.", "skidt");
        }
        return { rigtig: false, grund: "forkert", id: r.id };
    };

    /* ----- Den ene knap ------------------------------------------------------ */
    P.tryk = function () {
        if (this.trin === "ny") { this.nyOpgave(this.nr + 1); return; }
        if (this.trin === "hint") {
            this.saetHint("Hint: " + this.hint());
            this.trin = "svar";
        } else if (this.trin === "svar") {
            this.visSvar();
        }
        this.visPanel();
    };

    P.hint = function () {
        var R = this.R, mig = this;
        var r = R.reaktanter.filter(function (x) { return mig.eksp[x.id] !== R.orden[x.id]; })[0] || R.reaktanter[0];
        if (R.reaktanter.length === 1) {
            return "Lav to forsøg med forskellig [" + r.formel + "]. Fordobles [" + r.formel + "], hvor mange gange større bliver v₀?";
        }
        var par = this.findPar(r.id);
        if (par) {
            return "Sammenlign forsøg " + par[0].nr + " og " + par[1].nr + ". Kun [" + r.formel + "] er ændret. Hvor mange gange større blev v₀?";
        }
        return "Lav to forsøg, hvor kun [" + r.formel + "] ændres, og de andre koncentrationer er ens.";
    };

    P.visSvar = function () {
        var R = this.R;
        this.vist = true;
        this.trin = "ny";
        R.reaktanter.forEach(function (r) { this.eksp[r.id] = R.orden[r.id]; }, this);
        var dele = R.reaktanter.map(function (r) {
            return "[" + r.formel + "] × 2 giver v₀ × " + Math.pow(2, R.orden[r.id]);
        });
        this.besked("Svaret er " + D.udtrykTekst(R, R.orden) + ". " + dele.join(". ") + ".", "gul");
        this.bygUdtryk();
    };

    /* ----- Panelet og arbejdsbordet -------------------------------------------- */
    P.bind = function () {
        var mig = this;
        NK.el("udtryk-opgaveknap").addEventListener("click", function () { mig.tryk(); });
        NK.el("udtryk-maal").addEventListener("click", function () { mig.maal(); });
        NK.el("udtryk-ryd").addEventListener("click", function () { mig.nulstil(); });
        NK.el("udtryk-tjek").addEventListener("click", function () { mig.tjek(); });
        var cv = this.L.canvas;
        cv.addEventListener("pointerdown", function (e) {
            var p = mig.L.punkt(e);
            if (NK.laererFanger) NK.laererFanger(p);
        });
        cv.addEventListener("pointermove", function (e) {
            var p = mig.L.punkt(e);
            cv.style.cursor = NK.laererUnder && NK.laererUnder(p) ? "pointer" : "default";
        });
    };

    P.bygVaelgere = function () {
        var mig = this, boks = NK.el("udtryk-vaelgere");
        boks.innerHTML = "";
        this.R.reaktanter.forEach(function (r) {
            var raekke = document.createElement("div");
            raekke.className = "vaelger-raekke";
            var navn = document.createElement("span");
            navn.className = "vaelger-navn";
            navn.textContent = "[" + r.formel + "]";
            raekke.appendChild(navn);
            var gruppe = document.createElement("div");
            gruppe.className = "segment";
            D.KONC.forEach(function (c) {
                var k = document.createElement("button");
                k.type = "button";
                k.textContent = NK.tal(c, 2);
                k.setAttribute("data-id", r.id);
                k.setAttribute("data-c", String(c));
                k.addEventListener("click", function () {
                    mig.valgt[r.id] = c;
                    mig.visPanel();
                });
                gruppe.appendChild(k);
            });
            raekke.appendChild(gruppe);
            var enhed = document.createElement("span");
            enhed.className = "vaelger-enhed";
            enhed.textContent = "M";
            raekke.appendChild(enhed);
            boks.appendChild(raekke);
        });
    };

    P.bygUdtryk = function () {
        var mig = this, R = this.R, boks = NK.el("udtryk-formel");
        boks.innerHTML = "";
        function tekst(s, klasse) {
            var e = document.createElement("span");
            e.textContent = s;
            if (klasse) e.className = klasse;
            boks.appendChild(e);
        }
        tekst("v(" + R.produkt.formel + ") = k");
        R.reaktanter.forEach(function (r) {
            tekst(" · [" + r.formel + "]", "led");
            var k = document.createElement("button");
            k.type = "button";
            k.className = "eksp";
            k.title = "Klik for at vælge 0, 1 eller 2";
            k.setAttribute("data-id", r.id);
            k.addEventListener("click", function () {
                if (mig.loest || mig.vist) return;
                var n = mig.eksp[r.id];
                mig.eksp[r.id] = n === null ? 0 : (n + 1) % 3;
                mig.besked("", "");
                mig.visPanel();
            });
            boks.appendChild(k);
        });
        this.visPanel();
    };

    P.besked = function (tekst, art) {
        NK.saetTekst("udtryk-besked", tekst);
        NK.saetKlasse("udtryk-besked", "besked" + (art ? " " + art : ""));
    };

    P.saetHint = function (tekst) {
        NK.saetTekst("udtryk-hint", tekst);
    };

    P.visPanel = function () {
        var mig = this, R = this.R;
        /* Tallet foran et stof maa ikke staa alene for enden af en linje */
        NK.saetTekst("udtryk-ligning", R.ligning.replace(/(\d) /g, "$1 "));
        NK.saetTekst("udtryk-loest", String(this.antalLoest));
        NK.saetTekst("udtryk-nr", (this.nr + 1) + "/" + D.REAKTIONER.length);
        NK.saetKnaptrin("udtryk-opgaveknap", this.trin);

        Array.prototype.forEach.call(document.querySelectorAll("#udtryk-vaelgere button"), function (k) {
            var id = k.getAttribute("data-id");
            k.classList.toggle("aktiv", Math.abs(mig.valgt[id] - parseFloat(k.getAttribute("data-c"))) < LIG);
        });
        Array.prototype.forEach.call(document.querySelectorAll("#udtryk-formel .eksp"), function (k) {
            var n = mig.eksp[k.getAttribute("data-id")];
            k.textContent = n === null ? "?" : String(n);
            k.classList.toggle("tom", n === null);
            k.disabled = mig.loest || mig.vist;
        });
        NK.el("udtryk-tjek").disabled = this.loest || this.vist;

        /* Tabellen over forsoegene */
        var h = "<thead><tr><th>Nr.</th>";
        R.reaktanter.forEach(function (r) { h += "<th>[" + NK.html(r.formel) + "] / M</th>"; });
        h += "<th>v₀ / (M/s)</th></tr></thead><tbody>";
        if (!this.forsoeg.length) {
            h += '<tr class="tom"><td colspan="' + (R.reaktanter.length + 2) + '">Ingen forsøg endnu. Vælg koncentrationer, og tryk Mål.</td></tr>';
        }
        this.forsoeg.forEach(function (f) {
            var farve = FARVER[(f.nr - 1) % FARVER.length];
            h += '<tr><td><span class="nrchip" style="background-color:' + farve + '">' + f.nr + "</span></td>";
            R.reaktanter.forEach(function (r) { h += "<td>" + NK.tal(f.c0[r.id], 2) + "</td>"; });
            h += "<td><b>" + NK.sci(f.v0, 3) + "</b></td></tr>";
        });
        h += "</tbody>";
        NK.saetHTML("udtryk-tabel", h);
    };

    /* ----- Tegning ---------------------------------------------------------- */
    P.tilpas = function () {
        var ny = this.L.tilpas();
        if (!ny && this.lay) return;
        var W = this.L.b, H = this.L.h;
        this.lay = { W: W, H: H, gx0: 92, gx1: W - 40, gy0: 26, gy1: H - 52 };
    };

    P.opdater = function (dt) {
        this.tid += dt;
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        this.L.ryd();
        if (!lay || lay.gy1 - lay.gy0 < 40) return;
        var T = this.T;
        var yMaks = 0;
        this.forsoeg.forEach(function (f) { f.kurve.forEach(function (q) { yMaks = Math.max(yMaks, q.c); }); });
        if (yMaks <= 0) yMaks = M.starthastighed(this.R, this.valgt) * T * 0.6;
        var yTrin = NK.paentTrin(yMaks, 5);
        yMaks = Math.ceil(yMaks / yTrin * 1.05) * yTrin;
        var dec = Math.max(0, -Math.floor(Math.log10(yTrin) + 1e-9));
        function X(t) { return lay.gx0 + t / T * (lay.gx1 - lay.gx0); }
        function Y(c) { return lay.gy1 - NK.klamp(c, 0, yMaks) / yMaks * (lay.gy1 - lay.gy0); }

        ctx.save();
        ctx.font = "13px " + SKRIFT;
        ctx.fillStyle = "#9fa6af";
        ctx.lineWidth = 1;
        ctx.textAlign = "center";
        var tTrin = NK.paentTrin(T, 5);
        for (var t = 0; t <= T + 1e-9; t += tTrin) {
            ctx.strokeStyle = "rgba(255,255,255,0.06)";
            ctx.beginPath(); ctx.moveTo(X(t), lay.gy0); ctx.lineTo(X(t), lay.gy1); ctx.stroke();
            ctx.fillText(NK.tal(t, tTrin < 1 ? 1 : 0), X(t), lay.gy1 + 19);
        }
        ctx.textAlign = "right";
        for (var c = 0; c <= yMaks + 1e-12; c += yTrin) {
            ctx.strokeStyle = "rgba(255,255,255,0.06)";
            ctx.beginPath(); ctx.moveTo(lay.gx0, Y(c)); ctx.lineTo(lay.gx1, Y(c)); ctx.stroke();
            ctx.fillText(NK.tal(c, dec), lay.gx0 - 8, Y(c) + 4);
        }
        ctx.strokeStyle = "#6b7280";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(lay.gx0, lay.gy0 - 8); ctx.lineTo(lay.gx0, lay.gy1); ctx.lineTo(lay.gx1 + 8, lay.gy1);
        ctx.stroke();
        ctx.fillStyle = "#c8ced6";
        ctx.font = "600 13px " + SKRIFT;
        ctx.textAlign = "center";
        ctx.fillText("t / s", (lay.gx0 + lay.gx1) / 2, lay.gy1 + 42);
        ctx.save();
        ctx.translate(lay.gx0 - 66, (lay.gy0 + lay.gy1) / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText("[" + this.R.produkt.formel + "] / M", 0, 0);
        ctx.restore();
        ctx.restore();

        if (!this.forsoeg.length) {
            NK.tekst(ctx, "Hvert forsøg giver en kurve her", (lay.gx0 + lay.gx1) / 2, (lay.gy0 + lay.gy1) / 2,
                { font: "600 16px " + SKRIFT, justering: "center", farve: "#9fa6af" });
            return;
        }
        this.forsoeg.forEach(function (f) {
            var farve = FARVER[(f.nr - 1) % FARVER.length];
            /* Tangenten i t = 0: starthastigheden */
            var tEnde = Math.min(T * 0.5, yMaks / f.v0);
            ctx.save();
            ctx.setLineDash([6, 5]);
            ctx.strokeStyle = farve;
            ctx.globalAlpha = 0.75;
            ctx.lineWidth = 1.8;
            ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(tEnde), Y(f.v0 * tEnde)); ctx.stroke();
            ctx.restore();
            /* Kurven */
            ctx.save();
            ctx.strokeStyle = farve;
            ctx.lineWidth = 3;
            ctx.lineJoin = "round";
            ctx.beginPath();
            f.kurve.forEach(function (q, i) { if (i === 0) ctx.moveTo(X(q.t), Y(q.c)); else ctx.lineTo(X(q.t), Y(q.c)); });
            ctx.stroke();
            ctx.restore();
            var s = f.kurve[f.kurve.length - 1];
            NK.tekst(ctx, String(f.nr), X(s.t) + 8, Y(s.c) + 5, { font: "700 14px " + SKRIFT, farve: farve, kant: true });
        });
    };

    NK.SimUdtryk = SimUdtryk;
}());
