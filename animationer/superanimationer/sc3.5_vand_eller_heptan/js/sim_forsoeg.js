/* =====================================================================
   sim_forsoeg.js - fane 1: forsoeget

   Brugerens oensker: 22. okt. 2026 "inddrage lidt mere teori ... vand er
   polaert og heptan er upolaert ... Lad vaere med at tilsaette heptan".
   23. okt. 2026: teksten ind i scenen (ikke oppe i hoejre hjoerne), eleven
   skal selv svare paa flere ting og markere polaere grupper, og fanen
   begynder med, at eleven selv siger, at vand er polaert.

   Alt, eleven laeser og svarer, staar i tekstboksen paa kortet med
   formlen (js/tekstboks.js). Faserne:

     start    tre spoergsmaal (D.START): er vand polaert? er heptan
              polaert? hvad blandes et polaert stof med? Et rigtigt svar
              saetter maerket polaert/upolaert paa glasset. Proeveglasset
              er ikke fremme endnu, og skemaet er daempet.
     test     stoffet testes i begge glas (pipetten eller spatlen)
     pol      er stoffet polaert eller upolaert? (ud fra forsoeget)
     grp      klik paa de polaere grupper i formlen (iod: Ingen polaere
              grupper). Saa er stoffet faerdigt, og formlen viser polaere
              grupper blaa og carbonkaeden gul.
     faerdig  et stof, der allerede er faerdigt, er valgt igen
     fuldt    alle seks stoffer er faerdige

   Hvert spoergsmaal har én knap: Giv hint -> Vis svaret -> Naeste.
   Rigtigt svar: kort ros i groent, og eleven trykker Naeste. Forkert:
   en forklaring i roedt, og knappen lyser op.

   Seks stoffer; vand og heptan er oploesningsmidlerne og tilsaettes ikke.
   Et klik paa et tomt glas er det samme som at traekke pipetten derhen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var M = NK.Molekyle;
    var T = NK.Tegn;

    var ROS_NOEGLE = "nk-sc3.5-skema-ros";
    var POP_TID = 0.45;       /* sekunder: maerket paa glasset popper frem */
    var BESKED_TID = 3;

    function SimForsoeg() {
        this.L = new NK.Laerred(NK.el("forsoeg-laerred"));
        this.tid = 0;
        this.lay = null;
        this.g = { kaffekop: { skjult: true, iHaand: false } };
        var mig = this;
        this.tb = new NK.Tekstboks("forsoeg");
        this.tb.vedKnap = function () { mig.knap(); };

        this.bordStart();
        this.bygPanel();
        this.bygTilbud();
        if (this.laererStart) this.laererStart();
        this.startForfra();
    }

    var P = SimForsoeg.prototype;
    NK.Bord.kobl(P, { prefix: "forsoeg" });

    /* ----- Forfra: tomt skema og de tre spoergsmaal om vand og heptan ----------- */
    P.startForfra = function () {
        this.skema = {};          /* forsoegene: skema[stof][opl] = resultat */
        this.svaret = {};         /* polaert/upolaert er besvaret rigtigt */
        this.faerdige = {};       /* de polaere grupper er fundet */
        this.kendt = { vand: -1, heptan: -1 };   /* tid siden maerket kom paa glasset, -1: ikke endnu */
        this.fase = "start";
        this.startNr = 0;
        this.proevetAt = false;
        this.besked = null;
        this.stof = null;
        this.saetStof(D.FORSOEG[0]);
        this.nytSpm();
        if (this.visTilbud && this.tilbudVises) this.visTilbud(false);
        this.visPanel();
        this.visFremme();
    };

    P.saetStof = function (id) {
        this.stof = id;
        this.mol = M.laes(D.stof(id));
        this.grupper = M.grupper(this.mol);
        this.markeret = {};
        this.blink = null;
        this.nyeGlas();
    };

    P.nytSpm = function () {
        this.spm = { forkert: {}, hjaelp: 0, loest: false, valgt: null, visteSvar: false, linje: null };
        this.tb.nulstil();
        this.besked = null;
    };

    /* Det, der er fremme: proeveglasset og ankeret til rundvisningen */
    P.visFremme = function () {
        var start = this.fase === "start";
        NK.el("forsoeg-anker-proeve").hidden = start;
        NK.el("forsoeg-skema").classList.toggle("daempet", start);
    };

    P.testet = function (id) {
        var s = this.skema[id];
        return !!s && D.OPL.every(function (o) { return !!s[o]; });
    };

    P.antalUdfyldt = function () {
        var mig = this, n = 0;
        D.FORSOEG.forEach(function (id) {
            D.OPL.forEach(function (o) { if (mig.skema[id] && mig.skema[id][o]) n++; });
        });
        return n;
    };

    P.skemaFuldt = function () { return this.antalUdfyldt() === D.FORSOEG.length * D.OPL.length; };
    P.alleFaerdige = function () {
        var mig = this;
        return D.FORSOEG.every(function (id) { return mig.faerdige[id]; });
    };

    P.antalMarkeret = function () {
        var mig = this;
        return this.grupper.filter(function (g, k) { return mig.markeret[k]; }).length;
    };

    /* ----- Et stof vaelges (skemaet, piletasterne eller Naeste) ------------------ */
    P.vaelgStof = function (id) {
        if (this.fase === "start") {
            this.visBesked("Svar først på spørgsmålet om " + (this.startNr === 0 ? "vand" : this.startNr === 1 ? "heptan" : "vand og heptan") + ".");
            return;
        }
        this.saetStof(id);
        if (this.faerdige[id]) this.fase = "faerdig";
        else if (this.svaret[id]) this.fase = "grp";
        else if (this.testet(id)) this.fase = "pol";
        else this.fase = "test";
        this.nytSpm();
        this.visPanel();
    };

    /* Naeste stof, der ikke er faerdigt, efter det nuvaerende */
    P.naesteStof = function () {
        var i0 = D.FORSOEG.indexOf(this.stof), n = D.FORSOEG.length;
        for (var j = 1; j <= n; j++) {
            var id = D.FORSOEG[(i0 + j) % n];
            if (!this.faerdige[id]) { this.vaelgStof(id); return; }
        }
        this.fase = "fuldt";
        this.nytSpm();
        this.visPanel();
    };

    P.naeste = function (retning) {
        var i = D.FORSOEG.indexOf(this.stof);
        this.vaelgStof(D.FORSOEG[(i + retning + D.FORSOEG.length) % D.FORSOEG.length]);
    };

    P.nulstil = function () {
        if (this.fase === "start") return;
        this.nyeGlas();
        this.besked = null;
    };

    /* ----- Svarene ----------------------------------------------------------------- */
    /* Det rigtige svar paa det spoergsmaal, der staar nu */
    P.rigtigtSvar = function () {
        if (this.fase === "start") return D.START[this.startNr].rigtig;
        if (this.fase === "pol") return D.polId(this.stof);
        if (this.fase === "grp") return this.grupper.length === 0 ? "ingen" : null;
        return null;
    };

    P.svar = function (id) {
        var spm = this.spm;
        if (spm.loest) return;
        if (this.afvisTilbud) this.afvisTilbud();
        var rigtig = this.rigtigtSvar();
        if (id === rigtig) { this.loes(id, false); return; }
        spm.forkert[id] = true;
        var fejl;
        if (this.fase === "start") fejl = D.START[this.startNr].fejl;
        else if (this.fase === "pol") fejl = D.F1.polFejl(this.stof);
        else fejl = D.F1.ingenFejl(this.stof);
        spm.linje = { html: fejl, klasse: "skidt" };
        this.besked = null;
        this.tb.ryst();
    };

    /* Spoergsmaalet er loest: af eleven eller med Vis svaret */
    P.loes = function (id, vist) {
        var spm = this.spm, s = this.stof;
        spm.loest = true;
        spm.valgt = id;
        spm.visteSvar = vist;
        this.besked = null;
        var ros;
        if (this.fase === "start") {
            var q = D.START[this.startNr];
            ros = q.ros;
            if (q.id === "vand" || q.id === "heptan") this.kendt[q.id] = 0;
        } else if (this.fase === "pol") {
            ros = D.F1.polRos(s);
            this.svaret[s] = true;
        } else if (this.fase === "grp") {
            var mig = this;
            this.grupper.forEach(function (g, k) { mig.markeret[k] = true; });
            ros = D.F1.grpRos(s);
            this.faerdige[s] = true;
        }
        spm.linje = { html: vist ? ros.replace(/^Rigtigt\. /, "Svaret: ") : ros, klasse: vist ? "hint" : "god" };
        this.visPanel();
        if (this.fase === "grp" && this.alleFaerdige() && !NK.hent(ROS_NOEGLE, false)) {
            NK.gem(ROS_NOEGLE, true);
            this.rosVent = 1.2;
        }
    };

    /* Den ene knap: Giv hint -> Vis svaret -> Naeste */
    P.knap = function () {
        var spm = this.spm;
        if (this.fase === "fuldt") { if (NK.visFane) NK.visFane("fane-gaet"); return; }
        if (this.fase === "faerdig") { this.naesteStof(); return; }
        if (this.fase === "test") return;
        if (spm.loest) { this.videre(); return; }
        if (spm.hjaelp === 0) {
            spm.hjaelp = 1;
            var hint = this.fase === "start" ? D.START[this.startNr].hint : (this.fase === "pol" ? D.F1.polHint : D.F1.grpHint);
            spm.linje = { html: "<b>Hint:</b> " + hint, klasse: "hint" };
            this.besked = null;
            return;
        }
        spm.hjaelp = 2;
        this.loes(this.rigtigtSvar(), true);
    };

    P.videre = function () {
        if (this.fase === "start") {
            this.startNr++;
            if (this.startNr < D.START.length) { this.nytSpm(); return; }
            /* Spoergsmaalene er besvaret: nu kommer stofferne */
            this.kendt.vand = Math.max(this.kendt.vand, POP_TID);
            this.kendt.heptan = Math.max(this.kendt.heptan, POP_TID);
            this.fase = "test";
            this.saetStof(D.FORSOEG[0]);
            this.nytSpm();
            this.visFremme();
            this.visPanel();
            this.startIntro(false);
            return;
        }
        if (this.fase === "pol") { this.fase = "grp"; this.nytSpm(); return; }
        if (this.fase === "grp") { this.naesteStof(); return; }
    };

    /* ----- Krogene fra bordet -------------------------------------------------- */
    P.skjulProeve = function () { return this.fase === "start"; };
    P.maaTraekke = function () { return this.fase !== "start"; };

    P.maaTilsaette = function (i) {
        var g = this.glas[i];
        return this.fase !== "start" && !g.fuld() && !g.optaget();
    };

    P.visPraedikat = function (opl) {
        var t = this.kendt[opl];
        return t < 0 ? 0 : Math.min(1, t / POP_TID);
    };

    P.klikGlas = function (i) {
        var g = this.glas[i];
        if (this.fase === "start") {
            this.visBesked("Glasset med " + D.navn(D.OPL[i]) + ". Svar på spørgsmålet på kortet.");
            return;
        }
        if (g.optaget()) return;
        if (g.portioner === 0) {
            if (this.pipHjemme() && this.maaTilsaette(i)) this.sendTil(i);
            return;
        }
        g.ryst();
        if (this.afvisTilbud) this.afvisTilbud();
    };

    P.efterTilsaet = function () {
        this.proevetAt = true;
        this.besked = null;
    };

    P.klikProeve = function () {
        this.visBesked("Træk " + this.redskabNavn() + " ned i et af glassene.");
    };

    P.slipVed = function () {
        this.visBesked("Slip " + this.redskabNavn() + " over et af glassene.");
    };

    /* Klik paa kortet: i fasen grp markeres de polaere grupper */
    P.klikKort = function (pt) {
        if (this.fase === "start") { this.visBesked("Svar med knapperne på kortet."); return; }
        if (this.fase !== "grp" || this.spm.loest) {
            if (this.fase === "test") this.visBesked("Først tester du " + D.navn(this.stof) + " i glassene.");
            else if (this.fase === "pol") this.visBesked("Svar først: er " + D.navn(this.stof) + " polært eller upolært?");
            return;
        }
        var a = this.plan ? M.atomVed(this.mol, this.plan, pt.x, pt.y) : -1;
        if (a < 0) return;
        var k = -1;
        this.grupper.forEach(function (g, j) { if (g.atomer.indexOf(a) >= 0) k = j; });
        if (k >= 0) {
            if (this.afvisTilbud) this.afvisTilbud();
            var ny = !this.markeret[k];
            this.markeret[k] = true;
            this.spm.linje = null;
            if (this.antalMarkeret() === this.grupper.length) { this.loes(null, false); return; }
            if (!ny) this.visBesked(M.GRUPPENAVN[this.grupper[k].slags] + " er allerede markeret.");
            else this.besked = null;
        } else {
            this.blink = { atom: a, t: 1 };
            var el = this.mol.atomer[a].el;
            this.visBesked(el === "I" ? "I₂ har to ens atomer. Bindingen er upolær."
                                      : (el === "C" ? "C-atomet hører til carbonkæden. Den er upolær." : "H på et C-atom er upolært."));
        }
    };

    P.kortMarkoer = function (pt) {
        if (this.fase !== "grp" || this.spm.loest || !this.plan) return "default";
        return M.atomVed(this.mol, this.plan, pt.x, pt.y) >= 0 ? "pointer" : "default";
    };

    P.visTraekPil = function () {
        return this.fase === "test" && !this.proevetAt && this.glas[0].tom() && this.glas[1].tom();
    };

    P.redskabNavn = function () { return this.redskab() === "spatel" ? "spatlen" : "pipetten"; };

    P.visBesked = function (html) { this.besked = { html: html, t: BESKED_TID }; };

    /* ----- Tegneloekken ----------------------------------------------------------- */
    P.opdater = function (dt) {
        this.tid += dt;
        this.bordOpdater(dt);
        var mig = this;
        D.OPL.forEach(function (o) { if (mig.kendt[o] >= 0) mig.kendt[o] += dt; });
        this.glas.forEach(function (g) {
            if (!g.nyt) return;
            g.nyt = false;
            mig.skema[mig.stof] = mig.skema[mig.stof] || {};
            mig.skema[mig.stof][g.opl] = g.resultat;
            if (mig.afvisTilbud) mig.afvisTilbud();
            /* Begge glas er testet: saa kommer spoergsmaalet */
            if (mig.fase === "test" && mig.testet(mig.stof)) {
                mig.fase = mig.svaret[mig.stof] ? (mig.faerdige[mig.stof] ? "faerdig" : "grp") : "pol";
                mig.nytSpm();
            }
            mig.visPanel();
            if (mig.skemaFuldt() && !NK.hent(ROS_NOEGLE, false) && mig.alleFaerdige()) {
                NK.gem(ROS_NOEGLE, true);
                mig.rosVent = 1.2;
            }
        });
        /* Paaskeaegget: at ryste et glas, der for laengst er faerdigt */
        if (!this.paaskeVist) {
            this.glas.forEach(function (g) {
                if (!mig.paaskeVist && g.resultat && g.rystEfter >= 6 && mig.laererRyst) {
                    mig.paaskeVist = true;
                    mig.laererRyst(g.resultat.blandes);
                }
            });
        }
        if (this.rosVent > 0) {
            this.rosVent -= dt;
            if (this.rosVent <= 0 && this.laererSkema) this.laererSkema();
        }
        if (this.blink) {
            this.blink.t -= dt * 1.4;
            if (this.blink.t <= 0) this.blink = null;
        }
        if (this.besked) {
            this.besked.t -= dt;
            if (this.besked.t <= 0) this.besked = null;
        }
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
        this.visTb();
    };

    P.tegn = function () {
        if (!this.lay) return;
        this.bordTegn();
        if (this.laererTegnOver) this.laererTegnOver(this.L.ctx);
    };

    /* ----- Kortet: navnet, formlen og (i starten) vand og heptan ------------------- */
    P.tegnKortet = function (ctx) {
        var lay = this.lay, f = lay.formel;
        this.plan = null;
        if (this.fase === "start") {
            var hvad = D.START[this.startNr].kort;
            if (hvad === "begge") { this.tegnBegge(ctx); return; }
            var opl = D.stof(hvad), mol = M.laes(opl);
            T.kort(ctx, lay.kort, opl, {});
            var plan = M.plan(mol, f, hvad === "vand" ? 56 : 46);
            M.tegn(ctx, mol, plan, {});
            if (hvad === "vand") T.delta(ctx, mol, plan);
            return;
        }
        var s = D.stof(this.stof);
        var spoerg = this.fase === "grp" && !this.spm.loest;
        var lys = spoerg && this.antalMarkeret() === 0 ? 0.5 + 0.5 * Math.sin(this.tid * 5) : 0;
        T.kort(ctx, lay.kort, s, { lys: lys });
        this.plan = M.plan(this.mol, f, 46);
        M.tegn(ctx, this.mol, this.plan, {
            grupper: this.grupper, markeret: this.markeret,
            facit: !!this.faerdige[this.stof] && !spoerg, blink: this.blink
        });
    };

    /* Det tredje spoergsmaal: vand og heptan side om side med deres maerker */
    P.tegnBegge = function (ctx) {
        var lay = this.lay, f = lay.formel;
        T.kort(ctx, lay.kort, { navn: "Vand og heptan", formel: "" }, {});
        /* Side om side, eller under hinanden, naar formelfeltet er hoejt og smalt */
        var pill = 34, stablet = f.b < 1.6 * f.h, felter;
        if (stablet) {
            var hV = f.h * 0.42;
            felter = { vand: { x: f.x, y: f.y, b: f.b, h: hV - pill }, heptan: { x: f.x, y: f.y + hV, b: f.b, h: f.h - hV - pill } };
        } else {
            felter = { vand: { x: f.x, y: f.y, b: f.b * 0.32, h: f.h - pill }, heptan: { x: f.x + f.b * 0.36, y: f.y, b: f.b * 0.64, h: f.h - pill } };
        }
        var u = Math.min(M.plan(M.laes(D.stof("heptan")), felter.heptan, 40).u, M.plan(M.laes(D.stof("vand")), felter.vand, 40).u);
        /* Maerket lige under molekylet (under δ+ ved vand); side om side paa samme hoejde */
        var pillY = {};
        ["vand", "heptan"].forEach(function (id) {
            var mol = M.laes(D.stof(id)), g = M.graense(mol), plan = M.plan(mol, felter[id], u);
            var bund = plan.oy + g.y1 * u + (id === "vand" ? Math.max(u * 0.6, 13) + 9 : u * 0.3);
            pillY[id] = Math.min(bund + 14, felter[id].y + felter[id].h + pill / 2);
        });
        if (!stablet) pillY.vand = pillY.heptan = Math.max(pillY.vand, pillY.heptan);
        ["vand", "heptan"].forEach(function (id) {
            var mol = M.laes(D.stof(id)), r = felter[id];
            var plan = M.plan(mol, r, u);
            M.tegn(ctx, mol, plan, {});
            if (id === "vand") T.delta(ctx, mol, plan);
            T.praedikat(ctx, r.x + r.b / 2, pillY[id], D.polaritet(id), D.polaer(id), 13);
        });
    };

    /* ----- Tekstboksen: hele tiden det, fasen spoerger om ---------------------------- */
    function glasNavn(opl) { return opl === "vand" ? "vandglasset" : "heptanglasset"; }

    /* Linjen under testen: naeste skridt med glassene */
    P.testLinje = function () {
        var s = D.stof(this.stof), g = this.glas;
        var redskab = this.redskabNavn();
        if (this.pip.tilstand === "traek") {
            return this.over >= 0 ? "Slip, så " + (s.tilstand === "fast" ? "kommer stoffet" : "drypper den") + " ned i " + glasNavn(D.OPL[this.over]) + "."
                                  : "Hen over et af glassene.";
        }
        var i;
        for (i = 0; i < 2; i++) {
            if (g[i].mereAtRyste()) return "Der ligger stadig " + s.navn + " på bunden af " + glasNavn(g[i].opl) + ". <b>Ryst igen.</b>";
        }
        for (i = 0; i < 2; i++) {
            if (g[i].portioner > 0 && !g[i].rystet && !g[i].optaget()) return "<b>Klik på " + glasNavn(g[i].opl) + "</b> for at ryste det.";
        }
        for (i = 0; i < 2; i++) {
            if (g[i].optaget() || (g[i].rystet && !g[i].resultat)) return "Vent, til det har lagt sig.";
        }
        for (i = 0; i < 2; i++) {
            if (g[i].resultat && !g[1 - i].resultat) {
                return D.Navn(this.stof) + " i " + D.navn(g[i].opl) + ": <b>" + g[i].resultat.obs + "</b>. Test nu i " + glasNavn(g[1 - i].opl) + ".";
            }
        }
        if (g[0].resultat && g[1].resultat) return "Begge glas er testet.";
        return "<b>Træk " + redskab + "</b> med " + s.navn + " ned i et af glassene, og klik på glasset for at ryste det.";
    };

    P.svarListe = function () {
        if (this.fase === "start") return D.START[this.startNr].svar;
        if (this.fase === "pol") return D.POL_SVAR;
        if (this.fase === "grp") return [{ id: "ingen", tekst: D.F1.ingen }];
        return [];
    };

    P.visTb = function () {
        var tb = this.tb, spm = this.spm, fase = this.fase, s = this.stof, mig = this;
        var tekst, linje = "", klasse = "";
        if (fase === "start") {
            tekst = D.START[this.startNr].spm;
            linje = D.START[this.startNr].kontekst;
        } else if (fase === "test") {
            tekst = D.F1.test(s);
            linje = this.testLinje();
        } else if (fase === "pol") {
            tekst = D.F1.pol(s);
            linje = D.obsSaetning(s);
        } else if (fase === "grp") {
            tekst = D.F1.grp(s);
            linje = D.F1.fundet(this.antalMarkeret());
        } else if (fase === "faerdig") {
            tekst = D.Navn(s) + " er " + D.polaritet(s) + ".";
            linje = D.obsSaetning(s) + " " + D.stof(s).hvorfor;
        } else {
            tekst = D.F1.fuldt;
            linje = D.F1.fuldtLinje;
        }
        if (spm.linje) { linje = spm.linje.html; klasse = spm.linje.klasse; }
        if (this.besked && !(spm.linje && spm.loest)) { linje = this.besked.html; klasse = ""; }
        tb.tekst(tekst);
        tb.linje(linje, klasse);
        tb.svar(this.svarListe(), function (id) { mig.svar(id); });
        var tilstande = {};
        Object.keys(spm.forkert).forEach(function (id) { tilstande[id] = "forkert"; });
        if (spm.loest && spm.valgt) tilstande[spm.valgt] = spm.visteSvar ? "valgt" : "rigtig";
        tb.svarTilstand(tilstande, spm.loest);
        if (fase === "test") tb.knap(null);
        else if (fase === "fuldt") tb.knap("Til fane 2 →", "naeste");
        else if (fase === "faerdig" || spm.loest) tb.knap(fase === "start" && this.startNr === D.START.length - 1 ? "Test stofferne →" : "Næste →", "naeste");
        else tb.knap(spm.hjaelp === 0 ? "Giv hint" : "Vis svaret", spm.hjaelp === 0 ? "hjaelp" : "svar");
    };

    /* ----- Panelet: skemaet, der ogsaa er valget af stof ---------------------------- */
    P.bygPanel = function () {
        var mig = this, tb = NK.el("forsoeg-raekker");
        this.raekker = {};
        D.FORSOEG.forEach(function (id) {
            var s = D.stof(id);
            var tr = document.createElement("tr");
            tr.className = "skema-raekke";
            tr.setAttribute("data-stof", id);
            var navn = document.createElement("th");
            navn.scope = "row";
            var knap = document.createElement("button");
            knap.type = "button";
            knap.className = "skema-stof";
            knap.innerHTML = NK.html(s.navn) + "<em>" + NK.formel(s.formel) + "<span class=\"skema-pol\"></span></em>";
            knap.addEventListener("click", function () { knap.blur(); mig.vaelgStof(id); });
            navn.appendChild(knap);
            tr.appendChild(navn);
            var celler = {};
            D.OPL.forEach(function (o) {
                var td = document.createElement("td");
                td.className = "skema-celle";
                td.addEventListener("click", function () { mig.vaelgStof(id); });
                tr.appendChild(td);
                celler[o] = td;
            });
            tb.appendChild(tr);
            mig.raekker[id] = { tr: tr, celler: celler, pol: knap.querySelector(".skema-pol") };
        });
        NK.saetTekst("forsoeg-felter", String(D.FORSOEG.length * D.OPL.length));
        NK.el("forsoeg-nulstil").addEventListener("click", function () { mig.startForfra(); });
        NK.el("forsoeg-spring").addEventListener("click", function () { mig.springIntro(); });
    };

    P.visPanel = function () {
        var mig = this;
        D.FORSOEG.forEach(function (id) {
            var r = mig.raekker[id];
            r.tr.classList.toggle("valgt", id === mig.stof && mig.fase !== "start" && mig.fase !== "fuldt");
            D.OPL.forEach(function (o) {
                var res = mig.skema[id] && mig.skema[id][o];
                var td = r.celler[o];
                td.className = "skema-celle" + (res ? (res.blandes ? " ja" : " nej") : "");
                td.textContent = res ? (res.blandes ? "✓ " : "✗ ") + res.obs : "";
            });
            /* Polaert eller upolaert under navnet, naar eleven har svaret */
            var t = !!mig.svaret[id];
            r.pol.textContent = t ? D.polaritet(id) : "";
            r.pol.className = "skema-pol" + (t ? (D.polaer(id) ? " polaer" : " upolaer") : "");
        });
        NK.saetTekst("forsoeg-udfyldt", String(this.antalUdfyldt()));
        NK.el("forsoeg-skema").classList.toggle("sejr", this.alleFaerdige());
    };

    /* ----- Tastatur ----------------------------------------------------------------- */
    P.tast = function (key) {
        if (this.fase === "start") return key === " " || key === "ArrowDown" || key === "ArrowUp";
        if (key === "ArrowDown") { this.naeste(1); return true; }
        if (key === "ArrowUp") { this.naeste(-1); return true; }
        if (key === " ") {
            this.glas.forEach(function (g) { if (g.portioner > 0) g.ryst(); });
            return true;
        }
        return false;
    };

    /* Enter: Naeste, naar knappen siger det */
    P.enter = function () {
        if (this.fase === "faerdig" || this.fase === "fuldt" || this.spm.loest) this.knap();
    };

    P.fokus = function () {};

    /* ----- Kemichaels praesentation --------------------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc3.5-intro-forsoeg", tilbud: "forsoeg-tilbud", spring: "forsoeg-spring" });

    /* Mens spoergsmaalene om vand og heptan staar, tilbydes praesentationen
       ikke (den handler om pipetten, der ikke er fremme endnu). */
    var startIntro = P.startIntro;
    P.startIntro = function (tving) {
        if (this.fase === "start" && !tving) return;
        return startIntro.call(this, tving);
    };

    NK.SimForsoeg = SimForsoeg;

    /* Til selvtesten */
    SimForsoeg.molekyle = function (id) { return M.laes(D.stof(id)); };
}());
