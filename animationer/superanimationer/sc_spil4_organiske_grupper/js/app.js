/* =====================================================================
   app.js - binder spillet, panelet, kortene og Kemichael sammen

   To udgaver i samme mappe: Kemi C (index.html) og Kemi B
   (index.html#b). De har hver deres spil (js/spil.js); kun den aktive
   koerer og tegnes.

   Kortene paa scenen:
     midterkort  Start spil, Pause, Stofgruppemester og Spillet er slut
     fejlkort    et forkert molekyle: gruppen i den rigtige farve
     nykort      en ny stofklasse: et eksempel med gruppen fremhaevet
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Kemi = NK.Kemi;
    var NOEGLE_INTRO = "nk-organiske-intro";

    /* Kemichael kommer ikke af sig selv: foerste gang staar der Start
       praesentation og Nej tak (js/praesentation.js). Esc er det samme
       som Nej tak. Starter eleven et spil, huskes det som Nej tak. */
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
    var udgave = D.STANDARD;
    var laerred = null;
    var laerer = null;
    var sidsteTid = 0;
    var vist = {};
    var nyUr = 0, nyVent = [];
    var laererVent = 0, laererArt = null;
    var topValg = "uge", topData = null, topStatus = "";

    var VIS_SIDSTE = { bredde: 280, binding: 30, skrift: 17, linje: 2.4 };
    var VIS_STOR = { bredde: 380, binding: 44, skrift: 24, linje: 3.4 };
    var VIS_EKSEMPEL = { bredde: 240, binding: 36, skrift: 19, linje: 2.8 };

    function S() {
        if (!spil[udgave]) {
            spil[udgave] = new NK.Spil(udgave);
            spil[udgave].naar = naar(udgave);
        }
        return spil[udgave];
    }

    function U() { return D.UDGAVER[udgave]; }

    /* ----- Udgaven: #b er Kemi B, ellers Kemi C ------------------------------ */
    function udgaveFraHash(h) {
        h = String(h || "").replace(/^#/, "").toLowerCase();
        var m = /^(kemi-?)?([a-z])(-niveau)?$/.exec(h);
        return m && D.UDGAVER[m[2]] ? m[2] : D.STANDARD;
    }

    function visUdgave(id) {
        if (spil[udgave] && id !== udgave && spil[udgave].tilstand === "koerer") {
            spil[udgave].tilstand = "pause";
            spil[udgave].version++;
        }
        udgave = id;
        document.body.setAttribute("data-udgave", id);
        NK.saetTekst("udgave-maerke", U().navn);
        NK.el("toplistekort").hidden = !NK.Topliste.harDelt(id);
        NK.el("mk-navn").hidden = !NK.Topliste.harDelt(id);
        NK.el("navnefelt").value = NK.Topliste.navn();
        NK.Rundvisning.luk();
        lukOverlay();
        skjulNykort();
        byggTeori();
        vist = {};
        topData = null;
        hentTopliste();
        opdaterPanel();
        if (laerer) {
            laerer.stopIntro();
            if (S().tilstand !== "koerer") laerer.startIntro(id, false);
        }
    }

    /* ----- Den store knap ------------------------------------------------------- */
    function primaer() {
        var sp = S();
        if (sp.tilstand === "livTabt") return;
        if (sp.tilstand !== "koerer") {
            if (laerer) { laerer.afvisTilbud(); laerer.stopIntro(); }
            NK.Rundvisning.luk();
            lukOverlay();
        }
        if (sp.tilstand === "klar" || sp.tilstand === "slut") gemNavn();
        sp.primaer();
        NK.Spillyd.vaek();
        slipFokus();
    }

    function forfra() {
        if (laerer) { laerer.afvisTilbud(); laerer.stopIntro(); }
        gemNavn();
        S().start();
        slipFokus();
    }

    function gemNavn() {
        if (NK.Topliste.harDelt(udgave)) NK.Topliste.navn(NK.el("navnefelt").value);
    }

    /* En knap med fokus maa ikke tage Enter fra spillet */
    function slipFokus() {
        var a = document.activeElement;
        if (a && a !== document.body && a.blur && a.id !== "navnefelt") a.blur();
    }

    /* Stofklasserne, reglerne og rundvisningen midt i et spil koster en pause */
    function medPause(fn) {
        var sp = S();
        if (sp.tilstand === "livTabt") return;
        if (sp.tilstand === "koerer" && !sp.pause()) return;
        fn();
    }

    /* ----- Haendelser fra spillet ------------------------------------------------- */
    function naar(id) {
        return function (navn, data) {
            if (id !== udgave) return;
            NK.Spillyd.spil(navn, data);
            if (navn === "start") { nyVent = []; skjulNykort(); if (laerer) laerer.stopIntro(); }
            else if (navn === "nyKlasse") nyVent = nyVent.concat(data.klasser);
            else if (navn === "forkert") { nyVent = []; skjulNykort(); }
            else if (navn === "turboNiveau") blink("niveau");
            else if (navn === "mester") { laererArt = "mester"; laererVent = 0.6; }
            else if (navn === "slut") slutSpil(data);
        };
    }

    function blink(id) {
        var e = NK.el(id).parentNode;
        e.classList.remove("blink");
        void e.offsetWidth;
        e.classList.add("blink");
    }

    function slutSpil(data) {
        var ny = NK.Topliste.gem(udgave, data.point);
        S().nyUge = ny.uge;
        if (data.nyRekord && data.point > 0) { laererArt = "rekord"; laererVent = 1.1; }
        if (NK.Topliste.harDelt(udgave)) {
            topStatus = "Sender …";
            visTopliste();
            NK.Topliste.send(udgave, data.point).then(function (d) {
                topData = d;
                topStatus = d ? "" : "Listen kunne ikke hentes.";
                visTopliste();
            }, function () { topStatus = "Listen kunne ikke hentes."; visTopliste(); });
        }
        vist = {};
    }

    /* ----- Kortet med en ny stofklasse ------------------------------------------------ */
    function eksempel(k) {
        var alle = S().alle;
        for (var i = 0; i < alle.length; i++) if (alle[i].klasse === k) return alle[i];
        return null;
    }

    function visNykort(klasser) {
        var boks = NK.el("nk-klasser");
        boks.innerHTML = klasser.map(function (k) {
            var K = D.KLASSER[k];
            return '<div class="nk-klasse" style="--farve:' + Kemi.klasseFarve(udgave, k) + '">' +
                '<canvas data-klasse="' + k + '"></canvas>' +
                '<b>' + NK.html(K.flertal) + ' <span class="tegn">' + NK.html(K.tegn) + '</span></b>' +
                '<small>' + NK.html(K.kendetegn) + '</small></div>';
        }).join("");
        NK.el("nykort").hidden = false;
        var c = boks.querySelectorAll("canvas");
        for (var i = 0; i < c.length; i++) {
            var k = c[i].getAttribute("data-klasse");
            Kemi.tegnILaerred(c[i], eksempel(k), { bredde: VIS_EKSEMPEL.bredde, binding: VIS_EKSEMPEL.binding, skrift: VIS_EKSEMPEL.skrift, linje: VIS_EKSEMPEL.linje, fremhaev: k });
        }
        var kort = NK.el("nykort");
        kort.classList.remove("ind");
        void kort.offsetWidth;
        kort.classList.add("ind");
        nyUr = 3.5;
    }

    function skjulNykort() {
        nyUr = 0;
        NK.el("nykort").hidden = true;
    }

    /* ----- Kortet ved et forkert molekyle ------------------------------------------------ */
    function hjerter(liv, tabt) {
        var s = "";
        for (var i = 0; i < D.LIV; i++) {
            if (i < liv) s += '<span class="hjerte">♥</span>';
            else if (i === liv && tabt) s += '<span class="hjerte knust">♥</span>';
            else s += '<span class="hjerte tomt">♡</span>';
        }
        return s;
    }

    function opdaterFejlkort(sp) {
        var vis = sp.tilstand === "livTabt" && sp.sidste && !sp.sidste.rigtig;
        var kort = NK.el("fejlkort");
        if (!vis) {
            if (!kort.hidden) kort.hidden = true;
            vist.fejl = null;
            return;
        }
        if (vist.fejl === sp.sidste && !kort.hidden) return;
        kort.hidden = false;
        vist.fejl = sp.sidste;
        NK.el("fk-hjerter").innerHTML = hjerter(sp.liv, true);
        NK.saetTekst("fk-foerste", sp.sidste.tekst.foerste);
        NK.saetTekst("fk-anden", sp.sidste.tekst.anden);
        kort.style.setProperty("--farve", Kemi.lys(Kemi.klasseFarve(udgave, sp.sidste.m.klasse), 0.45));
        Kemi.tegnILaerred(NK.el("fk-laerred"), sp.sidste.m, { bredde: VIS_STOR.bredde, binding: VIS_STOR.binding, skrift: VIS_STOR.skrift, linje: VIS_STOR.linje, fremhaev: sp.sidste.m.klasse });
    }

    /* ----- Kortet midt paa scenen ---------------------------------------------------------- */
    function chip(k) {
        return '<span class="klassechip" style="background-color:' + Kemi.klasseFarve(udgave, k) + '">' + NK.html(D.KLASSER[k].navn) + "</span>";
    }

    var KNAP = { klar: "Start spil", pause: "Fortsæt", mester: "Spil videre", slut: "Spil igen" };

    function opdaterMidterkort(sp) {
        var kort = NK.el("midterkort");
        var skjul = sp.tilstand === "koerer" || sp.tilstand === "livTabt";
        kort.hidden = skjul;
        if (skjul) return;
        kort.classList.toggle("slut", sp.tilstand === "slut" || sp.tilstand === "mester");
        var titel = "", klasser = "", tekst = "";
        var pers = NK.Topliste.personlig(udgave);
        if (sp.tilstand === "klar") {
            titel = "Organiske grupper";
            klasser = sp.niveauDef(0).typer.map(chip).join("");
            tekst = "Træk molekylerne ned i den rigtige spand." + (sp.rekord > 0 ? "<br>Rekord: <b>" + sp.rekord + "</b> point" : "");
        } else if (sp.tilstand === "pause") {
            titel = "Pause";
            tekst = "<b>" + sp.point + "</b> point · niveau " + (sp.niveau + 1) + "<br><small>" + NK.html(D.PAUSE_TEKST) + "</small>";
        } else if (sp.tilstand === "mester") {
            titel = "Stofgruppemester";
            tekst = "Tillykke. Du har " + D.MESTER.toLocaleString("da-DK") + " point og er hermed officielt kåret til <b>Stofgruppemester</b>.<br>Spil videre og jag en endnu højere score.";
        } else if (sp.tilstand === "slut") {
            titel = sp.nyRekord ? "Ny rekord" : "Spillet er slut";
            tekst = "<b>" + sp.point + "</b> point · " + sp.rigtige + " rigtige" +
                (sp.mesterVist ? "<br>Stofgruppemester" : "") +
                "<br><small>Din bedste denne uge: " + pers.uge + " · nogensinde: " + pers.alle + "</small>";
        }
        NK.saetTekst("mk-titel", titel);
        var mk = NK.el("mk-klasser"), mt = NK.el("mk-tekst");
        if (mk.innerHTML !== klasser) mk.innerHTML = klasser;
        if (mt.innerHTML !== tekst) mt.innerHTML = tekst;
        NK.saetTekst("mk-knap", KNAP[sp.tilstand] || "Start spil");
        NK.el("mk-forfra").hidden = sp.tilstand !== "pause" && sp.tilstand !== "mester";
        NK.el("mk-navn").hidden = !NK.Topliste.harDelt(udgave) || (sp.tilstand !== "klar" && sp.tilstand !== "slut");
    }

    /* ----- Panelet ----------------------------------------------------------------------------- */
    function knapTekst(sp) {
        if (sp.tilstand === "koerer" || sp.tilstand === "livTabt") return "Pause (" + sp.pauser + ")";
        return KNAP[sp.tilstand];
    }

    function opdaterSidste(sp) {
        var s = sp.sidste;
        if (vist.sidste === s) return;
        vist.sidste = s;
        var mark = NK.el("sidste-mark");
        if (!s) {
            Kemi.tegnILaerred(NK.el("sidste-laerred"), null, VIS_SIDSTE);
            NK.saetTekst("sidste-navn", "Intet endnu.");
            NK.saetTekst("sidste-klasse", "");
            NK.saetTekst("sidste-mark", "");
            return;
        }
        var K = D.KLASSER[s.m.klasse];
        Kemi.tegnILaerred(NK.el("sidste-laerred"), s.m, { bredde: VIS_SIDSTE.bredde, binding: VIS_SIDSTE.binding, skrift: VIS_SIDSTE.skrift, linje: VIS_SIDSTE.linje, fremhaev: s.m.klasse });
        NK.saetTekst("sidste-navn", NK.stortForbogstav(Kemi.fuldtNavn(s.m)));
        var kl = NK.el("sidste-klasse");
        kl.innerHTML = '<span class="prik" style="background-color:' + Kemi.klasseFarve(udgave, s.m.klasse) + '"></span>' +
            NK.html(K.navn) + ' <span class="tegn">' + NK.html(K.tegn) + "</span>" +
            (s.rigtig ? "" : ' <span class="ikke">ikke ' + NK.html(s.valgt ? D.KLASSER[s.valgt].navn.toLowerCase() : "nået frem") + "</span>");
        mark.textContent = s.rigtig ? "✓ rigtigt" : "✗ forkert";
        mark.className = "taeller " + (s.rigtig ? "godt" : "skidt");
    }

    function opdaterKlasser(sp) {
        var moedt = sp.moedte(), aktive = {};
        sp.spande.forEach(function (s) { aktive[s.klasse] = true; });
        var noegle = JSON.stringify([udgave, moedt, aktive, sp.sorteret, sp.tilstand === "klar"]);
        if (vist.klasser === noegle) return;
        vist.klasser = noegle;
        var n = 0;
        NK.el("klasseliste").innerHTML = U().klasser.map(function (k) {
            var K = D.KLASSER[k], er = !!moedt[k];
            if (er) n++;
            return '<li class="' + (er ? "moedt" : "laast") + (aktive[k] ? " aktiv" : "") + '">' +
                '<span class="prik" style="background-color:' + Kemi.klasseFarve(udgave, k) + '"></span>' +
                '<span class="kn">' + NK.html(K.navn) + "</span>" +
                '<span class="tegn">' + (er ? NK.html(K.tegn) : "niveau " + sp.klasseNiveau(k)) + "</span>" +
                '<span class="antal">' + (sp.sorteret[k] || "") + "</span></li>";
        }).join("");
        NK.saetTekst("klasser-moedt", String(n));
        NK.saetTekst("klasser-i-alt", String(U().klasser.length));
    }

    function opdaterTurbo(sp) {
        var nu = sp.tid;
        var t = sp.turbo.map(function (x) { return Math.max(0, Math.ceil(x.slut - nu)); });
        var tekst = t.map(function (s) { return '<span class="turbochip">🚀 ' + s + " s</span>"; }).join("");
        if (sp.inhibitor) tekst = '<span class="turbochip inhib">❄ ' + Math.max(0, Math.ceil(sp.inhibitorSlut - nu)) + " s</span>" + tekst;
        var ur = NK.el("turbouret");
        if (ur.innerHTML !== tekst) ur.innerHTML = tekst;
    }

    function opdaterPanel() {
        var sp = S();
        opdaterTurbo(sp);
        opdaterFejlkort(sp);
        if (vist.version === sp.version && vist.id === udgave) return;
        vist.version = sp.version;
        vist.id = udgave;
        NK.saetTekst("point", String(sp.point));
        NK.el("liv").innerHTML = hjerter(sp.liv, false);
        NK.saetTekst("niveau", String(sp.niveau + 1));
        NK.saetTekst("rekord", String(sp.rekord));
        NK.saetTekst("spilknap", knapTekst(sp));
        NK.el("spilknap").disabled = sp.tilstand === "livTabt" || (sp.tilstand === "koerer" && sp.pauser <= 0);
        var tb = NK.el("turboknap");
        tb.disabled = sp.tilstand !== "koerer" || sp.turbo.length >= D.TURBO.maks;
        NK.saetTekst("turboknap", "🚀 Turboboost" + (sp.turbo.length ? " ×" + sp.turbo.length : ""));
        NK.el("inhibknap").hidden = !sp.inhibitor;
        opdaterMidterkort(sp);
        opdaterSidste(sp);
        opdaterKlasser(sp);
        var b = sp.linje(), linje = NK.el("statuslinje");
        NK.saetTekst("statuslinje", b.tekst);
        linje.className = "statuslinje " + (b.art || "");
    }

    /* ----- Top 10 (kun B) ------------------------------------------------------------------------- */
    function hentTopliste() {
        if (!NK.Topliste.harDelt(udgave)) return;
        topStatus = "Henter listen …";
        visTopliste();
        var u = udgave;
        NK.Topliste.hent(u).then(function (d) {
            if (u !== udgave) return;
            topData = d;
            topStatus = d ? "" : "Listen kunne ikke hentes.";
            visTopliste();
        }, function () { topStatus = "Listen kunne ikke hentes."; visTopliste(); });
    }

    function visTopliste() {
        if (!NK.Topliste.harDelt(udgave)) return;
        var faner = document.querySelectorAll(".topfane");
        for (var i = 0; i < faner.length; i++) faner[i].classList.toggle("aktiv", faner[i].getAttribute("data-liste") === topValg);
        var liste = topData ? topData[topValg] : [];
        var ol = NK.el("topliste");
        if (topStatus || !liste.length) {
            ol.innerHTML = '<li class="tom">' + NK.html(topStatus || "Ingen endnu.") + "</li>";
        } else {
            ol.innerHTML = liste.map(function (r) {
                return "<li><span>" + NK.html(r.name) + "</span><b>" + Math.floor(r.score) + "</b></li>";
            }).join("");
        }
        var p = NK.Topliste.personlig(udgave);
        NK.saetTekst("topliste-egen", "Din bedste: " + p.uge + " denne uge · " + p.alle + " nogensinde");
        NK.saetTekst("topliste-uge", "uge " + NK.Topliste.ugeNr(new Date()).split("-W")[1]);
    }

    /* ----- Stofklasserne (knappen i toplinjen) ------------------------------------------------------- */
    function byggTeori() {
        NK.el("teorigitter").innerHTML = U().klasser.map(function (k) {
            var K = D.KLASSER[k], m = eksempel(k);
            return '<div class="teoriklasse" style="--farve:' + Kemi.klasseFarve(udgave, k) + '">' +
                '<div class="th"><span class="prik"></span><b>' + NK.html(K.navn) + '</b><span class="tegn">' + NK.html(K.tegn) + "</span></div>" +
                '<canvas data-klasse="' + k + '"></canvas>' +
                '<p class="eks">' + NK.html(m ? Kemi.fuldtNavn(m) : "") + "</p>" +
                "<p>" + NK.html(K.kendetegn) + "</p></div>";
        }).join("");
    }

    function aabnTeori() {
        NK.el("teori").classList.add("vis");
        var c = NK.el("teorigitter").querySelectorAll("canvas");
        for (var i = 0; i < c.length; i++) {
            var k = c[i].getAttribute("data-klasse");
            Kemi.tegnILaerred(c[i], eksempel(k), { bredde: VIS_EKSEMPEL.bredde, binding: 32, skrift: 17, linje: 2.4, fremhaev: k });
        }
    }

    function aabn(id) { NK.el(id).classList.add("vis"); }
    function lukOverlay() {
        var aabne = document.querySelectorAll(".overlay.vis");
        for (var i = 0; i < aabne.length; i++) aabne[i].classList.remove("vis");
    }

    /* ----- Tegneloekken -------------------------------------------------------------------------------- */
    function loekke(tidsstempel) {
        var dt = (tidsstempel - sidsteTid) / 1000;
        sidsteTid = tidsstempel;
        if (!isFinite(dt) || dt < 0) dt = 0;
        if (dt > 0.1) dt = 0.1;
        trin(dt);
        window.requestAnimationFrame(loekke);
    }

    function trin(dt) {
        laerred.tilpas();
        var sp = S();
        if (!NK.Rundvisning.aktiv() && !document.querySelector(".overlay.vis")) sp.opdater(dt);
        /* Flere niveauer paa én gang (katalysatoren): ét kort med dem alle */
        if (nyVent.length) { visNykort(nyVent); nyVent = []; }
        var lay = NK.Tegning.tegn(laerred, sp);
        var noegle = lay.spandY + "," + lay.spandH;
        if (noegle !== vist.spand) {
            vist.spand = noegle;
            var e = NK.el("spand-omraade").style;
            e.left = "0px"; e.width = "100%"; e.top = lay.spandY + "px"; e.height = lay.spandH + "px";
        }
        if (nyUr > 0) { nyUr -= dt; if (nyUr <= 0) skjulNykort(); }
        if (laererVent > 0) {
            laererVent -= dt;
            if (laererVent <= 0 && laerer && sp.tilstand !== "koerer") laerer.laererSlut(laererArt);
        }
        if (laerer) {
            laerer.opdater(dt);
            laerer.laererTegnOver(laerred.ctx);
            var taler = laerer.synlig();
            if (taler !== vist.taler) { vist.taler = taler; NK.el("midterkort").classList.toggle("laerer-taler", taler); }
        }
        opdaterPanel();
    }

    /* ----- Musen og fingeren paa scenen ---------------------------------------------------------------- */
    function enheder(e) {
        var r = laerred.canvas.getBoundingClientRect();
        var px = e.clientX - r.left, py = e.clientY - r.top;
        var u = NK.Tegning.tilEnheder(laerred, S(), px, py);
        return { px: px, py: py, x: u.x, y: u.y };
    }

    function over(sp, p) {
        for (var i = sp.ting.length - 1; i >= 0; i--) if (sp.rammer(sp.ting[i], p.x, p.y)) return sp.ting[i];
        return null;
    }

    /* ----- Tasterne ------------------------------------------------------------------------------------------ */
    function tastatur(e) {
        var sp = S(), k = e.key;
        NK.Spillyd.vaek();
        if (e.target && e.target.id === "navnefelt") {
            if (k === "Enter") { e.preventDefault(); primaer(); }
            return;
        }
        if (k === "Escape") {
            if (document.querySelector(".overlay.vis") || NK.Rundvisning.aktiv()) { lukOverlay(); NK.Rundvisning.luk(); return; }
            if (laerer && laerer.afvisTilbud()) return;
            if (laerer && laerer.stopIntro()) return;
            return;
        }
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis")) {
            if (k === "Enter") { lukOverlay(); NK.Rundvisning.luk(); }
            return;
        }
        if (k === "Enter" || (k === " " && sp.tilstand !== "koerer")) {
            e.preventDefault();
            if (sp.tilstand !== "koerer") primaer();
            return;
        }
        if (k === "p" || k === "P") { if (sp.tilstand === "koerer" || sp.tilstand === "pause") primaer(); return; }
        if (k === "t" || k === "T") { sp.turboboost(); return; }
        if (k === "i" || k === "I") { sp.fjernInhibitor(); return; }
        if (k === "s" || k === "S") { medPause(aabnTeori); return; }
        if (k === "r" || k === "R") { medPause(function () { aabn("regler"); }); return; }
        if ((k === "k" || k === "K") && laerer && sp.tilstand !== "koerer" && sp.tilstand !== "livTabt") { laerer.startIntro(udgave, true); return; }
        if (k === "?" || k === "h" || k === "H") {
            if (NK.Rundvisning.aktiv()) { NK.Rundvisning.luk(); return; }
            medPause(function () { lukOverlay(); NK.Rundvisning.start(udgave); });
            return;
        }
        if (k === "m" || k === "M") { NK.Spillyd.skift(); return; }
    }

    /* ----- Start ------------------------------------------------------------------------------------------------ */
    function start() {
        laerred = new NK.Laerred(NK.el("laerred"));
        if (NK.Sprites) NK.Sprites.start();
        if (NK.Laerer) {
            laerer = new NK.Laerer(laerred);
            NK.laerer = laerer;
            NK.el("spring-over").addEventListener("click", function () { laerer.stopIntro(); });
        }

        NK.el("spilknap").addEventListener("click", primaer);
        NK.el("mk-knap").addEventListener("click", primaer);
        NK.el("mk-forfra").addEventListener("click", forfra);
        NK.el("turboknap").addEventListener("click", function () { S().turboboost(); slipFokus(); });
        NK.el("inhibknap").addEventListener("click", function () { S().fjernInhibitor(); slipFokus(); });
        NK.el("hjaelpknap").addEventListener("click", function () { medPause(function () { lukOverlay(); NK.Rundvisning.start(udgave); }); });
        NK.el("regelknap").addEventListener("click", function () { medPause(function () { aabn("regler"); }); });
        NK.el("teoriknap").addEventListener("click", function () { medPause(aabnTeori); });
        ["regler", "teori"].forEach(function (id) {
            NK.el(id + "-luk").addEventListener("click", lukOverlay);
            NK.el(id).addEventListener("click", function (e) { if (e.target === NK.el(id)) lukOverlay(); });
        });
        NK.el("navnefelt").addEventListener("input", gemNavn);
        var faner = document.querySelectorAll(".topfane");
        for (var f = 0; f < faner.length; f++) {
            faner[f].addEventListener("click", function () { topValg = this.getAttribute("data-liste"); visTopliste(); });
        }

        var lydknap = NK.el("lydknap");
        function visLyd(til) { lydknap.textContent = til ? "🔊" : "🔇"; lydknap.title = til ? "Lyd fra (M)" : "Lyd til (M)"; }
        visLyd(NK.Spillyd.til());
        NK.Spillyd.vedAendring(visLyd);
        lydknap.addEventListener("click", function () { NK.Spillyd.skift(); slipFokus(); });

        document.addEventListener("keydown", tastatur);
        document.addEventListener("pointerdown", function () { NK.Spillyd.vaek(); }, true);

        /* Traek molekylerne; klik paa hjaelperne og paa Kemichael */
        var cv = NK.el("laerred");
        cv.addEventListener("pointerdown", function (e) {
            var p = enheder(e), sp = S();
            if (laerer && laerer.synlig()) {
                if (laerer.laererIntroKlik(p.px, p.py)) return;
                if (laerer.laererKlik(p.px, p.py)) return;
            }
            if (sp.tilstand !== "koerer") return;
            var t = sp.tryk(p.x, p.y);
            if (t && t.art === "mol") {
                e.preventDefault();
                try { cv.setPointerCapture(e.pointerId); } catch (x) { /* ingen capture */ }
                cv.style.cursor = "grabbing";
            }
        });
        cv.addEventListener("pointermove", function (e) {
            var p = enheder(e), sp = S();
            sp.flyt(p.x, p.y);
            if (sp.trukket) return;
            var t = sp.tilstand === "koerer" ? over(sp, p) : null;
            var kemichael = laerer && laerer.synlig() && laerer.laererUnder(p.px, p.py);
            cv.style.cursor = kemichael || (t && t.art !== "mol") ? "pointer" : (t ? "grab" : "default");
        });
        function slip() { S().slipGreb(); cv.style.cursor = "default"; }
        cv.addEventListener("pointerup", slip);
        cv.addEventListener("pointercancel", slip);
        cv.addEventListener("lostpointercapture", slip);

        NK.app = { primaer: primaer, forfra: forfra, trin: trin, tastatur: tastatur, visUdgave: visUdgave,
            spil: function () { return S(); }, udgave: function () { return udgave; }, medPause: medPause, aabnTeori: aabnTeori };
        NK.spil = spil;

        window.addEventListener("hashchange", function () {
            var ny = udgaveFraHash(window.location.hash);
            if (ny !== udgave) visUdgave(ny);
        });
        visUdgave(udgaveFraHash(window.location.hash));

        window.requestAnimationFrame(function (ts) {
            sidsteTid = ts;
            window.requestAnimationFrame(loekke);
        });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
}());
