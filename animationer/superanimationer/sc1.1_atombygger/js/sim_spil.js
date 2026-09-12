/* =====================================================================
   sim_spil.js - fane 5: Spil

   De fire foerste faner forklarer. Denne fane spoerger.

   Tre baner med fem spoergsmaal i hver. Spoergsmaalene laves paa
   stedet ud fra de samme data som resten af animationen, saa de aldrig
   loeber toer, og saa de aldrig kan komme til at paastaa noget, der
   ikke passer med det, fanerne viser.

   Begrundelsen kommer ogsaa frem, naar man svarer RIGTIGT. Ellers
   laerer man kun, at man ramte - ikke hvorfor.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    var SPOERGSMAAL_PR_BANE = 5;

    /* ----- Smaa hjaelpere ------------------------------------------------ */
    function tilfaeldig(liste) { return liste[Math.floor(Math.random() * liste.length)]; }

    function bland(liste) {
        var a = liste.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    /* Stiller svarmulighederne op: det rigtige svar plus forskellige
       forkerte, blandet, med besked om hvor det rigtige endte.
       kandidater er de gode fejlsvar - dem eleven faktisk kunne finde
       paa. noed(i) bruges kun, hvis de ikke slaar til, fordi nogle af
       dem faldt sammen med det rigtige svar. */
    function opstil(rigtig, kandidater, noed) {
        var ud = [rigtig];
        var i;
        for (i = 0; i < kandidater.length && ud.length < 4; i++) {
            if (ud.indexOf(kandidater[i]) === -1) ud.push(kandidater[i]);
        }
        for (i = 0; noed && ud.length < 4 && i < 40; i++) {
            var n = noed(i);
            if (ud.indexOf(n) === -1) ud.push(n);
        }
        var blandet = bland(ud);
        return { valg: blandet, rigtig: blandet.indexOf(rigtig) };
    }

    function andreGrundstoffer(ikke, antal) {
        var ud = [];
        var liste = bland(D.GRUNDSTOFFER);
        for (var i = 0; i < liste.length && ud.length < antal; i++) {
            if (liste[i].z !== ikke.z) ud.push(liste[i]);
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

    function medFlereIsotoper() {
        var ud = [];
        for (var i = 0; i < D.GRUNDSTOFFER.length; i++) {
            if (D.GRUNDSTOFFER[i].isotoper.length > 1) ud.push(D.GRUNDSTOFFER[i]);
        }
        return ud;
    }

    /* De grundstoffer, hvis ion faktisk rammer en aedelgasstruktur.
       Hydrogen er ude: H⁺ har slet ingen elektroner tilbage. */
    function aedelgasDannere() {
        var ud = [];
        var liste = ionDannere();
        for (var i = 0; i < liste.length; i++) {
            if (D.aedelgasStruktur(liste[i].z - liste[i].ion)) ud.push(liste[i]);
        }
        return ud;
    }

    function nuklidtekst(a, symbol) { return NK.haevet(a) + symbol; }

    /* ----- Bane 1: atomets partikler ------------------------------------- */

    /* Kun de tolv foerste: man skal kunne naa at taelle prikkerne. */
    function sp_grundstof() {
        var g = tilfaeldig(D.GRUNDSTOFFER.slice(0, 12));
        var iso = D.hyppigsteIsotop(g.z);
        var andre = andreGrundstoffer(g, 3).map(function (x) { return x.navn; });
        var o = opstil(g.navn, andre);
        return {
            tekst: "Hvilket grundstof er det?",
            valg: o.valg, rigtig: o.rigtig,
            forklaring: "Elektronerne sidder (" + D.skalfordeling(g.z).join(", ") + "), altså "
                + NK.talform(g.z, "elektron", "elektroner") + " i alt. Atomet er neutralt, så der er lige så mange "
                + "protoner, og " + g.z + " protoner betyder " + g.navn.toLowerCase() + ".",
            atom: { p: g.z, n: iso.a - g.z, e: g.z }
        };
    }

    function sp_neutroner() {
        var g = tilfaeldig(D.GRUNDSTOFFER);
        var iso = tilfaeldig(g.isotoper);
        var n = iso.a - g.z;
        var o = opstil(String(n), [String(g.z), String(iso.a), String(n + 2)],
            function (i) { return String(n + 1 + i); });
        return {
            tekst: "Hvor mange neutroner er der i kernen?",
            valg: o.valg, rigtig: o.rigtig,
            forklaring: "Massetallet " + iso.a + " tæller protoner og neutroner sammen, så "
                + iso.a + " − " + g.z + " = " + NK.talform(n, "neutron", "neutroner") + ".",
            nuklid: { a: iso.a, z: g.z, symbol: g.symbol }
        };
    }

    function sp_yderste() {
        var g = tilfaeldig(D.GRUNDSTOFFER);
        var valens = D.valenselektroner(g.z);
        var o = opstil(String(valens), [String(valens + 1), String(g.z)],
            function (i) { return String(((valens + i) % 8) + 1); });
        return {
            tekst: "Hvor mange elektroner er der i atomets yderste skal?",
            valg: o.valg, rigtig: o.rigtig,
            forklaring: g.navn + " har elektronstrukturen " + D.skalfordeling(g.z).join(", ") + ", så der er "
                + NK.talform(valens, "elektron", "elektroner") + " i yderste skal.",
            atom: { p: g.z, n: D.hyppigsteIsotop(g.z).a - g.z, e: g.z }
        };
    }

    /* ----- Bane 2: isotoper og ioner -------------------------------------- */

    function sp_massetal() {
        var g = tilfaeldig(D.GRUNDSTOFFER);
        var iso = tilfaeldig(g.isotoper);
        var n = iso.a - g.z;
        var o = opstil(String(iso.a), [String(g.z), String(n), String(iso.a + 2)],
            function (i) { return String(iso.a + 1 + i); });
        return {
            tekst: "En kerne har " + NK.talform(g.z, "proton", "protoner") + " og "
                + NK.talform(n, "neutron", "neutroner") + ". Hvad er massetallet?",
            valg: o.valg, rigtig: o.rigtig,
            forklaring: "Massetallet er protoner + neutroner: " + g.z + " + " + n + " = " + iso.a + ".",
            atom: { p: g.z, n: n, e: g.z }
        };
    }

    function sp_ladning() {
        var g = tilfaeldig(ionDannere());
        var e = g.z - g.ion;
        var o = opstil(NK.ladningstekst(g.ion),
            ["0", NK.ladningstekst(-g.ion), NK.ladningstekst(g.ion > 0 ? g.ion + 1 : g.ion - 1)],
            function (i) { return NK.ladningstekst(i + 2); });
        return {
            tekst: "Partiklen har " + NK.talform(g.z, "proton", "protoner") + " og "
                + NK.talform(e, "elektron", "elektroner") + ". Hvad er ladningen?",
            valg: o.valg, rigtig: o.rigtig,
            forklaring: "Ladningen er protoner minus elektroner: " + g.z + " − " + e + " = "
                + NK.ladningstekst(g.ion) + ".",
            atom: { p: g.z, n: D.hyppigsteIsotop(g.z).a - g.z, e: e }
        };
    }

    function sp_partikel() {
        var g = tilfaeldig(ionDannere());
        var e = g.z - g.ion;
        var rigtig = g.symbol + NK.ladningHaevet(g.ion);
        var andre = andreGrundstoffer(g, 2).map(function (x) {
            return x.symbol + NK.ladningHaevet(x.ion === null ? 0 : x.ion);
        });
        var o = opstil(rigtig, [g.symbol].concat(andre));
        return {
            tekst: "Hvilken partikel er tegnet her?",
            valg: o.valg, rigtig: o.rigtig,
            forklaring: "Kernen har " + NK.talform(g.z, "proton", "protoner") + ", så det er "
                + g.navn.toLowerCase() + ". Der er kun " + NK.talform(e, "elektron", "elektroner")
                + ", og så er ladningen " + NK.ladningstekst(g.ion) + ".",
            atom: { p: g.z, n: D.hyppigsteIsotop(g.z).a - g.z, e: e }
        };
    }

    function sp_isotop() {
        var g = tilfaeldig(medFlereIsotoper());
        var to = bland(g.isotoper);
        var vist = to[0], svar = to[1];
        var rigtig = nuklidtekst(svar.a, g.symbol);
        var andre = andreGrundstoffer(g, 3).map(function (x) {
            return nuklidtekst(D.hyppigsteIsotop(x.z).a, x.symbol);
        });
        var o = opstil(rigtig, andre);
        return {
            tekst: "Hvilken af dem er en isotop af " + nuklidtekst(vist.a, g.symbol) + "?",
            valg: o.valg, rigtig: o.rigtig,
            forklaring: "Isotoper har samme protontal, men forskelligt neutrontal. " + rigtig + " har også "
                + NK.talform(g.z, "proton", "protoner") + ", så det er stadig " + g.navn.toLowerCase() + ".",
            nuklid: { a: vist.a, z: g.z, symbol: g.symbol }
        };
    }

    /* ----- Bane 3: ioner og salte ------------------------------------------ */

    function sp_ionladning() {
        var g = tilfaeldig(ionDannere());
        var valens = D.valenselektroner(g.z);
        var aedel = D.aedelgasStruktur(g.z - g.ion);
        var o = opstil(NK.ladningstekst(g.ion),
            ["0", NK.ladningstekst(-g.ion), NK.ladningstekst(g.ion > 0 ? g.ion + 1 : g.ion - 1)],
            function (i) { return NK.ladningstekst(i + 2); });
        return {
            tekst: "Hvilken ladning får " + g.navn.toLowerCase() + ", når det bliver til en ion?",
            valg: o.valg, rigtig: o.rigtig,
            forklaring: g.navn + " har " + NK.talform(valens, "elektron", "elektroner") + " i yderste skal og "
                + (g.ion > 0 ? "afgiver " + NK.talform(g.ion, "elektron", "elektroner")
                             : "optager " + NK.talform(-g.ion, "elektron", "elektroner"))
                + (aedel ? " for at ligne " + aedel.navn.toLowerCase() : "")
                + ". Elektroner er negativt ladede, så ladningen bliver " + NK.ladningstekst(g.ion) + ".",
            atom: { p: g.z, n: D.hyppigsteIsotop(g.z).a - g.z, e: g.z }
        };
    }

    function formelMed(m, ik, a, b) {
        return m.symbol + (a > 1 ? NK.saenket(a) : "") + ik.symbol + (b > 1 ? NK.saenket(b) : "");
    }

    function sp_saltformel() {
        var m = D.findSymbol(tilfaeldig(D.SALT_METALLER));
        var ik = D.findSymbol(tilfaeldig(D.SALT_IKKEMETALLER));
        var f = D.formelforhold(m.ion, ik.ion);
        var rigtig = D.saltformel(m, ik);
        var o = opstil(rigtig, [
            formelMed(m, ik, 1, 1),
            formelMed(m, ik, f.antalNegative, f.antalPositive),
            formelMed(m, ik, Math.abs(ik.ion), Math.abs(m.ion))
        ], function (i) { return formelMed(m, ik, 1, i + 2); });
        return {
            tekst: "Hvad er formlen for saltet af " + m.navn.toLowerCase() + " og " + ik.navn.toLowerCase() + "?",
            valg: o.valg, rigtig: o.rigtig,
            forklaring: "Hvert " + m.symbol + " afgiver " + NK.talform(Math.abs(m.ion), "elektron", "elektroner")
                + ", og hvert " + ik.symbol + " optager " + NK.talform(Math.abs(ik.ion), "elektron", "elektroner")
                + ". Det går først op ved " + f.antalPositive + " " + m.symbol + " og " + f.antalNegative + " "
                + ik.symbol + ", altså " + rigtig + ".",
            stortekst: m.symbol + NK.ladningHaevet(m.ion) + "  +  " + ik.symbol + NK.ladningHaevet(ik.ion)
        };
    }

    function sp_aedelgas() {
        var g = tilfaeldig(aedelgasDannere());
        var aedel = D.aedelgasStruktur(g.z - g.ion);
        var o = opstil(aedel.navn.toLowerCase(), bland(["helium", "neon", "argon", "krypton"]));
        return {
            tekst: "Hvilken ædelgas kommer " + g.navn.toLowerCase() + " til at ligne som ion?",
            valg: o.valg, rigtig: o.rigtig,
            forklaring: g.symbol + NK.ladningHaevet(g.ion) + " har " + (g.z - g.ion)
                + " elektroner fordelt (" + D.skalfordeling(g.z - g.ion).join(", ")
                + "), og det er præcis " + aedel.navn.toLowerCase() + "s elektronstruktur.",
            atom: { p: g.z, n: D.hyppigsteIsotop(g.z).a - g.z, e: g.z }
        };
    }

    var BANER = [
        { navn: "Atomets partikler", slags: [sp_grundstof, sp_neutroner, sp_yderste] },
        { navn: "Isotoper og ioner", slags: [sp_massetal, sp_ladning, sp_partikel, sp_isotop] },
        { navn: "Ioner og salte", slags: [sp_ionladning, sp_saltformel, sp_aedelgas] }
    ];

    /* Lagt frem, saa _selvtest.html kan traekke tusindvis af spoergsmaal
       og kontrollere, at de altid har fire FORSKELLIGE svar med praecis
       ét rigtigt iblandt. Spoergsmaalene laves tilfaeldigt, saa det er
       ikke noget, man kan se paa ét skaermbillede. */
    NK.SPIL_BANER = BANER;

    function stjerner(rigtige) {
        var antal = rigtige >= 5 ? 3 : (rigtige >= 4 ? 2 : (rigtige >= 3 ? 1 : 0));
        var ud = "";
        for (var i = 0; i < 3; i++) ud += (i < antal ? "★" : "☆");
        return ud;
    }

    function dom(rigtige) {
        if (rigtige === SPOERGSMAAL_PR_BANE) return "Alle fem rigtige.";
        if (rigtige >= 3) return "Læs begrundelserne igennem, og tag banen en gang til.";
        return "Kig på de fire første faner igen, og tag så banen forfra.";
    }

    /* ----- Selve fanen ------------------------------------------------------ */
    NK.SimSpil = function () {
        this.l = new NK.Laerred(NK.el("spil-laerred"));
        this.atom = new NK.Atom();
        this.tilstand = "vaelg";      /* vaelg | spiller | faerdig */
        this.bane = 0;
        this.nr = 0;
        this.rigtige = 0;
        this.opgave = null;
        this.sidsteSlags = null;
        this.besvaret = false;

        this.koblKnapper();
        this.visTilstand();
    };

    NK.SimSpil.prototype.koblKnapper = function () {
        var mig = this;
        var baneknapper = document.querySelectorAll(".banevalg");
        function bindBane(knap) {
            knap.addEventListener("click", function () {
                mig.startBane(parseInt(knap.getAttribute("data-bane"), 10));
            });
        }
        for (var i = 0; i < baneknapper.length; i++) bindBane(baneknapper[i]);

        NK.el("spil-naeste").addEventListener("click", function () { mig.naesteSpoergsmaal(); });
        NK.el("spil-igen").addEventListener("click", function () { mig.startBane(mig.bane); });
        NK.el("spil-tilbage").addEventListener("click", function () { mig.nulstil(); });
    };

    NK.SimSpil.prototype.visTilstand = function () {
        NK.el("spil-vaelg").style.display = this.tilstand === "vaelg" ? "" : "none";
        NK.el("spil-boks").style.display = this.tilstand === "spiller" ? "" : "none";
        NK.el("spil-resultat").style.display = this.tilstand === "faerdig" ? "" : "none";
    };

    NK.SimSpil.prototype.startBane = function (nr) {
        this.bane = nr;
        this.nr = 0;
        this.rigtige = 0;
        this.sidsteSlags = null;
        this.tilstand = "spiller";
        this.visTilstand();
        this.naesteSpoergsmaal();
    };

    NK.SimSpil.prototype.naesteSpoergsmaal = function () {
        var mig = this;
        if (this.nr >= SPOERGSMAAL_PR_BANE) { this.visResultat(); return; }
        this.nr++;

        /* Aldrig samme slags spoergsmaal to gange i traek. */
        var slags = BANER[this.bane].slags;
        var pulje = slags;
        if (slags.length > 1 && this.sidsteSlags) {
            pulje = slags.filter(function (f) { return f !== mig.sidsteSlags; });
        }
        var valgt = tilfaeldig(pulje);
        this.sidsteSlags = valgt;
        this.opgave = valgt();
        this.besvaret = false;

        if (this.opgave.atom) {
            var a = this.opgave.atom;
            this.atom.saetStraks(a.p, a.n, a.e);
        }

        NK.saetTekst("spil-taeller", this.nr + "/" + SPOERGSMAAL_PR_BANE);
        NK.saetTekst("spil-sp", this.opgave.tekst);
        NK.saetTekst("spil-svar", "");
        NK.saetKlasse("spil-svar", "besked");
        NK.el("spil-naeste").style.display = "none";

        var boks = NK.el("spil-svarvalg");
        boks.innerHTML = "";
        for (var i = 0; i < this.opgave.valg.length; i++) {
            var knap = document.createElement("button");
            knap.className = "spilknap";
            knap.type = "button";
            knap.textContent = this.opgave.valg[i];
            knap.setAttribute("data-nr", String(i));
            knap.addEventListener("click", function () {
                mig.svar(parseInt(this.getAttribute("data-nr"), 10));
            });
            boks.appendChild(knap);
        }
    };

    NK.SimSpil.prototype.svar = function (valgt) {
        if (this.besvaret) return;
        this.besvaret = true;

        var o = this.opgave;
        var traf = (valgt === o.rigtig);
        if (traf) this.rigtige++;

        var knapper = NK.el("spil-svarvalg").children;
        for (var i = 0; i < knapper.length; i++) {
            knapper[i].disabled = true;
            if (i === o.rigtig) knapper[i].classList.add("rigtig");
            else if (i === valgt) knapper[i].classList.add("forkert");
        }

        NK.saetTekst("spil-svar", (traf ? "Rigtigt. " : "Ikke helt. ") + o.forklaring);
        NK.saetKlasse("spil-svar", "besked " + (traf ? "god" : "skidt"));

        var knap = NK.el("spil-naeste");
        knap.style.display = "";
        knap.firstChild.textContent = this.nr >= SPOERGSMAAL_PR_BANE ? "Se resultatet" : "Næste spørgsmål";
    };

    NK.SimSpil.prototype.visResultat = function () {
        this.tilstand = "faerdig";
        this.visTilstand();
        NK.saetTekst("spil-score", this.rigtige + " / " + SPOERGSMAAL_PR_BANE);
        NK.saetTekst("spil-stjerner", stjerner(this.rigtige));
        NK.saetTekst("spil-dom", dom(this.rigtige));
    };

    /* ----- Tegning ----------------------------------------------------------- */
    NK.SimSpil.prototype.tilpas = function () { this.l.tilpas(); };

    NK.SimSpil.prototype.opdater = function (dt) { this.atom.opdater(dt); };

    NK.SimSpil.prototype.nulstil = function () {
        this.tilstand = "vaelg";
        this.opgave = null;
        this.sidsteSlags = null;
        this.visTilstand();
    };

    /* Nuklidet skrevet som i bogen: massetal over protontal, til
       venstre for symbolet. */
    function tegnNuklid(c, cx, cy, nk) {
        var symFont = "300 90px 'Segoe UI', sans-serif";
        var talFont = "700 30px 'Segoe UI', sans-serif";
        var talBredde = 52;

        c.save();
        c.font = symFont;
        var symBredde = c.measureText(nk.symbol).width;
        c.restore();

        var venstre = cx - (talBredde + symBredde) / 2;
        NK.tekst(c, nk.symbol, venstre + talBredde, cy, {
            font: symFont, justering: "left", linje: "middle", farve: "#f2f3f5"
        });
        NK.tekst(c, String(nk.a), venstre + talBredde - 8, cy - 24, {
            font: talFont, justering: "right", linje: "middle", farve: "#f2c53d"
        });
        NK.tekst(c, String(nk.z), venstre + talBredde - 8, cy + 20, {
            font: talFont, justering: "right", linje: "middle", farve: "#e05446"
        });
    }

    NK.SimSpil.prototype.tegn = function () {
        var l = this.l, c = l.ctx;
        l.ryd("#14141a");
        var cx = l.b / 2, cy = l.h / 2;

        if (this.tilstand === "vaelg") {
            NK.tekst(c, "Vælg en bane i panelet", cx, cy - 14, {
                font: "600 20px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#7e8590"
            });
            NK.tekst(c, "Fem spørgsmål ad gangen", cx, cy + 16, {
                font: "400 14px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#5f656e"
            });
            return;
        }

        if (this.tilstand === "faerdig") {
            NK.tekst(c, this.rigtige + " / " + SPOERGSMAAL_PR_BANE, cx, cy - 26, {
                font: "800 76px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#f2c53d"
            });
            NK.tekst(c, stjerner(this.rigtige), cx, cy + 44, {
                font: "400 44px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#f2c53d"
            });
            return;
        }

        var o = this.opgave;
        if (!o) return;

        /* Hverken maerkat, ladningsskaer eller skaltal: de ville staa og
           afsloere netop det, der bliver spurgt om. */
        if (o.atom) {
            var plads = NK.klamp(Math.min(l.b / 2 - 40, l.h * 0.40), 70, 300);
            this.atom.tegn(c, cx, cy, plads, { fremhaevValens: true });
        } else if (o.nuklid) {
            tegnNuklid(c, cx, cy, o.nuklid);
        } else if (o.stortekst) {
            NK.tekst(c, o.stortekst, cx, cy, {
                font: "600 52px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#f2f3f5"
            });
        }
    };
}());
