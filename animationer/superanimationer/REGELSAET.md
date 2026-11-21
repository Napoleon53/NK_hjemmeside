# Regelsættet for superanimationerne (21. nov. 2026)

Samlet efter Niels' feedback 20.-21. nov. 2026 på `sb2.6` (Rumfang og fortynding), `sc5.7` (Idealgasligningen, T1) og `sc6.2` (Formel og aktuel koncentration, T2). Det gælder, når en superanimation bygges, bygges om eller gennemgås. README'ens "Fælles krav" og `~/NK_hjemmeside/CLAUDE.md` gælder stadig. Hvor de siger noget andet, vinder dette regelsæt (fx står svar og betjening ikke længere i panelet).

Målgruppen er den svage elev på 16-18 år, der klikker, før den læser. Hver regel er en måde at undgå, at den elev mister tråden.

## 1. Eleven kigger to steder

1. **Kortet** øverst i midten stiller spørgsmålet og har svarene. **Scenen** viser det, spørgsmålet handler om, og der dukker svaret op. Der er ikke flere steder at kigge.
2. **Svar og betjening står aldrig i panelet.** Svarfelter og svarknapper står i kortet. Skydere, knapper og kontakter til forsøget sidder på apparaterne i scenen (varmepladens − og +, klik på et lod, gasflaskens hane, en lås ved stemplet, et glas, der hældes).
3. **Panelet falder bort, når fanen har højst 10 opgaver.** Opgaverne står så i en smal række øverst i scenen, med nummer og et tema på to-tre ord, "↺ Start forfra" yderst til højre (mønster: `sc5.7`). Har fanen flere end 10 opgaver, står listen i et panel på 300 px, som kun har opgavelisten (mønster: `sc6.2`). (Niels 21. nov. 2026: "øverste række op til 8-10 opgaver, og derefter sidepanel".)
4. **Kortet har en fast plads.** Scenen må aldrig zoome, hoppe eller skifte størrelse, fordi kortet skifter, en besked kommer, eller noget dukker op. Den skifter kun med vinduet. (Fejlen i `sc5.7` runde 2: en kort besked gjorde kortet en linje højere, og hele scenen blev mindre ved hvert klik.)

## 2. Spørgsmålet

5. **Det halvfede spørgsmål kan stå alene.** Testen: Dæk den almindelige skrift til. Kan eleven forstå og besvare det halvfede? Betingelsen (hvilket glas, før eller efter, hvilken størrelse) står i spørgsmålet, ikke kun i indledningen. Intet "det", "den" eller "stoffet" uden at sige hvilket.
5a. **Slå indledningen og spørgsmålet sammen, når det kan lade sig gøre.** "Hvad bliver A, når koncentrationen fordobles fra 0,20 mM til 0,40 mM?" og ikke "Ved 0,20 mM er A = 0,490." over "Hvad bliver A, når koncentrationen fordobles til 0,40 mM?". En indledning står kun, når spørgsmålet ellers bliver for langt. (Niels 21. nov. 2026 om `sb5.2`: "Hvis man kan slå spørgsmålet sammen med beskrivelsen, så er det at foretrække.")
6. **Spørgsmålet står på sin egen linje** under en kort indledning i almindelig skrift (`faelles/papirkort.js` gør det selv, når teksten er "Indledning. Spørgsmål?").
7. **Konkret og uden talesprog.** "Hvor mange mol Cl⁻ kommer der fra glas A?" og ikke "Hvordan findes [Cl⁻] i blandingen, når begge glas giver Cl⁻?". Ingen symbolspørgsmål som "Hvad er n(Cl⁻) fra A?", når det kan siges i ord.
8. **Svarknapperne er samme slags ting som spørgsmålet.** Spørges om en koncentration, er svarene koncentrationer.
9. **Kemien må ikke lære eleven noget forkert som bivirkning.** Fx er rumfang ikke additive: Spørg "Hvor stort er det samlede rumfang i blandingsglasset?" og lad eleven aflæse det. Vis ingen sum "100 mL + 100 mL".
10. Kemibogens sprog: kort, skarpt, ingen tankestreger, ingen indskudte sætninger, ingen påhængt ", og ...", stort efter kolon (helst intet kolon), dioxygen osv., ladning ±1 som + og −, bogens fagord. "fx", "ca." og "bl.a." må blive.

