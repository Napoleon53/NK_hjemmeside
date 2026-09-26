/* =====================================================================
   spil.js - ét spil paa én sværhedsgrad

   Hver fane (Let, Middel, Svær) har sit eget spil med bræt, koe, tid og
   rekord. Kun den aktive fane koerer; skifter man fane, holder den
   gamle pause.

   Tilstande: klar (foer start), koerer, pause, slut (brættet er fuldt)
   og vundet (alle salte er lavet).

   Maalet er at lave alle saltene i panelet. Rekorden er den hurtigste tid.

   Posen: 3 af 4 brikker er graa sten (N.sten) med fem felter; de kommer
   i poser med alle 18 former. Ionerne er tetrisbrikker i poser med alle
   syv, og de kommer i hele formelenheder: vaelges AlCl₃, kommer én Al³⁺ og
   tre Cl⁻ i tilfaeldig raekkefoelge. Paa Svær blandes to salte sammen.
   Et salt, der ikke er lavet endnu, vaelges oftere (D.MANGLER). Forsvinder
   en ion helt med en fuld raekke, kommer den igen i koeen, saa der altid
   er partnere nok.

   Naar en brik lander, sker det i den her raekkefoelge, igen og igen,
   til der ikke sker mere (this.ryddes):
     1. ioner, der gaar lige op, bliver til salt, lyser op og smuldrer
        til pulver (D.PULVER_TID); saa falder brikkerne ovenover (D.FALD_TID)
     2. fulde raekker blinker (D.RYD_TID) og forsvinder, som i tetris
   Imens venter den naeste brik.

   Spillet sender haendelser til app.js med this.naar(navn, data), fx til
   lyden og til Kemichael, og taeller this.version op, naar panelet skal
   tegnes om.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Kemi = NK.Kemi;
    var Braet = NK.Braet;
    var REKORD = "nk-iontetris-tid";

    /* ----- Posen ----------------------------------------------------------- */
    function Pose(N, fundet) {
        this.N = N;
        this.fundet = fundet || function () { return false; };
        this.salte = Kemi.salte(N);
        this.former = [];
        this.stenFormer = [];
        this.ioner = N.intro ? N.intro.slice() : [];
        /* Starten: ion, sten, ion, sten, saa det foerste salt kan laves */
        this.pladser = N.intro ? ["ion", "sten", "ion", "sten"] : [];
    }

    Pose.prototype.form = function () {
        if (!this.former.length) this.former = NK.bland(Braet.FORM_NAVNE);
        return this.former.shift();
    };

    Pose.prototype.stenForm = function () {
        if (!this.stenFormer.length) this.stenFormer = NK.bland(Braet.STEN_NAVNE);
        return this.stenFormer.shift();
    };

    /* Tolv pladser ad gangen: andelen N.sten af dem er sten, resten ioner */
    Pose.prototype.plads = function () {
        if (!this.pladser.length) {
            var sten = Math.round(this.N.sten * 12), p = [];
            for (var i = 0; i < 12; i++) p.push(i < sten ? "sten" : "ion");
            this.pladser = NK.bland(p);
        }
        return this.pladser.shift();
    };

    Pose.prototype.vaelgSalt = function () {
        var mig = this, sum = 0, i;
        function vaegt(s) { return (D.VAEGT[s.stoerrelse] || 1) * (mig.fundet(s.formel) ? 1 : D.MANGLER); }
        for (i = 0; i < this.salte.length; i++) sum += vaegt(this.salte[i]);
        var r = Math.random() * sum;
        for (i = 0; i < this.salte.length; i++) {
            r -= vaegt(this.salte[i]);
            if (r < 0) return this.salte[i];
        }
        return this.salte[this.salte.length - 1];
    };

    Pose.prototype.ion = function () {
        if (!this.ioner.length) {
            var liste = [];
            for (var i = 0; i < this.N.blandes; i++) liste = liste.concat(Kemi.enhedsIoner(this.vaelgSalt()));
            this.ioner = NK.bland(liste);
        }
        return this.ioner.shift();
    };

    /* En ion, der forsvandt med en raekke, kommer igen som den naeste ion */
    Pose.prototype.igen = function (ionId) {
        this.ioner.unshift(ionId);
    };

    Pose.prototype.naeste = function () {
        if (this.plads() === "sten") return { form: this.stenForm(), sten: true };
        return { form: this.form(), ion: this.ion() };
    };

    /* ----- Spillet ------------------------------------------------------- */
    function Spil(id) {
        this.id = id;
        this.N = D.NIVEAUER[id];
        this.braet = new Braet();
        this.salteListe = Kemi.salte(this.N);
        this.rekord = NK.hent(REKORD, {})[id] || 0;
        this.naar = function () {};
        this.version = 0;
        this.nulstil();
    }

    var P = Spil.prototype;

    P.nulstil = function () {
        var mig = this;
        this.tilstand = "klar";
        this.braet.nulstil();
        this.pose = new Pose(this.N, function (f) { return !!mig.salte[f]; });
        this.koe = [];
        this.aktiv = null;
        this.gemt = null;
        this.gemtBrugt = false;
        this.antalSalte = 0;
        this.raekker = 0;
        this.niveau = 1;
        this.salte = {};
        this.sidste = null;
        this.effekter = [];
        this.ryddes = null;
        this.faldUr = 0;
        this.laasUr = 0;
        this.laasFlyt = 0;
        this.laveste = 0;
        this.holdt = { venstre: null, hoejre: null, ned: false };
        this.retning = null;
        this.antalBrikker = 0;
        this.skyggeY = 0;
        this.glimt = null;
        this.ventende = [];
        this.haendelse = null;
        this.tid = 0;
        this.slutUr = 0;
        this.nyRekord = false;
        this.version++;
    };

    P.start = function () {
        this.nulstil();
        this.tilstand = "koerer";
        while (this.koe.length < D.NAESTE) this.koe.push(this.pose.naeste());
        this.nyBrik();
        this.naar("start");
        this.version++;
    };

    P.pause = function () {
        if (this.tilstand !== "koerer") return false;
        this.tilstand = "pause";
        this.holdt = { venstre: null, hoejre: null, ned: false };
        this.version++;
        return true;
    };

    P.fortsaet = function () {
        if (this.tilstand !== "pause") return false;
        this.tilstand = "koerer";
        this.version++;
        return true;
    };

    /* Den store knap: Start spil, Pause, Fortsæt, Spil igen */
    P.primaer = function () {
        if (this.tilstand === "koerer") this.pause();
        else if (this.tilstand === "pause") this.fortsaet();
        else this.start();
    };

    /* Sekunder pr. raekke paa det niveau, spillet er naaet til */
    P.tyngde = function () {
        return Math.max(D.MIN_TID, this.N.start * Math.pow(this.N.faktor, this.niveau - 1));
    };

    /* Hvor mange af saltene er lavet, og hvilke mangler? */
    P.fundne = function () {
        var mig = this;
        return this.salteListe.filter(function (s) { return !!mig.salte[s.formel]; }).length;
    };

    P.manglende = function () {
        var mig = this;
        return this.salteListe.filter(function (s) { return !mig.salte[s.formel]; });
    };

    /* ----- Brikken ------------------------------------------------------- */
    P.nyBrik = function (fra) {
        var b = fra || this.koe.shift();
        if (!fra) this.koe.push(this.pose.naeste());
        this.aktiv = { form: b.form, ion: b.ion, sten: !!b.sten, rot: 0, x: 3, y: 0 };
        if (!this.braet.passer(this.aktiv.form, 0, 3, 0)) { this.slut(); return; }
        if (this.braet.passer(this.aktiv.form, 0, 3, 1)) this.aktiv.y = 1;
        this.faldUr = 0;
        this.laasUr = 0;
        this.laasFlyt = 0;
        this.laveste = this.aktiv.y;
        this.opdaterSkygge();
        this.version++;
    };

    P.opdaterSkygge = function () {
        var a = this.aktiv;
        if (!a) { this.glimt = null; return; }
        this.skyggeY = this.braet.bund(a);
        this.glimt = this.N.glimt && !a.sten
            ? this.braet.proev({ form: a.form, ion: a.ion, rot: a.rot, x: a.x, y: this.skyggeY })
            : null;
    };

    P.paaJorden = function () {
        var a = this.aktiv;
        return !!a && !this.braet.passer(a.form, a.rot, a.x, a.y + 1);
    };

    /* Efter et flyt eller en drejning: staar brikken paa noget, faar den
       lidt mere tid, men kun D.LAAS_FLYT gange. */
    P.efterFlyt = function () {
        if (this.paaJorden() && this.laasFlyt < D.LAAS_FLYT) {
            this.laasUr = 0;
            this.laasFlyt++;
        }
        this.opdaterSkygge();
    };

    P.flyt = function (dx) {
        var a = this.aktiv;
        if (!a || !this.braet.passer(a.form, a.rot, a.x + dx, a.y)) return false;
        a.x += dx;
        this.efterFlyt();
        this.naar("flyt");
        return true;
    };

    P.drej = function (retning) {
        var a = this.aktiv;
        if (!a) return false;
        var r = this.braet.drej(a, retning);
        if (!r) return false;
        a.rot = r.rot; a.x = r.x; a.y = r.y;
        this.efterFlyt();
        this.naar("drej");
        return true;
    };

    P.fald = function () {
        var a = this.aktiv;
        if (!a || !this.braet.passer(a.form, a.rot, a.x, a.y + 1)) return false;
        a.y++;
        if (a.y > this.laveste) {
            this.laveste = a.y;
            this.laasFlyt = 0;
        }
        return true;
    };

    P.haardt = function () {
        var a = this.aktiv;
        if (!a) return;
        var n = this.braet.bund(a) - a.y;
        a.y += n;
        this.naar("haardt");
        this.laas();
    };

    P.gem = function () {
        var a = this.aktiv;
        if (!a || this.gemtBrugt) return false;
        var ind = { form: a.form, ion: a.ion, sten: a.sten };
        var ud = this.gemt;
        this.gemt = ind;
        this.gemtBrugt = true;
        this.nyBrik(ud || undefined);
        this.naar("gem");
        this.version++;
        return true;
    };

    /* ----- Tasterne ------------------------------------------------------- */
    P.tryk = function (h) {
        if (this.tilstand !== "koerer" || this.ryddes || !this.aktiv) {
            if (h === "venstre" || h === "hoejre") this.holdt[h] = { t: 0, arr: 0 };
            if (h === "ned") this.holdt.ned = true;
            return;
        }
        if (h === "venstre" || h === "hoejre") {
            this.holdt[h] = { t: 0, arr: 0 };
            this.retning = h;
            this.flyt(h === "venstre" ? -1 : 1);
        } else if (h === "ned") {
            this.holdt.ned = true;
            if (this.fald()) { this.faldUr = 0; this.opdaterSkygge(); this.version++; }
        } else if (h === "drej") this.drej(1);
        else if (h === "drejMod") this.drej(-1);
        else if (h === "slip") this.haardt();
        else if (h === "gem") this.gem();
    };

    P.slip = function (h) {
        if (h === "venstre" || h === "hoejre") {
            this.holdt[h] = null;
            if (this.retning === h) this.retning = this.holdt.venstre ? "venstre" : (this.holdt.hoejre ? "hoejre" : null);
        } else if (h === "ned") this.holdt.ned = false;
    };


    /* ----- Naar brikken lander -------------------------------------------- */
    P.laas = function () {
        var a = this.aktiv;
        if (!a) return;
        if (this.braet.overBraettet(a)) { this.slut(); return; }
        var id = this.braet.placer(a);
        this.aktiv = null;
        this.glimt = null;
        this.antalBrikker++;
        this.gemtBrugt = false;
        var nyt = 1 + Math.floor(this.antalBrikker / D.BRIKKER_PR_NIVEAU);
        if (nyt > this.niveau) {
            this.niveau = nyt;
            this.saetHaendelse(D.BESKED.niveau.replace("{n}", nyt), 2.4, false);
            this.naar("niveau", nyt);
        }
        this.naar("laas");
        this.ryddes = { led: 0 };
        this.kaede(a.sten ? undefined : id);
        this.version++;
    };

    /* Ét trin i kaeden: foerst salt, saa fulde raekker, ellers er den slut */
    P.kaede = function (nyId) {
        var R = this.ryddes;
        if (this.reaktioner(nyId, R.led + 1).length) {
            R.led++;
            R.fase = "pulver";
            R.ur = D.PULVER_TID;
            return;
        }
        var fulde = this.braet.fuldeRaekker();
        if (fulde.length) {
            var mig = this;
            R.fase = "raekke";
            R.ur = D.RYD_TID;
            R.raekker = fulde;
            fulde.forEach(function (y) { mig.effekter.push({ art: "raekke", y: y, ur: D.RYD_TID + 0.1, maks: D.RYD_TID + 0.1 }); });
            this.naar("ryd", fulde.length);
            return;
        }
        this.ryddes = null;
        this.afslutKaede();
    };

    /* De grupper, der gaar lige op, bliver til salt. led: leddet i en
       kaedereaktion (1 for den brik, der lige landede). */
    P.reaktioner = function (nyId, led) {
        var mig = this, B = D.BESKED;
        var liste = this.braet.reager(nyId);
        liste.forEach(function (r) {
            var ny = !mig.salte[r.formel];
            mig.salte[r.formel] = (mig.salte[r.formel] || 0) + 1;
            mig.antalSalte++;
            mig.sidste = r;
            mig.effekter.push({ art: "pulver", celler: r.celler, korn: korn(r.celler), ur: D.PULVER_TID + 0.5, maks: D.PULVER_TID + 0.5 });
            var m = midte(r.celler);
            mig.effekter.push({ art: "tekst", tekst: r.formel, x: m.x, y: m.y, ur: 1.1, maks: 1.1, ny: ny });
            var rest = mig.salteListe.length - mig.fundne();
            if (ny && rest === 1) mig.saetHaendelse(B.sidste.replace("{formel}", r.formel), 2.6, true);
            else if (ny && rest > 1) mig.saetHaendelse(B.foerst.replace("{formel}", r.formel).replace("{mangler}", rest), 2.6, true);
            else if (!ny) mig.saetHaendelse(B.igen.replace("{formel}", r.formel).replace("{mangler}", rest), 2.2, false);
            mig.naar("salt", { r: r, ny: ny });
        });
        if (liste.length && led > 1) {
            this.saetHaendelse((led >= 3 ? B.kaedeStor : B.kaede).replace("{n}", led), 2.4, true);
            this.naar("kaede", led);
        }
        return liste;
    };

    /* Pulveret forsvinder, og brikkerne ovenover falder; eller de fulde
       raekker forsvinder. Bagefter proeves naeste trin i kaeden. */
    P.opdaterRyd = function (dt) {
        var R = this.ryddes;
        R.ur -= dt;
        if (R.fase === "pulver") {
            if (R.ur > 0) return;
            this.braet.fjernSalt();
            R.fase = "fald";
            R.ur = D.FALD_TID;
            this.version++;
            return;
        }
        if (R.fase === "raekke") {
            if (R.ur > 0) return;
            var n = R.raekker.length, mig = this;
            var vaek = this.braet.fjernRaekker(R.raekker);
            this.raekker += n;
            if (n >= 2) this.saetHaendelse(D.BESKED.raekker.replace("{n}", stort(D.TAL[n] || String(n))), 2, false);
            vaek.forEach(function (ion) { mig.pose.igen(ion.id); });
            if (vaek.length) this.saetHaendelse(D.BESKED.vaek.replace("{ion}", Kemi.ionTekst(vaek[0])), 2.6, true, true);
            this.version++;
            this.kaede();
            return;
        }
        while (this.ryddes && R.ur <= 0) {
            if (this.braet.tyngdeSkridt()) { R.ur += D.FALD_TID; continue; }
            this.kaede();
            return;
        }
    };

    /* Kaeden er slut: har man alle salte, er spillet vundet; ellers
       grupperne, der venter, og naeste brik */
    P.afslutKaede = function () {
        this.ventende = this.braet.ventende();
        this.version++;
        if (this.tilstand !== "koerer") return;
        if (this.fundne() === this.salteListe.length) { this.vind(); return; }
        this.nyBrik();
    };

    /* En besked i linjen under brættet i et par sekunder. skidt: orange */
    P.saetHaendelse = function (tekst, tid, vigtig, skidt) {
        if (this.haendelse && this.haendelse.vigtig && this.haendelse.ur > 0.6 && !vigtig) return;
        this.haendelse = { tekst: tekst, ur: tid, vigtig: !!vigtig, skidt: !!skidt };
        this.version++;
    };

    P.vind = function () {
        this.tilstand = "vundet";
        this.aktiv = null;
        this.glimt = null;
        this.slutUr = 0;
        this.nyRekord = !this.rekord || this.tid < this.rekord;
        if (this.nyRekord) {
            this.rekord = this.tid;
            var r = NK.hent(REKORD, {});
            r[this.id] = this.tid;
            NK.gem(REKORD, r);
        }
        this.version++;
        this.naar("vundet", { rekord: this.nyRekord, tid: this.tid });
    };

    P.slut = function () {
        this.tilstand = "slut";
        this.aktiv = null;
        this.glimt = null;
        this.slutUr = 0;
        this.nyRekord = false;
        this.version++;
        this.naar("slut", { andel: this.fundne() / this.salteListe.length });
    };

    /* ----- Tiden ------------------------------------------------------------ */
    P.opdater = function (dt) {
        var mig = this;
        if (this.tilstand === "slut" || this.tilstand === "vundet") {
            this.slutUr += dt;
            this.effekter = this.effekter.filter(function (e) { e.ur -= dt; return e.ur > 0; });
        }
        if (this.tilstand !== "koerer") return;
        var foer = Math.floor(this.tid);
        this.tid += dt;
        if (Math.floor(this.tid) !== foer) this.version++;
        this.effekter = this.effekter.filter(function (e) { e.ur -= dt; return e.ur > 0; });
        if (this.haendelse) {
            this.haendelse.ur -= dt;
            if (this.haendelse.ur <= 0) { this.haendelse = null; this.version++; }
        }
        if (this.ryddes) { this.opdaterRyd(dt); return; }
        if (!this.aktiv) return;

        /* Holdt pil: foerst en pause (DAS), saa et skridt hver ARR */
        var h = this.retning ? this.holdt[this.retning] : null;
        if (h) {
            h.t += dt;
            if (h.t >= D.DAS) {
                h.arr += dt;
                while (h.arr >= D.ARR && this.aktiv) {
                    h.arr -= D.ARR;
                    if (!this.flyt(this.retning === "venstre" ? -1 : 1)) { h.arr = 0; break; }
                }
            }
        }
        if (!this.aktiv) return;

        /* Faldet */
        var tid = this.holdt.ned ? Math.min(D.BLOED, this.tyngde()) : this.tyngde();
        this.faldUr += dt;
        while (this.faldUr >= tid) {
            this.faldUr -= tid;
            if (this.fald()) {
                this.version++;
            } else { this.faldUr = 0; break; }
        }

        /* Staar den paa noget, tæller laasetiden */
        if (this.paaJorden()) {
            this.laasUr += dt;
            if (this.laasUr >= D.LAAS) mig.laas();
        } else this.laasUr = 0;
    };

    /* ----- Linjen under brættet ------------------------------------------ */
    P.besked = function () {
        var B = D.BESKED;
        if (this.tilstand === "klar") return { tekst: B.klar };
        if (this.tilstand === "pause") return { tekst: B.pause };
        if (this.tilstand === "slut") return { tekst: B.slut };
        if (this.tilstand === "vundet") return { tekst: B.vundet, haendelse: true };
        if (this.haendelse) return { tekst: this.haendelse.tekst, haendelse: true, skidt: this.haendelse.skidt };
        if (this.antalBrikker < 2) return { tekst: B.styring };
        if (!this.N.hint) return { tekst: this.sidste ? this.sidste.ligning : B.regel, ligning: !!this.sidste };
        var h = this.hint();
        return h ? { tekst: h, hint: true } : { tekst: B.regel };
    };

    /* Hvad mangler den nyeste gruppe, der venter? */
    P.hint = function () {
        var B = D.BESKED, v = this.ventende, bedst = null, bedstOrden = -1, mig = this;
        v.forEach(function (g) {
            var o = 0;
            g.ids.forEach(function (id) { var s = mig.braet.stykker[id]; if (s && s.orden > o) o = s.orden; });
            if (o > bedstOrden) { bedstOrden = o; bedst = g; }
        });
        if (!bedst) return null;
        if (bedst.q === 0) return B.blandet;
        var navne = Object.keys(bedst.arter).map(function (k) { return Kemi.ionTekst(bedst.arter[k]); });
        var gruppe = navne.length > 1 ? navne.slice(0, -1).join(", ") + " og " + navne[navne.length - 1] : navne[0];
        var n = Math.abs(bedst.q);
        var tegn = (bedst.q > 0 ? "minusladning" : "plusladning") + (n > 1 ? "er" : "");
        var t = B.mangler.replace("{gruppe}", gruppe).replace("{tal}", D.TAL[n] || String(n)).replace("{tegn}", tegn);
        var a = this.aktiv;
        if (a && !a.sten) {
            var ion = Kemi.ion(a.ion);
            if (ion.q * bedst.q < 0) {
                t += B.laeg.replace("{ion}", Kemi.ionTekst(ion)).replace("{dem}", bedst.ids.length > 1 ? "dem" : "den");
            }
        }
        return t;
    };

    /* Pulveret: smaa korn i hver celle, der drysser ned og falmer.
       Maalt i celler; tegning.js regner banen ud fra tiden. */
    function korn(celler) {
        var ud = [];
        celler.forEach(function (c) {
            for (var i = 0; i < 7; i++) {
                ud.push({ x: c.x + 0.1 + Math.random() * 0.8, y: c.y + 0.1 + Math.random() * 0.8,
                          vx: (Math.random() - 0.5) * 1.6, vy: -0.4 - Math.random() * 1.6,
                          r: 0.05 + Math.random() * 0.07, lys: 0.75 + Math.random() * 0.25 });
            }
        });
        return ud;
    }

    function midte(celler) {
        var sx = 0, sy = 0;
        celler.forEach(function (c) { sx += c.x; sy += c.y; });
        return { x: sx / celler.length, y: sy / celler.length };
    }

    function stort(t) {
        return t.charAt(0).toUpperCase() + t.slice(1);
    }

    /* 83 sekunder skrives 1:23 */
    function tidTekst(sek) {
        var s = Math.floor(sek || 0);
        return Math.floor(s / 60) + ":" + (s % 60 < 10 ? "0" : "") + (s % 60);
    }

    NK.Spil = Spil;
    NK.Spil.Pose = Pose;
    NK.Spil.tidTekst = tidTekst;
}());
