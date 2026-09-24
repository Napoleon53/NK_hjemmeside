/* =====================================================================
   editor.js - quizbiblioteket og vinduet Quizzer som tekst

   NK.Bibliotek holder styr paa quizzerne:
     "i:b", "i:a", "i:nf"   de indbyggede fra data.js
     "e:<id>"               egne quizzer, gemt i denne browser
   Den valgte quiz huskes. Et link med #b, #a eller #nf vaelger en
   indbygget, og et link med #quiz=... har selve quizzen i sig; den gemmes
   saa blandt de egne og vaelges.

   NK.Editor er vinduet: teksten til venstre og tavlerne til hoejre, som
   de kommer til at se ud. Fejl vises med linjenummer, mens man skriver.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var F = NK.Tekstformat;
    var Tv = NK.Tavle;
    var el = NK.el;

    var EGNE = "nk-lykkehjul-egne";
    var VALGT = "nk-lykkehjul-valgt";
    var ONLINE = "https://kemiformler.dk/animationer/superanimationer/sc_spil_lykkehjul/index.html";

    /* ----- Biblioteket --------------------------------------------------- */
    var B = NK.Bibliotek = {};
    var cache = {};

    function egne() {
        var l = NK.hent(EGNE, []);
        return Array.isArray(l) ? l.filter(function (x) { return x && x.id && typeof x.tekst === "string"; }) : [];
    }

    function normal(tekst) {
        return String(tekst || "").replace(/\r/g, "").split("\n").map(function (l) { return l.trim(); })
            .filter(function (l) { return l; }).join("\n");
    }

    B.tekst = function (noegle) {
        var m = /^([ie]):(.+)$/.exec(noegle || "");
        if (!m) return null;
        if (m[1] === "i") {
            var i = D.INDBYGGEDE.filter(function (x) { return x.noegle === m[2]; })[0];
            return i ? i.tekst : null;
        }
        var e = egne().filter(function (x) { return x.id === m[2]; })[0];
        return e ? e.tekst : null;
    };

    B.findes = function (noegle) { return B.tekst(noegle) !== null; };
    B.indbygget = function (noegle) { return /^i:/.test(noegle || ""); };

    /* Quizzen til spillet, eller null hvis teksten har fejl */
    B.quiz = function (noegle) {
        var t = B.tekst(noegle);
        if (t === null) return null;
        if (cache[noegle] && cache[noegle].tekst === t) return cache[noegle].quiz;
        var r = F.fraTekst(t);
        cache[noegle] = { tekst: t, quiz: r.quiz };
        return r.quiz;
    };

    B.liste = function () {
        var ud = D.INDBYGGEDE.map(function (x) {
            return { noegle: "i:" + x.noegle, navn: F.fraTekst(x.tekst).udkast.navn, indbygget: true };
        });
        egne().forEach(function (x) {
            ud.push({ noegle: "e:" + x.id, navn: F.fraTekst(x.tekst).udkast.navn, indbygget: false });
        });
        return ud;
    };

    B.valgt = function () {
        var v = NK.hent(VALGT, null);
        return v && B.findes(v) ? v : "i:" + D.STANDARD;
    };

    B.vaelg = function (noegle) {
        if (B.findes(noegle)) NK.gem(VALGT, noegle);
    };

    /* Gemmer en egen quiz. Uden id laves en ny. Giver noeglen. */
    B.gem = function (tekst, id) {
        var l = egne();
        var fundet = id ? l.filter(function (x) { return x.id === id; })[0] : null;
        if (!fundet) {
            var ens = l.filter(function (x) { return normal(x.tekst) === normal(tekst); })[0];
            if (ens) return "e:" + ens.id;
            fundet = { id: "e" + F.fingeraftryk(tekst + Date.now()) };
            l.push(fundet);
        }
        fundet.tekst = tekst;
        NK.gem(EGNE, l);
        return "e:" + fundet.id;
    };

    B.slet = function (noegle) {
        var m = /^e:(.+)$/.exec(noegle || "");
        if (!m) return false;
        NK.gem(EGNE, egne().filter(function (x) { return x.id !== m[1]; }));
        if (NK.hent(VALGT, null) === noegle) NK.glem(VALGT);
        return true;
    };

    /* Er teksten den samme som en indbygget quiz? Giver dens noegle. */
    B.somIndbygget = function (tekst) {
        var i = D.INDBYGGEDE.filter(function (x) { return normal(x.tekst) === normal(tekst); })[0];
        return i ? "i:" + i.noegle : null;
    };

    /* Linket, der deler en quiz. Fra harddisken peger det paa kemiformler.dk. */
    B.link = function (tekst) {
        var rod = /^https?:$/.test(window.location.protocol)
            ? window.location.href.replace(/#.*$/, "") : ONLINE;
        return rod + "#quiz=" + F.tilLink(tekst);
    };

    /* Laeser linket. Giver noeglen til den valgte quiz, eller null. */
    B.fraHash = function (hash) {
        var h = String(hash || "").replace(/^#/, "");
        var m = /^quiz=(.+)$/.exec(h);
        if (m) {
            var t = F.fraLink(m[1]);
            if (t && F.fraTekst(t).quiz) return B.somIndbygget(t) || B.gem(t);
            return null;
        }
        h = h.toLowerCase();
        var i = D.INDBYGGEDE.filter(function (x) { return x.noegle === h; })[0];
        return i ? "i:" + i.noegle : null;
    };

    /* ----- Vinduet ------------------------------------------------------- */
    var E = NK.Editor = {};
    var aktuelNoegle = null;
    var vedBrug = null;
    var timer = 0;
    var sletSikker = 0;

    function miniTavle(g) {
        var felter = {};
        g.celler.forEach(function (c) { felter[c.r + "." + c.k] = c; });
        var html = '<div class="mini">';
        for (var r = 0; r < 4; r++) {
            for (var k = 0; k < Tv.KOLONNER; k++) {
                if (!Tv.findes(r, k)) { html += '<i class="ingen"></i>'; continue; }
                var c = felter[r + "." + k];
                html += c ? '<i class="bogst">' + NK.html(c.tegn) + "</i>" : "<i></i>";
            }
        }
        return html + "</div>";
    }

    function kort(g, nr) {
        var type = g.type === "tossup" ? "Toss-up · " + NK.beloeb(g.vaerdi, "kr.") : (g.type === "final" ? "Final" : "Runde");
        return '<div class="egne-kort ' + g.type + '" data-linje="' + g.linje + '">'
            + '<div class="egne-kort-hoved"><span class="nr">' + nr + '</span><span class="type">' + type + '</span>'
            + '<span class="kat">' + NK.html(g.kategori) + "</span></div>"
            + miniTavle(g) + "</div>";
    }

    E.kontroller = function () {
        var tekst = el("egne-tekst").value;
        var r = F.fraTekst(tekst);
        var st = el("egne-status");
        st.classList.toggle("fejl", !r.quiz);
        if (r.quiz) {
            st.innerHTML = "✓ " + NK.html(r.udkast.navn) + ": " + r.oversigt + ". Klar til brug.";
        } else {
            st.innerHTML = r.fejl.slice(0, 4).map(function (f) {
                var m = /^Linje (\d+):/.exec(f);
                return m ? '<button type="button" class="linjefejl" data-linje="' + m[1] + '">✗ ' + NK.html(f) + "</button>"
                    : '<span class="linjefejl">✗ ' + NK.html(f) + "</span>";
            }).join("") + (r.fejl.length > 4 ? '<span class="linjefejl">og ' + (r.fejl.length - 4) + " fejl mere</span>" : "");
        }
        var u = r.udkast, html = "";
        u.gaader.forEach(function (g, i) { html += kort(g, i + 1); });
        if (u.final) html += kort(u.final, "F");
        if (!html) html = '<p class="egne-tom">Tavlerne vises her, når der står en gyldig linje til venstre.</p>';
        el("egne-preview").innerHTML = html;
        el("egne-brug").disabled = !r.quiz;
        el("egne-slet").hidden = !aktuelNoegle || B.indbygget(aktuelNoegle);
        el("egne-kilde").textContent = aktuelNoegle
            ? (B.indbygget(aktuelNoegle) ? "Indbygget quiz. Gemmes som en ny, egen quiz, hvis du retter i den." : "Egen quiz, gemt i denne browser.")
            : "Ny quiz. Gemmes i denne browser.";
        return r;
    };

    function planlaeg() {
        clearTimeout(timer);
        timer = setTimeout(E.kontroller, 140);
    }

    /* Markerer linje nr i tekstfeltet */
    function gaaTilLinje(nr) {
        var t = el("egne-tekst"), linjer = t.value.split("\n"), start = 0;
        for (var i = 0; i < nr - 1 && i < linjer.length; i++) start += linjer[i].length + 1;
        var slut = start + (linjer[nr - 1] || "").length;
        t.focus();
        t.setSelectionRange(start, slut);
        var hoejde = parseFloat(window.getComputedStyle(t).lineHeight) || 21;
        t.scrollTop = Math.max(0, (nr - 3) * hoejde);
    }

    E.aabn = function (noegle, brug) {
        aktuelNoegle = noegle;
        vedBrug = brug;
        el("egne-tekst").value = B.tekst(noegle) || F.skabelon();
        sletSikker = 0;
        el("egne-slet").textContent = "Slet quizzen";
        E.kontroller();
        el("egne").classList.add("vis");
        el("egne-tekst").focus();
        el("egne-tekst").setSelectionRange(0, 0);
        el("egne-tekst").scrollTop = 0;
    };

    E.brug = function () {
        var tekst = el("egne-tekst").value;
        if (!E.kontroller().quiz) return null;
        var noegle = B.somIndbygget(tekst);
        if (!noegle) noegle = B.gem(tekst, B.indbygget(aktuelNoegle) ? null : (aktuelNoegle || "").replace(/^e:/, "") || null);
        aktuelNoegle = noegle;
        B.vaelg(noegle);
        el("egne").classList.remove("vis");
        if (vedBrug) vedBrug(noegle);
        return noegle;
    };

    function filnavn(tekst) {
        var m = /^\s*titel\s*:\s*(.+)$/im.exec(tekst);
        return "lykkehjul-" + ((m ? m[1] : "quiz").toLowerCase().replace(/æ/g, "ae").replace(/ø/g, "oe").replace(/å/g, "aa")
            .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "quiz") + ".txt";
    }

    E.eksporter = function () {
        var tekst = el("egne-tekst").value;
        var a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob(["\ufeff" + tekst], { type: "text/plain;charset=utf-8" }));
        a.download = filnavn(tekst);
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    };

    function laesFil(fil) {
        if (!fil) return;
        var r = new FileReader();
        r.onload = function () {
            el("egne-tekst").value = String(r.result).replace(/^\ufeff/, "");
            aktuelNoegle = null;
            E.kontroller();
        };
        r.readAsText(fil, "utf-8");
    }

    /* Kopierer til udklipsholderen og viser en kvittering paa knappen */
    E.kopier = function (tekst, knap) {
        var foer = knap.getAttribute("data-tekst") || knap.textContent;
        knap.setAttribute("data-tekst", foer);
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
    };

    E.luk = function () { el("egne").classList.remove("vis"); };
    E.aaben = function () { return el("egne").classList.contains("vis"); };

    function init() {
        el("egne-tekst").addEventListener("input", planlaeg);
        el("egne-brug").addEventListener("click", E.brug);
        el("egne-eksport").addEventListener("click", E.eksporter);
        el("egne-luk").addEventListener("click", E.luk);
        el("egne-ai").addEventListener("click", function () { E.kopier(F.aiVejledning(), el("egne-ai")); });
        el("egne-link").addEventListener("click", function () {
            var tekst = el("egne-tekst").value;
            if (!F.fraTekst(tekst).quiz) { E.kontroller(); return; }
            E.kopier(B.link(tekst), el("egne-link"));
        });
        el("egne-ny").addEventListener("click", function () {
            aktuelNoegle = null;
            el("egne-tekst").value = F.skabelon();
            E.kontroller();
            el("egne-tekst").focus();
        });
        el("egne-slet").addEventListener("click", function () {
            if (!aktuelNoegle || B.indbygget(aktuelNoegle)) return;
            if (!sletSikker) {
                el("egne-slet").textContent = "Sikker? Klik igen";
                sletSikker = setTimeout(function () { sletSikker = 0; el("egne-slet").textContent = "Slet quizzen"; }, 3000);
                return;
            }
            clearTimeout(sletSikker);
            sletSikker = 0;
            B.slet(aktuelNoegle);
            aktuelNoegle = null;
            E.luk();
            if (vedBrug) vedBrug(B.valgt());
        });
        el("egne-upload").addEventListener("click", function () { el("egne-fil").value = ""; el("egne-fil").click(); });
        el("egne-fil").addEventListener("change", function () { laesFil(el("egne-fil").files[0]); });
        el("egne-tekst").addEventListener("dragover", function (e) { e.preventDefault(); });
        el("egne-tekst").addEventListener("drop", function (e) {
            if (!e.dataTransfer || !e.dataTransfer.files.length) return;
            e.preventDefault();
            laesFil(e.dataTransfer.files[0]);
        });
        el("egne-status").addEventListener("click", function (e) {
            var b = e.target.closest("[data-linje]");
            if (b) gaaTilLinje(+b.getAttribute("data-linje"));
        });
        el("egne-preview").addEventListener("click", function (e) {
            var b = e.target.closest("[data-linje]");
            if (b) gaaTilLinje(+b.getAttribute("data-linje"));
        });
        el("egne").addEventListener("click", function (e) { if (e.target === el("egne")) E.luk(); });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
}());
