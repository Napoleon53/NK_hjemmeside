/* =====================================================================
   parring.js - fane 3: Parring

   Forsiderne staar i venstre spalte med en tom plads ved siden af.
   Bagsiderne ligger blandet i hoejre spalte, og eleven traekker hver
   bagside over paa den forside, den hoerer til. Et klik paa en bagside og
   derefter paa en plads goer det samme, saa spillet ogsaa kan bruges paa
   en tavle eller en telefon.

   Saettet deles i runder. Uret (27. nov. 2026) gaar kun, mens en runde
   er i gang: fra det foerste traek (eller fra Start) til runden er
   klaret. Mens Naeste runde venter, staar det stille, saa eleven kan
   laese parrene. Hver fejl laegger STRAF sekunder til tiden, saa det ikke
   kan betale sig at proeve sig frem.

   Top 10 (js/topliste.js): et indbygget saet med LISTE_PAR par pr.
   runde har sin egen liste. Svarer scriptet med en liste, begynder
   spillet med et startkort med listen, og kortene kommer foerst frem,
   naar eleven trykker Start. Saa kan ingen laese den foerste runde,
   foer uret gaar. Uden liste ser fanen ud som foer.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var el = NK.el;

    var P = NK.Parring = {};

    var STRAF = 5;          /* sekunder pr. fejl */
    var LISTE_PAR = 6;      /* kun denne rundestoerrelse har en Top 10 */

    var saet = null;
    var noegle = null;
    var prRunde = 6;
    var runder = [];
    var rundeNr = 0;
    var tilbage = 0;
    var fejl = 0;
    var startet = false;    /* uret er sat i gang i dette spil */
    var venter = false;     /* startkortet med listen staar fremme */
    var rundeKlar = false;  /* runden er klaret, og Naeste runde venter */
    var slut = false;
    var listespil = false;  /* spillet startede fra startkortet og kan komme paa listen */
    var spilNr = 0;         /* et svar fra listen til et gammelt spil bruges ikke */
    var ur = { tid: 0, sidst: 0 };
    var slutData = null;    /* { tid: sekunder med straf, ny: ny rekord } */
    var sender = false, sendt = false, listeStatus = "";
    var valgt = null;       /* nummeret paa den bagside, der er klikket */
    var traek = null;       /* { nr, flyver, x0, y0, aktiv } */

    /* ----- Uret ---------------------------------------------------------- */
    function nu() { return window.performance && performance.now ? performance.now() : Date.now(); }

    function urKoerer() { return startet && !venter && !rundeKlar && !slut; }

    /* Kaldes foer hver aendring af tilstanden, saa tiden indtil nu regnes
       med den tilstand, der gjaldt. */
    function urTrin() {
        var t = nu();
        if (urKoerer()) ur.tid += Math.max(0, t - ur.sidst) / 1000;
        ur.sidst = t;
    }

    function samletTid() { return ur.tid + fejl * STRAF; }

    /* 83,4 s -> "1:23" under spillet og "1:23,4" bagefter */
    function tidTekst(s, tiendedele) {
        var t = tiendedele ? Math.round(s * 10) / 10 : Math.floor(s);
        var m = Math.floor(t / 60), sek = t - m * 60;
        var st = tiendedele ? sek.toFixed(1).replace(".", ",") : String(Math.floor(sek));
        if (sek < 10) st = "0" + st;
        return m + ":" + st;
    }

    /* Rekorden fra 27. nov. 2026 er med straf, saa den har sin egen noegle.
       De gamle (par4, par6, par8) er sat uden straf og bruges ikke. */
    function rekordNavn() { return "par" + prRunde + "straf"; }

    function startUr() {
        if (startet || slut || venter) return;
        urTrin();
        startet = true;
    }

    /* ----- Listen -------------------------------------------------------- */
    function listeId() {
        if (!noegle || !NK.Bibliotek.indbygget(noegle) || prRunde !== LISTE_PAR) return null;
        return "spil9-" + noegle.replace(/^i:/, "");
    }

    function medListe() { return NK.Topliste.harListe(listeId()); }

    /* Henter listen til det valgte saet. Uden tving bruges en liste, der
       er under et minut gammel. */
    function hentListe(tving) {
        var id = listeId();
        if (!id || !NK.Topliste.kanSpoerge()) return;
        var l = NK.Topliste.liste(id);
        if (!tving && l && Date.now() - l.tid < 60000) return;
        NK.Topliste.hent(id).then(function (d) {
            if (id !== listeId()) return;
            listeStatus = d || NK.Topliste.liste(id) ? "" : "ikkeHentet";
            /* Svaret kan aendre, om startkortet skal staa fremme, men kun
               i et spil, der ikke er gaaet i gang. */
            if (!startet && !slut && medListe() !== venter) {
                venter = medListe();
                visBraet();
            }
            tegn();
        });
    }

    function saetPaaListen() {
        var id = listeId();
        if (!slut || !listespil || sendt || sender || !slutData || !NK.Topliste.harListe(id)) return;
        var navn = el("pa-navn").value;
        NK.Topliste.navn(navn);
        sender = true;
        tegn();
        var nr = spilNr;
        NK.Topliste.send({ spil: id, navn: navn, kort: saet.kort.length, par: prRunde, sekunder: slutData.tid })
            .then(function (d) {
                if (nr !== spilNr) return;
                sender = false;
                if (d) sendt = true;
                else status("Tiden kunne ikke sendes. Prøv igen om lidt.");
                tegn();
            });
    }

    function tegnLister() {
        var id = listeId();
        var l = id ? NK.Topliste.liste(id) : null;
        var tekst = l ? "" : (listeStatus === "ikkeHentet" ? "Listen kunne ikke hentes." : "Henter listen …");
        var ol = el("fane-parring").querySelectorAll(".tl-liste");
        for (var i = 0; i < ol.length; i++) {
            var raekker = l ? l[ol[i].getAttribute("data-liste")] || [] : [];
            var html = (tekst || !raekker.length)
                ? '<li class="tom">' + NK.html(tekst || "Ingen endnu.") + "</li>"
                : raekker.map(function (r) {
                    return "<li><span>" + NK.html(r.navn) + "</span><b>" + tidTekst(Number(r.sekunder) || 0, true) + "</b></li>";
                }).join("");
            if (ol[i].innerHTML !== html) ol[i].innerHTML = html;
        }
    }

    /* ----- Spillet ------------------------------------------------------- */
    P.saetSaet = function (nyt, nyNoegle) {
        saet = nyt;
        noegle = nyNoegle;
        P.nyt();
    };

    P.saetStoerrelse = function (n) {
        prRunde = n;
        P.nyt();
    };

    P.stoerrelse = function () { return prRunde; };

    P.nyt = function () {
        spilNr++;
        runder = [];
        rundeNr = 0;
        fejl = 0;
        startet = false;
        rundeKlar = false;
        slut = false;
        listespil = false;
        slutData = null;
        sender = false;
        sendt = false;
        listeStatus = "";
        ur = { tid: 0, sidst: nu() };
        valgt = null;
        if (!saet) return;
        var blandet = NK.bland(saet.kort);
        for (var i = 0; i < blandet.length; i += prRunde) {
            var del = blandet.slice(i, i + prRunde);
            /* En runde med ét kort er ikke en opgave; den lægges til den
               forrige i stedet. */
            if (del.length < 2 && runder.length) runder[runder.length - 1] = runder[runder.length - 1].concat(del);
            else runder.push(del);
        }
        venter = medListe();
        byg();
        hentListe(false);
    };

    /* Startkortet: kortene kommer frem, og uret gaar */
    P.start = function () {
        if (!venter || slut) return;
        urTrin();
        venter = false;
        startet = true;
        listespil = true;
        visBraet();
        tegn();
    };

    function runde() { return runder[rundeNr] || []; }

    function byg() {
        var r = runde();
        tilbage = r.length;
        valgt = null;
        var v = el("pa-venstre"), h = el("pa-hoejre");
        v.innerHTML = r.map(function (k, i) {
            return '<div class="p-plads" data-nr="' + i + '">'
                + '<span class="' + NK.tekstklasse(k.forside, "p-for ") + '">' + NK.html(k.forside) + "</span>"
                + '<span class="p-slot"><i>?</i></span></div>';
        }).join("");
        h.innerHTML = NK.bland(r.map(function (k, i) { return { k: k, i: i }; })).map(function (x) {
            return '<button class="' + NK.tekstklasse(x.k.bagside, "p-brik ") + '" type="button" data-nr="' + x.i + '">'
                + NK.html(x.k.bagside) + "</button>";
        }).join("");
        el("pa-slut").hidden = true;
        visBraet();
        tegn();
    }

    /* Braettet er skjult, mens startkortet staar fremme */
    function visBraet() {
        el("pa-braet").classList.toggle("skjult", venter);
        el("pa-start").hidden = !venter;
        status(venter ? "Tryk Start, når du er klar. Uret går, når kortene kommer frem."
            : "Træk svaret hen på det, det hører sammen med.");
    }

    function tegn() {
        NK.saetTekst("pa-tid", tidTekst(samletTid(), slut));
        NK.saetTekst("pa-fejl", String(fejl));
        NK.saetTekst("pa-runde", (rundeNr + 1) + " af " + runder.length);
        var rek = noegle ? NK.Bibliotek.rekord(noegle, rekordNavn()) : null;
        NK.saetTekst("pa-rekord", rek === null ? "ingen" : tidTekst(rek / 1000, true));
        var knapper = el("pa-stoerrelse").querySelectorAll("button");
        for (var i = 0; i < knapper.length; i++) {
            var n = +knapper[i].getAttribute("data-antal");
            knapper[i].classList.toggle("valgt", n === prRunde);
        }
        el("pa-naeste").hidden = !rundeKlar || slut;

        if (saet) NK.saetTekst("pa-start-tekst", saet.kort.length + " kort i runder på " + prRunde
            + " par. Hver fejl koster " + STRAF + " sekunder.");

        /* Resultatet: navnefeltet og listen kun efter et spil fra startkortet */
        var medNavn = slut && listespil && medListe();
        el("pa-slut").classList.toggle("med-liste", medNavn);
        el("pa-slut-liste").hidden = !medNavn;
        el("pa-slut-note").hidden = !(slut && noegle && NK.Bibliotek.indbygget(noegle)
            && prRunde !== LISTE_PAR && NK.Topliste.kendt());
        NK.saetTekst("pa-listeknap", sendt ? "Tiden er sendt" : (sender ? "Sender …" : "Sæt på listen"));
        el("pa-listeknap").disabled = sendt || sender;
        el("pa-navn").disabled = sendt || sender;
        if (venter || medNavn) tegnLister();

        /* En knap, der lige er slaaet fra, maa ikke holde paa tastaturet */
        var a = document.activeElement;
        if (a && a.disabled && a.blur) a.blur();
    }

    function status(tekst) { NK.saetTekst("pa-status", tekst); }

    /* ----- Forsoeget ----------------------------------------------------- */
    function forsoeg(brikNr, pladsNr) {
        if (venter || slut || rundeKlar) return;
        var r = runde();
        var plads = el("pa-venstre").querySelector('.p-plads[data-nr="' + pladsNr + '"]');
        var brik = el("pa-hoejre").querySelector('.p-brik[data-nr="' + brikNr + '"]');
        if (!plads || !brik || plads.classList.contains("rigtig")) return;
        startUr();
        if (brikNr === pladsNr) {
            plads.classList.add("rigtig");
            plads.querySelector(".p-slot").innerHTML = '<span class="' + NK.tekstklasse(r[pladsNr].bagside, "p-svar ") + '">'
                + NK.html(r[pladsNr].bagside) + "</span>";
            brik.remove();
            valgt = null;
            tilbage--;
            status(r[pladsNr].forside + ": " + r[pladsNr].bagside);
            if (!tilbage) rundeFaerdig();
        } else {
            urTrin();
            fejl++;
            ryst(plads);
            ryst(brik);
            status("Det passer ikke sammen. Det koster " + STRAF + " sekunder.");
            tegn();
        }
    }

    function ryst(e) {
        e.classList.remove("gal");
        void e.offsetWidth;
        e.classList.add("gal");
        setTimeout(function () { e.classList.remove("gal"); }, 500);
    }

    function rundeFaerdig() {
        urTrin();
        if (rundeNr < runder.length - 1) {
            rundeKlar = true;
            status("Runden er klaret. Uret står stille, til du trykker Næste runde.");
            tegn();
            return;
        }
        slut = true;
        var tid = Math.round(samletTid() * 10) / 10;
        var ny = noegle ? NK.Bibliotek.nyRekord(noegle, rekordNavn(), Math.round(tid * 1000)) : false;
        slutData = { tid: tid, ny: ny };
        var t = tidTekst(tid, true);
        NK.saetTekst("pa-slut-titel", ny ? "Ny rekord" : "Hele sættet er parret");
        NK.saetTekst("pa-slut-tekst", saet.kort.length + " kort på " + t + " med "
            + (fejl === 0 ? "ingen fejl" : (fejl === 1 ? "1 fejl" : fejl + " fejl"))
            + (fejl ? " (heraf " + fejl * STRAF + " s for fejl)" : "") + ".");
        el("pa-navn").value = NK.Topliste.navn();
        el("pa-slut").hidden = false;
        status(ny ? "Ny rekord på " + t + "." : "Hele sættet er parret på " + t + ".");
        tegn();
        if (listespil) hentListe(true);
    }

    P.naeste = function () {
        if (!rundeKlar || slut || rundeNr >= runder.length - 1) return;
        urTrin();
        rundeKlar = false;
        rundeNr++;
        byg();
    };

    /* ----- Traek med musen eller fingeren --------------------------------- */
    function pladsUnder(x, y) {
        var e = document.elementFromPoint(x, y);
        return e ? e.closest(".p-plads") : null;
    }

    function markerMaal(plads) {
        var alle = el("pa-venstre").querySelectorAll(".p-plads");
        for (var i = 0; i < alle.length; i++) alle[i].classList.toggle("maal", alle[i] === plads);
    }

    function nedPaaBrik(e) {
        var brik = e.target.closest(".p-brik");
        if (!brik || e.button > 0) return;
        traek = {
            nr: +brik.getAttribute("data-nr"),
            brik: brik,
            x0: e.clientX,
            y0: e.clientY,
            aktiv: false,
            flyver: null
        };
        try { brik.setPointerCapture(e.pointerId); } catch (ignore) { /* uden capture virker klik stadig */ }
    }

    function flyt(e) {
        if (!traek) return;
        var dx = e.clientX - traek.x0, dy = e.clientY - traek.y0;
        if (!traek.aktiv && dx * dx + dy * dy < 36) return;
        if (!traek.aktiv) {
            traek.aktiv = true;
            var r = traek.brik.getBoundingClientRect();
            var f = document.createElement("div");
            f.className = traek.brik.className.replace("p-brik", "p-brik p-flyver");
            f.textContent = traek.brik.textContent;
            f.style.width = r.width + "px";
            f.style.height = r.height + "px";
            document.body.appendChild(f);
            traek.flyver = f;
            traek.gribX = traek.x0 - r.left;
            traek.gribY = traek.y0 - r.top;
            traek.brik.classList.add("loeftet");
            el("pa-hoejre").classList.add("traekker");
            startUr();
        }
        traek.flyver.style.left = (e.clientX - traek.gribX) + "px";
        traek.flyver.style.top = (e.clientY - traek.gribY) + "px";
        markerMaal(pladsUnder(e.clientX, e.clientY));
        e.preventDefault();
    }

    function slip(e) {
        if (!traek) return;
        var t = traek;
        traek = null;
        el("pa-hoejre").classList.remove("traekker");
        if (t.flyver) t.flyver.remove();
        t.brik.classList.remove("loeftet");
        markerMaal(null);
        if (!t.aktiv) { vaelgBrik(t.nr); return; }
        var plads = pladsUnder(e.clientX, e.clientY);
        if (plads) forsoeg(t.nr, +plads.getAttribute("data-nr"));
        else status("Slip bagsiden oven på en forside.");
    }

    function vaelgBrik(nr) {
        valgt = valgt === nr ? null : nr;
        var alle = el("pa-hoejre").querySelectorAll(".p-brik");
        for (var i = 0; i < alle.length; i++) {
            alle[i].classList.toggle("valgt", +alle[i].getAttribute("data-nr") === valgt);
        }
        status(valgt === null ? "Træk svaret hen på det, det hører sammen med."
            : "Klik nu på den forside, den hører til.");
    }

    P.tast = function (e) {
        if (e.key === "Enter") {
            if (venter) { P.start(); return true; }
            if (slut) { P.nyt(); return true; }
            if (rundeKlar) { P.naeste(); return true; }
        }
        return false;
    };

    P.aktiver = function () { tegn(); };

    /* Til selvtesten og skaermbillederne */
    P.STRAF = STRAF;
    P.tid = samletTid;
    P.ur = function (s) { ur.tid += s; tegn(); };
    P.urKoerer = urKoerer;
    P.venter = function () { return venter; };
    P.tidTekst = tidTekst;
    P.listeId = listeId;
    P.genhent = function () { hentListe(true); };
    P.saetPaaListen = saetPaaListen;

    function init() {
        var h = el("pa-hoejre");
        h.addEventListener("pointerdown", nedPaaBrik);
        /* Med mus og finger vaelges brikken i slip(). Et klik fra
           tastaturet har detail 0 og har ikke vaeret igennem slip(). */
        h.addEventListener("click", function (e) {
            var b = e.target.closest(".p-brik");
            if (b && e.detail === 0) vaelgBrik(+b.getAttribute("data-nr"));
        });
        h.addEventListener("pointermove", flyt);
        h.addEventListener("pointerup", slip);
        h.addEventListener("pointercancel", function (e) {
            if (!traek) return;
            if (traek.flyver) traek.flyver.remove();
            traek.brik.classList.remove("loeftet");
            traek = null;
            h.classList.remove("traekker");
            markerMaal(null);
        });
        el("pa-venstre").addEventListener("click", function (e) {
            var p = e.target.closest(".p-plads");
            if (!p) return;
            if (valgt === null) { status("Vælg først en bagside til højre."); return; }
            forsoeg(valgt, +p.getAttribute("data-nr"));
        });
        el("pa-stoerrelse").addEventListener("click", function (e) {
            var b = e.target.closest("button[data-antal]");
            if (b) P.saetStoerrelse(+b.getAttribute("data-antal"));
        });
        el("pa-naeste").addEventListener("click", P.naeste);
        el("pa-nyt").addEventListener("click", P.nyt);
        el("pa-igen").addEventListener("click", P.nyt);
        el("pa-startknap").addEventListener("click", P.start);
        el("pa-listeknap").addEventListener("click", saetPaaListen);
        /* Navnefeltet: bogstaverne er navnet, ikke genveje (js/app.js
           springer felter over). Enter saetter tiden paa listen. */
        el("pa-navn").addEventListener("keydown", function (e) {
            if (e.key === "Enter") { saetPaaListen(); e.preventDefault(); }
            else if (e.key === "Escape") el("pa-navn").blur();
        });
        /* Uret i panelet: hele sekunder, saa det ikke flimrer */
        setInterval(function () {
            urTrin();
            NK.saetTekst("pa-tid", tidTekst(samletTid(), slut));
        }, 200);
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
}());
