# sc4.6 Umættet fedt og bromvand

En superanimation i sin egen mappe. Åbn **`index.html`**. Mappen henter kun
filer inde fra sig selv og virker også, når den åbnes direkte fra harddisken.
Der er ingen Kemichael. Al tekst står på papirkortet øverst midt i scenen, og
den gule hintknap sidder på kortet.

Den afløser `kemi-c-filer/c4.7_fedtstoffer_additionsreaktioner.html`
("Umættet fedt?", nr. 6 i `samling_c4.html` med koden `c4.5`, og nr. 9 i
`samling_NV.html`). Den hører til Kemibogens afsnit 4.6 (Fedtstoffer) og
øvelse 4.6b (Hvor umættet er olien?). Mappen hedder 4.6 efter pladsen i
panelet (knap 6 i C4).

## Bestillingen (12. november 2026)

Brugeren: "begynde med at lave fedtstof bromvand om til en superanimation".
Brugeren valgte tre faner og bogens fire fedtstoffer plus smør og fisk (begge
anbefalingen).

1. **Pointen:** Hver dobbeltbinding i et fedtstof kan addere ét dibrommolekyle,
   så jo mere umættet fedtstoffet er, jo flere dråber bromvand kan det affarve.
2. **Hvad den afløser, og hvad der skal med.** Fra den gamle: fedtstofferne
   smør, olivenolie, solsikkeolie og fiskeolie, gættet før forsøget (forsvinder
   farven?), molekylerne, hvor dibrom sætter sig på dobbeltbindingerne, og
   resultaterne samlet ét sted. Quizzens fem spørgsmål er blevet til
   spørgsmålene på kortet efter hvert forsøg. Nyt: dråberne tælles, som i
   øvelse 4.6b, så forskellen mellem fedtstofferne bliver et tal, og modellen
   giver det tal (den gamle placerede dobbeltbindingerne tilfældigt).
3. **Naboerne:** `sc4.4_addition_og_plastik` ejer selve additionen på ethen og
   bromvand med carbonhydrider (mættet eller umættet); her er additionen kun
   det, der sker, og der er ingen alkener. `sc4.5_fedtstoffer` ejer at bygge et
   fedtstof, knæk og smeltepunkt og hærdning; her bliver kæderne ikke rettet
   ud, og der er ingen temperatur. `v2/superlab/sc4.8_substitution` ejer
   bromvand og heptan i lys og mørke; her står kun én sætning i teorien om, at
   glassene ikke må stå i stærkt lys.
4. **Loftet:** tre faner, 13 opgaver (5 + 4 + 4). Fane 1: fem glas, én pipette
   og én lup med to molekyler. Fane 2: ét molekyle med tre fedtsyrer. Fane 3:
   fire flasker, én pipette og én lup.
5. **Layoutet:** scene plus panel. Øverst i scenen kortet, under det luppen
   (fane 1 og 3) eller tavlen (fane 2), nederst glassene.

Stop-listen er overholdt: der hældes ikke. Glassene står klar med fedtstoffet i
heptan, og pipetten drypper én dråbe pr. klik. Der er intet affaldsglas, intet
uheld og intet forløb trin for trin.

## Fanerne

**1 Dryp og tæl** (`#dryp`). De fem glas fra øvelse 4.6b: kokosfedt,
olivenolie, rapsolie og solsikkeolie i heptan og kun heptan i glas 5. Pipetten
hænger over det glas, opgaven handler om. Et klik på pipetten (eller glasset)
drypper én dråbe i; glasset ryster sig selv, og luppen viser to
fedtstofmolekyler fra glasset, hvor dibrom finder en dobbeltbinding og
adderer. Når farven i det øverste lag bliver, trykker eleven **Indsend svar:
7 dråber**. Fem opgaver: olivenolie (gæt: forsvinder farven?), kokosfedt (gæt:
flere eller færre?), solsikkeolie (gæt), rapsolie (gæt og rækkefølgen) og kun
heptan (hvor mange dobbeltbindinger var der i glas 2: 7 − 1 = 6). Skemaet i
panelet får kolonnen Minus glas 5, når glas 5 er talt.

