/* =====================================================================
   sim_forsoeg.js - fane 1: Varm og vej

   Runde T13 (28. nov. 2026) efter REGELSAET. Fanen har sin egen fil og
   bruger ikke js/fane.js; opgaverne staar i js/forsoeg_opgaver.js og
   D.OPG_FORSOEG i js/data.js. Fane 2 og 3 bruger stadig js/fane.js.

     * Intet panel (REGELSAET 2-3): fire opgaver i raekken oeverst i
       scenen (Massen før, Varm natronen, Konstant masse, Hvad er
       tilbage?) med Start forfra og Fri leg yderst til hoejre, og kortet
       centreret under raekken.
     * Scenen fra venstre: natronglasset, trefoden med braenderen og
       vaegten med diglen, luppen og et lyst ark med Vejningerne og grafen.
       Forsoeget staar samlet i midten, ogsaa paa en stor skaerm (REGELSAET 32).
     * Delene dukker op, naar de bruges (REGELSAET 13): arket efter
       startmassen, grafen efter den foerste vejning efter opvarmningen,
       luppen og uret, naar braenderen er taendt, og knapperne Sluk, Lav og
       Høj, naar kortet beder om dem (REGELSAET 19a). Indtil da er arket og
       luppen stiplede pladser.
     * Luppen har ingen farveforklaring (REGELSAET 24) og en kegle fra et
       forstoerrelsesglas paa diglen (REGELSAET 25).
     * Uret staar over trefoden, og diglens temperatur staar ved diglen.

   Modellen er den samme som foer (js/kemi.js): 1 sekund er 1 minut, hoej
   flamme fra start faar pulveret til at sproejte, og en varm digel vejer
   for lidt. Maalingen gemmes og bruges paa fane 2 og i journalen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var T = NK.Tjek;
    var Tg = NK.Tegn;

    function lex(v, px) { return v + " " + (Math.round(px * 10) / 10) + "px Lexend, 'Segoe UI', sans-serif"; }

    /* ----- Maalingen deles med fane 2 og huskes i browseren ----------------------- */
    var NOEGLE_MAAL = "nk-sc5.7-maaling";
    var NOEGLE_GAET = "nk-sc5.7-gaet";
    NK.minMaaling = (function () {
        var g = NK.hent(NOEGLE_MAAL, null);
        if (g && g.mf > 0 && g.slut > 0 && g.vejninger && g.vejninger.length >= 2) return g;
        return null;
    }());
    NK.gaet = NK.hent(NOEGLE_GAET, null);
    /* Maalingen, fane 2 regner paa. Foerst den digel, der staar paa fane 1,
       saa snart startmassen er skrevet (ogsaa foer massen er konstant: saa
       er slut null, og dommen venter). Saa den sidste faerdige maaling, og
       til sidst eksemplet (brugerens oenske 29. sept. 2026). */
    NK.maaling = function () {
        var A = NK.sims && NK.sims["fane-forsoeg"];
        if (A && A.vejninger && A.vejninger.length && !A.gemtVist) {
            var v = A.vejninger;
            return { mf: A.proeve, slut: A.konstant ? v[v.length - 1].m : null, vejninger: v.slice(), sprojt: A.d.tabt > 0.02,
                     egen: true, faerdig: !!A.konstant };
        }
        var m = NK.minMaaling;
        if (m) return { mf: m.mf, slut: m.slut, vejninger: m.vejninger, sprojt: !!m.sprojt, egen: true, faerdig: true };
        var e = D.EKSEMPEL;
        return { mf: e.mf, slut: e.slut, vejninger: e.vejninger, sprojt: false, egen: false, faerdig: true };
    };

    var FLYT_TID = 0.7;     /* sekunder, tangen er om at flytte diglen */

    /* Vis svaret i opgave 3: det, scenen goer i hver fase */
    var FASE_SVAR = {
        igen: "Diglen kommer tilbage på trefoden, og brænderen tændes i 3 minutter.",
        taend: "Brænderen er tændt i 3 minutter, og tiden går hurtigere.",
        varm: "Tiden går hurtigere, til brænderen slukker.",
        tilVaegt: "Diglen kommer over på vægten."
    };

    function kopiDigel(d, sted) {
        var c = new K.Digel({ m: d.m0 });
        for (var k in d) if (Object.prototype.hasOwnProperty.call(d, k)) c[k] = d[k];
        if (sted) c.sted = sted;
        return c;
    }

    function SimForsoeg() {
        this.L = new NK.Laerred(NK.el("forsoeg-laerred"));
        this.e = { skort: NK.el("forsoeg-skort") };
        this.tid = 0;
        this.over = null;
        this.snap = {};
        this.massegaet = null;
        this.nyMaaling(null);
        this.koblMus();
        this.opgaver = new NK.ForsoegOpgaver(this, D.OPG_FORSOEG);
        this.opgaver.start();
    }

    var P = SimForsoeg.prototype;

    /* ----- Diglen ------------------------------------------------------------------ */
    /* En ny digel med en ny proeve (m: en bestemt masse, ellers en ny) */
    P.nyMaaling = function (m) {
        if (!m) {
            var sidst = this.proeve;
            var mulige = D.PROEVER.filter(function (x) { return x !== sidst; });
            m = NK.tilfaeldig(mulige.length ? mulige : D.PROEVER);
        }
        this.proeve = m;
        this.d = new K.Digel({ m: m, kF: D.F1.kF, kunFlamme: true, udenSprojt: true });
        this.vejninger = [];
        this.sidstVejet = 0;          /* opvarmning ved sidste vejning */
        this.maxT = D.STUE;           /* hoejeste temperatur siden sidste vejning */
        this.konstant = false;
        this.flyt = null;             /* { fra, til, t } */
        this.traek = null;
        this.auto = null;
        this.hurtig = null;
        this.varmRest = 0;            /* minutter tilbage af den portion, braenderen er taendt i */
        this.varmHurtig = null;       /* Vis svaret: portionen gaar hurtigere */
        this.lup = new Tg.Lup(9);
        this.damp = new NK.Damp(4);
        this.gemtVist = false;
        this.ingenStartVist = false;
    };

    /* Scenen, som den er nu (til Start forfra og fri leg) */
    P.gemTilstand = function () {
        var sted = this.flyt ? this.flyt.til : (this.traek ? this.traek.fra : null);
        return { d: kopiDigel(this.d, sted), proeve: this.proeve, vejninger: this.vejninger.slice(), sidstVejet: this.sidstVejet,
                 maxT: this.maxT, konstant: this.konstant, gemtVist: this.gemtVist, massegaet: this.massegaet, varmRest: this.varmRest };
    };

    P.hentTilstand = function (s) {
        this.nyMaaling(s.proeve);
        this.d = kopiDigel(s.d);
        this.d.flamme = s.d.flamme;
        this.vejninger = s.vejninger.slice();
        this.sidstVejet = s.sidstVejet;
        this.maxT = s.maxT;
        this.konstant = s.konstant;
        this.gemtVist = s.gemtVist;
        this.varmRest = s.varmRest || 0;
        this.massegaet = s.massegaet;
        this.lup.opdater(0, this.d.reageret(), !!NK.dommen);
        this.lup.fri = [];
    };

    /* Den gemte, faerdige maaling: al natronen har reageret, diglen staar paa vaegten */
    P.visGemt = function (gemt) {
        this.nyMaaling(gemt.mf);
        var d = this.d;
        d.nat = 0;
        d.na2co3 = gemt.slut;
        d.nat0 = gemt.mf;
        d.tabt = gemt.sprojt ? 0.05 : 0;
        d.opv = gemt.vejninger[gemt.vejninger.length - 1].t;
        this.vejninger = gemt.vejninger.slice();
        this.konstant = true;
        this.gemtVist = true;
        this.sidstVejet = d.opv;
        this.lup.opdater(0, 1, !!NK.dommen);
        this.lup.fri = [];
    };

    /* Scenen, som den er, naar opgave nr begynder (0: en vejet digel er ikke
       noedvendig, 1: startmassen er skrevet, 2: én vejning efter 3 minutter,
       3: massen er konstant). Regnet med modellen, saa en
       elev, der kommer tilbage, kan fortsaette i den opgave, hun var naaet til. */
    P.byg = function (nr) {
        var gemt = NK.minMaaling;
        if (nr >= 3 && gemt) { this.visGemt(gemt); return; }
        this.nyMaaling(this.proeve);
        var d = this.d, mig = this;
        function varm() {
            d.sted = "trefod"; d.flamme = "hoej";
            var s = d.opv + D.F1.portion - 1e-6, n = 0;
            while (d.opv < s && n++ < 20000) { d.opdater(0.05); mig.maxT = Math.max(mig.maxT, d.T); }
            d.flamme = "";
        }
        function vej() {
            d.flamme = ""; d.sted = "vaegt";
            var n = 0;
            while (!d.stille() && n++ < 20000) d.opdater(0.05);
            return d.visning();
        }
        if (nr >= 1) this.vejninger.push({ t: 0, m: this.proeve });
        if (nr >= 2) { varm(); this.vejninger.push({ t: Math.round(d.opv * 10) / 10, m: vej() }); }
        if (nr >= 3) {
            for (var i = 0; i < 12; i++) {
                varm();
                var m = vej(), forrige = this.vejninger[this.vejninger.length - 1];
                this.vejninger.push({ t: Math.round(d.opv * 10) / 10, m: m });
                if (Math.abs(forrige.m - m) < D.KONSTANT.tol) break;
            }
            this.konstant = true;
            this.gemMaaling();
        }
        this.sidstVejet = d.opv;
        this.maxT = d.T;
        this.lup.opdater(0, d.reageret(), !!NK.dommen);
        this.lup.fri = [];
    };

    /* Passer scenen til begyndelsen af opgave nr? */
    P.klarTil = function (nr) {
        var n = this.vejninger.length;
        if (nr === 0) return n === 0 && this.d.opv === 0;
        if (nr === 1) return n === 1 && this.d.opv === 0;
        if (nr === 2) return n === 2 && !this.konstant;
        return this.konstant;
    };

    /* Har scenen det, kortet til en loest opgave nr viser? */
    P.harData = function (nr) {
        if (nr === 0) return this.vejninger.length >= 1;
        if (nr === 1) return this.vejninger.length >= 2;
        return this.konstant;
    };

    /* ----- Opgaverne (kaldes af js/forsoeg_opgaver.js) --------------------------------- */
    P.nyOpgave = function (nr, fremme, forfra) {
        this.traek = null;
        this.auto = null;
        this.hurtig = null;
        this.varmHurtig = null;
        if (this.flyt) { this.d.sted = this.flyt.til; this.flyt = null; }
        if (fremme) {
            if (!this.harData(nr)) this.byg(Math.min(nr + 1, 3));
            return;
        }
        if (forfra) {
            if (nr === 0) this.nyMaaling(null);
            else if (this.snap[nr]) this.hentTilstand(this.snap[nr]);
            else this.byg(nr);
        } else if (!this.klarTil(nr)) {
            this.byg(nr);
        }
        /* Start forfra i opgave nr giver scenen, som den var, da opgaven begyndte */
        var snap = {};
        for (var k = 0; k < nr; k++) if (this.snap[k]) snap[k] = this.snap[k];
        snap[nr] = this.gemTilstand();
        this.snap = snap;
    };

    /* Fri leg begynder. Efter alle opgaverne: den gemte maaling, hvis scenen er tom */
    P.friStart = function (alle) {
        this.traek = null;
        this.auto = null;
        if (alle && !this.vejninger.length && NK.minMaaling) this.visGemt(NK.minMaaling);
    };

    P.naesteFane = function () { if (NK.visFane) NK.visFane("fane-hypoteser"); };

    P.gemGaet = function (id) {
        NK.gaet = id;
        NK.gem(NOEGLE_GAET, id);
    };

    /* Det gaet, kortet til et loest gaet-trin viser */
    P.gemtGaet = function (t) {
        var ids = t.svar.map(function (s) { return s.id; });
        if (ids.indexOf(NK.gaet) >= 0) return NK.gaet;
        return this.massegaet;
    };

    P.massegaetTekst = function () {
        var g = this.massegaet, sv = null;
        D.OPG_FORSOEG[1].trin[0].svar.forEach(function (s) { if (s.id === g) sv = s; });
        return sv ? "Dit gæt: " + sv.t + "." : "";
    };

    P.tabTekst = function () {
        var v = this.vejninger;
        return v.length >= 2 ? K.g2(K.r2(this.proeve - v[v.length - 1].m)) : "?";
    };

    P.sidsteMasseTekst = function () {
        var v = this.vejninger;
        return v.length ? K.g2(v[v.length - 1].m) : "";
    };

    P.visningTekst = function () {
        var vis = this.d.visning();
        return K.g2(vis === null ? this.proeve : vis);
    };

    P.konstantTekst = function () {
        var v = this.vejninger, n = v.length, slutM = n ? v[n - 1].m : 0;
        var fald = n >= 2 ? K.r2(v[n - 2].m - slutM) : 0;
        if (fald > 0) return "Massen faldt kun " + K.g2(fald) + " g og regnes nu for konstant. Slutmassen er " + K.g2(slutM) + " g.";
        return "Massen er konstant: " + K.g2(slutM) + " g.";
    };

    /* Kortet til en loest opgave 3, naar eleven klikker paa den igen */
    P.fremmeSlut = function (t) { return t.type === "vej" ? this.konstantTekst() : ""; };

    /* ----- Faserne i "varm og vej igen" ------------------------------------------------- */
    P.opvarmetSiden = function () { return this.d.opv - this.sidstVejet; };

    P.fase = function () {
        var d = this.d;
        if (this.traek) return this.sidsteFase || "igen";
        var til = this.flyt ? this.flyt.til : d.sted;
        var varmet = this.opvarmetSiden() >= D.KONSTANT.minTid;
        var f;
        if (this.varmRest > 0 || (this.auto && this.auto.slags === "varm")) f = "varm";
        else if (til === "vaegt") {
            if (!varmet) f = "igen";
            else if (this.flyt || !d.stille()) f = "vaegtVent";
            else f = "vej";
        } else f = varmet ? "tilVaegt" : "taend";
        this.sidsteFase = f;
        return f;
    };

    P.vejEl = function (f) { return f.el || null; };

    P.faseSvar = function () {
        var f = this.fase();
        if (f === "igen") { this.startFlyt("trefod"); this.auto = { slags: "varm" }; this.varmHurtig = 4; }
        else if (f === "taend") { this.startVarm(); this.varmHurtig = 4; }
        else if (f === "varm") this.varmHurtig = 4;
        else if (f === "tilVaegt") this.startFlyt("vaegt");
        return FASE_SVAR[f] || "";
    };

    /* Knappen Varm 3 min: braenderen taendes og slukker selv efter 3 minutter
       (ca. 6 sekunder). Intet ur, der skifter hele tiden (Niels 28. nov. 2026) */
    P.startVarm = function () {
        var d = this.d;
        if (this.varmRest > 0) return false;
        if (d.sted !== "trefod" || this.flyt || this.traek) { this.besked(D.FORSOEG_FRI.ikkeTrefod); return false; }
        this.varmRest = D.F1.portion;
        d.flamme = "hoej";
        return true;
    };

    /* ----- Vaegten og skemaet -------------------------------------------------------- */
    P.kanAflaese = function () { return this.d.sted === "vaegt" && !this.flyt && !this.traek && this.d.stille(); };

    P.tjekFelt = function (raa) {
        var d = this.d;
        if (!String(raa || "").trim()) return { tom: true };
        var tal = T.tal(raa);
        if (!tal) return { ok: false, besked: "Skriv et tal, fx 5,21." };
        if (d.sted !== "vaegt" || this.flyt || this.traek) return { ok: false, besked: "Diglen skal stå på vægten." };
        if (this.vejninger.length >= D.MAX_VEJNINGER) return { ok: false, besked: "Skemaet er fuldt. Tryk på Start forfra, og varm længere ad gangen." };
        var v = Math.round(tal.v * 100), vis = d.visning(), visV = Math.round(vis * 100);
        if (!d.stille()) {
            return { ok: false, besked: v === visV ? "Tallet står ikke stille endnu. En varm digel vejer for lidt. Vent, til diglen er kølet af." :
                "Vægten har ikke fundet ro endnu. Vent, til tallet står stille." };
        }
        if (v === visV) return { ok: true };
        var forrige = this.vejninger[this.vejninger.length - 1];
        if (forrige && v === Math.round(forrige.m * 100)) return { ok: false, besked: "Det er massen fra sidste vejning. Hvad viser vægten nu?" };
        if (Math.round(tal.v * 10) === Math.round(vis * 10)) return { ok: false, besked: "Skriv tallet med to decimaler, som vægten viser det." };
        return { ok: false, besked: "Det tal står der ikke på vægten. Skriv tallet med to decimaler." };
    };

    /* Alle beskeder, feltet kan give (til kortets plads) */
    P.fejlTekster = function () {
        return ["Skriv et tal, fx 5,21.", "Diglen skal stå på vægten.", "Skemaet er fuldt. Tryk på Start forfra, og varm længere ad gangen.",
            "Tallet står ikke stille endnu. En varm digel vejer for lidt. Vent, til diglen er kølet af.",
            "Vægten har ikke fundet ro endnu. Vent, til tallet står stille.", "Det er massen fra sidste vejning. Hvad viser vægten nu?",
            "Skriv tallet med to decimaler, som vægten viser det.", "Det tal står der ikke på vægten. Skriv tallet med to decimaler."];
    };

    /* En vejning skrives i skemaet. Giver { konstant, slut } fra anden vejning */
    P.noter = function () {
        var d = this.d;
        var m = !this.vejninger.length && d.opv === 0 ? this.proeve : d.visning();
        var ny = { t: Math.round(d.opv * 10) / 10, m: m };
        var forrige = this.vejninger[this.vejninger.length - 1];
        this.vejninger.push(ny);
        this.gemtVist = false;
        var varmTil = this.maxT;
        this.sidstVejet = d.opv;
        this.maxT = d.T;
        if (!forrige) return {};
        var ens = this.vejninger.length >= 3 && Math.abs(forrige.m - m) < D.KONSTANT.tol;
        if (ens && varmTil >= 200) { this.slut(); return { konstant: true, slut: this.konstantTekst() }; }
        var fald = K.r2(forrige.m - m), s;
        if (ens) s = "Massen er den samme som sidst, men diglen blev ikke rigtig varm. Varm længere.";
        else if (this.vejninger.length >= D.MAX_VEJNINGER) s = "Skemaet er fuldt. Tryk på Start forfra, og varm længere ad gangen.";
        else if (fald > 0) s = "Massen faldt " + K.g2(fald) + " g. Den er ikke konstant endnu.";
        else s = "Vægten viser " + K.g2(m) + " g. Massen er ikke konstant endnu.";
        return { konstant: false, slut: s };
    };

    P.vejSlutTekster = function () {
        return ["Massen faldt 0,66 g. Den er ikke konstant endnu.",
            "Massen er den samme som sidst, men diglen blev ikke rigtig varm. Varm længere.",
            "Skemaet er fuldt. Tryk på Start forfra, og varm længere ad gangen.",
            "Massen er konstant: 3,44 g.", "Massen faldt kun 0,01 g og regnes nu for konstant. Slutmassen er 3,44 g."];
    };

    P.faseSvarTekst = function (f) { return FASE_SVAR[f] || ""; };

    /* Massen er konstant: maalingen gemmes og bruges paa fane 2 */
    P.gemMaaling = function () {
        var v = this.vejninger;
        NK.minMaaling = { mf: this.proeve, slut: v[v.length - 1].m, vejninger: v.slice(), sprojt: this.d.tabt > 0.02 };
        NK.gem(NOEGLE_MAAL, NK.minMaaling);
    };

    P.slut = function () {
        this.konstant = true;
        this.d.flamme = "";
        this.gemMaaling();
        if (NK.sims && NK.sims["fane-hypoteser"]) NK.sims["fane-hypoteser"].nyMaaling();
    };

    /* Fri leg: knappen "Skriv 3,05 g i skemaet", naar diglen staar stille paa vaegten */
    P.kanNoteres = function () {
        var d = this.d;
        if (!this.opgaver || !this.opgaver.erFri()) return null;
        if (d.sted !== "vaegt" || this.flyt || this.traek || !d.stille() || this.konstant) return null;
        if (!this.vejninger.length && d.opv > 0) return null;
        if (this.vejninger.length >= D.MAX_VEJNINGER) return null;
        var sidst = this.vejninger[this.vejninger.length - 1];
        if (sidst && d.opv - this.sidstVejet < D.KONSTANT.minTid) return null;
        return K.g2(this.vejninger.length ? d.visning() : this.proeve);
    };

    P.friNoter = function () {
        if (!this.kanNoteres()) return;
        var r = this.noter();
        if (r && r.slut) this.opgaver.friBesked(r.slut);
        else this.opgaver.visKort();
    };

    /* ----- Hvad der er fremme (REGELSAET 13, 19a) ---------------------------------- */
    P.synlig = function (del) {
        var O = this.opgaver, d = this.d;
        if (!O || O.erFri() || O.fremme) return true;
        var nr = O.nr;
        if (del === "ark") return nr >= 1 || this.vejninger.length >= 1;
        if (del === "graf") return this.vejninger.length >= 2;
        if (del === "lup") return nr >= 2 || d.opv > 0 || this.varmRest > 0;
        if (del === "knapper") return O.tillad("knapper") || this.varmRest > 0;
        return true;
    };

    P.fri = function () { return this.opgaver.erFri(); };
    P.nulstil = function () { this.opgaver.forfra(); };
    P.fokus = function () { this.opgaver.fokus(); };
    P.enter = function () { this.opgaver.enter(); };

    /* ----- Kortets plads ------------------------------------------------------------------
       Kortet staar under raekken (top 46 px). Pladsen er det hoejeste, kortet
       kan blive paa fanen, maalt i en usynlig kopi (REGELSAET 4). */
    P.zoneNoegle = function () {
        var e = this.e.skort;
        return e.parentNode.clientWidth + "x" + window.innerHeight + (document.fonts && document.fonts.status === "loaded" ? "f" : "");
    };

    P.kortZone = function () {
        var e = this.e.skort;
        var top = e.offsetTop || 46;
        if (!e.parentNode || !e.parentNode.clientWidth) return top + 150;
        var noegle = this.zoneNoegle();
        if (this.zone && this.zoneN === noegle) return top + this.zone;
        var kopi = e.cloneNode(true);
        kopi.removeAttribute("id");
        Array.prototype.forEach.call(kopi.querySelectorAll("[id]"), function (x) { x.removeAttribute("id"); });
        kopi.hidden = false;
        kopi.style.visibility = "hidden";
        kopi.style.pointerEvents = "none";
        kopi.classList.remove("blink");
        e.parentNode.appendChild(kopi);
        var h = this.opgaver.maalZone(kopi);
        kopi.parentNode.removeChild(kopi);
        this.zone = Math.max(80, Math.ceil(h) + 2);
        this.zoneN = noegle;
        return top + this.zone;
    };

    /* En kopi af scenen med de laengste tekster (til kortets plads) */
    P.maaleSim = function (f) {
        var p = Object.create(this);
        p.fase = function () { return f || "vej"; };
        p.vejninger = [{ t: 0, m: 5.45 }, { t: 4, m: 4.64 }, { t: 12.5, m: 3.44 }];
        p.proeve = 5.45;
        p.massegaet = "stoerre";
        p.kanNoteres = function () { return "5,45"; };
        return p;
    };

    /* ----- Scenen ------------------------------------------------------------------------- */
    P.tilpas = function () {
        if (this.L.tilpas() || !this.lay) this.layout();
    };

    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        lay.top = this.kortZone() + 10;
        lay.bordY = Math.round(H - NK.klamp(H * 0.1, 40, 54));
        var fri = lay.bordY - lay.top;
        /* Forsoeget staar samlet i midten (REGELSAET 32): apparaterne, luppen og arket */
        var maxB = Math.min(W - 24, 1760), x0 = Math.round((W - maxB) / 2);
        var gap = Math.round(NK.klamp(maxB * 0.018, 14, 28));
        var ab = Math.round(NK.klamp(maxB * 0.26, 310, 420));
        var lw = Math.round(NK.klamp(maxB * 0.19, 220, 330));
        /* Arket staar paa bordet og maa gaa ned over bordkanten (der staar intet
           under det), saa grafen har plads paa en lav skaerm */
        lay.ark = { x: x0 + maxB - ab, y: lay.top, b: ab, h: Math.max(200, H - 8 - lay.top) };
        /* Luppen staar i sin egen spalte og maa gaa ned til bordet */
        var zr = Math.round(NK.klamp(Math.min(lw * 0.46, (fri - 78) / 2), 44, 140));
        lay.zoom = { x: Math.round(lay.ark.x - gap - lw / 2), y: lay.top + 34 + zr, r: zr };
        /* Udstyret til venstre: natronglasset, trefoden og vaegten */
        var eqW = lay.ark.x - gap - lw - gap - x0;
        var th = Math.round(NK.klamp(Math.min(eqW * 0.4, (fri - 40) * 0.68), 90, 390));
        var tb = th * NK.Sprites.MAAL.trefod.b / NK.Sprites.MAAL.trefod.h;
        var vb = NK.klamp(eqW * 0.3, 120, 330), vh = Tg.vaegtHoejde(vb);
        var jb = NK.klamp(eqW * 0.1, 44, 90);
        var g2 = NK.klamp(eqW * 0.05, 14, 40);
        var gruppe = tb + g2 + vb;
        var medGlas = eqW - gruppe > jb + g2 + 10;
        if (medGlas) gruppe += jb + g2;
        var x = x0 + Math.max(0, (eqW - gruppe) / 2);
        lay.glasX = null;
        if (medGlas) { lay.glasX = x + jb / 2; lay.glasB = jb; x += jb + g2; }
        lay.op = Tg.opstilling(x + tb / 2, lay.bordY, th);
        lay.tb = tb;
        x += tb + g2;
        var M = NK.Sprites.MAAL.vaegt;
        lay.vaegt = { x: x + vb / 2, b: vb, h: vh, top: lay.bordY - vh, skaal: lay.bordY - (M.bund - M.skaalY) * vb / M.b };
        /* Knappen Varm 3 min paa bordets forside under trefoden */
        var kbr = NK.klamp(tb * 0.8, 130, 170), kh = NK.klamp(H - lay.bordY - 18, 24, 32);
        lay.knapRamme = { x: lay.op.x - kbr / 2, y: lay.bordY + 12, b: kbr, h: kh };
        /* Grafens hoejde med Foer, fire vejninger og den, kortet spoerger om (til selvtesten) */
        lay.grafH = this.arkGrafH(lay.ark, 6);
        this.lay = lay;
        this.saetAnker("opstilling", lay.op.x - tb / 2, lay.op.top - th * 0.3, tb, lay.bordY - lay.op.top + th * 0.3);
        this.saetAnker("knapper", lay.knapRamme.x - 4, lay.knapRamme.y - 4, lay.knapRamme.b + 8, lay.knapRamme.h + 8);
        this.saetAnker("vaegt", lay.vaegt.x - vb / 2, lay.vaegt.top - th * 0.4, vb, vh + th * 0.4);
        this.saetAnker("zoom", lay.zoom.x - zr, lay.zoom.y - zr - 30, 2 * zr, 2 * zr + 56);
        this.saetAnker("ark", lay.ark.x, lay.ark.y, lay.ark.b, lay.ark.h);
    };

    P.saetAnker = function (id, x, y, b, h) {
        var e = NK.el("forsoeg-anker-" + id);
        if (!e) return;
        e.style.left = Math.round(x) + "px";
        e.style.top = Math.round(y) + "px";
        e.style.width = Math.round(Math.max(1, b)) + "px";
        e.style.height = Math.round(Math.max(1, h)) + "px";
    };

    /* ----- Diglen flytter sig ------------------------------------------------------------ */
    P.startFlyt = function (til) {
        var d = this.d;
        if (this.flyt) return;
        var fra = d.sted;
        if (fra === til) return;
        this.flyt = { fra: fra, til: til, t: 0 };
        d.sted = "flyt";
    };

    /* Hvor diglen staar: { x, bund, b } */
    P.digelPlads = function (sted) {
        var lay = this.lay;
        if (sted === "trefod") return lay.op.digel;
        return { x: lay.vaegt.x, bund: lay.vaegt.skaal + 1, b: lay.op.digel.b };
    };

    P.digelNu = function () {
        var lay = this.lay, d = this.d;
        if (this.traek) return { x: this.traek.x, bund: this.traek.y, b: lay.op.digel.b, luft: true };
        if (this.flyt) {
            var a = this.flyt.fra === "slip" ? { x: this.flyt.sx, bund: this.flyt.sy } : this.digelPlads(this.flyt.fra);
            var b = this.digelPlads(this.flyt.til);
            var u = NK.blod(this.flyt.t / FLYT_TID);
            return { x: NK.lerp(a.x, b.x, u), bund: NK.lerp(a.bund, b.bund, u) - Math.sin(u * Math.PI) * lay.op.th * 0.35, b: lay.op.digel.b, luft: true };
        }
        return this.digelPlads(d.sted === "flyt" ? "vaegt" : d.sted);
    };

    /* En kort besked paa kortet (i fri leg med det roede kryds) */
    P.besked = function (tekst) {
        if (this.fri()) this.opgaver.friBesked(tekst);
        else this.opgaver.saetBesked(NK.html(tekst), "peger");
    };

    /* ----- Musen ------------------------------------------------------------------------- */
    P.hvad = function (pt) {
        var lay = this.lay;
        if (!lay || !pt) return null;
        var r = lay.knapRamme;
        if (this.synlig("knapper") && pt.x >= r.x && pt.x <= r.x + r.b && pt.y >= r.y && pt.y <= r.y + r.h) return "varm";
        var dg = this.digelNu(), dh = Tg.digelHoejde(dg.b);
        if (pt.x >= dg.x - dg.b * 0.6 && pt.x <= dg.x + dg.b * 0.6 && pt.y >= dg.bund - dh - 10 && pt.y <= dg.bund + 4) return "digel";
        var b = lay.op.braender;
        if (pt.x >= b.x - b.b * 0.8 && pt.x <= b.x + b.b * 0.8 && pt.y >= b.mund - 4 && pt.y <= lay.bordY) return "braender";
        var v = lay.vaegt;
        if (pt.x >= v.x - v.b / 2 && pt.x <= v.x + v.b / 2 && pt.y >= v.top && pt.y <= lay.bordY) return "vaegt";
        var gl = lay.glasR;
        if (gl && pt.x >= gl.x && pt.x <= gl.x + gl.b && pt.y >= gl.y && pt.y <= gl.y + gl.h) return "glas";
        return null;
    };

    /* Kan det, musen er over, bruges nu? */
    P.kanBruges = function (h) {
        if (!h) return false;
        var O = this.opgaver;
        if (O.erFri()) {
            if (h === "vaegt") return !!this.kanNoteres();
            if (h === "digel") return !this.flyt && !(this.varmRest > 0);
            if (h === "varm" || h === "braender") return !(this.varmRest > 0);
            return true;
        }
        if (h === "digel") return O.tillad("digel") && !this.flyt && !(this.varmRest > 0);
        if (h === "varm" || h === "braender") return O.tillad("knapper") && this.synlig("knapper") && !(this.varmRest > 0);
        return false;
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointermove", function (e) {
            var pt = mig.L.punkt(e);
            if (mig.traek) { mig.flytTraek(pt); return; }
            var h = mig.hvad(pt);
            mig.over = h;
            c.style.cursor = mig.kanBruges(h) ? (h === "digel" ? "grab" : "pointer") : "default";
        });
        c.addEventListener("pointerleave", function () { if (!mig.traek) { mig.over = null; c.style.cursor = "default"; } });
        c.addEventListener("pointerdown", function (e) {
            if (e.button !== undefined && e.button !== 0) return;
            var pt = mig.L.punkt(e), h = mig.hvad(pt);
            if (!h) return;
            if (!mig.kanBruges(h)) {
                /* Et greb efter det, kortet ikke har bedt om: kortet blinker (REGELSAET 15) */
                if ((h === "digel" || h === "varm" || h === "braender") && !(mig.varmRest > 0)) mig.opgaver.spaer();
                return;
            }
            if (h === "digel") {
                var dg = mig.digelNu();
                mig.traek = { x: dg.x, y: dg.bund, sx: pt.x, sy: pt.y, dx: dg.x - pt.x, dy: dg.bund - pt.y, trukket: false, fra: mig.d.sted };
                mig.d.sted = "flyt";
                mig.opgaver.brug("digel");
                c.style.cursor = "grabbing";
                try { c.setPointerCapture(e.pointerId); } catch (x) { /* ingen capture */ }
                e.preventDefault();
                return;
            }
            if (h === "varm" || h === "braender") { if (mig.startVarm()) mig.opgaver.brug("varm"); return; }
            if (h === "glas") { mig.opgaver.friBesked(D.KRUKKE); return; }
            if (h === "vaegt") mig.friNoter();
        });
        function slip(e) {
            if (!mig.traek) return;
            mig.opTraek(mig.L.punkt(e));
            c.style.cursor = "default";
        }
        c.addEventListener("pointerup", slip);
        c.addEventListener("pointercancel", slip);
    };

    P.flytTraek = function (pt) {
        var s = this.traek;
        s.x = pt.x + s.dx;
        s.y = pt.y + s.dy;
        if (Math.hypot(pt.x - s.sx, pt.y - s.sy) > 6) s.trukket = true;
    };

    P.opTraek = function (pt) {
        var s = this.traek, d = this.d, lay = this.lay;
        if (!s) return;
        this.traek = null;
        d.sted = s.fra;
        var andet = s.fra === "vaegt" ? "trefod" : "vaegt";
        if (!s.trukket) { this.startFlyt(andet); return; }
        /* Sluppet over trefoden eller vaegten */
        var op = lay.op, v = lay.vaegt;
        var overTrefod = Math.abs(pt.x - op.x) < lay.tb * 0.5 && pt.y < lay.bordY && pt.y > op.top - op.th * 0.8;
        var overVaegt = Math.abs(pt.x - v.x) < v.b * 0.55 && pt.y < lay.bordY && pt.y > v.top - op.th * 0.8;
        var maal = overTrefod ? "trefod" : (overVaegt ? "vaegt" : null);
        if (maal && maal !== s.fra) {
            this.flyt = { fra: "slip", til: maal, t: FLYT_TID * 0.55, sx: s.x, sy: s.y };
            d.sted = "flyt";
            return;
        }
        if (!maal) this.besked("Slip diglen over trefoden eller vægten.");
    };

    /* ----- Opdater ----------------------------------------------------------------------- */
    P.opdater = function (dt) {
        var lay = this.lay, d = this.d;
        this.tid += dt;
        if (!lay) return;
        /* Skriften Lexend kan komme, efter kortet er maalt: maal igen */
        if (this.zoneN && this.e.skort.parentNode.clientWidth && this.zoneN !== this.zoneNoegle()) this.layout();
        /* Tangen flytter diglen */
        if (this.flyt) {
            this.flyt.t += dt;
            if (this.flyt.t >= FLYT_TID) {
                d.sted = this.flyt.til;
                this.flyt = null;
                if (this.auto && this.auto.slags === "varm" && d.sted === "trefod") { this.auto = null; this.startVarm(); }
            }
        }
        /* Tiden: 3 minutter paa brænderen er ca. 6 sekunder (D.F1.minPrS);
           ellers er 1 sekund 1 minut, saa diglen koeler af paa et par sekunder */
        if (this.varmRest > 0) {
            var vmin = dt * D.F1.minPrS * (this.varmHurtig || 1);
            var brug = Math.min(vmin, this.varmRest);
            d.opdater(brug);
            this.varmRest -= brug;
            if (this.varmRest <= 1e-9) { this.varmRest = 0; this.varmHurtig = null; d.flamme = ""; }
        } else {
            d.opdater(dt * D.MIN_PR_S * (this.hurtig || 1));
        }
        if (d.varmes() || d.sted === "trefod") this.maxT = Math.max(this.maxT, d.T);
        /* Vis svaret: tiden gaar hurtigere, til diglen er kølet af */
        if (this.hurtig && (d.stille() || d.sted !== "vaegt")) this.hurtig = null;
        /* Fri leg: startmassen blev aldrig vejet */
        if (this.fri() && !this.vejninger.length && d.opv > 0 && d.sted === "vaegt" && !this.ingenStartVist) {
            this.ingenStartVist = true;
            this.opgaver.friBesked(D.FORSOEG_FRI.ingenStart);
        }
        this.damp.opdater(dt, d.gas * (this.varmRest > 0 ? D.F1.minPrS : 1));
        this.lup.opdater(dt * (this.varmHurtig || this.hurtig ? 3 : 1), d.reageret(), !!NK.dommen);
        this.opgaver.opdater(dt);
    };

    /* ----- Tegn --------------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, d = this.d, t = this.tid;
        if (!lay) return;
        this.L.ryd();
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 12);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.H);
        var op = lay.op, om = this.opgaver.om(), ov = this.kanBruges(this.over) ? this.over : null;

        /* Natronglasset */
        lay.glasR = lay.glasX ? Tg.glas(ctx, lay.glasX, lay.bordY + 1, lay.glasB, ov === "glas") : null;

        /* Trefoden bagfra, braenderen og flammen */
        Tg.trefodBag(ctx, op);
        Tg.braender(ctx, op, ov === "braender");
        Tg.flamme(ctx, op.braender.x, op.braender.mund, op.braender.k * 0.95, d.flamme, t);

        /* Vaegten */
        var vis = d.visning();
        var vtekst = vis === null ? "0,00 g" : K.g2(vis) + " g";
        var vg = Tg.vaegt(ctx, lay.vaegt.x, lay.bordY, lay.vaegt.b, vtekst, { lys: ov === "vaegt" ? 1 : 0, roed: vis !== null && !d.stille() });
        lay.vaegt.top = vg.top;
        lay.disp = vg.disp;
        NK.tekst(ctx, "Vægten", lay.vaegt.x, lay.bordY + 27, { font: lex("500", 14), justering: "center", linje: "middle", farve: "#c8ced6" });

        /* Diglen, hvor den nu er */
        var dg = this.digelNu();
        var varme = NK.klamp((d.T - 150) / 250, 0, 1);
        var fyld = NK.klamp(d.masse() / this.proeve, 0, 1);
        var rand = Tg.digel(ctx, dg.x, dg.bund, dg.b, { fyld: fyld, reageret: d.reageret(), bobler: d.gas,
            lys: ov === "digel", varme: varme, t: t });
        if (dg.luft || this.flyt) Tg.tang(ctx, rand.x + rand.rx * 0.96, rand.y + 3, NK.klamp(dg.b * 1.9, 110, 190), -0.12);
        Tg.flimmer(ctx, rand.x, rand.y - 4, dg.b, NK.klamp((d.T - 80) / 200, 0, 1), t);
        this.damp.tegn(ctx, rand.x, rand.y - 2, dg.b);

        /* Trefoden forfra (foran diglen, naar den staar i trekanten) */
        Tg.trefodFor(ctx, op);

        /* Knappen Varm 3 min (kun naar den bruges, REGELSAET 19a) */
        if (this.synlig("knapper")) this.tegnVarmKnap(ctx, ov === "varm" || ov === "braender");

        /* Luppen med keglen fra diglen */
        if (this.synlig("lup")) {
            this.tegnKegle(ctx, rand);
            this.tegnLup(ctx);
            if (om.indexOf("lup") >= 0) Tg.omCirkel(ctx, lay.zoom.x, lay.zoom.y, lay.zoom.r);
        } else this.tegnLupPlads(ctx);

        /* Arket med vejningerne og grafen */
        this.tegnArk(ctx);

        if (om.indexOf("display") >= 0 && lay.disp) Tg.omRing(ctx, lay.disp.x, lay.disp.y, lay.disp.b, lay.disp.h);
        this.tegnOpfordring(ctx);
    };

    /* Knappen Varm 3 min under trefoden. Mens braenderen er taendt, staar der
       "Brænderen er tændt", og en rolig bjaelke fyldes (intet tal, der skifter) */
    P.tegnVarmKnap = function (ctx, over) {
        var r = this.lay.knapRamme, varmer = this.varmRest > 0;
        ctx.save();
        NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 7);
        ctx.fillStyle = varmer ? "#2a3446" : (over ? "#3a8fd0" : "#2f78b8");
        ctx.fill();
        if (varmer) {
            var u = NK.klamp(1 - this.varmRest / D.F1.portion, 0, 1);
            ctx.save();
            NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 7);
            ctx.clip();
            ctx.fillStyle = "rgba(242, 160, 70, 0.35)";
            ctx.fillRect(r.x, r.y, r.b * u, r.h);
            ctx.restore();
        }
        ctx.lineWidth = 1;
        ctx.strokeStyle = varmer ? "rgba(242, 160, 70, 0.6)" : "rgba(255, 255, 255, 0.25)";
        NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 7);
        ctx.stroke();
        ctx.restore();
        var t = varmer ? "Brænderen er tændt" : "Varm 3 min";
        NK.tekst(ctx, t, r.x + r.b / 2, r.y + r.h / 2 + 1, { font: lex("600", varmer ? 13.5 : 15), justering: "center", linje: "middle",
            farve: varmer ? "#ffd9b0" : "#ffffff" });
    };

    /* En stiplet plads med navnet, til tingen bruges (REGELSAET 13) */
    P.tegnPlads = function (ctx, R, navn, lys) {
        ctx.save();
        NK.rundtRekt(ctx, R.x, R.y, R.b, R.h, 12);
        ctx.setLineDash([7, 6]);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = lys ? "#b3bac5" : "#4a4f5e";
        ctx.stroke();
        ctx.restore();
        NK.tekst(ctx, navn, R.x + R.b / 2, R.y + R.h / 2 + 5, { font: lex("400", 15), justering: "center", farve: lys ? "#7d8594" : "#8f97a3" });
    };

    P.tegnLupPlads = function (ctx) {
        var z = this.lay.zoom;
        ctx.save();
        ctx.setLineDash([7, 6]);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#4a4f5e";
        ctx.beginPath();
        ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        NK.tekst(ctx, "Luppen", z.x, z.y + 5, { font: lex("400", 15), justering: "center", farve: "#8f97a3" });
    };

    /* Luppen: Na⁺ og HCO₃⁻ med formlen i kuglen, ingen farveforklaring (REGELSAET 24) */
    P.tegnLup = function (ctx) {
        var z = this.lay.zoom, d = this.d;
        Tg.lup(ctx, this.lup, z.x, z.y, z.r, { lys: false, varm: d.T > 120, t: this.tid });
        NK.tekst(ctx, "Luppen: pulveret i diglen", z.x, z.y - z.r - 14, { font: lex("500", 15), justering: "center", farve: "#e6eaef" });
        var under = NK.dommen ? "To HCO₃⁻ bliver til CO₃²⁻, CO₂ og H₂O." : (d.reageret() > 0.01 ? "? er det, der bliver tilbage i diglen." : "");
        if (under) NK.tekst(ctx, under, z.x, z.y + z.r + 24, { font: lex("400", 14), justering: "center", farve: "#c3c9d2" });
    };

    /* Forstoerrelsesglasset paa pulveret i diglen og keglen derfra hen til luppen (REGELSAET 25) */
    P.tegnKegle = function (ctx, rand) {
        var z = this.lay.zoom;
        var gx = rand.x, gy = rand.y + 2, gr = NK.klamp(rand.rx * 0.45, 9, 16);
        var dx = z.x - gx, dy = z.y - gy, afst = Math.hypot(dx, dy);
        if (afst < z.r + gr + 6) return;
        var vinkel = Math.atan2(dy, dx), a = Math.acos(NK.klamp(z.r / afst, -1, 1));
        /* Tangentpunkterne paa luppen og glassets kant paa tvaers af retningen */
        var p1 = { x: z.x - z.r * Math.cos(vinkel - a), y: z.y - z.r * Math.sin(vinkel - a) };
        var p2 = { x: z.x - z.r * Math.cos(vinkel + a), y: z.y - z.r * Math.sin(vinkel + a) };
        var nx = -Math.sin(vinkel), ny = Math.cos(vinkel);
        var g1 = { x: gx + nx * gr, y: gy + ny * gr }, g2 = { x: gx - nx * gr, y: gy - ny * gr };
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(g1.x, g1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(g2.x, g2.y);
        ctx.closePath();
        ctx.fillStyle = "rgba(242, 197, 61, 0.07)";
        ctx.fill();
        ctx.setLineDash([6, 5]);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "rgba(214, 160, 20, 0.7)";
        ctx.beginPath();
        ctx.moveTo(g1.x, g1.y); ctx.lineTo(p2.x, p2.y);
        ctx.moveTo(g2.x, g2.y); ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(gx, gy, gr, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "#c99400";
        ctx.stroke();
        ctx.restore();
    };

    /* ----- Arket: Vejningerne og grafen paa et lyst papir (REGELSAET 28-29) ---------------- */
    P.tegnArk = function (ctx) {
        var R = this.lay.ark;
        if (!this.synlig("ark")) { this.tegnPlads(ctx, R, "Vejningerne"); return; }
        ctx.save();
        NK.rundtRekt(ctx, R.x + 3, R.y + 5, R.b, R.h, 12);
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fill();
        NK.rundtRekt(ctx, R.x, R.y, R.b, R.h, 12);
        ctx.fillStyle = "#fbfaf6";
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#d9d4c6";
        ctx.stroke();
        ctx.restore();
        var pad = 14, x = R.x + pad, w = R.b - 2 * pad, d = this.d;
        NK.tekst(ctx, "Vejningerne", x, R.y + pad + 12, { font: lex("600", 16.5), linje: "middle", farve: "#1d2433" });

        /* Raekkerne: hver vejning og den, kortet spoerger om ("?" med gul ramme) */
        var v = this.vejninger, spoerg = this.opgaver.feltNu();
        var raekker = v.map(function (x, i) { return { navn: i === 0 ? "Før" : i + ". vejning", t: x.t, m: x.m, aendr: i ? x.m - v[i - 1].m : null }; });
        if (spoerg) raekker.push({ navn: v.length === 0 ? "Før" : v.length + ". vejning", t: d.opv, m: null, spm: true });
        var top = R.y + pad + 34, grafMin = NK.klamp(R.h * 0.36, 80, 220);
        var plads = R.y + R.h - pad - top - grafMin - 16;
        /* Er der ikke plads til alle raekkerne (lav skaerm), samles de midterste
           i én raekke "⋮". Foer og de sidste vejninger staar altid (REGELSAET 50) */
        var maks = Math.max(3, Math.floor(plads / 20) - 1);
        if (raekker.length > maks) raekker = [raekker[0], { skjult: true }].concat(raekker.slice(raekker.length - (maks - 2)));
        var rh = NK.klamp(plads / (raekker.length + 1), 20, 27);
        var px = NK.klamp(rh * 0.56, 13.5, 15);
        var c1 = x + w * 0.52, c2 = x + w * 0.77, c3 = x + w;
        var y = top + rh / 2;
        var hf = { font: lex("500", 13.5), linje: "middle", farve: "#5b6270" };
        NK.tekst(ctx, "Opvarmet", c1, y, Object.assign({ justering: "right" }, hf));
        NK.tekst(ctx, "Masse", c2, y, Object.assign({ justering: "right" }, hf));
        NK.tekst(ctx, "Ændring", c3, y, Object.assign({ justering: "right" }, hf));
        ctx.save();
        ctx.strokeStyle = "#d9d4c6";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, top + rh); ctx.lineTo(x + w, top + rh); ctx.stroke();
        ctx.restore();
        var konstant = this.konstant, n = raekker.length;
        raekker.forEach(function (r, i) {
            var yy = top + rh * (i + 1.5);
            if (r.skjult) { NK.tekst(ctx, "⋮", x + 30, yy, { font: lex("600", px), justering: "center", linje: "middle", farve: "#8a8578" }); return; }
            var groen = konstant && !r.spm && i >= n - 2 && i > 0;
            var farve = groen ? "#2b7d51" : "#1d2433";
            NK.tekst(ctx, r.navn, x, yy, { font: lex(i === 0 ? "500" : "400", px), linje: "middle", farve: farve });
            NK.tekst(ctx, K.min(r.t) + " min", c1, yy, { font: lex("400", px), justering: "right", linje: "middle", farve: farve });
            if (r.spm) {
                var fb = 56, fh = rh - 4;
                ctx.save();
                NK.rundtRekt(ctx, c2 - fb + 4, yy - fh / 2, fb, fh, 5);
                ctx.fillStyle = "#fff8e1";
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#e0a91a";
                ctx.stroke();
                ctx.restore();
                NK.tekst(ctx, "?", c2 - fb / 2 + 4, yy + 1, { font: lex("700", px), justering: "center", linje: "middle", farve: "#8a6510" });
            } else {
                NK.tekst(ctx, K.g2(r.m) + " g", c2, yy, { font: lex(groen ? "600" : "500", px), justering: "right", linje: "middle", farve: farve });
                if (r.aendr !== null) {
                    var a = Math.round(r.aendr * 100);
                    NK.tekst(ctx, NK.komma(a) + " g", c3, yy, { font: lex("400", px), justering: "right", linje: "middle",
                        farve: a === 0 ? "#2b7d51" : "#5b6270" });
                }
            }
        });
        /* Grafen under skemaet */
        var gy = top + rh * (n + 1) + 16;
        var G = { x: x, y: gy, b: w, h: R.y + R.h - pad - gy };
        if (!this.synlig("graf")) this.tegnPlads(ctx, G, "Grafen", true);
        else this.tegnGraf(ctx, G);
    };

    /* Hvor hoej grafen bliver paa arket med n raekker i skemaet (samme regning som tegnArk) */
    P.arkGrafH = function (R, n) {
        var pad = 14, top = R.y + pad + 34, grafMin = NK.klamp(R.h * 0.36, 80, 220);
        var plads = R.y + R.h - pad - top - grafMin - 16;
        var raekker = Math.min(n, Math.max(3, Math.floor(plads / 20) - 1));
        var rh = NK.klamp(plads / (raekker + 1), 20, 27);
        return R.y + R.h - pad - (top + rh * (raekker + 1) + 16);
    };

    /* Grafen paa det lyse ark (Tg.massegraf, den samme som paa fane 2) */
    P.tegnGraf = function (ctx, r) {
        var d = this.d, linjer = null;
        if (NK.forventet && NK.forventetFor === this.proeve) {
            linjer = {};
            D.HYP_IDS.forEach(function (id) { if (NK.forventet[id] !== undefined) linjer[id] = NK.forventet[id]; });
        }
        Tg.massegraf(ctx, r, { vejninger: this.vejninger, yMax: Math.ceil(this.proeve + 0.3),
            xMax: Math.max(20, Math.ceil((d.opv + 1) / 5) * 5), linjer: linjer, dommen: !!NK.dommen, titel: "Massen i diglen" });
    };

    /* Den gule ring og skiltet ved det, eleven skal bruge (REGELSAET 19-21) */
    P.tegnOpfordring = function (ctx) {
        var op = this.opgaver.opfordring(), lay = this.lay;
        if (!op || this.traek || this.flyt) return;
        if (op.el === "digel") {
            var dg = this.digelNu(), dh = Tg.digelHoejde(dg.b);
            Tg.ring(ctx, dg.x - dg.b * 0.6, dg.bund - dh - 4, dg.b * 1.2, dh + 8, this.tid, 12);
            Tg.skilt(ctx, op.tekst, dg.x, dg.bund - dh - 16, 8, lay.W - 8);
        } else if (op.el === "varm" && this.synlig("knapper")) {
            var r = lay.knapRamme;
            Tg.ring(ctx, r.x, r.y, r.b, r.h, this.tid, 9);
            Tg.skilt(ctx, op.tekst, r.x + r.b / 2, r.y - 10, 8, lay.W - 8);
        }
    };

    NK.SimForsoeg = SimForsoeg;
}());
