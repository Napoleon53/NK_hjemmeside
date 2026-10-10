# sb4.8 Navne på organiske stoffer

En superanimation i sin egen mappe. Åbn **`index.html`**. Den henter
molekylemotoren fra `../../molekylemotor/` (alle tre faner) og virker også, når
den åbnes direkte fra harddisken. Der er ingen Kemichael: al tekst står på ét
kort øverst i scenen, og hjælpen er den gule knap på kortet.

Den er ny og afløser ingen gammel animation. Den hører til B4 Funktionelle
grupper og bruges også til afsnit B3.1 i Kemibogen B (navnets tre dele).
Nummeret 4.8 er det næste ledige i rækken `sb4.x`, ikke en plads i menuen.

**Pointen i én sætning:** Et systematisk navn er en opskrift på molekylet:
stammen er antallet af carbonatomer i kæden, endelsen er den funktionelle
gruppe og dens plads, og forleddet er sidegruppen.

## Bestillingen (10. oktober 2026)

Brugeren bad om forslag til opgaveanimationer til kapitel B3 i Kemibogen B og
valgte forslaget om navne: "Lav den med navne til funktionelle grupper (men
hov hører den ikke til i B4 (om funktionelle grupper). Måske kan der være
nogle tydelige toggles, der bestemmer hvilke grupper, der skal være med."
Fanernes indhold og rækkefølge valgte Claude.

1. **Pointen:** som ovenfor.
2. **Afløser intet.** Den er bygget fra bunden. Opdelingen af navnet i
   forled, stamme og endelse og de fire trin (find kæden, nummerér, sæt
   endelsen på, skriv sidegrupperne foran) er bogens, afsnit B3.1. Navnene på
   estere og aminer følger afsnit B4.5 og B4.6.
3. **Naboerne:** `sc6.2_zigzagformler` ejer zigzagformlen og navnene på
   alkaner og alkener; her er der ingen carbonhydrider. `sc_spil4_organiske_grupper`
   ejer genkendelsen af stofklassen for ét molekyle ad gangen på tid; fane 3
   her handler om flere grupper i samme molekyle. `tegnebraet` er værktøjet
   til rapporter; fane 2 låner dets tavle, men har en opgave og et facit.
   `sb4.5_organisk_syntese` ejer dannelsen af estere. `sb4.6` og `sb4.7` ejer
   E/Z og R/S.
4. **Loftet:** tre faner. Seks stofklasser. 48 stoffer på fane 1 og 2 (fire
   pr. stofklasse pr. fane), højst seks carbonatomer i kæden og højst én
   sidegruppe (methyl). 19 stoffer på fane 3. Højst seks brikker at vælge
   imellem.
5. **Layoutet:** scene plus panel. Scenen er scenekortet øverst og et
   whiteboard under det. Panelet har kontakterne til stofklasserne og
   opgavelisten.

## Stofklasserne (kontakterne i panelet)

Seks kontakter øverst i panelet på alle tre faner: alkohol, aldehyd, keton,
carboxylsyre, ester og amin. De fire første er slået til fra start (det, eleven
kan navngive efter afsnit B3.1). Kun de stofklasser, der er slået til, kommer
med i opgaverne, og mindst én er altid slået til.

* Valget huskes i browseren (`nk-sb4.8-klasser`).
* Et link kan vælge stofklasserne: `index.html?med=alkohol,keton`. Ordene er
  `alkohol`, `aldehyd`, `keton`, `syre`, `ester`, `amin` og `alle`. Linket
  vinder over det, browseren husker. En fane vælges som altid med `#`:
  `index.html?med=ester#tegn`.
* Skifter eleven stofklasser midt i en opgave, bliver opgaven stående.
* Det, der er løst, huskes på stoffets navn, så et flueben bliver, når en
  stofklasse slås fra og til igen.

## Fane 1: Giv navnet (`#navn`)

Molekylet står på whiteboardet som zigzagformel. Eleven bygger navnet i
bogens rækkefølge. Hvert trin er ét valg mellem brikker på kortet eller ét
klik i formlen, og svaret bliver stående i navnet på kortet.

| Trin | Eleven | Gult i formlen imens | Formlen bagefter |
|------|--------|----------------------|------------------|
| Stammen | vælger mellem methan og hexan | intet (hint 2: den længste kæde) | den længste kæde har blå streger |
| Nummereringen | klikker på carbonatom nummer 1 | intet (hint 2: carbonatom nummer 1) | kæden har numre |
| Endelsen | vælger mellem tre til seks endelser | gruppen og dens carbonatom | gruppen er grøn |
| Forleddet | vælger mellem tre forled | sidegruppen og dens carbonatom | sidegruppen er orange |

