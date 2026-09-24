/* =====================================================================
   app.js - forloebet, knapperne og tastaturet

   render() tegner alt ud fra tilstanden i NK.Spil og det lille ui-objekt
   herunder (det, der ikke skal gemmes: titelskaermen, uret, toss-uppens
   ur og om en animation koerer lige nu). Hver handling aendrer
   tilstanden og kalder render().

   Mens hjulet drejer, eller felter lyser op, er ui.laast sand, og
   knapperne venter. Den gule knap er det naturlige naeste trin, og
   Mellemrum trykker paa den. NK.tempo < 1 goer alt hurtigere (selvtest).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    /* Kemichael kommer ikke af sig selv: første gang står der Start
       præsentation og Nej tak (js/praesentation.js). Esc er det samme
       som Nej tak. Går spillet i gang (stopIntro), huskes det også. */
    if (NK.Laerer) {
        NK.Praesentation.pakInd(NK.Laerer.prototype, {
            tilbud: "tilbud",
            medId: true,
            set: function (id) { return !!NK.hent("nk-lykkehjul-intro", {})[id]; },
            husk: function (id) { var s = NK.hent("nk-lykkehjul-intro", {}); s[id] = true; NK.gem("nk-lykkehjul-intro", s); }
        });
        (function (P) {
            var stop = P.stopIntro;
            P.stopIntro = function () {
                this.afvisTilbud();
                return stop.apply(this, arguments);
            };
        }(NK.Laerer.prototype));
    }

    var D = NK.Data;
    var S = NK.Spil;
    var V = NK.Visning;
    var B = NK.Bibliotek;
    var Lyd = NK.Lydbank;
    var el = NK.el;

    NK.tempo = NK.tempo || 1;

    var ui = {
        titel: true,
        navne: D.HOLD.slice(),
        startSikker: 0,
        laast: false,
        tossupUr: 0,
        ur: null,
        noegle: null,
        tvungetFelt: undefined
    };
    var laerred = null;
    var laerer = null;
    var sidsteTid = 0;
    var tema = null;

    function T() { return S.T(); }
    function G() { return S.aktuel(); }
    function kr(v) { return NK.beloeb(v, "kr."); }
    function navn(h) { return T().hold[h] ? T().hold[h].navn : ""; }
    function hnavn(h) { return NK.html(navn(h)); }
    function sek(s) { return s * 1000 * NK.tempo; }

    /* ----- Lyd ----------------------------------------------------------- */
    function spilTema() { tema = Lyd.spil("tema"); }
    function stopTema() { Lyd.stop("tema", 0.8); tema = null; }

    function foersteKlik() {
        Lyd.laas();
        if (tema && tema.blokeret && ui.titel) spilTema();
        document.removeEventListener("pointerdown", foersteKlik, true);
        document.removeEventListener("keydown", foersteKlik, true);
    }

    function skiftLyd() {
        Lyd.saetSlukket(!Lyd.slukket());
        topknapper();
    }

    function ding() { Lyd.spil("bogstav"); }

    /* ----- Quizzen ------------------------------------------------------- */
    function stopAlt() {
        clearTimeout(ui.tossupUr);
        ui.tossupUr = 0;
        ui.ur = null;
        V.ur(false);
        V.stopAnimation();
        V.skjulHjul();
        ui.laast = false;
    }

    function indlaesQuiz(noegle) {
        stopAlt();
        var q = B.quiz(noegle);
        if (!q) { noegle = "i:" + D.STANDARD; q = B.quiz(noegle); }
        ui.noegle = noegle;
        B.vaelg(noegle);
        S.init(q);
        S.efterGenindlaesning();
        V.visGaade(null);
        titelFraSpil();
    }

    /* ----- Titelskaermen ------------------------------------------------- */
    function titelFraSpil() {
        var t = T();
        ui.navne = t ? t.hold.map(function (x) { return x.navn; }) : D.HOLD.slice();
    }

    function tegnQuizvalg() {
        var sel = el("quizvalg");
        var liste = B.liste();
        var noegle = JSON.stringify(liste) + ui.noegle;
        if (sel.getAttribute("data-noegle") === noegle) return;
        sel.setAttribute("data-noegle", noegle);
        var ind = liste.filter(function (x) { return x.indbygget; });
        var egne = liste.filter(function (x) { return !x.indbygget; });
        function valg(x) {
            return '<option value="' + x.noegle + '"' + (x.noegle === ui.noegle ? " selected" : "") + ">" + NK.html(x.navn) + "</option>";
        }
        sel.innerHTML = '<optgroup label="Indbyggede">' + ind.map(valg).join("") + "</optgroup>"
            + (egne.length ? '<optgroup label="Mine quizzer">' + egne.map(valg).join("") + "</optgroup>" : "");
        sel.value = ui.noegle;
    }

    function tegnTitel() {
        tegnQuizvalg();
        var q = S.Q();
        var toss = q.gaader.filter(function (g) { return g.type === "tossup"; }).length;
        NK.saetTekst("titel-quiz", toss + (toss === 1 ? " toss-up, " : " toss-ups, ") + (q.gaader.length - toss)
            + (q.gaader.length - toss === 1 ? " runde" : " runder") + (q.final ? " og en finale" : ""));
        NK.saetTekst("hold-antal", String(ui.navne.length));
        var rod = el("holdnavne");
        if (rod.children.length !== ui.navne.length) {
            rod.innerHTML = "";
            ui.navne.forEach(function (n, h) {
                var i = document.createElement("input");
                i.type = "text";
                i.value = n;
                i.maxLength = 22;
                i.spellcheck = false;
                i.className = "farve-" + D.HOLDFARVER[h];
                i.setAttribute("data-h", h);
                i.setAttribute("aria-label", "Navn på hold " + (h + 1));
                rod.appendChild(i);
            });
        }
        el("hold-minus").disabled = ui.navne.length <= D.MIN_HOLD;
        el("hold-plus").disabled = ui.navne.length >= D.MAKS_HOLD;
        var igang = !!T();
        el("fortsaet").hidden = !igang;
        el("start").textContent = ui.startSikker ? "Sikker? Start forfra" : (igang ? "Nyt spil" : "Start spillet");
        el("start").classList.toggle("advarsel", !!ui.startSikker);
        NK.saetTekst("lydkilde", Lyd.kilde() === "originale"
            ? "Lyd: de originale lyde fra denne computer"
            : "Lyd: spillets egne lyde");
    }

    function visTitel() {
        stopAlt();
        Lyd.stopAlle(0.3);
        titelFraSpil();
        ui.titel = true;
        ui.startSikker = 0;
        lukOverlay();
        render();
        spilTema();
        if (laerer) laerer.startIntro("titel", false);
    }

    function forladTitel() {
        ui.titel = false;
        ui.startSikker = 0;
        stopTema();
        if (laerer) laerer.stopIntro();
    }

    function startSpil() {
        var t = T();
        var igang = t && Object.keys(t.faerdige).length > 0 && !t.slut;
        if (igang && !ui.startSikker) {
            ui.startSikker = setTimeout(function () { ui.startSikker = 0; tegnTitel(); }, 3500);
            tegnTitel();
            return;
        }
        clearTimeout(ui.startSikker);
        S.nyt(ui.navne);
        forladTitel();
        startGaade(0);
    }

    function fortsaet() {
        if (!T()) return;
        S.saetHold(ui.navne);
        forladTitel();
        if (T().g) V.visGaade(G());
        else if (!T().slut) { startGaade(Math.max(0, S.naeste())); return; }
        render();
    }

    function skiftQuiz(noegle) {
        indlaesQuiz(noegle);
        ui.startSikker = 0;
        render();
    }

    /* ----- Gaaderne ------------------------------------------------------ */
    function startGaade(nr) {
        stopAlt();
        Lyd.stop("tossup", 0.3);
        if (!S.start(nr)) return;
        lukOverlay();
        V.visGaade(G());
        if (T().g.type === "final") {
            Lyd.spil("kategori");
            render();
            return;
        }
        ui.laast = true;
        render();
        Lyd.spil("kategori");
        V.taend(function () { ui.laast = false; render(); });
    }

    function naesteGaade() {
        var nr = S.naeste();
        if (nr < 0) tilResultat();
        else startGaade(nr);
    }

    function naesteTekst() {
        var nr = S.naeste();
        if (nr < 0) return "Resultat →";
        if (nr === S.finalNr()) return "Finalen →";
        return "Næste gåde →";
    }

    function fortryd() {
        if (!S.kanFortryde() || ui.titel) return;
        stopAlt();
        Lyd.stop("tossup", 0.2);
        if (S.fortryd()) {
            if (T().g.fase === "koerer") T().g.fase = "pause";
            V.opdaterTavle();
            render();
        }
    }

    /* ----- En runde med hjulet ------------------------------------------ */
    function drejHjul() {
        if (ui.laast || !S.kanDreje()) return;
        var h = T().g.tur;
        ui.laast = true;
        var H = V.visHjul("hjul", D.HOLDFARVER[h], navn(h) + " drejer");
        render();
        Lyd.spil("hjul");
        var felt = ui.tvungetFelt;
        ui.tvungetFelt = undefined;
        H.drej({ tid: D.HJUL_TID, tempo: NK.tempo, felt: felt, tik: Lyd.tik }, function (felt) {
            Lyd.stop("hjul", 0.25);
            var type = S.drejet(felt);
            var f = D.HJUL[felt];
            if (type === "fallit") {
                Lyd.spil("fallit");
                V.hjulBesked("FALLIT", "fallit");
                V.pop(h, "FALLIT", "minus");
            } else if (type === "mist") {
                Lyd.spil("forkert");
                V.hjulBesked("MIST TUR", "mist");
            } else {
                V.hjulBesked(kr(f.v), "vaerdi");
            }
            setTimeout(function () {
                V.skjulHjul();
                ui.laast = false;
                render();
            }, sek(type === "vaerdi" ? 1.3 : 2.2));
        });
    }

    function vaelgBogstav(b) {
        if (ui.laast || ui.titel || !T() || !T().g || !S.kanVaelge(b)) return;
        var r = S.vaelg(b);
        if (!r) return;
        if (r.valg) { render(); return; }
        if (r.antal) {
            ui.laast = true;
            render();
            V.afslor(r.felter, { ding: ding }, function () {
                ui.laast = false;
                if (r.point) V.pop(r.hold, "+" + kr(r.point), "plus");
                render();
            });
        } else {
            Lyd.spil("forkert");
            V.pop(r.hold, "Intet " + b, "minus");
            render();
        }
    }

    function koebVokal() {
        if (ui.laast) return;
        var h = T().g.tur;
        if (!S.koebVokal()) return;
        V.pop(h, "−" + kr(D.VOKALPRIS), "minus");
        render();
    }

    function loes() {
        if (ui.laast) return;
        if (S.loes()) render();
    }

    function loesSvar(rigtigt) {
        if (ui.laast || T().g.fase !== "loes") return;
        var skjulte = S.skjulteFelter(), h = T().g.tur;
        if (!S.loesSvar(rigtigt)) return;
        if (rigtigt) {
            Lyd.spil("loest");
            ui.laast = true;
            render();
            V.afslor(skjulte, { hurtig: true }, function () {
                ui.laast = false;
                V.pop(h, "+" + kr(T().g.gevinst), "plus");
                render();
            });
        } else {
            Lyd.spil("forkert");
            V.pop(h, "Forkert", "minus");
            render();
        }
    }

    function giveTur(h) {
        if (ui.laast || !T() || !T().g) return;
        if (S.giveTur(h)) render();
    }

    function naesteHold() {
        if (ui.laast) return;
        if (S.naesteHold()) render();
    }

    /* ----- Toss-up ------------------------------------------------------- */
    function tossupLoekke() {
        clearTimeout(ui.tossupUr);
        ui.tossupUr = setTimeout(function () {
            var g = T() && T().g;
            if (!g || g.type !== "tossup" || g.fase !== "koerer") return;
            var i = S.tossupAfslor();
            if (i >= 0) V.afslor([i], { hurtig: true });
            if (T().g.fase === "koerer") tossupLoekke();
            else Lyd.stop("tossup", 1.2);
            render();
        }, sek(D.TOSSUP_INTERVAL));
    }

    function tossupStart() {
        if (ui.laast || !S.tossupStart()) return;
        if (T().g.fase === "koerer") {
            Lyd.fortsaet("tossup");
            tossupLoekke();
        }
        render();
    }

    function tossupPause() {
        if (!S.tossupPause()) return;
        clearTimeout(ui.tossupUr);
        Lyd.pause("tossup");
        render();
    }

    function tossupSvarer(h) {
        if (ui.laast || !S.tossupSvarer(h)) return;
        clearTimeout(ui.tossupUr);
        Lyd.pause("tossup");
        render();
    }

    function tossupSvar(rigtigt) {
        var g = T().g;
        if (g.fase !== "svarer") return;
        var skjulte = S.skjulteFelter(), h = g.svarer;
        if (!S.tossupSvar(rigtigt)) return;
        if (rigtigt) {
            Lyd.stop("tossup", 0.3);
            Lyd.spil("tossuploest");
            V.afslor(skjulte, { hurtig: true });
            V.pop(h, "+" + kr(T().g.gevinst), "plus");
        } else {
            Lyd.spil("forkert");
            V.pop(h, "Forkert", "minus");
            if (T().g.fase === "koerer") {
                ui.tossupUr = setTimeout(function () {
                    if (T().g.fase !== "koerer") return;
                    Lyd.fortsaet("tossup");
                    tossupLoekke();
                }, sek(0.9));
            }
        }
        render();
    }

    function tossupFortrydSvarer() {
        if (S.tossupFortryd()) render();
    }

    function tossupIngen() {
        var skjulte = S.skjulteFelter();
        if (!S.tossupIngen()) return;
        clearTimeout(ui.tossupUr);
        Lyd.stop("tossup", 0.5);
        V.afslor(skjulte, { hurtig: true });
        render();
    }

    /* ----- Finalen ------------------------------------------------------- */
    function finalDrej() {
        var g = T().g;
        if (ui.laast || g.type !== "final" || g.fase !== "hold") return;
        var h = g.final.hold;
        ui.laast = true;
        var H = V.visHjul("praemie", D.HOLDFARVER[h], navn(h) + " drejer præmiehjulet");
        render();
        Lyd.spil("hjul");
        H.drej({ tid: D.HJUL_TID, tempo: NK.tempo, tik: Lyd.tik }, function () {
            Lyd.stop("hjul", 0.25);
            S.finalPraemie(NK.tilfaeldig(D.PRAEMIER));
            ding();
            V.hjulBesked("Kuverten er valgt", "kuvert");
            setTimeout(function () {
                V.skjulHjul();
                render();
                Lyd.spil("kategori");
                V.taend(function () { ui.laast = false; render(); });
            }, sek(1.6));
        });
    }

    function afslorOgVent(felter) {
        ui.laast = true;
        render();
        V.afslor(felter, { ding: ding }, function () { ui.laast = false; render(); });
    }

    function finalRSTLNE() {
        if (ui.laast) return;
        var felter = S.finalRSTLNE();
        if (felter) afslorOgVent(felter);
    }

    function finalVisValg() {
        if (ui.laast) return;
        var felter = S.finalVisValg();
        if (felter) afslorOgVent(felter);
    }

    function finalUr() {
        var g = T() && T().g;
        if (ui.ur || ui.laast || !g || g.type !== "final" || g.fase !== "ur") return;
        ui.ur = { start: performance.now(), varighed: D.FINAL_TID, slut: false };
        Lyd.spil("ur");
        render();
        opdaterUr();
    }

    function opdaterUr() {
        if (!ui.ur) return;
        var andel = 1 - (performance.now() - ui.ur.start) / 1000 / (ui.ur.varighed * NK.tempo);
        if (andel <= 0 && !ui.ur.slut) {
            ui.ur.slut = true;
            render();
        }
        V.ur(true, andel, ui.ur.slut);
    }

    function finalSvar(rigtigt) {
        var g = T().g;
        if (ui.laast || g.type !== "final" || g.fase !== "ur") return;
        var skjulte = S.skjulteFelter();
        Lyd.stop("ur", 0.2);
        ui.ur = null;
        V.ur(false);
        if (!S.finalSvar(rigtigt)) return;
        Lyd.spil(rigtigt ? "loest" : "forkert");
        ui.laast = true;
        render();
        V.afslor(skjulte, { hurtig: true }, function () { ui.laast = false; render(); });
    }

    function finalAabn() {
        if (ui.laast || !S.finalAabn()) return;
        var g = T().g;
        if (g.final.vundet) {
            Lyd.spil("tossuploest");
            V.pop(g.final.hold, "+" + kr(g.final.praemie), "plus");
        }
        render();
    }

    /* ----- Resultatet ---------------------------------------------------- */
    function tilResultat() {
        stopAlt();
        Lyd.stopAlle(0.3);
        S.slut();
        lukOverlay();
        render();
        spilTema();
    }

    function tilbageFraResultat() {
        stopTema();
        S.tilbageFraSlut();
        if (T().g) V.visGaade(G());
        render();
    }

    /* ----- Tegningen ----------------------------------------------------- */
    function skaermNavn() {
        if (ui.titel) return "titel";
        if (V.hjulVises()) return "hjul";
        if (!el("plakat").hidden) return "plakat";
        var g = T() && T().g;
        if (!g) return "plakat";
        return g.type;
    }

    function status() {
        var t = T(), tekst = "";
        if (!ui.titel && t) {
            if (t.slut) tekst = "Resultat";
            else if (t.g) {
                var n = S.antalGaader();
                if (t.g.type === "final") tekst = "Finalen";
                else tekst = "Gåde " + (t.g.nr + 1) + " af " + n + " · " + (t.g.type === "tossup" ? "Toss-up" : "Runde")
                    + (t.g.type === "runde" && !t.g.loest ? " · " + navn(t.g.tur) + " har turen" : "");
            }
        }
        NK.saetTekst("status", tekst);
    }

    function topknapper() {
        el("gaadeknap").hidden = ui.titel || !T();
        el("lydknap").textContent = Lyd.slukket() ? "🔇" : "🔊";
        el("lydknap").classList.toggle("slukket", Lyd.slukket());
    }

    var FORTRYD = { id: "fortryd", tekst: "↶", klasse: "lille", titel: "Fortryd (Ctrl+Z)", handling: fortryd };
    function fortrydKnap() {
        return { id: FORTRYD.id, tekst: FORTRYD.tekst, klasse: FORTRYD.klasse, titel: FORTRYD.titel, handling: fortryd,
            slaaet: ui.laast || !S.kanFortryde() };
    }

    function besked(html) {
        var b = el("besked");
        if (b.innerHTML !== (html || "")) b.innerHTML = html || "";
    }

    function bogstavTilstand(g, G) {
        return function (b) {
            var brugt = g.gaettet.indexOf(b) >= 0;
            return {
                aktiv: !ui.laast && S.kanVaelge(b),
                brugt: brugt,
                fundet: brugt && !!G.antal[b],
                valgt: !!(g.final && g.final.valgt.indexOf(b) >= 0 && !brugt)
            };
        };
    }

    function renderRunde(t, g, Gd) {
        var h = g.tur, laast = ui.laast;
        V.display(g.fase === "konsonant" && g.drej ? kr(g.drej.vaerdi) : (g.fase === "vokal" ? "VOKAL" : ""), g.fase);
        V.bogstaver(bogstavTilstand(g, Gd), g.fase === "konsonant" || g.fase === "vokal" ? g.fase : "");
        var sidst = g.sidst && g.sidst.hold !== undefined ? g.sidst : null;
        var foer = "";
        if (sidst && sidst.hold !== h && g.fase === "tur") {
            if (sidst.type === "fallit") foer = hnavn(sidst.hold) + " gik fallit. ";
            else if (sidst.type === "mist") foer = hnavn(sidst.hold) + " mistede turen. ";
            else if (sidst.type === "forkert") foer = "Intet " + sidst.bogstav + ". ";
            else if (sidst.type === "forkert-loesning") foer = "Forkert løsning. ";
        }
        var knap;
        if (g.fase === "tur") {
            var konsTilbage = S.konsonanterTilbage().length, vokTilbage = S.vokalerTilbage().length;
            besked(foer + "<b>" + hnavn(h) + "</b> drejer hjulet, køber en vokal eller løser gåden."
                + (!konsTilbage ? " Der er ingen konsonanter tilbage." : ""));
            knap = [
                { id: "drej", tekst: "Drej hjulet", klasse: "gul", handling: drejHjul, slaaet: laast || !S.kanDreje(),
                    titel: konsTilbage ? "Mellemrum" : "Der er ingen konsonanter tilbage" },
                { id: "vokal", tekst: "Køb vokal · " + kr(D.VOKALPRIS), handling: koebVokal, slaaet: laast || !S.kanKoebeVokal(),
                    titel: !vokTilbage ? "Der er ingen vokaler tilbage" : (g.runde[h] < D.VOKALPRIS ? "Holdet har ikke 250 kr. i denne runde" : "") },
                { id: "loes", tekst: "Løs gåden", handling: loes, slaaet: laast },
                { id: "naeste", tekst: "Næste hold", klasse: "graa", handling: naesteHold, slaaet: laast, titel: "Giv turen videre" },
                fortrydKnap()
            ];
        } else if (g.fase === "konsonant") {
            besked("<b>" + hnavn(h) + "</b> drejede " + kr(g.drej.vaerdi) + " Sig en konsonant.");
            knap = [{ id: "naeste", tekst: "Næste hold", klasse: "graa", handling: naesteHold, slaaet: laast }, fortrydKnap()];
        } else if (g.fase === "vokal") {
            besked("<b>" + hnavn(h) + "</b> har købt en vokal. Sig en vokal.");
            knap = [{ id: "naeste", tekst: "Næste hold", klasse: "graa", handling: naesteHold, slaaet: laast }, fortrydKnap()];
        } else if (g.fase === "loes") {
            besked("<b>" + hnavn(h) + "</b> løser gåden. Er svaret rigtigt?");
            knap = [
                { id: "rigtigt", tekst: "✓ Rigtigt", klasse: "gul", handling: function () { loesSvar(true); }, slaaet: laast },
                { id: "forkert", tekst: "✗ Forkert", klasse: "roed", handling: function () { loesSvar(false); }, slaaet: laast, titel: "X" },
                fortrydKnap()
            ];
        } else {
            besked("<b>" + hnavn(g.vinder) + "</b> løste gåden og får " + kr(g.gevinst));
            knap = [fortrydKnap(), { id: "videre", tekst: naesteTekst(), klasse: "gul", handling: naesteGaade, slaaet: laast }];
        }
        V.knapper(knap);
        V.podier(function (x) {
            return {
                stor: kr(g.runde[x]), storHvad: "runde", lille: "I alt " + kr(t.hold[x].total),
                tur: x === h && !g.loest, vinder: g.vinder === x
            };
        });
    }

    function renderTossup(t, g, Gd) {
        V.display("TOSS-UP", "tossup");
        V.bogstaver(bogstavTilstand(g, Gd), "");
        var kanSvare = /^(klar|koerer|pause|alle)$/.test(g.fase);
        var knap;
        if (g.fase === "klar") {
            besked("Tryk Start. Bogstaverne dukker op ét ad gangen, og holdet, der først rækker hånden op, svarer.");
            knap = [{ id: "start", tekst: "▶ Start", klasse: "gul", handling: tossupStart, slaaet: ui.laast },
                    { id: "ingen", tekst: "Ingen fik den", klasse: "graa", handling: tossupIngen, slaaet: ui.laast }];
        } else if (g.fase === "koerer") {
            besked("Rækker et hold hånden op, så klik Svarer på holdets podie (1 til " + t.hold.length + ").");
            knap = [{ id: "pause", tekst: "❚❚ Pause", klasse: "gul", handling: tossupPause },
                    { id: "ingen", tekst: "Ingen fik den", klasse: "graa", handling: tossupIngen }];
        } else if (g.fase === "pause") {
            besked("Bogstaverne holder pause.");
            knap = [{ id: "start", tekst: "▶ Fortsæt", klasse: "gul", handling: tossupStart },
                    { id: "ingen", tekst: "Ingen fik den", klasse: "graa", handling: tossupIngen }, fortrydKnap()];
        } else if (g.fase === "svarer") {
            besked("<b>" + hnavn(g.svarer) + "</b> svarer. Er svaret rigtigt?");
            knap = [{ id: "rigtigt", tekst: "✓ Rigtigt", klasse: "gul", handling: function () { tossupSvar(true); } },
                    { id: "forkert", tekst: "✗ Forkert", klasse: "roed", handling: function () { tossupSvar(false); }, titel: "X" },
                    { id: "fortryd-svarer", tekst: "Det var ikke dem", klasse: "graa", handling: tossupFortrydSvarer }];
        } else if (g.fase === "alle") {
            besked(S.alleUde() ? "Alle hold har svaret forkert." : "Alle bogstaver er vist. Kan et hold løse den?");
            knap = [{ id: "ingen", tekst: "Ingen fik den", klasse: "gul", handling: tossupIngen }, fortrydKnap()];
        } else {
            besked(g.vinder === null ? "Ingen løste den." : "<b>" + hnavn(g.vinder) + "</b> løste den og får " + kr(g.gevinst));
            knap = [fortrydKnap(), { id: "videre", tekst: naesteTekst(), klasse: "gul", handling: naesteGaade, slaaet: ui.laast }];
        }
        V.knapper(knap);
        V.podier(function (x) {
            var ude = g.ude.indexOf(x) >= 0;
            var o = { stor: kr(t.hold[x].total), lille: "", ude: ude || (g.fase === "svarer" && g.svarer !== x), vinder: g.vinder === x,
                tur: g.fase === "svarer" && g.svarer === x };
            if (kanSvare && !ude) o.knapper = [{ id: "svarer", klasse: "svarer", tekst: "✋ Svarer", titel: String(x + 1) }];
            else if (g.fase === "svarer" && g.svarer === x) {
                o.knapper = [{ id: "rigtigt", klasse: "plus", tekst: "✓", titel: "Rigtigt" }, { id: "forkert", klasse: "minus", tekst: "✗", titel: "Forkert (X)" }];
            } else if (ude && !g.loest) o.note = "forkert";
            return o;
        });
    }

    function renderFinal(t, g, Gd) {
        var F = g.final, h = F.hold;
        V.display("FINALE", "final");
        V.bogstaver(bogstavTilstand(g, Gd), g.fase === "valg" ? "valg" : "");
        var knap = [];
        if (g.fase === "hold") {
            V.visPlakat("final-hold-" + h + "-" + t.hold.length, "finalplakat",
                '<div class="lille">Finalen</div>'
                + '<div class="stort tilpas">' + NK.html(Gd.kategori) + "</div>"
                + '<div class="etiket">Holdet, der spiller om kuverten</div>'
                + '<div class="holdvalg">' + t.hold.map(function (x, i) {
                    return '<button type="button" class="holdknap farve-' + D.HOLDFARVER[i] + (i === h ? " valgt" : "") + '" data-finalhold="' + i + '">'
                        + NK.html(x.navn) + " · " + kr(x.total) + "</button>";
                }).join("") + "</div>"
                + '<div class="lille note">Hjulet vælger en kuvert. Beløbet vises først, når finalen er afgjort.</div>');
            besked("");
            knap = [{ id: "praemie", tekst: "Drej præmiehjulet", klasse: "gul", handling: finalDrej, slaaet: ui.laast }];
        } else if (g.fase === "loest" && F.aabnet) {
            V.visPlakat("kuvert-" + F.vundet, "kuvertplakat" + (F.vundet ? " vundet" : ""),
                '<div class="kuvert-tegning" aria-hidden="true">✉</div>'
                + '<div class="lille">Kuverten indeholdt</div>'
                + '<div class="stort tilpas beloeb">' + kr(F.praemie) + "</div>"
                + '<div class="lille">' + (F.vundet ? hnavn(h) + " vinder beløbet" : "Gåden blev ikke løst") + "</div>");
            besked("");
            knap = [{ id: "videre", tekst: "Resultat →", klasse: "gul", handling: tilResultat }];
        } else {
            V.skjulPlakat();
            if (g.fase === "rstlne") {
                besked("<b>" + hnavn(h) + "</b> spiller om kuverten. R, S, T, L, N og E vises først.");
                knap = [{ id: "rstlne", tekst: "Vis R S T L N E", klasse: "gul", handling: finalRSTLNE, slaaet: ui.laast }];
            } else if (g.fase === "valg") {
                var k = F.valgt.filter(S.erKonsonant).length, v = F.valgt.filter(S.erVokal).length;
                besked("<b>" + hnavn(h) + "</b> vælger " + D.FINAL_KONSONANTER + " konsonanter og " + D.FINAL_VOKALER
                    + " vokal: <span class='taeller'>" + k + " af " + D.FINAL_KONSONANTER + "</span> og <span class='taeller'>" + v + " af " + D.FINAL_VOKALER + "</span>.");
                knap = [{ id: "vis-valg", tekst: "Vis bogstaverne", klasse: "gul", handling: finalVisValg, slaaet: ui.laast || !S.finalValgKlar() }, fortrydKnap()];
            } else if (g.fase === "ur") {
                if (!ui.ur) {
                    besked("<b>" + hnavn(h) + "</b> har " + D.FINAL_TID + " sekunder til at løse gåden.");
                    knap = [{ id: "ur", tekst: "⏱ Start uret", klasse: "gul", handling: finalUr, slaaet: ui.laast },
                            { id: "rigtigt", tekst: "✓ Rigtigt", handling: function () { finalSvar(true); }, slaaet: ui.laast },
                            { id: "forkert", tekst: "✗ Forkert", klasse: "roed", handling: function () { finalSvar(false); }, slaaet: ui.laast }];
                } else {
                    besked(ui.ur.slut ? "Tiden er gået." : "<b>" + hnavn(h) + "</b> gætter.");
                    knap = [{ id: "rigtigt", tekst: "✓ Rigtigt", klasse: "gul", handling: function () { finalSvar(true); } },
                            { id: "forkert", tekst: "✗ Forkert", klasse: "roed", handling: function () { finalSvar(false); }, titel: "X" }];
                }
            } else if (g.fase === "loest") {
                besked(F.vundet ? "<b>" + hnavn(h) + "</b> løste finalen." : "Finalen blev ikke løst.");
                knap = [fortrydKnap(), { id: "kuvert", tekst: "✉ Åbn kuverten", klasse: "gul", handling: finalAabn, slaaet: ui.laast }];
            }
        }
        V.knapper(knap);
        V.podier(function (x) {
            return { stor: kr(t.hold[x].total), lille: "", tur: x === h && g.fase !== "hold", ude: g.fase !== "hold" && x !== h,
                vinder: g.loest && F.vundet && x === h };
        });
    }

    function renderSlut(t) {
        var vindere = S.vindere(), liste = S.rangliste();
        var noegle = "slut" + liste.map(function (h) { return h + ":" + t.hold[h].total + ":" + t.hold[h].navn; }).join("|");
        var konfetti = "";
        for (var i = 0; i < 30; i++) {
            konfetti += '<i class="konfetti" style="left:' + (Math.random() * 100).toFixed(1) + "%;animation-delay:" + (Math.random() * 3).toFixed(2)
                + "s;animation-duration:" + (2.8 + Math.random() * 2.4).toFixed(2) + "s;background:"
                + NK.tilfaeldig(["#e8262a", "#ffd21f", "#1fb4ef", "#28c35c", "#ff72c8", "#ffffff"]) + '"></i>';
        }
        V.visPlakat(noegle, "slutplakat",
            konfetti
            + '<div class="lille">' + (vindere.length > 1 ? "Uafgjort mellem" : "Vinderen er") + "</div>"
            + '<div class="stort tilpas vindernavn">' + vindere.map(hnavn).join(" og ") + "</div>"
            + '<ol class="rangliste">' + liste.map(function (h) {
                return '<li class="farve-' + D.HOLDFARVER[h] + '"><span>' + hnavn(h) + "</span><b>" + kr(t.hold[h].total) + "</b></li>";
            }).join("") + "</ol>");
        V.kategori("", "");
        besked("");
        V.display("", "");
        V.bogstaver(null, "");
        V.knapper([{ id: "tilbage", tekst: "← Tilbage", handling: tilbageFraResultat },
                   { id: "nyt", tekst: "Nyt spil", klasse: "gul", handling: visTitel }]);
        V.podier(function (h) { return { stor: kr(t.hold[h].total), lille: "", vinder: vindere.indexOf(h) >= 0 }; });
    }

    function render() {
        var t = T();
        el("titel").hidden = !ui.titel;
        if (ui.titel || !t) {
            tegnTitel();
            V.skjulPlakat();
            V.knapper([]);
        } else if (t.slut || !t.g) {
            renderSlut(t);
        } else {
            var g = t.g, Gd = G();
            if (g.type !== "final" || g.fase !== "hold") {
                if (!(g.type === "final" && g.fase === "loest" && g.final.aabnet)) V.skjulPlakat();
            }
            V.kategori(Gd.kategori, g.type === "tossup" ? "Toss-up · " + kr(Gd.vaerdi) : (g.type === "final" ? "Finale" : "Runde"));
            V.opdaterTavle();
            if (g.type === "runde") renderRunde(t, g, Gd);
            else if (g.type === "tossup") renderTossup(t, g, Gd);
            else renderFinal(t, g, Gd);
            if (!ui.ur) V.ur(false);
        }
        document.body.setAttribute("data-skaerm", skaermNavn());
        topknapper();
        status();
    }

    /* ----- Oversigten over gaaderne -------------------------------------- */
    function aabnGaader() {
        if (!T()) return;
        var q = S.Q(), t = T();
        var linjer = q.gaader.map(function (g, i) { return { g: g, nr: i }; });
        if (q.final) linjer.push({ g: q.final, nr: S.finalNr() });
        el("gaade-liste").innerHTML = linjer.map(function (x) {
            var f = S.faerdig(x.nr), g = x.g;
            var type = g.type === "tossup" ? "Toss-up · " + kr(g.vaerdi) : (g.type === "final" ? "Finale" : "Runde");
            var udfald = f ? (f.vinder === null ? "ingen" : NK.html(t.hold[f.vinder] ? t.hold[f.vinder].navn : "") + " · " + kr(f.gevinst)) : "";
            var aktiv = t.g && t.g.nr === x.nr && !t.slut;
            return '<li><button type="button" data-nr="' + x.nr + '" class="' + (f ? "spillet" : "") + (aktiv ? " aktiv" : "") + '">'
                + '<span class="nr">' + (g.type === "final" ? "F" : x.nr + 1) + "</span>"
                + '<span class="kat">' + NK.html(g.kategori) + '<small>' + type + "</small></span>"
                + '<span class="udfald">' + (aktiv ? "spilles nu" : udfald) + "</span></button></li>";
        }).join("");
        el("gaader").classList.add("vis");
    }

    /* ----- Kemichael og tegneloekken ------------------------------------- */
    function punkt(e) {
        var r = el("laerred").getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    function loekke(tidsstempel) {
        var dt = (tidsstempel - sidsteTid) / 1000;
        sidsteTid = tidsstempel;
        if (!isFinite(dt) || dt < 0) dt = 0;
        if (dt > 0.1) dt = 0.1;
        if (ui.ur) opdaterUr();
        if (laerer) {
            laerred.tilpas();
            laerred.ryd();
            laerer.opdater(dt);
            laerer.laererTegnOver(laerred.ctx);
        }
        window.requestAnimationFrame(loekke);
    }

    /* ----- Overlays og tastatur ------------------------------------------ */
    function lukOverlay() {
        var aabne = document.querySelectorAll(".overlay.vis");
        for (var i = 0; i < aabne.length; i++) aabne[i].classList.remove("vis");
    }

    function bogstavTilstandAktiv() {
        var g = T() && T().g;
        return !!(g && !ui.titel && /^(konsonant|vokal|valg)$/.test(g.fase));
    }

    function tastatur(e) {
        if (e.key === "Escape") {
            lukOverlay();
            NK.Rundvisning.luk();
            if (laerer && !laerer.afvisTilbud()) laerer.stopIntro();
            return;
        }
        var tag = e.target && e.target.tagName;
        if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
        if (NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis")) return;
        if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z")) { e.preventDefault(); fortryd(); return; }
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        var k = e.key;
        var stort = k && k.length === 1 ? k.toLocaleUpperCase("da-DK") : "";
        if (stort && NK.Tavle.erBogstav(stort) && bogstavTilstandAktiv()) {
            e.preventDefault();
            vaelgBogstav(stort);
            return;
        }
        if (k === "k" || k === "K") { if (laerer && ui.titel) laerer.startIntro("titel", true); return; }
        if (k === "h" || k === "H" || k === "?") { NK.Rundvisning.start(skaermNavn()); return; }
        if (k === "m" || k === "M") { skiftLyd(); return; }
        if (ui.titel || !T()) return;
        if (k === " " || k === "Enter") {
            if (tag === "BUTTON" && k === "Enter") return;
            e.preventDefault();
            var gul = V.primaer();
            if (gul) gul();
            return;
        }
        if (k === "x" || k === "X") {
            var f = V.knapHandling("forkert");
            if (f) f();
            return;
        }
        var m = /^(Digit|Numpad)([1-4])$/.exec(e.code || "");
        if (m && T().hold[+m[2] - 1] && T().g && T().g.type === "tossup") {
            e.preventDefault();
            tossupSvarer(+m[2] - 1);
        }
    }

    /* ----- Start ------------------------------------------------------- */
    function start() {
        var fraLink = B.fraHash(window.location.hash);
        if (fraLink && /^#quiz=/.test(window.location.hash) && window.history && window.history.replaceState) {
            window.history.replaceState(null, "", window.location.href.replace(/#.*$/, ""));
        }
        indlaesQuiz(fraLink || B.valgt());

        V.bygTavle();
        V.bygBogstaver();

        laerred = new NK.Laerred(el("laerred"));
        if (NK.Sprites) NK.Sprites.start();
        if (NK.Laerer) {
            laerer = new NK.Laerer(laerred);
            NK.laerer = laerer;
            el("spring-over").addEventListener("click", function () { laerer.stopIntro(); });
        }

        /* Titelskaermen */
        el("quizvalg").addEventListener("change", function () { skiftQuiz(el("quizvalg").value); });
        el("egneknap").addEventListener("click", function () {
            NK.Editor.aabn(ui.noegle, function (noegle) { skiftQuiz(noegle); });
        });
        el("hold-plus").addEventListener("click", function () {
            if (ui.navne.length < D.MAKS_HOLD) ui.navne.push(D.FARVENAVNE[ui.navne.length]);
            tegnTitel();
        });
        el("hold-minus").addEventListener("click", function () {
            if (ui.navne.length > D.MIN_HOLD) ui.navne.pop();
            tegnTitel();
        });
        el("holdnavne").addEventListener("input", function (e) {
            var h = e.target.getAttribute("data-h");
            if (h !== null) ui.navne[+h] = e.target.value;
        });
        el("holdnavne").addEventListener("keydown", function (e) {
            if (e.key === "Enter") { e.preventDefault(); if (T()) fortsaet(); else startSpil(); }
        });
        el("start").addEventListener("click", startSpil);
        el("fortsaet").addEventListener("click", fortsaet);

        /* Et andet link (#a, #nf eller #quiz=...), uden at siden indlaeses igen */
        window.addEventListener("hashchange", function () {
            var noegle = B.fraHash(window.location.hash);
            if (!noegle) return;
            if (/^#quiz=/.test(window.location.hash) && window.history.replaceState) {
                window.history.replaceState(null, "", window.location.href.replace(/#.*$/, ""));
            }
            indlaesQuiz(noegle);
            visTitel();
        });

        el("knapper").addEventListener("click", function (e) {
            var b = e.target.closest("button");
            if (!b || b.disabled) return;
            var f = V.knapHandling(b.getAttribute("data-knap"));
            if (f) f();
        });

        el("bogstaver").addEventListener("click", function (e) {
            var b = e.target.closest(".bogstav");
            if (!b || b.disabled) return;
            vaelgBogstav(b.getAttribute("data-b"));
        });

        el("plakat").addEventListener("click", function (e) {
            var b = e.target.closest("[data-finalhold]");
            if (!b || ui.laast) return;
            if (S.finalHold(+b.getAttribute("data-finalhold"))) render();
        });

        /* Podierne: turen, svarer, og ret point og navne */
        el("podier").addEventListener("click", function (e) {
            var b = e.target.closest("button");
            if (!b || !T()) return;
            var h = +b.getAttribute("data-h");
            var hvad = b.getAttribute("data-podie");
            if (hvad === "svarer") { tossupSvarer(h); return; }
            if (hvad === "rigtigt" || hvad === "forkert") { tossupSvar(hvad === "rigtigt"); return; }
            if (b.classList.contains("podie-lys")) { giveTur(h); return; }
            if (b.classList.contains("podie-stor")) {
                var runde = b.getAttribute("data-hvad") === "runde";
                V.retPaaPodie(b, String(runde ? T().g.runde[h] : T().hold[h].total), function (v) {
                    if (v !== null) {
                        var tal = Number(String(v).replace(/kr\.?/i, "").replace(/[\s.]/g, "").replace(",", ".").replace("−", "-"));
                        if (runde) S.saetRunde(h, tal); else S.saetTotal(h, tal);
                    }
                    render();
                });
            } else if (b.classList.contains("podie-navn")) {
                V.retPaaPodie(b, T().hold[h].navn, function (v) {
                    if (v !== null) S.omdoeb(h, v);
                    render();
                });
            }
        });

        /* Toplinjen og vinduerne */
        el("gaadeknap").addEventListener("click", aabnGaader);
        el("gaade-liste").addEventListener("click", function (e) {
            var b = e.target.closest("[data-nr]");
            if (!b) return;
            var nr = +b.getAttribute("data-nr");
            if (T().g && T().g.nr === nr && !T().slut) { lukOverlay(); return; }
            startGaade(nr);
        });
        el("gaade-resultat").addEventListener("click", tilResultat);
        el("gaader-luk").addEventListener("click", lukOverlay);
        el("gaader").addEventListener("click", function (e) { if (e.target === el("gaader")) lukOverlay(); });
        el("nytknap").addEventListener("click", visTitel);
        el("lydknap").addEventListener("click", skiftLyd);
        el("regelknap").addEventListener("click", function () { el("regler").classList.add("vis"); });
        el("regler-luk").addEventListener("click", lukOverlay);
        el("regler").addEventListener("click", function (e) { if (e.target === el("regler")) lukOverlay(); });
        el("hjaelpknap").addEventListener("click", function () { lukOverlay(); NK.Rundvisning.start(skaermNavn()); });
        el("hjulscene").addEventListener("click", function () { /* hjulet stopper af sig selv */ });
        var fuld = el("fuldknap");
        fuld.hidden = !document.fullscreenEnabled;
        fuld.addEventListener("click", function () {
            if (document.fullscreenElement) document.exitFullscreen();
            else document.documentElement.requestFullscreen().catch(function () { /* ikke tilladt her */ });
        });

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
        document.addEventListener("pointerdown", foersteKlik, true);
        document.addEventListener("keydown", foersteKlik, true);
        Lyd.vedAendring(function () { if (ui.titel) tegnTitel(); });

        if (window.ResizeObserver) new window.ResizeObserver(function () { V.tilpasAlt(); }).observe(el("scene"));
        else window.addEventListener("resize", V.tilpasAlt);

        NK.app = {
            render: render, ui: ui, visTitel: visTitel, startSpil: startSpil, fortsaet: fortsaet, skiftQuiz: skiftQuiz,
            startGaade: startGaade, naesteGaade: naesteGaade, fortryd: fortryd,
            drejHjul: drejHjul, vaelgBogstav: vaelgBogstav, koebVokal: koebVokal, loes: loes, loesSvar: loesSvar,
            giveTur: giveTur, naesteHold: naesteHold,
            tossupStart: tossupStart, tossupPause: tossupPause, tossupSvarer: tossupSvarer, tossupSvar: tossupSvar, tossupIngen: tossupIngen,
            finalDrej: finalDrej, finalRSTLNE: finalRSTLNE, finalVisValg: finalVisValg, finalUr: finalUr, finalSvar: finalSvar,
            finalAabn: finalAabn, tilResultat: tilResultat, tastatur: tastatur, aabnGaader: aabnGaader,
            noegle: function () { return ui.noegle; }
        };

        ui.titel = true;
        render();
        /* De originale lyde er maaske ikke hentet endnu: vent lidt paa dem */
        setTimeout(spilTema, window.location.protocol === "file:" ? 700 : 0);
        if (laerer) laerer.startIntro("titel", false);

        window.requestAnimationFrame(function (ts) {
            sidsteTid = ts;
            window.requestAnimationFrame(loekke);
        });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
}());
