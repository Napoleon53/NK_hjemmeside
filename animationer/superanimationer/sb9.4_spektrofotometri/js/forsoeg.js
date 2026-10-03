/* =====================================================================
   forsoeg.js - én fane: et forsoeg trin for trin

   De tre faner er samme motor med hver sine data (js/data.js). Fanen
   holder styr paa maalingerne, nulstillingen, reagenserne (fane 2),
   trinene og elevens svar. Scenen (js/scene.js) tegner, og
   regnestykkerne (js/regning.js) staar i panelet.

   Trintyperne:
     maal     maal en raekke kuvetter (ved en eller to boelgelaengder)
     reagens  tilsaet sulfanilamid og koblingsreagens, og vent (fane 2)
     regn     et regnestykke: formlen, tallene, resultatet
     tal      kun resultater, ét felt pr. tal
     aflaes   aflaes c paa grafen (fane 1)

   Stilladset: fane 1 har smaa trin, kurven tegnes for eleven, og
   koncentrationen aflaeses foer den regnes. Fane 2 regner eleven selv
   standardernes c og bruger standardkurvens ligning. Fane 3 har faerre
   og stoerre trin, og regnestykkerne er kun resultater.

   Hjaelpen staar i statuslinjen nederst i scenen (som sc1.4): naeste
   skridt, fejl og ros, og den ene knap giver en hinttrappe og til
   sidst svaret paa den bid, eleven er ved.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var M = NK.Model;
    var T = NK.Tal;
    var F = NK.Formel;

    var VENT = 4.2;   /* sekunder for de 10 minutter */

    function rundBet(v, n) {
        var s = T.bet(v, n || 3).replace("−", "-").replace(",", ".");
        return parseFloat(s);
    }

    function Forsoeg(id) {
        this.id = id;
        this.d = D.FANER[id];
        this.NOEGLE = "nk-sb9.4-" + id;
        var mig = this;
        function el(x) { return NK.el(id + "-" + x); }
        this.el = {
            linje: el("linje"), laerred: el("laerred"), status: el("status"), besked: el("besked"),
            knap: el("knap"), forfra: el("forfra"), kort: el("kort"), spm: el("spm"), trin: el("trin"),
            tabel: el("tabel"), nr: el("proevenr"), sektion: NK.el("fane-" + id)
        };
        this.scene = new NK.Scene(this.el.laerred, this);
        this.el.knap.addEventListener("click", function () { mig.knap(); });
        this.el.forfra.addEventListener("click", function () { mig.nulstil(); mig.fokus(); });
        this.fast = { html: "", klasse: "" };
        this.kortT = 0;
        this.nulstil();
    }
    var P = Forsoeg.prototype;

    /* ----- Opstart og forfra ------------------------------------------------------------ */
    P.nulstil = function () {
        this.lambda = this.d.lambdaer[0];
        this.nulstillet = false;
        this.maal = {};
        this.reag = this.d.reagenser ? { sulf: false, kob: false, tS: 0, tK: 0, pS: 0, frem: 0, venter: false, hurtig: false } : null;
        this.frem = this.reag ? 0 : 1;
        this.trinNr = 0;
        this.resume = [];
        this.proeveNr = 0;
        this.svar = { cStd: {} };
        this.elevAfl = null;
        this.faerdigt = false;
        this.brugtSvar = false;
        this.sidst = null;
        this.widget = null;
        this.hjaelp = 0;
        this.pegKnap = false;
        this.scene.tagUd();
        this.scene.koe = [];
        this.scene.molekyler = {};
        this.el.kort.classList.remove("sejr");
        this.visTrin();
    };

    /* ----- Kuvetterne ---------------------------------------------------------------------- */
    P.proeve = function () { return this.d.proever[this.proeveNr]; };

    P.kuvette = function (id) {
        var d = this.d, mig = this;
        if (id === "flaske") {
            var p = this.proeve();
            var ind = {};
            Object.keys(p.indhold).forEach(function (s) { ind[s] = p.indhold[s] * p.vEfter / p.vFoer; });
            return { id: "flaske", indhold: ind, navn: "den ufortyndede sodavand", noegle: "f" + this.proeveNr };
        }
        var k = null;
        for (var i = 0; i < d.kuvetter.length; i++) if (d.kuvetter[i].id === id) k = d.kuvetter[i];
        if (!k) return { id: id, indhold: {}, etiket: [] };
        if (k.rolle !== "proeve") return k;
        var pr = this.proeve();
        if (pr.par) {
            var pp = pr.par[k.nr];
            return { id: id, rolle: "proeve", indhold: pp.indhold, etiket: pp.etiket, navn: pp.navn, Navn: pp.Navn, stoej: k.stoej,
                     noegle: "p" + this.proeveNr, drikke: pp.drikke };
        }
        void mig;
        return { id: id, rolle: "proeve", indhold: pr.indhold, etiket: k.etiket, navn: pr.kort, Navn: pr.navn, noegle: "p" + this.proeveNr };
    };

    P.kuvetteNavn = function (id) {
        var k = this.kuvette(id);
        if (id === "flaske") return "ufortyndet sodavand";
        if (k.rolle === "proeve") return k.Navn;
        return this.radNavn(k);
    };

    P.radNavn = function (k) {
        if (k.rolle === "proeve") return k.Navn;
        if (this.id === "mid") return "Standard " + k.id.slice(1) + (k.rolle === "blind" ? " (blind)" : "");
        if (k.rolle === "blind") return "Blindprøve";
        if (this.id === "svr") return (k.stof === "gul" ? "Gul " : "Blå ") + k.id.slice(1);
        return "Standard " + k.id.slice(1);
    };

    /* A, som displayet viser det: med baggrunden, hvis instrumentet ikke er
       nulstillet, og med maalestoejen paa fane 2 */
    P.visA = function (id, lambda) {
        var k = this.kuvette(id);
        var A = M.absorbans(k.indhold, lambda, this.frem) + (k.stoej || 0);
        if (k.rolle === "blind" && this.nulstillet) A = 0;
        if (!this.nulstillet) A += D.BAGGRUND;
        return M.rund(Math.max(0, A));
    };

    P.maalt = function (id, lambda) {
        var m = this.maal[id];
        return m ? (m[lambda] || null) : null;
    };

    P.bobleKuvette = function () {
        if (this.sidst) return this.sidst;
        if (this.d.reagenser) return "s4";
        return null;
    };

    /* ----- Kald fra scenen ---------------------------------------------------------------- */
    P.paaMaaling = function (id, lambda) {
        this.sidst = id;
        if (id === "flaske") { this.paaFlaske(lambda); return; }
        var k = this.kuvette(id);
        var navn = this.kuvetteNavn(id);
        if (k.rolle === "blind") {
            var foer = this.nulstillet;
            this.nulstillet = true;
            this.saetMaaling(id, lambda, 0, true, null);
            /* Det, der blev maalt foer nulstillingen, gaelder ikke */
            this.bygTabel();
            if (!this.tjekTrin()) {
                this.besked('<span class="b-maerke">' + (foer ? "Blindprøve" : "Nulstillet") + "</span> " +
                    NK.html(foer ? "Blindprøven giver stadig A = 0,000." : "Rent vand giver nu A = 0,000. Instrumentet måler kun det, der er opløst.") +
                    " " + this.trinLinjeHTML(), "peger");
            }
            return;
        }
        var A = this.visA(id, lambda);
        var ok = this.nulstillet && this.frem >= 1;
        var grund = !this.nulstillet ? "nul" : (this.frem < 1 ? "farve" : null);
        this.saetMaaling(id, lambda, A, ok, grund);
        this.bygTabel();
        if (this.tjekTrin()) return;
        var tekst = navn + (this.d.lambdaer.length > 1 ? " ved " + lambda + " nm" : "") + ": A = " + T.A(A) + ".";
        if (grund === "nul") {
            this.fejlLinje(NK.html(tekst) + " Instrumentet var ikke nulstillet, så tallet er " + T.A(D.BAGGRUND) +
                " for højt. Mål blindprøven, og mål så igen.", "Ikke nulstillet");
            return;
        }
        if (grund === "farve") {
            this.fejlLinje(NK.html(tekst) + (this.reag.sulf && this.reag.kob ?
                " Farven er ikke færdig endnu, så A er for lille. Vent på uret, og mål igen." :
                " Nitrit er farveløs og opsuger ikke lyset. Tilsæt begge reagenser først."), "For tidligt");
            return;
        }
        this.besked('<span class="b-maerke">Målt</span> ' + NK.html(tekst) + " " + this.trinLinjeHTML(), "peger");
    };

    P.saetMaaling = function (id, lambda, A, ok, grund) {
        if (!this.maal[id]) this.maal[id] = {};
        this.maal[id][lambda] = { A: A, ok: ok, grund: grund };
    };

    /* Paaskeaegget: den ufortyndede sodavand */
    P.paaFlaske = function (lambda) {
        var A = this.visA("flaske", lambda);
        var Tp = 100 * M.transmittans(A);
        this.kortBesked("Ufortyndet sodavand: A = " + T.A(A) + ". Kun " + T.dk(Tp, 1) +
            " % af lyset slipper igennem, og A ligger langt over standardkurven. Derfor fortyndes sodavanden før målingen.", 9);
    };

    P.paaReagens = function (navn) {
        var r = this.reag;
        if (!r) return;
        var tekst = navn === "sulf" ? "sulfanilamid" : "koblingsreagens";
        if (r[navn]) { this.kortBesked("Der er allerede tilsat " + tekst + " til alle kuvetterne.", 4); return; }
        r[navn] = true;
        this.scene.reagensDraaber(navn);
        this.nulstilHjaelp();
        if (navn === "sulf") {
            this.besked('<span class="b-maerke">Tilsat</span> 2 mL sulfanilamid i hver kuvette. Nitrit bliver til en farveløs diazoniumion. ' +
                (r.kob ? "Den reagerer med koblingsreagenset til et rødt azofarvestof. Vent 10 minutter." : "Tilsæt nu koblingsreagens."), "peger");
        } else if (!r.sulf) {
            this.besked('<span class="b-maerke">Tilsat</span> 2 mL koblingsreagens i hver kuvette. Det har ikke noget at reagere med endnu. Tilsæt sulfanilamid.', "peger");
        } else {
            this.besked('<span class="b-maerke">Tilsat</span> 2 mL koblingsreagens. Diazoniumionen bliver til et rødt azofarvestof. Vent 10 minutter.', "peger");
        }
        if (r.sulf && r.kob) r.venter = true;
        this.bygTrinliste();
    };

    P.paaLambda = function (lambda) {
        if (lambda === this.lambda) {
            this.kortBesked("Spektrofotometeret står allerede på " + lambda + " nm.", 3);
            return;
        }
        this.saetLambda(lambda);
        this.scene.maalIgen();
        this.besked('<span class="b-maerke">' + lambda + " nm</span> " + this.trinLinjeHTML(), "peger");
    };

    P.saetLambda = function (lambda) {
        this.lambda = lambda;
        this.bygTabel();
    };

    P.paaKlik = function (hvad) {
        var lam = this.lambda;
        if (hvad === "instrument") {
            this.kortBesked("Spektrofotometeret sender lys med bølgelængden " + lam + " nm gennem kuvetten og måler, hvor meget der kommer ud på den anden side.", 6);
        } else if (hvad === "boble") {
            this.kortBesked("Zoom på kuvetten. En foton, der rammer et farvestofmolekyle, kan blive opsuget. Jo flere molekyler, jo færre fotoner kommer ud.", 6);
        } else if (hvad === "holder") {
            this.scene.startMaaling();
        } else if (hvad === "graf") {
            this.kortBesked("Grafen viser A mod c. Hvert punkt er en standard, du har målt.", 5);
        }
    };

    /* ----- Trinene ---------------------------------------------------------------------------- */
    P.trin = function () { return this.d.trin[this.trinNr] || null; };

    /* Udfyld pladsholderne i en tekst med elevens tal */
    P.flet = function (s) {
        if (!s) return "";
        var v = this.vaerdier();
        return String(s).replace(/\{(\w+)\}/g, function (m, n) { return v[n] !== undefined ? v[n] : m; });
    };

    P.vaerdier = function () {
        var v = {}, d = this.d, mig = this;
        var pr = this.proeve();
        v.proeveNavn = pr.navn;
        v.proeve = pr.kort || "";
        if (this.id === "let") {
            var a = this.svar.a !== undefined ? this.svar.a : M.haeldning(this.punkter("r"));
            v.a = T.bet(a || 0.026, 3);
            var m20 = this.maalt("s4", 504);
            v.A20 = m20 ? T.A(m20.A) : "den målte værdi";
            var mp = this.maalt("p", 504);
            var Ap = mp ? mp.A : M.rund(M.absorbans(pr.indhold, 504, 1));
            v.A = T.A(Ap);
            var cR = Ap / (this.svar.a || 0.026);
            v.lav = String(Math.floor(cR / 5) * 5);
            v.hoej = String(Math.floor(cR / 5) * 5 + 5);
            v.cAfl = this.svar.cAfl !== undefined ? T.dk(this.svar.cAfl, this.svar.cAfl % 1 ? 1 : 0) : T.dk(Math.round(cR), 0);
            v.c = this.svar.c !== undefined ? T.bet(this.svar.c, 3) : T.bet(cR, 3);
            v.vFoer = T.dk(pr.vFoer, 1);
            v.vEfter = T.dk(pr.vEfter, 1);
            v.faktor = T.dk(pr.vEfter / pr.vFoer, 0);
            var cf = this.svar.cFlaske !== undefined ? this.svar.cFlaske : cR * pr.vEfter / pr.vFoer;
            v.cFlaske = T.bet(cf, 3);
            v.mgL = T.bet(cf * D.STOFFER.roed.M / 1000, 2);
        } else if (this.id === "mid") {
            v.a = T.bet(this.aMid(), 3);
            var p1 = this.kuvette("p1"), p2 = this.kuvette("p2");
            v.p1 = p1.navn; v.p2 = p2.navn; v.P1 = p1.Navn; v.P2 = p2.Navn;
            var m1 = this.maalt("p1", 540), m2 = this.maalt("p2", 540);
            v.A1 = m1 ? T.A(m1.A) : "?";
            v.A2 = m2 ? T.A(m2.A) : "?";
            if (m1) v.cRund = T.dk(Math.round(m1.A / rundBet(this.aMid(), 3)), 0);
            v.c1 = this.svar.c1 !== undefined ? T.bet(this.svar.c1, 3) : "?";
            v.c2 = this.svar.c2 !== undefined ? T.bet(this.svar.c2, 3) : "?";
        } else {
            var mp4 = this.maalt("p", 427), mp6 = this.maalt("p", 630);
            v.A427 = mp4 ? T.A(mp4.A) : "?";
            v.A630 = mp6 ? T.A(mp6.A) : "?";
            var kb6 = this.aSerie("b630"), kb4 = this.aSerie("b427"), kg4 = this.aSerie("g427");
            v.kb630 = T.bet(kb6, 3); v.kb427 = T.bet(kb4, 3); v.kg427 = T.bet(kg4, 3);
            var cb = this.svar.cb !== undefined ? this.svar.cb : (mp6 ? mp6.A / rundBet(kb6, 3) : 0);
            v.cb = T.bet(cb, 3);
            var Ab = rundBet(kb4, 3) * cb;
            v.Ab = T.A(Ab);
            var Ag = mp4 ? mp4.A - Ab : 0;
            v.Ag = T.A(Ag);
            v.cg = this.svar.cg !== undefined ? T.bet(this.svar.cg, 3) : "?";
        }
        void d; void mig;
        return v;
    };

    /* ----- Panelet: trinene ---------------------------------------------------------------------- */
    P.visTrin = function () {
        var t = this.trin();
        this.widget = null;
        this.hjaelp = 0;
        this.pegKnap = false;
        this.bygTrinliste();
        this.bygTabel();
        this.visOpgavelinje();
        this.visKnap();
        if (t && (t.type === "maal" || t.type === "reagens") && this.trinFaerdigt(t)) {
            /* Allerede gjort, fx sodavanden maalt i forvejen */
            this.trinLoest();
            return;
        }
        if (!this.faerdigt) this.besked(this.trinLinjeHTML(), "");
    };

    P.visOpgavelinje = function () {
        var t = this.trin();
        var tekst = this.faerdigt ? "Færdig. " + (this.flereProever() ? "Tryk på Ny prøve for at analysere en ny prøve." : this.d.alleSlut) :
            (t ? this.flet(t.linje) : "");
        NK.saetTekst(this.id + "-linje", tekst);
    };

    P.bygTrinliste = function () {
        var mig = this, d = this.d;
        NK.saetTekst(this.id + "-spm", d.spoergsmaal);
        var pr = this.proeve();
        NK.saetTekst(this.id + "-proevenr", pr.navn + " · " + "trin " + Math.min(this.trinNr + 1, d.trin.length) + "/" + d.trin.length);
        var ol = this.el.trin;
        var aktivBoks = null;
        var gammel = ol.querySelector(".trin-arbejde");
        var h = "";
        d.trin.forEach(function (t, i) {
            var kl = i < mig.trinNr || mig.faerdigt ? "gjort" : (i === mig.trinNr ? "aktiv" : "kommer");
            h += '<li class="trinpunkt ' + kl + '" data-i="' + i + '"><div class="tp-hoved"><span class="tp-nr">' + (kl === "gjort" ? "✓" : (i + 1)) +
                '</span><span class="tp-titel">' + mig.flet(t.titel) + "</span></div>";
            if (kl === "gjort" && mig.resume[i]) h += '<div class="tp-resume">' + mig.resume[i] + "</div>";
            if (kl === "aktiv") {
                h += '<div class="tp-krop">' + (t.info ? '<p class="tp-info">' + mig.flet(t.info) + "</p>" : "") +
                    (t.type === "reagens" ? mig.reagensHTML() : "") +
                    '<div class="trin-arbejde" id="' + mig.id + '-arbejde"></div></div>';
            }
            h += "</li>";
        });
        /* Arbejdsfeltet (regnestykket) bevares, naar listen bygges om */
        ol.innerHTML = h;
        aktivBoks = NK.el(this.id + "-arbejde");
        var t = this.trin();
        if (aktivBoks && t && !this.faerdigt) {
            if (this.widget && gammel && this.widgetTrin === this.trinNr) {
                aktivBoks.parentNode.replaceChild(gammel, aktivBoks);
            } else {
                this.lavWidget(t, aktivBoks);
            }
        }
        if (this.faerdigt) {
            var slut = document.createElement("li");
            slut.className = "trinpunkt slut";
            slut.innerHTML = '<div class="forklaring"><p>' + this.flet(this.d.slut || this.slutTekst()) + "</p></div>";
            ol.appendChild(slut);
        }
        var aktiv = ol.querySelector(".trinpunkt.aktiv");
        if (aktiv && aktiv.scrollIntoView && this.el.sektion.classList.contains("aktiv")) {
            try { aktiv.scrollIntoView({ block: "nearest" }); } catch (e) { /* gammel browser */ }
        }
    };

    P.reagensHTML = function () {
        var r = this.reag;
        function linje(ok, tekst) { return '<li class="' + (ok ? "ok" : "") + '">' + (ok ? "✓ " : "") + tekst + "</li>"; }
        return '<ul class="reagensliste">' +
            linje(r.sulf, "2 mL sulfanilamid") +
            linje(r.kob, "2 mL koblingsreagens") +
            linje(r.frem >= 1, r.venter ? "Vent 10 minutter (" + Math.round(r.frem * 10) + " min)" : "Vent 10 minutter") + "</ul>";
    };

    /* ----- Tabellen ---------------------------------------------------------------------------------- */
    P.bygTabel = function () {
        var mig = this, d = this.d;
        var lam = d.lambdaer;
        var h = "<thead><tr><th>Kuvette</th>";
        if (this.id === "mid") h += "<th>V<sub>før</sub> / mL</th>";
        h += "<th>c / µM</th>";
        lam.forEach(function (l) { h += "<th" + (lam.length > 1 && l === mig.lambda ? ' class="lam-aktiv"' : "") + ">A" + (lam.length > 1 ? NK.saenket(String(l)) : "") + "</th>"; });
        h += "</tr></thead><tbody>";
        d.kuvetter.forEach(function (k0) {
            var k = mig.kuvette(k0.id);
            var kl = (k0.id === mig.scene.holder ? "i-lyset " : "") + (k.rolle === "proeve" ? "proeve" : "");
            h += '<tr class="' + kl + '"><td>' + NK.html(mig.radNavn(k)) + "</td>";
            if (mig.id === "mid") h += "<td>" + (k.rolle === "proeve" ? "–" : T.dk(k.vFoer, 2)) + "</td>";
            h += "<td>" + mig.cCelle(k) + "</td>";
            lam.forEach(function (l) {
                var m = mig.maalt(k0.id, l);
                if (!m) h += '<td class="tom">–</td>';
                else if (m.ok) h += "<td>" + T.A(m.A) + "</td>";
                else h += '<td class="ugyldig" title="' + (m.grund === "nul" ? "Målt før nulstillingen" : "Målt før farven var færdig") + '">' + T.A(m.A) + " !</td>";
            });
            h += "</tr>";
        });
        h += "</tbody>";
        NK.saetHTML(this.id + "-tabel", h);
    };

    P.cCelle = function (k) {
        var s = this.svar;
        if (this.id === "let") {
            if (k.rolle !== "proeve") return T.dk(k.c, 1);
            return s.c !== undefined ? '<b class="fundet">' + T.bet(s.c, 3) + "</b>" : "?";
        }
        if (this.id === "mid") {
            if (k.rolle === "blind") return "0";
            if (k.rolle === "std") return s.cStd[k.id] !== undefined ? T.bet(s.cStd[k.id], 3) : "?";
            var c = k.id === "p1" ? s.c1 : s.c2;
            return c !== undefined ? '<b class="fundet">' + T.bet(c, 3) + "</b>" : "?";
        }
        if (k.rolle === "blind") return "0";
        if (k.rolle === "std") return T.dk(k.c, k.stof === "gul" ? 1 : 2);
        var t = [];
        t.push("gul " + (s.cg !== undefined ? T.bet(s.cg, 3) : "?"));
        t.push("blå " + (s.cb !== undefined ? T.bet(s.cb, 3) : "?"));
        return '<span class="' + (s.cg !== undefined && s.cb !== undefined ? "fundet" : "") + '">' + t.join(" · ") + "</span>";
    };

    /* ----- Graferne ---------------------------------------------------------------------------------- */
    /* Punkterne i en serie: standarder med kendt c, maalt ved seriens boelgelaengde */
    P.punkter = function (serieId, medFejl) {
        var mig = this, d = this.d, ud = [];
        var serie = null;
        d.grafer.forEach(function (g) { g.serier.forEach(function (s) { if (s.id === serieId) serie = s; }); });
        if (!serie) return ud;
        d.kuvetter.forEach(function (k) {
            if (k.rolle === "proeve") return;
            var c;
            if (k.rolle === "blind") c = 0;
            else if (mig.id === "mid") c = mig.svar.cStd[k.id];
            else if (mig.id === "svr" && k.stof !== serie.stof) return;
            else c = k.c;
            if (c === undefined) return;
            var m = mig.maalt(k.id, serie.lambda);
            if (k.rolle === "blind" && mig.id === "svr" && mig.nulstillet && !m) m = { A: 0, ok: true };
            if (!m) return;
            if (!m.ok && !medFejl) return;
            ud.push({ c: c, A: m.A, fejl: !m.ok, id: k.id });
        });
        return ud;
    };

    /* Haeldningen i en serie paa fane 3, regnet af de gyldige punkter */
    P.aSerie = function (serieId) {
        return M.haeldning(this.punkter(serieId));
    };

    P.serieKomplet = function (serieId) {
        var mig = this, ant = 0;
        var serie = null;
        this.d.grafer.forEach(function (g) { g.serier.forEach(function (s) { if (s.id === serieId) serie = s; }); });
        this.d.kuvetter.forEach(function (k) {
            if (k.rolle !== "std" || k.stof !== serie.stof) return;
            var m = mig.maalt(k.id, serie.lambda);
            if (m && m.ok) ant++;
        });
        return ant === 4;
    };

    /* Standardkurvens haeldning paa fane 2 (regression gennem 0) */
    P.aMid = function () { return M.haeldning(this.punkter("n")); };

    P.trinIdx = function (id) {
        for (var i = 0; i < this.d.trin.length; i++) if (this.d.trin[i].id === id) return i;
        return -1;
    };
    P.forbi = function (id) { return this.faerdigt || this.trinNr > this.trinIdx(id); };

    P.grafInfo = function (g) {
        var mig = this, s = this.svar;
        var info = { serier: [], proever: [], elev: null, tom: null };
        g.serier.forEach(function (se) {
            var pts = mig.punkter(se.id, true);
            var gyldige = pts.filter(function (p) { return !p.fejl; });
            var e = { farve: se.farve, punkter: pts, a: null, ligning: null };
            if (mig.id === "let") {
                if (mig.forbi("std")) e.a = M.haeldning(gyldige);
                if (mig.forbi("a")) e.ligning = "A = " + T.bet(s.a, 3) + " · c";
            } else if (mig.id === "mid") {
                if (mig.forbi("c36")) { e.a = M.haeldning(gyldige); e.ligning = "A = " + T.bet(e.a, 3) + " · c"; }
            } else if (mig.serieKomplet(se.id)) {
                e.a = M.haeldning(gyldige);
                e.ligning = "A = " + (e.a > 0.00001 ? T.bet(e.a, 3) + " · c" : "0");
            }
            info.serier.push(e);
        });
        if (this.id === "let") {
            var mp = this.maalt("p", 504);
            if (mp && mp.ok) {
                var p = { A: mp.A, navn: this.proeve().navn, farve: "#f2c53d" };
                if (s.cAfl !== undefined) {
                    p.cSlut = mp.A / (s.a || 0.026);
                    p.cTekst = s.c !== undefined ? "c = " + T.bet(s.c, 3) + " µM" : "c ≈ " + T.dk(s.cAfl, s.cAfl % 1 ? 1 : 0) + " µM";
                }
                info.proever.push(p);
            }
            if (this.elevAfl) info.elev = this.elevAfl;
            if (!info.serier[0].punkter.length && !info.proever.length) info.tom = "Punkterne kommer, når du måler.";
        } else if (this.id === "mid") {
            ["p1", "p2"].forEach(function (id, i) {
                var m = mig.maalt(id, 540);
                if (!m || !m.ok) return;
                var c = i === 0 ? s.c1 : s.c2;
                var p = { A: m.A, navn: mig.kuvette(id).Navn, farve: i === 0 ? "#f2c53d" : "#5fd0ff", forskyd: 0 };
                if (c !== undefined) { p.cSlut = c; p.cTekst = T.bet(c, 3) + " µM"; }
                info.proever.push(p);
            });
            if (info.proever.length === 2 && Math.abs(info.proever[0].A - info.proever[1].A) < 0.04) info.proever[1].forskyd = 18;
            if (!info.serier[0].punkter.length) info.tom = this.forbi("std") ? "Punkterne kommer, når c er beregnet." : "Punkterne kommer, når c er beregnet og A er målt.";
        } else {
            var lam = g.stof === "gul" ? 427 : 630;
            var mm = this.maalt("p", lam);
            if (mm && mm.ok) {
                var pp = { A: mm.A, navn: this.proeve().navn, farve: D.LYS[lam] };
                if (g.stof === "blaa" && s.cb !== undefined) { pp.cSlut = s.cb; pp.cTekst = "blå " + T.bet(s.cb, 3) + " µM"; }
                if (g.stof === "gul" && s.cg !== undefined) {
                    pp.cSlut = s.cg;
                    pp.cTekst = "gul " + T.bet(s.cg, 3) + " µM";
                    var Ab = rundBet(this.aSerie("b427"), 3) * s.cb;
                    pp.bidrag = { gul: mm.A - Ab };
                    pp.Atop = mm.A - Ab;
                }
                info.proever.push(pp);
            }
            if (!info.serier[0].punkter.length && !info.serier[1].punkter.length) info.tom = "Punkterne kommer, når du måler.";
        }
        return info;
    };

    /* ----- Det, scenen peger paa ----------------------------------------------------------------------- */
    P.mangler = function (t, lambda) {
        var mig = this, ud = [];
        var lams = lambda ? [lambda] : (t.lambdaer || this.d.lambdaer);
        t.kuvetter.forEach(function (id) {
            var k = mig.kuvette(id);
            if (k.rolle === "blind") { if (!mig.nulstillet) ud.push(id); return; }
            lams.forEach(function (l) {
                var m = mig.maalt(id, l);
                if ((!m || !m.ok) && ud.indexOf(id) < 0) ud.push(id);
            });
        });
        return ud;
    };

    P.peg = function () {
        var t = this.trin();
        if (!t || this.faerdigt || this.scene.travl()) return [];
        if (t.type === "maal") {
            if (!this.nulstillet && t.kuvetter.indexOf(this.blindId()) >= 0) return [this.blindId()];
            if (!this.nulstillet) return [this.blindId()];
            var m = this.mangler(t, this.lambda);
            return m;
        }
        if (t.type === "reagens") {
            if (!this.reag.sulf) return ["sulf"];
            if (!this.reag.kob) return ["kob"];
        }
        return [];
    };

    P.pegLambda = function () {
        var t = this.trin();
        if (!t || t.type !== "maal" || this.faerdigt || this.d.lambdaer.length < 2 || !this.nulstillet) return false;
        return this.mangler(t, this.lambda).length === 0 && this.mangler(t).length > 0;
    };

    P.blindId = function () {
        var d = this.d;
        for (var i = 0; i < d.kuvetter.length; i++) if (d.kuvetter[i].rolle === "blind") return d.kuvetter[i].id;
        return null;
    };

    /* ----- Er trinnet gjort? ------------------------------------------------------------------------------ */
    P.trinFaerdigt = function (t) {
        if (t.type === "maal") return this.mangler(t).length === 0;
        if (t.type === "reagens") return this.reag.sulf && this.reag.kob && this.frem >= 1;
        return false;
    };

    /* Kaldes efter hver maaling og hvert reagens. Sand, hvis trinnet blev loest. */
    P.tjekTrin = function () {
        var t = this.trin();
        if (!t || this.faerdigt) return false;
        if ((t.type === "maal" || t.type === "reagens") && this.trinFaerdigt(t)) {
            this.trinLoest();
            return true;
        }
        if (t.type === "maal") this.visKnap();
        return false;
    };

    P.trinLoest = function (brugtSvar) {
        var t = this.trin();
        if (brugtSvar) this.brugtSvar = true;
        var i = this.trinNr;
        this.resume[i] = this.widget && this.widget.linje ? this.widget.linje() : this.flet(t.resume || "");
        var tekst = this.flet(t.loest);
        this.trinNr++;
        this.widget = null;
        if (this.trinNr >= this.d.trin.length) {
            this.proeveFaerdig(tekst, brugtSvar);
            return;
        }
        this.visTrin();
        /* Blev naeste trin klaret med det samme (fx proeven maalt i forvejen),
           har det allerede sat sin egen besked */
        if (this.trinNr !== i + 1 || this.faerdigt) return;
        this.besked('<span class="b-maerke stor">' + (brugtSvar ? "Svaret" : "Rigtigt ✓") + "</span> " + tekst +
            ' <span class="naeste">Næste: ' + this.flet(this.trin().titel).replace(/<[^>]+>/g, "") + ".</span>", brugtSvar ? "gul" : "god");
        this.glimt();
    };

    P.proeveFaerdig = function (tekst, brugtSvar) {
        this.faerdigt = true;
        this.proeverGjort = (this.proeverGjort || 0) + 1;
        var gemt = NK.hent(this.NOEGLE, {}) || {};
        gemt.faerdig = 1;
        if (!this.brugtSvar) gemt.stjerne = 1;
        NK.gem(this.NOEGLE, gemt);
        if (NK.opdaterFaneknapper) NK.opdaterFaneknapper();
        this.el.kort.classList.add("sejr");
        this.bygTrinliste();
        this.bygTabel();
        this.visOpgavelinje();
        this.visKnap();
        this.besked('<span class="b-maerke stor">' + (brugtSvar ? "Svaret" : "Færdig ✓") + "</span> " + tekst, brugtSvar ? "gul" : "god");
        this.glimt();
    };

    P.slutTekst = function () {
        var v = this.vaerdier();
        if (this.id === "mid") {
            var p1 = this.kuvette("p1");
            var c1 = this.svar.c1;
            var g = this.d.graense;
            var mgL = c1 * g.M / 1000;
            var om = c1 > g.uM ? "over" : "under";
            return v.P1 + " indeholder " + v.c1 + " µM nitrit, det er " + T.bet(mgL, 2) + " mg/L. Grænseværdien for drikkevand ved taphanen er 0,10 mg/L, så " +
                p1.navn + " ligger " + om + " grænsen. " + v.P2 + " indeholder " + v.c2 + " µM nitrit.";
        }
        if (this.id === "svr") {
            return this.proeve().navn + " indeholder " + v.cg + " µM gult E102 og " + v.cb + " µM blåt E133. Ved 427 nm lægges de to absorbanser sammen: " +
                v.A427 + " = " + v.Ag + " + " + v.Ab + ".";
        }
        return "";
    };

    P.flereProever = function () {
        return (this.proeverGjort || 0) < this.d.proever.length;
    };

    /* Ny proeve: standarderne og haeldningen beholdes, proevens trin begynder forfra */
    P.nyProeve = function () {
        var mig = this;
        this.proeveNr = (this.proeveNr + 1) % this.d.proever.length;
        this.d.kuvetter.forEach(function (k) { if (k.rolle === "proeve") delete mig.maal[k.id]; });
        ["cAfl", "c", "cFlaske", "c1", "c2", "cb", "cg"].forEach(function (n) { delete mig.svar[n]; });
        this.elevAfl = null;
        if (this.scene.holder && this.kuvette(this.scene.holder).rolle === "proeve") this.scene.tagUd();
        if (this.sidst && (this.sidst === "flaske" || this.kuvette(this.sidst).rolle === "proeve")) this.sidst = null;
        var foerste = 0;
        for (var i = 0; i < this.d.trin.length; i++) { if (this.d.trin[i].proeve) { foerste = i; break; } }
        this.trinNr = foerste;
        this.resume.length = foerste;
        this.faerdigt = false;
        this.brugtSvar = false;
        this.el.kort.classList.remove("sejr");
        this.visTrin();
        this.besked('<span class="b-maerke">Ny prøve</span> ' + NK.html(this.proeve().navn) + ". Standarderne og standardkurven er de samme. " +
            this.trinLinjeHTML(), "peger");
    };

    /* ----- Regnestykkerne -------------------------------------------------------------------------------- */
    P.lavWidget = function (t, boks) {
        this.widgetTrin = this.trinNr;
        if (t.type === "regn") this.widget = new NK.Regn(boks, this.regnSpec(t), this);
        else if (t.type === "tal") this.widget = new NK.TalFelter(boks, this.talFelter(t), this);
        else if (t.type === "aflaes") this.widget = new NK.TalFelter(boks, [this.aflaesFelt()], this);
        else this.widget = null;
    };

    P.fejl = function (html) {
        this.fejlLinje(html, "Ikke endnu");
    };

    P.delOk = function (html) {
        this.hjaelp = 0;
        this.pegKnap = false;
        this.besked('<span class="b-maerke">Rigtigt</span> ' + html, "god");
        this.visKnap();
    };

    P.regnLoest = function (w, brugtSvar) {
        var t = this.trin();
        var r = w.resultat;
        if (t.id === "a") this.svar.a = r;
        else if (t.id === "c") this.svar.c = r;
        else if (t.id === "foer") this.svar.cFlaske = r;
        else if (t.id === "c2") this.svar.cStd.s2 = r;
        else if (t.id === "c1") this.svar.c1 = r;
        this.trinLoest(brugtSvar || this.brugtDel);
        this.brugtDel = false;
    };

    P.talLoest = function (w, brugtSvar) {
        this.trinLoest(brugtSvar || this.brugtDel);
        this.brugtDel = false;
    };

    /* Den fulde spec til et regnestykke af slagsen t.regn */
    P.regnSpec = function (t) {
        var mig = this, s = this.svar;
        var spec = { hint: {} };
        ["formel", "tal", "res"].forEach(function (f) { spec.hint[f] = (t.hint[f] || []).map(function (x) { return mig.flet(x); }); });
        var naer = T.naer;

        if (t.regn === "haeldning") {
            spec.venstre = "a"; spec.sk = "broek"; spec.felter = ["A", "c"]; spec.formelTekst = "A / c";
            spec.enheder = ["", "µM"]; spec.resEnhed = "µM⁻¹";
            spec.formelFejl = function (dom, sk) {
                if (dom.slags === "vendt") return "Brøken er vendt. a er A pr. µM, så A står i tælleren og c i nævneren.";
                if (sk === "gange" && dom.slags === "form") return "A · c giver ikke hældningen. a er A pr. µM: A delt med c.";
                return null;
            };
            spec.tjekTal = function (v) {
                var std = mig.punkter("r").filter(function (p) { return p.c > 0; });
                var iA = -1, iC = -1;
                std.forEach(function (p, i) {
                    if (Math.abs(p.A - v[0]) < 0.0006) iA = i;
                    if (naer(v[1], p.c, 0.002)) iC = i;
                });
                if (v[0] === 0 && v[1] === 0) return { ok: false, felt: 0, besked: "Blindprøven giver 0 / 0. Vælg en af standarderne." };
                if (std.some(function (p) { return naer(v[1], p.c * 1e-6, 0.01); })) return { ok: false, felt: 1, besked: "Skriv c i µM, som i tabellen." };
                if (iA >= 0 && iC >= 0 && iA === iC) return { ok: true };
                if (iA < 0 && std.some(function (p) { return naer(v[0], p.c, 0.002); })) return { ok: false, felt: 0, besked: "Tallene står omvendt. A skal i tælleren og c i nævneren." };
                if (iA < 0) return { ok: false, felt: 0, besked: "Tælleren skal være A for en af standarderne. Se tabellen." };
                if (iC < 0) return { ok: false, felt: 1, besked: "Nævneren skal være c for den samme standard: " + T.dk(std[iA].c, 1) + " µM." };
                return { ok: false, felt: 1, besked: "A og c skal komme fra den samme standard." };
            };
            spec.visTal = function (i, x) { return i === 0 ? T.A(x) : T.dk(x, 1); };
            spec.tjekRes = function (x, v) {
                var f = v[0] / v[1];
                if (naer(x, f, 0.012)) return { ok: true, vaerdi: f };
                if (naer(x, v[1] / v[0], 0.02)) return { ok: false, besked: "Du har regnet c / A. Brøken er vendt." };
                if (tiGange(x, f)) return { ok: false, besked: "Kommaet står forkert. Tæl nullerne efter kommaet på lommeregneren." };
                return { ok: false, besked: "Det passer ikke med " + T.A(v[0]) + " / " + T.dk(v[1], 1) + ". Regn brøken ud igen." };
            };
            spec.visRes = function (x) { return T.bet(x, 3); };
            spec.svarTal = function () {
                var std = mig.punkter("r").filter(function (p) { return p.c > 0; });
                var p = std.filter(function (q) { return q.c === 20; })[0] || std[std.length - 1];
                return [p.A, p.c];
            };
            spec.svarRes = function (v) { return v[0] / v[1]; };
        }

        if (t.regn === "koncentration") {
            var pid = this.id === "mid" ? "p1" : "p";
            var lam = this.d.lambdaer[0];
            var aV = function () { return mig.id === "mid" ? rundBet(mig.aMid(), 3) : s.a; };
            var Ap = function () { var m = mig.maalt(pid, lam); return m ? m.A : 0; };
            spec.venstre = "c"; spec.sk = "broek"; spec.felter = ["A", "a"]; spec.formelTekst = "A / a";
            spec.enheder = ["", "µM⁻¹"]; spec.resEnhed = "µM";
            spec.formelFejl = function (dom, sk) {
                if (dom.slags === "vendt") return "Brøken er vendt. Del A med a, så står c alene: c = A / a.";
                if (sk === "gange" && dom.slags === "form") return "A = a · c. For at få c alene skal A deles med a, ikke ganges.";
                return null;
            };
            spec.tjekTal = function (v) {
                var navn = mig.kuvette(pid).navn;
                if (Math.abs(v[0] - aV()) < 1e-9 && Math.abs(v[1] - Ap()) < 0.0006) return { ok: false, felt: 0, besked: "Tallene står omvendt. A i tælleren, a i nævneren." };
                if (Math.abs(v[0] - Ap()) >= 0.0006) return { ok: false, felt: 0, besked: "Tælleren skal være " + navn + "s absorbans, " + T.A(Ap()) + "." };
                if (!naer(v[1], aV(), 0.006)) return { ok: false, felt: 1, besked: "Nævneren skal være hældningen a = " + T.bet(aV(), 3) + " µM⁻¹." };
                return { ok: true };
            };
            spec.visTal = function (i, x) { return i === 0 ? T.A(x) : T.bet(x, 3); };
            spec.tjekRes = function (x, v) {
                var f = v[0] / v[1];
                if (naer(x, f, 0.012)) return { ok: true, vaerdi: f };
                if (naer(x, v[0] * v[1], 0.02)) return { ok: false, besked: "Du har ganget. c = A / a." };
                if (naer(x, v[1] / v[0], 0.02)) return { ok: false, besked: "Brøken er vendt. Det er a / A." };
                if (tiGange(x, f)) return { ok: false, besked: "Kommaet står forkert. Tjek svaret på lommeregneren." };
                return { ok: false, besked: "Det passer ikke med " + T.A(v[0]) + " / " + T.bet(v[1], 3) + ". Regn brøken ud igen." };
            };
            spec.visRes = function (x) { return T.bet(x, 3); };
            spec.svarTal = function () { return [Ap(), aV()]; };
            spec.svarRes = function (v) { return v[0] / v[1]; };
        }

        if (t.regn === "fortyndFoer") {
            var pr = this.proeve();
            spec.venstre = "c_foer"; spec.sk = "gangebroek"; spec.felter = ["c_efter", "V_efter", "V_foer"];
            spec.formelTekst = F.vis("c_efter") + " · " + F.vis("V_efter") + " / " + F.vis("V_foer");
            spec.enheder = ["µM", "mL", "mL"]; spec.resEnhed = "µM";
            spec.formelFejl = function (dom) {
                if (dom.slags === "rumfang") return "Rumfangene er byttet om. Sodavanden i flasken er stærkere end i kuvetten, så " + F.vis("c_foer") + " skal være større end " + F.vis("c_efter") + ".";
                if (dom.slags === "cbyttet") return F.vis("c_foer") + " står allerede på venstre side. I formlen skal " + F.vis("c_efter") + " stå.";
                if (dom.slags === "form") return "Isolér " + F.vis("c_foer") + " i " + F.vis("c_foer") + " · " + F.vis("V_foer") + " = " + F.vis("c_efter") + " · " + F.vis("V_efter") + ". Der står to størrelser over brøkstregen og én under.";
                return null;
            };
            spec.tjekTal = function (v) {
                var c = s.c;
                var tael = [v[0], v[1]];
                var harC = tael.some(function (x) { return naer(x, c, 0.015); });
                var harVe = tael.some(function (x) { return naer(x, pr.vEfter, 0.001); });
                if (tael.concat([v[2]]).some(function (x) { return naer(x, pr.vFoer / 1000, 0.001) || naer(x, pr.vEfter / 1000, 0.001); }))
                    return { ok: false, felt: 1, besked: "Skriv begge rumfang i mL. Så går enhederne ud." };
                if (naer(v[2], pr.vEfter, 0.001) && tael.some(function (x) { return naer(x, pr.vFoer, 0.001); }))
                    return { ok: false, felt: 2, besked: "Rumfangene er byttet om. Under brøkstregen står " + F.vis("V_foer") + " = " + T.dk(pr.vFoer, 1) + " mL." };
                if (!harC) return { ok: false, felt: 0, besked: F.vis("c_efter") + " er koncentrationen i kuvetten, " + T.bet(c, 3) + " µM." };
                if (!harVe) return { ok: false, felt: 1, besked: F.vis("V_efter") + " er målekolbens rumfang, " + T.dk(pr.vEfter, 1) + " mL." };
                if (!naer(v[2], pr.vFoer, 0.001)) return { ok: false, felt: 2, besked: F.vis("V_foer") + " er den mængde sodavand, der blev fortyndet, " + T.dk(pr.vFoer, 1) + " mL." };
                return { ok: true, vaerdier: [naer(v[0], c, 0.015) ? v[0] : v[1], pr.vEfter, pr.vFoer] };
            };
            spec.visTal = function (i, x) { return i === 0 ? T.bet(x, 3) : T.dk(x, 1); };
            spec.tjekRes = function (x, v) {
                var f = v[0] * v[1] / v[2];
                if (naer(x, f, 0.012)) return { ok: true, vaerdi: f };
                if (naer(x, v[0] * v[2] / v[1], 0.02)) return { ok: false, besked: "Rumfangene er byttet om. Svaret skal være større end " + T.bet(v[0], 3) + " µM." };
                if (tiGange(x, f)) return { ok: false, besked: "Kommaet står forkert. Tjek svaret på lommeregneren." };
                return { ok: false, besked: "Det passer ikke. Gang de to tal over brøkstregen, og del med tallet under." };
            };
            spec.visRes = function (x) { return T.bet(x, 3); };
            spec.svarTal = function () { return [s.c, pr.vEfter, pr.vFoer]; };
            spec.svarRes = function (v) { return v[0] * v[1] / v[2]; };
        }

        if (t.regn === "fortyndEfter") {
            var stam = this.d.stam, vE = this.d.vEfter, vF = 2.0;
            spec.venstre = "c_efter"; spec.sk = "gangebroek"; spec.felter = ["c_foer", "V_foer", "V_efter"];
            spec.formelTekst = F.vis("c_foer") + " · " + F.vis("V_foer") + " / " + F.vis("V_efter");
            spec.enheder = ["µM", "mL", "mL"]; spec.resEnhed = "µM";
            spec.formelFejl = function (dom) {
                if (dom.slags === "rumfang") return "Rumfangene er byttet om. Standarden er tyndere end stamopløsningen, så " + F.vis("c_efter") + " skal være mindre end " + F.vis("c_foer") + ".";
                if (dom.slags === "cbyttet") return F.vis("c_efter") + " står allerede på venstre side. I formlen skal " + F.vis("c_foer") + " stå.";
                if (dom.slags === "form") return "Isolér " + F.vis("c_efter") + " i " + F.vis("c_foer") + " · " + F.vis("V_foer") + " = " + F.vis("c_efter") + " · " + F.vis("V_efter") + ". Der står to størrelser over brøkstregen og én under.";
                return null;
            };
            spec.tjekTal = function (v) {
                var tael = [v[0], v[1]];
                if (tael.concat([v[2]]).some(function (x) { return naer(x, stam * 1e-6, 0.01); }))
                    return { ok: false, felt: 0, besked: "Skriv " + F.vis("c_foer") + " i µM: 50,0 µM." };
                if (tael.concat([v[2]]).some(function (x) { return naer(x, vF / 1000, 0.001) || naer(x, vE / 1000, 0.001); }))
                    return { ok: false, felt: 1, besked: "Skriv begge rumfang i mL. Så går enhederne ud." };
                if (naer(v[2], vE - vF, 0.001)) return { ok: false, felt: 2, besked: F.vis("V_efter") + " er hele rumfanget efter fortyndingen, 50,0 mL, ikke kun vandet." };
                if (naer(v[2], vF, 0.001)) return { ok: false, felt: 2, besked: "Rumfangene er byttet om. Under brøkstregen står " + F.vis("V_efter") + " = 50,0 mL." };
                var t0 = tael.slice().sort(function (a, b) { return a - b; });
                if (!(naer(t0[0], vF, 0.001) && naer(t0[1], stam, 0.001))) {
                    if (!tael.some(function (x) { return naer(x, stam, 0.001); })) return { ok: false, felt: 0, besked: F.vis("c_foer") + " er stamopløsningens koncentration, 50,0 µM." };
                    return { ok: false, felt: 1, besked: F.vis("V_foer") + " er den mængde stamopløsning, der blev fortyndet, 2,00 mL." };
                }
                if (!naer(v[2], vE, 0.001)) return { ok: false, felt: 2, besked: F.vis("V_efter") + " er målekolbens rumfang, 50,0 mL." };
                return { ok: true, vaerdier: [stam, vF, vE] };
            };
            spec.visTal = function (i, x) { return i === 1 ? T.dk(x, 2) : T.dk(x, 1); };
            spec.tjekRes = function (x, v) {
                var f = v[0] * v[1] / v[2];
                if (naer(x, f, 0.012)) return { ok: true, vaerdi: f };
                if (naer(x, v[0] * v[2] / v[1], 0.02)) return { ok: false, besked: "Rumfangene er byttet om. Svaret skal være mindre end 50,0 µM." };
                if (tiGange(x, f)) return { ok: false, besked: "Kommaet står forkert. Tjek svaret på lommeregneren." };
                return { ok: false, besked: "Det passer ikke. Gang de to tal over brøkstregen, og del med tallet under." };
            };
            spec.visRes = function (x) { return T.bet(x, 3); };
            spec.svarTal = function () { return [stam, vF, vE]; };
            spec.svarRes = function (v) { return v[0] * v[1] / v[2]; };
        }
        return spec;
    };

    function tiGange(x, f) {
        if (!(x > 0) || !(f > 0)) return false;
        var r = Math.log(x / f) / Math.LN10;
        var n = Math.round(r);
        return n !== 0 && Math.abs(r - n) < 0.006;
    }

    /* Resultatfelterne til trin af typen tal */
    P.talFelter = function (t) {
        var mig = this, s = this.svar, naer = T.naer;
        var ud = [];
        if (t.id === "c36") {
            t.felter.forEach(function (id) {
                var k = mig.kuvette(id);
                var V = k.vFoer, stam = mig.d.stam, vE = mig.d.vEfter;
                var f = stam * V / vE;
                ud.push({
                    id: id, etiket: "Standard " + id.slice(1), venstre: F.vis("c_efter"), enhed: "µM",
                    tjek: function (x) {
                        if (naer(x, f, 0.01)) return { ok: true, vaerdi: f };
                        if (naer(x, stam * vE / V, 0.015)) return { ok: false, besked: "Rumfangene er byttet om. Standarden er tyndere end stamopløsningen." };
                        if (naer(x, stam * V / (vE - V), 0.015)) return { ok: false, besked: "Del med hele rumfanget efter fortyndingen, 50,0 mL, ikke kun vandet." };
                        if (naer(x, stam * V, 0.015)) return { ok: false, besked: "Husk at dele med " + F.vis("V_efter") + " = 50,0 mL." };
                        if (naer(x, f * 1e-6, 0.015)) return { ok: false, besked: "Skriv svaret i µM, som de andre." };
                        return { ok: false, besked: "Det passer ikke. Brug formlen fra standard 2 med " + F.vis("V_foer") + " = " + T.dk(V, 2) + " mL." };
                    },
                    hint: ["Brug samme formel som for standard 2: " + F.vis("c_efter") + " = " + F.vis("c_foer") + " · " + F.vis("V_foer") + " / " + F.vis("V_efter") + ".",
                           F.vis("c_efter") + " = 50,0 µM · " + T.dk(V, 2) + " mL / 50,0 mL"],
                    svar: function () { return f; },
                    vis: function (x) { return T.bet(x, 3); },
                    efterOk: function (x) { s.cStd[id] = x; mig.bygTabel(); }
                });
            });
        }
        if (t.id === "cp2") {
            var A2 = function () { var m = mig.maalt("p2", 540); return m ? m.A : 0; };
            var A1 = function () { var m = mig.maalt("p1", 540); return m ? m.A : 0; };
            var aV = function () { return rundBet(mig.aMid(), 3); };
            var navn2 = this.kuvette("p2").navn;
            ud.push({
                id: "p2", etiket: "", venstre: "c", enhed: "µM",
                tjek: function (x) {
                    var f = A2() / aV();
                    if (naer(x, f, 0.015)) return { ok: true, vaerdi: f };
                    if (naer(x, A1() / aV(), 0.015)) return { ok: false, besked: "Det er " + mig.kuvette("p1").navn + "s absorbans. Brug " + navn2 + "s, " + T.A(A2()) + "." };
                    if (naer(x, A2() * aV(), 0.02)) return { ok: false, besked: "Du har ganget. c = A / a." };
                    if (naer(x, aV() / A2(), 0.02)) return { ok: false, besked: "Brøken er vendt. c = A / a." };
                    if (tiGange(x, f)) return { ok: false, besked: "Kommaet står forkert. Tjek svaret på lommeregneren." };
                    return { ok: false, besked: "Det passer ikke. Brug c = A / a med " + navn2 + "s absorbans." };
                },
                hint: ["Samme formel som før: c = A / a.", "c = " + T.A(A2()) + " / " + T.bet(aV(), 3) + " µM⁻¹"],
                svar: function () { return A2() / aV(); },
                vis: function (x) { return T.bet(x, 3); },
                efterOk: function (x) { s.c2 = x; mig.bygTabel(); }
            });
        }
        if (t.id === "cb" || t.id === "cg") {
            var A4 = function () { var m = mig.maalt("p", 427); return m ? m.A : 0; };
            var A6 = function () { var m = mig.maalt("p", 630); return m ? m.A : 0; };
            var kb6 = function () { return rundBet(mig.aSerie("b630"), 3); };
            var kb4 = function () { return rundBet(mig.aSerie("b427"), 3); };
            var kg4 = function () { return rundBet(mig.aSerie("g427"), 3); };
            var v = this.vaerdier();
            if (t.id === "cb") {
                ud.push({
                    id: "blaa", etiket: "", venstre: "c(blå)", enhed: "µM",
                    tjek: function (x) {
                        var f = A6() / kb6();
                        if (naer(x, f, 0.015)) return { ok: true, vaerdi: f };
                        if (naer(x, A4() / kb4(), 0.03)) return { ok: false, besked: "Ved 427 nm opsuger begge farvestoffer, så A₄₂₇ siger ikke kun noget om det blå. Brug den bølgelængde, hvor kun det blå opsuger." };
                        if (naer(x, A6() / kg4(), 0.02)) return { ok: false, besked: "Det er det gules hældning. Brug det blås standardkurve ved 630 nm." };
                        if (naer(x, A4() / kb6(), 0.02)) return { ok: false, besked: "Det er absorbansen ved 427 nm. Brug A ved 630 nm." };
                        if (naer(x, A6() * kb6(), 0.02)) return { ok: false, besked: "Du har ganget. c = A / a." };
                        if (tiGange(x, f)) return { ok: false, besked: "Kommaet står forkert. Tjek svaret på lommeregneren." };
                        return { ok: false, besked: "Det passer ikke. Se på grafen for det blå: hvilken bølgelængde giver en stejl kurve, og hvor kommer A fra?" };
                    },
                    hint: ["Find en bølgelængde, hvor kun det blå opsuger lys. Se på grafen for det gule ved 630 nm.",
                           "Ved 630 nm opsuger det gule ikke. Så kommer hele A₆₃₀ fra det blå: c(blå) = A₆₃₀ / a(blå, 630 nm).",
                           "c(blå) = " + v.A630 + " / " + v.kb630 + " µM⁻¹"],
                    svar: function () { return A6() / kb6(); },
                    vis: function (x) { return T.bet(x, 3); },
                    efterOk: function (x) { s.cb = x; mig.bygTabel(); }
                });
            } else {
                ud.push({
                    id: "gul", etiket: "", venstre: "c(gul)", enhed: "µM",
                    tjek: function (x) {
                        var Ab = kb4() * s.cb;
                        var f = (A4() - Ab) / kg4();
                        if (naer(x, f, 0.02)) return { ok: true, vaerdi: f };
                        if (naer(x, A4() / kg4(), 0.015)) return { ok: false, besked: "For meget. Det er, hvad du får, hvis alt lyset ved 427 nm blev opsuget af det gule. Det blå opsuger også lidt ved 427 nm. Træk det blås bidrag fra først." };
                        if (naer(x, (A4() + Ab) / kg4(), 0.015)) return { ok: false, besked: "Det blås bidrag skal trækkes fra, ikke lægges til." };
                        if (naer(x, (A4() - A6()) / kg4(), 0.02) || (A4() - A6()) / kg4() < 0 && x < 0) return { ok: false, besked: "A₆₃₀ er ikke det blås bidrag ved 427 nm. Ved 427 nm opsuger det blå meget mindre: a(blå, 427 nm) · c(blå)." };
                        if (naer(x, A6() / kg4(), 0.02)) return { ok: false, besked: "Ved 630 nm opsuger det gule ikke. Brug A ved 427 nm." };
                        if (tiGange(x, f)) return { ok: false, besked: "Kommaet står forkert. Tjek svaret på lommeregneren." };
                        return { ok: false, besked: "Det passer ikke. Ved 427 nm er A summen af det gules og det blås absorbans." };
                    },
                    hint: ["Ved 427 nm opsuger begge farvestoffer. Absorbanserne lægges sammen: A₄₂₇ = A(gul) + A(blå).",
                           "Det blås bidrag ved 427 nm er a(blå, 427 nm) · c(blå) = " + v.kb427 + " µM⁻¹ · " + v.cb + " µM = " + v.Ab + ".",
                           "A(gul) = " + v.A427 + " − " + v.Ab + " = " + v.Ag + ", og c(gul) = " + v.Ag + " / " + v.kg427 + " µM⁻¹."],
                    svar: function () { return (A4() - kb4() * s.cb) / kg4(); },
                    vis: function (x) { return T.bet(x, 3); },
                    efterOk: function (x) { s.cg = x; mig.bygTabel(); }
                });
            }
        }
        return ud;
    };

    /* Aflaesningen paa fane 1 */
    P.aflaesFelt = function () {
        var mig = this, s = this.svar;
        var t = this.trin();
        var Ap = function () { var m = mig.maalt("p", 504); return m ? m.A : 0; };
        var a = function () { return s.a || 0.026; };
        return {
            id: "afl", etiket: "", venstre: "c", lig: "≈", enhed: "µM",
            tjek: function (x) {
                var f = Ap() / a();
                if (Math.abs(x - f) <= 1.0) { mig.elevAfl = null; return { ok: true, vaerdi: x }; }
                if (Math.abs(x - Ap()) < 0.002) return { ok: false, besked: "Det er absorbansen. Aflæs c på den vandrette akse." };
                mig.elevAfl = { c: x, A: a() * x };
                return { ok: false, besked: "Ved " + T.dk(x, x % 1 ? 1 : 0) + " µM ligger standardkurven ved A = " + T.A(a() * x) +
                    ", men sodavanden har A = " + T.A(Ap()) + ". Gå " + (x < f ? "længere til højre." : "længere til venstre.") };
            },
            hint: (t.hint || []).map(function (h) { return mig.flet(h); }),
            svar: function () { mig.elevAfl = null; return Math.round(Ap() / a()); },
            vis: function (x) { return T.dk(x, x % 1 ? 1 : 0); },
            efterOk: function (x) { s.cAfl = x; }
        };
    };

    /* ----- Statuslinjen ---------------------------------------------------------------------------------- */
    P.trinLinje = function () {
        var t = this.trin();
        if (!t || this.faerdigt) return "";
        if (t.type === "maal") {
            if (!this.nulstillet) return "Start med blindprøven, så instrumentet bliver nulstillet.";
            var her = this.mangler(t, this.lambda);
            var alle = this.mangler(t);
            var mig = this;
            if (!alle.length) return "";
            if (!her.length && this.d.lambdaer.length > 1) {
                var andet = this.d.lambdaer.filter(function (l) { return l !== mig.lambda; })[0];
                return "Ved " + this.lambda + " nm er alt målt. Skift til " + andet + " nm med knappen på spektrofotometeret.";
            }
            var navne = her.map(function (id) { return mig.kortNavn(id); });
            return (this.d.lambdaer.length > 1 ? "Ved " + this.lambda + " nm mangler: " : "Mangler: ") + liste(navne) + ".";
        }
        if (t.type === "reagens") {
            if (!this.reag.sulf) return "Klik på sulfanilamid, eller træk flasken hen til stativet.";
            if (!this.reag.kob) return "Klik på koblingsreagens.";
            return "Farven udvikler sig. Vent, til uret har gået 10 minutter.";
        }
        if (t.type === "regn") {
            var w = this.widget;
            if (!w || w.fase === "formel") return w && w.sk ? "Skriv formlen med bogstaver i felterne, og tryk Tjek formlen (Enter). Tallene kommer bagefter." :
                "Vælg formens form. Bogstaverne skriver du bagefter, og tallene kommer til sidst.";
            if (w.fase === "tal") return "Skriv tallene i felterne, og tryk Tjek tallene (Enter).";
            return "Regn det ud, og skriv resultatet.";
        }
        if (t.type === "aflaes") return "Skriv det tal, du aflæser på c-aksen, og tryk Tjek (Enter).";
        if (t.type === "tal") return "Skriv svaret, og tryk Tjek (Enter).";
        return "";
    };

    P.trinLinjeHTML = function () { return NK.html(this.trinLinje()); };

    P.kortNavn = function (id) {
        var k = this.kuvette(id);
        if (k.rolle === "proeve") return k.navn;
        if (k.rolle === "blind") return "blindprøven";
        if (this.id === "mid") return id.slice(1);
        if (this.id === "svr") return (k.stof === "gul" ? "gul " : "blå ") + k.c;
        return T.dk(k.c, 1) + " µM";
    };

    function liste(a) {
        if (a.length <= 1) return a.join("");
        return a.slice(0, -1).join(", ") + " og " + a[a.length - 1];
    }

    P.besked = function (html, klasse) {
        this.fast = { html: html || "", klasse: klasse || "" };
        this.kortT = 0;
        this.visBesked(this.fast);
    };

    P.kortBesked = function (tekst, sek) {
        this.kortT = sek || 4;
        this.visBesked({ html: NK.html(tekst), klasse: "peger" });
    };

    P.visBesked = function (b) {
        this.el.besked.innerHTML = b.html;
        this.el.status.className = "statuslinje" + (b.klasse ? " " + b.klasse : "");
    };

    P.fejlLinje = function (html, maerke) {
        this.besked('<span class="b-maerke">' + NK.html(maerke || "Ikke endnu") + "</span> " + html, "skidt");
        this.pegKnap = true;
        this.visKnap();
        this.ryst();
    };

    P.ryst = function () {
        var e = this.el.status;
        e.classList.remove("ryster");
        void e.offsetWidth;
        e.classList.add("ryster");
    };

    P.glimt = function () {
        var e = this.el.kort;
        e.classList.remove("glimter");
        void e.offsetWidth;
        e.classList.add("glimter");
    };

    /* ----- Knappen: ét hint ad gangen, saa svaret -------------------------------------------------------- */
    P.hintNu = function () {
        var t = this.trin();
        if (!t) return [];
        var mig = this;
        if (this.widget) return this.widget.hint();
        return (t.hint || []).map(function (h) { return mig.flet(h); });
    };

    P.visKnap = function () {
        var k = this.el.knap, tekst, klasse;
        if (this.faerdigt) {
            klasse = "knap videre banker";
            if (this.flereProever()) tekst = "Ny prøve →";
            else {
                var nf = this.naesteFane();
                tekst = nf ? "Videre til " + D.FANER[nf].navn + " →" : "Ny prøve →";
            }
        } else {
            var h = this.hintNu();
            klasse = "knap hjaelp";
            if (this.hjaelp === 0) tekst = h.length ? "Giv et hint" : "Vis svaret";
            else if (this.hjaelp < h.length) tekst = "Næste hint (" + (this.hjaelp + 1) + " af " + h.length + ")";
            else tekst = "Vis svaret";
            if (this.pegKnap) klasse += " peg";
        }
        k.textContent = tekst;
        k.className = klasse;
    };

    P.naesteFane = function () {
        var i = D.RAEKKE.indexOf(this.id);
        return i >= 0 && i < D.RAEKKE.length - 1 ? D.RAEKKE[i + 1] : null;
    };

    P.knap = function () {
        if (this.faerdigt) {
            if (this.flereProever()) this.nyProeve();
            else if (this.naesteFane() && NK.visFane) NK.visFane("fane-" + this.naesteFane());
            else { this.proeverGjort = 0; this.nyProeve(); }
            return;
        }
        var h = this.hintNu();
        this.pegKnap = false;
        if (this.hjaelp < h.length) {
            this.hjaelp++;
            this.besked('<span class="b-maerke">Hint ' + this.hjaelp + " af " + h.length + "</span> " + h[this.hjaelp - 1], "hint");
            this.visKnap();
            this.fokus();
            return;
        }
        this.visSvar();
    };

    P.nulstilHjaelp = function () {
        if (this.hjaelp === 0) return;
        this.hjaelp = 0;
        this.visKnap();
    };

    P.visSvar = function () {
        var t = this.trin();
        if (!t) return;
        this.hjaelp = 0;
        this.brugtSvar = true;
        var mig = this;
        if (t.type === "maal") {
            var koe = [];
            if (!this.nulstillet) koe.push({ id: this.blindId(), lambda: this.lambda });
            var lams = t.lambdaer || this.d.lambdaer;
            lams.forEach(function (l) {
                t.kuvetter.forEach(function (id) {
                    if (mig.kuvette(id).rolle === "blind") return;
                    var m = mig.maalt(id, l);
                    if (!m || !m.ok) koe.push({ id: id, lambda: l });
                });
            });
            this.besked('<span class="b-maerke">Svaret</span> Spektrofotometeret måler ' + (koe.length === 1 ? "kuvetten" : "kuvetterne") + " for dig.", "gul");
            this.scene.maalAlle(koe);
            this.visKnap();
            return;
        }
        if (t.type === "reagens") {
            if (!this.reag.sulf) this.paaReagens("sulf");
            if (!this.reag.kob) this.paaReagens("kob");
            this.reag.hurtig = true;
            this.besked('<span class="b-maerke">Svaret</span> Begge reagenser er tilsat. Farven udvikler sig.', "gul");
            return;
        }
        if (this.widget) {
            this.brugtDel = true;
            var tekst = this.widget.visSvar();
            if (tekst && this.trin() === t) {
                this.besked('<span class="b-maerke">Svaret</span> ' + tekst, "gul");
                this.visKnap();
            }
        }
    };

    /* ----- Taster, fokus og tiden ------------------------------------------------------------------------ */
    P.enter = function () {
        if (this.faerdigt) { this.knap(); return; }
        if (this.widget && this.widget.tjek) this.widget.tjek();
    };

    P.fokus = function () {
        if (!this.el.sektion.classList.contains("aktiv") || document.querySelector(".overlay.vis") ||
            (NK.Rundvisning && NK.Rundvisning.aktiv())) return;
        if (this.widget && this.widget.fokus) this.widget.fokus();
    };

    P.tilpas = function () {
        this.scene.tilpas();
    };

    P.opdater = function (dt) {
        var r = this.reag;
        if (r) {
            if (r.sulf) { r.tS += dt; r.pS = Math.min(1, r.tS / 1.4); }
            if (r.sulf && r.kob && r.frem < 1) {
                r.tK += dt * (r.hurtig ? 3 : 1);
                var foer = r.frem;
                r.frem = Math.min(r.pS, Math.min(1, r.tK / VENT));
                if (Math.floor(foer * 10) !== Math.floor(r.frem * 10)) this.bygTrinliste();
                if (r.frem >= 1) {
                    r.venter = false;
                    r.frem = 1;
                    this.frem = 1;
                    this.bygTrinliste();
                    if (!this.tjekTrin()) this.besked(this.trinLinjeHTML(), "");
                }
            }
            this.frem = r.frem;
        }
        if (this.kortT > 0) {
            this.kortT -= dt;
            if (this.kortT <= 0) { this.kortT = 0; this.visBesked(this.fast); }
        }
        /* Tabellen markerer kuvetten i lyset */
        if (this.scene.holder !== this.sidstHolder) { this.sidstHolder = this.scene.holder; this.bygTabel(); }
        this.scene.opdater(dt);
    };

    NK.Forsoeg = Forsoeg;
}());
