/* =====================================================================
   sim_hotdog.js - fane 1: poelsevognen

   Opskriften haenger paa vaeggen: 1 poelse + 1 broed + 2 agurkeskiver
   giver 1 hotdog, og senere 1 bolle + 2 boeffer + 3 skiver ost giver 1
   dobbeltburger. Eleven traekker tingene fra beholderne hen paa
   skaerebraettet (et klik paa en beholder virker ogsaa) og ringer med
   klokken. Saa samles retterne paa bakken efter opskriften, og det, der
   ikke passer, bliver liggende med en orange ramme.

   Brættet har plads til 12 af hver ting, og alle ordrer holder sig under
   det, saa alt kan ses. Tingene pakkes i raekker, saa de aldrig ligger
   oven i hinanden.

   Ti ordrer (D.ORDRER) i tre slags: paa brættet ("disk"), hvor meget der
   skal bruges ("tal"), og den begraensende ingrediens med antal og
   overskud ("begr"). Knappen giver et hint og saa svaret. Loeste ordrer
   huskes under NOEGLE, og panelet kan springe til hotdogs eller burgere.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;
    var Tj = NK.Tjek;

    var NOEGLE = "nk-sc4.4-poelsevogn";
    var FLYV = 0.4;            /* en ting flyver fra beholderen til brættet */
    var SAML = 0.55;           /* tingene flyver hen paa bakken */
    var FORSKYD = 0.1;         /* retterne samles efter hinanden */
    var SLIDE = 0.8;           /* bakken koeres ud til kunden */
    var HOEJDE = { gryde: 1, kurv: 0.82, agurkglas: 1.02, stegeplade: 0.72, ostepakke: 0.78 };

    function SimHotdog() {
        this.L = new NK.Laerred(NK.el("hotdog-laerred"));
        this.tid = 0;
        this.lay = null;
        this.over = null;
        this.traek = null;
        this.ting = [];
        this.serv = null;
        this.ding = 0;
        this.serveret = null;
        this.g = { kaffekop: { skjult: false, iHaand: false } };
        var gemt = NK.hent(NOEGLE, {}) || {};
        this.loest = D.ORDRER.map(function (o, i) { return !!(gemt.l && gemt.l[i]); });
        this.rost = this.loest.every(Boolean);
        this.friOps = "hotdog";
        this.nr = this.naesteUloeste(-1);

        this.bygPanel();
        this.bygTilbud();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.startOrdre();
    }

    var P = SimHotdog.prototype;

    /* ----- Ordren og opskriften ------------------------------------------------ */
    P.ordre = function () { return D.ORDRER[this.nr] || null; };
    P.ops = function () { var o = this.ordre(); return o ? o.ops : D.OPSKRIFTER[this.friOps]; };
    P.ids = function () { return this.ops().led.map(function (l) { return l[0]; }); };
    P.kOf = function (id) {
        var k = 1;
        this.ops().led.forEach(function (l) { if (l[0] === id) k = l[1]; });
        return k;
    };

    /* Den naeste uloeste ordre efter fra; alle loeste: frit valg */
    P.naesteUloeste = function (fra) {
        var n = D.ORDRER.length;
        for (var d = 1; d <= n; d++) {
            var i = (fra + d + n) % n;
            if (!this.loest[i]) return i;
        }
        return n;
    };

    /* ----- Layout ------------------------------------------------------------------ */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var kant = NK.klamp(W * 0.014, 8, 16);
        lay.kant = kant;
        lay.y0 = Math.round(H * 0.46);
        lay.y1 = Math.round(H * 0.9);
        /* Skiltene staar under tilbuddet om praesentationen, der er midt foroven */
        var luft = NK.klamp(H * 0.1, 10, 74);
        var bonB = NK.klamp(W * 0.19, 104, 180);
        lay.bon = { x: W - kant - bonB - 6, y: luft + 6, b: bonB, h: Math.round(bonB * 0.62) };
        var sb = Math.min(W * 0.62, lay.bon.x - kant - 24, 620);
        lay.skilt = { x: kant, y: luft, b: sb, h: 0 };
        lay.skilt.h = this.opskriftHoejde(sb);

        /* Beholderne staar bag paa disken */
        var dd = lay.y1 - lay.y0;
        lay.bagY = lay.y0 + Math.round(dd * 0.1);
        var hc = NK.klamp(Math.min(W * 0.11, lay.bagY - (lay.skilt.y + lay.skilt.h) - 12, H * 0.2), 44, 130);
        lay.hc = hc;
        var M = NK.Sprites.MAAL, mellem = hc * 0.14;
        lay.kop = { x: kant + 24, y: lay.bagY };
        var x = kant + 60;
        lay.beholdere = {};
        this.ids().forEach(function (id) {
            var navn = D.ingrediens(id).beholder, h = hc * HOEJDE[navn], b = M[navn].b * h / M[navn].h;
            lay.beholdere[id] = { navn: navn, x: x + b / 2, y: lay.bagY, h: h, b: b };
            x += b + mellem;
        });
        lay.beholdereX1 = x - mellem;
        var kb = NK.klamp(W * 0.065, 40, 64);
        lay.klokke = { x: W - kant - kb / 2 - 10, y: lay.bagY, b: kb };

        /* Skaerebraettet og bakken ligger foran */
        var bt = lay.bagY + 12, bh = lay.y1 - bt - 12;
        var bakkeB = NK.klamp(W * 0.28, 150, 330);
        lay.bakke = { x: W - kant - bakkeB - 4, y: bt, b: bakkeB, h: bh };
        lay.braet = { x: kant + 40, y: bt, b: lay.bakke.x - kant - 40 - 16, h: bh };
        lay.bane = bh / 3;
        lay.iw = NK.klamp(Math.min(lay.bane * 1.7, (lay.bakke.b - 30) / 2.3, lay.braet.b / 4.4), 34, 130);
        this.pakning(lay);
        this.lay = lay;
        this.maalTing(true);

        this.saetAnker("hotdog-anker-skilt", lay.skilt.x, lay.skilt.y, lay.skilt.b, lay.skilt.h);
        this.saetAnker("hotdog-anker-bon", lay.bon.x, lay.bon.y - 8, lay.bon.b, lay.bon.h + 8);
        var ids = this.ids(), b0 = lay.beholdere[ids[0]];
        this.saetAnker("hotdog-anker-beholdere", b0.x - b0.b / 2, lay.bagY - hc * 1.05, lay.beholdereX1 - (b0.x - b0.b / 2), hc * 1.05);
        this.saetAnker("hotdog-anker-braet", lay.braet.x, lay.braet.y, lay.braet.b, lay.braet.h);
        this.saetAnker("hotdog-anker-klokke", lay.klokke.x - kb * 0.7, lay.bagY - kb * 0.9, kb * 1.4, kb * 1.0);
        this.saetAnker("hotdog-anker-bakke", lay.bakke.x, lay.bakke.y, lay.bakke.b, lay.bakke.h);
    };

    /* Plads til 12 af hver ting uden at de roerer hinanden: hver raekke paa
       brættet faar 1-3 raekker af ting, og alle ting har samme stoerrelse
       (lay.sk ganget paa iw). */
    P.pakning = function (lay) {
        var KAP = D.DISK_MAKS, ids = this.ids();
        var lb = lay.braet.b - 28 - 38, lh = lay.bane - 10;
        var sk = 1, bedst = {};
        ids.forEach(function (id) {
            var d = Tg.TING[id], b = { s: 0 };
            for (var r = 1; r <= 3; r++) {
                var c = Math.ceil(KAP / r);
                var s = Math.min(1, lb / (c * d.b * lay.iw * 1.08), lh / (r * d.h * lay.iw * 1.15));
                if (s > b.s + 1e-9) b = { s: s, r: r, c: c };
            }
            bedst[id] = b;
            sk = Math.min(sk, b.s);
        });
        /* sk: retterne paa bakken. Hver raekke faar sin egen stoerrelse, saa
           smaa ting (agurkeskiverne) ikke bliver for smaa, men hoejst halvanden
           gang saa store som resten (men mindst 14 px), saa forholdene ser
           rigtige ud. */
        lay.sk = sk;
        lay.baner = {};
        ids.forEach(function (id, i) {
            var d0 = Tg.TING[id], s = Math.min(bedst[id].s, Math.max(sk * 1.5, 14 / (d0.b * lay.iw)));
            var d = Tg.TING[id], r = 1, c = KAP;
            while (r < 3 && c * d.b * lay.iw * s * 1.08 > lb + 0.5) { r++; c = Math.ceil(KAP / r); }
            lay.baner[id] = { r: r, c: c, s: s, y: lay.braet.y + (i + 0.5) * lay.bane, x0: lay.braet.x + 14 };
        });
    };

    /* Poelsens bredde, som tingene i raekken id tegnes med */
    P.baneIw = function (id) {
        var b = this.lay.baner[id];
        return this.lay.iw * (b ? b.s : this.lay.sk);
    };

    /* Opskriftens hoejde uden at tegne den */
    P.opskriftHoejde = function (b) {
        var ctx = this.L.ctx;
        ctx.save();
        ctx.globalAlpha = 0;
        var h = Tg.opskrift(ctx, -9999, -9999, b, this.ops(), {});
        ctx.restore();
        return h;
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

    /* ----- Tingene paa brættet ------------------------------------------------------
       En ting er { id, x, y, fra, t, maal, venter, hjem, produkt, plads, rest }.
       produkt: nummeret paa den ret, den er samlet i (-1: ligger i sin raekke). */
    P.iRaekke = function (id) {
        return this.ting.filter(function (t) { return t.id === id && !t.hjem && t.produkt < 0; });
    };

    P.antal = function (id) { return this.iRaekke(id).length; };

    P.iLuften = function () {
        return this.ting.some(function (t) { return t.fra || t.venter > 0; });
    };

    P.baneY = function (id) { return this.lay.baner[id] ? this.lay.baner[id].y : this.lay.braet.y; };

    /* Tingenes pladser: raekke for raekke fra venstre, midt i banen */
    P.maalTing = function (straks) {
        var lay = this.lay;
        if (!lay) return;
        var mig = this, iw = lay.iw * lay.sk;
        this.ids().forEach(function (id) {
            var liste = mig.iRaekke(id), b = lay.baner[id], biw = mig.baneIw(id);
            var w = Tg.tingBredde(id, biw), h = Tg.tingHoejde(id, biw);
            var brugt = Math.max(1, Math.ceil(liste.length / b.c));
            liste.forEach(function (t, j) {
                var rk = Math.floor(j / b.c), kol = j % b.c;
                t.maal = { x: b.x0 + w / 2 + kol * w * 1.08, y: b.y + (rk - (brugt - 1) / 2) * h * 1.15 };
                if (straks && !t.fra) { t.x = t.maal.x; t.y = t.maal.y; }
            });
        });
        this.ting.forEach(function (t) {
            if (t.produkt >= 0 && !t.hjem) {
                var p = mig.produktPlads(t.produkt, mig.serv ? mig.serv.h : 1);
                var s = Tg.SAML[mig.ops().id].plads[t.id][t.plads];
                t.maal = { x: p.x + s[0] * iw, y: p.y + s[1] * iw };
                if (straks && !t.fra) { t.x = t.maal.x; t.y = t.maal.y; }
            }
        });
    };

    /* Pladsen til ret nr. i af n paa bakken */
    P.produktPlads = function (i, n) {
        var lay = this.lay, bk = lay.bakke, id = this.ops().id;
        var iw = lay.iw * lay.sk, pw = Tg.tingBredde(id, iw), ph = Tg.tingHoejde(id, iw);
        var kol = Math.max(1, Math.min(3, Math.floor((bk.b - 16) / (pw * 1.08)), Math.ceil(Math.sqrt(n))));
        var rk = Math.max(1, Math.ceil(n / kol));
        var rh = Math.min(ph * 1.3, (bk.h - 16) / rk);
        var k = i % kol, r = Math.floor(i / kol);
        var kb = (bk.b - 16) / kol;
        return { x: bk.x + 8 + (k + 0.5) * kb, y: bk.y + 8 + (r + 0.5) * rh + Math.max(0, (bk.h - 16 - rk * rh) / 2) };
    };

    /* Beholderens aabning, hvor tingene kommer fra og flyver hjem til */
    P.mund = function (id) {
        var b = this.lay.beholdere[id];
        return b ? { x: b.x, y: b.y - b.h * 0.8 } : { x: this.lay.braet.x, y: this.lay.braet.y };
    };

    /* Laeg én ting paa brættet. fra: hvor den kommer fra (musen).
       tving: ordren fylder selv op. venter: forskydning i sekunder */
    P.laegPaa = function (id, fra, tving, venter) {
        if (this.serv) { this.besked("Vent, til kunden har fået sin bestilling.", "gul"); return false; }
        var o = this.ordre();
        if (!tving && o && o.slags !== "disk" && !this.naaet) {
            this.besked("Brættet viser opgaven. Skriv svaret til højre.", "gul");
            return false;
        }
        this.ryddRester();
        if (!tving) {
            if (this.beholdning[id] <= 0) {
                this.besked(id === "agurk" ? "Glasset er tomt. Brug de skiver, der ligger på brættet." : "Den er tom.", "gul");
                return false;
            }
            if (this.iRaekke(id).length >= D.DISK_MAKS) {
                this.besked("Der er ikke plads til flere " + D.ingrediens(id).flertal + ". " + D.DISK_MAKS + " er nok.", "gul");
                return false;
            }
        }
        if (this.beholdning[id] !== Infinity && !tving) this.beholdning[id]--;
        var start = fra || this.mund(id);
        this.ting.push({ id: id, x: start.x, y: start.y, fra: { x: start.x, y: start.y }, t: 0, maal: null,
            venter: venter || 0, hjem: false, produkt: -1, plads: 0, rest: false,
            v0: id === "ost" ? NK.r(-0.25, 0.25) : 0 });
        this.maalTing(false);
        this.efterHandling();
        return true;
    };

    /* Tag en ting af: den flyver hjem, og de andre rykker sammen */
    P.tagAf = function (t) {
        if (!t || t.hjem || this.serv) return;
        var o = this.ordre();
        if (o && o.slags !== "disk" && !this.naaet) {
            this.besked("Brættet viser opgaven. Skriv svaret til højre.", "gul");
            return;
        }
        this.ryddRester();
        t.hjem = true;
        t.fra = { x: t.x, y: t.y };
        t.t = 0;
        t.venter = 0;
        t.maal = this.mund(t.id);
        if (this.beholdning[t.id] !== Infinity) this.beholdning[t.id]++;
        this.maalTing(false);
        this.efterHandling();
    };

    P.tomDisken = function () {
        var mig = this;
        this.serv = null;
        this.ting.forEach(function (t) {
            if (t.hjem) return;
            t.hjem = true;
            t.produkt = -1;
            t.fra = { x: t.x, y: t.y };
            t.t = 0;
            t.venter = 0;
            t.maal = mig.mund(t.id);
        });
    };

    /* De orange rammer forsvinder, saa snart eleven goer noget nyt */
    P.ryddRester = function () {
        if (!this.ting.some(function (t) { return t.rest; })) return;
        this.ting.forEach(function (t) { t.rest = false; });
        this.serveret = null;
        this.visDisken();
        var o = this.ordre();
        if (o && o.slags === "disk" && !this.naaet) this.besked("", "");
    };

    P.efterHandling = function () {
        this.visStatus();
        this.visDisken();
    };

    /* ----- Klokken: retterne samles ------------------------------------------------ */
    P.server = function (auto) {
        if (this.serv) return;
        if (this.iLuften()) { this.besked("Vent, til tingene er landet.", "gul"); return; }
        var mig = this, ids = this.ids(), ops = this.ops();
        if (!ids.some(function (id) { return mig.antal(id); })) {
            this.besked("Brættet er tomt. Træk først noget hen på det.", "gul");
            return;
        }
        this.ding = 0.001;
        var h = Infinity;
        ops.led.forEach(function (l) { h = Math.min(h, Math.floor(mig.antal(l[0]) / l[1])); });
        this.serv = { t: 0, h: h, auto: !!auto, faerdig: false, ud: -1, retur: -1 };
        var lister = {};
        ids.forEach(function (id) { lister[id] = mig.iRaekke(id); });
        for (var i = 0; i < h; i++) {
            ops.led.forEach(function (l) {
                for (var j = 0; j < l[1]; j++) {
                    var t = lister[l[0]][i * l[1] + j];
                    t.produkt = i;
                    t.plads = j;
                    t.fra = { x: t.x, y: t.y };
                    t.t = 0;
                    t.venter = i * FORSKYD;
                }
            });
        }
        this.maalTing(false);
        this.serv.slut = Math.max(0, h - 1) * FORSKYD + SAML + 0.35;
        this.visStatus();
        this.visDisken();
    };

    /* Kaldes, naar tingene er landet paa bakken */
    P.efterServering = function () {
        var s = this.serv, o = this.ordre(), mig = this, ops = this.ops();
        var rest = {}, restTekst = [];
        this.ids().forEach(function (id) {
            rest[id] = mig.antal(id);
            if (rest[id]) restTekst.push(D.stk(id, rest[id]));
        });
        this.ting.forEach(function (t) { if (t.produkt < 0 && !t.hjem) t.rest = true; });
        this.serveret = { h: s.h, rest: restTekst };
        /* Paaskeaegget: kun agurker paa brættet */
        if (s.h === 0 && rest.agurk >= 4 && !rest.poelse && !rest.broed && this.laererAeg) this.laererAeg();
        this.visDisken();
        s.faerdig = true;
        var ok = true, besked = "";
        var restTal = restTekst.length;
        if (o && o.slags === "disk" && !this.naaet) {
            if (s.h === o.P && !restTal) {
                ok = true;
            } else {
                ok = false;
                var hvad = "Hver " + ops.navn + " skal have " + D.liste(ops.led.map(function (l) { return D.stk(l[0], l[1]); })) + ".";
                if (s.h === 0) besked = "Ingen hele " + ops.flertal + ". " + hvad;
                else if (s.h === o.P) besked = D.produkt(ops, s.h) + ", men " + D.liste(restTekst) + " er i overskud. Læg kun det på, der skal bruges.";
                else if (s.h < o.P) {
                    besked = "Kun " + D.produkt(ops, s.h) + ". " + (o.fyld ? "Agurkeskiverne rækker til flere." : "Der blev bestilt " + o.P + ".");
                    if (restTal) besked += " " + D.stort(D.liste(restTekst)) + " er i overskud.";
                } else besked = D.produkt(ops, s.h) + ", men der blev bestilt " + o.P + ".";
            }
        } else if (!o || this.naaet) {
            besked = s.h ? "Du lavede " + D.produkt(ops, s.h) + "." : "Ingen hele " + ops.flertal + ".";
            if (restTal) besked += " " + D.stort(D.liste(restTekst)) + " er i overskud.";
        }
        if (ok) {
            s.ud = s.h ? 0.6 : -1;
            if (!s.h) this.serv = null;
            if (o && !this.naaet && (o.slags === "disk" || s.auto)) this.ordreLoest();
            else if (besked) this.besked(NK.html(besked), "");
        } else {
            this.besked(NK.html(besked), "skidt");
            s.retur = 2.4;
        }
        this.visStatus();
    };

    /* Kunden sender dem retur: retterne skilles, og tingene ligger igen i raekkerne */
    P.retur = function () {
        this.ting.forEach(function (t) {
            if (t.produkt >= 0) {
                t.produkt = -1;
                t.fra = { x: t.x, y: t.y };
                t.t = 0;
                t.venter = 0;
            }
            t.rest = false;
        });
        this.serv = null;
        this.serveret = null;
        this.maalTing(false);
        this.visDisken();
        this.visStatus();
    };

    /* Fyld brættet op paa én gang. spred: tingene kommer én ad gangen */
    P.fyld = function (antal, spred) {
        var mig = this, n = 0;
        this.ids().forEach(function (id) {
            for (var i = 0; i < (antal[id] || 0); i++) mig.laegPaa(id, null, true, spred ? n++ * 0.05 : 0);
        });
        if (!spred) {
            this.ting.forEach(function (t) { if (t.fra && !t.hjem) { t.fra = null; t.venter = 0; } });
            this.maalTing(true);
        }
        this.visDisken();
    };

    /* ----- Ordrerne -------------------------------------------------------------------- */
    P.startOrdre = function () {
        var o = this.ordre();
        this.naaet = false;
        this.hjaelp = 0;
        this.brugtSvar = false;
        this.ting = [];
        this.serv = null;
        this.serveret = null;
        this.bonOk = 0;
        this.fremhaev = null;
        this.ventServer = 0;
        this.svarRing = 0;
        this.beholdning = {};
        var mig = this;
        this.ids().forEach(function (id) { mig.beholdning[id] = Infinity; });
        this.trin = [];
        this.k = 0;
        this.besked("", "");
        if (o) {
            (o.tomt || []).forEach(function (id) { mig.beholdning[id] = 0; });
            this.trin = (o.trin || []).map(function (t) {
                return { art: t.art, id: t.id, svar: t.svar, status: "laast", forsoeg: 0 };
            });
            if (this.trin.length) this.trin[0].status = "aktiv";
        }
        /* Opskriften kan vaere skiftet: nyt layout, og saa fyldes brættet */
        this.lay = null;
        if (this.L.b > 1) this.layout();
        if (o && o.fyld) {
            if (this.lay) this.fyld(o.fyld, false);
            else this.ventFyld = o.fyld;
        }
        this.bygTrin();
        this.visOrdre();
        this.visDisken();
        this.visGrupper();
        this.visStatus();
    };

    P.vaelgOrdre = function (i) {
        this.nr = i;
        this.startOrdre();
        this.fokus();
    };

    P.aktivtTrin = function () {
        return this.trin && this.k < this.trin.length ? this.trin[this.k] : null;
    };

    P.ordreLoest = function () {
        if (this.naaet) return;
        this.naaet = true;
        this.hjaelp = 0;
        this.fremhaev = null;
        this.bonOk = 0.001;
        var o = this.ordre();
        this.besked(NK.html(o.efter), "god");
        if (this.afvisTilbud) this.afvisTilbud();
        this.loest[this.nr] = true;
        NK.gem(NOEGLE, { l: this.loest.map(function (x) { return x ? 1 : 0; }) });
        /* Alle ordrer: Kemichael roser, mens eleven stadig er her */
        if (!this.rost && this.loest.every(Boolean)) {
            this.rost = true;
            this.ventRos = 1.6;
        }
        this.visOrdre();
        this.visGrupper();
        this.visStatus();
    };

    P.knap = function () {
        var o = this.ordre();
        if (!o) { if (NK.visFane) NK.visFane("fane-molekyler"); return; }
        if (this.naaet) {
            var naeste = this.naesteUloeste(this.nr);
            this.vaelgOrdre(naeste);
            if (naeste >= D.ORDRER.length && NK.visFane) NK.visFane("fane-molekyler");
            return;
        }
        var t = this.aktivtTrin();
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.fremhaev = "skilt";
            this.besked("<b>Hint:</b> " + NK.html(this.hint(o, t)), "gul");
            this.visOrdre();
            this.fokus();
            return;
        }
        /* Vis svaret */
        this.brugtSvar = true;
        if (o.slags === "disk") this.saetSvar(o);
        else if (t) this.trinRigtigt(t, "svar");
        this.visOrdre();
    };

    /* Hintet til ordren eller til det trin, eleven er ved */
    P.hint = function (o, t) {
        var ops = o.ops;
        if (!t) return o.hint;
        var ing = t.id ? D.ingrediens(t.id) : null, k = t.id ? o.k[t.id] : 0;
        if (t.art === "antal") {
            return "Opskriften: " + k + " " + (k === 1 ? ing.navn : ing.flertal) + " pr. " + ops.navn + ". Til " +
                D.produkt(ops, o.P) + " skal der " + o.P + " · " + k + ".";
        }
        if (t.art === "begr") {
            return "Hvor mange " + ops.flertal + " rækker hver ingrediens til? " + D.liste(ops.led.map(function (l) {
                return D.ingrediens(l[0]).flertal + " " + o.fyld[l[0]] + " / " + l[1];
            })) + ".";
        }
        if (t.art === "produkter") {
            var B = D.ingrediens(o.begr);
            return D.stort(B.bestemt) + " bestemmer det: " + o.fyld[o.begr] + " " + B.flertal + " / " + o.k[o.begr] +
                " pr. " + ops.navn + ".";
        }
        return D.produkt(ops, o.P) + " bruger " + o.P + " · " + k + " " + ing.flertal + ". Der lå " + o.fyld[t.id] + ".";
    };

    /* Svaret paa et trin, skrevet som en udregning */
    P.svarTekst = function (o, t) {
        var ops = o.ops;
        if (t.art === "begr") return D.stort(D.ingrediens(o.begr).bestemt) + " er den begrænsende ingrediens.";
        if (t.art === "antal") {
            var k = o.k[t.id];
            return "Til " + D.produkt(ops, o.P) + ": " + o.P + " · " + k + " = " + D.stk(t.id, t.svar) + ".";
        }
        if (t.art === "produkter") {
            var nB = o.fyld[o.begr], kB = o.k[o.begr], rest = nB % kB;
            return D.stk(o.begr, nB) + " / " + kB + " = " + (rest ? String(nB / kB).replace(".", ",") + ". Der kan kun laves hele, altså " +
                D.produkt(ops, o.P) : D.produkt(ops, o.P)) + ".";
        }
        return o.fyld[t.id] + " − " + o.P + " · " + o.k[t.id] + " = " + D.stk(t.id, t.svar) + " i overskud.";
    };

    /* Vis svaret paa en ordre paa brættet: laeg det rigtige paa og ring */
    P.saetSvar = function (o) {
        if (this.serv) this.retur();
        var mig = this, n = 0;
        o.ops.led.forEach(function (l) {
            var maal = o.P * l[1], liste = mig.iRaekke(l[0]);
            while (liste.length > maal) { mig.tagAf(liste[liste.length - 1]); liste = mig.iRaekke(l[0]); }
            while (mig.iRaekke(l[0]).length < maal) mig.laegPaa(l[0], null, true, n++ * 0.04);
        });
        this.svarRing = 1.0;
    };

    /* Et trin er klaret (ok eller svar) */
    P.trinRigtigt = function (t, maade) {
        var o = this.ordre();
        t.status = maade;
        this.hjaelp = 0;
        this.fremhaev = null;
        if (maade === "svar") this.brugtSvar = true;
        if (this.afvisTilbud) this.afvisTilbud();
        if (t.art === "begr") {
            var B = D.ingrediens(o.begr);
            this.besked(NK.html((maade === "ok" ? "Rigtigt. " : "") + D.stort(B.bestemt) + " er den begrænsende ingrediens."), maade === "ok" ? "god" : "gul");
        } else if (maade === "svar") {
            this.besked(NK.html(this.svarTekst(o, t)), "gul");
        } else {
            this.besked("", "");
        }
        this.k++;
        if (this.k < this.trin.length) {
            this.trin[this.k].status = "aktiv";
        } else if (o.slags === "tal") {
            /* Brættet fyldes med det, der skal bruges, og klokken ringer */
            var antal = {};
            o.ops.led.forEach(function (l) { antal[l[0]] = o.P * l[1]; });
            this.fyld(antal, true);
            var n = 0;
            Object.keys(antal).forEach(function (id) { n += antal[id]; });
            this.ventServer = 0.3 + n * 0.05 + FLYV;
        } else {
            this.server(true);
        }
        this.bygTrin();
        this.visOrdre();
        this.visStatus();
        this.fokus();
    };

    P.tjek = function () {
        var t = this.aktivtTrin(), o = this.ordre();
        if (!t || !o || t.art === "begr") return;
        var raa = t.input ? t.input.value : "";
        var res = t.art === "antal" ? Tj.antal(raa, t.id, o) : (t.art === "produkter" ? Tj.produkter(raa, o) : Tj.overskud(raa, t.id, o));
        if (res.tom) { this.besked(res.besked, ""); this.fokus(); return; }
        if (res.ok) { this.trinRigtigt(t, "ok"); return; }
        t.forsoeg++;
        this.besked(NK.html(res.besked), "skidt");
        this.ryst(t.el);
        this.fokus();
    };

    /* Eleven vaelger den begraensende ingrediens (knap i panelet eller brættet) */
    P.vaelg = function (id) {
        var t = this.aktivtTrin(), o = this.ordre();
        if (!t || t.art !== "begr") return false;
        var res = Tj.begr(id, o);
        if (res.ok) { this.trinRigtigt(t, "ok"); return true; }
        t.forsoeg++;
        t.forkert = id;
        this.besked(NK.html(res.besked), "skidt");
        this.bygTrin();
        this.ryst(t.el);
        return true;
    };

    P.ryst = function (e) {
        if (!e) return;
        e.classList.remove("ryst");
        void e.offsetWidth;
        e.classList.add("ryst");
    };

    /* ----- Panelet ---------------------------------------------------------------------- */
    P.bygPanel = function () {
        var mig = this;
        this.el = {
            knap: NK.el("hotdog-knap"),
            besked: NK.el("hotdog-besked"),
            kort: NK.el("hotdog-kort"),
            raekker: NK.el("hotdog-raekker"),
            grupper: NK.el("hotdog-grupper"),
            nulstil: NK.el("hotdog-nulstil"),
            opskrifter: NK.el("hotdog-opskrifter")
        };
        this.el.knap.addEventListener("click", function () { mig.knap(); });
        NK.el("hotdog-spring").addEventListener("click", function () { mig.springIntro(); mig.fokus(); });

        D.GRUPPER.forEach(function (g, nr) {
            var knap = document.createElement("button");
            knap.type = "button";
            knap.className = "hyldelinje";
            knap.innerHTML = '<span class="hl-farve" style="background:' + g.farve + '"></span>' +
                '<span class="hl-navn">' + g.navn + '<em>' + g.kort + '</em></span>' +
                '<span class="hl-tal" id="hotdog-g-' + nr + '"></span>';
            knap.addEventListener("click", function () { mig.vaelgGruppe(g.o); });
            mig.el.grupper.appendChild(knap);
        });
        var fri = document.createElement("button");
        fri.type = "button";
        fri.className = "hyldelinje";
        fri.innerHTML = '<span class="hl-farve" style="background:#7e8590"></span><span class="hl-navn">Frit valg<em>læg på, og ring med klokken</em></span>';
        fri.addEventListener("click", function () { mig.vaelgOrdre(D.ORDRER.length); });
        this.el.grupper.appendChild(fri);

        Object.keys(D.OPSKRIFTER).forEach(function (id) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "vaelger";
            b.setAttribute("data-ops", id);
            b.textContent = D.stort(D.OPSKRIFTER[id].flertal);
            b.addEventListener("click", function () {
                mig.friOps = id;
                if (!mig.ordre()) mig.startOrdre();
            });
            mig.el.opskrifter.appendChild(b);
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
        NK.saetHTML("hotdog-nulstil", this.nulstilSikker > 0
            ? "<span>Sikker? Klik igen</span><span class=\"tegn\">↺</span>"
            : "<span>Start forfra</span><span class=\"tegn\">↺</span>");
    };

    P.nulstilAlt = function () {
        this.loest = D.ORDRER.map(function () { return false; });
        NK.gem(NOEGLE, { l: [] });
        this.vaelgOrdre(0);
    };

    /* Den foerste uloeste ordre med opskriften, ellers den foerste */
    P.vaelgGruppe = function (opsId) {
        var foerste = -1;
        for (var i = 0; i < D.ORDRER.length; i++) {
            if (D.ORDRER[i].o !== opsId) continue;
            if (foerste < 0) foerste = i;
            if (!this.loest[i]) { this.vaelgOrdre(i); return; }
        }
        this.vaelgOrdre(foerste);
    };

    P.visGrupper = function () {
        var mig = this;
        D.GRUPPER.forEach(function (g, nr) {
            var alle = 0, loest = 0;
            D.ORDRER.forEach(function (o, i) { if (o.o === g.o) { alle++; if (mig.loest[i]) loest++; } });
            NK.saetTekst("hotdog-g-" + nr, loest + "/" + alle);
        });
    };

    P.besked = function (html, klasse) {
        this.el.besked.innerHTML = html;
        this.el.besked.className = "besked" + (klasse ? " " + klasse : "");
    };

    var ETIKET = { antal: "Det skal du bruge", begr: "Hvad slipper op først?", produkter: "Så mange kan du lave", overskud: "Overskud" };

    /* Trinnene i panelet: valget af den begraensende og felterne */
    P.bygTrin = function () {
        var mig = this, vaert = this.el.raekker, o = this.ordre();
        vaert.innerHTML = "";
        var sidsteArt = null;
        (this.trin || []).forEach(function (t) {
            var rk = document.createElement("div");
            rk.className = "raekke";
            if (t.art !== sidsteArt) {
                var hv = document.createElement("div");
                hv.className = "raekke-hoved";
                hv.innerHTML = '<span class="raekke-etiket">' + ETIKET[t.art] + "</span>";
                rk.appendChild(hv);
            }
            sidsteArt = t.art;
            t.input = null;
            if (t.art === "begr") {
                var rad = document.createElement("div");
                rad.className = "valgrad";
                o.ops.led.forEach(function (l) {
                    var b = document.createElement("button");
                    b.type = "button";
                    b.className = "valgknap";
                    b.setAttribute("data-id", l[0]);
                    b.textContent = D.stort(D.ingrediens(l[0]).flertal);
                    var klaret = t.status === "ok" || t.status === "svar";
                    if (klaret && l[0] === t.svar) b.classList.add("rigtig");
                    else if (!klaret && t.forkert === l[0]) b.classList.add("forkert");
                    b.disabled = t.status !== "aktiv";
                    b.addEventListener("click", function () { mig.vaelg(l[0]); });
                    rad.appendChild(b);
                });
                t.el = rad;
                rk.appendChild(rad);
                vaert.appendChild(rk);
                return;
            }
            var navn = t.art === "produkter" ? D.stort(o.ops.flertal) : D.stort(D.ingrediens(t.id).flertal);
            var fe = document.createElement("div");
            t.el = fe;
            if (t.status === "ok" || t.status === "svar") {
                fe.className = "felt " + t.status;
                fe.innerHTML = '<span class="felt-pre">' + navn + '</span><span class="felt-svar"><b>' + t.svar +
                    '</b></span><span class="felt-maerke">' + (t.status === "ok" ? "✓" : "↩") + "</span>";
            } else {
                var fra = t.status === "aktiv" ? "" : " disabled";
                fe.className = "felt " + t.status;
                fe.innerHTML = '<span class="felt-pre">' + navn + '</span>' +
                    '<input type="text" inputmode="numeric" autocomplete="off" spellcheck="false" aria-label="' + navn + '"' + fra + '>' +
                    '<span class="felt-efter">stk.</span>' +
                    '<button type="button" class="felt-ok" aria-label="Tjek svaret" tabindex="-1"' + fra + '>↵</button>';
                var inp = fe.querySelector("input");
                inp.addEventListener("keydown", function (e) {
                    if (e.key === "Enter") { e.preventDefault(); mig.tjek(); }
                });
                fe.querySelector(".felt-ok").addEventListener("click", function () { mig.tjek(); });
                t.input = inp;
            }
            var fs = document.createElement("div");
            fs.className = "felter";
            fs.appendChild(fe);
            rk.appendChild(fs);
            vaert.appendChild(rk);
        });
    };

    P.fokus = function () {
        var t = this.aktivtTrin();
        if (t && t.input && NK.el("fane-hotdog").classList.contains("aktiv") &&
            !document.querySelector(".overlay.vis") && !(NK.Rundvisning && NK.Rundvisning.aktiv())) {
            try { t.input.focus({ preventScroll: true }); } catch (e) { t.input.focus(); }
        }
    };

    P.visOrdre = function () {
        var o = this.ordre();
        NK.saetTekst("hotdog-nr", String(Math.min(this.nr + 1, D.ORDRER.length)));
        NK.saetTekst("hotdog-antal", String(D.ORDRER.length));
        NK.el("hotdog-taeller").hidden = !o;
        this.el.opskrifter.hidden = !!o;
        var mig = this;
        Array.prototype.forEach.call(this.el.opskrifter.querySelectorAll(".vaelger"), function (b) {
            b.classList.toggle("valgt", b.getAttribute("data-ops") === mig.ops().id);
        });
        var tekst, klasse = "knap";
        if (!o) {
            NK.saetTekst("hotdog-titel", "Frit valg");
            NK.saetTekst("hotdog-prompt", "Læg på brættet, og ring med klokken.");
            tekst = "Videre til molekylerne →";
        } else {
            NK.saetTekst("hotdog-titel", "Ordre");
            NK.saetTekst("hotdog-prompt", o.tekst);
            if (this.naaet) {
                tekst = this.naesteUloeste(this.nr) >= D.ORDRER.length ? "Videre til molekylerne →" : "Næste ordre →";
                klasse = "knap blaa banker";
            } else {
                tekst = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
            }
        }
        this.el.knap.textContent = tekst;
        this.el.knap.className = klasse;
        this.el.kort.classList.toggle("sejr", this.naaet);
    };

    P.visDisken = function () {
        var ids = this.ids();
        for (var i = 0; i < 3; i++) {
            NK.saetTekst("hotdog-l-" + i, D.stort(D.ingrediens(ids[i]).flertal));
            NK.saetTekst("hotdog-n-" + i, String(this.antal(ids[i])));
        }
        var s = this.serveret;
        NK.saetTekst("hotdog-l-produkt", D.stort(this.ops().flertal) + " sidst");
        NK.saetTekst("hotdog-n-produkt", s ? String(s.h) : "");
        NK.saetTekst("hotdog-n-rest", s ? (s.rest.length ? D.liste(s.rest) : "intet") : "");
        NK.el("hotdog-serveret").hidden = !s;
    };

    P.visStatus = function () {
        var o = this.ordre(), t, mig = this;
        var tom = !this.ids().some(function (id) { return mig.antal(id); });
        var trin = this.aktivtTrin();
        if (this.traek && this.traek.flyttet) t = "Slip over skærebrættet.";
        else if (this.serv && !this.serv.faerdig) t = "Retterne samles efter opskriften.";
        else if (this.serv && this.serv.retur > 0) t = "Kunden tæller efter og sender dem tilbage.";
        else if (o && trin && trin.art === "begr") t = "Klik på den ingrediens, der slipper op først: på brættet eller til højre.";
        else if (o && o.slags !== "disk" && !this.naaet) t = "Skriv svaret til højre. Opskriften hænger på væggen.";
        else if (tom && !this.serv) t = "Træk en ting fra en beholder hen på skærebrættet. Klik på en ting for at tage den af igen.";
        else if (this.naaet && o) t = "Ordren er klar. Tryk på knappen til højre for at gå videre.";
        else t = "Ring med klokken, når brættet er klar. Klik på en ting for at tage den af.";
        NK.saetHTML("hotdog-status", t);
    };

    /* ----- Tegneloekken ------------------------------------------------------------------- */
    P.opdater = function (dt) {
        this.tid += dt;
        var mig = this;
        if (this.ventFyld && this.lay) {
            var f = this.ventFyld;
            this.ventFyld = null;
            this.fyld(f, false);
        }
        if (this.nulstilSikker > 0) {
            this.nulstilSikker -= dt;
            if (this.nulstilSikker <= 0) { this.nulstilSikker = 0; this.visNulstil(); }
        }
        this.ting.forEach(function (t) {
            if (t.venter > 0) { t.venter -= dt; return; }
            t.venter = 0;
            if (t.fra) {
                if (!t.maal) return;
                t.t = Math.min(1, t.t + dt / (t.produkt >= 0 ? SAML : FLYV));
                if (t.t >= 1) {
                    t.fra = null;
                    t.x = t.maal.x;
                    t.y = t.maal.y;
                }
            } else if (t.maal && !t.hjem) {
                t.x = NK.mod(t.x, t.maal.x, 12, dt);
                t.y = NK.mod(t.y, t.maal.y, 12, dt);
            }
        });
        var foer = this.ting.length;
        this.ting = this.ting.filter(function (t) { return !(t.hjem && !t.fra && !(t.venter > 0)); });
        if (foer !== this.ting.length) this.efterHandling();

        if (this.ding > 0) { this.ding += dt / 0.6; if (this.ding >= 1) this.ding = 0; }
        if (this.bonOk > 0 && this.bonOk < 1) this.bonOk = Math.min(1, this.bonOk + dt / 0.4);

        if (this.svarRing > 0) {
            this.svarRing -= dt;
            if (this.svarRing <= 0) {
                if (this.iLuften()) this.svarRing = 0.1;
                else { this.svarRing = 0; this.server(); }
            }
        }
        if (this.ventServer > 0) {
            this.ventServer -= dt;
            if (this.ventServer <= 0) {
                if (this.iLuften()) this.ventServer = 0.1;
                else { this.ventServer = 0; this.server(true); }
            }
        }

        var s = this.serv;
        if (s) {
            s.t += dt;
            if (!s.faerdig && s.t >= s.slut) this.efterServering();
            if (s.ud >= 0) {
                s.ud += dt;
                if (s.ud > 0.6 + SLIDE) {
                    this.ting = this.ting.filter(function (t) { return t.produkt < 0; });
                    this.serv = null;
                    this.visStatus();
                }
            }
            if (s.retur > 0) {
                s.retur -= dt;
                if (s.retur <= 0) this.retur();
            }
        }
        if (this.ventRos > 0) {
            this.ventRos -= dt;
            if (this.ventRos <= 0 && this.laererFaerdig) this.laererFaerdig();
        }
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
    };

    /* Tingens plads lige nu (ogsaa i luften) */
    P.tingPos = function (t) {
        if (!t.fra || !t.maal || t.venter > 0) return { x: t.fra ? t.fra.x : t.x, y: t.fra ? t.fra.y : t.y };
        var u = NK.blod(t.t);
        var bue = t.produkt >= 0 ? 30 : 50;
        return { x: NK.lerp(t.fra.x, t.maal.x, u), y: NK.lerp(t.fra.y, t.maal.y, u) - Math.sin(u * Math.PI) * bue };
    };

    /* Tingens stoerrelse (ganget paa iw for retterne) og drejning: i en ret
       som i opskriften, paa brættet som i sin raekke. Paa vej fra raekken
       til retten skifter stoerrelsen gradvist. */
    P.tingForm = function (t) {
        var baneSkala = this.baneIw(t.id) / (this.lay.iw * this.lay.sk);
        if (t.produkt >= 0) {
            var s = Tg.SAML[this.ops().id].plads[t.id][t.plads];
            if (t.fra && !(t.venter > 0)) {
                var u = NK.blod(t.t);
                return { skala: NK.lerp(baneSkala, s[3], u), v: NK.lerp(t.v0 || 0, s[2], u) };
            }
            if (t.fra) return { skala: baneSkala, v: t.v0 || 0 };
            return { skala: s[3], v: s[2] };
        }
        return { skala: baneSkala, v: t.v0 || 0 };
    };

    /* Bakken koeres ud til kunden: hvor langt (px) */
    P.udSkub = function () {
        var s = this.serv;
        if (!s || s.ud < 0.6) return 0;
        return NK.blod((s.ud - 0.6) / SLIDE) * (this.lay.W - this.lay.bakke.x + 20);
    };

    /* Den begraensende ingrediens, naar eleven har fundet den */
    P.begrFundet = function () {
        var o = this.ordre();
        if (!o || o.slags !== "begr") return null;
        var t = this.trin[0];
        return t && (t.status === "ok" || t.status === "svar") ? o.begr : null;
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var mig = this, ops = this.ops(), iw = lay.iw * lay.sk;
        var puls = 0.55 + 0.45 * Math.sin(this.tid * 7);
        var o = this.ordre();
        Tg.rum(ctx, lay.W, lay.H, lay.y0);

        /* Opskriften og bonen paa vaeggen */
        Tg.opskrift(ctx, lay.skilt.x, lay.skilt.y, lay.skilt.b, ops, { lys: this.fremhaev === "skilt" ? puls : 0 });
        var bonLinjer;
        if (o) {
            bonLinjer = [{ t: "ORDRE " + (this.nr + 1), px: NK.klamp(lay.bon.b * 0.1, 11, 15), vaegt: "700", farve: "#8a7f66" },
                { t: o.bon, px: NK.klamp(lay.bon.b * 0.16, 13, 24), vaegt: "800" }];
        } else {
            bonLinjer = [{ t: "FRIT VALG", px: NK.klamp(lay.bon.b * 0.1, 11, 15), vaegt: "700", farve: "#8a7f66" },
                { t: "Lav, hvad du vil", px: NK.klamp(lay.bon.b * 0.14, 12, 20), vaegt: "700" }];
        }
        var sving = Math.sin(this.tid * 1.3) * 0.015;
        Tg.bon(ctx, lay.bon.x, lay.bon.y, lay.bon.b, lay.bon.h, bonLinjer, { ok: this.bonOk, sving: sving,
            lys: this.over && this.over.slags === "bon" ? 0.6 : 0 });

        /* Disken */
        Tg.disk(ctx, lay.W, lay.H, lay.y0, lay.y1);

        /* Koppen */
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand) {
            var kk = NK.klamp(lay.H / 600, 0.8, 1.3);
            NK.Sprites.tegn(ctx, "kaffekop", lay.kop.x - 18 * kk, lay.kop.y - 40 * kk, 42 * kk, 40 * kk);
        }

        /* Beholderne */
        this.ids().forEach(function (id) {
            var b = lay.beholdere[id];
            var over = mig.over && mig.over.slags === "beholder" && mig.over.id === id;
            var lys = over ? 0.7 : (mig.pegBeholdere ? puls : 0);
            if (b.navn === "agurkglas") {
                var n = mig.beholdning.agurk === Infinity ? 12 : mig.beholdning.agurk;
                if (lys) {
                    ctx.save();
                    ctx.strokeStyle = "rgba(242, 197, 61, " + (0.45 + 0.5 * lys) + ")";
                    ctx.lineWidth = 3;
                    NK.rundtRekt(ctx, b.x - b.b / 2 - 4, b.y - b.h - 4, b.b + 8, b.h + 8, 12);
                    ctx.stroke();
                    ctx.restore();
                }
                Tg.agurkglas(ctx, b.x, b.y, b.h, n);
            } else {
                Tg.beholder(ctx, b.navn, b.x, b.y, b.h, { lys: lys });
                if (b.navn === "gryde") Tg.damp(ctx, b.x, b.y - b.h * 0.95, b.b, mig.tid);
                if (b.navn === "stegeplade") Tg.damp(ctx, b.x, b.y - b.h * 0.55, b.b * 0.8, mig.tid * 1.3);
            }
        });
        Tg.klokke(ctx, lay.klokke.x, lay.klokke.y, lay.klokke.b, {
            ding: this.ding,
            lys: (this.over && this.over.slags === "klokke") ? 0.8 :
                (o && o.slags === "disk" && !this.naaet && !this.serv && this.klarTilKlokke() ? puls : 0)
        });

        /* Brættet og bakken */
        Tg.braet(ctx, lay.braet, { lys: this.traek && this.traek.flyttet && !this.traek.t && this.overBraet(this.traek) ? puls : 0 });
        var begr = this.begrFundet();
        var trin = this.aktivtTrin();
        this.ids().forEach(function (id) {
            var b = lay.baner[id], over = mig.over && mig.over.slags === "bane" && mig.over.id === id;
            var vaelges = trin && trin.art === "begr";
            if (id === begr || (vaelges && over)) {
                ctx.save();
                ctx.fillStyle = id === begr ? "rgba(242, 197, 61, 0.22)" : "rgba(242, 197, 61, 0.12)";
                NK.rundtRekt(ctx, lay.braet.x + 6, b.y - lay.bane / 2 + 3, lay.braet.b - 12, lay.bane - 6, 8);
                ctx.fill();
                ctx.restore();
            }
        });
        var skub = this.udSkub();
        ctx.save();
        ctx.translate(skub, 0);
        Tg.bakke(ctx, lay.bakke);
        ctx.restore();

        /* Tingene i raekkerne */
        var orden = {};
        this.ids().forEach(function (id, i) { orden[id] = i; });
        var liggende = this.ting.filter(function (t) { return !t.fra && t.produkt < 0 && !t.hjem && !(mig.traek && mig.traek.t === t); });
        liggende.sort(function (a, b) { return orden[a.id] - orden[b.id] || a.y - b.y || a.x - b.x; });
        liggende.forEach(function (t) {
            var lys = mig.over && mig.over.slags === "ting" && mig.over.t === t;
            Tg.ting(ctx, t.id, t.x, t.y, mig.baneIw(t.id), { rest: t.rest ? puls : 0, lys: lys, v: t.v0 || 0 });
        });
        /* Antallet for enden af hver raekke */
        this.ids().forEach(function (id) {
            var n = mig.antal(id);
            if (n) Tg.antalPlade(ctx, lay.braet.x + lay.braet.b - 24, mig.baneY(id), String(n), {
                px: NK.klamp(lay.iw * 0.14, 12, 15), farve: id === begr ? "#c9961a" : undefined });
        });
        if (begr) {
            Tg.maerkat(ctx, lay.braet.x + 58, lay.baner[begr].y - lay.bane / 2 + 11, "begrænsende", { px: 12, farve: "#f2c53d" });
        }
        /* Overskud: maerkaten staar over det foerste, der er tilbage */
        var rest = this.ting.filter(function (t) { return t.rest && !t.hjem && !t.fra; });
        if (rest.length) {
            rest.sort(function (a, b) { return orden[a.id] - orden[b.id] || a.y - b.y || a.x - b.x; });
            var r0 = rest[0], rh = Tg.tingHoejde(r0.id, mig.baneIw(r0.id));
            var mx = NK.klamp(r0.x + 40, lay.braet.x + 50, lay.braet.x + lay.braet.b - 50);
            if (r0.id === begr) mx = Math.max(mx, lay.braet.x + 150);
            Tg.maerkat(ctx, mx, r0.y - rh / 2 - 12, "overskud", { px: 12 });
        }

        /* Retterne paa bakken, ting for ting i opskriftens raekkefoelge */
        var S = Tg.SAML[ops.id];
        var iRet = this.ting.filter(function (t) { return t.produkt >= 0 && !t.fra && !t.hjem; });
        iRet.sort(function (a, b) { return a.produkt - b.produkt || S.orden.indexOf(a.id) - S.orden.indexOf(b.id) || a.plads - b.plads; });
        iRet.forEach(function (t) {
            var f = mig.tingForm(t);
            Tg.ting(ctx, t.id, t.x + skub, t.y, iw * f.skala, { skygge: t.id === S.orden[0] && t.plads === 0, v: f.v });
        });

        /* Det, der flyver */
        this.ting.forEach(function (t) {
            if (!t.fra) return;
            var p = mig.tingPos(t), f = mig.tingForm(t);
            var skala = t.hjem ? 1 - 0.4 * NK.blod(t.t) : 1;
            Tg.ting(ctx, t.id, p.x, p.y, iw * f.skala * skala, { v: f.v, alfa: t.venter > 0 && !t.hjem && t.produkt < 0 ? 0 : 1 });
        });

        /* Det, der traekkes */
        var tr = this.traek;
        if (tr && tr.flyttet) Tg.ting(ctx, tr.id, tr.x, tr.y, this.baneIw(tr.id), { lys: this.overBraet(tr) ? 1 : 0 });

        /* Pilen viser, hvad der kan traekkes, saa laenge brættet er tomt */
        if (!tr && o && o.slags === "disk" && !this.naaet && !this.ting.length && (this.nr === 0 || this.nr === 6)) {
            var bg = lay.beholdere[this.ids()[0]];
            Tg.buePil(ctx, bg.x, bg.y - bg.h * 0.5, lay.braet.x + lay.braet.b * 0.35, this.baneY(this.ids()[0]) - 6, this.tid,
                bg.x + (lay.braet.b * 0.35) * 0.5, bg.y - bg.h * 0.9);
        }

        if (this.laererTegnOver) this.laererTegnOver(ctx);
    };

    /* Er der noget paa brættet, der kan serveres? */
    P.klarTilKlokke = function () {
        var mig = this;
        return this.ids().some(function (id) { return mig.antal(id); }) && !this.iLuften();
    };

    /* ----- Musen ---------------------------------------------------------------------------- */
    P.overBraet = function (pt) {
        var r = this.lay.braet;
        return pt.x >= r.x - 10 && pt.x <= r.x + r.b + 10 && pt.y >= r.y - 20 && pt.y <= r.y + r.h + 10;
    };

    P.hvadErUnder = function (pt) {
        var lay = this.lay;
        if (!lay) return null;
        if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return { slags: "laerer" };
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand && Math.abs(pt.x - lay.kop.x) < 30 && pt.y < lay.kop.y + 4 && pt.y > lay.kop.y - 60) {
            return { slags: "kop" };
        }
        var ids = this.ids(), i;
        for (i = 0; i < ids.length; i++) {
            var b = lay.beholdere[ids[i]];
            if (Math.abs(pt.x - b.x) <= b.b / 2 + 4 && pt.y <= b.y + 4 && pt.y >= b.y - b.h * 1.05) return { slags: "beholder", id: ids[i] };
        }
        var k = lay.klokke;
        if (Math.abs(pt.x - k.x) <= k.b * 0.6 && pt.y <= k.y + 4 && pt.y >= k.y - k.b * 0.85) return { slags: "klokke" };
        var bon = lay.bon;
        if (pt.x >= bon.x && pt.x <= bon.x + bon.b && pt.y >= bon.y - 8 && pt.y <= bon.y + bon.h) return { slags: "bon" };
        var s = lay.skilt;
        if (pt.x >= s.x && pt.x <= s.x + s.b && pt.y >= s.y && pt.y <= s.y + s.h) return { slags: "skilt" };
        var trin = this.aktivtTrin();
        if (this.overBraet(pt) && trin && trin.art === "begr") {
            for (i = 0; i < ids.length; i++) {
                var bn = lay.baner[ids[i]];
                if (Math.abs(pt.y - bn.y) <= lay.bane / 2) return { slags: "bane", id: ids[i] };
            }
        }
        if (!this.serv) {
            var iw = lay.iw * lay.sk;
            var liste = this.ting.filter(function (t) { return !t.fra && !t.hjem && t.produkt < 0; });
            for (var j = liste.length - 1; j >= 0; j--) {
                var t = liste[j], w = Tg.tingBredde(t.id, this.baneIw(t.id)), hh = Tg.tingHoejde(t.id, this.baneIw(t.id));
                if (Math.abs(pt.x - t.x) <= w / 2 + 2 && Math.abs(pt.y - t.y) <= hh / 2 + 4) return { slags: "ting", t: t };
            }
        }
        if (this.overBraet(pt)) return { slags: "braet" };
        return null;
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointerdown", function (e) {
            var pt = mig.L.punkt(e);
            var u = mig.hvadErUnder(pt);
            if (!u || (u.slags !== "beholder" && u.slags !== "ting")) return;
            mig.traek = { id: u.id || u.t.id, t: u.t || null, start: pt, x: pt.x, y: pt.y, flyttet: false };
            try { c.setPointerCapture(e.pointerId); } catch (x) { /* ikke vigtigt */ }
        });
        c.addEventListener("pointermove", function (e) {
            var pt = mig.L.punkt(e), tr = mig.traek;
            if (tr) {
                tr.x = pt.x;
                tr.y = pt.y;
                if (!tr.flyttet && Math.abs(pt.x - tr.start.x) + Math.abs(pt.y - tr.start.y) > 6) {
                    tr.flyttet = true;
                    if (tr.t && mig.serv) { tr.flyttet = false; mig.traek = null; return; }
                    mig.visStatus();
                }
                c.style.cursor = "grabbing";
                return;
            }
            mig.over = mig.hvadErUnder(pt);
            var sl = mig.over && mig.over.slags;
            c.style.cursor = sl === "beholder" || sl === "ting" ? "grab" : (sl && sl !== "braet" ? "pointer" : "default");
        });
        c.addEventListener("pointerleave", function () { if (!mig.traek) { mig.over = null; c.style.cursor = "default"; } });
        c.addEventListener("pointercancel", function () { mig.traek = null; mig.visStatus(); });
        c.addEventListener("pointerup", function (e) {
            var pt = mig.L.punkt(e), tr = mig.traek;
            mig.traek = null;
            if (tr && tr.flyttet) {
                if (tr.t) {
                    /* En ting traekkes vaek fra brættet: den tages af */
                    if (!mig.overBraet(pt)) { tr.t.x = pt.x; tr.t.y = pt.y; mig.tagAf(tr.t); }
                } else if (mig.overBraet(pt)) {
                    mig.laegPaa(tr.id, { x: pt.x, y: pt.y });
                } else {
                    mig.besked("Slip over skærebrættet.", "gul");
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
        var trin = this.aktivtTrin();
        if (u.slags === "kop" && this.klikKop) { this.klikKop(); return; }
        if (trin && trin.art === "begr" && (u.slags === "bane" || u.slags === "ting" || u.slags === "beholder")) {
            this.vaelg(u.id || u.t.id);
            return;
        }
        if (u.slags === "beholder") { this.laegPaa(u.id); return; }
        if (u.slags === "ting") { this.tagAf(u.t); this.over = null; return; }
        if (u.slags === "klokke") {
            var o = this.ordre();
            if (o && o.slags !== "disk" && !this.naaet) { this.ding = 0.001; this.besked("Skriv svaret til højre først.", "gul"); return; }
            this.server();
            return;
        }
        if (u.slags === "bon") {
            var or = this.ordre();
            this.besked(or ? NK.html(or.tekst) : "Frit valg. Ingen kunder lige nu.", "");
            return;
        }
        if (u.slags === "skilt") {
            var ops = this.ops();
            this.besked("Opskriften: " + NK.html(D.liste(ops.led.map(function (l) { return D.stk(l[0], l[1]); }))) +
                " giver 1 " + ops.navn + ".", "");
        }
    };

    P.nulstil = function () {
        var o = this.ordre();
        if (o && o.slags !== "disk" && !this.naaet) return;
        this.tomDisken();
        if (o && !this.naaet) {
            var mig = this;
            this.ids().forEach(function (id) { mig.beholdning[id] = Infinity; });
            (o.tomt || []).forEach(function (id) { mig.beholdning[id] = 0; });
            if (o.fyld) this.ventFyld = o.fyld;
        }
        this.besked("", "");
        this.visDisken();
        this.visStatus();
    };

    P.enter = function () {
        var o = this.ordre();
        if (this.naaet) { this.knap(); return; }
        if (!o || o.slags === "disk") { if (this.klarTilKlokke() && !this.serv) this.server(); }
    };

    /* ----- Kemichaels praesentation ------------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc4.4-intro-hotdog", tilbud: "hotdog-tilbud", spring: "hotdog-spring" });

    /* Mens han siger, at man traekker tingene hen paa brættet, lyser beholderne */
    P.pegPaaFelt = function (til) { this.pegBeholdere = til; };

    NK.SimHotdog = SimHotdog;
}());