**Gult er det, kortet spørger om lige nu.** Brugeren efter første test (10.
oktober 2026): hovedkæden blev fremhævet, samtidig med at der blev spurgt om den
funktionelle gruppe, og "det vil forvirre den svage elev, der tror highlightet
har noget med det aktuelle spørgsmål at gøre. Det er jo fint nok at ens svar
bliver highlightet, men det må gerne være tydeligt ud fra figuren hvad der
bliver spurgt om". Derfor:

* Den del af formlen, trinnets spørgsmål handler om, har gul baggrund, mens
  trinnet står på kortet (`om` i `js/kemi.js`, `fokusNu` i `js/sim_navn.js`).
  Det er den samme gule som den plads i navnet, eleven er ved. For en ester er
  det de carbonatomer, der skal tælles.
* Et svar, eleven har givet, får kun delens farve på stregerne og bogstaverne,
  uden baggrund.
* Først når navnet er færdigt, får delene en farvet baggrund.
* Fane 3 følger samme regel: den gule ring er atomet, der spørges om, og en
  fundet gruppe har farvede streger og sit navn, men først baggrund, når
  stoffet er løst.

Nummereringen er kun med, når der står et tal i navnet, og forleddet kun, når
der er en sidegruppe. Ethanol har derfor to trin og 4-methylpentan-2-ol fire.
En ester har tre trin (klik på carbonatomet med C=O, alkoholens del, syrens
del; syrens del bliver grøn og alkoholens orange som i bogens figur), og en
amin har ét (carbonkæderne på nitrogenatomet).

De forkerte brikker er de fejl, elever laver: at tælle sidegruppen med i
stammen, at glemme carbonatomet i C=O, at tælle et atom med bogstav som
carbon, at nummerere fra den forkerte ende, og at forveksle endelserne. Hver
fejl har sin egen forklaring. Halvdelen af formlerne er spejlvendt (`vend` i
`js/data.js`), så nummer 1 ikke altid er til venstre.

## Fane 2: Tegn molekylet (`#tegn`)

Navnet står på kortet, delt i sine dele. Eleven tegner molekylet på
whiteboardet med molekylemotorens tavle, den samme som i `sc6.2` og på
tegnebrættet: træk eller klik bygger kæden, et klik på en binding gør den
dobbelt, højreklik sletter fra enden. Værktøjerne ligger øverst på tavlen:
Kæde, −OH, =O og −NH₂ (kun dem, de valgte stofklasser har brug for), Fortryd
og Ryd tavlen.

Når tegningen har lige så mange atomer som stoffet, giver motoren den et navn.
Passer navnet, er opgaven løst, og tegningen får navnedelenes farver. Ellers
står der, hvad tegningen hedder, og hvilken del af navnet der ikke passer:
"Du har tegnet propan-1-ol. Tallet 2 betyder, at OH-gruppen sidder på
carbonatom nummer 2."

En carboxylsyre bygges af =O og −OH på samme carbonatom. En ester bygges som
syren, og så klikker eleven på oxygenatomet i OH med Kæde valgt, så
alkoholens del vokser frem. En amin med flere kæder bygges på samme måde fra
nitrogenatomet. To ting er derfor anderledes end på tegnebrættet (se toppen af
`js/sim_tegn.js`): et klik på O eller N med Kæde sætter et carbonatom på
atomet, og et klik i den tomme tavle sætter ikke et nyt atom. Efter en gruppe
går værktøjet selv tilbage til Kæde.

## Fane 3: Flere grupper (`#grupper`)

Et stof fra hverdagen med flere funktionelle grupper (mælkesyre, glycerol,
citronsyre, alanin, acetylsalicylsyre ...). Eleven klikker på et atom i en
gruppe og vælger stofklassen blandt de seks. Gruppen får stofklassens farve
og navn. Når alle grupper er fundet, siger kortet, hvilke stofklasser stoffet
hører til, og giver det systematiske navn.

Pointen er bogens "Se på hele gruppen": C=O og OH på samme carbonatom er én
gruppe. Derfor får kun det atom, eleven klikker på, en gul ring. Svarer eleven
alkohol eller keton til en carboxylgruppe, kommer forklaringen, og ringen
vokser til hele gruppen. Har eleven fundet én gruppe af en stofklasse, skal de
andre af samme slags kun klikkes på.

Kontakterne vælger stofferne: et stof er med, når alle dets grupper hører til
de valgte stofklasser. Er der færre end fire sådanne stoffer, fyldes der op
med dem, der har mindst én af dem.

## Hjælpen

