/* =====================================================================
   fabrik.js - spillet: Fabrikken

   Eleven starter med 300 kr., koeber stofferne i butikken, laver dem i
   reaktoren og leverer til kunderne. Ordren giver kun stoffets navn;
   eleven finder selv syren og alkoholen ud fra navnet og laver syren
   ved oxidation, hvis butikken ikke har den.

     * Kunderne: tre ordrer ad gangen (fire med reklameskiltet). De ti
       foerste kommer i fast raekkefoelge fra let til svaer.
     * Serien: leveringer i traek uden en blanding, der maa haeldes ud,
       giver 10 % oveni pr. levering (hoejst 50 %). Vis svaret bryder den.
     * Boersen: hvert 30. sekund er der hoej eftersporgsel paa én duft.
     * Esterkortet: foerste gang et stof paa kortet laves, giver det 50 kr.
     * Titlerne foelger det, fabrikken har tjent i alt, og aabner for
       udstyr i butikken.
     * Er kassen og lageret tomme, laaner banken eleven 200 kr.

   Fabrikken huskes i browseren. Forfra kraever to tryk.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var F = D.FABRIK;
    var NOEGLE = "nk-sb4.5-fabrik2";

    function Fabrik() {
        K.start();
        K.rute("");                  /* reglerne regner alle estere ud, saa de har navn og vaerdi */
        this.navn = "fb";
        this.el = {};
        this.startStatus();
        this.R = new NK.Reaktor("fb", this);
        var gemt = NK.hent(NOEGLE, null);
        if (gemt && typeof gemt.penge === "number") this.tilstand(gemt);
        else this.nyFabrik();
        this.vistPenge = this.penge;
        this.kortet = new NK.Esterkort(this);
        this.butik = new NK.Butik(this);
        this.R.bygHylde();
        var mig = this;
        NK.el("fb-forfra").addEventListener("click", function () { mig.nulstil(); });
        NK.el("fb-butikknap").addEventListener("click", function () { mig.aabnButik(); });
        NK.el("fb-kortknap").addEventListener("click", function () { mig.kortet.aabn(); });
        NK.el("fb-udstyr").addEventListener("click", function () { mig.aabnButik(); });
        this.visAlt();
        this.naesteLinje();
        this.visKnap();
    }

    var P = Fabrik.prototype;
    NK.Fane.paa(P, "fb");

    /* ----- Tilstanden ----------------------------------------------------------- */
    P.nyFabrik = function () {
        this.penge = F.start;
        this.tjent = 0;
        this.lager = {};
        this.fasteNr = 0;
        this.ordrer = [];
        this.aktiv = 0;
        this.laan = 0;
        this.leveret = 0;
        this.titelNr = 0;
        this.serie = 0;
        this.kendt = {};
        this.udstyr = {};
        this.boers = null;
        this.tilbud = null;
        this.fyldOrdrer();
        this.nyBoers();
        this.nyTilbud();
    };

    P.tilstand = function (g) {
        this.penge = g.penge;
        this.tjent = g.tjent || 0;
        this.lager = g.lager || {};
        this.fasteNr = g.fasteNr || 0;
        this.ordrer = (g.ordrer || []).filter(function (o) { return o && o.maal && D.KUNDER[o.kunde] && K.stofEfterNavn(o.maal); });
        this.aktiv = 0;
        this.laan = g.laan || 0;
        this.leveret = g.leveret || 0;
        this.titelNr = g.titelNr || 0;
        this.serie = g.serie || 0;
        this.kendt = g.kendt || {};
        this.udstyr = g.udstyr || {};
        /* Et lavet stof paa lageret skal kendes af reglerne igen */
        var mig = this;
        Object.keys(this.lager).forEach(function (id) { if (!K.stof(id)) delete mig.lager[id]; });
        this.fyldOrdrer();
        this.nyBoers();
        this.nyTilbud();
    };

    P.gem = function () {
        NK.gem(NOEGLE, { penge: this.penge, tjent: this.tjent, lager: this.lager, fasteNr: this.fasteNr, ordrer: this.ordrer,
            laan: this.laan, leveret: this.leveret, titelNr: this.titelNr, serie: this.serie, kendt: this.kendt, udstyr: this.udstyr });
    };

    P.pladser = function () { return this.udstyr.skilt ? 4 : 3; };

    P.fyldOrdrer = function () {
        while (this.ordrer.length < this.pladser()) this.ordrer.push(this.nyOrdre());
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

    /* ----- Boersen og dagens tilbud ------------------------------------------------ */
    P.nyBoers = function () {
        var dufte = [];
        F.tilfaeldige.forEach(function (o) {
            if (K.stofEfterNavn(o.maal) && dufte.indexOf(o.maal) < 0) dufte.push(o.maal);
        });
        /* Gerne én af de aabne ordrer */
        var mig = this;
        var aabne = dufte.filter(function (n) { return mig.ordrer.some(function (o) { return o.maal === n; }); });
        var navn = Math.random() < 0.6 && aabne.length ? NK.tilfaeldig(aabne) : NK.tilfaeldig(dufte);
        this.boers = { maal: navn, pct: 20 + 10 * Math.floor(Math.random() * 11), t: 0 };
    };

    P.nyTilbud = function () {
        var gammel = this.tilbud ? this.tilbud.id : "";
        var valg = D.STOFFER.filter(function (d) { return d.hylde && d.id !== gammel; });
        this.tilbud = { id: NK.tilfaeldig(valg).id, t: 0 };
    };

    /* ----- Priserne ----------------------------------------------------------------- */
    /* Det, kunden betaler: vaerdien, boersens tillaeg og vandudskilleren */
    P.pris = function (o) {
        var s = K.stofEfterNavn(o.maal);
        var v = s ? s.vaerdi : 100;
        var gange = 1;
        if (this.boers && this.boers.maal === o.maal) gange *= 1 + this.boers.pct / 100;
        if (this.udstyr.vandudskiller && s && s.klasse === "ester") gange *= 1 + F.esterPct / 100;
        return gange === 1 ? v : Math.round(v * gange / 10) * 10;
    };

    P.seriePct = function () { return Math.min(this.serie, F.serieMax) * F.seriePct; };

    /* Det, en portion koster i butikken: dagens tilbud og kundekortet */
    P.stofPris = function (id) {
        var s = K.stof(id);
        var p = s.pris;
        if (this.tilbud && this.tilbud.id === id) p *= 1 - F.tilbudPct / 100;
        if (this.udstyr.kundekort) p *= 1 - F.rabatPct / 100;
        return Math.max(1, Math.round(p));
    };

    P.udstyrPris = function (u) { return u.pris; };

    /* ----- Til reaktoren ------------------------------------------------------------- */
    P.antal = function (id) { return this.lager[id] || 0; };

    P.brug = function (id) {
        this.lager[id] = Math.max(0, (this.lager[id] || 0) - 1);
        this.gem();
        this.R.bygHylde();
    };

    P.nyt = function (s) {
        this.lager[s.id] = (this.lager[s.id] || 0) + 1;
        this.sidstNy = this.kortet.opdag(s);
        this.R.bygHylde();
        this.gem();
    };

    /* Flaskerne paa lageret: foerst det lavede (saa det nye altid kan ses),
       saa det, butikken foerer. En flaske bliver staaende, mens dens sidste
       portion ligger i kolben. */
    P.lagerIds = function () {
        var mig = this, R = this.R;
        function med(id) { return (mig.lager[id] || 0) > 0 || (R && R.plads.indexOf(id) >= 0); }
        var hylde = D.STOFFER.filter(function (d) { return d.hylde && med(d.id); }).map(function (d) { return d.id; });
        var lavet = Object.keys(this.lager).filter(function (id) {
            var s = K.stof(id);
            return s && !s.hylde && med(id);
        });
        return lavet.concat(hylde);
    };

    P.mangler = function (id) {
        var s = K.stof(id);
        if (s.hylde) this.kortBesked("Du har ikke mere " + s.navn + ". Køb mere i butikken.", 4);
        else this.kortBesked("Du har ikke mere " + s.navn + ". Lav det igen.", 4);
    };

    P.aendret = function () {
        this.naesteLinje();
        this.visKnap();
    };

    /* ----- Butikken -------------------------------------------------------------------- */
    P.aabnButik = function () {
        if (this.R.auto) return;
        this.tjekLaan();
        this.butik.aabn();
    };

    /* Kurven er betalt: varerne stilles paa lageret */
    P.koeb = function (kurv, sum) {
        var mig = this, nyeStoffer = [], nytUdstyr = [];
        Object.keys(kurv).forEach(function (id) {
            var u = F.udstyr.filter(function (x) { return x.id === id; })[0];
            if (u) { mig.udstyr[id] = 1; nytUdstyr.push(u); return; }
            mig.lager[id] = (mig.lager[id] || 0) + kurv[id];
            nyeStoffer.push(id);
        });
        this.penge -= sum;
        this.fyldOrdrer();
        this.gem();
        this.R.bygHylde();
        nyeStoffer.forEach(function (id) { mig.R.blink(id); });
        this.visAlt();
        NK.Fx.tal(NK.el("fb-kasse"), "−" + sum + " kr", "minus");
        if (nytUdstyr.length) {
            this.besked('<span class="b-maerke">Nyt udstyr</span> ' + NK.html(nytUdstyr.map(function (u) { return u.navn + ": " + u.tekst; }).join(" ")), "god");
        } else {
            this.naesteLinje();
        }
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

    /* Er stoffet til ordren allerede paa lageret? */
    P.paaLager = function (o) {
        var s = K.stofEfterNavn(o.maal);
        return !!(s && (this.lager[s.id] || 0) > 0);
    };

    P.visOrdrer = function (nyNr) {
        var mig = this, boks = NK.el("fb-ordrer");
        boks.innerHTML = "";
        this.ordrer.forEach(function (o, i) {
            var k = D.KUNDER[o.kunde];
            var s = K.stofEfterNavn(o.maal);
            var navn = s ? s.navn : o.maal;
            var tillaeg = mig.boers && mig.boers.maal === o.maal;
            var kort = document.createElement("div");
            kort.className = "ordrekort" + (i === mig.aktiv ? " valgt" : "") + (tillaeg ? " boers" : "") + (i === nyNr ? " ny" : "");
            var knap = document.createElement("button");
            knap.type = "button";
            knap.className = "ok-vaelg";
            knap.title = "Vælg ordren (hintene gælder den valgte ordre)";
            knap.innerHTML =
                '<span class="ok-fig" aria-hidden="true">' + k.ikon + "</span>" +
                '<span class="ok-kunde">' + NK.html(k.navn) + "</span>" +
                '<span class="ok-pris">' + mig.pris(o) + " kr" + (tillaeg ? ' <i>+' + mig.boers.pct + " %</i>" : "") + "</span>" +
                '<span class="ok-navn">' + NK.html(navn) + "</span>" +
                '<span class="ok-brug">' + NK.html(D.BRUG[o.maal] ? K.cap(D.BRUG[o.maal]) : "") + "</span>";
            knap.addEventListener("click", function () { mig.vaelgOrdre(i); });
            kort.appendChild(knap);
            if (mig.paaLager(o)) {
                var lever = document.createElement("button");
                lever.type = "button";
                lever.className = "ok-lever";
                lever.textContent = "Levér fra lageret";
                lever.addEventListener("click", function () { mig.leverFraLager(i); });
                kort.appendChild(lever);
            }
            boks.appendChild(kort);
        });
        var o = this.ordrer[this.aktiv];
        if (o) {
            var s = K.stofEfterNavn(o.maal);
            var k = D.KUNDER[o.kunde];
            NK.saetHTML("fb-ordrelinje", '<span class="ol-ikon">' + k.ikon + "</span> " + NK.html(k.navn) + " vil have " +
                '<b class="maalnavn">' + NK.html(s ? s.navn : o.maal) + "</b>" + NK.html(D.BRUG[o.maal] ? " " + D.BRUG[o.maal] : "") + ".");
        }
        NK.saetTekst("fb-leveret", String(this.leveret));
    };

    /* ----- Toplinjen: kassen, titlen, serien og udstyret --------------------------------- */
    P.visKasse = function () {
        var titel = F.titler[this.titelNr].titel;
        var naeste = F.titler[this.titelNr + 1];
        NK.saetTekst("fb-titel", titel);
        var fra = F.titler[this.titelNr].fra;
        var pct = naeste ? NK.klamp((this.tjent - fra) / (naeste.fra - fra), 0, 1) : 1;
        NK.el("fb-bar").style.width = Math.round(pct * 100) + "%";
        NK.saetTekst("fb-maal", naeste ? "tjent " + this.tjent + " af " + naeste.fra + " kr" : "tjent " + this.tjent + " kr");
        NK.el("fb-titelfelt").title = naeste ? "Næste titel: " + naeste.titel.toLowerCase() + ", når fabrikken har tjent " + naeste.fra + " kr. i alt" :
            "Du har den højeste titel. Fabrikken kører videre.";
    };

    P.visSerie = function () {
        var pct = this.seriePct();
        NK.saetTekst("fb-serie", String(this.serie));
        NK.saetTekst("fb-seriebonus", pct ? "+" + pct + " %" : "");
        NK.el("fb-seriefelt").classList.toggle("varm", this.serie > 0);
    };

    P.visUdstyr = function () {
        var mig = this;
        NK.saetHTML("fb-udstyr", F.udstyr.map(function (u) {
            var ejet = !!mig.udstyr[u.id];
            return '<span class="ud-plads' + (ejet ? " ejet" : "") + '" title="' + NK.html(u.navn + ": " + u.tekst + (ejet ? "" : " Kan købes i butikken.")) + '">' + u.ikon + "</span>";
        }).join(""));
    };

    P.visBoers = function () {
        var b = this.boers;
        if (!b) return;
        var s = K.stofEfterNavn(b.maal);
        NK.saetHTML("fb-boers", (s && s.ikon ? s.ikon + " " : "") + "Høj efterspørgsel på <b>" + NK.html(s ? s.navn : b.maal) +
            "</b>" + (s && s.duft ? " (" + NK.html(s.duft) + ")" : "") + ": <b class=\"plus\">+" + b.pct + " %</b>");
    };

    P.visTilbud = function () {
        var s = this.tilbud ? K.stof(this.tilbud.id) : null;
        NK.saetHTML("fb-tilbudmaerke", s ? "Tilbud: <b>" + NK.html(s.navn) + "</b>" : "");
    };

    P.visAlt = function () {
        this.visKasse();
        this.visSerie();
        this.visUdstyr();
        this.visOrdrer();
        this.visBoers();
        this.visTilbud();
        this.kortet.vis();
        if (this.butik.aaben()) this.butik.vis();
    };

    P.trinLinje = function () {
        var p = this.R.plads, n = (p[0] ? 1 : 0) + (p[1] ? 1 : 0);
        if (!this.R.iKolben && n === 0) {
            var harNoget = Object.keys(this.lager).some(function (id) { return this.lager[id] > 0; }, this);
            return harNoget ? "Læg to stoffer fra lageret i kolben." : "Køb de to stoffer, ordren skal laves af, i butikken.";
        }
        return this.standardTrin(this.leveret === 0);
    };

    /* Vis svaret: opskriften staar i linjen. Den bryder serien. */
    P.visSvar = function (h) {
        var tekst = h.trin[h.trin.length - 1];
        this.brydSerie();
        this.besked('<span class="b-maerke">Svaret</span> ' + NK.html(tekst), "gul");
    };

    P.brydSerie = function () {
        if (!this.serie) return false;
        this.serie = 0;
        this.gem();
        this.visSerie();
        var e = NK.el("fb-seriefelt");
        e.classList.remove("brudt");
        void e.offsetWidth;
        e.classList.add("brudt");
        return true;
    };

    /* Penge ind: kassen, det tjente og titlen. true ved en ny titel */
    P.tjen = function (kr) {
        this.penge += kr;
        this.tjent += kr;
        var gammel = this.titelNr;
        while (this.titelNr + 1 < F.titler.length && this.tjent >= F.titler[this.titelNr + 1].fra) this.titelNr++;
        return this.titelNr > gammel;
    };

    P.fejrTitel = function () {
        var nr = this.titelNr;
        var nyt = F.udstyr.filter(function (u) { return u.titel === nr; })[0];
        NK.Fx.forfrem(F.titler[nr].titel, nyt ? nyt.navn + " kan nu købes i butikken." :
            (nr === F.titler.length - 1 ? "Du har den højeste titel. Fabrikken kører videre." : ""));
    };

    /* Bonussen for et nyt stof paa esterkortet (sat i nyt) */
    P.nyBonus = function () {
        if (!this.sidstNy) return "";
        this.sidstNy = false;
        var titel = this.tjen(F.nyBonus);
        NK.Fx.moenter(NK.el("fb-kortknap"), NK.el("fb-kasse"), 4);
        if (titel) this.fejrTitel();
        return " Nyt stof på esterkortet: " + F.nyBonus + " kr.";
    };

    /* ----- Udfaldet ------------------------------------------------------------------------ */
    P.udfald = function (u, fase) {
        if (fase === "start") {
            if (u.slags === "tom") { this.fejlLinje("Kolben er tom. Læg to stoffer fra lageret i den."); return; }
            if (u.slags === "en") { this.fejlLinje("Der skal to stoffer i kolben."); return; }
            this.besked('<span class="b-maerke">Reagerer</span> ' + NK.html(u.mulig && !u.mangler.length ? "Se på tavlen, hvad der sker med atomerne." : "…"), "");
            this.visKnap();
            return;
        }
        if (!u.mulig) {
            var brudt = this.brydSerie();
            this.fejlLinje(u.tekst + " Blandingen er hældt ud." + (brudt ? " Serien er brudt." : ""));
            this.tjekLaan();
            return;
        }
        if (u.mangler && u.mangler.length) { this.fejlLinje(u.tekst); return; }
        var ny = this.nyBonus();
        /* Leveres det til en ordre? Helst den valgte */
        var idx = -1;
        if (u.produkt) {
            if (this.ordrer[this.aktiv] && this.ordrer[this.aktiv].maal === u.produkt.motornavn) idx = this.aktiv;
            else this.ordrer.forEach(function (o, i) { if (idx < 0 && o.maal === u.produkt.motornavn) idx = i; });
        }
        if (idx >= 0) { this.lever(idx, u.produkt, u.tekst, ny); return; }
        var r = K.rute(this.maalNu());
        if (u.produkt && r && r.type === "ester" && u.produkt === r.syre) {
            this.nulstilHjaelp();
            this.besked('<span class="b-maerke">Godt</span> ' + NK.html(u.tekst + " Brug nu " + u.produkt.navn + " til esteren."), "god");
        } else if (u.slags === "ether") {
            this.besked('<span class="b-maerke">Påskeæg</span> ' + NK.html(u.tekst + " Ingen af kunderne vil have den." + ny), "gul");
        } else if (!u.produkt) {
            this.besked('<span class="b-maerke">Væk</span> ' + NK.html(u.tekst), "gul");
        } else {
            this.besked('<span class="b-maerke">Lavet</span> ' + NK.html(u.tekst + " Ingen kunde har bestilt det. Det står på lageret." + ny), "gul");
        }
        this.visAlt();
        this.visKnap();
        this.tjekLaan();
    };

    P.leverFraLager = function (i) {
        var o = this.ordrer[i];
        var s = o ? K.stofEfterNavn(o.maal) : null;
        if (!s || !(this.lager[s.id] > 0) || this.R.auto) return;
        this.lever(i, s, K.cap(K.fuldtNavn(s)) + " stod på lageret.", "");
    };

    P.lever = function (i, produkt, tekst, ekstra) {
        var o = this.ordrer[i];
        var pris = this.pris(o);
        var pct = this.seriePct();
        var bonus = Math.round(pris * pct / 100);
        var k = D.KUNDER[o.kunde];
        var kortEl = NK.el("fb-ordrer").children[i];
        this.lager[produkt.id] = Math.max(0, (this.lager[produkt.id] || 0) - 1);
        var nyTitel = this.tjen(pris + bonus);
        this.leveret++;
        this.serie++;
        var html = '<span class="b-maerke stor">Leveret ✓</span> ' + NK.html(tekst + " " + k.navn + " har betalt " + pris + " kr." +
            (bonus ? " Serien gav " + bonus + " kr. oveni." : "") + (ekstra || ""));
        NK.Fx.moenter(kortEl, NK.el("fb-kasse"), 4 + Math.round(pris / 80));
        NK.Fx.tal(NK.el("fb-kasse"), "+" + (pris + bonus) + " kr", "plus");
        this.ordrer.splice(i, 1, this.nyOrdre());
        this.aktiv = i;
        this.nulstilHjaelp();
        this.gem();
        this.R.bygHylde();
        this.besked(html, "god");
        this.visAlt();
        this.visOrdrer(i);
        this.visKnap();
        if (nyTitel) this.fejrTitel();
    };

    /* Ingen penge og intet paa lageret: banken laaner eleven penge */
    P.tjekLaan = function () {
        var mig = this, billigst = Infinity;
        D.STOFFER.forEach(function (d) { if (d.hylde) billigst = Math.min(billigst, mig.stofPris(d.id)); });
        var lager = Object.keys(this.lager).reduce(function (n, id) { return n + (mig.lager[id] || 0); }, 0);
        if (this.penge >= billigst * 2 || lager > 1 || this.R.iKolben) return;
        this.penge += F.laan;
        this.laan++;
        this.gem();
        this.visAlt();
        NK.Fx.tal(NK.el("fb-kasse"), "+" + F.laan + " kr", "plus");
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
        this.vistPenge = this.penge;
        this.butik.kurv = {};
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
        /* Tallet i kassen taeller op og ned til det rigtige beloeb */
        if (this.vistPenge !== this.penge) {
            var d = this.penge - this.vistPenge;
            var skridt = Math.max(1, Math.ceil(Math.abs(d) * Math.min(1, dt * 7)));
            this.vistPenge += Math.abs(d) <= skridt ? d : (d > 0 ? skridt : -skridt);
        }
        NK.saetTekst("fb-penge", String(this.vistPenge));
        /* Doeren til butikken lyser, naar der intet er at arbejde med */
        var tomt = !this.R.iKolben && !this.R.auto && !this.lagerIds().length;
        if (tomt !== this.pegButik) {
            this.pegButik = tomt;
            NK.el("fb-butikknap").classList.toggle("peg", tomt);
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
        if (this.tilbud) {
            this.tilbud.t += dt;
            if (this.tilbud.t >= F.tilbudSek) {
                this.nyTilbud();
                this.visTilbud();
                if (this.butik.aaben()) this.butik.vis();
            }
        }
    };

    P.tegn = function () { this.R.tegn(); };

    NK.Fabrik = Fabrik;
}());
