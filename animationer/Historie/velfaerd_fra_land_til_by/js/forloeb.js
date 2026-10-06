/* =====================================================================
   forloeb.js - trinene, statuslinjen og den ene knap

   Tingene kommer frem ét trin ad gangen, saa der aldrig er mere paa
   skaermen, end opgaven har brug for:

     start    kun raekkerne med de 100 personer og knappen Videre
     1 sorter sektorerne kommer frem, og erhvervene traekkes ned i dem
     2 gaet   aarsskyderen kommer frem: gaet foerst, traek saa til 1989
     3-4 find skyderen stilles paa et aar, og eleven trykker Tjek
     5 vaelg  en forklaring vaelges blandt tre

   Knappen i statuslinjen er en trappe: Giv hint, Vis svaret og, naar
   opgaven er loest, Naeste opgave. Forklaringen staar alene, til eleven
   selv trykker videre.

   Kurven over sektorerne er et tilvalg bag knappen Kurve i toplinjen.
   Der er ingen laerer i scenen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data, M = NK.Model, T = D.TEKST;

    var S;              /* tilstanden, se nyTilstand() */
    var aar = D.FOERSTE;
    var kurveTil = false;

    function el(id) { return NK.el(id); }
    function opgave() { return D.OPGAVER[S.nr]; }

    function nyTilstand() {
        var loest = [];
        for (var i = 0; i < D.OPGAVER.length; i++) loest.push(false);
        return {
            intro: false,       /* starten: figuren alene, foer foerste opgave */
            nr: 0,              /* opgavens nummer i D.OPGAVER */
            trin: 0,            /* hvor langt trappen er naaet */
            loest: loest,
            venter: false,      /* opgaven er loest, og eleven skal selv trykke videre */
            gaet: null,
            forkerte: [],       /* de svar, der er proevet i en vaelg-opgave */
            fri: false,         /* uden opgaver (index.html#fri) */
            slut: false
        };
    }

    /* Er eleven midt i en opgave af denne type? */
    function iOpgave(type) {
        return !S.intro && !S.fri && !S.slut && opgave().type === type;
    }

    /* ----- Tekster med tal fra modellen ----------------------------------- */
    function udfyld(tekst, ekstra) {
        var v = {
            l1940: M.antalI(D.FOERSTE, "landbrug"),
            l1989: M.antalI(D.SIDSTE, "landbrug"),
            t1940: M.sektorSum(D.FOERSTE, "t"),
            t1989: M.sektorSum(D.SIDSTE, "t"),
            aar: aar,
            gaet: S.gaet
        };
        for (var n in ekstra) v[n] = ekstra[n];
        return tekst.replace(/\{(\w+)\}/g, function (hel, navn) {
            return v[navn] === undefined || v[navn] === null ? hel : String(v[navn]);
        });
    }

    /* ----- Statuslinjen og knappen ---------------------------------------- */
    function status(farve, maerke, tekst, ryst) {
        var linje = el("statuslinje");
        linje.className = "statuslinje" + (farve ? " " + farve : "");
        NK.saetHTML("besked", (maerke ? '<span class="b-maerke">' + NK.html(maerke) + "</span>" : "") + tekst);
        if (ryst) NK.genstart(linje, "ryster");
    }

    function knap(tekst, klasse) {
        var k = el("knap");
        k.hidden = !tekst;
        if (tekst) k.textContent = tekst;
        k.className = "knap hjaelp" + (klasse ? " " + klasse : "");
    }

    function videreTekst() {
        return S.nr >= D.OPGAVER.length - 1 ? "Afslut →" : "Næste opgave →";
    }

    function hintTekst() {
        var o = opgave();
        var antal = o.type === "sorter" ? 2 : (o.hint ? o.hint.length : 0);
        return S.trin >= antal ? "Vis svaret" : "Giv hint";
    }

    function loest(farve, maerke, tekst) {
        S.loest[S.nr] = true;
        S.venter = true;
        status(farve, maerke, tekst);
        knap(videreTekst(), "videre lyser");
        el("tjek").hidden = true;
        visTrin();
    }

    /* ----- Prikkerne i opgavelinjen: hvor langt eleven er ------------------ */
    function visTrin() {
        var html = "";
        for (var i = 0; i < D.OPGAVER.length; i++) {
            var kl = S.loest[i] ? "loest" : (i === S.nr && !S.intro && !S.slut && !S.fri ? "nu" : "kommer");
            html += '<li class="tr ' + kl + '" title="' + NK.html(D.OPGAVER[i].titel) + '">' + (S.loest[i] ? "✓" : (i + 1)) + "</li>";
        }
        NK.saetHTML("trin", html);
    }

    /* ----- Kurven: et tilvalg ---------------------------------------------- */
    function visKurve(til) {
        kurveTil = !!til;
        document.body.classList.toggle("med-kurve", kurveTil);
        el("kurveknap").classList.toggle("aktiv", kurveTil);
        el("kurveknap").setAttribute("aria-pressed", kurveTil ? "true" : "false");
        NK.Figur.tilpas();
        NK.Kurve.tilpas();
        tilpasMaerker();
    }

    function skiftKurve() {
        if (el("kurveknap").hidden) return;
        visKurve(!kurveTil);
    }

    /* ----- Aaret ----------------------------------------------------------- */
    function skyderSkjult() {
        return S.intro || iOpgave("sorter");
    }

    function skyderLaast() {
        return skyderSkjult() || (iOpgave("gaet") && S.gaet === null);
    }

    /* Aarstallene under skyderen: stregen staar der altid, men tallet skrives
       kun, naar der er plads til det. Skyderen bliver smal, naar der staar
       svarknapper ved siden af den. */
    function tilpasMaerker() {
        var boks = el("skyder-maerker"), maerker = boks.children;
        var bredde = boks.clientWidth, sidste = maerker.length - 1;
        var TAL = 32, LUFT = 5, forrigeSlut = -1000;
        for (var i = 0; i <= sidste; i++) {
            var midt = (D.AAR[i] - D.FOERSTE) / (D.SIDSTE - D.FOERSTE) * bredde;
            var plads = midt - TAL / 2 >= forrigeSlut + LUFT && midt + TAL / 2 <= bredde - TAL / 2 - LUFT;
            var vis = i === 0 || i === sidste || plads;
            maerker[i].classList.toggle("uden-tal", !vis);
            if (vis) forrigeSlut = midt + TAL / 2;
        }
    }

    function visAarsfelt() {
        NK.saetTekst("aar-tal", String(aar));
        el("skyder").value = aar;
        el("skyder").setAttribute("aria-valuetext", String(aar));
        el("skyderboks").classList.toggle("laast", skyderLaast());
        /* Gaettet: til eleven har gaettet, staar spoergsmaalet paa skyderens plads,
           lige ved de tre svar, og raekken, det handler om, er markeret. */
        var venterGaet = iOpgave("gaet") && S.gaet === null;
        el("skyderboks").classList.toggle("venter", venterGaet);
        NK.saetTekst("gaet-spm", venterGaet ? opgave().spoerg : "");
        if (iOpgave("gaet")) NK.Figur.marker(venterGaet ? M.erhvervNr("landbrug") : -1);
        if (iOpgave("find")) NK.saetTekst("tjek", T.tjek.replace("{aar}", aar));
    }

    function saetAar(nytAar, stille) {
        aar = M.klampAar(nytAar);
        NK.Figur.visAar(aar, stille);
        NK.Kurve.vis(aar);
        visAarsfelt();
    }

    /* Skyderen er trukket (eller piletasterne brugt). */
    function skyder(nytAar) {
        if (skyderSkjult()) { el("skyder").value = aar; return; }
        if (skyderLaast()) {
            el("skyder").value = aar;
            status("blaa", "Låst", NK.html(opgave().laast), true);
            return;
        }
        nytAar = M.klampAar(nytAar);
        if (nytAar === aar) return;
        saetAar(nytAar, false);
        el("skyderboks").classList.remove("lyser");

        if (iOpgave("gaet") && !S.venter && S.gaet !== null && aar === opgave().maalAar) {
            var op = opgave();
            var ramt = S.gaet === M.antalI(op.maalAar, "landbrug");
            loest(ramt ? "groen" : "blaa", ramt ? "Rigtigt gæt" : String(op.maalAar), NK.html(udfyld(ramt ? op.ramt : op.ikkeRamt)));
        }
    }

    function flytAar(d) { skyder(aar + d); }

    /* ----- Opgaven vises ---------------------------------------------------- */
    function visValg() {
        var boks = el("valg"), html = "";
        if (!iOpgave("gaet") && !iOpgave("vaelg")) { boks.hidden = true; boks.innerHTML = ""; return; }
        var o = opgave();
        for (var i = 0; i < o.valg.length; i++) {
            var tekst, kl = "knap svar", af = false;
            if (o.type === "gaet") {
                tekst = String(o.valg[i]);
                if (S.gaet !== null) { af = true; if (o.valg[i] === S.gaet) kl += " valgt"; }
            } else {
                tekst = o.valg[i].tekst;
                if (S.loest[S.nr]) { af = true; if (o.valg[i].rigtig) kl += " rigtig"; }
                else if (S.forkerte.indexOf(i) >= 0) { af = true; kl += " forkert"; }
            }
            html += '<button class="' + kl + '" type="button" data-valg="' + i + '"' + (af ? " disabled" : "") + ">" + NK.html(tekst) + "</button>";
        }
        boks.className = "valg " + o.type;
        boks.innerHTML = html;
        boks.hidden = false;
    }

    /* Starten: figuren alene. Sektorerne og opgaven kommer foerst efter Videre. */
    function visIntro() {
        document.body.setAttribute("data-fase", "intro");
        NK.saetTekst("opg-maerke", T.intro.maerke);
        NK.saetTekst("opg-tekst", T.intro.tekst);
        el("tjek").hidden = true;
        visValg();
        visAarsfelt();
        status("", "", NK.html(T.intro.besked));
        knap(T.intro.knap, "videre lyser");
        visTrin();
        NK.Figur.peg(-1);
        NK.Figur.tilpas();
        tilpasMaerker();
    }

    function sorterStart() {
        var k = NK.Figur.foersteLoese();
        return udfyld(opgave().start, { navn: k >= 0 ? D.ERHVERV[k].navn : "" });
    }

    function visOpgave() {
        var o = opgave();
        document.body.setAttribute("data-fase", o.type);
        NK.saetTekst("opg-maerke", "Opgave " + (S.nr + 1) + " af " + D.OPGAVER.length);
        NK.saetTekst("opg-tekst", udfyld(o.tekst));
        el("tjek").hidden = o.type !== "find";
        visValg();
        NK.Figur.marker(-1);
        NK.Figur.vaelg(-1);
        NK.Figur.peg(o.type === "sorter" ? NK.Figur.foersteLoese() : -1);

        if (o.type === "find") saetAar(D.FOERSTE, false);
        else visAarsfelt();

        status("", "", NK.html(o.type === "sorter" ? sorterStart() : udfyld(o.start)));
        if (o.type === "gaet") knap("");
        else knap(hintTekst());
        visTrin();
        NK.Figur.tilpas();
        tilpasMaerker();
    }

    /* ----- Sorteringen ------------------------------------------------------ */
    function sektor(id) {
        for (var i = 0; i < D.SEKTORER.length; i++) if (D.SEKTORER[i].id === id) return D.SEKTORER[i];
        return null;
    }

    function sorteringFaerdig(farve, maerke, foran) {
        NK.Figur.peg(-1);
        NK.Kurve.nulstil(aar);
        el("kurveknap").hidden = false;
        loest(farve, maerke, (foran ? foran + " " : "") + NK.html(opgave().faerdig));
    }

    function proev(k, id) {
        var e = D.ERHVERV[k];
        if (!iOpgave("sorter") || NK.Figur.erSorteret(k)) return;
        if (e.sektor === id) {
            NK.Figur.flyt(k, id);
            NK.Figur.blink(id, "godkendt");
            NK.Figur.vaelg(-1);
            NK.Figur.marker(-1);
            S.trin = 0;
            if (NK.Figur.altSorteret()) { sorteringFaerdig("groen", "Sorteret", ""); return; }
            NK.Figur.peg(NK.Figur.foersteLoese());
            status("groen", "Rigtigt", NK.html(e.rigtig));
            knap(hintTekst());
        } else {
            NK.Figur.blink(id, "afvist");
            status("roed", "Ikke endnu", NK.html(e.forkert[id]), true);
            knap(hintTekst(), "lyser-gul");
        }
    }

    function klikRaekke(k) {
        var e = D.ERHVERV[k];
        if (e.sektor === "u") { status("blaa", e.navn, NK.html(T.uoplystFast)); return; }
        /* Er et erhverv valgt, og klikker eleven paa en raekke, der allerede ligger
           i en sektor, er det sektoren, der er ment. */
        if (NK.Figur.kanSortere() && NK.Figur.valgt() >= 0 && NK.Figur.erSorteret(k)) {
            klikBaand(NK.Figur.baandFor(k));
            return;
        }
        if (!NK.Figur.kanSortere() || NK.Figur.erSorteret(k)) {
            status("blaa", e.navn, NK.html(e.daekker));
            return;
        }
        if (NK.Figur.valgt() === k) {
            NK.Figur.vaelg(-1);
            status("", "", NK.html(sorterStart()));
            return;
        }
        NK.Figur.vaelg(k);
        NK.Figur.marker(-1);
        S.trin = 0;
        knap(hintTekst());
        status("blaa", "Valgt", "<b>" + NK.html(e.navn) + ".</b> " + NK.html(e.daekker) + " " + NK.html(T.valgt));
    }

    function klikBaand(id) {
        if (!iOpgave("sorter") || S.venter) return;
        var k = NK.Figur.valgt();
        if (k < 0) { status("blaa", "", NK.html(T.vaelgFoerst), true); return; }
        proev(k, id);
    }

    function hintSorter() {
        var k = NK.Figur.valgt();
        if (k < 0) k = NK.Figur.foersteLoese();
        if (k < 0) return;
        var e = D.ERHVERV[k];
        NK.Figur.marker(k);
        if (S.trin < 2) {
            status("gul", "Hint " + (S.trin + 1) + " af 2", "<b>" + NK.html(e.navn) + ".</b> " + NK.html(e.hint[S.trin]));
            S.trin++;
            knap(hintTekst());
            return;
        }
        NK.Figur.flyt(k, e.sektor);
        NK.Figur.vaelg(-1);
        NK.Figur.marker(-1);
        S.trin = 0;
        var svar = "<b>" + NK.html(e.navn) + "</b> hører til " + NK.html(sektor(e.sektor).kort) + ". " + NK.html(e.rigtig);
        if (NK.Figur.altSorteret()) { sorteringFaerdig("gul", "Svaret", svar); return; }
        NK.Figur.peg(NK.Figur.foersteLoese());
        status("gul", "Svaret", svar);
        knap(hintTekst());
    }

    /* ----- Find-opgaverne --------------------------------------------------- */
    function svarTekst(o, res, grund) {
        return udfyld(o.svar[grund], {
            a: res.a, b: res.b,
            fra: M.svar.topAar[0], til: M.svar.topAar[M.svar.topAar.length - 1]
        });
    }

    function tjek() {
        if (!iOpgave("find") || S.venter) return;
        var o = opgave();
        var res = M.bedoem(o.id, aar);
        if (res.ok) {
            loest("groen", "Rigtigt", NK.html(svarTekst(o, res, "ok") + " " + o.forklaring));
            return;
        }
        status("roed", "Ikke endnu", NK.html(svarTekst(o, res, res.grund)), true);
        knap(hintTekst(), "lyser-gul");
    }

    function hintFind() {
        var o = opgave();
        if (S.trin < o.hint.length) {
            status("gul", "Hint " + (S.trin + 1) + " af " + o.hint.length, NK.html(o.hint[S.trin]));
            S.trin++;
            knap(hintTekst());
            return;
        }
        saetAar(M.svarAar(o.id), false);
        loest("gul", "Svaret", NK.html(svarTekst(o, M.bedoem(o.id, aar), "ok") + " " + o.forklaring));
    }

    /* ----- Svarknapperne (gaet og vaelg) ------------------------------------- */
    function valg(i) {
        if (S.intro || S.fri || S.slut || S.venter) return;
        var o = opgave();
        if (o.type === "gaet") {
            if (S.gaet !== null || i < 0 || i >= o.valg.length) return;
            S.gaet = o.valg[i];
            visValg();
            visAarsfelt();
            el("skyderboks").classList.add("lyser");
            status("blaa", "Dit gæt: " + S.gaet, NK.html(udfyld(o.efterGaet)));
            return;
        }
        if (o.type === "vaelg") {
            if (i < 0 || i >= o.valg.length || S.forkerte.indexOf(i) >= 0) return;
            var v = o.valg[i];
            if (v.rigtig) {
                loest("groen", "Rigtigt", NK.html(v.svar));
                visValg();
            } else {
                S.forkerte.push(i);
                visValg();
                status("roed", "Ikke endnu", NK.html(v.svar), true);
                knap(hintTekst(), "lyser-gul");
            }
        }
    }

    function hintVaelg() {
        var o = opgave();
        if (S.trin < o.hint.length) {
            status("gul", "Hint", NK.html(o.hint[S.trin]));
            S.trin++;
            knap(hintTekst());
            return;
        }
        for (var i = 0; i < o.valg.length; i++) {
            if (o.valg[i].rigtig) {
                loest("gul", "Svaret", "<b>" + NK.html(o.valg[i].tekst) + ".</b> " + NK.html(o.valg[i].svar));
                visValg();
                return;
            }
        }
    }

    /* 1, 2 og 3 paa tastaturet: sektor i sorteringen, ellers svarknap. */
    function tal(n) {
        if (S.intro || S.fri || S.slut) return;
        if (opgave().type === "sorter") { if (n < D.SEKTORER.length) klikBaand(D.SEKTORER[n].id); }
        else valg(n);
    }

    /* ----- Videre ------------------------------------------------------------ */
    function fejring() {
        var boks = el("fejring"), html = "", farver = ["#7cc36a", "#f09a4a", "#c08bf0", "#f2c53d", "#3d9ee0"];
        for (var i = 0; i < 28; i++) {
            html += '<i style="left:' + (4 + (i * 37) % 92) + "%;background:" + farver[i % farver.length] +
                ";animation-delay:" + ((i * 53) % 400) + "ms;animation-duration:" + (1300 + (i * 97) % 700) + 'ms"></i>';
        }
        boks.innerHTML = html;
        NK.genstart(boks, "i-gang");
        window.setTimeout(function () { boks.classList.remove("i-gang"); boks.innerHTML = ""; }, 2400);
    }

    function slut() {
        S.slut = true;
        S.venter = false;
        document.body.setAttribute("data-fase", "slut");
        NK.saetTekst("opg-maerke", "Færdig");
        NK.saetTekst("opg-tekst", T.slutFri);
        el("tjek").hidden = true;
        visValg();
        visAarsfelt();
        status("groen", "Alle løst", NK.html(udfyld(T.slut)));
        knap("Start forfra", "");
        visTrin();
        tilpasMaerker();
        fejring();
    }

    function naeste() {
        S.venter = false;
        S.trin = 0;
        S.forkerte = [];
        S.nr++;
        if (S.nr >= D.OPGAVER.length) { S.nr = D.OPGAVER.length - 1; slut(); return; }
        visOpgave();
    }

    /* Den ene knap i statuslinjen. */
    function trykKnap() {
        if (S.slut) { start(""); return; }
        if (S.fri) return;
        if (S.intro) { S.intro = false; visOpgave(); return; }
        if (S.venter) { naeste(); return; }
        var o = opgave();
        if (o.type === "sorter") hintSorter();
        else if (o.type === "find") hintFind();
        else if (o.type === "vaelg") hintVaelg();
    }

    /* Enter: Tjek, naar der er noget at tjekke. Ellers knappen, naar den gaar videre. */
    function enter() {
        if (iOpgave("find") && !S.venter) tjek();
        else if (S.intro || S.venter || S.slut) trykKnap();
    }

    /* maade: "" hele forloebet, "opgaver" uden starten og sorteringen, "fri" uden opgaver */
    function start(maade) {
        S = nyTilstand();
        aar = D.FOERSTE;
        el("skyderboks").classList.remove("lyser");
        var sorteret = maade === "opgaver" || maade === "fri";
        NK.Figur.nulstil(sorteret);
        NK.Kurve.nulstil(aar);
        el("kurveknap").hidden = !sorteret;
        visKurve(false);

        if (maade === "fri") {
            S.fri = true;
            document.body.setAttribute("data-fase", "fri");
            NK.saetTekst("opg-maerke", D.FOERSTE + "-" + D.SIDSTE);
            NK.saetTekst("opg-tekst", T.slutFri);
            el("tjek").hidden = true;
            visValg();
            saetAar(aar, true);
            status("", "", NK.html(T.fri));
            knap("");
            visTrin();
            NK.Figur.tilpas();
            tilpasMaerker();
            return;
        }
        saetAar(aar, true);
        if (maade === "opgaver") { S.loest[0] = true; S.nr = 1; visOpgave(); return; }
        S.intro = true;
        visIntro();
    }

    NK.Figur.kanSortere = function () { return iOpgave("sorter") && !S.venter; };
    NK.Figur.paaSlip = proev;
    NK.Figur.paaForbi = function () { status("blaa", "", NK.html(T.ikkeBaand), true); };
    NK.Figur.paaKlikRaekke = klikRaekke;
    NK.Figur.paaKlikBaand = klikBaand;

    NK.Forloeb = {
        start: start,
        knap: trykKnap,
        tjek: tjek,
        valg: valg,
        tal: tal,
        enter: enter,
        skyder: skyder,
        flytAar: flytAar,
        proev: proev,
        skiftKurve: skiftKurve,
        kurveTil: function () { return kurveTil; },
        aar: function () { return aar; },
        tilstand: function () { return S; },
        skyderLaast: skyderLaast,
        tilpasMaerker: tilpasMaerker
    };
}());
