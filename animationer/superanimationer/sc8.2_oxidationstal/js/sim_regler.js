/* =====================================================================
   sim_regler.js - fane 1: reglerne

   Tavlen, oppefra:
     * opgaven paa én linje (Find oxidationstallet for C i CO₂) og, for de
       seks foerste, trinene som smaa maerker (Ladningen, O, H, det ukendte).
     * formlen. Over det atom, der spoerges til, staar et gult ?, og det,
       eleven skriver, ses der med det samme. Oxidationstallet over atomet
       skrives med romertal.
     * arbejdsfeltet: spoergsmaalet til det trin, eleven er ved (Hvilken
       ladning har CO₂?), feltet, Tjek og Giv hint lige ved siden af, og
       under dem linjen med fejl, hint og ros. Alt, eleven skal laese og
       trykke paa, staar her (brugerens test 3. okt. 2026: mindre tekst,
       tydeligt at det er ladningen, hintknappen ved feltet, ingen
       ordretekst i panelet).
     * regnestykket: summen af oxidationstallene = ladningen. Det kommer
       frem, naar ladningen er fundet, saa eleven ikke kastes ud i en halv
       beregning (brugerens foerste test, 26. sept. 2026).
       Mellemregningerne bruger almindelige tal, (−2) og (+1).
     * naar opgaven er loest: den paene beregning, hvor det ukendte isoleres.
     * atomerne én for én som brikker, naar det foerste tal kendes.

   Pladsen til regnestykket, beregningen og brikkerne er sat af fra
   starten, saa arbejdsfeltet ikke flytter sig, mens der skrives.

   De seks foerste stoffer gaas igennem trin for trin som i c8.2:
   ladningen, O, H og til sidst det ukendte. De 25 oevestoffer spoerger
   kun om det ukendte; hintet viser regnestykket med O og H udfyldt.

   Rigtige tal staar groenne, tal fra Vis svaret gule, og tal, hintet har
   sat ind, graa. Et forkert tal faar en besked, der passer til fejlen
   (NK.Ox.fejl).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var O = NK.Ox;

    /* Elementet husker selv sin tekst, saa DOM'en kun roeres, naar den skifter */
    function saet(e, html) {
        if (!e || e._html === html) return;
        e.innerHTML = html;
        e._html = html;
    }

    var TRIN_NAVN = { ladning: "Ladningen", O: "O", H: "H" };

    function SimRegler() {
        this.tavle = NK.el("rg-tavle");
        this.stak = NK.el("rg-stak");
        this.formelEl = NK.el("rg-formel");
        this.trinEl = NK.el("rg-trin");
        this.regnEl = NK.el("rg-regn");
        this.isolEl = NK.el("rg-isol");
        this.brikkerEl = NK.el("rg-brikker");
        this.bygFelt();
        this.startFane(D.REGLER, D.GRUPPER_RG);
        this.vaelg(0);
    }

    var P = SimRegler.prototype;
    NK.Fane.paa(P, { navn: "rg", naesteFane: "fane-ek", naesteNavn: "Elektronerne" });

    P.chipTekst = function (o) { return NK.formel(o.f) + NK.ladningHaevet(o.q); };

    /* Feltets ramme i arbejdsfeltet: det aktive felt og knappen Tjek */
    P.bygFelt = function () {
        var mig = this;
        var boks = document.createElement("div");
        boks.className = "arb-felt";
        var plads = document.createElement("span");
        plads.className = "arb-inp";
        var ok = document.createElement("button");
        ok.type = "button";
        ok.className = "felt-ok";
        ok.textContent = "Tjek";
        ok.title = "Tjek (Enter)";
        ok.addEventListener("click", function () {
            var k = mig.aktivt();
            if (k && !mig.faerdig) mig.tjek(k);
            mig.fokus();
        });
        boks.appendChild(plads);
        boks.appendChild(ok);
        NK.el("rg-felter").appendChild(boks);
        this.feltBoks = boks;
        this.feltPlads = plads;
    };

    /* ----- Opgaven ------------------------------------------------------------- */
    P.lavOpgave = function (i) {
        var o = this.opgaver[i];
        var st = O.stof(o.f, o.q);
        var trin = [];
        if (o.gruppe === "trin") {
            trin.push("ladning");
            if (st.nO) trin.push("O");
            if (st.nH) trin.push("H");
        }
        trin.push("X");
        this.opg = {
            o: o, st: st, trin: trin, nr: 0, trinvis: o.gruppe === "trin",
            svar: {},      /* bekraeftede tal */
            vist: {},      /* tal fra Vis svaret */
            graa: {},      /* O og H, som hintet har sat ind */
            visRegn: o.gruppe === "trin",
            visLad: false  /* hintet til ladningen peger paa pladsen efter formlen */
        };
        this.bygTavle();
    };

    P.aktivt = function () { return this.opg.trin[this.opg.nr]; };
    P.opgaveFaerdig = function () { return this.opg.nr >= this.opg.trin.length; };

    /* Spoergsmaalet i arbejdsfeltet til det trin, eleven er ved */
    P.spmTekst = function (k) {
        var st = this.opg.st;
        if (k === "ladning") return "Hvilken ladning har " + st.tekst + "?";
        var s = k === "X" ? st.X : k, n = k === "X" ? st.nX : (k === "O" ? st.nO : st.nH);
        return "Hvilket oxidationstal har " + (n > 1 ? "hvert " : "") + s + "?";
    };

    P.trinLinje = function () {
        var k = this.aktivt();
        return k ? this.spmTekst(k) : "";
    };

    P.visSpm = function () {
        var st = this.opg.st, e = this.el.spm;
        if (this.opgaveFaerdig()) {
            saet(e, '<span class="arb-ok">✓</span> ' + NK.html(st.X + " har oxidationstallet ") + "<b>" + O.ox(st.ox) + "</b>" +
                NK.html(" i " + st.tekst + "."));
            return;
        }
        saet(e, NK.html(this.spmTekst(this.aktivt())));
    };

    /* ----- Hjaelpen: Giv hint og Vis svaret ------------------------------------------ */
    P.trinInfo = function () {
        var k = this.aktivt(), mig = this;
        if (!k) return null;
        var st = this.opg.st;
        return {
            hint: NK.html(this.hint(k)),
            svar: function () { mig.bekraeft(k, O.facit(st, k), "svar"); }
        };
    };

    P.hint = function (k) {
        var st = this.opg.st, X = st.X;
        if (k === "ladning") {
            if (!st.q) return "Ladningen står som et lille tal og tegn efter formlen. Efter " + st.tekst + " står der ingenting.";
            return "Ladningen står som et lille tal og tegn efter formlen. Her står " + NK.ladningHaevet(st.q) + "." +
                (Math.abs(st.q) === 1 ? " Et tegn uden tal betyder 1." : " Tallet er størrelsen, og tegnet er fortegnet.");
        }
        if (k === "O") return "O har næsten altid oxidationstallet −II.";
        if (k === "H") return "H har næsten altid oxidationstallet +I.";
        if (st.slags === "grundstof") return st.tekst + " er et grundstof. Der er ingen andre atomer at give elektronerne til.";
        if (st.slags === "ion") return st.tekst + " er en ion af ét atom. Hele ladningen sidder på det ene atom.";
        var dele = [];
        if (st.nH) dele.push("H giver " + (st.nH > 1 ? st.nH + " · (+1) = " : "") + O.lad(st.nH));
        if (st.nO) dele.push("O giver " + (st.nO > 1 ? st.nO + " · (−2) = " : "") + O.lad(-2 * st.nO));
        return dele.join(", og ") + ". " + (st.nX > 1 ?
            "Hvad skal de " + st.nX + " " + X + " give tilsammen, for at summen bliver " + O.lad(st.q) + "? Del så med " + st.nX + "." :
            "Hvad skal " + X + " give, for at summen bliver " + O.lad(st.q) + "?");
    };

    P.svarTekst = function (k) {
        var st = this.opg.st;
        if (k === "ladning") return "Ladningen er " + O.lad(st.q) + ".";
        if (k === "O") return "O er −II.";
        if (k === "H") return "H er +I.";
        return O.beregning(st);
    };

    /* Hintet til ladningen peger paa pladsen efter formlen. Hintet paa et
       oevestof saetter O og H ind med graat og viser regnestykket. */
    P.efterHint = function () {
        var g = this.opg;
        if (this.aktivt() === "ladning") { g.visLad = true; this.visTavle(); return; }
        if (g.trinvis || this.aktivt() !== "X") return;
        if (g.st.nO) g.graa.O = -2;
        if (g.st.nH) g.graa.H = 1;
        g.visRegn = true;
        this.visTavle();
    };

    /* ----- Tjek et felt ------------------------------------------------------------ */
    P.tjek = function (k) {
        if (k !== this.aktivt() || this.faerdig) return;
        var inp = this.felter[k], st = this.opg.st;
        var v = k === "ladning" ? O.laesLadning(inp.value) : O.laesOx(inp.value);
        if (v === null) { this.ryst(); this.fejlLinje("Skriv et tal i feltet først."); return; }
        if (isNaN(v)) {
            this.ryst();
            this.fejlLinje(k === "ladning" ? "Skriv ladningen som et tal med fortegn, fx −2, +1 eller 0." :
                "Skriv et oxidationstal, fx −II, +V eller 0. Du kan også skrive −2 eller +5.");
            return;
        }
        if (Math.abs(v - O.facit(st, k)) < 1e-9) { this.bekraeft(k, v, "selv"); return; }
        this.ryst();
        this.fejlLinje(O.fejl(st, k, v));
    };

    P.bekraeft = function (k, v, maade) {
        var g = this.opg;
        g.svar[k] = v;
        if (maade === "svar") g.vist[k] = true;
        delete g.graa[k];
        g.nr++;
        if (this.opgaveFaerdig()) {
            g.visRegn = true;
            /* O og H udfyldes, naar det ukendte er fundet direkte */
            if (g.st.nO && g.svar.O === undefined) g.graa.O = -2;
            if (g.st.nH && g.svar.H === undefined) g.graa.H = 1;
        }
        this.visTavle();
        /* Svaret paa det sidste trin i et sammensat stof staar som den paene
           beregning paa tavlen, saa det skrives ikke én gang til i linjen */
        var svar = "";
        if (maade === "svar" && !(k === "X" && g.st.slags === "sammensat")) svar = NK.html(this.svarTekst(k));
        /* Rosen siger, hvad der var rigtigt: spoergsmaalet er allerede det naeste */
        var ros = k === "ladning" ? "Rigtigt. Ladningen er " + O.lad(v) + "." :
            "Rigtigt. " + (k === "X" ? g.st.X : k) + " er " + O.ox(v) + ".";
        this.trinLoest(maade, svar, NK.html(ros));
    };

    P.slutLinje = function (maade) {
        var g = this.opg, dele = [];
        if (maade === "svar" && g.st.slags === "sammensat") dele.push("Beregningen står herunder.");
        if (g.o.note) dele.push(g.o.note);
        return NK.html(dele.join(" "));
    };

    P.efterOpgave = function () { this.visTavle(); };

    P.ryst = function () {
        var f = this.feltBoks;
        f.classList.remove("fejl");
        void f.offsetWidth;
        f.classList.add("fejl");
    };

    /* ----- Tavlen ------------------------------------------------------------------ */
    function span(klasse, tekst) {
        var e = document.createElement("span");
        e.className = klasse;
        if (tekst !== undefined) e.textContent = tekst;
        return e;
    }

    P.bygTavle = function () {
        var mig = this, g = this.opg, st = g.st;
        this.tavle.classList.remove("faerdig");
        NK.el("rg-maal").textContent = "Find oxidationstallet for " + st.X + " i " + st.tekst;
        NK.el("rg-navn").textContent = g.o.navn;

        /* Formlen: tallet staar over selve symbolet; indekstallet og
           ladningen staar ved siden af, saa tallet ikke rykker skaevt.
           Ladningens plads findes ogsaa i et neutralt stof (tom), saa
           hintet kan pege paa den. */
        var formel = this.formelEl;
        formel.innerHTML = "";
        this.slots = {};
        this.kols = {};
        st.atomer.forEach(function (a, i) {
            var atom = span("tv-atom"), kol = span("tv-kol"), over = span("tv-over");
            kol.appendChild(over);
            kol.appendChild(span("tv-sym", a.s));
            atom.appendChild(kol);
            if (a.n > 1) atom.appendChild(span("tv-idx", NK.saenket(a.n)));
            if (i === st.atomer.length - 1) atom.appendChild(span("tv-lad" + (st.q ? "" : " tom"), NK.ladningHaevet(st.q)));
            formel.appendChild(atom);
            mig.slots[a.k] = over;
            mig.kols[a.k] = kol;
        });
        this.slots.ladning = this.regnEl.querySelector(".tv-q");

        /* Pladsen til den paene beregning, naar opgaven er loest */
        var linjer = st.slags === "ion" ? 0 : O.isolering(st).slice(1).length;
        this.isolEl.style.minHeight = (linjer * 1.3) + "em";

        /* Felterne: ét pr. trin. Det aktive staar i arbejdsfeltet. */
        this.felter = {};
        this.feltPlads.innerHTML = "";
        this.feltBoks.classList.remove("fejl");
        g.trin.forEach(function (k) {
            var inp = document.createElement("input");
            inp.type = "text";
            inp.className = "oxfelt";
            inp.autocomplete = "off";
            inp.spellcheck = false;
            inp.setAttribute("aria-label", k === "ladning" ? "Ladningen" : "Oxidationstallet for " + (k === "X" ? st.X : k));
            inp.addEventListener("keydown", function (e) {
                if (e.key === "Enter") { e.preventDefault(); mig.tjek(k); }
            });
            inp.addEventListener("input", function () {
                mig.feltBoks.classList.remove("fejl");
                mig.k.skriver();
                mig.visOver();
                mig.visRegn();
            });
            mig.felter[k] = inp;
        });
        this.visTavle();
    };

    /* Det, der staar over et atom (eller efter lighedstegnet) lige nu */
    P.vaerdi = function (k) {
        var g = this.opg;
        if (g.svar[k] !== undefined) return { v: g.svar[k], slags: g.vist[k] ? "vist" : "ok" };
        if (g.graa[k] !== undefined) return { v: g.graa[k], slags: "graa" };
        if (k === "ladning" && !g.trinvis) return { v: g.st.q, slags: "given" };
        return null;
    };

    P.visTavle = function () {
        var g = this.opg, aktiv = this.faerdig || this.opgaveFaerdig() ? null : this.aktivt();
        /* Det aktive felt staar i arbejdsfeltet */
        var inp = aktiv ? this.felter[aktiv] : null;
        if (inp && inp.parentNode !== this.feltPlads) {
            this.feltPlads.innerHTML = "";
            this.feltPlads.appendChild(inp);
        }
        this.feltBoks.hidden = !inp;
        this.formelEl.classList.toggle("vis-lad", aktiv === "ladning" && g.visLad);
        this.visOver();
        this.visTrin();
        this.visRegn();
        this.visIsol();
        this.visBrikker();
        this.tavle.classList.toggle("faerdig", !!this.faerdig);
    };

    /* Tallene over atomerne og ladningen efter lighedstegnet. Over det
       atom, der spoerges til, staar et gult ?, og mens eleven skriver,
       staar elevens eget tal der (med romertal). */
    P.visOver = function () {
        var mig = this, aktiv = this.faerdig || this.opgaveFaerdig() ? null : this.aktivt();
        Object.keys(this.slots).forEach(function (k) {
            var slot = mig.slots[k], v = mig.vaerdi(k);
            if (k === "ladning") {
                saet(slot, v ? '<span class="tv-ox ' + v.slags + '">' + O.lad(v.v) + "</span>" : "");
                return;
            }
            if (mig.kols[k]) mig.kols[k].classList.toggle("aktiv", k === aktiv);
            if (k === aktiv) {
                var p = O.laesOx(mig.felter[k].value);
                saet(slot, p !== null && !isNaN(p) ? '<span class="tv-ox vent">' + O.ox(p) + "</span>" : '<span class="tv-ox spm">?</span>');
                return;
            }
            saet(slot, v ? '<span class="tv-ox ' + v.slags + '">' + O.ox(v.v) + "</span>" : "");
        });
    };

    /* Trinene som smaa maerker */
    P.visTrin = function () {
        var g = this.opg, st = g.st, aktiv = this.opgaveFaerdig() ? null : this.aktivt();
        var chips = "";
        if (g.trinvis) {
            chips = g.trin.map(function (k, i) {
                var kl = i < g.nr ? "gjort" : (k === aktiv ? "aktiv" : "");
                return '<span class="tv-chip ' + kl + '"><b>' + (i + 1) + "</b>" + (k === "X" ? st.X : TRIN_NAVN[k]) +
                    (i < g.nr ? " ✓" : "") + "</span>";
            }).join('<span class="tv-pil">›</span>');
        }
        saet(this.trinEl, chips);
    };

    /* Regnestykket med det, eleven har fundet eller er ved at skrive. Det
       kommer frem, naar ladningen er fundet. */
    P.visRegn = function () {
        var mig = this, g = this.opg, st = g.st, aktiv = this.faerdig ? null : this.aktivt();
        var synlig = g.visRegn && this.vaerdi("ladning") !== null;
        this.regnEl.classList.toggle("skjult", !synlig);
        if (!synlig) { saet(this.regnEl.querySelector(".tv-led"), ""); return; }
        /* Det ukendte bliver staaende som symbol, naar det er fundet: saa
           staar regnestykket over den paene beregning, der isolerer det */
        var led = st.atomer.map(function (a) {
            var v = a.k === "X" ? null : mig.vaerdi(a.k), t;
            if (v) t = '<span class="rv ' + v.slags + '">' + O.talP(v.v) + "</span>";
            else if (a.k === aktiv && mig.felter[a.k] && mig.felter[a.k].value.trim()) {
                var p = O.laesOx(mig.felter[a.k].value);
                t = '<span class="rv vent">' + (p !== null && !isNaN(p) ? O.talP(p) : NK.html(mig.felter[a.k].value.trim())) + "</span>";
            } else t = '<span class="rv sym">' + a.s + "</span>";
            return (a.n > 1 ? a.n + " · " : "") + t;
        }).join(" + ");
        saet(this.regnEl.querySelector(".tv-led"), led);
    };

    /* Den paene beregning, naar det ukendte er fundet */
    P.visIsol = function () {
        var st = this.opg.st;
        if (!this.opgaveFaerdig() || st.slags === "ion") { saet(this.isolEl, ""); return; }
        var linjer = O.isolering(st).slice(1);
        saet(this.isolEl, linjer.map(function (l) { return "<div>" + NK.html(l) + "</div>"; }).join(""));
    };

    /* Brikkerne: ét atom pr. brik, og summen, naar alle er kendt. De kommer
       frem, naar det foerste tal er fundet. */
    P.visBrikker = function () {
        var mig = this, g = this.opg, st = g.st;
        var html = "", sum = 0, alle = true, nogen = false;
        st.atomer.forEach(function (a) {
            var v = mig.vaerdi(a.k);
            for (var n = 0; n < a.n; n++) {
                var kl = "brik";
                if (v) { kl += v.v > 0 ? " plus" : (v.v < 0 ? " minus" : " nul"); if (v.slags !== "ok") kl += " " + v.slags; sum += v.v; nogen = true; }
                else { kl += " ukendt"; alle = false; }
                html += '<span class="' + kl + '"><b>' + (v ? O.lad(v.v) : "?") + "</b><i>" + a.s + "</i></span>";
            }
        });
        if (alle) html += '<span class="brik-sum' + (Math.abs(sum - st.q) < 1e-9 ? " ok" : "") + '">= ' + O.lad(sum) +
            (Math.abs(sum - st.q) < 1e-9 ? " ✓" : "") + "</span>";
        saet(this.brikkerEl, html);
        this.brikkerEl.classList.toggle("skjult", !nogen);
    };

    P.fokusFelt = function () {
        var k = this.aktivt();
        if (k && this.felter[k] && document.activeElement !== this.felter[k]) this.felter[k].focus();
    };

    /* ----- Scenen: vaeggen, og tavlen placeret over Kemichaels baand ---------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var baand = this.k.layout(W, H);
        var lay = { W: W, H: H, baand: baand };
        var kant = NK.klamp(W * 0.03, 12, 34), top = NK.klamp(H * 0.035, 10, 26);
        var b = Math.min(W - 2 * kant, 1000);
        var h = Math.max(160, baand.y - top - NK.klamp(H * 0.03, 10, 22));
        lay.tavle = { x: Math.round((W - b) / 2), y: top, b: Math.round(b), h: Math.round(h) };
        var t = this.tavle, stak = this.stak;
        t.style.left = lay.tavle.x + "px";
        t.style.top = lay.tavle.y + "px";
        t.style.width = lay.tavle.b + "px";
        t.style.height = lay.tavle.h + "px";
        /* Skriften foelger tavlens stoerrelse: den stoerste, hvor det hele
           (ogsaa regnestykket, beregningen og brikkerne, der kommer senere)
           kan vaere der, med plads til en linje mere i arbejdsfeltet */
        var stil = window.getComputedStyle(t);
        var indre = t.clientHeight - parseFloat(stil.paddingTop) - parseFloat(stil.paddingBottom) -
            t.querySelector(".tv-top").offsetHeight - (parseFloat(stil.rowGap) || 0);
        var n = 0;
        if (this.opg) this.opg.st.atomer.forEach(function (a) { n += a.n; });
        var fs = NK.klamp(Math.min(h / 7, b / 9.5), 30, 72);
        stak.style.marginTop = "0px";
        for (;;) {
            t.style.setProperty("--fs", Math.round(fs) + "px");
            /* Brikkerne skal kunne staa paa én linje med summen efter sig */
            var bb = NK.klamp(Math.min(fs * 0.9, (b - 60 - 3.4 * fs) / Math.max(1, n) - 6), 34, 72);
            t.style.setProperty("--bb", Math.round(bb) + "px");
            if (fs <= 30 || stak.offsetHeight + 24 <= indre) break;
            fs -= 2;
        }
        /* Det, der er tilovers, deles over og under (linjen mere er stadig sat af) */
        stak.style.marginTop = Math.max(0, Math.round((indre - 24 - stak.offsetHeight) * 0.4)) + "px";
        this.lay = lay;
        this.saetAnker("laerer", 0, baand.y, W * 0.45, baand.h);
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        NK.Tegn.vaeg(ctx, lay.W, lay.baand.y);
        this.k.tegn(ctx);
    };

    P.klikScene = function () {};

    NK.SimRegler = SimRegler;
}());
