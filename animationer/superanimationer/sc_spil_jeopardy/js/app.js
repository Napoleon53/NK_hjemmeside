/* =====================================================================
   app.js - forloebet, knapperne og tastaturet

   render() tegner alt ud fra tilstanden i NK.Spil og det lille ui-objekt
   herunder (det, der ikke skal gemmes: titelskaermen, uret og de
   animationer, der koerer lige nu). Hver handling aendrer tilstanden og
   kalder render().

   Knapperne under skaermen er hvide piller. Den gule er det naturlige
   naeste trin, og Mellemrum trykker paa den.
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
            set: function (id) { return !!NK.hent("nk-jeopardy-intro", {})[id]; },
            husk: function (id) { var s = NK.hent("nk-jeopardy-intro", {}); s[id] = true; NK.gem("nk-jeopardy-intro", s); }
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
    var Lyd = NK.Lydbank;
    var el = NK.el;

    var ui = {
        titel: true,
        fylder: false,
        ddSplash: false,
        ur: null,
        navne: [],
        urSek: D.UR_STANDARD,
        startSikker: 0
    };
    var laerred = null;
    var laerer = null;
    var sidsteTid = 0;
    var tema = null;

    /* Niveauet kommer fra linket (#b), og en laerer kan have sin egen quiz
       til niveauet i denne browser. */
    var EGEN = "nk-jeopardy-egen-";
    var niveau = D.STANDARD_NIVEAU;
    var egen = false;

    function niveauFraHash(h) {
        h = String(h || "").replace(/^#/, "").toLowerCase();
        if (D.QUIZZER[h]) return h;
        var m = /^(kemi-?)?([a-z])(-niveau)?$/.exec(h);
        return m && D.QUIZZER[m[2]] ? m[2] : D.STANDARD_NIVEAU;
    }

    function egenTekst() {
        var g = NK.hent(EGEN + niveau, null);
        return g && g.tekst ? g.tekst : null;
    }

    function aktivQuiz() {
        var t = egenTekst();
        if (t) {
            var r = NK.Tekstformat.fraTekst(t, "egen-" + niveau);
            if (r.quiz) { egen = true; return r.quiz; }
        }
        egen = false;
        return D.QUIZZER[niveau];
    }

    function indlaesQuiz() {
        stopUr();
        V.stopFyld();
        ui.fylder = false;
        S.init(aktivQuiz());
        V.nulstil();
    }

    function T() { return S.T(); }
    function Q() { return S.Q(); }
    function kr(v) { return NK.beloeb(v, Q().enhed); }
    function holdnavn(h) { return NK.html(T().hold[h] ? T().hold[h].navn : ""); }

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

    /* ----- Uret ---------------------------------------------------------- */
    function startUr(sekunder, lyd) {
        ui.ur = { start: performance.now(), varighed: sekunder, slut: false, stille: !!lyd };
        if (lyd) Lyd.spil(lyd);
        render();
    }

    function stopUr() {
        if (!ui.ur) return;
        if (ui.ur.stille) Lyd.stop("taenk", 0.4);
        ui.ur = null;
        V.ur(false);
    }

    function urKoerer() { return !!(ui.ur && !ui.ur.slut); }

    function skiftUr() {
        if (urKoerer()) { stopUr(); render(); } else { stopUr(); startUr(T().ur, null); }
    }

    function skiftTaenketid() {
        if (urKoerer()) { stopUr(); render(); } else { stopUr(); startUr(D.TAENKETID, "taenk"); }
    }

    function opdaterUr() {
        if (!ui.ur || el("kort").hidden) { V.ur(false); return; }
        var andel = 1 - (performance.now() - ui.ur.start) / 1000 / ui.ur.varighed;
        if (andel <= 0 && !ui.ur.slut) {
            ui.ur.slut = true;
            if (!ui.ur.stille) Lyd.spil("tid");
            render();
        }
        V.ur(true, andel, ui.ur.slut);
    }

    /* ----- Titelskaermen ------------------------------------------------- */
    function titelFraSpil() {
        var t = T();
        ui.navne = t ? t.hold.map(function (x) { return x.navn; }) : D.HOLD.slice();
        ui.urSek = t ? t.ur : D.UR_STANDARD;
    }

    function tegnTitel() {
        NK.saetTekst("hold-antal", String(ui.navne.length));
        var rod = el("holdnavne");
        if (rod.children.length !== ui.navne.length) {
            rod.innerHTML = "";
            ui.navne.forEach(function (n, h) {
                var i = document.createElement("input");
                i.type = "text";
                i.value = n;
                i.maxLength = 24;
                i.spellcheck = false;
                i.setAttribute("data-h", h);
                i.setAttribute("aria-label", "Navn på hold " + (h + 1));
                rod.appendChild(i);
            });
        }
        var ur = el("urvalg").querySelectorAll("button");
        for (var i = 0; i < ur.length; i++) ur[i].classList.toggle("valgt", +ur[i].getAttribute("data-s") === ui.urSek);
        el("hold-minus").disabled = ui.navne.length <= 1;
        el("hold-plus").disabled = ui.navne.length >= D.MAKS_HOLD;
        el("fortsaet").hidden = !T();
        el("start").textContent = ui.startSikker ? "Sikker? Start forfra" : (T() ? "Nyt spil" : "Start spillet");
        el("start").classList.toggle("advarsel", !!ui.startSikker);
        NK.saetTekst("titel-quiz", NK.renTekst(Q().navn) + (egen ? " · egne spørgsmål" : ""));
        NK.saetTekst("lydkilde", Lyd.kilde() === "originale"
            ? "Lyd: de originale lyde fra denne computer"
            : "Lyd: spillets egne lyde");
    }

    function visTitel() {
        stopUr();
        V.stopFyld();
        ui.fylder = false;
        Lyd.stopAlle(0.3);
        titelFraSpil();
        ui.titel = true;
        ui.startSikker = 0;
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
        var igang = t && Object.keys(t.felter).length > 0 && t.fase !== "slut";
        if (igang && !ui.startSikker) {
            ui.startSikker = setTimeout(function () { ui.startSikker = 0; tegnTitel(); }, 3500);
            tegnTitel();
            return;
        }
        clearTimeout(ui.startSikker);
        S.nyt(ui.navne, ui.urSek);
        forladTitel();
        V.bygBraet();
        fyldBraet();
    }

    function fortsaet() {
        if (!T()) return;
        S.saetHold(ui.navne);
        S.saetUr(ui.urSek);
        forladTitel();
        render();
    }

    /* ----- Egne spoergsmaal ---------------------------------------------- */
    function normal(tekst) {
        return String(tekst).replace(/\r/g, "").split("\n").map(function (l) { return l.trim(); })
            .filter(function (l) { return l; }).join("\n");
    }

    function kontrollerEgne() {
        var r = NK.Tekstformat.fraTekst(el("egne-tekst").value, "egen-" + niveau);
        var st = el("egne-status");
        st.classList.toggle("fejl", !r.quiz);
        st.textContent = r.quiz ? "✓ " + r.oversigt + ". Klar til brug."
            : "✗ " + r.fejl.slice(0, 3).join(" ") + (r.fejl.length > 3 ? " (og " + (r.fejl.length - 3) + " fejl mere)" : "");
        el("egne-brug").disabled = !r.quiz;
        return r;
    }

    function aabnEgne() {
        el("egne-tekst").value = egenTekst() || NK.Tekstformat.tilTekst(D.QUIZZER[niveau]);
        kontrollerEgne();
        el("egne").classList.add("vis");
        el("egne-tekst").focus();
        el("egne-tekst").setSelectionRange(0, 0);
        el("egne-tekst").scrollTop = 0;
    }

    function brugEgne() {
        var tekst = el("egne-tekst").value;
        if (!kontrollerEgne().quiz) return;
        if (normal(tekst) === normal(NK.Tekstformat.tilTekst(D.QUIZZER[niveau]))) NK.glem(EGEN + niveau);
        else NK.gem(EGEN + niveau, { tekst: tekst });
        lukOverlay();
        indlaesQuiz();
        visTitel();
    }

    function eksporterEgne() {
        var tekst = el("egne-tekst").value;
        var m = /^\s*titel\s*:\s*(.+)$/im.exec(tekst);
        var navn = (m ? m[1] : "quiz").toLowerCase().replace(/æ/g, "ae").replace(/ø/g, "oe").replace(/å/g, "aa")
            .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "quiz";
        var a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob(["﻿" + tekst], { type: "text/plain;charset=utf-8" }));
        a.download = "jeopardy-" + navn + ".txt";
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    }

    function laesFil(fil) {
        if (!fil) return;
        var r = new FileReader();
        r.onload = function () {
            el("egne-tekst").value = String(r.result).replace(/^﻿/, "");
            kontrollerEgne();
        };
        r.readAsText(fil, "utf-8");
    }

    function kopierVejledning() {
        var tekst = NK.Tekstformat.aiVejledning(Q());
        var knap = el("egne-ai"), foer = "Kopiér vejledning til AI";
        function kvittering(ok) {
            knap.textContent = ok ? "Kopieret ✓" : "Kunne ikke kopiere";
            setTimeout(function () { knap.textContent = foer; }, 2200);
        }
        function reserve() {
            var t = document.createElement("textarea");
            t.value = tekst;
            t.style.position = "fixed";
            t.style.opacity = "0";
            document.body.appendChild(t);
            t.select();
            var ok = false;
            try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
            t.remove();
            kvittering(ok);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(tekst).then(function () { kvittering(true); }, reserve);
        } else {
            reserve();
        }
    }

    /* ----- Runden begynder ---------------------------------------------- */
    function fyldBraet() {
        ui.fylder = true;
        render();
        Lyd.spil("braet");
        V.fyld(Lyd.original("braet") ? 4.2 : 2.9, function () {
            ui.fylder = false;
            render();
        });
    }

    function visKategori() {
        S.visKategori();
        render();
    }

    function tilBraettet() {
        S.tilBraettet();
        render();
    }

    /* ----- Et felt ------------------------------------------------------- */
    function aabnFelt(n, knap) {
        var t = T();
        if (ui.titel || !t || t.fase !== "braet" || t.aabent) return;
        stopUr();
        var f = S.aabn(n);
        if (f.dd && !f.dd.klar) {
            ui.ddSplash = true;
            Lyd.spil("dobbelt");
            render();
            setTimeout(function () {
                ui.ddSplash = false;
                el("plakat").classList.remove("splash");
                var i = el("dd-indsats");
                if (i && T().aabent === n) i.focus();
            }, 1900);
            return;
        }
        render();
        V.zoomFra(knap);
    }

    function lukFelt() {
        stopUr();
        S.luk();
        render();
    }

    function visSvar() {
        stopUr();
        S.vis("svar");
        render();
    }

    function visLedetraad() {
        S.vis("spoergsmaal");
        render();
    }

    function visDD() {
        var t = T(), n = t.aabent;
        var i = el("dd-indsats");
        if (i && i.value !== "") S.ddIndsats(n, i.value);
        var fra = el("plakat").querySelector(".dd-titel");
        if (!S.ddKlar(n)) { render(); return; }
        render();
        V.zoomFra(fra);
    }

    function bedoem(h, retning) {
        var t = T();
        if (!t || ui.titel) return;
        if (t.fase === "braet" && t.aabent) {
            if (S.bedoem(t.aabent, h, retning)) render();
        } else if (t.fase === "final" && t.final.trin === "svar") {
            if (S.bedoemFinal(h, retning)) render();
        }
    }

    /* ----- Runden slutter, Final og resultatet --------------------------- */
    function naesteRunde() {
        if (!S.naesteRunde()) return;
        V.bygBraet();
        fyldBraet();
    }

    function tilFinal() {
        if (!S.harFinal()) { tilResultat(); return; }
        stopUr();
        S.startFinal();
        Lyd.spil("final");
        render();
    }

    function finalTrin(trin) {
        stopUr();
        S.finalTrin(trin);
        render();
    }

    function tilResultat() {
        stopUr();
        Lyd.stopAlle(0.3);
        S.slut();
        render();
        spilTema();
    }

    function tilbageFraResultat() {
        stopTema();
        if (S.harFinal()) S.tilbageTilFinal();
        else S.tilbageTilBraet();
        render();
    }

    /* ----- Tegningen ----------------------------------------------------- */
    function skaermNavn() {
        if (ui.titel) return "titel";
        if (!el("kort").hidden) return "kort";
        if (!el("plakat").hidden) return "plakat";
        return "braet";
    }

    function status() {
        var t = T(), tekst = "";
        if (!ui.titel && t) {
            var runde = Q().runder.length > 1 ? "Runde " + (t.runde + 1) + " · " : "";
            if (t.fase === "intro") tekst = runde + "kategorierne";
            else if (t.fase === "braet") tekst = runde + S.tilbage() + (S.tilbage() === 1 ? " felt" : " felter") + " tilbage";
            else if (t.fase === "final") tekst = "Final";
            else tekst = "Resultat";
        }
        NK.saetTekst("status", tekst);
    }

    function topknapper() {
        var t = T();
        var finalMulig = !ui.titel && t && t.fase === "braet" && S.harFinal();
        el("finalknap").hidden = !finalMulig;
        el("finalknap").disabled = !!(t && t.aabent);
        el("lydknap").textContent = Lyd.slukket() ? "🔇" : "🔊";
        el("lydknap").classList.toggle("slukket", Lyd.slukket());
    }

    function renderIntro(t) {
        var antal = S.antalKategorier();
        V.skjulKort();
        V.podier(null);
        if (ui.fylder) { V.skjulPlakat(); V.knapper([]); return; }
        if (t.vist === 0) {
            V.skjulPlakat();
            V.knapper([{ id: "vis", tekst: "Vis kategorierne →", klasse: "gul", handling: visKategori }]);
            return;
        }
        var k = t.vist - 1, K = Q().runder[t.runde].kategorier[k];
        V.visPlakat("kat" + t.runde + "." + k, "kategoriplakat",
            '<div class="lille">Kategori ' + (k + 1) + " af " + antal + "</div>"
            + '<div class="stort tilpas">' + K.navn + "</div>");
        V.knapper(t.vist < antal
            ? [{ id: "alle", tekst: "Vis alle", handling: tilBraettet },
               { id: "naeste", tekst: "Næste kategori →", klasse: "gul", handling: visKategori }]
            : [{ id: "braet", tekst: "Til brættet →", klasse: "gul", handling: tilBraettet }]);
    }

    function renderDD(t, n, f) {
        V.skjulKort();
        var maks = S.maksIndsats(f.dd.hold, n);
        var html = '<div class="dd-titel">Daily Double</div>'
            + '<div class="dd-form">'
            + '<div class="etiket">Holdet, der valgte feltet</div>'
            + '<div class="holdvalg">' + t.hold.map(function (x, h) {
                return '<button type="button" class="holdknap' + (h === f.dd.hold ? " valgt" : "") + '" data-ddhold="' + h + '">' + NK.html(x.navn) + "</button>";
            }).join("") + "</div>"
            + '<div class="etiket">Indsats</div>'
            + '<div class="indsats"><input type="number" id="dd-indsats" inputmode="numeric" min="0" max="' + maks + '" step="100" value="'
            + (f.dd.indsats === null || f.dd.indsats === undefined ? "" : f.dd.indsats) + '"><span>' + Q().enhed + "</span>"
            + '<span class="maks">højst ' + kr(maks) + "</span></div>"
            + "</div>";
        V.visPlakat("dd" + n + "." + f.dd.hold, "ddplakat" + (ui.ddSplash ? " splash" : ""), html);
        V.knapper([{ id: "vis", tekst: "Vis ledetråden →", klasse: "gul", handling: visDD,
            slaaet: f.dd.indsats === null || f.dd.indsats === undefined }]);
        V.podier(function (h) { return h === f.dd.hold ? {} : { ude: true }; });
    }

    function renderBraet(t) {
        if (t.aabent) {
            var n = t.aabent, f = S.felt(n), d = S.data(n);
            if (f.dd && !f.dd.klar) { renderDD(t, n, f); return; }
            V.skjulPlakat();
            var svar = t.visning === "svar";
            var hoejre = f.dd ? "Daily Double · " + holdnavn(f.dd.hold) + " satser " + kr(f.dd.indsats) : kr(d.vaerdi);
            V.visKort({ venstre: d.kategori, hoejre: hoejre, tekst: svar ? d.svar : d.ledetraad, svar: svar });
            opdaterUr();
            V.knapper(svar
                ? [{ id: "tilbage", tekst: "← Ledetråden", handling: visLedetraad },
                   { id: "luk", tekst: "Brættet →", klasse: "gul", handling: lukFelt }]
                : [{ id: "luk", tekst: "← Brættet", handling: lukFelt },
                   { id: "ur", tekst: urKoerer() ? "Stop uret" : "⏱ Ur " + t.ur + " s", handling: skiftUr },
                   { id: "svar", tekst: "Svar →", klasse: "gul", handling: visSvar }]);
            V.podier(function (h) {
                if (f.dd && f.dd.hold !== h) return { ude: true };
                var v = S.vaerdi(n), u = S.udfald(n, h);
                return { plus: { tekst: "+ " + NK.beloeb(v), valgt: u === 1 }, minus: { tekst: "− " + NK.beloeb(v), valgt: u === -1 } };
            });
            return;
        }
        V.skjulKort();
        V.podier(null);
        if (S.rundeFaerdig()) {
            var naeste = S.flereRunder() ? { id: "runde", tekst: "Runde " + (t.runde + 2) + " →", handling: naesteRunde }
                : S.harFinal() ? { id: "final", tekst: "Final →", handling: tilFinal }
                : { id: "resultat", tekst: "Resultat →", handling: tilResultat };
            naeste.klasse = "gul";
            V.visPlakat("tom" + t.runde, "rundeplakat",
                '<div class="stort tilpas">Brættet er tomt</div>'
                + (Q().runder.length > 1 ? '<div class="lille">Runde ' + (t.runde + 1) + " er slut</div>" : ""));
            V.knapper([naeste]);
        } else {
            V.skjulPlakat();
            V.knapper([]);
        }
    }

    function finalPodie(h) {
        return S.deltager(h) ? {} : { ude: true, note: "deltager ikke" };
    }

    function renderFinal(t) {
        var F = Q().final, trin = t.final.trin;
        if (trin === "kategori") {
            V.skjulKort();
            V.visPlakat("final-kat", "finalplakat",
                '<img class="final-logo" src="sprites/final.svg" alt="Final Jeopardy">'
                + '<div class="lille">Kategori</div><div class="stort tilpas">' + F.kategori + "</div>");
            V.knapper([{ id: "tilbage", tekst: "← Brættet", handling: function () { S.tilbageTilBraet(); render(); } },
                       { id: "indsats", tekst: "Indsatser →", klasse: "gul", handling: function () { finalTrin("indsats"); } }]);
            V.podier(finalPodie);
            return;
        }
        if (trin === "indsats") {
            V.skjulKort();
            var html = '<div class="stort">Indsatser</div><div class="indsatsliste">'
                + t.hold.map(function (x, h) {
                    var hoved = '<span class="navn">' + NK.html(x.navn) + '</span><span class="point">' + kr(S.grundpoint(h)) + "</span>";
                    if (!S.deltager(h)) return '<div class="indsatsraekke ude">' + hoved + '<span class="note">deltager ikke</span></div>';
                    return '<div class="indsatsraekke">' + hoved + '<label><input type="number" inputmode="numeric" data-finalh="' + h
                        + '" min="0" max="' + S.grundpoint(h) + '" step="100" value="' + (t.final.indsats[h] || 0) + '"> ' + Q().enhed + "</label></div>";
                }).join("")
                + '</div><div class="lille">Hvert hold satser højst sine egne point.</div>';
            V.visPlakat("final-indsats", "indsatsplakat", html);
            V.knapper([{ id: "tilbage", tekst: "← Kategorien", handling: function () { finalTrin("kategori"); } },
                       { id: "vis", tekst: "Vis ledetråden →", klasse: "gul", handling: function () { gemFinalIndsatser(); finalTrin("spoergsmaal"); } }]);
            V.podier(finalPodie);
            return;
        }
        V.skjulPlakat();
        var svar = trin === "svar";
        V.visKort({ venstre: "Final · " + F.kategori, hoejre: "", tekst: svar ? F.svar : F.ledetraad, svar: svar });
        opdaterUr();
        V.knapper(svar
            ? [{ id: "tilbage", tekst: "← Ledetråden", handling: function () { finalTrin("spoergsmaal"); } },
               { id: "resultat", tekst: "Resultat →", klasse: "gul", handling: tilResultat }]
            : [{ id: "tilbage", tekst: "← Indsatser", handling: function () { finalTrin("indsats"); } },
               { id: "taenk", tekst: urKoerer() ? "Stop tænketiden" : "♪ Tænketid " + D.TAENKETID + " s", handling: skiftTaenketid },
               { id: "svar", tekst: "Svar →", klasse: "gul", handling: function () { finalTrin("svar"); } }]);
        V.podier(function (h) {
            if (!S.deltager(h)) return { ude: true, note: "deltager ikke" };
            if (!svar) return {};
            var w = t.final.indsats[h] || 0, r = t.final.res[h] || 0;
            return { plus: { tekst: "+ " + NK.beloeb(w), valgt: r === 1 }, minus: { tekst: "− " + NK.beloeb(w), valgt: r === -1 } };
        });
    }

    function gemFinalIndsatser() {
        var felter = el("plakat").querySelectorAll("input[data-finalh]");
        for (var i = 0; i < felter.length; i++) S.finalIndsats(+felter[i].getAttribute("data-finalh"), felter[i].value || 0);
    }

    function renderSlut(t) {
        V.skjulKort();
        var vindere = S.vindere(), liste = S.rangliste();
        var noegle = "slut" + liste.map(function (h) { return h + ":" + S.point(h) + ":" + t.hold[h].navn; }).join("|");
        var konfetti = "";
        for (var i = 0; i < 28; i++) {
            konfetti += '<i class="konfetti" style="left:' + (Math.random() * 100).toFixed(1) + "%;animation-delay:" + (Math.random() * 3).toFixed(2)
                + "s;animation-duration:" + (2.8 + Math.random() * 2.4).toFixed(2) + "s;background:" + NK.tilfaeldig(["#ffd92e", "#ffffff", "#7fb2ff", "#ff8a5c"]) + '"></i>';
        }
        V.visPlakat(noegle, "slutplakat",
            konfetti
            + '<div class="lille">' + (vindere.length > 1 ? "Uafgjort mellem" : "Vinderen er") + "</div>"
            + '<div class="stort tilpas vindernavn">' + vindere.map(holdnavn).join(" og ") + "</div>"
            + '<ol class="rangliste">' + liste.map(function (h) {
                return '<li><span>' + holdnavn(h) + "</span><b>" + kr(S.point(h)) + "</b></li>";
            }).join("") + "</ol>");
        V.knapper([{ id: "tilbage", tekst: S.harFinal() ? "← Final" : "← Brættet", handling: tilbageFraResultat },
                   { id: "nyt", tekst: "Nyt spil", klasse: "gul", handling: visTitel }]);
        V.podier(function (h) { return vindere.indexOf(h) >= 0 ? { note: "vinder" } : {}; });
    }

    function render() {
        var t = T();
        el("titel").hidden = !ui.titel;
        if (ui.titel || !t) {
            tegnTitel();
            V.skjulKort();
            V.skjulPlakat();
            V.knapper([]);
        } else {
            if (V.byggetRunde() !== t.runde) V.bygBraet();
            V.opdaterBraet(t.fase === "intro" ? (ui.fylder ? 0 : t.vist) : S.antalKategorier(), ui.fylder);
            if (t.fase === "intro") renderIntro(t);
            else if (t.fase === "braet") renderBraet(t);
            else if (t.fase === "final") renderFinal(t);
            else renderSlut(t);
        }
        document.body.setAttribute("data-skaerm", skaermNavn());
        topknapper();
        status();
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

    function tastatur(e) {
        if (e.key === "Escape") {
            lukOverlay();
            NK.Rundvisning.luk();
            if (laerer && !laerer.afvisTilbud()) laerer.stopIntro();
            return;
        }
        var tag = e.target && e.target.tagName;
        if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) {
            if (e.key === "Enter" && e.target.id === "dd-indsats") { e.preventDefault(); visDD(); }
            return;
        }
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis")) return;
        var k = e.key;
        if (k === "k" || k === "K") { if (laerer && ui.titel) laerer.startIntro("titel", true); return; }
        if (k === "h" || k === "H" || k === "?") { NK.Rundvisning.start(skaermNavn()); return; }
        if (k === "m" || k === "M") { skiftLyd(); return; }
        if (ui.titel || !T()) return;
        if (k === " " || k === "Enter") {
            if (tag === "BUTTON") return;
            e.preventDefault();
            var gul = V.primaer();
            if (gul) gul();
            return;
        }
        if (k === "u" || k === "U") {
            var ur = V.knapHandling("ur") || V.knapHandling("taenk");
            if (ur) ur();
            return;
        }
        var m = /^(Digit|Numpad)([1-6])$/.exec(e.code || "");
        if (m && T().hold[+m[2] - 1]) {
            e.preventDefault();
            bedoem(+m[2] - 1, e.shiftKey ? -1 : 1);
        }
    }

    /* ----- Start ------------------------------------------------------- */
    function start() {
        niveau = niveauFraHash(window.location.hash);
        S.init(aktivQuiz());
        titelFraSpil();

        laerred = new NK.Laerred(el("laerred"));
        if (NK.Sprites) NK.Sprites.start();
        if (NK.Laerer) {
            laerer = new NK.Laerer(laerred);
            NK.laerer = laerer;
            el("spring-over").addEventListener("click", function () { laerer.stopIntro(); });
        }

        /* Titelskaermen */
        el("hold-plus").addEventListener("click", function () {
            if (ui.navne.length < D.MAKS_HOLD) ui.navne.push("Hold " + (ui.navne.length + 1));
            tegnTitel();
        });
        el("hold-minus").addEventListener("click", function () {
            if (ui.navne.length > 1) ui.navne.pop();
            tegnTitel();
        });
        el("holdnavne").addEventListener("input", function (e) {
            var h = e.target.getAttribute("data-h");
            if (h !== null) ui.navne[+h] = e.target.value;
        });
        el("holdnavne").addEventListener("keydown", function (e) {
            if (e.key === "Enter") { e.preventDefault(); if (T()) fortsaet(); else startSpil(); }
        });
        el("urvalg").addEventListener("click", function (e) {
            var b = e.target.closest("button");
            if (!b) return;
            ui.urSek = +b.getAttribute("data-s");
            tegnTitel();
        });
        el("start").addEventListener("click", startSpil);
        el("fortsaet").addEventListener("click", fortsaet);

        /* Egne spoergsmaal: upload, eksport og kontrol mens man skriver */
        el("egneknap").addEventListener("click", aabnEgne);
        el("egne-tekst").addEventListener("input", kontrollerEgne);
        el("egne-brug").addEventListener("click", brugEgne);
        el("egne-eksport").addEventListener("click", eksporterEgne);
        el("egne-ai").addEventListener("click", kopierVejledning);
        el("egne-luk").addEventListener("click", lukOverlay);
        el("egne-standard").addEventListener("click", function () {
            el("egne-tekst").value = NK.Tekstformat.tilTekst(D.QUIZZER[niveau]);
            kontrollerEgne();
        });
        el("egne-upload").addEventListener("click", function () { el("egne-fil").value = ""; el("egne-fil").click(); });
        el("egne-fil").addEventListener("change", function () { laesFil(el("egne-fil").files[0]); });
        el("egne-tekst").addEventListener("dragover", function (e) { e.preventDefault(); });
        el("egne-tekst").addEventListener("drop", function (e) {
            if (!e.dataTransfer || !e.dataTransfer.files.length) return;
            e.preventDefault();
            laesFil(e.dataTransfer.files[0]);
        });
        el("egne").addEventListener("click", function (e) { if (e.target === el("egne")) lukOverlay(); });

        /* Et andet niveau i linket (#b), uden at siden indlaeses igen */
        window.addEventListener("hashchange", function () {
            var nyt = niveauFraHash(window.location.hash);
            if (nyt === niveau) return;
            niveau = nyt;
            indlaesQuiz();
            visTitel();
        });

        /* Braettet: et klik aabner, et dobbeltklik aabner et brugt felt igen */
        el("braet").addEventListener("click", function (e) {
            var b = e.target.closest(".felt");
            if (!b || b.classList.contains("brugt") || b.classList.contains("tom")) return;
            aabnFelt(b.getAttribute("data-n"), b);
        });
        el("braet").addEventListener("dblclick", function (e) {
            var b = e.target.closest(".felt");
            if (!b || !b.classList.contains("brugt")) return;
            aabnFelt(b.getAttribute("data-n"), b);
        });

        el("knapper").addEventListener("click", function (e) {
            var b = e.target.closest("button");
            if (!b || b.disabled) return;
            var f = V.knapHandling(b.getAttribute("data-knap"));
            if (f) f();
        });

        /* Plakaten: holdvalg og indsatser */
        el("plakat").addEventListener("click", function (e) {
            var b = e.target.closest("[data-ddhold]");
            if (!b || !T().aabent) return;
            var i = el("dd-indsats");
            S.ddHold(T().aabent, +b.getAttribute("data-ddhold"));
            if (i && i.value !== "") S.ddIndsats(T().aabent, i.value);
            render();
        });
        el("plakat").addEventListener("input", function (e) {
            var t = T();
            if (e.target.id === "dd-indsats" && t.aabent) {
                S.ddIndsats(t.aabent, e.target.value === "" ? NaN : e.target.value);
                render();
            }
        });
        el("plakat").addEventListener("change", function (e) {
            var t = T();
            if (e.target.id === "dd-indsats" && t.aabent) {
                var v = S.felt(t.aabent).dd.indsats;
                e.target.value = v === null ? "" : v;
            }
            var h = e.target.getAttribute("data-finalh");
            if (h !== null) e.target.value = S.finalIndsats(+h, e.target.value || 0);
        });

        /* Podierne: + og −, og ret point og navne */
        el("podier").addEventListener("click", function (e) {
            var b = e.target.closest("button");
            if (!b) return;
            var h = +b.getAttribute("data-h");
            if (b.classList.contains("plus") || b.classList.contains("minus")) {
                bedoem(h, +b.getAttribute("data-retning"));
            } else if (b.classList.contains("podie-point")) {
                V.retPaaPodie(b, String(S.point(h)), function (v) {
                    if (v !== null) S.saetPoint(h, Number(String(v).replace(/kr\.?/i, "").replace(/[\s.]/g, "").replace(",", ".").replace("−", "-")));
                    render();
                });
            } else if (b.classList.contains("podie-navn")) {
                V.retPaaPodie(b, T().hold[h].navn, function (v) {
                    if (v !== null) S.omdoeb(h, v);
                    render();
                });
            }
        });

        /* Toplinjen */
        el("finalknap").addEventListener("click", tilFinal);
        el("nytknap").addEventListener("click", visTitel);
        el("lydknap").addEventListener("click", skiftLyd);
        el("regelknap").addEventListener("click", function () { el("regler").classList.add("vis"); });
        el("regler-luk").addEventListener("click", lukOverlay);
        el("regler").addEventListener("click", function (e) { if (e.target === el("regler")) lukOverlay(); });
        el("hjaelpknap").addEventListener("click", function () { lukOverlay(); NK.Rundvisning.start(skaermNavn()); });
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

        if (window.ResizeObserver) new window.ResizeObserver(function () { V.tilpasAlt(); }).observe(el("skaerm"));
        else window.addEventListener("resize", V.tilpasAlt);

        NK.app = { render: render, ui: ui, visTitel: visTitel, startSpil: startSpil, fortsaet: fortsaet, aabnFelt: aabnFelt,
            lukFelt: lukFelt, visSvar: visSvar, visDD: visDD, bedoem: bedoem, tilFinal: tilFinal, tilResultat: tilResultat,
            finalTrin: finalTrin, tastatur: tastatur, niveauFraHash: niveauFraHash, aabnEgne: aabnEgne, brugEgne: brugEgne,
            kontrollerEgne: kontrollerEgne, niveau: function () { return niveau; }, egen: function () { return egen; },
            skiftNiveau: function (n) { niveau = n; indlaesQuiz(); visTitel(); } };

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
