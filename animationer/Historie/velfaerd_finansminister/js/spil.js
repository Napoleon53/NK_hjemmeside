/* =====================================================================
   spil.js - forloebet gennem de fire situationer

   I hver situation gaar eleven gennem fire faser, et trin ad gangen:

     laes       avisen og maalerne. De tre kort ligger med bagsiden op,
                saa avisen kan laeses foerst. Knappen vender kortene.
     vaelg      de tre kort. Det foerste klik paa et kort er elevens
                valg. Knappen aabner notatet, hvor der staar mere om
                hver mulighed.
     valgt      maalerne viser foelgen. Eleven kan proeve de to andre
                kort. Knappen viser, hvad regeringen gjorde.
     afsloeret  regeringens valg er stemplet. Knappen gaar videre.

   Efter den sidste situation kommer regnskabet (fasen slut), hvor
   elevens valg staar ved siden af regeringens. Der er ingen rigtige og
   forkerte svar: hvert valg har en pris, ogsaa regeringens.

   Notatet (Laes mere) forklarer hver mulighed: hvad den gaar ud paa, og
   hvad der taler for og imod. Efter afsloeringen staar der ogsaa, hvordan
   det gik med regeringens valg.

   Layoutet er det samme i alle faser. Avisen, maalerne, feltet med
   foelgen og de tre kort har faste pladser.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var M = NK.Model;

    var S = {
        nr: 0,              /* situationens nummer, 0-3 */
        fase: "laes",
        mit: [],            /* elevens valg pr. situation (kortets nummer) eller undefined */
        vist: -1            /* det kort, maalerne viser lige nu */
    };

    function el(id) { return NK.el(id); }
    function sit() { return D.SITUATIONER[S.nr]; }
    function sidste() { return S.nr === D.SITUATIONER.length - 1; }

    function saetFase(fase) {
        S.fase = fase;
        document.body.setAttribute("data-fase", fase);
    }

    /* ----- Statuslinjen og knappen ------------------------------------ */
    function saetBesked(html, klasse, ryst) {
        var linje = el("statuslinje");
        linje.className = "statuslinje" + (klasse ? " " + klasse : "");
        NK.saetHTML("besked", html);
        if (ryst) NK.genstart(linje, "ryster");
    }

    function saetKnap(tekst, klasse) {
        var k = el("knap");
        k.textContent = tekst;
        k.className = "knap hjaelp" + (klasse ? " " + klasse : "");
    }

    /* ----- Avisen ------------------------------------------------------ */
    function tegnAvis(a, animer) {
        NK.saetTekst("avis-dato", a.dato);
        NK.saetTekst("avis-rubrik", a.rubrik);
        NK.saetTekst("avis-tekst", a.tekst);
        NK.saetTekst("avis-stilling", a.stilling || "");
        el("avis-stilling").hidden = !a.stilling;
        if (animer) NK.genstart(el("avis"), "ny");
    }

    /* ----- De tre kort -------------------------------------------------- */
    /* Hvert kort ligger paa en plads sammen med sin egen Laes mere-knap.
       Knappen er kortets nabo og ikke en del af det, saa et klik paa den
       ikke er et valg. */
    function tegnKort() {
        var boks = el("valg");
        boks.innerHTML = "";
        sit().valg.forEach(function (v, k) {
            var plads = document.createElement("div");
            plads.className = "valgplads";

            var b = document.createElement("button");
            b.type = "button";
            b.className = "valgkort";
            b.setAttribute("data-kort", String(k));
            b.style.setProperty("--kant", D.SLAGS[v.slags]);
            b.innerHTML =
                '<span class="vk-maerke">' + NK.html(v.maerke) + '</span>' +
                '<span class="vk-titel">' + NK.html(v.titel) + '</span>' +
                '<span class="vk-linje">' + NK.html(v.linje) + '</span>' +
                '<span class="vk-stempler"></span>';

            var mere = document.createElement("button");
            mere.type = "button";
            mere.className = "vk-mere";
            mere.setAttribute("data-mere", String(k));
            mere.setAttribute("aria-label", "Læs mere om " + v.titel);
            mere.textContent = "Læs mere";

            plads.appendChild(b);
            plads.appendChild(mere);
            boks.appendChild(plads);
        });
        NK.saetTekst("spm", sit().spm);
        maerkKort();
    }

    /* Stempler og rammer paa kortene efter fasen */
    function maerkKort() {
        var kort = el("valg").querySelectorAll(".valgkort");
        var mit = S.mit[S.nr];
        var reg = M.regering(S.nr);
        var afsloeret = S.fase === "afsloeret";
        var skjult = S.fase === "laes";
        for (var k = 0; k < kort.length; k++) {
            var erMit = mit === k;
            var erReg = afsloeret && reg === k;
            kort[k].classList.toggle("vises", S.vist === k);
            kort[k].classList.toggle("mit", erMit);
            kort[k].classList.toggle("reg", erReg);
            kort[k].setAttribute("aria-pressed", S.vist === k ? "true" : "false");
            kort[k].setAttribute("aria-label", skjult ? "Mulighed " + (k + 1) + ", ikke vendt endnu" : sit().valg[k].titel);
            var fod = "";
            if (erMit) fod += '<span class="stempel mit">Dit valg</span>';
            if (erReg) fod += '<span class="stempel reg">Regeringens valg</span>';
            var f = kort[k].querySelector(".vk-stempler");
            if (f.innerHTML !== fod) f.innerHTML = fod;
        }
    }

    /* ----- Feltet med foelgen og prisen --------------------------------- */
    function tegnFoelge() {
        var boks = el("foelge");
        var tom = S.vist < 0;
        boks.classList.toggle("tom", tom);
        el("f-tom").hidden = !tom;
        el("f-indhold").hidden = tom;
        if (tom) return;

        var v = sit().valg[S.vist];
        var erMit = S.mit[S.nr] === S.vist;
        var erReg = S.fase === "afsloeret" && M.regering(S.nr) === S.vist;
        var forrest = erMit && erReg ? "Dit og regeringens valg" : (erReg ? "Regeringens valg" : (erMit ? "Dit valg" : "Et andet valg"));
        NK.saetHTML("f-titel", forrest + ": <b>" + NK.html(v.titel) + "</b>");
        NK.saetTekst("f-foelge", v.foelge);
        NK.saetTekst("f-pris", v.pris);

        var visReg = S.fase === "afsloeret";
        el("f-reg-rk").hidden = !visReg;
        if (visReg) NK.saetTekst("f-reg", sit().afsloer);
    }

    /* ----- Listen over aarene i panelet --------------------------------- */
    function tegnAarliste() {
        var html = "";
        var faerdige = 0;
        D.SITUATIONER.forEach(function (s, j) {
            var slut = S.fase === "slut";
            var faerdig = slut || j < S.nr;
            var nu = !slut && j === S.nr;
            var naaet = faerdig || nu;
            var afsloeret = faerdig || (nu && S.fase === "afsloeret");
            if (faerdig) faerdige++;

            var linjer = "";
            if (naaet) {
                var mit = S.mit[j];
                if (mit !== undefined) linjer += '<span class="aar-linje">Du: <b>' + NK.html(s.valg[mit].titel) + '</b></span>';
                else if (faerdig) linjer += '<span class="aar-linje">Du: sprunget over</span>';
                if (afsloeret) linjer += '<span class="aar-linje">Regeringen: <b>' + NK.html(s.valg[M.regering(j)].titel) + '</b></span>';
            }

            html += '<li class="aar ' + (faerdig ? "faerdig" : (nu ? "nu" : "kommer")) + '">' +
                '<span class="aar-hoved">' +
                    '<span class="aar-tal">' + s.aar + '</span>' +
                    '<span class="aar-titel">' + (naaet ? NK.html(s.titel) : "") + '</span>' +
                    '<span class="aar-flue" aria-hidden="true">' + (faerdig ? "✓" : "") + '</span>' +
                '</span>' + linjer +
                '</li>';
        });
        NK.saetHTML("aarliste", html);
        NK.saetTekst("aar-taeller", faerdige + " af " + D.SITUATIONER.length);
    }

    /* ----- Maalerne ------------------------------------------------------ */
    function visMaalere() {
        if (S.fase === "slut") {
            NK.Maalere.vis(M.slut(), M.start(0), { siden: D.SITUATIONER[0].aar });
        } else if (S.vist >= 0) {
            NK.Maalere.vis(M.efter(S.nr, S.vist), M.start(S.nr));
        } else if (S.nr > 0) {
            /* Ny situation: vis, hvad der er sket siden regeringens sidste valg */
            NK.Maalere.vis(M.start(S.nr), M.efter(S.nr - 1, M.regering(S.nr - 1)), { siden: D.SITUATIONER[S.nr - 1].aar });
        } else {
            NK.Maalere.vis(M.start(0), null);
        }
        visNote();
    }

    /* Linjen under maalerne er en fast note. Klikker eleven paa en maaler,
       laegger forklaringen sig oven paa noten, til der klikkes igen. */
    var forklaret = "";

    function visNote() {
        var m = null;
        D.MAALERE.forEach(function (x) { if (x.id === forklaret) m = x; });
        var v = NK.Maalere.vist();
        var flyttet = false;
        if (v.foer) D.IDER.forEach(function (id) { if (v.foer[id] !== v.nu[id]) flyttet = true; });
        NK.saetTekst("maalernote", flyttet ? D.TEKST.noteFoer : D.TEKST.note);
        NK.saetTekst("m-forklaring", m ? m.forklar : "");
        el("m-forklaring").hidden = !m;
        var knapper = document.querySelectorAll(".maaler");
        for (var i = 0; i < knapper.length; i++) {
            knapper[i].classList.toggle("forklaret", knapper[i].getAttribute("data-maaler") === forklaret);
        }
    }

    function klikMaaler(id) {
        forklaret = forklaret === id ? "" : id;
        visNote();
    }

    /* ----- Trin 1: en situation begynder med avisen ---------------------- */
    function visSituation(i, animer) {
        S.nr = i;
        S.vist = -1;
        forklaret = "";
        saetFase("laes");

        el("regnskab").hidden = true;
        el("foelge").hidden = false;
        el("valgdel").hidden = false;

        tegnAvis(sit().avis, animer);
        tegnKort();
        tegnFoelge();
        visMaalere();
        tegnAarliste();

        if (i === 0) {
            saetBesked("<b>" + sit().aar + ".</b> Du er finansminister. Læs avisen, og se på de tre målere.", "", false);
        } else {
            saetBesked("<b>" + sit().aar + ".</b> Læs avisen, og se, hvad der er sket med målerne siden " + D.SITUATIONER[i - 1].aar + ".", "", false);
        }
        saetKnap("Se dine muligheder →", "videre");
    }

    /* ----- Trin 2: kortene vendes ----------------------------------------- */
    function vendKort() {
        if (S.fase !== "laes") return;
        saetFase("vaelg");
        var kort = el("valg").querySelectorAll(".valgkort");
        for (var k = 0; k < kort.length; k++) NK.genstart(kort[k], "vend");
        maerkKort();
        saetBesked("Vælg et af de tre kort." + (S.mit.length === 0 ? " Dit første klik er dit valg." : ""), "", false);
        saetKnap("Læs mere om mulighederne", "");
    }

    /* ----- Et klik paa et kort ------------------------------------------- */
    function klikKort(k) {
        if (S.fase === "slut") return;
        if (S.fase === "laes") { vendKort(); return; }
        var v = sit().valg[k];
        if (!v) return;

        if (S.fase === "vaelg") {
            S.mit[S.nr] = k;
            saetFase("valgt");
            saetBesked("Dit valg: <b>" + NK.html(v.titel) + "</b>. Prøv også de to andre kort, og se så, hvad regeringen gjorde.", "blaa", false);
            saetKnap("Hvad gjorde regeringen?", "videre lyser");
        } else if (S.fase === "valgt") {
            var mit = sit().valg[S.mit[S.nr]];
            if (k === S.mit[S.nr]) {
                saetBesked("Dit valg: <b>" + NK.html(v.titel) + "</b>. Prøv også de to andre kort, og se så, hvad regeringen gjorde.", "blaa", false);
            } else {
                saetBesked("Sådan ville det gå med <b>" + NK.html(v.titel) + "</b>. Dit valg er stadig <b>" + NK.html(mit.titel) + "</b>.", "blaa", false);
            }
        }

        S.vist = k;
        visMaalere();
        tegnFoelge();
        maerkKort();
        tegnAarliste();
        NK.genstart(el("foelge"), "ny");
    }

    /* ----- Notatet bag Laes mere ------------------------------------------ */
    /* De tre muligheder side om side. fokus er nummeret paa det kort, der
       blev bedt om, eller -1 for alle tre. Hvordan det gik med regeringens
       valg, staar foerst i notatet, naar valget er afsloeret. */
    function aabnNotat(fokus) {
        if (S.fase === "laes" || S.fase === "slut") return false;
        var s = sit();
        var afsloeret = S.fase === "afsloeret";
        var reg = M.regering(S.nr);
        var mit = S.mit[S.nr];

        NK.saetTekst("notat-titel", s.aar + ": " + s.spm);
        NK.saetTekst("notat-baggrund", s.baggrund);

        var html = "";
        s.valg.forEach(function (v, k) {
            var stempler = "";
            if (mit === k) stempler += '<span class="stempel mit">Dit valg</span>';
            if (afsloeret && reg === k) stempler += '<span class="stempel reg">Regeringens valg</span>';
            html += '<section class="notat-kol' + (k === fokus ? " fokus" : "") + '" data-notat="' + k + '" style="--kant:' + D.SLAGS[v.slags] + '">' +
                '<span class="vk-maerke">' + NK.html(v.maerke) + '</span>' +
                '<h3>' + NK.html(v.titel) + '</h3>' +
                (stempler ? '<p class="n-stempler">' + stempler + '</p>' : '') +
                '<p class="n-hvad">' + NK.html(v.mere.hvad) + '</p>' +
                '<p class="n-linje for"><span>For</span>' + NK.html(v.mere.for) + '</p>' +
                '<p class="n-linje imod"><span>Imod</span>' + NK.html(v.mere.imod) + '</p>' +
                '</section>';
        });
        NK.saetHTML("notat-kolonner", html);
        el("notat-gik").hidden = !afsloeret;
        NK.saetHTML("notat-gik", afsloeret
            ? '<span class="etiket">Sådan gik det</span><b>Regeringen valgte: ' + NK.html(s.valg[reg].titel) + '.</b> ' + NK.html(s.valg[reg].gik)
            : "");
        NK.saetTekst("notat-luk", S.fase === "vaelg" ? "Luk, og vælg selv" : "Luk");
        el("notat").classList.add("vis");
        el("notat").querySelector(".overlay-boks").scrollTop = 0;
        return true;
    }

    /* ----- Den ene knap i statuslinjen ----------------------------------- */
    function knap() {
        if (S.fase === "laes") { vendKort(); return; }

        if (S.fase === "vaelg") { aabnNotat(-1); return; }

        if (S.fase === "valgt") {
            var reg = M.regering(S.nr);
            var r = sit().valg[reg];
            var mit = sit().valg[S.mit[S.nr]];
            saetFase("afsloeret");
            S.vist = reg;
            visMaalere();
            tegnFoelge();
            maerkKort();
            tegnAarliste();
            NK.genstart(el("foelge"), "ny");
            if (reg === S.mit[S.nr]) {
                saetBesked('<span class="b-maerke">Samme valg</span>Regeringen valgte det samme som dig: <b>' + NK.html(r.titel) + '</b>.', "blaa", false);
            } else {
                saetBesked('<span class="b-maerke">Et andet valg</span>Regeringen valgte <b>' + NK.html(r.titel) + '</b>. Du valgte <b>' + NK.html(mit.titel) + '</b>.', "blaa", false);
            }
            saetKnap(sidste() ? "Se regnskabet →" : "Videre til " + D.SITUATIONER[S.nr + 1].aar + " →", "videre");
            return;
        }

        if (S.fase === "afsloeret") {
            if (sidste()) visSlut();
            else visSituation(S.nr + 1, true);
            return;
        }

        forfra(0);
    }

    /* ----- Regnskabet ------------------------------------------------------ */
    function visSlut() {
        saetFase("slut");
        S.vist = -1;
        forklaret = "";

        tegnAvis(D.REGNSKAB, true);
        el("foelge").hidden = true;
        el("valgdel").hidden = true;
        el("regnskab").hidden = false;

        var raekker = "";
        var ens = 0, spillet = 0;
        D.SITUATIONER.forEach(function (s, j) {
            var reg = M.regering(j);
            var mit = S.mit[j];
            var samme = mit === reg;
            if (mit !== undefined) spillet++;
            if (samme) ens++;
            raekker += '<tr' + (samme ? ' class="ens"' : '') + '>' +
                '<td class="r-aar">' + s.aar + '</td>' +
                '<td class="r-mit">' + (mit === undefined ? "sprunget over" : NK.html(s.valg[mit].titel)) + (samme ? ' <span class="samme">samme valg</span>' : '') + '</td>' +
                '<td class="r-reg">' + NK.html(s.valg[reg].titel) + '</td>' +
                '<td class="r-pris">' + NK.html(s.valg[reg].pris) + '</td>' +
                '</tr>';
        });
        NK.saetHTML("regnskab-krop", raekker);
        visMaalere();
        tegnAarliste();
        saetBesked("Du valgte som regeringen i <b>" + ens + " af " + spillet + "</b> situationer. " +
            '<span class="b-maerke">Til eftertanke</span>' + NK.html(D.REGNSKAB.eftertanke), "blaa", false);
        saetKnap("Start forfra", "");
    }

    function forfra(fra) {
        S.mit = [];
        visSituation(fra || 0, true);
    }

    NK.Spil = {
        start: function (fra) { S.mit = []; visSituation(fra || 0, false); },
        klikKort: klikKort,
        klikMaaler: klikMaaler,
        vendKort: vendKort,
        aabnNotat: aabnNotat,
        knap: knap,
        forfra: forfra,
        tilstand: function () { return S; }
    };
}());
