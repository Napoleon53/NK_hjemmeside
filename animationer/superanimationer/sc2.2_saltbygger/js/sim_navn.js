/* =====================================================================
   sim_navn.js - fane 2: Fra navn til formel

   Eleven faar et navn, fx aluminiumsulfat, og skal
     1. finde de to ioner paa hylderne,
     2. faa lynlaasen til at lukke - og
     3. vaelge den rigtige skrivemaade blandt fire formler.
   Trin 1 og 2 tjekkes hele tiden, mens der bygges. I trin 3 er de
   forkerte formler typiske fejl, og hver har sin egen forklaring.
   Opgaverne bliver svaerere, efterhaanden som eleven loeser dem.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    NK.SimNavn = function () {
        var mig = this;
        this.bord = new NK.Bord(NK.el("navn-scene"), {
            navne: false,
            lyt: function (hvad) { if (hvad === "aendret") mig.tjek(); }
        });
        this.svar = new NK.Svarknapper(NK.el("navn-valg"), function (v, rigtig) { mig.svaret(v, rigtig); });
        this.vaelger = new NK.Opgavevaelger(D.NAVN_OPGAVER, 6);
        this.loeste = 0;
        this.status = null;

        NK.el("navn-ny").addEventListener("click", function () { mig.nyOpgave(); });
        NK.el("navn-vis").addEventListener("click", function () { mig.visSvar(); });
        NK.el("navn-navne").addEventListener("change", function () { mig.bord.saetNavne(this.checked); });
        this.nyOpgave();
    };

    NK.SimNavn.prototype.nyOpgave = function () {
        var maks = this.loeste < 2 ? 1 : (this.loeste < 5 ? 2 : 3);
        var o = this.vaelger.naeste(maks);
        this.startOpgave(D.salt(o.kat, o.an));
    };

    NK.SimNavn.prototype.startOpgave = function (salt) {
        this.opgave = salt;
        this.fase = "byg";                 /* byg | skriv | faerdig */
        this.vist = false;
        this.status = null;
        this.svar.ryd();
        NK.el("navn-valgkort").hidden = true;
        NK.saetTekst("navn-prompt", salt.navn);
        NK.saetHTML("navn-svar", "");
        NK.el("navn-ny").classList.remove("banker");
        NK.el("navn-vis").disabled = false;
        this.bord.laas(false);
        this.bord.ryd();                   /* kalder tjek() */
    };

    /* Trin 1 og 2 - kaldes efter hver aendring paa bordet. */
    NK.SimNavn.prototype.tjek = function () {
        if (!this.opgave || this.fase !== "byg") return;
        var o = this.opgave, b = this.bord;
        var forkert = (b.kat && b.kat !== o.kat) ? b.kat : ((b.an && b.an !== o.an) ? b.an : null);
        var t1 = "aktiv", t2 = "";
        this.status = null;

        if (forkert) {
            t1 = "fejl";
            var maal = forkert.q > 0 ? o.kat : o.an;
            this.status = "<b>" + D.ionTekst(forkert) + "</b> hedder " + D.ionNavn(forkert)
                + " — du skal bruge " + D.ionNavn(maal) + ".";
        } else if (b.kat && b.an) {
            t1 = "ok";
            t2 = "aktiv";
            if (b.neutral() && b.forkortet()) { this.tilSkriv(); return; }
        }
        NK.saetTrin("navn-t1", t1);
        NK.saetTrin("navn-t2", t2);
        NK.saetTrin("navn-t3", "");
    };

    /* Trin 3: ionerne og antallet er rigtige - nu skal formlen skrives. */
    NK.SimNavn.prototype.tilSkriv = function () {
        this.fase = "skriv";
        this.bord.laas(true);
        NK.saetTrin("navn-t1", "ok");
        NK.saetTrin("navn-t2", "ok");
        NK.saetTrin("navn-t3", "aktiv");
        this.svar.vis(D.formelValg(this.opgave.kat, this.opgave.an));
        NK.el("navn-valgkort").hidden = false;
        NK.saetHTML("navn-svar", "");
        NK.saetKlasse("navn-svar", "besked");
        this.status = "Ionerne passer, og ladningen går op. <b>Vælg nu den rigtige formel.</b>";
    };

    NK.SimNavn.prototype.svaret = function (v, rigtig) {
        NK.saetHTML("navn-svar", (rigtig ? "<b>Rigtigt.</b> " : "") + v.forklaring);
        NK.saetKlasse("navn-svar", "besked " + (rigtig ? "god" : "skidt"));
        if (rigtig) this.afslut(true);
        else NK.saetTrin("navn-t3", "fejl");
    };

    NK.SimNavn.prototype.visSvar = function () {
        if (this.fase === "faerdig") return;
        this.vist = true;
        var o = this.opgave;
        if (this.fase === "byg") {
            this.bord.laas(false);
            this.bord.saet(o.kat, o.p, o.an, o.n);     /* -> tjek() -> tilSkriv() */
        }
        this.svar.visRigtig();
        var r = this.svar.rigtig();
        NK.saetHTML("navn-svar", r ? r.forklaring : "");
        NK.saetKlasse("navn-svar", "besked gul");
        this.afslut(false);
    };

    NK.SimNavn.prototype.afslut = function (loest) {
        var o = this.opgave;
        this.fase = "faerdig";
        NK.saetTrin("navn-t3", "ok");
        if (loest && !this.vist) {
            this.loeste++;
            NK.saetTekst("navn-loest", String(this.loeste));
        }
        NK.el("navn-ny").classList.add("banker");
        NK.el("navn-vis").disabled = true;
        this.status = (loest ? "Flot! " : "") + "<b>" + o.formel + "</b> er " + o.navn + ".";
    };

    NK.SimNavn.prototype.tilpas = function () { this.bord.tilpas(); };

    NK.SimNavn.prototype.opdater = function (dt) {
        this.bord.opdater(dt);
        NK.saetHTML("navn-status", this.status || this.bord.beskriv());
    };

    NK.SimNavn.prototype.tegn = function () { this.bord.tegn(); };

    /* R: samme opgave forfra. */
    NK.SimNavn.prototype.nulstil = function () { this.startOpgave(this.opgave); };
}());
