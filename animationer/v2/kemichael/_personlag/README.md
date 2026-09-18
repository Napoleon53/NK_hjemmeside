# _personlag — forberedelse til flere lærere

Beskrivelser, ikke kode. Intet i denne mappe køres, indlæses eller
importeres af noget. Filerne findes, så en senere Claude-session kan læse
dem i stedet for at gætte, og så beslutningerne ikke skal træffes forfra.

Skrevet 18. september 2026 af Claude, på grundlag af `README.md` og
`kemichael.js` i mappen ovenfor. Ingen eksisterende fil er ændret.

## Baggrunden

Målet er at kunne have flere lærere i det virtuelle laboratorium uden at
bygge hver enkelt fra bunden. Den overordnede strategi ligger i projektet
i Claude under `claude/personer.md`. Den korte version: en person er
tre ting, der ændrer sig med hver sin hastighed — **kroppen**, **rollen**
og **stemmen** — og de skal ligge hver for sig, fordi stemmen skrives
hundredvis af gange, kroppen fire-fem gange og rollen næsten aldrig.

Da strategien blev skrevet, var `kemichael.js` ikke læst. Den viser sig at
indeholde det meste af det maskineri, strategien efterlyser. Derfor handler
opgaven mindre om at bygge noget nyt og mere om at **skille det, der
allerede virker, fra den ene mand det er skrevet til.** Det er en meget
bedre udgangssituation.

## Filerne her

* `01-hvad-der-allerede-findes.md` — hvad i `kemichael.js` der er generisk
  maskineri, og hvad der er Michael personligt. Læs den først.
* `02-taleboblen.md` — boblen som den er i dag, og hvad der skal ændres,
  før to personer kan tale i samme rum.
* `03-person-som-data.md` — hvordan en person beskrives som data, så
  person nummer tre bliver én fil og ingen ændringer i motoren.

## Vigtigt forbehold

Disse filer er skrevet uden adgang til det nye motorlag i `laboratoriet/`
(`side.js`, `vilkaar.js`, `forloeb.js`, `rum.js`) og uden adgang til
`../../superlab/sb2.4_ligevaegt/`. Alt, hvad der står om, hvordan personlaget kobles på
den nye motor, er derfor forslag og ikke verificeret mod koden.

`kemichael.js` blev først læst som skrevet til den gamle model. Det var for
hurtigt: `K.paa(prototype)` er generisk, og filen kører allerede på den nye
motor — prøvebordet og sb2.4 kobler den på `NK.Bord.prototype`, og
`laboratoriet/proevebord/js/laerer.js` er hans scener på det nye bord. Det,
der skal skilles ad, er stadig maskineri fra mand; men det er ét bord at
arbejde på, ikke to.

## Status

**18. september 2026 — stemmelaget, første stykke.** En replik er nu en
konsekvens i forløbet: `{ sig }` i en udløsers `saa`, eller et trins eget
`sig`, går gennem `side.sig` til `laererReplik` i
`laboratoriet/proevebord/js/laerer.js`. Han kommer ind, siger linjerne én
boble ad gangen og går igen; bordet låses ikke; replikker venter på hinanden
i køen og kollapser ikke; `peg` stiller ham ved en genstand og markerer den;
`glimt` slutter med et glimt af hans baggrund; `udtryk` vælger ansigtet ved
navn. Uden lærer bliver linjen en besked. sb2.4's tre bemærkninger og to
trin er de første kunder, og selvtestens afsnit 13 holder øje med det.

Det, der bevidst *ikke* er lavet endnu: karantæne (en replik, der må komme
igen efter et stykke tid), interpolation af verdens tal i teksten, og
prioritet mellem forløbets replikker og hans andre scener ud over det, der
allerede gjaldt (et uheld afbryder en bemærkning). Ingen af delene har en
kunde endnu.

**18. september, senere — taleboblen som eget lag.**
`laboratoriet/js/taleboble.js` (`NK.Taleboble`): boblen får munden og
hovedets mål og finder selv sin plads — over, ellers til siden eller under —
inden for scenen og uden om det glas, replikken peger på; halen ender ved
issen; al stil står ét sted; og skriften holder mindst 14 px på skærmen, så
boblen kan læses, når bordet er zoomet ud. Et uheld, der afbryder en
forløbsreplik, lægger resten tilbage forrest i køen. Kø og prioritet *i
laget* venter på taler nummer to. Se `02-taleboblen.md`.

## Når arbejdet skal i gang

Rækkefølgen fra `claude/personer.md` holder stadig:

1. **Nu, uafhængigt af zoom og stationer:** stemmelaget og taleboblen —
   begge påbegyndt, se status.
2. **Efter stationerne:** kroppen, planerne og gangvejene.
3. **Først når person nummer to findes:** selve personrammen trækkes ud.
   Lav aldrig en ramme for noget, der kun er set én gang.

Succeskriteriet er til at måle på: person nummer tre skal være én datafil
og nul ændringer i motoren.
