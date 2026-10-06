/* =====================================================================
   formel.js - en formel med plads til oxidationstal over atomerne

   Bruges baade paa skiltet i udstillingen (fane 1) og i haeftet (fane 2
   og 3). Et maerket atom faar en plads over sig: et felt, eleven
   skriver i, eller et tal med blyant.

   NK.Formel.byg(boks, st, maerker, valg)
     st        stoffet fra NK.Redox.stof
     maerker   { atomets nummer i st.atomer: "felt" eller "givet" }
     valg      noegle(nr, atom)  noeglen til pladsen
               felt(noegle, atom) laver feltet (et element)
               spredt            true paa skiltet: atomerne faar luft, saa
                                 felterne ikke stoeder sammen
   Giver { noegle: { over, sym, tal, atom, idx, a, slags } }. idx er det
   lille tal efter atomet (S₂), hvis der er et.

   I haeftet staar formlen taet, som den skrives. Er der to maerkede
   atomer i samme formel, stikker det foerste tal ud til venstre og det
   sidste til hoejre, saa de ikke daekker hinanden.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    function lav(tag, klasse, tekst) {
        var e = document.createElement(tag);
        if (klasse) e.className = klasse;
        if (tekst !== undefined) e.textContent = tekst;
        return e;
    }

    function byg(boks, st, maerker, valg) {
        boks.innerHTML = "";
        var pladser = {}, rest = "", nr = -1, maerkede = [];
        st.atomer.forEach(function (a, i) { if (maerker[i]) maerkede.push(i); });

        function toem() {
            if (!rest) return;
            boks.appendChild(lav("span", "hf-rest", rest));
            rest = "";
        }

        st.dele.forEach(function (d) {
            if (d.t === "aaben") { rest += "("; return; }
            if (d.t === "luk") { rest += ")" + (d.n > 1 ? NK.saenket(d.n) : ""); return; }
            if (d.t === "prik") { rest += "·"; return; }
            nr++;
            var idx = d.n > 1 ? NK.saenket(d.n) : "";
            var slags = maerker[nr];
            if (!slags) { rest += d.s + idx; return; }
            toem();
            var atom = lav("span", "hf-atom " + (slags === "felt" ? "spoerg" : "givet"));
            var over = lav("span", "hf-over");
            var plads = maerkede.indexOf(nr);
            if (!valg.spredt && maerkede.length > 1) {
                if (plads === 0) over.classList.add("tv");
                else if (plads === maerkede.length - 1) over.classList.add("th");
            }
            var noegle = valg.noegle(nr, d);
            if (slags === "felt") over.appendChild(valg.felt(noegle, d));
            var tal = lav("span", "hf-oxtal");
            over.appendChild(tal);
            atom.appendChild(over);
            var sym = lav("span", "hf-sym", d.s);
            /* Det lille tal efter atomet har sit eget element, saa haeftet
               kan pege paa det, naar atomerne skal taelles */
            var lille = idx ? lav("span", "hf-idx", idx) : null;
            if (valg.spredt) {
                var rk = lav("span", "hf-symrk");
                rk.appendChild(sym);
                if (lille) rk.appendChild(lille);
                atom.appendChild(rk);
                boks.appendChild(atom);
            } else {
                atom.appendChild(sym);
                boks.appendChild(atom);
                if (lille) boks.appendChild(lille);
            }
            pladser[noegle] = { over: over, sym: sym, tal: tal, atom: atom, idx: lille, a: d, slags: slags };
        });
        rest += NK.ladningHaevet(st.q);
        toem();
        return pladser;
    }

    NK.Formel = { byg: byg, lav: lav };
}());