**2 Ét molekyle** (`#molekyle`). Ét fedtstofmolekyle på en lys tavle, tegnet
som bogens figur (CH₂, CH og CH₂, esterbindingen -O-C(=O)- og tre zigzagkæder).
Eleven klikker på de bindinger, der er dobbeltbindinger mellem to
carbonatomer (de bliver gule), og trykker Indsend svar. C=O ved
esterbindingen er en fælde med sin egen forklaring. Er markeringen rigtig,
flyver ét dibrommolekyle hen til hver dobbeltbinding og adderer. Fire
opgaver: olivenolie (monoumættet), solsikkeolie (polyumættet), kokosfedt
(ingen dobbeltbindinger: Indsend svar uden at markere noget) og tran (DHA med
seks dobbeltbindinger). Efter opgaven står slagsen ved hver kæde.

**3 Ukendte fedtstoffer** (`#ukendt`). Fire flasker A til D med smør, tran,
kokosfedt og rapsolie. Eleven drypper og tæller som på fane 1 og finder
fedtstoffet ud fra varedeklarationerne i panelet (mættede, monoumættede og
polyumættede fedtsyrer i procent). Luppen viser en flaske, først når
fedtstoffet er fundet. Tran har færre polyumættede fedtsyrer end rapsolie,
men de har fem og seks dobbeltbindinger; det står under varedeklarationerne,
og det er pointen i opgaven med flaske B.

## Modellen

* **Én dråbe giver ét dibrommolekyle i luppen.** Hvert dibrommolekyle adderer
  til én ledig dobbeltbinding (skiftevis i de to molekyler). Er der ingen
  ledige, bliver det frit i laget. Farven i det øverste lag regnes af antallet
  af frie dibrommolekyler (`NK.Roer.alfa` i `js/glas.js`): ingen giver et
  farveløst lag, ét et svagt orange, flere mere orange. Farven bliver derfor
  ved efter dråbe nummer (dobbeltbindinger i luppen + 1). Det tal tæller
  eleven, og kun det tal godkendes. For få dråber giver en forklaring; for
  mange godkendes uden stjerne med forklaringen om, hvilken dråbe der tæller.
* **De to molekyler** (`F.FEDT` i `js/fedt.js`) er valgt, så andelene af
  mættede, monoumættede og polyumættede fedtsyrer kommer så tæt på bogens
  tabel, som seks fedtsyrer kan, og så iodtallet, regnet af de to molekyler,
  ligger i intervallet fra tabellen på Wikipedia, som øvelse 4.6b bruger:

  | Fedtstof | Molekylerne | C=C | Dråber | Iodtal (model) | Iodtal (Wikipedia) |
  |:--|:--|:-:|:-:|:-:|:-:|
  | Kokosfedt | La La P, La M S | 0 | 1 | 0 | 6 til 11 |
  | Smør | P S O, P P O | 2 | 3 | 30 | 25 til 42 |
  | Olivenolie | O O O, P O L | 6 | 7 | 87 | 75 til 94 |
  | Rapsolie | O O L, O O L | 8 | 9 | 115 | 110 til 126 |
  | Solsikkeolie | O L L, P L L | 9 | 10 | 132 | 110 til 145 |
  | Tran | P O DHA, O O L | 11 | 12 | 156 | 148 til 183 |
  | Kun heptan | | 0 | 1 | | |

  La er laurinsyre (12 C), M myristinsyre (14 C), P palmitinsyre (16 C), S
  stearinsyre, O oliesyre, L linolsyre (18 C) og DHA (22 C, seks
  dobbeltbindinger). Selvtesten regner iodtallene og tjekker dem.
* **Kilder:** procenterne for kokosfedt, smør, olivenolie, rapsolie og
  solsikkeolie er tabellen i Kemibogens afsnit 4.6. Tran: USDA FoodData Central
  (FDC 173577, torskeleverolie: 22,6 g mættede, 46,7 g monoumættede og 22,5 g
  polyumættede pr. 100 g), afrundet til 25, 50 og 25 % af fedtsyrerne.
  Iodtallene: tabellen "Iodine value" på engelsk Wikipedia (samme som øvelse
  4.6b).
