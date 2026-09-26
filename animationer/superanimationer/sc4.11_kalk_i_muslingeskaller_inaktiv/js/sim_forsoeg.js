/* =====================================================================
   sim_forsoeg.js - fane 1: forsoeget

   To vaegte paa bordet. Paa den ene staar vejebaaden med knust
   muslingeskal, paa den anden den koniske kolbe med 20 mL 4 M saltsyre,
   og den vaegt er nulstillet. Eleven aflaeser m(før) under vejebaaden,
   traekker pulveret over i kolben med spatlen (eller klikker paa det),
   venter, til vaegten under kolben staar stille, og aflaeser m(efter).
   Tallene skriver eleven selv i skemaet i panelet.

   Kommer det hele i paa én gang, bruser det saa voldsomt, at det
   sproejter, og vaegten falder mere, end CO₂ kan forklare. Luppen viser
   bunden af kolben: H₃O⁺ tager CO₃²⁻ fra kalken, der bliver til CO₂, og
   CO₂ stiger op og ud. Maalingerne gemmes og bruges paa fane 2.
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
        this.over = null;
        this.startFane(D.FORSOEG);
        this.el.valg = NK.el("forsoeg-valg");
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
        this.holdSvar = 0;
        this.rosNaeste = "";
        this.sidsteFase = null;
        this.gemtVist = false;
    };

    P.harForfra = function () { return true; };
    P.harNyeTal = function () { return false; };

    /* Start forfra: en ny kolbe med den samme proeve (gaettet bliver) */
    P.forfra = function () {
        var m = this.proeve;
        this.faerdig = false;
        this.nyMaaling(m);
        this.sidsteFase = this.fase();
        this.hjaelp = 0;
        this.brugtSvar = false;
        this.k.tie();
        this.visKort();
        this.visListe();
        this.besked("En ny kolbe med 20 mL saltsyre og en ny prøve. " + this.trinLinje(), "");
        this.visSkema();
        this.fokus();
    };

    P.promptHTML = function () {
        var o = this.opg;
        return '<p class="maal-tekst">' + NK.html(o.tekst) + "</p>" +
            (o.valg && this.valgt === null && !this.faerdig ? '<p class="opgave-spm">' + NK.html(o.valg.spm) + "</p>" : "");
    };

    /* Valgknapperne til gaettet */
    P.visKortEkstra = function () {
        var o = this.opg, mig = this, e = this.el.valg;
        if (!o.valg) { e.hidden = true; e.innerHTML = ""; return; }
        e.hidden = false;
        e.innerHTML = "";
        this.orden.forEach(function (j) {
            var s = o.valg.svar[j];
            var b = document.createElement("button");
            b.type = "button";
            b.className = "knap";
            b.textContent = s.t;
            if (mig.valgt !== null) {
                b.disabled = true;
                if (j === mig.valgt) b.classList.add("valgt");
                if (mig.faerdig && s.ok) b.classList.add("rigtig");
                if (mig.faerdig && j === mig.valgt && !s.ok) b.classList.add("forkert");
            }
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
            this.svarVis(NK.html("Den rigtige: " + s.t.toLowerCase() + ". Prøv det."));
            this.holdSvar = 1;
        } else {
            this.k.tie();
            this.rosNaeste = NK.html("Dit gæt: " + s.t.toLowerCase() + ".");
        }
        this.visKort();
        this.visSkema();
        this.fokus();
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

    P.trinLinje = function () {
        var f = this.fase();
        if (f === "faerdig") return "";
        if (f === "foer" && this.baad < this.proeve - 1e-6) {
            return "Pulveret er begyndt at komme i kolben, men m(før) står ikke i skemaet. Skriv den, eller tryk på Start forfra.";
        }
        if (f === "haeld" && this.kolbe.ind > 0) return "Der er stadig pulver i vejebåden. Træk mere over i kolben, lidt ad gangen.";
        return D.LINJE[f];
    };

    P.slutLinje = function () { return this.forklaring; };

    /* Fasen skifter: Kemichael tier (medmindre han lige har givet svaret),
       og linjen siger det naeste skridt */
    P.faseSkift = function (f) {
        this.hjaelp = 0;
        if (this.holdSvar > 0) this.holdSvar--;
        else this.k.tie();
        if (f !== "faerdig") this.besked((this.rosNaeste ? this.rosNaeste + " " : "") + this.trinLinje(), this.rosNaeste ? "god" : "");
        this.rosNaeste = "";
        this.visKnap();
        this.visSkema();
        if (f === "foer" || f === "efter") this.fokus();
    };

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
        this.holdSvar = 1;
        if (f === "foer") {
            this.svarVis(NK.html(D.SVAR.foer.replace("{m}", K.g2(this.proeve))));
            this.noterFoer();
        } else if (f === "haeld") {
            this.autoHaeld = { t: 0.2 };
            this.svarVis(NK.html(D.SVAR.haeld));
        } else if (f === "vent") {
            this.hurtig = true;
            this.svarVis(NK.html(D.SVAR.vent));
        } else if (f === "efter") {
            this.holdSvar = 0;
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
                e.addEventListener("input", function () { mig.k.skriver(); });
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
    };

    function aktivRaekke(sim) { return sim.noteret; }

    P.fokusFelt = function () {
        var f = this.fase();
        if (f === "foer") inp(this.nr, "f").focus({ preventScroll: true });
        else if (f === "efter") inp(this.nr, "e").focus({ preventScroll: true });
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
        if (this.fase() === "valg") { this.blokValg(); return; }
        var raa = e.value;
        if (!String(raa).trim()) { this.besked("Skriv tallet fra vægten.", "gul"); return; }
        var t = T.tal(raa);
        if (!t) { ryst(e); this.besked("Skriv et tal, fx 1,02.", "skidt"); return; }
        var v = Math.round(t.v * 100);
        var kolbeV = Math.round(this.kolbe.visning() * 100);
        if (hvad === "f") {
            if (v === Math.round(this.proeve * 100)) { this.noterFoer(); return; }
            ryst(e);
            if (this.baad < this.proeve - 1e-6 && v === Math.round(this.baad * 100)) {
                this.besked("Det er det, der er tilbage i vejebåden. m(før) er massen, før pulveret kom i kolben. Tryk på Start forfra, hvis du ikke nåede at se den.", "skidt");
            } else if (this.kolbe.ind > 0 && v === kolbeV) {
                this.besked("Det er vægten under kolben. m(før) står under vejebåden.", "skidt");
            } else {
                this.besked("Det står der ikke på vægten under vejebåden. Skriv tallet med to decimaler.", "skidt");
            }
            return;
        }
        if (this.baad > 1e-6) { ryst(e); this.besked("Der er stadig pulver i vejebåden. Alt pulveret skal i kolben først.", "skidt"); return; }
        var stille = !this.iLuften() && this.kolbe.stille();
        if (v === kolbeV && stille) { this.noterEfter("ok"); return; }
        ryst(e);
        if (v === kolbeV) {
            this.besked("Vægten falder stadig. Skriver du tallet nu, bliver kalkindholdet for lavt. Vent, til den står stille.", "skidt");
        } else if (v === Math.round(this.proeve * 100)) {
            this.besked("Det er m(før). m(efter) står under kolben, når det er holdt op med at bruse.", "skidt");
        } else if (!stille) {
            this.besked("Vægten under kolben falder stadig. Vent, til den står stille, og aflæs den så.", "skidt");
        } else {
            this.besked("Det står der ikke på vægten under kolben.", "skidt");
        }
    };

    P.noterFoer = function () {
        this.noteret.mf = this.proeve;
        if (!this.holdSvar) this.k.tie();
        this.rosNaeste = NK.tilfaeldig(D.ROS);
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
            pre = s.ok ? "Dit gæt holdt." : "Du gættede: " + s.t.toLowerCase() + ". " + s.forkl;
        }
        var ekstra = "";
        var mk = K.r2(this.noteret.mf - this.noteret.me) * D.FAKTOR;
        if (mk / this.noteret.mf > 1) ekstra = " Kolben tabte mere, end kalken kan give af CO₂. Noget sprøjtede ud. Tryk på Start forfra, og kom pulveret i lidt ad gangen.";
        this.forklaring = NK.html((pre ? pre + " " : "") + o.efter + ekstra);
        this.sidsteFase = "faerdig";
        this.trinLoest(maade, maade === "svar" ? NK.html(D.SVAR.efter.replace("{m}", K.g2(this.noteret.me))) : null);
        this.visSkema();
        if (NK.sims && NK.sims["fane-beregning"]) NK.sims["fane-beregning"].nyeMaalinger();
    };

    P.blokValg = function () {
        this.kortBesked("Gæt først: vælg et af svarene i kortet.");
        this.pegT = 1.6;
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
    P.hvad = function (pt) {
        var lay = this.lay;
        if (!lay || !pt) return null;
        var b = lay.baad, g = lay.kolbe, z = lay.zoom;
        if (pt.x >= b.x - b.b * 0.55 && pt.x <= b.x + b.b * 0.55 && pt.y >= b.top - 24 && pt.y <= b.y + 10) return "baad";
        if (pt.x >= g.x0 && pt.x <= g.x0 + g.b && pt.y >= g.y0 && pt.y <= g.bund + 4) return "kolbe";
        if (pt.x >= lay.v1.x - lay.v1.b / 2 && pt.x <= lay.v1.x + lay.v1.b / 2 && pt.y >= lay.v1.top && pt.y <= lay.bordY) return "vaegt1";
        if (pt.x >= lay.v2.x - lay.v2.b / 2 && pt.x <= lay.v2.x + lay.v2.b / 2 && pt.y >= lay.v2.top && pt.y <= lay.bordY) return "vaegt2";
        if (Math.hypot(pt.x - z.x, pt.y - z.y) < z.r) return "zoom";
        var m = lay.morter, s = lay.musling;
        if (s && pt.x >= s.x && pt.x <= s.x + s.b && pt.y >= s.y && pt.y <= s.y + s.h) return "musling";
        if (m && pt.x >= m.x && pt.x <= m.x + m.b && pt.y >= m.y && pt.y <= m.y + m.h) return "morter";
        return null;
    };

    P.overScene = function (pt) {
        this.over = this.hvad(pt);
        return this.over && this.over !== "zoom" ? this.over : null;
    };

    P.nedScene = function (pt) {
        var u = this.hvad(pt);
        if (u === "baad") {
            if (this.faerdig) { this.kortBesked(this.gemtVist ? "Målingen er færdig. Tryk på Start forfra for at måle igen." : "Målingen er færdig."); return false; }
            if (this.fase() === "valg") { this.blokValg(); return false; }
            if (this.baad <= 1e-6) { this.kortBesked("Vejebåden er tom."); return false; }
            var m = this.skefuld();
            this.baad -= m;
            this.spatel = { x: pt.x, y: pt.y, sx: pt.x, sy: pt.y, trukket: false, m: m };
            if (this.fase() === "foer") this.besked(this.trinLinje(), "gul");
            return true;
        }
        if (u === "kolbe") this.kortBesked("Kolben har 20 mL 4 M saltsyre. Vægten er nulstillet med kolben på.");
        if (u === "vaegt1") this.kortBesked("Vægten viser massen af pulveret i vejebåden.");
        if (u === "vaegt2") this.kortBesked("Vægten er nulstillet med kolben og syren. Den viser det, der er kommet i, minus det, der er forsvundet.");
        if (u === "zoom") this.kortBesked("Luppen viser bunden af kolben. H₃O⁺ fra syren tager carbonat-ionerne fra kalken, og de bliver til CO₂ og vand.");
        if (u === "musling" || u === "morter") {
            var t;
            if (u === "musling") {
                this.muslingNr = ((this.muslingNr === undefined ? -1 : this.muslingNr) + 1) % D.MUSLING.length;
                t = D.MUSLING[this.muslingNr];
                this.vip = 1;
            } else t = D.MORTER;
            if (this.k.inde()) this.k.svar(NK.html(t), "", 4.5);
            else this.kortBesked(t);
        }
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
        this.kortBesked("Slip spatlen over kolben.");
    };

    /* ----- Layout ----------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var baand = this.k.layout(W, H);
        var Hs = baand.y;
        var lay = { W: W, H: H, Hs: Hs };
        lay.bordY = Math.round(Hs - NK.klamp(Hs * 0.07, 16, 44));
        var zr = Math.round(NK.klamp(Math.min(W * 0.13, Hs * 0.24), 56, 128));
        var hoejre = W - 2 * zr - 40;
        var vb2 = NK.klamp(hoejre * 0.4, 150, 250), vb1 = NK.klamp(vb2 * 0.86, 130, 220);
        var vh2 = Tg.vaegtHoejde(vb2), vh1 = Tg.vaegtHoejde(vb1);
        var kh = NK.klamp(Math.min(lay.bordY - vh2 - 60, vb2 * 1.2), 110, 290);
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
        var M = NK.Sprites.MAAL.vaegt;
        var skaal2Y = lay.bordY - (M.bund - M.skaalY) * vb2 / M.b;
        var skaal1Y = lay.bordY - (M.bund - M.skaalY) * vb1 / M.b;
        lay.kolbe = Tg.kolbeGeo(lay.v2.x, skaal2Y + 3, kh);
        var bb = vb1 * M.skaalB / M.b * 0.78;
        lay.baad = { x: lay.v1.x, y: skaal1Y + 2, b: bb, top: skaal1Y - 20 };
        var cy = NK.klamp(lay.kolbe.y0 + kh * 0.35, zr + 34, lay.bordY - zr - 60);
        lay.zoom = { x: W - zr - NK.klamp(W * 0.03, 16, 40), y: cy, r: zr };
        lay.lup = { x: lay.kolbe.cx + 18 * lay.kolbe.k, y: lay.kolbe.bund - 10 * lay.kolbe.k };
        this.lay = lay;
        this.saetAnker("baad", lay.v1.x - vb1 / 2, skaal1Y - 40, vb1, lay.bordY - skaal1Y + 40);
        this.saetAnker("kolbe", lay.v2.x - vb2 / 2, lay.kolbe.y0 - 10, vb2, lay.bordY - lay.kolbe.y0 + 10);
        this.saetAnker("zoom", lay.zoom.x - zr, lay.zoom.y - zr - 30, 2 * zr, 2 * zr + 90);
        this.saetAnker("laerer", 0, baand.y, W * 0.45, baand.h);
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
        /* Fasen */
        var f = this.fase();
        if (f !== this.sidsteFase) {
            this.sidsteFase = f;
            this.faseSkift(f);
        }
        if (this.pegT > 0) {
            this.pegT -= dt;
            this.el.valg.classList.toggle("peg", this.pegT > 0);
        }
    };

    /* ----- Tegn --------------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var g = lay.kolbe, t = this.tid, mig = this;
        this.L.ryd();
        Tg.rum(ctx, lay.W, lay.Hs, lay.bordY + 12);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.Hs);
        var px = NK.klamp(lay.v1.b * 0.07, 13, 15);

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
        if (this.over === "baad" && this.baad > 1e-6) Tg.skaer(ctx, b.x, b.y - 8, b.b * 0.6, 24);
        /* Spatlen hviler paa vejebaaden, naar den ikke er i brug */
        if (!this.spatel && !this.flyv.length && this.baad > 1e-6) {
            Tg.spatel(ctx, b.x + b.b * 0.18, b.y - 12, NK.klamp(b.b * 0.95, 70, 150), -0.18, 0);
        }
        Tg.etiket(ctx, "Vejebåden", lay.v1.x, lay.bordY + 24, px);

        /* Vaegt 2 med kolben */
        Tg.vaegt(ctx, lay.v2.x, lay.bordY, lay.v2.b, K.g2(this.kolbe.visning()) + " g", { lys: this.over === "vaegt2" ? 1 : 0 });
        this.pust.tegn(ctx, g.mund.x, g.mund.y - 6, g.k);
        Tg.kolbe(ctx, g, { V: this.kolbe.syreV, kalk: this.kolbe.kalk, rest: this.kolbe.ind * (1 - D.SKAL.andel),
            skum: this.skum, uklar: NK.klamp(this.kolbe.kalk / 0.25, 0, 1), bobler: this.bobler, lys: this.over === "kolbe" ? 1 : 0 });
        this.draaber.tegn(ctx, g.mund.x, g.mund.y, lay.bordY - g.mund.y);
        Tg.etiket(ctx, "Kolben: 20 mL 4 M HCl", lay.v2.x, lay.bordY + 24, px);

        /* Pulveret i luften og spatlen */
        var sbr = NK.klamp(b.b * 0.95, 70, 150);
        this.fald.forEach(function (p) { Tg.pulver(ctx, p.x, p.y, 18 * g.k, 8 * g.k, Tg.PULVER, 2); });
        this.flyv.forEach(function (f) {
            var u = NK.blod(f.t);
            var x = NK.lerp(f.x0, f.x1, u), y = NK.lerp(f.y0, f.y1, u) - Math.sin(u * Math.PI) * 50 * g.k;
            Tg.spatel(ctx, x, y, sbr, -0.08 + u * 0.4, 1);
        });
        if (this.spatel) Tg.spatel(ctx, this.spatel.x, this.spatel.y, sbr, -0.08, 1);

        /* Pilen over det, der skal bruges nu */
        var f = this.fase();
        if (f === "foer" && this.baad >= this.proeve - 1e-6) Tg.pegepil(ctx, lay.v1.x, v1.disp.y - 8, t);
        else if (f === "haeld" && this.kolbe.ind === 0 && !this.iLuften()) Tg.pegepil(ctx, b.x, b.top - 26, t);
        else if (f === "efter") {
            var M = NK.Sprites.MAAL.vaegt, k2 = lay.v2.b / M.b;
            Tg.pegepil(ctx, lay.v2.x + 24 * k2, lay.bordY - (M.bund - M.dispTop) * k2 - 8, t);
        }

        /* Luppen */
        var z = lay.zoom;
        Tg.lupLinje(ctx, lay.lup.x, lay.lup.y, z.x - z.r, z.y);
        Tg.lup(ctx, this.lup, z.x, z.y, z.r, { titel: "Luppen: bunden af kolben", lys: this.over === "zoom" });
        var lk = NK.klamp(g.k * 0.42, 0.22, 0.5);
        NK.Sprites.tegn(ctx, "lup", lay.lup.x - 52 * lk, lay.lup.y - 52 * lk, 140 * lk, 140 * lk);

        this.k.tegn(ctx);
        void mig;
    };

    NK.SimForsoeg = SimForsoeg;
}());
