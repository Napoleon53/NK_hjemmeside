/* =====================================================================
   sim_test.js - fane 1: Hvad viser testene?

   Ti stoffer som zigzagformler, med aldehydets H tegnet som i bogens
   figur. Hver opgave har to spoergsmaal, der bedoemmes ved Indsend svar:
     dnph     hvad sker der, naar stoffet kommer i DNPH?
     tollens  hvad sker der i Tollens' test?
   De tre svar er de samme ved begge test (bundfald, soelvspejl, ingen
   aendring), saa eleven skal vide, hvilken test der giver hvad. Det
   rigtige svar regnes af modellen (K.svarFor i kemi.js).

   Glassene staar til hoejre paa tavlen. Det glas, kortet spoerger om,
   har en gul ramme. Naar svaret er rigtigt, draaber pipetten stoffet i,
   og glasset viser resultatet (js/glas.js). Carbonylgruppen bliver
   groenblaa, naar DNPH er besvaret, og aldehydets H, naar Tollens' test er.

   Panelet viser opgaverne og tabellen "Det har du fundet", der fyldes ud
   for hver stofklasse, eleven har loest en opgave med.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var F = NK.Fane;
    var G = NK.Glas;
    var NOEGLE = "nk-sb4.11-test";
    var FONT = "'Segoe UI', sans-serif";

    var GUL = "#d69e0c";
    var TEAL = "#0f766e";
    var BLAEK = "#1d2433";
    var TESTE = ["dnph", "tollens"];

    function SimTest() {
        var mig = this;
        this.opgaver = D.STOFFER.map(function (s, i) {
            return { nr: i, s: s, id: s.navn, navn: s.navn, vist: K.vist(s), niv: s.niv, res: K.resultat(s.navn), tegn: K.tegneMol(s.navn) };
        });
        this.hentStatus();
        this.startFane();
        this.bygListe();
        NK.el("t-forfra").addEventListener("click", function () { mig.forfra(); });
        NK.el("t-liste").addEventListener("click", function (e) {
            var k = e.target.closest ? e.target.closest("[data-opg]") : null;
            if (k) mig.vaelg(parseInt(k.getAttribute("data-opg"), 10));
        });
    }

    var P = SimTest.prototype;
    F.paa(P, "t");

    /* ----- Hukommelsen ----------------------------------------------------------- */
    P.hentStatus = function () {
        var gemt = NK.hent(NOEGLE, {}) || {};
        this.status = this.opgaver.map(function (o) {
            var g = gemt[o.id] || {};
            return { loest: !!g.l, stjerne: !!g.s };
        });
    };

    P.gem = function () {
        var ud = {}, mig = this;
        this.status.forEach(function (s, i) { ud[mig.opgaver[i].id] = { l: s.loest ? 1 : 0, s: s.stjerne ? 1 : 0 }; });
        NK.gem(NOEGLE, ud);
    };

    P.antalLoest = function () { return this.status.filter(function (s) { return s.loest; }).length; };

    P.naesteUloeste = function () {
        var n = this.status.length;
        for (var d = 1; d <= n; d++) {
            var i = (this.nr + d) % n;
            if (!this.status[i].loest) return i;
        }
        return -1;
    };

    /* ----- Panelet --------------------------------------------------------------- */
    P.bygListe = function () {
        var mig = this, html = "";
        [1, 2, 3].forEach(function (niv) {
            html += '<div class="opg-gruppe"><div class="opg-hoved"><span>' + D.NIVEAUER[niv - 1] +
                '</span><span class="opg-tal" id="t-gt-' + niv + '"></span></div><div class="opg-chips">';
            mig.opgaver.forEach(function (o, i) {
                if (o.niv !== niv) return;
                html += '<button type="button" class="opg-chip" data-opg="' + i + '" title="' + NK.html(o.vist) + '">' +
                    '<span class="oc-f">' + (i + 1) + '</span><i class="oc-m"></i></button>';
            });
            html += "</div></div>";
        });
        NK.el("t-liste").innerHTML = html;
        NK.saetTekst("t-ialt", String(this.opgaver.length));
    };

    P.visListe = function () {
        var mig = this, pr = { 1: [0, 0], 2: [0, 0], 3: [0, 0] };
        var chips = NK.el("t-liste").querySelectorAll("[data-opg]");
        for (var k = 0; k < chips.length; k++) {
            var i = parseInt(chips[k].getAttribute("data-opg"), 10), s = this.status[i];
            chips[k].classList.toggle("valgt", i === this.nr);
            chips[k].classList.toggle("loest", s.loest);
            chips[k].classList.toggle("stjerne", s.stjerne);
            chips[k].querySelector(".oc-m").textContent = s.stjerne ? "★" : (s.loest ? "✓" : "");
        }
        this.opgaver.forEach(function (o, i) {
            pr[o.niv][1]++;
            if (mig.status[i].loest) pr[o.niv][0]++;
        });
        [1, 2, 3].forEach(function (niv) { NK.saetTekst("t-gt-" + niv, pr[niv][0] + "/" + pr[niv][1]); });
        NK.saetTekst("t-loest", String(this.antalLoest()));
        this.visTabel();
    };

    /* Tabellen fyldes ud for hver stofklasse, eleven har loest en opgave med */
    P.visTabel = function () {
        var mig = this, kendt = {}, html = '<div class="fund3-hoved"><span></span><span>DNPH</span><span>Tollens</span></div>';
        this.opgaver.forEach(function (o, i) { if (mig.status[i].loest) kendt[o.res.klasse] = o.res; });
        D.KLASSE_ORDEN.forEach(function (k) {
            var kl = D.KLASSER[k], r = kendt[k];
            html += '<div class="fund3' + (r ? " kendt" : "") + '"><span class="fr-svar" style="--klassefarve:' + kl.farve + '">' + NK.html(kl.navn) + "</span>";
            if (!r) html += '<span class="f3 ukendt">?</span><span class="f3 ukendt">?</span>';
            else {
                html += '<span class="f3' + (r.dnph ? " ja" : " nej") + '">' + (r.dnph ? "bundfald" : "ingen") + "</span>";
                html += '<span class="f3' + (r.tollens ? " ja" : " nej") + '">' + (r.tollens ? "sølvspejl" : "ingen") + "</span>";
            }
            html += "</div>";
        });
        NK.saetHTML("t-fundet", html);
    };

    /* ----- En opgave ------------------------------------------------------------- */
    P.vaelg = function (i) {
        this.nr = i;
        this.opg = this.opgaver[i];
        this.fase = "dnph";
        this.valgt = null;
        this.forkert = {};
        this.fejl = false;
        this.sv = false;
        this.groen = null;
        this.visCO = false;
        this.testT = { dnph: null, tollens: null };
        this.besvaret = { dnph: false, tollens: false };
        this.besked("", "");
        this.nulstilHjaelp();
        this.visKort();
        this.visListe();
        this.layout();
    };

    P.kortData = function () {
        var mig = this, v = this.opg.vist, tekst;
        if (this.fase === "dnph") tekst = "Hvad sker der, når " + v + " tilsættes DNPH-opløsning? Vælg, og tryk Indsend svar.";
        else tekst = "Hvad sker der i Tollens' test med " + v + "? Glasset varmes i et vandbad. Vælg, og tryk Indsend svar.";
        return {
            slags: "spm", chip: "Opgave " + (this.nr + 1),
            tekst: tekst,
            svar: D.SVAR.map(function (s, j) { return { t: s.t, valgt: mig.valgt === j, forkert: !!mig.forkert[j] }; })
        };
    };

    P.svarValg = function (j) {
        this.valgt = this.valgt === j ? null : j;
        this.visKort();
    };

    P.kanSendes = function () { return this.valgt !== null; };

    P.indsendTekst = function () {
        if (this.valgt === null) return "Indsend svar";
        return "Indsend svar: " + D.SVAR[this.valgt].t.toLowerCase();
    };

    P.ingentingTekst = function () { return "Vælg et af de tre svar på kortet først."; };

    P.indsend = function () { this.bedoem(false); };

    P.bedoem = function (vist) {
        var o = this.opg, test = this.fase, rigtig = K.svarFor(o.navn, test), nr = this.valgt;
        if (nr !== rigtig) {
            this.forkert[nr] = true;
            this.fejl = true;
            this.valgt = null;
            this.visKort();
            this.fejlLinje(K.testFejl(o.navn, o.vist, test, nr));
            return;
        }
        this.valgt = null;
        this.besvaret[test] = true;
        this.testT[test] = 0;
        this.sejrT = 0;
        var tekst = K.testForklaring(o.navn, o.vist, test);
        if (test === "dnph") {
            this.groen = {
                spm: true, svarNr: nr, maade: vist ? "svar" : "selv", tekst: tekst, knap: "Næste spørgsmål →",
                naeste: function () { this.fase = "tollens"; this.valgt = null; this.forkert = {}; this.visCO = false; this.nulstilHjaelp(); this.visKort(); }
            };
            this.besked("", "");
            this.visKort();
            return;
        }
        var s = this.status[this.nr], foerste = !s.loest;
        s.loest = true;
        s.stjerne = s.stjerne || (!this.fejl && !this.sv && !vist);
        this.gem();
        var alle = this.antalLoest() === this.opgaver.length;
        if (alle && foerste) tekst += " " + D.FAERDIG.t;
        var naeste = this.naesteUloeste();
        this.groen = { spm: true, svarNr: nr, maade: vist || this.sv ? "svar" : "selv", tekst: tekst,
            knap: naeste >= 0 ? "Næste opgave →" : "Videre til Reaktionerne →" };
        this.besked("", "");
        this.visKort();
        this.visListe();
        if (alle && foerste) NK.konfettiRegn(NK.el("fane-t").querySelector(".scene"), 140);
        else NK.konfetti(this.el.skort, 36);
    };

    /* Kortets knap gaar altid fremad. Start forfra staar under opgaverne i
       panelet (brugerens regel 3. nov. 2026) */
    P.videre = function () {
        var naeste = this.naesteUloeste();
        if (naeste >= 0) { this.vaelg(naeste); return; }
        if (NK.visFane) NK.visFane("fane-r");
    };

    P.forfra = function () {
        this.status = this.opgaver.map(function () { return { loest: false, stjerne: false }; });
        this.gem();
        this.vaelg(0);
    };

    /* ----- Hjaelpen ------------------------------------------------------------- */
    P.hintNu = function () {
        if (this.groen) return [];
        var o = this.opg, r = o.res, v = o.vist, kl = r.klasse;
        if (this.fase === "dnph") {
            var h2;
            if (r.dnph) h2 = "C=O sidder " + (kl === "aldehyd" ? "for enden af kæden" : "inde i kæden") + ". Det er en carbonylgruppe, og den reagerer med DNPH.";
            else if (kl === "alkohol") h2 = "Der er intet C=O i " + v + ". DNPH har intet at reagere med.";
            else h2 = "C=O sidder ved siden af et andet O, og derfor er stoffet hverken et aldehyd eller en keton.";
            return ["Har " + v + " en carbonylgruppe, C=O, i et aldehyd eller en keton?", h2];
        }
        var t2;
        if (r.tollens) t2 = "Carbonylgruppens carbonatom har et H. Aldehydet kan oxideres, og sølvet sætter sig på glasset.";
        else if (r.dnph) t2 = "Carbonylgruppens carbonatom er bundet til to carbonatomer og har intet H. Stoffet er en keton.";
        else t2 = v.charAt(0).toUpperCase() + v.slice(1) + " er ikke et aldehyd. Tollens' test påviser kun aldehyder.";
        return ["Tollens' test påviser aldehyder. Har carbonylgruppens carbonatom et H?", t2];
    };

    /* Efter det foerste hint faar C=O en gul ring, hvis der er en */
    P.efterHint = function () { this.visCO = true; };

    P.visSvar = function () {
        this.sv = true;
        this.valgt = K.svarFor(this.opg.navn, this.fase);
        this.bedoem(true);
    };

    /* ----- Klik paa tavlen: et klik paa et glas vaelger svaret til den test? Nej:
       glassene viser kun. Et klik i scenen, mens kortet er groent, faar knappen
       til at blinke ------------------------------------------------------------ */
    P.klikScene = function () { this.spaer(); };

    P.nulstil = function () {
        if (this.groen) return;
        this.vaelg(this.nr);
    };

    /* ----- Layout og tegning ------------------------------------------------------ */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle;
        this.saetAnker("tavle", t.x, t.y, t.b, t.h);
        var pad = 18, molB = Math.round(t.b * 0.44);
        var glasB = t.b - molB - 2 * pad;
        var gh = Math.min(t.h * 0.6, 240), gb = gh * 0.3;
        var kolB = glasB / 2;
        this.kasser = {
            mol: { x: t.x + pad, y: t.y + 24, b: molB - 10, h: t.h - 110 },
            kol: TESTE.map(function (test, i) {
                var x = t.x + pad + molB + i * kolB;
                return { test: test, x: x + 8, y: t.y + 14, b: kolB - 16, h: t.h - 28,
                    glas: { x: x + kolB / 2 - gb / 2, y: t.y + 60, b: gb, h: gh } };
            })
        };
        this.saetAnker("glas", t.x + pad + molB, t.y + 14, glasB, t.h - 28);
    };

    P.opdaterScene = function (dt) {
        var mig = this;
        TESTE.forEach(function (test) { if (mig.testT[test] !== null && mig.testT[test] < G.VARIGHED + 1) mig.testT[test] += dt; });
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, tv = lay.tavle, k = this.kasser, mig = this;
        NK.Tavle.tegn(ctx, lay);
        if (!this.opg || !k) return;
        var o = this.opg, tg = o.tegn, puls = 0.5 + 0.5 * Math.sin(this.tid * 4);

        /* Molekylet. C=O bliver groenblaa, naar DNPH er besvaret, og aldehydets H,
           naar Tollens' test er besvaret */
        var visCO = this.besvaret.dnph && tg.c !== null, visH = this.besvaret.tollens && tg.h !== null;
        var r = F.iKasse(tg.mol, k.mol, {
            maks: 70,
            atomFarve: function (id) {
                if (visCO && id === tg.o) return TEAL;
                if (visH && id === tg.h) return TEAL;
                return null;
            },
            bindingFarve: function (bd) {
                function er(a, b) { return (bd.a === a && bd.b === b) || (bd.a === b && bd.b === a); }
                if (visCO && er(tg.c, tg.o)) return TEAL;
                if (visH && er(tg.c, tg.h)) return TEAL;
                return null;
            }
        });
        /* Hintet: en gul ring om C=O (ogsaa i en carboxylsyre eller ester) */
        if (this.visCO && !this.groen && tg.cDO) {
            var pc = r.geo.P[tg.cDO.c], po = r.geo.P[tg.cDO.o];
            F.ring(ctx, { x: (pc.x + po.x) / 2, y: (pc.y + po.y) / 2 }, r.s * 0.72, GUL, "rgba(242, 197, 61, 0.18)", 2.5);
        }
        if (visH) F.ring(ctx, r.geo.P[tg.h], r.s * 0.3, TEAL, "rgba(15, 118, 110, 0.10)", 2.5);
        NK.Struktur.tegnGeo(ctx, r.geo);
        var nx = k.mol.x + k.mol.b / 2, ny = Math.min(k.mol.y + k.mol.h + 22, r.geo.y1 + 40);
        NK.tekst(ctx, o.vist, nx, ny, { font: "700 19px " + FONT, farve: BLAEK, justering: "center", linje: "middle" });
        if (this.besvaret.tollens) {
            var kl = D.KLASSER[o.res.klasse];
            NK.tekst(ctx, kl ? kl.navn : o.res.klasse, nx, ny + 24, { font: "700 15px " + FONT, farve: kl ? kl.blaek : BLAEK, justering: "center", linje: "middle" });
        }

        /* De to glas */
        k.kol.forEach(function (kol) { mig.tegnKolonne(ctx, kol, puls); });
        this.tegnSejr(ctx, tv);
    };

    /* En kolonne: testens navn, glasset og resultatet under det. Det glas, kortet
       spoerger om, har en gul ramme */
    P.tegnKolonne = function (ctx, kol, puls) {
        var test = kol.test, aktiv = this.fase === test && !this.groen, g = kol.glas;
        if (aktiv) {
            ctx.save();
            NK.rundtRekt(ctx, kol.x, kol.y, kol.b, kol.h, 14);
            ctx.fillStyle = "rgba(242, 197, 61, 0.10)";
            ctx.fill();
            ctx.strokeStyle = GUL;
            ctx.lineWidth = 2.5 + puls;
            ctx.stroke();
            ctx.restore();
        }
        NK.tekst(ctx, D.TEST[test].glas, kol.x + kol.b / 2, kol.y + 24, { font: "800 17px " + FONT, farve: aktiv ? "#8a6200" : BLAEK, justering: "center", linje: "middle" });
        var res = { dnph: this.opg.res.dnph, tollens: this.opg.res.tollens, farve: this.opg.res.farve };
        var t = this.testT[test];
        var til = G.tilstand(test, res, t === null ? -1 : t);
        G.tegn(ctx, g, til);
        G.pipette(ctx, g, t);
        var ty = g.y + g.h + 26, tekst = "?", farve = "#a3abb6";
        if (t !== null && t > 1.0) {
            tekst = test === "dnph" ? K.dnphTekst({ dnph: res.dnph, farve: res.farve }) : K.tollensTekst(res);
            farve = (test === "dnph" ? res.dnph : res.tollens) ? TEAL : "#5d6878";
        }
        NK.tekst(ctx, tekst, kol.x + kol.b / 2, ty, { font: "700 16px " + FONT, farve: farve, justering: "center", linje: "middle" });
        if (test === "tollens") NK.tekst(ctx, "i varmt vandbad", kol.x + kol.b / 2, ty + 21, { font: "600 13px " + FONT, farve: "#7e8794", justering: "center", linje: "middle" });
    };

    NK.SimTest = SimTest;
}());
