/* =====================================================================
   forloeb.js - forloebet og opstarten

   Tre billeder (body[data-fase]):
     start   de fire faser paa en tidslinje. Eleven vaelger en fase.
     felt    én opgave ad gangen. Hver loest opgave laegger en linje i
             feltet til hoejre. Naar feltets opgaver er loest, kommer
             det naeste af fasens fire felter.
     skema   de faser, der er udfyldt, som kolonner i skemaet.

   Det hele skema ses foerst, naar alle fire faser er udfyldt (eller med
   index.html#facit, som er til tavlen).

   Det, eleven har udfyldt, gemmes i browseren (localStorage), saa
   skemaet kan laves over flere timer.

   Teksterne staar i js/data.js, og ordene bedoemmes i js/svar.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = D.TEKST;
    var NOEGLE = "nk.velfaerd_fire_faser.v1";
    var BOGSTAVER = ["A", "B", "C", "D", "E"];

    function el(id) { return NK.el(id); }

    /* Fasens opgaver i raekkefoelge. r: feltets nummer, i: opgavens nummer i
       feltet, n: antal opgaver i feltet, o: opgaven selv. */
    var FLAD = D.FASER.map(function (fase) {
        var liste = [];
        fase.felter.forEach(function (felt, r) {
            felt.forEach(function (o, i) { liste.push({ r: r, i: i, n: felt.length, o: o }); });
        });
        return liste;
    });

    /* frem: loeste opgaver pr. fase. foerste: rigtigt i foerste forsoeg, ét
       sandt eller falsk pr. loest opgave. plet: nummeret paa den opgave i
       fasen, der har faaet et forkert svar (ellers -1); det gemmes, saa et
       forkert svar ikke forsvinder, hvis eleven gaar ud og ind.
       proevet: de forkerte svar, der er valgt i opgaven. hint: antal hint.
       orden: svarenes raekkefoelge. viser: de faser, skemaet viser. efter:
       fasen, der lige er udfyldt, naar skemaet vises som afslutning. */
    var S = {
        fase: "start",
        f: 0,
        nr: 0,
        frem: [0, 0, 0, 0],
        foerste: [[], [], [], []],
        plet: [-1, -1, -1, -1],
        loest: false,
        proevet: [],
        hint: 0,
        orden: [],
        viser: [],
        efter: -1,
        facit: false
    };

    function antal(f) { return FLAD[f].length; }
    function faerdig(f) { return S.frem[f] >= antal(f); }
    function opg() { return FLAD[S.f][S.nr]; }

    function alleFaerdige() {
        for (var f = 0; f < FLAD.length; f++) if (!faerdig(f)) return false;
        return true;
    }

    function naesteFase() {
        for (var f = 0; f < FLAD.length; f++) if (!faerdig(f)) return f;
        return -1;
    }

    /* Antal felter i fasen, hvor alle opgaver er loest. */
    function felterLoest(f) {
        var loeste = 0;
        for (var k = 0; k < FLAD[f].length; k++) {
            var p = FLAD[f][k];
            if (p.i === p.n - 1 && k < S.frem[f]) loeste++;
        }
        return loeste;
    }

    function rigtige(f) {
        var k = 0;
        for (var i = 0; i < antal(f); i++) if (S.foerste[f][i]) k++;
        return k;
    }

    function bland(n) {
        var a = [], i, j, t;
        for (i = 0; i < n; i++) a.push(i);
        for (i = n - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    function udfyld(tekst, v) {
        return tekst.replace(/\{(\w+)\}/g, function (hel, navn) {
            return v[navn] === undefined ? hel : String(v[navn]);
        });
    }

    /* ----- Gem og hent ---------------------------------------------------- */
    function gem() {
        try {
            window.localStorage.setItem(NOEGLE, JSON.stringify({ frem: S.frem, foerste: S.foerste, plet: S.plet }));
        } catch (e) { /* uden lager virker alt, men intet huskes */ }
    }

    function hent() {
        var gemt = null;
        try { gemt = JSON.parse(window.localStorage.getItem(NOEGLE)); } catch (e) { gemt = null; }
        if (!gemt || !gemt.frem) return;
        for (var f = 0; f < FLAD.length; f++) {
            var n = parseInt(gemt.frem[f], 10);
            if (!(n >= 0)) n = 0;
            S.frem[f] = Math.min(n, antal(f));
            var liste = gemt.foerste && gemt.foerste[f] ? gemt.foerste[f] : [];
            S.foerste[f] = [];
            for (var i = 0; i < S.frem[f]; i++) S.foerste[f].push(liste[i] === true);
            S.plet[f] = gemt.plet && gemt.plet[f] === S.frem[f] && !faerdig(f) ? S.frem[f] : -1;
        }
    }

    function nulstil() {
        S.frem = [0, 0, 0, 0];
        S.foerste = [[], [], [], []];
        S.plet = [-1, -1, -1, -1];
        gem();
    }

    /* ----- Statuslinjen og knappen ---------------------------------------- */
    function status(farve, maerke, tekst, ryst) {
        var linje = el("statuslinje");
        linje.className = "statuslinje" + (farve ? " " + farve : "");
        NK.saetHTML("besked", (maerke ? '<span class="b-maerke">' + NK.html(maerke) + "</span>" : "") + NK.html(tekst));
        if (ryst) NK.genstart(linje, "ryster");
    }

    function knap(tekst) {
        var k = el("knap");
        k.hidden = !tekst;
        if (tekst) k.textContent = tekst;
    }

    function linjeHTML(o) { return (o.fed ? "<b>" + NK.html(o.fed) + "</b> " : "") + NK.html(o.linje); }
    function linjeTekst(o) { return (o.fed ? o.fed + " " : "") + o.linje; }

    /* ======================================================================
       START: de fire faser
       ====================================================================== */
    function visStart() {
        S.fase = "start";
        S.efter = -1;
        S.facit = false;
        document.body.setAttribute("data-fase", "start");
        el("faserknap").hidden = true;

        var anbefalet = naesteFase(), html = "", begyndt = false, faerdige = 0;
        D.FASER.forEach(function (fase, f) {
            var klasse = "fasekort", gaa = T.begynd, prikker = "", loeste = felterLoest(f);
            if (faerdig(f)) { klasse += " faerdig"; gaa = T.faerdig; faerdige++; }
            else if (S.frem[f] > 0) { klasse += " igang"; gaa = T.fortsaet; }
            if (S.frem[f] > 0) begyndt = true;
            if (f === anbefalet) klasse += " anbefalet";
            for (var r = 0; r < D.RAEKKER.length; r++) prikker += "<i" + (r < loeste ? ' class="on"' : "") + "></i>";
            html += '<li><button class="' + klasse + '" type="button" data-fase="' + f + '">' +
                '<span class="fk-nr">' + NK.html(udfyld(T.faseNr, { n: f + 1 })) + "</span>" +
                '<span class="fk-aar">' + NK.html(fase.aar) + "</span>" +
                '<span class="fk-navn">' + NK.html(fase.navn) + "</span>" +
                '<span class="fk-bund"><span class="fk-felter" aria-hidden="true">' + prikker + "</span>" +
                '<span class="fk-status">' + NK.html(udfyld(T.felter, { k: loeste })) + "</span></span>" +
                '<span class="fk-gaa">' + NK.html(gaa) + "</span></button></li>";
        });
        el("faser").innerHTML = html;

        NK.saetTekst("intro1", T.intro1);
        NK.saetTekst("intro2", T.intro2);
        NK.saetTekst("start-besked", anbefalet === -1 ? T.startAlle : (begyndt ? T.startGemt : T.startNy));
        var skemaknap = el("skemaknap");
        skemaknap.hidden = faerdige === 0;
        skemaknap.textContent = T.seSkema;
        skemaknap.classList.toggle("videre", anbefalet === -1);
    }

    function gaaTil(f) {
        if (!(f >= 0 && f < FLAD.length)) return;
        if (faerdig(f)) { visSkema([f], -1, false); return; }
        S.f = f;
        S.nr = S.frem[f];
        nyOpgave();
        visFelt();
    }

    function faerdigeFaser() {
        var liste = [];
        for (var f = 0; f < FLAD.length; f++) if (faerdig(f)) liste.push(f);
        return liste;
    }

    /* ======================================================================
       FELTET: én opgave ad gangen
       ====================================================================== */
    function nyOpgave() {
        var o = opg().o;
        S.loest = false;
        S.proevet = [];
        S.hint = 0;
        S.orden = o.type === "vaelg" ? bland(o.svar.length) : [0, 1, 2];
    }

    /* Svarmulighederne i den raekkefoelge, de staar i data. De tre
       grundforklaringer har altid samme raekkefoelge og deres bogstav. */
    function mulige(o) {
        if (o.type === "vaelg") return o.svar;
        return D.FORKLARINGER.map(function (g) {
            return { t: g.navn, bog: g.bog, rigtig: g.id === o.rigtig, fordi: o.fordi, fejl: o.fejl[g.id] };
        });
    }

    function tegnSted() {
        var fase = D.FASER[S.f], p = opg(), loeste = felterLoest(S.f), html = "";
        NK.saetTekst("sted-fase", fase.kort);
        NK.saetTekst("sted-navn", fase.navn);
        D.RAEKKER.forEach(function (rk, r) {
            html += '<li class="rk' + (r < loeste ? " loest" : (r === p.r ? " nu" : "")) + '">' + NK.html(rk.kort) + "</li>";
        });
        NK.saetHTML("raekker", html);
    }

    /* Feltet: alle linjer har deres plads fra start, saa intet flytter sig,
       naar en linje kommer frem. Den nyeste er markeret, til eleven gaar videre. */
    function tegnArk() {
        var p = opg(), felt = D.FASER[S.f].felter[p.r], html = "";
        NK.saetTekst("ark-etiket", D.RAEKKER[p.r].navn);
        NK.saetTekst("ark-fase", D.FASER[S.f].kort);
        felt.forEach(function (o, i) {
            var loest = i < p.i || (i === p.i && S.loest);
            var klasse = "linje" + (loest ? " loest" : "") + (i === p.i ? (S.loest ? " ny" : " nu") : "");
            html += '<li class="' + klasse + '"><span class="l-tekst">' + linjeHTML(o) + "</span></li>";
        });
        NK.saetHTML("linjer", html);
    }

    function tegnValg() {
        var o = opg().o, liste = mulige(o), html = "";
        for (var p = 0; p < S.orden.length; p++) {
            var i = S.orden[p], s = liste[i], klasse = "knap svar", laast = S.loest;
            if (S.loest && s.rigtig) klasse += " rigtig";
            if (S.proevet.indexOf(i) !== -1) { klasse += " forkert"; laast = true; }
            html += '<button class="' + klasse + '" type="button" data-svar="' + i + '"' + (laast ? " disabled" : "") + ">" +
                '<span class="bog">' + (s.bog || BOGSTAVER[p]) + "</span><span>" + NK.html(s.t) + "</span></button>";
        }
        el("valg").innerHTML = html;
    }

    function tegnOpgave() {
        var p = opg(), o = p.o;
        NK.saetTekst("opg-nr", udfyld(T.opgaveNr, { k: p.i + 1, n: p.n }));
        el("opgave").setAttribute("data-type", o.type);

        var udsagn = el("udsagn");
        udsagn.hidden = !o.udsagn;
        udsagn.textContent = o.udsagn || "";

        if (o.type === "skriv") {
            /* Hullet har ordets bredde fra start (ordet staar der usynligt), saa
               saetningen ikke ombrydes paa ny, naar ordet kommer frem. Tegnet
               efter hullet holdes paa samme linje som hullet. */
            var dele = o.spm.split("{hul}"), efter = dele[1] || "", tegn = /^[.,:;!?]+/.exec(efter);
            el("spm").innerHTML = NK.html(dele[0]) + '<span class="hul-hold"><span class="hul" id="hul"><span class="hul-ord">' +
                NK.html(o.svar) + "</span></span>" + (tegn ? NK.html(tegn[0]) : "") + "</span>" + NK.html(tegn ? efter.slice(tegn[0].length) : efter);
            el("ord").value = "";
            el("ord").disabled = false;
            el("tjek").textContent = T.tjek;
            el("hint").textContent = T.hint;
            el("hint").classList.remove("lyser");
            el("skriv").classList.remove("faerdig");
        } else {
            el("spm").textContent = o.spm || T.spmForklar;
            tegnValg();
        }
        el("skriv").hidden = o.type !== "skriv";
        el("valg").hidden = o.type === "skriv";
    }

    function visFelt() {
        S.fase = "felt";
        document.body.setAttribute("data-fase", "felt");
        el("faserknap").hidden = false;
        tegnSted();
        tegnOpgave();
        tegnArk();
        var o = opg().o;
        status("", "", o.type === "skriv" ? T.skrivStart : (o.type === "forklar" ? T.forklarStart : T.vaelgStart));
        knap("");
        if (o.type === "skriv") el("ord").focus();
    }

    /* Et forkert svar eller Vis svaret: opgaven taeller ikke som rigtig i foerste forsoeg. */
    function plet() {
        if (S.plet[S.f] === S.nr) return;
        S.plet[S.f] = S.nr;
        gem();
    }

    function loes(farve, maerke, tekst) {
        var p = opg();
        S.loest = true;
        S.foerste[S.f][S.nr] = S.plet[S.f] !== S.nr;
        S.frem[S.f] = S.nr + 1;
        S.plet[S.f] = -1;
        gem();
        tegnSted();
        tegnArk();
        status(farve, maerke, tekst);
        knap(S.nr === antal(S.f) - 1 ? T.faseSlut : (p.i === p.n - 1 ? T.naesteFelt : T.naeste));
        window.setTimeout(function () { if (S.loest && S.fase === "felt") el("knap").focus(); }, 0);
    }

    /* ----- Eleven vaelger et svar ------------------------------------------ */
    function vaelg(i) {
        if (S.fase !== "felt" || S.loest) return;
        var o = opg().o;
        if (o.type === "skriv") return;
        var s = mulige(o)[i];
        if (!s || S.proevet.indexOf(i) !== -1) return;

        if (!s.rigtig) {
            S.proevet.push(i);
            plet();
            tegnValg();
            status("roed", "Ikke endnu", s.fejl, true);
            return;
        }
        S.loest = true;
        tegnValg();
        loes("groen", "Rigtigt", s.fordi);
    }

    function vaelgPlads(plads) {
        if (plads >= 0 && plads < S.orden.length) vaelg(S.orden[plads]);
    }

    /* ----- Eleven skriver et ord --------------------------------------------- */
    function skrivLoest(vist, praecis) {
        var o = opg().o;
        el("hul").classList.add(vist ? "vist" : "fyldt");
        if (vist) el("ord").value = o.svar;
        el("ord").disabled = true;
        el("hint").classList.remove("lyser");
        el("skriv").classList.add("faerdig");
        if (vist) loes("gul", "Svaret", o.fordi);
        else loes("groen", "Rigtigt", (praecis ? "" : udfyld(T.staves, { svar: o.svar }) + " ") + o.fordi);
    }

    function tjek() {
        if (S.fase !== "felt" || S.loest) return;
        var o = opg().o;
        if (o.type !== "skriv") return;
        var b = NK.Svar.bedoem(o, el("ord").value);
        if (b.tom) { status("", "", T.tom); el("ord").focus(); return; }
        if (b.rigtig) { skrivLoest(false, b.praecis); return; }
        plet();
        status("roed", "Ikke endnu", b.naesten || T.forkert, true);
        NK.genstart(el("hint"), "lyser");
        el("ord").focus();
        el("ord").select();
    }

    /* Knappen ved feltet er en trappe: et hint, et hint mere, svaret. */
    function givHint() {
        if (S.fase !== "felt" || S.loest) return;
        var o = opg().o;
        if (o.type !== "skriv") return;
        S.hint++;
        el("hint").classList.remove("lyser");
        if (S.hint === 1) {
            status("gul", "Hint", o.hint);
            el("hint").textContent = T.hintMere;
        } else if (S.hint === 2) {
            status("gul", "Hint", udfyld(T.bogstaver, { b: o.svar.charAt(0).toUpperCase(), n: o.svar.length }));
            el("hint").textContent = T.vis;
        } else {
            plet();
            skrivLoest(true, true);
            return;
        }
        el("ord").focus();
    }

    function videre() {
        if (S.fase !== "felt" || !S.loest) return;
        if (S.nr >= antal(S.f) - 1) { visSkema([S.f], S.f, true); return; }
        S.nr++;
        nyOpgave();
        visFelt();
    }

    /* ======================================================================
       SKEMAET
       ====================================================================== */

    /* Lange sammensatte ord faar et bloedt delested efter foerste led, saa de
       deles paent med bindestreg i skemaets smalle kolonner. Kun paa skaermen:
       teksten, der kopieres, er uden. */
    var LED = /(alderdoms|arbejdsløsheds|arbejds|ulykkes|folke|forsikrings|skatte|informations|service|industri|regerings|social|kanslergade|fireparti|indkomst|velfærds|samfunds|konflikt|funktiona|jordskreds|fremskridts|børne|infra|høj|lav|krise|ned|utilfreds)(?=[a-zæøå]{4})/gi;

    function bloed(html) { return html.replace(LED, "$1­"); }

    function tegnSkema() {
        var html = '<thead><tr><th class="hjoerne"></th>';
        S.viser.forEach(function (f) {
            var fase = D.FASER[f];
            html += '<th scope="col"><span class="s-nr">' + NK.html(udfyld(T.faseNr, { n: f + 1 })) + "</span>" +
                '<span class="s-aar">' + NK.html(fase.aar) + '</span><span class="s-navn">' + bloed(NK.html(fase.navn)) + "</span></th>";
        });
        html += "</tr></thead><tbody>";
        D.RAEKKER.forEach(function (rk, r) {
            html += '<tr><th scope="row">' + NK.html(rk.navn) + "</th>";
            S.viser.forEach(function (f) {
                html += "<td><ul>";
                D.FASER[f].felter[r].forEach(function (o) { html += "<li>" + bloed(linjeHTML(o)) + "</li>"; });
                html += "</ul></td>";
            });
            html += "</tr>";
        });
        var tabel = el("skema-tabel");
        tabel.className = "skema-tabel kol-" + S.viser.length;
        tabel.innerHTML = html + "</tbody>";
        NK.saetTekst("skema-titel", D.TITEL);
        el("skema-rul").className = "skema-rul kol-" + S.viser.length;
        el("skema-rul").scrollTop = 0;
    }

    function tegnSkemaLinje() {
        var alle = alleFaerdige(), en = S.viser.length === 1 ? S.viser[0] : -1, tekst, k = 0, a = 0;
        function tal(f) { return { n: f + 1, k: rigtige(f), a: antal(f) }; }

        if (S.facit) tekst = T.facit;
        else if (S.efter >= 0) tekst = udfyld(T.efterFase, tal(S.efter));
        else if (en >= 0) tekst = udfyld(T.enFase, tal(en));
        else if (alle && S.viser.length === FLAD.length) {
            for (var f = 0; f < FLAD.length; f++) { k += rigtige(f); a += antal(f); }
            tekst = udfyld(T.hele, { k: k, a: a });
        } else tekst = udfyld(T.delvis, { k: S.viser.length });
        NK.saetTekst("skema-besked", tekst);

        var videreKnap = el("skema-videre");
        videreKnap.hidden = S.efter < 0;
        videreKnap.textContent = alle ? T.seHele : T.naesteFase;
        el("skema-kopier").textContent = T.kopier;

        var igen = el("skema-igen");
        igen.hidden = !(en >= 0 && S.efter < 0 && !S.facit);
        igen.textContent = T.igen;
        igen.classList.remove("sikker");

        var forfra = el("skema-forfra");
        forfra.hidden = !(alle && S.viser.length === FLAD.length && !S.facit);
        forfra.textContent = T.forfra;
        forfra.classList.remove("sikker");
    }

    function visSkema(faser, efter, fejr) {
        S.fase = "skema";
        S.viser = faser.slice();
        S.efter = efter >= 0 ? efter : -1;
        document.body.setAttribute("data-fase", "skema");
        el("faserknap").hidden = false;
        tegnSkema();
        tegnSkemaLinje();
        if (fejr) fejring();
        if (S.efter >= 0) window.setTimeout(function () { if (S.fase === "skema" && S.efter >= 0) el("skema-videre").focus(); }, 0);
    }

    function skemaVidere() {
        if (S.fase !== "skema" || S.efter < 0) return;
        if (alleFaerdige()) visSkema([0, 1, 2, 3], -1, true);
        else gaaTil(naesteFase());
    }

    /* Knapper, der sletter noget, skal trykkes to gange. */
    function toTryk(k, handling) {
        if (k.classList.contains("sikker")) { k.classList.remove("sikker"); handling(); return; }
        var foer = k.textContent;
        k.classList.add("sikker");
        k.textContent = T.sikker;
        window.setTimeout(function () {
            if (k.classList.contains("sikker")) { k.classList.remove("sikker"); k.textContent = foer; }
        }, 4000);
    }

    function lavIgen() {
        var f = S.viser[0];
        S.frem[f] = 0;
        S.foerste[f] = [];
        S.plet[f] = -1;
        gem();
        gaaTil(f);
    }

    function forfra() {
        nulstil();
        visStart();
    }

    /* ----- Skemaet til udklipsholderen: som tabel og som ren tekst ----------- */
    function skemaTekst() {
        var linjer = [D.TITEL];
        S.viser.forEach(function (f) {
            var fase = D.FASER[f];
            linjer.push("", udfyld(T.faseNr, { n: f + 1 }) + ": " + fase.aar + ". " + fase.navn);
            D.RAEKKER.forEach(function (rk, r) {
                linjer.push(rk.navn);
                fase.felter[r].forEach(function (o) { linjer.push("- " + linjeTekst(o)); });
            });
        });
        return linjer.join("\n");
    }

    function skemaHTML() {
        var celle = ' style="border:1px solid #888;padding:4px 6px;vertical-align:top;text-align:left"';
        var html = "<p><b>" + NK.html(D.TITEL) + '</b></p><table style="border-collapse:collapse"><tr><th' + celle + "></th>";
        S.viser.forEach(function (f) {
            html += "<th" + celle + ">" + NK.html(D.FASER[f].aar) + "<br>" + NK.html(D.FASER[f].navn) + "</th>";
        });
        html += "</tr>";
        D.RAEKKER.forEach(function (rk, r) {
            html += "<tr><th" + celle + ">" + NK.html(rk.navn) + "</th>";
            S.viser.forEach(function (f) {
                html += "<td" + celle + ">" + D.FASER[f].felter[r].map(linjeHTML).join("<br>") + "</td>";
            });
            html += "</tr>";
        });
        return html + "</table>";
    }

    function kopier() {
        var k = el("skema-kopier");
        function kvitter() {
            k.textContent = T.kopieret;
            window.setTimeout(function () { if (S.fase === "skema") k.textContent = T.kopier; }, 1600);
        }
        function gammelVej() {
            var omraade = document.createRange(), valg = window.getSelection();
            omraade.selectNode(el("skema-tabel"));
            valg.removeAllRanges();
            valg.addRange(omraade);
            try { if (document.execCommand("copy")) { kvitter(); valg.removeAllRanges(); } } catch (e) { /* tabellen staar markeret */ }
        }
        try {
            if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
                navigator.clipboard.write([new window.ClipboardItem({
                    "text/html": new Blob([skemaHTML()], { type: "text/html" }),
                    "text/plain": new Blob([skemaTekst()], { type: "text/plain" })
                })]).then(kvitter, gammelVej);
            } else {
                gammelVej();
            }
        } catch (e) {
            gammelVej();
        }
    }

    /* ----- Den lille fejring, naar en fase eller hele skemaet er udfyldt ------ */
    function fejring() {
        var boks = el("fejring"), html = "", farver = ["#f2c53d", "#e05446", "#3d9ee0", "#7ee0a8", "#f0d77a"];
        for (var i = 0; i < 28; i++) {
            html += '<i style="left:' + (4 + (i * 37) % 92) + "%;background:" + farver[i % farver.length] +
                ";animation-delay:" + ((i * 53) % 400) + "ms;animation-duration:" + (1300 + (i * 97) % 700) + 'ms"></i>';
        }
        boks.innerHTML = html;
        NK.genstart(boks, "i-gang");
        window.setTimeout(function () { boks.classList.remove("i-gang"); boks.innerHTML = ""; }, 2400);
    }

    /* ----- Pop op -------------------------------------------------------- */
    function lukAlle() {
        var aabne = document.querySelectorAll(".overlay.vis");
        for (var i = 0; i < aabne.length; i++) aabne[i].classList.remove("vis");
    }

    function aabn(id) {
        lukAlle();
        el(id).classList.add("vis");
    }

    /* ----- Tastatur ------------------------------------------------------ */
    function tastatur(e) {
        if (e.key === "Escape") { lukAlle(); return; }
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (document.querySelector(".overlay.vis")) return;
        /* I skrivefeltet er tasterne bogstaver. Enter tager formularen sig af. */
        if (e.target && e.target.tagName === "INPUT") return;
        if (e.key === "t" || e.key === "T") { aabn("fagord"); return; }
        if (S.fase !== "felt") return;
        if (e.key >= "1" && e.key <= "5") { vaelgPlads(parseInt(e.key, 10) - 1); return; }
        if (e.key === "Enter") {
            if (e.target && e.target.tagName === "BUTTON") return;
            e.preventDefault();
            videre();
        }
    }

    /* index.html#facit viser hele det udfyldte skema (til tavlen), og
       #1 til #4 gaar lige til en fase. */
    function fraAnker() {
        var anker = (window.location.hash || "").replace("#", "").toLowerCase();
        if (anker === "facit") {
            visSkema([0, 1, 2, 3], -1, false);
            S.facit = true;
            tegnSkemaLinje();
            return true;
        }
        var n = parseInt(anker, 10);
        if (n >= 1 && n <= FLAD.length) { gaaTil(n - 1); return true; }
        return false;
    }

    /* ----- Opstart ------------------------------------------------------- */
    function opstart() {
        hent();

        el("faser").addEventListener("click", function (ev) {
            var b = ev.target.closest("[data-fase]");
            if (b) gaaTil(parseInt(b.getAttribute("data-fase"), 10));
        });
        el("skemaknap").addEventListener("click", function () { visSkema(faerdigeFaser(), -1, false); });
        el("faserknap").addEventListener("click", visStart);

        el("valg").addEventListener("click", function (ev) {
            var b = ev.target.closest("[data-svar]");
            if (b) vaelg(parseInt(b.getAttribute("data-svar"), 10));
        });
        el("skriv").addEventListener("submit", function (ev) { ev.preventDefault(); tjek(); });
        el("hint").addEventListener("click", givHint);
        el("knap").addEventListener("click", videre);

        el("skema-videre").addEventListener("click", skemaVidere);
        el("skema-kopier").addEventListener("click", kopier);
        el("skema-igen").addEventListener("click", function () { toTryk(el("skema-igen"), lavIgen); });
        el("skema-forfra").addEventListener("click", function () { toTryk(el("skema-forfra"), forfra); });

        var lukKnapper = document.querySelectorAll("[data-luk]");
        for (var i = 0; i < lukKnapper.length; i++) lukKnapper[i].addEventListener("click", lukAlle);
        el("fagord").addEventListener("click", function (e) { if (e.target === el("fagord")) lukAlle(); });
        el("fagordknap").addEventListener("click", function () { aabn("fagord"); });
        document.addEventListener("keydown", tastatur);
        window.addEventListener("hashchange", function () { if (!fraAnker()) visStart(); });

        if (!fraAnker()) visStart();
    }

    NK.Forloeb = {
        NOEGLE: NOEGLE,
        FLAD: FLAD,
        tilstand: S,
        visStart: visStart,
        gaaTil: gaaTil,
        vaelg: vaelg,
        tjek: tjek,
        givHint: givHint,
        videre: videre,
        visSkema: visSkema,
        skemaTekst: skemaTekst,
        skemaHTML: skemaHTML,
        nulstil: nulstil
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", opstart);
    } else {
        opstart();
    }
}());
