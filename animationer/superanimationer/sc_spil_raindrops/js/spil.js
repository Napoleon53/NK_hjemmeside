/* Ionregn: spillets model. Kender kun tiden i sekunder fra første slag (sek);
   lyd, tegning og taster ligger i andre filer. */
var Spil = (function () {
    "use strict";

    function rngFra(seed) {
        var a = seed >>> 0;
        return function () {
            a = (a + 0x6D2B79F5) >>> 0;
            var t = a;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function Spil(opt) {
        var cfg = this.cfg = opt.cfg || CONFIG;
        this.slagS = 60 / opt.bpm;
        this.rng = rngFra(opt.seed || (Date.now() & 0xffffffff));
        this.spt = cfg.SLAG_PR_TAKT;
        /* opt.startFase: begynd ved en fase; sangen starter så 2 takter før dens første takt */
        var startFase = cfg.FASER.filter(function (x) { return x.id === opt.startFase; })[0] || cfg.FASER[0];
        this.foersteIonTakt = startFase.fra;
        this.startTakt = Math.max(1, startFase.fra - 2);
        this.slutSlag = opt.slutSlag === undefined ? Infinity : opt.slutSlag;
        this.sidsteLandSlag = this.slutSlag - 2;

        this.point = 0;
        this.streak = 0;
        this.maksStreak = 0;
        this.integritet = 100;
        this.perfekte = 0;
        this.gode = 0;
        this.missede = 0;
        this.forbindelser = 0;
        this.forkerte = [];
        this.lavede = [];

        this.kolbe = [];
        this.fase = null;
        this.maal = null;
        this.kommendeMaal = {};
        this.ioner = [];
        this.planTakt = this.startTakt;
        this.plan = [];
        this.brugHist = {};
        this.fortegnHist = [];
        this.sidsteBane = -1;
        this.naesteId = 1;
        this.haendelser = [];
        this.logg = [];
        this.slut = false;
        this.slutGrund = null;
        this.sek = -Infinity;
        this.slag = -Infinity;
        this.saetFase(startFase);
        if (startFase.nr > 0) this.haendelser.push({ type: "fase", fase: startFase });
    }

    var P = Spil.prototype;

    /* ---- Faser og takter ------------------------------------------- */
    P.faseForTakt = function (takt) {
        var f = this.cfg.FASER, t = Math.max(1, takt);
        for (var i = 0; i < f.length; i++) {
            if (t >= f[i].fra && (f[i].til === null || t <= f[i].til)) return f[i];
        }
        return f[f.length - 1];
    };
    P.taktForSlag = function (slag) { return Math.floor(slag / this.spt) + 1; };
    P.erLuft = function (takt, f) {
        var L = this.cfg.LUFT, n = L.med + L.uden;
        return ((takt - f.fra) % n) >= L.med;
    };
    P.mult = function () {
        var c = this.cfg.COMBO;
        return Math.min(c.maks, 1 + Math.floor(this.streak / c.pr));
    };

    P.saetFase = function (f) {
        if (f === this.fase) return;
        var foer = this.fase;
        this.fase = f;
        if (f.maal) {
            this.maal = this.kommendeMaal[f.id] || this.nytMaal(f, null);
            delete this.kommendeMaal[f.id];
        } else {
            this.maal = null;
        }
        this.kolbe = [];
        if (foer) this.haendelser.push({ type: "fase", fase: f });
    };

    /* Målet, ioner i en fase bruger: det aktive eller det, der venter */
    P.maalFor = function (f) {
        if (f === this.fase) return this.maal;
        if (!this.kommendeMaal[f.id]) this.kommendeMaal[f.id] = this.nytMaal(f, null);
        return this.kommendeMaal[f.id];
    };
    /* Det mål, der skal vises: det aktive, eller det næste, når dets ioner allerede falder */
    P.visMaal = function () {
        if (this.maal) return { maal: this.maal, fase: this.fase };
        for (var id in this.kommendeMaal) {
            var f = this.cfg.FASER.filter(function (x) { return x.id === id; })[0];
            return { maal: this.kommendeMaal[id], fase: f };
        }
        return null;
    };

    P.nytMaal = function (f, undtagen) {
        var liste = Kemi.MAAL[f.maalListe || f.id] || Kemi.MAAL.n1;
        var gamle = {}, foerste = this.cfg.FASER.filter(function (x) { return x.ioner; })[0];
        (foerste ? foerste.ioner : []).forEach(function (id) { gamle[id] = true; });
        var falder = this.ioner.filter(function (i) { return i.tilstand === "falder" && i.fase === f; });
        var vaegte = liste.map(function (p) {
            if (undtagen && p[0] === undtagen.kat && p[1] === undtagen.an) return 0;
            var score = 0;
            falder.forEach(function (i) { if (i.id === p[0] || i.id === p[1]) score++; });
            var w = 1 + 2 * score;
            /* i niveau 2 er de nye ioner med i de fleste mål */
            if (f.maal === "navn" && (!gamle[p[0]] || !gamle[p[1]])) w *= 3;
            return w;
        });
        var p = liste[this.vaegtet(vaegte)];
        var t = Kemi.maalTaelling(p[0], p[1]);
        return { kat: p[0], an: p[1], taelling: t, forb: Kemi.forbindelse(t), visning: f.maal };
    };

    P.vaegtet = function (w) {
        var sum = 0, i;
        for (i = 0; i < w.length; i++) sum += w[i];
        var r = this.rng() * sum;
        for (i = 0; i < w.length; i++) { r -= w[i]; if (r < 0 && w[i] > 0) return i; }
        for (i = w.length - 1; i >= 0; i--) if (w[i] > 0) return i;
        return 0;
    };
    P.tilfaeldig = function (liste) { return liste[Math.floor(this.rng() * liste.length)]; };

    /* ---- Planlægning: hvor ionerne lander ---------------------------- */
    P.planlaeg = function (slag) {
        var spt = this.spt, fald = this.cfg.FALD_SLAG;
        while ((this.planTakt - 1) * spt - fald - 1 <= slag) {
            var takt = this.planTakt++;
            var start = (takt - 1) * spt;
            if (start > this.sidsteLandSlag) break;
            if (takt < this.foersteIonTakt) continue;
            var f = this.faseForTakt(takt);
            if (f.moenster === "ingen" || this.erLuft(takt, f)) continue;
            var pos;
            if (f.moenster === "hver2") pos = [0, 2];
            else pos = [0, 1, 2, 3];
            if (f.moenster === "par" && this.rng() < this.cfg.OTTENDEDELSPAR) pos.push(3.5);
            for (var i = 0; i < pos.length; i++) {
                if (start + pos[i] > this.sidsteLandSlag) break;
                this.plan.push({ slag: start + pos[i], takt: takt, fase: f, par: pos[i] === 3.5 });
            }
        }
    };

    /* ---- Opdatering pr. billede ------------------------------------- */
    P.opdater = function (sek) {
        if (this.slut) return;
        this.sek = sek;
        var slag = this.slag = sek / this.slagS;
        var cfg = this.cfg;

        /* fasen skifter et halvt slag før dens første slag */
        var f = this.faseForTakt(this.taktForSlag(slag + 0.5));
        if (f !== this.fase && f.fra > this.fase.fra) this.saetFase(f);

        this.planlaeg(slag);
        while (this.plan.length && this.plan[0].slag - cfg.FALD_SLAG - 0.5 <= slag) {
            this.spawn(this.plan.shift());
        }

        /* ioner, der er faldet forbi fangelinjen */
        var graense = cfg.VINDUE_MS.god / 1000 + 0.06;
        for (var i = 0; i < this.ioner.length; i++) {
            var ion = this.ioner[i];
            if (ion.tilstand === "falder" && sek > ion.land + graense) {
                ion.tilstand = "passeret";
                ion.tSlut = sek;
                if (this.erBrug(ion)) {
                    ion.brugMiss = true;
                    this.missede++;
                    this.aendrIntegritet(-cfg.INTEGRITET.miss);
                    this.haendelser.push({ type: "miss", ion: ion });
                    if (this.slut) return;
                }
            }
        }
        this.ioner = this.ioner.filter(function (x) {
            if (x.tilstand === "falder") return true;
            return sek - x.tSlut < 1.2;
        });

        if (slag >= this.slutSlag) this.afslut("musik");
    };

    P.spawn = function (slot) {
        var f = slot.fase;
        var id = f.maal ? this.vaelgMedMaal(f) : this.vaelgFri(f);
        var bane;
        if (slot.par) {
            var forrige = this.ioner[this.ioner.length - 1];
            var optaget = forrige ? forrige.bane : -1;
            do { bane = Math.floor(this.rng() * 4); } while (bane === optaget);
        } else {
            bane = Math.floor(this.rng() * 4);
            if (bane === this.sidsteBane && this.rng() < 0.7) bane = (bane + 1 + Math.floor(this.rng() * 3)) % 4;
        }
        this.sidsteBane = bane;
        var ion = {
            nr: this.naesteId++, id: id, q: Kemi.IONER[id].q, bane: bane,
            slag: slot.slag, land: slot.slag * this.slagS, fase: f, takt: slot.takt,
            tilstand: "falder", brugVedSpawn: this.sidsteBrug
        };
        this.ioner.push(ion);
        this.logg.push({ id: id, slag: slot.slag, bane: bane, fase: f.id, brug: this.sidsteBrug });
    };

    /* Niveau 1-2: mindst en andel af ionerne skal bruges til målet (vindue på 10 ioner) */
    P.vaelgMedMaal = function (f) {
        var maal = this.maalFor(f), hist = this.brugHist[f.id] || (this.brugHist[f.id] = []);
        var W = 10, sidste = hist.slice(-(W - 1)), c = 0;
        sidste.forEach(function (b) { if (b) c++; });
        /* hvert vindue af de seneste (højst 10) ioner skal have andelen */
        var behov = Math.ceil(f.andel * (sidste.length + 1) - 1e-9);
        var brug = c < behov || this.rng() < f.andel;
        hist.push(brug);
        this.sidsteBrug = brug;
        return brug ? this.vaelgBrugbar(maal, f) : this.vaelgDistraktor(maal, f);
    };

    P.vaelgBrugbar = function (maal, f) {
        var mig = this, ids = [maal.kat, maal.an];
        var iKolben = maal === this.maal ? Kemi.tael(this.kolbe) : {};
        var w = ids.map(function (id) {
            var falder = mig.ioner.filter(function (i) { return i.tilstand === "falder" && i.id === id && i.fase === f; }).length;
            var mangler = maal.taelling[id] - (iKolben[id] || 0) - falder;
            return Math.max(mangler, 0) + 0.3 * maal.taelling[id];
        });
        return ids[this.vaegtet(w)];
    };

    P.vaelgDistraktor = function (maal, f) {
        var mulige = f.ioner.filter(function (id) { return id !== maal.kat && id !== maal.an; });
        if (this.rng() < 0.5) {
            var qk = Kemi.IONER[maal.kat].q, qa = Kemi.IONER[maal.an].q;
            var ligner = mulige.filter(function (id) { var q = Kemi.IONER[id].q; return q === qk || q === qa; });
            if (ligner.length) return this.tilfaeldig(ligner);
        }
        return this.tilfaeldig(mulige);
    };

    /* Niveau 3: der skal altid være en ion på vej, der kan gøre kolben neutral */
    P.vaelgFri = function (f) {
        this.sidsteBrug = false;
        var cfg = this.cfg, I = Kemi.IONER;
        var q = Kemi.ladning(Kemi.tael(this.kolbe)), n = this.kolbe.length;
        var nu = this.sek;
        var falder = this.ioner.filter(function (i) { return i.tilstand === "falder" && i.fase === f && i.land > nu; });
        var valgt = null;
        if (n > 0 && q !== 0 && Kemi.kanNeutraliseres(q, n, cfg.MAKS_IONER)) {
            var hjaelper = this.hjaelperLadninger(q, n);
            var paaVej = falder.some(function (i) { return hjaelper.indexOf(i.q) >= 0; });
            if (!paaVej) {
                var kand = f.ioner.filter(function (id) { return hjaelper.indexOf(I[id].q) >= 0; });
                if (kand.length) { valgt = this.tilfaeldig(kand); this.sidsteBrug = true; }
            }
        }
        if (!valgt) {
            var fortegn;
            var h = this.fortegnHist.slice(-3);
            if (h.length === 3 && h[0] === h[1] && h[1] === h[2]) fortegn = -h[0];
            else if (q !== 0 && this.rng() < 0.6) fortegn = q > 0 ? -1 : 1;
            else fortegn = this.rng() < 0.5 ? 1 : -1;
            var mulige = f.ioner.filter(function (id) { return I[id].q * fortegn > 0; });
            var w = mulige.map(function (id) { return I[id].sammensat ? 1.6 : 1; });
            valgt = mulige[this.vaegtet(w)];
        }
        this.fortegnHist.push(I[valgt].q > 0 ? 1 : -1);
        return valgt;
    };

    /* Ladninger, der fuldender kolben, eller (ved |q| > 3) bringer den et skridt nærmere */
    P.hjaelperLadninger = function (q, n) {
        var maks = this.cfg.MAKS_IONER, ud = [];
        if (Math.abs(q) <= 3) return [-q];
        for (var a = 1; a <= 3; a++) {
            var ny = q + (q > 0 ? -a : a);
            if (Kemi.kanNeutraliseres(ny, n + 1, maks)) ud.push(q > 0 ? -a : a);
        }
        return ud;
    };

    /* Skulle ionen have været brugt? (afgøres, når den falder forbi) */
    P.erBrug = function (ion) {
        if (ion.fase !== this.fase) return false;
        if (this.fase.maal) {
            var t = Kemi.tael(this.kolbe);
            return this.maal.taelling[ion.id] !== undefined && (t[ion.id] || 0) < this.maal.taelling[ion.id];
        }
        if (!this.kolbe.length) return false;
        return Kemi.ladning(Kemi.tael(this.kolbe)) + ion.q === 0;
    };

    /* ---- Tryk på en bane --------------------------------------------- */
    P.tryk = function (bane, sek) {
        if (this.slut) return null;
        var V = this.cfg.VINDUE_MS, god = V.god / 1000, bedst = null, bedstD = Infinity;
        for (var i = 0; i < this.ioner.length; i++) {
            var ion = this.ioner[i];
            if (ion.bane !== bane || ion.tilstand !== "falder") continue;
            var d = Math.abs(sek - ion.land);
            if (d <= god && d < bedstD) { bedst = ion; bedstD = d; }
        }
        if (!bedst) {
            this.haendelser.push({ type: "forbi", bane: bane });
            return { dom: "miss" };
        }
        var dom = bedstD <= V.perfekt / 1000 ? "perfekt" : "god";
        bedst.tilstand = "fanget";
        bedst.dom = dom;
        bedst.afvig = sek - bedst.land;
        bedst.tSlut = sek;
        if (dom === "perfekt") this.perfekte++; else this.gode++;
        var m = this.mult();
        var res = this.iKolben(bedst, m);
        var p = 0;
        if (res !== "fejl") {
            p = this.cfg.POINT[dom] * m;
            this.point += p;
        }
        this.haendelser.push({ type: "fang", ion: bedst, dom: dom, point: p, res: res });
        return { dom: dom, res: res, ion: bedst };
    };

    P.iKolben = function (ion, m) {
        var f = ion.fase, cfg = this.cfg;
        if (f !== this.fase) {
            if (f.fra > this.fase.fra) this.saetFase(f);
            else return "sent";      /* en ion fra fasen før, fanget lige på grænsen */
        }
        if (f.maal) {
            var t = Kemi.tael(this.kolbe), maal = this.maal;
            if (maal.taelling[ion.id] === undefined) return this.fejl(ion, "ikkeMed");
            if ((t[ion.id] || 0) + 1 > maal.taelling[ion.id]) return this.fejl(ion, "forMange");
            this.kolbe.push(ion.id);
            t[ion.id] = (t[ion.id] || 0) + 1;
            for (var id in maal.taelling) if ((t[id] || 0) !== maal.taelling[id]) return "ok";
            return this.dannet(m, f);
        }
        var foer = this.kolbe.slice();
        this.kolbe.push(ion.id);
        var tt = Kemi.tael(this.kolbe), q = Kemi.ladning(tt), n = this.kolbe.length;
        if (Math.abs(q) > cfg.MAKS_LADNING) return this.fejl(ion, "over", foer);
        if (q === 0) return this.dannet(m, f);
        if (!Kemi.kanNeutraliseres(q, n, cfg.MAKS_IONER)) return this.fejl(ion, "doed", foer);
        return "ok";
    };

    P.dannet = function (m, f) {
        var cfg = this.cfg, forb = Kemi.forbindelse(Kemi.tael(this.kolbe));
        var bonus = 0;
        if (!f.maal) bonus = forb.ioner >= 5 ? cfg.POINT.bonus5 : forb.ioner >= 4 ? cfg.POINT.bonus4 : 0;
        var p = (cfg.POINT.forbindelse + bonus) * m;
        this.point += p;
        this.forbindelser++;
        this.streak++;
        this.maksStreak = Math.max(this.maksStreak, this.streak);
        this.aendrIntegritet(cfg.INTEGRITET.forbindelse);
        this.lavede.push(forb.tekst);
        this.kolbe = [];
        this.haendelser.push({ type: "forbindelse", forb: forb, point: p, bonus: bonus * m, mult: this.mult() });
        if (f.maal) this.maal = this.nytMaal(f, this.maal);
        return "forbindelse";
    };

    P.fejl = function (ion, type, foer) {
        var cfg = this.cfg, f = ion.fase;
        foer = foer || this.kolbe.slice();
        var efter = foer.concat([ion.id]);
        var tt = Kemi.tael(efter), q = Kemi.ladning(tt), n = efter.length;
        var aarsag, rigtig, noegle;
        if (f.maal) {
            var maal = this.maal;
            var visning = f.maal === "navn" ? maal.forb.navn : maal.forb.html;
            if (type === "ikkeMed") aarsag = Kemi.ionHTML(ion.id) + " er ikke med i " + visning + ".";
            else aarsag = (f.maal === "navn" ? Kemi.stort(visning) : visning) + " har kun " +
                Kemi.antalOrd(maal.taelling[ion.id]) + " " + Kemi.ionHTML(ion.id) + ".";
            rigtig = maal.taelling;
            noegle = "maal:" + maal.kat + "-" + maal.an;
        } else {
            var Q = Kemi.samletLadningTekst(q);
            if (type === "over") aarsag = "Ladningen blev " + Q + ". Grænsen er ±" + cfg.MAKS_LADNING + ".";
            else if (n >= cfg.MAKS_IONER) aarsag = cfg.MAKS_IONER + " ioner er grænsen, og ladningen er " + Q + ".";
            else {
                var rest = cfg.MAKS_IONER - n;
                aarsag = "Ladning " + Q + " kan ikke udlignes med " + (rest === 1 ? "én ion" : rest + " ioner") + " mere.";
            }
            rigtig = Kemi.loesning(Kemi.tael(foer), f.ioner, cfg.MAKS_IONER);
            noegle = "fri:" + (rigtig ? Kemi.forbindelse(rigtig).tekst : Kemi.listeHTML(efter));
        }
        var r = rigtig ? Kemi.forbindelse(rigtig) : null;
        var post = {
            niveau: f.nr, lavet: Kemi.listeHTML(efter), aarsag: aarsag,
            rigtigHTML: r ? r.html : "", rigtigNavn: r ? r.navn : "", rigtigTekst: r ? r.tekst : "",
            opskrift: r ? Kemi.opskriftHTML(r.taelling) : "", noegle: noegle, gange: 1, fri: !f.maal
        };
        var findes = this.forkerte.filter(function (x) { return x.noegle === noegle; })[0];
        if (findes) { findes.gange++; findes.lavet = post.lavet; findes.aarsag = post.aarsag; }
        else this.forkerte.push(post);

        this.streak = 0;
        this.kolbe = [];
        this.haendelser.push({ type: "fejl", lavet: post.lavet, aarsag: aarsag, ion: ion });
        this.aendrIntegritet(-cfg.INTEGRITET.forkert);
        return "fejl";
    };

    P.aendrIntegritet = function (d) {
        this.integritet = Math.max(0, Math.min(100, this.integritet + d));
        if (this.integritet <= 0) this.afslut("integritet");
    };

    P.afslut = function (grund) {
        if (this.slut) return;
        this.slut = true;
        this.slutGrund = grund;
        this.haendelser.push({ type: "slut", grund: grund });
    };

    P.ladning = function () { return Kemi.ladning(Kemi.tael(this.kolbe)); };
    P.tagHaendelser = function () { var h = this.haendelser; this.haendelser = []; return h; };

    Spil.rngFra = rngFra;
    return Spil;
})();
