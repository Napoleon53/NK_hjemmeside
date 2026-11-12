/* =====================================================================
   sim_ukendt.js - fane 3: Den ukendte syre

   Tre flasker (D.UKENDTE) med en ukendt syre og en kendt formel
   koncentration. Eleven maaler pH (en knap: elektroden saenkes, og
   displayet taeller), regner Kₛ i bogens fire trin (figuren b6-ks-vej:
   oxonium, basen, syren, konstanten), saa pKₛ, og finder syren paa
   hylden med seks af bogens syrer. Flaske A har alle trin og til sidst
   omdannelsesgraden; i B og C udfyldes [B] af sig selv, naar [H₃O⁺] er
   fundet.

   Tavlen bygges op (brugerens oenske 30. okt. 2026, "bladrer lidt i
   beregningen ... saa det loebende afsloeres og udbygges"): hvert trin
   har en ramme med nummer, de kommende staar tomme, det aktive har en gul
   ramme, og det loeste viser hele beregningen. Hylden kommer frem, naar
   kortet spoerger efter syren (svar foerst, naar de er aktuelle).

   Reaktionsskemaet (brugerens oenske 12. nov. 2026, "et billede af en
   generel syre/base reaktion, hvor der under skemaet dukker nogle udtryk
   op i takt med at man svarer"): oeverst paa tavlen staar S + H₂O ⇌ B +
   H₃O⁺, og [H₃O⁺], [B] og [S] kommer frem under deres stof, naar de er
   regnet. Kₛ, pKₛ og α har hver sin ramme under skemaet, og tallene i
   Kₛ-broeken har samme farve som stofferne i skemaet.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var F = NK.Formel;
    var T = NK.Tegning;
    var NOEGLE = "nk-sb6.1-ukendt";
    var RAMMER_FULD = ["konstanten", "pks", "alfa"];
    var RAMMER_KORT = ["konstanten", "pks"];
    var SKEMA = ["syren", "basen", "oxonium"];      /* under S, B og H₃O⁺ */
    var NY_TID = 0.5;                                /* udtrykket toner frem */
    var TITEL = { oxonium: "Oxonium", basen: "Basen", syren: "Syren", konstanten: "Konstanten", pks: "pK_s", alfa: "Omdannelsesgrad" };
    var MAAL_TID = 1.5;

    function SimUkendt() {
        var mig = this;
        this.hentStatus();
        this.startFane();
        NK.el("u-forfra").addEventListener("click", function () { mig.forfra(); });
        this.el.skort.addEventListener("input", function (e) {
            if (!e.target) return;
            if (e.target.id === "u-f1") mig.f1 = e.target.value;
            if (e.target.id === "u-f2") mig.f2 = e.target.value;
            e.target.classList.remove("ryst");
            mig.visIndsend();
        });
        this.el.skort.addEventListener("keydown", function (e) {
            if (e.target && /^u-f[12]$/.test(e.target.id) && e.key === "Enter") { e.preventDefault(); mig.indsendKlik(); }
        });
    }

    var P = SimUkendt.prototype;
    NK.Fane.paa(P, "u");

    /* ----- Hukommelsen ------------------------------------------------------------ */
    P.hentStatus = function () {
        var g = NK.hent(NOEGLE, {}) || {};
        this.opklaret = g.o || {};           /* A, B, C -> 1 eller 2 (uden fejl) */
    };
    P.gem = function () { NK.gem(NOEGLE, { o: this.opklaret }); };

    /* ----- Panelet ------------------------------------------------------------------ */
    P.visListe = function () {
        var mig = this, html = "";
        this.trinListe.forEach(function (id, j) {
            var kl = j < mig.trinNr || (j === mig.trinNr && mig.groen) ? "faerdig" : (j === mig.trinNr ? "nu" : "");
            html += '<li class="' + kl + '"><span class="tr-nr">' + (j + 1) + "</span><span>" + D.sub(NK.html(D.UKENDT_TRIN[id].navn)) + "</span></li>";
        });
        NK.saetHTML("u-trin", html);
        var fh = "";
        D.UKENDTE.forEach(function (u, j) {
            var o = mig.opklaret[u.id];
            fh += '<li class="' + (j === mig.nr ? "nu" : (o ? "faerdig" : "")) + '"><span class="tr-nr">' + u.id + "</span><span>" +
                (o ? NK.html(D.Navn(u.rigtig)) + (o === 2 ? " ★" : " ✓") : "Ukendt syre " + u.id) + "</span></li>";
        });
        NK.saetHTML("u-flasker", fh);
        NK.saetTekst("u-titel", "Flaske " + this.u.id);
    };

    /* ----- Forloebet ------------------------------------------------------------------ */
    P.vaelg = function (nr) {
        this.startFlaske(nr || 0);
    };

    P.startFlaske = function (nr) {
        this.nr = nr;
        this.u = D.UKENDTE[nr];
        this.r = D.kaede(this.u);
        this.trinListe = this.u.fuld ? D.UKENDT_FULD : D.UKENDT_KORT;
        this.rammer = this.u.fuld ? RAMMER_FULD : RAMMER_KORT;
        this.loest = {};
        this.ph = null;
        this.maaling = null;
        this.opklaringT = null;
        this.fundet = false;
        this.fejl = false;
        this.sv = false;
        this.faerdig = false;
        this.sejrT = null;
        this.nyT = {};
        this.startTrin(0);
    };

    P.startTrin = function (j) {
        this.trinNr = j;
        this.trin = this.trinListe[j];
        this.groen = null;
        this.valgt = null;
        this.forkerte = {};
        this.f1 = "";
        this.f2 = "";
        this.besked("", "");
        this.nulstilHjaelp();
        this.visKort();
        this.visListe();
        this.layout();
        var f = NK.el("u-f1");
        if (f) try { f.focus({ preventScroll: true }); } catch (x) { /* intet fokus */ }
    };

    P.td = function () { return D.UKENDT_TRIN[this.trin]; };

    P.felt = function (slags, label) {
        var v1 = NK.html(this.f1 || ""), v2 = NK.html(this.f2 || "");
        if (slags === "potens") {
            return '<div class="sk-felt potens"><label for="u-f1">' + label + '</label><input id="u-f1" class="foran" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" value="' + v1 + '" placeholder="tallet">' +
                '<span class="gange">· 10</span><input id="u-f2" class="eksp" type="text" inputmode="numeric" autocomplete="off" spellcheck="false" value="' + v2 + '" placeholder="eks." aria-label="eksponenten">' +
                '<span class="enhed">M</span></div>';
        }
        return '<div class="sk-felt"><label for="u-f1">' + label + '</label><input id="u-f1" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" value="' + v1 + '" placeholder="tallet med komma">' +
            (slags === "M" ? '<span class="enhed">M</span>' : (slags === "%" ? '<span class="enhed">%</span>' : "")) + "</div>";
    };

    P.kortData = function () {
        var d = this.td(), u = this.u, r = this.r, mig = this;
        var chip = "Flaske " + u.id + " · trin " + (this.trinNr + 1) + " af " + this.trinListe.length;
        var k = { slags: "spm", chip: chip, tekst: d.tekst(u, r) };
        if (this.trin === "maal") k.slags = "opgave";
        if (this.trin === "oxonium") k.ekstra = this.felt("potens", "[H₃O⁺] =");
        if (this.trin === "syren") k.ekstra = this.felt("M", "[S] =");
        if (this.trin === "konstanten") k.ekstra = this.felt("potens", "Kₛ =");
        if (this.trin === "pks") k.ekstra = this.felt("tal", "pKₛ =");
        if (this.trin === "alfa") k.ekstra = this.felt("%", "α =");
        if (this.trin === "basen") k.svar = d.svar(u, r).map(function (t, j) { return { t: t, valgt: mig.valgt === j, forkert: !!mig.forkerte[j] }; });
        return k;
    };

    P.svarValg = function (j) {
        if (this.groen || this.trin !== "basen") return;
        this.valgt = j;
        this.visKort();
    };

    P.skjulIndsend = function () { return this.maaling !== null; };
    P.skjulHint = function () { return this.maaling !== null; };

    P.kanSendes = function () {
        if (this.trin === "maal") return this.maaling === null;
        if (this.trin === "basen") return this.valgt !== null;
        if (this.trin === "flaske") return this.valgt !== null;
        return !!(String(this.f1 || "").trim() || String(this.f2 || "").trim());
    };
    P.indsendTekst = function () {
        if (this.trin === "maal") return "Mål pH";
        if (this.trin === "flaske" && this.valgt !== null) return "Indsend svar: " + D.SYRER[D.HYLDE[this.valgt]].navn;
        return "Indsend svar";
    };
    P.ingentingTekst = function () {
        if (this.trin === "flaske") return this.td().intet;
        if (this.trin === "basen") return "Vælg et svar på kortet først.";
        return "Skriv et tal i feltet først.";
    };

    P.tolkProcent = function (t) { return D.tolk(String(t || "").replace(/%/g, "")); };

    P.indsend = function () {
        var d = this.td(), u = this.u, r = this.r, tekst = null, v;
        if (this.trin === "maal") { this.maal(); return; }
        if (this.trin === "basen") {
            if (this.valgt === d.rigtig) { this.rigtigt(false); return; }
            this.fejl = true;
            this.forkerte[this.valgt] = true;
            var vb = this.valgt;
            this.valgt = null;
            this.visKort();
            this.fejlLinje(d.fejl[vb]);
            return;
        }
        if (this.trin === "flaske") {
            var id = D.HYLDE[this.valgt];
            if (id === u.rigtig) { this.rigtigt(false); return; }
            this.fejl = true;
            this.forkerte[this.valgt] = true;
            this.valgt = null;
            this.visIndsend();
            this.fejlLinje(d.fejl(id, r));
            return;
        }
        if (this.trin === "oxonium") {
            v = D.tolkPotens(this.f1, this.f2);
            if (isNaN(v) || !v) { this.tomt(); return; }
            var hx = Math.pow(10, -u.ph);
            if (D.naer(v, hx, 0.012)) { this.rigtigt(false); return; }
            if (D.naer(v, Math.pow(10, u.ph), 0.03)) tekst = d.fortegn;
            else if (D.naer(v, Math.exp(-u.ph), 0.03)) tekst = d.e;
            else tekst = d.andet(u);
        } else if (this.trin === "syren") {
            v = D.tolk(this.f1);
            if (isNaN(v)) { this.tomt(); return; }
            var sx = u.c - r.h;
            if (Math.abs(v - sx) <= Math.max(0.0006 * u.c, 1e-6) || Math.abs(v - r.s) < 1e-9) { this.rigtigt(false); return; }
            if (D.naer(v, u.c, 0.002)) tekst = d.cs;
            else if (D.naer(v, u.c + r.h, 0.002)) tekst = d.plus;
            else if (D.naer(v, r.h, 0.02)) tekst = d.b;
            else tekst = d.andet;
        } else if (this.trin === "konstanten") {
            v = D.tolkPotens(this.f1, this.f2);
            if (isNaN(v) || !v) { this.tomt(); return; }
            var kx = r.h * r.h / r.s;
            if (D.naer(v, kx, 0.025)) { this.rigtigt(false); return; }
            if (D.naer(v, r.h / r.s, 0.03)) tekst = d.kvadrat;
            else if (D.naer(v, r.h * r.h / u.c, 0.015)) tekst = d.cs;
            else tekst = d.andet;
        } else if (this.trin === "pks") {
            v = D.tolk(this.f1);
            if (isNaN(v)) { this.tomt(); return; }
            var px = -Math.log(r.k) / Math.LN10;
            if (Math.abs(v - px) < 0.012 || Math.abs(v - r.pks) < 0.006) { this.rigtigt(false); return; }
            if (Math.abs(v + px) < 0.02) tekst = d.fortegn;
            else if (Math.abs(Math.abs(v) - px * Math.LN10) < 0.05) tekst = d.ln;
            else tekst = d.andet;
        } else if (this.trin === "alfa") {
            v = this.tolkProcent(this.f1);
            if (isNaN(v)) { this.tomt(); return; }
            var ax = 100 * r.h / u.c;
            if (Math.abs(v - ax) <= 0.06) { this.rigtigt(false); return; }
            if (Math.abs(v - ax / 100) <= 0.0006) tekst = d.broek;
            else if (Math.abs(v - (100 - ax)) <= 0.1) tekst = d.rest;
            else tekst = d.andet;
        }
        this.fejl = true;
        this.fejlLinje(tekst || "Ikke rigtigt.");
    };

    P.tomt = function () {
        this.kortBlink();
        this.kortBesked("Skriv et tal i feltet, for eksempel 3,52.", 3.5);
    };

    P.ryst = function () {
        var e = this.el.status;
        e.classList.remove("ryster"); void e.offsetWidth; e.classList.add("ryster");
        ["u-f1", "u-f2"].forEach(function (id) {
            var f = NK.el(id);
            if (f) { f.classList.remove("ryst"); void f.offsetWidth; f.classList.add("ryst"); }
        });
    };

    /* pH-maalingen: elektroden ned, displayet taeller fra 7,00 */
    P.maal = function () {
        if (this.maaling !== null || this.trin !== "maal") return;
        this.maaling = 0;
        this.besked("", "");
        this.visKort();
    };

    P.rigtigt = function (vist) {
        var d = this.td(), u = this.u, r = this.r, tekst, svarNr, sidste = this.trinNr === this.trinListe.length - 1;
        if (vist) this.sv = true;
        this.loest[this.trin] = true;
        if (SKEMA.indexOf(this.trin) >= 0) this.nyT[this.trin] = 0;
        if (this.trin === "oxonium" && !u.fuld) { this.loest.basen = true; this.nyT.basen = 0; }
        if (this.trin === "basen") svarNr = d.rigtig;
        if (this.trin === "flaske") {
            svarNr = undefined;
            this.fundet = true;
            this.opklaringT = 0;
            this.opklaret[u.id] = (!this.fejl && !this.sv) || this.opklaret[u.id] === 2 ? 2 : 1;
            this.gem();
            tekst = u.slut;
        } else {
            tekst = typeof d.forkl === "function" ? d.forkl(u, r) : d.forkl;
        }
        if (sidste && this.trin === "alfa") tekst = d.forkl(u, r);
        var knap = "Næste trin →";
        if (sidste) {
            this.faerdig = true;
            knap = this.nr < D.UKENDTE.length - 1 ? "Næste flaske →" : null;
            if (!knap) tekst += " " + D.UKENDT_FAERDIG;
        }
        this.groen = { spm: true, maade: vist ? "svar" : "selv", tekst: tekst, knap: knap };
        if (svarNr !== undefined) this.groen.svarNr = svarNr;
        this.sejrT = 0;
        this.besked("", "");
        this.visKort();
        this.visListe();
        if (this.trin === "flaske") NK.konfetti(this.el.skort, 40);
    };

    P.videre = function () {
        if (this.faerdig) {
            if (this.nr < D.UKENDTE.length - 1) this.startFlaske(this.nr + 1);
            return;
        }
        this.startTrin(this.trinNr + 1);
    };

    P.forfra = function () {
        this.opklaret = {};
        this.gem();
        this.startFlaske(0);
    };
    P.nulstil = function () { if (!this.groen && this.maaling === null) this.startFlaske(this.nr); };

    P.hintNu = function () {
        if (this.groen) return [];
        var d = this.td();
        return typeof d.hint === "function" ? d.hint(this.u, this.r) : (d.hint || []);
    };

    P.visSvar = function () {
        var u = this.u, r = this.r, m;
        this.sv = true;
        if (this.trin === "maal") { this.maal(); return; }
        if (this.trin === "basen") this.valgt = 0;
        if (this.trin === "flaske") this.valgt = D.HYLDE.indexOf(u.rigtig);
        if (this.trin === "oxonium") { m = D.mantisse(r.h, 3); this.f1 = m.t; this.f2 = String(m.e); }
        if (this.trin === "syren") this.f1 = D.decimal(r.s);
        if (this.trin === "konstanten") { m = D.mantisse(r.k, 3); this.f1 = m.t; this.f2 = String(m.e); }
        if (this.trin === "pks") this.f1 = D.tal2(r.pks);
        if (this.trin === "alfa") this.f1 = D.tal1(r.alfa);
        this.rigtigt(true);
    };

    P.opdaterScene = function (dt) {
        if (this.maaling !== null) {
            this.maaling += dt;
            if (this.maaling >= MAAL_TID) {
                this.maaling = null;
                this.ph = this.u.ph;
                this.loest.maal = true;
                this.startTrin(this.trinNr + 1);
            }
        }
        if (this.opklaringT !== null) this.opklaringT += dt;
        for (var id in this.nyT) if (this.nyT[id] < NY_TID) this.nyT[id] += dt;
    };

    /* Displayet: 7,00 foer, saa taeller det ned til pH */
    P.visPh = function () {
        if (this.ph !== null) return this.ph.toFixed(2).replace(".", ",");
        if (this.maaling === null) return "– – –";
        var t = NK.klamp((this.maaling - 0.45) / (MAAL_TID - 0.65), 0, 1);
        if (this.maaling < 0.45) return "– – –";
        var v = 7 + (this.u.ph - 7) * NK.blod(t);
        return v.toFixed(2).replace(".", ",");
    };

    /* ----- Musen ------------------------------------------------------------------------- */
    P.hyldeVed = function (pt) {
        if (!pt || !this.hyldeKasser) return -1;
        for (var i = 0; i < this.hyldeKasser.length; i++) {
            var k = this.hyldeKasser[i];
            if (pt.x > k.x && pt.x < k.x + k.w && pt.y > k.y && pt.y < k.y + k.h) return i;
        }
        return -1;
    };

    P.paaMeter = function (pt) {
        var m = this.meterKasse;
        return pt && m && pt.x > m.x && pt.x < m.x + m.w && pt.y > m.y && pt.y < m.y + m.h;
    };

    P.overScene = function (pt) {
        if (!pt || this.groen) return null;
        if (this.trin === "flaske" && this.hyldeVed(pt) >= 0 && !this.forkerte[this.hyldeVed(pt)]) return "pointer";
        if (this.trin === "maal" && this.maaling === null && (this.paaMeter(pt) || this.paaKolbe(pt))) return "pointer";
        return null;
    };

    P.paaKolbe = function (pt) {
        var k = this.kolbeKasse;
        return pt && k && pt.x > k.x && pt.x < k.x + k.w && pt.y > k.y && pt.y < k.y + k.h;
    };

    P.klikScene = function (pt) {
        if (this.groen) { this.kortBlink(); return; }
        if (this.trin === "maal" && (this.paaMeter(pt) || this.paaKolbe(pt))) { this.maal(); return; }
        if (this.trin === "flaske") {
            var i = this.hyldeVed(pt);
            if (i >= 0 && !this.forkerte[i]) { this.valgt = i; this.visIndsend(); return; }
            if (i >= 0) { this.kortBesked(D.Navn(D.HYLDE[i]) + " er prøvet. Vælg en anden flaske.", 3); return; }
        }
        this.kortBlink();
        if (this.trin === "basen") this.kortBesked("Vælg et svar på kortet, og tryk Indsend svar.", 3);
        else if (this.trin !== "maal" && this.trin !== "flaske") this.kortBesked("Skriv svaret i feltet på kortet.", 3);
    };

    /* ----- Layout --------------------------------------------------------------------------- */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle;
        /* Venstre: pH-metret og kolben. Hoejre: rammerne og hylden */
        var vb = Math.round(NK.klamp(t.b * 0.27, 180, 250));
        var k = NK.klamp(Math.min((vb - 20) / 150, (t.h - 90) / 330), 0.62, 1.1);
        this.k = k;
        var lx = t.x + 16;
        this.meterKasse = { x: lx, y: t.y + 34, w: 150 * k, h: 112 * k };
        var kb = 150 * k * 0.95;
        this.kolbeKasse = { x: lx + (vb - 16 - kb) / 2 + 6, y: this.meterKasse.y + this.meterKasse.h + 58 * k, w: kb, h: kb * 170 / 150 };
        this.hx = t.x + vb + 18;
        this.hb = t.x + t.b - 16 - this.hx;
        this.fs = Math.round(NK.klamp(Math.min(this.hb / 32, t.h / 22), 13, 18));
        this.hyldeH = Math.round(NK.klamp(t.h * 0.3, 96, 128));
        this.hyldeY = t.y + t.h - this.hyldeH - 8;
        this.skema = this.u ? this.skemaLayout(this.L.ctx, t) : null;
        var ry = this.skema ? this.skema.y + this.skema.h + 8 : t.y + 8;
        this.saetAnker("maaler", lx - 4, this.meterKasse.y - 4, vb, this.kolbeKasse.y + this.kolbeKasse.h - this.meterKasse.y + 60);
        if (this.skema) this.saetAnker("skema", this.hx - 4, this.skema.y - 4, this.hb + 8, this.skema.h + 8);
        this.saetAnker("rammer", this.hx - 4, ry - 2, this.hb + 8, this.hyldeY - ry - 2);
        this.saetAnker("hylde", this.hx - 4, this.hyldeY - 4, this.hb + 8, this.hyldeH + 8);
    };

    /* ----- Tegning ------------------------------------------------------------------------ */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var t = lay.tavle;
        if (t.b < 200) return;
        T.tavle(ctx, lay);
        this.tegnMaaler(ctx, t);
        this.tegnSkema(ctx);
        this.tegnRammer(ctx, t);
        this.hyldeKasser = null;
        if (this.trin === "flaske" || this.fundet) this.tegnHylde(ctx, t);
        this.tegnSejr(ctx, t);
    };

    P.tegnMaaler = function (ctx, t) {
        var m = this.meterKasse, kk = this.kolbeKasse, k = this.k, u = this.u;
        var sk = kk.w / 150;
        /* Elektroden: hviler over halsen, saenkes ned i vaesken ved maalingen */
        var ned = this.ph !== null ? 1 : (this.maaling !== null ? NK.blod(this.maaling / 0.45) : 0);
        var ex = kk.x + 75 * sk, top0 = kk.y - 50 * sk, l = 108 * sk;
        var et = top0 + ned * 80 * sk;
        ctx.save();
        /* ledningen fra stikket */
        ctx.strokeStyle = "#2f3744";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(m.x + 128 * k, m.y + 2);
        ctx.bezierCurveTo(m.x + 128 * k, m.y - 30 * k, ex + 40 * k, et - 40 * k, ex, et);
        ctx.stroke();
        /* staven og glaskuglen */
        var g = ctx.createLinearGradient(ex - 5 * sk, 0, ex + 5 * sk, 0);
        g.addColorStop(0, "#9aa4b1");
        g.addColorStop(0.5, "#e6eaef");
        g.addColorStop(1, "#8a94a1");
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, ex - 5 * sk, et, 10 * sk, l, 4 * sk);
        ctx.fill();
        ctx.fillStyle = "#3b4655";
        NK.rundtRekt(ctx, ex - 6 * sk, et, 12 * sk, 18 * sk, 3 * sk);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ex, et + l, 6.5 * sk, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(220, 236, 246, 0.9)";
        ctx.fill();
        ctx.strokeStyle = "#7e9bb0";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
        /* Kolben ovenpaa, saa elektroden staar i vaesken */
        if (!T.sprite(ctx, "kolbe", kk.x, kk.y, kk.w)) {
            ctx.save(); ctx.fillStyle = "rgba(200, 222, 236, 0.5)";
            ctx.beginPath(); ctx.moveTo(kk.x + 61 * sk, kk.y); ctx.lineTo(kk.x + 89 * sk, kk.y); ctx.lineTo(kk.x + 140 * sk, kk.y + kk.h - 8);
            ctx.lineTo(kk.x + 10 * sk, kk.y + kk.h - 8); ctx.closePath(); ctx.fill(); ctx.restore();
        }
        /* Etiketten paa kolben: bogstavet */
        var lx = kk.x + 52 * sk, ly = kk.y + 122 * sk, lb = 46 * sk, lh = 28 * sk;
        ctx.save();
        ctx.fillStyle = this.fundet ? "#e6f6ec" : "#fffdf5";
        NK.rundtRekt(ctx, lx, ly, lb, lh, 4);
        ctx.fill();
        ctx.strokeStyle = this.fundet ? T.GROEN : "#cdbf96";
        ctx.lineWidth = 1.3;
        ctx.stroke();
        ctx.restore();
        NK.tekst(ctx, u.id, lx + lb / 2, ly + lh / 2 + 1, { font: "800 " + Math.round(17 * sk) + "px " + T.FONT, farve: T.BLAEK, justering: "center", linje: "middle" });
        /* pH-metret */
        if (!T.sprite(ctx, "phmeter", m.x, m.y, m.w)) {
            ctx.save(); ctx.fillStyle = "#d4d9e0"; NK.rundtRekt(ctx, m.x, m.y, m.w, m.h, 10); ctx.fill(); ctx.restore();
        }
        var dx = m.x + 75 * k, dy = m.y + 36 * k;
        NK.tekst(ctx, "pH", m.x + 24 * k, dy + 1, { font: "700 " + Math.round(13 * k) + "px " + T.FONT, farve: "#8fe0b0", linje: "middle" });
        NK.tekst(ctx, this.visPh(), dx + 12 * k, dy + 2, { font: "700 " + Math.round(26 * k) + "px Consolas, 'Courier New', monospace", farve: "#b8f5cf", justering: "center", linje: "middle" });
        if (this.trin === "maal" && this.maaling === null && !this.groen) {
            T.skilt(ctx, m.x + m.w / 2, m.y - 2, "Klik: mål pH", { min: t.x + 6, maks: t.x + t.b - 6 });
        }
        /* Skiltet under kolben: navn og koncentration */
        var fs = NK.klamp(14 * k, 13, 15), sy = kk.y + kk.h + 8, sx = m.x, sb = Math.max(kk.x + kk.w, m.x + m.w) - m.x;
        ctx.save();
        ctx.fillStyle = this.fundet ? "#e6f6ec" : "#fffdf5";
        NK.rundtRekt(ctx, sx, sy, sb, fs * 3.1, 8);
        ctx.fill();
        ctx.strokeStyle = this.fundet ? T.GROEN : "#cdbf96";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
        var navn = this.fundet ? D.Navn(u.rigtig) + (u.kilde ? " (" + u.kilde + ")" : "") : "Ukendt syre " + u.id;
        ctx.save(); ctx.font = "800 " + fs + "px " + T.FONT;
        var nf = fs; while (nf > 11 && ctx.measureText(navn).width > sb - 16) { nf -= 0.5; ctx.font = "800 " + nf + "px " + T.FONT; }
        ctx.restore();
        NK.tekst(ctx, navn, sx + 10, sy + fs * 0.95, { font: "800 " + nf + "px " + T.FONT, farve: T.BLAEK, linje: "middle" });
        F.tekst(ctx, "c_s = " + D.konc(u.c) + (this.ph !== null ? "   pH = " + D.tal2(this.ph) : ""), sx + 10, sy + fs * 2.15, fs, T.DAEMPET, "left", { vaegt: 700 });
    };

    /* Farverne fra skemaet: S og B er blaa, H₃O⁺ er lilla (de to syre-basepar) */
    var P1 = D.FARVE.par1, P2 = D.FARVE.par2;
    var KS_BROEK = { b: [[{ t: "[B]", farve: P1 }, " · ", { t: "[H_3O^+]", farve: P2 }], [{ t: "[S]", farve: P1 }]] };
    var ALFA_BROEK = { b: [[{ t: "[B]", farve: P1 }], "c_s"] };

    /* Udtrykket under et stof i skemaet: v er venstre side, h er linjerne
       fra lighedstegnet. Den korte udgave springer mellemregningen over. */
    P.soejle = function (id, kort) {
        var u = this.u, r = this.r;
        switch (id) {
            case "oxonium": return { v: "[H_3O^+]", h: (kort ? [] : ["= 10^{-pH} M"]).concat(["= 10^{" + D.tal2(-u.ph) + "} M", "= " + D.potensC(r.h) + " M"]) };
            case "basen": return { v: "[B]", h: ["= [H_3O^+]", "= " + D.potensC(r.h) + " M"] };
            case "syren": return { v: "[S]", h: ["= c_s − [B]"].concat(kort ? [] : ["= " + D.konc(u.c) + " − " + D.lille(r.h) + " M"]).concat(["= " + D.decimal(r.s) + " M"]) };
        }
        return { v: "", h: [] };
    };
    P.skemaTilstand = function (id) {
        if (this.loest[id]) return "loest";
        return this.trin === id ? "aktiv" : null;
    };

    /* Skemaets maal: skriften er 13 til 16 px; er der ikke plads, kommer
       den korte udgave af udtrykkene. Rammerne under skal kunne vaere der
       med mindst 13 px, ogsaa naar hylden er fremme. */
    P.skemaLayout = function (ctx, t) {
        var mig = this, x = this.hx, w = this.hb, y = t.y + 10, gap = 16;
        var hoejder = this.u.fuld ? 3.0 + 2.1 + 3.0 : 3.0 + 2.1;
        var budget = this.hyldeY - 8 - y - (hoejder * 13 + 6 * (this.rammer.length - 1) + 8);
        var L = x + 12, R = x + w - 12, valg = null, sidste = null;
        function blok(id, lf, kort) {
            var s = mig.soejle(id, kort), vw = F.bredde(ctx, s.v + " ", lf, 700), hw = 0;
            s.h.forEach(function (l) { hw = Math.max(hw, F.bredde(ctx, l, lf, 800)); });
            return { vw: vw, vv: F.bredde(ctx, s.v, lf, 700), w: vw + hw, n: s.h.length };
        }
        [false, true].some(function (kort) {
            for (var lf = 16; lf >= 13; lf -= 0.5) {
                var b = {};
                SKEMA.forEach(function (id) { b[id] = blok(id, lf, kort); });
                if (b.syren.w + b.basen.w + b.oxonium.w + 2 * gap > R - L) continue;
                var n = Math.max(b.syren.n, b.basen.n, b.oxonium.n);
                /* Taettere: mindre linjeafstand, og reaktionen ned til 16 px */
                for (var tt = 0; tt <= 3; tt++) {
                    var lh = lf * (1.42 - 0.06 * tt), rf = Math.max(16, NK.klamp(lf * 1.4, 17, 23) - 0.7 * tt);
                    var y0 = y + 8 + 1.75 * rf, ySep = y0 + 0.85 * rf, yL = ySep + 0.95 * lf;
                    var h = yL + (n - 1) * lh + 0.8 * lf + 6 - y;
                    sidste = { lf: lf, rf: rf, lh: lh, kort: kort, b: b, y0: y0, ySep: ySep, yL: yL, h: h };
                    if (h <= budget) { valg = sidste; return true; }
                }
            }
            return false;
        });
        var sk = valg || sidste;
        if (!sk) return null;
        sk.x = x; sk.y = y; sk.w = w;
        /* Udtrykkene staar side om side, og den ledige plads fordeles. Hvert
           stof staar lige over sin koncentration ([S] under S); H₂O midt
           mellem S og B */
        var b = sk.b, ekstra = Math.max(0, R - L - (b.syren.w + b.basen.w + b.oxonium.w + 2 * gap));
        var bxS = L + ekstra * 0.12, bxB = bxS + b.syren.w + gap + ekstra * 0.38, bxH = bxB + b.basen.w + gap + ekstra * 0.38;
        sk.bx = { syren: bxS, basen: bxB, oxonium: bxH };
        sk.c = { syren: bxS + b.syren.vv / 2, basen: bxB + b.basen.vv / 2, oxonium: bxH + b.oxonium.vv / 2 };
        sk.c.vand = (sk.c.syren + sk.c.basen) / 2;
        return sk;
    };

    P.tegnSkema = function (ctx) {
        var sk = this.skema, mig = this;
        if (!sk) return;
        var rf = sk.rf, lf = sk.lf, y0 = sk.y0;
        ctx.save();
        NK.rundtRekt(ctx, sk.x, sk.y, sk.w, sk.h, 9);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "#b9c4c8";
        ctx.lineWidth = 1.3;
        ctx.stroke();
        ctx.restore();
        /* Reaktionen: S + H₂O ⇌ B + H₃O⁺ med tilstandsformer */
        var stoffer = [
            { f: "S", tf: "(aq)", c: sk.c.syren, farve: P1 }, { f: "H_2O", tf: "(l)", c: sk.c.vand, farve: P2 },
            { f: "B", tf: "(aq)", c: sk.c.basen, farve: P1 }, { f: "H_3O^+", tf: "(aq)", c: sk.c.oxonium, farve: P2 }
        ];
        var kas = [];
        stoffer.forEach(function (d) {
            d.fw = F.bredde(ctx, d.f, rf, 700);
            d.tw = F.bredde(ctx, d.tf, rf * 0.6, 600);
            kas.push(F.tekst(ctx, d.f, d.c - d.fw / 2, y0, rf, d.farve, "left", { vaegt: 700 }));
            F.tekst(ctx, d.tf, d.c + d.fw / 2 + 2, y0 + rf * 0.08, rf * 0.6, T.DAEMPET, "left", { vaegt: 600 });
        });
        ["+", "⇌", "+"].forEach(function (op, i) {
            var a = stoffer[i], n = stoffer[i + 1];
            var ox = (a.c + a.fw / 2 + 2 + a.tw + n.c - n.fw / 2) / 2;
            F.tekst(ctx, op, ox, y0, rf, T.DAEMPET, "center", { vaegt: 600 });
        });
        /* H⁺-buen fra syren til vand (som i fane 2) */
        var x1 = kas[0].x + kas[0].w / 2, x2 = kas[1].x + kas[1].w / 2 - 4, ya = y0 - rf * 0.62, mx = (x1 + x2) / 2;
        ctx.save();
        ctx.strokeStyle = "#6b7685";
        ctx.fillStyle = "#6b7685";
        ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(x1, ya); ctx.quadraticCurveTo(mx, ya - rf * 1.35, x2, ya); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x2, ya); ctx.lineTo(x2 - 8, ya - 7); ctx.lineTo(x2 + 1, ya - 9); ctx.closePath(); ctx.fill();
        ctx.restore();
        F.tekst(ctx, "H^+", mx, ya - rf * 0.88, rf * 0.66, D.FARVE.hydron, "center", { vaegt: 800 });
        /* Stregen under reaktionen */
        ctx.save();
        ctx.strokeStyle = "#d5dde0";
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(sk.x + 12, sk.ySep); ctx.lineTo(sk.x + sk.w - 12, sk.ySep); ctx.stroke();
        ctx.restore();
        /* Udtrykkene under stofferne: det regnede, eller ? i en gul ring */
        SKEMA.forEach(function (id) {
            var tilst = mig.skemaTilstand(id);
            if (!tilst) return;
            var s = mig.soejle(id, sk.kort), bl = sk.b[id], farve = id === "oxonium" ? P2 : P1;
            var bx = sk.bx[id];
            if (tilst === "aktiv") {
                F.tekst(ctx, s.v, bx, sk.yL, lf, farve, "left", { vaegt: 700 });
                var eb = F.tekst(ctx, "=", bx + bl.vw, sk.yL, lf, farve, "left", { vaegt: 700 });
                var q = F.tekst(ctx, "?", eb.x + eb.w + lf * 0.45, sk.yL, lf, T.BLAEK, "left", { vaegt: 700 });
                if (!mig.groen) T.gulRamme(ctx, q.x - 7, q.y - 2, q.w + 14, q.h + 4, 7);
                return;
            }
            var alfa = mig.nyT[id] === undefined ? 1 : NK.klamp(mig.nyT[id] / NY_TID, 0, 1);
            F.tekst(ctx, s.v, bx, sk.yL, lf, farve, "left", { vaegt: 700, alfa: alfa });
            s.h.forEach(function (l, i) {
                var sidst = i === s.h.length - 1;
                F.tekst(ctx, l, bx + bl.vw, sk.yL + i * sk.lh, lf, farve, "left", { vaegt: sidst ? 800 : 700, alfa: alfa });
            });
        });
    };

    /* Linjen i hver ramme: det, der er regnet (loest), eller begyndelsen med ? */
    P.linje = function (id, loest) {
        var u = this.u, r = this.r, q = "?";
        switch (id) {
            case "oxonium": return loest ? ["[H_3O^+] = 10^{-pH} M = 10^{" + D.tal2(-u.ph) + "} M = " + D.potensC(r.h) + " M"] : ["[H_3O^+] =", q];
            case "basen": return loest ? ["[B] = [H_3O^+] = " + D.potensC(r.h) + " M"] : ["[B] =", q];
            case "syren": return loest ? ["[S] = c_s − [B] = " + D.konc(u.c) + " − " + D.lille(r.h) + " M = " + D.decimal(r.s) + " M"] : ["[S] =", q];
            case "konstanten": return loest ? ["K_s =", KS_BROEK, "=",
                { b: [[{ t: D.potensC(r.h) + " M", farve: P1 }, " · ", { t: D.potensC(r.h) + " M", farve: P2 }], [{ t: D.decimal(r.s) + " M", farve: P1 }]] },
                "= " + D.potensC(r.k) + " M"] : ["K_s =", q];
            case "pks": return loest ? ["pK_s = −log(K_s) = −log(" + D.potensC(r.k) + ") = " + D.tal2(r.pks)] : ["pK_s =", q];
            case "alfa": return loest ? ["α =", ALFA_BROEK, "=", { b: [[{ t: D.lille(r.h) + " M", farve: P1 }], D.konc(u.c)] }, "= " + D.tal1(r.alfa) + " %"] : ["α =", q];
        }
        return [""];
    };

    P.tegnRammer = function (ctx, t) {
        var mig = this, fs = this.fs, x = this.hx, b = this.hb;
        var aktivId = this.trin;
        var kol = 0;
        this.rammer.forEach(function (id) { if (id !== "alfa") kol = Math.max(kol, F.bredde(ctx, TITEL[id], 13, 800)); });
        kol = Math.max(kol, F.bredde(ctx, "Omdannelses-", 12, 800)) + 40;
        var top = this.skema ? this.skema.y + this.skema.h + 8 : t.y + 10;
        var ledigt = (this.trin === "flaske" || this.fundet ? this.hyldeY - 8 : t.y + t.h - 8) - top;
        /* De kommende rammer er lave (kun titlen); de andre har plads til
           linjen, og en broek er hoejere */
        var hoejder = this.rammer.map(function (id) {
            var vist = mig.loest[id] || id === aktivId;
            if (!vist) return 1.6;
            return id === "konstanten" || id === "alfa" ? 3.0 : 2.1;
        });
        var sum = hoejder.reduce(function (a, h) { return a + h; }, 0);
        var luft = 6, f = Math.min(fs, (ledigt - luft * (this.rammer.length - 1)) / sum);
        var y = top;
        this.rammer.forEach(function (id, i) {
            var h = hoejder[i] * f, loest = !!mig.loest[id], aktiv = id === aktivId && !mig.groen;
            var vist = loest || aktiv || (id === aktivId && mig.groen);
            ctx.save();
            NK.rundtRekt(ctx, x, y, b, h, 9);
            ctx.fillStyle = aktiv ? "rgba(242, 197, 61, 0.12)" : (loest ? "#ffffff" : "rgba(255, 255, 255, 0.4)");
            ctx.fill();
            ctx.strokeStyle = aktiv ? "#d69e0c" : (loest ? "#b9c4c8" : "#c3cacd");
            ctx.lineWidth = aktiv ? 2.5 : 1.3;
            if (!vist) ctx.setLineDash([5, 4]);
            ctx.stroke();
            ctx.restore();
            /* nummer og titel */
            var cy = y + h / 2;
            ctx.save();
            ctx.beginPath(); ctx.arc(x + 16, cy, 10, 0, Math.PI * 2);
            ctx.fillStyle = loest ? T.GROEN : (aktiv ? "#d69e0c" : "#aeb7bb");
            ctx.fill();
            ctx.restore();
            NK.tekst(ctx, loest ? "✓" : String(mig.trinListe.indexOf(id) + 1), x + 16, cy + 1, { font: "800 12px " + T.FONT, farve: "#ffffff", justering: "center", linje: "middle" });
            var tf = loest || aktiv ? T.BLAEK : "#8a9499";
            /* Omdannelsesgraden er for lang til kolonnen og staar paa to linjer */
            if (id === "alfa" && vist) {
                F.tekst(ctx, "Omdannelses-", x + 32, cy - 8, 12, tf, "left", { vaegt: 800 });
                F.tekst(ctx, "grad", x + 32, cy + 8, 12, tf, "left", { vaegt: 800 });
            } else F.tekst(ctx, TITEL[id], x + 32, cy, id === "alfa" ? 12 : 13, tf, "left", { vaegt: 800 });
            if (!vist) { y += h + luft; return; }
            /* Skriften er mindst 13 px; er linjen for bred, vises den korte
               udgave uden tallene i broeken */
            var dele = mig.linje(id, loest), lfs = NK.klamp(f * 0.98, 13, 17), bred = b - kol - 14;
            while (lfs > 13 && F.linjeBredde(ctx, dele, lfs, 700) > bred) lfs -= 0.5;
            if (F.linjeBredde(ctx, dele, lfs, 700) > bred && loest && (id === "konstanten" || id === "alfa")) {
                dele = id === "konstanten" ? ["K_s =", KS_BROEK, "= " + D.potensC(mig.r.k) + " M"] :
                    ["α =", ALFA_BROEK, "= " + D.tal1(mig.r.alfa) + " %"];
            }
            if (F.linjeBredde(ctx, dele, lfs, 700) > bred && loest && id === "syren") {
                dele = ["[S] = c_s − [B] = " + D.decimal(mig.r.s) + " M"];
            }
            if (F.linjeBredde(ctx, dele, lfs, 700) > bred && loest && id === "oxonium") {
                dele = ["[H_3O^+] = 10^{" + D.tal2(-mig.u.ph) + "} M = " + D.potensC(mig.r.h) + " M"];
            }
            var r = F.linje(ctx, dele, x + kol, cy, lfs, T.BLAEK, "left", { vaegt: 700 });
            if (!loest) {
                var k = r.kasser[r.kasser.length - 1];
                T.gulRamme(ctx, k.x - 7, k.y - 2, k.w + 14, k.h + 4, 7);
            }
            y += h + luft;
        });
    };

    P.tegnHylde = function (ctx, t) {
        var mig = this, x = this.hx, b = this.hb, y = this.hyldeY, h = this.hyldeH, n = D.HYLDE.length;
        var cel = b / n, fb = Math.min(cel * 0.55, (h - 38) / 1.625, 46);
        var by = y + h - 38;
        ctx.save();
        var g = ctx.createLinearGradient(0, by, 0, by + 9);
        g.addColorStop(0, "#c9b28c");
        g.addColorStop(1, "#8f7650");
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, x, by, b, 9, 3);
        ctx.fill();
        ctx.restore();
        this.hyldeKasser = [];
        D.HYLDE.forEach(function (id, i) {
            var s = D.SYRER[id], cx = x + cel * (i + 0.5), fx = cx - fb / 2, fy = by - fb * 1.625;
            var ramme = null;
            if (mig.fundet && id === mig.u.rigtig) ramme = "rigtig";
            else if (!mig.fundet && mig.valgt === i) ramme = "valg";
            var alfa = mig.forkerte[i] || (mig.fundet && id !== mig.u.rigtig) ? 0.4 : 1;
            T.flaske(ctx, fx, fy, fb, [{ t: s.syre, fs: 12 }], { ramme: ramme, alfa: alfa });
            var navnFs = 12.5;
            ctx.save(); ctx.font = "700 " + navnFs + "px " + T.FONT;
            while (navnFs > 11 && ctx.measureText(s.navn).width > cel - 6) { navnFs -= 0.5; ctx.font = "700 " + navnFs + "px " + T.FONT; }
            ctx.restore();
            ctx.save(); ctx.globalAlpha = alfa;
            NK.tekst(ctx, s.navn, cx, by + 19, { font: "700 " + navnFs + "px " + T.FONT, farve: T.BLAEK, justering: "center", linje: "middle" });
            F.tekst(ctx, "pK_s = " + D.tal2(s.pks), cx, by + 33, 12.5, "#1f4f8f", "center", { vaegt: 700 });
            ctx.restore();
            mig.hyldeKasser.push({ x: cx - cel / 2 + 2, y: fy - 6, w: cel - 4, h: by + 42 - fy + 6 });
        });
    };

    NK.SimUkendt = SimUkendt;
}());
