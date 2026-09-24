/* =====================================================================
   sim_vaegt.js - fane 1: vaegten

   Eleven bygger ét molekyle paa vaegten ved at klikke paa grundstofferne
   i det periodiske system. Naar atomerne passer med formlen, samler de
   sig til molekylet. Saa skriver eleven atommassen for hvert grundstof
   (antallet staar foran) og til sidst molarmassen. Er den rigtig,
   kommer 1 mol af stoffet paa vaegten, og displayet viser M gram.

   Vaegten viser 0,00 g, saa laenge der kun ligger ét molekyle paa den.
   Knappen giver foerst et hint og saa svaret. Et forkert tal giver en
   besked, der passer til fejlen (js/tjek.js). Fremskridtet huskes
   under NOEGLE.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;
    var Tj = NK.Tjek;

    var NOEGLE = "nk-sc4.1-vaegt";
    var FLYV_TID = 0.45;
    var MAKS_ATOMER = 30;
    var TAEL_TID = 1.3;

    function SimVaegt() {
        this.L = new NK.Laerred(NK.el("vaegt-laerred"));
        this.tid = 0;
        var gemt = NK.hent(NOEGLE, {});
        this.status = D.VAEGT.map(function (o) {
            var s = gemt[o.st.f];
            return { loest: !!(s && s.l), stjerne: !!(s && s.s) };
        });
        this.rost = {};
        this.over = null;
        this.fremhaev = null;
        this.fokuseret = false;
        this.lay = null;
        this.atomer = [];
        this.ring = {};
        this.g = { kaffekop: { skjult: false, iHaand: false } };
        this.valgt = -1;
        this.opg = null;

        this.bygPanel();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.vaelg(this.naesteUloeste(-1));
    }

    var P = SimVaegt.prototype;

    /* ----- Hukommelse ------------------------------------------------------ */
    P.gem = function () {
        var ud = {}, mig = this;
        D.VAEGT.forEach(function (o, i) {
            var s = mig.status[i];
            if (s.loest) ud[o.st.f] = { l: 1, s: s.stjerne ? 1 : 0 };
        });
        NK.gem(NOEGLE, ud);
    };

    P.antalLoest = function (niveau) {
        var n = 0, mig = this;
        D.VAEGT.forEach(function (o, i) {
            if ((niveau === undefined || o.niveau === niveau) && mig.status[i].loest) n++;
        });
        return n;
    };

    P.antalStjerner = function (niveau) {
        var n = 0, mig = this;
        D.VAEGT.forEach(function (o, i) {
            if ((niveau === undefined || o.niveau === niveau) && mig.status[i].stjerne) n++;
        });
        return n;
    };

    P.iNiveau = function (niveau) {
        return D.VAEGT.filter(function (o) { return o.niveau === niveau; }).length;
    };

    P.naesteUloeste = function (fra) {
        var n = D.VAEGT.length;
        for (var d = 1; d <= n; d++) {
            var i = (fra + d + n) % n;
            if (!this.status[i].loest) return i;
        }
        return (fra + 1 + n) % n;
    };

    /* ----- Layout ------------------------------------------------------------------ */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var kant = NK.klamp(W * 0.014, 8, 16);
        lay.kant = kant;
        lay.bordY = Math.round(H * 0.9);
        lay.p = Tg.plakatLay(kant, kant, W - 2 * kant, H * 0.42);
        var zoneTop = lay.p.y + lay.p.h + NK.klamp(H * 0.02, 6, 16);
        lay.zoneTop = zoneTop;
        var vb = NK.klamp(Math.min(W * 0.34, (lay.bordY - zoneTop) * 1.1), 150, 340);
        lay.vaegtB = vb;
        lay.vaegt = { x: Math.round(W * 0.6), y: lay.bordY };
        var vh = Tg.vaegtHoejde(vb);
        var k = vb / NK.Sprites.MAAL.vaegt.b;
        lay.skaalY = lay.bordY - vh + NK.Sprites.MAAL.vaegt.skaalY * k;
        lay.skaalB = NK.Sprites.MAAL.vaegt.skaalB * k;
        var mb = Math.min(W - 2 * kant, vb * 2.5);
        lay.boks = { x: NK.klamp(lay.vaegt.x - mb / 2, kant, W - kant - mb), y: zoneTop, b: mb, h: Math.max(40, lay.skaalY - 4 - zoneTop) };
        lay.kop = { x: Math.max(kant + 24, lay.vaegt.x - vb / 2 - 70), y: lay.bordY };
        this.lay = lay;
        if (this.opg && this.opg.gennemsyn && !this.dannet) this.bygStraks();
        this.maalAtomer(true);

        this.saetAnker("vaegt-anker-plakat", lay.p.x, lay.p.y, lay.p.b, lay.p.h);
        var lx = lay.p.kolX[2], ly = lay.p.raekkeY[0];
        this.saetAnker("vaegt-anker-felt", lx, ly - 2, lay.p.kolX[5] - lx - 6, lay.p.ch + 4);
        this.saetAnker("vaegt-anker-vaegt", lay.vaegt.x - vb / 2, lay.bordY - vh, vb, vh);
        this.saetAnker("vaegt-anker-molekyle", lay.boks.x, lay.boks.y, lay.boks.b, lay.boks.h);
    };

    P.saetAnker = function (id, x, y, b, h) {
        var e = NK.el(id);
        if (!e) return;
        e.style.left = Math.round(x) + "px";
        e.style.top = Math.round(y) + "px";
        e.style.width = Math.round(b) + "px";
        e.style.height = Math.round(h) + "px";
    };

    P.tilpas = function () {
        if (this.L.tilpas() || !this.lay) this.layout();
    };

    /* ----- Atomerne paa vaegten ---------------------------------------------------
       Stoerrelsen (px pr. bindingslaengde) vaelges, saa baade molekylet og
       bunken af loese atomer kan vaere over skaalen. */
    P.enhed = function () {
        var lay = this.lay, st = this.opg ? this.opg.st : null;
        if (!lay || !st) return 30;
        var u = Tg.strukturSkala(st.struktur, lay.boks.b * 0.94, lay.boks.h * 0.92, NK.klamp(lay.H * 0.085, 36, 70));
        return Math.max(8, u);
    };

    /* Pladserne i bunken: raekker oven paa skaalen, nedefra */
    P.bunkePlads = function (i, u) {
        var lay = this.lay, trin = 0.9 * u * 1.08;
        var bredde = Math.max(lay.skaalB * 1.1, Math.min(lay.boks.b * 0.8, trin * 11));
        var prRaekke = Math.max(3, Math.floor(bredde / trin));
        var r = Math.floor(i / prRaekke), c = i % prRaekke;
        var iRaekke = Math.min(prRaekke, Math.max(1, this.atomer.filter(function (a) { return !a.fjernes; }).length - r * prRaekke));
        var x0 = lay.vaegt.x - (iRaekke - 1) * trin / 2 + (r % 2 ? trin * 0.25 : 0);
        return { x: x0 + c * trin, y: lay.skaalY - 0.46 * u - r * trin * 0.86 };
    };

    /* Molekylets pladser: centreret over vaegten og hvilende paa skaalen */
    P.strukturPladser = function (u) {
        var st = this.opg.st, lay = this.lay;
        var m = Tg.strukturMaal(st.struktur);
        var cx = lay.vaegt.x, bund = lay.skaalY - 3;
        var cy = bund - (m.y1 - m.my) * u;
        return st.struktur.atomer.map(function (a) {
            return { x: cx + (a[1] - m.mx) * u, y: cy + (a[2] - m.my) * u };
        });
    };

    /* Giver hvert atom sit maal: i bunken eller i molekylet */
    P.maalAtomer = function (straks) {
        if (!this.opg || !this.lay) return;
        var u = this.enhed(), mig = this;
        this.u = u;
        if (this.dannet) {
            var pl = this.strukturPladser(u);
            this.atomer.forEach(function (a) {
                if (a.fjernes || a.j === undefined) return;
                a.maal = pl[a.j];
                if (straks) { a.x = a.maal.x; a.y = a.maal.y; a.fra = null; }
            });
        } else {
            var n = 0;
            this.atomer.forEach(function (a) {
                if (a.fjernes) return;
                a.maal = mig.bunkePlads(n++, u);
                if (straks) { a.x = a.maal.x; a.y = a.maal.y; a.fra = null; }
            });
        }
    };

    P.celleMidte = function (s) {
        var c = this.lay.p.celler[s];
        return { x: c.x + c.b / 2, y: c.y + c.h / 2 };
    };

    P.taelPaaVaegten = function () {
        var t = {};
        this.atomer.forEach(function (a) { if (!a.fjernes) t[a.s] = (t[a.s] || 0) + 1; });
        return t;
    };

    /* Formlen for det, der ligger paa vaegten, i formlens egen raekkefoelge */
    P.vaegtFormel = function () {
        var t = this.taelPaaVaegten(), st = this.opg.st;
        var raekke = st.orden.filter(function (s) { return t[s]; });
        Object.keys(t).forEach(function (s) { if (raekke.indexOf(s) < 0) raekke.push(s); });
        return raekke.map(function (s) { return s + (t[s] > 1 ? NK.saenket(t[s]) : ""); }).join("");
    };

    P.tilfoej = function (s, straks) {
        var o = this.opg;
        if (!o || this.dannet || o.faerdig) return;
        if (this.atomer.filter(function (a) { return !a.fjernes; }).length >= MAKS_ATOMER) {
            this.besked("Der er ikke plads til flere atomer på vægten.", "gul");
            return;
        }
        var fra = this.celleMidte(s);
        var a = { s: s, x: fra.x, y: fra.y, fra: straks ? null : fra, t: 0, maal: null };
        this.atomer.push(a);
        this.maalAtomer(false);
        if (straks) { a.x = a.maal.x; a.y = a.maal.y; }
        this.efterByg(s);
    };

    P.fjern = function (a) {
        if (this.dannet || !a || a.fjernes) return;
        a.fjernes = true;
        a.fra = { x: a.x, y: a.y };
        a.maal = this.celleMidte(a.s);
        a.t = 0;
        this.maalAtomer(false);
        this.efterByg(null);
    };

    /* Efter hvert klik: passer atomerne med formlen? */
    P.efterByg = function (nyS) {
        var o = this.opg, st = o.st, t = this.taelPaaVaegten();
        this.visByg();
        var ens = st.orden.every(function (s) { return t[s] === st.antal[s]; }) &&
            Object.keys(t).every(function (s) { return st.antal[s]; });
        if (ens) { this.dan(); return; }
        if (nyS && !st.antal[nyS]) {
            this.besked(st.Navn + " har ingen " + nyS + ". Klik på kuglen for at fjerne den.", "gul");
        } else if (nyS && t[nyS] > st.antal[nyS]) {
            this.besked("Der er " + (t[nyS] - st.antal[nyS] === 1 ? "et" : String(t[nyS] - st.antal[nyS])) + " " + nyS + " for meget. Klik på kuglen for at fjerne den.", "gul");
        } else if (o.hjaelp === 0) {
            this.besked("", "");
        }
    };

    /* Atomerne passer: de samler sig til molekylet */
    P.dan = function () {
        var st = this.opg.st, brugt = [];
        this.dannet = true;
        this.dannetT = 0;
        var mig = this;
        st.struktur.atomer.forEach(function (sa, j) {
            for (var i = 0; i < mig.atomer.length; i++) {
                if (brugt.indexOf(i) < 0 && !mig.atomer[i].fjernes && mig.atomer[i].s === sa[0]) {
                    brugt.push(i);
                    mig.atomer[i].j = j;
                    return;
                }
            }
        });
        this.maalAtomer(false);
        var f = this.opg.felter[0];
        if (f.status === "aktiv") this.feltRigtigt(f, this.opg.hjaelp > 0 && this.opg.visteByg ? "svar" : "ok");
    };

    /* ----- Panelet ---------------------------------------------------------------- */
    P.bygPanel = function () {
        var mig = this;
        this.el = {
            raekker: NK.el("vaegt-raekker"),
            besked: NK.el("vaegt-besked"),
            knap: NK.el("vaegt-knap"),
            kort: NK.el("vaegt-kort"),
            niveauer: NK.el("vaegt-niveauer"),
            nulstil: NK.el("vaegt-nulstil")
        };
        this.el.knap.addEventListener("click", function () { mig.knap(); });
        NK.el("vaegt-spring").addEventListener("click", function () { mig.springIntro(); mig.fokus(); });

        D.NIVEAUER.forEach(function (nv, nr) {
            var knap = document.createElement("button");
            knap.type = "button";
            knap.className = "hyldelinje";
            knap.innerHTML = '<span class="hl-farve" style="background:' + nv.farve + '"></span>' +
                '<span class="hl-navn">' + nv.navn + '<em>' + nv.kort + '</em></span>' +
                '<span class="hl-tal" id="vaegt-n-tal-' + nr + '"></span>' +
                '<span class="hl-stjerner" id="vaegt-n-stj-' + nr + '"></span>';
            knap.addEventListener("click", function () { mig.vaelgNiveau(nr); });
            mig.el.niveauer.appendChild(knap);
        });

        this.nulstilSikker = 0;
        this.el.nulstil.addEventListener("click", function () {
            if (mig.nulstilSikker > 0) {
                mig.nulstilSikker = 0;
                mig.nulstilAlt();
            } else {
                mig.nulstilSikker = 3;
            }
            mig.visNulstil();
        });
    };

    P.visNulstil = function () {
        NK.saetHTML("vaegt-nulstil", this.nulstilSikker > 0
            ? "<span>Sikker? Klik igen</span><span class=\"tegn\">↺</span>"
            : "<span>Start forfra</span><span class=\"tegn\">↺</span>");
    };

    P.vaelgNiveau = function (nr) {
        var foerste = -1;
        for (var i = 0; i < D.VAEGT.length; i++) {
            if (D.VAEGT[i].niveau !== nr) continue;
            if (foerste < 0) foerste = i;
            if (!this.status[i].loest) { this.vaelg(i); return; }
        }
        this.vaelg(foerste);
    };

    P.opdaterFremskridt = function () {
        for (var n = 0; n < D.NIVEAUER.length; n++) {
            NK.saetTekst("vaegt-n-tal-" + n, this.antalLoest(n) + "/" + this.iNiveau(n));
            var s = this.antalStjerner(n);
            NK.saetTekst("vaegt-n-stj-" + n, s ? "★ " + s : "");
        }
        NK.saetTekst("vaegt-loest", String(this.antalLoest()));
    };

    /* ----- Opgaven ---------------------------------------------------------------- */
    P.vaelg = function (i) {
        if (i === this.valgt && this.opg) return;
        this.valgt = i;
        this.nyOpgave(this.status[i].loest);
    };

    P.nyOpgave = function (gennemsyn) {
        var st = D.VAEGT[this.valgt].st;
        var felter = [{ slags: "byg" }];
        st.orden.forEach(function (s) { felter.push({ slags: "masse", s: s }); });
        felter.push({ slags: "M" });
        felter.forEach(function (f, i) { f.i = i; f.status = "laast"; f.forsoeg = 0; });
        this.opg = { st: st, felter: felter, k: 0, hjaelp: 0, brugtSvar: false, faerdig: false, gennemsyn: !!gennemsyn };
        this.fremhaev = null;
        this.atomer = [];
        this.ring = {};
        this.dannet = false;
        this.dannetT = 0;
        this.enMol = null;
        this.besked("", "");
        if (gennemsyn) {
            var mig = this;
            felter.forEach(function (f) { f.status = "ok"; f.vaerdi = mig.korrekt(f); });
            this.opg.k = felter.length;
            this.opg.faerdig = true;
            if (this.lay) this.bygStraks();
            this.enMol = { t: 99 };
            this.besked(this.status[this.valgt].stjerne ? "Løst uden hjælp. ★" : "Løst.", "god");
        } else {
            felter[0].status = "aktiv";
        }
        this.bygRaekker();
        this.visKort();
        this.visStatus();
        if (!gennemsyn) this.fokus();
    };

    /* Molekylet staar bygget med det samme (gennemsyn og layoutskift) */
    P.bygStraks = function () {
        var st = this.opg.st, mig = this;
        this.atomer = [];
        st.orden.forEach(function (s) {
            for (var n = 0; n < st.antal[s]; n++) mig.atomer.push({ s: s, x: 0, y: 0, fra: null, t: 1, maal: null });
        });
        this.dannet = true;
        this.dannetT = 1;
        var brugt = [];
        st.struktur.atomer.forEach(function (sa, j) {
            for (var i = 0; i < mig.atomer.length; i++) {
                if (brugt.indexOf(i) < 0 && mig.atomer[i].s === sa[0]) { brugt.push(i); mig.atomer[i].j = j; return; }
            }
        });
        this.maalAtomer(true);
    };

    P.korrekt = function (f) {
        var st = this.opg.st;
        if (f.slags === "byg") return st.tekst;
        if (f.slags === "masse") {
            var g = D.grundstof(f.s);
            return st.antal[f.s] + " · " + NK.komma(g.m) + " = " + NK.komma(st.antal[f.s] * g.m);
        }
        return NK.komma(st.M);
    };

    P.aktivtFelt = function () {
        var o = this.opg;
        return o && !o.faerdig ? o.felter[o.k] : null;
    };

    P.bygRaekker = function () {
        var mig = this, o = this.opg, st = o.st;
        var vaert = this.el.raekker;
        vaert.innerHTML = "";
        o.felter.forEach(function (f) {
            var rk = document.createElement("div");
            rk.className = "raekke vandret" + (f.slags === "M" ? " slut" : "");
            var etiket, navn = "";
            if (f.slags === "byg") { etiket = "Byg"; navn = "molekylet"; }
            else if (f.slags === "masse") { etiket = f.s; navn = D.grundstof(f.s).navn; }
            else { etiket = "M"; navn = "i alt"; }
            rk.innerHTML = '<div class="raekke-hoved"><span class="raekke-etiket">' + etiket + "</span>" +
                '<span class="raekke-del">' + navn + "</span></div>" + '<div class="felter"></div>';
            var felterEl = rk.querySelector(".felter");
            var fe = document.createElement("div");
            f.feltEl = fe;
            f.input = null;
            if (f.slags === "byg") {
                fe.className = "felt klikfelt " + f.status;
                if (f.status === "ok" || f.status === "svar") {
                    fe.innerHTML = '<span class="felt-svar">' + NK.html(st.tekst) + '</span><span class="felt-maerke">' +
                        (f.status === "ok" ? "✓" : "↩") + "</span>";
                } else {
                    fe.innerHTML = '<span class="felt-klik" id="vaegt-byg-tekst"></span><span class="felt-pil">↖</span>';
                }
            } else {
                fe.className = "felt " + f.status;
                if (f.status === "ok" || f.status === "svar") {
                    var tekst = f.slags === "masse"
                        ? st.antal[f.s] + " · " + NK.komma(D.grundstof(f.s).m) + " = <b>" + NK.komma(st.antal[f.s] * D.grundstof(f.s).m) + "</b> g/mol"
                        : "<b>" + NK.komma(st.M) + "</b> g/mol";
                    fe.innerHTML = '<span class="felt-svar">' + tekst + '</span><span class="felt-maerke">' +
                        (f.status === "ok" ? "✓" : "↩") + "</span>";
                } else {
                    var foran = f.slags === "masse" ? '<span class="felt-pre">' + st.antal[f.s] + " ·</span>" : "";
                    fe.innerHTML = foran + '<input type="text" inputmode="decimal" autocomplete="off" spellcheck="false"' +
                        ' aria-label="' + (f.slags === "masse" ? "Atommassen for " + f.s : "Molarmassen") + '"' +
                        ' placeholder="' + (f.slags === "masse" ? "atommasse" : "molarmasse") + '"' +
                        (f.status === "aktiv" ? "" : " disabled") + '>' +
                        '<span class="felt-efter">g/mol</span>' +
                        '<button type="button" class="felt-ok" aria-label="Tjek svaret" tabindex="-1"' +
                        (f.status === "aktiv" ? "" : " disabled") + '>↵</button>';
                    var inp = fe.querySelector("input");
                    inp.addEventListener("keydown", function (e) {
                        if (e.key === "Enter") { e.preventDefault(); mig.tjek(); }
                    });
                    inp.addEventListener("focus", function () { mig.fokuseret = true; });
                    inp.addEventListener("blur", function () { mig.fokuseret = false; });
                    fe.querySelector(".felt-ok").addEventListener("click", function () { mig.tjek(); });
                    f.input = inp;
                }
            }
            felterEl.appendChild(fe);
            vaert.appendChild(rk);
        });
        this.visByg();
    };

    /* Teksten i byggefeltet: det, der ligger paa vaegten */
    P.visByg = function () {
        var e = NK.el("vaegt-byg-tekst");
        if (!e) return;
        var n = this.atomer.filter(function (a) { return !a.fjernes; }).length;
        e.textContent = n ? "På vægten: " + this.vaegtFormel() : "Klik i det periodiske system";
        e.classList.toggle("tom", !n);
    };

    P.fokus = function () {
        var f = this.aktivtFelt();
        if (f && f.input && NK.el("fane-vaegt").classList.contains("aktiv") &&
            !document.querySelector(".overlay.vis") && !(NK.Rundvisning && NK.Rundvisning.aktiv())) {
            try { f.input.focus({ preventScroll: true }); } catch (e) { f.input.focus(); }
        }
    };

    P.visKort = function () {
        var o = this.opg, st = o.st, o2 = D.VAEGT[this.valgt];
        var nv = D.NIVEAUER[o2.niveau];
        NK.saetHTML("vaegt-niveau", '<span class="hyldeprik" style="background:' + nv.farve + '"></span>' + nv.navn);
        NK.saetTekst("vaegt-nr", String(o2.plads + 1));
        NK.saetTekst("vaegt-antal-i-niveau", String(this.iNiveau(o2.niveau)));
        NK.saetTekst("vaegt-prompt", st.tekst);
        NK.saetTekst("vaegt-spm", st.Navn + ". Byg molekylet, og find molarmassen.");
        this.el.kort.classList.toggle("sejr", o.faerdig && !o.gennemsyn);
        this.visKnap();
        this.opdaterFremskridt();
    };

    P.visKnap = function () {
        var o = this.opg, tekst, klasse = "knap blaa";
        if (o.faerdig) {
            if (o.gennemsyn) tekst = "Vej stoffet igen";
            else { tekst = "Næste stof →"; klasse += " banker"; }
        } else {
            tekst = o.hjaelp === 0 ? "Giv hint" : "Vis svaret";
            klasse = "knap";
        }
        this.el.knap.textContent = tekst;
        this.el.knap.className = klasse;
    };

    P.besked = function (html, klasse) {
        this.el.besked.innerHTML = html;
        this.el.besked.className = "besked" + (klasse ? " " + klasse : "");
    };

    P.visStatus = function () {
        var o = this.opg;
        if (!o) return;
        if (o.faerdig && this.enMol) {
            NK.saetHTML("vaegt-status", "<b>" + NK.html(D.enMol(o.st)) + "</b> " + NK.html(o.st.fakta));
        } else if (this.dannet) {
            NK.saetHTML("vaegt-status", "Ét molekyle vejer for lidt til, at vægten kan mærke det.");
        } else {
            NK.saetHTML("vaegt-status", "Klik på grundstofferne i det periodiske system. Klik på en kugle for at fjerne den.");
        }
    };

    P.hjaelp = function (f) {
        var st = this.opg.st;
        if (f.slags === "byg") return { hint: D.hintByg(st), svar: "Molekylet har " + D.svarByg(st) };
        if (f.slags === "masse") {
            var g = D.grundstof(f.s);
            return {
                hint: "Find " + f.s + " i det periodiske system. Atommassen er tallet nederst i feltet.",
                svar: f.s + ": " + NK.komma(g.m) + " g/mol. Gange " + st.antal[f.s] + " giver " + NK.komma(st.antal[f.s] * g.m) + ".",
                fremhaev: f.s
            };
        }
        var led = st.orden.map(function (s) { return NK.komma(st.antal[s] * D.grundstof(s).m); });
        return {
            hint: led.length > 1 ? "Læg rækkerne sammen: " + led.join(" + ") + "." : "Der er kun ét grundstof. M er rækken ovenover.",
            svar: "M = " + (led.length > 1 ? led.join(" + ") + " = " : "") + "<b>" + NK.komma(st.M) + " g/mol</b>."
        };
    };

    P.knap = function () {
        var o = this.opg;
        if (o.faerdig) {
            if (o.gennemsyn) this.nyOpgave(false);
            else this.vaelg(this.naesteUloeste(this.valgt));
            return;
        }
        var f = this.aktivtFelt();
        var h = this.hjaelp(f);
        if (o.hjaelp === 0) {
            o.hjaelp = 1;
            this.besked("<b>Hint:</b> " + h.hint, "gul");
            this.fremhaev = h.fremhaev || null;
            this.visKnap();
            this.fokus();
        } else {
            o.brugtSvar = true;
            if (f.slags === "byg") {
                o.visteByg = true;
                this.bygSvar();
                this.besked(h.svar, "gul");
            } else {
                this.feltRigtigt(f, "svar");
                this.besked(h.svar, "gul");
            }
        }
    };

    /* Svaret paa byggeriet: de forkerte atomer flyver tilbage, og de
       manglende kommer fra plakaten */
    P.bygSvar = function () {
        var st = this.opg.st, mig = this;
        var t = {};
        this.atomer.forEach(function (a) {
            if (a.fjernes) return;
            if (!st.antal[a.s] || (t[a.s] || 0) >= st.antal[a.s]) { mig.fjern(a); return; }
            t[a.s] = (t[a.s] || 0) + 1;
        });
        st.orden.forEach(function (s) {
            for (var n = t[s] || 0; n < st.antal[s]; n++) mig.tilfoej(s);
        });
    };

    P.tjek = function () {
        var o = this.opg, f = this.aktivtFelt();
        if (!f || f.slags === "byg") return;
        var raa = f.input ? f.input.value : "";
        var res = f.slags === "masse" ? Tj.atommasse(raa, f.s, o.st.antal[f.s]) : Tj.molarmasse(raa, o.st);
        if (res.tom) { this.besked(res.besked, ""); this.fokus(); return; }
        if (res.ok) {
            this.feltRigtigt(f, "ok");
            if (res.note) this.besked(res.note, "gul");
            return;
        }
        f.forsoeg++;
        this.besked(res.besked, "skidt");
        if (f.feltEl) {
            f.feltEl.classList.remove("ryst");
            void f.feltEl.offsetWidth;
            f.feltEl.classList.add("ryst");
        }
        this.fokus();
    };

    P.feltRigtigt = function (f, maade) {
        var o = this.opg;
        f.status = maade;
        f.vaerdi = this.korrekt(f);
        o.hjaelp = 0;
        this.fremhaev = null;
        if (maade === "ok") this.besked("", "");
        if (f.slags === "masse") this.ring[f.s] = 1;
        if (o.k >= o.felter.length - 1) {
            o.k = o.felter.length;
            this.loes();
        } else {
            o.k++;
            o.felter[o.k].status = "aktiv";
        }
        this.bygRaekker();
        this.visKort();
        this.visStatus();
        this.fokus();
    };

    P.loes = function () {
        var o = this.opg, i = this.valgt;
        o.faerdig = true;
        this.enMol = { t: 0 };
        var s = this.status[i];
        var foer = s.loest;
        s.loest = true;
        s.stjerne = s.stjerne || !o.brugtSvar;
        this.gem();
        var nv = D.VAEGT[i].niveau;
        if (!foer && this.antalLoest(nv) === this.iNiveau(nv) && !this.rost[nv]) {
            this.rost[nv] = true;
            this.ventRos = { t: 2.2, niveau: nv, alt: this.antalLoest() === D.VAEGT.length };
        }
    };

    P.nulstil = function () {
        if (!this.opg) return;
        if (this.opg.faerdig && !this.opg.gennemsyn) return;
        this.nyOpgave(false);
    };

    P.nulstilAlt = function () {
        this.status.forEach(function (s) { s.loest = false; s.stjerne = false; });
        this.rost = {};
        this.gem();
        this.valgt = -1;
        this.opg = null;
        this.vaelg(0);
    };

    /* ----- Kemichaels praesentation ---------------------------------------- */
    P.startIntro = function (tving) {
        if (!this.laererIntro) return;
        if (!tving && NK.hent("nk-sc4.1-intro-vaegt", false)) return;
        NK.gem("nk-sc4.1-intro-vaegt", true);
        this.introVent = tving ? 0.1 : 0.9;
    };

    P.springIntro = function () {
        this.introVent = 0;
        return !!(this.laererIntroVaek && this.laererIntroVaek());
    };

    P.opdaterIntro = function (dt) {
        if (this.introVent > 0) {
            this.introVent -= dt;
            if (this.introVent <= 0 && this.laererIntro) this.laererIntro();
        }
        var iIntro = !!(this.laererIIntro && this.laererIIntro());
        if (iIntro !== this.visesSpring) {
            this.visesSpring = iIntro;
            NK.el("vaegt-spring").hidden = !iIntro;
        }
        var f = this.aktivtFelt();
        if (f && f.feltEl) f.feltEl.classList.toggle("peg", iIntro && this.introTrin === 2);
    };

    P.enter = function () {
        if (this.opg && this.opg.faerdig && !this.opg.gennemsyn) this.knap();
    };

    /* ----- Tegneloekken ------------------------------------------------------ */
    P.opdater = function (dt) {
        this.tid += dt;
        var mig = this;
        if (this.nulstilSikker > 0) {
            this.nulstilSikker -= dt;
            if (this.nulstilSikker <= 0) { this.nulstilSikker = 0; this.visNulstil(); }
        }
        this.atomer.forEach(function (a) {
            if (a.fra) {
                a.t = Math.min(1, a.t + dt / FLYV_TID);
                if (a.t >= 1) { a.fra = null; if (!a.fjernes) { a.x = a.maal.x; a.y = a.maal.y; } }
            } else if (a.maal) {
                a.x = NK.mod(a.x, a.maal.x, mig.dannet ? 7 : 12, dt);
                a.y = NK.mod(a.y, a.maal.y, mig.dannet ? 7 : 12, dt);
            }
        });
        this.atomer = this.atomer.filter(function (a) { return !(a.fjernes && !a.fra); });
        if (this.dannet && this.dannetT < 1) this.dannetT = Math.min(1, this.dannetT + dt / 0.6);
        Object.keys(this.ring).forEach(function (s) { mig.ring[s] = Math.max(0, mig.ring[s] - dt / 1.4); });
        if (this.enMol && this.enMol.t < 99) {
            var foer = this.enMol.t;
            this.enMol.t += dt;
            if (foer < 0.5 && this.enMol.t >= 0.5) this.visStatus();
            if (this.enMol.t > 3) this.enMol.t = 99;
        }
        if (this.ventRos) {
            this.ventRos.t -= dt;
            if (this.ventRos.t <= 0 && this.laererNiveau) {
                var v = this.ventRos;
                this.ventRos = null;
                this.laererNiveau(v.niveau, v.alt);
            }
        }
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
    };

    /* Atomets plads lige nu (ogsaa undervejs i luften) */
    P.atomPos = function (a) {
        if (!a.fra) return { x: a.x, y: a.y };
        var t = NK.blod(a.t);
        var til = a.maal || a.fra;
        return {
            x: NK.lerp(a.fra.x, til.x, t),
            y: NK.lerp(a.fra.y, til.y, t) - Math.sin(t * Math.PI) * 50
        };
    };

    P.displayTekst = function () {
        var o = this.opg;
        if (!o || !this.enMol) return { t: "0,00 g" };
        var t = this.enMol.t;
        var a = NK.klamp((t - 0.5) / TAEL_TID, 0, 1);
        var v = o.st.M * NK.blod(a);
        return { t: NK.komma(Math.round(v)) + " g", lys: a > 0 && a < 1 ? 1 : (a >= 1 ? 0.4 : 0), etiket: a > 0 ? "1 mol" : "" };
    };

    P.tegn = function () {
        var L = this.L, ctx = L.ctx, lay = this.lay;
        if (!lay) return;
        var mig = this, o = this.opg;
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 6);

        Tg.plakat(ctx, lay.p, {
            tid: this.tid,
            lys: this.over && this.over.slags === "celle" ? this.over.s : null,
            fremhaev: this.fremhaev
        });

        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.H + 10);

        /* Koppen */
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand) {
            var kk = NK.klamp(lay.H / 600, 0.8, 1.4);
            NK.Sprites.tegn(ctx, "kaffekop", lay.kop.x - 18 * kk, lay.kop.y - 40 * kk, 42 * kk, 40 * kk);
            if (this.over && this.over.slags === "kop") {
                ctx.strokeStyle = "rgba(242, 197, 61, 0.8)";
                ctx.lineWidth = 2;
                NK.rundtRekt(ctx, lay.kop.x - 22 * kk, lay.kop.y - 44 * kk, 50 * kk, 46 * kk, 6);
                ctx.stroke();
            }
        }

        /* Vaegten med displayet */
        var disp = this.displayTekst();
        Tg.vaegt(ctx, lay.vaegt.x, lay.vaegt.y, lay.vaegtB, disp.t, { lys: disp.lys, etiket: disp.etiket });

        if (o) {
            var t1 = this.enMol ? this.enMol.t : -1;
            /* 1 mol af stoffet paa skaalen */
            if (t1 >= 0) this.tegnEnMol(ctx, NK.klamp((t1 - 0.35) / 1.0, 0, 1));
            /* Molekylet (eller bunken af atomer) */
            var skala = t1 < 0 ? 1 : 1 - NK.blod(NK.klamp(t1 / 0.6, 0, 1));
            if (skala > 0.02) this.tegnAtomer(ctx, skala);
        }

        this.tegnBobler(ctx);
        if (this.laererTegnOver) this.laererTegnOver(ctx);
    };

    P.tegnAtomer = function (ctx, skala) {
        var mig = this, u = this.u || this.enhed(), st = this.opg.st, lay = this.lay;
        var pos = [];
        var cx = lay.vaegt.x, cy = lay.skaalY;
        ctx.save();
        if (skala < 1) {
            ctx.globalAlpha *= NK.klamp(skala * 1.4, 0, 1);
            ctx.translate(cx, cy);
            ctx.scale(skala, skala);
            ctx.translate(-cx, -cy);
        }
        if (this.dannet) {
            /* Bindingerne tegnes, naar atomerne er paa plads */
            this.atomer.forEach(function (a) { if (a.j !== undefined) pos[a.j] = mig.atomPos(a); });
            var ba = this.dannetT;
            st.struktur.bindinger.forEach(function (bd) {
                if (pos[bd[0]] && pos[bd[1]]) Tg.binding(ctx, pos[bd[0]], pos[bd[1]], bd[2], u, ba);
            });
        }
        var liste = this.atomer.slice().sort(function (a, b) { return D.radius(a.s) - D.radius(b.s); });
        liste.forEach(function (a) {
            var p = mig.atomPos(a);
            var r = D.radius(a.s) * u * (a.fra ? 0.6 + 0.4 * NK.blod(a.fjernes ? 1 - a.t : a.t) : 1);
            var lys = mig.over && mig.over.slags === "atom" && mig.over.a === a;
            Tg.atom(ctx, p.x, p.y, r, a.s, { ring: lys ? 1 : (mig.ring[a.s] || 0) });
        });
        ctx.restore();
    };

    /* 1 mol af stoffet: vaeske i baegerglas, pulver i vejebaad eller gas i ballon */
    P.tegnEnMol = function (ctx, t) {
        var st = this.opg.st, lay = this.lay;
        var x = lay.vaegt.x, y = lay.skaalY + 1;
        if (st.form === "vaeske") {
            Tg.baeger(ctx, x, y, lay.vaegtB * 0.4, st, t, st.M / 100 / st.rho);
        } else if (st.form === "gas") {
            /* 24 L er en stor ballon: den maa gerne gaa op foran plakaten */
            var r = NK.klamp(Math.min(lay.vaegtB * 0.5, (y - lay.p.y - 50) / 2.6), 24, 150);
            Tg.ballon(ctx, x, y, r, st, t, this.tid);
        } else {
            var hoejde = lay.vaegtB * 0.13 * NK.klamp(Math.pow(st.M / 10000, 1 / 3), 0.6, 1.6);
            Tg.pulver(ctx, x, y, lay.vaegtB * 0.62, st, t, hoejde, this.valgt);
        }
    };

    P.tegnBobler = function (ctx) {
        var u = this.over, lay = this.lay;
        if (!u) return;
        if (u.slags === "celle") Tg.plakatBoble(ctx, lay.p, u.s, lay.W);
    };

    /* ----- Musen ---------------------------------------------------------------- */
    P.hvadErUnder = function (pt) {
        var lay = this.lay;
        if (!lay) return null;
        if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return { slags: "laerer" };
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand && Math.abs(pt.x - lay.kop.x) < 30 && pt.y < lay.kop.y + 4 && pt.y > lay.kop.y - 60) {
            return { slags: "kop" };
        }
        var s = Tg.plakatCelle(lay.p, pt.x, pt.y);
        if (s) return { slags: "celle", s: s };
        if (!this.dannet && this.opg && !this.opg.faerdig) {
            var u = this.u || this.enhed();
            for (var i = this.atomer.length - 1; i >= 0; i--) {
                var a = this.atomer[i];
                if (a.fjernes || a.fra) continue;
                var r = D.radius(a.s) * u + 3;
                if ((pt.x - a.x) * (pt.x - a.x) + (pt.y - a.y) * (pt.y - a.y) <= r * r) return { slags: "atom", a: a };
            }
        }
        return null;
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointermove", function (e) {
            var pt = mig.L.punkt(e);
            mig.over = mig.hvadErUnder(pt);
            var klikbar = mig.over && (mig.over.slags !== "celle" || (!mig.dannet && mig.opg && !mig.opg.faerdig));
            c.style.cursor = klikbar ? "pointer" : "default";
        });
        c.addEventListener("pointerleave", function () { mig.over = null; c.style.cursor = "default"; });
        c.addEventListener("click", function (e) {
            var pt = mig.L.punkt(e);
            if (mig.laererIntroKlik && mig.laererIntroKlik(pt.x, pt.y)) return;
            if (mig.laererKlik && mig.laererKlik(pt.x, pt.y)) return;
            var u = mig.hvadErUnder(pt);
            if (!u) return;
            if (u.slags === "kop" && mig.klikKop) { mig.klikKop(); return; }
            if (u.slags === "celle") {
                if (mig.dannet || !mig.opg || mig.opg.faerdig) return;
                mig.tilfoej(u.s);
                mig.fokus();
                return;
            }
            if (u.slags === "atom") { mig.fjern(u.a); mig.over = null; }
        });
    };

    NK.SimVaegt = SimVaegt;
}());
