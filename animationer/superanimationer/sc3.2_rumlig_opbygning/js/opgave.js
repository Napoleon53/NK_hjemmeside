/* =====================================================================
   opgave.js - opgaverne paa papirkortet oeverst midt i scenen

   Papirkortet (brugerens valg 3. og 4. nov. 2026, se "Faelles krav" i
   ../README.md): opgaven, svarene, hint, forklaringen og knapperne staar
   paa ét lyst kort oeverst midt i scenen, ikke i panelet og ikke i en
   linje nederst. Udseendet kommer fra ../faelles/papirkort.css og
   NK.Papir i ../faelles/papirkort.js.

   Kortet har tre tilstande:

     start   foer opgaverne: en kort indledning og knappen Start opgave 1.
             Eleven kan bygge og dreje frit imens.
     opgave  "Opgave 2 af 6": spoergsmaalet og evt. svarknapperne. Et svar
             eller et klik paa et atom VAELGER kun; Indsend svar sender ind
             og er graa, til der er noget at sende. Giv et hint er en
             stille knap med gul kant (Giv et hint > Vis svaret), der lyser
             stille op efter et forkert svar.
     loest   kortet bliver paa opgaven: det rigtige svar er groent (gult,
             naar svaret blev vist), forklaringen staar under, og Naeste
             opgave staar, hvor Indsend svar stod. Efter fanens sidste
             opgave foerer knappen videre til naeste fane; paa den sidste
             fane er der ingen knap, og Start forfra ligger i panelet.

   En opgave er et objekt, som fanen selv bygger:
     tekst            spoergsmaalet
     valg, rigtig     svarmuligheder og nummeret paa det rigtige (valgfrit)
     fejlValg(i)      forklaringen til et forkert svar (valgfrit)
     hint, svar       hintet og forklaringen
     start(sim)       stiller scenen op
     kan(sim)         er der noget at sende ind? (byg-opgaver, valgfrit)
     tjek(sim)        ved Indsend svar: true = loest, en tekst = hvad
                      der er galt (byg-opgaver)
     fejl(sim)        forklaringen, naar tjek ikke giver en tekst
     klik(sim, atom)  ved Indsend svar med det atom, eleven har valgt:
                      true = loest, en tekst = hvad der er galt
     laas             true: scenen er laast, mens spoergsmaalet staar
     visSvar(sim)     viser svaret i selve billedet
     slut(sim)        rydder op, naar opgaven er afsluttet

   valg til NK.Opgaver: antal (opgaver paa fanen), fast (typerne i
   raekkefoelge), intro, naesteFane og naesteNavn.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    function html(s) {
        return String(s === undefined || s === null ? "" : s)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    function papirTekst(s) { return NK.Papir ? NK.Papir.tekst(html(s)) : html(s); }

    /* Den hoejde, kortet har faaet sat af oeverst i scenen. Det, eleven
       arbejder med, tegnes under NK.kortTop(). Selvtesten maaler kortet i
       alle tilstande med det laengste hint og den laengste forklaring. */
    NK.kortZone = function () { return window.innerHeight <= 720 ? 186 : 200; };
    NK.kortTop = function () { return 10 + NK.kortZone() + 10; };

    /* Saetter pladsen paa scenen, saa knapperne i hjoernerne staar under kortet */
    NK.saetKortZone = function (canvas) {
        var scene = canvas && canvas.parentNode, v = NK.kortTop() + "px";
        if (scene && scene.style.getPropertyValue("--kortzone") !== v) scene.style.setProperty("--kortzone", v);
        return NK.kortTop();
    };

    NK.Opgaver = function (prefix, typer, sim, valg) {
        var mig = this;
        valg = valg || {};
        this.p = prefix;
        this.typer = typer;
        this.sim = sim;
        this.antal = valg.antal || typer.length;
        this.fast = !!valg.fast;
        this.intro = valg.intro || "";
        this.naesteFane = valg.naesteFane || null;
        this.naesteNavn = valg.naesteNavn || "";
        this.opgave = null;
        this.nr = -1;
        this.loeste = 0;
        this.fastB = { tekst: "", klasse: "", maerke: "" };
        this.midl = null;

        this.e = {
            kort: NK.el(prefix + "-skort"), ind: NK.el(prefix + "-ind"), status: NK.el(prefix + "-status"),
            besked: NK.el(prefix + "-besked"), hjaelp: NK.el(prefix + "-hjknap"), indsend: NK.el(prefix + "-indsend")
        };
        this.e.hjaelp.addEventListener("click", function () { mig.hjaelpKlik(); });
        this.e.indsend.addEventListener("click", function () { mig.indsendKlik(); });
        this.e.ind.addEventListener("click", function (e) {
            var b = e.target.closest ? e.target.closest("button") : null;
            if (!b || b.disabled) return;
            if (b.hasAttribute("data-videre")) { mig.videre(); return; }
            if (b.hasAttribute("data-nr")) mig.vaelg(parseInt(b.getAttribute("data-nr"), 10));
        });
        var forfra = NK.el(prefix + "-forfra");
        if (forfra) forfra.addEventListener("click", function () { if (mig.sim.nulstil) mig.sim.nulstil(); else mig.nulstil(); });
        this.raekke = this.lavRaekke();
        this.vis();
    };

    var P = NK.Opgaver.prototype;

    P.id = function (navn) { return this.p + "-" + navn; };

    /* Typerne paa fanen: i raekkefoelge, eller skiftevis, saa samme slags
       aldrig kommer to gange i traek. */
    P.lavRaekke = function () {
        var n = this.typer.length, r = [];
        for (var k = 0; k < this.antal; k++) r.push(k % n);
        return r;
    };

    /* ----- Tilstanden ---------------------------------------------------- */
    P.tilstand = function () {
        if (!this.opgave) return "start";
        return this.opgave.afsluttet ? "loest" : "opgave";
    };

    /* Er der en opgave i gang, som endnu ikke er loest eller afsloeret? */
    P.igang = function () { return !!(this.opgave && !this.opgave.afsluttet); };

    /* Er opgaven loest, og venter kortet paa, at eleven trykker Naeste? */
    P.venter = function () { return !!(this.opgave && this.opgave.afsluttet && this.harVidere()); };

    P.sidste = function () { return this.nr >= this.antal - 1; };
    P.harVidere = function () { return !this.sidste() || !!this.naesteFane; };

    /* Laasen: under et spoergsmaal, der bruger scenen, som den staar, og
       mens kortet venter paa Naeste, saetter et klik i scenen intet i gang.
       Kortet blinker i stedet. At dreje og se paa molekylet er altid i orden.
       Fanen begynder alt, der aendrer scenen, med  if (opgaver.spaer()) return; */
    P.spaer = function () {
        var o = this.opgave;
        var laast = this.venter() || !!(o && !o.afsluttet && o.laas);
        if (laast) this.blink();
        return laast;
    };

    P.blink = function () {
        var e = this.e.kort;
        e.classList.remove("blink");
        void e.offsetWidth;
        e.classList.add("blink");
    };

    /* ----- Forloebet ------------------------------------------------------ */
    P.start = function () {
        this.raekke = this.lavRaekke();
        this.nr = 0;
        this.startOpgave(this.typer[this.raekke[0]](this.sim));
    };

    /* Starter en bestemt opgave. Bruges af start(), videre() og _selvtest.html. */
    P.startOpgave = function (o) {
        this.kaldSlut(this.opgave);
        if (this.nr < 0) this.nr = 0;
        o.afsluttet = false;
        o.maade = null;
        this.opgave = o;
        this.valgt = null;
        this.klikValgt = -1;
        this.forkert = {};
        this.hjaelp = 0;
        this.peg = false;
        this.saetFast("", "");
        this.midl = null;
        if (o.start) o.start(this.sim);
        this.vis();
    };

    P.videre = function () {
        if (!this.opgave || !this.opgave.afsluttet) return;
        if (!this.sidste()) {
            this.nr++;
            this.startOpgave(this.typer[this.raekke[this.nr]](this.sim));
        } else if (this.naesteFane && NK.visFane) {
            NK.visFane(this.naesteFane);
        }
    };

    P.kaldSlut = function (o) {
        if (!o || o.sluttet) return;
        o.sluttet = true;
        if (o.slut) o.slut(this.sim);
    };

    /* Start forfra (panelets knap og R): tilbage til indledningen */
    P.nulstil = function () {
        this.kaldSlut(this.opgave);
        this.opgave = null;
        this.nr = -1;
        this.loeste = 0;
        this.saetFast("", "");
        this.midl = null;
        this.vis();
    };

    /* ----- Svarene ---------------------------------------------------------- */
    /* Et svar paa kortet vaelges kun. Indsend svar sender det ind. */
    P.vaelg = function (i) {
        var o = this.opgave;
        if (!o || o.afsluttet || !o.valg || this.forkert[i]) return;
        this.valgt = i;
        if (this.fastB.klasse === "skidt") this.saetFast("", "");
        this.vis();
    };

    /* Et klik paa et atom under en klik-opgave vaelger atomet. Returnerer
       true, hvis opgaven tog imod klikket. */
    P.klik = function (atom) {
        var o = this.opgave;
        if (!o || o.afsluttet || !o.klik) return false;
        this.klikValgt = atom >= 0 ? atom : -1;
        if (this.fastB.klasse === "skidt") this.saetFast("", "");
        this.vis();
        return true;
    };

    P.kanSendes = function () {
        var o = this.opgave;
        if (!o || o.afsluttet) return false;
        if (o.valg) return this.valgt !== null && this.valgt !== undefined;
        if (o.klik) return this.klikValgt >= 0;
        return o.kan ? !!o.kan(this.sim) : true;
    };

    P.indsendKlik = function () {
        if (!this.opgave) { this.start(); return; }
        var o = this.opgave;
        if (o.afsluttet) { this.videre(); return; }
        if (!this.kanSendes()) { this.blink(); return; }
        var r;
        if (o.valg) {
            if (this.valgt === o.rigtig) { this.loest(); return; }
            this.forkert[this.valgt] = true;
            r = o.fejlValg ? o.fejlValg(this.valgt) : "";
            this.valgt = null;
            this.fejl(r || "Det svar passer ikke. Se på molekylet igen, og vælg et andet svar.");
            return;
        }
        if (o.klik) {
            r = o.klik(this.sim, this.klikValgt);
            if (r === true) { this.loest(); return; }
            this.fejl(typeof r === "string" ? r : "Det atom passer ikke. Vælg et andet atom.");
            return;
        }
        r = o.tjek ? o.tjek(this.sim) : true;
        if (r === true) { this.loest(); return; }
        this.fejl(typeof r === "string" ? r : (o.fejl ? o.fejl(this.sim) : "Det passer ikke endnu. Læs opgaven igen."));
    };

    P.fejl = function (tekst) {
        this.saetFast(tekst, "skidt", "Ikke rigtigt");
        this.peg = true;
        this.vis();
        var st = this.e.status;
        st.classList.remove("ryster");
        void st.offsetWidth;
        st.classList.add("ryster");
    };

    /* Giv et hint > Vis svaret */
    P.hjaelpKlik = function () {
        var o = this.opgave;
        if (!o || o.afsluttet) return;
        this.peg = false;
        if (this.hjaelp === 0 && o.hint) {
            this.hjaelp = 1;
            this.saetFast(o.hint, "hint", "Hint");
            this.vis();
            return;
        }
        this.visSvar();
    };

    P.visSvar = function () {
        var o = this.opgave;
        if (!o || o.afsluttet) return;
        if (o.visSvar) o.visSvar(this.sim);
        o.maade = "svar";
        this.afslut(o);
    };

    P.loest = function () {
        var o = this.opgave;
        if (!o || o.afsluttet) return;
        this.loeste++;
        o.maade = "selv";
        /* Ved et valgspoergsmaal vises svaret ogsaa i billedet bagefter,
           saa eleven kan se, at det passer. */
        if (o.valg && o.visSvar) o.visSvar(this.sim);
        this.afslut(o);
    };

    P.afslut = function (o) {
        o.afsluttet = true;
        this.saetFast("", "");
        this.midl = null;
        this.kaldSlut(o);
        this.vis();
    };

    /* ----- Beskeder ------------------------------------------------------- */
    P.saetFast = function (tekst, klasse, maerke) {
        this.fastB = { tekst: tekst || "", klasse: klasse || "", maerke: maerke || "" };
    };

    /* En kort besked fra scenen (fx vinkelmaaleren) i kortets nederste
       raekke. Den forsvinder efter nogle sekunder, og et hint eller en
       forklaring til et forkert svar kommer frem igen bagefter. */
    P.besked = function (tekst, sek) {
        var mig = this;
        this.midl = { tekst: tekst, klasse: "peger", maerke: "" };
        window.clearTimeout(this._ur);
        this._ur = window.setTimeout(function () { mig.midl = null; mig.vis(); }, (sek || 3) * 1000);
        this.vis();
    };

    /* ----- Kortet ---------------------------------------------------------- */
    P.chip = function () {
        return this.opgave ? "Opgave " + (this.nr + 1) + " af " + this.antal : "Opgaver";
    };

    P.videreTekst = function () {
        if (!this.sidste()) return "Næste opgave →";
        return this.naesteFane ? "Videre til " + this.naesteNavn + " →" : "";
    };

    P.svarHTML = function (o, loest) {
        if (!o.valg) return "";
        var mig = this, vist = o.maade === "svar";
        var lang = o.valg.some(function (t) { return t.length > 14; });
        var n = o.valg.length;
        var kl = "sk-svar n" + n + (lang ? " lang" : "");
        var h = '<div class="' + kl + '">';
        o.valg.forEach(function (t, i) {
            var k = "sk-knap", laast = false;
            if (loest) {
                laast = true;
                k += i === o.rigtig ? (vist ? " svar-vist" : " rigtig") : (mig.forkert[i] ? " forkert" : " dim");
            } else {
                if (mig.valgt === i) k += " valgt";
                if (mig.forkert[i]) { k += " forkert"; laast = true; }
            }
            h += '<button type="button" class="' + k + '" data-nr="' + i + '"' + (laast ? " disabled" : "") + "><span>" + html(t) + "</span></button>";
        });
        return h + "</div>";
    };

    P.vis = function () {
        var o = this.opgave, t = this.tilstand();
        var kl = "scenekort " + (t === "start" ? "opgave" : t === "loest" ? "loest" + (o.maade === "svar" ? " svar" : "") : (o.valg ? "spm" : "opgave"));
        if (this.e.kort.className.replace(" blink", "") !== kl) this.e.kort.className = kl;

        var h = '<p class="sk-tekst"><span class="sk-chip">' + html(this.chip()) + "</span>" +
            papirTekst(o ? o.tekst : this.intro) + "</p>";
        if (o) h += this.svarHTML(o, t === "loest");
        if (t === "loest") {
            var vist = o.maade === "svar", knap = this.videreTekst();
            var forkl = html(o.svar || "");
            if (knap && NK.Papir) {
                h += NK.Papir.bliv(forkl, vist ? "Svaret" : "Rigtigt", html(knap), vist);
            } else {
                h += '<div class="sk-bund bliv ' + (vist ? "svar" : "god") + '"><p class="st-tekst"><span class="b-maerke">' +
                    (vist ? "Svaret" : "Rigtigt") + "</span> " + forkl + "</p></div>";
            }
        }
        if (h !== this._sidstInd) { this.e.ind.innerHTML = h; this._sidstInd = h; }

        /* Den nederste raekke: beskeden, hintknappen og Indsend svar */
        var b = this.midl || this.fastB;
        var harTekst = !!b.tekst;
        this.e.besked.innerHTML = harTekst ? (b.maerke ? '<span class="b-maerke">' + html(b.maerke) + "</span> " : "") + html(b.tekst) : "";
        this.e.besked.hidden = !harTekst;
        var ryster = this.e.status.classList.contains("ryster");
        this.e.status.className = "sk-bund" + (b.klasse ? " " + b.klasse : "") + (harTekst ? "" : " tom") + (ryster ? " ryster" : "");
        this.e.status.hidden = t === "loest" && !harTekst;

        var hj = this.e.hjaelp;
        hj.hidden = t !== "opgave";
        if (t === "opgave") {
            var svar = this.hjaelp > 0 || !o.hint;
            hj.textContent = svar ? "Vis svaret" : "Giv et hint";
            hj.className = "knap hjaelp" + (svar ? " svar" : "") + (this.peg ? " peg" : "");
        }

        var ind = this.e.indsend;
        ind.hidden = t === "loest";
        if (t === "start") {
            ind.textContent = "Start opgave 1";
            ind.className = "knap indsend klar";
            ind.setAttribute("aria-disabled", "false");
        } else if (t === "opgave") {
            var kan = this.kanSendes();
            if (ind.textContent !== "Indsend svar") ind.textContent = "Indsend svar";
            ind.className = "knap indsend " + (kan ? "klar" : "ikke-klar");
            ind.setAttribute("aria-disabled", kan ? "false" : "true");
        }

        var loest = NK.el(this.p + "-opg-loest");
        if (loest) loest.textContent = String(this.loeste);
        var nr = NK.el(this.p + "-opg-nr");
        if (nr) nr.textContent = this.opgave ? (this.nr + 1) + " af " + this.antal : "ikke startet";
    };

    /* Kaldes af fanen hvert billede: Indsend svar skal blive klar, naar
       eleven har bygget noget. */
    P.opdater = function () {
        if (this.tilstand() !== "opgave") return;
        var kan = this.kanSendes();
        if (kan !== this._kan) { this._kan = kan; this.vis(); }
    };

    /* Enter: Indsend svar, Start opgave eller Naeste */
    P.enter = function () {
        var t = this.tilstand();
        if (t === "loest") { if (this.harVidere()) this.videre(); return; }
        this.indsendKlik();
    };
}());
