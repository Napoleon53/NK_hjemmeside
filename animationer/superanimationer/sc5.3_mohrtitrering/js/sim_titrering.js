/* =====================================================================
   sim_titrering.js - fane 1: titreringen

   Kolben staar klar med 1,00 g havvand, 20 mL demineraliseret vand og
   lidt kaliumchromat paa magnetomroereren, og buretten er fyldt med
   0,050 M soelvnitrat til 0,00. Eleven aabner hanen med skyderen (eller
   et klik paa hanen), drypper til sidst og lukker, naar kolben bliver
   svagt roedbrun. Saa aflaeses buretten i luppen i panelet, og tallet
   foelger med til fane 2. Bygget som sc7.4's fane 1.

   Al soelvnitrat loeber i draaber paa 0,05 mL. Burettens niveau falder,
   naar en draabe slipper spidsen; kolbens rumfang, farven, kurven og
   luppen foelger, naar draaben rammer.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    var DRYP = 0.28;             /* skyderens "dryp": ca. 2 draaber i sekundet */
    var FART = 1.5;              /* mL/s med hanen helt aaben */
    var FALD = 0.3;              /* sekunder fra spidsen til overfladen */
    var TOM = 26.5;              /* mL: saa er buretten tom */
    var NOEGLE_ROS = "nk-sc5.3-ros-titrering";

    function SimTitrering() {
        this.L = new NK.Laerred(NK.el("tit-laerred"));
        this.tid = 0;
        this.lay = null;
        this.over = null;
        this.traek = null;
        this.lup = new NK.Lup();
        this.kurve = new NK.Kurve(NK.el("tit-kurve"));
        this.aflaes = new NK.Aflaes(NK.el("tit-aflaes"));
        this.g = { kaffekop: { skjult: false, iHaand: false } };
        this.nr = 0;
        this.bygPanel();
        this.bygTilbud();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.nyProeve();
    }

    var P = SimTitrering.prototype;

    /* ----- Proeven ------------------------------------------------------------------- */
    P.nyProeve = function (p, sted) {
        this.nr++;
        this.pr = K.nyProeve(p, sted);
        this.vAek = K.vAek(this.pr);
        this.vOmslag = K.vOmslag(this.pr);
        this.nUd = 0;              /* draaber, der har sluppet spidsen */
        this.nInd = 0;             /* draaber, der har ramt kolben */
        this.t = K.tilstand(this.pr, 0);
        this.acc = 0;
        this.a = 0;
        this.sidsteA = DRYP;
        this.draaber = [];
        this.skyer = [];
        this.loppe = 0;
        this.auto = null;
        this.fase = "titrer";      /* titrer, aflaes, faerdig */
        this.hjaelp = 0;
        this.aflaest = null;
        this.info = null;
        this.bemMork = false;
        this.bemTom = false;
        this.lup.nulstil();
        this.kurve.nulstil(this.vAek, K.nCl(this.pr));
        this.kurve.tilfoej(0, this.t.nClFri, 0, 0);
        if (this.laererNyt) this.laererNyt();
        this.besked("", "");
        this.bygFelt();
        this.visKort();
        this.visStatus();
    };

    P.vUd = function () { return this.nUd * K.DRAABE; };
    P.vInd = function () { return this.nInd * K.DRAABE; };
    P.styrke = function () { return K.styrke(this.t); };
    P.uklar = function () { return K.uklarhed(this.pr, this.t); };
    P.rodbrun = function () { return this.styrke() >= 0.04; };

    /* Hvor langt forbi aekvivalenspunktet (mL); negativ foer */
    P.forbi = function () { return this.vUd() - this.vAek; };

    /* Hvor mange Ag⁺-figurer luppen skal have: 1/8 af aekvivalens-
       rumfanget pr. figur, to mere ved omslaget og to mere, naar kolben er
       moerk roedbrun (chromatet, der ikke er i skala), og saa fri Ag⁺. */
    P.lupAg = function () {
        var v = this.vInd(), s = this.styrke();
        var k = Math.min(K.FIGURER, Math.floor(v / this.vAek * K.FIGURER + 1e-9));
        if (s >= 0.04) k += 2;
        if (s >= 0.9) {
            k += 2;
            k += NK.klamp(Math.floor((v - this.vAek) / (this.vAek / K.FIGURER)), 0, NK.Lup.FRI_MAKS);
        }
        return k;
    };

    /* ----- Hanen ---------------------------------------------------------------------- */
    P.saetHane = function (a) {
        a = NK.klamp(a, 0, 1);
        if (a < 0.02) a = 0;
        if (this.fase === "faerdig" && a > 0) {
            this.info = { tekst: "Prøven er færdig. Tryk på <b>Ny prøve</b> for at titrere igen.", tid: 4 };
            a = 0;
        }
        if (this.vUd() >= TOM - 1e-9) a = 0;
        if (a > 0) {
            this.sidsteA = a;
            if (this.afvisTilbud) this.afvisTilbud();
            this.auto = null;
        }
        this.a = a;
        this.visStatus();
    };

    P.skiftHane = function () {
        this.saetHane(this.a > 0 ? 0 : (this.sidsteA || DRYP));
    };

    /* Én draabe (knappen, D eller klik paa spidsen) */
    P.enDraabe = function () {
        if (this.fase === "faerdig") {
            this.info = { tekst: "Prøven er færdig. Tryk på <b>Ny prøve</b> for at titrere igen.", tid: 4 };
            return;
        }
        if (this.vUd() >= TOM - 1e-9) return;
        if (this.afvisTilbud) this.afvisTilbud();
        this.slip();
    };

    P.slip = function () {
        this.nUd++;
        this.draaber.push({ t: 0 });
    };

    /* En draabe rammer kolben */
    P.ramt = function () {
        this.nInd++;
        var v = this.vInd();
        this.t = K.tilstand(this.pr, v);
        this.kurve.tilfoej(v, this.t.nClFri, this.t.nAgCl, this.t.nCro);
        this.lup.saet(this.lupAg());
        /* En roedbrun sky, hvor draaben rammer. Den forsvinder, fordi Ag₂CrO₄
           bliver til AgCl, saa laenge der er Cl⁻. Taet paa omslaget bliver
           den laenge. */
        var naer = NK.klamp((v / this.vAek - 0.85) / 0.15, 0, 1);
        if (v < this.vAek && this.skyer.length < 40) {
            this.skyer.push({ u: NK.r(-0.15, 0.15), w: 0, alder: 0, liv: 0.35 + 2.4 * naer * naer, retning: Math.random() < 0.5 ? -1 : 1 });
        }
        if (this.forbi() > 1.0 && !this.bemMork) {
            this.bemMork = true;
            if (this.laererReplik) this.laererReplik(D.BEM_MORK);
        }
    };

    /* ----- Tegneloekken: draaberne ------------------------------------------------------ */
    P.opdaterFlow = function (dt) {
        /* Vis svaret: hurtigt til taet paa, saa draabe for draabe til omslaget */
        if (this.auto) {
            var au = this.auto;
            au.ur -= dt;
            var maal = Math.ceil(this.vOmslag / K.DRAABE - 1e-9);
            if (this.nUd >= maal) {
                this.auto = null;
                this.a = 0;
            } else if (au.ur <= 0) {
                var langt = (maal - this.nUd) * K.DRAABE > 0.4;
                this.a = langt ? 0.8 : DRYP;
                au.ur = langt ? 0.02 : 0.28;
                this.slip();
            }
        } else if (this.a > 0) {
            if (this.vUd() >= TOM - 1e-9) {
                this.a = 0;
                if (!this.bemTom) {
                    this.bemTom = true;
                    if (this.laererReplik) this.laererReplik(D.BEM_TOM, true);
                }
            } else {
                this.acc += FART * this.a * this.a * dt;
                while (this.acc >= K.DRAABE && this.vUd() < TOM - 1e-9) {
                    this.acc -= K.DRAABE;
                    this.slip();
                }
            }
        } else {
            this.acc = 0;
        }

        var mig = this;
        this.draaber = this.draaber.filter(function (d) {
            d.t += dt / FALD;
            if (d.t >= 1) { mig.ramt(); return false; }
            return true;
        });

        this.skyer = this.skyer.filter(function (s) {
            s.alder += dt;
            s.u += s.retning * dt * 0.35;
            s.w = Math.min(1, s.w + dt * 0.5);
            return s.alder < s.liv;
        });

        this.loppe += dt * 9;
    };

    /* ----- Faserne --------------------------------------------------------------------- */
    P.tjekFase = function () {
        if (this.fase !== "titrer") return;
        if (this.a === 0 && !this.auto && this.draaber.length === 0 && this.rodbrun()) {
            this.fase = "aflaes";
            this.hjaelp = 0;
            this.besked("", "");
            this.bygFelt();
            this.visKort();
            this.fokus();
        }
    };

    /* ----- Aflaesningen ---------------------------------------------------------------- */
    P.tjekAflaesning = function () {
        var inp = this.el.felt.querySelector("input");
        if (!inp) return;
        var svar = NK.Tjek.aflaesning(inp.value, this.vUd(), D.AFLAES_TOL);
        if (svar.ok) {
            this.godkend(NK.Tjek.tal(inp.value).v, false);
            return;
        }
        this.besked(NK.html(svar.besked), svar.tom ? "gul" : "skidt");
        var fe = this.el.felt.querySelector(".felt");
        if (fe && !svar.tom) {
            fe.classList.remove("ryst");
            void fe.offsetWidth;
            fe.classList.add("ryst");
        }
    };

    P.godkend = function (v, vist) {
        this.aflaest = v;
        this.fase = "faerdig";
        var over = this.forbi();
        var tekst;
        if (over <= D.PRAECIS + 1e-9) tekst = "Forbruget er " + K.mL(v) + " mL. Kolben blev rødbrun på den sidste dråbe.";
        else if (over <= D.LIDT_FOR_LANGT) tekst = "Forbruget er " + K.mL(v) + " mL. Kolben er tydeligt rødbrun, så der kom lidt for meget sølvnitrat i.";
        else tekst = "Forbruget er " + K.mL(v) + " mL. Kolben er mørk rødbrun: omslaget kom tidligere, så forbruget er for stort.";
        this.besked((vist ? "<b>Svar:</b> " : "") + NK.html(tekst), vist ? "gul" : "god");
        NK.maaling = { V: v, m: this.pr.m, c: this.pr.c, p: this.pr.p, sted: this.pr.sted, egen: true, over: over, nr: this.nr, brugt: false };
        if (this.afvisTilbud) this.afvisTilbud();
        this.bygFelt();
        this.visKort();
        this.visStatus();
        if (!vist && over <= D.PRAECIS + 1e-9 && !NK.hent(NOEGLE_ROS, false)) {
            NK.gem(NOEGLE_ROS, true);
            this.ventRos = 1.0;
        }
    };

    /* ----- Knappen: Giv hint -> Vis svaret -> Til beregningen ------------------------ */
    P.knap = function () {
        if (this.fase === "faerdig") {
            if (NK.visFane) NK.visFane("fane-beregning");
            return;
        }
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.besked("<b>Hint:</b> " + NK.html(this.fase === "titrer" ? D.TITRER_HINT : D.AFLAES_HINT), "gul");
            this.visKort();
            return;
        }
        if (this.fase === "titrer") {
            /* Vis svaret: buretten titrerer selv til omslaget */
            if (this.rodbrun()) { this.a = 0; return; }
            this.auto = { ur: 0 };
            this.a = 0.8;
            this.hjaelp = 0;
            this.besked("Se buretten. Den drypper til sidst og stopper, når kolben bliver rødbrun.", "gul");
            this.visKort();
            return;
        }
        this.godkend(Math.round(this.vUd() * 100) / 100, true);
    };

    P.nulstil = function () {
        this.nyProeve();
    };

    /* ----- Panelet --------------------------------------------------------------------- */
    P.bygPanel = function () {
        var mig = this;
        this.el = {
            knap: NK.el("tit-knap"),
            besked: NK.el("tit-besked"),
            kort: NK.el("tit-kort"),
            felt: NK.el("tit-felt")
        };
        this.el.knap.addEventListener("click", function () { mig.knap(); });
        NK.el("tit-spring").addEventListener("click", function () { mig.springIntro(); });
        NK.el("tit-nulstil").addEventListener("click", function () { mig.nulstil(); });
    };

    P.bygFelt = function () {
        var mig = this, vaert = this.el.felt;
        if (this.fase === "titrer") { vaert.innerHTML = ""; return; }
        if (this.fase === "faerdig") {
            vaert.innerHTML = '<div class="felt ok"><span class="felt-pre">V(AgNO₃) =</span><span class="felt-svar"><b>' +
                K.mL(this.aflaest) + '</b> mL</span><span class="felt-maerke">✓</span></div>';
            return;
        }
        vaert.innerHTML = '<div class="felt aktiv"><span class="felt-pre">V(AgNO₃) =</span>' +
            '<input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" aria-label="Forbruget i mL" placeholder="aflæs buretten">' +
            '<span class="felt-efter">mL</span><button type="button" class="felt-ok" aria-label="Tjek svaret" tabindex="-1">↵</button></div>';
        var inp = vaert.querySelector("input");
        inp.addEventListener("keydown", function (e) {
            if (e.key === "Enter") { e.preventDefault(); mig.tjekAflaesning(); }
        });
        vaert.querySelector(".felt-ok").addEventListener("click", function () { mig.tjekAflaesning(); });
    };

    P.fokus = function () {
        var inp = this.el.felt.querySelector("input");
        if (inp && NK.el("fane-titrering").classList.contains("aktiv") &&
            !document.querySelector(".overlay.vis") && !(NK.Rundvisning && NK.Rundvisning.aktiv())) {
            try { inp.focus({ preventScroll: true }); } catch (e) { inp.focus(); }
        }
    };

    P.besked = function (html, klasse) {
        this.el.besked.innerHTML = html;
        this.el.besked.className = "besked" + (klasse ? " " + klasse : "");
    };

    P.visKort = function () {
        NK.saetTekst("tit-titel", "Prøve " + this.nr);
        NK.saetTekst("tit-sted", this.pr.sted + ", " + NK.tal2(this.pr.m) + " g");
        var prompt, tekst, klasse = "knap";
        if (this.fase === "titrer") {
            prompt = "Titrér havvandet, til kolben bliver svagt rødbrun.";
            tekst = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
        } else if (this.fase === "aflaes") {
            prompt = "Aflæs buretten. Hvor meget sølvnitrat er løbet ned?";
            tekst = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
        } else {
            prompt = "Forbruget er aflæst.";
            tekst = "Til beregningen →";
            klasse = "knap blaa banker";
        }
        NK.saetTekst("tit-prompt", prompt);
        this.el.knap.textContent = tekst;
        this.el.knap.className = klasse;
        this.el.kort.classList.toggle("sejr", this.fase === "faerdig");
    };

    P.visStatus = function () {
        var t;
        var v = this.vUd();
        if (this.info && this.info.tid > 0) t = this.info.tekst;
        else if (this.fase === "faerdig") t = "Forbruget er " + K.mL(this.aflaest) + " mL. Gå videre til beregningen, eller tag en <b>ny prøve</b>.";
        else if (this.fase === "aflaes") t = "Kolben er " + K.farveOrd(this.styrke(), this.uklar()) + ". Aflæs buretten i luppen til højre, og skriv forbruget.";
        else if (this.auto) t = "Buretten titrerer selv. Hurtigt først, så dråbe for dråbe.";
        else if (this.rodbrun() && this.a > 0) t = "<b>Luk hanen!</b> Kolben er rødbrun.";
        else if (this.rodbrun()) t = "Kolben er rødbrun.";
        else if (this.a > 0 && this.skyer.some(function (s) { return s.liv > 1.2; })) {
            t = this.a > 0.45 ? "De rødbrune skyer bliver længere. Træk skyderen ned på <b>dryp</b>." :
                "Du er tæt på. Luk hanen, så snart kolben bliver svagt rødbrun og bliver ved med at være det.";
        }
        else if (this.a > 0) t = "Sølvnitrat løber ned. Hvidt sølvchlorid gør kolben uklar. Luk hanen, når den bliver rødbrun.";
        else if (v > 0) t = "Kolben er gul og uklar. Der er stadig chlorid tilbage. Åbn hanen igen.";
        else t = "Træk skyderen ved hanen mod højre for at åbne den.";
        NK.saetHTML("tit-status", t);
    };

    /* ----- Layout ---------------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var kant = NK.klamp(W * 0.014, 8, 16);
        lay.bordY = Math.round(H - NK.klamp(H * 0.1, 30, 70));
        var topY = NK.klamp(H * 0.035, 10, 28);
        var cx = NK.klamp(W * 0.33, 170, 360);
        var g = Tg.opstilling(cx, lay.bordY, topY, 1.1);
        lay.g = g;
        lay.px = NK.klamp(W * 0.014, 12, 14);

        /* Skyderen til hoejre for hanen og knappen til én draabe under den */
        var sb = NK.klamp(W * 0.15, 130, 170);
        var x0 = g.hane.x + 34 * g.s + 22;
        lay.skyder = { x0: x0, x1: x0 + sb, y: g.hane.y, px: 13 };
        lay.draabe = { x: x0 - 12, y: g.hane.y + 40, b: 86, h: 28, px: 13 };
        var hoejre = Math.max(lay.skyder.x1 + 22, lay.draabe.x + lay.draabe.b);

        /* Luppen til hoejre for det hele, eller over skyderen, hvis der er
           mere plads dér (smalle skaerme) */
        var R = Math.min((W - kant - hoejre - 36) / 2, (lay.bordY - topY - 90) / 2, 215);
        var venstre = cx + 30 * g.s + 24;
        var R2 = Math.min((W - kant - venstre - 12) / 2, (lay.skyder.y - 30 - topY - 40) / 2, 215);
        var lx, ly;
        if (R2 > R + 10) {
            R = Math.max(R2, 64);
            lx = Math.min(W - kant - R - 8, venstre + R + (W - kant - venstre - 2 * R) / 2);
            ly = topY + 30 + R;
        } else {
            R = Math.max(R, 64);
            lx = Math.min(W - kant - R - 8, Math.max(hoejre + 30 + R, (hoejre + W) / 2));
            ly = NK.klamp((topY + lay.bordY) / 2 - 16, topY + R + 34, lay.bordY - R - 44);
        }
        lay.lup = { cx: lx, cy: ly, R: R };

        /* Flasken med havvand foran stativets fod og koppen yderst */
        var eh = NK.klamp(g.s * 160, 70, 150);
        lay.flaske = { cx: Math.max(kant + 90, g.stang.x - 44 * g.s - 42), bund: lay.bordY, h: eh };
        lay.kop = { x: kant + 22, y: lay.bordY };
        this.lay = lay;

        this.saetAnker("tit-anker-buret", g.buret.x - 6, g.buret.y, 60 * g.s + 30, g.bunden - g.buret.y);
        this.saetAnker("tit-anker-hane", g.hane.x - 26 * g.s, g.hane.y - 22, hoejre - g.hane.x + 30 * g.s, 94);
        this.saetAnker("tit-anker-kolbe", g.kolbe.x, g.kolbe.y, 150 * g.k, lay.bordY - g.kolbe.y);
        this.saetAnker("tit-anker-lup", lx - R - 8, ly - R - 34, 2 * R + 16, 2 * R + 70);
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

    /* ----- Opdater og tegn ---------------------------------------------------------------- */
    P.opdater = function (dt) {
        this.tid += dt;
        this.opdaterFlow(dt);
        this.lup.opdater(dt);
        this.tjekFase();
        if (this.info) {
            this.info.tid -= dt;
            if (this.info.tid <= 0) this.info = null;
        }
        if (this.ventRos > 0) {
            this.ventRos -= dt;
            if (this.ventRos <= 0 && this.laererReplik) this.laererReplik(D.ROS_TITRERING, true);
        }
        this.visStatus();
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var g = lay.g, puls = 0.55 + 0.45 * Math.sin(this.tid * 6);
        var styrke = this.styrke(), uklar = this.uklar();
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 12);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.H);

        /* Koppen */
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand) {
            var kk = NK.klamp(lay.H / 600, 0.8, 1.3);
            NK.Sprites.tegn(ctx, "kaffekop", lay.kop.x - 18 * kk, lay.kop.y - 40 * kk, 42 * kk, 40 * kk);
        }

        /* Flasken med havvand */
        var e = lay.flaske;
        Tg.havvand(ctx, e.cx, e.bund, e.h, [
            { t: "Havvand", px: NK.klamp(e.h * 0.1, 12, 15) },
            { t: "? %", px: NK.klamp(e.h * 0.1, 12, 15), farve: "#2f74b5" }
        ], { lys: this.over && this.over.slags === "flaske" ? 0.7 : 0 });

        /* Opstillingen */
        Tg.stativ(ctx, g);
        Tg.omroerer(ctx, g);
        var mL = this.pr.vand + this.pr.m + K.V_IND + this.vInd();
        var ov = Tg.kolbeOverflade(g, mL);
        var bundY = g.kolbe.y + 190 * g.k;
        var skyer = this.skyer.map(function (s) {
            var fade = 1 - NK.klamp((s.alder - s.liv * 0.6) / (s.liv * 0.4), 0, 1);
            return {
                x: g.cx + s.u * 50 * g.k,
                y: ov + 6 * g.k + s.w * (bundY - ov) * 0.55,
                r: (12 + 26 * Math.min(1, s.alder / 0.8)) * g.k,
                a: fade
            };
        });
        Tg.kolbe(ctx, g, mL, K.kolbeFarve(uklar, styrke), this.loppe, skyer,
            { lys: this.over && this.over.slags === "kolbe" ? 0.6 : 0, fnug: uklar });

        /* Straalen eller draaberne */
        var q = this.auto ? (this.a > 0.5 ? 1 : 0) : this.a * this.a;
        if (q > 0.35) Tg.straale(ctx, g, ov, NK.klamp((q - 0.35) / 0.65, 0, 1));
        var draaber = this.draaber.map(function (d) {
            return { x: g.spids.x, y: g.spids.y + (ov - g.spids.y) * d.t * d.t };
        });
        Tg.draaber(ctx, draaber, g);

        var overHane = this.over && (this.over.slags === "hane" || this.over.slags === "skyder");
        Tg.buret(ctx, g, this.vUd(), this.a, {
            lys: this.over && this.over.slags === "buret" ? 0.6 : 0,
            haneLys: overHane,
            etiket: "AgNO₃ " + K.c(this.pr.c) + " M"
        });

        /* Keglen og luppen */
        var L = lay.lup;
        Tg.zoomKegle(ctx, g.cx + 22 * g.k, ov + 14 * g.k, L.cx, L.cy, L.R);

        /* Skyderen og knappen til én draabe */
        var vent = this.fase === "titrer" && !this.auto && this.vUd() === 0 && this.a === 0;
        var lukNu = this.fase === "titrer" && this.a > 0 && this.rodbrun();
        Tg.skyder(ctx, lay.skyder, this.a, DRYP, {
            lys: this.over && this.over.slags === "skyder" || !!this.traek,
            puls: vent || lukNu || this.pegHane ? puls : 0
        });
        Tg.pilleKnap(ctx, lay.draabe, "1 dråbe", {
            lys: this.over && this.over.slags === "draabe",
            slukket: this.fase === "faerdig"
        });

        this.lup.tegn(ctx, L.cx, L.cy, L.R, { farve: K.kolbeFarve(uklar, styrke, 0.1 + 0.3 * Math.max(uklar * 0.5, styrke)), lys: this.pegLup ? puls : 0 });
        var px = lay.px;
        NK.tekst(ctx, "1 figur = 1/8 af chloridet", L.cx, L.cy - L.R - 12, {
            font: Tg.font("700", px), justering: "center", farve: "#c8ced6", kant: true
        });
        var tilbage = this.lup.clTilbage();
        var linje;
        if (tilbage > 0) linje = "Chlorid tilbage: " + tilbage + " af " + K.FIGURER;
        else if (this.lup.friAg() > 0 && this.lup.ag2cro4() > 0) linje = "Alt chlorid er fældet. Ag⁺ er i overskud.";
        else if (this.lup.ag2cro4() > 0) linje = "Alt chlorid er fældet. Ag⁺ fælder nu chromat.";
        else linje = "Alt chlorid er fældet.";
        NK.tekst(ctx, linje, L.cx, L.cy + L.R + 12, {
            font: Tg.font("700", px), justering: "center", linje: "top",
            farve: tilbage > 0 ? "#dde3ea" : "#f3b08c", kant: true
        });

        if (this.laererTegnOver) this.laererTegnOver(ctx);

        /* Panelets to laerreder */
        this.aflaes.tegn(this.vUd(), { lys: this.fase === "aflaes" && this.hjaelp > 0 ? puls : 0 });
        this.kurve.tegn();
    };

    /* ----- Musen -------------------------------------------------------------------------- */
    P.hvadErUnder = function (pt) {
        var lay = this.lay;
        if (!lay) return null;
        var g = lay.g;
        if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return { slags: "laerer" };
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand && Math.abs(pt.x - lay.kop.x) < 30 && pt.y < lay.kop.y + 4 && pt.y > lay.kop.y - 60) return { slags: "kop" };
        var sk = lay.skyder;
        if (pt.x >= sk.x0 - 16 && pt.x <= sk.x1 + 16 && Math.abs(pt.y - sk.y) <= 16) return { slags: "skyder" };
        var d = lay.draabe;
        if (pt.x >= d.x && pt.x <= d.x + d.b && pt.y >= d.y && pt.y <= d.y + d.h) return { slags: "draabe" };
        if (Math.abs(pt.x - g.hane.x - 10 * g.s) <= 26 * g.s + 6 && Math.abs(pt.y - g.hane.y) <= 16 * g.s + 6) return { slags: "hane" };
        if (Math.abs(pt.x - g.cx) <= 16 * g.s + 4 && pt.y >= g.hane.y && pt.y <= g.spids.y + 4) return { slags: "draabe" };
        if (Math.abs(pt.x - g.cx) <= 18 * g.s + 6 && pt.y >= g.buret.y && pt.y < g.hane.y) return { slags: "buret" };
        if (pt.x >= g.kolbe.x + 8 * g.k && pt.x <= g.kolbe.x + 142 * g.k && pt.y >= g.kolbe.y && pt.y <= g.pladeY) return { slags: "kolbe" };
        var L = lay.lup, dx = pt.x - L.cx, dy = pt.y - L.cy;
        if (dx * dx + dy * dy <= L.R * L.R) return { slags: "lup" };
        var e = lay.flaske, eb = e.h * 70 / 150;
        if (Math.abs(pt.x - e.cx) <= eb / 2 && pt.y <= e.bund && pt.y >= e.bund - e.h) return { slags: "flaske" };
        return null;
    };

    P.skyderA = function (x) {
        var sk = this.lay.skyder;
        return (x - sk.x0) / (sk.x1 - sk.x0);
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointerdown", function (e) {
            var pt = mig.L.punkt(e);
            var u = mig.hvadErUnder(pt);
            if (!u || u.slags !== "skyder") return;
            if (mig.fase === "faerdig") { mig.saetHane(1); return; }
            mig.traek = { start: pt };
            mig.saetHane(mig.skyderA(pt.x));
            try { c.setPointerCapture(e.pointerId); } catch (x) { /* ikke vigtigt */ }
        });
        c.addEventListener("pointermove", function (e) {
            var pt = mig.L.punkt(e);
            if (mig.traek) {
                mig.saetHane(mig.skyderA(pt.x));
                c.style.cursor = "grabbing";
                return;
            }
            mig.over = mig.hvadErUnder(pt);
            var s = mig.over && mig.over.slags;
            c.style.cursor = s === "skyder" ? "grab" : (s ? "pointer" : "default");
        });
        c.addEventListener("pointerleave", function () { if (!mig.traek) { mig.over = null; c.style.cursor = "default"; } });
        c.addEventListener("pointercancel", function () { mig.traek = null; });
        c.addEventListener("pointerup", function (e) {
            var pt = mig.L.punkt(e);
            if (mig.traek) {
                mig.traek = null;
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
        var s = u.slags;
        if (s === "kop" && this.klikKop) { this.klikKop(); return; }
        if (s === "hane") { this.skiftHane(); return; }
        if (s === "draabe") { this.enDraabe(); return; }
        var tekst = {
            buret: "Sølvnitrat, AgNO₃, " + K.c(this.pr.c) + " M. Forbruget aflæses ved menisken i luppen til højre.",
            kolbe: NK.tal2(this.pr.m) + " g havvand, 20 mL demineraliseret vand og lidt kaliumchromat, der farver kolben gul. Magnetloppen rører rundt.",
            lup: "1 figur = 1/8 af chloridet i kolben. Hver Ag⁺ fælder én Cl⁻ som hvidt AgCl. Na⁺ og NO₃⁻ er ikke tegnet: de reagerer ikke.",
            flaske: "Havvand fra " + this.pr.sted + ". Saltindholdet er ukendt. Det skal du finde."
        }[s];
        if (tekst) {
            this.info = { tekst: tekst, tid: 5 };
            this.visStatus();
        }
    };

    /* Tastaturet: mellemrum aabner og lukker, D er én draabe, pilene skruer */
    P.tast = function (e) {
        if (e.key === " ") { this.skiftHane(); return true; }
        if (e.key === "d" || e.key === "D") { this.enDraabe(); return true; }
        if (e.key === "ArrowRight") { this.saetHane(this.a + 0.05); return true; }
        if (e.key === "ArrowLeft") { this.saetHane(this.a - 0.05); return true; }
        return false;
    };

    P.enter = function () {
        if (this.fase === "faerdig") this.knap();
    };

    /* ----- Kemichaels praesentation ------------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc5.3-intro-titrering", tilbud: "tit-tilbud", spring: "tit-spring" });

    /* Mens han siger, hvad man goer, banker skyderen */
    P.pegPaaFelt = function (til) { this.pegHane = til; };

    NK.SimTitrering = SimTitrering;
}());
