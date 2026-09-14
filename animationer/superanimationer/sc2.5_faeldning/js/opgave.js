/* =====================================================================
   opgave.js - kortet "Reaktionsskema" i panelet

   For hvert felt med bundfald skal eleven opskrive fældningsreaktionen:
   vaelge de to ioner fra draaben, der danner bundfaldet, og de
   koefficienter, der faar ladningerne til at gaa op.

   Der er ingen forklaring foer opgaven. Svarer eleven forkert, kommer
   et hint, der passer til netop den fejl:
     forkert ion        peger paa et felt i skemaet med samme ion og
                        intet bundfald, eller paa luppen
     forkerte tal       regner ladningerne ud for de valgte tal
   Efter to forkerte svar kan eleven faa svaret vist. Et vist svar
   taeller ikke med, og feltet kan proeves igen senere.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    var MAKS_KOEF = 3;

    NK.Opgave = function (forsoeg) {
        this.f = forsoeg;
        this.felt = -2;
        this.nulstilBygger();
        this.ANTAL = D.FELTER.filter(function (F) { return D.forventet(F).bundfald.length > 0; }).length;

        var mig = this;
        NK.el("opg-k1").addEventListener("click", function () { mig.skiftKoef("kKat"); });
        NK.el("opg-k2").addEventListener("click", function () { mig.skiftKoef("kAn"); });
        NK.el("opg-tjek").addEventListener("click", function () { mig.tjek(); });
        NK.el("opg-svar").addEventListener("click", function () { mig.visSvar(); });
        NK.el("opg-naeste").addEventListener("click", function () { mig.naeste(); });
    };

    var O = NK.Opgave.prototype;

    O.nulstilBygger = function () {
        this.kat = null;
        this.an = null;
        this.kKat = 1;
        this.kAn = 1;
        this.fejl = 0;
        this.laast = false;
        this.besked = null;       /* { tekst, slags } */
    };

    O.antalLoest = function () {
        return this.f.sider.skema.filter(function (f) { return f.loest; }).length;
    };

    O.rigtig = function () {
        return this.f.felter[this.felt].analyse.bundfald[0];
    };

    /* ----- Indgreb ------------------------------------------------------ */
    O.vaelgIon = function (id) {
        if (this.laast) return;
        if (D.IONER[id].q > 0) this.kat = this.kat === id ? null : id;
        else this.an = this.an === id ? null : id;
        this.besked = null;
        this.vis(true);
    };

    O.skiftKoef = function (hvilken) {
        if (this.laast) return;
        this[hvilken] = this[hvilken] % MAKS_KOEF + 1;
        this.besked = null;
        this.vis(true);
    };

    /* Returnerer true, naar svaret er rigtigt. */
    O.tjek = function () {
        if (this.laast || this.felt < 0 || this.f.status(this.felt) !== "bundfald") return false;
        if (!this.kat || !this.an) {
            this.besked = { tekst: "Vælg en positiv og en negativ ion fra dråben.", slags: "skidt" };
            this.vis(true);
            return false;
        }
        var b = this.rigtig();
        var k = D.koefficienter(b.kat, b.an);
        if (this.kat === b.kat && this.an === b.an && this.kKat === k.kat && this.kAn === k.an) {
            this.f.felter[this.felt].loest = true;
            this.laast = true;
            this.besked = { tekst: "Rigtigt. " + this.efterskrift(), slags: "god" };
            this.f.aendret("loest");
            this.vis(true);
            return true;
        }
        this.fejl++;
        this.besked = { tekst: this.hint(), slags: "skidt" };
        this.vis(true);
        return false;
    };

    O.visSvar = function () {
        if (this.laast) return;
        var b = this.rigtig();
        var k = D.koefficienter(b.kat, b.an);
        this.kat = b.kat;
        this.an = b.an;
        this.kKat = k.kat;
        this.kAn = k.an;
        this.laast = true;
        this.besked = { tekst: this.efterskrift(), slags: "" };
        this.vis(true);
    };

    O.naeste = function () {
        var n = this.naesteFelt();
        if (n >= 0) this.f.vaelgFelt(n);
    };

    /* Det naeste udfoerte felt med bundfald, der ikke er løst endnu. */
    O.naesteFelt = function () {
        var antal = this.f.felter.length;
        for (var i = 1; i <= antal; i++) {
            var nr = ((this.felt < 0 ? -1 : this.felt) + i) % antal;
            if (nr === this.felt) continue;
            if (this.f.status(nr) === "bundfald" && !this.f.felter[nr].loest) return nr;
        }
        return -1;
    };

    /* ----- Tekster ------------------------------------------------------ */
    O.efterskrift = function () {
        var b = this.rigtig();
        var a = this.f.felter[this.felt].analyse;
        var tilskuere = a.kationer.concat(a.anioner).filter(function (id) { return id !== b.kat && id !== b.an; });
        var navne = tilskuere.map(D.ionTekst);
        var tekst = D.stort(b.info.ord) + " bundfald af " + D.bundfaldFormel(b.kat, b.an) + ".";
        if (navne.length) {
            tekst += " " + (navne.length > 1 ? navne.slice(0, -1).join(", ") + " og " + navne[navne.length - 1] + " er tilskuerioner." : navne[0] + " er tilskuerion.");
        }
        return tekst;
    };

    O.hint = function () {
        var b = this.rigtig();
        var fejlIon = this.kat !== b.kat ? this.kat : (this.an !== b.an ? this.an : null);
        if (fejlIon) {
            var partner = D.IONER[fejlIon].q > 0 ? b.an : b.kat;
            return this.ionHint(fejlIon, partner);
        }
        var ladK = this.kKat * D.IONER[b.kat].q;
        var ladA = this.kAn * D.IONER[b.an].q;
        if (ladK + ladA !== 0) {
            return "Ionerne er rigtige. " + led(this.kKat, b.kat) + " har ladningen " + NK.fortegn(ladK) + ", og " +
                led(this.kAn, b.an) + " har " + NK.fortegn(ladA) + ". Bundfaldet skal være uden ladning.";
        }
        return "Ladningerne går op, men brug de mindste hele tal.";
    };

    function led(tal, id) { return (tal > 1 ? tal + " " : "") + D.ionTekst(id); }

    function indeholder(analyse, id) {
        return analyse.kationer.indexOf(id) >= 0 || analyse.anioner.indexOf(id) >= 0;
    }

    /* Et felt i skemaet, hvor ionen ogsaa er, men hvor der ikke dannes
       bundfald. Helst et felt, hvor den ogsaa moeder den ion, eleven
       skulle have valgt i stedet. Findes intet, peges der paa luppen. */
    O.ionHint = function (ion, partner) {
        var egen = this.felt;
        var kandidater = D.FELTER.filter(function (F) {
            var a = D.forventet(F);
            return F.nr !== egen && !a.bundfald.length && indeholder(a, ion) && indeholder(a, partner);
        });
        if (kandidater.length) {
            var F = kandidater[0];
            var tekst = "I feltet " + D.feltNavn(F) + " er der både " + D.ionTekst(ion) + " og " + D.ionTekst(partner) + ", men intet bundfald.";
            var s = this.f.status(F.nr);
            if (s !== "intet") tekst += " Dryp det felt, og se efter.";
            return tekst;
        }
        return "Kig i luppen. " + D.ionTekst(ion) + " bevæger sig frit rundt og er ikke med i bundfaldet.";
    };

    /* ----- Visning ------------------------------------------------------ */
    O.vis = function (tvungen) {
        var f = this.f;
        /* I det frie forsøg er kortet skjult; det starter forfra bagefter. */
        if (f.side !== "skema") {
            this.felt = -2;
            return;
        }
        if (f.valgt !== this.felt) {
            this.felt = f.valgt;
            this.nulstilBygger();
            tvungen = true;
        }

        NK.saetTekst("opg-taeller", this.antalLoest() + " af " + this.ANTAL);
        var status = this.felt >= 0 ? f.status(this.felt) : "ingen";
        var loest = this.felt >= 0 && f.felter[this.felt].loest;
        var tekst = "";

        /* Et felt, der allerede er løst, vises med svaret og kan ikke aendres. */
        if (status === "bundfald" && loest && !this.laast) {
            var rb = this.rigtig();
            var rk = D.koefficienter(rb.kat, rb.an);
            this.kat = rb.kat; this.an = rb.an; this.kKat = rk.kat; this.kAn = rk.an;
            this.laast = true;
            this.besked = { tekst: this.efterskrift(), slags: "god" };
            tvungen = true;
        }

        if (status === "ingen") {
            tekst = this.antalLoest() === this.ANTAL
                ? "Alle " + this.ANTAL + " fældningsreaktioner er opskrevet."
                : "Vælg et felt med bundfald med luppen eller i skemaet.";
        } else if (status === "delvis") {
            var F = D.FELTER[this.felt];
            var mangler = [F.soejle, F.raekke].filter(function (id) { return !(f.felter[F.nr].draaber[id] > 0); });
            tekst = "Feltet mangler en dråbe " + mangler.map(function (id) { return D.opl(id).formel; }).join(" og ") + ".";
        } else if (status === "forurenet") {
            tekst = "Feltet indeholder også " + D.fremmede(D.FELTER[this.felt], f.felter[this.felt].draaber)
                .map(function (id) { return D.opl(id).formel; }).join(" og ") + ". Tør det af, og dryp igen.";
        } else if (status === "intet") {
            tekst = "Intet bundfald i feltet " + D.feltNavn(D.FELTER[this.felt]) + ".";
        } else if (loest) {
            tekst = "Fældningsreaktionen i feltet " + D.feltNavn(D.FELTER[this.felt]) + " er opskrevet.";
        } else if (this.laast) {
            tekst = "Svaret er vist. Feltet tæller ikke med, men kan prøves igen.";
        } else {
            tekst = "Opskriv fældningsreaktionen i feltet " + D.feltNavn(D.FELTER[this.felt]) + ".";
        }
        NK.saetTekst("opg-tekst", tekst);

        var visBygger = status === "bundfald";
        NK.el("opg-bygger").hidden = !visBygger;
        if (visBygger && tvungen) this.tegnBygger();

        var bk = NK.el("opg-besked");
        bk.hidden = !this.besked || !visBygger;
        if (this.besked) {
            bk.textContent = this.besked.tekst;
            bk.className = "besked " + this.besked.slags;
        }
        NK.el("opg-tjek").hidden = this.laast;
        NK.el("opg-svar").hidden = this.laast || this.fejl < 2;

        var naeste = this.naesteFelt();
        var knap = NK.el("opg-naeste");
        knap.hidden = !(naeste >= 0 && (status !== "bundfald" || this.laast));
        knap.classList.toggle("banker", this.laast);
    };

    O.tegnBygger = function () {
        var mig = this;
        var a = this.f.felter[this.felt].analyse;
        var boks = NK.el("opg-ioner");
        boks.innerHTML = "";
        a.kationer.concat(a.anioner).forEach(function (id) {
            var knap = document.createElement("button");
            knap.type = "button";
            knap.className = "ionchip" + (mig.kat === id || mig.an === id ? " valgt" : "");
            knap.disabled = mig.laast;
            knap.dataset.ion = id;
            var prik = document.createElement("i");
            prik.style.backgroundColor = D.IONER[id].farve;
            knap.appendChild(prik);
            knap.appendChild(document.createTextNode(D.ionTekst(id)));
            knap.addEventListener("click", function () { mig.vaelgIon(id); });
            boks.appendChild(knap);
        });

        var k1 = NK.el("opg-k1"), k2 = NK.el("opg-k2");
        k1.textContent = String(this.kKat);
        k2.textContent = String(this.kAn);
        k1.classList.toggle("en", this.kKat === 1);
        k2.classList.toggle("en", this.kAn === 1);
        k1.disabled = k2.disabled = this.laast;

        saetPlads("opg-kat", this.kat ? D.ionTekst(this.kat) : "?", !!this.kat);
        saetPlads("opg-an", this.an ? D.ionTekst(this.an) : "?", !!this.an);
        var b = this.rigtig();
        saetPlads("opg-produkt", this.laast ? D.bundfaldFormel(b.kat, b.an) : "?", this.laast);
        NK.el("opg-linje").classList.toggle("loest", this.laast);
    };

    function saetPlads(id, tekst, fyldt) {
        var el = NK.el(id);
        el.textContent = tekst;
        el.classList.toggle("tom", !fyldt);
    }
}());
