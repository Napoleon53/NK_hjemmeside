# sc2.2 Saltbyggeren

Superanimation om, hvordan et salt er sat sammen af ioner. Åbn `index.html`.
Mappen henter kun filer inde fra sig selv, bortset fra Kemichael
(`../../v2/kemichael/`), og virker også, når den åbnes direkte fra
harddisken.

Den afløser `animationer/kemi-c-filer/c2.2_salte_sammensatte_ioner.html`. Den
er i menuen fra 26. sept. 2026 (se nederst).

## Bestillingen

1. **Pointen:** et salt består af hele ioner i det mindste forhold, hvor
   ladningerne går lige op.
2. **Afløser** den gamle c2.2. Med fra den gamle: en neutral forbindelse af
   én positiv og én negativ ion, frit byggeri og opgaver på samme bord, og
   muligheden for at skjule ionernes navne.
3. **Naboerne:** `sc2.1_salt_i_vand` ejer opløseligheden (hvor meget, varme,
   mætning), `sc2.3_kemikalielageret` ejer at skrive formler og navne, og
   `sc2.4_faeldningsreaktioner` ejer bundfald og ionskemaer. Her er navnet
   kun sidste trin i en byggeopgave, og et tungtopløseligt salt bliver bare
   liggende. Fane 3 blander ingen opløsninger og har intet bundfald, så den
   rører ikke sc2.4.
4. **Loftet:** 3 faner. 11 positive og 9 negative ioner på hylden, højst 6
   af hver på bordet. Ét bægerglas med højst 18 ioner. Fane 3: 11 ukendte
   metalioner og 9 ukendte sammensatte ioner i 27 opgaver, ladning 1 til 4.
   Én opgaveknap pr. fane.
5. **Layoutet:** scene plus panel på alle faner. Scenen har det, eleven
   arbejder med (bordet, glasset), panelet har opgavekortet.

Fane 3 blev valgt af brugeren ud af tre forslag (den ukendte ion, fra atomer
til salt, byg krystallen). Den bruger reglen baglæns og på ioner, eleven ikke
har lært udenad, og den genbruger bordet. Rækkefølgen er byg, opløs, ukendt
ion: superanimationernes README anbefaler den ukendte prøve i sidste fane, og
saltet følger stadig med fra fane 1 til fane 2.

## Hvad viser den

| # | Fane | Hvad man gør | Pointe |
|---|------|--------------|--------|
| 1 | Byg salte | trækker ioner ned på bordet, til lynlåsen lukker | formlen er **det mindste antal**, hvor ladningerne går op |
| 2 | Opløs i vand | lægger et salt i vandet og ser det gå i opløsning | ionerne går fra hinanden, men **en sammensat ion holder sammen** |
| 3 | Ukendt ion | trækker i en ukendt ion, til lynlåsen lukker, og bruger den så | **formlen afslører ladningen**, fordi saltet er neutralt |

Fane 1 og 2 er en sandkasse med et opgavekort under. Knappen i opgavekortet
går `Start opgave` → `Giv hint` → `Vis svaret` → `Ny opgave` (mønster: sc1.1).
Løser eleven selv opgaven, springer knappen til `Ny opgave`. Et vist svar
tæller ikke med i "løst". `Afslut` fører tilbage til sandkassen. Fane 3 er
kun opgaver og begynder med `Start opgave`.

**Fane 1.** Formlen og navnet står under bordet, når lynlåsen er lukket. En
kort note i scenen dukker kun op, når der er noget, lynlåsen ikke selv viser:
"Afstem for mig" undervejs, et fuldt bord, flere ens enheder (2 Mg²⁺ og
2 SO₄²⁻), eller et stof, der ikke findes (Al₂(CO₃)₃). Opgaverne skiftes:

* *navn → formel:* byg fx aluminiumsulfat, og vælg den rigtige skrivemåde.
* *formel → navn:* læg ionerne i fx Fe₂(SO₄)₃, og vælg navnet. Formlen
  afslører ladningen: med tre sulfationer må jernet være Fe³⁺.

