/* =====================================================================
   sim_vaegt.js - fane 1: vaegten

   Seks krukker staar paa hylden, én pr. grundstof, med molarmassen paa
   etiketten. Hver klump i en krukke er 1 mol. Eleven traekker klumper op
   paa vaegten (eller klikker paa krukken eller vaegten), og vaegten viser
   massen. Et klik paa en anden krukke skifter stof: klumperne flyver hjem,
   og lige saa mange kommer fra den nye krukke. Saa ses det, at antallet af
   mol og atomer er det samme, men massen en anden.

   Klumperne er terninger med det rumfang, 1 mol af stoffet har, tegnet i
   vaegtens maalestok (NK.Sprites.MAAL.vaegt.cm). Zoomboblen viser atomerne.

   Fire maal (D.MAAL) foerer eleven igennem pointen. Knappen giver et hint
   og saa svaret. Hvor langt eleven er naaet, huskes under NOEGLE.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;

    var NOEGLE = "nk-sc4.2-vaegt";
    var FLYV_TID = 0.42;
    var FORSKYD = 0.06;          /* klumperne letter efter hinanden ved et skift */
    var RAEKKER = [5, 4, 1];     /* klumper i hver raekke paa skaalen */

    function SimVaegt() {
        this.L = new NK.Laerred(NK.el("vaegt-laerred"));
        this.tid = 0;
        this.lay = null;
        this.over = null;
        this.traek = null;
        this.klumper = [];
        this.valgt = D.STOFFER.indexOf(D.stof("Cu"));
        this.g = { kaffekop: { skjult: false, iHaand: false } };
        var gemt = NK.hent(NOEGLE, {}) || {};
        this.maalNr = NK.klamp(gemt.maal || 0, 0, D.MAAL.length);
        this.rost = this.maalNr >= D.MAAL.length;
        this.hjaelp = 0;
        this.naaet = false;
        this.fremhaev = null;

        this.bygPanel();
        this.bygTilbud();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.visMaal();
        this.visMaaling();
        this.visStatus();
    }

    var P = SimVaegt.prototype;

    /* ----- Layout ------------------------------------------------------------------ */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var kant = NK.klamp(W * 0.014, 8, 16);
        lay.kant = kant;
        lay.bordY = Math.round(H * 0.9);

        /* Plakaten oeverst til hoejre, hylden med krukkerne til venstre for den.
           Plakaten er lidt smallere end paa de andre faner, saa krukkerne kan
           vaere stoerre. */
        var pb = NK.klamp(W * 0.26, 150, 280);
        lay.plakat = { x: W - kant - pb, y: kant, b: pb, h: Math.round(pb * 0.4) };
        var hx0 = kant, hx1 = lay.plakat.x - Math.max(14, W * 0.02);
        var plads = (hx1 - hx0) / D.STOFFER.length;
        var kh = Math.min(plads * 0.92 * 1.3, H * 0.24, 170);
        lay.krukkeH = kh;
        /* Krukkerne staar under tilbuddet om praesentationen, der er midt foroven */
        var luft = NK.klamp(H * 0.09, 8, 64);
        lay.hylde = { x0: hx0, x1: hx1, y: Math.round(kant + luft + kh + 4) };
        lay.krukker = D.STOFFER.map(function (st, i) { return { x: hx0 + plads * (i + 0.5), y: lay.hylde.y }; });

        /* Vaegten paa bordet */
        var vb = NK.klamp(Math.min(W * 0.34, (lay.bordY - lay.hylde.y - 40) * 0.95), 150, 320);
        lay.vaegtB = vb;
        lay.vaegt = { x: Math.round(NK.klamp(W * 0.38, kant + vb / 2 + 70, W - kant - vb / 2)), y: lay.bordY };
        lay.skaal = Tg.vaegtSkaal(lay.vaegt.x, lay.bordY, vb);
        lay.cm = vb / NK.Sprites.MAAL.vaegt.b * NK.Sprites.MAAL.vaegt.cm;
        lay.kop = { x: Math.max(kant + 24, lay.vaegt.x - vb / 2 - 56), y: lay.bordY };

        /* Zoomboblen til hoejre for vaegten, under hylden og plakaten */
        var zoneTop = Math.max(lay.plakat.y + lay.plakat.h, lay.hylde.y + 16) + 6;
        var R = NK.klamp(Math.min(W * 0.15, (lay.bordY - zoneTop - 30) * 0.42), 36, 130);
        lay.zoom = {
            x: W - kant - R - 20,
            y: Math.max(zoneTop + R, zoneTop + (lay.bordY - zoneTop - 26) / 2 - R * 0.15),
            R: R
        };

        /* Feltet over skaalen, hvor en klump kan slippes: tre raekker af de
           stoerste klumper og lidt luft */
        var slipTop = lay.skaal.y - 3.4 * this.kantPx(D.stof("Au"), lay) - 30;
        lay.slip = { x: lay.vaegt.x - vb / 2, y: slipTop, b: vb, h: lay.bordY - slipTop };
        this.lay = lay;
        this.maalKlumper(true);

        this.saetAnker("vaegt-anker-hylde", hx0, lay.hylde.y - kh - 6, hx1 - hx0, kh + 18);
        this.saetAnker("vaegt-anker-vaegt", lay.slip.x, lay.slip.y, lay.slip.b, lay.slip.h);
        this.saetAnker("vaegt-anker-zoom", lay.zoom.x - R, lay.zoom.y - R, 2 * R, 2 * R);
        this.saetAnker("vaegt-anker-plakat", lay.plakat.x, lay.plakat.y, lay.plakat.b, lay.plakat.h);
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

    /* Klumpens kant i px: terningen med rumfanget af 1 mol, i vaegtens maalestok */
    P.kantPx = function (st, lay) {
        lay = lay || this.lay;
        return st.kant * lay.cm;
    };

    /* ----- Klumperne ------------------------------------------------------------------
       En klump er { st, plads, x, y, fra, t, maal, hjem }. hjem: den er paa
       vej tilbage til sin krukke og forsvinder, naar den er der. */
    P.paaVaegten = function () {
        return this.klumper.filter(function (k) { return !k.hjem; });
    };

    /* Klumperne, der er landet: dem viser vaegten og panelet */
    P.landet = function () {
        return this.klumper.filter(function (k) { return !k.hjem && !k.fra && !k.venter; }).length;
    };

    P.iLuften = function () {
        return this.klumper.some(function (k) { return k.fra || k.venter; });
    };

    /* Pladsen paa skaalen: raekker paa 5, 4 og 1, hver centreret */
    P.klumpPlads = function (plads, antal, c) {
        var lay = this.lay, raekke = 0, foer = 0;
        while (raekke < RAEKKER.length - 1 && plads >= foer + RAEKKER[raekke]) { foer += RAEKKER[raekke]; raekke++; }
        var iRaekke = Math.min(RAEKKER[raekke], Math.max(1, antal - foer));
        var mellem = c * 1.12, dx = c * 0.3;
        var x0 = lay.skaal.x - dx / 2 - (iRaekke - 1) * mellem / 2;
        return { x: x0 + (plads - foer) * mellem, y: lay.skaal.y + 1 - raekke * c, raekke: raekke };
    };

    P.maalKlumper = function (straks) {
        if (!this.lay) return;
        var mig = this, paa = this.paaVaegten(), antal = paa.length;
        paa.forEach(function (k) {
            k.maal = mig.klumpPlads(k.plads, antal, mig.kantPx(k.st));
            if (straks && !k.fra) { k.x = k.maal.x; k.y = k.maal.y; }
        });
    };

    P.krukkeMund = function (i) {
        var lay = this.lay, kr = lay.krukker[i];
        return { x: kr.x, y: kr.y - lay.krukkeH * 0.55 };
    };

    /* Laeg én klump af stof i paa vaegten. fra: hvor den kommer fra (musen) */
    P.laegPaa = function (i, fra) {
        if (i !== this.valgt) this.skift(i);
        var paa = this.paaVaegten();
        if (paa.length >= D.KLUMPER_MAKS) {
            this.besked("Der er ikke plads til flere. 10 mol er nok til at se det.", "gul");
            return false;
        }
        var st = D.STOFFER[i];
        var start = fra || this.krukkeMund(i);
        var k = { st: st, plads: paa.length, x: start.x, y: start.y, fra: { x: start.x, y: start.y }, t: 0, maal: null };
        this.klumper.push(k);
        this.maalKlumper(false);
        this.efterHandling();
        return true;
    };

    /* Tag en klump af: den flyver hjem til sin krukke, og de andre rykker sammen */
    P.tagAf = function (k) {
        if (!k || k.hjem) return;
        k.hjem = true;
        k.fra = { x: k.x, y: k.y };
        k.t = 0;
        k.venter = 0;
        k.maal = this.krukkeMund(D.STOFFER.indexOf(k.st));
        var n = 0;
        this.klumper.forEach(function (x) { if (!x.hjem) x.plads = n++; });
        this.maalKlumper(false);
        this.efterHandling();
    };

    /* Skift stof: de klumper, der ligger, flyver hjem, og lige saa mange
       kommer fra den nye krukke til de samme pladser */
    P.skift = function (i) {
        if (i === this.valgt) return;
        var mig = this, gamle = this.paaVaegten();
        this.valgt = i;
        gamle.forEach(function (k, j) {
            k.hjem = true;
            k.fra = { x: k.x, y: k.y };
            k.t = 0;
            k.venter = j * FORSKYD;
            k.maal = mig.krukkeMund(D.STOFFER.indexOf(k.st));
        });
        var st = D.STOFFER[i], start = this.krukkeMund(i);
        gamle.forEach(function (g, j) {
            mig.klumper.push({ st: st, plads: g.plads, x: start.x, y: start.y, fra: { x: start.x, y: start.y }, t: 0,
                venter: 0.18 + j * FORSKYD, maal: null });
        });
        this.maalKlumper(false);
        this.efterHandling();
    };

    /* Vis svaret: stof og antal saettes, som maalet vil have det */
    P.saetTil = function (s, n) {
        var i = D.STOFFER.indexOf(D.stof(s));
        if (i !== this.valgt) this.skift(i);
        var paa = this.paaVaegten();
        while (paa.length > n) { this.tagAf(paa[paa.length - 1]); paa = this.paaVaegten(); }
        while (this.paaVaegten().length < n) this.laegPaa(i);
    };

    /* Efter hver handling: statuslinjen og panelet. Om maalet er naaet,
       ses foerst, naar klumperne er landet (opdater). */
    P.efterHandling = function () {
        this.visStatus();
        this.visMaaling();
    };

    /* ----- Maalene ----------------------------------------------------------------------- */
    P.maal = function () { return D.MAAL[this.maalNr] || null; };

    P.tjekMaal = function () {
        var m = this.maal();
        if (!m || this.naaet || this.iLuften()) return;
        var st = D.STOFFER[this.valgt], n = this.landet();
        if (st.s === m.s && n === m.n) {
            this.naaet = true;
            this.hjaelp = 0;
            this.fremhaev = null;
            this.besked(m.efter, "god");
            if (this.afvisTilbud) this.afvisTilbud();
            NK.gem(NOEGLE, { maal: Math.max(this.maalNr + 1, (NK.hent(NOEGLE, {}) || {}).maal || 0) });
            this.visMaal();
            return;
        }
        /* Maal 4: tre mol af et andet stof faar et svar */
        if (this.maalNr === 3 && n === 3 && st.s !== m.s && this.sidstSvaret !== st.s) {
            this.sidstSvaret = st.s;
            this.besked("3 mol " + st.navn + " vejer " + NK.komma(D.masse(st, 3)) + " g. Der er et stof, der vejer mindre.", "gul");
        }
    };

    P.knap = function () {
        var m = this.maal();
        if (!m) {
            /* Alle maal er naaet: forfra */
            this.maalNr = 0;
            NK.gem(NOEGLE, { maal: D.MAAL.length });
            this.tomVaegten();
            this.valgt = D.STOFFER.indexOf(D.stof("Cu"));
            this.naaet = false;
            this.hjaelp = 0;
            this.besked("", "");
            this.visMaal();
            return;
        }
        if (this.naaet) {
            this.maalNr++;
            this.naaet = false;
            this.hjaelp = 0;
            this.sidstSvaret = null;
            this.besked("", "");
            if (this.maalNr >= D.MAAL.length && !this.rost) {
                this.rost = true;
                this.ventRos = 1.0;
            }
            this.visMaal();
            this.tjekMaal();
            return;
        }
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.fremhaev = m.fremhaev || m.s;
            this.besked("<b>Hint:</b> " + NK.html(m.hint), "gul");
        } else {
            this.saetTil(m.s, m.n);
        }
        this.visMaal();
    };

    P.tomVaegten = function () {
        var mig = this;
        this.paaVaegten().forEach(function (k) { mig.tagAf(k); });
    };

    P.nulstil = function () {
        this.tomVaegten();
        this.besked("", "");
    };

    P.enter = function () {
        if (this.naaet || !this.maal()) this.knap();
    };

    P.fokus = function () {};

    /* ----- Panelet ---------------------------------------------------------------------- */
    P.bygPanel = function () {
        var mig = this;
        this.el = {
            knap: NK.el("vaegt-knap"),
            besked: NK.el("vaegt-besked"),
            kort: NK.el("vaegt-kort")
        };
        this.el.knap.addEventListener("click", function () { mig.knap(); });
        NK.el("vaegt-spring").addEventListener("click", function () { mig.springIntro(); });
    };

    P.besked = function (html, klasse) {
        this.el.besked.innerHTML = html;
        this.el.besked.className = "besked" + (klasse ? " " + klasse : "");
    };

    P.visMaal = function () {
        var m = this.maal();
        NK.saetTekst("vaegt-nr", String(Math.min(this.maalNr + 1, D.MAAL.length)));
        if (m) {
            NK.saetTekst("vaegt-maal-titel", "Mål");
            NK.saetTekst("vaegt-prompt", m.tekst);
        } else {
            NK.saetTekst("vaegt-maal-titel", "Frit valg");
            NK.saetTekst("vaegt-prompt", "Læg på, tag af og skift stof, som du vil.");
        }
        var tekst, klasse = "knap";
        if (!m) { tekst = "Start målene forfra"; }
        else if (this.naaet) { tekst = this.maalNr >= D.MAAL.length - 1 ? "Afslut målene →" : "Næste mål →"; klasse = "knap blaa banker"; }
        else tekst = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
        this.el.knap.textContent = tekst;
        this.el.knap.className = klasse;
        this.el.kort.classList.toggle("sejr", this.naaet);
        NK.el("vaegt-taeller").hidden = !m;
    };

    /* Beregningerne for det, der er landet paa vaegten */
    P.visMaaling = function () {
        var st = D.STOFFER[this.valgt], n = this.landet();
        var m = D.masse(st, n);
        NK.saetTekst("vaegt-stof", st.navn + ", " + st.s);
        NK.saetTekst("vaegt-regn-n", "n = " + n + " mol");
        NK.saetTekst("vaegt-regn-m", n ? D.regnMasse(st, n, null, NK.komma(m)) : "m = 0 g");
        NK.saetTekst("vaegt-regn-N", n ? D.regnAntal(n, null, NK.potens(D.antal(n), 3)) : "N = 0");
        NK.saetTekst("vaegt-V", n ? NK.betydende(D.rumfang(st, m), 3) + " cm³" : "0 cm³");
    };

    P.visStatus = function () {
        var n = this.paaVaegten().length, t;
        if (this.traek && this.traek.flyttet) t = "Slip klumpen over vægten.";
        else if (n === 0) t = "Træk en klump fra en krukke op på vægten. Hver klump er 1 mol.";
        else if (n >= D.KLUMPER_MAKS) t = "Vægten er fuld. Klik på en klump for at tage den af.";
        else t = "Klik på en anden krukke for at skifte stof. Klik på en klump for at tage den af.";
        NK.saetHTML("vaegt-status", t);
    };

    /* ----- Tegneloekken ------------------------------------------------------------------- */
    P.opdater = function (dt) {
        this.tid += dt;
        var mig = this, landede = false;
        this.klumper.forEach(function (k) {
            if (k.venter > 0) { k.venter -= dt; return; }
            k.venter = 0;
            if (k.fra) {
                if (!k.maal) return;
                k.t = Math.min(1, k.t + dt / FLYV_TID);
                if (k.t >= 1) {
                    k.fra = null;
                    k.x = k.maal.x;
                    k.y = k.maal.y;
                    if (!k.hjem) landede = true;
                }
            } else if (k.maal && !k.hjem) {
                k.x = NK.mod(k.x, k.maal.x, 12, dt);
                k.y = NK.mod(k.y, k.maal.y, 12, dt);
            }
        });
        var foer = this.klumper.length;
        this.klumper = this.klumper.filter(function (k) { return !(k.hjem && !k.fra && !k.venter); });
        if (landede || foer !== this.klumper.length) {
            this.visMaaling();
            this.tjekMaal();
        }
        if (this.ventRos > 0) {
            this.ventRos -= dt;
            if (this.ventRos <= 0 && this.laererFaerdig) this.laererFaerdig();
        }
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
    };

    /* Klumpens plads lige nu (ogsaa undervejs i luften) */
    P.klumpPos = function (k) {
        if (!k.fra || !k.maal || k.venter > 0) return { x: k.fra ? k.fra.x : k.x, y: k.fra ? k.fra.y : k.y };
        var t = NK.blod(k.t);
        return {
            x: NK.lerp(k.fra.x, k.maal.x, t),
            y: NK.lerp(k.fra.y, k.maal.y, t) - Math.sin(t * Math.PI) * 60
        };
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var mig = this;
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 6);

        var puls = 0.55 + 0.45 * Math.sin(this.tid * 7);
        Tg.molPlakat(ctx, lay.plakat.x, lay.plakat.y, lay.plakat.b, lay.plakat.h, {});

        /* Hylden med krukkerne */
        Tg.hylde(ctx, lay.hylde.x0, lay.hylde.x1, lay.hylde.y);
        D.STOFFER.forEach(function (st, i) {
            var kr = lay.krukker[i];
            var over = mig.over && mig.over.slags === "krukke" && mig.over.i === i;
            Tg.krukke(ctx, kr.x, kr.y, lay.krukkeH, st, {
                valgt: i === mig.valgt,
                lys: over || mig.pegHylde,
                fremhaev: mig.fremhaev === st.s || mig.fremhaev === "alle" ? puls : 0
            });
        });

        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.H + 10);

        /* Koppen */
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand) {
            var kk = NK.klamp(lay.H / 600, 0.8, 1.4);
            NK.Sprites.tegn(ctx, "kaffekop", lay.kop.x - 18 * kk, lay.kop.y - 40 * kk, 42 * kk, 40 * kk);
        }

        /* Vaegten med displayet */
        var st = D.STOFFER[this.valgt], n = this.landet();
        Tg.vaegt(ctx, lay.vaegt.x, lay.vaegt.y, lay.vaegtB, Tg.gram(D.masse(st, n)), { lys: this.iLuften() ? 1 : 0 });

        /* Klumperne paa skaalen, nedefra og fra venstre; dem i luften til sidst */
        var paa = this.klumper.filter(function (k) { return !k.fra && !k.hjem && k !== (mig.traek && mig.traek.klump); });
        paa.sort(function (a, b) { return (b.y - a.y) || (a.x - b.x); });
        paa.forEach(function (k) {
            var lys = mig.over && mig.over.slags === "klump" && mig.over.k === k;
            Tg.klump(ctx, k.x, k.y, mig.kantPx(k.st), k.st, { lys: lys ? 1 : 0 });
        });

        /* Zoomboblen, naar der ligger noget */
        var oeverst = null;
        paa.forEach(function (k) { if (!oeverst || k.y < oeverst.y) oeverst = k; });
        if (oeverst) {
            var z = lay.zoom, c = this.kantPx(oeverst.st);
            Tg.zoomLinje(ctx, z.x, z.y, z.R, oeverst.x + c * 0.15, oeverst.y - c * 0.6);
            Tg.zoom(ctx, z.x, z.y, z.R, oeverst.st, this.tid, {});
            NK.tekst(ctx, "Atomerne i " + oeverst.st.navn, z.x, z.y + z.R + 18, {
                justering: "center", font: Tg.font("600", NK.klamp(z.R * 0.13, 12, 15)), farve: "#c8ced6"
            });
        }

        this.klumper.forEach(function (k) {
            if (!k.fra) return;
            /* En klump, der venter paa at flyve hjem, ligger endnu paa skaalen */
            if (k.venter > 0) {
                if (k.hjem) Tg.klump(ctx, k.fra.x, k.fra.y, mig.kantPx(k.st), k.st, {});
                return;
            }
            var p = mig.klumpPos(k);
            var skala = k.hjem ? 1 - 0.5 * NK.blod(k.t) : 0.5 + 0.5 * NK.blod(k.t);
            Tg.klump(ctx, p.x, p.y, mig.kantPx(k.st) * skala, k.st, {});
        });

        /* Klumpen, der traekkes */
        var tr = this.traek;
        if (tr && tr.flyttet) {
            var tst = tr.klump ? tr.klump.st : D.STOFFER[tr.i];
            var c2 = this.kantPx(tst);
            Tg.klump(ctx, tr.x, tr.y + c2 / 2, c2, tst, { lys: this.overSlip(tr) ? 1 : 0.4 });
        }

        /* Pilen viser, hvad der kan traekkes, saa laenge vaegten er tom */
        if (!tr && this.paaVaegten().length === 0) {
            var kx = lay.krukker[this.valgt].x;
            Tg.buePil(ctx, kx, lay.hylde.y + 22, lay.skaal.x, lay.skaal.y - 18, this.tid, lay.skaal.x, lay.hylde.y + 22);
        }

        if (this.laererTegnOver) this.laererTegnOver(ctx);
    };

    /* ----- Musen ---------------------------------------------------------------------------- */
    P.overSlip = function (pt) {
        var s = this.lay.slip;
        return pt.x >= s.x && pt.x <= s.x + s.b && pt.y >= s.y && pt.y <= s.y + s.h;
    };

    P.hvadErUnder = function (pt) {
        var lay = this.lay;
        if (!lay) return null;
        if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return { slags: "laerer" };
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand && Math.abs(pt.x - lay.kop.x) < 30 && pt.y < lay.kop.y + 4 && pt.y > lay.kop.y - 60) {
            return { slags: "kop" };
        }
        var b = Tg.krukkeBredde(lay.krukkeH);
        for (var i = 0; i < lay.krukker.length; i++) {
            var kr = lay.krukker[i];
            if (Math.abs(pt.x - kr.x) <= b / 2 && pt.y <= kr.y && pt.y >= kr.y - lay.krukkeH) return { slags: "krukke", i: i };
        }
        var paa = this.paaVaegten().filter(function (k) { return !k.fra; });
        for (var j = paa.length - 1; j >= 0; j--) {
            var k = paa[j], c = this.kantPx(k.st), r = Tg.klumpRekt(k.x, k.y, c);
            if (pt.x >= r.x && pt.x <= r.x + r.b && pt.y >= r.y && pt.y <= r.y + r.h) return { slags: "klump", k: k };
        }
        if (this.overSlip(pt)) return { slags: "vaegt" };
        var p = lay.plakat, z = lay.zoom;
        if (pt.x >= p.x && pt.x <= p.x + p.b && pt.y >= p.y && pt.y <= p.y + p.h) return { slags: "plakat" };
        if (this.landet() && (pt.x - z.x) * (pt.x - z.x) + (pt.y - z.y) * (pt.y - z.y) <= z.R * z.R) return { slags: "zoom" };
        return null;
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointerdown", function (e) {
            var pt = mig.L.punkt(e);
            var u = mig.hvadErUnder(pt);
            if (!u || (u.slags !== "krukke" && u.slags !== "klump")) return;
            mig.traek = { i: u.i, klump: u.k || null, start: pt, x: pt.x, y: pt.y, flyttet: false };
            try { c.setPointerCapture(e.pointerId); } catch (x) { /* ikke vigtigt */ }
        });
        c.addEventListener("pointermove", function (e) {
            var pt = mig.L.punkt(e), tr = mig.traek;
            if (tr) {
                tr.x = pt.x;
                tr.y = pt.y;
                if (!tr.flyttet && Math.abs(pt.x - tr.start.x) + Math.abs(pt.y - tr.start.y) > 6) {
                    tr.flyttet = true;
                    mig.visStatus();
                }
                c.style.cursor = "grabbing";
                return;
            }
            mig.over = mig.hvadErUnder(pt);
            c.style.cursor = mig.over ? (mig.over.slags === "krukke" || mig.over.slags === "klump" ? "grab" : "pointer") : "default";
        });
        c.addEventListener("pointerleave", function () { if (!mig.traek) { mig.over = null; c.style.cursor = "default"; } });
        c.addEventListener("pointercancel", function () { mig.traek = null; mig.visStatus(); });
        c.addEventListener("pointerup", function (e) {
            var pt = mig.L.punkt(e), tr = mig.traek;
            mig.traek = null;
            if (tr && tr.flyttet) {
                if (tr.klump) {
                    /* En klump slippes uden for vaegten: den tages af */
                    if (!mig.overSlip(pt)) {
                        tr.klump.x = pt.x;
                        tr.klump.y = pt.y;
                        mig.tagAf(tr.klump);
                    }
                } else if (mig.overSlip(pt)) {
                    mig.laegPaa(tr.i, { x: pt.x, y: pt.y + mig.kantPx(D.STOFFER[tr.i]) / 2 });
                } else {
                    mig.besked("Slip klumpen over vægten.", "gul");
                }
                mig.visStatus();
                return;
            }
            mig.klik(pt);
        });
    };

    P.klik = function (pt) {
        if (this.laererIntroKlik && this.laererIntroKlik(pt.x, pt.y)) return;
        if (this.laererKlik && this.laererKlik(pt.x, pt.y)) return;
        var u = this.hvadErUnder(pt);
        if (!u) return;
        if (u.slags === "kop" && this.klikKop) { this.klikKop(); return; }
        if (u.slags === "krukke") {
            if (u.i !== this.valgt) {
                this.skift(u.i);
                if (!this.paaVaegten().length) this.besked(D.STOFFER[u.i].Navn + " er valgt. Træk en klump op på vægten.", "");
            } else {
                this.laegPaa(u.i);
            }
            return;
        }
        if (u.slags === "klump") { this.tagAf(u.k); this.over = null; return; }
        if (u.slags === "vaegt") { this.laegPaa(this.valgt); return; }
        if (u.slags === "plakat") { this.besked("1 mol er 6,02 · 10²³ atomer, uanset hvilket stof det er.", ""); return; }
        if (u.slags === "zoom") {
            this.besked("Atomerne i " + NK.html(D.STOFFER[this.valgt].navn) + ". Hver klump er 6,02 · 10²³ af dem.", "");
        }
    };

    /* ----- Kemichaels praesentation ------------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc4.2-intro-vaegt", tilbud: "vaegt-tilbud", spring: "vaegt-spring" });

    /* Mens han siger, at man skifter stof paa hylden, lyser krukkerne */
    P.pegPaaFelt = function (til) { this.pegHylde = til; };

    NK.SimVaegt = SimVaegt;
}());
