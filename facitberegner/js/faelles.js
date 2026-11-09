/* =====================================================================
   faelles.js - det, de tre beregnere deler

   Tal læses med komma eller punktum. Tal skrives med decimalkomma, et
   rigtigt minustegn og potenser som 6,0 · 10^-4 (med <sup>).
   Formler skrives med <sub> og <sup> i HTML.
   ===================================================================== */
(function () {
    "use strict";

    var F = {};
    var MINUS = "−";

    /* ----- Tal ind ---------------------------------------------------- */

    /* Læser et tal, som eleven har skrevet: "0,10", "1.8e-5", "1,8·10^-5",
       "1,8 · 10⁻⁵", "−3,2". Giver null, hvis feltet er tomt eller ulæseligt. */
    F.tal = function (tekst) {
        if (tekst === null || tekst === undefined) return null;
        var s = String(tekst).trim();
        if (s === "") return null;
        s = s.replace(/[−–—]/g, "-").replace(/\s+/g, "");
        s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]/g, function (c) {
            return { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁻": "-", "⁺": "+" }[c];
        });
        // 1,8·10^-5 eller 1,8*10-5 (efter at hævet skrift er gjort almindelig)
        var m = s.match(/^([-+]?[0-9]*[.,]?[0-9]+)(?:[·∙*x×]10\^?([-+]?[0-9]+))$/);
        if (m) return parseFloat(m[1].replace(",", ".")) * Math.pow(10, parseInt(m[2], 10));
        s = s.replace(",", ".");
        if (!/^[-+]?([0-9]+\.?[0-9]*|\.[0-9]+)(e[-+]?[0-9]+)?$/i.test(s)) return NaN;
        return parseFloat(s);
    };

    /* ----- Tal ud ------------------------------------------------------ */

    var HAEVET = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻", "+": "⁺", "−": "⁻" };
    var SAENKET = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉" };

    function tusinder(heltal) {
        // 41500 -> "41 500" (smalt mellemrum); firecifrede tal får intet mellemrum
        if (heltal.length <= 4) return heltal;
        return heltal.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    function fast(x, decimaler) {
        var s = Math.abs(x).toFixed(Math.max(0, decimaler));
        var dele = s.split(".");
        var ud = tusinder(dele[0]) + (dele[1] ? "," + dele[1] : "");
        if (x < 0 && /[1-9]/.test(s)) ud = MINUS + ud;
        return ud;
    }

    function potens(x, n) {
        var e = x.toExponential(Math.max(0, n - 1)); // "1.23e-5"
        var dele = e.split("e");
        var mantisse = dele[0].replace("-", MINUS).replace(".", ",");
        var eksp = parseInt(dele[1], 10);
        if (eksp === 0) return mantisse;
        return mantisse + " · 10<sup>" + String(eksp).replace("-", MINUS) + "</sup>";
    }

    /* Et tal med n betydende cifre, som i superskabelonen: meget små og
       store tal som potens, ellers almindeligt. stor angiver, fra hvilken
       størrelse der skrives potens (standard: 10^n, dog højst 10 000). */
    F.bc = function (x, n, stor) {
        if (x === null || x === undefined || !isFinite(x)) return "";
        n = n || 3;
        if (x === 0) return n > 1 ? "0," + "0".repeat(n - 1) : "0";
        var ax = Math.abs(x);
        var graense = stor || Math.min(Math.pow(10, n), 10000);
        if (ax < 0.001 || ax >= graense) return potens(x, n);
        var eksp = Math.floor(Math.log10(ax));
        var dec = n - 1 - eksp;
        // afrunding kan løfte tallet en dekade op (9,996 -> 10,0)
        var afrundet = Number(ax.toFixed(Math.max(0, dec)));
        if (afrundet !== 0 && Math.floor(Math.log10(afrundet)) > eksp) dec -= 1;
        if (dec < 0) {
            var f = Math.pow(10, -dec);
            return fast(Math.round(x / f) * f, 0);
        }
        return fast(x, dec);
    };

    /* Et tal med et fast antal decimaler (pH, forhold). */
    F.dec = function (x, decimaler) {
        if (x === null || x === undefined || !isFinite(x)) return "";
        return fast(x, decimaler);
    };

    /* Et tal fra databogen, som det står der (højst 6 betydende cifre). */
    F.som = function (x) {
        if (x === null || x === undefined || !isFinite(x)) return "";
        var s = String(Number(x.toPrecision(6)));
        if (/e/.test(s)) return potens(x, 4);
        var dele = s.replace("-", "").split(".");
        var ud = tusinder(dele[0]) + (dele[1] ? "," + dele[1] : "");
        return (x < 0 ? MINUS : "") + ud;
    };

    /* Et tal i parentes, hvis det er negativt (til indsættelse i formler). */
    F.par = function (tekst) {
        return tekst.charAt(0) === MINUS ? "(" + tekst + ")" : tekst;
    };

    F.MINUS = MINUS;

    /* ----- Kemiske formler --------------------------------------------- */

    /* Gør en formel ens, så den kan sammenlignes: almindelige cifre, + og -
       og ∙ for krystalvand, ingen mellemrum. */
    F.formelNoegle = function (s) {
        if (!s) return "";
        s = String(s).trim();
        s = s.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, function (c) { return String("₀₁₂₃₄₅₆₇₈₉".indexOf(c)); });
        s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, function (c) { return String("⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(c)); });
        s = s.replace(/⁺/g, "+").replace(/[⁻−–]/g, "-");
        s = s.replace(/[·∙•*]/g, "∙").replace(/\^/g, "");
        s = s.replace(/\s+/g, "");
        return s;
    };

    var ENKELT_GRUNDSTOF = null;
    function erGrundstofsymbol(s) {
        if (!ENKELT_GRUNDSTOF) {
            ENKELT_GRUNDSTOF = {};
            (window.GRUNDSTOFFER || []).forEach(function (g) { ENKELT_GRUNDSTOF[g[1]] = true; });
        }
        return !!ENKELT_GRUNDSTOF[s];
    }

    /* Skriver en formel pænt i HTML: H2O -> H<sub>2</sub>O, SO42- -> SO<sub>4</sub><sup>2−</sup>.
       Formler med hævet og sænket skrift (fra databogen) oversættes også. */
    F.formelHTML = function (s) {
        if (!s) return "";
        s = String(s).trim();
        // Unicode fra databogen
        if (/[₀-₉⁰-⁹⁺⁻]/.test(s)) {
            var ud = "";
            for (var i = 0; i < s.length; i++) {
                var c = s.charAt(i);
                var si = "₀₁₂₃₄₅₆₇₈₉ₙ".indexOf(c);
                var hi = "⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(c);
                if (si >= 0) ud += "<sub>" + (c === "ₙ" ? "n" : si) + "</sub>";
                else if (hi >= 0) ud += "<sup>" + hi + "</sup>";
                else if (c === "⁺") ud += "<sup>+</sup>";
                else if (c === "⁻") ud += "<sup>" + MINUS + "</sup>";
                else ud += esc(c);
            }
            return ud.replace(/<\/sub><sub>/g, "").replace(/<\/sup><sup>/g, "");
        }
        // Almindelig skrift: find ladningen sidst
        var ladning = "";
        var m = s.match(/^(.*?)(?:\s+|\^)(\d*)([+-])$/);   // "SO4 2-" eller "SO4^2-"
        if (m) {
            s = m[1]; ladning = (m[2] && m[2] !== "1" ? m[2] : "") + m[3];
        } else {
            m = s.match(/^(.*?)(\d?)([+-])$/);
            if (m) {
                var forrest = m[1], ciffer = m[2], tegn = m[3];
                // SO42- og Fe3+: cifret er ladningen; NH4+: cifret hører til formlen
                if (ciffer && (/\d$|\)$/.test(forrest) || erGrundstofsymbol(forrest))) {
                    s = forrest; ladning = ciffer + tegn;
                } else {
                    s = forrest + ciffer; ladning = tegn;
                }
            }
        }
        var html = esc(s).replace(/([A-Za-z\)\]])(\d+)/g, "$1<sub>$2</sub>");
        // krystalvand: ·5H2O -> · 5 H2O
        html = html.replace(/[·∙•*]\s*(\d*)\s*/g, function (_, k) { return " · " + (k ? k + " " : ""); });
        if (ladning) html += "<sup>" + ladning.replace("-", MINUS) + "</sup>";
        return html;
    };

    function esc(s) {
        return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    F.esc = esc;

    /* ----- Små byggesten til matematik i HTML ----------------------------- */

    F.brok = function (t, n) {
        return '<span class="brok"><span class="t">' + t + '</span><span class="n">' + n + "</span></span>";
    };
    F.v = function (s) { return "<i>" + s + "</i>"; };          // variabel i kursiv
    F.std = "<sup>⊖</sup>";
    F.dH = "Δ<i>H</i><sup>⊖</sup>";
    F.dS = "Δ<i>S</i><sup>⊖</sup>";
    F.dG = "Δ<i>G</i><sup>⊖</sup>";
    F.enh = {
        kJmol: "kJ/mol",
        JmolK: "J/(mol · K)",
        kJmolK: "kJ/(mol · K)"
    };

    /* ----- Kopiér til Word ------------------------------------------------ */

    /* Brøker bliver til (tæller)/(nævner), og hævet og sænket skrift bliver
       stående, så teksten kan sættes ind i Word. */
    function lineaer(rod) {
        var kopi = rod.cloneNode(true);
        kopi.querySelectorAll(".kun-skaerm, button").forEach(function (el) { el.remove(); });
        kopi.querySelectorAll(".trin[hidden]").forEach(function (el) { el.removeAttribute("hidden"); });
        // en lukket "Løsning i hånden" kommer ikke med; en åben kommer med uden sin overskrift
        var orig = rod.querySelectorAll("details"), kop = kopi.querySelectorAll("details");
        Array.prototype.forEach.call(kop, function (d, i) {
            if (!orig[i] || !orig[i].open) { d.remove(); return; }
            var sum = d.querySelector("summary"); if (sum) sum.remove();
            var div = document.createElement("div"); div.innerHTML = d.innerHTML; d.replaceWith(div);
        });
        // inderste brøker først
        var brokker = Array.prototype.slice.call(kopi.querySelectorAll(".brok")).reverse();
        brokker.forEach(function (b) {
            var t = b.querySelector(":scope > .t"), n = b.querySelector(":scope > .n");
            function pak(el) {
                var tekst = el.textContent.trim();
                return /[\s+−\-·\/]/.test(tekst) ? "(" + el.innerHTML + ")" : el.innerHTML;
            }
            var span = document.createElement("span");
            span.innerHTML = pak(t) + "/" + pak(n);
            b.replaceWith(span);
        });
        return kopi;
    }

    function tilTekst(el) {
        var html = el.innerHTML;
        html = html.replace(/<sup>(.*?)<\/sup>/g, function (_, x) {
            var ren = x.replace(/<[^>]+>/g, "");
            var ok = ren.split("").every(function (c) { return HAEVET[c] || c === "⊖"; });
            return ok ? ren.split("").map(function (c) { return c === "⊖" ? "°" : HAEVET[c]; }).join("") : "^(" + ren + ")";
        });
        html = html.replace(/<sub>(.*?)<\/sub>/g, function (_, x) {
            var ren = x.replace(/<[^>]+>/g, "");
            var ok = ren.split("").every(function (c) { return SAENKET[c]; });
            return ok ? ren.split("").map(function (c) { return SAENKET[c]; }).join("") : ren;
        });
        html = html.replace(/<h4>/g, "\n<h4>").replace(/<\/(p|h3|h4|li|tr|div)>/g, "\n").replace(/<br\s*\/?>/g, "\n").replace(/<\/t[dh]>/g, "\t");
        var d = document.createElement("div");
        d.innerHTML = html;
        return d.textContent.replace(/\n{3,}/g, "\n\n").trim();
    }

    /* Teksten, som den kopieres (bruges også til at afprøve kopieringen). */
    F.somTekst = function (rod) { return tilTekst(lineaer(rod)); };
    F.somHTML = function (rod) { return lineaer(rod).innerHTML; };

    F.kopier = function (rod, knap) {
        var kopi = lineaer(rod);
        var html = kopi.innerHTML;
        var tekst = tilTekst(kopi);
        function faerdig(ok) {
            if (!knap) return;
            var gammel = knap.dataset.tekst || knap.textContent;
            knap.dataset.tekst = gammel;
            knap.textContent = ok ? "Kopieret" : "Kunne ikke kopiere";
            setTimeout(function () { knap.textContent = gammel; }, 1800);
        }
        function reserve() {
            var d = document.createElement("div");
            d.contentEditable = "true";
            d.style.position = "fixed"; d.style.left = "-9999px"; d.style.top = "0";
            d.innerHTML = html;
            document.body.appendChild(d);
            var r = document.createRange(); r.selectNodeContents(d);
            var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
            var ok = false;
            try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
            sel.removeAllRanges(); d.remove();
            faerdig(ok);
        }
        try {
            if (navigator.clipboard && window.ClipboardItem) {
                navigator.clipboard.write([new ClipboardItem({
                    "text/html": new Blob([html], { type: "text/html" }),
                    "text/plain": new Blob([tekst], { type: "text/plain" })
                })]).then(function () { faerdig(true); }, reserve);
                return;
            }
        } catch (e) { /* prøv den gamle måde */ }
        reserve();
    };

    /* ----- Trin for trin ---------------------------------------------------- */

    /* Besvarelsen deles i trin ved hver overskrift (h4). Med "Trin for trin"
       slået til vises ét trin ad gangen med knappen Vis næste trin. Valget
       gælder alle beregnere og huskes i browseren. */
    F.trinvisPaa = function () { return F.husk("trinvis") === true; };

    function visTrin(boks) {
        var grupper = F.$$(":scope > .trin", boks);
        var paa = F.trinvisPaa();
        var vist = Math.min(Math.max(1, parseInt(boks.dataset.vist || "1", 10)), grupper.length || 1);
        grupper.forEach(function (g, i) { g.hidden = paa && i >= vist; });
        var st = F.$(":scope > .trin-styring", boks);
        if (st) {
            st.hidden = !paa || vist >= grupper.length;
            F.$(".trin-naeste", st).textContent = "Vis næste trin (" + (vist + 1) + " af " + grupper.length + ")";
        }
    }

    F.trin = function (boks) {
        if (!boks) return;
        var ramme = boks.closest(".ramme");
        var knapper = ramme && F.$(".besvarelse-knapper", ramme);
        if (knapper && !F.$(".trin-valg", knapper)) {
            var lab = document.createElement("label");
            lab.className = "trin-valg";
            lab.innerHTML = '<input type="checkbox"> Trin for trin';
            var cb = F.$("input", lab);
            cb.checked = F.trinvisPaa();
            cb.addEventListener("change", function () {
                F.husk("trinvis", cb.checked);
                F.$$(".trin-valg input").forEach(function (c) { c.checked = cb.checked; });
                F.$$(".besvarelse").forEach(function (b) { b.dataset.vist = "1"; visTrin(b); });
            });
            knapper.insertBefore(lab, knapper.firstChild);
        }
        var boern = Array.prototype.slice.call(boks.childNodes);
        if (!boern.length || boern.some(function (nd) { return nd.nodeType === 1 && nd.classList.contains("trin"); })) { visTrin(boks); return; }
        var grupper = [], cur = null;
        boern.forEach(function (nd) {
            if (!cur || (nd.nodeType === 1 && nd.tagName === "H4" && cur.childNodes.length)) {
                cur = document.createElement("div");
                cur.className = "trin";
                grupper.push(cur);
            }
            cur.appendChild(nd);
        });
        grupper.forEach(function (g) { boks.appendChild(g); });
        var st = document.createElement("div");
        st.className = "trin-styring kun-skaerm";
        st.innerHTML = '<button type="button" class="knap knap-primaer trin-naeste">Vis næste trin</button> <button type="button" class="knap-lille trin-alle">Vis alle trin</button>';
        boks.appendChild(st);
        F.$(".trin-naeste", st).addEventListener("click", function () {
            boks.dataset.vist = String(Math.max(1, parseInt(boks.dataset.vist || "1", 10)) + 1);
            visTrin(boks);
            var g = F.$$(":scope > .trin:not([hidden])", boks).pop();
            if (g && g.scrollIntoView) g.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
        F.$(".trin-alle", st).addEventListener("click", function () {
            boks.dataset.vist = String(F.$$(":scope > .trin", boks).length);
            visTrin(boks);
        });
        visTrin(boks);
    };

    /* ----- Hjælpere til felter --------------------------------------------- */

    F.$ = function (sel, rod) { return (rod || document).querySelector(sel); };
    F.$$ = function (sel, rod) { return Array.prototype.slice.call((rod || document).querySelectorAll(sel)); };

    /* Gemmer felternes indhold, så siden husker dem ved genindlæsning. */
    F.husk = function (noegle, data) {
        try {
            if (data === undefined) return JSON.parse(localStorage.getItem("facit-" + noegle) || "null");
            localStorage.setItem("facit-" + noegle, JSON.stringify(data));
        } catch (e) { return null; }
    };

    window.FACIT = F;
})();
