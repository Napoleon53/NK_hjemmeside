/* =====================================================================
   butik.js - Kemikaliegrossisten

   Butikken aabner oven paa laboratoriet. Varerne staar paa reoler efter
   slags: alkoholer, syrer, oxidationsmiddel og udstyr. Et klik paa en
   vare laegger én portion i kurven; kurven til hoejre viser linjerne og
   summen, og Betal traekker pengene og stiller varerne paa lageret.

     * Dagens tilbud: én vare er sat ned og skifter hvert minut.
     * Butansyre er udsolgt (data.js); ekspedienten siger hvorfor.
     * Udstyret koebes én gang. Noget af det kraever en titel.

   Priserne og pengene ligger hos ejeren (fabrik.js):
     ejer.stofPris(id), ejer.udstyrPris(u), ejer.koeb(kurv), ejer.penge
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var F = D.FABRIK;

    function Butik(ejer) {
        var mig = this;
        this.ejer = ejer;
        this.kurv = {};          /* id -> antal (stoffer) eller 1 (udstyr) */
        this.boble = "";
        this.el = { overlay: NK.el("butik"), reoler: NK.el("bu-reoler"), linjer: NK.el("bu-linjer") };
        NK.el("bu-betal").addEventListener("click", function () { mig.betal(); });
        NK.el("bu-toem").addEventListener("click", function () { mig.kurv = {}; mig.sig(""); mig.vis(); });
    }

    var P = Butik.prototype;

    P.aaben = function () { return this.el.overlay.classList.contains("vis"); };

    P.aabn = function () {
        this.sig("");
        this.el.overlay.classList.add("vis");
        this.vis();
    };

    P.luk = function () { this.el.overlay.classList.remove("vis"); };

    function udstyr(id) {
        return F.udstyr.filter(function (u) { return u.id === id; })[0] || null;
    }

    /* ----- Kurven ---------------------------------------------------------------- */
    P.linjePris = function (id) {
        var u = udstyr(id);
        return u ? this.ejer.udstyrPris(u) : this.ejer.stofPris(id) * this.kurv[id];
    };

    P.ialt = function () {
        var mig = this;
        return Object.keys(this.kurv).reduce(function (sum, id) { return sum + mig.linjePris(id); }, 0);
    };

    P.laeg = function (id) {
        var u = udstyr(id);
        if (u) {
            if (this.ejer.udstyr[id]) return;
            if (this.ejer.titelNr < u.titel) {
                this.sig("Det sælger jeg kun til en " + F.titler[u.titel].titel.toLowerCase() + ". Kom igen, når du har titlen.");
                return;
            }
            this.kurv[id] = 1;
        } else {
            this.kurv[id] = Math.min(9, (this.kurv[id] || 0) + 1);
        }
        this.sig("");
        this.vis();
    };

    P.tag = function (id) {
        if (!this.kurv[id]) return;
        this.kurv[id]--;
        if (this.kurv[id] <= 0) delete this.kurv[id];
        this.sig("");
        this.vis();
    };

    P.betal = function () {
        var sum = this.ialt();
        if (!sum) { this.sig("Kurven er tom. Klik på en vare for at lægge den i kurven."); return; }
        if (sum > this.ejer.penge) {
            this.sig("Det bliver " + sum + " kr., og du har " + this.ejer.penge + " kr. Tag noget ud af kurven.");
            var e = NK.el("bu-kurv");
            e.classList.remove("ryster");
            void e.offsetWidth;
            e.classList.add("ryster");
            return;
        }
        var kurv = this.kurv;
        this.kurv = {};
        this.luk();
        this.ejer.koeb(kurv, sum);
    };

    /* Ekspedientens taleboble: tom tekst giver dagens tilbud */
    P.sig = function (tekst) {
        this.boble = tekst;
        this.visBoble();
    };

    P.visBoble = function () {
        var t = this.boble;
        if (!t) {
            var s = this.ejer.tilbud ? K.stof(this.ejer.tilbud.id) : null;
            t = s ? "Dagens tilbud: " + s.navn + " er sat " + F.tilbudPct + " % ned." : "Hvad skal det være?";
        }
        NK.saetTekst("bu-boble", t);
    };

    /* ----- Reolerne ---------------------------------------------------------------- */
    function flaske(klasse) {
        return '<span class="vare-flaske k-' + klasse + '" aria-hidden="true"><i class="vf-prop"></i><i class="vf-hals"></i><i class="vf-krop"><i class="vf-etiket"></i></i></span>';
    }

    P.vis = function () {
        if (!this.aaben()) return;
        var mig = this, ejer = this.ejer;
        var hylde = D.STOFFER.filter(function (d) { return d.hylde; }).map(function (d) { return K.stof(d.id); });
        var udsolgt = F.udsolgt;
        var reoler = [
            { titel: "Alkoholer", klasse: "g-alk", varer: hylde.filter(function (s) { return s.klasse === "alkohol"; }) },
            { titel: "Syrer", klasse: "g-syre", varer: hylde.filter(function (s) { return s.klasse === "syre"; }),
              udsolgt: udsolgt.map(function (u) { return K.stof(u.id); }) },
            { titel: "Oxidationsmiddel", klasse: "g-ox", varer: hylde.filter(function (s) { return s.klasse === "ox"; }) }
        ];
        var boks = this.el.reoler;
        boks.innerHTML = "";

        reoler.forEach(function (r) {
            var reol = document.createElement("div");
            reol.className = "reol " + r.klasse;
            reol.innerHTML = '<div class="reol-skilt">' + NK.html(r.titel) + "</div>";
            var raekke = document.createElement("div");
            raekke.className = "reol-varer";
            r.varer.forEach(function (s) {
                var pris = ejer.stofPris(s.id);
                var nedsat = pris < s.pris;
                var tilbud = ejer.tilbud && ejer.tilbud.id === s.id;
                var iKurv = mig.kurv[s.id] || 0;
                var har = ejer.antal(s.id);
                var v = document.createElement("button");
                v.type = "button";
                v.className = "vare" + (iKurv ? " ikurv" : "") + (tilbud ? " tilbud" : "");
                v.setAttribute("data-id", s.id);
                v.title = "Læg 1 portion " + s.navn + " i kurven";
                v.innerHTML = flaske(s.klasse) +
                    '<span class="vare-navn">' + NK.html(s.navn) + "</span>" +
                    '<span class="vare-formel">' + NK.html(s.formel || "") + "</span>" +
                    '<span class="prisskilt">' + (nedsat ? "<s>" + s.pris + "</s> " : "") + pris + " kr</span>" +
                    (tilbud ? '<span class="vare-tilbud">Tilbud</span>' : "") +
                    (iKurv ? '<span class="vare-antal">' + iKurv + "</span>" : "") +
                    '<span class="vare-har">' + (har ? "på lager: " + har : "") + "</span>";
                v.addEventListener("click", function () { mig.laeg(s.id); });
                raekke.appendChild(v);
            });
            (r.udsolgt || []).forEach(function (s, i) {
                var v = document.createElement("button");
                v.type = "button";
                v.className = "vare udsolgt";
                v.innerHTML = flaske(s.klasse) +
                    '<span class="vare-navn">' + NK.html(s.navn) + "</span>" +
                    '<span class="vare-formel">' + NK.html(s.formel || "") + "</span>" +
                    '<span class="udsolgtskilt">Udsolgt</span>';
                v.addEventListener("click", function () { mig.sig(udsolgt[i].grund); });
                raekke.appendChild(v);
            });
            reol.appendChild(raekke);
            boks.appendChild(reol);
        });

        /* Udstyret */
        var reol = document.createElement("div");
        reol.className = "reol g-udstyr";
        reol.innerHTML = '<div class="reol-skilt">Udstyr</div>';
        var raekke = document.createElement("div");
        raekke.className = "reol-varer";
        F.udstyr.forEach(function (u) {
            var ejet = !!ejer.udstyr[u.id];
            var laast = !ejet && ejer.titelNr < u.titel;
            var v = document.createElement("button");
            v.type = "button";
            v.className = "vare udstyrsvare" + (ejet ? " ejet" : "") + (laast ? " laast" : "") + (mig.kurv[u.id] ? " ikurv" : "");
            v.setAttribute("data-id", u.id);
            v.innerHTML = '<span class="udstyr-ikon" aria-hidden="true">' + u.ikon + "</span>" +
                '<span class="vare-navn">' + NK.html(u.navn) + "</span>" +
                '<span class="vare-tekst">' + NK.html(u.tekst) + "</span>" +
                (ejet ? '<span class="prisskilt koebt">Købt ✓</span>' :
                    laast ? '<span class="prisskilt laas">Kræver ' + NK.html(F.titler[u.titel].titel.toLowerCase()) + "</span>" :
                        '<span class="prisskilt">' + ejer.udstyrPris(u) + " kr</span>") +
                (mig.kurv[u.id] ? '<span class="vare-antal">1</span>' : "");
            v.addEventListener("click", function () { mig.laeg(u.id); });
            raekke.appendChild(v);
        });
        reol.appendChild(raekke);
        boks.appendChild(reol);

        this.visKurv();
        this.visBoble();
    };

    P.visKurv = function () {
        var mig = this, boks = this.el.linjer;
        boks.innerHTML = "";
        var ids = Object.keys(this.kurv);
        if (!ids.length) boks.innerHTML = '<p class="kurv-tom">Kurven er tom.</p>';
        ids.forEach(function (id) {
            var u = udstyr(id);
            var navn = u ? u.navn : K.stof(id).navn;
            var linje = document.createElement("div");
            linje.className = "kurv-linje";
            linje.innerHTML = '<span class="kl-navn">' + NK.html(navn) + "</span>" +
                '<span class="kl-antal"><button type="button" class="kl-minus" aria-label="Én færre ' + NK.html(navn) + '">−</button><b>' +
                mig.kurv[id] + "</b>" + (u ? "" : '<button type="button" class="kl-plus" aria-label="Én mere ' + NK.html(navn) + '">+</button>') + "</span>" +
                '<span class="kl-pris">' + mig.linjePris(id) + " kr</span>";
            linje.querySelector(".kl-minus").addEventListener("click", function () { mig.tag(id); });
            var plus = linje.querySelector(".kl-plus");
            if (plus) plus.addEventListener("click", function () { mig.laeg(id); });
            boks.appendChild(linje);
        });
        var sum = this.ialt();
        NK.saetTekst("bu-ialt", sum + " kr");
        NK.saetTekst("bu-kasse", this.ejer.penge + " kr");
        NK.el("bu-ialt").classList.toggle("fordyrt", sum > this.ejer.penge);
        NK.el("bu-betal").classList.toggle("klar", sum > 0 && sum <= this.ejer.penge);
    };

    NK.Butik = Butik;
}());
