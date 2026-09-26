/* =====================================================================
   sim_forsoeg.js - fane 1: forsoeget

   Otte stoffer testes i et glas vand og et glas heptan. Eleven vaelger
   stoffet i skemaet, traekker pipetten (eller spatlen) ned i et glas og
   klikker paa glasset for at ryste det. Naar det har lagt sig, skrives
   iagttagelsen i skemaet: ét lag, to lag, oploest eller oploeses ikke.

   Et nyt stof faar nye glas. Et klik paa et tomt glas er det samme som
   at traekke pipetten derhen (foerste opgave uden forklaring).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var M = NK.Molekyle;

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

        this.bordStart();
        this.bygPanel();
        this.bygTilbud();
        if (this.laererStart) this.laererStart();
        this.vaelg("heptan");
    }

    var P = SimForsoeg.prototype;
    NK.Bord.kobl(P, { prefix: "forsoeg" });

    /* ----- Stoffet og skemaet ------------------------------------------------ */
    P.vaelg = function (id) {
        if (id === this.stof && this.glas) return;
        this.stof = id;
        this.nyeGlas();
        this.besked = null;
        this.visPanel();
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

    P.startForfra = function () {
        this.skema = {};
        this.stof = null;
        this.vaelg(D.FORSOEG[1]);
    };

    /* ----- Krogene fra bordet -------------------------------------------------- */
    P.maaTilsaette = function (i) {
        var g = this.glas[i];
        return !g.fuld() && !g.optaget();
    };

    P.klikGlas = function (i) {
        var g = this.glas[i];
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
        return !this.proevetAt && this.glas[0].tom() && this.glas[1].tom();
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
            knap.innerHTML = NK.html(s.navn) + "<em>" + NK.formel(s.formel) + "</em>";
            knap.addEventListener("click", function () { knap.blur(); mig.vaelg(id); });
            navn.appendChild(knap);
            tr.appendChild(navn);
            var celler = {};
            D.OPL.forEach(function (o) {
                var td = document.createElement("td");
                td.className = "skema-celle";
                td.addEventListener("click", function () { mig.vaelg(id); });
                tr.appendChild(td);
                celler[o] = td;
            });
            tb.appendChild(tr);
            mig.raekker[id] = { tr: tr, celler: celler };
        });
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
        });
        NK.saetTekst("forsoeg-udfyldt", String(this.antalUdfyldt()));
        NK.el("forsoeg-skema").classList.toggle("sejr", this.skemaFuldt());
    };

    /* ----- Tastatur ----------------------------------------------------------------- */
    P.tast = function (key) {
        if (key === "ArrowDown") { this.naeste(1); return true; }
        if (key === "ArrowUp") { this.naeste(-1); return true; }
        if (key === " ") {
            this.glas.forEach(function (g) { if (g.portioner > 0) g.ryst(); });
            return true;
        }
        return false;
    };

    P.fokus = function () {};

    /* ----- Kemichaels praesentation --------------------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc3.5-intro-forsoeg", tilbud: "forsoeg-tilbud", spring: "forsoeg-spring" });

    NK.SimForsoeg = SimForsoeg;

    /* Til selvtesten */
    SimForsoeg.molekyle = function (id) { return M.laes(D.stof(id)); };
}());
