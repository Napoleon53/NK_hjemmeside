/* =====================================================================
   vej_opgaver.js - opgaverne paa fane 1 (Fra gram til gram)

   Runde T12 (27. nov. 2026, efter REGELSAET). Bygget paa motoren fra
   sc4.7 (vand_opgaver.js, T11), som er en kopi af T10's og T9's, med to
   slags trin til en regneopgave:
     * "valg": tre svar, hvor de forkerte er typiske fejl (REGELSAET 14)
     * "regn": tallet skrives i et felt i kortet ("n(Fe) = [   ] mol").
       Med formler vaelges formlen foerst blandt tre knapper.
   Skemaet paa tavlen viser "?" med gul ramme i den celle, kortet spoerger
   om, og tallet kommer ind, naar svaret er rigtigt (REGELSAET 28, 38).

     * Opgaverne i fast raekkefoelge i raekken oeverst i scenen. Titlerne
       laases op i takt (REGELSAET 3, 17, 18). Panelet er vaek.
     * Hver opgave er en raekke trin, ét felt ad gangen (REGELSAET 11, 36).
       Trinene staar i D.OPG_VEJ og teksterne i D.VEJ_TEKST (js/data.js).
     * Efter et rigtigt svar bliver kortet paa spoergsmaalet med
       forklaringen, og eleven trykker selv videre.
     * Hinttrappe: Giv et hint › Næste hint (2 af 3) › Næste hint (3 af 3)
       › Vis svaret.
     * Loeste opgaver gemmes i browseren. En loest opgave har alt fremme
       fra start (REGELSAET 16); Start forfra giver trinene igen.
     * Fri leg (REGELSAET 57): alle fire reaktioner fra D.VEJ med nye tal.
       Reaktionerne og Nye tal staar i raekken i stedet for opgaverne, og
       Tilbage til opgaverne bringer eleven tilbage. Efter sidste opgave er
       fri leg slaaet til, og kortet har ingen groen knap (som T10 og T11).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var GEM = "nk-sc5.6-vej-opg";
    var FRI_TRIN = [{ felt: "nK", type: "regn" }, { felt: "nS", type: "regn" }, { felt: "mS", type: "regn" }];

    function html(s) {
        return String(s === undefined || s === null ? "" : s)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    function saetTekstEl(e, t) { if (e && e.textContent !== t) e.textContent = t; }

    function laes() {
        try {
            var v = JSON.parse(window.localStorage.getItem(GEM) || "{}");
            return v && typeof v === "object" ? v : {};
        } catch (e) { return {}; }
    }

    NK.VejOpgaver = function (sim) {
        this.sim = sim;
        this.opg = D.OPG_VEJ;
        this.status = laes();
        this.nr = -1;
        this.trinNr = 0;
        this.tilstand = "trin";
        this.fri = false;
        this.alle = false;
        this.pauseNr = -1;
        this.friVej = D.VEJ[1].id;
        this.udkast = "";

        var mig = this;
        this.el = {
            kort: NK.el("vej-skort"), ind: NK.el("vej-ind"), bund: NK.el("vej-bund"),
            besked: NK.el("vej-besked"), knap: NK.el("vej-hjknap"), indsend: NK.el("vej-indsend"),
            liste: NK.el("vej-liste"), reak: NK.el("vej-reak"), forfra: NK.el("vej-forfra"), fri: NK.el("vej-frileg")
        };
        this.el.fri.addEventListener("click", function () { if (mig.fri) mig.tilbage(); else mig.friLeg(); });
        this.el.knap.addEventListener("click", function () { mig.hjaelpKlik(); });
        this.el.indsend.addEventListener("click", function () { mig.indsendKlik(); });
        this.el.forfra.addEventListener("click", function () { mig.forfra(); });
        this.el.ind.addEventListener("click", function (e) {
            var b = e.target.closest ? e.target.closest("button") : null;
            if (!b || b.disabled) return;
            if (b.hasAttribute("data-videre")) { mig.videre(); return; }
            if (b.hasAttribute("data-luk")) { mig.lukket = true; mig.visKort(); return; }
            if (b.hasAttribute("data-nr")) mig.vaelg(parseInt(b.getAttribute("data-nr"), 10));
        });
        /* Feltet i kortet: Enter sender ind (eller gaar videre, naar kortet er groent) */
        this.el.ind.addEventListener("keydown", function (e) {
            if (e.key !== "Enter" || !e.target || e.target.tagName !== "INPUT") return;
            e.preventDefault();
            e.stopPropagation();
            if (mig.tilstand === "bliv") mig.videre();
            else mig.indsendKlik();
        });
        this.el.ind.addEventListener("input", function (e) {
            if (!e.target || e.target.tagName !== "INPUT") return;
            mig.udkast = e.target.value;
            e.target.classList.remove("forkert");
            if (mig.besked && mig.besked.klasse === "skidt") mig.saetBesked("", "");
            mig.visIndsend();
        });

        this.bygRaekke();
    };

    var P = NK.VejOpgaver.prototype;

    P.start = function () {
        if (this.alleLoest()) this.visResultat();
        else this.aabn(this.foersteUloeste());
    };

    /* ----- Status og gemte fremskridt ------------------------------------------- */
    P.gem = function () {
        try { window.localStorage.setItem(GEM, JSON.stringify(this.status)); } catch (e) { /* privat vindue */ }
    };

    P.alleLoest = function () {
        var mig = this;
        return this.opg.every(function (o) { return !!mig.status[o.id]; });
    };

    P.foersteUloeste = function () {
        for (var i = 0; i < this.opg.length; i++) if (!this.status[this.opg[i].id]) return i;
        return 0;
    };

    /* Opgaven, der er i gang: en af de tre, eller den fri legs opgave */
    P.opgave = function () {
        if (this.fri) return this.friOpg || null;
        return this.nr >= 0 ? this.opg[this.nr] : null;
    };

    P.trin = function () {
        var o = this.opgave();
        return o ? o.trin[this.trinNr] : null;
    };

    P.erFri = function () { return !!this.fri; };

    /* Feltet, kortet spoerger om lige nu (eller null) */
    P.felt = function () {
        var t = this.trin();
        return t && this.tilstand === "trin" ? t.felt : null;
    };

    /* Er formlen det, der vaelges lige nu? */
    P.formelFase = function () {
        var t = this.trin();
        return !!(t && t.type === "regn" && t.formler && !this.formelOk && this.tilstand === "trin");
    };

    /* ----- Raekken oeverst ----------------------------------------------------------- */
    P.bygRaekke = function () {
        var mig = this;
        this.knapper = this.opg.map(function (o, i) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "or-knap";
            b.setAttribute("data-opg", o.id);
            b.innerHTML = '<span class="or-nr"></span><span class="or-navn"></span>';
            b.addEventListener("click", function () {
                if (b.classList.contains("laast")) return;
                mig.aabn(i);
            });
            mig.el.liste.appendChild(b);
            return b;
        });
        /* Den fri leg: de fire reaktioner og Nye tal */
        this.rknapper = D.VEJ.map(function (v) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "or-knap or-reak";
            b.setAttribute("data-vej", v.id);
            b.textContent = D.reaktion(v.r).navn;
            b.addEventListener("click", function () { mig.nyFri(v.id); });
            mig.el.reak.appendChild(b);
            return b;
        });
        var nye = document.createElement("button");
        nye.type = "button";
        nye.className = "or-knap or-nye";
        nye.innerHTML = 'Nye tal <span class="or-tegn">⟳</span>';
        nye.addEventListener("click", function () { mig.nyFri(mig.friVej); });
        this.el.reak.appendChild(nye);
        this.el.nye = nye;
    };

    P.visRaekke = function () {
        var mig = this, foerste = this.foersteUloeste(), alle = this.alleLoest();
        var fk = this.el.fri;
        var ft = this.fri ? "Tilbage til opgaverne" : "Fri leg";
        if (fk.textContent !== ft) fk.textContent = ft;
        fk.classList.toggle("valgt", !!this.fri);
        this.el.liste.hidden = !!this.fri;
        this.el.reak.hidden = !this.fri;
        this.opg.forEach(function (o, i) {
            var b = mig.knapper[i], s = mig.status[o.id];
            var aaben = !!s || i === mig.nr || (!alle && i === foerste);
            b.classList.toggle("laast", !aaben);
            b.disabled = !aaben;
            b.classList.toggle("valgt", i === mig.nr && !mig.fri);
            b.classList.toggle("loest", !!s);
            b.classList.toggle("stjerne", s === "stjerne");
            saetTekstEl(b.querySelector(".or-nr"), s === "stjerne" ? "★" : (s ? "✓" : String(i + 1)));
            saetTekstEl(b.querySelector(".or-navn"), aaben ? o.navn : "");
            b.title = aaben ? o.navn : "Låses op, når de forrige opgaver er løst";
        });
        this.rknapper.forEach(function (b) { b.classList.toggle("valgt", b.getAttribute("data-vej") === mig.friVej); });
        var l = this.fri ? this.el.reak : this.el.liste;
        l.classList.remove("kompakt");
        if (l.scrollWidth > l.clientWidth + 1) l.classList.add("kompakt");
    };

    /* ----- Opgaver og trin ----------------------------------------------------------- */
    P.aabn = function (nr, forfra) {
        this.fri = false;
        this.alle = false;
        this.nr = NK.klamp(nr, 0, this.opg.length - 1);
        var o = this.opgave();
        this.vist = false;
        this.fejlet = false;
        this.fremme = !forfra && !!this.status[o.id];
        this.sim.nyOpgave(o, this.fremme);
        if (this.fremme) {
            /* En loest opgave har alt fremme: kortet staar paa sidste trin (REGELSAET 16) */
            this.trinNr = o.trin.length - 1;
            this.nulTrin();
            this.tilstand = "bliv";
            this.formelOk = true;
            this.valgt = this.trin().type === "valg" ? this.rigtigNr(this.trin().svar) : -1;
            this.sim.spoerg(null);
            this.visRaekke();
            this.visKort();
            return;
        }
        this.trinNr = 0;
        this.tilstand = "trin";
        this.nytTrin();
    };

    P.nulTrin = function () {
        this.valgt = -1;
        this.forkert = {};
        this.hjaelp = 0;
        this.besked = { html: "", klasse: "" };
        this.peger = false;
        this.formelOk = false;
        this.udkast = "";
        this.trinVist = false;
    };

    P.nytTrin = function () {
        this.nulTrin();
        this.tilstand = "trin";
        var t = this.trin();
        this.sim.spoerg(t ? t.felt : null);
        this.visRaekke();
        this.visKort();
        this.fokus();
    };

    /* Start forfra: den aabne opgave med trinene igen */
    P.forfra = function () {
        this.aabn(this.fri ? (this.pauseNr >= 0 ? this.pauseNr : 0) : this.nr, true);
    };

    /* Fri leg: reaktionerne og Nye tal i raekken; knappen bringer eleven
       tilbage til den opgave, der var i gang (som i sc3.3 og sc4.7) */
    P.friLeg = function () {
        if (this.fri) return;
        this.pauseNr = this.nr;
        this.fri = true;
        this.lukket = false;
        this.nyFri(this.friVej);
    };

    P.tilbage = function () {
        if (!this.fri) return;
        this.aabn(this.pauseNr >= 0 ? this.pauseNr : this.foersteUloeste());
    };

    /* En ny opgave i den fri leg med reaktionen vejId og nye tal */
    P.nyFri = function (vejId) {
        this.fri = true;
        this.lukket = false;
        this.friVej = vejId;
        var v = null;
        D.VEJ.forEach(function (x) { if (x.id === vejId) v = x; });
        this.sidstFriN = this.sidstFriN || {};
        var n = this.sim.traekN(v.n, this.sidstFriN[vejId]);
        this.sidstFriN[vejId] = n;
        this.friOpg = { id: "fri", navn: D.reaktion(v.r).navn, vej: vejId, n: n, trin: FRI_TRIN };
        this.vist = false;
        this.fejlet = false;
        this.fremme = false;
        this.trinNr = 0;
        this.sim.nyOpgave(this.friOpg, false);
        this.nytTrin();
        if (this.alle) this.saetBesked(html(D.VEJ_FRI.alle), "peger");
    };

    P.trinLoest = function () {
        var o = this.opgave(), t = this.trin();
        if (!t) return;
        if (t.felt !== "reaktion") this.sim.loes(t.felt, this.trinVist ? "svar" : "ok");
        this.sim.spoerg(null);
        this.tilstand = "bliv";
        this.besked = { html: "", klasse: "" };
        if (this.trinNr >= o.trin.length - 1 && !this.fri) this.opgaveLoest();
        this.visRaekke();
        this.visKort();
    };

    P.opgaveLoest = function () {
        var o = this.opgave();
        var foer = this.status[o.id];
        this.status[o.id] = ((!this.vist && !this.fejlet) || foer === "stjerne") ? "stjerne" : "loest";
        this.gem();
    };

    /* Kortets groenne knap gaar altid fremad */
    P.videre = function () {
        if (this.tilstand !== "bliv") return;
        var o = this.opgave();
        if (this.trinNr < o.trin.length - 1) {
            this.trinNr++;
            this.nytTrin();
            return;
        }
        if (this.fri) { this.nyFri(this.friVej); return; }
        if (this.nr < this.opg.length - 1) { this.aabn(this.nr + 1); return; }
        this.visResultat();
    };

    /* Alle tre er loest: fri leg er slaaet til (REGELSAET 57) */
    P.visResultat = function () {
        this.alle = true;
        this.pauseNr = 0;
        this.nr = -1;
        this.friLegAlle();
    };

    P.friLegAlle = function () {
        this.fri = true;
        this.lukket = false;
        this.nyFri(this.friVej);
    };

    /* ----- Svar, hint og Indsend svar ---------------------------------------------- */
    P.svarListe = function () {
        var t = this.trin();
        if (!t || this.tilstand !== "trin") return null;
        if (t.type === "valg") return t.svar;
        if (this.formelFase()) return D.FORMLER[t.formler].svar;
        return null;
    };

    P.vaelg = function (i) {
        var liste = this.svarListe();
        if (!liste || this.forkert[i]) return;
        this.valgt = i;
        if (this.besked && this.besked.klasse === "skidt") this.besked = { html: "", klasse: "" };
        this.visKort();
    };

    P.rigtigNr = function (liste) {
        for (var i = 0; i < liste.length; i++) if (liste[i].ok) return i;
        return -1;
    };

    P.kanSendes = function () {
        if (this.tilstand !== "trin" || !this.trin()) return false;
        if (this.svarListe()) return this.valgt >= 0;
        return !!String(this.udkast || "").trim();
    };

    P.indsendKlik = function () {
        var t = this.trin();
        if (this.tilstand !== "trin" || !t) { this.blink(); return; }
        if (!this.kanSendes()) {
            this.blink();
            if (!this.svarListe()) { this.saetBesked("Skriv et tal i feltet først.", "peger"); this.fokus(); }
            return;
        }
        var liste = this.svarListe();
        if (liste) {
            if (this.valgt === this.rigtigNr(liste)) {
                if (t.type === "valg") { this.trinLoest(); return; }
                /* Formlen er rigtig: feltet til tallet kommer frem i samme kort */
                this.formelOk = true;
                this.valgt = -1;
                this.forkert = {};
                this.saetBesked('<span class="b-maerke">Rigtigt</span>' + html(D.FORMLER[t.formler].godt), "god");
                this.visKort();
                this.fokus();
                return;
            }
            var nej = liste[this.valgt].nej || "Det svar passer ikke.";
            this.forkert[this.valgt] = true;
            this.valgt = -1;
            this.fejl(html(nej));
            this.visKort();
            return;
        }
        var res = this.sim.tjekTal(t.felt, this.udkast);
        if (res.tom) { this.blink(); this.saetBesked(NK.Tjek.htmlBesked(res.besked), "peger"); this.fokus(); return; }
        if (res.ok) { this.trinLoest(); return; }
        this.fejl(NK.Tjek.htmlBesked(res.besked));
        var inp = this.el.ind.querySelector("input");
        if (inp) inp.classList.add("forkert");
        this.rystFelt();
        this.fokus();
    };

    P.fejl = function (h) {
        this.peger = true;
        this.fejlet = true;
        this.saetBesked('<span class="b-maerke">Ikke rigtigt</span>' + h, "skidt");
        this.ryst();
    };

    P.hints = function () {
        var t = this.trin();
        return t ? this.sim.tekster(t).hint : [];
    };

    P.hjaelpKlik = function () {
        var t = this.trin();
        if (this.tilstand !== "trin" || !t) return;
        this.peger = false;
        var hint = this.hints();
        if (this.hjaelp < hint.length) {
            this.hjaelp++;
            this.sim.fremhaev(t.felt);
            this.saetBesked('<span class="b-maerke">Hint ' + this.hjaelp + " af " + hint.length + "</span>" +
                html(hint[this.hjaelp - 1]), "hint");
            return;
        }
        this.visSvar();
    };

    /* Vis svaret: det rigtige svar eller tallet kommer ind, og kortet bliver gult */
    P.visSvar = function () {
        var t = this.trin();
        if (!t) return;
        this.vist = true;
        this.trinVist = true;
        if (t.type === "valg") this.valgt = this.rigtigNr(t.svar);
        this.formelOk = true;
        this.trinLoest();
    };

    P.saetBesked = function (h, klasse) {
        this.besked = { html: h || "", klasse: klasse || "" };
        if (this.fri && h) this.lukket = false;
        this.visKort();
    };

    P.ryst = function () {
        var e = this.el.bund;
        e.classList.remove("ryster");
        void e.offsetWidth;
        e.classList.add("ryster");
    };

    P.rystFelt = function () {
        var e = this.el.ind.querySelector(".kt-felt");
        if (!e) return;
        e.classList.remove("ryst");
        void e.offsetWidth;
        e.classList.add("ryst");
    };

    P.blink = function () {
        var e = this.el.kort;
        if (this.fri && this.lukket) { this.lukket = false; this.visKort(); }
        e.classList.remove("blink");
        void e.offsetWidth;
        e.classList.add("blink");
    };

    /* Et klik i scenen, der ikke er bedt om: kortet blinker (REGELSAET 15) */
    P.spaer = function () { this.blink(); };

    /* ----- Kortet ----------------------------------------------------------------------- */
    P.chip = function () {
        if (this.fri) return "Fri leg";
        var o = this.opgave();
        return o.trin.length > 1 ? "Trin " + (this.trinNr + 1) + " af " + o.trin.length : "Opgave " + (this.nr + 1);
    };

    P.kortHTML = function () {
        var t = this.trin(), s = this.sim;
        if (!t) return "";
        var tk = s.tekster(t), bliv = this.tilstand === "bliv", h = "";
        if (this.fri) h += '<button type="button" class="sk-luk" data-luk="1" title="Luk kortet" aria-label="Luk kortet">✕</button>';
        var indl = tk.tekst || "";
        if (this.formelFase()) indl = D.FORMLER[t.formler].tekst;
        h += '<p class="sk-tekst' + (this.fri ? " sk-start" : "") + '"><span class="sk-chip">' + html(this.chip()) + "</span>" +
            NK.Papir.tekst(html(indl ? indl + " " + tk.spm : tk.spm)) + "</p>";
        var liste = t.type === "valg" ? t.svar : (this.formelFase() ? D.FORMLER[t.formler].svar : null);
        if (liste) h += this.svarHTML(liste, t.type === "valg" && bliv);
        else h += this.feltHTML(t, bliv);
        if (bliv) {
            var o = this.opgave(), sidste = this.trinNr >= o.trin.length - 1;
            var knap = !sidste ? "Næste spørgsmål →" : (this.fri ? D.VEJ_FRI.nye : (this.nr < this.opg.length - 1 ? "Næste opgave →" : "Videre til fri leg →"));
            h += NK.Papir.bliv(html(tk.slut || ""), this.trinVist ? "Svaret" : "Rigtigt", knap, !!this.trinVist);
        }
        return h;
    };

    /* Feltet i kortet: "n(Fe) = [   ] mol". Med formlen foran, naar den er valgt.
       Naar trinet er loest, staar svaret groent (gult, naar det blev vist). */
    P.feltHTML = function (t, bliv) {
        var s = this.sim, h = '<div class="kt-felt-plads">';
        if (t.formler) {
            var F = D.FORMLER[t.formler].svar[this.rigtigNr(D.FORMLER[t.formler].svar)];
            h += '<span class="kf-formel">' + F.h + "</span>";
        }
        if (bliv) {
            h += '<span class="kt-felt ' + (this.trinVist ? "svar" : "ok") + '"><span class="kf-svar">' + s.svarLinje(t.felt) +
                '</span><span class="kf-maerke">' + (this.trinVist ? "↩" : "✓") + "</span></span>";
        } else {
            h += '<span class="kt-felt"><span class="kf-pre">' + s.venstre(t.felt) + " =</span>" +
                '<input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" placeholder="tallet" aria-label="' +
                html(s.feltNavn(t.felt)) + '"><span class="kf-enhed">' + s.enhed(t.felt) + "</span></span>";
        }
        return h + "</div>";
    };

    P.svarHTML = function (liste, bliv) {
        var mig = this, rigtig = this.rigtigNr(liste);
        var h = '<div class="sk-svar n' + liste.length + '">';
        liste.forEach(function (sv, i) {
            var k = "sk-knap", laast = bliv;
            if (bliv) {
                if (i === rigtig) k += mig.trinVist ? " svar-vist" : " rigtig";
                else if (mig.forkert[i]) k += " forkert";
                else k += " dim";
            } else {
                if (mig.forkert[i]) { k += " forkert"; laast = true; }
                else if (i === mig.valgt) k += " valgt";
            }
            h += '<button type="button" class="' + k + '" data-nr="' + i + '"' + (laast ? " disabled" : "") +
                "><span>" + (sv.h || html(sv.t)) + "</span></button>";
        });
        return h + "</div>";
    };

    P.visKort = function () {
        var t = this.trin(), bliv = this.tilstand === "bliv";
        var kl = "scenekort " + (bliv ? "loest bliv" + (this.trinVist ? " svar" : "") : (this.svarListe() ? "spm" : "opgave"));
        if (this.el.kort.className.replace(" blink", "") !== kl) this.el.kort.className = kl;
        var h = this.kortHTML();
        if (this._sidstInd !== h) {
            this.el.ind.innerHTML = h;
            this._sidstInd = h;
            var inp = this.el.ind.querySelector("input");
            if (inp && this.udkast) inp.value = this.udkast;
        }
        this.visBund();
        this.el.kort.hidden = !!(this.fri && this.lukket);
        if (this.sim.kortSkiftet) this.sim.kortSkiftet();
        return t;
    };

    /* Kortets nederste raekke: beskeden, hintknappen og Indsend svar */
    P.visBund = function () {
        var b = this.besked || { html: "", klasse: "" };
        var aktiv = this.tilstand === "trin";
        this.el.bund.hidden = !aktiv;
        if (!aktiv) return;
        if (this.el.besked.innerHTML !== b.html) this.el.besked.innerHTML = b.html;
        this.el.besked.hidden = !b.html;
        var ryster = this.el.bund.classList.contains("ryster");
        this.el.bund.className = "sk-bund" + (b.klasse ? " " + b.klasse : "") + (b.html ? "" : " tom") + (ryster ? " ryster" : "");
        var n = this.hints().length;
        var k = this.el.knap;
        var kt = this.hjaelp === 0 && n ? "Giv et hint" : (this.hjaelp < n ? "Næste hint (" + (this.hjaelp + 1) + " af " + n + ")" : "Vis svaret");
        if (k.textContent !== kt) k.textContent = kt;
        k.className = "knap hjaelp" + (this.hjaelp >= n ? " svar" : "") + (this.peger ? " peg" : "");
        this.visIndsend();
    };

    P.visIndsend = function () {
        var e = this.el.indsend;
        if (this.tilstand !== "trin") return;
        e.hidden = false;
        var kan = this.kanSendes();
        e.className = "knap indsend " + (kan ? "klar" : "ikke-klar");
        e.setAttribute("aria-disabled", kan ? "false" : "true");
    };

    /* Feltet i kortet faar fokus, saa eleven kan skrive med det samme */
    P.fokus = function () {
        if (this.tilstand !== "trin" || (this.fri && this.lukket)) return;
        if (!NK.el("fane-vej").classList.contains("aktiv") || document.querySelector(".overlay.vis") ||
            (NK.Rundvisning && NK.Rundvisning.aktiv())) return;
        var inp = this.el.ind.querySelector("input");
        if (!inp) return;
        try { inp.focus({ preventScroll: true }); } catch (e) { inp.focus(); }
    };

    /* Enter: Indsend svar, eller videre, naar kortet er groent */
    P.enter = function () {
        if (this.tilstand === "bliv") this.videre();
        else if (this.tilstand === "trin") this.indsendKlik();
    };

    /* ----- Kortets plads ----------------------------------------------------------------
       Det hoejeste, kortet kan blive: hvert trin i hver opgave i hver fase med
       hvert hint, hver forklaring til et forkert svar, typiske fejlbeskeder og
       det groenne kort, og den fri leg med hver reaktion. Maalt i en usynlig
       kopi af kortet i samme bredde (REGELSAET 4). */
    P.maalZone = function (kopi) {
        var mig = this, s = this.sim;
        var gemt = {};
        ["el", "nr", "trinNr", "tilstand", "fri", "alle", "friOpg", "friVej", "besked", "valgt", "forkert", "hjaelp",
            "trinVist", "_sidstInd", "fremme", "lukket", "vist", "peger", "formelOk", "udkast"].forEach(function (k) { gemt[k] = mig[k]; });
        var ind = kopi.children[0], bund = kopi.children[1];
        ind.innerHTML = "";
        this.el = { kort: kopi, ind: ind, bund: bund, besked: bund.querySelector(".st-tekst"),
            knap: bund.querySelector(".knap.hjaelp"), indsend: bund.querySelector(".knap.indsend"),
            liste: gemt.el.liste, reak: gemt.el.reak, forfra: gemt.el.forfra, fri: gemt.el.fri };
        var hoejst = 0;
        function maal() { mig._sidstInd = null; mig.kortHTMLmaal(); hoejst = Math.max(hoejst, kopi.offsetHeight); }
        function trinMaal(o) {
            s.medOpgave(o, function () {
                o.trin.forEach(function (t, j) {
                    mig.trinNr = j;
                    var tk = s.tekster(t), faser = t.type === "regn" && t.formler ? [false, true] : [true];
                    faser.forEach(function (fok) {
                        mig.tilstand = "trin"; mig.formelOk = fok; mig.valgt = -1; mig.forkert = {}; mig.hjaelp = 0;
                        mig.trinVist = false; mig.peger = false;
                        var beskeder = [""];
                        tk.hint.forEach(function (h, k) { beskeder.push('<span class="b-maerke">Hint ' + (k + 1) + " af 3</span>" + html(h)); });
                        var liste = t.type === "valg" ? t.svar : (t.formler && !fok ? D.FORMLER[t.formler].svar : []);
                        liste.forEach(function (sv) { if (sv.nej) beskeder.push('<span class="b-maerke">Ikke rigtigt</span>' + html(sv.nej)); });
                        if (t.formler && fok) beskeder.push('<span class="b-maerke">Rigtigt</span>' + html(D.FORMLER[t.formler].godt));
                        if (t.type === "regn" && (!t.formler || fok)) {
                            s.fejlProever(t.felt).forEach(function (b) { beskeder.push('<span class="b-maerke">Ikke rigtigt</span>' + b); });
                        }
                        if (mig.alle || mig.fri) beskeder.push(html(D.VEJ_FRI.alle));
                        beskeder.forEach(function (b) { mig.besked = { html: b, klasse: b ? "hint" : "" }; maal(); });
                    });
                    mig.besked = { html: "", klasse: "" };
                    mig.tilstand = "bliv";
                    mig.formelOk = true;
                    [false, true].forEach(function (v) { mig.trinVist = v; maal(); });
                });
            });
        }
        this.fri = false;
        this.alle = false;
        this.opg.forEach(function (o, i) { mig.nr = i; trinMaal(o); });
        this.fri = true;
        D.VEJ.forEach(function (v) {
            var nMaks = Math.max.apply(null, v.n);
            mig.friOpg = { id: "fri", navn: D.reaktion(v.r).navn, vej: v.id, n: nMaks, trin: FRI_TRIN };
            trinMaal(mig.friOpg);
        });
        for (var k in gemt) if (Object.prototype.hasOwnProperty.call(gemt, k)) this[k] = gemt[k];
        this._sidstInd = null;
        return hoejst;
    };

    /* Kortet i kopien: indholdet og den nederste raekke, som visKort og visBund */
    P.kortHTMLmaal = function () {
        var bliv = this.tilstand === "bliv";
        this.el.kort.className = "scenekort " + (bliv ? "loest bliv" + (this.trinVist ? " svar" : "") : "opgave");
        this.el.ind.innerHTML = this.kortHTML();
        var b = this.besked || { html: "", klasse: "" };
        this.el.bund.hidden = bliv;
        if (!bliv) {
            this.el.besked.innerHTML = b.html;
            this.el.besked.hidden = !b.html;
            this.el.bund.className = "sk-bund" + (b.klasse ? " " + b.klasse : "") + (b.html ? "" : " tom");
            this.el.knap.textContent = "Næste hint (2 af 3)";
        }
    };
}());
