/* =====================================================================
   esterkort.js - samlingen af de estere, eleven har lavet

   Syv alkoholer gange syv syrer giver 49 estere, og dertil kommer tre
   saerlige stoffer (acetylsalicylsyre, propanon og diethylether). Kortet
   viser kun det, eleven selv har lavet; resten staar som et spoergsmaalstegn,
   saa kortet ikke roeber, hvad en ordre skal laves af. Raekkerne og
   soejlerne viser til gengaeld systemet i navnene: alkoholen giver den
   foerste del, syren den sidste.

   Den lille udgave staar i panelet. Et klik aabner den store.
   Hvad der er lavet, ligger hos ejeren (ejer.kendt), saa det gemmes
   sammen med resten af fabrikken.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var BET = { hplus: true, varme: true };

    function Esterkort(ejer) {
        var E = D.ESTERKORT, mig = this;
        this.ejer = ejer;
        this.alk = E.alkoholer.map(K.stof);
        this.syrer = E.syrer.map(K.stof);
        /* celle[alkohol][syre] = esteren */
        this.celle = this.alk.map(function (a) {
            return mig.syrer.map(function (s) {
                var u = K.reaktion(s.id, a.id, BET);
                return u.produkt || null;
            });
        });
        this.saerlige = E.saerlige.map(K.stofEfterNavn);
        this.med = {};
        this.celle.forEach(function (r) { r.forEach(function (p) { if (p) mig.med[p.motornavn] = true; }); });
        this.saerlige.forEach(function (p) { if (p) mig.med[p.motornavn] = true; });
        this.ialt = Object.keys(this.med).length;
    }

    var P = Esterkort.prototype;

    P.kender = function (p) { return !!(p && this.ejer.kendt[p.motornavn]); };

    P.antal = function () {
        var mig = this;
        return Object.keys(this.med).filter(function (n) { return mig.ejer.kendt[n]; }).length;
    };

    /* Et stof er lavet. true, hvis det er nyt paa kortet */
    P.opdag = function (s) {
        if (!s || !this.med[s.motornavn] || this.ejer.kendt[s.motornavn]) return false;
        this.ejer.kendt[s.motornavn] = 1;
        this.ny = s.motornavn;
        this.vis();
        return true;
    };

    /* Navnet i alkoholens og syrens farve */
    function navnHTML(p, syre) {
        return K.navneDele(p, syre).map(function (d) {
            return '<span class="t-' + (d.k === "syre" ? "syre" : "alk") + '">' + NK.html(d.t) + "</span>";
        }).join("<wbr>");
    }

    P.vis = function () {
        var mig = this, html = "";
        /* Den lille: en prik pr. ester */
        this.celle.forEach(function (r) {
            r.forEach(function (p) {
                html += '<i class="' + (mig.kender(p) ? "kendt" : "") + (p && p.motornavn === mig.ny ? " ny" : "") + '"></i>';
            });
        });
        html += '<span class="ek-mini-saer">';
        this.saerlige.forEach(function (p) {
            html += '<i class="' + (mig.kender(p) ? "kendt" : "") + (p && p.motornavn === mig.ny ? " ny" : "") + '"></i>';
        });
        html += "</span>";
        NK.saetHTML("fb-kortmini", html);
        NK.saetTekst("fb-korttal", String(this.antal()));
        if (NK.el("esterkort").classList.contains("vis")) this.visStor();
    };

    P.visStor = function () {
        var mig = this;
        var h = '<tr><th class="ek-hjoerne"><span class="t-alk">alkohol</span> + <span class="t-syre">syre</span></th>';
        this.syrer.forEach(function (s) { h += '<th class="t-syre">' + NK.html(s.navn) + "</th>"; });
        h += "</tr>";
        this.alk.forEach(function (a, i) {
            h += '<tr><th class="t-alk">' + NK.html(a.navn) + "</th>";
            mig.syrer.forEach(function (s, j) {
                var p = mig.celle[i][j];
                if (mig.kender(p)) {
                    h += '<td class="kendt' + (p.motornavn === mig.ny ? " ny" : "") + '">' +
                        (p.ikon ? '<span class="ek-ikon">' + p.ikon + "</span>" : "") +
                        '<span class="ek-navn">' + navnHTML(p, s) + "</span>" +
                        (p.duft ? '<span class="ek-duft">' + NK.html(p.duft) + "</span>" : "") + "</td>";
                } else {
                    h += '<td class="ukendt">?</td>';
                }
            });
            h += "</tr>";
        });
        NK.saetHTML("ek-gitter", h);
        var sh = "";
        this.saerlige.forEach(function (p) {
            if (mig.kender(p)) {
                sh += '<span class="ek-saer kendt">' + (p.ikon ? p.ikon + " " : "") + "<b>" + NK.html(p.trivial || p.navn) + "</b>" +
                    (p.trivial ? " (" + NK.html(p.navn) + ")" : "") + "</span>";
            } else {
                sh += '<span class="ek-saer">? Et særligt stof</span>';
            }
        });
        NK.saetHTML("ek-saerlige", sh);
        NK.saetTekst("ek-tal", this.antal() + " af " + this.ialt);
    };

    P.aabn = function () {
        NK.el("esterkort").classList.add("vis");
        this.visStor();
    };

    NK.Esterkort = Esterkort;
}());