* **Kæderne** tegnes med sc4.5's regel (`F.kaede`): zigzag med 120°, og hver
  cis-dobbeltbinding bøjer kæden 30°. Alle kæder bøjer nedad (DHA vendes), den
  mest bøjede sidder nederst, og to naboer, der bøjer lige meget, får mere luft
  (`raekkeY`), så de ikke løber sammen efter knækkene.

## Forenklingerne

* Luppen viser to molekyler for hele glasset, og én dråbe giver ét
  dibrommolekyle. I et rigtigt glas er der mange milliarder af begge.
* Kokosfedt har ingen dobbeltbindinger i luppen, selv om kokosfedt har 9 %
  umættede fedtsyrer (iodtal 6 til 11). Med kun seks fedtsyrer i luppen bliver
  det til ingen. Glas 1 affarver derfor lige så lidt som glas 5.
* Tran har en linolsyre i stedet for endnu en omega-3-fedtsyre, så iodtallet
  passer. Smør har ingen af de korte fedtsyrer, smør også indeholder.
* Bromatomerne sætter sig på ydersiden af knækket, og kæden beholder sin form.
  Heptan tegnes kun i glasset med kun heptan.
* Dråberne gør vandlaget i bunden lidt højere; vandet er farveløst efter
  rystningen, fordi dibrom går op i heptanen.

## Filerne

* `index.html`, `css/stil.css` (fra sc4.4; nyt nederst: skemaerne i panelet).
* `js/fedt.js`: fedtsyrerne, fedtstofferne, kæderne og `NK.Proeve`, det
  øverste lag i ét glas.
* `js/data.js`: glassene, de 13 opgaver og alle tekster.
* `js/glas.js`: reagensglasset, der drypper, ryster og farves.
* `js/lup.js`: luppen. `js/tegning.js`: molekylerne, brom som orange kugler i
  luppen og som Br på tavlen, og det fælles fra sc4.4.
* `js/sim_dryp.js`: fane 1 og 3 (samme kode, to sæt data).
  `js/sim_molekyle.js`: fane 2.
* `js/fane.js`: kortet, låsen og hintene fra sc4.4. Nyt: Indsend svar også i et
  forsøg (`forsoegIndsend`, `kanIndsendes`, `indsendTekst`, `ikkeKlar`).
* `js/kerne.js`, `js/sprites.js`, `js/rundvisning.js`, `js/app.js` fra sc4.4.
* `sprites/`: `reagensglas.svg` (fra sc4.4), `reagensglas_aaben.svg` (uden prop)
  og `pipette.svg`. `_sprites.html` viser dem alene.
* `_selvtest.html`: modellen, iodtallene, teksterne, alle opgaver (med musen,
  med for få og for mange dråber, med forkerte markeringer og med Vis svaret),
  låsen og fire skærmstørrelser. ALT OK (393) 12. nov. 2026.

## Papirkortet

Kortet er det lyse papirkort fra start (se Fælles krav i `../README.md`).
Efter et rigtigt svar bliver kortet på spørgsmålet med forklaringen under
svarene, og Næste står, hvor Indsend svar stod. Pipetten og markeringerne
løser aldrig en opgave selv; Indsend svar viser, hvad der sendes (7 dråber,
3 dobbeltbindinger).

## I menuen

Ikke i menuen endnu. Når brugeren siger til: knap nr. 6 "Umættet fedt?" i
`kemi-c-filer/samling_c4.html` (koden `c4.5`) og nr. 9 i `samling_NV.html`
peger på denne mappe, `index.html` får linjen til `til_panelet.js`
(`data-panel="samling_alt.html" data-emne="c4.5"`), og kolonnen "I menuen" i
`../README.md` rettes. Den gamle fil flyttes til `kemi-c-filer/arkiv/` med
`_oldversion` i navnet. Kemibogens afsnit 4.6 kan få en Prøv selv-linje hertil.
