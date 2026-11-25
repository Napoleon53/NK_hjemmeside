/* =====================================================================
   sim_profil.js - fane 1: Læs energiprofilen

   Energiprofilen for NO₂ + CO → NO + CO₂ paa et lyst ark som bogens
   figur. Opgave 1 bygger profilen op trin for trin (reaktanter,
   produkter, det aktiverede kompleks, pilen for Eₐ, Eₐ i kJ/mol, exoterm
   eller endoterm). Opgave 2 spejler profilen: den modsatte vej har samme
   bakke, men Eₐ = 360 kJ/mol og ΔH = +226 kJ/mol.
   Hvert loest trin faar noget frem i scenen (regel 13). Under et
   spoergsmaal kan intet i scenen klikkes (regel 19a); et klik faar
   kortet til at blinke. I Fri leg kan toppen og produkterne traekkes.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK, D = NK.D, T = NK.T, F = NK.T.F;

    function s(v) { return v <= 0 ? 0 : (v >= 1 ? 1 : (1 - Math.cos(Math.PI * v)) / 2); }

    /* Energien langs reaktionens forloeb, u fra 0 til 1 */
    function energi(p, u) {
        if (u < 0.5) return p.Er + (p.Et - p.Er) * s((u - 0.22) / 0.28);
        return p.Ep + (p.Et - p.Ep) * (1 - s((u - 0.5) / 0.28));
    }

    var UA = 0.1, UB = 0.5, UC = 0.9;

    function SimProfil() {
        var mig = this;
        this.canvas = NK.el("profil-laerred");
        this.l = new NK.Laerred(this.canvas);
        this.skema = NK.el("profil-skema");
        this.retning = null;
        this.flip = 0;
        this.fri = false;
        this.p = { Er: 0, Et: 134, Ep: -226 };
        this.termo = 0.45;
        this.zoneH = 0;
        this.traek = null;
        this.tid = 0;

        this.canvas.addEventListener("pointerdown", function (e) { mig.ned(e); });
        this.canvas.addEventListener("pointermove", function (e) { mig.flyt(e); });
        window.addEventListener("pointerup", function () { mig.traek = null; });

        this.m = new NK.Motor("profil", D.OPGAVER_PROFIL, this, {
            videreTekst: "Videre til Temperaturen",
            videreFane: "fane-temp",
            friTekst: "Træk i toppen og i produkterne, og se Eₐ og ΔH ændre sig."
        });
    }

    var P = SimProfil.prototype;

    /* ----- Motoren kalder ---------------------------------------------------- */
    P.scene = function (m) {
        this.m = m;
        var ret = this.fri ? "fri" : D.OPGAVER_PROFIL[m.o].retning;
        if (this.retning && ret !== this.retning && ret !== "fri" && this.retning !== "fri") {
            this.flip = 0.0001;
            this.flipFra = this.retning;
        }
        this.retning = ret;
        if (ret !== "fri") {
            var d = D.PROFIL[ret];
            this.p = { Er: d.Er, Et: d.Et, Ep: d.Ep };
        }
        this.tid = 0;
    };

    P.friLeg = function (til) {
        this.fri = til;
        this.retning = til ? "fri" : null;
        if (til) {
            var d = D.PROFIL.frem;
            this.p = { Er: d.Er, Et: d.Et, Ep: d.Ep };
        }
        this.flip = 0;
    };

    P.paaMaal = function () { return false; };

    /* ----- Hvad scenen viser lige nu ----------------------------------------- */
    P.vis = function () {
        var m = this.m, o = m.o, L = function (k) { return m.trinLoest(o, k); };
        var tr = m.trin(), om = m.fase() === "spm" ? tr.om : null;
        if (this.fri) {
            return { fri: true, reakt: true, prod: true, kompl: true, tal: true, eaPil: true, eaTal: true, dH: true, om: null };
        }
        if (D.OPGAVER_PROFIL[o].retning === "frem") {
            return {
                bogstaver: !L(2), reakt: L(0), prod: L(1), kompl: L(2), pile: om === "pile",
                eaPil: L(3), tal: L(3), eaTal: L(4), dH: L(5), om: om
            };
        }
        return {
            bogstaver: !L(0), reakt: L(0), prod: L(0), kompl: true, tal: true,
            eaPil: L(1), eaTal: L(1), dH: L(2), begge: om === "begge" || L(3), om: om
        };
    };

    /* ----- Layout --------------------------------------------------------------- */
    P.tilpas = function () {
        var ny = this.l.tilpas();
        if (ny || !this.zoneH) this.layout();
    };

    P.layout = function () {
        var maalt = this.m.maalKort();
        if (maalt) this.zoneH = maalt;
        var zone = this.m.kort.zone([150, 130], this.zoneH || undefined);
        var W = this.l.b, H = this.l.h;
        this.skema.style.top = (zone + 2) + "px";
        var top = zone + 44;
        var pb = Math.min(W - 28, 1000), ph = Math.max(260, H - top - 14);
        var x = Math.round((W - pb) / 2);
        this.g = {
            x: x, y: top, b: pb, h: ph,
            x0: x + 92, x1: x + pb - 150,
            y0: top + 14, y1: top + ph - 44
        };
        var g = this.g;
        g.s = NK.klamp(Math.min(pb / 26, ph / 11), 24, 42);   /* bindingslaengden i molekylerne */
        g.top = g.y0 + g.s * 2.6;                             /* toppen af bakken */
        g.bund = g.y1 - g.s * 1.7;                            /* den laveste plateau */
        var a = NK.el("profil-anker-profil");
        a.style.left = g.x + "px"; a.style.top = g.y + "px"; a.style.width = g.b + "px"; a.style.height = g.h + "px";
        var t = NK.el("profil-anker-termo");
        t.style.left = (g.x1 + 50) + "px"; t.style.top = (g.y0 + 60) + "px"; t.style.width = "90px"; t.style.height = (g.h * 0.55) + "px";
    };

    /* Energiens omfang paa aksen: fast i opgaverne, bredere i Fri leg */
    P.omfang = function () {
        return this.fri ? { min: -300, max: 400 } : { min: -226, max: 134 };
    };

    P.yE = function (E) {
        var g = this.g, o = this.omfang();
        return g.bund - (E - o.min) / (o.max - o.min) * (g.bund - g.top);
    };

    P.Ey = function (y) {
        var g = this.g, o = this.omfang();
        return o.min + (g.bund - y) / (g.bund - g.top) * (o.max - o.min);
    };

    P.xU = function (u, skala) {
        var g = this.g, cx = (g.x0 + g.x1) / 2;
        var x = g.x0 + 24 + u * (g.x1 - g.x0 - 48);
        return cx + (x - cx) * (skala === undefined ? 1 : skala);
    };

    /* ----- Mus: Fri leg traekker i toppen og produkterne ---------------------- */
    P.handtag = function () {
        return [
            { hvad: "Et", x: this.xU(UB), y: this.yE(this.p.Et) },
            { hvad: "Ep", x: this.xU(UC), y: this.yE(this.p.Ep) }
        ];
    };

    P.ned = function (e) {
        var pt = this.l.punkt(e);
        if (this.fri) {
            var h = this.handtag().filter(function (k) { return Math.abs(k.x - pt.x) < 40 && Math.abs(k.y - pt.y) < 26; })[0];
            if (h) { this.traek = h.hvad; this.canvas.setPointerCapture(e.pointerId); }
            return;
        }
        this.m.sceneKlik();
    };

    P.flyt = function (e) {
        var pt = this.l.punkt(e);
        if (this.fri && !this.traek) {
            var over = this.handtag().some(function (k) { return Math.abs(k.x - pt.x) < 40 && Math.abs(k.y - pt.y) < 26; });
            this.canvas.style.cursor = over ? "grab" : "";
        }
        if (!this.traek) return;
        this.canvas.style.cursor = "grabbing";
        var E = Math.round(this.Ey(pt.y) / 2) * 2;
        if (this.traek === "Ep") this.p.Ep = NK.klamp(E, -300, 300);
        else this.p.Et = NK.klamp(E, 0, 400);
        this.p.Et = Math.max(this.p.Et, Math.max(this.p.Er, this.p.Ep) + 10);
    };

    /* ----- Tid ------------------------------------------------------------------- */
    P.opdater = function (dt) {
        this.tid += dt;
        if (this.flip > 0) {
            this.flip += dt / 0.9;
            if (this.flip >= 1) this.flip = 0;
        }
        var v = this.vis(), maal = 0.45;
        if (v.dH) maal = this.p.Ep < this.p.Er ? 0.82 : (this.p.Ep > this.p.Er ? 0.12 : 0.45);
        this.termo = NK.mod(this.termo, maal, 2.2, dt);
        this.m.opdater(dt);
    };

    /* ----- Tegning ---------------------------------------------------------------- */
    P.tegn = function () {
        var l = this.l, c = l.ctx, g = this.g;
        l.ryd("#14141a");
        if (!g) return;
        var v = this.vis();
        var ret = this.retning === "fri" ? null : D.PROFIL[this.retning];
        NK.saetHTML("profil-skema", this.fri ? "reaktanter → produkter" :
            ret.venstre + " → " + ret.hoejre);

        T.papir(c, g.x, g.y, g.b, g.h);
        T.flade(c, g.x0, g.y0 + 18, g.x1 + 30 - g.x0, g.y1 - g.y0 - 18);
        this.akser(c, v);

        /* Spejlingen mellem opgave 1 og 2: profilen klappes om */
        if (this.flip > 0) {
            var f = this.flip, gammel = D.PROFIL[this.flipFra];
            if (f < 0.5) this.kurve(c, gammel, Math.cos(Math.PI * f));
            else this.kurve(c, this.p, -Math.cos(Math.PI * f));
            return;
        }
        this.kurve(c, this.p, 1);
        this.niveauer(c, v);
        this.pile(c, v);
        this.etiketter(c, v, ret);
        if (v.dH) this.termometer(c);
        if (v.bogstaver) this.bogstaver(c, v);
        if (this.fri) this.handtagTegn(c);
    };

    P.akser = function (c, v) {
        var g = this.g;
        T.pil(c, g.x0, g.y1, g.x0, g.y0, F.daempet, 2);
        T.pil(c, g.x0, g.y1, g.x1 + 40, g.y1, F.daempet, 2);
        T.tekst(c, v.tal ? "Energi (kJ/mol)" : "Energi", g.x0 + 10, g.y0 + 12, { px: 15, farve: F.blaek });
        T.tekst(c, "Reaktionens forløb", g.x1 + 40, g.y1 + 28, { px: 15, just: "right", farve: F.blaek });
    };

    P.kurve = function (c, p, skala) {
        var g = this.g, mig = this, n = 120, i, u;
        c.save();
        c.beginPath();
        c.moveTo(this.xU(0, skala), g.y1);
        for (i = 0; i <= n; i++) { u = i / n; c.lineTo(mig.xU(u, skala), mig.yE(energi(p, u))); }
        c.lineTo(this.xU(1, skala), g.y1);
        c.closePath();
        c.fillStyle = T.fyld(c, this.yE(p.Et), g.y1);
        c.fill();
        c.beginPath();
        for (i = 0; i <= n; i++) {
            u = i / n;
            if (i === 0) c.moveTo(mig.xU(u, skala), mig.yE(energi(p, u)));
            else c.lineTo(mig.xU(u, skala), mig.yE(energi(p, u)));
        }
        T.kurveStreg(c);
        c.restore();
    };

    /* De stiplede niveauer og tallene paa aksen */
    P.niveauer = function (c, v) {
        var g = this.g, p = this.p, mig = this;
        var yr = this.yE(p.Er), yt = this.yE(p.Et), yp = this.yE(p.Ep);
        if (v.tal || v.pile || v.eaPil) {
            T.stiplet(c, g.x0, yt, this.xU(UB) - 10, yt);
            T.stiplet(c, this.xU(UB) + 10, yt, g.x1 + 10, yt);
        }
        if (v.tal || v.pile || v.dH) {
            T.stiplet(c, this.xU(0.3), yr, g.x1 + 46, yr);
            T.stiplet(c, this.xU(0.62), yp, g.x1 + 46, yp);
        }
        if (!v.tal) return;
        [[p.Er, yr], [p.Et, yt], [p.Ep, yp]].forEach(function (n) {
            T.stiplet(c, g.x0, n[1], mig.xU(0.06), n[1]);
            T.tekst(c, n[0] > 0 ? String(n[0]) : NK.fortegn(n[0]), g.x0 - 9, n[1] + 5,
                { px: 15, just: "right", farve: F.blaek, vaegt: 600 });
        });
    };

    P.pile = function (c, v) {
        var g = this.g, p = this.p;
        var yr = this.yE(p.Er), yt = this.yE(p.Et), yp = this.yE(p.Ep);
        var xa = this.xU(0.34), xb = this.xU(0.66), xc = g.x1 + 30;
        if (v.pile) {
            /* Tre pile i samme farve; numrene har gule ringe */
            var nr = [[xa, yr, yt, "1"], [xb, yp, yt, "2"], [xc, yr, yp, "3"]];
            nr.forEach(function (n) {
                T.pil(c, n[0], n[1], n[0], n[2], "#33494a", 2.6);
                var my = (n[1] + n[2]) / 2;
                c.save();
                c.beginPath();
                c.arc(n[0], my, 14, 0, Math.PI * 2);
                c.fillStyle = "#ffffff";
                c.fill();
                c.strokeStyle = "#33494a";
                c.lineWidth = 1.5;
                c.stroke();
                c.restore();
                T.tekst(c, n[3], n[0], my + 1, { px: 15, just: "center", linje: "middle", vaegt: 700 });
                T.ring(c, n[0], my, 20);
            });
            return;
        }
        if (v.eaPil) {
            T.pil(c, xa, yr, xa, yt, F.ea, 2.8);
            var tekst = this.fri ? "Eₐ = " + (p.Et - p.Er) + " kJ/mol" :
                (v.eaTal ? "Eₐ = " + (p.Et - p.Er) + " kJ/mol" : "aktiveringsenergi, Eₐ");
            T.tekst(c, tekst, xa - 12, yt - 10, { px: 16, just: "right", farve: F.ea, vaegt: 700, bund: "rgba(251,250,246,0.9)" });
            if (v.om === "Ea") T.gulRamme(c, xa - 12, yt - 6, 24, yr - yt + 12);
        }
        if (v.begge) {
            T.pil(c, xb, yp, xb, yt, F.ea, 2.2);
            T.tekst(c, "Eₐ = " + (p.Et - p.Ep) + " kJ/mol", xb + 12, yt - 10,
                { px: 15, farve: F.ea, vaegt: 600, bund: "rgba(251,250,246,0.9)" });
            if (v.om === "begge") {
                T.gulRamme(c, xa - 12, yt - 6, 24, yr - yt + 12);
                T.gulRamme(c, xb - 12, yt - 6, 24, yp - yt + 12);
            }
        }
        if (v.dH && p.Ep !== p.Er) {
            var farve = p.Ep < p.Er ? F.afgiv : F.optag;
            T.pil(c, xc, yr, xc, yp, farve, 2.6);
            /* Teksten staar ved pilens begyndelse, saa den ikke rammer produkternes molekyler */
            T.tekst(c, "ΔH = " + NK.fortegn(p.Ep - p.Er) + " kJ/mol", xc - 8, p.Ep < p.Er ? yr + 24 : yr - 10,
                { px: 15, just: "right", farve: farve, vaegt: 700, bund: "rgba(251,250,246,0.9)" });
        }
    };

    /* Molekylerne og navnene ved reaktanter, top og produkter */
    P.etiketter = function (c, v, ret) {
        var g = this.g, p = this.p, sB = g.s;
        var xr = this.xU(UA), xp = this.xU(UC), xt = this.xU(UB);
        var yr = this.yE(p.Er), yt = this.yE(p.Et), yp = this.yE(p.Ep);
        var venstre = ret ? ret.venstre : "", hoejre = ret ? ret.hoejre : "";
        var mol = { "NO₂ + CO": ["NO₂", "CO"], "NO + CO₂": ["NO", "CO₂"] };
        var mig = this;
        function plads(navne, x) {
            var b = T.molBredde(navne[0], sB) + T.molBredde(navne[1], sB) + sB * 0.9;
            return NK.klamp(x, g.x0 + 14 + b / 2, g.x1 + 10 - b / 2);
        }
        function side(vis, formel, navn, x, y, skub) {
            if (!vis) return;
            if (!mig.fri) {
                /* Molekylerne skubbes ud mod kanten, væk fra pilene ved bakken */
                var n = mol[formel], cx = plads(n, x + skub);
                T.par(c, n[0], n[1], cx, y - sB * 1.45, sB);
            }
            T.tekst(c, navn, x, y + 24, { px: 15, just: "center", farve: F.blaek, vaegt: 600 });
        }
        side(v.reakt, venstre, "reaktanter", xr + 30, yr, -60);
        side(v.prod, hoejre, "produkter", this.xU(0.8), yp, 120);
        if (v.kompl) {
            var ks = sB * 0.86, kh = 0;
            if (!this.fri) kh = T.kompleks(c, xt, yt - ks * 1.3, ks);
            T.tekst(c, "aktiveret kompleks", xt + (this.fri ? 0 : kh + 8), yt - (this.fri ? 14 : ks * 1.3 - 5),
                { px: 15, just: this.fri ? "center" : "left", farve: F.blaek, vaegt: 600 });
        }
        if (v.om === "niveauer") {
            T.ring(c, xr, yr, 24);
            T.ring(c, xp, yp, 24);
        }
    };

    /* A, B og C paa kurven, til de tre steder har faaet deres navne */
    P.bogstaver = function (c, v) {
        var p = this.p, mig = this;
        [["A", UA, p.Er], ["B", UB, p.Et], ["C", UC, p.Ep]].forEach(function (b) {
            var x = mig.xU(b[1]), y = mig.yE(b[2]);
            if (b[0] === "B" && v.kompl) return;
            c.save();
            c.beginPath();
            c.arc(x, y, 15, 0, Math.PI * 2);
            c.fillStyle = "#ffffff";
            c.fill();
            c.strokeStyle = F.blaek;
            c.lineWidth = 2;
            c.stroke();
            c.restore();
            T.tekst(c, b[0], x, y + 1, { px: 16, just: "center", linje: "middle", vaegt: 700 });
            if (v.om === "punkter" || (v.om === "B" && b[0] === "B")) T.ring(c, x, y, 21);
        });
    };

    P.termometer = function (c) {
        var g = this.g, x = g.x1 + 95, y = g.y0 + 44, h = Math.max(110, (g.y1 - g.y0) * 0.55);
        var exo = this.p.Ep < this.p.Er, endo = this.p.Ep > this.p.Er;
        var farve = exo ? F.afgiv : (endo ? F.optag : "#8a9799");
        T.termometer(c, x, y, h, this.termo);
        T.tekst(c, "omgivelserne", x, y + h + 34, { px: 14, just: "center", farve: F.daempet });
        var ord = exo ? "bliver varmere" : (endo ? "bliver koldere" : "");
        if (ord) T.tekst(c, ord, x, y + h + 52, { px: 14, just: "center", farve: farve, vaegt: 700 });
        if (this.fri && (exo || endo)) T.tekst(c, exo ? "exoterm" : "endoterm", x, y - 12, { px: 15, just: "center", farve: farve, vaegt: 700 });
    };

    P.handtagTegn = function (c) {
        this.handtag().forEach(function (h) {
            c.save();
            c.beginPath();
            c.arc(h.x, h.y, 13, 0, Math.PI * 2);
            c.fillStyle = "#ffdf6b";
            c.fill();
            c.strokeStyle = F.gulMoerk;
            c.lineWidth = 2;
            c.stroke();
            c.restore();
            T.tekst(c, "↕", h.x, h.y + 1, { px: 15, just: "center", linje: "middle", vaegt: 700, farve: "#33290a" });
        });
    };

    /* ----- app.js kalder ------------------------------------------------------------ */
    P.fokus = function () {};
    P.nulstil = function () { this.m.forfra(); };
    P.enter = function () {
        var f = this.m.fase();
        if (f === "bliv" || f === "loest" || f === "faerdig") this.m.videre();
        else this.m.indsend();
    };

    NK.SimProfil = SimProfil;
}());
