/* =====================================================================
   sim_reaktor.js - fane 1: Reaktoren

   Ti ordrer fra kunder, der vil have et bestemt stof. Ordren siger kun
   navnet og duften; eleven finder selv syren og alkoholen ud fra navnet
   og laver syren ved oxidation, hvis den ikke staar paa hylden.
   Raavarerne er gratis og slipper aldrig op. Det, eleven laver, kommer
   paa hylden under Lavet og kan bruges én gang pr. portion.

   En ordre er leveret, saa snart stoffet er lavet. En ordre, der er
   leveret uden at se svaret, faar en stjerne (huskes i browseren).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var NOEGLE = "nk-sb4.5-rk";

    function SimReaktor() {
        K.start();
        this.navn = "rk";
        this.lavet = {};
        this.ordrer = D.ORDRER;
        var gemt = NK.hent(NOEGLE, {}) || {};
        this.status = this.ordrer.map(function (o) {
            var s = gemt[o.id];
            return { loest: !!(s && s.l), stjerne: !!(s && s.s) };
        });
        this.el = {};
        this.startStatus();
        this.R = new NK.Reaktor("rk", this);
        this.R.bygHylde();
        this.bygListe();
        var mig = this;
        NK.el("rk-forfra").addEventListener("click", function () { mig.nulstil(); });
        var foerste = this.status.findIndex ? this.status.findIndex(function (s) { return !s.loest; }) : 0;
        this.vaelg(foerste >= 0 ? foerste : 0);
    }

    var P = SimReaktor.prototype;
    NK.Fane.paa(P, "rk");

    /* ----- Til reaktoren -------------------------------------------------------- */
    P.antal = function (id) {
        var s = K.stof(id);
        if (s && s.hylde) return Infinity;
        return this.lavet[id] || 0;
    };

    P.brug = function (id) {
        var s = K.stof(id);
        if (s && s.hylde) return;
        this.lavet[id] = Math.max(0, (this.lavet[id] || 0) - 1);
        this.R.bygHylde();
    };

    P.nyt = function (s) {
        this.lavet[s.id] = (this.lavet[s.id] || 0) + 1;
        this.R.bygHylde();
    };

    P.grupper = function () {
        var mig = this;
        var hylde = D.STOFFER.filter(function (d) { return d.hylde; });
        function af(fn) { return hylde.filter(function (d) { return fn(K.stof(d.id)); }).map(function (d) { return d.id; }); }
        var lavet = Object.keys(this.lavet).filter(function (id) { return mig.lavet[id] > 0; });
        return [
            { titel: "Alkoholer", ids: af(function (s) { return s.klasse === "alkohol"; }), klasse: "g-alk" },
            { titel: "Syrer", ids: af(function (s) { return s.klasse === "syre"; }), klasse: "g-syre" },
            { titel: "Oxidationsmiddel", ids: af(function (s) { return s.klasse === "ox"; }), klasse: "g-ox" },
            { titel: "Lavet", ids: lavet, klasse: "g-lavet", tom: "Det, du laver, kommer her." }
        ];
    };

    P.mangler = function (id) {
        var s = K.stof(id);
        this.kortBesked("Du har ikke mere " + (s ? s.navn : id) + ". Lav det igen.", 4);
    };

    P.aendret = function () {
        this.naesteLinje();
        this.visKnap();
    };

    /* ----- Ordrerne -------------------------------------------------------------- */
    P.maalNu = function () {
        var o = this.ordrer[this.nr];
        return o ? o.maal : null;
    };

    P.faerdigNu = function () { return !!this.faerdig; };

    P.vaelg = function (i) {
        this.nr = i;
        this.faerdig = false;
        this.brugtSvar = false;
        this.nulstilHjaelp();
        this.visOrdre();
        this.visListe();
        this.naesteLinje();
        this.visKnap();
    };

    P.ordreTekst = function (o) {
        var k = D.KUNDER[o.kunde];
        var s = K.stofEfterNavn(o.maal);
        var navn = s ? s.navn : o.maal;
        var brug = D.BRUG[o.maal] ? " " + D.BRUG[o.maal] : "";
        return { kunde: k, navn: navn, s: s, brug: brug };
    };

    P.visOrdre = function () {
        var o = this.ordrer[this.nr];
        var t = this.ordreTekst(o);
        var navnHTML = '<b class="maalnavn">' + NK.html(t.navn) + "</b>";
        NK.saetHTML("rk-ordrelinje", '<span class="ol-ikon">' + t.kunde.ikon + "</span> " + NK.html(t.kunde.navn) +
            " vil have " + navnHTML + NK.html(t.brug) + ".");
        NK.saetTekst("rk-nr", String(this.nr + 1));
        var duft = t.s && t.s.duft ? (t.s.medicin ? "" : "Den dufter af " + t.s.duft + ".") : "";
        if (o.maal === "2-(acetyloxy)benzoesyre") duft = "Den hedder også acetylsalicylsyre eller aspirin.";
        if (o.maal === "propanon") duft = "Den hedder også acetone.";
        if (o.maal === "methyl-2-hydroxybenzoat") duft = "Den hedder også methylsalicylat og dufter af vintergrøn.";
        NK.saetHTML("rk-prompt",
            '<p class="ordre-kunde">' + t.kunde.ikon + " " + NK.html(t.kunde.navn) + "</p>" +
            '<p class="ordre-navn">' + NK.html(t.navn) + "</p>" +
            (duft ? '<p class="ordre-duft">' + (t.s && t.s.ikon ? t.s.ikon + " " : "") + NK.html(duft) + "</p>" : "") +
            '<p class="ordre-note">Lav stoffet i kolben. Det bliver leveret, så snart det er lavet.</p>');
        NK.el("rk-kort").classList.toggle("sejr", !!this.faerdig);
    };

    P.bygListe = function () {
        var mig = this, liste = NK.el("rk-liste");
        liste.innerHTML = "";
        this.chips = [];
        D.GRUPPER.forEach(function (g) {
            var boks = document.createElement("div");
            boks.className = "opg-gruppe";
            boks.innerHTML = '<div class="opg-hoved"><span>' + NK.html(g.titel) + '</span><span class="opg-tal" id="rk-gt-' + g.id + '"></span></div>';
            var raekke = document.createElement("div");
            raekke.className = "opg-chips";
            mig.ordrer.forEach(function (o, i) {
                if (o.gruppe !== g.id) return;
                var t = mig.ordreTekst(o);
                var knap = document.createElement("button");
                knap.type = "button";
                knap.className = "opg-chip";
                knap.title = t.navn;
                knap.innerHTML = '<span class="oc-f">' + NK.html(o.kort) + '</span><i class="oc-m"></i>';
                knap.addEventListener("click", function () { mig.vaelg(i); });
                raekke.appendChild(knap);
                mig.chips[i] = knap;
            });
            boks.appendChild(raekke);
            liste.appendChild(boks);
        });
    };

    P.visListe = function () {
        var mig = this;
        this.status.forEach(function (s, i) {
            var c = mig.chips[i];
            c.classList.toggle("valgt", i === mig.nr);
            c.classList.toggle("loest", s.loest);
            c.classList.toggle("stjerne", s.stjerne);
            c.querySelector(".oc-m").textContent = s.stjerne ? "★" : (s.loest ? "✓" : "");
        });
        D.GRUPPER.forEach(function (g) {
            var ialt = 0, loest = 0;
            mig.ordrer.forEach(function (o, i) {
                if (o.gruppe !== g.id) return;
                ialt++;
                if (mig.status[i].loest) loest++;
            });
            NK.saetTekst("rk-gt-" + g.id, loest + "/" + ialt);
        });
        NK.saetTekst("rk-loest", String(this.status.filter(function (s) { return s.loest; }).length));
    };

    P.gem = function () {
        var ud = {}, mig = this;
        this.ordrer.forEach(function (o, i) {
            var s = mig.status[i];
            if (s.loest) ud[o.id] = { l: 1, s: s.stjerne ? 1 : 0 };
        });
        NK.gem(NOEGLE, ud);
    };

    P.naesteUloeste = function () {
        var n = this.status.length;
        for (var d = 1; d <= n; d++) {
            var i = (this.nr + d) % n;
            if (!this.status[i].loest) return i;
        }
        return -1;
    };

    P.knapVidere = function () {
        if (this.naesteUloeste() >= 0) return "Næste ordre →";
        return "Videre til Fabrikken →";
    };

    P.videre = function () {
        var i = this.naesteUloeste();
        if (i >= 0) this.vaelg(i);
        else if (NK.visFane) NK.visFane("fane-fb");
    };

    P.trinLinje = function () {
        return this.standardTrin(this.nr === 0 && !this.status[0].loest);
    };

    /* Vis svaret: stofferne i pladserne og kontakterne sat, eleven trykker Start */
    P.visSvar = function (h) {
        var R = this.R;
        if (!h.svar) return;
        if (R.iKolben) R.toem(false);
        R.plads = [null, null];
        R.efterPlads(true);
        R.laeg(h.svar[0], 0);
        R.laeg(h.svar[1], 1);
        R.saetBet(h.hplus, h.varme);
        var s0 = K.stof(h.svar[0]), s1 = K.stof(h.svar[1]);
        var tekst = s0.navn + " og " + s1.navn + " ligger i kolben" +
            (h.hplus ? " med svovlsyre og varme" : " med varme") + ". Tryk Start." +
            (h.foerst ? " Brug derefter syren til esteren." : "");
        this.besked('<span class="b-maerke">Svaret</span> ' + NK.html(tekst), "gul");
    };

    /* ----- Udfaldet ----------------------------------------------------------------- */
    P.udfald = function (u, fase) {
        if (fase === "start") {
            if (u.slags === "tom") { this.fejlLinje("Kolben er tom. Læg to stoffer i den først."); return; }
            if (u.slags === "en") { this.fejlLinje("Der skal to stoffer i kolben."); return; }
            this.besked('<span class="b-maerke">Reagerer</span> ' + NK.html(u.mulig && !u.mangler.length ? "Se på tavlen, hvad der sker med atomerne." : "…"), "");
            this.visKnap();
            return;
        }
        var maal = this.maalNu();
        if (!u.mulig || (u.mangler && u.mangler.length)) { this.fejlLinje(u.tekst); return; }
        if (u.produkt && u.produkt.motornavn === maal) { this.loest(u); return; }
        /* Noget blev lavet, men ikke det, kunden vil have */
        var r = K.rute(maal);
        if (u.produkt && r && r.type === "ester" && u.produkt === r.syre) {
            this.nulstilHjaelp();
            this.besked('<span class="b-maerke">Godt</span> ' + NK.html(u.tekst + " Brug nu " + u.produkt.navn + " til esteren."), "god");
            this.visKnap();
            return;
        }
        var t = this.ordreTekst(this.ordrer[this.nr]);
        if (u.slags === "ether") this.besked('<span class="b-maerke">Påskeæg</span> ' + NK.html(u.tekst), "gul");
        else if (!u.produkt) this.besked('<span class="b-maerke">Væk</span> ' + NK.html(u.tekst), "gul");
        else this.besked('<span class="b-maerke">Lavet</span> ' + NK.html(u.tekst + " Kunden ville have " + t.navn + "."), "gul");
        this.pegKnap = true;
        this.visKnap();
    };

    P.loest = function (u) {
        var s = this.status[this.nr];
        this.faerdig = true;
        s.loest = true;
        s.stjerne = s.stjerne || !this.brugtSvar;
        this.gem();
        var duft = u.produkt.duft && !u.produkt.medicin ? " Den dufter af " + u.produkt.duft + "." : "";
        var html = '<span class="b-maerke stor">Leveret ✓</span> ' + NK.html(u.tekst + duft);
        if (this.status.every(function (x) { return x.loest; })) html += " " + NK.html(D.FAERDIG.rk);
        this.besked(html, "god");
        this.nulstilHjaelp();
        this.visOrdre();
        this.visListe();
        this.visKnap();
    };

    /* R og Forfra: kolben toemmes, og det lavede ryddes */
    P.nulstil = function () {
        this.lavet = {};
        this.R.nulstil();
        this.R.saetBet(false, false);
        this.R.bygHylde();
        this.vaelg(this.nr);
    };

    P.enter = function () { this.R.start(); };

    P.fokus = function () { };

    P.tilpas = function () { this.R.tilpas(); };
    P.layout = function () { this.R.tilpas(); };

    P.opdater = function (dt) {
        this.opdaterStatus(dt);
        this.R.opdater(dt);
        if (this.knapAuto !== this.R.auto) { this.knapAuto = this.R.auto; this.visKnap(); }
    };

    P.tegn = function () { this.R.tegn(); };

    NK.SimReaktor = SimReaktor;
}());
