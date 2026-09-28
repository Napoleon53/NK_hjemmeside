/* =====================================================================
   sim_forsoeg.js - fane 1: forsoeget

   En klump ståluld ligger paa en varmefast plade paa vaegten, og vaegten
   er nulstillet med pladen. Maaling 1 starter med et gratis gaet: tre
   kort med billeder oven paa scenen (Lettere, Det samme, Tungere).
   Kemichael introducerer gaettet fra sit hjoerne og tier, naar det er
   valgt. Saa aflaeser eleven m(før), taender stålulden med batteriet
   (traek det hen, eller klik paa det), venter, til vaegten staar stille
   (iltflasken goer det hurtigere), og aflaeser m(efter). Tallene
   skriver eleven selv i skemaet i panelet.

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
        this.over = null;
        this.gaet = null;
        this.gaetUd = 0;
        this.tael = 0;
        this.stjerneT = 0;
        this.startFane(D.FORSOEG);
        this.el.gaet = NK.el("forsoeg-gaet");
        this.el.gaetLinje = NK.el("forsoeg-gaetlinje");
        this.bygGaet();
        this.bindSkema();
        this.introNu = true;
        this.vaelg(this.status[0].loest && !this.status[1].loest ? 1 : 0, false);
    }

    var P = SimForsoeg.prototype;
    NK.Fane.paa(P, { navn: "forsoeg", naesteFane: "fane-beregning", naesteNavn: "Beregningen" });

    /* Er en maaling gemt, vises den faerdig. Start forfra maaler igen.
       Under gaettet introducerer Kemichael det fra sit hjoerne. */
    var vaelgFaelles = P.vaelg;
    P.vaelg = function (i, nyeTal) {
        vaelgFaelles.call(this, i, nyeTal);
        if (this.gemtVist) this.besked("Målingen står i skemaet. Tryk på Start forfra for at måle igen.", "god");
        this.introGaet();
        this.visSkema();
        this.visGaet();
    };

    P.introGaet = function () {
        if (this.fase() === "valg") this.k.sig(NK.html(D.GAET.kemichael), "", {});
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
        this.bat = { x: null, y: null, v: 0, holdt: null, flyv: null };
        this.noteret = { mf: null, me: null };
        this.hurtig = false;
        this.auto = null;
        this.holdSvar = 0;
        this.rosNaeste = "";
        this.sidsteFase = null;
        this.gemtVist = false;
        if (this.lay) this.layout();
    };

    P.harForfra = function () { return true; };
    P.harNyeTal = function () { return false; };

    /* Start forfra: en ny klump med den samme masse (gaettet bliver) */
    P.forfra = function () {
        var m = this.proeve;
        this.faerdig = false;
        this.nyMaaling(m, null);
        this.sidsteFase = this.fase();
        this.hjaelp = 0;
        this.brugtSvar = false;
        this.k.tie();
        this.introGaet();
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

    /* ----- Det gratis gaet -------------------------------------------------------------- */
    P.bygGaet = function () {
        var mig = this, e = this.el.gaet, G = D.GAET;
        e.innerHTML = '<span class="gaet-etiket">' + NK.html(G.etiket) + "</span><h2>" + NK.html(G.spm) + "</h2>" +
            '<div class="gaet-kort"></div><p class="gaet-note">' + NK.html(G.note) + "</p>";
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

    P.visGaet = function () {
        var e = this.el.gaet;
        if (this.fase() === "valg") {
            e.hidden = false;
            e.classList.remove("vaek", "valgt");
            [].forEach.call(e.querySelectorAll(".gk"), function (b) { b.classList.remove("valgt"); b.disabled = false; });
            this.gaetUd = 0;
        } else if (!(this.gaetUd > 0)) {
            e.hidden = true;
        }
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
        this.k.tie();
        this.rosNaeste = NK.html("Dit gæt: " + gaetSvar(id).t.toLowerCase() + ".");
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
            return "Stålulden er tændt, men m(før) står ikke i skemaet. Skriv den, hvis du nåede at se den, eller tryk på Start forfra.";
        }
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
        this.visGaet();
        if (f === "foer" || f === "efter") this.fokus();
    };

    /* ----- Knappen: hint og svar for den fase, man er i ------------------------------ */
    P.trinInfo = function () {
        var mig = this, f = this.fase();
        if (f === "faerdig" || f === "valg") return null;
        return { hint: NK.html(D.HINT[f]), svar: function () { mig.visSvar(f); } };
    };

    P.visSvar = function (f) {
        this.brugtSvar = true;
        this.holdSvar = 1;
        if (f === "foer") {
            this.svarVis(NK.html(D.SVAR.foer.replace("{m}", K.g2(this.proeve))));
            this.noterFoer();
        } else if (f === "taend") {
            this.svarVis(NK.html(D.SVAR.taend));
            this.flyvBatteri();
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
        var m = this.noteret;
        NK.saetTekst("forsoeg-note", m && m.mf !== null && m.me !== null ?
            "Stålulden tog " + K.g2(m.me) + " g − " + K.g2(m.mf) + " g = " + K.g2(K.r2(m.me - m.mf)) + " g på." : "");
    };

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
        if (!t) { ryst(e); this.besked("Skriv et tal, fx 4,00.", "skidt"); return; }
        var v = Math.round(t.v * 100);
        var nu = Math.round(this.klump.visning() * 100), m0 = Math.round(this.proeve * 100);
        if (hvad === "f") {
            if (v === m0) { this.noterFoer(); return; }
            ryst(e);
            if (this.klump.taendt && v === nu) {
                this.besked("Det er det, vægten viser nu. m(før) er massen, før stålulden brændte. Tryk på Start forfra, hvis du ikke nåede at se den.", "skidt");
            } else {
                this.besked("Det står der ikke på vægten. Skriv tallet med to decimaler.", "skidt");
            }
            return;
        }
        if (!this.klump.taendt) { ryst(e); this.besked("Stålulden er ikke tændt endnu.", "skidt"); return; }
        var stille = this.klump.stille();
        if (v === nu && stille) { this.noterEfter("ok"); return; }
        ryst(e);
        if (v === nu) {
            this.besked("Stålulden gløder stadig, og vægten stiger. Vent, til den står stille.", "skidt");
        } else if (v === m0) {
            this.besked("Det er m(før). m(efter) er det, vægten viser, når stålulden er brændt.", "skidt");
        } else if (!stille) {
            this.besked("Vægten stiger stadig. Vent, til den står stille, og aflæs den så.", "skidt");
        } else {
            this.besked("Det står der ikke på vægten.", "skidt");
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
        this.noteret.me = this.klump.visning();
        NK.maalinger[this.nr] = { mf: this.noteret.mf, me: this.noteret.me };
        NK.gemMaalinger();
        var s = o.gaet && this.gaet ? gaetSvar(this.gaet) : null;
        var dele = [];
        if (s) dele.push(s.ok ? "Dit gæt holdt." : "Du gættede: " + s.t.toLowerCase() + ".");
        dele.push("Stålulden tog " + K.g2(K.r2(this.noteret.me - this.noteret.mf)) + " g på.");
        dele.push(s && !s.ok ? s.forkl : o.efter);
        this.forklaring = NK.html(dele.join(" "));
        this.sidsteFase = "faerdig";
        this.trinLoest(maade, maade === "svar" ? NK.html(D.SVAR.efter.replace("{m}", K.g2(this.noteret.me))) : null);
        this.visSkema();
        this.visGaetLinje();
        if (NK.sims && NK.sims["fane-beregning"]) NK.sims["fane-beregning"].nyeMaalinger();
    };

    P.blokValg = function () {
        this.kortBesked("Gæt først: klik på et af de tre billeder.");
    };

    /* ----- Batteriet: traek det hen til ulden, eller klik paa det ---------------------- */
    P.batHjem = function () {
        var b = this.lay.bat;
        return { x: b.x, y: b.y, v: 0 };
    };

    P.batPos = function () {
        if (this.bat.x === null) { var h = this.batHjem(); this.bat.x = h.x; this.bat.y = h.y; }
        return this.bat;
    };

    /* Kontaktpunktet paa ulden, hvor batteriet roerer ved et klik */
    P.uldKontakt = function () {
        var u = this.lay.uld;
        return { x: u.cx - u.rx * 0.45, y: u.cy - u.ry * 0.62 };
    };

    /* Batteriet flyver selv hen til ulden, taender den og flyver hjem */
    P.flyvBatteri = function () {
        if (this.bat.flyv || this.klump.taendt) return;
        var b = this.batPos(), h = this.lay.bat.h, k = this.uldKontakt();
        var dy = (NK.Sprites.MAAL.batteri.h / 2 - NK.Sprites.MAAL.batteri.pol) * h / NK.Sprites.MAAL.batteri.h;
        this.bat.flyv = { t: 0, fra: { x: b.x, y: b.y, v: b.v }, til: { x: k.x, y: k.y - dy, v: Math.PI }, slags: "hen" };
    };

    P.batteriHjem = function () {
        var b = this.batPos(), hj = this.batHjem();
        this.bat.flyv = { t: 0, fra: { x: b.x, y: b.y, v: b.v }, til: hj, slags: "hjem" };
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

    P.opdaterBatteri = function (dt) {
        var b = this.batPos(), f = b.flyv;
        if (f) {
            f.t += dt / (f.slags === "vent" ? 0.35 : 0.65);
            var u = NK.blod(Math.min(1, f.t));
            if (f.slags !== "vent") {
                b.x = NK.lerp(f.fra.x, f.til.x, u);
                b.y = NK.lerp(f.fra.y, f.til.y, u) - Math.sin(u * Math.PI) * 40;
                b.v = NK.lerp(f.fra.v, f.til.v, u);
            }
            if (f.t >= 1) {
                if (f.slags === "hen") {
                    this.taend(Tg.batteriKontakt(b.x, b.y, this.lay.bat.h, b.v));
                    b.flyv = { t: 0, slags: "vent" };
                } else if (f.slags === "vent") {
                    this.batteriHjem();
                } else {
                    b.flyv = null;
                }
            }
        } else if (b.holdt) {
            /* Mens det holdes, vender polerne nedad */
            if (b.holdt.trukket) b.v = NK.mod(b.v, Math.PI, 8, dt);
        } else if (this.lay) {
            var h = this.batHjem();
            b.x = h.x; b.y = h.y; b.v = 0;
        }
    };

    /* ----- Musen ------------------------------------------------------------------------- */
    P.hvad = function (pt) {
        var lay = this.lay;
        if (!lay || !pt) return null;
        var b = this.batPos(), bh = lay.bat.h, bb = lay.bat.b;
        var rb = Math.max(bh, bb) * 0.55;
        if (Math.abs(pt.x - b.x) <= (Math.abs(Math.sin(b.v)) > 0.5 ? rb : bb * 0.7) &&
            Math.abs(pt.y - b.y) <= (Math.abs(Math.sin(b.v)) > 0.5 ? bb * 0.7 : bh * 0.55)) return "batteri";
        var fl = lay.flGeo;
        if (fl && pt.x >= fl.x0 - 4 && pt.x <= fl.x0 + fl.b + 4 && pt.y >= fl.y0 && pt.y <= lay.bordY) return "flaske";
        if (lay.dyse && Math.hypot(pt.x - lay.dyse.x - 6, pt.y - lay.dyse.y) < 12) return "flaske";
        var st = lay.stjGeo;
        if (st && pt.x >= st.x - 6 && pt.x <= st.x + st.b + 6 && pt.y >= st.y && pt.y <= lay.bordY) return "stjerne";
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
        if (u === "batteri") {
            if (this.faerdig) { this.kortBesked(this.gemtVist ? "Målingen er færdig. Tryk på Start forfra for at måle igen." : "Målingen er færdig."); return false; }
            if (this.fase() === "valg") { this.blokValg(); return false; }
            if (k.taendt) { this.kortBesked(k.braender() ? "Stålulden brænder allerede." : "Stålulden er brændt. Tryk på Start forfra for en ny klump."); return false; }
            if (this.bat.flyv) return false;
            var b = this.batPos();
            b.holdt = { sx: pt.x, sy: pt.y, dx: b.x - pt.x, dy: b.y - pt.y, trukket: false };
            return true;
        }
        if (u === "flaske") {
            if (k.braender()) {
                k.givIlt();
                this.kortBesked("Ren ilt fra flasken. Stålulden brænder hurtigere.", 2.5);
            } else if (k.taendt) {
                this.kortBesked("Stålulden er brændt. Der er ikke mere jern, ilten kan nå.");
            } else {
                this.kortBesked("Iltflasken giver ren ilt. Brug den, når stålulden brænder.");
            }
            return false;
        }
        if (u === "stjerne") {
            this.stjerneT = 4;
            this.stjerneNr = ((this.stjerneNr === undefined ? -1 : this.stjerneNr) + 1) % D.STJERNE.length;
            var t = D.STJERNE[this.stjerneNr];
            if (this.k.inde()) this.k.svar(NK.html(t), "", 4.5);
            else this.kortBesked(t);
            return false;
        }
        if (u === "uld") {
            if (this.fase() === "valg") { this.blokValg(); return false; }
            this.kortBesked(!k.taendt ? "Ståluld er tynde tråde af jern. Tænd den med batteriet." :
                (k.braender() ? "Stålulden gløder. Jernet reagerer med ilten i luften." :
                    "Stålulden er blevet sort. Jernet er blevet til jernoxid."));
        }
        if (u === "vaegt") this.kortBesked("Vægten er nulstillet med den varmefaste plade. Den viser kun stålulden.");
        if (u === "zoom") this.kortBesked("Luppen viser overfladen af en ståltråd. Ilten sætter sig på jernatomerne. Nitrogen i luften reagerer ikke.");
        return false;
    };

    P.flytScene = function (pt) {
        var b = this.bat, h = b.holdt;
        if (!h) return;
        b.x = pt.x + h.dx;
        b.y = pt.y + h.dy;
        if (Math.hypot(pt.x - h.sx, pt.y - h.sy) > 6) h.trukket = true;
    };

    P.opScene = function () {
        var b = this.bat, h = b.holdt;
        if (!h) return;
        b.holdt = null;
        if (!h.trukket) { this.flyvBatteri(); return; }
        var kontakt = Tg.batteriKontakt(b.x, b.y, this.lay.bat.h, b.v);
        if (this.paaUld(kontakt, 1.35) || this.paaUld({ x: b.x, y: b.y }, 1.1)) {
            this.taend(this.paaUld(kontakt, 1.0) ? kontakt : { x: b.x, y: this.lay.uld.cy - this.lay.uld.ry * 0.6 });
            b.flyv = { t: 0, slags: "vent" };
            return;
        }
        this.batteriHjem();
        this.kortBesked("Hold batteriets poler mod stålulden.");
    };

    /* ----- Layout ----------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var baand = this.k.layout(W, H);
        var Hs = baand.y;
        var lay = { W: W, H: H, Hs: Hs };
        var MA = NK.Sprites.MAAL;
        lay.bordY = Math.round(Hs - NK.klamp(Hs * 0.07, 16, 44));
        var zr = Math.round(NK.klamp(Math.min(W * 0.14, Hs * 0.25), 52, 140));
        var kant = NK.klamp(W * 0.03, 14, 36);
        lay.zoom = { x: W - zr - kant, y: 0, r: zr };
        var hoejre = lay.zoom.x - zr - 24;
        var vb = NK.klamp(hoejre * 0.44, 140, 330);
        var vh = Tg.vaegtHoejde(vb);
        var fh = NK.klamp(Math.min(lay.bordY - 70, vb * 0.95), 110, 290), fb = fh * MA.iltflaske.b / MA.iltflaske.h;
        var bh = NK.klamp(vb * 0.34, 46, 84), bbr = bh * MA.batteri.b / MA.batteri.h;
        var sh = NK.klamp(vb * 0.6, 70, 140), sbr = sh * MA.stjernekaster.b / MA.stjernekaster.h;
        var gruppe = bbr + 34 + vb + 30 + fb;
        var medPynt = hoejre - gruppe > sbr + 40;
        if (medPynt) gruppe += sbr + 28;
        var x0 = Math.max(10, (hoejre - gruppe) / 2 + 6);
        lay.stjGeo = medPynt ? Tg.stjerneGeo(x0 + sbr / 2, lay.bordY, sh) : null;
        if (medPynt) x0 += sbr + 28;
        lay.bat = { x: x0 + bbr / 2, y: lay.bordY - bh / 2 - 1, h: bh, b: bbr };
        x0 += bbr + 34;
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
        this.lay = lay;
        var fgTop = lay.bordY - fh;
        this.saetAnker("vaegt", lay.v.x - vb / 2, lay.uld.cy - ry - 8, vb, lay.bordY - (lay.uld.cy - ry - 8));
        this.saetAnker("batteri", lay.bat.x - bbr / 2 - 6, lay.bordY - bh - 6, bbr + 12, bh + 6);
        this.saetAnker("flaske", lay.fl.x - fb / 2 - 4, fgTop - 4, fb + 8, fh + 4);
        this.saetAnker("zoom", lay.zoom.x - zr, lay.zoom.y - zr - 30, 2 * zr, 2 * zr + 64);
        this.saetAnker("laerer", 0, baand.y, W * 0.45, baand.h);
        if (this.el.gaet) this.el.gaet.style.bottom = Math.round(H - baand.y) + "px";
        if (this.bat && !this.bat.holdt && !this.bat.flyv) { this.bat.x = lay.bat.x; this.bat.y = lay.bat.y; this.bat.v = 0; }
    };

    /* ----- Opdater ----------------------------------------------------------------------- */
    P.opdaterScene = function (dt) {
        var lay = this.lay;
        if (!lay) return;
        var tf = this.hurtig ? 15 : 1;
        this.opdaterBatteri(dt);
        this.klump.opdater(dt * tf);
        if (this.hurtig && this.klump.stille()) this.hurtig = false;
        var k = this.klump;
        /* Gnisterne fra den gloedende front */
        var u = lay.uld, kilder = this.uld.frontPunkter(k.p, u.cx, u.cy, u.rx, u.ry);
        var rate = k.braender() ? (k.ilt > 0 ? 70 : 24) * NK.klamp(kilder.length / this.uld.t.length * 5, 0.25, 1) : 0;
        this.gnister.opdater(dt, rate, kilder);
        this.lup.opdater(dt * (this.hurtig ? 3 : 1), k.reageret(), k.ilt > 0, k.braender());
        /* Ilten fra flasken ses i gloeden og slangen; stjernekasteren braender ud */
        this.iltVis = NK.mod(this.iltVis || 0, k.ilt > 0 ? 1 : 0, 6, dt);
        if (this.stjerneT > 0) this.stjerneT = Math.max(0, this.stjerneT - dt);
        /* Det gratis gaet glider vaek */
        if (this.gaetUd > 0) {
            this.gaetUd -= dt;
            if (this.gaetUd < 0.5) this.el.gaet.classList.add("vaek");
            if (this.gaetUd <= 0) { this.gaetUd = 0; this.el.gaet.hidden = true; }
        }
        /* Mens batteriet flyver selv, eller Vis svaret skruer tiden op, kan knappen ikke bruges */
        var auto = !!(this.bat.flyv || this.hurtig);
        if (auto !== !!this.auto) { this.auto = auto || null; this.visKnap(); }
        /* Fasen */
        var f = this.fase();
        if (f !== this.sidsteFase) {
            this.sidsteFase = f;
            this.faseSkift(f);
        }
    };

    /* ----- Tegn --------------------------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var t = this.tid, k = this.klump, over = this.over;
        this.L.ryd();
        Tg.rum(ctx, lay.W, lay.Hs, lay.bordY + 12);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.Hs);
        var px = NK.klamp(lay.v.b * 0.06, 13, 15), ety = lay.bordY + 12 + (lay.Hs - lay.bordY - 12) / 2;

        /* Stjernekasteren (paaskeaegget) */
        if (lay.stjGeo) {
            Tg.stjernekaster(ctx, lay.stjGeo, over === "stjerne");
            if (this.stjerneT > 0) {
                var sp = lay.stjGeo.spids;
                Tg.stjerneLys(ctx, sp.x, sp.y + (4 - this.stjerneT) * 3, t, NK.klamp(this.stjerneT, 0, 1));
            }
        }

        /* Vaegten, pladen og ulden */
        var v = Tg.vaegt(ctx, lay.v.x, lay.bordY, lay.v.b, K.g2(k.visning()) + " g", { lys: over === "vaegt" ? 1 : 0 });
        Tg.plade(ctx, lay.plade.x, lay.plade.bund, lay.plade.b, lay.plade.h);
        this.iltVis = this.iltVis || 0;
        Tg.gloed(ctx, this.uld, k.braender() ? 0.7 + 0.5 * this.iltVis : 0);
        var u = lay.uld;
        Tg.uld(ctx, this.uld, u.cx, u.cy, u.rx, u.ry, { p: k.p, ilt: this.iltVis, tid: t, lys: over === "uld" });
        Tg.etiket(ctx, "Vægten", lay.v.x, ety, px);

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

        /* Batteriet: hjemme paa bordet, i haanden eller paa vej */
        var b = this.batPos();
        Tg.batteri(ctx, b.x, b.y, lay.bat.h, b.v, over === "batteri" && !b.holdt);
        if (!b.holdt && !b.flyv) Tg.etiket(ctx, "9 V", lay.bat.x, ety, px);

        /* Pilen over det, der skal bruges nu */
        var f = this.fase();
        if (f === "foer" && !k.taendt) Tg.pegepil(ctx, lay.v.x, v.disp.y - 8, t);
        else if (f === "taend" && !b.holdt && !b.flyv) Tg.pegepil(ctx, lay.bat.x, lay.bordY - lay.bat.h - 10, t);
        else if (f === "vent" && k.ilt <= 0 && !this.hurtig) Tg.pegepil(ctx, lay.flGeo.hjul.x, lay.flGeo.y0 - 10, t);
        else if (f === "efter") Tg.pegepil(ctx, lay.v.x, v.disp.y - 8, t);

        this.k.tegn(ctx);
    };

    NK.SimForsoeg = SimForsoeg;
}());
