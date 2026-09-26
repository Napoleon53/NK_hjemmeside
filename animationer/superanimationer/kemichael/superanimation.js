/* =====================================================================
   superanimation.js - Kemichael i superanimationerne

   Figuren staar i ../../v2/kemichael/kemichael.js, som er frosset og
   ikke rettes. Denne fil laegger sig oven paa den i alle superanimationer
   og indlaeses lige efter den:

     <script src="../../v2/kemichael/kemichael.js"></script>
     <script src="../kemichael/superanimation.js"></script>

   Her er han en, man helst undgaar: han siger ikke noget uopfordret og
   kommer kun, naar noget kalder paa ham (praesentationen, et maal, der
   er naaet, et paaskeaeg, et prik eller hans kaffe). Derfor:

     * Intet baggrundsliv. Han kommer ikke forbi med en kasse eller
       kigger ind, fordi eleven ikke har roert noget i et stykke tid.
     * Kaffen (KAFFE) er skiftet ud: de forloeb, der var soegte, er
       vaek, og der er kommet nye til. Han passer paa sin kop.
     * Svarene paa et prik og replikken, naar han gaar, er kortere.

   Brugerens oenske 25. sept. 2026. Nye kaffeforloeb skrives her, ikke
   i den frosne fil. Formatet for en post (h.sig, h.drik, h.vip ...)
   staar over KAFFE i kemichael.js.
   ===================================================================== */
