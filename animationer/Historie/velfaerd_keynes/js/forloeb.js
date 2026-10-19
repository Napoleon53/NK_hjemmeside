/* =====================================================================
   forloeb.js - de tre dele, et trin ad gangen

   Al tekst staar i tekstkortet over tegningen: trinnets tekst, svarene,
   beskeden (rigtigt, forkert, hvad et klik viser) og den ene knap.
   Kortet har faste pladser, saa intet flytter sig fra trin til trin.

   Del 1  Pengenes kredsloeb: kredsloebet, et gaet, den onde cirkel,
          hvem kan saette gang i pengene, staten giver gas og
          multiplikatoreffekten.
   Del 2  Gas og brems: otte aar, hvor eleven holder oekonomien i balance,
          og et gaet om, hvad der var svaerest for politikerne.
   Del 3  Danmark 1953-1974: fire situationer. Laes, svar paa Keynes'
          regel, se regeringens valg, svar paa hvorfor. Til sidst skemaet.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kredsloeb;
    var KV = NK.Kurve;

    var S = {
        del: 0,
        trin: "",
        runde: 0,
        gaet: -1,
        /* del 2 */
        aar: 0,
        valg: [],           /* virkningerne: 1, 0 eller -1 */
        valgSlags: [],
        kasse: 0,
        /* del 3 */
        nr: 0,
        faerdig: [false, false, false]
    };

    var vedSvar = null;     /* hvad et klik paa svar nr. i goer i dette trin */
    var vedKnap = null;
    var vedMere = null;
    var beskedKilde = "";

    function el(id) { return NK.el(id); }

    /* ================================================================
       TEKSTKORTET
       ================================================================ */
    function tekst(html) { NK.saetHTML("tk-tekst", html); }

    /* svar: liste med { tekst, under, slags }. passiv: kun maerker, der
       ikke kan klikkes (fx "Dit gaet" eller redskaberne i del 2). */
    function svar(liste, fn, passiv) {
        var boks = el("tk-svar");
        var html = "";
        (liste || []).forEach(function (s, i) {
            if (typeof s === "string") s = { tekst: s };
            var kl = (passiv ? "tk-chip" : "tk-sv") + (s.slags ? " " + s.slags : "");
            var indhold = '<span class="sv-tekst">' + s.tekst + '</span>' + (s.under ? '<span class="sv-under">' + NK.html(s.under) + '</span>' : '');
            if (passiv) html += '<span class="' + kl + '">' + indhold + '</span>';
            else html += '<button type="button" class="' + kl + '" data-svar="' + i + '"><span class="sv-nr">' + (i + 1) + '</span><span class="sv-krop">' + indhold + '</span></button>';
        });
        boks.innerHTML = html;
        boks.className = "tk-svar" + (liste && liste.length > 2 && !passiv ? " tre" : "");
        vedSvar = passiv ? null : fn;
    }

    function svarKnapper() { return el("tk-svar").querySelectorAll(".tk-sv"); }

    function marker(i, klasse) {
        var b = svarKnapper()[i];
        if (b) b.classList.add(klasse);
    }

    /* Efter et rigtigt svar eller et gaet kan der ikke svares mere */
    function laasSvar(valgt) {
        var b = svarKnapper();
        for (var i = 0; i < b.length; i++) {
            b[i].disabled = true;
            if (i !== valgt && !b[i].classList.contains("forkert")) b[i].classList.add("daempet");
        }
    }

    function besked(html, klasse, ryst) {
        var b = el("tk-besked");
        b.className = "tk-besked" + (klasse ? " " + klasse : "");
        NK.saetHTML("tk-besked", html || "");
        beskedKilde = "";
        if (ryst) NK.genstart(b, "ryster");
    }

    function knap(t, klasse, fn) {
        var k = el("tk-knap");
        if (!t) {
            k.classList.add("skjult");
            k.disabled = true;
            vedKnap = null;
            return;
        }
        k.textContent = t;
        k.className = "knap stor " + (klasse || "videre");
        k.disabled = false;
        vedKnap = fn;
    }

    function mere(fn) {
        el("tk-mere").hidden = !fn;
        vedMere = fn;
    }

    function trin(navn) {
        S.trin = navn;
        document.body.setAttribute("data-trin", navn);
    }

    /* Et nyt trin: kortet ryddes, og pladserne bliver staaende */
    function nytTrin(navn, html) {
        trin(navn);
        tekst(html);
        svar([]);
        besked("");
        mere(null);
        NK.genstart(el("tk"), "ny");
    }

    /* ================================================================
       DELENE
       ================================================================ */
    function startDel(nr) {
        stopTidslinje();
        lukNotat();
        S.del = nr;
        document.body.setAttribute("data-del", String(nr));
        el("skema").hidden = true;
        el("tegning").style.display = "";
        tegnDele();
        if (nr === 0) del1Start();
        else if (nr === 1) del2Start();
        else del3Start();
    }

    function tegnDele() {
        var b = document.querySelectorAll(".del");
        for (var i = 0; i < b.length; i++) {
            b[i].classList.toggle("aktiv", i === S.del);
            b[i].classList.toggle("faerdig", S.faerdig[i]);
            b[i].setAttribute("aria-current", i === S.del ? "step" : "false");
        }
    }

    function delFaerdig(nr) {
        S.faerdig[nr] = true;
        tegnDele();
    }

    /* ================================================================
       DEL 1: PENGENES KREDSLOEB
       Fem klik i alt (brugerens oenske: faerre klik og mere tekst pr.
       klik). Gaettet staar paa foerste kort. Den onde cirkel og statens
       gas koerer hver som en kort animation, der stopper af sig selv.
       Knappen springer resten af animationen over.
       ================================================================ */
    var D1 = D.DEL1;

    /* Det, der skal ske om lidt i en animation. spolFrem() lader det hele
       ske med det samme, stopTidslinje() dropper det (ved spring til en
       anden del). */
    var tidslinje = [];

    function senere(sek, fn) {
        var post = { fn: fn };
        post.id = setTimeout(function () {
            var i = tidslinje.indexOf(post);
            if (i >= 0) tidslinje.splice(i, 1);
            fn();
        }, sek * 1000);
        tidslinje.push(post);
    }

    function spolFrem() {
        while (tidslinje.length) {
            var post = tidslinje.shift();
            clearTimeout(post.id);
            post.fn();
            K.spring();
        }
        K.spring();
    }

    function stopTidslinje() {
        tidslinje.forEach(function (post) { clearTimeout(post.id); });
        tidslinje = [];
    }

    function del1Start() {
        K.byg(el("tegning"));
        K.vedKlik(klikKredsloeb);
        S.gaet = -1;
        nytTrin("start", D1.start);
        besked(D1.startHint, "info");
        beskedKilde = "klik";
        knap(null);
        svar(D1.gaet.svar, function (i) {
            S.gaet = i;
            del1Krise();
        });
    }

    function klikKredsloeb(hvad) {
        if (S.del !== 0 || S.trin === "hvem") return;
        /* Fortael, hvad tingen er, hvis kortet ikke har en vigtigere besked */
        var b = el("tk-besked");
        if (b.textContent === "" || beskedKilde === "klik") {
            besked(D1.klik[hvad] || "", "info");
            beskedKilde = "klik";
        }
    }

    function dinGaet() {
        return [{ tekst: "Dit gæt: " + NK.html(D1.gaet.svar[S.gaet]) }];
    }

    /* Den onde cirkel: 2 kroner i sparegrisen, 2 fyret, 1 krone vaek og
       1 fyret mere. Beskeden om gaettet kommer, naar det er sket. */
    function del1Krise() {
        nytTrin("krise", D1.krise);
        svar(dinGaet(), null, true);
        K.sparOp(2);
        senere(1.0, function () { K.fyr(2); });
        senere(1.8, function () { K.fjern(1); });
        senere(2.3, function () { K.fyr(1); });
        senere(2.6, function () { besked(S.gaet === D1.gaet.holder ? D1.holdt : D1.holdtIkke, "groen"); });
        knap("Næste spørgsmål →", "videre", function () { spolFrem(); del1Hvem(); });
    }

    function del1Hvem() {
        nytTrin("hvem", D1.hvem.tekst);
        knap(null);
        svar(D1.hvem.svar, function (i) {
            var s = D1.hvem.svar[i];
            if (s.ja) {
                marker(i, "rigtig");
                laasSvar(i);
                besked(s.ja, "groen");
                knap("Se staten give gas →", "videre", del1Gas);
            } else {
                marker(i, "forkert");
                svarKnapper()[i].disabled = true;
                besked(s.nej, "roed", true);
            }
        });
    }

    /* Staten giver gas: vejarbejderne faar loen, en krone kommer op af
       sparegrisen, og statens roede krone koerer tre ture langs sporet. */
    function del1Gas() {
        nytTrin("gas", D1.gas);
        svar([{ tekst: D1.keynes }], null, true);
        K.vis("staten", true);
        senere(0.5, function () { K.statGas(2); });
        senere(2.4, function () { K.fraSparegris(1); K.ansaet(1); });
        senere(3.1, function () { K.foelg(true); });
        senere(3.5, function () { tur(3); });
        knap("Videre til del 2 →", "videre", function () { spolFrem(); startDel(1); });
    }

    function tur(n) {
        if (n === 0) {
            if (S.del === 0 && S.trin === "gas") {
                besked(D1.faerdig, "groen");
                delFaerdig(0);
            }
            return;
        }
        /* Et lille ophold ved hver station, saa taelleren kan ses */
        K.foelgSkridt(function () { senere(0.35, function () { tur(n - 1); }); });
    }

    /* ================================================================
       DEL 2: GAS OG BREMS
       Ingen ros og ingen skaeld ud aar for aar: beskeden siger kun, hvad
       der skete. Hoejst en venlig bemaerkning i hele spillet (foerste
       gang en linje kommer over graensen). Konsekvensen samles til sidst.
       ================================================================ */
    var D2 = D.DEL2;
    var M = NK.Model;

    function tegnSpil(naeste) {
        var slut = S.trin === "resultat" || S.trin === "svaert";
        KV.spil({
            temps: M.temperaturer(S.valg),
            uden: M.temperaturer(null),
            valg: S.valgSlags,
            vist: S.valg.length,
            visUden: slut,
            naeste: naeste ? S.valg.length + 1 : -1,
            kasse: S.kasse,
            visKasse: S.trin !== "intro"
        });
    }

    function del2Start() {
        K.stop();
        KV.byg(el("tegning"), "spil");
        S.valg = [];
        S.valgSlags = [];
        S.kasse = 0;
        S.hov = false;
        nytTrin("intro", D2.intro);
        svar(D2.vaerktoej, null, true);
        tegnSpil(false);
        knap("Start år 1 →", "videre", function () { del2Aar(0); });
    }

    /* Hvad der skete i aaret, uden at sige, om det var godt eller skidt */
    function skete(foer, efter) {
        var dl = M.ledighed(efter) - M.ledighed(foer), dp = M.priser(efter) - M.priser(foer);
        var l = dl > 0 ? D2.ledighed.op : (dl < 0 ? D2.ledighed.ned : D2.ledighed.ens);
        var p = dp > 0 ? D2.priser.op : (dp < 0 ? D2.priser.ned : D2.priser.ens);
        return l + ", og " + p + ".";
    }

    function del2Aar(i) {
        S.aar = i;
        nytTrin("aar" + (i + 1), "<b>År " + (i + 1) + ".</b> " + NK.html(D2.aar[i].nyt) + " <b>Hvad gør du?</b>");
        tegnSpil(true);
        knap(null);
        svar(D2.valg, function (j) {
            var v = D2.valg[j];
            S.valg[i] = v.virkning;
            S.valgSlags[i] = v.slags;
            S.kasse -= v.virkning;
            marker(j, "valgt");
            laasSvar(j);
            trin("aar" + (i + 1) + "set");
            tegnSpil(false);
            var t = M.temperaturer(S.valg);
            var tekst = skete(t[i], t[i + 1]);
            if (!S.hov) {
                if (M.ledighed(t[i + 1]) > D.GRAENSE) { tekst += " " + D2.hov.ledighed; S.hov = true; }
                else if (M.priser(t[i + 1]) > D.GRAENSE) { tekst += " " + D2.hov.priser; S.hov = true; }
            }
            besked(tekst, "info");
            if (i < D2.aar.length - 1) knap("År " + (i + 2) + " →", "videre", function () { del2Aar(i + 1); });
            else knap("Se resultatet →", "videre", del2Resultat);
        });
    }

    function gange(n) { return n + (n === 1 ? " gang" : " gange"); }

    function del2Resultat() {
        var med = M.overGraensen(M.temperaturer(S.valg));
        var uden = M.overGraensen(M.temperaturer(null));
        var gas = S.valg.filter(function (v) { return v > 0; }).length;
        var brems = S.valg.filter(function (v) { return v < 0; }).length;
        nytTrin("resultat", "<b>Otte år er gået.</b> Arbejdsløsheden var over grænsen i " + med.ledighed + " år, og priserne i " + med.priser + " år. Uden staten (de stiplede linjer) var det " + uden.ledighed + " og " + uden.priser + " år.");
        tegnSpil(false);
        var kasse = S.kasse > 0 ? "har overskud" : (S.kasse < 0 ? "har underskud" : "er i balance");
        svar([{ tekst: med.ledighed + med.priser === 0 ? D2.som : D2.opskrift }], null, true);
        besked("Du gav gas " + gange(gas) + " og bremsede " + gange(brems) + ". Statskassen " + kasse + ".", "blaa");
        knap("Næste spørgsmål →", "videre", del2Svaert);
    }

    function del2Svaert() {
        nytTrin("svaert", D2.svaert.tekst);
        knap(null);
        svar(D2.svaert.svar, function (i) {
            marker(i, "valgt");
            laasSvar(i);
            besked((i === D2.svaert.holder ? "<b>Dit gæt holdt ✓</b> " : "<b>Svaret:</b> ") + D2.svaert.svaret, "groen");
            delFaerdig(1);
            knap("Videre til del 3 →", "videre", function () { startDel(2); });
        });
    }

    /* ================================================================
       DEL 3: DANMARK 1953-1974
       ================================================================ */
    function sit() { return D.SITUATIONER[S.nr]; }

    function del3Start() {
        K.stop();
        KV.byg(el("tegning"), "historie");
        del3Laes(0);
    }

    function del3Laes(n) {
        S.nr = n;
        nytTrin("laes", sit().tekst);
        KV.historie({ nr: n, afsloeret: n });
        knap("Hvad siger Keynes' regel? →", "videre", del3Keynes);
    }

    function del3Keynes() {
        var s = sit();
        nytTrin("keynes", s.tekst + " <b>Hvad siger Keynes' regel?</b>");
        knap(null);
        var liste = s.keynes.rigtig === "begge" ? D.KEYNES_SVAR : D.KEYNES_SVAR.slice(0, 2);
        svar(liste, function (i) {
            var valgt = liste[i].slags;
            if (valgt === s.keynes.rigtig) {
                marker(i, "rigtig");
                laasSvar(i);
                besked(s.keynes.ja, "groen");
                knap(S.nr === D.SITUATIONER.length - 1 ? "Hvad skete der så? →" : "Hvad gjorde regeringen? →", "videre", del3Hvorfor);
            } else {
                marker(i, "forkert");
                svarKnapper()[i].disabled = true;
                besked(s.keynes.nej[valgt], "roed", true);
            }
        });
    }

    function del3Hvorfor() {
        var s = sit();
        nytTrin("hvorfor", s.hvorfor.tekst);
        KV.historie({ nr: S.nr, afsloeret: S.nr + 1 });
        mere(function () { aabnNotat(S.nr); });
        knap(null);
        svar(s.hvorfor.svar, function (i) {
            var v = s.hvorfor.svar[i];
            if (v.ja) {
                marker(i, "rigtig");
                laasSvar(i);
                besked(v.ja, "groen");
                if (S.nr < D.SITUATIONER.length - 1) knap("Videre til " + D.SITUATIONER[S.nr + 1].aar + " →", "videre", function () { del3Laes(S.nr + 1); });
                else knap("Se skemaet →", "videre", del3Slut);
            } else {
                marker(i, "forkert");
                svarKnapper()[i].disabled = true;
                besked(v.nej, "roed", true);
            }
        });
    }

    function regelNavn(slags) {
        for (var i = 0; i < D.KEYNES_SVAR.length; i++) if (D.KEYNES_SVAR[i].slags === slags) return D.KEYNES_SVAR[i].tekst;
        return slags;
    }

    function del3Slut() {
        nytTrin("slut", D.SLUT.tekst);
        KV.historie({ nr: D.SITUATIONER.length - 1, afsloeret: D.SITUATIONER.length, slut: true });
        var rk = "";
        D.SITUATIONER.forEach(function (s) {
            rk += "<tr>" +
                '<td class="s-aar">' + s.aar + "</td>" +
                '<td class="s-regel ' + s.keynes.rigtig + '">' + NK.html(s.keynes.rigtig === "begge" ? "Begge veje" : regelNavn(s.keynes.rigtig)) + "</td>" +
                '<td class="s-reg">' + NK.html(s.regeringen) + "</td>" +
                '<td class="s-hvorfor">' + NK.html(s.kort) + "</td>" +
                "</tr>";
        });
        NK.saetHTML("skema-krop", rk);
        el("tegning").style.display = "none";
        el("skema").hidden = false;
        besked(D.SLUT.eftertanke, "blaa");
        delFaerdig(2);
        knap("Start forfra", "hjaelp", function () {
            S.faerdig = [false, false, false];
            startDel(0);
        });
    }

    /* ----- Laes mere i del 3 ------------------------------------------ */
    function aabnNotat(n) {
        var m = D.SITUATIONER[n].mere;
        NK.saetTekst("notat-titel", m.titel);
        NK.saetHTML("notat-tekst", m.tekst.map(function (p) { return "<p>" + NK.html(p) + "</p>"; }).join(""));
        el("notat").classList.add("vis");
        el("notat").querySelector(".overlay-boks").scrollTop = 0;
    }

    function lukNotat() { el("notat").classList.remove("vis"); }

    /* ================================================================
       KLIK OG TASTER
       ================================================================ */
    function klikSvar(i) {
        var b = svarKnapper()[i];
        if (!b || b.disabled || !vedSvar) return;
        vedSvar(i);
    }

    function trykKnap() {
        var k = el("tk-knap");
        if (k.disabled || !vedKnap) return;
        vedKnap();
    }

    function bind() {
        el("tk-svar").addEventListener("click", function (ev) {
            var b = ev.target.closest("[data-svar]");
            if (b) klikSvar(parseInt(b.getAttribute("data-svar"), 10));
        });
        el("tk-knap").addEventListener("click", trykKnap);
        el("tk-mere").addEventListener("click", function () { if (vedMere) vedMere(); });
        var dele = document.querySelectorAll(".del");
        for (var i = 0; i < dele.length; i++) {
            dele[i].addEventListener("click", function () { startDel(parseInt(this.getAttribute("data-del"), 10)); });
        }
    }

    NK.Forloeb = {
        bind: bind,
        startDel: startDel,
        klikSvar: klikSvar,
        trykKnap: trykKnap,
        mere: function () { if (vedMere) vedMere(); },
        spolFrem: spolFrem,
        tilstand: function () { return S; }
    };
}());
