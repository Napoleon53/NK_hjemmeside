/* =====================================================================
   sim_rens.js - fane 3: Rens esteren

   Blandingen fra kolben (propylbutanoat, propan-1-ol i overskud, rester
   af butansyre og lidt svovlsyre) er haeldt i en skilletragt. Til venstre
   paa tavlen staar skilletragten med lagene, til hoejre luppen med
   molekylerne i hvert lag, i bogens farver: syren groen, alkoholen orange
   og esteren med begge.

   Fire spoergsmaal (D.RENS_TRIN), der bedoemmes ved Indsend svar. Efter et
   rigtigt svar saetter kortets knap det naeste i gang, og eleven ser det
   ske (fase "anim"):
     vand   hvilke stoffer gaar over i vandfasen? (vaelg alle, der passer)
            -> vandet tilsaettes, tragten rystes, lagene skilles, og
               vandfasen med svovlsyren og alkoholen tappes af
     base   hvad sker der med butansyre i natriumcarbonatopløsning?
            -> opløsningen tilsaettes, det bruser, og butansyre bliver til
               baseformen, butanoat, der gaar over i vandfasen
     gas    hvilken gas dannes?
            -> vandfasen med butanoat tappes af
     ester  hvorfor ligger esteren oeverst? (vaelg alle, der passer)
            -> slut: esteren er ren
   Det, kortet spoerger om, har en gul ring i luppen. Svarene paa kortet,
   eleven har valgt i det foerste spoergsmaal, faar ogsaa en ring.

   Skilletragten tegnes af en profil (TRAGT.r), saa glasset og lagene
   altid passer sammen. Lagenes hoejde regnes af rumfanget.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var F = NK.Fane;
    var NOEGLE = "nk-sb4.2-rens";
    var FONT = "'Segoe UI', sans-serif";

    var GUL = "#d69e0c", GUL_FYLD = "rgba(242, 197, 61, 0.22)";
    var BLAEK = D.FARVE.blaek;
    var FS = D.FARVE.syre.blaek, FA = D.FARVE.alkohol.blaek;
    var ORG = [246, 231, 168], VAND = [191, 227, 247], BLAND = [214, 226, 205];

    /* ----- Skilletragten (enheder: 200 bred, 500 hoej) ------------------------------
       r(y): den indvendige halve bredde. Halsen ender ved y = 58, den runde
       skulder er bredest ved y = 140, og keglen ender i hanen ved y = 318. */
    var TRAGT = {
        b: 200, h: 500, midt: 100, top: 58, skulder: 140, bund: 318,
        r: function (y) {
            if (y < 58) return 11;
            if (y <= 140) return 11 + 70 * Math.sin((y - 58) / 82 * Math.PI / 2);
            if (y <= 318) return 4 + 77 * Math.pow(1 - (y - 140) / 178, 1.15);
            return 4;
        }
    };
    /* Rumfanget fra y til bunden (i enheder, som drejet om aksen) */
    var RUM = (function () {
        var tab = {}, sum = 0;
        for (var y = TRAGT.bund; y >= TRAGT.top; y--) { var r = TRAGT.r(y); sum += r * r; tab[y] = sum; }
        return tab;
    })();
    function rumTil(y) { return RUM[Math.round(NK.klamp(y, TRAGT.top, TRAGT.bund))] || 0; }
    /* Den y, hvor rumfanget fra bunden er v */
    function hoejdeFor(v) {
        for (var y = TRAGT.bund; y >= TRAGT.top; y--) if (RUM[y] >= v) return y;
        return TRAGT.top;
    }
    var V_BLANDING = rumTil(150);           /* blandingen fra kolben */
    var V_VAND = rumTil(196) * 0.95;        /* vandet og natriumcarbonatopløsningen */

    function lerpFarve(a, b, t) {
        return [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t)];
    }
    function rgba(c, a) { return "rgba(" + c[0] + ", " + c[1] + ", " + c[2] + ", " + a + ")"; }

    var ANIM = { vand: 4.6, base: 3.4, tap: 1.8 };

    function SimRens() {
        var mig = this;
        this.trinListe = D.RENS_TRIN;
        this.hentStatus();
        this.startFane();
        this.bygListe();
        NK.el("s-forfra").addEventListener("click", function () { mig.forfra(); });
    }

    var P = SimRens.prototype;
    F.paa(P, "s");

    /* Under en animation og paa slutkortet goer Enter og Indsend svar ingenting */
    var indsendKlik = P.indsendKlik;
    P.indsendKlik = function () { if (this.fase === "spm" || this.groen) indsendKlik.call(this); };

    /* ----- Hukommelsen: antal rensede estere og stjernen ------------------------------- */
    P.hentStatus = function () {
        var g = NK.hent(NOEGLE, {}) || {};
        this.runder = g.r || 0;
        this.stjerne = !!g.s;
    };

    P.gem = function () { NK.gem(NOEGLE, { r: this.runder, s: this.stjerne ? 1 : 0 }); };

    P.naesteUloeste = function () { return 0; };

    /* ----- Panelet: trinene --------------------------------------------------------- */
    P.bygListe = function () {
        var html = "";
        this.trinListe.forEach(function (t, i) {
            html += '<div class="opg-chip serie trin" data-trin="' + i + '"><span class="oc-f"><span class="oc-nr">' + (i + 1) + "</span>" +
                '<span class="serie-navn">' + NK.html(t.navn) + "</span></span><i class=\"oc-m\"></i></div>";
        });
        NK.el("s-trinliste").innerHTML = html;
    };

    P.visListe = function () {
        var chips = NK.el("s-trinliste").querySelectorAll("[data-trin]"), mig = this;
        for (var i = 0; i < chips.length; i++) {
            var loest = i < this.trinNr || this.fase === "slut" || (i === this.trinNr && this.groen && this.groen.spm);
            chips[i].classList.toggle("loest", !!loest);
            chips[i].classList.toggle("valgt", i === this.trinNr && mig.fase !== "slut");
            chips[i].querySelector(".oc-m").textContent = loest ? "✓" : "";
        }
        NK.saetTekst("s-runder", String(this.runder));
    };

    /* ----- Runden ----------------------------------------------------------------- */
    P.vaelg = function () {
        this.trinNr = 0;
        this.fase = "spm";
        this.valgt = {};
        this.forkert = {};
        this.fejl = false;
        this.sv = false;
        this.groen = null;
        this.hintMaerke = 0;
        this.anim = null;
        this.rystNu = 0;
        this.blandet = 0;
        this.bobler = [];
        this.boblerTil = false;
        this.tappet = 0;
        /* Lagene: rumfang af det oeverste lag og vandfasen, og hvor mange lag der er */
        this.vOrg = V_BLANDING;
        this.vVand = 0;
        this.toLag = false;
        this.vandNavn = "Vandfasen";
        /* Molekylerne i luppen: lag "org", "vand" eller "ud" (tappet af) */
        var ik = [], n = 0;
        D.RENS.stoffer.forEach(function (s) {
            for (var i = 0; i < s.antal; i++) ik.push({ nr: n++, stof: s.id, form: s.id, lag: "org", x: null, y: null, alfa: 1 });
        });
        this.ikoner = ik;
        this.besked("", "");
        this.nulstilHjaelp();
        this.layout();
        this.visKort();
        this.visListe();
    };

    P.trin = function () { return this.trinListe[this.trinNr]; };

    P.forfra = function () { this.vaelg(0); };

    /* ----- Kortet ------------------------------------------------------------------ */
    P.kortData = function () {
        var mig = this, t = this.trin();
        if (this.fase === "anim") return { slags: "opgave", chip: "Skilletragten", tekst: this.anim.tekst };
        if (this.fase === "slut")
            return { slags: "opgave", chip: "Esteren er ren", tekst: "Propylbutanoat er renset for svovlsyre, propan-1-ol og butansyre. Begynd forfra i panelet, hvis du vil prøve igen." };
        return {
            slags: "spm", chip: "Spørgsmål " + (this.trinNr + 1) + " af " + this.trinListe.length, tekst: t.spm,
            svar: t.svar.map(function (s, j) { return { t: s, valgt: !!mig.valgt[j], forkert: !!mig.forkert[j] }; })
        };
    };

    P.flere = function () { return this.trin().rigtig.length > 1; };

    P.svarValg = function (j) {
        if (this.fase !== "spm") return;
        if (this.flere()) this.valgt[j] = !this.valgt[j];
        else { var var1 = !!this.valgt[j]; this.valgt = {}; this.valgt[j] = !var1; }
        this.visKort();
    };

    P.valgte = function () {
        var v = this.valgt;
        return Object.keys(v).filter(function (k) { return v[k]; }).map(Number).sort();
    };

    P.skjulIndsend = function () { return this.fase !== "spm"; };
    P.skjulHint = function () { return this.fase !== "spm"; };

    P.kanSendes = function () { return this.fase === "spm" && this.valgte().length > 0; };

    P.indsendTekst = function () {
        var v = this.valgte(), t = this.trin();
        if (!v.length) return "Indsend svar";
        if (v.length === 1) return "Indsend svar: " + t.svar[v[0]];
        return "Indsend svar (" + v.length + " valgt)";
    };

    P.ingentingTekst = function () { return "Vælg et svar på kortet først."; };

    /* Paa slutkortet goer Enter ingenting */
    P.indsend = function () { this.bedoem(false); };

    P.bedoem = function (vist) {
        var t = this.trin(), v = this.valgte(), r = t.rigtig.slice().sort();
        if (JSON.stringify(v) !== JSON.stringify(r)) {
            this.fejl = true;
            var forkerte = v.filter(function (j) { return r.indexOf(j) < 0; });
            var mangler = r.filter(function (j) { return v.indexOf(j) < 0; });
            var tekst;
            if (forkerte.length) {
                tekst = t.fejl[forkerte[0]];
                forkerte.forEach(function (j) { this.forkert[j] = true; }, this);
                forkerte.forEach(function (j) { this.valgt[j] = false; }, this);
            } else tekst = (t.fejl["mangler" + mangler[0]] || "Der er flere svar, der passer.") + " Der er flere svar, der passer.";
            if (forkerte.length && mangler.length && this.flere()) tekst += " Der mangler også et svar.";
            this.visKort();
            this.fejlLinje(tekst);
            return;
        }
        this.sejrT = 0;
        var sidst = this.trinNr === this.trinListe.length - 1, mig = this;
        this.groen = {
            spm: true, maade: vist ? "svar" : "selv", tekst: t.rigtigTekst,
            knap: sidst ? "Afslut forsøget →" : t.knap,
            naeste: function () { if (sidst) mig.afslut(); else mig.startAnim(t.id); }
        };
        /* Alle rigtige svar er groenne: svarNr kan kun vise ét, saa valgt bruges */
        this.valgt = {};
        r.forEach(function (j) { mig.valgt[j] = true; });
        this.besked("", "");
        this.visKort();
        this.visListe();
    };

    P.visSvar = function () {
        this.sv = true;
        var mig = this;
        this.valgt = {};
        this.trin().rigtig.forEach(function (j) { mig.valgt[j] = true; });
        this.bedoem(true);
    };

    P.hintNu = function () {
        if (this.groen || this.fase !== "spm") return [];
        return this.trin().hint;
    };

    P.efterHint = function (n) { this.hintMaerke = n; };

    P.videre = function () { };

    P.naesteSpm = function () {
        this.trinNr++;
        this.fase = "spm";
        this.valgt = {};
        this.forkert = {};
        this.hintMaerke = 0;
        this.nulstilHjaelp();
        this.visKort();
        this.visListe();
    };

    P.afslut = function () {
        this.fase = "slut";
        this.runder++;
        this.stjerne = this.stjerne || (!this.fejl && !this.sv);
        this.gem();
        this.visKort();
        this.visListe();
        NK.konfettiRegn(NK.el("fane-s").querySelector(".scene"), 140);
    };

    /* ----- Animationerne ------------------------------------------------------------ */
    var TEKST = {
        vand: "Vandet rystes med blandingen. Lagene skilles igen, og vandfasen tappes af.",
        base: "Natriumcarbonatopløsningen rystes med det øverste lag. Det bruser.",
        tap: "Vandfasen med butanoat tappes af."
    };

    P.startAnim = function (id) {
        var navn = id === "gas" ? "tap" : id;
        this.fase = "anim";
        this.anim = { navn: navn, t: 0, tekst: TEKST[navn], start: { vOrg: this.vOrg, vVand: this.vVand } };
        this.groen = null;
        this.visKort();
        this.visListe();
    };

    P.opdaterScene = function (dt) {
        var a = this.anim;
        if (this.fase === "anim" && a) {
            a.t += dt;
            this.koerAnim(a);
            if (a.t >= ANIM[a.navn]) { this.anim = null; this.rystNu = 0; this.blandet = 0; this.naesteSpm(); }
        }
        this.flytIkoner(dt);
        this.opdaterBobler(dt);
    };

    /* Hvert billede i animationen. Tiderne er i sekunder */
    P.koerAnim = function (a) {
        var t = a.t, st = a.start, mig = this;
        function del(t0, t1) { return NK.klamp((t - t0) / (t1 - t0), 0, 1); }
        function bueOp(t0, t1) { var u = del(t0, t1); return Math.sin(u * Math.PI); }
        if (a.navn === "vand" || a.navn === "base") {
            /* Vaesken haeldes i, saa rystes tragten, og lagene skilles */
            var ind = NK.blod(del(0, 0.8));
            this.vVand = st.vVand + (V_VAND - st.vVand) * ind;
            if (ind > 0.05) this.toLag = true;
            this.vandNavn = a.navn === "vand" ? "Vandfasen" : "Natriumcarbonatopløsning";
            this.rystNu = bueOp(0.9, 2.3);
            this.blandet = bueOp(0.9, 2.6);
            if (a.navn === "base") this.boblerTil = t > 1.0;
            /* Molekylerne flytter sig, mens tragten rystes */
            if (t > 1.5 && !a.flyttet) {
                a.flyttet = true;
                this.ikoner.forEach(function (ik) {
                    if (a.navn === "vand" && (ik.stof === "alkohol" || ik.stof === "svovlsyre")) { ik.lag = "vand"; if (ik.stof === "svovlsyre") ik.form = "ioner"; }
                    if (a.navn === "vand" && ik.stof === "syre" && !a.enSyre) { ik.lag = "vand"; a.enSyre = true; }
                    if (a.navn === "base" && ik.stof === "syre") { ik.lag = "vand"; ik.form = "base"; }
                });
                this.vOrg = st.vOrg * (a.navn === "vand" ? 0.82 : 0.92);
            }
            /* Vand: til sidst tappes vandfasen af */
            if (a.navn === "vand" && t > 2.9) this.tap(del(2.9, 4.4), st.vVand + V_VAND);
        } else if (a.navn === "tap") {
            this.boblerTil = false;
            this.tap(del(0.1, 1.5), V_VAND);
        }
        void mig;
    };

    /* Vandfasen loeber ud gennem hanen. u gaar fra 0 til 1 */
    P.tap = function (u, fra) {
        var e = NK.blod(u);
        this.vVand = fra * (1 - e);
        if (u >= 1) this.vVand = 0;
        if (!this.anim.tapStart) { this.anim.tapStart = true; this.anim.tappetFoer = this.tappet; }
        this.tappet = this.anim.tappetFoer + e;
        if (e > 0.3) this.ikoner.forEach(function (ik) { if (ik.lag === "vand") ik.lag = "ud"; });
    };

    /* ----- Boblerne (carbondioxid) ---------------------------------------------------- */
    P.opdaterBobler = function (dt) {
        var mig = this;
        var tempo = this.fase === "anim" ? 9 : 2.2;
        if (this.boblerTil && Math.random() < tempo * dt) {
            this.bobler.push({ x: NK.r(-0.6, 0.6), y: 0, v: NK.r(0.3, 0.5), r: NK.r(1.6, 3.2), lup: Math.random() < 0.35 });
        }
        this.bobler.forEach(function (b) { b.y += b.v * dt; });
        this.bobler = this.bobler.filter(function (b) { return b.y < 1; });
        void mig;
    };

    /* ----- Layout ------------------------------------------------------------------- */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle;
        var s = Math.min((t.h - 26) / TRAGT.h, (t.b * 0.27) / TRAGT.b);
        var tb = TRAGT.b * s;
        this.tragt = { s: s, x: t.x + Math.max(16, t.b * 0.04), y: t.y + 12 };
        var lx = this.tragt.x + tb + Math.max(26, t.b * 0.05);
        this.lup = { x: lx, y: t.y + 16, b: t.x + t.b - 18 - lx, h: t.h - 32 };
        this.saetAnker("tragt", this.tragt.x, this.tragt.y, tb, TRAGT.h * s);
        this.saetAnker("lup", this.lup.x, this.lup.y, this.lup.b, this.lup.h);
    };

    /* Kasserne i luppen: ét lag foer vandet, saa det oeverste lag og vandfasen */
    P.kasser = function () {
        var l = this.lup, gap = 12;
        if (!this.toLag) return { org: { x: l.x, y: l.y, b: l.b, h: l.h, navn: "Blandingen fra kolben" }, vand: null };
        var hO = Math.round(l.h * 0.56);
        return {
            org: { x: l.x, y: l.y, b: l.b, h: hO, navn: "Øverste lag" },
            vand: { x: l.x, y: l.y + hO + gap, b: l.b, h: l.h - hO - gap, navn: this.vVand > 1 ? this.vandNavn : "Vandfasen er tappet af" }
        };
    };

    /* Ikonernes pladser: raekker i hver kasse, esterne foerst */
    var ORDEN = { ester: 0, alkohol: 1, syre: 2, svovlsyre: 3 };
    P.maal = function () {
        var k = this.kasser(), ud = {}, mig = this;
        ["org", "vand"].forEach(function (lag) {
            var kasse = k[lag];
            if (!kasse) return;
            var liste = mig.ikoner.filter(function (ik) { return ik.lag === lag; }).sort(function (a, b) { return ORDEN[a.stof] - ORDEN[b.stof] || a.nr - b.nr; });
            var pr = Math.max(1, Math.min(3, Math.floor(kasse.b / 150))), rk = Math.ceil(liste.length / pr) || 1;
            var top = kasse.y + 30, hR = (kasse.h - 36) / rk;
            liste.forEach(function (ik, i) {
                var r = Math.floor(i / pr), c = i % pr, iRk = Math.min(pr, liste.length - r * pr);
                var cb = kasse.b / iRk;
                ud[ik.nr] = { x: kasse.x + cb * (c + 0.5), y: top + hR * (r + 0.5), h: hR };
            });
        });
        this.ikoner.forEach(function (ik) {
            if (ik.lag !== "ud") return;
            var kv = k.vand || k.org;
            var nu = ik.x === null ? { x: kv.x + kv.b / 2, y: kv.y + kv.h / 2 } : ik;
            ud[ik.nr] = { x: nu.x, y: Math.min(nu.y + 26, kv.y + kv.h - 30), h: ik.h || 60 };
        });
        return ud;
    };

    P.flytIkoner = function (dt) {
        var m = this.maal(), mig = this;
        this.ikoner.forEach(function (ik) {
            var p = m[ik.nr];
            if (!p) return;
            if (ik.x === null) { ik.x = p.x; ik.y = p.y; }
            ik.x = NK.mod(ik.x, p.x, 5, dt);
            ik.y = NK.mod(ik.y, p.y, 5, dt);
            ik.h = p.h;
            ik.alfa = ik.lag === "ud" ? Math.max(0, ik.alfa - dt * 2.2) : Math.min(1, ik.alfa + dt * 2);
        });
        void mig;
    };

    /* ----- Musen: et klik i scenen faar kortet til at blinke ------------------------------ */
    P.klikScene = function () {
        if (this.spaer()) return;
        if (this.fase === "spm") this.kortBlink();
    };

    P.nulstil = function () { if (this.fase !== "anim") this.vaelg(0); };

    /* ----- Tegningen ---------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, tv = lay.tavle;
        NK.Tavle.tegn(ctx, lay);
        if (!this.ikoner) return;
        this.tegnTragt(ctx);
        this.tegnLup(ctx);
        this.tegnSejr(ctx, tv);
    };

    P.tegnTragt = function (ctx) {
        var T = this.tragt, s = T.s, mx = T.x + TRAGT.midt * s, top = T.y;
        function X(u) { return T.x + u * s; }
        function Y(v) { return top + v * s; }
        var vinkel = this.rystNu * 0.11 * Math.sin((this.anim ? this.anim.t : 0) * 15);
        ctx.save();
        ctx.translate(mx, Y(190));
        ctx.rotate(vinkel);
        ctx.translate(-mx, -Y(190));

        /* Indersiden: lagene, klippet til glasset */
        function indre() {
            ctx.beginPath();
            for (var y = TRAGT.top; y <= TRAGT.bund; y += 2) ctx.lineTo(X(TRAGT.midt - TRAGT.r(y)), Y(y));
            for (var y2 = TRAGT.bund; y2 >= TRAGT.top; y2 -= 2) ctx.lineTo(X(TRAGT.midt + TRAGT.r(y2)), Y(y2));
            ctx.closePath();
        }
        var yI = hoejdeFor(this.vVand), yT = hoejdeFor(this.vVand + this.vOrg);
        ctx.save();
        indre();
        ctx.clip();
        var m = this.blandet;
        var cOrg = lerpFarve(this.toLag ? ORG : lerpFarve(ORG, BLAND, 0.25), BLAND, m), cVand = lerpFarve(VAND, BLAND, m);
        ctx.fillStyle = rgba(cOrg, 0.95);
        ctx.fillRect(X(0), Y(yT), TRAGT.b * s, (yI - yT) * s);
        if (this.vVand > 1) {
            ctx.fillStyle = rgba(cVand, 0.95);
            ctx.fillRect(X(0), Y(yI), TRAGT.b * s, (TRAGT.bund + 4 - yI) * s);
            /* Graensen mellem lagene */
            ctx.strokeStyle = "rgba(29, 36, 51, " + (0.35 * (1 - m)).toFixed(3) + ")";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(X(0), Y(yI));
            ctx.lineTo(X(TRAGT.b), Y(yI));
            ctx.stroke();
        }
        /* Overfladen */
        ctx.strokeStyle = "rgba(160, 130, 40, 0.55)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(X(0), Y(yT));
        ctx.lineTo(X(TRAGT.b), Y(yT));
        ctx.stroke();
        /* Bobler af carbondioxid fra graensen mod overfladen */
        var mig = this;
        this.bobler.forEach(function (b) {
            if (b.lup) return;
            var y = yI + (yT - yI) * b.y, rr = TRAGT.r(y) * 0.8;
            ctx.beginPath();
            ctx.arc(X(TRAGT.midt + b.x * rr), Y(y), b.r * s * 1.4, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(70, 90, 110, 0.55)";
            ctx.lineWidth = 1;
            ctx.stroke();
        });
        void mig;
        ctx.restore();

        /* Glasset: kant, glans og hals */
        ctx.save();
        ctx.beginPath();
        for (var y3 = TRAGT.top; y3 <= TRAGT.bund; y3 += 2) ctx.lineTo(X(TRAGT.midt - TRAGT.r(y3) - 2.5), Y(y3));
        ctx.lineTo(X(TRAGT.midt - 6.5), Y(TRAGT.bund + 6));
        ctx.moveTo(X(TRAGT.midt + 6.5), Y(TRAGT.bund + 6));
        for (var y4 = TRAGT.bund; y4 >= TRAGT.top; y4 -= 2) ctx.lineTo(X(TRAGT.midt + TRAGT.r(y4) + 2.5), Y(y4));
        ctx.strokeStyle = "#7d8a99";
        ctx.lineWidth = Math.max(1.6, 3 * s);
        ctx.lineJoin = "round";
        ctx.stroke();
        /* Halsen og proppen */
        ctx.fillStyle = "rgba(220, 232, 242, 0.55)";
        ctx.strokeStyle = "#7d8a99";
        ctx.lineWidth = Math.max(1.4, 2.4 * s);
        NK.rundtRekt(ctx, X(86), Y(30), 28 * s, 30 * s, 3 * s);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#c9d2dc";
        NK.rundtRekt(ctx, X(83), Y(8), 34 * s, 26 * s, 5 * s);
        ctx.fill();
        ctx.stroke();
        /* Glansen paa skulderen */
        ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
        ctx.lineWidth = Math.max(2, 5 * s);
        ctx.lineCap = "round";
        ctx.beginPath();
        for (var y5 = 96; y5 <= 190; y5 += 3) ctx.lineTo(X(TRAGT.midt - TRAGT.r(y5) + 14), Y(y5));
        ctx.stroke();
        /* Hanen (blaa som i bogens figur) og roeret */
        ctx.fillStyle = "rgba(220, 232, 242, 0.7)";
        ctx.strokeStyle = "#7d8a99";
        ctx.lineWidth = Math.max(1.4, 2.4 * s);
        NK.rundtRekt(ctx, X(94), Y(TRAGT.bund + 4), 12 * s, 100 * s, 3 * s);
        ctx.fill();
        ctx.stroke();
        if (this.anim && this.anim.tapStart && this.vVand > 1) {
            ctx.fillStyle = rgba(VAND, 0.95);
            ctx.fillRect(X(97), Y(TRAGT.bund + 6), 6 * s, 98 * s);
        }
        ctx.beginPath();
        ctx.arc(X(100), Y(TRAGT.bund + 24), 10 * s, 0, Math.PI * 2);
        ctx.fillStyle = "#e9eef3";
        ctx.fill();
        ctx.stroke();
        var aaben = this.anim && this.anim.tapStart && this.vVand > 1;
        ctx.fillStyle = "#2f7fc1";
        ctx.strokeStyle = "#1d5a8c";
        ctx.save();
        ctx.translate(X(100), Y(TRAGT.bund + 24));
        ctx.rotate(aaben ? Math.PI / 2 : 0);
        NK.rundtRekt(ctx, 0, -5 * s, 40 * s, 10 * s, 4 * s);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        ctx.restore();
        ctx.restore();

        /* Kolben under tragten, som vandfasen tappes ned i */
        this.tegnKolbe(ctx, X, Y, s);
    };

    P.tegnKolbe = function (ctx, X, Y, s) {
        var top = 432, bund = 496, hals = 9, bredde = 46;
        function kant() {
            ctx.beginPath();
            ctx.moveTo(X(100 - hals), Y(top));
            ctx.lineTo(X(100 - hals), Y(top + 14));
            ctx.lineTo(X(100 - bredde), Y(bund));
            ctx.lineTo(X(100 + bredde), Y(bund));
            ctx.lineTo(X(100 + hals), Y(top + 14));
            ctx.lineTo(X(100 + hals), Y(top));
        }
        /* Vaesken i kolben */
        var fyld = NK.klamp(this.tappet / 2, 0, 1);
        if (fyld > 0) {
            ctx.save();
            kant();
            ctx.closePath();
            ctx.clip();
            var h = 10 + 26 * fyld;
            ctx.fillStyle = rgba(VAND, 0.95);
            ctx.fillRect(X(100 - bredde), Y(bund - h), bredde * 2 * s, h * s);
            ctx.restore();
        }
        ctx.save();
        kant();
        ctx.strokeStyle = "#7d8a99";
        ctx.lineWidth = Math.max(1.6, 3 * s);
        ctx.lineJoin = "round";
        ctx.stroke();
        ctx.restore();
    };

    /* Luppen: kasserne med molekylerne og navnene under dem */
    P.tegnLup = function (ctx) {
        var k = this.kasser(), mig = this, T = this.tragt, s = T.s;
        var yI = hoejdeFor(this.vVand), yT = hoejdeFor(this.vVand + this.vOrg);
        /* Kasserne og de stiplede linjer fra laget i tragten */
        function kasse(kb, farve, fra0, fra1) {
            if (!kb) return;
            ctx.save();
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = "rgba(93, 104, 120, 0.45)";
            ctx.lineWidth = 1.2;
            var fx = T.x + (TRAGT.midt + TRAGT.r((fra0 + fra1) / 2) * 0.6) * s;
            ctx.beginPath();
            ctx.moveTo(fx, T.y + fra0 * s);
            ctx.lineTo(kb.x, kb.y + 6);
            ctx.moveTo(fx, T.y + fra1 * s);
            ctx.lineTo(kb.x, kb.y + kb.h - 6);
            ctx.stroke();
            ctx.restore();
            ctx.save();
            NK.rundtRekt(ctx, kb.x, kb.y, kb.b, kb.h, 12);
            ctx.fillStyle = rgba(farve, 0.38);
            ctx.fill();
            ctx.strokeStyle = rgba(lerpFarve(farve, [80, 90, 100], 0.45), 0.8);
            ctx.lineWidth = 1.6;
            ctx.stroke();
            NK.tekst(ctx, kb.navn, kb.x + 14, kb.y + 15, { font: "700 14px " + FONT, farve: "#4a5363", justering: "left", linje: "middle" });
            ctx.restore();
        }
        kasse(k.org, this.toLag ? ORG : lerpFarve(ORG, BLAND, 0.25), yT, this.vVand > 1 ? yI : TRAGT.bund);
        if (k.vand) kasse(k.vand, this.vVand > 1 ? VAND : [236, 238, 241], this.vVand > 1 ? yI : TRAGT.bund - 8, TRAGT.bund);

        /* Bobler i luppen: CO₂ stiger op gennem vandfasen */
        if (k.vand) {
            ctx.save();
            this.bobler.forEach(function (b) {
                if (!b.lup) return;
                var x = k.vand.x + k.vand.b * (0.5 + b.x * 0.75), y = k.vand.y + k.vand.h - 10 - (k.vand.h - 30) * b.y;
                ctx.beginPath();
                ctx.arc(x, y, 15, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
                ctx.fill();
                ctx.strokeStyle = "rgba(70, 90, 110, 0.6)";
                ctx.lineWidth = 1.2;
                ctx.stroke();
                NK.tekst(ctx, "CO₂", x, y + 0.5, { font: "700 12px " + FONT, farve: "#3f4a5a", justering: "center", linje: "middle" });
            });
            ctx.restore();
        }

        /* Molekylerne */
        var ring = this.ringNu();
        this.ikoner.forEach(function (ik) {
            if (ik.x === null || ik.alfa <= 0.01) return;
            ctx.save();
            ctx.globalAlpha = ik.alfa;
            var jx = mig.rystNu ? Math.sin((mig.anim ? mig.anim.t : 0) * 23 + ik.nr) * 5 * mig.rystNu : 0;
            mig.tegnIkon(ctx, ik, ik.x + jx, ik.y, ik.h, ring[ik.stof]);
            ctx.restore();
        });
    };

    /* De stoffer, der har en gul ring lige nu: det, kortet spoerger om, og
       det, eleven har valgt paa kortet */
    P.ringNu = function () {
        var ud = {};
        if (this.fase !== "spm" || this.groen) return ud;
        var t = this.trin();
        if (t.id === "vand") {
            var v = this.valgt;
            t.stof.forEach(function (st, j) { if (v[j]) ud[st] = true; });
        } else if (t.id === "base") ud.syre = true;
        else if (t.id === "ester") ud.ester = true;
        return ud;
    };

    var ikonCache = {};
    function ikonGeo(form, s) {
        var noegle = form + "|" + Math.round(s);
        if (ikonCache[noegle]) return ikonCache[noegle];
        var ik = K.ikon(form === "base" ? "base" : form);
        var g = NK.Struktur.geometri(ik.mol, {
            skala: s, ox: 0, oy: 0, stil: "zigzag", farve: BLAEK,
            skrift: NK.klamp(s * 0.52, 12, 18), linje: NK.klamp(s * 0.1, 1.6, 2.6),
            atomFarve: function (id) { return ik.farve(id) === "syre" ? FS : FA; },
            bindingFarve: function (bd) { return ik.farve(bd.a) === "syre" || ik.farve(bd.b) === "syre" ? FS : FA; }
        });
        ikonCache[noegle] = { geo: g, mol: ik.mol };
        return ikonCache[noegle];
    }

    var NAVN = { ester: "propylbutanoat", alkohol: "propan-1-ol", syre: "butansyre", base: "butanoat", svovlsyre: "svovlsyre", ioner: "svovlsyre som ioner" };

    P.tegnIkon = function (ctx, ik, x, y, h, ring) {
        var s = NK.klamp(h * 0.27, 12, 24), navn = NAVN[ik.form];
        var nf = { font: "600 13px " + FONT, farve: "#4a5363", justering: "center", linje: "middle" };
        if (ik.stof === "svovlsyre") {
            var tekst = ik.form === "ioner" ? "H₃O⁺  HSO₄⁻" : "H₂SO₄";
            ctx.save();
            ctx.font = "700 16px " + FONT;
            var w = ctx.measureText(tekst).width + 22;
            if (ring) { NK.rundtRekt(ctx, x - w / 2 - 6, y - 21, w + 12, 34, 17); ctx.fillStyle = GUL_FYLD; ctx.fill(); ctx.strokeStyle = GUL; ctx.lineWidth = 3; ctx.stroke(); }
            NK.rundtRekt(ctx, x - w / 2, y - 15, w, 24, 12);
            ctx.fillStyle = "#eef1f5";
            ctx.fill();
            ctx.strokeStyle = "#7d8a99";
            ctx.lineWidth = 1.4;
            ctx.stroke();
            NK.tekst(ctx, tekst, x, y - 3, { font: "700 16px " + FONT, farve: "#3f4a5a", justering: "center", linje: "middle" });
            NK.tekst(ctx, navn, x, y + 22, nf);
            ctx.restore();
            return;
        }
        var g = ikonGeo(ik.form, s), geo = g.geo;
        var gb = geo.x1 - geo.x0, gh = geo.y1 - geo.y0;
        var ox = x - (geo.x0 + gb / 2), oy = y - 8 - (geo.y0 + gh / 2);
        ctx.save();
        if (ring) {
            ctx.beginPath();
            ctx.ellipse(x, y - 8, gb / 2 + 14, gh / 2 + 9, 0, 0, Math.PI * 2);
            ctx.fillStyle = GUL_FYLD;
            ctx.fill();
            ctx.strokeStyle = GUL;
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        ctx.translate(ox, oy);
        NK.Struktur.tegnGeo(ctx, geo);
        ctx.restore();
        NK.tekst(ctx, navn, x, y - 8 + gh / 2 + 20, nf);
        /* Natriumionen ved butanoat */
        if (ik.form === "base") {
            var nx = x + gb / 2 + 16, ny = y - 8 - gh / 2 + 6;
            ctx.beginPath();
            ctx.arc(nx, ny, 12, 0, Math.PI * 2);
            ctx.fillStyle = "#f3e9fb";
            ctx.fill();
            ctx.strokeStyle = "#8a63c2";
            ctx.lineWidth = 1.4;
            ctx.stroke();
            NK.tekst(ctx, "Na⁺", nx, ny + 0.5, { font: "700 11px " + FONT, farve: "#5b3a8f", justering: "center", linje: "middle" });
        }
    };

    NK.SimRens = SimRens;
}());
