/* =====================================================================
   sim_bord.js - fane 1: Byg salte

   Bordet er en sandkasse: laeg ioner paa, og se lynlaasen lukke, naar
   ladningerne gaar op. Formlen og navnet staar under bordet.

   Opgavekortet har én knap (se opgave.js). To slags opgaver skiftes:
     navn   -> byg stoffet, og vaelg den rigtige formel
     formel -> laeg ionerne, og vaelg det rigtige navn
   Opgaverne bruger det samme bord. Det er den samme handling, der
   traenes, bare med et facit.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    var RETNING = {
        navn: {
            trin: ["Find de to ioner", "Få ladningen til at gå op", "Vælg den rigtige formel"],
            valgKlasse: "valg"
        },
        formel: {
            trin: ["Læg ionerne på bordet", "Vælg det rigtige navn"],
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
        this.opgave = null;          /* null: sandkassen */
        this.retning = "navn";
        this.fase = null;            /* byg | valg | faerdig */
        this.knaptrin = "start";

        NK.el("byg-afstem").addEventListener("click", function () { mig.bord.afstem(); });
        NK.el("byg-navne").addEventListener("change", function () { mig.bord.saetNavne(this.checked); });
        NK.el("byg-ryd").addEventListener("click", function () { mig.nulstil(); });
        /* Tag saltet med over i vandfanen: den samme forbindelse, bare
           set nedefra. Hvad bliver der af ionerne, naar det opløses? */
        NK.el("byg-vand").addEventListener("click", function () {
            var b = mig.bord;
            if (!b.neutral()) return;
            NK.visFane("fane-vand");
            NK.sims["fane-vand"].haeldSalt(b.kat.id, b.an.id);
        });
        NK.el("bord-opgaveknap").addEventListener("click", function () { mig.opgaveKnap(); });
        NK.el("bord-afslut").addEventListener("click", function () { mig.visFrit(); });

        /* Kemichael (laerer.js): han tegnes paa bordets laerred, og et klik
           paa ham under praesentationen taeller med. */
        this.L = this.bord.l;
        this.tid = 0;
        NK.el("bord-spring").addEventListener("click", function () { mig.springIntro(); });
        this.L.canvas.addEventListener("click", function (e) {
            var r = mig.L.canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
            if (mig.laererIntroKlik && mig.laererIntroKlik(x, y)) return;
            if (mig.laererKlik) mig.laererKlik(x, y);
        });
        if (this.laererStart) this.laererStart();

        this.visFrit();
    };

    NK.SimBord.prototype.saetKnap = function (trin) {
        this.knaptrin = trin;
        NK.saetKnaptrin("bord-opgaveknap", trin);
    };

    /* ----- Sandkassen ------------------------------------------------------ */
    NK.SimBord.prototype.visFrit = function () {
        this.opgave = null;
        this.fase = null;
        this.svar.ryd();
        NK.el("byg-knapper").hidden = false;
        NK.el("bord-opgavetekst").hidden = false;
        NK.el("bord-prompt").hidden = true;
        NK.el("bord-trin").hidden = true;
        NK.el("bord-afslut").hidden = true;
        NK.saetHTML("bord-besked", "");
        NK.saetHTML("bord-hint", "");
        this.saetKnap("start");
        this.bord.laas(false);
        this.bord.visFormel = true;
        this.opdaterKnapper();
    };

    /* Bordet er aendret. Kemichael melder sig ogsaa ("laerer"); det er
       ikke bordet. */
    NK.SimBord.prototype.aendret = function (hvad) {
        if (hvad === "laerer") return;
        this.opdaterKnapper();
        if (this.opgave) this.tjek();
    };

    NK.SimBord.prototype.opdaterKnapper = function () {
        var b = this.bord;
        var begge = !!(b.kat && b.an);
        NK.el("byg-afstem").disabled = !begge || b.forkortet();
        NK.el("byg-vand").disabled = !b.neutral();
    };

    /* ----- Opgaverne -------------------------------------------------------- */
    NK.SimBord.prototype.opgaveKnap = function () {
        if (this.knaptrin === "hint") this.visHint();
        else if (this.knaptrin === "svar") this.visSvar();
        else this.nyOpgave();
    };

    /* De to retninger skiftes, saa eleven moeder begge veje. */
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
        this.fase = "byg";
        this.vist = false;
        this.svar.ryd();
        NK.el("byg-knapper").hidden = true;
        NK.el("bord-opgavetekst").hidden = true;
        NK.el("bord-prompt").hidden = false;
        NK.el("bord-trin").hidden = false;
        NK.el("bord-afslut").hidden = false;
        NK.saetTekst("bord-prompt", retning === "navn" ? salt.navn : salt.formel);
        NK.saetTekst("opgave-t1", r.trin[0]);
        NK.saetTekst("opgave-t2", r.trin[1]);
        NK.saetTekst("opgave-t3", r.trin[2] || "");
        NK.el("opgave-t3").hidden = !r.trin[2];
        NK.saetHTML("bord-besked", "");
        NK.saetHTML("bord-hint", "");
        this.saetKnap("hint");
        this.bord.laas(false);
        /* Formlen under bordet ville roebe svaret, mens opgaven er i gang. */
        this.bord.visFormel = false;
        this.bord.ryd();                   /* kalder aendret() -> tjek() */
    };

    NK.SimBord.prototype.besked = function (html, klasse) {
        NK.saetHTML("bord-besked", html || "");
        NK.saetKlasse("bord-besked", "besked" + (klasse ? " " + klasse : ""));
    };

    NK.SimBord.prototype.tjek = function () {
        if (!this.opgave || this.fase !== "byg") return;
        if (this.retning === "navn") this.tjekNavn();
        else this.tjekFormel();
    };

    /* Navnet er givet: er det de rigtige ioner, og gaar ladningen op? */
    NK.SimBord.prototype.tjekNavn = function () {
        var o = this.opgave, b = this.bord;
        var forkert = (b.kat && b.kat !== o.kat) ? b.kat : ((b.an && b.an !== o.an) ? b.an : null);
        var t1 = "aktiv", t2 = "";
        this.besked("");

        if (forkert) {
            t1 = "fejl";
            var maal = forkert.q > 0 ? o.kat : o.an;
            /* Uden navne paa hylden maa beskeden heller ikke roebe dem. */
            if (!b.navne) this.besked("<b>" + D.ionTekst(forkert) + "</b> er ikke den rigtige ion her.", "skidt");
            else this.besked("<b>" + D.ionTekst(forkert) + "</b> hedder " + D.ionNavn(forkert)
                + ". Du skal bruge " + D.ionNavn(maal) + ".", "skidt");
        } else if (b.kat && b.an) {
            t1 = "ok";
            t2 = "aktiv";
            if (b.neutral() && b.forkortet()) { this.tilValg(); return; }
            if (b.neutral()) this.besked("Lynlåsen er lukket, men der ligger flere ens enheder. Fjern nogle ioner.");
        }
        NK.saetTrin("opgave-t1", t1);
        NK.saetTrin("opgave-t2", t2);
        NK.saetTrin("opgave-t3", "");
    };

    /* Formlen er givet: hvilke ioner er den bygget af, og hvor mange? */
    NK.SimBord.prototype.tjekFormel = function () {
        var o = this.opgave, b = this.bord;
        var t1 = "aktiv";
        this.besked("");

        var fremmed = null;
        if (b.kat && b.kat.formel !== o.kat.formel) fremmed = b.kat;
        else if (b.an && b.an !== o.an) fremmed = b.an;

        if (fremmed) {
            t1 = "fejl";
            this.besked("<b>" + D.ionTekst(fremmed) + "</b> er ikke med i " + o.formel + ".", "skidt");
        } else if (b.kat && b.an) {
            var talPasser = b.nKat === o.p && b.nAn === o.n;
            if (talPasser && b.kat !== o.kat) {
                /* Rigtigt grundstof og rigtige tal, men forkert ladning. */
                t1 = "fejl";
                var former = D.KATIONER.filter(function (k) { return k.formel === o.kat.formel; }).map(D.ionTekst);
                this.besked("Tallene passer med formlen, men ladningen går ikke op. "
                    + NK.stort(o.kat.grund) + " findes både som " + former.join(" og ") + ".", "skidt");
            } else if (talPasser) {
                this.tilValg();
                return;
            } else if (b.neutral()) {
                this.besked("Lynlåsen er lukket, men tallene passer ikke med <b>" + o.formel + "</b>.");
            }
        }
        NK.saetTrin("opgave-t1", t1);
        NK.saetTrin("opgave-t2", "");
    };

    /* Bordet er rigtigt. Nu skal der vaelges formel eller navn. */
    NK.SimBord.prototype.tilValg = function () {
        var r = RETNING[this.retning], o = this.opgave;
        this.fase = "valg";
        this.bord.laas(true);
        if (this.retning === "navn") {
            NK.saetTrin("opgave-t1", "ok");
            NK.saetTrin("opgave-t2", "ok");
            NK.saetTrin("opgave-t3", "aktiv");
            this.svar.vis(D.formelValg(o.kat, o.an));
        } else {
            NK.saetTrin("opgave-t1", "ok");
            NK.saetTrin("opgave-t2", "aktiv");
            this.svar.vis(D.navneValg(o.kat, o.an));
        }
        NK.el("opgave-valg").className = r.valgKlasse;
        this.besked("Ionerne passer, og ladningen går op.", "god");
    };

    NK.SimBord.prototype.svaret = function (v, rigtig) {
        this.besked((rigtig ? "<b>Rigtigt.</b> " : "") + v.forklaring, rigtig ? "god" : "skidt");
        if (rigtig) this.afslut(true);
        else NK.saetTrin(this.retning === "navn" ? "opgave-t3" : "opgave-t2", "fejl");
    };

    /* Hintet passer til det sted i opgaven, eleven sidder fast. */
    NK.SimBord.prototype.hint = function () {
        var o = this.opgave, b = this.bord;
        if (this.retning === "navn") {
            if (this.fase === "valg") {
                var grp = (o.an.sammensat && o.n > 1) || (o.kat.sammensat && o.p > 1);
                return grp ? "Er der flere af en sammensat ion, skal den i parentes. Tallet efter parentesen gælder hele ionen."
                    : "Tæl kortene på bordet. Antallet af hver ion bliver til det lille tal.";
            }
            if (b.kat !== o.kat || b.an !== o.an) {
                return NK.stort(o.kat.navn) + " er " + D.ionTekst(o.kat) + ". " + NK.stort(o.an.navn) + " er " + D.ionTekst(o.an) + ".";
            }
            return "Giv den korteste række én ion mere, til lynlåsen lukker.";
        }
        if (this.fase === "valg") {
            return "Den positive ion nævnes først, uden endelsen -ion."
                + (o.kat.variabel ? " Ladningen på " + o.kat.grund + " skrives med romertal." : "");
        }
        if (b.kat && b.an && b.kat.formel === o.kat.formel && b.an === o.an && b.nKat === o.p && b.nAn === o.n) {
            return o.n + " " + D.ionTekst(o.an) + " giver " + NK.fortegn(o.n * o.an.q)
                + ". Hvilken ladning skal " + (o.p > 1 ? "hver af de " + o.p + " positive ioner" : "den positive ion") + " så have?";
        }
        return o.formel + " er " + o.p + " " + o.kat.formel + " og " + o.n + " " + o.an.formel
            + ". Tallene er antallet af hver ion.";
    };

    NK.SimBord.prototype.visHint = function () {
        if (!this.opgave || this.fase === "faerdig") return;
        NK.saetHTML("bord-hint", "<b>Hint:</b> " + this.hint());
        this.saetKnap("svar");
    };

    NK.SimBord.prototype.visSvar = function () {
        if (!this.opgave || this.fase === "faerdig") return;
        this.vist = true;
        var o = this.opgave;
        if (this.fase === "byg") {
            this.bord.laas(false);
            this.bord.saet(o.kat, o.p, o.an, o.n);     /* -> tjek() -> tilValg() */
        }
        this.svar.visRigtig();
        var r = this.svar.rigtig();
        this.besked(r ? r.forklaring : "", "gul");
        this.afslut(false);
    };

    NK.SimBord.prototype.afslut = function (loest) {
        this.fase = "faerdig";
        this.bord.visFormel = true;      /* nu maa formlen gerne staa under bordet */
        NK.saetTrin("opgave-t1", "ok");
        NK.saetTrin("opgave-t2", "ok");
        NK.saetTrin("opgave-t3", "ok");
        if (loest && !this.vist) {
            this.loeste++;
            NK.saetTekst("bord-loest", String(this.loeste));
        }
        this.saetKnap("ny");
    };

    /* ----- Faneskift, tegning og tastatur ----------------------------------- */
    NK.SimBord.prototype.tilpas = function () { this.bord.tilpas(); };

    NK.SimBord.prototype.opdater = function (dt) {
        this.tid += dt;
        this.bord.opdater(dt);
        if (this.opdaterIntro) this.opdaterIntro(dt);
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        var note = this.bord.note(), el = NK.el("bord-note");
        NK.saetHTML("bord-note", note);
        el.hidden = !note;
        if (note && this.bord.g) el.style.top = Math.round(this.bord.g.y1 - 6) + "px";
    };

    NK.SimBord.prototype.tegn = function () {
        this.bord.tegn();
        if (this.laererTegnOver) this.laererTegnOver(this.L.ctx);
    };

    /* R og Ryd: ryd bordet, eller start den samme opgave forfra. */
    NK.SimBord.prototype.nulstil = function () {
        if (this.opgave) this.startOpgave(this.opgave, this.retning);
        else this.bord.ryd();
    };
}());
