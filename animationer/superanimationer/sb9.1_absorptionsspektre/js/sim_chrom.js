/* =====================================================================
   sim_chrom.js - fane 3: chromoforen

   Otte molekyler, fra farveløse (hexatrien, penta-1,4-dien, benzen,
   stilben) til farvestoffer (smørgult, β-caroten, indigo, Allura rød).
   Eleven markerer foerst chromoforen: dobbeltbindingerne i det stoerste
   konjugerede system (C=C, C=O og N=N). Saa vaelger eleven farven, og
   foerst da kommer spektret (tabelvaerdier) og glasset frem.

   Systemerne regnes af js/molekyle.js, farven af spektret i js/farve.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var F = NK.Farve;
    var M = NK.Mol;
    var Tg = NK.Tg;

    var SVAR = ["Farveløs", "Gul", "Orange", "Rød", "Lilla", "Blå"];

    function SimChrom() {
        var mig = this;
        this.valg = NK.el("ch-valg");
        this.linjeEl = NK.el("ch-opgave");
        this.molekyler = D.CH.map(function (o) {
            var mol = M.byg(o.mol, o.n);
            var konj = M.konjugering(mol);
            var toppe = o.toppe || F.polyenToppe(o.polyen);
            var c = F.farve(toppe);
            return { mol: mol, konj: konj, toppe: toppe, farve: { c: c, css: F.css(c), navn: F.navn(c) } };
        });
        this.startFane(D.CH, D.CH_GRUPPER);
        this.vaelg(0);
        window.addEventListener("resize", function () { mig.layout(); });
    }

    var P = SimChrom.prototype;
    NK.Fane.paa(P, { navn: "ch" });

    P.chipTekst = function (o, i) { return String(i + 1); };

    P.lavOpgave = function (i) {
        this.o = this.opgaver[i];
        this.mm = this.molekyler[i];
        this.mol = this.mm.mol;
        this.konj = this.mm.konj;
        this.N = this.konj.stoerst;
        this.marker = {};
        this.roed = {};
        this.lysB = {};
        this.system = null;
        this.forkerte = {};
        this.over = null;
        this.hover = null;
        this.trin = "find";
        this.bygValg();
        this.visOpgavelinje();
    };

    P.antalMarker = function () { return Object.keys(this.marker).length; };

    /* Det system, eleven er i gang med (eller det foerste af de stoerste) */
    P.maalSystem = function () {
        if (this.system !== null) return this.system;
        var mig = this;
        for (var si = 0; si < this.konj.systemer.length; si++) {
            if (this.konj.systemer[si].dob.length === mig.N) return si;
        }
        return 0;
    };

    P.bygValg = function () {
        var mig = this;
        this.valg.innerHTML = "";
        this.knapper = {};
        if (this.trin !== "farve") { this.layout(); return; }
        SVAR.forEach(function (navn) {
            var k = document.createElement("button");
            k.type = "button";
            k.className = "valgknap farveknap";
            var f = D.FARVER.filter(function (x) { return x.navn === navn; })[0];
            k.innerHTML = '<span class="fk-proeve' + (f ? "" : " tom") + '"' + (f ? ' style="background:' + f.css + '"' : "") + "></span>" + NK.html(navn);
            k.addEventListener("click", function () { mig.svarFarve(navn); mig.fokus(); });
            if (mig.forkerte[navn]) { k.classList.add("forkert"); k.disabled = true; }
            if (mig.faerdig) k.disabled = true;
            mig.valg.appendChild(k);
            mig.knapper[navn] = k;
        });
        this.layout();
    };

    P.visOpgavelinje = function () {
        var t;
        if (this.faerdig) t = "Hold musen over grafen for at se, hvor stoffet absorberer.";
        else if (this.trin === "find") t = "Markér chromoforen: klik på dobbeltbindingerne i det største konjugerede system.";
        else t = "Chromoforen har " + this.N + " konjugerede dobbeltbinding" + (this.N === 1 ? "" : "er") + ". Hvilken farve har stoffet?";
        NK.saetTekst("ch-opgave", t);
    };

    P.promptHTML = function () {
        var o = this.o;
        var trin1 = this.trin === "find" ? "aktiv" : "ok";
        var trin2 = this.faerdig ? "ok" : (this.trin === "farve" ? "aktiv" : "");
        var h = '<p class="stofnavn">' + NK.html(o.navn) + "</p>" +
            '<p class="note-tekst">Chromoforen er den del af molekylet, der absorberer lyset: det største system af konjugerede dobbeltbindinger. C=O og N=N tæller med.</p>' +
            '<ol class="trinliste"><li class="' + trin1 + '">Markér chromoforen' + (this.trin !== "find" ? ": " + this.N : "") + "</li>" +
            '<li class="' + trin2 + '">Vælg farven' + (this.faerdig ? ": " + NK.html(o.farve.toLowerCase()) : "") + "</li></ol>";
        if (this.faerdig) h += '<div class="forklaring"><p>' + NK.html(o.fakta) + "</p></div>";
        return h;
    };

    P.trinLinje = function () {
        if (this.trin === "find") return "Klik på en dobbeltbinding i molekylet. Markeret: " + this.antalMarker() + ".";
        return "Vælg farven med knapperne under tavlen.";
    };

    /* ----- Hinttrappen og svaret ---------------------------------------------------- */
    P.mangler = function () {
        var mig = this;
        return this.konj.systemer[this.maalSystem()].dob.filter(function (bi) { return !mig.marker[bi]; });
    };

    P.hintTrin = function () {
        var o = this.o, N = this.N;
        if (this.trin === "find") {
            var mangler = this.mangler().length;
            return [
                "Chromoforen er det største system, hvor dobbelt- og enkeltbindinger skifter, så der er præcis én enkeltbinding mellem to dobbeltbindinger.",
                "Begynd ved den dobbeltbinding, der lyser. Følg skiftet mellem dobbelt- og enkeltbinding ud til alle sider. Et C-atom med kun enkeltbindinger bryder systemet.",
                "Der mangler " + mangler + ". De lyser nu."
            ];
        }
        return [
            "Chromoforen har " + N + " konjugerede dobbeltbinding" + (N === 1 ? "" : "er") + ".",
            "En kæde af C=C med færre end ca. 8 konjugerede dobbeltbindinger absorberer kun i UV. N=N og C=O i chromoforen flytter toppen mod længere bølgelængde.",
            "Stoffet er " + o.farve.toLowerCase() + "."
        ];
    };

    P.efterHint = function (n) {
        var mig = this;
        this.lysB = {};
        if (this.trin !== "find") return;
        var mangler = this.mangler();
        if (n === 2 && mangler.length) this.lysB[mangler[Math.floor(mangler.length / 2)]] = true;
        if (n >= 3) mangler.forEach(function (bi) { mig.lysB[bi] = true; });
    };

    P.visSvar = function () {
        var mig = this;
        this.lysB = {};
        if (this.trin === "find") {
            this.system = this.maalSystem();
            this.konj.systemer[this.system].dob.forEach(function (bi) { mig.marker[bi] = true; });
            this.tjekFind(true);
            return;
        }
        this.svarFarve(this.o.farve);
    };

    /* ----- Elevens handlinger --------------------------------------------------------- */
    P.klikBinding = function (bi) {
        var si = this.konj.afBinding[bi];
        if (si === undefined) return;
        var stoer = this.konj.systemer[si].dob.length;
        if (this.marker[bi]) {
            delete this.marker[bi];
            if (!this.antalMarker()) this.system = null;
            this.nulstilHjaelp();
            this.naesteLinje("", "");
            return;
        }
        if (stoer < this.N) {
            this.roed[bi] = 1;
            this.fejlLinje(stoer === 1 ?
                "Den dobbeltbinding er ikke konjugeret med de andre. Mellem dem sidder et C-atom med kun enkeltbindinger." :
                "Den dobbeltbinding hører til et mindre system. Find det største.");
            return;
        }
        if (this.system !== null && si !== this.system) {
            this.roed[bi] = 1;
            this.fejlLinje("Den er ikke konjugeret med dem, du har markeret. Mellem dem sidder et C-atom med kun enkeltbindinger.");
            return;
        }
        this.system = si;
        this.marker[bi] = true;
        this.lysB = {};
        this.nulstilHjaelp();
        this.tjekFind(false);
    };

    P.tjekFind = function (svar) {
        if (this.antalMarker() < this.N) { this.naesteLinje("", ""); return; }
        this.trin = "farve";
        this.hjaelp = 0;
        this.bygValg();
        this.visKort();
        this.visOpgavelinje();
        var t = "Chromoforen har " + this.N + " konjugerede dobbeltbinding" + (this.N === 1 ? "" : "er") + ". " + this.trinLinje();
        if (svar) this.besked('<span class="b-maerke">Svaret</span> ' + NK.html(t), "gul");
        else this.godLinje("Chromoforen har " + this.N + " konjugerede dobbeltbinding" + (this.N === 1 ? "" : "er") + ".");
    };

    P.svarFarve = function (navn) {
        var o = this.o;
        if (this.faerdig || this.trin !== "farve") return;
        if (navn === o.farve) {
            if (this.knapper[navn]) this.knapper[navn].classList.add("rigtig");
            this.trin = "faerdig";
            this.loest(o.fakta);
            this.bygValg();
            this.visOpgavelinje();
            return;
        }
        this.forkerte[navn] = true;
        if (this.knapper[navn]) { this.knapper[navn].classList.add("forkert"); this.knapper[navn].disabled = true; }
        var t = o.nej && o.nej[navn];
        if (!t && o.farve === "Farveløs") t = "Med " + this.N + " konjugerede dobbeltbinding" + (this.N === 1 ? "" : "er") + " ligger toppen i UV, under 400 nm. Stoffet absorberer intet synligt lys.";
        if (!t && navn === "Farveløs") t = this.N + " konjugerede dobbeltbindinger er nok til, at toppen når ind i det synlige lys.";
        if (!t) t = "Toppen ligger i det synlige lys, men et andet sted. Jo længere chromoforen er, jo længere bølgelængde bliver absorberet, og farven går fra gul over orange og rød mod lilla og blå.";
        this.fejlLinje(t);
    };

    P.enter = function () { if (this.faerdig) this.knap(); };

    /* ----- Layout ------------------------------------------------------------------- */
    P.layout = function () {
        if (!this.L) return;
        this.L.tilpas();
        var W = this.L.b;
        var band = this.baand();
        var linjeBund = this.linjeEl ? this.linjeEl.offsetTop + this.linjeEl.offsetHeight : 40;
        var valgH = this.valg && this.valg.children.length ? this.valg.offsetHeight + 14 : 0;
        if (this.valg) this.valg.style.bottom = (band.h + 12) + "px";
        var top0 = linjeBund + 12;
        var bund = band.y - (valgH ? valgH + 8 : 14);
        var avail = Math.max(240, bund - top0);
        var r1h = NK.klamp(avail * 0.52, 150, 330);
        var gw = NK.klamp(W * 0.17, 120, 170);
        var r2y = top0 + r1h + 10, r2h = Math.max(140, bund - r2y);
        this.lay = {
            tavle: { x: 14, y: top0, b: W - 28, h: r1h },
            graf: { x: 14, y: r2y, b: W - 28 - gw - 10, h: r2h },
            glas: { x: W - 14 - gw, y: r2y, b: gw, h: r2h }
        };
        this.saetAnker("tavle", this.lay.tavle.x, top0, this.lay.tavle.b, r1h);
        this.saetAnker("graf", 14, r2y, W - 28, r2h);
    };

    /* ----- Tegneloekken ------------------------------------------------------------- */
    P.opdaterScene = function (dt) {
        for (var k in this.roed) { this.roed[k] -= dt * 1.2; if (this.roed[k] <= 0) delete this.roed[k]; }
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, o = this.o, mig = this;
        if (!lay) return;
        this.L.ryd();
        var inde = Tg.tavle(ctx, lay.tavle);
        var molR = { x: inde.x + 14, y: inde.y + 12, b: inde.b - 28, h: inde.h - 44 };
        this.vis = M.pasning(this.mol, molR, 54);
        var opt = { baand: {}, marker: {}, roed: this.roed };
        if (this.trin !== "find") {
            var s = this.konj.systemer[this.maalSystem()];
            s.dob.concat(s.enkelt).forEach(function (bi) { opt.baand[bi] = "rgba(242, 197, 61, 0.24)"; });
        }
        for (var bi in this.marker) opt.marker[bi] = "rgba(242, 197, 61, 0.85)";
        for (var lb in this.lysB) opt.marker[lb] = "rgba(255, 225, 120, " + (0.45 + 0.35 * Math.sin(this.tid * 6)) + ")";
        if (this.over !== null && this.trin === "find") opt.over = this.over;
        M.tegn(ctx, this.mol, this.vis, opt);
        var navn = o.navn + (this.trin === "find" ? "  ·  markeret: " + this.antalMarker() : "  ·  chromoforen: " + this.N + " konjugerede");
        NK.tekst(ctx, navn, inde.x + inde.b / 2, inde.y + inde.h - 12, { font: "700 14px 'Segoe UI', sans-serif", farve: "#cfe0d6", justering: "center" });

        var vis = this.faerdig;
        this.g = Tg.graf(ctx, lay.graf, {
            xmin: 150, xmax: 700, ymax: 2, uv: true, skjult: !vis,
            kurver: [{ A: function (l) { return F.absorbans(mig.mm.toppe, l); } }],
            mark: vis ? [{ l: o.lmax, tekst: "λmax = " + o.lmax + " nm" }] : [],
            hover: vis && this.hover !== null ? { l: this.hover } : null
        });

        var g = lay.glas;
        var b = Math.min(g.b * 0.42, 62), h = g.h - 70, cx = g.x + g.b / 2;
        Tg.etiket(ctx, "Opløsningen", cx, g.y + 2, { just: "center" });
        Tg.glas(ctx, cx, g.y + 22, b, h - 8, { farve: vis ? this.mm.farve.css : "#3b3e4a" });
        NK.tekst(ctx, vis ? this.mm.farve.navn : "?", cx, g.y + 14 + h + 30, { font: "800 17px 'Segoe UI', sans-serif", farve: "#f2f3f5", justering: "center" });
    };

    /* ----- Musen --------------------------------------------------------------------- */
    P.overScene = function (pt) {
        this.over = null;
        this.hover = null;
        if (!pt || !this.vis) return null;
        if (this.g && this.g.inde(pt)) this.hover = NK.klamp(this.g.x2l(pt.x), 150, 700);
        if (this.trin === "find") {
            var bi = M.bindingVed(this.mol, this.vis, pt, true);
            if (bi !== null) { this.over = bi; return "klik"; }
        }
        return null;
    };

    P.klikScene = function (pt) {
        if (this.trin !== "find" || !this.vis) return;
        var bi = M.bindingVed(this.mol, this.vis, pt, true);
        if (bi !== null) this.klikBinding(bi);
    };

    NK.SimChrom = SimChrom;
}());
