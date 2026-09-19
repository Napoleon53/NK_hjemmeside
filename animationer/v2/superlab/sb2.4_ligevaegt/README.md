# sb2.4 Indgreb i en kemisk ligevægt

Forsøget lagt over på genstandsmodellen i `../../laboratoriet/`. Den gamle
udgave ligger urørt i `../sb2.4_jernthiocyanat/` og kører videre; den har
sin egen håndskrevne `forsoeg.js`, `scene.js`, `bord.js` og `model.js` på
omkring 190 KB. Denne bruger den fælles motor og består af syv små filer.

Åbn **`index.html`**. Mappen henter kun filer inde fra sig selv, bortset
fra `../../laboratoriet/` og `../../kemichael/`, og skal derfor ligge i
`superlab/`, der står ved siden af de to mapper.

## Hvad der er lavet indtil videre

Begge dele kører. Bordet står, kemien opfører sig rigtigt, badene virker,
forløbets tretten trin kører med tekst, hint og en liste i panelet,
billedet af glas 1 til 7 lader eleven notere sine iagttagelser i del 1, og
de fire bægerglas set ovenfra gør det samme for fortyndingen i del 2.
Kemichael siger selv forløbets bemærkninger og et par tørre ord, når et
trin er gjort. Quizzen har alle ti spørgsmål, og tegneserien har sine
ruder. `_selvtest.html` kører det hele igennem i fireogtyve afsnit (plus
3b om boblen og tabellen); afsnit 17 gør det med musen, som en elev
(`laboratoriet/js/proeve.js`), afsnit 18 prøver, at Kemichael kommer ind
bag bordet, standser hvor der er plads, og går ud igen, afsnit 19 prøver
quizzen, afsnit 20 hele del 2 — med tal og ikke med øjnene — afsnit 22
tegneserien, afsnit 23 reaktionerne i zoomboblen og afsnit 24
reagensglassene.
`laboratoriet/_vinduer.html` viser forsøget i to vinduesstørrelser ved
siden af hinanden.

## Filer

```
index.html          stilladset: scene, panel, intro, teoriboks, rundvisning. Ingen prosa.
css/stil.css        ligevægtsligningen og forløbslisten
js/tekst.js         AL prosa: titel, intro, teorien, trinnenes tekster og
                    hints, bemærkningerne, panelets kort, rundvisningens stop
js/opstilling.js    bordet: hvad der står på det, hvilken del det hører til, og bordets mål
js/forloeb.js       trinnenes betingelser og de fem udløsere
js/billede.js       del 1: billedet af de syv glas, optagelsen og knapperne under dem
js/ovenfra.js       del 2: parrene, fortyndingsreglen og de fire glas set ovenfra
js/dele.js          del 1 og del 2 på det samme bord
js/serie.js         tegneseriens ruder, bygget af de to journalers
                    øjebliksbilleder
js/app.js           starter den fælles skal og kobler delene og de to visninger på
js/tur.js           rundvisningen henter sine stop i tekst.js
_selvtest.html      udviklerværktøj, indgår ikke i animationen
```

Alt det, der før stod i hvert forsøgs egen `app.js` — tegneløkken,
aflæsningen af det valgte glas, zoomboblen, beskeden på scenen,
lydknappen, introen, teoriboksen, rundvisningen, tastaturet, logbogen og
Start forfra — ligger nu i `../../laboratoriet/js/side.js`.

**Panelet** holder kun det, man bruger undervejs: det valgte glas' rumfang,
temperatur og pH med indholdet i tal foldet sammen (»Indhold«), forløbet og
tælleren for uheld. Ligevægten står i toplinjen mellem titlen og knapperne.
Teorien bag hvert indgreb ligger i teoriboksen, som åbnes med knappen Teori
eller tasten T. Ved siden af Teori folder knappen Noter (tasten N) elevens
noter ud i laboratoriets øverste højre hjørne; »Notér det valgte glas«
skriver aflæsningen ind, og man skriver videre efter den. Noterne huskes i
browseren. Journalen (billedet af de syv glas) er stadig det, forløbet
bedømmer.

