/* =====================================================================
   fane.js - det, de tre faner har til faelles (som sc1.4 og sb4.4)

   Der er ingen laerer i denne animation. Al hjaelp staar i
   statuslinjen nederst i scenen, lige under det, eleven arbejder med,
   og hjaelpeknappen sidder i samme linje.

   NK.Fane.paa(P, valg) laegger de faelles metoder paa fanens prototype:

     * listen i panelet: maalene med loest og stjerne (huskes i browseren)
     * maalets dele i raekkefoelge: gaet > forsoeg > spm, eller felter
       (se js/data.js)
     * statuslinjen: naeste skridt, fejl, hint og ros, med farve efter
       hvad der skete, og et ryst ved en fejl
     * den ene knap: Giv et hint > Naeste hint > Vis svaret > Naeste opgave.
       Den lyser stille op, naar eleven lige har svaret forkert.
     * svarknapperne i opgavekortet (data-valg) og musen i scenen

   Fanen selv har: nyOpgave(o), sceneLinje(), forsoegSvar(o), layout(),
   tegn(), opdaterScene(dt) og musen i scenen: overScene, nedScene,
   flytScene, opScene, klikScene. Fanen kalder forsoegKlaret(tekst),
   naar eleven har gjort det, maalet beder om.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    function paa(P, valg) {
        var navn = valg.navn;
        var NOEGLE = "nk-sc8.6-" + navn;

        function el(id) { return NK.el(navn + "-" + id); }

        /* ----- Opstart --------------------------------------------------------- */
        P.startFane = function (opgaver) {
            var mig = this;
            this.navn = navn;
            this.L = new NK.Laerred(el("laerred"));
            this.tid = 0;
            this.opgaver = opgaver;
            this.grupper = [{ id: "alle", titel: "", lodret: true }];
            var gemt = NK.hent(NOEGLE, {}) || {};
            this.status = opgaver.map(function (o) {
                var s = gemt[o.id];
                return { loest: !!(s && s.l), stjerne: !!(s && s.s) };
            });
            this.hjaelp = 0;
            this.pegKnap = false;
            this.el = { knap: el("knap"), liste: el("liste"), kort: el("kort"),
                besked: el("besked"), status: el("status"), forfra: el("forfra") };
            this.fast = { html: "", klasse: "" };
            this.kortT = 0;
            this.el.knap.addEventListener("click", function () { mig.knap(); });
            if (this.el.forfra) this.el.forfra.addEventListener("click", function () { mig.forfra(); mig.fokus(); });
            this.el.kort.addEventListener("click", function (e) {
                var k = e.target.closest ? e.target.closest("[data-valg]") : null;
                if (!k || k.disabled) return;
                mig.svarValg(parseInt(k.getAttribute("data-valg"), 10));
            });
            this.bygListe();
            this.koblMus();
            /* Den foerste opgave, eleven ikke har loest */
            this.nr = this.opgaver.length - 1;
            var foerste = this.naesteUloeste();
            this.vaelg(foerste >= 0 ? foerste : 0);
        };

        P.idx = function (id) {
            for (var i = 0; i < this.opgaver.length; i++) if (this.opgaver[i].id === id) return i;
            return -1;
        };

        P.erLoest = function (id) { return this.status[this.idx(id)].loest; };

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
            var raekke = document.createElement("div");
            raekke.className = "opg-chips lodret";
            this.opgaver.forEach(function (o, i) {
                var knap = document.createElement("button");
                knap.type = "button";
                knap.className = "opg-chip";
                knap.title = o.navn;
                knap.innerHTML = '<span class="oc-f"><span class="oc-nr">' + (i + 1) + "</span>" + NK.html(o.navn) + '</span><i class="oc-m"></i>';
                knap.addEventListener("click", function () { mig.vaelg(i); });
                raekke.appendChild(knap);
                mig.chips[i] = knap;
            });
            this.el.liste.appendChild(raekke);
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
            NK.saetTekst(navn + "-loest", String(this.antalLoest()));
        };

        /* ----- Opgaven --------------------------------------------------------- */
        P.vaelg = function (i) {
            this.nr = i;
            this.hjaelp = 0;
            this.pegKnap = false;
            this.brugtSvar = false;
            this.faerdig = false;
            this.lavOpgave(i);
            this.layout();
            this.visKort();
            this.visListe();
            this.naesteLinje("", "");
            this.fokus();
        };

        /* Maalets dele i den raekkefoelge, de kommer */
        P.lavOpgave = function (i) {
            var o = this.opgaver[i], faser = [];
            ["gaet", "forsoeg", "felter", "spm"].forEach(function (f) { if (o[f]) faser.push(f); });
            this.opg = { o: o, faser: faser, fi: 0, fase: faser[0], gaet: -1, forkert: {}, rigtig: undefined };
            if (this.nyOpgave) this.nyOpgave(o);
        };

        P.visKort = function () {
            var o = this.opgaver[this.nr];
            NK.saetTekst(navn + "-titel", o.navn);
            NK.saetTekst(navn + "-nr", String(this.nr + 1));
            NK.saetTekst(navn + "-antal", String(this.opgaver.length));
            NK.saetHTML(navn + "-prompt", this.promptHTML());
            this.el.kort.classList.toggle("sejr", this.faerdig);
            this.visKnap();
        };

        P.promptHTML = function () {
            var g = this.opg, o = g.o, del = o[g.fase];
            var html = '<p class="maal-tekst">' + NK.html(del.tekst) + "</p>";
            if (g.gaet >= 0 && g.fase !== "gaet") {
                var dom = "";
                if (this.faerdig || g.fi > g.faser.indexOf("forsoeg")) dom = o.gaet.svar[g.gaet].ok ? " ✓" : " ✗";
                html += '<p class="gaet-linje">Dit gæt: <b>' + NK.html(o.gaet.svar[g.gaet].t) + "</b>" + dom + "</p>";
            }
            if (del.svar) {
                var spm = g.fase === "spm";
                html += '<div class="knapper valgrad">';
                del.svar.forEach(function (sv, j) {
                    var kl = "knap", laast = false;
                    if (spm) {
                        if (g.forkert[j]) { kl += " forkert"; laast = true; }
                        if (g.rigtig === j) kl += " rigtig";
                        if (g.rigtig !== undefined) laast = true;
                    }
                    html += '<button type="button" class="' + kl + '" data-valg="' + j + '"' + (laast ? " disabled" : "") + ">" +
                        '<span class="v-bogstav">' + "ABC".charAt(j) + "</span>" + NK.html(sv.t) + "</button>";
                });
                html += "</div>";
            }
            if (this.kortEkstra) html += this.kortEkstra();
            return html;
        };

        /* Videre til maalets naeste del. Giver true, hvis der ikke er flere. */
        P.naesteFase = function () {
            var g = this.opg;
            this.hjaelp = 0;
            this.pegKnap = false;
            if (g.fi >= g.faser.length - 1) return true;
            g.fi++;
            g.fase = g.faser[g.fi];
            if (this.nyFase) this.nyFase(g.fase);
            this.layout();
            this.visKort();
            return false;
        };

        /* Det, eleven gaettede paa, holdt eller holdt ikke */
        P.gaetDom = function () {
            var g = this.opg;
            if (g.gaet < 0) return "";
            return g.o.gaet.svar[g.gaet].ok ? "Dit gæt holdt. " : "Dit gæt holdt ikke. ";
        };

        /* ----- Svarknapperne i opgavekortet -------------------------------------------- */
        P.svarValg = function (j) {
            var g = this.opg, o = g.o;
            if (this.faerdig) return;
            if (g.fase === "gaet") {
                g.gaet = j;
                this.naesteFase();
                this.besked('<span class="b-maerke">Dit gæt</span> ' + NK.html("Nu skal det prøves. " + this.trinLinje()), "peger");
                this.sidsteTrin = this.trinLinje();
                if (this.efterGaet) this.efterGaet();
                return;
            }
            if (g.fase !== "spm") return;
            if (o.spm.svar[j].ok) {
                g.rigtig = j;
                this.loest("selv", o.loest);
                return;
            }
            g.forkert[j] = true;
            this.visKort();
            this.fejlLinje(o.spm.svar[j].f);
        };

        /* Fanen melder, at eleven har gjort det, forsoeget beder om */
        P.forsoegKlaret = function (set, slutTekst) {
            var g = this.opg;
            if (this.faerdig || g.fase !== "forsoeg") return;
            var slut = this.naesteFase();
            if (slut) { this.loest("selv", this.gaetDom() + (slutTekst || g.o.loest)); return; }
            this.besked('<span class="b-maerke">Godt</span> ' + NK.html(this.gaetDom() + (set ? set + " " : "") + this.trinLinje()), "god");
            this.sidsteTrin = this.trinLinje();
        };

        /* Hinttrappen for den del af maalet, eleven staar i lige nu */
        P.hintTrin = function () {
            var g = this.opg;
            if (g.fase === "gaet") return D.GAET_HINT;
            return g.o[g.fase].hint;
        };

        P.hintNu = function () {
            var h = this.hintTrin();
            return h && h.length ? h : ["Læs opgaven igen, og prøv dig frem i scenen."];
        };

        P.visSvar = function () {
            var g = this.opg, o = g.o;
            if (g.fase === "gaet") {
                this.naesteFase();
                this.naesteLinje('<span class="b-maerke">Uden gæt</span>', "gul");
                return;
            }
            if (g.fase === "spm") {
                o.spm.svar.forEach(function (sv, j) { if (sv.ok) g.rigtig = j; });
                this.loest("svar", o.loest);
                return;
            }
            if (g.fase === "felter") { this.felterSvar(o); return; }
            var slutTekst = this.forsoegSvar(o);
            var slut = this.naesteFase();
            if (slut) { this.loest("svar", slutTekst || o.loest); return; }
            this.naesteLinje('<span class="b-maerke">Svaret</span>', "gul");
        };

        P.visKnap = function () {
            var tekst, klasse;
            if (this.faerdig) {
                klasse = "knap videre banker";
                var naeste = this.naesteUloeste();
                if (naeste >= 0) tekst = "Næste opgave →";
                else if (valg.naesteFane) tekst = "Videre til " + valg.naesteNavn + " →";
                else tekst = "Start forfra ↺";
            } else {
                var h = this.hintNu();
                klasse = "knap hjaelp";
                if (this.hjaelp === 0) tekst = "Giv et hint";
                else if (this.hjaelp < h.length) tekst = "Næste hint (" + (this.hjaelp + 1) + " af " + h.length + ")";
                else tekst = this.opg.fase === "gaet" ? "Spring gættet over" : "Vis svaret";
                if (this.pegKnap) klasse += " peg";
            }
            this.el.knap.textContent = tekst;
            this.el.knap.className = klasse;
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
            if (this.faerdig) {
                var naeste = this.naesteUloeste();
                if (naeste >= 0) this.vaelg(naeste);
                else if (valg.naesteFane && NK.visFane) NK.visFane(valg.naesteFane);
                else this.vaelg((this.nr + 1) % this.opgaver.length);
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
            if (this.opg.fase !== "gaet") this.brugtSvar = true;
            this.visSvar();
            this.visKnap();
            this.fokus();
        };

        /* Eleven har gjort noget nyt: hinttrappen begynder forfra */
        P.nulstilHjaelp = function () {
            if (this.hjaelp === 0) return;
            this.hjaelp = 0;
            this.visKnap();
        };

        /* ----- Opgaven er loest --------------------------------------------------- */
        P.loest = function (maade, linje) {
            var s = this.status[this.nr];
            var foerste = !s.loest;
            this.faerdig = true;
            this.hjaelp = 0;
            this.pegKnap = false;
            s.loest = true;
            s.stjerne = s.stjerne || !this.brugtSvar;
            this.gem();
            this.sejrT = 0;
            var alle = this.antalLoest() === this.opgaver.length;
            var html;
            if (maade === "svar") {
                html = '<span class="b-maerke">Svaret</span> ' + NK.html(linje || "");
            } else {
                html = '<span class="b-maerke stor">Rigtigt ✓</span> ' + NK.html(linje || "");
            }
            if (alle && foerste) html += " " + NK.html(D.FAERDIG[navn]);
            this.besked(html, maade === "svar" ? "gul" : "god");
            this.visKort();
            this.visListe();
            if (this.efterOpgave) this.efterOpgave();
        };

        /* ----- Statuslinjen nederst i scenen ---------------------------------------
           besked: den faste linje. kortBesked: et svar paa et klik i scenen,
           der forsvinder igen efter sek sekunder. */
        P.besked = function (html, klasse) {
            this.fast = { html: html || "", klasse: klasse || "" };
            this.kortT = 0;
            this.visBesked(this.fast);
        };

        P.kortBesked = function (tekst, sek, klasse) {
            this.kortT = sek || 4;
            this.visBesked({ html: NK.html(tekst), klasse: klasse || "peger" });
        };

        P.visBesked = function (b) {
            var e = this.el.besked;
            if (!e) return;
            e.innerHTML = b.html;
            if (this.el.status) this.el.status.className = "statuslinje" + (b.klasse ? " " + b.klasse : "");
        };

        P.beskedTekst = function () { return this.el.besked ? this.el.besked.textContent : ""; };

        /* Det naeste skridt, som det staar i linjen */
        P.trinLinje = function () {
            var g = this.opg;
            if (g.fase === "gaet") return D.GAET_LINJE;
            if (g.fase === "spm" && !(this.spmLinje && this.spmLinje())) return D.SPM_LINJE;
            if (g.fase === "spm") return this.spmLinje();
            return this.sceneLinje ? this.sceneLinje() : "";
        };

        P.naesteLinje = function (foer, slags) {
            var t = this.faerdig ? "" : this.trinLinje();
            this.sidsteTrin = t;
            this.besked((foer ? foer + " " : "") + NK.html(t), slags || "");
        };

        /* En god delbesked: groen linje med ét skridt videre */
        P.godLinje = function (tekst) {
            this.besked('<span class="b-maerke">Godt</span> ' + NK.html(tekst), "god");
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

        /* ----- Fokus, forfra og maal ------------------------------------------- */
        P.fokus = function () {
            if (!NK.el("fane-" + navn).classList.contains("aktiv") ||
                document.querySelector(".overlay.vis") || (NK.Rundvisning && NK.Rundvisning.aktiv())) return;
            if (this.fokusFelt) this.fokusFelt();
        };

        /* Knappen Forfra og tasten R: fanen nulstiller scenen, maalet bliver */
        P.forfra = function () {
            if (this.nulstilScene) this.nulstilScene();
            this.nulstilHjaelp();
            if (!this.faerdig) this.naesteLinje("", "");
        };

        P.nulstil = function () { this.forfra(); };

        P.tilpas = function () {
            if (this.L.tilpas() || !this.lay) this.layout();
        };

        P.saetAnker = function (id, x, y, b, h) {
            var e = NK.el(navn + "-anker-" + id);
            if (!e) return;
            e.style.left = Math.round(x) + "px";
            e.style.top = Math.round(y) + "px";
            e.style.width = Math.round(Math.max(1, b)) + "px";
            e.style.height = Math.round(Math.max(1, h)) + "px";
        };

        /* Baandet, som statuslinjen fylder nederst i scenen */
        P.baand = function () {
            var e = this.el.status;
            var h = e ? e.offsetHeight : 0;
            if (!h) h = 68;
            return { y: this.L.h - h, h: h };
        };

        /* ----- Tegneloekken ------------------------------------------------------- */
        P.opdater = function (dt) {
            this.tid += dt;
            if (this.kortT > 0) {
                this.kortT -= dt;
                if (this.kortT <= 0) { this.kortT = 0; this.visBesked(this.fast); }
            }
            if (this.sejrT !== undefined && this.sejrT !== null) this.sejrT += dt;
            if (this.opdaterScene) this.opdaterScene(dt);
            /* Linjen foelger med, naar noget skifter (et hint eller en fejl bliver staaende) */
            if (!this.faerdig && !this.kortT && this.fast.klasse === "") {
                var t = this.trinLinje();
                if (t !== this.sidsteTrin) this.naesteLinje("", "");
            }
        };

        /* Det groenne glimt over scenen, naar et maal er loest */
        P.tegnSejr = function (ctx, W, H) {
            if (!this.faerdig || this.sejrT === undefined || this.sejrT > 0.9) return;
            ctx.save();
            ctx.globalAlpha = 0.14 * (1 - this.sejrT / 0.9);
            ctx.fillStyle = "#3fae72";
            ctx.fillRect(0, 0, W, H);
            ctx.restore();
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
                if (mig.klikScene) mig.klikScene(pt);
                mig.fokus();
            });
        };
    }

    NK.Fane = { paa: paa };
}());
