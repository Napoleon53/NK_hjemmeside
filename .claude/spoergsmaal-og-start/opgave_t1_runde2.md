# T1, runde 2: sc5.7 Idealgasligningen, roligere molekyler og ingen betjening i panelet

Niels har prøvet T1 (21. nov. 2026) og svarede:

> I forhold til idealgasligningen... så synes jeg den er bedre. Men molekylerne bevæger sig overordnet for hurtigt. Det er ikke rart for øjnene.. De skal i hvert fald være langsommere.. men jeg ved ikke om der er andet der kan lette øjnene.. Selve animationen er god. Udover, at man også her bliver tvunget til at lave input i højre bjælke, hvilket jeg helst vil væk fra

Samme dag om sc6.2 valgte han: svarene står i kortet og aldrig i panelet, panelet bliver smallere (300 px), når det kun har opgavelisten, og i regnetrin vælges formlen med knapper, mens tallet skrives i et felt i kortet. Det gælder nu også her. Trinene fra runde 1 på fane 1 bliver, som de er.

## 1. Roligere molekyler (begge faner)

- Sænk den samlede fart til ca. 40 % af i dag (`grundfart` i `js/gas.js`). Forholdet til temperaturen (kvadratroden af T/293) bliver, så eleven stadig tydeligt ser, at varmere gas er hurtigere.
- Fjern glimtene ved væggene (`glimt`), eller dæmp dem kraftigt. De blinker og trætter øjnene.
- Giv molekylerne en blødere farve end skarpt hvidt på mørk baggrund (fx lys blågrå) og en lidt blødere kant. De skal stadig kunne ses tydeligt.
- Tjek, at intet i modellen (tryk, stempel, manometer, selvtest) afhænger af den viste fart. Hvis det gør, så skal kun det viste ændres.

## 2. Ingen betjening i panelet (fane 1 Stemplet)

Alt det, eleven gør, sker på apparaterne i scenen. Panelet har kun opgavelisten og Start opgaven forfra.
- **Temperaturen:** Varmepladens − og + i scenen er allerede der. Skyderen i panelet fjernes. Varmepladens display viser temperaturen (K og °C).
- **Lodderne:** Eleven klikker på et lod på hylden for at lægge det på stemplet og på et lod på stemplet for at tage det af (træk må også gerne virke). En lille tekst "Klik: læg på" ved hylden, som "Klik: hæld" i sc6.2. Trykket udefra står ved lodderne eller stemplet i scenen (fx "udefra 1,013 bar"), ikke i panelet.
- **Gassen:** Gasflaskens hane i scenen lukker 0,25 mol ind pr. klik. Der skal også kunne lukkes gas ud (fx en lille ventil på cylinderen). Stofmængden står på cylinderen (fx "n = 1,00 mol").
- **Frit/Låst:** En lås ved stemplet i scenen, som eleven klikker på ("Lås stemplet" / "Lås op").
- Det, der før dukkede op i panelet i trinene (skyderen Temperatur), dukker nu op i scenen i stedet. Det, der skjules til mål 2-4, skjules stadig.
- Reglen fra CLAUDE.md gælder stadig: En knap på et apparat løser aldrig en opgave af sig selv. Eleven svarer på kortet og trykker Indsend svar.
- Panelet bliver 300 px bredt (som sc6.2), og scenen udnytter pladsen.

## 3. Fane 2 Beregningen

- Feltet "V = skriv formlen" flytter fra panelet op i kortet.
- Formlen vælges med tre svarknapper i kortet, hvor de forkerte er typiske fejl (fx V = n · R · T / p rigtigt, V = p · R · T / n og V = n · R / (p · T) forkerte, tilpasset den størrelse, der spørges om).
- Tallet skrives i et felt i kortet med enheden efter feltet, fx "V = [ tallet ] L", og eleven trykker Indsend svar. De fejlbeskeder, animationen har i dag (fx temperaturen i °C i stedet for K), skal stadig virke.
- Tavlen viser regnestykket, som den gør i dag. Panelet har kun opgavelisten (Let, Middel, Svær) og Nye tal.

## Det samme som før

Følg `opgave_trin.md` (regler, selvtest uden lempede grænser, ret kun i sc5.7, ingen commit, README). Selvtesten skal desuden dække: ingen skyder, intet felt og ingen knap til forsøget i panelet på nogen fane, lodder/gas/lås/varme virker ved klik i scenen, formlen vælges og tallet skrives i kortet på fane 2, og molekylernes fart er lavere end før (fx grundfarten under en fast grænse).

Skærmbilleder af fane 1 (trin 1-3, mål 2 med lodder, mål 3 med gas, mål 4 med låsen) og fane 2 (formlen og tallet) i `/tmp/claude-1000/-home-niels/95c0d4ca-c197-4b1d-9c22-13d5b3943284/scratchpad/trin/T1b/`, 1400 × 860 og 1100 × 620. Se dem selv, før du melder færdig.

Rapport højst 250 ord.
