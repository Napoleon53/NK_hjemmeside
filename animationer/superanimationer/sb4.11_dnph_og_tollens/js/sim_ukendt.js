/* =====================================================================
   sim_ukendt.js - fane 3: Ukendte stoffer

   Brugerens journal 25 (Basiskemi B, Xperimentér 25): seks flasker med
   ethanal, propanon, benzaldehyd, ethansyre, vanillin (i stedet for
   journalens mandelessens) og husholdningssprit i tilfaeldig
   raekkefoelge. Hvert stof testes med DNPH og med Tollens' reagens i et
   varmt vandbad.

   Forloebet:
     forsoeg  knappen Udfoer testene paa kortet. Glassene viser resultatet
              (js/glas.js) og bliver staaende oeverst paa tavlen hele tiden
     klasse   én flaske ad gangen: hvad viser testene? Eleven tænker selv
              over, hvad bundfaldet og soelvspejlet betyder. Hintene saetter
              en gul ramme om det glas, de handler om. Rutediagrammet fra
              bogen (figur b4-test-rute) staar i teorien, ikke paa tavlen
              (brugeren 7. nov. 2026: ellers bliver det overvaeldende)
     find     tre spoergsmaal: hvilken flaske er ethansyre, hvilken af de to
              med en keton er husholdningssprit (lidt bundfald: der er
              tilsat butanon), og hvilken af de tre med et aldehyd er
              ethanal (gult bundfald; benzaldehyd og vanillin har
              carbonylgruppen paa en benzenring og giver orange)
     slut     kortets knap afsloerer, hvad flaskerne indeholder: navnene
              afloeser stofklasserne under flaskerne én ad gangen, og
              flaskens bogstav kommer frem paa stofkortet. Det regner med
              konfetti. Kortet
              har ingen knap bagefter (brugeren 7. nov. 2026: en ny runde
              paa kortets knap var et antiklimaks). En ny runde begynder med
              Begynd forfra i panelet eller R
   Resultaterne regnes af modellen ud af det, flaskerne indeholder
   (K.flaskeResultat i kemi.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var F = NK.Fane;
    var G = NK.Glas;
    var NOEGLE = "nk-sb4.11-ukendt";
    var FONT = "'Segoe UI', sans-serif";

    var GUL = "#d69e0c";
    var TEAL = "#0f766e";
    var BLAEK = "#1d2433";
    var FORSINK = 0.22;              /* sekunder mellem flaskerne, naar testene udfoeres */
    var FIND = ["syre", "sprit", "ethanal"];

    function SimUkendt() {
        var mig = this;
        var gemt = NK.hent(NOEGLE, {}) || {};
        this.runder = gemt.runder || 0;
        this.startFane();
        this.bygTrin();
        NK.el("u-forfra").addEventListener("click", function () { mig.forfra(); });
        this.el.skort.addEventListener("click", function (e) {
            if (e.target.closest && e.target.closest("[data-udfoer]")) mig.udfoer();
        });
        this.stofTegn = {};
        D.FLASKER.forEach(function (f) {
            if (f.indhold.length === 1) mig.stofTegn[f.id] = K.tegneMol(f.indhold[0][0]);
        });
    }

    var P = SimUkendt.prototype;
    F.paa(P, "u");

    P.naesteUloeste = function () { return 0; };

    /* ----- Panelet: trinene ------------------------------------------------------- */
    P.bygTrin = function () {
        var html = "";
        D.FORSOEG_TRIN.forEach(function (t, i) {
            html += '<div class="opg-chip trin" data-trin="' + t.id + '"><span class="oc-f"><span class="oc-nr">' + (i + 1) + "</span>" +
                NK.html(t.navn) + '</span><i class="oc-m"></i></div>';
        });
        NK.el("u-trinliste").innerHTML = html;
    };

    P.visTrin = function () {
        var mig = this, orden = ["forsoeg", "klasse", "find"], nu = orden.indexOf(this.fase === "slut" ? "find" : this.fase);
        var chips = NK.el("u-trinliste").querySelectorAll("[data-trin]");
        for (var i = 0; i < chips.length; i++) {
            var j = orden.indexOf(chips[i].getAttribute("data-trin"));
            var loest = j < nu || mig.fase === "slut";
            chips[i].classList.toggle("valgt", j === nu && mig.fase !== "slut");
            chips[i].classList.toggle("loest", loest);
            chips[i].querySelector(".oc-m").textContent = loest ? "✓" : "";
        }
        NK.saetTekst("u-runder", String(this.runder));
    };

    /* ----- En runde --------------------------------------------------------------- */
    P.vaelg = function () { this.nyRunde(); };

    P.nyRunde = function () {
        this.indhold = NK.bland(D.FLASKER.map(function (f) { return f.id; }));
        this.res = this.indhold.map(function (id) { return K.flaskeResultat(id); });
        this.fase = "forsoeg";
        this.forsoegT = null;
        this.glasNr = 0;
        this.findNr = 0;
        this.klasseKendt = [];
        this.afsloeret = false;
        this.afsloerT = null;
        this.nytSpm();
        this.layout();
    };

    P.nytSpm = function () {
        this.valgt = null;
        this.forkert = {};
        this.fejl = false;
        this.sv = false;
        this.groen = null;
        this.hintMaerke = 0;
        this.overGlas = -1;
        this.besked("", "");
        this.nulstilHjaelp();
        this.visKort();
        this.visTrin();
    };

    P.udfoert = function () { return this.forsoegT !== null && this.forsoegT >= FORSINK * 5 + G.VARIGHED; };

    P.find = function () { return FIND[this.findNr]; };

    /* Flaskerne med en bestemt stofklasse (aldehyd, keton eller ingen) */
    P.medKlasse = function (k) {
        var mig = this, ud = [];
        this.res.forEach(function (r, i) { if (K.rute(r) === k) ud.push(i); });
        return ud;
    };

    P.flaskeMed = function (id) { return this.indhold.indexOf(id); };

    /* Svarene paa kortet i find-delen: bogstaverne paa de flasker, der kan vaelges */
    P.findValg = function () {
        var f = this.find();
        if (f === "syre") return [0, 1, 2, 3, 4, 5];
        if (f === "sprit") return this.medKlasse("keton");
        return this.medKlasse("aldehyd");
    };

    P.kortData = function () {
        var mig = this, B = D.BOGSTAVER;
        if (this.fase === "forsoeg") {
            if (this.forsoegT === null)
                return { slags: "opgave", chip: "Forsøget",
                    tekst: "Flaskerne A til F indeholder stofferne nederst på tavlen i tilfældig rækkefølge. Hvert stof testes med DNPH og med Tollens' reagens.",
                    ekstra: '<div class="sk-handling"><button type="button" class="knap blaa" data-udfoer="1">Udfør testene</button></div>' };
            return { slags: "opgave", chip: "Forsøget", tekst: "En dråbe af hvert stof kommer i DNPH og i Tollens' reagens. Glassene med Tollens' reagens står et minut i et varmt vandbad." };
        }
        if (this.fase === "slut")
            return { slags: "opgave", chip: "Runden er slut",
                tekst: "Alle seks flasker er undersøgt, og navnene står under flaskerne. Benzaldehyd og vanillin gav de samme resultater, så testene kan ikke skille dem ad.",
                ekstra: '<p class="sk-note">Knappen Begynd forfra i panelet giver en ny runde med flaskerne i en anden rækkefølge.</p>' };
        if (this.fase === "klasse") {
            var L = B[this.glasNr];
            return { slags: "spm", chip: "Flaske " + L,
                tekst: "Hvad viser de to test om stoffet i flaske " + L + "? Vælg, og tryk Indsend svar.",
                svar: D.RUTE_SVAR.map(function (s, j) { return { t: s.t, valgt: mig.valgt === j, forkert: !!mig.forkert[j] }; }) };
        }
        var f = this.find(), tekst, svar;
        if (f === "syre") tekst = "Hvilken flaske indeholder ethansyre? Klik på flasken eller på bogstavet, og tryk Indsend svar.";
        else if (f === "sprit") tekst = "Testene viser en keton i flasken med propanon og i flasken med husholdningssprit. Hvilken flaske indeholder husholdningssprit?";
        else tekst = "Testene viser et aldehyd i flaskerne med ethanal, benzaldehyd og vanillin. Hvilken flaske indeholder ethanal?";
        svar = this.findValg().map(function (i, j) { return { t: "Flaske " + B[i], valgt: mig.valgt === j, forkert: !!mig.forkert[j] }; });
        return { slags: "spm", chip: "Spørgsmål " + (this.findNr + 1) + " af 3", tekst: tekst, svar: svar };
    };

    P.skjulIndsend = function () { return this.fase === "forsoeg" || this.fase === "slut"; };
    P.skjulHint = function () { return this.fase === "forsoeg" || this.fase === "slut"; };

    P.svarValg = function (j) {
        if (this.fase === "forsoeg" || this.fase === "slut") return;
        this.valgt = this.valgt === j ? null : j;
        this.visKort();
    };

    P.kanSendes = function () { return this.valgt !== null; };

    /* Paa slutkortet goer Enter ingenting */
    var indsendKlik = P.indsendKlik;
    P.indsendKlik = function () { if (this.fase !== "slut") indsendKlik.call(this); };

    P.indsendTekst = function () {
        if (this.valgt === null) return "Indsend svar";
        if (this.fase === "klasse") return "Indsend svar: " + D.RUTE_SVAR[this.valgt].t.toLowerCase();
        return "Indsend svar: flaske " + D.BOGSTAVER[this.findValg()[this.valgt]];
    };

    P.ingentingTekst = function () {
        if (this.fase === "find") return "Klik på en flaske eller på et bogstav på kortet først.";
        return "Vælg et svar på kortet først.";
    };

    /* ----- Forsoeget -------------------------------------------------------------- */
    P.udfoer = function () {
        if (this.fase !== "forsoeg" || this.forsoegT !== null) return;
        this.forsoegT = 0;
        this.visKort();
    };

    P.efterForsoeg = function () {
        this.fase = "klasse";
        this.glasNr = 0;
        this.nytSpm();
    };

    /* ----- Bedoemmelsen ----------------------------------------------------------- */
    P.indsend = function () { this.bedoem(false); };

    P.rigtigNr = function () {
        if (this.fase === "klasse") {
            var k = K.rute(this.res[this.glasNr]);
            for (var j = 0; j < D.RUTE_SVAR.length; j++) if (D.RUTE_SVAR[j].id === k) return j;
        }
        var f = this.find();
        if (f === "syre") return this.flaskeMed("ethansyre");
        return this.findValg().indexOf(this.flaskeMed(f === "sprit" ? "sprit" : "ethanal"));
    };

    P.bedoem = function (vist) {
        var nr = this.valgt, rigtig = this.rigtigNr();
        if (nr !== rigtig) {
            this.forkert[nr] = true;
            this.fejl = true;
            this.valgt = null;
            this.visKort();
            this.fejlLinje(this.fejlTekst(nr));
            return;
        }
        this.valgt = null;
        this.sejrT = 0;
        var tekst = this.forklaring(), knap, naeste;
        if (this.fase === "klasse") {
            this.klasseKendt[this.glasNr] = K.rute(this.res[this.glasNr]);
            var sidste = this.glasNr === 5;
            knap = sidste ? "Næste spørgsmål →" : "Næste flaske →";
            naeste = function () {
                if (sidste) { this.fase = "find"; this.findNr = 0; }
                else this.glasNr++;
                this.nytSpm();
            };
        } else if (this.findNr < FIND.length - 1) {
            knap = "Næste spørgsmål →";
            naeste = function () { this.findNr++; this.nytSpm(); };
        } else {
            knap = "Se, hvad flaskerne indeholder →";
            naeste = function () { this.afslut(); };
        }
        this.groen = { spm: true, svarNr: nr, maade: vist ? "svar" : "selv", tekst: tekst, knap: knap, naeste: naeste };
        this.besked("", "");
        this.visKort();
        this.visTrin();
        NK.konfetti(this.el.skort, 24);
    };

    /* Runden er slut: navnene kommer frem under flaskerne, og det regner med
       konfetti. Kortet har ingen knap, saa ingen begynder forfra ved et uheld */
    P.afslut = function () {
        this.fase = "slut";
        this.afsloeret = true;
        this.afsloerT = 0;
        this.runder++;
        NK.gem(NOEGLE, { runder: this.runder });
        this.nytSpm();
        NK.konfettiRegn(NK.el("fane-u").querySelector(".scene"), 140);
    };

    /* Hvor meget af flaske i's navn der er kommet frem (0 til 1) */
    P.afsloerA = function (i) {
        if (!this.afsloeret) return 0;
        if (this.afsloerT === null) return 1;
        return NK.klamp((this.afsloerT - 0.3 - i * 0.25) / 0.35, 0, 1);
    };

    /* Resultatet for en flaske som tekst: "gult bundfald med DNPH og et sølvspejl" */
    P.resTekst = function (i) {
        var r = this.res[i];
        var d = r.dnph ? K.dnphTekst(r) + " med DNPH" : "intet bundfald med DNPH";
        var t = r.tollens ? "et sølvspejl" : "intet sølvspejl";
        return d + " og " + t;
    };

    P.forklaring = function () {
        var B = D.BOGSTAVER;
        if (this.fase === "klasse") {
            var i = this.glasNr, r = this.res[i], k = K.rute(r), L = "Flaske " + B[i];
            if (k === "ingen") return L + " gav intet bundfald med DNPH. Både aldehyder og ketoner giver bundfald, så stoffet er hverken et aldehyd eller en keton.";
            var ud = L + " gav " + K.dnphTekst(r) + " med DNPH";
            if (r.dnph === "lidt") ud += ". Også lidt bundfald viser en carbonylgruppe. ";
            else ud += ", så stoffet har en carbonylgruppe. ";
            if (k === "aldehyd") return ud + "Sølvspejlet viser, at Tollens' reagens kan oxidere stoffet. Stoffet er derfor et aldehyd.";
            if (r.dnph === "lidt") return ud + "Uden sølvspejl er stoffet en keton.";
            return ud + "Uden sølvspejl kan stoffet ikke oxideres af Tollens' reagens. Stoffet er derfor en keton.";
        }
        var f = this.find();
        if (f === "syre") return "Flaske " + B[this.flaskeMed("ethansyre")] + " er den eneste uden aldehyd og keton. Ethansyre er en carboxylsyre og reagerer ikke i de to test.";
        if (f === "sprit") return "Flaske " + B[this.flaskeMed("sprit")] + " gav kun lidt bundfald. Husholdningssprit består mest af ethanol, men der er tilsat lidt butanon, så den ikke kan drikkes.";
        return "Flaske " + B[this.flaskeMed("ethanal")] + " gav gult bundfald. Benzaldehyd og vanillin har begge carbonylgruppen på en benzenring og giver orange bundfald.";
    };

    P.fejlTekst = function (nr) {
        var B = D.BOGSTAVER, mig = this;
        if (this.fase === "klasse") {
            var i = this.glasNr, r = this.res[i], valg = D.RUTE_SVAR[nr].id, L = "Flaske " + B[i];
            if (valg === "ingen") return L + " gav " + K.dnphTekst(r) + " med DNPH." + (r.dnph === "lidt" ? " Også lidt bundfald viser en carbonylgruppe." : " Bundfaldet viser en carbonylgruppe som i et aldehyd eller en keton.");
            if (!r.dnph) return L + " gav intet bundfald med DNPH. Et aldehyd eller en keton ville give bundfald med DNPH.";
            if (valg === "aldehyd") return L + " gav intet sølvspejl. Et aldehyd bliver oxideret af Tollens' reagens og giver et sølvspejl.";
            return L + " gav et sølvspejl. En keton kan ikke oxideres af Tollens' reagens og giver intet sølvspejl.";
        }
        var f = this.find();
        if (f === "syre") {
            var j = this.findValg()[nr], k = K.rute(this.res[j]);
            return "Flaske " + B[j] + " viser " + (k === "aldehyd" ? "et aldehyd" : "en keton") + ". Ethansyre er en carboxylsyre og reagerer ikke i de to test.";
        }
        if (f === "sprit") {
            var jj = this.findValg()[nr];
            return "Flaske " + B[jj] + " gav meget bundfald. Husholdningssprit består mest af ethanol, som ikke reagerer med DNPH.";
        }
        var valg = this.findValg(), v = valg[nr], mage = valg.filter(function (i) { return i !== v && i !== mig.flaskeMed("ethanal"); })[0];
        return "Flaske " + B[v] + " gav orange bundfald ligesom flaske " + B[mage] + ". Ethanal er det aldehyd, der skiller sig ud fra de to andre.";
    };

    P.videre = function () { this.nyRunde(); };

    /* Begynd forfra giver en ny runde. Antallet af loeste runder bliver staaende */
    P.forfra = function () { this.nyRunde(); };

    /* ----- Hjaelpen ------------------------------------------------------------- */
    P.hintNu = function () {
        if (this.groen || this.fase === "forsoeg") return [];
        var B = D.BOGSTAVER;
        if (this.fase === "klasse") {
            var L = "flaske " + B[this.glasNr];
            return ["Bundfald med DNPH viser en carbonylgruppe, C=O, i et aldehyd eller en keton. Gav " + L + " bundfald?",
                "Tollens' reagens kan oxidere et aldehyd, men ikke en keton. Gav " + L + " et sølvspejl?"];
        }
        var f = this.find();
        if (f === "syre") return ["Ethansyre er en carboxylsyre. Giver en carboxylsyre bundfald med DNPH?", "Find flasken, der hverken gav bundfald med DNPH eller et sølvspejl."];
        if (f === "sprit") return ["Husholdningssprit består mest af ethanol, som ikke reagerer med DNPH.", "Se på mængden af bundfald i de to glas med DNPH."];
        return ["Se på molekylerne nederst på tavlen. Benzaldehyd og vanillin har en benzenring, men det har ethanal ikke.",
            "To af de tre aldehyder gav samme farve bundfald med DNPH. Hvilken flaske skiller sig ud?"];
    };

    P.efterHint = function (n) { this.hintMaerke = n; };

    P.visSvar = function () {
        this.sv = true;
        this.valgt = this.rigtigNr();
        this.bedoem(true);
    };

    /* ----- Klik paa flaskerne ------------------------------------------------------- */
    P.glasVed = function (pt) {
        if (!this.kol) return -1;
        for (var i = 0; i < this.kol.length; i++) {
            var k = this.kol[i];
            if (pt.x >= k.x && pt.x <= k.x + k.b && pt.y >= k.y && pt.y <= k.y + k.h) return i;
        }
        return -1;
    };

    P.overScene = function (pt) {
        this.overGlas = -1;
        if (!pt || this.groen || this.fase !== "find") return null;
        var i = this.glasVed(pt);
        if (i >= 0 && this.findValg().indexOf(i) >= 0) this.overGlas = i;
        return this.overGlas >= 0 ? "pointer" : null;
    };

    P.klikScene = function (pt) {
        if (this.spaer()) return;
        if (this.fase === "forsoeg" && this.forsoegT === null) { this.kortBlink(); return; }
        if (this.fase !== "find") return;
        var i = this.glasVed(pt);
        if (i < 0) return;
        var j = this.findValg().indexOf(i);
        if (j < 0) { this.kortBesked(this.find() === "sprit" ? "Vælg en af de to flasker, der viser en keton." : "Vælg en af de tre flasker, der viser et aldehyd.", 3); return; }
        if (this.forkert[j]) { this.kortBesked("Den flaske har du prøvet. Vælg en anden.", 3); return; }
        this.valgt = this.valgt === j ? null : j;
        this.visKort();
    };

    P.nulstil = function () { if (!this.groen && this.fase !== "forsoeg") this.nyRunde(); };

    /* ----- Layout og tegning ------------------------------------------------------ */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle, pad = 14;
        var h1 = Math.round(t.h * 0.52), kb = (t.b - 2 * pad) / 6;
        var gh = NK.klamp(h1 - 120, 70, 170), gb = gh * 0.3;
        /* Glassenes midte ligger d til hver side, saa teksterne under dem har plads */
        var dd = Math.max(gb * 0.8, kb * 0.24);
        this.kol = [];
        for (var i = 0; i < 6; i++) {
            var x = t.x + pad + i * kb;
            this.kol.push({ x: x + 3, y: t.y + 8, b: kb - 6, h: h1 - 10, gh: gh, gb: gb, d: dd,
                dnph: { x: x + kb / 2 - dd - gb / 2, y: t.y + 50, b: gb, h: gh },
                tollens: { x: x + kb / 2 + dd - gb / 2, y: t.y + 50, b: gb, h: gh } });
        }
        var by = t.y + h1 + 8, bh = t.h - h1 - 16;
        this.stofR = { x: t.x + pad, y: by, b: t.b - 2 * pad, h: bh };
        this.saetAnker("tavle", t.x, t.y, t.b, t.h);
        this.saetAnker("glas", t.x + pad, t.y + 8, t.b - 2 * pad, h1 - 10);
        this.saetAnker("stoffer", this.stofR.x, this.stofR.y, this.stofR.b, this.stofR.h);
    };

    P.opdaterScene = function (dt) {
        if (this.forsoegT !== null && this.fase === "forsoeg") {
            this.forsoegT += dt;
            if (this.udfoert()) this.efterForsoeg();
        }
        if (this.afsloerT !== null && this.afsloerT !== undefined && this.afsloerT < 9) this.afsloerT += dt;
    };

    /* Tiden for flaske i, siden dens draaber kom i (eller −1 foer forsoeget) */
    P.glasT = function (i) {
        if (this.forsoegT === null) return -1;
        if (this.fase !== "forsoeg") return G.VARIGHED + 1;
        return this.forsoegT - i * FORSINK;
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, tv = lay.tavle, mig = this;
        NK.Tavle.tegn(ctx, lay);
        if (!this.kol) return;
        var puls = 0.5 + 0.5 * Math.sin(this.tid * 4);
        this.kol.forEach(function (k, i) { mig.tegnFlaske(ctx, k, i, puls); });
        ctx.save();
        ctx.strokeStyle = "#dfe3e8";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tv.x + 16, this.stofR.y - 4);
        ctx.lineTo(tv.x + tv.b - 16, this.stofR.y - 4);
        ctx.stroke();
        ctx.restore();
        this.tegnStoffer(ctx, this.stofR, puls);
        this.tegnSejr(ctx, tv);
    };

    /* Er flasken det, kortet spoerger om? */
    P.fremhaev = function (i) {
        if (this.groen) return false;
        if (this.fase === "klasse") return i === this.glasNr;
        if (this.fase !== "find") return false;
        var f = this.find();
        if (f === "sprit") return this.findValg().indexOf(i) >= 0;
        if (f === "ethanal") return K.rute(this.res[i]) === "aldehyd";
        return false;
    };

    P.tegnFlaske = function (ctx, k, i, puls) {
        var fr = this.fremhaev(i), valgt = this.fase === "find" && this.valgt !== null && this.findValg()[this.valgt] === i && !this.groen;
        var over = this.overGlas === i;
        if (fr || valgt || over) {
            ctx.save();
            NK.rundtRekt(ctx, k.x, k.y, k.b, k.h, 12);
            ctx.fillStyle = valgt ? "rgba(242, 197, 61, 0.22)" : "rgba(242, 197, 61, 0.08)";
            ctx.fill();
            ctx.strokeStyle = valgt || fr ? GUL : "rgba(214, 158, 12, 0.7)";
            ctx.lineWidth = valgt ? 3.5 + puls : 2.5;
            ctx.stroke();
            ctx.restore();
        }
        var cx = k.x + k.b / 2;
        NK.tekst(ctx, "Flaske " + D.BOGSTAVER[i], cx, k.y + 18, { font: "800 16px " + FONT, farve: fr ? "#8a6200" : BLAEK, justering: "center", linje: "middle" });
        var res = this.res[i], t = this.glasT(i), mig = this;
        var ramme = this.hintRamme(i);
        ["dnph", "tollens"].forEach(function (test) {
            var g = k[test];
            /* Hintet saetter en gul ramme om glasset, det handler om */
            if (ramme[test]) {
                /* Rammen er lige saa bred som teksten under glasset */
                var hb = k.d - 2;
                ctx.save();
                NK.rundtRekt(ctx, g.x + g.b / 2 - hb, g.y - 20, 2 * hb, g.h + 50, 8);
                ctx.fillStyle = "rgba(242, 197, 61, 0.14)";
                ctx.fill();
                ctx.strokeStyle = GUL;
                ctx.lineWidth = 2.5;
                ctx.stroke();
                ctx.restore();
            }
            var lt = test === "dnph" ? "DNPH" : "Tollens", lf = NK.passendeSkrift(ctx, lt, 2 * k.d - 4, 11, 8.5, "700");
            NK.tekst(ctx, lt, g.x + g.b / 2, g.y - 9, { font: "700 " + lf + "px " + FONT, farve: "#5d6878", justering: "center", linje: "middle" });
            G.tegn(ctx, g, G.tilstand(test, res, t));
            G.pipette(ctx, g, t);
            if (t > 1.2) {
                var tekst = test === "dnph" ? K.dnphTekst(res) : K.tollensTekst(res);
                var ja = test === "dnph" ? res.dnph : res.tollens;
                mig.toLinjer(ctx, tekst, g.x + g.b / 2, g.y + g.h + 12, ja ? TEAL : "#5d6878", 2 * k.d - 4);
            }
        });
        /* Stofklassen, naar den er fundet. Naar runden er slut, glider navnet
           ind paa stofklassens plads i samme farve (under den er der ikke
           plads paa en lille skaerm) */
        var y = k.dnph.y + k.gh + 50;
        var kl = this.klasseKendt[i], a = this.afsloerA(i);
        var farve = !kl || kl === "ingen" ? "#5d6878" : D.KLASSER[kl].blaek;
        if (kl && a < 1) {
            var tekst = kl === "ingen" ? "hverken" : D.KLASSER[kl].navn;
            ctx.save();
            ctx.globalAlpha = 1 - a;
            NK.tekst(ctx, tekst, cx, y - a * 8, { font: "800 14px " + FONT, farve: farve, justering: "center", linje: "middle" });
            ctx.restore();
        }
        if (a > 0) {
            var f = K.flaske(this.indhold[i]);
            var fz = NK.passendeSkrift(ctx, f.navn, k.b - 6, 15, 10, "800");
            ctx.save();
            ctx.globalAlpha = a;
            NK.tekst(ctx, f.navn, cx, y + (1 - a) * 8, { font: "800 " + fz + "px " + FONT, farve: farve, justering: "center", linje: "middle" });
            ctx.restore();
        }
    };

    /* De gule rammer, hintene saetter om glassene:
       stofklassen: hint 1 DNPH-glasset, hint 2 ogsaa glasset med Tollens' reagens
       husholdningssprit og ethanal: hint 2 DNPH-glassene i de flasker, der kan vaelges */
    P.hintRamme = function (i) {
        var ud = { dnph: false, tollens: false };
        if (this.groen) return ud;
        if (this.fase === "klasse" && i === this.glasNr) {
            ud.dnph = this.hintMaerke >= 1;
            ud.tollens = this.hintMaerke >= 2;
        } else if (this.fase === "find" && this.find() !== "syre" && this.findValg().indexOf(i) >= 0) {
            ud.dnph = this.hintMaerke >= 2;
        }
        return ud;
    };

    /* En kort tekst paa én eller to linjer under et glas */
    P.toLinjer = function (ctx, tekst, x, y, farve, maks) {
        var ord = tekst.split(" "), linjer;
        if (ord.length <= 1) linjer = [tekst];
        else if (ord.length === 2) linjer = ord;
        else linjer = [ord.slice(0, ord.length - 1).join(" "), ord[ord.length - 1]];
        var lang = linjer.reduce(function (a, l) { return l.length > a.length ? l : a; }, "");
        var fz = NK.passendeSkrift(ctx, lang, maks || 60, 12, 9, "700");
        linjer.forEach(function (l, j) {
            NK.tekst(ctx, l, x, y + j * (fz + 2), { font: "700 " + fz + "px " + FONT, farve: farve, justering: "center", linje: "middle" });
        });
    };

    /* ----- Stofferne nederst paa tavlen: tre kort i hver raekke ------------------------- */
    P.tegnStoffer = function (ctx, r, puls) {
        var mig = this, kb = (r.b - 16) / 3, kh = (r.h - 6) / 2;
        var f = this.fase === "find" && !this.groen ? this.find() : null;
        D.FLASKER.forEach(function (fl, j) {
            var x = r.x + (j % 3) * (kb + 8), y = r.y + Math.floor(j / 3) * (kh + 6);
            var fr = (f === "syre" && fl.id === "ethansyre") || (f === "sprit" && fl.id === "sprit") ||
                (f === "ethanal" && fl.id === "ethanal");
            ctx.save();
            NK.rundtRekt(ctx, x, y, kb, kh, 8);
            ctx.fillStyle = fr ? "rgba(242, 197, 61, 0.16)" : "#ffffff";
            ctx.fill();
            ctx.strokeStyle = fr ? GUL : "#d5dae1";
            ctx.lineWidth = fr ? 2.5 : 1.2;
            ctx.stroke();
            ctx.restore();
            /* Navnet til venstre og formlen til hoejre i kortet */
            var tegn = mig.stofTegn[fl.id], navnB = tegn ? kb * 0.46 : kb - 20;
            var fsN = NK.passendeSkrift(ctx, fl.navn, navnB - 12, 16, 10, "700");
            NK.tekst(ctx, fl.navn, x + 12, y + kh / 2 - (fl.om ? 8 : 0), { font: "700 " + fsN + "px " + FONT, farve: BLAEK, justering: "left", linje: "middle" });
            if (fl.om) NK.tekst(ctx, fl.om, x + 12, y + kh / 2 + 11, { font: "600 " + Math.max(10, fsN - 3) + "px " + FONT, farve: "#5d6878", justering: "left", linje: "middle" });
            if (tegn) {
                /* Til hoejre er der plads til flaskens bogstav, naar runden er slut */
                var rr = F.iKasse(tegn.mol, { x: x + navnB, y: y + 4, b: kb - navnB - 32, h: kh - 8 }, { maks: 32 });
                rr.geo.tekster.forEach(function (t) { t.font = t.font.replace(/\d+(\.\d+)?px/, NK.klamp(rr.s * 0.42, 10, 15).toFixed(1) + "px"); });
                NK.Struktur.tegnGeo(ctx, rr.geo);
            }
            var i = mig.indhold.indexOf(fl.id), a = mig.afsloerA(i);
            if (a > 0) {
                ctx.save();
                ctx.globalAlpha = a;
                ctx.beginPath();
                ctx.arc(x + kb - 17, y + 17, 11 + (1 - a) * 4, 0, Math.PI * 2);
                ctx.fillStyle = TEAL;
                ctx.fill();
                NK.tekst(ctx, D.BOGSTAVER[i], x + kb - 17, y + 17.5, { font: "800 13px " + FONT, farve: "#ffffff", justering: "center", linje: "middle" });
                ctx.restore();
            }
        });
    };

    NK.SimUkendt = SimUkendt;
}());
