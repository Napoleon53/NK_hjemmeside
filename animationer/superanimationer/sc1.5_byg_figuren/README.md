# sc1.5 Byg figuren: fagord til kapitel 1

Ny 28. okt. 2026, bygget fra bunden. I menuen Byg figuren (`kemi-c-filer/samling_c_bygfiguren.html`, knappen "byg" i
animationspanelet) som nr. 1 fra 2. nov. 2026 (`?emne=c1.byg`).
Fra 1. nov. 2026 stod den som nr. 5 i `samling_c1.html`; dagen efter fik alle
kapitlerne deres eget panel (brugeren: "så kan man nemt finde fra det ene kapitel til
det andet kapitel").

Brugeren bad om en sjette måde at træne fagord på ved siden af de fem på
Kemibogens fagordlister (Quiz: fem hurtige, Speedtalk, Krydsord, Kort og godt,
Quizlet). Af tre forslag valgte han "Byg figuren": "wauuv byg figuren er en vild
ide. Det kunne jeg godt tænke mig at se for kapitel c1. Begynd gerne at bygge den
som en superanimation".

## Bestillingen

1. **Pointen i én sætning.** Et fagord får mening, når det sidder på det, det
   betegner: eleven sætter ordet på figuren, den del af figuren bliver bygget, og
   forklaringen fra bogen står frem.
2. **Hvad den afløser.** Intet. Figurerne efterligner bogens figurer (atommodel,
   grundstofkort, isotoper, stofinddeling, periodesystem-metaller, chlor-skaller,
   reaktionsskema-vand, vand-formel), så eleven genkender dem.
3. **Naboerne.** `sc1.1_atombygger` ejer at bygge atomer og ioner, `sc1.2` navne og
   symboler, `sc1.4_afstemning` afstemningen. Her bygger eleven ikke selv, men
   sætter ord på. Fagordlisterne i bogen ejer de andre fem aktiviteter.
4. **Loftet.** Fire faner, én pr. afsnit (1.1 til 1.4), med én figur hver. Tre lag
   pr. figur med 2 til 5 fagord. I den svære udgave står alle fagordene på én gang
   (9 til 12). 40 af de 41 fagord fra bogens fagordliste til kapitel 1 er
   med; model er taget ud (se nedenfor). 1.1 har to lag, de andre tre.
5. **Layoutet.** Scene plus panel. Kortet øverst midt i scenen har opgaven, bakken
   med fagord, beskeden, Giv et hint og Indsend svar. Figuren står på et lyst ark
   under kortet. Panelet har lagene, fagordene, der sidder på plads, og Byg forfra.

## Sådan virker den

- Figuren kommer frem lag for lag: lagets dele står uden farver (grå), de senere
  lag er skjult. Pladserne til lagets fagord står gule, og det, hver plads handler
  om, har et gult felt om sig:
  hele ringen ved skal, de syv elektroner ved valenselektroner, hele kortet ved
  skalmodel, rækken ved periode. Feltet bliver kraftigere, når musen eller et ord
  er over pladsen. En plads, der er titel på et kort (rent stof, grundstof,
  kemisk forbindelse, skalmodel), har ingen streg og prik. Ingen prik må kunne
  forveksles med en anden: den sidder ved sit eget gule felt og ikke på en ring,
  et felt eller en trappe, som en anden plads handler om. Eleven trækker ordene fra bakken op på pladserne (eller klikker
  på ordet og så på pladsen) og trykker **Indsend svar**. Et ord kan trækkes fra
  en plads til en anden; så bytter de.
- Rigtige ord bliver låst, og den del af figuren får farve med en kort
  animation (protonerne tælles, skallerne fyldes, metallerne farves, pilen tegnes).
  Forkerte ord ryger tilbage i bakken, og beskeden forklarer den første fejl. Er
  fejlen typisk, står der en særlig tekst (`fejl` ved pladsen i `js/fig_*.js`);
  ellers står ordets forklaring fra bogen.
- Er laget løst, bliver kortet grønt med forklaringerne til lagets fagord (første
  sætning, som brikken i Kort og godt) og knappen Næste lag.
- Nogle lag har ét fagord i overskud (`ekstra`), fx nukleontal i laget med
  atomnummeret. Kortet siger det.
- Giv et hint viser forklaringen til ordet på én plads (den bliver orange); Vis
  svaret sætter ordet på. En stjerne pr. lag kræver rigtigt i første forsøg uden
  hint.
- Når det sidste lag er løst, er figuren færdig: konfetti, en stjerne på fanen, og
  næste fane kalder.
- **Svær udgave** (kontakten øverst i panelet, 2. nov. 2026): alle fagord på én gang.
  Hele figuren står uden farver fra start, og en del får farve, når ordet sidder.
  Kontakten gælder alle faner, og figurerne begynder forfra, når den slås til eller
  fra. Den afløste Mesterprøven, som kom efter lagene, fordi brugeren og andre syntes,
  at den "virkede lidt underlig at lave, når man lige havde taget dem alle".
- Peger man på et ord, der sidder på plads (i figuren eller panelet), kommer hele
  forklaringen fra bogen frem.
- Ét og samme ord kan passe på to pladser: ædelgasreglen og oktetreglen er to navne
  for samme regel og peger begge på argons yderste skal.
- Lagene i panelet kan klikkes: de lag, der ligger før, bygges færdige.
- `index.html#atomet` (eller `#hvad`, `#skaller`, `#skema`, `#1.3`) åbner en fane.
  Tasterne 1 til 4 skifter fane, Enter er Indsend svar eller Næste.

## Filerne

| Fil | Indhold |
|:--|:--|
| `js/data.js` | forklaringerne (ordret fra `NK_Undervisning/Kemibogen/fagord/kapitel-1.qmd` 27. okt. 2026) og de fire faner |
| `js/motor.js` | en fane: pladser, bakke, træk og klik, Indsend svar, hjælp, kortet, panelet |
| `js/svg.js` | tegnehjælp: kugler med lys, tekst med sænkede tal, animationer |
| `js/ps.js` | det periodiske system med bogens inddeling og trappen |
| `js/fig_hvad.js`, `fig_atom.js`, `fig_skal.js`, `fig_skema.js` | figurerne, lagene, pladserne og fejlteksterne |
| `js/app.js` | fanerne, links og tastatur |
| `_selvtest.html` | åbnes direkte fra disken; ALT OK (1049) 1. nov. 2026 |

**Rettes en forklaring i bogens fagordliste, skal den rettes i `js/data.js`.**
Selvtesten tjekker, at alle fagord undtagen dem i `NK.UDELADT` sidder på netop én plads, at pladserne ikke
overlapper og er inden for arket, at hvert lag og den svære udgave kan løses, at et
forkert ord kommer tilbage i bakken, at hjælpen virker, og at teksterne er korte.

## Valg og forenklinger

- Brugerens første indtryk 1. nov. 2026: "meget sej, men også lidt svær", især
  fordi figuren var stiplet ("man gør det for meget i blinde"), og fordi en
  uforstående elev ikke kunne se, om en streg pegede på skallen eller på en
  valenselektron. Derfor står figuren der fra start uden farver (en grå udgave af
  den færdige tegning, `.del .spoeg` i stilarket), og hver plads har sit gule felt
  (`omr`). Fagordet model er taget ud ("lidt skørt at sætte hen til et
  vandmolekyle"), og kugle-pind-modellen med det; det står i `NK.UDELADT`. 1.1's
  to første lag blev derfor lagt sammen. Anden runde samme dag: prikken fra
  skalmodel lå på yderste skal ("uheldigt ... sørg gerne for at der ikke kommer
  tvetydige punkter, som ligner et af de andre"), pilen mellem før og efter i 1.4
  var buet ("lidt underligt"), og figuren skal afsløres lag for lag "som før".
  Rettet: titelpladser uden prik, prikkerne flyttet væk fra bordet, trappen og
  ringene, periode peger på rækken i hullet midt i det periodiske system,
  ædelgasreglen og oktetreglen peger på et mærke med 8 ved argon i stedet for på
  skallen, og pilen er lige. Selvtesten tjekker, at ingen to prikker ligger oven i
  hinanden, og at hver prik ligger ved sit eget gule felt. Tredje runde: ordet i
  overskud i 1.4's første lag var reaktionsskema, men "den tegnede udgave er jo
  faktisk også en slags reaktionsskema"; nu er det koefficient.
- Figurerne er SVG og ikke canvas som i de andre superanimationer: ordene skal
  kunne trækkes hen på pladser, og figuren skal være skarp i alle størrelser. Der
  er ingen tegneløkke; når et lag er bygget, står alt stille.
- Alle pladser i en figur er lige brede, så længden ikke afslører ordet.
- Carbonatomet i 1.2 har 6 protoner, 6 neutroner og 6 elektroner; atommassen
  12,01 u. Elektronerne står på to ringe som i bogens atommodel.
- Rækkefølgen af lagene og hvilke ord der er i overskud, er Claudes valg.
- Ingen Kemichael, ingen rundvisning bag ? endnu, ingen teoriknap (forklaringerne
  kommer med hint, fejl og det grønne kort).

## Opskrift: Byg figuren til et nyt kapitel

Brugeren 1. nov. 2026: "Det er en hel vanvittig sej måde at repetere på !! I love
it!" og "Håber du får skrevet noterne ned til hvordan det skal sættes op.. for du
kommer til at gøre det en del gange". Reglerne nedenfor er dem, brugeren har sat
gennem to runder rettelser. Følg dem, også når et nyt kapitel frister til andet.

**Før der tegnes**

1. Hent fagordene og forklaringerne fra bogens fagordliste
   (`NK_Undervisning/Kemibogen/fagord/kapitel-N.qmd`, B- og A-bogen i `b/fagord/`
   og `a/fagord/`) med et lille script, så de er ordrette. De lægges i `js/data.js`.
2. Én fane pr. afsnit, én figur pr. fane i bogens stil: find afsnittets figurer i
   `Kemibogen/figurer/` og efterlign dem, så eleven genkender dem.
3. Gå fagordene igennem ét for ét: hvad i figuren er ordet? Et fagord, der ikke
   naturligt sidder på noget (som model på et vandmolekyle), tages ud og skrives i
   `NK.UDELADT` med begrundelsen. Spørg brugeren, hvis der er flere end et par.
4. Del fagordene i 2 til 4 lag med 2 til 6 ord, i den rækkefølge figuren naturligt
   bygges. Den svære udgave med alle ord på én gang kommer af sig selv. Med 3 til 4
   fagord er ét lag nok (2.1 Ioner).

**Pladserne**

- Hver plads har et gult felt (`omr`) om **hele** det, den handler om: hele
  ringen, alle elektronerne i yderste skal, hele rækken, hele kortet. Ikke en prik
  på et punkt.
- Prikken (`maal`) ligger ved sit eget gule felt og **aldrig** på noget, en anden
  plads handler om: ikke på en skal, et felt i det periodiske system, trappen,
  bordet eller en anden elektron. Er der et tomt sted at pege på (hullet midt i det
  periodiske system), så brug det.
- En plads, der navngiver et helt kort (rent stof, skalmodel), sidder som titel på
  kortet med `titel: true` og har ingen streg og prik.
- To navne for samme ting (ædelgasreglen og oktetreglen, salt og ionforbindelse)
  er et par: `par: "<andet id>"` på den første plads, og `x` er parrets midte.
  Motoren sætter boksene side om side med "eller" imellem og én fælles klamme og
  streg til noget eget (mærket med 8, skålen med salt). Brugeren 1. nov. 2026: man
  skal kunne fornemme, "at begge løsninger er accepteret".
- Mange ting af samme slags (ionerne i 2.2) får hvert sit kort med et navneskilt
  under (`titel: true` med skiltet på kortets underkant). Kortet skal være højt nok
  til, at skiltet ikke dækker formlen.
- Ord i overskud (`ekstra`) må aldrig kunne forsvares som rigtige. Brugeren
  afviste reaktionsskema ved den tegnede reaktion: "den tegnede udgave er en slags
  reaktionsskema". Brug en typisk elevfejl, der er tydeligt forkert (koefficient
  ved H₂O, nukleontal ved atomnummeret), eller intet ord i overskud.
- `fejl`: en særlig tekst for de ombytninger, elever faktisk laver. Den siger, hvad
  ordet betyder, og hvad eleven kan se ved pladsen, uden at afsløre svaret. Højst
  140 tegn.

**Træk og klik** (fælles i motoren, intet at gøre pr. kapitel)

- Ord kan trækkes eller klikkes: et klik på et ord giver det en kraftig gul ring,
  de gule pladser lyser op, pladsen under musen viser ordet svagt, og kortet siger,
  hvad der er valgt (brugeren 1. nov. 2026: "en meget tydelig ring om det man har
  klikket"). Esc fjerner valget.
- Tekst kan ikke markeres, og et ord, der slippes op til 30 px fra en plads,
  rammer den nærmeste (brugeren: "jeg ender hele tiden at markere teksten").

**Tegningen**

- `fuld()` tegner delen færdig med farver; den grå udgave laves af sig selv. Figuren
  afsløres lag for lag: lagets dele står grå, senere lag er skjult, og en del får
  farve, når ordet sidder. Tegn ikke separate stiplede spøgelser.
- `byg()` lægger kun animationen på (pop, tegn stregen, tæl protonerne). Intet
  bevæger sig, når laget er bygget.
- Hold figuren enkel og som i bogen: ingen buede pile, ingen ting, der kun er der for
  at have noget at pege på.
- Alle pladser er lige brede (bredden måles efter det længste ord), så der skal være
  plads til dem; skriften er bredere på Linux end på Windows.

**Kontrol, før brugeren ser den**

- `_selvtest.html` skal være grøn. Den tjekker blandt andet, at ingen to prikker
  ligger oven i hinanden, og at hver prik ligger ved sit eget felt.
- Tag skærmbilleder af hvert lag og af **den svære udgave** (`b.saetAlt(true)`),
  hvor alle prikker står samtidig. Se dem som en elev, der ikke kan stoffet: kan en
  streg læses på to måder?
- Prøv med en rigtig mus (træk, klik og byt) og på en lav skærm (1280 × 720).

**Filerne til et nyt kapitel**

Kapitler, der er lavet: 1 (sc1.5), 2 (sc2.7), 3 (sc3.6), 4 (sc4.9), 5 (sc5.13) og 6 (sc6.4). Et kapitel med
mange formler kan have sin egen tegnehjælp (`js/org.js` i sc4.9). En ny mappe `scN.x_byg_figuren`
(eller `sbN.x_...`) som kopi af denne, nummeret efter kapitlets menu. `svg.js`,
`motor.js`, `ps.js`, `app.js` og stilarket kan tages, som de er. Ret `js/data.js`
(forklaringerne, `UDELADT` og `NK.FANER`), skriv en `js/fig_<id>.js` pr. afsnit og
ret script-linjerne i `index.html` og `_selvtest.html` (`ps.js` kun, hvis kapitlet
bruger det periodiske system). Sæt `NK.KAPITEL` og `NK.ANTAL_FAGORD` i `data.js`, og
skriv hævede og sænkede tal fra bogens liste som tegn (Na⁺, NO₃⁻); kapitel 2's
data.js er lavet med et lille script. I figurerne skrives formler med `_` og `^`
("NO_3^−", "Fe^2+"). Nye kuglefarver lægges i `SV.KUGLER` i `svg.js`. `svg.js`,
`motor.js`, `app.js`, stilarket og selvtestens logik er fælles: rettes noget i dem,
kopieres filen til alle kapitlernes mapper, og alle selvtests køres (kapitel 3
lagde den grønne elektron `gron` til i `svg.js`).

Et ord fra et tidligere kapitel, som figuren bruger til sammenligning (ionforbindelse
ved siden af molekyle i 3.1), tegnes som et gråt skilt i samme størrelse som
pladserne, så eleven kan se, hvad pladsen ved siden af spørger om.

Gentagelse er tilladt (brugeren 1. nov. 2026: "der må gerne være lidt repeterende
øvelser"). Et ord fra et tidligere kapitel kan være en plads igen: læg det i
`NK.TIDLIGERE` i `data.js` med forklaringen fra det kapitels fagordliste (ionbinding i
sc3.6). Et ord, der står på mere end én figur, skrives i `NK.GENTAGET` (mættet i sc4.9
ved både alkaner og stearinsyre). Selvtesten tæller ikke ordene i `NK.TIDLIGERE` med i
`ANTAL_FAGORD`. To navne for det samme (elektronparbinding og fælles elektronpar) er
et par, ikke en overskrift og en plads: brugeren fandt det forvirrende, da
elektronparbinding stod som overskrift over kortet med Cl₂.

**I menuen** kommer et nyt kapitel som knap i Byg figurens eget panel,
`kemi-c-filer/samling_c_bygfiguren.html` (2. nov. 2026), med `data-emne="cN.byg"`, og
som linje under 'Byg figuren' i `FEEDBACK_EMNER` i `samling_alt.html`. `samling_alt.html`
sender alle koder, der ender på `.byg`, til panelet. Ikke i kapitlernes egne menuer: én
plads pr. animation. På Kemibogens fagordliste skrives mappen i `BYG_FIGUREN` i
`NK_Undervisning/Kemibogen/stil/fagord.html`, så kapitlet får flisen Byg figuren.

**Fejl rettet 2. nov. 2026:** et ord, der blev trukket lidt og sluppet på sin egen
plads, forsvandt fra pladsen, til næste ord blev sat på (`placer` tegnede ikke
pladsen igen). Selvtesten tjekker det nu.

## Ikke lavet

- Udskrift af figuren som noteark (tom og med facit).
- Kapitel 7 og 8. Motoren kan bruges igen: en ny figur er en ny `fig_*.js`.
- Den svære udgave kan ikke vælges med et link.
