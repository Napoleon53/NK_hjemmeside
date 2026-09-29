/* =====================================================================
   regning.js - regnetrinene paa Vaegten

   Hvert trin er et lille regnestykke i opgavekortet, der vokser nedad
   med lighedstegnene ud for hinanden, saadan som eleverne skal skrive
   det (brugerens oenske 27. sept. 2026):

       n(NaCl) = m/M                    1. formlen, skrevet med bogstaver
               = 116,88 g/58,44 g/mol   2. mellemregningen: tallene med
                                           enheder i en broek med to felter
                                           (eller to felter med et gangetegn)
               = 2,00 mol               3. resultatet med enhed

   Kun det aktive felt er aabent, og en ny linje kommer frem, naar den
   forrige er rigtig. Broeker staar med en rigtig broekstreg, ogsaa i
   felterne, saa eleverne vaenner sig til den i stedet for "/".

   Over regnestykket staar de tre trin (Formlen › Tallene ind ›
   Resultatet) med det, eleven er ved, i gult og de faerdige i groent,
   og en rigtig linje faar ✓ og lyser kort op (brugerens oenske 29.
   sept. 2026: det var uklart, at formlen er foerste skridt mod svaret).

   Tavlen i scenen viser opgavens tal og det samme regnestykke, efter
   hvad der er skrevet: "n(NaCl) = ?", saa "n(NaCl) = m/M = ?" osv.

   NK.Regning.paa(P) giver fanen trinInfo, trinLinje, opgaveFaerdig og
   de kald, raekkerne bruger (formelOk, ledOk, indsaetOk, regnLoest,
   regnFejl).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = NK.Tjek;
    var Tg = NK.Tegn;

    function Regning(o) {
        this.vaert = o.vaert;
        this.fane = o.fane;
        this.opg = null;
        this.felter = [];
        this.k = 0;
    }
    var P = Regning.prototype;

    P.saet = function (opg) {
        this.opg = opg;
        this.k = 0;
        this.felter = opg.trin.map(function (id, i) {
            /* plads: det led, der staar i hvert af mellemregningens to felter
               (null, til det er rigtigt). tekst: det, eleven har skrevet der. */
            return { id: id, status: i === 0 ? "aktiv" : "laast", fase: "formel",
                     plads: [null, null], vist: [false, false], tekst: ["", ""] };
        });
        this.byg();
    };

    P.faerdig = function () { return this.k >= this.felter.length; };
    P.aktivt = function () { return this.faerdig() ? null : this.felter[this.k]; };
    P.loest = function (id) {
        return this.felter.some(function (f) { return f.id === id && (f.status === "ok" || f.status === "svar"); });
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

    /* ✓ ved en linje, der er rigtig, ↩ ved en, der er vist med Vis svaret */
    function maerke(vist) {
        return '<span class="rs-maerke' + (vist ? " svar" : "") + '">' + (vist ? "↩" : "✓") + "</span>";
    }

    /* Hvor langt et regnestykke er: 0 formlen, 1 tallene, 2 resultatet, 3 faerdigt */
    function skridt(f) {
        if (f.status === "ok" || f.status === "svar") return 3;
        return f.fase === "formel" ? 0 : (f.fase === "indsaet" ? 1 : 2);
    }

    /* Linjen over regnestykket med de tre skridt: det, eleven er ved, er
       gult, de faerdige er groenne med ✓ (brugerens oenske 29. sept. 2026:
       det var uklart, at formlen er foerste skridt mod antallet af mol) */
    P.trinbar = function (f) {
        var nu = skridt(f), laast = f.status === "laast";
        var vist = [!!f.formelVist, f.vist[0] || f.vist[1], f.status === "svar"];
        var html = '<ol class="trinbar' + (laast ? " laast" : "") + '" aria-label="Regnestykkets tre trin">';
        D.TRINBAR.forEach(function (navn, j) {
            var klasse = "tb-trin", nr = String(j + 1);
            if (j < nu) { klasse += vist[j] ? " svar" : " ok"; nr = vist[j] ? "↩" : "✓"; }
            else if (j === nu && !laast) klasse += " nu";
            if (j > 0) html += '<li class="tb-pil" aria-hidden="true">›</li>';
            html += '<li class="' + klasse + '"' + (j === nu && !laast ? ' aria-current="step"' : "") + '><span class="tb-nr">' + nr +
                '</span><span class="tb-navn">' + NK.html(navn) + "</span></li>";
        });
        return html + "</ol>";
    };

    P.byg = function () {
        var mig = this, o = this.opg, vaert = this.vaert, flere = this.felter.length > 1;
        var ny = this.ny;
        this.ny = null;
        vaert.innerHTML = "";
        this.felter.forEach(function (f, i) {
            var t = D.TRIN[f.id];
            var rk = document.createElement("div");
            rk.className = "raekke" + (f.status === "laast" ? " laast" : "");
            /* Overskriften: i Mesteren delene (stofmaengden, saa massen) */
            var etiket = flere ? "Del " + (i + 1) + ": " + t.navn + " af " + (f.id === "m" && o.st2 ? o.st2 : o.st).navn : "Regn det ud i tre trin";
            rk.innerHTML = '<div class="raekke-hoved"><span class="raekke-etiket">' + NK.html(etiket) + "</span></div>" + mig.trinbar(f);
            var venstre = T.venstre(f.id, o);
            var g = document.createElement("div");
            /* lang: to felter med gangetegn efter en lang venstreside (se stil.css) */
            g.className = "regnestykke" + (t.op === "*" && venstre.length >= 8 ? " lang" : "");
            rk.appendChild(g);
            f.input = null;
            f.inputs = null;
            f.feltEl = null;
            f.delEl = null;
            var loest = f.status === "ok" || f.status === "svar";

            /* 1. Formlen */
            if (f.fase === "formel" && !loest) linje(g, venstre, mig.enkeltFelt(f, "formel"));
            else linje(g, venstre, '<span class="rs-vist">' + T.formelHTML(f.id) + "</span>" + maerke(f.formelVist));

            /* 2. Mellemregningen */
            if (f.fase === "indsaet") linje(g, "", mig.broekFelt(f));
            else if (f.fase === "tal" || loest) linje(g, "", '<span class="rs-vist">' + T.indsaetHTML(f.id, mig.ledTekster(f)) + "</span>" + maerke(f.vist[0] || f.vist[1]));

            /* 3. Resultatet */
            if (loest) {
                linje(g, "", '<span class="rs-vist' + (f.status === "svar" ? " svar" : "") + '"><b>' + NK.html(T.facitTekst(f.id, o)) +
                    "</b></span>" + maerke(f.status === "svar"));
            } else if (f.fase === "tal") {
                linje(g, "", mig.enkeltFelt(f, "tal"));
            }
            /* Den linje, der lige er blevet rigtig, lyser kort groent op */
            if (ny && ny.i === i) {
                var h = g.querySelectorAll(".rs-hoejre")[ny.linje];
                if (h) h.classList.add("rs-ny");
            }
            vaert.appendChild(rk);
        });
    };

    /* Et felt til formlen eller resultatet */
    P.enkeltFelt = function (f, slags) {
        var mig = this, t = D.TRIN[f.id];
        var fra = f.status === "aktiv" ? "" : " disabled";
        var fe = document.createElement("div");
        fe.className = "felt " + f.status + (slags === "formel" ? " formelfelt" : "");
        fe.style.flex = "1";
        fe.innerHTML = '<input type="text" inputmode="text" autocomplete="off" spellcheck="false" aria-label="' +
            NK.html((slags === "formel" ? "Formlen for " : "Resultatet med enhed for ") + t.navn.toLowerCase()) + '" placeholder="' +
            (slags === "formel" ? "formlen med bogstaver" : "resultatet med enhed") + '"' + fra + ">" + okKnap(fra);
        var inp = fe.querySelector("input");
        inp.addEventListener("keydown", function (e) {
            if (e.key === "Enter") { e.preventDefault(); mig.tjek(); }
        });
        inp.addEventListener("input", function () { if (mig.fane.k) mig.fane.k.skriver(); });
        fe.querySelector(".felt-ok").addEventListener("click", function () { mig.tjek(); });
        f.feltEl = fe;
        f.input = inp;
        return fe;
    };

    /* Mellemregningen: to felter i en broek (over og under stregen) eller
       med et gangetegn imellem. Et felt, der er rigtigt, viser tallet. */
    P.broekFelt = function (f) {
        var mig = this, t = D.TRIN[f.id], broek = t.op === "/";
        var tekster = this.ledTekster(f);
        var fe = document.createElement("div");
        fe.className = "felt aktiv broekfelt";
        fe.style.flex = "1";
        var krop = document.createElement("div");
        krop.className = "bf-krop";
        var holder = broek ? document.createElement("div") : krop;
        if (broek) { holder.className = "bf-broek"; krop.appendChild(holder); }
        f.inputs = [null, null];
        f.delEl = [null, null];
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
                del.className = "bf-del";
                del.innerHTML = '<input type="text" inputmode="text" autocomplete="off" spellcheck="false" aria-label="Tal og enhed ' +
                    NAVN[i] + '" placeholder="tal og enhed">';
                var inp = del.querySelector("input");
                inp.value = f.tekst[i] || "";
                inp.addEventListener("keydown", function (e) {
                    if (e.key === "Enter") { e.preventDefault(); mig.tjek(i); }
                });
                inp.addEventListener("input", function () {
                    f.tekst[i] = inp.value;
                    if (mig.fane.k) mig.fane.k.skriver();
                });
                f.inputs[i] = inp;
            }
            holder.appendChild(del);
        });
        fe.appendChild(krop);
        var knap = document.createElement("div");
        knap.innerHTML = okKnap("");
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
            svar = T.formel(f.id, raa);
            if (svar.ok) { this.formelOk(false, svar.note); return; }
        } else {
            svar = T.trin(f.id, raa, this.opg);
            if (svar.ok) { this.loes("ok"); return; }
        }
        if (!svar.tom) this.ryst(f.feltEl);
        var tal = f.fase === "tal" ? T.svar(raa) : null;
        this.fane.regnFejl(svar.besked, svar.tom, f.id, tal && !svar.talOk ? tal.v : null);
    };

    P.tjekLed = function (f, hvor) {
        var op = D.TRIN[f.id].op;
        var raekke = hvor === undefined ? [0, 1] : [hvor];
        for (var k = 0; k < raekke.length; k++) {
            var i = raekke[k];
            if (f.plads[i] !== null) continue;
            /* I en broek hoerer hvert led til sit felt; et produkt kan staa i begge raekkefoelger */
            var ledige = op === "/" ? [i] : [0, 1].filter(function (j) { return f.plads.indexOf(j) < 0; });
            var svar = T.tjekLed(f.id, this.opg, i, f.inputs[i] ? f.inputs[i].value : "", ledige);
            if (!svar.ok) {
                if (!svar.tom) this.ryst(f.delEl[i]);
                this.fane.regnFejl(svar.besked, svar.tom, f.id, null);
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
            if (!vist) this.ny = { i: this.k, linje: 1 };
            this.byg();
            this.fane.indsaetOk(vist, T.indsaetHTML(f.id, this.ledTekster(f)));
            return;
        }
        this.byg();
        this.fane.ledOk();
    };

    P.formelOk = function (vist, note) {
        var f = this.aktivt();
        f.fase = "indsaet";
        f.formelVist = !!vist;
        if (!vist) this.ny = { i: this.k, linje: 0 };
        this.byg();
        this.fane.formelOk(vist, note, T.venstre(f.id, this.opg) + " = " + T.formelHTML(f.id));
    };

    P.loes = function (maade) {
        var f = this.aktivt();
        f.status = maade;
        f.fase = "tal";
        if (maade === "ok") this.ny = { i: this.k, linje: 2 };
        this.k++;
        if (!this.faerdig()) this.felter[this.k].status = "aktiv";
        this.byg();
        this.fane.regnLoest(f.id, maade);
    };

    /* ----- Hint og svar -----------------------------------------------------------
       Hintene er rettet mod det felt, eleven er ved, og giver tit
       halvdelen af svaret (se D.TRIN). */
    function fyld(skabelon, led, stof) {
        return skabelon.replace("{a0}", led[0].tal).replace("{b0}", led[1].tal)
            .replace("{a}", led[0].tekst).replace("{b}", led[1].tekst).replace("{stof}", stof);
    }

    P.hintHTML = function () {
        var f = this.aktivt();
        if (!f) return "";
        var t = D.TRIN[f.id], o = this.opg;
        var led = T.led(f.id, o), stof = (f.id === "m" && o.st2 ? o.st2 : o.st).navn;
        if (f.fase === "formel") return NK.html(t.formelHint);
        if (f.fase === "tal") return NK.html(fyld(t.talHint, led, stof));
        /* Mellemregningen: hintet til det led, der mangler foerst */
        var mangler = [0, 1].filter(function (j) { return f.plads.indexOf(j) < 0; })[0];
        if (mangler === 0 && f.id === "m" && o.st2) return NK.html(fyld(D.MESTER_HINT, led, stof));
        return NK.html(fyld(t.indsaetHint[mangler], led, stof));
    };

    /* Trekanten er det andet hint, naar formlen skal vendes */
    P.hint2 = function () {
        var f = this.aktivt();
        if (!f || f.fase !== "formel" || !D.TRIN[f.id].vend) return null;
        return { maal: f.id };
    };

    P.visSvar = function () {
        var f = this.aktivt();
        if (!f) return;
        if (f.fase === "formel") { this.formelOk(true); return; }
        if (f.fase === "indsaet") {
            /* De felter, der mangler, faar de led, der ikke er brugt */
            var fri = [0, 1].filter(function (j) { return f.plads.indexOf(j) < 0; });
            [0, 1].forEach(function (i) {
                if (f.plads[i] !== null) return;
                f.plads[i] = D.TRIN[f.id].op === "/" ? i : fri.shift();
                f.vist[i] = true;
            });
            this.ledPlaceret(f, true);
            return;
        }
        this.loes("svar");
    };

    P.regningHTML = function (id) {
        var f = this.felter.filter(function (x) { return x.id === id; })[0];
        return T.regningHTML(id, this.opg, f ? this.ledTekster(f) : null);
    };

    P.trinTekst = function () {
        var f = this.aktivt();
        if (!f) return "";
        /* Trinnene er de samme tre som i linjen over regnestykket. Formlen
           kommer foer tallene, og linjen siger det (brugerens oenske 29.
           sept. 2026: "skriv formlen" under "hvor mange mol" forvirrede). */
        var n = this.felter.length, t = D.TRIN[f.id], hvad;
        if (f.fase === "formel") hvad = "Trin 1: Skriv <b>formlen</b> for " + NK.html(T.venstre(f.id, this.opg)) + " med bogstaver. Tallene kommer i trin 2.";
        else if (f.fase === "tal") hvad = "Trin 3: Regn <b>resultatet</b> ud, og skriv det med enhed.";
        else if (f.plads[0] === null && f.plads[1] === null) {
            hvad = t.op === "/" ? "Trin 2: Sæt <b>tallene</b> med enheder ind over og under brøkstregen." :
                "Trin 2: Sæt de to <b>tal</b> med enheder ind, som skal ganges.";
        } else if (t.op === "/") hvad = "Skriv nu tallet med enhed " + (f.plads[0] === null ? "over" : "under") + " brøkstregen.";
        else hvad = "Skriv nu det andet tal med enhed.";
        return (n > 1 ? "Del " + (this.k + 1) + " af " + n + ". " : "") + hvad;
    };

    /* ----- Tavlen ------------------------------------------------------------------
       r: rektanglet. data: linjerne med opgavens tal. hoejre: plads, der
       skal holdes fri i hoejre side (til trekanten). Hvert trin har en
       fast hoejde efter det endelige regnestykke, saa intet hopper, naar
       det vokser. Et regnestykke, der er for bredt, deles efter formlen. */
    P.regnDele = function (f) {
        var loest = f.status === "ok" || f.status === "svar";
        return T.regnDele(f.id, this.opg, {
            formel: f.fase !== "formel" || loest,
            led: f.fase === "formel" && !loest ? null : this.ledTekster(f),
            resultat: loest,
            farve: f.status === "svar" ? "#9a6a00" : "#1d7a48"
        });
    };

    /* Hoejden, et trin faar paa tavlen (i skriftstoerrelser): en broek er
       hoejere end en linje, og et regnestykke paa to linjer er dobbelt saa hoejt */
    function trinHoejde(id, to) {
        var broek = D.TRIN[id].op === "/";
        return to ? (broek ? 4.6 : 2.7) : (broek ? 2.6 : 1.5);
    }

    /* Tavlens maal: bredden til tekst, om opgavens tal kan staa paa én
       linje, og for hvert trin skriften, om det skal paa to linjer, og
       hoejden. hoejre: plads, der holdes fri til trekanten. */
    P.tavleMaal = function (ctx, bredde, data, f, hoejre) {
        var o = this.opg, lh = f * 1.55;
        var b = bredde - f * 2.2;
        var dtekst = data.join("     ");
        NK.passendeSkrift(ctx, dtekst, b - (hoejre || 0), f, 12, "600");
        var enLinje = ctx.measureText(dtekst).width <= b - (hoejre || 0);
        var trin = this.felter.map(function (fe) {
            var hel = T.regnDele(fe.id, o, { formel: true, led: T.led(fe.id, o).map(function (l) { return l.tekst; }), resultat: true });
            var px = f;
            while (px > 12 && Tg.regnestykkeBredde(ctx, hel, px) > b) px -= 0.5;
            var to = Tg.regnestykkeBredde(ctx, hel, px) > b;
            if (to) px = f;
            return { px: px, to: to, hh: trinHoejde(fe.id, to) * f };
        });
        var h = f * 1.1 + lh * 0.85 + (enLinje ? lh : lh * 0.95 * data.length) + lh * 0.25 + lh * 0.85 - f * 0.55;
        trin.forEach(function (t) { h += t.hh; });
        return { b: b, enLinje: enLinje, trin: trin, h: h + f * 0.5 };
    };

    P.tegnTavle = function (ctx, r, data, tid, hoejre, f) {
        Tg.tavle(ctx, r);
        var m = this.tavleMaal(ctx, r.b, data, f, hoejre);
        var x = r.x + f * 1.1, b = m.b, y = r.y + f * 1.1, lh = f * 1.55;
        var lille = NK.klamp(f * 0.72, 12, 14);
        var moerk = "#1f2530", svag = "rgba(31, 37, 48, 0.4)";
        Tg.etiket(ctx, "Opgavens tal", x, y, lille);
        y += lh * 0.85;
        if (m.enLinje) {
            var dtekst = data.join("     ");
            NK.passendeSkrift(ctx, dtekst, b - (hoejre || 0), f, 12, "600");
            NK.tekst(ctx, dtekst, x, y, { font: ctx.font, linje: "middle", farve: moerk });
            y += lh;
        } else {
            data.forEach(function (d) {
                var px = NK.passendeSkrift(ctx, d, b - (hoejre || 0), f, 12, "600");
                NK.tekst(ctx, d, x, y, { font: Tg.font("600", px), linje: "middle", farve: moerk });
                y += lh * 0.95;
            });
        }
        y += lh * 0.25;
        Tg.etiket(ctx, "Beregningen", x, y, lille);
        y += lh * 0.85 - f * 0.55;
        var puls = 0.55 + 0.45 * Math.sin((tid || 0) * 6);
        var mig = this;
        this.felter.forEach(function (fe, i) {
            var aktiv = fe.status === "aktiv", tm = m.trin[i], hh = tm.hh, px = tm.px;
            var dele = mig.regnDele(fe);
            if (aktiv) {
                ctx.save();
                ctx.strokeStyle = "rgba(214, 160, 20, " + (0.4 + 0.5 * puls) + ")";
                ctx.lineWidth = 2;
                NK.rundtRekt(ctx, x - f * 0.45, y + f * 0.1, b + f * 0.6, hh - f * 0.2, 6);
                ctx.stroke();
                ctx.restore();
            }
            var farve = aktiv || fe.status !== "laast" ? moerk : svag;
            if (!tm.to) {
                Tg.regnestykke(ctx, dele, x, y + hh / 2, px, farve);
            } else {
                /* Formlen paa foerste linje, resten paa anden, med lighedstegnet under lighedstegnet */
                var dl = T.regnDeleSplit(dele);
                var ind = Tg.regnestykkeBredde(ctx, [dele[0]], px) - Tg.regnestykkeBredde(ctx, [{ t: "= " }], px);
                Tg.regnestykke(ctx, dl[0], x, y + hh * 0.25, px, farve);
                if (dl[1].length) {
                    var px2 = px;
                    while (px2 > 12 && ind + Tg.regnestykkeBredde(ctx, dl[1], px2) > b) px2 -= 0.5;
                    Tg.regnestykke(ctx, dl[1], x + ind, y + hh * 0.75, px2, farve);
                }
            }
            y += hh;
        });
    };

    NK.Regning = Regning;

    /* ----- Det, Vaegten faar paa sin prototype ------------------------------------- */
    Regning.paa = function (P2) {
        P2.trinInfo = function () {
            var r = this.regning;
            if (r.faerdig()) return null;
            return { hint: r.hintHTML(), hint2: r.hint2(), svar: function () { r.visSvar(); } };
        };
        P2.trinLinje = function () { return this.regning.trinTekst(); };
        P2.opgaveFaerdig = function () { return this.regning.faerdig(); };

        /* Et trin er gaaet videre: Kemichael roser kort, naar en hel linje
           er rigtig (del), eller siger det svar, han blev bedt om, og
           linjen siger det naeste skridt */
        P2.videre = function (vistHTML, godHTML, del) {
            this.hjaelp = 0;
            this.trekant = null;
            var trin = this.trinLinje();
            if (vistHTML) {
                if (this.k.sig(vistHTML, "svar", { lukVedSkriv: true })) this.besked(trin, "");
                else this.besked(vistHTML + " " + trin, "gul");
            } else {
                if (del) this.kRos(del); else this.k.tie();
                this.besked(godHTML + " " + trin, "god");
            }
            this.visKnap();
            this.fokus();
        };

        P2.formelOk = function (vist, note, formelHTML) {
            this.videre(vist ? "<b>Formlen:</b> " + formelHTML : null,
                note ? NK.html(note) + " <b>" + formelHTML + "</b>." : D.DEL_OK.formel, "formel");
            if (this.efterFormel) this.efterFormel();
        };

        P2.ledOk = function () { this.videre(null, "Rigtigt."); };

        P2.indsaetOk = function (vist, html) {
            this.videre(vist ? "<b>Mellemregningen:</b> " + html : null, D.DEL_OK.indsaet, "indsaet");
        };

        P2.regnLoest = function (id, maade) {
            if (this.efterTrin) this.efterTrin(id, maade);
            this.trinLoest(maade, maade === "svar" ? this.regning.regningHTML(id) : null, "tal");
        };

        P2.regnFejl = function (besked, tom, id, v) {
            this.besked(NK.html(besked), tom ? "gul" : "skidt");
            if (!tom && this.efterFejl) this.efterFejl(id, v);
            this.fokus();
        };
    };
}());
