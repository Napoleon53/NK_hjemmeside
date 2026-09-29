/* =====================================================================
   regning.js - regnetrinene paa fane 3 og 4

   Hvert trin er et lille regnestykke i opgavekortet, der vokser nedad
   med lighedstegnene ud for hinanden, saadan som eleverne skal skrive
   det (brugerens oensker 29. sept. 2026, som sc4.3):

       c(NaCl) = n / V                 1. formlen: eleven vaelger formens
                                          skabelon (□/□, □ · □, □ − □ eller
                                          □ · □ over □) og skriver et bogstav
                                          i hvert felt
               = 0,150 mol / 0,500 L   2. tallene med enheder i felterne
               = 0,300 M               3. resultatet med enhed

   Over regnestykket staar de tre skridt (Formlen › Tallene ind ›
   Resultatet), saa det er tydeligt, at der foerst skal skrives en
   formel. Broeker staar med en rigtig broekstreg, ogsaa i felterne.
   Molarmassen har kun resultatet.

   Tavlen i scenen viser opgavens tal og det samme regnestykke, efter
   hvad der er skrevet: "c(NaCl) = ?", saa "c(NaCl) = n / V = ?" osv.

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

    function antal(f) { var op = D.TRIN[f.id].op; return op ? T.ANTAL_FELTER[op] : 0; }

    P.saet = function (opg) {
        this.opg = opg;
        this.k = 0;
        this.ny = null;
        this.felter = opg.trin.map(function (id, i) {
            /* sk: den valgte skabelon. bogst: bogstaverne i formlens felter.
               plads: det led, der staar i hvert af mellemregningens felter
               (null, til det er rigtigt), enheder: den enhed, eleven brugte
               der, tekst: det, eleven har skrevet. vEnhed: enheden paa det
               foerste rumfang (begge rumfang skal have samme enhed). */
            return { id: id, status: i === 0 ? "aktiv" : "laast", fase: D.TRIN[id].op ? "formel" : "tal", sk: null,
                     bogst: ["", "", ""], plads: [null, null, null], enheder: [null, null, null], vist: [false, false, false],
                     tekst: ["", "", ""], formelVist: false, vEnhed: null };
        });
        this.byg();
    };

    P.faerdig = function () { return this.k >= this.felter.length; };
    P.aktivt = function () { return this.faerdig() ? null : this.felter[this.k]; };
    P.loest = function (id) {
        return this.felter.some(function (f) { return f.id === id && (f.status === "ok" || f.status === "svar"); });
    };
    P.fase = function (id) {
        var f = this.felter.filter(function (x) { return x.id === id; })[0];
        return f ? f.fase : null;
    };

    /* Mellemregningens tal (med enhed) i felternes raekkefoelge */
    P.ledTekster = function (f) {
        var led = T.led(f.id, this.opg);
        return [0, 1, 2].slice(0, antal(f)).map(function (i) {
            var j = f.plads[i];
            return j === null ? null : T.ledTekst(led[j], f.enheder[i]);
        });
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
        g.appendChild(celle("rs-venstre", venstre ? NK.sub(venstre) : ""));
        g.appendChild(celle("rs-lig", "="));
        var h = celle("rs-hoejre");
        if (typeof hoejre === "string") h.innerHTML = hoejre;
        else h.appendChild(hoejre);
        g.appendChild(h);
    }

    function okKnap(fra) {
        return '<button type="button" class="felt-ok" aria-label="Tjek svaret" tabindex="-1"' + (fra || "") + '>↵</button>';
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
       gult, de faerdige er groenne med ✓ (som sc4.3) */
    P.trinbar = function (f) {
        var nu = skridt(f), laast = f.status === "laast";
        var vist = [!!f.formelVist, f.vist[0] || f.vist[1] || f.vist[2], f.status === "svar"];
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
        var mig = this, o = this.opg, vaert = this.vaert, n = this.felter.length;
        var ny = this.ny;
        this.ny = null;
        vaert.innerHTML = "";
        this.felter.forEach(function (f, i) {
            var t = D.TRIN[f.id];
            var rk = document.createElement("div");
            rk.className = "raekke" + (f.status === "laast" ? " laast" : "");
            var etiket = n > 1 ? "Del " + (i + 1) + " af " + n + ": " + t.navn : "Regn det ud i tre trin";
            rk.innerHTML = '<div class="raekke-hoved"><span class="raekke-etiket">' + NK.html(etiket) + "</span></div>" +
                (t.op ? mig.trinbar(f) : "");
            var venstre = T.venstre(f.id, o);
            var g = document.createElement("div");
            g.className = "regnestykke" + (venstre.length >= 8 ? " lang" : "");
            rk.appendChild(g);
            f.input = null;
            f.inputs = null;
            f.feltEl = null;
            f.delEl = null;
            var loest = f.status === "ok" || f.status === "svar";

            if (!t.op) {
                /* Molarmassen: kun resultatet */
                if (loest) {
                    linje(g, venstre, '<span class="rs-vist">' + NK.html(D.molarLed(D.stof(o.stof))) + " = <b>" + NK.html(T.facitTekst(f.id, o)) +
                        "</b></span>" + maerke(f.status === "svar"));
                } else linje(g, venstre, mig.enkeltFelt(f));
                vaert.appendChild(rk);
                return;
            }

            /* 1. Formlen (et trin, man ikke er naaet til, viser kun et ?) */
            if (f.fase === "formel" && f.status === "laast") linje(g, venstre, '<span class="rs-vist rs-laast">?</span>');
            else if (f.fase === "formel" && !loest) linje(g, venstre, mig.formelFelt(f));
            else linje(g, venstre, '<span class="rs-vist">' + T.formelHTML(f.id) + "</span>" + maerke(f.formelVist));

            /* 2. Mellemregningen */
            if (f.fase === "indsaet") linje(g, "", mig.ledFelt(f));
            else if (f.fase === "tal" || loest) {
                linje(g, "", '<span class="rs-vist">' + T.indsaetHTML(f.id, mig.ledTekster(f)) + "</span>" + maerke(f.vist[0] || f.vist[1] || f.vist[2]));
            }

            /* 3. Resultatet */
            if (loest) {
                linje(g, "", '<span class="rs-vist' + (f.status === "svar" ? " svar" : "") + '"><b>' + NK.html(T.facitTekst(f.id, o)) +
                    "</b></span>" + maerke(f.status === "svar"));
            } else if (f.fase === "tal") {
                linje(g, "", mig.enkeltFelt(f));
            }
            /* Den linje, der lige er blevet rigtig, lyser kort groent op */
            if (ny && ny.i === i) {
                var h = g.querySelectorAll(".rs-hoejre")[ny.linje];
                if (h) h.classList.add("rs-ny");
            }
            vaert.appendChild(rk);
        });
    };

    /* Felterne i en skabelon: "/" en broek, "*" og "-" to felter med et
       regnetegn, stjerne-skraastreg to felter med gangetegn over en
       broekstreg. lav(i) giver feltet i. */
    function struktur(op, lav) {
        function tegn(t) { var s = document.createElement("span"); s.className = "bf-gange"; s.textContent = t; return s; }
        function streg() { var s = document.createElement("div"); s.className = "bf-streg"; return s; }
        var krop = document.createElement("div");
        krop.className = "bf-krop";
        if (op === "*" || op === "-") {
            krop.appendChild(lav(0));
            krop.appendChild(tegn(op === "*" ? "·" : "−"));
            krop.appendChild(lav(1));
            return krop;
        }
        var b = document.createElement("div");
        b.className = "bf-broek";
        if (op === "/") {
            b.appendChild(lav(0));
        } else {
            var top = document.createElement("div");
            top.className = "bf-top";
            top.appendChild(lav(0));
            top.appendChild(tegn("·"));
            top.appendChild(lav(1));
            b.appendChild(top);
        }
        b.appendChild(streg());
        b.appendChild(lav(op === "/" ? 1 : 2));
        krop.appendChild(b);
        return krop;
    }

    /* En lille tegning af en skabelon paa en knap */
    var SK_HTML = {
        "/": '<span class="sk-broek"><span>□</span><span>□</span></span>',
        "*": "□ · □",
        "-": "□ − □",
        "*/": '<span class="sk-broek"><span>□ · □</span><span>□</span></span>'
    };
    var SK_NAVN = { "/": "en brøk", "*": "et gangestykke", "-": "et minusstykke", "*/": "et gangestykke over en brøkstreg" };

    function skabelonKnapper(mig, f, lille) {
        var rad = document.createElement("div");
        rad.className = "skabeloner" + (lille ? " lille" : "");
        rad.innerHTML = '<span class="sk-tekst">' + (lille ? "Anden form:" : "Vælg formlens form:") + "</span>";
        D.SKABELONER[mig.opg.fane].forEach(function (sk) {
            if (lille && sk === f.sk) return;
            var b = document.createElement("button");
            b.type = "button";
            b.className = "sk-knap";
            b.setAttribute("aria-label", "Formlen er " + SK_NAVN[sk]);
            b.innerHTML = SK_HTML[sk];
            b.addEventListener("click", function () { mig.vaelgSkabelon(sk); });
            rad.appendChild(b);
        });
        return rad;
    }

    /* Formlen: foerst skabelonerne, saa et felt til hvert bogstav */
    P.formelFelt = function (f) {
        var mig = this;
        var omr = document.createElement("div");
        omr.className = "formel-omr";
        f.inputs = null;
        if (!f.sk) {
            omr.appendChild(skabelonKnapper(this, f, false));
            f.feltEl = omr;
            return omr;
        }
        var n = T.ANTAL_FELTER[f.sk];
        var fe = document.createElement("div");
        fe.className = "felt aktiv broekfelt bogstavfelt";
        fe.style.flex = "1";
        f.inputs = [];
        f.delEl = [];
        var HVOR = T.HVOR[f.sk];
        var krop = struktur(f.sk, function (i) {
            var del = document.createElement("div");
            del.className = "bf-del bogstav";
            del.innerHTML = '<input type="text" inputmode="text" autocomplete="off" spellcheck="false" maxlength="10" aria-label="Bogstavet ' +
                HVOR[i] + '" placeholder="?">';
            var inp = del.querySelector("input");
            inp.value = f.bogst[i] || "";
            inp.addEventListener("keydown", function (e) {
                if (e.key !== "Enter") return;
                e.preventDefault();
                /* Enter i et felt: videre til det naeste tomme, ellers tjek */
                for (var j = 0; j < n; j++) {
                    if (j !== i && !String(f.bogst[j] || "").trim() && inp.value.trim()) { mig.fokus(j); return; }
                }
                mig.tjek();
            });
            inp.addEventListener("input", function () {
                f.bogst[i] = inp.value;
                if (mig.fane.k) mig.fane.k.skriver();
            });
            f.inputs[i] = inp;
            f.delEl[i] = del;
            return del;
        });
        fe.appendChild(krop);
        var knap = document.createElement("div");
        knap.innerHTML = okKnap();
        var ok = knap.firstChild;
        ok.addEventListener("click", function () { mig.tjek(); });
        fe.appendChild(ok);
        omr.appendChild(fe);
        omr.appendChild(skabelonKnapper(this, f, true));
        f.feltEl = fe;
        return omr;
    };

    P.vaelgSkabelon = function (sk) {
        var f = this.aktivt();
        if (!f || f.fase !== "formel" || this.fane.auto) return;
        f.sk = sk;
        this.byg();
        this.fane.skabelonValgt();
        var n = T.ANTAL_FELTER[sk];
        for (var j = 0; j < n; j++) if (!String(f.bogst[j] || "").trim()) { this.fokus(j); return; }
        this.fokus(0);
    };

    /* Et felt til resultatet med enhed */
    P.enkeltFelt = function (f) {
        var mig = this, t = D.TRIN[f.id];
        var fra = f.status === "aktiv" ? "" : " disabled";
        var fe = document.createElement("div");
        fe.className = "felt " + f.status;
        fe.style.flex = "1";
        fe.innerHTML = '<input type="text" inputmode="text" autocomplete="off" spellcheck="false" aria-label="Resultatet med enhed for ' +
            NK.html(t.navn.toLowerCase()) + '" placeholder="resultatet med enhed"' + fra + ">" + okKnap(fra);
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

    /* Mellemregningen: et felt til hvert tal med enhed i formlens skabelon.
       Et felt, der er rigtigt, viser tallet. */
    P.ledFelt = function (f) {
        var mig = this, op = D.TRIN[f.id].op;
        var tekster = this.ledTekster(f);
        var fe = document.createElement("div");
        fe.className = "felt aktiv broekfelt";
        fe.style.flex = "1";
        f.inputs = [];
        f.delEl = [];
        var HVOR = T.HVOR[op];
        fe.appendChild(struktur(op, function (i) {
            var del = document.createElement("div");
            f.delEl[i] = del;
            if (f.plads[i] !== null) {
                del.className = "bf-del ok";
                del.innerHTML = '<span class="bf-tekst">' + NK.html(tekster[i]) + "</span>";
                f.inputs[i] = null;
            } else {
                del.className = "bf-del";
                del.innerHTML = '<input type="text" inputmode="text" autocomplete="off" spellcheck="false" aria-label="Tal og enhed ' +
                    HVOR[i] + '" placeholder="tal og enhed">';
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
            return del;
        }));
        var knap = document.createElement("div");
        knap.innerHTML = okKnap();
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
        if (f.fase === "formel") {
            if (!f.inputs) return null;
            for (var i = 0; i < f.inputs.length; i++) if (f.inputs[i] && !f.inputs[i].value.trim()) return f.inputs[i];
            return f.inputs[0] || null;
        }
        if (f.fase === "indsaet") {
            if (!f.inputs) return null;
            for (var j = 0; j < f.inputs.length; j++) if (f.plads[j] === null && f.inputs[j]) return f.inputs[j];
            return null;
        }
        return f.input;
    };

    P.fokus = function (i) {
        var f = this.aktivt();
        var inp = f && f.inputs && i !== undefined && f.inputs[i] ? f.inputs[i] : this.aktivtInput();
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
       Knappen (↵) tjekker dem alle. */
    P.tjek = function (hvor) {
        var f = this.aktivt();
        if (!f || this.fane.auto) return;
        var svar;
        if (f.fase === "formel") {
            if (!f.sk) { this.fane.regnFejl("Vælg først formlens form: klik på en af knapperne.", true, f.id, null); return; }
            svar = T.formelFelter(f.id, f.sk, f.bogst.slice(0, T.ANTAL_FELTER[f.sk]));
            if (svar.ok) { this.formelOk(false, svar.note); return; }
            if (!svar.tom) this.ryst(svar.felt !== undefined && f.delEl ? f.delEl[svar.felt] : f.feltEl);
            this.fane.regnFejl(svar.besked, svar.tom, f.id, null);
            if (svar.felt !== undefined) this.fokus(svar.felt);
            return;
        }
        if (f.fase === "indsaet") { this.tjekLed(f, hvor); return; }
        if (!f.input) return;
        var raa = f.input.value;
        svar = T.trin(f.id, raa, this.opg);
        if (svar.ok) { this.loes("ok"); return; }
        if (!svar.tom) this.ryst(f.feltEl);
        var tal = T.svar(raa);
        this.fane.regnFejl(svar.besked, svar.tom, f.id, tal && !svar.talOk ? tal.base : null);
    };

    P.tjekLed = function (f, hvor) {
        var op = D.TRIN[f.id].op, n = antal(f);
        var raekke = hvor === undefined ? [0, 1, 2].slice(0, n) : [hvor];
        var placeret = false;
        for (var k = 0; k < raekke.length; k++) {
            var i = raekke[k];
            if (f.plads[i] !== null) continue;
            var ledige = T.ledige(op, i, f.plads);
            var svar = T.tjekLed(f.id, this.opg, i, f.inputs[i] ? f.inputs[i].value : "", ledige, f);
            if (!svar.ok) {
                /* Et felt foer dette var rigtigt: det skal vises som rigtigt */
                if (placeret) this.byg();
                if (!svar.tom) this.ryst(f.delEl[i]);
                this.fane.regnFejl(svar.besked, svar.tom, f.id, null);
                this.fokus(i);
                return;
            }
            f.plads[i] = svar.led;
            f.enheder[i] = svar.enhed;
            placeret = true;
            if (T.led(f.id, this.opg)[svar.led].slags === "V" && !f.vEnhed) f.vEnhed = svar.enhed;
        }
        this.ledPlaceret(f, false);
    };

    function alleOk(f) {
        for (var i = 0; i < antal(f); i++) if (f.plads[i] === null) return false;
        return true;
    }

    /* Et eller flere felter i mellemregningen er rigtige */
    P.ledPlaceret = function (f, vist) {
        if (alleOk(f)) {
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
        this.fane.formelOk(vist, note, NK.sub(T.venstre(f.id, this.opg)) + " = " + T.formelHTML(f.id));
    };

    P.loes = function (maade) {
        var f = this.aktivt();
        f.status = maade;
        f.fase = "tal";
        if (maade === "ok" && D.TRIN[f.id].op) this.ny = { i: this.k, linje: 2 };
        this.k++;
        if (!this.faerdig()) this.felter[this.k].status = "aktiv";
        this.byg();
        this.fane.regnLoest(f.id, maade);
    };

    /* ----- Hint og svar -----------------------------------------------------------
       Hintene er rettet mod det felt, eleven er ved, og giver tit
       halvdelen af svaret. */
    P.hintHTML = function () {
        var f = this.aktivt();
        if (!f) return "";
        var o = this.opg, op = D.TRIN[f.id].op;
        if (f.fase === "formel") return NK.sub(D.TRIN[f.id].formelHint);
        if (f.fase === "tal") return NK.sub(T.talHint(f.id, o));
        /* Mellemregningen: hintet til det foerste felt, der mangler */
        var i = 0;
        while (i < antal(f) && f.plads[i] !== null) i++;
        var led = T.ledige(op, i, f.plads)[0];
        return NK.sub(T.ledHint(f.id, o, led));
    };

    P.visSvar = function () {
        var f = this.aktivt();
        if (!f) return;
        if (f.fase === "formel") {
            f.sk = D.TRIN[f.id].op;
            this.formelOk(true);
            return;
        }
        if (f.fase === "indsaet") {
            /* De felter, der mangler, faar de led, der ikke er brugt */
            var op = D.TRIN[f.id].op;
            for (var i = 0; i < antal(f); i++) {
                if (f.plads[i] !== null) continue;
                f.plads[i] = T.ledige(op, i, f.plads)[0];
                f.enheder[i] = f.vEnhed && T.led(f.id, this.opg)[f.plads[i]].slags === "V" ? f.vEnhed : null;
                f.vist[i] = true;
            }
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
        if (!t.op) hvad = "Slå atommasserne op, og skriv <b>resultatet</b> med enhed.";
        else if (f.fase === "formel") {
            hvad = f.sk ? "Skriv <b>bogstaverne</b> i formlen for " + NK.sub(T.venstre(f.id, this.opg)) + "." :
                "Vælg <b>formlens form</b>, og skriv så bogstaverne i felterne.";
        } else if (f.fase === "tal") hvad = "Regn <b>resultatet</b> ud, og skriv det med enhed.";
        else if (f.plads[0] === null && f.plads[1] === null && f.plads[2] === null) {
            hvad = t.op === "/" ? "Sæt <b>tallene</b> med enheder ind over og under brøkstregen." :
                "Sæt <b>tallene</b> med enheder ind i felterne.";
        } else hvad = "Skriv nu det næste tal med enhed.";
        return (n > 1 ? "Del " + (this.k + 1) + " af " + n + ": " + NK.html(t.navn) + ". " : "") + hvad;
    };

    /* ----- Tavlen ------------------------------------------------------------------
       Hvert trin har en fast hoejde efter det endelige regnestykke, saa
       intet hopper, naar det vokser. Et regnestykke, der er for bredt,
       deles efter formlen. */
    P.regnDele = function (f) {
        var loest = f.status === "ok" || f.status === "svar";
        var op = D.TRIN[f.id].op;
        return T.regnDele(f.id, this.opg, {
            formel: !op || f.fase !== "formel" || loest,
            led: op && (f.fase !== "formel" || loest) ? this.ledTekster(f) : null,
            resultat: loest,
            farve: f.status === "svar" ? "#9a6a00" : "#1d7a48"
        });
    };

    function trinHoejde(id, to) {
        var op = D.TRIN[id].op, broek = op === "/" || op === "*/";
        return to ? (broek ? 4.6 : 2.7) : (broek ? 2.6 : 1.5);
    }

    P.tavleMaal = function (ctx, bredde, data, f) {
        var o = this.opg, lh = f * 1.55;
        var b = bredde - f * 2.2;
        var dtekst = data.join("     ");
        var enLinje = Tg.rigBredde(ctx, dtekst, Tg.font("600", f), f) <= b;
        var trin = this.felter.map(function (fe) {
            var hel = T.regnDele(fe.id, o, { formel: true, led: T.ledTekster(fe.id, o), resultat: true });
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

    P.tegnTavle = function (ctx, r, data, tid) {
        Tg.tavle(ctx, r);
        /* Den stoerste skrift, hvor det hele kan vaere paa tavlen */
        var f = NK.klamp(Math.min(r.h / 12, r.b / 26), 13, 20);
        var m = this.tavleMaal(ctx, r.b, data, f);
        while (f > 12 && m.h > r.h) { f -= 0.5; m = this.tavleMaal(ctx, r.b, data, f); }
        var x = r.x + f * 1.1, b = m.b, y = r.y + f * 1.1, lh = f * 1.55;
        var lille = NK.klamp(f * 0.72, 12, 14);
        var moerk = "#1f2530", svag = "rgba(31, 37, 48, 0.4)";
        Tg.etiket(ctx, "Opgavens tal", x, y, lille);
        y += lh * 0.85;
        if (m.enLinje) {
            Tg.rig(ctx, data.join("     "), x, y, { font: Tg.font("600", f), px: f, farve: moerk });
            y += lh;
        } else {
            data.forEach(function (d) {
                var px = f;
                while (px > 12 && Tg.rigBredde(ctx, d, Tg.font("600", px), px) > b) px -= 0.5;
                Tg.rig(ctx, d, x, y, { font: Tg.font("600", px), px: px, farve: moerk });
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

    /* ----- Det, fane 3 og 4 faar paa deres prototype --------------------------------- */
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

        P2.skabelonValgt = function () {
            this.besked(this.trinLinje(), "");
        };

        P2.formelOk = function (vist, note, formelHTML) {
            this.videre(vist ? "<b>Formlen:</b> " + formelHTML : null,
                note ? NK.html(note) + " <b>" + formelHTML + "</b>." : "Rigtig formel.");
        };

        P2.ledOk = function () { this.videre(null, "Rigtigt."); };

        P2.indsaetOk = function (vist, html) {
            this.videre(vist ? "<b>Tallene:</b> " + html : null, "Rigtigt.");
        };

        P2.regnLoest = function (id, maade) {
            if (this.efterTrin) this.efterTrin(id, maade);
            this.trinLoest(maade, maade === "svar" ? this.regning.regningHTML(id) : null);
        };

        P2.regnFejl = function (besked, tom, id, v) {
            this.besked(NK.sub(besked), tom ? "gul" : "skidt");
            if (!tom && this.efterFejl) this.efterFejl(id, v);
            this.fokus();
        };
    };
}());