Under en opgave er formlen under bordet slået fra, ellers ville den røbe
svaret. Hintet passer til det sted, eleven sidder fast: ionernes formler,
fremgangsmåden med den korteste række, parentesen eller ladningen.

**Fane 2.** Et salt, man har bygget på fane 1, kan tages med herover med
knappen "Opløs det i vand". Opgaverne skiftes:

* *forudsig:* saltet ligger i et tomt glas. Hvad kommer der ud, når der
  hældes vand på? Svaret kommer før opløsningen: først når der er svaret,
  hældes vandet på, og saltet går i opløsning.
* *hvilket:* ionerne svømmer i glasset. Tæl dem, og find saltet. Så
  fordamper vandet, og krystallen samles igen.

Påskeæg: klik i vandet, og der røres rundt (som i sc2.4). Et letopløseligt
salt går hurtigere i opløsning. Et tungtopløseligt hvirvles op og synker
igen; det går ikke i opløsning af at blive rørt.

**Fane 3.** Formlen står over bordet, fx SnO₂ eller K₂CrO₄. Den ene ion
ligger ikke på hylden. Ionerne ligger på bordet i det antal, formlen siger,
og står fast. På væggen over bordet hænger to plakater som i sc2.3: det
periodiske system (venstre) og de sammensatte ioner (højre). De kan altid
klikkes op i stort format, også før opgaven er startet. Opgaven
stilladseres, så hvert trin låser det næste op. Knappen hedder først "Start
opgave" og giver derefter hint og svar til ét trin ad gangen (som i sc2.4).
Et løst trin viser svaret til højre i trinlisten (O²⁻, Sn⁴⁺) og en kort
forklaring under. Kun det senest løste trin har forklaringen, og hint og
besked forneden ryddes ved hvert nyt trin, så de kun handler om det trin,
man er i gang med.

0. **Opgaven.** Formlen og det, der skal findes: "Formlen er SnO₂. Tin kan
   have flere ladninger. Hvilken ladning har tin her?" Begge ioners kort er
   foldet sammen med "?", og der er intet regnskab ved lynlåsen, for det
   ville røbe svaret. Knappen hedder "Start opgave".
1. **Den kendte ion.** Kemichael kommer ind fra venstre, peger på den ion,
   eleven kender, og siger en tør linje ("Start med O. Den kender du.").
   Kortene lyser gult. En linje i opgavekortet siger, at ladningen kan
   udledes af det periodiske system (grundstof i en hovedgruppe), eller at
   en sammensat ions ladning skal man kende. Eleven vælger blandt fire
   ladninger. De forkerte er de typiske fejl: fortegnet byttet om og
   antallet af elektroner i yderste skal brugt som ladning (O²⁺, O⁶⁺, O⁶⁻).
   Kan eleven ikke huske ladningen, får **Giv hint** plakaten med det
   periodiske system til at lyse og åbner den med grundstoffet fremhævet.
   Hovedgrupperne er nummereret 1-8 (hovedgruppen er antallet af elektroner
   i yderste skal). For en sammensat ion er det plakaten med de sammensatte
   ioner. Et link i hintet åbner plakaten igen. Teorien står i hintet, ikke
   hos Kemichael.
2. **Den ukendte ion.** Kortene folder sig ud, og den ukendte ion starter
   *uden* ladning: kortet har "?" og ingen plusser, alle den kendte ions
   tænder står uden partner, og mærket for enden siger med rødt "går ikke
   op". Eleven trækker i kortet (gult greb i højre kant) eller bruger
   knapperne ved siden af, som viser ionen med den ladning, der prøves, fx
   Sn²⁺. Efter hvert forsøg siger en kort besked under bordet, hvor langt der
   er igen: "+2 og −4: der mangler plus. Træk kortet bredere." eller "for
   meget plus. Træk kortet smallere."
