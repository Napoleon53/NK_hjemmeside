/* =====================================================================
   maaler.js - de tre maalere

   Hver maaler er et spor fra godt (venstre) til skidt (hoejre) med seks
   trin. Prikken viser, hvor maaleren staar nu. Den stiplede ring viser,
   hvor den stod foer, og en hvid streg forbinder de to.

   NK.Maalere.vis(nu, foer, opt)
       nu, foer   stillinger { a, p, b } med trin 0-5; foer kan vaere null
       opt.siden  aarstal: maerket skriver "siden 1956: falder", og en
                  maaler, der ikke har flyttet sig, faar intet maerke
       uden siden skriver maerket retningen, og "uaendret" naar den staar
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    var dele = {};          /* id -> { rod, nu, foer, streg, tag, niveau } */
    var vist = { nu: null, foer: null };

    /* Trin 0-5 som procent af sporets bredde */
    function procent(trin) {
        return 6 + trin * 17.6;
    }

    function byg(beholder) {
        beholder.innerHTML = "";
        D.MAALERE.forEach(function (m) {
            var rod = document.createElement("button");
            rod.type = "button";
            rod.className = "maaler";
            rod.setAttribute("data-maaler", m.id);

            var streger = "";
            for (var t = 0; t <= 5; t++) {
                streger += '<i class="m-trin" style="left:' + procent(t) + '%"></i>';
            }

            rod.innerHTML =
                '<span class="m-top">' +
                    '<span class="m-navn">' + NK.html(m.navn) + '</span>' +
                    '<span class="m-niveau"></span>' +
                    '<span class="m-tag"></span>' +
                '</span>' +
                '<span class="m-linje">' +
                    '<span class="m-ende">' + NK.html(m.god) + '</span>' +
                    '<span class="m-spor">' + streger +
                        '<i class="m-streg"></i>' +
                        '<i class="m-foer"></i>' +
                        '<i class="m-nu"></i>' +
                    '</span>' +
                    '<span class="m-ende h">' + NK.html(m.skidt) + '</span>' +
                '</span>';

            beholder.appendChild(rod);
            dele[m.id] = {
                rod: rod,
                nu: rod.querySelector(".m-nu"),
                foer: rod.querySelector(".m-foer"),
                streg: rod.querySelector(".m-streg"),
                tag: rod.querySelector(".m-tag"),
                niveau: rod.querySelector(".m-niveau")
            };
        });
    }

    function vis(nu, foer, opt) {
        opt = opt || {};
        vist = { nu: nu, foer: foer || null };

        D.MAALERE.forEach(function (m) {
            var d = dele[m.id];
            var n = nu[m.id];
            var f = foer ? foer[m.id] : null;
            var flyttet = f !== null && f !== n;

            d.nu.style.left = procent(n) + "%";
            d.niveau.textContent = m.niveau[n];
            d.rod.setAttribute("data-trin", String(n));
            d.rod.setAttribute("aria-label", m.navn + ": " + m.niveau[n]);

            /* Ringen og stregen ses kun, naar maaleren har flyttet sig */
            d.foer.classList.toggle("vis", flyttet);
            d.streg.classList.toggle("vis", flyttet);
            if (f !== null) d.foer.style.left = procent(f) + "%";
            if (flyttet) {
                d.streg.style.left = procent(Math.min(f, n)) + "%";
                d.streg.style.width = (Math.abs(n - f) * 17.6) + "%";
            }

            var tekst = "", klasse = "";
            if (flyttet) {
                tekst = n > f ? m.op : m.ned;
                klasse = n > f ? "vaerre" : "bedre";
                if (opt.siden) tekst = "siden " + opt.siden + ": " + tekst;
            } else if (f !== null && !opt.siden) {
                tekst = "uændret";
                klasse = "ens";
            }
            d.tag.textContent = tekst;
            d.tag.className = "m-tag" + (klasse ? " " + klasse : "");
            d.rod.setAttribute("data-retning", klasse);
        });
    }

    NK.Maalere = {
        byg: byg,
        vis: vis,
        procent: procent,
        vist: function () { return vist; }
    };
}());
