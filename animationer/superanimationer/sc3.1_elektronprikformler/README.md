# sc3.1 Elektronprikformler

En superanimation i to faner til afsnit 3.1 Elektronparbindinger i Kemibogen C.
Åbn **`index.html`**. Mappen henter kun filer inde fra sig selv.

Den afløser `animationer/kemi-c-filer/c3.1_elektronprikformel.html`, som ligger i
`animationer/kemi-c-filer/arkiv/c3.1_elektronprikformel_oldversion.html`. Knapperne i
`samling_c3.html` og `samling_NV.html` peger direkte på denne mappes `index.html`.

**Pointen i én sætning:** Atomernes uparrede elektroner danner fælles elektronpar,
til hvert atom har 8 elektroner omkring sig (hydrogen 2), og det ser man ved selv
at tælle de frie elektroner og begge elektroner i hvert fælles par.

## Bygget om 25. oktober 2026

Brugerens tilbagemelding: eleverne klikkede sig frem til svaret og fik ikke læst
teksten, der stod spredt rundt på siden. Brugeren valgte "Byg med elektronerne"
blandt tre forslag. Det, der var galt i den gamle udgave fra september:

* Antallet af valenselektroner blev valgt blandt otte knapper, der kunne prøves
  én ad gangen.
* Programmet tegnede alle elektronerne selv. Eleven trak kun atomerne sammen og
  klikkede på bindingen (enkelt, dobbelt, tripel), og Tjek svar kunne trykkes
  igen og igen, til alt var rigtigt.
* På Find fejlen viste et klik på et atom dets elektrontal gratis, så det forkerte
  atom kunne findes ved at klikke på dem alle.
* Teksten stod fire steder: vejledningen nederst, fejlbeskeder nederst i midten,
  stregformlen øverst til venstre og et hintvindue, og Kemichaels tilbud om en
  præsentation fyldte øverst i midten.

Nu følger fanen Byg bogens fremgangsmåde trin for trin, eleven gør selv det, der
skal læres, intet bedømmes før **Indsend svar**, og al tekst står på kortet øverst
i midten (mønstret fra `sb4.4_intermolekylaere_bindinger`). Kemichael er taget ud.

## To faner

**1 Byg** (`#byg`). Ti molekyler fra let til svær: H₂, H₂O, NH₃, CH₄, Br₂, CO₂,
CH₂O, N₂, HCN og C₂H₂ (de ni fra før og H₂ som det første). Hvert molekyle i tre trin:

1. **Byg atomet.** Første gang et grundstof dukker op, sætter eleven selv dets
   elektroner i yderste skal. Hver side har to stiplede pladser: et klik på en tom
   plads (eller ved siden) sætter en elektron, et klik på en elektron fjerner den,
   og et højreklik ved en side fjerner også én (brugerens ønske 25. okt.: begge
   dele). Det periodiske system med hovedgrupperne står ved siden af. Indsend svar holder tegningen op mod antallet og mod bogens regel (de
   første fire får hver sin side), og det grønne kort siger, hvor mange uparrede
   elektroner atomet har, og dermed hvor mange bindinger det danner. Tegnede atomer
   huskes, til siden lukkes, så CO₂ springer trinnet over, når C og O er tegnet.
2. **Byg molekylet.** Atomerne ligger på bordet med elevens egne elektroner. De
   uparrede gløder svagt. Eleven trækker en uparret elektron hen på en uparret
   elektron på et andet atom (eller klikker på dem efter hinanden), og de bliver et
   fælles elektronpar. Endnu et par mellem de samme atomer giver en dobbelt- eller
   tripelbinding. Et klik på et fælles par skiller det ad igen. Elektronerne har
   farven fra det atom, de kom fra (oxygen blå og hydrogen grøn som i bogens figur),
   så et fælles par viser én elektron fra hvert atom. Symbolet har samme farve som
   atomets elektroner (brugerens ønske 25. okt.), så et rigtigt atom ikke bare
   bliver grønt. Første gang viser en stiplet
   pil og et gult skilt, hvad der skal trækkes. Slippes en elektron på et frit
   elektronpar, siger kortet, at kun uparrede elektroner kan danne en binding.
   Indsend svar: er der uparrede elektroner tilbage, får atomet en rød ring, og
   kortet siger hvor; kan intet mere bindes, siger det også, at et par kan skilles ad.
3. **Tæl efter.** Eleven tæller elektronerne omkring ét atom (gul ring) og vælger
   tallet blandt 1 til 12 på kortet. Et forkert tal bliver rødt og giver et hint
   efter den måde, der er talt forkert på. Rigtigt: animationen tæller højt (en hvid
   ring om hver talt prik), og stregformlen kommer frem ved siden af.

