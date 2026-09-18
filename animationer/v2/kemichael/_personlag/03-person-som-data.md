# En person som data

Målet er, at en ny lærer er én fil og ingen ændringer i motoren. Det
kræver, at der findes et sprog for, hvad en person *er*. Her er forslaget,
skrevet så tæt på det, `kemichael.js` allerede gør, som muligt.

En person har fire dele. De tre første er dem fra strategien — krop, rolle,
stemme — og den fjerde er identiteten, der binder dem sammen og giver en
nøgle til at gemme under.

## Identitet

Et kort `id` (`"kemichael"`), et navn, og det navn eleven bruger. Id'et er
nøglen i `localStorage` (`nk-person-<id>`), i journalen, når der noteres
hvem der sagde hvad, og i forløbets flag i escaperoommet. Det skal vælges
én gang og aldrig ændres.

## Kroppen

Sprites og ansigt. Michael er skaldet med overskæg og runde briller; en
anden er ikke. Det, der skal være ens, er **maskineriet** — hoved-sprite
uden ansigt, øjne, bryn, briller, mund og rødme tegnet ovenpå med
parametre, så udtrykket kan glide fra et til et andet.

Det, der adskiller to personer på skærmen, skal være **silhuet og én
signaturfarve**, ikke ansigtsdetaljer. Figurerne er små, og zoomen varierer.
Prøven er enkel: kan man ikke se forskel på to personer i sort silhuet på
tredive pixels højde, er de ikke forskellige nok.

Hertil hører personens plan. Fra `claude/personer.md`: billedet har planer,
og hvert plan har ét deklareret tal. En person tegnes som
`SKALA × PLAN.<hendes plan>`, ikke i et frit valgt forhold. Glassene i
forgrunden skal have lov at være store; personen bag bordet er mindre, fordi
hun er længere væk, ikke fordi hun er skrumpet.

## Rollen

Hvor hun må stå og gå, hvad hun kan række og modtage, hvilket rekvisit hun
ejer. Ændres næsten aldrig, og er derfor den mindste fil.

To ting hører til her. Hun skal være **modtager i det samme slipmålssystem**
som alt andet — at række hende et glas skal køre gennem `kanModtage` og den
nye afstandsscoring, ikke gennem sin egen kodesti. Og hendes rekvisit er det
generelle ved kaffeægget: en ting på en hylde, man kan klikke på, som svarer
forskelligt hver gang og først gentager sig, når alle svar er set. Beskrevet
sådan kan den næste lærer eje en nøgleknippe eller en madkasse uden ny kode.

## Stemmen

Den største del, og den, der skrives hundredvis af gange. Den har fire
slags indhold, og de findes alle fire i `kemichael.js` i dag:

**Puljer.** Vendinger, der kan bruges i flæng, hvor en af dem tages, som
ikke er brugt for nylig. Michaels `prik1` til `prik4`, `ros`, `uheld`,
`advarsel`, `forbi`, `stilstand`.

**Dagsform.** En liste af tilstande med `naar(t)` og `vaegt`, som lægger
egne vendinger i puljerne og flytter ansigtet en smule. Gør mere for
figurens liv end noget andet i filen, og den er allerede generisk.

**Glimt.** Baggrund fortalt i enkeltlinjer, hver vist én gang pr. browser,
højst ét pr. sidevisning. En person uden glimt er en funktion; en person med
femten glimt er en figur.

**Vilkårsreplikker — den nye del.** Det er her, personlaget møder den nye
motor. Et trin i `forloeb.js` er betingelse → konsekvens. En replik er den
samme sætning med en anden konsekvens, og den kan derfor læses af den
`vilkaar.js`, der allerede findes. Samme tre regler: afgjort af hvad der
står på bordet og aldrig af vejen derhen, og en udløser fyrer én gang — her
med en tilføjelse om, at en replik må komme igen efter en karantæne.

Og den regel, der gør det hele holdbart: **en replik interpolerer verdens
tal i det øjeblik, den siges.** "Firs grader, siger du?" skal læses ud af
badet, ikke stå som tekst. Ellers bliver en vittighed før eller siden
faktuelt forkert, fordi eleven gik en anden vej — og det er præcis dér,
sådan et projekt plejer at rådne.

## Tonen skrives ned, ikke kun replikkerne

Michaels README har et afsnit om tone, som er værd at efterligne for hver
ny person, fordi det er det, der gør, at replik nummer hundrede stadig lyder
som hende: *venlig i det hun gør, sarkastisk i det hun siger, sarkasmen
rammer handlingen og aldrig eleven, forklarer ikke teori, ros er kort og
tør, højst ca. 60 tegn.*

Det er også svaret på, hvorfor flere lærere overhovedet er en gevinst.
Personer, der kun ser forskellige ud, er dobbelt arbejde uden dobbelt
værdi. Personer med hver sin faste skævhed bliver et ensemble — og komikken
skalerer, fordi den kommer af holdningen og ikke af enkeltvittigheder.
Vælg rollen først: den pedantiske om sikkerhed, entusiasten der forklarer
for meget, laboranten der ved hvor tingene står, den naive medstuderende der
spørger om det, eleven ikke turde.

## Prøven

En `_personer.html` i samme ånd som `_geometri.html` og
`_kombinationer.html`: alle personer i alle positurer og udtryk, med
replikker på ét ord, én sætning og fem linjer, ved lærredets kanter, i hvert
plan og i begge temaer. Uden den kan en palet ikke holdes sammen. Med den
kan en ny figur bestå eller dumpe.

Og målet, der kan måles: **person nummer tre skal være én datafil og nul
ændringer i motoren.**
