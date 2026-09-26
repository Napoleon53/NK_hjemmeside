/* =====================================================================
   sim_stempel.js - fane 1: stemplet

   En gas i en cylinder med et stempel, der glider frit eller er laast.
   Eleven skruer paa én ting ad gangen: temperaturen (skyderen eller
   knapperne paa varmepladen), lodderne (traek dem fra hylden op paa
   stemplet), gassen (klik paa flasken, eller luk ud ved den roede hane)
   og laasen (klik paa stemplet). Manometeret viser trykket i gassen,
   skalaen paa glasset volumen og displayet temperaturen.

   Opgaverne er forudsigelser: eleven vaelger foerst, hvad der sker, og
   proever det saa. Modellen afgoer svaret, og et forkert gaet faar en
   forklaring, ikke en afvisning. Kemichael sidder ved katederet og
   siger kun noget, naar eleven beder om et hint eller svaret.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var G = NK.Gas;
    var Tg = NK.Tegn;
    var S = D.STEMPEL;
    var MAAL = NK.Sprites.MAAL;

    var NOEGLE = "nk-sc4.6-stempel";

    /* Trykket paa fane 1 med tre decimaler, som luftens 1,013 bar */
    function pTekst(p) { return p.toFixed(3).replace(".", ",") + " bar"; }
    function tal(m, v) { return m === "p" ? pTekst(v) : G.fmt(m, v); }
    var STILLE = 0.7;            /* sekunder uden aendringer, foer et forsoeg aflaeses */

    function SimStempel() {
        this.navn = "stempel";
        this.L = new NK.Laerred(NK.el("stempel-laerred"));
        this.k = new NK.RoligLaerer({ boble: "stempel-boble", knap: "stempel-kknap" });
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
        this.bygPanel();
        this.koblMus();
        var i = this.naesteUloeste(-1);
        this.vaelg(i >= 0 ? i : 0);
    }

    var P = SimStempel.prototype;

    /* ======================================================================
       PANELET
       ====================================================================== */
    P.bygPanel = function () {
        var mig = this;
        this.el = {
            kort: NK.el("stempel-kort"), knap: NK.el("stempel-knap"), besked: NK.el("stempel-besked"),
            valg: NK.el("stempel-valg"), prikker: NK.el("stempel-prikker"), T: NK.el("stempel-T")
        };
        this.el.knap.addEventListener("click", function () { mig.knap(); });
        this.el.T.min = S.T_MIN;
        this.el.T.max = S.T_MAKS;
        this.el.T.step = 1;
        this.el.T.addEventListener("input", function () { mig.saetT(parseFloat(mig.el.T.value), "skyder"); });
        NK.el("stempel-lod-minus").addEventListener("click", function () { mig.lod(-1, "knap"); });
        NK.el("stempel-lod-plus").addEventListener("click", function () { mig.lod(1, "knap"); });
        NK.el("stempel-n-minus").addEventListener("click", function () { mig.gas(-1); });
        NK.el("stempel-n-plus").addEventListener("click", function () { mig.gas(1); });
        NK.el("stempel-frit").addEventListener("click", function () { mig.laas(false); });
        NK.el("stempel-laast").addEventListener("click", function () { mig.laas(true); });
        /* Prikkerne: én pr. opgave */
        this.el.prikker.innerHTML = "";
        this.opgaver.forEach(function (o, i) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "prik";
            b.title = (i + 1) + ". " + o.navn;
            b.setAttribute("aria-label", "Opgave " + (i + 1) + ": " + o.navn);
            b.addEventListener("click", function () { mig.vaelg(i); });
            mig.el.prikker.appendChild(b);
        });
    };

    P.visStyr = function () {
        var g = this.g;
        if (document.activeElement !== this.el.T || Math.abs(parseFloat(this.el.T.value) - g.T) > 0.5) this.el.T.value = g.T;
        NK.saetTekst("stempel-T-tal", g.T + " K (" + (g.T - D.KELVIN) + " °C)");
        NK.saetTekst("stempel-lod-tal", String(g.lodder));
        NK.saetTekst("stempel-pydre", G.fmt("p", g.pYdre()));
        NK.saetTekst("stempel-n-tal", NK.tal2(g.n) + " mol");
        NK.el("stempel-frit").classList.toggle("valgt", !g.laast);
        NK.el("stempel-laast").classList.toggle("valgt", g.laast);
        NK.el("stempel-lod-minus").disabled = g.lodder <= 0;
        NK.el("stempel-lod-plus").disabled = g.lodder >= S.LOD_MAKS;
        NK.el("stempel-n-minus").disabled = g.n <= S.N_MIN + 1e-9;
        NK.el("stempel-n-plus").disabled = g.n >= S.N_MAKS - 1e-9;
    };

    /* ======================================================================
       HANDLINGERNE (fra panelet og scenen)
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

    /* Efter hver aendring: panelet, molekylerne, stoppet og paaskeaegget */
    P.efter = function () {
        this.stille = 0;
        this.visStyr();
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

    P.vaelg = function (i) {
        this.nr = i;
        var o = this.opgaver[i];
        this.fase = "valg";
        this.valgt = -1;
        this.hjaelp = 0;
        this.brugtSvar = false;
        this.auto = null;
        this.base = null;
        this.anvendStart(o);
        this.bygValg();
        this.visKort();
        this.visPrikker();
        this.k.tie();
        this.naesteLinje();
    };

    P.anvendStart = function (o) {
        this.g.saet(o.start);
        this.stopVist = this.g.stop;
        this.stille = 0;
        this.visStyr();
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

    P.bygValg = function () {
        var mig = this, o = this.opg();
        var vaert = this.el.valg;
        vaert.innerHTML = "";
        o.valg.forEach(function (v, j) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "valgknap";
            b.textContent = v.t;
            if (mig.fase !== "valg") {
                b.disabled = true;
                if (j === mig.valgt) b.classList.add("valgt");
                if (mig.fase === "faerdig") {
                    if (v.ok) b.classList.add("rigtig");
                    else if (j === mig.valgt) b.classList.add("forkert");
                }
            }
            b.addEventListener("click", function () { mig.vaelgSvar(j, false); });
            vaert.appendChild(b);
        });
    };

    P.visKort = function () {
        var o = this.opg();
        NK.saetTekst("stempel-titel", o.navn);
        NK.saetTekst("stempel-nr", String(this.nr + 1));
        NK.saetTekst("stempel-spm", o.spm);
        this.el.kort.classList.toggle("sejr", this.fase === "faerdig");
        this.visKnap();
    };

    P.visKnap = function () {
        var tekst, klasse = "knap";
        if (this.fase === "faerdig") {
            klasse = "knap blaa banker";
            tekst = this.naesteUloeste(this.nr) >= 0 ? "Næste opgave →" : "Videre til Beregningen →";
        } else {
            tekst = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
        }
        this.el.knap.textContent = tekst;
        this.el.knap.className = klasse;
        this.el.knap.disabled = !!this.auto;
    };

    P.visPrikker = function () {
        var mig = this, knapper = this.el.prikker.querySelectorAll(".prik");
        this.status.forEach(function (s, i) {
            var b = knapper[i];
            b.classList.toggle("valgt", i === mig.nr);
            b.classList.toggle("loest", s.loest);
            b.textContent = s.stjerne ? "★" : (s.loest ? "✓" : String(i + 1));
        });
    };

    /* Linjen i opgavekortet: det naeste skridt */
    P.trinLinje = function () {
        var o = this.opg();
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

    P.vaelgSvar = function (j, vist) {
        if (this.fase !== "valg") return;
        var o = this.opg();
        this.valgt = j;
        if (vist) this.brugtSvar = true;
        this.hjaelp = 0;
        if (!vist) this.k.tie();
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
        var navn = m === "V" ? "Volumen" : "Trykket";
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
        var tekst = (ok ? "Rigtigt." : "Du gættede: " + v.t.charAt(0).toLowerCase() + v.t.slice(1) + ".") +
            (res ? " " + res : "") + " " + (!ok && v.svar ? v.svar + " " + o.hvorfor : o.hvorfor);
        if (alle && !this.rostAlt) { this.rostAlt = true; tekst += " " + D.FAERDIG.stempel; }
        this.gem();
        this.k.tie();
        this.bygValg();
        this.visKort();
        this.visPrikker();
        this.besked(NK.html(tekst), ok ? "god" : "skidt");
    };

    /* ----- Knappen: Giv hint -> Vis svaret -> Naeste opgave ---------------------------- */
    P.knap = function () {
        if (this.fase === "faerdig") {
            var i = this.naesteUloeste(this.nr);
            if (i >= 0) this.vaelg(i);
            else if (NK.visFane) NK.visFane("fane-regn");
            return;
        }
        if (this.auto) return;
        var o = this.opg();
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.hjaelpVis("<b>Hint:</b> " + NK.html(this.fase === "valg" ? o.hint : o.proevHint), "hint");
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
            this.k.tie();
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

    /* ----- Linjen i opgavekortet og Kemichael (som i sc4.5) -------------------------------- */
    P.besked = function (html, klasse) {
        this.fast = { html: html || "", klasse: klasse || "" };
        this.kortT = 0;
        this.visBesked(this.fast);
    };

    P.kortBesked = function (html, sek) {
        this.kortT = sek || 4;
        this.visBesked({ html: html, klasse: "" });
    };

    P.visBesked = function (b) {
        var e = this.el.besked;
        e.innerHTML = b.html;
        e.className = "besked" + (b.klasse ? " " + b.klasse : "");
    };

    P.beskedTekst = function () { return this.el.besked.textContent; };

    P.hjaelpVis = function (html, slags) {
        if (!this.k.sig(html, slags)) this.besked(html + " " + this.trinLinje(), "gul");
    };

    P.svarVis = function (html) {
        if (!this.k.sig(html, "svar")) this.besked("<b>Svar:</b> " + html, "gul");
    };

    P.startIntro = function (tving) {
        if (!tving) return;
        if (!this.k.inde()) { this.k.hentInd(); return; }
        var t = this.fase === "faerdig" ? "" : this.trinLinje();
        this.k.sig(NK.html(D.INTRO.stempel + (t ? " " + t : "")), "");
    };

    P.fokus = function () { };
    P.enter = function () { if (this.fase === "faerdig") this.knap(); };
    P.nulstil = function () { this.vaelg(this.nr); };

    /* ======================================================================
       LAYOUT
       ====================================================================== */
    P.tilpas = function () {
        if (this.L.tilpas() || !this.lay) this.layout();
    };

    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var gammel = this.lay;
        var baand = this.k.layout(W, H);
        var lay = { W: W, H: H, baandY: baand.y };
        var top = 12;
        lay.bordY = Math.round(baand.y - NK.klamp((baand.y - top) * 0.05, 12, 34));
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
        /* Hoejre for cylinderen: skiltet med volumen, hylden og gasflasken */
        var hx = lay.cyl.x + cylB + 14 + NK.klamp(W * 0.11, 70, 112);
        var fh = Math.round(NK.klamp(arbH * 0.36, 100, 210));
        var fb = fh * MAAL.gasflaske.b / MAAL.gasflaske.h;
        var fx = Math.min(W - 14 - fb, hx + lodB + 16 + NK.klamp(W * 0.04, 16, 50));
        lay.flaske = { x: fx, y: lay.bordY - fh, h: fh, b: fb };
        lay.hylde = { x: Math.min(hx, fx - lodB - 22), y: Math.round(lay.cyl.y + lay.cyl.h * 0.34), b: lodB + 16 };
        lay.hane = { x: lay.cyl.x + cylB + 8 + NK.klamp(W * 0.03, 16, 30), y: lay.roerY, r: NK.klamp(cylB * 0.045, 6, 9) };
        /* Grafen oeverst til venstre, over manometeret, hvis der er plads */
        var msG = Tg.manometerStr(lay.mano);
        var gb = Math.min(lay.cyl.x - 30 - 14, 330), gh = Math.min(msG.y - 44 - 14, 240);
        lay.graf = gb >= 150 && gh >= 110 ? { x: 14, y: 14, b: gb, h: gh } : null;
        this.lay = lay;
        if (gammel && gammel.cyl) {
            var gi = Tg.indre(gammel.cyl), ni = Tg.indre(lay.cyl);
            this.part.skaler(ni.b / gi.b, lay.pxPrL / gammel.pxPrL);
        } else {
            this.part.fyld(Math.round(this.g.n * S.PR_MOL), Tg.indre(lay.cyl).b, this.Vvist * lay.pxPrL);
        }
        /* Ankrene til rundvisningen */
        var c = lay.cyl;
        this.saetAnker("cylinder", c.x - 4, c.y - 4, c.b + 8, c.h + 8);
        var ms = Tg.manometerStr(lay.mano);
        this.saetAnker("manometer", ms.x, ms.y - 30, ms.b, ms.h + 30);
        this.saetAnker("plade", lay.plade.x, lay.plade.y, lay.plade.b, ph);
        this.saetAnker("flaske", lay.flaske.x, lay.flaske.y, lay.flaske.b, lay.flaske.h);
        this.saetAnker("hylde", lay.hylde.x, lay.hylde.y - S.LOD_MAKS * lodH - 6, lay.hylde.b, S.LOD_MAKS * lodH + 30);
        if (lay.graf) this.saetAnker("graf", lay.graf.x, lay.graf.y, lay.graf.b, lay.graf.h);
        else this.saetAnker("graf", 0, 0, 0, 0);
        this.saetAnker("laerer", 0, baand.y, Math.min(W, 360), baand.h);
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
    P.under = function (pt) {
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
        if (pt.x >= ind.x && pt.x <= ind.x + ind.b && pt.y >= pY - lay.stempelH - 2 && pt.y <= pY + 3) return "stempel";
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
        hylde: "Træk loddet op på stemplet",
        stempelLod: "Klik: tag et lod af",
        koel: "Køl gassen (−25 K)",
        varm: "Varm gassen (+25 K)",
        flaske: "Klik: +0,25 mol gas",
        hane: "Klik: luk 0,25 mol ud",
        manometer: "Trykket i gassen"
    };

    P.vink = function (u) {
        if (u === "stempel") return this.g.laast ? "Klik: lås stemplet op" : "Klik: lås stemplet";
        return VINK[u] || "";
    };

    P.klikScene = function (u) {
        switch (u) {
            case "hylde": this.lod(1, "klik"); return true;
            case "stempelLod": this.lod(-1, "klik"); return true;
            case "stempel": this.laas(!this.g.laast); return true;
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
            if (mig.k.under(pt)) return;
            var u = mig.under(pt);
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
            var lu = mig.k.hover(pt);
            mig.over = lu ? null : mig.under(pt);
            c.style.cursor = lu || (mig.over && mig.over !== "gas") ? "pointer" : "default";
            if (mig.over === "hylde" || mig.over === "stempelLod") c.style.cursor = "grab";
        });
        c.addEventListener("pointerleave", function () {
            if (mig.traek) return;
            mig.k.hover(null);
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
            if (mig.k.klik(pt)) return;
            var u = mig.under(pt);
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
            if (this.kortT <= 0) { this.kortT = 0; this.visBesked(this.fast); }
        }
        if (this.ventAeg > 0) {
            this.ventAeg -= dt;
            if (this.ventAeg <= 0) this.kortBesked(D.SCENE.aeg224, 6);
        }
        this.k.opdater(dt);
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
        Tg.baggrund(c, lay.W, lay.H, lay.bordY, lay.baandY);
        var cyl = lay.cyl, ind = Tg.indre(cyl);
        var fs = Tg.flaskeStr(lay.flaske);
        var dyse = { x: lay.flaske.x + lay.flaske.b - (fs.dyse.x - lay.flaske.x), y: fs.dyse.y };
        /* Roerene bag udstyret */
        var ms = Tg.manometerStr(lay.mano);
        Tg.roer(c, [{ x: lay.mano.cx, y: ms.bund - 4 }, { x: lay.mano.cx, y: lay.roerY }, { x: cyl.x - 6, y: lay.roerY }], 6, "#c9a24e", "#5a4418");
        var hx = lay.hane.x;
        Tg.roer(c, [{ x: dyse.x, y: dyse.y }, { x: Math.max(hx + 26, dyse.x - 30), y: dyse.y },
            { x: Math.max(hx + 26, dyse.x - 30), y: lay.roerY }, { x: cyl.x + cyl.b + 6, y: lay.roerY }], 7, "#3d434b", "#16181c");
        /* Varmepladen */
        var varme = NK.klamp((g.T - 293) / 207, 0, 1), kulde = NK.klamp((293 - g.T) / 143, 0, 1);
        Tg.plade(c, lay.plade, {
            varme: varme, kulde: kulde, knapper: true,
            tekst: g.T + " K   " + (g.T - D.KELVIN) + " °C", lys: this.over === "koel" || this.over === "varm" ? this.over : null
        });
        /* Cylinderen */
        var ls = this.lodTal();
        Tg.cylinder(c, cyl, {
            hoejde: this.Vvist * lay.pxPrL, stempelH: lay.stempelH, partikler: this.part,
            laast: g.laast, lodder: ls.stempel, lodB: lay.lodB, vedStop: g.stop && Math.abs(this.Vvist - S.V_MAKS) < 0.5,
            varme: varme, kulde: kulde, pxPrL: lay.pxPrL,
            skala: { maks: S.V_MAKS, trin: 2, stor: 10 },
            lys: { stempel: this.over === "stempel", top: !!(this.traek && this.traek.fra === "hylde") }
        });
        /* Skiltet med volumen ved stemplet */
        var pY = this.stempelY();
        Tg.skilt(c, cyl.x + cyl.b + 14, pY - lay.stempelH / 2, "V = " + G.fmt("V", this.Vvist), "moerk");
        /* Manometeret og tallet over det */
        var p = this.pVist();
        Tg.manometer(c, lay.mano, { p: p, maks: 8, stor: 2, lille: 0.5, lys: this.over === "manometer" });
        Tg.skilt(c, lay.mano.cx, ms.y - 14, "p = " + pTekst(p), "moerk", "midt", lay.W);
        /* Gasflasken (spejlvendt, saa dysen peger mod cylinderen) og hanen */
        c.save();
        c.translate(lay.flaske.x * 2 + lay.flaske.b, 0);
        c.scale(-1, 1);
        Tg.flaske(c, lay.flaske, { lys: this.over === "flaske" || this.ventil > 0, utenEtiket: true });
        c.restore();
        this.tegnEtiket(c, fs);
        Tg.hane(c, lay.hane, { lys: this.over === "hane", aaben: this.haneAaben > 0 });
        if (this.haneAaben > 0) this.tegnPuf(c, lay.hane, this.haneAaben);
        /* Hylden */
        Tg.hylde(c, lay.hylde, ls.hylde, lay.lodB, this.over === "hylde" || !!(this.traek && this.traek.fra === "stempel"));
        /* Flyvende og trukne lodder */
        this.flyv.forEach(function (f) {
            var t = NK.blod(f.t);
            var x = NK.lerp(f.fra.x, f.til.x, t), y = NK.lerp(f.fra.y, f.til.y, t) - Math.sin(t * Math.PI) * 40;
            NK.Sprites.tegn(c, "lod", x, y, lay.lodB, lay.lodH);
        });
        if (this.traek && this.traek.flyttet) {
            NK.Sprites.tegn(c, "lod", this.traek.x - lay.lodB / 2, this.traek.y - lay.lodH / 2, lay.lodB, lay.lodH);
        }
        /* Grafen oeverst til venstre, naar der er plads */
        if (lay.graf) {
            Tg.graf(c, lay.graf, { n: g.n, T: g.T, V: this.Vvist, p: p, vMaks: S.V_MAKS, pMaks: 8, spor: this.spor, kurve: true });
        }
        /* Et lille vink ved det, musen er over */
        if (this.over && !this.traek && this.mus) {
            var v = this.vink(this.over);
            if (v) Tg.skilt(c, NK.klamp(this.mus.x + 14, 8, lay.W - 190), NK.klamp(this.mus.y - 22, 14, lay.baandY - 14), v, "moerk");
        }
        this.k.tegn(c);
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