## 3. Stilladseringen: én ting ad gangen

11. **Første opgave på en fane er trinvis**, når der ellers er mere end én ting fremme, eleven ikke bruger endnu. Etiketten siger "Trin 2 af 6".
12. **Start med det konkrete og en handling.** Første kort er ikke målet ("Find [Cl⁻] i blandingen ...") med tre ting på én gang, men én handling: "Klik på glas A for at hælde det over i det tomme glas." Målet kommer, når eleven er i gang (i `sc6.2` først i trin 4).
13. **Delene dukker op, når de bruges.** Det, der ikke bruges i første opgave (grafen, lodderne, gasflasken, regnetrinene), er skjult eller har en stiplet plads med navnet, så intet hopper, når det dukker op. Hvert løst trin får noget frem i scenen ("Byg figuren"-princippet).
14. **Svarformen:** I første opgave vælger eleven mellem tre svar, hvor de forkerte er fejl, elever faktisk laver (rumfanget i mL, koncentrationerne lagt sammen, n i stedet for c), og hvert forkert svar har sin egen korte forklaring. I de næste opgaver skriver eleven selv tallet i et felt i kortet. Formler vælges med tre knapper i kortet, de skrives ikke.
15. Hvert trin har en hinttrappe på tre trin og så Vis svaret, en ros og et gæt, der er gratis. Scenen er låst, mens kortet stiller et spørgsmål (klik får kortet til at blinke).
16. Er opgaven løst før (gemt i browseren), er alt fremme fra start. "Start forfra" giver trinene igen og står aldrig, hvor Næste står.

## 4. Opgavelisten

17. **Titlerne låses op i takt.** Listen (eller rækken) viser kun titlen på de løste opgaver og den, eleven er ved. De kommende står som et nummer med en grå streg og kan ikke klikkes, før de er nået (Vis svaret tæller som løst). Eleven kan se, hvor mange der kommer. Niveauer (Let, Middel, Svær) kan altid vælges. (Regel i CLAUDE.md, sat ind i alle aktive animationer 21. nov. 2026.)
18. **Titlerne er sigende**, gerne med en kort undertekst i mindre skrift: "Natriumchlorid / Lav [Cl⁻] = 0,30 M", ikke "Én til én".

## 5. Klik-opfordringer

19a. **Intet i scenen lægger op til et klik, mens kortet stiller et spørgsmål.** Knapper, − og +, håndtag, "Langsomt lys" og stofvalg er væk (eller står som almindelig tekst uden knapform), til kortet beder eleven om at gøre noget. Så kommer præcis det, der skal bruges. (Niels 21. nov. 2026: "når der stilles spørgsmål skal der ikke være objekter på skærmen der lægger op til at blive klikket på.")
19. **Kun når eleven skal klikke dér.** Mens kortet stiller et spørgsmål eller et gæt, er der ingen "Klik: ..."-bobler, højst et svagt pejlemærke. Når kortet beder om en handling, har præcis det, der skal bruges, en opfordring. (Regel i CLAUDE.md.)
20. **Tydelige**: gul ramme om tingen og en boble med pil ("Klik: hæld", "Klik: en portion"), som krukken i `sc6.1` fane 1. En svag pil er ikke nok.
21. Det, eleven skal klikke på, står **tæt på** det, der sker (krukken ved glasset, ikke i hjørnet).

## 6. Makro og mikro

