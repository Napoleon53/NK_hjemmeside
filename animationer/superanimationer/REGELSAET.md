# Regelsættet for superanimationerne

Al Niels' feedback til animationerne samlet ét sted, så den kan genbruges, før den næste animation bygges eller bygges om. Første udgave 21. nov. 2026 efter `sb2.6` (Rumfang og fortynding), `sc5.7` (Idealgasligningen, T1) og `sc6.2` (Formel og aktuel koncentration, T2). Udvidet samme aften efter `sb2.4` (Ligevægtsberegninger, T3) og `sb5.2` (Lambert-Beers lov, T4), regel 48-51 efter runde 4 af `sb2.4`.

Det gælder, når en superanimation bygges, bygges om eller gennemgås. README'ens "Fælles krav" og `~/NK_hjemmeside/CLAUDE.md` gælder stadig. Hvor de siger noget andet, vinder dette regelsæt.

**Numrene er faste.** Animationernes README'er henviser til dem ("regel 19a"). En ny regel får næste ledige nummer og sættes ind under sit emne, så numrene ikke står i rækkefølge. Når Niels giver ny feedback, der gælder mere end én animation, skrives den her med hans ord og dato.

Målgruppen er den svage elev på 16-18 år, der klikker, før den læser. Hver regel er en måde at undgå, at den elev mister tråden.

## 1. Eleven kigger to steder

1. **Kortet** øverst i midten stiller spørgsmålet og har svarene. **Scenen** viser det, spørgsmålet handler om, og der dukker svaret op. Der er ikke flere steder at kigge.
2. **Svar og betjening står aldrig i panelet.** Svarfelter og svarknapper står i kortet. Skydere, knapper og kontakter til forsøget sidder på apparaterne i scenen (varmepladens − og +, klik på et lod, gasflaskens hane, en lås ved stemplet, − og + ved kuvetten).
3. **Panelet falder bort, når fanen har højst 10 opgaver.** Opgaverne står så i en smal række øverst i scenen med nummer og et tema på to-tre ord og "↺ Start forfra" yderst til højre (mønster: `sc5.7`). Har fanen flere end 10 opgaver, står listen i et panel på 300 px, som kun har opgavelisten (mønster: `sc6.2`). (Niels 21. nov. 2026: "øverste række op til 8-10 opgaver, og derefter sidepanel".)
4. **Kortet har en fast plads.** Scenen må aldrig zoome, hoppe eller skifte størrelse, fordi kortet skifter, en besked kommer, eller noget dukker op. Den skifter kun med vinduet. (Fejlen i `sc5.7` runde 2: en kort besked gjorde kortet en linje højere, og hele scenen blev mindre ved hvert klik.)
47. **Alt kan nås uden at zoome ud.** Knapper som "Vis grafen" står inden for scenen og kan ses og klikkes i 1100 x 760, 1400 x 860 og 1920 x 1080. (Niels om `sb2.4`: "Man kan kun folde grafen ud, hvis man zoomer ud.")

## 2. Spørgsmålet