**2 Find fejlen** (`#fejl`). De tolv tegninger fra før, nu tegnet af "en elev" i
stedet for Kemichael. Ni har én fejl, som elever faktisk laver; tre er rigtige.
Eleven klikker på det atom, der er tegnet forkert, eller vælger Ingen fejl på
kortet, og trykker Indsend svar. Et klik vælger kun (blå ring). Er det valgte atom
rigtigt, tæller animationen højt omkring det, og svaret koster stjernen. Derefter
tæller eleven elektronerne omkring det forkerte atom, og den rettede tegning kommer
frem ved siden af.

På begge faner: en stjerne kun, når hele opgaven er klaret i første forsøg uden Vis
svaret. Den gule hintknap giver to hint og så Vis svaret. Når kortet er grønt, er
scenen låst (et klik får knappen videre til at blinke).

## Filer

```
index.html            toplinjen, de to faner (scene med kort + panel), teorien, rundvisningen
css/stil.css          alt udseende (grundlaget er sb4.4). NB: decimaltal med PUNKTUM i CSS
js/kerne.js           NK-navnerummet, hævet skrift, skarpt canvas, hukommelse
js/data.js            grundstofferne, det periodiske system, molekylerne med facit og hint,
                      elevtegningerne til Find fejlen og de tekster, der bygges af modellen
js/prik.js            modellen uden canvas: atomets tegning og bogens regel, parring af
                      elektroner, gitterpladser, fordeling af de frie elektroner, status
js/tegning.js         alt, der tegnes, og geometrien, der også bruges til musen og optællingen
js/fane.js            det fælles for fanerne: kortet, hintknappen, Indsend svar, listen
js/sim_byg.js         fanen Byg
js/sim_fejl.js        fanen Find fejlen
js/rundvisning.js     rundvisningen bag ?
js/app.js             faneskift, teorien, tastatur og tegneløkken
_selvtest.html        udviklerværktøj, se nedenfor
```

## At rette i den

**Molekylerne** står i `D.MOLEKYLER` i `js/data.js`: formlen, navnet, atomerne i den
rækkefølge, de ligger på bordet, `om` (det atom, der tælles omkring), `facit`
(gitterplads for hvert atom og bindingerne som [atom, atom, antal par]), `bygt` (det
grønne kort, når molekylet er bygget) og `hint`. Et nyt grundstof kræver en linje i
`D.EL` (med farven på dets elektroner).

**Elevtegningerne** står i `D.FEJL`: atomer, gitterpladser, bindinger og `frie` (det
antal frie elektroner, tegningen har ved et atom). Hvilket atom der er forkert, regnes
ud af tegningen. `ret` er den rettede tegning.

**Placeringen.** Atomerne står på et gitter, og en binding går altid til nabofeltet,
så bindingerne går vandret og lodret som i bogen. Den mindste del flytter hen til den
største, og et løst atom sættes på den side, der vender ind mod det. De frie elektroner
lægges på de sider, bindingerne ikke bruger: en uparret elektron helst lige ud for en
binding (så næste binding gør molekylet lige, fx O=C=O), ellers så symmetrisk som
muligt. Det står i `P.binde` og `fordel` i `js/prik.js`.

## Forenklinger

* Kun oktet- og duetreglen. Ingen udvidet oktet, ingen ioner, ingen formelle
  ladninger, ingen koordinationsbindinger.
* Bindinger dannes kun af uparrede elektroner (bogens model). For de ti molekyler
  er "alle elektroner parret, og alle atomer hænger sammen" det samme som facit;
  selvtesten prøver det med 2500 tilfældige byggerier.
* Molekylerne tegnes fladt med vinkler på 90° som i bogens prikformler. Formen ejer
  `sc3.2_rumlig_opbygning`, og polariteten `sc3.3_polaere_molekyler`.
* Find fejlen tjekker ikke elektronregnskabet for hele molekylet, kun om hvert atom
  har 8 (hydrogen 2). Hver tegning har højst én fejl.

## Genveje

<kbd>1</kbd> <kbd>2</kbd> fane · <kbd>R</kbd> forfra · <kbd>H</kbd> rundvisning ·
<kbd>T</kbd> teori · <kbd>Enter</kbd> indsend eller næste · <kbd>Esc</kbd> luk

Påskeæg: et klik på en ædelgas i det periodiske system.

## Selvtest

`_selvtest.html` skal åbnes gennem en lokal server. Den kører i 1100 × 700 og
tjekker grundstofferne og bogens regel, facit, 2500 tilfældige byggerier, at
atomerne aldrig står oven i hinanden, Find fejlens tegninger, begge fanernes
forløb (selv, med fejl og med Vis svaret), stjernerne, låsen, sproget og kortets
højde. Sidst kørt: ALT OK (64), 25. oktober 2026.

## Menuen

Animationen er i menuen (`samling_c3.html` og `samling_NV.html`) og linkes fra
Kemibogen 3.1, T1.7 og T3.1 og slides til kapitel 3. Fanen Find fejlen åbnes direkte
med `index.html#fejl`.
