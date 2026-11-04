/* =====================================================================
   fane.js - det, de tre faner har til faelles

   Hver fane er et skema paa en tavle og en scene omkring det. Denne fil
   laegger de faelles metoder paa fanens prototype med NK.Fane.paa(P, valg):

     * opgavelisten i panelet med loest og stjerne (huskes i browseren)
     * knappen i opgavekortet: Giv hint, Vis svaret, Naeste opgave
     * tjekket af felterne i skemaet og afstemningen
     * beregningerne i panelet, som de skal skrives
     * linjen i opgavekortet: hvor man er, naeste skridt, fejl og ros,
       og hintet eller svaret, naar eleven beder om det med den gule knap
       (ingen Kemichael: brugerens valg 9. okt. 2026)

   Fanen selv har: lavSpec(nr, nyeTal) (opgaven til NK.Skema.lavOpgave),
   kortTekst() (opgaven paa kortet), layout(), tegn(), opdaterScene(dt)
   og kroge som efterLoest(id, maade).

   Papirkortet (4. nov. 2026, faelles/papirkort.css og papirkort.js):
   opgaven staar paa ét lyst kort oeverst midt i scenen, ikke i panelet.
   Kortet har opgaven (etiketten "Opgave 2 af 4" som indlejret
   overskrift), paa fane 3 valget af det stof, der slipper op foerst,
   og en nederste raekke med linjen (naeste skridt, fejl, hint, svar),
   Giv hint og Indsend svar. Felterne staar paa tavlen; Indsend svar
   sender det felt ind, eleven er i (Enter i feltet goer det samme), og
   den er graa, til der staar noget i det. Et svar paa valget vaelger
   kun. Naar opgaven er loest, bliver kortet staaende med forklaringen
   og Naeste opgave, dér hvor Indsend svar stod (NK.Papir.bliv). Efter
   den sidste opgave paa sidste fane er der ingen knap paa kortet; Nye
   tal ligger i panelet. Tavlen begynder under kortet (kortZone, top).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    /* Rosen til et trin er ét ord paa kortet: Rigtigt */
    function rosMaerke() { return '<span class="b-maerke">Rigtigt</span>'; }

    /* Paa papirkortet staar spoergsmaalet (saetningen med ?) halvfedt */
    function papir(html) { return NK.Papir ? NK.Papir.tekst(html) : html; }

    /* Kortets indhold ud fra kortData() */
    function kortHTML(k) {
        var html = '<p class="sk-tekst"><span class="sk-chip">' + NK.html(k.chip) + "</span>" + papir(k.tekst) + "</p>";
        var v = k.valg;
        if (v) {
            html += '<p class="sk-tekst sk-valgspm"><span class="sk-spm">' + NK.html(v.spm) + "</span></p>";
            html += '<div class="sk-svar n' + v.svar.length + '">';
            v.svar.forEach(function (x) {
                var kl = (x.valgt ? " valgt" : "") + (x.rigtig ? " rigtig" : "") + (x.forkert ? " forkert" : "") +
                    (x.svarVist ? " svar-vist" : "") + (x.dim ? " dim" : "");
                html += '<button type="button" class="sk-knap' + kl + '" data-valg="' + x.j + '"' + (x.laast ? " disabled" : "") + ">" + x.t + "</button>";
            });
            html += "</div>";
        }
        if (k.bliv) {
            if (k.videre) html += NK.Papir.bliv(k.html || "", k.maerke, NK.html(k.videre), k.gul);
            else html += '<div class="sk-bund bliv ' + (k.gul ? "svar" : "god") + '"><p class="st-tekst"><span class="b-maerke">' +
                k.maerke + "</span> " + (k.html || "") + "</p></div>";
        }
        return html;
    }

    function paa(P, valg) {
        var navn = valg.navn;
        var NOEGLE = "nk-sc5.5-" + navn;

        function el(id) { return NK.el(navn + "-" + id); }

        /* ----- Opstart --------------------------------------------------------- */
        P.startFane = function () {
            var mig = this;
            this.navn = navn;
            this.L = new NK.Laerred(el("laerred"));
            this.tid = 0;
            this.skema = new NK.Skema({
                vaert: el("felter"), navn: navn,
                kald: {
                    tjek: function (id) { mig.tjekCelle(id); },
                    afstem: function () { mig.tjekAfstem(); },
                    klik: function (id) { mig.klikLaast(id); },
                    skriver: function () { mig.visIndsend(); }
                }
            });
            this.opgaver = valg.opgaver;
            var gemt = NK.hent(NOEGLE, {}) || {};
            this.status = this.opgaver.map(function (o) {
                var s = gemt[o.id];
                return { loest: !!(s && s.l), stjerne: !!(s && s.s) };
            });
            this.rostAlt = !!gemt._rost;
            this.ekstra = [];
            this.hjaelp = 0;
            this.el = {
                knap: el("knap"), liste: el("liste"), nye: el("nye"), linjer: el("linjer"), besked: el("besked"),
                skort: el("skort"), ind: el("ind"), status: el("status"), indsend: el("indsend")
            };
            this.fast = { html: "", klasse: "" };
            this.nuB = this.fast;
            this.kortT = 0;
            this.venter = false;
            this.valgtSvar = null;
            this.el.knap.addEventListener("click", function () { mig.knap(); });
            this.el.indsend.addEventListener("click", function () { mig.indsendKlik(); });
            this.el.nye.addEventListener("click", function () { mig.nyeTal(); });
            /* Svarene og den groenne knap paa kortet */
            this.el.skort.addEventListener("click", function (e) {
                var t = e.target;
                if (!t || !t.closest) return;
                if (t.closest("[data-videre]")) { mig.knap(); return; }
                var k = t.closest("[data-valg]");
                if (k && !k.disabled) mig.vaelgKortSvar(parseInt(k.getAttribute("data-valg"), 10));
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
                var r = D.reaktion(o.r);
                var knap = document.createElement("button");
                knap.type = "button";
                knap.className = "hyldelinje";
                knap.innerHTML = '<span class="hl-nr">' + (i + 1) + '</span><span class="hl-navn">' + NK.html(r.navn) +
                    '<em>' + NK.html(D.skema(r)) + '</em></span><span class="hl-stjerner" id="' + navn + '-stj-' + i + '"></span>';
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
            var spec = this.lavSpec(i, nyeTal);
            this.spec = spec;
            this.opg = NK.Skema.lavOpgave(spec);
            this.skema.trinvis = this.trinvis !== false;
            this.skema.saet(this.opg);
            this.hjaelp = 0;
            this.brugtSvar = false;
            this.faerdig = false;
            this.venter = false;
            this.valgtSvar = null;
            this.slutTekst = "";
            this.ekstra = [];
            if (this.nyOpgave) this.nyOpgave();
            this.layout();
            this.visKort();
            this.visLinjer();
            this.visListe();
            this.naesteLinje(this.introNu ? D.INTRO[navn] : "", "");
            this.introNu = false;
            this.fokus();
        };

        P.nyeTal = function () { this.vaelg(this.nr, true); };

        /* Et tal fra listen, helst et andet end sidst */
        P.traek = function (liste, sidst) {
            var andre = liste.filter(function (x) { return x !== sidst; });
            return NK.tilfaeldig(andre.length ? andre : liste);
        };

        /* ----- Kortet oeverst midt i scenen ------------------------------------ */
        P.visKort = function () {
            var e = this.el.skort, k = this.kortData();
            var kl = "scenekort " + k.slags + (k.gul ? " svar" : "") + (k.bliv ? " bliv" : "");
            if (e.className.replace(" blink", "") !== kl) e.className = kl;
            var html = kortHTML(k);
            if (html !== this.kortSidst) {
                this.el.ind.innerHTML = html;
                this.kortSidst = html;
            }
            this.visKnap();
        };

        /* Det, kortet viser lige nu:
             slags "opgave": opgaven, og paa fane 3 evt. valget med svarene
             slags "loest":  opgaven og forklaringen med knappen videre (bliv)
           Under valget paa fane 3 bliver kortet ogsaa paa spoergsmaalet,
           til eleven trykker Naeste skridt (venter). */
        P.kortData = function () {
            var k = { slags: "opgave", chip: "Opgave " + (this.nr + 1) + " af " + this.opgaver.length, tekst: this.kortTekst() };
            if (this.valgData) k.valg = this.valgData();
            if (this.venter && this.valgBliv) {
                k.slags = "loest";
                k.bliv = true;
                k.gul = !this.valgBliv.rigtig;
                k.maerke = this.valgBliv.maerke;
                k.html = this.valgBliv.html;
                k.videre = "Næste skridt →";
            } else if (this.faerdig) {
                k.slags = "loest";
                k.bliv = true;
                k.maerke = this.brugtSvar ? "Løst" : "Rigtigt";
                k.html = this.slutTekst;
                k.videre = this.videreTekst();
            }
            return k;
        };

        /* Teksten paa den knap, der foerer videre (tom: ingen knap) */
        P.videreTekst = function () {
            var naeste = this.naesteUloeste();
            if (naeste >= 0) return "Næste opgave →";
            if (valg.naesteFane) return "Videre til " + valg.naesteNavn + " →";
            return "";
        };

        P.visKnap = function () {
            var videre = this.faerdig || this.venter;
            var tekst = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
            var klasse = "knap hjaelp" + (this.hjaelp > 0 ? " svar" : "");
            if (this.pegKnap && this.hjaelp === 0) klasse += " peg";
            this.el.knap.textContent = tekst;
            this.el.knap.className = klasse;
            /* Mens poserne reagerer, og naar kortet foerer videre, er hintknappen vaek */
            this.el.knap.hidden = videre || this.reagerer();
            this.visIndsend();
            this.visBund();
        };

        /* Reagerer poserne lige nu (fane 3)? Saa er kortet laast. */
        P.reagerer = function () { return false; };

        P.blinkKort = function () {
            var e = this.el.skort;
            e.classList.remove("blink");
            void e.offsetWidth;
            e.classList.add("blink");
        };

        /* ----- Indsend svar (brugeren 24. okt. 2026: "der skal som minimum vaere
           et indsend svar") ------------------------------------------------------
           Felterne paa tavlen: Indsend svar sender det felt, eleven er i (eller
           det naeste), og afstemningen. Valget paa fane 3: et svar paa kortet
           eller et klik paa poserne vaelger kun; Indsend svar sender ind. */
        P.spmAaben = function () {
            return !this.faerdig && !this.venter && !this.reagerer() && !!this.trin();
        };

        P.sendesNu = function () {
            if (!this.spmAaben()) return null;
            var t = this.trin(), s = this.skema;
            if (t === "valg") return this.valgtSvar !== null ? { t: t, j: this.valgtSvar } : { t: t, tom: true };
            if (t === "afstem") {
                var noget = s.koefVaerdier().some(function (v) { return String(v).trim() !== ""; });
                return { t: t, tom: !noget };
            }
            return { t: t, tom: !String(s.skrevet(t)).trim() };
        };

        P.vaelgKortSvar = function (j) {
            if (!this.spmAaben() || this.trin() !== "valg") { this.blinkKort(); return false; }
            this.valgtSvar = j;
            this.visKort();
            return true;
        };

        P.indsendKlik = function () {
            var x = this.sendesNu();
            if (!x) { this.blinkKort(); return; }
            if (x.tom) {
                this.blinkKort();
                this.kortBesked(x.t === "valg" ? "Vælg et af svarene på kortet først." : "Skriv et tal i feltet på tavlen først.", 3.5);
                this.fokus();
                return;
            }
            if (x.t === "valg") { this.valgtSvar = null; this.vaelgBegr(x.j, "gaet"); return; }
            if (x.t === "afstem") { this.tjekAfstem(); return; }
            this.tjekCelle(x.t);
        };

        /* Indsend svar staar kun fremme, naar der er noget at svare paa; graa, til der er */
        P.visIndsend = function () {
            var e = this.el.indsend, x = this.sendesNu();
            e.hidden = !x;
            var klar = !!x && !x.tom;
            e.classList.toggle("klar", klar);
            e.classList.toggle("ikke-klar", !klar);
            e.setAttribute("aria-disabled", klar ? "false" : "true");
        };

        /* ----- Pladsen til kortet ----------------------------------------------
           Kortet har en hoejde sat af oeverst i scenen (almindelig og lav
           skaerm), og tavlen begynder under den, saa intet flytter sig, naar
           kortet skifter. Bliver kortet hoejere (et langt hint, en smal
           skaerm), faar det den plads, det fylder. Et kort svar paa et klik i
           scenen, der er vaek igen om lidt, flytter ikke noget. */
        P.kortZone = function () {
            var basis = (valg.zone || [124, 104])[window.innerHeight <= 720 ? 1 : 0];
            if (this.kortT > 0 && this.lay && this.lay.zone >= basis) return this.lay.zone;
            return Math.max(basis, this.el.skort.offsetHeight);
        };

        /* Det oeverste, tavlen maa begynde: under kortet */
        P.top = function () { return 10 + this.kortZone() + 8; };

        P.tjekZone = function () {
            if (!this.lay || this.lay.zone === undefined) return;
            if (this.kortZone() !== this.lay.zone) this.layout();
        };

        P.naesteUloeste = function () {
            var n = this.status.length;
            for (var d = 1; d <= n; d++) {
                var i = (this.nr + d) % n;
                if (!this.status[i].loest) return i;
            }
            return -1;
        };

        /* ----- Det trin, hint og svar gaelder ---------------------------------- */
        P.trin = function () {
            var s = this.skema, nx = s.naeste();
            if (!nx || nx === "afstem" || nx === "valg" || s.trinvis) return nx;
            var a = s.aktiv && s.celle(s.aktiv);
            if (a && s.erAaben(a.id)) return a.id;
            if (s.erAaben(nx)) return nx;
            var o = this.opg, fundet = null;
            o.trin.forEach(function (t) { if (!fundet && o.celler[t] && s.erAaben(t)) fundet = t; });
            return fundet || nx;
        };

        /* ----- Knappen: Giv hint, Vis svaret, Naeste opgave --------------------- */
        P.knap = function () {
            if (this.faerdig) {
                var naeste = this.naesteUloeste();
                if (naeste >= 0) this.vaelg(naeste, false);
                else if (valg.naesteFane && NK.visFane) NK.visFane(valg.naesteFane);
                return;
            }
            /* Kortet blev staaende paa valget: eleven gaar selv videre */
            if (this.venter) {
                this.venter = false;
                this.naesteLinje("", "");
                this.visKort();
                this.fokus();
                return;
            }
            if (this.reagerer()) { this.blinkKort(); return; }
            var t = this.trin();
            if (!t) return;
            if (this.hjaelp === 0) {
                this.hjaelp = 1;
                if (t === "valg") this.hjaelpVis(this.valgHint());
                else {
                    this.skema.fremhaev = t === "afstem" ? null : t;
                    this.hjaelpVis(this.skema.hintHTML(t));
                }
                this.visKnap();
                this.fokus();
                return;
            }
            this.brugtSvar = true;
            if (t === "afstem") {
                this.skema.visKoefSvar();
                this.afstemt("svar");
            } else if (t === "valg") {
                this.vaelgBegr(this.opg.kilde, "svar");
            } else {
                this.celleLoest(t, "svar");
            }
        };

        /* ----- Tjek ------------------------------------------------------------ */
        P.tjekCelle = function (id) {
            var s = this.skema;
            if (!s.erAaben(id) || this.faerdig) return;
            /* Skriver eleven videre, mens kortet venter paa valget, gaar det videre */
            if (this.venter) { this.venter = false; this.visKort(); }
            s.aktiv = id;
            var res = s.tjek(id, s.skrevet(id));
            if (res.tom) { this.kortBesked(NK.html(res.besked), 3.5); this.blinkKort(); this.fokus(); return; }
            if (res.ok) { this.celleLoest(id, "ok"); return; }
            s.markerForkert(id);
            this.fejlLinje(NK.html(res.besked));
            this.fokus();
        };

        P.tjekAfstem = function () {
            var res = this.skema.tjekKoef();
            if (res.tom) { this.kortBesked(NK.html(res.besked), 3.5); this.blinkKort(); return; }
            if (res.ok) { this.afstemt("ok"); return; }
            this.skema.rystKoef();
            this.fejlLinje(NK.html(res.besked));
        };

        P.afstemt = function (maade) {
            this.skema.afstem(maade);
            this.hjaelp = 0;
            this.ekstra.push({ trin: "afstem", html: "Afstemt: " + NK.html(D.skema(this.opg.r)), svar: maade === "svar" });
            this.visLinjer();
            if (this.efterAfstem) this.efterAfstem(maade);
            if (maade === "svar") this.svarVis("Afstemt: " + NK.html(D.skema(this.opg.r)) + ".");
            else this.naesteLinje(rosMaerke(), "god");
            this.visKort();
            this.fokus();
        };

        P.celleLoest = function (id, maade) {
            this.skema.loes(id, maade);
            this.hjaelp = 0;
            if (maade === "svar") this.brugtSvar = true;
            this.visLinjer();
            if (this.efterLoest) this.efterLoest(id, maade);
            if (maade === "svar") this.svarVis(this.skema.regnHTML(id) + ".");
            if (this.skema.faerdig()) this.opgaveLoest();
            else if (maade !== "svar") this.naesteLinje(rosMaerke(), "god");
            this.visKort();
            this.fokus();
        };

        /* Klik paa et felt, der ikke er aabent endnu */
        P.klikLaast = function () {
            var s = this.skema;
            if (this.faerdig || this.venter) { this.blinkKort(); return; }
            if (!this.opg.afstemt) { this.kortBesked("Afstem skemaet først. Koefficienterne skal bruges senere.", 4); this.fokus(); return; }
            var t = this.trin();
            var foer = t === "valg" ? "Vælg først på kortet, hvilket stof der slipper op først." : "Det felt kommer senere. " + s.trinTekst(t);
            this.kortBesked(foer, 4);
            if (t === "valg") this.blinkKort();
            this.fokus();
        };

        P.opgaveLoest = function () {
            var s = this.status[this.nr];
            this.faerdig = true;
            s.loest = true;
            s.stjerne = s.stjerne || !this.brugtSvar;
            var alle = this.antalLoest() === this.opgaver.length;
            var linje = this.slutLinje ? this.slutLinje() : "";
            var ros = NK.tilfaeldig(D.ROS_OPGAVE);
            if (alle && !this.rostAlt) { this.rostAlt = true; ros = D.FAERDIG[navn]; }
            this.gem();
            /* Kortet bliver paa opgaven: forklaringen og knappen videre (bliv) */
            this.slutTekst = (linje ? linje + " " : "") + ros;
            this.besked("", "");
            this.visKort();
            this.visListe();
            if (this.efterOpgave) this.efterOpgave();
        };

        /* ----- Linjen i opgavekortet ---------------------------------------------
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

        P.kortBesked = function (html, sek) {
            this.kortT = sek || 4;
            this.visBesked({ html: html, klasse: "peger" });
        };

        P.visBesked = function (b) {
            this.el.besked.innerHTML = b.html;
            this.nuB = b;
            this.visBund();
        };

        /* Kortets nederste raekke: linjen, Giv hint og Indsend svar. Naar kortet
           foerer videre (bliv), er raekken vaek, medmindre et klik i scenen lige
           har faaet et svar. */
        P.visBund = function () {
            var st = this.el.status, b = this.nuB || this.fast, harTekst = !!b.html;
            this.el.besked.hidden = !harTekst;
            st.hidden = (this.faerdig || this.venter) && !harTekst;
            var kl = "sk-bund" + (b.klasse ? " " + b.klasse : "") + (harTekst ? "" : " tom");
            if (st.className.replace(" ryster", "") !== kl) st.className = kl;
            this.tjekZone();
        };

        P.beskedTekst = function () { return this.el.besked ? this.el.besked.textContent.replace(/\u00a0/g, " ") : ""; };

        /* Et forkert svar: maerket Ikke endnu, og raekken ryster */
        P.fejlLinje = function (html) {
            this.besked('<span class="b-maerke">Ikke endnu</span> ' + html, "skidt");
            var e = this.el.status;
            e.classList.remove("ryster");
            void e.offsetWidth;
            e.classList.add("ryster");
        };

        P.trinLinje = function () {
            var t = this.trin();
            if (!t) return "";
            if (t === "valg") return this.valgTekst();
            if (!this.skema.trinvis && t !== "afstem") return "Udfyld felterne i den rækkefølge, du vil.";
            return this.skema.trinTekst(t);
        };

        P.naesteLinje = function (foer, slags) {
            var t = this.trinLinje();
            this.besked((foer ? foer + " " : "") + t, slags || "");
        };

        /* ----- Hint og svar: kun naar eleven beder om det -------------------------
           Begge staar i linjen i opgavekortet, lige over knappen. Efter svaret
           staar naeste skridt i samme linje. */
        P.hjaelpVis = function (html) { this.besked('<span class="b-maerke">Hint</span> ' + html, "gul"); };

        P.svarVis = function (html) {
            var trin = this.skema.faerdig() ? "" : this.trinLinje();
            this.besked('<span class="b-maerke">Svaret</span> ' + html + (trin ? " " + trin : ""), "gul");
        };

        /* ----- Beregningerne i panelet ----------------------------------------- */
        P.visLinjer = function () {
            var o = this.opg, s = this.skema, html = "", ekstra = this.ekstra;
            /* I den raekkefoelge, trinene er loest i skemaet */
            o.trin.forEach(function (t) {
                ekstra.forEach(function (e) {
                    if (e.trin === t) html += '<div class="regn-linje' + (e.svar ? " svar" : "") + '">' + e.html + "</div>";
                });
                var c = o.celler[t];
                if (!c || (c.status !== "ok" && c.status !== "svar")) return;
                html += '<div class="regn-linje' + (c.status === "svar" ? " svar" : "") + '">' + s.regnHTML(t) + "</div>";
            });
            if (this.slutHTML) html += this.slutHTML();
            if (!html) html = '<p class="note">Beregningerne kommer her, når svarene er rigtige.</p>';
            NK.saetHTML(navn + "-linjer", html);
        };

        /* ----- Fokus og taster ---------------------------------------------------- */
        P.fokus = function () {
            if (!NK.el("fane-" + navn).classList.contains("aktiv") ||
                document.querySelector(".overlay.vis") || (NK.Rundvisning && NK.Rundvisning.aktiv())) return;
            if (this.faerdig || this.venter) return;
            this.skema.fokus();
        };

        P.enter = function () {
            if (this.faerdig || this.venter) this.knap();
            else if (this.trin() === "valg") this.indsendKlik();
        };
        P.nulstil = function () { this.nyeTal(); };

        P.tilpas = function () {
            if (this.L.tilpas() || !this.lay) this.layout();
            else this.tjekZone();
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
            this.skema.opdater(dt);
            if (this.opdaterScene) this.opdaterScene(dt);
        };

        /* ----- Musen ------------------------------------------------------------ */
        P.koblMus = function () {
            var mig = this, c = this.L.canvas;
            c.addEventListener("pointermove", function (e) {
                var pt = mig.L.punkt(e);
                var u = mig.overScene ? mig.overScene(pt) : null;
                c.style.cursor = u ? "pointer" : "default";
            });
            c.addEventListener("pointerleave", function () { if (mig.overScene) mig.overScene(null); c.style.cursor = "default"; });
            c.addEventListener("click", function (e) {
                var pt = mig.L.punkt(e);
                if (mig.klikScene && mig.klikScene(pt)) return;
                if (mig.faerdig || mig.venter || mig.reagerer()) mig.blinkKort();
                mig.fokus();
            });
        };
    }

    NK.Fane = { paa: paa };
}());
