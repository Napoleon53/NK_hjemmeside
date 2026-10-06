/* =====================================================================
   regning.js - regnetrinene paa fane 2 (som sc4.3)

   Hvert trin er et lille regnestykke i opgavekortet, der vokser nedad
   med lighedstegnene ud for hinanden, saadan som eleverne skal skrive
   det (brugerens oenske 27. sept. 2026):

       n(Fe) = m(Fe)/M(Fe)          1. formlen, skrevet med symboler
             = 4,00 g/55,85 g/mol   2. mellemregningen: tallene med
                                       enheder i en broek med to felter
                                       (eller to felter med et gangetegn)
             = 0,0716 mol           3. resultatet med enhed

   I Let har trinnet n(FeO) = n(Fe) ingen mellemregning: formlen og saa
   resultatet. I Svær er det en broek, n(Fe₃O₄) = n(Fe) / 3, hvor tallet
   under stregen ikke har nogen enhed. I maaling 2 staar formlerne der i
   forvejen, og eleven skriver kun tallene. Kun det aktive felt er aabent.

   Tavlen i scenen viser maengdeberegningsskemaet (js/skema.js) og
   foelger med via status(id).

   NK.Regning.paa(P) giver fanen trinInfo, trinLinje, opgaveFaerdig og
   de kald, raekkerne bruger (formelOk, ledOk, indsaetOk, regnLoest,
   regnFejl).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = NK.Tjek;

    function Regning(o) {
        this.vaert = o.vaert;
        this.fane = o.fane;
        this.opg = null;
        this.felter = [];
        this.k = 0;
        this.netop = null;      /* det trin, der lige er loest (blinker groent) */
    }
    var P = Regning.prototype;

    P.def = function (id) { return T.def(id, this.opg.sk); };

    /* Den fase, et trin starter i: formlen, eller (naar formlerne er
       givet) mellemregningen eller resultatet */
    function startFase(def, kunTal) {
        if (!kunTal) return "formel";
        return def.op ? "indsaet" : "tal";
    }

    P.saet = function (opg) {
        var mig = this;
        this.opg = opg;
        this.k = 0;
        this.netop = null;
        this.felter = opg.trin.map(function (id, i) {
            /* plads: det led, der staar i hvert af mellemregningens to felter
               (null, til det er rigtigt). tekst: det, eleven har skrevet der. */
            return { id: id, status: i === 0 ? "aktiv" : "laast", fase: startFase(mig.def(id), opg.kunTal),
                     plads: [null, null], vist: [false, false], tekst: ["", ""] };
        });
        this.byg();
    };

    P.faerdig = function () { return this.k >= this.felter.length; };
    P.aktivt = function () { return this.faerdig() ? null : this.felter[this.k]; };
    P.loest = function (id) {
        return this.felter.some(function (f) { return f.id === id && (f.status === "ok" || f.status === "svar"); });
    };

    /* Trinnets status til skemaet paa tavlen: laast, aktiv, ok eller svar */
    P.status = function (id) {
        var f = this.felter.filter(function (x) { return x.id === id; })[0];
        return f ? f.status : "laast";
    };

    /* Mellemregningens to tal (med enhed) i den raekkefoelge, de staar i felterne */
    P.ledTekster = function (f) {
        var led = T.led(f.id, this.opg);
        return f.plads.map(function (j) { return j === null ? null : led[j].tekst; });
    };

    /* ----- Raekkerne ------------------------------------------------------------- */
    function celle(klasse, html) {
        var e = document.createElement(klasse === "rs-hoejre" ? "div" : "span");
        e.className = klasse;
        if (html) e.innerHTML = html;
        return e;
    }

    /* Én linje i regnestykket: venstre side (kun paa foerste linje), = og hoejre side */
    function linje(g, venstre, hoejre) {
        g.appendChild(celle("rs-venstre", venstre ? NK.html(venstre) : ""));
        g.appendChild(celle("rs-lig", "="));
        var h = celle("rs-hoejre");
        if (typeof hoejre === "string") h.innerHTML = hoejre;
        else h.appendChild(hoejre);
        g.appendChild(h);
    }

    function okKnap(fra) {
        return '<button type="button" class="felt-ok" aria-label="Tjek svaret" tabindex="-1"' + fra + '>↵</button>';
    }

    P.byg = function () {
        var mig = this, o = this.opg, sk = o.sk, vaert = this.vaert;
        vaert.innerHTML = "";
        this.felter.forEach(function (f, i) {
            var t = mig.def(f.id);
            var loest = f.status === "ok" || f.status === "svar";
            var rk = document.createElement("div");
            rk.className = "raekke " + (loest ? "loest" : f.status) + (mig.netop === f.id ? " netop" : "");
            rk.innerHTML = '<div class="raekke-hoved"><span class="raekke-etiket">' + (i + 1) + ". " + NK.html(t.navn) + "</span></div>";
            var venstre = t.venstre;
            var g = document.createElement("div");
            g.className = "regnestykke" + (t.op === "*" && venstre.length >= 8 ? " lang" : "");
            rk.appendChild(g);
            f.input = null;
            f.inputs = null;
            f.feltEl = null;
            f.delEl = null;

            /* 1. Formlen */
            if (f.fase === "formel" && !loest) linje(g, venstre, mig.enkeltFelt(f, "formel"));
            else linje(g, venstre, '<span class="rs-vist">' + T.formelHTML(f.id, sk) + "</span>");

            /* 2. Mellemregningen (ikke i trinnet n(FeO) = n(Fe)) */
            if (t.op) {
                if (f.fase === "indsaet" && !loest) linje(g, "", mig.broekFelt(f));
                else if (f.fase === "tal" || loest) linje(g, "", '<span class="rs-vist">' + T.indsaetHTML(f.id, sk, mig.ledTekster(f)) + "</span>");
            }

            /* 3. Resultatet */
            if (loest) {
                linje(g, "", '<span class="rs-vist' + (f.status === "svar" ? " svar" : "") + '"><b>' + NK.html(T.facitTekst(f.id, o)) +
                    '</b></span><span class="rs-maerke' + (f.status === "svar" ? " svar" : "") + '">' + (f.status === "ok" ? "✓" : "↩") + "</span>");
            } else if (f.fase === "tal") {
                linje(g, "", mig.enkeltFelt(f, "tal"));
            }
            vaert.appendChild(rk);
        });
        this.netop = null;
    };

    /* Et felt til formlen eller resultatet */
    P.enkeltFelt = function (f, slags) {
        var mig = this, t = this.def(f.id);
        var fra = f.status === "aktiv" ? "" : " disabled";
        var fe = document.createElement("div");
        fe.className = "felt " + f.status + (slags === "formel" ? " formelfelt" : "");
        fe.style.flex = "1";
        fe.innerHTML = '<input type="text" inputmode="text" autocomplete="off" spellcheck="false" aria-label="' +
            NK.html((slags === "formel" ? "Formlen for " : "Resultatet med enhed for ") + t.navn.toLowerCase()) + '" placeholder="' +
            (slags === "formel" ? "skriv formlen" : "tal og enhed") + '"' + fra + ">" + okKnap(fra);
        var inp = fe.querySelector("input");
        inp.addEventListener("keydown", function (e) {
            if (e.key === "Enter") { e.preventDefault(); mig.tjek(); }
        });
        fe.querySelector(".felt-ok").addEventListener("click", function () { mig.tjek(); });
        f.feltEl = fe;
        f.input = inp;
        return fe;
    };

    /* Mellemregningen: to felter i en broek (over og under stregen) eller
       med et gangetegn imellem. Et felt, der er rigtigt, viser tallet. */
    P.broekFelt = function (f) {
        var mig = this, t = this.def(f.id), broek = t.op === "/";
        var tekster = this.ledTekster(f), led = T.led(f.id, this.opg);
        var fe = document.createElement("div");
        fe.className = "felt " + (f.status === "aktiv" ? "aktiv" : f.status) + " broekfelt";
        fe.style.flex = "1";
        var krop = document.createElement("div");
        krop.className = "bf-krop";
        var holder = broek ? document.createElement("div") : krop;
        if (broek) { holder.className = "bf-broek"; krop.appendChild(holder); }
        f.inputs = [null, null];
        f.delEl = [null, null];
        var fra = f.status === "aktiv" ? "" : " disabled";
        var NAVN = broek ? ["over brøkstregen", "under brøkstregen"] : ["det første tal", "det andet tal"];
        [0, 1].forEach(function (i) {
            if (i === 1) {
                var mellem = document.createElement(broek ? "div" : "span");
                mellem.className = broek ? "bf-streg" : "bf-gange";
                if (!broek) mellem.textContent = "·";
                holder.appendChild(mellem);
            }
            var del = document.createElement("div");
            f.delEl[i] = del;
            if (f.plads[i] !== null) {
                del.className = "bf-del ok";
                del.innerHTML = '<span class="bf-tekst">' + NK.html(tekster[i]) + "</span>";
            } else {
                /* I en broek hoerer feltet til sit led; tallet fra skemaet har ingen enhed */
                var hvad = broek && led[i].enhed === "" ? "tal" : "tal og enhed";
                del.className = "bf-del";
                del.innerHTML = '<input type="text" inputmode="text" autocomplete="off" spellcheck="false" aria-label="' +
                    (hvad === "tal" ? "Tal " : "Tal og enhed ") + NAVN[i] + '" placeholder="' + hvad + '"' + fra + ">";
                var inp = del.querySelector("input");
                inp.value = f.tekst[i] || "";
                inp.addEventListener("keydown", function (e) {
                    if (e.key === "Enter") { e.preventDefault(); mig.tjek(i); }
                });
                inp.addEventListener("input", function () { f.tekst[i] = inp.value; });
                f.inputs[i] = inp;
            }
            holder.appendChild(del);
        });
        fe.appendChild(krop);
        var knap = document.createElement("div");
        knap.innerHTML = okKnap(fra);
        var ok = knap.firstChild;
        ok.addEventListener("click", function () { mig.tjek(); });
        fe.appendChild(ok);
        f.feltEl = fe;
        return fe;
    };

    /* Det felt, der skal skrives i nu */
    P.aktivtInput = function () {
        var f = this.aktivt();
        if (!f) return null;
        if (f.fase === "indsaet") {
            if (!f.inputs) return null;
            for (var i = 0; i < 2; i++) if (f.plads[i] === null && f.inputs[i]) return f.inputs[i];
            return null;
        }
        return f.input;
    };

    P.fokus = function (i) {
        var f = this.aktivt();
        var inp = f && f.fase === "indsaet" && i !== undefined && f.inputs ? f.inputs[i] : this.aktivtInput();
        if (inp) {
            try { inp.focus({ preventScroll: true }); } catch (e) { inp.focus(); }
        }
    };

    P.ryst = function (el) {
        if (!el) return;
        el.classList.remove("ryst");
        void el.offsetWidth;
        el.classList.add("ryst");
    };

    /* ----- Tjek ------------------------------------------------------------------
       hvor: det af mellemregningens felter, der blev trykket Enter i.
       Knappen (↵) tjekker dem begge. */
    P.tjek = function (hvor) {
        var f = this.aktivt();
        if (!f || this.fane.auto) return;
        if (f.fase === "indsaet") { this.tjekLed(f, hvor); return; }
        if (!f.input) return;
        var raa = f.input.value, svar;
        if (f.fase === "formel") {
            svar = T.formel(f.id, raa, this.opg.sk);
            if (svar.ok) { this.formelOk(false, svar.note); return; }
        } else {
            svar = T.trin(f.id, raa, this.opg);
            if (svar.ok) { this.loes("ok"); return; }
        }
        if (!svar.tom) this.ryst(f.feltEl);
        this.fane.regnFejl(svar.besked, svar.tom, f.id);
    };

    P.tjekLed = function (f, hvor) {
        var op = this.def(f.id).op;
        var raekke = hvor === undefined ? [0, 1] : [hvor];
        for (var k = 0; k < raekke.length; k++) {
            var i = raekke[k];
            if (f.plads[i] !== null) continue;
            /* I en broek hoerer hvert led til sit felt; et produkt kan staa i begge raekkefoelger */
            var ledige = op === "/" ? [i] : [0, 1].filter(function (j) { return f.plads.indexOf(j) < 0; });
            var svar = T.tjekLed(f.id, this.opg, i, f.inputs[i] ? f.inputs[i].value : "", ledige);
            if (!svar.ok) {
                if (!svar.tom) this.ryst(f.delEl[i]);
                this.fane.regnFejl(svar.besked, svar.tom, f.id);
                this.fokus(i);
                return;
            }
            f.plads[i] = svar.led;
        }
        this.ledPlaceret(f, false);
    };

    /* Et eller begge felter i mellemregningen er rigtige */
    P.ledPlaceret = function (f, vist) {
        if (f.plads[0] !== null && f.plads[1] !== null) {
            f.fase = "tal";
            this.byg();
            this.fane.indsaetOk(vist, T.indsaetHTML(f.id, this.opg.sk, this.ledTekster(f)));
            return;
        }
        this.byg();
        this.fane.ledOk();
    };

    P.formelOk = function (vist, note) {
        var f = this.aktivt(), sk = this.opg.sk;
        f.fase = this.def(f.id).op ? "indsaet" : "tal";
        this.byg();
        this.fane.formelOk(vist, note, T.symHTML(T.venstre(f.id, sk)) + " = " + T.formelHTML(f.id, sk));
    };

    P.loes = function (maade) {
        var f = this.aktivt();
        f.status = maade;
        f.fase = "tal";
        this.k++;
        if (!this.faerdig()) this.felter[this.k].status = "aktiv";
        this.netop = f.id;
        this.byg();
        this.fane.regnLoest(f.id, maade);
    };

    /* ----- Hint og svar -----------------------------------------------------------
       Hintene er rettet mod det felt, eleven er ved, og giver tit
       halvdelen af svaret (se D.TRIN). */
    function fyld(skabelon, led) {
        var a = led[0], b = led[1] || led[0];
        return skabelon.replace("{a0}", a.tal).replace("{b0}", b.tal).replace("{a}", a.tekst).replace("{b}", b.tekst);
    }

    P.hintHTML = function () {
        var f = this.aktivt();
        if (!f) return "";
        var t = this.def(f.id), led = T.led(f.id, this.opg);
        if (f.fase === "formel") return NK.html(t.formelHint);
        if (f.fase === "tal") return NK.html(fyld(t.talHint, led));
        /* Mellemregningen: hintet til det led, der mangler foerst */
        var mangler = [0, 1].filter(function (j) { return f.plads.indexOf(j) < 0; })[0];
        return NK.html(fyld(t.indsaetHint[mangler], led));
    };

    P.visSvar = function () {
        var f = this.aktivt(), mig = this;
        if (!f) return;
        if (f.fase === "formel") { this.formelOk(true); return; }
        if (f.fase === "indsaet") {
            /* De felter, der mangler, faar de led, der ikke er brugt */
            var fri = [0, 1].filter(function (j) { return f.plads.indexOf(j) < 0; });
            [0, 1].forEach(function (i) {
                if (f.plads[i] !== null) return;
                f.plads[i] = mig.def(f.id).op === "/" ? i : fri.shift();
                f.vist[i] = true;
            });
            this.ledPlaceret(f, true);
            return;
        }
        this.loes("svar");
    };

    P.regningHTML = function (id) {
        var f = this.felter.filter(function (x) { return x.id === id; })[0];
        return T.regningHTML(id, this.opg, f && this.def(id).op ? this.ledTekster(f) : null);
    };

    P.trinTekst = function () {
        var f = this.aktivt();
        if (!f) return "";
        var n = this.felter.length, t = this.def(f.id), hvad;
        var medEnhed = T.led(f.id, this.opg).every(function (l) { return l.enhed !== ""; });
        if (f.fase === "formel") hvad = "Skriv <b>formlen</b> for " + NK.html(t.venstre) + ".";
        else if (f.fase === "tal") hvad = "Regn <b>resultatet</b> ud, og skriv det med enhed.";
        else if (f.plads[0] === null && f.plads[1] === null) {
            hvad = t.op === "/" ? "Sæt <b>tallene</b> " + (medEnhed ? "med enheder " : "") + "ind over og under brøkstregen." :
                "Sæt de to <b>tal</b> med enheder ind, som skal ganges.";
        } else if (t.op === "/") {
            hvad = "Skriv nu tallet " + (medEnhed ? "med enhed " : "") + (f.plads[0] === null ? "over" : "under") + " brøkstregen.";
        } else hvad = "Skriv nu det andet tal med enhed.";
        return (n > 1 ? "Trin " + (this.k + 1) + " af " + n + ": " + NK.html(t.navn) + ". " : "") + hvad;
    };

    NK.Regning = Regning;

    /* ----- Det, fane 2 faar paa sin prototype ------------------------------------- */
    Regning.paa = function (P2) {
        P2.trinInfo = function () {
            var r = this.regning;
            if (r.faerdig()) return null;
            return { hint: r.hintHTML(), svar: function () { r.visSvar(); } };
        };
        P2.trinLinje = function () { return this.regning.trinTekst(); };
        P2.opgaveFaerdig = function () { return this.regning.faerdig(); };

        /* Et trin er gaaet videre: linjen viser det svar, eleven bad om,
           eller en kort ros, og saa det naeste skridt */
        P2.videre = function (vistHTML, godHTML) {
            this.hjaelp = 0;
            this.pegKnap = false;
            var trin = this.trinLinje();
            if (vistHTML) this.besked('<span class="b-maerke">Svaret</span> ' + vistHTML + " " + trin, "gul");
            else this.besked(godHTML + " " + trin, "god");
            this.visKnap();
            this.fokus();
        };

        P2.formelOk = function (vist, note, formelHTML) {
            this.videre(vist ? "<b>Formlen:</b> " + formelHTML + "." : null,
                note ? NK.html(note) + " <b>" + formelHTML + "</b>." : "Rigtig formel.");
        };

        P2.ledOk = function () { this.videre(null, "Rigtigt."); };

        P2.indsaetOk = function (vist, html) {
            this.videre(vist ? "<b>Mellemregningen:</b> " + html + "." : null, "Rigtigt.");
        };

        P2.regnLoest = function (id, maade) {
            if (this.efterTrin) this.efterTrin(id, maade);
            this.trinLoest(maade, maade === "svar" ? this.regning.regningHTML(id) + "." : null);
        };

        P2.regnFejl = function (besked, tom) {
            this.besked(NK.html(besked), tom ? "gul" : "skidt");
            this.fokus();
        };
    };
}());