5. **Det halvfede spørgsmål kan stå alene.** Testen: Dæk den almindelige skrift til. Kan eleven forstå og besvare det halvfede? Betingelsen (hvilket glas, før eller efter, hvilken størrelse) står i spørgsmålet, ikke kun i indledningen. Intet "det", "den" eller "stoffet" uden at sige hvilket.
5a. **Slå indledningen og spørgsmålet sammen, når det kan lade sig gøre.** "Hvad bliver absorbansen (A), når koncentrationen fordobles fra 0,20 mM til 0,40 mM?" og ikke "Ved 0,20 mM er A = 0,490." over "Hvad bliver A, når koncentrationen fordobles til 0,40 mM?". En indledning står kun, når spørgsmålet ellers bliver for langt. Tal, der står på etiketter i scenen, gentages ikke i en indledning. (Niels 21. nov. 2026 om `sb5.2`: "Hvis man kan slå spørgsmålet sammen med beskrivelsen, så er det at foretrække.")
6. **Spørgsmålet står på sin egen linje** under en eventuel kort indledning i almindelig skrift (`faelles/papirkort.js` gør det selv, når teksten er "Indledning. Spørgsmål?"). En handling ("Klik på − ved kuvetten, til koncentrationen er 0 mM.") står også halvfed på sin egen linje.
7. **Konkret og uden talesprog.** "Hvor mange mol Cl⁻ kommer der fra glas A?" og ikke "Hvordan findes [Cl⁻] i blandingen, når begge glas giver Cl⁻?". Ingen symbolspørgsmål som "Hvad er n(Cl⁻) fra A?", når det kan siges i ord.
43. **Sig, hvilken størrelse der spørges om.** Aldrig "c" alene, men "koncentrationen af NOCl ved ligevægt, [NOCl]". Et regnestykke med mange ukendte deles op, så eleven finder én størrelse ad gangen. (Niels om `sb2.4` fane 2: "bombarderet med informationer ... Der står bare 'c'.. så hvad er det for en koncentration?")
34. **Ordet kommer før symbolet.** Første gang en størrelse bruges, skriver kortet ordet med symbolet i parentes, fx "absorbansen (A)". Symbolet står ikke alene i scenen eller i opgaverækken, før ordet er brugt (I₀ og I ved strålen kun, hvis de bruges). (Niels om `sb5.2`: "Måske skal der ikke stå 'A' så tidligt.")
8. **Svarknapperne er samme slags ting som spørgsmålet.** Spørges om en koncentration, er svarene koncentrationer.
9. **Kemien må ikke lære eleven noget forkert som bivirkning.** Fx er rumfang ikke additive: Spørg "Hvor stort er det samlede rumfang i blandingsglasset?" og lad eleven aflæse det. Vis ingen sum "100 mL + 100 mL".
10. **Kemibogens sprog:** kort, skarpt, ingen tankestreger, ingen indskudte sætninger, ingen påhængt ", og ...", stort efter kolon (helst intet kolon), dioxygen osv., ladning ±1 som + og −, bogens fagord. "fx", "ca." og "bl.a." må blive.

## 3. Stilladseringen: én ting ad gangen

11. **Første opgave på en fane er trinvis**, når der ellers er mere end én ting fremme, eleven ikke bruger endnu. Etiketten siger "Trin 2 af 6".
52. **En gennemgang kan springes over.** Er de første trin mest en vejledning ("Klik på Indsend svar", "Klik på + foran NaCl"), hedder de en gennemgang ("Gennemgang · Trin 2 af 4"), og kortet har en stille knap "Spring gennemgangen over", som giver opgaven som en almindelig opgave. Knappen står aldrig, hvor Næste står. (Niels 21. nov. 2026 om køkkensalt i `sc1.4`: "det er jo ligefør at den skal markeres som en præsentation, som man kan skippe?")
12. **Start med det konkrete og en handling.** Første kort er ikke målet ("Find [Cl⁻] i blandingen ...") med tre ting på én gang, men én handling: "Klik på glas A for at hælde det over i det tomme glas." Målet kommer, når eleven er i gang (i `sc6.2` først i trin 4).
35. **En ny størrelse defineres konkret, før den bruges.** Fx x: "Træk x til 0,050 M", og eleven ser i beholderen, hvad x er, før der skal regnes med x. (Niels om `sb2.4`: "Måske skal x lige defineres lidt tydeligere inden man bliver kastet ud i det.")
13. **Delene dukker op, når de bruges.** Det, der ikke bruges i første opgave (grafen, lodderne, gasflasken, regnetrinene), er skjult eller har en stiplet plads med navnet, så intet hopper, når det dukker op. Hvert løst trin får noget frem i scenen ("Byg figuren"-princippet).
38. **Svaret står ikke i scenen, før eleven har svaret.** Spørger kortet "Hvor stor er Y fra start?", står der "Y = ?" i scenen og ikke "Y = 0 M". Det samme gælder kurver, tællere og skemaets tal, der afslører svaret. (Niels om `sb2.4`: "Y=0 skal først komme frem, når man har indtastet værdien.")
36. **Regnestykker ét felt eller én række ad gangen.** Et skema med mange felter fyldes aldrig ud på én gang. Hjælpefigurer, der ikke bruges i regningen (fx grafen), foldes ind, når opgaverne går over til regning, og kan foldes ud igen. (Niels om `sb2.4`: "der skal kun komme en række eller endda felt ad gangen".)
42. **Ny opgave, ny situation: en rolig overgang.** Skifter opgaven reaktion eller opstilling, får eleven først at se, hvad der er nyt (et kort trin med den nye reaktion og et enkelt spørgsmål om den), før der kommer en handling. Opgaven må ikke komme "ud af det blå". (Niels om `sb2.4` opgave 4: "svært at omstille sig til denne opgave".)
51. **Få skift af reaktion eller opstilling på en fane.** Hjernen skal omstille sig ved hvert skift. Højst ét skift pr. fane, og hellere to opgaver med samme reaktion end en tredje reaktion. Kan en pointe (fx en positiv løsning, der er for stor) vises med en reaktion, eleven allerede kender, så gør det. (Niels 21. nov. 2026 om `sb2.4`: "det er lidt forvirrende når der skifter reaktionsblanding. Hjernen har lidt svært ved at omstille sig".)
14. **Svarformen:** I første opgave vælger eleven mellem tre svar, hvor de forkerte er fejl, elever faktisk laver (rumfanget i mL, koncentrationerne lagt sammen, n i stedet for c, −2x), og hvert forkert svar har sin egen korte forklaring. I de næste opgaver skriver eleven selv tallet i et felt i kortet. Formler vælges med tre knapper i kortet, de skrives ikke. Et forkert svar må aldrig være noget, andre lærebøger regner for rigtigt (se regel 40).
15. Hvert trin har en hinttrappe på tre trin og så Vis svaret, en ros og et gæt, der er gratis. Scenen er låst, mens kortet stiller et spørgsmål (klik får kortet til at blinke).
16. Er opgaven løst før (gemt i browseren), er alt fremme fra start. "Start forfra" giver trinene igen og står aldrig, hvor Næste står.

