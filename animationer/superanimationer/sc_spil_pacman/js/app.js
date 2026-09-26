/* =====================================================================
   app.js - skaermene, knapperne, tastaturet og tegneloekken

   Reglerne staar i js/spil.js og opgaverne i js/emner.js. Her vises
   det, spillet siger: startskaermen, spoergsmaalet, labyrinten og
   kortene efter et svar. render() skifter skaerm, hud() opdaterer det,
   der aendrer sig hvert billede (liv, nedtaelling og hint).

   Spillet staar stille, mens rundvisningen eller reglerne er aabne, og
   naar fanen ikke kan ses.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var E = NK.Emner;
    var el = NK.el;

    var KLARET = "nk-pacman-klaret";
    var TOUCH = window.matchMedia && window.matchMedia("(hover: none) and (pointer: coarse)").matches;

    var spil = new NK.Spil();
    var tegning = null;
    var laerer = null;
    var laerred = null;
    var sidsteTid = 0;
    var ui = {
        skaerm: null,
        guideVist: false,     /* guiden forsvinder efter det foerste rigtige svar */
        beskedUr: 0,
        hudNoegle: ""
    };

    /* ----- Hukommelsen: klarede emner pr. svaerhedsgrad ---------------- */
    function klaret() { return NK.hent(KLARET, {}); }

    function husk(emne, svaerhed) {
        var k = klaret();
        k[emne] = k[emne] || {};
        k[emne][svaerhed] = true;
        NK.gem(KLARET, k);
    }

    /* ----- Startskaermen ------------------------------------------------- */
    function bygStart() {
        var sv = el("svaerhed");
        sv.innerHTML = "";
        D.SVAERHED_ORDEN.forEach(function (k) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "svaerhed-knap";
            b.setAttribute("data-s", k);
            b.textContent = D.SVAERHED[k].navn;
            sv.appendChild(b);
        });
        tegnEmner();
    }

    function tegnEmner() {
        var g = el("emner"), k = klaret();
        g.innerHTML = "";
        E.ORDEN.forEach(function (id) {
            var em = E.EMNER[id];
            var b = document.createElement("button");
            b.type = "button";
            b.className = "emne" + (em.mix ? " mix" : "");
            b.setAttribute("data-emne", id);
            var prikker = D.SVAERHED_ORDEN.map(function (s) {
                var ok = k[id] && k[id][s];
                return '<i class="' + (ok ? "ok" : "") + '" title="' + D.SVAERHED[s].navn + (ok ? " er klaret" : "") + '"></i>';
            }).join("");
            var mester = em.mix && k[id] && k[id][D.MESTER.svaerhed] ? '<span class="emne-mester">' + D.MESTER.titel + "</span>" : "";
            b.innerHTML = '<strong>' + NK.html(em.titel) + '</strong><span class="emne-beskrivelse">' + NK.html(em.beskrivelse) + "</span>"
                + '<span class="prikker" aria-hidden="true">' + prikker + "</span>" + mester;
            g.appendChild(b);
        });
    }

    function vaelgSvaerhed(k) {
        if (!spil.vaelgSvaerhed(k)) return;
        Array.prototype.forEach.call(el("svaerhed").children, function (b) {
            b.classList.toggle("valgt", b.getAttribute("data-s") === k);
        });
        el("emner").classList.remove("laast");
        NK.saetTekst("svaerhed-note", noteFor(k));
        NK.saetTekst("naeste-skridt", "Vælg et emne.");
    }

    /* Farten i felter i sekundet, med én decimal */
    function fart(S) { return NK.tal(Math.round(10000 / S.trinMs) / 10); }

    function noteFor(k) {
        var S = D.SVAERHED[k];
        var t = "Spøgelserne sover i " + NK.tal(S.sovMs / 1000) + " s og går " + fart(S) + " felter i sekundet.";
        if (S.nye) t += " Hvert " + NK.tal(D.NYT_SPOEGELSE_MS / 1000) + ". sekund kommer der et nyt.";
        return t;
    }

    function startEmne(id) {
        if (!spil.svaerhed) return;
        if (laerer) laerer.stopIntro();
        if (!spil.start(id)) return;
        tegning.konfetti = [];
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
        render();
    }

    function tilStart() {
        spil.tilStart();
        render();
    }

    /* ----- Skaermene ------------------------------------------------------ */
    function render() {
        var s = spil.skaerm;
        document.body.setAttribute("data-skaerm", s);
        el("start").hidden = s !== "start";
        el("emneknap").hidden = s === "start";
        el("kort-rigtigt").hidden = s !== "rigtigt";
        el("kort-tabt").hidden = s !== "tabt";
        el("kort-slut").hidden = s !== "slut";

        if (s === "start") {
            tegnEmner();
            NK.saetTekst("status", "");
            NK.saetTekst("naeste-skridt", spil.svaerhed ? "Vælg et emne." : "Vælg en sværhedsgrad.");
            if (spil.svaerhed) vaelgSvaerhed(spil.svaerhed);
        } else {
            NK.saetTekst("status", E.EMNER[spil.emne].titel + " · " + D.SVAERHED[spil.svaerhed].navn);
        }

        var q = spil.q;
        if (s === "rigtigt" && q) {
            NK.saetTekst("rigtigt-svar", q.rigtig);
            NK.saetTekst("rigtigt-tekst", q.forklaring);
            var sidste = spil.nr + 1 >= spil.antal();
            el("naesteknap").innerHTML = (sidste ? "Afslut emnet" : "Næste opgave") + " <span>→</span>";
        }
        if (s === "tabt" && q) {
            NK.saetTekst("tabt-svar", q.rigtig);
            NK.saetTekst("tabt-tekst", q.forklaring);
        }
        if (s === "slut") {
            NK.saetTekst("slut-tekst", "Du har klaret alle " + spil.antal() + " opgaver i " + E.EMNER[spil.emne].titel
                + " på " + D.SVAERHED[spil.svaerhed].navn + ".");
            el("mester").hidden = !spil.mester;
            NK.saetTekst("mester-titel", D.MESTER.titel);
            NK.saetTekst("mester-tekst", D.MESTER.tekst);
        }
        ui.skaerm = s;
        ui.hudNoegle = "";
        hud();
    }

    /* Det, der kan aendre sig hvert billede */
    function hud() {
        var s = spil.skaerm, q = spil.q;
        var iSpil = s !== "start" && q;
        var vaagner = s === "spil" ? spil.vaagnerOm() : 0;
        var noegle = [s, spil.liv, spil.nr, q ? q.tekst : "", spil.hint, Math.ceil(vaagner / 1000), ui.guideVist].join("|");
        if (noegle === ui.hudNoegle) return;
        ui.hudNoegle = noegle;

        var liv = "";
        for (var i = 0; i < D.LIV; i++) liv += '<span class="hjerte' + (i < spil.liv ? "" : " tomt") + '">♥</span>';
        el("liv").innerHTML = iSpil ? liv : "";
        el("liv").setAttribute("aria-label", "Liv: " + spil.liv);
        var slut = s === "slut";
        NK.saetTekst("nr", iSpil ? "Opgave " + Math.min(spil.nr + 1, spil.antal()) + "/" + spil.antal() : "");
        NK.saetTekst("sp-etiket", iSpil ? (slut ? E.EMNER[spil.emne].titel : q.titel) : "");
        NK.saetTekst("sp-tekst", iSpil ? (slut ? "Emnet er gennemført" : q.tekst) : "");

        var hint = el("sp-hint");
        hint.hidden = !(iSpil && spil.hint && s === "spil");
        if (!hint.hidden) hint.textContent = spil.hint;

        var v = el("vaekker");
        v.hidden = !(vaagner > 0);
        if (!v.hidden) {
            v.textContent = "Spøgelserne vågner om " + Math.ceil(vaagner / 1000) + " s";
            /* Lige over labyrintens overkant, ogsaa naar den ikke fylder hoejden */
            v.style.top = Math.max(4, tegning.banen().y - 36) + "px";
        }

        var guide = "";
        if (s === "spil") {
            if (spil.hint) guide = D.GUIDE.forkert;
            else if (!ui.guideVist) guide = TOUCH ? D.GUIDE.touch : D.GUIDE.tast;
        }
        NK.saetTekst("guide", guide);
    }

    /* Beskeden midt nederst paa labyrinten (2 s som i den gamle) */
    function besked(tekst, art) {
        var b = el("besked");
        b.textContent = tekst;
        b.className = "besked vis " + (art || "");
        clearTimeout(ui.beskedUr);
        ui.beskedUr = setTimeout(function () { b.classList.remove("vis"); }, 2000);
    }

    function haendelser() {
        spil.tagHaendelser().forEach(function (h) {
            if (h.type === "mist" && h.data.grund === "rum") besked(D.BESKED.forkertRum, "roed");
            else if (h.type === "mist") besked(D.BESKED.fanget, "roed");
            else if (h.type === "nytSpoegelse") besked(D.BESKED.nytSpoegelse, "roed");
            else if (h.type === "skjold") besked(D.BESKED.skjold, "gul");
            else if (h.type === "rigtigt") { ui.guideVist = true; render(); }
            else if (h.type === "tabt") render();
            else if (h.type === "slut") {
                husk(spil.emne, spil.svaerhed);
                tegning.startKonfetti();
                render();
                /* Paa en smal skaerm er der ikke plads til ham ved siden af kortet */
                if (h.data.mester && laerer && el("studie").offsetWidth >= 900) laerer.mesterBesoeg();
            }
        });
    }

    /* ----- Tegneloekken -------------------------------------------------- */
    function pauset() {
        return document.hidden || NK.Rundvisning.aktiv() || !!document.querySelector(".overlay.vis");
    }

    function loekke(ts) {
        var dt = (ts - sidsteTid) / 1000;
        sidsteTid = ts;
        if (!isFinite(dt) || dt < 0) dt = 0;
        if (dt > 0.1) dt = 0.1;
        if (spil.skaerm === "spil" && !pauset()) spil.opdater(dt * 1000);
        haendelser();
        tegning.tegn(spil, ts);
        hud();
        if (laerer) {
            laerred.tilpas();
            laerred.ryd();
            laerer.opdater(dt);
            laerer.laererTegnOver(laerred.ctx);
            el("start").classList.toggle("med-laerer", laerer.laererIIntro());
            el("studie").classList.toggle("besoeg", laerer.iScene("mester"));
        }
        window.requestAnimationFrame(loekke);
    }

    /* ----- Knapper og tastatur ------------------------------------------ */
    function primaer() {
        if (spil.skaerm === "rigtigt") { spil.naeste(); render(); return true; }
        if (spil.skaerm === "tabt") { spil.proevIgen(); render(); return true; }
        if (spil.skaerm === "slut") { tilStart(); return true; }
        return false;
    }

    function lukOverlay() {
        var aabne = document.querySelectorAll(".overlay.vis");
        for (var i = 0; i < aabne.length; i++) aabne[i].classList.remove("vis");
    }

    function rundvisning() {
        lukOverlay();
        var s = spil.skaerm;
        NK.Rundvisning.start(s === "start" ? "start" : (s === "spil" ? "spil" : "kort"));
    }

    var PILE = {
        ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
        w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0], W: [0, -1], S: [0, 1], A: [-1, 0], D: [1, 0]
    };

    function tastatur(e) {
        if (e.key === "Escape") {
            if (NK.Rundvisning.aktiv()) { NK.Rundvisning.luk(); return; }
            if (document.querySelector(".overlay.vis")) { lukOverlay(); return; }
            if (laerer && !laerer.springIntro()) { /* intet at lukke */ }
            return;
        }
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        var tag = e.target && e.target.tagName;
        if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
        if (NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis")) return;

        var pil = PILE[e.key];
        if (pil && spil.skaerm === "spil") {
            e.preventDefault();
            spil.styr(pil[0], pil[1]);
            return;
        }
        if (e.key === "Enter" || e.key === " ") {
            if (tag === "BUTTON") return;
            if (primaer()) e.preventDefault();
            return;
        }
        var k = e.key.toLowerCase();
        if (k === "h" || e.key === "?") { rundvisning(); return; }
        if (k === "k" && laerer && spil.skaerm === "start") { laerer.startIntro(true); return; }
    }

    /* Pilene paa en trykskaerm: ét felt pr. tryk, og holdes pilen nede,
       gaar spilleren videre */
    function bindDpad() {
        var ur = 0, gentag = 0;
        function stop() { clearTimeout(ur); clearInterval(gentag); ur = gentag = 0; }
        Array.prototype.forEach.call(el("dpad").querySelectorAll("button"), function (b) {
            var dx = +b.getAttribute("data-dx"), dy = +b.getAttribute("data-dy");
            b.addEventListener("pointerdown", function (e) {
                e.preventDefault();
                stop();
                spil.styr(dx, dy);
                ur = setTimeout(function () { gentag = setInterval(function () { spil.styr(dx, dy); }, 110); }, 320);
            });
            ["pointerup", "pointerleave", "pointercancel"].forEach(function (t) { b.addEventListener(t, stop); });
        });
    }

    /* Tabellen i reglerne laves ud fra D.SVAERHED, saa den altid passer */
    function regelTabel() {
        var ks = D.SVAERHED_ORDEN;
        function raekke(navn, f) {
            return "<tr><th>" + navn + "</th>" + ks.map(function (k) { return "<td>" + f(D.SVAERHED[k]) + "</td>"; }).join("") + "</tr>";
        }
        el("regel-tabel").innerHTML = "<tr><th></th>" + ks.map(function (k) { return "<th>" + D.SVAERHED[k].navn + "</th>"; }).join("") + "</tr>"
            + raekke("Spøgelserne sover", function (S) { return NK.tal(S.sovMs / 1000) + " s"; })
            + raekke("Fart (felter pr. s)", fart)
            + raekke("Nye spøgelser", function (S) { return S.nye ? "hvert " + NK.tal(D.NYT_SPOEGELSE_MS / 1000) + ". s, op til " + D.SPOEGELSE_START.length : "nej"; });
    }

    /* Et link kan vaelge svaerhedsgrad (#svaer) og starte et emne (#svaer&mix) */
    function fraLink() {
        var dele = window.location.hash.replace(/^#/, "").toLowerCase().split(/[&\/,]/);
        var sv = null, em = null;
        dele.forEach(function (d) {
            d = d.replace("æ", "ae");
            if (D.SVAERHED[d]) sv = d;
            if (E.EMNER[d]) em = d;
        });
        if (sv) vaelgSvaerhed(sv);
        if (sv && em) { startEmne(em); return true; }
        return false;
    }

    function punkt(e) {
        var r = el("laerred").getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    /* ----- Start ------------------------------------------------------- */
    function start() {
        tegning = new NK.Tegning(el("bane"));
        laerred = new NK.Laerred(el("laerred"));
        if (NK.Sprites) NK.Sprites.start();
        if (NK.Laerer) {
            laerer = new NK.Laerer(laerred);
            NK.laerer = laerer;
            el("spring-over").addEventListener("click", function () { laerer.stopIntro(); });
        }
        if (TOUCH) document.body.classList.add("touch");

        bygStart();
        regelTabel();

        el("svaerhed").addEventListener("click", function (e) {
            var b = e.target.closest("[data-s]");
            if (b) vaelgSvaerhed(b.getAttribute("data-s"));
        });
        el("emner").addEventListener("click", function (e) {
            var b = e.target.closest("[data-emne]");
            if (!b) return;
            if (!spil.svaerhed) {
                /* Laast: saa blinker sværhedsgraderne */
                var sv = el("svaerhed");
                sv.classList.remove("puf");
                void sv.offsetWidth;
                sv.classList.add("puf");
                return;
            }
            startEmne(b.getAttribute("data-emne"));
        });

        el("naesteknap").addEventListener("click", primaer);
        el("igenknap").addEventListener("click", primaer);
        el("slut-emner").addEventListener("click", primaer);
        el("tabt-emner").addEventListener("click", tilStart);
        el("emneknap").addEventListener("click", tilStart);
        el("regelknap").addEventListener("click", function () { el("regler").classList.add("vis"); });
        el("regler-luk").addEventListener("click", lukOverlay);
        el("regler").addEventListener("click", function (e) { if (e.target === el("regler")) lukOverlay(); });
        el("hjaelpknap").addEventListener("click", rundvisning);
        var fuld = el("fuldknap");
        fuld.hidden = !document.fullscreenEnabled;
        fuld.addEventListener("click", function () {
            if (document.fullscreenElement) document.exitFullscreen();
            else document.documentElement.requestFullscreen().catch(function () { /* ikke tilladt her */ });
        });
        bindDpad();

        /* Klik paa Kemichael fanges, foer de naar knapperne under ham */
        var studie = el("studie");
        studie.addEventListener("click", function (e) {
            if (!laerer || !laerer.synlig()) return;
            var p = punkt(e);
            if (laerer.laererIntroKlik(p.x, p.y) || laerer.laererKlik(p.x, p.y)) {
                e.stopPropagation();
                e.preventDefault();
            }
        }, true);
        studie.addEventListener("pointermove", function (e) {
            var over = !!(laerer && laerer.synlig() && laerer.laererUnder(punkt(e).x, punkt(e).y));
            studie.classList.toggle("over-laerer", over);
        });

        document.addEventListener("keydown", tastatur);
        window.addEventListener("hashchange", function () { if (spil.skaerm === "start") fraLink(); });

        NK.app = {
            spil: spil, tegning: tegning, render: render, hud: hud, vaelgSvaerhed: vaelgSvaerhed,
            startEmne: startEmne, tilStart: tilStart, primaer: primaer, tastatur: tastatur,
            fraLink: fraLink, pauset: pauset, haendelser: haendelser, KLARET: KLARET
        };

        render();
        if (!fraLink()) {
            NK.saetTekst("naeste-skridt", spil.svaerhed ? "Vælg et emne." : "Vælg en sværhedsgrad.");
            if (laerer) laerer.startIntro(false);
        }

        window.requestAnimationFrame(function (ts) {
            sidsteTid = ts;
            window.requestAnimationFrame(loekke);
        });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
}());
