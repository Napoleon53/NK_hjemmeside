/* =====================================================================
   app.js - binder sværhedsgraderne sammen

   Faneskift (Let, Middel, Svær), tastaturgenveje, teorien, musen på
   vægten og tegneløkken. Vægten og Kemichael deler ét lærred over
   arbejdsbordet. Samme opbygning som sc2.4.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    /* Kemichael kommer ikke af sig selv: første gang står der Start
       præsentation og Nej tak (js/praesentation.js). Esc er det samme
       som Nej tak. Faneskift og Spring over (stopIntro) skjuler
       tilbuddet uden at huske det. */
    if (NK.Laerer) {
        NK.Praesentation.pakInd(NK.Laerer.prototype, {
            tilbud: "tilbud",
            medId: true,
            set: function (id) { return !!NK.hent("nk-sc8.4-intro", {})[id]; },
            husk: function (id) { var s = NK.hent("nk-sc8.4-intro", {}); s[id] = true; NK.gem("nk-sc8.4-intro", s); }
        });
        (function (P) {
            var stop = P.stopIntro;
            P.stopIntro = function () {
                this.skjulTilbud();
                return stop.apply(this, arguments);
            };
        }(NK.Laerer.prototype));
    }

    var niveauer = {};
    var aktivId = "let";
    var laerred = null, vaegt = null, laerer = null;
    var sidsteTid = 0;

    function visNiveau(id) {
        if (!niveauer[id]) return;
        aktivId = id;
        var knapper = document.querySelectorAll(".faneknap");
        for (var i = 0; i < knapper.length; i++) {
            var valgt = knapper[i].getAttribute("data-niveau") === id;
            knapper[i].classList.toggle("aktiv", valgt);
            knapper[i].setAttribute("aria-selected", valgt ? "true" : "false");
        }
        document.body.setAttribute("data-niveau", id);
        NK.Rundvisning.luk();
        NK.Niveau.aktiver(niveauer[id]);
        if (laerer) {
            laerer.stopIntro();
            laerer.startIntro(id, false);
        }
    }

    function aabn(id) { NK.el(id).classList.add("vis"); }
    function lukOverlay() {
        var aabne = document.querySelectorAll(".overlay.vis");
        for (var i = 0; i < aabne.length; i++) aabne[i].classList.remove("vis");
    }

    function loekke(tidsstempel) {
        var dt = (tidsstempel - sidsteTid) / 1000;
        sidsteTid = tidsstempel;
        if (!isFinite(dt) || dt < 0) dt = 0;
        if (dt > 0.1) dt = 0.1;
        laerred.tilpas();
        vaegt.opdater(dt, niveauer[aktivId], laerred.b, laerred.h);
        vaegt.tegn(laerred, laerer ? laerer.g.kaffekop : null);
        if (laerer) {
            laerer.opdater(dt);
            laerer.laererTegnOver(laerred.ctx);
        }
        window.requestAnimationFrame(loekke);
    }

    function tastatur(e) {
        if (e.key === "Escape") {
            lukOverlay();
            NK.Rundvisning.luk();
            if (laerer && !laerer.afvisTilbud()) laerer.stopIntro();
            return;
        }
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key >= "1" && e.key <= "3") { visNiveau(D.NIVEAU_RAEKKE[parseInt(e.key, 10) - 1]); return; }
        if ((e.key === "k" || e.key === "K") && laerer) { laerer.startIntro(aktivId, true); return; }
        if (e.key === "?" || e.key === "h" || e.key === "H") {
            if (NK.Rundvisning.aktiv()) NK.Rundvisning.luk();
            else { lukOverlay(); NK.Rundvisning.start(aktivId); }
            return;
        }
        if (NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis")) return;
        if (e.key === "t" || e.key === "T") { aabn("teori"); return; }
        if (e.key === "r" || e.key === "R") { niveauer[aktivId].forfra(); return; }
        if (e.key === "Enter") {
            var niv = niveauer[aktivId];
            if (e.target && e.target.tagName === "BUTTON") return;
            if (niv.faerdig) niv.knap(); else niv.tjek();
        }
    }

    /* Et klik på vægten, der ikke kan bruges nu, får et svar */
    function vaegtBesked(niv) {
        var d = niv.vaegtData();
        if (d.fase === 0) return "Vægten tæller elektronerne, når du ved, hvad der oxideres og reduceres.";
        if (d.fase === 1) return "Find først, hvor mange elektroner ét atom afgiver og optager.";
        if (d.fase === 3) return "Brug plus og minus på bordkanten, eller skriv koefficienterne på tavlen.";
        return "Elektronerne går lige op: " + d.v.antal * d.v.ePr + " e⁻ afgivet og " + d.h.antal * d.h.ePr + " e⁻ optaget.";
    }

    function start() {
        NK.Niveau.init();
        laerred = new NK.Laerred(NK.el("laerred"));
        vaegt = new NK.Vaegt();
        NK.vaegt = vaegt;
        if (NK.Sprites) NK.Sprites.start();
        if (NK.Laerer) {
            laerer = new NK.Laerer(laerred, vaegt);
            NK.laerer = laerer;
            NK.el("spring-over").addEventListener("click", function () { laerer.stopIntro(); });
        }
        D.NIVEAU_RAEKKE.forEach(function (id) { niveauer[id] = new NK.Niveau(id); });
        NK.niveauer = niveauer;        /* så de kan pilles ved fra konsollen og selvtesten */
        NK.visNiveau = visNiveau;

        var knapper = document.querySelectorAll(".faneknap");
        for (var i = 0; i < knapper.length; i++) {
            (function (k) {
                k.addEventListener("click", function () { visNiveau(k.getAttribute("data-niveau")); });
            }(knapper[i]));
        }

        NK.el("hjaelpknap").addEventListener("click", function () { lukOverlay(); NK.Rundvisning.start(aktivId); });
        NK.el("teoriknap").addEventListener("click", function () { aabn("teori"); });
        NK.el("teori-luk").addEventListener("click", lukOverlay);
        NK.el("teori").addEventListener("click", function (e) { if (e.target === NK.el("teori")) lukOverlay(); });
        document.addEventListener("keydown", tastatur);

        /* Musen på lærredet: Kemichael, koppen, plus og minus, skålene */
        var cv = NK.el("laerred");
        function punkt(e) {
            var r = cv.getBoundingClientRect();
            return { x: e.clientX - r.left, y: e.clientY - r.top };
        }
        cv.addEventListener("click", function (e) {
            var p = punkt(e), niv = niveauer[aktivId];
            if (laerer && laerer.laererIntroKlik(p.x, p.y)) return;
            if (laerer && laerer.laererKlik(p.x, p.y)) return;
            if (laerer && vaegt.kopVed(p.x, p.y, laerer.g.kaffekop)) { laerer.klikKop(); return; }
            var k = vaegt.knapVed(p.x, p.y);
            if (k) { niv.vaegtKlik(k.side, k.d); return; }
            if (vaegt.skaalVed(p.x, p.y) && !niv.faerdig) {
                niv.besked = { tekst: vaegtBesked(niv), klasse: "" };
                NK.el("besked").textContent = niv.besked.tekst;
                NK.el("besked").className = "besked";
            }
        });
        cv.addEventListener("pointermove", function (e) {
            var p = punkt(e);
            var k = vaegt.knapVed(p.x, p.y);
            vaegt.overKnap = k;
            var over = k || (laerer && (laerer.laererUnder(p.x, p.y) || vaegt.kopVed(p.x, p.y, laerer.g.kaffekop))) || vaegt.skaalVed(p.x, p.y);
            cv.style.cursor = over ? "pointer" : "default";
        });
        cv.addEventListener("pointerleave", function () { vaegt.overKnap = null; });

        /* Direkte link til en sværhedsgrad: index.html#svaer */
        var oenske = (window.location.hash || "").replace(/^#/, "").toLowerCase();
        oenske = { "svær": "svaer" }[oenske] || oenske;
        visNiveau(niveauer[oenske] ? oenske : "let");

        window.requestAnimationFrame(function (ts) {
            sidsteTid = ts;
            window.requestAnimationFrame(loekke);
        });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
}());