3. **Brug ionen.**
   * *ukendt metal:* vælg navnet med det rigtige romertal. De forkerte svar
     er romertallet som den samlede ladning (chrom(VI)sulfat), som det lille
     tal ved den negative ion (tin(II)oxid for SnO₂), som antallet af
     metalioner, og romertallet glemt. Hintet siger, at romertallet er
     ladningen på én metalion, og oversætter I-IV.
   * *ukendt sammensat ion:* ionen skal bruges i et nyt salt, fx
     bariumchromat eller calciumhypochlorit. Her skal man kende begge
     ladninger, så der kommer et ekstra trin først: "Find ladningen på Ca",
     med samme fire slags svar som trin 1 og et hint, der åbner det
     periodiske system på Ca. Derefter vælges formlen. De forkerte svar er de
     samme typiske fejl som på fane 1 (CaClO₂ uden parentes, tallene byttet
     om, ikke forkortet). Hintet nævner begge ladninger og parentesen.
     Partnerne er alle metaller fra hovedgruppe 1 og 2.

Oxiderne SnO₂, PbO₂, MnO₂ og TiO₂ er med med vilje: det lille tal ved O er
antallet af oxidioner, og krydsreglen baglæns giver den forkerte ladning.
Hintet til trin 2 tæller den kendte ladning op og siger, hvor mange ioner
den skal deles mellem. Hver tredje opgave, eleven løser selv, kommer
Kemichael med en kort ros.

**Kemichael** hentes fra `../../v2/kemichael/kemichael.js` som i sc2.1 og
rettes ikke her (mappen er frosset). `js/sprites.js` giver ham de sprites, han
skal bruge, `js/kerne.js` har de tre hjælpere, han regner med (`NK.blod`,
`NK.r`, `NK.tilVerden`), og `js/laerer.js` kobler ham på alle tre faner.
Klik på ham giver de fælles svar, når man prikker til ham.

* **Præsentationen.** Første gang en fane åbnes i browseren, går han ind og
  siger to eller tre korte linjer (`D.INTRO` i `js/data.js`) og peger på
  hylden, panelet eller plakaterne. Fanen er ikke låst imens. Han går kun,
  når eleven vil det: knappen "Spring præsentationen over", to klik på ham
  eller Esc. Det huskes pr. fane i browseren (`nk-sc2.2-intro-<fane>`), og
  <kbd>K</kbd> får ham til at præsentere fanen igen. Mønster: sc2.3.
  Trykker man Start opgave på fane 3, mens han præsenterer, går han direkte
  over til at vise, hvor man starter.
* **Størrelsen.** Han tegnes med 0,92 × lærredets højde / 600 som i sc2.3,
  og scenens gulv (`NK.Scene.GULV`) sættes til lærredets bund, hver gang han
  tegnes. Med den mindre skala før blev kitlen under ham lang, så det lignede
  lange ben. Samme løsning som F84 i det virtuelle laboratorium, men uden at
  røre den fælles fil, så Kemichael i de andre animationer er uændret. Han
  stiller sig så langt til venstre, han kan uden at blive skåret af.

Teorien står bag knappen Teori. Rundvisningen bag `?` peger på ét element ad
gangen på den fane, man står på.

Direkte links: `index.html#vand`, `#ukendt`, `#opgaver` (opgave på fane 1)
og `#vandopgaver` (opgave på fane 2).

Genveje: <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> faner · <kbd>R</kbd> ryd
bordet eller start opgaven forfra · <kbd>H</kbd> rundvisning · <kbd>T</kbd>
teori · <kbd>K</kbd> Kemichael præsenterer fanen igen · <kbd>Esc</kbd> luk
og send Kemichael ud af præsentationen.

## Hvad er nyt i september 2026

Brugeren syntes, at der var for meget tekst, og at krystallen var grim.
Konceptet (lynlåsen, de to faner) er beholdt. Skåret væk:

* kortene Formlen og Ladningsregnskab i panelet (lynlåsen viser regnskabet,
  og formlen står under bordet) og linjen med atomtal
* statuslinjen nederst i scenen (erstattet af noten, der kun kommer, når der
  er noget at sige)
