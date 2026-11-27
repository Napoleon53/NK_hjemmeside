/* =====================================================================
   app.js - Bundfald: startkortet, svarfeltet, panelet og loekken

   Fagordene kommer tre steder fra:
   - Kemibogens fagordslister: index.html#kort=<saet> (samme tekst som Kort
     og godt), som bogens flise Bundfald laver ud fra de valgte fagord.
   - Bogens lister i js/fagord.js (C og B), hvor eleven selv vaelger kapitler,
     afsnit og enkelte fagord. #b aabner Kemi B, #c4 og #b4 vaelger et kapitel,
     #tema-klima et tema.
   - Egne fagord, skrevet eller sat ind som tekst (Quizlets format).
   Valget, tempoet, ordbanken, lyden og rekorderne huskes i browseren.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var O = NK.Ord, D = NK.Spil.D;
    var BOEGER = NK.FAGORD.boeger;
    var LAGER = "nk-bundfald";

    function $(id) { return document.getElementById(id); }
    function el(tag, klasse, tekst) {
        var e = document.createElement(tag);
        if (klasse) e.className = klasse;
        if (tekst !== undefined && tekst !== null) e.textContent = tekst;
        return e;
    }
    function tal(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
    function remse(dele) {
        if (dele.length < 2) return dele.join("");
        return dele.slice(0, -1).join(", ") + " og " + dele[dele.length - 1];
    }

    /* ----- Det, browseren husker -------------------------------------- */
    var gemt = {};
    try { gemt = JSON.parse(window.localStorage.getItem(LAGER) || "{}") || {}; } catch (e) { gemt = {}; }
    function gem() {
        try { window.localStorage.setItem(LAGER, JSON.stringify(gemt)); } catch (e) { /* privat vindue */ }
    }

    /* ----- Bogens fagord ------------------------------------------------ */
    function bog(id) { return BOEGER.filter(function (b) { return b.id === id; })[0]; }
    function kapitelNavn(k) { return k.nr ? "Kapitel " + k.nr + ": " + k.navn : k.navn; }
    function noegle(k, o) { return k.id + "/" + o[0]; }

    var langeTekster = {};
    BOEGER.forEach(function (b) {
        b.kapitler.forEach(function (k) {
            k.afsnit.forEach(function (a) {
                a.ord.forEach(function (o) { if (o[2]) langeTekster[O.norm(o[0]) + "|" + o[1]] = o[2]; });
            });
        });
    });

    var V = {
        fane: gemt.fane === "b" || gemt.fane === "egne" ? gemt.fane : "c",
        valgt: { c: {}, b: {} },
        egne: typeof gemt.egne === "string" ? gemt.egne : "",
        tempo: D.FALDTID[gemt.tempo] ? gemt.tempo : "roligt",
        ordbank: !!gemt.ordbank,
        link: null,
        detaljer: false,
        sidste: null          // { ord, navn } for Spil igen
    };
    ["c", "b"].forEach(function (b) {
        (gemt.valgt && gemt.valgt[b] || []).forEach(function (n) { V.valgt[b][n] = true; });
    });

    function gemValg() {
        gemt.fane = V.fane === "link" ? gemt.fane : V.fane;
        gemt.valgt = { c: Object.keys(V.valgt.c), b: Object.keys(V.valgt.b) };
        gemt.egne = V.egne;
        gemt.tempo = V.tempo;
        gemt.ordbank = V.ordbank;
        gem();
    }

    function laesHash() {
        var h = (location.hash || "").replace(/^#/, "");
        if (!h) return;
        var valgtKapitel = null;
        h.split("&").forEach(function (d) {
            var m;
            if ((m = /^(kort|ord)=(.+)$/.exec(d))) {
                var tekst = O.fraLink(m[2]);
                var s = tekst ? O.fraTekst(tekst) : null;
                if (s && s.ord.length >= O.MINDST) {
                    V.link = {
                        navn: s.navn || "Fagord fra et link",
                        ord: s.ord.map(function (o) {
                            return { ord: o.ord, tekst: o.tekst, lang: langeTekster[O.norm(o.ord) + "|" + o.tekst] };
                        }),
                        fejl: s.fejl
                    };
                    V.fane = "link";
                }
            } else if (d === "b" || d === "c") {
                V.fane = d;
            } else if ((m = /^(c|b)(\d+)$/.exec(d))) {
                valgtKapitel = m[1] === "c" ? "c-kapitel-" + m[2] : "b-kapitel-b" + m[2];
            } else if (/^tema-[a-z-]+$/.test(d)) {
                valgtKapitel = "c-" + d;
            } else if ((m = /^tempo=(\w+)$/.exec(d)) && D.FALDTID[m[1]]) {
                V.tempo = m[1];
            }
        });
        if (valgtKapitel && !V.link) {
            var b = valgtKapitel.charAt(0);
            var k = bog(b).kapitler.filter(function (x) { return x.id === valgtKapitel; })[0];
            if (k) {
                V.fane = b;
                V.valgt[b] = {};
                k.afsnit.forEach(function (a) { a.ord.forEach(function (o) { V.valgt[b][noegle(k, o)] = true; }); });
            }
        }
    }

    /* De fagord, der er valgt i den aabne fane. */
    function valgteOrd() {
        if (V.fane === "link") return V.link ? V.link.ord : [];
        if (V.fane === "egne") return O.fraTekst(V.egne).ord;
        var b = bog(V.fane), ud = [], set = {};
        b.kapitler.forEach(function (k) {
            k.afsnit.forEach(function (a) {
                a.ord.forEach(function (o) {
                    var n = O.norm(o[0]);
                    if (!V.valgt[b.id][noegle(k, o)] || set[n]) return;
                    set[n] = true;
                    ud.push({ ord: o[0], tekst: o[1], lang: o[2] });
                });
            });
        });
        return ud;
    }

    function valgNavn() {
        if (V.fane === "link") return V.link.navn;
        if (V.fane === "egne") return O.fraTekst(V.egne).navn || "Egne fagord";
        var b = bog(V.fane);
        var med = b.kapitler.filter(function (k) {
            return k.afsnit.some(function (a) { return a.ord.some(function (o) { return V.valgt[b.id][noegle(k, o)]; }); });
        });
        if (!med.length) return b.navn;
        var hele = med.every(function (k) {
            return k.afsnit.every(function (a) { return a.ord.every(function (o) { return V.valgt[b.id][noegle(k, o)]; }); });
        });
        var navne = med.map(function (k) { return k.nr ? "kapitel " + k.nr : k.navn; });
        var tekst = b.navn + ": " + (med.length > 3 ? med.length + " kapitler" : remse(navne));
        return tekst + (hele ? "" : " (udvalgte)");
    }

    function rekordNoegle(ord) {
        var t = ord.map(function (o) { return O.norm(o.ord); }).sort().join("|");
        return O.aftryk(t) + "|" + V.tempo + "|" + (V.ordbank ? "bank" : "skriv");
    }
    function rekord(ord) { return (gemt.rekorder || {})[rekordNoegle(ord)] || 0; }

    /* ----- Elementerne ------------------------------------------------- */
    var mk = $("midterkort"), svarfelt = $("svarfelt"), besked = $("svarbesked");
    var scene = new NK.Scene({ scene: $("scene"), glas: $("glas"), bag: $("bag"), "for": $("for"), kortlag: $("kortlag") });
    var spil = null, saet = null;
    NK.app = { V: V, scene: scene, spil: function () { return spil; } };

    /* ----- Startkortet --------------------------------------------------- */
    function knap(tekst, klasse, handling, data) {
        var k = el("button", klasse, tekst);
        k.type = "button";
        if (handling) k.setAttribute("data-handling", handling);
        if (data !== undefined) k.setAttribute("data-v", data);
        return k;
    }

    function visStart() {
        var rul = mk.classList.contains("start") ? mk.scrollTop : 0;
        if (V.fane === "link" && !V.link) V.fane = "c";
        mk.innerHTML = "";
        mk.className = "midterkort start";
        mk.hidden = false;
        mk.appendChild(el("h2", "mk-titel", "Bundfald"));
        mk.appendChild(el("p", "mk-intro",
            "Forklaringer på fagord synker ned gennem bægerglasset. Skriv fagordet, før forklaringen når bunden, så opløses den."));

        var trin1 = el("section", "mk-trin");
        trin1.id = "mk-trin1";
        var ord = valgteOrd();
        var hoved = el("div", "mk-trinhoved");
        hoved.appendChild(el("span", "mk-trinnr" + (ord.length >= O.MINDST ? " ok" : ""), ord.length >= O.MINDST ? "✓" : "1"));
        hoved.appendChild(el("span", "mk-trintitel", "Vælg fagord"));
        hoved.appendChild(el("span", "mk-antal", ord.length ? ord.length + " fagord" : "Ingen valgt endnu"));
        trin1.appendChild(hoved);

        var faner = el("div", "segment");
        if (V.link) faner.appendChild(knap("Fra linket", "seg" + (V.fane === "link" ? " valgt" : ""), "fane", "link"));
        faner.appendChild(knap("Kemi C", "seg" + (V.fane === "c" ? " valgt" : ""), "fane", "c"));
        faner.appendChild(knap("Kemi B", "seg" + (V.fane === "b" ? " valgt" : ""), "fane", "b"));
        faner.appendChild(knap("Egne fagord", "seg" + (V.fane === "egne" ? " valgt" : ""), "fane", "egne"));
        trin1.appendChild(faner);

        if (V.fane === "link") trin1.appendChild(linkDel());
        else if (V.fane === "egne") trin1.appendChild(egneDel());
        else trin1.appendChild(bogDel(bog(V.fane)));
        mk.appendChild(trin1);

        var trin2 = el("section", "mk-trin");
        var h2 = el("div", "mk-trinhoved");
        h2.appendChild(el("span", "mk-trinnr ok", "2"));
        h2.appendChild(el("span", "mk-trintitel", "Vælg tempo"));
        trin2.appendChild(h2);
        var tempo = el("div", "segment");
        [["roligt", "Roligt"], ["normalt", "Normalt"], ["hurtigt", "Hurtigt"]].forEach(function (t) {
            tempo.appendChild(knap(t[1], "seg" + (V.tempo === t[0] ? " valgt" : ""), "tempo", t[0]));
        });
        trin2.appendChild(tempo);
        var bank = el("label", "mk-flueben");
        var bankFelt = el("input");
        bankFelt.type = "checkbox";
        bankFelt.checked = V.ordbank;
        bankFelt.id = "ordbankvalg";
        bank.appendChild(bankFelt);
        bank.appendChild(el("span", null, "Ordbank: fagordene står som knapper under glasset (lettere)"));
        trin2.appendChild(bank);
        mk.appendChild(trin2);

        var handling = el("div", "mk-handling");
        var start = knap("Start spil", "knap stor blaa" + (ord.length >= O.MINDST ? "" : " mat"), "start");
        start.id = "mk-start";
        handling.appendChild(start);
        var r = ord.length >= O.MINDST ? rekord(ord) : 0;
        handling.appendChild(el("p", "mk-note", ord.length >= O.MINDST ?
            (r ? "Din rekord med de fagord og det tempo: " + tal(r) + " point." : "") :
            "Vælg mindst " + O.MINDST + " fagord for at starte."));
        if (spil && (spil.status === "pause" || spil.status === "bund")) {
            handling.appendChild(knap("Tilbage til spillet", "tekstknap", "tilbage"));
        }
        mk.appendChild(handling);
        mk.scrollTop = rul;
        opdaterTop();
    }

    function linkDel() {
        var d = el("div", "mk-del");
        var boks = el("div", "mk-linkboks");
        boks.appendChild(el("p", "mk-linknavn", V.link.navn));
        boks.appendChild(el("p", "mk-linktekst", V.link.ord.length + " fagord fra linket. Vælg Kemi C eller Kemi B for at vælge selv."));
        d.appendChild(boks);
        if (V.link.fejl && V.link.fejl.length) d.appendChild(el("p", "mk-note", "Ikke med: " + V.link.fejl.length + " linjer, der ikke kunne læses."));
        return d;
    }

    function egneDel() {
        var d = el("div", "mk-del");
        d.appendChild(el("p", "mk-hjaelp", "Ét fagord pr. linje: fagordet, et tabulatortegn eller | og forklaringen. Et sæt fra Quizlet kan sættes direkte ind."));
        var felt = el("textarea", "mk-egne");
        felt.id = "egnefelt";
        felt.rows = 7;
        felt.spellcheck = false;
        felt.placeholder = "elektron | Partikel uden om atomets kerne med ladningen −1.\nproton | Partikel i atomets kerne med ladningen +1.";
        felt.value = V.egne;
        d.appendChild(felt);
        var s = O.fraTekst(V.egne);
        var status = el("p", "mk-note" + (s.fejl.length ? " advarsel" : ""), "");
        status.id = "egnestatus";
        status.textContent = egneStatus(s);
        d.appendChild(status);
        return d;
    }
    function egneStatus(s) {
        if (!V.egne.trim()) return "";
        var t = s.ord.length + " fagord læst.";
        if (s.fejl.length) t += " " + s.fejl.slice(0, 3).join(" ") + (s.fejl.length > 3 ? " (og " + (s.fejl.length - 3) + " mere)" : "");
        return t;
    }

    function antalValgt(b, k) {
        var n = 0, ialt = 0;
        k.afsnit.forEach(function (a) {
            a.ord.forEach(function (o) { ialt++; if (V.valgt[b.id][noegle(k, o)]) n++; });
        });
        return { n: n, ialt: ialt };
    }

    function bogDel(b) {
        var d = el("div", "mk-del");
        var gitter = el("div", "kapitelgitter");
        b.kapitler.forEach(function (k) {
            var a = antalValgt(b, k);
            var c = knap("", "kapitel" + (a.n === a.ialt ? " valgt" : (a.n ? " delvis" : "")), "kapitel", k.id);
            c.setAttribute("aria-pressed", a.n ? "true" : "false");
            c.appendChild(el("span", "kap-nr", k.nr || "Tema"));
            c.appendChild(el("span", "kap-navn", k.nr ? k.navn : k.navn.replace(/^Tema:\s*/, "")));
            c.appendChild(el("span", "kap-antal", a.n && a.n < a.ialt ? a.n + " af " + a.ialt : String(a.ialt)));
            gitter.appendChild(c);
        });
        d.appendChild(gitter);

        var med = b.kapitler.filter(function (k) { return antalValgt(b, k).n > 0; });
        var linje = el("div", "mk-linje");
        var detKnap = knap((V.detaljer ? "▾" : "▸") + " Vælg afsnit og enkelte fagord", "tekstknap", "detaljer");
        if (!med.length) detKnap.disabled = true;
        linje.appendChild(detKnap);
        if (med.length) linje.appendChild(knap("Ryd valget", "tekstknap", "ryd"));
        d.appendChild(linje);

        if (V.detaljer && med.length) {
            var liste = el("div", "afsnitsliste");
            med.forEach(function (k) {
                liste.appendChild(el("p", "afs-kapitel", kapitelNavn(k)));
                k.afsnit.forEach(function (a, ai) {
                    var n = a.ord.filter(function (o) { return V.valgt[b.id][noegle(k, o)]; }).length;
                    var rk = el("div", "afs-raekke");
                    var ab = knap("", "afs-knap", "afsnit", k.id + "#" + ai);
                    ab.appendChild(el("span", "afs-boks " + (n === a.ord.length ? "fuld" : (n ? "halv" : "tom"))));
                    ab.appendChild(el("span", "afs-titel", a.titel));
                    rk.appendChild(ab);
                    var chips = el("div", "afs-ord");
                    a.ord.forEach(function (o, oi) {
                        var v = V.valgt[b.id][noegle(k, o)];
                        chips.appendChild(knap(o[0], "ordchip" + (v ? " valgt" : ""), "ord", k.id + "#" + ai + "#" + oi));
                    });
                    rk.appendChild(chips);
                    liste.appendChild(rk);
                });
            });
            d.appendChild(liste);
        }
        return d;
    }

    function findKapitel(id) {
        var b = bog(id.charAt(0));
        return { b: b, k: b.kapitler.filter(function (x) { return x.id === id; })[0] };
    }

    function blinkTrin1() {
        var t = $("mk-trin1");
        if (!t) return;
        t.classList.remove("blink");
        void t.offsetWidth;
        t.classList.add("blink");
        if (t.scrollIntoView) t.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }

    mk.addEventListener("click", function (e) {
        var k = e.target.closest("[data-handling]");
        if (!k || !mk.contains(k)) return;
        var h = k.getAttribute("data-handling"), v = k.getAttribute("data-v");
        NK.Lyd.spil("ingen");
        if (h === "fane") { V.fane = v; gemValg(); visStart(); }
        else if (h === "tempo") { V.tempo = v; gemValg(); visStart(); }
        else if (h === "kapitel") {
            var f = findKapitel(v), a = antalValgt(f.b, f.k);
            f.k.afsnit.forEach(function (af) {
                af.ord.forEach(function (o) {
                    if (a.n === a.ialt) delete V.valgt[f.b.id][noegle(f.k, o)];
                    else V.valgt[f.b.id][noegle(f.k, o)] = true;
                });
            });
            gemValg(); visStart();
        } else if (h === "afsnit" || h === "ord") {
            var dele = v.split("#"), fk = findKapitel(dele[0]), af2 = fk.k.afsnit[+dele[1]];
            var valgt = V.valgt[fk.b.id];
            if (h === "ord") {
                var n2 = noegle(fk.k, af2.ord[+dele[2]]);
                if (valgt[n2]) delete valgt[n2]; else valgt[n2] = true;
            } else {
                var alle = af2.ord.every(function (o) { return valgt[noegle(fk.k, o)]; });
                af2.ord.forEach(function (o) { if (alle) delete valgt[noegle(fk.k, o)]; else valgt[noegle(fk.k, o)] = true; });
            }
            gemValg(); visStart();
        } else if (h === "detaljer") { V.detaljer = !V.detaljer; visStart(); }
        else if (h === "ryd") { V.valgt[V.fane] = {}; V.detaljer = false; gemValg(); visStart(); }
        else if (h === "start") { startFraValg(); }
        else if (h === "tilbage") { fortsaet(); }
        else if (h === "igen") { if (V.sidste) startSpil(V.sidste.ord, V.sidste.navn); }
        else if (h === "oev") { oevDrillere(); }
        else if (h === "fortsaet") { fortsaet(); }
        else if (h === "vaelg") { visStart(); }
    });

    mk.addEventListener("change", function (e) {
        if (e.target.id === "ordbankvalg") { V.ordbank = e.target.checked; gemValg(); visStart(); }
    });
    mk.addEventListener("input", function (e) {
        if (e.target.id !== "egnefelt") return;
        V.egne = e.target.value;
        gemValg();
        var s = O.fraTekst(V.egne);
        var st = $("egnestatus");
        st.textContent = egneStatus(s);
        st.classList.toggle("advarsel", s.fejl.length > 0);
        var ok = s.ord.length >= O.MINDST;
        $("mk-start").classList.toggle("mat", !ok);
        var nr = mk.querySelector(".mk-trinnr");
        nr.textContent = ok ? "✓" : "1";
        nr.classList.toggle("ok", ok);
        mk.querySelector(".mk-antal").textContent = s.ord.length ? s.ord.length + " fagord" : "Ingen valgt endnu";
        mk.querySelector(".mk-handling .mk-note").textContent = ok ? "" : "Vælg mindst " + O.MINDST + " fagord for at starte.";
    });

    function startFraValg() {
        var ord = valgteOrd();
        if (ord.length < O.MINDST) { blinkTrin1(); return; }
        startSpil(ord, valgNavn());
    }

    /* ----- Spillet ------------------------------------------------------ */
    function startSpil(ord, navn) {
        saet = { ord: ord, navn: navn };
        V.sidste = saet;
        spil = new NK.Spil(ord, { tempo: V.tempo, ordbank: V.ordbank });
        spil.haendelse = haendelse;
        scene.forbind(spil);
        spil.start();
        mk.hidden = true;
        $("bundkort").hidden = true;
        $("toast").hidden = true;
        svarfelt.value = "";
        visBesked("Skriv fagordet til en forklaring i glasset, og tryk Enter.", "info");
        $("loest-liste").innerHTML = "";
        $("drillede-liste").innerHTML = "";
        $("sidste-ord").textContent = "Intet endnu.";
        $("sidste-tekst").textContent = "";
        $("sidste-maerke").textContent = "";
        bygOrdbank();
        opdaterPanel();
        opdaterTop();
        fokus();
    }

    function fokus() {
        if (spil && spil.status === "koerer") {
            try { svarfelt.focus({ preventScroll: true }); } catch (e) { svarfelt.focus(); }
        }
    }

    function visBesked(tekst, klasse) {
        besked.textContent = tekst;
        besked.className = "svarbesked " + (klasse || "");
    }

    var toastUr = null;
    function toast(tekst) {
        var t = $("toast");
        t.textContent = tekst;
        t.hidden = false;
        t.classList.remove("vis");
        void t.offsetWidth;
        t.classList.add("vis");
        window.clearTimeout(toastUr);
        toastUr = window.setTimeout(function () { t.hidden = true; }, 2600);
    }

    function haendelse(type, d) {
        var o = d && d.kort ? spil.ord[d.kort.i] : null;
        if (type === "nyt") {
            scene.nytKort(d.kort);
            NK.Lyd.spil("plop");
        } else if (type === "hjaelp") {
            scene.hjaelp(d.kort);
        } else if (type === "loest") {
            scene.loest(d.kort, d.point, d.naesten);
            NK.Lyd.spil("opl", d.stime);
            var t = d.naesten ? "Rigtigt. Det staves " + o.ord + "." : "Rigtigt: " + o.ord + ".";
            if (d.stime >= 3) t += " " + d.stime + " rigtige i træk.";
            visBesked(t, "ok");
            sidste(o, true);
            var c = el("span", "chip groen", o.ord);
            $("loest-liste").appendChild(c);
            var bankChip = $("ordbank").querySelector('[data-i="' + d.kort.i + '"]');
            if (bankChip) bankChip.remove();
        } else if (type === "forkert") {
            NK.Lyd.spil("forkert");
            visBesked("»" + d.tekst.trim() + "« passer ikke til forklaringerne i glasset.", "fejl");
            ryst(svarfelt);
        } else if (type === "bund") {
            scene.bund(d.kort);
            NK.Lyd.spil("bund");
            svarfelt.value = "";
            visBundkort(o);
        } else if (type === "lag") {
            if (d.retning > 0) {
                scene.smuldr(d.kort);
                NK.Lyd.spil("lag");
                sidste(spil.ord[d.kort.i], false);
                if (!$("drillede-liste").querySelector('[data-i="' + d.kort.i + '"]')) {
                    var dc = el("span", "chip orange", spil.ord[d.kort.i].ord);
                    dc.setAttribute("data-i", d.kort.i);
                    $("drillede-liste").appendChild(dc);
                }
            } else {
                scene.omroer();
                NK.Lyd.spil("roer");
                toast(D.OMROER + " rigtige i træk: et lag bundfald er rørt op.");
            }
        } else if (type === "niveau") {
            NK.Lyd.spil("niveau");
            toast("Niveau " + d.niveau + (d.flere ? ": " + ["", "én", "to", "tre"][d.samtidig] + " forklaringer i glasset på én gang" : ""));
        } else if (type === "slut") {
            NK.Lyd.spil("slut");
            scene.konfetti();
            window.setTimeout(function () { visSlut(d, true); }, 1500);
        } else if (type === "fyldt") {
            NK.Lyd.spil("fyldt");
            window.setTimeout(function () { visSlut(d, false); }, 900);
        }
        opdaterPanel();
    }

    function ryst(e) {
        e.classList.remove("ryst");
        void e.offsetWidth;
        e.classList.add("ryst");
    }

    function sidste(o, loest) {
        $("sidste-ord").textContent = o.ord;
        $("sidste-tekst").textContent = o.lang || o.tekst;
        var m = $("sidste-maerke");
        m.textContent = loest ? "✓ opløst" : "nåede bunden";
        m.className = "taeller " + (loest ? "groen" : "orange");
    }

    /* ----- En krystal paa bunden ----------------------------------------- */
    function visBundkort(o) {
        $("bk-tekst").textContent = o.tekst;
        $("bk-ord").textContent = o.ord;
        var felt = $("bk-felt");
        felt.value = "";
        felt.hidden = V.ordbank;
        $("bk-note").textContent = V.ordbank ?
            "Krystallen bliver til bundfald, og fagordet kommer igen senere." :
            "Skriv fagordet af. Så bliver krystallen til bundfald, og fagordet kommer igen senere.";
        $("bundkort").hidden = false;
        svarfelt.disabled = true;
        window.setTimeout(function () {
            if (V.ordbank) $("bk-knap").focus(); else felt.focus();
        }, 60);
    }

    $("bk-form").addEventListener("submit", function (e) {
        e.preventDefault();
        if (!spil || spil.status !== "bund") return;
        var felt = $("bk-felt");
        if (!spil.afskriv(felt.value, V.ordbank)) {
            ryst(felt);
            $("bk-note").textContent = "Skriv " + spil.ord[spil.bundKort.i].ord + " i feltet, og tryk Enter.";
            felt.select();
            return;
        }
        $("bundkort").hidden = true;
        svarfelt.disabled = false;
        if (spil.status === "koerer") {
            visBesked("Fagordet kommer igen senere.", "info");
            fokus();
        }
        opdaterPanel();
    });

    /* ----- Svarfeltet og ordbanken --------------------------------------- */
    $("svarform").addEventListener("submit", function (e) {
        e.preventDefault();
        svar(svarfelt.value);
    });

    function svar(tekst) {
        if (!spil || spil.status !== "koerer") return;
        var r = spil.svar(tekst);
        if (r.ok) svarfelt.value = "";
        else if (r.grund === "forkert") svarfelt.select();
        fokus();
    }

    function bygOrdbank() {
        var b = $("ordbank");
        b.innerHTML = "";
        b.hidden = !V.ordbank;
        if (!V.ordbank) return;
        spil.ord.map(function (o, i) { return { o: o, i: i }; })
            .sort(function (a, c) { return a.o.ord.localeCompare(c.o.ord, "da"); })
            .forEach(function (x) {
                var k = knap(x.o.ord, "bankchip", "bank");
                k.setAttribute("data-i", x.i);
                b.appendChild(k);
            });
    }
    $("ordbank").addEventListener("click", function (e) {
        var k = e.target.closest(".bankchip");
        if (!k) return;
        svar(spil.ord[+k.getAttribute("data-i")].ord);
    });

    $("scene").addEventListener("pointerdown", function (e) {
        if (e.target.closest(".midterkort, .bundkort")) return;
        if (spil && spil.status === "koerer") window.setTimeout(fokus, 0);
    });

    /* ----- Pause og slut -------------------------------------------------- */
    /* Pause virker ogsaa, mens en krystal ligger paa bunden: spillet staar
       allerede stille, og kortet med afskriften kommer igen bagefter. */
    function pause() {
        if (!spil || (spil.status !== "koerer" && spil.status !== "bund")) return;
        if (spil.status === "koerer") spil.pause(true);
        $("bundkort").hidden = true;
        mk.innerHTML = "";
        mk.className = "midterkort pause";
        mk.hidden = false;
        mk.appendChild(el("h2", "mk-titel", "Pause"));
        mk.appendChild(el("p", "mk-intro", "Krystallerne venter, til du fortsætter."));
        var h = el("div", "mk-handling");
        var k = knap("Fortsæt", "knap stor blaa", "fortsaet");
        k.id = "mk-start";
        h.appendChild(k);
        mk.appendChild(h);
        opdaterPanel();
        window.setTimeout(function () { k.focus(); }, 30);
    }

    function fortsaet() {
        if (!spil) return;
        if (spil.status === "pause") spil.pause(false);
        mk.hidden = true;
        if (spil.status === "bund") {
            $("bundkort").hidden = false;
            $(V.ordbank ? "bk-knap" : "bk-felt").focus();
        } else {
            fokus();
        }
        opdaterPanel();
    }

    function visSlut(stat, vundet) {
        var nk = rekordNoegle(saet.ord);
        gemt.rekorder = gemt.rekorder || {};
        var foer = gemt.rekorder[nk] || 0;
        var ny = stat.point > foer;
        if (ny) { gemt.rekorder[nk] = stat.point; gem(); }

        visBesked("", "");
        mk.innerHTML = "";
        mk.className = "midterkort slut " + (vundet ? "vundet" : "tabt");
        mk.hidden = false;
        mk.appendChild(el("h2", "mk-titel", vundet ?
            (stat.lag ? "Alle fagord er opløst" : "Glasset er klart") : "Glasset er fyldt med bundfald"));
        if (vundet) {
            var st = el("p", "mk-stjerner");
            st.setAttribute("aria-label", stat.stjerner + " af 3 stjerner");
            for (var s = 0; s < 3; s++) st.appendChild(el("span", s < stat.stjerner ? "fuld" : "tom", "★"));
            mk.appendChild(st);
        }
        var p = el("p", "mk-point");
        p.appendChild(el("b", null, tal(stat.point)));
        p.appendChild(document.createTextNode(" point"));
        if (ny && stat.point > 0) p.appendChild(el("span", "mk-ny", foer ? "Ny rekord" : "Første rekord"));
        mk.appendChild(p);
        var linjer = [];
        if (vundet) {
            linjer.push(stat.foersteGang + " af " + stat.ialt + " fagord opløst i første forsøg.");
            if (stat.lag) linjer.push("Der ligger " + (stat.lag === 1 ? "ét lag" : stat.lag + " lag") + " bundfald i glasset.");
        } else {
            linjer.push("Du nåede at opløse " + stat.loest + " af " + stat.ialt + " fagord.");
        }
        if (stat.bedsteStime >= 3) linjer.push("Flest rigtige i træk: " + stat.bedsteStime + ".");
        mk.appendChild(el("p", "mk-intro", linjer.join(" ")));

        if (stat.drillere.length) {
            var boks = el("div", "mk-drillere");
            boks.appendChild(el("p", "mk-drilletitel", stat.drillere.length === 1 ? "Det fagord, der drillede" : "De fagord, der drillede"));
            var dl = el("dl");
            stat.drillere.forEach(function (i) {
                var o = saet.ord[i];
                dl.appendChild(el("dt", null, o.ord));
                dl.appendChild(el("dd", null, o.lang || o.tekst));
            });
            boks.appendChild(dl);
            mk.appendChild(boks);
        }

        var h = el("div", "mk-handling raekke");
        var igen = knap(vundet ? "Spil igen" : "Prøv igen", "knap stor blaa", "igen");
        igen.id = "mk-start";
        h.appendChild(igen);
        if (stat.drillere.length) {
            h.appendChild(knap("Øv " + (stat.drillere.length === 1 ? "det" : "de " + stat.drillere.length) + ", der drillede", "knap stor", "oev"));
        }
        mk.appendChild(h);
        mk.appendChild(knap("Vælg andre fagord", "tekstknap mk-tilbage", "vaelg"));
        mk.scrollTop = 0;
        opdaterPanel();
        window.setTimeout(function () { igen.focus(); }, 30);
    }

    function oevDrillere() {
        if (!spil) return;
        var ord = spil.statistik().drillere.map(function (i) { return saet.ord[i]; });
        if (!ord.length) return;
        var navn = "Øv: " + saet.navn.replace(/^Øv: /, "");
        startSpil(ord, navn);
    }

    /* ----- Panel og toplinje --------------------------------------------- */
    function opdaterTop() {
        var n = $("saetnavn");
        if (spil && saet) n.textContent = saet.navn;
        else n.textContent = "";
    }

    function opdaterPanel() {
        var lagEl = $("lag");
        var lag = spil ? spil.lag : 0;
        if (lagEl.childNodes.length !== D.LAG_MAKS) {
            lagEl.innerHTML = "";
            for (var i = 0; i < D.LAG_MAKS; i++) lagEl.appendChild(el("i"));
        }
        for (var j = 0; j < D.LAG_MAKS; j++) {
            var c = lagEl.childNodes[j];
            c.className = j < lag ? "fuld" : "";
            c.style.backgroundColor = j < lag ? NK.Scene.LAGFARVER[j].fyld : "";
        }
        lagEl.setAttribute("aria-label", lag + " af " + D.LAG_MAKS + " lag");
        $("point").textContent = spil ? tal(spil.point) : "0";
        $("niveau").textContent = spil ? spil.niveau : "1";
        var n = spil ? spil.n : 0, l = spil ? spil.antalLoest : 0;
        $("fremgang-bar").style.width = n ? (100 * l / n) + "%" : "0";
        $("fremgang-tekst").textContent = n ? l + " af " + n + " fagord opløst" : "Ingen fagord endnu";
        $("antal-loest").textContent = l;
        var dr = $("drillede-liste").childNodes.length;
        $("drillede-hoved").hidden = !dr;
        $("antal-drillede").textContent = dr;
        $("rekord").textContent = saet ? tal(Math.max(rekord(saet.ord), spil && (spil.status === "slut" || spil.status === "fyldt") ? spil.point : 0)) : "0";

        var k = $("spilknap"), st = spil ? spil.status : "ingen";
        var staarStille = st === "pause" || (st === "bund" && !mk.hidden);
        k.textContent = staarStille ? "Fortsæt" : (st === "koerer" || st === "bund" ? "Pause" :
            (st === "slut" || st === "fyldt" ? "Spil igen" : "Start spil"));
        $("forfraknap").hidden = !(st === "koerer" || st === "pause" || st === "bund");
        svarfelt.disabled = st !== "koerer";
        $("ordbank").classList.toggle("mat", st !== "koerer");
    }

    $("spilknap").addEventListener("click", function () {
        var st = spil ? spil.status : "ingen";
        var staarStille = st === "pause" || (st === "bund" && !mk.hidden);
        if (staarStille) fortsaet();
        else if (st === "koerer" || st === "bund") pause();
        else if (st === "slut" || st === "fyldt") startSpil(V.sidste.ord, V.sidste.navn);
        else startFraValg();
    });
    $("forfraknap").addEventListener("click", function () { if (saet) startSpil(saet.ord, saet.navn); });

    $("vaelgknap").addEventListener("click", function () {
        if (spil && spil.status === "koerer") spil.pause(true);
        $("bundkort").hidden = true;
        visStart();
        opdaterPanel();
    });

    var regler = $("regler");
    function visRegler(vis) {
        if (vis && spil && spil.status === "koerer") pause();
        regler.hidden = !vis;
        if (vis) $("regler-luk").focus();
    }
    $("regelknap").addEventListener("click", function () { visRegler(true); });
    $("regler-luk").addEventListener("click", function () { visRegler(false); });
    regler.addEventListener("click", function (e) { if (e.target === regler) visRegler(false); });

    var lydknap = $("lydknap");
    NK.Lyd.til(gemt.lyd !== false);
    function opdaterLyd() {
        lydknap.textContent = NK.Lyd.til() ? "🔊" : "🔇";
        lydknap.setAttribute("aria-pressed", NK.Lyd.til() ? "true" : "false");
    }
    lydknap.addEventListener("click", function () {
        NK.Lyd.til(!NK.Lyd.til());
        gemt.lyd = NK.Lyd.til();
        gem();
        opdaterLyd();
        fokus();
    });
    opdaterLyd();

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            if (!regler.hidden) { visRegler(false); return; }
            var paaPause = !mk.hidden && mk.classList.contains("pause");
            if (spil && (spil.status === "koerer" || (spil.status === "bund" && mk.hidden))) { pause(); e.preventDefault(); }
            else if (spil && paaPause) { fortsaet(); e.preventDefault(); }
            return;
        }
        if (e.key === "Enter" && !mk.hidden && document.activeElement && document.activeElement.tagName !== "TEXTAREA" &&
            document.activeElement.tagName !== "BUTTON" && document.activeElement.tagName !== "INPUT") {
            var s = $("mk-start");
            if (s) { s.click(); e.preventDefault(); }
        }
    });

    document.addEventListener("visibilitychange", function () {
        if (document.hidden && spil && spil.status === "koerer") pause();
    });

    window.addEventListener("hashchange", function () {
        V.link = null;
        laesHash();
        if (!spil || spil.status !== "koerer") visStart();
    });
    /* Scenen skifter stoerrelse med vinduet og med ordbanken under glasset. */
    if (window.ResizeObserver) new window.ResizeObserver(function () { scene.maal(); }).observe($("scene"));
    else window.addEventListener("resize", function () { scene.maal(); });

    /* ----- Loekken --------------------------------------------------------- */
    var sidstTid = null;
    function loekke(t) {
        var dt = sidstTid === null ? 0 : Math.min(0.05, (t - sidstTid) / 1000);
        sidstTid = t;
        if (spil) spil.opdater(dt);
        scene.tegn(dt);
        window.requestAnimationFrame(loekke);
    }

    laesHash();
    visStart();
    opdaterPanel();
    window.requestAnimationFrame(loekke);
    NK.app.startSpil = startSpil;
    NK.app.visStart = visStart;
    NK.app.pause = pause;
    NK.app.fortsaet = fortsaet;
    NK.app.svar = svar;
}());
