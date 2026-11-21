# T2, runde 2: sc6.2 Formel og aktuel koncentration, svarene i kortet

Niels har prøvet T2 (fanen Blandinger) og svarede 21. nov. 2026:

> Jeg synes faktisk stadig ikke 6.2 er særlig stilladseret.. lige nu står der "Spørgsmål 2 af 2 NaCl og KCl giver hver én Cl⁻. Hvordan findes [Cl⁻] i blandingen, når begge glas giver Cl⁻?" Det er sådan lidt talesprog.. og man bliver stadig forvirret, når der efterfølgende bliver spurgt ind til formler og så sker der noget 5-6 steder.. hvor skal man egentlig kigge hen. Måske skal sidefanen være mindre? og måske skal svarene aldrig angives heroppe i panelet? Måske skal der være svarmuligheder eller mere interaktive elementer

Han valgte derefter (alle tre var anbefalingen):
1. **Svarene står i kortet under spørgsmålet, aldrig i panelet, på alle tre faner.** Panelet har kun opgavelisten (og Nye tal / Start forfra).
2. **Svarform på Blandinger: først valg, så skrive.** I første opgave vælger eleven mellem tre svar, hvor de forkerte er typiske fejl. I de næste opgaver skriver eleven selv tallet i et felt i kortet.
3. **Panelet bliver smallere**, fra 430 til ca. 300 px i denne animation, så scenen får mere plads.

## Princippet: To steder at kigge

Eleven skal kun kigge to steder: **kortet** (spørgsmålet og svarene) og **tavlen** (regnestykket vokser linje for linje, og den linje, kortet spørger om, har den gule ramme). Luppen og glassene viser det, der sker, men eleven skal ikke lede efter noget i dem. Panelet har ingen felter, ingen regnetrin og ingen stiplede pladser. Intet sker i panelet, mens eleven regner.

## Fane 3 Blandinger, første opgave "Samme rumfang" (A: 100 mL 0,200 M NaCl, B: 100 mL 0,200 M KCl)

Erstat de to spørgsmål fra runde 1 med disse trin. Etiketten siger "Trin 1 af 6" osv. Hvert trin har en kort indledning i almindelig skrift (må være tom), et halvfedt spørgsmål, der kan stå alene, tre svar (de forkerte er typiske fejl og har hver sin korte forklaring), tre hint og en kort ros. Formuleringerne her er et udkast; ret dem til Kemibogens sprog (kort, præcist, intet talesprog, ingen påhængt ", og ...").

1. **Handling i scenen.** Kortet siger: "Hæld glas A og glas B over i det tomme glas." Eleven klikker på (eller trækker) hvert glas, og det hældes over. Blandingsglasset viser 200 mL, og luppen Blandingen kommer frem med Na⁺, K⁺ og Cl⁻. (Det er det interaktive element, Niels efterlyser. Brug den hældning, animationen allerede har.)
2. **"Hvor stort er rumfanget af blandingen?"** 200 mL / 100 mL / 400 mL. Tavlen får linjen V = 100 mL + 100 mL = 200 mL = 0,200 L.
3. **"Hvilken formel giver stofmængden af Cl⁻ fra glas A?"** n = c · V / n = c / V / n = V / c. Tavlen får "n(Cl⁻) fra A = c · V".
4. **"Hvor mange mol Cl⁻ kommer der fra glas A?"** 0,0200 mol / 20,0 mol (rumfanget i mL) / 0,200 mol (koncentrationen i stedet for stofmængden). Tavlelinjen bliver færdig.
5. **"Hvor mange mol Cl⁻ kommer der fra glas B?"** Tre svar med typiske fejl. Tavlen får linjen for B.
6. **"Hvad er [Cl⁻] i blandingen?"** 0,200 M / 0,400 M (koncentrationerne lagt sammen) / 0,100 M (kun Cl⁻ fra det ene glas). Tavlen får [Cl⁻] = n / V = (0,0200 mol + 0,0200 mol) / 0,200 L = 0,200 M. Rosen siger kort, hvorfor koncentrationen er den samme som i hvert glas.

Den gamle rækkefølge af regnetrin må gerne ændres, så tavlen læses oppefra og ned i den rækkefølge, eleven svarer.

## Fane 3, opgave 2-4

Samme slags trin, ét ad gangen, med tavlen som det eneste sted, regnestykket vokser:
- Formlen vælges med tre svarknapper i kortet (ikke skrevet).
- Tallet skrives i et felt i kortet, fx "n(Cl⁻) fra A = [ tallet ] mol", og eleven trykker Indsend svar. De gode fejlbeskeder, animationen har i dag (koncentrationerne lagt sammen, rumfanget i mL, tallet foran ionen glemt osv.), skal stadig virke.
- Tavlen viser de løste linjer og den aktive linje med gul ramme. Resten kan stå som "N trin mere" på tavlen.

## Fane 2 Ionerne og fane 1 Opløsningen

- **Ionerne:** Felterne flytter fra panelet op i kortet: tallene foran ionerne i skemaet (fx "CaCl₂(s) ⟶ [ ] Ca²⁺(aq) + [ ] Cl⁻(aq)" i kortet) og koncentrationerne ("[Ca²⁺] = [ tallet ] M"). På Svær vælges formlerne (n = m / M, c = n / V) med svarknapper som på fane 3. Tavlen viser regnestykket som i dag. Fejlbeskederne skal stadig virke.
- **Opløsningen:** Boksen "Beregningen" i panelet skal væk fra panelet. README siger, at beregningen før stod i kortet, når opgaven var løst. Find det roligste sted (kortets grønne forklaring, hvis det kan være der, ellers en lille tavle i scenen), og skriv valget i rapporten.
- De andre trinforslag til fane 1 og 2 (spørgsmål før krukken, søjler der dukker op senere) bygges IKKE nu.

## Panelet

`--panel-bredde` fra 430 px til ca. 300 px (vælg det mindste, hvor opgavelisten, "Nye tal" og "Start forfra" står pænt på én linje hver). Scenen skal udnytte den ekstra bredde. Selvtestens layoutpåstande (alle størrelser) skal holde.

## Det samme som før

- Følg `opgave_trin.md` (regler, selvtest, skærmbilleder, README, ingen commit, ret kun i sc6.2). Kortet må gerne have plads til svarknapperne, men scenen må ikke hoppe, når kortet skifter mellem trinene.
- Er en tekstrettelse en ændring af et sprognummer (88, 89, 90, "sc6.2-kort"), så ret posten i `ret/t2.json`, så den stadig kan sættes tilbage. Nye tekster i ombygningen er kode og skal ikke i listen.
- Selvtesten skal dække: Intet svarfelt i panelet på nogen fane. Trinene på fane 3 opgave 1 kan løses (også med forkerte svar og Vis svaret). Hældningen sker kun ved elevens klik. Felterne i kortet virker på opgave 2-4 og på Ionerne. Panelet er smallere, og intet overlapper fra 1100 × 620 til 1600 × 950.
- Skærmbilleder af alle trin på fane 3 opgave 1, ét trin på opgave 2 og ét trin på Ionerne og Opløsningen i `/tmp/claude-1000/-home-niels/95c0d4ca-c197-4b1d-9c22-13d5b3943284/scratchpad/trin/T2b/`. Se dem selv, før du melder færdig: Kan en svag elev se, hvor der skal kigges?

Rapport højst 250 ord.
