/* =====================================================================
   sim_regn.js - de tre faner: Find pH, Find koncentrationen og
   Staerke syrer og baser

   De tre faner er bygget ens og er tre objekter af samme slags
   (new SimRegn("ph"), "konc" og "staerk"). Forskellen er opgaverne
   (lavPh, lavKonc, lavStaerk).

   Scenen: oeverst regnevejen. Den vokser med opgaven: foerst staar kun
   det, man kender, og det, man skal finde (med ?). En pil kommer
   foerst, naar eleven har valgt dens formel, og den naeste station
   kommer, naar opgaven naar den. Paa bordet: glasset eller flasken,
   kortet (etiketten), hvor svarene skrives, og pH-metret.

   Fane 1 og 3: pH-metret maaler, naar pH er regnet ud, og viser det
   samme tal. Fane 2: pH-metret maaler foerst.

   Opgavekortet: hvert trin er delt i smaa bider, én ad gangen:
     1 Vaelg formlen      knapper; de forkerte er de typiske fejl
     2 Tast udregningen   lommeregneren siger til, naar tallet er rigtigt
                          (og hvad der er galt, hvis det er en typisk fejl)
     3 Skriv svaret       rund af, og skriv det i feltet
   Knappen giver hjaelp til den bid, man er ved: Giv hint, og saa Vis
   formlen, Vis tasterne eller Vis svaret. Til sidst Ny opgave.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;
    var R = NK.Regner;

    var POP = 0.45;          /* det nye glas springer frem */
    var MAALER = 1.3;        /* elektroden dykker, og tallet ruller */
    var NY = 0.7;            /* et nyt tal paa kortet toner frem */
    var FREM = 0.6;          /* en ny station eller pil kommer frem */
    var INFO = 6;            /* en besked fra et klik staar saa laenge */

    var NAVN = { h: "[H₃O⁺]", oh: "[OH⁻]", ph: "pH" };

    /* Korte formler til pilene, naar der ikke er plads til de lange */
    var KORT = {
        "h>ph": "−log", "ph>h": "10^{−pH}", "h>oh": "K_{w} / [H₃O⁺]", "oh>h": "K_{w} / [OH⁻]"
    };

    var KNAP = {
        formel: ["Giv hint", "Vis formlen"],
        tast: ["Giv hint", "Vis tasterne"],
        skriv: ["Giv hint", "Vis svaret"]
    };

    function SimRegn(p) {
        this.p = p;
        this.F = D.FANER[p];
        this.L = new NK.Laerred(NK.el(p + "-laerred"));
        this.tid = 0;
        this.lay = null;
        this.over = null;
        this.info = null;
        this.g = { kaffekop: { skjult: false, iHaand: false } };
        this.noegle = "nk-sc7.3-" + p;
        var gemt = NK.hent(this.noegle, {}) || {};
        this.loest = gemt.loest || 0;
        this.rost = !!gemt.rost;
        this.nr = 0;
        this.pose = [];
        this.sidste = null;

        this.bygPanel();
        this.bygTilbud();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.nyOpgave();
    }

    var P = SimRegn.prototype;

    /* ----- Opgaverne ------------------------------------------------------------------ */
    P.naesteStof = function (start, nr) {
        var s;
        if (nr < start.length) s = D.stof(start[nr]);
        else {
            if (!this.pose.length) this.pose = NK.bland(D.STOFFER);
            s = this.pose.shift();
            if (this.sidste === s.id && this.pose.length) { this.pose.push(s); s = this.pose.shift(); }
        }
        this.sidste = s.id;
        return s;
    };

    P.variation = function (st, nr) {
        if (nr === 0) return st.ph;
        return NK.klamp(st.ph + NK.r(-D.VARIATION, D.VARIATION), 0.3, 13.7);
    };

    /* Fane 1: [H₃O⁺] staar paa kortet, eleven regner pH */
    P.lavPh = function (nr) {
        var st = this.naesteStof(D.START_PH, nr);
        var h = K.rund(K.h3o(this.variation(st, nr)));
        var t = K.trinPhAfH(h);
        return {
            navn: st.navn, stof: st.id, givet: "h",
            tekst: st.navn + " har [H₃O⁺] = " + K.konc(h) + ". Hvad er pH?",
            etiket: [{ id: "h", navn: "[H₃O⁺]", vaerdi: K.konc(h), trykt: true }, { id: "ph", navn: "pH", trin: 0 }],
            trin: [t],
            slutPh: t.facit
        };
    };

    /* Fane 2: pH-metret maaler, eleven regner [H₃O⁺] og [OH⁻] */
    P.lavKonc = function (nr) {
        var st = this.naesteStof(D.START_KONC, nr);
        var ph = Math.round(this.variation(st, nr) * 100) / 100;
        var t1 = K.trinHAfPh(ph);
        var t2 = K.trinOhAfH(K.rund(t1.facit), ph);
        return {
            navn: st.navn, stof: st.id, givet: "ph", maalFoer: ph,
            tekst: "pH-metret viser, at " + st.navn.toLowerCase() + " har pH " + K.phTekst(ph) + ". Hvad er [H₃O⁺] og [OH⁻]?",
            etiket: [{ id: "ph", navn: "pH", vaerdi: K.phTekst(ph), trykt: true, maales: true },
                { id: "h", navn: "[H₃O⁺]", trin: 0 }, { id: "oh", navn: "[OH⁻]", trin: 1 }],
            trin: [t1, t2]
        };
    };

    /* Fane 3: koncentrationen staar paa flasken */
    P.lavStaerk = function (nr) {
        var alle = D.SYRER.map(function (s) { return ["syre", s]; }).concat(D.BASER.map(function (b) { return ["base", b]; }));
        var valg, c;
        if (nr < D.START_STAERK.length) {
            var s0 = D.START_STAERK[nr];
            valg = alle.filter(function (a) { return a[1].formel === s0[1]; })[0];
            c = valg[1].c[0];
        } else {
            var mig = this;
            var andre = alle.filter(function (a) { return a[1].formel !== mig.sidste; });
            valg = NK.tilfaeldig(andre);
            c = NK.tilfaeldig(valg[1].c);
        }
        var s = valg[1];
        this.sidste = s.formel;
        var opg = {
            navn: s.navn, flaske: s, syre: valg[0] === "syre", c: c, givet: "c",
            tekst: "Flasken indeholder " + K.decimal(c) + " M " + s.formel + " (" + s.navn.toLowerCase() + "). Hvad er pH?"
        };
        if (opg.syre) {
            var t1 = K.trinHAfSyre(s, c);
            var t2 = K.trinPhAfH(c);
            opg.trin = [t1, t2];
            opg.etiket = [{ id: "h", navn: "[H₃O⁺]", trin: 0 }, { id: "ph", navn: "pH", trin: 1 }];
            opg.slutPh = t2.facit;
        } else {
            var b1 = K.trinNOh(s);
            var b2 = K.trinOhAfBase(s, c);
            var oh = K.rund(b2.facit);
            var b3 = K.trinHAfOh(oh);
            var h = K.rund(b3.facit);
            var b4 = K.trinPhAfH(h, [
                [-K.log10(oh), "Det er −log[OH⁻]. pH regnes ud fra [H₃O⁺]."],
                [-K.log10(c), "Det er −log af tallet på flasken. pH regnes ud fra [H₃O⁺]."]
            ]);
            opg.trin = [b1, b2, b3, b4];
            opg.etiket = [{ id: "oh", navn: "[OH⁻]", trin: 1 }, { id: "h", navn: "[H₃O⁺]", trin: 2 }, { id: "ph", navn: "pH", trin: 3 }];
            opg.slutPh = b4.facit;
        }
        return opg;
    };

    P.nyOpgave = function () {
        var nr = this.nr++;
        this.opg = this.p === "ph" ? this.lavPh(nr) : (this.p === "konc" ? this.lavKonc(nr) : this.lavStaerk(nr));
        this.status = this.opg.trin.map(function () { return "aaben"; });
        this.kendte = {};
        this.frem = {};
        this.nyt = {};
        this.faerdig = false;
        this.ind = 0;
        this.maaling = null;
        this.maalt = false;
        this.visning = "--,--";
        this.info = null;
        R.stopDemo();
        if (this.opg.maalFoer !== undefined) this.maaling = { t: -0.35, ph: this.opg.maalFoer };
        this.besked("", "");
        this.startTrin(0);
        if (this.lay) this.layout();       /* kortet kan have flere linjer nu */
    };

    P.trin = function () { return this.opg.trin[this.trinNr]; };

    /* Bidderne i et trin: formel, tast og skriv (dem, trinet har) */
    function bider(t) {
        var b = [];
        if (t.formler) b.push("formel");
        if (t.taster) b.push("tast");
        b.push("skriv");
        return b;
    }

    P.startTrin = function (i) {
        this.trinNr = i;
        var t = this.trin();
        this.bider = bider(t);
        this.bid = this.bider[0];
        this.hjaelp = 0;
        this.formelOk = !t.formler;
        this.tastVist = null;
        this.forkerteFormler = {};
        this.bygRaekker();
        this.visKort();
    };

    /* Videre til den naeste bid i trinet */
    P.naesteBid = function () {
        var i = this.bider.indexOf(this.bid);
        if (i < this.bider.length - 1) this.bid = this.bider[i + 1];
        this.hjaelp = 0;
        this.visBider();
        this.visKort();
    };

    /* Pilen, et trin gaar ad: "h>ph", "cs>h" osv. */
    P.pilNoegle = function (t) {
        var fra = t.fra === "c" ? (this.opg.syre ? "cs" : "cb") : t.fra;
        return fra + ">" + t.til;
    };

    function rigtigFormel(t) {
        for (var i = 0; i < t.formler.length; i++) if (t.formler[i].rigtig) return t.formler[i];
        return null;
    }

    /* ----- Bid 1: formlen ----------------------------------------------------------------- */
    P.vaelgFormel = function (nr, vist) {
        if (this.faerdig || this.bid !== "formel") return;
        var t = this.trin();
        var f = t.formler[nr];
        if (!f) return;
        if (!f.rigtig) {
            this.forkerteFormler[nr] = true;
            this.visBider();
            this.besked(K.formelHtml(f.forkl), "skidt");
            return;
        }
        this.formelValgt(vist);
    };

    P.formelValgt = function (vist) {
        var t = this.trin();
        this.formelOk = true;
        this.kendte[this.pilNoegle(t)] = true;
        this.besked((vist ? "Formlen er " : "Rigtigt. Formlen er ") + K.formelHtml(rigtigFormel(t).f) +
            ". Den står nu på pilen i regnevejen.", vist ? "gul" : "god");
        this.naesteBid();
    };

    /* ----- Bid 2: lommeregneren --------------------------------------------------------------
       Kaldes fra app.js, hver gang eleven (eller Vis tasterne) trykker =. */
    P.lommeregnerSvar = function (v) {
        if (this.faerdig) return;
        var t = this.trin();
        if (!t.taster) return;
        var rigtig = t.felt === "ph" ? Math.abs(v - t.facit) < 0.006 :
            (Math.abs(v / t.facit - 1) < 0.01 || (t.alternativ && Math.abs(v / t.alternativ - 1) < 0.01));
        var vis = R.tiTekst(v);
        if (rigtig) {
            if (!this.formelOk) this.kendte[this.pilNoegle(t)] = true;
            this.formelOk = true;
            this.tastVist = vis;
            this.besked((R.iDemo() ? "Lommeregneren viser <b>" : "Rigtigt regnet. Lommeregneren viser <b>") + NK.html(vis) + "</b>. " +
                K.formelHtml(t.skrivTekst), R.iDemo() ? "gul" : "god");
            if (this.bid !== "skriv") { this.bid = "skriv"; this.hjaelp = 0; }
            this.visBider();
            this.visKort();
            return;
        }
        var fejl = t.fejl(v);
        if (fejl && this.formelOk) this.besked("Lommeregneren viser <b>" + NK.html(vis) + "</b>. " + fejl, "gul");
    };

    /* ----- Knappen: hjaelp til den bid, man er ved ------------------------------------------ */
    P.knap = function () {
        this.el.knap.blur();
        if (this.faerdig) {
            if (this.maaling) return;
            this.nyOpgave();
            return;
        }
        var t = this.trin();
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            var hint = this.bid === "formel" ? t.formelHint : (this.bid === "tast" ? t.tastHint : t.skrivHint);
            this.besked("<b>Hint:</b> " + K.formelHtml(hint) + (this.bid === "tast" ? this.mapleLinje(t, false) : ""), "gul");
        } else if (this.bid === "formel") {
            this.formelValgt(true);
            return;
        } else if (this.bid === "tast") {
            this.besked("Se lommeregneren. Den taster selv, én tast ad gangen.", "gul");
            R.demo(t.taster);
        } else {
            this.visSvar();
            return;
        }
        this.visKort();
    };

    P.visSvar = function () {
        R.stopDemo();
        this.trinFaerdig("", true);
    };

    /* Et trin er regnet (eller vist) */
    P.trinFaerdig = function (note, vist) {
        var t = this.trin();
        var i = this.trinNr;
        this.status[i] = vist ? "vist" : "loest";
        /* Kun et trin med formler laaser pilen op (afstemningen deler pil med
           det naeste trin, og dets formel maa ikke staa der for tidligt) */
        if (t.formler) this.kendte[this.pilNoegle(t)] = true;
        this.nyt[i] = 0;
        var sidste = i >= this.opg.trin.length - 1;
        var videre = sidste ? "" : " Nu kommer næste trin.";
        if (vist) this.besked("Svaret står i feltet." + videre, "gul");
        else this.besked("Rigtigt." + (note ? " " + note : "") + videre, "god");
        if (this.afvisTilbud) this.afvisTilbud();
        if (sidste) {
            this.opgaveFaerdig();
            this.bygRaekker();
            this.visKort();
        } else {
            this.startTrin(i + 1);
        }
    };

    P.opgaveFaerdig = function () {
        this.faerdig = true;
        this.trinNr = this.opg.trin.length;
        var selv = this.status.every(function (s) { return s === "loest"; });
        if (selv) {
            this.loest++;
            if (this.loest >= D.ROS_ANTAL && !this.rost) {
                this.rost = true;
                this.ventRos = 1.8;
            }
            NK.gem(this.noegle, { loest: this.loest, rost: this.rost });
        }
        if (this.opg.slutPh !== undefined) this.maaling = { t: 0, ph: this.opg.slutPh };
    };

    /* ----- Bid 3: tjekket af feltet ------------------------------------------------------ */
    P.tjek = function () {
        if (this.faerdig) return;
        var t = this.trin();
        var raekke = this.el.raekker.querySelector('[data-i="' + this.trinNr + '"]');
        if (!raekke) return;
        var felt = raekke.querySelector(".felt");
        var ind = raekke.querySelectorAll("input");
        if (!ind.length) return;
        var tal;
        if (t.felt === "konc") {
            if (!ind[0].value.trim()) { this.besked("Skriv tallet foran · 10 i det store felt og eksponenten i det lille felt.", "gul"); return; }
            tal = K.laesKonc(ind[0].value, ind[1].value);
            if (!tal) { this.fejl(felt, "Det kan ikke læses som et tal. Skriv fx 3,8 i det store felt og −4 i det lille."); return; }
        } else {
            if (!ind[0].value.trim()) { this.besked("Skriv svaret i feltet.", "gul"); return; }
            tal = K.laesTal(ind[0].value);
            if (!tal) { this.fejl(felt, "Det kan ikke læses som et tal. Skriv fx " + (t.felt === "ph" ? "2,30." : "2.")); return; }
            if (t.felt === "tal" && tal.v !== Math.round(tal.v)) { this.fejl(felt, "Skriv et helt tal."); return; }
        }
        var r = K.tjek(t, tal);
        if (r.rigtig) {
            t.elevSvar = t.felt === "konc" ? K.konc(tal.v) : (t.felt === "ph" ? K.phTekst(tal.v) : String(tal.v));
            this.trinFaerdig(r.note, false);
        } else {
            this.fejl(felt, r.besked || "Det er ikke rigtigt. Regn det igen på lommeregneren, og se på linjen under det, du tastede: står tallene, hvor de skal?");
        }
    };

    P.fejl = function (felt, tekst) {
        this.besked(tekst, "skidt");
        if (!felt) return;
        felt.classList.remove("ryst");
        void felt.offsetWidth;
        felt.classList.add("ryst");
    };

    /* ----- Panelet ------------------------------------------------------------------------ */
    P.bygPanel = function () {
        var mig = this, p = this.p;
        this.el = {
            knap: NK.el(p + "-knap"),
            besked: NK.el(p + "-besked"),
            kort: NK.el(p + "-kort"),
            raekker: NK.el(p + "-raekker")
        };
        this.el.knap.addEventListener("click", function () { mig.knap(); });
        NK.el(p + "-spring").addEventListener("click", function () { mig.springIntro(); });
        this.el.raekker.addEventListener("keydown", function (e) {
            if (e.key === "Enter" && e.target.tagName === "INPUT") { e.preventDefault(); mig.tjek(); }
        });
        this.el.raekker.addEventListener("click", function (e) {
            if (!e.target.closest) return;
            if (e.target.closest(".felt-ok")) { mig.tjek(); return; }
            var f = e.target.closest("[data-formel]");
            if (f && !f.disabled) mig.vaelgFormel(parseInt(f.getAttribute("data-formel"), 10));
        });
    };

    P.besked = function (html, klasse) {
        this.el.besked.innerHTML = K.hel(html);
        this.el.besked.className = "besked" + (klasse ? " " + klasse : "");
        this.rulNed();
    };

    /* Maple-linjen under et hint eller et svar. Den ses kun med Maple slaaet til. */
    P.mapleLinje = function (t, medSvar) {
        if (!t.maple) return "";
        var ud = "";
        if (medSvar) {
            var tokens = R.tilTokens(t.maple);
            var p = R.parse(tokens);
            try {
                var v = R.regn(p.ast);
                ud = '<span class="m-ud">' + R.mapleSvar(p.ast, v).ud + "</span>";
            } catch (e) { ud = ""; }
        }
        return '<span class="maple-linje"><span class="m-hoved">Maple</span><span class="m-ind">&gt; ' +
            NK.html(t.maple) + ";</span>" + ud + "</span>";
    };

    function feltHtml(t) {
        var ok = '<button class="felt-ok" type="button" aria-label="Tjek svaret" title="Tjek (Enter)">✓</button>';
        var ind = '<input type="text" inputmode="decimal" autocomplete="off" spellcheck="false"';
        if (t.felt === "konc") {
            return '<div class="felt aktiv felt-konc"><span class="felt-pre">' + t.stoerrelse + ' =</span>' +
                ind + ' class="mant" placeholder="fx 2,5" aria-label="Tallet foran · 10">' +
                '<span class="felt-mid">· 10</span>' +
                ind + ' class="eksp" placeholder="−3" aria-label="Eksponenten">' +
                '<span class="felt-efter">M</span>' + ok + "</div>";
        }
        if (t.felt === "tal") {
            return '<div class="felt aktiv felt-tal"><span class="felt-pre">' + t.skemaFoer + "</span>" +
                ind + ' class="lille" aria-label="Antal OH⁻">' +
                '<span class="felt-efter">' + t.skemaEfter + "</span>" + ok + "</div>";
        }
        return '<div class="felt aktiv felt-ph"><span class="felt-pre">pH =</span>' +
            ind + ' placeholder="fx 2,30" aria-label="pH">' + ok + "</div>";
    }

    /* Det aktuelle trin: overskrift og de tre bider. Bidderne vises efterhaanden
       (visBider), saa feltet ikke bygges om, mens eleven skriver i det. */
    P.trinHtml = function (t, i) {
        var mig = this;
        var flere = this.opg.trin.length > 1;
        /* Har opgaven kun ét trin, siger spoergsmaalet det hele */
        var html = flere ? '<div class="trin-hoved"><span class="trin-nr">Trin ' + (i + 1) + " af " + this.opg.trin.length + "</span>" +
            '<span class="trin-spm">' + t.spm + "</span></div>" : "";
        if (t.skema) html += '<div class="trin-skema">' + t.skema + "</div>";
        html += '<ol class="bider">';
        this.bider.forEach(function (b, n) {
            html += '<li class="bid" data-bid="' + b + '"><span class="bid-nr">' + (n + 1) + '</span><div class="bid-krop">';
            if (b === "formel") {
                html += '<div class="bid-tekst">Vælg formlen, der går fra ' + mig.stationNavn(mig.fraNoegle(t)) + " til " + NAVN[t.til] + ".</div>";
                html += '<div class="formelvalg">';
                var orden = mig.formelOrden(t);
                orden.forEach(function (k) {
                    html += '<button type="button" class="formelknap" data-formel="' + k + '">' + K.formelHtml(t.formler[k].f) + "</button>";
                });
                html += '</div><div class="bid-klar-tekst"></div>';
            } else if (b === "tast") {
                html += '<div class="bid-tekst">' + K.formelHtml(t.tastTekst) + '</div><div class="bid-klar-tekst"></div>';
            } else {
                html += '<div class="bid-tekst">' + K.formelHtml(t.skrivTekst) + "</div>" + feltHtml(t);
            }
            html += "</div></li>";
        });
        return html + "</ol>";
    };

    /* Formlerne i en fast, blandet raekkefoelge pr. trin */
    P.formelOrden = function (t) {
        if (!t.orden) t.orden = NK.bland(t.formler.map(function (f, k) { return k; }));
        return t.orden;
    };

    P.fraNoegle = function (t) {
        return t.fra === "c" ? (this.opg.syre ? "cs" : "cb") : t.fra;
    };

    P.bygRaekker = function () {
        var mig = this, html = "";
        this.opg.trin.forEach(function (t, i) {
            if (i > mig.trinNr) return;
            var st = mig.status[i];
            html += '<div class="raekke' + (st !== "aaben" ? " " + st : "") + '" data-i="' + i + '">';
            if (st === "aaben") {
                html += mig.trinHtml(t, i);
            } else {
                /* Et regnet trin fylder kun én linje: den paene beregning (og Maple) */
                html += '<div class="felt ' + (st === "vist" ? "svar" : "ok") + '"><div class="felt-svar">' + t.beregning +
                    mig.mapleLinje(t, true) + "</div>" + '<span class="felt-maerke">' + (st === "vist" ? "svar" : "✓") + "</span></div>";
            }
            html += "</div>";
        });
        this.el.raekker.innerHTML = html;
        this.visBider();
    };

    /* Hvilke bider der ses, hvilken der er i gang, og hvad der staar i de faerdige */
    P.visBider = function () {
        if (this.faerdig) { this.rulNed(); return; }
        var raekke = this.el.raekker.querySelector('[data-i="' + this.trinNr + '"]');
        if (!raekke) return;
        var mig = this, t = this.trin();
        var nu = this.bider.indexOf(this.bid);
        Array.prototype.forEach.call(raekke.querySelectorAll(".bid"), function (li) {
            var b = li.getAttribute("data-bid");
            var n = mig.bider.indexOf(b);
            var klar = (b === "formel" && mig.formelOk) || (b === "tast" && mig.tastVist !== null);
            /* Feltet kan bruges, saa snart formlen er valgt */
            var ses = n <= nu || (b === "skriv" && mig.formelOk);
            li.classList.toggle("kommer", !ses);
            li.classList.toggle("nu", b === mig.bid);
            li.classList.toggle("klar", klar && b !== mig.bid);
            var kt = li.querySelector(".bid-klar-tekst");
            if (b === "formel") {
                if (kt) kt.innerHTML = mig.formelOk ? "Formlen: <b>" + K.formelHtml(rigtigFormel(t).f) + "</b>" : "";
                Array.prototype.forEach.call(li.querySelectorAll("[data-formel]"), function (k) {
                    var nr = parseInt(k.getAttribute("data-formel"), 10);
                    k.classList.toggle("forkert", !!mig.forkerteFormler[nr]);
                    k.disabled = !!mig.forkerteFormler[nr] || mig.formelOk;
                });
            } else if (b === "tast" && kt) {
                kt.innerHTML = mig.tastVist !== null ? "Lommeregneren viser <b>" + NK.html(mig.tastVist) + "</b>" : "";
            }
        });
        this.rulNed();
    };

    /* Er kortet for lavt til det hele, ruller det, saa det aktive trin,
       beskeden og knappen kan ses (de staar nederst) */
    P.rulNed = function () {
        var k = this.el.kort;
        if (k.scrollHeight > k.clientHeight + 2) k.scrollTop = k.scrollHeight;
    };

    P.visKort = function () {
        NK.saetTekst(this.p + "-titel", this.opg.navn);
        NK.saetTekst(this.p + "-loest", String(this.loest));
        NK.saetHTML(this.p + "-prompt", this.opg.tekst);
        var k = this.el.knap;
        var tekst, klasse = "knap stor", laast = false;
        if (this.faerdig) {
            tekst = this.maaling ? "Måler …" : "Ny opgave";
            klasse = "knap stor blaa" + (this.maaling ? "" : " banker");
            laast = !!this.maaling;
        } else if (R.iDemo()) {
            tekst = "Taster …";
            laast = true;
        } else tekst = KNAP[this.bid][Math.min(this.hjaelp, 1)];
        if (k.textContent !== tekst) k.textContent = tekst;
        if (k.className !== klasse) k.className = klasse;
        k.disabled = laast;
        this.visKortIgen = R.iDemo();      /* opdater() tegner kortet igen, naar demoen slutter */
        this.el.kort.classList.toggle("sejr", this.faerdig && !this.maaling);
    };

    /* Linjen under scenen: altid det naeste skridt */
    P.visStatus = function () {
        var t, F = this.F.status;
        if (this.info) t = this.info.tekst;
        else if (R.iDemo()) t = "Lommeregneren taster selv. Se tasterne lyse op én ad gangen.";
        else if (this.maaling && this.maaling.t > 0) {
            t = this.faerdig ? F.maaler : "pH-metret måler pH i " + NK.html(this.opg.navn.toLowerCase()) + ".";
        } else if (this.faerdig) t = F.faerdig.replace("{ph}", "<b>" + K.phTekst(this.opg.slutPh !== undefined ? this.opg.slutPh : 0) + "</b>");
        else {
            var tr = this.trin();
            var foer = this.opg.trin.length > 1 ? "Trin " + (this.trinNr + 1) + " af " + this.opg.trin.length + ": " : "";
            if (this.bid === "formel") t = foer + "vælg formlen, der går fra " + this.stationNavn(this.fraNoegle(tr)) + " til " + NAVN[tr.til] + ". Knapperne står i opgaven.";
            else if (this.bid === "tast") t = foer + "tast udregningen på lommeregneren, og tryk =.";
            else if (tr.felt === "tal") t = foer + "tæl OH i formlen, og skriv tallet i feltet.";
            else t = foer + (tr.felt === "ph" ? "rund af til to decimaler, og skriv pH i feltet." : "skriv koncentrationen i felterne, og tryk Enter.");
            t = t.charAt(0).toUpperCase() + t.slice(1);
        }
        NK.saetHTML(this.p + "-status", t);
    };

    P.visInfo = function (tekst) {
        this.info = { tekst: tekst, ur: INFO };
        this.visStatus();
    };

    /* ----- Layout ---------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var kant = NK.klamp(W * 0.014, 8, 16);
        lay.kant = kant;
        lay.bordY = Math.round(H * 0.86);
        lay.px = NK.klamp(Math.min(W * 0.018, H * 0.03), 11, 17);

        /* Regnevejen: oeverst, med luft til knapperne om praesentationen */
        var sb = NK.klamp(W * 0.13, 76, 140), sh = NK.klamp(H * 0.085, 32, 58);
        var top = NK.klamp(H * 0.12, 10, 96);
        var raekkeY = top + lay.px * 1.9 + sh / 2;
        if (this.p === "staerk") {
            top = NK.klamp(H * 0.14, 10, 110);
            raekkeY = top + sh / 2 + sh + NK.klamp(H * 0.1, 40, 84);
        }
        var xs = { oh: W * 0.17, h: W * 0.5, ph: W * 0.83 };
        lay.st = {};
        ["oh", "h", "ph"].forEach(function (id) { lay.st[id] = { id: id, x: xs[id], y: raekkeY, b: sb, h: sh }; });
        if (this.p === "staerk") {
            lay.st.cb = { id: "c", noegle: "cb", x: xs.oh, y: top + sh / 2, b: sb, h: sh };
            lay.st.cs = { id: "c", noegle: "cs", x: xs.h, y: top + sh / 2, b: sb, h: sh };
        }
        var dy = sh * 0.2;
        var mel = function (a, b) { return { x0: a.x + a.b / 2 + 8, x1: b.x - b.b / 2 - 8 }; };
        var S = lay.st;
        var m1 = mel(S.oh, S.h), m2 = mel(S.h, S.ph);
        lay.pile = {
            "oh>h": { x0: m1.x0, y0: raekkeY - dy, x1: m1.x1, y1: raekkeY - dy, side: "over" },
            "h>oh": { x0: m1.x1, y0: raekkeY + dy, x1: m1.x0, y1: raekkeY + dy, side: "under" },
            "h>ph": { x0: m2.x0, y0: raekkeY - dy, x1: m2.x1, y1: raekkeY - dy, side: "over" },
            "ph>h": { x0: m2.x1, y0: raekkeY + dy, x1: m2.x0, y1: raekkeY + dy, side: "under" }
        };
        if (this.p === "staerk") {
            lay.pile["cb>oh"] = { x0: S.cb.x, y0: S.cb.y + sh / 2 + 5, x1: S.oh.x, y1: S.oh.y - sh / 2 - 5, side: "hoejre" };
            lay.pile["cs>h"] = { x0: S.cs.x, y0: S.cs.y + sh / 2 + 5, x1: S.h.x, y1: S.h.y - sh / 2 - 5, side: "hoejre" };
        }
        lay.pilPlads = m1.x1 - m1.x0 - 12;
        lay.pilPx = NK.klamp(lay.px - 1, 11, 16);
        lay.vejBund = raekkeY + sh / 2 + lay.px * 1.9;

        /* Bordet: glasset, kortet og pH-metret */
        var ctx = this.L.ctx;
        var plads2 = lay.bordY - lay.vejBund - 30;
        var hi = NK.klamp(Math.min(plads2, H * 0.4, W * 0.26, 280), 56, 280);
        lay.hi = hi;
        lay.kop = { x: kant + 24, y: lay.bordY };
        var mh = NK.klamp(hi * 0.85, 60, 210), mb = mh * 80 / 140;
        lay.meter = { x: W - kant - mb / 2 - 10, bund: lay.bordY, h: mh, b: mb };
        var gb = this.p === "staerk" ? hi * 90 / 140 : Tg.stofBredde(hi);
        lay.glas = { x: NK.klamp(W * 0.3, kant + 120, W * 0.5), b: gb };
        lay.etiketX = lay.glas.x + gb / 2 + 20;
        lay.etiketPx = NK.klamp(Math.min(W * 0.02, hi * 0.11), 12, 19);
        /* Kortet skal kunne vaere mellem glasset og pH-metret */
        var maks = lay.meter.x - mb / 2 - 16 - lay.etiketX;
        var proeve = this.opg ? this.opg.etiket.map(function (l) { return { navn: l.navn, vaerdi: "8,8 · 10⁻¹⁴ M" }; }) : [];
        while (proeve.length && lay.etiketPx > 10 && Tg.etiketMaal(ctx, proeve, lay.etiketPx).b > maks) lay.etiketPx -= 0.5;
        this.lay = lay;

        var a = S.oh, c = S.ph;
        var vejTop = this.p === "staerk" ? S.cb.y - sh / 2 : a.y - sh / 2 - lay.px * 1.9;
        this.saetAnker(this.p + "-anker-vej", a.x - a.b / 2 - 6, vejTop - 4, c.x + c.b / 2 - a.x + a.b / 2 + 12, lay.vejBund - vejTop + 6);
        this.saetAnker(this.p + "-anker-glas", lay.glas.x - gb / 2 - 8, lay.bordY - hi - 10, gb + 16, hi + 30);
        this.saetAnker(this.p + "-anker-meter", lay.meter.x - mb / 2 - 6, lay.bordY - mh - 8, mb + 12, mh + 12);
        var em = Tg.etiketMaal(ctx, proeve.length ? proeve : [{ navn: "pH", vaerdi: "0" }], lay.etiketPx);
        this.saetAnker(this.p + "-anker-etiket", lay.etiketX - 4, this.etiketY() - 4, em.b + 8, em.h + 8);
    };

    P.etiketY = function () {
        var lay = this.lay;
        return lay.bordY - lay.hi * 0.92;
    };

    P.saetAnker = function (id, x, y, b, h) {
        var e = NK.el(id);
        if (!e) return;
        e.style.left = Math.round(x) + "px";
        e.style.top = Math.round(y) + "px";
        e.style.width = Math.round(b) + "px";
        e.style.height = Math.round(h) + "px";
    };

    P.tilpas = function () {
        if (this.L.tilpas() || !this.lay) this.layout();
    };

    /* ----- Regnevejens tilstand -------------------------------------------------------
       En station ses, naar den er givet, eller naar opgaven er naaet til
       et trin, der bruger den. En pil ses, naar formlen er valgt. */
    P.stationSes = function (noegle) {
        var opg = this.opg, mig = this;
        if (noegle === "cs" || noegle === "cb") return (noegle === "cs") === !!opg.syre;
        if (opg.givet === noegle) return true;
        return opg.trin.some(function (t, i) {
            return i <= mig.trinNr && (t.til === noegle || t.fra === noegle);
        });
    };

    P.stationStatus = function (noegle) {
        var opg = this.opg;
        var id = noegle === "cs" || noegle === "cb" ? "c" : noegle;
        if (id === "c" || opg.givet === id) return "givet";
        var mig = this, i;
        for (i = 0; i < opg.trin.length; i++) {
            var t = opg.trin[i];
            if (t.til !== id) continue;
            if (mig.status[i] !== "aaben" && (i === opg.trin.length - 1 || opg.trin[i + 1].til !== id)) return "loest";
            if (i === mig.trinNr) return "maal";
        }
        return "neutral";
    };

    P.pilSes = function (n) { return !!this.kendte[n]; };

    P.pilStatus = function (n) {
        var mig = this, ud = "klar";
        this.opg.trin.forEach(function (t, i) {
            if (mig.pilNoegle(t) !== n) return;
            if (mig.status[i] !== "aaben") { if (ud === "klar") ud = "brugt"; }
            else if (i === mig.trinNr && !mig.faerdig) ud = "aktiv";
        });
        return ud;
    };

    /* Formlen paa pilen: den, eleven valgte (kort, hvis der ikke er plads) */
    P.pilEtiket = function (n) {
        if (!this.kendte[n]) return null;
        var mig = this, f = null;
        this.opg.trin.forEach(function (t) {
            if (mig.pilNoegle(t) === n && t.formler) f = rigtigFormel(t).f;
        });
        if (!f) return null;
        if (KORT[n] && this.lay && Tg.formelBredde(this.L.ctx, f, this.lay.pilPx, "700") > this.lay.pilPlads) return KORT[n];
        return f;
    };

    P.stationNavn = function (noegle) {
        if (noegle === "cs" || noegle === "cb") return "c(" + this.opg.flaske.formel + ")";
        return NAVN[noegle];
    };

    /* Hvor langt en station eller pil er kommet frem (0-1) */
    P.fremme = function (noegle, ses) {
        if (!ses) { delete this.frem[noegle]; return 0; }
        if (this.frem[noegle] === undefined) this.frem[noegle] = this.tid;
        return NK.klamp((this.tid - this.frem[noegle]) / FREM, 0, 1);
    };

    /* ----- Tegneloekken ---------------------------------------------------------------- */
    P.opdater = function (dt) {
        this.tid += dt;
        if (this.ind < 1) this.ind = Math.min(1, this.ind + dt / POP);
        var mig = this;
        Object.keys(this.nyt).forEach(function (i) { mig.nyt[i] = Math.min(1, mig.nyt[i] + dt / NY); });
        var m = this.maaling;
        if (m) {
            m.t += dt / MAALER;
            if (m.t < 0.3) this.visning = "--,--";
            else if (m.t < 0.8) this.visning = K.phTekst((Math.floor(this.tid * 17) % 1400) / 100);
            else this.visning = K.phTekst(m.ph);
            if (m.t >= 1) {
                this.maaling = null;
                this.maalt = true;
                this.visning = K.phTekst(m.ph);
                this.visKort();
            }
        }
        if (this.info) {
            this.info.ur -= dt;
            if (this.info.ur <= 0) this.info = null;
        }
        if (this.ventRos > 0) {
            this.ventRos -= dt;
            if (this.ventRos <= 0 && this.laererRos) this.laererRos(D.ROS[this.p]);
        }
        this.visStatus();
        if (this.visKortIgen !== R.iDemo()) { this.visKortIgen = R.iDemo(); this.visKort(); }
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
    };

    /* Elektrodens spids: i hvile over glasset, dykket under maalingen */
    P.elektrodeSpids = function () {
        var lay = this.lay, gl = lay.glas;
        var x = gl.x + (this.p === "staerk" ? 0 : gl.b * 0.12);
        var hvile = { x: x, y: lay.bordY - lay.hi * (this.p === "staerk" ? 1.02 : 0.86) - 14 };
        var m = this.maaling;
        if (!m || m.t <= 0) return hvile;
        var ned = this.p === "staerk" ? lay.bordY - lay.hi * 0.35 : lay.bordY - lay.hi * 0.42;
        var t = m.t, u = t < 0.2 ? NK.blod(t / 0.2) : (t > 0.88 ? 1 - NK.blod((t - 0.88) / 0.12) : 1);
        return { x: x, y: NK.lerp(hvile.y, ned, u) };
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var mig = this, opg = this.opg;
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 12);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.H);

        /* Koppen */
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand) {
            var kk = NK.klamp(lay.H / 600, 0.8, 1.3);
            NK.Sprites.tegn(ctx, "kaffekop", lay.kop.x - 18 * kk, lay.kop.y - 40 * kk, 42 * kk, 40 * kk);
        }

        /* pH-metret */
        var M = lay.meter;
        var ud = Tg.phmeter(ctx, M.x, M.bund, M.h, this.visning, { lys: this.over && this.over.slags === "meter" ? 0.8 : 0 });

        /* Glasset eller flasken, der springer frem */
        var gl = lay.glas;
        var k = NK.pop(this.ind);
        var lysGlas = this.over && this.over.slags === "glas" ? 0.8 : 0;
        var snor;
        ctx.save();
        ctx.translate(gl.x, lay.bordY);
        ctx.scale(k, k);
        if (this.p === "staerk") {
            var fl = opg.flaske;
            var r = Tg.flaske(ctx, 0, 0, gl.b, [
                { t: fl.formel, px: NK.klamp(gl.b * 0.2, 10, 20), vaegt: "800" },
                { t: K.decimal(opg.c) + " M", px: NK.klamp(gl.b * 0.16, 9, 16), vaegt: "700" }
            ], null, { lys: lysGlas });
            snor = { x: gl.x + gl.b * 0.12, y: lay.bordY + (r.halsY) + 6 };
        } else {
            Tg.stof(ctx, opg.stof, 0, 0, lay.hi, { lys: lysGlas });
            snor = { x: gl.x + gl.b * 0.3, y: lay.bordY - lay.hi * 0.62 };
        }
        ctx.restore();
        Tg.navn(ctx, this.p === "staerk" ? opg.flaske.navn : opg.navn, gl.x, lay.bordY + 16, NK.klamp(lay.px, 12, 15));

        /* Elektroden */
        var sp = this.elektrodeSpids();
        Tg.elektrode(ctx, ud, sp.x, sp.y, NK.klamp(lay.hi * 0.5, 30, 64));

        /* Kortet (etiketten) */
        if (this.ind > 0.6) {
            var linjer = opg.etiket.map(function (l) {
                var v = { navn: l.navn, trykt: l.trykt };
                if (l.trykt) {
                    if (!l.maales || mig.maalt) v.vaerdi = l.vaerdi;
                } else {
                    var st = mig.status[l.trin];
                    if (st === "loest" || st === "vist") {
                        var t = opg.trin[l.trin];
                        v.vaerdi = st === "vist" ? t.facitTekst : (t.elevSvar || t.facitTekst);
                        v.vist = st === "vist";
                        v.ny = mig.nyt[l.trin];
                    } else v.maal = l.trin === mig.trinNr && !mig.faerdig;
                }
                return v;
            });
            ctx.save();
            ctx.globalAlpha = NK.klamp((this.ind - 0.6) / 0.4, 0, 1);
            var er = Tg.etiket(ctx, lay.etiketX, this.etiketY(), linjer, lay.etiketPx, snor, this.tid);
            ctx.restore();
            if (this.over && this.over.slags === "etiket") {
                ctx.save();
                ctx.strokeStyle = "rgba(242, 197, 61, 0.9)";
                ctx.lineWidth = 2.5;
                NK.rundtRekt(ctx, er.x - 3, er.y - 3, er.b + 6, er.h + 6, 7);
                ctx.stroke();
                ctx.restore();
            }
            this.etiketRekt = er;
        }

        /* Regnevejen, oven paa pH-metrets ledning: pilene foerst, saa stationerne.
           En ny pil vokser frem fra sin start, en ny station toner frem. */
        /* Vejen, der mangler: en svag stiplet linje med ? mellem det, man
           kender, og det, man skal finde, til formlen er valgt */
        if (!this.faerdig) {
            var n0 = this.pilNoegle(this.trin());
            var p0 = lay.pile[n0];
            if (p0 && !this.pilSes(n0) && this.fremme("s" + this.trin().til, true) >= 1) Tg.vejMangler(ctx, p0, lay.pilPx, this.tid);
        }
        Object.keys(lay.pile).forEach(function (n) {
            var u = mig.fremme("p" + n, mig.pilSes(n));
            if (u <= 0) return;
            var p = lay.pile[n], v = NK.blod(u);
            ctx.save();
            ctx.globalAlpha *= v;
            Tg.vejPil(ctx, {
                x0: p.x0, y0: p.y0, x1: NK.lerp(p.x0, p.x1, v), y1: NK.lerp(p.y0, p.y1, v), side: p.side, px: lay.pilPx,
                status: mig.pilStatus(n), etiket: u >= 1 ? mig.pilEtiket(n) : null,
                lys: mig.over && mig.over.slags === "pil" && mig.over.n === n
            }, mig.tid);
            ctx.restore();
        });
        Object.keys(lay.st).forEach(function (n) {
            var u = mig.fremme("s" + n, mig.stationSes(n));
            if (u <= 0) return;
            var s = lay.st[n];
            ctx.save();
            ctx.globalAlpha *= NK.blod(u);
            Tg.station(ctx, {
                id: s.id, x: s.x, y: s.y, b: s.b, h: s.h, navn: mig.stationNavn(n), status: mig.stationStatus(n),
                lys: mig.over && mig.over.slags === "station" && mig.over.n === n
            }, mig.tid);
            ctx.restore();
        });

        if (this.laererTegnOver) this.laererTegnOver(ctx);
    };

    /* ----- Musen ------------------------------------------------------------------------- */
    function iRekt(pt, x, y, b, h) { return pt.x >= x && pt.x <= x + b && pt.y >= y && pt.y <= y + h; }

    function naerLinje(pt, p) {
        var dx = p.x1 - p.x0, dy = p.y1 - p.y0, l2 = dx * dx + dy * dy || 1;
        var t = NK.klamp(((pt.x - p.x0) * dx + (pt.y - p.y0) * dy) / l2, 0, 1);
        var x = p.x0 + t * dx, y = p.y0 + t * dy;
        return Math.sqrt((pt.x - x) * (pt.x - x) + (pt.y - y) * (pt.y - y));
    }

    P.hvadErUnder = function (pt) {
        var lay = this.lay;
        if (!lay) return null;
        if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return { slags: "laerer" };
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand && Math.abs(pt.x - lay.kop.x) < 30 && pt.y < lay.kop.y + 4 && pt.y > lay.kop.y - 60) return { slags: "kop" };
        var n;
        for (n in lay.st) {
            var s = lay.st[n];
            if (!this.stationSes(n)) continue;
            if (iRekt(pt, s.x - s.b / 2, s.y - s.h / 2, s.b, s.h)) return { slags: "station", n: n };
        }
        for (n in lay.pile) {
            if (!this.pilSes(n)) continue;
            if (naerLinje(pt, lay.pile[n]) < 10) return { slags: "pil", n: n };
        }
        var er = this.etiketRekt;
        if (er && iRekt(pt, er.x, er.y, er.b, er.h)) return { slags: "etiket" };
        var M = lay.meter;
        if (Math.abs(pt.x - M.x) <= M.b / 2 && pt.y <= M.bund && pt.y >= M.bund - M.h) return { slags: "meter" };
        var gl = lay.glas;
        if (Math.abs(pt.x - gl.x) <= gl.b / 2 && pt.y <= lay.bordY && pt.y >= lay.bordY - lay.hi) return { slags: "glas" };
        return null;
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointermove", function (e) {
            mig.over = mig.hvadErUnder(mig.L.punkt(e));
            c.style.cursor = mig.over ? "pointer" : "default";
        });
        c.addEventListener("pointerleave", function () { mig.over = null; c.style.cursor = "default"; });
        c.addEventListener("pointerup", function (e) { mig.klik(mig.L.punkt(e)); });
    };

    P.klik = function (pt) {
        if (this.laererIntroKlik && this.laererIntroKlik(pt.x, pt.y)) return;
        if (this.laererKlik && this.laererKlik(pt.x, pt.y)) return;
        var u = this.hvadErUnder(pt);
        if (!u) return;
        var opg = this.opg;
        if (u.slags === "kop" && this.klikKop) { this.klikKop(); return; }
        if (u.slags === "station") {
            var id = u.n === "cs" || u.n === "cb" ? "c" : u.n;
            this.visInfo(NK.html(D.STATION[id]));
            return;
        }
        if (u.slags === "pil") {
            var f = this.pilEtiket(u.n);
            var dele = u.n.split(">");
            this.visInfo("Formlen på pilen er <b>" + K.formelHtml(f || "") + "</b>. Den går fra " +
                this.stationNavn(dele[0] === "cs" || dele[0] === "cb" ? dele[0] : dele[0]) + " til " + NAVN[dele[1]] + ".");
            return;
        }
        if (u.slags === "etiket") {
            this.visInfo("Kortet viser det, du ved. Et ? er det, du skal finde. Dine rigtige svar bliver skrevet på kortet.");
            return;
        }
        if (u.slags === "meter") {
            if (this.maaling) this.visInfo("pH-metret måler lige nu.");
            else if (this.maalt) this.visInfo("pH-metret viser pH <b>" + this.visning + "</b>.");
            else this.visInfo("pH-metret måler pH, når du har skrevet det rigtige svar.");
            return;
        }
        if (u.slags === "glas") {
            if (this.p === "staerk") {
                this.visInfo("Flasken med " + NK.html(opg.flaske.navn.toLowerCase()) + ", " + NK.html(opg.flaske.formel) +
                    ". På flasken står koncentrationen: " + K.decimal(opg.c) + " M.");
            } else {
                this.visInfo("Glasset med " + NK.html(opg.navn.toLowerCase()) + ". Kortet ved siden af viser det, du ved, og et ? ved det, du skal finde.");
            }
        }
    };

    /* Tastaturet uden for felterne gaar til lommeregneren */
    P.tast = function (e) { return R.tast(e); };

    P.nulstil = function () { this.nyOpgave(); };

    /* ----- Kemichaels praesentation ---------------------------------------------------
       Tilbuddet (js/praesentation.js) er bundet til én fane pr. prototype,
       saa hver fane faar sin egen lille underklasse af SimRegn. Mens han
       siger, at man bruger lommeregneren, lyser den. */
    P.pegPaaFelt = function (til) {
        var r = NK.el("regner");
        til = !!til && this.p !== "staerk";
        if (r && this.pegRegner !== til) { this.pegRegner = til; r.classList.toggle("peg", til); }
    };

    function fane(p) {
        function Fane() { SimRegn.call(this, p); }
        Fane.prototype = Object.create(SimRegn.prototype);
        Fane.prototype.constructor = Fane;
        NK.Praesentation.kobl(Fane.prototype, { noegle: "nk-sc7.3-intro-" + p, tilbud: p + "-tilbud", spring: p + "-spring" });
        return Fane;
    }

    NK.SimRegn = SimRegn;
    NK.SimPh = fane("ph");
    NK.SimKonc = fane("konc");
    NK.SimStaerk = fane("staerk");
}());