Som `sc7.5` og `sc6.4`: al tekst står på kortet øverst i scenen, og der er
ingen tekstlinje nederst. Den gule knap giver ét hint ad gangen (to eller tre)
og til sidst svaret. Et forkert svar giver en forklaring, der passer til
fejlen, og knappen lyser stille. Et hint kan også vise noget i formlen (den
længste kæde, carbonatom nummer 1, hele gruppen). En opgave, der er løst uden
Vis svaret, får en stjerne. Når kortet er grønt, sker der intet ved et klik i
formlen; kortets knap blinker. Teorien ligger bag knappen Teori, rundvisningen
bag `?`.

## Forenklinger

* Navnene er molekylemotorens (IUPAC 1979/1993, dansk stavning, se
  `../../molekylemotor/README.md`): butan-2-ol, propanon, butanon,
  3-methylbutan-2-on, ethylethanoat, ethylmethylamin.
* Aminer har kun bogens simple navne (methylamin, dimethylamin), ikke
  propan-2-amin.
* Kun én sidegruppe, og den er altid methyl. Ingen dobbeltbindinger i kæden og
  ingen ringe på fane 1 og 2.
* På fane 3 er ethere, amider og phenoler holdt ude, så alle grupper hører til
  de seks stofklasser. Acetylsalicylsyre er det eneste stof med en ring.
* Sætningerne om stofferne på fane 3 er skrevet efter hukommelsen.
* Fane 2 tjekker tegningen på navnet, ikke på udseendet: molekylet må vende,
  som eleven vil.

## Hvad man kan rette i

Alt indhold står i `js/data.js`: stofklasserne og deres farver (`KLASSER`),
hvad der er slået til fra start (`STANDARD`), stofferne på fane 1 og 2
(`STOFFER`) og på fane 3 (`BLANDEDE`). Et nyt stof skrives som en ny linje med
navnet og navnets dele; molekylet bygges af navnet. Selvtesten siger til, hvis
motoren giver stoffet et andet navn, hvis delene ikke giver navnet, eller hvis
en tekst bliver for lang. Trinene, fejlforklaringerne og hintene laves i
`js/kemi.js`.

## Filer

```
index.html           siden: tre faner, teorien og rundvisningen
css/stil.css         stilarket (grundlaget er sc6.4; det nye står nederst under SB4.8)
js/kerne.js          fælles hjælpefunktioner (som sc6.4)
js/data.js           stofklasserne, stofferne og de faste tekster
js/kemi.js           de funktionelle grupper, navnets dele, trinene, hint og forklaringer
js/fane.js           det fælles: scenekortet, listen, hjælpeknappen, musen, tegnehjælpere
js/sim_navn.js       fane 1
js/sim_tegn.js       fane 2
js/sim_grupper.js    fane 3
js/rundvisning.js    rundvisningen (som sc6.4, kun teksterne er nye)
js/app.js            faner, kontakterne til stofklasserne, tastatur og tegneløkken
_selvtest.html       udviklerværktøj
```

Fra `../../molekylemotor/js/` hentes molekyle, navngivning, smiles,
trivialnavne, layout, struktur, navnlaeser, tavle og tegnebraet. Motoren er
ikke ændret.

## Genveje

`1` `2` `3` fane, `R` ryd tavlen (fane 2), `Ctrl+Z` og `Ctrl+Y` fortryd og
gentag (fane 2), `H` eller `?` rundvisning, `T` teori, `Esc` luk.

## Selvtest

`_selvtest.html` åbnes gennem en lokal server med `animationer/` som rod.
174 påstande: motoren giver hvert stof navnet fra data, delene giver navnet,
hvert stof har netop den gruppe, stofklassen siger, alle opgaver på de tre
faner løses med klik på kortet og i formlen (også med forkerte svar, hint og
Vis svaret), tegningen på fane 2 tjekkes og kan tegnes med musen, kontakterne
vælger opgaverne, låsen virker, det gule i formlen er det, kortet spørger om
(og intet svar har baggrund imens), teksterne er korte og uden tankestreger, og
kortet dækker aldrig whiteboardet fra 1100 × 620 til 1600 × 950.

## I menuen

Ikke endnu. Når brugeren siger til: en ny knap i
`kemi-b-filer/samling_b4,5,6.html` (B4 Funktionelle grupper) med
`../superanimationer/sb4.8_organiske_navne/index.html`, en ny `data-emne`
(fx `b4.navne`), navnet i `FEEDBACK_EMNER` i `samling_alt_b.html` og kolonnen
"I menuen" i `../README.md`. Kemibogen B kan linke til den fra boksen Prøv selv
i afsnit B3.1 (med `?med=alkohol,aldehyd,keton,syre`) og fra B4.5 og B4.6.
