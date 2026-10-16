/* =====================================================================
   sim_varm.js - fane 1: Varm op

   Elleve glas med en ballon paa staar paa hylden: de ti foerste lige
   alkaner og icosan. Eleven traekker et glas ned i temperaturkammeret
   (eller klikker paa det) og skruer paa temperaturen ved at traekke i
   termometeret. Zoomvinduet viser molekylerne i glasset. Naar stoffet
   koger, fylder gassen ballonen, og kogepunktet kommer paa kurven i
   panelet. Fortaetter en gas, er det ogsaa kogepunktet.

   Fire maal (D.MAAL): faa pentan til at koge, find tre andre, gaet paa
   kurven og maal, og kog icosan. Knappen giver et hint og saa svaret.
   Kurven og maalene huskes under NOEGLE.

   Paaskeaegget: taendstikaesken paa bordet. En taendstik, der roerer
   en fuld ballon, braender gassen, og Kemichael saetter en ny ballon paa.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;
    var S = NK.Sprites;

    var NOEGLE = "nk-sc6.1-varm";
    var FLYV_TID = 0.5;
    var KASSE = { W: 32, H: 31 };
    var KP_FARVE = "#f0685a", SMP_FARVE = "#7fb8ec";

    function SimVarm() {
        this.L = new NK.Laerred(NK.el("varm-laerred"));
        this.KL = new NK.Laerred(NK.el("varm-kurve"));
        this.tid = 0;
        this.lay = null;
        this.over = null;
        this.traek = null;
        this.termo = new NK.Termostat(D.T_VARM, D.STUE);
        this.valgt = D.HYLDE.indexOf(D.stof("pentan"));
        this.proeve = this.lavProeve(this.valgt);
        this.flyv = null;
        this.stik = null;
        this.brand = null;
        this.ballonVaek = false;
        this.braende = 0;
        this.g = { kaffekop: { skjult: false, iHaand: false } };

        var gemt = NK.hent(NOEGLE, {}) || {};
        this.fundet = (gemt.fundet || []).filter(function (id) { return !!D.stof(id); });
        this.gaet = gemt.gaet && D.stof(gemt.gaet.id) ? gemt.gaet : null;
        this.maalNr = NK.klamp(gemt.maal || 0, 0, D.MAAL.length);
        this.rost = this.maalNr >= D.MAAL.length;
        this.smp = {};
        this.glimt = {};
        this.sidstFundet = null;
        this.hjaelp = 0;
        this.naaet = false;
        this.byttet = false;

        this.bygPanel();
        this.bygTilbud();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.klargoerGaet();
        this.visMaal();
        this.visStatus();
    }

    var P = SimVarm.prototype;

    P.lavProeve = function (i) {
        var st = D.HYLDE[i];
        return new NK.Proeve({ W: KASSE.W, H: KASSE.H, T: this.termo.T, startT: D.STUE, stoffer: [{ st: st, n: st.antal }] });
    };

    P.stof = function () { return D.HYLDE[this.valgt]; };

    /* ----- Layout ------------------------------------------------------------------ */
    /* Mikroniveauet er i centrum: zoomvinduet fylder midten af scenen.
       Udstyret staar i en smal kolonne til venstre (en lille reol med de
       elleve glas i tre raekker og kammeret under den), og termometeret
       staar hoejt til hoejre for vinduet. */
    var REOL = [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10]];

    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var kant = NK.klamp(W * 0.014, 8, 16);
        lay.kant = kant;
        lay.bordY = Math.round(H * 0.9);
        var luft = NK.klamp(H * 0.085, 40, 64);

        /* Reolen oeverst i venstre kolonne: fire glas pr. raekke, formlen under */
        var vB = Math.round(NK.klamp(W * 0.27, 170, 320));
        var x0 = kant, x1 = kant + vB;
        var plads = (vB - 8) / 4;
        var gh = Math.round(NK.klamp(Math.min(plads * 1.15, H * 0.075), 28, 70));
        var skilt = NK.klamp(gh * 0.22, 10.5, 13);
        var raekkeH = gh * 1.36 + 12 + skilt * 1.5;
        lay.plads = plads;
        lay.hyldeGlasH = gh;
        lay.skilt = skilt;
        lay.planker = REOL.map(function (r, k) { return Math.round(luft + gh * 1.36 + k * raekkeH); });
        lay.hyldeGlas = [];
        REOL.forEach(function (r, k) {
            var skub = (4 - r.length) * plads / 2;
            r.forEach(function (i, j) {
                lay.hyldeGlas[i] = { x: x0 + 4 + skub + plads * (j + 0.5), y: lay.planker[k] - 1, raekke: k };
            });
        });
        lay.hylde = { x0: x0, x1: x1, top: luft, y: lay.planker[2], bund: lay.planker[2] + 12 + skilt * 1.5 };

        /* Kammeret under reolen. Glasset stikker op af loftet, og ballonen
           skal kunne fyldes over det: ca. 420 af kammerets enheder fra
           bordet og op til toppen af en fuld ballon ved 360 °C */
        var rum = lay.bordY - lay.hylde.bund - 10;
        var sk = NK.klamp(Math.min(rum / 420, vB * 0.72 / 240, 0.8), 0.18, 0.8);
        var kx = x1 - 120 * sk - 4;
        lay.kammer = Tg.kammerMaal(kx, lay.bordY, 300 * sk);
        var K = lay.kammer;
        lay.glas = Tg.glasMaal(kx, K.y + 214 * sk, 250 * sk);
        /* Taendstikaesken til venstre for kammeret, hvis der er plads */
        var aeB = Math.min(72 * NK.klamp(sk, 0.6, 1), K.x - kant - 8);
        lay.aeske = aeB >= 30 ? { x: K.x - 6 - aeB, y: lay.bordY - aeB * 0.55, b: aeB, h: aeB * 0.55 } : null;
        lay.kop = { x: kant + 22, y: lay.bordY };

        /* Termometeret hoejt til hoejre */
        lay.termo = Tg.termoMaal(W - kant - 58, lay.bordY - 2, lay.bordY - 2 - (luft + 10), D.T_VARM);

        /* Zoomvinduet i midten, mellem udstyret og termometeret */
        var zx0 = x1 + 18, zx1 = lay.termo.x - 60;
        var zTop = luft + 24, zBund = lay.bordY - 14;
        var zb = Math.max(120, zx1 - zx0), zh = zb * KASSE.H / KASSE.W;
        if (zh > zBund - zTop) { zh = zBund - zTop; zb = zh * KASSE.W / KASSE.H; }
        lay.zoom = { x: Math.round(zx0 + (zx1 - zx0 - zb) / 2), y: Math.round(zTop + (zBund - zTop - zh) / 2), b: Math.round(zb), h: Math.round(zh) };
        this.lay = lay;

        this.saetAnker("varm-anker-hylde", x0, luft, vB, lay.hylde.bund - luft);
        this.saetAnker("varm-anker-kammer", K.x, lay.glas.top - 40 * sk, K.b, lay.bordY - lay.glas.top + 40 * sk);
        this.saetAnker("varm-anker-termometer", lay.termo.venstre - 26, lay.termo.top, lay.termo.b + 70, lay.termo.h);
        this.saetAnker("varm-anker-zoom", lay.zoom.x, lay.zoom.y - 22, lay.zoom.b, lay.zoom.h + 22);
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
        this.KL.tilpas();
    };

    /* ----- Glassene -------------------------------------------------------------------
       Et glas paa hylden er ved stuetemperatur: gasserne har fuld ballon. */
    function hyldeMakro(st) {
        var T = D.STUE;
        if (T < st.smp) return { fast: 1, vaeske: 0, koger: 0, ballon: 0 };
        if (T >= st.kp) return { fast: 0, vaeske: 0, koger: 0, ballon: 1 };
        return { fast: 0, vaeske: 1 - D.DAMP * D.damptryk(st, T), koger: 0, ballon: 0 };
    }

    /* Saet glasset i med nummer i i kammeret; det gamle flyver op paa hylden */
    P.skift = function (i) {
        if (i === this.valgt || this.brand) return;
        this.flyv = { gammel: this.valgt, ny: i, t: 0 };
        this.valgt = i;
        this.proeve = this.lavProeve(i);
        this.proeve.pause = !!this.pause;
        this.ballonVaek = false;
        this.byttet = true;
        this.besked("", "");
        this.visStatus();
    };

    /* ----- Hvad der sker i proeven --------------------------------------------------- */
    P.haendelser = function () {
        var mig = this;
        this.proeve.hentHaendelser().forEach(function (h) {
            if (h.slags === "koge" || h.slags === "fortaette") mig.fundKp(h.st, h.slags);
            if (h.slags === "smelte" || h.slags === "fryse") mig.fundSmp(h.st, h.slags);
        });
    };

    P.fundKp = function (st, slags) {
        var noegle = st.id + slags;
        var nyt = this.fundet.indexOf(st.id) < 0;
        if (nyt) {
            this.fundet.push(st.id);
            this.sidstFundet = st.id;
            this.glimt[st.id] = 1;
            this.gem();
        }
        if (nyt || this.sidstMeldt !== noegle) {
            this.sidstMeldt = noegle;
            this.note(slags === "koge" ?
                st.Navn + " koger ved " + D.gradTekst(st.kp) + "." :
                st.Navn + " fortætter ved " + D.gradTekst(st.kp) + ". Det er også kogepunktet.");
        }
        this.tjekMaal();
    };

    P.fundSmp = function (st, slags) {
        var noegle = st.id + slags;
        this.smp[st.id] = true;
        if (this.sidstMeldt === noegle) return;
        this.sidstMeldt = noegle;
        this.note(slags === "smelte" ?
            st.Navn + " smelter ved " + D.gradTekst(st.smp) + "." :
            st.Navn + " størkner ved " + D.gradTekst(st.smp) + ". Det er smeltepunktet.");
    };

    P.note = function (tekst) {
        NK.saetTekst("varm-note", tekst);
    };

    P.gem = function () {
        NK.gem(NOEGLE, { maal: this.maalNr, fundet: this.fundet, gaet: this.gaet });
    };

    /* ----- Maalene ---------------------------------------------------------------------- */
    P.maal = function () { return D.MAAL[this.maalNr] || null; };

    /* Maal 3: det stof, der skal gaettes paa. Decan, eller den laengste lige
       kaede fra C6, der ikke er maalt. */
    P.gaetStof = function () {
        var mig = this;
        var liste = ["decan", "nonan", "octan", "heptan", "hexan"].map(D.stof);
        for (var i = 0; i < liste.length; i++) if (mig.fundet.indexOf(liste[i].id) < 0) return liste[i];
        return null;
    };

    P.klargoerGaet = function () {
        var m = this.maal();
        if (!m || m.slags !== "gaet" || this.naaet) return;
        var st = this.gaet ? D.stof(this.gaet.id) : null;
        if (!st || this.fundet.indexOf(st.id) >= 0) {
            st = this.gaetStof();
            this.gaet = st ? { id: st.id, t: 0, sat: false } : null;
        }
    };

    P.maalTekst = function (m) {
        if (m.slags !== "gaet") return m.tekst;
        var st = this.gaet ? D.stof(this.gaet.id) : null;
        return st ? m.tekst.replace("{navn}", st.navn) : "Alle kæderne er målt. Kurven er færdig.";
    };

    /* Hintet til gaettet naevner kaeden med to C-atomer faerre */
    P.hintTekst = function (m) {
        if (m.slags !== "gaet" || !this.gaet) return m.hint;
        var st = D.stof(this.gaet.id), ned = D.HYLDE[st.nC - 3];
        return m.hint.replace("{Navn}", st.Navn + ", " + D.formel(st) + ",").replace("{ned}", ned.navn);
    };

    P.tjekMaal = function () {
        var m = this.maal();
        if (!m || this.naaet) return;
        var ok = false, efter = m.efter, mig = this;
        if (m.slags === "koge") ok = this.fundet.indexOf(m.id) >= 0;
        if (m.slags === "flere") ok = this.fundet.filter(function (id) { return id !== "pentan"; }).length >= m.antal;
        if (m.slags === "gaet") {
            if (!this.gaet) { ok = true; efter = "Alle kæderne er målt. Kurven er færdig."; }
            else if (this.fundet.indexOf(this.gaet.id) >= 0) {
                var st = D.stof(this.gaet.id);
                if (!this.gaet.sat) {
                    /* Maalt foer gaettet: saa et nyt stof at gaette paa */
                    var nyt = this.gaetStof();
                    this.gaet = nyt ? { id: nyt.id, t: 0, sat: false } : null;
                    if (nyt) {
                        this.besked(NK.html(st.Navn) + " blev målt, før du gættede. Gæt så på " + NK.html(nyt.navn) + ".", "gul");
                        this.visMaal();
                        this.gem();
                        return;
                    }
                    ok = true;
                    efter = "Alle kæderne er målt. Kurven er færdig.";
                } else {
                    ok = true;
                    var afv = Math.abs(this.gaet.t - st.kp);
                    efter = "Du gættede " + D.gradTekst(this.gaet.t, 0) + ". " + st.Navn + " koger ved " + D.gradTekst(st.kp) + ". " +
                        (afv <= D.GAET_GODT ? "Godt ramt." : "Kurven flader lidt ud, jo længere kæden er.");
                }
            }
        }
        if (!ok) return;
        this.naaet = true;
        this.hjaelp = 0;
        this.besked(NK.html(efter), "god");
        if (this.afvisTilbud) this.afvisTilbud();
        this.maalNr = Math.min(D.MAAL.length, this.maalNr + 1);
        this.maalVist = this.maalNr - 1;
        this.gem();
        this.visMaal();
        void mig;
    };

    P.knap = function () {
        if (this.naaet) {
            this.naaet = false;
            this.hjaelp = 0;
            this.besked("", "");
            if (this.maalNr >= D.MAAL.length && !this.rost) {
                this.rost = true;
                this.ventRos = 1.0;
            }
            this.klargoerGaet();
            this.visMaal();
            this.tjekMaal();
            return;
        }
        var m = this.maal();
        if (!m) {
            /* Alle maal er naaet: forfra, ogsaa kurven */
            this.maalNr = 0;
            this.fundet = [];
            this.gaet = null;
            this.sidstFundet = null;
            this.note("");
            this.gem();
            this.besked("", "");
            this.visMaal();
            return;
        }
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.besked("<b>Hint:</b> " + NK.html(this.hintTekst(m)), "gul");
        } else {
            this.visSvaret(m);
        }
        this.visMaal();
    };

    /* Vis svaret: stoffet saettes i, og kammeret skruer op */
    P.visSvaret = function (m) {
        var mig = this;
        this.termo.roert = true;
        if (m.slags === "koge") {
            var i = D.HYLDE.indexOf(D.stof(m.id));
            if (i !== this.valgt) this.skift(i);
            this.termo.animerTil(D.stof(m.id).kp + 12, m.id === "icosan" ? 90 : 40);
        } else if (m.slags === "flere") {
            var mangler = ["metan", "hexan", "octan", "butan", "heptan", "decan"].filter(function (id) {
                return mig.fundet.indexOf(id) < 0;
            });
            var antal = m.antal - this.fundet.filter(function (id) { return id !== "pentan"; }).length;
            mangler.slice(0, Math.max(0, antal)).forEach(function (id) {
                mig.fundet.push(id);
                mig.glimt[id] = 1;
                mig.sidstFundet = id;
            });
            this.note("Tre kogepunkter er sat på kurven.");
            this.gem();
            this.tjekMaal();
        } else if (m.slags === "gaet" && this.gaet) {
            var st = D.stof(this.gaet.id);
            this.gaet.t = Math.round(st.kp / 5) * 5;
            this.gaet.sat = true;
            var j = D.HYLDE.indexOf(st);
            if (j !== this.valgt) this.skift(j);
            this.termo.animerTil(st.kp + 12, 60);
            this.gem();
        }
    };

    P.nulstil = function () {
        /* Et nyt glas af samme stof, og kammeret tilbage paa stuetemperatur */
        this.termo.saet(D.STUE);
        this.proeve = this.lavProeve(this.valgt);
        this.ballonVaek = false;
        this.brand = null;
        this.stik = null;
        this.besked("", "");
        this.visStatus();
    };

    P.enter = function () {
        if (this.naaet || !this.maal()) this.knap();
    };

    P.fokus = function () {};

    /* Piletasterne skruer paa temperaturen, P holder pause */
    P.tast = function (tast, e) {
        if (tast === "p" || tast === "P") { this.skiftPause(); return true; }
        if (this.termo.tast(tast, e && e.shiftKey)) { this.visStatus(); return true; }
        return false;
    };

    P.skiftPause = function () {
        this.pause = !this.pause;
        this.proeve.pause = this.pause;
    };

    /* ----- Panelet ---------------------------------------------------------------------- */
    P.bygPanel = function () {
        var mig = this;
        this.el = {
            knap: NK.el("varm-knap"),
            besked: NK.el("varm-besked"),
            kort: NK.el("varm-kort")
        };
        this.el.knap.addEventListener("click", function () { mig.knap(); });
        NK.el("varm-spring").addEventListener("click", function () { mig.springIntro(); });
        var note = document.createElement("p");
        note.className = "note";
        note.id = "varm-note";
        NK.el("varm-kurve-kort").appendChild(note);
        this.koblKurve();
    };

    P.besked = function (html, klasse) {
        this.el.besked.innerHTML = html;
        this.el.besked.className = "besked" + (klasse ? " " + klasse : "");
    };

    P.visMaal = function () {
        var vist = this.naaet ? this.maalVist : this.maalNr;
        var m = D.MAAL[vist] || null;
        NK.saetTekst("varm-nr", String(Math.min(vist + 1, D.MAAL.length)));
        if (m) {
            NK.saetTekst("varm-maal-titel", "Mål");
            NK.saetTekst("varm-prompt", this.maalTekst(m));
        } else {
            NK.saetTekst("varm-maal-titel", "Frit valg");
            NK.saetTekst("varm-prompt", "Varm alle alkanerne op, som du vil. Kurven bliver hængende.");
        }
        var tekst, klasse = "knap";
        if (this.naaet) {
            tekst = this.maalNr >= D.MAAL.length ? "Afslut målene →" : "Næste mål →";
            klasse = "knap blaa banker";
        } else if (!m) tekst = "Start målene forfra";
        else tekst = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
        this.el.knap.textContent = tekst;
        this.el.knap.className = klasse;
        this.el.kort.classList.toggle("sejr", this.naaet);
        NK.el("varm-taeller").hidden = !m;
    };

    /* Hvad stoffet er ved temperaturen lige nu, som tekst */
    P.tilstandTekst = function () {
        var P2 = this.proeve, g = P2.grupper[0], t = P2.taelling(g), st = g.st, T = P2.T;
        if (P2.braendt && !t[0] && !t[1]) return "brændt";
        if (t[0] && t[1]) return T >= st.smp ? "ved at smelte" : "ved at størkne";
        if (T >= st.kp && t[1]) return "ved at koge";
        if (T < st.kp && t[2] > P2.dampMaks(g)) return "ved at fortætte";
        if (t[0] === g.n) return "fast stof";
        if (t[2] === g.n) return "en gas";
        if (t[1] + t[2] === g.n) return "en væske";
        return "fast stof og væske";
    };

    P.visStatus = function () {
        var st = this.stof(), tr = this.traek, t;
        if (tr && tr.slags === "glas" && tr.flyttet) t = "Slip glasset i kammeret.";
        else if (tr && tr.slags === "termo") t = "Kammeret er " + D.gradTekst(this.termo.T, 0) + ".";
        else if (this.stik) t = this.stik.braender ? "Tændstikken brænder." : "Træk tændstikken op af æsken.";
        else if (this.brand) t = "Gassen i ballonen brændte. Den blev til CO₂ og H₂O.";
        else if (this.flyv) t = st.Navn + ", " + D.formel(st) + ", sættes i kammeret.";
        else {
            t = "<b>" + NK.html(st.Navn) + "</b> er " + this.tilstandTekst() + " ved " + D.gradTekst(this.proeve.T, 0) + ".";
            if (!this.termo.roert) t += " Træk i termometeret.";
            else if (!this.byttet) t += " Træk et andet glas ned i kammeret.";
        }
        NK.saetHTML("varm-status", t);
    };

    /* ----- Kurven i panelet -------------------------------------------------------------- */
    P.kurveData = function () {
        var mig = this;
        return {
            punkter: this.fundet.map(function (id) {
                return { st: D.stof(id), ny: mig.glimt[id] || 0, sidst: id === mig.sidstFundet };
            }),
            gaet: this.gaetAktiv() ? { nC: D.stof(this.gaet.id).nC, t: this.gaet.t, sat: this.gaet.sat } : null,
            gaetLys: this.kurveOver === "gaet" || (this.kurveTraek && this.kurveTraek.slags === "gaet"),
            aktiv: this.stof().nC,
            tid: this.tid
        };
    };

    P.gaetAktiv = function () {
        var m = this.maal();
        return !!(m && m.slags === "gaet" && !this.naaet && this.gaet);
    };

    P.koblKurve = function () {
        var mig = this, c = this.KL.canvas;
        function hvad(pt) {
            var K = Tg.kurveMaal(mig.KL.b, mig.KL.h);
            if (mig.gaetAktiv()) {
                var gx = K.xFor(D.stof(mig.gaet.id).nC), gy = K.yFor(mig.gaet.t);
                if (Math.abs(pt.x - gx) < 18 && Math.abs(pt.y - gy) < 18) return { slags: "gaet" };
                if (Math.abs(pt.x - gx) < 18 && pt.y > K.top && pt.y < K.bund) return { slags: "gaetSoejle" };
            }
            var bedst = null;
            mig.fundet.forEach(function (id) {
                var st = D.stof(id), d = Math.abs(pt.x - K.xFor(st.nC)) + Math.abs(pt.y - K.yFor(st.kp));
                if (d < 16 && (!bedst || d < bedst.d)) bedst = { slags: "punkt", st: st, d: d };
            });
            return bedst;
        }
        c.addEventListener("pointerdown", function (e) {
            var pt = mig.KL.punkt(e), u = hvad(pt);
            if (!u) {
                if (mig.gaetAktiv()) mig.besked("Træk ? op eller ned til dit gæt.", "gul");
                return;
            }
            if (u.slags === "gaet" || u.slags === "gaetSoejle") {
                mig.kurveTraek = { slags: "gaet" };
                mig.flytGaet(pt);
                try { c.setPointerCapture(e.pointerId); } catch (x) { /* ikke vigtigt */ }
                return;
            }
            if (u.slags === "punkt") {
                mig.note(u.st.Navn + ", " + D.formel(u.st) + ", koger ved " + D.gradTekst(u.st.kp) + ".");
            }
        });
        c.addEventListener("pointermove", function (e) {
            var pt = mig.KL.punkt(e);
            if (mig.kurveTraek) { mig.flytGaet(pt); return; }
            var u = hvad(pt);
            mig.kurveOver = u ? (u.slags === "gaetSoejle" ? "gaet" : u.slags) : null;
            c.style.cursor = u ? (u.slags === "punkt" ? "pointer" : "ns-resize") : "default";
        });
        c.addEventListener("pointerup", function (e) {
            if (!mig.kurveTraek) return;
            mig.flytGaet(mig.KL.punkt(e));
            mig.kurveTraek = null;
            if (mig.gaetAktiv()) {
                mig.gaet.sat = true;
                mig.gem();
                var st = D.stof(mig.gaet.id);
                mig.besked("Dit gæt: " + D.gradTekst(mig.gaet.t, 0) + ". Mål nu " + NK.html(st.navn) + " i kammeret.", "");
            }
        });
        c.addEventListener("pointerleave", function () { mig.kurveOver = null; });
    };

    P.flytGaet = function (pt) {
        if (!this.gaetAktiv()) return;
        var K = Tg.kurveMaal(this.KL.b, this.KL.h);
        this.gaet.t = Math.round(NK.klamp(K.tFor(pt.y), -200, 360) / 5) * 5;
    };

    /* ----- Tegneloekken ------------------------------------------------------------------ */
    P.opdater = function (dt) {
        this.tid += dt;
        var mig = this;
        this.termo.opdater(dt);
        this.proeve.T = this.termo.T;
        this.proeve.opdater(dt);
        this.haendelser();
        if (this.flyv) {
            this.flyv.t += dt / FLYV_TID;
            if (this.flyv.t >= 1) this.flyv = null;
        }
        Object.keys(this.glimt).forEach(function (id) {
            mig.glimt[id] = Math.max(0, mig.glimt[id] - dt * 0.6);
        });
        if (this.stik) {
            this.stik.tid += dt;
            if (this.stik.braender && this.stik.tid > 7) {
                this.stik = null;
                if (this.traek && this.traek.slags === "stik") this.traek = null;
            } else if (this.stik.braender) {
                this.tjekStik();
            }
        }
        if (this.brand) {
            this.brand.t += dt;
            if (this.brand.t > 1.1 && !this.brand.kaldt) {
                this.brand.kaldt = true;
                if (this.laererBrand) this.laererBrand();
                else this.brand.nyTid = 1.5;
            }
            if (this.brand.nyTid !== undefined) {
                this.brand.nyTid -= dt;
                if (this.brand.nyTid <= 0) this.nyBallon();
            }
        }
        if (this.ventRos > 0) {
            this.ventRos -= dt;
            if (this.ventRos <= 0 && this.laererFaerdig) this.laererFaerdig();
        }
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
        this.visStatus();
    };

    /* Kemichael saetter et nyt glas med en ny ballon i */
    P.nyBallon = function () {
        this.brand = null;
        this.ballonVaek = false;
        this.proeve = this.lavProeve(this.valgt);
        this.proeve.pause = !!this.pause;
    };

    /* Et glas' plads og hoejde paa hylden eller i kammeret */
    P.glasPlads = function (i) {
        var lay = this.lay;
        if (i === "kammer") return { x: lay.glas.x, y: lay.glas.bund, h: lay.glas.h };
        var h = lay.hyldeGlas[i];
        return { x: h.x, y: h.y, h: lay.hyldeGlasH };
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var mig = this, st = this.stof(), mk = this.proeve.makro();
        var puls = 0.55 + 0.45 * Math.sin(this.tid * 7);
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 6);

        /* Reolen med glassene ved stuetemperatur */
        lay.planker.forEach(function (py) { Tg.hylde(ctx, lay.hylde.x0, lay.hylde.x1, py); });
        var trukket = this.traek && this.traek.slags === "glas" && this.traek.flyttet ? this.traek.i : -1;
        D.HYLDE.forEach(function (hs, i) {
            var hg = lay.hyldeGlas[i];
            var iLuften = mig.flyv && (i === mig.flyv.gammel || i === mig.flyv.ny);
            if (i !== mig.valgt && i !== trukket && !iLuften) {
                var G = Tg.glasMaal(hg.x, hg.y, lay.hyldeGlasH);
                var over = mig.over && mig.over.slags === "hylde" && mig.over.i === i;
                Tg.glas(ctx, G, hyldeMakro(hs), mig.tid, { lys: over ? 1 : (mig.pegHylde ? puls * 0.8 : 0) });
            }
            var skiltFarve = i === mig.valgt ? "#f2c53d" : (mig.fundet.indexOf(hs.id) >= 0 ? "#ffd2cb" : undefined);
            Tg.skilt(ctx, hg.x, hg.y + 13, [D.formel(hs)], { px: lay.skilt, farve: skiltFarve });
        });

        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.H + 10);

        /* Koppen og taendstikaesken */
        var kop = this.g.kaffekop, kk = NK.klamp(lay.H / 600, 0.8, 1.4), ae = lay.aeske;
        if (!kop.skjult && !kop.iHaand && ae && lay.kop.x + 30 < ae.x) {
            S.tegn(ctx, "kaffekop", lay.kop.x - 18 * kk, lay.kop.y - 40 * kk, 42 * kk, 40 * kk);
        }
        if (ae) S.tegn(ctx, "taendstikaeske", ae.x, ae.y, ae.b, ae.h);
        if (ae && this.over && this.over.slags === "aeske") {
            ctx.save();
            ctx.strokeStyle = "rgba(242, 197, 61, 0.8)";
            ctx.lineWidth = 2;
            NK.rundtRekt(ctx, ae.x - 3, ae.y - 3, ae.b + 6, ae.h + 6, 5);
            ctx.stroke();
            ctx.restore();
        }

        /* Kammeret med glasset */
        var K = lay.kammer, G = lay.glas;
        Tg.kammerBag(ctx, K, this.termo.T, this.tid);
        var iKammer = !this.flyv || this.flyv.t > 0.999;
        var overBallon = this.over && this.over.slags === "ballon";
        var frost = NK.klamp((-this.termo.T - 40) / 120, 0, 1);
        if (iKammer) {
            Tg.glas(ctx, G, mk, this.tid, { lys: this.over && this.over.slags === "glas" ? 1 : 0, frost: frost, udenBallon: true });
        }
        Tg.kammerFront(ctx, K, this.termo.T, { lys: this.over && this.over.slags === "kammer" ? 1 : 0 });
        /* Ballonen sidder over kammeret og tegnes efter det */
        if (iKammer) {
            Tg.ballon(ctx, G.mund.x, G.mund.y, G.s, mk.ballon, this.tid, undefined, {
                vaek: this.ballonVaek && !this.brand, pop: this.brand ? NK.klamp(this.brand.t / 0.5, 0, 1) : 0,
                lysBallon: overBallon ? 1 : 0
            });
        }

        /* Glassene, der flyver mellem hylden og kammeret */
        if (this.flyv) {
            var t = NK.blod(this.flyv.t);
            [[this.flyv.gammel, "kammer", this.flyv.gammel], [this.flyv.ny, this.flyv.ny, "kammer"]].forEach(function (f, n) {
                var fra = mig.glasPlads(f[1]), til = mig.glasPlads(f[2]);
                var x = NK.lerp(fra.x, til.x, t), y = NK.lerp(fra.y, til.y, t) - Math.sin(t * Math.PI) * 50;
                var h = NK.lerp(fra.h, til.h, t);
                var mkF = n === 0 ? hyldeMakro(D.HYLDE[f[0]]) : mk;
                Tg.glas(ctx, Tg.glasMaal(x, y, h), mkF, mig.tid, {});
            });
        }

        /* Termometeret med kogepunktet og smeltepunktet, naar de er fundet */
        var maerker = [];
        if (this.fundet.indexOf(st.id) >= 0) maerker.push({ t: st.kp, tekst: "kp", farve: KP_FARVE });
        if (this.smp[st.id]) maerker.push({ t: st.smp, tekst: "smp", farve: SMP_FARVE });
        if (maerker.length === 2 && Math.abs(lay.termo.yFor(st.kp) - lay.termo.yFor(st.smp)) < 14) { maerker[0].dy = -6; maerker[1].dy = 6; }
        var tr = this.traek;
        var foersteMaal = this.maalNr === 0 && !this.naaet && !this.termo.roert;
        var hd = Tg.termometer(ctx, lay.termo, this.termo.T, {
            trin: 50, store: 100, maerker: maerker, stue: true, tid: this.tid,
            haandtag: this.over && this.over.slags === "termo", traekker: tr && tr.slags === "termo",
            puls: foersteMaal || this.pegTermo
        });
        if (foersteMaal && !tr) Tg.traekPil(ctx, hd.x, hd.y, hd.r * 2 + 18, this.tid);

        /* Zoomvinduet */
        var z = lay.zoom;
        var fra = { x: G.ind.x0, y: G.ind.bund - G.fuld - 6 * G.s, b: G.ind.x1 - G.ind.x0, h: G.fuld + 6 * G.s };
        if (iKammer) Tg.zoomLinjer(ctx, fra, z);
        this.pauseFelt = Tg.zoomKasse(ctx, z, this.proeve, {
            kontakter: "svag",
            titel: "I glasset: " + st.navn + ", " + D.formel(st),
            forklaring: [{ farve: Tg.TILSTAND[0], tekst: "fast" }, { farve: Tg.TILSTAND[1], tekst: "væske" }, { farve: Tg.TILSTAND[2], tekst: "gas" }],
            pause: !!this.pause, pauseLys: this.over && this.over.slags === "pause",
            lys: this.over && this.over.slags === "zoom" ? 0.6 : 0
        });

        /* Pilen fra hylden til kammeret, naar maal 2 venter paa et nyt glas */
        var m = this.maal();
        if (m && m.slags === "flere" && !this.naaet && !this.byttet && !tr) {
            var mal = lay.hyldeGlas[this.valgt === 5 ? 6 : 5];
            Tg.buePil(ctx, mal.x + 6, mal.y + lay.skilt * 1.6 + 14, G.x + 14, G.top + 8, this.tid,
                Math.max(mal.x, G.x) + 50, (mal.y + G.top) / 2 + 20);
        }

        /* Glasset, der traekkes */
        if (trukket >= 0) {
            Tg.glas(ctx, Tg.glasMaal(tr.x, tr.y + lay.hyldeGlasH * 0.45, lay.hyldeGlasH), hyldeMakro(D.HYLDE[trukket]), this.tid,
                { lys: this.overKammer(tr) ? 1 : 0.4 });
        }

        /* Ildkuglen og taendstikken */
        if (this.brand) Tg.ildkugle(ctx, this.brand.x, this.brand.y, this.brand.r, this.brand.t / 1.1);
        if (this.stik) {
            Tg.taendstik(ctx, this.stik.x, this.stik.y, { s: NK.klamp(lay.H / 600, 0.8, 1.3), vinkel: 0.45, braender: this.stik.braender, tid: this.tid });
        }

        if (this.laererTegnOver) this.laererTegnOver(ctx);

        /* Kurven i panelet */
        if (this.KL.b > 10) Tg.kurve(this.KL.ctx, this.KL.b, this.KL.h, this.kurveData());
        NK.saetTekst("varm-antal", this.fundet.length + " af " + D.HYLDE.length + " målt");
    };

    /* ----- Taendstikken -------------------------------------------------------------------- */
    P.ballonFelt = function () {
        var G = this.lay.glas, mk = this.proeve.makro();
        if (this.ballonVaek) return null;
        if (mk.ballon > 0.08) {
            var B = Tg.ballonMaal(G.mund.x, G.mund.y, G.s, mk.ballon);
            return { x: B.x, y: B.y, r: B.r * 1.1 + 6, fuld: true };
        }
        return { x: G.mund.x + 10 * G.s, y: G.mund.y, r: 26 * G.s, fuld: false };
    };

    P.tjekStik = function () {
        var b = this.ballonFelt(), s = this.stik;
        if (!b) return;
        var d = Math.sqrt((s.x - b.x) * (s.x - b.x) + (s.y - 10 - b.y) * (s.y - 10 - b.y));
        if (d > b.r) { s.ved = false; return; }
        if (b.fuld && this.proeve.gasIBallonen()) {
            this.antaend(b);
        } else if (!s.ved) {
            s.ved = true;
            this.besked(NK.html(D.TOM_BALLON), "");
        }
    };

    P.antaend = function (b) {
        this.brand = { t: 0, x: b.x, y: b.y, r: b.r * 1.6 };
        this.proeve.braend();
        this.ballonVaek = true;
        this.stik = null;
        if (this.traek && this.traek.slags === "stik") this.traek = null;
        this.braende++;
        this.besked("", "");
    };

    /* ----- Musen ---------------------------------------------------------------------------- */
    P.overKammer = function (pt) {
        var K = this.lay.kammer;
        return pt.x >= K.x - 20 && pt.x <= K.x + K.b + 20 && pt.y >= this.lay.glas.top - 80 * K.s && pt.y <= K.bund;
    };

    P.hvadErUnder = function (pt) {
        var lay = this.lay;
        if (!lay) return null;
        if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return { slags: "laerer" };
        var z = lay.zoom, pk = this.pauseFelt;
        if (pk && pt.x >= pk.x && pt.x <= pk.x + pk.b && pt.y >= pk.y && pt.y <= pk.y + pk.h) return { slags: "pause" };
        if (this.termo.rammer(pt, lay.termo)) return { slags: "termo" };
        var kop = this.g.kaffekop, ae = lay.aeske;
        if (!kop.skjult && !kop.iHaand && ae && Math.abs(pt.x - lay.kop.x) < 30 && pt.y < lay.kop.y + 4 && pt.y > lay.kop.y - 60 && lay.kop.x + 30 < ae.x) {
            return { slags: "kop" };
        }
        if (ae && pt.x >= ae.x - 4 && pt.x <= ae.x + ae.b + 4 && pt.y >= ae.y - 12 && pt.y <= ae.y + ae.h + 4) return { slags: "aeske" };
        for (var i = 0; i < D.HYLDE.length; i++) {
            if (i === this.valgt) continue;
            var hg = lay.hyldeGlas[i], G = Tg.glasMaal(hg.x, hg.y, lay.hyldeGlasH);
            var b = Math.max(G.b, lay.plads * 0.9);
            if (Math.abs(pt.x - hg.x) <= b / 2 && pt.y >= G.top - G.h * 0.3 && pt.y <= hg.y + 12 + lay.skilt * 1.5) return { slags: "hylde", i: i };
        }
        var bf = this.ballonFelt();
        if (bf && bf.fuld && Math.abs(pt.x - bf.x) < bf.r && Math.abs(pt.y - bf.y) < bf.r) return { slags: "ballon" };
        var Gk = lay.glas;
        if (pt.x >= Gk.venstre - 4 && pt.x <= Gk.venstre + Gk.b + 4 && pt.y >= Gk.top && pt.y <= Gk.bund) return { slags: "glas" };
        if (this.overKammer(pt)) return { slags: "kammer" };
        if (pt.x >= z.x && pt.x <= z.x + z.b && pt.y >= z.y && pt.y <= z.y + z.h) return { slags: "zoom" };
        return null;
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointerdown", function (e) {
            var pt = mig.L.punkt(e);
            if (mig.laererIntroKlik && mig.laererIntroKlik(pt.x, pt.y)) return;
            var u = mig.hvadErUnder(pt);
            if (!u) return;
            if (u.slags === "termo") {
                if (mig.termo.start(pt, mig.lay.termo)) {
                    mig.traek = { slags: "termo" };
                    mig.proeve.T = mig.termo.T;
                }
            } else if (u.slags === "hylde") {
                mig.traek = { slags: "glas", i: u.i, start: pt, x: pt.x, y: pt.y, flyttet: false };
            } else if (u.slags === "aeske" && !mig.brand) {
                mig.traek = { slags: "stik", start: pt };
                mig.stik = { x: pt.x, y: pt.y, braender: false, tid: 0 };
            } else {
                /* Et klik: alt svarer */
                if (u.slags === "laerer") { if (mig.laererKlik) mig.laererKlik(pt.x, pt.y); }
                else if (u.slags === "kop") { if (mig.klikKop) mig.klikKop(); }
                else if (u.slags === "pause") mig.skiftPause();
                else mig.klikInfo(u);
                return;
            }
            try { c.setPointerCapture(e.pointerId); } catch (x) { /* ikke vigtigt */ }
            mig.visStatus();
        });
        c.addEventListener("pointermove", function (e) {
            var pt = mig.L.punkt(e), tr = mig.traek;
            if (tr) {
                if (tr.slags === "termo") mig.termo.flyt(pt, mig.lay.termo);
                if (tr.slags === "glas") {
                    tr.x = pt.x;
                    tr.y = pt.y;
                    if (!tr.flyttet && Math.abs(pt.x - tr.start.x) + Math.abs(pt.y - tr.start.y) > 6) tr.flyttet = true;
                }
                if (tr.slags === "stik" && mig.stik) {
                    mig.stik.x = pt.x;
                    mig.stik.y = pt.y;
                    /* Strøget: den braender, naar den er trukket op af aesken */
                    if (!mig.stik.braender && Math.abs(pt.x - tr.start.x) + Math.abs(pt.y - tr.start.y) > 24) {
                        mig.stik.braender = true;
                        mig.stik.tid = 0;
                    }
                }
                c.style.cursor = tr.slags === "termo" ? "ns-resize" : "grabbing";
                return;
            }
            mig.over = mig.hvadErUnder(pt);
            var s = mig.over && mig.over.slags;
            c.style.cursor = !s ? "default" : (s === "termo" ? "ns-resize" : (s === "hylde" || s === "aeske" ? "grab" : "pointer"));
        });
        c.addEventListener("pointerleave", function () { if (!mig.traek) { mig.over = null; c.style.cursor = "default"; } });
        c.addEventListener("pointercancel", function () { mig.slipTraek(null); });
        c.addEventListener("pointerup", function (e) { mig.slipTraek(mig.L.punkt(e)); });
    };

    P.slipTraek = function (pt) {
        var tr = this.traek;
        this.traek = null;
        if (!tr) return;
        if (tr.slags === "termo") {
            this.termo.slip();
        } else if (tr.slags === "glas") {
            if (!tr.flyttet || (pt && this.overKammer(pt))) this.skift(tr.i);
            else this.besked("Slip glasset over kammeret for at sætte det i.", "gul");
        } else if (tr.slags === "stik") {
            if (this.stik && !this.stik.braender) {
                this.besked("Tændstikker. Træk en op af æsken for at stryge den.", "");
            }
            this.stik = null;
        }
        this.visStatus();
    };

    /* Et klik uden at traekke: alt svarer */
    P.klikInfo = function (u) {
        var st = this.stof();
        if (u.slags === "glas") {
            this.besked(NK.html(st.Navn + ", " + D.formel(st) + ". ") + (this.fundet.indexOf(st.id) >= 0 ?
                "Kogepunkt: " + D.gradTekst(st.kp) + "." : "Kogepunktet er ikke fundet endnu."), "");
        } else if (u.slags === "ballon") {
            this.besked("Ballonen fanger gassen, når stoffet koger. Varm gas fylder mere.", "");
        } else if (u.slags === "kammer") {
            this.besked("Kammeret har den temperatur, termometeret viser. Træk i termometeret.", "");
        } else if (u.slags === "zoom") {
            this.besked("Hver kugle er et C-atom med dets H-atomer. De gule prikker viser, hvor molekylerne rører hinanden.", "");
        }
    };

    /* ----- Kemichaels praesentation ------------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc6.1-intro-varm", tilbud: "varm-tilbud", spring: "varm-spring" });

    /* Mens han taler om hylden og termometeret, lyser de */
    P.pegPaaFelt = function () {
        var i = this.laererIIntro && this.laererIIntro() ? this.introTrin : 0;
        this.pegHylde = i === 1;
        this.pegTermo = i === 2;
    };

    NK.SimVarm = SimVarm;
}());
