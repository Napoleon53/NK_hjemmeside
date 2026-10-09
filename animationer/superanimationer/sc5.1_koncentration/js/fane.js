/* =====================================================================
   fane.js - det, de fire faner har til faelles (som sc4.5)

   NK.Fane.paa(P, valg) laegger de faelles metoder paa fanens prototype:

     * opgavelisten i panelet med loest og stjerne (huskes i browseren)
     * opgaven. Paa fane 1 og 2 staar den paa ét kort oeverst midt i
       scenen (scenekortet, som sc7.5), fordi eleverne klikker, foer de
       laeser, og ikke kigger ud i siden (brugerens oenske 9. okt. 2026):
       gaettet, det, der skal goeres, spoergsmaalet med svarene side om
       side, forklaringen til det rigtige svar og den groenne knap, der
       foerer videre. Panelet har intet opgavekort. Paa fane 3 og 4 staar
       opgaven i panelet ved de felter, eleven skriver i.
     * den gule knap: Giv hint og Vis svaret (paa fane 3 og 4 ogsaa
       Naeste opgave). Paa scenekortet sidder den i kortets nederste
       raekke og er vaek, naar den groenne knap foerer videre.
     * linjen ved knappen: naeste skridt, fejl, hint og svar, og det, et
       klik i scenen svarer (ingen Kemichael: brugerens valg 9. okt. 2026)
     * musen i scenen: hold, traek og klik

   Fanen selv har: lavOpgave(nr, nyeTal), trinInfo() ({ hint, svar }),
   trinLinje(), layout(), tegn(), opdaterScene(dt) og musen i scenen:
   overScene, nedScene, flytScene, opScene. Dertil enten promptHTML()
   (opgavekort i panelet) eller kortData() og kortValg(j) (scenekort).

   kortData() giver det, scenekortet viser:
     { slags: "gaet", intro, tekst, svar: [{ j, t }] }
     { slags: "opgave", chip, tekst, gaet (HTML), gaetKl }
     { slags: "spm", chip, intro, foer (HTML over spoergsmaalet), tekst,
       svar: [{ j, t, forkert, rigtig, laast }] }
     { slags: "loest", gul (svaret blev vist), chip, svaret, foer, gaet,
       gaetKl, html (forklaringen), videre (knappens tekst) }
   Svarene har ingen bogstaver foran: paa fane 2 hedder glassene A, B og C.

   I index.html har en fane med scenekort i scenen: kortet
   <div class="scenekort" id="x-skort"> med <div id="x-ind"> (indholdet)
   og raekken <div class="kt-bund" id="x-status"> med x-besked og x-knap.
   Pladsen til kortet er sat af oeverst (kortZone), saa det ikke daekker
   det, eleven skal se paa: fanens layout begynder under 10 + lay.zone.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    /* Et tal og dets enhed deles ikke over to linjer ("0,80 L"), og et
       regnestykke heller ikke ("c = 0,20 mol / 0,80 L = 0,25 M") */
    function fast(html) {
        return String(html).replace(/(\d) (M|L|mL|mol|g)(?![A-Za-zæøå])/g, "$1\u00a0$2")
            .replace(/ ([=\/·+−]) /g, "\u00a0$1\u00a0");
    }

    function punktum(t) {
        t = String(t).replace(/\s+/g, " ");
        return t + (/[.?!]$/.test(t) ? "" : ".");
    }

    /* Scenekortets indhold ud fra kortData() */
    function kortHTML(k) {
        var html = "";
        if (k.slags === "gaet") {
            html = '<span class="gk-maerke">Gæt først</span>';
            if (k.intro) html += '<p class="gk-intro">' + NK.html(k.intro) + "</p>";
            html += '<p class="gk-tekst">' + NK.html(k.tekst) + '</p><div class="gk-svar">';
            k.svar.forEach(function (s) {
                html += '<button type="button" class="gk-knap" data-valg="' + s.j + '">' + NK.html(s.t) + "</button>";
            });
            return html + "</div>";
        }
        var gaet = k.gaet ? '<p class="kt-gaet' + (k.gaetKl ? " " + k.gaetKl : "") + '">' + k.gaet + "</p>" : "";
        if (k.slags === "loest") {
            /* Forklaringen til venstre og knappen, der foerer videre, til hoejre */
            return '<div class="kt-slut"><div class="kt-slut-t">' + gaet + (k.foer || "") +
                '<p class="kt-tekst"><span class="kt-chip">' + NK.html(k.chip) + "</span>" +
                (k.svaret ? '<b class="kt-svaret">' + NK.html(punktum(k.svaret)) + "</b> " : "") + (k.html || "") + "</p></div>" +
                '<button type="button" class="kt-videre" data-videre="1">' + NK.html(k.videre) + "</button></div>";
        }
        if (k.intro) html += '<p class="kt-intro">' + NK.html(k.intro) + "</p>";
        html += (k.foer || "") + '<p class="kt-tekst"><span class="kt-chip">' + NK.html(k.chip) + "</span>" + NK.html(k.tekst) + "</p>" + gaet;
        if (k.svar) {
            html += '<div class="kt-svar n' + k.svar.length + '">';
            k.svar.forEach(function (s) {
                html += '<button type="button" class="kt-knap' + (s.forkert ? " forkert" : "") + (s.rigtig ? " rigtig" : "") +
                    '" data-valg="' + s.j + '"' + (s.laast ? " disabled" : "") + ">" + NK.html(s.t) + "</button>";
            });
            html += "</div>";
        }
        return html;
    }

    function paa(P, valg) {
        var navn = valg.navn;
        var NOEGLE = "nk-sc5.1-" + navn;

        function el(id) { return NK.el(navn + "-" + id); }

        /* ----- Opstart --------------------------------------------------------- */
        P.startFane = function (opgaver) {
            var mig = this;
            this.navn = navn;
            this.L = new NK.Laerred(el("laerred"));
            this.tid = 0;
            this.opgaver = opgaver;
            var gemt = NK.hent(NOEGLE, {}) || {};
            this.status = opgaver.map(function (o) {
                var s = gemt[o.id];
                return { loest: !!(s && s.l), stjerne: !!(s && s.s) };
            });
            this.rostAlt = !!gemt._rost;
            this.hjaelp = 0;
            this.venter = false;
            this.pegKnap = false;
            this.slutEkstra = "";
            this.el = { knap: el("knap"), liste: el("liste"), nye: el("nye"), kort: el("kort"), besked: el("besked"),
                forfra: el("forfra"), skort: el("skort"), ind: el("ind"), status: el("status") };
            this.fast = { html: "", klasse: "" };
            this.nuB = this.fast;
            this.kortT = 0;
            this.el.knap.addEventListener("click", function () { mig.knap(); });
            if (this.el.nye) this.el.nye.addEventListener("click", function () { mig.nyeTal(); });
            if (this.el.forfra) this.el.forfra.addEventListener("click", function () { mig.forfra(); mig.fokus(); });
            /* Svarene og den groenne knap paa scenekortet */
            if (this.el.skort) this.el.skort.addEventListener("click", function (e) {
                var t = e.target;
                if (!t || !t.closest) return;
                if (t.closest("[data-videre]")) { mig.knap(); return; }
                var k = t.closest("[data-valg]");
                if (k && !k.disabled) mig.kortValg(parseInt(k.getAttribute("data-valg"), 10));
            });
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
            if (this.rostAlt) ud._rost = 1;
            NK.gem(NOEGLE, ud);
        };

        P.antalLoest = function () {
            return this.status.filter(function (s) { return s.loest; }).length;
        };

        /* ----- Opgavelisten ---------------------------------------------------- */
        P.bygListe = function () {
            var mig = this;
            this.el.liste.innerHTML = "";
            this.opgaver.forEach(function (o, i) {
                var knap = document.createElement("button");
                knap.type = "button";
                knap.className = "hyldelinje";
                knap.innerHTML = '<span class="hl-nr">' + (i + 1) + '</span><span class="hl-navn">' + NK.html(o.titel) +
                    '</span><span class="hl-stjerner" id="' + navn + '-stj-' + i + '"></span>';
                knap.addEventListener("click", function () { mig.vaelg(i, false); });
                mig.el.liste.appendChild(knap);
            });
        };

        P.visListe = function () {
            var mig = this;
            var knapper = this.el.liste.querySelectorAll(".hyldelinje");
            this.status.forEach(function (s, i) {
                knapper[i].classList.toggle("valgt", i === mig.nr);
                NK.saetTekst(navn + "-stj-" + i, s.stjerne ? "★" : (s.loest ? "✓" : ""));
            });
            NK.saetTekst(navn + "-loest", String(this.antalLoest()));
        };

        /* ----- Opgaven --------------------------------------------------------- */
        P.vaelg = function (i, nyeTal) {
            this.nr = i;
            this.hjaelp = 0;
            this.pegKnap = false;
            this.brugtSvar = false;
            this.faerdig = false;
            this.venter = false;
            this.slutEkstra = "";
            this.lavOpgave(i, nyeTal);
            this.layout();
            this.visKort();
            this.visListe();
            /* Paa scenekortet siger opgaven selv, hvor man er: ingen indledning i linjen */
            this.naesteLinje(this.introNu && !this.el.skort ? D.INTRO[navn] : "", "");
            this.introNu = false;
            this.fokus();
        };

        P.nyeTal = function () { this.vaelg(this.nr, true); };

        /* Et element fra listen, helst et andet end sidst */
        P.traek = function (liste, sidst) {
            var andre = liste.filter(function (x) { return x !== sidst; });
            return NK.tilfaeldig(andre.length ? andre : liste);
        };

        P.visKort = function () {
            var o = this.opgaver[this.nr];
            if (this.el.skort) this.visSceneKort();
            else {
                NK.saetTekst(navn + "-titel", o.titel);
                NK.saetTekst(navn + "-nr", String(this.nr + 1));
                NK.saetTekst(navn + "-antal", String(this.opgaver.length));
                NK.saetHTML(navn + "-prompt", this.promptHTML());
                this.el.kort.classList.toggle("sejr", this.faerdig);
            }
            if (this.el.nye) this.el.nye.hidden = !(this.harNyeTal && this.harNyeTal());
            if (this.el.forfra) this.el.forfra.hidden = !(this.harForfra && this.harForfra());
            if (this.visKortEkstra) this.visKortEkstra();
            this.visKnap();
        };

        /* ----- Scenekortet (fane 1 og 2) -----------------------------------------
           Opgaven staar samme sted hele vejen: gaettet (stort og gult), det,
           eleven skal goere, spoergsmaalet med svarene og, naar svaret er
           rigtigt, forklaringen og knappen videre paa et groent kort. */
        P.visSceneKort = function () {
            var k = this.kortData(), e = this.el.skort;
            var kl = "scenekort " + k.slags + (k.gul ? " svar" : "");
            if (e.className.replace(" blink", "") !== kl) e.className = kl;
            var html = fast(kortHTML(k));
            if (html !== this.kortSidst) {
                this.el.ind.innerHTML = html;
                this.kortSidst = html;
            }
        };

        /* Teksten paa den knap, der foerer videre */
        P.videreTekst = function () {
            if (!this.faerdig) return "Næste spørgsmål →";
            if (this.naesteUloeste() >= 0) return "Næste opgave →";
            return valg.naesteFane ? "Videre til " + valg.naesteNavn + " →" : "Forfra med nye tal ↺";
        };

        /* Eleven klikkede i scenen, foer der var gaettet: kortet blinker */
        P.gaetBlink = function () {
            var e = this.el.skort;
            e.classList.remove("blink");
            void e.offsetWidth;
            e.classList.add("blink");
            this.kortBesked(NK.html(D.GAET_LINJE), 5, "gul");
        };

        /* Den hoejde, kortet har faaet sat af oeverst i scenen (valg.zone:
           almindelig skaerm og lav skaerm). Scenen begynder under den, saa intet
           flytter sig, naar kortet skifter. Paa en smal skaerm knaekker teksten
           flere gange; saa faar kortet den plads, det fylder. Gaettet taeller
           ikke med (det ligger over en daempet scene), og et svar paa et klik
           i scenen, der er vaek igen om lidt, flytter heller ikke noget. */
        P.kortZone = function () {
            if (!this.el.skort) return 0;
            var basis = valg.zone ? valg.zone[window.innerHeight <= 720 ? 1 : 0] : 150;
            if (this.kortT > 0 && this.lay && this.lay.zone >= basis) return this.lay.zone;
            var h = this.gaetNu && this.gaetNu() ? 0 : this.el.skort.offsetHeight;
            return Math.max(basis, h);
        };

        P.tjekZone = function () {
            if (!this.lay || this.lay.zone === undefined || !this.el.skort) return;
            if (this.kortZone() !== this.lay.zone) this.layout();
        };

        P.visKnap = function () {
            var tekst, klasse = "knap hjaelp", videre = this.faerdig || this.venter;
            if (videre) {
                klasse = "knap blaa banker";
                tekst = this.videreTekst();
            } else {
                tekst = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
                if (this.hjaelp > 0) klasse += " svar";
                /* Mens der gaettes, er gaettekortet det eneste fyldte gule */
                if (this.gaetNu && this.gaetNu()) klasse += " stille";
                if (this.pegKnap && this.hjaelp === 0) klasse += " peg";
            }
            this.el.knap.textContent = tekst;
            this.el.knap.className = klasse;
            this.el.knap.disabled = !!this.auto;
            /* Paa scenekortet foerer den groenne knap videre; den gule er vaek imens */
            if (this.el.skort) {
                this.el.knap.hidden = videre;
                this.visBund();
            }
        };

        P.naesteUloeste = function () {
            var n = this.status.length;
            for (var d = 1; d <= n; d++) {
                var i = (this.nr + d) % n;
                if (!this.status[i].loest) return i;
            }
            return -1;
        };

        /* ----- Knappen: Giv hint, Vis svaret, Naeste opgave --------------------- */
        P.knap = function () {
            if (this.auto) return;
            if (this.faerdig) {
                var naeste = this.naesteUloeste();
                if (naeste >= 0) this.vaelg(naeste, false);
                else if (valg.naesteFane && NK.visFane) NK.visFane(valg.naesteFane);
                else this.vaelg(0, true);
                return;
            }
            /* Et rigtigt svar venter paa, at eleven selv gaar videre */
            if (this.venter) {
                this.naesteSpm();
                this.fokus();
                return;
            }
            var info = this.trinInfo();
            if (!info) return;
            if (this.hjaelp === 0) {
                this.hjaelp = 1;
                this.hjaelpVis(info.hint);
                this.visKnap();
                this.fokus();
                return;
            }
            this.brugtSvar = true;
            info.svar();
            this.visKnap();
            this.fokus();
        };

        /* Et trin er loest: linjen viser det svar, eleven bad om, og siger det
           naeste skridt */
        P.trinLoest = function (maade, svarHTML) {
            this.hjaelp = 0;
            if (maade === "svar") this.brugtSvar = true;
            if (this.opgaveFaerdig()) {
                this.opgaveLoest(maade, maade === "svar" ? svarHTML : null);
            } else {
                if (maade === "svar" && svarHTML) this.svarVis(svarHTML);
                else this.naesteLinje(NK.tilfaeldig(D.ROS), "god");
            }
            this.visKnap();
            this.fokus();
        };

        P.opgaveLoest = function (maade, svarHTML) {
            var s = this.status[this.nr];
            this.faerdig = true;
            this.venter = false;
            s.loest = true;
            s.stjerne = s.stjerne || !this.brugtSvar;
            var alle = this.antalLoest() === this.opgaver.length;
            var linje = this.slutLinje ? this.slutLinje() : "";
            var ros = NK.tilfaeldig(D.ROS_OPGAVE);
            this.slutEkstra = "";
            if (alle && !this.rostAlt) { this.rostAlt = true; ros = D.FAERDIG[navn]; this.slutEkstra = ros; }
            this.gem();
            /* Paa scenekortet staar forklaringen paa det groenne kort (kortData) */
            if (this.el.skort) this.besked("", "");
            else this.besked((svarHTML ? svarHTML + " " : "") + (linje ? linje + " " : "") + ros, maade === "svar" ? "gul" : "god");
            this.visKort();
            this.visListe();
            if (this.efterOpgave) this.efterOpgave();
        };

        /* ----- Linjen ved knappen --------------------------------------------------
           besked: den faste linje (naeste skridt, fejl, ros, hint og svar).
           Efter et forkert svar lyser hintknappen stille op, til linjen
           skifter igen. kortBesked: et svar paa et klik i scenen, der
           forsvinder igen efter sek sekunder. */
        P.besked = function (html, klasse) {
            this.fast = { html: html || "", klasse: klasse || "" };
            this.kortT = 0;
            this.pegKnap = klasse === "skidt" && !this.faerdig && this.hjaelp === 0;
            this.visBesked(this.fast);
            this.el.knap.classList.toggle("peg", this.pegKnap);
        };

        P.kortBesked = function (html, sek, klasse) {
            this.kortT = sek || 4;
            this.visBesked({ html: html, klasse: klasse || (this.el.skort ? "peger" : "") });
        };

        P.visBesked = function (b) {
            var e = this.el.besked;
            if (!e) return;
            e.innerHTML = this.el.skort ? fast(b.html) : b.html;
            if (this.el.skort) {
                this.nuB = b;
                this.visBund();
            } else {
                e.className = "besked" + (b.klasse ? " " + b.klasse : "");
            }
        };

        /* Scenekortets nederste raekke: linjen og den gule knap. Naar den groenne
           knap foerer videre, er raekken vaek, medmindre et klik i scenen lige
           har faaet et svar. */
        P.visBund = function () {
            var st = this.el.status, b = this.nuB || this.fast, harTekst = !!b.html;
            this.el.besked.hidden = !harTekst;
            st.hidden = (this.faerdig || this.venter) && !harTekst;
            var kl = "kt-bund" + (b.klasse ? " " + b.klasse : "") + (harTekst ? "" : " tom");
            if (st.className.replace(" ryster", "") !== kl) st.className = kl;
            this.tjekZone();
        };

        P.beskedTekst = function () { return this.el.besked ? this.el.besked.textContent.replace(/\u00a0/g, " ") : ""; };

        P.naesteLinje = function (foer, slags) {
            var t = this.faerdig ? "" : this.trinLinje();
            this.besked((foer ? foer + " " : "") + t, slags || "");
        };

        /* Et forkert svar paa scenekortet: maerket Ikke endnu, og raekken ryster */
        P.fejlLinje = function (html) {
            if (!this.el.skort) { this.besked(html, "skidt"); return; }
            this.besked('<span class="b-maerke">Ikke endnu</span> ' + html, "skidt");
            var e = this.el.status;
            e.classList.remove("ryster");
            void e.offsetWidth;
            e.classList.add("ryster");
        };

        /* ----- Hint og svar: kun naar eleven beder om det -------------------------
           Begge staar i linjen ved den gule knap. Efter svaret staar naeste
           skridt i samme linje. */
        P.hjaelpVis = function (hint) {
            this.besked((this.el.skort ? '<span class="b-maerke">Hint</span> ' : "<b>Hint:</b> ") + hint, "gul");
        };

        P.svarVis = function (html) {
            var trin = this.faerdig ? "" : this.trinLinje();
            if (this.el.skort) html = '<span class="b-maerke">Svaret</span> ' + html;
            this.besked(html + (trin ? " " + trin : ""), "gul");
        };

        /* ----- Fokus og taster ---------------------------------------------------- */
        P.fokus = function () {
            if (!NK.el("fane-" + navn).classList.contains("aktiv") ||
                document.querySelector(".overlay.vis") || (NK.Rundvisning && NK.Rundvisning.aktiv())) return;
            if (this.faerdig) return;
            if (this.regning) this.regning.fokus();
        };

        P.enter = function () { if (this.faerdig || this.venter) this.knap(); };
        P.nulstil = function () {
            if (this.harForfra && this.harForfra()) this.forfra();
            else this.nyeTal();
        };

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

        /* ----- Tegneloekken ------------------------------------------------------- */
        P.opdater = function (dt) {
            this.tid += dt;
            if (this.kortT > 0) {
                this.kortT -= dt;
                if (this.kortT <= 0) { this.kortT = 0; this.visBesked(this.fast); }
            }
            if (this.opdaterScene) this.opdaterScene(dt);
        };

        /* ----- Musen ------------------------------------------------------------
           Et tryk i scenen gaar til fanen (nedScene). Holder fanen tag i noget (en hane, spatlen), faar den ogsaa
           flytningerne og slippet, ogsaa uden for laerredet. */
        P.koblMus = function () {
            var mig = this, c = this.L.canvas;
            this.greb = false;
            c.addEventListener("pointermove", function (e) {
                var pt = mig.L.punkt(e);
                if (mig.greb && mig.flytScene) { mig.flytScene(pt); return; }
                var u = mig.overScene ? mig.overScene(pt) : null;
                c.style.cursor = u ? "pointer" : "default";
            });
            c.addEventListener("pointerleave", function () {
                if (!mig.greb) { if (mig.overScene) mig.overScene(null); c.style.cursor = "default"; }
            });
            c.addEventListener("pointerdown", function (e) {
                if (e.button !== undefined && e.button !== 0) return;
                var pt = mig.L.punkt(e);
                if (mig.nedScene && mig.nedScene(pt)) {
                    mig.greb = true;
                    try { c.setPointerCapture(e.pointerId); } catch (x) { /* ingen capture */ }
                    e.preventDefault();
                }
            });
            function slip(e) {
                if (!mig.greb) return;
                mig.greb = false;
                if (mig.opScene) mig.opScene(mig.L.punkt(e));
            }
            c.addEventListener("pointerup", slip);
            c.addEventListener("pointercancel", slip);
            c.addEventListener("click", function () { mig.fokus(); });
        };
    }

    NK.Fane = { paa: paa };
}());
