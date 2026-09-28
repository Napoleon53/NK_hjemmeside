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

   Trinnet n(FeO) = n(Fe) har ingen mellemregning: formlen og saa
   resultatet. I maaling 2 staar formlerne der i forvejen, og eleven
   skriver kun tallene. Kun det aktive felt er aabent.

   Tavlen i scenen viser reaktionen, opgavens tal og det samme
   regnestykke, efter hvad der er skrevet.

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

    /* Den fase, et trin starter i: formlen, eller (naar formlerne er
       givet) mellemregningen eller resultatet */
    function startFase(id, kunTal) {
        if (!kunTal) return "formel";
        return D.TRIN[id].op ? "indsaet" : "tal";
    }

    P.saet = function (opg) {
        this.opg = opg;
        this.k = 0;
        this.felter = opg.trin.map(function (id, i) {
            /* plads: det led, der staar i hvert af mellemregningens to felter
               (null, til det er rigtigt). tekst: det, eleven har skrevet der. */
            return { id: id, status: i === 0 ? "aktiv" : "laast", fase: startFase(id, opg.kunTal),
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

    P.byg = function () {
        var mig = this, o = this.opg, vaert = this.vaert;
        vaert.innerHTML = "";
        this.felter.forEach(function (f, i) {
            var t = D.TRIN[f.id];
            var rk = document.createElement("div");
            rk.className = "raekke";
            rk.innerHTML = '<div class="raekke-hoved"><span class="raekke-etiket">' + (i + 1) + ". " + NK.html(t.navn) + "</span></div>";
            var venstre = T.venstre(f.id);
            var g = document.createElement("div");
            g.className = "regnestykke" + (t.op === "*" && venstre.length >= 8 ? " lang" : "");
            rk.appendChild(g);
            f.input = null;
            f.inputs = null;
            f.feltEl = null;
            f.delEl = null;
            var loest = f.status === "ok" || f.status === "svar";

            /* 1. Formlen */
            if (f.fase === "formel" && !loest) linje(g, venstre, mig.enkeltFelt(f, "formel"));
            else linje(g, venstre, '<span class="rs-vist">' + T.formelHTML(f.id) + "</span>");

            /* 2. Mellemregningen (ikke i trinnet n(FeO) = n(Fe)) */
            if (t.op) {
                if (f.fase === "indsaet" && !loest) linje(g, "", mig.broekFelt(f));
                else if (f.fase === "tal" || loest) linje(g, "", '<span class="rs-vist">' + T.indsaetHTML(f.id, mig.ledTekster(f)) + "</span>");
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
            (slags === "formel" ? "skriv formlen" : "tal og enhed") + '"' + fra + ">" + okKnap(fra);
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
                del.className = "bf-del";
                del.innerHTML = '<input type="text" inputmode="text" autocomplete="off" spellcheck="false" aria-label="Tal og enhed ' +
                    NAVN[i] + '" placeholder="tal og enhed"' + fra + ">";
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
            svar = T.formel(f.id, raa);
            if (svar.ok) { this.formelOk(false, svar.note); return; }
        } else {
            svar = T.trin(f.id, raa, this.opg);
            if (svar.ok) { this.loes("ok"); return; }
        }
        if (!svar.tom) this.ryst(f.feltEl);
        this.fane.regnFejl(svar.besked, svar.tom, f.id);
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
            this.fane.indsaetOk(vist, T.indsaetHTML(f.id, this.ledTekster(f)));
            return;
        }
        this.byg();
        this.fane.ledOk();
    };

    P.formelOk = function (vist, note) {
        var f = this.aktivt();
        f.fase = D.TRIN[f.id].op ? "indsaet" : "tal";
        this.byg();
        this.fane.formelOk(vist, note, NK.html(T.venstre(f.id)) + " = " + T.formelHTML(f.id));
    };

    P.loes = function (maade) {
        var f = this.aktivt();
        f.status = maade;
        f.fase = "tal";
        this.k++;
        if (!this.faerdig()) this.felter[this.k].status = "aktiv";
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
        var t = D.TRIN[f.id], led = T.led(f.id, this.opg);
        if (f.fase === "formel") return NK.html(t.formelHint);
        if (f.fase === "tal") return NK.html(fyld(t.talHint, led));
        /* Mellemregningen: hintet til det led, der mangler foerst */
        var mangler = [0, 1].filter(function (j) { return f.plads.indexOf(j) < 0; })[0];
        return NK.html(fyld(t.indsaetHint[mangler], led));
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
        return T.regningHTML(id, this.opg, f && D.TRIN[id].op ? this.ledTekster(f) : null);
    };

    P.trinTekst = function () {
        var f = this.aktivt();
        if (!f) return "";
        var n = this.felter.length, t = D.TRIN[f.id], hvad;
        if (f.fase === "formel") hvad = "Skriv <b>formlen</b> for " + NK.html(T.venstre(f.id)) + ".";
        else if (f.fase === "tal") hvad = "Regn <b>resultatet</b> ud, og skriv det med enhed.";
        else if (f.plads[0] === null && f.plads[1] === null) {
            hvad = t.op === "/" ? "Sæt <b>tallene</b> med enheder ind over og under brøkstregen." :
                "Sæt de to <b>tal</b> med enheder ind, som skal ganges.";
        } else if (t.op === "/") hvad = "Skriv nu tallet med enhed " + (f.plads[0] === null ? "over" : "under") + " brøkstregen.";
        else hvad = "Skriv nu det andet tal med enhed.";
        return (n > 1 ? "Trin " + (this.k + 1) + " af " + n + ": " + NK.html(t.navn) + ". " : "") + hvad;
    };

    /* ----- Tavlen ------------------------------------------------------------------
       r: rektanglet. data: linjerne med opgavens tal. reaktion: skemaet
       oeverst. Hvert trin har en fast hoejde efter det endelige
       regnestykke, saa intet hopper, naar det vokser. Et regnestykke, der
       er for bredt, deles efter formlen. */
    P.regnDele = function (f) {
        var loest = f.status === "ok" || f.status === "svar";
        var op = D.TRIN[f.id].op;
        return T.regnDele(f.id, this.opg, {
            formel: f.fase !== "formel" || loest,
            led: !op || (f.fase === "formel" && !loest) ? null : this.ledTekster(f),
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
       hoejden */
    P.tavleMaal = function (ctx, bredde, data, f) {
        var o = this.opg, lh = f * 1.55;
        var b = bredde - f * 2.2;
        var dtekst = data.join("     ");
        NK.passendeSkrift(ctx, dtekst, b, f, 12, "600");
        var enLinje = ctx.measureText(dtekst).width <= b;
        var trin = this.felter.map(function (fe) {
            var hel = T.regnDele(fe.id, o, { formel: true, led: T.led(fe.id, o).map(function (l) { return l.tekst; }), resultat: true });
            var px = f;
            while (px > 12 && Tg.regnestykkeBredde(ctx, hel, px) > b) px -= 0.5;
            var to = Tg.regnestykkeBredde(ctx, hel, px) > b;
            if (to) px = f;
            return { px: px, to: to, hh: trinHoejde(fe.id, to) * f };
        });
        var h = f * 1.1 + lh * 0.85 + lh + lh * 0.15;                                   /* reaktionen */
        h += lh * 0.85 + (enLinje ? lh : lh * 0.95 * data.length) + lh * 0.25 + lh * 0.85 - f * 0.55;
        trin.forEach(function (t) { h += t.hh; });
        return { b: b, enLinje: enLinje, trin: trin, h: h + f * 0.5 };
    };

    P.tegnTavle = function (ctx, r, data, reaktion, tid, f) {
        Tg.tavle(ctx, r);
        var m = this.tavleMaal(ctx, r.b, data, f);
        var x = r.x + f * 1.1, b = m.b, y = r.y + f * 1.1, lh = f * 1.55;
        var lille = NK.klamp(f * 0.72, 12, 14);
        var moerk = "#1f2530", svag = "rgba(31, 37, 48, 0.4)", blaa = "#1d5d9c";
        Tg.tavleEtiket(ctx, "Reaktionen", x, y, lille);
        y += lh * 0.85;
        NK.passendeSkrift(ctx, reaktion, b, f * 1.05, 12, "700");
        NK.tekst(ctx, reaktion, x, y, { font: ctx.font, linje: "middle", farve: moerk });
        y += lh + lh * 0.15;
        Tg.tavleEtiket(ctx, "Opgavens tal", x, y, lille);
        y += lh * 0.85;
        if (m.enLinje) {
            var dtekst = data.join("     ");
            NK.passendeSkrift(ctx, dtekst, b, f, 12, "600");
            NK.tekst(ctx, dtekst, x, y, { font: ctx.font, linje: "middle", farve: blaa });
            y += lh;
        } else {
            data.forEach(function (d) {
                var px = NK.passendeSkrift(ctx, d, b, f, 12, "600");
                NK.tekst(ctx, d, x, y, { font: Tg.font("600", px), linje: "middle", farve: blaa });
                y += lh * 0.95;
            });
        }
        y += lh * 0.25;
        Tg.tavleEtiket(ctx, "Beregningen", x, y, lille);
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

    /* ----- Det, fane 2 faar paa sin prototype ------------------------------------- */
    Regning.paa = function (P2) {
        P2.trinInfo = function () {
            var r = this.regning;
            if (r.faerdig()) return null;
            return { hint: r.hintHTML(), svar: function () { r.visSvar(); } };
        };
        P2.trinLinje = function () { return this.regning.trinTekst(); };
        P2.opgaveFaerdig = function () { return this.regning.faerdig(); };

        /* Et trin er gaaet videre: Kemichael tier (eller siger det svar, han
           blev bedt om), og linjen siger det naeste skridt */
        P2.videre = function (vistHTML, godHTML) {
            this.hjaelp = 0;
            var trin = this.trinLinje();
            if (vistHTML) {
                if (this.k.sig(vistHTML, "svar", { lukVedSkriv: true })) this.besked(trin, "");
                else this.besked(vistHTML + " " + trin, "gul");
            } else {
                this.k.tie();
                this.besked(godHTML + " " + trin, "god");
            }
            this.visKnap();
            this.fokus();
        };

        P2.formelOk = function (vist, note, formelHTML) {
            this.videre(vist ? "<b>Formlen:</b> " + formelHTML : null,
                note ? NK.html(note) + " <b>" + formelHTML + "</b>." : "Rigtig formel.");
        };

        P2.ledOk = function () { this.videre(null, "Rigtigt."); };

        P2.indsaetOk = function (vist, html) {
            this.videre(vist ? "<b>Mellemregningen:</b> " + html : null, "Rigtigt.");
        };

        P2.regnLoest = function (id, maade) {
            if (this.efterTrin) this.efterTrin(id, maade);
            this.trinLoest(maade, maade === "svar" ? this.regning.regningHTML(id) : null);
        };

        P2.regnFejl = function (besked, tom) {
            this.besked(NK.html(besked), tom ? "gul" : "skidt");
            this.fokus();
        };
    };
}());
