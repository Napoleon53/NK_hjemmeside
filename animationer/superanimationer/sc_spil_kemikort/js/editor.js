/* =====================================================================
   editor.js - vinduet "Kort som tekst"

   Teksten staar til venstre og kortene til hoejre, som de kommer til at
   se ud. Fejl vises med linjenummer, mens man skriver, og et klik paa en
   fejl springer hen til linjen.

   Herfra kan man ogsaa hente en fil (ogsaa et Quizlet-saet, der er
   kopieret ud med tabulator mellem de to sider), gemme saettet som fil,
   kopiere et link med saettet i og hente en vejledning, man kan give en
   AI sammen med sit emne.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var F = NK.Tekstformat;
    var B = NK.Bibliotek;
    var el = NK.el;

    var E = NK.Editor = {};
    var aktuelNoegle = null;
    var vedBrug = null;
    var timer = 0;
    var sletSikker = 0;

    function kortHtml(k, nr) {
        return '<div class="ekort" data-linje="' + k.linje + '">'
            + '<span class="ekort-nr">' + nr + "</span>"
            + '<span class="ekort-for">' + NK.html(k.forside) + "</span>"
            + '<span class="ekort-pil">→</span>'
            + '<span class="ekort-bag">' + NK.html(k.bagside) + "</span></div>";
    }

    E.kontroller = function () {
        var tekst = el("egne-tekst").value;
        var r = F.fraTekst(tekst);
        var st = el("egne-status");
        st.classList.toggle("fejl", !r.saet);
        if (r.saet) {
            st.innerHTML = "✓ " + NK.html(r.udkast.navn) + ": " + NK.html(r.oversigt) + ". Klar til brug.";
        } else {
            st.innerHTML = r.fejl.slice(0, 4).map(function (f) {
                var m = /^Linje (\d+):/.exec(f);
                return m ? '<button type="button" class="linjefejl" data-linje="' + m[1] + '">✗ ' + NK.html(f) + "</button>"
                    : '<span class="linjefejl">✗ ' + NK.html(f) + "</span>";
            }).join("") + (r.fejl.length > 4 ? '<span class="linjefejl">og ' + (r.fejl.length - 4) + " fejl mere</span>" : "");
        }

        var u = r.udkast;
        var html = '<div class="ekort-hoved"><b>' + NK.html(u.navn) + "</b><span>"
            + NK.html(u.sider[0]) + " → " + NK.html(u.sider[1]) + "</span></div>";
        html += u.kort.map(function (k, i) { return kortHtml(k, i + 1); }).join("");
        if (!u.kort.length) html += '<p class="egne-tom">Kortene vises her, når der står en gyldig linje til venstre.</p>';
        el("egne-preview").innerHTML = html;

        el("egne-brug").disabled = !r.saet;
        el("egne-slet").hidden = !aktuelNoegle || B.indbygget(aktuelNoegle);
        el("egne-kilde").textContent = aktuelNoegle
            ? (B.indbygget(aktuelNoegle)
                ? "Indbygget sæt. Retter du i det, bliver det gemt som et nyt sæt af dine egne."
                : "Dit eget sæt, gemt i denne browser.")
            : "Nyt sæt. Det gemmes i denne browser.";
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
        clearTimeout(sletSikker);
        sletSikker = 0;
        el("egne-slet").textContent = "Slet sættet";
        E.kontroller();
        el("egne").classList.add("vis");
        el("egne-tekst").focus();
        el("egne-tekst").setSelectionRange(0, 0);
        el("egne-tekst").scrollTop = 0;
    };

    E.brug = function () {
        var tekst = el("egne-tekst").value;
        if (!E.kontroller().saet) return null;
        var noegle = B.somIndbygget(tekst);
        if (!noegle) {
            noegle = B.gem(tekst, B.indbygget(aktuelNoegle) ? null : (aktuelNoegle || "").replace(/^e:/, "") || null);
        }
        aktuelNoegle = noegle;
        B.vaelg(noegle);
        el("egne").classList.remove("vis");
        if (vedBrug) vedBrug(noegle);
        return noegle;
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

    E.luk = function () { el("egne").classList.remove("vis"); };
    E.aaben = function () { return el("egne").classList.contains("vis"); };

    function init() {
        el("egne-tekst").addEventListener("input", planlaeg);
        el("egne-brug").addEventListener("click", E.brug);
        el("egne-luk").addEventListener("click", E.luk);
        el("egne-eksport").addEventListener("click", function () {
            var tekst = el("egne-tekst").value;
            NK.gemFil(tekst, NK.filnavn(F.fraTekst(tekst).udkast.navn));
        });
        el("egne-ai").addEventListener("click", function () { NK.kopier(F.aiVejledning(), el("egne-ai")); });
        el("egne-link").addEventListener("click", function () {
            var tekst = el("egne-tekst").value;
            if (!F.fraTekst(tekst).saet) { E.kontroller(); return; }
            NK.kopier(B.link(tekst), el("egne-link"));
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
                sletSikker = setTimeout(function () {
                    sletSikker = 0;
                    el("egne-slet").textContent = "Slet sættet";
                }, 3000);
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
