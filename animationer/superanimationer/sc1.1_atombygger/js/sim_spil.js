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

    /* Kun det fulde hus giver et hjerte. Alt andet staar bare som sit
       eget tal - ingen halve trofaeer at samle paa. */
    function hjerte(rigtige) {
        return rigtige === SPOERGSMAAL_PR_BANE ? "♥" : "";
    }

    function dom(rigtige) {
        if (rigtige === SPOERGSMAAL_PR_BANE) return "Alle fem rigtige.";
        if (rigtige >= 3) return "Læs begrundelserne igennem, og tag banen en gang til.";
        return "Kig på de fire første faner igen, og tag så banen forfra.";
    }

    /* Hver bane husker sig selv: hvor langt man er naaet, hvad man
       svarede paa det spoergsmaal, man staar i, og om banen én gang er
       klaret med fuldt hus. Det er dét, der goer det muligt at hoppe
       frem og tilbage mellem banerne uden at miste noget. */
    function nyBanestatus() {
        return {
            nr: 0,              /* hvilket spoergsmaal, 0 = ikke begyndt */
            rigtige: 0,
            opgave: null,
            valgt: -1,          /* -1 = ikke svaret endnu */
            faerdig: false,
            perfekt: false,     /* 5/5 opnaaet mindst én gang */
            sidsteSlags: null
        };
    }

    function banestatustekst(b) {
        if (b.perfekt) return "♥ 5/5";
        if (b.faerdig) return b.rigtige + "/5 rigtige";
        if (b.nr > 0) return "spm. " + b.nr + "/5";
        return "ikke prøvet";
    }

    /* ----- Selve fanen ------------------------------------------------------ */
    NK.SimSpil = function () {
        this.l = new NK.Laerred(NK.el("spil-laerred"));
        this.atom = new NK.Atom();
        this.aktiv = 0;
        this.baner = [];
        for (var i = 0; i < BANER.length; i++) this.baner.push(nyBanestatus());

        this.koblKnapper();
        this.byggBanerad();
        this.vaelgBane(0);
    };

    NK.SimSpil.prototype.koblKnapper = function () {
        var mig = this;
        NK.el("spil-naeste").addEventListener("click", function () { mig.naeste(); });
        NK.el("spil-igen").addEventListener("click", function () { mig.igen(); });

        /* Opslagstabellen: ren visning, men med atomnummeret med, saa den
           kan bruges til at slaa protontal op midt i et spoergsmaal. */
        this.pertabel = new NK.PeriodiskSystem(NK.el("spil-pertabel-gitter"), { stor: true });
        NK.el("spil-pertabel-knap").addEventListener("click", function () {
            NK.el("spil-pertabel").classList.add("vis");
        });
        NK.el("spil-pertabel-luk").addEventListener("click", function () {
            NK.el("spil-pertabel").classList.remove("vis");
        });
        NK.el("spil-pertabel").addEventListener("click", function (e) {
            if (e.target.id === "spil-pertabel") this.classList.remove("vis");
        });
    };

    NK.SimSpil.prototype.byggBanerad = function () {
        var mig = this;
        var boks = NK.el("spil-baner");
        boks.innerHTML = "";
        this.baneknapper = [];

        for (var i = 0; i < BANER.length; i++) {
            var knap = document.createElement("button");
            knap.className = "baneknap";
            knap.type = "button";
            knap.setAttribute("data-bane", String(i));

            var navn = document.createElement("span");
            navn.textContent = (i + 1) + " · " + BANER[i].navn;
            var status = document.createElement("span");
            status.className = "bstatus";

            knap.appendChild(navn);
            knap.appendChild(status);
            knap.addEventListener("click", function () {
                mig.vaelgBane(parseInt(this.getAttribute("data-bane"), 10));
            });

            boks.appendChild(knap);
            this.baneknapper.push({ knap: knap, status: status });
        }
    };

    NK.SimSpil.prototype.vaelgBane = function (nr) {
        this.aktiv = nr;
        var b = this.baner[nr];
        if (!b.faerdig && !b.opgave) this.nytSpoergsmaal();
        this.visBane();
    };

    NK.SimSpil.prototype.nytSpoergsmaal = function () {
        var b = this.baner[this.aktiv];

        /* Aldrig samme slags spoergsmaal to gange i traek. */
        var slags = BANER[this.aktiv].slags;
        var pulje = slags;
        if (slags.length > 1 && b.sidsteSlags) {
            pulje = slags.filter(function (f) { return f !== b.sidsteSlags; });
        }
        var valgt = tilfaeldig(pulje);
        b.sidsteSlags = valgt;
        b.opgave = valgt();
        b.valgt = -1;
        b.nr++;
    };

    NK.SimSpil.prototype.svar = function (nr) {
        var b = this.baner[this.aktiv];
        if (b.valgt !== -1) return;
        b.valgt = nr;
        if (nr === b.opgave.rigtig) b.rigtige++;
        this.visBane();
    };

    NK.SimSpil.prototype.naeste = function () {
        var b = this.baner[this.aktiv];
        if (b.valgt === -1) return;

        if (b.nr >= SPOERGSMAAL_PR_BANE) {
            b.faerdig = true;
            if (b.rigtige === SPOERGSMAAL_PR_BANE) b.perfekt = true;
            this.tjekBeloenning();
        } else {
            this.nytSpoergsmaal();
        }
        this.visBane();
    };

    /* En bane, man har klaret med 5/5, bliver ved med at taelle som
       klaret - ogsaa selvom man spiller den igen og rammer skaevt. */
    NK.SimSpil.prototype.igen = function () {
        var perfekt = this.baner[this.aktiv].perfekt;
        this.baner[this.aktiv] = nyBanestatus();
        this.baner[this.aktiv].perfekt = perfekt;
        this.nytSpoergsmaal();
        this.visBane();
    };

    NK.SimSpil.prototype.tjekBeloenning = function () {
        for (var i = 0; i < this.baner.length; i++) {
            if (!this.baner[i].perfekt) return;
        }
        NK.el("spil-bohr").hidden = false;
    };

    /* Tegner hele panelet op efter den aktive banes tilstand. Kaldes
       ogsaa ved baneskift, saa man lander praecis dér, hvor man slap -
       med samme spoergsmaal og samme svar som foer. */
    NK.SimSpil.prototype.visBane = function () {
        var mig = this;
        var b = this.baner[this.aktiv];
        var i;

        for (i = 0; i < this.baneknapper.length; i++) {
            this.baneknapper[i].knap.classList.toggle("aktiv", i === this.aktiv);
            this.baneknapper[i].knap.classList.toggle("perfekt", this.baner[i].perfekt);
            this.baneknapper[i].status.textContent = banestatustekst(this.baner[i]);
        }

        NK.el("spil-boks").style.display = b.faerdig ? "none" : "";
        NK.el("spil-resultat").style.display = b.faerdig ? "" : "none";

        if (b.faerdig) {
            NK.saetTekst("spil-resultatnavn", BANER[this.aktiv].navn);
            NK.saetTekst("spil-score", b.rigtige + " / " + SPOERGSMAAL_PR_BANE);
            NK.saetTekst("spil-hjerte", hjerte(b.rigtige));
            NK.saetTekst("spil-dom", dom(b.rigtige));
            return;
        }

        if (b.opgave.atom) {
            var a = b.opgave.atom;
            if (this.atom.p !== a.p || this.atom.n !== a.n || this.atom.e !== a.e) {
                this.atom.saetStraks(a.p, a.n, a.e);
            }
        }

        NK.saetTekst("spil-banenavn", BANER[this.aktiv].navn);
        NK.saetTekst("spil-taeller", b.nr + "/" + SPOERGSMAAL_PR_BANE);
        NK.saetTekst("spil-sp", b.opgave.tekst);

        var boks = NK.el("spil-svarvalg");
        boks.innerHTML = "";
        for (i = 0; i < b.opgave.valg.length; i++) {
            var knap = document.createElement("button");
            knap.className = "spilknap";
            knap.type = "button";
            knap.textContent = b.opgave.valg[i];
            knap.setAttribute("data-nr", String(i));
            if (b.valgt === -1) {
                knap.addEventListener("click", function () {
                    mig.svar(parseInt(this.getAttribute("data-nr"), 10));
                });
            } else {
                knap.disabled = true;
                if (i === b.opgave.rigtig) knap.classList.add("rigtig");
                else if (i === b.valgt) knap.classList.add("forkert");
            }
            boks.appendChild(knap);
        }

        var naeste = NK.el("spil-naeste");
        if (b.valgt === -1) {
            NK.saetTekst("spil-svar", "");
            NK.saetKlasse("spil-svar", "besked");
            naeste.style.display = "none";
        } else {
            var traf = (b.valgt === b.opgave.rigtig);
            NK.saetTekst("spil-svar", (traf ? "Rigtigt. " : "Ikke helt. ") + b.opgave.forklaring);
            NK.saetKlasse("spil-svar", "besked " + (traf ? "god" : "skidt"));
            naeste.style.display = "";
            naeste.firstChild.textContent =
                b.nr >= SPOERGSMAAL_PR_BANE ? "Se resultatet" : "Næste spørgsmål";
        }
    };

    /* ----- Tegning ----------------------------------------------------------- */
    NK.SimSpil.prototype.tilpas = function () { this.l.tilpas(); };

    NK.SimSpil.prototype.opdater = function (dt) { this.atom.opdater(dt); };

    NK.SimSpil.prototype.nulstil = function () {
        for (var i = 0; i < this.baner.length; i++) this.baner[i] = nyBanestatus();
        NK.el("spil-bohr").hidden = true;
        this.vaelgBane(0);
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
        var b = this.baner[this.aktiv];

        if (b.faerdig) {
            var fuldtHus = (b.rigtige === SPOERGSMAAL_PR_BANE);
            NK.tekst(c, b.rigtige + " / " + SPOERGSMAAL_PR_BANE, cx, fuldtHus ? cy - 26 : cy, {
                font: "800 76px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#f2c53d"
            });
            if (fuldtHus) {
                NK.tekst(c, "♥", cx, cy + 46, {
                    font: "400 52px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#ff7b8a"
                });
            }
            return;
        }

        var o = b.opgave;
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
