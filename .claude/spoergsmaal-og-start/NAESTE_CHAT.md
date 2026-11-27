# Til næste chat: gennemgangen af superanimationerne fortsætter

Niels 21. nov. 2026: "Når du færdig med disse rettelser, kunne jeg godt tænke mig at starte i en ny chat ... samler alt feedbacken til animationerne i et nyt genopfrisket regelsæt, og så kan vi prøve det af ved gennemgang af de øvrige animationer, som du havde udpeget til at skulle have en gennemgang."

**Start med at læse** `~/NK_hjemmeside/animationer/superanimationer/REGELSAET.md` (regelsættet) og `~/NK_hjemmeside/CLAUDE.md`.

## Det, der er gjort 21. nov. 2026

- **241 sprogforslag** (spørgsmål, der kan stå alene) sat ind i 72 animationer. Liste med numre: `ret/*.json` her i mappen. `python3 ret.py tilbage <nr>` sætter et nummer tilbage. Numrene er de samme som i oversigten i Dropbox/2026.2027, "Animationer - spørgsmål og trinvis start - 21. nov. 2026.html".
- **Spørgsmålet på egen linje** i alle animationer (`faelles/papirkort.js` og `.css`, klassen `sk-linje`).
- **Låste opgavetitler** i alle aktive animationer (regel i CLAUDE.md).
- **T1 `sc5.7_idealgasligningen`** (4 runder): trinvis start på Stemplet, rolige molekyler, intet panel (opgaverække øverst i scenen), betjening på apparaterne, klik-opfordringer kun når eleven skal klikke, formel med knapper og tal i kortet på Beregningen, zoomfejlen ved gas rettet. Opgaverne: `opgave_t1_runde2.md` til `runde4.md`.
- **T2 `sc6.2_formel_og_aktuel`** (5 runder): Blandinger begynder med "Klik på glas A ...", luppen med ioner med formlen inde, glas med etiketter, tavlen til højre uden indforståede overskrifter, svar i kortet på alle faner, panelet 300 px, krukken ved glasset, stiplet linje ved det gamle niveau, rumfanget aflæses uden sum. Opgaverne: `opgave_t2_runde2.md` til `runde5.md`.
- Intet er synkroniseret til kemiformler.dk. Selvtestenes stand før i dag: `basis.txt`.

## 21. nov. 2026, aften (ny chat)

- Niels sagde ja til forslagene til T3 (sb2.4) og T4 (sb5.2) og bad om, at fanernes øvrige fejl kom med.
- Nye regler i REGELSAET: Rækken øverst i scenen ved højst 10 opgaver og ellers et panel på 300 px (regel 3). Ingen voldsom, fed skrift (regel 30). Teorien er kort og rolig med en henvisning til Kemibogen (regel 31, `faelles/teori.css`). Niels: "de fleste animationer skal have en tur" (teorien findes i 75 animationer).

