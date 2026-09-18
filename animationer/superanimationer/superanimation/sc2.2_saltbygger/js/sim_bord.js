/* =====================================================================
   sim_bord.js - fane 1: Byg salte

   Ét arbejdsbord med to tilstande, saa eleven ikke skal skifte fane for
   at gaa fra at proeve sig frem til at blive hoert:

     Byg frit   sandkassen: laeg ioner paa bordet, og se formlen, navnet,
                atomerne og ladningsregnskabet.
     Opgaver    to slags opgaver paa skift:
                  navn   -> byg stoffet, og vaelg den rigtige formel
                  formel -> laeg ionerne, og vaelg det rigtige navn

   Opgaverne deler bord, hylder og lynlaas med sandkassen. Det er den
   samme handling, der traenes - bare med et facit.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    /* De to opgaveretninger. Teksterne staar samlet her, saa resten af
       filen kun handler om, hvad der sker. */
    var RETNING = {
        navn: {
            overskrift: "Byg stoffet",
            trin: ["Find de to ioner", "Få ladningen til at gå op", "Vælg den rigtige formel"],
            valgOverskrift: "Hvordan skrives formlen?",
            valgKlasse: "valg"
        },
        formel: {
            overskrift: "Hvad er det for et stof?",
            trin: ["Læg ionerne på bordet", "Vælg det rigtige navn"],
            valgOverskrift: "Hvad hedder stoffet?",
            valgKlasse: "valg navne"
        }
    };

    NK.SimBord = function () {
        var mig = this;
        this.bord = new NK.Bord(NK.el("bord-scene"), {
            visFormel: true,
            lyt: function (hvad) { if (hvad === "aendret") mig.aendret(); }
        });
        this.svar = new NK.Svarknapper(NK.el("opgave-valg"), function (v, rigtig) { mig.svaret(v, rigtig); });
        this.vaelgere = {
            navn: new NK.Opgavevaelger(D.NAVN_OPGAVER, 6),
            formel: new NK.Opgavevaelger(D.FORMEL_OPGAVER, 8)
        };
        this.loeste = 0;
        this.nr = 0;
        this.opgave = null;
        this.retning = "navn";
        this.fase = "byg";
        this.status = null;
        this.svaerhedsgrad = "let";  /* let: navne vises · svær: alle navne skjules */

        NK.el("tilstand-frit").addEventListener("click", function () { mig.saetTilstand("frit"); });
        NK.el("tilstand-opgave").addEventListener("click", function () { mig.saetTilstand("opgave"); });
        NK.el("svaerhed-let").addEventListener("click", function () { mig.saetSvaerhed("let"); });
        NK.el("svaerhed-svaer").addEventListener("click", function () { mig.saetSvaerhed("svaer"); });
        NK.el("byg-afstem").addEventListener("click", function () { mig.bord.afstem(); });
        NK.el("byg-navne").addEventListener("change", function () { mig.bord.saetNavne(this.checked); });
        NK.el("byg-ryd").addEventListener("click", function () {
            if (mig.tilstand === "opgave" && mig.opgave && mig.fase !== "byg") mig.startOpgave(mig.opgave, mig.retning);
            else mig.bord.ryd();
        });
        /* Tag saltet med over i vandfanen - den samme forbindelse, bare
           set nedefra: hvad bliver der af ionerne, naar det opløses? */
        NK.el("byg-vand").addEventListener("click", function () {
            var b = mig.bord;
            if (!b.neutral()) return;
            NK.visFane("fane-vand");
            NK.sims["fane-vand"].haeldSalt(b.kat.id, b.an.id);
        });
        NK.el("opgave-ny").addEventListener("click", function () { mig.nyOpgave(); });
        NK.el("opgave-vis").addEventListener("click", function () { mig.visSvar(); });

        this.saetTilstand("frit");
    };

    /* ----- De to tilstande -------------------------------------------------- */
    NK.SimBord.prototype.saetTilstand = function (t) {
        var opgave = t === "opgave";
        this.tilstand = t;
        NK.el("tilstand-frit").classList.toggle("aktiv", !opgave);
        NK.el("tilstand-opgave").classList.toggle("aktiv", opgave);
        NK.el("svaerhed-valg").hidden = !opgave;
        NK.el("byg-navne-label").hidden = opgave;
        NK.el("frit-formelkort").hidden = opgave;
        NK.el("frit-regnskab").hidden = opgave;
        NK.el("frit-knapper").hidden = opgave;
        NK.el("opgave-kort").hidden = !opgave;
        NK.el("opgave-knapper").hidden = !opgave;

        if (opgave) {
            /* Sværhedsgraden bestemmer alene, om navnene vises i denne
               tilstand - den almindelige "vis navne"-boks er skjult. */
            this.bord.saetNavne(this.svaerhedsgrad === "let");
            /* En opgave, der ikke er færdig, tages op igen — ellers en ny. */
            if (this.opgave && this.fase !== "faerdig") this.startOpgave(this.opgave, this.retning);
            else this.nyOpgave();
        } else {
            NK.el("opgave-valgkort").hidden = true;
            this.svar.ryd();
            this.bord.laas(false);
            this.bord.visFormel = true;
            this.bord.saetNavne(NK.el("byg-navne").checked);
            this.status = null;
            this.opdaterPanel();
        }
    };

    /* Let: alle navne staar paa hylden, som normalt. Svær: alle navne
       forsvinder paa én gang - eleven skal kunne ionerne paa formlen
       og ladningen alene. */
    NK.SimBord.prototype.saetSvaerhed = function (grad) {
        this.svaerhedsgrad = grad;
        NK.el("svaerhed-let").classList.toggle("aktiv", grad === "let");
        NK.el("svaerhed-svaer").classList.toggle("aktiv", grad === "svaer");
        if (this.tilstand === "opgave") this.bord.saetNavne(grad === "let");
    };

    NK.SimBord.prototype.aendret = function () {
        this.opdaterPanel();
        if (this.tilstand === "opgave") this.tjek();
    };

    /* ----- Sandkassens panel ------------------------------------------------ */
    NK.SimBord.prototype.opdaterPanel = function () {
        var b = this.bord;
        var p = b.plus(), m = b.minus(), sum = p - m;
        var begge = !!(b.kat && b.an);

        /* Regnskabet - det samme som lynlåsen viser, bare i tal. */
        NK.saetHTML("byg-l-kat", b.kat ? b.nKat + " × " + D.ionTekst(b.kat) : "Ingen positive ioner");
        NK.saetTekst("byg-q-kat", p ? p + "+" : "0");
        NK.saetHTML("byg-l-an", b.an ? b.nAn + " × " + D.ionTekst(b.an) : "Ingen negative ioner");
        NK.saetTekst("byg-q-an", m ? m + "−" : "0");
        NK.saetTekst("byg-q-sum", begge && sum === 0 ? "0  ✓" : NK.fortegn(sum));
        NK.saetKlasse("byg-q-sum", "tal " + (sum > 0 ? "roed" : (sum < 0 ? "blaa" : (begge ? "groen" : ""))));

        /* Formlen - kun når ladningen går op. */
        var note = "";
        if (b.neutral()) {
            var g = NK.gcd(b.nKat, b.nAn), pp = b.nKat / g, nn = b.nAn / g;
            NK.saetHTML("byg-formel", D.formelHTML(b.kat, b.an, pp, nn));
            NK.saetTekst("byg-navn", D.saltnavn(b.kat, b.an));
            NK.saetTekst("byg-atomer", "Atomer: " + D.atomTekst(D.atomtal(b.kat, pp, b.an, nn)));
            if (g > 1) note = "På bordet ligger " + g + " formelenheder. Formlen viser kun én.";
            var findes = D.findesIkke(b.kat, b.an);
            if (findes) note = (note ? note + " " : "") + findes;
        } else {
            NK.saetHTML("byg-formel", '<span class="ukendt">?</span>');
            NK.saetTekst("byg-navn", begge ? "Ladningen går ikke op endnu" : "Vælg en positiv og en negativ ion");
            NK.saetTekst("byg-atomer", "");
        }
        NK.saetTekst("byg-note", note);
        NK.el("byg-note").hidden = !note;

        NK.el("byg-afstem").disabled = !begge || (b.neutral() && b.forkortet());
        NK.el("byg-vand").disabled = !b.neutral();

        /* Et lille glimt, når lynlåsen lige er lukket. */
        var neutral = b.neutral();
        if (neutral && !this.varNeutral) {
            var e = NK.el("byg-formelvis");
            e.classList.remove("ny");
            void e.offsetWidth;
            e.classList.add("ny");
        }
        this.varNeutral = neutral;
    };

    /* ----- Opgaverne -------------------------------------------------------- */
    /* De to retninger skiftes, så eleven møder begge veje. */
    NK.SimBord.prototype.nyOpgave = function () {
        var retning = this.nr % 2 === 0 ? "navn" : "formel";
        var o;
        this.nr++;
        if (retning === "navn") o = this.vaelgere.navn.naeste(this.loeste < 2 ? 1 : (this.loeste < 6 ? 2 : 3));
        else o = this.vaelgere.formel.naeste();
        this.startOpgave(D.salt(o.kat, o.an), retning);
    };

    NK.SimBord.prototype.startOpgave = function (salt, retning) {
        var r = RETNING[retning];
        this.opgave = salt;
        this.retning = retning;
        this.fase = "byg";                 /* byg | valg | faerdig */
        this.vist = false;
        this.status = null;
        this.svar.ryd();
        NK.el("opgave-valgkort").hidden = true;
        NK.saetTekst("opgave-overskrift", r.overskrift);
        NK.saetTekst("opgave-prompt", retning === "navn" ? salt.navn : salt.formel);
        NK.saetTekst("opgave-t1", r.trin[0]);
        NK.saetTekst("opgave-t2", r.trin[1]);
        NK.saetTekst("opgave-t3", r.trin[2] || "");
        NK.el("opgave-t3").hidden = !r.trin[2];
        NK.saetHTML("opgave-svar", "");
        NK.el("opgave-ny").classList.remove("banker");
        NK.el("opgave-vis").disabled = false;
        this.bord.laas(false);
        /* Formlen under bordet ville røbe svaret, mens opgaven er i gang. */
        this.bord.visFormel = false;
        this.bord.ryd();                   /* kalder aendret() -> tjek() */
        this.visStatus();
    };

    NK.SimBord.prototype.tjek = function () {
        if (!this.opgave || this.fase !== "byg") return;
        if (this.retning === "navn") this.tjekNavn();
        else this.tjekFormel();
    };

    /* Navnet er givet: er det de rigtige ioner, og går ladningen op? */
    NK.SimBord.prototype.tjekNavn = function () {
        var o = this.opgave, b = this.bord;
        var forkert = (b.kat && b.kat !== o.kat) ? b.kat : ((b.an && b.an !== o.an) ? b.an : null);
        var t1 = "aktiv", t2 = "";
        this.status = null;

        if (forkert) {
            t1 = "fejl";
            var maal = forkert.q > 0 ? o.kat : o.an;
            /* I "svær" skal navnet ikke stå i beskeden heller - det ville
               jo bare afsløre det, chippen selv holder skjult. */
            this.status = this.svaerhedsgrad === "svaer"
                ? "<b>" + D.ionTekst(forkert) + "</b> er ikke den rigtige ion her."
                : "<b>" + D.ionTekst(forkert) + "</b> hedder " + D.ionNavn(forkert)
                    + " — du skal bruge " + D.ionNavn(maal) + ".";
        } else if (b.kat && b.an) {
            t1 = "ok";
            t2 = "aktiv";
            if (b.neutral() && b.forkortet()) { this.tilValg(); return; }
        }
        NK.saetTrin("opgave-t1", t1);
        NK.saetTrin("opgave-t2", t2);
        NK.saetTrin("opgave-t3", "");
    };

    /* Formlen er givet: hvilke ioner er den bygget af - og hvor mange? */
    NK.SimBord.prototype.tjekFormel = function () {
        var o = this.opgave, b = this.bord;
        var t1 = "aktiv";
        this.status = null;

        var fremmed = null;
        if (b.kat && b.kat.formel !== o.kat.formel) fremmed = b.kat;
        else if (b.an && b.an !== o.an) fremmed = b.an;

        if (fremmed) {
            t1 = "fejl";
            this.status = "<b>" + D.ionTekst(fremmed) + "</b> er ikke med i " + o.formel + ".";
        } else if (b.kat && b.an) {
            var talPasser = b.nKat === o.p && b.nAn === o.n;
            if (!talPasser) {
                this.status = "Tæl efter: hvor mange af hver ion står der i <b>" + o.formel + "</b>?";
            } else if (b.kat !== o.kat) {
                /* Rigtigt grundstof og rigtige tal, men forkert ladning. */
                t1 = "fejl";
                var former = D.KATIONER.filter(function (k) { return k.formel === o.kat.formel; }).map(D.ionTekst);
                this.status = "Tallene passer med formlen, men ladningen går ikke op. "
                    + NK.stort(o.kat.grund) + " findes både som " + former.join(" og ") + ".";
            } else {
                this.tilValg();
                return;
            }
        }
        NK.saetTrin("opgave-t1", t1);
        NK.saetTrin("opgave-t2", "");
    };

    /* Bordet er rigtigt - nu skal der vælges formel eller navn. */
    NK.SimBord.prototype.tilValg = function () {
        var r = RETNING[this.retning], o = this.opgave;
        this.fase = "valg";
        this.bord.laas(true);
        if (this.retning === "navn") {
            NK.saetTrin("opgave-t1", "ok");
            NK.saetTrin("opgave-t2", "ok");
            NK.saetTrin("opgave-t3", "aktiv");
            this.svar.vis(D.formelValg(o.kat, o.an));
            this.status = "Ionerne passer, og ladningen går op. <b>Vælg nu den rigtige formel.</b>";
        } else {
            NK.saetTrin("opgave-t1", "ok");
            NK.saetTrin("opgave-t2", "aktiv");
            this.svar.vis(D.navneValg(o.kat, o.an));
            this.status = "Rigtigt: " + o.p + " " + D.ionTekst(o.kat) + " og " + o.n + " " + D.ionTekst(o.an)
                + ". <b>Hvad hedder stoffet?</b>";
        }
        NK.el("opgave-valg").className = r.valgKlasse;
        NK.saetTekst("opgave-valg-overskrift", r.valgOverskrift);
        NK.el("opgave-valgkort").hidden = false;
        NK.saetHTML("opgave-svar", "");
        NK.saetKlasse("opgave-svar", "besked");
    };

    NK.SimBord.prototype.svaret = function (v, rigtig) {
        NK.saetHTML("opgave-svar", (rigtig ? "<b>Rigtigt.</b> " : "") + v.forklaring);
        NK.saetKlasse("opgave-svar", "besked " + (rigtig ? "god" : "skidt"));
        if (rigtig) this.afslut(true);
        else NK.saetTrin(this.retning === "navn" ? "opgave-t3" : "opgave-t2", "fejl");
    };

    NK.SimBord.prototype.visSvar = function () {
        if (this.fase === "faerdig") return;
        this.vist = true;
        var o = this.opgave;
        if (this.fase === "byg") {
            this.bord.laas(false);
            this.bord.saet(o.kat, o.p, o.an, o.n);     /* -> tjek() -> tilValg() */
        }
        this.svar.visRigtig();
        var r = this.svar.rigtig();
        NK.saetHTML("opgave-svar", r ? r.forklaring : "");
        NK.saetKlasse("opgave-svar", "besked gul");
        this.afslut(false);
    };

    NK.SimBord.prototype.afslut = function (loest) {
        var o = this.opgave;
        this.fase = "faerdig";
        this.bord.visFormel = true;      /* nu må formlen gerne stå under bordet */
        NK.saetTrin(this.retning === "navn" ? "opgave-t3" : "opgave-t2", "ok");
        if (loest && !this.vist) {
            this.loeste++;
            NK.saetTekst("opgave-loest", String(this.loeste));
        }
        NK.el("opgave-ny").classList.add("banker");
        NK.el("opgave-vis").disabled = true;
        this.status = (loest ? "Flot! " : "") + "<b>" + o.formel + "</b> "
            + (this.retning === "navn" ? "er " : "hedder ") + o.navn + ".";
    };

    /* ----- Faneskift, tegning og tastatur ----------------------------------- */
    NK.SimBord.prototype.visStatus = function () {
        NK.saetHTML("bord-status", this.status || this.bord.beskriv());
    };

    NK.SimBord.prototype.tilpas = function () { this.bord.tilpas(); };

    NK.SimBord.prototype.opdater = function (dt) {
        this.bord.opdater(dt);
        this.visStatus();
    };

    NK.SimBord.prototype.tegn = function () { this.bord.tegn(); };

    /* R: ryd bordet — eller start den samme opgave forfra. */
    NK.SimBord.prototype.nulstil = function () {
        if (this.tilstand === "opgave" && this.opgave) this.startOpgave(this.opgave, this.retning);
        else this.bord.ryd();
    };
}());
