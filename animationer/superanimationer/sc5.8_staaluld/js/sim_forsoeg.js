/* =====================================================================
   sim_forsoeg.js - fane 1: forsoeget

   En klump ståluld ligger paa en varmefast plade paa vaegten, og vaegten
   er nulstillet med pladen. Maaling 1 starter med et gratis gaet: en
   rolig startskaerm, der daekker hele scenen, med en kort indledning,
   spoergsmaalet og tre kort med billeder (Lettere, Det samme, Tungere).
   Intet sker bag den, mens eleven svarer. Saa aflaeser eleven m(før),
   taender stålulden med bunsenbraenderen (et klik, eller traek den hen,
   saa flammen roerer ulden), venter, til vaegten staar stille, og
   aflaeser m(efter). Uden ilt fra flasken gaar stålulden ud, foer alt
   jernet har reageret; klik paa flasken, mens den gloeder, holder den i
   live.

   Statuslinjen nederst i scenen siger det naeste skridt og har feltet
   til det tal, der skal aflaeses, og hint-knappen. En pil med et skilt
   staar over det, der skal klikkes paa (Klik for at tænde, Klik for
   mere ilt). Skemaet i panelet viser de tal, eleven har aflaest.

   Luppen viser overfladen af en ståltraad: O₂ fra luften saetter sig
   paa jernatomerne, og den inderste raekke naar ikke at reagere.
   Maalingerne gemmes og bruges paa fane 2.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var T = NK.Tjek;
    var Tg = NK.Tegn;

    /* ----- Maalingerne deles med fane 2 og huskes i browseren --------------------- */
    var NOEGLE_MAAL = "nk-sc4.8-maalinger";
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

    function gaetSvar(id) {
        return D.GAET.svar.filter(function (s) { return s.id === id; })[0] || null;
    }

    function SimForsoeg() {
        var mig = this;
        this.over = null;
        this.gaet = null;
        this.gaetUd = 0;
        this.tael = 0;
        this.feltFase = null;
        this.startFane(D.FORSOEG);
        this.el.fane = NK.el("fane-forsoeg");
        this.el.gaet = NK.el("forsoeg-gaet");
        this.el.gaetLinje = NK.el("forsoeg-gaetlinje");
        this.el.aflaes = NK.el("forsoeg-aflaes");
        this.el.aflaesNavn = NK.el("forsoeg-aflaesnavn");
        this.el.tal = NK.el("forsoeg-tal");
        this.bygGaet();
        this.el.tal.addEventListener("keydown", function (ev) {
            if (ev.key === "Enter") { ev.preventDefault(); mig.tjekFelt(); }
        });
        NK.el("forsoeg-talok").addEventListener("click", function () { mig.tjekFelt(); mig.fokus(); });
        this.vaelg(this.status[0].loest && !this.status[1].loest ? 1 : 0, false);
    }

    var P = SimForsoeg.prototype;
    NK.Fane.paa(P, { navn: "forsoeg", naesteFane: "fane-beregning", naesteNavn: "Beregningen", naesteTekst: "Næste måling →" });

    /* Er en maaling gemt, vises den faerdig. Start forfra maaler igen. */
    var vaelgFaelles = P.vaelg;
    P.vaelg = function (i, nyeTal) {
        vaelgFaelles.call(this, i, nyeTal);
        if (this.gemtVist) this.besked("Målingen står i skemaet. Tryk på Start forfra for at måle igen.", "god");
        this.visSkema();
        this.visGaet();
        this.fokus();
    };

    /* ----- Opgaven -------------------------------------------------------------- */
    P.lavOpgave = function (i) {
        var o = D.FORSOEG[i];
        this.opg = o;
        this.forklaring = "";
        var gemt = NK.maalinger[i];
        var vis = !!(this.status[i].loest && gemt);
        this.nyMaaling(vis ? gemt.mf : null, vis ? K.udbytteAf(gemt.mf, gemt.me) : null);
        if (vis) {
            /* Den faerdige maaling: stålulden er braendt */
            this.gemtVist = true;
            this.klump.taendt = true;
            this.klump.p = 1;
            this.uld.saetTaendt(-0.7, 0.2);
            this.lup.saetFaerdig(this.klump.reageret());
            this.noteret = { mf: gemt.mf, me: gemt.me };
            this.faerdig = true;
        }
        this.sidsteFase = this.fase();
    };

    /* En ny klump (m: en bestemt masse, ellers en ny; udbytte: ellers et nyt) */
    P.nyMaaling = function (m, udbytte) {
        if (!m) {
            var andre = NK.maalinger.filter(Boolean).map(function (x) { return x.mf; });
            if (this.proeve) andre.push(this.proeve);
            var mulige = D.KLUMPER.filter(function (x) { return andre.indexOf(x) < 0; });
            m = NK.tilfaeldig(mulige.length ? mulige : D.KLUMPER);
        }
        this.tael++;
        var nr = (this.nr || 0) * 17 + this.tael;
        this.proeve = m;
        this.klump = new K.Klump(m, udbytte || K.nytUdbytte());
        this.uld = new Tg.Uld(nr, m);
        this.lup = new Tg.LupJern(nr + 3);
        this.gnister = new Tg.Gnister(nr + 5);
        this.brn = { x: null, y: null, v: 0, holdt: null, flyv: null };
        this.noteret = { mf: null, me: null };
        this.hurtig = false;
        this.auto = null;
        this.rosNaeste = "";
        this.rosKlasse = "god";
        this.holdSvar = "";
        this.sidsteFase = null;
        this.gemtVist = false;
        this.feltFase = null;
        if (this.lay) this.layout();
    };

    P.harForfra = function () { return true; };

    /* Start forfra: en ny klump med den samme masse (gaettet bliver) */
    P.forfra = function () {
        var m = this.proeve;
        this.faerdig = false;
        this.nyMaaling(m, null);
        this.sidsteFase = this.fase();
        this.hjaelp = 0;
        this.pegKnap = false;
        this.brugtSvar = false;
        this.visKort();
        this.visListe();
        this.besked("En ny klump ståluld på vægten. " + this.trinLinje(), "");
        this.visSkema();
        this.visGaet();
        this.fokus();
    };

    P.promptHTML = function () {
        return '<p class="maal-tekst">' + NK.html(this.opg.tekst) + "</p>";
    };

    /* Under det gratis gaet er der ingen hint-knap */
    P.knapSkjult = function () { return this.fase() === "valg"; };

    /* ----- Det gratis gaet: startskaermen ------------------------------------------------- */
    P.bygGaet = function () {
        var mig = this, e = this.el.gaet, G = D.GAET;
        e.innerHTML = '<span class="gaet-etiket">' + NK.html(G.etiket) + '</span><p class="gaet-intro">' + NK.html(G.intro) +
            "</p><h2>" + NK.html(G.spm) + '</h2><div class="gaet-kort"></div><p class="gaet-note">' + NK.html(G.note) + "</p>";
        var r = e.querySelector(".gaet-kort");
        G.svar.forEach(function (s) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "gk";
            b.setAttribute("data-gaet", s.id);
            b.innerHTML = '<img src="sprites/' + s.billede + '" alt="">' +
                '<span class="gk-titel"><span class="gk-pil">' + s.pil + "</span>" + NK.html(s.t) + "</span>" +
                '<span class="gk-tekst">' + NK.html(s.tekst) + "</span>";
            b.addEventListener("click", function () { mig.vaelgGaet(s.id); });
            r.appendChild(b);
        });
    };

    /* Mens der gaettes, daekker startskaermen scenen, og panelet er daempet */
    P.visGaet = function () {
        var e = this.el.gaet, valg = this.fase() === "valg";
        if (valg) {
            e.hidden = false;
            e.classList.remove("vaek", "valgt");
            [].forEach.call(e.querySelectorAll(".gk"), function (b) { b.classList.remove("valgt"); b.disabled = false; });
            this.gaetUd = 0;
        } else if (!(this.gaetUd > 0)) {
            e.hidden = true;
        }
        this.el.fane.classList.toggle("gaetter", valg);
        this.visGaetLinje();
    };

    P.vaelgGaet = function (id) {
        if (this.fase() !== "valg" || !gaetSvar(id)) return;
        this.gaet = id;
        var e = this.el.gaet;
        e.classList.add("valgt");
        [].forEach.call(e.querySelectorAll(".gk"), function (b) {
            b.classList.toggle("valgt", b.getAttribute("data-gaet") === id);
            b.disabled = true;
        });
        /* Det valgte kort staar et ojeblik, saa glider det hele vaek */
        this.gaetUd = 1.0;
        this.rosNaeste = NK.html("Dit gæt: " + gaetSvar(id).t.toLowerCase() + ".");
        this.rosKlasse = "";
        this.visGaetLinje();
    };

    /* Gaettet under skemaet, med billedet i lille udgave */
    P.visGaetLinje = function () {
        var e = this.el.gaetLinje, s = this.gaet ? gaetSvar(this.gaet) : null;
        if (!s || this.nr !== 0 || this.gemtVist) { e.innerHTML = ""; return; }
        var efter = "";
        if (this.faerdig) efter = s.ok ? ' <span class="holdt">Det holdt.</span>' : ' <span class="ikke">Den blev tungere.</span>';
        e.innerHTML = '<img src="sprites/' + s.billede + '" alt=""><span>Dit gæt: <b>' + NK.html(s.t.toLowerCase()) + "</b>." + efter + "</span>";
    };

    /* ----- Faserne ------------------------------------------------------------------ */
    P.fase = function () {
        if (this.faerdig) return "faerdig";
        if (this.opg.gaet && this.gaet === null) return "valg";
        if (this.noteret.mf === null) return "foer";
        if (!this.klump.taendt) return "taend";
        if (this.klump.braender()) return "vent";
        return "efter";
    };

    P.opgaveFaerdig = function () { return this.noteret.me !== null; };

    P.trinLinje = function () {
        var f = this.fase();
        if (f === "faerdig") return "";
        if (f === "foer" && this.klump.taendt) {
            return "Stålulden er tændt, men m(før) mangler. Skriv den, hvis du nåede at se den, eller tryk på Start forfra.";
        }
        return D.LINJE[f];
    };

    P.slutLinje = function () { return this.forklaring; };

    /* Fasen skifter: linjen siger det naeste skridt (efter en kort ros,
       hvis eleven lige har aflaest rigtigt) */
    P.faseSkift = function (f) {
        this.hjaelp = 0;
        this.pegKnap = false;
        if (f !== "faerdig") {
            if (this.holdSvar) this.besked(this.holdSvar + " " + this.trinLinje(), "gul");
            else this.besked((this.rosNaeste ? this.rosNaeste + " " : "") + this.trinLinje(), this.rosNaeste ? this.rosKlasse : "");
        }
        this.holdSvar = "";
        this.rosNaeste = "";
        this.rosKlasse = "god";
        this.visKnap();
        this.visSkema();
        this.visGaet();
        if (f === "foer" || f === "efter") this.fokus();
    };

    /* ----- Knappen: hint og svar for den fase, man er i ------------------------------ */
    P.trinInfo = function () {
        var mig = this, f = this.fase();
        if (f === "faerdig" || f === "valg") return null;
        return { hint: NK.html(D.HINT[f]), svar: function () { mig.visSvar(f); } };
    };

    /* Svaret staar i linjen, ogsaa naar fasen skifter lige efter (holdSvar) */
    P.visSvar = function (f) {
        this.brugtSvar = true;
        var maerke = '<span class="b-maerke">Svaret</span> ';
        if (f === "foer") {
            this.holdSvar = maerke + NK.html(D.SVAR.foer.replace("{m}", K.g2(this.proeve)));
            this.noterFoer();
            this.rosNaeste = "";
        } else if (f === "taend") {
            this.holdSvar = maerke + NK.html(D.SVAR.taend);
            this.besked(this.holdSvar, "gul");
            this.flyvBraender();
        } else if (f === "vent") {
            this.hurtig = true;
            this.holdSvar = maerke + NK.html(D.SVAR.vent);
            this.besked(this.holdSvar, "gul");
        } else if (f === "efter") {
            this.noterEfter("svar");
        }
    };

    /* ----- Skemaet i panelet og feltet i statuslinjen ------------------------------------ */
    function celle(r, hvad) { return NK.el("forsoeg-" + hvad + r); }

    /* Skemaet viser de tal, eleven har aflaest; cellen, der mangler nu, har en ramme */
    P.visSkema = function () {
        var mig = this, f = this.fase();
        [0, 1].forEach(function (r) {
            var aktiv = r === mig.nr;
            var tal = aktiv ? mig.noteret : (NK.maalinger[r] || { mf: null, me: null });
            ["f", "e"].forEach(function (hvad) {
                var e = celle(r, hvad), v = hvad === "f" ? tal.mf : tal.me;
                var har = v !== null && v !== undefined;
                e.textContent = har ? K.g2(v) + " g" : "";
                e.classList.toggle("ok", har);
                e.classList.toggle("nu", aktiv && !har && ((hvad === "f" && f === "foer") || (hvad === "e" && f === "efter")));
            });
            NK.el("forsoeg-r" + r).classList.toggle("valgt", aktiv);
        });
        var m = this.noteret;
        NK.saetTekst("forsoeg-note", m && m.mf !== null && m.me !== null ?
            "Stålulden tog " + K.g2(m.me) + " g − " + K.g2(m.mf) + " g = " + K.g2(K.r2(m.me - m.mf)) + " g på." : "");
        this.visFelt();
    };

    /* Feltet i statuslinjen er der kun, naar et tal skal aflaeses */
    P.visFelt = function () {
        var f = this.fase(), aaben = f === "foer" || f === "efter";
        this.el.aflaes.hidden = !aaben;
        if (!aaben) { this.feltFase = null; return; }
        if (this.feltFase !== f) { this.el.tal.value = ""; this.feltFase = f; }
        this.el.aflaesNavn.textContent = D.FELT[f] + " =";
        this.el.tal.setAttribute("aria-label", D.FELT[f] + " i gram");
    };

    P.fokusFelt = function () {
        if (!this.el.aflaes.hidden) this.el.tal.focus({ preventScroll: true });
    };

    P.rystFelt = function () {
        var felt = this.el.aflaes;
        felt.classList.remove("ryst");
        void felt.offsetWidth;
        felt.classList.add("ryst");
    };

    P.tjekFelt = function () {
        var f = this.fase();
        if (this.faerdig || (f !== "foer" && f !== "efter")) return;
        var raa = this.el.tal.value;
        if (!String(raa).trim()) { this.besked("Skriv tallet fra vægten i feltet.", "gul"); return; }
        var t = T.tal(raa);
        if (!t) { this.rystFelt(); this.besked("Skriv et tal, fx 4,25.", "skidt"); return; }
        var v = Math.round(t.v * 100);
        var nu = Math.round(this.klump.visning() * 100), m0 = Math.round(this.proeve * 100);
        if (f === "foer") {
            if (v === m0) { this.noterFoer(); return; }
            this.rystFelt();
            if (this.klump.taendt && v === nu) {
                this.besked("Det er det, vægten viser nu. m(før) er massen, før stålulden brændte. Tryk på Start forfra, hvis du ikke nåede at se den.", "skidt");
            } else {
                this.besked("Det står der ikke på vægten. Skriv tallet med to decimaler.", "skidt");
            }
            return;
        }
        if (v === nu) { this.noterEfter("ok"); return; }
        this.rystFelt();
        if (v === m0) this.besked("Det er m(før). m(efter) er det, vægten viser nu, hvor stålulden er brændt.", "skidt");
        else this.besked("Det står der ikke på vægten. Skriv tallet med to decimaler.", "skidt");
    };

    P.noterFoer = function () {
        this.noteret.mf = this.proeve;
        this.rosNaeste = NK.tilfaeldig(D.ROS_AFLAEST);
        this.rosKlasse = "god";
        this.visSkema();
    };

    P.noterEfter = function (maade) {
        var o = this.opg;
        this.noteret.me = this.klump.visning();
        NK.maalinger[this.nr] = { mf: this.noteret.mf, me: this.noteret.me };
        NK.gemMaalinger();
        var s = o.gaet && this.gaet ? gaetSvar(this.gaet) : null;
        var dele = [];
        if (s && s.ok) dele.push("Dit gæt holdt.");
        dele.push("Stålulden tog " + K.g2(K.r2(this.noteret.me - this.noteret.mf)) + " g på.");
        dele.push(s && !s.ok ? s.forkl : o.efter);
        if (this.klump.ude) dele.push(this.klump.brugtIlt ? "Den gik ud, før alt jernet havde reageret." : D.UDEN_ILT);
        this.forklaring = NK.html(dele.join(" "));
        this.sidsteFase = "faerdig";
        this.trinLoest(maade, maade === "svar" ? NK.html(D.SVAR.efter.replace("{m}", K.g2(this.noteret.me))) : null);
        this.visSkema();
        this.visGaetLinje();
        if (NK.sims && NK.sims["fane-beregning"]) NK.sims["fane-beregning"].nyeMaalinger();
    };

    P.blokValg = function () {
        this.kortBesked(D.LINJE.valg);
    };

    /* ----- Bunsenbraenderen: klik paa den, eller traek den hen, saa flammen roerer ulden ---
       Den holdes vandret med flammen mod hoejre (brugerens oenske 28. sept.
       2026). Roerer flammespidsen ulden, gaar den i brand. */
    P.brnHjem = function () {
        var b = this.lay.brn;
        return { x: b.x, y: b.y, v: 0 };
    };

    P.brnPos = function () {
        if (this.brn.x === null) { var h = this.brnHjem(); this.brn.x = h.x; this.brn.y = h.y; }
        return this.brn;
    };

    /* Punktet paa ulden, flammen roerer ved et klik: venstre side */
    P.uldKontakt = function () {
        var u = this.lay.uld;
        return { x: u.cx - u.rx * 0.7, y: u.cy - u.ry * 0.1 };
    };

    /* Flammespidsen, som braenderen holdes nu */
    P.spids = function () {
        var b = this.brnPos();
        return Tg.bunsenSpids(b.x, b.y, this.lay.brn.h, b.v);
    };

    /* Grebet, naar braenderen holdes vandret med flammespidsen i punktet */
    P.grebFor = function (pt) {
        var v = Math.PI / 2, s = Tg.bunsenSpids(0, 0, this.lay.brn.h, v);
        return { x: pt.x - s.x, y: pt.y - s.y, v: v };
    };

    /* Braenderen flyver selv hen til ulden, taender den og flyver hjem */
    P.flyvBraender = function () {
        if (this.brn.flyv || this.klump.taendt) return;
        var b = this.brnPos();
        this.brn.flyv = { t: 0, fra: { x: b.x, y: b.y, v: b.v }, til: this.grebFor(this.uldKontakt()), slags: "hen" };
    };

    P.braenderHjem = function () {
        var b = this.brnPos();
        this.brn.flyv = { t: 0, fra: { x: b.x, y: b.y, v: b.v }, til: this.brnHjem(), slags: "hjem" };
    };

    P.taend = function (pt) {
        if (this.klump.taendt) return;
        var u = this.lay.uld;
        var ux = NK.klamp((pt.x - u.cx) / u.rx, -1, 1), uy = NK.klamp((pt.y - u.cy) / u.ry, -1, 1);
        var d = Math.hypot(ux, uy);
        if (d > 0.95) { ux *= 0.95 / d; uy *= 0.95 / d; }
        this.klump.taend();
        this.uld.saetTaendt(ux, uy);
        this.gnister.stoed(u.cx + ux * u.rx, u.cy + uy * u.ry, 26, 1.2);
        /* Taendt, foer m(før) er skrevet: fasen er den samme, men linjen skifter */
        if (this.noteret.mf === null) this.besked(this.trinLinje(), "gul");
    };

    /* Er punktet paa (eller lige ved) ulden? */
    P.paaUld = function (pt, luft) {
        var u = this.lay.uld, l = luft || 1;
        var dx = (pt.x - u.cx) / (u.rx * l), dy = (pt.y - u.cy) / (u.ry * l);
        return dx * dx + dy * dy <= 1;
    };

    P.opdaterBraender = function (dt) {
        var b = this.brnPos(), f = b.flyv;
        if (f) {
            f.t += dt / (f.slags === "vent" ? 0.6 : 0.7);
            var u = NK.blod(Math.min(1, f.t));
            if (f.slags !== "vent") {
                b.x = NK.lerp(f.fra.x, f.til.x, u);
                b.y = NK.lerp(f.fra.y, f.til.y, u) - Math.sin(u * Math.PI) * 30;
                b.v = NK.lerp(f.fra.v, f.til.v, u);
            }
            if (f.t >= 1) {
                if (f.slags === "hen") {
                    this.taend(this.spids());
                    b.flyv = { t: 0, slags: "vent" };
                } else if (f.slags === "vent") {
                    this.braenderHjem();
                } else {
                    b.flyv = null;
                }
            }
        } else if (b.holdt) {
            /* Mens den holdes, vendes den vandret, og roerer flammen ulden, gaar den i brand */
            if (b.holdt.trukket) b.v = NK.mod(b.v, Math.PI / 2, 8, dt);
            if (!this.klump.taendt && b.v > 1.0 && this.paaUld(this.spids(), 1.0)) this.taend(this.spids());
        } else if (this.lay) {
            var h = this.brnHjem();
            b.x = h.x; b.y = h.y; b.v = 0;
        }
    };

    /* ----- Musen ------------------------------------------------------------------------- */
    P.hvad = function (pt) {
        var lay = this.lay;
        if (!lay || !pt) return null;
        var b = this.brnPos();
        if (Tg.bunsenRamt(b.x, b.y, lay.brn.h, b.v, pt)) return "braender";
        var fl = lay.flGeo;
        if (fl && pt.x >= fl.x0 - 4 && pt.x <= fl.x0 + fl.b + 4 && pt.y >= fl.y0 && pt.y <= lay.bordY) return "flaske";
        if (lay.dyse && Math.hypot(pt.x - lay.dyse.x - 6, pt.y - lay.dyse.y) < 12) return "flaske";
        if (this.paaUld(pt, 1.15)) return "uld";
        var z = lay.zoom;
        if (Math.hypot(pt.x - z.x, pt.y - z.y) < z.r) return "zoom";
        var v = lay.v;
        if (pt.x >= v.x - v.b / 2 && pt.x <= v.x + v.b / 2 && pt.y >= v.top && pt.y <= lay.bordY) return "vaegt";
        return null;
    };

    P.overScene = function (pt) {
        this.over = this.hvad(pt);
        return this.over && this.over !== "zoom" ? this.over : null;
    };

    P.nedScene = function (pt) {
        var u = this.hvad(pt), k = this.klump;
        if (u === "braender") {
            if (this.faerdig) { this.kortBesked(this.gemtVist ? "Målingen er færdig. Tryk på Start forfra for at måle igen." : "Målingen er færdig."); return false; }
            if (this.fase() === "valg") { this.blokValg(); return false; }
            if (k.taendt) {
                this.kortBesked(k.braender() ? "Stålulden gløder allerede." : (k.ude ?
                    "Stålulden er gået ud og kan ikke tændes igen. Tryk på Start forfra for en ny klump, og brug iltflasken, mens den gløder." :
                    "Stålulden er brændt færdig. Tryk på Start forfra for en ny klump."));
                return false;
            }
            if (this.brn.flyv) return false;
            var b = this.brnPos();
            b.holdt = { sx: pt.x, sy: pt.y, dx: b.x - pt.x, dy: b.y - pt.y, trukket: false };
            return true;
        }
        if (u === "flaske") {
            if (k.braender()) {
                k.givIlt();
                this.kortBesked("Ren ilt fra flasken. Stålulden gløder kraftigere.", 2.5);
            } else if (k.ude) {
                this.kortBesked("Stålulden er gået ud. Ilten skal på, mens den gløder.");
            } else if (k.taendt) {
                this.kortBesked("Alt det jern, ilten kan nå, har reageret.");
            } else {
                this.kortBesked("Iltflasken giver ren ilt. Brug den, når stålulden gløder.");
            }
            return false;
        }
        if (u === "uld") {
            if (this.fase() === "valg") { this.blokValg(); return false; }
            this.kortBesked(!k.taendt ? "Ståluld er tynde tråde af jern. Tænd den med bunsenbrænderen." :
                (k.braender() ? "Stålulden gløder. Jernet reagerer med ilten i luften." :
                    (k.ude ? "Stålulden er gået ud. De grå tråde nåede ikke at reagere." :
                        "Stålulden er blevet sort. Jernet er blevet til jernoxid.")));
        }
        if (u === "vaegt") this.kortBesked("Vægten er nulstillet med den varmefaste plade. Den viser kun stålulden.");
        if (u === "zoom") this.kortBesked("Luppen viser overfladen af en ståltråd. Ilten sætter sig på jernatomerne. Nitrogen i luften reagerer ikke.");
        return false;
    };

    P.flytScene = function (pt) {
        var b = this.brn, h = b.holdt;
        if (!h) return;
        b.x = pt.x + h.dx;
        b.y = pt.y + h.dy;
        if (Math.hypot(pt.x - h.sx, pt.y - h.sy) > 6) h.trukket = true;
    };

    P.opScene = function () {
        var b = this.brn, h = b.holdt;
        if (!h) return;
        b.holdt = null;
        if (!h.trukket) { this.flyvBraender(); return; }
        if (this.klump.taendt) { this.braenderHjem(); return; }
        /* Sluppet lige ved ulden: flammen naar den, naar braenderen er vandret */
        var s = Tg.bunsenSpids(b.x, b.y, this.lay.brn.h, Math.PI / 2);
        if (this.paaUld(s, 1.5) || this.paaUld(this.spids(), 1.3)) {
            this.taend(this.paaUld(this.spids(), 1.0) ? this.spids() : this.uldKontakt());
            b.flyv = { t: 0, slags: "vent" };
            return;
        }
        this.braenderHjem();
        this.kortBesked("Hold flammen mod stålulden, eller klik bare på brænderen.");
    };

    /* ----- Layout ----------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var baand = this.baand();
        var Hs = baand.y;
        var lay = { W: W, H: H, Hs: Hs };
        var MA = NK.Sprites.MAAL;
        /* Bordets forkant er hoej paa en hoej scene: saa staar tingene midt i
           billedet, og en lang linje i statuslinjen daekker kun forkanten */
        lay.bordY = Math.round(Hs - NK.klamp(Hs * 0.12, 16, 88));
        var zr = Math.round(NK.klamp(Math.min(W * 0.14, Hs * 0.25), 52, 140));
        var kant = NK.klamp(W * 0.03, 14, 36);
        lay.zoom = { x: W - zr - kant, y: 0, r: zr };
        var hoejre = lay.zoom.x - zr - 24;
        var vb = NK.klamp(hoejre * 0.44, 140, 330);
        var vh = Tg.vaegtHoejde(vb);
        var fh = NK.klamp(Math.min(lay.bordY - 70, vb * 0.95), 110, 290), fb = fh * MA.iltflaske.b / MA.iltflaske.h;
        var bh = NK.klamp(Math.min(vb * 0.7, lay.bordY * 0.55), 90, 210), bbr = bh * MA.bunsen.b / MA.bunsen.h;
        var gruppe = bbr + 30 + vb + 30 + fb;
        var x0 = Math.max(10, (hoejre - gruppe) / 2 + 6);
        var hj = Tg.bunsenHjem(x0 + bbr / 2, lay.bordY, bh);
        lay.brn = { x: hj.x, y: hj.y, h: bh, b: bbr, x0: x0 };
        x0 += bbr + 30;
        lay.v = { x: x0 + vb / 2, b: vb, h: vh, top: lay.bordY - vh };
        x0 += vb + 30;
        lay.fl = { x: x0 + fb / 2, h: fh, b: fb };
        lay.flGeo = Tg.flaskeGeo(lay.fl.x, lay.bordY, fh);
        var M = MA.vaegt, k = vb / M.b;
        var skaalY = lay.bordY - (M.bund - M.skaalY) * k;
        var pb = M.skaalB * k * 0.92, ph = NK.klamp(vb * 0.035, 5, 10);
        lay.plade = { x: lay.v.x, bund: skaalY + 2, b: pb, h: ph };
        var s = Math.pow((this.proeve || 4) / 4, 1 / 3);
        var rx = NK.klamp(vb * 0.25 * s, 32, pb * 0.5), ry = rx * 0.58;
        lay.uld = { cx: lay.v.x, cy: skaalY + 2 - ph - ry * 0.8, rx: rx, ry: ry };
        lay.dyse = { x: lay.uld.cx + rx + 14 * k, y: lay.uld.cy - ry * 0.1 };
        lay.zoom.y = NK.klamp(lay.uld.cy - 20, zr + 38, lay.bordY - zr - 64);
        lay.lupPunkt = { x: lay.uld.cx + rx * 0.3, y: lay.uld.cy - ry * 0.35 };
        /* Rammen om braenderen: fra flammens top til foden */
        var flTop = Tg.bunsenMund(hj.x, hj.y, bh, 0).y - Tg.flammeLaengde(bh);
        lay.brnRamme = { x: lay.brn.x0 - 6, y: flTop - 4, b: bbr + 12, h: lay.bordY - flTop + 4 };
        this.lay = lay;
        var fgTop = lay.bordY - fh;
        this.saetAnker("vaegt", lay.v.x - vb / 2, lay.uld.cy - ry - 8, vb, lay.bordY - (lay.uld.cy - ry - 8));
        this.saetAnker("braender", lay.brnRamme.x, lay.brnRamme.y, lay.brnRamme.b, lay.brnRamme.h);
        this.saetAnker("flaske", lay.fl.x - fb / 2 - 4, fgTop - 4, fb + 8, fh + 4);
        this.saetAnker("zoom", lay.zoom.x - zr, lay.zoom.y - zr - 30, 2 * zr, 2 * zr + 64);
        if (this.brn && !this.brn.holdt && !this.brn.flyv) { this.brn.x = lay.brn.x; this.brn.y = lay.brn.y; this.brn.v = 0; }
    };

    /* ----- Opdater ----------------------------------------------------------------------- */
    P.opdaterScene = function (dt) {
        var lay = this.lay;
        if (!lay) return;
        var f = this.fase();
        /* Mens der gaettes, staar scenen stille bag startskaermen */
        if (f !== "valg") {
            var tf = this.hurtig ? 15 : 1;
            this.opdaterBraender(dt);
            this.klump.opdater(dt * tf);
            if (this.hurtig && this.klump.stille()) this.hurtig = false;
            var k = this.klump;
            /* Gnisterne fra den gloedende front: faerre, naar gloeden doer */
            var u = lay.uld, kilder = this.uld.frontPunkter(k.p, u.cx, u.cy, u.rx, u.ry);
            var rate = k.braender() ? (k.ilt > 0 ? 70 : 24) * NK.klamp(kilder.length / this.uld.t.length * 5, 0.25, 1) *
                NK.klamp(k.G * 1.5, 0.15, 1) : 0;
            this.gnister.opdater(dt, rate, kilder);
            this.lup.opdater(dt * (this.hurtig ? 3 : 1), k.reageret(), k.ilt > 0, k.braender());
            /* Ilten fra flasken ses i gloeden og slangen */
            this.iltVis = NK.mod(this.iltVis || 0, k.ilt > 0 ? 1 : 0, 6, dt);
        }
        /* Startskaermen glider vaek, naar der er gaettet */
        if (this.gaetUd > 0) {
            this.gaetUd -= dt;
            if (this.gaetUd < 0.5) this.el.gaet.classList.add("vaek");
            if (this.gaetUd <= 0) { this.gaetUd = 0; this.el.gaet.hidden = true; }
        }
        /* Mens braenderen flyver selv, eller Vis svaret skruer tiden op, kan knappen ikke bruges */
        var auto = !!(this.brn.flyv || this.hurtig);
        if (auto !== !!this.auto) { this.auto = auto || null; this.visKnap(); }
        /* Fasen */
        f = this.fase();
        if (f !== this.sidsteFase) {
            this.sidsteFase = f;
            this.faseSkift(f);
        }
    };

    /* ----- Tegn --------------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var f = this.fase();
        /* Bag startskaermen tegnes intet om */
        if (f === "valg" && this.tegnet) return;
        this.tegnet = true;
        var t = this.tid, k = this.klump, over = this.over;
        this.L.ryd();
        Tg.rum(ctx, lay.W, lay.Hs, lay.bordY + 12);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.Hs);
        var px = NK.klamp(lay.v.b * 0.06, 13, 15), ety = lay.bordY + 12 + Math.min(13, (lay.Hs - lay.bordY - 12) / 2);
        var b = this.brnPos(), iHaanden = !!(b.holdt || b.flyv);
        var peger = f === "taend" && !iHaanden;

        /* Gasslangen fra braenderen ud ad bordets venstre kant */
        Tg.gasslange(ctx, b.x, b.y, lay.brn.h, b.v, lay.bordY);

        /* Vaegten, pladen og ulden */
        var v = Tg.vaegt(ctx, lay.v.x, lay.bordY, lay.v.b, K.g2(k.visning()) + " g", { lys: over === "vaegt" ? 1 : 0 });
        Tg.plade(ctx, lay.plade.x, lay.plade.bund, lay.plade.b, lay.plade.h);
        this.iltVis = this.iltVis || 0;
        Tg.gloed(ctx, this.uld, k.braender() ? (0.7 + 0.5 * this.iltVis) * NK.klamp(k.G * 1.5, 0, 1) : 0);
        var u = lay.uld;
        Tg.uld(ctx, this.uld, u.cx, u.cy, u.rx, u.ry, { p: k.p, gloed: k.G, ilt: this.iltVis, tid: t, lys: over === "uld" });
        Tg.etiket(ctx, "Vægten", lay.v.x, ety, px);

        /* Braenderen paa bordet (i haanden tegnes den til sidst, oven paa alt).
           Naar den skal bruges, har den en gul ring, der pulserer. */
        if (!iHaanden) {
            if (peger) Tg.ring(ctx, lay.brnRamme.x, lay.brnRamme.y, lay.brnRamme.b, lay.brnRamme.h, t);
            Tg.bunsen(ctx, b.x, b.y, lay.brn.h, b.v, t, over === "braender" || peger);
            Tg.etiket(ctx, "Bunsenbrænder", lay.brn.x, ety, px, peger ? "#f2c53d" : undefined);
        }

        /* Iltflasken og slangen */
        Tg.flaske(ctx, lay.flGeo, over === "flaske");
        Tg.slange(ctx, lay.flGeo.udtag, lay.dyse, this.iltVis, t, NK.klamp(lay.fl.h / 220, 0.6, 1.2));
        Tg.etiket(ctx, "Ilt", lay.fl.x, ety, px);

        /* Gnisterne */
        this.gnister.tegn(ctx);

        /* Luppen */
        var z = lay.zoom;
        Tg.lupLinje(ctx, lay.lupPunkt.x, lay.lupPunkt.y, z.x - z.r, z.y);
        Tg.lup(ctx, this.lup, z.x, z.y, z.r, { titel: "Luppen: en ståltråd", lys: over === "zoom", maksX: lay.W });

        /* Braenderen i haanden eller paa vej */
        if (iHaanden) Tg.bunsen(ctx, b.x, b.y, lay.brn.h, b.v, t, false);

        /* Pilen over det, der skal bruges nu. Ved braenderen og iltflasken
           staar der paa et skilt, hvad et klik goer. */
        if (f === "foer" && !k.taendt) Tg.pegepil(ctx, lay.v.x, v.disp.y - 8, t);
        else if (peger) Tg.pegepil(ctx, lay.brn.x, lay.brnRamme.y - 6, t, D.SKILT.taend, 8, lay.W - 8);
        else if (f === "vent" && k.ilt <= 0 && !this.hurtig) Tg.pegepil(ctx, lay.flGeo.hjul.x, lay.flGeo.y0 - 10, t, D.SKILT.ilt, 8, lay.W - 8);
        else if (f === "efter") Tg.pegepil(ctx, lay.v.x, v.disp.y - 8, t);
    };

    NK.SimForsoeg = SimForsoeg;
}());
