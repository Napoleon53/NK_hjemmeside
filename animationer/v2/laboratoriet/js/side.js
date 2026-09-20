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
                      (ligger #glas-indhold i en <details class="fold">,
                      skjules folden sammen med tabellen)
     #uheld-taeller   antal uheld
     #rumknapper      knapper til rummene          (kun med plan)
     #forfraknap #lydknap #hjaelpknap #introknap
     #intro #intro-start #intro-rundvisning
     #teori #teori-indhold #teori-luk   teoriboksen; aabnes med
                      #teoriknap, #teori-aabn eller tasten T
     #tilskuere-linje #tilskuere-vis #tilskuere-navne
                      et flueben, der viser tilskuerionerne (bordets
                      valg.tilskuere); linjen vises kun, naar det valgte
                      glas har nogen. Navnene er knapper, der loefter en
                      ion op (F27)
     #replik-liste #replik-ingen (og evt. #replik-kort #replik-antal
                      #replik-sidst #replik-fold)
                      det, der er sagt i taleboblen, et varigt sted
                      (S13): forloebets replikker altid, Kemichaels egne
                      scener (uheld, vasken) hvis valg.historik naevner
                      dem, smaasnak aldrig. F56: listen kan staa i en
                      fane under noterne i stedet for i et kort
     #uheld-liste #uheld-ingen #noter-uheld
                      uheldene, én linje hver (»Uheld 1: Glas 3 væltede«,
                      bord.uheldListe), og taelleren i noternes hjoerne
     #rystknap        »Ryst glasset«: holdes nede (eller tasten R) og
                      ryster det valgte glas uden at spilde (S16); vises
                      kun, naar det valgte glas kan rystes
     #logbog-tekst #logbog-noter #logbog-ryd
     #noterknap #noter #noter-luk #noter-lukknap
                      noterne (logbogen) foldet ud fra toplinjen: knappen
                      og tasten N viser og skjuler #noter, Esc, krydset
                      #noter-luk og knappen #noter-lukknap lukker. Ryd
                      (skraldespanden) sletter foerst ved andet klik (F37)
     #noter-faner #fane-sket #fane-egne #noter-sket #noter-egne
                      noternes to faner (F56): »Uheld og replikker« er
                      den, noterne aabner med; »Mine noter« har
                      skrivefeltet. Skraldespanden ses kun i »Mine noter«

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
    /* F56: alle uheld, i den raekkefoelge de skete (i et rum-spil fra alle rum) */
    P.uheldListe = function () {
        if (!this.rum) return this.etBord.uheldListe || [];
        var ud = [];
        this.rum.rum.forEach(function (r) { ud = ud.concat(r.bord.uheldListe || []); });
        return ud;
    };

    /* ----- Aflaesningen af det valgte glas --------------------------------- */
    P.opdaterPanel = function () {
        /* Quizzen og tegneserien aabner af sig selv, naar deres krav er
           opfyldt */
        if (this.quiz) this.quiz.opdaterLaas();
        if (this.serie) this.serie.opdaterLaas();
        var b = this.bord();
        var c = b.valgtBeholder();
        var tabel = NK.el("glas-indhold");
        var fold = tabel && tabel.closest ? tabel.closest("details") : null;
        var boble = NK.el("boble-laerred");
        if (NK.el("uheld-taeller")) NK.saetTekst("uheld-taeller", String(this.uheld()));
        this.visUheld();
        if (boble) boble.hidden = !c;

        var linje = NK.el("tilskuere-linje");
        if (!c) {
            if (linje) linje.hidden = true;
            if (NK.el("rystknap")) NK.el("rystknap").hidden = true;
            if (NK.el("glas-titel")) NK.saetTekst("glas-titel", "Det valgte glas");
            if (NK.el("glas-volumen")) NK.saetTekst("glas-volumen", "");
            if (NK.el("glas-tom")) {
                NK.el("glas-tom").hidden = false;
                if (this.valg.tomTekst) NK.saetTekst("glas-tom", this.valg.tomTekst);
            }
            if (tabel) tabel.hidden = true;
            if (fold) fold.hidden = true;
            if (NK.el("glas-temp")) NK.el("glas-temp").hidden = true;
            if (NK.el("glas-forurenet")) NK.el("glas-forurenet").hidden = true;
            if (this.valg.panel) this.valg.panel(this);
            this.sidsteSignatur = this.signatur();
            return;
        }

        var o = B.samlet(c);
        if (NK.el("rystknap")) NK.el("rystknap").hidden = !(b.kanRystes && b.kanRystes(c));
        if (NK.el("glas-titel")) NK.saetTekst("glas-titel", stor(c.titel));
        if (NK.el("glas-volumen")) NK.saetTekst("glas-volumen", tal(B.volumen(c)) + " mL");

        /* Tabellen viser det, der er nok af til at ses (som boblen), med
           den stoerste koncentration foerst og fast stof til sidst. Er der
           mere end tre slags ioner, staar tilskuerionerne for sig nederst
           og kun, naar fluebenet er sat; med én til tre hoerer de med. */
        var ind = this.indhold(b, o), tilskuere = ind.tilskuere;
        var ogsaaLoeftede = b.tilskuereI ? b.tilskuereI(o, true) : tilskuere;
        if (linje) {
            linje.hidden = !ogsaaLoeftede.length;
            if (NK.el("tilskuere-navne")) this.tilskuerNavne(ogsaaLoeftede, b.loeftede || []);
            if (NK.el("tilskuere-vis")) NK.el("tilskuere-vis").checked = !!b.visTilskuere;
        }
        var raekker = ind.raekker, ekstra = ind.ekstra;

        var tom = NK.el("glas-tom");
        if (tom) {
            if (!raekker.length && tilskuere.length) { NK.saetTekst("glas-tom", "Kun tilskuerioner."); tom.hidden = false; }
            else if (!raekker.length && B.volumen(c) > 0.05) { NK.saetTekst("glas-tom", "Kun vand."); tom.hidden = false; }
            else if (!raekker.length) { NK.saetTekst("glas-tom", "Tomt."); tom.hidden = false; }
            else tom.hidden = true;
        }

        if (tabel) {
            tabel.innerHTML = "";
            var raekke = function (rk) {
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
            };
            raekker.forEach(raekke);
            if (ekstra.length) {
                var tr = document.createElement("tr");
                tr.className = "kategori";
                var th = document.createElement("th");
                th.colSpan = 3;
                th.textContent = "Tilskuerioner";
                tr.appendChild(th);
                tabel.appendChild(tr);
                ekstra.forEach(raekke);
            }
            tabel.hidden = !(raekker.length || ekstra.length);
            if (fold) fold.hidden = tabel.hidden;
        }

        var temp = NK.el("glas-temp");
        if (temp) {
            temp.hidden = B.volumen(c) < 0.05;
            var ph = St.pH(o);
            temp.textContent = "Temperatur: " + NK.Tegning.temperaturTekst(o.T) +
                (c.koger ? " (koger)" : "") + (ph === null ? "" : " · pH " + tal(ph, 1));
        }
        /* F55: et forurenet pulverglas siger det, og med hvad */
        var fu = NK.el("glas-forurenet"), fuTekst = b.forureningTekst ? b.forureningTekst(c) : null;
        if (fu) { fu.hidden = !fuTekst; fu.textContent = fuTekst || ""; }

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
            this.uheld(), c.koger ? 1 : 0, ph === null ? "" : Math.round(ph * 10), c.forurenet ? c.forurenet.length : 0];
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
        var linje = Array.isArray(tekst) ? tekst.join(" ") : tekst;
        if (NK.Vilkaar && NK.Vilkaar.udfyld) linje = NK.Vilkaar.udfyld(linje, b);
        this.noterReplik(linje, "");
        this.besked(linje, (valg && valg.slags) || "info");
    };

    /* ----- Replikkerne: et varigt sted (S13) --------------------------------
       Det, der siges i taleboblen, forsvinder igen, og intet, der betyder
       noget, maa kun findes dér. Har siden kortet #replik-kort, lander det,
       der bliver sagt, ogsaa i en liste, eleven kan laese igen: den seneste
       linje staar fremme, alle under »Alle«. Forloebets replikker kommer
       altid med; Kemichaels egne scener (uheld, advarsler) kun dem, forsoeget
       naevner i valg.historik; smaasnakken aldrig. Linjen noteres, naar den
       SIGES (kemichael.js kalder NK.vedReplik), saa listen staar i den
       raekkefoelge, eleven hoerte den. Start forfra rydder den. */
    P.bygReplikker = function () {
        var mig = this;
        if (!NK.el("replik-kort") && !NK.el("replik-liste")) return;
        this.replikker = [];
        var med = ["replik"].concat(this.valg.historik || []);
        NK.vedReplik = function (tekst, om) {
            if (med.indexOf(om && om.scene) < 0) return;
            mig.noterReplik(tekst, om.hvem);
        };
        this.visReplikker();
    };

    P.noterReplik = function (tekst, hvem) {
        if (!this.replikker || !tekst) return;
        this.replikker.push({ tekst: tekst, hvem: hvem || "" });
        if (this.replikker.length > 80) this.replikker.shift();
        this.visReplikker();
    };

    P.visReplikker = function () {
        var kort = NK.el("replik-kort");
        if (!this.replikker) return;
        var r = this.replikker;
        if (kort) kort.hidden = !r.length;
        if (NK.el("replik-ingen")) NK.el("replik-ingen").hidden = r.length > 0;
        if (NK.el("replik-antal")) NK.saetTekst("replik-antal", r.length ? String(r.length) : "");
        function linje(el, x) {
            el.textContent = "";
            if (x.hvem) {
                var b = document.createElement("b");
                b.textContent = x.hvem + ": ";
                el.appendChild(b);
            }
            el.appendChild(document.createTextNode(x.tekst));
        }
        var sidst = NK.el("replik-sidst");
        if (sidst) { if (r.length) linje(sidst, r[r.length - 1]); else sidst.textContent = ""; }
        var fold = NK.el("replik-fold"), liste = NK.el("replik-liste");
        if (fold) fold.hidden = r.length < 2;
        if (liste) {
            liste.textContent = "";
            r.forEach(function (x) {
                var li = document.createElement("li");
                linje(li, x);
                liste.appendChild(li);
            });
            liste.scrollTop = liste.scrollHeight;
        }
    };

    /* ----- Uheldene under noterne (F56) ------------------------------------
       Én linje pr. uheld (»Uheld 1: Glas 3 væltede, og indholdet løb
       ud«) og taelleren i noternes hjoerne. Listen bygges kun om, naar der
       er kommet et uheld til eller forsvundet nogen (Start forfra). */
    P.visUheld = function () {
        var liste = NK.el("uheld-liste"), maerke = NK.el("noter-uheld");
        if (!liste && !maerke) return;
        var u = this.uheldListe();
        if (maerke) {
            NK.saetTekst("noter-uheld", "Uheld: " + u.length);
            maerke.classList.toggle("nogen", u.length > 0);
        }
        if (!liste || liste.dataset.antal === String(u.length)) return;
        liste.dataset.antal = String(u.length);
        liste.textContent = "";
        u.forEach(function (x, i) {
            var li = document.createElement("li"), b = document.createElement("b");
            b.textContent = "Uheld " + (i + 1) + ": ";
            li.appendChild(b);
            li.appendChild(document.createTextNode(x.kort));
            liste.appendChild(li);
        });
        liste.scrollTop = liste.scrollHeight;
        if (NK.el("uheld-ingen")) NK.el("uheld-ingen").hidden = u.length > 0;
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

    /* Teoriboksen: forsoegets teori i et overlay, saa panelet kun har det,
       man bruger undervejs. Teksten staar i tekst.js som blokke. */
    P.aabnTeori = function () {
        if (!NK.el("teori")) return;
        NK.Rundvisning.luk();
        this.lukOverlay();
        NK.el("teori").classList.add("vis");
        if (NK.el("teori-luk")) NK.el("teori-luk").focus({ preventScroll: true });
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
        if (this.quiz) this.quiz.nulstil();
        if (this.serie) this.serie.nulstil();
        if (this.replikker) { this.replikker = []; this.visReplikker(); }
        if (this.visRum) this.visRum();
        this.opdaterForloeb();
        this.opdaterPanel();
    };

    /* Tilskuerionerne i linjen under tabellen er knapper: et klik loefter
       en ion op i tabellen og boblen, et klik mere saetter den ned (F27).
       Knapper inde i en label saetter ikke fluebenet. Linjen bygges kun
       om, naar den har aendret sig, saa et klik ikke rammer en knap, der
       lige er skiftet ud. */
    P.tilskuerNavne = function (navne, loeftede) {
        var el = NK.el("tilskuere-navne");
        var noegle = navne.join(",") + "|" + loeftede.join(",");
        if (el.dataset.noegle === noegle) return;
        el.dataset.noegle = noegle;
        el.textContent = "";
        el.appendChild(document.createTextNode("("));
        navne.forEach(function (n, i) {
            if (i) el.appendChild(document.createTextNode(", "));
            var op = loeftede.indexOf(n) >= 0;
            var k = document.createElement("button");
            k.type = "button";
            k.className = "tilskuer-ion" + (op ? " loeftet" : "");
            k.dataset.ion = n;
            k.textContent = (op ? "↑ " : "") + St.formel(n);
            k.title = op ? "Sæt " + St.formel(n) + " ned blandt tilskuerne igen" : "Løft " + St.formel(n) + " op i tabellen og boblen";
            el.appendChild(k);
        });
        el.appendChild(document.createTextNode(")"));
    };

    /* ----- Logbogen, hvis siden har en ------------------------------------- */
    /* Indholdet, som tabellen og noterne viser det: kun det, der er nok af
       til at ses (som boblen), den stoerste koncentration foerst og fast
       stof til sidst; tilskuerionerne for sig (ekstra), naar fluebenet er
       sat, og ellers slet ikke. */
    P.indhold = function (b, o) {
        var tilskuere = b.tilskuereI ? b.tilskuereI(o) : [];
        function raekkerAf(navne) {
            var opl = [], fast = [];
            navne.forEach(function (navn) {
                var s = St.stof(navn);
                /* Fast stof taeller i stofmaengde og ikke i koncentration:
                   et tungtoploeseligt salt har ingen koncentration, der
                   siger noget - det ligger der. Et fnug staar i µmol, saa
                   der aldrig kommer til at staa "0,00 mmol" om noget, der
                   er der. */
                if (s.fase === "s") {
                    var n = o.n[navn];
                    fast.push({ navn: navn, formel: St.formel(navn, true), tal: n, fast: true,
                                vaerdi: n < 10 ? tal(n, 1) : tal(n / 1000, 2),
                                enhed: n < 10 ? "µmol" : "mmol" });
                }
                else if (s.fase === "aq") opl.push({ navn: navn, formel: St.formel(navn, true), tal: St.konc(o, navn), vaerdi: tal(St.konc(o, navn), o.V > 0 && St.konc(o, navn) < 1 ? 2 : 1), enhed: "mM" });
            });
            function stoerst(a, b2) { return b2.tal - a.tal; }
            return opl.sort(stoerst).concat(fast.sort(stoerst));
        }
        var synlige = Object.keys(o.n).filter(function (navn) { return St.synlig(o, navn); });
        return {
            tilskuere: tilskuere,
            raekker: raekkerAf(synlige.filter(function (n) { return tilskuere.indexOf(n) < 0; })),
            ekstra: b.visTilskuere ? raekkerAf(tilskuere) : []
        };
    };

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
        /* Det samme som tabellen, i samme orden */
        var ind = this.indhold(b, o);
        var stoffer = ind.raekker.concat(ind.ekstra).map(function (rk) {
            return (rk.fast ? rk.formel : St.formel(rk.navn)) + " " + rk.vaerdi + " " + rk.enhed;
        });
        if (stoffer.length) dele.push(stoffer.join(", "));
        var v = b.g && b.g.vaegt;
        if (v && b.masseePaa && b.masseePaa(v) > 0 && c.paa === v) dele.push("vægt " + b.vaegtTekst(v));
        var fu = b.forureningTekst ? b.forureningTekst(c) : null;
        if (fu) dele.push(fu.replace(/^Forurenet/, "forurenet").replace(/\.$/, ""));
        return dele.join("; ");
    };

    /* Noterne foldes ud fra toplinjen og ind igen (vis: true/false, eller
       intet for at skifte) */
    P.skiftNoter = function (vis) {
        var el = NK.el("noter"), kn = NK.el("noterknap");
        if (!el) return false;
        if (vis === undefined) vis = el.hidden;
        var aabnes = vis && el.hidden;
        el.hidden = !vis;
        if (kn) {
            kn.setAttribute("aria-expanded", vis ? "true" : "false");
            kn.classList.toggle("aktiv", !!vis);
        }
        var felt = NK.el("logbog-tekst");
        /* F56: med faner aabner noterne altid paa »Uheld og replikker« */
        if (aabnes && NK.el("noter-faner")) {
            this.vaelgFane("sket");
            if (NK.el("fane-sket")) NK.el("fane-sket").focus();
        } else if (vis && felt && !NK.el("noter-faner")) felt.focus();
        if (!vis && felt && document.activeElement === felt) felt.blur();
        if (!vis && document.activeElement && el.contains(document.activeElement)) document.activeElement.blur();
        return true;
    };

    /* F56: fanen "sket" (uheld og replikker) eller "egne" (mine noter) */
    P.vaelgFane = function (navn) {
        ["sket", "egne"].forEach(function (n) {
            var k = NK.el("fane-" + n), p = NK.el("noter-" + n);
            if (k) k.setAttribute("aria-selected", n === navn ? "true" : "false");
            if (k) k.tabIndex = n === navn ? 0 : -1;
            if (p) p.hidden = n !== navn;
        });
        if (NK.el("logbog-ryd")) NK.el("logbog-ryd").hidden = navn !== "egne";
        if (navn === "sket") { this.visUheld(); this.visReplikker(); }
        this.fane = navn;
    };

    P.logbogGem = function () {
        var el = NK.el("logbog-tekst");
        if (el) gemt("nk-" + this.navn + "-logbog", el.value);
    };

    P.logbogNoter = function () {
        var linje = this.aflaesning();
        if (!linje) { this.besked("Klik på et glas først.", "advarsel"); return; }
        var el = NK.el("logbog-tekst");
        if (NK.el("noter-faner")) this.vaelgFane("egne");
        var nu = new Date();
        var klokken = (nu.getHours() < 10 ? "0" : "") + nu.getHours() + ":" + (nu.getMinutes() < 10 ? "0" : "") + nu.getMinutes();
        el.value = (el.value ? el.value.replace(/\s+$/, "") + "\n" : "") + klokken + " " + linje;
        el.scrollTop = el.scrollHeight;
        this.logbogGem();
        /* I de udfoldede noter skriver man videre efter aflaesningen, saa
           markoeren staar dér, og tasterne gaar ikke til bordet */
        if (NK.el("noter") && !NK.el("noter").hidden) {
            el.focus();
            el.selectionStart = el.selectionEnd = el.value.length;
        }
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
            /* F49: et forsoeg i flere dele kan folde de dele, eleven ikke
               staar i, sammen til én linje (valg.forloebDele: { titler:
               { 1: "...", 2: "..." }, nu: function () -> delens nummer }).
               Uden det staar alle trin i listen som foer. */
            var fd = this.valg.forloebDele, nuDel = fd && fd.nu ? fd.nu() : null, vist = {};
            f.trin.forEach(function (x) {
                var li = document.createElement("li");
                if (fd && x.del && x.del !== nuDel) {
                    if (vist[x.del]) return;
                    vist[x.del] = true;
                    var dens = f.trin.filter(function (y) { return y.del === x.del; });
                    var gjorte = dens.filter(function (y) { return f.erGjort(y.id); }).length;
                    li.textContent = (fd.titler && fd.titler[x.del] || ("Del " + x.del)) + " (" + gjorte + "/" + dens.length + ")";
                    li.className = "gruppe" + (gjorte === dens.length ? " gjort" : "");
                    liste.appendChild(li);
                    return;
                }
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
            if (Array.isArray(t) && el.classList.contains("tekstblokke")) {
                fyldBlokke(el, t);
            } else if (Array.isArray(t)) {
                if (t.length && typeof t[0] !== "string") return;   /* fx rundvisningens stop */
                el.innerHTML = "";
                t.forEach(function (linje) {
                    var li = document.createElement("li");
                    li.innerHTML = linje;
                    el.appendChild(li);
                });
            } else if (t && typeof t === "object") {
                /* Et opslag under en noegle er data og ikke tekst - quizzens
                   spoergsmaal, tegneseriens ord. Det maa aldrig havne i et
                   element, bare fordi der tilfaeldigvis findes et med samme
                   id (saa stod der "[object Object]" i overlayet). */
                return;
            } else if (el.tagName === "TITLE") {
                document.title = t;
            } else {
                el.innerHTML = t;
            }
        });
    };

    /* Et element med klassen tekstblokke faar en liste af blokke: en streng
       er et afsnit, { overskrift } en mellemrubrik og { ligning, lille } en
       ligning i sin egen ramme. Saadan skrives teorien i tekst.js. */
    function fyldBlokke(el, blokke) {
        el.innerHTML = "";
        blokke.forEach(function (b) {
            var ny;
            if (typeof b === "string") {
                ny = document.createElement("p");
                ny.innerHTML = b;
            } else if (b.overskrift) {
                ny = document.createElement("h3");
                ny.innerHTML = b.overskrift;
            } else if (b.ligning) {
                ny = document.createElement("div");
                ny.className = "ligning" + (b.lille ? " lille" : "");
                ny.innerHTML = b.ligning;
            }
            if (ny) el.appendChild(ny);
        });
    }

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
        if (e.key === "Escape") {
            var b = this.bord();
            this.skiftNoter(false);
            if (b) { b.klar = null; b.genvejMaal = null; }
            if (b && b.lukStorBoble) b.lukStorBoble();
            this.lukOverlay();
            NK.Rundvisning.luk();
            return;
        }
        if (e.key === "?" || e.key === "h" || e.key === "H") {
            if (NK.Rundvisning.aktiv()) NK.Rundvisning.luk();
            else { this.lukOverlay(); NK.Rundvisning.start(); }
            return;
        }
        if ((e.key === "t" || e.key === "T") && NK.el("teori")) {
            if (NK.el("teori").classList.contains("vis")) this.lukOverlay();
            else if (!NK.Rundvisning.aktiv() && !document.querySelector(".overlay.vis")) this.aabnTeori();
            return;
        }
        if ((e.key === "g" || e.key === "G") && this.serie) {
            if (this.serie.aaben()) this.lukOverlay();
            else if (!NK.Rundvisning.aktiv() && !document.querySelector(".overlay.vis")) this.serie.aabn();
            return;
        }
        if (NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis")) return;
        if (e.key === "m" || e.key === "M") { this.skiftLyd(); return; }
        if ((e.key === "n" || e.key === "N") && NK.el("noter")) { this.skiftNoter(); e.preventDefault(); return; }
        if ((e.key === "i" || e.key === "I") && this.forloeb) { this.visHint(); return; }
        /* Hold R: ryst det valgte glas (S16). Slippes paa keyup. */
        if ((e.key === "r" || e.key === "R") && NK.el("rystknap")) {
            var br = this.bord();
            if (!e.repeat && br && br.rystValgt) br.rystValgt(true);
            e.preventDefault();
            return;
        }
        if (this.valg.tast && this.valg.tast.call(this, e)) { e.preventDefault(); return; }
        if (this.rum && this.rum.tast(e)) e.preventDefault();
    };

    /* ----- Tegneloekken ------------------------------------------------------
       Naeste ramme bestilles FOERST. Ellers ville én undtagelse et
       vilkaarligt sted i en ramme staa tilbage som en doed side: DOM'en
       svarer stadig, saa knapperne kan klikkes og gør, hvad de skal, men
       intet bliver tegnet igen, og saa ser hele forsoeget laast ud - ogsaa
       Start forfra. En daarlig ramme skal koste én ramme, ikke resten af
       timen. Fejlen skrives i konsollen den foerste gang, saa den stadig
       kan findes. */
    P.loekke = function (ts) {
        var mig = this;
        window.requestAnimationFrame(function (t) { mig.loekke(t); });
        try {
            this.ramme(ts);
        } catch (fejl) {
            if (!this.rammeFejl) {
                this.rammeFejl = fejl;
                if (window.console) window.console.error("laboratoriet: fejl i en tegneramme", fejl);
            }
            /* Tegn videre fra en kendt transform, saa den naeste ramme ikke
               arver en ubalanceret gemmestak */
            try { this.verden().laerred.nulstil(); } catch (ignore) { /* saa var den vaek */ }
        }
    };

    P.ramme = function (ts) {
        var dt = (ts - this.sidsteTid) / 1000;
        this.sidsteTid = ts;
        if (!isFinite(dt) || dt < 0) dt = 0;
        if (dt > 0.1) dt = 0.1;

        var v = this.verden();
        v.tilpas();
        v.opdater(dt);
        v.tegn();
        this.tegnBoble();
        this.opdaterFyldOp();

        /* Forloebet proeves ogsaa af sig selv, ikke kun naar eleven roerer
           noget: et glas, der staar og bliver varmt i et bad, aendrer
           tilstand uden at nogen har gjort noget. Fire gange i sekundet er
           rigeligt og koster nogle faa opslag. */
        if (this.forloeb) {
            this.forloebsUr = (this.forloebsUr || 0) + dt;
            if (this.forloebsUr > 0.25) { this.forloebsUr = 0; this.forloeb.opdater(); }
        }

        if (this.signatur() !== this.sidsteSignatur) this.opdaterPanel();
    };

    /* ----- »Fyld op til« (F29, F42, F61-F63) ----------------------------------
       Haenger sproejteflasken - eller en anden flaske, kolben eller et glas
       - over glasudstyr, man maaler rumfang i (bord.kanFyldeOp), staar der
       et lille felt ved pilen: »Fyld op til [ ] mL [Fyld]«, og glasset
       fyldes op til det i én haeldning (bord.fyldOpTil). Feltet har paa
       forhaand en vaerdi, der giver mening: det, der staar i glasset, plus
       det, pilen giver (bord.pilMl) - er der 5 mL, og giver pilen 5, staar
       der 10 (F61). Vaerdien skifter, naar glasset eller rumfanget gør, men
       ikke mens eleven skriver i feltet. Forslagsknapperne (F39, »dobbelt«)
       er fjernet igen (F63). Feltet laves her, saa alle forsoeg faar det
       uden egen markup. */
    P.fyldOpForslag = function (b, sv) {
        var c = sv.svaev.maal.kan.hane ? sv : sv.svaev.maal;
        var V = B.volumen(c), p = b.pilMl ? b.pilMl(sv) : null;
        if (!(p > 0)) p = 5;
        var loft = (c.type.nominel || c.type.maks) - 0.1;
        var mL = Math.round(V + p);
        if (mL > loft) mL = Math.floor(loft);
        return mL > V + 0.05 ? mL : null;
    };

    P.bygFyldOp = function () {
        var lr = NK.el("scene-laerred"), scene = lr && lr.parentNode, mig = this;
        if (!scene || this.fyldOp) return;
        var f = document.createElement("form");
        f.className = "fyldop";
        f.id = "fyldop";
        f.hidden = true;
        f.setAttribute("aria-label", "Fyld op til");
        f.innerHTML = '<label>Fyld op til <input id="fyldop-ml" type="text" inputmode="decimal" size="4" autocomplete="off"> mL</label>' +
            '<button class="knap" type="submit">Fyld</button>';
        scene.appendChild(f);
        f.addEventListener("submit", function (e) {
            e.preventDefault();
            var b = mig.bord(), sv = b && b.svaevende(), inp = NK.el("fyldop-ml");
            var v = parseFloat(String(inp.value).replace(",", "."));
            if (!sv || !sv.svaev || !(v > 0)) { inp.focus(); return; }
            b.fyldOpTil(sv, sv.svaev.maal, v);
            inp.dataset.noegle = "";
            inp.blur();
        });
        this.fyldOp = f;
    };

    P.opdaterFyldOp = function () {
        var f = this.fyldOp;
        if (!f) return;
        var b = this.bord(), sv = b && b.svaevende(), ring = sv && b.svaevRing();
        var vis = !!(ring && sv.svaev && sv.svaev.maal && b.kanFyldeOp && b.kanFyldeOp(sv, sv.svaev.maal) && !b.koer.optaget());
        if (!vis) {
            if (!f.hidden) {
                f.hidden = true;
                if (document.activeElement && f.contains(document.activeElement)) document.activeElement.blur();
            }
            return;
        }
        var sk = NK.Scene.skala(b.laerred.b, b.laerred.h);
        var cr = b.canvas.getBoundingClientRect(), pr = f.parentNode.getBoundingClientRect();
        var x = Math.round(Math.min(cr.left - pr.left + sk.dx + (ring.x + ring.r + 10) * sk.s, pr.width - 200));
        var y = Math.round(cr.top - pr.top + sk.dy + ring.y * sk.s - 16);
        if (f.dataset.sted !== x + "," + y) {
            f.style.left = x + "px";
            f.style.top = y + "px";
            f.dataset.sted = x + "," + y;
        }
        f.hidden = false;
        /* Vaerdien i feltet (F61). Under hanen er det glasset selv, der
           fyldes (F53). */
        var inp = NK.el("fyldop-ml"), c = sv.svaev.maal.kan.hane ? sv : sv.svaev.maal;
        if (!inp || document.activeElement === inp) return;
        var noegle = sv.navn + ">" + c.navn + ":" + B.volumen(c).toFixed(2);
        if (inp.dataset.noegle === noegle) return;
        inp.dataset.noegle = noegle;
        var mL = this.fyldOpForslag(b, sv);
        inp.value = mL === null ? "" : String(mL);
        inp.placeholder = String(Math.round(B.volumen(c)));
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
        this.bygFyldOp();
        this.bygReplikker();

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

        /* Quizzen, hvis siden har kortet og forsoeget har spoergsmaal
           (laboratoriet/js/quiz.js). Spoergsmaalene staar i forsoegets
           tekst.js under "quiz"; kravet for at laase op i sidens valg. */
        if (NK.el("quiz-kort") && NK.Quiz) {
            var qIndhold = (valg.tekster && valg.tekster.quiz) || valg.quizIndhold;
            if (qIndhold && qIndhold.spoergsmaal && qIndhold.spoergsmaal.length) {
                this.quiz = NK.Quiz.lav({ indhold: qIndhold, krav: valg.quiz && valg.quiz.krav }, this);
                NK.quiz = this.quiz;
            }
        }

        /* Tegneserien, hvis siden har ruderne og forsoeget en liste
           (laboratoriet/js/tegneserie.js). Ruderne bygges af forsoeget ved
           hver aabning; kravet for at laase op staar i sidens valg. */
        if (NK.el("serie-ruder") && NK.Tegneserie && valg.ruder) {
            this.serie = NK.Tegneserie.lav({
                indhold: (valg.tekster && valg.tekster.serie) || valg.serieIndhold,
                krav: valg.serie && valg.serie.krav,
                ruder: valg.ruder
            }, this);
            NK.serie = this.serie;
        }

        if (NK.el("boble-laerred")) this.bobleL = new NK.Laerred(NK.el("boble-laerred"));

        /* Saa siden kan pilles ved fra konsollen og fra selvtesten */
        NK.Side.nu = this;
        NK.bord = this.etBord || null;
        NK.rum = this.rum || null;
        NK.opdaterPanel = function () { mig.opdaterPanel(); };
        NK.startForfra = function () { mig.startForfra(); };
        NK.intro = { aabn: function () { mig.aabnIntro(); }, luk: function () { mig.lukOverlay(); } };
        NK.teori = { aabn: function () { mig.aabnTeori(); }, luk: function () { mig.lukOverlay(); } };

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
        paa("teoriknap", "click", function () { mig.aabnTeori(); });
        paa("teori-aabn", "click", function () { mig.aabnTeori(); });
        paa("teori-luk", "click", function () { mig.lukOverlay(); });
        paa("tilskuere-vis", "change", function () {
            var b = mig.bord();
            b.visTilskuere = !!this.checked;
            mig.opdaterPanel();
        });
        /* Ryst glasset: hold knappen eller tasten R nede. Et klik fra
           tastaturet (Enter/mellemrum paa knappen) ryster et sekund. */
        (function () {
            var rk = NK.el("rystknap");
            if (!rk) return;
            function stop() { var b = mig.bord(); if (b && b.rystValgt) b.rystValgt(false); }
            rk.addEventListener("pointerdown", function (e) {
                var b = mig.bord();
                if (b && b.rystValgt && b.rystValgt(true)) { try { rk.setPointerCapture(e.pointerId); } catch (fejl) { /* intet */ } }
            });
            ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (t) { rk.addEventListener(t, stop); });
            rk.addEventListener("click", function (e) {
                var b = mig.bord();
                if (e.detail === 0 && b && b.rystValgt) b.rystValgt(true, 1);
            });
            document.addEventListener("keyup", function (e) { if (e.key === "r" || e.key === "R") stop(); });
            window.addEventListener("blur", stop);
        }());
        paa("tilskuere-navne", "click", function (e) {
            var k = e.target && e.target.closest ? e.target.closest("button[data-ion]") : null;
            if (!k) return;
            e.preventDefault();
            var b = mig.bord();
            if (b.loeft) b.loeft(k.dataset.ion);
            mig.opdaterPanel();
        });
        paa("teori", "click", function (e) { if (e.target === this) mig.lukOverlay(); });

        if (NK.el("logbog-tekst")) {
            NK.el("logbog-tekst").value = gemt("nk-" + this.navn + "-logbog") || "";
            paa("logbog-tekst", "input", function () { mig.logbogGem(); });
            paa("logbog-noter", "click", function () { mig.logbogNoter(); });
            /* Skraldespanden sidder lige ved krydset (F37), saa den sletter
               foerst ved andet klik inden for tre sekunder */
            paa("logbog-ryd", "click", function () {
                var k = this, felt = NK.el("logbog-tekst");
                if (!felt.value) return;
                if (!k.classList.contains("bekraeft")) {
                    k.classList.add("bekraeft");
                    k.title = "Klik igen for at slette noterne";
                    mig.besked("Klik på skraldespanden igen for at slette noterne.", "advarsel");
                    window.clearTimeout(mig.rydUr);
                    mig.rydUr = window.setTimeout(function () { k.classList.remove("bekraeft"); k.title = "Slet noterne"; }, 3000);
                    return;
                }
                window.clearTimeout(mig.rydUr);
                k.classList.remove("bekraeft");
                k.title = "Slet noterne";
                felt.value = "";
                mig.logbogGem();
            });
            NK.logbog = { noter: function () { mig.logbogNoter(); }, aflaesning: function () { return mig.aflaesning(); } };
        }
        paa("noterknap", "click", function () { mig.skiftNoter(); });
        if (NK.el("noter-faner")) {
            this.vaelgFane("sket");
            paa("fane-sket", "click", function () { mig.vaelgFane("sket"); });
            paa("fane-egne", "click", function () {
                mig.vaelgFane("egne");
                if (NK.el("logbog-tekst")) NK.el("logbog-tekst").focus();
            });
            /* Pilene skifter fane, som i enhver faneliste */
            paa("noter-faner", "keydown", function (e) {
                if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
                var til = mig.fane === "sket" ? "egne" : "sket";
                mig.vaelgFane(til);
                NK.el("fane-" + til).focus();
                e.preventDefault();
            });
        }
        paa("noter-luk", "click", function () { mig.skiftNoter(false); });
        paa("noter-lukknap", "click", function () { mig.skiftNoter(false); });
        /* Esc i skrivefeltet lukker ogsaa (tastaturet ser ikke tekstfelter) */
        paa("noter", "keydown", function (e) {
            if (e.key !== "Escape") return;
            mig.skiftNoter(false);
            if (NK.el("noterknap")) NK.el("noterknap").focus();
        });

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
