/* =====================================================================
   sim_afstem.js - fane 2: Afstem forbraendingen

   To niveauer, som eleven vaelger i panelet (brugeren 13. nov. 2026:
   "en mulighed for at afstemme reaktionsskemaerne almindeligt (uden
   tegninger og uden trin) ... vaelge oevet eller uoevet"):

   UOEVET. Reaktionsskemaet staar paa en lys tavle som i bogens figurer
   (propan-afstem-trin-1 til 4): formlerne med et felt foran, kugle-
   modellerne under, og regnskabet med foer og efter til hoejre. Eleven
   afstemmer i den faste raekkefoelge carbon, hydrogen og oxygen, ét trin
   ad gangen. Oeverst paa tavlen staar trinnet med stor skrift ("Kig kun
   paa carbonatomerne, C"), og i kuglemodellerne er de andre atomer tonet
   ned, saa det er tydeligt, at trinnet kun handler om det ene slags atom
   (brugeren samme dag). Kun feltet foran det stof, trinnet handler om, kan
   stilles (pilene over og under feltet, og paa oxygentrinnet en knap ½), og
   Indsend svar sender tallet. Regnskabet foelger de indsendte tal, og i det
   trin, eleven staar i, viser det et spoergsmaalstegn, til tallet er sendt.
   Faar O₂ et halvt tal, kommer et spoergsmaal om hele tal til sidst, og
   naar det er besvaret, ganges hele skemaet med 2 paa tavlen.

   OEVET. Kun skemaet med et indtastningsfelt foran hvert stof (HTML oven
   paa scenen, #a-oevet). Eleven skriver alle tal og trykker Indsend svar.
   Et tomt felt taeller som 1. Fejlen siger, hvilket grundstof der ikke
   passer, eller at tallene kan forkortes.

   Fejringen: konfetti fra tavlen, naar et helt skema er afstemt (uden Vis
   svaret), og naar alle skemaer paa niveauet er afstemt, foerer kortets
   knap til en medalje med alle skemaerne og konfettiregn (som sb3.3).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;

    var STOFFER = ["br", "O2", "cp", "H2O"];
    var MELLEM = ["+", "→", "+"];
    var MAX = 20;
    var NIVEAU = "nk-sc4.3-niveau";
    var FOKUS = { cp: "C", H2O: "H", O2: "O" };

    function SimAfstem() {
        var mig = this;
        this.over = null;
        this.indsendT = "";
        this.pop = {};
        this.niveau = NK.hent(NIVEAU, "uoevet") === "oevet" ? "oevet" : "uoevet";
        this.faerdigNoegle = this.niveau === "oevet" ? "o" : "a";
        this.oeEl = NK.el("a-oevet");
        this.sejrEl = NK.el("a-sejr");
        this.koblOevet();
        this.startFane(this.niveau === "oevet" ? D.O_MAAL : D.A_MAAL);
        this.visNiveau();
        ["uoevet", "oevet"].forEach(function (n) {
            NK.el("a-niveau-" + n).addEventListener("click", function () { mig.skiftNiveau(n); });
        });
        NK.el("a-sejr-luk").addEventListener("click", function () { mig.lukSejr(); });
        NK.el("a-sejr-igen").addEventListener("click", function () {
            mig.lukSejr();
            var i = mig.status.map(function (s) { return s.stjerne; }).indexOf(false);
            if (i >= 0) mig.vaelg(i);
        });
        this.sejrEl.addEventListener("click", function (e) { if (e.target === mig.sejrEl) mig.lukSejr(); });
    }

    var P = SimAfstem.prototype;
    NK.Fane.paa(P, { navn: "a" });

    P.oevet = function () { return this.niveau === "oevet"; };

    /* ----- Niveauet: uoevet (trin for trin) eller oevet (hele skemaet) ------------------ */
    P.skiftNiveau = function (n) {
        if (n === this.niveau) return;
        this.lukSejr();
        this.niveau = n;
        NK.gem(NIVEAU, n);
        this.skiftOpgaver(n === "oevet" ? D.O_MAAL : D.A_MAAL, n === "oevet" ? "o" : "a");
        this.visNiveau();
    };

    P.visNiveau = function () {
        var mig = this;
        ["uoevet", "oevet"].forEach(function (n) {
            var k = NK.el("a-niveau-" + n), valgt = mig.niveau === n;
            k.classList.toggle("valgt", valgt);
            k.setAttribute("aria-pressed", valgt ? "true" : "false");
        });
        NK.saetTekst("a-ialt", String(this.opgaver.length));
        this.oeEl.hidden = !this.oevet();
        this.layout();
        this.tilpasOevet();
    };

    /* Formlen for et af de fire led i den aktuelle opgave */
    P.formel = function (s) {
        var r = this.opg.o.r;
        if (s === "br") return D.STOF[r.br].f;
        if (s === "cp") return D.STOF[r.cp].f;
        return s === "O2" ? "O₂" : "H₂O";
    };

    P.molType = function (s) {
        var r = this.opg.o.r;
        if (s === "br") return r.br;
        if (s === "cp") return r.cp;
        return s;
    };

    /* ----- Maalene --------------------------------------------------------------- */
    P.nyOpgave = function (o) {
        this.felt = { cp: null, H2O: null, O2: null };
        this.sendt = { cp: 1, H2O: 1, O2: 1 };
        this.vistSendt = false;
        this.dobbelt = false;
        this.dobT = 0;
        this.pop = {};
        this.afstemtT = null;
        if (o.oevet) this.bygOevet(o);
    };

    P.nyFase = function (del) {
        this.aktiv = del.type === "forsoeg" && !del.oevet ? del.stof : null;
        this.vistSendt = false;
    };

    P.efterOpgave = function () {
        var o = this.opg.o;
        if (!o.oevet && o.k.halv && !this.dobbelt) { this.dobbelt = true; this.dobT = 0; }
        if (o.oevet) this.visOevet();
        this.afstemtT = 0;
        /* Konfetti fra skemaet, naar eleven selv har afstemt det */
        if (this.slut && this.slut.maade === "selv") {
            var scene = this.L.canvas, lay = this.lay;
            if (o.oevet) NK.konfetti(this.oeEl, 60);
            else NK.konfetti(scene, 60, lay.tavle.x + lay.tavle.b / 2, lay.raekkeY - lay.felth);
        }
    };

    P.efterDel = function () { this.vistSendt = true; };

    /* Tallet foran et led, som tavlen viser det. 0 betyder tomt felt. */
    P.vist = function (s) {
        if (this.dobbelt) return this.opg.o.hel[s];
        if (s === "br") return 1;
        return this.felt[s] || 0;
    };

    /* Tallene, regnskabet regner med: de indsendte (1, til et tal er sendt) */
    P.regnTal = function () {
        if (this.dobbelt) return this.opg.o.hel;
        return { br: 1, O2: this.sendt.O2, cp: this.sendt.cp, H2O: this.sendt.H2O };
    };

    P.regnskab = function () {
        var r = this.opg.o.r, b = D.STOF[r.br], p = D.STOF[r.cp], k = this.regnTal();
        return {
            C: [k.br * b.C, k.cp * p.C],
            H: [k.br * b.H, 2 * k.H2O],
            O: [2 * k.O2, k.cp * p.O + k.H2O]
        };
    };

    P.nulstilScene = function () { this.vaelg(this.nr); };

    /* Vis svaret: tallet, trinnet beder om (eller hele skemaet paa oevet) */
    P.forsoegSvar = function (o, del) {
        if (del.oevet) {
            this.oeTal = { br: o.hel.br, O2: o.hel.O2, cp: o.hel.cp, H2O: o.hel.H2O };
            this.visOevet(true);
            return o.loest;
        }
        var s = del.stof, v = s === "cp" ? o.k.cp : (s === "H2O" ? o.k.H2O : o.k.O2);
        this.felt[s] = v;
        this.sendt[s] = v;
        this.pop[s] = 0;
        return del.rigtigt;
    };

    /* ----- Indsend svar -------------------------------------------------------------- */
    P.kanIndsendes = function () {
        if (this.opg.del.oevet) return this.oeLaes().nogen;
        return !!this.aktiv && this.felt[this.aktiv] > 0;
    };

    P.indsendTekst = function () {
        var s = this.aktiv;
        if (this.opg.del.oevet || !s || !this.felt[s]) return "Indsend svar";
        return "Indsend svar: " + D.halv(this.felt[s]) + " " + this.formel(s);
    };

    P.ikkeKlar = function () {
        if (this.opg.del.oevet) return D.oTomt;
        return D.vaelgTal(this.formel(this.aktiv));
    };

    P.forsoegIndsend = function () {
        var o = this.opg.o, del = this.opg.del;
        if (del.oevet) { this.oevetIndsend(); return; }
        var s = del.stof, v = this.felt[s];
        var facit = s === "cp" ? o.k.cp : (s === "H2O" ? o.k.H2O : o.k.O2);
        this.sendt[s] = v;
        this.vistSendt = true;
        if (Math.abs(v - facit) < 0.01) { this.forsoegKlaret(del.rigtigt, "Rigtigt"); return; }
        this.fejlLinje(D.aFejl(del.trin, v, o));
    };

    /* ----- Oevet: felterne i HTML ------------------------------------------------------ */
    P.koblOevet = function () {
        var mig = this;
        this.oeEl.addEventListener("input", function (e) {
            if (!e.target.classList.contains("oe-felt")) return;
            e.target.value = e.target.value.replace(/[^0-9,.½]/g, "").slice(0, 3);
            e.target.classList.remove("forkert");
            mig.nulstilHjaelp();
            if (mig.fast.klasse === "skidt") mig.naesteLinje("", "");
            mig.visIndsend();
        });
        this.oeEl.addEventListener("keydown", function (e) {
            if (e.key === "Enter") { e.preventDefault(); mig.indsendKlik(); }
        });
    };

    P.bygOevet = function (o) {
        var mig = this, html = "";
        STOFFER.forEach(function (s, i) {
            html += '<label class="oe-led"><input class="oe-felt" type="text" inputmode="numeric" autocomplete="off" data-led="' + s + '" aria-label="Tallet foran ' + NK.html(mig.formel(s)) + '">' +
                '<span class="oe-formel">' + NK.html(mig.formel(s)) + "</span></label>";
            if (i < 3) html += '<span class="oe-tegn">' + MELLEM[i] + "</span>";
        });
        NK.el("a-oe-titel").textContent = o.r.titel;
        NK.el("a-oe-skema").innerHTML = html;
        this.oeTal = null;
        this.visOevet();
        this.tilpasOevet();
    };

    /* Skemaet paa oevet staar paa én linje: skriften saa stor, som tavlens
       bredde tillader (hoejst 42 px, mindst 20 px) */
    P.tilpasOevet = function () {
        var sk = NK.el("a-oe-skema"), R = this.lay && this.lay.tavle;
        if (!sk || !R || this.oeEl.hidden) return;
        var px = Math.min(42, Math.max(20, R.h / 7));
        sk.style.fontSize = px + "px";
        for (var n = 0; n < 30 && px > 20 && (sk.scrollWidth > R.b - 48 || sk.offsetHeight > px * 1.9); n++) {
            px -= 1.5;
            sk.style.fontSize = px + "px";
        }
    };

    /* Felterne, som eleven har skrevet dem. Et tomt felt er 1. */
    P.oeLaes = function () {
        var ud = { tal: {}, nogen: false, fejl: false };
        Array.prototype.forEach.call(this.oeEl.querySelectorAll(".oe-felt"), function (f) {
            var t = f.value.trim();
            if (t) ud.nogen = true;
            if (!t) { ud.tal[f.getAttribute("data-led")] = 1; return; }
            if (!/^[0-9]{1,2}$/.test(t) || parseInt(t, 10) < 1) { ud.fejl = true; return; }
            ud.tal[f.getAttribute("data-led")] = parseInt(t, 10);
        });
        return ud;
    };

    P.oevetIndsend = function () {
        var o = this.opg.o, l = this.oeLaes();
        if (l.fejl) { this.fejlLinje(D.oHeleTal); return; }
        var k = l.tal, ok = STOFFER.every(function (s) { return k[s] === o.hel[s]; });
        if (ok) { this.oeTal = k; this.forsoegKlaret(o.loest, "Rigtigt"); return; }
        this.fejlLinje(D.oFejl(k, o));
    };

    /* Felterne efter et svar: laast og groenne, naar skemaet er afstemt */
    P.visOevet = function (vis) {
        var mig = this, o = this.opg.o, faerdig = this.faerdig || vis;
        Array.prototype.forEach.call(this.oeEl.querySelectorAll(".oe-felt"), function (f) {
            var s = f.getAttribute("data-led");
            if (faerdig) {
                var v = mig.oeTal ? mig.oeTal[s] : o.hel[s];
                f.value = v === 1 ? "" : String(v);
                f.placeholder = "";
            }
            f.disabled = !!faerdig;
            f.classList.toggle("rigtig", !!faerdig);
        });
        this.oeEl.classList.toggle("afstemt", !!faerdig);
    };

    P.fokusFelt = function () {
        if (!this.oevet() || this.faerdig || !this.oeEl) return;
        var tomt = null;
        Array.prototype.forEach.call(this.oeEl.querySelectorAll(".oe-felt"), function (f) { if (!tomt && !f.value && f.getAttribute("data-led") !== "br") tomt = f; });
        var akt = document.activeElement;
        if (akt && akt.classList && akt.classList.contains("oe-felt")) return;
        if (tomt) tomt.focus();
    };

    /* ----- Fejringen: medaljen, naar alle skemaer paa niveauet er afstemt ----------------- */
    P.antalStjerner = function () { return this.status.filter(function (s) { return s.stjerne; }).length; };

    P.visSejr = function () {
        var N = this.opgaver.length, stj = this.antalStjerner(), m = D.MEDALJE(stj, N);
        this.sejrEl.className = "sejr " + m.id;
        NK.saetHTML("a-medalje", medaljeSVG(m.id, stj, N));
        NK.saetTekst("a-sejr-titel", this.oevet() ? "Alle seks skemaer er afstemt!" : "Alle fem forbrændinger er afstemt!");
        var html = "";
        this.opgaver.forEach(function (o) { html += "<li>" + NK.html(D.skemaTekst(o.r, o.hel)) + "</li>"; });
        NK.saetHTML("a-sejr-skemaer", html);
        NK.saetHTML("a-sejr-medalje", "<b>" + NK.html(m.navn) + ":</b> " + NK.html(m.tekst));
        NK.saetTekst("a-sejr-maal", m.id === "guld" ? "Højere kommer man ikke." :
            (this.oevet() ? "Afstem skemaerne uden stjerne igen, og gå efter guld." : "Prøv niveauet Øvet, eller afstem skemaerne uden stjerne igen og gå efter guld."));
        NK.el("a-sejr-igen").hidden = m.id === "guld";
        this.sejrEl.hidden = false;
        NK.konfettiRegn(this.sejrEl, m.id === "guld" ? 160 : 110);
    };

    P.lukSejr = function () { if (this.sejrEl) this.sejrEl.hidden = true; };

    var MEDALJEFARVE = {
        guld: ["#fff3b0", "#f2c53d", "#a67c00"],
        soelv: ["#ffffff", "#c9d1da", "#7d8794"],
        bronze: ["#ffd9b0", "#cd7f32", "#7a4515"]
    };

    /* Medaljen fra sb3.3: baand, skive, stjerne og antallet af stjerner */
    function medaljeSVG(id, stj, N) {
        var f = MEDALJEFARVE[id];
        return '<svg viewBox="0 0 120 150" aria-hidden="true">' +
            '<defs><radialGradient id="amg-' + id + '" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="' + f[0] + '"/>' +
            '<stop offset="0.55" stop-color="' + f[1] + '"/><stop offset="1" stop-color="' + f[2] + '"/></radialGradient></defs>' +
            '<path d="M34 0 L58 0 L70 52 L48 58 Z" fill="#3d9ee0"/><path d="M86 0 L62 0 L50 52 L72 58 Z" fill="#e05446"/>' +
            '<circle cx="60" cy="96" r="46" fill="url(#amg-' + id + ')" stroke="' + f[2] + '" stroke-width="3"/>' +
            '<circle cx="60" cy="96" r="36" fill="none" stroke="' + f[0] + '" stroke-opacity="0.7" stroke-width="2"/>' +
            '<text x="60" y="94" text-anchor="middle" font-size="30" font-weight="800" fill="' + f[2] + '">★</text>' +
            '<text x="60" y="122" text-anchor="middle" font-size="17" font-weight="800" fill="' + f[2] + '">' + stj + "/" + N + "</text></svg>";
    }

    /* ----- Scenen --------------------------------------------------------------------- */
    P.maal = function (ctx, F) {
        var mig = this, ud = { F: F, led: [] };
        ctx.font = Tg.font("700", F);
        STOFFER.forEach(function (s) {
            ud.led.push({ s: s, tekstB: ctx.measureText(mig.formel(s)).width });
        });
        return ud;
    };

    /* Gitteret af kuglemodeller under et led: hoejst 4 i hoejden */
    P.gitter = function (s, r) {
        var n = this.vist(s) || 1, hel = Math.floor(n + 1e-9), halv = n - hel > 0.25;
        var antal = hel + (halv ? 1 : 0);
        var k = Tg.kasse(this.molType(s));
        var mb = k.b * r, mh = k.h * r, gap = 0.55 * r;
        var raek = Math.min(4, antal), kol = Math.ceil(antal / 4);
        return { n: n, hel: hel, halv: halv, antal: antal, kol: kol, raek: raek, mb: mb, mh: mh, gap: gap,
                 b: kol * mb + (kol - 1) * gap, h: raek * mh + (raek - 1) * gap };
    };

    P.layout = function () {
        var W = this.L.b, H = this.L.h, ctx = this.L.ctx;
        var lay = { W: W, H: H };
        var top = 10 + this.kortZone() + 12;
        var R = { x: 14, y: top, b: W - 28, h: H - 14 - top };
        lay.tavle = R;
        if (this.oeEl) {
            this.oeEl.style.left = R.x + "px";
            this.oeEl.style.top = R.y + "px";
            this.oeEl.style.width = R.b + "px";
            this.oeEl.style.height = R.h + "px";
        }
        if (this.oevet()) {
            this.lay = lay;
            this.tilpasOevet();
            this.saetAnker("tavle", R.x, R.y, R.b, R.h);
            this.saetAnker("regn", R.x, R.y, 1, 1);
            return;
        }
        var regB = NK.klamp(R.b * 0.2, 172, 214);
        lay.regn = { x: R.x + R.b - regB - 18, b: regB };
        var x0 = R.x + 22, x1 = lay.regn.x - 26, tilraad = x1 - x0;
        /* Oeverst: titlen og trinnene (en eller to linjer) og den store linje med trinnet */
        lay.titelY = R.y + 28;
        ctx.font = Tg.font("700", 16);
        var o = this.opg.o, titelB = ctx.measureText(o.r.titel).width;
        ctx.font = Tg.font("700", 14);
        var trinB = this.trinNavne().reduce(function (a, t) { return a + ctx.measureText("✓ " + t).width + 26; }, 0);
        var toLinjer = 22 + titelB + 30 + trinB + 18 > R.b;
        lay.trinY = toLinjer ? lay.titelY + 28 : lay.titelY;
        var lille = R.h < 420;
        lay.bannerH = lille ? 38 : 46;
        lay.bannerY = lay.trinY + 14;
        var topBlok = lay.bannerY + lay.bannerH + 10 - R.y;
        /* Stoerrelsen: formlerne og kuglerne skaleres sammen, til det hele kan vaere der.
           Gitteret regnes med det stoerste antal, opgaven faar (efter hele tal). */
        var mig = this, F = 42, r = 15;
        var stoerst = o.k.halv ? o.hel : { br: 1, O2: Math.ceil(o.k.O2), cp: o.k.cp, H2O: o.k.H2O };
        function bredde(F, r) {
            var m = mig.maal(ctx, F), ialt = 0;
            m.led.forEach(function (l) {
                var k = Tg.kasse(mig.molType(l.s)), n = stoerst[l.s], kol = Math.ceil(n / 4);
                var gb = kol * k.b * r + (kol - 1) * 0.55 * r;
                l.feltB = F * 1.45;
                l.b = Math.max(l.feltB + 8 + l.tekstB, gb) + 10;
                ialt += l.b;
            });
            m.sep = [F * 1.0, F * 2.0, F * 1.0];
            ialt += m.sep[0] + m.sep[1] + m.sep[2];
            m.ialt = ialt;
            return m;
        }
        function gitterH(r) {
            var h = 0;
            STOFFER.forEach(function (s) {
                var k = Tg.kasse(mig.molType(s)), n = stoerst[s], raek = Math.min(4, n);
                h = Math.max(h, raek * k.h * r + (raek - 1) * 0.55 * r);
            });
            return h;
        }
        function skemaH(F, r) { return 30 + F * 1.25 + 30 + 18 + gitterH(r) + 14; }
        var m = bredde(F, r), s = Math.min(1, tilraad / m.ialt, (R.h - topBlok - 6) / skemaH(F, r));
        F = Math.max(18, F * s); r = Math.max(7, r * s);
        m = bredde(F, r);
        lay.F = F;
        lay.r = r;
        lay.m = m;
        /* Vandret: leddene centreret i det, der er til raadighed */
        var x = x0 + Math.max(0, (tilraad - m.ialt) / 2);
        lay.kol = {};
        m.led.forEach(function (l, i) {
            lay.kol[l.s] = { x: x, b: l.b, feltB: l.feltB, tekstB: l.tekstB };
            x += l.b;
            if (i < 3) { lay["sep" + i] = { x: x, b: m.sep[i] }; x += m.sep[i]; }
        });
        /* Lodret: skemaet midt i pladsen under den store linje */
        var rest = R.h - topBlok, hS = skemaH(F, r);
        var y0 = R.y + topBlok + Math.max(0, (rest - hS) / 2);
        lay.felth = F * 1.25;
        lay.raekkeY = y0 + 30 + lay.felth / 2;
        lay.gitterY = lay.raekkeY + lay.felth / 2 + 30 + 18;
        lay.regn.h = 4 * 34 + 20;
        lay.regn.y = Math.max(lay.bannerY + lay.bannerH + 10, lay.raekkeY - 46);
        this.lay = lay;
        this.saetAnker("tavle", R.x, R.y, lay.regn.x - R.x - 8, R.h);
        this.saetAnker("regn", lay.regn.x - 6, lay.regn.y - 6, lay.regn.b + 12, lay.regn.h + 12);
    };

    /* Feltet foran et led og pilene over og under det */
    P.feltRekt = function (s) {
        var lay = this.lay, c = lay.kol[s];
        return { x: c.x, y: lay.raekkeY - lay.felth / 2, b: c.feltB, h: lay.felth };
    };

    P.pilRekt = function (s, op) {
        var f = this.feltRekt(s), h = 26;
        return { x: f.x + 4, y: op ? f.y - h - 4 : f.y + f.h + 4, b: f.b - 8, h: h };
    };

    P.halvRekt = function () {
        var f = this.feltRekt("O2"), c = this.lay.kol.O2;
        return { x: f.x + f.b + 8, y: f.y + f.h + 4, b: Math.max(44, c.tekstB), h: 26 };
    };

    P.opdaterScene = function (dt) {
        var mig = this;
        Object.keys(this.pop).forEach(function (s) { mig.pop[s] = Math.min(1, mig.pop[s] + dt / 0.35); });
        if (this.dobbelt) this.dobT += dt;
        if (this.afstemtT !== null) this.afstemtT += dt;
        if (this.erForsoeg()) {
            var t = this.indsendTekst() + (this.kanIndsendes() ? "+" : "-");
            if (t !== this.indsendT) { this.indsendT = t; this.visIndsend(); }
        }
    };

    /* Det grundstof, trinnet handler om (de andre atomer tones ned) */
    P.fokusAtom = function () {
        if (this.faerdig || !this.opg) return null;
        return FOKUS[this.opg.del.stof] || null;
    };

    /* ----- Tegning --------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, mig = this;
        if (!lay) return;
        ctx.fillStyle = "#14141a";
        ctx.fillRect(0, 0, lay.W, lay.H);
        if (this.oevet()) { this.tegnSejr(ctx, lay.W, lay.H); return; }
        var o = this.opg.o, R = lay.tavle, F = lay.F, r = lay.r;
        Tg.tavle(ctx, R);

        /* Titlen, trinnene C, H, O (og hele tal) og den store linje med trinnet */
        NK.tekst(ctx, o.r.titel, R.x + 22, lay.titelY, { font: Tg.font("700", 16), farve: "#5a6170" });
        this.tegnTrin(ctx);
        this.tegnBanner(ctx);

        var aktiv = this.iForsoeg() ? this.aktiv : null, fokus = this.fokusAtom();
        STOFFER.forEach(function (s, i) {
            var c = lay.kol[s], f = mig.feltRekt(s), v = mig.vist(s);
            var erAktiv = s === aktiv;
            var klar = mig.erKlar(s);
            /* feltet */
            if (erAktiv) {
                NK.rundtRekt(ctx, f.x, f.y, f.b, f.h, 8);
                ctx.fillStyle = "#fff3c4";
                ctx.fill();
                ctx.lineWidth = 2.5;
                ctx.strokeStyle = "#d6a400";
                ctx.stroke();
            }
            var tekst = v ? D.halv(v) : (erAktiv ? "?" : "");
            if (tekst) {
                var p = mig.pop[s] !== undefined ? mig.pop[s] : 1;
                var sk = 1 + 0.25 * (1 - NK.pop(p)) * (p < 1 ? 1 : 0);
                var farve = !v ? "#a39a80" : (v === 1 && !erAktiv ? "#b9b2a0" : (klar ? "#1d6b3f" : Tg.BLAEK));
                if (s === "br" && mig.dobbelt) farve = "#1d6b3f";
                ctx.save();
                ctx.translate(f.x + f.b / 2, lay.raekkeY);
                ctx.scale(sk, sk);
                NK.tekst(ctx, tekst, 0, F * 0.36, { font: Tg.font("700", F), justering: "center", farve: farve });
                ctx.restore();
            }
            /* formlen */
            NK.tekst(ctx, mig.formel(s), c.x + c.feltB + 8, lay.raekkeY + F * 0.36, { font: Tg.font("700", F), farve: Tg.BLAEK });
            /* kuglemodellerne */
            mig.tegnGitter(ctx, s, c.x + c.b / 2 - 5, lay.gitterY, r, fokus);
            /* pilene */
            if (erAktiv) {
                Tg.knap(ctx, mig.pilRekt(s, true), "▲", { px: 13, over: mig.over === s + "+", bund: "#e9e3d2", kant: "#b8ad8c", farve: "#4a3f1e" });
                Tg.knap(ctx, mig.pilRekt(s, false), "▼", { px: 13, over: mig.over === s + "-", bund: "#e9e3d2", kant: "#b8ad8c", farve: "#4a3f1e" });
                if (s === "O2") {
                    var harHalv = v && v - Math.floor(v + 1e-9) > 0.25;
                    Tg.knap(ctx, mig.halvRekt(), "½", { px: 16, bund: harHalv ? "#ffdf6b" : "#e9e3d2", kant: harHalv ? "#c99400" : "#b8ad8c", farve: "#4a3f1e" });
                }
            }
            if (i < 3) {
                var sp = lay["sep" + i];
                NK.tekst(ctx, MELLEM[i], sp.x + sp.b / 2, lay.raekkeY + F * 0.33, { font: Tg.font("600", MELLEM[i] === "→" ? F * 1.05 : F * 0.85), justering: "center", farve: "#4d5563" });
                NK.tekst(ctx, MELLEM[i], sp.x + sp.b / 2, lay.gitterY + F * 0.3, { font: Tg.font("600", F * 0.7), justering: "center", farve: "#8a8f99" });
            }
        });

        this.tegnRegnskab(ctx);
        /* Den gule ring om feltet foran O₂, naar spoergsmaalet om hele tal handler om det */
        if (this.erSpm() && !this.venter && !this.faerdig) {
            var fO = this.feltRekt("O2");
            Tg.omRing(ctx, fO.x, fO.y, fO.b, fO.h, "#c99400");
        }
        this.tegnSejr(ctx, lay.W, lay.H);
    };

    /* Er leddet afstemt (trinnet er loest)? */
    P.erKlar = function (s) {
        var g = this.opg, fi = g.fi;
        var trin = { cp: 0, H2O: 1, O2: 2 }[s];
        if (trin === undefined) return this.dobbelt;
        return fi > trin || ((this.venter || this.faerdig) && fi === trin);
    };

    P.tegnGitter = function (ctx, s, cx, y, r, fokus) {
        var g = this.gitter(s, r), type = this.molType(s);
        var x0 = cx - g.b / 2;
        var nye = this.dobbelt ? NK.klamp(this.dobT / 0.5, 0, 1) : 1;
        var k = this.opg.o.k;
        var foer = this.dobbelt ? { br: 1, O2: Math.floor(k.O2 + 1e-9), cp: k.cp, H2O: k.H2O }[s] : 0;
        for (var i = 0; i < g.antal; i++) {
            var kol = Math.floor(i / 4), raek = i % 4;
            var mx = x0 + kol * (g.mb + g.gap) + g.mb / 2, my = y + raek * (g.mh + g.gap) + g.mh / 2;
            var alfa = this.dobbelt && i >= foer ? nye : 1;
            if (g.halv && i === g.antal - 1) Tg.halvO2(ctx, mx, my, r, alfa, fokus);
            else Tg.molekyle(ctx, type, mx, my, r, 0, alfa, fokus);
        }
    };

    /* Den store linje oeverst paa tavlen: trinnet, eleven er i, og hvilket atom
       der kigges paa (brugeren 13. nov. 2026: "det skal vaere tydeligt, at vi
       foerst kun er i gang med at kigge paa C-atomer"). Groen, naar trinnet er
       loest. */
    P.bannerTekst = function () {
        var g = this.opg, del = g.del, n = g.o.dele.length;
        if (this.faerdig) return { t: "✓ " + D.TRIN_TAVLE.afstemt, groen: true };
        var trin = "Trin " + (g.fi + 1) + " af " + n + ": ";
        if (!del.trin) return { t: trin + D.TRIN_TAVLE.hel, groen: false };
        if (this.venter) return { t: "✓ " + { C: "Carbon", H: "Hydrogen", O: "Oxygen" }[del.trin] + " passer", groen: true, atom: del.trin };
        return { t: trin + D.TRIN_TAVLE[del.trin], groen: false, atom: del.trin };
    };

    P.tegnBanner = function (ctx) {
        var lay = this.lay, R = lay.tavle, b = this.bannerTekst();
        var x = R.x + 18, w = R.b - 36, y = lay.bannerY, h = lay.bannerH;
        var pop = this.afstemtT !== null && this.faerdig ? 1 + 0.06 * (1 - NK.pop(NK.klamp(this.afstemtT / 0.5, 0, 1))) : 1;
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);
        ctx.scale(pop, pop);
        ctx.translate(-(x + w / 2), -(y + h / 2));
        NK.rundtRekt(ctx, x, y, w, h, 10);
        ctx.fillStyle = b.groen ? "#d6efdf" : "#fff3c4";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = b.groen ? "#5aa877" : "#d6a400";
        ctx.stroke();
        var fs = h >= 46 ? 24 : 20, tx = x + 16;
        if (b.atom) {
            var ar = h * 0.34;
            Tg.atom(ctx, b.atom, x + 14 + ar, y + h / 2, b.atom === "H" ? ar / 0.62 * 0.82 : ar);
            tx = x + 14 + 2 * ar + 12;
        }
        fs = Tg.passer(ctx, b.t, w - (tx - x) - 12, "800", fs, 14);
        NK.tekst(ctx, b.t, tx, y + h / 2 + fs * 0.36, { font: Tg.font("800", fs), farve: b.groen ? "#1d6b3f" : "#4a3800" });
        ctx.restore();
    };

    /* Trinnene oeverst paa tavlen: 1 C, 2 H, 3 O (og 4 hele tal) med det
       loeste i groent og det aktuelle i gult */
    P.tegnTrin = function (ctx) {
        var g = this.opg, lay = this.lay;
        var navne = this.trinNavne();
        var fs = 14, x = lay.tavle.x + lay.tavle.b - 18, y = lay.trinY;
        ctx.save();
        ctx.font = Tg.font("700", fs);
        for (var i = navne.length - 1; i >= 0; i--) {
            var t = navne[i], b = ctx.measureText(t).width + 18;
            x -= b;
            var loest = i < g.fi || ((this.venter || this.faerdig) && i === g.fi);
            var nu = i === g.fi && !loest;
            NK.rundtRekt(ctx, x, y - 16, b, 22, 11);
            ctx.fillStyle = loest ? "#d6efdf" : (nu ? "#fff3c4" : "#ece8dc");
            ctx.fill();
            ctx.lineWidth = 1.2;
            ctx.strokeStyle = loest ? "#5aa877" : (nu ? "#d6a400" : "#cfc8b6");
            ctx.stroke();
            NK.tekst(ctx, (loest ? "✓ " : "") + t, x + b / 2, y, { font: Tg.font("700", fs - 1), justering: "center", farve: loest ? "#1d6b3f" : (nu ? "#5b4500" : "#8a8473") });
            x -= 8;
        }
        ctx.restore();
    };

    P.trinNavne = function () {
        return this.opg.o.dele.map(function (d, i) { return (i + 1) + " " + (d.trin || "hele tal"); });
    };

    /* Regnskabet: foer og efter pilen for C, H og O, som i bogens figur. Den
       raekke, trinnet handler om, er gul; de andre er tonet ned. */
    P.tegnRegnskab = function (ctx) {
        var lay = this.lay, R = lay.regn, rg = this.regnskab(), fokus = this.fokusAtom();
        var trin = this.aktiv && this.iForsoeg() ? FOKUS[this.aktiv] : null;
        var asked = trin && !this.vistSendt;
        ctx.save();
        NK.rundtRekt(ctx, R.x, R.y, R.b, R.h, 10);
        ctx.fillStyle = "#eef3ef";
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = "#c9d6cc";
        ctx.stroke();
        var c0 = R.x + 26, c1 = R.x + R.b * 0.47, c2 = R.x + R.b * 0.74, c3 = R.x + R.b - 18;
        NK.tekst(ctx, "før", c1, R.y + 24, { font: Tg.font("700", 13), justering: "center", farve: "#5e6b62" });
        NK.tekst(ctx, "efter", c2, R.y + 24, { font: Tg.font("700", 13), justering: "center", farve: "#5e6b62" });
        ["C", "H", "O"].forEach(function (e, i) {
            var y = R.y + 40 + i * 36, v = rg[e];
            ctx.save();
            if (fokus && e !== fokus) ctx.globalAlpha = 0.3;
            if (e === fokus) {
                NK.rundtRekt(ctx, R.x + 6, y, R.b - 12, 32, 7);
                ctx.fillStyle = "#fff3c4";
                ctx.fill();
            }
            var cy = y + 22;
            NK.tekst(ctx, e, c0, cy, { font: Tg.font("700", 19), justering: "center", farve: "#1f2430" });
            var foer = D.halv(v[0]), efter = D.halv(v[1]);
            /* Spoergsmaalstegnet staar kun ved det tal, trinnet spoerger om: efter
               pilen for C og H, foer pilen for O (det er O₂, der stilles) */
            var spF = asked && e === trin && e === "O", spE = asked && e === trin && e !== "O";
            var ok = Math.abs(v[0] - v[1]) < 0.01;
            var farve = ok ? "#1d6b3f" : "#b3261e";
            NK.tekst(ctx, spF ? "?" : foer, c1, cy, { font: Tg.font("700", 19), justering: "center", farve: spF ? "#8a7a3a" : farve });
            NK.tekst(ctx, spE ? "?" : efter, c2, cy, { font: Tg.font("700", 19), justering: "center", farve: spE ? "#8a7a3a" : farve });
            if (!(asked && e === trin)) NK.tekst(ctx, ok ? "✓" : "✗", c3, cy, { font: Tg.font("700", 19), justering: "center", farve: farve });
            ctx.restore();
        });
        ctx.restore();
    };

    /* ----- Musen --------------------------------------------------------------------- */
    P.hvad = function (pt) {
        var lay = this.lay;
        if (!lay || !pt || this.oevet()) return null;
        var a = this.iForsoeg() ? this.aktiv : null;
        if (a) {
            if (Tg.inde(this.pilRekt(a, true), pt, 3)) return a + "+";
            if (Tg.inde(this.pilRekt(a, false), pt, 3)) return a + "-";
            if (a === "O2" && Tg.inde(this.halvRekt(), pt, 3)) return "halv";
        }
        var ud = null;
        STOFFER.forEach(function (s) {
            var c = lay.kol[s];
            if (pt.x >= c.x && pt.x <= c.x + c.b && pt.y >= lay.raekkeY - lay.felth && pt.y <= lay.gitterY + 4 * 3.6 * lay.r) ud = "led:" + s;
        });
        return ud;
    };

    P.overScene = function (pt) {
        this.over = this.hvad(pt);
        return this.over && this.over.indexOf("led:") !== 0 ? "klik" : null;
    };

    P.skift = function (s, d) {
        if (this.spaer()) return;
        var v = this.felt[s] || 0, frac = v - Math.floor(v + 1e-9) > 0.25 ? 0.5 : 0;
        if (d === "halv") {
            v = frac ? v - 0.5 : v + 0.5;
            if (v <= 0) v = 0;
        } else if (d > 0) {
            v = v ? Math.min(MAX + frac, v + 1) : 1;
        } else {
            v = v ? Math.max(frac ? 0.5 : 1, v - 1) : 1;
        }
        this.felt[s] = v || null;
        this.pop[s] = 0;
        this.vistSendt = false;
        this.nulstilHjaelp();
        if (this.fast.klasse === "skidt") this.naesteLinje("", "");
        this.visIndsend();
    };

    P.klikScene = function (pt) {
        var h = this.hvad(pt);
        if (!h) return;
        if (h === "halv") { this.skift("O2", "halv"); return; }
        if (/[+-]$/.test(h)) { this.skift(h.slice(0, -1), h.slice(-1) === "+" ? 1 : -1); return; }
        var s = h.slice(4);
        if (!this.iForsoeg()) { this.kortBlink(); return; }
        if (s === this.aktiv) { this.kortBesked(D.vaelgTal(this.formel(s)), 4); return; }
        if (s === "br") { this.kortBesked(D.raekkefoelge.braend, 5); return; }
        var trin = this.opg.del.trin;
        if (trin === "C") this.kortBesked(D.raekkefoelge.C + this.formel("cp") + ".", 5);
        else if (trin === "H") this.kortBesked(D.raekkefoelge.H, 5);
        else this.kortBesked(D.raekkefoelge.O, 5);
    };

    /* Pil op og ned stiller feltet, Enter sender (paa oevet sender Enter i et felt) */
    P.tast = function (e) {
        if (this.oevet()) return false;
        if (e.key === "Enter") {
            if (e.target && e.target.tagName === "BUTTON") return false;
            this.indsendKlik();
            return true;
        }
        if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return false;
        if (!this.aktiv || !this.iForsoeg()) { this.kortBlink(); return true; }
        this.skift(this.aktiv, e.key === "ArrowUp" ? 1 : -1);
        return true;
    };

    NK.SimAfstem = SimAfstem;
}());
