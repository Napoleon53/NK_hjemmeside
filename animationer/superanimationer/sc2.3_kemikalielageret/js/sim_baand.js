/* =====================================================================
   sim_baand.js - fane 2: samlebaandet

   De samme 30 stoffer som paa lageret, men paa tid. Glassene kører
   ind fra venstre med halvdelen af etiketten. Man skriver den anden
   halvdel paa etiketmaskinen og trykker Enter: svaret gaelder altid det
   forreste glas. Rigtigt: maskinen printer etiketten, og glasset ryger
   op paa hylden. Naar et glas naar enden, falder det i kassen, og man
   mister et liv. Tre glas i kassen, og spillet er slut.

   Et forkert svar koster ikke et liv, men stimen. Beskeden er den
   samme som paa lageret (js/tjek.js), saa fejlen stadig bliver
   forklaret.

   Niveauerne foelger hylderne: foerst formler, saa navne, saa de
   sammensatte ioner, og derefter det hele blandet i begge retninger og
   hurtigere og hurtigere. Rekorden huskes i browseren.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;
    var Tj = NK.Tjek;

    var NOEGLE = "nk-sc2.3-baand";
    var PR_NIVEAU = 5;          /* rigtige svar, foer niveauet stiger */
    var LIV = 3;

    var NIVEAUER = [
        { navn: "Skriv formlen", hylde: 0, retning: "formel", tid: 34, max: 2 },
        { navn: "Skriv navnet", hylde: 1, retning: "navn", tid: 34, max: 2 },
        { navn: "Sammensatte ioner", hylde: 2, retning: null, tid: 32, max: 2 },
        { navn: "Det hele blandet", hylde: null, retning: "begge", tid: 28, max: 3 }
    ];

    /* Tiden er den tid, et glas er om at koere hele baandet igennem */
    function niveau(n) {
        if (n < NIVEAUER.length) return NIVEAUER[n];
        var b = NIVEAUER[NIVEAUER.length - 1];
        return { navn: b.navn, hylde: null, retning: "begge", tid: Math.max(12, b.tid * Math.pow(0.88, n - NIVEAUER.length + 1)), max: 3 };
    }

    function SimBaand() {
        this.L = new NK.Laerred(NK.el("baand-laerred"));
        this.input = NK.el("baand-input");
        this.tid = 0;
        this.fase = 0;
        this.taster = [];
        this.floats = [];
        this.banner = null;
        this.rekord = NK.hent(NOEGLE, { rekord: 0 }).rekord || 0;
        this.lay = null;
        this.fokuseret = false;
        this.nulstilSpil();
        this.koblInput();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.visPanel();
    }

    var P = SimBaand.prototype;

    P.nulstilSpil = function () {
        this.tilstand = "klar";
        this.point = 0;
        this.stime = 0;
        this.liv = LIV;
        this.nivNr = 0;
        this.rigtigeINiveau = 0;
        this.rigtigeIalt = 0;
        this.glas = [];
        this.paaHylden = [];
        this.iKassen = [];
        this.pose = [];
        this.sidste = null;
        this.floats = [];
        this.banner = null;
        this.nyRekord = false;
        this.besked("", "");
        if (this.input) this.input.value = "";
        var liste = NK.el("baand-kasseliste");
        if (liste) liste.innerHTML = "";
        var kort = NK.el("baand-kasse-kort");
        if (kort) kort.hidden = true;
    };

    /* ----- Layout ------------------------------------------------------------- */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        lay.bordY = Math.round(H * 0.93);
        /* Glassene paa hylden er store nok til, at navnet kan laeses */
        lay.lilleH = NK.klamp(H * 0.19, 70, 150);
        lay.hyldeY = Math.round(Math.max(H * 0.2, lay.lilleH + 14));
        lay.baandY = Math.round(H * 0.56);
        lay.x0 = 0;
        lay.x1 = Math.round(W * 0.8);
        lay.glasH = NK.klamp(Math.min(H * 0.26, W * 0.2, lay.baandY - lay.hyldeY - 70), 100, 185);
        lay.glasB = Tg.glasBredde(lay.glasH);

        var kb = NK.klamp(W * 0.17, 120, 200), kk = kb / 170;
        lay.kasse = { x: W - kb - Math.max(8, W * 0.012), y: lay.baandY + 30 - 34 * kk, b: kb };
        lay.kasseBund = lay.kasse.y + 130 * kk;

        var mb = NK.klamp(W * 0.36, 250, 380);
        var mh = mb * 150 / 240;
        lay.maskine = { x: Math.max(12, W * 0.4 - mb / 2), y: lay.bordY - mh * 0.95, b: mb };
        this.lay = lay;

        /* Det usynlige indtastningsfelt ligger oven paa displayet */
        var mm = Tg.maskineMaal(lay.maskine.x, lay.maskine.y, mb);
        var e = NK.el("baand-lcd");
        e.style.left = Math.round(mm.lcd.x) + "px";
        e.style.top = Math.round(mm.lcd.y) + "px";
        e.style.width = Math.round(mm.lcd.b) + "px";
        e.style.height = Math.round(mm.lcd.h) + "px";

        var bb = NK.el("baand-besked");
        var bx = lay.maskine.x + mb + 16;
        var bredde = W - bx - 14;
        if (bredde < 170) {
            bb.style.left = "14px";
            bb.style.width = Math.max(160, W - 28) + "px";
            bb.style.top = Math.round(lay.baandY + 26) + "px";
        } else {
            bb.style.left = Math.round(bx) + "px";
            bb.style.width = Math.round(bredde) + "px";
            bb.style.top = Math.round(Math.max(lay.kasseBund + 12, lay.maskine.y + 8)) + "px";
        }

        this.saetAnker("baand-anker-baand", 0, lay.baandY - lay.glasH - 30, lay.x1, lay.glasH + 60);
        this.saetAnker("baand-anker-kasse", lay.kasse.x - 6, lay.kasse.y - 6, kb + 12, lay.kasseBund - lay.kasse.y + 12);
        this.saetAnker("baand-anker-hylde", 8, lay.hyldeY - lay.lilleH - 8, W - 16, lay.lilleH + 24);
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

    /* ----- Panelet ------------------------------------------------------------- */
    P.visPanel = function () {
        NK.saetTekst("baand-point", String(this.point));
        NK.saetTekst("baand-rekord", String(this.rekord));
        NK.saetTekst("baand-niveau", (this.nivNr + 1) + " · " + niveau(this.nivNr).navn);
        NK.saetTekst("baand-stime", "×" + this.gange());
        var hjerter = "";
        for (var i = 0; i < LIV; i++) hjerter += i < this.liv ? "♥" : "♡";
        NK.saetTekst("baand-liv", hjerter);
        var knap = NK.el("baand-knap");
        var tekst = { klar: "Start samlebåndet", koerer: "Pause", pause: "Fortsæt", slut: "Spil igen" }[this.tilstand];
        NK.saetHTML("baand-knap", "<span>" + tekst + "</span><span class=\"tegn\">" +
            (this.tilstand === "koerer" ? "❚❚" : "▶") + "</span>");
        knap.classList.toggle("banker", this.tilstand === "klar" || this.tilstand === "slut");
        knap.classList.toggle("blaa", this.tilstand !== "koerer");
    };

    P.besked = function (html, klasse) {
        var e = NK.el("baand-besked");
        if (!e) return;
        e.innerHTML = html;
        e.className = "baand-besked" + (klasse ? " " + klasse : "") + (html ? "" : " tom");
    };

    P.gange = function () {
        return Math.min(5, 1 + Math.floor(this.stime / 3));
    };

    /* ----- Spillets gang ----------------------------------------------------- */
    P.knap = function () {
        if (this.tilstand === "koerer") this.tilstand = "pause";
        else if (this.tilstand === "pause") this.tilstand = "koerer";
        else this.start();
        this.visPanel();
        this.fokus();
    };

    P.start = function () {
        this.springIntro();
        this.nulstilSpil();
        this.tilstand = "koerer";
        this.visBanner();
        this.visPanel();
        this.fokus();
    };

    P.nulstil = function () {
        this.nulstilSpil();
        this.visPanel();
    };

    P.visBanner = function () {
        this.banner = { tekst: "Niveau " + (this.nivNr + 1) + " · " + niveau(this.nivNr).navn, t: 0 };
    };

    /* Naeste stof: fra en blandet pose, saa alle kommer, foer nogen
       kommer igen */
    P.traek = function () {
        var n = niveau(this.nivNr);
        var svaer = NK.indstil.svaer;
        if (!this.pose.length || this.pose.niv !== this.nivNr || this.pose.svaer !== svaer) {
            var liste = D.aktive(svaer).filter(function (st) { return n.hylde === null || st.hylde === n.hylde; });
            this.pose = NK.bland(liste);
            this.pose.niv = this.nivNr;
            this.pose.svaer = svaer;
            if (this.pose.length > 1 && this.pose[this.pose.length - 1] === this.sidste) this.pose.unshift(this.pose.pop());
        }
        var st = this.pose.pop();
        this.sidste = st;
        var retning = n.retning === "begge" ? (Math.random() < 0.5 ? "formel" : "navn") : (n.retning || st.retning);
        return { st: st, retning: retning };
    };

    P.forreste = function () {
        var bedst = null;
        this.glas.forEach(function (g) {
            if (g.status === "paa" && (!bedst || g.x > bedst.x)) bedst = g;
        });
        return bedst;
    };

    P.tjek = function () {
        if (this.tilstand !== "koerer") { this.knap(); return; }
        var g = this.forreste();
        if (!g) return;
        var raa = this.input.value;
        var res = g.retning === "formel" ? Tj.formel(raa, g.st) : Tj.navn(raa, g.st);
        if (res.tom) return;
        if (res.ok) {
            this.rigtigt(g, res.note);
            this.input.value = "";
            return;
        }
        g.ryst = 0.45;
        this.stime = 0;
        this.besked(res.besked, "skidt");
        this.visPanel();
    };

    P.rigtigt = function (g, note) {
        var lay = this.lay;
        this.stime++;
        var bonus = Math.round(5 * NK.klamp(1 - (g.x - lay.x0) / (lay.x1 - lay.x0), 0, 1));
        var faaet = 10 * this.gange() + bonus;
        this.point += faaet;
        this.floats.push({ tekst: "+" + faaet, x: g.x, y: lay.baandY - lay.glasH - 14, t: 0 });
        g.status = "loest";
        g.t = 0;
        g.fraX = g.x;
        this.besked(note || "", note ? "gul" : "");
        this.rigtigeIalt++;
        this.rigtigeINiveau++;
        if (this.rigtigeINiveau >= PR_NIVEAU) {
            this.rigtigeINiveau = 0;
            this.nivNr++;
            this.visBanner();
        }
        this.visPanel();
    };

    P.iKassen_ = function (g) {
        g.status = "falder";
        g.t = 0;
        g.fraX = g.x;
        this.liv--;
        this.stime = 0;
        this.iKassen.push(g);
        var li = document.createElement("li");
        li.innerHTML = "<b>" + NK.html(g.st.formelTekst) + "</b> " + NK.html(g.st.navn);
        NK.el("baand-kasseliste").appendChild(li);
        NK.el("baand-kasse-kort").hidden = false;
        this.besked("Et glas røg i kassen. Det var <b>" + NK.html(g.retning === "formel" ? g.st.formelTekst : g.st.navn) + "</b>.", "skidt");
        if (this.liv <= 0) this.slut();
        this.visPanel();
    };

    P.slut = function () {
        this.tilstand = "slut";
        var ny = this.point > this.rekord;
        if (ny) {
            this.rekord = this.point;
            NK.gem(NOEGLE, { rekord: this.rekord });
        }
        this.nyRekord = ny && this.point > 0;
        this.besked("", "");
        var art = this.nyRekord ? "rekord" : (this.rigtigeIalt === 0 ? "ingen" : (this.rigtigeIalt < 6 ? "faa" : "mange"));
        this.ventSlut = { t: 1.4, art: art };
        this.visPanel();
    };

    /* ----- Tegneloekken -------------------------------------------------------- */
    P.opdater = function (dt) {
        this.tid += dt;
        var lay = this.lay, mig = this;
        this.taster = this.taster.filter(function (t) { t.a -= dt * 5; return t.a > 0; });
        this.floats = this.floats.filter(function (f) { f.t += dt; return f.t < 1.2; });
        if (this.banner) {
            this.banner.t += dt;
            if (this.banner.t > 2.6) this.banner = null;
        }
        if (!lay) return;

        var n = niveau(this.nivNr);
        var fart = (lay.x1 - lay.x0 + lay.glasB) / n.tid;
        if (this.tilstand === "koerer") {
            this.fase += fart * dt;
            var paa = this.glas.filter(function (g) { return g.status === "paa"; });
            var bagerst = null;
            paa.forEach(function (g) { if (!bagerst || g.x < bagerst.x) bagerst = g; });
            if (paa.length < n.max && (!bagerst || bagerst.x > lay.x0 + lay.glasB * 1.9)) {
                var ny = this.traek();
                this.glas.push({ st: ny.st, retning: ny.retning, x: lay.x0 - lay.glasB / 2, status: "paa", t: 0, ryst: 0 });
            }
            this.glas.forEach(function (g) {
                if (g.status !== "paa") return;
                g.x += fart * dt;
                if (g.x > lay.x1 - lay.glasB * 0.1) mig.iKassen_(g);
            });
        }
        this.glas.forEach(function (g) {
            if (g.ryst > 0) g.ryst -= dt;
            if (g.status !== "paa") g.t += dt;
        });
        /* Faerdige glas: loeste op paa hylden, faldne ned i kassen */
        this.glas = this.glas.filter(function (g) {
            if (g.status === "loest" && g.t > 1.25) {
                mig.paaHylden.push(g.st);
                return false;
            }
            if (g.status === "falder" && g.t > 0.9) return false;
            return true;
        });

        if (this.ventSlut) {
            this.ventSlut.t -= dt;
            if (this.ventSlut.t <= 0 && this.laererSlut) {
                var art = this.ventSlut.art;
                this.ventSlut = null;
                this.laererSlut(art);
            }
        }
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        if (!lay) return;
        var mig = this;
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 4);

        /* Hylden foroven med de glas, der har faaet etiket */
        ctx.fillStyle = "#8a6240";
        ctx.fillRect(8, lay.hyldeY, lay.W - 16, 5);
        ctx.fillStyle = "#6b4a2e";
        ctx.fillRect(8, lay.hyldeY + 5, lay.W - 16, 8);
        ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
        ctx.fillRect(8, lay.hyldeY + 13, lay.W - 16, 4);
        var lb = Tg.glasBredde(lay.lilleH) * 1.08;
        var plads = Math.max(1, Math.floor((lay.W - 40) / lb));
        var vis = this.paaHylden.slice(-plads);
        vis.forEach(function (st, i) {
            Tg.glas(ctx, 24 + lb * (i + 0.5), lay.hyldeY, lay.lilleH, st, { etiket: "ny", bredEtiket: true, tekst: true });
        });
        if (!this.paaHylden.length) {
            NK.tekst(ctx, "Glas med ny etiket kommer op på hylden her.", lay.W / 2, lay.hyldeY - lay.lilleH / 2,
                { justering: "center", linje: "middle", farve: "rgba(169, 176, 186, 0.55)", font: "italic 600 13px 'Segoe UI', sans-serif" });
        }

        /* Kassen staar paa et stativ for enden af baandet */
        var kk = lay.kasse.b / 170;
        ctx.fillStyle = "#3b4049";
        ctx.fillRect(lay.kasse.x + 22 * kk, lay.kasseBund - 4, 8, lay.bordY - lay.kasseBund + 4);
        ctx.fillRect(lay.kasse.x + lay.kasse.b - 30 * kk, lay.kasseBund - 4, 8, lay.bordY - lay.kasseBund + 4);
        var kant = Tg.kasse(ctx, lay.kasse.x, lay.kasse.y, lay.kasse.b,
            [this.iKassen.length ? "UKENDT (" + this.iKassen.length + ")" : "UKENDT", "siden 2009"]);

        Tg.baand(ctx, lay.x0, lay.x1, lay.baandY, this.fase, lay.bordY);

        /* Glassene */
        var forreste = this.tilstand === "koerer" ? this.forreste() : null;
        this.glas.forEach(function (g) {
            var x = g.x, y = lay.baandY, h = lay.glasH, vip = 0, alfa = 1;
            if (g.ryst > 0) x += Math.sin(g.ryst * 60) * 5 * (g.ryst / 0.45);
            if (g.status === "falder") {
                var t = NK.klamp(g.t / 0.8, 0, 1);
                var mx = (kant.v + kant.h) / 2;
                x = NK.lerp(g.fraX, mx, t);
                y = NK.lerp(lay.baandY, kant.kant + h * 0.9, t * t) - Math.sin(t * Math.PI) * 20;
                vip = t * 1.1;
                ctx.save();
                ctx.beginPath();
                ctx.rect(0, 0, lay.W, kant.kant);
                ctx.clip();
                Tg.glas(ctx, x, y, h, g.st, { retning: g.retning, vip: vip, udenSkygge: true });
                ctx.restore();
                return;
            }
            if (g.status === "loest") {
                var t1 = NK.klamp((g.t - 0.45) / 0.8, 0, 1);
                var tb = NK.blod(t1);
                var slutX = 24 + lb * (Math.min(mig.paaHylden.length, plads - 1) + 0.5);
                x = NK.lerp(g.fraX, slutX, tb);
                y = NK.lerp(lay.baandY, lay.hyldeY, tb) - Math.sin(tb * Math.PI) * 60;
                h = NK.lerp(lay.glasH, lay.lilleH, tb);
                alfa = 1;
                Tg.glas(ctx, x, y, h, g.st, g.t > 0.45
                    ? { etiket: "ny", bredEtiket: true, tekst: true }
                    : { etiket: "gammel", retning: g.retning });
                if (g.t < 0.45) mig.tegnPrint(ctx, g);
                return;
            }
            Tg.glas(ctx, x, y, h, g.st, { retning: g.retning, lys: g === forreste ? 0.75 + 0.25 * Math.sin(mig.tid * 5) : 0 });
            if (g === forreste) Tg.pil(ctx, x, y - h - 10, 9);
        });

        /* Etiketmaskinen med det, der er skrevet */
        var m = lay.maskine;
        ctx.fillStyle = "#2a2e37";
        ctx.fillRect(0, lay.bordY, lay.W, lay.H - lay.bordY);
        ctx.fillStyle = "#3b404c";
        ctx.fillRect(0, lay.bordY, lay.W, 8);
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.fillRect(0, lay.bordY, lay.W, 2);
        Tg.maskine(ctx, m.x, m.y, m.b, this.displayIndhold(forreste));

        /* Point, der stiger op */
        this.floats.forEach(function (f) {
            var a = 1 - NK.klamp((f.t - 0.6) / 0.6, 0, 1);
            NK.tekst(ctx, f.tekst, f.x, f.y - f.t * 40, {
                justering: "center", font: "800 20px 'Segoe UI', sans-serif",
                farve: "rgba(242, 197, 61, " + a + ")", kant: true, kantFarve: "rgba(10, 10, 16, " + (0.8 * a) + ")"
            });
        });

        /* Niveauet, naar det skifter */
        if (this.banner) {
            var bt = this.banner.t;
            var ba = Math.min(NK.klamp(bt / 0.3, 0, 1), NK.klamp((2.6 - bt) / 0.5, 0, 1));
            NK.tekst(ctx, this.banner.tekst, lay.W / 2, lay.hyldeY + 44, {
                justering: "center", linje: "middle", font: "700 22px 'Segoe UI', sans-serif",
                farve: "rgba(242, 243, 245, " + ba + ")", kant: true, kantFarve: "rgba(10, 10, 16, " + (0.85 * ba) + ")"
            });
        }

        if (this.tilstand === "slut") {
            NK.tekst(ctx, this.nyRekord ? "Ny rekord: " + this.point + " point" : "Slut: " + this.point + " point",
                lay.W / 2, lay.hyldeY + 44, {
                    justering: "center", linje: "middle", font: "800 26px 'Segoe UI', sans-serif",
                    farve: this.nyRekord ? "#f2c53d" : "#f2f3f5", kant: true
                });
        } else if (this.tilstand === "pause") {
            NK.tekst(ctx, "Pause", lay.W / 2, lay.hyldeY + 44, {
                justering: "center", linje: "middle", font: "800 26px 'Segoe UI', sans-serif", kant: true
            });
        }

        if (this.laererTegnOver) this.laererTegnOver(ctx);
    };

    /* Etiketten fra maskinens spraekke og hen paa glasset */
    P.tegnPrint = function (ctx, g) {
        var lay = this.lay;
        var mm = Tg.maskineMaal(lay.maskine.x, lay.maskine.y, lay.maskine.b);
        var e = Tg.etiketRekt(g.fraX, lay.baandY, lay.glasH, true);
        var t = NK.blod(NK.klamp(g.t / 0.45, 0, 1));
        var x = NK.lerp(mm.slids.x - e.b / 2, e.x + e.b / 2, t);
        var y = NK.lerp(mm.slids.y, e.y + e.h / 2, t) - Math.sin(t * Math.PI) * 40;
        Tg.friEtiket(ctx, x, y, e.b, e.h, g.st, (1 - t) * 0.2);
    };

    P.displayIndhold = function (forreste) {
        var v = { taster: this.taster };
        var raa = this.input ? this.input.value : "";
        if (this.tilstand === "klar") v.tom = "Tryk Enter for at starte";
        else if (this.tilstand === "slut") v.tom = "Enter: spil igen";
        else if (this.tilstand === "pause") v.tom = "Pause. Enter: fortsæt";
        else if (forreste) {
            v.tekst = Tj.pynt(raa, forreste.retning === "formel" ? "formel" : "navn");
            v.tom = forreste.retning === "formel" ? "Skriv formlen, og tryk Enter" : "Skriv navnet, og tryk Enter";
        }
        v.markoer = this.fokuseret && Math.floor(this.tid * 2) % 2 === 0;
        return v;
    };

    /* ----- Kemichaels praesentation ------------------------------------------
       Foerste gang fanen aabnes, foer spillet er startet (og igen med K).
       Start, et klik, et tastetryk og Esc sender ham ud. */
    P.startIntro = function (tving) {
        if (!this.laererIntro || this.tilstand !== "klar") return;
        if (!tving && NK.hent("nk-sc2.3-intro2", false)) return;
        NK.gem("nk-sc2.3-intro2", true);
        this.introVent = tving ? 0.1 : 0.7;
    };

    P.springIntro = function () {
        this.introVent = 0;
        return !!(this.laererIntroVaek && this.laererIntroVaek());
    };

    P.opdaterIntro = function (dt) {
        if (this.introVent > 0) {
            this.introVent -= dt;
            if (this.introVent <= 0 && this.laererIntro && this.tilstand === "klar") this.laererIntro();
        }
        var iIntro = !!(this.laererIIntro && this.laererIIntro());
        if (iIntro !== this.visesSpring) {
            this.visesSpring = iIntro;
            NK.el("baand-spring").hidden = !iIntro;
        }
    };

    /* ----- Indtastning og mus -------------------------------------------------- */
    P.fokus = function () {
        if (!document.getElementById("fane-baand").classList.contains("aktiv")) return;
        if (document.querySelector(".overlay.vis") || (NK.Rundvisning && NK.Rundvisning.aktiv())) return;
        try { this.input.focus({ preventScroll: true }); } catch (e) { this.input.focus(); }
    };

    P.koblInput = function () {
        var mig = this;
        this.input.addEventListener("keydown", function (e) {
            if (e.key === "Enter") { e.preventDefault(); mig.tjek(); }
        });
        this.input.addEventListener("input", function () {
            mig.taster.push({ i: Math.floor(Math.random() * 30), a: 1 });
            mig.springIntro();
        });
        NK.el("baand-spring").addEventListener("click", function () { mig.springIntro(); mig.fokus(); });
        this.input.addEventListener("focus", function () { mig.fokuseret = true; });
        this.input.addEventListener("blur", function () { mig.fokuseret = false; });
        NK.el("baand-knap").addEventListener("click", function () { mig.knap(); });
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointermove", function (e) {
            var pt = mig.L.punkt(e);
            c.style.cursor = mig.laererUnder && mig.laererUnder(pt.x, pt.y) ? "pointer" : "default";
        });
        c.addEventListener("click", function (e) {
            var pt = mig.L.punkt(e);
            if (mig.springIntro()) { mig.fokus(); return; }
            if (mig.laererKlik && mig.laererKlik(pt.x, pt.y)) return;
            mig.fokus();
        });
    };

    NK.SimBaand = SimBaand;
}());
