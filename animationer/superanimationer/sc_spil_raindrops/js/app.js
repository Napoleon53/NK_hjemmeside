/* Ionregn: skærmene, tasterne og løkken, der binder model, lyd og tegning sammen. */
(function () {
    "use strict";

    var C = CONFIG;
    function $(id) { return document.getElementById(id); }

    var tilstand = "start";      /* start | kalib | spiller | pause | slut */
    var spil = null, startFase = "intro", visT = 0, nedtaelTil = 0, naesteNr = 1;
    var kalibMs = +laes("ionregn.kalibrering", 0) || 0;
    var metronom = { kilde: "metronom", navn: "Metronom", buffer: null, filBpm: C.BPM, spilBpm: C.BPM, offsetMs: 0 };
    var musik = metronom, std = null, klikMed = false;
    var beskedSlut = -Infinity, banner = null, kal = null, nedtael = null;
    var vist = { kolbe: null, maal: null, hud: null };

    /* ---- Små hjælpere ------------------------------------------------- */
    function laes(k, std) { try { var v = localStorage.getItem(k); return v === null ? std : v; } catch (e) { return std; } }
    function gem(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* privat vindue */ } }
    function vis(id, ja) { $(id).hidden = !ja; }
    function skjulLag() { ["lag-start", "lag-kalib", "lag-pause", "lag-slut", "lag-regler"].forEach(function (id) { vis(id, false); }); }
    function filnavn(url) { return String(url || "").split(/[\\/]/).pop(); }
    function tal(n) { return Math.round(n).toLocaleString("da-DK"); }
    function klem(x, a, b) { return Math.max(a, Math.min(b, x)); }
    function fortegnMs(ms) { return (ms > 0 ? "+" : ms < 0 ? Kemi.MINUS : "") + Math.abs(ms) + " ms"; }
    function rate() { return musik.buffer ? klem(musik.spilBpm / musik.filBpm, 0.5, 2) : 1; }

    /* ---- Musikken ----------------------------------------------------- */
    function note(t, advarsel) { $("musik-note").textContent = t || ""; $("musik-note").classList.toggle("advarsel", !!advarsel); }
    function vaelgMusik(m) {
        musik = m;
        opdaterMusikUI();
    }
    function opdaterMusikUI() {
        $("musik-navn").textContent = musik.kilde === "metronom" ? "Metronom" :
            musik.navn + (musik.kilde === "std" ? " (standard)" : "");
        $("f-bpm").value = +musik.spilBpm.toFixed(2);
        $("f-offset").value = Math.round(musik.offsetMs);
        vis("f-offset-label", !!musik.buffer);
        vis("f-klik-label", !!musik.buffer);
        $("f-klik").checked = klikMed;
        vis("std-musik", !!std && musik !== std);
        vis("metronom", musik.kilde !== "metronom");
    }
    function standardFra(buffer) {
        return { kilde: "std", navn: filnavn(C.MUSIC_URL), buffer: buffer,
            filBpm: C.MUSIC_BPM || C.BPM, spilBpm: C.BPM, offsetMs: C.OFFSET_MS };
    }

    function hentStandard() {
        if (!C.MUSIC_URL || /metronom/.test(location.hash)) { hentHusket(); return; }
        if (location.protocol === "file:") {
            note("Standardmusikken hentes kun, når siden ligger på nettet. Vælg filen med Vælg lydfil.");
            hentHusket();
            return;
        }
        note("Henter musikken …");
        Lyd.hentURL(C.MUSIC_URL).then(function (buf) {
            std = standardFra(buf);
            if (musik.kilde === "metronom") vaelgMusik(std); else opdaterMusikUI();
            note("");
        }).catch(function () {
            note("Musikken kunne ikke hentes. Spillet bruger metronom.", true);
            hentHusket();
        });
    }

    /* den sidst valgte lydfil huskes i browseren */
    function db() {
        return new Promise(function (ok, fejl) {
            try {
                var r = indexedDB.open("ionregn", 1);
                r.onupgradeneeded = function () { r.result.createObjectStore("musik"); };
                r.onsuccess = function () { ok(r.result); };
                r.onerror = function () { fejl(r.error); };
            } catch (e) { fejl(e); }
        });
    }
    function gemFil(navn, bytes) {
        db().then(function (d) {
            d.transaction("musik", "readwrite").objectStore("musik").put({ navn: navn, bytes: bytes }, "sidste");
        }).catch(function () { /* ingen lagerplads */ });
    }
    function hentHusket() {
        db().then(function (d) {
            return new Promise(function (ok, fejl) {
                var r = d.transaction("musik").objectStore("musik").get("sidste");
                r.onsuccess = function () { ok(r.result); };
                r.onerror = function () { fejl(r.error); };
            });
        }).then(function (post) {
            if (!post || musik.kilde !== "metronom") return;
            return Lyd.afkod(post.bytes.slice(0)).then(function (buf) {
                if (musik.kilde !== "metronom") return;
                vaelgMusik(fraFil(post.navn, buf, null));
                note("Sidst valgte lydfil er hentet.");
            });
        }).catch(function () { /* intet husket */ });
    }
    /* tempo og første slag: gemte tal, standardens tal eller en ny måling */
    function fraFil(navn, buf, maaling) {
        if (C.MUSIC_URL && navn === filnavn(C.MUSIC_URL)) { var s = standardFra(buf); std = s; return s; }
        var gemt = null;
        try { gemt = JSON.parse(laes("ionregn.fil." + navn, "null")); } catch (e) { gemt = null; }
        var m = gemt || maaling || Lyd.analyser(buf);
        return { kilde: "fil", navn: navn, buffer: buf, filBpm: m.bpm, spilBpm: m.bpm, offsetMs: m.offsetMs };
    }
    function gemFilTal() {
        if (musik.kilde === "fil") gem("ionregn.fil." + musik.navn, JSON.stringify({ bpm: musik.filBpm, offsetMs: musik.offsetMs }));
    }

    $("musikfil").addEventListener("change", function () {
        var fil = this.files && this.files[0], felt = this;
        if (!fil) return;
        note("Læser " + fil.name + " …");
        var laesning = fil.arrayBuffer ? fil.arrayBuffer() : new Promise(function (ok, fejl) {
            var fr = new FileReader(); fr.onload = function () { ok(fr.result); }; fr.onerror = fejl; fr.readAsArrayBuffer(fil);
        });
        laesning.then(function (ab) {
            var kopi = ab.slice(0);
            return Lyd.afkod(ab).then(function (buf) {
                note("Måler tempoet …");
                return new Promise(function (ok) { requestAnimationFrame(function () { requestAnimationFrame(function () { ok(buf); }); }); });
            }).then(function (buf) {
                var erStd = C.MUSIC_URL && fil.name === filnavn(C.MUSIC_URL);
                var m = erStd ? null : Lyd.analyser(buf);
                try { localStorage.removeItem("ionregn.fil." + fil.name); } catch (e) { /* intet */ }
                vaelgMusik(fraFil(fil.name, buf, m));
                gemFil(fil.name, kopi);
                if (erStd) note("Standardmusikken spilles i " + C.BPM + " BPM.");
                else note("Tempo: " + String(m.bpm).replace(".", ",") + " BPM. Første slag efter " + m.offsetMs +
                    " ms. Ret tallene, hvis klikket ikke passer." + (m.sikkerhed < 2.2 ? " Målingen er usikker." : ""), m.sikkerhed < 2.2);
            });
        }).catch(function () {
            note("Lydfilen kunne ikke læses. Prøv en mp3- eller wav-fil.", true);
        }).then(function () { felt.value = ""; });
    });
    $("std-musik").addEventListener("click", function () { if (std) { vaelgMusik(std); note(""); } });
    $("metronom").addEventListener("click", function () { vaelgMusik(metronom); note(""); });
    $("f-bpm").addEventListener("change", function () {
        var v = parseFloat(String(this.value).replace(",", "."));
        if (!(v >= 50 && v <= 240)) { opdaterMusikUI(); return; }
        musik.spilBpm = v;
        if (musik.kilde === "fil") musik.filBpm = v;     /* rettelse af målingen */
        gemFilTal();
        opdaterMusikUI();
    });
    $("f-offset").addEventListener("change", function () {
        var v = parseFloat(String(this.value).replace(",", "."));
        if (isFinite(v)) { musik.offsetMs = v; gemFilTal(); }
        opdaterMusikUI();
    });
    $("f-klik").addEventListener("change", function () { klikMed = this.checked; });

    /* ---- Start ---------------------------------------------------------- */
    $("startvalg").addEventListener("click", function (e) {
        var b = e.target.closest("button");
        if (!b) return;
        startFase = b.getAttribute("data-fase");
        markerStartvalg();
    });
    function markerStartvalg() {
        [].forEach.call($("startvalg").querySelectorAll("button"), function (b) {
            var ja = b.getAttribute("data-fase") === startFase;
            b.classList.toggle("valgt", ja);
            b.setAttribute("aria-checked", ja ? "true" : "false");
        });
    }

    function startSpil() {
        var ctx = Lyd.init();
        if (!ctx) { note("Browseren kan ikke afspille lyd.", true); return; }
        Lyd.vaagn().then(function () {
            Lyd.stopSang();
            var bpm = musik.spilBpm, slagS = 60 / bpm, r = rate();
            var offsetS = musik.buffer ? musik.offsetMs / 1000 / r : 0;
            var slutSlag = musik.buffer ? Math.floor((musik.buffer.duration / r - offsetS) / slagS)
                                        : C.METRONOM_SLUT_TAKT * C.SLAG_PR_TAKT;
            spil = new Spil({ bpm: bpm, startFase: startFase, slutSlag: slutSlag });
            var startSek = (spil.startTakt - 1) * C.SLAG_PR_TAKT * slagS;
            if (spil.startTakt === 1) startSek = musik.buffer ? -offsetS : -slagS;
            var foerste = C.FASER.filter(function (f) { return f.fra >= spil.foersteIonTakt && f.moenster !== "ingen"; })[0];
            nedtaelTil = foerste ? (foerste.fra - 1) * C.SLAG_PR_TAKT : 0;
            naesteNr = foerste ? foerste.nr : 1;
            if (musik.buffer && slutSlag < nedtaelTil + 8) {
                note("Musikken er for kort til at begynde her.", true);
                spil = null;
                return;
            }
            Lyd.startSang({ buffer: musik.buffer, bpm: bpm, offsetS: offsetS, startSek: startSek, klik: klikMed, rate: r });
            visT = startSek;
            Tegning.nulstil();
            beskedSlut = -Infinity; banner = null; nedtael = null;
            vist = { kolbe: null, maal: null, hud: null };
            saetBesked("", "");
            skjulLag();
            tilstand = "spiller";
            haandter(spil.tagHaendelser());
        });
    }
    $("startknap").addEventListener("click", startSpil);

    /* ---- Løkken ---------------------------------------------------------- */
    var sidsteTs = null;
    function loop(ts) {
        requestAnimationFrame(loop);
        var dt = sidsteTs === null ? 0 : Math.min(0.1, (ts - sidsteTs) / 1000);
        sidsteTs = ts;
        if (spil && (tilstand === "spiller" || tilstand === "pause" || tilstand === "slut")) {
            if (tilstand === "spiller") {
                Lyd.planlaeg();
                visT = Lyd.sekVed(Lyd.hoerbar());
                spil.opdater(visT - kalibMs / 1000);
                if (musik.buffer && Lyd.sangSlut() && !spil.slut) spil.afslut("musik");
                haandter(spil.tagHaendelser());
            }
            if (tilstand === "pause" && nedtael) koerNedtaelling();
            var slag = visT / spil.slagS;
            var styrke = slag < nedtaelTil ? 0.8 : 0.32;
            Tegning.tegnRegn(dt, tilstand === "spiller" ? slag : null, styrke);
            Tegning.tegnSpil(spil, visT, slag, storTekst(slag));
            if (tilstand === "spiller" && visT > beskedSlut && beskedSlut > -Infinity) { saetBesked("", ""); beskedSlut = -Infinity; }
            opdaterHUD();
        } else {
            Tegning.tegnRegn(dt, null, 0.8);
            Tegning.tegnSpil(null, 0, 0, null);
            if (tilstand === "kalib") opdaterKalib();
        }
    }

    /* nedtælling til første ion og bannere for nye niveauer */
    function storTekst(slag) {
        if (banner && visT >= banner.fra && visT < banner.til) {
            var u = (visT - banner.fra) / (banner.til - banner.fra);
            return { stor: banner.stor, lille: banner.lille, storAlfa: 0.85 * Math.min(1, 3 * (1 - u)) };
        }
        var til = nedtaelTil - slag;
        if (til > 0 && til <= 8 * C.SLAG_PR_TAKT + 4) {
            var takter = Math.ceil(til / C.SLAG_PR_TAKT);
            if (til <= C.SLAG_PR_TAKT) return { stor: String(Math.ceil(til)), lille: "Fang ionerne på linjen", storAlfa: 0.9 };
            return { stor: String(takter), lille: "takter til niveau " + naesteNr, storAlfa: 0.5 };
        }
        return null;
    }

    /* ---- Hændelser fra modellen -------------------------------------- */
    var FARVE_DOM = { perfekt: "#eafff1", god: "#00ff66" };
    function haandter(liste) {
        liste.forEach(function (h) {
            var slagS = spil.slagS;
            if (h.type === "fang") {
                h.ion.tVis = visT;
                if (h.res === "fejl") {
                    Tegning.effekt({ type: "ring", bane: h.ion.bane, t: visT, varighed: 0.35, farve: Tegning.FARVE.fejl });
                    Tegning.effekt({ type: "tekst", bane: h.ion.bane, t: visT, varighed: 0.6, tekst: "FORKERT", farve: Tegning.FARVE.fejl });
                } else {
                    Tegning.effekt({ type: "ring", bane: h.ion.bane, t: visT, varighed: 0.3, farve: FARVE_DOM[h.dom] });
                    Tegning.effekt({ type: "tekst", bane: h.ion.bane, t: visT, varighed: 0.55, tekst: h.dom === "perfekt" ? "PERFEKT" : "GOD", farve: FARVE_DOM[h.dom] });
                    if (h.res !== "forbindelse") Lyd.effekt(h.dom);
                }
            } else if (h.type === "forbi") {
                Tegning.effekt({ type: "tekst", bane: h.bane, t: visT, varighed: 0.45, tekst: "MISS", farve: "rgba(255,120,120,0.8)" });
            } else if (h.type === "miss") {
                Tegning.effekt({ type: "tekst", bane: h.ion.bane, t: visT, varighed: 0.7, tekst: Kemi.MINUS + C.INTEGRITET.miss + " %", farve: Tegning.FARVE.fejl });
                ramt();
            } else if (h.type === "forbindelse") {
                var f = h.forb;
                saetBesked("ok", '<span><span class="formel">' + f.html + '</span><span class="navn">' + f.navn +
                    '</span><span class="point">+' + tal(h.point) + (h.bonus ? " inkl. bonus" : "") + "</span></span>");
                beskedSlut = visT + C.SLAG_PR_TAKT * slagS;
                Lyd.effekt("forbindelse");
            } else if (h.type === "fejl") {
                saetBesked("fejl", '<span class="lavet">' + h.lavet + '</span><span class="aarsag">' + h.aarsag + "</span>");
                beskedSlut = visT + 2 * C.SLAG_PR_TAKT * slagS;
                Lyd.effekt("fejl");
                ramt();
            } else if (h.type === "fase") {
                var fa = h.fase;
                banner = { stor: "NIVEAU " + fa.nr, lille: fa.navn + "\n" + faseTekst(fa), fra: visT, til: visT + C.SLAG_PR_TAKT * slagS };
            } else if (h.type === "slut") {
                afslutSpil(h.grund);
            }
        });
    }
    function faseTekst(f) {
        if (f.maal === "formel") return "Lav stoffet med formlen";
        if (f.maal === "navn") return "Find formlen ud fra navnet";
        return "Byg selv. 4 eller 5 ioner giver bonus";
    }
    function ramt() {
        var el = $("hud-integritet");
        el.classList.remove("ramt"); void el.offsetWidth; el.classList.add("ramt");
    }
    function saetBesked(klasse, html) {
        var b = $("besked");
        b.className = "besked" + (klasse ? " " + klasse : "");
        if (klasse) { void b.offsetWidth; }
        b.innerHTML = html;
    }

    /* ---- Toplinje, mål og kolbe --------------------------------------- */
    function opdaterHUD() {
        var m = spil.mult(), streak = spil.streak, f = spil.fase;
        var noegle = [f.id, spil.point, m, streak, Math.round(spil.integritet)].join("|");
        if (noegle !== vist.hud) {
            vist.hud = noegle;
            $("hud-niveau").textContent = f.nr ? f.nr + " " + f.navn : "Intro";
            $("hud-point").textContent = tal(spil.point);
            $("hud-mult").textContent = "×" + m;
            var fyldt = m >= C.COMBO.maks ? C.COMBO.pr : streak % C.COMBO.pr;
            [].forEach.call($("hud-prikker").children, function (p, i) { p.classList.toggle("fuld", i < fyldt); });
            var I = spil.integritet;
            $("hud-int").style.width = I + "%";
            $("hud-int-tal").textContent = Math.round(I) + " %";
            $("hud-integritet").classList.toggle("lav", I < 50 && I >= 25);
            $("hud-integritet").classList.toggle("kritisk", I < 25);
        }

        var vm = spil.visMaal(), etiket, tekst;
        if (vm && vm.maal) {
            etiket = "Lav";
            tekst = vm.fase.maal === "navn" ? vm.maal.forb.navn : vm.maal.forb.html;
        } else if (f.moenster !== "ingen" && !f.maal) {
            etiket = "Byg";
            tekst = "en neutral forbindelse<small>4 eller 5 ioner giver bonus</small>";
        } else {
            etiket = "Klar";
            tekst = "Ionerne kommer om lidt";
        }
        var mn = etiket + tekst;
        if (mn !== vist.maal) {
            var nyt = vist.maal !== null;
            vist.maal = mn;
            $("maal-etiket").textContent = etiket;
            $("maal").innerHTML = tekst;
            var bar = $("maalbar");
            bar.classList.remove("nyt");
            if (nyt) { void bar.offsetWidth; bar.classList.add("nyt"); }
        }

        var kn = spil.kolbe.join(",");
        if (kn !== vist.kolbe) {
            vist.kolbe = kn;
            $("kolbe-ioner").innerHTML = spil.kolbe.map(function (id) {
                return '<span class="ion ' + (Kemi.erKation(id) ? "k" : "a") + '">' + Kemi.ionHTML(id) + "</span>";
            }).join("");
            var q = spil.ladning();
            $("ladning").innerHTML = "Ladning: <b>" + Kemi.samletLadningTekst(q) + "</b>";
            $("ladning").classList.toggle("nul", q === 0);
        }
    }

    /* ---- Taster og tryk ----------------------------------------------- */
    function trykBane(b, e) {
        var t = Lyd.hoerbarVed(e);
        var sek = Lyd.sekVed(t) - kalibMs / 1000;
        Tegning.blink(b, visT);
        spil.tryk(b, sek);
        haandter(spil.tagHaendelser());
    }

    document.addEventListener("keydown", function (e) {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        var k = (e.key || "").toLowerCase(), b = C.TASTER.indexOf(k);
        var tag = e.target && e.target.tagName;
        if (!$("lag-regler").hidden) {
            if (k === "escape" || k === "enter") { e.preventDefault(); lukRegler(); }
            return;
        }
        if (tilstand === "spiller") {
            if (b >= 0) { e.preventDefault(); Tegning.saetTaster(true); if (!e.repeat) trykBane(b, e); return; }
            if (k === " " || k === "escape" || k === "p") { e.preventDefault(); pauseSpil(); }
            return;
        }
        if (e.repeat) return;
        if (tilstand === "kalib") {
            if (b >= 0 || k === " ") { e.preventDefault(); kalibTryk(e); }
            else if (k === "escape") lukKalib();
            return;
        }
        if (tilstand === "pause") {
            if (k === " " || k === "enter" || k === "p") { e.preventDefault(); fortsaetSpil(); }
            return;
        }
        if (tilstand === "slut") {
            if (k === "r" || (k === "enter" && tag !== "BUTTON")) { e.preventDefault(); startSpil(); }
            else if (k === "escape") tilStart();
            return;
        }
        if (tilstand === "start" && k === "enter" && tag !== "BUTTON" && tag !== "INPUT" && tag !== "LABEL") {
            e.preventDefault(); startSpil();
        }
    });

    $("scene").addEventListener("pointerdown", function (e) {
        if (tilstand !== "spiller") return;
        e.preventDefault();
        var r = $("spil").getBoundingClientRect();
        var b = Tegning.baneVed(e.clientX - r.left);
        if (b >= 0) trykBane(b, e);
    });
    $("scene").addEventListener("contextmenu", function (e) { e.preventDefault(); });

    /* ---- Pause ----------------------------------------------------------- */
    function pauseSpil() {
        if (tilstand !== "spiller") return;
        tilstand = "pause";
        Lyd.pause();
        visPause();
    }
    function visPause() {
        nedtael = null;
        $("pause-titel").textContent = "Pause";
        vis("pause-nedtael", false);
        vis("pause-knapper", true);
        vis("lag-pause", true);
        $("fortsaet").focus();
    }
    function fortsaetSpil() {
        if (tilstand !== "pause" || nedtael) return;
        vis("pause-knapper", false);
        vis("pause-nedtael", true);
        $("pause-titel").textContent = "Klar";
        nedtael = { slut: performance.now() + 1500 };
    }
    function koerNedtaelling() {
        var rest = nedtael.slut - performance.now();
        $("pause-nedtael").textContent = String(Math.max(1, Math.ceil(rest / 500)));
        if (rest <= 0) {
            nedtael = null;
            vis("lag-pause", false);
            Lyd.fortsaet().then(function () { if (tilstand === "pause") tilstand = "spiller"; });
        }
    }
    $("pauseknap").addEventListener("click", function () { if (tilstand === "spiller") pauseSpil(); else if (tilstand === "pause") fortsaetSpil(); });
    $("fortsaet").addEventListener("click", fortsaetSpil);
    $("genstart").addEventListener("click", function () { vis("lag-pause", false); startSpil(); });
    $("afslut").addEventListener("click", function () {
        vis("lag-pause", false);
        if (spil) { spil.afslut("afbrudt"); haandter(spil.tagHaendelser()); }
    });
    function tabFokus() {
        if (tilstand === "spiller") pauseSpil();
        else if (tilstand === "pause" && nedtael) visPause();
    }
    window.addEventListener("blur", tabFokus);
    document.addEventListener("visibilitychange", function () { if (document.hidden) tabFokus(); });

    /* ---- Slut ------------------------------------------------------------ */
    function afslutSpil(grund) {
        if (grund === "integritet") Lyd.effekt("slut");
        Lyd.stopSang();
        tilstand = "slut";
        $("slut-titel").textContent = grund === "integritet" ? "SYSTEMFEJL" : grund === "afbrudt" ? "Spillet er afsluttet" : "Sangen er slut";
        $("s-point").textContent = tal(spil.point);
        $("s-combo").textContent = spil.maksStreak + (spil.maksStreak === 1 ? " forbindelse" : " i træk");
        $("s-perfekt").textContent = tal(spil.perfekte);
        $("s-forb").textContent = tal(spil.forbindelser);
        var liste = spil.forkerte;
        $("s-forkerte").innerHTML = liste.map(function (x) {
            var rigtig = x.rigtigHTML ? '<span class="rigtig">' + (x.fri ? "En mulig løsning: " : "Rigtigt: ") +
                "<b>" + x.rigtigHTML + "</b> " + x.rigtigNavn + '<span class="opskrift">' + x.opskrift + "</span></span>" : "";
            return "<li><span class=\"lavet\">" + x.lavet + "</span>" + (x.gange > 1 ? ' <span class="gange">(' + x.gange + " gange)</span>" : "") +
                '<span class="aarsag">' + x.aarsag + "</span>" + rigtig + "</li>";
        }).join("");
        vis("s-forkerte-boks", liste.length > 0);
        vis("s-ingen", liste.length === 0);
        vis("lag-slut", true);
        $("igen").focus();
    }
    $("igen").addEventListener("click", startSpil);
    $("tilstart").addEventListener("click", tilStart);
    function tilStart() {
        Lyd.stopSang();
        spil = null;
        tilstand = "start";
        skjulLag();
        vis("lag-start", true);
        $("maal-etiket").textContent = "Klar";
        $("maal").textContent = "Tryk Start";
        $("kolbe-ioner").innerHTML = "";
        $("ladning").innerHTML = "Ladning: <b>0</b>";
        saetBesked("", "");
        opdaterMusikUI();
    }

    /* ---- Kalibrering ------------------------------------------------------ */
    function opdaterKalibNote() {
        $("kalib-note").textContent = kalibMs ? "Kalibrering: " + fortegnMs(kalibMs) : "Ikke kalibreret.";
    }
    function aabnKalib() {
        Lyd.stopSang();
        kal = null;
        tilstand = "kalib";
        skjulLag();
        vis("lag-kalib", true);
        var html = "";
        for (var i = 0; i < 12; i++) html += '<span class="' + (i < 4 ? "lyt" : "") + '">' + ((i % 4) + 1) + "</span>";
        $("kalib-prikker").innerHTML = html;
        $("kalib-status").textContent = kalibMs ? "Nu: " + fortegnMs(kalibMs) + "." : "";
        $("kalib-start").focus();
    }
    function kalibStart() {
        if (!Lyd.init()) return;
        Lyd.vaagn().then(function () {
            var bpm = musik.spilBpm;
            kal = { tider: Lyd.kalibreringsKlik(bpm), tryk: {}, slagS: 60 / bpm };
            kal.slut = kal.tider[11] + 0.7;
            $("kalib-start").blur();
            [].forEach.call($("kalib-prikker").children, function (p) { p.classList.remove("ramt", "nu"); });
        });
    }
    function kalibTryk(e) {
        if (!kal) return;
        var t = Lyd.hoerbarVed(e), bedst = -1, d = Infinity;
        for (var k = 4; k < 12; k++) {
            var x = Math.abs(t - kal.tider[k]);
            if (x < d) { d = x; bedst = k; }
        }
        if (bedst >= 0 && d <= 0.45 * kal.slagS && kal.tryk[bedst] === undefined) kal.tryk[bedst] = t - kal.tider[bedst];
    }
    function opdaterKalib() {
        if (!kal) return;
        var nu = Lyd.hoerbar(), prikker = $("kalib-prikker").children;
        for (var k = 0; k < 12; k++) {
            prikker[k].classList.toggle("nu", nu >= kal.tider[k] && nu < kal.tider[k] + 0.15);
            prikker[k].classList.toggle("ramt", kal.tryk[k] !== undefined);
        }
        $("kalib-status").textContent = nu < kal.tider[4] - 0.15 ? "Lyt …" : "Tryk med!";
        if (nu < kal.slut) return;
        var v = Object.keys(kal.tryk).map(function (k) { return kal.tryk[k]; });
        if (v.length >= 5) {
            var gns = v.reduce(function (a, b) { return a + b; }, 0) / v.length;
            var sd = Math.sqrt(v.reduce(function (a, b) { return a + (b - gns) * (b - gns); }, 0) / v.length);
            kalibMs = Math.round(gns * 1000);
            gem("ionregn.kalibrering", kalibMs);
            $("kalib-status").textContent = "Du trykker i gennemsnit " + Math.abs(kalibMs) + " ms " +
                (kalibMs >= 0 ? "efter" : "før") + " klikket. Korrektionen er gemt." +
                (sd > 0.06 ? " Trykkene var ujævne, så prøv gerne igen." : "");
        } else {
            $("kalib-status").textContent = "Kun " + v.length + " af 8 tryk ramte et klik. Prøv igen.";
        }
        kal = null;
        opdaterKalibNote();
    }
    function lukKalib() {
        kal = null;
        tilstand = "start";
        skjulLag();
        vis("lag-start", true);
        opdaterKalibNote();
    }
    $("kalibknap").addEventListener("click", aabnKalib);
    $("kalib-start").addEventListener("click", kalibStart);
    $("kalib-nul").addEventListener("click", function () {
        kalibMs = 0; gem("ionregn.kalibrering", 0);
        $("kalib-status").textContent = "Korrektionen er nulstillet.";
        opdaterKalibNote();
    });
    $("kalib-luk").addEventListener("click", lukKalib);
    $("lag-kalib").addEventListener("pointerdown", function (e) {
        if (kal && !e.target.closest("button")) { e.preventDefault(); kalibTryk(e); }
    });

    /* ---- Regler ----------------------------------------------------------- */
    function fyldRegler() {
        var P = C.POINT, I = C.INTEGRITET, M = Kemi.MINUS, T = C.TASTER.map(function (t) { return "<kbd>" + t.toUpperCase() + "</kbd>"; }).join(" ");
        var faser = C.FASER.filter(function (f) { return f.nr > 0; });
        $("regel-liste").innerHTML = [
            "Tryk på banen (" + T + "), når ionen rammer linjen. Perfekt (±" + C.VINDUE_MS.perfekt + " ms) giver " + P.perfekt +
                " point, god (±" + C.VINDUE_MS.god + " ms) giver " + P.god + ".",
            "Fang kun de ioner, du kan bruge. Resten må gerne falde forbi.",
            "Når ladningen i kolben er 0, er forbindelsen dannet: " + tal(P.forbindelse) + " point.",
            faser.map(function (f) { return "<b>Niveau " + f.nr + "</b>: " + faseTekst(f).toLowerCase() + "."; }).join(" "),
            "Combo: ×2, ×3 og ×4 efter " + C.COMBO.pr + ", " + 2 * C.COMBO.pr + " og " + 3 * C.COMBO.pr + " forbindelser i træk. En fejl nulstiller den.",
            "Systemintegritet: en forkert forbindelse koster " + I.forkert + " %, en ion, du skulle have fanget, " + I.miss +
                " %. En forbindelse giver " + I.forbindelse + " % tilbage. Ved 0 % er spillet slut."
        ].map(function (t) { return "<li>" + t + "</li>"; }).join("");
    }
    var foerRegler = null;
    $("regelknap").addEventListener("click", function () {
        if (tilstand === "spiller") pauseSpil();
        foerRegler = document.activeElement;
        vis("lag-regler", true);
        $("regel-luk").focus();
    });
    function lukRegler() {
        vis("lag-regler", false);
        if (foerRegler && foerRegler.focus) foerRegler.focus();
    }
    $("regel-luk").addEventListener("click", lukRegler);

    /* ---- Opstart ---------------------------------------------------------- */
    Tegning.init($("regn"), $("spil"));
    Tegning.saetTaster(!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches));
    window.addEventListener("resize", function () { Tegning.tilpas(); });
    var h = location.hash.toLowerCase();
    var m = /niveau([123])/.exec(h);
    if (m) startFase = "n" + m[1];
    markerStartvalg();
    fyldRegler();
    opdaterMusikUI();
    opdaterKalibNote();
    hentStandard();
    requestAnimationFrame(loop);

    /* til selvtesten */
    window.Ionregn = {
        tilstand: function () { return tilstand; }, spil: function () { return spil; }, musik: function () { return musik; },
        start: startSpil, pause: pauseSpil, kalibMs: function () { return kalibMs; },
        kal: function () { return kal; }
    };
})();
