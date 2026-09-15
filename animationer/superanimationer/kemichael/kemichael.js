/* =====================================================================
   kemichael.js - Kemichael, laereren der gaar igen i superanimationerne

   Faelles for alle superanimationer med laereren. Personen, tonen og
   glimtene af hans baggrund er beskrevet i README.md i denne mappe.

   Filen indlaeses efter sprites.js og foer scene.js:

     <script src="js/sprites.js"></script>
     <script src="../kemichael/kemichael.js"></script>
     <script src="js/scene.js"></script>

   Ved indlaesning kommer Kemichaels sprites (krop, hoved, arm og
   kaffekoppen) i NK.Sprites.FILER med mappen kemichael/sprites/, og
   scene.js kopierer NK.Kemichael.ANKER ind i S.ANKER.

   Animationens egen js/laerer.js kobler figuren paa forsoeget og
   tilfoejer de scener, der hoerer til netop det forsoeg:

     NK.Kemichael.paa(NK.Forsoeg.prototype, { kaffeX: 170, fredet: ["brand"] });

   Valg:
     kaffeX   hvor laereren stiller sig, naar kaffen hentes
     fredet   scener, som et klik paa laereren ikke afbryder

   Figuren kommer ind fra venstre, foran bordet. Hovedet er et sprite
   uden ansigt; oejne, bryn, briller, mund og roedme tegnes her, saa
   udtrykket kan skifte. Armen er et eget sprite, der drejer om skulderen.

   Laereren optraeder i smaa scener (laererKoer): en liste af trin, der
   koeres efter hinanden.
     { gaa: x, loeb }       gaa (eller loeb) hen til x; x kan vaere en funktion.
                            K.UDE er uden for scenen, K.KANT lige inde ved kanten
     { sig: tekst, vis }    taleboble i vis sekunder
     { arm: vinkel, tid }   drej armen om skulderen
     { udtryk: { ... } }    ansigtet glider derhen:
                              vrede, humoer, roed
                              skeptisk  hoejre bryn op og skaev mund
                              briller   brillerne glider ned, han kigger over dem
                              laen      han laener sig ind, fx fra kanten
     { tid, hver(t) }       vent; hver kaldes undervejs med t fra 0 til 1
     { kald() }             kald en funktion
     K.suk(tid)             et suk: oejnene lukkes, og hovedet synker
   En scene laaser forsoeget, mens den koerer, medmindre blokerer er false.

   Glimt af baggrunden:
     K.glimtTrin(id)   en liste med eet sig-trin, hvis glimtet ikke er vist
                       foer i denne browser, og der ikke er vist et andet
                       glimt paa siden; ellers en tom liste. Bruges med concat.
     K.uheld()         skriver et uheld i regnskabet (foelger browseren paa
                       tvaers af animationerne) og giver et glimt, naar
                       regnskabet naar 3, 6 eller 10
     K.glimtNulstil()  glemmer viste glimt og regnskabet

   Kroge, som animationen kan definere paa prototypen (alle frivillige):
     laererStartEkstra()            mere tilstand ved start
     laererNytEkstra()              mere at nulstille ved nyt forsoeg
     laererVentende()               efter scenen: start en scene, der ventede
     opdaterLaererEkstra(dt)        mere at opdatere i hvert billede
     tegnLaererFoer(ctx, tid, L)    tegnes foer laereren, ogsaa naar han er ude
     tegnBaaretEkstra(ctx, L, hd)   andet i haanden end kaffekoppen

   Faelles paaskeaeg:
     kaffe    klik paa koppen paa hylden: laereren henter sin kaffe
     laerer   klik paa laereren: stadig kortere svar, til sidst roed i
              hovedet og damp af oererne

   Lydene (NK.Lyd.mumle, brum og slurk) staar i animationens lyd.js,
   fordi de foelger animationens egen lydknap.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var UDE = -300;
    var KANT = 10;
    var HAENGER = 2.9;

    /* Sprites hentes fra sprites/ ved siden af denne fil */
    var script = document.currentScript;
    var MAPPE = script && script.src ? script.src.replace(/[^\/]*$/, "") + "sprites/" : "../kemichael/sprites/";

    /* Navn: fil og stoerrelse i tegneenheder (viewBox). */
    var SPRITES = {
        kaffekop:    { fil: "kaffekop.svg", b: 42, h: 40 },
        laererKrop:  { fil: "laerer_krop.svg", b: 220, h: 250 },
        laererHoved: { fil: "laerer_hoved.svg", b: 110, h: 130 },
        laererArm:   { fil: "laerer_arm.svg", b: 56, h: 150 }
    };
    Object.keys(SPRITES).forEach(function (navn) {
        SPRITES[navn].mappe = MAPPE;
        NK.Sprites.FILER[navn] = SPRITES[navn];
    });

    /* Ankerpunkter: koppens bund, halsen paa kroppen og hovedet, skulderen */
    var ANKER = {
        kaffekop:    { x: 18, y: 40 },
        laererKrop:  { x: 110, y: 18 },
        laererHoved: { x: 55, y: 126 },
        laererArm:   { x: 28, y: 142 }
    };

    var SVAR = ["Ja?", "Hvad er der?", "Jeg har travlt.", "Lad være med det."];

    /* ----- Glimt af baggrunden ------------------------------------------- */
    /* Hvert glimt hoerer til en bestemt haendelse; se tabellen i README.md. */
    var GLIMT = {
        navn:       "Michael. Ikke Kemichael.",
        kaffeKold:  "Kold. Som altid.",
        kaffePause: "Uden for døren er det en pause.",
        oejenbryn:  "Jeg prøvede det i 1994. Spørg mine øjenbryn.",
        frokost:    "Tak for frokosten.",
        phd:        "Sådan så min ph.d. også ud. Den blev aldrig færdig.",
        vejleder:   "Det sagde min vejleder også. Jeg lyttede heller ikke.",
        laege:      "Sådan en kurve lavede en elev i 2003. Hun er læge nu.",
        dab:        "Det lærte jeg af en 1.g i 2016.",
        stroem:     "Strømmen går fra kaffebudgettet.",
        bartender:  "Jeg rystede cocktails under studiet. Det her er ikke det.",
        jura:       "Aubergine så jeg sidst i 2011. Han læser jura nu.",
        titrering:  "Min første titrering gav 140 %. Det var en lang nat.",
        regnskab3:  "Tredje uheld på den her computer. Det står i regnskabet.",
        regnskab6:  "Seks uheld på den her computer. Regnskabet har fået en mappe.",
        regnskab10: "Ti uheld. Regnskabet har fået sit eget ringbind."
    };
    var REGNSKAB = [
        { antal: 10, id: "regnskab10" },
        { antal: 6, id: "regnskab6" },
        { antal: 3, id: "regnskab3" }
    ];

    var LAGER = "nk-kemichael";
    var hukommelse = { sete: [], uheld: 0 };
    var glimtVist = false;

    function hent() {
        try {
            var v = JSON.parse(window.localStorage.getItem(LAGER));
            if (v && v.sete) return v;
        } catch (fejl) { /* file:// eller privat browsing */ }
        return hukommelse;
    }

    function gem(v) {
        hukommelse = v;
        try { window.localStorage.setItem(LAGER, JSON.stringify(v)); } catch (fejl) { /* som ovenfor */ }
    }

    /* Teksten, hvis glimtet maa vises nu; det regnes saa som vist */
    function glimt(id) {
        var tekst = GLIMT[id];
        if (!tekst || glimtVist) return null;
        var v = hent();
        if (v.sete.indexOf(id) >= 0) return null;
        v.sete.push(id);
        gem(v);
        glimtVist = true;
        return tekst;
    }

    function glimtTrin(id) {
        var tekst = glimt(id);
        return tekst ? [{ sig: tekst, vis: 1.4 + tekst.length * 0.045, tid: 1.6 + tekst.length * 0.045 }] : [];
    }

    function uheld() {
        var v = hent();
        v.uheld = (v.uheld || 0) + 1;
        gem(v);
        for (var i = 0; i < REGNSKAB.length; i++) {
            if (v.uheld >= REGNSKAB[i].antal) return v.sete.indexOf(REGNSKAB[i].id) >= 0 ? [] : glimtTrin(REGNSKAB[i].id);
        }
        return [];
    }

    function glimtNulstil() {
        gem({ sete: [], uheld: 0 });
        glimtVist = false;
    }

    /* Et suk: oejnene lukkes, og hovedet synker og kommer op igen */
    function suk(tid) {
        return { tid: tid || 1.2, hver: function (t) {
            var s = Math.sin(Math.PI * t);
            this.laerer.lukket = s;
            this.laerer.nik = 6 * s;
        } };
    }

    /* Taleboble med hale ned mod (hx, hy) */
    function tegnTaleboble(ctx, x, y, tekst, alfa, hx, hy) {
        if (alfa < 0.01 || !tekst) return;
        ctx.save();
        ctx.globalAlpha = NK.klamp(alfa, 0, 1);
        ctx.font = "700 17px 'Segoe UI', sans-serif";
        var b = ctx.measureText(tekst).width + 28, h = 38;
        var bx = NK.klamp(x - b / 2, 8, NK.Scene.BREDDE - b - 8);
        ctx.fillStyle = "#fffdf6";
        ctx.strokeStyle = "#2a2f36";
        ctx.lineWidth = 2;
        NK.rundtRekt(ctx, bx, y, b, h, 12);
        ctx.fill();
        ctx.stroke();
        var hale = NK.klamp(hx, bx + 16, bx + b - 16);
        ctx.beginPath();
        ctx.moveTo(hale - 8, y + h - 1);
        ctx.lineTo(hx, hy);
        ctx.lineTo(hale + 8, y + h - 1);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(hale - 8, y + h);
        ctx.lineTo(hx, hy);
        ctx.lineTo(hale + 8, y + h);
        ctx.stroke();
        NK.tekst(ctx, tekst, bx + b / 2, y + h / 2 + 1, { font: "700 17px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#1f2328" });
        ctx.restore();
    }

    /* Kobler Kemichael paa forsoegets prototype */
    function paa(P, valg) {
        valg = valg || {};
        var S = NK.Scene;
        var r = NK.r;
        var kaffeX = valg.kaffeX === undefined ? 170 : valg.kaffeX;
        var fredet = (valg.fredet || []).concat("gaaUd");

        P.laererStart = function () {
            this.laerer = {
                x: UDE, maalX: UDE, y: 392, loeb: false, gang: 0,
                scene: null,
                tale: "", taleUr: 0, taleAlfa: 0, taleLaengde: 0,
                vrede: 0.5, humoer: -0.5, roed: 0, skeptisk: 0, briller: 0, laen: 0,
                vredeMaal: 0.5, humoerMaal: -0.5, roedMaal: 0, skeptiskMaal: 0, brillerMaal: 0, laenMaal: 0,
                aaben: 0, blinkUr: 2, blink: 0, lukket: 0, nik: 0, damp: 0,
                arm: HAENGER, armFra: HAENGER, armTil: HAENGER,
                hovedV: 0, hovedDx: 0, hovedDy: 0,
                baerer: null, klik: 0, plakatRegel: 0, rost: false,
                dampe: []
            };
            if (this.laererStartEkstra) this.laererStartEkstra();
        };

        /* Kaldes fra nulstil(): en igangvaerende scene afbrydes. */
        P.laererNyt = function () {
            var L = this.laerer;
            if (!L) return;
            if (L.scene) {
                L.scene = null;
                L.maalX = UDE;
                L.tale = "";
                L.taleUr = 0;
                L.arm = HAENGER;
                L.plakatRegel = 0;
                L.skeptiskMaal = 0;
                L.brillerMaal = 0;
                L.laenMaal = 0;
            }
            L.hovedV = 0; L.hovedDx = 0; L.hovedDy = 0;
            L.lukket = 0;
            if (this.laererNytEkstra) this.laererNytEkstra();
        };

        P.laererOptaget = function () {
            var L = this.laerer;
            return !!(L && L.scene && L.scene.blokerer);
        };

        P.laererVisning = function () {
            return { plakatRegel: this.laerer ? this.laerer.plakatRegel : 0 };
        };

        P.laererKoer = function (navn, trin, blokerer) {
            this.laerer.scene = { navn: navn, trin: trin, i: 0, t: 0, blokerer: blokerer !== false };
            this.aendret("laerer");
        };

        /* ----- Skulder og haand -------------------------------------------- */
        P.laererKrop = function () {
            var L = this.laerer;
            var gaar = L.x !== L.maalX;
            var bob = gaar ? Math.abs(Math.sin(L.gang)) * -5 : 0;
            return { x: L.x, y: L.y + bob, v: (gaar ? Math.sin(L.gang) * 0.03 : 0) + L.laen * 0.04 };
        };

        P.laererSkulder = function () {
            return NK.tilVerden(this.laererKrop(), S.ANKER.laererKrop, 176, 58);
        };

        P.laererHaand = function () {
            var sk = this.laererSkulder();
            return NK.tilVerden({ x: sk.x, y: sk.y, v: this.laerer.arm }, S.ANKER.laererArm, 28, 36);
        };

        /* ----- Kaffen: altid kold, fordi han aldrig faar den drukket ------- */
        P.klikKop = function () {
            var L = this.laerer, kop = this.g.kaffekop;
            if (L.scene || kop.skjult) return false;
            var kold = glimt("kaffeKold");
            this.laererKoer("kaffe", [
                { udtryk: { vrede: 0.8, humoer: -0.6, roed: 0.1 } },
                { gaa: kaffeX },
                { sig: "Det er min kaffe.", vis: 2.2, tid: 0.3 },
                { arm: -0.5, tid: 0.55 },
                { kald: function () { kop.iHaand = true; this.laerer.baerer = "kaffekop"; } },
                { arm: -0.98, tid: 0.6 },
                { kald: function () { if (NK.Lyd) NK.Lyd.slurk(); } }
            ].concat(kold ? [
                { udtryk: { vrede: 0.2, humoer: -0.3, roed: 0 } },
                { tid: 0.5 },
                suk(1.1),
                { sig: kold, vis: 1.8, tid: 1.3 }
            ] : [
                { udtryk: { vrede: 0.1, humoer: 0.5, roed: 0 } },
                { tid: 1.0 },
                { sig: "Ahh.", vis: 1.3, tid: 1.1 }
            ], [
                { kald: function () { kop.skjult = true; this.koppenVaek = true; } },
                { arm: -0.3, tid: 0.4 },
                { gaa: UDE },
                { kald: function () { this.laerer.baerer = null; } }
            ]));
            return true;
        };

        /* ----- Klik paa laereren ------------------------------------------ */
        P.overLaerer = function (pt) {
            var L = this.laerer;
            if (!L || L.x < -100) return null;
            if (pt.x > L.x - 105 && pt.x < L.x + 112 && pt.y > L.y - 116 && pt.y < S.HOEJDE + 40) return "laerer";
            return null;
        };

        P.klikLaerer = function () {
            var L = this.laerer;
            if (!L || L.x < -100 || (L.scene && fredet.indexOf(L.scene.navn) >= 0)) return false;
            L.klik++;
            L.vredeMaal = 1;
            L.humoerMaal = -1;
            if (L.klik <= SVAR.length) {
                var navn = L.klik === 1 ? glimt("navn") : null;
                this.laererSig(navn || SVAR[L.klik - 1], navn ? 2.2 : 1.6);
                L.roedMaal = Math.min(1, 0.22 * L.klik);
                return true;
            }
            L.roedMaal = 1;
            L.damp = 3;
            this.laererSig("Nu går jeg.", 1.6);
            if (NK.Lyd) NK.Lyd.brum();
            var blokerede = L.scene && L.scene.blokerer;
            this.laererKoer("gaaUd", [{ arm: HAENGER, tid: 0.3 }, { tid: 1.1 }, { gaa: UDE }], !!blokerede);
            return true;
        };

        P.laererSig = function (tekst, vis) {
            var L = this.laerer;
            L.tale = tekst;
            L.taleUr = vis || 2;
            L.taleLaengde = Math.min(1.6, 0.12 + tekst.length * 0.045);
            L.taleStart = this.tid;
            if (NK.Lyd) NK.Lyd.mumle(Math.max(1, Math.min(8, Math.round(tekst.length / 5))));
        };

        /* ----- Tidens gang ------------------------------------------------- */
        P.opdaterLaerer = function (dt) {
            var L = this.laerer;
            if (!L) return;
            var i;

            /* Scenen */
            var sc = L.scene, vagt = 0, rest = dt;
            while (sc && L.scene === sc && vagt++ < 30) {
                var tr = sc.trin[sc.i];
                if (!tr) { L.scene = null; this.aendret("laerer"); break; }
                if (tr.kald) { tr.kald.call(this); sc.i++; sc.t = 0; continue; }
                if (tr.udtryk) {
                    var u = tr.udtryk;
                    if (u.vrede !== undefined) L.vredeMaal = u.vrede;
                    if (u.humoer !== undefined) L.humoerMaal = u.humoer;
                    if (u.roed !== undefined) L.roedMaal = u.roed;
                    if (u.skeptisk !== undefined) L.skeptiskMaal = u.skeptisk;
                    if (u.briller !== undefined) L.brillerMaal = u.briller;
                    if (u.laen !== undefined) L.laenMaal = u.laen;
                    sc.i++; sc.t = 0;
                    continue;
                }
                if (!tr.startet) {
                    tr.startet = true;
                    if (tr.gaa !== undefined) { L.maalX = typeof tr.gaa === "function" ? tr.gaa.call(this) : tr.gaa; L.loeb = !!tr.loeb; }
                    if (tr.sig) this.laererSig(tr.sig, tr.vis);
                    if (tr.arm !== undefined) { L.armFra = L.arm; L.armTil = tr.arm; }
                }
                sc.t += rest;
                rest = 0;
                var t = tr.tid ? Math.min(1, sc.t / tr.tid) : 1;
                if (tr.arm !== undefined) L.arm = NK.lerp(L.armFra, L.armTil, NK.blod(t));
                if (tr.hver) tr.hver.call(this, t);
                var klar = t >= 1;
                if (tr.gaa !== undefined) klar = Math.abs(L.x - L.maalX) < 1;
                if (!klar) break;
                sc.i++;
                sc.t = 0;
            }

            if (this.laererVentende) this.laererVentende();

            /* Gang */
            var fart = L.loeb ? 820 : 430;
            if (L.x !== L.maalX) {
                var d = L.maalX - L.x;
                L.x += Math.sign(d) * Math.min(Math.abs(d), fart * dt);
                L.gang += dt * (L.loeb ? 16 : 10);
            }
            if (L.x <= UDE + 1 && !L.scene) { L.klik = 0; L.roedMaal = 0; L.damp = 0; L.brillerMaal = 0; L.laenMaal = 0; }

            /* Udtryk, tale og blink */
            L.vrede = NK.mod(L.vrede, L.vredeMaal, 5, dt);
            L.humoer = NK.mod(L.humoer, L.humoerMaal, 5, dt);
            L.roed = NK.mod(L.roed, L.roedMaal, 3, dt);
            L.skeptisk = NK.mod(L.skeptisk, L.skeptiskMaal, 5, dt);
            L.briller = NK.mod(L.briller, L.brillerMaal, 6, dt);
            L.laen = NK.mod(L.laen, L.laenMaal, 6, dt);
            L.taleUr -= dt;
            L.taleAlfa = NK.mod(L.taleAlfa, L.taleUr > 0 ? 1 : 0, 12, dt);
            var taler = L.taleUr > 0 && this.tid - (L.taleStart || 0) < L.taleLaengde;
            L.aaben = NK.mod(L.aaben, taler ? 0.5 + 0.5 * Math.sin(this.tid * 22) : 0, 20, dt);
            L.blinkUr -= dt;
            if (L.blinkUr <= 0) { L.blink = 0.14; L.blinkUr = r(2, 5); }
            L.blink = Math.max(0, L.blink - dt);

            /* Damp af oererne */
            if (L.damp > 0) {
                L.damp -= dt;
                if (Math.random() < dt * 12) {
                    var hk = this.laererKrop();
                    var side = Math.random() < 0.5 ? -1 : 1;
                    L.dampe.push({ x: hk.x + side * 44, y: hk.y - 56, vx: side * r(20, 50), vy: -r(40, 80), r: r(4, 7), liv: 1 });
                }
            }
            for (i = L.dampe.length - 1; i >= 0; i--) {
                var dp = L.dampe[i];
                dp.x += dp.vx * dt;
                dp.y += dp.vy * dt;
                dp.r += dt * 10;
                dp.liv -= dt * 1.4;
                if (dp.liv <= 0) L.dampe.splice(i, 1);
            }

            if (this.opdaterLaererEkstra) this.opdaterLaererEkstra(dt);
        };

        /* ----- Tegning ----------------------------------------------------- */
        P.tegnAnsigt = function (ctx, L) {
            var i;
            var b = L.briller || 0, gy = b * 13;
            /* Roedme */
            if (L.roed > 0.02) {
                var g = ctx.createRadialGradient(55, 70, 10, 55, 66, 48);
                g.addColorStop(0, "rgba(225, 50, 40, " + (0.5 * L.roed).toFixed(3) + ")");
                g.addColorStop(1, "rgba(225, 50, 40, 0)");
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.ellipse(55, 66, 40, 50, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            /* Oejne: lukkede ved blink og suk; over brillerne kigger de op */
            var lukket = L.blink > 0 || (L.lukket || 0) > 0.4;
            for (i = 0; i < 2; i++) {
                var ox = i === 0 ? 37 : 73;
                if (lukket) {
                    ctx.strokeStyle = "#2a2f36";
                    ctx.lineWidth = 1.6;
                    ctx.beginPath();
                    ctx.moveTo(ox - 4, 61);
                    ctx.lineTo(ox + 4, 61);
                    ctx.stroke();
                } else {
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.ellipse(ox, 61, 5.2, 4.2 - L.vrede * 1.2, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#2a2f36";
                    ctx.beginPath();
                    ctx.arc(ox + 1.5, 61.5 - b * 2.2, 2.4, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            /* Briller: glider ned ad naesen med b */
            ctx.strokeStyle = "#23272e";
            ctx.lineWidth = 2.4;
            ctx.fillStyle = "rgba(200, 230, 255, 0.12)";
            [37, 73].forEach(function (bx) {
                ctx.beginPath();
                ctx.arc(bx, 60 + gy, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            });
            ctx.beginPath();
            ctx.moveTo(49, 59 + gy); ctx.quadraticCurveTo(55, 55 + gy, 61, 59 + gy);
            ctx.moveTo(25, 58 + gy); ctx.lineTo(15, 55 + gy * 0.4);
            ctx.moveTo(85, 58 + gy); ctx.lineTo(95, 55 + gy * 0.4);
            ctx.stroke();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(34, 56 + gy, 6, Math.PI * 1.1, Math.PI * 1.45);
            ctx.arc(70, 56 + gy, 6, Math.PI * 1.1, Math.PI * 1.45);
            ctx.stroke();
            /* Bryn: vrede saenker de inderste ender. Skeptisk: det hoejre bryn
               loeftes, og munden bliver skaev. Over brillerne loeftes begge */
            var v = L.vrede, hm = Math.max(0, L.humoer), sk = L.skeptisk || 0;
            ctx.strokeStyle = "#6d737a";
            ctx.lineWidth = 4.2;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(24, 42 + v * 1 - hm * 2 + sk * 2 - b * 3);
            ctx.lineTo(47, 42 + v * 8 - hm * 3 + sk * 2 - b * 3);
            ctx.moveTo(86, 42 + v * 1 - hm * 2 - sk * 11 - b * 3);
            ctx.lineTo(63, 42 + v * 8 - hm * 3 - sk * 7 - b * 3);
            ctx.stroke();
            /* Mund under overskaegget */
            var h = L.humoer;
            ctx.strokeStyle = "#7a3b2e";
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.moveTo(45, 98 - h * 2 + sk * 1.5);
            ctx.quadraticCurveTo(55, 98 + h * 7, 65, 98 - h * 2 - sk * 5);
            ctx.stroke();
            if (L.aaben > 0.05) {
                ctx.fillStyle = "#4a1f18";
                ctx.beginPath();
                ctx.ellipse(55, 99 + h * 2, 5.5, 1 + 4.5 * L.aaben, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        P.tegnBaaret = function (ctx, L) {
            if (!L.baerer) return;
            var hd = this.laererHaand();
            if (L.baerer === "kaffekop") {
                NK.Sprites.tegnPositur(ctx, "kaffekop", { x: hd.x + 8, y: hd.y + 26, v: 0 }, S.ANKER.kaffekop);
            } else if (this.tegnBaaretEkstra) {
                this.tegnBaaretEkstra(ctx, L, hd);
            }
        };

        P.tegnLaerer = function (ctx, tid) {
            var L = this.laerer;
            if (!L) return;
            var i;
            if (this.tegnLaererFoer) this.tegnLaererFoer(ctx, tid, L);
            if (L.x < UDE + 40 && !L.scene) return;
            var krop = this.laererKrop();
            var sk = this.laererSkulder();
            var armBag = Math.abs(L.arm) > 2;
            var armPositur = { x: sk.x, y: sk.y, v: L.arm };

            if (armBag) NK.Sprites.tegnPositur(ctx, "laererArm", armPositur, S.ANKER.laererArm);

            /* Kitlen fortsaetter ned under spritet, saa den ikke slutter
               midt paa en bred skaerm */
            var kv = NK.tilVerden(krop, S.ANKER.laererKrop, 15, 246);
            var kh = NK.tilVerden(krop, S.ANKER.laererKrop, 205, 246);
            var kg = ctx.createLinearGradient(kv.x, 0, kh.x, 0);
            kg.addColorStop(0, "#c9d2da");
            kg.addColorStop(0.3, "#f7f9fb");
            kg.addColorStop(0.7, "#eef2f5");
            kg.addColorStop(1, "#bcc6cf");
            ctx.fillStyle = kg;
            ctx.fillRect(kv.x, kv.y, kh.x - kv.x, 1500);
            ctx.fillStyle = "#9aa6b1";
            ctx.fillRect(krop.x - 1, kv.y, 2, 1500);
            NK.Sprites.tegnPositur(ctx, "laererKrop", krop, S.ANKER.laererKrop);

            var ryst = L.taleUr > 0 ? Math.sin(tid * 9) * 0.05 * L.vrede * (L.humoer < 0 ? 1 : 0) : 0;
            var hoved = {
                x: krop.x + L.hovedDx + L.laen * 10,
                y: krop.y + 14 + L.nik + L.hovedDy,
                v: krop.v + ryst + L.hovedV + L.laen * 0.18
            };
            NK.Sprites.tegnPositur(ctx, "laererHoved", hoved, S.ANKER.laererHoved);
            ctx.save();
            ctx.translate(hoved.x, hoved.y);
            ctx.rotate(hoved.v);
            ctx.translate(-S.ANKER.laererHoved.x, -S.ANKER.laererHoved.y);
            this.tegnAnsigt(ctx, L);
            ctx.restore();

            if (!armBag) NK.Sprites.tegnPositur(ctx, "laererArm", armPositur, S.ANKER.laererArm);
            this.tegnBaaret(ctx, L);

            ctx.save();
            for (i = 0; i < L.dampe.length; i++) {
                var d = L.dampe[i];
                ctx.globalAlpha = NK.klamp(d.liv, 0, 1) * 0.7;
                ctx.fillStyle = "#f4f6f8";
                ctx.beginPath();
                ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();

            var top = krop.y - 118;
            tegnTaleboble(ctx, krop.x + 150, top - 44, L.tale, L.taleAlfa, krop.x + 52, top + 50);
        };
    }

    NK.Kemichael = {
        UDE: UDE,
        KANT: KANT,
        HAENGER: HAENGER,
        MAPPE: MAPPE,
        SPRITES: SPRITES,
        ANKER: ANKER,
        GLIMT: GLIMT,
        tegnTaleboble: tegnTaleboble,
        paa: paa,
        glimt: glimt,
        glimtTrin: glimtTrin,
        uheld: uheld,
        glimtNulstil: glimtNulstil,
        suk: suk
    };
}());
