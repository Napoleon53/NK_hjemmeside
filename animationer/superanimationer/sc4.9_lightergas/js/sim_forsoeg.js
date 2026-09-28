/* =====================================================================
   sim_forsoeg.js - fane 1: forsoeget

   Paa bordet staar en vaegt, en rulle koekkenrulle og et kar med vand,
   hvor et maaleglas paa 250 mL fyldt med vand staar paa hovedet i et
   stativ. Eleven stiller lighteren paa vaegten og skriver m(før),
   traekker den ned i vandet under maaleglasset, holder musen nede paa
   den, saa gassen bobler op i glasset, aflaeser rumfanget i luppen,
   tager lighteren op, toerrer den paa papiret og vejer den igen.
   Tallene skriver eleven selv i skemaet i panelet. De gemmes og bruges
   paa fane 2.

   Lighteren kan mere, end der staar nogen steder (brugerens oenske):
     * Haetten kan traekkes af (den sidder lidt fast).
     * Uden haette kan pinden paa justeringsringen koeres frem og
       tilbage, og loeftes den af taenderne, kan den koeres tilbage uden
       at lukke ventilen og saa frem igen: den klassiske tuning.
     * Hjulet giver en gnist og en flamme, og gasknappen lukker gas ud i
       luften.
   Paaskeaeggene, hvor forsoeget gaar helt galt, og Kemichael kommer:
     * en tunet lighter, der taendes: en stikflamme
     * en tunet lighter under vand: 20 % for, at ventilen suger vand ind,
       naar knappen slippes (én gang pr. tur i vandet)
     * gas lukket ud paa bordet, og saa en gnist: brandkuglen
   Scenen er en fast scene paa 900 x 650 enheder, der skaleres ind i
   laerredet; Kemichael tegnes oven paa i laerredets egne pixels.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var T = NK.Tjek;
    var Tg = NK.Tegn;

    var SB = 900, SH = 650, BORD = 580;
    var LH = Tg.LIGHTER_H;
    var POS = {
        vaegt: { x: 130, b: 210 },
        start: 290,
        papir: { x: 400, b: 120 },
        opst: 640,
        lup: { x: 440, y: 205, r: 92 }
    };
    var M = NK.Sprites.MAAL.vaegt;
    var SKAAL_Y = BORD - (M.bund - M.skaalY) * POS.vaegt.b / M.b;

    /* ----- Maalingerne deles med fane 2 og huskes i browseren --------------------- */
    var NOEGLE_MAAL = "nk-sc4.9-maalinger";
    NK.maalinger = (function () {
        var g = NK.hent(NOEGLE_MAAL, null);
        if (g && g.length === 2) {
            return g.map(function (m) { return m && m.mf > 0 && m.me > 0 && m.V > 0 ? { mf: m.mf, V: m.V, me: m.me } : null; });
        }
        return [null, null];
    }());
    NK.gemMaalinger = function () { NK.gem(NOEGLE_MAAL, NK.maalinger); };
    /* Maaling i (0 eller 1): elevens egen eller eksemplet */
    NK.maaling = function (i) {
        var m = NK.maalinger[i];
        if (m) return { mf: m.mf, V: m.V, me: m.me, egen: true };
        var e = D.EKSEMPEL[i];
        return { mf: e.mf, V: e.V, me: e.me, egen: false };
    };

    /* Terningen til vandet i lighteren (selvtesten kan saette sin egen) */
    NK.terning = NK.terning || function () { return Math.random(); };

    function SimForsoeg() {
        this.over = null;
        this.geo = Tg.opstillingGeo(POS.opst, BORD, 1, 250);
        this.startFane(D.FORSOEG);
        this.el.valg = NK.el("forsoeg-valg");
        this.laerer = NK.Laerer ? new NK.Laerer(this.L) : null;
        this.bindSkema();
        this.introNu = true;
        this.vaelg(this.status[0].loest && !this.status[1].loest ? 1 : 0, false);
    }

    var P = SimForsoeg.prototype;
    NK.Fane.paa(P, { navn: "forsoeg", naesteFane: "fane-beregning", naesteNavn: "Beregningen" });

    /* Er en maaling gemt, vises den faerdig. Start forfra maaler igen. */
    var vaelgFaelles = P.vaelg;
    P.vaelg = function (i, nyeTal) {
        vaelgFaelles.call(this, i, nyeTal);
        if (this.gemtVist) this.besked("Målingen står i skemaet. Tryk på Start forfra for at måle igen.", "god");
        this.visSkema();
    };

    /* ----- Opgaven -------------------------------------------------------------- */
    P.lavOpgave = function (i) {
        var o = D.FORSOEG[i];
        this.opg = o;
        var gemt = NK.maalinger[i];
        this.gemtVist = !!(this.status[i].loest && gemt);
        this.nyMaaling(this.gemtVist ? gemt.mf : null);
        if (this.gemtVist) {
            /* Den faerdige maaling: gassen er i glasset, og lighteren staar paa vaegten */
            this.lt.slip(gemt.V);
            this.lt.tom += gemt.me - this.lt.masse();
            this.glas.V = gemt.V;
            this.sted = "vaegt";
            this.noteret = { mf: gemt.mf, V: gemt.V, me: gemt.me };
            this.valgt = 1;
            this.faerdig = true;
        }
        this.sidsteFase = this.fase();
    };

    /* En ny lighter og et maaleglas fyldt med vand (m: en bestemt masse) */
    P.nyMaaling = function (m) {
        if (!m) {
            var andre = NK.maalinger.filter(Boolean).map(function (x) { return x.mf; });
            if (this.lt) andre.push(this.lt.m0);
            var mulige = D.LIGHTERE.filter(function (x) { return andre.indexOf(x) < 0; });
            m = NK.tilfaeldig(mulige.length ? mulige : D.LIGHTERE);
        }
        var nr = this.nr || 0;
        this.lt = new K.Lighter(m);
        this.sted = "bord";
        this.lx = POS.start;
        this.haand = null;
        this.flyt = null;
        this.hat = { paa: true, x: 0, yb: BORD, haand: false };
        this.hatGreb = null;
        this.pindGreb = null;
        this.gasGreb = null;
        this.gasPaa = false;
        this.gasMus = false;
        this.gasTast = false;
        this.autoGas = false;
        this.glas = { V: 0 };
        this.sky = 0;
        this.flamme = null;
        this.gnist = 0;
        this.wush = null;
        this.rullet = false;
        this.suger = 0;
        this.papirVaad = 0;
        this.bobler = new NK.Bobler(3 + nr);
        this.noteret = { mf: null, V: null, me: null };
        this.valgt = null;
        this.muligheder = null;
        this.forklaring = "";
        this.tab = { forbi: 0, luft: 0, flamme: 0 };
        this.haetteVedFoer = null;
        this.uheld = null;
        this.auto = null;
        this.holdSvar = 0;
        this.rosNaeste = "";
        this.sidsteFase = null;
        this.gemtVist = false;
        if (this.laerer && this.laerer.laererNyt) this.laerer.laererNyt();
        /* Felterne i maalingens kolonne toemmes */
        ["f", "v", "e"].forEach(function (h) { var e = NK.el("forsoeg-" + h + nr); if (e) e.value = ""; });
    };

    P.harForfra = function () { return true; };
    P.harNyeTal = function () { return false; };

    /* Start forfra: en ny lighter og et nyt maaleglas med vand */
    P.forfra = function () {
        this.faerdig = false;
        this.nyMaaling(null);
        this.sidsteFase = this.fase();
        this.hjaelp = 0;
        this.brugtSvar = false;
        this.visKort();
        this.visListe();
        this.besked("En ny lighter og et måleglas fyldt med vand. " + this.trinLinje(), "");
        this.visSkema();
        this.fokus();
    };

    P.promptHTML = function () {
        var o = this.opg;
        var spm = this.fase() === "gaet" ? '<p class="opgave-spm">' + NK.html(this.gaetTekst(D.GAET.spm)) + "</p>" : "";
        return '<p class="maal-tekst">' + NK.html(o.tekst) + "</p>" + spm;
    };

    P.gaetTekst = function (t) {
        var V = this.noteret.V !== null ? this.noteret.V : Math.round(this.glas.V);
        var dm = this.noteret.me !== null ? K.r2(this.noteret.mf - this.noteret.me) : K.r2(K.gram(V));
        return t.replace("{V}", K.V(V)).replace("{m}", K.g2(dm));
    };

    /* Gaettet: hvor meget lettere er lighteren blevet? Tre svar, hvor det
       rigtige er gassens masse med ét ciffer */
    P.lavMuligheder = function () {
        var a = parseFloat(NK.betydende(K.gram(this.noteret.V), 1).replace(",", "."));
        this.muligheder = [
            { t: "Ca. " + NK.betydende(a / 10, 1) + " g", id: "lav" },
            { t: "Ca. " + NK.betydende(a, 1) + " g", id: "ok", ok: true },
            { t: "Ca. " + NK.betydende(a * 10, 1) + " g", id: "hoej" }
        ];
    };

    /* Valgknapperne til gaettet */
    P.visKortEkstra = function () {
        var mig = this, e = this.el.valg;
        if (!this.opg.gaet || !this.muligheder) { e.hidden = true; e.innerHTML = ""; return; }
        e.hidden = false;
        e.innerHTML = "";
        this.muligheder.forEach(function (s, j) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "knap";
            b.textContent = s.t;
            if (mig.valgt !== null) {
                b.disabled = true;
                if (j === mig.valgt) b.classList.add("valgt");
                if (mig.noteret.me !== null && s.ok) b.classList.add("rigtig");
                if (mig.noteret.me !== null && j === mig.valgt && !s.ok) b.classList.add("forkert");
            }
            b.addEventListener("click", function () { mig.vaelgSvar(j, "gaet"); });
            e.appendChild(b);
        });
    };

    P.vaelgSvar = function (j, maade) {
        if (this.valgt !== null || this.fase() !== "gaet") return;
        var s = this.muligheder[j];
        this.valgt = j;
        this.hjaelp = 0;
        if (maade === "svar") {
            this.brugtSvar = true;
            this.svarVis(NK.html("Den rigtige: " + s.t.toLowerCase() + ". Vej lighteren, og se efter."));
            this.holdSvar = 1;
        } else {
            this.rosNaeste = NK.html("Dit gæt: " + s.t.toLowerCase() + ".");
        }
        this.visKort();
        this.visSkema();
        this.fokus();
    };

    /* ----- Faserne ------------------------------------------------------------------ */
    P.fase = function () {
        if (this.faerdig) return "faerdig";
        var n = this.noteret;
        if (n.mf === null) return "foer";
        if (n.V === null) {
            if (this.glas.V < D.V_MIN) return this.sted === "vand" ? "gas" : "saenk";
            return this.gasPaa ? "gas" : "aflaes";
        }
        if (this.opg.gaet && this.valgt === null) return "gaet";
        if (this.sted === "vaegt" && !this.haand && !this.flyt) return this.lt.vaad() ? "toer" : "efter";
        return "op";
    };

    P.opgaveFaerdig = function () { return this.noteret.me !== null; };

    P.trinLinje = function () {
        var f = this.fase();
        if (f === "faerdig") return "";
        if (f === "foer" && this.sted === "vaegt" && !this.haand) {
            return this.lt.vaad() ? D.LINJE.toer : D.LINJE.foerVaegt;
        }
        return D.LINJE[f] || "";
    };

    P.slutLinje = function () { return this.forklaring; };

    /* Fasen skifter: linjen siger det naeste skridt */
    P.faseSkift = function (f) {
        this.hjaelp = 0;
        var holdt = this.holdSvar > 0;
        if (holdt) this.holdSvar--;
        if (f !== "faerdig" && !holdt) this.besked((this.rosNaeste ? this.rosNaeste + " " : "") + this.trinLinje(), this.rosNaeste ? "god" : "");
        this.rosNaeste = "";
        this.visKort();
        this.visSkema();
        if (f === "foer" || f === "aflaes" || f === "efter") this.fokus();
    };

    /* ----- Knappen: hint og svar for den fase, man er i ------------------------------ */
    P.trinInfo = function () {
        var mig = this, f = this.fase();
        if (f === "faerdig") return null;
        if (f === "gaet") {
            var ret = this.muligheder.map(function (s) { return !!s.ok; }).indexOf(true);
            return { hint: NK.html(this.gaetTekst(D.GAET.hint)), svar: function () { mig.vaelgSvar(ret, "svar"); } };
        }
        var h = D.HINT[f === "toer" ? "op" : f];
        return { hint: NK.html(h), svar: function () { mig.visSvar(f); } };
    };

    P.visSvar = function (f) {
        var mig = this;
        this.brugtSvar = true;
        this.holdSvar = 1;
        if (f === "foer") {
            this.lt.film = 0;
            this.flytTil("vaegt", function () {
                mig.svarVis(NK.html(D.SVAR.foer.replace("{m}", K.g2(mig.lt.visning()))));
                mig.noterFoer();
            });
        } else if (f === "saenk") {
            this.flytTil("vand", function () { mig.svarVis(NK.html(D.SVAR.saenk)); });
        } else if (f === "gas") {
            if (this.sted !== "vand") this.flytTil("vand");
            this.autoGas = true;
            this.svarVis(NK.html(D.SVAR.gas));
        } else if (f === "aflaes") {
            var V = Math.round(this.glas.V);
            this.svarVis(NK.html(D.SVAR.aflaes.replace("{V}", K.V(V))));
            this.noterV(V);
        } else if (f === "op" || f === "toer") {
            this.flytTil("papir", function () {
                mig.lt.film = 0;
                mig.papirVaad = 1;
                mig.flytTil("vaegt", function () { mig.svarVis(NK.html(D.SVAR.op)); });
            });
        } else if (f === "efter") {
            this.holdSvar = 0;
            this.noterEfter("svar");
        }
    };

    /* ----- Skemaet i panelet ------------------------------------------------------------ */
    function inp(r, hvad) { return NK.el("forsoeg-" + hvad + r); }
    var FELTER = ["f", "v", "e"];

    P.bindSkema = function () {
        var mig = this;
        [0, 1].forEach(function (r) {
            FELTER.forEach(function (hvad) {
                var e = inp(r, hvad);
                e.addEventListener("keydown", function (ev) {
                    if (ev.key === "Enter") { ev.preventDefault(); mig.tjekFelt(r, hvad); }
                });
            });
        });
    };

    function formater(hvad, v) {
        if (v === null || v === undefined) return "";
        if (hvad === "v") return Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : v.toFixed(1).replace(".", ",");
        return K.g2(v);
    }

    /* Hvilke felter er aabne, og hvad staar der */
    P.visSkema = function () {
        var mig = this, f = this.fase();
        [0, 1].forEach(function (r) {
            var aktiv = r === mig.nr;
            var tal = aktiv ? mig.noteret : (NK.maalinger[r] || { mf: null, V: null, me: null });
            FELTER.forEach(function (hvad) {
                var e = inp(r, hvad), felt = e.parentNode;
                var v = hvad === "f" ? tal.mf : (hvad === "v" ? tal.V : tal.me);
                var aaben = aktiv && (v === null || v === undefined) && f !== "faerdig" &&
                    ((hvad === "f") || (hvad === "v" && mig.noteret.mf !== null) ||
                     (hvad === "e" && mig.noteret.V !== null && f !== "gaet"));
                if (v !== null && v !== undefined) {
                    var t = formater(hvad, v);
                    if (e.value !== t) e.value = t;
                } else if (!aaben && document.activeElement !== e) e.value = "";
                e.disabled = !aaben;
                felt.classList.toggle("ok", v !== null && v !== undefined);
                felt.classList.toggle("aktiv", aaben);
                felt.classList.toggle("laast", !aaben && (v === null || v === undefined));
            });
            var th = NK.el("forsoeg-h" + r);
            if (th) th.classList.toggle("valgt", aktiv);
        });
        var m = this.noteret;
        NK.saetTekst("forsoeg-note", m.mf !== null && m.me !== null ?
            "Lighteren tabte " + K.g2(m.mf) + " g − " + K.g2(m.me) + " g = " + K.g2(K.r2(m.mf - m.me)) + " g." : "");
    };

    P.fokusFelt = function () {
        var f = this.fase(), hvad = f === "foer" ? "f" : (f === "aflaes" ? "v" : (f === "efter" ? "e" : null));
        if (!hvad) return;
        var e = inp(this.nr, hvad);
        if (e && !e.disabled) e.focus({ preventScroll: true });
    };

    function ryst(e) {
        var felt = e.parentNode;
        felt.classList.remove("ryst");
        void felt.offsetWidth;
        felt.classList.add("ryst");
    }

    P.tjekFelt = function (r, hvad) {
        if (r !== this.nr || this.faerdig) return;
        var e = inp(r, hvad);
        var raa = e.value;
        if (!String(raa).trim()) { this.besked(hvad === "v" ? "Skriv tallet fra måleglasset." : "Skriv tallet fra vægten.", "gul"); return; }
        var t = T.tal(raa);
        if (!t) { ryst(e); this.besked(hvad === "v" ? "Skriv et tal, fx 152." : "Skriv et tal, fx 17,84.", "skidt"); return; }
        if (hvad === "v") { this.tjekV(e, t.v); return; }
        var v = Math.round(t.v * 100);
        var paaVaegt = this.sted === "vaegt" && !this.haand && !this.flyt;
        var vist = Math.round(this.lt.visning() * 100);
        if (hvad === "f") {
            if (!paaVaegt) { ryst(e); this.besked("Stil lighteren på vægten først.", "skidt"); return; }
            if (this.lt.vaad()) { ryst(e); this.besked("Lighteren er våd, og vandet vejer med. Tør den på papiret først.", "skidt"); return; }
            if (v === vist) { this.noterFoer(); return; }
            ryst(e);
            this.besked("Det står der ikke på vægten. Skriv tallet med to decimaler.", "skidt");
            return;
        }
        if (this.fase() === "gaet") { this.kortBesked("Gæt først: vælg et af svarene i kortet."); this.pegT = 1.6; return; }
        if (!paaVaegt) { ryst(e); this.besked("Stil lighteren på vægten først.", "skidt"); return; }
        if (this.lt.vaad()) {
            ryst(e);
            this.besked(v === vist ? "Vandet på lighteren vejer med, så m(gas) bliver for lille. Tør den på papiret først." :
                "Lighteren er våd. Tør den på papiret først.", "skidt");
            return;
        }
        if (v === vist) { this.noterEfter("ok"); return; }
        ryst(e);
        if (v === Math.round(this.noteret.mf * 100)) this.besked("Det er m(før). Aflæs vægten nu.", "skidt");
        else this.besked("Det står der ikke på vægten.", "skidt");
    };

    P.tjekV = function (e, v) {
        var V = this.glas.V;
        if (this.gasPaa) { ryst(e); this.besked("Slip lighteren først. Så står vandet stille.", "skidt"); return; }
        if (V < D.V_MIN) { ryst(e); this.besked("Der er for lidt gas til, at vægten kan mærke det. Slip mere ud.", "skidt"); return; }
        if (V > D.MAALEGLAS.maks + 0.5) {
            ryst(e);
            this.besked("Vandet står under stregerne, så rumfanget kan ikke aflæses. Tryk på Start forfra, og slip lidt mindre gas ud.", "skidt");
            return;
        }
        if (Math.abs(v - V) <= D.MAALEGLAS.streg + 0.01) { this.noterV(v); return; }
        ryst(e);
        if (Math.abs(v - V) <= 8) this.besked("Tæt på. Læs ud for bunden af den buede vandoverflade. Hver streg er 2 mL.", "skidt");
        else if (Math.abs(v - (D.MAALEGLAS.maks - V)) <= 3) this.besked("Glasset står på hovedet, så tallene begynder ved foden. Læs tallet ud for vandet.", "skidt");
        else this.besked("Det står der ikke ud for vandet. Se i luppen.", "skidt");
    };

    P.noterFoer = function () {
        this.noteret.mf = this.lt.visning();
        this.haetteVedFoer = this.lt.haette;
        this.tab = { forbi: 0, luft: 0, flamme: 0 };
        this.uheld = null;
        this.rosNaeste = NK.tilfaeldig(D.ROS);
        this.visSkema();
    };

    P.noterV = function (v) {
        this.noteret.V = v;
        if (this.opg.gaet && this.valgt === null) this.lavMuligheder();
        this.rosNaeste = NK.tilfaeldig(D.ROS);
        this.visKort();
        this.visSkema();
    };

    P.noterEfter = function (maade) {
        var n = this.noteret;
        n.me = this.lt.visning();
        NK.maalinger[this.nr] = { mf: n.mf, V: n.V, me: n.me };
        NK.gemMaalinger();
        var pre = "";
        if (this.opg.gaet && this.valgt !== null) {
            var s = this.muligheder[this.valgt];
            pre = s.ok ? "Dit gæt holdt." : "Du gættede: " + s.t.toLowerCase() + ". " + this.gaetTekst(D.GAET[s.id]);
        }
        var adv = this.advarsel();
        this.forklaring = NK.html((pre ? pre + " " : "") + (adv || this.opg.efter));
        this.sidsteFase = "faerdig";
        this.trinLoest(maade, maade === "svar" ? NK.html(D.SVAR.efter.replace("{m}", K.g2(n.me))) : null);
        this.visSkema();
        if (NK.sims && NK.sims["fane-beregning"]) NK.sims["fane-beregning"].nyeMaalinger();
    };

    /* Det, der har oedelagt maalingen (til forklaringen) */
    P.advarsel = function () {
        var ud = [];
        if (this.lt.vand > 0.01) ud.push("Der er vand i lighteren, så den vejer for meget bagefter. Molarmassen bliver for lav.");
        if (this.haetteVedFoer !== null && this.haetteVedFoer !== this.lt.haette) {
            ud.push(this.lt.haette ? "Hætten var af ved første vejning og på ved anden. Den vejer også noget, så molarmassen bliver for lav." :
                "Hætten lå på bordet ved anden vejning. Den vejer også noget, så molarmassen bliver for høj.");
        }
        var tabt = this.tab.forbi + this.tab.luft + this.tab.flamme;
        if (tabt > 0.015) {
            var hvor = this.tab.flamme > this.tab.luft + this.tab.forbi ? "brændte i flammen" :
                (this.tab.luft > this.tab.forbi ? "slap ud i luften" : "boblede forbi måleglasset");
            ud.push("Lighteren tabte også " + K.g2(tabt) + " g gas, der " + hvor + ". Den er med i m(gas), men ikke i V, så molarmassen bliver for høj.");
        }
        return ud.length ? ud.join(" ") + " Tryk på Start forfra for en ren måling." : "";
    };

    /* ----- Hvor lighteren staar ---------------------------------------------------------- */
    P.plads = function (sted, x) {
        if (sted === "vaegt") return { x: POS.vaegt.x, yb: SKAAL_Y + 1 };
        if (sted === "papir") return { x: POS.papir.x - 8, yb: BORD - 4 };
        if (sted === "vand") return { x: this.geo.plads.x, yb: this.geo.plads.yb };
        return { x: x !== undefined ? x : this.lx, yb: BORD };
    };

    P.lighterBund = function () {
        if (this.haand) return { x: this.haand.x - this.haand.dx, yb: this.haand.y - this.haand.dy };
        if (this.flyt) {
            var u = NK.blod(this.flyt.t / this.flyt.varighed);
            return { x: NK.lerp(this.flyt.fra.x, this.flyt.til.x, u),
                     yb: NK.lerp(this.flyt.fra.yb, this.flyt.til.yb, u) - Math.sin(u * Math.PI) * 60 };
        }
        return this.plads(this.sted);
    };

    P.lighterGeo = function () {
        var b = this.lighterBund();
        return Tg.lighterGeo(b.x, b.yb, LH);
    };

    /* Hvor lighteren lander, naar den slippes ved x */
    function stedVed(mig, x) {
        var kar = mig.geo.kar;
        if (Math.abs(x - POS.vaegt.x) < 95) return "vaegt";
        if (Math.abs(x - POS.papir.x) < 72) return "papir";
        if (x > kar.x0 + 6 && x < kar.x0 + kar.b - 6) return "vand";
        return "bord";
    }

    P.saetSted = function (sted, x) {
        var var_ = this.sted;
        this.sted = sted;
        if (sted === "bord") this.lx = NK.klamp(x, 40, 460);
        if (var_ === "vand" && sted !== "vand") {
            /* Op af vandet: vaad paa ydersiden, og terningen er klar igen */
            this.lt.film = NK.r(D.FILM[0], D.FILM[1]);
            this.rullet = false;
            this.stopGas();
        }
        if (sted === "vand" && var_ !== "vand") this.rullet = false;
    };

    /* Flyt lighteren af sig selv (Vis svaret) */
    P.flytTil = function (sted, efter) {
        var fra = this.lighterBund();
        this.saetSted(sted, this.lx);
        this.flyt = { fra: fra, til: this.plads(sted), t: 0, varighed: 0.5, efter: efter || null };
    };

    /* ----- Gassen ------------------------------------------------------------------------- */
    P.startGas = function () {
        if (this.gasPaa || this.lt.gas <= 0) return;
        this.gasPaa = true;
    };

    P.stopGas = function () {
        if (!this.gasPaa) return;
        this.gasPaa = false;
        this.gasMus = false;
        this.gasTast = false;
        this.autoGas = false;
        /* En tunet lighter under vand: ventilen kan suge vand ind */
        if (this.sted === "vand" && this.lt.tunet() && !this.rullet) {
            this.rullet = true;
            if (NK.terning() < D.VAND_SANDS) {
                this.lt.vand += NK.r(D.VAND_IND[0], D.VAND_IND[1]);
                this.suger = 1.2;
                this.paatale("vand");
            }
        }
    };

    P.mellemrum = function (ned) {
        if (ned) {
            if (this.sted === "vand" && !this.haand && !this.flyt) { this.gasTast = true; this.startGas(); }
        } else if (this.gasTast) {
            this.stopGas();
        }
    };

    /* Er maalingen i gang (m(før) skrevet, m(efter) ikke)? */
    P.iGang = function () { return this.noteret.mf !== null && this.noteret.me === null; };

    /* Kemichael kommer: forfra, naar maalingen er i gang og nu er oedelagt */
    P.paatale = function (slags) {
        this.uheld = slags;
        if (!this.laerer || this.laerer.optaget()) return;
        this.laerer.paatale(slags, this.iGang());
    };

    /* Hjulet: en gnist, og er der gas, en flamme */
    P.taend = function () {
        var lt = this.lt;
        this.gnist = 0.35;
        if (this.sted === "vand" || lt.vaad() || lt.gas <= 0) {
            if (lt.vaad() && this.sted !== "vand") this.kortBesked("Hjulet er vådt. Det giver kun en lille gnist.", 3);
            return;
        }
        var stik = lt.tunet();
        this.flamme = { t: 0, stik: stik, holdt: true };
        if (this.sky > D.SKY.graense) {
            this.wush = { t: 0, x: this.lighterBund().x };
            this.sky = 0;
            this.paatale("wush");
        } else if (stik) {
            this.paatale("stik");
        } else if (this.iGang()) {
            this.kortBesked("Flammen brænder gas af. Den gas kommer aldrig i måleglasset.", 4);
        }
    };

    /* ----- Musen ------------------------------------------------------------------------- */
    P.tilS = function (pt) {
        var l = this.lay;
        return { x: (pt.x - l.ox) / l.k, y: (pt.y - l.oy) / l.k };
    };

    /* Den del af lighteren, der er under punktet (i scenens enheder) */
    P.lighterDel = function (s) {
        if (this.flyt) return null;
        var g = this.lighterGeo(), lt = this.lt;
        var iVand = this.sted === "vand";
        if (!lt.haette && !iVand) {
            var tip = Tg.pindTip(g, lt.pind, lt.loeftet);
            if (Math.hypot(s.x - tip.x, s.y - tip.y) < 13) return "pind";
        }
        if (!iVand && Math.hypot(s.x - g.hjul.x, s.y - g.hjul.y) < g.hjul.r * 1.35) return "hjul";
        if (!iVand && s.x >= g.knap.x0 - 2 && s.x <= g.knap.x1 + 3 && s.y >= g.knap.y0 - 3 && s.y <= g.knap.y1 + 5) return "knap";
        if (lt.haette && s.x >= g.haette.x0 - 3 && s.x <= g.haette.x1 + 3 && s.y >= g.haette.y0 - 4 && s.y <= g.haette.y1) return "haette";
        if (s.x >= g.krop.x0 - 4 && s.x <= g.krop.x1 + 4 && s.y >= g.y0 + 10 * g.s && s.y <= g.yb + 2) return "krop";
        return null;
    };

    P.hvad = function (s) {
        if (!s) return null;
        var d = this.lighterDel(s);
        if (d) return d;
        var h = this.hat;
        if (!h.paa && !h.haand && Math.abs(s.x - h.x) < 18 && s.y > h.yb - 32 && s.y < h.yb + 3) return "haetteFri";
        var l = POS.lup;
        if (Math.hypot(s.x - l.x, s.y - l.y) < l.r) return "lup";
        var gl = this.geo.glas;
        if (s.x >= gl.x0 && s.x <= gl.x0 + gl.b && s.y >= gl.y0 && s.y <= gl.mund) return "glas";
        var kar = this.geo.kar;
        if (s.x >= kar.x0 && s.x <= kar.x0 + kar.b && s.y >= kar.y0 && s.y <= BORD) return "kar";
        var vb = POS.vaegt.b;
        if (Math.abs(s.x - POS.vaegt.x) < vb / 2 && s.y >= SKAAL_Y - 10 && s.y <= BORD) return "vaegt";
        if (Math.abs(s.x - POS.papir.x) < POS.papir.b / 2 + 6 && s.y >= BORD - 110 && s.y <= BORD + 4) return "papir";
        return null;
    };

    var AKTIV = { krop: "greb", haette: "pointer", pind: "pointer", hjul: "pointer", knap: "pointer", haetteFri: "greb" };

    P.overScene = function (pt) {
        if (this.laerer && pt && this.laerer.laererUnder(pt.x, pt.y)) { this.over = null; return "pointer"; }
        this.over = pt ? this.hvad(this.tilS(pt)) : null;
        if (!this.over) return null;
        if (this.sted === "vand" && (this.over === "krop" || this.over === "haette")) return "pointer";
        return AKTIV[this.over] === "greb" ? "greb" : "pointer";
    };

    P.nedScene = function (pt) {
        if (this.laerer && this.laerer.laererKlik(pt.x, pt.y)) return false;
        if (this.auto) return false;
        var s = this.tilS(pt), u = this.hvad(s), lt = this.lt;
        this.over = u;
        if (!u) return false;
        var g = this.lighterGeo(), b = this.lighterBund();
        /* Under vand: et tryk paa lighteren lukker gas ud; traekkes der, tages den op */
        if (this.sted === "vand" && (u === "krop" || u === "haette")) {
            this.gasGreb = { x: s.x, y: s.y, dx: s.x - b.x, dy: s.y - b.yb };
            this.gasMus = true;
            this.startGas();
            return true;
        }
        if (u === "pind") {
            /* Pinden foelger musen fra der, hvor den blev grebet */
            this.pindGreb = { ro: Tg.pindTip(g, lt.pind, false).y, x0: s.x, p0: lt.pind };
            return true;
        }
        if (u === "hjul") {
            this.taend();
            this.hjulHoldt = true;
            return true;
        }
        if (u === "knap") {
            this.gasMus = true;
            this.startGas();
            return true;
        }
        if (u === "haette") {
            this.hatGreb = { y0: s.y, af: false };
            return true;
        }
        if (u === "haetteFri") {
            this.hat.haand = true;
            this.hat.gx = s.x; this.hat.gy = s.y;
            return true;
        }
        if (u === "krop") {
            this.haand = { x: s.x, y: s.y, dx: s.x - b.x, dy: s.y - b.yb, fra: this.sted };
            this.stopGas();
            return true;
        }
        var info = {
            vaegt: "Vægten viser lighterens masse med to decimaler.",
            papir: "Køkkenrulle. Stil lighteren på papiret, så tørrer den.",
            glas: "Et måleglas på 250 mL fyldt med vand og vendt på hovedet i karret. Gassen skubber vandet ned.",
            lup: "Luppen viser måleglasset ved vandoverfladen. Hver streg er 2 mL.",
            kar: "Et kar med vand. Lighteren skal ned under måleglasset."
        }[u];
        if (info) this.kortBesked(info);
        return false;
    };

    P.flytScene = function (pt) {
        var s = this.tilS(pt), lt = this.lt;
        if (this.gasGreb) {
            /* Traekkes der, bliver trykket til et greb */
            if (Math.hypot(s.x - this.gasGreb.x, s.y - this.gasGreb.y) > 14) {
                this.stopGas();
                this.haand = { x: s.x, y: s.y, dx: this.gasGreb.dx, dy: this.gasGreb.dy, fra: this.sted };
                this.gasGreb = null;
            }
            return;
        }
        if (this.haand) { this.haand.x = s.x; this.haand.y = s.y; return; }
        if (this.pindGreb) {
            var pg = this.pindGreb, ro = pg.ro;
            if (!lt.loeftet && s.y < ro - 9) lt.loeft();
            else if (lt.loeftet && s.y > ro - 4) lt.saenk();
            lt.saetPind(pg.p0 + (s.x - pg.x0) / 44);
            /* Ved kanten: det, musen kommer laengere ud, taeller fra kanten */
            if (lt.pind <= 0 || lt.pind >= 1) { pg.p0 = lt.pind; pg.x0 = s.x; }
            return;
        }
        if (this.hatGreb) {
            var dy = this.hatGreb.y0 - s.y;
            if (!this.hatGreb.af) {
                /* Den sidder fast: foerst giver den lidt efter, saa slipper den */
                this.hatGreb.loeft = NK.klamp(dy * 0.35, 0, 5);
                if (dy > 16) {
                    this.hatGreb.af = true;
                    lt.haette = false;
                    this.hat = { paa: false, haand: true, x: s.x, yb: s.y + 16, gx: s.x, gy: s.y };
                }
            } else {
                this.hat.gx = s.x; this.hat.gy = s.y;
            }
            return;
        }
        if (this.hat.haand) { this.hat.gx = s.x; this.hat.gy = s.y; }
    };

    P.opScene = function (pt) {
        var s = this.tilS(pt), lt = this.lt;
        if (this.gasGreb) { this.gasGreb = null; this.stopGas(); return; }
        if (this.gasMus) this.stopGas();
        if (this.hjulHoldt) { this.hjulHoldt = false; if (this.flamme) this.flamme.holdt = false; }
        if (this.pindGreb) { this.pindGreb = null; lt.saenk(); return; }
        if (this.haand) {
            var h = this.haand;
            this.haand = null;
            var fra = { x: h.x - h.dx, yb: h.y - h.dy };
            var sted = stedVed(this, fra.x);
            if (sted === "bord" && (fra.x < 40 || fra.x > 460)) fra.x = POS.start;
            this.saetSted(sted, fra.x);
            this.flyt = { fra: fra, til: this.plads(sted), t: 0, varighed: 0.22, efter: null };
            return;
        }
        if (this.hatGreb) {
            var af = this.hatGreb.af;
            this.hatGreb = null;
            if (!af) return;
        }
        if (this.hat.haand) {
            var g = this.lighterGeo();
            this.hat.haand = false;
            var hx = (g.haette.x0 + g.haette.x1) / 2;
            if (this.sted !== "vand" && !lt.loeftet && Math.abs(s.x - hx) < 26 && Math.abs(s.y + 16 - g.haette.y1) < 40) {
                this.hat = { paa: true, x: 0, yb: BORD, haand: false };
                lt.haette = true;
                return;
            }
            var x = s.x;
            if (Math.abs(x - POS.vaegt.x) < 110 || x > this.geo.kar.x0 - 14 || Math.abs(x - POS.papir.x) < 70) x = 245;
            this.hat.x = NK.klamp(x, 30, 470);
            this.hat.yb = BORD;
        }
    };

    /* ----- Layout ----------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var k = Math.min(W / SB, H / SH);
        var lay = { W: W, H: H, k: k, ox: (W - SB * k) / 2, oy: H - SH * k };
        this.lay = lay;
        var mig = this;
        function anker(id, x, y, b, h) { mig.saetAnker(id, lay.ox + x * k, lay.oy + y * k, b * k, h * k); }
        anker("vaegt", POS.vaegt.x - POS.vaegt.b / 2, SKAAL_Y - 160, POS.vaegt.b, BORD - SKAAL_Y + 160);
        anker("glas", this.geo.kar.x0, this.geo.glas.y0, this.geo.kar.b, BORD - this.geo.glas.y0);
        anker("lup", POS.lup.x - POS.lup.r, POS.lup.y - POS.lup.r - 30, 2 * POS.lup.r, 2 * POS.lup.r + 30);
        anker("papir", POS.papir.x - POS.papir.b / 2, BORD - 110, POS.papir.b, 110);
    };

    /* ----- Opdater ----------------------------------------------------------------------- */
    P.opdaterScene = function (dt) {
        if (!this.lay) return;
        var lt = this.lt, mig = this;
        /* Flytningen af sig selv */
        if (this.flyt) {
            this.flyt.t += dt;
            if (this.flyt.t >= this.flyt.varighed) {
                var ef = this.flyt.efter;
                this.flyt = null;
                if (ef) ef();
            }
        }
        /* Vis svaret: gassen bobler, til der er ca. 150 mL */
        if (this.autoGas && this.sted === "vand" && !this.flyt) {
            this.startGas();
            if (this.glas.V >= D.V_GOD || lt.gas <= 0) this.stopGas();
        }
        /* Gassen */
        var flow = this.gasPaa ? lt.flow() : 0;
        var tael = this.iGang();
        if (flow > 0) {
            var ud = lt.slip(flow * dt);
            if (this.sted === "vand") {
                var f = K.fang(flow), ind = ud * f;
                var plads = Math.max(0, this.geo.glas.kap - this.glas.V);
                var over = Math.max(0, ind - plads);
                this.glas.V += ind - over;
                if (tael) this.tab.forbi += K.gram(ud - ind + over);
            } else {
                this.sky += ud;
                if (tael) this.tab.luft += K.gram(ud);
                if (this.iGang() && !this.luftSagt) {
                    this.luftSagt = true;
                    this.kortBesked("Gassen slipper ud i luften. Den kommer aldrig i måleglasset.", 4);
                }
            }
            if (lt.gas <= 0) this.stopGas();
        }
        if (!this.gasPaa) this.luftSagt = false;
        /* Er der kommet mere gas i glasset, efter V blev skrevet? */
        if (this.noteret.V !== null && !this.faerdig && Math.abs(this.glas.V - this.noteret.V) > D.MAALEGLAS.streg + 1) {
            this.noteret.V = null;
            this.besked("Der er kommet mere gas i måleglasset. Skriv det nye rumfang.", "gul");
            this.visSkema();
        }
        this.sky *= Math.pow(0.5, dt / D.SKY.halvering);
        /* Flammen */
        if (this.flamme) {
            var fl = this.flamme;
            fl.t += dt;
            var brug = lt.slip(lt.flow() * dt);
            if (tael) this.tab.flamme += K.gram(brug);
            if ((!fl.holdt && fl.t > (fl.stik ? 1.3 : 0.7)) || fl.t > 4 || lt.gas <= 0 || this.sted === "vand") this.flamme = null;
        }
        if (this.gnist > 0) this.gnist = Math.max(0, this.gnist - dt);
        if (this.wush) { this.wush.t += dt; if (this.wush.t > 1.4) this.wush = null; }
        if (this.suger > 0) this.suger = Math.max(0, this.suger - dt);
        /* Papiret toerrer lighteren */
        if (this.sted === "papir" && !this.haand && !this.flyt && lt.film > 0) {
            lt.film = Math.max(0, lt.film - dt * D.FILM[1] / D.TOER_TID);
            this.papirVaad = Math.min(1, this.papirVaad + dt * 1.2);
        }
        /* Boblerne */
        var g = this.lighterGeo(), gl = this.geo.glas;
        this.bobler.opdater(dt, { flow: this.sted === "vand" ? flow : 0, fang: K.fang(flow), kilde: { x: g.dyse.x, y: g.dyse.y - 4 },
            fri: false, mund: { x: gl.cx, y: gl.mund, halv: (gl.ind1 - gl.ind0) / 2 },
            niveau: gl.yV(this.glas.V), overflade: this.geo.vandY, sk: 1 });
        if (this.laerer) this.laerer.opdater(dt);
        /* Mens Vis svaret flytter eller lukker gas ud, kan knappen ikke bruges */
        var auto = !!(this.autoGas || (this.flyt && this.flyt.efter));
        if (auto !== !!this.auto) { this.auto = auto || null; this.visKnap(); }
        /* Fasen */
        var fa = this.fase();
        if (fa !== this.sidsteFase) {
            this.sidsteFase = fa;
            this.faseSkift(fa);
        }
        if (this.pegT > 0) {
            this.pegT -= dt;
            this.el.valg.classList.toggle("peg", this.pegT > 0);
        }
        void mig;
    };

    /* ----- Tegn --------------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var k = lay.k, t = this.tid, lt = this.lt, geo = this.geo;
        this.L.ryd();
        Tg.rum(ctx, lay.W, lay.H, lay.oy + (BORD + 12) * k);
        Tg.bord(ctx, 0, lay.W, lay.oy + BORD * k, lay.H);
        ctx.save();
        ctx.translate(lay.ox, lay.oy);
        ctx.scale(k, k);

        var iVand = this.sted === "vand" && !this.haand;
        var g = this.lighterGeo();
        var st = { gas: lt.gas, vand: lt.vand, film: lt.film, haette: lt.haette, pind: lt.pind, loeftet: lt.loeftet,
                   knap: this.gasPaa || (this.flamme && this.flamme.holdt) ? 1 : 0, koger: this.gasPaa ? NK.klamp(lt.flow() / 60, 0.3, 1) : (this.flamme ? 0.4 : 0),
                   lys: this.over && ["krop", "haette", "pind", "hjul", "knap"].indexOf(this.over) >= 0 && !this.haand ? this.over : null,
                   haetteLoeft: this.hatGreb && !this.hatGreb.af ? this.hatGreb.loeft : 0, tid: t, nr: this.nr };

        /* Maaleglasset og stativet bag karret, lighteren i vandet og boblerne */
        Tg.opstillingBag(ctx, geo, { V: this.glas.V, lys: this.over === "glas" });
        if (iVand) Tg.lighter(ctx, g, st);
        if (this.suger > 0) {
            /* Vandet suges ind gennem dysen */
            ctx.save();
            ctx.strokeStyle = "rgba(170, 215, 255, " + (0.7 * this.suger / 1.2).toFixed(3) + ")";
            ctx.lineWidth = 2;
            for (var i = 0; i < 3; i++) {
                var rr = 6 + ((t * 30 + i * 6) % 18);
                ctx.beginPath();
                ctx.arc(g.dyse.x, g.dyse.y, 20 - rr, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
        }
        this.bobler.tegn(ctx);
        var holderOverKar = this.haand && stedVed(this, this.haand.x - this.haand.dx) === "vand";
        Tg.opstillingFor(ctx, geo, { V: this.glas.V, maal: holderOverKar, tid: t });

        /* Vaegten og papiret */
        var paaVaegt = this.sted === "vaegt" && !this.haand;
        var vis = paaVaegt && !this.flyt ? K.g2(lt.visning()) : K.g2(0);
        var holderOverVaegt = this.haand && stedVed(this, this.haand.x - this.haand.dx) === "vaegt";
        var v = Tg.vaegt(ctx, POS.vaegt.x, BORD, POS.vaegt.b, vis + " g", { lys: this.over === "vaegt" || holderOverVaegt ? 1 : 0 });
        var holderOverPapir = this.haand && stedVed(this, this.haand.x - this.haand.dx) === "papir";
        Tg.papir(ctx, POS.papir.x, BORD, POS.papir.b, this.papirVaad, this.over === "papir" || holderOverPapir);
        var px = 16;
        Tg.etiket(ctx, "Vægten", POS.vaegt.x, BORD + 30, px);
        Tg.etiket(ctx, "Papir", POS.papir.x, BORD + 30, px);
        Tg.etiket(ctx, "Kar med vand", POS.opst, BORD + 30, px);

        /* Haetten paa bordet eller i haanden */
        if (!this.hat.paa) {
            if (this.hat.haand) Tg.haetteAlene(ctx, this.hat.gx, this.hat.gy + 16, g.s, false);
            else Tg.haetteAlene(ctx, this.hat.x, this.hat.yb, g.s, this.over === "haetteFri");
        }

        /* Lighteren uden for vandet */
        if (!iVand) Tg.lighter(ctx, g, st);

        /* Gas i luften, gnisten, flammen og brandkuglen */
        var top = lt.haette ? { x: g.P(24, 14).x, y: g.P(24, 14).y } : g.dyse;
        if (this.gasPaa && this.sted !== "vand") Tg.hvaes(ctx, top.x, top.y, g.s, t, lt.flow() / 60);
        if (this.gnist > 0) Tg.gnister(ctx, g.hjul.x - 4, g.hjul.y - 4, t, 1);
        if (this.flamme) {
            var fh = (this.flamme.stik ? (20 + lt.flow() * 0.95) * 1.35 : 18 + lt.flow() * 0.55) * NK.klamp(this.flamme.t / 0.12, 0.3, 1);
            Tg.flamme(ctx, top.x, top.y, fh, t, this.flamme.stik);
        }
        if (this.wush) Tg.wush(ctx, this.wush.x, BORD - 10, 420, this.wush.t);

        /* Luppen */
        var l = POS.lup, yi = geo.glas.yV(this.glas.V);
        Tg.lupLinje(ctx, geo.glas.ind0, yi, l.x + l.r, l.y);
        Tg.lupV(ctx, geo, this.glas.V, l.x, l.y, l.r, { titel: "Luppen: vandet i måleglasset", lys: this.over === "lup" });

        /* Pilen over det, der skal bruges nu */
        var f = this.fase();
        if (!this.haand && !this.flyt && !this.flamme && !this.wush) {
            if (f === "foer") {
                if (this.sted === "vaegt" && !lt.vaad()) Tg.pegepil(ctx, v.disp.x + v.disp.b / 2, v.disp.y - 3, t);
                else if (lt.vaad()) Tg.pegepil(ctx, POS.papir.x, BORD - 26, t);
                else Tg.pegepil(ctx, g.x, g.y0 - 4, t);
            } else if (f === "saenk") Tg.pegepil(ctx, geo.cx, geo.vandY - 16, t);
            else if (f === "aflaes") Tg.pegepil(ctx, l.x, l.y - l.r - 34, t);
            else if (f === "op" || f === "toer") {
                if (lt.vaad()) Tg.pegepil(ctx, POS.papir.x, BORD - 26, t);
                else Tg.pegepil(ctx, POS.vaegt.x, SKAAL_Y - 12, t);
            } else if (f === "efter") Tg.pegepil(ctx, v.disp.x + v.disp.b / 2, v.disp.y - 3, t);
        }
        ctx.restore();

        /* Kemichael oven paa, i laerredets egne pixels */
        if (this.laerer) this.laerer.laererTegnOver(ctx);
    };

    NK.SimForsoeg = SimForsoeg;
}());
