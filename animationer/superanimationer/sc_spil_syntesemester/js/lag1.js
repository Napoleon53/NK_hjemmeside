/* =====================================================================
   lag1.js - Grupperne: molekylerne dukker op i ni huller, og eleven slaar
   dem, der hoerer til gruppen paa skiltet oeverst

   Eleven vaelger niveauet paa startkortet. Niveau 1-9 er oevelse og
   fortsaetter op gennem niveauerne; kun et spil, der begynder paa niveau
   10, giver rekord og top 10 (Niels 27. nov. 2026).

   Gruppen staar stort paa skiltet oeverst, og naar den skifter, staar
   den nye gruppe midt i scenen et oejeblik, mens bordet er tomt og tiden
   staar stille (Niels: "det er meget uklart hvilken gruppe man har lige
   nu"). Molekylerne er sorte; gruppen bliver kun groen i forklaringen
   efter et forkert slag og paa kortet med en ny stofklasse.

   Et rigtigt slag giver point gange serien (×1 til ×5). Et forkert slag
   koster et liv, og spillet staar stille, mens kortet forklarer. Et
   molekyle fra gruppen, der smutter, bryder serien.

   Balancen staar i D.LAG1 (data.js). Hullerne har tasterne 1-9 som et
   numerisk tastatur: 7 8 9 foroven, 1 2 3 forneden.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var C = D.LAG1;
    var L = NK.Spillyd;
    var $ = NK.el;
    function App() { return NK.App; }

    var NOEGLE_NIVEAU = "nk-syntese-1-niveau";
    var REKORD = C.REKORD_NIVEAU - 1;     /* indekset paa niveau 10 */
    var huller = [];
    var s = null;
    var raf = 0, sidst = 0;
    var valgtNiv = NK.klamp(Number(NK.hent(NOEGLE_NIVEAU, 0)) || 0, 0, C.NIVEAUER.length - 1);

    /* ----- Niveauerne og grupperne ------------------------------------- */
    function niveau(n, tempo) {
        var b = C.NIVEAUER[Math.min(n, C.NIVEAUER.length - 1)];
        if (!b.alle) return b;
        var k = Math.pow(C.HURTIGERE, tempo || 0);
        return { navn: b.navn, typer: b.typer, alle: true, maks: b.maks,
                 oppe: Math.max(1000, Math.round(b.oppe * k)), nyt: Math.max(420, Math.round(b.nyt * k)) };
    }

    function maalAf(noegle) {
        if (noegle.indexOf("t:") === 0) {
            var t = D.TEST[noegle.slice(2)];
            return { noegle: noegle, test: noegle.slice(2), klasser: t.klasser, foran: "Slå alle stoffer, der", stort: t.tekst, gruppe: "" };
        }
        var k = D.KLASSER[noegle];
        return { noegle: noegle, klasse: noegle, klasser: [noegle], foran: "Slå alle", stort: k.flertal, gruppe: k.gruppe + " · " + k.kort };
    }

    function erMaal(stof) { return s.maal.klasser.indexOf(stof.klasse) >= 0; }
    function prMaal() { return C.NIVEAUER[Math.min(s.nivNr, C.NIVEAUER.length - 1)].prMaal || C.PR_MAAL; }

    /* ----- Hullerne -------------------------------------------------------- */
    function tastFor(i) { var r = Math.floor(i / 3), c = i % 3; return (2 - r) * 3 + c + 1; }

    function init() {
        var bord = $("l1-bord");
        bord.innerHTML = "";
        huller = [];
        for (var i = 0; i < 9; i++) {
            var h = document.createElement("div");
            h.className = "hul";
            h.innerHTML = '<div class="hul-bag"></div><div class="vindue"><div class="molkort"><div class="mk-mol"></div>' +
                '<div class="mk-navn"></div></div></div><div class="hul-for"></div><span class="hul-tast">' + tastFor(i) + "</span>";
            bord.appendChild(h);
            var o = { el: h, kort: h.querySelector(".molkort"), mol: h.querySelector(".mk-mol"), navn: h.querySelector(".mk-navn"), aktiv: null };
            huller.push(o);
            (function (idx) {
                o.kort.addEventListener("pointerdown", function (e) { e.preventDefault(); e.stopPropagation(); slag(idx, e); });
            }(i));
        }
        bord.addEventListener("pointerdown", function (e) {
            if (!s || !s.koerer) return;
            bonk(e.clientX, e.clientY, true);
        });
        document.addEventListener("visibilitychange", function () {
            if (document.hidden && s && s.koerer && !s.pauset) { pause(); App().spilknap(); }
        });
    }

    function scenePunkt(x, y) {
        var r = $("scene").getBoundingClientRect();
        return { x: x - r.left, y: y - r.top };
    }

    /* Stjernen, hvor hammeren rammer */
    function bonk(cx, cy, tom) {
        var p = scenePunkt(cx, cy);
        var b = document.createElement("div");
        b.className = "bonk" + (tom ? " tom" : "");
        b.style.left = p.x + "px";
        b.style.top = p.y + "px";
        $("popper").appendChild(b);
        setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 380);
    }

    function tegn(h) {
        var r = h.kort.getBoundingClientRect();
        K.tegnI(h.mol, h.aktiv.stof, { skala: 46, maksB: Math.max(60, r.width - 14), maksH: Math.max(40, r.height - 30) });
    }

    function op(i, stof) {
        var h = huller[i];
        h.aktiv = { stof: stof, maal: erMaal(stof), tilbage: s.niv.oppe * NK.r(0.9, 1.1), slaaet: false };
        h.kort.className = "molkort";
        h.navn.textContent = "";
        tegn(h);
        void h.kort.offsetWidth;
        h.kort.classList.add("op");
        s.sidsteHuller.push(i);
        if (s.sidsteHuller.length > 3) s.sidsteHuller.shift();
        s.sidsteStoffer.push(stof.navn);
        if (s.sidsteStoffer.length > 6) s.sidsteStoffer.shift();
        L.spil("op");
    }

    function ned(i, smuttet) {
        var h = huller[i];
        if (!h.aktiv) return;
        if (smuttet && h.aktiv.maal && !h.aktiv.slaaet) {
            s.serie = 0;
            s.faktor = 1;
            s.smuttede++;
            L.spil("smut");
            visSkilt(false);
        }
        h.aktiv = null;
        h.kort.classList.remove("op");
    }

    /* Alle molekyler ned; et molekyle, der lige er slaaet, gaar selv ned
       (undtagen ved stop) */
    function rydBord(alle) {
        huller.forEach(function (h, i) { if (h.aktiv && (alle || !h.aktiv.slaaet)) ned(i, false); });
    }

    /* ----- Valget af molekyle ---------------------------------------------- */
    function vaelgStof() {
        var paaBordet = {};
        huller.forEach(function (h) { if (h.aktiv) paaBordet[h.aktiv.stof.navn] = true; });
        function fra(klasser) {
            var liste = [];
            klasser.forEach(function (k) { K.alle(k).forEach(function (x) { liste.push(x); }); });
            var friske = liste.filter(function (x) { return !paaBordet[x.navn] && s.sidsteStoffer.indexOf(x.navn) < 0; });
            if (!friske.length) friske = liste.filter(function (x) { return !paaBordet[x.navn]; });
            return friske.length ? NK.tilfaeldig(friske) : null;
        }
        var maalNu = Math.random() < C.ANDEL_MAAL || s.udenMaal >= 2;
        var valgt = null;
        if (maalNu) {
            var mulige = s.maal.klasser.filter(function (k) { return s.niv.typer.indexOf(k) >= 0; });
            valgt = fra([NK.tilfaeldig(mulige.length ? mulige : s.maal.klasser)]);
        }
        if (!valgt) {
            var andre = s.niv.typer.filter(function (k) { return s.maal.klasser.indexOf(k) < 0; });
            var ligner = [];
            s.maal.klasser.forEach(function (k) {
                (D.LIGNER[k] || []).forEach(function (x) { if (andre.indexOf(x) >= 0) ligner.push(x); });
            });
            var klasse = ligner.length && Math.random() < 0.5 ? NK.tilfaeldig(ligner) : NK.tilfaeldig(andre);
            valgt = fra([klasse]);
        }
        if (valgt) s.udenMaal = erMaal(valgt) ? 0 : s.udenMaal + 1;
        return valgt;
    }

    function frietHul() {
        var frie = [];
        huller.forEach(function (h, i) { if (!h.aktiv && s.sidsteHuller.indexOf(i) < 0) frie.push(i); });
        if (!frie.length) huller.forEach(function (h, i) { if (!h.aktiv) frie.push(i); });
        return frie.length ? NK.tilfaeldig(frie) : -1;
    }

    /* ----- Slaget --------------------------------------------------------- */
    function slag(i, e) {
        if (!s || !s.koerer) return;
        if (s.pauset || s.venter || s.skift > 0 || s.skiftVent) { blinkKort(); return; }
        var h = huller[i];
        if (e) bonk(e.clientX, e.clientY, !h.aktiv || h.aktiv.slaaet);
        else {
            var r = h.el.getBoundingClientRect();
            bonk(r.left + r.width / 2, r.top + r.height * 0.45, !h.aktiv || h.aktiv.slaaet);
        }
        if (!h.aktiv || h.aktiv.slaaet) return;
        var a = h.aktiv;
        a.slaaet = true;
        /* Hullets plads, ikke kortets: kortet kan vaere paa vej op */
        var r2 = h.el.getBoundingClientRect(), p = scenePunkt(r2.left + r2.width / 2, r2.top + r2.height * 0.25);
        h.navn.textContent = a.stof.navn;
        if (a.maal) {
            var gevinst = (C.POINT + C.POINT_PR_NIVEAU * s.nivNr) * s.faktor;
            s.point += gevinst;
            s.serie++;
            s.bedsteSerie = Math.max(s.bedsteSerie, s.serie);
            s.faktor = Math.min(C.MAKS_FAKTOR, 1 + Math.floor(s.serie / C.SERIE));
            s.rigtige++;
            s.iMaal++;
            s.iTempo++;
            h.kort.classList.add("ramt");
            L.spil("bonk", { faktor: s.faktor });
            App().pop(p.x, p.y, "+" + gevinst, "plus");
            sidste(a.stof, true);
            a.tilbage = 520;
            visSkilt(false);
            panel();
            if (s.iMaal >= prMaal()) naesteMaal();
        } else {
            s.liv--;
            s.serie = 0;
            s.faktor = 1;
            var fejl = s.maal.noegle + "|" + a.stof.klasse;
            s.fejl[fejl] = (s.fejl[fejl] || 0) + 1;
            h.kort.classList.add("forkert");
            L.spil("forkert");
            App().pop(p.x, p.y, "−1 liv", "minus");
            sidste(a.stof, false);
            panel();
            visSkilt(false);
            fejlKort(a.stof, function () {
                ned(i, false);
                if (s.liv <= 0) slut("Tre forkerte slag");
            });
        }
    }

    function blinkKort() {
        var v = $("valgkort");
        if (v.hidden) return;
        v.classList.remove("blink");
        void v.offsetWidth;
        v.classList.add("blink");
    }

    /* ----- Kortene midt i scenen --------------------------------------------- */
    function kortHTML(titel, krop, knap) {
        return '<p class="vk-titel">' + titel + "</p>" + krop +
            '<div class="vk-knapper"><button class="knap stor blaa" type="button" id="vk-videre">' + knap + " ↵</button></div>";
    }

    function visValg(html, klasse, videre) {
        var v = $("valgkort");
        v.className = "valgkort " + (klasse || "");
        v.innerHTML = html;
        v.hidden = false;
        s.venter = true;
        s.videre = function () {
            v.hidden = true;
            s.venter = false;
            s.videre = null;
            videre();
        };
        $("vk-videre").addEventListener("click", function () { if (s && s.videre) s.videre(); });
        Array.prototype.forEach.call(v.querySelectorAll("[data-tegn]"), function (el) {
            var st = K.stof(el.getAttribute("data-tegn"));
            var lille = el.classList.contains("lille");
            K.tegnI(el, st, { skala: 42, maksB: lille ? 190 : 300, maksH: lille ? 90 : 130, fremhaev: el.getAttribute("data-fremhaev") || null });
        });
    }

    function fejlKort(stof, videre) {
        var maalTekst = s.maal.test ? "Du skal slå stoffer, der " + D.TEST[s.maal.test].tekst + ". " + D.TEST[s.maal.test].hvorfor :
            "Du skal slå " + D.KLASSER[s.maal.klasse].flertal + ": " + D.KENDES_PAA[s.maal.klasse].charAt(0).toLowerCase() +
            D.KENDES_PAA[s.maal.klasse].slice(1);
        var k = D.KLASSER[stof.klasse];
        var art = stof.klasse === "aldehyd" || stof.klasse === "amid" ? "et" : "en";
        var html = kortHTML("Forkert slag: " + stof.navn + " er " + art + " " + k.navn,
            '<div class="vk-mol" data-tegn="' + NK.html(stof.navn) + '" data-fremhaev="' + stof.klasse + '"></div>' +
            '<p class="vk-tekst"><b>' + NK.stortForbogstav(k.navn) + ":</b> " + D.KENDES_PAA[stof.klasse] +
            " Gruppen er grøn på tegningen.</p>" +
            '<p class="vk-tekst">' + maalTekst + "</p>",
            s.liv > 0 ? "Fortsæt" : "Se resultatet");
        visValg(html, "fejl", videre);
    }

    /* Kortet, naar et niveau begynder: stofklasserne (eller testene) med et eksempel */
    function niveauKort(n, nye, videre) {
        var b = C.NIVEAUER[n];
        var titel = "Niveau " + (n + 1) + ": " + (b.navn.charAt(0) === "+" ? "ny stofklasse" + (nye.length > 1 ? "r" : "") : b.navn.toLowerCase());
        var krop;
        if (b.test) {
            krop = '<div class="vk-tests">' + b.maal.map(function (m) {
                var t = D.TEST[m.slice(2)];
                return "<p><b>" + NK.stortForbogstav(t.tekst) + ":</b> " + t.klasser.map(function (k) { return D.KLASSER[k].flertal; }).join(" og ") + "</p>";
            }).join("") + "</div>";
        } else {
            krop = '<div class="vk-klasser">' + nye.map(function (k) {
                var eks = K.alle(k).filter(function (x) { return x.antalC >= 3; })[0] || K.alle(k)[0];
                return '<div class="vk-klasse"><div class="vk-mol lille" data-tegn="' + NK.html(eks.navn) + '" data-fremhaev="' + k + '"></div>' +
                    '<p class="vk-knavn">' + D.KLASSER[k].navn + "</p>" +
                    '<p class="vk-ktekst">' + D.KENDES_PAA[k] + "</p></div>";
            }).join("") + "</div>";
        }
        visValg(kortHTML(titel, krop, "Start"), "ny", videre);
    }

    /* Boksen med den naeste gruppe midt i scenen; bordet er tomt, og tiden
       staar stille. Paa niveau 1-9 bliver den staaende, til eleven trykker
       (Niels 27. nov. 2026: 'en "naeste boks", naar den skifter gruppe.. saa
       man ved hvad man skal slaa efter'); paa niveau 10 lukker den af sig
       selv efter SKIFT_MS, saa konkurrencen ikke gaar i staa. */
    function visSkift() {
        var el = $("l1-skift");
        var vent = !s.niv.alle;
        el.innerHTML = '<span class="sk-titel">' + (s.rigtige === 0 && !s.skiftVist ? "Første gruppe" : "Næste gruppe") + "</span>" +
            '<span class="sk-foran">' + s.maal.foran + '</span><span class="sk-stort">' + s.maal.stort + "</span>" +
            (s.maal.gruppe ? '<span class="sk-gruppe">' + s.maal.gruppe + "</span>" : "") +
            (vent ? '<button class="knap stor blaa" type="button" id="sk-videre">Start ↵</button>' : "");
        el.className = "maalskift" + (vent ? " vent" : "");
        el.hidden = false;
        void el.offsetWidth;
        el.classList.add("vis");
        s.skiftVist = true;
        if (vent) {
            s.skift = 0;
            s.skiftVent = true;
            $("sk-videre").addEventListener("click", lukSkift);
        } else {
            s.skift = C.SKIFT_MS;
        }
        rydBord(false);
        L.spil("niveau");
    }

    function lukSkift() {
        if (!s || !s.skiftVent) return;
        s.skiftVent = false;
        $("l1-skift").hidden = true;
        s.naeste = 250;
        sidst = 0;
    }

    /* ----- Forloebet -------------------------------------------------------- */
    function saetNiveau(n) {
        var foerste = s.nivNr < 0;
        s.nivNr = n;
        s.tempo = 0;
        s.iTempo = 0;
        s.niv = niveau(n, 0);
        s.maalNr = 0;
        s.maal = maalAf(s.niv.alle ? NK.tilfaeldig(C.ALLE_MAAL) : s.niv.maal[0]);
        s.iMaal = 0;
        s.naeste = 400;
        if (!foerste) {
            s.tid += C.TID_PR_NIVEAU;
            App().toast("Niveau " + (n + 1) + " · +" + C.TID_PR_NIVEAU + " sekunder");
        }
        visSkilt(true);
        panel();
        var b = C.NIVEAUER[Math.min(n, C.NIVEAUER.length - 1)];
        /* Kortet med stofklasserne: ved start alle niveauets klasser, siden kun de nye */
        var nye = foerste ? (b.alle || b.test ? [] : (n === 0 ? b.ny : b.typer)) : (b.ny || []);
        if (b.test) niveauKort(n, [], visSkift);
        else if (nye.length) niveauKort(n, nye, visSkift);
        else visSkift();
    }

    function naesteMaal() {
        if (s.niv.alle) {
            if (s.iTempo >= C.TEMPO_PR) {
                s.tempo++;
                s.iTempo = 0;
                s.niv = niveau(s.nivNr, s.tempo);
                s.tid += C.TID_PR_NIVEAU;
                App().toast("Tempo " + (s.tempo + 1) + " · +" + C.TID_PR_NIVEAU + " sekunder");
            }
            var nye = C.ALLE_MAAL.filter(function (m) { return m !== s.maal.noegle; });
            s.maal = maalAf(NK.tilfaeldig(nye));
            s.iMaal = 0;
            visSkilt(true);
            panel();
            visSkift();
            return;
        }
        s.maalNr++;
        if (s.maalNr >= s.niv.maal.length) {
            rydBord(false);
            saetNiveau(s.nivNr + 1);
            return;
        }
        s.maal = maalAf(s.niv.maal[s.maalNr]);
        s.iMaal = 0;
        visSkilt(true);
        panel();
        visSkift();
    }

    function trin(dt) {
        if (!s.koerer || s.pauset || s.venter) return;
        /* Skiftet til en ny gruppe: tiden staar stille */
        if (s.skiftVent) {
            huller.forEach(function (h, i) {
                var a = h.aktiv;
                if (a && a.slaaet && a.maal) { a.tilbage -= dt; if (a.tilbage <= 0) ned(i, false); }
            });
            return;
        }
        if (s.skift > 0) {
            s.skift -= dt;
            huller.forEach(function (h, i) {
                var a = h.aktiv;
                if (a && a.slaaet && a.maal) { a.tilbage -= dt; if (a.tilbage <= 0) ned(i, false); }
            });
            if (s.skift <= 0) {
                s.skift = 0;
                $("l1-skift").hidden = true;
                s.naeste = 250;
            }
            return;
        }
        s.tid -= dt / 1000;
        s.spilletid += dt / 1000;
        /* Et ramt molekyle gaar ned efter et halvt sekund; et forkert ramt
           bliver staaende, til kortet er lukket */
        huller.forEach(function (h, i) {
            var a = h.aktiv;
            if (!a || (a.slaaet && !a.maal)) return;
            a.tilbage -= dt;
            if (a.tilbage <= 0) ned(i, !a.slaaet);
        });
        s.naeste -= dt;
        var aktive = huller.filter(function (h) { return h.aktiv; }).length;
        if (s.naeste <= 0 && aktive < s.niv.maks) {
            var i = frietHul(), st = i >= 0 ? vaelgStof() : null;
            if (st) op(i, st);
            s.naeste = s.niv.nyt * NK.r(0.8, 1.2);
        }
        opdaterTid();
        if (s.tid <= 0) { s.tid = 0; slut("Tiden er gået"); }
    }

    function loekke(t) {
        if (!s || !s.koerer) { raf = 0; return; }
        var dt = sidst ? Math.min(100, t - sidst) : 16;
        sidst = t;
        trin(dt);
        raf = requestAnimationFrame(loekke);
    }

    /* ----- Skiltet oeverst og panelet ---------------------------------------- */
    function etiket() {
        var t = "Niveau " + (s.nivNr + 1);
        if (s.niv.alle) t += " · tempo " + (s.tempo + 1);
        return t + (s.rekord ? " · rekord" : " · øvelse");
    }

    function visSkilt(nyt) {
        if (!s) return;
        var m = s.maal;
        var html = '<div class="maalskilt"><span class="ms-etiket">' + etiket() + '</span><span class="ms-foran">' + m.foran + "</span>" +
            '<span class="ms-maal">' + m.stort + "</span>" + (m.gruppe ? '<span class="ms-gruppe">' + m.gruppe + "</span>" : "") +
            '<span class="ms-serie' + (s.faktor > 1 ? " aktiv" : "") + '">×' + s.faktor + "</span></div>" +
            '<div class="tidbar"><i id="l1-tid"></i></div>';
        var k = App().opgave(html, "lag1-opgave");
        if (nyt) { k.classList.remove("nyt"); void k.offsetWidth; k.classList.add("nyt"); }
        opdaterTid();
    }

    function opdaterTid() {
        var i = $("l1-tid");
        if (!i || !s) return;
        var andel = NK.klamp(s.tid / C.TID, 0, 1);
        i.style.width = (andel * 100).toFixed(1) + "%";
        i.className = s.tid < 10 ? "lav" : "";
        var sek = Math.ceil(s.tid);
        if (sek !== s.visteSek) {
            s.visteSek = sek;
            panel();
        }
    }

    function panel() {
        if (!s) return;
        var pm = s.niv.alle ? C.TEMPO_PR : prMaal();
        var i = s.niv.alle ? s.iTempo : s.iMaal;
        App().panel({
            point: s.point,
            tal2: { navn: "Liv", vaerdi: "♥♥♥".slice(0, Math.max(0, s.liv)) + "♡♡♡".slice(0, C.LIV - Math.max(0, s.liv)), klasse: "liv" },
            tal3: { navn: "Tid", vaerdi: Math.ceil(s.tid) + " s" },
            fremgang: { andel: i / pm, tekst: etiket() + " · " + i + " af " + pm + (s.niv.alle ? " til næste tempo" : " til næste gruppe") }
        });
    }

    function sidste(stof, ok) {
        var k = D.KLASSER[stof.klasse];
        App().lagkort("Det sidste molekyle", '<div class="sidste-mol" id="l1-sidste"></div>' +
            '<p class="sidste-navn">' + (ok ? '<span class="ok">✓</span> ' : '<span class="nej">✗</span> ') + NK.html(K.navn(stof)) + "</p>" +
            '<p class="sidste-klasse"><b>' + k.navn + "</b> · " + k.gruppe + "</p>");
        K.tegnI($("l1-sidste"), stof, { skala: 34, maksB: 280, maksH: 90, blaek: "#e9edf2" });
    }

    /* ----- Valget af niveau paa startkortet -------------------------------------- */
    function valgHTML() {
        return '<div class="mk-valg"><p class="mk-valgtitel">Vælg niveau</p><div class="niveaugitter">' + C.NIVEAUER.map(function (b, i) {
            return '<button type="button" class="niveauknap' + (i === valgtNiv ? " valgt" : "") + (i === REKORD ? " rekord" : "") +
                '" data-niv="' + i + '"><b>' + (i + 1) + "</b><small>" + b.navn + (i === REKORD ? " · rekord" : "") + "</small></button>";
        }).join("") + '</div><p class="mk-note">Niveau 1 til 9 er øvelse uden rekord. Rekorden og top 10 er kun på niveau 10, ' +
            "hvor alle grupperne og testene er med.</p></div>";
    }

    function valgKlik(el) {
        if (!el.hasAttribute("data-niv")) return false;
        valgtNiv = Number(el.getAttribute("data-niv"));
        NK.gem(NOEGLE_NIVEAU, valgtNiv);
        return true;
    }

    /* ----- Start, pause og slut ---------------------------------------------- */
    function start(niv) {
        stop();
        var n = niv === undefined ? valgtNiv : niv;
        s = {
            koerer: true, pauset: false, venter: false, videre: null, skift: 0, skiftVent: false, skiftVist: false,
            startNiv: n, rekord: n === REKORD,
            point: 0, liv: C.LIV, tid: C.TID, spilletid: 0, visteSek: -1,
            serie: 0, bedsteSerie: 0, faktor: 1, rigtige: 0, smuttede: 0,
            nivNr: -1, niv: null, maal: null, maalNr: 0, iMaal: 0, tempo: 0, iTempo: 0, naeste: 600,
            udenMaal: 0, sidsteHuller: [], sidsteStoffer: [], fejl: {}
        };
        App().lagkort("Det sidste molekyle", '<p class="mat">Intet endnu.</p>');
        saetNiveau(n);
        sidst = 0;
        raf = requestAnimationFrame(loekke);
    }

    function stop() {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        if (s) { s.koerer = false; rydBord(true); }
        $("valgkort").hidden = true;
        $("l1-skift").hidden = true;
        $("l1-bord").classList.remove("pauset");
        App().opgave(null);
    }

    function pause() {
        if (!s || !s.koerer || s.pauset) return;
        s.pauset = true;
        $("l1-bord").classList.add("pauset");
    }

    function fortsaet() {
        if (!s || !s.pauset) return;
        s.pauset = false;
        $("l1-bord").classList.remove("pauset");
        sidst = 0;
    }

    function slut(titel) {
        if (!s || !s.koerer) return;
        s.koerer = false;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        rydBord(true);
        $("valgkort").hidden = true;
        $("l1-skift").hidden = true;
        App().opgave(null);
        L.spil("slut");
        var linjer = ["<p>Niveau <b>" + (s.nivNr + 1) + "</b>" + (s.niv.alle ? ", tempo <b>" + (s.tempo + 1) + "</b>" : "") + " nået · <b>" + s.rigtige +
            "</b> rigtige slag · bedste serie <b>" + s.bedsteSerie + "</b></p>"];
        var fejl = Object.keys(s.fejl).sort(function (a, b) { return s.fejl[b] - s.fejl[a]; });
        if (fejl.length) {
            linjer.push('<div class="mk-drillere"><p class="mk-drilletitel">Det drillede</p><ul>' + fejl.slice(0, 4).map(function (f) {
                var d = f.split("|"), m = maalAf(d[0]);
                var hvad = m.test ? "stoffer, der " + D.TEST[m.test].tekst : D.KLASSER[m.klasse].flertal;
                return "<li>" + NK.stortForbogstav(D.KLASSER[d[1]].navn) + " slået, da gruppen var " + hvad +
                    (s.fejl[f] > 1 ? " (" + s.fejl[f] + " gange)" : "") + "</li>";
            }).join("") + "</ul></div>");
        }
        App().slut({ titel: titel, point: s.point, niveau: s.nivNr + 1, sekunder: s.spilletid, linjer: linjer, rekord: s.rekord,
            oevelse: "Øvelse fra niveau " + (s.startNiv + 1) + ". Rekorden tæller kun, når du starter på niveau 10." });
    }

    function tast(e) {
        if (!s || !s.koerer) return false;
        if (e.key === "Enter" || e.key === " ") {
            if (s.videre) { s.videre(); return true; }
            if (s.skiftVent) { lukSkift(); return true; }
            if (s.pauset) { fortsaet(); App().spilknap(); return true; }
            return e.key === " ";
        }
        if (/^[1-9]$/.test(e.key)) {
            var n = Number(e.key);
            var r = 2 - Math.floor((n - 1) / 3), c = (n - 1) % 3;
            slag(r * 3 + c, null);
            return true;
        }
        if (e.key.toLowerCase() === "p") {
            if (s.venter || s.skiftVent) return true;
            if (s.pauset) fortsaet(); else pause();
            App().spilknap();
            return true;
        }
        return false;
    }

    NK.Lag = NK.Lag || {};
    NK.Lag[1] = {
        titel: "Grupperne",
        startTekst: "<p>Molekylerne dukker op i hullerne. <b>Slå dem, der hører til gruppen på skiltet</b> øverst, før de forsvinder igen. " +
            "Når gruppen skifter, kommer en boks med den næste gruppe.</p>" +
            "<p>Et forkert slag koster et liv. Du har " + C.TID + " sekunder, og hvert nyt niveau giver " + C.TID_PR_NIVEAU + " sekunder mere.</p>",
        rekordTekst: "på niveau 10",
        init: init,
        valgHTML: valgHTML,
        valgKlik: valgKlik,
        vis: function () {
            $("lag1").hidden = false;
            App().panel({ point: 0, tal2: { navn: "Liv", vaerdi: "♥♥♥", klasse: "liv" }, tal3: { navn: "Tid", vaerdi: C.TID + " s" }, fremgang: null });
            App().lagkort("Det sidste molekyle", '<p class="mat">Intet endnu.</p>');
        },
        skjul: function () { stop(); $("lag1").hidden = true; },
        start: function () { start(); },
        stop: stop,
        koerer: function () { return !!(s && s.koerer); },
        pause: pause,
        fortsaet: fortsaet,
        pauset: function () { return !!(s && s.pauset); },
        tast: tast,
        /* Til selvtesten */
        _s: function () { return s; },
        _start: start,
        _huller: function () { return huller; },
        _slag: slag,
        _lukSkift: lukSkift,
        _trin: function (dt) { if (s) trin(dt); }
    };
}());
