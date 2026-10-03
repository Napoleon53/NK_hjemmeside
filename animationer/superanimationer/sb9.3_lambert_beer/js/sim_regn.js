/* =====================================================================
   sim_regn.js - fane 3: Beregningen

   Otte regnestykker i Let, Middel og Svaer. Regnestykket staar paa
   tavlen i scenen, og felterne er paa tavlen, hvor oejnene er:

     1. Formlen: eleven vaelger formens skabelon under tavlen og
        skriver eller klikker et bogstav i hvert felt.
     2. Tallene ind: et felt for hvert bogstav. Tallene under tavlen
        kan klikkes ind.
     3. Resultatet med enhed (A har ingen, og ε's enhed staar fast).

   Et trin, der er loest, klappes sammen til én linje med ✓.
   Facit, tjek og hint er i js/regning.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var R = NK.Regn;

    function SimRegn() {
        var mig = this;
        this.tavle = NK.el("regn-tavle");
        this.trinEl = NK.el("regn-trin");
        this.startFane(D.REGN, D.GRUPPER_REGN);
        this.bygSkabeloner();
        window.addEventListener("resize", function () { if (NK.el("fane-regn").classList.contains("aktiv")) mig.tilpas(); });
        var foerste = this.status.map(function (s) { return s.loest; }).indexOf(false);
        this.vaelg(foerste >= 0 ? foerste : 0);
    }

    var P = SimRegn.prototype;
    NK.Fane.paa(P, { navn: "regn" });

    P.opg = function () { return this.opgaver[this.nr]; };
    P.aktivt = function () { return this.ts[this.k] || null; };

    /* ----- Opgaven ---------------------------------------------------------------------- */
    P.lavOpgave = function (i) {
        var o = this.opgaver[i];
        R.vaerdier(o);
        this.k = 0;
        this.fokusInput = null;
        this.ts = o.trin.map(function (id, j) {
            return { id: id, status: j === 0 ? "aktiv" : "laast", fase: "formel", sk: null,
                bogst: ["", "", ""], bogstL: null, tal: ["", "", ""], talOk: [false, false, false], talTekst: [null, null, null],
                res: "", vist: false };
        });
        var s = D.STOFFER[o.stof];
        NK.saetTekst("regn-navn", s.Navn + ", " + s.formel);
        var spm = /Beregn[^.]*\./.exec(o.tekst);
        NK.saetTekst("regn-linje", spm ? spm[0] : o.navn);
        this.bygTal();
        this.bygBogstaver();
        this.render();
    };

    /* Opgavens tal oeverst paa tavlen */
    P.bygTal = function () {
        var o = this.opg(), V = R.vaerdier(o);
        var html = '<span class="ot-etiket">Opgavens tal</span>';
        Object.keys(o.tal).forEach(function (b) {
            var t = R.vis(b) + " = " + R.talMedEnhed(b, V.tal[b].tekst);
            if (b === "V") t += " (" + NK.dk(V.tal.V.v * 1000, 0) + " mL)";
            html += '<span class="ot-tal">' + NK.html(t) + "</span>";
        });
        NK.el("regn-tal").innerHTML = html;
    };

    P.bygSkabeloner = function () {
        var mig = this, rad = NK.el("regn-skabeloner");
        rad.innerHTML = "";
        var VIS = {
            "**": "□ · □",
            "***": "□ · □ · □",
            "/": '<span class="vbroek"><span>□</span><span>□</span></span>',
            "/**": '<span class="vbroek"><span>□</span><span>□ · □</span></span>'
        };
        D.SKABELONER.forEach(function (sk) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "brik skabelon";
            b.setAttribute("data-sk", sk);
            b.setAttribute("aria-label", "Formen " + R.SK_NAVN[sk]);
            b.innerHTML = VIS[sk];
            b.addEventListener("click", function () { mig.vaelgSkabelon(sk); });
            rad.appendChild(b);
        });
    };

    P.bygBogstaver = function () {
        var mig = this, rad = NK.el("regn-bogstaver");
        rad.innerHTML = "";
        R.knapBogstaver(this.opg()).forEach(function (b) {
            var k = document.createElement("button");
            k.type = "button";
            k.className = "brik bogstav";
            k.textContent = R.vis(b);
            k.title = D.BOGSTAV[b].navn;
            k.addEventListener("mousedown", function (e) { e.preventDefault(); });
            k.addEventListener("click", function () { mig.indsaet(R.vis(b), "formel"); });
            rad.appendChild(k);
        });
    };

    /* Tallene under tavlen i fasen "tallene ind" */
    P.bygTalKnapper = function () {
        var mig = this, o = this.opg(), V = R.vaerdier(o), rad = NK.el("regn-tallene");
        rad.innerHTML = "";
        var bogst = Object.keys(V.tal).filter(function (b) {
            if (V.tal[b].givet) return true;
            /* Et resultat fra et tidligere trin */
            for (var j = 0; j < mig.k; j++) if (D.TRIN[o.trin[j]].maal === b) return true;
            return false;
        });
        bogst.forEach(function (b) {
            var k = document.createElement("button");
            k.type = "button";
            k.className = "brik talbrik";
            var tekst = R.talMedEnhed(b, V.tal[b].tekst);
            k.innerHTML = '<span class="tb-b">' + NK.html(R.vis(b)) + " =&nbsp;</span>" + NK.html(tekst);
            k.addEventListener("mousedown", function (e) { e.preventDefault(); });
            k.addEventListener("click", function () { mig.indsaet(tekst, "tal"); });
            rad.appendChild(k);
        });
    };

    /* ----- Tavlen ------------------------------------------------------------------------- */
    function el(tag, klasse, html) {
        var e = document.createElement(tag);
        if (klasse) e.className = klasse;
        if (html !== undefined) e.innerHTML = html;
        return e;
    }

    function trinbar(st) {
        var nu = st.fase === "formel" ? 0 : (st.fase === "tal" ? 1 : 2);
        var html = '<ol class="trinbar" aria-label="Regnestykkets tre trin">';
        D.TRINBAR.forEach(function (navn, j) {
            var klasse = "tb-trin", nr = String(j + 1);
            if (j < nu) { klasse += " ok"; nr = "✓"; }
            else if (j === nu) klasse += " nu";
            if (j > 0) html += '<li class="tb-pil" aria-hidden="true">›</li>';
            html += '<li class="' + klasse + '"><span class="tb-nr">' + nr + '</span><span class="tb-navn">' + NK.html(navn) + "</span></li>";
        });
        return html + "</ol>";
    }

    /* Felterne i en skabelon. lav(j) giver felt j. */
    function struktur(sk, lav) {
        function tegn() { return el("span", "bf-gange", "·"); }
        var krop = el("div", "bf-krop");
        if (sk === "**" || sk === "***") {
            krop.appendChild(lav(0));
            krop.appendChild(tegn());
            krop.appendChild(lav(1));
            if (sk === "***") { krop.appendChild(tegn()); krop.appendChild(lav(2)); }
            return krop;
        }
        var b = el("div", "bf-broek");
        var top = el("div", "bf-top");
        top.appendChild(lav(0));
        b.appendChild(top);
        b.appendChild(el("div", "bf-streg"));
        var bund = el("div", "bf-top");
        bund.appendChild(lav(1));
        if (sk === "/**") { bund.appendChild(tegn()); bund.appendChild(lav(2)); }
        b.appendChild(bund);
        krop.appendChild(b);
        return krop;
    }

    P.render = function () {
        var mig = this, o = this.opg(), n = this.ts.length;
        this.trinEl.innerHTML = "";
        this.felter = [];
        this.ts.forEach(function (st, i) {
            var t = D.TRIN[st.id];
            var blok = el("div", "rb " + st.status);
            if (n > 1) blok.appendChild(el("div", "rb-hoved", "Del " + (i + 1) + " af " + n + ": " + NK.html(t.navn)));
            if (st.status === "laast") {
                blok.appendChild(el("div", "rb-linje", R.vis(t.maal) + " = ?"));
                mig.trinEl.appendChild(blok);
                return;
            }
            if (st.status === "ok" || st.status === "svar") {
                blok.appendChild(el("div", "rb-linje", R.linjeHTML(o, i, st.bogstL, st.talTekst) +
                    ' <span class="rs-maerke' + (st.status === "svar" ? " svar" : "") + '">' + (st.status === "svar" ? "↩" : "✓") + "</span>"));
                mig.trinEl.appendChild(blok);
                return;
            }
            blok.insertAdjacentHTML("beforeend", trinbar(st));
            var g = el("div", "regnestykke");
            function linje(venstre, hoejre) {
                g.appendChild(el("span", "rs-v", venstre));
                g.appendChild(el("span", "rs-lig", "="));
                var h = el("div", "rs-h");
                if (typeof hoejre === "string") h.innerHTML = hoejre; else h.appendChild(hoejre);
                g.appendChild(h);
                return h;
            }
            /* 1. Formlen */
            if (st.fase === "formel") linje(R.vis(t.maal), mig.formelFelter(st));
            else linje(R.vis(t.maal), '<span class="rs-vist">' + R.formelHTML(st.id, st.bogstL) + '</span><span class="rs-maerke' + (st.vistFormel ? " svar" : "") + '">' + (st.vistFormel ? "↩" : "✓") + "</span>");
            /* 2. Tallene */
            if (st.fase === "tal") linje("", mig.talFelter(st));
            else if (st.fase === "res") linje("", '<span class="rs-vist">' + R.talHTML(o, i, st.bogstL, st.talTekst) + '</span><span class="rs-maerke' + (st.vistTal ? " svar" : "") + '">' + (st.vistTal ? "↩" : "✓") + "</span>");
            /* 3. Resultatet */
            if (st.fase === "res") linje("", mig.resFelt(st));
            blok.appendChild(g);
            mig.trinEl.appendChild(blok);
        });

        /* Bakken under tavlen: formens skabeloner og bogstaverne, tallene eller intet */
        var st = this.aktivt();
        var fase = st && !this.faerdig ? st.fase : "";
        NK.el("regn-bk-form").hidden = fase !== "formel";
        NK.el("regn-bk-bogst").hidden = fase !== "formel";
        NK.el("regn-bk-tal").hidden = fase !== "tal";
        NK.el("regn-bk-lommeregner").hidden = fase !== "res";
        NK.el("regn-bakke").hidden = !fase;
        if (fase === "tal") this.bygTalKnapper();
        var sks = NK.el("regn-skabeloner").querySelectorAll(".skabelon");
        Array.prototype.forEach.call(sks, function (b) { b.classList.toggle("valgt", !!st && b.getAttribute("data-sk") === st.sk); });

        var stempel = NK.el("regn-stempel");
        stempel.hidden = !this.faerdig;
        stempel.textContent = this.brugtSvarNogen ? "Vist" : "Løst ✓";
        stempel.className = "tv-stempel" + (this.brugtSvarNogen ? " gul" : "");
        this.tavle.classList.toggle("faerdig", this.faerdig && !this.brugtSvarNogen);
        this.tavle.classList.toggle("vist", this.faerdig && !!this.brugtSvarNogen);
        this.visHintLys();
        this.tilpas();
    };

    P.tjekKnap = function () {
        var mig = this;
        var k = el("button", "tjekknap", "Tjek");
        k.type = "button";
        k.title = "Tjek (Enter)";
        k.addEventListener("click", function () { mig.tjek(); });
        return k;
    };

    P.nytInput = function (klasse, vaerdi, etiket, onInput, i) {
        var mig = this;
        var inp = document.createElement("input");
        inp.type = "text";
        inp.className = klasse;
        inp.autocomplete = "off";
        inp.spellcheck = false;
        inp.value = vaerdi || "";
        inp.setAttribute("aria-label", etiket);
        inp.addEventListener("focus", function () { mig.fokusInput = inp; });
        inp.addEventListener("input", function () { onInput(inp.value); inp.classList.remove("fejl"); });
        inp.addEventListener("keydown", function (e) {
            if (e.key !== "Enter") return;
            e.preventDefault();
            /* Enter i et felt: videre til det naeste tomme, ellers tjek */
            var tomt = mig.felter.filter(function (f) { return f !== inp && !f.value.trim(); })[0];
            if (tomt && inp.value.trim() && klasse.indexOf("rs-in") < 0) { tomt.focus(); return; }
            mig.tjek();
        });
        if (i !== undefined) inp.setAttribute("data-i", i);
        this.felter.push(inp);
        return inp;
    };

    P.formelFelter = function (st) {
        var mig = this, omr = el("div", "rs-felter");
        if (!st.sk) {
            omr.appendChild(el("span", "rs-vaelg", "Vælg formens form under tavlen"));
            return omr;
        }
        omr.appendChild(struktur(st.sk, function (j) {
            var d = el("div", "bf-del");
            d.appendChild(mig.nytInput("bf-in bogstav", st.bogst[j], "Bogstav " + (j + 1), function (v) { st.bogst[j] = v; }, j));
            return d;
        }));
        omr.appendChild(this.tjekKnap());
        return omr;
    };

    P.talFelter = function (st) {
        var mig = this, omr = el("div", "rs-felter");
        omr.appendChild(struktur(st.sk, function (j) {
            var d = el("div", "bf-del");
            if (st.talOk[j]) {
                d.className = "bf-del ok";
                d.innerHTML = '<span class="bf-tekst">' + NK.html(st.talTekst[j]) + "</span>";
                return d;
            }
            var b = st.bogstL[j];
            var inp = mig.nytInput("bf-in tal", st.tal[j], "Tallet for " + R.vis(b), function (v) { st.tal[j] = v; }, j);
            inp.placeholder = R.vis(b);
            d.appendChild(inp);
            return d;
        }));
        omr.appendChild(this.tjekKnap());
        return omr;
    };

    P.resFelt = function (st) {
        var omr = el("div", "rs-felter");
        var b = D.TRIN[st.id].maal;
        var inp = this.nytInput("rs-in", st.res, "Resultatet", function (v) { st.res = v; });
        inp.placeholder = b === "A" ? "uden enhed" : (b === "eps" ? "tallet" : "tal og enhed");
        omr.appendChild(inp);
        if (b === "eps") omr.appendChild(el("span", "rs-enhed", "mM⁻¹·cm⁻¹"));
        omr.appendChild(this.tjekKnap());
        return omr;
    };

    /* ----- Bakken: skabelon, bogstav eller tal ind i et felt ------------------------------- */
    P.vaelgSkabelon = function (sk) {
        var st = this.aktivt();
        if (!st || st.fase !== "formel" || this.faerdig) return;
        st.sk = sk;
        this.render();
        this.naesteLinje("", "");
        this.fokusFelt();
    };

    P.indsaet = function (tekst, fase) {
        var st = this.aktivt();
        if (!st || this.faerdig) return;
        if (st.fase !== fase) return;
        if (fase === "formel" && !st.sk) {
            this.kortBesked("Vælg først formens form. Så kommer der felter til bogstaverne.", 4);
            return;
        }
        var inp = this.fokusInput && this.felter.indexOf(this.fokusInput) >= 0 && !this.fokusInput.value.trim() ? this.fokusInput : null;
        if (!inp) inp = this.felter.filter(function (f) { return !f.value.trim() && f.classList.contains(fase === "formel" ? "bogstav" : "tal"); })[0];
        if (!inp) inp = this.fokusInput && this.felter.indexOf(this.fokusInput) >= 0 ? this.fokusInput : null;
        if (!inp) return;
        inp.value = tekst;
        inp.dispatchEvent(new Event("input"));
        var tomt = this.felter.filter(function (f) { return !f.value.trim() && f.classList.contains(fase === "formel" ? "bogstav" : "tal"); })[0];
        (tomt || inp).focus();
    };

    /* ----- Tjek --------------------------------------------------------------------------- */
    P.tjek = function () {
        var st = this.aktivt();
        if (!st || this.faerdig) return;
        var o = this.opg();
        if (st.fase === "formel") {
            if (!st.sk) { this.besked("Vælg først formens form under tavlen. Så kommer der felter til bogstaverne.", "gul"); return; }
            var bogst = st.bogst.slice(0, R.ANTAL[st.sk]).map(function (b) { return R.bogstav(b, o); });
            var svar = R.tjekFormel(st.id, st.sk, bogst);
            if (svar.ok) {
                st.bogstL = bogst;
                st.fase = "tal";
                this.videre("Rigtig formel: " + R.vis(D.TRIN[st.id].maal) + " = " + R.formelHTML(st.id, bogst) + ".");
                return;
            }
            this.fejlFelt(svar, svar.felt);
            return;
        }
        if (st.fase === "tal") {
            var n = R.ANTAL[st.sk], forste = null, nogen = false;
            for (var j = 0; j < n; j++) {
                if (st.talOk[j]) continue;
                var s = R.tjekTal(o, st.bogstL[j], st.tal[j]);
                if (s.ok) { st.talOk[j] = true; st.talTekst[j] = s.tekst; nogen = true; }
                else if (!forste) forste = { svar: s, j: j };
            }
            if (!forste) {
                st.fase = "res";
                this.videre("Rigtigt. Tallene står på deres plads.");
                return;
            }
            if (nogen) this.render();
            this.fejlFelt(forste.svar, forste.j);
            return;
        }
        var r = R.tjekRes(o, this.k, st.res);
        if (r.ok) { this.trinLoest("ok"); return; }
        this.fejlFelt(r, 0);
    };

    P.fejlFelt = function (svar, j) {
        if (svar.tom) this.besked(svar.besked, "gul");
        else this.fejlLinje(svar.besked);
        var inp = j !== undefined ? this.felter.filter(function (f) { return f.getAttribute("data-i") === String(j); })[0] : null;
        if (!inp) inp = this.felter[0];
        if (inp && !svar.tom) {
            inp.classList.remove("fejl");
            void inp.offsetWidth;
            inp.classList.add("fejl");
        }
        if (inp) inp.focus();
    };

    /* Et skridt i trinnet er rigtigt: tegn tavlen igen, og sig det naeste */
    P.videre = function (html) {
        this.hjaelp = 0;
        this.hintLys = null;
        this.render();
        this.naesteLinje('<span class="b-maerke">✓</span> ' + html, "god");
        this.visKnap();
        this.fokusFelt();
    };

    P.trinLoest = function (maade) {
        var st = this.aktivt(), o = this.opg();
        st.status = maade;
        if (maade === "svar") this.brugtSvarNogen = true;
        st.res = R.facitTekst(o, this.k);
        this.k++;
        if (this.k < this.ts.length) {
            this.ts[this.k].status = "aktiv";
            this.hjaelp = 0;
            this.render();
            this.naesteLinje('<span class="b-maerke">✓</span> ' + R.vis(D.TRIN[st.id].maal) + " = " + NK.html(R.facitTekst(o, this.k - 1)) + ".", "god");
            this.visKnap();
            this.fokusFelt();
            return;
        }
        var sidst = this.ts.length - 1;
        var tekst = R.vis(D.TRIN[o.trin[sidst]].maal) + " = " + NK.html(R.facitTekst(o, sidst)) + ".";
        this.render();
        this.loest(this.brugtSvarNogen ? "svar" : "ok", tekst, this.brugtSvarNogen ? "Svaret" : "Løst ✓");
        this.render();
    };

    /* ----- Panelet og linjen ------------------------------------------------------------------ */
    P.promptHTML = function () {
        var o = this.opg();
        var html = '<p class="note-tekst">' + NK.html(o.tekst) + "</p>";
        if (this.faerdig) {
            html += '<div class="forklaring">';
            this.ts.forEach(function (st, i) { html += '<p class="fk-linje">' + R.linjeHTML(o, i, st.bogstL, st.talTekst) + "</p>"; });
            html += "</div>";
        }
        return html;
    };

    P.trinLinje = function () {
        var st = this.aktivt();
        if (!st) return "";
        var t = D.TRIN[st.id], n = this.ts.length, b = t.maal;
        var foer = n > 1 ? "Del " + (this.k + 1) + " af " + n + ": " + NK.html(t.navn.toLowerCase()) + ". " : "";
        var hvad;
        if (st.fase === "formel") {
            hvad = st.sk ? "Skriv bogstaverne i formlen for " + R.vis(b) + ". Klik i et felt og så på et bogstav under tavlen, eller skriv det." :
                "Find formlen for " + R.vis(b) + ". Vælg først formens form under tavlen. Tallene kommer i næste trin.";
        } else if (st.fase === "tal") {
            hvad = "Sæt tallene ind i stedet for bogstaverne. Klik på et tal under tavlen, eller skriv det.";
        } else {
            hvad = b === "A" ? "Regn resultatet ud på lommeregneren. A har ingen enhed." :
                (b === "eps" ? "Regn resultatet ud på lommeregneren, og skriv tallet. Enheden står efter feltet." :
                    "Regn resultatet ud på lommeregneren, og skriv det med enhed.");
        }
        return foer + hvad;
    };

    /* ----- Hint og svar ------------------------------------------------------------------- */
    P.hintTrin = function () {
        var st = this.aktivt();
        if (!st || this.faerdig) return null;
        var o = this.opg();
        if (st.fase === "formel") return { trin: R.formelHint(st.id), lys: "form" };
        if (st.fase === "tal") return { trin: R.talHint(o, this.k, st.bogstL, st.talOk), lys: "tal" };
        return { trin: R.resHint(o, this.k), lys: null };
    };

    P.visHintLys = function () {
        var lys = this.faerdig ? null : this.hintLys;
        NK.el("regn-bk-form").classList.toggle("lys", lys === "form");
        NK.el("regn-bk-tal").classList.toggle("lys", lys === "tal");
    };

    P.visSvar = function () {
        var st = this.aktivt();
        if (!st) return;
        var o = this.opg(), t = D.TRIN[st.id];
        if (st.fase === "formel") {
            st.sk = t.form;
            st.bogstL = R.facitBogstaver(st.id);
            st.bogst = st.bogstL.map(R.vis);
            st.fase = "tal";
            st.vistFormel = true;
            this.brugtSvarNogen = true;
            this.hjaelp = 0;
            this.render();
            this.naesteLinje('<span class="b-maerke">Formlen</span> ' + R.vis(t.maal) + " = " + R.formelHTML(st.id) + ".", "gul");
            this.fokusFelt();
            return;
        }
        if (st.fase === "tal") {
            var V = R.vaerdier(o);
            st.bogstL.forEach(function (b, j) {
                st.talOk[j] = true;
                st.talTekst[j] = R.talMedEnhed(b, V.tal[b].tekst);
            });
            st.fase = "res";
            st.vistTal = true;
            this.brugtSvarNogen = true;
            this.hjaelp = 0;
            this.render();
            this.naesteLinje('<span class="b-maerke">Tallene</span> ' + R.vis(t.maal) + " = " + R.talHTML(o, this.k, st.bogstL, st.talTekst) + ".", "gul");
            this.fokusFelt();
            return;
        }
        this.trinLoest("svar");
    };

    /* Ved en ny opgave er intet svar vist endnu */
    P.faneVaelg = P.vaelg;
    P.vaelg = function (i) {
        this.brugtSvarNogen = false;
        this.faneVaelg(i);
    };

    P.enter = function () {
        if (this.faerdig) { this.knap(); return; }
        this.tjek();
    };

    P.nulstil = function () { this.vaelg(this.nr); };

    P.fokusFelt = function () {
        if (!NK.el("fane-regn").classList.contains("aktiv")) return;
        var tomt = (this.felter || []).filter(function (f) { return !f.value.trim(); })[0] || (this.felter || [])[0];
        if (tomt) { try { tomt.focus({ preventScroll: true }); } catch (e) { tomt.focus(); } }
    };

    /* Tavlen skal kunne vaere der: skriften goeres mindre, til den passer */
    P.tilpas = function () {
        var arb = NK.el("regn-arbejde");
        if (!arb || !arb.offsetHeight) return;
        arb.style.removeProperty("--fs");
        var fs = parseFloat(window.getComputedStyle(arb).fontSize) || 30;
        var gange = 0;
        while (gange++ < 40 && fs > 15 && (arb.scrollHeight > arb.clientHeight + 1 || this.tavle.scrollWidth > this.tavle.clientWidth + 1)) {
            fs -= 1;
            arb.style.setProperty("--fs", fs + "px");
        }
    };

    P.opdater = function (dt) { this.opdaterBesked(dt); };

    NK.SimRegn = SimRegn;
}());
