/* =====================================================================
   sim_kond.js - fane 1: Kondensationen

   Tre reaktioner (D.KONDENSATION). Syren staar til venstre i bogens
   groenne farve og alkoholen til hoejre i orange, begge med H-atomet paa
   OH-gruppen tegnet. Hver opgave har tre trin, og de to spoergsmaal
   bedoemmes ved Indsend svar:
     vand      eleven klikker paa de tre atomer, der bliver til vand
               (syrens OH-gruppe og alkoholens H)
     reaktion  knappen paa kortet saetter reaktionen i gang: vandet gaar
               af i en bue under molekylerne, alkoholen glider ind, og
               alkoholens oxygenatom binder sig til syrens carbonatom
     navn      hvad hedder esteren? Tre svar (K.navnValg i kemi.js)
   Esteren beholder farverne: den groenne del kommer fra syren, og den
   orange del fra alkoholen, som i bogens figur b4-esterdannelse. Ogsaa
   vandets atomer beholder farven, saa man kan se, hvor de kom fra.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var F = NK.Fane;
    var NOEGLE = "nk-sb4.2-kond";
    var FONT = "'Segoe UI', sans-serif";

    var GUL = "#d69e0c", GUL_FYLD = "rgba(242, 197, 61, 0.28)";
    var BLAA = "#2a76ac";
    var BLAEK = D.FARVE.blaek;
    var FS = D.FARVE.syre.blaek, FA = D.FARVE.alkohol.blaek;
    var ANIM = 2.6;                  /* sekunder for reaktionen */

    function SimKond() {
        var mig = this;
        this.opgaver = D.KONDENSATION.map(function (k, i) {
            return { nr: i, id: k.syre + "|" + k.alkohol, syre: k.syre, alkohol: k.alkohol, om: k.om, trin: ["vand", "reaktion", "navn"] };
        });
        this.hentStatus();
        this.startFane();
        this.bygListe();
        NK.el("k-forfra").addEventListener("click", function () { mig.forfra(); });
        NK.el("k-liste").addEventListener("click", function (e) {
            var k = e.target.closest ? e.target.closest("[data-opg]") : null;
            if (k) mig.vaelg(parseInt(k.getAttribute("data-opg"), 10));
        });
    }

    var P = SimKond.prototype;
    F.paa(P, "k");

    /* Mens reaktionen koerer, goer Enter og Indsend svar ingenting */
    var indsendKlik = P.indsendKlik;
    P.indsendKlik = function () { if (this.trin() !== "reaktion" || this.groen) indsendKlik.call(this); };

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
        var html = "";
        this.opgaver.forEach(function (o, i) {
            html += '<button type="button" class="opg-chip serie" data-opg="' + i + '">' +
                '<span class="oc-f"><span class="oc-nr">' + (i + 1) + "</span>" +
                '<span class="serie-navn">' + NK.html(o.syre) + " og " + NK.html(o.alkohol) + '<small class="k-esternavn"></small></span></span>' +
                '<i class="oc-m"></i></button>';
        });
        NK.el("k-liste").innerHTML = html;
    };

    P.visListe = function () {
        var knapper = NK.el("k-liste").querySelectorAll("[data-opg]");
        for (var i = 0; i < knapper.length; i++) {
            var s = this.status[i];
            knapper[i].classList.toggle("valgt", i === this.nr);
            knapper[i].classList.toggle("loest", s.loest);
            knapper[i].classList.toggle("stjerne", s.stjerne);
            knapper[i].querySelector(".oc-m").textContent = s.stjerne ? "★" : (s.loest ? "✓" : "");
            knapper[i].querySelector(".k-esternavn").textContent = s.loest ? "giver " + K.byg(this.opgaver[i].syre, this.opgaver[i].alkohol).navn : "";
        }
        NK.saetTekst("k-loest", String(this.antalLoest()));
        /* Farverne forklares, naar eleven har set en ester */
        NK.el("k-farver").style.visibility = this.antalLoest() > 0 || (this.kendt && this.kendt.reaktion) ? "visible" : "hidden";
    };

    /* ----- En opgave ------------------------------------------------------------- */
    P.vaelg = function (i) {
        this.nr = i;
        this.opg = this.opgaver[i];
        this.trinNr = 0;
        this.kendt = {};
        this.valgt = null;
        this.valgtAtomer = [];
        this.overAtom = null;
        this.forkert = {};
        this.fejl = false;
        this.sv = false;
        this.groen = null;
        this.hintMaerke = 0;
        this.animT = null;
        this.faerdig = false;
        this.sc = K.kondScene(this.opg.syre, this.opg.alkohol);
        this.efter = K.kondEfter(this.sc);
        this.union = this.sc.mol.kopi();
        var u = this.union;
        this.sc.dannes.forEach(function (p) { u.bind(p[0], p[1], p[2]); });
        this.navne = K.navnValg(this.opg);
        this.besked("", "");
        this.nulstilHjaelp();
        this.visKort();
        this.visListe();
        this.layout();
    };

    P.trin = function () { return this.opg.trin[this.trinNr]; };

    P.kortData = function () {
        var mig = this, tr = this.trin(), chip = "Opgave " + (this.nr + 1), o = this.opg;
        if (tr === "vand")
            return { slags: "opgave", chip: chip, tekst: D.stor(o.syre) + " og " + o.alkohol + " danner en ester, og der fraspaltes vand. Klik på de tre atomer, der bliver til vand, og tryk Indsend svar." };
        if (tr === "reaktion")
            return { slags: "opgave", chip: "Reaktionen", tekst: "Syrens OH-gruppe og alkoholens H fraspaltes som vand. Alkoholens oxygenatom binder sig til syrens carbonatom." };
        return {
            slags: "spm", chip: chip, tekst: "Esteren er dannet af " + o.syre + " og " + o.alkohol + ". Hvad hedder esteren?",
            svar: this.navne.map(function (v, j) { return { t: v.t, valgt: mig.valgt === j, forkert: !!mig.forkert[j] }; })
        };
    };

    P.svarValg = function (j) {
        if (this.trin() !== "navn") return;
        this.valgt = this.valgt === j ? null : j;
        this.visKort();
    };

    P.skjulIndsend = function () { return this.trin() === "reaktion"; };
    P.skjulHint = function () { return this.trin() === "reaktion"; };

    P.kanSendes = function () {
        if (this.trin() === "vand") return this.valgtAtomer.length > 0;
        return this.valgt !== null;
    };

    /* Det valgte som formel: "O og 2 H" */
    P.valgtTekst = function () {
        var mol = this.sc.mol, t = {};
        this.valgtAtomer.forEach(function (id) { var e = mol.atom(id).el; t[e] = (t[e] || 0) + 1; });
        var dele = Object.keys(t).sort(function (a, b) { return a === "O" ? -1 : (b === "O" ? 1 : (a < b ? -1 : 1)); }).map(function (e) {
            return (t[e] > 1 ? t[e] + " " : "") + e;
        });
        if (dele.length <= 1) return dele.join("");
        return dele.slice(0, -1).join(", ") + " og " + dele[dele.length - 1];
    };

    P.indsendTekst = function () {
        if (this.trin() === "vand") return this.valgtAtomer.length ? "Indsend svar: " + this.valgtTekst() : "Indsend svar";
        if (this.valgt === null) return "Indsend svar";
        return "Indsend svar: " + this.navne[this.valgt].t;
    };

    P.ingentingTekst = function () {
        if (this.trin() === "vand") return "Klik på atomerne på tavlen først.";
        return "Vælg et navn på kortet først.";
    };

    P.indsend = function () { this.bedoem(false); };

    P.bedoem = function (vist) {
        if (this.trin() === "vand") { this.bedoemVand(vist); return; }
        var nr = this.valgt, v = this.navne[nr];
        if (v.type !== "rigtig") {
            this.forkert[nr] = true;
            this.fejl = true;
            this.valgt = null;
            this.visKort();
            this.fejlLinje(K.navnFejl(this.opg, v));
            return;
        }
        this.valgt = null;
        this.kendt.navn = true;
        this.sejrT = 0;
        this.loest(nr, K.navnForklaring(this.opg), vist);
    };

    P.bedoemVand = function (vist) {
        var ret = K.vandAtomer(this.sc), valgt = this.valgtAtomer.slice().sort(function (a, b) { return a - b; });
        if (JSON.stringify(ret) !== JSON.stringify(valgt)) {
            this.fejl = true;
            this.fejlLinje(K.vandFejl(this.sc, this.valgtAtomer));
            this.valgtAtomer = [];
            this.visKort();
            return;
        }
        this.kendt.vand = true;
        this.sejrT = 0;
        this.groen = { spm: true, maade: vist ? "svar" : "selv", knap: "Lad molekylerne reagere →",
            tekst: "Syrens OH-gruppe og hydrogenatomet fra alkoholens OH-gruppe bliver til H₂O. Tryk på Lad molekylerne reagere, og se reaktionen.",
            naeste: function () { this.naesteTrin(); } };
        this.besked("", "");
        this.visKort();
    };

    P.loest = function (svarNr, tekst, vist) {
        var s = this.status[this.nr], foerste = !s.loest;
        s.loest = true;
        s.stjerne = s.stjerne || (!this.fejl && !this.sv && !vist);
        this.gem();
        this.faerdig = true;
        var alle = this.antalLoest() === this.opgaver.length;
        if (alle && foerste) tekst += " " + D.FAERDIG.k;
        var naeste = this.naesteUloeste();
        var knap = naeste >= 0 ? "Næste reaktion →" : "Videre til Forudsig esteren →";
        this.groen = { spm: true, svarNr: svarNr, maade: vist || this.sv ? "svar" : "selv", tekst: tekst, knap: knap };
        this.besked("", "");
        this.visKort();
        this.visListe();
        if (alle && foerste) NK.konfettiRegn(NK.el("fane-k").querySelector(".scene"), 140);
        else NK.konfetti(this.el.skort, 36);
    };

    P.naesteTrin = function () {
        this.trinNr++;
        this.valgt = null;
        this.forkert = {};
        this.hintMaerke = 0;
        this.nulstilHjaelp();
        if (this.trin() === "reaktion") this.animT = 0;
        this.visKort();
    };

    /* Reaktionen er faerdig: spoergsmaalet om navnet */
    P.efterReaktion = function () {
        this.kendt.reaktion = true;
        this.visListe();
        this.naesteTrin();
    };

    /* Kortets knap gaar altid fremad */
    P.videre = function () {
        var naeste = this.naesteUloeste();
        if (naeste >= 0) { this.vaelg(naeste); return; }
        if (NK.visFane) NK.visFane("fane-t");
    };

    P.forfra = function () {
        this.status = this.opgaver.map(function () { return { loest: false, stjerne: false }; });
        this.gem();
        this.vaelg(0);
    };

    /* ----- Hjaelpen ------------------------------------------------------------- */
    P.hintNu = function () {
        if (this.groen) return [];
        var tr = this.trin();
        if (tr === "vand") return K.vandHints();
        if (tr === "navn") return K.navnHints(this.opg);
        return [];
    };

    P.efterHint = function (n) { this.hintMaerke = n; };

    P.visSvar = function () {
        this.sv = true;
        if (this.trin() === "vand") {
            this.valgtAtomer = K.vandAtomer(this.sc);
            this.bedoem(true);
            return;
        }
        for (var j = 0; j < this.navne.length; j++) if (this.navne[j].type === "rigtig") this.valgt = j;
        this.bedoem(true);
    };

    /* ----- Klik paa atomerne (trinnet vand) ---------------------------------------- */
    P.atomVed = function (pt) {
        if (!this.geo || !this.sc) return null;
        var mol = this.sc.mol, bedst = null, bd = (this.skala || 40) * 0.45;
        mol.atomer.forEach(function (a) {
            if (a.el !== "O" && a.el !== "H") return;
            var p = this.geo.P[a.id];
            if (!p) return;
            var d = Math.hypot(pt.x - p.x, pt.y - p.y);
            if (d < bd) { bd = d; bedst = a.id; }
        }, this);
        return bedst;
    };

    P.overScene = function (pt) {
        this.overAtom = null;
        if (!pt || this.groen || this.trin() !== "vand") return null;
        this.overAtom = this.atomVed(pt);
        return this.overAtom !== null ? "pointer" : null;
    };

    P.klikScene = function (pt) {
        if (this.spaer()) return;
        if (this.trin() !== "vand") { if (this.trin() === "navn") this.kortBlink(); return; }
        var id = this.atomVed(pt);
        if (id === null) { this.kortBesked("Klik på et oxygenatom eller et hydrogenatom.", 2.5); return; }
        var i = this.valgtAtomer.indexOf(id);
        if (i >= 0) this.valgtAtomer.splice(i, 1);
        else this.valgtAtomer.push(id);
        this.visKort();
    };

    P.nulstil = function () {
        if (this.groen || this.trin() === "reaktion") return;
        this.vaelg(this.nr);
    };

    /* ----- Layout og tegning ------------------------------------------------------ */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle;
        this.saetAnker("tavle", t.x, t.y, t.b, t.h);
    };

    P.opdaterScene = function (dt) {
        if (this.animT !== null && this.trin() === "reaktion") {
            this.animT += dt;
            if (this.animT >= ANIM) { this.animT = null; this.efterReaktion(); }
        }
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, tv = lay.tavle;
        NK.Tavle.tegn(ctx, lay);
        if (!this.opg) return;
        this.tegnScene(ctx, tv);
        this.tegnSejr(ctx, tv);
    };

    P.animE = function () {
        if (this.kendt.reaktion) return 1;
        if (this.animT === null) return 0;
        return NK.blod(this.animT / ANIM);
    };

    /* Atomernes pladser paa tidspunktet e (0 foer, 1 efter). Vandet dannes
       foerst, hvor syrens OH-gruppe sidder: alkoholens H hopper over til
       syrens oxygenatom (e fra 0 til 0,5). Saa glider det faerdige vand-
       molekyle samlet i en bue under molekylerne hen til sin plads (0,5 til 1) */
    P.pladser = function (e) {
        var sc = this.sc, ud = {}, vand = {}, oS = sc.id.OS;
        sc.vand.forEach(function (id) { vand[id] = true; });
        var a0 = sc.start[oS], b0 = sc.slut[oS];
        var e2 = NK.blod(NK.klamp((e - 0.5) / 0.5, 0, 1)), u = 1 - e2;
        var c = { x: (a0.x + b0.x) / 2, y: 2.7 };
        var anker = { x: u * u * a0.x + 2 * u * e2 * c.x + e2 * e2 * b0.x, y: u * u * a0.y + 2 * u * e2 * c.y + e2 * e2 * b0.y };
        var e1 = NK.blod(NK.klamp(e / 0.5, 0, 1));
        Object.keys(sc.start).forEach(function (k) {
            var a = sc.start[k], b = sc.slut[k];
            if (vand[k]) {
                /* Pladsen i det faerdige vandmolekyle, i forhold til oxygenatomet */
                var dx = b.x - b0.x, dy = b.y - b0.y;
                var formet = { x: a0.x + dx, y: a0.y + dy };
                var p = { x: a.x + (formet.x - a.x) * e1, y: a.y + (formet.y - a.y) * e1 };
                /* Alkoholens H gaar i en lille bue nedenom, saa det ikke krydser syrens H */
                if (+k === sc.id.HA) p.y += 0.9 * Math.sin(Math.PI * e1);
                ud[k] = { x: p.x + (anker.x - a0.x), y: p.y + (anker.y - a0.y) };
            } else ud[k] = { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e };
        });
        return ud;
    };

    /* Skalaen og nulpunktet, saa baade foer og efter kan vaere paa tavlen */
    P.ramme = function (tv) {
        var sc = this.sc, x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
        [sc.start, sc.slut].forEach(function (pl) {
            Object.keys(pl).forEach(function (k) {
                x0 = Math.min(x0, pl[k].x); x1 = Math.max(x1, pl[k].x);
                y0 = Math.min(y0, pl[k].y); y1 = Math.max(y1, pl[k].y);
            });
        });
        x0 -= 0.9; x1 += 0.9; y0 -= 0.7; y1 += 0.7;
        var top = tv.y + 24, hoejde = tv.h - 112;
        var s = Math.min(66, (tv.b - 40) / (x1 - x0), hoejde / (y1 - y0));
        return { s: s, ox: tv.x + tv.b / 2 - s * (x0 + x1) / 2, oy: top + hoejde / 2 - s * (y0 + y1) / 2, y1: y1 };
    };

    P.tegnScene = function (ctx, tv) {
        var sc = this.sc, e = this.animE(), mig = this;
        var ramme = this.ramme(tv), s = ramme.s;
        this.skala = s;
        var mol, alfaBd = null;
        if (e <= 0) mol = sc.mol;
        else if (e >= 1) mol = this.efter;
        else {
            mol = this.union;
            var brydes = sc.brydes, dannes = sc.dannes;
            /* Foerst brydes de to bindinger, og vandet dannes. Esterbindingen
               kommer til sidst, naar alkoholens oxygenatom er fremme */
            alfaBd = function (bd) {
                function er(p) { return (bd.a === p[0] && bd.b === p[1]) || (bd.a === p[1] && bd.b === p[0]); }
                if (er(brydes[1])) return 1 - NK.klamp(e / 0.2, 0, 1);
                if (er(brydes[0])) return 1 - NK.klamp((e - 0.2) / 0.3, 0, 1);
                if (er(dannes[1])) return NK.klamp((e - 0.3) / 0.2, 0, 1);
                if (er(dannes[0])) return NK.klamp((e - 0.7) / 0.3, 0, 1);
                return 1;
            };
        }
        var pl = this.pladser(e);
        mol.atomer.forEach(function (a) { var p = pl[a.id]; if (p) { a.x = p.x; a.y = p.y; } });
        var vand = {};
        sc.vand.forEach(function (id) { vand[id] = true; });
        var valgt = {}, rigtigVist = !!this.kendt.vand;
        this.valgtAtomer.forEach(function (id) { valgt[id] = true; });
        function farve(id) { return sc.iSyre[id] ? FS : FA; }
        var geo = NK.Struktur.geometri(mol, {
            skala: s, ox: ramme.ox, oy: ramme.oy, stil: "zigzag", farve: BLAEK,
            skrift: NK.klamp(s * 0.42, 13, 26), linje: NK.klamp(s * 0.05, 1.8, 3.2),
            atomFarve: farve,
            bindingFarve: function (bd) {
                var f = sc.iSyre[bd.a] && sc.iSyre[bd.b] ? FS : (!sc.iSyre[bd.a] && !sc.iSyre[bd.b] ? FA : FS);
                var a = alfaBd ? alfaBd(bd) : 1;
                if (a >= 1) return f;
                var r = parseInt(f.slice(1, 3), 16), g = parseInt(f.slice(3, 5), 16), b = parseInt(f.slice(5, 7), 16);
                return "rgba(" + r + ", " + g + ", " + b + ", " + Math.max(0, a).toFixed(3) + ")";
            }
        });
        this.geo = geo;

        /* Ringene om atomerne: det valgte (gult), musen og hintet */
        var r = s * 0.36, id = sc.id;
        if (this.trin() === "vand" && !this.groen) {
            if (this.hintMaerke >= 1) [id.OS, id.HS].forEach(function (x) { F.ring(ctx, geo.P[x], r * 1.15, GUL, null, 2); });
            if (this.hintMaerke >= 2) F.ring(ctx, geo.P[id.HA], r * 1.15, GUL, null, 2);
            if (this.overAtom !== null && !valgt[this.overAtom]) F.ring(ctx, geo.P[this.overAtom], r, "rgba(214, 158, 12, 0.85)", null, 2);
            this.valgtAtomer.forEach(function (x) { F.ring(ctx, geo.P[x], r, GUL, GUL_FYLD, 3); });
        } else if (rigtigVist && e < 0.05) {
            sc.vand.forEach(function (x) { F.ring(ctx, geo.P[x], r, BLAA, "rgba(42, 118, 172, 0.10)", 2.5); });
        }
        NK.Struktur.tegnGeo(ctx, geo);

        /* Plus foer og efter */
        var fs = NK.klamp(s * 0.55, 18, 30);
        function punkt(p) { return { x: ramme.ox + p.x * s, y: ramme.oy + p.y * s }; }
        var foer = 1 - NK.klamp(e / 0.3, 0, 1), efter = NK.klamp((e - 0.7) / 0.3, 0, 1);
        var plusF = { font: "700 " + fs + "px " + FONT, farve: BLAEK, justering: "center", linje: "middle" };
        ctx.save();
        if (foer > 0) { ctx.globalAlpha = foer; var pf = punkt(sc.plus.foer); NK.tekst(ctx, "+", pf.x, pf.y, plusF); }
        if (efter > 0) { ctx.globalAlpha = efter; var pe = punkt(sc.plus.efter); NK.tekst(ctx, "+", pe.x, pe.y, plusF); }
        ctx.restore();

        /* Navnene under molekylerne */
        var ny = ramme.oy + ramme.y1 * s + 30;
        function midtX(ids, pos) {
            var a = Infinity, b = -Infinity;
            ids.forEach(function (x) { var p = pos[x]; a = Math.min(a, p.x); b = Math.max(b, p.x); });
            return ramme.ox + s * (a + b) / 2;
        }
        var nf = { font: "700 17px " + FONT, farve: BLAEK, justering: "center", linje: "middle" };
        var nu = { font: "600 14px " + FONT, farve: "#5d6878", justering: "center", linje: "middle" };
        var syreUdenVand = sc.syreIds.filter(function (x) { return !vand[x]; });
        var alkUdenVand = sc.alkoholIds.filter(function (x) { return !vand[x]; });
        if (foer > 0) {
            ctx.save();
            ctx.globalAlpha = foer;
            var xs = midtX(sc.syreIds, sc.start), xa = midtX(sc.alkoholIds, sc.start);
            NK.tekst(ctx, this.opg.syre, xs, ny, { font: nf.font, farve: FS, justering: "center", linje: "middle" });
            NK.tekst(ctx, "en carboxylsyre", xs, ny + 20, nu);
            NK.tekst(ctx, this.opg.alkohol, xa, ny, { font: nf.font, farve: FA, justering: "center", linje: "middle" });
            NK.tekst(ctx, "en alkohol", xa, ny + 20, nu);
            ctx.restore();
        }
        if (efter > 0) {
            ctx.save();
            ctx.globalAlpha = efter;
            var xe = midtX(syreUdenVand.concat(alkUdenVand), sc.slut);
            if (this.kendt.navn) this.tegnNavn(ctx, xe, ny);
            else NK.tekst(ctx, "esteren", xe, ny, nf);
            NK.tekst(ctx, "en ester", xe, ny + 20, nu);
            NK.tekst(ctx, "vand", midtX(sc.vand, sc.slut), ny, nf);
            ctx.restore();
        }
    };

    /* Navnet med alkoholdelen i orange og syredelen i groen, som i bogens figur */
    P.tegnNavn = function (ctx, x, y) {
        var a = K.alkyl(this.opg.alkohol), o = K.oat(this.opg.syre), font = "800 19px " + FONT;
        ctx.save();
        ctx.font = font;
        var wa = ctx.measureText(a).width, wo = ctx.measureText(o).width, x0 = x - (wa + wo) / 2;
        NK.tekst(ctx, a, x0, y, { font: font, farve: FA, justering: "left", linje: "middle" });
        NK.tekst(ctx, o, x0 + wa, y, { font: font, farve: FS, justering: "left", linje: "middle" });
        ctx.restore();
    };

    NK.SimKond = SimKond;
}());
