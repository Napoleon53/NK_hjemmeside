/* =====================================================================
   sim_proeve.js - fane 2: Den ukendte proeve

   En proeve (A til E) er én af tre eller fire hverdagsting, hvis pH
   staar ved tingen over pH-aksen. Eleven tester proeven med én indikator
   ad gangen og afgoer selv, hvad farven viser om pH (bedoemt ved Indsend
   svar). Saa graanes den del af aksen, hvor pH ikke kan vaere, og de
   ting, der ikke passer, bliver streget ud. Naar kun én ting passer,
   maaler pH-metret proeven.

   Faserne:
     test   kortet beder eleven klikke paa en draabeflaske
     dryp   draabeflasken drypper i proevens glas i sin raekke
     tolk   hvad viser farven om pH? (svarene er indikatorens omraader)
     slut   alle fem proever er fundet
   Stjerne: ingen fejl, intet vist svar og saa faa indikatorer som muligt
   (K.minTest).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var F = NK.Fane;
    var T = NK.Tegning;
    var NOEGLE = "nk-sc7.7-proeve";
    var FONT = T.FONT;

    var LOEFT = 0.4, FALD = 0.22, BLAND = 0.9, HJEM = 0.4, OPHOLD = 0.2;
    var VD = Math.PI - 0.38;
    var METER = 1.3;

    function SimProeve() {
        var mig = this;
        this.runder = D.RUNDER;
        this.hentStatus();
        this.startFane();
        this.bygListe();
        this.aeg = 0;
        NK.el("p-forfra").addEventListener("click", function () { mig.forfra(); });
        NK.el("p-liste").addEventListener("click", function (e) {
            var k = e.target.closest ? e.target.closest("[data-opg]") : null;
            if (k) mig.vaelg(parseInt(k.getAttribute("data-opg"), 10));
        });
    }

    var P = SimProeve.prototype;
    F.paa(P, "p");

    /* ----- Hukommelsen ------------------------------------------------------------ */
    P.hentStatus = function () {
        var gemt = NK.hent(NOEGLE, {}) || {};
        this.status = this.runder.map(function (r) {
            var g = gemt[r.bogstav] || {};
            return { loest: !!g.l, stjerne: !!g.s };
        });
    };

    P.gem = function () {
        var ud = {}, mig = this;
        this.status.forEach(function (s, i) { ud[mig.runder[i].bogstav] = { l: s.loest ? 1 : 0, s: s.stjerne ? 1 : 0 }; });
        NK.gem(NOEGLE, ud);
    };

    P.antalLoest = function () { return this.status.filter(function (s) { return s.loest; }).length; };

    P.naesteUloeste = function () {
        var n = this.status.length;
        for (var d = 1; d <= n; d++) {
            var i = (this.nr + d + n) % n;
            if (!this.status[i].loest) return i;
        }
        return -1;
    };

    /* ----- Panelet ------------------------------------------------------------------ */
    P.bygListe = function () {
        var html = "";
        this.runder.forEach(function (r, i) {
            html += '<button type="button" class="opg-chip" data-opg="' + i + '"><span class="oc-f">Prøve ' + r.bogstav +
                '</span><i class="oc-m"></i></button>';
        });
        NK.el("p-liste").innerHTML = html;
    };

    P.visListe = function () {
        var chips = NK.el("p-liste").querySelectorAll("[data-opg]");
        for (var k = 0; k < chips.length; k++) {
            var i = parseInt(chips[k].getAttribute("data-opg"), 10), s = this.status[i];
            chips[k].classList.toggle("valgt", i === this.nr && this.fase !== "slut");
            chips[k].classList.toggle("loest", s.loest);
            chips[k].classList.toggle("stjerne", s.stjerne);
            chips[k].querySelector(".oc-m").textContent = s.stjerne ? "★" : (s.loest ? "✓" : "");
        }
        NK.saetTekst("p-loest", String(this.antalLoest()));
        NK.saetTekst("p-brugt", this.fase === "slut" ? "" : "Indikatorer brugt på prøve " + this.runde.bogstav + ": " + this.tests.length);
    };

    /* ----- En runde --------------------------------------------------------------------- */
    P.vaelg = function (i) {
        this.nr = i;
        this.runde = this.runder[i];
        this.fase = "test";
        this.tests = [];          /* { ind, nr }: de tolkninger, der er godkendt */
        this.brugt = {};          /* ind -> { farve, navn, t } glasset i raekken */
        this.nuInd = null;
        this.drypT = null;
        this.meterT = null;
        this.valgt = null;
        this.forkert = {};
        this.fejl = false;
        this.sv = false;
        this.groen = null;
        this.sejrT = null;
        this.hover = null;
        this.besked("", "");
        this.nulstilHjaelp();
        this.visKort();
        this.visListe();
        this.layout();
    };

    P.passer = function () { return K.passer(this.runde, this.tests); };
    P.hemmeligPh = function () { return D.TING[this.runde.hemmelig].ph; };

    function navne(ids, stor) {
        return ids.map(function (id, i) { return (stor && i === 0) ? D.TING[id].stor : D.TING[id].navn; });
    }

    P.kortData = function () {
        var mig = this, r = this.runde, chip = "Opgave " + (this.nr + 1);
        if (this.fase === "slut") {
            var st = this.status.filter(function (s) { return s.stjerne; }).length;
            return { slags: "opgave", chip: "Alle prøver",
                tekst: D.PROEVE_FAERDIG + " Du fandt " + st + " af dem med så få indikatorer som muligt og uden fejl.",
                ekstra: '<p class="sk-note">Knappen Begynd forfra i panelet giver de fem prøver igen.</p>' };
        }
        if (this.fase === "test") {
            var p = this.passer(), tekst;
            if (!this.tests.length) tekst = "Prøve " + r.bogstav + " er " + D.listeEller(navne(r.ting)) + ". Klik på en dråbeflaske for at teste prøve " + r.bogstav + " med indikatoren.";
            else tekst = "Prøve " + r.bogstav + " er " + D.listeEller(navne(p)) + ". Klik på en dråbeflaske, du ikke har brugt.";
            return { slags: "opgave", chip: chip, tekst: tekst };
        }
        if (this.fase === "dryp") {
            return { slags: "opgave", chip: chip, tekst: D.stor(D.ind(this.nuInd).kort) + " dryppes i et glas med prøve " + r.bogstav + "." };
        }
        var ind = D.ind(this.nuInd), farve = this.brugt[this.nuInd].navn;
        return {
            slags: "spm", chip: chip,
            tekst: D.stor(ind.kort) + " blev " + farve + " i prøve " + r.bogstav + ". Hvad viser farven om prøvens pH?",
            svar: ind.tolk.map(function (o, j) { return { t: o.tekst, valgt: mig.valgt === j, forkert: !!mig.forkert[j] }; })
        };
    };

    P.skjulIndsend = function () { return this.fase !== "tolk"; };
    P.skjulHint = function () { return this.fase === "dryp" || this.fase === "slut"; };

    P.svarValg = function (j) {
        if (this.fase !== "tolk") return;
        this.valgt = this.valgt === j ? null : j;
        this.visKort();
    };

    P.kanSendes = function () { return this.fase === "tolk" && this.valgt !== null; };

    P.indsendTekst = function () {
        if (this.valgt === null || this.fase !== "tolk") return "Indsend svar";
        return "Indsend svar: " + D.ind(this.nuInd).tolk[this.valgt].tekst;
    };

    P.ingentingTekst = function () { return "Vælg et af svarene på kortet først."; };

    P.indsend = function () { this.bedoem(false); };

    /* Paa slutkortet goer Enter ingenting */
    var indsendKlik = P.indsendKlik;
    P.indsendKlik = function () { if (this.fase === "tolk") indsendKlik.call(this); else this.kortBlink(); };

    P.bedoem = function (vist) {
        var ind = D.ind(this.nuInd), ph = this.hemmeligPh(), rigtig = K.tolk(this.nuInd, ph), nr = this.valgt;
        var farve = this.brugt[this.nuInd].navn, r = this.runde;
        if (nr !== rigtig) {
            this.fejl = true;
            this.forkert[nr] = true;
            this.valgt = null;
            this.visKort();
            var o = ind.tolk[nr];
            this.fejlLinje(D.stor(ind.kort) + " er " + o.farve + " ved " + o.tekst + ", men prøve " + r.bogstav + " blev " + farve + ".");
            return;
        }
        var foer = this.passer();
        this.tests.push({ ind: this.nuInd, nr: nr });
        var nu = this.passer();
        var ud = foer.filter(function (id) { return nu.indexOf(id) < 0; });
        var forkl = D.stor(ind.kort) + " er " + farve + " ved " + ind.tolk[nr].tekst + ".";
        this.sejrT = 0;
        this.udT = 0;
        if (nu.length === 1) {
            /* Proeven er fundet: pH-metret maaler */
            var s = this.status[this.nr], foerste = !s.loest, min = K.minTest(r);
            s.loest = true;
            s.stjerne = s.stjerne || (!this.fejl && !this.sv && !vist && this.tests.length <= min);
            this.gem();
            this.meterT = 0;
            var ting = D.TING[nu[0]];
            var tekst = forkl + " Kun " + ting.navn + " passer, og pH-metret viser " + D.tal(ting.ph) + ".";
            if (this.tests.length > min) tekst += " Det kan gøres med " + (min === 1 ? "én indikator." : min + " indikatorer.");
            var alle = this.antalLoest() === this.runder.length;
            var naeste = this.naesteUloeste();
            this.groen = {
                spm: true, svarNr: nr, maade: vist || this.sv ? "svar" : "selv", tekst: tekst,
                maerke: "Prøve " + r.bogstav + " er " + ting.navn,
                knap: naeste >= 0 ? "Næste prøve →" : "Afslut →"
            };
            this.alleNu = alle && foerste;
            this.besked("", "");
            this.visKort();
            this.visListe();
            if (this.alleNu) NK.konfettiRegn(NK.el("fane-p").querySelector(".scene"), 140);
            else NK.konfetti(this.el.skort, 36);
            return;
        }
        var tekst2 = forkl;
        if (ud.length) tekst2 += " " + D.stor(D.liste(navne(ud))) + " passer ikke.";
        tekst2 += " " + D.stor(D.liste(navne(nu))) + " passer stadig.";
        this.groen = {
            spm: true, svarNr: nr, maade: vist || this.sv ? "svar" : "selv", tekst: tekst2,
            knap: "Test med en indikator mere →",
            naeste: function () {
                this.fase = "test";
                this.nuInd = null;
                this.valgt = null;
                this.forkert = {};
                this.nulstilHjaelp();
                this.visKort();
                this.visListe();
            }
        };
        this.besked("", "");
        this.visKort();
        this.visListe();
    };

    /* Kortets knap gaar altid fremad. Begynd forfra staar i panelet */
    P.videre = function () {
        var naeste = this.naesteUloeste();
        if (naeste >= 0) { this.vaelg(naeste); return; }
        this.groen = null;
        this.fase = "slut";
        this.besked("", "");
        this.visKort();
        this.visListe();
    };

    P.forfra = function () {
        this.status = this.runder.map(function () { return { loest: false, stjerne: false }; });
        this.gem();
        this.vaelg(0);
    };

    P.nulstil = function () {
        if (this.groen || this.fase === "dryp" || this.fase === "slut") return;
        this.vaelg(this.nr);
    };

    /* ----- Hjaelpen ------------------------------------------------------------------- */
    /* Den ubrugte indikator, der skiller flest af de ting ad, der stadig passer */
    P.bedsteInd = function () {
        var mig = this, p = this.passer(), bedst = null, bedstN = -1;
        D.PROEVE_IND.forEach(function (id) {
            if (mig.brugt[id]) return;
            var set = {};
            p.forEach(function (t) { set[K.tolk(id, D.TING[t].ph)] = 1; });
            var n = Object.keys(set).length;
            /* Ved lige mange: den, der udelukker flest ved den hemmelige ting */
            var ud = K.passer(mig.runde, mig.tests.concat(K.testFor(mig.runde, [id]))).length;
            var score = n * 10 - ud;
            if (score > bedstN) { bedstN = score; bedst = id; }
        });
        return bedst;
    };

    P.hintNu = function () {
        if (this.groen) return [];
        if (this.fase === "test") {
            var id = this.bedsteInd(), p = this.passer();
            if (!id) return [];
            var ind = D.ind(id);
            var dele = p.map(function (t) { return K.navn(id, D.TING[t].ph) + " ved " + D.TING[t].navn; });
            return ["Vælg en indikator, der får forskellige farver ved de pH, der står ved tingene på tavlen.",
                    D.stor(ind.kort) + " er " + D.liste(dele) + "."];
        }
        if (this.fase === "tolk") {
            var i2 = D.ind(this.nuInd), farve = this.brugt[this.nuInd].navn, o = i2.tolk[K.tolk(this.nuInd, this.hemmeligPh())];
            var best = D.BESTEMT[farve] || farve;
            return ["Find den " + best + " del af " + i2.gen + " bjælke på farvekortet.",
                    "Den " + best + " del af " + i2.gen + " bjælke ligger ved " + o.tekst + "."];
        }
        return [];
    };

    P.visSvar = function () {
        this.sv = true;
        if (this.fase === "test") {
            var id = this.bedsteInd();
            if (id) this.test(id);
            return;
        }
        if (this.fase === "tolk") {
            this.valgt = K.tolk(this.nuInd, this.hemmeligPh());
            this.bedoem(true);
        }
    };

    /* ----- Forsoeget -------------------------------------------------------------------- */
    P.test = function (id) {
        if (this.fase !== "test" || this.brugt[id]) return;
        var ph = this.hemmeligPh();
        this.nuInd = id;
        this.brugt[id] = { farve: K.vaeske(id, ph), navn: K.navn(id, ph), t: 0 };
        this.fase = "dryp";
        this.drypT = 0;
        this.valgt = null;
        this.forkert = {};
        this.besked("", "");
        this.nulstilHjaelp();
        this.visKort();
        this.visListe();
    };

    P.drypSlut = function () { return LOEFT + OPHOLD + FALD + BLAND + 0.1; };

    P.opdaterScene = function (dt) {
        if (this.meterT !== null && this.meterT < METER + 0.1) this.meterT += dt;
        if (this.udT !== undefined && this.udT !== null && this.udT < 1) this.udT += dt;
        if (this.fase !== "dryp" || this.drypT === null) return;
        this.drypT += dt;
        var b = this.brugt[this.nuInd];
        b.t = NK.klamp((this.drypT - LOEFT - FALD) / BLAND, 0, 1);
        if (this.drypT >= this.drypSlut()) {
            b.t = 1;
            this.drypT = null;
            this.fase = "tolk";
            this.visKort();
        }
    };

    /* Flaskens spids og haeldning: (hjem) i raekken, eller over raekkens glas */
    P.flaskePos = function (id) {
        var rk = this.raekke(id), hjem = { x: rk.flaske.x, y: rk.flaske.y, v: 0 };
        if (this.fase !== "dryp" || this.nuInd !== id || this.drypT === null) return hjem;
        var over = { x: rk.glas.x + rk.glas.b / 2, y: rk.glas.y - 2, v: VD };
        var t = this.drypT;
        function mel(a, b, u) { return { x: NK.lerp(a.x, b.x, u), y: NK.lerp(a.y, b.y, u) - 14 * Math.sin(Math.PI * u), v: NK.lerp(a.v, b.v, u) }; }
        if (t < LOEFT) return mel(hjem, over, NK.blod(t / LOEFT));
        if (t < LOEFT + OPHOLD + FALD) return over;
        var u = (t - LOEFT - OPHOLD - FALD) / HJEM;
        if (u < 1) return mel(over, hjem, NK.blod(u));
        return hjem;
    };

    /* ----- Musen ------------------------------------------------------------------------ */
    P.flaskeVed = function (pt) {
        if (!pt || !this.k) return null;
        var mig = this, fundet = null;
        D.PROEVE_IND.forEach(function (id) {
            var rk = mig.raekke(id), s = mig.k.fh / 100;
            if (pt.x > rk.x0 - 4 && pt.x < rk.glas.x + rk.glas.b + 4 && pt.y > rk.y && pt.y < rk.y + mig.k.rowH) fundet = id;
            if (pt.x > rk.flaske.x - 30 * s && pt.x < rk.flaske.x + 30 * s && pt.y > rk.flaske.y - 4 && pt.y < rk.flaske.y + 100 * s) fundet = id;
        });
        return fundet;
    };

    P.overScene = function (pt) {
        var id = this.fase === "test" && !this.groen ? this.flaskeVed(pt) : null;
        this.hover = id && !this.brugt[id] ? id : null;
        if (this.hover) return "pointer";
        if (this.paaBaeger(pt)) return "pointer";
        return null;
    };

    P.paaBaeger = function (pt) {
        var b = this.k && this.k.baeger;
        return !!(pt && b && pt.x > b.x && pt.x < b.x + b.b && pt.y > b.y && pt.y < b.y + b.h);
    };

    P.klikScene = function (pt) {
        /* Paaskeaegget: tre klik paa proeven */
        if (this.paaBaeger(pt)) {
            this.aeg++;
            if (this.aeg >= 3) {
                this.aeg = 0;
                this.kortBesked("Man smager ikke på prøver i et laboratorium. Heller ikke, når det måske er mælk.", 4);
            }
            return;
        }
        if (this.spaer()) return;
        if (this.fase === "test") {
            var id = this.flaskeVed(pt);
            if (id && this.brugt[id]) { this.kortBesked(D.stor(D.ind(id).kort) + " er allerede brugt på prøve " + this.runde.bogstav + ".", 3); return; }
            if (id) { this.test(id); return; }
        }
        this.kortBlink();
    };

    /* ----- Layout ----------------------------------------------------------------------- */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle, pad = 14;
        var navnB = Math.round(NK.klamp(t.b * 0.24, 150, 214));
        var x0 = t.x + pad + navnB + 30, x1 = t.x + t.b - 30;
        this.akse = T.lavAkse(x0, x1);
        var h = t.h, n = D.PROEVE_IND.length;
        var topH = NK.klamp(h * 0.36, 122, 184);
        var akseY = t.y + 6 + topH;
        var rowsTop = akseY + 34;
        var rowH = NK.klamp((t.y + t.h - rowsTop - 6) / n, 36, 74);
        var fh = NK.klamp(rowH * 0.98, 34, 64);
        var bb = Math.min(navnB * 0.46, (topH - 30) * 120 / 140), bh = bb * 140 / 120;
        this.k = {
            pad: pad, navnB: navnB, topH: topH, akseY: akseY, rowsTop: rowsTop, rowH: rowH, fh: fh,
            barH: NK.klamp(rowH * 0.46, 16, 30),
            baeger: { x: t.x + pad + 4, y: akseY - 4 - bh, b: bb, h: bh },
            baandH: NK.klamp(topH * 0.14, 18, 24)
        };
        this.saetAnker("proeve", t.x + 4, t.y + 2, t.b - 8, topH + 30);
        this.saetAnker("flasker", t.x + 4, rowsTop - 2, navnB + 26, n * rowH + 4);
        this.saetAnker("kort", x0 - 6, rowsTop - 2, x1 - x0 + 12, n * rowH + 4);
    };

    P.raekke = function (id) {
        var k = this.k, t = this.lay.tavle, i = D.PROEVE_IND.indexOf(id);
        var y = k.rowsTop + i * k.rowH, gh = Math.min(k.rowH * 0.94, 70), gb = gh * 0.3;
        var s = k.fh / 100;
        return {
            y: y, x0: t.x + k.pad,
            flaske: { x: t.x + k.pad + 30 * s + 2, y: y + k.rowH - 4 - T.FLASKE_SPIDS * s },
            navnX: t.x + k.pad + 60 * s + 10,
            glas: { x: this.akse.x0 - 22 - gb / 2, y: y + k.rowH - 2 - gh, b: gb, h: gh },
            bar: { y: y + (k.rowH - k.barH) / 2, h: k.barH }
        };
    };

    /* ----- Tegning ---------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, k = this.k, a = this.akse, mig = this;
        if (!lay || !k) return;
        T.tavle(ctx, lay);
        this.tegnProeve(ctx);
        T.akse(ctx, a, k.akseY, { navn: false });
        NK.tekst(ctx, "pH", a.x0 - 34, k.akseY + 19, { font: "800 14px " + FONT, farve: T.DAEMPET, justering: "center", linje: "middle" });

        /* Den gule ramme om det, kortet taler om */
        if (this.fase === "test" && !this.groen && !this.hover) {
            var r0 = this.raekke(D.PROEVE_IND[0]);
            T.gulRamme(ctx, r0.x0 - 6, k.rowsTop - 2, k.navnB + 20, D.PROEVE_IND.length * k.rowH + 4, 10);
        }
        if ((this.fase === "tolk" || this.groen) && this.nuInd) {
            var rr = this.raekke(this.nuInd);
            if (this.fase === "tolk" && !this.groen) T.gulRamme(ctx, rr.x0 - 6, rr.y + 1, a.x1 - rr.x0 + 12, k.rowH - 2, 10);
        }
        D.PROEVE_IND.forEach(function (id) { mig.tegnRaekke(ctx, id); });
        /* Flasken, der drypper, tegnes oeverst */
        if (this.fase === "dryp" && this.nuInd) this.tegnFlaske(ctx, this.nuInd, true);
        this.tegnSejr(ctx, lay.tavle);
    };

    P.tegnRaekke = function (ctx, id) {
        var rk = this.raekke(id), k = this.k, a = this.akse, ind = D.ind(id), b = this.brugt[id];
        var brugt = !!b, nu = id === this.nuInd && (this.fase === "tolk" || this.fase === "dryp");
        if (!(this.fase === "dryp" && id === this.nuInd)) this.tegnFlaske(ctx, id, false);
        var plads = rk.glas.x - 6 - rk.navnX;
        ctx.save();
        var st = NK.passendeSkrift(ctx, ind.stor, plads, NK.klamp(k.rowH * 0.3, 13, 16), 10, "800");
        ctx.restore();
        var ny = rk.y + k.rowH / 2 + (b && b.t > 0.6 ? -8 : 0);
        NK.tekst(ctx, ind.stor, rk.navnX, ny, { font: "800 " + st + "px " + FONT, farve: nu ? "#8a6200" : T.BLAEK, linje: "middle" });
        if (b && b.t > 0.6) NK.tekst(ctx, "blev " + b.navn, rk.navnX, ny + st + 2, { font: "600 " + (st - 1) + "px " + FONT, farve: T.DAEMPET, linje: "middle" });
        T.reagensglas(ctx, rk.glas, b ? b.farve : false, b ? b.t : 0);
        T.bjaelke(ctx, id, a, rk.bar.y, rk.bar.h, 1);
        T.bjaelkeNavne(ctx, id, a, rk.bar.y, rk.bar.h, 1);
    };

    P.tegnFlaske = function (ctx, id, ovenpaa) {
        var p = this.flaskePos(id), brugt = !!this.brugt[id] && !(ovenpaa && this.fase === "dryp");
        var loeft = this.hover === id ? 4 : 0;
        var alfa = brugt ? 0.45 : 1;
        T.flaske(ctx, p.x, p.y - loeft, this.k.fh, id, p.v, { alfa: alfa, skygge: p.v > 0.3 });
        if (ovenpaa && this.drypT !== null) {
            var rk = this.raekke(id), t = this.drypT - LOEFT - OPHOLD * 0.3;
            var u = t / FALD;
            if (u >= 0 && u <= 1) {
                var x = rk.glas.x + rk.glas.b / 2, y0 = rk.glas.y - 2, y1 = rk.glas.y + rk.glas.h * 0.5;
                T.draabe(ctx, x, y0 + (y1 - y0) * u * u, Math.max(2.4, rk.glas.b * 0.12), K.vaeske(id, 7));
            }
        }
        if (this.hover === id && this.fase === "test" && !this.groen) T.skilt(ctx, p.x, p.y - 6, "Klik: dryp", { min: this.lay.tavle.x + 4 });
    };

    /* Proeven: baegerglasset, pH-metret, de mulige ting og baandet over aksen */
    P.tegnProeve = function (ctx) {
        var k = this.k, a = this.akse, r = this.runde, mig = this, t = this.lay.tavle;
        var bg = k.baeger;
        /* Navnet staar til hoejre for glasset, saa pH-metret ikke daekker det */
        NK.tekst(ctx, "Prøve", bg.x + bg.b + 10, bg.y + bg.h * 0.5, { font: "800 16px " + FONT, farve: T.BLAEK, linje: "alphabetic" });
        NK.tekst(ctx, r.bogstav, bg.x + bg.b + 10, bg.y + bg.h * 0.5 + 30, { font: "800 30px " + FONT, farve: T.BLAEK, linje: "alphabetic" });
        T.baeger(ctx, bg, D.VAND);
        /* pH-metret kommer ned i proeven, naar kun én ting passer */
        if (this.meterT !== null) {
            var u = NK.blod(this.meterT / 0.8), mh = bg.h * 1.15;
            var tx = bg.x + bg.b * 0.66, ty = NK.lerp(bg.y - 30, bg.y + bg.h * 0.82, u);
            var tal = this.meterT > 1.0 ? D.tal(this.hemmeligPh()) : (this.meterT > 0.8 ? "…" : "");
            T.phmeter(ctx, tx, ty, mh, tal, NK.klamp(this.meterT / 0.3, 0, 1));
        }

        /* Baandet: hvor kan pH vaere? */
        var o = K.omraade(this.tests), bh = k.baandH, by = k.akseY - 8 - bh;
        var lo = Math.max(o.lo, D.PH_MIN - 1), hi = Math.min(o.hi, D.PH_MAKS + 1);
        var xl = NK.klamp(a.P(lo), a.x0, a.x1), xh = NK.klamp(a.P(hi), a.x0, a.x1);
        ctx.save();
        NK.rundtRekt(ctx, a.x0, by, a.x1 - a.x0, bh, 6);
        ctx.fillStyle = "#e3e6ea";
        ctx.fill();
        ctx.clip();
        /* Det udelukkede er skraveret */
        ctx.strokeStyle = "rgba(107, 118, 133, 0.35)";
        ctx.lineWidth = 1.2;
        for (var sx = a.x0 - bh; sx < a.x1 + bh; sx += 9) {
            ctx.beginPath();
            ctx.moveTo(sx, by + bh);
            ctx.lineTo(sx + bh, by);
            ctx.stroke();
        }
        if (xh > xl) {
            ctx.fillStyle = "#f6d55c";
            ctx.fillRect(xl, by, xh - xl, bh);
        }
        ctx.restore();
        NK.rundtRekt(ctx, a.x0, by, a.x1 - a.x0, bh, 6);
        ctx.strokeStyle = "#a3abb6";
        ctx.lineWidth = 1.1;
        ctx.stroke();
        if (xh > xl) {
            ctx.save();
            ctx.strokeStyle = "#b8901a";
            ctx.lineWidth = 2;
            ctx.strokeRect(xl, by, xh - xl, bh);
            ctx.restore();
            var tekst = "pH i prøve " + r.bogstav;
            ctx.save();
            ctx.font = "800 13px " + FONT;
            var tb = ctx.measureText(tekst).width;
            ctx.restore();
            if (xh - xl > tb + 16) NK.tekst(ctx, tekst, (xl + xh) / 2, by + bh / 2 + 1, { font: "800 13px " + FONT, farve: "#3a2c00", justering: "center", linje: "middle" });
            else if (xh - xl > 22) NK.tekst(ctx, "?", (xl + xh) / 2, by + bh / 2 + 1, { font: "800 14px " + FONT, farve: "#3a2c00", justering: "center", linje: "middle" });
        }

        /* Tingene staar over baandet ved deres pH; de udelukkede er streget ud */
        var p = this.passer(), fundet = p.length === 1 && this.meterT !== null;
        var sorteret = r.ting.slice().sort(function (x, y) { return D.TING[x].ph - D.TING[y].ph; });
        sorteret.forEach(function (id, i) {
            var ting = D.TING[id], x = a.P(ting.ph), med = p.indexOf(id) >= 0;
            var niv = i % 2, top = by - 10 - (niv ? 40 : 0);
            mig.tegnTing(ctx, x, top, by, ting, med, fundet && med, a);
        });
    };

    P.tegnTing = function (ctx, x, top, by, ting, med, fundet, a) {
        var l1 = ting.stor, l2 = "pH " + D.tal(ting.ph);
        ctx.save();
        ctx.font = "800 13px " + FONT;
        var b = Math.max(ctx.measureText(l1).width, ctx.measureText(l2).width + 2) + 16, h = 34;
        var bx = NK.klamp(x - b / 2, a.x0 - 24, a.x1 + 24 - b), byy = top - h;
        /* Linjen ned til aksen */
        ctx.strokeStyle = med ? "#8a6200" : "rgba(107, 118, 133, 0.5)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash(med ? [] : [3, 3]);
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x, by - 1);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = med ? "#8a6200" : "#a3abb6";
        ctx.beginPath();
        ctx.moveTo(x - 5, by - 7);
        ctx.lineTo(x + 5, by - 7);
        ctx.lineTo(x, by - 1);
        ctx.closePath();
        ctx.fill();
        ctx.shadowColor = med ? "rgba(0, 0, 0, 0.14)" : "transparent";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = fundet ? "#e5f5ea" : (med ? "#ffffff" : "#eef0f3");
        NK.rundtRekt(ctx, bx, byy, b, h, 7);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = fundet ? "#3fae72" : (med ? "#8a94a3" : "#c4cad2");
        ctx.lineWidth = fundet ? 2.5 : 1.2;
        ctx.stroke();
        ctx.restore();
        var farve = med ? T.BLAEK : "#9aa3ae";
        NK.tekst(ctx, l1, bx + b / 2, byy + 12, { font: "800 13px " + FONT, farve: farve, justering: "center", linje: "middle" });
        NK.tekst(ctx, l2, bx + b / 2, byy + 25, { font: "600 12px " + FONT, farve: med ? T.DAEMPET : "#a9b0ba", justering: "center", linje: "middle" });
        if (!med) {
            ctx.save();
            ctx.strokeStyle = "#c0392b";
            ctx.globalAlpha = 0.75;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(bx + 6, byy + h - 6);
            ctx.lineTo(bx + b - 6, byy + 6);
            ctx.stroke();
            ctx.restore();
        }
    };

    NK.SimProeve = SimProeve;
}());
