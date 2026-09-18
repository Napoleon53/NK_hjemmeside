# Hvad der allerede findes i kemichael.js

Gennemgang af de 1643 linjer, sorteret efter det eneste spørgsmål, der
betyder noget for flere lærere: **er det maskineri, enhver person skal
bruge, eller er det Michael personligt?**

Konklusionen først: forholdet er omtrent to tredjedele maskineri og en
tredjedel Michael. Det er bedre, end man kunne håbe. Figuren er altså ikke
en engangsting, der skal skrives om — den er en ramme, der endnu ikke ved,
at den er en ramme.

## Maskineri, som enhver person skal bruge

**Scenekøreren.** En scene er en liste af trin, der køres efter hinanden:
`{ gaa }`, `{ sig, vis }`, `{ arm, tid }`, `{ udtryk }`, `{ tid, hver }`,
`{ kald }`, `{ taleFaerdig }`. Formatet er godt, og det er i familie med
`forloeb.js` i den nye motor. Det skal ikke opfindes igen.

**Reglen om ikke at blive afbrudt.** Et klik preller af, mens boblen står,
og en ny scene venter, til der er talt færdig. Det er en generel regel om
opmærksomhed, ikke en egenskab ved Michael, og den bliver vigtigere, ikke
mindre vigtig, når der er flere personer.

**Replikpuljer med hukommelse.** `K.replik(kategori)` tager en vending, der
ikke er brugt for nylig i samme sidevisning. Det er præcis den mekanisme,
der forhindrer, at en figur bliver til en papegøje, og den skal gælde alle.

**Dagsform.** Tilstande med `naar(t)` og `vaegt`, valgt efter maskinens
rigtige ugedag og klokkeslæt, som lægger egne vendinger i puljerne, flytter
ansigtet en smule og ændrer, hvor meget figuren finder sig i. Det her er det
mest raffinerede i hele filen, og det er fuldstændig generisk. Enhver person
skal kunne have en dagsform; kun listen er personlig.

**Glimt.** Vis-én-gang-pr-browser, højst ét glimt pr. sidevisning, husket i
`localStorage`. Mekanismen er generel. Tabellen er Michaels.

**Baggrundsliv.** Sker der ikke noget i 95 rigtige sekunder, kommer et
indslag, som ikke låser noget og viger straks, hvis eleven rører noget.
Målt i rigtige sekunder, så en selvtest ikke udløser det. Gennemtænkt og
generisk.

**Ansigtet tegnet i kode.** Øjne, bryn, briller, mund og rødme tegnes med
parametre oven på et hoved-sprite uden ansigt, så udtrykket kan glide fra et
til et andet. Det er allerede sømmen mellem krop og udtryk — netop den
opdeling, en palet af personer har brug for. Udtrykkene `vrede`, `humoer`,
`roed`, `skeptisk`, `briller` og `laen` er generelle sindstilstande, ikke
Michael-specifikke.

**Blink, suk, damp af ørerne, sprut, armdrejning om skulderen,
gang og løb.** Alt sammen kropsmaskineri.

**Taleboblen.** Se `02-taleboblen.md`; den har sit eget dokument, fordi den
er det sted, flere personer først kommer i karambolage.

**Tegneseriefiguren.** `K.tegneserieFigur(ctx, valg)` tegner figuren i en
rude. Generisk, når den ikke antager ét bestemt ansigt.

## Michael personligt

Replikpuljerne (`REPLIKKER`), dagsformlisten (`DAGSFORM`), glimttabellen
(`GLIMT`), kaffeægget (`KAFFE`, 21 poster), hans tre sprites, hans
ansigtskonstanter — skaldet, overskæg, runde briller — og tonen: venlig i
handling, sarkastisk i replik, sarkasmen rammer handlingen og aldrig eleven,
aldrig teori, replikker på højst ca. 60 tegn.

Bemærk, at hans tre sprites allerede hedder `laerer_krop.svg`,
`laerer_hoved.svg` og `laerer_arm.svg`. Navngivningen er generisk, men
tegningerne er ham. Person nummer to skal have sine egne filer i sin egen
mappe, ikke overskrive disse.

## Fire ting, der skal afgøres, før der skilles ad

**Regnskabet over uheld hører til verden, ikke til personen.**
`K.uheld()` og `K.ros()` tæller i dag på Michael. Men et uheld er en
begivenhed i laboratoriet: hvis der er to lærere til stede, skal de tælle
det samme uheld én gang, ikke hver for sig. Tælleren hører hjemme i
verdenslaget (journalen eller forløbet), og personen skal kun *reagere* på
den. Det er den samme lagdelingsregel som i arkitekturnotatet: personer må
kigge ned, aldrig omvendt.

**Nøglen i localStorage.** I dag `nk-kemichael`. Den skal være
`nk-person-<id>` for det, der er personligt (viste glimt), og noget
verdensejet for det, der er fælles (regnskabet). Ellers arver person nummer
to Michaels hukommelse eller sletter den.

**Kaffeægget er ikke kaffe, det er et rekvisit.** 21 poster om en kop er
mange at kaste væk, men det generelle i det er: *en person kan eje en ting
på en hylde, som man kan klikke på, og som svarer forskelligt hver gang.*
Beskrevet sådan kan den næste lærer have en trillebør, en nøgleknippe eller
en frokostmadkasse uden ny kode. Beskrevet som "kaffe" kan hun ikke.

**Filen er skrevet til den gamle model.** Den hænger på
`NK.Forsoeg.prototype`, `NK.Scene` og `NK.Sprites` og ved intet om
genstandsmodellen, `vilkaar.js` eller `forloeb.js`. Maskineriet er godt nok
til at høste; koblingen er det ikke. Forventningen skal være, at
`kemichael.js` bliver stående urørt som en af de otte gamle, mens dens
mekanismer skrives om mod den nye motor — ikke at filen flyttes.

## Hvad der bliver tilbage

Hvis maskineriet ovenfor trækkes ud, er Michael selv en ret lille fil:
fire lister, et sæt ansigtskonstanter, tre filnavne og en tonebeskrivelse.
Det er den fil, person nummer to skal ligne. Bliver hun væsentlig større
end det, er noget maskineri ikke blevet trukket ud endnu.
