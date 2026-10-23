/* =====================================================================
   sim_gaet.js - fane 2: gaet polaritet

   Et stof ad gangen paa kortet. Alt, eleven laeser og svarer, staar i
   tekstboksen paa kortet (js/tekstboks.js), ikke i panelet (brugerens
   oenske 23. okt. 2026). Faserne:

     grp     klik paa de polaere grupper (blaa boble; C og H blinker
             graat). Soejlen under formlen stiller C-atomerne op mod de
             fundne grupper. Naar alle er fundet, kommer spoergsmaalet.
             Iod: knappen Ingen polaere grupper.
     pol     er stoffet polaert eller upolaert?
     test    test svaret: traek pipetten ned i det glas, et stof med den
             polaritet blandes med (et klik paa glasset virker ogsaa).
             Et glas, der ikke passer til svaret, giver en forklaring.
     test1   stoffet er i glasset, glasset rystes af sig selv; naar det
             har lagt sig, er svaret afgjort (forsoeget er facit)
     test2   det andet glas testes ogsaa, og formlen viser polaere
             grupper blaa og carbonkaeden gul
     faerdig Naeste stof

   En runde er ti stoffer, fem af hver slags; de seks nye stoffer er
   altid med. Et point for et rigtigt svar uden Vis svaret. Rekorden
   huskes under NOEGLE. Knappen: Giv hint (markerer alle grupper) ->
   Vis svaret -> Naeste stof.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var M = NK.Molekyle;
    var T = NK.Tegn;

    var NOEGLE = "nk-sc3.5-gaet";
    var BESKED_TID = 3;

    function SimGaet() {
        this.L = new NK.Laerred(NK.el("gaet-laerred"));
        this.tid = 0;
        this.lay = null;
        this.g = { kaffekop: { skjult: true, iHaand: false } };
        this.rekord = (NK.hent(NOEGLE, {}) || {}).rekord || 0;
        this.blink = null;
        this.besked = null;
        var mig = this;
        this.tb = new NK.Tekstboks("gaet");
        this.tb.vedKnap = function () { mig.knap(); };

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
        this.visSorteret();
    };

    P.nytStof = function () {
        this.stof = this.runde[this.nr];
        this.mol = M.laes(D.stof(this.stof));
        this.grupper = M.grupper(this.mol);
        this.markeret = {};
        this.fase = "grp";
        this.hjaelp = 0;
        this.visteSvar = false;
        this.svarPol = null;
        this.venter = null;
        this.blink = null;
        this.nytSpm();
        this.nyeGlas();
        this.visPanel();
    };

    P.nytSpm = function () {
        this.spm = { forkert: {}, linje: null };
        this.besked = null;
        this.tb.nulstil();
    };

    P.facit = function () { return D.polId(this.stof); };
    P.facitGlas = function () { return D.stof(this.stof).blandes; };
    P.glasTil = function (polId) { return polId === "polaert" ? "vand" : "heptan"; };

    P.antalMarkeret = function () {
        var mig = this;
        return this.grupper.filter(function (g, k) { return mig.markeret[k]; }).length;
    };

    /* ----- Fasen grp: de polaere grupper ----------------------------------------------- */
    P.grupperFundet = function () {
        this.fase = "pol";
        var linje = this.spm.linje;
        this.nytSpm();
        if (this.hjaelp === 1) this.spm.linje = linje;   /* hintet bliver staaende */
    };

    P.svar = function (id) {
        if (this.slut) return;
        if (this.afvisTilbud) this.afvisTilbud();
        if (this.fase === "grp" && id === "ingen") {
            if (this.grupper.length === 0) { this.grupperFundet(); return; }
            this.spm.forkert.ingen = true;
            this.spm.linje = { html: D.F1.ingenFejl(this.stof), klasse: "skidt" };
            this.besked = null;
            this.tb.ryst();
            return;
        }
        if (this.fase === "pol" || this.fase === "test") {
            this.svarPol = id;
            this.fase = "test";
            this.spm.linje = null;
            this.besked = null;
        }
    };

    /* Den ene knap: Giv hint -> Vis svaret -> Naeste stof */
    P.knap = function () {
        if (this.slut) { this.nyRunde(); return; }
        if (this.fase === "faerdig" || this.fase === "test2") {
            if (this.nr >= this.runde.length - 1) {
                this.slut = true;
                this.nyeGlas();
                this.nytSpm();
                this.visPanel();
                return;
            }
            this.nr++;
            this.nytStof();
            return;
        }
        if (this.fase === "test1") return;
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            var mig = this;
            this.grupper.forEach(function (g, k) { mig.markeret[k] = true; });
            this.spm.linje = { html: "<b>Hint:</b> " + this.hint(), klasse: "hint" };
            this.besked = null;
            if (this.fase === "grp") this.grupperFundet();
            return;
        }
        /* Vis svaret: det rigtige svar, og pipetten testes i det rigtige glas */
        this.visteSvar = true;
        this.svarPol = this.facit();
        this.fase = "test";
        this.testGlas(D.OPL.indexOf(this.facitGlas()));
    };

    P.hint = function () {
        var c = M.antalC(this.mol), n = this.grupper.length;
        if (this.stof === "iod") return "I₂ har ingen polære grupper og intet C. To ens atomer giver en upolær binding.";
        if (n === 0) return "Kun C og H. Der er ingen polære grupper.";
        /* Tommelfingerreglen fra Kemibogen 3.4 */
        return (n === 1 ? "1 polær gruppe og " : n + " polære grupper og ") + c + (c === 1 ? " C-atom" : " C-atomer") +
            ". Der skal 4 C-atomer til at ophæve én polær gruppe.";
    };

    /* ----- Testen: pipetten i et glas ------------------------------------------------- */
    /* Det glas, eleven vil teste i, skal passe til svaret */
    P.testGlas = function (i) {
        if (this.fase !== "test" || !this.svarPol) return false;
        var opl = D.OPL[i], skal = this.glasTil(this.svarPol);
        if (opl !== skal) {
            var pol = this.svarPol === "polaert" ? "polært" : "upolært";
            this.spm.linje = { html: "Du svarede " + pol + ". Et " + pol + " stof blandes med " + skal + ", ikke med " + opl + ".", klasse: "skidt" };
            this.tb.ryst();
            return false;
        }
        if (!this.pipHjemme() && this.pip.tilstand !== "traek") return false;
        this.fase = "test1";
        this.spm.linje = null;
        this.besked = null;
        this.testetI = opl;
        if (this.afvisTilbud) this.afvisTilbud();
        this.sendTil(i);
        this.visPanel();
        return true;
    };

    /* Glasset med svaret har lagt sig: nu er det afgjort */
    P.dom = function () {
        var s = D.stof(this.stof), f = this.facit();
        var rigtigt = this.svarPol === f && !this.visteSvar;
        if (rigtigt) { this.point++; this.stime++; } else { this.stime = 0; }
        var navn = D.Navn(this.stof), pol = D.polaritet(this.stof);
        var verbum = s.tilstand === "fast" ? "opløses ikke i " : "blandes ikke med ";
        var start;
        if (this.visteSvar) start = "Svaret: " + navn + " er " + pol + ".";
        else if (rigtigt) start = "Rigtigt. " + navn + " er " + pol + ".";
        else start = "Nej. " + navn + " " + verbum + this.testetI + ", så det er " + pol + ".";
        this.spm.linje = { html: "<b>" + start + "</b> " + NK.html(s.hvorfor), klasse: this.visteSvar ? "hint" : (rigtigt ? "god" : "skidt") };
        this.domRigtigt = rigtigt;
        this.sorteret.push({ id: this.stof, slags: s.blandes, rigtigt: rigtigt });
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

    P.nulstil = function () { this.nyRunde(); };

    /* ----- Krogene fra bordet -------------------------------------------------- */
    P.maaTraekke = function () { return this.fase === "test" && !this.slut; };
    P.maaTilsaette = function () { return this.fase === "test" && !this.slut; };
    P.slipPaaGlas = function (i) { this.testGlas(i); };

    P.klikGlas = function (i) {
        if (this.slut) return;
        if (this.fase === "test") { this.testGlas(i); return; }
        if (this.fase === "grp" || this.fase === "pol") {
            this.visBesked(this.fase === "grp" ? "Find først de polære grupper i formlen." : "Svar først: er " + D.navn(this.stof) + " polært eller upolært?");
            return;
        }
        if (this.glas[i].portioner > 0) this.glas[i].ryst();
    };

    P.efterTilsaet = function (i) { this.glas[i].ryst(); };

    P.klikProeve = function () {
        if (this.slut) return;
        if (this.fase === "grp") this.visBesked("Find først de polære grupper i formlen.");
        else if (this.fase === "pol") this.visBesked("Svar først: er " + D.navn(this.stof) + " polært eller upolært?");
        else if (this.fase === "test") this.visBesked("Træk " + this.redskabNavn() + " ned i det glas, dit svar passer til.");
    };

    P.redskabNavn = function () { return this.redskab() === "spatel" ? "spatlen" : "pipetten"; };
    P.visBesked = function (html) { this.besked = { html: html, t: BESKED_TID }; };
    P.visTraekPil = function () { return this.nr === 0 && this.fase === "test" && !this.slut; };
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
            if (this.afvisTilbud) this.afvisTilbud();
            if (this.fase === "grp") {
                this.spm.linje = null;
                if (this.antalMarkeret() === this.grupper.length) { this.grupperFundet(); return; }
            }
            this.visBesked(ny ? "<b>" + M.GRUPPENAVN[this.grupper[k].slags] + "</b> er en polær gruppe."
                              : M.GRUPPENAVN[this.grupper[k].slags] + " er allerede markeret.");
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
            if (mig.fase === "test1" && D.OPL[i] === mig.testetI) {
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
        this.visTb();
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
            T.kort(ctx, lay.kort, { navn: "Runden er slut", formel: "" }, {});
            var f = lay.formel;
            NK.tekst(ctx, this.point + " af " + this.runde.length + " rigtige", f.x + f.b / 2, f.y + f.h / 2, {
                justering: "center", linje: "middle", font: T.font("700", 26), farve: T.FARVE.tekst });
            this.plan = null;
            return;
        }
        var intro = this.laererIIntro && this.laererIIntro() && this.introTrin === 2;
        var spoerg = this.fase === "grp" && this.antalMarkeret() === 0;
        var lys = intro || spoerg ? 0.5 + 0.5 * Math.sin(this.tid * 5) : 0;
        T.kort(ctx, lay.kort, s, { lys: lys });
        this.plan = M.plan(this.mol, lay.formel, 46);
        var facit = this.fase === "test2" || this.fase === "faerdig";
        M.tegn(ctx, this.mol, this.plan, {
            grupper: this.grupper, markeret: this.markeret, facit: facit, blink: this.blink
        });
        var fundet = facit ? this.grupper.length : this.antalMarkeret();
        if (lay.soejle) T.soejle(ctx, lay.soejle, M.antalC(this.mol), fundet, this.grupper.length, { alle: facit });
    };

    /* ----- Tekstboksen --------------------------------------------------------------- */
    function glasNavn(opl) { return opl === "vand" ? "vandglasset" : "heptanglasset"; }

    P.visTb = function () {
        var tb = this.tb, spm = this.spm, s = this.stof, mig = this;
        var tekst, linje = "", klasse = "", svar = [], tilstande = {}, laast = false;
        var c = M.antalC(this.mol), n = this.grupper.length;
        if (this.slut) {
            tekst = "Runden er slut: " + this.point + " af " + this.runde.length + " rigtige.";
            linje = "Tryk på Ny runde for ti nye stoffer.";
            tb.tekst(tekst);
            tb.linje(linje, this.point >= 8 ? "god" : "");
            tb.svar([], null);
            tb.knap("Ny runde", "naeste");
            return;
        }
        if (this.fase === "grp") {
            tekst = D.F1.grp(s);
            linje = D.F1.fundet(this.antalMarkeret());
            /* Er soejlen veget for formlen, staar C-atomerne her */
            if (this.lay && !this.lay.soejle) linje = D.Navn(s) + " har " + c + (c === 1 ? " C-atom. " : " C-atomer. ") + linje;
            svar = [{ id: "ingen", tekst: D.F1.ingen }];
            Object.keys(spm.forkert).forEach(function (id) { tilstande[id] = "forkert"; });
        } else {
            tekst = D.F1.pol(s);
            svar = D.POL_SVAR;
            linje = D.Navn(s) + " har " + c + (c === 1 ? " C-atom" : " C-atomer") + " og " +
                (n === 0 ? "ingen polære grupper." : n + (n === 1 ? " polær gruppe." : " polære grupper."));
            if (this.svarPol) {
                var afgjort = this.fase === "test2" || this.fase === "faerdig";
                if (!afgjort) tilstande[this.svarPol] = "valgt";
                else {
                    tilstande[this.facit()] = this.visteSvar ? "valgt" : "rigtig";
                    if (this.svarPol !== this.facit()) tilstande[this.svarPol] = "forkert";
                }
                laast = this.fase !== "test";
            }
            if (this.fase === "test") {
                var pol = this.svarPol === "polaert" ? "polært" : "upolært";
                linje = "Test dit svar: <b>træk " + this.redskabNavn() + " ned i det glas, et " + pol + " stof blandes med.</b>";
                if (this.pip.tilstand === "traek" && this.over >= 0) linje = "Slip, så testes " + D.navn(s) + " i " + glasNavn(D.OPL[this.over]) + ".";
            } else if (this.fase === "test1") {
                linje = "Forsøget: " + D.navn(s) + " i " + glasNavn(this.testetI) + " …";
            }
        }
        if (spm.linje) { linje = spm.linje.html; klasse = spm.linje.klasse; }
        if (this.besked && this.fase !== "test2" && this.fase !== "faerdig") { linje = this.besked.html; klasse = ""; }
        tb.tekst(tekst);
        tb.linje(linje, klasse);
        tb.svar(svar, function (id) { mig.svar(id); });
        tb.svarTilstand(tilstande, laast);
        if (this.fase === "test1") tb.knap(null);
        else if (this.fase === "test2" || this.fase === "faerdig") {
            tb.knap(this.nr >= this.runde.length - 1 ? "Se resultatet" : "Næste stof →", "naeste");
        } else tb.knap(this.hjaelp === 0 ? "Giv hint" : "Vis svaret", this.hjaelp === 0 ? "hjaelp" : "svar");
    };

    /* ----- Panelet: runden og de sorterede stoffer ------------------------------------- */
    P.bygPanel = function () {
        var mig = this;
        NK.el("gaet-spring").addEventListener("click", function () { mig.springIntro(); });
    };

    P.visPanel = function () {
        NK.saetTekst("gaet-point", String(this.point));
        NK.saetTekst("gaet-stime", String(this.stime));
        NK.saetTekst("gaet-rekord", String(this.rekord));
        NK.saetTekst("gaet-nr", String(Math.min(this.nr + 1, this.runde.length)));
        NK.saetTekst("gaet-antal", String(this.runde.length));
        NK.el("gaet-runde").classList.toggle("sejr", this.slut && this.point >= 8);
    };

    /* De sorterede stoffer: polaere og upolaere, med flueben for et rigtigt svar */
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

    /* ----- Tastatur: venstre/hoejre er Polaert/Upolaert eller glasset ---------------- */
    P.tast = function (key) {
        if (key !== "ArrowLeft" && key !== "ArrowRight") return false;
        var i = key === "ArrowLeft" ? 0 : 1;
        if (this.fase === "pol") this.svar(D.POL_SVAR[i].id);
        else if (this.fase === "test") this.testGlas(i);
        return true;
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