**Laboratoriet** er 1040 bredt (før 1520), så alt er omkring 45 % større
på skærmen. Reagenserne står på tre hylder: over stativet flasken,
dråbeflasken og sprøjteflasken øverst og kaffen, køkkenrullen og
pulverglassene nederst; til højre det tomme bægerglas under plakaten. På
bordet står kun det, man arbejder med: affaldet og kolben til venstre,
stativet, varmepladen med vandbadet og isbadet. Zoomboblen står i
laboratoriets øverste venstre hjørne (`boble: { x, y }`, radius 135, og
kuglerne og skriften i den er en tiendedel mindre end standard,
`bobleIndhold: 0.9`) og skalerer med resten. Et klik på boblen viser den
stor midt på scenen, som luppen i sc6.8; et klik eller Esc lukker den.
Boblen har en stiplet streg ned til det glas, den kigger ind i, og glassets
navn under sig. Skalaen er fast (`partikelRef: 3`: 3 mM giver seks
kugler), så FeSCN²⁺ bliver flere kugler, når der tilsættes Fe³⁺ eller SCN⁻,
og K⁺ og NO₃⁻ er tilskuerioner, som forsøget selv finder (`tilskuere:
true`): de skjules i boblen og står for sig i panelets tabel, når fluebenet
»Vis tilskuerioner« er sat. Opstillingen holder hjørnet frit, og selvtesten
tjekker det.

**Og boblen viser reaktionerne, ikke kun mængderne.** Fe³⁺ og SCN⁻ finder
hinanden og bliver til FeSCN²⁺, komplekset går i stykker igen, Ag⁺ og SCN⁻
fælder et AgSCN, der synker til bunds, og ascorbinsyren fanger to Fe³⁺ på én
gang. Intet af det står i dette forsøg: hændelserne udledes af reaktionerne
i den fælles stoftabel (se »Reaktionerne i boblen« i motorens README). Står
glasset i ligevægt, sker der stadig noget — bind og split kommer lige ofte,
34 af hver på et minut i referencen. Efter et indgreb overvejer den ene
retning, til tallene passer igen. Scenen står forneden i lærredet (`lodret:
"bund"`). Bordpladen er 64 dyb (`bordDybde`), så man kan stille ting foran
stativet; det forreste tegnes forrest. Spatlen, glasstaven og termometeret
ligger forrest fra start.

Kemichael taler bag bordet (`bagBord: { y: 358, skala: 0.82 }`). Der står
intet x: han er ude af scenen, når han ikke har noget at sige, og når han
kommer ind, standser han dér, hvor der er plads — mellem hylderne og
vandbadet, når han taler om reagensglassene, og til venstre for isbadet, når
han taler om det. Bordpladen dækker hans underkrop, og han tegnes mindre,
fordi han er længere væk. Se »Kemichael i forsøget«.

## Reagensglassene

**Rettet samme dag (F33, F31):** glassene rummer 20 mL og er tegnet 87 %
(`rumfangFoelger`), så en portion er 4 mL af sig selv, og `modtager`
bruges ikke længere. Glas 7 hedder **R** (referencen), glas 8 **4a**
(forundersøgelsen, som ikke skal have stamopløsning) og glas 4 **4b**; 4a
står for sig i stativets sidste hul (forsøgets egen `sprites/stativ_4a.svg`
uden tal), og hælder man stamopløsning i det, siger Kemichael det.
Afsnittet herunder beskriver S31, som det først blev lavet.

De otte reagensglas er tegnet en tredjedel mindre end udstyrets
reagensglas (`skala: 2/3` på hver post i `js/opstilling.js`), men står i
stativets huller, som de altid har, så der er luft mellem dem, og de ligner
rigtige reagensglas ved siden af et stativ. `skala` er et rent tegnemål:
glasset rummer stadig 30 mL, og farven og kemien er de samme. Derfor siger
hver post `modtager: 4`: ét tryk — et hurtigt slip fra kolben, pilen, en
flaske — giver 4 mL og ikke en femtedel af glasset (6 mL). Et kortere glas
synker ned i hullet, til det står på stativets bund, og i badet ned til
samme dybde som et fuldt glas, så væsken står frit mellem stativets to
brædder og nede i vandet. Selvtestens afsnit 24 prøver det, også med
musen: ingen to klikfelter overlapper.

## De to dele

