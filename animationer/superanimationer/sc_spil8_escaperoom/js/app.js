/* =====================================================================
   app.js - tilstanden og forloebet i EscapeRoom Kemi C

   Tilstanden gemmes i browseren (D.LAGER), saa en gruppe kan lukke
   fanen og fortsaette. Skaermen afgoeres af tilstanden alene:
   start -> rum 1..5 -> slut (almindelig) eller guld -> finale.
   ===================================================================== */
(function () {
    "use strict";

    var D = NK.D, el = NK.el, h = NK.html, Sp = NK.Sprites;
    var T = null;          /* tilstanden */
    var sag = null;        /* NK.Sag.lav(T.sag) */
    var seddel = null;     /* det aabne kort: { type, rum, id } */

    /* ----- Tilstanden ------------------------------------------------- */
    function nyTilstand(nr) {
        return { v: 1, sag: nr, start: null, tid: null, naaet: 1, vist: null,
                 noter: {}, forkerte: {}, set: {}, lab: {}, segl: {}, guld: null, finale: false };
    }
    function nytNr() { return 1000 + Math.floor(Math.random() * 9000); }
    function gem() { NK.gem(D.LAGER, T); }
    function indlaes() {
        var t = NK.hent(D.LAGER, null);
        if (!t || t.v !== 1 || !(t.sag >= 1000 && t.sag <= 9999)) t = nyTilstand(nytNr());
        T = t;
        sag = NK.Sag.lav(T.sag);
    }

    /* En noegle er af guld, naar ingen note er laest i rummet, og laasen
       har faaet hoejst D.MAKS_FORKERTE forkerte koder. */
    function ren(rum) { return !T.noter[rum] && (T.forkerte[rum] || 0) <= D.MAKS_FORKERTE; }
    function alleRene() { for (var i = 1; i <= 5; i++) if (!ren(i)) return false; return true; }
    function alleSegl() { return D.SEGL.every(function (s) { return !!T.segl[s.id]; }); }

    function skaerm() {
        if (!T.start) return { type: "start" };
        if (T.vist && T.vist < T.naaet && T.vist <= 5) return { type: "rum", rum: T.vist, gensyn: true };
        if (T.naaet <= 5) return { type: "rum", rum: T.naaet };
        if (!T.guld) return { type: "slut" };
        if (!T.finale) return { type: "guld" };
        return { type: "finale" };
    }
    function frontNavn() {
        if (T.naaet <= 5) return "rum " + T.naaet;
        if (!T.guld) return "slutningen";
        return T.finale ? "slutningen" : "den gyldne dør";
    }

    /* ----- Beviset (som i den gamle: DDMMTTmm og mod 11) ------------- */
    var VAEGTE = [4, 3, 2, 7, 6, 5, 4, 3];
    function bevis(forstavelse, nu) {
        nu = nu || new Date();
        var p = [nu.getDate(), nu.getMonth() + 1, nu.getHours(), nu.getMinutes()]
            .map(function (v) { return String(v).padStart(2, "0"); }).join("");
        var sum = 0;
        for (var i = 0; i < 8; i++) sum += Number(p[i]) * VAEGTE[i];
        return forstavelse + "-" + p + "-" + String(sum % 11).padStart(2, "0");
    }

    /* ----- Toplinjen ---------------------------------------------------- */
    function noegleIkon(fyld, kant) {
        return '<svg viewBox="-2 -2 84 36" width="36" height="16" aria-hidden="true">' + Sp.noegle(0, 0, fyld, kant, 1) + "</svg>";
    }
    function tegnTop(sk) {
        el("sagnr").textContent = "Sag #" + T.sag + " · Fortroligt";
        var s = "";
        for (var i = 1; i <= 5; i++) {
            var farve = D.FARVE[i], kl = "rumknap", indhold, titel, klik = false;
            if (!T.start || i > T.naaet) { kl += " laast"; indhold = String(i); titel = "Rum " + i + ": låst"; }
            else if (i < T.naaet) { kl += " loest"; indhold = noegleIkon(farve, "#111"); titel = "Rum " + i + ": åbnet. Klik for at se rummet igen."; klik = true; }
            else { kl += " nu"; indhold = String(i); titel = "Rum " + i + ": her er I nu"; klik = true; }
            if (sk.type === "rum" && sk.rum === i) kl += " vist";
            s += '<button type="button" class="' + kl + '" style="--farve:' + farve + '" data-rum="' + i + '"' + (klik ? "" : " disabled") +
                ' title="' + h(titel) + '" aria-label="' + h(titel) + '">' + indhold + "</button>";
            if (i < 5) s += '<span class="streg' + (T.start && i < T.naaet ? " fyldt" : "") + '" style="--farve:' + farve + '"></span>';
        }
        if (T.guld) {
            s += '<span class="streg fyldt" style="--farve:' + D.FARVE[6] + '"></span>' +
                '<button type="button" class="rumknap guld' + (sk.type === "guld" || sk.type === "finale" ? " vist" : "") +
                '" data-rum="6" title="Den gyldne dør" aria-label="Den gyldne dør">★</button>';
        }
        el("noegler").innerHTML = s;
        opdaterUr();
    }
    function opdaterUr() {
        var ms = !T.start ? 0 : (T.tid !== null ? T.tid : Date.now() - T.start);
        NK.saetTekst("ur", NK.tid(ms));
        var b = el("bevis");
        if (b) b.textContent = bevis(b.getAttribute("data-forstavelse"));
    }

    /* ----- Teksten oeverst i midten ------------------------------------- */
    function tegnFortaelling(sk) {
        var f = el("fortaelling"), s = "";
        if (sk.type === "rum") {
            var r = D.RUM[sk.rum];
            s = '<p><b class="rumtitel" style="--farve:' + D.FARVE[sk.rum] + '">Rum ' + sk.rum + " · " + h(r.titel) + "</b> " + h(r.tekst) + "</p>";
            if (sk.gensyn) s += '<p class="gensyn">' + D.LAAS.aaben + ' <button type="button" class="knap lille" data-front>Tilbage til ' + h(frontNavn()) + "</button></p>";
        } else if (sk.type === "guld") {
            s = '<p><b class="rumtitel" style="--farve:' + D.FARVE[6] + '">' + h(D.RUM[6].titel) + "</b> " + h(D.RUM[6].tekst) + "</p>";
            if (alleSegl()) s += '<p class="gensyn">' + D.SEGL_TEKST.alle + ' <button type="button" class="knap hoved" id="guldknap">' + D.SEGL_TEKST.doer + "</button></p>";
        }
        f.innerHTML = s;
        f.hidden = !s;
    }

    /* ----- Scenen ------------------------------------------------------- */
    function tegnScene(sk) {
        var hvad = sk.type === "start" ? "start" : sk.type === "rum" ? sk.rum : sk.type === "slut" ? 5 : sk.type === "guld" ? "guld" : "guld-aaben";
        el("tegning").innerHTML = NK.Scener.tegn(hvad, sag, T);
        el("tegning").classList.toggle("daempet", sk.type === "start" || sk.type === "slut" || sk.type === "finale");
    }

    /* ----- Kortet i midten: start og slutningerne ---------------------- */
    function noegleringHTML() {
        var s = '<div class="noeglering" role="group" aria-label="Nøgleringen">';
        for (var i = 1; i <= 5; i++) {
            var guld = ren(i);
            s += '<button type="button" class="noegleknap' + (guld ? " guld" : " jern") + '" data-noegle="' + i + '" style="--farve:' + D.FARVE[i] +
                '" aria-label="Nøglen fra rum ' + i + '"><svg viewBox="-2 -2 84 36" width="72" height="31" aria-hidden="true">' +
                Sp.noegle(0, 0, guld ? "#f1c40f" : "#8b9097", guld ? "#7a5a08" : "#3d4148", 1) + '</svg><span class="maerke"></span></button>';
        }
        return s + '</div><p class="lille noegleforklaring" id="noegleforklaring" aria-live="polite"></p>';
    }
    function bevisHTML(forstavelse) {
        return '<div class="bevis' + (forstavelse === "GULDSKAFT" ? " guld" : "") + '"><span class="etiket">' + D.BEVIS.etiket + '</span>' +
            '<b id="bevis" data-forstavelse="' + forstavelse + '">' + bevis(forstavelse) + '</b><span class="lille">' + D.BEVIS.note + "</span></div>";
    }
    function tegnMidte(sk) {
        var m = el("midte"), s = "";
        if (sk.type === "start") {
            var St = D.START;
            s = '<div class="mappe"><span class="stempel">Fortroligt · Sag #' + T.sag + "</span>" +
                "<h2>" + h(St.titel) + '</h2><p class="under">' + h(St.under) + "</p>" +
                "<p>" + h(St.tekst) + '</p><ul class="regler">' + St.regler.map(function (r) { return "<li>" + h(r) + "</li>"; }).join("") + "</ul>" +
                '<div class="knaprad"><button type="button" class="knap hoved" id="startknap">' + h(St.knap) + "</button></div></div>";
        } else if (sk.type === "slut") {
            var Sl = D.SLUT;
            s = '<div class="mappe"><span class="stempel groen">' + h(Sl.stempel) + "</span><h2>" + h(Sl.titel) + "</h2>" +
                "<p>" + h(Sl.tekst) + '</p><p class="tid">Tid for de fem rum: <b>' + NK.tid(T.tid || 0) + "</b></p>" +
                noegleringHTML() + bevisHTML("RUMLESKAFT") +
                '<p class="svagt">' + h(Sl.svagt) + "</p>" +
                '<div class="knaprad"><button type="button" class="knap stille" data-nysag>Ny sag</button></div></div>';
        } else if (sk.type === "finale") {
            var F = D.FINALE;
            s = '<div class="mappe guldkant"><span class="stempel guld">' + h(F.stempel) + "</span><h2>" + h(F.titel) + "</h2>" +
                "<p>" + h(F.tekst) + '</p><p class="tid">Tid for de fem rum: <b>' + NK.tid(T.tid || 0) + "</b></p>" +
                bevisHTML("GULDSKAFT") +
                '<div class="knaprad"><button type="button" class="knap stille" data-nysag>Ny sag</button></div></div>';
        }
        m.innerHTML = s;
        m.hidden = !s;
    }

    function vis() {
        var sk = skaerm();
        lukSeddel();
        tegnTop(sk);
        tegnFortaelling(sk);
        tegnScene(sk);
        tegnMidte(sk);
    }

    /* ----- Kortet over scenen ------------------------------------------- */
    function lukSeddel() {
        /* Dråbepladen i scenen viser de nye dryp, når kortet lukkes */
        var varLab = seddel && seddel.id === "lab";
        seddel = null;
        if (varLab) tegnScene(skaerm());
        el("slor").hidden = true;
        el("seddel").innerHTML = "";
    }
    function visSeddel(k, info) {
        seddel = info;
        var s = '<div class="seddel-hoved"><h2><span class="etiket">' + h(k.etiket) + "</span>" + h(k.titel) + "</h2>" +
            '<button type="button" class="luk" data-luk aria-label="Luk kortet">✕</button></div>' +
            '<div class="seddel-krop">' + k.html + "</div>";
        if (k.laas) {
            s += '<div class="seddel-fod"><p class="svar-linje" id="laasbesked" aria-live="polite">' + (k.aaben ? D.LAAS.aaben : "") + "</p>" +
                (k.aaben ? '<button type="button" class="knap hoved" data-videre>' + h(videreTekst(info.rum)) + "</button>"
                         : '<button type="button" class="knap hoved" id="laasop" disabled>Lås op</button>') + "</div>";
        }
        if (k.segl && !k.brudt) {
            s += '<div class="seddel-fod"><span></span><button type="button" class="knap hoved" id="seglknap">' + D.SEGL_TEKST.knap + "</button></div>";
        }
        if (k.note) {
            s += '<div class="note-rad"><button type="button" class="knap gulkant" data-note>Læs Nillers note</button></div>' +
                '<div class="note" id="note" hidden><span class="etiket">Nillers note</span> ' + h(k.note) + "</div>";
        }
        var sd = el("seddel");
        sd.className = "seddel" + (k.bred ? " bred" : "");
        sd.innerHTML = s;
        el("slor").hidden = false;
        sd.scrollTop = 0;
        var foerste = sd.querySelector(".ciffer:not([disabled])") || sd.querySelector("#seglsvar");
        if (foerste) foerste.focus(); else { var luk = sd.querySelector("[data-luk]"); if (luk) luk.focus(); }
        if (k.laas) opdaterLaasknap();
    }
    function videreTekst(rum) {
        return rum === T.naaet - 1 ? D.LAAS.videre(rum + 1) : "Tilbage til " + frontNavn();
    }

    function aabnSpor(rum, id) {
        var k = NK.Sedler.spor(rum, id, sag, T);
        if (!k) return;
        T.set[rum + ":" + id] = true;
        gem();
        visSeddel(k, { type: "spor", rum: rum, id: id });
    }
    function aabnLaas(rum) {
        visSeddel(NK.Sedler.laas(rum, sag, T), { type: "laas", rum: rum });
    }
    function aabnSegl(id) {
        var sg = D.SEGL.filter(function (x) { return x.id === id; })[0];
        if (sg) visSeddel(NK.Sedler.segl(sg, !!T.segl[id]), { type: "segl", id: id });
    }

    /* ----- Noter -------------------------------------------------------- */
    function laesNote() {
        if (!seddel) return;
        var n = el("note");
        if (n) n.hidden = false;
        var b = el("seddel").querySelector("[data-note]");
        if (b) b.parentNode.hidden = true;
        /* En note koster kun noget, mens doeren er laast. */
        if (seddel.rum && seddel.rum >= T.naaet) { T.noter[seddel.rum] = true; gem(); }
    }

    /* ----- Draabepladen -------------------------------------------------- */
    function dryp(noegle) {
        T.lab[noegle] = true;
        gem();
        var g = el("labgitter");
        if (g) g.innerHTML = NK.Sedler.labGitter(sag.rum[1], T);
    }

    /* ----- Kodelaasen ---------------------------------------------------- */
    function cifferFelter() { return Array.prototype.slice.call(el("seddel").querySelectorAll(".ciffer")); }
    function indtastet() { return cifferFelter().map(function (c) { return c.value; }).join(""); }
    function opdaterLaasknap() {
        var b = el("laasop");
        if (!b) return;
        var fulde = cifferFelter().every(function (c) { return /^[0-9]$/.test(c.value); });
        b.disabled = !fulde;
        b.classList.toggle("klar", fulde);
    }
    function skrivKode(kode) {
        var f = cifferFelter(), c = NK.Sag.cifre(kode);
        f.forEach(function (x, i) { x.value = c.charAt(i) || ""; });
        opdaterLaasknap();
    }
    function laasOp() {
        if (!seddel || seddel.type !== "laas") return false;
        var rum = seddel.rum, r = sag.rum[rum];
        if (T.naaet > rum) return true;
        var b = el("laasop");
        if (b && b.disabled) return false;
        var besked = el("laasbesked");
        if (indtastet() !== NK.Sag.kode(r)) {
            T.forkerte[rum] = (T.forkerte[rum] || 0) + 1;
            gem();
            besked.textContent = D.LAAS.forkert;
            besked.className = "svar-linje fejl";
            var sd = el("seddel");
            sd.classList.remove("ryst");
            void sd.offsetWidth;
            sd.classList.add("ryst");
            return false;
        }
        T.naaet = rum + 1;
        T.vist = null;
        if (rum === 5) {
            T.tid = Date.now() - T.start;
            T.guld = alleRene();
        }
        gem();
        cifferFelter().forEach(function (c) { c.disabled = true; });
        besked.textContent = D.LAAS.rigtig;
        besked.className = "svar-linje ok";
        b.outerHTML = '<button type="button" class="knap hoved" data-videre>' + h(D.LAAS.videre(rum + 1)) + "</button>";
        var vb = el("seddel").querySelector("[data-videre]");
        if (vb) vb.focus();
        /* Doeren drejer op i scenen bag kortet */
        var blad = el("tegning").querySelector(".doerblad");
        if (blad) blad.classList.add("aaben");
        tegnTop(skaermFor(rum));
        return true;
    }
    function skaermFor(rum) { return { type: "rum", rum: rum }; }
    function videre() { T.vist = null; gem(); vis(); }

    /* Cifrene: et ciffer flytter videre, tilbage-tasten flytter tilbage. */
    function cifferInput(e) {
        var c = e.target;
        if (!c.classList || !c.classList.contains("ciffer")) return;
        var v = c.value.replace(/[^0-9]/g, "");
        c.value = v.slice(-1);
        if (c.value) {
            var f = cifferFelter(), i = f.indexOf(c);
            if (i >= 0 && i < f.length - 1) f[i + 1].focus();
        }
        opdaterLaasknap();
    }
    function cifferTast(e) {
        var c = e.target;
        if (!c.classList || !c.classList.contains("ciffer")) return;
        var f = cifferFelter(), i = f.indexOf(c);
        if (e.key === "Backspace" && !c.value && i > 0) { f[i - 1].value = ""; f[i - 1].focus(); e.preventDefault(); opdaterLaasknap(); }
        else if (e.key === "ArrowLeft" && i > 0) { f[i - 1].focus(); e.preventDefault(); }
        else if (e.key === "ArrowRight" && i < f.length - 1) { f[i + 1].focus(); e.preventDefault(); }
        else if (e.key === "Enter") { laasOp(); e.preventDefault(); }
    }
    function cifferIndsaet(e) {
        var c = e.target;
        if (!c.classList || !c.classList.contains("ciffer")) return;
        var tekst = NK.Sag.cifre((e.clipboardData || window.clipboardData).getData("text"));
        if (!tekst) return;
        e.preventDefault();
        var f = cifferFelter(), i = f.indexOf(c);
        for (var k = 0; k < tekst.length && i + k < f.length; k++) f[i + k].value = tekst.charAt(k);
        f[Math.min(f.length - 1, i + tekst.length)].focus();
        opdaterLaasknap();
    }

    /* ----- Seglene -------------------------------------------------------- */
    function normaliser(s) { return String(s || "").trim().toLowerCase().replace(/\s+/g, ""); }
    function brydSegl(id, svar) {
        var sg = D.SEGL.filter(function (x) { return x.id === id; })[0];
        if (!sg || T.segl[id]) return "brudt";
        var besked = el("seglbesked");
        var udfald;
        if (normaliser(svar) !== sg.svar) udfald = "forkert";
        else if (!sg.tjek() && NK.kanHuske()) udfald = "ikkeVundet";
        else udfald = "brudt";
        if (udfald === "brudt") {
            T.segl[id] = true;
            gem();
            tegnScene(skaerm());
            tegnFortaelling(skaerm());
            aabnSegl(id);
        } else if (besked) {
            besked.textContent = udfald === "forkert" ? D.SEGL_TEKST.forkert : D.SEGL_TEKST.ikkeVundet(sg.spil);
            besked.className = "svar-linje fejl";
            var sd = el("seddel");
            sd.classList.remove("ryst");
            void sd.offsetWidth;
            sd.classList.add("ryst");
        }
        return udfald;
    }
    function aabnGuldDoer() {
        if (!alleSegl()) return;
        T.finale = true;
        gem();
        vis();
    }

    /* ----- Start og ny sag ----------------------------------------------- */
    function startSpil() {
        T.start = Date.now();
        gem();
        vis();
    }
    function nySag(nr, udenSpoerg) {
        if (!udenSpoerg && T.start && !window.confirm("Start en ny sag med nye tal? Jeres fremskridt i denne sag forsvinder.")) return;
        T = nyTilstand(nr || nytNr());
        sag = NK.Sag.lav(T.sag);
        gem();
        vis();
    }

    /* ----- Haendelser ----------------------------------------------------- */
    function sporKlik(g) {
        var id = g.getAttribute("data-spor"), sk = skaerm();
        if (sk.type === "rum") {
            if (id === "laas") aabnLaas(sk.rum); else aabnSpor(sk.rum, id);
        } else if (sk.type === "guld" && id.indexOf("segl-") === 0) {
            aabnSegl(id.slice(5));
        }
    }
    function bind() {
        var tegning = el("tegning");
        tegning.addEventListener("click", function (e) {
            var g = e.target.closest && e.target.closest(".spor");
            if (g) sporKlik(g);
        });
        tegning.addEventListener("keydown", function (e) {
            if (e.key !== "Enter" && e.key !== " ") return;
            var g = e.target.closest && e.target.closest(".spor");
            if (g) { e.preventDefault(); sporKlik(g); }
        });

        el("noegler").addEventListener("click", function (e) {
            var b = e.target.closest && e.target.closest("[data-rum]");
            if (!b || b.disabled) return;
            var n = Number(b.getAttribute("data-rum"));
            T.vist = n < T.naaet && n <= 5 ? n : null;
            gem();
            vis();
        });

        document.addEventListener("click", function (e) {
            var t = e.target;
            if (!t.closest) return;
            if (t.closest("#startknap")) { startSpil(); return; }
            if (t.closest("[data-nysag]")) { nySag(); return; }
            if (t.closest("[data-front]")) { T.vist = null; gem(); vis(); return; }
            if (t.closest("#guldknap")) { aabnGuldDoer(); return; }
            var nk = t.closest("[data-noegle]");
            if (nk) {
                var rum = Number(nk.getAttribute("data-noegle")), n = T.forkerte[rum] || 0;
                el("noegleforklaring").textContent = ren(rum) ? D.SLUT.guldNoegle(rum)
                    : T.noter[rum] ? D.SLUT.jernNote(rum) : D.SLUT.jernKoder(rum, n);
                return;
            }
        });

        el("nysag").addEventListener("click", function () { nySag(); });

        var sd = el("seddel");
        sd.addEventListener("click", function (e) {
            var t = e.target;
            if (!t.closest) return;
            if (t.closest("[data-luk]")) { lukSeddel(); return; }
            if (t.closest("[data-note]")) { laesNote(); return; }
            if (t.closest("#laasop")) { laasOp(); return; }
            if (t.closest("[data-videre]")) { videre(); return; }
            if (t.closest("#seglknap")) { brydSegl(seddel.id, el("seglsvar").value); return; }
            var b = t.closest("[data-broend]");
            if (b) { dryp(b.getAttribute("data-broend")); return; }
            if (t.closest("[data-ni]")) { NK.saetTekst("ps-ni", D.PAASKEAEG_NI); return; }
        });
        sd.addEventListener("input", cifferInput);
        sd.addEventListener("keydown", function (e) {
            cifferTast(e);
            if (e.key === "Enter" && e.target.id === "seglsvar") { brydSegl(seddel.id, e.target.value); e.preventDefault(); }
            if ((e.key === "Enter" || e.key === " ") && e.target.closest && e.target.closest("[data-ni]")) { NK.saetTekst("ps-ni", D.PAASKEAEG_NI); e.preventDefault(); }
        });
        sd.addEventListener("paste", cifferIndsaet);
        sd.addEventListener("animationend", function () { sd.classList.remove("ryst"); });

        el("slor").addEventListener("click", function (e) { if (e.target === el("slor")) lukSeddel(); });

        el("hjaelpknap").addEventListener("click", function () { el("hjaelp").hidden = false; el("hjaelp-luk").focus(); });
        el("hjaelp-luk").addEventListener("click", function () { el("hjaelp").hidden = true; });
        el("hjaelp").addEventListener("click", function (e) { if (e.target === el("hjaelp")) el("hjaelp").hidden = true; });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                if (!el("hjaelp").hidden) el("hjaelp").hidden = true;
                else if (seddel) lukSeddel();
            } else if (e.key === "?" && !(e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) {
                el("hjaelp").hidden = !el("hjaelp").hidden;
            }
        });

        /* Kommer man tilbage fra et andet spil, er uret og beviset opdateret. */
        document.addEventListener("visibilitychange", function () { if (!document.hidden) opdaterUr(); });
    }

    function hjaelp() {
        el("hjaelp-tekst").innerHTML = D.HJAELP.map(function (l) { return "<p>" + h(l) + "</p>"; }).join("");
    }

    NK.saetTekst = function (id, tekst) {
        var e = el(id);
        if (e && e.textContent !== tekst) e.textContent = tekst;
    };

    indlaes();
    hjaelp();
    bind();
    vis();
    setInterval(opdaterUr, 1000);

    /* Til selvtesten */
    NK.app = {
        tilstand: function () { return T; },
        sag: function () { return sag; },
        skaerm: skaerm, vis: vis, ren: ren, alleRene: alleRene, alleSegl: alleSegl,
        start: startSpil, nySag: nySag, aabnSpor: aabnSpor, aabnLaas: aabnLaas, aabnSegl: aabnSegl,
        skrivKode: skrivKode, laasOp: laasOp, videre: videre, laesNote: laesNote, dryp: dryp,
        brydSegl: brydSegl, aabnGuldDoer: aabnGuldDoer, luk: lukSeddel, bevis: bevis,
        seddel: function () { return seddel; }
    };
}());
