/* =====================================================================
   ekstra.js - ekstraopgaverne uden hints (alle tre faner)

   Brugeren 13. nov. 2026: "Der må gerne være nogle ekstraopgaver, som
   ikke er stilladseret", og formlen gemmes bag en kontakt, der er
   markeret svær. Ekstraopgaverne startes fra panelet (kortet
   "Ekstraopgaver"), har ingen hints, kun Vis svaret, og de koster ikke
   fanens stjerne. Kontakten Svær (fane 2 og 3) tager opgaverne med
   formlen med (t.svaer).

   NK.Ekstra.paa(P) giver fanen:
     ekstraInit(liste)   kobler panelets knapper til
     chip()              "Trin 2 af 5" eller "Ekstraopgave 1 af 3"
     startEkstra()       panelets knap: start eller tilbage til trinnene
     visEkstraPanel()    listen, kontakten og knappen i panelet
   Fanen skal have hovedListe, startTrin(j), visListe() og cfg.navn.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    function paa(P) {
        P.ekstraInit = function (liste) {
            var mig = this, n = this.cfg.navn;
            this.ekstraAlle = liste || [];
            this.svaer = false;
            this.iEkstra = false;
            this.ekstraLoest = {};
            this.gemtTrin = null;
            NK.el(n + "-ekstraknap").addEventListener("click", function () { mig.startEkstra(); });
            var sv = NK.el(n + "-svaer");
            if (sv) sv.addEventListener("click", function () { mig.svaerKlik(); });
        };

        P.ekstraListe = function () {
            var mig = this;
            return this.ekstraAlle.filter(function (t) { return !t.svaer || mig.svaer; });
        };

        P.chip = function () {
            if (!this.iEkstra) return "Trin " + (this.trinNr + 1) + " af " + this.trinListe.length;
            return "Ekstraopgave " + (this.trinNr + 1) + " af " + this.trinListe.length + (this.trin.svaer ? " · Svær" : "");
        };

        /* Panelets knap: start ekstraopgaverne, eller gaa tilbage til trinnene */
        P.startEkstra = function () {
            if (this.iEkstra) {
                this.iEkstra = false;
                this.trinListe = this.hovedListe;
                var g = this.gemtTrin || { nr: 0, faerdig: false };
                this.faerdig = g.faerdig;
                if (this.forTrin) this.forTrin();
                this.startTrin(g.faerdig ? this.trinListe.length - 1 : g.nr);
                if (g.faerdig) this.visGennemfoert();
                return;
            }
            this.gemtTrin = { nr: this.trinNr, faerdig: !!this.faerdig };
            this.iEkstra = true;
            this.trinListe = this.ekstraListe();
            if (this.forEkstra) this.forEkstra();
            this.startTrin(0);
        };

        P.svaerKlik = function () {
            this.svaer = !this.svaer;
            if (this.iEkstra) {
                this.trinListe = this.ekstraListe();
                this.startTrin(0);
            } else this.visEkstraPanel();
        };

        /* Det groenne kort efter fanens sidste trin, naar eleven kommer tilbage */
        P.visGennemfoert = function () {
            this.groen = { spm: true, svarNr: this.trin.rigtig, maade: "selv", maerke: "Gennemført", tekst: this.trin.forkl + " " + this.cfg.faerdig,
                           knap: this.cfg.videreTekst || "Se teorien →" };
            this.besked("", "");
            this.visKort();
            this.visListe();
        };

        P.ekstraRigtigt = function (t) { this.ekstraLoest[t.id] = true; };

        P.visEkstraPanel = function () {
            var mig = this, n = this.cfg.navn, liste = this.ekstraListe(), html = "", loest = 0;
            liste.forEach(function (t, j) {
                var nu = mig.iEkstra && j === mig.trinNr, faerdig = !!mig.ekstraLoest[t.id];
                if (faerdig) loest++;
                html += '<li class="' + (faerdig ? "faerdig" : (nu ? "nu" : "")) + '"><span class="tr-nr">' + (j + 1) + "</span><span>" + D.sub(NK.html(t.navn)) +
                    (t.svaer ? ' <span class="svaer-maerke">Svær</span>' : "") + "</span></li>";
            });
            NK.saetHTML(n + "-ekstra", html);
            NK.saetTekst(n + "-ekstramaerke", loest ? loest + " af " + liste.length : "");
            NK.saetTekst(n + "-ekstraknap", this.iEkstra ? "Tilbage til trinnene" : "Start ekstraopgaverne");
            NK.el(n + "-ekstraknap").classList.toggle("blaa", !this.iEkstra);
            var sv = NK.el(n + "-svaer");
            if (sv) { sv.classList.toggle("til", this.svaer); sv.setAttribute("aria-pressed", this.svaer ? "true" : "false"); }
        };
    }

    NK.Ekstra = { paa: paa };
}());
