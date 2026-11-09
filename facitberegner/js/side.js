/* side.js - valget mellem de tre beregnere. Intet er valgt fra start;
   adressen #termodynamik, #empirisk eller #syrebase åbner en beregner direkte. */
(function () {
    "use strict";

    var fliser = Array.prototype.slice.call(document.querySelectorAll(".valg-flise"));
    var NAVNE = fliser.map(function (f) { return f.dataset.maal; });

    function aabn(navn, rul) {
        fliser.forEach(function (f) {
            var valgt = f.dataset.maal === navn;
            f.setAttribute("aria-selected", valgt ? "true" : "false");
            document.getElementById(f.dataset.maal).hidden = !valgt;
        });
        document.getElementById("vaelg-foerst").hidden = !!navn;
        if (navn && history.replaceState) history.replaceState(null, "", "#" + navn);
        if (navn && rul) document.getElementById(navn).scrollIntoView({ behavior: "smooth", block: "start" });
    }

    fliser.forEach(function (f) {
        f.addEventListener("click", function () { aabn(f.dataset.maal, false); });
    });

    var fra = (location.hash || "").replace("#", "");
    aabn(NAVNE.indexOf(fra) >= 0 ? fra : null, false);
    window.addEventListener("hashchange", function () {
        var h = (location.hash || "").replace("#", "");
        if (NAVNE.indexOf(h) >= 0) aabn(h, false);
    });
})();
