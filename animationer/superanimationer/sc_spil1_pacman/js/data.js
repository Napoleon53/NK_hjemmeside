/* =====================================================================
   data.js - labyrinten, svaerhedsgraderne og Kemichaels replikker

   Svaer har de samme tal som den gamle c_spil_pacman_emner.html, som
   brugeren balancerede i september 2026. Let og Mellem blev 3. okt.
   2026 gjort langsommere og mere tilgivende paa brugerens oenske.
   Tallene skal ikke rettes uden brugerens ja. Tider staar i
   millisekunder. Det, der i den gamle stod som antal billeder, er
   regnet om ved 60 billeder i sekundet (300 billeder = 5 s, 120
   billeder = 2 s).

   Opgaverne staar i js/emner.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data = NK.Data || {};

    /* 0 gang, 1 mur, 2 til 5 de fire svarrum (de to oeverste 4 x 4
       felter, de to nederste 4 x 5) */
    D.KORT = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,2,2,2,1,0,0,0,1,0,0,0,1,3,3,3,3,1],
        [1,2,2,2,2,1,0,1,0,1,0,1,0,1,3,3,3,3,1],
        [1,2,2,2,2,0,0,1,0,0,0,1,0,0,3,3,3,3,1],
        [1,2,2,2,2,1,0,1,1,1,1,1,0,1,3,3,3,3,1],
        [1,1,0,1,1,1,0,0,0,0,0,0,0,1,1,1,0,1,1],
        [1,0,0,0,0,0,0,1,1,0,1,1,0,0,0,0,0,0,1],
        [1,1,0,1,1,1,0,1,0,0,0,1,0,1,1,1,0,1,1],
        [1,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,1],
        [1,4,4,4,4,1,0,0,0,0,0,0,0,1,5,5,5,5,1],
        [1,4,4,4,4,1,0,1,1,1,1,1,0,1,5,5,5,5,1],
        [1,4,4,4,4,0,0,1,0,0,0,1,0,0,5,5,5,5,1],
        [1,4,4,4,4,1,0,1,0,1,0,1,0,1,5,5,5,5,1],
        [1,4,4,4,4,1,0,0,0,1,0,0,0,1,5,5,5,5,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];
    D.RAEKKER = D.KORT.length;
    D.KOLONNER = D.KORT[0].length;

    /* Her starter spilleren, og hertil vender den tilbage efter et mistet liv */
    D.START = { x: 9, y: 6 };

    /* Svarrummenes farver fra den gamle udgave */
    D.RUM = {
        2: { farve: "#e056fd" },
        3: { farve: "#f0932b" },
        4: { farve: "#22a6b3" },
        5: { farve: "#badc58" }
    };
    D.RUM_ORDEN = [2, 3, 4, 5];

    /* ----- Svaerhedsgraderne ----------------------------------------------
       sovMs        saa laenge sover spoegelserne, naar en opgave starter,
                    og efter et mistet liv
       trinMs       saa lang tid gaar der mellem hvert af spoegelsernes
                    skridt
       nye          der kommer et nyt spoegelse hvert D.NYT_SPOEGELSE_MS
       tilfaeldigt  saa stor en del af skridtene gaar en tilfaeldig vej i
                    stedet for mod spilleren
       fredetMs     fredet tid lige efter et mistet liv
       pauser       saa mange gange maa spillet saettes paa pause i ét
                    spil (Infinity: saa tit man vil)
       Hastigheden er regnet i rigtig tid, ikke i billeder, saa den er den
       samme paa alle skaerme. Foer 3. okt. 2026 var Let 5000 / 667 og
       Mellem 3000 / 417, begge med 0,25 og 2000 som Svaer. */
    D.SVAERHED = {
        let:    { navn: "Let",    sovMs: 6000, trinMs: 800, nye: false, tilfaeldigt: 0.4,  fredetMs: 4000, pauser: Infinity },
        mellem: { navn: "Mellem", sovMs: 4000, trinMs: 500, nye: false, tilfaeldigt: 0.33, fredetMs: 3000, pauser: 1 },
        svaer:  { navn: "Svær",   sovMs: 2500, trinMs: 313, nye: true,  tilfaeldigt: 0.25, fredetMs: 2000, pauser: 1 }
    };
    D.SVAERHED_ORDEN = ["let", "mellem", "svaer"];

    D.LIV = 3;

    /* De foerste fire opgaver har ét spoegelse, resten to. Efter et
       mistet liv er der altid kun ét. */
    D.TO_SPOEGELSER_FRA = 4;

    /* Hvor spoegelserne dukker op, i den raekkefoelge de kommer. De to
       sidste staar i en mur: spoegelser kan gaa igennem den ene gang. */
    D.SPOEGELSE_START = [{ x: 1, y: 6 }, { x: 17, y: 6 }, { x: 9, y: 1 }, { x: 9, y: 13 }];
    D.SPOEGELSE_FARVER = ["#ff4757", "#ff6b81", "#ff9f43", "#a29bfe"];
    D.NYT_SPOEGELSE_MS = 5000;

    /* Skjoldet, der ligger ét sted i labyrinten i hver opgave */
    D.SKJOLD_MS = 5000;

    /* ----- Musikken ---------------------------------------------------------
       Én lydfil pr. svaerhedsgrad; en svaerhedsgrad uden linje har ingen
       musik (Let og Mellem venter paa deres egne sange).
       fil      lydfilen: et loop klippet med musik/kilde/byg_loop.py
       start    saa mange sekunder inde i filen begynder loopet
       laengde  loopets laengde i sekunder. Filen fortsaetter lidt laengere
                med en kopi af loopets begyndelse, saa springet tilbage
                ikke kan hoeres (js/lyd.js).
       styrke   lydstyrken fra 0 til 1 */
    D.MUSIK = {
        svaer: { fil: "musik/svaer.mp3", start: 0.5, laengde: 73.1127, styrke: 0.4 }
    };

    /* Mix: saa mange opgaver fra hvert af de andre emner */
    D.MIX_PR_EMNE = 3;

    /* Seglet til escaperoommet (c_spil8_escaperoom.html, "Segl 3 · Pacman
       Quiz"). Svaret dér er "labyrintmester". Ret ikke navnene uden at
       rette escaperoommet med. */
    D.MESTER = {
        emne: "mix",
        svaerhed: "svaer",
        titel: "Labyrintmester",
        tekst: "På sværeste niveau i Mix er du hermed kåret til Labyrintmester."
    };

    /* ----- Tekster ------------------------------------------------------- */
    D.BESKED = {
        forkertRum: "Forkert rum",
        fanget: "Fanget af et spøgelse",
        nytSpoegelse: "Nyt spøgelse",
        skjold: "Skjold i 5 s",
        pauseBrugt: "Pausen er brugt i dette spil"
    };

    /* Linjen under labyrinten: hvad man goer nu */
    D.GUIDE = {
        tast: "Piletasterne flytter dig ét felt. Løb ind i rummet med det rigtige svar.",
        touch: "Pilene flytter dig ét felt. Løb ind i rummet med det rigtige svar.",
        forkert: "Prøv et af de andre rum.",
        skjold: "Den gule mønt giver et skjold i 5 s.",
        pause: "Spillet står stille. Tryk på Fortsæt eller P, når du er klar.",
        pauseSidste: "Spillet står stille. Det er din eneste pause i dette spil. Tryk på Fortsæt eller P."
    };

    /* Pauseknappen i toplinjen */
    D.PAUSE = {
        knap: "Pause",
        fortsaet: "Fortsæt",
        skilt: "Pause",
        tast: "Pause (P)"
    };

    /* Lydknappen i toplinjen (kun paa svaerhedsgrader med musik) */
    D.LYD = { til: "Musik fra (M)", fra: "Musik til (M)" };

    /* Kemichaels praesentation af startskaermen: hoejst ca. 60 tegn pr.
       linje og ingen teori. Linjen i INTRO_PEG siger han, mens han peger
       paa valgene. */
    D.INTRO = {
        start: [
            "Velkommen til labyrinten. Jeg venter herude.",
            "Vælg sværhedsgrad og emne. Løb så ind i det rigtige rum.",
            "Spøgelserne kan ikke kemi. De kan til gengæld løbe."
        ]
    };
    D.INTRO_PEG = 1;

    /* Han kommer forbi, naar nogen bliver Labyrintmester */
    D.MESTER_REPLIK = [
        "Labyrintmester. Spøgelserne har søgt om orlov.",
        "Labyrintmester. Det skriver jeg i protokollen.",
        "Labyrintmester. Spøgelserne vil have en omkamp."
    ];
}());
