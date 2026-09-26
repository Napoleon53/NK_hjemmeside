/* =====================================================================
   app.js - binder sværhedsgraderne sammen

   Faneskift, tasterne, knapperne, panelet, lyden og tegneloekken. Hver
   sværhedsgrad har sit eget spil (js/spil.js); kun den aktive koerer og
   tegnes. Skiftes der fane midt i et spil, holder det pause.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Kemi = NK.Kemi;
    var NOEGLE_INTRO = "nk-iontetris-intro";

    /* Kemichael kommer ikke af sig selv: foerste gang staar der Start
       praesentation og Nej tak (js/praesentation.js). Esc er det samme
       som Nej tak. Faneskift skjuler tilbuddet uden at huske det; starter
       eleven et spil, huskes det som Nej tak. */
    if (NK.Laerer) {
        NK.Praesentation.pakInd(NK.Laerer.prototype, {
            tilbud: "tilbud",
            medId: true,
            set: function (id) { return !!NK.hent(NOEGLE_INTRO, {})[id]; },
            husk: function (id) { var s = NK.hent(NOEGLE_INTRO, {}); s[id] = true; NK.gem(NOEGLE_INTRO, s); }
        });
        (function (P) {
            var stop = P.stopIntro;
            P.stopIntro = function () {
                this.skjulTilbud();
                return stop.apply(this, arguments);
            };
        }(NK.Laerer.prototype));
    }

    var spil = {};
    var aktivId = "let";
    var laerred = null;
    var laerer = null;
    var sidsteTid = 0;
    var vist = {};          /* det, panelet sidst viste, pr. spil */
    var omraadeNoegle = "";
    var slutVent = 0, slutArt = null;
    var efterHaardt = false;

    function S() { return spil[aktivId]; }

    /* ----- Faner ----------------------------------------------------------- */
    function visNiveau(id) {
        if (!spil[id]) return;
        if (id !== aktivId) S().pause();
        aktivId = id;
        var knapper = document.querySelectorAll(".faneknap");
        for (var i = 0; i < knapper.length; i++) {
            var valgt = knapper[i].getAttribute("data-niveau") === id;
            knapper[i].classList.toggle("aktiv", valgt);
            knapper[i].setAttribute("aria-selected", valgt ? "true" : "false");
        }
        document.body.setAttribute("data-niveau", id);
        NK.Rundvisning.luk();
        slutVent = 0;
        bygSalte();
        vist = {};
        opdaterPanel();
        if (laerer) {
            laerer.stopIntro();
            if (S().tilstand !== "koerer") laerer.startIntro(id, false);
        }
    }

    /* ----- Den store knap: Start spil, Pause, Fortsæt, Spil igen ---------- */
    function primaer() {
        var sp = S();
        if (sp.tilstand !== "koerer") {
            if (laerer) { laerer.afvisTilbud(); laerer.stopIntro(); }
            NK.Rundvisning.luk();
            lukOverlay();
            slutVent = 0;
        }
        sp.primaer();
        NK.Spillyd.vaek();
        slipFokus();
    }

    function forfra() {
        if (laerer) { laerer.afvisTilbud(); laerer.stopIntro(); }
        slutVent = 0;
        S().start();
        slipFokus();
    }

    /* En knap med fokus maa ikke tage mellemrummet fra spillet */
    function slipFokus() {
        var a = document.activeElement;
        if (a && a !== document.body && a.blur) a.blur();
    }

    function pauseHvisIGang() {
        if (S().tilstand === "koerer") S().pause();
    }

    /* ----- Haendelser fra spillet: lyd og Kemichael ----------------------- */
    function naar(id) {
        return function (navn, data) {
            if (id !== aktivId) return;
            if (navn === "haardt") { efterHaardt = true; NK.Spillyd.spil("haardt"); return; }
            if (navn === "laas") { if (!efterHaardt) NK.Spillyd.spil("laas"); efterHaardt = false; return; }
            if (navn === "vundet") {
                NK.Spillyd.spil("vundet");
                slutArt = data.rekord ? "rekord" : "vundet";
                slutVent = 1.1;
                return;
            }
            if (navn === "slut") {
                NK.Spillyd.spil("slut");
                slutArt = data.andel >= 0.5 ? "mange" : "faa";
                slutVent = 1.1;
                return;
            }
            NK.Spillyd.spil(navn, data);
        };
    }

    /* ----- Panelet og kortet midt paa brættet ------------------------------ */
    function ionChip(id) {
        var i = Kemi.ion(id);
        return '<span class="ionchip" style="background-color:' + i.farve + '">' + NK.html(Kemi.ionTekst(i)) + "</span>";
    }

    function bygSalte() {
        var sp = S(), g = NK.el("saltgitter");
        g.innerHTML = sp.salteListe.map(function (s) {
            return '<div class="salt" data-formel="' + NK.html(s.formel) + '" title="' + NK.html(Kemi.ionligning(s.kat, s.an)) + '">'
                + NK.html(s.formel) + '<span class="antal" hidden></span></div>';
        }).join("");
        NK.saetTekst("salte-i-alt", String(sp.salteListe.length));
    }

    function opdaterSalte(sp) {
        var fundne = 0;
        var liste = NK.el("saltgitter").children;
        for (var i = 0; i < liste.length; i++) {
            var e = liste[i], f = e.getAttribute("data-formel"), n = sp.salte[f] || 0;
            var harFundet = e.classList.contains("fundet");
            if (n > 0) fundne++;
            if (n > 0 && !harFundet) {
                e.classList.add("fundet");
                if (sp.tilstand === "koerer") { e.classList.remove("ny"); void e.offsetWidth; e.classList.add("ny"); }
            } else if (n === 0 && harFundet) e.classList.remove("fundet", "ny");
            var a = e.querySelector(".antal");
            a.hidden = n < 2;
            if (a.textContent !== String(n)) a.textContent = String(n);
        }
        NK.saetTekst("salte-antal", String(fundne));
        var sidste = NK.el("sidste");
        var t = sp.sidste ? sp.sidste.ligning : "Intet salt endnu.";
        NK.saetTekst("sidste", t);
        sidste.classList.toggle("tom", !sp.sidste);
    }

    var KNAP = { klar: "Start spil", koerer: "Pause", pause: "Fortsæt", slut: "Spil igen", vundet: "Spil igen" };
    var tidTekst = NK.Spil.tidTekst;

    function opdaterMidterkort(sp) {
        var kort = NK.el("midterkort");
        kort.hidden = sp.tilstand === "koerer";
        kort.classList.toggle("slut", sp.tilstand === "slut" || sp.tilstand === "vundet");
        var titel = "", ioner = "", tekst = "";
        if (sp.tilstand === "klar") {
            titel = sp.N.navn;
            ioner = sp.N.kat.concat(sp.N.an).map(ionChip).join("");
            tekst = "Lav alle " + sp.salteListe.length + " salte." + (sp.rekord > 0 ? " Rekord: <b>" + tidTekst(sp.rekord) + "</b>" : "");
        } else if (sp.tilstand === "pause") {
            titel = "Pause";
            tekst = "<b>" + sp.fundne() + "</b> af " + sp.salteListe.length + " salte · " + tidTekst(sp.tid);
        } else if (sp.tilstand === "slut") {
            titel = "Brættet er fuldt";
            tekst = "<b>" + sp.fundne() + "</b> af " + sp.salteListe.length + " salte · " + tidTekst(sp.tid);
        } else if (sp.tilstand === "vundet") {
            titel = sp.nyRekord ? "Alle salte. Ny rekord" : "Alle salte";
            tekst = "Tid: <b>" + tidTekst(sp.tid) + "</b> · " + sp.raekker + " rækker";
        }
        NK.saetTekst("mk-titel", titel);
        var mi = NK.el("mk-ioner"), mt = NK.el("mk-tekst");
        if (mi.innerHTML !== ioner) mi.innerHTML = ioner;
        if (mt.innerHTML !== tekst) mt.innerHTML = tekst;
        NK.saetTekst("mk-knap", KNAP[sp.tilstand]);
        NK.el("mk-forfra").hidden = sp.tilstand !== "pause";
    }

    function opdaterPanel() {
        var sp = S();
        if (vist.version === sp.version && vist.id === aktivId) return;
        vist.version = sp.version;
        vist.id = aktivId;
        NK.saetTekst("tid", tidTekst(sp.tid));
        NK.saetTekst("raekker", String(sp.raekker));
        NK.saetTekst("niveau", String(sp.niveau));
        NK.saetTekst("rekord", sp.rekord > 0 ? tidTekst(sp.rekord) : "ingen");
        NK.saetTekst("spilknap", KNAP[sp.tilstand]);
        opdaterMidterkort(sp);
        opdaterSalte(sp);
        var b = sp.besked(), linje = NK.el("statuslinje");
        NK.saetTekst("statuslinje", b.tekst);
        linje.classList.toggle("hint", !!b.hint);
        linje.classList.toggle("haendelse", !!b.haendelse && !b.skidt);
        linje.classList.toggle("skidt", !!b.skidt);
    }

    /* De usynlige felter over brættet, gem og koeen foelger layoutet */
    function placerOmraader(lay) {
        var n = [lay.x0, lay.y0, lay.bw, lay.bh, lay.gem.x, lay.naeste.x, lay.naeste.h].join(",");
        if (n === omraadeNoegle) return;
        omraadeNoegle = n;
        function saet(id, x, y, b, h) {
            var e = NK.el(id).style;
            e.left = x + "px"; e.top = y + "px"; e.width = b + "px"; e.height = h + "px";
        }
        saet("braet-omraade", lay.x0 - 3, lay.y0 - 3, lay.bw + 6, lay.bh + 6);
        saet("gem-omraade", lay.gem.x, lay.gem.y, lay.gem.b, lay.gem.h);
        saet("naeste-omraade", lay.naeste.x, lay.naeste.y, lay.naeste.b, lay.naeste.h);
    }

    /* ----- Tegneloekken ------------------------------------------------------ */
    function loekke(tidsstempel) {
        var dt = (tidsstempel - sidsteTid) / 1000;
        sidsteTid = tidsstempel;
        if (!isFinite(dt) || dt < 0) dt = 0;
        if (dt > 0.1) dt = 0.1;
        trin(dt);
        window.requestAnimationFrame(loekke);
    }

    /* Ét skridt: spillet, tegningen, Kemichael og panelet */
    function trin(dt) {
        laerred.tilpas();
        var sp = S();
        sp.opdater(dt);
        var lay = NK.Tegning.tegn(laerred, sp);
        placerOmraader(lay);
        if (slutVent > 0) {
            slutVent -= dt;
            if (slutVent <= 0 && laerer && (sp.tilstand === "slut" || sp.tilstand === "vundet")) laerer.laererSlut(slutArt);
        }
        if (laerer) {
            laerer.opdater(dt);
            laerer.laererTegnOver(laerred.ctx);
            /* Kortet midt paa brættet rykker ned, mens han taler */
            var taler = laerer.synlig();
            if (taler !== vist.taler) { vist.taler = taler; NK.el("midterkort").classList.toggle("laerer-taler", taler); }
        }
        opdaterPanel();
    }

    /* ----- Tasterne ------------------------------------------------------------ */
    var TASTER = {
        ArrowLeft: "venstre", ArrowRight: "hoejre", ArrowDown: "ned", ArrowUp: "drej",
        x: "drej", X: "drej", z: "drejMod", Z: "drejMod", " ": "slip",
        c: "gem", C: "gem", Shift: "gem"
    };

    function aabn(id) { NK.el(id).classList.add("vis"); }
    function lukOverlay() {
        var aabne = document.querySelectorAll(".overlay.vis");
        for (var i = 0; i < aabne.length; i++) aabne[i].classList.remove("vis");
    }

    function tastatur(e) {
        var sp = S(), k = e.key;
        NK.Spillyd.vaek();
        if (k === "Escape") {
            if (document.querySelector(".overlay.vis") || NK.Rundvisning.aktiv()) { lukOverlay(); NK.Rundvisning.luk(); return; }
            if (laerer && laerer.afvisTilbud()) return;
            if (laerer && laerer.stopIntro()) return;
            pauseHvisIGang();
            return;
        }
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis")) return;
        var h = TASTER[k];
        if (sp.tilstand === "koerer") {
            if (h) {
                e.preventDefault();
                if (!e.repeat) sp.tryk(h);
                return;
            }
            if (k === "p" || k === "P" || k === "Enter") { e.preventDefault(); sp.pause(); return; }
        } else {
            if (k === "Enter" || k === " " || ((k === "p" || k === "P") && sp.tilstand === "pause")) {
                e.preventDefault();
                primaer();
                return;
            }
            if (h) e.preventDefault();
        }
        if (k >= "1" && k <= "3") { visNiveau(D.NIVEAU_ORDEN[parseInt(k, 10) - 1]); return; }
        if ((k === "k" || k === "K") && laerer && sp.tilstand !== "koerer") { laerer.startIntro(aktivId, true); return; }
        if (k === "?" || k === "h" || k === "H") {
            pauseHvisIGang();
            if (NK.Rundvisning.aktiv()) NK.Rundvisning.luk();
            else { lukOverlay(); NK.Rundvisning.start(aktivId); }
            return;
        }
        if (k === "m" || k === "M") { NK.Spillyd.skift(); return; }
    }

    function tastOp(e) {
        var h = TASTER[e.key];
        if (h === "venstre" || h === "hoejre" || h === "ned") S().slip(h);
    }

    /* ----- Start --------------------------------------------------------------- */
    function start() {
        laerred = new NK.Laerred(NK.el("laerred"));
        if (NK.Sprites) NK.Sprites.start();
        if (NK.Laerer) {
            laerer = new NK.Laerer(laerred);
            NK.laerer = laerer;
            NK.el("spring-over").addEventListener("click", function () { laerer.stopIntro(); });
        }
        D.NIVEAU_ORDEN.forEach(function (id) {
            spil[id] = new NK.Spil(id);
            spil[id].naar = naar(id);
        });

        var knapper = document.querySelectorAll(".faneknap");
        for (var i = 0; i < knapper.length; i++) {
            (function (k) {
                k.addEventListener("click", function () { visNiveau(k.getAttribute("data-niveau")); slipFokus(); });
            }(knapper[i]));
        }

        NK.el("spilknap").addEventListener("click", primaer);
        NK.el("mk-knap").addEventListener("click", primaer);
        NK.el("mk-forfra").addEventListener("click", forfra);
        NK.el("hjaelpknap").addEventListener("click", function () { pauseHvisIGang(); lukOverlay(); NK.Rundvisning.start(aktivId); });
        NK.el("regelknap").addEventListener("click", function () { pauseHvisIGang(); aabn("regler"); });
        NK.el("regler-luk").addEventListener("click", lukOverlay);
        NK.el("regler").addEventListener("click", function (e) { if (e.target === NK.el("regler")) lukOverlay(); });

        var lydknap = NK.el("lydknap");
        function visLyd(til) { lydknap.textContent = til ? "🔊" : "🔇"; lydknap.title = til ? "Lyd fra (M)" : "Lyd til (M)"; }
        visLyd(NK.Spillyd.til());
        NK.Spillyd.vedAendring(visLyd);
        lydknap.addEventListener("click", function () { NK.Spillyd.skift(); slipFokus(); });

        document.addEventListener("keydown", tastatur);
        document.addEventListener("keyup", tastOp);
        document.addEventListener("pointerdown", function () { NK.Spillyd.vaek(); }, true);

        /* Spillet holder pause, naar vinduet mister fokus */
        window.addEventListener("blur", pauseHvisIGang);
        document.addEventListener("visibilitychange", function () { if (document.hidden) pauseHvisIGang(); });

        /* Knapperne til skaerme uden tastatur */
        var touch = NK.el("touch").querySelectorAll("button");
        for (var t = 0; t < touch.length; t++) {
            (function (b) {
                var h = b.getAttribute("data-h"), hold = b.hasAttribute("data-hold");
                b.addEventListener("pointerdown", function (e) {
                    e.preventDefault();
                    if (S().tilstand !== "koerer") return;
                    S().tryk(h);
                });
                if (hold) {
                    ["pointerup", "pointerleave", "pointercancel"].forEach(function (n) {
                        b.addEventListener(n, function () { S().slip(h); });
                    });
                }
            }(touch[t]));
        }

        /* Klik paa Kemichael */
        var cv = NK.el("laerred");
        function punkt(e) {
            var r = cv.getBoundingClientRect();
            return { x: e.clientX - r.left, y: e.clientY - r.top };
        }
        cv.addEventListener("click", function (e) {
            var p = punkt(e);
            if (laerer && laerer.synlig()) {
                if (laerer.laererIntroKlik(p.x, p.y)) return;
                laerer.laererKlik(p.x, p.y);
            }
        });
        cv.addEventListener("pointermove", function (e) {
            var p = punkt(e);
            cv.style.cursor = laerer && laerer.synlig() && laerer.laererUnder(p.x, p.y) ? "pointer" : "default";
        });

        NK.spil = spil;
        NK.app = { visNiveau: visNiveau, primaer: primaer, forfra: forfra, trin: trin, tastatur: tastatur, tastOp: tastOp,
            aktiv: function () { return aktivId; } };

        /* Direkte link til en sværhedsgrad: index.html#middel */
        var oenske = (window.location.hash || "").replace(/^#/, "").toLowerCase();
        oenske = { "svær": "svaer", "sv%c3%a6r": "svaer" }[oenske] || oenske;
        aktivId = spil[oenske] ? oenske : "let";
        visNiveau(aktivId);

        window.requestAnimationFrame(function (ts) {
            sidsteTid = ts;
            window.requestAnimationFrame(loekke);
        });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
}());
