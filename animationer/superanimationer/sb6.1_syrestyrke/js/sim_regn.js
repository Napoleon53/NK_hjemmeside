/* =====================================================================
   sim_regn.js - fane 2: Regn paa syren

   Den gamle b3.1 "Fra Ks til pKs" paa tavlen med papirkortet. Fire trin
   for hver af bogens elleve syrer (D.REGN_TRIN):
     1 base    hvad dannes, naar syren afgiver en hydron til vand? Svarene
               er de typiske fejl fra den gamle (ladning, optag, OH⁻ ...).
               Bagefter farves skemaet efter syre-baseparrene, og H⁺-buen
               viser hydronen
     2 ks      eleven traekker stofferne fra bakken op i Kₛ-broeken (eller
               klikker paa et stof og en plads); vand er faelden
     3 regn    retningen skifter fra syre til syre: fra Kₛ til pKₛ eller fra
               pKₛ til Kₛ. Foerste gang hver vej vaelger eleven foerst
               formlen; saa skrives tallet, og tavlen viser beregningen
     4 styrke  stærk, middelstærk, svag eller meget svag; skalaen kommer
               med foerste hint og med svaret
   Den foerste syre er ethansyre (bogens eksempel), saa kommer de andre i
   tilfaeldig raekkefoelge. Syrerne i panelet kan ogsaa klikkes.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var F = NK.Formel;
    var T = NK.Tegning;
    var NOEGLE = "nk-sb6.1-regn";
    var STOFFER = ["syre", "vand", "base", "ox"];

    function SimRegn() {
        var mig = this;
        this.hentStatus();
        this.startFane();
        NK.el("r-forfra").addEventListener("click", function () { mig.forfra(); });
        NK.el("r-syrer").addEventListener("click", function (e) {
            var li = e.target.closest && e.target.closest("[data-syre]");
            if (li) mig.nySyre(li.getAttribute("data-syre"));
        });
        this.el.skort.addEventListener("input", function (e) {
            if (!e.target) return;
            if (e.target.id === "r-f1") mig.f1 = e.target.value;
            if (e.target.id === "r-f2") mig.f2 = e.target.value;
            e.target.classList.remove("ryst");
            mig.visIndsend();
        });
        this.el.skort.addEventListener("keydown", function (e) {
            if (e.target && /^r-f[12]$/.test(e.target.id) && e.key === "Enter") { e.preventDefault(); mig.indsendKlik(); }
        });
    }

    var P = SimRegn.prototype;
    NK.Fane.paa(P, "r");

    /* ----- Hukommelsen: de regnede syrer ------------------------------------------- */
    P.hentStatus = function () {
        var g = NK.hent(NOEGLE, {}) || {};
        this.regnet = g.r || {};          /* id -> 1 (regnet) eller 2 (uden fejl) */
        this.kendt = g.k || {};           /* formlerne, eleven har valgt: pks, ks */
        this.antalStartet = g.n || 0;
    };
    P.gem = function () { NK.gem(NOEGLE, { r: this.regnet, k: this.kendt, n: this.antalStartet }); };

    /* ----- Panelet ------------------------------------------------------------------ */
    P.visListe = function () {
        var mig = this, html = "";
        D.REGN_TRIN.forEach(function (t, j) {
            var kl = j < mig.trinNr || (j === mig.trinNr && mig.groen && mig.trinFaerdig) ? "faerdig" : (j === mig.trinNr ? "nu" : "");
            html += '<li class="' + kl + '"><span class="tr-nr">' + (j + 1) + "</span><span>" + D.sub(NK.html(t.navn)) + "</span></li>";
        });
        NK.saetHTML("r-trin", html);
        var sh = "", n = 0;
        D.TABEL.forEach(function (id) {
            var r = mig.regnet[id];
            if (r) n++;
            sh += '<li class="' + (id === mig.id ? "nu" : (r ? "faerdig" : "")) + '" data-syre="' + id + '" title="Regn på ' + D.SYRER[id].navn + '">' +
                '<span class="tr-nr">' + (r === 2 ? "★" : (r ? "✓" : "")) + "</span><span>" + NK.html(D.Navn(id)) + "</span></li>";
        });
        NK.saetHTML("r-syrer", sh);
        NK.saetTekst("r-maerke", n + " af " + D.TABEL.length);
    };

    /* ----- Forloebet ------------------------------------------------------------------ */
    P.vaelg = function () {
        var id = this.antalStartet === 0 && !this.regnet[D.REGN_FOERST] ? D.REGN_FOERST : this.naesteId();
        this.nySyre(id);
    };

    P.naesteId = function () {
        var mig = this;
        var u = D.TABEL.filter(function (id) { return !mig.regnet[id] && id !== mig.id; });
        if (!u.length) u = D.TABEL.filter(function (id) { return id !== mig.id; });
        return NK.tilfaeldig(u);
    };

    P.nySyre = function (id) {
        this.id = id;
        this.syre = D.SYRER[id];
        this.retning = this.antalStartet % 2 === 0 ? "pks" : "ks";
        this.antalStartet++;
        this.gem();
        this.fejl = false;
        this.sv = false;
        this.basenVist = false;
        this.ksVist = false;
        this.ksVaerdiVist = this.retning === "pks";
        this.formelVist = false;
        this.tallet = false;
        this.skalaVis = false;
        this.styrkeVist = false;
        this.pladser = [null, null, null];
        this.aktiv = 0;
        this.fejlPladser = [];
        this.traek = null;
        this.sejrT = null;
        var bud = [[this.syre.base, null]].concat(this.syre.fejl);
        this.bud = NK.bland(bud);
        this.startTrin(0);
    };

    P.startTrin = function (j, del) {
        this.trinNr = j;
        this.del = del || (j === 2 ? (this.kendt[this.retning] ? "tal" : "formel") : null);
        if (j === 2 && this.del === "tal") this.formelVist = true;
        this.groen = null;
        this.trinFaerdig = false;
        this.valgt = null;
        this.forkerte = {};
        this.f1 = "";
        this.f2 = "";
        this.besked("", "");
        this.nulstilHjaelp();
        this.visKort();
        this.visListe();
        this.layout();
        if (j === 2 && this.del === "tal") this.fokus();
    };

    P.fokus = function () {
        var f = NK.el("r-f1");
        if (f) try { f.focus({ preventScroll: true }); } catch (x) { /* intet fokus */ }
    };

    P.trinData = function () {
        var R = D.REGN, j = this.trinNr;
        if (j === 0) return R.base;
        if (j === 1) return R.ks;
        if (j === 2) return this.del === "formel" ? (this.retning === "pks" ? R.formelPks : R.formelKs) : (this.retning === "pks" ? R.tilPks : R.tilKs);
        return R.styrke;
    };

    P.kortData = function () {
        var s = this.syre, j = this.trinNr, d = this.trinData(), mig = this;
        var chip = "Trin " + (j + 1) + " af 4";
        function svar(liste) { return liste.map(function (t, i) { return { t: t, valgt: mig.valgt === i, forkert: !!mig.forkerte[i] }; }); }
        if (j === 0) return { slags: "spm", chip: chip, tekst: d.tekst(s), svar: svar(this.bud.map(function (b) { return D.u(b[0]); })) };
        if (j === 1) return { slags: "opgave", chip: chip, tekst: d.tekst(s) };
        if (j === 2 && this.del === "formel") return { slags: "spm", chip: chip, tekst: d.tekst(s), svar: svar(d.svar) };
        if (j === 2) {
            var v1 = NK.html(this.f1 || ""), v2 = NK.html(this.f2 || "");
            var felt = this.retning === "pks" ?
                '<div class="sk-felt"><label for="r-f1">pKₛ =</label><input id="r-f1" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" value="' + v1 + '" placeholder="tallet med komma"></div>' :
                '<div class="sk-felt potens"><label for="r-f1">Kₛ =</label><input id="r-f1" class="foran" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" value="' + v1 + '" placeholder="tallet">' +
                '<span class="gange">· 10</span><input id="r-f2" class="eksp" type="text" inputmode="numeric" autocomplete="off" spellcheck="false" value="' + v2 + '" placeholder="eks." aria-label="eksponenten">' +
                '<span class="enhed">M</span></div>';
            return { slags: "spm", chip: chip, tekst: d.tekst(s), ekstra: felt };
        }
        return { slags: "spm", chip: chip, tekst: d.tekst(s), svar: svar(d.svar) };
    };

    P.svarValg = function (j) {
        if (this.groen) return;
        if (this.trinNr === 1 || (this.trinNr === 2 && this.del === "tal")) return;
        this.valgt = j;
        this.visKort();
    };

    P.kanSendes = function () {
        var j = this.trinNr;
        if (j === 1) return this.pladser.every(function (p) { return p; });
        if (j === 2 && this.del === "tal") return !!(String(this.f1 || "").trim() || String(this.f2 || "").trim());
        return this.valgt !== null;
    };
    P.indsendTekst = function () { return "Indsend svar"; };
    P.ingentingTekst = function () {
        if (this.trinNr === 1) return D.REGN.ks.intet;
        if (this.trinNr === 2 && this.del === "tal") return this.trinData().intet;
        return "Vælg et svar på kortet først.";
    };

    P.forkertValg = function (tekst) {
        this.fejl = true;
        this.forkerte[this.valgt] = true;
        this.valgt = null;
        this.visKort();
        this.fejlLinje(tekst);
    };

    P.indsend = function () {
        var s = this.syre, j = this.trinNr, d = this.trinData();
        if (j === 0) {
            var b = this.bud[this.valgt];
            if (!b[1]) { this.rigtigt(false); return; }
            this.forkertValg(D.FEJLTEKST[b[1]](b[0]));
            return;
        }
        if (j === 1) { this.tjekKs(); return; }
        if (j === 2 && this.del === "formel") {
            if (this.valgt === d.rigtig) { this.rigtigt(false); return; }
            this.forkertValg(d.fejl[this.valgt] || "Ikke rigtigt.");
            return;
        }
        if (j === 2) { this.tjekTal(); return; }
        var z = D.zone(s.pks);
        if (this.valgt === z) { this.rigtigt(false); return; }
        this.forkertValg(this.valgt < z ? d.svagere(s) : d.staerkere(s));
    };

    /* Kₛ-udtrykket: produkterne i taelleren, syren i naevneren, intet vand */
    P.tjekKs = function () {
        var p = this.pladser, R = D.REGN.ks;
        function produkt(x) { return x === "base" || x === "ox"; }
        var fejl = [];
        if (!produkt(p[0])) fejl.push(0);
        if (!produkt(p[1]) || p[0] === p[1]) fejl.push(1);
        if (p[2] !== "syre") fejl.push(2);
        if (!fejl.length) { this.rigtigt(false); return; }
        var tekst;
        if (p.indexOf("vand") >= 0) tekst = R.vand;
        else if (fejl.indexOf(2) >= 0 || !produkt(p[0]) || !produkt(p[1])) tekst = R.plads;
        else tekst = R.begge;
        this.fejl = true;
        this.fejlPladser = fejl;
        this.aktiv = fejl[0];
        this.fejlLinje(tekst);
    };

    P.ryst = function () {
        var e = this.el.status;
        e.classList.remove("ryster"); void e.offsetWidth; e.classList.add("ryster");
        ["r-f1", "r-f2"].forEach(function (id) {
            var f = NK.el(id);
            if (f) { f.classList.remove("ryst"); void f.offsetWidth; f.classList.add("ryst"); }
        });
    };

    /* Tallet i trin 3, med de typiske fejl fra den gamle b3.1 */
    P.tjekTal = function () {
        var s = this.syre, d = this.trinData(), p = s.pks, tekst;
        if (this.retning === "pks") {
            var u = D.tolk(this.f1), vist = -Math.log(D.rund3(D.ksFraPks(p))) / Math.LN10;
            if (isNaN(u)) { this.kortBlink(); this.kortBesked(d.intet, 3.5); return; }
            if (Math.abs(u - p) < 0.008 || Math.abs(u - vist) < 0.006) { this.rigtigt(false); return; }
            if (Math.abs(u + p) < 0.008 && Math.abs(p) > 0.05) tekst = d.fortegn;
            else if (Math.abs(Math.abs(u) - Math.abs(p) * Math.LN10) < 0.03) tekst = d.ln;
            else if (Math.abs(u + D.eksp(D.ksFraPks(p))) < 0.011) tekst = d.eksponent;
            else if (Math.abs(u - p) < 0.1) tekst = d.afrund;
            else tekst = d.andet;
        } else {
            var v = D.tolkPotens(this.f1, this.f2), K = D.ksFraPks(p);
            if (isNaN(v) || v === 0) { this.kortBlink(); this.kortBesked(d.intet, 3.5); return; }
            if (D.naer(v, K, 0.025)) { this.rigtigt(false); return; }
            var mv = D.mantisse(v, 3), mk = D.mantisse(K, 3);
            if (D.naer(v, Math.pow(10, p), 0.03)) tekst = d.fortegn;
            else if (D.naer(v, Math.exp(-p), 0.03)) tekst = d.e;
            else if (D.naer(v, Math.pow(10, Math.round(-p)), 0.001) || D.naer(v, Math.pow(10, Math.ceil(-p)), 0.001) || D.naer(v, Math.pow(10, Math.floor(-p)), 0.001)) tekst = d.eksponent;
            else if (D.naer(mv.m, mk.m, 0.025) && mv.e !== mk.e) tekst = d.tierpot;
            else tekst = d.andet;
        }
        this.fejl = true;
        this.fejlLinje(tekst);
    };

    P.rigtigt = function (vist) {
        var s = this.syre, j = this.trinNr, d = this.trinData(), tekst, svarNr;
        if (vist) this.sv = true;
        if (j === 0) {
            this.basenVist = true;
            tekst = d.forkl(s);
            svarNr = this.bud.map(function (b) { return b[1]; }).indexOf(null);
        } else if (j === 1) {
            this.pladser = ["base", "ox", "syre"];
            this.fejlPladser = [];
            this.ksVist = true;
            tekst = d.forkl;
        } else if (j === 2 && this.del === "formel") {
            this.kendt[this.retning] = true;
            this.gem();
            this.formelVist = true;
            tekst = d.forkl;
            svarNr = d.rigtig;
        } else if (j === 2) {
            this.tallet = true;
            this.ksVaerdiVist = true;
            tekst = d.forkl(s);
        } else {
            this.skalaVis = true;
            this.styrkeVist = true;
            tekst = d.forkl(s);
            svarNr = D.zone(s.pks);
        }
        this.trinFaerdig = !(j === 2 && this.del === "formel");
        var sidste = j === 3, knap = "Næste trin →";
        if (sidste) {
            this.regnet[this.id] = (!this.fejl && !this.sv) ? 2 : Math.max(1, this.regnet[this.id] === 2 ? 2 : 1);
            this.gem();
            var alle = D.TABEL.every(function (id) { return this.regnet[id]; }, this);
            knap = alle ? "Videre til Den ukendte syre →" : "Næste syre →";
            this.alleRegnet = alle;
        } else if (j === 2 && this.del === "formel") knap = "Videre til beregningen →";
        this.groen = { spm: true, maade: vist ? "svar" : "selv", tekst: tekst, knap: knap };
        if (svarNr !== undefined) this.groen.svarNr = svarNr;
        this.sejrT = 0;
        this.besked("", "");
        this.visKort();
        this.visListe();
    };

    P.videre = function () {
        var j = this.trinNr;
        if (j === 2 && this.del === "formel") { this.startTrin(2, "tal"); return; }
        if (j < 3) { this.startTrin(j + 1); return; }
        if (this.alleRegnet) { if (NK.visFane) NK.visFane("fane-u"); return; }
        this.nySyre(this.naesteId());
    };

    P.forfra = function () {
        this.regnet = {};
        this.kendt = {};
        this.antalStartet = 0;
        this.gem();
        this.id = null;
        this.vaelg();
    };
    P.nulstil = function () { if (!this.groen) this.nySyre(this.id); };

    P.hintNu = function () {
        if (this.groen) return [];
        var d = this.trinData();
        return typeof d.hint === "function" ? d.hint(this.syre) : (d.hint || []);
    };

    P.efterHint = function () {
        if (this.trinNr === 3) this.skalaVis = true;
        if (this.trinNr === 1 && this.hjaelp >= 1) { /* hintet staar paa kortet */ }
    };

    P.visSvar = function () {
        var j = this.trinNr, s = this.syre, d = this.trinData();
        this.sv = true;
        if (j === 0 || j === 3 || (j === 2 && this.del === "formel")) {
            this.valgt = j === 0 ? this.bud.map(function (b) { return b[1]; }).indexOf(null) : (j === 3 ? D.zone(s.pks) : d.rigtig);
        }
        if (j === 2 && this.del === "tal") {
            if (this.retning === "pks") this.f1 = D.tal2(s.pks);
            else { var m = D.mantisse(D.ksFraPks(s.pks), 3); this.f1 = m.t; this.f2 = String(m.e).replace("-", "−"); }
        }
        this.rigtigt(true);
    };

    /* ----- Bakken og broeken (trin 2) --------------------------------------------------- */
    P.stofFormel = function (x) {
        return x === "syre" ? this.syre.syre : (x === "base" ? this.syre.base : (x === "vand" ? "H_2O" : "H_3O^+"));
    };
    P.stofFarve = function (x) { return x === "syre" || x === "base" ? D.FARVE.par1 : D.FARVE.par2; };

    P.saetIPlads = function (x, i) {
        if (i === undefined) i = this.aktiv;
        if (i < 0 || i > 2) return;
        this.pladser[i] = x;
        this.fejlPladser = this.fejlPladser.filter(function (j) { return j !== i; });
        for (var n = 1; n <= 3; n++) {
            var k = (i + n) % 3;
            if (!this.pladser[k]) { this.aktiv = k; break; }
        }
        if (this.pladser.every(function (p) { return p; })) this.aktiv = -1;
        this.visIndsend();
    };

    P.ved = function (pt) {
        if (!pt || !this.geo) return null;
        var g = this.geo, i;
        if (this.trinNr === 1 && !this.groen) {
            for (i = 0; i < g.fliser.length; i++) {
                var f = g.fliser[i];
                if (pt.x > f.x && pt.x < f.x + f.w && pt.y > f.y && pt.y < f.y + f.h) return { slags: "flise", x: f.stof, k: f };
            }
            for (i = 0; i < g.slots.length; i++) {
                var s = g.slots[i];
                if (pt.x > s.x - 6 && pt.x < s.x + s.w + 6 && pt.y > s.y - 6 && pt.y < s.y + s.h + 6) return { slags: "plads", i: i, k: s };
            }
        }
        return null;
    };

    P.overScene = function (pt) {
        var v = this.ved(pt);
        if (!v) return null;
        return v.slags === "flise" ? (this.traek ? "grabbing" : "grab") : "pointer";
    };

    P.nedScene = function (pt) {
        if (this.groen) return false;
        var v = this.ved(pt);
        if (!v) return false;
        this.traek = { v: v, x0: pt.x, y0: pt.y, mus: pt, flyttet: false, over: null };
        return true;
    };

    P.flytScene = function (pt) {
        var g = this.traek;
        if (!g) return;
        g.mus = pt;
        if (Math.abs(pt.x - g.x0) + Math.abs(pt.y - g.y0) > 6) g.flyttet = true;
        g.over = null;
        if (g.v.slags === "flise" && g.flyttet) {
            var v = this.ved(pt);
            if (v && v.slags === "plads") g.over = v.i;
        }
    };

    P.opScene = function (pt) {
        var g = this.traek;
        this.traek = null;
        if (!g) return;
        if (pt) this.flytScene(pt);
        if (g.v.slags === "flise") {
            if (!g.flyttet) this.saetIPlads(g.v.x);
            else if (g.over !== null) this.saetIPlads(g.v.x, g.over);
            return;
        }
        if (g.v.slags === "plads" && !g.flyttet) {
            this.pladser[g.v.i] = null;
            this.fejlPladser = this.fejlPladser.filter(function (j) { return j !== g.v.i; });
            this.aktiv = g.v.i;
            this.visIndsend();
        }
    };

    P.klikScene = function () {
        this.kortBlink();
        if (this.groen) return;
        if (this.trinNr === 1) this.kortBesked("Træk et stof fra bakken op på en plads i brøken.", 3);
        else if (this.trinNr === 2 && this.del === "tal") this.kortBesked("Skriv svaret i feltet på kortet.", 3);
        else this.kortBesked("Vælg et svar på kortet, og tryk Indsend svar.", 3);
    };

    /* ----- Layout --------------------------------------------------------------------------- */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle;
        this.fs = Math.round(NK.klamp(Math.min(t.b / 34, (t.h - 90) / 12), 16, 26));
        var fs = this.fs;
        this.yNavn = t.y + 24;
        this.yReak = t.y + 24 + 2.6 * fs;
        this.yKs = this.yReak + 3.2 * fs;
        this.yBakke = this.yKs + 3.0 * fs;
        this.yRegn = this.yKs + 2.4 * fs;
        var sk = NK.klamp(fs / 22, 0.72, 1.05);
        this.s = T.skalaLay(t.x + 30, Math.min(this.yRegn + 1.5 * fs, t.y + t.h - 92 * sk), t.b - 60, sk, { ks: false, flag: 0 });
        this.saetAnker("reak", t.x + 20, this.yReak - 2.2 * fs, t.b - 40, 3.4 * fs);
        this.saetAnker("ks", t.x + 20, this.yKs - 1.4 * fs, t.b - 40, 3.6 * fs);
        this.saetAnker("regn", t.x + 20, this.yRegn - 0.9 * fs, t.b - 40, t.y + t.h - this.yRegn + 0.6 * fs);
    };

    /* ----- Tegning --------------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay || !this.syre) return;
        var t = lay.tavle, s = this.syre, fs = this.fs;
        if (t.b < 200) return;
        T.tavle(ctx, lay);
        this.geo = { slots: [], fliser: [] };

        /* Navnet og det kendte tal */
        var nb = NK.tekst(ctx, D.Navn(s.id), t.x + 20, this.yNavn, { font: "800 " + Math.round(fs * 0.85) + "px " + T.FONT, farve: T.BLAEK, linje: "middle" });
        void nb;
        ctx.save(); ctx.font = "800 " + Math.round(fs * 0.85) + "px " + T.FONT;
        var nx = t.x + 20 + ctx.measureText(D.Navn(s.id)).width + 16; ctx.restore();
        var kendt = this.retning === "pks" ? "K_s = " + D.potensC(D.ksFraPks(s.pks), 3) + " M" : "pK_s = " + D.tal2(s.pks);
        T.maerke(ctx, nx, this.yNavn, kendt + " (tabellen)", { fyld: "#eef4fb", kant: "#9db8d6", str: Math.max(13, Math.round(fs * 0.62)) });

        this.tegnReaktion(ctx, t);
        if (this.trinNr >= 1) this.tegnKs(ctx, t);
        if (this.trinNr >= 2) this.tegnRegn(ctx, t);
        if (this.trinNr === 3 && this.skalaVis) {
            T.skala(ctx, this.s, { pil: true, aktivZone: this.styrkeVist ? D.zone(s.pks) : undefined });
            if (this.styrkeVist) T.markoer(ctx, this.s, s.pks, { farve: T.GROEN, tekstP: "pK_s = " + D.tal2(s.pks), ks: false });
        }
        /* Det, der traekkes */
        var g = this.traek;
        if (g && g.v.slags === "flise" && g.flyttet && g.mus) this.flise(ctx, g.v.x, g.mus.x - g.v.k.w / 2, g.mus.y - g.v.k.h / 2, true);
        this.tegnSejr(ctx, t);
    };

    P.tegnReaktion = function (ctx, t) {
        var s = this.syre, fs = this.fs, y = this.yReak, farvet = this.basenVist, mig = this;
        var aq = "(aq)", l = "(l)";
        var dele = [
            { f: s.syre, tf: aq, rolle: "syre 1", par: 1 }, { op: "+" }, { f: "H_2O", tf: l, rolle: "base 2", par: 2, id: "vand" },
            { op: this.styrkeVist && D.zone(s.pks) === 0 ? "→" : "⇌" },
            { f: this.basenVist ? s.base : null, tf: aq, rolle: "base 1", par: 1, slot: true }, { op: "+" }, { f: "H_3O^+", tf: aq, rolle: "syre 2", par: 2 }
        ];
        var luft = fs * 0.5, slotB = Math.max(F.bredde(ctx, s.base, fs, 700), fs * 2.2) + fs * 0.6;
        dele.forEach(function (d) {
            if (d.op) { d.w = F.bredde(ctx, d.op, fs, 600) + luft; return; }
            d.fw = d.f ? F.bredde(ctx, d.f, fs, 700) : 0;
            d.tw = F.bredde(ctx, d.tf, fs * 0.62, 600);
            d.w = d.slot && !d.f ? slotB : d.fw + d.tw + 3;
        });
        var bred = dele.reduce(function (a, d) { return a + d.w + luft; }, -luft);
        var x = t.x + t.b / 2 - bred / 2, kas = {};
        dele.forEach(function (d) {
            var mx = x + d.w / 2;
            if (d.op) {
                F.tekst(ctx, d.op, mx, y, fs, T.DAEMPET, "center", { vaegt: 600 });
            } else if (d.slot && !d.f) {
                var k = { x: x, y: y - fs * 0.85, w: d.w, h: fs * 1.7 };
                if (!mig.groen && mig.trinNr === 0) T.gulRamme(ctx, k.x, k.y, k.w, k.h, 8);
                else {
                    ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = "#8a93a0"; ctx.lineWidth = 2;
                    NK.rundtRekt(ctx, k.x, k.y, k.w, k.h, 8); ctx.stroke(); ctx.restore();
                }
                F.tekst(ctx, "?", mx, y, fs, T.DAEMPET, "center", { vaegt: 700 });
            } else {
                var farve = farvet ? (d.par === 1 ? D.FARVE.par1 : D.FARVE.par2) : T.BLAEK;
                var b = F.tekst(ctx, d.f, x, y, fs, farve, "left", { vaegt: 700 });
                F.tekst(ctx, d.tf, x + d.fw + 3, y + fs * 0.08, fs * 0.62, T.DAEMPET, "left", { vaegt: 600 });
                kas[d.rolle] = b;
                if (farvet) NK.tekst(ctx, d.rolle, x + d.fw / 2, y + fs * 1.05, { font: "600 " + Math.max(12, Math.round(fs * 0.55)) + "px " + T.FONT, farve: farve, justering: "center", linje: "middle" });
            }
            x += d.w + luft;
        });
        /* H⁺-buen fra syren til vand */
        if (farvet && kas["syre 1"] && kas["base 2"]) {
            var a = kas["syre 1"], v = kas["base 2"];
            var x1 = a.x + a.w / 2, x2 = v.x + v.w / 2 - 4, y0 = y - fs * 0.62, mx2 = (x1 + x2) / 2;
            ctx.save();
            ctx.strokeStyle = "#6b7685";
            ctx.fillStyle = "#6b7685";
            ctx.lineWidth = 1.8;
            ctx.beginPath(); ctx.moveTo(x1, y0); ctx.quadraticCurveTo(mx2, y0 - fs * 1.35, x2, y0); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x2, y0); ctx.lineTo(x2 - 8, y0 - 7); ctx.lineTo(x2 + 1, y0 - 9); ctx.closePath(); ctx.fill();
            ctx.restore();
            F.tekst(ctx, "H^+", mx2, y0 - fs * 0.88, fs * 0.66, D.FARVE.hydron, "center", { vaegt: 800 });
        }
    };

    P.flise = function (ctx, x, px, py, loeftet) {
        var fs = this.fs * 0.82, f = this.stofFormel(x), w = F.bredde(ctx, f, fs, 700) + 26, h = fs * 1.75;
        ctx.save();
        if (loeftet) { ctx.shadowColor = "rgba(0, 0, 0, 0.3)"; ctx.shadowBlur = 12; ctx.shadowOffsetY = 6; }
        ctx.fillStyle = "#ffffff";
        NK.rundtRekt(ctx, px, py, w, h, 9);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = this.stofFarve(x);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        F.tekst(ctx, f, px + w / 2, py + h / 2, fs, this.stofFarve(x), "center", { vaegt: 700 });
        return { x: px, y: py, w: w, h: h, stof: x };
    };

    P.tegnKs = function (ctx, t) {
        var s = this.syre, fs = this.fs, y = this.yKs, mig = this, f2 = fs * 0.86;
        var slotB = Math.max(F.bredde(ctx, "[" + s.base + "]", f2, 700), F.bredde(ctx, "[" + s.syre + "]", f2, 700), F.bredde(ctx, "[H_3O^+]", f2, 700)) + 18;
        var slotH = f2 * 1.55, prik = F.bredde(ctx, "·", f2, 700) + 12;
        var taeller = slotB * 2 + prik, venstre = F.bredde(ctx, "K_s =", fs, 700) + 12;
        var vaerdi = this.ksVaerdiVist && this.ksVist ? "= " + D.potensC(D.ksFraPks(s.pks), 3) + " M" : "";
        var hoejre = vaerdi ? F.bredde(ctx, vaerdi, fs, 700) + 14 : 0;
        var x0 = t.x + t.b / 2 - (venstre + taeller + hoejre) / 2;
        F.tekst(ctx, "K_s =", x0, y, fs, T.BLAEK, "left", { vaegt: 700 });
        var bx = x0 + venstre;
        ctx.save(); ctx.strokeStyle = T.BLAEK; ctx.lineWidth = 2; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(bx, y); ctx.lineTo(bx + taeller, y); ctx.stroke(); ctx.restore();
        var slots = [
            { x: bx, y: y - slotH - 6, w: slotB, h: slotH },
            { x: bx + slotB + prik, y: y - slotH - 6, w: slotB, h: slotH },
            { x: bx + taeller / 2 - slotB / 2, y: y + 6, w: slotB, h: slotH }
        ];
        F.tekst(ctx, "·", bx + slotB + prik / 2, y - slotH / 2 - 6, f2, T.DAEMPET, "center", { vaegt: 700 });
        slots.forEach(function (k, i) {
            var x = mig.pladser[i], loest = mig.ksVist;
            var over = mig.traek && mig.traek.over === i;
            if (!loest) {
                ctx.save();
                NK.rundtRekt(ctx, k.x, k.y, k.w, k.h, 8);
                ctx.fillStyle = over ? "rgba(47, 111, 222, 0.12)" : (x ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.5)");
                ctx.fill();
                var fejl = mig.fejlPladser.indexOf(i) >= 0;
                ctx.strokeStyle = fejl ? T.FORKERT : (over || (i === mig.aktiv && !mig.groen) ? T.VALG : "#8a93a0");
                ctx.lineWidth = fejl || over || i === mig.aktiv ? 2.5 : 1.6;
                if (!x) ctx.setLineDash([5, 4]);
                ctx.stroke();
                ctx.restore();
            }
            if (x) F.tekst(ctx, "[" + mig.stofFormel(x) + "]", k.x + k.w / 2, k.y + k.h / 2, f2, mig.stofFarve(x), "center", { vaegt: 700 });
            else if (!loest) F.tekst(ctx, "?", k.x + k.w / 2, k.y + k.h / 2, f2, T.DAEMPET, "center", { vaegt: 700 });
        });
        if (vaerdi) F.tekst(ctx, vaerdi, bx + taeller + 14, y, fs, T.BLAEK, "left", { vaegt: 700 });
        this.geo.slots = slots;
        /* Bakken med de fire stoffer */
        if (this.trinNr === 1 && !this.groen) {
            var fl = [], sum = 0, luft = 14;
            STOFFER.forEach(function (x) { var w = F.bredde(ctx, mig.stofFormel(x), fs * 0.82, 700) + 26; fl.push(w); sum += w; });
            sum += luft * (STOFFER.length - 1);
            var fx = t.x + t.b / 2 - sum / 2, fy = this.yBakke + fs * 0.4;
            ctx.save();
            ctx.fillStyle = "rgba(120, 132, 150, 0.12)";
            NK.rundtRekt(ctx, fx - 14, fy - 8, sum + 28, fs * 1.75 + 16, 12);
            ctx.fill();
            ctx.restore();
            STOFFER.forEach(function (x, i) {
                var g = mig.traek && mig.traek.v.slags === "flise" && mig.traek.v.x === x && mig.traek.flyttet;
                ctx.save();
                if (g) ctx.globalAlpha = 0.3;
                var k = mig.flise(ctx, x, fx, fy, false);
                ctx.restore();
                mig.geo.fliser.push(k);
                fx += fl[i] + luft;
            });
            if (this.pladser.every(function (p) { return !p; }) && !this.fejl) {
                var f0 = this.geo.fliser[0];
                T.skilt(ctx, f0.x + f0.w / 2, f0.y - 2, "Træk et stof op i brøken", { min: t.x + 6, maks: t.x + t.b - 6 });
            }
        }
    };

    P.tegnRegn = function (ctx, t) {
        var s = this.syre, fs = this.fs * 0.92, y = this.yRegn, dele, svar;
        if (this.retning === "pks") {
            svar = this.tallet ? D.tal2(s.pks) : "?";
            dele = this.formelVist ? ["pK_s = −log(K_s) = −log(" + D.potensC(D.ksFraPks(s.pks), 3) + ") =", svar] : ["pK_s =", "?"];
        } else {
            svar = this.tallet ? D.potensC(D.ksFraPks(s.pks), 3) + " M" : "?";
            dele = this.formelVist ? ["K_s = 10^{-pK_s} M = 10^{" + D.tal2(-s.pks) + "} M =", svar] : ["K_s =", "?"];
        }
        while (fs > 13 && F.linjeBredde(ctx, dele, fs, 700) > t.b - 40) fs -= 0.5;
        var r = F.linje(ctx, dele, t.x + t.b / 2, y, fs, T.BLAEK, "center", { vaegt: 700 });
        if (!this.tallet && !(this.groen && this.trinNr === 2 && this.del === "tal")) {
            var k = r.kasser[r.kasser.length - 1];
            T.gulRamme(ctx, k.x - 8, k.y - 3, k.w + 16, k.h + 6, 8);
        }
    };

    NK.SimRegn = SimRegn;
}());
