/* =====================================================================
   scenekort.js - papirkortet oeverst midt i scenen (4. nov. 2026)

   Brugerens valg 4. nov. 2026: alle aktive animationer har papirkortet
   (../faelles/papirkort.css og papirkort.js). Opgaven, feltet eller
   svarene, beskeden ved en fejl, hintet, forklaringen og knapperne staar
   paa ét kort oeverst midt i scenen, ikke i panelet og ikke i en linje
   nederst. De tre faner er bygget hver for sig (som sc7.4), saa det,
   kortet kraever, staar her én gang:

     var k = new NK.Scenekort("tit", sim, [176, 150]);
     k.vis({ slags, chip, tekst, efter, bliv })   indholdet (kun naar det aendrer sig)
         slags: "opgave" | "spm" | "loest"
         chip:  etiketten ("Prøve 2", "Trin 1 af 4"), en indlejret overskrift
         tekst: HTML; spoergsmaalet (saetningen med ?) bliver halvfedt
         efter: HTML under teksten (feltet eller svarknapperne)
         bliv:  { tekst, gul, knap } kortet bliver paa spoergsmaalet efter
                svaret: forklaringen og knappen videre, hvor Indsend svar stod
     k.bund(html, klasse)    linjen i kortets nederste raekke (skidt, gul, god, peger)
     k.knapper(hint, peg, indsend)
         hint: knappens tekst eller null (skjult); peg: lyser stille op
         indsend: null (skjult), false (graa) eller true (klar)
     k.blink()               ét bloedt gult blink (et klik i scenen foer tid)
     k.zone()                hoejden, der er sat af oeverst i scenen: fast,
                             saa intet flytter sig, naar kortet skifter

   Sim'en faar kaldene: kortValg(j) (et svar paa kortet), indsend() (knappen
   Indsend svar og Enter i feltet), kortInput() (der skrives i feltet),
   videre() (den groenne knap) og knap() (Giv hint og Vis svaret).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    function papir(html) { return NK.Papir ? NK.Papir.tekst(html) : html; }

    function Scenekort(px, sim, zone) {
        var mig = this;
        this.px = px;
        this.sim = sim;
        this.basis = zone || [170, 146];
        this.e = {
            kort: NK.el(px + "-skort"),
            ind: NK.el(px + "-ind"),
            status: NK.el(px + "-status"),
            besked: NK.el(px + "-besked"),
            knap: NK.el(px + "-knap"),
            indsend: NK.el(px + "-indsend")
        };
        this.sidst = null;
        this.bundSidst = null;
        this.blivNu = false;
        this.e.knap.addEventListener("click", function () { sim.knap(); });
        this.e.indsend.addEventListener("click", function () { if (sim.indsend) sim.indsend(); });
        this.e.kort.addEventListener("click", function (ev) {
            var t = ev.target;
            if (!t || !t.closest) return;
            if (t.closest("[data-videre]")) { if (sim.videre) sim.videre(); return; }
            var v = t.closest("[data-valg]");
            if (v && !v.disabled && sim.kortValg) sim.kortValg(parseInt(v.getAttribute("data-valg"), 10));
        });
        this.e.kort.addEventListener("keydown", function (ev) {
            if (ev.key === "Enter" && ev.target && ev.target.tagName === "INPUT") {
                ev.preventDefault();
                if (sim.indsend) sim.indsend();
            }
        });
        this.e.kort.addEventListener("input", function () { if (sim.kortInput) sim.kortInput(); });
    }

    var P = Scenekort.prototype;

    P.vis = function (d) {
        var html = '<p class="sk-tekst">' + (d.chip ? '<span class="sk-chip">' + NK.html(d.chip) + "</span>" : "") +
            papir(d.tekst || "") + "</p>" + (d.efter || "");
        if (d.bliv) html += NK.Papir.bliv(d.bliv.tekst, d.bliv.gul ? "Svaret" : "Rigtigt", NK.html(d.bliv.knap), d.bliv.gul);
        var kl = "scenekort " + d.slags + (d.bliv ? " loest bliv" : "") + (d.bliv && d.bliv.gul ? " svar" : "");
        if (this.e.kort.className.replace(" blink", "") !== kl) this.e.kort.className = kl + (this.e.kort.classList.contains("blink") ? " blink" : "");
        this.blivNu = !!d.bliv;
        if (html !== this.sidst) {
            this.e.ind.innerHTML = html;
            this.sidst = html;
        }
        this.visBund();
    };

    /* Kortets nederste raekke. Naar kortet bliver paa spoergsmaalet, er
       raekken vaek, medmindre et klik i scenen lige har faaet et svar. */
    P.bund = function (html, klasse) {
        this.nu = { html: html || "", klasse: klasse || "" };
        this.visBund();
    };

    P.visBund = function () {
        var b = this.nu || { html: "", klasse: "" }, st = this.e.status;
        var harTekst = !!b.html;
        var noegle = b.html + "|" + b.klasse;
        if (noegle !== this.bundSidst) {
            this.e.besked.innerHTML = b.html;
            this.bundSidst = noegle;
            if (b.klasse === "skidt") {
                st.classList.remove("ryster");
                void st.offsetWidth;
                st.classList.add("ryster");
            }
        }
        this.e.besked.hidden = !harTekst;
        var knapper = !this.e.knap.hidden || !this.e.indsend.hidden;
        st.hidden = (this.blivNu && !harTekst) || (!harTekst && !knapper);
        var kl = "sk-bund" + (b.klasse ? " " + b.klasse : "") + (harTekst ? "" : " tom");
        if (st.className.replace(" ryster", "") !== kl) st.className = kl + (st.classList.contains("ryster") ? " ryster" : "");
    };

    P.knapper = function (hint, peg, indsend) {
        var k = this.e.knap, s = this.e.indsend;
        k.hidden = !hint || this.blivNu;
        if (hint) {
            if (k.textContent !== hint) k.textContent = hint;
            k.className = "knap hjaelp" + (hint === "Vis svaret" ? " svar" : "") + (peg ? " peg" : "");
        }
        s.hidden = indsend === null || indsend === undefined || this.blivNu;
        s.classList.toggle("klar", indsend === true);
        s.classList.toggle("ikke-klar", indsend !== true);
        s.setAttribute("aria-disabled", indsend === true ? "false" : "true");
        this.visBund();
    };

    P.blink = function () {
        var e = this.e.kort;
        e.classList.remove("blink");
        void e.offsetWidth;
        e.classList.add("blink");
    };

    /* Pladsen oeverst i scenen: almindelig skaerm og lav skaerm (hoejst 720 px) */
    P.zone = function () { return this.basis[window.innerHeight <= 720 ? 1 : 0]; };

    P.input = function () { return this.e.ind.querySelector("input"); };

    /* Feltet paa kortet: "V(AgNO₃) = [ ] mL". status: aktiv, ok eller svar */
    Scenekort.felt = function (id, pre, efter, status, vaerdi, pladsholder, aria, tekst) {
        if (status === "ok" || status === "svar") {
            return '<div class="sk-felt"><div class="felt ' + status + '"><span class="felt-pre">' + pre + '</span><span class="felt-svar"><b>' +
                vaerdi + "</b>" + (efter ? " " + efter : "") + '</span><span class="felt-maerke">' + (status === "ok" ? "✓" : "↩") + "</span></div></div>";
        }
        return '<div class="sk-felt"><div class="felt aktiv' + (tekst ? " formelfelt" : "") + '"><span class="felt-pre">' + pre + "</span>" +
            '<input id="' + id + '" type="text" inputmode="' + (tekst ? "text" : "decimal") + '" autocomplete="off" spellcheck="false" aria-label="' +
            NK.html(aria) + '" placeholder="' + NK.html(pladsholder) + '">' + (efter ? '<span class="felt-efter">' + efter + "</span>" : "") + "</div></div>";
    };

    /* Svarknapperne paa kortet. s: [{ t, valgt, rigtig, forkert, dim }], laast: alle laast */
    Scenekort.svar = function (s, laast) {
        var h = '<div class="sk-svar n' + s.length + '">';
        s.forEach(function (x, j) {
            var kl = (x.valgt ? " valgt" : "") + (x.rigtig ? " rigtig" : "") + (x.forkert ? " forkert" : "") + (x.dim ? " dim" : "");
            h += '<button type="button" class="sk-knap' + kl + '" data-valg="' + j + '"' + (laast ? " disabled" : "") + ">" + NK.html(x.t) + "</button>";
        });
        return h + "</div>";
    };

    NK.Scenekort = Scenekort;
}());
