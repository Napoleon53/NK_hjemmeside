/* =====================================================================
   sim_montre.js - fane 1: udstillingen

   (I koden hedder udstillingen "montre". Eleven ser kun "udstilling".)

   Udstillingen er tom, og de 36 proever staar i en kasse paa bordet.
   Hver proeve har et maerke, hvor enten symbolet eller navnet mangler.
   Man tager en proeve op paa bordet og loeser den:

     1. navnet eller symbolet, der mangler paa maerket (i panelet)
     2. pladsen: proeven traekkes op i rummet med det rigtige skilt, eller
        man klikker paa rummet. Det kan ske foer eller efter navnet.
     3. elektronstrukturen, som tegnes paa tavlen, mens man skriver. Den
        venter, til proeven staar paa plads. Overgangsmetallerne (21-30)
        springer den over.

   Hvert klik giver et svar, og linjen under scenen siger, hvad der skal
   ske nu.

   Mens elektronstrukturen skrives, lyser periodens og hovedgruppens
   nummer i udstillingen. Det er pointen: pladsen giver strukturen.

   Knappen under raekkerne giver foerst et hint og saa svaret til det
   felt, man staar i. Et forkert svar giver en besked, der passer til
   fejlen (js/tjek.js). Hvad eleven har loest, og om det blev loest
   uden at se svaret (stjernen), huskes i browseren under NOEGLE.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;
    var Tj = NK.Tjek;

    var NOEGLE = "nk-sc1.2-montre";
    var FLYV_TID = 0.6;

    var PLADSHOLDER = {
        navn: "skriv navnet",
        symbol: "skriv symbolet",
        struktur: "tal med komma imellem"
    };

    var ETIKET = {
        navn: "Navn",
        symbol: "Symbol",
        plads: "Plads i udstillingen",
        struktur: "Elektronstruktur"
    };

    function SimMontre() {
        this.L = new NK.Laerred(NK.el("montre-laerred"));
        this.tid = 0;
        var gemt = NK.hent(NOEGLE, {});
        this.status = {};
        var mig = this;
        D.GRUNDSTOFFER.forEach(function (g) {
            var s = gemt[g.z];
            mig.status[g.z] = { loest: !!(s && s.l), stjerne: !!(s && s.s) };
        });
        this.rost = {};
        this.over = null;
        this.flyv = [];
        this.kassePos = {};
        this.blink = {};
        this.lay = null;
        this.hintRinge = 0;
        this.periodeHint = false;
        this.tavlePuls = null;
        this.fokuseret = false;
        this.g = { kaffekop: { skjult: false, iHaand: false } };
        this.valgt = 0;
        this.opg = null;

        this.bygPanel();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.vaelg(this.naesteUloeste(0), true);
    }

    var P = SimMontre.prototype;

    /* ----- Hukommelse ------------------------------------------------------ */
    P.gem = function () {
        var ud = {}, s = this.status;
        Object.keys(s).forEach(function (z) {
            if (s[z].loest) ud[z] = { l: 1, s: s[z].stjerne ? 1 : 0 };
        });
        NK.gem(NOEGLE, ud);
    };

    P.antalLoest = function (periode) {
        var n = 0, mig = this;
        D.GRUNDSTOFFER.forEach(function (g) {
            if ((periode === undefined || g.periode === periode) && mig.status[g.z].loest) n++;
        });
        return n;
    };

    P.antalStjerner = function (periode) {
        var n = 0, mig = this;
        D.GRUNDSTOFFER.forEach(function (g) {
            if ((periode === undefined || g.periode === periode) && mig.status[g.z].stjerne) n++;
        });
        return n;
    };

    /* Den naeste uloeste proeve efter atomnummer fra. Er alle loest,
       bare den naeste. */
    P.naesteUloeste = function (fra) {
        for (var d = 1; d <= 36; d++) {
            var z = ((fra - 1 + d) % 36 + 36) % 36 + 1;
            if (!this.status[z].loest) return z;
        }
        return (fra % 36) + 1;
    };

    /* Staar proeven i sit rum? Den valgte staar der, naar den er sat
       paa plads i denne opgave. */
    P.inde = function (z) {
        if (this.flyv.some(function (f) { return f.z === z; })) return false;
        if (z === this.valgt && this.opg) return !!this.opg.placeret;
        return this.status[z].loest;
    };

    /* Proeverne i kassen, i den raekkefoelge de tages */
    P.iKassen = function () {
        var mig = this;
        return D.ORDEN.filter(function (z) {
            return z !== mig.valgt && !mig.status[z].loest;
        });
    };

    /* ----- Layout --------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var kant = NK.klamp(W * 0.014, 8, 16);
        lay.bordY = Math.round(H * 0.9);
        lay.m = Tg.montreLay(kant, kant, W - 2 * kant, H * 0.47);
        var zoneTop = lay.m.y + lay.m.h + NK.klamp(H * 0.025, 8, 20);
        lay.zoneTop = zoneTop;

        /* Tavlen til hoejre, over koppen */
        var tb = NK.klamp(W * 0.4, 180, 460);
        var th = Math.max(120, lay.bordY - 50 - zoneTop);
        lay.tavle = { x: W - tb - kant, y: zoneTop, b: tb, h: th };
        lay.kop = { x: W - kant - 22, y: lay.bordY };

        /* Kassen til venstre paa bordet */
        var kb = NK.klamp(W * 0.27, 130, 290);
        var kh = NK.klamp((lay.bordY - zoneTop) * 0.46, 56, 124);
        lay.kasse = { x: kant, y: lay.bordY - kh + 3, b: kb, h: kh };

        /* Proeven paa bordet med maerket ved siden af */
        var ledig = lay.tavle.x - (lay.kasse.x + kb) - 20;
        lay.storH = NK.klamp(Math.min(lay.bordY - zoneTop - 24, ledig * 0.55), 60, 190);
        lay.maerke = { b: NK.klamp(ledig * 0.42, 84, 150) };
        lay.maerke.h = lay.maerke.b * 0.58;
        var gruppe = lay.storH * 0.45 + 18 + lay.maerke.b;
        lay.bordX = lay.kasse.x + kb + 10 + Math.max(0, (ledig - gruppe) / 2) + lay.storH * 0.25;
        this.lay = lay;

        this.saetAnker("montre-anker-montre", lay.m.x, lay.m.y, lay.m.b, lay.m.h);
        this.saetAnker("montre-anker-tavle", lay.tavle.x, lay.tavle.y, lay.tavle.b, lay.tavle.h);
        this.saetAnker("montre-anker-kasse", lay.kasse.x, lay.kasse.y - lay.kasse.h * 0.2, lay.kasse.b, lay.kasse.h * 1.2);
        this.saetAnker("montre-anker-navne", lay.m.tavle.x, lay.m.tavle.y, lay.m.tavle.b, lay.m.tavle.h);
    };

    P.saetAnker = function (id, x, y, b, h) {
        var e = NK.el(id);
        if (!e) return;
        e.style.left = Math.round(x) + "px";
        e.style.top = Math.round(y) + "px";
        e.style.width = Math.round(b) + "px";
        e.style.height = Math.round(h) + "px";
    };

    P.tilpas = function () {
        if (this.L.tilpas() || !this.lay) this.layout();
    };

    /* Hvor en proeve staar: paa bordet, i kassen eller i montren.
       Bundmidte og hoejde. */
    P.bordPos = function (g) {
        var lay = this.lay;
        return { x: lay.bordX, y: lay.bordY, h: Tg.proeveHoejde(g, lay.storH * 0.95, lay.storH) };
    };

    P.montrePos = function (g) {
        var n = this.lay.m.rum[g.z].niche;
        return { x: n.x + n.b / 2, y: n.y + n.h - 1.5, h: Tg.proeveHoejde(g, n.b * 0.86, n.h * 0.9) };
    };

    /* Kassen har to raekker: forreste raekke er de naeste i tur */
    P.kasseMaal = function () {
        var k = this.lay.kasse;
        var soejler = Math.max(4, Math.floor((k.b - 16) / NK.klamp(k.h * 0.4, 20, 40)));
        return { soejler: soejler, slot: (k.b - 16) / soejler, hoejde: k.h * 0.62 };
    };

    P.kasseSlot = function (g, i) {
        var k = this.lay.kasse, km = this.kasseMaal();
        var raekke = i < km.soejler ? 0 : 1;
        /* De skjulte ligger bag den bageste raekke, saa de ikke glider
           ind udefra, naar de rykker frem */
        var j = raekke === 0 ? i : Math.min(i - km.soejler, km.soejler - 1);
        var x = k.x + 8 + km.slot * (j + 0.5) + (raekke === 1 ? km.slot * 0.3 : 0);
        var y = k.y + k.h * (raekke === 0 ? 0.97 : 0.74);
        return { x: x, y: y, h: Tg.proeveHoejde(g, km.slot * 0.92, km.hoejde), raekke: raekke, synlig: i < km.soejler * 2 };
    };

    P.kassePlads = function (z) {
        var liste = this.iKassen();
        var i = liste.indexOf(z);
        if (i < 0) i = 0;
        return this.kasseSlot(D.efterZ(z), i);
    };

    /* ----- Flyveture -------------------------------------------------------- */
    P.flyt = function (z, fra, til, slut, efter) {
        this.flyv = this.flyv.filter(function (f) { return f.z !== z; });
        this.flyv.push({ z: z, fra: fra, til: til, slut: slut, t: 0, efter: efter || null });
    };

    P.flyverTil = function (z, slut) {
        return this.flyv.some(function (f) { return f.z === z && f.slut === slut; });
    };

    P.flyverFra = function (z, slut) {
        return this.flyv.some(function (f) { return f.z === z && f.fra.slags === slut; });
    };

    P.flyvPos = function (f) {
        var t = NK.blod(f.t / FLYV_TID);
        return {
            x: NK.lerp(f.fra.x, f.til.x, t),
            y: NK.lerp(f.fra.y, f.til.y, t) - Math.sin(t * Math.PI) * 50,
            h: NK.lerp(f.fra.h, f.til.h, t)
        };
    };

    /* ----- Panelet ------------------------------------------------------------ */
    P.bygPanel = function () {
        var mig = this;
        this.el = {
            prompt: NK.el("montre-prompt"),
            spm: NK.el("montre-spm"),
            raekker: NK.el("montre-raekker"),
            besked: NK.el("montre-besked"),
            knap: NK.el("montre-knap"),
            kort: NK.el("montre-kort"),
            perioder: NK.el("montre-perioder"),
            nulstil: NK.el("montre-nulstil")
        };
        this.el.knap.addEventListener("click", function () { mig.knap(); });
        NK.el("montre-spring").addEventListener("click", function () { mig.springIntro(); mig.fokus(); });
        this.bygTilbud();

        var SPAEND = ["H og He", "Li til Ne", "Na til Ar", "K til Kr"];
        D.PERIODER.forEach(function (p, nr) {
            var knap = document.createElement("button");
            knap.type = "button";
            knap.className = "hyldelinje";
            knap.innerHTML = '<span class="hl-farve" style="background:' + ["#9fb8d8", "#9fd8a9", "#d8d39f", "#c7a9dd"][nr] + '"></span>' +
                '<span class="hl-navn">' + p.navn + '<em>' + SPAEND[nr] + '</em></span>' +
                '<span class="hl-tal" id="montre-p-tal-' + p.nr + '"></span>' +
                '<span class="hl-stjerner" id="montre-p-stj-' + p.nr + '"></span>';
            knap.addEventListener("click", function () { mig.vaelgPeriode(p.nr); });
            mig.el.perioder.appendChild(knap);
        });

        this.nulstilSikker = 0;
        this.el.nulstil.addEventListener("click", function () {
            if (mig.nulstilSikker > 0) {
                mig.nulstilSikker = 0;
                mig.nulstilAlt();
            } else {
                mig.nulstilSikker = 3;
            }
            mig.visNulstil();
        });
    };

    P.visNulstil = function () {
        NK.saetHTML("montre-nulstil", this.nulstilSikker > 0
            ? "<span>Sikker? Klik igen</span><span class=\"tegn\">↺</span>"
            : "<span>Tøm udstillingen</span><span class=\"tegn\">↺</span>");
    };

    P.vaelgPeriode = function (p) {
        var mig = this;
        var liste = D.GRUNDSTOFFER.filter(function (g) { return g.periode === p; });
        var uloest = liste.filter(function (g) { return !mig.status[g.z].loest; });
        this.vaelg((uloest[0] || liste[0]).z);
    };

    P.opdaterFremskridt = function () {
        for (var p = 1; p <= 4; p++) {
            NK.saetTekst("montre-p-tal-" + p, this.antalLoest(p) + "/" + D.PERIODER[p - 1].antal);
            var s = this.antalStjerner(p);
            NK.saetTekst("montre-p-stj-" + p, s ? "★ " + s : "");
        }
        NK.saetTekst("montre-loest", String(this.antalLoest()));
    };

    /* ----- Opgaven --------------------------------------------------------- */

    /* Tager proeve z op paa bordet. Den forrige gaar tilbage i kassen,
       eller, hvis den er loest, i montren. */
    P.vaelg = function (z, straks) {
        if (z === this.valgt && this.opg) return;
        var lay = this.lay, forrige = this.valgt, o = this.opg;
        /* Den forrige: en loest proeve gaar i montren, en uloest i kassen */
        if (forrige && o && lay) {
            var gf = D.efterZ(forrige);
            var fraB = this.nuPos(gf);
            this.valgt = z;
            if (this.status[forrige].loest) {
                if (!o.placeret) this.flyt(forrige, fraB, this.montrePos(gf), "montre");
            } else {
                this.flyt(forrige, fraB, this.kassePlads(forrige), "kasse");
            }
        }
        this.valgt = z;
        var g = D.efterZ(z);
        var loest = this.status[z].loest;
        if (lay && !straks && !loest) {
            var fra = this.flyv.filter(function (f) { return f.z === z; })[0];
            var start = fra ? this.flyvPos(fra) : this.kasseSlotFor(z);
            start.slags = "kasse";
            this.flyt(z, start, this.bordPos(g), "bord");
        }
        this.nyOpgave(loest);
        this.visStatus();
        return g;
    };

    /* Hvor proeven stod i kassen, foer den blev taget */
    P.kasseSlotFor = function (z) {
        var p = this.kassePos[z];
        var g = D.efterZ(z);
        if (p) return { x: p.x, y: p.y, h: p.h };
        var s = this.kasseSlot(g, 0);
        return { x: s.x, y: s.y, h: s.h };
    };

    /* Hvor den valgte proeve staar lige nu */
    P.nuPos = function (g) {
        var f = this.flyv.filter(function (x) { return x.z === g.z; })[0];
        var p = f ? this.flyvPos(f) : (this.opg && this.opg.placeret ? this.montrePos(g) : this.bordPos(g));
        p.slags = this.opg && this.opg.placeret ? "montre" : "bord";
        return p;
    };

    P.nyOpgave = function (gennemsyn) {
        var g = D.efterZ(this.valgt);
        var felter = [{ slags: g.mangler }, { slags: "plads" }];
        if (!g.ovg) felter.push({ slags: "struktur" });
        felter.forEach(function (f, i) { f.i = i; f.status = "laast"; f.forsoeg = 0; });
        this.opg = {
            g: g, felter: felter, k: 0, hjaelp: 0, brugtSvar: false,
            faerdig: false, gennemsyn: !!gennemsyn, placeret: !!gennemsyn
        };
        this.hintRinge = 0;
        this.periodeHint = false;
        this.tavlePuls = null;
        this.besked("", "");
        this.traek = null;
        if (gennemsyn) {
            var mig = this;
            felter.forEach(function (f) { f.status = "ok"; f.vaerdi = mig.korrekt(f); });
            this.opg.faerdig = true;
            this.besked(this.status[g.z].stjerne ? "Løst uden hjælp. ★" : "Løst.", "god");
        } else {
            this.opdaterFelter();
        }
        this.bygRaekker();
        this.visKort();
        this.visStatus();
        if (!gennemsyn) this.fokus();
    };

    function klaret(f) { return f.status === "ok" || f.status === "svar"; }

    /* Det foerste uloeste felt er aktivt. Pladsen kan dog findes naar som
       helst: dens felt er aabent, ogsaa naar det ikke er det aktive. */
    P.opdaterFelter = function () {
        var fundet = false;
        this.opg.felter.forEach(function (f) {
            if (klaret(f)) return;
            if (!fundet) { f.status = "aktiv"; fundet = true; }
            else f.status = f.slags === "plads" ? "aaben" : "laast";
        });
    };

    P.pladsFelt = function () {
        var o = this.opg;
        if (!o) return null;
        for (var i = 0; i < o.felter.length; i++) if (o.felter[i].slags === "plads") return o.felter[i];
        return null;
    };

    /* Kan proeven paa bordet saettes paa plads nu? */
    P.kanPlaceres = function () {
        var o = this.opg, pf = this.pladsFelt();
        return !!(o && !o.faerdig && !o.placeret && pf && !klaret(pf) && !this.flyverTil(o.g.z, "montre"));
    };

    P.korrekt = function (f) {
        var g = this.opg.g;
        if (f.slags === "navn") return g.navn;
        if (f.slags === "symbol") return g.s;
        if (f.slags === "plads") return D.pladsTekst(g);
        return g.struktur;
    };

    P.aktivtFelt = function () {
        var o = this.opg;
        if (!o || o.faerdig) return null;
        for (var i = 0; i < o.felter.length; i++) if (!klaret(o.felter[i])) return o.felter[i];
        return null;
    };

    P.bygRaekker = function () {
        var mig = this, o = this.opg;
        var vaert = this.el.raekker;
        vaert.innerHTML = "";
        o.felter.forEach(function (f) {
            var rk = document.createElement("div");
            rk.className = "raekke" + (f.slags === "struktur" ? " slut" : "");
            rk.innerHTML = '<div class="raekke-hoved"><span class="raekke-etiket">' + ETIKET[f.slags] + "</span></div>" +
                '<div class="felter"></div>';
            var felterEl = rk.querySelector(".felter");
            var fe = document.createElement("div");
            fe.className = "felt " + f.status + (f.slags === "plads" ? " klikfelt" : "");
            if (f.status === "ok" || f.status === "svar") {
                fe.innerHTML = '<span class="felt-svar">' + NK.html(f.vaerdi) + '</span><span class="felt-maerke">' +
                    (f.status === "ok" ? "✓" : "↩") + "</span>";
                fe.title = f.status === "ok" ? "Rigtigt" : "Svaret blev vist";
            } else if (f.slags === "plads") {
                fe.innerHTML = '<span class="felt-klik">Træk prøven op på sin plads</span><span class="felt-pil" aria-hidden="true">↖</span>';
            } else {
                fe.innerHTML = '<input type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"' +
                    ' aria-label="' + ETIKET[f.slags] + '" placeholder="' + PLADSHOLDER[f.slags] + '"' +
                    (f.status === "aktiv" ? "" : " disabled") + '>' +
                    '<button type="button" class="felt-ok" aria-label="Tjek svaret" tabindex="-1"' +
                    (f.status === "aktiv" ? "" : " disabled") + '>↵</button>';
                var inp = fe.querySelector("input");
                inp.addEventListener("keydown", function (e) {
                    if (e.key === "Enter") { e.preventDefault(); mig.tjek(); }
                });
                inp.addEventListener("focus", function () { mig.fokuseret = true; });
                inp.addEventListener("blur", function () { mig.fokuseret = false; });
                fe.querySelector(".felt-ok").addEventListener("click", function () { mig.tjek(); });
                f.input = inp;
            }
            f.feltEl = fe;
            felterEl.appendChild(fe);
            vaert.appendChild(rk);
        });
    };

    P.fokus = function () {
        var f = this.aktivtFelt();
        if (f && f.input && NK.el("fane-montre").classList.contains("aktiv") &&
            !document.querySelector(".overlay.vis") && !(NK.Rundvisning && NK.Rundvisning.aktiv())) {
            try { f.input.focus({ preventScroll: true }); } catch (e) { f.input.focus(); }
        }
    };

    P.visKort = function () {
        var o = this.opg, g = o.g;
        NK.saetTekst("montre-hoved", o.gennemsyn ? "Prøve i udstillingen" : "Prøve fra kassen");
        NK.saetTekst("montre-prompt", o.gennemsyn || o.felter[0].status !== "aktiv" && o.felter[0].status !== "laast"
            ? g.s + "  " + g.navn
            : (g.mangler === "navn" ? g.s : g.navn));
        var spm = g.mangler === "navn" ? "Skriv navnet" : "Skriv symbolet";
        spm += g.ovg ? ", og træk prøven op på sin plads." : ", træk prøven op på sin plads, og skriv elektronstrukturen.";
        NK.saetTekst("montre-spm", spm);
        this.el.kort.classList.toggle("sejr", o.faerdig && !o.gennemsyn);
        this.visKnap();
        this.opdaterFremskridt();
    };

    P.visKnap = function () {
        var o = this.opg, tekst, klasse = "knap blaa";
        if (o.faerdig) {
            if (o.gennemsyn) tekst = "Øv prøven igen";
            else { tekst = "Næste prøve →"; klasse += " banker"; }
        } else {
            tekst = o.hjaelp === 0 ? "Giv hint" : "Vis svaret";
            klasse = "knap";
        }
        this.el.knap.textContent = tekst;
        this.el.knap.className = klasse;
    };

    P.besked = function (html, klasse) {
        this.el.besked.innerHTML = html;
        this.el.besked.className = "besked" + (klasse ? " " + klasse : "");
    };

    /* Hint -> svar -> naeste proeve, eller: oev den loeste proeve igen */
    P.knap = function () {
        var o = this.opg;
        if (o.faerdig) {
            if (o.gennemsyn) this.oevIgen();
            else this.vaelg(this.naesteUloeste(this.valgt));
            return;
        }
        var f = this.aktivtFelt();
        var h = D.hjaelp(o.g, f.slags);
        if (o.hjaelp === 0) {
            o.hjaelp = 1;
            this.besked("<b>Hint:</b> " + h.hint, "gul");
            if (h.plakat) this.tavlePuls = { t: 0 };
            if (h.skaller) this.hintRinge = o.g.periode;
            if (f.slags === "plads") this.periodeHint = true;
            this.visKnap();
            this.fokus();
        } else {
            o.brugtSvar = true;
            this.feltRigtigt(f, "svar");
            this.besked(h.svar, "gul");
        }
    };

    /* Den loeste proeve kommer ned paa bordet igen og loeses forfra.
       Den er stadig loest og beholder stjernen. */
    P.oevIgen = function () {
        var g = this.opg.g;
        var fra = this.montrePos(g);
        fra.slags = "montre";
        this.nyOpgave(false);
        this.flyt(g.z, fra, this.bordPos(g), "bord");
        this.visStatus();
    };

    /* Hintet faar navnetavlen til at lyse, men tavlen i stort format
       peger ikke selv paa grundstoffet: saa ville den give svaret. */
    P.fremhaevning = function () {
        return null;
    };

    P.tjek = function () {
        var o = this.opg, f = this.aktivtFelt();
        if (!f || f.slags === "plads") return;
        var g = o.g, raa = f.input ? f.input.value : "";
        var res;
        if (f.slags === "navn") res = Tj.navn(raa, g);
        else if (f.slags === "symbol") res = Tj.symbol(raa, g);
        else res = Tj.struktur(raa, g);

        if (res.tom) { this.besked(res.besked, ""); this.fokus(); return; }
        if (res.ok) {
            this.feltRigtigt(f, "ok");
            if (res.note) this.besked(res.note, "gul");
            return;
        }
        f.forsoeg++;
        this.besked(res.besked, "skidt");
        this.ryst(f);
        this.fokus();
    };

    P.ryst = function (f) {
        if (!f.feltEl) return;
        f.feltEl.classList.remove("ryst");
        void f.feltEl.offsetWidth;
        f.feltEl.classList.add("ryst");
    };

    /* Proeven lander paa rum z: efter et traek (fra er der, den blev
       sluppet) eller et klik paa rummet. Pladsen kan findes naar som helst,
       ogsaa foer navnet. Et forkert rum sender den tilbage paa bordet. */
    P.proevPlads = function (z, fra) {
        var o = this.opg, pf = this.pladsFelt();
        if (!this.kanPlaceres()) return false;
        var g = o.g, andet = D.efterZ(z);
        if (z === g.z) {
            this.blink[z] = { farve: "63, 174, 114", a: 1 };
            this.feltRigtigt(pf, "ok", fra);
            return true;
        }
        pf.forsoeg++;
        this.blink[z] = { farve: "224, 84, 70", a: 1 };
        var tekst;
        if (this.inde(z)) {
            tekst = "Den plads er optaget af " + andet.s + ", " + andet.navn + ".";
        } else {
            var kendt = klaret(o.felter[0]) || g.mangler === "navn";
            tekst = "Skiltet siger " + andet.s + ". " + (kendt ? "Find skiltet med " + g.s + "." : "Find symbolet for " + g.navn + " først.");
        }
        this.besked(tekst, "skidt");
        this.ryst(pf);
        if (fra) {
            fra.slags = "bord";
            this.flyt(g.z, fra, this.bordPos(g), "bord");
        }
        return false;
    };

    /* Et klik paa et rum i montren (samme som at slippe proeven dér) */
    P.klikPlads = function (z) {
        return this.proevPlads(z, null);
    };

    /* Et felt er klaret, enten rigtigt eller ved at se svaret.
       fra: hvor proeven blev sluppet, naar pladsen er fundet ved et traek */
    P.feltRigtigt = function (f, maade, fra) {
        var o = this.opg;
        f.status = maade;
        f.vaerdi = this.korrekt(f);
        o.hjaelp = 0;
        this.tavlePuls = null;
        this.periodeHint = false;
        this.hintRinge = 0;
        this.besked("", "");
        if (f.slags === "plads") {
            var g = o.g;
            var start = fra || this.nuPos(g);
            start.slags = "bord";
            o.placeret = true;
            this.traek = null;
            this.flyt(g.z, start, this.montrePos(g), "montre");
        }
        if (this.aktivtFelt()) {
            this.opdaterFelter();
        } else {
            this.loes();
        }
        this.bygRaekker();
        this.visKort();
        this.visStatus();
        this.fokus();
    };

    /* Hele proeven er loest */
    P.loes = function () {
        var o = this.opg, z = o.g.z;
        o.faerdig = true;
        var s = this.status[z];
        var foer = s.loest;
        s.loest = true;
        s.stjerne = s.stjerne || !o.brugtSvar;
        this.gem();
        if (this.afvisTilbud) this.afvisTilbud();
        var p = o.g.periode;
        if (!foer && this.antalLoest(p) === D.PERIODER[p - 1].antal && !this.rost[p]) {
            this.rost[p] = true;
            this.ventRos = { t: 1.6, periode: p, alt: this.antalLoest() === 36 };
        }
    };

    /* Linjen under scenen siger, hvad der skal ske nu. Er proeven loest,
       staar der i stedet, hvor man moeder stoffet. */
    P.visStatus = function () {
        var o = this.opg;
        if (!o) return;
        if (o.faerdig) {
            NK.saetHTML("montre-status", "<b>" + NK.html(o.g.s + " " + o.g.navn) + "</b> · " + NK.html(o.g.fakta));
            return;
        }
        var g = o.g, mangler = !klaret(o.felter[0]);
        var hvad = g.mangler === "navn" ? "navnet" : "symbolet";
        var tekst;
        if (mangler && !o.placeret) tekst = "Skriv " + hvad + " i feltet til højre, og træk prøven op på sin plads.";
        else if (mangler) tekst = "Skriv " + hvad + " i feltet til højre.";
        else if (!o.placeret) tekst = "Træk prøven op på sin plads. Symbolet står på skiltet.";
        else tekst = "Skriv elektronstrukturen i feltet til højre. Tavlen tegner den.";
        NK.saetHTML("montre-status", tekst);
    };

    P.nulstil = function () {
        if (!this.opg) return;
        if (this.opg.faerdig && !this.opg.gennemsyn) return;
        var g = this.opg.g;
        if (this.opg.placeret && !this.opg.gennemsyn) {
            var fra = this.montrePos(g);
            fra.slags = "montre";
            this.nyOpgave(false);
            this.flyt(g.z, fra, this.bordPos(g), "bord");
            return;
        }
        if (this.opg.gennemsyn) { this.oevIgen(); return; }
        this.nyOpgave(false);
    };

    P.nulstilAlt = function () {
        var s = this.status;
        Object.keys(s).forEach(function (z) { s[z].loest = false; s[z].stjerne = false; });
        this.rost = {};
        this.gem();
        this.flyv = [];
        this.kassePos = {};
        this.valgt = 0;
        this.opg = null;
        this.vaelg(1, true);
    };

    /* ----- Kemichaels praesentation ----------------------------------------
       Tilbuddet med Start praesentation og Nej tak: js/praesentation.js */
    NK.Praesentation.kobl(P, { noegle: "nk-sc1.2-intro-montre", tilbud: "montre-tilbud", spring: "montre-spring" });

    /* Mens han siger, at svarene skrives til hoejre, lyser feltet */
    P.pegPaaFelt = function (til) {
        var f = this.aktivtFelt();
        if (f && f.feltEl) f.feltEl.classList.toggle("peg", til);
    };

    P.enter = function () {
        if (this.opg && this.opg.faerdig && !this.opg.gennemsyn) this.knap();
    };

    /* ----- Tegneloekken ------------------------------------------------------ */
    P.opdater = function (dt) {
        this.tid += dt;
        var mig = this;
        this.flyv.forEach(function (f) { f.t += dt; });
        var faerdige = this.flyv.filter(function (f) { return f.t >= FLYV_TID; });
        this.flyv = this.flyv.filter(function (f) { return f.t < FLYV_TID; });
        faerdige.forEach(function (f) { if (f.efter) f.efter.call(mig); });

        Object.keys(this.blink).forEach(function (z) {
            mig.blink[z].a -= dt * 1.4;
            if (mig.blink[z].a <= 0) delete mig.blink[z];
        });
        if (this.tavlePuls) this.tavlePuls.t += dt;
        if (this.nulstilSikker > 0) {
            this.nulstilSikker -= dt;
            if (this.nulstilSikker <= 0) { this.nulstilSikker = 0; this.visNulstil(); }
        }

        /* Proeverne i kassen glider paa plads, naar en bliver taget */
        if (this.lay) {
            this.iKassen().forEach(function (z, i) {
                var s = mig.kasseSlot(D.efterZ(z), i);
                var p = mig.kassePos[z];
                if (!p) { mig.kassePos[z] = { x: s.x, y: s.y, h: s.h }; return; }
                p.x = NK.mod(p.x, s.x, 10, dt);
                p.y = NK.mod(p.y, s.y, 10, dt);
                p.h = NK.mod(p.h, s.h, 10, dt);
            });
        }

        if (this.ventRos) {
            this.ventRos.t -= dt;
            if (this.ventRos.t <= 0 && this.laererPeriode) {
                var v = this.ventRos;
                this.ventRos = null;
                this.laererPeriode(v.periode, v.alt);
            }
        }
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
    };

    P.tegn = function () {
        var L = this.L, ctx = L.ctx, lay = this.lay;
        if (!lay) return;
        var mig = this, o = this.opg, f = this.aktivtFelt();
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 6);

        /* Montren */
        var struktur = f && f.slags === "struktur";
        var faerdigStruktur = o && o.faerdig && !o.g.ovg;
        var lysP = (struktur || faerdigStruktur || this.periodeHint) && o ? o.g.periode : 0;
        var lysG = (struktur || faerdigStruktur) && o && !o.g.ovg ? o.g.soejle : 0;
        var overRum = this.over && this.over.slags === "rum" ? this.over.z : 0;
        var tavleLys = this.over && this.over.slags === "navne" ? 1 : 0;
        if (this.tavlePuls) tavleLys = Math.max(tavleLys, 0.45 + 0.45 * Math.sin(this.tavlePuls.t * 6));
        Tg.montre(ctx, lay.m, {
            tid: this.tid,
            inde: function (z) { return mig.inde(z); },
            stjerne: function (z) { return mig.status[z].stjerne && mig.inde(z); },
            lys: overRum,
            blink: this.blink,
            periodeLys: lysP,
            gruppeLys: lysG,
            tavleLys: tavleLys
        });
        /* Den valgte proeves rum har en fast ramme, naar den staar der */
        if (o && o.placeret) {
            var vr = lay.m.rum[o.g.z];
            ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
            ctx.lineWidth = 1.5;
            NK.rundtRekt(ctx, vr.x - 1, vr.y - 1, vr.b + 2, vr.h + 2, 4);
            ctx.stroke();
        }

        /* Tavlen med atommodellen */
        this.tegnTavle(ctx);

        /* Bordet, kassen, koppen */
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.H + 10);
        this.tegnKasse(ctx);
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand) {
            var kk = NK.klamp(lay.H / 600, 0.8, 1.4);
            NK.Sprites.tegn(ctx, "kaffekop", lay.kop.x - 18 * kk, lay.kop.y - 40 * kk, 42 * kk, 40 * kk);
            if (this.over && this.over.slags === "kop") {
                ctx.strokeStyle = "rgba(242, 197, 61, 0.8)";
                ctx.lineWidth = 2;
                NK.rundtRekt(ctx, lay.kop.x - 22 * kk, lay.kop.y - 44 * kk, 50 * kk, 46 * kk, 6);
                ctx.stroke();
            }
        }

        /* Proeven paa bordet og dens maerke. Kan den flyttes, lyser den
           svagt, og en lille pil peger op mod udstillingen. */
        var traek = this.traek && this.traek.flyttet ? this.traek : null;
        if (o && !o.placeret && !traek && !this.flyverTil(o.g.z, "bord")) {
            var bp = this.bordPos(o.g);
            var lysP = this.over && this.over.slags === "proeve" ? 1 : 0;
            var r = Tg.proeve(ctx, o.g, bp.x, bp.y, bp.h, { tid: this.tid, lys: lysP });
            this.tegnMaerke(ctx, r);
            if (this.kanPlaceres()) {
                var hop = Math.sin(this.tid * 3.2) * 4;
                Tg.pilOp(ctx, bp.x, r.y - 12 + hop, NK.klamp(bp.h * 0.06, 6, 10), "rgba(242, 197, 61, 0.85)");
            }
        }

        /* Proever i luften */
        this.flyv.forEach(function (fl) {
            var p = mig.flyvPos(fl);
            Tg.proeve(ctx, D.efterZ(fl.z), p.x, p.y, p.h, { tid: mig.tid, skygge: false });
        });

        /* Proeven, der bliver trukket: den bliver mindre paa vej op */
        if (traek && o) {
            var tp = this.traekPos();
            Tg.proeve(ctx, o.g, tp.x, tp.y, tp.h, { tid: this.tid, skygge: false });
        }

        this.tegnBobler(ctx);
        if (this.laererTegnOver) this.laererTegnOver(ctx);
    };

    P.tegnKasse = function (ctx) {
        var lay = this.lay, k = lay.kasse, mig = this;
        Tg.kasseBag(ctx, k.x, k.y, k.b, k.h);
        var liste = this.iKassen();
        var km = this.kasseMaal();
        var overZ = this.over && this.over.slags === "kasse" ? this.over.z : 0;
        /* Bageste raekke foerst */
        [1, 0].forEach(function (raekke) {
            liste.forEach(function (z, i) {
                if (i >= km.soejler * 2) return;
                var r = i < km.soejler ? 0 : 1;
                if (r !== raekke || mig.flyverTil(z, "bord")) return;
                if (mig.flyv.some(function (f) { return f.z === z; })) return;
                var p = mig.kassePos[z] || mig.kasseSlot(D.efterZ(z), i);
                Tg.proeve(ctx, D.efterZ(z), p.x, p.y, p.h, { tid: mig.tid, skygge: false, lys: overZ === z ? 1 : 0 });
            });
        });
        Tg.kasseFor(ctx, k.x, k.y, k.b, k.h, liste.length ? liste.length + (liste.length === 1 ? " prøve" : " prøver") : "tom");
    };

    /* Maerket med symbolet og navnet. Den halvdel, der mangler, viser det,
       eleven skriver, med blaek. */
    P.tegnMaerke = function (ctx, r) {
        var lay = this.lay, o = this.opg, g = o.g;
        var mb = lay.maerke.b, mh = lay.maerke.h;
        var x = r.x + r.b + 16, y = lay.bordY - r.h * 0.5 - mh * 0.5;
        y = Math.min(y, lay.bordY - mh - 6);
        var f0 = o.felter[0];
        var skriv = f0.status === "aktiv";
        var blaek = "#1f4fa8";
        var symLinje = { t: g.s, px: NK.klamp(mh * 0.44, 14, 34), vaegt: "800" };
        var navnLinje = { t: g.navn, px: NK.klamp(mh * 0.26, 11, 19), vaegt: "600" };
        if (skriv) {
            var raa = f0.input ? f0.input.value : "";
            var markoer = this.fokuseret && Math.floor(this.tid * 2) % 2 === 0 ? "|" : "";
            var linje = g.mangler === "navn" ? navnLinje : symLinje;
            linje.streg = true;
            if (raa) { linje.t = raa + markoer; linje.farve = blaek; linje.vaegt = "italic 600"; }
            else { linje.t = markoer || "?"; linje.farve = markoer ? blaek : "rgba(60, 50, 30, 0.35)"; }
        }
        Tg.maerke(ctx, x, y, mb, mh, r.x + r.b * 0.62, r.y + Math.min(8, r.h * 0.1), [symLinje, navnLinje]);
    };

    P.tegnTavle = function (ctx) {
        var lay = this.lay, t = lay.tavle, o = this.opg;
        var ind = Tg.tavle(ctx, t.x, t.y, t.b, t.h);
        if (!o) return;
        var g = o.g, f = this.aktivtFelt();
        var kendt = o.felter[0].status !== "aktiv" && o.felter[0].status !== "laast";
        /* Teksten til hoejre skal have mindst 120 px; modellen tager resten */
        var R = NK.klamp(Math.min(ind.h * 0.46, ind.b * 0.27, (ind.b - 150) / 2), 30, 200);
        var cx = ind.x + R + NK.klamp(ind.b * 0.06, 8, 24), cy = ind.y + ind.h * 0.5;
        var tekstX = cx + R + NK.klamp(ind.b * 0.06, 10, 26);
        var tekstB = ind.x + ind.b - tekstX - 6;
        var liste = [], faerdig = false, skrevet = "";
        var fs = null;
        o.felter.forEach(function (x) { if (x.slags === "struktur") fs = x; });

        if (g.ovg) {
            Tg.bohr(ctx, cx, cy, R, g.z, [], { kerne: kendt ? g.z + "+" : "?", tid: this.tid });
            if (kendt) this.tavleTekst(ctx, tekstX, tekstB, ind, [{ t: "overgangsmetal", px: 16 }]);
            return;
        }
        if (fs && (fs.status === "ok" || fs.status === "svar")) {
            liste = g.skaller;
            faerdig = true;
            skrevet = g.struktur;
        } else if (f && f.slags === "struktur") {
            skrevet = f.input ? f.input.value : "";
            liste = Tj.laesStruktur(skrevet) || [];
        }
        Tg.bohr(ctx, cx, cy, R, g.z, liste, {
            kerne: kendt ? g.z + "+" : "?",
            ringe: this.hintRinge,
            faerdig: faerdig,
            tid: this.tid
        });

        var linjer = [];
        if (f && f.slags === "struktur") {
            var markoer = this.fokuseret && Math.floor(this.tid * 2) % 2 === 0 ? "|" : "";
            linjer.push({ t: (skrevet || "") + markoer || "?", px: 24, farve: skrevet ? Tg.KRIDT : "rgba(238, 242, 234, 0.4)" });
            var sum = liste.reduce(function (a, b) { return a + b; }, 0);
            if (liste.length) linjer.push({ t: sum + " af " + g.z + " elektroner", kort: sum + " af " + g.z, px: 14, farve: sum === g.z ? "#b8f0cf" : "rgba(238, 242, 234, 0.7)" });
        } else if (faerdig) {
            /* Pladsen og strukturen side om side: skaller = periode,
               elektroner i den yderste = hovedgruppe */
            var yderst = g.skaller[g.skaller.length - 1];
            var n = g.skaller.length;
            linjer.push({ t: g.struktur, px: 26 });
            linjer.push({ t: n + (n === 1 ? " skal" : " skaller"), px: 15, luft: 6 });
            linjer.push({ t: g.periode + ". periode", px: 15, farve: "#f7d774" });
            if (g.z !== 2) {
                linjer.push({ t: yderst + " i den yderste", px: 15, luft: 6 });
                linjer.push({ t: "hovedgruppe " + g.hg, px: 15, farve: "#f7d774" });
            } else {
                linjer.push({ t: "fuld skal", px: 15, luft: 6 });
                linjer.push({ t: "ædelgas", px: 15, farve: "#f7d774" });
            }
        }
        this.tavleTekst(ctx, tekstX, tekstB, ind, linjer);
    };

    /* Linjerne til hoejre for modellen, lodret centreret */
    P.tavleTekst = function (ctx, x, b, ind, linjer) {
        if (!linjer.length || b < 40) return;
        var samlet = 0;
        linjer.forEach(function (l) { samlet += l.px * 1.45 + (l.luft || 0); });
        var y = ind.y + (ind.h - samlet) / 2;
        ctx.save();
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        linjer.forEach(function (l) {
            y += l.luft || 0;
            var tekst = l.t;
            NK.passendeSkrift(ctx, tekst, b, l.px, 12, l.px > 18 ? "700" : "600");
            if (l.kort && ctx.measureText(tekst).width > b) {
                tekst = l.kort;
                NK.passendeSkrift(ctx, tekst, b, l.px, 12, "600");
            }
            ctx.fillStyle = l.farve || Tg.KRIDT;
            ctx.fillText(tekst, x, y + l.px * 0.72);
            y += l.px * 1.45;
        });
        ctx.restore();
    };

    P.tegnBobler = function (ctx) {
        var u = this.over, lay = this.lay;
        if (!u) return;
        if (u.slags === "kasse") {
            var g = D.efterZ(u.z), p = this.kassePos[u.z];
            if (!p) return;
            Tg.boble(ctx, p.x, p.y - p.h - 4, [
                { t: g.mangler === "navn" ? g.s : g.navn, px: 15 },
                { t: g.mangler === "navn" ? "Mangler navnet" : "Mangler symbolet", px: 12, vaegt: "400", farve: "#a9b0ba" }
            ], lay.W, p.y);
        } else if (u.slags === "rum" && this.inde(u.z)) {
            var g2 = D.efterZ(u.z), r = lay.m.rum[u.z];
            var linjer = [{ t: g2.s + "  " + g2.navn, px: 15 }];
            var s = this.status[u.z];
            var info = g2.ovg ? "overgangsmetal" : g2.struktur;
            if (s.loest) info += s.stjerne ? " · løst uden hjælp ★" : " · løst";
            linjer.push({ t: info, px: 12, vaegt: "400", farve: s.loest ? "#7ee0a8" : "#a9b0ba" });
            Tg.boble(ctx, r.x + r.b / 2, r.y - 2, linjer, lay.W, r.y + r.h);
        }
    };

    /* ----- Musen ---------------------------------------------------------------- */
    P.hvadErUnder = function (pt) {
        var lay = this.lay;
        if (!lay) return null;
        if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return { slags: "laerer" };
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand && Math.abs(pt.x - lay.kop.x) < 30 && pt.y < lay.kop.y + 4 && pt.y > lay.kop.y - 60) {
            return { slags: "kop" };
        }
        if (Tg.overTavle(lay.m, pt.x, pt.y)) return { slags: "navne" };
        var z = Tg.montreRum(lay.m, pt.x, pt.y);
        if (z) {
            if (this.kanPlaceres()) return { slags: "rum", z: z };
            if (this.inde(z)) return { slags: "rum", z: z };
            return null;
        }
        if (this.proeveUnder(pt)) return { slags: "proeve" };
        /* Proeverne i kassen: den forreste raekke oeverst */
        var liste = this.iKassen(), km = this.kasseMaal(), bedst = null;
        for (var i = 0; i < liste.length && i < km.soejler * 2; i++) {
            var p = this.kassePos[liste[i]];
            if (!p) continue;
            var b = Tg.proeveBredde(D.efterZ(liste[i]), p.h);
            if (pt.x >= p.x - b / 2 - 2 && pt.x <= p.x + b / 2 + 2 && pt.y >= p.y - p.h - 2 && pt.y <= p.y + 2) {
                if (!bedst || i < km.soejler) bedst = liste[i];
            }
        }
        if (bedst) return { slags: "kasse", z: bedst };
        return null;
    };

    /* Er (pt) over proeven paa bordet? */
    P.proeveUnder = function (pt) {
        var o = this.opg;
        if (!o || o.placeret || this.flyv.some(function (f) { return f.z === o.g.z; })) return false;
        var bp = this.bordPos(o.g), b = Tg.proeveBredde(o.g, bp.h);
        return pt.x >= bp.x - b / 2 - 6 && pt.x <= bp.x + b / 2 + 6 && pt.y >= bp.y - bp.h - 6 && pt.y <= bp.y + 4;
    };

    /* Hvor den trukne proeve staar: under musen, og mindre jo hoejere
       den kommer op, saa den passer i rummet, naar den er der */
    P.traekPos = function () {
        var t = this.traek, lay = this.lay, g = this.opg.g;
        var bp = this.bordPos(g), mp = this.montrePos(g);
        var bund = lay.m.y + lay.m.h;
        var andel = NK.klamp((t.y - bund) / Math.max(40, lay.bordY - bp.h * 0.5 - bund), 0, 1);
        var h = NK.lerp(mp.h * 1.25, bp.h, andel);
        return { x: t.x - t.rx * h, y: t.y - t.ry * h, h: h };
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;

        /* Proeven kan traekkes op i udstillingen */
        c.addEventListener("pointerdown", function (e) {
            mig.efterTraek = false;
            if (e.button !== 0) return;
            var pt = mig.L.punkt(e);
            if (mig.laererUnder && mig.laererUnder(pt.x, pt.y)) return;
            if (!mig.proeveUnder(pt)) return;
            var bp = mig.bordPos(mig.opg.g);
            mig.traek = { x: pt.x, y: pt.y, x0: pt.x, y0: pt.y, flyttet: false,
                rx: (pt.x - bp.x) / bp.h, ry: (pt.y - bp.y) / bp.h };
            try { c.setPointerCapture(e.pointerId); } catch (ex) { /* ikke vigtigt */ }
        });
        c.addEventListener("pointermove", function (e) {
            var pt = mig.L.punkt(e);
            var t = mig.traek;
            if (t) {
                t.x = pt.x;
                t.y = pt.y;
                if (!t.flyttet && Math.abs(pt.x - t.x0) + Math.abs(pt.y - t.y0) > 6 && mig.kanPlaceres()) t.flyttet = true;
                var z = mig.lay ? Tg.montreRum(mig.lay.m, pt.x, pt.y) : 0;
                mig.over = z ? { slags: "rum", z: z } : null;
                c.style.cursor = "grabbing";
                return;
            }
            mig.over = mig.hvadErUnder(pt);
            c.style.cursor = !mig.over ? "default" : (mig.over.slags === "proeve" && mig.kanPlaceres() ? "grab" : "pointer");
        });
        c.addEventListener("pointerup", function (e) {
            var t = mig.traek;
            if (!t) return;
            mig.traek = null;
            var pt = mig.L.punkt(e);
            if (!t.flyttet) {
                /* Et klik paa proeven: sig, hvad man kan */
                mig.besked(mig.kanPlaceres() ? "Træk prøven op på sin plads i udstillingen." : "Prøven står på bordet.", "gul");
                mig.efterTraek = true;
                return;
            }
            mig.efterTraek = true;
            mig.traek = t;
            var fra = mig.traekPos();
            mig.traek = null;
            var z = mig.lay ? Tg.montreRum(mig.lay.m, pt.x, pt.y) : 0;
            if (z) {
                mig.proevPlads(z, fra);
            } else {
                fra.slags = "bord";
                mig.flyt(mig.opg.g.z, fra, mig.bordPos(mig.opg.g), "bord");
            }
            mig.over = null;
        });
        c.addEventListener("pointercancel", function () { mig.traek = null; });
        c.addEventListener("pointerleave", function () { if (!mig.traek) { mig.over = null; c.style.cursor = "default"; } });

        c.addEventListener("click", function (e) {
            if (mig.efterTraek) { mig.efterTraek = false; return; }
            var pt = mig.L.punkt(e);
            if (mig.laererIntroKlik && mig.laererIntroKlik(pt.x, pt.y)) return;
            if (mig.laererKlik && mig.laererKlik(pt.x, pt.y)) return;
            var u = mig.hvadErUnder(pt);
            if (!u) return;
            if (u.slags === "kop" && mig.klikKop) { mig.klikKop(); return; }
            if (u.slags === "navne") { NK.Opslag.aabn(mig.fremhaevning()); return; }
            if (u.slags === "kasse") { mig.vaelg(u.z); return; }
            if (u.slags === "rum") {
                if (mig.kanPlaceres()) mig.klikPlads(u.z);
                else if (u.z !== mig.valgt) mig.vaelg(u.z);
            }
        });
    };

    NK.SimMontre = SimMontre;
}());