* skiftet mellem "Byg frit" og "Opgaver" og knapperne Let og Svær (nu én
  afkrydsning "Vis navne på ionerne", der gælder både bord og opgaver)
* opgaveboksen oven på bægerglasset og "Frit valg" som særskilt tilstand
* hjælpe-vinduet med lang tekst (nu rundvisning og teori)
* knapperne "Vis svaret" og "Ny opgave" ved siden af hinanden (nu én knap)
* alle tankestreger i teksterne

Nyt: krystalgitteret, bægerglasset som sprite, hints, forudsig-opgaven i et
tomt glas, påskeægget og fane 3 (den ukendte ion). Rettet: et træk fra
hylden kunne markere hele hylden som tekst, og så slæbte browseren
markeringen med i stedet for ionen.

Anden runde på fane 3: løste trin viser svaret i trinlisten, og hintet
forsvinder, når trinnet er løst (før blev det stående, så det var uklart, om
det stadig gjaldt). Plakaterne fra sc2.3 hænger på væggen og kan altid
åbnes. Opgaver med en ukendt sammensat ion har fået trinnet "Find ladningen
på Ca", før formlen skal vælges, og det sidste hint er mere hjælpsomt.
Kemichael præsenterer hver fane første gang og er ikke længere langbenet.

## Krystalgitteret

Krystallen bygges af `NK.lavGitter` i `js/gitter.js`. Hver krystal er et
udsnit af det samme mønster: et skakbræt, hvor plus og minus skiftes. Så
sidder hver ion op ad ioner med modsat ladning, og to ioner med samme
ladning rører aldrig hinanden.

| Forhold | Gitter | Eksempel | Ioner |
|---------|--------|----------|-------|
| 1 : 1 | skakbræt, 4 × 3 | NaCl, BaSO₄ | 12 |
| 1 : 2, 2 : 1 | den hyppigste ion i et net på 4 × 3, den anden i alle hullerne mellem fire naboer | CaCl₂, Na₂SO₄ | 18 |
| 1 : 3, 3 : 1 | samme, net på 3 × 2 | AlCl₃, Na₃PO₄ | 8 |
| 2 : 3, 3 : 2 | skakbræt, 6 × 3, hvor den sjældneste ion mangler i øverste lag | Al₂(SO₄)₃, Ca₃(PO₄)₂ | 15 |

Afstanden i gitteret er den mindste, hvor ingen ioner overlapper, og hvor
ioner med samme ladning holder en lille afstand. Krystallen regnes i enheder,
der ikke afhænger af skærmen, og skaleres først, når den tegnes. Antallet af
ioner i glasset er altid et helt antal formelenheder (`k`), så tallene i
hvilket-opgaven passer.

## Forenklinger

* **Todimensionalt gitter.** Rigtige krystaller er tredimensionale, og de
  fleste salte har ikke et skakbrætmønster. Reglerne er de rigtige: modsatte
  ladninger rører hinanden, ens ladninger gør ikke, og forholdet er formlens.
* **Størrelserne** i vandet har tre trin i samme rækkefølge som
  ionradierne: metalionerne er mindst (radius 0,8), de enkle negative ioner
  og OH⁻ er mellemstore (1,0), og de øvrige sammensatte negative ioner er
  størst (1,25). NH₄⁺ er på størrelse med en negativ ion (1,05). Forholdene
  er ikke i skala, så formlerne kan læses på kuglerne.
* **Sammensatte ioner** er tegnet som én kugle med formlen på i vandet, som i
  resten af superanimationerne. På byggefanen vises atomerne, så de kan
  tælles.
* **Opløseligheden** i `D.oploeselighed` er huskereglerne fra
  fældningsopgaverne: nitrater og alt med natrium, kalium og ammonium er
  letopløseligt, resten står som undtagelser. Grænsen og tallene hører til
  sc2.1.
* Oxider og sulfider reagerer med vand. Bygges de på fane 1 og sendes til
  vandet, står der kun, at de reagerer.
* Et salt i forudsig-opgaven ligger i et tomt glas, så det ikke skal ligge
  uopløst i vand, mens eleven tænker.
