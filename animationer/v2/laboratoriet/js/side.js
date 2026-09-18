/* =====================================================================
   side.js - den faelles skal om et laboratorieforsoeg

   Alt det, der er ens paa hver eneste side: tegneloekken, aflaesningen
   af det valgte glas, zoomboblen i panelet, beskeden paa scenen,
   lydknappen, introen, rundvisningen, tastaturet og Start forfra.
   Foer denne fil havde hvert forsoeg sin egen app.js, og de var 92 %
   identiske.

   Et forsoeg starter sin side med:

     NK.Side.start({
         navn: "sb24",                  // noegle til localStorage
         opstilling: NK.OPSTILLING,     // ét bord
         valg: NK.BORD_VALG
     });

   eller, for flere rum (se rum.js):

     NK.Side.start({ navn: "spillet", plan: NK.RUM_PLAN });

   Panelet bygges af HTML. Side.js binder kun det, der faktisk findes
   paa siden, saa et forsoeg tager de kort med, det vil have:

     #scene-laerred   lærredet med bordet          (kraeves)
     #scenebesked     linjen, der kommer og gaar
     #boble-laerred   zoomboblen i panelet
     #glas-titel #glas-volumen #glas-tom #glas-indhold #glas-temp
     #uheld-taeller   antal uheld
     #rumknapper      knapper til rummene          (kun med plan)
     #forfraknap #lydknap #hjaelpknap #introknap
     #intro #intro-start #intro-rundvisning
     #logbog-tekst #logbog-noter #logbog-ryd

   Kroge, som forsoeget kan saette i valg:
     vedAendring(grund)     noget aendrede sig paa bordet
     vedBesked(tekst, slags)
     vedHaendelse(type, data)
   Forloebets replikker ({ sig } i en konsekvens, eller et trins sig) gaar
   gennem side.sig: til bordets laerer, hvis der er en, ellers som besked.
     vedSkift(rum, forrige) man kom ind i et nyt rum
     tast(e)                returnér true, hvis tasten blev brugt
     efterStart(side)       kaldes, naar alt er bygget
     panel(side)            tegn forsoegets egne felter i panelet

   NK.Side.nu er siden, saa selvtest og konsol kan pille ved den.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var St = NK.Stof;
    var B = NK.Beholder;

    function tal(x, dec) {
        return x.toFixed(dec === undefined ? 1 : dec).replace(".", ",");
    }

    function stor(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

    /* localStorage fejler paa file:// og i privat browsing */
    function gemt(noegle, vaerdi) {
        try {
            if (vaerdi === undefined) return window.localStorage.getItem(noegle);
            window.localStorage.setItem(noegle, vaerdi);
        } catch (fejl) { /* saa husker den ingenting, og det er i orden */ }
        return null;
    }

    var Side = function (valg) {
        this.valg = valg || {};
        this.navn = this.valg.navn || "forsoeg";
        this.beskedUr = null;
        this.sidsteTid = 0;
        this.sidsteSignatur = "";
    };

    var P = Side.prototype;

    /* ----- Bordet, uanset om det er ét bord eller flere rum ---------------- */
    P.bord = function () { return this.rum ? this.rum.aktiv() : this.etBord; };
    P.verden = function () { return this.rum || this.etBord; };
    P.uheld = function () { return this.rum ? this.rum.antalUheld() : this.etBord.antalUheld; };

    /* ----- Aflaesningen af det valgte glas --------------------------------- */
    P.opdaterPanel = function () {
        var b = this.bord();
        var c = b.valgtBeholder();
        var tabel = NK.el("glas-indhold");
        var boble = NK.el("boble-laerred");
        if (NK.el("uheld-taeller")) NK.saetTekst("uheld-taeller", String(this.uheld()));
        if (boble) boble.hidden = !c;

        if (!c) {
            if (NK.el("glas-titel")) NK.saetTekst("glas-titel", "Det valgte glas");
            if (NK.el("glas-volumen")) NK.saetTekst("glas-volumen", "");
            if (NK.el("glas-tom")) {
                NK.el("glas-tom").hidden = false;
                if (this.valg.tomTekst) NK.saetTekst("glas-tom", this.valg.tomTekst);
            }
            if (tabel) tabel.hidden = true;
            if (NK.el("glas-temp")) NK.el("glas-temp").hidden = true;
            if (this.valg.panel) this.valg.panel(this);
            this.sidsteSignatur = this.signatur();
            return;
        }

        var o = B.samlet(c);
        if (NK.el("glas-titel")) NK.saetTekst("glas-titel", stor(c.titel));
        if (NK.el("glas-volumen")) NK.saetTekst("glas-volumen", tal(B.volumen(c)) + " mL");

        var raekker = [];
        Object.keys(o.n).sort().forEach(function (navn) {
            var s = St.stof(navn);
            if (o.n[navn] < 1e-3) return;
            if (s.fase === "s") raekker.push({ formel: St.formel(navn, true), vaerdi: tal(o.n[navn] / 1000, 2), enhed: "mmol", fast: true });
            else if (s.fase === "aq") raekker.push({ formel: St.formel(navn, true), vaerdi: tal(St.konc(o, navn), o.V > 0 && St.konc(o, navn) < 1 ? 2 : 1), enhed: "mM" });
        });

        var tom = NK.el("glas-tom");
        if (tom) {
            if (!raekker.length && B.volumen(c) > 0.05) { NK.saetTekst("glas-tom", "Kun vand."); tom.hidden = false; }
            else if (!raekker.length) { NK.saetTekst("glas-tom", "Tomt."); tom.hidden = false; }
            else tom.hidden = true;
        }

        if (tabel) {
            tabel.innerHTML = "";
            raekker.forEach(function (rk) {
                var tr = document.createElement("tr");
                if (rk.fast) tr.className = "fast";
                var th = document.createElement("th");
                th.textContent = rk.formel;
                var td = document.createElement("td");
                td.textContent = rk.vaerdi;
                var te = document.createElement("td");
                te.className = "enhed";
                te.textContent = rk.enhed;
                tr.appendChild(th); tr.appendChild(td); tr.appendChild(te);
                tabel.appendChild(tr);
            });
            tabel.hidden = !raekker.length;
        }

        var temp = NK.el("glas-temp");
        if (temp) {
            temp.hidden = B.volumen(c) < 0.05;
            var ph = St.pH(o);
            temp.textContent = "Temperatur: " + NK.Tegning.temperaturTekst(o.T) +
                (c.koger ? " (koger)" : "") + (ph === null ? "" : " · pH " + tal(ph, 1));
        }

        if (this.valg.panel) this.valg.panel(this);
        this.sidsteSignatur = this.signatur();
    };

    /* Et kort aftryk af tilstanden, saa panelet kun tegnes om, naar noget
       har aendret sig */
    P.signatur = function () {
        var b = this.bord();
        var c = b.valgtBeholder();
        var forrum = this.rum ? this.rum.nu.navn + "|" : "";
        if (!c) return forrum + "ingen|" + this.uheld();
        var o = B.samlet(c);
        var ph = St.pH(o);
        var dele = [forrum, c.navn, Math.round(B.volumen(c) * 10), Math.round(o.T * 2),
            this.uheld(), c.koger ? 1 : 0, ph === null ? "" : Math.round(ph * 10)];
        Object.keys(o.n).sort().forEach(function (n) { dele.push(n + ":" + Math.round(o.n[n] * 10)); });
        if (this.valg.signatur) dele.push(this.valg.signatur(this));
        return dele.join("|");
    };

    /* ----- Zoomboblen i panelet -------------------------------------------- */
    P.tegnBoble = function () {
        var c = NK.el("boble-laerred");
        if (!c || !this.bobleL) return;
        var vis = !!this.bord().valgtBeholder();
        if (c.hidden !== !vis) c.hidden = !vis;
        if (!vis) return;
        this.bobleL.tilpas();
        var ctx = this.bobleL.ctx;
        ctx.clearRect(0, 0, this.bobleL.b, this.bobleL.h);
        this.verden().tegnBoble(ctx, this.bobleL.b / 2, this.bobleL.h / 2);
    };

    /* ----- Beskeden paa scenen --------------------------------------------- */
    P.besked = function (tekst, slags) {
        var el = NK.el("scenebesked");
        if (!el) return;
        el.className = "scenebesked";
        void el.offsetWidth;
        el.textContent = tekst;
        el.className = "scenebesked vis " + (slags || "");
        window.clearTimeout(this.beskedUr);
        this.beskedUr = window.setTimeout(function () { el.classList.remove("vis"); }, 2800);
    };

    /* ----- En replik paa scenen ----------------------------------------------
       Forloebet siger noget: en konsekvens { sig } eller et trins eget sig.
       Er der en laerer paa bordet, siger han det - kommer ind, siger
       linjerne og gaar igen (laererReplik i forsoegets laerer.js). Er der
       ingen, eller kan han ikke lige nu, bliver det en besked, saa ingen
       linje gaar tabt. valg kan have peg, glimt, udtryk og slags med. */
    P.sig = function (tekst, valg, kilde) {
        var b = this.bord();
        if (b && b.laererReplik && b.laererReplik(tekst, valg || {}, kilde)) return;
        this.besked(Array.isArray(tekst) ? tekst.join(" ") : tekst, (valg && valg.slags) || "info");
    };

    /* ----- Overlays, intro og lyd ------------------------------------------ */
    P.lukOverlay = function () {
        var aabne = document.querySelectorAll(".overlay.vis");
        for (var i = 0; i < aabne.length; i++) aabne[i].classList.remove("vis");
    };

    P.aabnIntro = function () {
        if (!NK.el("intro")) return;
        NK.Rundvisning.luk();
        this.lukOverlay();
        NK.el("intro").classList.add("vis");
        if (NK.el("intro-start")) NK.el("intro-start").focus({ preventScroll: true });
    };

    P.introFoersteGang = function () {
        var noegle = "nk-" + this.navn + "-intro";
        var set = !!gemt(noegle);
        gemt(noegle, "set");
        if (!set) this.aabnIntro();
    };

    P.visLyd = function () {
        var knap = NK.el("lydknap");
        if (!knap) return;
        var til = NK.Lyd.erTil();
        knap.classList.toggle("fra", !til);
        knap.setAttribute("aria-pressed", til ? "true" : "false");
    };

    P.skiftLyd = function () {
        NK.Lyd.saet(!NK.Lyd.erTil());
        NK.Lyd.laasOp();
        this.visLyd();
    };

    P.startForfra = function () {
        if (this.rum) this.rum.nulstil();
        else {
            this.etBord.holdt = null;
            this.etBord.baerer = null;
            this.etBord.nulstil();
        }
        if (this.forloeb) this.forloeb.nulstil();
        if (this.visRum) this.visRum();
        this.opdaterForloeb();
        this.opdaterPanel();
    };

    /* ----- Logbogen, hvis siden har en ------------------------------------- */
    P.aflaesning = function () {
        var b = this.bord();
        var c = b.valgtBeholder();
        if (!c) return null;
        var o = B.samlet(c);
        var dele = [stor(c.titel) + ": " + tal(B.volumen(c)) + " mL"];
        if (B.volumen(c) > 0.05) {
            dele.push(NK.Tegning.temperaturTekst(o.T));
            var ph = St.pH(o);
            if (ph !== null) dele.push("pH " + tal(ph, 1));
        }
        var stoffer = [];
        Object.keys(o.n).sort().forEach(function (navn) {
            var s = St.stof(navn);
            if (o.n[navn] < 1e-3) return;
            if (s.fase === "s") stoffer.push(St.formel(navn, true) + " " + tal(o.n[navn] / 1000, 2) + " mmol");
            else if (s.fase === "aq") stoffer.push(St.formel(navn) + " " + tal(St.konc(o, navn), St.konc(o, navn) < 1 ? 2 : 1) + " mM");
        });
        if (stoffer.length) dele.push(stoffer.join(", "));
        var v = b.g && b.g.vaegt;
        if (v && b.masseePaa && b.masseePaa(v) > 0 && c.paa === v) dele.push("vægt " + b.vaegtTekst(v));
        return dele.join("; ");
    };

    P.logbogGem = function () {
        var el = NK.el("logbog-tekst");
        if (el) gemt("nk-" + this.navn + "-logbog", el.value);
    };

    P.logbogNoter = function () {
        var linje = this.aflaesning();
        if (!linje) { this.besked("Klik på et glas først.", "advarsel"); return; }
        var el = NK.el("logbog-tekst");
        var nu = new Date();
        var klokken = (nu.getHours() < 10 ? "0" : "") + nu.getHours() + ":" + (nu.getMinutes() < 10 ? "0" : "") + nu.getMinutes();
        el.value = (el.value ? el.value.replace(/\s+$/, "") + "\n" : "") + klokken + " " + linje;
        el.scrollTop = el.scrollHeight;
        this.logbogGem();
        if (NK.Lyd && NK.Lyd.klik) NK.Lyd.klik();
    };

    /* ----- Forloebet i panelet -----------------------------------------------
       Logikken staar i forloeb.js og ved intet om HTML. Her staar kun,
       hvordan trinnet vises: teksten, taelleren og hintknappen. En side
       uden forloeb-kort mister ingenting. */
    P.opdaterForloeb = function () {
        var f = this.forloeb;
        if (!f) return;
        var t = f.nuTrin();
        var tekst = NK.el("forloeb-tekst");
        if (tekst) NK.saetTekst("forloeb-tekst", t ? t.tekst : (this.valg.forloeb.slutTekst || "Alle trin er gjort."));
        var taeller = NK.el("forloeb-taeller");
        if (taeller) NK.saetTekst("forloeb-taeller", f.nummer() + "/" + f.trin.length);
        var knap = NK.el("hintknap");
        if (knap) knap.disabled = !t || !t.hint;
        var kort = NK.el("forloeb-kort");
        if (kort) kort.classList.toggle("faerdig", f.faerdig);
        var liste = NK.el("forloeb-liste");
        if (liste) {
            liste.innerHTML = "";
            f.trin.forEach(function (x) {
                var li = document.createElement("li");
                li.textContent = x.kort || x.tekst;
                li.className = f.erGjort(x.id) ? "gjort" : (x === t ? "nu" : "");
                liste.appendChild(li);
            });
        }
    };

    /* Hintet peger paa det, trinnet handler om. Det kan vaere en genstand
       paa bordet (den markeres paa scenen) eller noget i panelet, fx en
       knap (det blinker kort). Et trin behoever ikke pege paa noget. */
    P.visHint = function () {
        var f = this.forloeb;
        if (!f) return;
        var t = f.nuTrin();
        if (!t || !t.hint) return;
        this.besked(t.hint, "hint");
        if (!t.peg) return;
        if (this.bord().g[t.peg]) { this.bord().markér(t.peg, 3.5); return; }
        var el = NK.el(t.peg);
        if (!el) return;
        el.classList.remove("peger");
        void el.offsetWidth;
        el.classList.add("peger");
        window.setTimeout(function () { el.classList.remove("peger"); }, 2400);
    };

    /* ----- Teksterne ---------------------------------------------------------
       Al prosa i et forsoeg staar i dets js/tekst.js som { id: tekst }, saa
       en oevelsesvejledning kan oversaettes til én fil, og hele forsoegets
       sprog kan laeses igennem ét sted. HTML'en er kun stilladset.
       En streng bliver til tekst i elementet; en liste bliver til punkter i
       en <ul> eller <ol>. */
    P.fyldTekster = function (tekster) {
        if (!tekster) return;
        Object.keys(tekster).forEach(function (id) {
            var el = NK.el(id);
            if (!el) return;
            var t = tekster[id];
            if (Array.isArray(t)) {
                if (t.length && typeof t[0] !== "string") return;   /* fx rundvisningens stop */
                el.innerHTML = "";
                t.forEach(function (linje) {
                    var li = document.createElement("li");
                    li.innerHTML = linje;
                    el.appendChild(li);
                });
            } else if (el.tagName === "TITLE") {
                document.title = t;
            } else {
                el.innerHTML = t;
            }
        });
    };

    /* ----- Rumknapper, naar siden har flere rum ----------------------------- */
    P.bygRumknapper = function () {
        var mig = this, boks = NK.el("rumknapper");
        if (!boks || !this.rum) return;
        boks.innerHTML = "";
        this.rum.rum.forEach(function (r) {
            var k = document.createElement("button");
            k.type = "button";
            k.className = "knap";
            k.textContent = r.titel;
            k.dataset.rum = r.navn;
            k.addEventListener("click", function () {
                var d = r.i < mig.rum.nu.i ? -1 : (r.i > mig.rum.nu.i ? 1 : 0);
                mig.rum.gaaTil(r, d);
            });
            boks.appendChild(k);
        });
        this.visRum();
    };

    P.visRum = function () {
        var boks = NK.el("rumknapper");
        if (!boks || !this.rum) return;
        var knapper = boks.querySelectorAll("button");
        for (var i = 0; i < knapper.length; i++) {
            var aktiv = knapper[i].dataset.rum === this.rum.nu.navn;
            knapper[i].classList.toggle("aktiv", aktiv);
            knapper[i].setAttribute("aria-pressed", aktiv ? "true" : "false");
        }
        this.opdaterPanel();
    };

    /* ----- Tastatur --------------------------------------------------------- */
    P.tastNed = function (e) {
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key === "Escape") { this.lukOverlay(); NK.Rundvisning.luk(); return; }
        if (e.key === "?" || e.key === "h" || e.key === "H") {
            if (NK.Rundvisning.aktiv()) NK.Rundvisning.luk();
            else { this.lukOverlay(); NK.Rundvisning.start(); }
            return;
        }
        if (NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis")) return;
        if (e.key === "m" || e.key === "M") { this.skiftLyd(); return; }
        if ((e.key === "i" || e.key === "I") && this.forloeb) { this.visHint(); return; }
        if (this.valg.tast && this.valg.tast.call(this, e)) { e.preventDefault(); return; }
        if (this.rum && this.rum.tast(e)) e.preventDefault();
    };

    /* ----- Tegneloekken ------------------------------------------------------ */
    P.loekke = function (ts) {
        var dt = (ts - this.sidsteTid) / 1000;
        this.sidsteTid = ts;
        if (!isFinite(dt) || dt < 0) dt = 0;
        if (dt > 0.1) dt = 0.1;

        var v = this.verden();
        v.tilpas();
        v.opdater(dt);
        v.tegn();
        this.tegnBoble();

        /* Forloebet proeves ogsaa af sig selv, ikke kun naar eleven roerer
           noget: et glas, der staar og bliver varmt i et bad, aendrer
           tilstand uden at nogen har gjort noget. Fire gange i sekundet er
           rigeligt og koster nogle faa opslag. */
        if (this.forloeb) {
            this.forloebsUr = (this.forloebsUr || 0) + dt;
            if (this.forloebsUr > 0.25) { this.forloebsUr = 0; this.forloeb.opdater(); }
        }

        if (this.signatur() !== this.sidsteSignatur) this.opdaterPanel();
        var mig = this;
        window.requestAnimationFrame(function (t) { mig.loekke(t); });
    };

    /* ----- Opstart ------------------------------------------------------------ */
    P.start = function () {
        var mig = this, valg = this.valg;

        NK.Sprites.start();
        this.fyldTekster(valg.tekster);

        if (valg.plan) {
            this.rum = new NK.Rum(NK.el("scene-laerred"), valg.plan);
            this.rum.bindMus();
            this.rum.vedSkift = function (r, forrige) {
                mig.visRum();
                if (valg.vedSkift) valg.vedSkift.call(mig, r, forrige);
            };
        } else {
            this.etBord = new NK.Bord(NK.el("scene-laerred"), valg.valg || NK.BORD_VALG);
            this.etBord.byg(valg.opstilling || NK.OPSTILLING);
            this.etBord.bindMus();
        }

        var v = this.verden();
        v.vedAendring = function (grund) {
            if (mig.forloeb) mig.forloeb.opdater();
            mig.opdaterPanel();
            if (valg.vedAendring) valg.vedAendring.call(mig, grund);
        };
        v.vedBesked = function (tekst, slags) {
            if (valg.vedBesked) valg.vedBesked.call(mig, tekst, slags);
            else mig.besked(tekst, slags);
        };
        if (valg.vedHaendelse) {
            v.vedHaendelse = function (type, data, rum) { valg.vedHaendelse.call(mig, type, data, rum); };
        }

        /* Forloebet, hvis forsoeget har et. Det faar bordet som en funktion,
           saa det ogsaa virker med flere rum, hvor det aktive bord skifter. */
        if (valg.forloeb && NK.Forloeb) {
            var f = {};
            Object.keys(valg.forloeb).forEach(function (n) { f[n] = valg.forloeb[n]; });
            f.navn = f.navn || this.navn;
            f.bord = function () { return mig.bord(); };
            f.besked = function (tekst, slags) { mig.besked(tekst, slags); };
            f.sig = function (tekst, s, kilde) { mig.sig(tekst, s, kilde); };
            var forrigeTrin = f.vedTrin;
            f.vedTrin = function (t, F2) {
                mig.opdaterForloeb();
                if (t.sig) mig.sig(t.sig, { slags: "gjort" }, t);
                if (forrigeTrin) forrigeTrin.call(mig, t, F2);
            };
            var forrigeFaerdig = f.vedFaerdig;
            f.vedFaerdig = function (F2) {
                mig.opdaterForloeb();
                if (forrigeFaerdig) forrigeFaerdig.call(mig, F2);
            };
            this.forloeb = NK.Forloeb.saet(f);
        }

        if (NK.el("boble-laerred")) this.bobleL = new NK.Laerred(NK.el("boble-laerred"));

        /* Saa siden kan pilles ved fra konsollen og fra selvtesten */
        NK.Side.nu = this;
        NK.bord = this.etBord || null;
        NK.rum = this.rum || null;
        NK.opdaterPanel = function () { mig.opdaterPanel(); };
        NK.startForfra = function () { mig.startForfra(); };
        NK.intro = { aabn: function () { mig.aabnIntro(); }, luk: function () { mig.lukOverlay(); } };

        this.bygRumknapper();

        function paa(id, haendelse, fn) {
            var el = NK.el(id);
            if (el) el.addEventListener(haendelse, fn);
        }
        paa("forfraknap", "click", function () { mig.startForfra(); });
        paa("hintknap", "click", function () { mig.visHint(); });
        this.opdaterForloeb();
        paa("lydknap", "click", function () { mig.skiftLyd(); });
        paa("hjaelpknap", "click", function () { mig.lukOverlay(); NK.Rundvisning.start(); });
        paa("introknap", "click", function () { mig.aabnIntro(); });
        paa("intro-start", "click", function () { mig.lukOverlay(); });
        paa("intro-rundvisning", "click", function () { mig.lukOverlay(); NK.Rundvisning.start(); });
        paa("intro", "click", function (e) { if (e.target === this) mig.lukOverlay(); });

        if (NK.el("logbog-tekst")) {
            NK.el("logbog-tekst").value = gemt("nk-" + this.navn + "-logbog") || "";
            paa("logbog-tekst", "input", function () { mig.logbogGem(); });
            paa("logbog-noter", "click", function () { mig.logbogNoter(); });
            paa("logbog-ryd", "click", function () { NK.el("logbog-tekst").value = ""; mig.logbogGem(); });
            NK.logbog = { noter: function () { mig.logbogNoter(); }, aflaesning: function () { return mig.aflaesning(); } };
        }

        document.addEventListener("keydown", function (e) { mig.tastNed(e); });

        this.visLyd();
        v.tilpas();
        this.opdaterPanel();
        this.introFoersteGang();

        if (valg.efterStart) valg.efterStart.call(this, this);

        window.requestAnimationFrame(function (ts) {
            mig.sidsteTid = ts;
            window.requestAnimationFrame(function (t) { mig.loekke(t); });
        });
    };

    NK.Side = {
        Side: Side,
        nu: null,
        start: function (valg) {
            var side = new Side(valg);
            function gaa() { side.start(); }
            if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", gaa);
            else gaa();
            return side;
        }
    };
}());
