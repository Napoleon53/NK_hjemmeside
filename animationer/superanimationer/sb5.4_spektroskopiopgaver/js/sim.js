/* =====================================================================
   sim.js - motoren bag alle tre faner (som sb5.3, én motor og data)

   Hver fane har en liste af opgaver (D.FANER), og hver opgave har sine
   trin (D.OPG[id].trin). Eleven kopierer tabellen i panelet til et
   regneark, finder standardkurven og svarer paa kortet med et tal og en
   enhed (eller et svar paa kortet), og Indsend svar bedoemmer.

   Tavlen (som sb6.1 fane 3, brugerens oenske 30. okt. 2026 om at bygge
   beregningen op): til venstre proeven fra genstand til kuvette i
   spektrofotometeret, til hoejre standardkurven i bogens stil og under den
   en ramme pr. trin. De kommende rammer staar stiplede, det aktive trin
   har en gul ramme, og det loeste viser hele regnestykket. Kurven viser
   kun det, der er fundet: punkterne fra start, regnearkets linje og
   ligning efter ε, proeven efter c. Et forkert svar ses paa kurven: en
   roed linje for ε og et roedt punkt for c.

   Proevens kuvette glider ned i spektrofotometeret, naar kortet spoerger
   om koncentrationen, og displayet taeller op til absorbansen (svar
   foerst, naar de er aktuelle).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var F = NK.Formel;
    var T = NK.Tegning;
    var NY_TID = 0.5;          /* regnestykket toner frem */
    var IND_TID = 0.8;         /* kuvetten glider ned */
    var TAEL_TID = 0.9;        /* displayet taeller op */

    function Base(navn) {
        var mig = this;
        this.fane = D.FANER[navn];
        this.liste = this.fane.opgaver;
        this.noegle = "nk-sb5.4-" + navn;
        this.punktum = false;
        this.hentStatus();
        this.startFane();
        NK.el(navn + "-forfra").addEventListener("click", function () { mig.forfra(); });
        NK.el(navn + "-opgaver").addEventListener("click", function (e) {
            var li = e.target.closest && e.target.closest("li[data-nr]");
            if (li) mig.startOpgave(parseInt(li.getAttribute("data-nr"), 10));
        });
        NK.el(navn + "-kopier").addEventListener("click", function () { mig.kopier(); });
        NK.el(navn + "-punktum").addEventListener("click", function () {
            mig.punktum = !mig.punktum;
            mig.visTabel();
        });
        this.el.skort.addEventListener("input", function (e) {
            if (!e.target) return;
            if (e.target.id === navn + "-f1") { mig.f1 = e.target.value; mig.forsoeg = null; }
            e.target.classList.remove("ryst");
            mig.visIndsend();
        });
        this.el.skort.addEventListener("change", function (e) {
            if (e.target && e.target.id === navn + "-enhed") {
                mig.enhed = e.target.value;
                mig.forsoeg = null;
                e.target.classList.remove("ryst");
                mig.visIndsend();
            }
        });
        this.el.skort.addEventListener("keydown", function (e) {
            if (e.target && e.target.id === navn + "-f1" && e.key === "Enter") { e.preventDefault(); mig.indsendKlik(); }
        });
    }

    var B = Base.prototype;

    /* ----- Hukommelsen: loeste opgaver (1 = loest, 2 = uden fejl og uden svaret) */
    B.hentStatus = function () {
        var g = NK.hent(this.noegle, {}) || {};
        this.status = g.s || {};
    };
    B.gem = function () { NK.gem(this.noegle, { s: this.status }); };

    /* ----- Panelet ---------------------------------------------------------------- */
    B.visListe = function () {
        var mig = this, html = "", loeste = 0;
        this.liste.forEach(function (id, j) {
            var s = mig.status[id];
            if (s) loeste++;
            var kl = j === mig.nr ? "nu" : (s ? "faerdig" : "");
            html += '<li class="' + kl + '" data-nr="' + j + '" title="' + NK.html(D.OPG[id].navn) + '"><span class="tr-nr">' + (j + 1) + "</span><span>" +
                NK.html(D.OPG[id].navn) + (s ? (s === 2 ? " ★" : " ✓") : "") + "</span></li>";
        });
        NK.saetHTML(this.navn + "-opgaver", html);
        NK.saetHTML(this.navn + "-maerke", "løst <b>" + loeste + "</b>/" + this.liste.length);
    };

    function talTekst(s, punktum) { return punktum ? String(s).replace(/,/g, ".") : String(s); }

    B.visTabel = function () {
        var o = this.o, mig = this, n = o.lineaer || o.c.length;
        var et = D.TABEL_ENHED[o.enhed].t;
        var hoved = D.sub(NK.html("c(" + D.u(o.stof) + ") / " + et));
        var html = '<table class="std-tabel"><thead><tr><th>' + hoved + "</th><th>A (" + o.lambda + " nm)</th></tr></thead><tbody>";
        o.c.forEach(function (c, i) {
            var uden = mig.loest && mig.loest.omraade && i >= n;
            html += "<tr" + (uden ? ' class="uden" title="Uden for det lineære område"' : "") + "><td>" + talTekst(o.cTekst[i], mig.punktum) + "</td><td>" +
                talTekst(D.abs(o.A[i]), mig.punktum) + "</td></tr>";
        });
        html += "</tbody></table>";
        NK.saetHTML(this.navn + "-tabel", html);
        NK.saetTekst(this.navn + "-note", o.note);
        NK.saetTekst(this.navn + "-tabelnavn", o.navn);
        var k = NK.el(this.navn + "-punktum");
        k.classList.toggle("til", this.punktum);
        k.setAttribute("aria-pressed", this.punktum ? "true" : "false");
    };

    /* Tabellen som tekst med tabulator, saa regnearket faar to kolonner */
    B.tabelTekst = function () {
        var o = this.o, mig = this, et = D.TABEL_ENHED[o.enhed].t;
        var linjer = ["c(" + D.u(o.stof) + ") / " + et + "\tA (" + o.lambda + " nm)"];
        o.c.forEach(function (c, i) { linjer.push(talTekst(o.cTekst[i], mig.punktum) + "\t" + talTekst(D.abs(o.A[i]), mig.punktum)); });
        return linjer.join("\n");
    };

    B.kopier = function () {
        var mig = this, tekst = this.tabelTekst();
        function svar(ok) {
            NK.saetTekst(mig.navn + "-kopisvar", ok ? "Kopieret. Klik i regnearket, og tryk Ctrl+V." : "Markér tabellen, og kopiér den med Ctrl+C.");
            var e = NK.el(mig.navn + "-kopisvar");
            e.classList.remove("vis"); void e.offsetWidth; e.classList.add("vis");
            clearTimeout(mig.kopiT);
            mig.kopiT = setTimeout(function () { e.classList.remove("vis"); }, 4000);
        }
        function gammel() {
            var ta = document.createElement("textarea");
            ta.value = tekst;
            ta.style.position = "fixed"; ta.style.left = "-9999px";
            document.body.appendChild(ta);
            ta.select();
            var ok = false;
            try { ok = document.execCommand("copy"); } catch (x) { ok = false; }
            document.body.removeChild(ta);
            svar(ok);
        }
        this.kopieret = tekst;
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(tekst).then(function () { svar(true); }, gammel);
                return;
            }
        } catch (x) { /* den gamle vej */ }
        gammel();
    };

    /* ----- Forloebet ------------------------------------------------------------------- */
    B.vaelg = function (nr) { this.startOpgave(nr || 0); };

    B.startOpgave = function (nr) {
        this.nr = nr;
        this.o = D.OPG[this.liste[nr]];
        this.r = D.kaede(this.o);
        this.loest = {};
        this.fejl = false;
        this.sv = false;
        this.faerdig = false;
        this.forsoeg = null;
        this.nyT = {};
        this.inde = false;
        this.indT = null;
        this.taelT = null;
        this.sejrT = null;
        this.visTabel();
        this.startTrin(0);
    };

    B.startTrin = function (j) {
        this.trinNr = j;
        this.trinId = this.o.trin[j];
        this.td = D.TRIN[this.trinId];
        this.groen = null;
        this.valgt = null;
        this.forkerte = {};
        this.f1 = "";
        this.enhed = "";
        this.forsoeg = null;
        /* Proeven kommer i spektrofotometeret, naar den skal bruges; ved den
           for hoeje absorbans kommer en ny proeve */
        if (this.trinId === "konc" && !this.inde && this.indT === null) this.indT = 0;
        if (this.trinId === "hoej") { this.inde = false; this.indT = 0; this.taelT = null; }
        this.besked("", "");
        this.nulstilHjaelp();
        this.visKort();
        this.visListe();
        this.layout();
        var f = NK.el(this.navn + "-f1");
        if (f) try { f.focus({ preventScroll: true }); } catch (x) { /* intet fokus */ }
    };

    /* ----- Kortet ------------------------------------------------------------------------ */
    B.feltLabel = function () {
        return NK.html(this.td.felt(this.o)).replace(/c_før/, "c<sub>før</sub>");
    };

    B.kortData = function () {
        var td = this.td, o = this.o, mig = this;
        var k = { slags: "spm", chip: o.navn + " · trin " + (this.trinNr + 1) + " af " + o.trin.length, tekst: td.tekst(o, this.r) };
        if (td.slags === "tal") {
            k.ekstra = '<div class="sk-felt"><label for="' + this.navn + '-f1">' + this.feltLabel() + "</label>" +
                '<input id="' + this.navn + '-f1" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" placeholder="tallet">' +
                '<select id="' + this.navn + '-enhed" aria-label="Enheden"></select></div>';
        } else {
            k.svar = td.svar.map(function (t, j) { return { t: t, valgt: mig.valgt === j, forkert: !!mig.forkerte[j] }; });
        }
        return k;
    };

    /* Efter kortet er tegnet: feltets tal og vaelgerens enheder saettes som
       tekst (D.sub maa ikke lave <sup> inde i en <option> eller en value) */
    B.efterKort = function () {
        var td = this.td, navn = this.navn;
        var f = NK.el(navn + "-f1"), s = NK.el(navn + "-enhed");
        if (f && f.value !== this.f1) f.value = this.f1;
        if (s) {
            var liste = D.ENHED[td.enheder];
            s.innerHTML = "";
            var o0 = document.createElement("option");
            o0.value = ""; o0.textContent = "enhed"; o0.disabled = true;
            s.appendChild(o0);
            liste.forEach(function (e) {
                var op = document.createElement("option");
                op.value = e.k; op.textContent = e.t;
                s.appendChild(op);
            });
            s.value = this.enhed || "";
            if (!this.enhed) s.selectedIndex = 0;
            s.classList.toggle("tom", !this.enhed);
        }
        /* Et rigtigt tal bliver staaende paa kortet i groent */
        if (this.groen && td.slags === "tal") {
            var e = D.enhedVed(D.ENHED[td.enheder], this.enhed);
            var p = this.el.ind.querySelector(".sk-tekst");
            if (p && e) {
                var d = document.createElement("div");
                d.className = "sk-felt svaret" + (this.groen.maade === "svar" ? " vist" : "");
                d.innerHTML = '<span class="sk-label">' + this.feltLabel() + '</span><span class="sk-svarvaerdi">' + D.sub(NK.html(D.pynt(this.f1) + " " + e.t)) + "</span>";
                p.parentNode.insertBefore(d, p.nextSibling);
            }
        }
    };

    B.svarValg = function (j) {
        if (this.groen || this.td.slags !== "valg") return;
        this.valgt = j;
        this.visKort();
    };

    B.kanSendes = function () {
        if (this.td.slags === "valg") return this.valgt !== null;
        return !!(String(this.f1 || "").trim() && this.enhed);
    };
    B.indsendTekst = function () {
        if (this.td.slags === "tal" && this.kanSendes()) {
            var e = D.enhedVed(D.ENHED[this.td.enheder], this.enhed);
            var t = "Indsend svar: " + String(this.f1).trim() + " " + (e ? e.t : "");
            if (t.length <= 34) return t;
        }
        return "Indsend svar";
    };
    B.ingentingTekst = function () {
        if (this.td.slags === "valg") return "Vælg et svar på kortet først.";
        if (!String(this.f1 || "").trim()) return "Skriv et tal i feltet først.";
        return "Vælg enheden ved siden af tallet.";
    };

    B.tomt = function () {
        this.kortBlink();
        this.kortBesked("Skriv et tal i feltet, for eksempel 2,45 · 10³ eller 0,180.", 3.5);
    };

    B.indsend = function () {
        var td = this.td, o = this.o, r = this.r;
        if (td.slags === "valg") {
            if (this.valgt === td.rigtig) { this.rigtigt(false); return; }
            this.fejl = true;
            this.forkerte[this.valgt] = true;
            var vb = this.valgt;
            this.valgt = null;
            this.visKort();
            this.fejlLinje(td.fejl[vb]);
            return;
        }
        var tal = D.tolk(this.f1);
        if (isNaN(tal)) { this.tomt(); return; }
        var liste = D.ENHED[td.enheder], e = D.enhedVed(liste, this.enhed);
        if (!e) { this.kortBlink(); this.kortBesked(this.ingentingTekst(), 3); return; }
        var v = tal * e.f, sand = td.sand(o, r), tol = this.trinId === "eps" ? D.TOL_EPS : D.TOL;
        var tallet = D.naer(v, sand, tol) || (td.ogsaa && D.naer(v, td.ogsaa(o, r), tol));
        if (tallet && (this.trinId !== "eps" || e.cm)) { this.rigtigt(false); return; }
        this.fejl = true;
        /* Paa kurven: elevens linje eller punkt, naar tallet er forkert */
        this.forsoeg = !tallet && (this.trinId === "eps" || this.trinId === "konc") ? { id: this.trinId, v: v } : null;
        this.fejlLinje(D.fejlTal(this.trinId, o, r, tal, e, liste) || D.fejlAndet(this.trinId, o));
    };

    B.rigtigt = function (vist) {
        var td = this.td, o = this.o, r = this.r;
        var sidste = this.trinNr === o.trin.length - 1;
        if (vist) this.sv = true;
        this.loest[this.trinId] = true;
        this.nyT[this.trinId] = 0;
        this.forsoeg = null;
        var tekst = td.forkl(o, r), knap = "Næste trin →";
        if (sidste) {
            this.faerdig = true;
            this.status[o.id] = (!this.fejl && !this.sv) || this.status[o.id] === 2 ? 2 : 1;
            this.gem();
            var naesteFane = D.FANE_RAEKKE[D.FANE_RAEKKE.indexOf(this.navn) + 1];
            if (this.nr < this.liste.length - 1) knap = "Næste opgave →";
            else if (naesteFane) knap = "Næste fane →";
            else { knap = null; tekst += " " + D.FANE_SLUT[this.navn]; }
        }
        this.groen = { spm: true, maade: vist ? "svar" : "selv", tekst: tekst, knap: knap };
        if (td.slags === "valg") this.groen.svarNr = td.rigtig;
        this.sejrT = 0;
        this.besked("", "");
        this.visKort();
        this.visListe();
        if (this.trinId === "omraade") this.visTabel();
        if (sidste) NK.konfetti(this.el.skort, 40);
    };

    B.videre = function () {
        if (this.faerdig) {
            if (this.nr < this.liste.length - 1) { this.startOpgave(this.nr + 1); return; }
            var naeste = D.FANE_RAEKKE[D.FANE_RAEKKE.indexOf(this.navn) + 1];
            if (naeste && NK.visFane) NK.visFane("fane-" + naeste);
            return;
        }
        this.startTrin(this.trinNr + 1);
    };

    B.forfra = function () {
        this.status = {};
        this.gem();
        this.startOpgave(0);
    };
    B.nulstil = function () { if (!this.groen) this.startOpgave(this.nr); };

    B.hintNu = function () {
        if (this.groen) return [];
        return this.td.hint(this.o, this.r);
    };

    B.visSvar = function () {
        var td = this.td;
        this.sv = true;
        if (td.slags === "valg") this.valgt = td.rigtig;
        else {
            var s = td.svar(this.o, this.r);
            this.f1 = s.tal;
            this.enhed = s.enhed;
        }
        this.rigtigt(true);
    };

    B.opdaterScene = function (dt) {
        if (this.indT !== null) {
            this.indT += dt;
            if (this.indT >= IND_TID) { this.indT = null; this.inde = true; this.taelT = 0; }
        }
        if (this.taelT !== null) {
            this.taelT += dt;
            if (this.taelT >= TAEL_TID) this.taelT = null;
        }
        for (var id in this.nyT) if (this.nyT[id] < NY_TID) this.nyT[id] += dt;
    };

    /* Absorbansen paa displayet: proeven, eller den nye proeve ved trinnet hoej */
    B.maaltA = function () { return this.trinId === "hoej" ? this.o.hoejA : this.o.proeveA; };
    B.visA = function () {
        if (!this.inde) return null;
        var A = this.maaltA();
        if (this.taelT !== null) return D.abs(A * NK.blod(this.taelT / TAEL_TID));
        return D.abs(A);
    };
    B.aKlar = function () { return this.inde && this.taelT === null; };

    /* ----- Musen: tavlen goer intet af sig selv, kortet blinker --------------------- */
    B.klikScene = function (pt) {
        if (this.groen) { this.kortBlink(); return; }
        this.kortBlink();
        if (this.td.slags === "valg") this.kortBesked("Vælg et svar på kortet, og tryk Indsend svar.", 3);
        else this.kortBesked("Skriv svaret i feltet på kortet, og vælg enheden.", 3);
    };

    /* ----- Layout --------------------------------------------------------------------- */
    var HOEJDE = { eps: 2.9, konc: 2.9, fortynd: 2.9, literMasse: 3.5, masse: 3.5, omraade: 2.0, hoej: 2.0 };

    B.layout = function () {
        if (!this.o) { this.lay = null; return; }
        this.lay = this.tavleLayout();
        var t = this.lay.tavle, o = this.o;
        var vb = Math.round(NK.klamp(t.b * 0.30, 200, 310));
        this.fig = { x: t.x + 14, y: t.y + 12, w: vb - 24, h: t.h - 22 };
        var hx = t.x + vb + 6, hb = t.x + t.b - 14 - hx;
        var enheder = 0;
        o.trin.forEach(function (id) { enheder += HOEJDE[id]; });
        var luft = 6, n = o.trin.length;
        this.rf = NK.klamp((t.h * 0.40 - luft * (n - 1)) / enheder, 12, 16.5);
        var rh = enheder * this.rf + luft * (n - 1);
        this.rammeK = { x: hx, y: t.y + t.h - 10 - rh, w: hb, h: rh, luft: luft };
        this.grafK = { x: hx, y: t.y + 10, w: hb, h: this.rammeK.y - 14 - (t.y + 10) };
        this.saetAnker("figur", this.fig.x - 4, this.fig.y - 4, this.fig.w + 8, this.fig.h + 8);
        this.saetAnker("graf", this.grafK.x - 4, this.grafK.y - 4, this.grafK.w + 8, this.grafK.h + 8);
        this.saetAnker("rammer", this.rammeK.x - 4, this.rammeK.y - 4, this.rammeK.w + 8, this.rammeK.h + 8);
    };

    /* ----- Tegning ------------------------------------------------------------------------ */
    B.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var t = lay.tavle;
        if (t.b < 200) return;
        T.tavle(ctx, lay);
        this.tegnFigur(ctx);
        this.tegnGraf(ctx);
        this.tegnRammer(ctx);
        this.tegnSejr(ctx, t);
    };

    /* Venstre: genstanden, maalekolben og spektrofotometeret */
    var GENSTAND_H = { tablet: 0.42, pille: 0.36, terning: 0.55, skrue: 0.32, blodproeve: 0.92 };

    B.tegnFigur = function (ctx) {
        var f = this.fig, o = this.o, fig = o.figur;
        var fokus = this.groen ? null : this.trinId;
        /* Spektrofotometeret nederst; hele gruppen staar midt i hoejden */
        var sw = f.w, sh = sw * T.SPEKTRO_H;
        if (f.h - sh < 175) { sw = Math.max(170, (f.h - 175) / T.SPEKTRO_H); sh = sw * T.SPEKTRO_H; }
        var topH = Math.min(fig.kolbe ? 205 : 175, f.h - sh - 40);
        var y0 = f.y + Math.max(0, (f.h - (topH + 40 + sh)) * 0.45);
        var sx = f.x + (f.w - sw) / 2, sy = y0 + topH + 40;
        var ind = this.inde ? 1 : (this.indT !== null ? this.indT / IND_TID : null);
        var A = this.maaltA();
        var sp = T.spektro(ctx, sx, sy, sw, {
            lambda: o.lambda, A: this.visA(), ind: ind, farve: fig.farve, T: Math.pow(10, -A),
            fokus: (fokus === "konc" || fokus === "hoej") && this.aKlar() ? "display" : null
        });
        this.spektroK = sp;
        var kuvX = sp.kuvette.x + sp.kuvette.w / 2;
        /* Det oeverste stykke: genstanden og kolben */
        var top = y0 + 4, bund = sy - 40;
        var lfs = NK.klamp(f.w / 17, 12, 14);
        var navnY = bund - lfs * 0.2;
        var tingBund = navnY - lfs * 1.2;
        var hoejde = tingBund - top;
        if (fig.kolbe) {
            var kh = Math.min(hoejde, 165), kw = kh * 100 / 172;
            if (kw > f.w * 0.38) { kw = f.w * 0.38; kh = kw * 172 / 100; }
            var kx = f.x + f.w - kw - 4, ky = tingBund - kh;
            var kb = T.kolbe(ctx, kx, ky, kw, fig.kolbe.farve);
            /* genstanden til venstre */
            var s = T.SPRITES[fig.genstand], gh = kh * GENSTAND_H[fig.genstand], gw = gh * s.b / s.h;
            var plads = kx - f.x - 46;
            if (gw > plads) { gw = plads; gh = gw * s.h / s.b; }
            var gcx = f.x + (kx - 40 - f.x) / 2 + 2;
            var gk = T.genstand(ctx, fig.genstand, gcx, tingBund, gw);
            F.tekst(ctx, fig.gNavn, gcx, navnY, lfs, T.BLAEK, "center", { vaegt: 700 });
            /* pilen fra genstanden til kolben */
            var py = ky + kh * 0.72, px0 = gk.x + gk.w + 6, px1 = kx + kw * 0.1;
            if (px1 - px0 < 22) px0 = px1 - 22;
            T.pil(ctx, px0, py, px1, py);
            if (fig.kolbe.pil) F.tekst(ctx, fig.kolbe.pil, (px0 + px1) / 2, py - lfs * 0.95, lfs - 0.5, T.BLAEK, "center", { vaegt: 700 });
            else if (fig.kolbe.tekst) F.tekst(ctx, fig.kolbe.tekst, (px0 + px1) / 2, py - lfs * 0.95, lfs - 1, T.DAEMPET, "center", { vaegt: 600 });
            F.tekst(ctx, fig.kolbe.V || "målekolbe", kx + kw / 2, navnY, lfs, fig.kolbe.V ? T.BLAEK : T.DAEMPET, "center", { vaegt: fig.kolbe.V ? 700 : 600 });
            this.kolbeK = { x: kx, y: ky, w: kw, h: kh };
            /* Det, kortet spoerger om: fortyndingen eller rumfanget i kolben */
            if (fokus === "fortynd") T.gulKant(ctx, gk.x - 8, Math.min(ky, py - lfs * 1.8), kx + kw - gk.x + 16, navnY + lfs * 0.8 - Math.min(ky, py - lfs * 1.8), 12);
            if (fokus === "masse") T.gulKant(ctx, kx - 8, ky - 6, kw + 16, navnY + lfs * 0.8 - ky + 6, 12);
            /* og pilen ned til kuvetten */
            T.pil(ctx, kx + kw / 2, navnY + lfs * 0.9, kuvX, sy - 6, { bue: { x: 0, y: 0 } });
        } else {
            /* proeveglasset (permanganat) */
            var fh = Math.min(hoejde, 140), fw = fh * 70 / 112;
            var fx = kuvX - fw / 2 - f.w * 0.14;
            T.flaske(ctx, fx, tingBund - fh, fw, fig.farve);
            F.tekst(ctx, fig.gNavn, fx + fw / 2, navnY, lfs, T.BLAEK, "center", { vaegt: 700 });
            T.pil(ctx, fx + fw / 2, navnY + lfs * 0.9, kuvX, sy - 6, { bue: { x: 0, y: 0 } });
            this.kolbeK = null;
        }
    };

    /* Til hoejre: standardkurven */
    B.tegnGraf = function (ctx) {
        var o = this.o, r = this.r, mig = this, n = o.lineaer || o.c.length;
        var g = T.grafLay(ctx, this.grafK, o, { ymaks: o.hoejA || 0 });
        this.g = g;
        var td = this.td, fokus = this.groen ? null : this.trinId;
        var omr = null;
        if (this.loest.omraade) omr = { fra: 0, til: o.c[n - 1], titel: "det lineære område", under: "punkterne ligger på linjen" };
        else if (this.trinId === "omraade" && this.valgt !== null) {
            var v = td.omr[this.valgt], pad = g.xt * 0.3;
            omr = { fra: v[0] === 0 ? 0 : o.c[v[0]] - pad, til: o.c[v[1]] + pad, valg: true };
        }
        T.graf(ctx, g, o, {
            efterFlade: function () {
                if (!omr) return;
                if (omr.valg) T.omraade(ctx, g, omr.fra, omr.til, { fyld: "rgba(47, 111, 222, 0.12)", farve: T.VALG });
                else T.omraade(ctx, g, omr.fra, omr.til, { titel: omr.titel, under: omr.under });
            }
        });
        if (this.loest.omraade && o.c.length > n) {
            var xm = (g.X(o.c[n - 1]) + g.x1) / 2;
            F.tekst(ctx, "for høj koncentration", xm, g.y0 + 15, 13, T.ORANGE, "center", { vaegt: 800, kant: "rgba(255,255,255,0.85)", kantBredde: 3 });
            F.tekst(ctx, "punkterne ligger under linjen", xm, g.y0 + 31, 12, T.DAEMPET, "center", { vaegt: 500, kant: "rgba(255,255,255,0.85)", kantBredde: 3 });
        }
        /* Regnearkets linje, naar ε er fundet */
        var alfa = this.nyT.eps === undefined ? 1 : NK.klamp(this.nyT.eps / NY_TID, 0, 1);
        if (this.loest.eps) {
            if (o.lineaer) {
                T.linje(ctx, g, r.a, r.b, 0, o.c[n - 1] * 1.04, { alfa: alfa });
                T.linje(ctx, g, r.a, r.b, o.c[n - 1] * 1.04, g.xmaks, { stiplet: true, alfa: alfa });
            } else T.linje(ctx, g, r.a, r.b, 0, Math.min(g.xmaks, o.c[o.c.length - 1] * 1.08), { alfa: alfa });
        }
        /* Elevens forkerte ε: en roed linje gennem (0, 0) */
        if (this.forsoeg && this.forsoeg.id === "eps") {
            var aE = this.forsoeg.v * r.f * D.L;
            T.linje(ctx, g, aE, 0, 0, g.xmaks, { elev: true });
            var cx = Math.min(g.xmaks * 0.92, (g.ymaks * 0.92) / aE), ex = g.X(cx), ey = g.Y(aE * cx);
            if (isFinite(ey)) T.haloTekst(ctx, "din ε", NK.klamp(ex - 4, g.x0 + 30, g.x1 - 10), NK.klamp(ey - 12, g.y0 + 12, g.y1 - 12), 13.5, T.FORKERT, "right");
        }
        /* Proeven */
        var aT = "prøven: A = " + D.abs(o.proeveA);
        if (this.loest.konc) {
            T.proeve(ctx, g, r.c, o.proeveA, { aTekst: aT, cTekst: "c = " + D.tal3(r.c) + " " + D.TABEL_ENHED[o.enhed].t });
        } else if (this.trinId === "konc" && this.aKlar()) {
            T.proeve(ctx, g, null, o.proeveA, { kunA: true, aTekst: aT });
        }
        if (this.forsoeg && this.forsoeg.id === "konc") {
            var cE = this.forsoeg.v / r.f, pyE = g.Y(o.proeveA);
            if (cE > 0 && cE <= g.xmaks) {
                T.ring(ctx, g.X(cE), pyE, g.s);
                T.haloTekst(ctx, "din c", g.X(cE) + 11, pyE + 16, 13.5, T.FORKERT, "left");
            } else {
                var hx = cE > g.xmaks ? g.x1 - 8 : g.x0 + 8;
                T.pil(ctx, cE > g.xmaks ? g.x1 - 60 : g.x0 + 60, pyE + 18, hx, pyE + 18, { farve: T.FORKERT });
                T.haloTekst(ctx, cE > g.xmaks ? "din c er uden for grafen" : "din c er tæt på 0", cE > g.xmaks ? g.x1 - 64 : g.x0 + 64, pyE + 18, 13, T.FORKERT, cE > g.xmaks ? "right" : "left");
            }
        }
        /* Den nye proeve med for hoej absorbans */
        if (this.trinId === "hoej" && this.aKlar()) {
            T.proeve(ctx, g, null, o.hoejA, { kunA: true, aTekst: "ny prøve: A = " + D.abs(o.hoejA) });
        }
        /* Punkterne oeverst */
        o.c.forEach(function (c, i) {
            var slags = mig.loest.omraade && i >= n ? "b" : "a";
            T.punkt(ctx, g.X(c), g.Y(o.A[i]), g.s, slags);
        });
        /* Regnearkets ligning */
        if (this.loest.eps) {
            var et = D.TABEL_ENHED[o.enhed].t;
            var lig = "A = " + D.aTekst(r.a) + " " + et + "^{-1} · c " + (r.b < 0 ? "− " : "+ ") + D.bTekst(Math.abs(r.b));
            ctx.save(); ctx.globalAlpha = alfa;
            this.ligningK = T.ligning(ctx, g, lig, { ny: this.trinId === "eps" && !!this.groen });
            ctx.restore();
        }
        /* Det, kortet spoerger om: hele kurven ved det lineære område */
        if (fokus === "omraade") T.gulKant(ctx, g.x0 - 6, g.y0 - 6, g.x1 - g.x0 + 12, g.y1 - g.y0 + 12, 10);
    };

    /* ----- Rammerne under kurven ---------------------------------------------------------- */
    function eU(o) { return D.TABEL_ENHED[o.enhed].t; }
    function bParen(b) { return b < 0 ? "(" + D.bTekst(b) + ")" : D.bTekst(b); }

    /* Linjerne i en loest ramme (lang og kort udgave) */
    B.linjer = function (id, kort) {
        var o = this.o, r = this.r, u = eU(o), stof = "c(" + o.stof + ")";
        switch (id) {
            case "eps":
                return kort ? [["ε =", { b: ["a", "l"] }, "= " + D.epsC(r.epsM) + " M^{-1} · cm^{-1}"]] :
                    [["ε =", { b: ["a", "l"] }, "=", { b: [D.aTekst(r.a) + " " + u + "^{-1}", "1,00 cm"] }, "= " + D.aTekst(r.eps) + " " + u + "^{-1} · cm^{-1} = " + D.epsC(r.epsM) + " M^{-1} · cm^{-1}"]];
            case "konc":
                return kort ? [[stof + " =", { b: ["A − b", "a"] }, "= " + D.tal3(r.c) + " " + u]] :
                    [[stof + " =", { b: ["A − b", "a"] }, "=", { b: [D.abs(o.proeveA) + " − " + bParen(r.b), D.aTekst(r.a) + " " + u + "^{-1}"] }, "= " + D.tal3(r.c) + " " + u]];
            case "fortynd":
                return kort ? [["c_{før} =", { b: ["c_{efter} · V_{efter}", "V_{før}"] }, "= " + D.tal3(r.cFoer) + " " + u]] :
                    [["c_{før} =", { b: ["c_{efter} · V_{efter}", "V_{før}"] }, "=", { b: [D.tal3(r.c) + " " + u + " · " + o.vEfterTekst, o.vFoerTekst] }, "= " + D.tal3(r.cFoer) + " " + u]];
            case "literMasse":
                return [["n = c · V = " + D.potensC(r.cM) + " M · 1,00 L = " + D.potensC(r.n) + " mol"],
                    ["m = n · M = " + D.potensC(r.n) + " mol · " + NK.komma(Math.round(o.M * 100)) + " g/mol = " + NK.betydende(r.mg / 1000, 3) + " g = " + D.tal3(r.mg) + " mg"]];
            case "masse":
                return [["n = c · V = " + NK.betydende(r.cM, 3) + " M · 0,2500 L = " + D.potensC(r.n) + " mol"],
                    ["m = n · M = " + D.potensC(r.n) + " mol · " + NK.komma(Math.round(o.M * 100)) + " g/mol = " + NK.betydende(r.mg / 1000, 3) + " g = " + D.tal3(r.mg) + " mg"]];
            case "omraade":
                return [["25,0 µM til 250 µM, hvor A / c ≈ 0,0042 µM^{-1}"]];
            case "hoej":
                return [["A = 1,520 er over 1,056: fortynd prøven, og mål igen"]];
        }
        return [[""]];
    };

    /* Begyndelsen med ? i det aktive trin */
    B.spoergsmaal = function (id) {
        var o = this.o;
        switch (id) {
            case "eps": return ["ε =", "?"];
            case "konc": return ["c(" + o.stof + ") =", "?"];
            case "fortynd": return ["c_{før} =", "?"];
            case "literMasse": return ["m i 1,00 L =", "?"];
            case "masse": return ["m(Cu) =", "?"];
            case "omraade": return ["?"];
            case "hoej": return ["?"];
        }
        return ["?"];
    };

    B.tegnRammer = function (ctx) {
        var mig = this, k = this.rammeK, o = this.o, f = this.rf;
        var titelFs = NK.klamp(f * 0.82, 12, 13.5);
        var kol = 0;
        o.trin.forEach(function (id) {
            D.TRIN[id].titel.forEach(function (l) { kol = Math.max(kol, F.bredde(ctx, l, titelFs, 800)); });
        });
        kol += 40;
        var y = k.y;
        o.trin.forEach(function (id, i) {
            var h = HOEJDE[id] * f, loest = !!mig.loest[id], aktiv = id === mig.trinId && !mig.groen;
            var vist = loest || id === mig.trinId;
            ctx.save();
            NK.rundtRekt(ctx, k.x, y, k.w, h, 9);
            ctx.fillStyle = aktiv ? "rgba(242, 197, 61, 0.12)" : (loest ? "#ffffff" : "rgba(255, 255, 255, 0.45)");
            ctx.fill();
            ctx.strokeStyle = aktiv ? "#d69e0c" : (loest ? "#b9c4c8" : "#c3cacd");
            ctx.lineWidth = aktiv ? 2.5 : 1.3;
            if (!vist) ctx.setLineDash([5, 4]);
            ctx.stroke();
            ctx.restore();
            /* nummer og titel */
            var cy = y + h / 2;
            ctx.save();
            ctx.beginPath(); ctx.arc(k.x + 17, cy, 10.5, 0, Math.PI * 2);
            ctx.fillStyle = loest ? T.GROEN : (aktiv ? "#d69e0c" : "#aeb7bb");
            ctx.fill();
            ctx.restore();
            NK.tekst(ctx, loest ? "✓" : String(i + 1), k.x + 17, cy + 1, { font: "800 12px " + T.FONT, farve: "#ffffff", justering: "center", linje: "middle" });
            var tf = loest || aktiv ? T.BLAEK : "#8a9499";
            var tt = D.TRIN[id].titel;
            tt.forEach(function (l, j) {
                F.tekst(ctx, l, k.x + 34, cy + (j - (tt.length - 1) / 2) * titelFs * 1.2, titelFs, tf, "left", { vaegt: 800 });
            });
            if (!vist) { y += h + k.luft; return; }
            var bred = k.w - kol - 14, x0 = k.x + kol;
            if (!loest) {
                var dele = mig.spoergsmaal(id), lfs0 = NK.klamp(f * 1.02, 13, 17);
                var rr = F.linje(ctx, dele, x0, cy, lfs0, T.BLAEK, "left", { vaegt: 700 });
                var q = rr.kasser[rr.kasser.length - 1];
                if (aktiv) T.gulRamme(ctx, q.x - 7, q.y - 2, q.w + 14, q.h + 4, 7);
                y += h + k.luft;
                return;
            }
            /* Det loeste regnestykke; er det for bredt, kommer den korte udgave */
            var alfa = mig.nyT[id] === undefined ? 1 : NK.klamp(mig.nyT[id] / NY_TID, 0, 1);
            var linjer = mig.linjer(id, false), lfs = NK.klamp(f * 0.98, 12.5, 16.5);
            function maks(ls, fs) { return ls.reduce(function (m, l) { return Math.max(m, F.linjeBredde(ctx, l, fs, 700)); }, 0); }
            while (lfs > 12.5 && maks(linjer, lfs) > bred) lfs -= 0.5;
            if (maks(linjer, lfs) > bred) {
                var kort = mig.linjer(id, true);
                if (maks(kort, lfs) < maks(linjer, lfs)) linjer = kort;
                lfs = NK.klamp(f * 0.98, 12.5, 16.5);
                while (lfs > 11.5 && maks(linjer, lfs) > bred) lfs -= 0.5;
            }
            var lh = lfs * 1.55;
            linjer.forEach(function (l, j) {
                F.linje(ctx, l, x0, cy + (j - (linjer.length - 1) / 2) * lh, lfs, T.BLAEK, "left", { vaegt: 700, alfa: alfa });
            });
            y += h + k.luft;
        });
    };

    /* ----- En klasse pr. fane (fane.js kender fanens forstavelse) ------------------- */
    function lav(navn) {
        function S() { Base.call(this, navn); }
        S.prototype = Object.create(B);
        S.prototype.constructor = S;
        NK.Fane.paa(S.prototype, navn);
        var visKort = S.prototype.visKort;
        S.prototype.visKort = function () { visKort.call(this); this.efterKort(); };
        /* Rystet ogsaa feltet og vaelgeren */
        S.prototype.ryst = function () {
            var e = this.el.status;
            e.classList.remove("ryster"); void e.offsetWidth; e.classList.add("ryster");
            [navn + "-f1", navn + "-enhed"].forEach(function (id) {
                var x = NK.el(id);
                if (x) { x.classList.remove("ryst"); void x.offsetWidth; x.classList.add("ryst"); }
            });
        };
        return S;
    }

    NK.SimK = lav("k");
    NK.SimI = lav("i");
    NK.SimL = lav("l");
}());
