/* =====================================================================
   sim_form.js - fane 2: Formen

   Tre glas med de tre isomerer af C5H12 staar i et lavt vandbad, hvert
   med sin ballon og sit store zoomvindue over sig. Eleven gaetter
   foerst, hvilken ballon der fyldes foerst (paa papirkortet eller ved at
   klikke paa et glas), og varmer saa vandbadet op med termometeret. Ballonerne
   fyldes én efter én: 2,2-dimethylpropan ved 9,5 °C, 2-methylbutan ved
   27,9 °C og pentan ved 36,1 °C.

   Naar alle tre har kogt, spoerges der hvorfor. De forkerte svar er de
   typiske fejl: faerre atomer, lettere, og at bindingerne inde i
   molekylet brydes. Den valgfrie boks bag knappen under kogepunkterne
   viser parrene: to molekyler af hvert stof, der ligger saa taet, de
   kan, med prikker, hvor de roerer hinanden (NK.Form.bedstePar).

   Trinene: gaet -> varm -> hvorfor -> faerdig. Til sidst gaar knappen
   videre til fane 3; R starter forsoeget forfra. Kemichael roser kun
   foerste gang.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;

    var NOEGLE = "nk-sc4.1-form";
    var KASSE = { W: 20, H: 22 };
    var ANTAL = 14;
    var FARVER = ["#e35d4f", "#e8c547", "#4fc3b0"];
    var START = 0;

    function SimForm() {
        this.L = new NK.Laerred(NK.el("form-laerred"));
        this.tid = 0;
        this.lay = null;
        this.over = null;
        this.traek = null;
        this.termo = new NK.Termostat(D.T_FORM, START);
        /* Ingen kop paa denne fane: vandbadet fylder bordet */
        this.g = { kaffekop: { skjult: true, iHaand: false } };
        /* Parrene regnes nu, saa der ikke kommer et hak, naar de vises */
        D.ISOMERER.forEach(function (st) { NK.Form.bedstePar(st); });
        /* Kemichael roser kun én gang, og ikke hvis fanen er loest foer */
        this.rost = !!(NK.hent(NOEGLE, {}) || {}).loest;
        this.nytForsoeg();
        this.bygPanel();
        this.bygTilbud();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.visTrin();
    }

    var P = SimForm.prototype;

    P.nytForsoeg = function () {
        var mig = this;
        this.termo.saet(START);
        this.termo.roert = false;
        this.proever = D.ISOMERER.map(function (st) {
            return new NK.Proeve({ W: KASSE.W, H: KASSE.H, T: mig.termo.T, stoffer: [{ st: st, n: ANTAL }] });
        });
        this.raekke = [];
        this.trin = "gaet";
        this.gaettet = null;
        this.valgt = null;
        this.hvorforForkert = [];
        this.hvorforValgt = null;
        this.svarVist = false;
        this.hjaelp = 0;
        this.ventHvorfor = 0;
    };

    /* ----- Layout ------------------------------------------------------------------ */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var kant = NK.klamp(W * 0.014, 8, 16);
        lay.kant = kant;
        lay.bordY = Math.round(H * 0.9);
        /* Alt tegnes under papirkortet oeverst i scenen (js/skort.js) */
        var luft = this.skort.top();
        var titel = NK.klamp(H * 0.03, 16, 22);
        var raad = lay.bordY - luft - titel;

        /* Mikroniveauet er i centrum: de tre zoomvinduer fylder det meste,
           og glassene staar smaa i et lavt vandbad nederst, hvert under sit
           vindue. Termometeret staar hoejt til hoejre med kuglen nede i
           badet. */
        var tx = W - kant - 58;
        var gab = NK.klamp(W * 0.022, 12, 24);
        var R = NK.klamp(raad * 0.33, 100, 240);          /* badet med glas og balloner */
        var gh = R * 0.68, hBakke = gh * 0.5;
        var omr0 = kant, omr1 = tx - 42;
        var zb = (omr1 - omr0 - 2 * gab) / 3, zh = zb * KASSE.H / KASSE.W;
        var maksZh = raad - R - 24;
        if (zh > maksZh) { zh = maksZh; zb = zh * KASSE.W / KASSE.H; }
        var x0 = omr0 + (omr1 - omr0 - 3 * zb - 2 * gab) / 2;
        lay.zoom = [0, 1, 2].map(function (i) {
            return { x: Math.round(x0 + i * (zb + gab)), y: Math.round(luft + titel), b: Math.round(zb), h: Math.round(zh) };
        });
        lay.titel = titel;

        lay.bad = Tg.badMaal(lay.zoom[0].x, tx + 34, lay.bordY, hBakke);
        var B = lay.bad;
        lay.glas = lay.zoom.map(function (z) { return Tg.glasMaal(z.x + z.b / 2, B.glas.bund - 3, gh); });
        lay.termo = Tg.termoMaal(tx, B.glas.bund - 4, B.glas.bund - 4 - (luft + titel), D.T_FORM);
        lay.kop = { x: -200, y: lay.bordY };
        this.lay = lay;

        var z0 = lay.zoom[0], z2 = lay.zoom[2];
        this.saetAnker("form-anker-zoom", z0.x, z0.y - titel, z2.x + z2.b - z0.x, zh + titel);
        this.saetAnker("form-anker-bad", B.glas.x, lay.glas[0].top - 0.35 * gh, B.glas.b, lay.bordY - lay.glas[0].top + 0.35 * gh);
        this.saetAnker("form-anker-termometer", lay.termo.venstre - 6, lay.termo.top, lay.termo.b + 50, lay.termo.h);
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

    /* ----- Forloebet ------------------------------------------------------------------ */
    /* Et svar paa kortet eller et klik paa et glas vaelger kun gaettet */
    P.vaelg = function (i) {
        if (this.trin !== "gaet") return;
        this.valgt = i;
        this.visTrin();
    };

    /* Indsend svar: gaettet er sendt, og vandbadet kan varmes op */
    P.gaet = function (i) {
        if (this.trin !== "gaet") return;
        this.gaettet = i;
        this.valgt = i;
        this.trin = "varm";
        this.hjaelp = 0;
        if (this.afvisTilbud) this.afvisTilbud();
        this.besked("Dit gæt: <b>" + NK.html(D.ISOMERER[i].navn) + "</b>. Varm nu vandbadet op med termometeret.", "");
        this.visTrin();
    };

    /* Stoffer, der begynder at koge i samme billede (termometeret er
       trukket langt op i ét hug), kommer i raekke efter kogepunktet: det
       er den raekkefoelge, de ville koge i, hvis man varmede jaevnt op. */
    P.haendelser = function () {
        var mig = this, nye = [];
        this.proever.forEach(function (p, i) {
            p.hentHaendelser().forEach(function (h) {
                if (h.slags === "koge" && mig.raekke.indexOf(i) < 0 && nye.indexOf(i) < 0) nye.push(i);
            });
        });
        if (!nye.length) return;
        nye.sort(function (a, b) { return D.ISOMERER[a].kp - D.ISOMERER[b].kp; });
        this.kogt(nye);
    };

    /* Stofferne i glassene nye begynder at koge */
    P.kogt = function (nye) {
        var foer = this.raekke.length;
        this.raekke = this.raekke.concat(nye);
        if (this.trin === "gaet") {
            /* Kan kun ske, hvis vandbadet var varmt i forvejen */
            this.trin = "varm";
            this.hjaelp = 0;
        }
        if (foer === 0) {
            var i = this.raekke[0], st = D.ISOMERER[i];
            var tekst = st.Navn + " koger først, ved " + D.gradTekst(st.kp) + ".";
            if (this.gaettet === null) this.besked(NK.html(tekst), "");
            else if (this.gaettet === i) this.besked("Dit gæt var rigtigt. " + NK.html(tekst), "god");
            else this.besked("Du gættede " + NK.html(D.ISOMERER[this.gaettet].navn) + ". " + NK.html(tekst), "skidt");
        }
        if (this.raekke.length === 3) this.ventHvorfor = 1.4;
        this.visTabel();
        this.visTrin();
    };

    /* Indsend svar paa spoergsmaalet hvorfor */
    P.svarHvorfor = function (k, vist) {
        if (this.trin !== "hvorfor") return;
        var v = D.HVORFOR.valg[k];
        this.hvorforValgt = k;
        if (v.rigtig) {
            this.trin = "faerdig";
            this.hjaelp = 0;
            this.svarVist = !!vist;
            this.forklaring = v.svar;
            this.besked("", "");
            NK.gem(NOEGLE, { loest: true });
            if (!this.rost) {
                this.rost = true;
                this.ventRos = 0.8;
            }
        } else {
            if (this.hvorforForkert.indexOf(k) < 0) this.hvorforForkert.push(k);
            this.hvorforValgt = null;
            this.skort.fejl(NK.html(v.svar));
        }
        this.visTrin();
    };

    P.knap = function () {
        /* Til sidst: videre til spillet (R starter forsoeget forfra) */
        if (this.trin === "faerdig") {
            var fane3 = document.querySelector('[data-fane="fane-spil"]');
            if (fane3) fane3.click();
            return;
        }
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            var hint = this.trin === "gaet" ? D.FORM_HINT : (this.trin === "varm" ? D.FORM_VARM_HINT : D.HVORFOR.hint);
            this.skort.hintTekst(NK.html(hint), 1, 1);
            this.visTrin();
            return;
        }
        /* Vis svaret */
        if (this.trin === "gaet") {
            this.gaet(2);
            this.termo.roert = true;
            this.termo.animerTil(45, 8);
        } else if (this.trin === "varm") {
            this.termo.roert = true;
            this.termo.animerTil(45, 8);
        } else if (this.trin === "hvorfor") {
            this.svarHvorfor(0, true);
        }
        this.visTrin();
    };

    /* Papirkortets knapper (js/skort.js) */
    P.kortValg = function (j) {
        if (this.trin === "gaet") this.vaelg(j);
        else if (this.trin === "hvorfor" && this.hvorforForkert.indexOf(j) < 0) { this.hvorforValgt = j; this.visTrin(); }
    };
    P.kortIndsend = function () {
        if (this.trin === "gaet" && this.valgt !== null) this.gaet(this.valgt);
        else if (this.trin === "hvorfor" && this.hvorforValgt !== null) this.svarHvorfor(this.hvorforValgt);
    };
    P.kortHint = function () { if (this.trin !== "faerdig") this.knap(); };
    P.kortVidere = function () { if (this.trin === "faerdig") this.knap(); };

    P.nulstil = function () {
        this.nytForsoeg();
        this.besked("", "");
        this.visTabel();
        this.visTrin();
    };

    P.enter = function () {
        if (this.trin === "faerdig") this.knap();
        else this.kortIndsend();
    };

    P.fokus = function () {};

    P.tast = function (tast, e) {
        if (tast === "p" || tast === "P") {
            var pause = !this.proever[0].pause;
            this.proever.forEach(function (p) { p.pause = pause; });
            return true;
        }
        return this.termo.tast(tast, e && e.shiftKey);
    };

    /* ----- Panelet og kortet ------------------------------------------------------ */
    P.bygPanel = function () {
        var mig = this;
        this.skort = new NK.Skort("form", this, D.ZONE.form);
        this.el = { besked: NK.el("form-besked") };
        NK.el("form-beroering").addEventListener("click", function () { mig.visBeroering(); });
        NK.el("form-forfra").addEventListener("click", function () { mig.nulstil(); });
        this.visTabel();
    };

    P.besked = function (html, klasse) {
        if (this.skort) this.skort.besked(html, klasse);
    };

    /* Kortet oeverst i scenen */
    P.kortData = function () {
        var mig = this, t = this.trin;
        var d = { chip: { gaet: "Gæt", varm: "Varm op", hvorfor: "Spørgsmål", faerdig: "Spørgsmål" }[t] };
        if (t === "gaet") {
            d.tekst = "Tre glas med C₅H₁₂ står i vandbadet. " + D.FORM_SPM;
            d.svar = D.ISOMERER.map(function (st, i) {
                return { t: st.navn, prik: FARVER[i], kl: mig.valgt === i ? "valgt" : "" };
            });
        } else if (t === "varm") {
            d.tekst = this.raekke.length ? "Varm videre, til alle tre stoffer har kogt." :
                "Varm vandbadet op ved at trække i termometeret.";
        } else {
            d.tekst = D.HVORFOR.spm;
            d.svar = D.HVORFOR.valg.map(function (v, k) {
                var kl = "";
                if (t === "faerdig") kl = v.rigtig ? (mig.svarVist ? "svar-vist" : "rigtig") : "dim";
                else if (mig.hvorforForkert.indexOf(k) >= 0) kl = "forkert";
                else if (mig.hvorforValgt === k) kl = "valgt";
                return { t: v.t, kl: kl, laast: t === "faerdig" || mig.hvorforForkert.indexOf(k) >= 0 };
            });
            d.bogstaver = true;
        }
        if (t === "faerdig") {
            d.bliv = { html: NK.html(this.forklaring || ""), maerke: this.svarVist ? "Svaret" : "Rigtigt",
                       knap: "Videre til Hvem koger først? →", gul: this.svarVist };
            return d;
        }
        d.hint = this.hjaelp === 0 ? "Giv et hint" : "Vis svaret";
        if (t !== "varm") d.indsend = { tekst: "Indsend svar", klar: t === "gaet" ? this.valgt !== null : this.hvorforValgt !== null };
        return d;
    };

    P.visTrin = function () {
        if (this.skort) this.skort.vis();
    };

    P.visTabel = function () {
        var mig = this;
        var html = D.ISOMERER.map(function (st, i) {
            var nr = mig.raekke.indexOf(i);
            return '<div class="hyldelinje stille"><span class="hl-farve" style="background:' + FARVER[i] + '"></span>' +
                '<span class="hl-navn">' + NK.html(st.navn) + "<em>" + (nr >= 0 ? "koger som nr. " + (nr + 1) : "har ikke kogt") + "</em></span>" +
                '<span class="hl-tal">' + (nr >= 0 ? D.gradTekst(st.kp) : "?") + "</span></div>";
        }).join("");
        NK.saetHTML("form-tabel", html);
    };

    /* ----- Tegneloekken ------------------------------------------------------------------ */
    P.opdater = function (dt) {
        this.tid += dt;
        var mig = this;
        this.termo.opdater(dt);
        this.proever.forEach(function (p) {
            p.T = mig.termo.T;
            p.opdater(dt);
        });
        this.haendelser();
        if (this.ventHvorfor > 0) {
            this.ventHvorfor -= dt;
            if (this.ventHvorfor <= 0 && this.trin === "varm") {
                this.trin = "hvorfor";
                this.hjaelp = 0;
                this.visTrin();
            }
        }
        if (this.ventRos > 0) {
            this.ventRos -= dt;
            if (this.ventRos <= 0 && this.laererFaerdig) this.laererFaerdig();
        }
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
        this.skort.opdater(dt);
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var mig = this, B = lay.bad;
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 6);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.H + 10);

        /* Glassene i vandet og bakken over dem */
        this.proever.forEach(function (p, i) {
            var G = lay.glas[i], over = mig.over && mig.over.slags === "glas" && mig.over.i === i;
            var lys = over ? 1 : 0;
            if (mig.gaettet === i && mig.trin !== "gaet") lys = Math.max(lys, 0.5);
            Tg.glas(ctx, G, p.makro(), mig.tid, { ballonFarve: FARVER[i], lys: lys, udenBallon: true });
        });
        Tg.vandbad(ctx, B, this.tid, this.termo.T);
        this.proever.forEach(function (p, i) {
            var G = lay.glas[i];
            Tg.ballon(ctx, G.mund.x, G.mund.y, G.s, p.makro().ballon, mig.tid + i, FARVER[i], {});
        });

        /* Termometeret i vandbadet */
        var tr = this.traek;
        var hd = Tg.termometer(ctx, lay.termo, this.termo.T, {
            trin: 5, store: 10, tid: this.tid,
            haandtag: this.over && this.over.slags === "termo", traekker: tr && tr.slags === "termo",
            puls: this.trin === "varm" && !this.termo.roert
        });
        if (this.trin === "varm" && !this.termo.roert && !tr) Tg.traekPil(ctx, hd.x, hd.y, hd.r * 2 + 18, this.tid);

        /* Zoomvinduerne med navnet over */
        this.proever.forEach(function (p, i) {
            var z = lay.zoom[i], G = lay.glas[i], st = D.ISOMERER[i];
            var fra = { x: G.ind.x0, y: G.ind.bund - G.fuld - 4 * G.s, b: G.ind.x1 - G.ind.x0, h: G.fuld + 4 * G.s };
            Tg.zoomLinjerOp(ctx, fra, z);
            Tg.zoomKasse(ctx, z, p, { kontakter: true, lys: mig.over && mig.over.slags === "zoom" && mig.over.i === i ? 0.6 : 0 });
            /* Navnet med ballonens farve */
            var fs = NK.klamp(lay.titel * 0.72, 12, 15);
            ctx.save();
            ctx.fillStyle = FARVER[i];
            ctx.beginPath();
            ctx.arc(z.x + 7, z.y - lay.titel * 0.45, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            var nr = mig.raekke.indexOf(i);
            NK.tekst(ctx, st.navn + (nr >= 0 ? "   " + (nr + 1) + ". " + D.gradTekst(st.kp) : ""), z.x + 17, z.y - lay.titel * 0.45 + fs * 0.35,
                { font: Tg.font("700", fs), farve: nr >= 0 ? "#ffffff" : "#c8ced6" });
        });

        if (this.laererTegnOver) this.laererTegnOver(ctx);
    };

    /* ----- Den valgfrie boks: hvor molekylerne roerer hinanden ---------------
       To molekyler af hvert stof, lagt saa taet sammen, som de kan, med en
       prik hvert sted, de roerer hinanden. Aabnes kun med knappen. */
    P.visBeroering = function () {
        NK.el("beroering").classList.add("vis");
        var c = NK.el("beroering-laerred");
        if (!this.BL) this.BL = new NK.Laerred(c);
        this.BL.tilpas();
        var ctx = this.BL.ctx, W = this.BL.b, H = this.BL.h, del = W / 3;
        ctx.clearRect(0, 0, W, H);
        var fs = NK.klamp(W * 0.028, 12, 15);
        D.ISOMERER.forEach(function (st, i) {
            var cx = del * (i + 0.5);
            NK.tekst(ctx, st.navn, cx, 18, { font: Tg.font("700", fs), farve: FARVER[i], justering: "center" });
            var n = Tg.par(ctx, cx, H * 0.5, del * 0.8, H * 0.52, st);
            NK.tekst(ctx, "rører " + n + " steder", cx, H - 12, { font: Tg.font("700", fs), farve: "#fff176", justering: "center" });
        });
    };

    /* ----- Musen ---------------------------------------------------------------------------- */
    P.hvadErUnder = function (pt) {
        var lay = this.lay, i;
        if (!lay) return null;
        if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return { slags: "laerer" };
        if (this.termo.rammer(pt, lay.termo)) return { slags: "termo" };
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand && Math.abs(pt.x - lay.kop.x) < 30 && pt.y < lay.kop.y + 4 && pt.y > lay.kop.y - 60) return { slags: "kop" };
        for (i = 0; i < 3; i++) {
            var G = lay.glas[i];
            if (pt.x >= G.venstre - 6 && pt.x <= G.venstre + G.b + 6 && pt.y >= G.top - G.h * 0.35 && pt.y <= G.bund) return { slags: "glas", i: i };
        }
        for (i = 0; i < 3; i++) {
            var z = lay.zoom[i];
            if (pt.x >= z.x && pt.x <= z.x + z.b && pt.y >= z.y - lay.titel && pt.y <= z.y + z.h) return { slags: "zoom", i: i };
        }
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
                /* Under gaettet og spoergsmaalet er forsoeget laast */
                if (mig.trin === "gaet" || mig.trin === "hvorfor") { mig.skort.blink(); return; }
                if (mig.termo.start(pt, mig.lay.termo)) {
                    mig.traek = { slags: "termo" };
                    try { c.setPointerCapture(e.pointerId); } catch (x) { /* ikke vigtigt */ }
                }
                return;
            }
            if (u.slags === "laerer") { if (mig.laererKlik) mig.laererKlik(pt.x, pt.y); return; }
            if (u.slags === "kop") { if (mig.klikKop) mig.klikKop(); return; }
            var st = D.ISOMERER[u.i];
            if (mig.trin === "gaet") { mig.vaelg(u.i); return; }
            if (u.slags === "zoom") {
                mig.skort.kort(NK.html(st.Navn) + ", C₅H₁₂. Hver kugle er et C-atom med dets H-atomer. De gule prikker viser, hvor molekylerne rører hinanden.", 6);
            } else {
                var nr = mig.raekke.indexOf(u.i);
                mig.skort.kort(NK.html(st.Navn) + ", C₅H₁₂. " + (nr >= 0 ? NK.html(st.Navn) + " koger ved " + D.gradTekst(st.kp) + "." : NK.html(st.Navn) + " har ikke kogt endnu."), 5);
            }
        });
        c.addEventListener("pointermove", function (e) {
            var pt = mig.L.punkt(e);
            if (mig.traek) { mig.termo.flyt(pt, mig.lay.termo); c.style.cursor = "ns-resize"; return; }
            mig.over = mig.hvadErUnder(pt);
            var s = mig.over && mig.over.slags;
            c.style.cursor = !s ? "default" : (s === "termo" ? "ns-resize" : "pointer");
        });
        c.addEventListener("pointerleave", function () { if (!mig.traek) { mig.over = null; c.style.cursor = "default"; } });
        function slip() { if (mig.traek) { mig.termo.slip(); mig.traek = null; } }
        c.addEventListener("pointerup", slip);
        c.addEventListener("pointercancel", slip);
    };

    /* ----- Kemichaels praesentation ------------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc4.1-intro-form", tilbud: "form-tilbud" });

    NK.SimForm = SimForm;
}());
