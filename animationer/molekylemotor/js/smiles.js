/* =====================================================================
   smiles.js - et molekyle ud fra en lille SMILES-streng

   NK.Smiles.laes("CC(=O)O") giver et NK.Molekyle uden koordinater
   (alle atomer i (0, 0)); layout.js laegger det ud bagefter.

   Det, der kan laeses: C, N, O, S, F, Cl, Br og I, grene i parentes,
   bindingerne - = og #, ladninger i klammer ([O-], [NH4+]),
   ringslutning med cifre (og %12), smaa bogstaver (c, n, o) for en
   aromatisk ring. Den aromatiske ring faar skiftevis
   dobbelt- og enkeltbindinger, som bogen tegner benzen. / og \ (cis og
   trans) springes over; stereo gives i stedet til layout.js.
   Bruges af trivialnavnene (trivialnavne.js) og af selvtestene.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var ORGANISK = { C: 1, N: 1, O: 1, S: 1, F: 1, Cl: 1, Br: 1, I: 1, c: 1, n: 1, o: 1, s: 1 };

    function laes(s) {
        var m = new NK.Molekyle(), i = 0, forrige = null, orden = null, stak = [], ringe = {}, aromat = {};
        var fejl = null;
        function tilfoej(el, arom) {
            var a = m.tilfoej(el, 0, 0);
            if (arom) aromat[a.id] = true;
            if (forrige !== null) m.bind(forrige, a.id, orden || 1);
            orden = null;
            forrige = a.id;
        }
        while (i < s.length && !fejl) {
            var c = s[i];
            if (c === "(") { stak.push(forrige); i++; continue; }
            if (c === ")") { forrige = stak.pop(); i++; continue; }
            if (c === "=") { orden = 2; i++; continue; }
            if (c === "#") { orden = 3; i++; continue; }
            if (c === "-" || c === "/" || c === "\\") { if (c === "-") orden = 1; i++; continue; }
            if (/\d/.test(c) || c === "%") {
                var nr = c;
                if (c === "%") { nr = s.substr(i + 1, 2); i += 2; }
                if (ringe[nr]) {
                    m.bind(ringe[nr].id, forrige, orden || ringe[nr].orden || 1);
                    delete ringe[nr];
                } else ringe[nr] = { id: forrige, orden: orden };
                orden = null;
                i++;
                continue;
            }
            if (c === "[") {
                /* [nH], [O-], [NH4+] og lignende: grundstoffet og ladningen
                   bruges; hydrogen regnes ud af valensen */
                var slut = s.indexOf("]", i);
                var inde = s.slice(i + 1, slut);
                var mm = /^(Cl|Br|[A-Z]|[cnos])/.exec(inde);
                if (!mm || slut < 0) { fejl = "Ukendt atom i SMILES: " + s.slice(i, slut + 1); break; }
                tilfoej(mm[1].length === 1 ? mm[1].toUpperCase() : mm[1], /^[cnos]$/.test(mm[1]));
                var lad = /([+-])(\d?)$/.exec(inde);
                if (lad) m.atom(forrige).q = (lad[1] === "+" ? 1 : -1) * (+lad[2] || 1);
                i = slut + 1;
                continue;
            }
            var to = s.substr(i, 2);
            if (to === "Cl" || to === "Br") { tilfoej(to, false); i += 2; continue; }
            if (ORGANISK[c]) { tilfoej(c === c.toLowerCase() ? c.toUpperCase() : c, c === c.toLowerCase()); i++; continue; }
            fejl = "Ukendt tegn i SMILES: " + c;
        }
        if (fejl) throw new Error(fejl);
        kekule(m, aromat);
        return m;
    }

    /* De aromatiske atomer faar skiftevis dobbelt- og enkeltbindinger:
       hvert aromatisk atom skal have netop én dobbeltbinding til et andet
       aromatisk atom (en perfekt parring, fundet ved at proeve sig frem) */
    function kekule(m, aromat) {
        var ids = Object.keys(aromat).map(Number);
        if (!ids.length) return;
        var par = {};
        function naboer(id) {
            return m.naboer(id).filter(function (x) { return aromat[x]; });
        }
        function proev(k) {
            while (k < ids.length && par[ids[k]] !== undefined) k++;
            if (k >= ids.length) return true;
            var a = ids[k];
            var nb = naboer(a).filter(function (x) { return par[x] === undefined; });
            for (var j = 0; j < nb.length; j++) {
                par[a] = nb[j];
                par[nb[j]] = a;
                if (proev(k + 1)) return true;
                delete par[a];
                delete par[nb[j]];
            }
            /* Et atom uden partner (fx n i en femring) beholder enkeltbindinger */
            return m.atom(a).el !== "C" && proev(k + 1);
        }
        proev(0);
        Object.keys(par).forEach(function (k) {
            var a = +k, b = par[k];
            if (a < b) m.binding(a, b).orden = 2;
        });
    }

    NK.Smiles = { laes: laes };
}());
