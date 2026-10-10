/* =====================================================================
   sim_grupper.js - fane 3: Flere grupper

   Et stof fra hverdagen med flere funktionelle grupper staar paa
   whiteboardet. Eleven klikker paa et atom i en gruppe og vaelger
   stofklassen blandt de seks. Gruppen faar stofklassens farve og navn.
   Naar alle grupper er fundet, viser kortet, hvilke stofklasser stoffet
   hoerer til, og det systematiske navn.

   Gult er det, kortet spoerger om lige nu (som paa fane 1). En gruppe,
   eleven har fundet, faar stofklassens farve paa stregerne og sit navn,
   men foerst farvet baggrund, naar hele stoffet er loest.

   Pointen fra bogen (afsnit B3.1, "Se paa hele gruppen"): C=O og OH paa
   samme carbonatom er én gruppe. Derfor faar kun det atom, eleven klikker
   paa, en gul ring. Svarer eleven keton eller alkohol til en
   carboxylgruppe, kommer forklaringen, og ringen vokser til hele gruppen.

   Har eleven fundet én gruppe af en stofklasse, skal de andre grupper af
   samme slags kun klikkes paa: spoergsmaalet kommer ikke igen.

   Stofklasserne i panelet vaelger stofferne: et stof er med, naar alle
   dets grupper hoerer til de valgte stofklasser. Er der faerre end fire
   saadanne stoffer, fyldes der op med dem, der har mindst én af dem.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var F = NK.Fane;

    function SimGrupper() {
        this.alle = D.BLANDEDE.map(function (o) { return K.blandet(o); });
        this.startFane();
    }

    var P = SimGrupper.prototype;
    F.paa(P, { navn: "g", naesteFane: null, naesteNavn: "" });

    /* ----- Opgaverne ------------------------------------------------------------ */
    P.lavOpgaver = function (aktive) {
        function fremmede(b) { return b.klasser.filter(function (k) { return aktive.indexOf(k) < 0; }).length; }
        var med = this.alle.filter(function (b) { return fremmede(b) === 0; });
        if (med.length < 4) {
            var resten = this.alle.filter(function (b) { return fremmede(b) > 0 && fremmede(b) < b.klasser.length; })
                .sort(function (a, b) { return fremmede(a) - fremmede(b); });
            while (med.length < 4 && resten.length) med.push(resten.shift());
        }
        if (!med.length) med = this.alle.slice(0, 4);
        var plads = this.alle;
        return med.map(function (b) { return { id: b.id, niv: b.niv, b: b }; })
            .sort(function (x, y) { return x.niv !== y.niv ? x.niv - y.niv : plads.indexOf(x.b) - plads.indexOf(y.b); });
    };

    /* Kortet er lavere her end paa fane 1: navnet staar ikke paa det */
    P.kortZone = function () { return window.innerHeight <= 720 ? 178 : 204; };

    P.nyOpgave = function (opg) {
        this.b = opg.b;
        this.fundet = {};
        this.kendte = {};
        this.valgt = null;
        this.valgtAtom = null;
        this.heleGruppen = false;
        this.forkert = {};
        this.over = null;
        this.bygTegning();
    };

    P.antalFundet = function () { return Object.keys(this.fundet).length; };

    /* ----- Kortet ------------------------------------------------------------------ */
    P.kortData = function () {
        var mig = this, b = this.b, n = b.grupper.length, f = this.antalFundet();
        if (this.valgt === null) {
            return {
                slags: "opgave", chip: "Opgave " + (this.nr + 1),
                tekst: f === 0 ? b.info + " Klik på en funktionel gruppe i formlen."
                    : "Du har fundet " + f + " af " + n + " grupper i " + b.navn + ". Klik på den næste gruppe i formlen."
            };
        }
        return {
            slags: "spm", chip: "Spørgsmål",
            tekst: "Atomet med den gule ring sidder i en funktionel gruppe. Hvilken stofklasse giver gruppen?",
            kolonner: 6,
            svar: D.KLASSER.map(function (k) {
                return { t: k.navn, prik: k.farve, klasse: mig.forkert[k.id] ? "forkert" : "", laast: !!mig.forkert[k.id] };
            })
        };
    };

    P.slutEkstra = function () { return ""; };

    /* ----- Klik i formlen og svarene --------------------------------------------------- */
    P.gruppeMed = function (id) {
        var gr = this.b.grupper;
        for (var i = 0; i < gr.length; i++) if (gr[i].atomer.indexOf(id) >= 0) return i;
        return -1;
    };

    P.klikScene = function (pt) {
        if (this.spaer()) return;
        /* Et spoergsmaal venter paa svar: kortet blinker */
        if (this.valgt !== null) { this.kortBlink(); return; }
        var id = this.atomVed(pt);
        if (id === null) return;
        var gi = this.gruppeMed(id);
        if (gi < 0) {
            this.kortBesked("Det carbonatom har kun carbon og hydrogen på sig. En funktionel gruppe har O eller N.", 4.5);
            return;
        }
        var g = this.b.grupper[gi], kl = K.klasse(g.klasse);
        if (this.fundet[gi]) { this.kortBesked("Den gruppe har du fundet. Den gør stoffet til " + kl.ental + ".", 4); return; }
        if (this.kendte[g.klasse]) {
            /* Samme slags gruppe som en, eleven har fundet: intet nyt spoergsmaal */
            this.fundet[gi] = true;
            this.bygTegning();
            if (this.erFaerdig()) { this.afslut(); return; }
            this.godLinje("Endnu en gruppe af samme slags: " + kl.navn.toLowerCase() + ".");
            this.visKort();
            return;
        }
        this.valgt = gi;
        this.valgtAtom = id;
        this.heleGruppen = false;
        this.forkert = {};
        this.besked("", "");
        this.nulstilHjaelp();
        this.visKort();
    };

    P.svarValg = function (j) {
        if (this.valgt === null) return;
        var k = D.KLASSER[j].id, g = this.b.grupper[this.valgt];
        if (this.forkert[k]) return;
        if (k === g.klasse) { this.gruppeFundet(false); return; }
        this.forkert[k] = true;
        /* Nu vises hele gruppen, saa eleven kan se, hvad der hoerer sammen */
        this.heleGruppen = true;
        this.visKort();
        this.fejlLinje(K.gruppeFejl(this.b, g, k));
    };

    P.gruppeFundet = function (vist) {
        var g = this.b.grupper[this.valgt], kl = K.klasse(g.klasse);
        this.fundet[this.valgt] = true;
        this.kendte[g.klasse] = true;
        this.valgt = null;
        this.valgtAtom = null;
        this.forkert = {};
        this.bygTegning();
        if (this.erFaerdig()) { this.afslut(); return; }
        this.nulstilHjaelp();
        if (vist) this.besked('<span class="b-maerke">Svaret</span> ' + NK.html(K.stor(kl.har) + " er " + kl.ental + "."), "gul");
        else this.godLinje(K.stor(kl.har) + " er " + kl.ental + ".");
        this.visKort();
    };

    P.erFaerdig = function () { return this.antalFundet() === this.b.grupper.length; };

    P.afslut = function () {
        this.valgt = null;
        this.loest("selv", K.blandetForklaring(this.b));
    };

    P.hintNu = function () {
        if (this.faerdig || !this.b) return [];
        var b = this.b, n = b.grupper.length, mangler = n - this.antalFundet();
        if (this.valgt === null) {
            return ["En funktionel gruppe har et oxygenatom eller et nitrogenatom.",
                K.stor(b.navn) + " har " + D.TAL[n] + " funktionelle grupper. Du mangler " + (mangler === 1 ? "én" : D.TAL[mangler]) + "."];
        }
        var kl = K.klasse(b.grupper[this.valgt].klasse);
        return ["Se på hele gruppen: hvad sidder der mere på det samme carbonatom?",
            K.stor(kl.har) + " er " + kl.ental + "."];
    };

    P.efterHint = function (n) {
        if (this.valgt !== null && n >= 1) this.heleGruppen = true;
    };

    /* Vis svaret: ét skridt ad gangen. Venter et spoergsmaal, besvares det.
       Ellers findes den naeste gruppe. */
    P.visSvar = function () {
        if (this.valgt === null) {
            for (var i = 0; i < this.b.grupper.length; i++) if (!this.fundet[i]) { this.valgt = i; break; }
        }
        this.gruppeFundet(true);
    };

    /* ----- Layout og tegningen ---------------------------------------------------------- */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle;
        this.saetAnker("tavle", t.x, t.y, t.b, t.h);
        this.bygTegning();
    };

    P.bygTegning = function () {
        if (!this.lay || !this.b) return;
        var mig = this, mol = this.b.mol, a = {}, bf = {};
        function kant(x, y) { return x < y ? x + "-" + y : y + "-" + x; }
        this.b.grupper.forEach(function (g, i) {
            if (!mig.fundet[i]) return;
            var farve = K.klasse(g.klasse).blaek, m = {};
            g.atomer.forEach(function (id) { m[id] = true; if (mol.atom(id).el !== "C") a[id] = farve; });
            mol.bindinger.forEach(function (bd) {
                var aHet = mol.atom(bd.a).el !== "C", bHet = mol.atom(bd.b).el !== "C";
                if ((m[bd.a] && m[bd.b]) || (m[bd.a] && aHet && g.klasse !== "ester") || (m[bd.b] && bHet && g.klasse !== "ester")) bf[kant(bd.a, bd.b)] = farve;
            });
        });
        var r = F.geo(mol, this.lay.tavle, {
            ned: 8, maks: 84,
            atomFarve: function (id) { return a[id] || null; },
            bindingFarve: function (bd) { return bf[kant(bd.a, bd.b)] || null; }
        });
        this.geo = r.geo;
        this.s = r.s;
    };

    P.atomVed = function (pt) {
        if (!this.geo) return null;
        return F.atomVed(this.b.mol, this.geo, this.s, pt);
    };

    P.overScene = function (pt) {
        this.over = pt && !this.faerdig && this.valgt === null ? this.atomVed(pt) : null;
        return this.over !== null ? "pointer" : null;
    };

    /* De grupper, der har farvet baggrund: ingen, foer stoffet er loest */
    P.glorier = function () {
        var mig = this;
        if (!this.faerdig) return [];
        return this.b.grupper.map(function (g, i) { return i; }).filter(function (i) { return mig.fundet[i]; });
    };

    /* Maengden af atomer i gruppe nummer i */
    P.maengde = function (i) {
        var m = {};
        this.b.grupper[i].atomer.forEach(function (id) { m[id] = true; });
        return m;
    };

    /* Stofklassens navn ved gruppen: uden for molekylet, paa linje med gruppen */
    P.etiket = function (ctx, i) {
        var g = this.b.grupper[i], mol = this.b.mol, geo = this.geo, s = this.s;
        var kl = K.klasse(g.klasse), cx = 0, cy = 0, n = 0, px = 0, py = 0;
        mol.atomer.forEach(function (at) { var p = geo.P[at.id]; cx += p.x; cy += p.y; n++; });
        cx /= n; cy /= n;
        g.atomer.forEach(function (id) { var p = geo.P[id]; px += p.x; py += p.y; });
        px /= g.atomer.length; py /= g.atomer.length;
        var op = py <= cy;
        /* Det yderste atom i gruppen i den retning, etiketten skal staa */
        var yderst = op ? Infinity : -Infinity;
        g.atomer.forEach(function (id) { var p = geo.P[id]; yderst = op ? Math.min(yderst, p.y) : Math.max(yderst, p.y); });
        var y = yderst + (op ? -1 : 1) * s * 0.62;
        NK.tekst(ctx, kl.navn.toLowerCase(), px, y, {
            font: "700 " + Math.round(NK.klamp(s * 0.24, 14, 19)) + "px 'Segoe UI', sans-serif",
            farve: kl.blaek, justering: "center", linje: "middle", kant: true, kantFarve: "rgba(255, 255, 255, 0.9)", kantBredde: 4
        });
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, tv = lay.tavle, mig = this;
        NK.Tavle.tegn(ctx, lay);
        if (!this.geo) return;
        var s = this.s, g = this.geo, mol = this.b.mol;
        NK.tekst(ctx, this.b.navn, tv.x + 20, tv.y + 30, { font: "700 17px 'Segoe UI', sans-serif", farve: "#5d6878" });
        /* Naar alle grupper er fundet, faar de stofklassens farve som baggrund.
           Foer det har en fundet gruppe kun farvede streger og sit navn, saa det
           gule (det, kortet spoerger om) er det eneste, der er fremhaevet. */
        this.glorier().forEach(function (i) {
            F.glorie(ctx, mol, g, s, mig.maengde(i), K.klasse(mig.b.grupper[i].klasse).blaek, 0.2);
        });
        /* Det valgte atom, eller hele gruppen efter et forkert svar eller et hint */
        if (this.valgt !== null) {
            var puls = 0.5 + 0.5 * Math.sin(this.tid * 4);
            if (this.heleGruppen) F.glorie(ctx, mol, g, s, this.maengde(this.valgt), "#f2c53d", 0.55);
            F.ring(ctx, g.P[this.valgtAtom !== null ? this.valgtAtom : this.b.grupper[this.valgt].atomer[0]],
                s * (0.33 + 0.04 * puls), "#d69e0c", "rgba(242, 197, 61, 0.35)", 4);
        } else if (this.over !== null) {
            F.ring(ctx, g.P[this.over], s * 0.3, "rgba(214, 158, 12, 0.9)", "rgba(242, 197, 61, 0.2)", 3);
        }
        NK.Struktur.tegnGeo(ctx, g);
        this.b.grupper.forEach(function (gr, i) { if (mig.fundet[i]) mig.etiket(ctx, i); });
        this.tegnSejr(ctx, tv);
    };

    NK.SimGrupper = SimGrupper;
}());
