/* =====================================================================
   sim_fabrik.js - fane 2: Fabrikken

   Den gamle "Saelg kemikalier": eleven starter med 300 kr., koeber
   stofferne hos grossisten (+ paa kortet), laver dem i den samme
   reaktor og leverer til kunderne. Tre ordrer staar aabne ad gangen.
   De fem foerste er den gamle animations missioner; derefter kommer
   der tilfaeldige. Boersen giver hvert 30. sekund et tillaeg paa én
   duft. Maalet er 3000 kr. (Fabrikschef), men spillet fortsaetter.

   Fabrikken huskes i browseren. Forfra kraever to tryk.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var F = D.FABRIK;
    var NOEGLE = "nk-sb4.5-fabrik";

    function SimFabrik() {
        K.start();
        this.navn = "fb";
        this.koeb = true;
        this.el = {};
        this.startStatus();
        this.R = new NK.Reaktor("fb", this);
        var gemt = NK.hent(NOEGLE, null);
        if (gemt && typeof gemt.penge === "number") this.tilstand(gemt);
        else this.nyFabrik();
        this.R.bygHylde();
        var mig = this;
        NK.el("fb-forfra").addEventListener("click", function () { mig.nulstil(); });
        this.visAlt();
        this.naesteLinje();
        this.visKnap();
    }

    var P = SimFabrik.prototype;
    NK.Fane.paa(P, "fb");

    /* ----- Tilstanden ----------------------------------------------------------- */
    P.nyFabrik = function () {
        this.penge = F.start;
        this.lager = {};
        this.fasteNr = 0;
        this.ordrer = [];
        this.aktiv = 0;
        this.laan = 0;
        this.leveret = 0;
        this.titelNr = 0;
        this.boers = null;
        while (this.ordrer.length < 3) this.ordrer.push(this.nyOrdre());
        this.nyBoers();
    };

    P.tilstand = function (g) {
        this.penge = g.penge;
        this.lager = g.lager || {};
        this.fasteNr = g.fasteNr || 0;
        this.ordrer = (g.ordrer || []).filter(function (o) { return o && o.maal && D.KUNDER[o.kunde]; });
        this.aktiv = 0;
        this.laan = g.laan || 0;
        this.leveret = g.leveret || 0;
        this.titelNr = g.titelNr || 0;
        while (this.ordrer.length < 3) this.ordrer.push(this.nyOrdre());
        this.nyBoers();
    };

    P.gem = function () {
        NK.gem(NOEGLE, { penge: this.penge, lager: this.lager, fasteNr: this.fasteNr, ordrer: this.ordrer,
            laan: this.laan, leveret: this.leveret, titelNr: this.titelNr });
    };

    P.nyOrdre = function () {
        if (this.fasteNr < F.faste.length) {
            var f = F.faste[this.fasteNr++];
            return { kunde: f.kunde, maal: f.maal };
        }
        var mig = this;
        var valg = F.tilfaeldige.filter(function (o) {
            return !mig.ordrer.some(function (x) { return x.maal === o.maal; });
        });
        var o = NK.tilfaeldig(valg.length ? valg : F.tilfaeldige);
        return { kunde: o.kunde, maal: o.maal };
    };

    /* ----- Boersen --------------------------------------------------------------- */
    P.nyBoers = function () {
        var dufte = [];
        F.tilfaeldige.forEach(function (o) {
            var s = K.stofEfterNavn(o.maal);
            if (s && dufte.indexOf(o.maal) < 0) dufte.push(o.maal);
        });
        /* Gerne én af de aabne ordrer */
        var mig = this;
        var aabne = dufte.filter(function (n) { return mig.ordrer.some(function (o) { return o.maal === n; }); });
        var navn = Math.random() < 0.6 && aabne.length ? NK.tilfaeldig(aabne) : NK.tilfaeldig(dufte);
        this.boers = { maal: navn, pct: 20 + 10 * Math.floor(Math.random() * 11), t: 0 };
    };

    P.pris = function (o) {
        var s = K.stofEfterNavn(o.maal);
        var v = s ? s.vaerdi : 100;
        if (this.boers && this.boers.maal === o.maal) v = Math.round(v * (1 + this.boers.pct / 100) / 10) * 10;
        return v;
    };

    /* ----- Til reaktoren ------------------------------------------------------------- */
    P.antal = function (id) { return this.lager[id] || 0; };

    P.brug = function (id) {
        this.lager[id] = Math.max(0, (this.lager[id] || 0) - 1);
        this.gem();
        this.R.bygHylde();
    };

    P.nyt = function (s) {
        this.lager[s.id] = (this.lager[s.id] || 0) + 1;
        this.R.bygHylde();
        this.gem();
    };

    P.grupper = function () {
        var mig = this;
        var hylde = D.STOFFER.filter(function (d) { return d.hylde; });
        function af(fn) { return hylde.filter(function (d) { return fn(K.stof(d.id)); }).map(function (d) { return d.id; }); }
        var lavet = Object.keys(this.lager).filter(function (id) {
            var s = K.stof(id);
            return s && !s.hylde && mig.lager[id] > 0;
        });
        var udsolgt = {};
        F.udsolgt.forEach(function (u) { udsolgt[u.id] = u.grund; });
        var syrer = af(function (s) { return s.klasse === "syre"; }).concat(F.udsolgt.map(function (u) { return u.id; }));
        return [
            { titel: "Alkoholer", ids: af(function (s) { return s.klasse === "alkohol"; }), klasse: "g-alk" },
            { titel: "Syrer", ids: syrer, klasse: "g-syre", udsolgt: udsolgt },
            { titel: "Oxidationsmiddel", ids: af(function (s) { return s.klasse === "ox"; }), klasse: "g-ox" },
            /* Uden tom-tekst: gruppen vises foerst, naar der er lavet noget,
               saa hylden ikke faar en raekke mere paa smaa skaerme */
            { titel: "Lavet", ids: lavet, klasse: "g-lavet" }
        ];
    };

    /* Prisen og koebeknappen paa kortet */
    P.kortEkstra = function (s, kort) {
        if (!s.hylde) return;
        var mig = this;
        var k = document.createElement("button");
        k.type = "button";
        k.className = "sk-koeb";
        k.title = "Køb 1 portion " + s.navn + " for " + s.pris + " kr.";
        k.innerHTML = "+ " + s.pris + " kr";
        k.addEventListener("click", function () { mig.koebStof(s.id); });
        kort.appendChild(k);
    };

    P.koebStof = function (id) {
        var s = K.stof(id);
        if (this.penge < s.pris) {
            this.kortBesked("Du har ikke penge nok til " + s.navn + " (" + s.pris + " kr.). Lever en ordre først.", 4);
            this.tjekLaan();
            return;
        }
        this.penge -= s.pris;
        this.lager[id] = (this.lager[id] || 0) + 1;
        this.gem();
        this.R.visAntal();
        this.R.blink(id);
        this.visKasse(-s.pris);
        if (!this.R.plads[0] || !this.R.plads[1]) this.naesteLinje();
    };

    P.mangler = function (id, grund) {
        var s = K.stof(id);
        if (grund) { this.kortBesked(grund, 5); return; }
        if (s.hylde) this.kortBesked("Du har ingen " + s.navn + ". Køb den med + på kortet (" + s.pris + " kr.).", 4);
        else this.kortBesked("Du har ikke mere " + s.navn + ". Lav det igen.", 4);
    };

    P.aendret = function () {
        this.naesteLinje();
        this.visKnap();
    };

    /* ----- Ordrerne ----------------------------------------------------------------------- */
    P.maalNu = function () {
        var o = this.ordrer[this.aktiv];
        return o ? o.maal : null;
    };

    P.faerdigNu = function () { return false; };
    P.knapVidere = function () { return ""; };
    P.videre = function () { };

    P.vaelgOrdre = function (i) {
        if (this.aktiv === i) return;
        this.aktiv = i;
        this.nulstilHjaelp();
        this.visOrdrer();
        this.naesteLinje();
        this.visKnap();
    };

    P.visOrdrer = function () {
        var mig = this, boks = NK.el("fb-ordrer");
        boks.innerHTML = "";
        this.ordrer.forEach(function (o, i) {
            var k = D.KUNDER[o.kunde];
            var s = K.stofEfterNavn(o.maal);
            var navn = s ? s.navn : o.maal;
            var tillaeg = mig.boers && mig.boers.maal === o.maal;
            var knap = document.createElement("button");
            knap.type = "button";
            knap.className = "ordrekort" + (i === mig.aktiv ? " valgt" : "") + (tillaeg ? " boers" : "");
            knap.innerHTML =
                '<span class="ok-kunde">' + k.ikon + " " + NK.html(k.navn) + "</span>" +
                '<span class="ok-pris">' + mig.pris(o) + " kr" + (tillaeg ? ' <i>+' + mig.boers.pct + " %</i>" : "") + "</span>" +
                '<span class="ok-navn">' + NK.html(navn) + "</span>" +
                '<span class="ok-brug">' + (s && s.ikon ? s.ikon + " " : "") + NK.html(D.BRUG[o.maal] ? cap(D.BRUG[o.maal].replace(/^til /, "Til ")) : "") + "</span>";
            knap.addEventListener("click", function () { mig.vaelgOrdre(i); });
            boks.appendChild(knap);
        });
        var o = this.ordrer[this.aktiv];
        if (o) {
            var s = K.stofEfterNavn(o.maal);
            var k = D.KUNDER[o.kunde];
            NK.saetHTML("fb-ordrelinje", '<span class="ol-ikon">' + k.ikon + "</span> " + NK.html(k.navn) + " vil have " +
                '<b class="maalnavn">' + NK.html(s ? s.navn : o.maal) + "</b> for " + this.pris(o) + " kr.");
        }
    };

    function cap(s) { return K.cap(s); }

    P.visKasse = function (aendring) {
        NK.saetTekst("fb-penge", String(this.penge));
        /* Titlen gaar kun op: den bliver, selv om pengene bliver brugt */
        var titel = F.titler[this.titelNr].titel;
        var naeste = F.titler[this.titelNr + 1];
        NK.saetTekst("fb-titel", titel);
        var maal = naeste ? naeste.fra : F.maal;
        var fra = F.titler[this.titelNr].fra;
        var pct = naeste ? NK.klamp((this.penge - fra) / (maal - fra), 0, 1) : 1;
        NK.el("fb-bar").style.width = Math.round(pct * 100) + "%";
        NK.saetTekst("fb-maal", naeste ? "Næste titel: " + naeste.titel + " ved " + naeste.fra + " kr." : "Du har nået målet. Fabrikken kører videre.");
        NK.saetTekst("fb-leveret", String(this.leveret));
        if (aendring) {
            var e = NK.el("fb-aendring");
            e.textContent = (aendring > 0 ? "+" : "−") + Math.abs(aendring) + " kr";
            e.className = "kasse-aendring " + (aendring > 0 ? "plus" : "minus");
            void e.offsetWidth;
            e.classList.add("vis");
        }
    };

    P.visBoers = function () {
        var b = this.boers;
        if (!b) return;
        var s = K.stofEfterNavn(b.maal);
        NK.saetHTML("fb-boers", (s && s.ikon ? s.ikon + " " : "") + "Høj efterspørgsel på <b>" + NK.html(s ? s.navn : b.maal) +
            "</b>" + (s && s.duft ? " (" + NK.html(s.duft) + ")" : "") + ": <b class=\"plus\">+" + b.pct + " %</b>");
    };

    P.visAlt = function () {
        this.visKasse();
        this.visOrdrer();
        this.visBoers();
    };

    P.trinLinje = function () {
        var p = this.R.plads, n = (p[0] ? 1 : 0) + (p[1] ? 1 : 0);
        if (!this.R.iKolben && n === 0) {
            var harNoget = Object.keys(this.lager).some(function (id) { return this.lager[id] > 0; }, this);
            return harNoget ? "Læg to stoffer fra lageret i kolben." : "Køb to stoffer med + på kortene, og læg dem i kolben.";
        }
        return this.standardTrin(false);
    };

    P.visSvar = function (h) {
        var tekst = h.trin[h.trin.length - 1];
        this.besked('<span class="b-maerke">Svaret</span> ' + NK.html(tekst), "gul");
    };

    /* ----- Udfaldet ------------------------------------------------------------------------ */
    P.udfald = function (u, fase) {
        if (fase === "start") {
            if (u.slags === "tom") { this.fejlLinje("Kolben er tom. Køb to stoffer, og læg dem i kolben."); return; }
            if (u.slags === "en") { this.fejlLinje("Der skal to stoffer i kolben."); return; }
            this.besked('<span class="b-maerke">Reagerer</span> ' + NK.html(u.mulig && !u.mangler.length ? "Se på tavlen, hvad der sker med atomerne." : "…"), "");
            this.visKnap();
            return;
        }
        if (!u.mulig) {
            this.fejlLinje(u.tekst + " Blandingen er hældt ud.");
            this.tjekLaan();
            return;
        }
        if (u.mangler && u.mangler.length) { this.fejlLinje(u.tekst); return; }
        /* Leveres det til en ordre? Helst den valgte */
        var mig = this, idx = -1;
        if (u.produkt) {
            if (this.ordrer[this.aktiv] && this.ordrer[this.aktiv].maal === u.produkt.motornavn) idx = this.aktiv;
            else this.ordrer.forEach(function (o, i) { if (idx < 0 && o.maal === u.produkt.motornavn) idx = i; });
        }
        if (idx >= 0) { this.lever(idx, u); return; }
        var r = K.rute(this.maalNu());
        if (u.produkt && r && r.type === "ester" && u.produkt === r.syre) {
            this.nulstilHjaelp();
            this.besked('<span class="b-maerke">Godt</span> ' + NK.html(u.tekst + " Brug nu " + u.produkt.navn + " til esteren."), "god");
        } else if (u.slags === "ether") {
            this.besked('<span class="b-maerke">Påskeæg</span> ' + NK.html(u.tekst + " Ingen af kunderne vil have den."), "gul");
        } else {
            this.besked('<span class="b-maerke">Lavet</span> ' + NK.html(u.tekst + (u.produkt ? " Ingen af kunderne vil have det lige nu. Det står på lageret." : "")), "gul");
        }
        this.visKnap();
        mig.tjekLaan();
    };

    P.lever = function (i, u) {
        var o = this.ordrer[i];
        var pris = this.pris(o);
        this.lager[u.produkt.id] = Math.max(0, (this.lager[u.produkt.id] || 0) - 1);
        this.penge += pris;
        this.leveret++;
        var k = D.KUNDER[o.kunde];
        var tekst = u.tekst + " " + k.navn + " har betalt " + pris + " kr.";
        var gammelTitel = this.titelNr;
        while (this.titelNr + 1 < F.titler.length && this.penge >= F.titler[this.titelNr + 1].fra) this.titelNr++;
        var html = '<span class="b-maerke stor">Leveret ✓</span> ' + NK.html(tekst);
        if (this.titelNr > gammelTitel) {
            html += ' <b>' + NK.html(this.titelNr === F.titler.length - 1 ?
                "Du har nået " + F.maal + " kr. og er Fabrikschef." : "Du er nu " + F.titler[this.titelNr].titel.toLowerCase() + ".") + "</b>";
        }
        this.ordrer.splice(i, 1, this.nyOrdre());
        this.aktiv = i;
        this.nulstilHjaelp();
        this.gem();
        this.R.bygHylde();
        this.besked(html, "god");
        this.visKasse(pris);
        this.visOrdrer();
        this.visBoers();
        this.visKnap();
    };

    /* Ingen penge og intet paa lageret: banken laaner eleven penge */
    P.tjekLaan = function () {
        var billigst = Infinity;
        D.STOFFER.forEach(function (d) { if (d.hylde && d.pris < billigst) billigst = d.pris; });
        var mig = this;
        var lager = Object.keys(this.lager).reduce(function (n, id) { return n + (mig.lager[id] || 0); }, 0);
        if (this.penge >= billigst * 2 || lager > 1 || this.R.iKolben) return;
        this.penge += F.laan;
        this.laan++;
        this.gem();
        this.visKasse(F.laan);
        this.besked('<span class="b-maerke">Lån</span> ' + NK.html("Kassen var tom. Banken låner dig " + F.laan + " kr."), "gul");
    };

    /* Forfra: to tryk, saa man ikke mister fabrikken ved et uheld */
    P.nulstil = function () {
        var e = NK.el("fb-forfra");
        if (!this.bekraeft) {
            this.bekraeft = 4;
            e.textContent = "Tryk igen for at starte forfra";
            e.classList.add("advar");
            return;
        }
        this.bekraeft = 0;
        e.textContent = "Forfra ↺";
        e.classList.remove("advar");
        this.R.nulstil();
        this.R.saetBet(false, false);
        this.nyFabrik();
        this.gem();
        this.R.bygHylde();
        this.visAlt();
        this.nulstilHjaelp();
        this.naesteLinje();
        this.visKnap();
    };

    P.enter = function () { this.R.start(); };
    P.fokus = function () { };
    P.tilpas = function () { this.R.tilpas(); };
    P.layout = function () { this.R.tilpas(); };

    P.opdater = function (dt) {
        this.opdaterStatus(dt);
        this.R.opdater(dt);
        if (this.knapAuto !== this.R.auto) { this.knapAuto = this.R.auto; this.visKnap(); }
        if (this.bekraeft) {
            this.bekraeft -= dt;
            if (this.bekraeft <= 0) {
                this.bekraeft = 0;
                var e = NK.el("fb-forfra");
                e.textContent = "Forfra ↺";
                e.classList.remove("advar");
            }
        }
        if (this.boers) {
            this.boers.t += dt;
            var rest = Math.max(0, 1 - this.boers.t / F.boersSek);
            NK.el("fb-boersbar").style.width = Math.round(rest * 100) + "%";
            if (this.boers.t >= F.boersSek) {
                this.nyBoers();
                this.visBoers();
                this.visOrdrer();
            }
        }
    };

    P.tegn = function () { this.R.tegn(); };

    NK.SimFabrik = SimFabrik;
}());
