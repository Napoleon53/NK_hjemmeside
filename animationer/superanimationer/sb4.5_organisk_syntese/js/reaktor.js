/* =====================================================================
   reaktor.js - hylden, kolben og tavlen (det samme paa begge faner)

   Eleven laegger to stoffer i kolben (klik paa et kort paa hylden eller
   traek det op i en plads), taender for svovlsyre (H⁺) og varme og
   trykker Start. Saa haeldes stofferne i, og NK.Kemi.reaktion afgoer,
   hvad der sker. Tavlen (js/morf.js) viser det med strukturformler.

     * Kan stofferne reagere, men mangler der H⁺ eller varme, sker der
       intet: blandingen bliver i kolben, til eleven har rettet det.
     * Kan de ikke reagere, haeldes blandingen ud.
     * Er der et produkt, kommer det paa hylden under Lavet.

   Fanen (ejeren) bestemmer, hvor mange der er af hvert stof (fane 1:
   uendeligt af raavarerne; fane 2: lageret), og faar besked om udfaldet:

     ejer.antal(id)            hvor mange der er (Infinity = uendeligt)
     ejer.brug(id)             et stof haeldes i kolben
     ejer.nyt(stof)            et produkt kommer paa hylden
     ejer.udfald(u, fase)      fase "start" og "slut"
     ejer.grupper()            hyldens grupper: [{ titel, ids }]
     ejer.kortEkstra(s, el)    fx pris og en koebeknap (fane 2)
     ejer.mangler(id)          eleven klikker paa et stof, der er sluppet op
     ejer.aendret()            pladserne eller kontakterne er aendret
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;

    /* Spritets maal (se kommentaren i sprites/reaktor.svg) */
    var GEO = {
        b: 200, h: 440,
        kolbe: { x: 100, y: 319, r: 61 },
        hals: { x0: 91, x1: 109, y0: 214, y1: 262 },
        koeler: { x: 100, y0: 10, y1: 196 },
        bad: { x0: 26, x1: 174, y0: 322, y1: 394 },
        plade: { x0: 18, x1: 182, y: 398 }
    };

    var sprite = new Image();
    var spriteKlar = false;
    sprite.onload = function () { spriteKlar = true; };
    sprite.src = "sprites/reaktor.svg";

    function Reaktor(navn, ejer) {
        this.navn = navn;
        this.ejer = ejer;
        this.plads = [null, null];
        this.iKolben = false;        /* blandingen er haeldt i og venter */
        this.bet = { hplus: false, varme: false };
        this.auto = false;           /* en reaktion koerer */
        this.niveau = 0;             /* vaeskens hoejde (0-1), blidt */
        this.niveauMaal = 0;
        this.farve = D.FARVER.klar;
        this.farveMaal = D.FARVER.klar;
        this.dele = [];              /* partikler */
        this.draaber = [];
        this.koger = 0;
        this.duft = null;
        this.tid = 0;
        this.el = {
            hylde: this.$("hylde"), p0: this.$("plads0"), p1: this.$("plads1"),
            hplus: this.$("hplus"), varme: this.$("varme"), start: this.$("start"), toem: this.$("toem"),
            kolbe: this.$("kolbe"), tavle: this.$("tavle"), reaktor: this.$("reaktor")
        };
        this.L = new NK.Laerred(this.el.kolbe);
        this.tavle = new NK.Tavlen(this.el.tavle);
        this.bind();
        this.visPladser();
        this.visKontakter();
    }

    var P = Reaktor.prototype;

    P.$ = function (id) { return NK.el(this.navn + "-" + id); };

    /* ----- Knapperne ----------------------------------------------------------- */
    P.bind = function () {
        var mig = this;
        [this.el.p0, this.el.p1].forEach(function (e, i) {
            e.addEventListener("click", function () { mig.klikPlads(i); });
        });
        this.el.hplus.addEventListener("click", function () { mig.skift("hplus"); });
        this.el.varme.addEventListener("click", function () { mig.skift("varme"); });
        this.el.start.addEventListener("click", function () { mig.start(); });
        this.el.toem.addEventListener("click", function () { mig.toem(true); });
        /* Et klik paa tavlen under en reaktion springer animationen over */
        this.el.tavle.addEventListener("click", function () {
            if (!mig.auto || !mig.tavle.plan) return;
            mig.tavle.t = Math.max(mig.tavle.t, mig.tavle.plan.varighed);
            if (mig.ventFn) mig.ventT = Math.min(mig.ventT, 0.05);
        });
        this.koblTraek();
    };

    P.skift = function (k) {
        if (this.auto) return;
        this.bet[k] = !this.bet[k];
        if (k === "hplus" && this.bet.hplus && this.niveau > 0.05) this.draabe("#f5dd8a");
        this.visKontakter();
        this.ejer.aendret();
    };

    P.saetBet = function (hplus, varme) {
        this.bet.hplus = !!hplus;
        this.bet.varme = !!varme;
        this.visKontakter();
    };

    P.visKontakter = function () {
        var mig = this;
        ["hplus", "varme"].forEach(function (k) {
            var e = mig.el[k];
            e.classList.toggle("til", mig.bet[k]);
            e.setAttribute("aria-pressed", mig.bet[k] ? "true" : "false");
        });
    };

    /* ----- Hylden ---------------------------------------------------------------- */
    P.bygHylde = function () {
        var mig = this, h = this.el.hylde;
        h.innerHTML = "";
        this.kort = {};
        this.ejer.grupper().forEach(function (g) {
            if (!g.ids.length && !g.tom) return;
            var boks = document.createElement("div");
            boks.className = "hylde-gruppe " + (g.klasse || "");
            boks.innerHTML = '<div class="hg-navn">' + NK.html(g.titel) + "</div>";
            var raekke = document.createElement("div");
            raekke.className = "hg-kort";
            if (!g.ids.length) raekke.innerHTML = '<span class="hg-tom">' + NK.html(g.tom) + "</span>";
            g.ids.forEach(function (id) {
                var s = K.stof(id);
                if (!s) return;
                /* Et udsolgt kort (Fabrikken) kan ikke bruges; et klik siger hvorfor */
                var udsolgt = g.udsolgt ? g.udsolgt[id] : null;
                var kort = document.createElement("div");
                kort.className = "stofkort k-" + s.klasse + (udsolgt ? " udsolgt" : "");
                kort.setAttribute("data-id", id);
                var brug = document.createElement("button");
                brug.type = "button";
                brug.className = "sk-brug";
                brug.title = udsolgt ? "Udsolgt" : "Læg " + s.navn + " i kolben";
                brug.innerHTML = '<span class="sk-navn">' + NK.html(s.navn) + "</span>" +
                    '<span class="sk-formel">' + (s.ikon && !s.hylde ? s.ikon + " " : "") + NK.html(s.formel || "") + "</span>" +
                    (udsolgt ? '<span class="sk-udsolgt">Udsolgt</span>' : '<span class="sk-antal" hidden></span>');
                kort.appendChild(brug);
                raekke.appendChild(kort);
                if (udsolgt) {
                    brug.addEventListener("click", function () { mig.ejer.mangler(id, udsolgt); });
                    return;
                }
                mig.koblKort(brug, id);
                if (mig.ejer.kortEkstra) mig.ejer.kortEkstra(s, kort);
                mig.kort[id] = kort;
            });
            boks.appendChild(raekke);
            h.appendChild(boks);
        });
        this.visAntal();
    };

    P.visAntal = function () {
        var mig = this;
        Object.keys(this.kort || {}).forEach(function (id) {
            var k = mig.kort[id];
            var n = mig.ejer.antal(id);
            var fri = n - mig.reserveret(id);
            var e = k.querySelector(".sk-antal");
            if (n === Infinity || n <= 0) e.hidden = true;
            else { e.hidden = false; e.textContent = String(n); }
            k.classList.toggle("tom", n !== Infinity && fri <= 0);
            k.classList.toggle("valgt", mig.plads.indexOf(id) >= 0);
        });
    };

    P.reserveret = function (id) {
        if (this.iKolben) return 0;
        return (this.plads[0] === id ? 1 : 0) + (this.plads[1] === id ? 1 : 0);
    };

    P.blink = function (id) {
        var k = this.kort && this.kort[id];
        if (!k) return;
        k.classList.remove("ny");
        void k.offsetWidth;
        k.classList.add("ny");
    };

    /* ----- Pladserne ------------------------------------------------------------- */
    P.laeg = function (id, i) {
        if (this.auto) return false;
        var s = K.stof(id);
        if (this.iKolben) {
            this.ejer.besked("Kolben er i brug. Tryk Start, eller tøm kolben først.", "kort");
            return false;
        }
        var n = this.ejer.antal(id);
        if (n !== Infinity && n - this.reserveret(id) <= 0) {
            this.ejer.mangler(id);
            return false;
        }
        if (i === undefined || i === null) i = this.plads[0] === null ? 0 : (this.plads[1] === null ? 1 : -1);
        if (i < 0) {
            this.ejer.besked("Der er kun plads til to stoffer. Klik på en plads for at tage stoffet af igen.", "kort");
            return false;
        }
        this.plads[i] = id;
        this.efterPlads();
        return !!s;
    };

    P.klikPlads = function (i) {
        if (this.auto) return;
        if (this.iKolben) {
            this.ejer.besked("Stofferne er hældt i kolben. Tryk Start, eller tøm kolben.", "kort");
            return;
        }
        if (this.plads[i] === null) {
            this.ejer.besked("Klik på et stof på hylden, eller træk det herop.", "kort");
            return;
        }
        this.plads[i] = null;
        this.efterPlads();
    };

    /* Pladserne er aendret: tavlen viser, hvad der er i kolben */
    P.efterPlads = function (stille) {
        this.visPladser();
        this.visAntal();
        if (stille) return;
        var a = this.plads[0], b = this.plads[1];
        if (a || b) this.tavle.vis({ type: "foer", a: K.stof(a || b), b: a && b ? K.stof(b) : null });
        else this.tavle.vis({ type: "tom" });
        this.ejer.aendret();
    };

    P.visPladser = function () {
        var mig = this;
        [this.el.p0, this.el.p1].forEach(function (e, i) {
            var id = mig.plads[i];
            var s = id ? K.stof(id) : null;
            e.classList.toggle("fyldt", !!s);
            e.classList.toggle("ikolben", !!s && mig.iKolben);
            e.className = e.className.replace(/\bk-\S+/g, "").trim() + (s ? " k-" + s.klasse : "");
            if (s) {
                e.innerHTML = '<span class="pl-navn">' + NK.html(s.navn) + '</span><span class="pl-formel">' +
                    NK.html(s.formel || "") + "</span>" + (mig.iKolben ? '<span class="pl-note">i kolben</span>' : "");
            } else {
                e.innerHTML = '<span class="pl-tom">+</span><span class="pl-note">Stof ' + (i + 1) + "</span>";
            }
        });
        this.el.toem.hidden = !this.iKolben;
        this.el.start.disabled = this.auto;
    };

    /* Tom kolben: blandingen haeldes ud */
    P.toem = function (afEleven) {
        if (this.auto) return;
        var var_ = this.iKolben;
        this.plads = [null, null];
        this.iKolben = false;
        this.niveauMaal = 0;
        this.farveMaal = D.FARVER.klar;
        this.efterPlads(!afEleven);
        if (afEleven && var_) this.ejer.besked("Kolben er tømt. Blandingen er hældt ud.", "kort");
    };

    /* Ryd alt (Start forfra) */
    P.nulstil = function () {
        this.auto = false;
        this.plads = [null, null];
        this.iKolben = false;
        this.niveau = this.niveauMaal = 0;
        this.farve = this.farveMaal = D.FARVER.klar;
        this.dele = [];
        this.draaber = [];
        this.duft = null;
        this.koger = 0;
        this.visPladser();
        this.visAntal();
        this.tavle.vis({ type: "tom" });
    };

    /* ----- Start ----------------------------------------------------------------- */
    P.udfaldNu = function () {
        return K.reaktion(this.plads[0], this.plads[1], this.bet);
    };

    P.start = function () {
        if (this.auto) return;
        var u = this.udfaldNu();
        if (u.slags === "tom" || u.slags === "en") {
            this.ejer.udfald(u, "start");
            return;
        }
        var mig = this;
        this.auto = true;
        this.el.start.disabled = true;
        var haeld = !this.iKolben;
        if (haeld) {
            this.ejer.brug(this.plads[0]);
            this.ejer.brug(this.plads[1]);
            this.iKolben = true;
            this.haeldI();
        }
        this.visPladser();
        this.visAntal();
        this.vent(haeld ? 0.9 : 0.15, function () { mig.reager(u); });
    };

    /* Smaa ventetider, der foelger tegneloekken (og virker i selvtesten) */
    P.vent = function (sek, fn) {
        this.ventT = sek;
        this.ventFn = fn;
    };

    P.haeldI = function () {
        var mig = this;
        var harOx = this.plads.indexOf("permanganat") >= 0;
        this.farveMaal = harOx ? D.FARVER.permanganat : D.FARVER.klar;
        [0, 1].forEach(function (i) {
            var s = K.stof(mig.plads[i]);
            mig.draabe(s && s.klasse === "ox" ? "#b04fd0" : "#cfe6f7", i * 0.25);
        });
        this.niveauMaal = 0.62;
    };

    P.draabe = function (farve, forsinkelse) {
        this.draaber.push({ y: GEO.koeler.y0, v: 0, farve: farve, vent: forsinkelse || 0 });
    };

    P.reager = function (u) {
        var mig = this;
        this.tavle.vis({ type: "udfald", udfald: u });
        this.ejer.udfald(u, "start");
        var sker = u.mulig && !u.mangler.length;
        if (!u.mulig) {
            /* haeldes ud */
            this.vent(1.6, function () {
                mig.auto = false;
                mig.toem(false);
                mig.ejer.udfald(u, "slut");
            });
            return;
        }
        if (!sker) {
            this.auto = false;
            this.visPladser();
            this.ejer.udfald(u, "slut");
            return;
        }
        /* Reaktionen koerer: kog, tilbagesvaling og tavlen */
        this.koger = 1;
        this.tavle.tilpas();
        this.tavle.byg();
        var varighed = this.tavle.plan ? this.tavle.plan.varighed : 3;
        this.vent(Math.max(2.5, varighed), function () { mig.slut(u); });
        if (u.slags === "oxidation" || u.slags === "co2") this.farveSkift = { t: 0, til: D.FARVER.mangan };
    };

    P.slut = function (u) {
        this.koger = 0;
        this.auto = false;
        this.iKolben = false;
        this.plads = [null, null];
        if (u.produkt) {
            this.ejer.nyt(u.produkt);
            if (u.produkt.ikon || u.produkt.duft) this.duft = { t: 0, ikon: u.produkt.ikon || "", tekst: u.produkt.duft || "" };
        }
        this.niveauMaal = 0;
        this.visPladser();
        this.visAntal();
        if (u.produkt) this.blink(u.produkt.id);
        this.ejer.udfald(u, "slut");
    };

    /* Spring en igangvaerende reaktion til slutningen (selvtesten) */
    P.spring = function () {
        var n = 0;
        while ((this.ventFn || this.auto) && n++ < 20) {
            this.ventT = 0;
            this.tavle.spring();
            this.opdater(0.016);
        }
        this.tavle.spring();
    };

    /* ----- Traek fra hylden ---------------------------------------------------------- */
    P.koblKort = function (knap, id) {
        var mig = this;
        knap.addEventListener("pointerdown", function (e) {
            if (e.button !== undefined && e.button !== 0) return;
            mig.traek = { id: id, x: e.clientX, y: e.clientY, i: false, knap: knap };
        });
        knap.addEventListener("click", function () {
            if (mig.sidstTrukket) { mig.sidstTrukket = false; return; }
            mig.laeg(id, null);
        });
    };

    P.koblTraek = function () {
        var mig = this;
        document.addEventListener("pointermove", function (e) {
            var t = mig.traek;
            if (!t) return;
            if (!t.i && Math.abs(e.clientX - t.x) + Math.abs(e.clientY - t.y) > 7) {
                t.i = true;
                var s = K.stof(t.id);
                var g = document.createElement("div");
                g.className = "traek-spoegelse k-" + s.klasse;
                g.innerHTML = '<span class="sk-navn">' + NK.html(s.navn) + '</span><span class="sk-formel">' + NK.html(s.formel || "") + "</span>";
                document.body.appendChild(g);
                t.g = g;
                mig.el.reaktor.classList.add("modtager");
            }
            if (t.i) {
                t.g.style.left = (e.clientX + 10) + "px";
                t.g.style.top = (e.clientY + 6) + "px";
                var over = mig.pladsUnder(e.clientX, e.clientY);
                mig.el.p0.classList.toggle("over", over === 0);
                mig.el.p1.classList.toggle("over", over === 1);
            }
        });
        function slip(e) {
            var t = mig.traek;
            mig.traek = null;
            if (!t || !t.i) return;
            mig.sidstTrukket = true;
            setTimeout(function () { mig.sidstTrukket = false; }, 0);
            if (t.g && t.g.parentNode) t.g.parentNode.removeChild(t.g);
            mig.el.reaktor.classList.remove("modtager");
            mig.el.p0.classList.remove("over");
            mig.el.p1.classList.remove("over");
            var i = mig.pladsUnder(e.clientX, e.clientY);
            if (i === null && mig.overReaktor(e.clientX, e.clientY)) i = mig.plads[0] === null ? 0 : (mig.plads[1] === null ? 1 : null);
            if (i !== null) mig.laeg(t.id, i);
        }
        document.addEventListener("pointerup", slip);
        document.addEventListener("pointercancel", function () {
            var t = mig.traek;
            mig.traek = null;
            if (t && t.g && t.g.parentNode) t.g.parentNode.removeChild(t.g);
            mig.el.reaktor.classList.remove("modtager");
        });
    };

    function inde(el, x, y) {
        var r = el.getBoundingClientRect();
        return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    }

    P.pladsUnder = function (x, y) {
        if (inde(this.el.p0, x, y)) return 0;
        if (inde(this.el.p1, x, y)) return 1;
        return null;
    };

    P.overReaktor = function (x, y) { return inde(this.el.reaktor, x, y); };

    /* ----- Tegneloekken ----------------------------------------------------------------- */
    P.tilpas = function () {
        this.L.tilpas();
        this.tavle.tilpas();
    };

    P.opdater = function (dt) {
        this.tid += dt;
        if (this.ventFn) {
            this.ventT -= dt;
            if (this.ventT <= 0) {
                var fn = this.ventFn;
                this.ventFn = null;
                fn();
            }
        }
        this.niveau = NK.mod(this.niveau, this.niveauMaal, 2.2, dt);
        if (this.farveSkift && this.koger) {
            this.farveSkift.t += dt;
            if (this.farveSkift.t > 1.2) { this.farveMaal = this.farveSkift.til; this.farveSkift = null; }
        }
        if (!this.koger && !this.iKolben && this.niveauMaal === 0 && this.niveau < 0.02) this.farveMaal = D.FARVER.klar;
        this.farve = this.farveMaal;
        this.tavle.opdater(dt);

        /* Draaberne falder ned gennem koeleren */
        var bund = GEO.kolbe.y + GEO.kolbe.r - this.niveau * GEO.kolbe.r * 1.6;
        this.draaber = this.draaber.filter(function (d) {
            if (d.vent > 0) { d.vent -= dt; return true; }
            d.v += 900 * dt;
            d.y += d.v * dt;
            return d.y < bund;
        });

        /* Bobler og damp, naar det koger */
        var varmt = this.bet.varme && this.niveau > 0.1;
        var rate = this.koger ? 26 : (varmt ? 8 : 0);
        this.boble = (this.boble || 0) + rate * dt;
        while (this.boble >= 1) {
            this.boble -= 1;
            var r = GEO.kolbe.r * 0.75;
            this.dele.push({ type: "boble", x: GEO.kolbe.x + NK.r(-r, r), y: GEO.kolbe.y + GEO.kolbe.r * 0.8, v: NK.r(40, 80), liv: 1, r: NK.r(1.5, 3.5) });
            if (this.koger && Math.random() < 0.45) {
                this.dele.push({ type: "damp", x: GEO.kolbe.x + NK.r(-5, 5), y: GEO.hals.y1, v: NK.r(35, 60), liv: 1 });
            }
        }
        var top = GEO.kolbe.y + GEO.kolbe.r - this.niveau * GEO.kolbe.r * 1.6;
        this.dele = this.dele.filter(function (p) {
            if (p.type === "boble") { p.y -= p.v * dt; return p.y > top + 2; }
            if (p.type === "damp") {
                p.y -= p.v * dt;
                p.liv -= dt * 0.45;
                if (p.y < GEO.koeler.y1 - 70 || p.liv <= 0) return false;
                return true;
            }
            return false;
        });
        /* Tilbagesvalingen: draaber fra koeleren */
        if (this.koger) {
            this.svaler = (this.svaler || 0) + dt * 3;
            while (this.svaler >= 1) { this.svaler -= 1; this.draabe("rgba(200,230,250,0.9)"); }
        }
        if (this.duft) {
            this.duft.t += dt;
            if (this.duft.t > 3.5) this.duft = null;
        }
    };

    P.tegn = function () {
        var L = this.L, ctx = L.ctx, W = L.b, H = L.h;
        ctx.clearRect(0, 0, W, H);
        var k = Math.min(W / GEO.b, H / GEO.h);
        var x0 = (W - GEO.b * k) / 2, y0 = H - GEO.h * k;
        ctx.save();
        ctx.translate(x0, y0);
        ctx.scale(k, k);

        /* Vandbadet */
        var bad = GEO.bad;
        ctx.fillStyle = this.bet.varme ? "rgba(140, 190, 230, 0.26)" : "rgba(120, 180, 230, 0.18)";
        ctx.beginPath();
        ctx.rect(bad.x0, bad.y0, bad.x1 - bad.x0, bad.y1 - bad.y0);
        ctx.arc(GEO.kolbe.x, GEO.kolbe.y, GEO.kolbe.r + 3, 0, Math.PI * 2, true);
        ctx.fill("evenodd");

        /* Vaesken i kolben */
        var kb = GEO.kolbe;
        if (this.niveau > 0.01) {
            var top = kb.y + kb.r - this.niveau * kb.r * 1.6;
            ctx.save();
            ctx.beginPath();
            ctx.arc(kb.x, kb.y, kb.r, 0, Math.PI * 2);
            ctx.clip();
            ctx.fillStyle = this.farve;
            ctx.fillRect(kb.x - kb.r, top, kb.r * 2, kb.y + kb.r - top);
            ctx.fillStyle = "rgba(255,255,255,0.25)";
            ctx.fillRect(kb.x - kb.r, top, kb.r * 2, 1.5);
            this.dele.forEach(function (p) {
                if (p.type !== "boble") return;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.strokeStyle = "rgba(255,255,255,0.55)";
                ctx.lineWidth = 1;
                ctx.stroke();
            });
            if (this.bet.hplus) {
                ctx.font = "700 15px 'Segoe UI', sans-serif";
                ctx.textAlign = "center";
                ctx.fillStyle = "rgba(245, 221, 138, 0.9)";
                ctx.fillText("H⁺", kb.x + kb.r * 0.45, kb.y + kb.r * 0.62);
            }
            ctx.restore();
        }

        /* Dampen i halsen og koeleren */
        this.dele.forEach(function (p) {
            if (p.type !== "damp") return;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(230, 240, 250," + (0.35 * p.liv).toFixed(3) + ")";
            ctx.fill();
        });

        /* Varmepladen gloeder */
        if (this.bet.varme) {
            var pl = GEO.plade;
            var g = ctx.createLinearGradient(0, pl.y - 8, 0, pl.y + 4);
            g.addColorStop(0, "rgba(255, 110, 40, 0)");
            g.addColorStop(1, "rgba(255, 110, 40, 0.55)");
            ctx.fillStyle = g;
            ctx.fillRect(pl.x0, pl.y - 8, pl.x1 - pl.x0, 12);
        }

        if (spriteKlar) ctx.drawImage(sprite, 0, 0, GEO.b, GEO.h);
        else {
            ctx.strokeStyle = "rgba(230,243,251,0.8)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(kb.x, kb.y, kb.r + 3, 0, Math.PI * 2);
            ctx.stroke();
        }

        /* Lampen paa pladen */
        ctx.beginPath();
        ctx.arc(40, 418, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = this.bet.varme ? "#ff5a3c" : "#3a3f4a";
        ctx.fill();

        /* Draaberne */
        this.draaber.forEach(function (d) {
            if (d.vent > 0) return;
            ctx.beginPath();
            ctx.ellipse(GEO.koeler.x, d.y, 2.6, 3.6, 0, 0, Math.PI * 2);
            ctx.fillStyle = d.farve;
            ctx.fill();
        });

        /* Duften stiger op af koeleren */
        if (this.duft) {
            var u = this.duft.t / 3.5;
            ctx.globalAlpha = NK.klamp(Math.min(u * 5, (1 - u) * 2.5), 0, 1);
            ctx.textAlign = "center";
            ctx.font = "30px 'Segoe UI Emoji', 'Segoe UI', sans-serif";
            if (this.duft.ikon) ctx.fillText(this.duft.ikon, GEO.koeler.x, 40 - u * 30);
            ctx.globalAlpha = 1;
        }
        ctx.restore();

        this.tavle.tegn();
    };

    NK.Reaktor = Reaktor;
    NK.Reaktor.GEO = GEO;
}());
