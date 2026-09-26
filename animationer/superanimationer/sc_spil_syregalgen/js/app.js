/* =====================================================================
   app.js - Syregalgen: ordet, tastaturet, omraaderne og knappen

   Spillets regler staar i spil.js, scenen i kar.js og Kemichael i
   laerer.js. Her kobles de sammen med siden.

   Knappen under tastaturet er een knap i trin:
     Ledetråd (koster et skridt)  ->  Vis ordet (giver op)  ->  Næste ord

   Links: #historie vaelger historielisten, et omraades id vaelger det
   (#c3), flere med + (#c3+c4). Uden omraade huskes det sidste valg i
   browseren.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var G = NK.Galge;
    var el = NK.el;

    var LAGER = "nk-syregalgen";

    /* Til hvert femte ord i traek. Sarkasmen er venlig. */
    var ROS = [
        "Din stavehjerne er nu klassificeret som farligt gods.",
        "Vi har målt din koncentration af talent. Opløsningen er overmættet.",
        "Videnskabernes Selskab overvejer at opkalde en isotop efter dig.",
        "Din prøve er sendt til analyse. Resultat: 100 % ren, ufortyndet dygtighed.",
        "Syrebade verden over har erklæret dig umulig at true.",
        "Selv katalysatorerne beder om din autograf.",
        "Din elektronegativitet er så høj, at bogstaverne flytter sig hen mod dig."
    ];

    var lister = {};
    NK.Ordlister.forEach(function (l) {
        lister[l.id] = { id: l.id, titel: l.titel, laest: G.laes(l.tekst) };
    });

    var huske = NK.hent(LAGER, null) || {};
    if (!huske.rekord) huske.rekord = {};
    if (!huske.omraader) huske.omraader = {};

    var liste = null, spil = null, kar = null, laerer = null, laerred = null;
    var venter = null;   /* omraader valgt midt i et ord */

    function gem() { NK.gem(LAGER, huske); }

    /* ----- Hash: liste og omraader ------------------------------------- */
    function fraHash() {
        var h = "";
        try { h = decodeURIComponent(window.location.hash.replace(/^#/, "")); } catch (e) { h = ""; }
        var listeId = "kemi", omr = [];
        h.toLowerCase().split(/[+,&\s]+/).forEach(function (d) {
            if (!d) return;
            if (lister[d]) listeId = d;
            else omr.push(d);
        });
        return { liste: listeId, omraader: omr.length ? omr : null };
    }

    /* ----- Tekst -------------------------------------------------------- */
    function saetStatus(t) { NK.saetTekst("status", t); }

    function skridtTekst() {
        var n = spil.skridtTilbage();
        return n > 1 ? n + " skridt tilbage." : "Sidste skridt.";
    }

    /* ----- Ordet --------------------------------------------------------- */
    function visOrd() {
        var r = spil.runde, tavle = el("ordtavle");
        var html = "";
        r.ord.split(" ").forEach(function (gruppe) {
            html += '<span class="ordgruppe">';
            for (var i = 0; i < gruppe.length; i++) {
                var c = gruppe[i];
                if (!G.erBogstav(c)) {
                    html += '<span class="felt tegn">' + NK.html(c) + "</span>";
                } else if (spil.vist(c)) {
                    html += '<span class="felt vist">' + c + "</span>";
                } else if (r.status === "tabt") {
                    html += '<span class="felt mangler">' + c + "</span>";
                } else {
                    html += '<span class="felt"></span>';
                }
            }
            html += "</span>";
        });
        tavle.innerHTML = html;
        tavle.setAttribute("aria-label", r.status === "spiller"
            ? "Ordet: " + r.ord.split("").map(function (c) { return spil.vist(c) ? c : "_"; }).join(" ")
            : "Ordet var " + r.ord);
        tilpasOrd();
        NK.saetTekst("omraadelinje", r.post.omraadeNavn);
    }

    /* Felterne saa store, som bredden tillader. Et langt ord brydes ved
       mellemrum, aldrig midt i et ord. */
    function tilpasOrd() {
        var r = spil && spil.runde;
        if (!r) return;
        var bredde = Math.max(200, el("scene").clientWidth - 48);
        var grupper = r.ord.split(" ");
        var laengst = Math.max.apply(null, grupper.map(function (g) { return g.length; }));
        var felt = Math.min(54, bredde / (r.ord.length * 1.22));
        if (felt < 30) felt = Math.min(54, bredde / (laengst * 1.22));
        el("ordtavle").style.setProperty("--felt", Math.floor(Math.max(16, felt)) + "px");
    }

    /* ----- Tastaturet ------------------------------------------------------ */
    function bygTastatur() {
        var t = el("tastatur");
        t.innerHTML = "";
        G.BOGSTAVER.split("").forEach(function (b) {
            var k = document.createElement("button");
            k.type = "button";
            k.className = "tast";
            k.textContent = b;
            k.dataset.bogstav = b;
            k.addEventListener("click", function () { gaet(b); });
            t.appendChild(k);
        });
    }

    function visTastatur() {
        var r = spil.runde;
        var knapper = el("tastatur").querySelectorAll(".tast");
        for (var i = 0; i < knapper.length; i++) {
            var k = knapper[i], b = k.dataset.bogstav;
            var gaettet = r.gaettet.indexOf(b) >= 0;
            k.classList.toggle("rigtig", gaettet && r.ord.indexOf(b) >= 0);
            k.classList.toggle("forkert", gaettet && r.ord.indexOf(b) < 0);
            k.disabled = gaettet || r.status !== "spiller";
        }
    }

    /* ----- Knappen i trin --------------------------------------------------- */
    function visKnap() {
        var r = spil.runde, k = el("hovedknap");
        k.classList.remove("blaa", "banker", "advarsel");
        if (r.status !== "spiller") {
            k.innerHTML = "Næste ord <span>→</span>";
            k.classList.add("blaa", "banker");
        } else if (spil.kanFaaLedetraad()) {
            k.innerHTML = "Ledetråd <small>koster et skridt</small>";
        } else {
            k.innerHTML = "Vis ordet <small>og giv op</small>";
            k.classList.add("advarsel");
        }
    }

    function hovedknap() {
        var r = spil.runde;
        if (r.status !== "spiller") { nytOrd(); return; }
        if (spil.ledetraad()) {
            kar.saetForkerte(r.forkerte);
            visTekstkort("ledetraad");
            saetStatus("Ledetråden kostede et skridt. " + skridtTekst());
        } else if (spil.givOp()) {
            tabt(true);
        }
        visAlt();
    }

    /* ----- Kortet under tastaturet: ledetraaden eller forklaringen ------- */
    function visTekstkort(type) {
        var r = spil.runde, kort = el("tekstkort");
        kort.hidden = false;
        kort.className = "kort tekstkort " + type;
        el("tekstkort-ros").hidden = true;
        if (type === "ledetraad") {
            NK.saetTekst("tekstkort-titel", "Ledetråd");
            el("tekstkort-ord").hidden = true;
            NK.saetTekst("tekstkort-tekst", r.post.ledetraad);
            return;
        }
        el("tekstkort-ord").hidden = false;
        NK.saetTekst("tekstkort-ord", r.ord);
        NK.saetTekst("tekstkort-tekst", r.post.forklaring);
        if (type === "immun") {
            NK.saetTekst("tekstkort-titel", "Syreimmun");
            el("tekstkort-ros").hidden = false;
            NK.saetTekst("tekstkort-ros", spil.iTraek + " ord i træk uden syrebad. Du er officielt Syreimmun. " + NK.tilfaeldig(ROS));
        } else {
            NK.saetTekst("tekstkort-titel", type === "reddet" ? "Reddet" : "Opløst");
        }
    }

    /* ----- Tallene i toplinjen --------------------------------------------- */
    function visTal() {
        NK.saetTekst("tal-point", String(spil.point));
        NK.saetTekst("tal-traek", String(spil.iTraek));
        NK.saetTekst("tal-rekord", String(huske.rekord[liste.id] || 0));
    }

    function visAlt() {
        visOrd();
        visTastatur();
        visKnap();
        visTal();
    }

    /* ----- Runderne ---------------------------------------------------------- */
    function nytOrd() {
        if (venter) {
            spil.vaelg(venter);
            venter = null;
            el("omraade-note").hidden = true;
        }
        spil.nytOrd();
        kar.nyRunde();
        el("tekstkort").hidden = true;
        visAlt();
        visOmraader();
        saetStatus("Gæt et bogstav. Du kan også skrive på tastaturet.");
    }

    function gaet(t) {
        if (!spil || el("hjaelp").classList.contains("vis")) return;
        var svar = spil.gaet(t);
        if (!svar) return;
        if (svar.status === "vundet") {
            vundet();
        } else if (svar.status === "tabt") {
            tabt(false);
        } else if (svar.antal === 0) {
            kar.saetForkerte(spil.runde.forkerte);
            saetStatus("Ingen " + svar.bogstav + ". " + skridtTekst());
        } else {
            saetStatus(svar.bogstav + " er med" + (svar.antal > 1 ? " " + svar.antal + " gange." : "."));
        }
        visAlt();
    }

    function vundet() {
        var r = spil.runde;
        kar.vind();
        if (spil.iTraek > (huske.rekord[liste.id] || 0)) {
            huske.rekord[liste.id] = spil.iTraek;
            r.nyRekord = true;
            gem();
        }
        visTekstkort(r.syreimmun ? "immun" : "reddet");
        saetStatus("Reddet! +" + r.point + " point." + (r.nyRekord && spil.iTraek > 1 ? " Ny rekord." : "") + " Enter giver et nyt ord.");
    }

    function tabt(opgivet) {
        kar.vedPlask = function () {
            kar.vedPlask = null;
            if (laerer) laerer.plask(opgivet);
        };
        kar.tab();
        visTekstkort("oploest");
        saetStatus("Plask. Enter giver et nyt ord.");
    }

    /* ----- Omraaderne ---------------------------------------------------------- */
    function bygOmraader() {
        var boks = el("omraader");
        boks.innerHTML = "";
        var alle = document.createElement("button");
        alle.type = "button";
        alle.className = "chip";
        alle.dataset.id = "";
        alle.innerHTML = 'Alle <span class="antal">' + liste.laest.ord.length + "</span>";
        alle.addEventListener("click", function () { vaelgOmraade(""); });
        boks.appendChild(alle);
        liste.laest.omraader.forEach(function (o) {
            var k = document.createElement("button");
            k.type = "button";
            k.className = "chip";
            k.dataset.id = o.id;
            k.innerHTML = NK.html(o.navn) + ' <span class="antal">' + o.ord.length + "</span>";
            k.addEventListener("click", function () { vaelgOmraade(o.id); });
            boks.appendChild(k);
        });
    }

    function aktuelleValg() {
        return venter || spil.valgte;
    }

    function visOmraader() {
        var valgte = aktuelleValg();
        var knapper = el("omraader").querySelectorAll(".chip");
        for (var i = 0; i < knapper.length; i++) {
            var id = knapper[i].dataset.id;
            var aktiv = id ? valgte.indexOf(id) >= 0 : !valgte.length;
            knapper[i].classList.toggle("aktiv", aktiv);
            knapper[i].setAttribute("aria-pressed", aktiv ? "true" : "false");
        }
        var antal = 0;
        liste.laest.omraader.forEach(function (o) {
            if (!valgte.length || valgte.indexOf(o.id) >= 0) antal += o.ord.length;
        });
        NK.saetTekst("antal-ord", antal + " ord");
    }

    /* Klik paa et omraade slaar det til og fra. Alle rydder valget. */
    function vaelgOmraade(id) {
        var valgte = aktuelleValg().slice();
        if (!id) {
            valgte = [];
        } else if (valgte.indexOf(id) >= 0) {
            valgte.splice(valgte.indexOf(id), 1);
        } else {
            valgte.push(id);
        }
        if (valgte.length === liste.laest.omraader.length) valgte = [];
        huske.omraader[liste.id] = valgte;
        gem();
        if (spil.roert() && spil.runde.status === "spiller") {
            venter = valgte;
            el("omraade-note").hidden = false;
            visOmraader();
            return;
        }
        venter = null;
        el("omraade-note").hidden = true;
        spil.vaelg(valgte);
        visOmraader();
        /* Er ordet ikke roert endnu, kommer der straks et fra det nye valg */
        if (spil.runde && spil.runde.status === "spiller") nytOrd();
    }

    /* ----- Start og liste ------------------------------------------------------ */
    function startListe() {
        var h = fraHash();
        liste = lister[h.liste];
        spil = new G.Spil(liste.laest);
        venter = null;
        spil.vaelg(h.omraader || huske.omraader[liste.id] || []);
        NK.saetTekst("listenavn", liste.titel);
        document.title = liste.id === "kemi" ? "Syregalgen" : "Syregalgen: " + liste.titel;
        el("omraade-note").hidden = true;
        bygOmraader();
        visOmraader();
        nytOrd();
    }

    /* ----- Hjaelpen ----------------------------------------------------------- */
    function aabnHjaelp() {
        el("hjaelp").classList.add("vis");
        el("hjaelp-luk").focus();
    }

    function lukHjaelp() {
        el("hjaelp").classList.remove("vis");
    }

    /* ----- Loekken -------------------------------------------------------------- */
    var sidst = 0;
    function loekke(nu) {
        var dt = sidst ? Math.min(0.05, (nu - sidst) / 1000) : 1 / 60;
        sidst = nu;
        tegnEt(dt);
        window.requestAnimationFrame(loekke);
    }

    function tegnEt(dt) {
        if (laerred.tilpas()) tilpasOrd();
        kar.opdater(dt);
        if (laerer) laerer.opdater(dt);
        laerred.ryd();
        kar.tegn();
        if (laerer) laerer.laererTegnOver(laerred.ctx);
    }

    function punkt(e) {
        var r = el("laerred").getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    function start() {
        laerred = new NK.Laerred(el("laerred"));
        laerred.tilpas();
        kar = new NK.Kar(laerred);
        if (NK.Laerer) laerer = new NK.Laerer(laerred);
        if (NK.Sprites) NK.Sprites.start();

        bygTastatur();
        startListe();

        el("hovedknap").addEventListener("click", hovedknap);
        el("hjaelpknap").addEventListener("click", aabnHjaelp);
        el("hjaelp-luk").addEventListener("click", lukHjaelp);
        el("hjaelp").addEventListener("click", function (e) { if (e.target === el("hjaelp")) lukHjaelp(); });

        /* Klik paa Kemichael */
        el("scene").addEventListener("click", function (e) {
            if (!laerer) return;
            var p = punkt(e);
            laerer.laererKlik(p.x, p.y);
        });
        el("scene").addEventListener("pointermove", function (e) {
            var p = punkt(e);
            el("scene").classList.toggle("over-laerer", !!(laerer && laerer.laererUnder(p.x, p.y)));
        });

        document.addEventListener("keydown", function (e) {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            if (el("hjaelp").classList.contains("vis")) {
                if (e.key === "Escape") { lukHjaelp(); e.preventDefault(); }
                return;
            }
            if (e.key === "?") { aabnHjaelp(); e.preventDefault(); return; }
            if (e.key === "Enter") {
                if (spil.runde.status !== "spiller") { nytOrd(); e.preventDefault(); }
                return;
            }
            var b = G.bogstav(e.key);
            if (b) { gaet(b); e.preventDefault(); }
        });

        window.addEventListener("hashchange", startListe);
        window.addEventListener("resize", tilpasOrd);
        window.requestAnimationFrame(loekke);
    }

    /* Til selvtesten */
    NK.app = {
        spil: function () { return spil; },
        kar: function () { return kar; },
        laerer: function () { return laerer; },
        liste: function () { return liste; },
        lister: lister,
        gaet: gaet,
        hovedknap: hovedknap,
        nytOrd: nytOrd,
        vaelgOmraade: vaelgOmraade,
        tegnEt: tegnEt,
        visOrd: visOrd,
        ROS: ROS
    };

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
}());
