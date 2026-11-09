# sc7.7 Indikatorer

En superanimation i sin egen mappe. Åbn **`index.html`**. Den virker også,
når den åbnes direkte fra harddisken. Der er ingen Kemichael: al tekst står på
det lyse papirkort øverst i scenen, hjælpen er den gule knap på kortet, og
intet bedømmes uden **Indsend svar**.

Bygget fra bunden til afsnit 7.3 pH-skalaen i Kemibogen C, delen "Sådan måles
pH" (bogens figur over fem indikatorer). Det var det eneste mål i kapitel 7
uden en animation: "forklare, hvordan en indikator kan vise pH". Mappen hedder
sc7.7, fordi sc7.1 til sc7.6 er optaget.

**Pointen i én sætning:** En indikator skifter farve ved sin egen pH, så én
farve fortæller kun, om pH ligger under eller over det sted, hvor den skifter,
og flere indikatorer sammen indkredser pH.

## Bestillingen (9. november 2026)

Brugeren: "Kan du ikke brainstorme ideer til superanimationer til kapitel 7.
Udvælg derefter den bedste og begynd at lave animationen. Du skal selv træffe
valg selvstændigt." Alle valg nedenfor er Claudes og er ikke set af brugeren
endnu.

Idéerne, der blev overvejet: indikatorer (valgt), neutralisation i luppen,
halsbrand og kalktabletten, titrerkurvens ækvivalenspunkt og valg af
indikator, et vendespil med navne og formler på syrer og baser, pH i en svag
syre og vand som amfolyt. Indikatorerne blev valgt, fordi målet er det eneste
i kapitlet uden animation, fordi farverne er visuelle og sjove, og fordi
naboerne ikke rører emnet.

1. **Pointen:** som ovenfor.
2. **Afløser intet.** Farverne og stedene, hvor farven skifter, er de samme
   som i bogens figur `indikatorer.svg` (`indikatorer()` i
   `Kemibogen/vaerktoej/lav_figurer.py`): samme farvekoder, og farvens navn
   ved hver hel pH er det samme som bogens `farver_ved()` (selvtesten tjekker
   alle 5 × 17).
3. **Naboerne:** `sc7.2_ph_skalaen` ejer skalaen med hverdagsstoffer, luppen
   med ioner og fortyndingen. `sc7.3_ph_beregninger` ejer regningen.
   `sc7.4_titrering_eddike` ejer titreringen med phenolphthalein. `sc7.6`
   ejer fagordene. Her er der ingen ioner, ingen log og ingen titrering.
4. **Loftet:** to faner (to vinkler på samme sætning), fem indikatorer (bogens),
   syv glas på fane 1, fire indikatorer og højst fire ting pr. prøve på fane 2.
5. **Layoutet:** scene plus panel som sb4.11. Scenen er papirkortet øverst og
   et whiteboard med en pH-akse fra −1 til 15 med pile i begge ender.

Stop-listen er overholdt: ingen flasker, man hælder med musen, intet stativ,
intet affaldsglas, ingen uheld og ingen oprydning. Dråbeflasken drypper selv,
når eleven klikker på den eller på knappen.

## Fanerne

**1 Farveskiftet** (`js/sim_skift.js`, `#farveskift`). Syv reagensglas med kendt
pH (0, 2, 4, ..., 12) står på pH-aksen, hvert glas over sin pH. Fem opgaver, én
indikator ad gangen:

* **BTB:** glassene med pH 0 og 12 har BTB fra start (gul og blå). Gæt først:
  hvilken farve får BTB ved pH 4? (De fleste gætter grøn; den er gul.) Så drypper
  flasken i de fem glas i midten, og spørgsmålet er, ved hvilken pH BTB skifter
  farve.
* **Phenolphthalein:** farveløs i en prøve, hvad ved du så om pH? (Ikke "sur"
  og ikke "neutral", men 8 eller lavere.)
* **Lakmus:** rød i en prøve, hvad ved du så? (Under 5, ikke "pH 2".)
* **Thymolblåt:** skifter farve to steder; eleven vælger begge.
* **Rødkålssaft:** gæt først, hvor mange farver den får i de syv glas (6). Så:
  grøn i en prøve giver pH omkring 10, altså næsten pH af én farve.

