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

   Mere spil (22. nov. 2026, Niels: "lidt mere gamification til del 2
   med rullebaandet", highscore og hurtigere og hurtigere): glassene
   kommer i fast takt (hvert), saa et hurtigt svar ikke fremskynder
   spillet. Selv en meget god spiller naar niveau 13 efter ca. seks
   minutter. Niveau 13 er umenneskeligt hurtigt: ti etiketter paa ti
   sekunder. Klares det, kommer resultatet ikke paa highscorelisten,
   for det kan intet menneske. Point, stime, liv og rekorden staar paa
   kortet under spillet. Foer start og ved slut staar et ark over
   baandet med resultatet og den faelles top 10 (js/topliste.js).

   Papirkortet (6. nov. 2026) staar oeverst over hylden: opgaven, svaret
   paa det sidste glas og Indsend svar (det samme som Enter). Kortet
   bliver ikke staaende paa et loest glas, og der er ingen hintknap: det
   er et spil paa tid, og baandet koerer videre. Hjaelpen er plakaterne
   og lageret paa fane 1.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;
    var Tj = NK.Tjek;

    var NOEGLE = "nk-sc2.3-baand";
    var LIV = 3;

    /* tid:   sekunder, et glas er om at koere hele baandet igennem
       hvert: sekunder mellem to glas (hoejst saa ofte kommer der et)
       max:   glas paa baandet ad gangen (en langsom spiller faar tid)
       antal: rigtige svar, foer niveauet stiger
       En spiller, der svarer rigtigt paa hvert glas, bruger summen af
       hvert x antal: ca. 6 min 30 s paa niveau 1-12. */
    function blandet(hvert, tid) {
        return { navn: "Det hele blandet", hylde: null, retning: "begge", hvert: hvert, tid: tid, max: 4, antal: 7 };
    }
    var NIVEAUER = [
        { navn: "Skriv formlen", hylde: 0, retning: "formel", hvert: 6.5, tid: 20, max: 2, antal: 6 },
        { navn: "Skriv navnet", hylde: 1, retning: "navn", hvert: 6.5, tid: 21, max: 2, antal: 6 },
        { navn: "Sammensatte ioner", hylde: 2, retning: null, hvert: 6.5, tid: 21, max: 2, antal: 6 },
        blandet(6.5, 19), blandet(5.8, 17), blandet(5.2, 15.5), blandet(4.6, 14), blandet(4.1, 12.5),
        blandet(3.7, 11), blandet(3.3, 10), blandet(3.0, 9), blandet(2.7, 8),
        { navn: "Umenneskeligt hurtigt", hylde: null, retning: "begge", hvert: 1.0, tid: 3.2, max: 5, antal: 10, umenneskeligt: true }
    ];
    var SIDSTE = NIVEAUER.length - 1;

    function niveau(n) { return NIVEAUER[Math.min(n, SIDSTE)]; }

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
        this.ark = NK.el("baand-topliste");
        this.liste = null;
        this.listeStatus = NK.Topliste.findes() ? "henter" : "ingen";
        this.nulstilSpil();
        this.koblInput();
        this.koblMus();
        this.koblArk();
        this.hentListe();
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
        this.rekordSlaaet = false;
        this.robot = false;
        this.sendt = false;
        this.egen = null;
        this.sidenSidst = 99;       /* det foerste glas kommer med det samme */
        this.venter = 0;
        this.spilTid = 0;
        this.slutTid = 0;
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
        /* Glassene paa hylden er store nok til, at navnet kan laeses, og
           smaa nok til, at der er plads til otte ved siden af hinanden */
        lay.lilleH = NK.klamp(H * 0.13, 60, 108);
        /* Hylden begynder under papirkortet */
        lay.hyldeY = Math.round(Math.max(H * 0.18, this.top() + lay.lilleH + 6));

        var mb = NK.klamp(W * 0.36, 250, 380);
        var mh = mb * 150 / 240;
        lay.maskine = { x: Math.max(12, W * 0.4 - mb / 2), y: lay.bordY - mh * 0.95, b: mb };

        /* Baandet staar lidt over midten. Paa en lav skaerm (1366 x 768)
           rykker det ned mod etiketmaskinen, saa glassene bliver store nok
           til, at etiketten kan laeses (19. nov. 2026). Over glasset skal
           der vaere plads til hyldebraettet og pilen (OVER). */
        var OVER = 54, STOERST = 185;
        var lavest = Math.min(H * 0.6, lay.maskine.y - 28);
        lay.baandY = Math.round(Math.max(H * 0.56, Math.min(lavest, lay.hyldeY + OVER + STOERST)));
        lay.x0 = 0;
        lay.x1 = Math.round(W * 0.8);
        lay.glasH = NK.klamp(Math.min(H * 0.26, W * 0.2, lay.baandY - lay.hyldeY - OVER), 100, STOERST);
        lay.glasB = Tg.glasBredde(lay.glasH);

        var kb = NK.klamp(W * 0.17, 120, 200), kk = kb / 170;
        lay.kasse = { x: W - kb - Math.max(8, W * 0.012), y: lay.baandY + 30 - 34 * kk, b: kb };
        lay.kasseBund = lay.kasse.y + 130 * kk;

        /* Plakaterne haenger i en soejle til hoejre over kassen, og hylden
           foroven slutter foer dem */
        var pb = Math.min(W * 0.17, 200), px = W - pb - Math.max(10, W * 0.015);
        lay.hyldeX1 = px - 16;
        /* Hvor mange glas der er plads til paa hylden, og afstanden mellem dem */
        lay.hyldeLb = Tg.glasBredde(lay.lilleH) * 1.02;
        lay.hyldePlads = Math.max(1, Math.floor((lay.hyldeX1 - 8 - 24) / lay.hyldeLb));
        var ptH = NK.klamp(pb * 0.62, 70, 130);
        var ionH = NK.klamp(lay.kasse.y - 26 - (14 + ptH + 16), 70, 190);
        lay.plakater = {
            pt: { x: px, y: 14, b: pb, h: ptH },
            ioner: { x: px + pb * 0.06, y: 14 + ptH + 16, b: pb * 0.88, h: ionH }
        };

        this.lay = lay;

        /* Det usynlige indtastningsfelt ligger oven paa displayet */
        var mm = Tg.maskineMaal(lay.maskine.x, lay.maskine.y, mb);
        var e = NK.el("baand-lcd");
        e.style.left = Math.round(mm.lcd.x) + "px";
        e.style.top = Math.round(mm.lcd.y) + "px";
        e.style.width = Math.round(mm.lcd.b) + "px";
        e.style.height = Math.round(mm.lcd.h) + "px";

        /* Papirkortet staar over hylden, til venstre for plakaterne */
        var sk = NK.el("baand-skort");
        if (sk) {
            sk.style.left = "12px";
            sk.style.width = Math.round(Math.max(200, lay.hyldeX1 - 20)) + "px";
        }

        /* Arket med resultatet og toplisten staar over baandet, til
           venstre, saa Kemichael kan staa ved siden af det */
        var plads = Math.min(lay.hyldeX1, lay.kasse.x) - 170 - 16;
        var ab = NK.klamp(plads, 340, 620);
        lay.ark = { x: Math.round(16 + Math.max(0, (plads - ab) / 2)), y: Math.round(lay.hyldeY + 24), b: Math.round(ab) };
        lay.ark.h = Math.round(lay.bordY - 8 - lay.ark.y);
        if (this.ark) {
            this.ark.style.left = lay.ark.x + "px";
            this.ark.style.top = lay.ark.y + "px";
            this.ark.style.width = lay.ark.b + "px";
            this.ark.style.maxHeight = lay.ark.h + "px";
            this.ark.classList.toggle("lavt", lay.ark.h < 400);
        }

        this.saetAnker("baand-anker-baand", 0, lay.baandY - lay.glasH - 30, lay.x1, lay.glasH + 60);
        this.saetAnker("baand-anker-kasse", lay.kasse.x - 6, lay.kasse.y - 6, kb + 12, lay.kasseBund - lay.kasse.y + 12);
        this.saetAnker("baand-anker-hylde", 8, lay.hyldeY - lay.lilleH - 8, lay.hyldeX1 - 8, lay.lilleH + 24);
        this.saetAnker("baand-anker-plakater", px - 6, 8, pb + 12, lay.plakater.ioner.y + lay.plakater.ioner.h - 2);
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
        this.visSkort();
        this.visArk();
    };

    P.kortZone = function () {
        return window.innerHeight <= 720 ? 108 : 116;
    };

    P.top = function () { return 10 + this.kortZone() + 10; };

    P.besked = function (html, klasse) {
        this.beskedH = html || "";
        this.beskedK = html ? (klasse || "") : "";
        this.visSkort();
    };

    P.kanSendes = function () {
        return this.tilstand === "koerer" && !!(this.input && this.input.value.trim());
    };

    /* Papirkortet: opgaven efter spillets tilstand og svaret paa det
       sidste glas. Start, Pause og Spil igen ligger i panelet. */
    P.visSkort = function () {
        var e = NK.el("baand-skort");
        if (!e) return;
        var n = niveau(this.nivNr), chip, tekst;
        var opg = "Skriv den manglende halvdel af etiketten på det forreste glas.";
        if (this.tilstand === "klar") {
            chip = "Samlebåndet";
            tekst = opg + " Tryk Start samlebåndet for at begynde.";
        } else if (this.tilstand === "pause") {
            chip = "Pause";
            tekst = "Samlebåndet holder pause. Tryk Fortsæt i panelet for at køre videre.";
        } else if (this.tilstand === "slut") {
            chip = "Spillet er slut";
            tekst = this.robot ? "Det umenneskelige niveau er klaret med " + this.point + " point. Tryk Spil igen for at spille igen."
                : "Samlebåndet er stoppet med " + this.point + " point. Tryk Spil igen for at spille igen.";
        } else {
            /* Under spillet staar tallene i stedet for opgaven, som
               etiketmaskinens display og pilen ved glasset siger */
            chip = "Niveau " + (this.nivNr + 1) + " · " + n.navn;
            tekst = null;
        }
        var html = '<p class="sk-tekst"><span class="sk-chip">' + NK.html(chip) + "</span>" +
            (tekst === null ? this.talHTML() : NK.html(tekst)) + "</p>" +
            '<div class="sk-bund' + (this.beskedK ? " " + this.beskedK : "") + (this.beskedH ? "" : " tom") + '">' +
            '<p class="st-tekst">' + (this.beskedH || "") + "</p>" +
            (this.tilstand === "koerer" ? '<button type="button" class="knap indsend ' + (this.kanSendes() ? "klar" : "ikke-klar") +
                '">Indsend svar</button>' : "") + "</div>";
        if (e.className !== "scenekort opgave") e.className = "scenekort opgave";
        if (e.innerHTML !== html) e.innerHTML = html;
    };

    /* Point, stime, liv og rekorden paa kortet, saa de kan ses under
       spillet uden at kigge i panelet */
    P.talHTML = function () {
        var hjerter = "";
        for (var i = 0; i < LIV; i++) hjerter += i < this.liv ? "♥" : "♡";
        var g = this.gange();
        return '<span class="bd-tal"><span class="bd-point">' + this.point + " point</span>" +
            '<span class="bd-stime' + (g > 1 ? " varm" : "") + '">stime ' + this.stime + (g > 1 ? " · ×" + g : "") + "</span>" +
            '<span class="bd-liv" aria-label="' + this.liv + ' liv">' + hjerter + "</span>" +
            '<span class="bd-rekord' + (this.rekordSlaaet ? " slaaet" : "") + '">rekord ' + Math.max(this.rekord, this.rekordSlaaet ? this.point : 0) + "</span></span>";
    };

    P.visIndsend = function () {
        var b = document.querySelector("#baand-skort .indsend");
        if (!b) return;
        var klar = this.kanSendes();
        b.classList.toggle("klar", klar);
        b.classList.toggle("ikke-klar", !klar);
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

    /* Hvor svaert et stof er: antallet af ioner i formlen. KI og MgO (2)
       er lettere end MgCl2 (3), og Al2O3 og Ca3(PO4)2 (5) er svaerest. */
    function svaerhed(st) { return st.p + st.n; }

    /* Naeste stof: fra en blandet pose, saa alle kommer, foer nogen
       kommer igen. Paa de tre foerste niveauer kommer de lette foerst
       (19. nov. 2026); inden for samme svaerhed er raekkefoelgen
       tilfaeldig. Det blandede niveau traekker helt tilfaeldigt. */
    P.traek = function () {
        var n = niveau(this.nivNr);
        var svaer = NK.indstil.svaer;
        if (!this.pose.length || this.pose.niv !== this.nivNr || this.pose.svaer !== svaer) {
            var liste = D.aktive(svaer).filter(function (st) { return n.hylde === null || st.hylde === n.hylde; });
            this.pose = NK.bland(liste);
            /* pop tager fra enden, saa de lette skal staa sidst */
            if (n.hylde !== null) this.pose.sort(function (a, b) { return svaerhed(b) - svaerhed(a); });
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
            this.input.value = "";
            this.rigtigt(g, res.note);
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
        /* Et glas er mere vaerd paa et hoejere niveau, stimen ganger op
           til fem, og et hurtigt svar giver op til 5 point ekstra */
        var bonus = Math.round(5 * NK.klamp(1 - (g.x - lay.x0) / (lay.x1 - lay.x0), 0, 1));
        var gange = this.gange();
        var faaet = (10 + 5 * Math.min(this.nivNr, SIDSTE)) * gange + bonus;
        this.point += faaet;
        this.floats.push({ tekst: "+" + faaet, x: g.x, y: lay.baandY - lay.glasH - 14, t: 0 });
        if (gange > 1 && this.stime % 3 === 0 && this.stime <= 12) {
            this.floats.push({ tekst: "Stime ×" + gange, x: g.x, y: lay.baandY - lay.glasH - 40, t: -0.2, lille: true });
        }
        if (!this.rekordSlaaet && this.rekord > 0 && this.point > this.rekord) {
            this.rekordSlaaet = true;
            this.banner = { tekst: "Ny rekord", t: 0 };
        }
        g.status = "loest";
        g.t = 0;
        g.fraX = g.x;
        this.besked(note || "", note ? "gul" : "");
        this.rigtigeIalt++;
        this.rigtigeINiveau++;
        if (this.rigtigeINiveau >= niveau(this.nivNr).antal) {
            if (this.nivNr >= SIDSTE) {
                /* Ti etiketter paa ti sekunder: det kan intet menneske */
                this.robot = true;
                this.slut();
                return;
            }
            this.rigtigeINiveau = 0;
            this.nivNr++;
            this.visBanner();
            /* Foer det umenneskelige niveau: et kort pusterum til banneret */
            if (niveau(this.nivNr).umenneskeligt) this.venter = 2.2;
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
        this.besked("Et glas røg i kassen. Den manglende halvdel af etiketten var <b>" + NK.html(g.retning === "formel" ? g.st.formelTekst : g.st.navn) + "</b>.", "skidt");
        if (this.liv <= 0) { this.slut(); return; }
        this.visPanel();
    };

    /* Spillet er slut. En robot (det umenneskelige niveau klaret) faar
       hverken rekord eller plads paa listen. */
    P.slut = function () {
        this.tilstand = "slut";
        this.slutTid = 0;
        var ny = !this.robot && this.point > this.rekord;
        if (ny) {
            this.rekord = this.point;
            NK.gem(NOEGLE, { rekord: this.rekord });
        }
        this.nyRekord = ny && this.point > 0;
        this.besked("", "");
        var art = this.robot ? "robot" : this.nyRekord ? "rekord" : (this.rigtigeIalt === 0 ? "ingen" : (this.rigtigeIalt < 6 ? "faa" : "mange"));
        this.ventSlut = { t: 1.4, art: art };
        if (this.input) { this.input.value = ""; this.input.blur(); }
        this.visPanel();
        if (!this.robot) this.hentListe();
        var felt = this.ark && this.ark.querySelector(".bd-navn");
        if (felt && !felt.value) { try { felt.focus({ preventScroll: true }); } catch (e) { felt.focus(); } }
    };

    /* ----- Arket med resultatet og toplisten -------------------------------- */
    P.hentListe = function () {
        var mig = this;
        if (!NK.Topliste.findes()) { this.listeStatus = "ingen"; return; }
        if (!this.liste) this.listeStatus = "henter";
        NK.Topliste.hent().then(function (l) {
            if (l) { mig.liste = l; mig.listeStatus = "ok"; } else if (!mig.liste) mig.listeStatus = "fejl";
            mig.visArk();
        });
    };

    P.sendListe = function () {
        var mig = this, felt = this.ark.querySelector(".bd-navn");
        var navn = NK.Topliste.rens(felt ? felt.value : "");
        if (!navn || this.sendt || this.robot || this.point <= 0 || this.tilstand !== "slut") return;
        NK.Topliste.navn(navn);
        this.sendt = "sender";
        this.egen = { navn: navn, point: this.point };
        this.visArk();
        NK.Topliste.send({ navn: navn, point: this.point, niveau: this.nivNr + 1, sekunder: Math.round(this.spilTid) })
            .then(function (l) {
                mig.sendt = l ? "sendt" : "fejl";
                if (l) { mig.liste = l; mig.listeStatus = "ok"; }
                mig.visArk();
            });
    };

    function tid(s) {
        s = Math.round(s);
        var m = Math.floor(s / 60);
        return (m ? m + " min " : "") + (s % 60) + " s";
    }

    P.listeHTML = function () {
        if (this.listeStatus === "ingen") return "";
        if (this.listeStatus === "henter") return '<p class="bd-note">Henter highscorelisten ...</p>';
        if (this.listeStatus === "fejl" || !this.liste) return '<p class="bd-note">Highscorelisten kan ikke hentes lige nu.</p>';
        var egen = this.egen;
        function ol(titel, rk) {
            var li = rk.slice(0, 10).map(function (r, i) {
                var erEgen = egen && r.navn === egen.navn && Number(r.point) === egen.point;
                return '<li' + (erEgen ? ' class="egen"' : "") + '><span class="nr">' + (i + 1) + '</span><span class="nv">' +
                    NK.html(String(r.navn)) + '</span><span class="pt">' + Number(r.point) + "</span></li>";
            }).join("");
            return '<div class="bd-liste"><h4>' + titel + "</h4>" +
                (li ? "<ol>" + li + "</ol>" : '<p class="bd-note">Ingen endnu.</p>') + "</div>";
        }
        return '<div class="bd-lister">' + ol("Top 10 denne uge", this.liste.uge) + ol("Top 10 alle tider", this.liste.alle) + "</div>";
    };

    P.visArk = function () {
        var e = this.ark;
        if (!e) return;
        var vis = this.tilstand === "klar" || this.tilstand === "slut";
        var html = "";
        if (this.tilstand === "klar") {
            html = "<h3>Samlebåndet</h3>" +
                '<p class="bd-tekst">Glassene kommer hurtigere og hurtigere. Hvert glas på et højere niveau giver flere point, og en stime af rigtige svar ganger op til fem.' +
                (this.rekord > 0 ? " Din rekord er " + this.rekord + " point." : "") + "</p>" +
                this.listeHTML() +
                '<div class="bd-knapper"><button type="button" class="knap bd-start">Start samlebåndet ▶</button></div>';
        } else if (this.tilstand === "slut" && this.robot) {
            html = "<h3>Det umenneskelige niveau er klaret</h3>" +
                '<p class="bd-tekst">Du har skrevet ti etiketter på ti sekunder. Det kan intet menneske, og highscorelisten er kun for mennesker. ' +
                "Resultatet på " + this.point + " point kommer derfor ikke på listen.</p>" +
                this.listeHTML() +
                '<div class="bd-knapper"><button type="button" class="knap bd-start">Spil igen ▶</button></div>';
        } else if (this.tilstand === "slut") {
            var under = "Niveau " + (this.nivNr + 1) + " · " + tid(this.spilTid) + " · " + this.rigtigeIalt + " rigtige";
            var menneske = this.nivNr >= SIDSTE
                ? '<p class="bd-tekst">Niveau 13 er umenneskeligt hurtigt. Du er altså et menneske, og resultatet kan komme på listen.</p>' : "";
            var send = "";
            if (NK.Topliste.findes() && this.point > 0) {
                if (this.sendt === "sendt") {
                    send = '<p class="bd-note groen">Du står på listen som ' + NK.html(this.egen.navn) + ".</p>";
                } else if (this.sendt === "sender") {
                    send = '<p class="bd-note">Sender ...</p>';
                } else {
                    var gl = this.ark.querySelector(".bd-navn");
                    var vaerdi = gl ? gl.value : NK.Topliste.navn();
                    send = '<div class="bd-send"><label for="bd-navn">Dit navn på listen</label>' +
                        '<input type="text" id="bd-navn" class="bd-navn" maxlength="20" autocomplete="off" spellcheck="false" placeholder="Fornavn eller kaldenavn" value="' +
                        NK.html(vaerdi) + '">' +
                        '<button type="button" class="knap bd-saet' + (NK.Topliste.rens(vaerdi) ? "" : " ikke-klar") + '">Sæt på listen</button></div>' +
                        (this.sendt === "fejl" ? '<p class="bd-note">Resultatet kunne ikke sendes. Prøv igen.</p>' : "");
                }
            }
            html = "<h3>" + (this.nyRekord ? "Ny rekord: " : "Slut: ") + this.point + " point</h3>" +
                '<p class="bd-under">' + under + "</p>" + menneske + send + this.listeHTML() +
                '<div class="bd-knapper"><button type="button" class="knap bd-start">Spil igen ▶</button></div>';
        }
        if (e.dataset.html !== html) {
            /* Feltet beholder markoeren, naar arket tegnes om */
            var aktiv = document.activeElement && document.activeElement.classList.contains("bd-navn");
            e.innerHTML = html;
            e.dataset.html = html;
            var nyt = e.querySelector(".bd-navn");
            if (aktiv && nyt) { nyt.focus(); nyt.setSelectionRange(nyt.value.length, nyt.value.length); }
        }
        this.arkSkjul(!vis);
    };

    P.arkSkjul = function (skjul) {
        if (!this.ark) return;
        skjul = skjul || !!(this.laererIIntro && this.laererIIntro());
        if (this.ark.hidden !== skjul) this.ark.hidden = skjul;
    };

    P.koblArk = function () {
        var mig = this, e = this.ark;
        if (!e) return;
        e.addEventListener("click", function (ev) {
            var t = ev.target.closest ? ev.target.closest("button") : null;
            if (!t) return;
            if (t.classList.contains("bd-start")) { mig.knap(); return; }
            if (t.classList.contains("bd-saet")) mig.sendListe();
        });
        e.addEventListener("input", function (ev) {
            if (!ev.target.classList.contains("bd-navn")) return;
            var b = e.querySelector(".bd-saet");
            if (b) b.classList.toggle("ikke-klar", !NK.Topliste.rens(ev.target.value));
        });
        e.addEventListener("keydown", function (ev) {
            if (ev.key === "Enter" && ev.target.classList.contains("bd-navn")) { ev.preventDefault(); mig.sendListe(); }
        });
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
        var vej = lay.x1 - lay.x0 + lay.glasB;
        if (this.tilstand === "slut") this.slutTid += dt;
        if (this.tilstand === "koerer") {
            this.spilTid += dt;
            this.sidenSidst += dt;
            if (this.venter > 0) this.venter -= dt;
            /* Baandet koerer med det niveau, der er nu. Hvert glas beholder
               den fart, det kom ind med, saa et nyt niveau ikke skubber de
               glas i kassen, der allerede er paa vej. */
            this.fase += vej / n.tid * dt;
            var paa = this.glas.filter(function (g) { return g.status === "paa"; });
            var bagerst = null;
            paa.forEach(function (g) { if (!bagerst || g.x < bagerst.x) bagerst = g; });
            if (this.venter <= 0 && this.sidenSidst >= n.hvert && paa.length < n.max &&
                (!bagerst || bagerst.x > lay.x0 + lay.glasB * 1.15)) {
                var ny = this.traek();
                this.glas.push({ st: ny.st, retning: ny.retning, x: lay.x0 - lay.glasB / 2, status: "paa", t: 0, ryst: 0, tid: n.tid });
                this.sidenSidst = 0;
            }
            this.glas.forEach(function (g) {
                if (g.status !== "paa") return;
                g.x += vej / (g.tid || n.tid) * dt;
                if (g.x > lay.x1 - lay.glasB * 0.1 && mig.tilstand === "koerer") mig.iKassen_(g);
            });
        }
        this.arkSkjul(!(this.tilstand === "klar" || this.tilstand === "slut"));
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

        /* Plakaterne, de samme som paa lageret */
        ["pt", "ioner"].forEach(function (slags) {
            var p = lay.plakater[slags];
            Tg.plakat(ctx, p.x, p.y, p.b, p.h, slags, {
                vinkel: slags === "pt" ? -0.012 : 0.018,
                lys: mig.over && mig.over.slags === "plakat" && mig.over.i === slags ? 1 : 0
            });
        });

        /* Hylden foroven med de glas, der har faaet etiket */
        var hb = lay.hyldeX1 - 8;
        ctx.fillStyle = "#8a6240";
        ctx.fillRect(8, lay.hyldeY, hb, 5);
        ctx.fillStyle = "#6b4a2e";
        ctx.fillRect(8, lay.hyldeY + 5, hb, 8);
        ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
        ctx.fillRect(8, lay.hyldeY + 13, hb, 4);
        var lb = lay.hyldeLb;
        var plads = lay.hyldePlads;
        var vis = this.paaHylden.slice(-plads);
        vis.forEach(function (st, i) {
            Tg.glas(ctx, 24 + lb * (i + 0.5), lay.hyldeY, lay.lilleH, st, { etiket: "ny", bredEtiket: true, tekst: true });
        });
        if (!this.paaHylden.length) {
            NK.tekst(ctx, "Glas med ny etiket kommer op på hylden her.", 8 + hb / 2, lay.hyldeY - lay.lilleH / 2,
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
                Tg.glas(ctx, x, y, h, g.st, { retning: g.retning, vip: vip, udenSkygge: true, bredEtiket: true, opgave: true });
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
                    : { etiket: "gammel", retning: g.retning, bredEtiket: true, opgave: true });
                if (g.t < 0.45) mig.tegnPrint(ctx, g);
                return;
            }
            /* Etiketten er opgaven: den brede etiket, og det, der staar paa
               den, kan altid laeses (Tg.glas, v.opgave) */
            Tg.glas(ctx, x, y, h, g.st, { retning: g.retning, lys: g === forreste ? 0.75 + 0.25 * Math.sin(mig.tid * 5) : 0,
                bredEtiket: true, opgave: true });
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
            if (f.t < 0) return;
            NK.tekst(ctx, f.tekst, f.x, f.y - f.t * 40, {
                justering: "center", font: f.lille ? "700 16px 'Segoe UI', sans-serif" : "800 20px 'Segoe UI', sans-serif",
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

        /* Ved slut staar resultatet paa arket over baandet */
        if (this.tilstand === "pause") {
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
       Selve praesentationen er den faelles (../kemichael/praesentation.js)
       med Naeste og Spring praesentationen over i hans taleboble. Esc og
       Start sender ham ogsaa ud; andre klik og tastetryk goer ikke. */
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

    /* Hvert billede: ventetiden og taleboblen */
    P.opdaterIntro = function (dt) {
        if (this.introVent > 0) {
            this.introVent -= dt;
            if (this.introVent <= 0 && this.laererIntro && this.tilstand === "klar") this.laererIntro();
        }
        if (this.introOpdaterBoble && (this.kmIntro || this.kmBobleAktiv)) this.introOpdaterBoble();
    };

    /* ----- Indtastning og mus -------------------------------------------------- */
    P.fokus = function () {
        if (!document.getElementById("fane-baand").classList.contains("aktiv")) return;
        if (document.querySelector(".overlay.vis") || (NK.Rundvisning && NK.Rundvisning.aktiv())) return;
        if (document.activeElement && document.activeElement.classList.contains("bd-navn")) return;
        try { this.input.focus({ preventScroll: true }); } catch (e) { this.input.focus(); }
    };

    P.koblInput = function () {
        var mig = this;
        this.input.addEventListener("keydown", function (e) {
            if (e.key !== "Enter") return;
            e.preventDefault();
            /* Under praesentationen er Enter Naeste, saa spillet ikke starter */
            if (mig.laererIIntro && mig.laererIIntro()) { mig.introNaeste(); return; }
            /* Et Enter lige efter slut (svaret paa det sidste glas) starter
               ikke et nyt spil, foer arket med resultatet er set */
            if (mig.tilstand === "slut" && mig.slutTid < 1.5) return;
            mig.tjek();
        });
        this.input.addEventListener("input", function () {
            mig.taster.push({ i: Math.floor(Math.random() * 30), a: 1 });
            mig.visIndsend();
        });
        NK.el("baand-skort").addEventListener("click", function (e) {
            var b = e.target.closest ? e.target.closest(".indsend") : null;
            if (!b) return;
            if (mig.kanSendes()) mig.tjek();
            mig.fokus();
        });
        this.input.addEventListener("focus", function () { mig.fokuseret = true; });
        this.input.addEventListener("blur", function () { mig.fokuseret = false; });
        NK.el("baand-knap").addEventListener("click", function () { mig.knap(); });
    };

    /* Det, musen er over: laereren eller en af plakaterne */
    P.hvadErUnder = function (pt) {
        if (!this.lay) return null;
        if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return { slags: "laerer" };
        var pl = this.lay.plakater;
        for (var navn in pl) {
            if (!Object.prototype.hasOwnProperty.call(pl, navn)) continue;
            var p = pl[navn];
            if (pt.x >= p.x && pt.x <= p.x + p.b && pt.y >= p.y && pt.y <= p.y + p.h) return { slags: "plakat", i: navn };
        }
        return null;
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointermove", function (e) {
            mig.over = mig.hvadErUnder(mig.L.punkt(e));
            c.style.cursor = mig.over ? "pointer" : "default";
        });
        c.addEventListener("pointerleave", function () { mig.over = null; c.style.cursor = "default"; });
        c.addEventListener("click", function (e) {
            var pt = mig.L.punkt(e);
            if (mig.laererIntroKlik && mig.laererIntroKlik(pt.x, pt.y)) return;
            if (mig.laererKlik && mig.laererKlik(pt.x, pt.y)) return;
            var u = mig.hvadErUnder(pt);
            if (u && u.slags === "plakat") { NK.Opslag.aabn(u.i, null); return; }
            mig.fokus();
        });
    };

    NK.SimBaand = SimBaand;
}());