(function () {
    "use strict";

    var K = window.NK && window.NK.Kemichael;
    if (!K) return;

    /* Ingen besoeg, fordi eleven har ventet */
    K.baggrundsliv(false);

    /* ----- Kaffen --------------------------------------------------------
       Klik paa koppen. En post vises ad gangen og gentages foerst, naar
       de alle er set (huskes i browseren). */
    var KAFFE = [
        {
            id: "kold",
            sig: "Det er min kaffe.",
            midte: function (h) {
                return h.drik().concat(
                    h.udtryk({ vrede: 0.2, humoer: -0.3, roed: 0 }), h.vent(0.4), h.suk(1.1),
                    h.sig(h.glimt("kaffeKold") || "Kold. Som altid.")
                );
            }
        },
        {
            id: "varm",
            sig: "Det er min kaffe.",
            midte: function (h) {
                return h.drik().concat(
                    h.udtryk({ vrede: 0.9, humoer: -0.7, roed: 1 }), h.damp(1.6), h.vent(0.9),
                    h.sig("Den var varm. Det sker én gang om året."),
                    h.udtryk({ roed: 0.2 })
                );
            }
        },
        {
            id: "tom",
            midte: function (h) {
                return h.vip(-2.4, 0.7).concat(
                    h.vent(1.1), h.udtryk({ humoer: -0.8, skeptisk: 0.8, briller: 1 }), h.vip(0, 0.4),
                    h.sig("Tom. Og jeg har ikke drukket den."),
                    h.udtryk({ skeptisk: 0, briller: 0 })
                );
            }
        },
        {
            id: "ud",
            sig: "Der drikkes ikke i laboratoriet.",
            midte: function (h) {
                return h.gaa(-40).concat(
                    h.drik(true), h.udtryk({ vrede: 0.1, humoer: 0.6, roed: 0 }),
                    h.sig(h.glimt("kaffePause") || "Uden for døren er det en pause.")
                );
            }
        },
        {
            id: "stirrer",
            griber: false,
            beholder: true,
            midte: function (h) {
                return h.udtryk({ vrede: 0.6, humoer: -0.5, briller: 1, laen: 0.7 }).concat(
                    h.vent(2.4), h.sig("Ja."), h.vent(0.3),
                    h.udtryk({ briller: 0, laen: 0 })
                );
            }
        },
        {
            id: "glasstav",
            midte: function (h) {
                return h.drik().concat(
                    h.udtryk({ vrede: 0.7, humoer: -0.6, skeptisk: 1, briller: 1 }), h.vent(0.5),
                    h.sig("Nogen har rørt i den med en glasstav."),
                    h.udtryk({ skeptisk: 0, briller: 0 })
                );
            }
        },
        {
            id: "ligevaegt",
            midte: function (h) {
                return h.drik().concat(
                    h.vent(0.4), h.sig("Rumtemperatur. Det er også en ligevægt.")
                );
            }
        },
        {
            id: "regnskab",
            krav: function (tal) { return tal >= 3; },
            sig: "Igen.",
            midte: function (h) {
                return h.vent(0.4).concat(
                    h.sig("Det er kop nummer " + h.tal + " i regnskabet."), h.drik()
                );
            }
        },
        {
            id: "sprut",
            midte: function (h) {
                return h.drik().concat(
                    h.udtryk({ vrede: 1, humoer: -0.9, roed: 0.8 }), h.sprut(14), h.vent(0.6),
                    h.sig("Den har stået siden i morges."), h.udtryk({ roed: 0.2 })
                );
            }
        },
        {
            id: "kaktus",
            sig: "Resten får Bunsen.",
            midte: function (h) {
                return h.vip(-1.9, 0.6).concat(
                    h.sprut(10, true), h.vent(0.7), h.vip(0, 0.4),
                    h.sig(h.glimt("kaktus") || "Han er en kaktus. Han kan tåle det.")
                );
            }
        },
        {
            id: "kittel",
            midte: function (h) {
                return h.drik().concat(
                    h.sprut(8, true), h.udtryk({ vrede: 0.8, humoer: -0.9, roed: 0.4 }), h.suk(1.2),
                    h.sig(h.glimt("kittel") || "Der er kaffe på kitlen. Igen.")
                );
            }
        },
        {
            id: "gave",
            midte: function (h) {
                return h.vent(0.6).concat(
                    h.udtryk({ vrede: 0.2, humoer: 0.3 }),
                    h.sig(h.glimt("gave") || "Koppen var en gave. Den blev her."),
                    h.drik()
                );
            }
        },
        {
            id: "tavs",
            midte: function (h) {
                return h.udtryk({ vrede: 0.8, humoer: -0.7, skeptisk: 1 }).concat(
                    h.vent(1.4), h.udtryk({ skeptisk: 0 })
                );
            }
        },
        {
            id: "loeber",
            loeb: true,
            sig: "Nej.",
            midte: function (h) {
                return h.vent(0.3);
            }
        },
        {
            id: "tilbud",
            sig: "Vil du smage?",
            midte: function (h) {
                return h.vent(0.7).concat(
                    h.udtryk({ vrede: 0.7, humoer: -0.6 }), h.sig("Nej. Det vil du ikke."), h.drik()
                );
            }
        },
        {
            id: "maalt",
            midte: function (h) {
                return [{ arm: -0.75, tid: 0.6 }].concat(
                    h.udtryk({ briller: 1, skeptisk: 0.6 }), h.vent(0.8),
                    h.sig("Der mangler 20 mL. Jeg målte den i morges."),
                    h.udtryk({ briller: 0, skeptisk: 0 })
                );
            }
        },
        /* Nye 25. sept. 2026 */
        {
            id: "fortyndet",
            midte: function (h) {
                return h.drik().concat(
                    h.udtryk({ vrede: 0.6, humoer: -0.5, skeptisk: 1, briller: 1 }), h.vent(0.6),
                    h.sig("Nogen har fortyndet den."),
                    h.udtryk({ skeptisk: 0, briller: 0 })
                );
            }
        },
        {
            id: "fingeraftryk",
            midte: function (h) {
                return [{ arm: -0.75, tid: 0.6 }].concat(
                    h.udtryk({ vrede: 0.5, skeptisk: 0.8, briller: 1 }), h.vent(1),
                    h.sig("Fingeraftryk. Den skal til analyse."),
                    h.udtryk({ skeptisk: 0, briller: 0 })
                );
            }
        },
        {
            id: "bundfald",
            midte: function (h) {
                return h.vip(-0.7, 0.5).concat(
                    h.udtryk({ briller: 1 }), h.vent(0.9), h.vip(0, 0.3), h.drik(),
                    h.sig("Der er bundfald i. Det er der altid."),
                    h.udtryk({ briller: 0 })
                );
            }
        },
        {
            id: "stinkskab",
            midte: function (h) {
                return h.udtryk({ vrede: 0.5, skeptisk: 0.6 }).concat(
                    h.vent(0.3), h.sig("Den står i stinkskabet fra nu af."),
                    h.udtryk({ skeptisk: 0 })
                );
            }
        },
        {
            id: "faremaerke",
            griber: false,
            beholder: true,
            midte: function (h) {
                return h.udtryk({ vrede: 0.5, humoer: -0.4, briller: 1 }).concat(
                    h.vent(0.8), h.sig("Den skal have et faremærke."),
                    h.udtryk({ briller: 0 })
                );
            }
        },
        {
            id: "navn",
            midte: function (h) {
                return [{ arm: -0.75, tid: 0.6 }].concat(
                    h.udtryk({ vrede: 0.2, humoer: 0.3, briller: 1 }), h.vent(0.4),
                    h.sig("Der står mit navn på. BEDSTE LÆRER."),
                    h.udtryk({ briller: 0 })
                );
            }
        },
        {
            /* Han tager den og gaar. Ingen ord. */
            id: "tager",
            midte: function (h) {
                return h.udtryk({ vrede: 0.6, humoer: -0.5, skeptisk: 0.7, briller: 1 }).concat(
                    h.vent(1.2), h.udtryk({ skeptisk: 0, briller: 0 })
                );
            }
        }
    ];
    K.KAFFE.length = 0;
    Array.prototype.push.apply(K.KAFFE, KAFFE);

    /* ----- Prik og farvel ----------------------------------------------- */
    var R = K.REPLIKKER;
    R.prik1 = [
        "Ja?",
        "Hvad er der?",
        "Mm.",
        "Jeg står lige midt i noget.",
        "Det er ikke en knap.",
        "Var der noget fagligt?",
        "Spørg din sidemand."
    ];
    R.prik2 = [
        "Jeg har travlt.",
        "Ja. Stadig mig.",
        "Opgaven står derovre.",
        "Prøv at prikke til opgaven i stedet.",
        "Jeg har 28 elever. Du er lige nu alle 28.",
        "To gange. Det er én mere, end der skulle til.",
        "Jeg er ikke en dørklokke."
    ];
    R.prik3 = [
        "Lad være med det.",
        "Nu stopper du.",
        "Jeg tæller også det her.",
        "Tre gange er en tendens.",
        "Der er en grænse. Den er tæt på.",
        "Jeg skriver det ikke ned. Jeg husker det."
    ];
    R.prik4 = [
        "Nej.",
        "Så er det nok.",
        "Færdig.",
        "Det står i regnskabet.",
        "Fjerde gang. Jeg går om lidt.",
        "Jeg har set det før. Det blev ikke sjovere."
    ];
    R.gaaUd = [
        "Nu går jeg.",
        "Jeg er i forberedelsen.",
        "Jeg går. Rør ikke kaffen.",
        "Jeg er på lærerværelset. Der prikker ingen."
    ];

    /* Dagsformen om morgenen: den ene prik-replik var soegt */
    K.DAGSFORM.forEach(function (d) {
        if (d.id === "morgen" && d.ekstra && d.ekstra.prik) {
            d.ekstra.prik = [
                "Klokken er ikke otte. Det er kaffen, der taler.",
                "Før klokken otte svarer jeg kun på brandalarmen."
            ];
        }
    });
}());
