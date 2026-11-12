/* =====================================================================
   sim_beregning.js - fane 2: beregningen

   Tre opgaver: maaling 1 og 2 fra fane 1 (eller et eksempel) og en
   ukendt alkan fra en gasdaase. I hvert trin skriver eleven formlen og
   saa tallet: m(gas) = m(før) − m(efter), n(gas) = V / Vₘ og
   M(gas) = m(gas) / n(gas). I maaling 2 staar formlerne der. Til sidst
   vaelger eleven alkanen: den soejle, hvis molarmasse ligger taettest
   paa elevens egen, der staar som en stiplet linje.

   Tavlen viser molvolumenet, opgavens tal og beregningerne. Under den
   staar soejlerne med de fem foerste alkaner.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    function SimBeregning() {
        this.sidstTal = {};
        this.over = null;
        this.opsum = [{}, {}];
        this.startFane(D.BEREGNING);
        this.regning = new NK.Regning({ vaert: NK.el("beregning-raekker"), fane: this });
        this.introNu = true;
        this.vaelg(0, false);
    }

    var P = SimBeregning.prototype;
    NK.Fane.paa(P, { navn: "beregning", naesteFane: "fane-fejl", naesteNavn: "Fejlkilder", zone: [204, 180] });
    NK.Regning.paa(P);

    /* ----- Opgaven -------------------------------------------------------------- */
    P.lavOpgave = function (i, nyeTal) {
        var spec = D.BEREGNING[i], tal;
        if (spec.ukendt) tal = nyeTal ? this.traek(spec.tal, this.sidstTal[spec.id]) : (this.sidstTal[spec.id] || spec.tal[0]);
        else tal = NK.maaling(spec.maaling);
        this.sidstTal[spec.id] = tal;
        var o = { id: spec.id, titel: spec.titel, tal: tal, ukendt: !!spec.ukendt, kunTal: !!spec.kunTal,
                  maaling: spec.maaling, trin: D.TRIN_ID.slice() };
        o.facit = K.facit(tal);
        this.opg = o;
        this.alkan = null;          /* den alkan, der er sendt ind og rigtig */
        this.alkanValgt = null;     /* den, der er valgt, men ikke sendt */
        this.alkanForkert = [];
        this.regning.saet(o);
        if (!o.ukendt) this.opsum[o.maaling] = {};
        this.visOpsum();
    };

    P.harNyeTal = function () { return !!(this.opg && this.opg.ukendt); };
    P.harForfra = function () { return false; };

    /* Fane 1 har en ny maaling: er opgaven ikke begyndt, bruges den med det samme */
    P.nyeMaalinger = function () {
        if (this.opg && !this.opg.ukendt && this.regning.k === 0 && !this.faerdig) this.vaelg(this.nr, false);
    };

    /* Kortets tekst. Noten om eksemplets tal staar i panelet over felterne. */
    P.promptHTML = function () {
        var o = this.opg, t = o.tal;
        NK.saetTekst("beregning-note", !o.ukendt && !t.egen ? "Tallene er et eksempel. Lav forsøget på fanen Forsøget for at regne på dine egne." : "");
        if (o.ukendt) {
            return NK.html("En lukket gasdåse med en ukendt alkan vejer " + K.g2(t.mf) + " g. Der samles " +
                K.V(t.V) + " mL af gassen over vand ved 20 °C, og dåsen vejer bagefter " + K.g2(t.me) + " g. Hvilken alkan er det?");
        }
        var s = o.kunTal ? "Find molarmassen i måling 2. Formlerne er de samme som i måling 1, så du skriver kun tallene." :
            "Find gassens molarmasse i måling " + (o.maaling + 1) + ", og find ud af, hvilken alkan det er.";
        return NK.html(s);
    };

    /* Tavlens linjer */
    P.info = function () {
        var t = this.opg.tal;
        return {
            konst: ["1 mol gas fylder Vₘ = " + D.VM_TEKST + " ved 20 °C og 1,013 bar"],
            tal: ["m(før) = " + K.g2(t.mf) + " g", "V = " + K.V(t.V) + " mL", "m(efter) = " + K.g2(t.me) + " g"]
        };
    };

    /* ----- Alkanen: det sidste skridt efter regningen ------------------------------ */
    P.skalVaelge = function () { return this.regning.faerdig() && this.alkan === null; };

    P.opgaveFaerdig = function () { return this.regning.faerdig() && this.alkan !== null; };

    var trinInfoRegning = P.trinInfo;
    P.trinInfo = function () {
        var mig = this;
        if (this.skalVaelge()) {
            return { hint: NK.html(D.ALKAN_HINT), svar: function () { mig.vaelgAlkan(mig.opg.facit.alkan, "svar"); } };
        }
        return trinInfoRegning.call(this);
    };

    var trinLinjeRegning = P.trinLinje;
    P.trinLinje = function () {
        if (this.skalVaelge()) return D.ALKAN_LINJE;
        return trinLinjeRegning.call(this);
    };

    /* Et klik paa en knap paa kortet eller paa en soejle vaelger kun */
    P.vaelgAlkanValg = function (i) {
        if (!this.skalVaelge() || this.alkanForkert.indexOf(i) >= 0) return;
        this.alkanValgt = i;
        this.visKort();
    };

    /* Indsend svar: regnetrinnet i panelet eller den valgte alkan */
    P.kanSendes = function () {
        if (this.faerdig) return false;
        if (this.skalVaelge()) return this.alkanValgt !== null;
        var f = this.regning.aktivt();
        return !!(f && f.input && String(f.input.value).trim());
    };

    P.indsend = function () {
        if (this.skalVaelge()) { this.vaelgAlkan(this.alkanValgt, "valg"); return; }
        this.regning.tjek();
    };

    P.tomBesked = function () {
        return this.skalVaelge() ? "Vælg en alkan først. Klik på en søjle eller en knap på kortet." : "Skriv i feltet under Regnestykket først.";
    };

    P.vaelgAlkan = function (i, maade) {
        if (!this.skalVaelge() || i === null) return;
        var f = this.opg.facit;
        if (i !== f.alkan && maade !== "svar") {
            var a = D.ALKANER[i];
            if (this.alkanForkert.indexOf(i) < 0) this.alkanForkert.push(i);
            this.alkanValgt = null;
            this.visKort();
            this.besked(NK.html(a.navn.charAt(0).toUpperCase() + a.navn.slice(1) + " har M = " + K.Mtekst(i) + " g/mol. Din værdi er " +
                K.Mv(f.M) + " g/mol. Find den søjle, der ligger tættest på den stiplede linje."), "skidt");
            return;
        }
        this.alkan = i;
        this.alkanValgt = i;
        if (maade === "svar") this.brugtSvar = true;
        this.trinLoest(maade === "svar" ? "svar" : "ok", maade === "svar" ? NK.html("Den alkan, der passer bedst, er " + D.ALKANER[i].navn + ".") : null);
        this.visKort();
    };

    /* De fem alkaner paa kortet, naar molarmassen er regnet ud. Et klik
       vaelger; Indsend svar sender. Loest: den rigtige er groen (gul, naar
       svaret blev vist), et forkert valg roedt og resten tonet ned. */
    P.visKortEkstra = function () {
        var mig = this, e = this.el.valg;
        if (!this.regning.faerdig()) { e.hidden = true; return; }
        e.hidden = false;
        e.className = "sk-svar n5";
        var vist = this.fast.klasse === "gul";
        D.ALKANER.forEach(function (a, i) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "sk-knap";
            b.innerHTML = "<span>" + NK.formel(a.formel) + '</span><span class="sk-navn">' + NK.html(a.navn) + "</span>";
            if (mig.alkan !== null) {
                b.disabled = true;
                b.classList.add(i === mig.alkan ? (vist ? "svar-vist" : "rigtig") : (mig.alkanForkert.indexOf(i) >= 0 ? "forkert" : "dim"));
            } else if (mig.alkanForkert.indexOf(i) >= 0) { b.classList.add("forkert"); b.disabled = true; }
            else if (i === mig.alkanValgt) b.classList.add("valgt");
            b.addEventListener("click", function () { mig.vaelgAlkanValg(i); });
            e.appendChild(b);
        });
    };

    P.slutLinje = function () {
        var o = this.opg, f = o.facit, a = D.ALKANER[f.alkan];
        var s = "M(gas) = " + K.Mv(f.M) + " g/mol. Det passer bedst med " + a.navn + ", " + NK.formel(a.formel) + ", med " + K.Mtekst(f.alkan) + " g/mol.";
        if (!o.ukendt) {
            if (f.alkan === D.LIGHTERGAS) s += " Lightergas er butan.";
            else s += " Lightergas er butan (" + K.Mtekst(D.LIGHTERGAS) + " g/mol). Så langt fra butan ender molarmassen kun, hvis noget er gået galt i forsøget. Se fanen Fejlkilder.";
            var anden = this.opsum[1 - o.maaling];
            if (anden && anden.M !== undefined) s += " Den anden måling gav " + K.Mv(anden.M) + " g/mol.";
        }
        return NK.html(s);
    };

    /* ----- Tallene i panelet ----------------------------------------------------- */
    P.efterTrin = function (id) {
        var o = this.opg, f = o.facit, sum = o.ukendt ? null : this.opsum[o.maaling];
        if (id === "M") this.visKortEkstra();
        if (!sum) return;
        if (id === "dm") sum.dm = f.dm;
        if (id === "n") sum.n = f.n;
        if (id === "M") sum.M = f.M;
        this.visOpsum();
    };

    P.visOpsum = function () {
        var mig = this;
        [0, 1].forEach(function (i) {
            var s = mig.opsum[i] || {};
            NK.saetTekst("beregning-o-dm-" + i, s.dm !== undefined ? K.g2(s.dm) + " g" : "");
            NK.saetTekst("beregning-o-n-" + i, s.n !== undefined ? K.mol(s.n) + " mol" : "");
            NK.saetTekst("beregning-o-M-" + i, s.M !== undefined ? K.Mv(s.M) + " g/mol" : "");
        });
    };

    /* ----- Musen ------------------------------------------------------------------ */
    P.hvad = function (pt) {
        var lay = this.lay;
        if (!lay || !pt || !lay.soejler) return null;
        for (var i = 0; i < lay.soejler.length; i++) {
            var r = lay.soejler[i];
            if (pt.x >= r.x0 && pt.x <= r.x1 && pt.y >= r.y0 && pt.y <= r.y1) return r.i;
        }
        return null;
    };

    P.overScene = function (pt) {
        this.over = this.hvad(pt);
        return this.over !== null ? "pointer" : null;
    };

    P.nedScene = function (pt) {
        var u = this.hvad(pt);
        if (u === null) return false;
        if (this.skalVaelge()) this.vaelgAlkanValg(u);
        else {
            var a = D.ALKANER[u];
            this.kortBesked(NK.html(a.navn.charAt(0).toUpperCase() + a.navn.slice(1) + ", " + NK.formel(a.formel) + ": " + K.Mtekst(u) + " g/mol." +
                (this.regning.faerdig() ? "" : " Regn molarmassen ud først.")));
        }
        return false;
    };

    /* ----- Layout -------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        lay.bordY = Math.round(H - NK.klamp(H * 0.05, 12, 30));
        /* Tavlen begynder under kortets plads; soejlerne giver plads, saa
           tavlen har mindst 170 px */
        lay.top = this.kortZone() + 8;
        var sh = Math.round(NK.klamp(Math.min(H * 0.46, lay.bordY - lay.top - 30 - 170), 150, 340));
        lay.sh = sh;
        lay.tavle = { x: 20, y: lay.top, b: W - 40, h: Math.max(120, lay.bordY - sh - 30 - lay.top) };
        lay.graf = { x: 40, y: lay.bordY - sh, b: W - 80, h: sh - 6 };
        this.lay = lay;
        this.saetAnker("tavle", lay.tavle.x, lay.tavle.y, lay.tavle.b, lay.tavle.h);
        this.saetAnker("graf", lay.graf.x - 10, lay.graf.y - 10, lay.graf.b + 20, lay.graf.h + 10);
    };

    /* ----- Tegn ----------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, o = this.opg;
        if (!lay || !o) return;
        this.L.ryd();
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 12);
        this.regning.tegnTavle(ctx, lay.tavle, this.info(), this.tid);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.H);
        var loest = this.regning.loest("M");
        lay.soejler = Tg.soejler(ctx, lay.graf, {
            M: loest ? o.facit.M : null, valgt: this.alkan !== null && this.alkan !== o.facit.alkan ? this.alkan : null,
            rigtig: this.alkan !== null ? this.alkan : null,
            lys: this.skalVaelge() && this.alkanValgt !== null ? this.alkanValgt : this.over, aktiv: true, tid: this.tid
        });
    };

    NK.SimBeregning = SimBeregning;
}());