## 4. Opgavelisten og fanerne

17. **Titlerne låses op i takt.** Listen (eller rækken) viser kun titlen på de løste opgaver og den, eleven er ved. De kommende står som et nummer med en grå streg og kan ikke klikkes, før de er nået (Vis svaret tæller som løst). Eleven kan se, hvor mange der kommer. Niveauer (Let, Middel, Svær) kan altid vælges. (Regel i CLAUDE.md, sat ind i alle aktive animationer 21. nov. 2026.)
18. **Titlerne er sigende**, gerne med en kort undertekst i mindre skrift: "Natriumchlorid / Lav [Cl⁻] = 0,30 M", ikke "Én til én".
46. **Fanerne har sigende navne**, der siger, hvad eleven gør: "Mod ligevægt", "Ved ligevægt", "Fra start til ligevægt" og ikke "Beholderen", "Uden x", "Med x". Gamle #-adresser virker stadig, så links fra Kemibogen ikke går i stykker. (Niels om `sb2.4`: "spørgsmålet om fanerne ikke skal have mere sigende navne".)

## 5. Klik, skydere og "går selv videre"

19a. **Intet i scenen lægger op til et klik, mens kortet stiller et spørgsmål.** Knapper, − og +, håndtag, skyderens knap, "Langsomt lys" og stofvalg er væk (eller står som almindelig tekst uden knapform), til kortet beder eleven om at gøre noget. Så kommer præcis det, der skal bruges. (Niels 21. nov. 2026: "når der stilles spørgsmål skal der ikke være objekter på skærmen der lægger op til at blive klikket på.")
19. **Klik-opfordringer kun, når eleven skal klikke dér.** Mens kortet stiller et spørgsmål eller et gæt, er der ingen "Klik: ..."-bobler, højst et svagt pejlemærke. Når kortet beder om en handling, har præcis det, der skal bruges, en opfordring. Boblen forsvinder, så snart eleven har gjort det (fx ved første træk). (Regel i CLAUDE.md.)
20. **Tydelige**: gul ramme om tingen og en boble med pil ("Klik: hæld", "Træk: x"), som krukken i `sc6.1` fane 1. En svag pil er ikke nok. Boblen dækker aldrig tekst.
21. Det, eleven skal klikke på, står **tæt på** det, der sker (krukken ved glasset, ikke i hjørnet).
33. **"Prøv det" går selv videre.** Har eleven gættet og skal bagefter prøve det i scenen, går kortet selv videre ca. 1 sekund efter, at scenen står på målet (fx 0,40 mM). Indsend svar bliver som reserve. (Niels om `sb5.2`: "så skal den bare selv gå videre efter 1 sekund.. for at spare et klik".)
39. **Et mål, der nås i scenen, giver selv grønt.** Når eleven har trukket x, så Y = K, bliver mærket grønt af sig selv efter ca. ½-1 sekund. Slipper eleven skyderen dér, hvor målet er, sker der altså noget, og målet godtager et lille interval. (Niels om `sb2.4`: "skal lampen bare blive grøn automatisk efter ca. ½-1 sekund"; undtagelsen står også i CLAUDE.md.)
44. **Hjælp, når skyderen er svær at ramme.** Har eleven trukket i ca. 10 sekunder uden at nå målet, viser en lille gul markering på skyderens spor, hvor målet ligger. Den pulserer roligt 2-3 gange og bliver stående svagt. Skyderen går i små faste trin, og piletasterne virker. (Niels om `sb2.4`: "måske skal den blinke lidt hjælpende, hvis man ikke rammer efter 10 sekunder".)

