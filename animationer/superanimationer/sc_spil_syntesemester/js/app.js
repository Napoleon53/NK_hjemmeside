/* =====================================================================
   app.js - rammen om de tre lag: fanerne, start- og slutkortet, panelet,
   toplisterne og tastaturet

   Hvert lag er et modul i NK.Lag[1..3] med
     titel, startTekst              til startkortet
     vis(), skjul()                 naar fanen skiftes
     start(), stop()                et nyt spil, eller spillet afbrydes
     koerer()                       er et spil i gang?
     pause(), fortsaet(), pauset()  kun lag 1 (har tid)
     tast(e)                        taster, mens spillet koerer (sand = brugt)
   og kalder NK.App.panel(...), NK.App.opgave(...), NK.App.slut(...).

   Link til et lag: index.html#lag1, #lag2, #lag3.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = NK.Topliste;
    var L = NK.Spillyd;
    var $ = NK.el;

    var lag = 1;
    var lister = {};          /* lag -> { uge, alle } */
    var sidsteRes = null;     /* resultatet paa slutkortet */

    function modul() { return NK.Lag[lag]; }
    function koerer() { return modul().koerer(); }

    /* ----- Opgavekortet oeverst i midten -------------------------------- */
    function opgave(html, klasse) {
        var k = $("opgavekort");
        if (html === null) { k.hidden = true; k.innerHTML = ""; return k; }
        k.className = "opgavekort" + (klasse ? " " + klasse : "");
        k.innerHTML = html;
        k.hidden = false;
        return k;
    }

    /* ----- Beskeder ------------------------------------------------------- */
    var toastTid = null;
    function toast(tekst, klasse) {
        var t = $("toast");
        t.className = "toast" + (klasse ? " " + klasse : "");
        t.textContent = tekst;
        t.hidden = false;
        void t.offsetWidth;
        t.classList.add("vis");
        clearTimeout(toastTid);
        toastTid = setTimeout(function () { t.hidden = true; }, 2700);
    }

    /* Et lille tal, der flyver op fra et punkt i scenen (px i scenen) */
    function pop(x, y, tekst, klasse) {
        var p = document.createElement("div");
        p.className = "pop " + (klasse || "");
        p.textContent = tekst;
        p.style.left = x + "px";
        p.style.top = y + "px";
        $("popper").appendChild(p);
        setTimeout(function () { if (p.parentNode) p.parentNode.removeChild(p); }, 1100);
    }

    /* ----- Panelet ------------------------------------------------------- */
    function panel(v) {
        if (v.point !== undefined) NK.saetTekst("point", String(v.point));
        if (v.tal2) {
            NK.saetTekst("tal2-navn", v.tal2.navn);
            var e2 = $("tal2");
            if (e2.textContent !== String(v.tal2.vaerdi)) e2.textContent = v.tal2.vaerdi;
            e2.className = v.tal2.klasse || "";
        }
        if (v.tal3) {
            NK.saetTekst("tal3-navn", v.tal3.navn);
            NK.saetTekst("tal3", String(v.tal3.vaerdi));
        }
        if (v.fremgang !== undefined) {
            var f = $("fremgang");
            if (!v.fremgang) f.hidden = true;
            else {
                f.hidden = false;
                $("fremgang-bar").style.width = Math.round(NK.klamp(v.fremgang.andel, 0, 1) * 100) + "%";
                $("fremgang-bar").className = v.fremgang.klasse || "";
                NK.saetTekst("fremgang-tekst", v.fremgang.tekst || "");
            }
        }
    }

    function lagkort(titel, html) {
        $("lagkort-titel").innerHTML = titel;
        $("lagkort-indhold").innerHTML = html;
    }

    function spilknap() {
        var k = $("spilknap"), m = modul();
        if (!m.koerer()) { k.textContent = "Start spil"; k.hidden = false; }
        else if (m.pause) { k.textContent = m.pauset() ? "Fortsæt" : "Pause"; k.hidden = false; }
        else k.hidden = true;
        $("forfraknap").hidden = !m.koerer();
    }

    function rekorder() {
        var ul = $("rekordliste");
        ul.innerHTML = [1, 2, 3].map(function (n) {
            var p = T.personlig(n);
            return '<li class="' + (n === lag ? "aktiv" : "") + '"><span class="rl-nr">' + n + '</span><span class="rl-navn">' +
                D.LAG[n].navn + '</span><b>' + p.alle + "</b></li>";
        }).join("");
        NK.saetTekst("rekord", String(T.personlig(lag).alle));
    }

    /* ----- Toplisten paa kortet ---------------------------------------- */
    function listeHTML(n) {
        var l = lister[n];
        if (!l || !T.harDelt(n)) return "";
        function ol(rk) {
            if (!rk.length) return '<li class="tom">Ingen endnu</li>';
            return rk.map(function (r) {
                return "<li><span>" + NK.html(r.navn) + "</span><b>" + r.point + "</b></li>";
            }).join("");
        }
        return '<div class="mk-liste"><div class="mk-kol"><h3>Top 10 denne uge</h3><ol class="topliste">' + ol(l.uge) +
            '</ol></div><div class="mk-kol"><h3>Top 10 alle tider</h3><ol class="topliste">' + ol(l.alle) + "</ol></div></div>";
    }

    function navnHTML(n) {
        if (!T.harDelt(n)) return "";
        return '<div class="mk-navn"><label for="navnefelt">Navn til top 10</label>' +
            '<input type="text" id="navnefelt" maxlength="20" placeholder="Anonym" autocomplete="off" spellcheck="false" value="' +
            NK.html(T.navn()) + '"></div>';
    }

    function hentListe(n) {
        T.hent(n).then(function (l) {
            if (!l) return;
            lister[n] = l;
            var mk = $("midterkort");
            if (n === lag && !koerer() && !mk.hidden) visKort(sidsteRes);
            if (n === lag && modul().listeOpdateret) modul().listeOpdateret();
        });
    }

    /* ----- Start- og slutkortet ---------------------------------------- */
    function lagvaelger() {
        return '<div class="mk-lag" role="group" aria-label="Vælg lag">' + [1, 2, 3].map(function (n) {
            return '<button type="button" class="mk-lagknap' + (n === lag ? " valgt" : "") + '" data-lag="' + n + '"><span class="fane-nr">' + n +
                "</span>" + D.LAG[n].navn + "<small>" + D.LAG[n].kort + "</small></button>";
        }).join("") + "</div>";
    }

    function visKort(res) {
        var mk = $("midterkort"), m = modul(), p = T.personlig(lag), html;
        if (!res) {
            mk.className = "midterkort start";
            html = '<h2 class="mk-titel">Lag ' + lag + ": " + m.titel + "</h2>" + lagvaelger() +
                '<div class="mk-intro">' + m.startTekst + "</div>" + (m.valgHTML ? m.valgHTML() : "") +
                '<p class="mk-rekord">Din rekord' + (m.rekordTekst ? " " + m.rekordTekst : "") + ": <b>" + p.alle + "</b> point" +
                (p.uge && p.uge !== p.alle ? " · denne uge <b>" + p.uge + "</b>" : "") + "</p>" +
                listeHTML(lag) + navnHTML(lag) +
                '<div class="mk-handling"><button class="knap stor blaa" id="mk-start" type="button">Start lag ' + lag + " ↵</button></div>";
        } else {
            mk.className = "midterkort slut";
            html = '<h2 class="mk-titel">' + res.titel + "</h2>" +
                (res.udenPoint ? "" : '<p class="mk-point"><b>' + res.point + "</b> point" + (res.rekord === false ? '<span class="mk-oev">Øvelse</span>' :
                    (res.ny && res.ny.alle ? '<span class="mk-ny">Ny rekord</span>' :
                    (res.ny && res.ny.uge ? '<span class="mk-ny">Ugens rekord</span>' : ""))) + "</p>") +
                (res.rekord === false && res.oevelse ? '<p class="mk-oevtekst">' + res.oevelse + "</p>" : "") +
                (res.linjer && res.linjer.length ? '<div class="mk-resultat">' + res.linjer.join("") + "</div>" : "") +
                (m.valgHTML ? '<div class="mk-igen">' + m.valgHTML() + "</div>" : "") +
                listeHTML(lag) + navnHTML(lag) +
                '<div class="mk-handling raekke">' + (res.knapper ? res.knapper.map(function (k, i) {
                    return '<button class="knap stor' + (k.hoved ? " blaa" : "") + '" type="button" ' + (k.hoved ? 'id="mk-start"' : "") + ' data-knap="' + i + '">' +
                        k.tekst + (k.hoved ? " ↵" : "") + "</button>";
                }).join("") : '<button class="knap stor blaa" id="mk-start" type="button">Spil lag ' + lag + " igen ↵</button>" +
                (lag < 3 ? '<button class="knap stor" id="mk-videre" type="button">Prøv lag ' + (lag + 1) + "</button>" : "")) + "</div>";
        }
        mk.innerHTML = html;
        mk.hidden = false;
        $("scene").classList.add("hvile");
        if (res && res.knapper) {
            Array.prototype.forEach.call(mk.querySelectorAll("[data-knap]"), function (b) {
                b.addEventListener("click", function () { res.knapper[Number(b.getAttribute("data-knap"))].goer(); });
            });
            mk.enter = res.knapper.filter(function (k) { return k.hoved; })[0];
        } else {
            $("mk-start").addEventListener("click", function () { startSpil(); });
            mk.enter = null;
        }
        var v = $("mk-videre");
        if (v) v.addEventListener("click", function () { skiftLag(lag + 1); });
        Array.prototype.forEach.call(mk.querySelectorAll(".mk-lagknap"), function (b) {
            b.addEventListener("click", function () { skiftLag(Number(b.getAttribute("data-lag"))); });
        });
        /* Lagets eget valg (niveau i lag 1, 1 minut eller oev i lag 2) */
        Array.prototype.forEach.call(mk.querySelectorAll("[data-niv], [data-tilstand]"), function (b) {
            b.addEventListener("click", function () {
                if (m.valgKlik && m.valgKlik(b)) { var top = mk.scrollTop; visKort(res); $("midterkort").scrollTop = top; }
            });
            b.addEventListener("dblclick", startSpil);
        });
        var felt = $("navnefelt");
        if (felt) felt.addEventListener("change", function () { T.navn(felt.value); });
    }

    /* ----- Spillet ------------------------------------------------------- */
    function startSpil(valg) {
        L.vaek();
        var felt = $("navnefelt");
        if (felt) T.navn(felt.value);
        $("midterkort").hidden = true;
        $("scene").classList.remove("hvile");
        sidsteRes = null;
        modul().start(valg);
        spilknap();
    }

    /* Laget er faerdigt: res = { titel, point, niveau, sekunder, linjer, rekord }.
       rekord: false er oevelse (lag 1 under niveau 10, lag 2 uden tid): saa
       gemmes og sendes intet. */
    function slut(res) {
        res.ny = res.rekord === false ? { alle: false, uge: false } : T.gem(lag, res.point);
        sidsteRes = res;
        rekorder();
        spilknap();
        var dette = lag;
        var sendes = res.rekord === false ? T.hent(dette) : T.send(dette, res);
        sendes.then(function (l) {
            if (!l) return;
            lister[dette] = l;
            if (dette === lag && !koerer()) visKort(sidsteRes);
        });
        visKort(res);
    }

    function forfra() {
        if (!koerer()) return;
        modul().stop();
        sidsteRes = null;
        spilknap();
        visKort(null);
    }

    function skiftLag(n, stille) {
        n = Number(n);
        if (!NK.Lag[n]) return;
        if (koerer()) modul().stop();
        modul().skjul();
        lag = n;
        document.body.setAttribute("data-lag", String(n));
        Array.prototype.forEach.call(document.querySelectorAll(".faneknap"), function (b) {
            b.classList.toggle("valgt", Number(b.getAttribute("data-lag")) === n);
            b.setAttribute("aria-pressed", Number(b.getAttribute("data-lag")) === n ? "true" : "false");
        });
        if (!stille && location.hash !== "#lag" + n) {
            try { history.replaceState(null, "", "#lag" + n); } catch (e) { location.hash = "lag" + n; }
        }
        sidsteRes = null;
        opgave(null);
        $("valgkort").hidden = true;
        $("toast").hidden = true;
        $("popper").innerHTML = "";
        NK.saetTekst("spil-titel", "");
        $("spil-titel").innerHTML = NK.html(modul().titel) + ' <span class="taeller">rekord <b id="rekord">0</b></span>';
        modul().vis();
        rekorder();
        spilknap();
        visKort(null);
        hentListe(n);
    }

    function lagFraHash() {
        var m = /lag([123])|^#([123])$/.exec(location.hash || "");
        return m ? Number(m[1] || m[2]) : 1;
    }

    /* ----- Overlays og taster ------------------------------------------ */
    function aaben(id) {
        if (lag === 1 && koerer() && !NK.Lag[1].pauset()) { NK.Lag[1].pause(); spilknap(); }
        $(id).hidden = false;
    }
    function luk() { $("kortoverlay").hidden = true; $("regler").hidden = true; }
    function overlayAaben() { return !$("kortoverlay").hidden || !$("regler").hidden; }

    function typerForklaring() {
        $("typer-forklaring").innerHTML = D.TYPE_ORDEN.map(function (t) {
            return '<div class="tf"><span class="tf-navn" style="color:' + D.TYPER[t].farve + '">' + D.TYPER[t].navn + "</span>" +
                "<span>" + D.KENDETEGN[t] + "</span></div>";
        }).join("");
    }

    function lydIkon() { $("lydknap").textContent = L.til() ? "🔊" : "🔇"; }

    function tast(e) {
        if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName) && e.key !== "Enter" && e.key !== "Escape") return;
        if (e.key === "Escape") {
            if (overlayAaben()) { luk(); e.preventDefault(); return; }
        }
        if (overlayAaben()) return;
        if (koerer() && modul().tast(e)) { e.preventDefault(); return; }
        var k = e.key.toLowerCase();
        if (e.key === "Enter") {
            if (!koerer() && !$("midterkort").hidden) {
                var mk = $("midterkort");
                if (mk.enter) mk.enter.goer(); else startSpil();
                e.preventDefault();
            }
            return;
        }
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (k === "s") { aaben("kortoverlay"); }
        else if (k === "r") { aaben("regler"); }
        else if (k === "m") { L.skift(); lydIkon(); }
        else if (k === "p" && lag === 1 && koerer()) { knapKlik(); }
    }

    function knapKlik() {
        var m = modul();
        if (!m.koerer()) { startSpil(); return; }
        if (m.pause) {
            if (m.pauset()) m.fortsaet(); else m.pause();
        }
        spilknap();
    }

    function init() {
        NK.Kemi.start();
        $("spilknap").addEventListener("click", knapKlik);
        $("forfraknap").addEventListener("click", forfra);
        $("kortknap").addEventListener("click", function () { aaben("kortoverlay"); });
        $("regelknap").addEventListener("click", function () { aaben("regler"); });
        $("kort-luk").addEventListener("click", luk);
        $("regler-luk").addEventListener("click", luk);
        ["kortoverlay", "regler"].forEach(function (id) {
            $(id).addEventListener("click", function (e) { if (e.target.id === id) luk(); });
        });
        $("lydknap").addEventListener("click", function () { L.skift(); lydIkon(); });
        Array.prototype.forEach.call(document.querySelectorAll(".faneknap"), function (b) {
            b.addEventListener("click", function () { skiftLag(b.getAttribute("data-lag")); });
        });
        document.addEventListener("keydown", tast);
        window.addEventListener("hashchange", function () {
            var n = lagFraHash();
            if (n !== lag) skiftLag(n, true);
        });
        lydIkon();
        typerForklaring();
        [1, 2, 3].forEach(function (n) { NK.Lag[n].init(); });
        lag = lagFraHash();
        skiftLag(lag, true);
    }

    NK.App = {
        opgave: opgave,
        toast: toast,
        pop: pop,
        panel: panel,
        lagkort: lagkort,
        spilknap: spilknap,
        slut: slut,
        lag: function () { return lag; },
        liste: function (n) { return T.harDelt(n) ? lister[n] : null; },
        skiftLag: skiftLag,
        startSpil: startSpil,
        visKort: visKort
    };

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
}());
