/* =====================================================================
   app.js - tilstanden og forloebet i EscapeRoom Kemi C

   Tilstanden gemmes i browseren (D.LAGER), saa en gruppe kan lukke
   fanen og fortsaette. Skaermen afgoeres af tilstanden alene:
   start -> rum 1..5 -> slut -> (fem guldnoegler) guld -> finale.

   Hvert rum har tre trin i fast raekkefoelge. Et trin er hakket i dele,
   der tjekkes hver for sig (Indsend svar). De loeste trin giver koden.
   Bonusrutens guldkode aabner ogsaa doeren og giver en guldnoegle; den
   kan ogsaa tastes, efter doeren er aabnet.
   ===================================================================== */
(function () {
    "use strict";

    var D = NK.D, el = NK.el, h = NK.html, Sp = NK.Sprites, Sc = NK.Scener, Se = NK.Sedler;
    var T = null;          /* tilstanden */
    var sag = null;        /* NK.Sag.lav(T.sag) */
    var seddel = null;     /* det aabne kort: { type, rum, ... } */

    NK.saetTekst = function (id, tekst) {
        var e = el(id);
        if (e && e.textContent !== tekst) e.textContent = tekst;
    };

    /* ----- Tilstanden ------------------------------------------------- */
    function nyTilstand(nr) {
        return { v: D.VERSION, sag: nr, start: null, tid: null, naaet: 1, vist: null,
                 trin: {}, dele: {}, lab: {}, bland: {}, blandValg: [], blandSidst: null, handl: {},
                 guld: {}, segl: {}, vedGuld: false, finale: false };
    }
    function nytNr() { return 1000 + Math.floor(Math.random() * 9000); }
    function gem() { NK.gem(D.LAGER, T); }
    function indlaes() {
        var t = NK.hent(D.LAGER, null);
        if (!t || t.v !== D.VERSION || !(t.sag >= 1000 && t.sag <= 9999)) t = nyTilstand(nytNr());
        T = t;
        sag = NK.Sag.lav(T.sag);
    }

    function alleGuld() { for (var i = 1; i <= 5; i++) if (!T.guld[i]) return false; return true; }
    function alleSegl() { return D.SEGL.every(function (s) { return !!T.segl[s.id]; }); }
    function noegle(rum, trinId) { return rum + ":" + trinId; }
    function trinNr(rum) { return Sc.trinNr(sag.rum[rum], T, rum); }

    function skaerm() {
        if (!T.start) return { type: "start" };
        if (T.vist && T.vist < T.naaet && T.vist <= 5) return { type: "rum", rum: T.vist, gensyn: true };
        if (T.naaet <= 5) return { type: "rum", rum: T.naaet };
        if (T.finale) return { type: "finale" };
        if (T.vedGuld && alleGuld()) return { type: "guld" };
        return { type: "slut" };
    }
    function frontNavn() { return T.naaet <= 5 ? "rum " + T.naaet : (T.vedGuld && alleGuld() && !T.finale ? "den gyldne dør" : "slutningen"); }

    /* ----- Beviset (som i den gamle: DDMMTTmm og mod 11) ------------- */
    var VAEGTE = [4, 3, 2, 7, 6, 5, 4, 3];
    function bevis(forstavelse, nu) {
        nu = nu || new Date();
        var p = [nu.getDate(), nu.getMonth() + 1, nu.getHours(), nu.getMinutes()]
            .map(function (v) { return String(v).padStart(2, "0"); }).join("");
        var sum = 0;
        for (var i = 0; i < 8; i++) sum += Number(p[i]) * VAEGTE[i];
        return forstavelse + "-" + p + "-" + String(sum % 11).padStart(2, "0");
    }

    /* ----- Toplinjen ---------------------------------------------------- */
    function noegleIkon(fyld, kant, b) {
        return '<svg viewBox="-2 -2 84 36" width="' + (b || 36) + '" height="' + Math.round((b || 36) * 0.44) + '" aria-hidden="true">' + Sp.noegle(0, 0, fyld, kant, 1) + "</svg>";
    }
    function tegnTop(sk) {
        el("sagnr").textContent = "Sag #" + T.sag;
        var s = "";
        for (var i = 1; i <= 5; i++) {
            var farve = D.FARVE[i], kl = "rumknap", indhold, titel, klik = false;
            if (!T.start || i > T.naaet) { kl += " laast"; indhold = String(i); titel = "Rum " + i + ": låst"; }
            else if (i < T.naaet) {
                kl += " loest" + (T.guld[i] ? " guldnoegle" : "");
                indhold = noegleIkon(T.guld[i] ? "#f6cd2b" : "#ffffff", "#27303f");
                titel = "Rum " + i + ": åbnet med " + (T.guld[i] ? "guldnøgle" : "almindelig nøgle") + ". Klik for at se rummet igen.";
                klik = true;
            } else { kl += " nu"; indhold = String(i); titel = "Rum " + i + ": her er I nu"; klik = true; }
            if (sk.type === "rum" && sk.rum === i) kl += " vist";
            s += '<button type="button" class="' + kl + '" style="--farve:' + farve + '" data-rum="' + i + '"' + (klik ? "" : " disabled") +
                ' title="' + h(titel) + '" aria-label="' + h(titel) + '">' + indhold + "</button>";
            if (i < 5) s += '<span class="streg' + (T.start && i < T.naaet ? " fyldt" : "") + '" style="--farve:' + farve + '"></span>';
        }
        if (T.naaet > 5 && alleGuld()) {
            s += '<span class="streg fyldt" style="--farve:' + D.FARVE[6] + '"></span>' +
                '<button type="button" class="rumknap guld' + (sk.type === "guld" || sk.type === "finale" ? " vist" : "") +
                '" data-rum="6" title="Den gyldne dør" aria-label="Den gyldne dør">★</button>';
        }
        el("noegler").innerHTML = s;
        opdaterUr();
    }
    function opdaterUr() {
        var ms = !T.start ? 0 : (T.tid !== null ? T.tid : Date.now() - T.start);
        NK.saetTekst("ur", NK.tid(ms));
        var b = el("bevis");
        if (b) b.textContent = bevis(b.getAttribute("data-forstavelse"));
    }

    /* ----- Opgavekortet oeverst i midten --------------------------------- */
    /* Koden, som den ser ud nu: fundne cifre og streger for dem, der mangler. */
    function kodeVist(rum) {
        var r = sag.rum[rum], f = T.naaet > rum ? r.kode : Se.fundet(r, T, rum), n = 0;
        return r.kodeMaske.split("").map(function (c) {
            if (c !== "#") return c === " " ? '<i class="luft"></i>' : c;
            var v = f.charAt(n++);
            return v === " " || !v ? '<i class="tom"></i>' : "<b>" + v + "</b>";
        }).join("");
    }
    function tegnKort(sk) {
        var f = el("fortaelling"), s = "";
        if (sk.type === "rum") {
            var rum = sk.rum, r = sag.rum[rum], info = D.RUM[rum], nu = trinNr(rum), aaben = T.naaet > rum;
            s = '<p class="rumlinje"><b class="rumtitel" style="--farve:' + D.FARVE[rum] + '">Rum ' + rum + " · " + h(info.titel) + "</b> " +
                '<span class="niller">Niller: »' + h(info.niller) + "«</span></p>";
            var goer;
            if (aaben) {
                goer = D.TOP.aaben + (T.guld[rum] ? "" : " Guldkoden fra bonusruten kan stadig tastes i kodelåsen.") +
                    (sk.gensyn ? ' <button type="button" class="knap lille" data-front>Tilbage til ' + h(frontNavn()) + "</button>" : "");
            } else if (nu >= r.trin.length) goer = D.TOP.fundet;
            else goer = "<b>Trin " + (nu + 1) + " af " + r.trin.length + ":</b> " + h(r.trin[nu].goer);
            s += '<p class="goer" id="goer">' + goer + "</p>";
            s += '<div class="chips">' + r.trin.map(function (tr, i) {
                var kl = i < nu ? "loest" : (i === nu && !aaben ? "aktiv" : "venter");
                return '<button type="button" class="chip ' + kl + '" data-ting="' + tr.ting + '"><i>' + (i < nu ? "✓" : i + 1) + "</i>" + h(tr.chip) + "</button>";
            }).join('<span class="pil">›</span>') +
                '<span class="pil">›</span><button type="button" class="chip kode' + (aaben ? " loest" : nu >= r.trin.length ? " aktiv" : " venter") + '" data-ting="laas">' +
                D.TOP.kode + ' <span class="kodecifre">' + kodeVist(rum) + "</span></button>" +
                '<button type="button" class="chip bonus' + (T.guld[rum] ? " loest" : "") + '" data-ting="bonus">★ ' + (T.guld[rum] ? "Guldnøgle" : D.TOP.bonusChip) + "</button></div>";
        } else if (sk.type === "guld") {
            s = '<p class="rumlinje"><b class="rumtitel" style="--farve:' + D.FARVE[6] + '">' + h(D.RUM[6].titel) + "</b> " + h(D.RUM[6].tekst) + "</p>";
            s += '<p class="goer">' + (alleSegl() ? D.SEGL_TEKST.alle + ' <button type="button" class="knap hoved" id="guldknap">' + D.SEGL_TEKST.doer + "</button>"
                : "Klik på et segl på døren.") + "</p>";
        }
        f.innerHTML = s;
        f.hidden = !s;
    }

    /* ----- Scenen ------------------------------------------------------- */
    function tegnScene(sk) {
        sk = sk || skaerm();
        var hvad = sk.type === "start" ? "start" : sk.type === "rum" ? sk.rum : sk.type === "slut" ? 5 : sk.type === "guld" ? "guld" : "guld-aaben";
        el("tegning").innerHTML = Sc.tegn(hvad, sag, T);
        el("scene").classList.toggle("daempet", sk.type === "start" || sk.type === "slut" || sk.type === "finale");
    }

    /* ----- Kortet i midten: start og slutningerne ---------------------- */
    function noegleringHTML() {
        var s = '<div class="noeglering" role="group" aria-label="Nøgleringen">';
        for (var i = 1; i <= 5; i++) {
            var guld = !!T.guld[i];
            s += '<button type="button" class="noegleknap' + (guld ? " guld" : " jern") + '" data-noegle="' + i + '" style="--farve:' + D.FARVE[i] + '"' + (guld ? " disabled" : "") +
                ' aria-label="' + (guld ? "Guldnøglen fra rum " + i : "Jernnøglen fra rum " + i + ". Gå tilbage til rummet.") + '">' +
                noegleIkon(guld ? "#f6cd2b" : "#aab1ba", "#27303f", 72) + '<span class="maerke">Rum ' + i + "</span></button>";
        }
        return s + "</div>";
    }
    function bevisHTML(forstavelse) {
        return '<div class="bevis' + (forstavelse === "GULDSKAFT" ? " guld" : "") + '"><span class="etiket">' + D.BEVIS.etiket + "</span>" +
            '<b id="bevis" data-forstavelse="' + forstavelse + '">' + bevis(forstavelse) + '</b><span class="lille">' + D.BEVIS.note + "</span></div>";
    }
    function tegnMidte(sk) {
        var m = el("midte"), s = "";
        if (sk.type === "start") {
            var St = D.START;
            s = '<div class="mappe"><span class="stempel">Sag #' + T.sag + "</span>" +
                "<h2>" + h(St.titel) + '</h2><p class="under">' + h(St.under) + "</p>" +
                "<p>" + h(St.tekst) + '</p><ul class="regler">' + St.regler.map(function (r) { return "<li>" + h(r) + "</li>"; }).join("") + "</ul>" +
                '<div class="knaprad"><button type="button" class="knap hoved stor" id="startknap">' + h(St.knap) + "</button></div></div>";
        } else if (sk.type === "slut") {
            var Sl = D.SLUT, alle = alleGuld();
            s = '<div class="mappe"><span class="stempel groen">' + h(Sl.stempel) + "</span><h2>" + h(Sl.titel) + "</h2>" +
                "<p>" + h(Sl.tekst) + '</p><p class="tid">Tid for de fem rum: <b>' + NK.tid(T.tid || 0) + "</b></p>" +
                noegleringHTML() +
                '<p class="guldvej">' + h(alle ? Sl.alleGuld : Sl.guldvej) + "</p>" +
                (alle ? '<div class="knaprad"><button type="button" class="knap hoved" data-tilguld>Gå til den gyldne dør</button></div>' : "") +
                bevisHTML("RUMLESKAFT") +
                '<div class="knaprad"><button type="button" class="knap stille" data-nysag>Ny sag</button></div></div>';
        } else if (sk.type === "finale") {
            var F = D.FINALE;
            s = '<div class="mappe guldkant"><span class="stempel guld">' + h(F.stempel) + "</span><h2>" + h(F.titel) + "</h2>" +
                "<p>" + h(F.tekst) + '</p><p class="tid">Sag #' + T.sag + " · tid for de fem rum: <b>" + NK.tid(T.tid || 0) + "</b></p>" +
                bevisHTML("GULDSKAFT") +
                '<div class="knaprad"><button type="button" class="knap stille" data-nysag>Ny sag</button></div></div>';
        }
        m.innerHTML = s;
        m.hidden = !s;
    }

    function vis() {
        var sk = skaerm();
        lukSeddel(true);
        tegnTop(sk);
        tegnKort(sk);
        tegnScene(sk);
        tegnMidte(sk);
    }
    /* Tegner det om, et loest trin aendrer, uden at lukke kortet. */
    function opdater() {
        var sk = skaerm();
        tegnTop(sk);
        tegnKort(sk);
        tegnScene(sk);
    }

    /* ----- Kortet over scenen ------------------------------------------- */
    function lukSeddel(udenTegning) {
        var varForsoeg = seddel && seddel.type === "trin";
        seddel = null;
        el("slor").hidden = true;
        el("seddel").innerHTML = "";
        if (varForsoeg && !udenTegning) tegnScene();
    }
    function hoved(etiket, titel) {
        return '<div class="seddel-hoved"><h2><span class="etiket">' + h(etiket) + "</span>" + h(titel) + "</h2>" +
            '<button type="button" class="luk" data-luk aria-label="Luk kortet">✕</button></div>';
    }
    function saetSeddel(html, bred, guld) {
        var sd = el("seddel");
        sd.className = "seddel" + (bred ? " bred" : "") + (guld ? " guldkort" : "");
        sd.innerHTML = html;
        el("slor").hidden = false;
        sd.scrollTop = 0;
    }
    function fokus() {
        var sd = el("seddel");
        var f = sd.querySelector("#svarfelt") || sd.querySelector(".koef") || sd.querySelector(".ciffer.g:not([disabled])") ||
            sd.querySelector("#seglsvar") || sd.querySelector(".knap.hoved") || sd.querySelector("[data-luk]");
        if (f) f.focus({ preventScroll: true });
        sd.scrollTop = 0;
    }

    /* Et klik paa en ting i rummet (eller paa en chip i opgavekortet). */
    function aabnTing(rum, ting) {
        if (ting === "laas") return aabnLaas(rum);
        if (ting === "bonus") return aabnBonus(rum);
        var r = sag.rum[rum];
        for (var i = 0; i < r.trin.length; i++) if (r.trin[i].ting === ting) return aabnTrin(rum, i);
        var k = Se.trin(rum, ting, sag, T);          /* en ting uden trin (tavlen i rum 3) */
        if (k) {
            seddel = { type: "info", rum: rum };
            saetSeddel(hoved("Rum " + rum, k.titel) + '<div class="seddel-krop">' + k.intro + "</div>");
            fokus();
        }
    }

    /* ----- Et trin -------------------------------------------------------- */
    function aabnTrin(rum, idx) {
        seddel = { type: "trin", rum: rum, idx: idx, hint: false, valg: undefined };
        tegnTrin();
    }
    function trinKort() {
        var r = sag.rum[seddel.rum], tr = r.trin[seddel.idx];
        return { r: r, tr: tr, noegle: noegle(seddel.rum, tr.id), k: Se.trin(seddel.rum, tr.id, sag, T) };
    }
    function tegnTrin() {
        var rum = seddel.rum, idx = seddel.idx, x = trinKort(), r = x.r, tr = x.tr, k = x.k;
        var nu = trinNr(rum), etiket = "Trin " + (idx + 1) + " af " + r.trin.length;
        if (idx > nu) {
            /* Trinene tages i raekkefoelge: sig hvilket, der kommer foerst. */
            saetSeddel(hoved(etiket, k.titel) + '<div class="seddel-krop"><p>Dette er trin ' + (idx + 1) + ". Løs først trin " + (nu + 1) + ": " + h(r.trin[nu].goer.charAt(0).toLowerCase() + r.trin[nu].goer.slice(1)) + "</p></div>" +
                '<div class="seddel-fod"><span></span><button type="button" class="knap hoved" data-gaatrin="' + nu + '">Gå til trin ' + (nu + 1) + "</button></div>");
            fokus();
            return;
        }
        var loeste = T.dele[x.noegle] || 0, faerdig = !!T.trin[x.noegle];
        var udfoert = !k.handling || !!T.handl[k.handling.noegle];
        var s = hoved(etiket, k.titel) + '<div class="seddel-krop">' + (k.intro || "");
        var fod = "";
        if (!udfoert) {
            s += '<div class="handling"><button type="button" class="knap hoved stor" data-handl>' + h(k.handling.tekst) + "</button></div>";
        } else {
            if (loeste) s += '<ol class="regnestykke">' + k.dele.slice(0, loeste).map(function (d) { return '<li class="loest"><i>✓</i><span>' + d.vis + "</span></li>"; }).join("") + "</ol>";
            if (faerdig) {
                s += '<p class="ok faerdig">Trinet er løst.' + (tr.cifre ? " Det giver " + (tr.cifre.length > 1 ? "cifrene" : "cifret") + " <b>" + tr.cifre.split("").join(" ") + "</b> til koden." : "") + "</p>";
                var sidste = idx === r.trin.length - 1;
                fod = '<div class="seddel-fod"><span></span><button type="button" class="knap hoved" ' + (sidste && T.naaet <= rum ? "data-tillaas>Gå til kodelåsen" : "data-luk>Videre") + "</button></div>";
            } else {
                var del = k.dele[loeste];
                s += '<div class="del">' +
                    (del.formel ? '<p class="formel">' + del.formel + "</p>" : "") +
                    (del.data ? '<p class="data">' + del.data + "</p>" : "") +
                    '<p class="spm">' + del.spm + "</p>" + Se.widget(del, seddel.valg) + "</div>" +
                    '<div class="note" id="hint"' + (seddel.hint ? "" : " hidden") + '><span class="etiket">Hint</span> ' + h(del.hint) + "</div>";
                fod = '<div class="seddel-fod"><button type="button" class="knap gulkant" id="hintknap">' + (seddel.hint ? "Vis svaret" : "Giv et hint") + "</button>" +
                    '<div class="svar-linje" id="besked" aria-live="polite"></div>' +
                    '<button type="button" class="knap hoved" id="indsend">Indsend svar</button></div>';
            }
        }
        s += "</div>" + fod;
        saetSeddel(s, k.bred);
        fokus();
    }
    function aktuelDel() {
        var x = trinKort();
        return { x: x, del: x.k.dele[T.dele[x.noegle] || 0] };
    }
    function udfoerHandling() {
        var x = trinKort();
        if (!x.k.handling) return;
        T.handl[x.k.handling.noegle] = true;
        gem();
        tegnScene();
        tegnTrin();
    }
    function loesDel() {
        var x = trinKort();
        var n = (T.dele[x.noegle] || 0) + 1;
        T.dele[x.noegle] = n;
        if (n >= x.k.dele.length) T.trin[x.noegle] = true;
        gem();
        seddel.hint = false;
        seddel.valg = undefined;
        opdater();
        tegnTrin();
    }
    /* Det, eleven har svaret i den aktuelle del. */
    function laesSvar(del) {
        var sd = el("seddel");
        if (del.type === "tal") return (el("svarfelt") || {}).value;
        if (del.type === "koef") return Array.prototype.map.call(sd.querySelectorAll(".koef"), function (i) { return i.value; });
        return seddel.valg;
    }
    function indsend(v) {
        if (!seddel || seddel.type !== "trin") return null;
        var a = aktuelDel(), del = a.del;
        if (!del || T.trin[a.x.noegle]) return null;
        if (a.x.k.handling && !T.handl[a.x.k.handling.noegle]) return null;
        if (v === undefined) v = laesSvar(del);
        var u = del.tjek(v, T);
        if (u.ok) { loesDel(); return u; }
        var b = el("besked");
        if (b) { b.innerHTML = u.besked; b.className = "svar-linje " + (u.gratis ? "mangler" : "fejl"); }
        if (!u.gratis) ryst();
        return u;
    }
    function hintKlik() {
        if (!seddel || seddel.type !== "trin") return;
        if (!seddel.hint) {
            seddel.hint = true;
            var hb = el("hint"), kn = el("hintknap");
            if (hb) hb.hidden = false;
            if (kn) kn.textContent = "Vis svaret";
        } else loesDel();
    }
    function ryst() {
        var sd = el("seddel");
        sd.classList.remove("ryst");
        void sd.offsetWidth;
        sd.classList.add("ryst");
    }

    /* ----- Forsoegene paa kortene ---------------------------------------- */
    function dryp(n) {
        T.lab[n] = true;
        gem();
        var g = el("labgitter");
        if (g) g.innerHTML = Se.labGitter(sag.rum[1], T);
    }
    function bland(i) {
        var v = T.blandValg || [], p = v.indexOf(i);
        if (p >= 0) v.splice(p, 1); else v.push(i);
        if (v.length === 2) {
            var st = sag.rum[2].stoffer;
            if (!(st[v[0]].fast && st[v[1]].fast)) T.bland[Se.par(v[0], v[1])] = true;
            T.blandSidst = v.slice();
            v = [];
        }
        T.blandValg = v;
        gem();
        var b = el("blandebord");
        if (b) b.innerHTML = Se.blandebord(sag.rum[2], T);
    }

    /* ----- Bonusruten ------------------------------------------------------ */
    function aabnBonus(rum) {
        var k = Se.bonus(rum, sag), guld = !!T.guld[rum];
        seddel = { type: "bonus", rum: rum };
        saetSeddel(hoved("★ Bonusrute", k.titel) + '<div class="seddel-krop"><p class="bonusom">' + h(D.BONUS.om) + "</p>" + k.html +
            (guld ? '<p class="ok">' + D.BONUS.loest + "</p>" : "<p>" + D.BONUS.tast + "</p>") + "</div>" +
            (guld ? "" : '<div class="seddel-fod"><span></span><button type="button" class="knap hoved" data-tillaas>' + D.BONUS.knap + "</button></div>"), false, true);
        fokus();
    }

    /* ----- Kodelaasen ------------------------------------------------------ */
    function aabnLaas(rum, besked, ok) {
        var k = Se.laas(rum, sag, T), aaben = T.naaet > rum;
        seddel = { type: "laas", rum: rum };
        var knap;
        if (aaben && k.guld) knap = '<button type="button" class="knap hoved" data-videre>' + h(videreTekst(rum)) + "</button>";
        else knap = '<button type="button" class="knap hoved" id="laasop" disabled>Lås op</button>' +
            (aaben ? '<button type="button" class="knap" data-videre>' + h(videreTekst(rum)) + "</button>" : "");
        saetSeddel(hoved("Rum " + rum, k.titel) + '<div class="seddel-krop">' + k.html + "</div>" +
            '<div class="seddel-fod"><p class="svar-linje' + (ok ? " ok" : "") + '" id="laasbesked" aria-live="polite">' + (besked || (aaben ? D.LAAS.aaben : "")) + "</p>" +
            '<span class="knapper">' + knap + "</span></div>");
        opdaterLaasknap();
        fokus();
    }
    function videreTekst(rum) { return rum === T.naaet - 1 ? D.LAAS.videre(rum + 1) : "Tilbage til " + frontNavn(); }
    function raekke(navn) {
        return Array.prototype.slice.call(el("seddel").querySelectorAll('[data-raekke="' + navn + '"] .ciffer'));
    }
    function fuld(felter) { return felter.length > 0 && felter.every(function (c) { return /^[0-9]$/.test(c.value); }); }
    function opdaterLaasknap() {
        var b = el("laasop");
        if (!b) return;
        var klar = (T.naaet <= seddel.rum && fuld(raekke("kode"))) || fuld(raekke("guld"));
        b.disabled = !klar;
    }
    function skrivKode(kode, navn) {
        var c = NK.Sag.cifre(kode);
        raekke(navn || "kode").forEach(function (x, i) { if (!x.disabled) x.value = c.charAt(i) || ""; });
        opdaterLaasknap();
    }
    function laasOp() {
        if (!seddel || seddel.type !== "laas") return false;
        var rum = seddel.rum, r = sag.rum[rum], aaben = T.naaet > rum;
        var b = el("laasop");
        if (!b || b.disabled) return false;
        var kf = raekke("kode"), gf = raekke("guld");
        var kode = kf.map(function (c) { return c.value; }).join(""), guld = gf.map(function (c) { return c.value; }).join("");
        var guldOk = fuld(gf) && guld === r.bonus.kode, kodeOk = !aaben && fuld(kf) && kode === r.kode;
        if (!guldOk && !kodeOk) {
            var besked = el("laasbesked");
            besked.textContent = fuld(gf) ? D.LAAS.guldForkert : D.LAAS.forkert;
            besked.className = "svar-linje fejl";
            ryst();
            return false;
        }
        if (guldOk) T.guld[rum] = true;
        if (!aaben) {
            T.naaet = rum + 1;
            T.vist = null;
            if (rum === 5) T.tid = Date.now() - T.start;
        }
        gem();
        var tekst = aaben ? D.LAAS.guldSenere : guldOk ? D.LAAS.rigtigGuld : D.LAAS.rigtig;
        var sk = aaben ? skaerm() : { type: "rum", rum: rum };
        tegnTop(sk);
        tegnKort(sk);
        tegnScene(sk);
        if (!aaben) {
            /* Doeren drejer op bag kortet */
            var blad = el("tegning").querySelector(".doerblad");
            if (blad) { blad.classList.remove("aaben"); void blad.getBoundingClientRect(); blad.classList.add("aaben"); }
        }
        aabnLaas(rum, tekst, true);
        return true;
    }
    function videre() { T.vist = null; gem(); vis(); }

    /* Cifrene: et ciffer flytter videre, tilbage-tasten flytter tilbage. */
    function cifferFelter() { return Array.prototype.slice.call(el("seddel").querySelectorAll(".ciffer:not([disabled])")); }
    function cifferInput(e) {
        var c = e.target;
        if (!c.classList || !c.classList.contains("ciffer")) return;
        c.value = c.value.replace(/[^0-9]/g, "").slice(-1);
        if (c.value) {
            var f = cifferFelter(), i = f.indexOf(c);
            if (i >= 0 && i < f.length - 1) f[i + 1].focus();
        }
        opdaterLaasknap();
    }
    function cifferTast(e) {
        var c = e.target;
        if (!c.classList || !c.classList.contains("ciffer")) return;
        var f = cifferFelter(), i = f.indexOf(c);
        if (e.key === "Backspace" && !c.value && i > 0) { f[i - 1].value = ""; f[i - 1].focus(); e.preventDefault(); opdaterLaasknap(); }
        else if (e.key === "ArrowLeft" && i > 0) { f[i - 1].focus(); e.preventDefault(); }
        else if (e.key === "ArrowRight" && i < f.length - 1) { f[i + 1].focus(); e.preventDefault(); }
        else if (e.key === "Enter") { laasOp(); e.preventDefault(); }
    }
    function cifferIndsaet(e) {
        var c = e.target;
        if (!c.classList || !c.classList.contains("ciffer")) return;
        var tekst = NK.Sag.cifre((e.clipboardData || window.clipboardData).getData("text"));
        if (!tekst) return;
        e.preventDefault();
        var f = cifferFelter(), i = f.indexOf(c);
        for (var k = 0; k < tekst.length && i + k < f.length; k++) f[i + k].value = tekst.charAt(k);
        f[Math.min(f.length - 1, i + tekst.length)].focus();
        opdaterLaasknap();
    }

    /* ----- Seglene -------------------------------------------------------- */
    function aabnSegl(id) {
        var sg = D.SEGL.filter(function (x) { return x.id === id; })[0];
        if (!sg) return;
        var k = Se.segl(sg, !!T.segl[id]);
        seddel = { type: "segl", id: id };
        saetSeddel(hoved(k.etiket, k.titel) + '<div class="seddel-krop">' + k.html + "</div>" +
            (k.brudt ? "" : '<div class="seddel-fod"><span></span><button type="button" class="knap hoved" id="seglknap">' + D.SEGL_TEKST.knap + "</button></div>"));
        fokus();
    }
    function normaliser(s) { return String(s || "").trim().toLowerCase().replace(/\s+/g, ""); }
    function brydSegl(id, svar) {
        var sg = D.SEGL.filter(function (x) { return x.id === id; })[0];
        if (!sg || T.segl[id]) return "brudt";
        var besked = el("seglbesked"), udfald;
        if (normaliser(svar) !== sg.svar) udfald = "forkert";
        else if (!sg.tjek() && NK.kanHuske()) udfald = "ikkeVundet";
        else udfald = "brudt";
        if (udfald === "brudt") {
            T.segl[id] = true;
            gem();
            opdater();
            aabnSegl(id);
        } else if (besked) {
            besked.textContent = udfald === "forkert" ? D.SEGL_TEKST.forkert : D.SEGL_TEKST.ikkeVundet(sg.spil);
            besked.className = "svar-linje fejl";
            ryst();
        }
        return udfald;
    }
    function aabnGuldDoer() {
        if (!alleSegl()) return;
        T.finale = true;
        gem();
        vis();
    }

    /* ----- Start og ny sag ----------------------------------------------- */
    function startSpil() { T.start = Date.now(); gem(); vis(); }
    function nySag(nr, udenSpoerg) {
        if (!udenSpoerg && T.start && !window.confirm("Start en ny sag med nye tal? Jeres fremskridt i denne sag forsvinder.")) return;
        T = nyTilstand(nr || nytNr());
        sag = NK.Sag.lav(T.sag);
        gem();
        vis();
    }

    /* ----- Haendelser ----------------------------------------------------- */
    function sporKlik(id) {
        var sk = skaerm();
        if (sk.type === "rum") aabnTing(sk.rum, id);
        else if (sk.type === "guld" && id.indexOf("segl-") === 0) aabnSegl(id.slice(5));
    }
    function bind() {
        var tegning = el("tegning");
        tegning.addEventListener("click", function (e) {
            var g = e.target.closest && e.target.closest(".spor");
            if (g) sporKlik(g.getAttribute("data-spor"));
        });
        tegning.addEventListener("keydown", function (e) {
            if (e.key !== "Enter" && e.key !== " ") return;
            var g = e.target.closest && e.target.closest(".spor");
            if (g) { e.preventDefault(); sporKlik(g.getAttribute("data-spor")); }
        });

        el("noegler").addEventListener("click", function (e) {
            var b = e.target.closest && e.target.closest("[data-rum]");
            if (!b || b.disabled) return;
            var n = Number(b.getAttribute("data-rum"));
            if (n === 6) { T.vist = null; T.vedGuld = true; }
            else T.vist = n < T.naaet ? n : null;
            gem();
            vis();
        });

        document.addEventListener("click", function (e) {
            var t = e.target;
            if (!t.closest) return;
            if (t.closest("#startknap")) return startSpil();
            if (t.closest("[data-nysag]")) return nySag();
            if (t.closest("[data-front]")) { T.vist = null; gem(); return vis(); }
            if (t.closest("#guldknap")) return aabnGuldDoer();
            if (t.closest("[data-tilguld]")) { T.vedGuld = true; gem(); return vis(); }
            var chip = t.closest(".chip[data-ting]");
            if (chip) { var sk = skaerm(); if (sk.type === "rum") aabnTing(sk.rum, chip.getAttribute("data-ting")); return; }
            var nk = t.closest("[data-noegle]");
            if (nk && !nk.disabled) { T.vist = Number(nk.getAttribute("data-noegle")); gem(); vis(); }
        });

        el("nysag").addEventListener("click", function () { nySag(); });

        var sd = el("seddel");
        sd.addEventListener("click", function (e) {
            var t = e.target, x;
            if (!t.closest) return;
            if (t.closest("[data-luk]")) return lukSeddel();
            if (t.closest("[data-handl]")) return udfoerHandling();
            if (t.closest("#hintknap")) return hintKlik();
            if (t.closest("#indsend")) return indsend();
            if ((x = t.closest("[data-gaatrin]"))) return aabnTrin(seddel.rum, Number(x.getAttribute("data-gaatrin")));
            if (t.closest("[data-tillaas]")) return aabnLaas(seddel.rum);
            if (t.closest("#laasop")) return laasOp();
            if (t.closest("[data-videre]")) return videre();
            if (t.closest("#seglknap")) return brydSegl(seddel.id, el("seglsvar").value);
            if ((x = t.closest("[data-broend]"))) return dryp(x.getAttribute("data-broend"));
            if ((x = t.closest("[data-stof]"))) return bland(Number(x.getAttribute("data-stof")));
            if ((x = t.closest("[data-valg]"))) {
                seddel.valg = x.getAttribute("data-valg");
                Array.prototype.forEach.call(sd.querySelectorAll("[data-valg]"), function (b) { b.classList.toggle("valgt", b === x); });
                return;
            }
            if ((x = t.closest("[data-z]"))) {
                seddel.valg = Number(x.getAttribute("data-z"));
                Array.prototype.forEach.call(sd.querySelectorAll("[data-z]"), function (b) { b.classList.toggle("valgt", b === x); });
                NK.saetTekst("ps-ni", seddel.valg === 28 ? D.PAASKEAEG_NI : "");
                return;
            }
            if ((x = t.closest("[data-emne]"))) {
                var id = x.getAttribute("data-emne");
                seddel.valg = seddel.valg || {};
                seddel.valg[id] = x.getAttribute("data-v") === "1";
                Array.prototype.forEach.call(sd.querySelectorAll('[data-emne="' + id + '"]'), function (b) { b.classList.toggle("valgt", b === x); });
            }
        });
        sd.addEventListener("input", cifferInput);
        sd.addEventListener("keydown", function (e) {
            cifferTast(e);
            if (e.key !== "Enter") return;
            if (e.target.id === "seglsvar") { brydSegl(seddel.id, e.target.value); e.preventDefault(); }
            else if (e.target.id === "svarfelt" || (e.target.classList && e.target.classList.contains("koef"))) { indsend(); e.preventDefault(); }
        });
        sd.addEventListener("paste", cifferIndsaet);
        sd.addEventListener("animationend", function () { sd.classList.remove("ryst"); });

        el("slor").addEventListener("click", function (e) { if (e.target === el("slor")) lukSeddel(); });

        el("hjaelpknap").addEventListener("click", function () { el("hjaelp").hidden = false; el("hjaelp-luk").focus(); });
        el("hjaelp-luk").addEventListener("click", function () { el("hjaelp").hidden = true; });
        el("hjaelp").addEventListener("click", function (e) { if (e.target === el("hjaelp")) el("hjaelp").hidden = true; });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                if (!el("hjaelp").hidden) el("hjaelp").hidden = true;
                else if (seddel) lukSeddel();
            } else if (e.key === "?" && !(e.target && /INPUT|TEXTAREA/.test(e.target.tagName))) {
                el("hjaelp").hidden = !el("hjaelp").hidden;
            }
        });
        document.addEventListener("visibilitychange", function () { if (!document.hidden) opdaterUr(); });
    }

    function hjaelp() {
        el("hjaelp-tekst").innerHTML = D.HJAELP.map(function (l) { return "<p>" + h(l) + "</p>"; }).join("");
    }

    indlaes();
    hjaelp();
    bind();
    vis();
    setInterval(opdaterUr, 1000);

    /* Til selvtesten */
    NK.app = {
        tilstand: function () { return T; },
        sag: function () { return sag; },
        seddel: function () { return seddel; },
        skaerm: skaerm, vis: vis, alleGuld: alleGuld, alleSegl: alleSegl, trinNr: trinNr,
        start: startSpil, nySag: nySag, aabnTing: aabnTing, aabnTrin: aabnTrin, aabnLaas: aabnLaas, aabnBonus: aabnBonus, aabnSegl: aabnSegl,
        handling: udfoerHandling, indsend: indsend, hint: hintKlik, dryp: dryp, bland: bland,
        skrivKode: skrivKode, laasOp: laasOp, videre: videre,
        brydSegl: brydSegl, aabnGuldDoer: aabnGuldDoer, luk: lukSeddel, bevis: bevis
    };
}());
