/* =====================================================================
   sim_forsoeg.js - fane 1: forsoeget

   To vaegte paa bordet. Paa den ene staar vejebaaden med knust
   muslingeskal, paa den anden den koniske kolbe med 20 mL 4 M saltsyre,
   og den vaegt er sat til 0,00 g. Eleven gaetter foerst (det gule kort
   midt i scenen), aflaeser m(før) med et klik paa vaegten under
   vejebaaden, klikker pulveret over i kolben en spatelfuld ad gangen,
   venter, til vaegten under kolben staar stille, og aflaeser m(efter)
   med et klik paa den. Tallene kan ogsaa skrives i skemaet i panelet.

   Kortet oeverst i scenen siger hele tiden det naeste skridt, og det,
   der skal klikkes paa, har en gul ring og et lille skilt. Et klik i
   den forkerte raekkefoelge udfoeres ikke, men faar én linje med
   forklaringen (D.FOERST).

   Kommer det hele i paa én gang, bruser det saa voldsomt, at det
   sproejter, og vaegten falder mere, end CO₂ kan forklare. Luppen
   kommer frem, naar det foerste pulver er i kolben: H₃O⁺ tager CO₃²⁻
   fra kalken, der bliver til CO₂, og CO₂ stiger op og ud. Maalingerne
   gemmes og bruges paa fane 2.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var T = NK.Tjek;
    var Tg = NK.Tegn;

    /* ----- Maalingerne deles med fane 2 og huskes i browseren --------------------- */
    var NOEGLE_MAAL = "nk-sc4.11-maalinger";
    NK.maalinger = (function () {
        var g = NK.hent(NOEGLE_MAAL, null);
        if (g && g.length === 2) {
            return g.map(function (m) { return m && m.mf > 0 && m.me > 0 ? { mf: m.mf, me: m.me } : null; });
        }
        return [null, null];
    }());
    NK.gemMaalinger = function () { NK.gem(NOEGLE_MAAL, NK.maalinger); };
    /* Maaling i (0 eller 1): elevens egen eller eksemplet */
    NK.maaling = function (i) {
        var m = NK.maalinger[i];
        if (m) return { mf: m.mf, me: m.me, egen: true };
        return { mf: D.EKSEMPEL[i].mf, me: D.EKSEMPEL[i].me, egen: false };
    };

    function SimForsoeg() {
        var mig = this;
        this.over = null;
        this.startFane(D.FORSOEG);
        this.el.valg = NK.el("forsoeg-valg");
        this.el.aflaes = NK.el("forsoeg-aflaes");
        this.el.aflaes.addEventListener("click", function () { mig.aflaes(); });
        this.bindSkema();
        this.introNu = true;
        this.vaelg(this.status[0].loest && !this.status[1].loest ? 1 : 0, false);
    }

    var P = SimForsoeg.prototype;
    NK.Fane.paa(P, { navn: "forsoeg", scene: true, naesteFane: "fane-beregning", naesteNavn: "Beregningen",
        naesteTekst: "Næste måling →" });

    /* Er en maaling gemt, vises den faerdig. Start forfra maaler igen. */
    var vaelgFaelles = P.vaelg;
    P.vaelg = function (i, nyeTal) {
        vaelgFaelles.call(this, i, nyeTal);
        if (this.gemtVist) this.besked("Målingen står i skemaet. Tryk på Start forfra for at måle igen.", "god");
        else if (this.opg.start) this.besked(NK.html(this.opg.start), "");
        this.sidsteLinje = this.trinLinje();
        this.visSkema();
    };

    /* ----- Opgaven -------------------------------------------------------------- */
    P.lavOpgave = function (i) {
        var o = D.FORSOEG[i];
        this.opg = o;
        this.valgt = null;
        this.orden = o.valg ? o.valg.svar.map(function (s, j) { return j; }) : [];
        this.forklaring = "";
        var gemt = NK.maalinger[i];
        this.gemtVist = !!(this.status[i].loest && gemt);
        this.nyMaaling(this.gemtVist ? gemt.mf : null);
        if (this.gemtVist) {
            /* Den faerdige maaling: pulveret er i, og al kalken har reageret */
            this.baad = 0;
            this.kolbe.tilsaet(gemt.mf);
            this.kolbe.kalk = 0;
            this.kolbe.co2 = gemt.mf - gemt.me;
            this.noteret = { mf: gemt.mf, me: gemt.me };
            this.faerdig = true;
            if (o.valg) this.valgt = o.valg.svar.map(function (s) { return !!s.ok; }).indexOf(true);
        }
        this.sidsteFase = this.fase();
    };

    /* En ny kolbe og en ny proeve (m: en bestemt masse, ellers en ny) */
    P.nyMaaling = function (m) {
        if (!m) {
            var andre = NK.maalinger.filter(Boolean).map(function (x) { return x.mf; });
            if (this.proeve) andre.push(this.proeve);
            var mulige = D.PROEVER.filter(function (x) { return andre.indexOf(x) < 0; });
            m = NK.tilfaeldig(mulige.length ? mulige : D.PROEVER);
        }
        var nr = this.nr || 0;
        this.proeve = m;
        this.baad = m;
        this.kolbe = new K.Kolbe();
        this.lup = new Tg.Lup(5 + nr);
        this.bobler = new NK.Bobler(3 + nr);
        this.pust = new NK.Pust(4 + nr);
        this.draaber = new NK.Draaber(6 + nr);
        this.sidstSprojt = 0;
        this.sprojtAkku = 0;
        this.flyv = [];
        this.fald = [];
        this.spatel = null;
        this.noteret = { mf: null, me: null };
        this.skum = 0;
        this.hurtig = false;
        this.autoHaeld = null;
        this.auto = null;
        this.holdSvar = "";
        this.rosNaeste = "";
        this.sidsteFase = null;
        this.sidsteLinje = null;
        this.sproejtSagt = false;
        this.gemtVist = false;
    };

    /* Start forfra vises foerst, naar der er noget at starte forfra paa */
    P.harForfra = function () { return this.faerdig || (this.noteret && this.noteret.mf !== null); };
    P.harNyeTal = function () { return false; };

    /* Start forfra: en ny kolbe med den samme proeve (gaettet bliver) */
    P.forfra = function () {
        var m = this.proeve;
        this.faerdig = false;
        this.nyMaaling(m);
        this.sidsteFase = this.fase();
        this.hjaelp = 0;
        this.brugtSvar = false;
        this.visKort();
        this.visListe();
        this.besked("En ny kolbe med 20 mL saltsyre og den samme prøve.", "");
        this.sidsteLinje = this.trinLinje();
        this.visSkema();
        this.fokus();
    };

    /* Er eleven ved gaettet, foer forsoeget begynder */
    P.gaetNu = function () { return this.fase() === "valg"; };

    /* Kortets store tekst: gaettet, det naeste skridt eller den faerdige maaling */
    P.promptHTML = function () {
        var o = this.opg, f = this.fase();
        if (f === "valg") {
            return '<p class="gk-intro">' + NK.html(o.valg.intro) + '</p><p class="gk-tekst">' + NK.html(o.valg.spm) + "</p>";
        }
        if (f === "faerdig") {
            var n = this.noteret;
            return '<p class="sk-tekst">' + NK.html(o.titel + " er færdig: m(før) = " + K.g2(n.mf) + " g og m(efter) = " + K.g2(n.me) + " g.") + "</p>";
        }
        return '<p class="sk-tekst">' + NK.html(this.trinLinje()) + "</p>";
    };

    /* De fire skridt oeverst paa kortet: klaret, nu og senere */
    P.visSkridt = function () {
        var f = this.fase(), e = NK.el("forsoeg-skridt");
        var nu = D.SKRIDT.map(function (x) { return x.id; }).indexOf(f);
        e.hidden = f === "valg";
        NK.saetHTML("forsoeg-skridt", D.SKRIDT.map(function (x, i) {
            var kl = f === "faerdig" || (nu >= 0 && i < nu) ? "klaret" : (i === nu ? "nu" : "");
            return '<li class="' + kl + '"><span class="ss-nr">' + (kl === "klaret" ? "✓" : (i + 1)) + "</span>" + NK.html(x.t) + "</li>";
        }).join(""));
    };

    /* Svarene til gaettet: tre store knapper side om side, kun mens der gaettes */
    P.visKortEkstra = function () {
        var o = this.opg, mig = this, e = this.el.valg;
        this.visSkridt();
        if (!o.valg || this.fase() !== "valg") { e.hidden = true; e.innerHTML = ""; return; }
        if (!e.hidden && e.children.length === o.valg.svar.length) return;
        e.hidden = false;
        e.innerHTML = "";
        this.orden.forEach(function (j, n) {
            var s = o.valg.svar[j];
            var b = document.createElement("button");
            b.type = "button";
            b.className = "gk-knap";
            b.innerHTML = '<span class="v-bogstav">' + "ABC".charAt(n) + "</span><span>" + NK.html(s.t) + "</span>";
            b.addEventListener("click", function () { mig.vaelgSvar(j, "gaet"); });
            e.appendChild(b);
        });
    };

    P.vaelgSvar = function (j, maade) {
        if (this.valgt !== null) return;
        var o = this.opg, s = o.valg.svar[j];
        this.valgt = j;
        this.hjaelp = 0;
        if (maade === "svar") {
            this.brugtSvar = true;
            this.holdSvar = NK.html("Det rigtige svar: " + s.t.toLowerCase() + ". Prøv det af.");
        } else {
            this.rosNaeste = NK.html("Dit gæt: " + s.t.toLowerCase() + ". Nu skal det prøves.");
        }
        this.visKort();
        this.visSkema();
    };

    /* ----- Faserne ------------------------------------------------------------------ */
    P.iLuften = function () { return !!(this.spatel || this.flyv.length || this.fald.length); };

    P.fase = function () {
        if (this.faerdig) return "faerdig";
        if (this.opg.valg && this.valgt === null) return "valg";
        if (this.noteret.mf === null) return "foer";
        if (this.baad > 1e-6) return "haeld";
        if (this.iLuften() || !this.kolbe.stille()) return "vent";
        return "efter";
    };

    P.opgaveFaerdig = function () { return this.noteret.me !== null; };

    /* Er der ro nok i kolben til en spatelfuld mere */
    P.roligt = function () { return !this.iLuften() && this.kolbe.rate < D.ROLIG; };

    /* Det naeste skridt, som det staar med stor skrift paa kortet */
    P.trinLinje = function () {
        var f = this.fase();
        if (f === "faerdig" || f === "valg") return "";
        if (f === "haeld") {
            if (this.kolbe.ind === 0 && !this.iLuften()) return D.LINJE.haeld;
            return this.roligt() ? D.LINJE.haeldMere : D.LINJE.haeldVent;
        }
        return D.LINJE[f];
    };

    P.slutLinje = function () { return this.forklaring; };

    /* Fasen skifter: kortet viser det naeste skridt. holdSvar er det svar,
       eleven lige har bedt om; det staar i linjen under, til fasen
       skifter igen. rosNaeste er en kort kvittering for det, der lige er
       gjort. */
    P.faseSkift = function (f) {
        this.hjaelp = 0;
        var holdt = this.holdSvar;
        this.holdSvar = "";
        if (f !== "faerdig") {
            if (holdt) this.besked(holdt, "gul");
            else this.besked(this.rosNaeste || "", this.rosNaeste ? "god" : "");
        }
        this.rosNaeste = "";
        this.sidsteLinje = this.trinLinje();
        this.visKort();
        this.visSkema();
    };

    /* Et klik i den forkerte raekkefoelge: én linje med forklaringen */
    P.fejl = function (tekst) { this.besked(NK.html(tekst), "skidt"); };

    /* ----- Knappen: hint og svar for den fase, man er i ------------------------------ */
    P.trinInfo = function () {
        var o = this.opg, mig = this, f = this.fase();
        if (f === "faerdig") return null;
        if (f === "valg") {
            var ret = o.valg.svar.map(function (s) { return !!s.ok; }).indexOf(true);
            return { hint: NK.html(o.valg.hint), svar: function () { mig.vaelgSvar(ret, "svar"); } };
        }
        return { hint: NK.html(D.HINT[f]), svar: function () { mig.visSvar(f); } };
    };

    P.visSvar = function (f) {
        this.brugtSvar = true;
        if (f === "foer") {
            this.holdSvar = NK.html(D.SVAR.foer.replace("{m}", K.g2(this.proeve)));
            this.svarVis(this.holdSvar);
            this.noterFoer(true);
        } else if (f === "haeld") {
            this.autoHaeld = { t: 0.2 };
            this.holdSvar = NK.html(D.SVAR.haeld);
            this.svarVis(this.holdSvar);
        } else if (f === "vent") {
            this.hurtig = true;
            this.holdSvar = NK.html(D.SVAR.vent);
            this.svarVis(this.holdSvar);
        } else if (f === "efter") {
            this.holdSvar = "";
            this.noterEfter("svar");
        }
    };

    /* ----- Skemaet i panelet ------------------------------------------------------------ */
    function inp(r, hvad) { return NK.el("forsoeg-" + hvad + r); }

    P.bindSkema = function () {
        var mig = this;
        [0, 1].forEach(function (r) {
            ["f", "e"].forEach(function (hvad) {
                var e = inp(r, hvad);
                e.addEventListener("keydown", function (ev) {
                    if (ev.key === "Enter") { ev.preventDefault(); mig.tjekFelt(r, hvad); }
                });
                var knap = NK.el("forsoeg-ok-" + hvad + r);
                if (knap) knap.addEventListener("click", function () { mig.tjekFelt(r, hvad); });
            });
        });
    };

    /* Hvilke felter er aabne, og hvad staar der */
    P.visSkema = function () {
        var mig = this, f = this.fase();
        [0, 1].forEach(function (r) {
            var aktiv = r === mig.nr;
            var tal = aktiv ? mig.noteret : (NK.maalinger[r] || { mf: null, me: null });
            ["f", "e"].forEach(function (hvad) {
                var e = inp(r, hvad), felt = e.parentNode;
                var v = hvad === "f" ? tal.mf : tal.me;
                var aaben = aktiv && v === null && f !== "valg" && f !== "faerdig" &&
                    (hvad === "f" || (mig.noteret.mf !== null && (f === "vent" || f === "efter")));
                if (v !== null && v !== undefined) {
                    if (e.value !== K.g2(v)) e.value = K.g2(v);
                } else if (!aaben && document.activeElement !== e) e.value = "";
                e.disabled = !aaben;
                felt.classList.toggle("ok", v !== null && v !== undefined);
                felt.classList.toggle("aktiv", aaben);
                felt.classList.toggle("laast", !aaben && (v === null || v === undefined));
            });
            NK.el("forsoeg-r" + r).classList.toggle("valgt", aktiv);
        });
        var m = aktivRaekke(this);
        NK.saetTekst("forsoeg-note", m && m.mf !== null && m.me !== null ?
            "Kolben tabte " + K.g2(m.mf) + " g − " + K.g2(m.me) + " g = " + K.g2(K.r2(m.mf - m.me)) + " g." : "");
        /* Knappen skriver tallet fra den vaegt, der skal aflaeses nu */
        var k = this.el.aflaes;
        k.hidden = f === "valg" || f === "faerdig";
        k.textContent = f === "foer" ? "Aflæs vægten under vejebåden" : "Aflæs vægten under kolben";
        k.classList.toggle("nu", f === "foer" || f === "efter");
    };

    /* Knappen Aflaes vaegten: det samme som et klik paa vaegten i scenen */
    P.aflaes = function () {
        var f = this.fase();
        if (f === "valg") { this.gaetBlink(); return; }
        if (f === "faerdig") return;
        if (f === "foer") { this.noterFoer(); return; }
        this.aflaesKolbe();
    };

    P.aflaesKolbe = function () {
        if (this.baad > 1e-6) { this.fejl(D.FOERST.pulver); return; }
        if (this.iLuften() || !this.kolbe.stille()) { this.fejl(D.FOERST.falder); return; }
        this.noterEfter("ok");
    };

    function aktivRaekke(sim) { return sim.noteret; }

    /* Felterne faar ikke fokus af sig selv: aflaesningen er et klik i scenen */
    P.fokusFelt = function () {};

    function ryst(e) {
        var felt = e.parentNode;
        felt.classList.remove("ryst");
        void felt.offsetWidth;
        felt.classList.add("ryst");
    }

    P.tjekFelt = function (r, hvad) {
        if (r !== this.nr || this.faerdig) return;
        var e = inp(r, hvad);
        if (this.fase() === "valg") { this.gaetBlink(); return; }
        var raa = e.value;
        if (!String(raa).trim()) { this.besked("Skriv tallet fra vægten.", "gul"); return; }
        var t = T.tal(raa);
        if (!t) { ryst(e); this.besked("Skriv et tal, fx 1,02.", "skidt"); return; }
        var v = Math.round(t.v * 100);
        var kolbeV = Math.round(this.kolbe.visning() * 100);
        if (hvad === "f") {
            if (v === Math.round(this.proeve * 100)) { this.noterFoer(); return; }
            ryst(e);
            if (this.kolbe.ind > 0 && v === kolbeV) {
                this.besked("Det er vægten under kolben. m(før) står under vejebåden.", "skidt");
            } else {
                this.besked("Det står der ikke på vægten under vejebåden. Skriv tallet med to decimaler.", "skidt");
            }
            return;
        }
        if (this.baad > 1e-6) { ryst(e); this.fejl(D.FOERST.pulver); return; }
        var stille = !this.iLuften() && this.kolbe.stille();
        if (v === kolbeV && stille) { this.noterEfter("ok"); return; }
        ryst(e);
        if (v === kolbeV) {
            this.fejl(D.FOERST.falder);
        } else if (v === Math.round(this.proeve * 100)) {
            this.besked("Det er m(før). m(efter) står under kolben, når det er holdt op med at bruse.", "skidt");
        } else if (!stille) {
            this.fejl(D.FOERST.falder);
        } else {
            this.besked("Det står der ikke på vægten under kolben.", "skidt");
        }
    };

    /* stille: Vis svaret har allerede skrevet sin egen linje */
    P.noterFoer = function (stille) {
        this.noteret.mf = this.proeve;
        if (!stille) this.rosNaeste = NK.html("m(før) = " + K.g2(this.proeve) + " g står nu i skemaet.");
        this.glimt = { hvad: "f", t: 1 };
        this.visSkema();
    };

    P.noterEfter = function (maade) {
        var o = this.opg;
        this.noteret.me = this.kolbe.visning();
        NK.maalinger[this.nr] = { mf: this.noteret.mf, me: this.noteret.me };
        NK.gemMaalinger();
        var pre = "";
        if (o.valg && this.valgt !== null) {
            var s = o.valg.svar[this.valgt];
            pre = s.ok ? "Dit gæt holdt." : "Dit gæt holdt ikke.";
        }
        var ekstra = "";
        var mk = K.r2(this.noteret.mf - this.noteret.me) * D.FAKTOR;
        if (mk / this.noteret.mf > 1) ekstra = " Kolben tabte mere, end kalken kan give af CO₂. Noget sprøjtede ud. Tryk på Start forfra, og kom pulveret i lidt ad gangen.";
        this.forklaring = NK.html((pre ? pre + " " : "") + o.efter + ekstra);
        this.sidsteFase = "faerdig";
        this.glimt = { hvad: "e", t: 1 };
        this.trinLoest(maade, maade === "svar" ? NK.html(D.SVAR.efter.replace("{m}", K.g2(this.noteret.me))) : null);
        this.visSkema();
        if (NK.sims && NK.sims["fane-beregning"]) NK.sims["fane-beregning"].nyeMaalinger();
    };

    /* ----- Pulveret: spatlen, der flyver, og det, der falder ------------------------- */
    P.skefuld = function () {
        var m = Math.min(D.SPATEL, this.baad);
        if (this.baad - m < 0.05) m = this.baad;
        return m;
    };

    P.startFlyv = function (m) {
        var lay = this.lay, b = lay.baad, g = lay.kolbe;
        this.flyv.push({ t: 0, x0: b.x, y0: b.top - 8, x1: g.mund.x, y1: g.mund.y - 34 * g.k, m: m });
    };

    P.slipPulver = function (x, y, m) {
        var g = this.lay.kolbe;
        this.fald.push({ x: g.mund.x + NK.klamp(x - g.mund.x, -8 * g.k, 8 * g.k), y: y, vy: 0, m: m });
    };

    /* ----- Musen ------------------------------------------------------------------------- */
    /* Luppen kommer frem, naar det foerste pulver er i kolben */
    P.lupFremme = function () { return this.kolbe.ind > 0 || this.faerdig; };

    P.hvad = function (pt) {
        var lay = this.lay;
        if (!lay || !pt) return null;
        var b = lay.baad, g = lay.kolbe, z = lay.zoom;
        /* Et klik paa et skilt er et klik paa den ting, skiltet peger paa */
        var sk = this.skiltNu;
        if (sk && pt.x >= sk.r.x && pt.x <= sk.r.x + sk.r.b && pt.y >= sk.r.y && pt.y <= sk.r.y + sk.r.h) return sk.hvad;
        if (pt.x >= b.x - b.b * 0.55 && pt.x <= b.x + b.b * 0.55 && pt.y >= b.top - 24 && pt.y <= b.y + 10) return "baad";
        if (pt.x >= g.x0 && pt.x <= g.x0 + g.b && pt.y >= g.y0 && pt.y <= g.bund + 4) return "kolbe";
        if (pt.x >= lay.v1.x - lay.v1.b / 2 && pt.x <= lay.v1.x + lay.v1.b / 2 && pt.y >= lay.v1.top && pt.y <= lay.bordY) return "vaegt1";
        if (pt.x >= lay.v2.x - lay.v2.b / 2 && pt.x <= lay.v2.x + lay.v2.b / 2 && pt.y >= lay.v2.top && pt.y <= lay.bordY) return "vaegt2";
        if (this.lupFremme() && Math.hypot(pt.x - z.x, pt.y - z.y) < z.r) return "zoom";
        var m = lay.morter, s = lay.musling;
        if (s && pt.x >= s.x && pt.x <= s.x + s.b && pt.y >= s.y && pt.y <= s.y + s.h) return "musling";
        if (m && pt.x >= m.x && pt.x <= m.x + m.b && pt.y >= m.y && pt.y <= m.y + m.h) return "morter";
        return null;
    };

    P.overScene = function (pt) {
        this.over = this.hvad(pt);
        return this.over && this.over !== "zoom" ? this.over : null;
    };

    /* Klik viser, klik goer: vaegten aflaeses med et klik, og pulveret
       kommer i kolben med et klik (eller ved at traekke spatlen). Under
       gaettet udfoeres intet: det gule kort blinker i stedet. */
    P.nedScene = function (pt) {
        var u = this.hvad(pt), f = this.fase();
        if (u === "musling" || u === "morter") {
            var t;
            if (u === "musling") {
                this.muslingNr = ((this.muslingNr === undefined ? -1 : this.muslingNr) + 1) % D.MUSLING.length;
                t = D.MUSLING[this.muslingNr];
                this.vip = 1;
            } else t = D.MORTER;
            this.kortBesked(NK.html(t));
            return false;
        }
        if (!u) return false;
        if (f === "valg") { this.gaetBlink(); return false; }
        if (u === "baad") {
            if (this.faerdig) { this.kortBesked(this.gemtVist ? "Målingen er færdig. Tryk på Start forfra for at måle igen." : "Målingen er færdig."); return false; }
            if (f === "foer") { this.fejl(D.FOERST.foer); return false; }
            if (this.baad <= 1e-6) { this.kortBesked("Vejebåden er tom. Alt pulveret er i kolben."); return false; }
            var m = this.skefuld();
            this.baad -= m;
            this.spatel = { x: pt.x, y: pt.y, sx: pt.x, sy: pt.y, trukket: false, m: m };
            return true;
        }
        if (u === "vaegt1") {
            if (f === "foer") { this.noterFoer(); return false; }
            this.kortBesked("Vægten under vejebåden viser, hvor meget pulver der er i vejebåden.");
        }
        if (u === "vaegt2") {
            if (f === "efter" || f === "vent") { this.aflaesKolbe(); return false; }
            if (f === "haeld" && this.noteret.mf !== null && this.kolbe.ind > 0) { this.fejl(D.FOERST.pulver); return false; }
            this.kortBesked("Vægten under kolben blev sat til 0,00 g med kolben og saltsyren på. Den viser det, der er kommet i kolben, minus det, der er forsvundet.");
        }
        if (u === "kolbe") this.kortBesked("Kolben har 20 mL saltsyre. Vægten under den blev sat til 0,00 g med kolben og syren på.");
        if (u === "zoom") this.kortBesked("Luppen viser bunden af kolben. H₃O⁺ fra syren tager carbonat-ionerne fra kalken, og de bliver til CO₂ og vand.");
        return false;
    };

    P.flytScene = function (pt) {
        var s = this.spatel;
        if (!s) return;
        s.x = pt.x;
        s.y = pt.y;
        if (Math.hypot(pt.x - s.sx, pt.y - s.sy) > 6) s.trukket = true;
    };

    P.opScene = function (pt) {
        var s = this.spatel;
        if (!s) return;
        this.spatel = null;
        var g = this.lay.kolbe;
        if (!s.trukket) { this.startFlyv(s.m); return; }
        if (pt.x >= g.x0 - 10 && pt.x <= g.x0 + g.b + 10 && pt.y >= g.y0 - 120 * g.k && pt.y <= g.Y(150)) {
            this.slipPulver(pt.x, Math.min(pt.y, g.mund.y - 6), s.m);
            return;
        }
        this.baad += s.m;
        this.kortBesked("Slip spatlen over kolben. Et klik på pulveret virker også.");
    };

    /* ----- Layout ----------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var Hs = H;
        var lay = { W: W, H: H, Hs: Hs };
        /* Forsoeget begynder under den plads, kortet har faaet sat af */
        lay.top = this.kortZone() + 10;
        lay.bordY = Math.round(Hs - NK.klamp(Hs * 0.11, 52, 64));
        var fri = lay.bordY - lay.top;
        var zr = Math.round(NK.klamp(Math.min(W * 0.13, (fri - 96) / 2), 44, 128));
        var hoejre = W - 2 * zr - 40;
        var vb2 = NK.klamp(hoejre * 0.4, 150, 250), vb1 = NK.klamp(vb2 * 0.86, 130, 220);
        var vh2 = Tg.vaegtHoejde(vb2), vh1 = Tg.vaegtHoejde(vb1);
        var M = NK.Sprites.MAAL.vaegt;
        var skaal2Y = lay.bordY - (M.bund - M.skaalY) * vb2 / M.b;
        var skaal1Y = lay.bordY - (M.bund - M.skaalY) * vb1 / M.b;
        var kh = NK.klamp(Math.min(skaal2Y - lay.top - 6, vb2 * 1.2), 90, 290);
        var mb = NK.klamp(vb1 * 0.55, 60, 110);
        var gruppe = vb1 + 34 + vb2;
        var medPynt = hoejre - gruppe > mb + 40;
        if (medPynt) gruppe += mb + 30;
        var x0 = Math.max(12, (hoejre - gruppe) / 2 + 10);
        if (medPynt) {
            lay.morterX = x0 + mb / 2;
            lay.morterB = mb;
            x0 += mb + 30;
        }
        lay.v1 = { x: x0 + vb1 / 2, b: vb1, h: vh1, top: lay.bordY - vh1 };
        lay.v2 = { x: x0 + vb1 + 34 + vb2 / 2, b: vb2, h: vh2, top: lay.bordY - vh2 };
        lay.kolbe = Tg.kolbeGeo(lay.v2.x, skaal2Y + 3, kh);
        var bb = vb1 * M.skaalB / M.b * 0.78;
        lay.baad = { x: lay.v1.x, y: skaal1Y + 2, b: bb, top: skaal1Y - 20 };
        var cy = NK.klamp(lay.kolbe.y0 + kh * 0.35, lay.top + zr + 30, Math.max(lay.top + zr + 30, lay.bordY - zr - 56));
        lay.zoom = { x: W - zr - NK.klamp(W * 0.03, 16, 40), y: cy, r: zr };
        lay.lup = { x: lay.kolbe.cx + 18 * lay.kolbe.k, y: lay.kolbe.bund - 10 * lay.kolbe.k };
        this.lay = lay;
        this.saetAnker("baad", lay.v1.x - vb1 / 2, skaal1Y - 40, vb1, lay.bordY - skaal1Y + 40);
        this.saetAnker("kolbe", lay.v2.x - vb2 / 2, lay.kolbe.y0 - 10, vb2, lay.bordY - lay.kolbe.y0 + 10);
        this.saetAnker("zoom", lay.zoom.x - zr, lay.zoom.y - zr - 30, 2 * zr, 2 * zr + 90);
    };

    /* ----- Opdater ----------------------------------------------------------------------- */
    P.opdaterScene = function (dt) {
        var lay = this.lay;
        if (!lay) return;
        var g = lay.kolbe, mig = this;
        var tf = this.hurtig ? 15 : 1;
        /* Vis svaret: en spatelfuld ad gangen */
        if (this.autoHaeld) {
            this.autoHaeld.t -= dt;
            if (this.autoHaeld.t <= 0 && !this.iLuften()) {
                if (this.baad > 1e-6) { this.startFlyv(this.skefuld()); this.baad -= this.flyv[this.flyv.length - 1].m; }
                this.autoHaeld.t = 2.6;
                if (this.baad <= 1e-6) this.autoHaeld = null;
            }
        }
        /* Spatlen, der flyver selv */
        this.flyv.forEach(function (f) {
            f.t += dt / 0.65;
            if (f.t >= 1 && !f.slut) { f.slut = true; mig.slipPulver(f.x1, f.y1 + 6, f.m); }
        });
        this.flyv = this.flyv.filter(function (f) { return !f.slut; });
        /* Pulveret, der falder ned i syren */
        var nyt = [], ly = g.yV(this.kolbe.syreV);
        this.fald.forEach(function (p) {
            p.vy += 1300 * dt;
            p.y += p.vy * dt;
            if (p.y >= ly) mig.kolbe.tilsaet(p.m);
            else nyt.push(p);
        });
        this.fald = nyt;
        this.kolbe.opdater(dt * tf);
        if (this.hurtig && this.kolbe.stille()) this.hurtig = false;
        /* Draaber, naar det sproejter */
        var ds = this.kolbe.sprojt - this.sidstSprojt;
        this.sidstSprojt = this.kolbe.sprojt;
        if (ds > 0) {
            this.sprojtAkku += ds * 1500;
            var n = Math.floor(this.sprojtAkku);
            if (n > 0) { this.sprojtAkku -= n; this.draaber.sprojt(n); }
        }
        this.bobler.opdater(dt, this.kolbe.rate);
        this.pust.opdater(dt, this.kolbe.rate);
        this.draaber.opdater(dt, lay.bordY - g.mund.y);
        this.lup.opdater(dt * (this.hurtig ? 3 : 1), this.kolbe.kalk, this.kolbe.hcl / this.kolbe.hcl0);
        this.skum = NK.mod(this.skum, NK.klamp((this.kolbe.rate - 0.03) / 0.08, 0, 1), 3, dt);
        if (this.vip) this.vip = Math.max(0, this.vip - dt * 1.5);
        /* Mens Vis svaret haelder eller skruer tiden op, kan knappen ikke bruges */
        var auto = !!(this.autoHaeld || this.hurtig);
        if (auto !== !!this.auto) { this.auto = auto || null; this.visKnap(); }
        /* Det sproejtede: siges én gang pr. maaling, mens det sker */
        if (!this.sproejtSagt && !this.faerdig && this.kolbe.sprojt > 0.003) {
            this.sproejtSagt = true;
            this.fejl(D.FOERST.sproejt);
        }
        if (this.glimt) {
            this.glimt.t -= dt * 0.9;
            if (this.glimt.t <= 0) this.glimt = null;
        }
        /* Fasen */
        var f = this.fase();
        if (f !== this.sidsteFase) {
            this.sidsteFase = f;
            this.faseSkift(f);
        } else if (!this.faerdig) {
            /* Inden for samme fase kan det naeste skridt skifte (det bruser, eller der er ro) */
            var linje = this.trinLinje();
            if (linje !== this.sidsteLinje) { this.sidsteLinje = linje; this.visKort(); }
        }
    };

    /* ----- Tegn --------------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var g = lay.kolbe, t = this.tid;
        var f = this.fase(), n = this.noteret;
        this.L.ryd();
        Tg.rum(ctx, lay.W, lay.Hs, lay.bordY + 12);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.Hs);
        var px = NK.klamp(lay.v1.b * 0.07, 13, 15);
        var y1 = lay.bordY + 20, y2 = y1 + px + 7;

        /* Morteren og hjertemuslingen */
        if (lay.morterX) {
            var mo = Tg.morter(ctx, lay.morterX, lay.bordY, lay.morterB, this.over === "morter");
            lay.morter = mo;
            var sb = lay.morterB * 0.55;
            lay.musling = Tg.musling(ctx, lay.morterX + lay.morterB * 0.42, lay.bordY + 6, sb, this.over === "musling",
                Math.sin((this.vip || 0) * 12) * 0.12 * (this.vip || 0));
        } else { lay.morter = null; lay.musling = null; }

        /* Vaegt 1 med vejebaaden */
        var v1 = Tg.vaegt(ctx, lay.v1.x, lay.bordY, lay.v1.b, K.g2(this.baad) + " g", { lys: this.over === "vaegt1" ? 1 : 0 });
        var b = lay.baad;
        var bunke = Tg.bunke(ctx, b.x, b.y, b.b, Tg.PULVER, this.proeve > 0 ? this.baad / this.proeve : 0,
            NK.klamp(b.b * 0.26, 10, 30), 2);
        b.top = Math.min(bunke.top, b.y - 14);
        if (this.over === "baad" && this.baad > 1e-6 && f === "haeld") Tg.skaer(ctx, b.x, b.y - 8, b.b * 0.6, 24);
        /* Spatlen hviler paa vejebaaden, naar den ikke er i brug */
        if (!this.spatel && !this.flyv.length && this.baad > 1e-6) {
            Tg.spatel(ctx, b.x + b.b * 0.18, b.y - 12, NK.klamp(b.b * 0.95, 70, 150), -0.18, 0);
        }
        Tg.etiket(ctx, "Vejebåden", lay.v1.x, y1, px);
        if (n.mf !== null) {
            Tg.etiket(ctx, "m(før) = " + K.g2(n.mf) + " g ✓", lay.v1.x, y2, px + (this.glimt && this.glimt.hvad === "f" ? 2 * this.glimt.t : 0), "#7ee0a8");
        }

        /* Vaegt 2 med kolben */
        var v2 = Tg.vaegt(ctx, lay.v2.x, lay.bordY, lay.v2.b, K.g2(this.kolbe.visning()) + " g", { lys: this.over === "vaegt2" ? 1 : 0 });
        this.pust.tegn(ctx, g.mund.x, g.mund.y - 6, g.k);
        Tg.kolbe(ctx, g, { V: this.kolbe.syreV, kalk: this.kolbe.kalk, rest: this.kolbe.ind * (1 - D.SKAL.andel),
            skum: this.skum, uklar: NK.klamp(this.kolbe.kalk / 0.25, 0, 1), bobler: this.bobler, lys: this.over === "kolbe" ? 1 : 0 });
        this.draaber.tegn(ctx, g.mund.x, g.mund.y, lay.bordY - g.mund.y);
        Tg.etiket(ctx, "Kolben med 20 mL saltsyre", lay.v2.x, y1, px);
        /* Under kolben: det aflaeste tal, eller om vaegten falder eller staar stille */
        if (n.me !== null) {
            Tg.etiket(ctx, "m(efter) = " + K.g2(n.me) + " g ✓", lay.v2.x, y2, px + (this.glimt && this.glimt.hvad === "e" ? 2 * this.glimt.t : 0), "#7ee0a8");
        } else if (this.kolbe.ind > 0 && !this.faerdig) {
            var stille = !this.iLuften() && this.kolbe.stille();
            Tg.etiket(ctx, stille ? "Vægten står stille" : "Vægten falder ↓", lay.v2.x, y2, px, stille ? "#7ee0a8" : "#f2b36b");
        }

        /* Pulveret i luften og spatlen */
        var sbr = NK.klamp(b.b * 0.95, 70, 150);
        this.fald.forEach(function (p) { Tg.pulver(ctx, p.x, p.y, 18 * g.k, 8 * g.k, Tg.PULVER, 2); });
        this.flyv.forEach(function (fl) {
            var u = NK.blod(fl.t);
            var x = NK.lerp(fl.x0, fl.x1, u), y = NK.lerp(fl.y0, fl.y1, u) - Math.sin(u * Math.PI) * 50 * g.k;
            Tg.spatel(ctx, x, y, sbr, -0.08 + u * 0.4, 1);
        });
        if (this.spatel) Tg.spatel(ctx, this.spatel.x, this.spatel.y, sbr, -0.08, 1);

        /* Luppen kommer frem, naar det foerste pulver er i kolben */
        if (this.lupFremme()) {
            var z = lay.zoom;
            Tg.lupLinje(ctx, lay.lup.x, lay.lup.y, z.x - z.r, z.y);
            Tg.lup(ctx, this.lup, z.x, z.y, z.r, { titel: "Luppen: bunden af kolben", lys: this.over === "zoom" });
            var lk = NK.klamp(g.k * 0.42, 0.22, 0.5);
            NK.Sprites.tegn(ctx, "lup", lay.lup.x - 52 * lk, lay.lup.y - 52 * lk, 140 * lk, 140 * lk);
        }

        /* Det, der skal klikkes paa nu: en gul ring og et skilt med, hvad et
           klik goer. Skiltet kan selv klikkes (skiltNu, se hvad()). */
        this.skiltNu = null;
        if (f === "foer") {
            Tg.ring(ctx, v1.disp, t);
            this.skiltNu = { hvad: "vaegt1", r: Tg.skilt(ctx, v1.disp.x + v1.disp.b / 2, v1.disp.y - 7, D.SKILT.foer, t, lay.W) };
        } else if (f === "haeld" && !this.spatel) {
            if (this.kolbe.ind === 0 && !this.iLuften()) this.skiltNu = { hvad: "baad", r: Tg.skilt(ctx, b.x, b.top - 12, D.SKILT.haeld, t, lay.W) };
            else if (this.roligt()) this.skiltNu = { hvad: "baad", r: Tg.skilt(ctx, b.x, b.top - 12, D.SKILT.mere, t, lay.W) };
        } else if (f === "efter") {
            Tg.ring(ctx, v2.disp, t);
            this.skiltNu = { hvad: "vaegt2", r: Tg.skilt(ctx, v2.disp.x + v2.disp.b / 2, v2.disp.y - 7, D.SKILT.efter, t, lay.W) };
        }
    };

    NK.SimForsoeg = SimForsoeg;
}());
