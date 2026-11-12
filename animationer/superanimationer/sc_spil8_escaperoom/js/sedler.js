/* =====================================================================
   sedler.js - kortene, der aabner over scenen

   NK.Sedler.spor(rum, id, sag, t) giver { etiket, titel, html, note }
   for en ting i et rum. laas() og segl() giver kodelaasen og et segl.
   Haendelserne (dryp, cifre, noter) haandteres i app.js.
   ===================================================================== */
(function () {
    "use strict";

    var D = NK.D, h = NK.html, Sc = NK.Scener;
    var Se = NK.Sedler = {};

    function stort(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
    function rgb(c) { return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")"; }

    /* ----- Rum 1 ------------------------------------------------------- */
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

    Se.periodisk = function () {
        var s = '<div class="ps" role="img" aria-label="Det periodiske system med atomnumre">';
        NK.Sprites.pladser().forEach(function (p) {
            var raekke = p.raekke > 7 ? p.raekke + 1 : p.raekke;
            var ni = p.Z === 28;
            s += '<div class="ps-felt' + (ni ? " ni" : "") + '" style="grid-column:' + p.kol + ";grid-row:" + raekke + ";background:" + p.farve + '"' +
                (ni ? ' data-ni="1" role="button" tabindex="0"' : "") + ">" +
                "<small>" + p.Z + "</small><b>" + h(p.sym) + "</b>" +
                (ni ? '<svg class="overskaeg" viewBox="0 0 40 12" aria-hidden="true"><path d="M20 4 C14 -2 6 2 2 9 C8 6 14 8 20 6 C26 8 32 6 38 9 C34 2 26 -2 20 4 Z" fill="#3b2a1a"/></svg>' : "") +
                "</div>";
        });
        return s + '</div><p class="lille" id="ps-ni" aria-live="polite"></p>';
    };

    function skemaKasser(reak) {
        var tekst = Sc.skemaTekst(reak, true, true);
        return '<p class="skema">' + h(tekst).replace(/__/g, '<span class="blank"></span>') + "</p>";
    }

    function rum1(r, id, t) {
        if (id === "lab") return {
            titel: "Prøve X og de kendte prøver",
            html: "<p>På bordet står Prøve X og fire kendte prøver. Klik på en brønd i dråbepladen for at dryppe reagenset i prøven.</p>" +
                '<div id="labgitter">' + Se.labGitter(r, t) + "</div>" +
                '<p class="spm">Hvilken metalion er i Prøve X?</p><p>Låsen vil have atomnummeret på metallet.</p>',
            note: "Dryp alle fire reagenser i Prøve X. Find den kendte prøve, hvis række er magen til. Atomnummeret står på det periodiske system."
        };
        if (id === "tavle") return {
            titel: "Tavlen",
            html: skemaKasser(r.reaktion) +
                '<p class="spm">Hvilke koefficienter afstemmer reaktionsskemaet?</p><p>Låsen vil have dem fra venstre mod højre. Koefficienten 1 skal også med.</p>',
            note: "Tæl hvert slags atom på begge sider af pilen. Begynd med det atom, der står i færrest stoffer, og tag oxygen og hydrogen til sidst."
        };
        if (id === "ps") return { titel: "Det periodiske system", html: Se.periodisk(), note: null, bred: true };
    }

    /* ----- Rum 2 ------------------------------------------------------- */
    function enLinje(molekyler) {
        var atomer = {};
        molekyler.forEach(function (m) { m.t.a.forEach(function (a) { atomer[a[0]] = true; }); });
        return ["H", "C", "N", "O", "Cl"].filter(function (a) { return atomer[a]; })
            .map(function (a) { return a + " " + NK.komma(D.EN[a], 1); }).join(" · ");
    }
    function rum2(r, id) {
        if (id === "flaske") return {
            titel: "Flasken på hylden",
            html: "<p>Etiketten siger <b>" + h(r.streg.formel) + "</b>, " + h(r.streg.navn) + ".</p>" +
                '<p class="spm">Hvor mange streger er der mellem atomerne i stregformlen for ' + h(r.streg.formel) + "?</p>" +
                "<p>Tegn stregformlen på papir. En dobbeltbinding er to streger.</p>",
            note: "H har én binding, O to, N tre og C fire. Er der ikke bindinger nok, bruges en dobbelt- eller tripelbinding."
        };
        if (id === "tavle") return {
            titel: "Fem molekyler",
            bred: true,
            html: '<div class="molgitter">' + r.molekyler.map(function (m) {
                return '<figure><figcaption>' + h(m.formel) + "</figcaption>" + NK.Sprites.molekyle(m.t, 150, 112) + "</figure>";
            }).join("") + "</div>" +
                '<p class="lille">Kilen peger mod jer, den stiplede streg væk fra jer. Elektronegativitet: ' + enLinje(r.molekyler) + "</p>" +
                '<p class="spm">Hvor mange af de fem molekyler er polære?</p>',
            note: "Et molekyle er polært, når det har polære bindinger og ikke er symmetrisk. En forskel i elektronegativitet under 0,5 giver en upolær binding."
        };
        if (id === "notesbog") return {
            titel: "Nillers notesbog",
            html: "<p>Niller har blandet stofferne to og to. Et fast stof, der opløses, tæller som blandet.</p>" +
                '<table class="tabel"><tr><th>Blanding</th><th>Resultat</th></tr>' +
                r.blanding.raekker.map(function (k) {
                    return "<tr><td>" + h(stort(k.a) + " + " + k.b) + "</td><td>" + (k.blandes ? "Blandes" : "Blandes ikke") + "</td></tr>";
                }).join("") + "</table>" +
                '<p class="spm">Hvor mange af de seks stoffer er upolære?</p>',
            note: "Vand er polært. To stoffer, der kan blandes, har samme polaritet. Følg kæderne fra vand."
        };
    }

    /* ----- Rum 3 ------------------------------------------------------- */
    function rum3(r, id) {
        var met = r.metal;
        if (id === "tavle") return {
            titel: "Tavlen",
            html: '<p class="skema">' + h(met.skema) + "</p>" +
                '<p class="data">M(' + met.sym + ") = " + NK.komma(met.M, 2) + " g/mol&emsp;R = 0,08314 L · bar / (mol · K)</p>" +
                '<p class="spm">Hvor mange liter dihydrogen dannes, når metallet på vægten reagerer fuldstændigt med saltsyren?</p>' +
                "<p>Temperaturen og trykket står på vejrstationen. Svar med to decimaler.</p>",
            note: "n(" + met.sym + ") = m / M. Skemaet giver forholdet mellem " + met.sym + " og H₂. Så er V = n · R · T / p med T i kelvin."
        };
        if (id === "vaegt") return {
            titel: "Vægten",
            html: "<p>Vægten viser <b>" + NK.komma(r.m, 2) + " g</b> " + h(met.form) + ".</p>" +
                "<p>Ved siden af står en flaske 2 M saltsyre. Der er rigeligt til at opløse alt metallet.</p>",
            note: null
        };
        if (id === "vejr") return {
            titel: "Vejrstationen",
            html: "<p>Termometeret viser <b>" + r.t + " °C</b>.</p><p>Barometeret viser <b>" + NK.komma(r.p, 3) + " bar</b>.</p>",
            note: null
        };
    }

    /* ----- Rum 4 ------------------------------------------------------- */
    function rum4(r, id) {
        var sy = r.syre, ba = r.base;
        if (id === "tavle") return {
            titel: "Tavlen",
            html: '<p class="skema">' + h(sy.formel + "(aq) + " + ba.formel + "(aq) → " + ba.kation + NK.formel(sy.anion) + "(aq) + H₂O(l)") + "</p>" +
                '<p class="spm">Hvad var pH i ' + h(sy.bestemt) + " i kolben, før titreringen begyndte?</p>" +
                "<p>Beregn først koncentrationen af " + h(sy.bestemt) + ". Svar med to decimaler.</p>",
            note: "Forbruget er forskellen mellem de to aflæsninger. n(" + ba.formel + ") = c · V, og " + sy.formel + " og " + ba.formel +
                " reagerer 1 : 1. " + stort(sy.navn) + " er en stærk syre, så [H₃O⁺] = c(" + sy.formel + "), og pH = −log[H₃O⁺]."
        };
        if (id === "burette") return {
            titel: "Buretten",
            html: "<p>Buretten indeholder <b>" + NK.komma(r.cBase, r.cBase < 0.1 ? 4 : 3) + " M " + h(ba.navn) + "</b>.</p>" +
                '<table class="tabel"><tr><td>Aflæst før titreringen</td><td><b>' + NK.komma(r.foer, 2) + " mL</b></td></tr>" +
                "<tr><td>Aflæst ved omslag</td><td><b>" + NK.komma(r.efter, 2) + " mL</b></td></tr></table>",
            note: null
        };
        if (id === "kolbe") return {
            titel: "Kolben",
            html: "<p>Kolben indeholder <b>" + NK.komma(r.Vsyre, 1) + " mL " + h(sy.navn) + "</b> med ukendt koncentration og nogle dråber phenolphthalein.</p>" +
                "<p>Den svagt lyserøde farve viser, at titreringen er nået til omslag.</p>",
            note: null
        };
    }

    /* ----- Rum 5 ------------------------------------------------------- */
    function rum5(r, id) {
        var red = r.redox;
        if (id === "tavle") return {
            titel: "Tavlen",
            html: '<p class="skema">' + h(red.skema) + "</p>" +
                '<p class="spm">Hvad er koncentrationen af ' + h(red.stof) + " i prøven?</p><p>Svar i mol/L med tre decimaler.</p>",
            note: "n(MnO₄⁻) = c · V. Skemaet viser, at " + red.forhold[0] + " MnO₄⁻ reagerer med " + red.forhold[1] + " " + red.stof +
                ". Stofmængden af " + red.stof + " divideres med prøvens rumfang i liter."
        };
        if (id === "burette") return {
            titel: "Buretten",
            html: "<p>Buretten indeholder <b>" + NK.komma(r.cMn, 4) + " M kaliumpermanganat</b>.</p>" +
                "<p>Forbruget af kaliumpermanganat til omslag var <b>" + NK.komma(r.Vmn, 2) + " mL</b>.</p>",
            note: null
        };
        if (id === "kolbe") return {
            titel: "Kolben",
            html: "<p>Kolben indeholdt <b>" + NK.komma(r.Vproeve, 1) + " mL " + (red.id === "fe" ? "jern(II)sulfat-opløsning" : "fortyndet brintoverilte") +
                "</b> tilsat svovlsyre.</p><p>Den svagt violette farve viser, at titreringen er nået til omslag.</p>",
            note: null
        };
    }

    Se.spor = function (rum, id, sag, t) {
        var r = sag.rum[rum];
        var f = [null, rum1, rum2, rum3, rum4, rum5][rum];
        var k = f(r, id, t);
        if (!k) return null;
        k.etiket = "Rum " + rum;
        return k;
    };

    /* ----- Kodelaasen --------------------------------------------------- */
    Se.laas = function (rum, sag, t) {
        var r = sag.rum[rum], aaben = t.naaet > rum;
        var s = '<div class="laas' + (aaben ? " aaben" : "") + '" id="laasfelter">';
        r.felter.forEach(function (f, i) {
            var n = 0;
            var bokse = f.maske.split("").map(function (c) {
                if (c === "#") {
                    var v = aaben ? f.svar.charAt(n) : "";
                    n++;
                    return '<input class="ciffer" type="text" inputmode="numeric" maxlength="1" autocomplete="off" value="' + v + '"' +
                        (aaben ? " disabled" : "") + ' aria-label="' + h(f.navn) + ", ciffer " + n + '">';
                }
                return c === " " ? '<span class="mellem"></span>' : '<span class="fast">' + h(c) + "</span>";
            }).join("");
            s += '<div class="felt" data-felt="' + i + '"><span class="felt-navn">' + h(f.navn) + '</span><span class="cifre">' + bokse + "</span></div>";
        });
        s += "</div>";
        return {
            etiket: "Rum " + rum,
            titel: "Kodelås",
            html: s,
            laas: true,
            aaben: aaben
        };
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
