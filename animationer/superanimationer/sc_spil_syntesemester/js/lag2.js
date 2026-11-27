/* =====================================================================
   lag2.js - Reaktionerne: ét spoergsmaal ad gangen om én reaktion

   Spoergsmaalene bygges af reglerne i reaktioner.js, saa produkterne
   altid er regnet af molekylet. Fire slags:
     produkt      udgangsstof + kort -> ?          (fire svar)
     type         hele skemaet, uden kort           (seks reaktionstyper)
     reagens      udgangsstof -> produkt, ? over pilen  (fire kort)
     udgangsstof  ? + kort -> produkt               (fire stoffer)
   De forkerte svar er de fejl, elever typisk laver (NK.Reaktion.forkerte),
   hver med sin egen forklaring.

   Tre maader at spille paa (Niels 27. nov. 2026):
     oev     standard (Start paa startkortet): ingen tid, tre liv,
             niveauer med fem spoergsmaal og Naeste. Ingen rekord.
     minut   kortet "1 minut paa tid" i panelet: 60 sekunder; point =
             rigtige minus forkerte, saa gaet ikke betaler sig. Det gaar
             videre af sig selv; et forkert svar lyser kort, og fejlen og
             forklaringen kommer i panelet ("saa bliver man opfordret til
             at tage alle dem man glippede i som follow up bagefter").
             Det er rekorden og top 10.
     igen    efter 1 minut: de spoergsmaal, eleven glippede, uden tid og
             med forklaring. Et forkert svar kommer igen til sidst.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var R = NK.Reaktion;
    var C = D.LAG2;
    var L = NK.Spillyd;
    var $ = NK.el;
    function App() { return NK.App; }

    var s = null;
    var glippede = [];        /* spoergsmaalene fra sidste minut, eleven svarede forkert paa */
    var raf = 0, sidst = 0;

    function niv(n) { return C.NIVEAUER[Math.min(n, C.NIVEAUER.length - 1)]; }
    function kortAf(id) { return D.KORT.filter(function (k) { return k.id === id; })[0]; }
    function stort(t) { return NK.stortForbogstav(t); }

    /* ----- Svarmulighederne --------------------------------------------------
       Et svar er { stof } eller { par: [a, b] } eller { ingen: true } eller
       { kort: id } eller { type: id }; noegle() goer dem sammenlignelige. */
    function noegle(sv) {
        if (sv.ingen) return "ingen";
        if (sv.par) return sv.par.map(function (p) { return p.navn; }).sort().join("+");
        if (sv.kort) return "kort:" + sv.kort;
        if (sv.type) return "type:" + sv.type;
        return sv.stof.navn;
    }

    function valgSvar(v) {
        return v.produkter.length > 1 ? { par: v.produkter } : { stof: v.produkter[0] };
    }

    function tilfaeldigStof(kort) {
        var liste = D.LAG2_STOFFER[kort];
        return K.stof(NK.tilfaeldig(liste));
    }

    function partnerTil(st) {
        if (st.klasse !== "syre") return null;
        return K.stof(NK.tilfaeldig(D.LAG2_PARTNERE));
    }

    /* Fylder op med andre stoffer, naar de typiske fejl ikke slaar til.
       Foerst naboerne paa syntesekortet: det, de andre kort giver med
       udgangsstoffet og med produktet (aldrig en alkohol ved stærk base,
       for vandig base kan ogsaa give alkoholen). Saa stoffer med samme
       antal C. */
    function naboer(st, produkter, kort) {
        var ud = [];
        [st].concat(produkter).forEach(function (x) {
            R.ENKELT.forEach(function (k) {
                var r = R.anvend(x, k);
                if (r.ingen) return;
                r.valg.forEach(function (v) { if (v.produkter.length === 1) ud.push(v.produkter[0]); });
            });
        });
        return ud.filter(function (x) { return !(kort === "base" && x.klasse === "alkohol"); });
    }

    function grundFor(x, r) {
        var art = x.klasse === "aldehyd" || x.klasse === "amid" ? "et " : "en ";
        return stort(x.navn) + " er " + art + K.klasseNavn(x.klasse) + ". " + (r.ingen ? r.grund : r.om);
    }

    function fyld(svar, rigtige, antal, grund, antalC, nab, r) {
        var brugt0 = {};
        svar.forEach(function (x) { brugt0[noegle(x)] = true; });
        NK.bland(nab || []).forEach(function (x) {
            if (svar.length >= antal || rigtige[x.navn] || brugt0[x.navn]) return;
            brugt0[x.navn] = true;
            svar.push({ stof: x, grund: grundFor(x, r) });
        });
        var kandidater = NK.bland(D.MOLEKYLER.filter(function (d) {
            var st = K.stof(d[1]);
            return st && Math.abs(st.antalC - antalC) <= 1 && !rigtige[st.navn] &&
                ["alkan", "alken", "halogen", "alkohol", "aldehyd", "keton", "syre", "ester"].indexOf(st.klasse) >= 0;
        }));
        var brugt = {};
        svar.forEach(function (x) { brugt[noegle(x)] = true; });
        for (var i = 0; i < kandidater.length && svar.length < antal; i++) {
            var st = K.stof(kandidater[i][1]);
            if (brugt[st.navn]) continue;
            brugt[st.navn] = true;
            svar.push({ stof: st, grund: grund });
        }
    }

    /* ----- Spoergsmaalene ------------------------------------------------------ */
    var BYG = {
        produkt: function (n) {
            var kort = NK.tilfaeldig(n.kort);
            var st = tilfaeldigStof(kort);
            var partner = kort === "kond" ? partnerTil(st) : null;
            var r = R.anvend(st, kort, partner);
            if (r.ingen && kort !== "mild" && kort !== "kraftig") return null;
            var rigtig = r.ingen ? { ingen: true } : valgSvar(NK.tilfaeldig(r.valg));
            var gyldige = {};
            if (!r.ingen) r.valg.forEach(function (v) { gyldige[noegle(valgSvar(v))] = true; v.produkter.forEach(function (p) { if (v.produkter.length === 1) gyldige[p.navn] = true; }); });
            else gyldige.ingen = true;
            var brugt = {};
            brugt[noegle(rigtig)] = true;
            var forkerte = [];
            NK.bland(R.forkerte(st, kort, partner)).forEach(function (f) {
                var sv = f.ingen ? { ingen: true } : (f.par ? { par: f.par } : { stof: f.stof });
                var k = noegle(sv);
                if (gyldige[k] || brugt[k]) return;
                if (sv.stof && sv.stof.navn === st.navn) return;
                if (rigtig.par && !sv.par && !sv.ingen) return;
                if (!rigtig.par && sv.par) return;
                if (sv.ingen && forkerte.some(function (x) { return x.ingen; })) return;
                brugt[k] = true;
                sv.grund = f.grund;
                forkerte.push(sv);
            });
            /* Hoejst ét "Ingen reaktion", og helst mindst to stoffer */
            forkerte = forkerte.slice(0, 3);
            if (forkerte.length < 3 && !rigtig.par) {
                gyldige[st.navn] = true;
                fyld(forkerte, gyldige, 3, r.ingen ? r.grund : "Det stof dannes ikke. " + r.om, st.antalC,
                    naboer(st, r.ingen ? [] : rigtig.par || [rigtig.stof], kort), r);
            }
            if (forkerte.length < 3) return null;
            var tekst = rigtig.par ? "Hvilke to stoffer dannes?" : (r.ingen || kort === "mild" || kort === "kraftig" ? "Hvad dannes der?" :
                (r.valg.length > 1 ? "Hvilket stof kan dannes?" : "Hvilket stof dannes?"));
            return {
                art: "produkt", tekst: tekst, kort: kort, stof: st, partner: partner, r: r,
                rigtig: rigtig, svar: NK.bland([rigtig].concat(forkerte)),
                om: r.ingen ? r.grund : r.om,
                forTegn: rigtig.ingen ? null : (rigtig.par ? rigtig.par : [rigtig.stof])
            };
        },

        type: function (n) {
            var kort = NK.tilfaeldig(n.kort);
            var st = tilfaeldigStof(kort);
            var partner = kort === "kond" ? partnerTil(st) : null;
            var r = R.anvend(st, kort, partner);
            if (r.ingen) return null;
            var v = NK.tilfaeldig(r.valg);
            return {
                art: "type", tekst: "Hvilken reaktionstype er det?", kort: kort, stof: st, partner: partner, r: r, v: v,
                rigtig: { type: r.type },
                svar: D.TYPE_ORDEN.map(function (t) { return { type: t, grund: "Ved en " + t + ": " + D.KENDETEGN[t].charAt(0).toLowerCase() + D.KENDETEGN[t].slice(1) }; }),
                om: D.KENDETEGN[r.type] + " " + r.om
            };
        },

        reagens: function (n) {
            var kort = NK.tilfaeldig(n.kort.filter(function (k) { return k !== "kond"; }));
            var st = tilfaeldigStof(kort);
            var r = R.anvend(st, kort);
            if (r.ingen) return null;
            var v = NK.tilfaeldig(r.valg);
            var maal = noegle(valgSvar(v));
            var gyldige = {};
            D.KORT.forEach(function (k) {
                if (k.id === "kond") return;
                var r2 = R.anvend(st, k.id);
                if (!r2.ingen && r2.valg.some(function (x) { return noegle(valgSvar(x)) === maal; })) gyldige[k.id] = true;
            });
            var andre = NK.bland(D.KORT.filter(function (k) { return k.id !== "kond" && !gyldige[k.id]; })).slice(0, 3);
            if (andre.length < 3) return null;
            var forkerte = andre.map(function (k) {
                var r3 = R.anvend(st, k.id);
                var grund = r3.ingen ? r3.grund : "Med " + R.kortTitel(k.id) + " dannes " +
                    r3.valg.map(function (x) { return x.produkter.map(function (p) { return p.navn; }).join(" og "); }).join(" eller ") + ".";
                return { kort: k.id, grund: grund };
            });
            var rigtig = { kort: kort };
            return {
                art: "reagens", tekst: "Hvad står over pilen?", kort: kort, stof: st, partner: null, r: r, v: v,
                rigtig: rigtig, svar: NK.bland([rigtig].concat(forkerte)), om: r.om
            };
        },

        udgangsstof: function (n) {
            var kort = NK.tilfaeldig(n.kort.filter(function (k) { return k !== "kond"; }));
            var st = tilfaeldigStof(kort);
            var r = R.anvend(st, kort);
            if (r.ingen) return null;
            var v = NK.tilfaeldig(r.valg);
            if (v.produkter.length > 1) return null;
            var P = v.produkter[0];
            var kandidater = NK.bland(D.MOLEKYLER.map(function (d) { return K.stof(d[1]); }).filter(function (x) {
                return x && x.navn !== st.navn && x.navn !== P.navn && Math.abs(x.antalC - st.antalC) <= 1 &&
                    ["alkan", "alken", "halogen", "alkohol", "aldehyd", "keton", "syre", "ester"].indexOf(x.klasse) >= 0;
            }));
            /* Helst samme antal C og en reaktion, der giver noget andet */
            kandidater.sort(function (a, b) {
                function vaerdi(x) {
                    var rx = R.anvend(x, kort);
                    return (x.antalC === st.antalC ? 0 : 2) + (rx.ingen ? 1 : 0) + Math.random() * 0.5;
                }
                return vaerdi(a) - vaerdi(b);
            });
            var forkerte = [];
            for (var i = 0; i < kandidater.length && forkerte.length < 3; i++) {
                var x = kandidater[i], rx = R.anvend(x, kort);
                if (R.produktNavne(rx).indexOf(P.navn) >= 0) continue;
                var grund = rx.ingen ? rx.grund :
                    "Med " + R.kortTitel(kort) + " giver " + x.navn + " " + R.produktNavne(rx).join(" eller ") + ".";
                forkerte.push({ stof: x, grund: grund });
            }
            if (forkerte.length < 3) return null;
            var rigtig = { stof: st };
            return {
                art: "udgangsstof", tekst: "Hvilket stof var udgangsstoffet?", kort: kort, stof: st, partner: null, r: r, v: v, P: P,
                rigtig: rigtig, svar: NK.bland([rigtig].concat(forkerte)), om: r.om
            };
        }
    };

    function lavSpm() {
        if (s.igen) {
            var q0 = s.koe.shift();
            q0.svar = NK.bland(q0.svar);
            return q0;
        }
        var n = s.minut ? C.MINUT : niv(s.nivNr);
        for (var forsoeg = 0; forsoeg < 40; forsoeg++) {
            var art = NK.tilfaeldig(n.spm);
            var q = BYG[art](n);
            if (q && q.stof.navn + q.art !== s.sidsteNoegle) { s.sidsteNoegle = q.stof.navn + q.art; return q; }
        }
        return BYG.produkt({ kort: ["h2"], spm: ["produkt"] });
    }

    /* ----- Tegningen af skemaet ------------------------------------------------ */
    function molBoks(st, vis, klasse) {
        return '<div class="sk-mol ' + (klasse || "") + '"><div class="sk-tegn" data-tegn="' + NK.html(st.navn) + '"></div>' +
            (vis ? '<span class="sk-navn">' + NK.html(K.navn(st)) + "</span>" : "") + "</div>";
    }

    function ukendt() { return '<div class="sk-mol ukendt"><span>?</span></div>'; }
    function plus() { return '<div class="sk-plus">+</div>'; }
    function lille(t) { return '<div class="sk-lille">' + t + "</div>"; }

    function pil(kort, skjul) {
        var k = kortAf(kort);
        if (skjul === "alt") return '<div class="sk-pil"><span class="sk-over"></span><i></i><span class="sk-under"></span></div>';
        if (skjul) return '<div class="sk-pil spm"><span class="sk-over">?</span><i></i><span class="sk-under"></span></div>';
        var over = kort === "kond" ? "H₂SO₄" : k.over, under = kort === "kond" ? "varme" : k.under;
        return '<div class="sk-pil"><span class="sk-over">' + over + '</span><i></i><span class="sk-under">' + under + "</span></div>";
    }

    /* Det lille molekyle, der fraspaltes eller adderes (kun ved typespoergsmaalet) */
    function smaa(q) {
        var t = q.r.type, k = q.kort;
        var foran = "", efter = "";
        if (t === "addition") foran = k === "vand" ? "H₂O" : (k === "hbr" ? "HBr" : "H₂");
        if (t === "substitution") { foran = "Br₂"; efter = "HBr"; }
        if (t === "elimination") efter = q.v.biprodukt || "H₂O";
        if (t === "kondensation") efter = "H₂O";
        if (t === "hydrolyse") foran = "H₂O";
        return { foran: foran, efter: efter };
    }

    function skemaHTML(q, besvaret) {
        var h = [];
        var venstre = [molBoks(q.stof, true)];
        if (q.partner) venstre.push(plus(), molBoks(q.partner, true));
        if (q.art === "udgangsstof") venstre = [besvaret ? molBoks(q.stof, true, "svar") : ukendt()];
        if (q.art === "type") {
            var sm = smaa(q);
            if (sm.foran) venstre.push(plus(), lille(sm.foran));
            h = h.concat(venstre);
            h.push(pil(q.kort, "alt"));
            q.v.produkter.forEach(function (p, i) { if (i) h.push(plus()); h.push(molBoks(p, true)); });
            if (sm.efter) h.push(plus(), lille(sm.efter));
            return h.join("");
        }
        h = h.concat(venstre);
        h.push(pil(q.kort, q.art === "reagens" && !besvaret));
        if (q.art === "produkt") {
            if (!besvaret) h.push(ukendt());
            else if (q.rigtig.ingen) h.push('<div class="sk-mol ingen svar"><span>Ingen reaktion</span></div>');
            else q.forTegn.forEach(function (p, i) { if (i) h.push(plus()); h.push(molBoks(p, true, "svar")); });
        } else if (q.art === "reagens") {
            q.v.produkter.forEach(function (p, i) { if (i) h.push(plus()); h.push(molBoks(p, true)); });
        } else if (q.art === "udgangsstof") {
            h.push(molBoks(q.P, true));
        }
        return h.join("");
    }

    function svarHTML(q, i) {
        var sv = q.svar[i], nr = '<span class="sv-nr">' + (i + 1) + "</span>";
        if (sv.type) {
            return '<button class="svar type" type="button" data-i="' + i + '" style="--typefarve:' + D.TYPER[sv.type].farve + '">' + nr +
                D.TYPER[sv.type].navn + "</button>";
        }
        if (sv.kort) {
            var k = kortAf(sv.kort);
            return '<button class="svar reagens" type="button" data-i="' + i + '">' + nr + '<span class="rg-over">' + k.over +
                '</span><span class="rg-under">' + (k.under || "&nbsp;") + "</span></button>";
        }
        if (sv.ingen) return '<button class="svar mol ingen" type="button" data-i="' + i + '">' + nr + '<span class="sv-tegninger"><span class="sv-ingen">Ingen reaktion</span></span><span class="sv-navn"></span></button>';
        var stoffer = sv.par || [sv.stof];
        return '<button class="svar mol" type="button" data-i="' + i + '">' + nr + '<span class="sv-tegninger">' + stoffer.map(function (p, j) {
            return (j ? '<span class="sv-plus">+</span>' : "") + '<span class="sv-tegn" data-tegn="' + NK.html(p.navn) + '"></span>';
        }).join("") + '</span><span class="sv-navn"></span></button>';
    }

    /* Tegningerne fylder den plads, der er: skemaets hoejde og svarkortenes
       stoerrelse maales, efter at de er sat ind (Niels: molekylerne kunne
       ikke vaere paa den baerbare). */
    function tegnSkema(sk, q, fremhaev) {
        var mol = sk.querySelectorAll(".sk-tegn");
        var andre = sk.querySelectorAll(".sk-pil, .sk-plus, .sk-lille");
        var bredde = sk.clientWidth - 32 - andre.length * 70;
        var maksB = Math.max(80, Math.min(260, bredde / Math.max(1, mol.length) - 30));
        var maksH = Math.max(50, Math.min(130, sk.clientHeight - 74));
        Array.prototype.forEach.call(mol, function (el) {
            var st = K.stof(el.getAttribute("data-tegn"));
            K.tegnI(el, st, { skala: 40, maksB: maksB, maksH: maksH, fremhaev: fremhaev ? fremhaev(st, el) : null });
        });
    }

    function tegnSvar(sv, fremhaev) {
        Array.prototype.forEach.call(sv.querySelectorAll(".sv-tegninger"), function (boks) {
            var tegn = boks.querySelectorAll(".sv-tegn");
            if (!tegn.length) return;
            var b = boks.clientWidth, h = boks.clientHeight;
            var maksB = Math.max(50, (b - (tegn.length - 1) * 26) / tegn.length - 6);
            Array.prototype.forEach.call(tegn, function (el) {
                var st = K.stof(el.getAttribute("data-tegn"));
                K.tegnI(el, st, { skala: 40, maksB: maksB, maksH: Math.max(40, h - 4), fremhaev: fremhaev ? fremhaev(st, el) : null });
            });
        });
    }

    function visSpm() {
        var q = s.q;
        var sk = $("l2-skema");
        sk.className = "skema" + (q.art === "type" ? " type" : "");
        sk.innerHTML = skemaHTML(q, false);
        var sv = $("l2-svar");
        sv.className = "svarflade " + (q.svar[0].type ? "typer" : (q.svar[0].kort ? "kortene" : "stoffer"));
        sv.innerHTML = q.svar.map(function (x, i) { return svarHTML(q, i); }).join("");
        Array.prototype.forEach.call(sv.querySelectorAll(".svar"), function (b) {
            b.addEventListener("click", function () { svar(Number(b.getAttribute("data-i"))); });
        });
        opgaveKort(null);
        tegnSkema(sk, q, null);
        tegnSvar(sv, null);
        panel();
    }

    function etiket() {
        if (s.minut) return '<span class="ok-etiket">1 minut · spørgsmål ' + (s.nr + 1) + "</span>";
        if (s.igen) return '<span class="ok-etiket">Dem, du glippede · ' + (s.koe.length + 1) + " tilbage</span>";
        return '<span class="ok-etiket">Niveau ' + (s.nivNr + 1) + " · " + niv(s.nivNr).titel + " · spørgsmål " + (s.nr + 1) + "</span>";
    }

    var VEJL = {
        produkt: "Klik på det, der dannes, eller tast 1 til 4.",
        type: "Se på, hvad der sker med molekylet, og tast 1 til 6.",
        reagens: "Klik på det, der står over pilen, eller tast 1 til 4.",
        udgangsstof: "Tænk baglæns fra produktet, og tast 1 til 4."
    };

    /* Kortet: én linje med spoergsmaalet og én med vejledningen eller svaret */
    function opgaveKort(udfald) {
        var q = s.q;
        var html = '<p class="ok-spm">' + etiket() + " <b>" + q.tekst + "</b></p>";
        if (udfald && s.minut) {
            /* Paa tid: kort besked her, forklaringen i panelet */
            html += '<div class="ok-svarlinje"><p class="ok-udfald ' + (udfald.ok ? "ok" : "nej") + '"><b>' + (udfald.ok ? "Rigtigt." : "Forkert.") + "</b> " +
                (udfald.ok ? "" : "Det rigtige svar er grønt. Fejlen og forklaringen står i panelet til højre.") + "</p></div>";
        } else if (udfald) {
            html += '<div class="ok-svarlinje"><p class="ok-udfald ' + (udfald.ok ? "ok" : "nej") + '"><b>' +
                (udfald.ok ? "Rigtigt" + (s.igen ? "." : ". +" + udfald.point + " point.") : "Forkert.") + "</b> " +
                (udfald.ok ? q.om : udfald.grund + (s.igen ? " Spørgsmålet kommer igen til sidst." : "")) + "</p>" +
                '<button class="knap blaa" type="button" id="l2-naeste">' + (s.liv > 0 ? "Næste" : "Se resultatet") + " ↵</button></div>";
        } else {
            html += '<div class="ok-svarlinje"><p class="ok-vejledning">' + VEJL[q.art] + "</p></div>";
        }
        if (s.minut) html += '<div class="tidbar"><i id="l2-tid"></i></div>';
        App().opgave(html, "lag2-opgave" + (udfald ? (udfald.ok ? " groen" : " roed") : ""));
        var b = $("l2-naeste");
        if (b) b.addEventListener("click", naeste);
        opdaterTid();
    }

    /* ----- Svaret ------------------------------------------------------------ */
    function svar(i) {
        if (!s || !s.koerer || s.besvaret) return;
        var q = s.q, valgt = q.svar[i];
        var ok = noegle(valgt) === noegle(q.rigtig);
        s.besvaret = true;
        var point = 0;
        if (ok) {
            if (s.minut) point = 1;
            else if (s.igen) point = 0;
            else {
                var bonus = Math.min(s.serie, C.MAKS_SERIE) * C.SERIE_BONUS;
                point = Math.round(C.POINT * (s.nivNr + 1) * (1 + bonus));
            }
            s.point += point;
            s.serie++;
            s.bedsteSerie = Math.max(s.bedsteSerie, s.serie);
            s.rigtige++;
            L.spil("rigtig");
        } else {
            if (s.minut) s.point -= 1;
            else if (s.igen) s.koe.push(q);
            else s.liv--;
            s.forkerte++;
            s.serie = 0;
            s.fejl.push({ q: q, valgt: valgt });
            L.spil("forkert");
        }
        /* Svarene: det valgte og det rigtige faar farve, navnene kommer frem */
        var sv = $("l2-svar");
        Array.prototype.forEach.call(sv.querySelectorAll(".svar"), function (b) {
            var j = Number(b.getAttribute("data-i")), x = q.svar[j];
            var rigtigt = noegle(x) === noegle(q.rigtig);
            b.classList.add("laast");
            if (rigtigt) b.classList.add("rigtig");
            else if (j === i) b.classList.add("forkert");
            else b.classList.add("mat");
            var navn = b.querySelector(".sv-navn");
            if (navn) navn.textContent = x.ingen ? "" : (x.par || [x.stof]).map(function (p) { return p.navn; }).join(" + ");
            b.disabled = true;
        });
        /* Det rigtige svar faar gruppen groen som i bogen */
        tegnSvar(sv, function (st, el) {
            var knap = el.closest(".svar");
            return knap && knap.classList.contains("rigtig") ? st.klasse : null;
        });
        var sk = $("l2-skema");
        sk.innerHTML = skemaHTML(q, true);
        tegnSkema(sk, q, function (st, el) { return el.parentNode.classList.contains("svar") ? st.klasse : null; });
        if (q.art === "reagens") {
            var p = sk.querySelector(".sk-pil");
            if (p) p.classList.add("svar");
        }
        if (q.art === "type") {
            var pil2 = sk.querySelector(".sk-pil");
            var k = kortAf(q.kort);
            pil2.querySelector(".sk-over").textContent = q.kort === "kond" ? "H₂SO₄" : k.over;
            pil2.querySelector(".sk-under").textContent = q.kort === "kond" ? "varme" : k.under;
            pil2.style.setProperty("--typefarve", D.TYPER[q.r.type].farve);
            pil2.classList.add("farvet");
        }
        opgaveKort({ ok: ok, point: point, grund: valgt.grund || "" });
        if (s.minut) fejlListe(); else sidste(q, ok);
        panel();
        /* Paa 1 minut gaar det videre af sig selv */
        if (s.minut) s.videreOm = ok ? C.MINUT.ventRigtig : C.MINUT.ventForkert;
    }

    function naeste() {
        if (!s || !s.koerer || !s.besvaret) return;
        if (!s.minut && !s.igen && s.liv <= 0) { slut(); return; }
        if (s.igen && !s.koe.length) { slut(); return; }
        s.nr++;
        s.videreOm = 0;
        if (!s.minut && !s.igen && s.nr % C.PR_NIVEAU === 0) {
            s.nivNr++;
            L.spil("niveau");
            App().toast("Niveau " + (s.nivNr + 1) + ": " + niv(s.nivNr).titel);
        }
        s.besvaret = false;
        s.q = lavSpm();
        visSpm();
    }

    /* ----- Uret (kun 1 minut) ----------------------------------------------------- */
    function trin(dt) {
        if (!s || !s.koerer || !s.minut) return;
        s.tid = Math.max(0, s.tid - dt / 1000);
        if (s.videreOm > 0) {
            s.videreOm -= dt;
            if (s.videreOm <= 0 && s.tid > 0) naeste();
        }
        opdaterTid();
        if (s.tid <= 0) slut();
    }

    function loekke(t) {
        if (!s || !s.koerer) { raf = 0; return; }
        var dt = sidst ? Math.min(100, t - sidst) : 16;
        sidst = t;
        trin(dt);
        raf = requestAnimationFrame(loekke);
    }

    function opdaterTid() {
        if (!s || !s.minut) return;
        var i = $("l2-tid");
        if (i) {
            i.style.width = (NK.klamp(s.tid / C.MINUT.tid, 0, 1) * 100).toFixed(1) + "%";
            i.className = s.tid < 10 ? "lav" : "";
        }
        var sek = Math.ceil(s.tid);
        if (sek !== s.visteSek) { s.visteSek = sek; panel(); }
    }

    /* ----- Panelet --------------------------------------------------------------- */
    function panel() {
        if (!s) return;
        if (s.minut) {
            App().panel({
                point: Math.max(0, s.point),
                tal2: { navn: "Tid", vaerdi: Math.ceil(s.tid) + " s", klasse: s.tid < 10 ? "over" : "" },
                tal3: { navn: "Rigtige", vaerdi: s.rigtige },
                fremgang: { andel: s.tid / C.MINUT.tid, tekst: s.rigtige + " rigtige og " + s.forkerte + " forkerte · point = rigtige minus forkerte" }
            });
            return;
        }
        if (s.igen) {
            App().panel({
                point: 0,
                tal2: { navn: "Tilbage", vaerdi: s.koe.length + (s.besvaret ? 0 : 1), klasse: "" },
                tal3: { navn: "Taget", vaerdi: s.rigtige },
                fremgang: { andel: s.rigtige / Math.max(1, s.antalIgen), tekst: s.rigtige + " af " + s.antalIgen + " er taget igen" }
            });
            return;
        }
        var iNiv = s.nr % C.PR_NIVEAU + (s.besvaret ? 1 : 0);
        App().panel({
            point: s.point,
            tal2: { navn: "Liv", vaerdi: "♥♥♥".slice(0, Math.max(0, s.liv)) + "♡♡♡".slice(0, C.LIV - Math.max(0, s.liv)), klasse: "liv" },
            tal3: { navn: "Niveau", vaerdi: s.nivNr + 1 },
            fremgang: { andel: iNiv / C.PR_NIVEAU, tekst: iNiv + " af " + C.PR_NIVEAU + " på niveauet · " + s.serie + " rigtige i træk" }
        });
    }

    /* Paa tid: fejlene samles i panelet, nyeste oeverst */
    function kortSpm(q) {
        if (q.art === "type") return "Reaktionstypen: " + q.stof.navn + " → " + q.v.produkter.map(function (p) { return p.navn; }).join(" + ");
        if (q.art === "reagens") return "Over pilen: " + q.stof.navn + " → " + q.v.produkter.map(function (p) { return p.navn; }).join(" + ");
        if (q.art === "udgangsstof") return "Udgangsstoffet til " + q.P.navn + " med " + R.kortTitel(q.kort);
        return stort(q.stof.navn) + (q.partner ? " + " + q.partner.navn : "") + " med " + R.kortTitel(q.kort);
    }

    function svarTekst(v) {
        return v.type ? D.TYPER[v.type].navn : (v.kort ? R.kortTitel(v.kort) : (v.ingen ? "ingen reaktion" :
            (v.par || [v.stof]).map(function (p) { return p.navn; }).join(" + ")));
    }

    function fejlListe() {
        if (!s.fejl.length) {
            App().lagkort("Dine fejl", '<p class="mat">Ingen fejl endnu. De, du glipper, kan du tage igen bagefter.</p>');
            return;
        }
        App().lagkort("Dine fejl <span class=\"taeller\">" + s.fejl.length + "</span>", '<ol class="fejlliste">' + s.fejl.slice().reverse().map(function (f) {
            return "<li><b>" + NK.html(kortSpm(f.q)) + "</b><span>Du valgte " + NK.html(svarTekst(f.valgt)) + ", det rigtige er " +
                NK.html(svarTekst(f.q.rigtig)) + ".</span><small>" + NK.html(f.valgt.grund || "") + "</small></li>";
        }).join("") + "</ol>");
    }

    function sidste(q, ok) {
        var r = q.r;
        var linje;
        if (r.ingen) linje = NK.html(q.stof.navn) + " → ingen reaktion";
        else {
            var v = q.v || r.valg[0];
            if (q.art === "produkt" && !q.rigtig.ingen) v = { produkter: q.forTegn };
            linje = NK.html(q.stof.navn) + (q.partner ? " + " + NK.html(q.partner.navn) : "") + " → " +
                v.produkter.map(function (p) { return NK.html(p.navn); }).join(" + ");
        }
        var type = r.ingen ? "" : '<span class="typechip" style="--typefarve:' + D.TYPER[r.type].farve + '">' + r.navn + "</span>";
        App().lagkort("Det sidste svar", '<p class="sidste-navn">' + (ok ? '<span class="ok">✓</span> ' : '<span class="nej">✗</span> ') + linje + "</p>" +
            '<p class="sidste-klasse">' + type + " " + NK.html(R.kortTitel(q.kort)) + "</p>");
    }

    /* ----- Kortet "1 minut paa tid" i panelet ------------------------------------
       Niels: "det kunne vaere fint at muligheden staar ude i siden sammen med
       en highscore". Rekorden og ugens top 5, naar det faelles script svarer. */
    function tidskort() {
        var k = $("tidskort");
        var p = NK.Topliste.personlig(2);
        var l = App().liste(2);
        var top = l && l.uge && l.uge.length ? '<ol class="tk-top">' + l.uge.slice(0, 5).map(function (r) {
            return "<li><span>" + NK.html(r.navn) + "</span><b>" + r.point + "</b></li>";
        }).join("") + "</ol>" : "";
        var igang = !!(s && s.koerer && s.minut);
        k.innerHTML = '<h2>1 minut på tid <span class="taeller">rekord <b>' + p.alle + "</b></span></h2>" +
            '<p class="tk-tekst">Så mange rigtige som muligt på 60 sekunder. Et forkert svar trækker ét fra. Det er highscoren.</p>' +
            (top ? '<p class="tk-titel">Top 5 denne uge</p>' + top : "") +
            '<button class="knap stor gul" type="button" id="tk-start"' + (igang ? " disabled" : "") + ">" +
            (igang ? "Uret går" : "Start 1 minut") + "</button>";
        $("tk-start").addEventListener("click", function () { App().startSpil("minut"); });
    }

    /* ----- Start og slut ------------------------------------------------------------ */
    function start(t) {
        stop();
        var minut = t === "minut", igen = t === "igen" && glippede.length > 0;
        s = { koerer: true, minut: minut, igen: igen, point: 0, liv: C.LIV, nr: 0, nivNr: minut ? 6 : 0, serie: 0, bedsteSerie: 0,
              rigtige: 0, forkerte: 0, besvaret: false, fejl: [], t0: Date.now(), sidsteNoegle: "",
              tid: C.MINUT.tid, visteSek: -1, videreOm: 0,
              koe: igen ? NK.bland(glippede) : [], antalIgen: igen ? glippede.length : 0 };
        if (minut) fejlListe();
        else App().lagkort("Det sidste svar", '<p class="mat">Intet endnu.</p>');
        s.q = lavSpm();
        visSpm();
        tidskort();
        if (minut) { sidst = 0; raf = requestAnimationFrame(loekke); }
    }

    function stop() {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        if (s) s.koerer = false;
        App().opgave(null);
        $("l2-skema").innerHTML = "";
        $("l2-svar").innerHTML = "";
    }

    function beskrivFejl(f) {
        var q = f.q, v = f.valgt;
        var hvad = v.type ? D.TYPER[v.type].navn : (v.kort ? R.kortTitel(v.kort) : (v.ingen ? "ingen reaktion" :
            (v.par || [v.stof]).map(function (p) { return p.navn; }).join(" + ")));
        var om = q.art === "type" ? "Reaktionstypen for " + q.stof.navn : (q.art === "reagens" ? "Pilen fra " + q.stof.navn :
            (q.art === "udgangsstof" ? "Udgangsstoffet til " + q.P.navn : stort(q.stof.navn) + " med " + R.kortTitel(q.kort)));
        return "<li>" + NK.html(om) + ": du valgte " + NK.html(hvad) + "</li>";
    }

    function slut() {
        if (!s || !s.koerer) return;
        s.koerer = false;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        App().opgave(null);
        $("l2-skema").innerHTML = "";
        $("l2-svar").innerHTML = "";
        L.spil("slut");
        var linjer, knapper;
        if (s.igen) {
            App().slut({ titel: "Alle " + s.antalIgen + " er taget igen", udenPoint: true, rekord: false,
                linjer: ["<p>Du har nu svaret rigtigt på alle de spørgsmål, du glippede" +
                    (s.forkerte ? ", og " + s.forkerte + (s.forkerte === 1 ? " af dem skulle tages" : " af dem skulle tages") + " mere end én gang" : "") + ".</p>"],
                knapper: [{ tekst: "Spil 1 minut igen", hoved: true, goer: function () { App().startSpil("minut"); } },
                          { tekst: "Øv uden tid", goer: function () { App().startSpil("oev"); } }] });
            glippede = [];
            tidskort();
            return;
        }
        if (s.minut) {
            glippede = s.fejl.map(function (f) { return f.q; }).filter(function (q, i, a) { return a.indexOf(q) === i; });
            linjer = ["<p><b>" + s.rigtige + "</b> rigtige og <b>" + s.forkerte + "</b> forkerte på 1 minut · bedste serie <b>" + s.bedsteSerie + "</b></p>"];
            knapper = glippede.length ?
                [{ tekst: "Tag de " + glippede.length + ", du glippede", hoved: true, goer: function () { App().startSpil("igen"); } },
                 { tekst: "Spil 1 minut igen", goer: function () { App().startSpil("minut"); } }] :
                [{ tekst: "Spil 1 minut igen", hoved: true, goer: function () { App().startSpil("minut"); } },
                 { tekst: "Øv uden tid", goer: function () { App().startSpil("oev"); } }];
        } else {
            linjer = ["<p><b>" + (s.nr + 1) + "</b> spørgsmål · <b>" + s.rigtige + "</b> rigtige · niveau <b>" + (s.nivNr + 1) +
                "</b> · bedste serie <b>" + s.bedsteSerie + "</b></p>"];
            knapper = [{ tekst: "Øv igen", hoved: true, goer: function () { App().startSpil("oev"); } },
                       { tekst: "Spil 1 minut", goer: function () { App().startSpil("minut"); } }];
        }
        if (s.fejl.length) linjer.push('<div class="mk-drillere"><p class="mk-drilletitel">' + (s.minut ? "Dem, du glippede" : "Det drillede") + "</p><ul>" +
            s.fejl.slice(0, 6).map(beskrivFejl).join("") + (s.fejl.length > 6 ? "<li>og " + (s.fejl.length - 6) + " til</li>" : "") + "</ul></div>");
        App().slut({ titel: s.minut ? "Tiden er gået" : "Tre forkerte svar", point: Math.max(0, s.point), niveau: s.minut ? s.rigtige : s.nivNr + 1,
            sekunder: s.minut ? C.MINUT.tid : (Date.now() - s.t0) / 1000, linjer: linjer, rekord: s.minut,
            oevelse: "Øvelse uden tid. Highscoren er 1 minut på tid i panelet.", knapper: knapper });
        tidskort();
    }

    function tast(e) {
        if (!s || !s.koerer) return false;
        if (e.key === "Enter") { if (s.besvaret) naeste(); return true; }
        if (/^[1-6]$/.test(e.key) && !s.besvaret) {
            var i = Number(e.key) - 1;
            if (i < s.q.svar.length) svar(i);
            return true;
        }
        return false;
    }

    NK.Lag = NK.Lag || {};
    NK.Lag[2] = {
        titel: "Reaktionerne",
        startTekst: "<p>Hvert spørgsmål handler om én reaktion fra syntesekortet. <b>Find produktet, det der står over pilen, " +
            "reaktionstypen eller udgangsstoffet.</b></p><p>Her øver du uden tid og med tre liv. Hvert femte spørgsmål kommer nye reaktioner. " +
            "Highscoren er <b>1 minut på tid</b>: knappen står i panelet til højre.</p>",
        rekordTekst: "på 1 minut",
        init: function () {},
        vis: function () {
            $("lag2").hidden = false;
            App().panel({ point: 0, tal2: { navn: "Liv", vaerdi: "♥♥♥", klasse: "liv" }, tal3: { navn: "Niveau", vaerdi: 1 }, fremgang: null });
            App().lagkort("Det sidste svar", '<p class="mat">Intet endnu.</p>');
            $("tidskort").hidden = false;
            tidskort();
        },
        skjul: function () { stop(); $("lag2").hidden = true; $("tidskort").hidden = true; },
        start: function (t) { start(t || "oev"); },
        listeOpdateret: function () { if (!s || !s.koerer) tidskort(); },
        stop: stop,
        koerer: function () { return !!(s && s.koerer); },
        tast: tast,
        /* Til selvtesten */
        _s: function () { return s; },
        _start: start,
        _byg: BYG,
        _svar: svar,
        _naeste: naeste,
        _noegle: noegle,
        _glippede: function () { return glippede; },
        _trin: function (dt) { trin(dt); }
    };
}());
