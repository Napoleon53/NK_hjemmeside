# sb2.4 Indgreb i en kemisk ligevægt

Forsøget lagt over på genstandsmodellen i `../../laboratoriet/`. Den gamle
udgave ligger urørt i `../sb2.4_jernthiocyanat/` og kører videre; den har
sin egen håndskrevne `forsoeg.js`, `scene.js`, `bord.js` og `model.js` på
omkring 190 KB. Denne bruger den fælles motor og består af syv små filer.

Åbn **`index.html`**. Mappen henter kun filer inde fra sig selv, bortset
fra `../../laboratoriet/` og `../../kemichael/`, og skal derfor ligge i
`superlab/`, der står ved siden af de to mapper.

## Hvad der er lavet indtil videre

Bordet står, kemien opfører sig rigtigt, badene virker, forløbets ni trin
kører med tekst, hint og en liste i panelet, og billedet af glas 1 til 7
lader eleven notere sine iagttagelser. Kemichael siger selv forløbets
bemærkninger og et par tørre ord, når et trin er gjort. Del 2 om
fortynding, quizzen og tegneserien mangler. `_selvtest.html` kører det hele
igennem i sytten afsnit (plus 3b om boblen og tabellen); det sidste gør
det med musen, som en elev (`laboratoriet/js/proeve.js`).
`laboratoriet/_vinduer.html` viser forsøget i to vinduesstørrelser ved
siden af hinanden.

## Filer

```
index.html          stilladset: scene, panel, intro, teoriboks, rundvisning. Ingen prosa.
css/stil.css        ligevægtsligningen og forløbslisten
js/tekst.js         AL prosa: titel, intro, teorien, trinnenes tekster og
                    hints, bemærkningerne, panelets kort, rundvisningens stop
js/opstilling.js    bordet: hvad der står på det, og bordets mål
js/forloeb.js       trinnenes betingelser og de tre udløsere
js/billede.js       billedet af de syv glas: optagelsen og knapperne under dem
js/app.js           starter den fælles skal og kobler billedet på
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
tjekker det. Scenen står forneden i lærredet (`lodret:
"bund"`). Bordpladen er 64 dyb (`bordDybde`), så man kan stille ting foran
stativet; det forreste tegnes forrest. Spatlen, glasstaven og termometeret
ligger forrest fra start.

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

20 mL 0,10 M Fe(NO₃)₃ og 20 mL 0,10 M KSCN fortyndet til 400 mL, altså
5 mM af hver. Ved ligevægt giver det 1,6 mM FeSCN²⁺, som er tydeligt rødt
i et reagensglas uden at gå mod sort. Motoren regner selv ligevægten frem;
opstillingen siger kun, hvad der blev blandet.

Vil man have farven stærkere eller svagere, ændres koncentrationen i
`STAM` i `js/opstilling.js`. Bliver den for mørk, er det `k` for FeSCN²⁺ i
stoftabellen, der skal ned.

## Forløbet

De ni trin står i `js/forloeb.js` som betingelser over bordets tilstand,
og deres tekster i `js/tekst.js`. Indgrebene er med vilje skrevet som
»glasset ser anderledes ud end glas 7«, ikke som »der blev taget en
spatelspids«: farven er det, der skal læres, så farven er det, der prøves.
Derfor kan eleven nå et trin ad flere veje, og et trin længere fremme
tæller også, hvis det bliver opfyldt først.

Tre udløsere holder øje undervejs. Får glas 7 et indgreb, siger forløbet, at
der ikke længere er nogen reference; får ét glas to forskellige indgreb,
siger det, at man så ikke kan vide, hvad der virkede; og er et glas noteret
anderledes, end det ser ud, beder den tredje eleven kigge igen. Alle tre
fyrer én gang.
Flaget `indgreb_gjort` sættes, når glas 6 er koldt, og oprydningstrinnet
læser det — ellers ville et tomt bord ved starten tælle som ryddet op.

## Kemichael i forsøget

De tre bemærkninger siges af Kemichael selv. En udløser har `{ sig }` som
konsekvens i stedet for `{ besked }` (motoren: `../../laboratoriet/js/forloeb.js`),
og `side.js` sender det til `laererReplik` i
`../../laboratoriet/proevebord/js/laerer.js`: han kommer ind, siger linjerne én
boble ad gangen og går igen, uden at bordet låses. Bemærkningen om
referencen peger på glas 7 — han stiller sig ved det og markerer det — og
slutter med glimtet `afslag` fra hans baggrund, som README'en i
`../../kemichael/` havde sat af til netop det. To trin har desuden deres eget
`sig`, som han siger, når trinnet er gjort: billedet og oprydningen. Det er
med vilje kun to; han taler ikke hele tiden.

Al tale står i `js/tekst.js` som korte linjer i hans tone: sarkasmen rammer
handlingen, aldrig eleven, og han forklarer ikke teori. Er der ingen lærer
på siden, vises linjerne som en besked, så intet går tabt.

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

* **Del 2 om fortynding** med de fire bægerglas på hvidt papir.
* **Flere af Kemichaels scener**, når del 2 kommer til: bemærkningerne og
  trinnenes replikker er på plads (se ovenfor), og han rydder op efter
  uheld gennem `../../laboratoriet/proevebord/js/laerer.js`.
* **Quiz og tegneserie**, som løftes fra den gamle udgave, når rammen for
  dem er trukket ud.

## Mængderne, der kan skrues på

En spatelspids er 25 µmol i selvtesten, og det er nok til at fjerne al
Fe³⁺ i glas 2 og gøre det helt farveløst. Et par dråber AgNO₃ (0,5 mL)
fjerner al SCN⁻ i glas 4. Begge dele er kemisk rigtige, men »lysere« er
pædagogisk bedre end »farveløs«. Det er tal i forløbet, ikke i motoren.