Forsøget har to dele, og de bruger hver sit udstyr: del 1 stativet med de
otte reagensglas, badene og pulverglassene, del 2 de fire bægerglas og
frugtfarven. Der er ikke plads til begge dele på ét bord på 1040, og der
skal heller ikke være det — et rigtigt bord har det fremme, man arbejder
med. Derfor står **delen på genstanden**: hver post i `js/opstilling.js`
kan have et `del` (1 eller 2), og `js/dele.js` sætter motorens `skjult` på
den anden dels ting. Så er de væk for tegningen, for musen, for slipmålet
og for zoomboblen på én gang — ingen ny mekanik, det er den samme `skjult`,
et knust glas bruger. Det, begge dele bruger — affaldet, kolben,
køkkenrullen og sprøjteflasken — har intet `del` og står hele tiden.

Der skiftes med knapperne øverst til højre på scenen eller med tasterne
<kbd>1</kbd> og <kbd>2</kbd>, og aldrig midt i en handling: så ville det,
hånden bærer, forsvinde under den. Bordet skifter aldrig selv (F28): når
del 1 er ryddet op (flaget `del1_gjort`), dukker en grøn pil »Videre til
del 2 →« op ved fanerne, så eleven ikke skal gætte, at der er en knap.
Det, der svæver, stilles ned før et skift; tilbage til del 1 kan man
altid. I del 2 står hvert par bægerglas på et hvidt underlag, hvor der
står, hvad parret skal have (F32).

Panelet viser det trin, eleven kan gå i gang med *her* — listen viser
stadig alle tretten, så hele forsøget kan ses på én gang. Det er `kun` på
motorens forløb (`../../laboratoriet/js/forloeb.js`): et filter over,
hvilket af de ugjorte trin der står øverst. Det ændrer intet ved, hvornår
et trin er gjort, og intet ved, hvornår forløbet er færdigt.

## Del 2: fortyndingen

Fire bægerglas, to og to i par. Par 1 får en portion frugtfarve og vand op
til; par 2 ligevægtsblanding — lige meget i begge glas i parret. Derefter
fortyndes det ene glas i hvert par med vand fra sprøjteflasken, helst til
dobbelt rumfang.

Frugtfarven står som en **stamflaske**: 100 mL på 35 mM, ti gange så
kraftig som den farve, der skal stå i glassene. Den doseres derfor og
hældes ikke op — én hældning er 4 mL (`FARVE_PORTION`), og resten af
rumfanget er vand. Sådan bruger man også frugtfarve i et køkken. Fire mL i
et glas, der fyldes til 44 mL, giver 3,2 mM, og det er dét, der står blåt
ovenfra.

**Set fra siden** bliver begge fortyndede glas lysere, og det siger
ingenting: vejen gennem glasset er den samme, og koncentrationen er
halveret. **Set ovenfra** er vejen væskens dybde, og den er fordoblet. De
to ophæver hinanden, og så måler man antallet af farvede molekyler i
stedet for koncentrationen:

| | fra siden | ovenfra |
|---|---|---|
| frugtfarve | lysere | **ens** — lige mange farvestofmolekyler |
| ligevægtsblanding | lysere | **lysere** — færre FeSCN²⁺ |

Forskellen mellem de to par er beviset for, at fortynding i sig selv er et
indgreb i ligevægten. Lysvejen ovenfra står i motoren
(`NK.Udstyr.vejOvenfra`, `NK.Beholder.farve(gg, "ovenfra")`); `js/ovenfra.js`
har parrene og præsentationen.

Et par kendes på sit **indhold** og ikke på sin plads, så det virker også,
hvis eleven bytter om på parrene. Et glas tæller som fortyndet, når det har
mindst 1,4 gange så meget som det andet — uden øvre grænse: dobbelt rumfang
er målet, men mere vand gør bare forskellen tydeligere. Og der skal mindst
30 mL i hvert glas: ses der ned i en sjat på bunden, er lysvejen kun et par
millimeter, og så er selv en kraftig opløsning næsten farveløs.

Facit regnes af verden i svarøjeblikket som alle andre steder: de to glas
lægges på hvidt papir, og lysheden sammenlignes (`NK.Vilkaar.lyshed`). Har
eleven fyldt glassene anderledes end tiltænkt, er det HANS glas, svaret
måles mod. Under hvert par står, hvor meget der er i de to glas, og om de
fik lige meget stof — det er variabelkontrollen, og Kemichael siger til,
hvis de ikke gjorde.

## Kemien

Alt står i den fælles `../../laboratoriet/js/stoftabel.js`. Ligevægten

    Fe³⁺ + SCN⁻ ⇌ FeSCN²⁺        K = 0,14 mM⁻¹ ved 20 °C, ΔH = −20 kJ/mol

