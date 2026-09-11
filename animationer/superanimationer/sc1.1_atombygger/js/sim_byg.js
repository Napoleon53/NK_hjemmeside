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
        this.loeste = 0;
        this.beskedTid = 0;
        this.atom.saetStraks(this.p, this.n, this.e);

        this.koblKnapper();
        this.opdaterPanel("start");
        this.visOpgaveStart();
    };

    /* ----- Knapper -------------------------------------------------------- */
    NK.SimByg.prototype.koblKnapper = function () {
        var mig = this;

        function bind(id, slags, retning) {
            NK.el(id).addEventListener("click", function () { mig.aendr(slags, retning); });
        }
        bind("byg-p-plus", "p", 1);
        bind("byg-p-minus", "p", -1);
        bind("byg-n-plus", "n", 1);
        bind("byg-n-minus", "n", -1);
        bind("byg-e-plus", "e", 1);
        bind("byg-e-minus", "e", -1);

        NK.el("byg-neutral").addEventListener("click", function () {
            if (mig.e === mig.p) return;
            var forskel = mig.p - mig.e;
            mig.e = mig.p;
            mig.anvend(forskel > 0
                ? "Du fyldte " + tal(forskel, "elektron", "elektroner") + " på. Nu er der lige mange protoner og elektroner — atomet er neutralt."
                : "Du fjernede " + tal(-forskel, "elektron", "elektroner") + ". Nu er der lige mange protoner og elektroner — atomet er neutralt.");
        });

        NK.el("byg-almindelig").addEventListener("click", function () {
            var i = D.hyppigsteIsotop(mig.p);
            if (!i) return;
            var nyN = i.a - mig.p;
            if (nyN === mig.n) return;
            mig.n = nyN;
            var g = D.grundstof(mig.p);
            mig.anvend("Nu har kernen " + nyN + " neutroner. " + g.navn + "-" + i.a
                + " er den isotop, der er mest af i naturen (" + NK.tal(i.andel, 2) + " %).");
        });

        NK.el("byg-nulstil").addEventListener("click", function () {
            mig.p = 0; mig.n = 0; mig.e = 0;
            mig.atom.saet(0, 0, 0);
            mig.opdaterPanel("tom");
        });

        NK.el("byg-opgave-ny").addEventListener("click", function () { mig.nyOpgave(); });
        NK.el("byg-opgave-svar").addEventListener("click", function () { mig.visSvar(); });
    };

    function tal(n, ental, flertal) {
        return n + " " + (n === 1 ? ental : flertal);
    }

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
        this.tjekOpgave();
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

        NK.saetTekst("byg-grundstof", g ? g.navn : "— endnu ikke et grundstof —");
        NK.saetTekst("byg-massetal", this.p ? String(a) : "–");
        NK.saetTekst("byg-ladning", NK.ladningstekst(q) + "  (" + this.p + " − " + this.e + ")");
        NK.saetKlasse("byg-ladning", "tal " + (q > 0 ? "roed" : (q < 0 ? "blaa" : "groen")));

        var fordeling = D.skalfordeling(this.e);
        NK.saetTekst("byg-fordeling", this.e ? fordeling.join(", ") : "ingen elektroner");

        /* Hvad ER det, eleven har bygget? */
        var maerkat, maerkatKlasse;
        if (!g) { maerkat = "Ingenting endnu"; maerkatKlasse = "maerke"; }
        else if (q === 0) { maerkat = "Neutralt atom"; maerkatKlasse = "maerke groen"; }
        else if (q > 0) { maerkat = "Positiv ion (kation)"; maerkatKlasse = "maerke roed"; }
        else { maerkat = "Negativ ion (anion)"; maerkatKlasse = "maerke blaa"; }
        NK.saetTekst("byg-type", maerkat);
        NK.saetKlasse("byg-type", maerkatKlasse);

        /* Kernen: findes den overhovedet? */
        var k = D.kerne(this.p, this.n);
        var kerneTekst, kerneKlasse;
        if (!g) { kerneTekst = "Læg en proton i for at komme i gang."; kerneKlasse = "besked"; }
        else if (k.art === "naturlig") {
            kerneTekst = g.symbol + "-" + a + " findes i naturen (" + NK.tal(k.isotop.andel, k.isotop.andel < 1 ? 4 : 2) + " % af alt " + g.navn.toLowerCase() + ").";
            kerneKlasse = "besked god";
        } else if (k.art === "radioaktiv") {
            kerneTekst = "☢ " + g.symbol + "-" + a + " findes, men er radioaktiv — " + k.isotop.note + ".";
            kerneKlasse = "besked gul";
        } else {
            kerneTekst = "Der findes ingen kerne med " + this.p + " protoner og " + this.n + " neutroner. Den ville falde fra hinanden.";
            kerneKlasse = "besked skidt";
        }
        NK.saetTekst("byg-kerne", kerneTekst);
        NK.saetKlasse("byg-kerne", kerneKlasse);

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
                tekst: "Byg et neutralt atom af " + g.navn.toLowerCase() + " (" + g.symbol + ") med massetal " + i.a + ".",
                p: g.z, n: i.a - g.z, e: g.z,
                svar: "Massetallet er protoner + neutroner, så " + i.a + " − " + g.z + " = " + (i.a - g.z)
                    + " neutroner. Neutralt vil sige lige så mange elektroner som protoner."
            };
        },
        /* 2. En ion af et grundstof, der danner ioner. */
        function () {
            var g = tilfaeldig(ionDannere());
            var i = D.hyppigsteIsotop(g.z);
            var aedel = D.aedelgasStruktur(g.z - g.ion);
            return {
                tekst: "Byg ionen " + g.symbol + NK.ladningHaevet(g.ion) + " med den kerne, der er mest af i naturen.",
                p: g.z, n: i.a - g.z, e: g.z - g.ion,
                svar: "Ladningen " + NK.ladningstekst(g.ion) + " betyder " + Math.abs(g.ion)
                    + (g.ion > 0 ? " elektron(er) FÆRRE" : " elektron(er) FLERE") + " end protoner."
                    + (aedel ? " Og se: elektronerne sidder nu som i " + aedel.navn.toLowerCase() + "." : "")
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
                    + ". Byg det neutrale atom af den SJÆLDNERE isotop " + g.symbol + "-" + valgt.a + ".",
                p: g.z, n: valgt.a - g.z, e: g.z,
                svar: "Samme " + g.z + " protoner — ellers var det ikke " + g.navn.toLowerCase() + " mere. Kun neutrontallet skifter fra "
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
                tekst: "Byg partiklen med " + g.z + " protoner, " + (i.a - g.z) + " neutroner og " + e
                    + " elektroner. Hvad er det, du har bygget?",
                p: g.z, n: i.a - g.z, e: e,
                svar: "Det er " + g.symbol + NK.ladningHaevet(g.z - e) + " med massetal " + i.a
                    + " — altså " + g.navn.toLowerCase() + "-" + i.a + (g.z - e === 0 ? " som neutralt atom." : " som ion.")
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
                tekst: "Byg en ion med ladningen " + NK.ladningstekst(g.ion) + ", som har præcis samme elektronstruktur som "
                    + aedel.navn.toLowerCase() + " (" + D.skalfordeling(aedel.z).join(", ") + "). Brug den almindelige kerne.",
                p: g.z, n: iso.a - g.z, e: g.z - g.ion,
                svar: "Der skal " + (g.z - g.ion) + " elektroner til for at ligne " + aedel.navn.toLowerCase()
                    + ". Med ladningen " + NK.ladningstekst(g.ion) + " giver det " + g.z + " protoner — altså " + g.navn.toLowerCase() + "."
            };
        }
    ];

    /* Udgangspunktet: ingen opgave er i gang endnu - eleven skal selv
       bede om én, saa opgaven ikke bare dukker op uopfordret. */
    NK.SimByg.prototype.visOpgaveStart = function () {
        this.opgave = null;
        NK.saetTekst("byg-opgave", "Tryk på “Start opgave” for at få en opgave, du selv skal bygge.");
        NK.saetKlasse("byg-opgave", "besked");
        NK.el("byg-opgave-svar").style.display = "none";
        NK.el("byg-opgave-ny").textContent = "Start opgave";
        NK.el("byg-opgave-ny").classList.remove("banker");
    };

    NK.SimByg.prototype.nyOpgave = function () {
        var forsoeg = 0;
        do {
            this.opgave = tilfaeldig(OPGAVETYPER)();
            forsoeg++;
        } while (forsoeg < 8 && this.opgave.p === this.p && this.opgave.n === this.n && this.opgave.e === this.e);
        this.opgave.loest = false;
        NK.saetTekst("byg-opgave", this.opgave.tekst);
        NK.saetKlasse("byg-opgave", "besked");
        NK.el("byg-opgave-svar").style.display = "";
        NK.el("byg-opgave-svar").disabled = false;
        NK.el("byg-opgave-ny").textContent = "Ny opgave";
        NK.el("byg-opgave-ny").classList.remove("banker");
        this.tjekOpgave();
    };

    NK.SimByg.prototype.visSvar = function () {
        if (!this.opgave) return;
        this.p = this.opgave.p; this.n = this.opgave.n; this.e = this.opgave.e;
        this.atom.saet(this.p, this.n, this.e);
        this.opdaterPanel("");
        NK.saetTekst("byg-opgave", this.opgave.tekst + "  →  " + this.opgave.svar);
        NK.saetKlasse("byg-opgave", "besked gul");
        this.opgave.loest = true;
        NK.el("byg-opgave-svar").disabled = true;
        NK.el("byg-opgave-ny").classList.add("banker");
    };

    NK.SimByg.prototype.tjekOpgave = function () {
        var o = this.opgave;
        if (!o || o.loest) return;
        if (o.p !== this.p || o.n !== this.n || o.e !== this.e) return;
        o.loest = true;
        this.loeste++;
        NK.saetTekst("byg-opgave", "Rigtigt! " + o.svar);
        NK.saetKlasse("byg-opgave", "besked god");
        NK.saetTekst("byg-opgave-tal", String(this.loeste));
        NK.el("byg-opgave-svar").disabled = true;
        NK.el("byg-opgave-ny").classList.add("banker");
    };

    /* ----- Tegning ---------------------------------------------------------- */
    NK.SimByg.prototype.tilpas = function () { this.l.tilpas(); };

    NK.SimByg.prototype.opdater = function (dt) {
        this.atom.opdater(dt);
        this.beskedTid += dt;
    };

    NK.SimByg.prototype.nulstil = function () {
        this.p = 1; this.n = 0; this.e = 1;
        this.atom.saet(1, 0, 1);
        this.opdaterPanel("start");
        this.visBesked("Tilbage til det simpleste atom: ét proton og én elektron — hydrogen.", "");
    };

    NK.SimByg.prototype.tegn = function () {
        var l = this.l, c = l.ctx;
        l.ryd("#14141a");

        var cx = l.b / 2;
        var cy = l.h * 0.57;
        var plads = NK.klamp(Math.min(l.b / 2 - 40, l.h * 0.40), 70, 300);

        if (this.p === 0 && this.n === 0 && this.e === 0) {
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

        var g = D.grundstof(this.p);
        this.atom.tegn(c, cx, cy, plads, {
            fremhaevValens: true,
            ladning: this.p - this.e,
            maerkat: g ? g.symbol : null,
            maerkatOver: true,
            maerkatStor: true
        });
        NK.tegnSkaltal(c, this.atom);
    };
}());
