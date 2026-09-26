/* =====================================================================
   opgave.js - motoren: de syv trin, tavlen og hjælpen

   Hver sværhedsgrad (Let, Middel, Svær) er et NK.Niveau med sin egen
   liste af reaktioner og sin egen igangværende opgave, så man kan skifte
   frem og tilbage uden at miste noget. Trinene er de samme som i den
   gamle c8.4, bortset fra at H⁺ og vand er to trin:

     0 oxidationstal     felter over atomerne på tavlen
     1 hvad oxideres     to knapper pr. par under tavlen
     2 elektroner        stigning og fald pr. atom
     3 koefficienter     felter foran formlerne; vægten tæller med
     4 ladningen         før og efter pilen
     5 H⁺ eller OH⁻      et felt på hver side af pilen
     6 vand              et felt på hver side af pilen

   Trin 5 og 6 springes over, når der intet skal til (Let). Den ene
   knap i panelet er Giv hint -> Vis svaret -> ... -> Ny opgave. Et
   forkert svar får en besked, der passer til netop den fejl
   (NK.Redox.oxFejl, eFejl og fejlene nedenfor).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var X = NK.Redox;

    var T_OX = 0, T_PAR = 1, T_E = 2, T_K = 3, T_LAD = 4, T_ION = 5, T_VAND = 6, ANTAL_TRIN = 7;
    var NOEGLE = "nk-sc8.4-loest";
    var aktiv = null;

    function ionTekst(R) { return R.ionSt ? R.ionSt.tekst : "H⁺"; }

    var TRIN = [
        { navn: "Oxidationstal", spm: function () { return "Skriv oxidationstallene i felterne over atomerne."; } },
        { navn: "Hvad oxideres?", spm: function () { return "Hvad oxideres, og hvad reduceres?"; } },
        { navn: "Elektroner pr. atom", spm: function () { return "Hvor meget stiger og falder oxidationstallet pr. atom?"; } },
        { navn: "Koefficienter", spm: function () { return "Skriv et tal foran hvert stof, så der afgives lige så mange elektroner, som der optages."; } },
        { navn: "Ladningen", spm: function () { return "Hvad er den samlede ladning før og efter pilen?"; } },
        { navn: function (R) { return R.ionSt ? ionTekst(R) + " afstemmer ladningen" : "H⁺ eller OH⁻"; },
          spm: function (R) { return "Afstem ladningen med " + ionTekst(R) + ". Skriv antallet på den rigtige side af pilen."; } },
        { navn: function () { return "H₂O afstemmer O"; },
          spm: function () { return "Afstem O med H₂O. Skriv antallet på den side af pilen, der mangler O."; } }
    ];

    function navn(t, R) { return typeof t.navn === "function" ? t.navn(R) : t.navn; }

    function hentLoest() { return NK.hent(NOEGLE, {}); }

    /* ----- Tal fra felterne ------------------------------------------------ */
    function tal(s, tomt) {
        var v = X.laesTal(s);
        return v === null ? tomt : v;
    }

    NK.Niveau = function (id) {
        this.id = id;
        this.liste = X.paaNiveau(id);
        var h = hentLoest(), nr = 0;
        for (var i = 0; i < this.liste.length; i++) {
            if (h[this.liste[i].id] !== "loest") { nr = i; break; }
        }
        this.start(nr);
    };

    var P = NK.Niveau.prototype;

    P.start = function (nr) {
        this.nr = nr;
        this.R = this.liste[nr];
        this.trin = T_OX;
        this.faerdig = false;
        /* Uden miljø (Let) er der ingen O og H: trin 6 og 7 er ikke nødvendige */
        this.status = this.R.miljoe ? [] : [, , , , , "unoedig", "unoedig"];
        this.hjaelp = 0;
        this.vist = false;
        this.f = { o: {}, k: {}, eox: "", ered: "", lv: "", lh: "", iv: "", ih: "", wv: "", wh: "" };
        this.ok = {};
        this.fejlF = {};
        this.parFejl = null;
        this.hintFelt = null;
        this.besked = { tekst: "", klasse: "" };
        this.eFlyv = 99;
        this.fokusFelt = null;
        this.vis();
    };

    P.forfra = function () { this.start(this.nr); };

    /* ----- Koefficienterne, som eleven har skrevet dem (tomt felt = 0) -------
       Tomme felter tæller ikke som 1, så vægten ikke viser facit, før
       eleven har gjort noget. Eleven skriver også 1. */
    P.koefNu = function () {
        var f = this.f.k;
        return this.R.led.map(function (l, i) {
            if (!f[i]) return 0;
            var v = X.laesTal(f[i]);
            return v === null ? 0 : v;
        });
    };

    P.koef = function () {
        return this.trin > T_K || this.faerdig ? this.R.koef : this.koefNu();
    };

    P.ionNu = function () {
        var R = this.R;
        if (this.trin > T_ION || this.faerdig) return R.ion;
        if (this.trin < T_ION) return { side: null, antal: 0 };
        var v = tal(this.f.iv, 0), h = tal(this.f.ih, 0);
        if (isNaN(v)) v = 0;
        if (isNaN(h)) h = 0;
        return { v: v, h: h };
    };

    /* Ladning med et H⁺/OH⁻-felt paa hver side (under trin 5) */
    P.ladningNu = function () {
        var R = this.R, q = X.ladninger(R, R.koef, R.ion.side && this.trin > T_ION ? R.ion : null);
        if (this.trin === T_ION && !this.faerdig) {
            var n = this.ionNu();
            q.v += n.v * R.ionSt.q;
            q.h += n.h * R.ionSt.q;
        }
        return q;
    };

    P.vandNu = function () {
        if (this.trin > T_VAND || this.faerdig) return this.R.vand;
        if (this.trin < T_VAND) return { side: null, antal: 0 };
        var v = tal(this.f.wv, 0), h = tal(this.f.wh, 0);
        return { v: isNaN(v) ? 0 : v, h: isNaN(h) ? 0 : h };
    };

    /* Antal af hvert grundstof med det, der står nu */
    P.taellingNu = function () {
        var R = this.R, t = X.taelling(R, this.koef(), this.trin > T_ION || this.faerdig ? R.ion : null, null);
        if (this.trin === T_VAND && !this.faerdig) {
            var w = this.vandNu();
            ["v", "h"].forEach(function (s) {
                t[s].H = (t[s].H || 0) + 2 * w[s];
                t[s].O = (t[s].O || 0) + w[s];
            });
        } else if (this.trin > T_VAND || this.faerdig) {
            t = X.taelling(R, R.koef, R.ion, R.vand);
        }
        return t;
    };

    /* ----- Forløbet --------------------------------------------------------- */
    P.loes = function (vist, tekst) {
        this.status[this.trin] = vist ? "vist" : "gjort";
        if (vist) this.vist = true;
        if (this.trin === T_K) this.eFlyv = 0;
        this.hjaelp = 0;
        this.hintFelt = null;
        this.fejlF = {};
        this.parFejl = null;
        var t = [tekst];
        this.trin++;
        /* H⁺ og vand springes over, når der intet skal til */
        if (this.trin === T_ION && !this.R.ion.antal) {
            this.status[T_ION] = "unoedig";
            if (this.R.ionSt) t.push("Ladningen passer allerede. Der skal ingen " + ionTekst(this.R) + " til.");
            this.trin++;
        }
        if (this.trin === T_VAND && !this.R.vand.antal) {
            this.status[T_VAND] = "unoedig";
            if (this.R.ionSt) t.push("Der er lige mange O på hver side, så der skal ikke vand til.");
            this.trin++;
        }
        if (this.trin >= ANTAL_TRIN) this.afslut(t);
        this.besked = { tekst: t.join(" "), klasse: vist ? "gul" : "god" };
        if (NK.laerer && NK.laerer.afvisTilbud) NK.laerer.afvisTilbud();
        this.vis();
    };

    P.afslut = function (t) {
        this.faerdig = true;
        var h = hentLoest(), id = this.R.id;
        if (!this.vist) h[id] = "loest";
        else if (h[id] !== "loest") h[id] = "vist";
        NK.gem(NOEGLE, h);
        t.push(this.vist ? "Reaktionen er afstemt. Svaret blev vist undervejs, så prøv den næste selv." : "Reaktionen er afstemt.");
        if (!this.vist && this.alleLoest()) {
            var ros = NK.hent("nk-sc8.4-ros", {});
            if (!ros[this.id]) {
                ros[this.id] = true;
                NK.gem("nk-sc8.4-ros", ros);
                if (NK.laerer && NK.laerer.ros) NK.laerer.ros(this.id);
            }
        }
    };

    P.alleLoest = function () {
        var h = hentLoest();
        return this.liste.every(function (R) { return h[R.id] === "loest"; });
    };

    /* Næste reaktion på niveauet, der ikke er løst. Er alle løst: videre
       til næste sværhedsgrad eller en anden reaktion end denne. */
    P.naesteNr = function () {
        var h = hentLoest(), n = this.liste.length;
        for (var i = 1; i <= n; i++) {
            var j = (this.nr + i) % n;
            if (h[this.liste[j].id] !== "loest" && j !== this.nr) return j;
        }
        return null;
    };

    P.naesteNiveau = function () {
        var i = D.NIVEAU_RAEKKE.indexOf(this.id), h = hentLoest();
        for (var k = i + 1; k < D.NIVEAU_RAEKKE.length; k++) {
            var id = D.NIVEAU_RAEKKE[k];
            if (X.paaNiveau(id).some(function (R) { return h[R.id] !== "loest"; })) return id;
        }
        return null;
    };

    P.naeste = function () {
        var j = this.naesteNr();
        if (j !== null) { this.start(j); return; }
        var ny = this.naesteNiveau();
        if (ny && NK.visNiveau) { NK.visNiveau(ny); return; }
        this.start((this.nr + 1 + Math.floor(Math.random() * (this.liste.length - 1))) % this.liste.length);
    };

    /* ----- Den ene knap ------------------------------------------------------ */
    P.knap = function () {
        if (this.faerdig) { this.naeste(); return; }
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.besked = { tekst: "Hint: " + this.hint(), klasse: "gul" };
            this.vis();
            return;
        }
        this.visSvar();
    };

    P.tjek = function () {
        if (this.faerdig) return;
        var t = this.trin;
        if (t === T_OX) this.tjekOx();
        else if (t === T_E) this.tjekE();
        else if (t === T_K) this.tjekK();
        else if (t === T_LAD) this.tjekLad();
        else if (t === T_ION) this.tjekIon();
        else if (t === T_VAND) this.tjekVand();
    };

    P.fejl = function (tekst, felter) {
        var mig = this;
        this.fejlF = {};
        (felter || []).forEach(function (k) { mig.fejlF[k] = true; });
        this.besked = { tekst: tekst, klasse: "skidt" };
        this.vis();
    };

    /* ----- Trin 0: oxidationstal ------------------------------------------- */
    P.tjekOx = function () {
        var R = this.R, mig = this, forste = null, fejlF = [], tomme = 0;
        R.led.forEach(function (l, i) {
            if (mig.ok[i]) return;
            var raa = mig.f.o[i] || "", v = X.laesOx(raa), st = l.st;
            if (v === st.ox[st.ukendt]) { mig.ok[i] = true; return; }
            fejlF.push("o" + i);
            if (!raa.trim()) { tomme++; return; }
            if (!forste) forste = X.oxFejl(st, v);
        });
        if (!fejlF.length) { this.loes(false, "Rigtigt. " + this.svaerOxBeregning()); return; }
        if (!forste) forste = tomme > 1 ? "Der mangler " + tomme + " oxidationstal." : "Der mangler et oxidationstal.";
        else if (fejlF.length - tomme < fejlF.length) forste += " Der mangler også " + (tomme === 1 ? "et oxidationstal." : tomme + " oxidationstal.");
        this.fejl(forste, fejlF);
    };

    /* Beregningen for det sværeste stof, som forklaring også ved rigtigt svar */
    P.svaerOxBeregning = function () {
        var s = this.R.led.filter(function (l) { return l.st.slags === "sammensat"; });
        if (!s.length) return "Grundstoffer har 0, og en ion af ét atom har sin ladning.";
        var set = {};
        return s.filter(function (l) { if (set[l.st.f]) return false; set[l.st.f] = 1; return true; })
            .slice(0, 2).map(function (l) { return X.oxBeregning(l.st); }).join(" ");
    };

    /* ----- Trin 1: hvad oxideres? ----------------------------------------- */
    /* Parrene står i den rækkefølge, reaktanterne står i. */
    P.parListe = function () {
        var R = this.R;
        return [R.ox, R.red].sort(function (a, b) { return a.v - b.v; });
    };

    P.parForklaring = function () {
        var R = this.R;
        function linje(Pp, ord, gor) {
            return R.led[Pp.v].st.tekst + " " + ord + ": " + Pp.E + " går fra " + X.ox(Pp.fra) + " til " + X.ox(Pp.til) + ", og " + gor + ".";
        }
        return linje(R.ox, "oxideres", "stoffet afgiver elektroner") + " " + linje(R.red, "reduceres", "stoffet optager elektroner");
    };

    P.valgKlik = function (i, valg) {
        if (this.faerdig || this.trin !== T_PAR) return;
        var Pp = this.parListe()[i];
        if (Pp.type === valg) { this.loes(false, "Rigtigt. " + this.parForklaring()); return; }
        this.parFejl = i + "-" + valg;
        var stiger = Pp.til > Pp.fra;
        this.fejl(Pp.E + " går fra " + X.ox(Pp.fra) + " til " + X.ox(Pp.til) + ". Oxidationstallet " + (stiger ? "stiger" : "falder")
            + ", så det er en " + (stiger ? "oxidation" : "reduktion") + ".", []);
    };

    /* ----- Trin 2: elektroner pr. atom ------------------------------------- */
    P.tjekE = function () {
        var R = this.R, vo = X.laesTal(this.f.eox), vr = X.laesTal(this.f.ered);
        var okO = vo !== null && !isNaN(vo) && Math.abs(vo) === R.ox.delta;
        var okR = vr !== null && !isNaN(vr) && Math.abs(vr) === R.red.delta;
        if (okO && okR) { this.loes(false, "Rigtigt. " + this.eEnhedTekst()); return; }
        var felter = [];
        if (!okO) felter.push("eox");
        if (!okR) felter.push("ered");
        if (!okO && !okR && vo !== null && vr !== null && Math.abs(vo) === R.red.delta && Math.abs(vr) === R.ox.delta) {
            this.fejl("Du har byttet om. " + R.ox.E + " går fra " + X.ox(R.ox.fra) + " til " + X.ox(R.ox.til) + ".", felter);
            return;
        }
        this.fejl(okO ? X.eFejl(R, R.red, vr) : X.eFejl(R, R.ox, vo), felter);
    };

    /* Én Cr₂O₇²⁻ optager 2 · 3 e⁻ = 6 e⁻ */
    function enhedTekst(R, Pp, ord) {
        var st = R.led[Pp.v].st;
        var t = "Én " + st.tekst + " " + ord + " ";
        if (Pp.nV > 1) return t + Pp.nV + " · " + Pp.delta + " e⁻ = " + Pp.ePrEnhed + " e⁻";
        return t + Pp.ePrEnhed + " e⁻";
    }

    P.eEnhedTekst = function () {
        var R = this.R;
        return enhedTekst(R, R.ox, "afgiver") + ", og " + enhedTekst(R, R.red, "optager").replace(/^Én/, "én") + ".";
    };

    /* ----- Trin 3: koefficienterne ------------------------------------------ */
    P.tjekK = function () {
        var R = this.R, k = this.koefNu(), OX = R.ox, RED = R.red, i;
        var tomme = [];
        for (i = 0; i < k.length; i++) if (!this.f.k[i]) tomme.push("k" + i);
        if (tomme.length) { this.fejl("Skriv et tal foran hvert stof, også når det er 1.", tomme); return; }
        for (i = 0; i < k.length; i++) {
            if (isNaN(k[i]) || k[i] < 1) { this.fejl("Skriv hele tal fra 1 og op.", ["k" + i]); return; }
        }
        var ens = true;
        for (i = 0; i < k.length; i++) if (k[i] !== R.koef[i]) ens = false;
        if (ens) { this.loes(false, "Rigtigt. " + this.eRegnskab(R.koef) + " Elektronerne går lige op."); return; }
        var af = k[OX.v] * OX.ePrEnhed, op = k[RED.v] * RED.ePrEnhed;
        if (af !== op) {
            this.fejl(this.eRegnskab(k) + " Der skal afgives lige så mange elektroner, som der optages.", ["k" + OX.v, "k" + RED.v]);
            return;
        }
        var par = [OX, RED];
        for (i = 0; i < 2; i++) {
            var Pp = par[i], fV = k[Pp.v] * Pp.nV, fH = k[Pp.h] * Pp.nH;
            if (fV !== fH) {
                var note = Pp.nV !== 1 || Pp.nH !== 1 ? " Husk indekstallet." : "";
                this.fejl(X.parTekst(R, Pp) + ": " + fV + " " + Pp.E + " før pilen og " + fH + " efter." + note, ["k" + Pp.h]);
                return;
            }
        }
        var m = k[0] / R.koef[0];
        if (m > 1 && m % 1 === 0 && k.every(function (v, j) { return v === m * R.koef[j]; })) {
            this.fejl("Afstemt, men alle tallene kan deles med " + m + ". Brug de mindste tal.", R.led.map(function (l, j) { return "k" + j; }));
            return;
        }
        this.fejl("Tjek tallene igen. Hvert par skal have lige mange atomer på begge sider.", R.led.map(function (l, j) { return "k" + j; }));
    };

    /* Afgivet: 5 · 1 e⁻ = 5 e⁻. Optaget: 1 · 5 e⁻ = 5 e⁻. */
    P.eRegnskab = function (k) {
        var R = this.R;
        return "Afgivet: " + k[R.ox.v] + " · " + R.ox.ePrEnhed + " e⁻ = " + k[R.ox.v] * R.ox.ePrEnhed + " e⁻. Optaget: "
            + k[R.red.v] + " · " + R.red.ePrEnhed + " e⁻ = " + k[R.red.v] * R.red.ePrEnhed + " e⁻.";
    };

    /* ----- Trin 4: ladningen ------------------------------------------------ */
    P.tjekLad = function () {
        var R = this.R, q = R.ladning, v = X.laesTal(this.f.lv), h = X.laesTal(this.f.lh);
        var okV = v === q.v, okH = h === q.h;
        if (okV && okH) { this.loes(false, "Rigtigt. Ladningen er " + X.lad(q.v) + " før pilen og " + X.lad(q.h) + " efter."); return; }
        var side = okV ? "h" : "v", svar = okV ? h : v, rigtig = q[side];
        var felter = [];
        if (!okV) felter.push("lv");
        if (!okH) felter.push("lh");
        this.fejl(this.ladFejl(side, svar, rigtig), felter);
    };

    P.ladFejl = function (side, svar, rigtig) {
        var R = this.R, uden = 0, eks = null;
        if (svar === null || isNaN(svar)) return "Skriv ladningen som et tal med fortegn, fx +9 eller −8.";
        R.led.forEach(function (l, i) {
            if (l.side !== side) return;
            uden += l.st.q;
            if (!eks && R.koef[i] > 1 && l.st.q) eks = R.koef[i] + " " + l.st.tekst + " har ladningen " + R.koef[i] + " · " + X.ladP(l.st.q) + " = " + X.lad(R.koef[i] * l.st.q) + ".";
        });
        var hvor = side === "v" ? "Før pilen" : "Efter pilen";
        if (svar === uden && eks) return hvor + ": husk koefficienterne. " + eks;
        if (svar === -rigtig) return hvor + ": tjek fortegnene.";
        return hvor + ": gang hver ladning med koefficienten, og læg sammen.";
    };

    /* ----- Trin 5: H⁺ eller OH⁻ ---------------------------------------------- */
    P.tjekIon = function () {
        var R = this.R, n = this.ionNu(), rig = R.ion, ion = ionTekst(R);
        if (isNaN(X.laesTal(this.f.iv)) || isNaN(X.laesTal(this.f.ih))) { this.fejl("Skriv et helt tal.", ["iv", "ih"]); return; }
        if (n[rig.side] === rig.antal && n[rig.side === "v" ? "h" : "v"] === 0) {
            var q = X.ladninger(R, R.koef, R.ion);
            this.loes(false, "Rigtigt. Nu er ladningen " + X.lad(q.v) + " på begge sider.");
            return;
        }
        var q0 = R.ladning;
        if (n.v > 0 && n.h > 0) { this.fejl("Kun på den ene side. " + ion + " på begge sider går ud mod hinanden.", ["iv", "ih"]); return; }
        if (!n.v && !n.h) { this.fejl("Skriv antallet af " + ion + " i feltet på den side, hvor de skal stå.", ["iv", "ih"]); return; }
        var forkert = rig.side === "v" ? "h" : "v";
        if (n[forkert] > 0) {
            this.fejl(ion + " er " + (R.ionSt.q > 0 ? "positive" : "negative") + ". Før pilen er ladningen " + X.lad(q0.v) + " og efter pilen "
                + X.lad(q0.h) + ". Så " + ion + " skal på den side, der har " + (R.ionSt.q > 0 ? "mindst" : "størst") + " ladning.", [forkert === "v" ? "iv" : "ih"]);
            return;
        }
        var q1 = this.ladningNu(), mangler = Math.abs(q1.v - q1.h) / Math.abs(R.ionSt.q);
        var for_ = n[rig.side] > rig.antal;
        this.fejl("Nu er ladningen " + X.lad(q1.v) + " før pilen og " + X.lad(q1.h) + " efter. Der er " + mangler + " " + ion + " for "
            + (for_ ? "mange" : "få") + ".", [rig.side === "v" ? "iv" : "ih"]);
    };

    /* ----- Trin 6: vand ------------------------------------------------------- */
    P.tjekVand = function () {
        var R = this.R, w = this.vandNu(), rig = R.vand;
        if (isNaN(X.laesTal(this.f.wv)) || isNaN(X.laesTal(this.f.wh))) { this.fejl("Skriv et helt tal.", ["wv", "wh"]); return; }
        if (w[rig.side] === rig.antal && w[rig.side === "v" ? "h" : "v"] === 0) {
            var t = X.taelling(R, R.koef, R.ion, R.vand);
            this.loes(false, "Rigtigt. O: " + t.v.O + " = " + t.h.O + ", og H passer også: " + t.v.H + " = " + t.h.H + ".");
            return;
        }
        var t0 = X.taelling(R, R.koef, R.ion, null);
        if (w.v > 0 && w.h > 0) { this.fejl("Kun på den ene side. Vand på begge sider går ud mod hinanden.", ["wv", "wh"]); return; }
        if (!w.v && !w.h) { this.fejl("Skriv antallet af H₂O i feltet på den side, der mangler O.", ["wv", "wh"]); return; }
        var forkert = rig.side === "v" ? "h" : "v";
        if (w[forkert] > 0) {
            this.fejl("Vandet skal på den side, der mangler O. Før pilen er der " + (t0.v.O || 0) + " O og efter pilen " + (t0.h.O || 0) + ".",
                [forkert === "v" ? "wv" : "wh"]);
            return;
        }
        var t1 = this.taellingNu();
        this.fejl("Tæl O: " + (t1.v.O || 0) + " før pilen og " + (t1.h.O || 0) + " efter. Hvert H₂O giver ét O.", [rig.side === "v" ? "wv" : "wh"]);
    };

    /* ----- Hint og svar ------------------------------------------------------- */
    P.hint = function () {
        var R = this.R, mig = this;
        switch (this.trin) {
        case T_OX:
            var l = R.led.filter(function (x, i) { return !mig.ok[i]; })[0] || R.led[0];
            this.hintFelt = "o" + l.nr;
            return X.oxHint(l.st);
        case T_PAR:
            return "Stiger oxidationstallet, er det en oxidation. Falder det, er det en reduktion.";
        case T_E:
            return R.ox.E + " går fra " + X.ox(R.ox.fra) + " til " + X.ox(R.ox.til) + ", og " + R.red.E + " går fra "
                + X.ox(R.red.fra) + " til " + X.ox(R.red.til) + ". Hvor mange trin er det?";
        case T_K:
            var t = this.eEnhedTekst() + " Find det mindste antal elektroner, som begge går op i.";
            var idx = [R.ox, R.red].filter(function (Pp) { return Pp.nV !== Pp.nH; })[0];
            if (idx) t += " Husk indekstallet i " + R.led[idx.nV > idx.nH ? idx.v : idx.h].st.tekst + ".";
            return t;
        case T_LAD:
            return "Gang hver ladning med koefficienten. Før pilen: " + X.ladBeregning(R, R.koef, "v") + " = ?";
        case T_ION:
            var q = R.ladning;
            return ionTekst(R) + " er " + (R.ionSt.q > 0 ? "positive" : "negative") + ". Læg dem på den side, der har "
                + (R.ionSt.q > 0 ? "mindst" : "størst") + " ladning. Før pilen er den " + X.lad(q.v) + ", efter pilen " + X.lad(q.h) + ".";
        case T_VAND:
            var t0 = X.taelling(R, R.koef, R.ion, null);
            return "Tæl O på hver side. Før pilen er der " + (t0.v.O || 0) + " O, efter pilen " + (t0.h.O || 0) + ". Hvert H₂O giver ét O.";
        }
        return "";
    };

    P.visSvar = function () {
        var R = this.R, mig = this;
        switch (this.trin) {
        case T_OX:
            var t = [], set = {};
            R.led.forEach(function (l, i) {
                mig.f.o[i] = X.ox(l.st.ox[l.st.ukendt]);
                if (!mig.ok[i] && !set[l.st.f]) { set[l.st.f] = 1; t.push(X.oxBeregning(l.st)); }
                mig.ok[i] = true;
            });
            this.loes(true, t.join(" "));
            return;
        case T_PAR:
            this.loes(true, this.parForklaring());
            return;
        case T_E:
            this.f.eox = String(R.ox.delta);
            this.f.ered = String(R.red.delta);
            this.loes(true, R.ox.E + ": fra " + X.ox(R.ox.fra) + " til " + X.ox(R.ox.til) + " er en stigning på " + R.ox.delta + ". "
                + R.red.E + ": fra " + X.ox(R.red.fra) + " til " + X.ox(R.red.til) + " er et fald på " + R.red.delta + ".");
            return;
        case T_K:
            R.koef.forEach(function (v, i) { mig.f.k[i] = String(v); });
            this.loes(true, this.eRegnskab(R.koef));
            return;
        case T_LAD:
            this.f.lv = X.lad(R.ladning.v);
            this.f.lh = X.lad(R.ladning.h);
            this.loes(true, "Før pilen: " + X.ladBeregning(R, R.koef, "v") + " = " + X.lad(R.ladning.v) + ". Efter pilen: "
                + X.ladBeregning(R, R.koef, "h") + " = " + X.lad(R.ladning.h) + ".");
            return;
        case T_ION:
            this.f[R.ion.side === "v" ? "iv" : "ih"] = String(R.ion.antal);
            this.f[R.ion.side === "v" ? "ih" : "iv"] = "";
            var q = X.ladninger(R, R.koef, R.ion);
            this.loes(true, R.ion.antal + " " + ionTekst(R) + " " + (R.ion.side === "v" ? "før" : "efter") + " pilen giver ladningen "
                + X.lad(q.v) + " på begge sider.");
            return;
        case T_VAND:
            this.f[R.vand.side === "v" ? "wv" : "wh"] = String(R.vand.antal);
            this.f[R.vand.side === "v" ? "wh" : "wv"] = "";
            var tt = X.taelling(R, R.koef, R.ion, R.vand);
            this.loes(true, R.vand.antal + " H₂O " + (R.vand.side === "v" ? "før" : "efter") + " pilen giver " + tt.v.O
                + " O på begge sider. H passer også: " + tt.v.H + " = " + tt.h.H + ".");
            return;
        }
    };

    /* ----- Vægten ------------------------------------------------------------ */
    /* Det, js/vaegt.js skal tegne */
    P.vaegtData = function () {
        var R = this.R, k = this.koef();
        var fase = this.trin <= T_PAR && !this.faerdig ? 0 : (this.trin === T_E ? 1 : (this.trin === T_K && !this.faerdig ? 3 : 4));
        function pan(Pp) {
            var n = k[Pp.v];
            return { tekst: R.led[Pp.v].st.tekst, antal: isNaN(n) ? 0 : NK.klamp(n, 0, 60), ePr: Pp.ePrEnhed, nV: Pp.nV, delta: Pp.delta };
        }
        return { fase: fase, v: pan(R.ox), h: pan(R.red), eFlyv: this.eFlyv, id: R.id };
    };

    /* Plus og minus under vægtskålene: koefficienten foran reaktanten */
    P.vaegtKlik = function (side, d) {
        if (this.faerdig || this.trin !== T_K) return false;
        var Pp = side === "v" ? this.R.ox : this.R.red, i = Pp.v;
        var n = X.laesTal(this.f.k[i] || "");
        if (n === null || isNaN(n)) n = 0;
        n = NK.klamp(n + d, 0, 99);
        this.f.k[i] = n ? String(n) : "";
        delete this.fejlF["k" + i];
        var el = NK.el("tavle").querySelector('[data-felt="k' + i + '"]');
        if (el) { el.value = this.f.k[i]; el.classList.remove("fejl"); }
        this.visKontrol();
        this.tjekOvervaegt();
        return true;
    };

    P.tjekOvervaegt = function () {
        var k = this.koefNu(), R = this.R;
        var stor = Math.max(k[R.ox.v] || 0, k[R.red.v] || 0) >= D.OVERVAEGT_GRAENSE;
        if (stor && !this.overvaegt && NK.laerer && NK.laerer.overvaegt) NK.laerer.overvaegt();
        this.overvaegt = stor;
    };

    /* ----- Tavlen ------------------------------------------------------------- */
    P.felt = function (key, klasse, pladsholder, vaerdi) {
        var v = vaerdi !== undefined ? vaerdi : this.feltVaerdi(key);
        var fejl = this.fejlF[key], hint = this.hintFelt === key && !fejl;
        return '<input type="text" class="' + klasse + (fejl ? " fejl" : "") + (hint ? " hint" : "") + '" data-felt="' + key + '" value="'
            + NK.html(v) + '" autocomplete="off" autocapitalize="off" spellcheck="false" inputmode="' + (klasse === "oxfelt" ? "text" : "numeric")
            + '"' + (pladsholder ? ' placeholder="' + pladsholder + '"' : "") + ' aria-label="Skriv her">';
    };

    P.feltVaerdi = function (key) {
        if (key[0] === "o" && key.length > 1 && /\d/.test(key[1])) return this.f.o[+key.slice(1)] || "";
        if (key[0] === "k") return this.f.k[+key.slice(1)] || "";
        return this.f[key] || "";
    };

    P.rolleKlasse = function (l) {
        return this.trin > T_PAR || this.faerdig ? (l.rolle === "ox" ? " r-ox" : " r-red") : "";
    };

    /* En formel med oxidationstallene over atomerne */
    P.formelHTML = function (l, medOx) {
        var st = l.st, mig = this, h = '<span class="formel">';
        st.atomer.forEach(function (a) {
            var sym = a.s + (a.n > 1 ? NK.saenket(a.n) : ""), ox = "";
            if (medOx) {
                if (a.s !== st.ukendt) ox = '<span class="oxtal fast">' + X.ox(st.ox[a.s]) + "</span>";
                else if (mig.trin === T_OX && !mig.ok[l.nr] && !mig.faerdig) ox = mig.felt("o" + l.nr, "oxfelt", "?");
                else ox = '<span class="oxtal' + mig.rolleKlasse(l) + (mig.trin === T_OX ? " ny" : "") + '">' + X.ox(st.ox[a.s]) + "</span>";
            }
            h += '<span class="atom">' + (medOx ? '<span class="oxrk">' + ox + "</span>" : "") + '<span class="sym">' + sym + "</span></span>";
        });
        if (st.q) h += '<span class="atom lad"><span class="sym">' + NK.ladningHaevet(st.q) + "</span></span>";
        return h + "</span>";
    };

    P.koefHTML = function (i) {
        if (this.trin < T_K && !this.faerdig) return "";
        if (this.trin === T_K && !this.faerdig) return '<span class="koefplads">' + this.felt("k" + i, "koeffelt", "") + "</span>";
        var v = this.R.koef[i];
        return '<span class="koefplads"><span class="koeftal' + (v === 1 ? " en" : "") + '">' + v + "</span></span>";
    };

    /* H⁺/OH⁻ eller vand: et felt på hver side, mens trinnet er i gang,
       bagefter kun på den side, hvor de står */
    P.ekstraHTML = function (side) {
        var R = this.R, h = "";
        if (this.trin === T_ION && !this.faerdig && R.ionSt) {
            h += '<span class="op">+</span><span class="led plads">'
                + '<span class="koefplads">' + this.felt("i" + side, "koeffelt", "") + '</span><span class="formel"><span class="atom"><span class="oxrk"></span><span class="sym">'
                + R.ionSt.tekst + "</span></span></span></span>";
        } else if (this.trin > T_ION && R.ion.side === side && R.ion.antal) {
            h += '<span class="op">+</span>' + this.tilfoejetHTML(R.ion.antal, R.ionSt.tekst);
        }
        if (this.trin === T_VAND && !this.faerdig) {
            h += '<span class="op">+</span><span class="led plads">'
                + '<span class="koefplads">' + this.felt("w" + side, "koeffelt", "") + '</span><span class="formel"><span class="atom"><span class="oxrk"></span><span class="sym">H₂O</span></span></span></span>';
        } else if (this.trin > T_VAND && R.vand.side === side && R.vand.antal) {
            h += '<span class="op">+</span>' + this.tilfoejetHTML(R.vand.antal, "H₂O");
        }
        return h;
    };

    P.tilfoejetHTML = function (n, tekst) {
        return '<span class="led tilfoejet"><span class="koefplads"><span class="koeftal' + (n === 1 ? " en" : "") + '">' + n
            + '</span></span><span class="formel"><span class="atom"><span class="oxrk"></span><span class="sym">' + tekst + "</span></span></span></span>";
    };

    P.skemaHTML = function () {
        var R = this.R, mig = this, h = '<div class="skema">';
        ["v", "h"].forEach(function (side) {
            if (side === "h") h += '<span class="op pil">⟶</span>';
            var foerste = true;
            R.led.forEach(function (l, i) {
                if (l.side !== side) return;
                if (!foerste) h += '<span class="op">+</span>';
                foerste = false;
                h += '<span class="led' + mig.rolleKlasse(l) + '" data-led="' + i + '">' + mig.koefHTML(i) + mig.formelHTML(l, true) + "</span>";
            });
            h += mig.ekstraHTML(side);
        });
        h += "</div>";
        if (R.samme && !this.faerdig) {
            h += '<p class="tavle-note">' + R.led[R.samme === "v" ? 0 : 2].st.tekst + " står to gange, fordi det både "
                + (R.samme === "v" ? "oxideres og reduceres" : "dannes ved oxidationen og ved reduktionen") + ". De slås sammen til sidst.</p>";
        }
        return h;
    };

    /* Det færdige skema: ens led slået sammen, uden oxidationstal */
    P.slutHTML = function () {
        var s = this.R.slut, h = '<div class="skema slut">';
        ["v", "h"].forEach(function (side) {
            if (side === "h") h += '<span class="op pil">⟶</span>';
            s[side].forEach(function (x, j) {
                if (j) h += '<span class="op">+</span>';
                h += '<span class="led"><span class="koefplads">' + (x.koef === 1 ? "" : '<span class="koeftal">' + x.koef + "</span>")
                    + '</span><span class="formel"><span class="atom"><span class="sym">' + x.st.tekst + "</span></span></span></span>";
            });
        });
        return h + "</div>";
    };

    /* ----- Under tavlen: svarmuligheder og felter ----------------------------- */
    P.valgHTML = function () {
        var R = this.R, mig = this;
        if (this.faerdig) return "";
        if (this.trin === T_PAR) {
            return '<div class="parvalg">' + this.parListe().map(function (Pp, i) {
                function knap(valg, tekst) {
                    var fejl = mig.parFejl === i + "-" + valg;
                    return '<button type="button" class="valgknap' + (fejl ? " forkert" : "") + '" data-par="' + i + '" data-valg="' + valg + '">' + tekst + "</button>";
                }
                return '<div class="parrk"><span class="partekst">' + X.parTekst(R, Pp) + '<small>' + Pp.E + ": " + X.ox(Pp.fra) + " ⟶ " + X.ox(Pp.til)
                    + "</small></span>" + knap("ox", "oxideres") + knap("red", "reduceres") + "</div>";
            }).join("") + "</div>";
        }
        if (this.trin === T_E) {
            return '<div class="efelter">'
                + '<label class="erk r-ox"><span class="etekst"><b>' + R.ox.E + "</b> " + X.ox(R.ox.fra) + " ⟶ " + X.ox(R.ox.til) + '</span><span>stiger med</span>'
                + this.felt("eox", "koeffelt", "") + "<span>pr. atom</span></label>"
                + '<label class="erk r-red"><span class="etekst"><b>' + R.red.E + "</b> " + X.ox(R.red.fra) + " ⟶ " + X.ox(R.red.til) + '</span><span>falder med</span>'
                + this.felt("ered", "koeffelt", "") + "<span>pr. atom</span></label></div>";
        }
        if (this.trin === T_LAD) {
            return '<div class="efelter"><label class="erk"><span>Ladning før pilen</span>' + this.felt("lv", "koeffelt bred", "")
                + '</label><label class="erk"><span>efter pilen</span>' + this.felt("lh", "koeffelt bred", "") + "</label></div>";
        }
        return "";
    };

    /* Kontrollen under skemaet: tal før og efter pilen, der skal være ens.
       Kun det, trinnet handler om, og kun tal, eleven selv har regnet ud:
       ladningen i trin 6, O og H i trin 7 og det hele, når skemaet er
       færdigt. I trin 4 er det vægten, der viser elektronerne. */
    P.kontrolHTML = function () {
        var R = this.R;
        if (!this.faerdig && this.trin !== T_ION && this.trin !== T_VAND) return "";
        var chips = [];
        function chip(navn, a, b) {
            var ok = a === b;
            chips.push('<span class="kchip ' + (ok ? "ok" : "nej") + '"><b>' + navn + "</b> " + a + (ok ? " = " : " ≠ ") + b + "</span>");
        }
        if (this.faerdig) chip("e⁻", R.elektroner, R.koef[R.red.v] * R.red.ePrEnhed);
        if (this.trin !== T_ION || this.faerdig) {
            var t = this.taellingNu();
            var el = Object.keys(t.v);
            Object.keys(t.h).forEach(function (s) { if (el.indexOf(s) < 0) el.push(s); });
            if (!this.faerdig) el = el.filter(function (s) { return s === "O" || s === "H"; });
            el.forEach(function (s) { chip(s, t.v[s] || 0, t.h[s] || 0); });
        }
        if (this.trin === T_ION || this.faerdig) {
            var q = this.faerdig ? X.ladninger(R, R.koef, R.ion) : this.ladningNu();
            chip("ladning", X.lad(q.v), X.lad(q.h));
        }
        return '<span class="k-etiket">Før = efter</span>' + chips.join("");
    };

    P.visKontrol = function () {
        if (aktiv !== this) return;
        NK.el("kontrol").innerHTML = this.kontrolHTML();
    };

    /* ----- Alt tegnes ud fra tilstanden ---------------------------------------- */
    P.opgaveTekst = function () {
        var m = this.R.miljoe;
        return "Afstem reaktionen." + (m === "surt" ? " Den foregår i surt miljø." : (m === "basisk" ? " Den foregår i basisk miljø." : ""));
    };

    P.vis = function () {
        if (aktiv !== this) return;
        var R = this.R, t = TRIN[Math.min(this.trin, ANTAL_TRIN - 1)];
        NK.el("ab-trin").textContent = this.faerdig ? "Færdig" : "Trin " + (this.trin + 1) + " af " + ANTAL_TRIN;
        NK.el("ab-spm").textContent = this.faerdig ? "Reaktionen er afstemt." : t.spm(R);
        NK.el("tavle").innerHTML = this.faerdig ? this.slutHTML() : this.skemaHTML();
        NK.el("tavle").classList.toggle("faerdig", this.faerdig);
        tilpasSkema();
        NK.el("ab-valg").innerHTML = this.valgHTML();
        NK.el("tjek").hidden = this.faerdig || this.trin === T_PAR;
        this.visKontrol();
        var b = NK.el("besked");
        b.textContent = this.besked.tekst;
        b.className = "besked " + this.besked.klasse;
        this.visPanel();
        this.fokus();
    };

    P.visPanel = function () {
        var mig = this, R = this.R, h = "";
        NK.el("opgavetekst").textContent = this.opgaveTekst();
        var kt = NK.el("kontekst");
        kt.textContent = R.def.kontekst || "";
        kt.hidden = !R.def.kontekst;
        TRIN.forEach(function (t, i) {
            var st = mig.status[i] || (i === mig.trin && !mig.faerdig ? "aktiv" : "");
            var maerke = st === "vist" ? '<span class="tvist">svaret vist</span>' : (st === "unoedig" ? '<span class="tgivet">ikke nødvendig</span>' : "");
            h += '<li class="trin-punkt ' + st + '"><span class="tnr">' + (st === "gjort" || st === "unoedig" ? "✓" : (i + 1)) + "</span>"
                + '<span class="tnavn">' + navn(t, R) + "</span>" + maerke + "</li>";
        });
        NK.el("trinliste").innerHTML = h;

        var loest = hentLoest(), n = 0;
        var knapper = this.liste.map(function (Rx, i) {
            var s = loest[Rx.id];
            if (s === "loest") n++;
            return '<button type="button" class="nrknap' + (s === "loest" ? " gjort" : (s === "vist" ? " vist" : "")) + (i === mig.nr ? " aktiv" : "")
                + '" data-nr="' + i + '" title="' + NK.html(X.skemaTekst({ v: Rx.led.filter(function (l) { return l.side === "v"; }).map(function (l) { return { koef: 1, st: l.st }; }),
                    h: Rx.led.filter(function (l) { return l.side === "h"; }).map(function (l) { return { koef: 1, st: l.st }; }) })) + '">' + (i + 1) + "</button>";
        });
        NK.el("nrknapper").innerHTML = knapper.join("");
        NK.el("loest").textContent = n + " af " + this.liste.length;

        var k = NK.el("opgaveknap"), tekst;
        if (this.faerdig) tekst = this.naesteNr() === null && this.naesteNiveau() ? "Næste sværhedsgrad" : "Ny opgave";
        else tekst = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
        k.textContent = tekst;
        k.classList.toggle("banker", this.faerdig);
        k.classList.toggle("groen", this.faerdig);
        k.classList.toggle("blaa", !this.faerdig);
        NK.el("opgavekort").classList.toggle("sejr", this.faerdig && !this.vist);
    };

    /* Markøren i det første felt, der mangler, så man kan skrive med det samme */
    P.fokus = function () {
        var felter = NK.el("tavle").querySelectorAll("input"), under = NK.el("ab-valg").querySelectorAll("input");
        var alle = Array.prototype.slice.call(felter).concat(Array.prototype.slice.call(under)), maal = null;
        for (var i = 0; i < alle.length; i++) {
            if (this.fokusFelt && alle[i].getAttribute("data-felt") === this.fokusFelt) { maal = alle[i]; break; }
            if (!maal && alle[i].classList.contains("fejl")) maal = alle[i];
        }
        if (!maal) for (i = 0; i < alle.length; i++) if (!alle[i].value) { maal = alle[i]; break; }
        this.fokusFelt = null;
        if (!maal || (NK.Rundvisning && NK.Rundvisning.aktiv()) || document.querySelector(".overlay.vis")) return;
        if (this.trin === T_K || this.trin === T_ION || this.trin === T_VAND) return;   /* flere lige gode felter: eleven vælger */
        try {
            maal.focus({ preventScroll: true });
            maal.setSelectionRange(maal.value.length, maal.value.length);
        } catch (e) { /* ældre browsere */ }
    };

    /* Skemaet skal stå på én linje: er det for bredt, bliver skriften mindre */
    function ombrudt(sk) {
        var b = sk.children;
        if (sk.scrollWidth > sk.clientWidth + 1) return true;
        if (b.length < 2) return false;
        var bund = b[0].offsetTop + b[0].offsetHeight;
        for (var i = 1; i < b.length; i++) {
            if (Math.abs(b[i].offsetTop + b[i].offsetHeight - bund) > 6) return true;
        }
        return false;
    }

    function tilpasSkema() {
        var sk = NK.el("tavle").querySelector(".skema");
        if (!sk || !sk.offsetWidth) return;
        sk.style.fontSize = "";
        var fs = parseFloat(window.getComputedStyle(sk).fontSize);
        for (var i = 0; i < 30 && fs > 15 && ombrudt(sk); i++) {
            fs = Math.max(15, fs - 1);
            sk.style.fontSize = fs + "px";
        }
    }
    NK.tilpasSkema = tilpasSkema;

    /* ----- Fælles hændelser ---------------------------------------------------- */
    NK.Niveau.aktiver = function (niv) {
        aktiv = niv;
        niv.vis();
    };
    NK.Niveau.aktivt = function () { return aktiv; };
    NK.Niveau.TRIN = { OX: T_OX, PAR: T_PAR, E: T_E, K: T_K, LAD: T_LAD, ION: T_ION, VAND: T_VAND, ANTAL: ANTAL_TRIN };
    NK.Niveau.TRIN_DEF = TRIN;

    NK.Niveau.init = function () {
        var tavle = NK.el("tavle"), valg = NK.el("ab-valg");

        function input(e) {
            var el = e.target, key = el.getAttribute("data-felt");
            if (!aktiv || !key) return;
            if (el.classList.contains("koeffelt")) {
                var ny = el.value.replace(/[^0-9+\-−]/g, "").slice(0, 4);
                if (ny !== el.value) el.value = ny;
            }
            if (key[0] === "o" && /\d/.test(key[1] || "")) aktiv.f.o[+key.slice(1)] = el.value;
            else if (key[0] === "k") aktiv.f.k[+key.slice(1)] = el.value;
            else aktiv.f[key] = el.value;
            el.classList.remove("fejl");
            delete aktiv.fejlF[key];
            if (key[0] === "k") aktiv.tjekOvervaegt();
            aktiv.visKontrol();
        }
        function enter(e) {
            if (e.key === "Enter" && aktiv && e.target.tagName === "INPUT") {
                e.preventDefault();
                aktiv.fokusFelt = e.target.getAttribute("data-felt");
                aktiv.tjek();
            }
        }
        tavle.addEventListener("input", input);
        valg.addEventListener("input", input);
        tavle.addEventListener("keydown", enter);
        valg.addEventListener("keydown", enter);

        /* Et klik på tavlen uden for felterne siger, hvad der kan gøres */
        tavle.addEventListener("click", function (e) {
            if (!aktiv || e.target.tagName === "INPUT") return;
            var t = aktiv.trin;
            if (aktiv.faerdig) return;
            if (t === T_PAR) aktiv.besked = { tekst: "Vælg under tavlen, om hvert par oxideres eller reduceres.", klasse: "" };
            else if (t === T_E || t === T_LAD) aktiv.besked = { tekst: "Skriv svaret i felterne under tavlen.", klasse: "" };
            else return;
            NK.el("besked").textContent = aktiv.besked.tekst;
            NK.el("besked").className = "besked";
        });

        valg.addEventListener("click", function (e) {
            var b = e.target.closest ? e.target.closest("button[data-par]") : null;
            if (!b || !aktiv) return;
            aktiv.valgKlik(parseInt(b.getAttribute("data-par"), 10), b.getAttribute("data-valg"));
        });

        NK.el("nrknapper").addEventListener("click", function (e) {
            var b = e.target.closest ? e.target.closest("[data-nr]") : null;
            if (!b || !aktiv) return;
            aktiv.start(parseInt(b.getAttribute("data-nr"), 10));
        });

        window.addEventListener("resize", tilpasSkema);

        NK.el("tjek").addEventListener("click", function () { if (aktiv) aktiv.tjek(); });
        NK.el("opgaveknap").addEventListener("click", function () { if (aktiv) aktiv.knap(); });
        NK.el("forfra").addEventListener("click", function () { if (aktiv) aktiv.forfra(); });
    };
}());
