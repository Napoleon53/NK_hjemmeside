/* =====================================================================
   sim_byg.js - fane 1: Byg et atom

   Her er der ingen skyder, der vaelger et grundstof for eleven. Man
   laegger partiklerne i én ad gangen, og hver gang faar man at vide,
   hvad der SKETE - for det er hele pointen:

     protoner   bestemmer, HVILKET grundstof det er
     neutroner  bestemmer, HVILKEN isotop det er
     elektroner bestemmer, HVILKEN ladning det har

   Det er derfor isotopbegrebet kan opdages her: man kan bygge to
   kerner af samme grundstof, som ikke vejer det samme.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    var MAKS_P = D.MAKS_Z;      /* skalmodellen holder til og med calcium */
    var MAKS_N = 28;            /* nok til calcium-48 */
    var MAKS_E = D.MAKS_Z;

    NK.SimByg = function () {
        this.l = new NK.Laerred(NK.el("byg-laerred"));
        this.atom = new NK.Atom();
        this.p = 1; this.n = 0; this.e = 1;
        this.opgave = null;
        this.rigtige = 0;       /* selv-loeste opgaver i denne runde - se tjekOpgave() */
        this.beskedTid = 0;
        this.atom.saetStraks(this.p, this.n, this.e);

        this.slut = null;       /* loest opgave: kortet bliver paa den, til eleven trykker Naeste */
        this.hjaelp = 0;
        this.besked = { html: "", klasse: "" };
        this.koblKnapper();
        this.opdaterPanel("start");
        this.visOpgaveStart();
    };

    /* ----- Knapper -------------------------------------------------------- */
    NK.SimByg.prototype.koblKnapper = function () {
        var mig = this;

        function bind(id, slags, retning) {
            NK.el(id).addEventListener("click", function () { if (!mig.laast()) mig.aendr(slags, retning); });
        }
        bind("byg-p-plus", "p", 1);
        bind("byg-p-minus", "p", -1);
        bind("byg-n-plus", "n", 1);
        bind("byg-n-minus", "n", -1);
        bind("byg-e-plus", "e", 1);
        bind("byg-e-minus", "e", -1);

        NK.el("byg-neutral").addEventListener("click", function () {
            if (mig.laast() || mig.e === mig.p) return;
            var forskel = mig.p - mig.e;
            mig.e = mig.p;
            mig.anvend(forskel > 0
                ? "Du fyldte " + NK.talform(forskel, "elektron", "elektroner") + " på. Nu er der lige mange protoner og elektroner — atomet er neutralt."
                : "Du fjernede " + NK.talform(-forskel, "elektron", "elektroner") + ". Nu er der lige mange protoner og elektroner — atomet er neutralt.");
        });

        NK.el("byg-almindelig").addEventListener("click", function () {
            var i = D.hyppigsteIsotop(mig.p);
            if (mig.laast() || !i) return;
            var nyN = i.a - mig.p;
            if (nyN === mig.n) return;
            mig.n = nyN;
            var g = D.grundstof(mig.p);
            mig.anvend("Nu har kernen " + nyN + " neutroner. " + g.navn + "-" + i.a
                + " er den isotop, der er mest af i naturen (" + NK.tal(i.andel, 2) + " %).");
        });

        NK.el("byg-nulstil").addEventListener("click", function () { if (!mig.laast()) { mig.ryd(); mig.roert = true; mig.visIndsend(); } });

        /* Papirkortet: hintknappen, Indsend svar og knappen, der foerer videre */
        NK.el("byg-knap").addEventListener("click", function () { mig.hintKnap(); });
        NK.el("byg-indsend").addEventListener("click", function () { mig.indsendKlik(); });
        NK.el("byg-skort").addEventListener("click", function (e) {
            if (e.target && e.target.closest && e.target.closest("[data-videre]")) mig.videre();
        });
        NK.el("byg-forfra").addEventListener("click", function () { mig.startForfra(); });

        /* Det periodiske system i panelet viser, hvor det byggede atom
           hoerer hjemme. Man kan ogsaa springe direkte til et grundstof
           ved at trykke paa det. */
        this.pertabel = new NK.PeriodiskSystem(NK.el("byg-pertabel"), {
            vedKlik: function (z) { if (!mig.laast()) mig.vaelgGrundstof(z); }
        });
    };

    /* Tom scene: ingen partikler tilbage at bygge videre paa. Bruges
       baade af Genstart og af "Ny opgave", saa man starter forfra. */
    NK.SimByg.prototype.ryd = function () {
        this.p = 0; this.n = 0; this.e = 0;
        this.atom.saet(0, 0, 0);
        this.opdaterPanel("tom");
    };

    /* Spring direkte til et grundstof: den almindelige kerne og lige
       mange protoner og elektroner. */
    NK.SimByg.prototype.vaelgGrundstof = function (z) {
        var g = D.grundstof(z);
        var iso = D.hyppigsteIsotop(z);
        if (!g || (this.p === z && this.n === iso.a - z && this.e === z)) return;
        this.p = z;
        this.n = iso.a - z;
        this.e = z;
        this.anvend("Du sprang til " + g.navn.toLowerCase() + ": " + NK.talform(z, "proton", "protoner")
            + " i kernen, og lige så mange elektroner, så atomet er neutralt.");
    };

    /* ----- Aendring af ét tal ---------------------------------------------- */
    NK.SimByg.prototype.aendr = function (slags, retning) {
        var foerP = this.p;
        var besked = "";

        if (slags === "p") {
            var nyP = NK.klamp(this.p + retning, 0, MAKS_P);
            if (nyP === this.p) {
                besked = retning > 0
                    ? "Her stopper vi ved calcium (20 protoner) — længere rækker den simple skalmodel ikke."
                    : "Der er ingen protoner tilbage at fjerne.";
                this.visBesked(besked, "advarsel");
                return;
            }
            this.p = nyP;
            besked = this.protonBesked(foerP, nyP);
        } else if (slags === "n") {
            var nyN = NK.klamp(this.n + retning, 0, MAKS_N);
            if (nyN === this.n) { this.visBesked("Flere neutroner giver ikke mening her.", "advarsel"); return; }
            this.n = nyN;
            besked = this.neutronBesked();
        } else {
            var nyE = NK.klamp(this.e + retning, 0, MAKS_E);
            if (nyE === this.e) {
                this.visBesked(retning > 0
                    ? "Der er ikke plads til flere elektroner i de fire skaller."
                    : "Der er ingen elektroner tilbage at fjerne.", "advarsel");
                return;
            }
            this.e = nyE;
            besked = this.elektronBesked(retning);
        }
        this.anvend(besked, slags);
    };

    NK.SimByg.prototype.anvend = function (besked, slags) {
        this.atom.saet(this.p, this.n, this.e);
        this.opdaterPanel(slags);
        this.visBesked(besked, "");
        this.roert = true;
        if (this.besked && this.besked.klasse === "skidt") { this.saetBesked("", ""); this.visKort(); }
        this.visIndsend();
    };

    /* ----- Beskederne: hvad skete der, og hvorfor betyder det noget? ------- */
    NK.SimByg.prototype.protonBesked = function (foer, nu) {
        var gammel = D.grundstof(foer);
        var ny = D.grundstof(nu);
        if (!ny) return "Nu er der ingen protoner tilbage. Uden protoner er der heller ikke noget grundstof.";
        if (!gammel) return "Første proton er på plads. Ét eneste proton i kernen betyder hydrogen — det simpleste grundstof, der findes.";
        return "Du ændrede protontallet fra " + foer + " til " + nu
            + ", og så er det ikke " + gammel.navn.toLowerCase() + " længere, men "
            + ny.navn.toLowerCase() + ". Protontallet ER grundstoffet.";
    };

    NK.SimByg.prototype.neutronBesked = function () {
        var g = D.grundstof(this.p);
        var a = this.p + this.n;
        if (!g) return "Neutroner alene er ikke et grundstof — der skal protoner til.";
        var k = D.kerne(this.p, this.n);
        var start = "Stadig " + g.navn.toLowerCase() + ": neutroner ændrer ikke grundstoffet, kun massen. ";
        if (k.art === "naturlig") {
            return start + "Du har bygget " + g.navn.toLowerCase() + "-" + a
                + ", som udgør " + NK.tal(k.isotop.andel, k.isotop.andel < 1 ? 4 : 2) + " % af naturens " + g.navn.toLowerCase() + ".";
        }
        if (k.art === "radioaktiv") {
            return start + "Du har bygget " + (k.isotop.navn || (g.navn.toLowerCase() + "-" + a)) + " — " + k.isotop.note + ".";
        }
        return start + g.symbol + "-" + a + " findes ikke i naturen: med "
            + this.n + " neutroner mod " + this.p + " protoner hænger kernen ikke sammen.";
    };

    NK.SimByg.prototype.elektronBesked = function (retning) {
        var g = D.grundstof(this.p);
        var q = this.p - this.e;
        var lagde = retning > 0 ? "lagde en elektron til" : "tog en elektron væk";
        if (!g) return "Du " + lagde + ". Uden protoner i kernen er der dog ikke noget at holde fast i.";
        if (q === 0) {
            return "Du " + lagde + ", og nu er der lige mange protoner og elektroner. "
                + g.navn + " er et neutralt ATOM — ladningen er 0.";
        }
        var aedel = D.aedelgasStruktur(this.e);
        var hale = aedel
            ? " Elektronerne sidder nu præcis som i " + aedel.navn.toLowerCase() + " — det er den stabile opbygning, ioner stræber efter."
            : "";
        return "Du " + lagde + ". Nu er der " + this.p + " protoner mod " + this.e
            + " elektroner, så ladningen er " + NK.ladningstekst(q) + ". Det er ikke et atom længere, men en ION." + hale;
    };

    NK.SimByg.prototype.visBesked = function (tekst, klasse) {
        if (!tekst) return;
        NK.saetTekst("byg-hint", tekst);
        NK.saetKlasse("byg-hint", "scene-mrk" + (klasse ? " " + klasse : ""));
        this.beskedTid = 0;
    };

    /* ----- Panelet --------------------------------------------------------- */
    NK.SimByg.prototype.opdaterPanel = function (slags) {
        var g = D.grundstof(this.p);
        var a = this.p + this.n;
        var q = this.p - this.e;

        NK.saetTekst("byg-p-antal", String(this.p));
        NK.saetTekst("byg-n-antal", String(this.n));
        NK.saetTekst("byg-e-antal", String(this.e));

        /* Kemikerens skrivemaade: massetal over, protontal under, ladning bagefter. */
        NK.saetTekst("byg-nuklid-sym", g ? g.symbol : "?");
        NK.saetTekst("byg-nuklid-a", this.p ? String(a) : "");
        NK.saetTekst("byg-nuklid-z", this.p ? String(this.p) : "");
        NK.saetTekst("byg-nuklid-q", q === 0 ? "" : NK.ladningstekst(q));
        NK.saetKlasse("byg-nuklid-q", q > 0 ? "q plus" : (q < 0 ? "q minus" : "q"));

        if (this.pertabel) this.pertabel.marker(g ? this.p : 0);

        /* Kernen: findes den overhovedet? Teksten staar under selve
           atommodellen i scenen - se tegn(). */
        var k = D.kerne(this.p, this.n);
        var kerneTekst, kerneKlasse;
        if (!g) { kerneTekst = "Læg en proton i for at komme i gang."; kerneKlasse = ""; }
        else if (k.art === "naturlig") {
            kerneTekst = g.symbol + "-" + a + " findes i naturen (" + NK.tal(k.isotop.andel, k.isotop.andel < 1 ? 4 : 2) + " % af alt " + g.navn.toLowerCase() + ").";
            kerneKlasse = "god";
        } else if (k.art === "radioaktiv") {
            kerneTekst = "☢ " + g.symbol + "-" + a + " findes, men er radioaktiv. Isotopen " + k.isotop.note + ".";
            kerneKlasse = "gul";
        } else {
            kerneTekst = "Der findes ingen kerne med " + this.p + " protoner og " + this.n + " neutroner. Den ville falde fra hinanden.";
            kerneKlasse = "skidt";
        }
        NK.saetTekst("byg-kerne", kerneTekst);
        NK.saetKlasse("byg-kerne", "kernekort" + (kerneKlasse ? " " + kerneKlasse : ""));

        /* Radioaktiv kerne: et blinkende maerke ved atomsymbolet, saa det
           kan ses uden at laese teksten i panelet. */
        NK.saetKlasse("byg-rad-ikon", "rad-ikon" + (g && k.art === "radioaktiv" ? " vis" : ""));

        NK.el("byg-p-minus").disabled = this.p <= 0;
        NK.el("byg-n-minus").disabled = this.n <= 0;
        NK.el("byg-e-minus").disabled = this.e <= 0;
        NK.el("byg-p-plus").disabled = this.p >= MAKS_P;
        NK.el("byg-n-plus").disabled = this.n >= MAKS_N;
        NK.el("byg-e-plus").disabled = this.e >= MAKS_E;
        NK.el("byg-neutral").disabled = (this.p === this.e) || !g;
        NK.el("byg-almindelig").disabled = !g || (D.hyppigsteIsotop(this.p).a - this.p === this.n);
    };

    /* ----- Opgaver ---------------------------------------------------------- */
    function tilfaeldig(liste) { return liste[Math.floor(Math.random() * liste.length)]; }

    function medFlereIsotoper() {
        var ud = [];
        for (var i = 0; i < D.GRUNDSTOFFER.length; i++) {
            if (D.GRUNDSTOFFER[i].isotoper.length > 1) ud.push(D.GRUNDSTOFFER[i]);
        }
        return ud;
    }

    function ionDannere() {
        var ud = [];
        for (var i = 0; i < D.GRUNDSTOFFER.length; i++) {
            var g = D.GRUNDSTOFFER[i];
            if (g.ion !== null && g.ion !== 0 && g.z > 1) ud.push(g);
        }
        return ud;
    }

    var OPGAVETYPER = [
        /* 1. Et helt almindeligt neutralt atom af en bestemt isotop. */
        function () {
            var g = tilfaeldig(D.GRUNDSTOFFER);
            var i = tilfaeldig(g.isotoper);
            return {
                tekst: "Byg et neutralt atom af " + g.navn.toLowerCase() + " (" + g.symbol + ") med nukleontal " + i.a + ".",
                p: g.z, n: i.a - g.z, e: g.z,
                svar: "Nukleontal = protoner + neutroner, så " + i.a + " − " + g.z + " = "
                    + NK.talform(i.a - g.z, "neutron", "neutroner") + ". Neutralt betyder lige mange elektroner som protoner."
            };
        },
        /* 2. En ion af et grundstof, der danner ioner. */
        function () {
            var g = tilfaeldig(ionDannere());
            var i = D.hyppigsteIsotop(g.z);
            var aedel = D.aedelgasStruktur(g.z - g.ion);
            return {
                tekst: "Byg ionen " + g.symbol + NK.ladningHaevet(g.ion) + " med "
                    + NK.talform(i.a - g.z, "neutron", "neutroner") + " i kernen.",
                p: g.z, n: i.a - g.z, e: g.z - g.ion,
                svar: "Ladningen " + NK.ladningstekst(g.ion) + " betyder " + NK.talform(Math.abs(g.ion), "elektron", "elektroner")
                    + " " + (g.ion > 0 ? "færre" : "flere") + " end protoner."
                    + (aedel ? " Elektronerne ligger nu som i " + aedel.navn.toLowerCase() + "." : "")
            };
        },
        /* 3. En isotop, der IKKE er den almindelige - kernen skal aendres. */
        function () {
            var g = tilfaeldig(medFlereIsotoper());
            var almindelig = D.hyppigsteIsotop(g.z);
            var andre = [];
            for (var i = 0; i < g.isotoper.length; i++) {
                if (g.isotoper[i].a !== almindelig.a) andre.push(g.isotoper[i]);
            }
            var valgt = tilfaeldig(andre);
            return {
                tekst: "Naturens " + g.navn.toLowerCase() + " er for det meste " + g.symbol + "-" + almindelig.a
                    + ". Byg det neutrale atom af den sjældnere isotop " + g.symbol + "-" + valgt.a + ".",
                p: g.z, n: valgt.a - g.z, e: g.z,
                svar: "Atomet har stadig " + NK.talform(g.z, "proton", "protoner") + ", for de bestemmer grundstoffet. Kun neutrontallet skifter fra "
                    + (almindelig.a - g.z) + " til " + (valgt.a - g.z) + "."
            };
        },
        /* 4. Den anden vej rundt: partiklerne er givet, navnet er opgaven. */
        function () {
            var g = tilfaeldig(D.GRUNDSTOFFER);
            var i = tilfaeldig(g.isotoper);
            var q = g.ion === null ? 0 : g.ion;
            var e = NK.klamp(g.z - q, 0, MAKS_E);
            return {
                tekst: "Byg partiklen med " + NK.talform(g.z, "proton", "protoner") + ", " + NK.talform(i.a - g.z, "neutron", "neutroner")
                    + " og " + NK.talform(e, "elektron", "elektroner") + ". Hvad er det, du har bygget?",
                p: g.z, n: i.a - g.z, e: e,
                svar: "Partiklen er " + g.symbol + NK.ladningHaevet(g.z - e) + " med nukleontal " + i.a + ", altså "
                    + g.navn.toLowerCase() + "-" + i.a + (g.z - e === 0 ? " som neutralt atom." : " som ion.")
            };
        },
        /* 5. Bagvendt: elektronstrukturen er givet, kernen skal findes. */
        function () {
            var kandidater = [];
            var liste = ionDannere();
            for (var i = 0; i < liste.length; i++) {
                if (D.aedelgasStruktur(liste[i].z - liste[i].ion)) kandidater.push(liste[i]);
            }
            var g = tilfaeldig(kandidater);
            var aedel = D.aedelgasStruktur(g.z - g.ion);
            var iso = D.hyppigsteIsotop(g.z);
            return {
                tekst: "Byg en ion med ladningen " + NK.ladningstekst(g.ion) + " og præcis samme elektronstruktur som "
                    + aedel.navn.toLowerCase() + " (" + D.skalfordeling(aedel.z).join(", ") + "). Ionen har "
                    + NK.talform(iso.a - g.z, "neutron", "neutroner") + " i kernen.",
                p: g.z, n: iso.a - g.z, e: g.z - g.ion,
                svar: "Der skal " + NK.talform(g.z - g.ion, "elektron", "elektroner") + " til for at ligne "
                    + aedel.navn.toLowerCase() + ". Med ladningen " + NK.ladningstekst(g.ion) + " har ionen "
                    + NK.talform(g.z, "proton", "protoner") + ", så grundstoffet er " + g.navn.toLowerCase() + "."
            };
        }
    ];

    /* ----- Papirkortet (6. nov. 2026) ------------------------------------------
       Opgaven staar paa ét lyst kort oeverst midt i scenen, ikke i panelet.
       Knapperne i panelet bygger kun. Bedoemmelsen sker, naar eleven trykker
       Indsend svar (graa, til atomet er aendret siden opgavens start eller
       sidste forsoeg). Giv et hint viser opgavens atomsymbol, saa kommer Vis
       svaret. Efter et rigtigt svar bliver kortet paa opgaven: forklaringen
       staar under den i en groen boks (gul, naar svaret blev vist), og Naeste
       opgave staar, hvor Indsend svar stod. Imens er knapperne laast, og et
       klik faar kortet til at blinke. Foer foerste opgave er fanen fri
       byggeleg, og kortet tilbyder kun at starte opgaverne. Start forfra
       ligger i panelet. */

    /* Maalet for runden: opgaver taeller kun med, naar de er loest selv -
       hverken forkerte forsoeg eller et vist svar rykker taelleren, men et
       hint undervejs er stadig en selv-loest opgave. */
    var MAAL_RIGTIGE = 6;

    function esc(s) {
        return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    /* Atomsymbolet som i bogen: massetal over atomnummer foran symbolet */
    function nuklidHTML(o) {
        var g = D.grundstof(o.p), q = o.p - o.e;
        return '<span class="sk-nuklid"><span class="sn-tal"><span>' + (o.p + o.n) + "</span><span>" + o.p + "</span></span>" +
            (g ? g.symbol : "?") + (q ? "<sup>" + NK.ladningstekst(q) + "</sup>" : "") + "</span>";
    }

    NK.SimByg.prototype.laast = function () {
        if (!this.slut) return false;
        this.kortBlink();
        return true;
    };

    NK.SimByg.prototype.kortBlink = function () {
        var e = NK.el("byg-skort");
        e.classList.remove("blink");
        void e.offsetWidth;
        e.classList.add("blink");
    };

    /* Den plads, der er sat af til kortet oeverst i scenen */
    NK.SimByg.prototype.kortZone = function () {
        var basis = window.innerHeight <= 720 ? 112 : 140;
        return Math.max(basis, NK.el("byg-skort").offsetHeight || 0);
    };

    /* Udgangspunktet: ingen opgave er i gang endnu - eleven bygger frit og
       beder selv om den foerste opgave. */
    NK.SimByg.prototype.visOpgaveStart = function () {
        this.opgave = null;
        this.slut = null;
        this.hjaelp = 0;
        this.saetBesked("", "");
        this.visKort();
    };

    NK.SimByg.prototype.startForfra = function () {
        this.rigtige = 0;
        this.slut = null;
        this.ryd();
        this.visOpgaveStart();
    };

    NK.SimByg.prototype.nyOpgave = function () {
        var forsoeg = 0;
        do {
            this.opgave = tilfaeldig(OPGAVETYPER)();
            forsoeg++;
        } while (forsoeg < 8 && this.opgave.p === this.p && this.opgave.n === this.n && this.opgave.e === this.e);
        this.slut = null;
        this.hjaelp = 0;
        this.pegKnap = false;
        this.roert = false;
        this.saetBesked("", "");
        this.visKort();
    };

    /* Knappen, der foerer videre: Start opgave, Naeste opgave, Videre til Spil */
    NK.SimByg.prototype.videre = function () {
        if (this.opgave && this.slut && this.rigtige >= MAAL_RIGTIGE) {
            this.rigtige = 0;
            this.visOpgaveStart();
            if (NK.visFane) NK.visFane("fane-spil");
            return;
        }
        if (this.opgave) this.ryd();
        this.nyOpgave();
    };

    NK.SimByg.prototype.videreTekst = function () {
        if (!this.opgave) return "Start opgave →";
        if (this.rigtige >= MAAL_RIGTIGE) return "Videre til Spil →";
        return "Næste opgave →";
    };

    /* Giv et hint: atomsymbolet. Naeste tryk: Vis svaret. */
    NK.SimByg.prototype.hintKnap = function () {
        if (!this.opgave || this.slut) return;
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.pegKnap = false;
            this.saetBesked('<span class="b-maerke">Hint</span> Byg ' + nuklidHTML(this.opgave) +
                ". Øverst står nukleontallet og nederst atomnummeret.", "hint");
            this.visKort();
            return;
        }
        this.visSvar();
    };

    NK.SimByg.prototype.visSvar = function () {
        if (!this.opgave) return;
        this.p = this.opgave.p; this.n = this.opgave.n; this.e = this.opgave.e;
        this.atom.saet(this.p, this.n, this.e);
        this.opdaterPanel("");
        this.slut = { vist: true, html: nuklidHTML(this.opgave) + " " + esc(this.opgave.svar) };
        this.saetBesked("", "");
        this.visKort();
    };

    NK.SimByg.prototype.kanSendes = function () {
        return !!this.opgave && !this.slut && !!this.roert;
    };

    NK.SimByg.prototype.indsendKlik = function () {
        if (!this.opgave || this.slut) { this.kortBlink(); return; }
        if (!this.kanSendes()) {
            this.kortBlink();
            this.saetBesked("Byg atomet med knapperne i panelet først.", "peger");
            return;
        }
        this.roert = false;
        this.tjekOpgave();
    };

    /* Bedoemmelsen: det byggede atom mod opgaven. Ved en fejl siger beskeden,
       hvilken slags partikel der ikke passer, uden at give tallet. */
    NK.SimByg.prototype.tjekOpgave = function () {
        var o = this.opgave;
        if (!o || this.slut) return;
        var fejl = "";
        if (o.p !== this.p) fejl = "Antallet af protoner passer ikke. Protonerne bestemmer grundstoffet.";
        else if (o.n !== this.n) fejl = "Grundstoffet passer, men antallet af neutroner passer ikke. Nukleontallet er protoner plus neutroner.";
        else if (o.e !== this.e) fejl = "Kernen passer, men antallet af elektroner passer ikke. Elektronerne bestemmer ladningen.";
        if (fejl) {
            this.pegKnap = true;
            this.saetBesked('<span class="b-maerke">Ikke endnu</span> ' + fejl, "skidt");
            this.visKort();
            return;
        }
        this.rigtige++;
        var html = nuklidHTML(o) + " " + esc(o.svar);
        if (this.rigtige >= MAAL_RIGTIGE) {
            html += " Du har løst " + MAAL_RIGTIGE + " opgaver selv, og runden er gennemført.";
            /* Peg paa fane 4, saa spillet ikke bliver overset. Blinket stopper
               selv, naar fanen aabnes (visFane() i app.js). */
            var faneSpil = NK.el("faneknap-spil");
            if (faneSpil) faneSpil.classList.add("blink-kraftigt");
        }
        this.slut = { vist: false, html: html };
        this.saetBesked("", "");
        this.visKort();
    };

    /* ----- Kortet ------------------------------------------------------------ */
    NK.SimByg.prototype.saetBesked = function (html, klasse) {
        this.besked = { html: html || "", klasse: klasse || "" };
    };

    NK.SimByg.prototype.visKort = function () {
        var e = NK.el("byg-skort"), ind = NK.el("byg-ind"), html, kl;
        if (!this.opgave) {
            kl = "scenekort opgave start";
            html = '<div class="sk-start"><p class="sk-tekst"><span class="sk-chip">Opgaver</span>' +
                (this.rigtige ? "Du har løst " + this.rigtige + " af " + MAAL_RIGTIGE + " opgaver. " : "") +
                "Byg frit med knapperne i panelet. Når du er klar, får du en opgave ad gangen.</p>" +
                '<button type="button" class="sk-videre" data-videre="1">' + this.videreTekst() + "</button></div>";
        } else {
            kl = "scenekort " + (this.slut ? "loest bliv" + (this.slut.vist ? " svar" : "") : "opgave");
            html = '<p class="sk-tekst"><span class="sk-chip">Opgave ' + Math.min(this.rigtige + (this.slut && !this.slut.vist ? 0 : 1), MAAL_RIGTIGE) +
                " af " + MAAL_RIGTIGE + "</span>" + NK.Papir.tekst(esc(this.opgave.tekst)) + "</p>";
            if (this.slut) html += NK.Papir.bliv(this.slut.html, this.slut.vist ? "Svaret" : "Rigtigt", this.videreTekst(), this.slut.vist);
        }
        if (e.className.replace(" blink", "") !== kl) e.className = kl;
        if (ind._html !== html) { ind.innerHTML = html; ind._html = html; }

        /* Kortets nederste raekke: beskeden, Giv et hint og Indsend svar */
        var status = NK.el("byg-status"), besked = NK.el("byg-besked"), knap = NK.el("byg-knap");
        var aktiv = !!this.opgave && !this.slut;
        status.hidden = !aktiv;
        besked.hidden = !this.besked.html;
        if (besked._html !== this.besked.html) { besked.innerHTML = this.besked.html; besked._html = this.besked.html; }
        status.className = "sk-bund" + (this.besked.klasse ? " " + this.besked.klasse : "") + (this.besked.html ? "" : " tom");
        knap.textContent = this.hjaelp === 0 ? "Giv et hint" : "Vis svaret";
        knap.className = "knap hjaelp" + (this.hjaelp > 0 ? " svar" : "") + (this.pegKnap ? " peg" : "");
        this.visIndsend();

        NK.saetTekst("byg-opgave-taeller", this.rigtige + "/" + MAAL_RIGTIGE);
    };

    NK.SimByg.prototype.visIndsend = function () {
        var k = NK.el("byg-indsend"), kan = this.kanSendes();
        k.classList.toggle("klar", kan);
        k.classList.toggle("ikke-klar", !kan);
        k.setAttribute("aria-disabled", kan ? "false" : "true");
    };

    /* Tekst til selvtesten */
    NK.SimByg.prototype.kortTekst = function () { return NK.el("byg-skort").textContent; };

    /* ----- Tegning ---------------------------------------------------------- */
    NK.SimByg.prototype.tilpas = function () { this.l.tilpas(); };

    /* Hvor atomet skal staa: midt i scenen, som nu er atommodellens
       alene - det periodiske system staar i panelet til hoejre.

       Pladsen findes ved at LOESE uligheden for den stoerste radius, der
       stadig levner plads til nuklidmaerkat foroven og kernetekst
       forneden - ikke ved at proeve sig frem i et hak-for-hak loekke.
       Enten findes loesningen, eller ogsaa er der bevisligt ikke plads.

       Bemaerk, at pladsen er den samme for alle grundstoffer. Hvor stort
       atomet SELV tegnes inden for den plads, afhaenger af, hvor mange
       skaller der er i brug - se tilpasSkaller i atom.js. */
    var YDRE_ANDEL = 0.93;      /* yderste skals radius i forhold til plads, fire skaller */
    var NUKLID_H = 78, LUFT = 10;
    var KERNE_H = 74;           /* svarer til loftet i tegn(): 74 px over scenens bund */
    var MIN_PLADS = 55;         /* absolut bund paa en meget lille scene */
    var SIDE_LUFT = 12;         /* luft mellem atomet og scenens sidekant */

    NK.SimByg.prototype.placering = function () {
        var l = this.l;
        var zone = this.kortZone ? this.kortZone() : 0;
        var noegle = l.b + "x" + l.h + "x" + zone;
        if (this.stedNoegle === noegle) return this.sted;
        this.stedNoegle = noegle;

        var normalPlads = NK.klamp(Math.min(l.b * 0.33, l.h * 0.45), 70, 380);
        var top = zone ? 10 + zone : 0;
        var R = Math.min(normalPlads * YDRE_ANDEL,
            (l.h - top - LUFT - NUKLID_H - KERNE_H - 30) / 2,
            l.b / 2 - SIDE_LUFT);
        R = Math.max(R, MIN_PLADS * YDRE_ANDEL);

        var cyMin = top + LUFT + NUKLID_H + 14 + R;
        var cyMax = l.h - R - 16 - KERNE_H;
        var cy = NK.klamp(l.h * 0.54, cyMin, Math.max(cyMin, cyMax));

        this.sted = { plads: R / YDRE_ANDEL, cy: cy, cx: l.b / 2 };
        return this.sted;
    };

    NK.SimByg.prototype.opdater = function (dt) {
        this.atom.opdater(dt);
        this.beskedTid += dt;
    };

    NK.SimByg.prototype.nulstil = function () {
        if (this.laast()) return;
        this.roert = true;
        this.p = 1; this.n = 0; this.e = 1;
        this.atom.saet(1, 0, 1);
        this.opdaterPanel("start");
        this.visBesked("Tilbage til det simpleste atom: ét proton og én elektron — hydrogen.", "");
    };

    NK.SimByg.prototype.tegn = function () {
        var l = this.l, c = l.ctx;
        l.ryd("#14141a");

        var sted = this.placering();
        var cx = sted.cx;
        var cy = sted.cy;
        var plads = sted.plads;
        var nuklidBoks = NK.el("byg-nuklid");
        var kerneBoks = NK.el("byg-kerne");

        if (this.p === 0 && this.n === 0 && this.e === 0) {
            nuklidBoks.style.display = "none";
            kerneBoks.style.display = "none";
            c.save();
            c.setLineDash([7, 7]);
            c.strokeStyle = "rgba(160, 190, 220, 0.25)";
            c.lineWidth = 1.5;
            c.beginPath();
            c.arc(cx, cy, plads * 0.45, 0, Math.PI * 2);
            c.stroke();
            c.restore();
            NK.tekst(c, "Tomt rum", cx, cy - 8, {
                font: "600 15px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#7e8590"
            });
            NK.tekst(c, "Læg den første proton i", cx, cy + 14, {
                font: "400 13px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#5f656e"
            });
            return;
        }

        this.atom.tegn(c, cx, cy, plads, {
            fremhaevValens: true,
            ladning: this.p - this.e,
            tilpasSkaller: true
        });
        NK.tegnSkaltal(c, this.atom);

        /* Nuklidmaerkatet (massetal, atomnummer, symbol, ladning) svaever
           lige over atomet i stedet for at ligge fast i et hjoerne - saa
           det altid peger paa netop det atom, der er tegnet. */
        var geo = this.atom.sidsteGeo;
        var yderste = this.atom.fordeling.length - 1;
        var ydreR = geo.geo.rSkal[Math.max(0, yderste)] * geo.s;
        nuklidBoks.style.display = "";
        nuklidBoks.style.left = cx + "px";
        nuklidBoks.style.top = (cy - ydreR - 14) + "px";

        /* Og svaret om kernen lige under atomet - dog aldrig saa langt
           nede, at det falder ud af scenen paa en lav skaerm. */
        kerneBoks.style.display = "";
        kerneBoks.style.left = cx + "px";
        kerneBoks.style.top = Math.min(cy + ydreR + 16, l.h - 74) + "px";
    };
}());
