/* =====================================================================
   sim_isomerer.js - fane 4: isomerer (den gamle 6.3)

   Formlen staar i panelet: C4H10, C5H12, C6H14 eller C7H16 (2, 3, 5 og 9
   isomerer). Eleven tegner et molekyle. Naar alle C-atomer er brugt,
   navngives det. Et nyt navn kommer i listen, og tavlen ryddes. Et navn,
   der allerede er fundet, er det samme stof tegnet paa en anden maade:
   dets plads i listen ryster, og tavlen bliver staaende.

   Isomererne og deres tegninger laves af NK.Opgaver.isomerer(n).
   Alle niveauer kan vaelges; det naeste banker, naar et er klaret.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var O = NK.Opgaver;
    var GROEN = "#1d7a48", BLAA = "#2563eb";
    var NIVEAUER = [4, 5, 6, 7];

    function SimIsomerer() {
        this.n = 4;
        this.fundet = {};
        this.vist = {};
        NIVEAUER.forEach(function (n) { this.fundet[n] = []; this.vist[n] = {}; }, this);
        this.startFane();
        this.bygPanel();
        this.nytNiveau(4);
    }

    var P = SimIsomerer.prototype;
    NK.Fane.bland(P, "is");

    P.regler = function () {
        var mig = this;
        return {
            kunC: true, dobbelt: false, knaek: true, sletAlt: false,
            maks: function () { return mig.n; },
            maksTekst: function () { return "Alle " + mig.n + " C-atomer er brugt."; }
        };
    };

    P.isomerer = function () { return O.isomerer(this.n); };

    P.nytNiveau = function (n) {
        this.n = n;
        this.hjaelp = 0;
        this.ryd = 0;
        this.sidst = null;
        this.besked("", "");
        this.braet.atomFarve = this.braet.bindingFarve = this.braet.lokanter = null;
        this.braet.laast = false;
        this.braet.hist = [];
        this.braet.nulstil(true, true);
        this.visPanel();
    };

    P.faerdig = function () { return this.fundet[this.n].length >= this.isomerer().length; };

    P.nulstil = function () {
        if (!this.ryd) this.braet.nulstil(true);
    };

    /* ----- Tegningen tjekkes, naar alle C-atomer er brugt ---------------------- */
    P.aendret = function (hvad) {
        if (hvad === "laerer" || this.ryd) return;
        if (this.braet.antal() !== this.n) {
            if (this.beskedKlasse === "skidt") this.besked("", "");
            this.sidst = null;
            this.visPanel();
            return;
        }
        var res = NK.Navn.analyser(this.braet.mol);
        if (!res.navn) { this.besked("Molekylet skal hænge sammen.", "skidt"); return; }
        var liste = this.fundet[this.n], navn = res.navn;
        this.farv(res);
        if (liste.indexOf(navn) >= 0) {
            this.sidst = { navn: navn, igen: true };
            this.besked((this.vist[this.n][navn] ? "Den blev vist" : "Den har du allerede") + ": <b>" + NK.html(navn) +
                "</b>. Den er bare tegnet på en anden måde. Højreklik på enderne, og tegn en ny.", "skidt");
            this.visPanel();
            return;
        }
        liste.push(navn);
        this.sidst = { navn: navn, igen: false };
        this.hjaelp = 0;
        if (this.afvisTilbud) this.afvisTilbud();
        this.konfetti(false);
        if (this.faerdig()) {
            this.besked("<b>" + NK.html(navn) + ".</b> Alle " + this.isomerer().length + " isomerer af " + this.formel() + " er fundet.", "god");
            this.braet.laast = true;
            this.klaretNiveau();
        } else {
            this.besked("<b>Ny isomer: " + NK.html(navn) + ".</b> Tavlen ryddes. Tegn en anden.", "god");
            this.ryd = 1.6;
            this.braet.laast = true;
        }
        this.visPanel();
    };

    P.farv = function (res) {
        var b = this.braet, kaede = {}, lok = {};
        if (!res.kaede) return;
        res.kaede.forEach(function (id, i) { kaede[id] = true; lok[id] = i + 1; });
        b.bindingFarve = function (bd) { return kaede[bd.a] && kaede[bd.b] ? GROEN : BLAA; };
        b.lokanter = lok;
    };

    P.opdaterEkstra = function (dt) {
        if (this.ryd > 0) {
            this.ryd -= dt;
            if (this.ryd <= 0) {
                this.ryd = 0;
                this.braet.bindingFarve = this.braet.lokanter = null;
                this.braet.laast = false;
                this.braet.nulstil(true, true);
                this.braet.hist = [];
            }
        }
        NK.saetTekst("is-tael", this.braet.antal() + " af " + this.n);
        this.visStatus();
    };

    /* ----- Knappen: Giv hint -> Vis en isomer -> ------------------------------------ */
    P.mangler = function () {
        var f = this.fundet[this.n];
        return this.isomerer().filter(function (m) { return f.indexOf(m.navn) < 0; });
    };

    P.knap = function () {
        if (this.faerdig()) {
            var i = NIVEAUER.indexOf(this.n);
            this.nytNiveau(NIVEAUER[(i + 1) % NIVEAUER.length]);
            return;
        }
        var mangler = this.mangler();
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            var m = mangler[0], k = m.res.kaede.length, sg = m.res.sub.length;
            this.besked("<b>Hint:</b> Der mangler " + (mangler.length === 1 ? "én isomer" : mangler.length + " isomerer") +
                ". En af dem har en hovedkæde på " + k + " C og " + (sg ? (sg === 1 ? "én sidegruppe" : sg + " sidegrupper") : "ingen sidegrupper") + ".", "gul");
            this.visPanel();
            return;
        }
        /* Vis den isomer, hintet handlede om */
        var vis = mangler[0];
        this.fundet[this.n].push(vis.navn);
        this.vist[this.n][vis.navn] = true;
        this.sidst = { navn: vis.navn, igen: false };
        this.hjaelp = 0;
        this.braet.saet(vis.mol.kopi(), true);
        this.farv(NK.Navn.analyser(this.braet.mol));
        this.braet.laast = true;
        this.ryd = this.faerdig() ? 0 : 2.6;
        this.besked("Her er en: <b>" + NK.html(vis.navn) + "</b>. Den er skrevet på listen.", "gul");
        if (this.faerdig()) {
            this.besked("Her er den sidste: <b>" + NK.html(vis.navn) + "</b>. Alle isomerer af " + this.formel() + " er på listen.", "gul");
            this.klaretNiveau();
        }
        this.visPanel();
    };

    /* Alle isomerer er fundet: klistermaerket kraever, at hoejst halvdelen er vist */
    P.klaretNiveau = function () {
        var vist = Object.keys(this.vist[this.n]).length;
        this.klaret("is-" + this.n, vist <= Math.floor(this.isomerer().length / 2), this.n === 7 ? D.ROS.isomerAlle : D.ROS.isomer);
    };

    P.formel = function () { return "C" + NK.saenket(this.n) + "H" + NK.saenket(2 * this.n + 2); };

    /* ----- Panelet --------------------------------------------------------------------- */
    P.bygPanel = function () {
        var mig = this;
        NK.el("is-knap").addEventListener("click", function () { mig.knap(); });
        NK.el("is-forfra").addEventListener("click", function () {
            mig.fundet[mig.n] = [];
            mig.vist[mig.n] = {};
            mig.nytNiveau(mig.n);
        });
        Array.prototype.forEach.call(document.querySelectorAll("#is-niveau button"), function (k) {
            k.addEventListener("click", function () { mig.nytNiveau(+k.getAttribute("data-v")); });
        });
    };

    P.besked = function (html, klasse) {
        var e = NK.el("is-besked");
        e.innerHTML = html;
        e.className = "besked" + (klasse ? " " + klasse : "");
        this.beskedKlasse = klasse;
    };

    P.visPanel = function () {
        var mig = this, iso = this.isomerer(), f = this.fundet[this.n];
        Array.prototype.forEach.call(document.querySelectorAll("#is-niveau button"), function (k) {
            var n = +k.getAttribute("data-v");
            var klar = mig.fundet[n].length >= O.isomerer(n).length;
            k.classList.toggle("aktiv", n === mig.n);
            k.classList.toggle("banker", mig.faerdig() && n === NIVEAUER[NIVEAUER.indexOf(mig.n) + 1]);
            k.innerHTML = "C" + NK.saenket(n) + "H" + NK.saenket(2 * n + 2) + (klar ? '<span class="flueben">✓</span>' : "");
        });
        NK.saetHTML("is-prompt", this.formel());
        NK.saetTekst("is-fundet", String(f.length));
        NK.saetTekst("is-antal", String(iso.length));
        NK.saetTekst("is-tael", this.braet.antal() + " af " + this.n);
        NK.saetTekst("is-liste-t", f.length + " af " + iso.length);
        var knap = NK.el("is-knap");
        if (this.faerdig()) {
            knap.textContent = this.n === 7 ? "Forfra med C₄H₁₀ ↺" : "Næste formel →";
            knap.className = "knap blaa banker";
        } else {
            knap.textContent = this.hjaelp === 0 ? "Giv hint" : "Vis en isomer";
            knap.className = "knap";
        }
        NK.el("is-kort").classList.toggle("sejr", this.faerdig());

        /* Listen: de fundne med tegning, resten som tomme pladser */
        var html = "";
        iso.forEach(function (m) {
            if (f.indexOf(m.navn) < 0) return;
            var kl = "fund" + (mig.vist[mig.n][m.navn] ? " vist" : "");
            if (mig.sidst && mig.sidst.navn === m.navn) kl += mig.sidst.igen ? " igen" : " ny";
            html += '<div class="' + kl + '" data-navn="' + NK.html(m.navn) + '">' + NK.Fane.miniature(m.mol, m.res, 150, 70) +
                '<span class="fund-navn">' + NK.html(m.navn) + "</span></div>";
        });
        for (var i = f.length; i < iso.length; i++) html += '<div class="fund tom"><span>Isomer ' + (i + 1) + '</span><span>?</span></div>';
        var e = NK.el("is-liste");
        if (e.getAttribute("data-html") !== html || (this.sidst && this.sidst.igen)) {
            e.innerHTML = html;
            e.setAttribute("data-html", html);
            var ny = e.querySelector(".ny, .igen");
            if (ny) ny.scrollIntoView({ block: "nearest" });
        }
        this.visStatus();
    };

    P.visStatus = function () {
        if (this.faerdig()) { this.status("Alle isomerer er fundet. Vælg en ny formel til højre."); return; }
        if (this.ryd) { this.status("Tavlen ryddes …"); return; }
        this.status(this.braet.antal() <= 1 ? D.STATUS.isomer : D.STATUS.tegnVidere);
    };

    P.tegnFane = function (ctx) { this.braet.tegn(ctx); };

    P.enter = function () { if (this.faerdig()) this.knap(); };
    P.fokus = function () {};

    NK.Praesentation.kobl(P, { noegle: "nk-sc6.2-intro-isomerer", tilbud: "is-tilbud", spring: "is-spring" });
    P.pegPaaFelt = function (til) { NK.el("is-liste-kort").classList.toggle("peg", !!til); };

    NK.SimIsomerer = SimIsomerer;
}());
