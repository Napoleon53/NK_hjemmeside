/* =====================================================================
   sim_fabrik.js - fane 1: Fabrikken

   Glycerol staar paa arbejdsbordet med sine tre OH-grupper. Eleven
   traekker fedtsyrer fra fliserne nederst hen paa OH-grupperne (et
   klik paa en flise saetter den paa den foerste ledige). Ved hver
   binding gaar fedtsyrens OH og glycerolens H sammen til et
   vandmolekyle, der svaever vaek: en esterbinding. Et klik paa en
   kaede tager den af igen (vand spalter bindingen), og en fedtsyre,
   der slippes paa en optaget plads, bytter pladsen.

   Kunderne bestiller i panelet: fast i solen, flydende i koeleskabet
   osv. Naar alle tre pladser er fyldt, tjekkes ordren med det samme,
   og panelet viser, hvor fedtet er fast (NK.Fedt.stederne).

   Knappen: Giv hint -> Vis svaret -> Naeste ordre. Efter fem ordrer
   er det fri leg, og knappen gaar videre til koekkenet (fane 2).
   Knappen Start forfra i panelet (og R) begynder forfra med ordre 1 og
   en tom glycerol. Kemichael roser kun foerste gang.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var F = NK.Fedt;
    var Tg = NK.Tegn;

    var NOEGLE = "nk-sc6.6-fabrik";
    var PAA_TID = 0.9;           /* sekunder: fedtsyren bindes */
    var MAX_B = 28;              /* hoejst saa mange pixels pr. binding */
    var GLYCEROL_TEKST = ["CH₂", "CH", "CH₂"];

    function SimFabrik() {
        this.L = new NK.Laerred(NK.el("fabrik-laerred"));
        this.tid = 0;
        this.lay = null;
        this.over = null;
        this.traek = null;
        this.g = { kaffekop: { skjult: false, iHaand: false } };
        this.slots = [0, 1, 2].map(function (i) {
            return { nr: i, syre: null, t: 1, fra: null, vand: true, fortegn: i === 0 ? -1 : 1, h: 1 };
        });
        this.vande = [];
        this.frie = [];
        this.stjerner = [];
        this.koe = [];
        this.koeVent = 0;
        this.b = 0;
        this.gAfst = 3.2;
        this.molX = 0;
        this.molY = 0;
        var gemt = NK.hent(NOEGLE, null);
        this.leveret = gemt && gemt.leveret ? gemt.leveret.slice() : [];
        this.rostFoer = !!(gemt && gemt.rost);
        this.frileg = this.leveret.length >= D.ORDRER.length;
        this.ordreNr = 0;
        this.naesteLedige();
        this.hjaelp = 0;
        this.loest = false;
        this.sidstTjekket = "";
        this.brugtPil = false;
        this.bygPanel();
        this.bygTilbud();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.visOrdre();
        this.visFedt();
    }

    var P = SimFabrik.prototype;

    P.naesteLedige = function () {
        for (var i = 0; i < D.ORDRER.length; i++) {
            var n = (this.ordreNr + i) % D.ORDRER.length;
            if (this.leveret.indexOf(n) < 0) { this.ordreNr = n; return; }
        }
    };

    /* ----- Layout --------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var kant = NK.klamp(W * 0.014, 8, 16);
        lay.kant = kant;
        var fh = NK.klamp(H * 0.14, 66, 92), gab = NK.klamp(W * 0.012, 8, 14);
        var fb = Math.min(210, (W - 2 * kant - 3 * gab) / 4);
        var x0 = (W - 4 * fb - 3 * gab) / 2;
        lay.fliseY = H - fh - 10;
        lay.bordY = lay.fliseY - 16;
        lay.fliser = D.SYRER.map(function (s, i) { return { x: x0 + i * (fb + gab), y: lay.fliseY, b: fb, h: fh }; });
        var gh = NK.klamp(H * 0.15, 66, 100);
        lay.glas = Tg.glasMaal(W - kant - 46, lay.bordY, gh);
        lay.kop = { x: kant + 32, y: lay.bordY };
        lay.omr = { x: kant + 10, y: 16, b: lay.glas.venstre - 24 - kant - 10, h: lay.bordY - 16 - 18 };
        this.lay = lay;
        this.maalMolekyle(!this.b);
        this.saetAnker("fabrik-anker-fliser", x0 - 4, lay.fliseY - 4, 4 * fb + 3 * gab + 8, fh + 8);
        this.saetAnker("fabrik-anker-glas", lay.glas.venstre - 14, lay.glas.top - 30, lay.glas.b + 28, lay.glas.h + 34);
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

    /* ----- Molekylets form --------------------------------------------------------
       Hvilken vej hver kaede boejer (fortegn), og hvor langt der er
       mellem pladserne (gAfst, i bindingslaengder), vaelges saa kaederne
       ikke roerer hinanden. Den oeverste boejer helst op, de andre ned. */
    function kaedePunkter(id, fortegn, y0) {
        return F.kaede(id, fortegn).pkt.map(function (p) { return { x: 2.6 + p.x, y: y0 + p.y }; });
    }

    function mindsteAfstand(a, b) {
        var m = Infinity;
        for (var i = 0; i < a.length; i++) {
            for (var j = 0; j < b.length; j++) {
                var dx = a[i].x - b[j].x, dy = a[i].y - b[j].y;
                m = Math.min(m, dx * dx + dy * dy);
            }
        }
        return Math.sqrt(m);
    }

    P.vaelgForm = function () {
        var ids = this.slots.map(function (s) { return s.syre; });
        /* En ret kaede boejer ikke; saa peger =O helst op */
        var foretrukket = ids.map(function (id, i) { return i === 0 && id && D.syre(id).db > 0 ? -1 : 1; });
        var bedst = null;
        for (var kombi = 0; kombi < 8; kombi++) {
            var fort = [kombi & 1 ? 1 : -1, kombi & 2 ? -1 : 1, kombi & 4 ? -1 : 1];
            for (var g = 3.2; g <= 7.01; g += 0.2) {
                var pk = ids.map(function (id, i) { return id ? kaedePunkter(id, fort[i], (i - 1) * g) : null; });
                var m = Infinity;
                for (var a = 0; a < 3; a++) {
                    for (var b = a + 1; b < 3; b++) {
                        if (pk[a] && pk[b]) m = Math.min(m, mindsteAfstand(pk[a], pk[b]));
                    }
                }
                if (m >= 1.25 || g >= 7) {
                    var afvig = 0;
                    for (var k = 0; k < 3; k++) if (ids[k] && fort[k] !== foretrukket[k]) afvig++;
                    var pris = g * 10 + afvig;
                    if (!bedst || pris < bedst.pris) bedst = { pris: pris, fort: fort, g: g };
                    break;
                }
            }
        }
        this.slots.forEach(function (s, i) { s.fortegn = bedst.fort[i]; });
        this.gMaal = bedst.g;
    };

    /* Den kasse (i bindingslaengder), molekylet fylder, og hvor stort det
       kan tegnes. */
    P.maalMolekyle = function (straks) {
        var lay = this.lay;
        if (!lay) return;
        var g = this.gMaal || 3.2;
        var x0 = -1.0, x1 = 2.6 + 14.9, y0 = -g - 0.7, y1 = g + 0.7;
        this.slots.forEach(function (s, i) {
            var yi = (i - 1) * g;
            if (!s.syre) return;
            kaedePunkter(s.syre, s.fortegn, yi).forEach(function (p) {
                x1 = Math.max(x1, p.x + 0.4);
                y0 = Math.min(y0, p.y - 0.5);
                y1 = Math.max(y1, p.y + 0.5);
            });
            var oy = yi - s.fortegn * 1.0;
            y0 = Math.min(y0, oy - 0.6);
            y1 = Math.max(y1, oy + 0.6);
        });
        var omr = lay.omr;
        var b = Math.min(MAX_B, omr.b / (x1 - x0), omr.h / (y1 - y0));
        var mx = omr.x + (omr.b - (x1 - x0) * b) / 2 - x0 * b;
        var my = omr.y + (omr.h - (y1 - y0) * b) / 2 - y0 * b;
        this.maal = { b: b, x: mx, y: my, g: g };
        if (straks) {
            this.b = b;
            this.molX = mx;
            this.molY = my;
            this.gAfst = g;
        }
    };

    /* Pixelpositionerne lige nu */
    P.geo = function () {
        var b = this.b, g = this.gAfst, mig = this;
        var o = { b: b, px: NK.klamp(b * 0.64, 12, 19), lw: NK.klamp(b * 0.085, 1.6, 2.6) };
        o.slot = this.slots.map(function (s, i) {
            var y = mig.molY + (i - 1) * g * b, x = mig.molX;
            return {
                y: y, lbl: { x: x, y: y },
                O: { x: x + 1.55 * b, y: y },
                H: { x: x + 2.2 * b, y: y },
                C1: { x: x + 2.6 * b, y: y }
            };
        });
        return o;
    };

    /* Punkterne for en fedtsyre med C1 i (cx, cy) */
    P.syrePunkter = function (id, fortegn, cx, cy) {
        var b = this.b;
        return F.kaede(id, fortegn).pkt.map(function (p) { return { x: cx + p.x * b, y: cy + p.y * b }; });
    };

    /* ----- Handlingerne ----------------------------------------------------------------- */
    P.ledig = function () {
        for (var i = 0; i < 3; i++) if (!this.slots[i].syre) return i;
        return -1;
    };

    /* Saet fedtsyren id paa plads i. fra: hvor C1 kommer fra (pixels) */
    P.saetPaa = function (i, id, fra) {
        var s = this.slots[i];
        if (s.syre) this.tagAf(i, true);
        s.syre = id;
        s.t = 0;
        s.fra = { x: fra.x, y: fra.y };
        s.vand = false;
        this.brugtPil = true;
        if (this.afvisTilbud) this.afvisTilbud();
        this.vaelgForm();
        this.maalMolekyle(false);
    };

    /* Vand spalter bindingen: fedtsyren gaar fri. tilFlise: den flyver
       hjem og forsvinder (ellers holder eleven den). */
    P.tagAf = function (i, tilFlise) {
        var s = this.slots[i];
        if (!s.syre) return null;
        var geo = this.geo(), sl = geo.slot[i];
        var id = s.syre, fort = s.fortegn;
        var c = s.t < 1 ? this.c1Nu(i, geo) : sl.C1;
        this.vande.push({ ind: true, x: sl.O.x + 0.4 * this.b, y: sl.y - 70, x1: sl.O.x + 0.4 * this.b, y1: sl.y, t: 0 });
        s.syre = null;
        s.t = 1;
        s.h = 0;
        if (tilFlise !== false) {
            var r = this.lay.fliser[D.syre(id).nr];
            this.frie.push({ id: id, fortegn: fort, x: c.x, y: c.y, x0: c.x, y0: c.y, x1: r.x + r.b * 0.3, y1: r.y + r.h * 0.5, t: 0 });
        }
        this.vaelgForm();
        this.maalMolekyle(false);
        return { id: id, x: c.x, y: c.y, fortegn: fort };
    };

    P.c1Nu = function (i, geo) {
        var s = this.slots[i], sl = geo.slot[i];
        if (!s.fra || s.t >= 1) return sl.C1;
        var k = NK.blod(Math.min(1, s.t / 0.4));
        return { x: NK.lerp(s.fra.x, sl.C1.x, k), y: NK.lerp(s.fra.y, sl.C1.y, k) };
    };

    P.kaeder = function () {
        var ud = [];
        for (var i = 0; i < 3; i++) {
            var s = this.slots[i];
            if (!s.syre || s.t < 1) return null;
            ud.push(s.syre);
        }
        return ud;
    };

    /* ----- Ordren ------------------------------------------------------------------------- */
    P.ordre = function () { return this.frileg ? null : D.ORDRER[this.ordreNr]; };

    P.tjek = function () {
        var k = this.kaeder();
        var noegle = k ? k.join(",") : "";
        if (noegle === this.sidstTjekket) return;
        this.sidstTjekket = noegle;
        NK.ditFedt = k ? k.slice() : NK.ditFedt;
        this.visFedt();
        if (!k) {
            if (this.beskedKlasse === "skidt") this.besked("", "");
            return;
        }
        var o = this.ordre();
        if (!o || this.loest) return;
        var res = F.tjekOrdre(o, k);
        if (res.ok) {
            this.loest = true;
            if (this.leveret.indexOf(this.ordreNr) < 0) this.leveret.push(this.ordreNr);
            this.besked("<b>Leveret.</b> " + NK.html(this.ros(k)), "god");
            this.fejr();
            /* Rosen for alle fem kommer kun foerste gang */
            if (this.leveret.length >= D.ORDRER.length && !this.rostFoer) {
                this.rostFoer = true;
                this.ventRos = 1.0;
            }
            this.gemFremskridt();
        } else {
            this.besked(NK.html(this.fejlTekst(o, k)), "skidt");
        }
        this.visOrdre();
    };

    P.ros = function (k) {
        var n = F.antalDb(k);
        return "Smeltepunkt " + F.smpTekst(k) + ", " + D.dbTekst(n) + ".";
    };

    P.fejlTekst = function (o, k) {
        var fedt = { kaeder: k }, tekst = "";
        Object.keys(o.krav).some(function (sid) {
            var sted = D.sted(sid), t = F.tilstand(fedt, sted.T), krav = o.krav[sid];
            if (D.opfylder(krav, t)) return false;
            var haard = !(krav === "fast" || krav === "ikkeFlydende");
            tekst = "Dit fedt er " + D.TILSTANDE[t].navn + " " + sted.i + ". Kunden vil have det " +
                D.KRAV_TEKST[krav] + ". " + (haard ? "Brug fedtsyrer med flere knæk." : "Brug flere rette kæder.");
            return true;
        });
        return tekst;
    };

    P.fejr = function () {
        var geo = this.geo(), b = this.b;
        for (var i = 0; i < 9; i++) {
            this.stjerner.push({
                x: geo.slot[1].C1.x + (Math.random() * 12 - 2) * b,
                y: geo.slot[1].y + (Math.random() - 0.5) * 8 * b,
                t: -i * 0.06, r: 6 + Math.random() * 6
            });
        }
    };

    P.gemFremskridt = function () {
        NK.gem(NOEGLE, { leveret: this.leveret, rost: this.rostFoer });
    };

    P.knap = function () {
        if (this.frileg && !this.loest) {
            /* Videre til koekkenet med det fedt, der er bygget */
            var fane = document.querySelector('[data-fane="fane-koele"]');
            if (fane) fane.click();
            return;
        }
        if (this.loest) {
            if (this.leveret.length >= D.ORDRER.length) {
                this.frileg = true;
                this.loest = false;
                this.hjaelp = 0;
                this.besked("Byg, hvad du vil. Panelet viser, hvor fedtet er fast.", "");
                this.visOrdre();
                return;
            }
            this.ordreNr = (this.ordreNr + 1) % D.ORDRER.length;
            this.naesteLedige();
            this.nyOrdre();
            return;
        }
        var o = this.ordre();
        if (!o) return;
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.besked("<b>Hint:</b> " + NK.html(o.hint), "gul");
            this.visOrdre();
            return;
        }
        /* Vis svaret: byg loesningen én fedtsyre ad gangen */
        this.hjaelp = 2;
        this.visSvar(o.svar);
        this.visOrdre();
    };

    P.visSvar = function (svar) {
        var mig = this;
        this.koe = [];
        svar.forEach(function (id, i) {
            if (mig.slots[i].syre === id) return;
            mig.koe.push({ nr: i, id: id });
        });
        this.koeVent = 0.1;
        this.besked("Sådan kan den bygges.", "gul");
    };

    P.nyOrdre = function () {
        var mig = this;
        this.slots.forEach(function (s, i) { if (s.syre) mig.tagAf(i, true); });
        this.koe = [];
        this.loest = false;
        this.hjaelp = 0;
        this.sidstTjekket = "";
        this.besked("", "");
        this.visOrdre();
        this.visFedt();
    };

    /* Start forfra (knappen i panelet og R): ordre 1, ingen leveret og
       en tom glycerol. Kemichaels ros kommer stadig kun foerste gang. */
    P.nulstil = function () {
        this.leveret = [];
        this.frileg = false;
        this.ordreNr = 0;
        this.gemFremskridt();
        this.nyOrdre();
    };

    P.enter = function () {
        if (this.loest || this.frileg) this.knap();
    };

    P.fokus = function () {};

    P.tast = function () { return false; };

    /* ----- Panelet --------------------------------------------------------------------------- */
    P.bygPanel = function () {
        var mig = this;
        this.el = {
            knap: NK.el("fabrik-knap"),
            besked: NK.el("fabrik-besked"),
            kort: NK.el("fabrik-kort")
        };
        this.el.knap.addEventListener("click", function () { mig.knap(); });
        NK.el("fabrik-forfra").addEventListener("click", function () { mig.nulstil(); });
        NK.el("fabrik-spring").addEventListener("click", function () { mig.springIntro(); });
    };

    P.besked = function (html, klasse) {
        this.beskedKlasse = klasse;
        this.el.besked.innerHTML = html;
        this.el.besked.className = "besked" + (klasse ? " " + klasse : "");
    };

    P.visOrdre = function () {
        var o = this.ordre(), mig = this;
        if (o) {
            NK.saetTekst("fabrik-titel", "Ordre");
            NK.saetHTML("fabrik-taeller", "<b>" + (this.ordreNr + 1) + "</b>/" + D.ORDRER.length);
            NK.saetTekst("fabrik-kunde", o.kunde);
            NK.saetTekst("fabrik-tekst", o.tekst);
        } else {
            NK.saetTekst("fabrik-titel", "Fri leg");
            NK.saetHTML("fabrik-taeller", "alle " + D.ORDRER.length + " leveret");
            NK.saetTekst("fabrik-kunde", "Byg, hvad du vil");
            NK.saetTekst("fabrik-tekst", "Prøv at finde et fedt, der er fast i køleskabet, men flydende på bordet.");
        }
        var pips = D.ORDRER.map(function (od, i) {
            var klar = mig.leveret.indexOf(i) >= 0, nu = !mig.frileg && i === mig.ordreNr;
            return '<span class="pip' + (klar ? " klar" : "") + (nu ? " nu" : "") + '" title="' + NK.html(od.kunde) + '">' + (klar ? "✓" : (i + 1)) + "</span>";
        }).join("");
        NK.saetHTML("fabrik-pips", pips);
        var tekst, klasse = "knap";
        if (this.loest) {
            tekst = this.leveret.length >= D.ORDRER.length ? "Fri leg" : "Næste ordre";
            klasse = "knap blaa banker";
        } else if (this.frileg) {
            tekst = "Til køleskabet";
            klasse = "knap blaa";
        } else {
            tekst = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
        }
        this.el.knap.textContent = tekst;
        this.el.knap.className = klasse;
        this.el.kort.classList.toggle("sejr", this.loest);
    };

    /* Kortet "Dit fedtstof": smeltepunktet og tilstanden de fire steder */
    P.visFedt = function () {
        var k = this.kaeder(), o = this.ordre();
        if (!k) {
            var sat = this.slots.filter(function (s) { return s.syre && s.t >= 1; }).length;
            NK.saetHTML("fabrik-db", sat + "/3 fedtsyrer");
            NK.saetHTML("fabrik-fedt", '<p class="note">Sæt tre fedtsyrer på glycerol. Så ses det her, hvor fedtet er fast.</p>');
            return;
        }
        var fedt = { kaeder: k }, n = F.antalDb(k);
        NK.saetHTML("fabrik-db", D.dbTekst(n));
        var html = '<div class="fedt-navn">' + k.map(function (id) {
            var s = D.syre(id);
            return '<span class="kaedeprik" style="background:' + s.farve + '"></span>' + NK.html(s.navn);
        }).join(" ") + "</div>";
        html += '<div class="talraekke"><span>Smeltepunkt</span><span class="tal gul">' + NK.html(F.smpTekst(k)) + "</span></div>";
        html += '<div class="stedliste">' + D.STEDER.map(function (st) {
            var t = F.tilstand(fedt, st.T), krav = o ? o.krav[st.id] : null;
            var kl = krav ? (D.opfylder(krav, t) ? " krav ok" : " krav galt") : "";
            return '<div class="stedlinje' + kl + '"><span class="sl-navn">' + NK.html(st.Navn) + "</span>" +
                '<span class="sl-T">' + D.gradTekst(st.T) + "</span>" +
                '<span class="sl-tilstand">' + Tg.tilstandSvg(t) + NK.html(D.TILSTANDE[t].navn) + "</span></div>";
        }).join("") + "</div>";
        NK.saetHTML("fabrik-fedt", html);
    };

    P.visStatus = function () {
        var t, tr = this.traek;
        var sat = this.slots.filter(function (s) { return s.syre; }).length;
        if (tr && tr.slags === "ny" && tr.flyttet) {
            t = this.overSlot !== null && this.overSlot !== undefined ?
                (this.slots[this.overSlot].syre ? "Slip: fedtsyren bytter plads med den, der sidder der." : "Slip: fedtsyren bindes, og der dannes vand.") :
                "Slip fedtsyren på en OH-gruppe på glycerol.";
        } else if (sat === 0) {
            t = "Træk en fedtsyre fra bordet hen på en OH-gruppe på glycerol.";
        } else if (sat < 3) {
            t = sat + " af 3 fedtsyrer sat på. Hver binding giver ét vandmolekyle.";
        } else {
            var k = this.kaeder();
            t = k ? "Dit fedtstof smelter ved " + NK.html(F.smpTekst(k)) + ". Klik på en kæde for at tage den af." : "Fedtsyren bindes.";
        }
        NK.saetHTML("fabrik-status", t);
    };

    /* ----- Tegneloekken --------------------------------------------------------------------- */
    P.opdater = function (dt) {
        this.tid += dt;
        var mig = this;
        if (this.maal) {
            this.b = NK.mod(this.b, this.maal.b, 5, dt);
            this.molX = NK.mod(this.molX, this.maal.x, 5, dt);
            this.molY = NK.mod(this.molY, this.maal.y, 5, dt);
            this.gAfst = NK.mod(this.gAfst, this.maal.g, 5, dt);
        }
        var geo = this.geo();
        this.slots.forEach(function (s, i) {
            s.h = Math.min(1, s.h + dt * 2.5);
            if (!s.syre || s.t >= 1) return;
            s.t = Math.min(1, s.t + dt / PAA_TID);
            if (!s.vand && s.t >= 0.4) {
                s.vand = true;
                var sl = geo.slot[i];
                mig.vande.push({ ind: false, x: sl.O.x + 0.45 * mig.b, y: sl.y - 0.2 * mig.b, t: 0, vx: 14 + Math.random() * 10 });
            }
        });
        /* Vis svaret: én fedtsyre ad gangen */
        if (this.koe.length) {
            this.koeVent -= dt;
            if (this.koeVent <= 0) {
                var h = this.koe.shift(), r = this.lay.fliser[D.syre(h.id).nr];
                this.saetPaa(h.nr, h.id, { x: r.x + r.b * 0.3, y: r.y + r.h * 0.5 });
                this.koeVent = 0.6;
            }
        }
        this.vande = this.vande.filter(function (v) {
            v.t += dt;
            if (v.ind) return v.t < 0.5;
            v.y -= 34 * dt;
            v.x += v.vx * dt;
            return v.t < 1.8;
        });
        this.frie = this.frie.filter(function (f) {
            f.t += dt / 0.7;
            var k = NK.blod(f.t);
            f.x = NK.lerp(f.x0, f.x1, k);
            f.y = NK.lerp(f.y0, f.y1, k);
            return f.t < 1;
        });
        this.stjerner = this.stjerner.filter(function (s) { s.t += dt; return s.t < 1.2; });
        this.tjek();
        if (this.ventRos > 0) {
            this.ventRos -= dt;
            if (this.ventRos <= 0 && this.laererFaerdig) this.laererFaerdig();
        }
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
        this.visStatus();
        var gl = this.lay ? this.geo().slot[0] : null;
        if (gl) this.saetAnker("fabrik-anker-glycerol", this.molX - 1.2 * this.b, this.geo().slot[0].y - 1.2 * this.b,
            3.8 * this.b, (this.geo().slot[2].y - this.geo().slot[0].y) + 2.4 * this.b);
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var mig = this, geo = this.geo();
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 6);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.H + 10);

        /* Fliserne med fedtsyrerne */
        var tr = this.traek;
        D.SYRER.forEach(function (s, i) {
            var lys = (mig.over && mig.over.slags === "flise" && mig.over.i === i) || (tr && tr.slags === "ny" && tr.id === s.id);
            Tg.flise(ctx, lay.fliser[i], s, { lys: lys ? 1 : 0 });
        });

        /* Kaffekoppen */
        var kop = this.g.kaffekop, kk = NK.klamp(lay.H / 600, 0.8, 1.4);
        if (!kop.skjult && !kop.iHaand) NK.Sprites.tegn(ctx, "kaffekop", lay.kop.x - 18 * kk, lay.kop.y - 40 * kk, 42 * kk, 40 * kk);

        /* Glasset med det faerdige fedt */
        var k = this.kaeder(), G = lay.glas;
        var fedt = k ? { kaeder: k } : null;
        Tg.glas(ctx, G, {
            tom: !k, fast: fedt ? F.fastAndel(fedt, 20) : 0, farve: fedt ? this.fedtFarve(k) : "#f2cf4a",
            laag: "#9b6bd6", tid: this.tid, lys: this.over && this.over.slags === "glas" ? 1 : 0
        });
        var fs = NK.klamp(lay.H * 0.022, 12, 14);
        NK.tekst(ctx, "Dit fedtstof", G.x, G.top - 10, { font: Tg.font("700", fs), justering: "center", farve: "#e6ebf1" });

        this.tegnMolekyle(ctx, geo);

        /* Frie fedtsyrer paa vej hjem */
        this.frie.forEach(function (f) {
            mig.tegnFriSyre(ctx, geo, f.id, f.fortegn, f.x, f.y, 1 - f.t);
        });

        /* Den, eleven holder */
        if (tr && tr.slags === "ny" && tr.flyttet) this.tegnFriSyre(ctx, geo, tr.id, tr.fortegn, tr.x, tr.y, 0.95);

        /* Vandet */
        this.vande.forEach(function (v) {
            if (v.ind) {
                var k2 = NK.blod(v.t / 0.5);
                Tg.vand(ctx, NK.lerp(v.x, v.x1, k2), NK.lerp(v.y, v.y1, k2), geo.px * 0.9, 1 - k2 * 0.7);
            } else {
                Tg.vand(ctx, v.x, v.y, geo.px * 0.9, v.t < 1.2 ? 1 : 1 - (v.t - 1.2) / 0.6);
            }
        });

        this.stjerner.forEach(function (s) {
            if (s.t > 0) Tg.stjerne(ctx, s.x, s.y - s.t * 30, s.r, 1 - s.t / 1.2);
        });

        /* Foerste gang: en pil fra fliserne op til glycerol */
        var tom = this.slots.every(function (s) { return !s.syre; });
        if (tom && !this.brugtPil && !tr) {
            var f0 = lay.fliser[0], sl0 = geo.slot[0];
            Tg.buePil(ctx, f0.x + f0.b * 0.5, f0.y - 6, sl0.H.x + geo.b * 0.5, sl0.y + geo.b * 0.6, this.tid,
                f0.x + f0.b * 0.5 + 60, sl0.y + (f0.y - sl0.y) * 0.4);
        }

        if (this.laererTegnOver) this.laererTegnOver(ctx);
    };

    /* Fedtets farve: jo flere knaek, jo mere gult (olie) */
    P.fedtFarve = function (k) {
        var n = F.antalDb(k);
        return Tg.blandHex("#f4ecd0", "#f0c63c", NK.klamp(n / 5, 0, 1));
    };

    P.tegnMolekyle = function (ctx, geo) {
        var mig = this, b = geo.b, px = geo.px, lw = geo.lw;
        var lysG = this.over && this.over.slags === "glycerol";
        /* Glycerols rygrad */
        for (var i = 0; i < 2; i++) {
            var a = geo.slot[i].lbl, c = geo.slot[i + 1].lbl;
            Tg.binding(ctx, a.x, a.y, c.x, c.y, px * 0.75, px * 0.75, lw);
        }
        this.slots.forEach(function (s, i) {
            var sl = geo.slot[i];
            Tg.atom(ctx, GLYCEROL_TEKST[i], sl.lbl.x, sl.lbl.y, px, lysG ? "#fff1b8" : T_C());
            Tg.binding(ctx, sl.lbl.x, sl.lbl.y, sl.O.x, sl.O.y, px * (i === 1 ? 0.8 : 1.15), px * 0.5, lw);
            Tg.atom(ctx, "O", sl.O.x, sl.O.y, px, Tg.O_FARVE);
            var hover = mig.overSlot === i && mig.traek && mig.traek.flyttet;
            var e = s.syre ? NK.klamp((s.t - 0.4) / 0.3, 0, 1) : 0;
            /* Glycerolens H: forsvinder, naar esterbindingen dannes */
            var hAlfa = s.syre ? 1 - e : s.h;
            if (hAlfa > 0.01) Tg.atom(ctx, "H", sl.H.x, sl.H.y, px, T_C(), hAlfa);
            if (hover) {
                ctx.save();
                ctx.strokeStyle = "rgba(242, 197, 61, " + (0.6 + 0.3 * Math.sin(mig.tid * 7)) + ")";
                ctx.lineWidth = 2.5;
                ctx.setLineDash([5, 4]);
                ctx.beginPath();
                ctx.arc(sl.H.x, sl.H.y, b * 1.1, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
            if (!s.syre) return;
            var c1 = mig.c1Nu(i, geo);
            /* Esterbindingen O-C1 kommer frem */
            if (e > 0) {
                ctx.save();
                ctx.globalAlpha *= e;
                Tg.binding(ctx, sl.O.x, sl.O.y, c1.x, c1.y, px * 0.5, 0, lw);
                ctx.restore();
            }
            var ov = mig.over && mig.over.slags === "kaede" && mig.over.i === i;
            mig.tegnSyre(ctx, geo, s.syre, s.fortegn, c1.x, c1.y, 1 - e, ov);
            /* Et gult glimt om den nye esterbinding */
            if (s.t > 0.4 && s.t < 1) {
                var g = (s.t - 0.4) / 0.6;
                ctx.save();
                ctx.strokeStyle = "rgba(242, 197, 61, " + (1 - g) + ")";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc((sl.O.x + sl.C1.x) / 2, sl.y, b * (0.6 + g * 1.2), 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
        });
    };

    function T_C() { return Tg.C_FARVE; }

    /* Fedtsyren med C1 i (cx, cy). ho: hvor meget af HO-gruppen der ses */
    P.tegnSyre = function (ctx, geo, id, fortegn, cx, cy, ho, lys) {
        var b = geo.b, px = geo.px, lw = geo.lw, s = D.syre(id);
        var pkt = this.syrePunkter(id, fortegn, cx, cy);
        if (lys) {
            ctx.save();
            ctx.shadowColor = s.farve;
            ctx.shadowBlur = 12;
            Tg.kaede(ctx, pkt, [], s.farve, lw * 2.2, 0, 0.35);
            ctx.restore();
        }
        Tg.kaede(ctx, pkt, F.kaede(id, fortegn).dobbelt, s.farve, lw * 1.25, NK.klamp(b * 0.17, 3, 5));
        /* C=O paa C1 */
        var oy = cy - fortegn * 1.0 * b;
        Tg.dobbeltBinding(ctx, cx, cy, cx, oy, 0, px * 0.5, lw, NK.klamp(b * 0.2, 3, 5.5));
        Tg.atom(ctx, "O", cx, oy, px, Tg.O_FARVE);
        if (ho > 0.01) {
            Tg.atom(ctx, "O", cx - 1.0 * b, cy, px, Tg.O_FARVE, ho);
            Tg.atom(ctx, "H", cx - 1.62 * b, cy, px, Tg.C_FARVE, ho);
            ctx.save();
            ctx.globalAlpha *= ho;
            Tg.binding(ctx, cx - 1.0 * b, cy, cx, cy, px * 0.5, 0, lw);
            ctx.restore();
        }
    };

    P.tegnFriSyre = function (ctx, geo, id, fortegn, x, y, alfa) {
        ctx.save();
        ctx.globalAlpha *= NK.klamp(alfa, 0, 1);
        this.tegnSyre(ctx, geo, id, fortegn, x, y, 1, false);
        ctx.restore();
    };

    /* ----- Musen ----------------------------------------------------------------------------- */
    function afstTilLinje(p, a, b) {
        var vx = b.x - a.x, vy = b.y - a.y, wx = p.x - a.x, wy = p.y - a.y;
        var c1 = vx * wx + vy * wy;
        if (c1 <= 0) return Math.sqrt(wx * wx + wy * wy);
        var c2 = vx * vx + vy * vy;
        if (c2 <= c1) return Math.sqrt((p.x - b.x) * (p.x - b.x) + (p.y - b.y) * (p.y - b.y));
        var t = c1 / c2, dx = p.x - (a.x + t * vx), dy = p.y - (a.y + t * vy);
        return Math.sqrt(dx * dx + dy * dy);
    }

    P.hvadErUnder = function (pt) {
        var lay = this.lay, i;
        if (!lay) return null;
        if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return { slags: "laerer" };
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand && Math.abs(pt.x - lay.kop.x) < 30 && pt.y < lay.kop.y + 4 && pt.y > lay.kop.y - 60) return { slags: "kop" };
        for (i = 0; i < lay.fliser.length; i++) {
            var r = lay.fliser[i];
            if (pt.x >= r.x && pt.x <= r.x + r.b && pt.y >= r.y && pt.y <= r.y + r.h) return { slags: "flise", i: i };
        }
        var geo = this.geo(), graense = Math.max(9, geo.b * 0.45);
        for (i = 0; i < 3; i++) {
            var s = this.slots[i];
            if (!s.syre || s.t < 1) continue;
            var sl = geo.slot[i];
            var pkt = [sl.O].concat(this.syrePunkter(s.syre, s.fortegn, sl.C1.x, sl.C1.y));
            for (var j = 1; j < pkt.length; j++) {
                if (afstTilLinje(pt, pkt[j - 1], pkt[j]) < graense) return { slags: "kaede", i: i };
            }
            if (Math.abs(pt.x - sl.C1.x) < geo.b * 0.6 && Math.abs(pt.y - (sl.y - s.fortegn * geo.b * 0.6)) < geo.b * 0.8) return { slags: "kaede", i: i };
        }
        var top = geo.slot[0].y - geo.b, bund = geo.slot[2].y + geo.b;
        if (pt.x >= this.molX - geo.b * 1.2 && pt.x <= geo.slot[0].H.x + geo.b * 0.5 && pt.y >= top && pt.y <= bund) return { slags: "glycerol" };
        var G = lay.glas;
        if (pt.x >= G.venstre && pt.x <= G.venstre + G.b && pt.y >= G.top && pt.y <= G.bund) return { slags: "glas" };
        return null;
    };

    /* Den plads, en fedtsyre med C1 i (x, y) er naermest */
    P.pladsVed = function (x, y) {
        var geo = this.geo(), bedst = null, graense = Math.max(56, geo.b * 2.6);
        for (var i = 0; i < 3; i++) {
            var sl = geo.slot[i];
            var dx = x - sl.C1.x, dy = y - sl.y, d = Math.sqrt(dx * dx + dy * dy);
            if (d < graense && (!bedst || d < bedst.d)) bedst = { i: i, d: d };
        }
        return bedst ? bedst.i : null;
    };

    P.klikUdenTraek = function (u) {
        if (u.slags === "flise") {
            var id = D.SYRER[u.i].id, i = this.ledig();
            if (i < 0) {
                this.besked("Glycerol har kun tre OH-grupper. Klik på en kæde for at tage den af, eller træk fedtsyren hen over den.", "");
                return;
            }
            var r = this.lay.fliser[u.i];
            this.saetPaa(i, id, { x: r.x + r.b * 0.3, y: r.y + r.h * 0.5 });
        }
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointerdown", function (e) {
            var pt = mig.L.punkt(e);
            if (mig.laererIntroKlik && mig.laererIntroKlik(pt.x, pt.y)) return;
            var u = mig.hvadErUnder(pt);
            if (!u) return;
            if (u.slags === "laerer") { if (mig.laererKlik) mig.laererKlik(pt.x, pt.y); return; }
            if (u.slags === "kop") { if (mig.klikKop) mig.klikKop(); return; }
            if (u.slags === "glycerol") {
                mig.besked("Glycerol er en alkohol med tre OH-grupper. Hver kan binde én fedtsyre.", "");
                return;
            }
            if (u.slags === "glas") {
                var k = mig.kaeder();
                mig.besked(k ? "Dit fedtstof på køkkenbordet, 20 °C. Det er " + D.TILSTANDE[F.tilstand({ kaeder: k }, 20)].navn + ". Du kan tage det med ud i køkkenet på fane 2." :
                    "Glasset er tomt. Byg et fedtstof, så kommer det i glasset.", "");
                return;
            }
            if (u.slags === "flise") {
                var id = D.SYRER[u.i].id;
                mig.traek = { slags: "ny", id: id, fortegn: 1, flise: u.i, x0: pt.x, y0: pt.y, x: pt.x, y: pt.y, flyttet: false, dx: -2.2 * mig.b, dy: 0 };
            } else if (u.slags === "kaede") {
                mig.traek = { slags: "slot", i: u.i, x0: pt.x, y0: pt.y, flyttet: false };
            }
            try { c.setPointerCapture(e.pointerId); } catch (x) { /* ikke vigtigt */ }
        });
        c.addEventListener("pointermove", function (e) {
            var pt = mig.L.punkt(e), tr = mig.traek;
            if (tr) {
                var flyt = Math.abs(pt.x - tr.x0) + Math.abs(pt.y - tr.y0) > 6;
                if (tr.slags === "slot" && flyt) {
                    /* Kaeden traekkes af: vand spalter bindingen, og eleven holder fedtsyren */
                    var geo = mig.geo(), sl = geo.slot[tr.i];
                    var fri = mig.tagAf(tr.i, false);
                    mig.traek = tr = { slags: "ny", id: fri.id, fortegn: fri.fortegn, flise: D.syre(fri.id).nr, x0: tr.x0, y0: tr.y0,
                                       flyttet: true, dx: sl.C1.x - pt.x, dy: sl.y - pt.y };
                }
                if (tr.slags === "ny") {
                    if (flyt) tr.flyttet = true;
                    tr.x = pt.x + tr.dx;
                    tr.y = pt.y + tr.dy;
                    mig.overSlot = tr.flyttet ? mig.pladsVed(tr.x, tr.y) : null;
                }
                c.style.cursor = "grabbing";
                return;
            }
            mig.over = mig.hvadErUnder(pt);
            var s = mig.over && mig.over.slags;
            c.style.cursor = !s ? "default" : (s === "flise" || s === "kaede" ? "grab" : "pointer");
        });
        c.addEventListener("pointerleave", function () { if (!mig.traek) { mig.over = null; c.style.cursor = "default"; } });
        function slip() {
            var tr = mig.traek;
            if (!tr) return;
            mig.traek = null;
            mig.overSlot = null;
            if (tr.slags === "slot") {
                /* Klik paa en kaede: vand spalter bindingen, og den flyver hjem */
                mig.tagAf(tr.i, true);
                mig.besked("Vand spaltede esterbindingen. Fedtsyren og glycerolens OH-gruppe er tilbage.", "");
                return;
            }
            if (!tr.flyttet) { mig.klikUdenTraek({ slags: "flise", i: tr.flise }); return; }
            var i = mig.pladsVed(tr.x, tr.y);
            if (i !== null) {
                mig.saetPaa(i, tr.id, { x: tr.x, y: tr.y });
            } else {
                var r = mig.lay.fliser[D.syre(tr.id).nr];
                mig.frie.push({ id: tr.id, fortegn: tr.fortegn, x: tr.x, y: tr.y, x0: tr.x, y0: tr.y, x1: r.x + r.b * 0.3, y1: r.y + r.h * 0.5, t: 0 });
            }
        }
        c.addEventListener("pointerup", slip);
        c.addEventListener("pointercancel", slip);
    };

    /* ----- Kemichaels praesentation ------------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc6.6-intro-fabrik", tilbud: "fabrik-tilbud", spring: "fabrik-spring" });

    P.pegPaaFelt = function () {};

    NK.SimFabrik = SimFabrik;
}());