var der i forvejen sammen med AgSCN- og Fe(OH)₃-fældningerne. Forsøget
kostede fem nye stoffer og fire reaktioner som **data**, ikke kode:
ascorbinsyre og dehydroascorbinsyre i opløsning, ascorbinsyre, Fe(NO₃)₃ og
KSCN som fast stof, deres tre opløsningsreaktioner og reduktionen

    2 Fe³⁺ + C₆H₈O₆ → 2 Fe²⁺ + C₆H₆O₆ + 2 H⁺

Ascorbinsyrens egen syre-base-ligevægt (pKa₁ = 4,1) er udeladt med vilje;
den ville flytte pH uden at lære noget bort. Skal den med, er det én linje
i stoftabellen.

`DHA/Asc` er **ikke** skrevet ind som redoxpar. Halvreaktionen kræver H⁺
for at stemme i ladning, og de udledte reaktioner mellem par regner ikke
med hydroner, så prøvebordets selvtest fangede med det samme fire
uafstemte reaktioner med Mg, Zn, Fe og Pb. Reduktionen står derfor som en
navngiven reaktion, ligesom Fe³⁺ + I⁻.

## Stamopløsningen

12 mL 0,10 M Fe(NO₃)₃ og 12 mL 0,10 M KSCN fortyndet til 400 mL, altså
3 mM af hver. Ved ligevægt giver det 0,73 mM FeSCN²⁺ og 2,28 mM frit
Fe³⁺ tilbage — altså en fjerdedel omsat, tre fjerdedele til rest.

Den fordeling er hele pointen, og den er tynd med vilje. Ligevægten
Fe³⁺ + SCN⁻ ⇌ FeSCN²⁺ er af anden orden mod første: fortynder man, er der
to partikler at finde hinanden for hver én, der falder fra hinanden, så
ligevægten flytter sig mod venstre. Hvor meget den flytter sig, afhænger af,
hvor langt fra mætning man står. Med en kraftig stamopløsning er næsten alt
SCN⁻ allerede bundet, og der er ikke noget at flytte: ved 8 mM overlever
71 % af komplekset en fordobling af rumfanget, og eleven ser ingenting. Ved
3 mM overlever kun 63 %, og de 37 %, der falder fra hinanden, lægger sig
oveni det frie Fe³⁺, som er gult. Derfor går brændt orange mod rav, når der
fortyndes — ikke fordi farven bliver bleg, men fordi kuløren skifter.
En kraftigere stamopløsning ville være kønnere og pjatteklogere.

Kolben rummer 150 mL af de 200, den kan — nok til del 1, uden at stå til
kanten — og **det store bægerglas på hylden står med 500 mL** af de 600,
det kan: dagens forråd, som del 2 hældes af. Kolben er den håndterlige
portion, bægerglasset batchen. Motoren regner selv ligevægten frem;
opstillingen siger kun, hvad der blev blandet.

De to knapper er adskilte med vilje. **Hvor langt ligevægten kan flytte
sig** står i `STAM` i `js/opstilling.js` — det er koncentrationen, og den
afgør, om fortyndingsforsøget overhovedet kan ses. **Hvor dyb farven er**
står i `k` for FeSCN²⁺ i stoftabellen — ekstinktionskoefficienten, som kun
skalerer mørket, ikke kulørskiftet. Bliver billedet for mørkt, er det `k`,
der skal ned, ikke `STAM`; bliver fortyndingen usynlig, er det omvendt.

## Forløbet

De tretten trin står i `js/forloeb.js` som betingelser over bordets tilstand,
og deres tekster i `js/tekst.js`. Indgrebene er med vilje skrevet som
»glasset ser anderledes ud end glas 7«, ikke som »der blev taget en
spatelspids«: farven er det, der skal læres, så farven er det, der prøves.
Derfor kan eleven nå et trin ad flere veje, og et trin længere fremme
tæller også, hvis det bliver opfyldt først.