22. **Glassene er tydelige:** tykt glas, synlig (svagt farvet) væske, store skalastreger. Hvert glas har en etiket på glasset med store sorte bogstaver ("A / NaCl / 0,200 M", "Blandingen"), ikke små grå tekster under det.
23. **Det, eleven skal regne med, kan ses.** Er et glas hældt over, viser en tynd stiplet linje med "100 mL", hvor væsken stod.
24. **Mikrofiguren (luppen) har ingen legende.** Hver ion er en blank kugle med formlen inde i kuglen (mindst 13,5 px), sammensatte ioner som én kugle med formlen. Forbilleder: `sc2.1_salt_i_vand` og `sc6.3_mohrtitrering`.
25. **Luppen er stor, og en kegle fra et forstørrelsesglas på glasset** viser, hvor den kigger. Højst ca. 20 kugler; antallet følger koncentrationen. Skriv ikke skalaen, hvis den afslører svaret.
26. **Rolige partikler.** Molekyler bevæger sig langsomt (i `sc5.7` 40 % af den gamle fart), ingen glimt eller blink ved stød, en blød farve i stedet for skarpt hvidt på mørk baggrund. Forskelle (varmere = hurtigere) vises som forhold.

## 7. Tavlen

27. **Tavlen er ikke indforstået:** ingen overskrifter i versaler ("OPGAVENS TAL", "BEREGNINGEN"), ingen "N trin mere". Tallene fra opgaven står på glassenes etiketter.
28. **Den vokser linje for linje**, som Byg figuren, og er tom (eller væk), til første linje er fundet. Hver linje har et navn i ord og så regnestykket ("Cl⁻ fra glas A" over "n = c · V = 0,200 M · 0,100 L = 0,0200 mol"). Den linje, kortet spørger om, har "?" og gul ramme.
29. **Den fylder ikke mest i scenen:** et roligt, lyst papir i siden (i `sc6.2` til højre), uden genskin.

## 8. Skriften og teorien

30. **Ingen voldsom skrift.** Tavler, formler og felter står i Lexend med almindelig eller halvfed vægt, aldrig store, kraftigt fede bogstaver, der fylder tavlen. Ingen versaler som overskrifter ("FORMENS FORM", "BOGSTAVERNE", "KLIK FOR AT SKRIVE"). (Niels 21. nov. 2026 om formelvælgeren i `sb5.2` Beregningen: "Jeg synes faktisk det er lidt voldsomt.")
31. **Teorien er kort og rolig.** Den står på et lyst ark i Lexend (`faelles/teori.css`, klassen `teori-ark`): det vigtigste, formlen og højst ét lille eksempel. Den slutter med en henvisning til afsnittet i Kemibogen ("Læs mere i Kemibogen: B5.2 ..."), hvor resten står. (Niels 21. nov. 2026: fede skrifttyper "overvælder øjnene og skaber panik ... der må gerne stå mindre og med en mere elegant skrifttype, og måske en henvisning, der fører læseren tilbage til kemibogen. Det betyder jo sådan set, at de fleste animationer skal have en tur.")

32. **Scenen er samlet, også på en stor skærm.** Den ekstra plads skal give noget (større, pænere apparater), ikke lange tomme afstande. Forsøget har en største bredde og står samlet i midten, og det, der hører sammen (lampe, kuvette, detektor og regnestykket for A), står tæt. Formlen står ved det, den regner på, i rolig skrift, ikke fedt nederst i scenen ("i skammekroen"). Apparaterne tegnes som rigtige ting i "super figur"-stil, ikke som grå kasser. Tjek altid skærmbilleder i 1920 x 1080 også. (Niels 21. nov. 2026 om `sb5.2`: "som om vi ikke har fået gevinst ud af den ekstra plads ... afstandene helt vildt store ... Figurerne er ikke særligt pæne.")