- Aftenen 21. nov.: T3 sb2.4 (4 runder) og T4 sb5.2 (4 runder) bygget om; regelsættet har nu regel 1-47 sorteret efter emne (numrene er faste id'er). sb5.2 venter evt. på Niels' egne billeder af apparaterne (`sb5.2_lambert_beer/SPRITES_BESTILLING.md`). Næste: T5 sc1.4_afstemning.
- Senere 21. nov.: sb2.4 runde 5 (⇌ og + i skemaets øverste række, rækken Ligevægt kun med tal ved Y = K, ingen rullebjælke, CO + H₂O ude: fane 1 har 5 mål, mål 5 "HBr: hvilken løsning?"); Niels: "Det ser godt ud." Regel 48-51 tilføjet. T5 sc1.4 bygges efter hans ja (opgaverække på fane 1, optælling under bakkerne med ✓ først efter Indsend svar, trinvis køkkensalt, titler på fane 2, teori-ark med link til C 1.4, fanerne "Afstem med kugler" og "Afstem uden kugler").
- T5 sc1.4 godkendt ("flot forbedring"), køkkensalt er en gennemgang med "Spring gennemgangen over" (regel 52). T6 sc2.1 fane 2 "Mættet opløsning" bygget efter hans ja (opgaverække, − og + på varmepladen, etiket på glasset, akse efter saltet, NaCl i opgave 1 og KNO₃ i 2-4, fri leg med seks salte bagefter); venter på hans feedback. Næste: T7 sc2.3_kemikalielageret.

## 22. nov. 2026

- T7 sc2.3 Lageret bygget efter Niels' ja: intet panel (reolen er opgavelisten), feltet på kortet, spørgsmål der kan stå alene, tre svar på hver hyldes første glas, displayet peger ingen steder hen, ionens navn ved kuglen, Øv glasset igen og Sæt alle glas tilbage i scenen, intet præsentationstilbud, fakta-linjer med grundled (ret/t7.json). Niels: "Afvig helt sikkert fra reglen i forhold til reolen!" (undtagelse ved regel 17). Godkendt af Niels; den lille skærm (svære navne på øverste hylde ved 1100 x 760) er ok. Idé til senere (Niels 22. nov.: "lidt mere gamification til del 2 med rullebåndet", highscore og hurtigere og hurtigere): samlebåndet HAR allerede rekord (huskes i browseren) og bliver 12 % hurtigere pr. niveau efter niveau 4 (NIVEAUER i js/sim_baand.js), men det mærkes nok ikke nok. Forslag at vise ham: hurtigere fra start, stime-bonus, rekorden synlig under spillet, evt. fælles top 10 for klassen. Bygget 22. nov. eftermiddag efter Niels' ønske (fast takt, niveau 13 Umenneskeligt hurtigt med robotbesked, tal på kortet, ark med top 10, Apps Script i `.claude/highscore/`); adressen til Apps Scriptet er sat ind og virker (`ADRESSE` i `js/topliste.js`); venter på hans feedback. Næste: T8 sc3.3_polaere_molekyler.

- T8 sc3.3 fane 1 "Elektronegativitet" bygget efter Niels' ja ("Tror du rammer ret godt essensen. Begynd gerne"): intet panel, seks opgaver i fast rækkefølge efter bogens eksempler (H−Cl, H−C, Na−Cl, to byg-opgaver, mest polær af fire), periodisk system og tavle i scenen, ΔEN-skalaen under kortet, felt til ΔEN, klik-trin med boble, lyst teori-ark med link til C 3.3 og 3.4. Se README'en i mappen. Venter på hans feedback. Fane 2 og 3 har stadig panel. Niels: "Første fane er den bedste. Den er helt fejlfri." Samme dag rettet: fane 2 uden langsom drejning fra start, periodisk system som figur, beregninger foldet ind, ny forkert svarmulighed; fane 3 uden heptan-skiltet og med tydeligere lup (δ+ og δ−, ethanol som CH₃ CH₂ O H). Regel 53-56 nye. Samme aften regel 57 (mission først, Fri leg-knap under Start forfra, ingen illusion om vælg selv): fane 2 starter i opgave 1 med menuen skjult, fane 1 og 2 har knappen Fri leg. Rødt kryds på kortet i fri leg. Niels: "great succes" (T8 godkendt 22. nov.). Overvej regel 57 i de andre animationer (spørg Niels). Næste: T9 sc4.1_kogepunkt.

- T9 sc4.1 fane 1 "Varm op" bygget efter Niels' ja ("Ja det er cool. Det gør du bare"): intet panel, fem opgaver i rækken (Pentan koger, Gasserne på hylden, Længere kæder, Gæt decan, Stearinlyset) efter C 4.1, hylden og kurven som stiplede pladser til de bruges, kurven på lyst papir til højre, termometeret uden håndtag under spørgsmål, bobler ved termometer, glas og gæt, tændstik og pause kun i fri leg, intet præsentationstilbud, roligere gas, methan i stedet for metan (ret/t9.json), lyst teori-ark. Motoren er `js/varm_opgaver.js`. Selvtest ALT OK; zoomvinduet måles nu mod midten under kortet, og fane 1 testes fra 1000 × 640. Runde T9b samme aften efter Niels' feedback ("Godt arbejde"): Kemichael klar og præcis (regel 58), slutkortet og knappen videre virker, fane 2 hedder Forgrenede kæder, hylden med skarpe glas med prop, stativ og navne (regel 59). Venter på feedback. Næste: T10 sc4.5_fedtstoffer fane 2 Køleskabet.

- T10 sc4.5 fane 2 bygget efter Niels' ja ("Det lyder godt. Du cooker bare :)"): fanen hedder Fast eller flydende? (`#koele` virker), intet panel, syv opgaver i rækken (smør i køleskabet, smør på bordet, olivenolie, solsikkeolie, hørfrøolie i fryseren, kakaosmør i solen, smør mod olie), gæt og så træk selv glasset derhen, glassene kommer på bordet ét ad gangen, vinduet og varedeklarationen som stiplede pladser til de bruges, varedeklarationen på et lyst ark med kæder i fedtsyrernes farver i stedet for en farveforklaring, roligere vindue (8 molekyler, halv fart, mere skub), "lige kæder" som i C 4.6 (ret/t10.json), lyst teori-ark med link til C 4.6, intet præsentationstilbud på fane 2. Motoren er `js/koele_opgaver.js` (kopi af T9's). Sprogforslag nr. 37 (det gamle køleskabsspørgsmål i sim_koele.js) er afløst af T10 og kan ikke sættes tilbage med ret.py. Selvtest ALT OK (fane 2's layout testes fra 860 px). Runde T10b samme dag efter Niels' feedback ("opgraderingerne er ok.. men nu er der pludselig mange spørgsmål"): fire opgaver med smør, olivenolie og solsikkeolie, alle i køleskabet (fast, delvist fast, flydende), kakaosmør og hørfrøolie kun i fri leg; vinduet tegnet om som fortegnet figur (glycerol-hoved og tykke glatte haler, knæk på 40°, højst tre farver som varedeklarationen), større vindue (26 × 21 enheder, 5 molekyler). Regel 60 (fortegnet mikrofigur, højst tre farver) og 61 (ikke for mange spørgsmål) nye. Runde T10c samme aften: Niels afviste den fortegnede figur ("Det er jo kemi, så jeg foretrækker nok alligevel strukturformler"), så vinduet har zigzag-strukturformler igen i én lys farve med tykke turkise dobbeltbindinger med glorie, og smør i køleskabet er helt fast (alle molekyler i rækker). Regel 60 skrevet om, regel 62 ny (mikrofiguren viser tilstanden entydigt). Niels om T10c: "det er bedre.. men ... det ligner et stankelben, der bliver udsat for dyreplageri", overvejer at skrotte fane 2. Sidste forsøg: et stillbillede i bogens kuglestil (`stillbillede_t10_fedt.html` her i mappen, lavet med `fk_zigzag`/`fk_h` fra Kemibogens `vaerktoej/lav_figurer.py`; smør som tæt dobbeltlag, solsikkeolie som løse, krumme molekyler uden fri bevægelse). Niels: "Jotak Prøv at bygge dette". Runde T10d bygget samme aften: kuglemodellerne i vinduet på et lyst kort, faste pladser (dobbeltlag for fast, løst for flydende, rolige overgange), regel 60 omskrevet og 63 ny (store molekyler flyver ikke rundt). Runde T10e samme aften: fejlen med tre glas i køleskabet rettet, intet gæt mere (træk glasset ind, se molekylerne skifte, forklar bagefter), tre opgaver (smør, solsikkeolie, olivenolie), delvist fast med mindst to i krystallen; regel 64 ny (gør først, forklar bagefter). Niels: "Fint nok.. Jeg synes det er okay nu" men ønskede større tæthed i det faste. Runde T10f: krystallen pakket ekstra tæt og vinduet 600 × 420 enheder, så det faste er en kompakt blok og det flydende spredt; regel 62 udvidet. Til sidst slutkortet uden grøn knap og med opfordring til fri leg. Niels: "Men derudover så er animationen færdig." T10 godkendt. Næste: T11 sc4.7_alkoholer_og_syrer fane 3.
- 27. nov. 2026 (morgen): T11 sc4.7 fane 3 "I vand" bygget som første udkast efter Niels' "Du må nu gerne gå direkte i gang med T11 og lave første udkast" (intet forslag først). Intet panel, tre opgaver i rækken (Alkoholer i vand, En syre i to lag, Glycerol i vand) med Start forfra og Fri leg, luppen og tommelfingerreglen som stiplede pladser, til de bruges, lys lup med større kugler og kegle fra glasset, pladen viser kun det, der kan bruges, butan-1-ol får en besked om grænsen. Ny fil `js/sim_vand.js`, motoren `js/vand_opgaver.js` (kopi af T10's med trinet "indsend"). Selvtest ALT OK (184). Detaljer i sc4.7's README under "Runde T11". Noterne til Niels ligger i Dropbox ("Claude-noter 27. nov. 2026 - T11 sc4.7 I vand.txt"). Ingen nye regler i REGELSAET. Venter på feedback. Næste: T12 sc5.6_maengdeberegning fane 1.
- 27. nov. 2026 (formiddag, arbejdscomputeren): T12 sc5.6 fane 1 bygget som første udkast efter Niels' "Kan du begynde på T12 (også selvom vi ikke er helt færdige med T11?)". Fanen hedder Fra gram til gram (#vej virker), intet panel, tre opgaver i rækken (Jern og svovl med tre svar pr. trin, Mere jern med formlen blandt tre knapper og tallet i et felt i kortet, Aluminium brænder med et trin om den nye reaktion først), spørgsmålet følger feltet, skemaet viser ? med gul ramme, ord over symbolerne i rækkerne, pilene · 1/M og · M med brøkstreg (også fane 2-3), beregningen på et lyst ark til højre, reaktionspilen og vægten til højre dukker op, når de bruges, fri leg med de fire reaktioner og Nye tal i rækken, teori-ark med link til C 5.5, jern(II)sulfid som i bogen (ret/t12.json). Ny fil js/vej_opgaver.js (motoren fra T11 med trinene valg og regn). Selvtest ALT OK (146). Detaljer i sc5.6's README under "Runde T12", noterne til Niels i Dropbox ("Claude-noter 27. nov. 2026 - T12 sc5.6 Fra gram til gram.txt"). Ingen nye regler. Venter på feedback. Næste: T13 sc5.8_natron fane 1 Forsøget.