Fem udløsere holder øje undervejs. Får glas 7 et indgreb, siger forløbet, at
der ikke længere er nogen reference; får ét glas to forskellige indgreb,
siger det, at man så ikke kan vide, hvad der virkede; og er et glas noteret
anderledes, end det ser ud, beder den tredje eleven kigge igen. I del 2
siger den fjerde til, hvis frugtfarve og ligevægtsblanding ender i samme
glas, og den femte, hvis de to glas i et par ikke fik lige meget stof — den
fyrer på tallene og ikke på handlingen. Alle fem fyrer én gang.
Flaget `indgreb_gjort` sættes, når glas 6 er koldt, og oprydningstrinnet
læser det — ellers ville et tomt bord ved starten tælle som ryddet op.
Flaget `del1_gjort` sættes af oprydningen og viser pilen til del 2.

Del 2's tre første trin spørger `js/ovenfra.js` gennem vilkårssprogets
nødudgang (`proev`): parrene og fortyndingsreglen hører til forsøget og
ikke til motoren. Reglen er stadig en tilstand — parrene læses af bordet,
ikke af, hvad eleven gjorde.

## Kemichael i forsøget

De tre bemærkninger siges af Kemichael selv. En udløser har `{ sig }` som
konsekvens i stedet for `{ besked }` (motoren: `../../laboratoriet/js/forloeb.js`),
og `side.js` sender det til `laererReplik` i
`../../laboratoriet/proevebord/js/laerer.js`: han siger linjerne én
boble ad gangen, uden at bordet låses. Bemærkningen om
referencen peger på glas 7 — han bliver stående på sin plads, drejer hovedet,
fører armen mod glasset og markerer det — og
slutter med glimtet `afslag` fra hans baggrund, som README'en i
`../../kemichael/` havde sat af til netop det. To trin har desuden deres eget
`sig`, som han siger, når trinnet er gjort: billedet og oprydningen. Det er
med vilje kun to; han taler ikke hele tiden.

**Han taler bag bordet** (`bagBord` i `js/opstilling.js`): han er ude det
meste af tiden, kommer ind, når en replik kalder, standser hvor der er plads,
peger på det, replikken handler om, og går ud igen. Han tegnes i sit eget
plan (`skala: 0.82`) og klippes ved bordets bagkant, så pladen dækker hans
underkrop. Det, der kræver hans hænder — oprydningen efter et uheld, kaffen
og flasken, der fyldes op igen — foregår foran bordet som før. Motoren bag
det står i `../../laboratoriet/README.md` under »Kemichael bag bordet«.

Taleboblen tegnes som allersidste lag, også over zoomboblen, og holder sig
fri af både det glas, replikken handler om, og zoomboblens hjørne.

Al tale står i `js/tekst.js` som korte linjer i hans tone: sarkasmen rammer
handlingen, aldrig eleven, og han forklarer ikke teori. Er der ingen lærer
på siden, vises linjerne som en besked, så intet går tabt.

## Quizzen

Rammen står i `../../laboratoriet/js/quiz.js`; her ligger kun spørgsmålene,
i `js/tekst.js` under `quiz`, sammen med al anden prosa. Ti spørgsmål:
farven, de fire indgreb, forundersøgelsen i glas 8, varme og kulde, hvorfor
der tilsættes fast stof, og til sidst fortyndingen set ovenfra.

Quizzen låses op af et vilkår i `js/app.js`:
`quiz: { krav: { journal: "billede", faerdig: true } }` — altså når billedet
er taget og alle seks glas er noteret. Kravet prøves ved hver opdatering af
panelet, så kortet åbner af sig selv i samme øjeblik, det sidste glas er
noteret, og knappen banker.

## Tegneserien

Rammen står i `../../laboratoriet/js/tegneserie.js`; her ligger kun, hvilke
ruder sb2.4 har (`js/serie.js`) og ordene i dem (`js/tekst.js` under
`serie`). Tretten ruder: stamopløsningen, ét glas ad gangen ved siden af glas
7, forundersøgelsen i glas 8, billedet af alle syv, de fire glas ovenfra, en
rød rude for hvert uheld, Kemichael hvis han ryddede op, og resultatskemaet
for begge dele som sidste, brede rude.

**Ruderne tegnes af elevens journal og ikke af bordet.** Hver post i
journalen `billede` gemmer opskriften på det, der stod i glasset — og på
glas 7, det blev holdt op mod — og hver post i `fortynding` gemmer de to
glas' opskrifter og deres lysveje ovenfra. Hælder eleven glassene ud
bagefter, står tegneserien stadig med det, han så. Det var dét,
øjebliksbilledet blev lavet til.

