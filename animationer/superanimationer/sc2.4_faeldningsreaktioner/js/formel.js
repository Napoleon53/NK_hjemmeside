/* =====================================================================
   formel.js - elevens egne formler paa niveau 3

   Tre ting:
   1. formater(): goer det, eleven taster, til kemisk skrift, mens der
      tastes. Tal efter et symbol bliver saenket (Ag3PO4 -> Ag₃PO₄), og
      + og - til sidst bliver til en haevet ladning (PO43- -> PO₄³⁻).
      Hvert tegn bliver til praecis ét tegn, saa markoeren bliver staaende.
   2. laes(): deler det skrevne op i tal foran, formel, ladning og
      tilstandsform.
   3. vurderIon(), vurderSalt() og vurderSkema(): sammenligner med det
      rigtige svar og finder den typiske fejl, hvis det er forkert.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var F = {};
    NK.Formel = F;

    var SYMBOLER = ("H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se "
        + "Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er "
        + "Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No "
        + "Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og").split(" ");
    var ER_SYMBOL = {};
    SYMBOLER.forEach(function (s) { ER_SYMBOL[s] = true; });
    F.erSymbol = function (s) { return !!ER_SYMBOL[s]; };

    var SUB = "₀₁₂₃₄₅₆₇₈₉", SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
    function erSub(c) { return SUB.indexOf(c) >= 0; }
    function erSup(c) { return SUP.indexOf(c) >= 0; }
    function erBogstav(c) { return /[A-Za-z]/.test(c); }
    function tilSub(c) { var i = "0123456789".indexOf(c); if (i < 0) i = SUP.indexOf(c); return i >= 0 ? SUB.charAt(i) : c; }
    function tilSup(c) { var i = "0123456789".indexOf(c); if (i < 0) i = SUB.indexOf(c); return i >= 0 ? SUP.charAt(i) : c; }
    function cifferVaerdi(c) {
        var i = "0123456789".indexOf(c);
        if (i < 0) i = SUB.indexOf(c);
        if (i < 0) i = SUP.indexOf(c);
        return i;
    }

    /* Ioner, animationen kender: "no3|-1". Bruges til at gaette, om
       tallet foer et fortegn er et saenket tal (NO3- er NO₃⁻) eller
       ladningen (Fe3+ er Fe³⁺). Opslaget er ligeglad med store og smaa
       bogstaver, saa no3- ogsaa bliver til NO₃⁻, som i kemiautocorrect. */
    var KENDTE = {}, FORMLER = {};
    function laegKendt(formel, q) {
        KENDTE[formel.toLowerCase() + "|" + q] = true;
        FORMLER[formel.toLowerCase()] = formel;
    }
    D.IONER.forEach(function (i) { laegKendt(D.ascii(i.formel), i.q); });
    ["O|-2", "S|-2", "N|-3", "P|-3", "F|-1", "H|1", "Li|1", "Zn|2", "Sr|2", "Mn|2", "Ni|2", "Co|2", "Sn|2",
     "Hg|2", "Cr|3", "Cu|1", "Pb|4", "NO2|-1", "SO3|-2", "HCO3|-1", "HSO4|-1", "ClO3|-1", "MnO4|-1",
     "CrO4|-2", "Cr2O7|-2", "H3O|1", "HPO4|-2", "H2PO4|-1", "C2O4|-2"].forEach(function (k) {
        var d = k.split("|");
        if (!FORMLER[d[0].toLowerCase()]) laegKendt(d[0], parseInt(d[1], 10));
        else KENDTE[d[0].toLowerCase() + "|" + d[1]] = true;
    });
    F.kendtIon = function (asciiFormel, q) { return !!KENDTE[String(asciiFormel).toLowerCase() + "|" + q]; };

    /* Er tallet d efter krop en del af formlen (NO₃⁻) eller ladningen
       (Fe³⁺)? Afgoeres af, hvilken ion der findes. Findes ingen af dem,
       men formlen med tallet er en kendt ion, er det formlen, eleven
       er ved at skrive (PO4- bliver PO₄⁻ med forkert ladning, ikke PO⁴⁻). */
    function erLadningstal(krop, d, fortegn) {
        var somSaenket = F.kendtIon(krop + d, fortegn), somLadning = F.kendtIon(krop, fortegn * d);
        if (somLadning && !somSaenket) return true;
        if (somSaenket) return false;
        return !FORMLER[(krop + d).toLowerCase()];
    }

    /* Store og smaa bogstaver: passer det skrevne paa kendte ioner, naar
       man ser bort fra store og smaa bogstaver, skrives det rigtigt
       (no3 -> NO3, ag3po4 -> Ag3PO4). Staar en sammensat ion med et tal
       efter sammen med en anden ion, saettes parentesen ind, som i
       kemiautocorrect: ca3po42 -> Ca3(PO4)2, feoh3 -> Fe(OH)3. En ion
       alene faar ingen parentes, for i so42- er 2-tallet ladningen.
       Laengste ion foerst, saa no3 bliver NO3 og ikke N + O3.
       genkend giver en liste af led { f, n, parentes } eller null. */
    var NOEGLER = Object.keys(FORMLER).sort(function (a, b) { return b.length - a.length; });
    function tal(s, i) {
        var e = i;
        while (e < s.length && /[0-9]/.test(s.charAt(e))) e++;
        return e;
    }
    function genkend(s, i) {
        if (i === s.length) return [];
        if (s.charAt(i) === "(") {
            var dybde = 0, j = i;
            for (; j < s.length; j++) {
                if (s.charAt(j) === "(") dybde++;
                else if (s.charAt(j) === ")" && --dybde === 0) break;
            }
            if (j >= s.length) return null;
            var indre = genkend(s.slice(i + 1, j), 0);
            if (!indre || indre.length !== 1 || indre[0].n || indre[0].parentes) return null;
            var k = tal(s, j + 1);
            var resten = genkend(s, k);
            return resten === null ? null : [{ f: indre[0].f, n: s.slice(j + 1, k), parentes: true }].concat(resten);
        }
        for (var m = 0; m < NOEGLER.length; m++) {
            var f = NOEGLER[m];
            if (s.substr(i, f.length) !== f) continue;
            var e = tal(s, i + f.length);
            var rest = genkend(s, e);
            if (rest !== null) return [{ f: FORMLER[f], n: s.slice(i + f.length, e), parentes: false }].concat(rest);
        }
        return null;
    }

    function erSammensat(f) { return (f.match(/[A-Z]/g) || []).length > 1; }

    F.retBogstaver = function (tekst) {
        var t = String(tekst);
        var start = (t.match(/^\s*\d*\s*/) || [""])[0].length;
        var slut = t.length - (t.match(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+\s*$/) || [""])[0].length;
        if (slut <= start) return t;
        var krop = t.slice(start, slut);
        var ascii = krop.split("").map(function (c) { return erSub(c) || erSup(c) ? String(cifferVaerdi(c)) : c; }).join("");
        if (!/^[A-Za-z0-9()]+$/.test(ascii) || !/[a-z]/i.test(ascii)) return t;
        var led = genkend(ascii.toLowerCase(), 0);
        if (!led) return t;
        if (led.length > 1) {
            led.forEach(function (l) { if (!l.parentes && erSammensat(l.f) && parseInt(l.n, 10) > 1) l.parentes = true; });
        }
        var ny = led.map(function (l) { return (l.parentes ? "(" + l.f + ")" : l.f) + l.n; }).join("")
            .replace(/[0-9]/g, function (d) { return tilSub(d); });
        return ny === krop ? t : t.slice(0, start) + ny + t.slice(slut);
    };

    function asciiAf(tegn) {
        return tegn.map(function (c) { return erSub(c) || erSup(c) ? String(cifferVaerdi(c)) : c; }).join("")
            .replace(/^\s*\d+\s*/, "").replace(/\s+/g, "");
    }

    /* ----- 1. Formatering, mens der tastes --------------------------- */
    F.formater = function (s) {
        var ind = String(s).split(""), ud = [];
        for (var i = 0; i < ind.length; i++) {
            var c = ind[i], f = ud.length ? ud[ud.length - 1] : "";
            if (/[0-9]/.test(c)) {
                if (f && (erBogstav(f) || f === ")" || erSub(f))) ud.push(tilSub(c));
                else if (f && erSup(f)) ud.push(tilSup(c));
                else ud.push(c);
            } else if (/[+\-−–]/.test(c) && f && f !== " " && f !== "(") {
                var tegn = c === "+" ? "⁺" : "⁻";
                if (erSub(f) || /[0-9]/.test(f)) {
                    /* Er tallet lige foer en del af formlen eller ladningen? */
                    var krop = asciiAf(ud.slice(0, ud.length - 1)), d = cifferVaerdi(f);
                    if (d > 0 && erLadningstal(krop, d, tegn === "⁺" ? 1 : -1)) ud[ud.length - 1] = tilSup(f);
                }
                ud.push(tegn);
            } else if (erSup(c) && i + 1 < ind.length && /[A-Za-z(₀-₉]/.test(ind[i + 1])) {
                /* Et haevet tal midt i formlen er kommet dertil ved en
                   rettelse. Det bliver saenket igen. */
                ud.push(tilSub(c));
            } else if (c === "−" || c === "–") {
                ud.push("-");
            } else {
                ud.push(c);
            }
        }
        return F.retBogstaver(ud.join(""));
    };

    /* Saetter ladningen paa: fjerner en ladning, der staar i forvejen,
       og tager et saenket tal med, hvis det var ment som ladningen
       (Fe₃ + ³⁺ bliver til Fe³⁺, ikke Fe₃³⁺). */
    F.saetLadning = function (s, q) {
        var t = String(s).replace(/\s+$/, "").replace(/[⁰-⁹¹²³]*[⁺⁻+\-]+[⁰-⁹¹²³0-9]*$/, "");
        var tegn = t.split(""), sidste = tegn[tegn.length - 1], stoerrelse = Math.abs(q);
        if (sidste && erSub(sidste) && cifferVaerdi(sidste) === stoerrelse && stoerrelse > 1) {
            var krop = asciiAf(tegn.slice(0, tegn.length - 1));
            if (F.kendtIon(krop, q) && !F.kendtIon(krop + stoerrelse, q > 0 ? 1 : -1)) tegn.pop();
        }
        return F.retBogstaver(tegn.join("") + NK.ladningHaevet(q));
    };

    /* ----- 2. Laes det skrevne -------------------------------------- */
    F.laes = function (s) {
        var r = { tom: false, koef: null, krop: "", ladning: null, tilst: null, fejl: null, tekst: "", atomer: null };
        var t = String(s || "").replace(/[−–]/g, "-").trim();
        if (!t) { r.tom = true; return r; }

        var m = t.match(/\(\s*(aq|s|l|g)\s*\)\s*$/i);
        if (m) { r.tilst = m[1].toLowerCase(); t = t.slice(0, m.index).trim(); }

        m = t.match(/([⁰¹²³⁴⁵⁶⁷⁸⁹]*)([⁺⁻+\-]+)([⁰¹²³⁴⁵⁶⁷⁸⁹0-9]*)\s*$/);
        if (m && m.index > 0) {
            if (m[2].length > 1) { r.fejl = "fortegn"; r.tekst = "Skriv kun ét fortegn i ladningen."; }
            else if (m[3]) { r.fejl = "fortegn"; r.tekst = "Skriv tallet før fortegnet: 2+, ikke +2."; }
            var st = m[1] ? parseInt(m[1].split("").map(function (c) { return cifferVaerdi(c); }).join(""), 10) : 1;
            r.ettal = m[1] === "¹";
            r.ladning = (/[⁺+]/.test(m[2]) ? 1 : -1) * st;
            t = t.slice(0, m.index).trim();
        } else if (/[⁰¹²³⁴⁵⁶⁷⁸⁹]+\s*$/.test(t)) {
            r.fejl = "fortegn"; r.tekst = "Ladningen mangler et fortegn: + eller −.";
            t = t.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+\s*$/, "");
        }

        m = t.match(/^(\d+)\s*(?=[A-Za-z(])/);
        if (m) { r.koef = parseInt(m[1], 10); t = t.slice(m[0].length); }

        t = t.replace(/\s+/g, "").split("").map(function (c) { return erSub(c) || erSup(c) ? String(cifferVaerdi(c)) : c; }).join("");
        r.krop = t.replace(/[⁺⁻+\-]/g, "");
        if (r.fejl) return r;
        if (!t) { r.fejl = "tom"; r.tekst = "Der mangler en formel."; return r; }
        if (/[⁺⁻+\-]/.test(t)) { r.fejl = "ladningInde"; r.tekst = "Ladningen skrives til sidst, efter formlen."; return r; }
        if (!/^[A-Za-z0-9()]+$/.test(t)) {
            r.fejl = "tegn"; r.tekst = "Brug kun grundstofsymboler, tal og parenteser i formlen."; return r;
        }

        /* Grundstofsymbolerne og tallene. */
        var i = 0, stak = [{}];
        function laeg(obj, sym, n) { obj[sym] = (obj[sym] || 0) + n; }
        function tal() {
            var j = i;
            while (i < t.length && /[0-9]/.test(t.charAt(i))) i++;
            return j === i ? 1 : parseInt(t.slice(j, i), 10);
        }
        while (i < t.length) {
            var c = t.charAt(i);
            if (c === "(") { stak.push({}); i++; }
            else if (c === ")") {
                if (stak.length < 2) { r.fejl = "parentes"; r.tekst = "Tjek parenteserne."; return r; }
                i++;
                var n = tal(), indre = stak.pop();
                for (var k in indre) if (indre.hasOwnProperty(k)) laeg(stak[stak.length - 1], k, indre[k] * n);
            } else if (/[A-Z]/.test(c)) {
                var to = t.substr(i, 2), sym = null;
                if (to.length === 2 && /[a-z]/.test(to.charAt(1)) && ER_SYMBOL[to]) sym = to;
                else if (ER_SYMBOL[c]) sym = c;
                if (!sym) {
                    r.fejl = "symbol";
                    r.tekst = (/[a-z]/.test(to.charAt(1)) ? to : c) + " er ikke et grundstofsymbol.";
                    return r;
                }
                i += sym.length;
                laeg(stak[stak.length - 1], sym, tal());
            } else if (/[a-z]/.test(c)) {
                r.fejl = "stort";
                r.tekst = "Et grundstofsymbol begynder med stort bogstav, og et eventuelt andet bogstav er lille: Cl, ikke cl eller CL.";
                return r;
            } else {
                r.fejl = "tegn"; r.tekst = "Et tal skal stå efter et symbol eller en parentes."; return r;
            }
        }
        if (stak.length !== 1) { r.fejl = "parentes"; r.tekst = "Tjek parenteserne."; return r; }
        r.atomer = stak[0];
        return r;
    };

    /* ----- 3. Vurdering ----------------------------------------------- */
    function smukt(ascii) { return String(ascii).replace(/(\d+)/g, function (d) { return NK.saenket(d); }); }
    function ens(a, b) {
        var ka = Object.keys(a), kb = Object.keys(b);
        if (ka.length !== kb.length) return false;
        for (var i = 0; i < ka.length; i++) if (a[ka[i]] !== b[ka[i]]) return false;
        return true;
    }
    function delAf(a, b) {
        for (var k in a) if (a.hasOwnProperty(k) && !(b[k] >= a[k])) return false;
        return true;
    }
    function svar(ok, tekst, ekstra) {
        var r = { ok: ok, tekst: tekst || "" };
        if (ekstra) for (var k in ekstra) if (ekstra.hasOwnProperty(k)) r[k] = ekstra[k];
        return r;
    }

    /* Ser det ud som noget kendt, bare med forkerte store og smaa
       bogstaver? Giver den rigtige skrivemaade eller null. */
    function forkertStort(tekst, kandidater) {
        var r = F.laes(tekst), lav = String(r.krop).toLowerCase();
        for (var i = 0; i < kandidater.length; i++) {
            var a = D.ascii(kandidater[i]);
            if (a.toLowerCase() === lav && a !== r.krop) return kandidater[i];
        }
        return null;
    }

    /* Én ion. ktx:
         salt      opløsningen, feltet hoerer til (trin 1), eller null
         forventet de ioner, der maa skrives her
         brugt     ioner, der allerede er skrevet i et naboflet
         andre     ioner, der er med i opgaven, men ikke her
         tilskuere tilskuerionerne (i ionskemaet)
         o         opgaven
         skema     true i ionskemaet (trin 4)
       Svaret: { ok, tekst, ion } */
    F.vurderIon = function (tekst, ktx) {
        var r = F.laes(tekst);
        if (r.tom) return svar(false, "Feltet er tomt.");
        var o = ktx.o, alle = o.ioner;
        var rigtigSkrevet = forkertStort(tekst, alle.map(function (i) { return i.formel; })
            .concat([o.A.formel, o.B.formel]).concat(o.P ? [o.P.formel] : []));
        if (rigtigSkrevet) return svar(false, "Store og små bogstaver: skriv " + rigtigSkrevet + ".");
        if (r.fejl) return svar(false, r.tekst);

        var i, ion, S;
        for (i = 0; i < ktx.forventet.length; i++) {
            ion = ktx.forventet[i];
            if (r.krop !== D.ascii(ion.formel)) continue;
            S = ktx.salt || D.saltMed(o, ion);
            if (r.ladning === null) return svar(false, "En ion har en ladning. Skriv ladningen efter " + ion.formel + ".");
            if ((r.ladning > 0) !== (ion.q > 0)) {
                return svar(false, "Fortegnet er forkert. " + (ion.q > 0
                    ? (ion.id === "NH4" ? "Ammonium" : "Metalionen") + " er positiv."
                    : "Den negative ion står sidst i formlen for saltet."));
            }
            if (r.ladning !== ion.q) {
                /* Cl³⁻ ud fra FeCl₃: det lille tal er blevet til ladningen. */
                var tal = S ? (ion === S.kat ? S.p : S.n) : 1;
                if (tal > 1 && Math.abs(r.ladning) === tal) {
                    return svar(false, "Det lille " + tal + "-tal i " + S.formel + " fortæller, hvor mange " + ion.formel
                        + " der er. Det er ikke ionens ladning.");
                }
                return svar(false, D.ladningsForklaring(ion, S));
            }
            if (r.ettal) return svar(false, "Ladningen 1 skrives uden tal: " + D.ionTekst(ion) + ".");
            if (ktx.brugt && ktx.brugt.indexOf(ion) >= 0) {
                return svar(false, ktx.skema ? "Du har skrevet den samme ion to gange." : "Den ion har du allerede skrevet. Skriv den anden.");
            }
            if (r.koef !== null && !ktx.skema) {
                var antal = ion === S.kat ? S.p : S.n;
                if (r.koef !== antal) {
                    return svar(false, "Tallet foran passer ikke. Skriv bare ionen uden tal foran.");
                }
            }
            return svar(true, "", { ion: ion });
        }

        /* Den rigtige formel er der ikke. Hvad er der saa skrevet? */
        if (r.krop === "NH3") return svar(false, "NH₃ er ammoniak, et molekyle. Ionen hedder ammonium og har et H mere.");
        if (ktx.tilskuere) {
            for (i = 0; i < ktx.tilskuere.length; i++) {
                if (r.krop === D.ascii(ktx.tilskuere[i].formel)) {
                    return svar(false, D.ionTekst(ktx.tilskuere[i]) + " er en tilskuerion. Den bliver i opløsning og skrives ikke i ionskemaet.");
                }
            }
        }
        if (ktx.andre) {
            for (i = 0; i < ktx.andre.length; i++) {
                if (r.krop === D.ascii(ktx.andre[i].formel)) {
                    var andet = D.saltMed(o, ktx.andre[i]);
                    return svar(false, ktx.andre[i].formel + " er med i den anden opløsning, " + andet.formel + ".");
                }
            }
        }
        if (r.krop === o.A.ascii || r.krop === o.B.ascii) {
            return svar(false, ktx.skema ? "Skriv ionerne hver for sig. Ionskemaet har kun de ioner, der danner bundfaldet."
                : "Det er hele saltet. Del det op i den positive og den negative ion.");
        }
        if (o.P && r.krop === o.P.ascii) return svar(false, "Det er bundfaldet. Det skal stå efter pilen.");
        for (i = 0; i < ktx.forventet.length; i++) {
            ion = ktx.forventet[i];
            S = ktx.salt || D.saltMed(o, ion);
            var n = ion === S.kat ? S.p : S.n;
            if (n > 1 && r.krop === D.ascii(D.formeldel(ion, n))) {
                return svar(false, "Det lille " + n + "-tal i " + S.formel + " fortæller, hvor mange der er af ionen. Det er ikke en del af ionen.");
            }
        }
        if (r.atomer) {
            for (i = 0; i < ktx.forventet.length; i++) {
                ion = ktx.forventet[i];
                if (!ion.sammensat) continue;
                var hel = {};
                D.sammensaetning(ion).forEach(function (a) { hel[a[0]] = a[1]; });
                if (delAf(r.atomer, hel) && !ens(r.atomer, hel)) {
                    return svar(false, ion.formel + " er én samlet ion. Den går ikke i stykker, når saltet opløses.");
                }
            }
            for (i = 0; i < D.IONER.length; i++) {
                if (r.krop === D.ascii(D.IONER[i].formel)) {
                    return svar(false, "Der er ingen " + D.IONER[i].formel + " i " + (ktx.salt ? ktx.salt.formel : "bundfaldet") + ".");
                }
            }
        }
        return svar(false, smukt(r.krop) + " er ikke en af ionerne i " + (ktx.salt ? ktx.salt.formel : "bundfaldet") + ".");
    };

    /* Formlen for bundfaldet. ktx: { o, skema } */
    F.vurderSalt = function (tekst, P, ktx) {
        var r = F.laes(tekst), o = ktx.o;
        if (r.tom) return svar(false, "Feltet er tomt.");
        var katalog = D.formelKatalog(P);
        var rigtigSkrevet = forkertStort(tekst, [P.formel].concat(o.bliver.map(function (s) { return s.formel; })));
        if (rigtigSkrevet) return svar(false, "Store og små bogstaver: skriv " + rigtigSkrevet + ".");
        if (r.fejl === "ladningInde" || (r.fejl === "fortegn" && r.ladning !== null)) {
            return svar(false, "Et salt er neutralt, så ladningerne skrives ikke i formlen.");
        }
        if (r.fejl) return svar(false, r.tekst);
        if (r.ladning !== null) return svar(false, "Et salt er neutralt, så ladningerne skrives ikke i formlen.");
        if (r.koef !== null && !ktx.skema) return svar(false, "Skriv kun formlen, uden tal foran.");
        if (r.krop === P.ascii) return svar(true, "");
        if (katalog[r.krop]) return svar(false, katalog[r.krop]);

        var i;
        for (i = 0; i < o.bliver.length; i++) {
            if (ens(r.atomer, D.atomtal(o.bliver[i].kat, o.bliver[i].p, o.bliver[i].an, o.bliver[i].n))
                || r.krop === o.bliver[i].ascii) {
                return svar(false, o.bliver[i].formel + " er letopløseligt. Det bliver i opløsning.");
            }
        }
        var egne = D.atomtal(P.kat, 1, P.an, 1);
        for (var sym in r.atomer) {
            if (!r.atomer.hasOwnProperty(sym) || egne[sym]) continue;
            for (i = 0; i < o.tilskuere.length; i++) {
                if (D.sammensaetning(o.tilskuere[i]).some(function (a) { return a[0] === sym; })) {
                    return svar(false, "Der er ingen " + sym + " i bundfaldet. " + D.ionTekst(o.tilskuere[i]) + " er en tilskuerion.");
                }
            }
            return svar(false, "Der er ingen " + sym + " i bundfaldet.");
        }
        for (sym in egne) {
            if (egne.hasOwnProperty(sym) && !r.atomer[sym]) {
                return svar(false, "Bundfaldet består af både " + D.ionTekst(P.kat) + " og " + D.ionTekst(P.an) + ".");
            }
        }
        return svar(false, "Formlen skal have " + D.ionTekst(P.kat) + " og " + D.ionTekst(P.an)
            + " i det forhold, hvor ladningerne går op.");
    };

    /* Tallene foran og tilstandsformerne i ionskemaet. Faelles for
       niveau 2 og 3. kKat, kAn, kP er tallene foran kationen, anionen og
       bundfaldet; tilst er de tre tilstandsformer i raekkefoelgen
       [kation, anion, bundfald]. Svaret: { ok, tekst, koef: bool, tilst: [i] } */
    F.vurderAfstemning = function (P, kKat, kAn, kP, tilst) {
        var t = [kKat, kAn, kP];
        for (var i = 0; i < 3; i++) {
            if (!(t[i] >= 1) || Math.floor(t[i]) !== t[i]) return svar(false, "Tallet foran skal være et helt tal fra 1 og op.", { koef: true });
        }
        var katT = D.ionTekst(P.kat), anT = D.ionTekst(P.an);
        if (kKat !== kP * P.p || kAn !== kP * P.n) {
            return svar(false, (kP > 1 ? kP + " " : "") + P.formel + " indeholder " + (kP * P.p) + " " + katT + " og "
                + (kP * P.n) + " " + anT + ". Til venstre står der " + kKat + " " + katT + " og " + kAn + " " + anT + ".", { koef: true });
        }
        if (kP > 1) return svar(false, "Skemaet passer, men tallene kan forkortes. Brug de mindste hele tal.", { koef: true });
        var mangler = [], forkert = [];
        for (i = 0; i < 3; i++) {
            if (!tilst[i]) mangler.push(i);
            else if (tilst[i] !== (i < 2 ? "aq" : "s")) forkert.push(i);
        }
        if (mangler.length) return svar(false, "Vælg tilstandsform til alle tre led.", { tilst: mangler });
        if (forkert.length) {
            return svar(false, forkert.indexOf(2) >= 0 && forkert.length === 1
                ? "Bundfaldet er et fast stof."
                : (forkert.indexOf(2) < 0 ? "Ionerne er opløst i vand." : "Ionerne er opløst i vand, og bundfaldet er et fast stof."),
                { tilst: forkert });
        }
        return svar(true, "");
    };

    /* Hele ionskemaet paa niveau 3. led: tre { koef, tekst, tilst }
       (to ioner og bundfaldet). Svaret: { ok, tekst, felt } hvor felt
       er det foerste forkerte felt: "f0", "k1", "t2" osv. */
    F.vurderSkema = function (led, o) {
        var P = o.P, i;
        var ktx = { o: o, forventet: [P.kat, P.an], tilskuere: o.tilskuere, skema: true, brugt: [] };
        var ioner = [];
        for (i = 0; i < 2; i++) {
            var v = F.vurderIon(led[i].tekst, ktx);
            if (!v.ok) return svar(false, v.tekst, { felt: "f" + i });
            ioner.push(v.ion);
            ktx.brugt.push(v.ion);
        }
        var vs = F.vurderSalt(led[2].tekst, P, { o: o, skema: true });
        if (!vs.ok) return svar(false, vs.tekst, { felt: "f2" });

        var k = led.map(function (l) {
            var s = String(l.koef === undefined || l.koef === null ? "" : l.koef).trim();
            return s === "" ? 1 : (/^\d+$/.test(s) ? parseInt(s, 10) : NaN);
        });
        var iKat = ioner[0] === P.kat ? 0 : 1, iAn = 1 - iKat;
        var a = F.vurderAfstemning(P, k[iKat], k[iAn], k[2], [led[iKat].tilst, led[iAn].tilst, led[2].tilst]);
        if (a.ok) return svar(true, "");
        var felt;
        if (a.koef) {
            for (i = 0; i < 3 && !felt; i++) if (!(k[i] >= 1)) felt = "k" + i;
            if (!felt) felt = k[iKat] !== k[2] * P.p ? "k" + iKat : (k[iAn] !== k[2] * P.n ? "k" + iAn : "k2");
        } else {
            felt = "t" + [iKat, iAn, 2][a.tilst[0]];
        }
        return svar(false, a.tekst, { felt: felt });
    };
}());
