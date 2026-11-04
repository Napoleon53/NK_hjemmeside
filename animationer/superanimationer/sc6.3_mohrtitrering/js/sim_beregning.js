/* =====================================================================
   sim_beregning.js - fane 2: beregningen

   Fra forbruget til masseprocenten i fire trin: n(Ag⁺) = c · V,
   n(NaCl) = n(Ag⁺), m = n · M og m% = m / m(proeve) · 100 %.
   I hvert trin skriver eleven foerst formlen og saa tallet (som sc7.4:
   formlerne skal eleven selv opskrive; hintene hjaelper). Tavlen viser
   foerst kun venstresiden, saa formlen og til sidst den paene beregning,
   og til sidst en bjaelke med havvandets masse, hvor saltet er farvet.

   Maalingen er elevens egen fra fane 1 (NK.maaling), ellers en
   klassekammerats. Ny opgave giver en ny klassekammerats maaling med
   havvand fra et andet sted, en anden proeve og en anden koncentration.
   Til sidst sammenlignes elevens egen maaling med havvandets rigtige
   masseprocent.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    var NOEGLE_ROS = "nk-sc6.3-ros-beregning";

    function SimBeregning() {
        this.L = new NK.Laerred(NK.el("ber-laerred"));
        this.tid = 0;
        this.lay = null;
        this.over = null;
        this.g = { kaffekop: { skjult: false, iHaand: false } };
        this.bygPanel();
        this.bygTilbud();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.nyOpgave(this.kammerat());
    }

    var P = SimBeregning.prototype;

    /* ----- Opgaverne ------------------------------------------------------------------- */
    P.kammerat = function () {
        var s = NK.tilfaeldig(K.STEDER);
        var forrige = this.opg && this.opg.sted;
        for (var i = 0; i < 5 && s.sted === forrige; i++) s = NK.tilfaeldig(K.STEDER);
        var p = Math.round((s.p + NK.r(-0.08, 0.08)) * 100) / 100;
        var m = NK.tilfaeldig(D.KAMMERAT_MASSER), c = NK.tilfaeldig(D.KAMMERAT_C);
        var pr = { m: m, p: p, vand: K.VAND, c: c, clVand: 0 };
        var V = Math.round(K.vAek(pr) / K.DRAABE) * K.DRAABE;
        return { V: Math.round(V * 100) / 100, m: m, c: c, p: p, sted: s.sted, egen: false };
    };

    P.nyOpgave = function (maaling) {
        var o = { V: maaling.V, m: maaling.m, c: maaling.c, p: maaling.p, sted: maaling.sted, egen: !!maaling.egen,
                  over: maaling.over || 0, nr: maaling.nr };
        var nb = o.c * o.V / 1000;
        o.facit = { nb: nb, ns: nb, ms: nb * K.M_NACL, pct: nb * K.M_NACL / o.m * 100 };
        o.k = 0;
        o.hjaelp = 0;
        o.faerdig = false;
        o.venter = false;      /* et trin er regnet: kortet bliver paa det med Naeste trin */
        o.felter = D.TRIN.map(function (t, i) { return { id: t.id, status: i === 0 ? "aktiv" : "laast", fase: "formel" }; });
        this.opg = o;
        this.besked("", "");
        this.visKort();
        this.visData();
    };

    /* En ny egen maaling fra fane 1 tages, naar fanen vises */
    P.tjekEgen = function () {
        var m = NK.maaling;
        if (m && !m.brugt) {
            m.brugt = true;
            this.nyOpgave(m);
        }
    };

    /* ----- Tekst til tavlen og felterne --------------------------------------------------- */
    P.vL = function () { return NK.betydende(this.opg.V / 1000, 4); };

    /* Den paene beregning for et trin: [formel, tal] */
    P.regning = function (id) {
        var o = this.opg, f = o.facit;
        var nb = K.mol(f.nb) + " mol";
        if (id === "nb") return ["n(Ag⁺) = c · V", "= " + K.c(o.c) + " M · " + this.vL() + " L = " + nb];
        if (id === "ns") return ["n(NaCl) = n(Ag⁺)", "= " + nb];
        if (id === "ms") return ["m(NaCl) = n · M", "= " + nb + " · 58,44 g/mol = " + K.gram(f.ms) + " g"];
        return ["m% = m(NaCl) / m(prøve) · 100 %", "= " + K.gram(f.ms) + " g / " + NK.tal2(o.m) + " g · 100 % = " + NK.betydende(f.pct, 3) + " %"];
    };

    P.facitTekst = function (id) {
        var f = this.opg.facit;
        if (id === "nb" || id === "ns") return K.mol(f[id]) + " mol";
        if (id === "ms") return K.gram(f.ms) + " g";
        return NK.betydende(f.pct, 3) + " %";
    };

    /* ----- Tjek --------------------------------------------------------------------------- */
    P.aktivtFelt = function () {
        var o = this.opg;
        return o && !o.faerdig && !o.venter ? o.felter[o.k] : null;
    };

    /* Venstresiden for et trin, fx "n(Ag⁺)" */
    P.venstre = function (i) { return D.TRIN[i].etiket.replace(/ =$/, ""); };

    /* Formlen for et trin, fx "n(Ag⁺) = c · V" */
    P.formelTekst = function (i) { return D.TRIN[i].etiket + " " + D.TRIN[i].formel; };

    P.tjek = function () {
        var f = this.aktivtFelt();
        if (!f || !f.input) return;
        var svar;
        if (f.fase === "formel") {
            svar = NK.Tjek.formel(f.id, f.input.value);
            if (svar.ok) {
                this.formelOk(false, svar.note);
                return;
            }
        } else {
            svar = NK.Tjek.trin(f.id, f.input.value, this.opg);
        }
        if (svar.ok) {
            f.status = "ok";
            this.naeste(false);
            return;
        }
        if (svar.tom) { this.besked(NK.html(svar.besked), "gul"); return; }
        this.besked('<span class="b-maerke">Ikke endnu</span> ' + NK.html(svar.besked), "skidt");
        if (f.feltEl) {
            f.feltEl.classList.remove("ryst");
            void f.feltEl.offsetWidth;
            f.feltEl.classList.add("ryst");
        }
    };

    /* Indsend svar paa kortet og Enter i feltet */
    P.indsend = function () {
        var f = this.aktivtFelt();
        if (!f) { this.kort.blink(); return; }
        if (!f.input || !f.input.value.trim()) {
            this.kort.blink();
            this.besked(f.fase === "formel" ? "Skriv formlen i feltet på kortet først." : "Skriv tallet i feltet på kortet først.", "gul");
            return;
        }
        this.tjek();
    };

    P.kortInput = function () { this.visKnapper(); };

    /* Formlen er skrevet (eller vist): nu skal tallet regnes. Det staar i
       kortets tekst, ikke som ros under det naeste spoergsmaal. */
    P.formelOk = function (vist, note) {
        var o = this.opg, f = this.aktivtFelt();
        if (this.afvisTilbud) this.afvisTilbud();
        f.fase = "tal";
        f.formelVist = !!vist;
        f.note = vist ? "" : (note || "");
        o.hjaelp = 0;
        this.besked("", "");
        this.visKort();
        this.fokus();
    };

    /* Et trin er regnet (eller vist): kortet bliver paa trinnet med
       beregningen og knappen Naeste trin. Efter sidste trin: slutningen. */
    P.naeste = function (vist) {
        var o = this.opg;
        if (this.afvisTilbud) this.afvisTilbud();
        o.hjaelp = 0;
        o.vist = !!vist;
        if (o.k >= o.felter.length - 1) {
            o.faerdig = true;
            this.slut(vist);
        } else {
            o.venter = true;
        }
        this.besked("", "");
        this.visKort();
        this.fokus();
    };

    /* Den groenne knap: naeste trin, eller en ny opgave efter sidste trin */
    P.videre = function () {
        var o = this.opg;
        if (o.faerdig) {
            this.nyOpgave(this.kammerat());
            this.fokus();
            return;
        }
        if (!o.venter) return;
        o.venter = false;
        o.k++;
        o.felter[o.k].status = "aktiv";
        this.besked("", "");
        this.visKort();
        this.fokus();
    };

    P.slut = function (vist) {
        var o = this.opg, f = o.facit;
        var dit = Math.round(f.pct * 100) / 100;
        var t;
        if (o.egen) {
            t = "Havvandet fra " + o.sted + " havde " + K.pct(o.p) + " % NaCl. Du fik " + NK.betydende(f.pct, 3) + " %.";
            if (o.over <= D.PRAECIS + 1e-9) t += " Titreringen var præcis.";
            else t += " Du titrerede " + NK.betydende(o.over, 2) + " mL forbi omslaget, så forbruget og resultatet blev for store.";
            if (Math.abs(dit - o.p) < 0.005 && !vist && this.laererReplik) this.ventAeg = 1.0;
        } else {
            t = "Havvandet fra " + o.sted + " har " + NK.betydende(f.pct, 3) + " % NaCl. Vesterhavet har ca. 3,1 %, Lillebælt ca. 1,5 %.";
        }
        this.slutTekst = t;
        if (!vist && !NK.hent(NOEGLE_ROS, false)) {
            NK.gem(NOEGLE_ROS, true);
            if (!this.ventAeg) this.ventRos = 1.0;
        }
    };

    /* ----- Knappen: Giv hint -> Vis svaret ------------------------------------------- */
    P.knap = function () {
        var o = this.opg;
        if (o.faerdig || o.venter) { this.videre(); return; }
        var f = this.aktivtFelt(), t = D.TRIN[o.k];
        if (o.hjaelp === 0) {
            o.hjaelp = 1;
            this.besked('<span class="b-maerke">Hint</span> ' + NK.html(f.fase === "formel" ? t.formelHint : t.hint), "gul");
            this.visKort();
            this.fokus();
            return;
        }
        if (f.fase === "formel") {
            this.formelOk(true);
            return;
        }
        f.status = "svar";
        this.naeste(true);
    };

    P.nulstil = function () {
        var o = this.opg;
        this.nyOpgave({ V: o.V, m: o.m, c: o.c, p: o.p, sted: o.sted, egen: o.egen, over: o.over, nr: o.nr });
        this.fokus();
    };

    /* ----- Panelet og kortet ----------------------------------------------------------- */
    P.bygPanel = function () {
        this.kort = new NK.Scenekort("ber", this, [176, 150]);
    };

    P.fokus = function () {
        var f = this.aktivtFelt();
        if (f && f.input && NK.el("fane-beregning").classList.contains("aktiv") &&
            !document.querySelector(".overlay.vis") && !(NK.Rundvisning && NK.Rundvisning.aktiv())) {
            try { f.input.focus({ preventScroll: true }); } catch (e) { f.input.focus(); }
        }
    };

    P.besked = function (html, klasse) {
        this.fast = { html: html || "", klasse: klasse || "" };
        this.pegKnap = klasse === "skidt" && this.opg && this.opg.hjaelp === 0;
        if (this.kort) {
            this.kort.bund(this.fast.html, this.fast.klasse);
            this.visKnapper();
        }
    };

    P.visKnapper = function () {
        var o = this.opg, f = this.aktivtFelt();
        if (!f) { this.kort.knapper(null, false, null); return; }
        this.kort.knapper(o.hjaelp === 0 ? "Giv hint" : "Vis svaret", this.pegKnap, !!(f.input && f.input.value.trim()));
    };

    /* Kortet: trinnet, spoergsmaalet og feltet. Formlen skrives foerst og
       tallet bagefter; et regnet trin bliver staaende med beregningen. */
    P.visKort = function () {
        var o = this.opg, k = Math.min(o.k, o.felter.length - 1), f = o.felter[k], t = D.TRIN[k];
        var venstre = NK.html(this.venstre(k)), felt = NK.Scenekort.felt;
        var intro = (k === 0 ? "Regn masseprocenten af NaCl i havvandet ud. Først " + t.navn.toLowerCase() : t.navn) + ". ";
        var d = { chip: "Trin " + (k + 1) + " af " + o.felter.length };
        if (f.fase === "formel" && f.status === "aktiv") {
            d.slags = "spm";
            d.tekst = intro + "Hvilken formel giver " + venstre + "?";
            d.efter = felt("ber-input", NK.html(t.etiket), "", "aktiv", "", "skriv formlen", "Formlen for " + t.navn, true);
        } else {
            d.slags = "spm";
            d.tekst = intro + (f.note ? NK.html(f.note) + " " : "") + "Formlen er " + NK.html(this.formelTekst(k)) + ". Hvad er " + venstre + "?";
            var loest = f.status === "ok" || f.status === "svar";
            d.efter = loest ? felt("ber-input", NK.html(t.etiket), t.enhed, f.status, NK.html(this.facitTekst(f.id).replace(/ (mol|g|%)$/, ""))) :
                felt("ber-input", NK.html(t.etiket), t.enhed, "aktiv", "", "tallet", t.navn);
            if (o.venter) {
                var r = this.regning(f.id);
                d.bliv = { tekst: NK.html(r[0] + " " + r[1]), gul: o.vist, knap: "Næste trin →" };
            } else if (o.faerdig) {
                d.bliv = { tekst: NK.html(this.slutTekst || ""), gul: o.vist, knap: "Ny opgave →" };
            }
        }
        this.kort.vis(d);
        o.felter.forEach(function (x) { x.input = null; x.feltEl = null; });
        var inp = this.kort.input();
        if (f && inp) { f.input = inp; f.feltEl = inp.closest(".felt"); }
        this.visKnapper();
    };

    P.visData = function () {
        var o = this.opg;
        NK.saetTekst("ber-titel", o.egen ? "Din måling" : "En klassekammerats måling");
        NK.saetTekst("ber-m", NK.tal2(o.m) + " g");
        NK.saetTekst("ber-c", K.c(o.c) + " M");
        NK.saetTekst("ber-v", K.mL(o.V) + " mL");
        NK.saetHTML("ber-note", o.egen ? "Forbruget er din aflæsning fra titreringen af havvand fra " + NK.html(o.sted) + "." :
            "Du har ikke en ny måling fra titreringen, så her er en klassekammerats med havvand fra " + NK.html(o.sted) + ".");
    };

    /* ----- Layout ---------------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var kant = NK.klamp(W * 0.014, 8, 16);
        lay.bordY = Math.round(H - NK.klamp(H * 0.1, 30, 70));
        var x0 = NK.klamp(W * 0.25, 110, 260);   /* plads til Kemichael foran tavlen */
        /* Pladsen oeverst er sat af til kortet (kortZone) */
        lay.zone = this.kort.zone();
        lay.tavle = { x: x0, y: 10 + lay.zone + NK.klamp(H * 0.02, 6, 16), b: W - kant - 6 - x0 };
        lay.tavle.h = lay.bordY - 24 - lay.tavle.y;
        lay.f = NK.klamp(Math.min(lay.tavle.h / 17, lay.tavle.b / 38), 13, 21);
        lay.kop = { x: kant + 22, y: lay.bordY };
        this.lay = lay;
        var tv = lay.tavle;
        this.saetAnker("ber-anker-tavle", tv.x, tv.y, tv.b, tv.h);
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

    /* ----- Opdater og tegn ------------------------------------------------------------------ */
    P.opdater = function (dt) {
        this.tid += dt;
        var mig = this;
        function vent(navn, fn) {
            if (mig[navn] > 0) {
                mig[navn] -= dt;
                if (mig[navn] <= 0) fn();
            }
        }
        vent("ventRos", function () { if (mig.laererReplik) mig.laererReplik(D.ROS_BEREGNING, true); });
        vent("ventAeg", function () { if (mig.laererReplik) mig.laererReplik(D.AEG_PRAECIS, false); });
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
    };

    /* Tekst paa tavlen, der kan brydes efter formlen, hvis den er for bred */
    function tavleLinje(ctx, dele, x, y, b, f, farve, farve2) {
        var hel = dele[0] + " " + dele[1];
        ctx.font = Tg.font("600", f);
        if (ctx.measureText(hel).width <= b) {
            NK.tekst(ctx, dele[0], x, y, { font: Tg.font("600", f), linje: "middle", farve: farve });
            var w0 = ctx.measureText(dele[0] + " ").width;
            NK.tekst(ctx, dele[1], x + w0, y, { font: Tg.font("600", f), linje: "middle", farve: farve2 || farve });
            return 1;
        }
        NK.tekst(ctx, dele[0], x, y, { font: Tg.font("600", f), linje: "middle", farve: farve });
        var s = NK.passendeSkrift(ctx, dele[1], b - f * 1.5, f, 11, "600");
        NK.tekst(ctx, dele[1], x + f * 1.5, y + f * 1.55, { font: Tg.font("600", s), linje: "middle", farve: farve2 || farve });
        return 2;
    }

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var o = this.opg, puls = 0.55 + 0.45 * Math.sin(this.tid * 6);
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 12);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.H);

        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand) {
            var kk = NK.klamp(lay.H / 600, 0.8, 1.3);
            NK.Sprites.tegn(ctx, "kaffekop", lay.kop.x - 18 * kk, lay.kop.y - 40 * kk, 42 * kk, 40 * kk);
        }

        /* Tavlen */
        var tv = lay.tavle, f = lay.f;
        ctx.save();
        ctx.fillStyle = "#6b5236";
        NK.rundtRekt(ctx, tv.x - 8, tv.y - 8, tv.b + 16, tv.h + 16, 8);
        ctx.fill();
        var tg = ctx.createLinearGradient(0, tv.y, 0, tv.y + tv.h);
        tg.addColorStop(0, "#23443a");
        tg.addColorStop(1, "#1b362e");
        ctx.fillStyle = tg;
        NK.rundtRekt(ctx, tv.x, tv.y, tv.b, tv.h, 4);
        ctx.fill();
        ctx.restore();

        var x = tv.x + f * 1.3, b = tv.b - f * 2.6, y = tv.y + f * 1.5;
        var lh = f * 1.62;
        var kridt = "#eef3ee", svag = "rgba(238, 243, 238, 0.42)", gul = "#f5dd8a";
        var lille = Tg.font("700", NK.klamp(f * 0.72, 12, 14));

        NK.tekst(ctx, "DATA", x, y, { font: lille, linje: "middle", farve: "#9fc2b4" });
        y += lh * 0.85;
        var d1 = "m(prøve) = " + NK.tal2(o.m) + " g      c(AgNO₃) = " + K.c(o.c) + " M";
        var d2 = "V(AgNO₃) = " + K.mL(o.V) + " mL      M(NaCl) = 58,44 g/mol";
        NK.passendeSkrift(ctx, d1.length > d2.length ? d1 : d2, b, f, 11, "600");
        var df = ctx.font;
        NK.tekst(ctx, d1, x, y, { font: df, linje: "middle", farve: kridt });
        y += lh;
        NK.tekst(ctx, d2, x, y, { font: df, linje: "middle", farve: kridt });
        y += lh * 1.1;
        NK.tekst(ctx, "REAKTIONEN", x, y, { font: lille, linje: "middle", farve: "#9fc2b4" });
        y += lh * 0.85;
        NK.tekst(ctx, "Ag⁺ + Cl⁻ → AgCl", x, y, { font: Tg.font("600", f), linje: "middle", farve: kridt });
        y += lh * 1.1;
        NK.tekst(ctx, "BEREGNINGEN", x, y, { font: lille, linje: "middle", farve: "#9fc2b4" });
        y += lh * 0.85;

        var mig = this;
        o.felter.forEach(function (fe, i) {
            var r = mig.regning(fe.id);
            var loest = fe.status === "ok" || fe.status === "svar";
            var aktiv = fe.status === "aktiv";
            /* Formlen staar foerst paa tavlen, naar eleven har skrevet den */
            var dele = loest ? r : (fe.fase === "tal" ? [r[0], "= ?"] : [mig.venstre(i), "= ?"]);
            if (aktiv) {
                ctx.save();
                ctx.strokeStyle = "rgba(242, 197, 61, " + (0.4 + 0.5 * puls) + ")";
                ctx.lineWidth = 2;
                NK.rundtRekt(ctx, x - f * 0.5, y - lh * 0.55, b + f * 0.7, lh * 1.1, 6);
                ctx.stroke();
                ctx.restore();
            }
            var farve = loest ? kridt : (aktiv ? kridt : svag);
            var n = tavleLinje(ctx, dele, x, y, b, f, farve, loest ? gul : farve);
            y += lh * (n === 2 ? 1.95 : 1.15);
            if (i === 1) y += lh * 0.05;
        });

        /* Bjaelken: proevens masse, hvor saltet er farvet */
        y += lh * 0.4;
        var bb = b * 0.9, bh = Math.max(16, f * 1.1);
        if (y + bh + lh * 0.9 < tv.y + tv.h) {
            var msOk = o.felter[2].status === "ok" || o.felter[2].status === "svar";
            var pctOk = o.felter[3].status === "ok" || o.felter[3].status === "svar";
            ctx.save();
            ctx.fillStyle = "rgba(127, 198, 207, 0.25)";
            ctx.fillRect(x, y, bb, bh);
            if (msOk) {
                var andel = NK.klamp(o.facit.ms / o.m, 0, 1);
                ctx.fillStyle = "#f7f7f2";
                ctx.fillRect(x, y, Math.max(2, bb * andel), bh);
            }
            ctx.strokeStyle = "rgba(238, 243, 238, 0.6)";
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 0.5, y + 0.5, bb, bh);
            ctx.restore();
            var bt = NK.tal2(o.m) + " g havvand";
            if (msOk) bt = K.gram(o.facit.ms) + " g NaCl i " + bt + (pctOk ? ": " + NK.betydende(o.facit.pct, 3) + " %" : "");
            NK.tekst(ctx, bt, x, y + bh + 6, { font: lille, linje: "top", farve: msOk ? "#f2f3ee" : svag });
        }

        if (this.laererTegnOver) this.laererTegnOver(ctx);
    };

    /* ----- Musen --------------------------------------------------------------------------- */
    P.hvadErUnder = function (pt) {
        var lay = this.lay;
        if (!lay) return null;
        if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return { slags: "laerer" };
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand && Math.abs(pt.x - lay.kop.x) < 30 && pt.y < lay.kop.y + 4 && pt.y > lay.kop.y - 60) return { slags: "kop" };
        var tv = lay.tavle;
        if (pt.x >= tv.x && pt.x <= tv.x + tv.b && pt.y >= tv.y && pt.y <= tv.y + tv.h) return { slags: "tavle" };
        return null;
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointermove", function (e) {
            mig.over = mig.hvadErUnder(mig.L.punkt(e));
            var s = mig.over && mig.over.slags;
            c.style.cursor = s && s !== "tavle" ? "pointer" : "default";
        });
        c.addEventListener("pointerleave", function () { mig.over = null; });
        c.addEventListener("pointerup", function (e) { mig.klik(mig.L.punkt(e)); });
    };

    P.klik = function (pt) {
        if (this.laererIntroKlik && this.laererIntroKlik(pt.x, pt.y)) return;
        if (this.laererKlik && this.laererKlik(pt.x, pt.y)) return;
        var u = this.hvadErUnder(pt);
        if (!u) return;
        if (u.slags === "kop" && this.klikKop) { this.klikKop(); return; }
        if (u.slags === "tavle") this.fokus();
    };

    P.enter = function () {
        if (this.opg.faerdig || this.opg.venter) this.videre();
    };

    /* ----- Kemichaels praesentation ------------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc6.3-intro-beregning", tilbud: "ber-tilbud" });

    NK.SimBeregning = SimBeregning;
}());
