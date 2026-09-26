/* =====================================================================
   sim_beregning.js - fane 2: beregningen

   Fra forbruget til masseprocenten i fire trin: n(NaOH) = c · V,
   n(CH₃COOH) = n(NaOH), m = n · M og m% = m / m(proeve) · 100 %.
   I hvert trin skriver eleven foerst formlen og saa tallet (brugerens
   oenske: formlerne skal eleven selv opskrive; hintene hjaelper). Tavlen
   viser foerst kun venstresiden, saa formlen og til sidst den paene
   beregning, og til sidst en bjaelke med eddikens 2,00 g, hvor syren er
   farvet.

   Maalingen er elevens egen fra fane 1 (NK.maaling), ellers en
   klassekammerats. Ny opgave giver en ny klassekammerats maaling med en
   anden proeve og en anden koncentration, saa det aldrig er det samme.
   Til sidst sammenlignes elevens egen maaling med eddikens rigtige
   masseprocent.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    var NOEGLE_ROS = "nk-sc7.4-ros-beregning";

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
        var p = Math.round((4.0 + Math.random() * 1.5) * 100) / 100;
        var m = NK.tilfaeldig(D.KAMMERAT_MASSER), c = NK.tilfaeldig(D.KAMMERAT_C);
        var pr = { m: m, p: p, vand: K.VAND, c: c };
        var V = Math.round(K.vAek(pr) / K.DRAABE) * K.DRAABE;
        return { V: Math.round(V * 100) / 100, m: m, c: c, p: p, egen: false };
    };

    P.nyOpgave = function (maaling) {
        var o = { V: maaling.V, m: maaling.m, c: maaling.c, p: maaling.p, egen: !!maaling.egen,
                  over: maaling.over || 0, nr: maaling.nr };
        var nb = o.c * o.V / 1000;
        o.facit = { nb: nb, ns: nb, ms: nb * K.M_SYRE, pct: nb * K.M_SYRE / o.m * 100 };
        o.k = 0;
        o.hjaelp = 0;
        o.faerdig = false;
        o.felter = D.TRIN.map(function (t, i) { return { id: t.id, status: i === 0 ? "aktiv" : "laast", fase: "formel" }; });
        this.opg = o;
        this.besked("", "");
        this.bygRaekker();
        this.visKort();
        this.visData();
        this.visStatus();
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
        if (id === "nb") return ["n(NaOH) = c · V", "= " + K.c(o.c) + " M · " + this.vL() + " L = " + nb];
        if (id === "ns") return ["n(CH₃COOH) = n(NaOH)", "= " + nb];
        if (id === "ms") return ["m(CH₃COOH) = n · M", "= " + nb + " · 60,05 g/mol = " + K.gram(f.ms) + " g"];
        return ["m% = m(CH₃COOH) / m(prøve) · 100 %", "= " + K.gram(f.ms) + " g / " + NK.tal2(o.m) + " g · 100 % = " + NK.betydende(f.pct, 3) + " %"];
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
        return o && !o.faerdig ? o.felter[o.k] : null;
    };

    /* Venstresiden for et trin, fx "n(NaOH)" */
    P.venstre = function (i) { return D.TRIN[i].etiket.replace(/ =$/, ""); };

    /* Formlen for et trin, fx "n(NaOH) = c · V" */
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
        this.besked(NK.html(svar.besked), svar.tom ? "gul" : "skidt");
        if (!svar.tom && f.feltEl) {
            f.feltEl.classList.remove("ryst");
            void f.feltEl.offsetWidth;
            f.feltEl.classList.add("ryst");
        }
    };

    /* Formlen er skrevet (eller vist): nu skal tallet regnes */
    P.formelOk = function (vist, note) {
        var o = this.opg, f = this.aktivtFelt();
        if (this.afvisTilbud) this.afvisTilbud();
        f.fase = "tal";
        f.formelVist = !!vist;
        o.hjaelp = 0;
        var formel = NK.html(this.formelTekst(o.k));
        if (vist) this.besked("<b>Formlen:</b> " + formel + ". Regn nu tallet ud.", "gul");
        else if (note) this.besked(NK.html(note) + " <b>" + formel + "</b>. Regn nu tallet ud.", "god");
        else this.besked("Rigtig formel. Regn nu tallet ud.", "god");
        this.bygRaekker();
        this.visKort();
        this.visStatus();
        this.fokus();
    };

    P.naeste = function (vist) {
        var o = this.opg;
        if (this.afvisTilbud) this.afvisTilbud();
        o.hjaelp = 0;
        o.k++;
        if (o.k >= o.felter.length) {
            o.faerdig = true;
            this.slut(vist);
        } else {
            o.felter[o.k].status = "aktiv";
            this.besked(vist ? "" : "Rigtigt.", vist ? "" : "god");
        }
        this.bygRaekker();
        this.visKort();
        this.visStatus();
        this.fokus();
    };

    P.slut = function (vist) {
        var o = this.opg, f = o.facit;
        var dit = Math.round(f.pct * 100) / 100;
        var t;
        if (o.egen) {
            t = "Eddiken havde " + K.pct(o.p) + " %. Du fik " + NK.betydende(f.pct, 3) + " %.";
            if (o.over <= D.PRAECIS + 1e-9) t += " Titreringen var præcis.";
            else t += " Du titrerede " + NK.betydende(o.over, 2) + " mL forbi omslaget, så forbruget og resultatet blev for store.";
            if (Math.abs(dit - o.p) < 0.005 && !vist && this.laererReplik) this.ventAeg = 1.0;
            else if (f.pct > o.p * 1.25 && this.laererGlimt) this.ventGlimt = 1.0;
        } else {
            t = "Masseprocenten er " + NK.betydende(f.pct, 3) + " %. Husholdningseddike har typisk mellem 4 og 5,5 %.";
        }
        this.besked(NK.html(t), vist ? "gul" : "god");
        if (!vist && !NK.hent(NOEGLE_ROS, false)) {
            NK.gem(NOEGLE_ROS, true);
            if (!this.ventAeg) this.ventRos = 1.0;
        }
    };

    /* ----- Knappen: Giv hint -> Vis svaret -> Ny opgave -------------------------------- */
    P.knap = function () {
        var o = this.opg;
        if (o.faerdig) {
            this.nyOpgave(this.kammerat());
            this.fokus();
            return;
        }
        var f = this.aktivtFelt(), t = D.TRIN[o.k];
        if (o.hjaelp === 0) {
            o.hjaelp = 1;
            this.besked("<b>Hint:</b> " + NK.html(f.fase === "formel" ? t.formelHint : t.hint), "gul");
            this.visKort();
            this.fokus();
            return;
        }
        if (f.fase === "formel") {
            this.formelOk(true);
            return;
        }
        var r = this.regning(f.id);
        f.status = "svar";
        this.naeste(true);
        if (!o.faerdig) this.besked("<b>Svar:</b> " + NK.html(r[0] + " " + r[1]), "gul");
    };

    P.nulstil = function () {
        var o = this.opg;
        this.nyOpgave({ V: o.V, m: o.m, c: o.c, p: o.p, egen: o.egen, over: o.over, nr: o.nr });
        this.fokus();
    };

    /* ----- Panelet --------------------------------------------------------------------------- */
    P.bygPanel = function () {
        var mig = this;
        this.el = {
            knap: NK.el("ber-knap"),
            besked: NK.el("ber-besked"),
            kort: NK.el("ber-kort"),
            raekker: NK.el("ber-raekker")
        };
        this.el.knap.addEventListener("click", function () { mig.knap(); });
        NK.el("ber-spring").addEventListener("click", function () { mig.springIntro(); });
    };

    P.bygRaekker = function () {
        var mig = this, o = this.opg, vaert = this.el.raekker;
        vaert.innerHTML = "";
        o.felter.forEach(function (f, i) {
            var t = D.TRIN[i];
            var rk = document.createElement("div");
            rk.className = "raekke";
            var formelKendt = f.fase === "tal" || f.status === "ok" || f.status === "svar";
            rk.innerHTML = '<div class="raekke-hoved"><span class="raekke-etiket">' + (i + 1) + ". " + NK.html(t.navn) +
                '</span></div>' + (formelKendt ? '<div class="raekke-formel">' + NK.html(mig.formelTekst(i)) + "</div>" : "") +
                '<div class="felter"></div>';
            var fe = document.createElement("div");
            f.feltEl = fe;
            f.input = null;
            if (f.status === "ok" || f.status === "svar") {
                fe.className = "felt " + f.status;
                fe.innerHTML = '<span class="felt-pre">' + t.etiket + '</span><span class="felt-svar"><b>' +
                    NK.html(mig.facitTekst(f.id)) + '</b></span><span class="felt-maerke">' + (f.status === "ok" ? "✓" : "↩") + "</span>";
            } else {
                var fra = f.status === "aktiv" ? "" : " disabled";
                var formel = f.fase === "formel";
                fe.className = "felt " + f.status + (formel ? " formelfelt" : "");
                fe.innerHTML = '<span class="felt-pre">' + t.etiket + '</span>' +
                    '<input type="text" inputmode="' + (formel ? "text" : "decimal") + '" autocomplete="off" spellcheck="false" aria-label="' +
                    NK.html((formel ? "Formlen for " : "") + t.navn) + '" placeholder="' + (formel ? "skriv formlen" : "tallet") + '"' + fra + '>' +
                    (formel ? "" : '<span class="felt-efter">' + t.enhed + '</span>') +
                    '<button type="button" class="felt-ok" aria-label="Tjek svaret" tabindex="-1"' + fra + '>↵</button>';
                var inp = fe.querySelector("input");
                inp.addEventListener("keydown", function (e) {
                    if (e.key === "Enter") { e.preventDefault(); mig.tjek(); }
                });
                fe.querySelector(".felt-ok").addEventListener("click", function () { mig.tjek(); });
                f.input = inp;
            }
            rk.querySelector(".felter").appendChild(fe);
            vaert.appendChild(rk);
        });
    };

    P.fokus = function () {
        var f = this.aktivtFelt();
        if (f && f.input && NK.el("fane-beregning").classList.contains("aktiv") &&
            !document.querySelector(".overlay.vis") && !(NK.Rundvisning && NK.Rundvisning.aktiv())) {
            try { f.input.focus({ preventScroll: true }); } catch (e) { f.input.focus(); }
        }
    };

    P.besked = function (html, klasse) {
        this.el.besked.innerHTML = html;
        this.el.besked.className = "besked" + (klasse ? " " + klasse : "");
    };

    P.visKort = function () {
        var o = this.opg;
        NK.saetTekst("ber-titel", o.egen ? "Din måling" : "En klassekammerats måling");
        NK.saetTekst("ber-nr", String(Math.min(o.k + 1, 4)));
        NK.saetTekst("ber-prompt", o.faerdig ? "Masseprocenten er regnet ud." : "Regn eddikens masseprocent ud.");
        var tekst, klasse = "knap";
        if (o.faerdig) { tekst = "Ny opgave →"; klasse = "knap blaa banker"; }
        else tekst = o.hjaelp === 0 ? "Giv hint" : "Vis svaret";
        this.el.knap.textContent = tekst;
        this.el.knap.className = klasse;
        this.el.kort.classList.toggle("sejr", o.faerdig);
    };

    P.visData = function () {
        var o = this.opg;
        NK.saetTekst("ber-m", NK.tal2(o.m) + " g");
        NK.saetTekst("ber-c", K.c(o.c) + " M");
        NK.saetTekst("ber-v", K.mL(o.V) + " mL");
        NK.saetHTML("ber-note", o.egen ? "Forbruget er din aflæsning fra titreringen." :
            "Du har ikke en ny måling fra titreringen, så her er en klassekammerats.");
    };

    P.visStatus = function () {
        var o = this.opg, t;
        if (o.faerdig) t = "Beregningen står på tavlen. Tryk på <b>Ny opgave</b> for en ny måling.";
        else t = "Trin " + (o.k + 1) + " af 4: " + D.TRIN[o.k].navn + ". Skriv " +
            (o.felter[o.k].fase === "formel" ? "<b>formlen</b>" : "<b>tallet</b>") + " i feltet til højre.";
        NK.saetHTML("ber-status", t);
    };

    /* ----- Layout ---------------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var kant = NK.klamp(W * 0.014, 8, 16);
        lay.bordY = Math.round(H - NK.klamp(H * 0.1, 30, 70));
        var x0 = NK.klamp(W * 0.25, 110, 260);   /* plads til Kemichael foran tavlen */
        lay.tavle = { x: x0, y: NK.klamp(H * 0.04, 10, 30), b: W - kant - 6 - x0 };
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
        vent("ventGlimt", function () { if (mig.laererGlimt) mig.laererGlimt("titrering"); });
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
        var d1 = "m(prøve) = " + NK.tal2(o.m) + " g      c(NaOH) = " + K.c(o.c) + " M";
        var d2 = "V(NaOH) = " + K.mL(o.V) + " mL      M(CH₃COOH) = 60,05 g/mol";
        NK.passendeSkrift(ctx, d1.length > d2.length ? d1 : d2, b, f, 11, "600");
        var df = ctx.font;
        NK.tekst(ctx, d1, x, y, { font: df, linje: "middle", farve: kridt });
        y += lh;
        NK.tekst(ctx, d2, x, y, { font: df, linje: "middle", farve: kridt });
        y += lh * 1.1;
        NK.tekst(ctx, "REAKTIONEN", x, y, { font: lille, linje: "middle", farve: "#9fc2b4" });
        y += lh * 0.85;
        NK.tekst(ctx, "CH₃COOH + OH⁻ → CH₃COO⁻ + H₂O", x, y, { font: Tg.font("600", f), linje: "middle", farve: kridt });
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

        /* Bjaelken: proevens masse, hvor syren er farvet */
        y += lh * 0.4;
        var bb = b * 0.9, bh = Math.max(16, f * 1.1);
        if (y + bh + lh * 0.9 < tv.y + tv.h) {
            var msOk = o.felter[2].status === "ok" || o.felter[2].status === "svar";
            var pctOk = o.felter[3].status === "ok" || o.felter[3].status === "svar";
            ctx.save();
            ctx.fillStyle = "rgba(214, 230, 242, 0.25)";
            ctx.fillRect(x, y, bb, bh);
            if (msOk) {
                var andel = NK.klamp(o.facit.ms / o.m, 0, 1);
                ctx.fillStyle = "#f4b26b";
                ctx.fillRect(x, y, Math.max(2, bb * andel), bh);
            }
            ctx.strokeStyle = "rgba(238, 243, 238, 0.6)";
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 0.5, y + 0.5, bb, bh);
            ctx.restore();
            var bt = NK.tal2(o.m) + " g eddike";
            if (msOk) bt = K.gram(o.facit.ms) + " g eddikesyre af " + bt + (pctOk ? ": " + NK.betydende(o.facit.pct, 3) + " %" : "");
            NK.tekst(ctx, bt, x, y + bh + 6, { font: lille, linje: "top", farve: msOk ? "#f4c48f" : svag });
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
        if (this.opg.faerdig) this.knap();
    };

    /* ----- Kemichaels praesentation ------------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc7.4-intro-beregning", tilbud: "ber-tilbud", spring: "ber-spring" });

    /* Mens han siger, hvor man skriver, lyser feltet */
    P.pegPaaFelt = function (til) {
        var f = this.aktivtFelt();
        if (f && f.feltEl) f.feltEl.classList.toggle("peg", !!til);
    };

    NK.SimBeregning = SimBeregning;
}());
