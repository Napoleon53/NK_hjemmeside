/* =====================================================================
   regning.js - regnetrinene paa fanen Hypoteserne

   Hvert trin er et lille regnestykke i opgavekortet, der vokser nedad
   med lighedstegnene ud for hinanden, saadan som eleverne skal skrive
   det (som sc4.3, brugerens oenske 27. sept. 2026):

       n(Na₂O) = n(NaHCO₃)/2          1. formlen med symboler
               = 0,0620 mol/2          2. mellemregningen i felter med en
                                          rigtig broekstreg (eller to felter
                                          med et gangetegn)
               = 0,0310 mol            3. resultatet med enhed

   Foer regningen i en hypotese kommer afstemningen: et felt foran hvert
   stof i skemaet. Paa tavlen staar skemaet med elevens tal og
   atomtaellingen.

   I hypotese B og C er stilladset mindre (opg.kort): formlen for
   stofmaengden skal skrives, men mellemregningerne staar der, og
   massens formel ogsaa. Er forholdet 1 : 1, er der ingen mellemregning.

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
        this.felter = (opg.trin || []).map(function (id, i) {
            var f = { id: id, status: i === 0 ? "aktiv" : "laast", fase: "formel",
                      plads: [null, null], vist: [false, false], tekst: ["", ""] };
            if (id === "afstem") {
                f.fase = "afstem";
                f.koef = D.HYP[opg.hyp].stoffer.map(function () { return ""; });
            } else if (opg.kort && id === "m_p") {
                f.fase = "tal";
                f.plads = [0, 1];
            }
            return f;
        });
        this.byg();
    };

    P.faerdig = function () { return this.k >= this.felter.length; };
    P.aktivt = function () { return this.faerdig() ? null : this.felter[this.k]; };
    P.loest = function (id) {
        return this.felter.some(function (f) { return f.id === id && (f.status === "ok" || f.status === "svar"); });
    };
    P.felt = function (id) { return this.felter.filter(function (f) { return f.id === id; })[0] || null; };

    /* Mellemregningens to tal (med enhed) i den raekkefoelge, de staar i felterne */
    P.ledTekster = function (f) {
        if (!T.op(f.id, this.opg)) return null;
        var led = T.led(f.id, this.opg);
        return f.plads.map(function (j) { return j === null ? null : led[j].tekst; });
    };

    /* Det afstemte skema som tekst (1 skrives ikke) */
    function skemaTekst(hyp, koef) {
        var h = D.HYP[hyp], ud = "";
        h.stoffer.forEach(function (id, i) {
            var k = koef ? koef[i] : h.koef[i];
            var s = (String(k) === "1" ? "" : k + " ") + D.STOF[id].formel;
            ud += (i === 0 ? "" : (i === 1 ? " → " : " + ")) + s;
        });
        return ud;
    }
    Regning.skemaTekst = skemaTekst;

    /* ----- Raekkerne ------------------------------------------------------------- */
    function celle(klasse, html) {
        var e = document.createElement(klasse === "rs-hoejre" ? "div" : "span");
        e.className = klasse;
        if (html) e.innerHTML = html;
        return e;
    }

    function linje(g, venstre, hoejre) {
        g.appendChild(celle("rs-venstre", venstre ? T.symHTML(venstre) : ""));
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
            var rk = document.createElement("div");
            rk.className = "raekke";
            var navn = T.fyldP(D.TRIN[f.id].navn, o.hyp);
            rk.innerHTML = '<div class="raekke-hoved"><span class="raekke-etiket">' + (i + 1) + ". " + NK.html(navn) + "</span></div>";
            f.input = null;
            f.inputs = null;
            f.feltEl = null;
            f.delEl = null;
            var loest = f.status === "ok" || f.status === "svar";
            if (f.id === "afstem") {
                rk.appendChild(mig.skemaFelt(f, loest));
                vaert.appendChild(rk);
                return;
            }
            var venstre = T.venstre(f.id, o);
            var op = T.op(f.id, o);
            var g = document.createElement("div");
            g.className = "regnestykke" + (op === "*" && venstre.length >= 8 ? " lang" : "");
            rk.appendChild(g);

            /* 1. Formlen */
            if (f.fase === "formel" && !loest && f.status === "aktiv") linje(g, venstre, mig.enkeltFelt(f, "formel"));
            else if (f.fase === "formel" && !loest) linje(g, venstre, '<span class="rs-vist rs-svag">?</span>');
            else linje(g, venstre, '<span class="rs-vist">' + T.formelHTML(f.id, o) + "</span>");

            /* 2. Mellemregningen */
            if (op) {
                if (f.fase === "indsaet") linje(g, "", mig.broekFelt(f));
                else if (f.fase === "tal" || loest) linje(g, "", '<span class="rs-vist">' + T.indsaetHTML(f.id, o, mig.ledTekster(f)) + "</span>");
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

    /* Afstemningen: et felt foran hvert stof */
    P.skemaFelt = function (f, loest) {
        var mig = this, o = this.opg, h = D.HYP[o.hyp];
        var fe = document.createElement("div");
        fe.className = "felt skemafelt " + (loest ? f.status : f.status);
        if (loest) {
            fe.innerHTML = '<span class="sk-vist">' + NK.html(skemaTekst(o.hyp)) + '</span><span class="rs-maerke' +
                (f.status === "svar" ? " svar" : "") + '">' + (f.status === "ok" ? "✓" : "↩") + "</span>";
            f.feltEl = fe;
            return fe;
        }
        var fra = f.status === "aktiv" ? "" : " disabled";
        var krop = document.createElement("div");
        krop.className = "sk-krop";
        f.inputs = [];
        h.stoffer.forEach(function (id, i) {
            if (i === 1) krop.appendChild(celle("sk-pil", "→"));
            else if (i > 1) krop.appendChild(celle("sk-plus", "+"));
            var del = document.createElement("span");
            del.className = "sk-led";
            del.innerHTML = '<input type="text" inputmode="numeric" maxlength="2" autocomplete="off" spellcheck="false" aria-label="Tallet foran ' +
                NK.html(D.STOF[id].formel) + '"' + fra + '><span class="sk-stof">' + NK.html(D.STOF[id].formel) + "</span>";
            var inp = del.querySelector("input");
            inp.value = f.koef[i] || "";
            inp.addEventListener("keydown", function (e) {
                if (e.key === "Enter") { e.preventDefault(); mig.tjek(); }
            });
            inp.addEventListener("input", function () {
                f.koef[i] = inp.value;
                if (mig.fane.k) mig.fane.k.skriver();
            });
            f.inputs.push(inp);
            krop.appendChild(del);
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

    /* Et felt til formlen eller resultatet */
    P.enkeltFelt = function (f, slags) {
        var mig = this;
        var navn = T.fyldP(D.TRIN[f.id].navn, this.opg.hyp);
        var fra = f.status === "aktiv" ? "" : " disabled";
        var fe = document.createElement("div");
        fe.className = "felt " + f.status + (slags === "formel" ? " formelfelt" : "");
        fe.style.flex = "1";
        fe.innerHTML = '<input type="text" inputmode="text" autocomplete="off" spellcheck="false" aria-label="' +
            NK.html((slags === "formel" ? "Formlen for " : "Resultatet med enhed for ") + navn.toLowerCase()) + '" placeholder="' +
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

    /* Mellemregningen: to felter i en broek eller med et gangetegn */
    P.broekFelt = function (f) {
        var mig = this, broek = T.op(f.id, this.opg) === "/";
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

    P.aktivtInput = function () {
        var f = this.aktivt();
        if (!f) return null;
        if (f.fase === "afstem") {
            if (!f.inputs) return null;
            for (var j = 0; j < f.inputs.length; j++) if (!String(f.inputs[j].value).trim()) return f.inputs[j];
            return f.inputs[0];
        }
        if (f.fase === "indsaet") {
            if (!f.inputs) return null;
            for (var i = 0; i < 2; i++) if (f.plads[i] === null && f.inputs[i]) return f.inputs[i];
            return null;
        }
        return f.input;
    };

    P.fokus = function (i) {
        var f = this.aktivt();
        var inp = f && (f.fase === "indsaet" || f.fase === "afstem") && i !== undefined && f.inputs ? f.inputs[i] : this.aktivtInput();
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

    /* ----- Tjek ------------------------------------------------------------------ */
    P.tjek = function (hvor) {
        var f = this.aktivt();
        if (!f || this.fane.auto) return;
        if (f.fase === "afstem") { this.tjekSkema(f); return; }
        if (f.fase === "indsaet") { this.tjekLed(f, hvor); return; }
        if (!f.input) return;
        var raa = f.input.value, svar;
        if (f.fase === "formel") {
            svar = T.formel(f.id, raa, this.opg.hyp);
            if (svar.ok) { this.formelOk(false, svar.note); return; }
        } else {
            svar = T.trin(f.id, raa, this.opg);
            if (svar.ok) { this.loes("ok"); return; }
        }
        if (!svar.tom) this.ryst(f.feltEl);
        this.fane.regnFejl(svar.besked, svar.tom, f.id);
    };

    P.tjekSkema = function (f) {
        var raa = f.inputs.map(function (e) { return e.value; });
        f.koef = raa.slice();
        var svar = T.afstem(this.opg.hyp, raa);
        if (svar.ok) { this.loes("ok"); return; }
        if (!svar.tom) this.ryst(f.feltEl);
        this.fane.regnFejl(svar.besked, svar.tom, f.id);
        this.fokus(svar.felt);
    };

    P.tjekLed = function (f, hvor) {
        var op = T.op(f.id, this.opg);
        var raekke = hvor === undefined ? [0, 1] : [hvor];
        for (var k = 0; k < raekke.length; k++) {
            var i = raekke[k];
            if (f.plads[i] !== null) continue;
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

    P.ledPlaceret = function (f, vist) {
        if (f.plads[0] !== null && f.plads[1] !== null) {
            f.fase = "tal";
            this.byg();
            this.fane.indsaetOk(vist, T.indsaetHTML(f.id, this.opg, this.ledTekster(f)));
            return;
        }
        this.byg();
        this.fane.ledOk();
    };

    P.formelOk = function (vist, note) {
        var f = this.aktivt();
        if (!T.op(f.id, this.opg)) f.fase = "tal";
        else if (this.opg.kort) { f.fase = "tal"; f.plads = [0, 1]; }
        else f.fase = "indsaet";
        this.byg();
        this.fane.formelOk(vist, note, T.symHTML(T.venstre(f.id, this.opg)) + " = " + T.formelHTML(f.id, this.opg));
    };

    P.loes = function (maade) {
        var f = this.aktivt();
        f.status = maade;
        if (f.fase !== "afstem") f.fase = "tal";
        this.k++;
        if (!this.faerdig()) this.felter[this.k].status = "aktiv";
        this.byg();
        this.fane.regnLoest(f.id, maade);
    };

    /* ----- Hint og svar ---------------------------------------------------------- */
    P.hintHTML = function () {
        var f = this.aktivt();
        if (!f) return "";
        var t = D.TRIN[f.id], o = this.opg;
        if (f.fase === "afstem") return NK.html(T.fyldP(T.forhold(o.hyp) === 1 ? D.AFSTEM.hint1 : D.AFSTEM.hint, o.hyp));
        if (f.fase === "formel") {
            var fh = t.formelHint;
            if (fh && typeof fh === "object") fh = fh[T.forhold(o.hyp) === 1 ? "1" : "2"];
            return NK.html(T.fyldP(fh, o.hyp));
        }
        if (f.fase === "tal") return NK.html(T.fyldHint(t.talHint, f.id, o));
        var mangler = [0, 1].filter(function (j) { return f.plads.indexOf(j) < 0; })[0];
        return NK.html(T.fyldHint(t.indsaetHint[mangler], f.id, o));
    };

    P.visSvar = function () {
        var f = this.aktivt();
        if (!f) return;
        if (f.fase === "afstem") {
            f.koef = D.HYP[this.opg.hyp].koef.map(String);
            this.loes("svar");
            return;
        }
        if (f.fase === "formel") { this.formelOk(true); return; }
        if (f.fase === "indsaet") {
            var op = T.op(f.id, this.opg);
            var fri = [0, 1].filter(function (j) { return f.plads.indexOf(j) < 0; });
            [0, 1].forEach(function (i) {
                if (f.plads[i] !== null) return;
                f.plads[i] = op === "/" ? i : fri.shift();
                f.vist[i] = true;
            });
            this.ledPlaceret(f, true);
            return;
        }
        this.loes("svar");
    };

    /* Alt paa én gang (Snyd-knappen og selvtesten) */
    P.loesAlt = function () {
        var n = 0;
        while (!this.faerdig() && n++ < 40) this.visSvar();
    };

    P.regningHTML = function (id) {
        var f = this.felt(id);
        if (id === "afstem") return "<b>" + NK.html(skemaTekst(this.opg.hyp)) + "</b>";
        return T.regningHTML(id, this.opg, f ? this.ledTekster(f) : null);
    };

    P.trinTekst = function () {
        var f = this.aktivt();
        if (!f) return "";
        var n = this.felter.length, o = this.opg, hvad;
        var navn = T.fyldP(D.TRIN[f.id].navn, o.hyp);
        var op = T.op(f.id, o);
        if (f.fase === "afstem") hvad = "Skriv et tal foran hvert stof, så der er lige mange af hvert atom på begge sider.";
        else if (f.fase === "formel") hvad = "Skriv <b>formlen</b> for " + T.symHTML(T.venstre(f.id, o)) + ".";
        else if (f.fase === "tal") hvad = "Regn <b>resultatet</b> ud, og skriv det med enhed.";
        else if (f.plads[0] === null && f.plads[1] === null) {
            hvad = op === "/" ? "Sæt <b>tallene</b> ind over og under brøkstregen." : "Sæt de to <b>tal</b> med enheder ind, som skal ganges.";
        } else if (op === "/") hvad = "Skriv nu tallet " + (f.plads[0] === null ? "over" : "under") + " brøkstregen.";
        else hvad = "Skriv nu det andet tal med enhed.";
        return (n > 1 ? "Trin " + (this.k + 1) + " af " + n + ": " + NK.html(navn) + ". " : "") + hvad;
    };

    /* ----- Tavlen ------------------------------------------------------------------
       r: rektanglet. data: linjerne med opgavens tal. Skemaet med elevens
       tal og atomtaellingen staar oeverst, naar opgaven er en hypotese. */
    P.regnDele = function (f) {
        var loest = f.status === "ok" || f.status === "svar";
        return T.regnDele(f.id, this.opg, {
            formel: f.fase !== "formel" || loest,
            led: f.fase === "formel" && !loest ? null : this.ledTekster(f),
            resultat: loest,
            farve: f.status === "svar" ? "#9a6a00" : "#1d7a48"
        });
    };

    function trinHoejde(broek, to) {
        return to ? (broek ? 4.6 : 2.7) : (broek ? 2.6 : 1.5);
    }

    P.regneFelter = function () { return this.felter.filter(function (f) { return f.id !== "afstem"; }); };

    P.tavleMaal = function (ctx, bredde, data, f) {
        var o = this.opg, lh = f * 1.55;
        var b = bredde - f * 2.2;
        var dtekst = data.join("     ");
        NK.passendeSkrift(ctx, dtekst, b, f, 12, "600");
        var enLinje = ctx.measureText(dtekst).width <= b;
        var trin = this.regneFelter().map(function (fe) {
            var op = T.op(fe.id, o);
            var hel = T.regnDele(fe.id, o, { formel: true, led: op ? T.led(fe.id, o).map(function (l) { return l.tekst; }) : null, resultat: true });
            var px = f;
            while (px > 12 && Tg.regnestykkeBredde(ctx, hel, px) > b) px -= 0.5;
            var to = Tg.regnestykkeBredde(ctx, hel, px) > b;
            if (to) px = f;
            return { px: px, to: to, hh: trinHoejde(op === "/", to) * f };
        });
        var h = f * 1.1;
        if (o.hyp) h += lh * 0.85 + lh * 1.1 + lh * 0.95 + lh * 0.25;
        h += lh * 0.85 + (enLinje ? lh : lh * 0.95 * data.length) + lh * 0.25 + lh * 0.85 - f * 0.55;
        trin.forEach(function (t) { h += t.hh; });
        return { b: b, enLinje: enLinje, trin: trin, h: h + f * 0.5 };
    };

    /* Den stoerste skrift, hvor det hele kan vaere paa tavlen */
    P.tavleSkrift = function (ctx, r, data) {
        var f = NK.klamp(r.b / 26, 12, 20);
        while (f > 12 && this.tavleMaal(ctx, r.b, data, f).h > r.h) f -= 0.5;
        return f;
    };

    P.tegnTavle = function (ctx, r, data, tid) {
        Tg.tavle(ctx, r);
        var o = this.opg, mig = this;
        var f = this.tavleSkrift(ctx, r, data);
        var m = this.tavleMaal(ctx, r.b, data, f);
        var x = r.x + f * 1.1, b = m.b, y = r.y + f * 1.1, lh = f * 1.55;
        var lille = NK.klamp(f * 0.72, 12, 14);
        var moerk = "#1f2530", svag = "rgba(31, 37, 48, 0.4)";
        var puls = 0.55 + 0.45 * Math.sin((tid || 0) * 6);

        /* Skemaet og atomtaellingen */
        if (o.hyp) {
            var af = this.felt("afstem");
            Tg.etiket(ctx, "Hypotese " + o.hyp, x, y, lille);
            y += lh * 0.85;
            var loest = af && (af.status === "ok" || af.status === "svar");
            var koef = loest ? D.HYP[o.hyp].koef.map(String) : (af ? af.koef : null);
            Tg.skema(ctx, o.hyp, koef, x, y, b, f * 1.05, loest, af && af.status === "aktiv" ? puls : 0);
            y += lh * 1.1;
            var tael = T.taelling(o.hyp, koef || []);
            Tg.taelling(ctx, tael, x, y, b, NK.klamp(f * 0.8, 12, 15));
            y += lh * 0.95 + lh * 0.25;
        }

        Tg.etiket(ctx, "Opgavens tal", x, y, lille);
        y += lh * 0.85;
        if (m.enLinje) {
            var dtekst = data.join("     ");
            NK.passendeSkrift(ctx, dtekst, b, f, 12, "600");
            NK.tekst(ctx, dtekst, x, y, { font: ctx.font, linje: "middle", farve: moerk });
            y += lh;
        } else {
            data.forEach(function (d) {
                var px = NK.passendeSkrift(ctx, d, b, f, 12, "600");
                NK.tekst(ctx, d, x, y, { font: Tg.font("600", px), linje: "middle", farve: moerk });
                y += lh * 0.95;
            });
        }
        y += lh * 0.25;
        Tg.etiket(ctx, "Beregningen", x, y, lille);
        y += lh * 0.85 - f * 0.55;
        this.regneFelter().forEach(function (fe, i) {
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

    /* ----- Det, fanen faar paa sin prototype ------------------------------------- */
    Regning.paa = function (P2) {
        P2.trinInfo = function () {
            var r = this.regning;
            if (r.faerdig()) return null;
            return { hint: r.hintHTML(), svar: function () { r.visSvar(); } };
        };
        P2.trinLinje = function () { return this.regning.trinTekst(); };
        P2.opgaveFaerdig = function () { return this.regning.faerdig(); };

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
            this.fejlSet = true;
            this.fokus();
        };
    };
}());
