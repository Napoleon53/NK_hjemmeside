/* =====================================================================
   sim_regler.js - fane 1: reglerne

   Tavlen, oppefra:
     * trinene (Ladningen, O, H, det ukendte) og en forklaring til det
       trin, eleven er ved. Forklaringen staar paa tavlen, hvor der
       arbejdes; linjen i opgavekortet siger kun kort, hvad der skal skrives,
       og hvad der gik galt.
     * formlen med et felt over atomerne. Oxidationstallet over atomet
       skrives med romertal.
     * regnestykket: summen af oxidationstallene = ladningen. Det starter
       med ord og ladningens felt, og atomerne kommer ind, naar ladningen er
       fundet, saa eleven ikke kastes ud i en halv beregning (brugerens
       foerste test, 26. sept. 2026). Mellemregningerne bruger almindelige
       tal, (−2) og (+1).
     * naar opgaven er loest: den paene beregning, hvor det ukendte isoleres.
     * atomerne én for én som brikker, naar det foerste tal kendes.

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

    /* Tavlen bygges forfra for hvert stof, saa den faelles cache i
       NK.saetHTML kan ikke bruges her: elementet husker selv sin tekst */
    function saet(e, html) {
        if (!e || e._html === html) return;
        e.innerHTML = html;
        e._html = html;
    }

    var TRIN_NAVN = { ladning: "Ladningen", O: "O", H: "H" };

    function SimRegler() {
        this.tavle = NK.el("rg-tavle");
        this.startFane(D.REGLER, D.GRUPPER_RG);
        this.introNu = true;
        this.vaelg(0);
    }

    var P = SimRegler.prototype;
    NK.Fane.paa(P, { navn: "rg", naesteFane: "fane-ek", naesteNavn: "Elektronerne" });

    P.chipTekst = function (o) { return NK.formel(o.f) + NK.ladningHaevet(o.q); };

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
            visRegn: o.gruppe === "trin"
        };
        this.bygTavle();
    };

    P.aktivt = function () { return this.opg.trin[this.opg.nr]; };
    P.opgaveFaerdig = function () { return this.opg.nr >= this.opg.trin.length; };

    P.promptHTML = function () {
        var st = this.opg.st;
        return '<p class="maal-tekst">Find oxidationstallet for ' + st.X + " i " + st.tekst +
            (this.opg.trinvis ? ", trin for trin." : ".") + "</p>";
    };

    /* Linjen i opgavekortet: kort, hvad der skal skrives. Forklaringen
       staar paa tavlen. */
    P.trinLinje = function () {
        var k = this.aktivt(), st = this.opg.st;
        if (k === "ladning") return "Skriv ladningen i det gule felt på tavlen, og tryk Enter.";
        if (k === "O" || k === "H") return "Skriv oxidationstallet for " + k + " i det gule felt, og tryk Enter.";
        if (k === "X") return "Skriv oxidationstallet for " + st.X + " i det gule felt, og tryk Enter.";
        return "";
    };

    /* Forklaringen paa tavlen til det trin, eleven er ved */
    P.trinTekst = function (k) {
        var st = this.opg.st, X = st.X;
        if (k === "ladning") {
            return "Oxidationstallene i et stof giver tilsammen stoffets ladning. Start derfor med ladningen på hele " +
                st.tekst + ". Den står som det lille tal og tegn efter formlen. Står der intet, er den 0.";
        }
        if (k === "O") return "Nu O. Oxygen har næsten altid det samme oxidationstal. Skriv det for ét O-atom i feltet over O.";
        if (k === "H") return "Nu H. Hydrogen har næsten altid det samme oxidationstal. Skriv det for ét H-atom i feltet over H.";
        if (k === "X" && this.opg.trinvis) {
            return "Nu mangler kun " + X + ". Find det tal, der får regnestykket til at gå op, og skriv det i feltet over " + X + "." +
                (st.nX > 1 ? " Der er " + st.nX + " " + X + ", så find først, hvad de giver tilsammen, og del så med " + st.nX + "." : "");
        }
        if (k === "X") {
            return "Find oxidationstallet for " + X + ", og skriv det i feltet over " + X + ". Oxidationstallene skal tilsammen give " +
                (st.q ? "ionens ladning, " + O.lad(st.q) : "0, for stoffet er neutralt") + ".";
        }
        return "";
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
            if (!st.q) return "Se efter formlen: der står intet tal og tegn efter " + st.tekst + ".";
            return "Se efter formlen: der står " + NK.ladningHaevet(st.q) + "." +
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

    /* Hintet paa et oevestof saetter O og H ind med graat og viser regnestykket */
    P.efterHint = function () {
        var g = this.opg;
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
        if (v === null) { this.ryst(inp); this.fejlLinje("Skriv et tal i det gule felt først."); return; }
        if (isNaN(v)) {
            this.ryst(inp);
            this.fejlLinje(k === "ladning" ? "Skriv ladningen som et tal med fortegn, fx −2, +1 eller 0." :
                "Skriv et oxidationstal, fx −II, +V eller 0. Du kan også skrive −2 eller +5.");
            return;
        }
        if (Math.abs(v - O.facit(st, k)) < 1e-9) { this.bekraeft(k, v, "selv"); return; }
        this.ryst(inp);
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
        this.trinLoest(maade, maade === "svar" ? NK.html(this.svarTekst(k)) : "");
    };

    P.slutLinje = function () {
        var g = this.opg, st = g.st;
        return NK.html(st.X + " er " + O.ox(st.ox) + " i " + st.tekst + "." + (g.o.note ? " " + g.o.note : ""));
    };

    P.efterOpgave = function () { this.visTavle(); };

    P.ryst = function (inp) {
        var f = inp.parentNode;
        f.classList.remove("fejl");
        void f.offsetWidth;
        f.classList.add("fejl");
    };

    /* ----- Tavlen ------------------------------------------------------------------ */
    function div(klasse, id) {
        var e = document.createElement("div");
        e.className = klasse;
        if (id) e.id = id;
        return e;
    }

    P.bygTavle = function () {
        var mig = this, g = this.opg, st = g.st;
        var t = this.tavle;
        t.innerHTML = "";
        t.classList.remove("faerdig");

        var navn = div("tv-navn");
        navn.textContent = g.o.navn;
        t.appendChild(navn);

        /* Trinene og forklaringen */
        var trin = div("tv-trin", "rg-trin");
        trin.innerHTML = '<div class="tv-chips"></div><p class="tv-trintekst"></p>';
        t.appendChild(trin);
        this.trinEl = trin;

        /* Formlen: feltet staar over selve symbolet; indekstallet og
           ladningen staar ved siden af, saa feltet ikke rykker skaevt */
        var formel = div("tv-formel");
        this.slots = {};
        st.atomer.forEach(function (a, i) {
            var atom = document.createElement("span");
            atom.className = "tv-atom";
            var kol = document.createElement("span");
            kol.className = "tv-kol";
            var over = document.createElement("span");
            over.className = "tv-over";
            var sym = document.createElement("span");
            sym.className = "tv-sym";
            sym.textContent = a.s;
            kol.appendChild(over);
            kol.appendChild(sym);
            atom.appendChild(kol);
            var idx = (a.n > 1 ? NK.saenket(a.n) : "") + (i === st.atomer.length - 1 ? NK.ladningHaevet(st.q) : "");
            if (idx) {
                var ix = document.createElement("span");
                ix.className = "tv-idx";
                ix.textContent = idx;
                atom.appendChild(ix);
            }
            formel.appendChild(atom);
            mig.slots[a.k] = over;
        });
        t.appendChild(formel);

        /* Regnestykket: venstresiden, lighedstegnet og ladningen, med en
           lille tekst under hver side */
        var regn = div("tv-regn", "rg-regn");
        regn.innerHTML = '<span class="tv-led"></span><span class="tv-lig">=</span><span class="tv-q"></span>' +
            '<span class="tv-cap venstre"></span><span></span><span class="tv-cap hoejre">ladningen</span>';
        t.appendChild(regn);
        this.regnEl = regn;
        this.slots.ladning = regn.querySelector(".tv-q");

        /* Den paene beregning, naar opgaven er loest */
        var isol = div("tv-isol", "rg-isol");
        t.appendChild(isol);
        this.isolEl = isol;

        /* Atomerne én for én */
        var brikker = div("tv-brikker", "rg-brikker");
        t.appendChild(brikker);
        this.brikkerEl = brikker;

        /* Felterne: ét pr. trin, de bliver, mens der skrives */
        this.felter = {};
        g.trin.forEach(function (k) {
            var f = document.createElement("span");
            f.className = "tv-felt" + (k === "ladning" ? " q" : "");
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
                f.classList.remove("fejl");
                mig.k.skriver();
                mig.visRegn();
            });
            f.appendChild(inp);
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
        var mig = this, g = this.opg, aktiv = this.faerdig ? null : this.aktivt();
        Object.keys(this.slots).forEach(function (k) {
            var slot = mig.slots[k], v = mig.vaerdi(k);
            var felt = mig.felter[k] ? mig.felter[k].parentNode : null;
            if (k === aktiv && felt) {
                if (felt.parentNode !== slot) { slot.innerHTML = ""; slot.appendChild(felt); }
                felt.classList.add("aktiv");
                return;
            }
            if (felt && felt.parentNode === slot) slot.removeChild(felt);
            if (!v) { slot.innerHTML = k === "ladning" ? '<span class="tv-ox tom">?</span>' : ""; return; }
            /* Over atomet med romertal, efter lighedstegnet som ladning */
            var tekst = k === "ladning" ? O.lad(v.v) : O.ox(v.v);
            slot.innerHTML = '<span class="tv-ox ' + v.slags + '">' + tekst + "</span>";
        });
        this.visTrin();
        this.visRegn();
        this.visIsol();
        this.visBrikker();
        this.tavle.classList.toggle("faerdig", !!this.faerdig);
    };

    /* Trinene som smaa maerker og forklaringen til det aktive */
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
        saet(this.trinEl.querySelector(".tv-chips"), chips);
        var tekst = aktiv ? this.trinTekst(aktiv) : "";
        saet(this.trinEl.querySelector(".tv-trintekst"), NK.html(tekst));
        this.trinEl.classList.toggle("tom", !chips && !tekst);
    };

    /* Regnestykket med det, eleven har fundet eller er ved at skrive.
       Foer ladningen er fundet, staar venstresiden med ord. */
    P.visRegn = function () {
        var mig = this, g = this.opg, st = g.st, aktiv = this.faerdig ? null : this.aktivt();
        this.regnEl.hidden = !g.visRegn;
        var ord = g.trinvis && this.vaerdi("ladning") === null;
        var led;
        if (ord) led = '<span class="rv ord">summen af oxidationstallene</span>';
        else {
            /* Det ukendte bliver staaende som symbol, naar det er fundet: saa
               staar regnestykket over den paene beregning, der isolerer det */
            led = st.atomer.map(function (a) {
                var v = a.k === "X" ? null : mig.vaerdi(a.k), t;
                if (v) t = '<span class="rv ' + v.slags + '">' + O.talP(v.v) + "</span>";
                else if (a.k === aktiv && mig.felter[a.k] && mig.felter[a.k].value.trim()) {
                    var p = O.laesOx(mig.felter[a.k].value);
                    t = '<span class="rv vent">' + (p !== null && !isNaN(p) ? O.talP(p) : NK.html(mig.felter[a.k].value.trim())) + "</span>";
                } else t = '<span class="rv sym">' + a.s + "</span>";
                return (a.n > 1 ? a.n + " · " : "") + t;
            }).join(" + ");
        }
        saet(this.regnEl.querySelector(".tv-led"), led);
        saet(this.regnEl.querySelector(".tv-cap.venstre"), ord ? "" : "summen af oxidationstallene");
    };

    /* Den paene beregning, naar det ukendte er fundet */
    P.visIsol = function () {
        var g = this.opg, st = g.st;
        var vis = this.opgaveFaerdig() && st.slags !== "ion";
        this.isolEl.hidden = !vis;
        if (!vis) { saet(this.isolEl, ""); return; }
        var linjer = O.isolering(st).slice(1);
        if (!linjer.length) { this.isolEl.hidden = true; return; }
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
        this.brikkerEl.hidden = !nogen;
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
        var t = this.tavle;
        t.style.left = lay.tavle.x + "px";
        t.style.top = lay.tavle.y + "px";
        t.style.width = lay.tavle.b + "px";
        t.style.height = lay.tavle.h + "px";
        /* Skriften foelger tavlens stoerrelse */
        var fs = NK.klamp(Math.min(h / 7.6, b / 9.5), 30, 72);
        t.style.setProperty("--fs", Math.round(fs) + "px");
        /* Brikkerne skal kunne staa paa én linje med summen efter sig */
        var n = 0;
        if (this.opg) this.opg.st.atomer.forEach(function (a) { n += a.n; });
        var bb = NK.klamp(Math.min(fs * 0.9, (b - 60 - 3.4 * fs) / Math.max(1, n) - 6), 40, 72);
        t.style.setProperty("--bb", Math.round(bb) + "px");
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
