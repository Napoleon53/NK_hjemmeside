/* =====================================================================
   sim_hurtig.js - fane 3: Hurtigrunden

   Tolv korte spoergsmaal paa tid, blandet af formlen (n = ?, m = ?,
   M = ?), enhederne, navnene, enheder der gaar ud med hinanden og
   hovedregning med nemme tal. Eleven klikker paa et svar (eller taster
   1 til 4). De forkerte svar er de fejl, elever laver, og hvert har sin
   forklaring. Et forkert svar giver tidsstraf (D.STRAF, 10 s), og spoergsmaalet
   kommer igen senere i runden, saa formlen hentes frem flere gange.
   Den bedste tid huskes i browseren.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;

    var NOEGLE = "nk-sc5.3-hurtig";

    var HINT = {
        formel: "Tænk på enhederne: g, mol og g/mol. Hvilken regning giver den rigtige enhed?",
        enhed: "Molarmassen er massen af 1 mol. Massen vejes på en vægt.",
        navn: "Lille m og stort M er to forskellige ting. Det er lille n og stort N også.",
        forkort: "Ens enheder over og under brøkstregen går ud med hinanden.",
        n: "Stofmængden er massen delt med molarmassen.",
        m: "Isolér m i n = m / M.",
        M: "Isolér M i n = m / M."
    };

    /* Et tal til hovedregning: hoejst tre cifre og ingen nuller til sidst */
    function tal(v) {
        return NK.betydende(v, 3).replace(/(,\d*?)0+$/, "$1").replace(/,$/, "");
    }

    /* Et spoergsmaal med tal: n, m eller M skal findes */
    SimHurtig.talSpm = function (slags, p) {
        var m = p.m, M = p.M, n = m / M, sp;
        if (slags === "n") {
            sp = { spm: "m = " + tal(m) + " g og M = " + tal(M) + " g/mol. n = ?", svar: [
                [tal(n) + " mol", ""], [tal(M / m) + " mol", "Vendt om. Massen står øverst: n = m / M."],
                [tal(m * M) + " mol", "Ganget. Enheden ville blive g²/mol, ikke mol."],
                [tal(n) + " g", "Tallet er rigtigt, men stofmængden er i mol."]],
                forkl: "n = " + tal(m) + " g / " + tal(M) + " g/mol = " + tal(n) + " mol." };
        } else if (slags === "m") {
            sp = { spm: "n = " + tal(n) + " mol og M = " + tal(M) + " g/mol. m = ?", svar: [
                [tal(m) + " g", ""], [tal(M / n) + " g", "Delt. Massen er stofmængde gange molarmasse."],
                [tal(n / M) + " g", "Delt. Massen er stofmængde gange molarmasse."],
                [tal(m) + " mol", "Tallet er rigtigt, men massen er i g."]],
                forkl: "m = " + tal(n) + " mol · " + tal(M) + " g/mol = " + tal(m) + " g." };
        } else {
            sp = { spm: "m = " + tal(m) + " g og n = " + tal(n) + " mol. M = ?", svar: [
                [tal(M) + " g/mol", ""], [tal(n / m) + " g/mol", "Vendt om. Massen står øverst: M = m / n."],
                [tal(m * n) + " g/mol", "Ganget. Molarmassen er massen delt med stofmængden."],
                [tal(M) + " mol/g", "Tallet er rigtigt, men molarmassen er i g/mol."]],
                forkl: "M = " + tal(m) + " g / " + tal(n) + " mol = " + tal(M) + " g/mol." };
        }
        /* Ingen to svar maa se ens ud */
        var set = {}, svar = [];
        sp.svar.forEach(function (s) { if (!set[s[0]]) { set[s[0]] = 1; svar.push(s); } });
        return { slags: "tal", hint: HINT[slags], spm: sp.spm, forkl: sp.forkl,
                 svar: svar.map(function (s) { return s[0]; }), fejl: svar.map(function (s) { return s[1]; }) };
    };

    /* En ny runde: D.RUNDE siger, hvor mange af hver slags */
    SimHurtig.lavRunde = function () {
        var ud = [];
        Object.keys(D.RUNDE).forEach(function (slags) {
            var antal = D.RUNDE[slags];
            if (slags === "tal") {
                var par = NK.bland(D.HURTIG_TAL), typer = ["n", "n", "m", "M"];
                for (var i = 0; i < antal; i++) ud.push(SimHurtig.talSpm(typer[i % typer.length], par[i % par.length]));
                return;
            }
            NK.bland(D.HURTIG.filter(function (q) { return q.slags === slags; })).slice(0, antal).forEach(function (q) {
                ud.push({ slags: q.slags, hint: HINT[q.slags], spm: q.spm, forkl: q.forkl, svar: q.svar.slice(), fejl: q.fejl.slice() });
            });
        });
        return NK.bland(ud);
    };

    function SimHurtig() {
        this.over = null;
        this.startFane([]);
        this.el.tid = NK.el("hurtig-tid");
        var gemt = NK.hent(NOEGLE, {}) || {};
        this.rekord = gemt.r || 0;
        this.introNu = true;
        this.tilstand = "klar";
        this.faerdig = true;
        this.nulstilRunde();
        this.besked("", "");
        this.visKnap();
        this.visTal();
    }

    var P = SimHurtig.prototype;
    /* Pladsen oeverst i scenen til papirkortet: almindelig og lav skaerm */
    var ZONE = [176, 156];
    NK.Fane.paa(P, { navn: "hurtig", zone: ZONE });

    P.nulstilRunde = function () {
        this.koe = [];
        this.nuv = null;
        this.valg = [];
        this.tidBrugt = 0;
        this.straf = 0;
        this.fejl = 0;
        this.rigtige = 0;
        this.antal = 0;
        this.flash = null;
        this.strafT = 0;
        this.hjaelp = 0;
        this.nyRekord = false;
        this.prikker = [];
        this.venter = false;
        this.res = null;
        this.valgtSvar = null;
    };

    /* ----- Runden ------------------------------------------------------------------- */
    P.start = function () {
        this.nulstilRunde();
        this.koe = SimHurtig.lavRunde();
        this.koe.forEach(function (q, i) { q.nr = i; });
        this.antal = this.koe.length;
        this.prikker = this.koe.map(function () { return 0; });
        this.tilstand = "koerer";
        this.faerdig = false;
        this.naeste();
    };

    P.harForfra = function () { return true; };
    P.forfra = function () { this.start(); };

    P.naeste = function () {
        this.hjaelp = 0;
        this.flash = null;
        this.venter = false;
        this.res = null;
        this.valgtSvar = null;
        if (!this.koe.length) { this.slut(); return; }
        this.nuv = this.koe.shift();
        if (this.nuv.forkert) this.nuv.igen = true;
        var idx = NK.bland(this.nuv.svar.map(function (s, i) { return i; }));
        var q = this.nuv;
        this.valg = idx.map(function (i) { return { tekst: q.svar[i], ok: i === 0, fejl: q.fejl[i] }; });
        this.besked(this.trinLinje(), "");
        this.layout();
        this.visKnap();
    };

    P.retIndeks = function () {
        var ret = 0;
        this.valg.forEach(function (v, j) { if (v.ok) ret = j; });
        return ret;
    };

    /* Svaret er sendt med Indsend svar (et klik paa et svar vaelger kun).
       Kortet bliver paa spoergsmaalet, til eleven trykker Naeste; uret
       staar stille imens. */
    P.svar = function (i) {
        if (this.tilstand !== "koerer" || this.venter || !this.valg[i]) return;
        var v = this.valg[i], q = this.nuv;
        if (v.ok) {
            this.rigtige++;
            if (!q.forkert) this.prikker[q.nr] = 1;
            this.flash = { i: i, ok: true, t: 0 };
            this.res = { i: i, ok: true, html: NK.html(q.forkl) };
            this.venter = true;
            this.besked("", "");
        } else {
            this.forkert(i, NK.html(v.fejl) + " " + NK.html(q.forkl));
        }
        this.visKnap();
        this.visTal();
    };

    /* Forkert eller Vis svaret: det rigtige vises, og spoergsmaalet kommer igen */
    P.forkert = function (i, html) {
        var q = this.nuv;
        this.fejl++;
        this.straf += D.STRAF;
        this.strafT = 1.2;
        q.forkert = true;
        this.prikker[q.nr] = -1;
        var ret = this.retIndeks();
        this.flash = { i: i, ok: false, ret: ret, t: 0 };
        this.res = { i: i, ok: false, ret: ret, html: html };
        this.venter = true;
        this.besked("", "");
        /* Tilbage i koeen, helst mindst tre spoergsmaal senere */
        var pos = Math.min(this.koe.length, 3);
        this.koe.splice(pos, 0, q);
    };

    P.naesteSpm = function () { if (this.venter) this.naeste(); };

    P.slut = function () {
        this.tilstand = "slut";
        this.faerdig = true;
        this.nuv = null;
        this.valg = [];
        var samlet = Math.round(this.tidBrugt) + this.straf;
        this.samlet = samlet;
        this.nyRekord = !this.rekord || samlet < this.rekord;
        if (this.nyRekord) {
            this.rekord = samlet;
            NK.gem(NOEGLE, { r: samlet });
        }
        this.besked("", "");
        this.layout();
        this.visKnap();
        this.visTal();
    };

    /* ----- Papirkortet (6. nov. 2026): spoergsmaalet, svarene, hint og
       Indsend svar; foer runden og efter den teksten og knappen videre ------ */
    P.kortData = function () {
        var mig = this;
        if (this.tilstand === "klar") {
            return { slags: "opgave", chip: "Hurtigrunden", videre: "Start runden →",
                     tekst: D.HURTIG_ANTAL + " spørgsmål om stofmængde, masse og molarmasse. Svar så hurtigt, du kan. Et forkert svar giver tidsstraf, og spørgsmålet kommer igen." };
        }
        if (this.tilstand === "slut") {
            var t = "Runden er slut: " + this.samlet + " s" + (this.straf ? " (heraf " + this.straf + " s i tidsstraf)" : "") + ". " +
                (this.nyRekord ? "Ny rekord." : "Rekorden er " + this.rekord + " s.");
            return { slags: "opgave", chip: "Hurtigrunden", tekst: t, videre: "Ny runde →" };
        }
        var q = this.nuv, n = this.antal;
        var chip = (q.igen ? "Igen: s" : "S") + "pørgsmål " + (q.nr + 1) + " af " + n;
        if (this.venter) {
            var r = this.res;
            return { slags: "loest", bliv: true, gul: !r.ok, chip: chip, tekst: q.spm, html: r.html,
                     videre: this.koe.length ? "Næste spørgsmål →" : "Se resultatet →",
                     svar: this.valg.map(function (v, j) {
                         return { j: j, t: v.tekst, rigtig: r.ok && j === r.i, svarVist: !r.ok && j === r.ret, forkert: !r.ok && j === r.i,
                                  dim: j !== r.i && !(!r.ok && j === r.ret), laast: true };
                     }) };
        }
        return { slags: "spm", chip: chip, tekst: q.spm,
                 svar: this.valg.map(function (v, j) { return { j: j, t: v.tekst, valgt: mig.valgtSvar === j }; }) };
    };

    P.kortValg = function (j) { this.vaelgKortSvar(j); };
    P.spmAaben = function () { return this.tilstand === "koerer" && !this.venter; };
    P.sendSvar = function (j) { this.svar(j); };

    /* ----- Knappen: Giv hint (koster tid), Vis svaret; videre paa kortet ----- */
    P.visKnap = function () {
        var e = this.el.knap, koerer = this.tilstand === "koerer" && !this.venter;
        this.visSceneKort();
        e.hidden = !koerer;
        e.textContent = this.hjaelp === 0 ? "Giv hint (koster tid)" : "Vis svaret";
        e.className = this.hjaelp === 0 ? "knap hjaelp" : "knap hjaelp svar";
        e.disabled = false;
        this.visIndsend();
        this.visBund();
    };

    P.knap = function () {
        if (this.tilstand !== "koerer") { this.start(); return; }
        if (this.venter) { this.naesteSpm(); return; }
        if (!this.nuv) return;
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.straf += D.STRAF_HINT;
            this.strafT = 1.2;
            this.hjaelpVis(NK.html(this.nuv.hint));
        } else {
            this.valgtSvar = null;
            this.forkert(-1, NK.html(this.nuv.svar[0]) + ". " + NK.html(this.nuv.forkl));
        }
        this.visKnap();
        this.visTal();
    };

    P.trinInfo = function () { return null; };
    P.opgaveFaerdig = function () { return this.tilstand === "slut"; };
    P.trinLinje = function () {
        if (this.tilstand === "koerer" && !this.venter) return "Vælg et svar, og tryk på Indsend svar. Tast 1 til " + this.valg.length + " og Enter går også.";
        return "";
    };
    P.enter = function () {
        if (this.tilstand !== "koerer") { this.start(); return; }
        if (this.venter) { this.naesteSpm(); return; }
        this.indsendKlik();
    };
    P.nulstil = function () { this.start(); };
    P.fokus = function () { };
    P.harNyeTal = function () { return false; };

    /* Tallene 1 til 4 vaelger et svar, mens runden koerer */
    P.tast = function (key) {
        if (this.tilstand !== "koerer" || this.venter) return false;
        var i = parseInt(key, 10);
        if (i >= 1 && i <= this.valg.length) { this.kortValg(i - 1); return true; }
        return false;
    };

    /* Panelet: tiden, de rigtige, fejlene og rekorden */
    P.visTal = function () {
        var tid = this.tilstand === "slut" ? this.samlet : Math.floor(this.tidBrugt) + this.straf;
        NK.saetTekst("hurtig-tid", tid + " s");
        var foerste = this.prikker.filter(function (p) { return p === 1; }).length;
        NK.saetTekst("hurtig-rigtige", foerste + "/" + (this.antal || D.HURTIG_ANTAL));
        NK.saetTekst("hurtig-fejl", String(this.fejl));
        NK.saetTekst("hurtig-rekord", this.rekord ? this.rekord + " s" : "ingen endnu");
    };

    /* ----- Tid ------------------------------------------------------------------------ */
    P.opdaterScene = function (dt) {
        if (this.tilstand === "koerer" && !this.venter) {
            this.tidBrugt += dt;
            this.visTal();
        }
        if (this.flash) this.flash.t += dt;
        if (this.strafT > 0) this.strafT = Math.max(0, this.strafT - dt);
    };

    /* ----- Musen: svarene staar paa kortet; et klik i scenen faar det til at blinke */
    P.overScene = function () { this.over = null; return null; };

    P.nedScene = function () {
        this.blinkKort();
        if (this.tilstand !== "koerer") this.kortBesked("Tryk på knappen på kortet for at begynde.", 3);
        else if (!this.venter) this.kortBesked("Vælg et svar på kortet, og tryk på Indsend svar.", 3);
        return false;
    };

    /* ----- Layout -------------------------------------------------------------------- */
    function erFormel(t) { return /^[nmM =·\/]+$/.test(t); }

    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var zone = this.kortZone();
        var y0 = 10 + zone + 8;
        var R = { x: 16, y: y0, b: W - 32, h: Math.max(140, H - y0 - 24) };
        var lay = { W: W, H: H, Hs: H, tavle: R, zone: zone };
        lay.spmPx = NK.klamp(Math.min(R.h * 0.1, R.b / 20), 18, 40);
        this.lay = lay;
        this.saetAnker("tavle", R.x, R.y, R.b, R.h);
        this.saetAnker("svar", R.x, 10, R.b, zone);
    };

    /* ----- Tegn ----------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, mig = this;
        if (!lay) return;
        var R = lay.tavle;
        this.L.ryd();
        Tg.rum(ctx, lay.W, lay.Hs, lay.Hs);
        Tg.tavle(ctx, R);
        var moerk = "#1f2530", svag = "#6a7280";
        var lille = NK.klamp(lay.spmPx * 0.42, 12, 15);

        if (this.tilstand !== "koerer") {
            NK.tekst(ctx, "Hurtigrunden", R.x + R.b / 2, R.y + R.h * 0.2, { font: Tg.font("800", Math.round(lay.spmPx * 1.1)), justering: "center", linje: "middle", farve: moerk });
            var linjer = this.tilstand === "slut" ?
                [this.samlet + " s" + (this.straf ? ", heraf " + this.straf + " s i tidsstraf" : ""), this.nyRekord ? "Ny rekord" : "Rekorden er " + this.rekord + " s"] :
                [D.HURTIG_ANTAL + " spørgsmål om stofmængde, masse og molarmasse.", "Et forkert svar giver tidsstraf, og spørgsmålet kommer igen."];
            linjer.forEach(function (t, i) {
                var px = NK.passendeSkrift(ctx, t, R.b - 40, NK.klamp(lay.spmPx * 0.6, 14, 22), 12, "600");
                NK.tekst(ctx, t, R.x + R.b / 2, R.y + R.h * (0.34 + i * 0.1), { font: Tg.font("600", px), justering: "center", linje: "middle",
                    farve: i === 1 && mig.nyRekord ? "#1d7a48" : "#3a4150" });
            });
            return;
        }

        /* Prikkerne: et for hvert spoergsmaal */
        var n = this.prikker.length, pr = NK.klamp(R.b / (n * 3.2), 5, 9);
        var py = R.y + Math.max(22, R.h * 0.09);
        for (var i = 0; i < n; i++) {
            var x = R.x + 24 + i * pr * 2.7;
            ctx.beginPath();
            ctx.arc(x, py, pr, 0, Math.PI * 2);
            ctx.fillStyle = this.prikker[i] === 1 ? "#3fae72" : (this.prikker[i] === -1 ? "#e05446" : "rgba(60, 72, 90, 0.15)");
            ctx.fill();
            if (this.nuv && this.nuv.nr === i) {
                ctx.strokeStyle = "#e0a82e";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(x, py, pr + 3, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        var tid = Math.floor(this.tidBrugt) + this.straf;
        /* Spoergsmaalet og svarene staar paa papirkortet. Tavlen viser, hvor
           langt runden er, og uret (stort, saa det kan ses fra bagerste raekke). */
        var k = this.prikker.filter(function (p) { return p !== 0; }).length;
        var stor = Math.round(NK.klamp(Math.min(R.h * 0.3, R.b / 8), 30, 110));
        NK.tekst(ctx, tid + " s", R.x + R.b / 2, R.y + R.h * 0.5, { font: "700 " + stor + "px Consolas, monospace", justering: "center", linje: "middle", farve: moerk });
        NK.tekst(ctx, k + " af " + n + " besvaret" + (this.venter ? ". Uret står stille." : ""), R.x + R.b / 2, R.y + R.h * 0.5 + stor * 0.75,
            { font: Tg.font("600", NK.klamp(lay.spmPx * 0.6, 14, 22)), justering: "center", linje: "middle", farve: "#3a4150" });
        if (this.strafT > 0) {
            ctx.save();
            ctx.globalAlpha = Math.min(1, this.strafT);
            NK.tekst(ctx, "Tidsstraf", R.x + R.b / 2, R.y + R.h * 0.5 - stor * 0.8 - (1.2 - this.strafT) * 10,
                { font: Tg.font("800", Math.round(NK.klamp(lay.spmPx * 0.7, 16, 26))), justering: "center", linje: "middle", farve: "#c0392b" });
            ctx.restore();
        }
    };

    NK.SimHurtig = SimHurtig;
}());
