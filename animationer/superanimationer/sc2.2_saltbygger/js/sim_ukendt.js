/* =====================================================================
   sim_ukendt.js - fane 3: Den ukendte ion

   Formlen er givet, fx SnO₂ eller K₂CrO₄. Den ene ion ligger ikke paa
   hylden. Opgaven stilladseres, og hvert trin laaser det naeste op:

     intro    Opgaven praesenteres: formlen, og hvilken ion der er ukendt.
              Begge ioners kort er foldet sammen med "?". Knappen hedder
              "Start opgave".
     kendt    Kemichael peger paa den ion, eleven kender: "Start med O."
              Dens kort lyser. Eleven vaelger ladningen.
     ladning  Kortene folder sig ud, og den ukendte ion starter uden
              ladning, saa lynlaasen staar tydeligt aaben. Eleven traekker
              i kortet (eller bruger knapperne), til lynlaasen lukker. En
              kort besked under bordet siger efter hvert forsoeg, om der
              mangler, eller om der er for meget.
     partner  Kun ved en ukendt sammensat ion: den skal bruges i et nyt
              salt, og foerst skal ladningen paa partneren slaas op (Ca²⁺).
     valg     Et ukendt metal skal have det rigtige romertal i navnet; en
              ukendt sammensat ion skal i det nye salt.

   Et loest trin viser svaret og en kort forklaring i trinlisten, saa
   beskeden og hintet forneden kun handler om det trin, man er i gang
   med. Plakaterne paa vaeggen (det periodiske system og de sammensatte
   ioner, som i sc2.3) kan altid klikkes op, og hintet faar den rigtige
   til at lyse og aabner den.

   Opgavekortet har én knap (se opgave.js): Start opgave, og saa hint og
   svar til ét trin ad gangen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var ROMER = ["", "I", "II", "III", "IV"];

    NK.SimUkendt = function () {
        var mig = this;
        this.bord = new NK.Bord(NK.el("ukendt-scene"), {
            hylder: false,
            top: 96,
            visFormel: false,
            lyt: function (hvad) { if (hvad === "aendret") mig.aendret(); }
        });
        this.L = this.bord.l;            /* laerredet, som Kemichael tegnes paa */
        this.tid = 0;                    /* et ur, der altid gaar (Kemichael) */
        this.svar = new NK.Svarknapper(NK.el("ukendt-valg"), function (v, rigtig) { mig.svaret(v, rigtig); });
        this.vaelgere = {
            kat: new NK.Opgavevaelger(D.UKENDT_OPGAVER.filter(function (o) { return o.side === "kat"; }), 6),
            an: new NK.Opgavevaelger(D.UKENDT_OPGAVER.filter(function (o) { return o.side === "an"; }), 5)
        };
        this.loeste = 0;
        this.nr = 0;
        this.knaptrin = "start";
        this.plakater = null;
        this.plakatPuls = null;          /* { slags, fremhaev, t } mens hintet peger */
        this.musPlakat = null;

        NK.el("ukendt-opgaveknap").addEventListener("click", function () { mig.opgaveKnap(); });
        NK.el("ukendt-spring").addEventListener("click", function () { mig.springIntro(); });
        /* Linket i hintet aabner plakaten igen. */
        NK.el("ukendt-hint").addEventListener("click", function (e) {
            if (e.target && e.target.getAttribute("data-opslag") !== null) mig.aabnOpslag(mig.hintIon);
        });
        var cv = this.L.canvas;
        function pos(e) {
            var r = cv.getBoundingClientRect();
            return { x: e.clientX - r.left, y: e.clientY - r.top };
        }
        /* Plakaterne: musen over lyser dem op, et klik aabner dem. */
        cv.addEventListener("pointermove", function (e) {
            var p = pos(e);
            mig.musPlakat = mig.plakatVed(p);
            if (mig.musPlakat) cv.style.cursor = "pointer";
        });
        cv.addEventListener("pointerleave", function () { mig.musPlakat = null; });
        cv.addEventListener("click", function (e) {
            var p = pos(e);
            if (mig.laererIntroKlik && mig.laererIntroKlik(p.x, p.y)) return;
            var pl = mig.plakatVed(p);
            if (pl) {
                var puls = mig.plakatPuls && mig.plakatPuls.slags === pl ? mig.plakatPuls.fremhaev : null;
                NK.Opslag.aabn(pl, puls);
                return;
            }
            if (mig.laererKlik) mig.laererKlik(p.x, p.y);
        });
        if (this.laererStart) this.laererStart();
        this.nyOpgave();
    };

    NK.SimUkendt.prototype.saetKnap = function (trin) {
        this.knaptrin = trin;
        NK.saetKnaptrin("ukendt-opgaveknap", trin);
    };

    NK.SimUkendt.prototype.besked = function (html, klasse) {
        NK.saetHTML("ukendt-besked", html || "");
        NK.saetKlasse("ukendt-besked", "besked" + (klasse ? " " + klasse : ""));
    };

    NK.SimUkendt.prototype.opgaveKnap = function () {
        if (this.knaptrin === "start") this.begynd();
        else if (this.knaptrin === "hint") this.visHint();
        else if (this.knaptrin === "svar") this.visSvar();
        else this.nyOpgave();
    };

    /* Ukendt metal og ukendt sammensat ion skiftes. */
    NK.SimUkendt.prototype.nyOpgave = function () {
        var side = this.nr % 2 === 0 ? "kat" : "an";
        this.nr++;
        this.startOpgave(this.vaelgere[side].naeste());
    };

    /* ----- Trinlisten --------------------------------------------------- */
    /* Et trin: tekst, og naar det er loest, svaret ude til hoejre og en
       kort forklaring under. Kun det senest loeste trin viser sin
       forklaring; de tidligere viser kun svaret. */
    NK.SimUkendt.prototype.tegnTrin = function (i) {
        var t = this.trin[i], id = "ukendt-t" + (i + 1);
        var html = t.tekst;
        if (t.svar) html += '<span class="trin-svar">' + t.svar + "</span>";
        if (t.forkl && i === this.senestLoest) html += '<span class="trin-forkl">' + t.forkl + "</span>";
        NK.saetHTML(id, html);
    };

    NK.SimUkendt.prototype.aktivTrin = function (i) {
        this.trinNr = i;
        for (var j = 0; j < this.trin.length; j++) {
            NK.saetTrin("ukendt-t" + (j + 1), j < i ? "ok" : (j === i ? "aktiv" : ""));
        }
        NK.saetHTML("ukendt-hint", "");
        this.besked("");
        this.plakatPuls = null;
        this.saetKnap("hint");
    };

    NK.SimUkendt.prototype.loesTrin = function (i, svar, forkl) {
        this.trin[i].svar = svar;
        this.trin[i].forkl = forkl;
        var forrige = this.senestLoest;
        this.senestLoest = i;
        if (forrige !== undefined && forrige !== null && forrige !== i) this.tegnTrin(forrige);
        this.tegnTrin(i);
        NK.saetTrin("ukendt-t" + (i + 1), "ok");
    };

    /* ----- Intro: opgaven praesenteres ------------------------------------- */
    NK.SimUkendt.prototype.startOpgave = function (o) {
        var kat = D.ion(o.kat), an = D.ion(o.an);
        var salt = D.salt(o.kat, o.an);
        this.o = o;
        this.salt = salt;
        this.ion = o.side === "kat" ? kat : an;        /* den ukendte */
        this.kendt = o.side === "kat" ? an : kat;      /* den, eleven kan finde */
        this.partner = o.partner ? D.ion(o.partner) : null;
        this.fase = "intro";            /* intro | kendt | ladning | partner | valg | faerdig */
        this.vist = false;
        this.senestLoest = null;
        this.plakatPuls = null;
        if (this.laererNyt) this.laererNyt();
        NK.Opslag.luk();

        this.trin = [
            { tekst: "Find ladningen på " + this.kendt.formel },
            { tekst: "Find ladningen på " + this.ion.formel }
        ];
        if (o.side === "kat") {
            this.trin.push({ tekst: "Vælg navnet" });
        } else {
            this.trin.push({ tekst: "Find ladningen på " + this.partner.formel });
            this.trin.push({ tekst: "Vælg formlen for " + D.saltnavn(this.partner, an) });
        }
        for (var i = 0; i < 4; i++) {
            NK.el("ukendt-t" + (i + 1)).hidden = i >= this.trin.length;
            if (i < this.trin.length) this.tegnTrin(i);
            NK.saetTrin("ukendt-t" + (i + 1), "");
        }
        this.trinNr = -1;

        NK.saetHTML("ukendt-uf", D.formelHTML(kat, an));
        NK.saetTekst("ukendt-un", o.side === "an" ? salt.navn : "");
        NK.saetHTML("ukendt-hint", "");
        NK.saetHTML("ukendt-spm", "");
        this.svar.ryd();
        this.besked("");
        NK.saetHTML("ukendt-opgavetekst", o.side === "kat"
            ? "Formlen er <b>" + salt.formel + "</b>. " + NK.stort(this.ion.grund)
                + " kan have flere ladninger. Hvilken ladning har " + this.ion.grund + " her?"
            : "Formlen er <b>" + salt.formel + "</b>. " + this.ion.formel
                + " er en sammensat ion, du ikke kender. Hvilken ladning har den?");
        this.saetKnap("start");

        this.bord.laas(false);
        this.bord.saetUkendt(kat, salt.p, an, salt.n, o.side);
        this.saetNote("");
    };

    /* ----- Trin 1: den kendte ion ----------------------------------------- */
    NK.SimUkendt.prototype.begynd = function () {
        var k = this.kendt, mig = this;
        this.fase = "kendt";
        this.aktivTrin(0);
        NK.saetHTML("ukendt-opgavetekst", "Start med den ion, du kender: <b>" + k.formel + "</b>. " + (k.gruppe
            ? "Dens ladning kan udledes af, hvor " + k.formel + " står i det periodiske system."
            : "Det er en sammensat ion, og dens ladning skal man kende."));
        this.stilKendtSpm(k);
        this.bord.markerKendt(true);
        if (this.laererVisStart) {
            this.laererVisStart(function () { return mig.bord.kortMidt(mig.o.side === "kat" ? "an" : "kat"); }, k);
        }
    };

    /* Spoergsmaalet om en kendt ions ladning (trin 1, og partneren). */
    NK.SimUkendt.prototype.stilKendtSpm = function (ion) {
        NK.saetHTML("ukendt-spm", "Hvilken ladning har <b>" + ion.formel + "</b>?");
        NK.el("ukendt-valg").className = "valg";
        this.svar.vis(D.kendtValg(ion));
    };

    /* Plakaten, en ion slaas op paa: grundstoffer paa det periodiske
       system, sammensatte ioner paa ionplakaten. */
    function opslagFor(ion) {
        return ion.gruppe ? { slags: "pt", fremhaev: ion.formel } : { slags: "ioner", fremhaev: ion.id };
    }

    NK.SimUkendt.prototype.aabnOpslag = function (ion) {
        if (!ion) return;
        var op = opslagFor(ion);
        NK.Opslag.aabn(op.slags, op.fremhaev);
    };

    NK.SimUkendt.prototype.kendtFundet = function (forklaring) {
        NK.Opslag.luk();
        this.svar.ryd();
        NK.saetHTML("ukendt-spm", "");
        this.loesTrin(0, D.ionTekst(this.kendt), forklaring);
        this.fase = "ladning";
        this.aktivTrin(1);
        NK.saetHTML("ukendt-opgavetekst", "Nu kender du ladningen på " + this.kendt.formel
            + ". Træk i kortet med <b>?</b>, til lynlåsen lukker.");
        this.bord.markerKendt(false);
        this.bord.visKendt();          /* kortene folder sig ud: -> aendret() -> skub() */
    };

    /* ----- Trin 2: den ukendte ion ----------------------------------------- */
    NK.SimUkendt.prototype.aendret = function (hvad) {
        if (hvad === "laerer" || this.fase !== "ladning") return;
        if (this.bord.neutral()) this.fundet();
        else this.skub();
    };

    /* Et lille skub efter hvert forsoeg: hvor langt er der igen? */
    NK.SimUkendt.prototype.skub = function () {
        var s = this.salt, u = this.bord.ukendt, ion = this.ion;
        var kat = this.o.side === "kat";
        var plus = s.p * (kat ? u.q : s.kat.q), minus = s.n * (kat ? -s.an.q : u.q);
        var tegn = kat ? "plus" : "minus";
        var tekst;
        if (u.q === 0) {
            tekst = "<b>" + ion.formel + "</b> skal opveje <b>" + (kat ? NK.fortegn(-minus) : NK.fortegn(plus))
                + "</b>. Træk i kortet med ?, eller tryk på +.";
        } else {
            var mangler = kat ? plus < minus : minus < plus;
            tekst = "<b>" + NK.fortegn(plus) + "</b> og <b>" + NK.fortegn(-minus) + "</b>: "
                + (mangler ? "der mangler " + tegn + ". Træk kortet bredere." : "for meget " + tegn + ". Træk kortet smallere.");
        }
        this.saetNote(tekst);
    };

    NK.SimUkendt.prototype.saetNote = function (html) {
        this.note = html;
        NK.saetHTML("ukendt-note", html);
        NK.el("ukendt-note").hidden = !html;
    };

    NK.SimUkendt.prototype.regnskab = function () {
        var s = this.salt, kat = s.kat, an = s.an;
        if (this.o.side === "kat") {
            return s.n + " " + D.ionTekst(an) + " giver " + NK.fortegn(s.n * an.q)
                + (s.p > 1 ? ", fordelt på " + s.p + " " + kat.formel : "") + ".";
        }
        return s.p + " " + D.ionTekst(kat) + " giver " + NK.fortegn(s.p * kat.q)
            + (s.n > 1 ? ", fordelt på " + s.n + " " + an.formel : "") + ".";
    };

    /* Lynlaasen er lukket: ladningen er fundet. */
    NK.SimUkendt.prototype.fundet = function () {
        var o = this.o, s = this.salt;
        this.bord.ukendt.fundet = true;
        this.bord.laas(true);
        this.saetNote("");
        this.loesTrin(1, D.ionTekst(this.ion), this.regnskab());
        if (o.side === "kat") {
            this.fase = "valg";
            this.aktivTrin(2);
            NK.saetHTML("ukendt-opgavetekst", "Ladningen er fundet. Nu skal saltet have et navn.");
            NK.saetHTML("ukendt-spm", "Hvad hedder <b>" + s.formel + "</b>?");
            NK.el("ukendt-valg").className = "valg navne";
            this.svar.vis(D.romertalValg(s.kat, s.an));
        } else {
            /* Den nye salt kraever partnerens ladning: slaa den op foerst. */
            this.fase = "partner";
            this.aktivTrin(2);
            NK.saetHTML("ukendt-opgavetekst", "Nu skal " + D.ionTekst(this.ion) + " bruges i "
                + D.saltnavn(this.partner, s.an) + ". Slå først ladningen op for <b>" + this.partner.formel + "</b>.");
            this.stilKendtSpm(this.partner);
        }
    };

    /* Partneren er fundet: nu formlen for det nye salt. */
    NK.SimUkendt.prototype.partnerFundet = function (forklaring) {
        var s = this.salt;
        NK.Opslag.luk();
        this.loesTrin(2, D.ionTekst(this.partner), forklaring);
        this.fase = "valg";
        this.aktivTrin(3);
        NK.saetHTML("ukendt-opgavetekst", "Nu kender du begge ladninger: " + D.ionTekst(this.partner) + " og "
            + D.ionTekst(this.ion) + ".");
        NK.saetHTML("ukendt-spm", "Hvad er formlen for <b>" + D.saltnavn(this.partner, s.an) + "</b>?");
        NK.el("ukendt-valg").className = "valg";
        this.svar.vis(D.formelValg(this.partner, s.an));
    };

    /* ----- Svar, hint og vis svaret --------------------------------------- */
    NK.SimUkendt.prototype.svaret = function (v, rigtig) {
        if (this.fase === "kendt" || this.fase === "partner") {
            if (!rigtig) {
                this.besked(v.forklaring, "skidt");
                NK.saetTrin("ukendt-t" + (this.trinNr + 1), "fejl");
            } else if (this.fase === "kendt") this.kendtFundet(v.forklaring);
            else this.partnerFundet(v.forklaring);
            return;
        }
        if (rigtig) this.afslut(true, v);
        else {
            this.besked(v.forklaring, "skidt");
            NK.saetTrin("ukendt-t" + (this.trinNr + 1), "fejl");
        }
    };

    /* Hintet passer til det trin, eleven sidder fast i. */
    NK.SimUkendt.prototype.hint = function () {
        var s = this.salt, kat = s.kat, an = s.an, k = this.kendt;
        function link(ion) {
            return ' <button type="button" class="linkknap" data-opslag>'
                + (ion.gruppe ? "Vis det periodiske system" : "Vis de sammensatte ioner") + "</button>";
        }
        if (this.fase === "kendt") {
            this.hintIon = k;
            return (k.gruppe
                ? "Find " + k.formel + " på plakaten med det periodiske system. Hovedgruppen er antallet af elektroner i yderste skal."
                : "Find " + k.formel + " på plakaten med de sammensatte ioner.") + link(k);
        }
        if (this.fase === "partner") {
            var pa = this.partner;
            this.hintIon = pa;
            return "Du skal kende ladningen på " + pa.formel + ", før du kan skrive formlen. Find " + pa.formel
                + " på plakaten med det periodiske system, ligesom " + k.formel + "." + link(pa);
        }
        this.hintIon = null;
        if (this.fase === "ladning") {
            if (this.o.side === "kat") {
                return "Tæl minus: " + s.n + " " + D.ionTekst(an) + " giver " + NK.fortegn(s.n * an.q) + ". "
                    + (s.p > 1 ? "Det skal deles mellem " + s.p + " " + kat.formel + "." : kat.formel + " skal opveje det alene.");
            }
            return "Tæl plus: " + s.p + " " + D.ionTekst(kat) + " giver " + NK.fortegn(s.p * kat.q) + ". "
                + (s.n > 1 ? "Det skal deles mellem " + s.n + " " + an.formel + "." : an.formel + " skal opveje det alene.");
        }
        if (this.o.side === "kat") {
            return "Romertallet er ladningen på én " + kat.grund + "ion. " + ROMER.slice(1).map(function (r, i) {
                return r + " = " + (i + 1);
            }).join(", ") + ". Du fandt " + D.ionTekst(kat) + ".";
        }
        var p = this.partner;
        return "Du har " + D.ionTekst(p) + " og " + D.ionTekst(an) + ". Hver " + p.formel + " giver " + NK.fortegn(p.q)
            + ", og hver " + an.formel + " giver " + NK.fortegn(an.q) + ". Tag så mange af hver, at plus og minus går lige op."
            + (an.sammensat ? " Er der flere " + an.formel + ", skal de i parentes." : "");
    };

    NK.SimUkendt.prototype.visHint = function () {
        if (this.fase === "faerdig" || this.fase === "intro") return;
        NK.saetHTML("ukendt-hint", "<b>Hint:</b> " + this.hint());
        this.saetKnap("svar");
        /* Paa de trin, hvor en ladning skal slaas op, lyser plakaten, og
           den aabnes med ionen fremhaevet. */
        if (this.hintIon) {
            var op = opslagFor(this.hintIon);
            this.plakatPuls = { slags: op.slags, fremhaev: op.fremhaev, t: 0 };
            NK.Opslag.aabn(op.slags, op.fremhaev);
        }
    };

    NK.SimUkendt.prototype.visSvar = function () {
        if (this.fase === "faerdig" || this.fase === "intro") return;
        this.vist = true;
        var r;
        if (this.fase === "kendt" || this.fase === "partner") {
            this.svar.visRigtig();
            r = this.svar.rigtig();
            if (this.fase === "kendt") this.kendtFundet(r ? r.forklaring : "");
            else this.partnerFundet(r ? r.forklaring : "");
            return;
        }
        if (this.fase === "ladning") {
            this.bord.saetGaet(Math.abs(this.ion.q));   /* -> fundet() */
            return;
        }
        this.svar.visRigtig();
        this.afslut(false, this.svar.rigtig());
    };

    NK.SimUkendt.prototype.afslut = function (loest, v) {
        var sidste = this.trin.length - 1;
        this.fase = "faerdig";
        this.plakatPuls = null;
        NK.Opslag.luk();
        NK.saetHTML("ukendt-hint", "");
        this.loesTrin(sidste, v ? v.tekst : "", "");
        this.besked((loest ? "<b>Rigtigt.</b> " : "") + (v ? v.forklaring : ""), loest ? "god" : "gul");
        NK.saetTekst("ukendt-un", this.salt.navn);
        NK.saetHTML("ukendt-opgavetekst", loest ? "Opgaven er løst." : "Sådan skulle det være.");
        if (loest && !this.vist) {
            this.loeste++;
            NK.saetTekst("ukendt-loest", String(this.loeste));
            if (this.loeste % 3 === 0 && this.laererRos) this.laererRos();
        }
        this.saetKnap("ny");
    };

    /* ----- Plakaterne paa vaeggen ----------------------------------------- */
    /* I baandet over bordet: det periodiske system i venstre hjoerne, de
       sammensatte ioner i hoejre, formlen midt imellem. De naar aldrig ned
       til kortene. */
    NK.SimUkendt.prototype.plakatLayout = function () {
        var W = this.L.b;
        var h = NK.klamp(this.bord.top - 8, 64, 100);
        var bPt = Math.min(h * 1.75, W * 0.2), bIon = Math.min(h * 1.3, W * 0.15);
        var p = {
            pt: { x: 14, y: 8, b: bPt, h: h },
            ioner: { x: W - 18 - bIon, y: 8, b: bIon, h: h }
        };
        var a = NK.el("ukendt-anker-plakater");
        if (a && this._ankerW !== W) {
            this._ankerW = W;
            a.style.left = "8px";
            a.style.top = "2px";
            a.style.width = (W - 16) + "px";
            a.style.height = (h + 16) + "px";
        }
        return p;
    };

    NK.SimUkendt.prototype.plakatVed = function (pt) {
        var p = this.plakater;
        if (!p) return null;
        for (var navn in p) {
            if (!Object.prototype.hasOwnProperty.call(p, navn)) continue;
            var r = p[navn];
            if (pt.x >= r.x && pt.x <= r.x + r.b && pt.y >= r.y && pt.y <= r.y + r.h) return navn;
        }
        return null;
    };

    /* ----- Faneskift, tegning og tastatur ----------------------------------- */
    NK.SimUkendt.prototype.tilpas = function () { this.bord.tilpas(); };

    NK.SimUkendt.prototype.opdater = function (dt) {
        this.tid += dt;
        this.bord.opdater(dt);
        this.plakater = this.plakatLayout();
        if (this.plakatPuls) this.plakatPuls.t += dt;
        /* Beskeden staar lige under bordet (den er forskudt op med sin
           egen hoejde, se .scene-note). */
        var gg = this.bord.g;
        if (this.note && gg) NK.el("ukendt-note").style.top = Math.round(Math.min(gg.zy + gg.gab + gg.hc + 64, gg.y1 - 6)) + "px";
        if (this.opdaterIntro) this.opdaterIntro(dt);
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
    };

    NK.SimUkendt.prototype.tegn = function () {
        var mig = this, c = this.L.ctx;
        this.bord.tegn();
        if (this.plakater) {
            ["pt", "ioner"].forEach(function (slags, i) {
                var p = mig.plakater[slags], lys = mig.musPlakat === slags ? 1 : 0;
                var puls = mig.plakatPuls && mig.plakatPuls.slags === slags;
                if (puls) lys = Math.max(lys, 0.45 + 0.45 * Math.sin(mig.plakatPuls.t * 6));
                NK.tegnPlakat(c, p.x, p.y, p.b, p.h, slags, {
                    lys: lys, vinkel: i ? 0.012 : -0.015, fremhaev: puls ? mig.plakatPuls.fremhaev : null
                });
            });
        }
        if (this.laererTegnOver) this.laererTegnOver(c);
    };

    /* R: samme opgave forfra. */
    NK.SimUkendt.prototype.nulstil = function () { this.startOpgave(this.o); };
}());
