/* =====================================================================
   kurve.js - de tre sektorer aar for aar (et tilvalg i panelet)

   Kurven staar ikke i bogen: figur 8.1 viser de otte erhverv hver for
   sig. Her er de lagt sammen til sektorer. Kurven tegnes kun for de
   aar, eleven har vaeret forbi med skyderen, saa den ikke roeber svarene
   paa forhaand. Den er slaaet fra fra start og kommer frem med knappen
   Kurve i toplinjen.

   Tegnes i samme maal som feltet paa skaermen (én enhed = én pixel),
   saa skriften ikke bliver mindre i et smalt panel.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data, M = NK.Model;

    var SVGNS = "http://www.w3.org/2000/svg";
    var HOEJDE = 150;
    var TOP = 75;                       /* aksens oeverste vaerdi */
    var svg, bredde = 300;
    var nu = D.FOERSTE, lav = D.FOERSTE, hoej = D.FOERSTE;
    var VENSTRE = 28, HOEJRE = 12, OVER = 8, UNDER = 24;

    function x(aar) { return VENSTRE + (aar - D.FOERSTE) / (D.SIDSTE - D.FOERSTE) * (bredde - VENSTRE - HOEJRE); }
    function y(v) { return OVER + (1 - v / TOP) * (HOEJDE - OVER - UNDER); }
    function r1(v) { return Math.round(v * 10) / 10; }

    function lav_el(navn, attr, tekst) {
        var e = document.createElementNS(SVGNS, navn);
        for (var a in attr) e.setAttribute(a, attr[a]);
        if (tekst !== undefined) e.textContent = tekst;
        svg.appendChild(e);
        return e;
    }

    function tegn() {
        if (!svg) return;
        while (svg.firstChild) svg.removeChild(svg.firstChild);
        svg.setAttribute("viewBox", "0 0 " + bredde + " " + HOEJDE);
        svg.setAttribute("width", bredde);
        svg.setAttribute("height", HOEJDE);

        var i, aar, v;
        /* vandrette linjer: 0, 25, 50 og 75. 50 er halvdelen. */
        for (v = 0; v <= TOP; v += 25) {
            lav_el("line", { x1: VENSTRE, x2: bredde - HOEJRE, y1: r1(y(v)), y2: r1(y(v)), "class": v === 50 ? "k-halv" : "k-net" });
            lav_el("text", { x: VENSTRE - 6, y: r1(y(v) + 4), "text-anchor": "end", "class": "k-tal" }, String(v));
        }

        /* aarene med tal i figuren. Alle faar en streg, men et aarstal skrives
           kun, naar der er plads til det ved siden af naboerne. */
        var sidste = D.AAR.length - 1;
        var TALBREDDE = 31, LUFT = 5;
        function felt(nr) {
            var midt = x(D.AAR[nr]);
            if (nr === 0) return [midt, midt + TALBREDDE];
            if (nr === sidste) return [midt - TALBREDDE, midt];
            return [midt - TALBREDDE / 2, midt + TALBREDDE / 2];
        }
        var skrives = [], forrige = felt(0), slutfelt = felt(sidste);
        for (i = 0; i <= sidste; i++) {
            var f = felt(i);
            skrives.push(i === 0 || i === sidste || (f[0] >= forrige[1] + LUFT && f[1] <= slutfelt[0] - LUFT));
            if (skrives[i]) forrige = f;
        }
        for (i = 0; i < D.AAR.length; i++) {
            aar = D.AAR[i];
            lav_el("line", { x1: r1(x(aar)), x2: r1(x(aar)), y1: r1(y(0)), y2: r1(y(0) + 4), "class": "k-net" });
            if (!skrives[i]) continue;
            lav_el("text", {
                x: r1(x(aar)), y: HOEJDE - 5, "class": "k-tal",
                "text-anchor": i === 0 ? "start" : (i === sidste ? "end" : "middle")
            }, String(aar));
        }

        /* de tre kurver, kun for de aar eleven har vaeret forbi */
        for (i = 0; i < D.SEKTORER.length; i++) {
            var id = D.SEKTORER[i].id, punkter = [];
            for (aar = lav; aar <= hoej; aar++) punkter.push(r1(x(aar)) + "," + r1(y(M.sektorSum(aar, id))));
            if (punkter.length > 1) lav_el("polyline", { points: punkter.join(" "), "class": "k-linje " + id });
        }

        /* det aar, skyderen staar paa */
        lav_el("line", { x1: r1(x(nu)), x2: r1(x(nu)), y1: OVER, y2: r1(y(0)), "class": "k-nu" });
        for (i = 0; i < D.SEKTORER.length; i++) {
            lav_el("circle", { cx: r1(x(nu)), cy: r1(y(M.sektorSum(nu, D.SEKTORER[i].id))), r: 4, "class": "k-prik " + D.SEKTORER[i].id });
        }

        for (i = 0; i < D.SEKTORER.length; i++) {
            NK.saetTekst("kf-" + D.SEKTORER[i].id, String(M.sektorSum(nu, D.SEKTORER[i].id)));
        }
    }

    function vis(aar) {
        nu = M.klampAar(aar);
        if (nu < lav) lav = nu;
        if (nu > hoej) hoej = nu;
        tegn();
    }

    function nulstil(aar) {
        nu = lav = hoej = M.klampAar(aar === undefined ? D.FOERSTE : aar);
        tegn();
    }

    /* Kortet er kun fremme, naar eleven har slaaet kurven til (js/forloeb.js).
       Bredden maales, hver gang panelet kommer frem eller vinduet aendres. */
    function tilpas() {
        var kort = NK.el("kurvekort");
        if (!kort || !kort.clientWidth) return;
        var stil = window.getComputedStyle(kort);
        var b = Math.floor(kort.clientWidth - parseFloat(stil.paddingLeft) - parseFloat(stil.paddingRight));
        if (b > 120) bredde = b;
        tegn();
    }

    function byg() {
        svg = NK.el("kurve");
        NK.saetTekst("kurve-note", D.TEKST.kurveNote);
    }

    NK.Kurve = {
        byg: byg,
        vis: vis,
        nulstil: nulstil,
        tilpas: tilpas,
        omraade: function () { return { lav: lav, hoej: hoej, nu: nu }; }
    };
}());
