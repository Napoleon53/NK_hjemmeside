/* =====================================================================
   sim_ion.js - fane 3: Yderste skal og ioner

   Her er grundstoffet givet, og spoergsmaalet er et andet: hvad goer
   atomet ved sine elektroner, og hvorfor?

   Begrundelsen (hvorfor netop den ladning?) staar ikke fremme hele
   tiden - den gemmes i oktetTekst og bliver foerst vist, naar eleven
   HAR gaettet. Ellers stod svaret jo og ventede ved siden af.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    var MULIGHEDER = [-3, -2, -1, 1, 2, 3];

    NK.SimIon = function () {
        this.l = new NK.Laerred(NK.el("ion-laerred"));
        this.atom = new NK.Atom();
        this.z = 11;                  /* natrium: det klassiske eksempel */
        this.tilstand = "atom";       /* atom | gaet | ion */
        this.atom.saetStraks(this.z, D.hyppigsteIsotop(this.z).a - this.z, this.z);

        this.koblKnapper();
        this.visGrundstof(this.z, false);
    };

    NK.SimIon.prototype.grundstof = function () { return D.grundstof(this.z); };

    NK.SimIon.prototype.koblKnapper = function () {
        var mig = this;

        var skyder = NK.el("ion-skyder");
        skyder.addEventListener("input", function () {
            mig.visGrundstof(parseInt(this.value, 10), true);
        });

        NK.el("ion-gaet-knap").addEventListener("click", function () { mig.startGaet(); });
        NK.el("ion-videre").addEventListener("click", function () { mig.visIon(); });
        NK.el("ion-nulstil").addEventListener("click", function () { mig.visGrundstof(mig.z, true); });
        NK.el("ion-naeste").addEventListener("click", function () {
            var ny;
            do { ny = 1 + Math.floor(Math.random() * D.MAKS_Z); } while (ny === mig.z);
            NK.el("ion-skyder").value = String(ny);
            mig.visGrundstof(ny, true);
        });
    };

    /* ----- Grundstoffet ----------------------------------------------------- */
    NK.SimIon.prototype.visGrundstof = function (z, animer) {
        this.z = z;
        this.tilstand = "atom";
        var g = this.grundstof();
        var n = D.hyppigsteIsotop(z).a - z;
        if (animer) this.atom.saet(z, n, z); else this.atom.saetStraks(z, n, z);

        var fordeling = D.skalfordeling(z);
        var valens = fordeling[fordeling.length - 1];

        NK.saetTekst("ion-navn", g.navn);
        NK.saetTekst("ion-symbol", g.symbol);
        NK.saetTekst("ion-z", String(g.z));
        NK.saetTekst("ion-fordeling", fordeling.join(", "));
        NK.saetTekst("ion-valens", String(valens));

        var typenavn = { metal: "Metal", ikkemetal: "Ikke-metal", halvmetal: "Halvmetal", aedelgas: "Ædelgas" };
        NK.saetTekst("ion-type", typenavn[g.type]);
        NK.saetKlasse("ion-type", "maerke " + (g.type === "metal" ? "roed"
            : (g.type === "ikkemetal" ? "blaa" : (g.type === "aedelgas" ? "groen" : "gul"))));

        this.visOktet(g, fordeling, valens);
        this.visKnapper();
        NK.saetTekst("ion-resultat", "");
        NK.saetKlasse("ion-resultat", "besked");
        NK.el("ion-gaet-boks").classList.remove("vis");
        this.visStatus(g.navn + " har " + valens + " elektron" + (valens === 1 ? "" : "er")
            + " i yderste skal.", "");
    };

    /* ----- Oktetreglen, sagt for dette grundstof ---------------------------- */
    NK.SimIon.prototype.visOktet = function (g, fordeling, valens) {
        var tekst;
        if (g.type === "aedelgas") {
            tekst = g.navn + " har allerede en fuld yderste skal (" + valens + " elektroner). "
                + "Der er hverken noget at afgive eller at optage — derfor reagerer ædelgasser næsten aldrig. "
                + "Det er netop den tilstand, alle de andre atomer forsøger at ende i.";
        } else if (g.ion === null) {
            tekst = g.navn + " har " + valens + " elektroner i yderste skal og ligger dermed lige langt fra begge ædelgasser. "
                + "Det koster for meget at flytte så mange elektroner, så " + g.navn.toLowerCase()
                + " danner ikke simple ioner — det DELER elektroner med andre atomer i stedet.";
        } else if (g.ion > 0) {
            var efter = D.aedelgasStruktur(g.z - g.ion);
            tekst = g.navn + " har kun " + valens + " elektron" + (valens === 1 ? "" : "er") + " i yderste skal. "
                + "Det er langt nemmere at give " + (valens === 1 ? "den" : "dem") + " væk end at skaffe "
                + (8 - valens) + " nye. Når de er væk, er den yderste skal tømt helt, og skallen indenunder er fuld"
                + (efter ? " — nøjagtig som i " + efter.navn.toLowerCase() : "") + ".";
        } else {
            var mangler = -g.ion;
            var efter2 = D.aedelgasStruktur(g.z - g.ion);
            tekst = g.navn + " har " + valens + " elektroner i yderste skal og mangler kun " + mangler
                + " i at have " + (g.z < 5 ? "2" : "8") + ". Det er nemmere at hente " + mangler
                + " end at slippe af med " + valens + (efter2 ? ". Med dem på plads ligner skyen " + efter2.navn.toLowerCase() : "") + ".";
        }
        this.oktetTekst = tekst;
    };

    NK.SimIon.prototype.visKnapper = function () {
        var g = this.grundstof();
        var kanDanneIon = (g.ion !== null && g.ion !== 0);
        var gaetKnap = NK.el("ion-gaet-knap");

        gaetKnap.style.display = (kanDanneIon && this.tilstand === "atom") ? "" : "none";
        NK.el("ion-nulstil").style.display = this.tilstand === "ion" ? "" : "none";
        NK.el("ion-naeste").style.display = (!kanDanneIon || this.tilstand === "ion") ? "" : "none";
        NK.el("ion-videre").style.display = "none";
    };

    /* ----- Gaettet ---------------------------------------------------------- */
    NK.SimIon.prototype.startGaet = function () {
        var g = this.grundstof();
        var fordeling = D.skalfordeling(g.z);
        var mig = this;
        this.tilstand = "gaet";

        NK.saetTekst("ion-gaet-sp", "Hvilken ladning får " + g.navn.toLowerCase() + ", når det bliver til en ion?");
        NK.saetTekst("ion-gaet-hint", "Til hjælp: elektronfordelingen er (" + fordeling.join(", ") + "), altså "
            + fordeling[fordeling.length - 1] + " elektroner i yderste skal.");

        var boks = NK.el("ion-gaet-valg");
        boks.innerHTML = "";
        for (var i = 0; i < MULIGHEDER.length; i++) {
            var v = MULIGHEDER[i];
            var knap = document.createElement("button");
            knap.className = "gaetknap";
            knap.type = "button";
            knap.textContent = Math.abs(v) + (v > 0 ? "+" : "−");
            knap.setAttribute("data-vaerdi", String(v));
            knap.addEventListener("click", function () {
                mig.svar(parseInt(this.getAttribute("data-vaerdi"), 10));
            });
            boks.appendChild(knap);
        }

        NK.saetTekst("ion-gaet-svar", "");
        NK.saetKlasse("ion-gaet-svar", "besked");
        NK.el("ion-gaet-boks").classList.add("vis");
        NK.el("ion-gaet-knap").style.display = "none";
        NK.el("ion-videre").style.display = "none";
    };

    NK.SimIon.prototype.svar = function (gaet) {
        var g = this.grundstof();
        var rigtig = g.ion;
        var traf = (gaet === rigtig);
        /* Hydrogen kan ogsaa optage en elektron og faa heliums struktur.
           Det er lige saa rigtigt kemisk - det skal en elev have ros for. */
        var skarpt = !traf && g.z === 1 && gaet === -1;

        var knapper = NK.el("ion-gaet-valg").children;
        for (var i = 0; i < knapper.length; i++) {
            var v = parseInt(knapper[i].getAttribute("data-vaerdi"), 10);
            knapper[i].disabled = true;
            if (v === rigtig) knapper[i].classList.add("rigtig");
            else if (v === gaet) knapper[i].classList.add(skarpt ? "rigtig" : "forkert");
        }

        var begrundelse = this.oktetTekst;
        var tekst;
        if (traf) {
            tekst = "Rigtigt — ladningen bliver " + NK.ladningstekst(rigtig) + ". " + begrundelse;
        } else if (skarpt) {
            tekst = "Skarpt set! Hydrogen KAN faktisk optage en elektron og blive H⁻ med heliums struktur. "
                + "Her viser vi den almindelige udgave, H⁺.";
        } else {
            tekst = "Ikke helt — den rigtige ladning er " + NK.ladningstekst(rigtig) + ". " + begrundelse;
        }
        NK.saetTekst("ion-gaet-svar", tekst);
        NK.saetKlasse("ion-gaet-svar", "besked " + (traf || skarpt ? "god" : "skidt"));
        NK.el("ion-videre").style.display = "";
    };

    /* ----- Selve iondannelsen ------------------------------------------------ */
    NK.SimIon.prototype.visIon = function () {
        var g = this.grundstof();
        var nyE = g.z - g.ion;
        this.tilstand = "ion";
        this.atom.saet(g.z, D.hyppigsteIsotop(g.z).a - g.z, nyE);

        var fordeling = D.skalfordeling(nyE);
        var aedel = D.aedelgasStruktur(nyE);
        NK.saetTekst("ion-resultat", g.symbol + NK.ladningHaevet(g.ion) + " har nu " + nyE
            + " elektroner fordelt (" + fordeling.join(", ") + ")"
            + (aedel ? " — præcis som " + aedel.navn.toLowerCase() : "")
            + ". Læg mærke til, at KERNEN er uændret: der er stadig " + g.z
            + " protoner, så det er stadig " + g.navn.toLowerCase() + ". Kun elektronerne er flyttet.");
        NK.saetKlasse("ion-resultat", "besked god");

        NK.el("ion-gaet-boks").classList.remove("vis");
        this.visKnapper();
        this.visStatus("Ionen " + g.symbol + NK.ladningHaevet(g.ion) + " er dannet. "
            + Math.abs(g.ion) + " elektron" + (Math.abs(g.ion) === 1 ? "" : "er") + " "
            + (g.ion > 0 ? "forlod" : "kom til") + " atomet — kernen rørte sig ikke.", "");
    };

    NK.SimIon.prototype.visStatus = function (tekst, klasse) {
        NK.saetTekst("ion-status", tekst);
        NK.saetKlasse("ion-status", "scene-mrk" + (klasse ? " " + klasse : ""));
    };

    /* ----- Tegning ---------------------------------------------------------- */
    NK.SimIon.prototype.tilpas = function () { this.l.tilpas(); };

    NK.SimIon.prototype.opdater = function (dt) { this.atom.opdater(dt); };

    NK.SimIon.prototype.nulstil = function () { this.visGrundstof(this.z, true); };

    NK.SimIon.prototype.tegn = function () {
        var l = this.l, c = l.ctx;
        var g = this.grundstof();
        l.ryd("#14141a");

        var q = (this.tilstand === "ion") ? g.ion : 0;
        var cx = l.b / 2;
        var cy = (l.h - 52) / 2 + 6;
        var plads = NK.klamp(Math.min(l.b / 2 - 34, (l.h - 92) / 2), 70, 330);

        this.atom.tegn(c, cx, cy, plads, {
            fremhaevValens: true,
            ladning: q,
            maerkat: g.symbol + NK.ladningHaevet(q)
        });
        NK.tegnSkaltal(c, this.atom);

        /* Den yderste skal er dér, hele kemien foregaar - saa den faar en
           tekst, der peger direkte paa den. */
        var geo = this.atom.sidsteGeo;
        if (geo && this.atom.fordeling.length) {
            var yderste = this.atom.fordeling.length - 1;
            var r = geo.geo.rSkal[yderste] * geo.s;
            var x = geo.cx + Math.cos(-Math.PI * 0.25) * (r + 10);
            var y = geo.cy + Math.sin(-Math.PI * 0.25) * (r + 10);

            /* En kort streg fra skallen ud til teksten, saa der ikke er
               tvivl om, HVILKEN ring der er den yderste. */
            c.save();
            c.strokeStyle = "rgba(242, 197, 61, 0.75)";
            c.lineWidth = 1.5;
            c.beginPath();
            c.moveTo(x, y);
            c.lineTo(x + 16, y - 16);
            c.stroke();
            c.restore();

            NK.tekst(c, "yderste skal", x + 21, y - 18, {
                font: "800 19px 'Segoe UI', sans-serif", justering: "left", linje: "middle",
                farve: "#f2c53d", kant: true, kantBredde: 4
            });
        }
    };
}());
