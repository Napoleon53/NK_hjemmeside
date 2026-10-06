# Finansminister 1953-1963

Historie, forløbet om velfærdsstaten. Hører til kapitel 8-alternativ, del 1
(Vækst og politik), som er skrevet efter Peter Schroeder: Det 20. århundredes
Danmarkshistorie (2007), s. 109-120.

Adresse: `kemiformler.dk/animationer/Historie/velfaerd_finansminister/`.
Et år kan åbnes direkte: `index.html#1961`.

**I menuen** siden 6. okt. 2026: historiesamlingen (`samling_alt_historie.html`),
undersamlingen 2.3b Velfærdsstaten (`Historie/samling_2.3b_velfaerdsstaten.html`)
som nr. 2. Direkte link: `samling_alt_historie.html?emne=2.3b.2`.

## Bestillingen

1. **Pointen i én sætning.** Hvert valg i den økonomiske politik har en pris, og
   fra 1956 til 1963 greb staten mere og mere ind mellem arbejdere og arbejdsgivere.
2. **Hvad den afløser.** Ingenting. Den er bygget fra bunden.
3. **Naboerne.** `2.3.1_Frit_marked.html` ejer udbud, efterspørgsel og Adam Smith.
   `velfaerd_fra_land_til_by/` ejer figur 8.1: erhvervene og vandringen mod byerne
   (bygges af en anden session fra 5. okt. 2026). De to sidste forslag til kapitlet
   er ikke bygget: Hverdagen 1958-1982 (tabel 8.2 og 8.3) og Kommunekassen
   (Tølløse-budgettet).
4. **Loftet.** Fire situationer (1956, 1958, 1961, 1963), tre valg i hver, tre
   målere. Ingen faner. En quiz på fem spørgsmål er aftalt til senere.
5. **Layoutet.** Scene plus panel. Scenen har to spalter: til venstre situationen
   og valget (avisen og de tre kort), til højre virkningen (målerne og følgen).

## Forløbet

Hver situation går i fire trin, og knappen i statuslinjen er altid næste skridt.

1. **Læs.** Avisen og målerne. De tre kort ligger med bagsiden op, så avisen bliver
   læst først. Knappen (eller et klik på en bagside) vender kortene.
2. **Vælg.** De tre kort. Det første klik på et kort er elevens valg. Knappen åbner
   notatet med mere om mulighederne.
3. **Valgt.** Målerne viser følgen, og feltet under dem siger, hvad valget fører
   til, og hvad det koster. Eleven kan prøve de to andre kort. Knappen viser, hvad
   regeringen gjorde.
4. **Afsløret.** Regeringens valg er stemplet. Knappen fører videre til næste år.

Til sidst står elevens valg ved siden af regeringens i et regnskab med prisen for
hvert af regeringens valg.

Der er ingen rigtige og forkerte svar. Alle valg har en pris, også regeringens.
Derfor er der ingen hints og ingen point, kun en optælling af, hvor ofte eleven
valgte som regeringen. Der er ingen lærer i scenen.

## Læs mere: notatet til ministeren

Hvert kort har en lille knap, Læs mere, og i trin 2 åbner den store knap det samme
vindue. Notatet viser de tre muligheder side om side: en baggrund for situationen,
hvad hver mulighed går ud på, og hvad der taler for og imod. Her står for eksempel,
hvad mæglingsforslaget i 1956 indeholdt.

Notatet røber ikke regeringens valg. Først efter afsløringen kommer boksen Sådan
gik det med, hvad der skete bagefter. De tre uddybninger i en situation er
nogenlunde lige lange, så længden ikke røber noget (selvtesten tjekker det).

Brugerens ønske 5. okt. 2026: "lade animationen være lidt mere i trin, så man når
at læse introduktionen inden man får valgmuligheder", og "en mulighed for at læse
lidt mere om de forskellige konsekvenser og løsninger og herunder fx hvad
mæglingsforslaget gik ud på".

## Filerne

| Fil | Indhold |
|-----|---------|
| `index.html` | Siden, fagordene, notatets ramme og rundvisningens ramme |
| `css/stil.css` | Udseendet. Samme ramme som superanimationerne |
| `js/data.js` | De fire situationer, alle tekster og modellen |
| `js/maaler.js` | De tre målere |
| `js/spil.js` | Forløbet: trinene, stemplerne, notatet, listen over årene og regnskabet |
| `js/rundvisning.js` | Rundvisningen bag `?` |
| `js/app.js` | Klik, taster og opstart |
| `js/kerne.js` | Små hjælpefunktioner |
| `_selvtest.html` | Udviklerværktøj, kræver en lokal server |

