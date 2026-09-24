/* =====================================================================
   sim_vand.js - fane 2: Opløs i vand

   Et baegerglas. Saltet ligger som en krystal (se gitter.js), og naar
   det opløses, rives ionerne løs én ad gangen og svoemmer rundt hver
   for sig. De sammensatte ioner holder sammen hele vejen.

   Sandkassen: vaelg et salt, og laeg det i vandet. Letopløselige salte
   gaar i opløsning, og ligningen staar over glasset. Tungtopløselige
   bliver liggende.

   Opgavekortet har én knap (se opgave.js). To slags opgaver skiftes:
     forudsig  saltet ligger i et tomt glas. Hvad kommer der ud, naar
               der haeldes vand paa? Saa fyldes glasset, og saltet
               opløses.
     hvilket   ionerne svoemmer allerede. Hvilket salt er det? Saa
               fordamper vandet, og krystallen samles igen.

   Paaskeaeg: klik i vandet, og der roeres rundt.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    /* Maal i sprites/baegerglas.svg (200 x 240): inderside x 21-179,
       bund y 229, fuldt glas ved y 40. Hjoerneradius 7. */
    var SPRITE = { b: 200, h: 240, venstre: 21, hoejre: 179, bund: 229, fuld: 40, hjoerne: 7 };
    var billede = new Image(), billedeKlar = false;
    billede.onload = function () { billedeKlar = true; };
    billede.src = "sprites/baegerglas.svg";

    NK.SimVand = function () {
        var mig = this;
        this.l = new NK.Laerred(NK.el("vand-laerred"));
        this.svar = new NK.Svarknapper(NK.el("vand-valg"), function (v, rigtig) { mig.svaret(v, rigtig); });
        this.vaelger = new NK.Opgavevaelger(D.VAND_OPGAVER, 8);
        this.loeste = 0;
        this.nr = 0;
        this.opgave = null;          /* null: sandkassen */
        this.knaptrin = "start";
        this.ioner = [];
        this.niveau = 1;             /* vandet, 0 = tomt, 1 = fuldt */
        this.niveauMaal = 1;
        this.ur = 0;
        this.roer = 0;
        this.fase = "tom";
        this.G = this.maal();

        this.fyldVaelgere();
        NK.el("vand-haeld").addEventListener("click", function () { mig.haeldFrit(); });
        NK.el("vand-opgaveknap").addEventListener("click", function () { mig.opgaveKnap(); });
        NK.el("vand-afslut").addEventListener("click", function () { mig.visFrit(); mig.haeldFrit(); });
        /* Kemichael (laerer.js) tegnes paa samme laerred. Et klik paa ham
           gaar til ham, ikke til glasset. */
        this.L = this.l;
        this.tid = 0;
        NK.el("vand-spring").addEventListener("click", function () { mig.springIntro(); });
        this.l.canvas.addEventListener("click", function (e) {
            var r = mig.l.canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
            if (mig.laererIntroKlik && mig.laererIntroKlik(x, y)) return;
            if (mig.laererKlik && mig.laererKlik(x, y)) return;
            mig.klik(x, y);
        });
        if (this.laererStart) this.laererStart();

        this.visFrit();
        this.haeldSalt("Al", "SO4");
    };

    NK.SimVand.prototype.fyldVaelgere = function () {
        function fyld(id, ioner, valgt) {
            var v = NK.el(id);
            v.innerHTML = "";
            ioner.forEach(function (ion) {
                var o = document.createElement("option");
                o.value = ion.id;
                o.textContent = D.ionTekst(ion) + "  " + D.ionNavn(ion);
                v.appendChild(o);
            });
            v.value = valgt;
        }
        fyld("vand-kat", D.KATIONER, "Al");
        fyld("vand-an", D.VAND_ANIONER.map(D.ion), "SO4");
    };

    NK.SimVand.prototype.saetKnap = function (trin) {
        this.knaptrin = trin;
        NK.saetKnaptrin("vand-opgaveknap", trin);
    };

    NK.SimVand.prototype.besked = function (id, html, klasse) {
        NK.saetHTML(id, html || "");
        NK.saetKlasse(id, "besked" + (klasse ? " " + klasse : ""));
    };

    /* ----- Sandkassen ------------------------------------------------------ */
    NK.SimVand.prototype.visFrit = function () {
        this.opgave = null;
        this.svar.ryd();
        NK.el("vand-saltkort").hidden = false;
        NK.el("vand-opgavetekst").hidden = false;
        NK.el("vand-afslut").hidden = true;
        NK.saetHTML("vand-spm", "");
        this.besked("vand-besked", "");
        NK.saetHTML("vand-hint", "");
        this.saetKnap("start");
    };

    NK.SimVand.prototype.haeldFrit = function () {
        this.haeldSalt(NK.el("vand-kat").value, NK.el("vand-an").value);
    };

    /* Laeg et salt i et glas med vand. Fane 1 kalder den direkte, saa man
       kan opløse det salt, man selv har bygget. */
    NK.SimVand.prototype.haeldSalt = function (katId, anId) {
        var kat = D.ion(katId), an = D.ion(anId);
        var salt = D.salt(kat.id, an.id);
        if (this.opgave) this.visFrit();
        NK.el("vand-kat").value = kat.id;
        if (D.VAND_ANIONER.indexOf(an.id) >= 0) NK.el("vand-an").value = an.id;
        this.saetSalt(salt);
        this.niveau = this.niveauMaal = 1;
        this.art = D.oploeselighed(kat, an);

        if (this.art === "findes-ikke") {
            this.ioner = [];
            this.fase = "tom";
            this.besked("vand-note", "<b>" + salt.formel + "</b>: " + D.findesIkke(kat, an), "gul");
        } else if (this.art === "reagerer") {
            this.ioner = [];
            this.fase = "tom";
            this.besked("vand-note", "<b>" + salt.formel + "</b> reagerer med vandet. Det viser denne animation ikke.", "gul");
        } else {
            this.besked("vand-note", this.art === "tung"
                ? "<b>" + salt.formel + "</b> er tungtopløseligt. Det bliver liggende."
                : "<b>" + salt.formel + "</b> er letopløseligt. Ionerne går fra hinanden.", this.art === "tung" ? "gul" : "god");
            this.lavKrystal(this.art === "tung" ? "tung" : "oploes");
        }
    };

    NK.SimVand.prototype.saetSalt = function (salt) {
        this.salt = salt;
        this._layout = NK.lavGitter(salt);
        this.k = this._layout.k;
        this.ligning = false;
    };

    /* ----- Opgaverne -------------------------------------------------------- */
    NK.SimVand.prototype.opgaveKnap = function () {
        if (this.knaptrin === "hint") this.visHint();
        else if (this.knaptrin === "svar") this.visSvar();
        else this.nyOpgave();
    };

    NK.SimVand.prototype.nyOpgave = function () {
        var o = this.vaelger.naeste();
        this.startOpgave(D.salt(o.kat, o.an), this.nr % 2 === 0 ? "forudsig" : "hvilket");
        this.nr++;
    };

    NK.SimVand.prototype.startOpgave = function (salt, type) {
        this.opgave = { salt: salt, type: type, vist: false, faerdig: false };
        this.saetSalt(salt);
        NK.el("vand-saltkort").hidden = true;
        NK.el("vand-opgavetekst").hidden = false;
        NK.el("vand-afslut").hidden = false;
        this.besked("vand-besked", "");
        NK.saetHTML("vand-hint", "");
        this.saetKnap("hint");

        if (type === "forudsig") {
            NK.saetTekst("vand-opgavetekst", "Der hældes vand på saltet. Hvad kommer der ud i vandet?");
            NK.saetHTML("vand-spm", '<span class="lign-v">' + D.oploesVenstre(salt) + "  →</span>");
            this.svar.vis(D.oploesValg(salt));
            this.niveau = this.niveauMaal = 0;
            this.lavKrystal("vent");
        } else {
            NK.saetTekst("vand-opgavetekst", "Tæl ionerne i glasset. Hvilket salt er opløst?");
            NK.saetHTML("vand-spm", "");
            this.svar.vis(D.saltValg(salt, this.k));
            this.niveau = this.niveauMaal = 1;
            this.lavFrie();
        }
    };

    NK.SimVand.prototype.svaret = function (v, rigtig) {
        this.besked("vand-besked", (rigtig ? "<b>Rigtigt.</b> " : "") + v.forklaring, rigtig ? "god" : "skidt");
        if (rigtig) this.afslut(true);
    };

    NK.SimVand.prototype.hint = function () {
        var s = this.opgave.salt;
        if (this.opgave.type === "forudsig") {
            var sam = s.an.sammensat ? s.an : (s.kat.sammensat ? s.kat : null);
            return s.formel + " er " + s.p + " " + s.kat.formel + " og " + s.n + " " + s.an.formel + "."
                + (sam ? " " + D.ionTekst(sam) + " går ikke i stykker." : "");
        }
        return "Tæl de røde og de blå hver for sig. Formlen viser det mindste forhold.";
    };

    NK.SimVand.prototype.visHint = function () {
        if (!this.opgave || this.opgave.faerdig) return;
        NK.saetHTML("vand-hint", "<b>Hint:</b> " + this.hint());
        this.saetKnap("svar");
    };

    NK.SimVand.prototype.visSvar = function () {
        if (!this.opgave || this.opgave.faerdig) return;
        this.opgave.vist = true;
        this.svar.visRigtig();
        var r = this.svar.rigtig();
        this.besked("vand-besked", r ? r.forklaring : "", "gul");
        this.afslut(false);
    };

    NK.SimVand.prototype.afslut = function (loest) {
        var o = this.opgave;
        o.faerdig = true;
        if (loest && !o.vist) {
            this.loeste++;
            NK.saetTekst("vand-loest", String(this.loeste));
        }
        this.saetKnap("ny");
        if (o.type === "forudsig") this.startFyld();
        else this.startInddampning();
    };

    /* ----- Krystallen og ionerne -------------------------------------------- */
    function nyIon(ion) {
        return { ion: ion, x: NaN, y: NaN, mx: 0, my: 0, vx: 0, vy: 0, a: 0, fri: false, boost: 0, vent: 0, idx: 0 };
    }

    /* Krystallen daler ned i glasset og lander i bunden. efter siger,
       hvad der saa sker: "oploes", "tung" eller "vent" (paa svaret). */
    NK.SimVand.prototype.lavKrystal = function (efter) {
        var mig = this;
        this.ioner = this._layout.punkter.map(function (p, idx) {
            var ion = nyIon(p.side === "kat" ? mig.salt.kat : mig.salt.an);
            ion.idx = idx;
            return ion;
        });
        this.fase = "falder";
        this.faldTid = 0;
        this.efterLanding = efter;
    };

    /* Ionerne svoemmer allerede rundt, spredt i vandet. */
    NK.SimVand.prototype.lavFrie = function () {
        var mig = this;
        this.ioner = NK.bland(this._layout.punkter.map(function (p, idx) { return { side: p.side, idx: idx }; }))
            .map(function (x) {
                var o = nyIon(x.side === "kat" ? mig.salt.kat : mig.salt.an);
                o.idx = x.idx;
                o.fri = true;
                o.vx = (Math.random() - 0.5) * 50;
                o.vy = (Math.random() - 0.5) * 50;
                return o;
            });
        this.fase = "oploest";
    };

    NK.SimVand.prototype.startOploesning = function () {
        /* Oeverste lag og yderste ioner slipper foerst. */
        var midt = this.G.cx;
        this.koe = this.ioner.slice().sort(function (a, b) {
            return (a.my - b.my) || (Math.abs(b.mx - midt) - Math.abs(a.mx - midt));
        });
        this.fase = "oploeser";
        this.naeste = 0.15;
    };

    /* Forudsig: vandet haeldes paa, og saltet gaar i opløsning. */
    NK.SimVand.prototype.startFyld = function () {
        this.niveauMaal = 1;
        this.fyldTid = 0;
        if (this.fase === "falder") this.efterLanding = "fyld";
        else this.fase = "fylder";
    };

    /* Hvilket: vandet fordamper, og ionerne finder deres plads i gitteret. */
    NK.SimVand.prototype.startInddampning = function () {
        for (var i = 0; i < this.ioner.length; i++) {
            var ion = this.ioner[i];
            ion.fri = false;
            ion.vent = 0.4 + Math.random() * 1.6;
        }
        this.niveauMaal = 0;
        this.fase = "inddamper";
        this.inddampTid = 0;
        this.ligning = false;
    };

    /* ----- Paaskeaeg: roer rundt ---------------------------------------- */
    NK.SimVand.prototype.klik = function (x, y) {
        var G = this.G;
        if (!G || !G.klar || this.niveau < 0.25) return false;
        if (x < G.vl || x > G.vh || y < G.wy || y > G.vb) return false;
        this.roer = 1;
        for (var i = 0; i < this.ioner.length; i++) {
            var ion = this.ioner[i];
            if (!ion.fri) continue;
            ion.vx += (Math.random() - 0.5) * 220;
            ion.vy += (Math.random() - 0.5) * 180;
            ion.boost = 0.8;
        }
        return true;
    };

    /* ----- Glasset ---------------------------------------------------------- */
    NK.SimVand.prototype.maal = function () {
        var W = Math.max(this.l.b, 320), H = Math.max(this.l.h, 320);
        var top = 64, bundLuft = 18;
        var h = Math.min(H - top - bundLuft, (W - 40) * SPRITE.h / SPRITE.b, 660);
        var b = h * SPRITE.b / SPRITE.h;
        var x = (W - b) / 2;
        var y = top + Math.max(0, (H - top - bundLuft - h) / 2);
        var sk = b / SPRITE.b;
        var vl = x + SPRITE.venstre * sk, vh = x + SPRITE.hoejre * sk;
        var vb = y + SPRITE.bund * sk, vt = y + SPRITE.fuld * sk;
        var iw = vh - vl;
        return { W: W, H: H, x: x, y: y, b: b, h: h, sk: sk, vl: vl, vh: vh, vb: vb, hFuld: vb - vt, iw: iw,
                 cx: (vl + vh) / 2, s: NK.klamp(iw * 0.64 / 13.5, 10, 24),
                 wy: vb - (vb - vt) * this.niveau, klar: this.l.b > 50 };
    };

    NK.SimVand.prototype.radius = function (ion) {
        return NK.ionRadiusVand(ion.ion) * this.G.s;
    };

    /* Pladsen i gitteret, skaleret til glassets stoerrelse. Rystes der i
       glasset, loeftes krystallen og synker igen. */
    NK.SimVand.prototype.pladsXY = function (ion) {
        var p = this._layout.punkter[ion.idx], G = this.G;
        var loeft = 0;
        if (this.roer > 0 && this.niveau > 0.25 && (this.fase === "tung" || this.fase === "inddampet")) {
            loeft = this.roer * G.hFuld * 0.22 * (0.7 + 0.3 * Math.sin(this.ur * 5 + p.x));
        }
        return { x: G.cx + p.x * G.s + (loeft ? Math.sin(this.ur * 3 + p.y) * loeft * 0.25 : 0),
                 y: G.vb - 2 - p.y * G.s - loeft };
    };

    /* ----- Bevaegelse ----------------------------------------------------- */
    NK.SimVand.prototype.tilpas = function () { this.l.tilpas(); };

    /* R: samme salt eller samme opgave forfra. */
    NK.SimVand.prototype.nulstil = function () {
        if (this.opgave) this.startOpgave(this.opgave.salt, this.opgave.type);
        else this.haeldFrit();
    };

    NK.SimVand.prototype.opdater = function (dt) {
        this.ur += dt;
        this.tid += dt;
        if (this.opdaterIntro) this.opdaterIntro(dt);
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.roer = Math.max(0, this.roer - dt * 0.6);
        var fart = this.fase === "inddamper" ? 0.9 : (this.fase === "fylder" ? 1.4 : 3);
        this.niveau = NK.mod(this.niveau, this.niveauMaal, fart, dt);
        if (Math.abs(this.niveau - this.niveauMaal) < 0.002) this.niveau = this.niveauMaal;
        var G = this.G = this.maal();
        if (!G.klar) return;
        var i, ion;

        if (this.fase === "falder") {
            this.faldTid += dt;
            if (this.faldTid > 1.1) {
                this.fase = "krystal";
                var efter = this.efterLanding;
                this.efterLanding = null;
                if (efter === "oploes") this.startOploesning();
                else if (efter === "tung") { this.fase = "tung"; this.tungTid = 0; }
                else if (efter === "fyld") { this.fase = "fylder"; this.fyldTid = 0; }
            }
        } else if (this.fase === "fylder") {
            this.fyldTid += dt;
            if (this.fyldTid > 1.2) this.startOploesning();
        } else if (this.fase === "oploeser") {
            this.naeste -= dt * (1 + this.roer * 3);
            if (this.naeste <= 0) {
                ion = this.koe.shift();
                if (ion) {
                    ion.fri = true;
                    ion.boost = 0.7;
                    ion.vx = (ion.x - G.cx) * 0.8 + (Math.random() - 0.5) * 60;
                    ion.vy = -110 - Math.random() * 50;
                    this.naeste = 0.24;
                } else {
                    this.fase = "oploest";
                    this.ligning = true;
                }
            }
        } else if (this.fase === "tung") {
            this.tungTid += dt;
        } else if (this.fase === "inddamper") {
            this.inddampTid += dt;
            if (this.inddampTid > 3.2) this.fase = "inddampet";
        }

        for (i = 0; i < this.ioner.length; i++) {
            ion = this.ioner[i];
            if (!ion.fri) {
                var p = this.pladsXY(ion);
                ion.mx = p.x;
                ion.my = p.y;
            }
            if (isNaN(ion.x)) {
                /* Foerste billede, hvor glasset har en stoerrelse. */
                if (ion.fri) {
                    ion.x = G.vl + 30 + Math.random() * (G.iw - 60);
                    ion.y = G.wy + 30 + Math.random() * Math.max(10, G.vb - G.wy - 60);
                } else {
                    ion.x = ion.mx;
                    ion.y = ion.my - (G.vb - G.y) - 20;
                }
            }
            if (ion.fri || ion.vent > 0) {
                if (ion.vent > 0) ion.vent -= dt;
                this.svoem(ion, dt, G);
            } else {
                ion.x = NK.mod(ion.x, ion.mx, 5, dt);
                ion.y = NK.mod(ion.y, ion.my, this.fase === "falder" ? 3.2 : 4.5, dt);
                ion.a = NK.mod(ion.a, 1, 4, dt);
            }
        }
        this.skub(G);
    };

    /* Tilfaeldig drift, som vandmolekylerne puffer til ionerne. Roeres
       der, drejer vandet rundt om glassets midte. */
    NK.SimVand.prototype.svoem = function (ion, dt, G) {
        var R = this.radius(ion);
        ion.vx += (Math.random() - 0.5) * 240 * dt;
        ion.vy += (Math.random() - 0.5) * 240 * dt;
        if (this.roer > 0) {
            var cy = (G.wy + G.vb) / 2;
            ion.vx += -(ion.y - cy) * 4 * this.roer * dt;
            ion.vy += (ion.x - G.cx) * 4 * this.roer * dt;
        }
        var daemp = Math.exp(-1.3 * dt);
        ion.vx *= daemp;
        ion.vy *= daemp;
        ion.boost = Math.max(0, ion.boost - dt);
        var loft = ion.boost > 0 || this.roer > 0.2 ? 160 : 60;
        var fart = Math.sqrt(ion.vx * ion.vx + ion.vy * ion.vy);
        if (fart > loft) { ion.vx *= loft / fart; ion.vy *= loft / fart; }
        ion.x += ion.vx * dt;
        ion.y += ion.vy * dt;
        ion.a = NK.mod(ion.a, 1, 4, dt);
        var v = G.vl + 4 + R, h = G.vh - 4 - R;
        var b = G.vb - R - 3, t = Math.min(G.wy + R + 4, b);
        if (ion.x < v) { ion.x = v; ion.vx = Math.abs(ion.vx); }
        if (ion.x > h) { ion.x = h; ion.vx = -Math.abs(ion.vx); }
        if (ion.y < t) { ion.y = t; ion.vy = Math.abs(ion.vy); }
        if (ion.y > b) { ion.y = b; ion.vy = -Math.abs(ion.vy); }
    };

    /* Frie ioner glider fra hinanden, saa de ikke ligger oven i hinanden. */
    NK.SimVand.prototype.skub = function (G) {
        var i, j;
        for (i = 0; i < this.ioner.length; i++) {
            var a = this.ioner[i];
            if (!a.fri) continue;
            var ra = this.radius(a);
            for (j = i + 1; j < this.ioner.length; j++) {
                var b = this.ioner[j];
                if (!b.fri) continue;
                var dx = b.x - a.x, dy = b.y - a.y;
                var d = Math.sqrt(dx * dx + dy * dy) || 0.01;
                var min = ra + this.radius(b) + 6;
                if (d < min) {
                    var f = (min - d) * 0.5 / d;
                    a.x -= dx * f; a.y -= dy * f;
                    b.x += dx * f; b.y += dy * f;
                }
            }
        }
    };

    /* ----- Tegning -------------------------------------------------------- */
    NK.SimVand.prototype.tegn = function () {
        var l = this.l, c = l.ctx, G = this.G;
        l.ryd("#14141a");
        if (!G || !G.klar) return;
        this.tegnVand(c, G);

        var ryst = this.fase === "tung" && this.tungTid < 1.6 ? 1.6 * (1 - this.tungTid / 1.6) : 0;
        for (var i = 0; i < this.ioner.length; i++) {
            var ion = this.ioner[i];
            if (isNaN(ion.x)) continue;
            var dx = ryst ? Math.sin(this.ur * 26 + i * 1.7) * ryst : 0;
            NK.tegnKugle(c, ion.ion, ion.x + dx, ion.y, this.radius(ion), {
                alpha: ion.a, glorie: ion.fri, ladning: ion.fri
            });
        }
        if (billedeKlar) c.drawImage(billede, G.x, G.y, G.b, G.h);
        this.tegnStraale(c, G);
        this.tegnOverskrift(c, G);
        if (this.laererTegnOver) this.laererTegnOver(c);
    };

    /* Vandet bag glasset: samme inderside som i sprites/baegerglas.svg. */
    NK.SimVand.prototype.tegnVand = function (c, G) {
        if (this.niveau < 0.004) return;
        var r = SPRITE.hjoerne * G.sk, wy = G.wy;
        c.save();
        var grd = c.createLinearGradient(0, wy, 0, G.vb);
        grd.addColorStop(0, "rgba(61, 158, 224, 0.14)");
        grd.addColorStop(1, "rgba(61, 158, 224, 0.30)");
        c.fillStyle = grd;
        c.beginPath();
        c.moveTo(G.vl, wy);
        c.lineTo(G.vh, wy);
        c.lineTo(G.vh, G.vb - r);
        c.quadraticCurveTo(G.vh, G.vb, G.vh - r, G.vb);
        c.lineTo(G.vl + r, G.vb);
        c.quadraticCurveTo(G.vl, G.vb, G.vl, G.vb - r);
        c.closePath();
        c.fill();
        /* Overfladen boelger en smule, mere naar der roeres. */
        var boelge = 1.6 + this.roer * 5;
        c.strokeStyle = "rgba(143, 202, 240, 0.55)";
        c.lineWidth = 1.5;
        c.beginPath();
        for (var x = G.vl + 2; x <= G.vh - 2; x += 6) {
            var y = wy + Math.sin(x * 0.045 + this.ur * 1.6) * boelge;
            if (x === G.vl + 2) c.moveTo(x, y); else c.lineTo(x, y);
        }
        c.stroke();
        c.restore();
    };

    /* Vandet, der haeldes paa i en forudsig-opgave. */
    NK.SimVand.prototype.tegnStraale = function (c, G) {
        if (this.fase !== "fylder" && !(this.fase === "oploeser" && this.niveau < 0.97 && this.niveauMaal === 1)) return;
        var styrke = NK.klamp(1 - this.niveau, 0, 0.35) / 0.35;
        if (styrke <= 0.02) return;
        var x = G.vl + G.iw * 0.8;
        c.save();
        c.strokeStyle = "rgba(140, 190, 240, " + (0.4 * styrke).toFixed(3) + ")";
        c.lineWidth = 7 * G.sk * styrke + 2;
        c.lineCap = "round";
        c.beginPath();
        c.moveTo(x + 30, G.y - 30);
        c.quadraticCurveTo(x + 8, G.y, x, G.wy);
        c.stroke();
        c.restore();
    };

    /* Ligningen over glasset, naar saltet er opløst. Formlen med (s)
       over krystallen, mens den er fast. */
    NK.SimVand.prototype.tegnOverskrift = function (c, G) {
        var s = this.salt;
        if (!s) return;
        if (this.ligning) {
            var font = "600 " + NK.klamp(G.W / 40, 14, 21).toFixed(0) + "px 'Segoe UI', sans-serif";
            NK.tekstDele(c, [
                { t: D.oploesVenstre(s), farve: "#f2f3f5" },
                { t: "   →   ", farve: "#7e8590" },
                { t: D.ionLed(s.kat, s.p), farve: "#f39a8f" },
                { t: "  +  ", farve: "#7e8590" },
                { t: D.ionLed(s.an, s.n), farve: "#8fcaf0" }
            ], G.W / 2, 34, { font: font, kant: true });
        }
        var fast = this.fase === "falder" || this.fase === "krystal" || this.fase === "tung" || this.fase === "fylder"
            || this.fase === "inddampet" || (this.fase === "inddamper" && this.inddampTid > 2);
        if (!fast || !this.ioner.length) return;
        var top = Infinity;
        for (var i = 0; i < this.ioner.length; i++) {
            var ion = this.ioner[i];
            if (isNaN(ion.y)) return;
            top = Math.min(top, (this.fase === "falder" ? ion.y : ion.my) - this.radius(ion));
        }
        var y = top - 14;
        NK.tekst(c, D.oploesVenstre(s), G.cx, y, {
            font: "700 17px 'Segoe UI', sans-serif", justering: "center", linje: "bottom",
            farve: "#f2f3f5", kant: true
        });
        if (this.fase === "inddampet" || this.fase === "inddamper") {
            NK.tekst(c, s.navn, G.cx, y - 24, {
                font: "600 14px 'Segoe UI', sans-serif", justering: "center", linje: "bottom", farve: "#a9b0ba", kant: true
            });
        }
    };
}());
