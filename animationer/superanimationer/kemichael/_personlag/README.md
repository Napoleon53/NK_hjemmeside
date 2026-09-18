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
`sb2.4_ligevaegt/`. Alt, hvad der står om, hvordan personlaget kobles på
den nye motor, er derfor forslag og ikke verificeret mod koden.

`kemichael.js` er desuden skrevet til den **gamle** superanimationsmodel:
den hænger på `NK.Forsoeg.prototype`, `NK.Scene` og `NK.Sprites`, ikke på
genstandsmodellen. Den skal ikke flyttes som den er. Den skal høstes.

## Når arbejdet skal i gang

Rækkefølgen fra `claude/personer.md` holder stadig:

1. **Nu, uafhængigt af zoom og stationer:** stemmelaget og taleboblen.
2. **Efter stationerne:** kroppen, planerne og gangvejene.
3. **Først når person nummer to findes:** selve personrammen trækkes ud.
   Lav aldrig en ramme for noget, der kun er set én gang.

Succeskriteriet er til at måle på: person nummer tre skal være én datafil
og nul ændringer i motoren.