## Det, man kan rette

Alle tekster står i `js/data.js`: avisens rubrik og tekst, de tre kort (mærke,
titel, linje), følgen, prisen og regeringens begrundelse. Uddybningen bag Læs mere
er `baggrund` på situationen og `mere` (`hvad`, `for`, `imod`) på hvert valg.
Regeringens valg har desuden `gik`. Linjen på et kort må højst være 46 tegn og
rubrikken 28, ellers brydes de på smalle skærme (selvtesten tjekker det).

Et valgs virkning på målerne er `virkning: { a, p, b }` i trin: `a` er
arbejdsløshed, `p` priser og `b` betalingsbalance. Plus er dårligere. `DRIFT`
er det, der sker af sig selv fra en situation til den næste.

## Kilderne

Situationerne, regeringens valg og begrundelserne er bogens (kapitel 8-alternativ).
Uddybningerne bag Læs mere har flere detaljer, end bogen har:

* Arbejdernes krav i 1956, antallet i konflikt, mæglingsforslagets indhold,
  afstemningen og lovens vedtagelse natten til 13. april: Gyldendal og Politikens
  Danmarkshistorie, "Benzinstrejke og avisstrejke" (lex.dk).
* Demonstrationen foran Christiansborg 13. april 1956: danmarkshistorien.dk
  (Aksel Larsens tale) siger 100.000, Gyldendal og Politiken omkring 150.000.
  Notatet skriver "over 100.000".
* Helhedsløsningens indhold (overenskomsterne forlænget i to år, tillæg til de
  lavtlønnede, stop for priser, ATP, regeringens spinkle flertal, overskud på
  betalingsbalancen i 1963) og vismændenes advarsel i december 1962: Gyldendal og
  Politikens Danmarkshistorie, "Helhedsløsning" (lex.dk).
* Det økonomiske Råds sammensætning: De Økonomiske Råds egen side (dors.dk).

## Forenklingerne

* **Målerne har seks trin og ingen tal.** Bogen har ingen tal for følgerne, så
  målerne viser kun retning og et ord for niveauet (lav, høj, i balance).
* **Følgerne af de valg, regeringen ikke traf, er modellens.** De står ikke i
  bogen. De følger de sammenhænge, kapitlet beskriver: højere løn giver højere
  priser og mere import, offentligt byggeri giver arbejde, og en stram
  finanspolitik dæmper priser og import.
* **Situationens start er regnet:** forrige start, plus regeringens valg, plus
  driften. Opsvinget i 1958 er drift (det kom udefra), og det samme er de
  stigende lønninger og priser frem mod 1961 og 1963.
* **Betalingsbalancen står i balance indtil 1963.** Bogen siger, at Danmark
  manglede valuta i 1950'erne, og at det første underskud kom lige før
  Helhedsløsningen. Derfor begynder ordet underskud først ved trin 3, og
  regeringens vej når det i 1963. Løn- og prisstoppet flytter måleren to trin
  tilbage til overskud, som det gik i 1963.
* **1958 er en situation, selv om bogen ikke nævner et bestemt indgreb det år.**
  Regeringens valg er taget fra bogens beskrivelse af perioden: de voksende
  skatteindtægter blev brugt på velfærd, og det offentlige byggede skoler,
  sygehuse, institutioner og veje.
* **Lovindgrebet i 1961 er ikke med.** Overenskomsten i 1961 endte også med, at
  et mæglingsforslag blev gjort til lov på transportområdet. Bogen nævner kun de
  store lønstigninger, og situationen handler om, hvem der skal rådgive om lønnen.
* **Elevens valg ændrer ikke historien.** Næste situation begynder altid, hvor
  regeringens valg førte hen.

## Selvtest

`_selvtest.html` siger ALT OK med 1015 påstande: modellen (stillingerne i de fire
år, første underskud i 1963), teksterne (alle kort har følge, pris og uddybning,
ingen tankestreger), de fire trin og notatet med mus og tastatur, og det rolige
ark: ingen felter flytter sig fra trin til trin, og intet skal rulles ved
1366 x 768, 1280 x 620, 1069 x 620 og 883 x 620. Den sidste er vinduet i
historiesamlingen med begge menuer åbne på en lav skærm; under 1000 px bredde
skjules panelet med årene, så de to spalter bliver stående. Notatet kan læses uden
at rulle ved de to brede størrelser. Ingen læsbar tekst er under 12,4 px.

## Linjen til menuen

Finansminister 1953-1963: Du styrer økonomien gennem fire år fra storkonflikten i
1956 til løn- og prisstoppet i 1963. Vælg selv, se prisen, og sammenlign med
regeringens valg.