33. **"Prøv det" går selv videre.** Har eleven gættet og skal bagefter prøve det i scenen, går kortet selv videre 1 sekund efter, at scenen står på målet (fx 0,40 mM). Gættet var svaret, så det er ikke en skyder, der løser opgaven. (Niels 21. nov. 2026 om `sb5.2`: "så skal den bare selv gå videre efter 1 sekund.. for at spare et klik".)
34. **Et symbol kommer efter ordet.** Første gang en størrelse bruges, skriver kortet ordet med symbolet i parentes, fx "absorbansen (A)". Symbolet står ikke alene i scenen eller i opgaverækken, før ordet er brugt. (Niels: "Måske skal der ikke stå 'A' så tidligt.")
35. **En ny størrelse defineres konkret, før den bruges.** Fx x: "Træk x til 0,050 M. Hvor mange SO₂Cl₂-molekyler er spaltet?", før eleven skal regne med x. (Niels om `sb2.4`: "Måske skal x lige defineres lidt tydeligere inden man bliver kastet ud i det.")
36. **Regnestykker ét felt eller én række ad gangen.** Et skema med mange felter fyldes aldrig ud på én gang. (Niels om `sb2.4`: "der skal kun komme en række eller endda felt ad gangen".) Hjælpefigurer, der ikke bruges i regningen (fx grafen), kan foldes ind, når opgaverne går over til regning.
37. **Det vigtigste står højt.** Den lov eller formel, fanen handler om, står lige under kortet og ikke nederst i scenen. (Niels om Lambert-Beers lov: "kan den ikke komme op lige under kortet.. Så er det lidt nemmere at se den vigtighed.")

38. **Svaret står ikke i scenen, før eleven har svaret.** Spørger kortet "Hvor stor er Y fra start?", står Y = 0 M ikke i scenen før svaret (der står "Y = ?"). (Niels 21. nov. 2026 om `sb2.4`: "Y=0 skal først komme frem, når man har indtastet værdien.")
39. **Et mål, der nås i scenen, giver selv grønt.** Når eleven har trukket x, så Y = K, bliver det grønt af sig selv efter ca. ½-1 sekund (som regel 33). Slipper eleven skyderen dér, hvor målet er, sker der altså noget. Boblen "Træk: x" forsvinder, så snart eleven har trukket.
40. **Enheder i skemaer og udtryk:** "0,200 M − x", ikke "0,200 − x". Forkerte svarmuligheder er fejl, elever laver (fx −2x), aldrig noget, andre lærebøger regner for rigtigt.
41. **Ved ligevægt er Y = K:** Udtrykket med x sættes lig med K ("0,0500 M = x · x / (0,200 M − x)"), ikke "Y = ...". Ligevægtsloven (brøken med symboler) står stadig synligt, mens eleven sætter ind.
42. **Ny opgave, ny situation: en rolig overgang.** Skifter opgaven reaktion eller opstilling, får eleven først at se, hvad der er nyt (et kort trin, der viser den nye reaktion og beholder), før der kommer en handling. Opgaven må ikke komme "ud af det blå". (Niels om `sb2.4` opgave 4.)
43. **Sig, hvilken størrelse der spørges om.** Aldrig "c" alene: "koncentrationen af NOCl ved ligevægt, [NOCl]". Et regnestykke med mange ukendte deles op, så eleven finder én koncentration ad gangen. (Niels om `sb2.4` fane 2: "bombarderet med informationer ... Der står bare 'c'.. så hvad er det for en koncentration?")

## 9. Arbejdsgangen ved en gennemgang

1. Tag skærmbilleder (1400 x 860, 1100 x 760 og 1920 x 1080) af startskærmen på hver fane (`~/NK_hjemmeside/.claude/spoergsmaal-og-start/skud.mjs`), og se dem.
2. Gå reglerne ovenfor igennem for hver fane. Skriv forslagene som en kort liste til Niels (hvad er fremme, hvad bruges, hvilke trin, hvad dukker op hvornår).
3. Når Niels har sagt ja: Byg, kør selvtesten (`node ~/NK_hjemmeside/.claude/spoergsmaal-og-start/selvtest.mjs <mappe>`), tilføj påstande for det nye, lemp ingen grænser, og tag skærmbilleder af hvert trin. Se dem selv, før Niels får dem.
4. Vis Niels animationen gennem en lokal server på en ny port (ny port = frisk start uden gemte fremskridt), fx `python3 ~/NK_hjemmeside/.claude/spoergsmaal-og-start/server.py 8749` og `xdg-open "http://127.0.0.1:8749/animationer/superanimationer/<mappe>/index.html?alene"`.
5. Tekstrettelser skrives i en liste i `~/NK_hjemmeside/.claude/spoergsmaal-og-start/ret/`, så de kan sættes tilbage nummer for nummer (`ret.py`).
6. Skriv i animationens README, hvad der er ændret og hvorfor (med dato og Niels' ord).
