/* =====================================================================
   sim_forsoeg.js - fane 1: forsoeget

   Foerste trin er teorikortet (brugerens oenske 22. okt. 2026): vand er
   polaert, heptan er upolaert, og stoffer, der ligner hinanden, blandes.
   Over glassene staar det samme som maerker. Proeveglasset og kortet med
   formlen kommer foerst frem, naar eleven trykker Test stofferne (eller
   vaelger et stof i skemaet).

   Seks stoffer testes i et glas vand og et glas heptan. Vand og heptan
   selv tilsaettes ikke; de er oploesningsmidlerne. Eleven vaelger stoffet
   i skemaet, traekker pipetten (eller spatlen) ned i et glas og klikker
   paa glasset for at ryste det. Naar det har lagt sig, skrives
   iagttagelsen i skemaet: ét lag, to lag, oploest eller oploeses ikke.
   Er stoffet testet i begge glas, staar konklusionen forneden paa kortet
   ("Glycerol blandes med vand, saa det er polaert.") og i skemaet.

   Et nyt stof faar nye glas. Et klik paa et tomt glas er det samme som
   at traekke pipetten derhen (foerste opgave uden forklaring).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var M = NK.Molekyle;
    var T = NK.Tegn;

    var ROS_NOEGLE = "nk-sc3.5-skema-ros";

    function SimForsoeg() {
        this.L = new NK.Laerred(NK.el("forsoeg-laerred"));
        this.tid = 0;
        this.lay = null;
        this.g = { kaffekop: { skjult: true, iHaand: false } };
        this.skema = {};
        this.besked = null;
        this.stof = null;
        this.proevetAt = false;
        this.teori = true;

        this.bordStart();
        this.bygPanel();
        this.bygTeori();
        this.bygTilbud();
        if (this.laererStart) this.laererStart();
        this.vaelg(D.FORSOEG[0]);
        this.visTeori();
    }

    var P = SimForsoeg.prototype;
    NK.Bord.kobl(P, { prefix: "forsoeg", bundFelt: true });

    /* ----- Teorikortet: foerste trin ------------------------------------------- */
    P.bygTeori = function () {
        var mig = this, boks = NK.el("forsoeg-teori");
        Array.prototype.forEach.call(boks.querySelectorAll("[data-tekst]"), function (e) {
            e.textContent = D.TEORI[e.getAttribute("data-tekst")];
        });
        NK.el("forsoeg-teori-videre").addEventListener("click", function () { mig.afslutTeori(); });
        this.teoriMol = Array.prototype.map.call(boks.querySelectorAll(".tk-mol"), function (c) {
            return { L: new NK.Laerred(c), stof: c.getAttribute("data-stof") };
        });
    };

    P.visTeori = function () {
        var t = this.teori;
        NK.el("forsoeg-teori").hidden = !t;
        NK.el("forsoeg-skema").classList.toggle("daempet", t);
        /* Rundvisningen springer over det, der ikke er fremme */
        NK.el("forsoeg-anker-proeve").hidden = t;
        NK.el("forsoeg-anker-kort").hidden = t;
        if (t) {
            if (this.visTilbud && this.tilbudVises) this.visTilbud(false);
            this.placerTeori();
        }
    };

    P.afslutTeori = function () {
        if (!this.teori) return false;
        this.teori = false;
        this.besked = null;
        this.visTeori();
        /* Tilbuddet om praesentationen kommer, naar der er noget at vise */
        this.startIntro(false);
        return true;
    };

    P.skjulProeve = function () { return this.teori; };
    P.skjulKort = function () { return this.teori; };
    P.maaTraekke = function () { return !this.teori; };
    P.efterLayout = function () { if (this.teori) this.placerTeori(); };

    /* Kortet staar paa lay.teori. Formlerne faar samme bindingslaengde u, saa
       de to molekyler kan sammenlignes. Kortet proever vand og heptan under
       hinanden og side om side (klassen "to") og tager den opstilling, der
       giver de stoerste formler og stadig kan vaere i hoejden. Kan ingen
       vaere der, proeves en lidt mindre skrift (klassen "lille"), saa mere
       hoejde (lay.teori.maksHFuld: ned over bordkanten, paa en smal scene
       ned over glassene) og til sidst uden de to smaa forklaringer
       (klassen "kompakt"; tegningen og maerkerne staar der stadig).
       Ellers ruller kortet, og knappen bliver staaende forneden. */
    var TEORI_HOEJ = 3;                    /* lærrederne er 3 bindingslaengder hoeje */
    var TEORI_U = { maks: 34, min: 18, minLille: 16 };

    P.placerTeori = function () {
        var lay = this.lay, boks = NK.el("forsoeg-teori");
        if (!lay || !lay.teori || boks.hidden) return;
        var r = lay.teori, ml = this.teoriMol;
        boks.style.left = Math.round(r.x) + "px";
        boks.style.top = Math.round(r.y) + "px";
        boks.style.width = Math.round(r.b) + "px";
        var gH = M.graense(M.laes(D.stof("heptan"))), gV = M.graense(M.laes(D.stof("vand")));

        function saet(v, u) {
            boks.classList.toggle("to", v.to);
            boks.classList.toggle("lille", v.lille);
            boks.classList.toggle("kompakt", v.kompakt);
            if (u) ml.forEach(function (m) { m.L.canvas.style.height = Math.round(u * TEORI_HOEJ) + "px"; });
        }
        /* Den stoerste u, der kan vaere i hoejden, eller -1 */
        function proev(v) {
            saet(v, 0);
            var bH = ml[1].L.canvas.clientWidth, bV = ml[0].L.canvas.clientWidth;
            var u = Math.floor(Math.min(TEORI_U.maks, bH / (gH.x1 - gH.x0 + 1.3), bV / (gV.x1 - gV.x0 + 2.4)));
            var mindst = v.lille ? TEORI_U.minLille : TEORI_U.min;
            for (; u >= mindst; u--) {
                saet(v, u);
                if (boks.scrollHeight <= boks.clientHeight) return u;
            }
            return -1;
        }
        /* Den mindre skrift skal give formler, der er mindst 4 px stoerre */
        function find(maksH, kompakt) {
            boks.style.maxHeight = Math.round(maksH) + "px";
            var bedst = null;
            [false, true].forEach(function (lille) {
                if (kompakt && !lille) return;
                [false, true].forEach(function (to) {
                    if (to && r.b < 440) return;
                    var v = { to: to, lille: lille, kompakt: kompakt, maksH: maksH };
                    v.u = proev(v);
                    v.point = v.u - (lille ? 4 : 0);
                    if (v.u > 0 && (!bedst || v.point > bedst.point)) bedst = v;
                });
            });
            return bedst;
        }

        /* Ned over bordkanten kun, naar det giver tydeligt stoerre formler */
        var bedst = find(r.maksH, false);
        if ((!bedst || bedst.u < 26) && r.maksHFuld > r.maksH + 20) {
            var dyb = find(r.maksHFuld, false);
            if (dyb && (!bedst || dyb.point >= bedst.point + 4)) bedst = dyb;
        }
        bedst = bedst || find(r.maksHFuld, true) ||
            { to: r.b >= 440, lille: true, kompakt: true, maksH: r.maksHFuld, u: TEORI_U.minLille };
        boks.style.maxHeight = Math.round(bedst.maksH) + "px";
        saet(bedst, bedst.u);
        this.teoriU = bedst.u;
        this.teoriValg = bedst;
        this.tegnTeoriMol();
    };

    P.tegnTeoriMol = function () {
        var u = this.teoriU;
        this.teoriMol.forEach(function (m) {
            m.L.tilpas();
            var ctx = m.L.ctx;
            ctx.clearRect(0, 0, m.L.b, m.L.h);
            var mol = M.laes(D.stof(m.stof));
            var plan = M.plan(mol, { x: 0, y: 0, b: m.L.b, h: m.L.h }, u);
            M.tegn(ctx, mol, plan, {});
            if (m.stof === "vand") T.delta(ctx, mol, plan);
            m.plan = plan;
        });
    };

    /* ----- Stoffet og skemaet ------------------------------------------------ */
    P.vaelg = function (id) {
        if (id === this.stof && this.glas) return;
        this.stof = id;
        this.nyeGlas();
        this.besked = null;
        this.visPanel();
    };

    /* Et klik paa et stof i skemaet: under teorikortet betyder det ogsaa "videre" */
    P.vaelgFraSkema = function (id) {
        this.afslutTeori();
        this.vaelg(id);
    };

    P.naeste = function (retning) {
        var i = D.FORSOEG.indexOf(this.stof);
        this.vaelg(D.FORSOEG[(i + retning + D.FORSOEG.length) % D.FORSOEG.length]);
    };

    P.antalUdfyldt = function () {
        var mig = this, n = 0;
        D.FORSOEG.forEach(function (id) {
            D.OPL.forEach(function (o) { if (mig.skema[id] && mig.skema[id][o]) n++; });
        });
        return n;
    };

    P.skemaFuldt = function () { return this.antalUdfyldt() === D.FORSOEG.length * D.OPL.length; };

    P.nulstil = function () {
        this.nyeGlas();
        this.besked = null;
    };

    /* Forfra: tomt skema og teorikortet igen */
    P.startForfra = function () {
        this.skema = {};
        this.stof = null;
        this.proevetAt = false;
        this.vaelg(D.FORSOEG[0]);
        this.teori = true;
        this.visTeori();
    };

    /* Stoffet er testet i begge glas */
    P.testet = function (id) {
        var s = this.skema[id];
        return !!s && D.OPL.every(function (o) { return !!s[o]; });
    };

    /* ----- Krogene fra bordet -------------------------------------------------- */
    P.maaTilsaette = function (i) {
        var g = this.glas[i];
        return !this.teori && !g.fuld() && !g.optaget();
    };

    P.klikGlas = function (i) {
        var g = this.glas[i];
        if (this.teori) {
            var opl = D.stof(D.OPL[i]);
            this.visBesked("Glasset med " + opl.navn + ": " + opl.navn + " er " + D.polaritet(opl.id) +
                ". <b>Tryk på " + D.TEORI.knap + "</b> for at tilsætte et stof.");
            return;
        }
        if (g.optaget()) return;
        if (g.portioner === 0) {
            if (this.pipHjemme() && this.maaTilsaette(i)) this.sendTil(i);
            return;
        }
        g.ryst();
        if (this.afvisTilbud) this.afvisTilbud();
    };

    P.efterTilsaet = function () {
        this.proevetAt = true;
        this.besked = null;
    };

    P.klikProeve = function () {
        this.visBesked("Træk " + this.redskabNavn() + " ned i et af glassene.");
    };

    P.klikKort = function () {
        this.visBesked("Strukturformlen for " + D.stof(this.stof).navn + ". De polære grupper finder du på fane 2.");
    };

    P.slipVed = function () {
        this.visBesked("Slip " + this.redskabNavn() + " over et af glassene.");
    };

    P.visTraekPil = function () {
        return !this.teori && !this.proevetAt && this.glas[0].tom() && this.glas[1].tom();
    };

    /* Forneden paa kortet: spoergsmaalet, til begge glas er testet, saa svaret */
    P.tegnKortBund = function (ctx, r) {
        var s = this.stof;
        if (this.testet(s)) T.konklusion(ctx, r, D.konklusion(s), D.polaer(s));
        else T.konklusion(ctx, r, D.SPOERG_POLARITET, null);
    };

    P.redskabNavn = function () { return this.redskab() === "spatel" ? "spatlen" : "pipetten"; };

    P.visBesked = function (html) { this.besked = { html: html, t: 3 }; };

    /* ----- Tegneloekken ----------------------------------------------------------- */
    P.opdater = function (dt) {
        this.tid += dt;
        this.bordOpdater(dt);
        var mig = this;
        this.glas.forEach(function (g) {
            if (!g.nyt) return;
            g.nyt = false;
            mig.skema[mig.stof] = mig.skema[mig.stof] || {};
            mig.skema[mig.stof][g.opl] = g.resultat;
            if (mig.afvisTilbud) mig.afvisTilbud();
            mig.visPanel();
            if (mig.skemaFuldt() && !NK.hent(ROS_NOEGLE, false)) {
                NK.gem(ROS_NOEGLE, true);
                mig.rosVent = 1.2;
            }
        });
        /* Paaskeaegget: at ryste et glas, der for laengst er faerdigt */
        if (!this.paaskeVist) {
            this.glas.forEach(function (g) {
                if (!mig.paaskeVist && g.resultat && g.rystEfter >= 6 && mig.laererRyst) {
                    mig.paaskeVist = true;
                    mig.laererRyst(g.resultat.blandes);
                }
            });
        }
        if (this.rosVent > 0) {
            this.rosVent -= dt;
            if (this.rosVent <= 0 && this.laererSkema) this.laererSkema();
        }
        if (this.besked) {
            this.besked.t -= dt;
            if (this.besked.t <= 0) this.besked = null;
        }
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
        this.visStatus();
    };

    P.tegn = function () {
        if (!this.lay) return;
        this.bordTegn();
        if (this.laererTegnOver) this.laererTegnOver(this.L.ctx);
    };

    /* ----- Linjen under scenen: hele tiden det naeste skridt ------------------------ */
    function glasNavn(opl) { return opl === "vand" ? "vandglasset" : "heptanglasset"; }
    function stort(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

    P.statusTekst = function () {
        if (this.besked) return this.besked.html;
        if (this.teori) return "Læs kortet om vand og heptan. <b>Tryk så på " + D.TEORI.knap + ".</b>";
        var s = D.stof(this.stof), g = this.glas;
        var redskab = this.redskabNavn();
        if (this.pip.tilstand === "traek") {
            return this.over >= 0 ? "Slip, så " + (s.tilstand === "fast" ? "kommer stoffet" : "drypper den") + " ned i " + glasNavn(D.OPL[this.over]) + "."
                                  : "Hen over et af glassene.";
        }
        var i;
        for (i = 0; i < 2; i++) {
            if (g[i].mereAtRyste()) return "Der ligger stadig " + s.navn + " på bunden af " + glasNavn(g[i].opl) + ". <b>Ryst igen.</b>";
        }
        for (i = 0; i < 2; i++) {
            if (g[i].portioner > 0 && !g[i].rystet && !g[i].optaget()) return "<b>Klik på " + glasNavn(g[i].opl) + "</b> for at ryste det.";
        }
        for (i = 0; i < 2; i++) {
            if (g[i].optaget() || (g[i].rystet && !g[i].resultat)) return "Vent, til det har lagt sig.";
        }
        if (g[0].resultat && g[1].resultat) {
            if (this.skemaFuldt()) return "Skemaet er fuldt. På fane 2 gætter du, før du tester.";
            return "Begge glas er testet. <b>Vælg et nyt stof i skemaet.</b>";
        }
        for (i = 0; i < 2; i++) {
            if (g[i].resultat) {
                return stort(s.navn) + " i " + D.stof(g[i].opl).navn + ": <b>" + g[i].resultat.obs + "</b>. Prøv nu " + glasNavn(g[1 - i].opl) + ".";
            }
        }
        return "<b>Træk " + redskab + "</b> med " + s.navn + " ned i et af glassene.";
    };

    P.visStatus = function () { NK.saetHTML("forsoeg-status", this.statusTekst()); };

    /* ----- Panelet: skemaet, der ogsaa er valget af stof ---------------------------- */
    P.bygPanel = function () {
        var mig = this, tb = NK.el("forsoeg-raekker");
        this.raekker = {};
        D.FORSOEG.forEach(function (id) {
            var s = D.stof(id);
            var tr = document.createElement("tr");
            tr.className = "skema-raekke";
            tr.setAttribute("data-stof", id);
            var navn = document.createElement("th");
            navn.scope = "row";
            var knap = document.createElement("button");
            knap.type = "button";
            knap.className = "skema-stof";
            knap.innerHTML = NK.html(s.navn) + "<em>" + NK.formel(s.formel) + "<span class=\"skema-pol\"></span></em>";
            knap.addEventListener("click", function () { knap.blur(); mig.vaelgFraSkema(id); });
            navn.appendChild(knap);
            tr.appendChild(navn);
            var celler = {};
            D.OPL.forEach(function (o) {
                var td = document.createElement("td");
                td.className = "skema-celle";
                td.addEventListener("click", function () { mig.vaelgFraSkema(id); });
                tr.appendChild(td);
                celler[o] = td;
            });
            tb.appendChild(tr);
            mig.raekker[id] = { tr: tr, celler: celler, pol: knap.querySelector(".skema-pol") };
        });
        NK.saetTekst("forsoeg-felter", String(D.FORSOEG.length * D.OPL.length));
        NK.el("forsoeg-nulstil").addEventListener("click", function () { mig.startForfra(); });
        NK.el("forsoeg-spring").addEventListener("click", function () { mig.springIntro(); });
    };

    P.visPanel = function () {
        var mig = this;
        D.FORSOEG.forEach(function (id) {
            var r = mig.raekker[id];
            r.tr.classList.toggle("valgt", id === mig.stof);
            D.OPL.forEach(function (o) {
                var res = mig.skema[id] && mig.skema[id][o];
                var td = r.celler[o];
                td.className = "skema-celle" + (res ? (res.blandes ? " ja" : " nej") : "");
                td.textContent = res ? (res.blandes ? "✓ " : "✗ ") + res.obs : "";
            });
            /* Konklusionen under navnet, naar begge glas er testet */
            var t = mig.testet(id);
            r.pol.textContent = t ? D.polaritet(id) : "";
            r.pol.className = "skema-pol" + (t ? (D.polaer(id) ? " polaer" : " upolaer") : "");
        });
        NK.saetTekst("forsoeg-udfyldt", String(this.antalUdfyldt()));
        NK.el("forsoeg-skema").classList.toggle("sejr", this.skemaFuldt());
    };

    /* ----- Tastatur ----------------------------------------------------------------- */
    P.tast = function (key) {
        if (this.teori) {
            if (key === "ArrowDown" || key === "ArrowUp") { this.afslutTeori(); return true; }
            return key === " ";
        }
        if (key === "ArrowDown") { this.naeste(1); return true; }
        if (key === "ArrowUp") { this.naeste(-1); return true; }
        if (key === " ") {
            this.glas.forEach(function (g) { if (g.portioner > 0) g.ryst(); });
            return true;
        }
        return false;
    };

    /* Enter: videre fra teorikortet */
    P.enter = function () { this.afslutTeori(); };

    P.fokus = function () {};

    /* ----- Kemichaels praesentation --------------------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc3.5-intro-forsoeg", tilbud: "forsoeg-tilbud", spring: "forsoeg-spring" });

    /* Mens teorikortet staar, tilbydes praesentationen ikke (den handler om
       pipetten, der ikke er fremme endnu). K springer teorikortet over. */
    var startIntro = P.startIntro;
    P.startIntro = function (tving) {
        if (this.teori) {
            if (!tving) return;
            this.afslutTeori();
        }
        return startIntro.call(this, tving);
    };

    NK.SimForsoeg = SimForsoeg;

    /* Til selvtesten */
    SimForsoeg.molekyle = function (id) { return M.laes(D.stof(id)); };
}());