## 6. Makro og mikro

22. **Glassene er tydelige:** tykt glas, synlig (svagt farvet) væske, store skalastreger. Hvert glas har en etiket på glasset med store sorte bogstaver ("A / NaCl / 0,200 M", "Blandingen"), ikke små grå tekster under det.
23. **Det, eleven skal regne med, kan ses.** Er et glas hældt over, viser en tynd stiplet linje med "100 mL", hvor væsken stod.
24. **Mikrofiguren (luppen) har ingen legende.** Hver ion er en blank kugle med formlen inde i kuglen (mindst 13,5 px), sammensatte ioner som én kugle med formlen. Forbilleder: `sc2.1_salt_i_vand` og `sc6.3_mohrtitrering`.
25. **Luppen er stor, og en kegle fra et forstørrelsesglas på glasset** viser, hvor den kigger. Højst ca. 20 kugler; antallet følger koncentrationen. Skriv ikke skalaen, hvis den afslører svaret.
26. **Rolige partikler.** Molekyler bevæger sig langsomt (i `sc5.7` 40 % af den gamle fart), ingen glimt eller blink ved stød, en blød farve i stedet for skarpt hvidt på mørk baggrund. Forskelle (varmere = hurtigere) vises som forhold.
45. **Molekyler i én rolig farve pr. stof, med atomsymbolerne på.** Mange røde, gule og grønne atomer på én gang forvirrer. Hvert stof får sin egen dæmpede farve (fx SO₂Cl₂ blå, SO₂ orange, Cl₂ grøn), og skemaets kolonneoverskrifter og tælleren får samme farver i stedet for en legende. Er der plads, står atomsymbolet inde i hvert atom (mindst 13,5 px), og molekylerne er så store, at det kan læses. Beholderen må være hovedfiguren, men ikke så stor, at den fylder alt. (Niels om `sb2.4`: "Det er forvirrende med alle de farver ... de forskellige molekyler skal måske farvekodes på det er rart for øjnene" og "plads til at skrive atomsymbolerne på molekylerne".)

## 7. Tavlen og formlerne

27. **Tavlen er ikke indforstået:** ingen overskrifter i versaler ("OPGAVENS TAL", "BEREGNINGEN"), ingen "N trin mere". Tallene fra opgaven står på glassenes etiketter.
28. **Den vokser linje for linje**, som Byg figuren, og er tom (eller en stiplet plads), til første linje er fundet. Hver linje har et navn i ord og så regnestykket ("Cl⁻ fra glas A" over "n = c · V = 0,200 M · 0,100 L = 0,0200 mol"). Den linje, kortet spørger om, har "?" og gul ramme.
29. **Den fylder ikke mest i scenen:** et roligt, lyst papir i siden (i `sc6.2` til højre), uden genskin.
37. **Det vigtigste står højt.** Den lov eller det reaktionsskema, fanen handler om, står lige under eller over kortet, centreret og stort, og ikke nederst i scenen eller gemt ved siden af en figur, der bevæger sig. (Niels om Lambert-Beers lov: "kan den ikke komme op lige under kortet.. Så er det lidt nemmere at se den vigtighed", og om `sb2.4`: "reaktionsskemaet skal være centreret og måske endnu større".)
40. **Enheder i skemaer og udtryk:** "0,200 M − x", ikke "0,200 − x". (Niels om `sb2.4`: "jeg ved godt det er en tabel, men her skal være en enhed herinde".)
41. **Ved ligevægt er Y = K:** Udtrykket med x sættes lig med K ("0,0500 M = x · x / (0,200 M − x)"), ikke "Y = ...". Ligevægtsloven (brøken med symboler) står stadig synligt, mens eleven sætter ind.
48. **Skemaets øverste række er reaktionsskemaet.** Stofferne står med ⇌ mellem reaktanter og produkter og + mellem stoffer på samme side, så hver kolonne står under sit stof. (Niels om SÆL-skemaet i `sb2.4`: "der må gerne være en pil i øverste række".)
49. **En række eller etiket siger kun det, der passer lige nu.** Rækken Ligevægt får først tal, når der er ligevægt (Y = K). Før det står kun udtrykket ("0,200 M − x"). (Niels: "i nederste række.. så synes jeg ikke at den skal være udfyldt når der ikke er ligevægt.. Det virker lidt underligt.")
50. **Ingen rullebjælke i tavlen.** Bliver en række lang, får den mindre skrift, eller tallet står på sin egen linje. Tjekkes i alle tre skærmstørrelser. (Niels: "skriftstørrelsen gerne være mindre i nederste række, så der ikke kommer en scrollbar".)