Gættet er gratis og står bagefter som et lille mærke over glassene ("Dit gæt:
grøn / Det blev gul"). Farvens navn står over hvert glas, når indikatoren er
blandet. Når spørgsmålet er besvaret, males indikatorens bjælke på farvekortet
under aksen; kortet vokser til bogens figur. Opgaverne i panelet, Begynd forfra
under dem.

**2 Den ukendte prøve** (`js/sim_proeve.js`, `#proeve`). Fem prøver A til E. Hver
prøve er en af tre eller fire hverdagsting, som står over pH-aksen ved deres pH.
Eleven klikker på en dråbeflaske, glasset i den række får prøvens farve med den
indikator, og kortet spørger: hvad viser farven om prøvens pH? Svarene er
indikatorens områder (thymolblåt har fem). Et rigtigt svar gør det gule bånd
over aksen kortere, og de ting, der ikke passer, bliver streget ud. Når kun én
ting passer, måler pH-metret prøven. Stjerne: ingen fejl, intet vist svar og så
få indikatorer som muligt (`K.minTest`). Prøve C kan kun findes med én
indikator, hvis det er thymolblåt; prøve E kræver to.

| Prøve | Tingene | Prøven er | Færrest indikatorer |
|---|---|---|---|
| A | citronsaft, mælk, maskinopvask | mælk | 1 (lakmus, BTB eller thymolblåt) |
| B | øl, mælk, maskinopvask | maskinopvask | 1 (alle fire) |
| C | citronsaft, øl, maskinopvask | citronsaft | 1 (kun thymolblåt) |
| D | mælk, sæbevand, maskinopvask | sæbevand | 1 (thymolblåt eller phenolphthalein) |
| E | citronsaft, øl, mælk, sæbevand | øl | 2 |

## Forenklinger

* pH-værdierne for citronsaft (2,3), øl (4,5) og mælk (6,7) er de samme som i
  sc7.2. Sæbevand er sat til pH 9,0 (sc7.2: 9,5), fordi 9,5 ligger lige ved
  thymolblåts skift ved 9,6. Maskinopvask (pH 11) er ikke i sc7.2. Ingen ting
  ligger nærmere end 0,3 fra et sted, hvor en indikator skifter farve.
* Prøverne er tegnet som klar væske, også mælk, så glasset ikke røber prøven.
* På fane 2 regnes phenolphthalein kun som farveløs under 8,2, svagt lyserød
  op til 10 og lyserød over 10. Den røde farve under pH 0 og den farveløse over
  pH 13 står på farvekortet, men ingen prøve ligger dér.
* Farven blandes lineært mellem bogens farvestop (som gradienten i figuren).
  Farveløs er tegnet som rent vand i glassene og som hvid på farvekortet.

## Påskeæg

Tre klik på bægerglasset med prøven på fane 2.

## Teknik

Grundstellet er kopieret fra `sb4.11_dnph_og_tollens`: `js/kerne.js`,
`js/fane.js` (uden `iKasse`), `js/rundvisning.js` (nye ture) og `css/stil.css`
(et afsnit SC7.7 til sidst). Papirkortet er fælles (`../faelles/`). Tavlen
tegnes i `js/tegning.js` (samme whiteboard som molekylemotorens, men uden at
hente den). Modellen står i `js/kemi.js`, alle tal og tekster i `js/data.js`.

Sprites (vises alene i `_sprites.html`): `reagensglas_tom.svg` (fra sb4.11),
`draabeflaske.svg` (fra sb9.4; etiketten får en stribe med indikatorens farver,
fordi navnet ikke kan læses så småt), `baegerglas.svg` og `phmeter.svg` (nye,
med mørke streger til den lyse tavle).

## Selvtesten

`_selvtest.html` åbner animationen i en iframe og kører 119 påstande: farvernes
navne mod bogens figur, glassene på fane 1, prøverne på fane 2 (tydelige farver,
mindste antal indikatorer), begge faner spillet igennem med rigtige og forkerte
svar, hint og Vis svaret, låsen uden for forsøget, teksternes længde og at kortet
aldrig dækker tavlen ved 1100 × 620, 1300 × 800 og 1600 × 950. ALT OK 9. nov. 2026.

## I menuen

Ikke i menuen. Siger brugeren til, så skal den i
`animationer/kemi-c-filer/samling_c7.html` som en ny knap (forslag: nr. 5 efter
Titrering af eddike, koden `c7.indikator`), i `FEEDBACK_EMNER` og i kolonnen
"I menuen" i superanimationernes README. Kemibogens afsnit 7.3 kan så få en
"Prøv selv" under "Sådan måles pH".