* Mængden af vand betyder ikke noget her, så bægerglasset er det samme som i
  sc2.1 og sc2.4, men uden tal ved stregerne.
* **Ladningen af gruppen** (fane 3, trin 1) bruger lærebogens regel for
  hovedgrupperne: metaller afgiver elektronerne i yderste skal, og
  ikke-metaller optager dem, der mangler i at have 8. Den gælder for de
  ioner, der bruges her (K⁺, Na⁺, Mg²⁺, Ca²⁺, Ba²⁺, Cl⁻, O²⁻). Grupperne
  nummereres 1-8 som hovedgrupper, ikke 1-18, for så er nummeret antallet af
  elektroner i yderste skal.
* **Fane 3** regner SnO₂, PbO₂, MnO₂, TiO₂, Cr₂O₃ og Cu₂O som salte af ioner,
  som lærebøgerne gør på dette niveau. Bindingen i dem er delvis kovalent.
  Metallerne har romertal i navnet, også nikkel og cobalt, der næsten kun
  findes som 2+.

## Filer

```
index.html          toplinje, de tre faner, teori og rundvisning
css/stil.css        alt udseende. NB: decimaltal med PUNKTUM i CSS
js/kerne.js         NK-navnerum, hævet og sænket skrift, canvas, tegnehjælpere
js/data.js          ionerne og alt, der kan regnes ud af dem: formler, navne,
                    atomtal, opløselighed, opgavelister og svarmuligheder
js/tegning.js       ionerne i lærredet: med atomer (bordet) eller som én kugle
                    (vandet), og plakaterne på væggen på fane 3
js/gitter.js        krystalgitteret og ionernes størrelse i vandet
js/opgave.js        den ene opgaveknap, svarknapperne, trinlisten, næste opgave
js/bord.js          arbejdsbordet: hylder, kort, lynlås, træk og slip
js/sim_bord.js      fane 1: sandkassen og de to opgavetyper
js/sim_vand.js      fane 2: bægerglasset, opløsning og inddampning
js/opslag.js        plakaterne i stort format: det periodiske system og de
                    sammensatte ioner (samme som i sc2.3)
js/sim_ukendt.js    fane 3: trinene, bordet uden hylder og plakaterne
js/sprites.js       indlæser Kemichaels sprites (samme opbygning som sc2.1)
js/laerer.js        Kemichael: præsentationen på alle faner, og på fane 3
                    viser han, hvor man starter, og roser
js/rundvisning.js   rundvisningen bag ?
js/app.js           faneskift, tastatur, tegneløkke
sprites/            bægerglasset
_selvtest.html      udviklerværktøj, indgår ikke i animationen
```

Hver fane er et objekt med `tilpas()`, `opdater(dt)`, `tegn()` og `nulstil()`.
`app.js` kalder kun den aktive fane.

## At rette i den

**Nye ioner** tilføjes i `D.IONER` øverst i `js/data.js`. En ion har `id`,
`formel` (med sænkede tal), ladningen `q` og `navn`. Er den sammensat, skal den
også have en lille tegning: hvert atom med symbol, x, y og hvilket atom det er
bundet til, målt i bindingslængder. Formlen og tegningen skal passe sammen;
det tjekker selvtesten. Størrelsen i vandet står i `radius` i `js/gitter.js`.

**Navnene** følger reglen fra bogen: en positiv ion får "-ion" bagpå, når den
står alene (natriumion), men ikke inde i saltets navn (natriumsulfat). Metaller
med flere mulige ladninger har `variabel: true` og et `grund`-navn uden
romertal.

**Opgavelisterne** står samlet i data.js. Listen til navn → formel har et
trin-tal (1-3): eleven får kun de svære opgaver, når de lette er løst.