## Det, der venter: trinfanerne T3-T43

Forslagene står i `g01.json` til `g10.json` (feltet `start`) og i oversigten i Dropbox. De blev skrevet før regelsættet, så de skal læses med regelsættets øjne (fx er svar i panelet og "Klik"-bobler under et spørgsmål nu fejl i sig selv).

| T | Prio | Animation | Fane |
|---|---|---|---|
| T3 | 1 | sb2.4_ligevaegtsberegninger | 1 Beholderen |
| T4 | 1 | sb5.2_lambert_beer | 1 Lyset |
| T5 | 2 | sc1.4_afstemning | 1 Kuglerne |
| T6 | 2 | sc2.1_salt_i_vand | 2 Hvor meget kan der være? |
| T7 | 2 | sc2.3_kemikalielageret | 1 Lageret |
| T8 | 2 | sc3.3_polaere_molekyler | 1 Elektronegativitet |
| T9 | 2 | sc4.1_kogepunkt | 1 Varm op |
| T10 | 2 | sc4.5_fedtstoffer | 2 Køleskabet |
| T11 | 2 | sc4.7_alkoholer_og_syrer | 3 I vand (for meget) |
| T12 | 2 | sc5.6_maengdeberegning | 1 Vejen |
| T13 | 2 | sc5.8_natron | 1 Forsøget |
| T14 | 2 | sc6.1_koncentration | 1 Karret |
| T15 | 2 | sc6.1_koncentration | 2 c eller n? |
| T16 | 2 | sc6.1_koncentration | 4 Fortynding |
| T17 | 2 | sc6.2_formel_og_aktuel | 1 Opløsningen (delvist gjort i T2: krukken, svar i kortet) |
| T18 | 2 | sc6.3_mohrtitrering | 1 Titreringen |
| T19 | 2 | sc7.2_ph_skalaen | 3 Fortyndingen |
| T20 | 2 | sc8.7_korrosion | 1 Rørene |
| T21 | 2 | sc8.7_korrosion | 2 Skibet |
| T22 | 2 | sb1.1_reaktionshastighed | 2 Sammenstød |
| T23 | 2 | sb1.1_reaktionshastighed | 3 Hastighedsudtryk |
| T24 | 2 | sb1.4_thiosulfat | 1 Krydset |
| T25 | 2 | sb1.4_thiosulfat | 2 Koncentration |
| T26 | 2 | sb2.2_ikke_ligevaegt_og_indgreb | 1 Indgreb |
| T27 | 2 | sb4.4_oxidation_af_alkoholer | 1 Oxidationstallet |
| T28 | 2 | sb5.1_absorptionsspektre | 1 Farven |
| T29 | 2 | sb5.3_spektrofotometri | 3 To farvestoffer |
| T30 | 2 | sb6.2_titreringssimulator | 4 Ukendt prøve |
| T31 | 2 | sb8.4_log_p_og_log_d | 1 Log P |
| T32 | 3 | sc2.1_salt_i_vand | 1 Opløsningen |
| T33 | 3 | sc4.7_alkoholer_og_syrer | 2 Kogepunktet |
| T34 | 3 | sc5.10_lightergas | 2 Beregningen |
| T35 | 3 | sc6.2_formel_og_aktuel | 2 Ionerne (delvist gjort i T2: svar i kortet, tavlen) |
| T36 | 3 | sc7.1_syrebasereaktioner | 2 Produkterne |
| T37 | 3 | sc7.2_ph_skalaen | 2 Luppen |
| T38 | 3 | sc8.2_spaendingsraekken | 1 Forsøget |
| T39 | 3 | sc8.7_korrosion | 3 Rusten |
| T40 | 3 | sb3.1_navngivning | 1 Tegn molekylet |
| T41 | 3 | sb4.5_organisk_syntese | Fabrikken |
| T42 | 3 | sb7.7_aminosyrer | 3 Det elektriske felt |
| T43 | 3 | sb8.4_log_p_og_log_d | 2 Log D og pH |