## 8. Skrift, scene og teori

30. **Ingen voldsom skrift.** Tavler, formler og felter står i Lexend med almindelig eller halvfed vægt, aldrig store, kraftigt fede bogstaver, der fylder tavlen. Ingen versaler som overskrifter ("FORMENS FORM", "BOGSTAVERNE", "KLIK FOR AT SKRIVE"). (Niels om formelvælgeren i `sb5.2`: "Jeg synes faktisk det er lidt voldsomt.") Lexends "a" kan ligne α; pas på i formler med a.
32. **Scenen er samlet, også på en stor skærm.** Den ekstra plads skal give noget (større, pænere apparater), ikke lange tomme afstande. Forsøget har en største bredde og står samlet i midten, og det, der hører sammen (lampe, kuvette, detektor og regnestykket for A), står tæt. Apparaterne tegnes som rigtige ting i "super figur"-stil, ikke som grå kasser. Ser tegningerne stadig "fjollede" ud, kan Niels lave billeder (sprites) et andet sted: Skriv en bestilling (mønster: `sb5.2_lambert_beer/SPRITES_BESTILLING.md`), og behold tegningerne som reserve. Tjek altid skærmbilleder i 1920 x 1080. (Niels om `sb5.2`: "som om vi ikke har fået gevinst ud af den ekstra plads ... afstandene helt vildt store ... Figurerne er ikke særligt pæne", "Måske skal jeg lave sprites et andet sted?")
31. **Teorien er kort og rolig.** Den står på et lyst ark i Lexend (`faelles/teori.css`, klassen `teori-ark`): det vigtigste, formlen og højst ét lille eksempel. Den slutter med en henvisning til afsnittet i Kemibogen ("Læs mere i Kemibogen: B5.2 ..."), hvor resten står. (Niels 21. nov. 2026: fede skrifttyper "overvælder øjnene og skaber panik ... der må gerne stå mindre og med en mere elegant skrifttype, og måske en henvisning, der fører læseren tilbage til kemibogen. Det betyder jo sådan set, at de fleste animationer skal have en tur.")

## 9. Arbejdsgangen ved en gennemgang

1. Læs dette regelsæt og `~/NK_hjemmeside/CLAUDE.md`. Tag skærmbilleder (1400 x 860, 1100 x 760 og 1920 x 1080) af startskærmen på hver fane (`~/NK_hjemmeside/.claude/spoergsmaal-og-start/skud.mjs`), og se dem.
2. Gå reglerne igennem for hver fane. Skriv forslagene som en kort liste til Niels (hvad er fremme, hvad bruges, hvilke trin, hvad dukker op hvornår), gerne med en lille skitse af opstillingen.
3. Når Niels har sagt ja: Byg, kør selvtesten (`node ~/NK_hjemmeside/.claude/spoergsmaal-og-start/selvtest.mjs <mappe>`), tilføj påstande for det nye, lemp ingen grænser, og tag skærmbilleder af hvert trin i alle tre størrelser. Se dem selv kritisk, før Niels får dem: Er det pænt og roligt? Er der tomme huller? Hopper noget? Står svaret fremme, før der spørges? Er der noget klikbart under et spørgsmål?
4. Vis Niels animationen gennem en lokal server på en ny port (ny port = frisk start uden gemte fremskridt), fx `python3 ~/NK_hjemmeside/.claude/spoergsmaal-og-start/server.py 8749` og `xdg-open "http://127.0.0.1:8749/animationer/superanimationer/<mappe>/index.html?alene"`.
5. Tekstrettelser skrives i en liste i `~/NK_hjemmeside/.claude/spoergsmaal-og-start/ret/`, så de kan sættes tilbage nummer for nummer (`ret.py`).
6. Skriv i animationens README, hvad der er ændret og hvorfor (med dato og Niels' ord).
7. Siger Niels noget, der gælder flere animationer, så skriv det her som en ny regel med hans ord, og nævn det for ham.
