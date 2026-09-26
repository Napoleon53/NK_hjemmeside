/* =====================================================================
   sim_gaet.js - fane 2: gaet polaritet

   Den gamle c3.5: et molekyle paa kortet, eleven klikker paa de polaere
   grupper (de faar en blaa boble), og soejlen under formlen stiller
   C-atomerne op mod de polaere grupper, eleven har fundet. Saa gaetter
   eleven: blandes stoffet med vand eller heptan? Svaret gives ved at
   traekke pipetten ned i det glas (eller med knapperne i panelet).

   Forsoeget er facit: stoffet kommer i det valgte glas, glasset rystes,
   og naar det har lagt sig, er svaret klart. Derefter testes det andet
   glas ogsaa. En runde er ti stoffer, fem af hver slags; de seks nye
   stoffer er altid med. Rekorden huskes under NOEGLE.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var M = NK.Molekyle;
    var T = NK.Tegn;

    var NOEGLE = "nk-sc3.5-gaet";

    var OPL_NAVN = { vand: "vand", heptan: "heptan" };

    function SimGaet() {
        this.L = new NK.Laerred(NK.el("gaet-laerred"));
        this.tid = 0;
        this.lay = null;
        this.g = { kaffekop: { skjult: true, iHaand: false } };
        this.rekord = (NK.hent(NOEGLE, {}) || {}).rekord || 0;
        this.blink = null;
        this.besked = null;

        this.bordStart();
        this.bygPanel();
        this.bygTilbud();
        if (this.laererStart) this.laererStart();
        this.nyRunde();
    }

    var P = SimGaet.prototype;
    NK.Bord.kobl(P, { prefix: "gaet", soejle: true });

    /* ----- Runden ------------------------------------------------------------ */
    P.nyRunde = function () {
        var mig = this;
        var runde = [];
        ["vand", "heptan"].forEach(function (slags) {
            var nye = D.GAET_NYE.filter(function (id) { return D.stof(id).blandes === slags; });
            var gamle = NK.bland(D.FORSOEG.filter(function (id) { return D.stof(id).blandes === slags; }));
            runde = runde.concat(nye, gamle.slice(0, D.RUNDE_PR_SLAGS - nye.length));
        });
        this.runde = NK.bland(runde);
        this.nr = 0;
        this.point = 0;
        this.stime = 0;
        this.slut = false;
        this.sorteret = [];
        this.nytStof();
        mig.visSorteret();
    };

    P.nytStof = function () {
        this.stof = this.runde[this.nr];
        this.mol = M.laes(D.stof(this.stof));
        this.grupper = M.grupper(this.mol);
        this.markeret = {};
        this.svar = null;
        this.fase = "gaet";
        this.hjaelp = 0;
        this.visteSvar = false;
        this.venter = null;
        this.blink = null;
        this.besked = null;
        this.nyeGlas();
        this.skrivBesked("", "");
        this.visPanel();
    };

    P.facit = function () { return D.stof(this.stof).blandes; };

    P.antalMarkeret = function () {
        var mig = this;
        return this.grupper.filter(function (g, k) { return mig.markeret[k]; }).length;
    };

    /* Svaret: vand eller heptan. Forsoeget i det valgte glas afgoer det. */
    P.vaelg = function (opl) {
        if (this.slut || this.svar || this.fase !== "gaet") return false;
        if (!this.pipHjemme() && this.pip.tilstand !== "traek") return false;
        this.svar = opl;
        this.fase = "test1";
        if (this.afvisTilbud) this.afvisTilbud();
        this.sendTil(D.OPL.indexOf(opl));
        this.visPanel();
        return true;
    };

    /* Glasset med det valgte har lagt sig: nu er svaret klart */
    P.dom = function () {
        var s = D.stof(this.stof), f = this.facit();
        var rigtigt = this.svar === f && !this.visteSvar;
        if (rigtigt) { this.point++; this.stime++; } else { this.stime = 0; }
        var navn = s.navn.charAt(0).toUpperCase() + s.navn.slice(1);
        var start;
        if (this.visteSvar) start = "Svaret: " + s.navn + " blandes med " + OPL_NAVN[f] + ".";
        else if (rigtigt) start = "Rigtigt. " + navn + " blandes med " + OPL_NAVN[f] + ".";
        else start = "Nej. " + navn + " blandes ikke med " + OPL_NAVN[this.svar] + ", men med " + OPL_NAVN[f] + ".";
        var fejl = "";
        if (!rigtigt && !this.visteSvar) {
            fejl = f === "heptan" ? " Carbonkæden fylder for meget i forhold til de polære grupper."
                                  : " Der er mange polære grupper i forhold til C-atomerne.";
            if (this.stof === "iod") fejl = "";
        }
        this.skrivBesked("<b>" + start + "</b>" + fejl + " " + NK.html(s.hvorfor),
            this.visteSvar ? "gul" : (rigtigt ? "god" : "skidt"));
        this.sorteret.push({ id: this.stof, slags: f, rigtigt: rigtigt });
        this.visSorteret();
        if (this.nr === this.runde.length - 1) this.afslut();
    };

    P.afslut = function () {
        var ny = this.point > this.rekord;
        if (ny) {
            this.rekord = this.point;
            NK.gem(NOEGLE, { rekord: this.rekord });
        }
        this.slutVent = { t: 3.2, rekord: ny && this.point > 0 };
    };

    P.knap = function () {
        if (this.slut) { this.nyRunde(); return; }
        if (this.fase === "test2" || this.fase === "faerdig") {
            if (this.nr >= this.runde.length - 1) {
                this.slut = true;
                this.nyeGlas();
                this.skrivBesked("<b>Runden er slut: " + this.point + " af " + this.runde.length + " rigtige.</b>",
                    this.point >= 8 ? "god" : "");
                this.visPanel();
                return;
            }
            this.nr++;
            this.nytStof();
            return;
        }
        if (this.fase !== "gaet") return;
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            var mig = this;
            this.grupper.forEach(function (g, k) { mig.markeret[k] = true; });
            this.skrivBesked("<b>Hint:</b> " + this.hint(), "gul");
            this.visPanel();
        } else {
            this.visteSvar = true;
            this.vaelg(this.facit());
        }
    };

    P.hint = function () {
        var c = M.antalC(this.mol), n = this.grupper.length;
        if (this.stof === "iod") return "I₂ har ingen polære grupper og intet C. To ens atomer giver en upolær binding.";
        if (n === 0) return "Kun C og H. Der er ingen polære grupper.";
        return "De polære grupper er markeret: " + n + " til " + c + (c === 1 ? " C-atom" : " C-atomer") +
            ". Mange polære grupper pr. C-atom trækker mod vand. En lang carbonkæde trækker mod heptan.";
    };

    P.nulstil = function () { this.nyRunde(); };

    /* ----- Krogene fra bordet -------------------------------------------------- */
    P.maaTraekke = function () { return this.fase === "gaet" && !this.slut; };
    P.maaTilsaette = function () { return this.fase === "gaet" && !this.slut; };
    P.slipPaaGlas = function (i) { this.vaelg(D.OPL[i]); };

    P.klikGlas = function (i) {
        if (this.fase === "gaet" && !this.slut) this.vaelg(D.OPL[i]);
        else if (this.glas[i].portioner > 0) this.glas[i].ryst();
    };

    P.efterTilsaet = function (i) { this.glas[i].ryst(); };

    P.klikProeve = function () {
        if (this.fase === "gaet" && !this.slut) this.visBesked("Træk " + this.redskabNavn() + " ned i det glas, stoffet blandes med.");
    };

    P.redskabNavn = function () { return this.redskab() === "spatel" ? "spatlen" : "pipetten"; };
    P.visBesked = function (html) { this.besked = { html: html, t: 3 }; };
    P.visTraekPil = function () { return this.nr === 0 && this.fase === "gaet" && !this.slut; };
    P.maalGlas = function () { return -1; };

    /* Klik paa kortet: en polaer gruppe faar sin boble, C og H blinker graat */
    P.klikKort = function (pt) {
        if (this.slut || !this.plan) return;
        var a = M.atomVed(this.mol, this.plan, pt.x, pt.y);
        if (a < 0) return;
        var mig = this, k = -1;
        this.grupper.forEach(function (g, j) { if (g.atomer.indexOf(a) >= 0) k = j; });
        if (k >= 0) {
            var ny = !this.markeret[k];
            this.markeret[k] = true;
            var navn = M.GRUPPENAVN[this.grupper[k].slags];
            this.visBesked(ny ? "<b>" + navn + "</b> er en polær gruppe." + (this.antalMarkeret() === this.grupper.length ? " Nu har du dem alle." : "")
                              : navn + " er allerede markeret.");
            if (this.afvisTilbud && this.antalMarkeret() === this.grupper.length) this.afvisTilbud();
        } else {
            this.blink = { atom: a, t: 1 };
            var el = this.mol.atomer[a].el;
            this.visBesked(el === "I" ? "I₂ har to ens atomer. Bindingen er upolær."
                                      : (el === "C" ? "C-atomet hører til carbonkæden. Den er upolær." : "H på et C-atom er upolært."));
        }
        mig.visPanel();
    };

    P.kortMarkoer = function (pt) {
        if (!this.plan || this.slut) return "default";
        return M.atomVed(this.mol, this.plan, pt.x, pt.y) >= 0 ? "pointer" : "default";
    };

    /* ----- Tegneloekken ---------------------------------------------------------- */
    P.opdater = function (dt) {
        this.tid += dt;
        this.bordOpdater(dt);
        var mig = this;
        this.glas.forEach(function (g, i) {
            if (!g.nyt) return;
            g.nyt = false;
            if (mig.fase === "test1" && D.OPL[i] === mig.svar) {
                mig.fase = "test2";
                mig.dom();
                mig.venter = { t: 0.3, i: 1 - i };
                mig.visPanel();
            } else if (mig.fase === "test2") {
                mig.fase = "faerdig";
                mig.visPanel();
            }
        });
        if (this.venter) {
            this.venter.t -= dt;
            if (this.venter.t <= 0 && this.pipHjemme()) {
                this.sendTil(this.venter.i);
                this.venter = null;
            }
        }
        if (this.blink) {
            this.blink.t -= dt * 1.4;
            if (this.blink.t <= 0) this.blink = null;
        }
        if (this.besked) {
            this.besked.t -= dt;
            if (this.besked.t <= 0) this.besked = null;
        }
        if (this.slutVent) {
            this.slutVent.t -= dt;
            if (this.slutVent.t <= 0 && this.laererSlut) {
                var sv = this.slutVent;
                this.slutVent = null;
                this.laererSlut(this.point, sv.rekord);
            }
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

    /* Kortet med formlen og soejlen */
    P.tegnKortet = function (ctx) {
        var lay = this.lay, s = D.stof(this.stof);
        if (this.slut) {
            T.kort(ctx, lay.kort, null, {});
            var r = lay.kort;
            NK.tekst(ctx, "Runden er slut", r.x + r.b / 2, r.y + r.h / 2 - 8, {
                justering: "center", font: T.font("700", 22), farve: T.FARVE.tekst });
            NK.tekst(ctx, this.point + " af " + this.runde.length + " rigtige", r.x + r.b / 2, r.y + r.h / 2 + 22, {
                justering: "center", font: T.font("600", 17), farve: T.FARVE.graa });
            this.plan = null;
            return;
        }
        var lys = this.laererIIntro && this.laererIIntro() && this.introTrin === 2 ? 0.5 + 0.5 * Math.sin(this.tid * 6) : 0;
        var felt = T.kort(ctx, lay.kort, s, { bund: 44, lys: lys });
        this.plan = M.plan(this.mol, felt, 46);
        var facit = this.fase === "test2" || this.fase === "faerdig";
        M.tegn(ctx, this.mol, this.plan, {
            grupper: this.grupper, markeret: this.markeret, facit: facit, blink: this.blink
        });
        var sr = { x: lay.kort.x + 16, y: lay.kort.y + lay.kort.h - 44, b: lay.kort.b - 32, h: 34 };
        var fundet = facit ? this.grupper.length : this.antalMarkeret();
        T.soejle(ctx, sr, M.antalC(this.mol), fundet, this.grupper.length, { alle: facit });
    };

    /* ----- Linjen under scenen --------------------------------------------------------- */
    function glasNavn(opl) { return opl === "vand" ? "vandglasset" : "heptanglasset"; }

    P.statusTekst = function () {
        if (this.slut) return "Runden er slut. <b>Ny runde</b> starter til højre.";
        if (this.besked) return this.besked.html;
        var s = D.stof(this.stof);
        if (this.pip.tilstand === "traek") {
            return this.over >= 0 ? "Slip, så testes " + s.navn + " i " + glasNavn(D.OPL[this.over]) + "."
                                  : "Hen over det glas, " + s.navn + " blandes med.";
        }
        if (this.fase === "gaet") {
            var start = this.antalMarkeret() === 0 && this.grupper.length > 0 ? "Klik på de polære grupper i formlen. Træk så " : "<b>Træk</b> ";
            return start + this.redskabNavn() + " ned i det glas, " + s.navn + " blandes med.";
        }
        if (this.fase === "test1") return "Forsøget: " + s.navn + " i " + glasNavn(this.svar) + " …";
        if (this.fase === "test2") return "Og så i " + glasNavn(this.svar === "vand" ? "heptan" : "vand") + " …";
        return this.nr >= this.runde.length - 1 ? "Se resultatet til højre." : "<b>Næste stof</b> til højre, eller Enter.";
    };

    P.visStatus = function () { NK.saetHTML("gaet-status", this.statusTekst()); };

    /* ----- Panelet ------------------------------------------------------------------------ */
    P.bygPanel = function () {
        var mig = this;
        this.el = {
            knap: NK.el("gaet-knap"),
            besked: NK.el("gaet-besked"),
            valg: document.querySelectorAll("#gaet-valg .valgknap")
        };
        this.el.knap.addEventListener("click", function () { mig.knap(); });
        Array.prototype.forEach.call(this.el.valg, function (k) {
            k.addEventListener("click", function () { mig.vaelg(k.getAttribute("data-svar")); });
        });
        NK.el("gaet-spring").addEventListener("click", function () { mig.springIntro(); });
    };

    P.skrivBesked = function (html, klasse) {
        this.el.besked.innerHTML = html;
        this.el.besked.className = "besked" + (klasse ? " " + klasse : "");
    };

    P.visPanel = function () {
        var mig = this, f = this.stof ? this.facit() : null;
        NK.saetTekst("gaet-point", String(this.point));
        NK.saetTekst("gaet-stime", String(this.stime));
        NK.saetTekst("gaet-rekord", String(this.rekord));
        NK.saetTekst("gaet-nr", String(Math.min(this.nr + 1, this.runde.length)));
        NK.saetTekst("gaet-antal", String(this.runde.length));
        var afgjort = this.fase === "test2" || this.fase === "faerdig";
        Array.prototype.forEach.call(this.el.valg, function (k) {
            var s = k.getAttribute("data-svar");
            k.disabled = mig.fase !== "gaet" || mig.slut;
            k.classList.toggle("valgt", !!mig.svar && s === mig.svar && !afgjort);
            k.classList.toggle("rigtig", afgjort && s === f);
            k.classList.toggle("forkert", afgjort && s === mig.svar && s !== f);
        });
        var tekst, klasse = "knap";
        if (this.slut) { tekst = "Ny runde"; klasse = "knap blaa banker"; }
        else if (afgjort) { tekst = this.nr >= this.runde.length - 1 ? "Se resultatet" : "Næste stof →"; klasse = "knap blaa banker"; }
        else if (this.fase === "test1") { tekst = "Forsøget kører …"; }
        else tekst = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
        this.el.knap.textContent = tekst;
        this.el.knap.className = klasse;
        this.el.knap.disabled = this.fase === "test1";
        NK.el("gaet-kort").classList.toggle("sejr", this.slut && this.point >= 8);
    };

    /* De sorterede stoffer i to spalter: det, eleven har faaet ret i, med flueben */
    P.visSorteret = function () {
        var mig = this;
        ["vand", "heptan"].forEach(function (slags) {
            var ul = NK.el("gaet-liste-" + slags);
            var html = mig.sorteret.filter(function (x) { return x.slags === slags; }).map(function (x) {
                return "<li class=\"" + (x.rigtigt ? "ja" : "nej") + "\">" + (x.rigtigt ? "✓ " : "✗ ") + NK.html(D.stof(x.id).navn) + "</li>";
            }).join("");
            ul.innerHTML = html || "<li class=\"tom\">ingen endnu</li>";
        });
    };

    /* ----- Tastatur -------------------------------------------------------------------- */
    P.tast = function (key) {
        if (key === "ArrowLeft") { this.vaelg("vand"); return true; }
        if (key === "ArrowRight") { this.vaelg("heptan"); return true; }
        return false;
    };

    P.enter = function () {
        if (this.slut || this.fase === "test2" || this.fase === "faerdig") this.knap();
    };

    P.fokus = function () {};

    /* ----- Kemichaels praesentation ----------------------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc3.5-intro-gaet", tilbud: "gaet-tilbud", spring: "gaet-spring" });

    P.pegPaaFelt = function () {};

    NK.SimGaet = SimGaet;
}());