## Andet, gennemgangen fandt, som ikke er rettet

- Opgaver, der kan løses ved at klikke, til tallet passer: sc6.1 Karret, sb5.1 Byg farven, skaltallet i sc1.1's spil, sc4.5 Køleskabet; sb8.6 har Rf-formlen i panelet, mens kortet spørger om den; sc4.6 har Indsend klar fra start med "ingen".
- Kemichaels boble "Start præsentation / Nej tak" midt i scenen og hen over etiketter: sb1.1, sb1.4, sc1.2, sc2.4, sc4.5, sc5.1 (også sc3.4 og sc6.3).
- sb2.4 fane 1 sætter spørgsmålet uden om `NK.Papir.tekst` (tages med T3). sc5.3's gæt lægger indledningen for sig i `kort.js`.
- I sc6.2 går keglen fra glasset til luppen hen over hjørnet af søjlediagrammet på Opløsningen.
- Stiplede pladser med navn (regel 13) og låste titler (regel 17) kan stride mod hinanden: I sb6.5 viser tavlens stiplede pladser navnene på de kommende trin ("Ligningen", "Løsningen", "pH"). Spørg Niels, om pladserne skal være uden navn.
- Spørgsmålet om skalaen i luppen og om panelet skal væk i alle animationer (som i sc5.7) er ikke afgjort for andre end sc5.7.

## Hvordan Niels vil arbejde

Han vil prøve regelsættet af på de øvrige animationer. Foreslå en rækkefølge (prioritet 1 først: T3 sb2.4 og T4 sb5.2), vis forslaget kort, byg efter hans ja, og vis animationen gennem en lokal server på en ny port. Han giver feedback runde for runde, og det, han siger "husk det" om, skrives i CLAUDE.md og i regelsættet.
