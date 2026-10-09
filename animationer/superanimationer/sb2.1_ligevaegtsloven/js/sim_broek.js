/* =====================================================================
   sim_broek.js - fane 1: broeken

   Reaktionsskemaet staar paa tavlen og under det K = en broek med en
   taeller og en naevner. Eleven traekker brikker fra bakken under
   tavlen op i broeken: stofferne (de rigtige og nogle, der ligner),
   tegnene · + − 1 og eksponenterne. Et klik paa en brik i bakken
   laegger den bagerst i den blaa zone, og et klik paa en brik i broeken
   fjerner den. Tjek broeken (eller Enter) doemmer med js/broek.js.

   Arbejdet i hver opgave huskes, mens siden er aaben, saa man kan
   springe frem og tilbage. Loeste opgaver huskes i browseren.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var B = NK.Broek;

    function SimBroek() {
        var mig = this;
        this.skemaEl = NK.el("br-skema");
        this.tavle = NK.el("br-tavle");
        this.zoner = { num: NK.el("br-num"), den: NK.el("br-den") };
        this.tjekKnap = NK.el("br-tjek");
        this.bakke = { stof: NK.el("br-stoffer"), tegn: NK.el("br-tegn"), eks: NK.el("br-eks") };
        this.arbejde = {};
        this.aktivZone = "num";
        this.rod = [];
        this.tjekKnap.addEventListener("click", function () { mig.tjek(); });
        ["num", "den"].forEach(function (z) {
            mig.zoner[z].addEventListener("click", function (e) {
                if (e.target.closest && e.target.closest(".brik")) return;
                mig.vaelgZone(z);
            });
        });
        this.traek = new Traek(this);
        this.bygFasteBrikker();
        this.startFane(D.BROEK, D.GRUPPER);
        this.vaelg(0);
    }

    var P = SimBroek.prototype;
    NK.Fane.paa(P, { navn: "br", naesteFane: "fane-ff", naesteNavn: "Find fejlen" });

    /* ----- Opgaven ------------------------------------------------------------- */
    P.lavOpgave = function (i) {
        var o = this.opgaver[i];
        var a = this.arbejde[o.id];
        if (!a) a = this.arbejde[o.id] = { num: [], den: [], orden: NK.bland(o.stoffer), faerdig: false, vist: false, slut: null };
        this.opg = { o: o, a: a };
        this.faerdig = a.faerdig;
        this.brugtSvar = a.vist;
        this.slut = a.slut;
        this.rod = [];
        this.aktivZone = "num";
        NK.saetTekst("br-navn", o.navn);
        this.bygSkema(o);
        this.bygStofBrikker();
        this.visTilstand();
    };

    P.paabegyndt = function (i) {
        var a = this.arbejde[this.opgaver[i].id];
        return !!(a && !a.faerdig && (a.num.length || a.den.length));
    };

    P.promptHTML = function () {
        var o = this.opg.o;
        var h = '<p class="note-tekst">' + NK.html(o.tekst) + "</p>";
        if (this.faerdig) {
            h += '<div class="forklaring"><div class="fk-broek">' + B.kHTML(o) + " = " + B.broekHTML(B.facit(o)) +
                "</div><p>" + o.forklaring + "</p></div>";
        }
        return h;
    };

    P.trinLinje = function () {
        var a = this.opg.a;
        if (!a.num.length && !a.den.length) return "Træk et stof fra bakken op i tælleren eller ned i nævneren.";
        return "Byg resten af brøken, og tryk Tjek brøken.";
    };

    P.hintTrin = function () {
        var a = this.opg.a;
        return B.hintTrin(this.opg.o, a.num, a.den);
    };

    /* Facit som brikker: stof, eksponent og gangeprik */
    function somBrikker(liste) {
        var ud = [];
        liste.forEach(function (l, i) {
            if (i > 0) ud.push({ k: "tegn", v: "·" });
            ud.push({ k: "stof", v: l.s });
            if (l.e > 1) ud.push({ k: "eks", v: l.e });
        });
        return ud;
    }

    P.svarTekst = function () {
        var o = this.opg.o;
        return B.kHTML(o) + " = " + NK.html(B.linje(B.facit(o))) + ".";
    };

    P.visSvar = function () {
        var o = this.opg.o, a = this.opg.a, F = B.facit(o);
        this.brugtSvar = true;
        a.num = somBrikker(F.num);
        a.den = somBrikker(F.den);
        if (!F.den.length) a.den = [{ k: "tegn", v: "1" }];
        this.rod = [];
        this.loest("svar", this.svarTekst());
    };

    /* ----- Tjek ---------------------------------------------------------------- */
    P.tjek = function () {
        if (this.faerdig) return;
        var o = this.opg.o, a = this.opg.a;
        var d = B.dom(o, a.num, a.den);
        if (d.ok) {
            this.rod = [];
            this.loest("selv", this.svarTekst() + (d.enEks ? " " + NK.html("1" + NK.haevet(d.enEks) + " = 1, så nævneren er 1.") : ""), "Rigtigt ✓");
            return;
        }
        this.rod = d.rod || [];
        this.tegnZoner();
        this.tavle.classList.remove("ryst");
        void this.tavle.offsetWidth;
        this.tavle.classList.add("ryst");
        this.fejlLinje(d.tekst);
    };

    P.enter = function () {
        if (this.faerdig) this.knap();
        else this.tjek();
    };

    P.efterOpgave = function () {
        var a = this.opg.a;
        a.faerdig = true;
        a.vist = this.brugtSvar;
        a.slut = this.slut;
        this.visTilstand();
    };

    /* R og Forfra: samme reaktion med en tom broek */
    P.nulstil = function () {
        var a = this.opg.a;
        a.num = [];
        a.den = [];
        a.faerdig = false;
        a.vist = false;
        a.slut = null;
        this.vaelg(this.nr);
    };

    P.fokusFelt = function () {};

    /* ----- Aendringer i broeken ------------------------------------------------- */
    P.aendret = function () {
        this.rod = [];
        this.nulstilHjaelp();
        this.tegnZoner();
        this.naesteLinje("", "");
        this.visListe();
    };

    P.vaelgZone = function (z) {
        if (this.faerdig) return;
        this.aktivZone = z;
        this.tegnZoner();
    };

    P.tilfoej = function (z, tok, idx) {
        if (this.faerdig) return;
        var L = this.opg.a[z];
        if (idx === undefined || idx < 0 || idx > L.length) idx = L.length;
        L.splice(idx, 0, { k: tok.k, v: tok.v });
        this.aktivZone = z;
        this.aendret();
    };

    P.fjern = function (z, i) {
        if (this.faerdig) return;
        this.opg.a[z].splice(i, 1);
        this.aendret();
    };

    P.flyt = function (fra, z, idx) {
        if (this.faerdig) return;
        var tok = this.opg.a[fra.z].splice(fra.i, 1)[0];
        if (!tok) return;
        var L = this.opg.a[z];
        if (idx < 0 || idx > L.length) idx = L.length;
        L.splice(idx, 0, tok);
        this.aktivZone = z;
        this.aendret();
    };

    /* Et klik uden traek */
    P.brikKlik = function (kilde) {
        if (this.faerdig) {
            this.kortBesked("Brøken er færdig. Knappen forneden går videre.", 3);
            return;
        }
        if (kilde.fra === "zone") this.fjern(kilde.z, kilde.i);
        else this.tilfoej(this.aktivZone, kilde);
    };

    /* Et traek, der blev sluppet i en zone */
    P.slipI = function (kilde, z, idx) {
        if (this.faerdig) return;
        if (kilde.fra === "zone") this.flyt(kilde, z, idx);
        else this.tilfoej(z, kilde, idx);
    };

    P.slipUde = function () {
        if (this.faerdig) return;
        this.kortBesked("Slip brikken i tælleren eller nævneren.", 3);
    };

    /* ----- Brikkerne ------------------------------------------------------------ */
    function brikTekst(k, v) {
        if (k === "stof") return B.kon(v);
        if (k === "eks") return NK.haevet(v);
        return v;
    }

    P.lavBrik = function (tok, kilde) {
        var mig = this;
        var b = document.createElement("button");
        b.type = "button";
        b.className = "brik " + tok.k;
        if (tok.k === "tegn" && tok.v === "1") b.classList.add("en");
        b.textContent = brikTekst(tok.k, tok.v);
        b.setAttribute("aria-label", tok.k === "eks" ? "Eksponent " + tok.v : (tok.v === "·" ? "Gangeprik" : b.textContent));
        b.addEventListener("pointerdown", function (e) { mig.traek.begynd(e, b, kilde); });
        /* Med tastaturet: Enter eller mellemrum paa en brik */
        b.addEventListener("click", function (e) { if (e.detail === 0) mig.brikKlik(kilde); });
        return b;
    };

    P.bygFasteBrikker = function () {
        var mig = this;
        this.bakke.tegn.innerHTML = "";
        D.TEGN.forEach(function (v) {
            mig.bakke.tegn.appendChild(mig.lavBrik({ k: "tegn", v: v }, { fra: "bakke", k: "tegn", v: v }));
        });
        this.bakke.eks.innerHTML = "";
        D.EKS.forEach(function (v) {
            mig.bakke.eks.appendChild(mig.lavBrik({ k: "eks", v: v }, { fra: "bakke", k: "eks", v: v }));
        });
    };

    P.bygStofBrikker = function () {
        var mig = this, a = this.opg.a;
        this.bakke.stof.innerHTML = "";
        a.orden.forEach(function (s) {
            mig.bakke.stof.appendChild(mig.lavBrik({ k: "stof", v: s }, { fra: "bakke", k: "stof", v: s }));
        });
    };

    P.erRod = function (z, i) {
        for (var j = 0; j < this.rod.length; j++) if (this.rod[j].z === z && this.rod[j].i === i) return true;
        return false;
    };

    P.tegnZoner = function () {
        var mig = this, a = this.opg.a, o = this.opg.o;
        ["num", "den"].forEach(function (z) {
            var el = mig.zoner[z];
            el.innerHTML = "";
            a[z].forEach(function (t, i) {
                var b = mig.lavBrik(t, { fra: "zone", z: z, i: i, k: t.k, v: t.v });
                b.classList.add("i-zone");
                /* I broeken staar eksponenten som et lille tal hoejt oppe */
                if (t.k === "eks") b.textContent = String(t.v);
                if (mig.erRod(z, i)) b.classList.add("rod");
                if (mig.faerdig) {
                    if (t.k === "stof") b.classList.add(z === "num" ? "op" : "ned");
                    if (t.k === "eks") b.classList.add("gul");
                }
                el.appendChild(b);
            });
            /* Er naevneren tom i en loest opgave, staar der 1 */
            if (mig.faerdig && !a[z].length && !B.facit(o)[z].length) {
                var en = document.createElement("span");
                en.className = "auto-en";
                en.textContent = "1";
                el.appendChild(en);
            }
            el.classList.toggle("har", el.children.length > 0);
            el.classList.toggle("aktiv", z === mig.aktivZone && !mig.faerdig);
        });
    };

    /* Tavlen, stemplet, K og knapperne efter, om opgaven er loest */
    P.visTilstand = function () {
        var o = this.opg.o, a = this.opg.a;
        this.tavle.classList.remove("ryst");
        this.tavle.classList.toggle("faerdig", this.faerdig && !a.vist);
        this.tavle.classList.toggle("vist", this.faerdig && a.vist);
        NK.el("br-k").innerHTML = (this.faerdig ? B.kHTML(o) : "K") + " =";
        var st = NK.el("br-stempel");
        st.hidden = !this.faerdig;
        st.textContent = a.vist ? "Svaret" : "Rigtigt ✓";
        st.classList.toggle("gul", !!a.vist);
        this.tjekKnap.hidden = this.faerdig;
        NK.el("br-bakke").classList.toggle("laast", this.faerdig);
        this.visKobling(this.faerdig);
        this.visLys();
        this.tegnZoner();
    };

    /* ===================================================================
       Traek og slip med musen, fingeren eller pennen. En brik, der
       holdes, foelger musen, og en groen streg viser, hvor den lander,
       ogsaa midt mellem to andre brikker. Sluppet uden for broeken
       forsvinder en brik fra broeken igen.
       =================================================================== */
    function Traek(sim) {
        var mig = this;
        this.sim = sim;
        this.nul();
        document.addEventListener("pointermove", function (e) { mig.flyt(e); });
        document.addEventListener("pointerup", function (e) { mig.slip(e); });
        document.addEventListener("pointercancel", function () { mig.afbryd(); });
        document.addEventListener("keydown", function (e) { if (e.key === "Escape") mig.afbryd(); });
    }

    var T = Traek.prototype;

    T.nul = function () {
        this.aktiv = false;
        this.kilde = null;
        this.el = null;
        this.spoegelse = null;
        this.mark = null;
        this.maal = null;
        this.flyttet = false;
    };

    T.begynd = function (e, el, kilde) {
        if (e.button !== undefined && e.button !== 0) return;
        this.aktiv = true;
        this.kilde = kilde;
        this.el = el;
        this.x0 = e.clientX;
        this.y0 = e.clientY;
        var r = el.getBoundingClientRect();
        this.dx = e.clientX - r.left;
        this.dy = e.clientY - r.top;
        this.r = r;
        this.flyttet = false;
        e.preventDefault();
    };

    T.lavSpoegelse = function () {
        var g = this.el.cloneNode(true);
        g.classList.add("spoegelse");
        g.classList.remove("rod");
        g.style.width = this.r.width + "px";
        g.style.height = this.r.height + "px";
        document.body.appendChild(g);
        this.spoegelse = g;
        if (this.kilde.fra === "zone") this.el.classList.add("slaebes");
        this.mark = document.createElement("span");
        this.mark.className = "mark";
        this.sim.zoner.num.classList.add("mulig");
        this.sim.zoner.den.classList.add("mulig");
    };

    T.zoneVed = function (x, y) {
        var pad = 18;
        var zoner = this.sim.zoner;
        for (var z in zoner) {
            var r = zoner[z].getBoundingClientRect();
            if (x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad) return z;
        }
        return null;
    };

    T.flyt = function (e) {
        if (!this.aktiv) return;
        if (!this.flyttet) {
            if (Math.hypot(e.clientX - this.x0, e.clientY - this.y0) < 6) return;
            if (this.sim.faerdig) { this.nul(); return; }
            this.flyttet = true;
            this.lavSpoegelse();
        }
        this.spoegelse.style.left = (e.clientX - this.dx) + "px";
        this.spoegelse.style.top = (e.clientY - this.dy) + "px";
        var z = this.zoneVed(e.clientX, e.clientY);
        if (z !== this.maal) {
            if (this.maal) this.sim.zoner[this.maal].classList.remove("over");
            if (z) this.sim.zoner[z].classList.add("over");
            this.maal = z;
        }
        this.spoegelse.classList.toggle("ud", this.kilde.fra === "zone" && !z);
        if (z) this.saetMark(z, e.clientX, e.clientY);
        else if (this.mark.parentNode) this.mark.parentNode.removeChild(this.mark);
    };

    /* Markoeren saettes foran den foerste brik, musen er til venstre for */
    T.saetMark = function (z, x, y) {
        var zone = this.sim.zoner[z], el = this.el;
        if (this.mark.parentNode) this.mark.parentNode.removeChild(this.mark);
        var brikker = Array.prototype.filter.call(zone.querySelectorAll(".brik"), function (b) { return b !== el; });
        var idx = brikker.length;
        for (var i = 0; i < brikker.length; i++) {
            var r = brikker[i].getBoundingClientRect();
            if (y < r.bottom && x < r.left + r.width / 2) { idx = i; break; }
        }
        if (brikker[idx]) zone.insertBefore(this.mark, brikker[idx]);
        else zone.appendChild(this.mark);
    };

    /* Pladsen, markoeren staar paa, talt i brikker uden den, der flyttes */
    T.markIndeks = function () {
        var n = 0, el = this.el;
        var boern = this.mark.parentNode ? this.mark.parentNode.children : [];
        for (var i = 0; i < boern.length; i++) {
            if (boern[i] === this.mark) return n;
            if (boern[i].classList.contains("brik") && boern[i] !== el) n++;
        }
        return n;
    };

    T.ryd = function () {
        if (this.spoegelse && this.spoegelse.parentNode) this.spoegelse.parentNode.removeChild(this.spoegelse);
        if (this.mark && this.mark.parentNode) this.mark.parentNode.removeChild(this.mark);
        if (this.el) this.el.classList.remove("slaebes");
        var zoner = this.sim.zoner;
        for (var z in zoner) zoner[z].classList.remove("over", "mulig");
    };

    T.slip = function () {
        if (!this.aktiv) return;
        var kilde = this.kilde;
        if (!this.flyttet) {
            this.nul();
            this.sim.brikKlik(kilde);
            return;
        }
        var z = this.maal, idx = z ? this.markIndeks() : -1;
        this.ryd();
        this.nul();
        if (z) this.sim.slipI(kilde, z, idx);
        else if (kilde.fra === "zone") this.sim.fjern(kilde.z, kilde.i);
        else this.sim.slipUde();
    };

    T.afbryd = function () {
        if (!this.aktiv) return;
        this.ryd();
        this.nul();
    };

    NK.SimBroek = SimBroek;
}());
