/* =====================================================================
   sim_formel.js - fane 3: Fra formel til navn

   Den anden vej rundt. Eleven faar en formel, fx Fe₂(SO₄)₃, og skal
     1. laegge de ioner paa bordet, som formlen er bygget af - i det
        antal, formlen siger - og
     2. vaelge det rigtige navn.
   Pointen er jern og kobber: hylden har baade Fe²⁺ og Fe³⁺, og det er
   lynlaasen, der afsloerer, hvilken der passer. Med to Fe²⁺ og tre
   SO₄²⁻ lukker den ikke - saa maa det vaere Fe³⁺, og stoffet hedder
   jern(III)sulfat.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    NK.SimFormel = function () {
        var mig = this;
        this.bord = new NK.Bord(NK.el("formel-scene"), {
            navne: false,
            lyt: function (hvad) { if (hvad === "aendret") mig.tjek(); }
        });
        this.svar = new NK.Svarknapper(NK.el("formel-valg"), function (v, rigtig) { mig.svaret(v, rigtig); });
        this.vaelger = new NK.Opgavevaelger(D.FORMEL_OPGAVER, 8);
        this.loeste = 0;
        this.status = null;

        NK.el("formel-ny").addEventListener("click", function () { mig.nyOpgave(); });
        NK.el("formel-vis").addEventListener("click", function () { mig.visSvar(); });
        NK.el("formel-navne").addEventListener("change", function () { mig.bord.saetNavne(this.checked); });
        this.nyOpgave();
    };

    NK.SimFormel.prototype.nyOpgave = function () {
        var o = this.vaelger.naeste();
        this.startOpgave(D.salt(o.kat, o.an));
    };

    NK.SimFormel.prototype.startOpgave = function (salt) {
        this.opgave = salt;
        this.fase = "byg";                 /* byg | navn | faerdig */
        this.vist = false;
        this.status = null;
        this.svar.ryd();
        NK.el("formel-valgkort").hidden = true;
        NK.saetTekst("formel-prompt", salt.formel);
        NK.saetHTML("formel-svar", "");
        NK.el("formel-ny").classList.remove("banker");
        NK.el("formel-vis").disabled = false;
        this.bord.laas(false);
        this.bord.ryd();                   /* kalder tjek() */
        this.visStatus();
    };

    NK.SimFormel.prototype.tjek = function () {
        if (!this.opgave || this.fase !== "byg") return;
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
                this.tilNavn();
                return;
            }
        }
        NK.saetTrin("formel-t1", t1);
        NK.saetTrin("formel-t2", "");
    };

    NK.SimFormel.prototype.tilNavn = function () {
        var o = this.opgave;
        this.fase = "navn";
        this.bord.laas(true);
        NK.saetTrin("formel-t1", "ok");
        NK.saetTrin("formel-t2", "aktiv");
        this.svar.vis(D.navneValg(o.kat, o.an));
        NK.el("formel-valgkort").hidden = false;
        NK.saetHTML("formel-svar", "");
        NK.saetKlasse("formel-svar", "besked");
        this.status = "Rigtigt: " + o.p + " " + D.ionTekst(o.kat) + " og " + o.n + " " + D.ionTekst(o.an)
            + ". <b>Hvad hedder stoffet?</b>";
    };

    NK.SimFormel.prototype.svaret = function (v, rigtig) {
        NK.saetHTML("formel-svar", (rigtig ? "<b>Rigtigt.</b> " : "") + v.forklaring);
        NK.saetKlasse("formel-svar", "besked " + (rigtig ? "god" : "skidt"));
        if (rigtig) this.afslut(true);
        else NK.saetTrin("formel-t2", "fejl");
    };

    NK.SimFormel.prototype.visSvar = function () {
        if (this.fase === "faerdig") return;
        this.vist = true;
        var o = this.opgave;
        if (this.fase === "byg") {
            this.bord.laas(false);
            this.bord.saet(o.kat, o.p, o.an, o.n);     /* -> tjek() -> tilNavn() */
        }
        this.svar.visRigtig();
        var r = this.svar.rigtig();
        NK.saetHTML("formel-svar", r ? r.forklaring : "");
        NK.saetKlasse("formel-svar", "besked gul");
        this.afslut(false);
    };

    NK.SimFormel.prototype.afslut = function (loest) {
        var o = this.opgave;
        this.fase = "faerdig";
        NK.saetTrin("formel-t2", "ok");
        if (loest && !this.vist) {
            this.loeste++;
            NK.saetTekst("formel-loest", String(this.loeste));
        }
        NK.el("formel-ny").classList.add("banker");
        NK.el("formel-vis").disabled = true;
        this.status = (loest ? "Flot! " : "") + "<b>" + o.formel + "</b> hedder " + o.navn + ".";
    };

    NK.SimFormel.prototype.tilpas = function () { this.bord.tilpas(); };

    /* Statuslinjen: opgavens egen besked, ellers bordets. */
    NK.SimFormel.prototype.visStatus = function () {
        NK.saetHTML("formel-status", this.status || this.bord.beskriv());
    };

    NK.SimFormel.prototype.opdater = function (dt) {
        this.bord.opdater(dt);
        this.visStatus();
    };

    NK.SimFormel.prototype.tegn = function () { this.bord.tegn(); };

    NK.SimFormel.prototype.nulstil = function () { this.startOpgave(this.opgave); };
}());
