/* =====================================================================
   fane.js - det, fane 1 og 2 har til faelles (som sc1.4)

   Der er ingen laerer. Al tekst staar paa ét lyst papirkort oeverst i
   midten af scenen (papirkortet, 6. nov. 2026; foer var det et moerkt
   kort med klassen statuslinje). Kortet har etiketten (Opgave 2 af 6),
   det skridt, eleven er ved, svarknapperne, og en nederste raekke med
   hint, fejl og forklaring, den stille hintknap og Indsend svar.
   Svarknapperne vaelger kun; Indsend svar (eller Enter) sender ind.
   Er opgaven loest, bliver kortet paa spoergsmaalet: det valgte svar er
   groent, forklaringen staar under svarene, og Naeste opgave staar, hvor
   Indsend svar stod. Forfra ligger i panelet, aldrig paa kortet.
   id'erne: x-skort er kortet, x-status den nederste raekke (med klasserne
   skidt, god, hint, gul og peger), x-valg svarknapperne, x-bliv raekken
   med forklaringen og Naeste.

   NK.Fane.paa(P, valg) laegger de faelles metoder paa fanens prototype:

     * listen i panelet: opgaverne i grupper, med loest og stjerne
       (huskes i browseren)
     * kortet: skridtet (promptHTML), og under det fejl, hint og ros, med
       farve efter hvad der skete, og et ryst ved en fejl
     * hintknappen: Giv et hint > Naeste hint > Vis svaret. Den lyser
       stille op, naar eleven lige har svaret forkert.
     * svarknapperne (lavKnap): et svar vaelges, og Indsend svar sender
       det ind. En handling (Vend B om) virker straks. Et forkert svar
       bliver roedt og kan ikke vaelges igen.
     * Indsend svar (indsendNu): skjult, naar skridtet er en handling i
       scenen, graa, til der er noget at sende. Fanen KAN have
       indsendScene(): det, der sendes, naar intet svar er valgt (fx
       drejningen eller den gruppe, eleven har klikket paa).
     * musen i scenen: hold, traek og klik

   Fanen selv har: lavOpgave(nr), promptHTML() (det skridt, eleven er
   ved, som HTML uden afsnit), trinEtiket() (fx "trin 1 af 3"),
   hintTrin(), visSvar(), layout(), tegn(), opdaterScene(dt),
   visValg() (hvilke knapper under figuren, der hoerer til skridtet) og
   musen i scenen:
   overScene, nedScene, flytScene, opScene, klikScene.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    function paa(P, valg) {
        var navn = valg.navn;
        var NOEGLE = "nk-sb4.6-" + navn;

        function el(id) { return NK.el(navn + "-" + id); }

        /* ----- Opstart --------------------------------------------------------- */
        P.startFane = function (opgaver, grupper) {
            var mig = this;
            this.navn = navn;
            this.L = new NK.Laerred(el("laerred"));
            this.tid = 0;
            this.opgaver = opgaver;
            this.grupper = grupper;
            var gemt = NK.hent(NOEGLE, {}) || {};
            this.status = opgaver.map(function (o) {
                var s = gemt[o.id];
                return { loest: !!(s && s.l), stjerne: !!(s && s.s) };
            });
            this.hjaelp = 0;          /* hvor mange hint eleven har bedt om */
            this.pegKnap = false;     /* knappen lyser stille efter en fejl */
            this.el = { knap: el("knap"), liste: el("liste"), kort: el("skort"),
                besked: el("besked"), status: el("status"), forfra: el("forfra"),
                indsend: el("indsend"), bliv: el("bliv") };
            this.fast = { html: "", klasse: "" };
            this.kortT = 0;
            this.knapper = {};
            this.valgt = null;
            this.el.knap.addEventListener("click", function () { mig.knap(); });
            this.el.indsend.addEventListener("click", function () { mig.indsendKlik(); mig.fokus(); });
            this.el.kort.addEventListener("click", function (e) {
                if (e.target.closest && e.target.closest("[data-videre]")) { mig.knap(); mig.fokus(); }
            });
            if (this.el.forfra) this.el.forfra.addEventListener("click", function () { mig.nulstil(); mig.fokus(); });
            this.bygListe();
            this.koblMus();
        };

        /* ----- Hukommelse ------------------------------------------------------ */
        P.gem = function () {
            var ud = {}, mig = this;
            this.opgaver.forEach(function (o, i) {
                var s = mig.status[i];
                if (s.loest) ud[o.id] = { l: 1, s: s.stjerne ? 1 : 0 };
            });
            NK.gem(NOEGLE, ud);
        };

        P.antalLoest = function () {
            return this.status.filter(function (s) { return s.loest; }).length;
        };

        /* ----- Listen i panelet -------------------------------------------------- */
        P.bygListe = function () {
            var mig = this;
            this.el.liste.innerHTML = "";
            this.chips = [];
            this.grupper.forEach(function (g) {
                var boks = document.createElement("div");
                boks.className = "opg-gruppe";
                var hoved = document.createElement("div");
                hoved.className = "opg-hoved";
                hoved.innerHTML = "<span>" + NK.html(g.titel) + '</span><span class="opg-tal" id="' + navn + "-gt-" + g.id + '"></span>';
                boks.appendChild(hoved);
                var raekke = document.createElement("div");
                raekke.className = "opg-chips";
                mig.opgaver.forEach(function (o, i) {
                    if ((o.gruppe || "alle") !== g.id) return;
                    var knap = document.createElement("button");
                    knap.type = "button";
                    knap.className = "opg-chip";
                    knap.title = o.navn;
                    knap.innerHTML = '<span class="oc-f">' + mig.chipTekst(o, i) + '</span><i class="oc-m"></i>';
                    knap.addEventListener("click", function () { mig.vaelg(i); });
                    raekke.appendChild(knap);
                    mig.chips[i] = knap;
                });
                boks.appendChild(raekke);
                mig.el.liste.appendChild(boks);
            });
        };

        P.visListe = function () {
            var mig = this;
            this.status.forEach(function (s, i) {
                var c = mig.chips[i];
                if (!c) return;
                c.classList.toggle("valgt", i === mig.nr);
                c.classList.toggle("loest", s.loest);
                c.classList.toggle("stjerne", s.stjerne);
                c.querySelector(".oc-m").textContent = s.stjerne ? "★" : (s.loest ? "✓" : "");
            });
            this.grupper.forEach(function (g) {
                var ialt = 0, loest = 0;
                mig.opgaver.forEach(function (o, i) {
                    if ((o.gruppe || "alle") !== g.id) return;
                    ialt++;
                    if (mig.status[i].loest) loest++;
                });
                NK.saetTekst(navn + "-gt-" + g.id, loest + "/" + ialt);
            });
            NK.saetTekst(navn + "-loest", String(this.antalLoest()));
        };

        /* ----- Opgaven --------------------------------------------------------- */
        P.vaelg = function (i) {
            this.nr = i;
            this.hjaelp = 0;
            this.pegKnap = false;
            this.brugtSvar = false;
            this.faerdig = false;
            this.valgt = null;
            this.slutHTML = "";
            this.lavOpgave(i);
            this.layout();
            this.visKort();
            this.visListe();
            this.naesteLinje("", "");
            this.fokus();
        };

        /* Kortet: etiketten og skridtet oeverst, svarknapperne, og nederst
           enten beskeden med hint og Indsend svar eller (loest) forklaringen
           med knappen, der foerer videre */
        P.visKort = function () {
            var etiket = "Opgave " + (this.nr + 1) + " af " + this.opgaver.length;
            var trin = !this.faerdig && this.trinEtiket ? this.trinEtiket() : "";
            if (trin) etiket += ", " + trin;
            NK.saetHTML(navn + "-prompt", '<span class="sk-chip">' + etiket + "</span>" + NK.Papir.tekst(this.promptHTML()));
            if (this.visValg) this.visValg();
            var k = this.el.kort, f = this.faerdig;
            k.classList.toggle("loest", f);
            k.classList.toggle("svar", f && !!this.brugtSvar);
            this.el.status.hidden = f;
            this.el.bliv.hidden = !f;
            this.el.bliv.innerHTML = f ? this.blivHTML() : "";
            this.visKnap();
            this.visIndsend();
        };

        /* Knappen, der foerer videre efter en loest opgave (tom: ingen knap) */
        P.videreTekst = function () {
            if (this.naesteUloeste() >= 0) return "Næste opgave →";
            if (valg.naesteFane) return "Videre til " + valg.naesteNavn + " →";
            return "";
        };

        P.blivHTML = function () {
            var t = this.videreTekst();
            var html = NK.Papir.bliv(this.slutHTML || "", this.brugtSvar ? "Svaret" : "Rigtigt", t || "-", !!this.brugtSvar);
            return t ? html : html.replace(/<button[\s\S]*?<\/button>/, "");
        };

        /* ----- Svarknapperne paa kortet ---------------------------------------------
           slags "svar": knappen vaelger kun. slags "handling": den virker straks. */
        P.lavKnap = function (tekst, noegle, fn, slags, titel, klasse) {
            var mig = this, k = document.createElement("button");
            k.type = "button";
            k.className = "sk-knap" + (slags === "handling" ? " handling" : "") + (klasse ? " " + klasse : "");
            k.textContent = tekst;
            if (titel) k.title = titel;
            k.setAttribute("data-svar", noegle);
            k._fn = fn;
            k._handling = slags === "handling";
            k.addEventListener("click", function () {
                if (k._handling) fn(); else mig.vaelgSvar(noegle);
                mig.fokus();
            });
            this.valg.appendChild(k);
            this.knapper[noegle] = k;
            return k;
        };

        P.vaelgSvar = function (noegle) {
            var k = this.knapper[noegle];
            if (this.faerdig || this.auto || !k || k.disabled || k.hidden || k._handling) return false;
            this.valgt = { id: noegle, fn: k._fn };
            for (var n in this.knapper) this.knapper[n].classList.toggle("valgt", n === noegle);
            if (this.efterValg) this.efterValg(noegle);
            this.visIndsend();
            return true;
        };

        P.rydValg = function () {
            this.valgt = null;
            for (var n in this.knapper) this.knapper[n].classList.remove("valgt");
            this.visIndsend();
        };

        /* Hvad Indsend svar sender: null (knappen er skjult), eller { klar, fn } */
        P.indsendNu = function () {
            if (this.faerdig || this.auto) return null;
            var mig = this;
            if (this.valgt) return { klar: true, fn: function () { mig.valgt.fn(); } };
            var s = this.indsendScene ? this.indsendScene() : null;
            if (s) return s;
            for (var n in this.knapper) {
                var k = this.knapper[n];
                if (!k._handling && !k.hidden) return { klar: false };
            }
            return null;
        };

        P.visIndsend = function () {
            var e = this.el.indsend;
            if (!e) return;
            var n = this.indsendNu();
            e.hidden = !n;
            e.classList.toggle("ikke-klar", !!n && !n.klar);
        };

        P.indsendKlik = function () {
            var n = this.indsendNu();
            if (!n) return;
            if (!n.klar) { this.kortBesked(n.mangler || "Vælg først et svar på kortet. Tryk så Indsend svar.", 4); return; }
            var v = this.valgt;
            n.fn();
            if (!this.faerdig && v) {
                /* Et forkert svar bliver roedt og kan ikke vaelges igen */
                var k = this.knapper[v.id];
                if (k) { k.classList.remove("valgt"); k.classList.add("forkert"); k.disabled = true; }
            }
            this.valgt = null;
            for (var x in this.knapper) this.knapper[x].classList.remove("valgt");
            this.visIndsend();
        };

        /* Et klik i scenen, mens kortet bliver paa en loest opgave: kortet blinker */
        P.kortBlink = function () {
            var e = this.el.kort;
            e.classList.remove("blink");
            void e.offsetWidth;
            e.classList.add("blink");
        };

        /* Hinttrappen for den tilstand, eleven staar i lige nu */
        P.hintNu = function () {
            var h = this.hintTrin();
            return h && h.length ? h : ["Læs opgaven på kortet igen."];
        };

        P.visKnap = function () {
            var tekst, klasse = "knap hjaelp";
            var h = this.hintNu();
            if (this.hjaelp === 0) tekst = "Giv et hint";
            else if (this.hjaelp < h.length) tekst = "Næste hint (" + (this.hjaelp + 1) + " af " + h.length + ")";
            else tekst = "Vis svaret";
            if (this.pegKnap) klasse += " peg";
            this.el.knap.textContent = tekst;
            this.el.knap.className = klasse;
            this.el.knap.disabled = !!this.auto;
        };

        P.naesteUloeste = function () {
            var n = this.status.length;
            for (var d = 1; d <= n; d++) {
                var i = (this.nr + d) % n;
                if (!this.status[i].loest) return i;
            }
            return -1;
        };

        /* ----- Knappen: ét skridt hjaelp ad gangen ------------------------------- */
        P.knap = function () {
            if (this.auto) return;
            if (this.faerdig) {
                var naeste = this.naesteUloeste();
                if (naeste >= 0) this.vaelg(naeste);
                else if (valg.naesteFane && NK.visFane) {
                    if (valg.foerNaeste) valg.foerNaeste();
                    NK.visFane(valg.naesteFane);
                }
                /* Ellers ingen knap: forfra ligger i panelet */
                return;
            }
            var h = this.hintNu();
            this.pegKnap = false;
            if (this.hjaelp < h.length) {
                this.hjaelp++;
                this.besked('<span class="b-maerke">Hint ' + this.hjaelp + " af " + h.length + "</span> " +
                    NK.html(h[this.hjaelp - 1]), "hint");
                this.visKnap();
                this.fokus();
                return;
            }
            this.brugtSvar = true;
            this.hjaelp = 0;
            this.rydValg();
            this.visSvar();
            this.visKnap();
            this.fokus();
        };

        /* Eleven har gjort noget: hinttrappen begynder forfra, for nu er
           naeste skridt et andet */
        P.nulstilHjaelp = function () {
            if (this.hjaelp === 0) return;
            this.hjaelp = 0;
            this.visKnap();
        };

        /* ----- Opgaven er loest --------------------------------------------------- */
        P.loest = function (tekst) {
            var s = this.status[this.nr];
            this.faerdig = true;
            this.hjaelp = 0;
            this.pegKnap = false;
            s.loest = true;
            s.stjerne = s.stjerne || !this.brugtSvar;
            this.gem();
            var alle = this.antalLoest() === this.opgaver.length;
            /* Kortet bliver paa opgaven: forklaringen staar under svarene */
            this.slutHTML = NK.html(tekst) + (alle ? " " + NK.html(D.FAERDIG[navn]) : "");
            this.valgt = null;
            for (var n in this.knapper) {
                this.knapper[n].disabled = true;
                this.knapper[n].classList.remove("valgt");
            }
            this.besked("", this.brugtSvar ? "gul" : "god");
            this.visKort();
            this.visListe();
            if (this.efterOpgave) this.efterOpgave();
        };

        /* ----- Linjen paa kortet under skridtet -------------------------------------
           besked: den faste linje. kortBesked: et svar paa et klik i scenen,
           der forsvinder igen efter sek sekunder. */
        P.besked = function (html, klasse) {
            this.fast = { html: html || "", klasse: klasse || "" };
            this.kortT = 0;
            this.visBesked(this.fast);
        };

        P.kortBesked = function (html, sek) {
            this.kortT = sek || 4;
            this.visBesked({ html: NK.html(html), klasse: "peger" });
        };

        P.visBesked = function (b) {
            var e = this.el.besked;
            if (!e) return;
            e.innerHTML = b.html;
            if (this.el.status) this.el.status.className = "sk-bund" + (b.klasse ? " " + b.klasse : "");
        };

        /* Teksten nederst paa kortet: beskeden, eller forklaringen, naar opgaven er loest */
        P.beskedTekst = function () {
            if (this.faerdig && this.el.bliv) {
                var t = this.el.bliv.querySelector(".st-tekst");
                return t ? t.textContent : "";
            }
            return this.el.besked ? this.el.besked.textContent : "";
        };

        /* Et nyt skridt: linjen toemmes, og kortet viser skridtet */
        P.naesteLinje = function (foer, slags) {
            this.besked(foer || "", slags || "");
            this.visKort();
        };

        /* Et rigtigt delskridt: en kort groen linje under det naeste skridt
           (et delskridt, ikke opgaven: kortet viser straks det naeste skridt) */
        P.godLinje = function (tekst) {
            this.besked('<span class="b-maerke">✓</span> ' + NK.html(tekst), "god");
            this.visKort();
        };

        /* Et forkert svar: beskeden, et ryst og en knap, der lyser stille */
        P.fejlLinje = function (tekst) {
            this.besked('<span class="b-maerke">Ikke endnu</span> ' + NK.html(tekst), "skidt");
            this.pegKnap = true;
            this.visKnap();
            this.ryst();
        };

        P.ryst = function () {
            var e = this.el.status;
            if (!e) return;
            e.classList.remove("ryster");
            void e.offsetWidth;
            e.classList.add("ryster");
        };

        /* ----- Fokus og taster ---------------------------------------------------- */
        P.fokus = function () {
            if (!NK.el("fane-" + navn).classList.contains("aktiv") ||
                document.querySelector(".overlay.vis") || (NK.Rundvisning && NK.Rundvisning.aktiv())) return;
            if (this.fokusFelt) this.fokusFelt();
        };

        /* Enter: Indsend svar, eller videre, naar opgaven er loest */
        P.enter = function () {
            if (this.auto) return;
            if (this.faerdig) this.knap(); else this.indsendKlik();
        };

        /* R og Start forfra: samme opgave fra begyndelsen */
        P.nulstil = function () { this.vaelg(this.nr); };

        /* Ogsaa naar kortet bliver hoejere af en lang besked */
        P.tilpas = function () {
            var h = this.el.kort ? this.el.kort.offsetHeight : 0;
            if (this.L.tilpas() || !this.lay || h !== this._baandH) {
                this._baandH = h;
                this.layout();
            }
        };

        P.saetAnker = function (id, x, y, b, h) {
            var e = NK.el(navn + "-anker-" + id);
            if (!e) return;
            e.style.left = Math.round(x) + "px";
            e.style.top = Math.round(y) + "px";
            e.style.width = Math.round(Math.max(1, b)) + "px";
            e.style.height = Math.round(Math.max(1, h)) + "px";
        };

        /* Pladsen oeverst i scenen til kortet. Den er sat af fra start, saa
           figuren ikke flytter sig, naar der kommer et hint */
        P.kortZone = function () { return NK.kortZone(this.el.kort); };

        /* ----- Tegneloekken ------------------------------------------------------- */
        P.opdater = function (dt) {
            this.tid += dt;
            if (this.kortT > 0) {
                this.kortT -= dt;
                if (this.kortT <= 0) { this.kortT = 0; this.visBesked(this.fast); }
            }
            if (this.opdaterScene) this.opdaterScene(dt);
        };

        /* ----- Musen -------------------------------------------------------------
           Holder fanen tag i noget, faar den ogsaa flytningerne og slippet,
           ogsaa uden for laerredet. */
        P.koblMus = function () {
            var mig = this, c = this.L.canvas;
            this.greb = false;
            c.addEventListener("pointermove", function (e) {
                var pt = mig.L.punkt(e);
                if (mig.greb && mig.flytScene) { mig.flytScene(pt); return; }
                var u = mig.overScene ? mig.overScene(pt) : null;
                c.style.cursor = u === "greb" ? "grab" : (u ? "pointer" : "default");
            });
            c.addEventListener("pointerleave", function () {
                if (!mig.greb) { if (mig.overScene) mig.overScene(null); c.style.cursor = "default"; }
            });
            c.addEventListener("pointerdown", function (e) {
                if (e.button !== undefined && e.button !== 0) return;
                mig.slapNetop = false;
                var pt = mig.L.punkt(e);
                if (mig.nedScene && mig.nedScene(pt)) {
                    mig.greb = true;
                    c.style.cursor = "grabbing";
                    try { c.setPointerCapture(e.pointerId); } catch (x) { /* ingen capture */ }
                    e.preventDefault();
                }
            });
            function slip(e) {
                if (!mig.greb) return;
                mig.greb = false;
                c.style.cursor = "default";
                if (mig.opScene) mig.opScene(mig.L.punkt(e));
                mig.slapNetop = true;
            }
            c.addEventListener("pointerup", slip);
            c.addEventListener("pointercancel", slip);
            c.addEventListener("click", function (e) {
                var pt = mig.L.punkt(e);
                if (mig.slapNetop) { mig.slapNetop = false; return; }
                if (mig.faerdig) { mig.kortBlink(); return; }
                if (mig.klikScene) mig.klikScene(pt);
                mig.fokus();
            });
        };
    }

    NK.Fane = { paa: paa };
}());
