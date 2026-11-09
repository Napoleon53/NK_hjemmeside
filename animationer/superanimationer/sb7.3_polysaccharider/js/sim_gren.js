/* =====================================================================
   sim_gren.js - fane 2: Forgreninger

   Ét forloeb i fire trin (D.GREN):
     1 binding   et stykke amylopectin som haworthformler; hvad hedder
                 bindingen i forgreningen? (α-1,6)
     2 gaet      tre molekyler med lige mange glucoseenheder: amylose,
                 amylopectin og glykogen; hvilket giver hurtigst glucose?
     3 kaploeb   et enzym saetter sig paa hver ende og klipper én enhed af ad
                 gangen; naar alle grene paa en enhed er klippet af, rykker
                 et enzym videre til den
     4 hvorfor   et spoergsmaal om, hvorfor glykogen er hurtigst

   Modellen: et molekyle er et trae af enheder. En ende er en enhed uden
   noget paa sig. Hvert enzym klipper én enhed pr. KLIP sekunder, saa jo
   flere ender, jo hurtigere frigives glucosen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var E = NK.Enhed;
    var F = NK.Fane;
    var T = NK.Tegning;
    var NOEGLE = "nk-sb7.3-gren";

    var KLIP = 0.2;            /* sekunder pr. klip for ét enzym */
    var FLYV = 0.5;            /* en klippet enhed flyver hen til taelleren */
    var STARTPAUSE = 0.6;      /* enzymerne saetter sig, foer de klipper */
    var SKIFT = 0.5;           /* fra haworthformlerne til de tre molekyler */
    var VEJ = { E: [1, 0], UR: [1, -1], DR: [0, 1] };

    function SimGren() {
        var mig = this;
        this.trinListe = D.GREN;
        this.hentStatus();
        this.startFane();
        NK.el("g-forfra").addEventListener("click", function () { mig.forfra(); });
        this.el.skort.addEventListener("click", function (e) {
            if (e.target.closest && e.target.closest("[data-udfoer]")) mig.udfoer();
        });
    }

    var P = SimGren.prototype;
    F.paa(P, "g");

    /* ----- Hukommelsen ------------------------------------------------------------ */
    P.hentStatus = function () {
        var g = NK.hent(NOEGLE, {}) || {};
        this.status = { loest: !!g.l, stjerne: !!g.s };
    };
    P.gem = function () { NK.gem(NOEGLE, { l: this.status.loest ? 1 : 0, s: this.status.stjerne ? 1 : 0 }); };
    P.naesteUloeste = function () { return 0; };

    /* ----- Molekylerne ------------------------------------------------------------- */
    /* Et trae: enhederne med plads (c, r) i sekskantnettet og en forælder */
    P.bygMolekyle = function (m) {
        var enh = [];
        if (m.spiral) {
            for (var i = 0; i < D.ANTAL_GREN; i++) enh.push({ c: i, r: 0, p: i - 1, boern: [] });
        } else {
            var findes = {};
            m.kaeder.forEach(function (k) {
                var p, c, r;
                if (k.fra === null) { c = 0; r = 0; p = -1; enh.push({ c: c, r: r, p: p, boern: [] }); findes["0,0"] = 0; p = 0; }
                else { c = k.fra[0]; r = k.fra[1]; p = findes[c + "," + r]; }
                k.vej.split(" ").forEach(function (sk) {
                    c += VEJ[sk][0]; r += VEJ[sk][1];
                    enh.push({ c: c, r: r, p: p, boern: [] });
                    p = enh.length - 1;
                    findes[c + "," + r] = p;
                });
            });
        }
        enh.forEach(function (u, i) { if (u.p >= 0) enh[u.p].boern.push(i); });
        enh.forEach(function (u) { u.x = u.c + 0.5 * u.r; u.y = 0.866 * u.r; u.klippet = false; u.kt = 0; });
        return { def: m, enh: enh, frigivet: 0, nr: 0, enzymer: [] };
    };

    P.ender = function (mol) {
        var ud = [];
        mol.enh.forEach(function (u, i) { if (!u.klippet && u.boern.every(function (b) { return mol.enh[b].klippet; })) ud.push(i); });
        return ud;
    };

    /* ----- Panelet ------------------------------------------------------------------ */
    P.visListe = function () {
        var mig = this, html = "";
        this.trinListe.forEach(function (t, j) {
            var kl = j < mig.trinNr || (j === mig.trinNr && mig.groen) || mig.faerdig ? "faerdig" : (j === mig.trinNr ? "nu" : "");
            html += '<li class="' + kl + '"><span class="tr-nr">' + (j + 1) + "</span>" + NK.html(t.navn) + "</li>";
        });
        NK.saetHTML("g-trin", html);
        NK.saetTekst("g-maerke", this.status.stjerne ? "★ gennemført uden fejl" : (this.status.loest ? "✓ gennemført" : ""));
    };

    /* ----- Forloebet ------------------------------------------------------------------ */
    P.vaelg = function () {
        var mig = this;
        this.mol = D.MOLEKYLER.map(function (m) { return mig.bygMolekyle(m); });
        this.koer = null;
        this.flyv = [];
        this.placering = 0;
        this.gaet = {};
        this.fejl = false;
        this.sv = false;
        this.faerdig = false;
        this.sejrT = null;
        this.skiftU = 0;
        this.startTrin(0);
    };

    P.startTrin = function (j) {
        this.trinNr = j;
        this.trin = this.trinListe[j];
        this.fase = this.trin.slags;
        this.valgt = null;
        this.forkert = {};
        this.groen = null;
        this.besked("", "");
        this.nulstilHjaelp();
        this.visKort();
        this.visListe();
        this.layout();
    };

    P.kortData = function () {
        var mig = this, t = this.trin, chip = "Trin " + (this.trinNr + 1) + " af " + this.trinListe.length;
        if (this.fase === "gaet") {
            return { slags: "spm", chip: chip + " · Gæt først", tekst: t.tekst,
                     svar: t.svar.map(function (s, j) { return { t: s, valgt: mig.valgt === j }; }) };
        }
        if (this.fase === "forsoeg") {
            if (this.koer) return { slags: "opgave", chip: chip, tekst: t.koerer };
            return { slags: "opgave", chip: chip, tekst: t.tekst,
                     ekstra: '<div class="sk-handling"><button type="button" class="knap blaa" data-udfoer="1">' + NK.html(t.knap) + "</button></div>" };
        }
        return { slags: "spm", chip: chip, tekst: t.tekst,
                 svar: t.svar.map(function (s, j) { return { t: s, valgt: mig.valgt === j, forkert: !!mig.forkert[j] }; }) };
    };

    P.skjulIndsend = function () { return this.fase === "forsoeg"; };
    P.skjulHint = function () { return this.fase === "forsoeg" || this.fase === "gaet"; };

    P.svarValg = function (j) {
        if (this.fase === "forsoeg") return;
        this.valgt = this.valgt === j ? null : j;
        this.visKort();
    };

    P.kanSendes = function () { return this.fase !== "forsoeg" && this.valgt !== null; };
    P.indsendTekst = function () {
        if (this.valgt === null) return "Indsend svar";
        if (this.fase === "gaet") return "Indsend svar: " + this.trin.svar[this.valgt];
        return "Indsend svar";
    };
    P.ingentingTekst = function () { return "Vælg et af svarene på kortet først."; };

    P.indsend = function () {
        if (this.fase === "gaet") {
            /* Et gaet er gratis: det bliver husket, og forsoeget kommer */
            this.gaet[this.trin.id] = this.valgt;
            this.startTrin(this.trinNr + 1);
            return;
        }
        this.bedoem(false);
    };

    P.bedoem = function (vist) {
        var t = this.trin;
        if (this.valgt !== t.rigtig) {
            this.fejl = true;
            var tekst = t.fejl[this.valgt];
            this.forkert[this.valgt] = true;
            this.valgt = null;
            this.visKort();
            this.fejlLinje(tekst);
            return;
        }
        var sidste = this.trinNr === this.trinListe.length - 1, tekst2 = t.forkl, foerste = false;
        if (sidste) {
            foerste = !this.status.loest;
            this.status.loest = true;
            this.status.stjerne = this.status.stjerne || (!this.fejl && !this.sv && !vist);
            this.gem();
            this.faerdig = true;
            if (foerste) tekst2 += " " + D.GREN_FAERDIG;
        }
        this.groen = { spm: true, svarNr: t.rigtig, maade: vist || this.sv ? "svar" : "selv", tekst: tekst2,
                       knap: sidste ? "Videre til Spyt og iod →" : "Næste trin →" };
        this.sejrT = 0;
        this.besked("", "");
        this.visKort();
        this.visListe();
        if (sidste && foerste) NK.konfettiRegn(NK.el("fane-g").querySelector(".scene"), 60);
    };

    P.videre = function () {
        if (this.trinNr < this.trinListe.length - 1) { this.startTrin(this.trinNr + 1); return; }
        if (NK.visFane) NK.visFane("fane-i");
    };

    P.forfra = function () {
        this.status = { loest: false, stjerne: false };
        this.gem();
        this.vaelg(0);
    };

    P.nulstil = function () { if (!this.groen && !this.koer) this.vaelg(0); };

    P.hintNu = function () {
        if (this.groen || this.fase !== "spm") return [];
        return this.trin.hint;
    };

    P.visSvar = function () {
        this.sv = true;
        this.valgt = this.trin.rigtig;
        this.bedoem(true);
    };

    /* ----- Kaploebet ------------------------------------------------------------------- */
    P.udfoer = function () {
        if (this.fase !== "forsoeg" || this.koer) return;
        var mig = this;
        this.koer = { t: 0, slut: null };
        this.mol.forEach(function (mol) {
            mol.enzymer = mig.ender(mol).map(function (i) { return { i: i, fra: i, u: 1, t: -STARTPAUSE, ude: 0, aktiv: true, ind: 0 }; });
            mol.antalEnder = mol.enzymer.length;
        });
        this.visKort();
    };

    P.opdaterScene = function (dt) {
        var mig = this;
        /* Fra haworthformlerne til de tre molekyler */
        this.skiftU = NK.mod(this.skiftU, this.trinNr >= 1 ? 1 : 0, 7, dt);
        this.flyv.forEach(function (f) { f.t += dt; });
        this.flyv = this.flyv.filter(function (f) { return f.t < FLYV; });
        this.mol.forEach(function (mol) { mol.enh.forEach(function (u) { if (u.klippet) u.kt += dt; }); });
        if (!this.koer) return;
        this.koer.t += dt;
        this.mol.forEach(function (mol) {
            mol.enzymer.forEach(function (z) {
                z.ind = Math.min(1, z.ind + dt / 0.35);
                if (!z.aktiv) { z.ude += dt / 0.4; return; }
                z.u = Math.min(1, z.u + dt / 0.18);
                z.t += dt;
                if (z.t < KLIP) return;
                z.t -= KLIP;
                /* Enzymet klipper sin enhed af */
                var u = mol.enh[z.i];
                u.klippet = true;
                u.kt = 0;
                mol.frigivet++;
                mig.flyv.push({ mol: mol, i: z.i, t: 0 });
                var p = u.p;
                var fri = p >= 0 && mol.enh[p].boern.every(function (b) { return mol.enh[b].klippet; });
                if (fri) { z.fra = z.i; z.i = p; z.u = 0; }
                else z.aktiv = false;
            });
            if (mol.frigivet === mol.enh.length && !mol.nr) { mig.placering++; mol.nr = mig.placering; }
        });
        if (this.mol.every(function (m) { return m.nr; })) {
            if (this.koer.slut === null) this.koer.slut = this.koer.t;
            if (this.koer.t - this.koer.slut > 0.9 && this.trin.id === "kaploeb") {
                this.koer = null;
                this.startTrin(this.trinNr + 1);
            }
        }
    };

    /* ----- Musen ------------------------------------------------------------------------- */
    P.overScene = function (pt) {
        if (this.fase === "forsoeg" && !this.koer && this.paaTavle(pt)) return "pointer";
        return null;
    };

    P.paaTavle = function (pt) {
        var t = this.lay && this.lay.tavle;
        return pt && t && pt.x > t.x && pt.x < t.x + t.b && pt.y > t.y && pt.y < t.y + t.h;
    };

    P.klikScene = function (pt) {
        if (this.spaer()) return;
        if (this.fase === "forsoeg" && !this.koer && this.paaTavle(pt)) { this.udfoer(); return; }
        this.kortBlink();
    };

    /* ----- Layout ------------------------------------------------------------------------ */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle;
        /* Trin 1: haworthformlerne (ca. 10,8 enheder bred og 5,2 hoej) */
        this.s1 = Math.round(NK.klamp(Math.min((t.b - 30) / 11.2, (t.h - 50) / 6.0), 24, 50));
        this.c1 = { x: t.x + t.b / 2 + 0.1 * this.s1, y: t.y + (t.h - 30) / 2 + 1.4 * this.s1 + 6 };
        /* Trin 2-4: tre raekker med navn, molekyle og taeller */
        var top = t.y + 34, rh = (t.h - 44) / 3;
        var navnB = NK.klamp(t.b * 0.15, 104, 140), taelB = NK.klamp(t.b * 0.2, 130, 200);
        var mx0 = t.x + navnB + 12, mx1 = t.x + t.b - taelB - 18;
        var L = Math.min((mx1 - mx0) / 16.5, (rh - 14) / (4 * 0.866 + 1.1), 30);
        this.gitter = { L: L, h: 0.36 * L, mx0: mx0, mx1: mx1, navnX: t.x + 16, taelX: t.x + t.b - taelB - 6, taelB: taelB };
        this.raekker = [0, 1, 2].map(function (k) { return { y: top + rh * (k + 0.5), top: top + rh * k, h: rh }; });
        this.saetAnker("mol", mx0 - 8, top, mx1 - mx0 + 16, rh * 3);
        this.saetAnker("tal", this.gitter.taelX - 6, top - 26, taelB + 6, rh * 3 + 26);
    };

    /* Skaermpladsen for enhed i i molekyle k */
    P.plads = function (k, i) {
        var g = this.gitter, mol = this.mol[k], u = mol.enh[i], r = this.raekker[k];
        if (mol.def.spiral) {
            var n = mol.enh.length, sp = D.spiralPunkt(i, g.h);
            var x0 = (g.mx0 + g.mx1) / 2 - (n - 1) * D.SPIRAL.dx * g.h / 2;
            return { x: x0 + sp.x, y: r.y + sp.y * 0.75, z: sp.z };
        }
        var bredde = mol.bredde || (mol.bredde = Math.max.apply(null, mol.enh.map(function (e) { return e.x; })));
        var x0b = (g.mx0 + g.mx1) / 2 - bredde * g.L / 2;
        return { x: x0b + u.x * g.L, y: r.y + u.y * g.L, z: 0 };
    };

    /* ----- Tegning --------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var t = lay.tavle;
        if (t.b < 160) return;          /* fanen er skjult og har ingen bredde */
        T.tavle(ctx, lay);
        if (this.skiftU < 0.99) {
            ctx.save(); ctx.globalAlpha = 1 - this.skiftU; this.tegnHaworth(ctx); ctx.restore();
        }
        if (this.skiftU > 0.01) {
            ctx.save(); ctx.globalAlpha = this.skiftU; this.tegnKaploeb(ctx); ctx.restore();
        }
        if (this.fase === "forsoeg" && !this.koer) {
            T.skilt(ctx, (this.gitter.mx0 + this.gitter.mx1) / 2, this.raekker[0].top + 6, "Klik: start enzymerne", { min: t.x + 4, maks: t.x + t.b - 4 });
        }
        this.tegnSejr(ctx, t);
    };

    /* Trin 1: et stykke amylopectin med en forgrening */
    P.tegnHaworth = function (ctx) {
        var s = this.s1, c = this.c1, AF = D.AFSTAND, t = this.lay.tavle;
        var pos = { A: [-AF, 0], B: [0, 0], C: [AF, 0], D: [-2.2, -2.75] };
        var r = {};
        var mig = this;
        var f = E.skrift(s);
        Object.keys(pos).forEach(function (id) {
            var X = c.x + pos[id][0] * s, Y = c.y + pos[id][1] * s;
            var sub = { 1: null, 4: null };
            if (id === "B") sub[6] = "CH₂";
            r[id] = E.enhed(ctx, { X: X, Y: Y, s: s, form: "alfa", sub: sub, tekst: 1, numre: id === "B" || id === "D" ? 1 : 0 });
        });
        /* Bindingerne i kaeden (α-1,4) */
        [["A", "B"], ["B", "C"]].forEach(function (p) {
            var a = r[p[0]].v[1], b = r[p[1]].v[4];
            E.bro(ctx, a, b, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 + 0.42 * s }, s, { gloed: true });
        });
        /* Kaederne fortsaetter */
        E.stump(ctx, r.A.v[4], -1, 1, s);
        E.stump(ctx, r.C.v[1], 1, 1, s);
        E.stump(ctx, r.D.v[4], -1, 1, s);
        /* Forgreningen: fra carbonatom 1 i D til carbonatom 6 i B (α-1,6) */
        var k6 = r.B.lab[6];
        var o6 = { x: k6.cx, y: k6.cy - 0.8 * s };
        var top6 = { x: k6.cx, y: k6.y - 2 };
        E.bro(ctx, r.D.v[1], top6, o6, s, { gloed: true });
        this.grenKasse = T.samlet([{ x: r.D.v[1].x - 8, y: r.D.v[1].y - 8, w: 16, h: 16 }, { x: o6.x - f * 0.6, y: o6.y - f * 0.6, w: f * 1.2, h: f * 1.2 }, k6]);
        if (this.fase === "spm" && this.trinNr === 0 && !this.groen) {
            var k = this.grenKasse;
            T.gulRamme(ctx, k.x - 10, k.y - 6, k.w + 20, k.h + 12, 10);
        }
        T.billedtekst(ctx, t.x + t.b / 2, t.y + t.h - 18, "Et stykke af amylopectin med en forgrening");
        void mig;
    };

    /* Trin 2-4: de tre molekyler, enzymerne og taellerne */
    P.tegnKaploeb = function (ctx) {
        var mig = this, g = this.gitter, t = this.lay.tavle;
        NK.tekst(ctx, "Frigivet glucose", g.taelX, t.y + 18, { font: "800 14px " + T.FONT, farve: T.BLAEK, linje: "middle" });
        /* Gaettet og det, der kom ud af det */
        var gi = this.gaet.gaet;
        if (gi !== undefined) {
            var tr = this.trinListe[1], vist = this.trinNr >= 3;
            var ok = vist ? gi === tr.rigtig : null;
            T.maerke(ctx, g.navnX, t.y + 18, "Dit gæt: " + tr.svar[gi], { fyld: ok === null ? "#fff8e1" : (ok ? "#e5f5ea" : "#fdecea"),
                kant: ok === null ? "#d69e0c" : (ok ? "#3fae72" : "#d9534f"), tegn: ok === null ? "" : (ok ? "✓" : "✗"), tegnFarve: ok ? "#2e8b57" : "#c0392b" });
        }
        this.mol.forEach(function (mol, k) {
            var r = mig.raekker[k];
            if (k > 0) {
                ctx.save();
                ctx.strokeStyle = "rgba(120, 132, 150, 0.22)";
                ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(t.x + 12, r.top); ctx.lineTo(t.x + t.b - 12, r.top); ctx.stroke();
                ctx.restore();
            }
            NK.tekst(ctx, mol.def.navn, g.navnX, r.y - 8, { font: "800 15px " + T.FONT, farve: T.BLAEK, linje: "middle" });
            if (mol.antalEnder) {
                NK.tekst(ctx, mol.antalEnder + (mol.antalEnder === 1 ? " enzym" : " enzymer"), g.navnX, r.y + 12,
                    { font: "600 13px " + T.FONT, farve: T.ENZYM, linje: "middle" });
            }
            mig.tegnMolekyle(ctx, k);
            /* Taelleren */
            var bb = g.taelB - 58;
            T.bjaelke(ctx, g.taelX, r.y - 5, bb, 10, mol.frigivet / mol.enh.length, "#e7a254");
            NK.tekst(ctx, String(mol.frigivet), g.taelX + bb + 10, r.y, { font: "800 17px " + T.FONT, farve: T.BLAEK, linje: "middle" });
            if (mol.nr) {
                NK.tekst(ctx, mol.nr + ". færdig", g.taelX, r.y + 20, { font: "700 13px " + T.FONT, farve: mol.nr === 1 ? "#2e8b57" : T.DAEMPET, linje: "middle" });
            }
            if (mig.fase === "spm" && mig.trinNr === 3 && !mig.groen && mol.def.id === mig.trin.om) {
                T.gulRamme(ctx, t.x + 6, r.top + 3, t.b - 12, r.h - 6, 10);
            }
        });
        /* De klippede enheder paa vej hen til taelleren */
        this.flyv.forEach(function (fl) {
            var k = mig.mol.indexOf(fl.mol), p = mig.plads(k, fl.i), r = mig.raekker[k];
            var u = NK.blod(fl.t / FLYV);
            var x = NK.lerp(p.x, g.taelX + (g.taelB - 58) * fl.mol.frigivet / fl.mol.enh.length, u);
            var y = NK.lerp(p.y, r.y, u) - Math.sin(u * Math.PI) * 14;
            E.hex(ctx, x, y, g.h * (1 - 0.3 * u), { alfa: 1 - u * 0.6 });
        });
    };

    P.tegnMolekyle = function (ctx, k) {
        var mol = this.mol[k], g = this.gitter, mig = this;
        var pl = mol.enh.map(function (u, i) { return mig.plads(k, i); });
        if (mol.def.spiral) { this.tegnSpiral(ctx, mol, pl); this.tegnEnzymer(ctx, mol, pl); return; }
        /* Bindingerne og enhederne i traeet */
        var ting = [];
        mol.enh.forEach(function (u, i) {
            ting.push({ z: pl[i].z, i: i, slags: "enhed" });
            if (u.p >= 0) ting.push({ z: (pl[i].z + pl[u.p].z) / 2 - 0.01, i: i, slags: "bro" });
        });
        ting.sort(function (a, b) { return a.z - b.z; });
        ting.forEach(function (ti) {
            var u = mol.enh[ti.i], p = pl[ti.i];
            var dyb = mol.def.spiral ? 0.45 + 0.55 * (p.z + 1) / 2 : 1;
            var vaek = u.klippet ? NK.klamp(u.kt / 0.25, 0, 1) : 0;
            if (ti.slags === "bro") {
                var q = pl[u.p];
                ctx.save();
                ctx.globalAlpha *= dyb * (1 - 0.82 * vaek);
                ctx.strokeStyle = T.BRUN;
                ctx.lineWidth = Math.max(1.4, g.h * 0.32);
                ctx.lineCap = "round";
                ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(p.x, p.y); ctx.stroke();
                ctx.restore();
                return;
            }
            if (vaek > 0) {
                /* En klippet enhed: kun et svagt omrids er tilbage */
                ctx.save();
                ctx.globalAlpha *= dyb * (1 - vaek) + 0.22 * vaek;
                if (vaek < 1) E.hex(ctx, p.x, p.y, g.h * (1 + 0.25 * vaek), { alfa: 1 });
                else E.hex(ctx, p.x, p.y, g.h, { alfa: 1, lys: "#f4ede4", moerk: "#e9dfd2", kant: "#c9b8a4" });
                ctx.restore();
                return;
            }
            E.hex(ctx, p.x, p.y, g.h * (mol.def.spiral ? 1 + 0.12 * p.z : 1), { alfa: dyb });
        });
        this.tegnEnzymer(ctx, mol, pl);
    };

    /* Hvor synlig en klippet enhed er (0 = hel, 1 = klippet af for laengst) */
    function vaek(u) { return u.klippet ? NK.klamp(u.kt / 0.25, 0, 1) : 0; }

    /* Amylose som spiral: roeret og sekskanterne, det bagerste foerst */
    P.tegnSpiral = function (ctx, mol, pl) {
        var g = this.gitter;
        var pts = pl.map(function (p, i) {
            var u = mol.enh[i], nxt = mol.enh[i + 1];
            return { x: p.x, y: p.y, z: p.z, a: nxt ? 1 - 0.8 * vaek(nxt) : 1 };
        });
        var n = mol.enh.length, r = this.raekker[this.mol.indexOf(mol)], x0 = (g.mx0 + g.mx1) / 2 - (n - 1) * D.SPIRAL.dx * g.h / 2;
        var bane = function (i, u) { var sp = D.spiralPunkt(i + u, g.h); return { x: x0 + sp.x, y: r.y + sp.y * 0.75, z: sp.z }; };
        ["bag", "for"].forEach(function (lag) {
            E.roer(ctx, pts, { w: Math.max(2, g.h * 0.42), lag: lag, bane: bane });
            pl.forEach(function (p, i) {
                if ((p.z < 0) !== (lag === "bag")) return;
                var u = mol.enh[i], v = vaek(u), dyb = 0.6 + 0.4 * (p.z + 1) / 2;
                if (v >= 1) { E.hex(ctx, p.x, p.y, g.h, { alfa: 0.22, lys: "#f4ede4", moerk: "#e9dfd2", kant: "#c9b8a4" }); return; }
                E.hex(ctx, p.x, p.y, g.h * (1 + 0.12 * p.z + 0.25 * v), { alfa: dyb * (1 - v) + 0.22 * v });
            });
        });
    };

    /* Enzymerne sidder paa enderne */
    P.tegnEnzymer = function (ctx, mol, pl) {
        var g = this.gitter;
        mol.enzymer.forEach(function (z) {
            var a = z.ind * (1 - NK.klamp(z.ude, 0, 1));
            if (a < 0.01) return;
            var u = mol.enh[z.i], p = pl[z.i], q = u.p >= 0 ? pl[u.p] : { x: p.x - 10, y: p.y };
            /* Enzymet sidder paa enheden og vender lommen mod kaeden */
            var dx = p.x - q.x, dy = p.y - q.y, l = Math.sqrt(dx * dx + dy * dy) || 1;
            var nx = dx / l, ny = dy / l;
            var fra = pl[z.fra] || p, w = NK.blod(z.u);
            var x = NK.lerp(fra.x, p.x, w) + nx * g.h * 1.25, y = NK.lerp(fra.y, p.y, w) + ny * g.h * 1.25;
            var klip = z.aktiv ? NK.klamp(z.t / KLIP, 0, 1) : 1;
            T.enzym(ctx, x, y, g.h * 1.05, Math.atan2(-ny, -nx), { alfa: a, mund: 0.4 + 0.6 * Math.abs(Math.cos(klip * Math.PI)) });
        });
    };

    NK.SimGren = SimGren;
}());