**Og hvad glasset FIK, står ingen steder.** Motoren spørger altid, hvad der
*er*, aldrig hvordan man kom dertil, og tegneserien gør det samme: indgrebet
læses ud af øjebliksbilledet. Er der Fe²⁺, har glasset fået ascorbinsyre; er
der AgSCN(s), har det fået sølv; er der mere jern i alt end i glas 7, har det
fået Fe(NO₃)₃; står temperaturen over 30 °C, stod det i vandbadet. Tog eleven
en anden vej, end trinnet foreslog, står der stadig det rigtige i ruden.

Serien låses op af et vilkår i `js/app.js` — begge journaler færdige — og
åbnes med kortet i panelet eller tasten <kbd>G</kbd>. Et glas, der blev
noteret anderledes, end det så ud, bliver ikke rettet; skemaet skriver facit
under svaret, så eleven kan se forskellen selv.

## Badene

Vandbadet og isbadet er udstyret `bad` fra motoren. Vandbadet står på
varmepladen og er termostateret til 80 °C (`holdT: 80`), så det først bliver
varmt, når eleven tænder pladen, og ikke koger. Isbadet holder 2 °C, som om
isen blev fyldt efter. Et glas i et bad tager badets temperatur i løbet af
nogle sekunder.

Ved 80 °C falder FeSCN²⁺ fra 1,6 til 0,65 mM, og ved 2 °C stiger det til
2,1 mM. Det er van 't Hoff i `../../laboratoriet/js/stof.js`, ikke en regel
skrevet ind i forsøget.

## Billedet

Knappen **Tag billede** (eller tasten <kbd>S</kbd>) tager et øjebliksbillede
af stativet: de syv glas tegnes i række, som de så ud, da der blev trykket,
og de bliver stående sådan, også efter at glassene er hældt ud. Under hvert
af glas 1 til 6 vælger eleven mørkere, som glas 7 eller lysere.

Optagelsen og bedømmelsen ligger i motorens journal
(`../../laboratoriet/js/journal.js`); her står kun præsentationen. Facit regnes
af verden i det øjeblik, der svares — lysstyrken af glasset holdt op mod glas
7, med samme grænse på 0,03, som trinnene bruger — ikke af en facitliste. Er
et glas noteret anderledes, end det ser ud, bliver det ikke rettet for
eleven: en udløser beder ham kigge en gang til, og han kan selv trykke om.

Trinnet er gjort, når alle seks er noteret, uanset om de er rigtige. Det er
iagttagelsen, der er arbejdet.

## Det, der mangler

* **Mikroniveauet** viser i dag kun mængderne og ikke selve reaktionerne
  (bind og split ved ligevægt). Det er S5 i `claude/TODO.md`.

## Mængderne, der kan skrues på

Afgjort 19. september (S12, F25, F26, S11): hvert pulverglas har sin egen
spatelspids (`spatelspids` på posten i `js/opstilling.js`), fordi glassene
kun har 12 µmol Fe³⁺ og 12 µmol SCN⁻ at arbejde med. Motorens 1,5 mmol
gjorde glas 1 sort og glas 2 farveløst.

| pulverglas | spatelspids | glasset bagefter |
|---|---|---|
| Fe(NO₃)₃ (glas 1) | 8 µmol | tydeligt mørkere, stadig rødorange |
| ascorbinsyre (glas 2) | 3 µmol | lysere, ikke farveløst; pH ca. 2,8 |
| KSCN (glas 3) | 30 µmol | mere end dobbelt så meget FeSCN²⁺ |

pH 2,8 i glas 2 er rigtig kemi: redoxen afgiver to H⁺ pr. ascorbinsyre.
Al ascorbinsyren bruges, så dens egen pKa (4,1) ville ikke ændre noget,
og den står stadig ikke i stoftabellen. Dråbeflasken med AgNO₃ er 0,1 M
(5 µmol pr. dråbe): én dråbe lysner lidt, to tydeligt, og tre fjerner al
SCN⁻, så kun Fe³⁺'s gule farve er tilbage.

**Tilskuerionerne kan løftes op (F27).** I linjen under tabellen er K⁺ og
NO₃⁻ knapper: et klik løfter ionen op i tabellen og boblen for hele
forsøget (den står så som »↑ NO₃⁻«), et klik mere sætter den ned, og
Start forfra sætter alle ned. Fluebenet viser dem alle på én gang.
