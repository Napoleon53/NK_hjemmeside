/* =====================================================================
   sim_jagt.js - Isomerjagten

   Hver jagt er en molekylformel. Eleven tegner isomererne én ad gangen
   paa whiteboardet med molekylemotorens tavle og trykker Indsend svar.
   Knappen viser tegningens molekylformel (Indsend svar: C₄H₁₀O).

   En jagt har tre faser:
     tegn  eleven tegner. Indsend svar bedoemmer tegningen:
             * en anden molekylformel: kortet siger, hvad der er forkert
             * en isomer, der allerede er paa hylden: "Det er ... igen",
               og kortet paa hylden ryster (det samme stof tegnet to gange)
             * en ny isomer: den kommer paa hylden. Tegningen bliver
               staaende, saa eleven kan flytte OH-gruppen eller kaeden
               og proeve igen
   spm   efter en ny isomer: hvilken slags isomerer er den nye og en
             isomer fra hylden? Begge staar paa whiteboardet. Kortet
             spoerger kun om par, der er forskellige paa én maade
             (K.ren i js/kemi.js), og hoejst to gange om hver slags
   kog   alle er fundet: eleven klikker isomererne i raekkefoelge efter
             kogepunkt (jagt.kog "raekke") eller finder den, der koger
             hoejest ("hoejest"), og trykker Indsend svar. Saa staar
             kogepunkterne paa whiteboardet og paa hylden

   Det, der er fundet, huskes i browseren (nk-sb3.3-jagter). En jagt faar
   en stjerne, naar den er klaret uden Vis svaret og uden et forkert svar
   paa et spoergsmaal eller et kogepunkt. En forkert tegning koster intet:
   det er at proeve sig frem.

   Tavlen er motorens (som i sb3.1). Det, der er anderledes, staar i klik:
     * Kaede: et klik paa et atom saetter et carbonatom paa (ogsaa paa et
       oxygenatom, saa en ether kan tegnes ud fra en OH-gruppe)
     * −OH saetter en OH-gruppe paa et carbonatom
     * C → O goer carbonatomet til et oxygenatom (og O tilbage til C). Et
       carbonatom midt i kaeden giver en ether, ét for enden en alkohol
     * ingen dobbeltbindinger og ingen ringe
   Efter −OH og C → O gaar vaerktoejet tilbage til Kaede.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var F = NK.Fane;
    var NOEGLE = "nk-sb3.3-jagter";

    function SimJagt() {
        var mig = this;
        this.vaerktoejEl = NK.el("j-vaerktoej");
        this.braet = new NK.Tegnebraet({
            felt: function () { return mig.felt(); },
            skala: function () { return mig.skala(); },
            regler: {
                kunC: false, dobbelt: false, tripel: false, knaek: true, sletAlt: false, ringe: false,
                maks: function () { var n = mig.jagt ? D.antal(mig.jagt) : { C: 8, O: 1 }; return n.C + n.O + 4; },
                maksTekst: function () { return "Der er ikke plads til flere atomer. Slet et atom med højreklik, eller tryk Fortryd."; }
            },
            aendret: function (hvad) { mig.aendret(hvad); },
            toast: function (t) { if (t && !mig.groen && mig.fase === "tegn") mig.kortBesked(t, 3.5); }
        });
        var b = this.braet;
        b.klik = function (u) {
            var v = this.vaerktoej;
            if (!u) { this.toast("Klik på et atom, eller træk fra et atom, for at tegne videre."); return; }
            if (u.slags === "binding") {
                if (mig.jagt && mig.jagt.dobbelt && (v === "binding" || v === "tegn")) { this.skiftBinding(u.binding); return; }
                this.toast("Isomererne her har kun enkeltbindinger. Træk fra et atom for at tegne.");
                return;
            }
            if (u.slags !== "atom") return;
            var a = u.atom;
            if (v === "binding") { this.toast("Klik på stregen mellem to carbonatomer."); return; }
            if (v === "gruppe:OH") {
                if (a.el !== "C") { this.toast("Klik på et carbonatom."); return; }
                this.saetGruppe(a.id, "OH");
                return;
            }
            if (v === "skiftO") { mig.skiftO(a); return; }
            this.nytFra(a.id, "C");
        };
        NK.el("j-fortryd").addEventListener("click", function () { mig.fortryd(); });
        NK.el("j-ryd").addEventListener("click", function () { mig.nulstil(); });
        this.vaerktoejEl.addEventListener("click", function (e) {
            var k = e.target.closest ? e.target.closest("[data-vt]") : null;
            if (k) mig.vaelgVaerktoej(k.getAttribute("data-vt"));
        });
        NK.el("j-jagtliste").addEventListener("click", function (e) {
            var k = e.target.closest ? e.target.closest("[data-jagt]") : null;
            if (k) mig.vaelg(parseInt(k.getAttribute("data-jagt"), 10));
        });
        NK.el("j-igen").addEventListener("click", function () { mig.jagIgen(mig.nr); });
        this.sejrEl = NK.el("j-sejr");
        NK.el("j-sejr-luk").addEventListener("click", function () { mig.lukSejr(); });
        NK.el("j-sejr-igen").addEventListener("click", function () {
            var i = mig.foersteUdenStjerne();
            mig.lukSejr();
            if (i >= 0) mig.jagIgen(i);
        });
        this.svgCache = {};
        this.overCelle = -1;
        this.hentStatus();
        this.startFane();
    }

    var P = SimJagt.prototype;
    F.paa(P);

    /* ----- Hukommelsen ---------------------------------------------------------
       f: de fundne navne, k: kogepunkterne er klaret i denne runde, l: jagten
       er klaret mindst én gang, s: stjerne (den bedste runde), sv og fe: Vis
       svaret og et forkert svar i denne runde, sp: spoergsmaal pr. slags. */
    P.hentStatus = function () {
        var gemt = NK.hent(NOEGLE, {}) || {};
        this.status = D.JAGTER.map(function (j) {
            var s = gemt[j.id] || {};
            var f = (s.f || []).filter(function (n, i, a) { return !!D.isomer(j, n) && a.indexOf(n) === i; });
            return { fundet: f, kog: !!s.k && f.length === j.isomerer.length, loest: !!s.l, stjerne: !!s.s, sv: !!s.sv, fe: !!s.fe, spurgt: s.sp || {} };
        });
    };

    P.gem = function () {
        var ud = {};
        this.status.forEach(function (s, i) {
            ud[D.JAGTER[i].id] = { f: s.fundet, k: s.kog ? 1 : 0, l: s.loest ? 1 : 0, s: s.stjerne ? 1 : 0, sv: s.sv ? 1 : 0, fe: s.fe ? 1 : 0, sp: s.spurgt };
        });
        NK.gem(NOEGLE, ud);
    };

    P.alleFundet = function () { return this.st.fundet.length >= this.jagt.isomerer.length; };

    P.mangler = function () {
        var f = this.st.fundet;
        return this.jagt.isomerer.filter(function (x) { return f.indexOf(x.navn) < 0; });
    };

    P.naesteUloeste = function () {
        var n = this.status.length;
        for (var d = 1; d <= n; d++) {
            var i = (this.nr + d) % n;
            if (!this.status[i].kog) return i;
        }
        return -1;
    };

    P.foersteUdenStjerne = function () {
        for (var i = 0; i < this.status.length; i++) if (!this.status[i].stjerne) return i;
        return -1;
    };

    /* ----- En jagt vaelges ------------------------------------------------------ */
    P.vaelg = function (i) {
        this.nr = i;
        this.jagt = D.JAGTER[i];
        this.st = this.status[i];
        this.hjaelp = 0;
        this.pegKnap = false;
        this.groen = null;
        this.spm = null;
        this.kog = null;
        this.sejrT = null;
        this.nyNavn = null;
        this.igenNavn = null;
        this.besked("", "");
        var b = this.braet;
        b.laast = false;
        b.hist = [];
        b.frem = [];
        this.saetter = true;
        b.nulstil(true, true);
        this.saetter = false;
        this.bygVaerktoej();
        this.vaelgVaerktoej("tegn");
        if (this.st.kog) {
            this.fase = "kog";
            this.kog = { navne: this.jagt.kog ? K.kogFacit(this.jagt, this.st.fundet) : this.jagt.isomerer.map(function (x) { return x.navn; }), orden: [], valgt: null, forkert: {}, loest: true };
            this.groen = this.slutGroen("selv", this.st.stjerne);
            b.laast = true;
        } else if (this.alleFundet()) {
            this.startKog();
            return;
        } else this.fase = "tegn";
        this.layout();
        this.visKort();
        this.visListe();
        this.visHylde();
    };

    /* Hylden toemmes, og jagten begynder forfra. Det, der er klaret foer
       (flueben og stjerne i listen), bliver staaende. */
    P.jagIgen = function (i) {
        var s = this.status[i];
        s.fundet = [];
        s.kog = false;
        s.sv = false;
        s.fe = false;
        s.spurgt = {};
        this.gem();
        this.vaelg(i);
    };

    /* ----- Vaerktoejerne -------------------------------------------------------- */
    P.bygVaerktoej = function () {
        var ilt = D.antal(this.jagt).O > 0, dbl = !!this.jagt.dobbelt, html = "";
        this.vaerktoejer = D.VAERKTOEJ.filter(function (v) { return (!v.ilt || ilt) && (!v.dobbelt || dbl); });
        this.braet.r.dobbelt = dbl;
        this.braet.r.enDobbelt = true;
        this.vaerktoejer.forEach(function (v) {
            html += '<button type="button" class="vtknap" data-vt="' + v.id + '" title="' + NK.html(v.titel) + '">' + NK.html(v.tekst) + "</button>";
        });
        NK.saetHTML("j-vt", html);
        this.visVaerktoej();
    };

    P.vaelgVaerktoej = function (id) {
        if (this.groen || this.fase !== "tegn") { this.kortBlink(); return; }
        if (id !== "slet" && !this.vaerktoejer.some(function (v) { return v.id === id; })) id = "tegn";
        this.braet.vaerktoej = id;
        this.braet.grundstof = "C";
        this.visVaerktoej();
    };

    P.visVaerktoej = function () {
        var nu = this.braet.vaerktoej;
        Array.prototype.forEach.call(this.vaerktoejEl.querySelectorAll("[data-vt]"), function (k) {
            k.classList.toggle("aktiv", k.getAttribute("data-vt") === nu);
        });
        this.vaerktoejEl.classList.toggle("laast", !!this.groen || this.fase !== "tegn");
    };

    /* C → O: carbonatomet bliver til et oxygenatom, og et oxygenatom bliver
       til carbon igen. Oxygen har kun to bindinger, og to oxygenatomer maa
       ikke sidde sammen (et peroxid er ikke en isomer i kemi B). */
    P.skiftO = function (a) {
        var b = this.braet, mol = b.mol;
        if (a.el === "O") { b.skiftGrundstof(a, "C"); return; }
        if (a.el !== "C") { b.toast("Klik på et carbonatom."); return; }
        if (mol.bindingssum(a.id) > 2) { b.toast("Et oxygenatom kan kun have to bindinger. Klik på et C med højst to naboer."); return; }
        if (mol.naboer(a.id).some(function (x) { return mol.atom(x).el === "O"; })) { b.toast("To oxygenatomer må ikke sidde sammen her."); return; }
        b.skiftGrundstof(a, "O");
    };

    P.slet = function (u) {
        var b = this.braet;
        if (!u || u.slags !== "atom") { b.toast("Klik på et atom for enden af kæden."); return; }
        if (b.antal() <= 1) { b.toast("Startatomet bliver stående. Vælg Kæde for at tegne."); return; }
        if (b.sletAtom(u.atom) && b.antal() <= 1) this.vaelgVaerktoej("tegn");
    };

    P.fortryd = function () {
        if (this.groen || this.fase !== "tegn") { this.kortBlink(); return; }
        if (!this.braet.fortryd()) this.kortBesked("Der er ikke mere at fortryde.", 3);
    };

    /* Ryd tavlen (ogsaa tasten R): kun startatomet bliver. Fortryd faar tegningen tilbage. */
    P.nulstil = function () {
        if (this.groen || this.fase !== "tegn") { this.kortBlink(); return; }
        this.braet.nulstil(true);
        this.vaelgVaerktoej("tegn");
        this.besked("", "");
    };

    P.aendret = function (hvad) {
        if (this.saetter) return;
        var b = this.braet;
        if ((hvad === "atom" || hvad === "grundstof") && /^(gruppe:|skiftO)/.test(b.vaerktoej)) b.vaerktoej = "tegn";
        this.visVaerktoej();
        if (hvad === "vaerktoej" || hvad === "valg") return;
        this.visIndsend();
    };

    /* ----- Kortet ------------------------------------------------------------------ */
    P.kortData = function () {
        var j = this.jagt;
        if (this.fase === "spm") {
            var s = this.spm;
            return {
                slags: "spm", chip: "Ny isomer",
                tekst: D.stor(s.ny) + " er ny. Hvilken slags isomerer er " + s.ny + " og " + s.partner + "?",
                svar: D.SLAGS.map(function (x) { return { t: x.t, valgt: s.valgt === x.id, forkert: !!s.forkert[x.id] }; })
            };
        }
        if (this.fase === "kog") {
            var n = j.isomerer.length;
            return {
                slags: "spm", chip: "Kogepunkter",
                tekst: j.kog === "raekke" ?
                    "Alle " + K.tal(n) + " isomerer er fundet. Klik på dem på tavlen fra højeste til laveste kogepunkt, og tryk Indsend svar." :
                    "Alle " + K.tal(n) + " isomerer er fundet. Hvilken har det højeste kogepunkt? Klik på den på tavlen, og tryk Indsend svar."
            };
        }
        return { slags: "opgave", chip: "Jagt " + (this.nr + 1) + " af " + D.JAGTER.length + " · " + j.niv, tekst: j.tekst, maal: this.maalHTML() };
    };

    P.hintNu = function () {
        if (this.groen) return [];
        if (this.fase === "spm") return [K.SPM_HINT, K.relHint(this.spm.ny, this.spm.partner)];
        if (this.fase === "kog") return this.jagt.kogHint;
        var m = this.mangler();
        return m.length ? [this.jagt.strategi, m[0].mangler] : [];
    };

    P.kanSendes = function () {
        if (this.groen) return false;
        if (this.fase === "spm") return !!this.spm.valgt;
        if (this.fase === "kog") {
            return this.jagt.kog === "raekke" ? this.kog.orden.length === this.kog.navne.length : this.kog.valgt !== null;
        }
        var mol = this.braet.mol;
        return mol.atomer.length > 1 || mol.bindinger.length > 0;
    };

    P.indsendTekst = function () {
        if (this.fase === "tegn" && this.kanSendes()) return "Indsend svar: " + K.formelTekst(K.optael(this.braet.mol));
        return "Indsend svar";
    };

    P.ingentingTekst = function () {
        if (this.fase === "spm") return "Vælg et af de tre svar på kortet først.";
        if (this.fase === "kog") return this.jagt.kog === "raekke" ? "Klik på alle isomererne på tavlen først, i rækkefølge." : "Klik på en af isomererne på tavlen først.";
        return "Tegn et molekyle først. Træk fra carbonatomet, så vokser kæden.";
    };

    P.svarValg = function (j) {
        if (this.fase !== "spm") return;
        this.spm.valgt = D.SLAGS[j].id;
        this.visKort();
    };

    P.indsend = function () {
        if (this.fase === "spm") this.indsendSpm();
        else if (this.fase === "kog") this.indsendKog();
        else this.indsendTegning();
    };

    /* ----- Fase 1: tegningen ---------------------------------------------------------- */
    P.indsendTegning = function () {
        var mol = this.braet.mol, j = this.jagt;
        this.igenNavn = null;
        if (mol.fragmenter().length !== 1) { this.fejlLinje("Alle atomer skal hænge sammen i ét molekyle."); return; }
        var ff = K.formelFejl(j, K.optael(mol));
        if (ff) { this.fejlLinje(ff, "Forkert formel"); this.visHylde(); return; }
        var x = K.tegning(mol), navn = x.navn;
        if (!navn) { this.fejlLinje("Tavlen kan ikke give tegningen et navn. Tegn den igen."); return; }
        if (j.kun && x.klasse !== j.kun) { this.fejlLinje(K.kunAlkohol(navn), "Ether"); this.visHylde(); return; }
        if (this.st.fundet.indexOf(navn) >= 0) { this.samme(navn, x.stereoNavn !== navn ? x.stereoNavn : null); return; }
        if (!D.isomer(j, navn)) { this.fejlLinje("Tavlen kalder tegningen " + navn + ", men den hører ikke med i jagten."); return; }
        this.nyFundet(navn, false);
    };

    /* Det samme stof tegnet to gange: ingen straf, men kortet paa hylden ryster */
    P.samme = function (navn, stereoNavn) {
        this.igenNavn = navn;
        this.besked('<span class="b-maerke">Samme stof</span> ' + NK.html(stereoNavn ? K.sammeStereo(navn, stereoNavn) : K.sammeTekst(navn)), "gul");
        this.pegKnap = false;
        this.visKnap();
        this.ryst();
        this.visHylde();
    };

    P.nyFundet = function (navn, svar) {
        var st = this.st, j = this.jagt;
        st.fundet.push(navn);
        this.nyNavn = navn;
        this.igenNavn = null;
        this.sejrT = 0;
        this.hjaelp = 0;
        this.pegKnap = false;
        var alle = this.alleFundet();
        var p = st.fundet.length > 1 ? K.partner(navn, st.fundet, st.spurgt) : null;
        if (p) {
            st.spurgt[p.rel] = (st.spurgt[p.rel] || 0) + 1;
            this.fase = "spm";
            this.spm = { ny: navn, partner: p.navn, rel: p.rel, valgt: null, forkert: {} };
            this.besked("", "");
            this.braet.laast = true;
        } else if (alle && !j.kog) {
            this.gem();
            this.afslut(svar ? "svar" : "selv", j.isomerer.map(function (x) { return x.navn; }));
            return;
        } else if (alle) {
            this.besked("", "");
            this.groen = {
                maade: svar ? "svar" : "selv", chip: svar ? "Svaret" : "Ny isomer ✓", fed: D.stor(navn) + ".",
                tekst: "Alle " + K.tal(j.isomerer.length) + " isomerer med " + D.formelVist(j) + " er fundet. Nu skal du se på kogepunkterne.",
                knap: "Videre til kogepunkterne →", til: "kog"
            };
            this.braet.laast = true;
        } else if (svar) {
            this.besked('<span class="b-maerke">Svaret</span> ' + NK.html(D.stor(navn) + " står nu på hylden. Find den næste isomer."), "hint");
        } else {
            this.godLinje(D.stor(navn) + " står nu på hylden. Find den næste isomer.");
        }
        this.gem();
        this.layout();
        this.visKort();
        this.visHylde();
        this.visListe();
    };

    /* ----- Fase 2: hvilken slags isomerer? ------------------------------------------- */
    P.indsendSpm = function () {
        var s = this.spm;
        if (s.valgt === s.rel) { this.spmRigtigt("selv"); return; }
        var v = s.valgt;
        s.forkert[v] = true;
        s.valgt = null;
        this.st.fe = true;
        this.gem();
        this.visKort();
        this.fejlLinje(K.relFejl(s.ny, s.partner, v));
    };

    P.spmRigtigt = function (maade) {
        var s = this.spm, alle = this.alleFundet();
        var slags = D.SLAGS.filter(function (x) { return x.id === s.rel; })[0].t;
        this.hjaelp = 0;
        this.pegKnap = false;
        this.besked("", "");
        var kog = !!this.jagt.kog;
        this.groen = {
            maade: maade, fed: slags + ".", tekst: K.relForklaring(s.ny, s.partner),
            knap: !alle ? "Find den næste isomer →" : (kog ? "Videre til kogepunkterne →" : "Afslut jagten →"),
            til: !alle ? "naeste" : (kog ? "kog" : "klaret")
        };
        this.visKort();
        this.visHylde();
    };

    /* ----- Fase 3: kogepunkterne -------------------------------------------------------
       Isomererne staar paa whiteboardet i en blandet raekkefoelge, der aldrig
       er facit. */
    P.kogNavne = function () {
        var j = this.jagt, navne = j.isomerer.map(function (x) { return x.navn; });
        var facit = K.kogFacit(j, navne);
        /* Fast blanding pr. jagt: bogstaverne i navnene bestemmer raekkefoelgen */
        var b = navne.slice().sort(function (x, y) { return hash(x + j.id) - hash(y + j.id); });
        if (b.join() === facit.join()) b.push(b.shift());
        return b;
    };

    function hash(s) {
        var h = 7;
        for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 100003;
        return h;
    }

    P.startKog = function () {
        this.fase = "kog";
        this.spm = null;
        this.groen = null;
        this.kog = { navne: this.kogNavne(), orden: [], valgt: null, forkert: {}, loest: false };
        this.braet.laast = true;
        this.hjaelp = 0;
        this.pegKnap = false;
        this.besked("", "");
        this.layout();
        this.visKort();
        this.visHylde();
        this.visListe();
    };

    P.kogKlik = function (i) {
        if (i < 0) return;
        var k = this.kog;
        if (this.jagt.kog === "raekke") {
            var p = k.orden.indexOf(i);
            if (p >= 0) k.orden.splice(p, 1); else k.orden.push(i);
        } else {
            if (k.forkert[i]) { this.kortBesked(D.stor(k.navne[i]) + " er allerede prøvet. Vælg en anden.", 3); return; }
            k.valgt = k.valgt === i ? null : i;
        }
        this.visKnap();
    };

    P.indsendKog = function () {
        var k = this.kog, j = this.jagt, facit = K.kogFacit(j, k.navne);
        if (j.kog === "raekke") {
            var sendt = k.orden.map(function (i) { return k.navne[i]; }), fejl = null;
            for (var i = 0; i < sendt.length && !fejl; i++) if (sendt[i] !== facit[i]) fejl = K.kogFejl(j, facit[i], sendt[i]);
            if (!fejl) { this.kogRigtigt("selv"); return; }
            k.orden = [];
            this.st.fe = true;
            this.gem();
            this.visKort();
            this.fejlLinje(fejl);
            return;
        }
        var S = k.navne[k.valgt];
        if (S === facit[0]) { this.kogRigtigt("selv"); return; }
        k.forkert[k.valgt] = true;
        k.valgt = null;
        this.st.fe = true;
        this.gem();
        this.visKort();
        this.fejlLinje(K.hoejestFejl(j, S));
    };

    P.kogRigtigt = function (maade) {
        if (maade === "svar") this.st.sv = true;
        /* Isomererne stilles op fra hoejeste til laveste kogepunkt */
        this.afslut(maade, K.kogFacit(this.jagt, this.kog.navne));
    };

    /* Jagten er klaret: isomererne staar paa whiteboardet i raekkefoelgen navne
       (efter kogepunkt, eller som i data, naar jagten ikke har kogepunkter) */
    P.afslut = function (maade, navne) {
        var st = this.st;
        this.fase = "kog";
        this.spm = null;
        this.kog = { navne: navne, orden: [], valgt: null, forkert: {}, loest: true };
        this.braet.laast = true;
        var stjerne = !st.sv && !st.fe;
        st.kog = true;
        st.loest = true;
        st.stjerne = st.stjerne || stjerne;
        this.gem();
        this.hjaelp = 0;
        this.pegKnap = false;
        this.besked("", "");
        this.groen = this.slutGroen(maade, stjerne);
        this.layout();
        this.visKort();
        this.visListe();
        this.visHylde();
        NK.konfetti(this.el.skort, stjerne ? 64 : 36);
    };

    P.slutGroen = function (maade, stjerne) {
        var n = this.naesteUloeste();
        return {
            maade: maade, chip: maade === "svar" ? "Svaret" : (stjerne ? "Jagten er klaret ★" : "Jagten er klaret ✓"),
            tekst: D.kogTekst(this.jagt),
            knap: n >= 0 ? "Næste jagt: " + D.formelVist(D.JAGTER[n]) + " →" : "Se din medalje →",
            til: n >= 0 ? "jagt" : "medalje"
        };
    };

    /* ----- Hjaelpeknappens sidste trin: Vis svaret --------------------------------------- */
    P.visSvar = function () {
        var st = this.st;
        st.sv = true;
        this.gem();
        if (this.fase === "spm") { this.spm.valgt = this.spm.rel; this.spmRigtigt("svar"); return; }
        if (this.fase === "kog") { this.kogRigtigt("svar"); return; }
        var m = this.mangler()[0];
        if (!m) return;
        /* Isomeren tegnes paa tavlen (Fortryd faar elevens tegning tilbage) */
        this.saetter = true;
        this.braet.saet(K.isomer(m.navn).mol.kopi());
        this.saetter = false;
        this.nyFundet(m.navn, true);
    };

    /* ----- Det groenne korts knap -------------------------------------------------------- */
    P.videre = function () {
        var til = this.groen.til;
        if (til === "medalje") { this.visSejr(); return; }
        this.groen = null;
        if (til === "naeste") {
            this.fase = "tegn";
            this.spm = null;
            this.braet.laast = false;
            this.besked("", "");
            this.nulstilHjaelp();
            this.layout();
            this.visKort();
            this.visHylde();
            return;
        }
        if (til === "kog") { this.startKog(); return; }
        if (til === "klaret") { this.afslut(this.st.sv ? "svar" : "selv", this.jagt.isomerer.map(function (x) { return x.navn; })); return; }
        var n = this.naesteUloeste();
        this.vaelg(n >= 0 ? n : (this.nr + 1) % D.JAGTER.length);
    };

    /* ----- Sejren: alle fem jagter er klaret ------------------------------------------- */
    P.antalStjerner = function () { return this.status.filter(function (s) { return s.stjerne; }).length; };

    P.visSejr = function () {
        var N = D.JAGTER.length, stj = this.antalStjerner(), m = D.MEDALJE(stj, N);
        var ialt = D.JAGTER.reduce(function (sum, j) { return sum + j.isomerer.length; }, 0);
        this.sejrEl.className = "sejr " + m.id;
        NK.saetHTML("j-medalje", medaljeSVG(m.id, stj, N));
        NK.saetTekst("j-sejr-tekst", "Du har fundet alle " + ialt + " isomerer i de " + K.tal(N) + " jagter og sat kogepunkterne på plads.");
        NK.saetHTML("j-sejr-medalje", "<b>" + NK.html(m.navn) + ":</b> " + NK.html(m.tekst));
        NK.saetTekst("j-sejr-maal", m.id === "guld" ? "Højere kommer man ikke." : "Tag jagterne uden stjerne igen, og gå efter guld.");
        NK.el("j-sejr-igen").hidden = m.id === "guld";
        this.sejrEl.hidden = false;
        NK.konfettiRegn(this.sejrEl, m.id === "guld" ? 160 : 110);
    };

    P.lukSejr = function () { this.sejrEl.hidden = true; };

    var MEDALJEFARVE = {
        guld: ["#fff3b0", "#f2c53d", "#a67c00"],
        soelv: ["#ffffff", "#c9d1da", "#7d8794"],
        bronze: ["#ffd9b0", "#cd7f32", "#7a4515"]
    };

    function medaljeSVG(id, stj, N) {
        var f = MEDALJEFARVE[id];
        return '<svg viewBox="0 0 120 150" aria-hidden="true">' +
            '<defs><radialGradient id="mg-' + id + '" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="' + f[0] + '"/>' +
            '<stop offset="0.55" stop-color="' + f[1] + '"/><stop offset="1" stop-color="' + f[2] + '"/></radialGradient></defs>' +
            '<path d="M34 0 L58 0 L70 52 L48 58 Z" fill="#3d9ee0"/><path d="M86 0 L62 0 L50 52 L72 58 Z" fill="#e05446"/>' +
            '<circle cx="60" cy="96" r="46" fill="url(#mg-' + id + ')" stroke="' + f[2] + '" stroke-width="3"/>' +
            '<circle cx="60" cy="96" r="36" fill="none" stroke="' + f[0] + '" stroke-opacity="0.7" stroke-width="2"/>' +
            '<text x="60" y="94" text-anchor="middle" font-size="30" font-weight="800" fill="' + f[2] + '">★</text>' +
            '<text x="60" y="122" text-anchor="middle" font-size="17" font-weight="800" fill="' + f[2] + '">' + stj + "/" + N + "</text></svg>";
    }

    /* ----- Panelet: jagterne og hylden ----------------------------------------------- */
    P.visListe = function () {
        var mig = this, html = "";
        D.JAGTER.forEach(function (j, i) {
            var s = mig.status[i], n = j.isomerer.length;
            var maerke = s.stjerne ? "★" : (s.loest ? "✓" : "");
            html += '<button type="button" class="jagtlinje' + (i === mig.nr ? " valgt" : "") + (s.loest ? " loest" : "") + '" data-jagt="' + i + '" title="' + NK.html(j.titel + " (" + j.niv + ")") + '">' +
                '<span class="jl-nr">' + (i + 1) + "</span>" +
                '<span class="jl-formel">' + D.formelHTML(j) + (maerke ? ' <span class="jl-maerke">' + maerke + "</span>" : "") + "</span>" +
                '<span class="jl-bund"><span class="jl-navn niv-' + NK.html(j.niv.toLowerCase().replace("æ", "ae")) + '">' + NK.html(j.niv) + "</span>" +
                '<span class="jl-tal">' + s.fundet.length + "/" + n + "</span></span></button>";
        });
        NK.saetHTML("j-jagtliste", html);
        NK.saetTekst("j-klaret", String(this.status.filter(function (s) { return s.loest; }).length));
        NK.saetTekst("j-ialt", String(D.JAGTER.length));
    };

    /* Den gule ramme paa kortet: den molekylformel, eleven jagter, stort og
       med antallet af atomer skrevet med almindelige tal */
    P.maalHTML = function () {
        var n = D.antal(this.jagt), html = "";
        [["C", n.C], ["H", n.H], ["O", n.O]].forEach(function (x) {
            if (x[1]) html += '<i class="a-' + x[0] + '"><b>' + x[1] + "</b> " + x[0] + "</i>";
        });
        return '<div class="maal"><span class="maal-titel">Find isomerer af</span>' +
            '<span class="maal-formel">' + D.formelHTML(this.jagt) + "</span>" +
            '<span class="maal-atomer">' + html + "</span></div>";
    };

    P.svg = function (navn) {
        if (!this.svgCache[navn]) {
            this.svgCache[navn] = NK.Struktur.svg(K.isomer(navn).mol, { skala: 26, stil: "zigzag", farve: "#1d2433", skrift: 14, linje: 2.2 }, { pad: 7 });
        }
        return this.svgCache[navn];
    };

    /* Hylden: en gruppe for hver stofklasse i jagten med en plads til hver
       isomer. De fundne staar i den raekkefoelge, de blev fundet. */
    P.visHylde = function () {
        var mig = this, j = this.jagt, st = this.st, html = "";
        var klasser = ["alkan", "alken", "alkohol", "ether"];
        var sammen = this.fase === "spm" && this.spm ? [this.spm.ny, this.spm.partner] : [];
        klasser.forEach(function (kl) {
            var alle = j.isomerer.filter(function (x) { return K.isomer(x.navn).klasse === kl; });
            if (!alle.length) return;
            var fundne = st.fundet.filter(function (n) { return K.isomer(n).klasse === kl; });
            html += '<div class="hylde"><div class="hylde-hoved">' + NK.html(D.KLASSER[kl].navn) +
                ' <span>' + fundne.length + " af " + alle.length + "</span></div><div class=\"hylde-pladser" + (j.isomerer.length > 8 ? " tre" : "") + "\">";
            fundne.forEach(function (n) {
                var iso = D.isomer(j, n);
                var kl2 = "hk" + (n === mig.nyNavn ? " ny" : "") + (n === mig.igenNavn ? " igen" : "") + (sammen.indexOf(n) >= 0 ? " sammen" : "");
                html += '<div class="' + kl2 + '" data-navn="' + NK.html(n) + '"><div class="hk-tegning">' + mig.svg(n) + "</div>" +
                    '<div class="hk-navn">' + D.navnHTML(n) + "</div>" +
                    (st.kog && j.kog ? '<div class="hk-kp">' + D.kpTekst(iso.kp) + "</div>" : "") + "</div>";
            });
            for (var i = fundne.length; i < alle.length; i++) html += '<div class="hk tom"><span>?</span></div>';
            html += "</div></div>";
        });
        NK.saetHTML("j-hylder", html);
        NK.saetHTML("j-hyldetal", D.formelHTML(j) + " · " + st.fundet.length + " af " + j.isomerer.length + " fundet");
        NK.el("j-igen").hidden = st.fundet.length === 0;
        /* Den nye og den, der blev tegnet igen, skal kunne ses i panelet */
        var fokus = NK.el("j-hylder").querySelector(".hk.igen, .hk.ny");
        if (fokus && fokus.scrollIntoView) fokus.scrollIntoView({ block: "nearest" });
        this.nyNavn = null;
    };

    /* ----- Layout --------------------------------------------------------------------- */
    P.layout = function () {
        this.lay = this.tavleLayout();
        var t = this.lay.tavle, e = this.vaerktoejEl;
        e.style.left = (t.x + 10) + "px";
        e.style.top = (t.y + 8) + "px";
        e.style.width = (t.b - 20) + "px";
        e.hidden = this.fase !== "tegn";
        this.visVaerktoej();
        this.saetAnker("tavle", t.x, t.y + (this.fase === "tegn" ? 54 : 0), t.b, t.h - (this.fase === "tegn" ? 66 : 0));
        this.celler = this.lavCeller();
    };

    /* Der tegnes under vaerktoejslinjen */
    P.felt = function () {
        var t = this.lay ? this.lay.tavle : { x: 0, y: 0, b: 700, h: 450 };
        return { x: t.x, y: t.y + 50, b: t.b, h: t.h - 50 - 14 };
    };

    P.skala = function () {
        var f = this.felt();
        return Math.round(NK.klamp(Math.min(f.b / 12, f.h / 5.6), 34, 72));
    };

    /* Kasserne paa whiteboardet: to til spoergsmaalet, én pr. isomer til
       kogepunkterne (hoejst fire i hver raekke) */
    P.lavCeller = function () {
        var t = this.lay.tavle, ud = [], navne;
        if (this.fase === "spm" && this.spm) navne = [this.spm.ny, this.spm.partner];
        else if (this.fase === "kog" && this.kog) navne = this.kog.navne;
        else return ud;
        var n = navne.length, kol = n <= 4 ? n : Math.ceil(n / (n <= 8 ? 2 : 3)), rk = Math.ceil(n / kol);
        var mx = 18, my = 16, gap = 14;
        var b = (t.b - 2 * mx - (kol - 1) * gap) / kol, h = (t.h - 2 * my - (rk - 1) * gap) / rk;
        if (n === 2) b = Math.min(b, 380);
        var bredRk = kol * b + (kol - 1) * gap;
        navne.forEach(function (navn, i) {
            var r = Math.floor(i / kol), c = i % kol;
            var iRk = Math.min(kol, n - r * kol);
            var x0 = t.x + (t.b - (iRk * b + (iRk - 1) * gap)) / 2;
            if (iRk === kol) x0 = t.x + (t.b - bredRk) / 2;
            ud.push({ x: x0 + c * (b + gap), y: t.y + my + r * (h + gap), b: b, h: h, navn: navn });
        });
        return ud;
    };

    P.celleVed = function (pt) {
        var c = this.celler || [];
        for (var i = 0; i < c.length; i++) {
            if (pt.x >= c[i].x && pt.x <= c[i].x + c[i].b && pt.y >= c[i].y && pt.y <= c[i].y + c[i].h) return i;
        }
        return -1;
    };

    /* ----- Musen ------------------------------------------------------------------------ */
    function svgMarkoer(svg, reserve) {
        return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '") 16 16, ' + reserve;
    }
    var KRYDS_STREGER = "M16 3v9M16 20v9M3 16h9M20 16h9";
    var MARKOER_KRYDS = svgMarkoer("<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'>" +
        "<path d='" + KRYDS_STREGER + "' stroke='#ffffff' stroke-width='7' stroke-linecap='round'/>" +
        "<path d='" + KRYDS_STREGER + "' stroke='#1d2433' stroke-width='3.4' stroke-linecap='round'/>" +
        "<circle cx='16' cy='16' r='3.8' fill='#2a76ac' stroke='#ffffff' stroke-width='1.8'/></svg>", "crosshair");
    var MARKOER_SLET = svgMarkoer("<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32'>" +
        "<path d='M7 7l18 18M25 7L7 25' stroke='#ffffff' stroke-width='8.5' stroke-linecap='round'/>" +
        "<path d='M7 7l18 18M25 7L7 25' stroke='#c8382b' stroke-width='4.4' stroke-linecap='round'/></svg>", "pointer");

    P.overScene = function (pt) {
        var b = this.braet;
        if (this.fase === "tegn" && !this.groen) {
            if (!pt) { b.ud(); return null; }
            b.flyt(pt);
            if (b.vaerktoej === "slet") return MARKOER_SLET;
            var m = b.markoer(pt);
            return m === "crosshair" ? MARKOER_KRYDS : m;
        }
        this.overCelle = this.fase === "kog" && !this.groen && pt ? this.celleVed(pt) : -1;
        return this.overCelle >= 0 ? "pointer" : null;
    };

    P.nedScene = function (pt, e) {
        if (this.groen || this.fase !== "tegn") return false;
        var b = this.braet;
        if (b.vaerktoej === "slet" && !(e && e.button === 2)) { this.slet(b.under(pt)); return false; }
        return b.ned(pt, e);
    };

    P.hoejreScene = function (pt, e) {
        if (this.groen || this.fase !== "tegn") return;
        this.braet.ned(pt, e);
    };

    P.flytScene = function (pt) { this.braet.flyt(pt); };
    P.opScene = function (pt) { this.braet.op(pt); };

    P.klikScene = function (pt) {
        if (this.spaer()) return;
        if (this.fase === "spm") { this.kortBlink(); return; }
        if (this.fase === "kog") this.kogKlik(this.celleVed(pt));
    };

    /* ----- Tegningen ---------------------------------------------------------------------- */
    P.opdaterScene = function () {
        /* "igen" ryster kun én gang paa hylden */
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        NK.Tavle.tegn(ctx, lay);
        if (this.fase === "tegn") this.braet.tegn(ctx, this.groen ? { udenHaandtag: true } : null);
        else this.tegnCeller(ctx);
        this.tegnSejr(ctx, lay.tavle);
    };

    P.tegnCeller = function (ctx) {
        var mig = this, j = this.jagt, spm = this.fase === "spm", k = this.kog;
        (this.celler || []).forEach(function (c, i) {
            var valgt = false, nr = 0, forkert = false, kp = null;
            if (!spm && k) {
                if (j.kog === "raekke") { nr = k.orden.indexOf(i) + 1; valgt = nr > 0; }
                else valgt = k.valgt === i;
                forkert = !!k.forkert[i];
                if (k.loest && j.kog) kp = D.isomer(j, c.navn).kp;
            }
            var hoejest = !!(k && k.loest && j.kog && K.kogFacit(j, k.navne)[0] === c.navn);
            /* Kortet: lyst, gul kant om det, der spoerges om, eller det valgte */
            ctx.save();
            NK.rundtRekt(ctx, c.x, c.y, c.b, c.h, 12);
            ctx.fillStyle = hoejest ? "#eef9f2" : (forkert ? "#fbe9e7" : (spm || valgt ? "#fff8dc" : (i === mig.overCelle && !mig.groen ? "#f1f6fb" : "#ffffff")));
            ctx.fill();
            ctx.lineWidth = spm || valgt || hoejest ? 3 : 1.5;
            ctx.strokeStyle = hoejest ? "#2b9a5f" : (forkert ? "#c8382b" : (spm || valgt ? "#e0a800" : "#c3cad4"));
            ctx.stroke();
            ctx.restore();
            /* Oeverst i kortet til spoergsmaalet: hvor stoffet kommer fra */
            var top = 0;
            if (spm) {
                NK.tekst(ctx, i === 0 ? "Ny isomer" : "Fra hylden", c.x + c.b / 2, c.y + 22, {
                    font: "700 14px 'Segoe UI', sans-serif", justering: "center", farve: "#8a6a00"
                });
                top = 26;
            }
            var navnH = 30, kpH = kp !== null ? 30 : 0;
            var kasse = { x: c.x + 8, y: c.y + 8 + top, b: c.b - 16, h: c.h - 16 - top - navnH - kpH };
            var g = F.iKasse(K.isomer(c.navn).mol, kasse, { maks: spm ? 80 : 58 });
            NK.Struktur.tegnGeo(ctx, g.geo);
            var fs = NK.passendeSkrift(ctx, c.navn, c.b - 16, 17, 11, 700);
            NK.tekst(ctx, c.navn, c.x + c.b / 2, c.y + c.h - 12 - kpH, { font: "700 " + fs + "px 'Segoe UI', sans-serif", justering: "center", farve: "#1d2433" });
            if (kp !== null) {
                NK.tekst(ctx, D.kpTekst(kp), c.x + c.b / 2, c.y + c.h - 12, {
                    font: "800 19px 'Segoe UI', sans-serif", justering: "center", farve: hoejest ? "#1c8a4e" : "#b45309"
                });
            }
            /* Nummeret i raekkefoelgen, eller et flueben for den valgte */
            if (valgt && !k.loest) {
                var px = c.x + 20, py = c.y + 20;
                ctx.save();
                ctx.beginPath();
                ctx.arc(px, py, 15, 0, Math.PI * 2);
                ctx.fillStyle = "#e0a800";
                ctx.fill();
                ctx.restore();
                NK.tekst(ctx, nr ? String(nr) : "✓", px, py + 1, { font: "800 17px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#ffffff" });
            }
            if (forkert) {
                NK.tekst(ctx, "✕", c.x + c.b - 20, c.y + 22, { font: "800 20px 'Segoe UI', sans-serif", justering: "center", farve: "#c8382b" });
            }
        });
    };

    NK.SimJagt = SimJagt;
}());
