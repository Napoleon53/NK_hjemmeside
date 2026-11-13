/* =====================================================================
   sedler.js - kortene, der aabner over scenen

   NK.Sedler.trin(rum, nr, sag, t) giver et trins kort:
     { titel, intro, handling, dele }
   intro     tegningen eller forsoeget oeverst paa kortet (HTML).
   handling  { noegle, tekst }: en knap, der udfoerer forsoeget, foer
             spoergsmaalet kommer (laeg paa vaegten, titrer).
   dele      de smaa bidder, trinet er hakket i. Hver del har
             { type, formel, data, spm, enhed, hint, vis, tjek(v) } og
             tjekkes for sig. tjek giver { ok, besked, gratis }.
             vis er linjen, der bliver staaende, naar delen er loest
             (en paen beregning: stoerrelse, formel, tal og resultat).
   Typer: tal, valg, ps (klik i det periodiske system), koef og sorter.

   bonus(), laas() og segl() giver bonusruten, kodelaasen og et segl.
   Haendelserne haandteres i app.js.
   ===================================================================== */
(function () {
    "use strict";

    var D = NK.D, h = NK.html, Sc = NK.Scener, S = NK.Sprites, Sag = NK.Sag;
    var Se = NK.Sedler = {};

    function stort(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
    function rgb(c) { return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")"; }
    function km(v, dec) { return NK.komma(v, dec); }
    /* Tre betydende cifre med komma: 0,0810 */
    function b3(v) { return Number(v).toPrecision(3).replace(".", ",").replace("-", "−"); }
    Se.b3 = b3;

    /* ----- Tal fra et svarfelt ------------------------------------------ */
    var OP = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁻": "-" };
    Se.tal = function (s) {
        s = String(s === undefined || s === null ? "" : s).trim().toLowerCase().replace(/\s+/g, "").replace(/,/g, ".").replace(/−/g, "-");
        s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/g, function (c) { return OP[c]; });
        s = s.replace(/[·*x×]10\^?\(?(-?\d+)\)?$/, "e$1");
        if (!/^-?(\d+\.?\d*|\.\d+)(e-?\d+)?$/.test(s)) return NaN;
        return Number(s);
    };
    function naer(x, svar, rel) { return Math.abs(x - svar) <= Math.abs(svar) * rel + 1e-12; }
    var IKKE = "Det er ikke rigtigt. Prøv igen, eller få et hint.";
    var SKRIV = "Skriv et tal i feltet.";

    /* En taldel: rigtig inden for rel (andel) eller abs. fejl: [[vaerdi, besked]]
       er de fejl, elever typisk laver. */
    function taldel(o) {
        o.type = "tal";
        o.tjek = function (v) {
            var x = Se.tal(v);
            if (isNaN(x)) return { ok: false, besked: SKRIV, gratis: true };
            if (o.abs !== undefined ? Math.abs(x - o.svar) <= o.abs + 1e-9 : naer(x, o.svar, o.rel || 0.015)) return { ok: true };
            var typisk = (o.fejl || []).filter(function (f) { return naer(x, f[0], 0.015); })[0];
            return { ok: false, besked: typisk ? typisk[1] : IKKE };
        };
        return o;
    }

    /* ===== Rum 1 ========================================================= */
    /* Draabepladen: en raekke pr. proeve og en soejle pr. reagens. */
    Se.labGitter = function (r, t) {
        var raekker = r.kendte.concat(["x"]);
        var s = '<table class="lab"><tr><th></th>' + D.LAB_REAGENSER.map(function (re) { return "<th>" + h(re.formel) + "</th>"; }).join("") + "</tr>";
        raekker.forEach(function (id) {
            var ion = id === "x" ? D.LAB_IONER[r.x] : D.LAB_IONER[id];
            var navn = id === "x" ? "Prøve X" : ion.formel;
            s += '<tr class="' + (id === "x" ? "x" : "") + '"><th>' + h(navn) + "</th>";
            D.LAB_REAGENSER.forEach(function (re) {
                var noegle = id + "-" + re.id, testet = !!(t.lab && t.lab[noegle]);
                var opl = ion.opl ? ' style="--opl:' + rgb(ion.opl) + '"' : "";
                if (!testet) {
                    s += '<td><button type="button" class="broend" data-broend="' + noegle + '"' + opl + ' aria-label="Dryp ' + h(re.formel) + " i " + h(navn) + '">Dryp</button></td>';
                } else {
                    var res = D.LAB[id === "x" ? r.x : id][re.id];
                    s += '<td><span class="broend testet' + (res ? " bundfald" : "") + '"' + opl + ">" +
                        (res ? '<i class="fnug" style="--bf:' + rgb(res.farve) + '"></i>' : "") +
                        '<span class="res">' + (res ? res.ord + " bundfald" : "intet bundfald") + "</span></span></td>";
                }
            });
            s += "</tr>";
        });
        return s + "</table>";
    };
    function resOrd(ion, re) { var x = D.LAB[ion][re]; return x ? x.ord + " bundfald" : "intet bundfald"; }

    /* Det periodiske system. klikbar: felterne er knapper (data-z). */
    Se.periodisk = function (klikbar, valgt) {
        var s = '<div class="ps' + (klikbar ? " klikbar" : "") + '" role="group" aria-label="Det periodiske system med atomnumre">';
        S.pladser().forEach(function (p) {
            var raekke = p.raekke > 7 ? p.raekke + 1 : p.raekke, ni = p.Z === 28;
            var stil = ' style="grid-column:' + p.kol + ";grid-row:" + raekke + ";background:" + p.farve + '"';
            var indre = "<small>" + p.Z + "</small><b>" + h(p.sym) + "</b>" +
                (ni ? '<svg class="overskaeg" viewBox="0 0 40 12" aria-hidden="true"><path d="M20 4 C14 -2 6 2 2 9 C8 6 14 8 20 6 C26 8 32 6 38 9 C34 2 26 -2 20 4 Z" fill="#3b2a1a"/></svg>' : "");
            if (klikbar) {
                s += '<button type="button" class="ps-felt' + (ni ? " ni" : "") + (valgt === p.Z ? " valgt" : "") + '" data-z="' + p.Z + '"' + stil + ' aria-label="' + h(p.sym) + ", atomnummer " + p.Z + '">' + indre + "</button>";
            } else {
                s += '<div class="ps-felt' + (ni ? " ni" : "") + '"' + stil + ">" + indre + "</div>";
            }
        });
        return s + '</div><p class="lille" id="ps-ni" aria-live="polite"></p>';
    };

    function atomer(f) {
        var u = {}, m, re = /([A-Z][a-z]?)(\d*)/g;
        f = f.replace(/\([a-z]+\)$/, "");
        while ((m = re.exec(f))) u[m[1]] = (u[m[1]] || 0) + (m[2] ? Number(m[2]) : 1);
        return u;
    }
    /* Tabel over atomerne paa hver side med elevens koefficienter. */
    function atomTabel(reak, k) {
        var v = {}, hh = {}, nv = reak.v.length;
        reak.v.forEach(function (f, i) { var a = atomer(f); Object.keys(a).forEach(function (x) { v[x] = (v[x] || 0) + a[x] * k[i]; }); });
        reak.h.forEach(function (f, i) { var a = atomer(f); Object.keys(a).forEach(function (x) { hh[x] = (hh[x] || 0) + a[x] * k[nv + i]; }); });
        return '<table class="tabel atomtabel"><tr><th>Atom</th><th>Venstre side</th><th>Højre side</th></tr>' +
            Object.keys(v).map(function (x) {
                var ens = v[x] === (hh[x] || 0);
                return '<tr class="' + (ens ? "ens" : "uens") + '"><td>' + x + "</td><td>" + v[x] + "</td><td>" + (hh[x] || 0) + "</td></tr>";
            }).join("") + "</table>";
    }

    function rum1(r, id, t) {
        var ion = D.LAB_IONER[r.x];
        if (id === "ion") return {
            titel: "Prøve X på dråbepladen",
            intro: "<p>Prøve X indeholder den samme metalion som én af de fire kendte prøver. Klik på en brønd for at dryppe reagenset i prøven.</p>" +
                '<div id="labgitter">' + Se.labGitter(r, t) + "</div>",
            dele: [{
                type: "valg",
                spm: "Hvilken metalion er i Prøve X?",
                muligheder: r.kendte.map(function (k) { return { v: k, tekst: D.LAB_IONER[k].formel }; }),
                hint: "Dryp alle fire reagenser i Prøve X. Dryp så i de kendte prøver, og find den række, der er magen til rækken for Prøve X.",
                svar: r.x,
                vis: "Prøve X indeholder <b>" + h(ion.formel) + "</b>. De to rækker på dråbepladen er ens.",
                tjek: function (v, tt) {
                    var mangler = D.LAB_REAGENSER.some(function (re) { return !(tt.lab && tt.lab["x-" + re.id]); });
                    if (mangler) return { ok: false, besked: "Dryp først alle fire reagenser i Prøve X.", gratis: true };
                    if (!v) return { ok: false, besked: "Vælg en af de fire metalioner.", gratis: true };
                    if (v === r.x) return { ok: true };
                    var re = D.LAB_REAGENSER.filter(function (q) { return resOrd(v, q.id) !== resOrd(r.x, q.id); })[0];
                    return { ok: false, besked: D.LAB_IONER[v].formel + " giver " + resOrd(v, re.id) + " med " + re.formel + ", men Prøve X giver " + resOrd(r.x, re.id) + "." };
                }
            }]
        };
        if (id === "z") return {
            titel: "Det periodiske system",
            intro: "<p>Prøve X indeholder " + h(ion.formel) + ". Atomnummeret står over symbolet.</p>",
            dele: [{
                type: "ps",
                spm: "Klik på metallet fra Prøve X i det periodiske system.",
                hint: "Metallet hedder " + ion.metal + " og har symbolet " + ion.sym + ".",
                svar: ion.Z,
                vis: stort(ion.metal) + ", " + ion.sym + ", har atomnummer <b>" + ion.Z + "</b>.",
                tjek: function (v) {
                    if (!v) return { ok: false, besked: "Klik på et grundstof i det periodiske system.", gratis: true };
                    if (Number(v) === ion.Z) return { ok: true };
                    return { ok: false, besked: "Det er " + D.SYMBOLER[v - 1] + ". Find symbolet " + ion.sym + "." };
                }
            }]
        };
        if (id === "afstem") return {
            titel: "Reaktionsskemaet på tavlen",
            intro: "",
            dele: [{
                type: "koef", reak: r.reaktion,
                spm: "Hvilke koefficienter afstemmer reaktionsskemaet?",
                data: "Skriv et tal foran hvert stof. Koefficienten 1 skal også skrives.",
                hint: "Tæl hvert slags atom på begge sider af pilen. Begynd med det atom, der står i færrest stoffer, og tag O og H til sidst.",
                svar: r.reaktion.k,
                vis: '<span class="skema">' + h(Sc.skemaTekst(r.reaktion, false, true)) + "</span>",
                tjek: function (v) {
                    var k = (v || []).map(function (x) { return Se.tal(x); });
                    if (k.length !== r.reaktion.k.length || k.some(function (x) { return !(x >= 1) || x !== Math.round(x); })) {
                        return { ok: false, besked: "Skriv et helt tal i alle felterne.", gratis: true };
                    }
                    if (k.join() === r.reaktion.k.join()) return { ok: true };
                    var f = k[0] / r.reaktion.k[0];
                    if (k.every(function (x, i) { return x === r.reaktion.k[i] * f; })) return { ok: false, besked: "Forholdet er rigtigt. Brug de mindste hele tal." };
                    return { ok: false, besked: "Der er ikke lige mange atomer på de to sider:" + atomTabel(r.reaktion, k) };
                }
            }]
        };
    }
    function bonus1(r) {
        return {
            titel: "Isotopen i Prøve X",
            html: "<p>Metalionen i Prøve X har nukleontallet <b>" + r.bonus.A + "</b>.</p>" +
                '<p class="spm">Hvor mange neutroner og hvor mange elektroner har ionen?</p>' +
                "<p>Guldkoden er antallet af neutroner efterfulgt af antallet af elektroner.</p>"
        };
    }

    /* ===== Rum 2 ========================================================= */
    function par(i, j) { return Math.min(i, j) + "-" + Math.max(i, j); }
    Se.par = par;
    function blandTekst(a, b) {
        var u = Sag.bland(a, b);
        if (u.umuligt) return "To faste stoffer kan ikke blandes til en opløsning.";
        if (u.etLag && u.fast) return stort(u.fast.navn) + " opløses i " + (u.fast === a ? b : a).navn + ". Der er ét lag.";
        if (u.etLag) return stort(a.navn) + " og " + b.navn + " blandes. Der er ét lag.";
        if (u.fast) return stort(u.fast.navn) + " opløses ikke i " + u.vaeske.navn + ". Krystallerne ligger på bunden.";
        return stort(a.navn) + " og " + b.navn + " blandes ikke. Der er to lag, og " + u.oeverst.navn + " ligger øverst.";
    }
    function blandGlas(a, b) {
        var lag = [], fast = null;
        if (a && b) {
            var u = Sag.bland(a, b);
            if (u.etLag) {
                var v1 = (u.fast ? (u.fast === a ? b : a) : a).farve, v2 = u.fast ? v1 : b.farve;
                lag = [{ farve: [0, 1, 2].map(function (i) { return Math.round((v1[i] + v2[i]) / 2); }), andel: 0.6 }];
            } else if (u.fast) { lag = [{ farve: u.vaeske.farve, andel: 0.5 }]; fast = u.fast.farve; }
            else lag = [{ farve: u.nederst.farve, andel: 0.3 }, { farve: u.oeverst.farve, andel: 0.3 }];
        }
        return '<svg viewBox="-60 -190 120 200" width="96" height="160" aria-hidden="true">' + S.defs() +
            '<rect x="-52" y="-186" width="104" height="186" rx="8" fill="#ffffff" stroke="#c9d0d8" stroke-width="2"/>' +
            S.paa(0, -6, 1, S.reagensglas(165, lag, fast)) + "</svg>";
    }
    /* Blandebordet: seks flasker, et reagensglas og listen over forsoeg. */
    Se.blandebord = function (r, t) {
        var valg = t.blandValg || [], sidst = t.blandSidst || null;
        var s = '<div class="blandebord"><div class="stoffer">' + r.stoffer.map(function (st, i) {
            var kl = "stof" + (valg.indexOf(i) >= 0 ? " valgt" : "") + (sidst && sidst.indexOf(i) >= 0 && !valg.length ? " sidst" : "");
            return '<button type="button" class="' + kl + '" data-stof="' + i + '"><i style="background:' + rgb(st.farve) + '"></i>' + h(stort(st.navn)) + (st.fast ? " (fast stof)" : "") + "</button>";
        }).join("") + "</div>";
        var a = sidst ? r.stoffer[sidst[0]] : null, b = sidst ? r.stoffer[sidst[1]] : null;
        s += '<div class="glasfelt">' + blandGlas(a, b) + '<p class="blandtekst" aria-live="polite">' +
            (valg.length === 1 ? "Vælg ét stof mere." : a ? h(blandTekst(a, b)) : "Vælg to stoffer. Så blandes de i reagensglasset.") + "</p></div>";
        var gjort = Object.keys(t.bland || {});
        if (gjort.length) {
            s += '<div class="blandet">' + gjort.map(function (k) {
                var ij = k.split("-"), x = r.stoffer[ij[0]], y = r.stoffer[ij[1]], u = Sag.bland(x, y);
                return '<span class="' + (u.etLag ? "et" : "to") + '">' + h(x.navn + " + " + y.navn + ": " + (u.etLag ? "ét lag" : (u.fast ? "opløses ikke" : "to lag"))) + "</span>";
            }).join("") + "</div>";
        }
        return s + "</div>";
    };

    function enLinje(molekyler) {
        var at = {};
        molekyler.forEach(function (m) { m.t.a.forEach(function (a) { at[a[0]] = true; }); });
        return ["H", "C", "N", "O", "Cl"].filter(function (a) { return at[a]; })
            .map(function (a) { return a + " " + km(D.EN[a], 1); }).join(" · ");
    }
    function sorterDel(o) {
        o.type = "sorter";
        o.tjek = function (v) {
            v = v || {};
            if (o.emner.some(function (e) { return !e.laast && v[e.id] === undefined; })) return { ok: false, besked: o.manglerTekst, gratis: true };
            var forkert = o.emner.filter(function (e) { return !e.laast && !!v[e.id] !== e.polaer; })[0];
            return forkert ? { ok: false, besked: o.fejlTekst(forkert) } : { ok: true };
        };
        return o;
    }
    function rum2(r, id, t) {
        if (id === "bland") {
            var upol = r.stoffer.filter(function (s) { return !s.polaer; });
            return {
                titel: "Væskerne på bordet", bred: true,
                intro: "<p>Bland stofferne to og to. Polære stoffer blandes med polære, og upolære med upolære.</p>" +
                    '<div id="blandebord">' + Se.blandebord(r, t) + "</div>",
                dele: [sorterDel({
                    spm: "Hvilke af de seks stoffer er polære, og hvilke er upolære?",
                    emner: r.stoffer.map(function (s, i) { return { id: "s" + i, navn: stort(s.navn), polaer: s.polaer, laast: s.navn === "vand" }; }),
                    hint: "Vand er polært. Et stof, der blandes med vand til ét lag, er polært. Et stof, der lægger sig i sit eget lag, er upolært.",
                    manglerTekst: "Vælg polær eller upolær for alle seks stoffer.",
                    fejlTekst: function (e) { return "Se på " + e.navn.toLowerCase() + " igen. Bland stoffet med vand, og se, om der bliver ét lag eller to."; },
                    svar: null,
                    vis: "Upolære: " + h(upol.map(function (s) { return s.navn; }).join(", ")) + ". Det er <b>" + upol.length + "</b> stoffer."
                })]
            };
        }
        if (id === "polaer") {
            var pol = r.molekyler.filter(function (m) { return m.polaer; });
            return {
                titel: "Fem molekyler på tavlen", bred: true,
                intro: '<p class="lille">Kilen peger mod jer, og den stiplede streg peger væk fra jer. Elektronegativitet: ' + enLinje(r.molekyler) + "</p>",
                dele: [sorterDel({
                    spm: "Hvilke af de fem molekyler er polære?",
                    gitter: true,
                    emner: r.molekyler.map(function (m, i) { return { id: "m" + i, navn: m.formel, polaer: m.polaer, figur: S.molekyle(m.t, 160, 120), fordi: m.fordi }; }),
                    hint: "Et molekyle er polært, når det har polære bindinger og ikke er symmetrisk. En forskel i elektronegativitet under 0,5 giver en upolær binding.",
                    manglerTekst: "Vælg polær eller upolær for alle fem molekyler.",
                    fejlTekst: function (e) { return "Se på " + e.navn + " igen. " + e.fordi; },
                    svar: null,
                    vis: "Polære: " + h(pol.map(function (m) { return m.formel; }).join(", ")) + ". Det er <b>" + pol.length + "</b> molekyler."
                })]
            };
        }
        if (id === "streger") return {
            titel: "Flasken på hylden",
            intro: "<p>Etiketten siger <b>" + h(r.streg.formel) + "</b>, " + h(r.streg.navn) + ". Tegn stregformlen på papir. En dobbeltbinding er to streger.</p>",
            dele: [taldel({
                spm: "Hvor mange streger er der mellem atomerne i stregformlen for " + h(r.streg.formel) + "?",
                enhed: "streger", svar: r.streg.streger, abs: 0,
                hint: "H har én binding, O to, N tre og C fire. Er der ikke bindinger nok, bruges en dobbelt- eller tripelbinding.",
                vis: "Stregformlen for " + h(r.streg.formel) + " har <b>" + r.streg.streger + "</b> streger."
            })]
        };
    }
    function bonus2(r) {
        var m = r.bonus.molekyler;
        return {
            titel: "To stregformler",
            html: "<p>Tegn stregformlerne for " + h(m[0].navn) + ", <b>" + h(m[0].formel) + "</b>, og " + h(m[1].navn) + ", <b>" + h(m[1].formel) +
                "</b>, så alle atomer opfylder oktetreglen (hydrogen dubletreglen).</p>" +
                '<p class="spm">Hvor mange streger og hvor mange frie elektronpar har hvert molekyle?</p>' +
                "<p>Guldkoden er de fire tal: streger og frie elektronpar for " + h(m[0].navn) + ", og så for " + h(m[1].navn) + ".</p>"
        };
    }

    /* ===== Rum 3 ========================================================= */
    function mini(viewBox, b, hh, tegning) {
        return '<svg class="mini" viewBox="' + viewBox + '" width="' + b + '" height="' + hh + '" aria-hidden="true">' + S.defs() + tegning + "</svg>";
    }
    function rum3(r, id, t) {
        var met = r.metal, f = met.forhold;
        var nM = b3(r.nMetal), nH = b3(r.nH2);
        if (id === "info") return {
            titel: "Tavlen", info: true,
            intro: '<p class="skema">' + h(met.skema) + "</p>" +
                '<p class="data">M(' + met.sym + ") = " + km(met.M, 2) + " g/mol&emsp;R = 0,08314 L · bar / (mol · K)</p>" +
                "<p>Tavlen viser reaktionen mellem " + h(met.navn) + " og saltsyre. Tallene bruges i de tre trin.</p>"
        };
        if (id === "vej") {
            var vejet = !!(t.handl && t.handl["3:vej"]);
            return {
                titel: "Vægten",
                intro: '<div class="forsoeg">' + mini("-150 -150 300 160", 240, 128, S.paa(0, 0, 1, S.vaegt(vejet ? km(r.m, 2) + " g" : "0,00 g", vejet ? met.sym : null))) +
                    "<p>" + (vejet ? "Vægten viser <b>" + km(r.m, 2) + " g</b> " + h(met.form) + "." : stort(met.form) + " ligger klar ved siden af vægten.") + "</p></div>",
                handling: { noegle: "3:vej", tekst: "Læg metallet på vægten" },
                dele: [taldel({
                    formel: "n = m / M",
                    data: "m = " + km(r.m, 2) + " g&emsp;M(" + met.sym + ") = " + km(met.M, 2) + " g/mol",
                    spm: "Hvad er stofmængden af " + h(met.navn) + "?",
                    enhed: "mol", svar: r.nMetal,
                    fejl: [[r.m * met.M, "Stofmængden er massen divideret med molarmassen. Her er de ganget sammen."], [met.M / r.m, "Brøken er vendt om: massen skal stå øverst."]],
                    hint: "Divider massen med molarmassen: " + km(r.m, 2) + " g divideret med " + km(met.M, 2) + " g/mol.",
                    vis: "n(" + met.sym + ") = m / M = " + km(r.m, 2) + " g / " + km(met.M, 2) + " g/mol = <b>" + nM + " mol</b>"
                })]
            };
        }
        if (id === "gas") {
            var haeldt = !!(t.handl && t.handl["3:gas"]);
            return {
                titel: "Kolben med saltsyre",
                intro: '<div class="forsoeg">' + mini("-110 -260 420 270", 250, 160, S.paa(0, 0, 1, S.kolbe(150, 160, [202, 224, 244], 0.42, haeldt)) + S.paa(0, -160, 0.8, S.gassproejte(haeldt ? 0.8 : 0))) +
                    "<p>" + (haeldt ? "Metallet reagerer med saltsyren. Det bobler, og dihydrogen samles i sprøjten, til alt metallet er væk." : "Kolben indeholder rigeligt saltsyre til alt metallet.") + "</p></div>" +
                    '<p class="skema">' + h(met.skema) + "</p>",
                handling: { noegle: "3:gas", tekst: "Hæld metallet i saltsyren" },
                dele: [taldel({
                    data: "n(" + met.sym + ") = " + nM + " mol",
                    spm: "Hvor mange mol dihydrogen dannes?",
                    enhed: "mol", svar: r.nH2,
                    fejl: f[0] === f[1] ? [] : [[r.nMetal, "Se på koefficienterne i skemaet: " + f[0] + " " + met.sym + " giver " + f[1] + " H₂."], [r.nMetal * f[0] / f[1], "Forholdet er vendt om: der dannes mere H₂, end der er " + met.sym + "."]],
                    hint: f[0] === f[1] ? "Skemaet viser, at 1 " + met.sym + " giver 1 H₂. De to stofmængder er derfor lige store."
                        : "Skemaet viser, at " + f[0] + " " + met.sym + " giver " + f[1] + " H₂. Gang stofmængden af " + met.sym + " med " + f[1] + " og divider med " + f[0] + ".",
                    vis: "n(H₂) = " + (f[0] === f[1] ? "n(" + met.sym + ")" : f[1] + "/" + f[0] + " · n(" + met.sym + ")") + " = <b>" + nH + " mol</b>"
                })]
            };
        }
        if (id === "rumfang") return {
            titel: "Vejrstationen",
            intro: "<p>Termometeret viser <b>" + r.t + " °C</b>, og barometeret viser <b>" + km(r.p, 3) + " bar</b>.</p>",
            dele: [
                taldel({
                    formel: "T = t + 273,15 K",
                    spm: "Hvad er temperaturen i kelvin?",
                    enhed: "K", svar: r.T, abs: 0.2,
                    hint: "Læg 273,15 til temperaturen i °C: " + r.t + " + 273,15.",
                    vis: "T = " + r.t + " °C + 273,15 = <b>" + km(r.T, 2) + " K</b>"
                }),
                taldel({
                    formel: "V = n · R · T / p",
                    data: "n(H₂) = " + nH + " mol&emsp;R = 0,08314 L · bar / (mol · K)&emsp;T = " + km(r.T, 2) + " K&emsp;p = " + km(r.p, 3) + " bar",
                    spm: "Hvad er rumfanget af dihydrogen? Svar med to decimaler.",
                    enhed: "L", svar: r.V, abs: 0.011,
                    fejl: [[r.nH2 * D.R * r.t / r.p, "Temperaturen skal stå i kelvin, ikke i °C."], [r.nH2 * D.R * r.T * r.p, "Der skal divideres med trykket, ikke ganges."]],
                    hint: "Gang n, R og T sammen, og divider med p: " + nH + " · 0,08314 · " + km(r.T, 2) + " / " + km(r.p, 3) + ".",
                    vis: "V(H₂) = n · R · T / p = " + nH + " mol · 0,08314 L · bar / (mol · K) · " + km(r.T, 2) + " K / " + km(r.p, 3) + " bar = <b>" + km(r.V, 2) + " L</b>"
                })
            ]
        };
    }
    function bonus3(r) {
        var met = r.metal;
        return {
            titel: "For lidt syre",
            html: "<p>Niller har også en lille flaske med kun <b>" + km(r.bonus.vHCl, 0) + " mL " + km(r.bonus.cHCl, r.bonus.cHCl < 1 ? 3 : 2) + " M saltsyre</b>. " +
                "Forestil jer, at metallet fra vægten kommes i den flaske i stedet for i kolben.</p>" +
                '<p class="spm">Hvor mange gram ' + h(met.navn) + " er der tilbage, når al syren har reageret?</p>" +
                "<p>Massen står på vægten, og reaktionsskemaet og molarmassen står på tavlen. Svar med to decimaler.</p>"
        };
    }

    /* ===== Rum 4 og 5: titreringen ======================================= */
    function titrerTegning(vaeske, foer, efter, titreret) {
        return mini("-110 -480 300 490", 150, 245,
            S.paa(0, 0, 1, S.burette(300, vaeske, titreret ? 1 : 0)) + S.paa(0, -14, 1, S.kolbe(124, 112, titreret ? efter : foer, 0.4)));
    }
    function Lt(mL, dec) { return km(mL / 1000, dec); }
    function rum4(r, id, t) {
        var sy = r.syre, ba = r.base, titreret = !!(t.handl && t.handl["4:titrer"]);
        var cB = km(r.cBase, r.cBase < 0.1 ? 4 : 3), nB = b3(r.nBase), cS = b3(r.cSyre);
        if (id === "titrer") return {
            titel: "Titreringen",
            intro: '<div class="forsoeg">' + titrerTegning([202, 224, 244], [202, 224, 244], [250, 190, 214], titreret) +
                "<div><p>Buretten indeholder <b>" + cB + " M " + h(ba.navn) + "</b>. Kolben indeholder " + km(r.Vsyre, 1) + " mL " + h(sy.navn) + " og nogle dråber phenolphthalein.</p>" +
                '<table class="tabel"><tr><td>Aflæst før titreringen</td><td><b>' + km(r.foer, 2) + " mL</b></td></tr>" +
                "<tr><td>Aflæst ved omslag</td><td><b>" + (titreret ? km(r.efter, 2) + " mL" : "?") + "</b></td></tr></table>" +
                (titreret ? "<p>Kolben er blevet svagt lyserød. Det er omslaget: al syren har reageret.</p>" : "") + "</div></div>",
            handling: { noegle: "4:titrer", tekst: "Titrer til omslag" },
            dele: [taldel({
                formel: "forbrug = aflæst ved omslag − aflæst før",
                spm: "Hvad er forbruget af " + h(ba.navn) + "?",
                enhed: "mL", svar: r.forbrug, abs: 0.006,
                fejl: [[r.efter, "Buretten var ikke fyldt til 0. Træk aflæsningen før titreringen fra."]],
                hint: "Træk de to aflæsninger fra hinanden: " + km(r.efter, 2) + " mL minus " + km(r.foer, 2) + " mL.",
                vis: "Forbrug = " + km(r.efter, 2) + " mL − " + km(r.foer, 2) + " mL = <b>" + km(r.forbrug, 2) + " mL</b>"
            })]
        };
        if (id === "konc") return {
            titel: "Koncentrationen af " + sy.bestemt,
            intro: '<p class="skema">' + h(sy.formel + "(aq) + " + ba.formel + "(aq) → " + ba.kation + NK.formel(sy.anion) + "(aq) + H₂O(l)") + "</p>",
            dele: [
                taldel({
                    formel: "n = c · V",
                    data: "c(" + ba.formel + ") = " + cB + " M&emsp;V(" + ba.formel + ") = " + km(r.forbrug, 2) + " mL = " + Lt(r.forbrug, 5) + " L",
                    spm: "Hvor mange mol " + h(ba.navn) + " blev der brugt?",
                    enhed: "mol", svar: r.nBase,
                    fejl: [[r.nBase * 1000, "Rumfanget skal stå i liter: " + km(r.forbrug, 2) + " mL = " + Lt(r.forbrug, 5) + " L."]],
                    hint: "Gang koncentrationen med rumfanget i liter: " + cB + " M · " + Lt(r.forbrug, 5) + " L.",
                    vis: "n(" + ba.formel + ") = c · V = " + cB + " M · " + Lt(r.forbrug, 5) + " L = <b>" + nB + " mol</b>"
                }),
                taldel({
                    formel: "c = n / V",
                    data: "Syren og basen reagerer 1 : 1, så n(" + sy.formel + ") = " + nB + " mol&emsp;V(" + sy.formel + ") = " + km(r.Vsyre, 1) + " mL = " + Lt(r.Vsyre, 4) + " L",
                    spm: "Hvad er koncentrationen af " + h(sy.bestemt) + "?",
                    enhed: "M", svar: r.cSyre,
                    fejl: [[r.cSyre / 1000, "Rumfanget skal stå i liter: " + km(r.Vsyre, 1) + " mL = " + Lt(r.Vsyre, 4) + " L."], [r.nBase * r.Vsyre / 1000, "Der skal divideres med rumfanget, ikke ganges."]],
                    hint: "Divider stofmængden med rumfanget i liter: " + nB + " mol divideret med " + Lt(r.Vsyre, 4) + " L.",
                    vis: "c(" + sy.formel + ") = n / V = " + nB + " mol / " + Lt(r.Vsyre, 4) + " L = <b>" + cS + " M</b>"
                })
            ]
        };
        if (id === "ph") return {
            titel: "pH i " + sy.bestemt,
            intro: "<p>" + stort(sy.navn) + " er en stærk syre. Alle syremolekylerne har afgivet en hydron, så [H₃O⁺] = c(" + sy.formel + ") = " + cS + " M.</p>",
            dele: [taldel({
                formel: "pH = −log[H₃O⁺]",
                spm: "Hvad er pH i " + h(sy.bestemt) + "? Svar med to decimaler.",
                enhed: "", svar: r.pH, abs: 0.011,
                fejl: [[-r.pH, "Husk minusset foran logaritmen."], [-Math.log(r.cSyre), "Brug log (titalslogaritmen), ikke ln."]],
                hint: "Tast −log(" + cS + ") på lommeregneren.",
                vis: "pH = −log(" + cS + ") = <b>" + km(r.pH, 2) + "</b>"
            })]
        };
    }
    function bonus4(r) {
        var ba = r.base, sy = r.syre;
        return {
            titel: "Midt i titreringen",
            html: "<p>Kolben indeholdt " + km(r.Vsyre, 1) + " mL " + h(sy.navn) + ", og basen er " + km(r.cBase, r.cBase < 0.1 ? 4 : 3) + " M " + h(ba.navn) + ". Forbruget finder I ved at titrere.</p>" +
                '<p class="spm">Hvad var pH i kolben, da der var tilsat ' + r.bonus.x + " mL " + h(ba.navn) + "?</p>" +
                "<p>Syren var da i overskud, og rumfanget i kolben var blevet større. Svar med to decimaler.</p>"
        };
    }

    function rum5(r, id, t) {
        var red = r.redox, titreret = !!(t.handl && t.handl["5:titrer"]);
        var nMn = b3(r.nMn), nP = b3(r.nProeve), f = red.forhold;
        var foer = red.id === "fe" ? [214, 236, 214] : [202, 224, 244];
        if (id === "titrer") return {
            titel: "Titreringen",
            intro: '<div class="forsoeg">' + titrerTegning([128, 40, 132], foer, [226, 190, 232], titreret) +
                "<div><p>Buretten indeholder <b>" + km(r.cMn, 4) + " M kaliumpermanganat</b>. Kolben indeholder " + km(r.Vproeve, 1) + " mL " + h(red.proeve) + " tilsat svovlsyre.</p>" +
                (titreret ? "<p>Den violette farve forsvandt, så længe der var " + h(red.stof) + " i kolben. Nu bliver kolben svagt violet: det er omslaget.</p>" +
                    "<p>Forbruget af kaliumpermanganat er <b>" + km(r.Vmn, 2) + " mL</b>.</p>" : "") + "</div></div>",
            handling: { noegle: "5:titrer", tekst: "Titrer til omslag" },
            dele: [taldel({
                formel: "n = c · V",
                data: "c(MnO₄⁻) = " + km(r.cMn, 4) + " M&emsp;V(MnO₄⁻) = " + km(r.Vmn, 2) + " mL = " + Lt(r.Vmn, 5) + " L",
                spm: "Hvor mange mol permanganat blev der brugt?",
                enhed: "mol", svar: r.nMn,
                fejl: [[r.nMn * 1000, "Rumfanget skal stå i liter: " + km(r.Vmn, 2) + " mL = " + Lt(r.Vmn, 5) + " L."]],
                hint: "Gang koncentrationen med rumfanget i liter: " + km(r.cMn, 4) + " M · " + Lt(r.Vmn, 5) + " L.",
                vis: "n(MnO₄⁻) = c · V = " + km(r.cMn, 4) + " M · " + Lt(r.Vmn, 5) + " L = <b>" + nMn + " mol</b>"
            })]
        };
        if (id === "forhold") return {
            titel: "Reaktionsskemaet på tavlen",
            intro: '<p class="skema">' + h(red.skema) + "</p>",
            dele: [taldel({
                data: "n(MnO₄⁻) = " + nMn + " mol",
                spm: "Hvor mange mol " + h(red.stof) + " var der i prøven?",
                enhed: "mol", svar: r.nProeve,
                fejl: [[r.nMn, "Se på koefficienterne i skemaet: " + f[0] + " MnO₄⁻ reagerer med " + f[1] + " " + red.stof + "."], [r.nMn * f[0] / f[1], "Forholdet er vendt om: der er mere " + red.stof + " end MnO₄⁻."]],
                hint: "Skemaet viser, at " + f[0] + " MnO₄⁻ reagerer med " + f[1] + " " + red.stof + ". Gang stofmængden af MnO₄⁻ med " + f[1] + (f[0] === 1 ? "." : " og divider med " + f[0] + "."),
                vis: "n(" + red.stof + ") = " + (f[0] === 1 ? f[1] : f[1] + "/" + f[0]) + " · n(MnO₄⁻) = <b>" + nP + " mol</b>"
            })]
        };
        if (id === "konc") return {
            titel: "Koncentrationen af " + red.stof,
            intro: "",
            dele: [taldel({
                formel: "c = n / V",
                data: "n(" + red.stof + ") = " + nP + " mol&emsp;V(prøve) = " + km(r.Vproeve, 1) + " mL = " + Lt(r.Vproeve, 4) + " L",
                spm: "Hvad er koncentrationen af " + h(red.stof) + " i prøven? Svar med tre decimaler.",
                enhed: "M", svar: r.c, abs: 0.0011,
                fejl: [[r.c / 1000, "Rumfanget skal stå i liter: " + km(r.Vproeve, 1) + " mL = " + Lt(r.Vproeve, 4) + " L."]],
                hint: "Divider stofmængden med rumfanget i liter: " + nP + " mol divideret med " + Lt(r.Vproeve, 4) + " L.",
                vis: "c(" + red.stof + ") = n / V = " + nP + " mol / " + Lt(r.Vproeve, 4) + " L = <b>" + km(r.c, 3) + " M</b>"
            })]
        };
    }
    function bonus5(r) {
        var red = r.redox, b = r.bonus;
        return {
            titel: "Masseprocent",
            html: "<p>Prøven blev lavet af <b>" + km(b.mProeve, 2) + " g " + h(red.materiale) + "</b>, som blev " + (red.id === "fe" ? "opløst i syre og fortyndet" : "fortyndet") +
                " til " + km(b.Vkolbe, 1) + " mL. Heraf blev " + km(r.Vproeve, 1) + " mL titreret med " + km(r.cMn, 4) + " M kaliumpermanganat. Forbruget finder I ved at titrere.</p>" +
                '<p class="spm">Hvor mange masseprocent ' + h(red.bonusStof) + " indeholder " + (red.id === "fe" ? "ståluldet" : "opløsningen i flasken") + "?</p>" +
                "<p>M(" + red.Mnavn + ") = " + km(red.M, 2) + " g/mol. Reaktionsskemaet står på tavlen. Svar " + (red.pctDec ? "med én decimal" : "i hele procent") + ".</p>"
        };
    }

    /* ===== Faelles indgange ============================================== */
    var RUM = [null, rum1, rum2, rum3, rum4, rum5];
    var BONUS = [null, bonus1, bonus2, bonus3, bonus4, bonus5];

    /* Et trins kort ud fra tingen (data-spor) eller trinets id. */
    Se.trin = function (rum, id, sag, t) {
        var k = RUM[rum](sag.rum[rum], id, t);
        if (k) k.dele = k.dele || [];
        return k || null;
    };
    Se.bonus = function (rum, sag) {
        var k = BONUS[rum](sag.rum[rum]);
        k.etiket = "Bonusrute";
        return k;
    };

    /* Svarfeltet til en del. valg er det, eleven har valgt indtil nu. */
    Se.widget = function (del, valg) {
        if (del.type === "tal") {
            return '<div class="talrad"><input type="text" class="talfelt" id="svarfelt" inputmode="decimal" autocomplete="off" aria-label="Svar">' +
                (del.enhed ? '<span class="enhed">' + h(del.enhed) + "</span>" : "") + "</div>";
        }
        if (del.type === "valg") {
            return '<div class="valgrad">' + del.muligheder.map(function (m) {
                return '<button type="button" class="valg' + (valg === m.v ? " valgt" : "") + '" data-valg="' + h(m.v) + '">' + h(m.tekst) + "</button>";
            }).join("") + "</div>";
        }
        if (del.type === "ps") return Se.periodisk(true, valg);
        if (del.type === "koef") {
            var i = 0, reak = del.reak;
            var led = function (f) { i++; return '<input type="text" class="koef" inputmode="numeric" maxlength="2" autocomplete="off" aria-label="Koefficient ' + i + '"> ' + h(NK.formel(f)); };
            return '<p class="skema koefskema">' + reak.v.map(led).join(" + ") + " → " + reak.h.map(led).join(" + ") + "</p>";
        }
        if (del.type === "sorter") {
            valg = valg || {};
            return '<div class="sorter' + (del.gitter ? " gitter" : "") + '">' + del.emner.map(function (e) {
                var v = e.laast ? e.polaer : valg[e.id];
                return '<div class="emne">' + (e.figur ? "<figure>" + e.figur + "</figure>" : "") + '<span class="emnenavn">' + h(e.navn) + "</span>" +
                    '<span class="toknap">' +
                    '<button type="button" class="sv' + (v === true ? " valgt" : "") + '" data-emne="' + e.id + '" data-v="1"' + (e.laast ? " disabled" : "") + ">Polær</button>" +
                    '<button type="button" class="sv' + (v === false ? " valgt" : "") + '" data-emne="' + e.id + '" data-v="0"' + (e.laast ? " disabled" : "") + ">Upolær</button></span></div>";
            }).join("") + "</div>";
        }
        return "";
    };

    /* ----- Kodelaasen --------------------------------------------------- */
    function bokse(maske, vaerdi, laast, navn, kl) {
        var n = 0;
        return maske.split("").map(function (c) {
            if (c === "#") {
                var v = (vaerdi.charAt(n) || "").trim();
                n++;
                return '<input class="ciffer' + (kl ? " " + kl : "") + '" type="text" inputmode="numeric" maxlength="1" autocomplete="off" value="' + v + '"' +
                    (laast ? " disabled" : "") + ' aria-label="' + h(navn) + ", ciffer " + n + '">';
            }
            return c === " " ? '<span class="mellem"></span>' : '<span class="fast">' + h(c) + "</span>";
        }).join("");
    }
    /* De cifre, de loeste trin har givet indtil nu (tomme pladser som mellemrum). */
    Se.fundet = function (r, t, rum) {
        return r.trin.map(function (tr) {
            return t.trin && t.trin[rum + ":" + tr.id] ? tr.cifre : tr.cifre.replace(/./g, " ");
        }).join("");
    };
    Se.laas = function (rum, sag, t) {
        var r = sag.rum[rum], aaben = t.naaet > rum, guld = !!(t.guld && t.guld[rum]);
        var fundet = aaben ? r.kode : Se.fundet(r, t, rum);
        var mangler = !aaben && /\s/.test(fundet);
        var s = '<div class="laas">' +
            '<div class="laasdel' + (aaben ? " aaben" : "") + '" data-raekke="kode"><span class="felt-navn">' + D.LAAS.kode +
            (mangler ? '<small>' + D.LAAS.mangler + "</small>" : "") + '</span><span class="cifre">' +
            bokse(r.kodeMaske, fundet, aaben, D.LAAS.kode) + "</span></div>" +
            '<div class="laasdel guld' + (guld ? " aaben" : "") + '" data-raekke="guld"><span class="felt-navn"><b>★ ' + D.LAAS.guld + "</b></span>" +
            r.bonus.felter.map(function (f) {
                return '<div class="guldfelt"><span>' + h(f.navn) + '</span><span class="cifre">' + bokse(f.maske, guld ? f.svar : "", guld, f.navn, "g") + "</span></div>";
            }).join("") + "</div></div>";
        return { etiket: "Rum " + rum, titel: "Kodelås", html: s, laas: true, aaben: aaben, guld: guld };
    };

    /* ----- Seglene ------------------------------------------------------ */
    Se.segl = function (sg, brudt) {
        var T = D.SEGL_TEKST;
        var s = '<p class="spm">' + h(sg.spm) + "</p>";
        if (brudt) {
            s += '<p class="ok">' + T.brudt + " Titlen var <b>" + h(stort(sg.svar)) + "</b>.</p>";
        } else {
            s += '<div class="seglfelt"><input type="text" id="seglsvar" autocomplete="off" placeholder="' + T.felt + '" aria-label="' + T.felt + '"></div>' +
                '<p class="svar-linje" id="seglbesked" aria-live="polite"></p>';
        }
        s += '<p class="lille"><a href="' + h(sg.sti) + '" target="_blank" rel="noopener">' + h(T.aabn(sg.spil)) + "</a></p>";
        return { etiket: "Segl", titel: sg.spil, html: s, segl: sg.id, brudt: brudt };
    };
}());