**Fane 3** har sine ioner i `D.UKENDTE` og opgaverne i `D.UKENDT_OPGAVER`.
En opgave med en ukendt sammensat ion skal have en `partner` fra hylden til
trin 2, og saltet med partneren skal findes. Ladningen kan indstilles fra
`D.UKENDT_MIN` til `D.UKENDT_MAKS` (1 til 4). Selvtesten tjekker, at præcis én
ladning lukker lynlåsen i hver opgave. Bordet kører her uden hylder
(`hylder: false`), og `bord.ukendt` gør kortene på den ukendte side så brede
som elevens gæt (`qKort`, `saetGaet`).

**De forkerte svarmuligheder** laves af `formelValg`, `navneValg`, `oploesValg`,
`saltValg` og `romertalValg` (fane 3). Hver er en typisk fejl med sin egen forklaring: sulfid mod
sulfat, nitrit mod nitrat, ammoniak mod ammonium, "dialuminiumtrisulfat",
Al₂SO₄₃ uden parentes, Al₂S₃O₁₂ hvor ionerne er talt væk, (NO₃)₂²⁻ i vandet og
en sammensat ion, der er gået i stykker. Rækkefølgen i hver funktion er
vigtig: den første fejltype, der passer, kommer med først, og der er kun plads
til tre.

**Hints** står i `hint()` i `sim_bord.js`, `sim_vand.js` og `sim_ukendt.js`.

**Sværhedsgraden** er afkrydsningen "Vis navne på ionerne". Rører man ved
noget, der viser en ions navn et nyt sted i koden (en tooltip, en fejlbesked),
så gør det betinget af `bord.navne`, ellers lækker navnet ad bagvejen (se
`saetNavne` i bord.js og `tjekNavn` i sim_bord.js).

**Bordets mål** regnes ud i `layout()` i `js/bord.js`. `U` er bredden af ét
ladningsfelt, og resten følger af den.

**Træk og slip** ligger i `startTraek` (fra hylden) og `koblMus` (kortene på
bordet) i bord.js. Begge bruger pointer-hændelser, så det virker med mus,
finger og pen.

## Selvtesten

`_selvtest.html` skal åbnes gennem en lokal server (Chrome nægter en side på
`file://` at kigge ind i sin egen iframe). Den tjekker formler, navne og
atomtal, at ingen opgave bruger et stof, der ikke findes, at hvert sæt
svarmuligheder har præcis ét rigtigt svar med forklaring, opløselighederne,
at tegningerne passer med formlerne, bordet og "Afstem for mig", at et træk
fra hylden ikke kan blive til en tekstmarkering, den ene opgaveknap på alle
faner, hints til alle 74 byggeopgaver, at skjulte navne også er skjult i
tooltips og beskeder, opløsning, inddampning og omrøring, krystalgitteret for
alle 77 salte i vælgeren (forholdet, ingen ens ladninger, der rører hinanden,
og hver ion rører en modsat), fane 3 (præcis én ladning lukker lynlåsen i
alle 27 opgaver, svarmulighederne, hints, træk i kortet, plakaterne,
partnertrinnet, svarene i trinlisten og hele forløbet), Kemichaels
præsentation (første gang, ikke anden gang, K, Esc, knappen og to klik på
ham), at teksterne er uden tankestreger og 1+/1−, og at rundvisningen peger
på noget, der findes.

## I menuen

I menuen fra 26. sept. 2026 som c2.2 i `kemi-c-filer/samling_c2.html` (navnet
"Saltbyggeren", også i `FEEDBACK_EMNER`). Den gamle ligger i
`kemi-c-filer/arkiv/c2.2_salte_sammensatte_ioner_oldversion.html`.

## Tilbuddet om præsentationen

Siden 24. september 2026 kommer Kemichael ikke af sig selv. Første gang en fane
åbnes, står der Start præsentation og Nej tak midt foroven i scenen. Start
sender ham ind, Nej tak og Esc husker valget, og K viser præsentationen uden at
spørge. Koden er `js/praesentation.js` (samme fil som i sc1.2), som i
`js/app.js` pakker den gamle `startIntro` ind (`NK.Praesentation.pakInd`).
Reglen står i `../README.md` under "Kemichael præsenterer hvert rum".
