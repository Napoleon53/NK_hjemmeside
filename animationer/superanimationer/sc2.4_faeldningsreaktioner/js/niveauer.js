/* =====================================================================
   niveauer.js - samme opgave i tre sværhedsgrader

   Let     (id "tabel")  eleven finder bundfaldet i tabellen; ionerne er
                          givet, og formlen og ionskemaet vises
   Middel  (id "vaelg")  alle fire trin med svarmuligheder
   Svær    (id "skriv")  alle fire trin, eleven skriver selv

   Alle tre har de samme fire trin som den gamle c2.4: ionerne,
   bundfaldet, formlen og ionskemaet. Et trin med givet() klares af
   sig selv. Trin 2 paa Middel og Svær er det samme: eleven klikker
   paa bundfaldet i faeldningstabellen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var F = NK.Formel;

    function ionT(ion) { return D.ionTekst(ion); }

    /* ----- Valg af opgave -------------------------------------------------- */
    function fri(niv, liste) {
        var ud = liste.filter(function (p) { return niv.seneste.indexOf(p.noegle) < 0; });
        return ud.length ? ud : liste;
    }

    /* Niveau 1: mest par med ét bundfald, men ogsaa blandinger uden
       bundfald og nogle faa med to. */
    function vaelgBlandet(niv) {
        var r = Math.random();
        var udfald = r < 0.55 ? "en" : (r < 0.85 ? "ingen" : "begge");
        return NK.tilfaeldig(fri(niv, D.PAR.filter(function (p) { return p.udfald === udfald; })));
    }

    /* Niveau 2 og 3: altid ét bundfald. De svaere forhold (3 : 1, 3 : 2)
       kommer foerst, naar de lette er loest. */
    function vaelgEt(niv) {
        var loft = Math.min(3, 1 + Math.floor(niv.loest / 2));
        var alle = D.PAR.filter(function (p) { return p.udfald === "en" && p.trin <= loft; });
        var dette = alle.filter(function (p) { return p.trin === loft; });
        return NK.tilfaeldig(fri(niv, Math.random() < 0.7 && dette.length ? dette : alle));
    }

    /* ----- Beskeder, der gaar igen ---------------------------------------- */
    function ikkeHer(o, k, a) {
        var mangler = [D.ion(k), D.ion(a)].filter(function (i) { return o.ioner.indexOf(i) < 0; });
        if (mangler.length === 2) return "Hverken " + ionT(mangler[0]) + " eller " + ionT(mangler[1]) + " er med i blandingen.";
        return "Der er ingen " + ionT(mangler[0]) + " i blandingen.";
    }

    function gammelt(o, k, a) {
        var S = D.salt(k, a);
        return ionT(S.kat) + " og " + ionT(S.an) + " var sammen i flasken med " + S.formel
            + " i forvejen. Find en ny partner til " + ionT(S.kat) + ".";
    }

    function nyePar(o) {
        return o.nye.map(function (n) { return ionT(n.salt.kat) + " + " + ionT(n.salt.an); }).join(" og ");
    }

    function tilskuerTekst(o) {
        return o.tilskuere.map(ionT).join(" og ");
    }

    /* ----- Faelles trin: bundfaldet i tabellen (niveau 2 og 3) ------------- */
    var TRIN_BUNDFALD = {
        navn: "Bundfaldet",
        spm: "Hvilket af de nye par er tungtopløseligt? Klik på det i fældningstabellen.",
        tabelKlik: function (niv, k, a) {
            var o = niv.o, ny = D.nytPar(o, k, a);
            if (ny && ny.kode === "T") {
                niv.loes(false, "Rigtigt. " + ionT(o.P.kat) + " og " + ionT(o.P.an) + " er T i tabellen og falder ud. "
                    + tilskuerTekst(o) + " er tilskuerioner: de bliver i opløsning.");
                return;
            }
            niv.blink(k, a);
            if (ny) niv.saetBesked(ionT(ny.salt.kat) + " og " + ionT(ny.salt.an) + " er L i tabellen: letopløseligt. De bliver i opløsning.", "skidt");
            else if (D.gammeltPar(o, k, a)) niv.saetBesked(gammelt(o, k, a), "skidt");
            else if (o.ioner.indexOf(D.ion(k)) < 0 || o.ioner.indexOf(D.ion(a)) < 0) niv.saetBesked(ikkeHer(o, k, a), "skidt");
        },
        hint: function (niv) {
            var o = niv.o;
            niv.hint = o.nye.map(function (n) { return { kat: n.salt.kat.id, an: n.salt.an.id }; });
            return "Ionerne bytter partner. De nye par er " + nyePar(o) + ". Slå dem begge op.";
        },
        vis: function (niv) {
            var o = niv.o;
            niv.loes(true, "Svaret: " + ionT(o.P.kat) + " og " + ionT(o.P.an) + " er T i tabellen og falder ud. "
                + tilskuerTekst(o) + " er tilskuerioner.");
        },
        efter: function (niv) {
            niv.s.pKendt = true;
            niv.baeger.bland([niv.o.P]);
        }
    };

    /* Tabellens maerker paa niveau 2 og 3: bundfaldet, naar det er fundet. */
    function markerBundfald(niv) {
        var o = niv.o;
        return { fundet: niv.s.pKendt ? [{ kat: o.P.kat.id, an: o.P.an.id, klasse: "faeld" }] : [] };
    }

    /* Hoejre side af pilen paa niveau 2 og 3. */
    function produktFelt(niv, skriv) {
        var o = niv.o;
        if (!niv.s.pKendt) return '<span class="pladsholder">?</span>';
        var f = D.bundfald(o.P.kat.id, o.P.an.id).farve;
        var stil = ' style="--bundfald: rgb(' + f.join(", ") + ')"';
        if (niv.s.formelKendt) return '<span class="bundfaldchip kendt"' + stil + ">" + o.P.formel + '<span class="tilst">(s)</span></span>';
        if (skriv && niv.trin === 2) return '<span class="bundfaldchip"' + stil + ">" + niv.felt("P", "stort", "formel") + "</span>";
        return '<span class="bundfaldchip"' + stil + ">bundfald</span>";
    }

    function faerdigtSkema(niv) {
        return '<span class="faerdigt">' + D.ionskema(niv.o.P) + "</span>";
    }

    function forklarLadninger(P) {
        return ionT(P.kat) + " har ladningen " + NK.ladningstekst(P.kat.q) + ", og " + ionT(P.an) + " har ladningen "
            + NK.ladningstekst(P.an.q) + ". Tag så mange af hver, at plus og minus går lige op.";
    }

    var HINT_IONER = "Den positive ion står først i formlen, den negative sidst. Ionerne står med deres ladning i kanten af fældningstabellen.";

    function ionerVist(o) {
        return "Svaret: " + o.A.formel + " består af " + ionT(o.A.kat) + " og " + ionT(o.A.an) + ", og "
            + o.B.formel + " består af " + ionT(o.B.kat) + " og " + ionT(o.B.an) + ".";
    }

    var LADNINGSKNAPPER = '<div class="vaerktoej"><span class="vt-etiket">Ladning</span>'
        + [[1, "+"], [-1, "−"], [2, "2+"], [-2, "2−"], [3, "3+"], [-3, "3−"]].map(function (x) {
            return '<button class="lknap" type="button" data-q="' + x[0] + '" title="Sæt ladningen ' + x[1] + ' på feltet">' + x[1] + "</button>";
        }).join("") + '<span class="vt-note">Tal efter et symbol bliver sænket af sig selv.</span></div>';

    var SKRIVNOTE = '<div class="vaerktoej"><span class="vt-note">Tal og parenteser sættes af sig selv: ca3po42 bliver Ca₃(PO₄)₂.</span></div>';

    /* =====================================================================
       LET: BRUG TABELLEN
       ===================================================================== */
    function resultat(o, vist) {
        var start = vist ? "Svaret: " : "Rigtigt. ";
        if (o.udfald === "ingen") return start + "Begge nye par er letopløselige, så alle ionerne bliver i opløsning.";
        if (o.udfald === "begge") {
            return start + "Både " + o.faeld[0].formel + " og " + o.faeld[1].formel + " er tungtopløselige og falder ud.";
        }
        var b = D.bundfald(o.P.kat.id, o.P.an.id);
        return start + o.P.formel + " er tungtopløseligt og falder ud som et " + b.ord + " bundfald. "
            + o.bliver[0].formel + " er letopløseligt, så de ioner bliver i opløsning.";
    }

    function rigtigtUdfald(o) {
        if (o.udfald !== "en") return o.udfald;
        return o.nye[0].kode === "T" ? "0" : "1";
    }

    var NIV_TABEL = {
        id: "tabel",
        ionerSynlige: true,
        vaelgPar: vaelgBlandet,
        ionOmraade: function (niv, S) { return niv.ionChips(S); },
        produkt: function (niv) {
            var o = niv.o, fundne = niv.s.fundne || [];
            if (niv.s.pKendt) {
                if (!o.faeld.length) return '<span class="pladsholder lille">intet bundfald</span>';
                return o.faeld.map(function (S) {
                    var f = D.bundfald(S.kat.id, S.an.id).farve;
                    return '<span class="bundfaldchip kendt" style="--bundfald: rgb(' + f.join(", ") + ')">' + S.formel + '<span class="tilst">(s)</span></span>';
                }).join('<span class="op">+</span>');
            }
            return o.nye.map(function (n) {
                if (fundne.indexOf(n) < 0) return '<span class="pladsholder">?</span>';
                return '<span class="nytpar k' + n.kode + '">' + n.salt.formel + '<span class="kode">' + n.kode + "</span></span>";
            }).join('<span class="op">+</span>');
        },
        skemaRaekke: function (niv) {
            var o = niv.o;
            if (!niv.s.pKendt || !o.faeld.length) return "";
            return o.faeld.map(function (S) { return '<span class="faerdigt">' + D.ionskema(S) + "</span>"; }).join("");
        },
        tabelMarker: function (niv) {
            var o = niv.o;
            var fundet = (niv.s.fundne || []).map(function (n) {
                return { kat: n.salt.kat.id, an: n.salt.an.id, klasse: niv.s.pKendt && n.kode === "T" ? "faeld" : "fundet" };
            });
            return { fundet: fundet };
        },
        trin: [
            {
                navn: "Ionerne",
                givet: function () { return "givet"; }
            },
            {
                /* To dele: foerst de nye par i tabellen, saa hvad der falder ud. */
                navn: "Bundfaldet",
                spm: function (niv) {
                    return niv.s.fase === "b" ? "Hvad sker der, når de to opløsninger blandes?"
                        : "Ionerne bytter partner. Find de to nye par i fældningstabellen.";
                },
                start: function (niv) { niv.s.fundne = []; niv.s.fase = "a"; niv.s.forkerte = {}; },
                tabelKlik: function (niv, k, a) {
                    if (niv.s.fase !== "a") return;
                    var o = niv.o, ny = D.nytPar(o, k, a);
                    if (ny) {
                        if (niv.s.fundne.indexOf(ny) >= 0) return;
                        niv.s.fundne.push(ny);
                        var tekst = ionT(ny.salt.kat) + " og " + ionT(ny.salt.an) + " er " + (ny.kode === "T" ? "tungtopløseligt" : "letopløseligt") + ".";
                        niv.hint = null;
                        if (niv.s.fundne.length === 2) {
                            niv.s.fase = "b";
                            niv.hjaelp = 0;
                            niv.besked = { tekst: "Begge nye par er fundet. " + tekst, klasse: "god" };
                        } else {
                            niv.besked = { tekst: "Fundet: " + tekst + " Find det andet par.", klasse: "god" };
                        }
                        niv.vis();
                        return;
                    }
                    niv.blink(k, a);
                    if (D.gammeltPar(o, k, a)) niv.saetBesked(gammelt(o, k, a), "skidt");
                    else if (o.ioner.indexOf(D.ion(k)) < 0 || o.ioner.indexOf(D.ion(a)) < 0) niv.saetBesked(ikkeHer(o, k, a), "skidt");
                },
                valg: function (niv) {
                    if (niv.s.fase !== "b") return "";
                    var o = niv.o;
                    var muligheder = [o.nye[0].salt.formel + " falder ud", o.nye[1].salt.formel + " falder ud",
                        "Begge falder ud", "Intet bundfald"];
                    return '<div class="valg fire">' + muligheder.map(function (m, i) {
                        return '<button class="valgknap' + (niv.s.forkerte[i] ? " forkert" : "") + '" type="button" data-i="' + i + '"'
                            + (niv.s.forkerte[i] ? " disabled" : "") + ">" + m + "</button>";
                    }).join("") + "</div>";
                },
                valgKlik: function (niv, i) {
                    if (niv.s.fase !== "b") return;
                    var o = niv.o, v = ["0", "1", "begge", "ingen"][i], rigtig = rigtigtUdfald(o);
                    if (v === rigtig) { niv.loes(false, resultat(o, false)); return; }
                    niv.s.forkerte[i] = true;
                    var tekst;
                    if (v === "0" || v === "1") {
                        var n = o.nye[+v];
                        tekst = n.kode === "L"
                            ? n.salt.formel + " er L i tabellen. Det er letopløseligt og bliver i opløsning."
                            : n.salt.formel + " falder ganske rigtigt ud. Se også på det andet par.";
                    } else if (v === "ingen") {
                        tekst = "Se efter T i de to felter, du fandt. T betyder tungtopløseligt.";
                    } else {
                        tekst = o.udfald === "ingen" ? "Begge nye par er L i tabellen." : "Kun det ene af de nye par er T i tabellen.";
                    }
                    niv.besked = { tekst: tekst, klasse: "skidt" };
                    niv.vis();
                },
                hint: function (niv) {
                    var o = niv.o;
                    if (niv.s.fase === "b") {
                        niv.hint = o.nye.map(function (n) { return { kat: n.salt.kat.id, an: n.salt.an.id }; });
                        return "T betyder tungtopløseligt. Et par med T falder ud som bundfald, et par med L bliver i opløsning.";
                    }
                    var ny = o.nye.filter(function (n) { return niv.s.fundne.indexOf(n) < 0; })[0];
                    niv.hint = [{ kat: ny.salt.kat.id, an: ny.salt.an.id }];
                    return "Byt partner: " + ionT(ny.salt.kat) + " skal have " + ionT(ny.salt.an) + " som ny partner. Find rækken med "
                        + ionT(ny.salt.kat) + " og søjlen med " + ionT(ny.salt.an) + ".";
                },
                vis: function (niv) {
                    if (niv.s.fase === "b") { niv.loes(true, resultat(niv.o, true)); return; }
                    /* Foerste del vises. Saa mangler eleven stadig at sige, hvad der falder ud. */
                    niv.s.fundne = niv.o.nye.slice();
                    niv.s.fase = "b";
                    niv.delVist = true;
                    niv.hjaelp = 0;
                    niv.hint = null;
                    niv.besked = { tekst: "Svaret: de nye par er " + nyePar(niv.o) + ".", klasse: "gul" };
                    niv.vis();
                },
                efter: function (niv) {
                    niv.s.pKendt = true;
                    niv.baeger.bland(niv.o.faeld);
                    if (niv.o.faeld.length === 1) niv.baeger.navngiv(niv.o.faeld[0].formel + "(s)");
                    else if (niv.o.faeld.length === 2) niv.baeger.navngiv(niv.o.faeld[0].formel + "(s) og " + niv.o.faeld[1].formel + "(s)");
                }
            },
            {
                navn: "Formlen",
                givet: function (niv) { return niv.faerdig && niv.o.udfald === "ingen" ? "intet bundfald" : "vises"; }
            },
            {
                navn: "Ionskemaet",
                givet: function (niv) { return niv.faerdig && niv.o.udfald === "ingen" ? "ingen reaktion" : "vises"; }
            }
        ]
    };

    /* =====================================================================
       MIDDEL: VÆLG
       ===================================================================== */
    var NIV_VAELG = {
        id: "vaelg",
        vaelgPar: vaelgEt,
        ionOmraade: function (niv, S) {
            if (niv.s.ionerKendt) return niv.ionChips(S);
            var fundne = niv.s.fundneIoner || {};
            return [S.kat, S.an].map(function (ion) {
                return fundne[ion.id] ? NK.ionChip(ion, "ny") : '<span class="pladsholder ion">?</span>';
            }).join("");
        },
        produkt: function (niv) { return produktFelt(niv, false); },
        skemaRaekke: function (niv) {
            if (niv.s.skemaFaerdigt) return faerdigtSkema(niv);
            if (niv.trin !== 3 || niv.faerdig) return "";
            var P = niv.o.P, s = niv.s;
            function led(i, tekst) {
                var fk = s.fejlKoef && s.fejlKoef[i], ft = s.fejlTilst && s.fejlTilst[i];
                return '<span class="led"><span class="koef' + (fk ? " fejl" : "") + '">'
                    + '<button type="button" data-koef="' + i + '" data-d="1" aria-label="Et mere">+</button>'
                    + '<b class="' + (s.k[i] === 1 ? "en" : "") + '">' + s.k[i] + "</b>"
                    + '<button type="button" data-koef="' + i + '" data-d="-1" aria-label="Et mindre">−</button></span>'
                    + '<span class="ledformel">' + tekst + "</span>"
                    + '<button type="button" class="tilstknap' + (s.t[i] ? "" : " tom") + (ft ? " fejl" : "") + '" data-tilst="' + i + '">('
                    + (s.t[i] || "?") + ")</button></span>";
            }
            return led(0, ionT(P.kat)) + '<span class="op">+</span>' + led(1, ionT(P.an)) + '<span class="op pil">→</span>' + led(2, P.formel);
        },
        tabelMarker: markerBundfald,
        trin: [
            {
                navn: "Ionerne",
                spm: "Hvilke ioner er der i de to opløsninger? Klik på dem.",
                start: function (niv) {
                    var o = niv.o;
                    niv.s.fundneIoner = {};
                    niv.s.forkerte = {};
                    niv.s.chips = NK.bland(o.ioner.map(function (i) { return { ion: i, tekst: ionT(i) }; })
                        .concat(D.ionAtrapper(o)));
                },
                valg: function (niv) {
                    return '<div class="valg chips">' + niv.s.chips.map(function (c, i) {
                        var brugt = c.ion && niv.s.fundneIoner[c.ion.id], forkert = niv.s.forkerte[i];
                        return '<button class="ionknap' + (forkert ? " forkert" : "") + (brugt ? " brugt" : "") + '" type="button" data-i="' + i + '"'
                            + (brugt || forkert ? " disabled" : "") + ">" + c.tekst + "</button>";
                    }).join("") + "</div>";
                },
                valgKlik: function (niv, i) {
                    var o = niv.o, c = niv.s.chips[i];
                    if (c.ion) {
                        niv.s.fundneIoner[c.ion.id] = true;
                        /* Begge ioner fra ét salt: de dukker op i glasset. */
                        var S = D.saltMed(o, c.ion);
                        if (niv.s.fundneIoner[S.kat.id] && niv.s.fundneIoner[S.an.id]) niv.baeger.visIoner(S === o.A ? "A" : "B");
                        if (Object.keys(niv.s.fundneIoner).length === 4) {
                            niv.loes(false, "Rigtigt. Ionerne svømmer rundt hver for sig i opløsningerne.");
                            return;
                        }
                        niv.besked = { tekst: c.tekst + " er med i " + D.saltMed(o, c.ion).formel + ".", klasse: "god" };
                    } else {
                        niv.s.forkerte[i] = true;
                        niv.besked = { tekst: c.tekst + ": " + c.forklaring, klasse: "skidt" };
                    }
                    niv.vis();
                },
                hint: function () { return HINT_IONER; },
                vis: function (niv) {
                    niv.o.ioner.forEach(function (i) { niv.s.fundneIoner[i.id] = true; });
                    niv.loes(true, ionerVist(niv.o));
                },
                efter: function (niv) { niv.s.ionerKendt = true; niv.baeger.visIoner(); }
            },
            TRIN_BUNDFALD,
            {
                navn: "Formlen",
                spm: "Hvad er formlen for bundfaldet?",
                start: function (niv) {
                    var P = niv.o.P;
                    niv.s.forkerte = {};
                    niv.s.formelValg = NK.bland([{ tekst: P.formel, rigtig: true }].concat(D.formelVarianter(P).slice(0, 3)));
                },
                valg: function (niv) {
                    return '<div class="valg fire">' + niv.s.formelValg.map(function (v, i) {
                        var f = niv.s.forkerte[i];
                        return '<button class="valgknap formel' + (f ? " forkert" : "") + '" type="button" data-i="' + i + '"' + (f ? " disabled" : "") + ">" + v.tekst + "</button>";
                    }).join("") + "</div>";
                },
                valgKlik: function (niv, i) {
                    var v = niv.s.formelValg[i], P = niv.o.P;
                    if (v.rigtig) { niv.loes(false, "Rigtigt. " + D.hvorforFormel(P)); return; }
                    niv.s.forkerte[i] = true;
                    niv.besked = { tekst: v.tekst + ": " + v.forklaring, klasse: "skidt" };
                    niv.vis();
                },
                hint: function (niv) { return forklarLadninger(niv.o.P); },
                vis: function (niv) { niv.loes(true, "Svaret er " + niv.o.P.formel + ". " + D.hvorforFormel(niv.o.P)); },
                efter: function (niv) { niv.s.formelKendt = true; niv.baeger.navngiv(niv.o.P.formel + "(s)"); }
            },
            {
                navn: "Ionskemaet",
                spm: "Afstem ionskemaet, og vælg tilstandsform.",
                start: function (niv) { niv.s.k = [1, 1, 1]; niv.s.t = ["", "", ""]; },
                tavleKlik: function (niv, b) {
                    var s = niv.s;
                    if (b.hasAttribute("data-koef")) {
                        var i = +b.getAttribute("data-koef");
                        s.k[i] = NK.klamp(s.k[i] + (+b.getAttribute("data-d")), 1, 9);
                        if (s.fejlKoef) s.fejlKoef = null;
                    } else if (b.hasAttribute("data-tilst")) {
                        var j = +b.getAttribute("data-tilst");
                        s.t[j] = s.t[j] === "aq" ? "s" : "aq";
                        if (s.fejlTilst) s.fejlTilst[j] = false;
                    } else return;
                    niv.vis();
                },
                tjek: function (niv) {
                    var s = niv.s, P = niv.o.P;
                    var a = F.vurderAfstemning(P, s.k[0], s.k[1], s.k[2], s.t);
                    if (a.ok) { niv.loes(false, "Rigtigt. Ionskemaet viser kun de ioner, der danner bundfaldet."); return; }
                    s.fejlKoef = a.koef ? { 0: s.k[0] !== s.k[2] * P.p, 1: s.k[1] !== s.k[2] * P.n, 2: s.k[2] > 1 } : null;
                    s.fejlTilst = {};
                    (a.tilst || []).forEach(function (i) { s.fejlTilst[i] = true; });
                    niv.besked = { tekst: a.tekst, klasse: "skidt" };
                    niv.vis();
                },
                hint: function () {
                    return "Der skal være lige mange af hver ion på begge sider af pilen. Bundfaldet er et fast stof, og ionerne er opløst i vand.";
                },
                vis: function (niv) {
                    var P = niv.o.P;
                    niv.s.k = [P.p, P.n, 1];
                    niv.s.t = ["aq", "aq", "s"];
                    niv.loes(true, "Svaret: " + D.ionskema(P));
                },
                efter: function (niv) { niv.s.skemaFaerdigt = true; }
            }
        ]
    };

    /* =====================================================================
       SVÆR: SKRIV SELV
       ===================================================================== */
    var NIV_SKRIV = {
        id: "skriv",
        vaelgPar: vaelgEt,
        ionOmraade: function (niv, S, sid) {
            if (niv.s.ionerKendt) return niv.ionChips(S);
            return niv.felt(sid + "0", "", "ion") + niv.felt(sid + "1", "", "ion");
        },
        produkt: function (niv) { return produktFelt(niv, true); },
        skemaRaekke: function (niv) {
            if (niv.s.skemaFaerdigt) return faerdigtSkema(niv);
            if (niv.trin !== 3 || niv.faerdig) return "";
            var s = niv.s;
            function led(i, pladsholder) {
                var t = s.felt["t" + i] || "", ft = s.fejl["t" + i];
                var valg = ["", "aq", "s", "l", "g"].map(function (v) {
                    return '<option value="' + v + '"' + (t === v ? " selected" : "") + ">(" + (v || " ") + ")</option>";
                }).join("");
                return '<span class="led">'
                    + '<input type="text" class="koeffelt' + (s.fejl["k" + i] ? " fejl" : "") + '" data-felt="k' + i + '" value="'
                    + NK.html(s.felt["k" + i] || "") + '" inputmode="numeric" maxlength="2" aria-label="Tal foran" autocomplete="off">'
                    + niv.felt("f" + i, "", pladsholder)
                    + '<select class="tilstvalg' + (ft ? " fejl" : "") + '" data-felt="t' + i + '" aria-label="Tilstandsform">' + valg + "</select></span>";
            }
            return led(0, "ion") + '<span class="op">+</span>' + led(1, "ion") + '<span class="op pil">→</span>' + led(2, "bundfald");
        },
        tabelMarker: markerBundfald,
        trin: [
            {
                navn: "Ionerne",
                spm: "Skriv ionerne i de to opløsninger.",
                valg: function () { return LADNINGSKNAPPER; },
                tjek: function (niv) {
                    var o = niv.o, s = niv.s, foerste = null;
                    s.fejl = {};
                    [["A", o.A, o.B], ["B", o.B, o.A]].forEach(function (x) {
                        var sid = x[0], S = x[1], T = x[2], brugt = [];
                        [0, 1].forEach(function (i) { if (s.ok[sid + i]) brugt.push(D.ion(s.ok[sid + i])); });
                        [0, 1].forEach(function (i) {
                            var key = sid + i;
                            if (s.ok[key]) return;
                            var v = F.vurderIon(s.felt[key], { o: o, salt: S, forventet: [S.kat, S.an], brugt: brugt, andre: [T.kat, T.an] });
                            if (v.ok) { s.ok[key] = v.ion.id; brugt.push(v.ion); }
                            else {
                                s.fejl[key] = true;
                                if (!foerste) foerste = { key: key, tekst: s.felt[key] ? v.tekst : "Skriv begge ioner i " + S.formel + "." };
                            }
                        });
                    });
                    ["A", "B"].forEach(function (sid) { if (s.ok[sid + "0"] && s.ok[sid + "1"]) niv.baeger.visIoner(sid); });
                    if (!foerste) { niv.loes(false, "Rigtigt. Ionerne svømmer rundt hver for sig i opløsningerne."); return; }
                    niv.besked = { tekst: foerste.tekst, klasse: "skidt" };
                    niv.fokusFelt = foerste.key;
                    niv.vis();
                },
                hint: function () { return HINT_IONER + " Tast fx Fe3+ for Fe³⁺ eller brug ladningsknapperne."; },
                vis: function (niv) {
                    var o = niv.o;
                    [["A", o.A], ["B", o.B]].forEach(function (x) {
                        niv.s.felt[x[0] + "0"] = ionT(x[1].kat);
                        niv.s.felt[x[0] + "1"] = ionT(x[1].an);
                    });
                    niv.loes(true, ionerVist(o));
                },
                efter: function (niv) { niv.s.ionerKendt = true; niv.baeger.visIoner(); }
            },
            TRIN_BUNDFALD,
            {
                navn: "Formlen",
                spm: "Skriv formlen for bundfaldet.",
                valg: function () { return SKRIVNOTE; },
                tjek: function (niv) {
                    var P = niv.o.P;
                    var v = F.vurderSalt(niv.s.felt.P, P, { o: niv.o });
                    if (v.ok) { niv.loes(false, "Rigtigt. " + D.hvorforFormel(P)); return; }
                    niv.s.fejl = { P: true };
                    niv.besked = { tekst: v.tekst, klasse: "skidt" };
                    niv.fokusFelt = "P";
                    niv.vis();
                },
                hint: function (niv) { return forklarLadninger(niv.o.P); },
                vis: function (niv) {
                    niv.s.felt.P = niv.o.P.formel;
                    niv.loes(true, "Svaret er " + niv.o.P.formel + ". " + D.hvorforFormel(niv.o.P));
                },
                efter: function (niv) {
                    niv.s.formelKendt = true;
                    niv.s.felt.f2 = niv.o.P.formel;
                    niv.baeger.navngiv(niv.o.P.formel + "(s)");
                }
            },
            {
                navn: "Ionskemaet",
                spm: "Skriv ionskemaet med tal foran og tilstandsform.",
                valg: function () { return LADNINGSKNAPPER; },
                tjek: function (niv) {
                    var s = niv.s;
                    /* Et tal skrevet foran formlen flyttes over i talfeltet. */
                    [0, 1, 2].forEach(function (i) {
                        var r = F.laes(s.felt["f" + i]);
                        if (r.koef !== null && !s.felt["k" + i]) {
                            s.felt["k" + i] = String(r.koef);
                            s.felt["f" + i] = String(s.felt["f" + i]).replace(/^\s*\d+\s*/, "");
                        }
                    });
                    var led = [0, 1, 2].map(function (i) {
                        return { koef: s.felt["k" + i], tekst: s.felt["f" + i], tilst: s.felt["t" + i] || "" };
                    });
                    var v = F.vurderSkema(led, niv.o);
                    if (v.ok) { niv.loes(false, "Rigtigt. Ionskemaet viser kun de ioner, der danner bundfaldet."); return; }
                    s.fejl = {};
                    s.fejl[v.felt] = true;
                    niv.besked = { tekst: v.tekst, klasse: "skidt" };
                    if (v.felt.charAt(0) === "f") niv.fokusFelt = v.felt;
                    niv.vis();
                },
                hint: function () {
                    return "Skriv kun de to ioner, der danner bundfaldet. Tallene foran skal give lige mange af hver ion på begge sider af pilen.";
                },
                vis: function (niv) {
                    var P = niv.o.P, s = niv.s;
                    s.felt.k0 = P.p > 1 ? String(P.p) : ""; s.felt.f0 = ionT(P.kat); s.felt.t0 = "aq";
                    s.felt.k1 = P.n > 1 ? String(P.n) : ""; s.felt.f1 = ionT(P.an); s.felt.t1 = "aq";
                    s.felt.k2 = ""; s.felt.f2 = P.formel; s.felt.t2 = "s";
                    niv.loes(true, "Svaret: " + D.ionskema(P));
                },
                efter: function (niv) { niv.s.skemaFaerdigt = true; }
            }
        ]
    };

    NK.NIVEAUER = { tabel: NIV_TABEL, vaelg: NIV_VAELG, skriv: NIV_SKRIV };
}());
