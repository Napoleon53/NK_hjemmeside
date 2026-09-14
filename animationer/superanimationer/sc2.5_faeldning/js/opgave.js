/* =====================================================================
   opgave.js - kortet "Reaktionsskema" i panelet

   For hvert felt med bundfald opskrives fældningsreaktionen i to trin:
     ioner   Hvilke 2 ioner går sammen og danner den tungtopløselige
             forbindelse? Eleven vaelger en positiv og en negativ ion
             fra draaben.
     formel  Reaktionspilen dukker op, og eleven opskriver den neutrale
             formel for bundfaldet ved at klikke paa de smaa tal efter
             hvert symbol.
   Naar formlen er rigtig, vises hele reaktionsskemaet med koefficienter.

   Der er ingen forklaring foer opgaven. Svarer eleven forkert, kommer
   et hint, der passer til netop den fejl:
     forkert ion        peger paa et felt i skemaet med samme ion og
                        intet bundfald, eller paa luppen
     forkert formel     regner formlens samlede ladning ud
   Efter to forkerte svar i samme trin kan eleven faa svaret vist. Et
   vist svar taeller ikke med, og feltet kan proeves igen senere.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    var MAKS_INDEKS = 3;
    var SPOERG_IONER = "Hvilke 2 ioner går sammen og danner den tungtopløselige forbindelse?";
    var SPOERG_FORMEL = "Opskriv den neutrale kemiske formel for det udfældede salt.";

    NK.Opgave = function (forsoeg) {
        this.f = forsoeg;
        this.felt = -2;
        this.nulstilBygger();
        this.ANTAL = D.FELTER.filter(function (F) { return D.forventet(F).bundfald.length > 0; }).length;
        this.SPOERG_IONER = SPOERG_IONER;
        this.SPOERG_FORMEL = SPOERG_FORMEL;

        var mig = this;
        NK.el("opg-i1").addEventListener("click", function () { mig.skiftIndeks("iKat"); });
        NK.el("opg-i2").addEventListener("click", function () { mig.skiftIndeks("iAn"); });
        NK.el("opg-tjek").addEventListener("click", function () { mig.tjek(); });
        NK.el("opg-svar").addEventListener("click", function () { mig.visSvar(); });
        NK.el("opg-naeste").addEventListener("click", function () { mig.naeste(); });
    };

    var O = NK.Opgave.prototype;

    O.nulstilBygger = function () {
        this.trin = "ioner";      /* "ioner" eller "formel" */
        this.kat = null;
        this.an = null;
        this.iKat = 1;            /* tallene i formlen: Ag₃PO₄ er iKat 3, iAn 1 */
        this.iAn = 1;
        this.fejl = 0;            /* forkerte svar i det aktuelle trin */
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
        if (this.laast || this.trin !== "ioner") return;
        if (D.IONER[id].q > 0) this.kat = this.kat === id ? null : id;
        else this.an = this.an === id ? null : id;
        this.besked = null;
        this.vis(true);
    };

    O.skiftIndeks = function (hvilken) {
        if (this.laast || this.trin !== "formel") return;
        this[hvilken] = this[hvilken] % MAKS_INDEKS + 1;
        this.besked = null;
        this.vis(true);
    };

    /* Returnerer true, naar svaret i det aktuelle trin er rigtigt. */
    O.tjek = function () {
        if (this.laast || this.felt < 0 || this.f.status(this.felt) !== "bundfald") return false;
        var b = this.rigtig();

        if (this.trin === "ioner") {
            if (!this.kat || !this.an) {
                this.besked = { tekst: "Vælg en positiv og en negativ ion fra dråben.", slags: "skidt" };
                this.vis(true);
                return false;
            }
            if (this.kat === b.kat && this.an === b.an) {
                this.trin = "formel";
                this.fejl = 0;
                this.besked = null;
                this.vis(true);
                return true;
            }
            this.fejl++;
            this.besked = { tekst: this.ionHint(b), slags: "skidt" };
            this.vis(true);
            return false;
        }

        var k = D.koefficienter(b.kat, b.an);
        if (this.iKat === k.kat && this.iAn === k.an) {
            this.f.felter[this.felt].loest = true;
            this.laast = true;
            this.besked = { tekst: "Rigtigt. " + this.efterskrift(), slags: "god" };
            this.f.aendret("loest");
            this.vis(true);
            return true;
        }
        this.fejl++;
        this.besked = { tekst: this.formelHint(), slags: "skidt" };
        this.vis(true);
        return false;
    };

    O.visSvar = function () {
        if (this.laast) return;
        var b = this.rigtig();
        var k = D.koefficienter(b.kat, b.an);
        this.kat = b.kat;
        this.an = b.an;
        this.iKat = k.kat;
        this.iAn = k.an;
        this.trin = "formel";
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

    function indeholder(analyse, id) {
        return analyse.kationer.indexOf(id) >= 0 || analyse.anioner.indexOf(id) >= 0;
    }

    /* Et felt i skemaet, hvor den forkerte ion ogsaa er, men hvor der
       ikke dannes bundfald. Helst et felt, hvor den ogsaa moeder den ion,
       eleven skulle have valgt i stedet. Findes intet, peges der paa luppen. */
    O.ionHint = function (b) {
        var ion = this.kat !== b.kat ? this.kat : this.an;
        var partner = D.IONER[ion].q > 0 ? b.an : b.kat;
        var egen = this.felt;
        var kandidater = D.FELTER.filter(function (F) {
            var a = D.forventet(F);
            return F.nr !== egen && !a.bundfald.length && indeholder(a, ion) && indeholder(a, partner);
        });
        if (kandidater.length) {
            var F = kandidater[0];
            var tekst = "I feltet " + D.feltNavn(F) + " er der både " + D.ionTekst(ion) + " og " + D.ionTekst(partner) + ", men intet bundfald.";
            if (this.f.status(F.nr, "skema") !== "intet") tekst += " Dryp det felt, og se efter.";
            return tekst;
        }
        return "Kig i luppen. " + D.ionTekst(ion) + " bevæger sig frit rundt og er ikke med i bundfaldet.";
    };

    /* Ag₂PO₄ har ladningen 2 · (+1) + 1 · (−3) = −1. */
    O.formelHint = function () {
        var qk = D.IONER[this.kat].q, qa = D.IONER[this.an].q;
        var sum = this.iKat * qk + this.iAn * qa;
        if (sum !== 0) {
            return D.formel(this.kat, this.iKat, this.an, this.iAn) + " har ladningen " +
                this.iKat + " · (" + NK.fortegn(qk) + ") + " + this.iAn + " · (" + NK.fortegn(qa) + ") = " +
                NK.fortegn(sum) + ". Formlen skal være neutral.";
        }
        return "Ladningerne går op, men brug de mindste hele tal.";
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
            this.kat = rb.kat; this.an = rb.an; this.iKat = rk.kat; this.iAn = rk.an;
            this.trin = "formel";
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
            tekst = this.trin === "ioner" ? SPOERG_IONER : SPOERG_FORMEL;
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
        var b = this.rigtig();
        var ionTrin = this.trin === "ioner" && !this.laast;
        var formelTrin = this.trin === "formel" && !this.laast;

        var boks = NK.el("opg-ioner");
        boks.innerHTML = "";
        a.kationer.concat(a.anioner).forEach(function (id) {
            var knap = document.createElement("button");
            knap.type = "button";
            knap.className = "ionchip" + (mig.kat === id || mig.an === id ? " valgt" : "");
            knap.disabled = !ionTrin;
            knap.dataset.ion = id;
            var prik = document.createElement("i");
            prik.style.backgroundColor = D.IONER[id].farve;
            knap.appendChild(prik);
            knap.appendChild(document.createTextNode(D.ionTekst(id)));
            knap.addEventListener("click", function () { mig.vaelgIon(id); });
            boks.appendChild(knap);
        });

        saetPlads("opg-kat", this.kat ? D.ionTekst(this.kat) : "?", !!this.kat, formelTrin);
        saetPlads("opg-an", this.an ? D.ionTekst(this.an) : "?", !!this.an, formelTrin);

        /* Reaktionspilen og formlen kommer frem, naar ionerne er rigtige */
        NK.el("opg-linje").hidden = this.laast;
        NK.el("opg-produktdel").hidden = !formelTrin;
        if (formelTrin) {
            NK.el("opg-f-kat").textContent = D.IONER[this.kat].tegn;
            NK.el("opg-f-an").textContent = D.IONER[this.an].tegn;
            saetIndeks("opg-i1", this.iKat);
            saetIndeks("opg-i2", this.iAn);
            var parentes = !!D.IONER[this.an].sammensat && this.iAn > 1;
            NK.el("opg-p1").hidden = !parentes;
            NK.el("opg-p2").hidden = !parentes;
        }

        /* Hele reaktionsskemaet, naar opgaven er løst eller svaret vist */
        var facit = NK.el("opg-facit");
        facit.hidden = !this.laast;
        facit.textContent = this.laast ? D.reaktionsskema(b.kat, b.an) : "";
    };

    function saetPlads(id, tekst, fyldt, ok) {
        var el = NK.el(id);
        el.textContent = tekst;
        el.classList.toggle("tom", !fyldt);
        el.classList.toggle("ok", !!ok);
    }

    function saetIndeks(id, tal) {
        var el = NK.el(id);
        el.textContent = String(tal);
        el.classList.toggle("en", tal === 1);
    }
}());
