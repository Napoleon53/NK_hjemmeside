/* =====================================================================
   sim_fejl.js - fane 2: find fejlen

   En elev har skrevet reaktionsbroeken paa tavlen. Hver del af broeken
   kan klikkes: leddene, tegnene, et tal foran og 1. Er delen rigtig,
   faar den et groent flueben, og linjen siger hvorfor. Er det fejlen,
   faar den en roed ring, og den rettede broek kommer frem under den.
   To af de tolv tavler har ingen fejl; der er svaret knappen Ingen fejl.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var B = NK.Broek;

    function SimFejl() {
        var mig = this;
        this.skemaEl = NK.el("ff-skema");
        this.tavle = NK.el("ff-tavle");
        this.ingenKnap = NK.el("ff-ingen");
        this.ingenKnap.addEventListener("click", function () { mig.ingenFejl(); });
        this.startFane(D.FEJL, [{ id: "alle", titel: "" }]);
        this.vaelg(0);
    }

    var P = SimFejl.prototype;
    NK.Fane.paa(P, { navn: "ff" });

    /* ----- Opgaven ------------------------------------------------------------- */
    P.lavOpgave = function (i) {
        var o = this.opgaver[i];
        this.opg = { o: o, gode: {}, fundet: false, vist: false };
        this.slut = null;
        NK.saetTekst("ff-navn", o.navn);
        this.bygSkema(o);
        this.bygBroek();
        this.visTilstand();
    };

    P.promptHTML = function () {
        var o = this.opg.o;
        var h = '<p class="note-tekst">En elev har skrevet reaktionsbrøken på tavlen. Find fejlen, hvis der er en.</p>';
        if (this.faerdig) {
            h += '<div class="forklaring"><div class="fk-broek">' + B.kHTML(o) + " = " + B.broekHTML(B.facit(o)) +
                "</div><p>" + o.forklaring + "</p></div>";
        }
        return h;
    };

    P.trinLinje = function () {
        return "Klik på den del af brøken, der er forkert. Er der ingen fejl, så tryk Ingen fejl.";
    };

    P.hintTrin = function () {
        var o = this.opg.o;
        return { s: o.lys, trin: o.hint };
    };

    P.erMaal = function (z, i) {
        var m = this.opg.o.maal;
        for (var j = 0; j < m.length; j++) if (m[j][0] === z && m[j][1] === i) return true;
        return false;
    };

    /* ----- Et klik paa en del af broeken --------------------------------------------- */
    P.klikDel = function (z, i, el) {
        var o = this.opg.o;
        if (this.faerdig) {
            this.kortBesked("Tavlen er rettet. Knappen forneden går videre.", 3);
            return;
        }
        if (this.erMaal(z, i)) {
            this.opg.fundet = true;
            this.loest("selv", o.forklaring, "Fundet ✓");
            return;
        }
        var del = o[z][i];
        this.opg.gode[z + i] = true;
        el.classList.add("god");
        this.fejlLinje(B.godDel(o, del), "Ikke den");
    };

    P.ingenFejl = function () {
        if (this.faerdig) {
            this.kortBesked("Tavlen er rettet. Knappen forneden går videre.", 3);
            return;
        }
        if (!this.opg.o.slags) {
            this.loest("selv", this.opg.o.forklaring, "Rigtigt ✓");
            return;
        }
        this.ingenKnap.classList.remove("ryst");
        void this.ingenKnap.offsetWidth;
        this.ingenKnap.classList.add("ryst");
        this.fejlLinje("Der er en fejl i brøken. Gå skemaet igennem stof for stof.");
    };

    P.visSvar = function () {
        this.opg.vist = true;
        this.brugtSvar = true;
        this.loest("svar", this.opg.o.forklaring);
    };

    P.enter = function () {
        if (this.faerdig) this.knap();
    };

    P.efterOpgave = function () {
        this.visTilstand();
    };

    /* R og Forfra: samme tavle uden flueben */
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
                b.addEventListener("click", function () { mig.klikDel(z, i, b); });
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
        /* Fejlen faar en ring, roed naar eleven fandt den, gul ved Vis svaret */
        var dele = this.tavle.querySelectorAll(".del");
        for (var i = 0; i < dele.length; i++) {
            var d = dele[i], z = d.getAttribute("data-z"), n = parseInt(d.getAttribute("data-i"), 10);
            var m = this.faerdig && mig.erMaal(z, n);
            d.classList.toggle("fejlen", m && !vist);
            d.classList.toggle("fejlen-vist", m && vist);
            d.classList.toggle("god", !!this.opg.gode[z + n]);
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
        this.ingenKnap.hidden = this.faerdig;
        this.visKobling(this.faerdig);
        this.visLys();
    };

    NK.SimFejl = SimFejl;
}());
