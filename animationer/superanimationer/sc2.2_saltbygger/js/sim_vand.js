/* =====================================================================
   sim_vand.js - fane 2: Opløs i vand

   Et baegerglas med vand. Et salt ligger som en lille krystal i bunden,
   og naar det opløses, rives ionerne løs én ad gangen og svoemmer rundt
   hver for sig. De sammensatte ioner holder sammen hele vejen - de
   drejer og driver som én enhed. Det er den vigtigste pointe her.

   To slags opgaver skiftes:
     forudsig  saltet ligger i glasset - hvad kommer der ud i vandet?
               Svarer man rigtigt, opløses det, og ligningen staar.
     hvilket   ionerne svoemmer allerede - hvilket salt er det? Svarer
               man rigtigt, fordamper vandet, og krystallen samles igen.
   Desuden kan man vaelge et salt frit. Er det tungtopløseligt, bliver
   det liggende som bundfald - ligesom i fældningsforsøgene.

   Alle placeringer regnes ud fra glassets stoerrelse hvert billede,
   saa det passer, ogsaa hvis vinduet aendrer stoerrelse undervejs.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    NK.SimVand = function () {
        var mig = this;
        this.l = new NK.Laerred(NK.el("vand-laerred"));
        this.svar = new NK.Svarknapper(NK.el("vand-valg"), function (v, rigtig) { mig.svaret(v, rigtig); });
        this.vaelger = new NK.Opgavevaelger(D.VAND_OPGAVER, 8);
        this.loeste = 0;
        this.nr = 0;
        this.ioner = [];
        this.niveau = 0.84;
        this.niveauMaal = 0.84;
        this.ur = 0;
        this.fase = "tom";
        this.G = this.maal();

        this.fyldVaelgere();
        NK.el("vand-ny").addEventListener("click", function () { mig.nyOpgave(); });
        NK.el("vand-vis").addEventListener("click", function () { mig.visSvar(); });
        NK.el("vand-haeld").addEventListener("click", function () { mig.haeldFrit(); });
        this.nyOpgave();
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
        fyld("vand-kat", D.KATIONER, "Ca");
        fyld("vand-an", D.VAND_ANIONER.map(D.ion), "PO4");
    };

    /* ----- Opgaverne ------------------------------------------------------ */
    NK.SimVand.prototype.nyOpgave = function () {
        var o = this.vaelger.naeste();
        this.startOpgave(D.salt(o.kat, o.an), this.nr % 2 === 0 ? "forudsig" : "hvilket");
        this.nr++;
    };

    NK.SimVand.prototype.startOpgave = function (salt, type) {
        this.mode = "opgave";
        this.type = type;
        this.vist = false;
        this.besvaret = false;
        this.saetSalt(salt);
        NK.saetHTML("vand-svar", "");
        NK.saetKlasse("vand-svar", "besked");
        NK.el("vand-ny").classList.remove("banker");
        NK.el("vand-vis").disabled = false;
        NK.el("vand-valg").style.display = "";

        if (type === "forudsig") {
            NK.saetTekst("vand-overskrift", "Hvad kommer der ud i vandet?");
            NK.saetHTML("vand-spm", '<span class="lign-v">' + D.oploesVenstre(salt) + "  →</span>");
            this.svar.vis(D.oploesValg(salt));
            this.lavKrystal();
        } else {
            NK.saetTekst("vand-overskrift", "Hvilket salt er opløst?");
            NK.saetHTML("vand-spm", "Tæl ionerne i glasset. Hvilket salt kommer de fra?");
            this.svar.vis(D.saltValg(salt, this.k));
            this.lavFrie();
        }
    };

    NK.SimVand.prototype.saetSalt = function (salt) {
        this.salt = salt;
        this.k = NK.klamp(Math.round(10 / (salt.p + salt.n)), 2, 4);
        this.ligning = false;
        this.niveauMaal = 0.84;
        this.efterLanding = null;
        this.art = "let";
    };

    NK.SimVand.prototype.svaret = function (v, rigtig) {
        NK.saetHTML("vand-svar", (rigtig ? "<b>Rigtigt.</b> " : "") + v.forklaring);
        NK.saetKlasse("vand-svar", "besked " + (rigtig ? "god" : "skidt"));
        if (rigtig) this.afslut(true);
    };

    NK.SimVand.prototype.visSvar = function () {
        if (this.besvaret) return;
        this.vist = true;
        this.svar.visRigtig();
        var r = this.svar.rigtig();
        NK.saetHTML("vand-svar", r ? r.forklaring : "");
        NK.saetKlasse("vand-svar", "besked gul");
        this.afslut(false);
    };

    NK.SimVand.prototype.afslut = function (loest) {
        this.besvaret = true;
        if (loest && !this.vist) {
            this.loeste++;
            NK.saetTekst("vand-loest", String(this.loeste));
        }
        NK.el("vand-ny").classList.add("banker");
        NK.el("vand-vis").disabled = true;
        if (this.type === "forudsig") this.startOploesning();
        else this.startInddampning();
    };

    /* Frit valg: hæld et hvilket som helst af saltene i. Fane 1 kalder
       haeldSalt direkte, saa man kan opløse det salt, man selv har bygget. */
    NK.SimVand.prototype.haeldFrit = function () {
        this.haeldSalt(NK.el("vand-kat").value, NK.el("vand-an").value);
    };

    NK.SimVand.prototype.haeldSalt = function (katId, anId) {
        var kat = D.ion(katId), an = D.ion(anId);
        var salt = D.salt(kat.id, an.id);
        NK.el("vand-kat").value = kat.id;
        if (D.VAND_ANIONER.indexOf(an.id) >= 0) NK.el("vand-an").value = an.id;
        this.mode = "frit";
        this.type = "frit";
        this.besvaret = true;
        this.saetSalt(salt);
        this.art = D.oploeselighed(kat, an);
        this.svar.ryd();
        NK.el("vand-valg").style.display = "none";
        NK.saetTekst("vand-overskrift", "Frit valg");
        NK.el("vand-vis").disabled = true;
        NK.el("vand-ny").classList.remove("banker");
        NK.saetHTML("vand-spm", "<b>" + salt.navn + "</b>, " + salt.formel);

        if (this.art === "findes-ikke") {
            this.ioner = [];
            this.fase = "tom";
            this.tomBesked = "<b>" + salt.formel + "</b> findes ikke som fast stof, så der er intet at hælde i.";
            NK.saetHTML("vand-svar", D.findesIkke(kat, an));
            NK.saetKlasse("vand-svar", "besked gul");
        } else if (this.art === "reagerer") {
            this.ioner = [];
            this.fase = "tom";
            this.tomBesked = "<b>" + salt.formel + "</b> reagerer med vandet i stedet for bare at gå i opløsning.";
            NK.saetHTML("vand-svar", "Oxider og sulfider reagerer med vandet — det ligger uden for denne animation.");
            NK.saetKlasse("vand-svar", "besked gul");
        } else {
            NK.saetHTML("vand-svar", this.art === "tung"
                ? "Tungtopløseligt — det bliver liggende som bundfald."
                : "Letopløseligt — se det gå i opløsning.");
            NK.saetKlasse("vand-svar", "besked " + (this.art === "tung" ? "gul" : "god"));
            this.lavKrystal();
            this.efterLanding = this.art === "tung" ? "tung" : "oploes";
        }
    };

    /* ----- Glasset ---------------------------------------------------------- */
    NK.SimVand.prototype.maal = function () {
        var W = Math.max(this.l.b, 320), H = Math.max(this.l.h, 320);
        var bb = Math.min(W - 60, 540);
        var top = 78;
        var bh = Math.max(200, H - 24 - top);
        var bx = (W - bb) / 2;
        var s = NK.klamp(bb / 24, 11, 19);
        return { W: W, H: H, bx: bx, bb: bb, top: top, bund: top + bh, bh: bh, s: s,
                 wy: top + bh * (1 - this.niveau), klar: this.l.b > 50 };
    };

    /* ----- Krystalgitteret --------------------------------------------------
       Ionerne "falder på plads" ved en lille fysik-afslapning: modsatte
       ladninger trækker i hinanden til de rører hinanden, ens ladninger
       støder fra hinanden med luft imellem. Det er den samme regel, et
       rigtigt krystalgitter bygger på, så resultatet bliver tæt og
       sammenhængende af sig selv - også for forhold, der ikke går op i
       en pæn række, som 3:1 (fx K₃PO₄, hvor PO₄³⁻ ender omkranset af
       sine tre K⁺).

       Regnes ÉN gang pr. krystal i "enheds"-koordinater (radius = de
       rigtige ionradier, ikke ganget med laerredets skala), så resultatet
       er uafhaengigt af vinduets størrelse - det skaleres bare op hvert
       billede i pladsXY. ------------------------------------------------- */
    function settleKrystal(s, k) {
        var rKat = NK.ionGeo(s.kat).R, rAn = NK.ionGeo(s.an).R;
        var katN = k * s.p, anN = k * s.n, i;

        /* Start: løst spredt i en spiral (det gyldne vinkel-trick giver
           en jaevn, ikke-symmetrisk startopstilling), kationer og
           anioner blandet tilfældigt. */
        var liste = [];
        for (i = 0; i < katN; i++) liste.push("kat");
        for (i = 0; i < anN; i++) liste.push("an");
        liste = NK.bland(liste);
        var skridt = (rKat + rAn) * 1.3;
        var punkter = liste.map(function (side, idx) {
            var vinkel = idx * 2.399963;
            var rad = skridt * 0.55 * Math.sqrt(idx + 0.5);
            return { side: side, r: side === "kat" ? rKat : rAn,
                     x: Math.cos(vinkel) * rad, y: Math.sin(vinkel) * rad };
        });

        /* Fysikken koeres i to trin hver runde:
           1. Stoed: to ioner maa aldrig ligge taettere end deres egen
              radius tilsammen - og ens fortegn skal ovenikoebet holde
              en lille luftafstand (MARGIN). Gaelder ALLE par.
           2. Traek: hver ion soeger mod sin ENESTE naermeste modsatte
              nabo - ikke mod alle paa én gang. Trækker man i alle modsat
              ladede ioner samtidig (som fysikken ellers ville), bliver
              systemet overbestemt og kan aldrig lande et sted, hvor
              stoedet ogsaa er tilfredsstillet; med kun ét maal ad gangen
              finder hver ion en naturlig partner, ligesom en rigtig
              ionbinding. */
        var MARGIN = Math.min(rKat, rAn) * 0.32;
        var n = punkter.length;
        var runde, a, b;
        for (runde = 0; runde < 320; runde++) {
            for (a = 0; a < n; a++) {
                for (b = a + 1; b < n; b++) {
                    var pa = punkter[a], pb = punkter[b];
                    var dx = pb.x - pa.x, dy = pb.y - pa.y;
                    var dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
                    var samme = pa.side === pb.side;
                    var maal = pa.r + pb.r + (samme ? MARGIN : 0);
                    if (dist < maal) {
                        var f = (maal - dist) * 0.5 / dist;
                        pa.x -= dx * f; pa.y -= dy * f;
                        pb.x += dx * f; pb.y += dy * f;
                    }
                }
            }
            for (a = 0; a < n; a++) {
                var pa2 = punkter[a], bedst = -1, bedstD = Infinity, bedstDx = 0, bedstDy = 0;
                for (b = 0; b < n; b++) {
                    if (b === a || punkter[b].side === pa2.side) continue;
                    var ddx = punkter[b].x - pa2.x, ddy = punkter[b].y - pa2.y;
                    var dd = ddx * ddx + ddy * ddy;
                    if (dd < bedstD) { bedstD = dd; bedst = b; bedstDx = ddx; bedstDy = ddy; }
                }
                if (bedst < 0) continue;
                var afstand = Math.sqrt(bedstD) || 0.0001;
                var maalD = pa2.r + punkter[bedst].r;
                if (afstand > maalD) {
                    var traek = Math.min((afstand - maalD) * 0.1, 0.4) / afstand;
                    pa2.x += bedstDx * traek; pa2.y += bedstDy * traek;
                }
            }
        }

        /* Centrér vandret, og maal hvor stor klyngen blev, saa den kan
           bundes til gulvet i glasset og fylde det rigtige areal. */
        var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (i = 0; i < n; i++) {
            var p = punkter[i];
            minX = Math.min(minX, p.x - p.r); maxX = Math.max(maxX, p.x + p.r);
            minY = Math.min(minY, p.y - p.r); maxY = Math.max(maxY, p.y + p.r);
        }
        var midtX = (minX + maxX) / 2;
        punkter.forEach(function (p) {
            p.dx = p.x - midtX;
            p.dyFraBund = maxY - p.y;      /* 0 = klyngens nederste kant, vokser opad */
        });
        return { punkter: punkter, halvB: (maxX - minX) / 2, hoejde: maxY - minY };
    }

    /* Klyngen fra settleKrystal() er allerede formet - her skaleres den
       bare op til laerredets nuvaerende størrelse, saa den passer, ogsaa
       hvis vinduet aendrer størrelse undervejs. */
    NK.SimVand.prototype.pladsXY = function (ion) {
        var p = this._layout.punkter[ion.layoutIdx], G = this.G;
        return { x: G.bx + G.bb / 2 + p.dx * G.s, y: G.bund - 8 - p.dyFraBund * G.s };
    };

    function nyIon(ion) {
        return { ion: ion, x: NaN, y: NaN, mx: 0, my: 0, vx: 0, vy: 0, a: 0, fri: false, boost: 0, vent: 0,
                 layoutIdx: 0, vinkel: 0, vv: ion.sammensat ? (Math.random() - 0.5) * 1.4 : 0 };
    }

    /* Krystallen daler ned gennem vandet og lander i bunden. */
    NK.SimVand.prototype.lavKrystal = function () {
        var mig = this;
        this._layout = settleKrystal(this.salt, this.k);
        this.ioner = this._layout.punkter.map(function (p, idx) {
            var ion = nyIon(p.side === "kat" ? mig.salt.kat : mig.salt.an);
            ion.layoutIdx = idx;
            return ion;
        });
        this.fase = "falder";
        this.faldTid = 0;
    };

    /* Ionerne svoemmer allerede rundt, spredt i vandet. */
    NK.SimVand.prototype.lavFrie = function () {
        var s = this.salt, liste = [], i;
        for (i = 0; i < this.k * s.p; i++) liste.push(s.kat);
        for (i = 0; i < this.k * s.n; i++) liste.push(s.an);
        this.ioner = NK.bland(liste).map(function (ion) {
            var o = nyIon(ion);
            o.fri = true;
            o.vinkel = Math.random() * Math.PI * 2;
            o.vx = (Math.random() - 0.5) * 50;
            o.vy = (Math.random() - 0.5) * 50;
            return o;
        });
        this.fase = "oploest";
    };

    NK.SimVand.prototype.startOploesning = function () {
        if (this.fase === "falder") { this.efterLanding = "oploes"; return; }
        if (this.fase !== "krystal") return;
        /* Oeverste raekke og yderste ioner slipper foerst. */
        var midt = this.G.bx + this.G.bb / 2;
        this.koe = this.ioner.slice().sort(function (a, b) {
            return (b.my - a.my) || (Math.abs(b.mx - midt) - Math.abs(a.mx - midt));
        });
        this.fase = "oploeser";
        this.naeste = 0.15;
    };

    NK.SimVand.prototype.startInddampning = function () {
        this._layout = settleKrystal(this.salt, this.k);
        var ledige = { kat: [], an: [] };
        this._layout.punkter.forEach(function (p, idx) { ledige[p.side].push(idx); });
        for (var i = 0; i < this.ioner.length; i++) {
            var ion = this.ioner[i];
            ion.layoutIdx = ledige[ion.ion.q > 0 ? "kat" : "an"].shift();
            ion.fri = false;
            ion.vent = 0.4 + Math.random() * 1.6;
        }
        this.niveauMaal = 0.07;
        this.fase = "inddamper";
        this.inddampTid = 0;
    };

    /* ----- Bevaegelse ----------------------------------------------------- */
    NK.SimVand.prototype.tilpas = function () { this.l.tilpas(); };

    /* R: samme salt forfra. */
    NK.SimVand.prototype.nulstil = function () {
        if (this.mode === "frit") this.haeldFrit();
        else this.startOpgave(this.salt, this.type);
    };

    NK.SimVand.prototype.opdater = function (dt) {
        this.bevaeg(dt);
    };

    NK.SimVand.prototype.bevaeg = function (dt) {
        this.ur += dt;
        this.niveau = NK.mod(this.niveau, this.niveauMaal, this.fase === "inddamper" ? 0.9 : 3, dt);
        var G = this.G = this.maal();
        if (!G.klar) return;
        var i, ion;

        if (this.fase === "falder") {
            this.faldTid += dt;
            if (this.faldTid > 1.1) {
                this.fase = "krystal";
                if (this.efterLanding === "oploes") this.startOploesning();
                else if (this.efterLanding === "tung") { this.fase = "tung"; this.tungTid = 0; }
                this.efterLanding = null;
            }
        } else if (this.fase === "oploeser") {
            this.naeste -= dt;
            if (this.naeste <= 0) {
                ion = this.koe.shift();
                if (ion) {
                    ion.fri = true;
                    ion.boost = 0.7;
                    ion.vx = (ion.x - (G.bx + G.bb / 2)) * 0.8 + (Math.random() - 0.5) * 60;
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
                    ion.x = G.bx + 40 + Math.random() * (G.bb - 80);
                    ion.y = G.wy + 40 + Math.random() * Math.max(10, G.bund - G.wy - 80);
                } else {
                    ion.x = ion.mx;
                    ion.y = ion.my - G.bh * 0.55;
                }
            }
            if (ion.fri || ion.vent > 0) {
                if (ion.vent > 0) ion.vent -= dt;
                this.svoem(ion, dt, G);
            } else {
                ion.x = NK.mod(ion.x, ion.mx, 5, dt);
                ion.y = NK.mod(ion.y, ion.my, this.fase === "falder" ? 3.2 : 4.5, dt);
                ion.a = NK.mod(ion.a, 1, 4, dt);
                ion.vinkel = NK.mod(ion.vinkel, 0, 3, dt);
            }
        }
        this.skub(G);
    };

    /* Tilfaeldig drift, som vandmolekylerne puffer til ionerne. */
    NK.SimVand.prototype.svoem = function (ion, dt, G) {
        var R = NK.ionGeo(ion.ion).R * G.s;
        ion.vx += (Math.random() - 0.5) * 240 * dt;
        ion.vy += (Math.random() - 0.5) * 240 * dt;
        var daemp = Math.exp(-1.3 * dt);
        ion.vx *= daemp;
        ion.vy *= daemp;
        ion.boost = Math.max(0, ion.boost - dt);
        var loft = ion.boost > 0 ? 160 : 60;
        var fart = Math.sqrt(ion.vx * ion.vx + ion.vy * ion.vy);
        if (fart > loft) { ion.vx *= loft / fart; ion.vy *= loft / fart; }
        ion.x += ion.vx * dt;
        ion.y += ion.vy * dt;
        ion.vinkel += ion.vv * dt;
        ion.a = NK.mod(ion.a, 1, 4, dt);
        var v = G.bx + 12 + R, h = G.bx + G.bb - 12 - R;
        var b = G.bund - R - 8, t = Math.min(G.wy + R + 6, b);
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
            var ra = NK.ionGeo(a.ion).R * G.s;
            for (j = i + 1; j < this.ioner.length; j++) {
                var b = this.ioner[j];
                if (!b.fri) continue;
                var dx = b.x - a.x, dy = b.y - a.y;
                var d = Math.sqrt(dx * dx + dy * dy) || 0.01;
                var min = ra + NK.ionGeo(b.ion).R * G.s + 6;
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
            NK.tegnIon(c, ion.ion, ion.x + dx, ion.y, G.s, {
                vinkel: ion.vinkel, alpha: ion.a, glorie: ion.fri, ladning: ion.fri, enkel: true
            });
        }
        this.tegnGlas(c, G);
        this.tegnOverskrift(c, G);
        this.tegnFastStofMaerke(c, G);
    };

    NK.SimVand.prototype.tegnVand = function (c, G) {
        var r = 20, wy = G.wy;
        c.save();
        var grd = c.createLinearGradient(0, wy, 0, G.bund);
        grd.addColorStop(0, "rgba(61, 158, 224, 0.13)");
        grd.addColorStop(1, "rgba(61, 158, 224, 0.28)");
        c.fillStyle = grd;
        c.beginPath();
        c.moveTo(G.bx, wy);
        c.lineTo(G.bx + G.bb, wy);
        c.lineTo(G.bx + G.bb, G.bund - r);
        c.quadraticCurveTo(G.bx + G.bb, G.bund, G.bx + G.bb - r, G.bund);
        c.lineTo(G.bx + r, G.bund);
        c.quadraticCurveTo(G.bx, G.bund, G.bx, G.bund - r);
        c.closePath();
        c.fill();
        /* Overfladen boelger en smule. */
        c.strokeStyle = "rgba(143, 202, 240, 0.55)";
        c.lineWidth = 1.5;
        c.beginPath();
        for (var x = G.bx + 3; x <= G.bx + G.bb - 3; x += 6) {
            var y = wy + Math.sin(x * 0.045 + this.ur * 1.6) * 1.6;
            if (x === G.bx + 3) c.moveTo(x, y); else c.lineTo(x, y);
        }
        c.stroke();
        c.restore();
    };

    NK.SimVand.prototype.tegnGlas = function (c, G) {
        var r = 20, i;
        c.save();
        c.strokeStyle = "rgba(214, 224, 236, 0.55)";
        c.lineWidth = 3;
        c.lineJoin = "round";
        c.beginPath();
        c.moveTo(G.bx - 9, G.top - 6);
        c.quadraticCurveTo(G.bx, G.top - 4, G.bx, G.top + 8);
        c.lineTo(G.bx, G.bund - r);
        c.quadraticCurveTo(G.bx, G.bund, G.bx + r, G.bund);
        c.lineTo(G.bx + G.bb - r, G.bund);
        c.quadraticCurveTo(G.bx + G.bb, G.bund, G.bx + G.bb, G.bund - r);
        c.lineTo(G.bx + G.bb, G.top + 8);
        c.quadraticCurveTo(G.bx + G.bb, G.top - 4, G.bx + G.bb + 9, G.top - 6);
        c.stroke();
        /* Inddeling i venstre side. */
        c.strokeStyle = "rgba(214, 224, 236, 0.28)";
        c.lineWidth = 1.5;
        for (i = 1; i <= 4; i++) {
            var y = G.bund - G.bh * i / 5;
            c.beginPath();
            c.moveTo(G.bx + 4, y);
            c.lineTo(G.bx + (i % 2 === 0 ? 22 : 14), y);
            c.stroke();
        }
        c.restore();
    };

    /* Ligningen oeverst, naar saltet er opløst - og formlen over
       krystallen, naar vandet er fordampet. */
    NK.SimVand.prototype.tegnOverskrift = function (c, G) {
        var s = this.salt;
        if (!s) return;
        var font = "600 " + NK.klamp(G.W / 38, 14, 21).toFixed(0) + "px 'Segoe UI', sans-serif";
        if (this.ligning) {
            NK.tekstDele(c, [
                { t: D.oploesVenstre(s), farve: "#f2f3f5" },
                { t: "   →   ", farve: "#7e8590" },
                { t: D.ionLed(s.kat, s.p), farve: "#f39a8f" },
                { t: "  +  ", farve: "#7e8590" },
                { t: D.ionLed(s.an, s.n), farve: "#8fcaf0" }
            ], G.W / 2, 38, { font: font, kant: true });
        }
        if (this.fase === "inddampet" || (this.fase === "inddamper" && this.inddampTid > 2)) {
            var top = Infinity;
            for (var i = 0; i < this.ioner.length; i++) {
                top = Math.min(top, this.ioner[i].my - NK.ionGeo(this.ioner[i].ion).R * G.s);
            }
            var y = top - 20;
            NK.tekst(c, s.formel, G.W / 2, y - 18, {
                font: "700 24px 'Segoe UI', sans-serif", justering: "center", linje: "middle",
                farve: "#f2f3f5", kant: true, kantBredde: 5
            });
            NK.tekst(c, s.navn, G.W / 2, y + 4, {
                font: "600 13px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#a9b0ba", kant: true
            });
        }
    };

    /* Et lille maerke over krystallen, mens den endnu ligger som fast
       stof: formlen med "(s)" og en pil ned til den, plus en kort
       undertekst om hvorfor den ligger dér. Erstatter den gamle
       kommentar under hele glasset. */
    NK.SimVand.prototype.tegnFastStofMaerke = function (c, G) {
        var s = this.salt;
        if (!s || !this.ioner.length) return;
        var undertekst;
        if (this.fase === "falder" || this.fase === "krystal") undertekst = "endnu ikke opløst i vandet";
        else if (this.fase === "tung") undertekst = "tungtopløseligt — bliver liggende";
        else return;

        var top = Infinity, midtX = 0, n = this.ioner.length;
        for (var i = 0; i < n; i++) {
            var ion = this.ioner[i];
            top = Math.min(top, ion.y - NK.ionGeo(ion.ion).R * G.s);
            midtX += ion.x;
        }
        midtX /= n;
        var y = top - 36;

        NK.tekst(c, s.formel + "(s)", midtX, y, {
            font: "700 15px 'Segoe UI', sans-serif", justering: "center", linje: "bottom", farve: "#f2f3f5", kant: true
        });
        NK.tekst(c, undertekst, midtX, y + 4, {
            font: "italic 400 11px 'Segoe UI', sans-serif", justering: "center", linje: "top",
            farve: "#a9b0ba", kant: true, kantBredde: 3
        });

        c.save();
        c.strokeStyle = "rgba(169, 176, 186, 0.6)";
        c.lineWidth = 1.5;
        c.beginPath();
        c.moveTo(midtX, y + 21);
        c.lineTo(midtX, top - 6);
        c.moveTo(midtX - 4, top - 12);
        c.lineTo(midtX, top - 6);
        c.lineTo(midtX + 4, top - 12);
        c.stroke();
        c.restore();
    };
}());
