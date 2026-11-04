/* =====================================================================
   sim_fejl.js - fane 2: find fejlen

   En elev har skrevet reaktionsbroeken paa tavlen. Hver del af broeken
   kan vaelges med et klik: leddene, tegnene, et tal foran og 1. Paa
   kortet kan eleven i stedet vaelge "Der er ingen fejl". Et valg
   bedoemmes foerst, naar eleven trykker Indsend svar (brugeren 24. okt.
   2026: svarknapper vaelger kun). Er den valgte del rigtig, faar den et
   groent flueben, og kortet siger hvorfor. Er det fejlen, faar den en
   roed ring, og den rettede broek kommer frem under den. To af de tolv
   tavler har ingen fejl.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var B = NK.Broek;

    function SimFejl() {
        this.skemaEl = NK.el("ff-skema");
        this.tavle = NK.el("ff-tavle");
        this.startFane(D.FEJL, [{ id: "alle", titel: "" }]);
        this.vaelg(0);
    }

    var P = SimFejl.prototype;
    NK.Fane.paa(P, { navn: "ff", chip: "Tavle" });

    /* ----- Opgaven ------------------------------------------------------------- */
    P.lavOpgave = function (i) {
        var o = this.opgaver[i];
        this.opg = { o: o, gode: {}, fundet: false, vist: false, ingen: false };
        this.valgt = null;            /* { z, i } eller "ingen" */
        this.slut = null;
        NK.saetTekst("ff-navn", o.navn);
        this.bygSkema(o);
        this.bygBroek();
        this.visTilstand();
    };

    /* Kortet: spoergsmaalet og svaret Der er ingen fejl */
    P.kortData = function () {
        var o = this.opg.o, kl = "";
        if (this.faerdig) kl = !o.slags ? (this.opg.vist ? "svar-vist" : "rigtig") : "dim";
        else if (this.valgt === "ingen") kl = "valgt";
        else if (this.opg.ingen) kl = "forkert";
        return {
            tekst: "Hvilken del af elevens reaktionsbrøk på tavlen er forkert? Klik på delen, eller vælg Der er ingen fejl.",
            svar: [{ t: "Der er ingen fejl", klasse: kl, laast: this.faerdig || this.opg.ingen }]
        };
    };

    P.trinLinje = function () { return ""; };

    P.hintTrin = function () {
        var o = this.opg.o;
        return { s: o.lys, trin: o.hint };
    };

    P.erMaal = function (z, i) {
        var m = this.opg.o.maal;
        for (var j = 0; j < m.length; j++) if (m[j][0] === z && m[j][1] === i) return true;
        return false;
    };

    /* ----- Valget: en del paa tavlen eller Der er ingen fejl ------------------------- */
    P.klikDel = function (z, i) {
        if (this.spaer()) return;
        if (this.opg.gode[z + i]) {
            this.kortBesked(B.godDel(this.opg.o, this.opg.o[z][i]), 4);
            return;
        }
        var v = this.valgt;
        this.valgt = (v && v.z === z && v.i === i) ? null : { z: z, i: i };
        this.nytValg();
    };

    P.valgKlik = function () {
        if (this.faerdig || this.opg.ingen) return;
        this.valgt = this.valgt === "ingen" ? null : "ingen";
        this.nytValg();
    };

    P.nytValg = function () {
        this.nulstilHjaelp();
        if (this.fast.klasse === "skidt") this.naesteLinje("", "");
        this.visTilstand();
        this.visKort();
    };

    P.kanIndsende = function () { return !!this.valgt; };

    P.indsendTekst = function () {
        if (this.valgt === "ingen") return "Indsend svar: ingen fejl";
        if (!this.valgt) return "";
        var del = this.opg.o[this.valgt.z][this.valgt.i] || { t: "en" };
        return "Indsend svar: " + B.delTekst(del);
    };

    /* ----- Indsend svar --------------------------------------------------------------- */
    P.indsend = function () {
        var o = this.opg.o, v = this.valgt;
        if (!v) return;
        this.valgt = null;
        if (v === "ingen") {
            if (!o.slags) { this.loest("selv", o.forklaring); return; }
            this.opg.ingen = true;
            this.visTilstand();
            this.visKort();
            this.fejlLinje("Der er en fejl i brøken. Gå skemaet igennem stof for stof.");
            return;
        }
        if (this.erMaal(v.z, v.i)) {
            this.opg.fundet = true;
            this.loest("selv", o.forklaring, "Fundet");
            return;
        }
        var del = o[v.z][v.i] || { t: "en" };
        this.opg.gode[v.z + v.i] = true;
        this.visTilstand();
        this.visKort();
        this.fejlLinje(B.godDel(o, del), "Ikke den");
    };

    P.visSvar = function () {
        this.opg.vist = true;
        this.brugtSvar = true;
        this.valgt = null;
        this.loest("svar", this.opg.o.forklaring);
    };

    P.enter = function () {
        if (this.faerdig) { if (this.videreTekst()) this.knap(); }
        else this.indsendKlik();
    };

    P.efterOpgave = function () {
        this.visTilstand();
    };

    /* R og Start forfra: samme tavle uden flueben */
    P.nulstil = function () { this.vaelg(this.nr); };

    P.fokusFelt = function () {};

    /* ----- Tavlen ------------------------------------------------------------------- */
    P.bygBroek = function () {
        var mig = this, o = this.opg.o;
        ["num", "den"].forEach(function (z) {
            var el = NK.el("ff-" + z);
            el.innerHTML = "";
            var dele = o[z].length ? o[z] : [{ t: "en" }];
            dele.forEach(function (del, i) {
                var b = document.createElement("button");
                b.type = "button";
                b.className = "del " + del.t;
                b.textContent = B.delTekst(del);
                b.setAttribute("data-z", z);
                b.setAttribute("data-i", String(i));
                b.addEventListener("click", function () { mig.klikDel(z, i); });
                el.appendChild(b);
            });
        });
    };

    P.visTilstand = function () {
        var o = this.opg.o, mig = this;
        var vist = this.faerdig && this.opg.vist;
        this.tavle.classList.remove("ryst");
        this.tavle.classList.toggle("faerdig", this.faerdig && !vist);
        this.tavle.classList.toggle("vist", vist);
        NK.el("ff-k").innerHTML = (o.ksub ? B.kHTML(o) : "K") + " =";
        var st = NK.el("ff-stempel");
        st.hidden = !this.faerdig;
        st.textContent = vist ? "Svaret" : (o.slags ? "Fundet ✓" : "Ingen fejl ✓");
        st.classList.toggle("gul", vist);
        /* Fejlen faar en ring, roed naar eleven fandt den, gul ved Vis svaret.
           Den valgte del er blaa, til den er sendt ind. */
        var v = this.valgt && this.valgt !== "ingen" ? this.valgt : null;
        var dele = this.tavle.querySelectorAll(".del");
        for (var i = 0; i < dele.length; i++) {
            var d = dele[i], z = d.getAttribute("data-z"), n = parseInt(d.getAttribute("data-i"), 10);
            var m = this.faerdig && mig.erMaal(z, n);
            d.classList.toggle("fejlen", m && !vist);
            d.classList.toggle("fejlen-vist", m && vist);
            d.classList.toggle("god", !!this.opg.gode[z + n]);
            d.classList.toggle("valgt", !!v && v.z === z && v.i === n && !this.faerdig);
            d.disabled = false;
        }
        /* Den rettede broek under den gamle */
        var ret = NK.el("ff-rettet");
        if (this.faerdig && o.slags) {
            ret.innerHTML = '<span class="rt-etiket">Rettet</span> ' + B.kHTML(o) + " = " + B.broekHTML(B.facit(o), "stor");
            ret.hidden = false;
        } else {
            ret.innerHTML = "";
            ret.hidden = true;
        }
        this.tavle.classList.toggle("laast", !!this.faerdig);
        this.visKobling(this.faerdig);
        this.visLys();
    };

    NK.SimFejl = SimFejl;
}());
