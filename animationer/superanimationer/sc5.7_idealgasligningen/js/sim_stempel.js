/* =====================================================================
   sim_stempel.js - fane 1: stemplet

   En gas i en cylinder med et stempel, der glider frit eller er laast.
   Eleven skruer paa én ting ad gangen, og alt sker paa apparaterne i
   scenen (21. nov. 2026, brugeren: ingen input i hoejre bjaelke):
   temperaturen (− og + paa varmepladen, 20 K pr. klik), lodderne (klik
   paa et lod paa hylden eller paa stemplet, eller traek det), gassen (klik
   paa flasken, eller luk ud ved den roede hane) og laasen (knappen Lås
   stemplet / Lås op under skiltet med volumen). Manometeret viser trykket
   i gassen, skalaen paa glasset volumen, skiltet i gassen stofmaengden,
   skiltet under hylden trykket udefra og displayet temperaturen.

   Opgaverne er forudsigelser: eleven vaelger foerst, hvad der sker, og
   proever det saa. Modellen afgoer svaret, og et forkert gaet faar en
   forklaring, ikke en afvisning.

   Papirkortet (6. nov. 2026, js/kort.js): spoergsmaalet, svarene, linjen
   med naeste skridt, hint og Indsend svar staar paa kortet oeverst i
   scenen. Et svar vaelger kun; Indsend svar sender det. Foer svaret er
   sendt, er forsoeget laast i opgaver med et forsoeg (et klik faar
   kortet til at blinke). Efter svaret bliver kortet paa spoergsmaalet
   med forklaringen og Naeste. Start opgaven forfra staar i panelet.

   Trinvis start (21. nov. 2026, som sb2.6): opgave 1 begynder med to
   spoergsmaal (o.trin i js/data.js) i fasen "trin". Kun cylinderen er
   fremme; manometeret kommer efter trin 1 og varmepladen efter trin 2. Saa kommer forudsigelsen som trin 3, og
   resten af opgaven er som foer. Grafen og lodderne kommer med opgave 2,
   gassen (flasken, hanen og n) med opgave 3 og laaseknappen med opgave 4 (D.VIS_FRA og naaet, den
   hoejeste opgave, eleven har vaeret paa). Er opgave 1 loest foer, er der
   ingen trin; Start opgaven forfra paa opgave 1 giver trinene igen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var G = NK.Gas;
    var Tg = NK.Tegn;
    var S = D.STEMPEL;
    var MAAL = NK.Sprites.MAAL;

    var NOEGLE = "nk-sc5.6-stempel";

    /* Trykket paa fane 1 med tre decimaler, som luftens 1,013 bar */
    function pTekst(p) { return p.toFixed(3).replace(".", ",") + " bar"; }
    function tal(m, v) { return m === "p" ? pTekst(v) : G.fmt(m, v); }
    var STILLE = 0.7;            /* sekunder uden aendringer, foer et forsoeg aflaeses */

    function SimStempel() {
        this.navn = "stempel";
        this.L = new NK.Laerred(NK.el("stempel-laerred"));
        this.g = new G.Stempel();
        this.part = new G.Partikler();
        this.Vvist = this.g.V;
        this.spor = [];
        this.sporT = 0;
        this.tid = 0;
        this.stille = 10;
        this.lay = null;
        this.over = null;
        this.mus = null;
        this.traek = null;
        this.flyv = [];
        this.auto = null;
        this.ventil = 0;
        this.haneAaben = 0;
        this.fast = { html: "", klasse: "" };
        this.kortT = 0;
        this.aeg224 = false;
        this.stopVist = false;
        this.opgaver = D.FORUDSIG;
        var gemt = NK.hent(NOEGLE, {}) || {};
        this.status = this.opgaver.map(function (o) {
            var s = gemt[o.id];
            return { loest: !!(s && s.l), stjerne: !!(s && s.s) };
        });
        this.rostAlt = !!gemt._rost;
        this.trin = null;
        this.naaet = this.naaetFraStatus();
        this.bygPanel();
        this.koblMus();
        var i = this.naesteUloeste(-1);
        this.vaelg(i >= 0 ? i : 0);
    }

    var P = SimStempel.prototype;

    /* ======================================================================
       PANELET: kun opgavelisten og Start opgaven forfra (21. nov. 2026).
       Alt, eleven goer ved gassen, sker paa apparaterne i scenen.
       ====================================================================== */
    P.bygPanel = function () {
        var mig = this;
        this.kort = new NK.SceneKort("stempel", {
            valg: function (j) { mig.vaelgKortSvar(parseInt(j, 10)); },
            hint: function () { mig.knap(); },
            indsend: function () { mig.indsend(); },
            videre: function () { mig.videre(); }
        });
        this.el = {
            kort: NK.el("stempel-skort"), knap: NK.el("stempel-knap"), besked: NK.el("stempel-besked"),
            indsend: NK.el("stempel-indsend"), prikker: NK.el("stempel-prikker")
        };
        NK.el("stempel-forfra").addEventListener("click", function () { mig.nulstil(); });
        /* Opgaveraekken oeverst i scenen: én knap pr. opgave med nummer og tema
           (runde 3, 21. nov. 2026). De kommende er laaste numre (visPrikker). */
        this.el.prikker.innerHTML = "";
        this.opgaver.forEach(function (o, i) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "or-knap";
            b.innerHTML = '<span class="or-nr"></span><span class="or-navn"></span>';
            b.addEventListener("click", function () { if (mig.aaben(i)) mig.vaelg(i); });
            mig.el.prikker.appendChild(b);
        });
    };

    /* ======================================================================
       HANDLINGERNE (fra apparaterne i scenen)
       ====================================================================== */
    P.saetT = function (T, kilde) {
        var foer = this.g.T;
        if (!this.g.saetT(T)) {
            if (kilde === "knap") this.kortBesked(T > foer ? D.SCENE.tMaks : D.SCENE.tMin);
            return false;
        }
        this.efter("T");
        return true;
    };

    P.lod = function (d, kilde) {
        var k = this.g.lodder + d;
        if (k > S.LOD_MAKS) { this.kortBesked(D.SCENE.lodMaks); return false; }
        if (k < 0) { this.kortBesked(D.SCENE.lodMin); return false; }
        this.g.saetLodder(k);
        if (kilde !== "traek" && this.lay) this.flyvLod(d);
        this.efter("lod");
        var t = (d > 0 ? "Et lod mere. " : "Et lod af. ") + "Trykket udefra er " + G.fmt("p", this.g.pYdre()) + ".";
        if (this.g.laast) t += " " + D.SCENE.lodLaast;
        this.kortBesked(t);
        return true;
    };

    P.gas = function (d) {
        var n = this.g.n + d * S.N_TRIN;
        if (n > S.N_MAKS + 1e-9) { this.kortBesked(D.SCENE.nMaks); return false; }
        if (n < S.N_MIN - 1e-9) { this.kortBesked(D.SCENE.nMin); return false; }
        this.g.saetN(n);
        if (d > 0) this.ventil = 0.8; else this.haneAaben = 0.8;
        this.efter("n");
        this.kortBesked(d > 0 ? "0,25 mol gas mere. Nu er der " + NK.tal2(this.g.n) + " mol." :
            "0,25 mol gas ud. Nu er der " + NK.tal2(this.g.n) + " mol.");
        return true;
    };

    P.laas = function (b) {
        if (!this.g.saetLaast(b)) return false;
        this.efter("laas");
        this.kortBesked(b ? D.SCENE.laast : D.SCENE.frit);
        return true;
    };

    /* Efter hver aendring: molekylerne, stoppet og paaskeaegget */
    P.efter = function () {
        this.stille = 0;
        this.justerMolekyler(true);
        if (this.g.stop && !this.stopVist) {
            this.stopVist = true;
            this.kortBesked(D.SCENE.stop, 5);
        }
        if (!this.g.stop) this.stopVist = false;
        var g = this.g;
        if (!this.aeg224 && Math.abs(g.n - 1) < 1e-9 && g.T === 273 && g.lodder === 0 && !g.laast) {
            this.aeg224 = true;
            this.ventAeg = 1.2;
        }
        /* Linjen i kortet foelger med: fx "Lås det igen", naar laasen er aabnet */
        if (this.fase === "proev") this.naesteLinje();
    };

    P.justerMolekyler = function (vedIndgang) {
        this.part.antal(Math.round(this.g.n * S.PR_MOL), vedIndgang ? this.indgang() : null);
    };

    /* Hvor gassen kommer ind og ud: nederst til hoejre i cylinderen */
    P.indgang = function () {
        if (!this.lay) return null;
        var ind = Tg.indre(this.lay.cyl);
        return { x: ind.b - 10, y: 6 };
    };

    /* ======================================================================
       OPGAVERNE
       ====================================================================== */
    P.naesteUloeste = function (fra) {
        var n = this.status.length;
        for (var d = 1; d <= n; d++) {
            var i = (fra + d + n) % n;
            if (!this.status[i].loest) return i;
        }
        return -1;
    };

    P.antalLoest = function () {
        return this.status.filter(function (s) { return s.loest; }).length;
    };

    P.gem = function () {
        var ud = {}, mig = this;
        this.opgaver.forEach(function (o, i) {
            var s = mig.status[i];
            if (s.loest) ud[o.id] = { l: 1, s: s.stjerne ? 1 : 0 };
        });
        if (this.rostAlt) ud._rost = 1;
        NK.gem(NOEGLE, ud);
    };

    /* forfra: trinene igen, ogsaa naar opgaven er loest (Start opgaven forfra) */
    P.vaelg = function (i, forfra) {
        this.nr = i;
        this.naaet = Math.max(this.naaet, i);
        var o = this.opgaver[i];
        this.kortT = 0;
        this.kort.note("");
        this.trin = o.trin && (forfra || !this.status[i].loest) ? { k: 0, forkert: {}, rigtig: -1, vist: false } : null;
        this.fase = this.trin ? "trin" : "valg";
        this.valgt = -1;
        this.hjaelp = 0;
        this.brugtSvar = false;
        this.auto = null;
        this.base = null;
        this.anvendStart(o);
        this.visDele();
        this.bygValg();
        this.visKort();
        this.visPrikker();
        this.naesteLinje();
    };

    /* ======================================================================
       DET, DER ER FREMME (trinvis start, 21. nov. 2026)
       ====================================================================== */
    /* Den hoejeste opgave, eleven har vaeret paa, ud fra det gemte */
    P.naaetFraStatus = function () {
        var n = 0;
        this.status.forEach(function (s, i) { if (s.loest) n = Math.max(n, i); });
        return n;
    };

    /* Det aktuelle trin i opgave 1 (null uden for trinene og i trin 3) */
    P.trinDel = function () {
        var o = this.opg();
        return this.trin && this.fase === "trin" && o.trin ? o.trin[this.trin.k] : null;
    };

    P.trinSvaret = function () { return !!this.trin && this.fase === "trin" && this.trin.rigtig >= 0; };

    /* Er delen fremme? mano og plade kommer med trinene i opgave 1, graf,
       hylde, gas og laas med den opgave, de hoerer til (D.VIS_FRA) */
    P.fremme = function (del) {
        if (D.VIS_FRA[del] !== undefined) return this.naaet >= D.VIS_FRA[del];
        if (!this.trin || this.naaet >= 1) return true;
        var trin = this.opg().trin || [], t = this.trin;
        for (var k = 0; k < trin.length; k++) {
            var loest = this.fase !== "trin" || k < t.k || (k === t.k && t.rigtig >= 0);
            if (trin[k].vis === del) return loest;
        }
        return true;
    };

    /* Rundvisningens ankre foelger med (scenen tegnes hver gang forfra) */
    P.visDele = function () {
        if (this.lay) this.ankre();
    };

    P.anvendStart = function (o) {
        this.g.saet(o.start);
        this.stopVist = this.g.stop;
        this.stille = 0;
        this.justerMolekyler(false);
        this.spor = [];
    };

    /* Er gassen stillet anderledes end opgavens start? */
    P.afviger = function (o) {
        var s = o.start, g = this.g;
        if (Math.abs(g.n - s.n) > 1e-9 || g.T !== s.T || g.lodder !== (s.lodder || 0) || g.laast !== !!s.laast) return true;
        if (s.laast && s.V && Math.abs(g.V - s.V) > 1e-6) return true;
        return false;
    };

    P.opg = function () { return this.opgaver[this.nr]; };

    /* Er forsoeget laast? Kun i opgaver med et forsoeg, foer svaret er sendt */
    P.laastNu = function () {
        var o = this.opg();
        if (this.fase === "trin") return true;
        return this.fase === "valg" && !!(o && o.handling);
    };

    /* Etiketten: Trin 2 af 3 i opgave 1's trin, ellers Opgave 2 af 7 */
    P.chip = function (i, k) {
        if (i === undefined) i = this.nr;
        var o = this.opgaver[i], tema = smal() ? " · " + o.tema : "";
        if (k === undefined && this.trin && o.trin && i === this.nr) k = this.fase === "trin" ? this.trin.k : o.trin.length;
        if (k !== undefined && k !== null && o.trin) return "Trin " + (k + 1) + " af " + (o.trin.length + 1) + tema;
        return "Opgave " + (i + 1) + " af " + this.opgaver.length + tema;
    };

    /* Kortet i et trin: spoergsmaalet og svarene. Et forkert svar bliver
       roedt og kan ikke vaelges igen; efter det rigtige bliver kortet paa
       spoergsmaalet med forklaringen og Naeste spoergsmaal. */
    P.bygTrin = function () {
        var mig = this, d = this.trinDel(), t = this.trin;
        var svar = d.valg.map(function (v, j) {
            var r = { j: j, t: NK.html(v.t), valgt: j === mig.valgt && t.rigtig < 0, rigtig: false, forkert: !!t.forkert[j],
                svarVist: false, dim: false, laast: !!t.forkert[j] };
            if (t.rigtig >= 0) {
                if (j === t.rigtig) { if (t.vist) r.svarVist = true; else r.rigtig = true; }
                else if (!t.forkert[j]) r.dim = true;
            }
            return r;
        });
        this.kort.vis({ kl: "spm", chip: this.chip(), tekst: NK.html(d.spm), svar: svar, laast: t.rigtig >= 0 });
    };

    /* Kortet: spoergsmaalet og svarene (vaelg kun) */
    P.bygValg = function () {
        var mig = this, o = this.opg();
        if (this.fase === "trin") { this.bygTrin(); return; }
        var lang = o.valg.some(function (v) { return v.t.length > 24; });
        var svar = o.valg.map(function (v, j) {
            var r = {
                j: j, t: NK.html(v.t), valgt: j === mig.valgt && mig.fase !== "faerdig",
                rigtig: mig.fase === "faerdig" && j === mig.valgt && !!v.ok,
                forkert: mig.fase === "faerdig" && j === mig.valgt && !v.ok,
                svarVist: false, dim: false
            };
            if (mig.fase === "faerdig" && v.ok && j !== mig.valgt) r.rigtig = true;
            if (mig.fase === "faerdig" && v.ok && mig.brugtSvar) { r.rigtig = false; r.svarVist = true; }
            if (mig.fase === "proev" && j !== mig.valgt) r.dim = true;
            return r;
        });
        this.kort.vis({
            kl: "spm" + (lang ? " lange" : ""),
            chip: this.chip(),
            tekst: NK.html(o.spm),
            svar: svar,
            laast: this.fase !== "valg"
        });
        var k = this.el.kort.querySelector(".sk-svar");
        if (k && lang) k.classList.add("lange");
    };

    P.visKort = function () {
        this.bygValg();
        this.visKnap();
    };

    /* Giv hint / Vis svaret og Indsend svar */
    P.visKnap = function () {
        if (this.fase === "faerdig" || this.trinSvaret()) { this.kort.knapper({ hint: null, indsend: false }); return; }
        if (this.fase === "trin") {
            /* Hinttrappen i et trin: tre hint, saa Vis svaret */
            var n = this.trinDel().hint.length;
            this.kort.knapper({
                hint: this.hjaelp === 0 ? "Giv hint" : (this.hjaelp < n ? "Næste hint" : "Vis svaret"),
                peg: this.el.knap.classList.contains("peg"),
                indsend: true,
                klar: this.valgt >= 0
            });
            this.el.knap.disabled = false;
            return;
        }
        this.kort.knapper({
            hint: this.hjaelp === 0 ? "Giv hint" : "Vis svaret",
            peg: this.el.knap.classList.contains("peg"),
            indsend: this.fase === "valg",
            klar: this.valgt >= 0
        });
        this.el.knap.disabled = !!this.auto;
    };

    /* Er opgaven aaben i raekken? De loeste, den, eleven er ved, og dem, eleven
       har naaet. De kommende er laaste numre uden tema (brugeren 21. nov. 2026,
       CLAUDE.md: titlerne kun paa de loeste og den, eleven er ved). Vis svaret
       taeller som loest. */
    P.aaben = function (i) {
        return i === this.nr || this.status[i].loest || i <= this.naaet;
    };

    P.visPrikker = function () {
        var mig = this, knapper = this.el.prikker.querySelectorAll(".or-knap");
        this.status.forEach(function (s, i) {
            var b = knapper[i], o = mig.opgaver[i], aaben = mig.aaben(i);
            b.classList.toggle("valgt", i === mig.nr);
            b.classList.toggle("loest", s.loest);
            b.classList.toggle("laast", !aaben);
            b.disabled = !aaben;
            b.querySelector(".or-nr").textContent = s.stjerne ? "★" : (s.loest ? "✓" : String(i + 1));
            b.querySelector(".or-navn").textContent = aaben ? o.tema : "";
            b.title = aaben ? (i + 1) + ". " + o.tema : "Opgave " + (i + 1) + " kommer, når du når dertil";
            b.setAttribute("aria-label", aaben ? "Opgave " + (i + 1) + ": " + o.tema : "Opgave " + (i + 1) + ", ikke åben endnu");
        });
    };

    /* Under 1200 px staar kun numrene i raekken; saa staar temaet paa kortet */
    function smal() { return !!(window.matchMedia && window.matchMedia("(max-width: 1199px)").matches); }

    /* Linjen i papirkortet: det naeste skridt */
    P.trinLinje = function () {
        var o = this.opg();
        if (this.fase === "trin") return "";
        if (this.fase === "valg") {
            return o.handling ? "Vælg det, du tror, der sker. Så prøver du det." :
                "Vælg det svar, du tror er rigtigt. Skru gerne op og ned for varmen først.";
        }
        if (this.fase === "proev") {
            if (o.krav && o.krav.laast !== undefined && this.g.laast !== o.krav.laast) {
                return o.krav.laast ? "Opgaven gælder et låst stempel. Lås det igen." : "Opgaven gælder et frit stempel. Lås det op igen.";
            }
            return o.proev;
        }
        return "";
    };

    P.naesteLinje = function (foer, slags) {
        this.besked((foer ? foer + " " : "") + this.trinLinje(), slags || "");
    };

    /* Et klik paa et svar vaelger det kun */
    P.vaelgKortSvar = function (j) {
        if (this.fase === "trin") {
            if (this.trinSvaret() || this.trin.forkert[j]) return;
        } else if (this.fase !== "valg") return;
        this.valgt = j;
        this.bygValg();
        this.visKnap();
    };

    /* Indsend svar (og Enter): det valgte svar sendes */
    P.indsend = function () {
        if (this.fase === "trin") { this.indsendTrin(); return; }
        if (this.fase !== "valg") return;
        if (this.valgt < 0) { this.kort.blink(); return; }
        this.vaelgSvar(this.valgt, false);
    };

    /* ----- Trinene i opgave 1 ---------------------------------------------------------- */
    P.indsendTrin = function () {
        if (this.trinSvaret()) return;
        if (this.valgt < 0) { this.kort.blink(); return; }
        var d = this.trinDel(), j = this.valgt, v = d.valg[j];
        this.valgt = -1;
        if (v.ok) { this.trinLoest(j, false); return; }
        /* Et forkert svar: roedt, sin egen forklaring, og hintknappen lyser op */
        this.trin.forkert[j] = true;
        this.bygValg();
        this.besked(NK.html(v.svar), "skidt");
    };

    /* Det rigtige svar (eller Vis svaret): delen kommer frem, og kortet bliver
       paa spoergsmaalet med forklaringen og Naeste spoergsmaal */
    P.trinLoest = function (j, vist) {
        var d = this.trinDel();
        this.trin.rigtig = j;
        this.trin.vist = vist;
        if (vist) this.brugtSvar = true;
        this.hjaelp = 0;
        this.visDele();
        this.besked("", "");
        this.visKort();
        /* Maerket faar sit punktum af papirkort.css (.b-maerke::after) */
        this.kort.bliv(NK.html(d.godt), vist ? "Svaret" : "Rigtigt", "Næste spørgsmål", vist ? "svar" : "god");
    };

    /* Naeste spoergsmaal: naeste trin, eller forudsigelsen (trin 3) */
    P.naesteTrin = function () {
        var o = this.opg();
        this.trin.k++;
        this.trin.forkert = {};
        this.trin.rigtig = -1;
        this.trin.vist = false;
        this.valgt = -1;
        this.hjaelp = 0;
        if (this.trin.k >= o.trin.length) this.fase = "valg";
        this.kort.bliv(null);
        this.visDele();
        this.visKort();
        this.naesteLinje();
    };

    /* Knappen paa kortet efter svaret: naeste opgave eller fane 2 */
    P.videre = function () {
        if (this.trinSvaret()) { this.naesteTrin(); return; }
        if (this.fase !== "faerdig") return;
        var i = this.naesteUloeste(this.nr);
        if (i >= 0) this.vaelg(i);
        else if (NK.visFane) NK.visFane("fane-regn");
    };

    P.vaelgSvar = function (j, vist) {
        if (this.fase !== "valg") return;
        var o = this.opg();
        this.valgt = j;
        if (vist) this.brugtSvar = true;
        this.hjaelp = 0;
        if (!o.handling) {
            this.afslut(!!o.valg[j].ok, "");
            return;
        }
        if (this.afviger(o)) this.anvendStart(o);
        this.base = this.g.kopi();
        this.fase = "proev";
        this.bygValg();
        this.visKort();
        this.naesteLinje();
        if (vist) this.startAuto();
    };

    /* Er det, eleven skulle goere, gjort? */
    P.udfoert = function (o) {
        var g = this.g, b = this.base;
        switch (o.handling) {
            case "varm": return g.T >= b.T + 30;
            case "lod": return g.lodder >= b.lodder + 1;
            case "dobbeltN": return g.n >= 2 * b.n - 1e-9;
            case "udN": return g.n <= b.n - S.N_TRIN + 1e-9;
            case "maal":
                var m = o.maalTilstand;
                return Math.abs(g.n - m.n) < 1e-9 && Math.abs(g.T - m.T) < 0.5 && g.lodder === m.lodder && g.laast === m.laast;
        }
        return false;
    };

    /* Aendrede eleven andet end det, opgaven handler om? */
    P.andetAendret = function (o) {
        var g = this.g, b = this.base;
        if (o.handling === "maal") return "";
        if (o.handling !== "varm" && g.T !== b.T) return "temperaturen";
        if (o.handling !== "lod" && g.lodder !== b.lodder) return "lodderne";
        if (o.handling !== "dobbeltN" && o.handling !== "udN" && Math.abs(g.n - b.n) > 1e-9) return "stofmængden";
        if (g.laast !== b.laast) return "låsen";
        if (b.laast && Math.abs(g.V - b.V) > 1e-6) return "|Stemplet flyttede sig, mens det var åbent. Prøv igen med låst stempel.";
        if (o.handling === "lod" && g.lodder !== b.lodder + 1) return "|Læg kun ét lod på.";
        if (o.handling === "dobbeltN" && Math.abs(g.n - 2 * b.n) > 1e-9) return "|Stop ved " + NK.tal2(2 * b.n) + " mol.";
        if (o.handling === "udN" && Math.abs(g.n - (b.n - S.N_TRIN)) > 1e-9) return "|Luk kun 0,25 mol ud.";
        return "";
    };

    P.tjekForsoeg = function () {
        var o = this.opg();
        if (this.fase !== "proev" || !this.base) return;
        if (o.krav && o.krav.laast !== undefined && this.g.laast !== o.krav.laast) return;
        if (!this.udfoert(o)) return;
        var sat = Math.abs(this.Vvist - this.g.V) < 0.01 * Math.max(1, this.g.V);
        if (!sat || this.stille < STILLE || this.auto) return;
        var andet = this.andetAendret(o);
        if (andet) {
            var t = andet.charAt(0) === "|" ? andet.slice(1) : "Du ændrede også " + andet + ". Skru kun på én ting ad gangen.";
            this.anvendStart(o);
            this.base = this.g.kopi();
            this.besked(t + " " + o.proev, "skidt");
            return;
        }
        this.afslut(!!o.valg[this.valgt].ok, this.resultat(o));
    };

    /* Det, modellen viste, som en saetning */
    P.resultat = function (o) {
        var b = this.base, e = this.g.kopi();
        if (o.handling === "maal") {
            return G.fmt("n", e.n).replace("mol", "mol gas") + " fylder " + G.fmt("V", e.V) + " ved 20 °C og 1,013 bar.";
        }
        var m = o.maal, a = b[m], z = e[m];
        var navn = m === "V" ? "Volumenet" : "Trykket";
        var r = z / a, t;
        if (Math.abs(r - 1) < 0.005) t = navn + " er det samme: " + tal(m, z) + ".";
        else t = navn + (r > 1 ? " steg" : " faldt") + " fra " + tal(m, a) + " til " + tal(m, z) + ".";
        if (o.forventet.forhold === 0.5 && Math.abs(r - 0.5) < 0.05) t += " Det er næsten det halve.";
        if (o.forventet.forhold === 2 && Math.abs(r - 2) < 0.05) t += " Det er det dobbelte.";
        return t;
    };

    P.afslut = function (ok, res) {
        var o = this.opg(), v = o.valg[this.valgt];
        var s = this.status[this.nr];
        this.fase = "faerdig";
        this.auto = null;
        s.loest = true;
        s.stjerne = s.stjerne || (ok && !this.brugtSvar);
        var alle = this.antalLoest() === this.opgaver.length;
        /* Uden punktum: papirkort.css saetter det (foer stod der "Rigtigt..") */
        var maerke = ok ? (this.brugtSvar ? "Svaret" : "Rigtigt") : "";
        var tekst = (ok ? "" : "Du gættede: " + v.t.charAt(0).toLowerCase() + v.t.slice(1) + ". ") +
            (res ? res + " " : "") + (!ok && v.svar ? v.svar + " " + o.hvorfor : o.hvorfor);
        if (alle && !this.rostAlt) { this.rostAlt = true; tekst += " " + D.FAERDIG.stempel; }
        this.gem();
        this.besked("", "");
        this.kortT = 0;
        this.kort.note("");
        this.visKort();
        this.visPrikker();
        var naeste = this.naesteUloeste(this.nr) >= 0 ? "Næste opgave" : "Videre til Beregningen";
        this.kort.bliv(NK.html(tekst), maerke, naeste, ok ? (this.brugtSvar ? "svar" : "god") : "nej");
    };

    /* ----- Knappen: Giv hint -> Vis svaret -> Naeste opgave ---------------------------- */
    P.knap = function () {
        if (this.fase === "faerdig" || this.trinSvaret()) { this.videre(); return; }
        if (this.auto) return;
        var o = this.opg();
        if (this.fase === "trin") {
            /* Hinttrappen: Hint 1 af 3, 2 af 3, 3 af 3, saa Vis svaret */
            var d = this.trinDel(), n = d.hint.length;
            if (this.hjaelp < n) {
                this.hjaelp++;
                this.besked("<b>Hint " + this.hjaelp + " af " + n + ":</b> " + NK.html(d.hint[this.hjaelp - 1]), "gul");
                this.visKnap();
                return;
            }
            var rigtig = 0;
            d.valg.forEach(function (v, j) { if (v.ok) rigtig = j; });
            this.trinLoest(rigtig, true);
            return;
        }
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.hjaelpVis("<b>Hint:</b> " + NK.html(this.fase === "valg" ? o.hint : o.proevHint));
            this.visKnap();
            return;
        }
        this.brugtSvar = true;
        if (this.fase === "valg") {
            var rigtig = 0;
            o.valg.forEach(function (v, j) { if (v.ok) rigtig = j; });
            this.svarVis(NK.html(o.valg[rigtig].t) + ".");
            this.vaelgSvar(rigtig, true);
        } else {
            if (this.afviger(o) && !this.udfoert(o)) { this.anvendStart(o); this.base = this.g.kopi(); }
            this.startAuto();
        }
        this.visKnap();
    };

    /* Vis svaret i proeve-fasen: forsoeget koerer af sig selv */
    P.startAuto = function () {
        var o = this.opg();
        if (!o.handling) return;
        this.auto = { slags: o.handling, t: 0, trin: 0 };
        this.hjaelp = 0;
        this.visKnap();
    };

    P.koerAuto = function (dt) {
        var a = this.auto, g = this.g, b = this.base;
        if (!a) return;
        a.t += dt;
        if (a.slags === "varm") {
            this.saetT(b.T + Math.min(100, a.t / 1.4 * 100), "auto");
            if (a.t >= 1.4) this.auto = null;
        } else if (a.slags === "lod") {
            if (a.t > 0.2) { this.lod(1, "auto"); this.auto = null; }
        } else if (a.slags === "udN") {
            if (a.t > 0.2) { this.gas(-1); this.auto = null; }
        } else if (a.slags === "dobbeltN") {
            if (a.t > 0.35 * (a.trin + 1)) {
                a.trin++;
                if (g.n < 2 * b.n - 1e-9) this.gas(1);
                else this.auto = null;
            }
        } else if (a.slags === "maal") {
            if (a.t > 0.35 * (a.trin + 1)) {
                a.trin++;
                var m = this.opg().maalTilstand;
                if (g.laast !== m.laast) this.laas(m.laast);
                else if (g.T !== m.T) this.saetT(m.T, "auto");
                else if (g.n < m.n - 1e-9) this.gas(1);
                else if (g.n > m.n + 1e-9) this.gas(-1);
                else if (g.lodder > m.lodder) this.lod(-1, "auto");
                else this.auto = null;
            }
        }
        if (!this.auto) this.visKnap();
    };

    /* ----- Linjen i papirkortet (som i sc5.5) ----------------------------------------------
       Efter et forkert svar lyser hintknappen stille op, til linjen skifter igen. */
    P.besked = function (html, klasse) {
        this.fast = { html: html || "", klasse: klasse || "" };
        /* En rigtig besked (fejl, hint, ros) fjerner den korte besked fra scenen */
        if (klasse) { this.kortT = 0; this.kort.note(""); }
        this.el.knap.classList.toggle("peg", klasse === "skidt" && this.fase !== "faerdig" && this.hjaelp === 0);
        this.visBesked(this.fast);
    };

    /* En kort besked fra scenen: under teksten paa kortet i nogle sekunder */
    P.kortBesked = function (html, sek) {
        this.kortT = sek || 4;
        this.kort.note(html);
    };

    P.visBesked = function (b) {
        this.kort.besked(b.html, b.klasse);
        if (this.fase !== "faerdig" && !this.trinSvaret()) this.kort.bliv(null);
        this.visKnap();
    };

    /* Teksten, kortet viser nu: den korte besked, forklaringen eller linjen */
    P.beskedTekst = function () {
        var n = NK.el("stempel-note");
        if (n && !n.hidden) return n.textContent.replace(/\u00a0/g, " ");
        if (this.kort.blivAaben()) return this.kort.blivTekst();
        return this.kort.beskedTekst();
    };

    /* Hint og svar: i linjen i kortet, naar eleven beder om det */
    /* Under forsoeget staar naeste skridt efter hintet; foer svaret staar spoergsmaalet over det */
    P.hjaelpVis = function (html) { this.besked(html + (this.fase === "proev" ? " " + this.trinLinje() : ""), "gul"); };

    P.svarVis = function (html) { this.besked("<b>Svar:</b> " + html, "gul"); };

    P.fokus = function () { };
    P.enter = function () {
        if (this.fase === "faerdig" || this.trinSvaret()) this.videre();
        else if ((this.fase === "valg" || this.fase === "trin") && this.valgt >= 0) this.indsend();
    };
    /* Start opgaven forfra. Paa opgave 1 kommer trinene igen, og scenen er
       tom som foerste gang: delene kommer frem igen trin for trin og opgave
       for opgave. */
    P.nulstil = function () {
        if (this.opg() && this.opg().trin) this.naaet = 0;
        this.vaelg(this.nr, true);
    };

    /* ======================================================================
       LAYOUT
       ====================================================================== */
    /* Runde 3 (21. nov. 2026): scenen lægges kun om, naar vinduet faar en ny
       stoerrelse (eller skriften er hentet), aldrig fordi kortet skifter. Kortets
       plads er det hoejeste kort i fanen (maalKort), saa scenen hverken zoomer,
       naar der kommer gas ind, eller hopper, naar opgaven skifter. */
    P.tilpas = function () {
        var skrift = document.fonts ? document.fonts.status : "loaded";
        var ny = this.L.tilpas();
        if (ny || !this.lay || !this.kortMaalt || skrift !== this.skrift) {
            this.skrift = skrift;
            this.kortMaalt = this.kort.maal(this.kortTilstande());
            if (this.kortMaalt) this.bygValg();
            this.layout();
        }
    };

    /* Alle de kort, fanen kan vise: hver opgave med spoergsmaalet, linjen, det
       laengste hint, forsoeget med den laengste korte besked fra scenen og den
       laengste forklaring; trinene med hint, forkerte svar og forklaringen. */
    P.kortTilstande = function () {
        var mig = this, ud = [];
        function svarListe(valg, laast) {
            return valg.map(function (v, j) { return { j: j, t: NK.html(v.t), laast: laast }; });
        }
        function laengst(l) { return l.reduce(function (a, b) { return String(b).length > String(a).length ? b : a; }, ""); }
        var noter = Object.keys(D.SCENE).map(function (k) { return D.SCENE[k]; });
        noter.push("Et lod mere. Trykket udefra er 4,013 bar. " + D.SCENE.lodLaast);
        noter.push(D.SCENE.manometer + " Nu: 4,013 bar.");
        var note = laengst(noter);
        var res = "Volumenet faldt fra 24,0 L til 12,1 L. Det er næsten det halve.";
        this.opgaver.forEach(function (o, i) {
            var lang = o.valg.some(function (v) { return v.t.length > 24; });
            var d = { kl: "spm" + (lang ? " lange" : ""), chip: mig.chip(i, o.trin ? o.trin.length : null), tekst: NK.html(o.spm), svar: svarListe(o.valg, false) };
            var dl = { kl: d.kl, chip: d.chip, tekst: d.tekst, svar: svarListe(o.valg, true), laast: true };
            var linje = o.handling ? "Vælg det, du tror, der sker. Så prøver du det." : "Vælg det svar, du tror er rigtigt. Skru gerne op og ned for varmen først.";
            ud.push({ d: d, besked: linje, hint: "Giv hint", indsend: true });
            ud.push({ d: d, besked: "<b>Hint:</b> " + NK.html(o.hint), klasse: "gul", hint: "Vis svaret", indsend: true });
            if (o.handling) {
                ud.push({ d: dl, besked: "<b>Hint:</b> " + NK.html(o.proevHint) + " " + NK.html(o.proev), klasse: "gul", hint: "Vis svaret", note: NK.html(note) });
                ud.push({ d: dl, besked: "Du ændrede også temperaturen. Skru kun på én ting ad gangen. " + NK.html(o.proev), klasse: "skidt", hint: "Giv hint", note: NK.html(note) });
            }
            var forkl = laengst(o.valg.filter(function (v) { return !v.ok; }).map(function (v) {
                /* Rosen for alle syv (D.FAERDIG) kommer kun én gang og er ikke regnet med */
                return "Du gættede: " + v.t.toLowerCase() + ". " + (o.handling ? res + " " : "") + (v.svar ? v.svar + " " : "") + o.hvorfor;
            }));
            ud.push({ d: dl, bliv: { tekst: NK.html(forkl), maerke: "", knap: "Videre til Beregningen", slags: "nej" } });
            (o.trin || []).forEach(function (t, k) {
                var dt = { kl: "spm", chip: mig.chip(i, k), tekst: NK.html(t.spm), svar: svarListe(t.valg, false) };
                var tl = t.valg.filter(function (v) { return !v.ok; }).map(function (v) { return v.svar; });
                ud.push({ d: dt, besked: "<b>Hint 3 af 3:</b> " + NK.html(laengst(t.hint)), klasse: "gul", hint: "Næste hint", indsend: true });
                ud.push({ d: dt, besked: NK.html(laengst(tl)), klasse: "skidt", hint: "Giv hint", indsend: true });
                ud.push({ d: { kl: "spm", chip: dt.chip, tekst: dt.tekst, svar: svarListe(t.valg, true), laast: true },
                    bliv: { tekst: NK.html(t.godt), maerke: "Rigtigt", knap: "Næste spørgsmål", slags: "god" } });
            });
        });
        return ud;
    };

    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var gammel = this.lay;
        var lay = { W: W, H: H };
        /* Papirkortet har pladsen oeverst (D.ZONE: almindelig og lav skaerm) */
        var top = this.kort.zone(D.ZONE.stempel, this.kortMaalt || undefined);
        lay.top = top;
        /* Bordet staar nederst i scenen: forkanten gaar helt ned til bunden */
        lay.bordY = Math.round(H - NK.klamp((H - top) * 0.05, 12, 34));
        var arbH = lay.bordY - top;
        var cylB = Math.round(NK.klamp(Math.min(W * 0.2, arbH * 0.42), 104, 230));
        var cx = Math.round(W * 0.46);
        var lodB = Math.round(NK.klamp(cylB * 0.45, 48, 96));
        var lodH = lodB * MAAL.lod.h / MAAL.lod.b;
        var stempelH = Math.round(NK.klamp(cylB * 0.08, 10, 18));
        /* Varmepladen under cylinderen */
        var pb = cylB + 56;
        var ph = pb * MAAL.varmeplade.h / MAAL.varmeplade.b;
        lay.plade = { x: cx - pb / 2, y: lay.bordY - ph, b: pb };
        var bund = 12;
        var gulv = lay.plade.y + 2 - bund;           /* cylinderens indre bund */
        var loft = top + stempelH + S.LOD_MAKS * (lodH - 1) + 8;
        lay.cyl = { x: cx - cylB / 2, y: loft, b: cylB, h: gulv - loft, vaeg: 6, bund: bund };
        lay.lodB = lodB;
        lay.lodH = lodH;
        lay.stempelH = stempelH;
        lay.pxPrL = (lay.cyl.h) / S.V_MAKS;
        lay.roerY = gulv + bund * 0.5;
        /* Manometeret til venstre med roeret ind i foden */
        var r = Math.round(NK.klamp(cylB * 0.33, 32, 62));
        var k = r / MAAL.manometer.r;
        var mx = lay.cyl.x - 8 - NK.klamp(W * 0.05, 22, 60) - r * 1.25;
        mx = Math.max(r * 1.3 + 8, mx);
        lay.mano = { cx: mx, cy: lay.roerY - (MAAL.manometer.bund - MAAL.manometer.cy) * k, r: r };
        /* Hoejre for cylinderen: skiltet med volumen og laaseknappen under det
           (de foelger stemplet), hylden og gasflasken. Hylden staar saa langt
           ude, at laaseknappen kan komme forbi den. */
        var cx2 = this.L.ctx;
        cx2.save();
        cx2.font = Tg.LAAS_FONT;
        lay.laasB = Math.ceil(cx2.measureText("Lås stemplet").width) + 42;
        cx2.restore();
        lay.laasH = 28;
        var hx = lay.cyl.x + cylB + 14 + Math.max(NK.klamp(W * 0.11, 70, 112), lay.laasB + 10);
        var fh = Math.round(NK.klamp(arbH * 0.36, 100, 210));
        var fb = fh * MAAL.gasflaske.b / MAAL.gasflaske.h;
        var fx = Math.min(W - 14 - fb, hx + lodB + 16 + NK.klamp(W * 0.04, 16, 50));
        lay.flaske = { x: fx, y: lay.bordY - fh, h: fh, b: fb };
        lay.hylde = { x: Math.min(hx, fx - lodB - 22), y: Math.round(lay.cyl.y + lay.cyl.h * 0.34), b: lodB + 16 };
        lay.hane = { x: lay.cyl.x + cylB + 8 + NK.klamp(W * 0.03, 16, 30), y: lay.roerY, r: NK.klamp(cylB * 0.045, 6, 9) };
        /* Grafen oeverst til venstre, over manometeret, hvis der er plads */
        var msG = Tg.manometerStr(lay.mano);
        var gb = Math.min(lay.cyl.x - 30 - 14, 330), gh = Math.min(msG.y - 44 - top - 4, 240);
        lay.graf = gb >= 150 && gh >= 110 ? { x: 14, y: top + 4, b: gb, h: gh } : null;
        /* Er der ikke plads over manometeret (kortets plads er fast fra runde 3),
           staar grafen til venstre for manometeret i stedet */
        if (!lay.graf) {
            var gb2 = Math.min(msG.x - 14 - 14, 330), gh2 = Math.min(lay.bordY - 10 - top - 4, 240);
            if (gb2 >= 150 && gh2 >= 110) lay.graf = { x: 14, y: top + 4, b: gb2, h: gh2 };
        }
        this.lay = lay;
        if (gammel && gammel.cyl) {
            var gi = Tg.indre(gammel.cyl), ni = Tg.indre(lay.cyl);
            this.part.skaler(ni.b / gi.b, lay.pxPrL / gammel.pxPrL);
        } else {
            this.part.fyld(Math.round(this.g.n * S.PR_MOL), Tg.indre(lay.cyl).b, this.Vvist * lay.pxPrL);
        }
        lay.pladeH = ph;
        this.ankre();
    };

    /* Ankrene til rundvisningen (kun det, der er fremme) */
    P.ankre = function () {
        var lay = this.lay, c = lay.cyl, mig = this;
        function anker(id, del, x, y, b, h) {
            if (del && !mig.fremme(del)) mig.saetAnker(id, 0, 0, 0, 0);
            else mig.saetAnker(id, x, y, b, h);
        }
        anker("cylinder", null, c.x - 4, c.y - 4, c.b + 8, c.h + 8);
        var ms = Tg.manometerStr(lay.mano);
        anker("manometer", "mano", ms.x, ms.y - 30, ms.b, ms.h + 30);
        anker("plade", "plade", lay.plade.x, lay.plade.y, lay.plade.b, lay.pladeH);
        anker("flaske", "gas", lay.flaske.x, lay.flaske.y, lay.flaske.b, lay.flaske.h);
        anker("hylde", "hylde", lay.hylde.x, lay.hylde.y - S.LOD_MAKS * lay.lodH - 6, lay.hylde.b, S.LOD_MAKS * lay.lodH + 30);
        var lk = this.laasKnap();
        anker("laas", "laas", lk.x - 4, lk.y - 4, lk.b + 8, lk.h + 8);
        if (lay.graf) anker("graf", "graf", lay.graf.x, lay.graf.y, lay.graf.b, lay.graf.h);
        else this.saetAnker("graf", 0, 0, 0, 0);
    };

    P.saetAnker = function (id, x, y, b, h) {
        var e = NK.el("stempel-anker-" + id);
        if (!e) return;
        e.style.display = b > 0 ? "" : "none";
        e.style.left = Math.round(x) + "px";
        e.style.top = Math.round(y) + "px";
        e.style.width = Math.round(Math.max(1, b)) + "px";
        e.style.height = Math.round(Math.max(1, h)) + "px";
    };

    /* Stemplets underside og loddernes plads */
    P.stempelY = function () {
        var ind = Tg.indre(this.lay.cyl);
        return ind.bund - this.Vvist * this.lay.pxPrL;
    };

    P.lodPaaStempel = function (i) {
        var lay = this.lay, ind = Tg.indre(lay.cyl);
        return { x: ind.x + ind.b / 2 - lay.lodB / 2, y: this.stempelY() - lay.stempelH - (i + 1) * (lay.lodH - 1) };
    };

    /* Laaseknappen under skiltet med volumen; staar stemplet saa lavt, at den
       ville ramme hanen, staar den over skiltet i stedet */
    P.laasKnap = function () {
        var lay = this.lay, c = lay.cyl;
        var midt = this.stempelY() - lay.stempelH / 2, y = midt + 17;
        if (y + lay.laasH > lay.roerY - lay.hane.r * 2.4 - 6) y = midt - 17 - lay.laasH;
        return { x: c.x + c.b + 14, y: y, b: lay.laasB, h: lay.laasH };
    };

    /* Midten af en ting i scenen (til selvtesten og rundvisningen) */
    P.punkt = function (u) {
        var lay = this.lay, ls = this.lodTal(), st = Tg.pladeStr(lay.plade);
        switch (u) {
            case "hylde": var h = this.lodPaaHylde(Math.max(0, ls.hylde - 1)); return { x: h.x + lay.lodB / 2, y: h.y + lay.lodH / 2 };
            case "stempelLod": var o = this.lodPaaStempel(Math.max(0, ls.stempel - 1)); return { x: o.x + lay.lodB / 2, y: o.y + lay.lodH / 2 };
            case "varm": return { x: st.varm.x, y: st.varm.y };
            case "koel": return { x: st.koel.x, y: st.koel.y };
            case "flaske": return { x: lay.flaske.x + lay.flaske.b / 2, y: lay.flaske.y + lay.flaske.h / 2 };
            case "hane": return { x: lay.hane.x, y: lay.hane.y };
            case "manometer": return { x: lay.mano.cx, y: lay.mano.cy };
            case "laasKnap": var k = this.laasKnap(); return { x: k.x + k.b / 2, y: k.y + k.h / 2 };
            case "gas": var ind = Tg.indre(lay.cyl); return { x: ind.x + ind.b / 2, y: (this.stempelY() + ind.bund) / 2 };
        }
        return null;
    };

    P.lodPaaHylde = function (i) {
        var lay = this.lay;
        return { x: lay.hylde.x + lay.hylde.b / 2 - lay.lodB / 2, y: lay.hylde.y - (i + 1) * (lay.lodH - 1) };
    };

    /* Et lod flyver mellem hylden og stemplet */
    P.flyvLod = function (d) {
        var fra, til;
        var paaHylde = S.LOD_MAKS - this.g.lodder;
        if (d > 0) { fra = this.lodPaaHylde(paaHylde); til = this.lodPaaStempel(this.g.lodder - 1); }
        else { fra = this.lodPaaStempel(this.g.lodder); til = this.lodPaaHylde(paaHylde - 1); }
        this.flyv.push({ fra: fra, til: til, t: 0, op: d > 0 });
    };

    /* ======================================================================
       MUSEN: klik, hover og traek af lodder
       ====================================================================== */
    /* Det, der ikke er fremme endnu, kan hverken klikkes eller give et vink */
    var DEL_AF = { hylde: "hylde", stempelLod: "hylde", laasKnap: "laas", koel: "plade", varm: "plade",
        flaske: "gas", hane: "gas", manometer: "mano" };

    P.under = function (pt) {
        var u = this.underAlle(pt);
        return u && DEL_AF[u] && !this.fremme(DEL_AF[u]) ? null : u;
    };

    P.underAlle = function (pt) {
        var lay = this.lay;
        if (!lay) return null;
        var c = lay.cyl, ind = Tg.indre(c);
        var pY = this.stempelY();
        var ls = this.lodTal();
        /* Oeverste lod paa hylden */
        if (ls.hylde > 0) {
            var h = this.lodPaaHylde(ls.hylde - 1);
            if (pt.x >= h.x - 4 && pt.x <= h.x + lay.lodB + 4 && pt.y >= h.y - 4 && pt.y <= lay.hylde.y + 6) return "hylde";
        }
        /* Lodderne paa stemplet */
        if (ls.stempel > 0) {
            var o = this.lodPaaStempel(ls.stempel - 1);
            if (pt.x >= o.x - 4 && pt.x <= o.x + lay.lodB + 4 && pt.y >= o.y - 4 && pt.y <= pY - lay.stempelH) return "stempelLod";
        }
        var lk = this.laasKnap();
        if (pt.x >= lk.x - 3 && pt.x <= lk.x + lk.b + 3 && pt.y >= lk.y - 3 && pt.y <= lk.y + lk.h + 3) return "laasKnap";
        if (pt.x >= ind.x && pt.x <= ind.x + ind.b && pt.y >= pY - lay.stempelH - 2 && pt.y <= pY + 3) return null;
        var st = Tg.pladeStr(lay.plade);
        if (Math.hypot(pt.x - st.koel.x, pt.y - st.koel.y) <= st.koel.r + 5) return "koel";
        if (Math.hypot(pt.x - st.varm.x, pt.y - st.varm.y) <= st.varm.r + 5) return "varm";
        var fl = lay.flaske;
        if (pt.x >= fl.x - 4 && pt.x <= fl.x + fl.b + 4 && pt.y >= fl.y - 4 && pt.y <= fl.y + fl.h) return "flaske";
        var hn = lay.hane;
        if (Math.hypot(pt.x - hn.x, pt.y - hn.y) <= hn.r * 2.4) return "hane";
        if (Math.hypot(pt.x - lay.mano.cx, pt.y - lay.mano.cy) <= lay.mano.r * 1.2) return "manometer";
        if (pt.x >= ind.x && pt.x <= ind.x + ind.b && pt.y > pY && pt.y <= ind.bund) return "gas";
        return null;
    };

    /* Hvor mange lodder staar hvor, naar de flyvende er trukket fra */
    P.lodTal = function () {
        var tilStempel = 0, tilHylde = 0;
        this.flyv.forEach(function (f) { if (f.op) tilStempel++; else tilHylde++; });
        var stempel = this.g.lodder - tilStempel;
        var hylde = S.LOD_MAKS - this.g.lodder - tilHylde;
        if (this.traek && this.traek.fra === "hylde") hylde--;
        if (this.traek && this.traek.fra === "stempel") stempel--;
        return { stempel: Math.max(0, stempel), hylde: Math.max(0, hylde) };
    };

    var VINK = {
        hylde: "Klik, eller træk loddet op på stemplet",
        stempelLod: "Klik: tag et lod af",
        koel: "Køl gassen (−" + S.T_KNAP + " K)",
        varm: "Varm gassen (+" + S.T_KNAP + " K)",
        flaske: "Klik: +0,25 mol gas",
        hane: "Klik: luk 0,25 mol ud",
        manometer: "Trykket i gassen"
    };

    P.vink = function (u) { return VINK[u] || ""; };

    P.klikScene = function (u) {
        switch (u) {
            case "hylde": this.lod(1, "klik"); return true;
            case "stempelLod": this.lod(-1, "klik"); return true;
            case "laasKnap": this.laas(!this.g.laast); return true;
            case "koel": this.saetT(this.g.T - D.STEMPEL.T_KNAP, "knap"); return true;
            case "varm": this.saetT(this.g.T + D.STEMPEL.T_KNAP, "knap"); return true;
            case "flaske": this.gas(1); return true;
            case "hane": this.gas(-1); return true;
            case "manometer": this.kortBesked(D.SCENE.manometer + " Nu: " + pTekst(this.pVist()) + "."); return true;
            case "gas": this.kortBesked("Der er " + NK.tal2(this.g.n) + " mol gas. Hver prik er en fyrretyvendedel mol."); return true;
        }
        return false;
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointerdown", function (e) {
            var pt = mig.L.punkt(e);
            var u = mig.under(pt);
            if (mig.laastNu()) { if (u) mig.kort.blink(); return; }
            if (u === "hylde" || u === "stempelLod") {
                mig.traek = { fra: u === "hylde" ? "hylde" : "stempel", start: pt, x: pt.x, y: pt.y, flyttet: false, id: e.pointerId };
                try { c.setPointerCapture(e.pointerId); } catch (x) { /* ingen capture */ }
                e.preventDefault();
            }
        });
        c.addEventListener("pointermove", function (e) {
            var pt = mig.L.punkt(e);
            mig.mus = pt;
            if (mig.traek) {
                mig.traek.x = pt.x;
                mig.traek.y = pt.y;
                if (Math.hypot(pt.x - mig.traek.start.x, pt.y - mig.traek.start.y) > 6) mig.traek.flyttet = true;
                c.style.cursor = "grabbing";
                return;
            }
            mig.over = mig.under(pt);
            c.style.cursor = mig.over && mig.over !== "gas" ? "pointer" : "default";
            if (mig.over === "hylde" || mig.over === "stempelLod") c.style.cursor = "grab";
        });
        c.addEventListener("pointerleave", function () {
            if (mig.traek) return;
            mig.over = null;
            mig.mus = null;
            c.style.cursor = "default";
        });
        c.addEventListener("pointerup", function (e) {
            var pt = mig.L.punkt(e);
            var t = mig.traek;
            if (t) {
                mig.traek = null;
                mig.ignorerKlik = true;
                c.style.cursor = "default";
                if (!t.flyttet) {
                    mig.lod(t.fra === "hylde" ? 1 : -1, "klik");
                    return;
                }
                var ind = Tg.indre(mig.lay.cyl);
                var overCyl = pt.x >= ind.x - 24 && pt.x <= ind.x + ind.b + 24 && pt.y <= mig.stempelY();
                if (t.fra === "hylde") {
                    if (overCyl) mig.lod(1, "traek");
                    else mig.kortBesked("Slip loddet over stemplet.");
                } else if (!overCyl) {
                    mig.lod(-1, "traek");
                }
                return;
            }
        });
        c.addEventListener("click", function (e) {
            var pt = mig.L.punkt(e);
            if (mig.ignorerKlik) { mig.ignorerKlik = false; return; }   /* klaret af pointerup */
            var u = mig.under(pt);
            if (u && mig.laastNu()) return;     /* blinket kom ved pointerdown */
            if (u) mig.klikScene(u);
        });
    };

    /* ======================================================================
       TID OG TEGNING
       ====================================================================== */
    P.pVist = function () {
        return G.tryk(this.g.n, this.g.T, Math.max(0.05, this.Vvist));
    };

    P.opdater = function (dt) {
        this.tid += dt;
        this.stille += dt;
        if (this.kortT > 0) {
            this.kortT -= dt;
            if (this.kortT <= 0) { this.kortT = 0; this.kort.note(""); }
        }
        if (this.ventAeg > 0) {
            this.ventAeg -= dt;
            if (this.ventAeg <= 0) this.kortBesked(D.SCENE.aeg224, 6);
        }
        this.koerAuto(dt);
        this.Vvist = NK.mod(this.Vvist, this.g.V, 3.2, dt);
        this.ventil = Math.max(0, this.ventil - dt);
        this.haneAaben = Math.max(0, this.haneAaben - dt);
        this.flyv.forEach(function (f) { f.t += dt / 0.4; });
        this.flyv = this.flyv.filter(function (f) { return f.t < 1; });
        if (this.lay) {
            var ind = Tg.indre(this.lay.cyl);
            this.part.opdater(dt, ind.b, this.Vvist * this.lay.pxPrL, Math.sqrt(this.g.T / 293), this.indgang());
        }
        /* Sporet i grafen */
        this.sporT += dt;
        if (this.sporT > 0.06) {
            this.sporT = 0;
            var s = this.spor[this.spor.length - 1], p = this.pVist();
            if (!s || Math.abs(s.V - this.Vvist) > 0.05 || Math.abs(s.p - p) > 0.005) {
                this.spor.push({ V: this.Vvist, p: p });
                if (this.spor.length > 90) this.spor.shift();
            }
        }
        if (this.fase === "proev") {
            this.tjekForsoeg();
        }
    };

    P.tegn = function () {
        var lay = this.lay;
        if (!lay) return;
        var c = this.L.ctx, g = this.g;
        this.L.ryd("#16171d");
        Tg.baggrund(c, lay.W, lay.H, lay.bordY);
        var cyl = lay.cyl, ind = Tg.indre(cyl);
        var fs = Tg.flaskeStr(lay.flaske);
        var dyse = { x: lay.flaske.x + lay.flaske.b - (fs.dyse.x - lay.flaske.x), y: fs.dyse.y };
        /* Det, der er fremme (trinvis start): resten er vaek eller har en stiplet plads */
        var vis = { mano: this.fremme("mano"), plade: this.fremme("plade"), graf: this.fremme("graf"),
            hylde: this.fremme("hylde"), gas: this.fremme("gas") };
        /* Roerene bag udstyret */
        var ms = Tg.manometerStr(lay.mano);
        if (vis.mano) Tg.roer(c, [{ x: lay.mano.cx, y: ms.bund - 4 }, { x: lay.mano.cx, y: lay.roerY }, { x: cyl.x - 6, y: lay.roerY }], 6, "#c9a24e", "#5a4418");
        var hx = lay.hane.x;
        if (vis.gas) {
            Tg.roer(c, [{ x: dyse.x, y: dyse.y }, { x: Math.max(hx + 26, dyse.x - 30), y: dyse.y },
                { x: Math.max(hx + 26, dyse.x - 30), y: lay.roerY }, { x: cyl.x + cyl.b + 6, y: lay.roerY }], 7, "#3d434b", "#16181c");
        }
        /* Varmepladen, eller dens stiplede plads under cylinderen */
        var varme = NK.klamp((g.T - 293) / 207, 0, 1), kulde = NK.klamp((293 - g.T) / 143, 0, 1);
        if (vis.plade) {
            Tg.plade(c, lay.plade, {
                varme: varme, kulde: kulde, knapper: true,
                tekst: g.T + " K   " + (g.T - D.KELVIN) + " °C", lys: this.over === "koel" || this.over === "varm" ? this.over : null
            });
        } else {
            Tg.plads(c, lay.plade.x, lay.plade.y + 3, lay.plade.b, lay.pladeH - 3, "Varmeplade");
        }
        /* Cylinderen */
        var ls = this.lodTal();
        Tg.cylinder(c, cyl, {
            hoejde: this.Vvist * lay.pxPrL, stempelH: lay.stempelH, partikler: this.part,
            laast: g.laast, lodder: ls.stempel, lodB: lay.lodB, vedStop: g.stop && Math.abs(this.Vvist - S.V_MAKS) < 0.5,
            varme: varme, kulde: kulde, pxPrL: lay.pxPrL,
            skala: { maks: S.V_MAKS, trin: 2, stor: 10 },
            lys: { stempel: false, top: !!(this.traek && this.traek.fra === "hylde") }
        });
        /* Skiltet med volumen ved stemplet og laaseknappen under det (fra opgave 4) */
        var pY = this.stempelY();
        Tg.skilt(c, cyl.x + cyl.b + 14, pY - lay.stempelH / 2, "V = " + G.fmt("V", this.Vvist), "moerk");
        if (this.fremme("laas")) Tg.laasKnap(c, this.laasKnap(), g.laast, this.over === "laasKnap");
        /* Stofmaengden nederst i gassen (fra opgave 3, hvor gassen kan aendres) */
        if (vis.gas) Tg.skilt(c, ind.x + ind.b / 2, ind.bund - 18, "n = " + NK.tal2(g.n) + " mol", "moerk", "midt");
        /* Manometeret og tallet over det, eller dets stiplede plads */
        var p = this.pVist();
        if (vis.mano) {
            Tg.manometer(c, lay.mano, { p: p, maks: 8, stor: 2, lille: 0.5, lys: this.over === "manometer" });
            Tg.skilt(c, lay.mano.cx, ms.y - 14, "p = " + pTekst(p), "moerk", "midt", lay.W);
        } else {
            var mr = lay.mano.r * 1.3;
            Tg.plads(c, lay.mano.cx - mr, lay.mano.cy - mr, 2 * mr, 2 * mr, "Manometer", true);
        }
        /* Gasflasken (spejlvendt, saa dysen peger mod cylinderen) og hanen */
        if (vis.gas) {
            c.save();
            c.translate(lay.flaske.x * 2 + lay.flaske.b, 0);
            c.scale(-1, 1);
            Tg.flaske(c, lay.flaske, { lys: this.over === "flaske" || this.ventil > 0, utenEtiket: true });
            c.restore();
            this.tegnEtiket(c, fs);
            Tg.hane(c, lay.hane, { lys: this.over === "hane", aaben: this.haneAaben > 0 });
            if (this.haneAaben > 0) this.tegnPuf(c, lay.hane, this.haneAaben);
        }
        /* Hylden med trykket udefra under den */
        if (vis.hylde) {
            Tg.hylde(c, lay.hylde, ls.hylde, lay.lodB, this.over === "hylde" || !!(this.traek && this.traek.fra === "stempel"));
            Tg.skilt(c, lay.hylde.x + lay.hylde.b / 2, lay.hylde.y + 42, "udefra " + G.fmt("p", g.pYdre()), "moerk", "midt", lay.W);
        }
        /* Flyvende og trukne lodder */
        this.flyv.forEach(function (f) {
            var t = NK.blod(f.t);
            var x = NK.lerp(f.fra.x, f.til.x, t), y = NK.lerp(f.fra.y, f.til.y, t) - Math.sin(t * Math.PI) * 40;
            NK.Sprites.tegn(c, "lod", x, y, lay.lodB, lay.lodH);
        });
        if (this.traek && this.traek.flyttet) {
            NK.Sprites.tegn(c, "lod", this.traek.x - lay.lodB / 2, this.traek.y - lay.lodH / 2, lay.lodB, lay.lodH);
        }
        /* Grafen oeverst til venstre, naar der er plads (foer opgave 2: dens stiplede plads) */
        if (lay.graf && vis.graf) {
            Tg.graf(c, lay.graf, { n: g.n, T: g.T, V: this.Vvist, p: p, vMaks: S.V_MAKS, pMaks: 8, spor: this.spor, kurve: true });
        } else if (lay.graf) {
            Tg.plads(c, lay.graf.x, lay.graf.y, lay.graf.b, lay.graf.h, "Tryk og volumen");
        }
        /* Klik-opfordringen: kun det apparat, kortet beder eleven bruge nu */
        this.tegnOpfordring(c);
        /* Et lille vink ved det, musen er over */
        if (this.over && !this.traek && this.mus) {
            var v = this.vink(this.over);
            if (v) Tg.skilt(c, NK.klamp(this.mus.x + 14, 8, lay.W - 190), NK.klamp(this.mus.y - 22, 14, lay.H - 14), v, "moerk");
        }
    };

    /* ======================================================================
       KLIK-OPFORDRINGEN (runde 4, 21. nov. 2026, CLAUDE.md og REGELSAET 19-21)
       Brugeren: "Lad være med at lave 'KLIK: læg på' når det er meningen at man
       skal svare ... 'klik'-symboler kommer først frem, når man skal klikke, og
       de må gerne generelt være mere tydelige". Mens kortet stiller et
       spoergsmaal eller et gaet, er der ingen opfordringer. Naar kortet beder om
       en handling ("Prøv det: Luk gas ind ..."), faar praecis det apparat, der
       skal bruges, en gul ramme og en boble med pil (som krukken i sc6.1).
       Opfordringen er vaek igen, naar handlingen er gjort.
       ====================================================================== */
    P.opfordring = function () {
        if (this.fase !== "proev" || !this.base || this.auto || !this.lay) return null;
        var o = this.opg(), g = this.g;
        if (o.krav && o.krav.laast !== undefined && g.laast !== o.krav.laast) {
            return { u: "laasKnap", tekst: o.krav.laast ? "Klik: lås" : "Klik: lås op", side: "hoejre" };
        }
        if (this.udfoert(o)) return null;
        var flaske = { u: "flaske", tekst: "Klik: gas ind", side: "over" };
        switch (o.handling) {
            case "varm": return { u: "varm", tekst: "Klik: varm op", side: "hoejre" };
            case "lod": return { u: "hylde", tekst: "Klik: læg på", side: "over" };
            case "dobbeltN": return flaske;
            case "udN": return { u: "hane", tekst: "Klik: gas ud", side: "over" };
            case "maal":
                var m = o.maalTilstand;
                if (g.n < m.n - 1e-9) return flaske;
                if (g.n > m.n + 1e-9) return { u: "hane", tekst: "Klik: gas ud", side: "over" };
                if (g.lodder > m.lodder) return { u: "stempelLod", tekst: "Klik: tag af", side: "over" };
                return null;
        }
        return null;
    };

    /* Rammen om tingen og boblens spids (x, y). klikTegnet: det, der blev tegnet (selvtesten) */
    P.tegnOpfordring = function (c) {
        this.klikTegnet = [];
        var op = this.opfordring();
        if (!op) return;
        var lay = this.lay, ls = this.lodTal(), st = Tg.pladeStr(lay.plade), r, x, y;
        if (op.u === "varm") {
            r = { rund: true, x: st.varm.x, y: st.varm.y, r: st.varm.r + 7 };
            x = r.x + r.r; y = r.y;
        } else if (op.u === "hane") {
            r = { rund: true, x: lay.hane.x, y: lay.hane.y - lay.hane.r * 0.6, r: lay.hane.r * 2.6 };
            x = r.x; y = r.y - r.r;
        } else if (op.u === "hylde") {
            var top = this.lodPaaHylde(Math.max(0, ls.hylde - 1)).y;
            r = { x: lay.hylde.x - 8, y: top - 8, b: lay.hylde.b + 16, h: lay.hylde.y + 14 - top };
            x = r.x + r.b / 2; y = r.y;
        } else if (op.u === "stempelLod") {
            var ol = this.lodPaaStempel(Math.max(0, ls.stempel - 1));
            r = { x: ol.x - 8, y: ol.y - 8, b: lay.lodB + 16, h: ls.stempel * (lay.lodH - 1) + 14 };
            x = r.x + r.b / 2; y = r.y;
        } else if (op.u === "flaske") {
            r = { x: lay.flaske.x - 8, y: lay.flaske.y - 8, b: lay.flaske.b + 16, h: lay.flaske.h + 12 };
            x = r.x + r.b / 2; y = r.y;
        } else if (op.u === "laasKnap") {
            var k = this.laasKnap();
            r = { x: k.x - 6, y: k.y - 6, b: k.b + 12, h: k.h + 12 };
            x = r.x + r.b; y = r.y + r.h / 2;
        }
        Tg.opfordring(c, r, op.tekst, x, y, op.side, lay.W, this.tid);
        this.klikTegnet.push(op.u);
    };

    /* Etiketten paa den spejlvendte flaske skal kunne laeses */
    P.tegnEtiket = function (c, fs) {
        var lay = this.lay, fl = lay.flaske;
        var e = fs.etiket;
        var ex = fl.x + fl.b - (e.x - fl.x) - e.b;
        c.save();
        c.fillStyle = "#f6f1dc";
        NK.rundtRekt(c, ex, e.y, e.b, e.h, 4);
        c.fill();
        c.fillStyle = "#2a2f36";
        c.textAlign = "center";
        c.textBaseline = "middle";
        NK.passendeSkrift(c, "GAS", e.b - 6, NK.klamp(e.h * 0.34, 12, 20), 11, "800");
        c.fillText("GAS", ex + e.b / 2, e.y + e.h * 0.36);
        c.fillStyle = "#5a6270";
        NK.passendeSkrift(c, "+0,25 mol", e.b - 6, NK.klamp(e.h * 0.24, 12, 14), 11, "600");
        if (c.measureText("+0,25 mol").width <= e.b - 4) c.fillText("+0,25 mol", ex + e.b / 2, e.y + e.h * 0.72);
        c.restore();
    };

    /* Et lille pust, naar hanen lukker gas ud */
    P.tegnPuf = function (c, h, t) {
        c.save();
        for (var i = 0; i < 4; i++) {
            var a = t * (0.3 + i * 0.12);
            c.fillStyle = "rgba(220, 235, 250, " + (0.35 * a).toFixed(3) + ")";
            c.beginPath();
            c.arc(h.x + (1 - t) * 14 * (i - 1.5), h.y + 10 + (1 - t) * 26 + i * 4, 3 + (1 - t) * 6, 0, Math.PI * 2);
            c.fill();
        }
        c.restore();
    };

    NK.SimStempel = SimStempel;
}());
