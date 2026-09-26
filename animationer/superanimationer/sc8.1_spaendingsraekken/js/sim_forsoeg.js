/* =====================================================================
   sim_forsoeg.js - fane 1: forsoeget

   Fem metalstænger staar i en holder, og seks glas staar paa bordet:
   fem med metalioner (Mg²⁺, Zn²⁺, Fe²⁺, Cu²⁺, Ag⁺) og ét med saltsyre
   (H⁺). Eleven traekker en stang ned i et glas (eller klikker paa
   stangen og saa paa glasset). Reagerer parret, saetter der sig metal
   paa stangen, farven skifter, eller der kommer bobler, og luppen viser
   elektronerne. Naar stangen har staaet i glasset lidt, staar forsoeget
   i skemaet i panelet (NK.Skema), som fane 2 ogsaa bruger.

   En stang, der kommer op, er pudset, og glasset faar frisk oploesning.
   Saa kan hvert forsoeg laves forfra uden oprydning.

   Maalene i panelet (D.MAAL) leder eleven gennem fire forsoeg med et
   spoergsmaal til hvert og til sidst resten af skemaet.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    var NOEGLE_ROS = "nk-sc8.1-ros-forsoeg";

    /* ----- Skemaet, som fane 1 fylder, og fane 2 laeser --------------------------------- */
    var Skema = {
        data: {},
        lyttere: [],
        ialt: D.STAENGER.length * D.GLAS.length - D.STAENGER.filter(function (m) { return D.GLAS.indexOf(m) >= 0; }).length,
        noegle: function (m, i) { return m + "/" + i; },
        get: function (m, i) { return this.data[this.noegle(m, i)]; },
        saet: function (m, i, v) {
            if (m === i) return;
            var n = this.noegle(m, i);
            if (this.data[n] === v) return;
            this.data[n] = v;
            this.lyttere.forEach(function (f) { f(); });
        },
        antal: function () { return Object.keys(this.data).length; },
        fuldt: function () { return this.antal() >= this.ialt; },
        /* Fylder resten ud med det, der ville ske */
        fyld: function () {
            var mig = this;
            D.STAENGER.forEach(function (m) {
                D.GLAS.forEach(function (i) {
                    if (m !== i && mig.get(m, i) === undefined) mig.data[mig.noegle(m, i)] = K.reagerer(m, i);
                });
            });
            this.lyttere.forEach(function (f) { f(); });
        },
        nulstil: function () {
            this.data = {};
            this.lyttere.forEach(function (f) { f(); });
        },
        /* Antal flueben i en raekke */
        reaktioner: function (m) {
            var mig = this;
            return D.GLAS.filter(function (i) { return mig.get(m, i) === true; }).length;
        }
    };
    NK.Skema = Skema;

    /* Skemaet som HTML. v.aktiv: [m, i] der fremhaeves, v.taelle: kolonne med flueben */
    NK.skemaHTML = function (v) {
        v = v || {};
        var h = '<table class="skematabel"><thead><tr><th class="hjoerne">stang</th>';
        D.GLAS.forEach(function (i) { h += "<th>" + K.ion(i) + "</th>"; });
        if (v.taelle) h += '<th class="ialt">✓</th>';
        h += "</tr></thead><tbody>";
        D.STAENGER.forEach(function (m) {
            h += '<tr><th><span class="prik" style="background:' + Tg.METAL[m][1] + '"></span>' + m + "</th>";
            D.GLAS.forEach(function (i) {
                var s = Skema.get(m, i), kl, t;
                if (m === i) { kl = "samme"; t = ""; }
                else if (s === true) { kl = "ja"; t = "✓"; }
                else if (s === false) { kl = "nej"; t = "–"; }
                else { kl = "tom"; t = ""; }
                if (v.aktiv && v.aktiv[0] === m && v.aktiv[1] === i) kl += " aktiv";
                h += '<td class="' + kl + '">' + t + "</td>";
            });
            if (v.taelle) h += '<td class="ialt">' + Skema.reaktioner(m) + "</td>";
            h += "</tr>";
        });
        return h + "</tbody></table>";
    };

    /* ----- Fanen ---------------------------------------------------------------------------- */
    function SimForsoeg() {
        this.L = new NK.Laerred(NK.el("fs-laerred"));
        this.tid = 0;
        this.lay = null;
        this.over = null;
        this.traek = null;
        this.valgt = -1;
        this.info = null;
        this.lup = new NK.Lup();
        this.lupGlas = D.GLAS.indexOf("Cu");
        this.lupNoegle = "";
        this.g = { kaffekop: { skjult: false, iHaand: false } };
        var mig = this;
        this.staenger = D.STAENGER.map(function (m, n) {
            return { metal: m, n: n, x: 0, top: 0, glas: -1, bane: [], fase: "hjemme", frø: Tg.frø(m) };
        });
        this.glas = D.GLAS.map(function (i) {
            return { ion: i, stang: null, tid: 0, x: 0, m: null, noteret: false, bobler: [], boble: 0 };
        });
        this.maalNr = 0;
        this.maalFase = "goer";
        this.hjaelp = 0;
        this.valgtSvar = -1;
        this.forkerte = {};
        Skema.lyttere.push(function () { mig.skemaAendret(); });
        this.bygPanel();
        this.bygTilbud();
        this.koblMus();
        if (this.laererStart) this.laererStart();
        this.visMaal();
        this.visSkema();
        this.visStatus();
    }

    var P = SimForsoeg.prototype;

    /* ----- Stængerne ------------------------------------------------------------------ */
    P.stangIGlas = function (gi) {
        var st = this.glas[gi].stang;
        return st && st.fase === "i" ? st : null;
    };

    P.hjemPos = function (st) {
        var lay = this.lay;
        return { x: lay.holder.huller[st.n], top: lay.holder.y + lay.stang.inde - lay.stang.l };
    };

    P.glasPos = function (gi) {
        var lay = this.lay, g = lay.glas[gi];
        var bund = g.bundY - lay.glasH * 0.07;
        return { x: g.cx, top: bund - lay.stang.l };
    };

    /* Hoejden, stangens top skal op i for at gaa fri af glassene */
    P.loeftTop = function () {
        var lay = this.lay;
        return lay.glas[0].top - lay.stang.l - 16;
    };

    P.baneTil = function (st, maal) {
        var lt = Math.min(st.top, this.loeftTop());
        st.bane = [{ x: st.x, top: lt }, { x: maal.x, top: lt }, { x: maal.x, top: maal.top }];
    };

    /* Stangen ned i glas gi */
    P.saetI = function (n, gi) {
        var st = this.staenger[n], g = this.glas[gi];
        if (this.afvisTilbud) this.afvisTilbud();
        this.valgt = -1;
        if (st.glas === gi) {
            this.baneTil(st, this.glasPos(gi));
            st.fase = "ned";
            return;
        }
        if (st.glas >= 0) this.forlad(st.glas);
        if (g.stang) this.hjem(g.stang.n);
        g.stang = st;
        g.tid = 0;
        g.x = 0;
        g.m = st.metal;
        g.noteret = false;
        g.bobler = [];
        st.glas = gi;
        st.fase = "ned";
        this.baneTil(st, this.glasPos(gi));
        this.lupGlas = gi;
        this.info = null;
    };

    /* Stangen hjem i holderen */
    P.hjem = function (n) {
        var st = this.staenger[n];
        st.fraGlas = st.glas;
        if (st.glas >= 0) this.forlad(st.glas);
        st.glas = -1;
        st.fase = "op";
        this.baneTil(st, this.hjemPos(st));
    };

    /* Glasset mister sin stang og faar frisk oploesning */
    P.forlad = function (gi) {
        var g = this.glas[gi];
        g.stang = null;
        g.tid = 0;
        g.noteret = false;
    };

    P.flytStang = function (st, dt) {
        if (st.fase === "traek" || !st.bane.length) return;
        var p = st.bane[0];
        var dx = p.x - st.x, dy = p.top - st.top, d = Math.sqrt(dx * dx + dy * dy);
        var skridt = Math.max(d * (1 - Math.exp(-12 * dt)), 520 * dt);
        if (skridt >= d) {
            st.x = p.x;
            st.top = p.top;
            st.bane.shift();
            if (!st.bane.length) st.fase = st.glas >= 0 ? "i" : "hjemme";
        } else {
            st.x += dx / d * skridt;
            st.top += dy / d * skridt;
        }
    };

    /* ----- Skemaet og maalene ------------------------------------------------------------ */
    P.skemaAendret = function () {
        this.visSkema();
        this.tjekMaal();
    };

    P.maal = function () { return D.MAAL[this.maalNr] || null; };

    P.maalNaaet = function (ma) {
        if (!ma) return false;
        if (ma.id === "skema") return Skema.fuldt();
        if (ma.stang) return Skema.get(ma.stang, ma.glas) !== undefined;
        return D.STAENGER.some(function (m) { return Skema.get(m, ma.glas) === true; });
    };

    P.tjekMaal = function () {
        var ma = this.maal();
        if (!ma || this.maalFase !== "goer" || !this.maalNaaet(ma)) return;
        if (this.afvisTilbud) this.afvisTilbud();
        var vist = this.hjaelp === 2;
        this.hjaelp = 0;
        if (ma.id === "skema") {
            this.maalFase = "faerdig";
            this.besked("Skemaet er fyldt ud. Brug det på fanen Rækken.", "god");
            if (!vist && !NK.hent(NOEGLE_ROS, false)) {
                NK.gem(NOEGLE_ROS, true);
                this.ventRos = 1.2;
            }
        } else {
            this.maalFase = "spm";
            this.valgtSvar = -1;
            this.forkerte = {};
            this.besked("", "");
        }
        this.visMaal();
    };

    P.vaelgSvar = function (n) {
        var ma = this.maal();
        if (!ma || this.maalFase !== "spm" || this.forkerte[n]) return;
        if (n === ma.rigtig) {
            this.valgtSvar = n;
            this.maalFase = "svar";
            this.besked((this.hjaelp < 2 ? "Rigtigt. " : "") + ma.efter, "god");
        } else {
            this.forkerte[n] = true;
            this.besked(ma.forkert[n], "skidt");
        }
        this.visMaal();
    };

    /* Knappen: Giv hint -> Vis svaret -> Naeste */
    P.knap = function () {
        var ma = this.maal();
        if (!ma) return;
        if (this.maalFase === "faerdig") {
            if (NK.visFane) NK.visFane("fane-raekken");
            return;
        }
        if (this.maalFase === "svar") {
            this.maalNr++;
            this.maalFase = "goer";
            this.hjaelp = 0;
            this.besked("", "");
            this.visMaal();
            this.tjekMaal();
            return;
        }
        if (this.hjaelp === 0) {
            this.hjaelp = 1;
            this.besked("<b>Hint:</b> " + NK.html(this.maalFase === "spm" ? ma.spmHint : ma.hint), "gul");
            this.visMaal();
            return;
        }
        /* Vis svaret */
        this.hjaelp = 2;
        if (this.maalFase === "spm") {
            this.vaelgSvar(ma.rigtig);
            return;
        }
        if (ma.id === "skema") {
            Skema.fyld();
            return;
        }
        var m = ma.stang || "Zn";
        this.besked("Stangen med " + m + " er sat i glasset med " + K.ion(ma.glas) + ".", "gul");
        this.saetI(D.STAENGER.indexOf(m), D.GLAS.indexOf(ma.glas));
        this.visMaal();
    };

    P.nulstil = function () {
        var mig = this;
        this.staenger.forEach(function (st) { if (st.glas >= 0 || st.fase !== "hjemme") mig.hjem(st.n); });
        this.glas.forEach(function (g) { g.x = 0; g.tid = 0; g.noteret = false; g.bobler = []; });
        this.maalNr = 0;
        this.maalFase = "goer";
        this.hjaelp = 0;
        this.valgt = -1;
        this.info = null;
        this.besked("", "");
        Skema.nulstil();
        this.visMaal();
    };

    /* ----- Panelet ----------------------------------------------------------------------- */
    P.bygPanel = function () {
        var mig = this;
        this.el = {
            knap: NK.el("fs-knap"),
            besked: NK.el("fs-besked"),
            kort: NK.el("fs-kort"),
            valg: NK.el("fs-valg")
        };
        this.el.knap.addEventListener("click", function () { mig.knap(); });
        NK.el("fs-spring").addEventListener("click", function () { mig.springIntro(); });
        NK.el("fs-nulstil").addEventListener("click", function () { mig.nulstil(); });
    };

    P.besked = function (html, klasse) {
        this.el.besked.innerHTML = html;
        this.el.besked.className = "besked" + (klasse ? " " + klasse : "");
    };

    P.visMaal = function () {
        var ma = this.maal(), mig = this;
        var fase = this.maalFase;
        NK.saetTekst("fs-taeller", ma && ma.id === "skema" ? Skema.antal() + "/" + Skema.ialt : "mål " + (this.maalNr + 1) + "/" + D.MAAL.length);
        NK.saetTekst("fs-prompt", !ma ? "" : (fase === "goer" || fase === "faerdig" ? ma.tekst : ma.spm));
        /* Svarene */
        var vaert = this.el.valg;
        vaert.innerHTML = "";
        if (ma && (fase === "spm" || fase === "svar")) {
            var rad = document.createElement("div");
            rad.className = "vaelgerrad lodret";
            ma.valg.forEach(function (tekst, n) {
                var b = document.createElement("button");
                b.type = "button";
                b.className = "vaelger";
                b.textContent = tekst;
                if (fase === "svar") {
                    if (n === ma.rigtig) b.className += " rigtig";
                    else if (mig.forkerte[n]) b.className += " forkert";
                    b.disabled = true;
                } else if (mig.forkerte[n]) {
                    b.className += " forkert";
                    b.disabled = true;
                }
                b.addEventListener("click", function () { mig.vaelgSvar(n); });
                rad.appendChild(b);
            });
            vaert.appendChild(rad);
        }
        var tekst, klasse = "knap";
        if (fase === "faerdig") { tekst = "Til rækken →"; klasse = "knap blaa banker"; }
        else if (fase === "svar") { tekst = "Næste →"; klasse = "knap blaa banker"; }
        else tekst = this.hjaelp === 0 ? "Giv hint" : "Vis svaret";
        if (fase === "goer" && this.hjaelp === 2) tekst = "Vis svaret";
        this.el.knap.textContent = tekst;
        this.el.knap.className = klasse;
        this.el.knap.disabled = fase === "goer" && this.hjaelp === 2 && ma && ma.id !== "skema";
        this.el.kort.classList.toggle("sejr", fase === "svar" || fase === "faerdig");
    };

    P.visSkema = function () {
        var st = this.lupGlas >= 0 ? this.stangIGlas(this.lupGlas) : null;
        NK.saetHTML("fs-skema", NK.skemaHTML({ aktiv: st ? [st.metal, this.glas[this.lupGlas].ion] : null }));
        NK.saetTekst("fs-antal", String(Skema.antal()));
        var ma = this.maal();
        if (ma && ma.id === "skema") NK.saetTekst("fs-taeller", Skema.antal() + "/" + Skema.ialt);
    };

    P.visStatus = function () {
        var t;
        if (this.info) t = this.info.tekst;
        else if (this.traek && this.traek.flyttet) t = "Slip stangen over et glas.";
        else if (this.valgt >= 0) t = "Klik på et glas, eller træk stangen derhen.";
        else {
            var gi = this.lupGlas, g = this.glas[gi], st = gi >= 0 ? this.stangIGlas(gi) : null;
            if (st && g.tid > 0.8) {
                if (st.metal === g.ion) t = "<b>" + st.metal + " i " + K.ion(g.ion) + ":</b> intet sker. Det er det samme metal.";
                else t = "<b>" + st.metal + " i " + K.ion(g.ion) + ":</b> " + D.iagttagelse(st.metal, g.ion) + ".";
            } else if (st) {
                t = "<b>" + st.metal + " i " + K.ion(g.ion) + "</b>";
            } else {
                t = "Træk en stang ned i et glas.";
            }
        }
        NK.saetHTML("fs-status", t);
    };

    /* ----- Layout ------------------------------------------------------------------------ */
    P.layout = function () {
        var W = this.L.b, H = this.L.h;
        var lay = { W: W, H: H };
        var kant = NK.klamp(W * 0.014, 8, 16);
        lay.bordY = Math.round(H - NK.klamp(H * 0.12, 44, 80));
        lay.kop = { x: kant + 22, y: lay.bordY };
        var x0 = kant + 58;
        var fri = W - kant - x0;
        /* Glassene og holderen deler bredden: glas 6 x (b / 0,9), holder 5 x 0,3 b + 24 */
        var gb = NK.klamp((fri - 40) / 8.17, 44, 150);
        /* Ikke hoejere, end at luppen kan vaere over dem */
        gb = Math.min(gb, (lay.bordY - 150) / 2.1);
        gb = Math.max(gb, 40);
        var glasH = gb * 1.2;
        lay.glasH = glasH;
        var sb = Math.max(9, gb * 0.15), sl = glasH * 1.32;
        lay.stang = { b: sb, l: sl, inde: 14 };
        var afst = Math.max(sb * 2, gb * 0.3);
        var hb = afst * 5 + 24;
        lay.holder = { x: x0, y: lay.bordY - 26, b: hb, h: 26, hul: sb * 0.62, huller: [] };
        for (var n = 0; n < 5; n++) lay.holder.huller.push(x0 + 12 + afst * (n + 0.5));
        var gx0 = x0 + hb + 16;
        var plads = (W - kant - gx0) / 6;
        lay.plads = plads;
        lay.glas = D.GLAS.map(function (i, k) {
            return Tg.glasMaal(gx0 + plads * (k + 0.5), lay.bordY, gb);
        });
        lay.skiltPx = NK.klamp(Math.round((H - lay.bordY - 20) / 2.4), 11, 15);
        /* Luppen: oeverst til hoejre, over stængerne og teksten under den
           (44 px). Den rykker helt op, naar der er plads ved siden af
           knapperne til praesentationen midt foroven. */
        var stangTop = Math.min(lay.holder.y + lay.stang.inde - sl, lay.glas[0].bundY - glasH * 0.07 - sl) - 24;
        var top = 64;
        var R = Math.min(W * 0.19, (stangTop - 44 - 14) / 2, 180);
        if (W / 2 + 185 < W - kant - 2 * R - 8) top = 14;
        else R = Math.min(R, (stangTop - 44 - 64) / 2);
        R = Math.max(R, 56);
        lay.lup = { cx: W - kant - R - 8, cy: top + R, R: R };
        lay.px = NK.klamp(W * 0.014, 12, 15);
        this.lay = lay;

        /* Stængerne paa plads efter et nyt layout */
        var mig = this;
        this.staenger.forEach(function (st) {
            var p = st.glas >= 0 ? mig.glasPos(st.glas) : mig.hjemPos(st);
            st.x = p.x;
            st.top = p.top;
            st.bane = [];
            st.fase = st.glas >= 0 ? "i" : "hjemme";
        });

        var h = lay.holder, gs = lay.glas;
        this.saetAnker("fs-anker-holder", h.x - 4, h.y + lay.stang.inde - sl - 26, h.b + 8, sl - lay.stang.inde + 26 + h.h + 4);
        this.saetAnker("fs-anker-glas", gs[0].x, gs[0].y - 4, gs[5].x + gs[5].b - gs[0].x, H - gs[0].y + 4);
        this.saetAnker("fs-anker-lup", lay.lup.cx - R - 4, lay.lup.cy - R - 4, 2 * R + 8, 2 * R + 8);
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

    /* ----- Opdater ------------------------------------------------------------------------- */
    P.opdater = function (dt) {
        var mig = this, lay = this.lay;
        this.tid += dt;
        this.staenger.forEach(function (st) { mig.flytStang(st, dt); });
        this.glas.forEach(function (g, gi) {
            var st = mig.stangIGlas(gi);
            if (st) {
                g.tid += dt;
                var reag = K.reagerer(st.metal, g.ion);
                if (reag) g.x = 0.75 * (1 - Math.exp(-g.tid / K.tau(st.metal, g.ion)));
                if (g.tid >= D.SYNLIG && !g.noteret) {
                    g.noteret = true;
                    Skema.saet(st.metal, g.ion, reag);
                }
                /* Bobler af hydrogen fra stangen */
                if (reag && K.STOF[g.ion].gas && lay) {
                    g.boble += dt * 60 / K.tau(st.metal, g.ion);
                    var gm = lay.glas[gi];
                    while (g.boble >= 1) {
                        g.boble -= 1;
                        var side = Math.random() < 0.5 ? -1 : 1;
                        g.bobler.push({
                            x: st.x + side * (lay.stang.b / 2 + 1.5), y: NK.r(gm.overflade + 8, st.top + lay.stang.l - 4),
                            r: NK.r(2, 4.4) * gm.k * 2, vy: -NK.r(40, 75) * gm.k * 2, a: 1
                        });
                    }
                }
            } else {
                g.x = NK.mod(g.x, 0, 3, dt);
                g.boble = 0;
            }
            if (lay) {
                var ov = lay.glas[gi].overflade;
                g.bobler.forEach(function (b) {
                    b.y += b.vy * dt;
                    b.x += Math.sin((b.y + b.x) * 0.2) * 6 * dt;
                    if (b.y < ov + 2) b.a -= dt * 6;
                });
                g.bobler = g.bobler.filter(function (b) { return b.a > 0; });
            }
        });
        /* Luppen foelger glasset, der er valgt */
        var gl = this.glas[this.lupGlas], sl = this.stangIGlas(this.lupGlas);
        var noegle = (sl ? sl.metal : "-") + "/" + gl.ion;
        if (noegle !== this.lupNoegle) {
            this.lupNoegle = noegle;
            this.lup.saet(sl ? sl.metal : null, gl.ion);
            this.visSkema();
        }
        this.lup.opdater(dt);
        if (this.info) {
            this.info.tid -= dt;
            if (this.info.tid <= 0) this.info = null;
        }
        if (this.ventRos > 0) {
            this.ventRos -= dt;
            if (this.ventRos <= 0 && this.laererReplik) this.laererReplik(D.ROS_FORSOEG, true);
        }
        this.visStatus();
        if (this.opdaterLaerer) this.opdaterLaerer(dt);
        this.opdaterIntro(dt);
    };

    /* ----- Tegn ----------------------------------------------------------------------------- */
    /* Skal stangen tegnes inde i glas gi (bag glasset og i vaesken)? Ogsaa
       paa det sidste stykke ned i glasset og det foerste stykke op. */
    P.iGlas = function (st, gi) {
        if (gi === undefined || gi < 0) return false;
        if (st.glas === gi && (st.fase === "i" || (st.fase === "ned" && st.bane.length <= 1))) return true;
        return st.fase === "op" && st.fraGlas === gi && st.bane.length === 3;
    };

    P.stangTegning = function (st) {
        var lay = this.lay, gi = st.glas, v = {
            x: st.x, top: st.top, b: lay.stang.b, l: lay.stang.l, metal: st.metal,
            px: NK.klamp(lay.px, 12, 14)
        };
        var over = this.over && this.over.slags === "stang" && this.over.n === st.n;
        v.lys = st.n === this.valgt || (this.traek && this.traek.n === st.n) ? 1 : (over ? 0.5 : 0);
        if (this.pegStaenger && st.glas < 0) v.lys = 0.6 + 0.4 * Math.sin(this.tid * 6);
        if (gi >= 0 && st.fase === "i") {
            var g = this.glas[gi], gm = lay.glas[gi];
            v.klemme = gm.top + 4;
            if (K.reagerer(st.metal, g.ion) && !K.STOF[g.ion].gas) {
                v.belaeg = { metal: g.ion, x: g.x / 0.75, fra: gm.overflade, frø: Tg.frø(st.metal + g.ion) };
            }
        }
        return v;
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay, mig = this;
        if (!lay) return;
        Tg.rum(ctx, lay.W, lay.H, lay.bordY + 12);
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.H);

        /* Keglen fra glasset til luppen */
        var gi = this.lupGlas, gm = lay.glas[gi], sl = this.stangIGlas(gi);
        var kx = sl ? sl.x - lay.stang.b / 2 - 2 : gm.cx, ky = (gm.overflade + gm.bundY) / 2;
        Tg.zoomKegle(ctx, kx, ky, lay.lup.cx, lay.lup.cy, lay.lup.R);

        /* Kaffen */
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand) {
            var kk = NK.klamp(lay.H / 600, 0.8, 1.3);
            NK.Sprites.tegn(ctx, "kaffekop", lay.kop.x - 18 * kk, lay.kop.y - 40 * kk, 42 * kk, 40 * kk);
        }

        /* Glassene med deres stænger */
        this.glas.forEach(function (g, n) {
            var m = lay.glas[n];
            var inde = mig.staenger.filter(function (s) { return mig.iGlas(s, n); });
            var r = g.m && K.reagerer(g.m, g.ion) ? K.reaktion(g.m, g.ion) : null;
            var lag = Tg.oplLag(g.ion, r ? g.m : null, g.x, r ? r.koef[0] / r.koef[1] : 0);
            var lys = 0;
            if (mig.traek && mig.traek.flyttet && mig.traek.maal === n) lys = 1;
            else if (mig.valgt >= 0 && mig.over && mig.over.slags === "glas" && mig.over.n === n) lys = 0.7;
            Tg.glas(ctx, m, lag, {
                lys: lys,
                inde: function (c) {
                    inde.forEach(function (s) { Tg.stang(c, mig.stangTegning(s)); });
                    if (g.bobler.length) Tg.bobler(c, g.bobler);
                }
            });
            var sk = Tg.glasSkilt(ctx, m.cx, lay.bordY + 16, K.ion(g.ion), K.saltFormel(g.ion), {
                px: lay.skiltPx, kant: n === mig.lupGlas ? "rgba(242, 197, 61, 0.8)" : null
            });
            m.skilt = sk;
        });

        /* Luppen */
        var titel = sl ? sl.metal + "-stangen i " + K.ion(this.glas[gi].ion) : "Glasset med " + K.ion(this.glas[gi].ion);
        this.lup.tegn(ctx, lay.lup.cx, lay.lup.cy, lay.lup.R, { titel: titel });

        /* Kemichael staar bag holderen, saa stængerne kan ses og gribes,
           mens han taler */
        if (this.laererTegnOver) this.laererTegnOver(ctx);

        /* Stængerne i holderen, saa holderen oven paa deres ender */
        this.staenger.forEach(function (st) {
            if (st.glas < 0 && st.fase === "hjemme") Tg.stang(ctx, mig.stangTegning(st));
        });
        Tg.holder(ctx, lay.holder);

        /* Stænger paa vej (loeftet, paa vej op eller ned) tegnes oeverst */
        this.staenger.forEach(function (st) {
            if (st.fase === "hjemme" || st.fase === "i") return;
            if (mig.iGlas(st, st.glas) || mig.iGlas(st, st.fraGlas)) return;
            Tg.stang(ctx, mig.stangTegning(st));
        });
    };

    /* ----- Musen --------------------------------------------------------------------------- */
    P.stangUnder = function (pt) {
        var lay = this.lay;
        for (var k = this.staenger.length - 1; k >= 0; k--) {
            var st = this.staenger[k];
            if (Math.abs(pt.x - st.x) <= lay.stang.b / 2 + 8 && pt.y >= st.top - 24 && pt.y <= st.top + lay.stang.l) return st;
        }
        return null;
    };

    P.glasUnder = function (pt) {
        var lay = this.lay;
        if (pt.y > lay.H) return -1;
        for (var n = 0; n < lay.glas.length; n++) {
            var g = lay.glas[n];
            if (Math.abs(pt.x - g.cx) <= lay.plads / 2 && pt.y >= g.y - lay.stang.l && pt.y <= lay.H) return n;
        }
        return -1;
    };

    P.hvadErUnder = function (pt) {
        var lay = this.lay;
        if (!lay) return null;
        /* Stængerne staar foran Kemichael */
        var st = this.stangUnder(pt);
        if (st) return { slags: "stang", n: st.n };
        if (this.laererUnder && this.laererUnder(pt.x, pt.y)) return { slags: "laerer" };
        var kop = this.g.kaffekop;
        if (!kop.skjult && !kop.iHaand && Math.abs(pt.x - lay.kop.x) < 30 && pt.y < lay.kop.y + 4 && pt.y > lay.kop.y - 60) return { slags: "kop" };
        var dx = pt.x - lay.lup.cx, dy = pt.y - lay.lup.cy;
        if (dx * dx + dy * dy <= lay.lup.R * lay.lup.R) return { slags: "lup" };
        var gi = this.glasUnder(pt);
        if (gi >= 0 && pt.y >= lay.glas[gi].y) return { slags: "glas", n: gi };
        return null;
    };

    P.koblMus = function () {
        var mig = this, c = this.L.canvas;
        c.addEventListener("pointerdown", function (e) {
            var pt = mig.L.punkt(e);
            var st = mig.stangUnder(pt);
            if (!st) return;
            mig.traek = { n: st.n, start: pt, dx: st.x - pt.x, dy: st.top - pt.y, flyttet: false, maal: -1 };
            try { c.setPointerCapture(e.pointerId); } catch (x) { /* ikke vigtigt */ }
        });
        c.addEventListener("pointermove", function (e) {
            var pt = mig.L.punkt(e);
            var t = mig.traek;
            if (t) {
                if (!t.flyttet && Math.abs(pt.x - t.start.x) + Math.abs(pt.y - t.start.y) > 6) {
                    t.flyttet = true;
                    var st0 = mig.staenger[t.n];
                    if (st0.glas >= 0) mig.forlad(st0.glas);
                    st0.glas = -1;
                    st0.fase = "traek";
                    st0.bane = [];
                    mig.valgt = -1;
                    if (mig.afvisTilbud) mig.afvisTilbud();
                }
                if (t.flyttet) {
                    var st = mig.staenger[t.n];
                    st.x = NK.klamp(pt.x + t.dx, 10, mig.lay.W - 10);
                    st.top = NK.klamp(pt.y + t.dy, 10, mig.lay.bordY - mig.lay.stang.l * 0.5);
                    t.maal = mig.glasUnder(pt);
                    c.style.cursor = "grabbing";
                }
                return;
            }
            mig.over = mig.hvadErUnder(pt);
            var s = mig.over && mig.over.slags;
            c.style.cursor = s === "stang" ? "grab" : (s ? "pointer" : "default");
        });
        c.addEventListener("pointerleave", function () { if (!mig.traek) { mig.over = null; c.style.cursor = "default"; } });
        c.addEventListener("pointercancel", function () {
            if (mig.traek && mig.traek.flyttet) mig.hjem(mig.traek.n);
            mig.traek = null;
        });
        c.addEventListener("pointerup", function (e) {
            var pt = mig.L.punkt(e);
            var t = mig.traek;
            mig.traek = null;
            if (t && t.flyttet) { mig.slip(t.n, pt); return; }
            if (t) { mig.klikStang(t.n); return; }
            mig.klik(pt);
        });
    };

    /* Stangen er sluppet i punktet pt */
    P.slip = function (n, pt) {
        var lay = this.lay;
        if (Math.abs(pt.x - lay.kop.x) < 40 && pt.y > lay.kop.y - 80 && pt.y < lay.kop.y + 20) {
            this.hjem(n);
            if (!this.aegVist && this.laererReplik) {
                this.aegVist = true;
                this.laererReplik(D.AEG_KAFFE, false);
            }
            return;
        }
        var gi = this.glasUnder(pt);
        if (gi >= 0) this.saetI(n, gi);
        else this.hjem(n);
    };

    P.klikStang = function (n) {
        var st = this.staenger[n];
        if (st.glas >= 0) {
            this.hjem(n);
            this.valgt = -1;
            return;
        }
        this.valgt = this.valgt === n ? -1 : n;
    };

    P.klik = function (pt) {
        if (this.laererIntroKlik && this.laererIntroKlik(pt.x, pt.y)) return;
        if (this.laererKlik && this.laererKlik(pt.x, pt.y)) return;
        var u = this.hvadErUnder(pt);
        if (!u) { this.valgt = -1; return; }
        if (u.slags === "kop" && this.klikKop) { this.klikKop(); return; }
        if (u.slags === "glas") {
            if (this.valgt >= 0) { this.saetI(this.valgt, u.n); return; }
            this.lupGlas = u.n;
            var i = this.glas[u.n].ion;
            this.info = {
                tekst: "Glasset med " + K.ion(i) + ": " + K.STOF[i].salt + ", " + K.saltFormel(i) +
                    (this.glas[u.n].stang ? ". Luppen viser det." : ". Træk en stang herned."),
                tid: 4
            };
            this.visSkema();
            return;
        }
        if (u.slags === "lup") {
            this.info = { tekst: "Luppen viser glasset med " + K.ion(this.glas[this.lupGlas].ion) + ". Klik på et andet glas for at se det.", tid: 4 };
        }
    };

    P.tast = function () { return false; };

    P.enter = function () {
        if (this.maalFase === "svar" || this.maalFase === "faerdig") this.knap();
    };

    /* ----- Kemichaels praesentation ------------------------------------------- */
    NK.Praesentation.kobl(P, { noegle: "nk-sc8.1-intro-forsoeg", tilbud: "fs-tilbud", spring: "fs-spring" });

    /* Mens han siger, hvad man goer, lyser stængerne i holderen */
    P.pegPaaFelt = function (til) { this.pegStaenger = til; };

    NK.SimForsoeg = SimForsoeg;
}());
