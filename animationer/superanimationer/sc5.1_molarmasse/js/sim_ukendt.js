/* =====================================================================
   sim_ukendt.js - fane 3: ukendt stof

   Etiketten er faldet af en brun flaske. Mærket om halsen siger kun
   molarmassen. Paa korktavlen haenger fire etiketter, og eleven klikker
   paa den, der passer. En forkert etiket flyver hen til flasken, falder
   af igen og haenger bagefter streget ud med sin molarmasse. Den rigtige
   bliver siddende.

   Tolv flasker i tre niveauer (D.GAADER). I det sidste niveau giver
   etiketterne naesten det samme, hvis man runder af. En flaske, der er
   loest i foerste forsoeg uden at se svaret, faar en stjerne.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;

    var NOEGLE = "nk-sc5.1-ukendt";
    var FLYV_TID = 0.5;

    function SimUkendt() {
        this.L = new NK.Laerred(NK.el("ukendt-laerred"));
        this.tid = 0;
        var gemt = NK.hent(NOEGLE, {});
        this.status = D.GAADER.map(function (g) {
            var s = gemt[g.nr];
            return { loest: !!(s && s.l), stjerne: !!(s && s.s) };
        });
        this.rost = {};
        this.over = null;
        this.lay = null;
        this.flyv = null;
        this.g = { kaffekop: { skjult: false, iHaand: false } };
        this.valgt = -1;
        this.opg = null;

        this.bygPanel();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.vaelg(this.naesteUloeste(-1));
    }

    var P = SimUkendt.prototype;

    /* ----- Hukommelse ------------------------------------------------------ */
    P.gem = function () {
        var ud = {}, mig = this;
        D.GAADER.forEach(function (g, i) {
            var s = mig.status[i];
            if (s.loest) ud[g.nr] = { l: 1, s: s.stjerne ? 1 : 0 };
        });
        NK.gem(NOEGLE, ud);
    };

    P.antalLoest = function (niveau) {
        var n = 0, mig = this;
        D.GAADER.forEach(function (g, i) {
            if ((niveau === undefined || g.niveau === niveau) && mig.status[i].loest) n++;
        });
        return n;
    };

    P.antalStjerner = function (niveau) {
        var n = 0, mig = this;
        D.GAADER.forEach(function (g, i) {
            if ((niveau === undefined || g.niveau === niveau) && mig.status[i].stjerne) n++;
        });
        return n;
    };

    P.iNiveau = function (niveau) {
        return D.GAADER.filter(function (g) { return g.niveau === niveau; }).length;
    };

    P.naesteUloeste = function (fra) {
        var n = D.GAADER.length;
        for (var d = 1; d <= n; d++) {
            var i = (fra + d + n) % n;
            if (!this.status[i].loest) return i;
        }
        return (fra + 1 + n) % n;
    };

    /* ----- Layout --------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var kant = NK.klamp(W * 0.014, 8, 16);
        lay.bordY = Math.round(H * 0.9);
        /* Plakaten begynder under papirkortet */
        lay.zone = this.kortZone();
        lay.p = Tg.plakatLay(kant, lay.zone, W - 2 * kant, (H - lay.zone) * 0.38);
        var zoneTop = lay.p.y + lay.p.h + NK.klamp(H * 0.025, 8, 18);
        lay.zoneTop = zoneTop;
        var zoneH = lay.bordY - zoneTop;

        /* Korktavlen til hoejre */
        var tb = NK.klamp(W * 0.4, 220, 460);
        var th = NK.klamp(zoneH - 24, 110, 300);
        lay.tavle = { x: W - kant - tb, y: zoneTop, b: tb, h: th };
        var ind = { x: lay.tavle.x + 6, y: lay.tavle.y + 6, b: tb - 12, h: th - 12 };
        var mel = NK.klamp(ind.b * 0.04, 6, 14);
        var kb = (ind.b - 3 * mel) / 2;
        var kh = Math.min(kb * 0.62, (ind.h - 3 * mel) / 2);
        var ky0 = ind.y + (ind.h - 2 * kh - mel) / 2;
        lay.kortB = kb;
        lay.kortH = kh;
        lay.pladser = [0, 1, 2, 3].map(function (i) {
            return { x: ind.x + mel + (i % 2) * (kb + mel), y: ky0 + Math.floor(i / 2) * (kh + mel) };
        });

        /* Flasken og maerket til venstre for tavlen, samlet midt i pladsen */
        var ledig = lay.tavle.x - kant - 8;
        var mb = NK.klamp(ledig * 0.4, 96, 190);
        var fb = Math.min(Tg.flaskeBredde(NK.klamp(zoneH * 0.86, 100, 290)), ledig - mb - 36);
        lay.flaskeH = fb / Tg.flaskeBredde(1);
        var gruppe = fb + 14 + mb;
        lay.flaske = { x: kant + Math.max(0, (ledig - gruppe) * 0.55) + fb / 2, y: lay.bordY };
        lay.flaskeB = fb;
        /* Koppen staar yderst til hoejre under tavlen */
        lay.kop = { x: W - kant - 36, y: lay.bordY };
        var k = lay.flaskeH / NK.Sprites.MAAL.flaske.h;
        lay.etiket = {
            x: lay.flaske.x - fb / 2 + 18 * k, y: lay.bordY - lay.flaskeH + 78 * k,
            b: 64 * k, h: 50 * k
        };
        /* Maerket i snor fra flaskens hals */
        lay.hals = { x: lay.flaske.x + 10 * k, y: lay.bordY - lay.flaskeH + 40 * k };
        var mh = NK.klamp(mb * 0.36, 40, 62);
        lay.maerke = { x: lay.flaske.x + fb / 2 + 14, y: lay.hals.y + 20, b: mb, h: mh };
        this.lay = lay;

        this.saetAnker("ukendt-anker-flaske", lay.flaske.x - fb / 2 - 6, lay.bordY - lay.flaskeH - 6, fb + 12, lay.flaskeH + 8);
        this.saetAnker("ukendt-anker-maerke", lay.maerke.x, lay.maerke.y, lay.maerke.b, lay.maerke.h);
        this.saetAnker("ukendt-anker-tavle", lay.tavle.x, lay.tavle.y, lay.tavle.b, lay.tavle.h);
        this.saetAnker("ukendt-anker-plakat", lay.p.x, lay.p.y, lay.p.b, lay.p.h);
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
        else this.tjekZone();
    };

    /* ----- Panelet ---------------------------------------------------------------- */
    P.bygPanel = function () {
        var mig = this;
        this.kort = new NK.SceneKort("ukendt", {
            hint: function () { mig.knap(); },
            indsend: function () { mig.indsend(); },
            videre: function () { mig.videre(); }
        });
        this.el = {
            besked: this.kort.beskedEl,
            knap: this.kort.hintEl,
            indsend: this.kort.indsendEl,
            niveauer: NK.el("ukendt-niveauer"),
            nulstil: NK.el("ukendt-nulstil"),
            igen: NK.el("ukendt-igen")
        };
        this.el.igen.addEventListener("click", function () { mig.nyOpgave(false); });

        D.GAADE_NIVEAUER.forEach(function (nv, nr) {
            var knap = document.createElement("button");
            knap.type = "button";
            knap.className = "hyldelinje";
            knap.innerHTML = '<span class="hl-farve" style="background:' + nv.farve + '"></span>' +
                '<span class="hl-navn">' + nv.navn + "</span>" +
                '<span class="hl-tal" id="ukendt-n-tal-' + nr + '"></span>' +
                '<span class="hl-stjerner" id="ukendt-n-stj-' + nr + '"></span>';
            knap.addEventListener("click", function () { mig.vaelgNiveau(nr); });
            mig.el.niveauer.appendChild(knap);
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
        NK.saetHTML("ukendt-nulstil", this.nulstilSikker > 0
            ? "<span>Sikker? Klik igen</span><span class=\"tegn\">↺</span>"
            : "<span>Tag etiketterne af igen</span><span class=\"tegn\">↺</span>");
    };

    P.vaelgNiveau = function (nr) {
        var foerste = -1;
        for (var i = 0; i < D.GAADER.length; i++) {
            if (D.GAADER[i].niveau !== nr) continue;
            if (foerste < 0) foerste = i;
            if (!this.status[i].loest) { this.vaelg(i); return; }
        }
        this.vaelg(foerste);
    };

    P.opdaterFremskridt = function () {
        for (var n = 0; n < D.GAADE_NIVEAUER.length; n++) {
            NK.saetTekst("ukendt-n-tal-" + n, this.antalLoest(n) + "/" + this.iNiveau(n));
            var s = this.antalStjerner(n);
            NK.saetTekst("ukendt-n-stj-" + n, s ? "★ " + s : "");
        }
        NK.saetTekst("ukendt-loest", String(this.antalLoest()));
    };

    /* ----- Opgaven --------------------------------------------------------------- */
    P.vaelg = function (i) {
        if (i === this.valgt && this.opg) return;
        this.valgt = i;
        this.nyOpgave(this.status[i].loest);
    };

    P.nyOpgave = function (gennemsyn) {
        var g = D.GAADER[this.valgt];
        var kort = NK.bland(g.kort).map(function (st, i) {
            return { st: st, plads: i, kryds: false, paaFlasken: false, ryst: 0 };
        });
        this.opg = { g: g, kort: kort, hjaelp: 0, brugtSvar: false, faerdig: false, gennemsyn: !!gennemsyn, forsoeg: 0 };
        this.flyv = null;
        this.valgtKort = null;
        this.besked("", "");
        if (gennemsyn) {
            kort.forEach(function (k) { if (k.st === g.st) k.paaFlasken = true; });
            this.opg.faerdig = true;
        }
        this.visKort();
    };

    /* ----- Papirkortet ----------------------------------------------------------
       Opgaven staar paa kortet oeverst i scenen. Et klik paa en etiket paa
       tavlen vaelger den kun (blaa ramme); Indsend svar sender den hen til
       flasken. Efter det rigtige svar bliver kortet staaende med
       forklaringen og Naeste flaske. */
    P.visKort = function () {
        var o = this.opg, g = o.g, k = this.kort;
        NK.el("ukendt-igen").hidden = !o.gennemsyn;
        var tekst = "Etiketten er faldet af den brune flaske, og mærket viser kun molarmassen: <b>M = " + NK.komma(g.st.M) +
            " g/mol</b>. Hvilken etiket på tavlen passer til flasken?";
        k.vis({ kl: o.faerdig ? "loest" + (o.brugtSvar ? " svar" : "") : "opgave",
            chip: "Flaske " + (g.plads + 1) + " af " + this.iNiveau(g.niveau), tekst: tekst });
        if (o.faerdig) {
            var andre = o.kort.filter(function (kk) { return kk.st !== g.st; }).map(function (kk) {
                return kk.st.tekst + " " + NK.komma(kk.st.M);
            });
            var forkl = "<b>" + NK.html(g.st.tekst + " " + g.st.navn + " har M = " + NK.komma(g.st.M) + " g/mol.") + "</b> " +
                NK.html("De andre etiketter: " + andre.join(" · ") + ".");
            var naeste = this.naesteUloesteEllerIngen();
            var knap = naeste >= 0 ? "Næste flaske →" : null;
            if (!knap) forkl += " " + NK.html("Alle tolv flasker har fået etiket.");
            var maerke = o.gennemsyn ? (this.status[this.valgt].stjerne ? "Løst i første forsøg ★" : "Løst") :
                (o.brugtSvar ? "Svaret" : "Rigtigt");
            k.bliv(forkl, maerke, knap, o.brugtSvar && !o.gennemsyn ? "svar" : "god");
            k.knapper({});
        } else {
            k.bliv(null);
            var v = this.valgtKort;
            k.knapper({ hint: o.hjaelp === 0 ? "Giv hint" : "Vis svaret", peg: this.pegKnap,
                indsend: true, klar: !!v && !this.flyv, indsendTekst: v ? "Indsend svar: " + v.st.tekst : "Indsend svar" });
        }
        this.opdaterFremskridt();
        this.tjekZone();
    };

    /* Kortets plads oeverst i scenen: [almindelig skaerm, lav skaerm] */
    var ZONE = [118, 104];
    P.kortZone = function () { return this.kort.zone(ZONE); };
    P.tjekZone = function () {
        if (this.lay && this.kortZone() !== this.lay.zone) this.layout();
    };

    P.naesteUloesteEllerIngen = function () {
        var n = D.GAADER.length;
        for (var d = 1; d <= n; d++) {
            var i = (this.valgt + d) % n;
            if (!this.status[i].loest) return i;
        }
        return -1;
    };

    P.besked = function (html, klasse) {
        this.pegKnap = klasse === "skidt";
        this.kort.besked(html, klasse);
        if (this.opg && !this.opg.faerdig) {
            this.el.knap.classList.toggle("peg", this.pegKnap && this.opg.hjaelp === 0);
        }
    };

    /* Et klik paa en etiket paa tavlen vaelger den kun */
    P.vaelgKort = function (kk) {
        var o = this.opg;
        if (!o || o.faerdig || this.flyv || !kk || kk.kryds) return;
        this.valgtKort = kk;
        this.visKort();
    };

    /* Indsend svar: den valgte etiket flyver hen til flasken */
    P.indsend = function () {
        var o = this.opg;
        if (!o || o.faerdig || this.flyv) { this.kort.blink(); return; }
        if (!this.valgtKort) {
            this.kort.blink();
            this.besked("Klik først på en etiket på tavlen, og tryk derefter Indsend svar.", "peger");
            return;
        }
        var kk = this.valgtKort;
        this.valgtKort = null;
        this.send(kk);
        this.visKort();
    };

    P.videre = function () {
        var o = this.opg;
        if (!o || !o.faerdig) return;
        var i = this.naesteUloesteEllerIngen();
        if (i >= 0) this.vaelg(i);
    };

    P.knap = function () {
        var o = this.opg;
        if (o.faerdig) { this.videre(); return; }
        if (this.flyv) return;
        if (o.hjaelp === 0) {
            o.hjaelp = 1;
            this.besked('<span class="b-maerke">Hint</span> ' + NK.html(D.GAADE_NIVEAUER[o.g.niveau].hint), "gul");
            this.visKort();
        } else {
            o.brugtSvar = true;
            this.valgtKort = null;
            var rigtig = o.kort.filter(function (kk) { return kk.st === o.g.st; })[0];
            this.send(rigtig);
            this.visKort();
        }
    };

    /* Etiketten flyver fra tavlen hen til flasken */
    P.send = function (k) {
        var o = this.opg;
        if (!k || o.faerdig || this.flyv || k.kryds) return;
        this.flyv = { k: k, t: 0, tilbage: false };
    };

    P.lander = function (k) {
        var o = this.opg, g = o.g;
        if (k.st === g.st) {
            k.paaFlasken = true;
            this.flyv = null;
            this.besked("", "");
            this.loes();
        } else {
            o.forsoeg++;
            k.kryds = true;
            var d = k.st.M - g.st.M;
            this.besked('<span class="b-maerke">Ikke endnu</span> ' + NK.html(k.st.tekst + " har M = " + NK.komma(k.st.M) + " g/mol. Det er " +
                NK.komma(Math.abs(d)) + " g/mol for " + (d > 0 ? "meget." : "lidt.")), "skidt");
            this.flyv.tilbage = true;
            this.flyv.t = 0;
        }
    };

    P.loes = function () {
        var o = this.opg, i = this.valgt;
        o.faerdig = true;
        var s = this.status[i];
        var foer = s.loest;
        s.loest = true;
        s.stjerne = s.stjerne || (!o.brugtSvar && o.forsoeg === 0);
        this.gem();
        this.visKort();
        var nv = o.g.niveau;
        if (!foer && this.antalLoest(nv) === this.iNiveau(nv) && !this.rost[nv]) {
            this.rost[nv] = true;
            this.ventRos = { t: 1.8, niveau: nv, alt: this.antalLoest() === D.GAADER.length };
        }
    };

    P.nulstil = function () {
        if (!this.opg) return;
        if (this.opg.faerdig && !this.opg.gennemsyn) return;
        this.nyOpgave(false);
    };

    P.nulstilAlt = function () {
        this.status.forEach(function (s) { s.loest = false; s.stjerne = false; });
        this.rost = {};
        this.gem();
        this.valgt = -1;
        this.opg = null;
        this.vaelg(0);
    };

    /* Enter: Indsend svar, naar en etiket er valgt, ellers videre */
    P.enter = function () {
        var o = this.opg;
        if (!o) return;
        if (o.faerdig) { this.videre(); return; }
        if (this.valgtKort) this.indsend();
        else this.kort.blink();
    };
    P.fokus = function () {};

    /* ----- Kemichaels praesentation ----------------------------------------
       Trinnene og boblen er faelles (NK.Praesentation.trin i js/laerer.js);
       js/app.js viser foerst tilbuddet (NK.Praesentation.pakInd). */
    P.startIntro = function (tving) {
        if (!this.laererIntro) return;
        if (!tving && NK.hent("nk-sc5.1-intro-ukendt", false)) return;
        NK.gem("nk-sc5.1-intro-ukendt", true);
        this.introVent = tving ? 0.1 : 0.9;
    };

    P.springIntro = function () {
        this.introVent = 0;
        return !!(this.laererIntroVaek && this.laererIntroVaek());
    };

    P.opdaterIntro = function (dt) {
        if (this.introVent > 0) {
            this.introVent -= dt;
            if (this.introVent <= 0 && this.laererIntro) this.laererIntro();
        }
        /* Taleboblen med Naeste og Spring praesentationen over og den gule
           ramme (../kemichael/praesentation.js) */
        if (this.kmIntro && this.introOpdaterBoble) this.introOpdaterBoble();
    };

    /* ----- Tegneloekken ------------------------------------------------------ */
    P.opdater = function (dt) {
        this.tid += dt;
        if (this.nulstilSikker > 0) {
            this.nulstilSikker -= dt;
            if (this.nulstilSikker <= 0) { this.nulstilSikker = 0; this.visNulstil(); }
        }
        if (this.flyv) {
            this.flyv.t += dt / FLYV_TID;
            if (this.flyv.t >= 1) {
                if (this.flyv.tilbage) {
                    this.flyv.k.ryst = 0.5;
                    this.flyv = null;
                    this.visKort();
                } else {
                    this.lander(this.flyv.k);
                }
            }
        }
        if (this.opg) this.opg.kort.forEach(function (k) { if (k.ryst > 0) k.ryst = Math.max(0, k.ryst - dt); });
        if (this.ventRos) {
            this.ventRos.t -= dt;
            if (this.ventRos.t <= 0 && this.laererNiveau) {
                var v = this.ventRos;
                this.ventRos = null;
                this.laererNiveau(v.niveau, v.alt);
            }
        }
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
    };

    /* Kortets rektangel paa tavlen */
    P.kortRekt = function (k) {
        var lay = this.lay, p = lay.pladser[k.plads];
        var ryst = k.ryst > 0 ? Math.sin(k.ryst * 40) * 5 * k.ryst * 2 : 0;
        return { x: p.x + ryst, y: p.y, b: lay.kortB, h: lay.kortH };
    };

    P.tegn = function () {
        var L = this.L, ctx = L.ctx, lay = this.lay;
        if (!lay || !this.opg) return;
        var mig = this, o = this.opg;
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 6);
        Tg.plakat(ctx, lay.p, { tid: this.tid, lys: this.over && this.over.slags === "celle" ? this.over.s : null });

        /* Korktavlen med etiketterne */
        Tg.kork(ctx, lay.tavle.x, lay.tavle.y, lay.tavle.b, lay.tavle.h);
        var farve = D.GAADE_NIVEAUER[o.g.niveau].farve;
        o.kort.forEach(function (k) {
            if (k.paaFlasken || (mig.flyv && mig.flyv.k === k)) return;
            var r = mig.kortRekt(k);
            var lys = mig.over && mig.over.slags === "kort" && mig.over.k === k;
            Tg.etiket(ctx, r.x, r.y, r.b, r.h, k.st, { kryds: k.kryds, lys: lys, farve: farve, M: o.faerdig });
            /* Den valgte etiket (sendes med Indsend svar): blaa ramme */
            if (mig.valgtKort === k) {
                ctx.save();
                ctx.strokeStyle = "#3d9ee0";
                ctx.lineWidth = 4;
                NK.rundtRekt(ctx, r.x - 5, r.y - 5, r.b + 10, r.h + 10, 7);
                ctx.stroke();
                ctx.restore();
            }
            /* Tegnestiften */
            ctx.fillStyle = "#c0392b";
            ctx.beginPath();
            ctx.arc(r.x + r.b / 2, r.y + 5, 3.5, 0, Math.PI * 2);
            ctx.fill();
        });

        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.H + 10);

        /* Koppen */
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand) {
            var kk = NK.klamp(lay.H / 600, 0.8, 1.4);
            NK.Sprites.tegn(ctx, "kaffekop", lay.kop.x - 18 * kk, lay.kop.y - 40 * kk, 42 * kk, 40 * kk);
            if (this.over && this.over.slags === "kop") {
                ctx.strokeStyle = "rgba(242, 197, 61, 0.8)";
                ctx.lineWidth = 2;
                NK.rundtRekt(ctx, lay.kop.x - 22 * kk, lay.kop.y - 44 * kk, 50 * kk, 46 * kk, 6);
                ctx.stroke();
            }
        }

        /* Flasken og maerket */
        var paa = o.kort.filter(function (k) { return k.paaFlasken; })[0];
        Tg.flaske(ctx, lay.flaske.x, lay.flaske.y, lay.flaskeH, {
            etiket: paa ? paa.st : null, farve: farve,
            stjerne: o.faerdig && this.status[this.valgt].stjerne ? 1 : 0
        });
        var m = lay.maerke;
        Tg.maerke(ctx, m.x, m.y, m.b, m.h, lay.hals.x, lay.hals.y, [
            { t: "M = " + NK.komma(o.g.st.M) + " g/mol", px: NK.klamp(m.h * 0.36, 13, 20) }
        ]);

        /* Etiketten i luften */
        if (this.flyv) {
            var f = this.flyv, r0 = this.kortRekt(f.k), e = lay.etiket;
            var t = NK.blod(f.tilbage ? 1 - f.t : f.t);
            var x = NK.lerp(r0.x, e.x, t), y = NK.lerp(r0.y, e.y, t) - Math.sin(t * Math.PI) * 40;
            var b = NK.lerp(r0.b, e.b, t), h = NK.lerp(r0.h, e.h, t);
            if (f.tilbage) y += Math.sin(f.t * Math.PI) * 30;
            Tg.etiket(ctx, x, y, b, h, f.k.st, { farve: farve, kryds: f.tilbage });
        }

        this.tegnBobler(ctx);
        if (this.laererTegnOver) this.laererTegnOver(ctx);
    };

    P.tegnBobler = function (ctx) {
        var u = this.over, lay = this.lay;
        if (u && u.slags === "celle") Tg.plakatBoble(ctx, lay.p, u.s, lay.W);
    };

    /* ----- Musen ---------------------------------------------------------------- */
    P.hvadErUnder = function (pt) {
        var lay = this.lay, o = this.opg;
        if (!lay || !o) return null;
        if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return { slags: "laerer" };
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand && Math.abs(pt.x - lay.kop.x) < 30 && pt.y < lay.kop.y + 4 && pt.y > lay.kop.y - 60) {
            return { slags: "kop" };
        }
        var s = Tg.plakatCelle(lay.p, pt.x, pt.y);
        if (s) return { slags: "celle", s: s };
        if (!o.faerdig) {
            for (var i = 0; i < o.kort.length; i++) {
                var k = o.kort[i];
                if (k.paaFlasken || k.kryds) continue;
                var r = this.kortRekt(k);
                if (pt.x >= r.x && pt.x <= r.x + r.b && pt.y >= r.y && pt.y <= r.y + r.h) return { slags: "kort", k: k };
            }
        }
        return null;
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointermove", function (e) {
            mig.over = mig.hvadErUnder(mig.L.punkt(e));
            c.style.cursor = mig.over && mig.over.slags !== "celle" ? "pointer" : "default";
        });
        c.addEventListener("pointerleave", function () { mig.over = null; c.style.cursor = "default"; });
        c.addEventListener("click", function (e) {
            var pt = mig.L.punkt(e);
            if (mig.laererIntroKlik && mig.laererIntroKlik(pt.x, pt.y)) return;
            if (mig.laererKlik && mig.laererKlik(pt.x, pt.y)) return;
            var u = mig.hvadErUnder(pt);
            /* Et klik ved siden af etiketterne: kortet blinker og viser opgaven */
            if (!u) { if (mig.opg && !mig.opg.faerdig) mig.kort.blink(); return; }
            if (u.slags === "kop" && mig.klikKop) { mig.klikKop(); return; }
            if (u.slags === "kort") mig.vaelgKort(u.k);
        });
    };

    NK.SimUkendt = SimUkendt;
}());
