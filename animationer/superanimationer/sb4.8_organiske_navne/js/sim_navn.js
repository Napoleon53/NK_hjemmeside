/* =====================================================================
   sim_navn.js - fane 1: Giv navnet

   Molekylet staar paa whiteboardet som zigzagformel, tegnet af
   molekylemotoren. Eleven bygger navnet i bogens raekkefoelge (afsnit
   B3.1): stammen, nummereringen, endelsen og forleddet. Hvert trin er
   ét valg mellem brikker paa kortet eller ét klik i formlen, og svaret
   bliver staaende i navnet paa kortet.

   Formlen viser to ting, og de maa ikke forveksles (brugeren 10. okt.
   2026: den svage elev tror, at det, der er fremhaevet, hoerer til det
   spoergsmaal, der staar paa kortet):
     * GULT er det, kortet spoerger om lige nu (fokusNu): gruppen under
       endelsen, sidegruppen under forleddet, den ene del af en ester.
       Det er den samme gule som den plads i navnet, eleven er ved.
     * Et svar, eleven har givet, faar kun navnedelens farve paa stregerne
       og bogstaverne, uden baggrund: hovedkaeden blaa (stamme), gruppen
       groen (endelse) og sidegruppen orange (forled). For en ester er
       syrens del groen og alkoholens del orange, som i bogens figur.
   Foerst naar navnet er faerdigt, faar delene en farvet baggrund.

   Trinene, svarmulighederne og forklaringerne kommer fra js/kemi.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var F = NK.Fane;

    function SimNavn() {
        this.stoffer = {};
        this.startFane();
    }

    var P = SimNavn.prototype;
    F.paa(P, { navn: "n", naesteFane: "fane-t", naesteNavn: "Tegn molekylet" });

    /* ----- Opgaverne ------------------------------------------------------------ */
    P.lavOpgaver = function (aktive) {
        var raekke = D.KLASSER.map(function (k) { return k.id; });
        return D.STOFFER.filter(function (o) { return o.fane === "n" && aktive.indexOf(o.k) >= 0; })
            .map(function (o, i) { return { id: o.navn, niv: o.niv, o: o, i: i }; })
            .sort(function (a, b) {
                if (a.niv !== b.niv) return a.niv - b.niv;
                /* Inden for et niveau skiftes stofklasserne, saa de ikke kommer i klumper */
                var ia = raekke.indexOf(a.o.k), ib = raekke.indexOf(b.o.k);
                return ia !== ib ? ia - ib : a.i - b.i;
            });
    };

    P.nyOpgave = function (opg) {
        if (!this.stoffer[opg.id]) this.stoffer[opg.id] = K.stof(opg.o);
        this.stof = this.stoffer[opg.id];
        this.trin = K.trin(this.stof, this.aktive);
        this.ti = 0;
        this.fyldt = {};
        this.forkert = {};
        this.vis = {};
        this.hintVis = {};
        this.lok = null;
        this.over = null;
        this.fejlAtom = null;
        this.bygTegning();
    };

    /* Stofklasserne er skiftet midt i en opgave: endelserne at vaelge imellem foelger med */
    P.aktiveSkiftet = function () {
        if (!this.stof || this.faerdig) return;
        this.trin = K.trin(this.stof, this.aktive);
        this.forkert = {};
    };

    P.trinNu = function () { return this.trin[this.ti]; };

    /* ----- Kortet ------------------------------------------------------------------ */
    P.dele = function () {
        var mig = this, t = this.faerdig ? null : this.trinNu();
        return this.stof.dele.map(function (d) {
            var f = mig.faerdig ? true : mig.fyldt[d.type];
            return { type: d.type, tekst: d.tekst, fyldt: !!f, vist: f === "vist", aktiv: !!t && t.del === d.type };
        });
    };

    P.visTekst = function (t, v) { return t.somEndelse ? K.medStreg(v) : v; };

    P.kortData = function () {
        var mig = this, t = this.trinNu(), m = this.trin.length;
        var k = {
            slags: t.slags === "valg" ? "spm" : "opgave",
            chip: m > 1 ? "Trin " + (this.ti + 1) + " af " + m : "Opgave " + (this.nr + 1),
            tekst: t.tekst,
            ekstra: F.navnHTML(this.dele(), { foran: "Navnet:" })
        };
        if (t.slags === "valg") {
            k.svar = t.valg.map(function (v, j) {
                return { t: mig.visTekst(t, v), klasse: mig.forkert[j] ? "forkert" : "", laast: !!mig.forkert[j] };
            });
        }
        return k;
    };

    P.slutEkstra = function () {
        return F.navnHTML(this.dele(), { stor: true });
    };

    /* ----- Svarene -------------------------------------------------------------------- */
    P.svarValg = function (j) {
        var t = this.trinNu();
        if (!t || t.slags !== "valg" || this.forkert[j]) return;
        var v = t.valg[j];
        if (v === t.rigtig) { this.trinKlaret(false); return; }
        this.forkert[j] = true;
        this.visKort();
        this.fejlLinje(t.fejl(v));
    };

    /* Trinnet er klaret: svaret bliver staaende i navnet, formlen faar farve, og
       det naeste trin kommer. vist: hjaelpeknappen gjorde det. */
    P.trinKlaret = function (vist, klikId) {
        var t = this.trinNu();
        if (t.del) this.fyldt[t.del] = vist ? "vist" : true;
        if (t.fyldOgsaa) this.fyldt[t.fyldOgsaa] = true;
        if (t.vis) this.vis[t.vis] = true;
        if (t.vis === "numre") this.lok = K.lokanter(this.stof, klikId);
        this.hintVis = {};
        this.forkert = {};
        this.fejlAtom = null;
        this.ti++;
        this.bygTegning();
        if (this.ti >= this.trin.length) {
            this.afslut();
            return;
        }
        this.nulstilHjaelp();
        if (vist) this.besked("", "");
        else this.godLinje("");
        this.visKort();
    };

    P.afslut = function () {
        var s = this.stof;
        /* Det hele faar farve, naar navnet er faerdigt */
        if (s.klasse === "ester") this.vis.esterdele = true;
        else if (s.klasse === "amin") this.vis.gruppe = true;
        else {
            this.vis.kaede = this.vis.gruppe = true;
            if (s.forled) this.vis.side = true;
            if (s.medTal && !this.lok) this.lok = K.lokanter(s);
            if (s.medTal) this.vis.numre = true;
        }
        this.loest("selv", K.forklaring(s), s.navn + ".");
        this.bygTegning();      /* efter loest: nu kommer delenes farvede baggrund med */
    };

    P.hintNu = function () { return this.faerdig ? [] : this.trinNu().hint; };

    P.efterHint = function (n) {
        var hv = this.trinNu().hintVis;
        if (hv && hv[n - 1]) { this.hintVis[hv[n - 1]] = true; this.bygTegning(); }
    };

    P.visSvar = function () {
        var t = this.trinNu(), id;
        if (t.slags === "klik") id = Number(Object.keys(t.ok)[0]);
        this.trinKlaret(true, id);
    };

    /* ----- Layout og tegningen ---------------------------------------------------------- */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle;
        this.saetAnker("tavle", t.x, t.y, t.b, t.h);
        this.bygTegning();
    };

    /* Hvilke dele af formlen har faaet farve? a og b: atomernes og bindingernes
       farve (elevens svar). gl: den farvede baggrund bag delene; den kommer
       foerst, naar navnet er faerdigt, saa den aldrig staar samtidig med et
       spoergsmaal om noget andet. */
    P.farver = function () {
        var s = this.stof, vis = this.vis, a = {}, b = {}, gl = [], slut = !!this.faerdig;
        function kant(x, y) { return x < y ? x + "-" + y : y + "-" + x; }
        function maal(maengde, farve, medBindinger) {
            s.mol.bindinger.forEach(function (bd) {
                if (maengde[bd.a] && maengde[bd.b]) b[kant(bd.a, bd.b)] = farve;
                else if (medBindinger && (maengde[bd.a] || maengde[bd.b])) b[kant(bd.a, bd.b)] = farve;
            });
            Object.keys(maengde).forEach(function (id) { if (s.mol.atom(Number(id)).el !== "C") a[id] = farve; });
        }
        if (s.klasse === "ester") {
            if (vis.esterdele) {
                var syre = {}, alk = {};
                Object.keys(s.syreAtomer).forEach(function (id) { syre[id] = true; });
                syre[s.gruppe.atomer[1]] = true;             /* =O hoerer til syrens del */
                Object.keys(s.alkAtomer).forEach(function (id) { alk[id] = true; });
                maal(syre, D.DELE.syre.blaek, false);
                maal(alk, D.DELE.alkohol.blaek, false);
                /* Bindingen fra det enkeltbundne O ud til alkoholens del er orange */
                var o1 = s.gruppe.o;
                s.mol.naboer(o1).forEach(function (x) { if (alk[x]) b[kant(o1, x)] = D.DELE.alkohol.blaek; });
                if (slut) gl.push([syre, D.DELE.syre.blaek], [alk, D.DELE.alkohol.blaek]);
            }
            return { a: a, b: b, gl: gl };
        }
        var kaede = {};
        s.kaede.forEach(function (id) { kaede[id] = true; });
        if (vis.kaede) {
            if (s.klasse !== "amin") { maal(kaede, D.DELE.stamme.blaek, false); if (slut) gl.push([kaede, D.DELE.stamme.blaek]); }
        }
        if (vis.side) {
            s.sub.forEach(function (x) {
                var m = {};
                x.atomer.forEach(function (id) { m[id] = true; });
                maal(m, D.DELE.forled.blaek, true);
                if (slut) gl.push([m, D.DELE.forled.blaek]);
            });
        }
        if (vis.gruppe) {
            var g = {};
            s.gruppe.atomer.forEach(function (id) { if (s.mol.atom(id).el !== "C") g[id] = true; });
            maal(g, D.DELE.endelse.blaek, true);
            if (slut) gl.push([g, D.DELE.endelse.blaek]);
        }
        return { a: a, b: b, gl: gl };
    };

    /* Det i formlen, kortets spoergsmaal handler om lige nu: de atomer, der skal
       have gul baggrund. null: spoergsmaalet handler om hele formlen. */
    P.fokusNu = function () {
        if (this.faerdig || !this.stof) return null;
        var s = this.stof, mol = s.mol, t = this.trinNu(), m = {};
        if (!t) return null;
        var om = t.om || (this.hintVis.kaede ? "kaede" : null);
        if (!om) return null;
        function med(id) { m[id] = true; }
        if (om === "kaede") s.kaede.forEach(med);
        else if (om === "gruppe") {
            /* Gruppen og det carbonatom, den sidder paa */
            s.gruppe.atomer.forEach(med);
            if (s.gruppe.c !== null) med(s.gruppe.c);
        } else if (om === "side") {
            /* Sidegruppen og det carbonatom i kaeden, den sidder paa */
            s.sub.forEach(function (x) {
                x.atomer.forEach(function (id) {
                    med(id);
                    mol.naboer(id).forEach(function (n) { if (s.kaede.indexOf(n) >= 0) med(n); });
                });
            });
        } else if (om === "alkohol") {
            /* Kun de carbonatomer, der skal taelles: oxygenatomerne er ikke gule */
            Object.keys(s.alkAtomer).forEach(med);
        } else if (om === "syre") {
            Object.keys(s.syreAtomer).forEach(med);
        } else if (om === "kvaelstof") med(s.gruppe.atomer[0]);
        return m;
    };

    P.bygTegning = function () {
        if (!this.lay || !this.stof) return;
        var f = this.farver();
        this.farve = f;
        var r = F.geo(this.stof.mol, this.lay.tavle, {
            atomFarve: function (id) { return f.a[id] || null; },
            bindingFarve: function (bd) { return f.b[bd.a < bd.b ? bd.a + "-" + bd.b : bd.b + "-" + bd.a] || null; },
            lokanter: this.vis.numre ? this.lok : null
        });
        this.geo = r.geo;
        this.s = r.s;
    };

    P.atomVed = function (pt) {
        if (!this.geo) return null;
        return F.atomVed(this.stof.mol, this.geo, this.s, pt);
    };

    P.iKlik = function () { return !this.faerdig && this.trinNu().slags === "klik"; };

    P.overScene = function (pt) {
        this.over = pt && this.iKlik() ? this.atomVed(pt) : null;
        return this.over !== null ? "pointer" : null;
    };

    P.klikScene = function (pt) {
        if (this.spaer()) return;
        var id = this.atomVed(pt);
        if (id === null) return;
        var t = this.trinNu();
        /* Under et valg mellem brikker sker der intet i formlen: kortet blinker */
        if (t.slags !== "klik") { this.kortBlink(); return; }
        if (t.ok[id]) { this.trinKlaret(false, id); return; }
        this.fejlAtom = id;
        this.fejlLinje(t.fejl(id));
    };

    P.tegn = function () {
        var L = this.L, ctx = L.ctx, lay = this.lay, tv = lay.tavle, mig = this;
        NK.Tavle.tegn(ctx, lay);
        if (!this.geo) return;
        var s = this.s, g = this.geo, mol = this.stof.mol;
        /* Gult bag det, kortet spoerger om lige nu. Det pulserer stille. */
        var fokus = this.fokusNu();
        if (fokus) F.glorie(ctx, mol, g, s, fokus, "#f5b400", 0.5 + 0.12 * Math.sin(this.tid * 3.2), 0.6);
        /* Naar navnet er faerdigt: farvet baggrund bag hver del */
        this.farve.gl.forEach(function (x) { F.glorie(ctx, mol, g, s, x[0], x[1], 0.16); });
        /* I et kliktrin har hvert carbonatom en prik, saa man kan se, hvad der kan klikkes paa */
        if (this.iKlik()) {
            mol.atomer.forEach(function (a) {
                if (a.el !== "C") return;
                var p = g.P[a.id];
                ctx.beginPath();
                ctx.arc(p.x, p.y, Math.max(5, s * 0.09), 0, Math.PI * 2);
                ctx.fillStyle = "rgba(29, 36, 51, 0.8)";
                ctx.fill();
            });
            if (this.over !== null) F.ring(ctx, g.P[this.over], s * 0.3, "rgba(214, 158, 12, 0.9)", "rgba(242, 197, 61, 0.2)", 3);
            if (this.hintVis.etter) {
                var puls = 0.5 + 0.5 * Math.sin(this.tid * 4);
                Object.keys(this.trinNu().ok).forEach(function (id) {
                    F.ring(ctx, g.P[id], s * (0.3 + 0.05 * puls), "#d69e0c", "rgba(242, 197, 61, 0.3)", 4);
                });
            }
            if (this.fejlAtom !== null) F.ring(ctx, g.P[this.fejlAtom], s * 0.3, "#d2362b", "rgba(224, 84, 70, 0.14)", 3);
        }
        NK.Struktur.tegnGeo(ctx, g);
        this.tegnSejr(ctx, tv);
    };

    NK.SimNavn = SimNavn;
}());
