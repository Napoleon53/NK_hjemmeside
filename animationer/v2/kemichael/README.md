# Kemichael

Læreren, der går igen i superanimationerne. Figuren, hans sprites, de fælles
påskeæg og glimtene af hans baggrund ligger her, så han ser ens ud og opfører sig
ens alle steder. Hver animation har sine egne scener i sin `js/laerer.js`.

Bruges i sc1.3 Knaldgas, sc2.1 Salt i vand, sc2.6 Kobber og dibrom, sc2.7
Blyiodid, sc6.8 Substitution, sc6.9 Fedt i chips, sc8.6 Jern i ståluld, sb2.4
Jernthiocyanat og prøvebordet i `laboratoriet/`.
Animationerne ligger i `../superanimation/` og `../superlab/` og henter filer herfra
med `../../kemichael/`.
sc2.1 har intet fast tegnebord; dens `js/laerer.js` laver et `NK.Scene` med de mål,
figuren bruger, og tegner ham skaleret efter lærredets højde. sc2.5 Fældning har en ældre udgave af ham, der kigger op i hjørnet;
den er tegnet med samme ansigt og overskæg, men bruger ikke mappen.

## Personen

**Navn.** Michael. Eleverne kalder ham Kemichael, og en af dem har skrevet "KE"
foran navnet på hans navneskilt med kuglepen. Han siger, at han ikke har set det.

**Udseende.** Skaldet med grå totter, overskæg, runde briller, kittel, lyseblå
skjorte og mørkerødt slips. Kaffekoppen siger "BEDSTE LÆRER".

**Tone.** Venlig og hjælpsom i det, han gør: han kommer, når noget går galt,
rydder op, stiller en ny flaske frem og peger på det rigtige. Sarkastisk i det,
han siger. Sarkasmen rammer handlingen, aldrig eleven. Han forklarer ikke teori.
Ros er kort og tør, gerne et ordspil på forsøget: "Fedt." i chips, "Rustfrit." i
ståluld.

**Vaner.**

* Kaffen er hans. Den er sjældent varm, og han får den aldrig drukket i fred.
* Han fører regnskab over uheld.
* Han peger på plakaten med sikkerhedsreglerne med løftet finger.
* Han kigger over brillerne, når noget er tvivlsomt, og sukker, når det sker igen.

**Baggrund.** Den fortælles aldrig i sammenhæng, kun i glimt:

* Han skulle have været forsker. Ph.d.'en blev aldrig færdig, og vejlederen sagde
  det samme, som han selv siger nu.
* I 1994 antændte han noget, han ikke burde. Øjenbrynene voksede grå ud igen.
* Han betalte studiet ved at ryste cocktails.
* Hans første titrering gav 140 %.
* Han har undervist længe nok til at huske gamle elever: en er læge, en læser jura.
* Konfiskerede chips bliver til frokost.
* Han lærte at dabbe af en 1.g i 2016 og mener stadig, det er moderne.
* Strømmen og kaffen deler budget.
* Et indrammet afslag fra et tidsskrift hænger på hans kontor.
* Skårene gemmer han "til en kunstinstallation".
* Kitlen er den samme som på hans første lærerdag. Navneskiltet er nyere.
* Kaktussen i forberedelsesrummet hedder Bunsen og får resten af kaffen.
* Koppen var en gave fra en klasse, der ryddede op. Én gang.
* Han går aldrig glip af et fredagsmøde. Der er kage.

Idéer til senere glimt i samme stil:

* Han har et skema over, hvem der har ødelagt hvad, siden 2009.
* Sikkerhedsbrillerne på hans kontor er hans egne fra gymnasiet.
* Han har søgt om et nyt stinkskab hvert år siden 2014.

## Glimt af baggrunden

* Et glimt hører til en bestemt hændelse og står i animationens `laerer.js` som
  `K.glimtTrin(id)`. Replikken står i `GLIMT` i `kemichael.js`.
* Hvert glimt vises én gang pr. browser, og der vises højst ét glimt pr.
  sidevisning. Det huskes i `localStorage` under `nk-kemichael`.
* Regnskabet over uheld (`K.uheld()`) tæller på tværs af animationerne i samme
  browser. Ved 3, 6 og 10 uheld kommer et glimt.
* Modstykket er `K.ros()`, som forsøgets ros-scene slutter med. Den tæller forsøg
  i træk uden uheld og giver et glimt ved 3, 6 og 10. Et uheld nulstiller stimen.
* En replik er højst ca. 60 tegn og uden teori.
* `NK.Kemichael.glimtNulstil()` i konsollen glemmer viste glimt og regnskabet.

| Glimt | Hvornår | Replik |
|-------|---------|--------|
| `navn` | første klik på ham | Michael. Ikke Kemichael. |
| `kaffeKold` | kaffen, posten `kold` | Kold. Som altid. |
| `kaffePause` | kaffen, posten `ud` | Uden for døren er det en pause. |
| `kaktus` | kaffen, posten `kaktus` | Bunsen er min kaktus. Han kan tåle det. |
| `kittel` | kaffen, posten `kittel` | Kitlen er fra min første lærerdag. Skiltet er nyere. |
| `fredag` | kaffen, posten `fredag` | Jeg går aldrig glip af et fredagsmøde. Der er kage. |
| `gave` | kaffen, posten `gave` | Koppen var en gave fra en klasse, der ryddede op. Én gang. |
| `kunst` | et knust glas fejes op (prøvebordet) | Skårene gemmer jeg. Det bliver en kunstinstallation. |
| `phd` | morteren, knust helt vildt (sc6.9) | Sådan så min ph.d. også ud. Den blev aldrig færdig. |
| `frokost` | han tager chipsposen (sc6.9) | Tak for frokosten. |
| `oejenbryn` | branden (sc6.9) | Jeg prøvede det i 1994. Spørg mine øjenbryn. |
| `vejleder` | spildt pulver (sc2.7) | Det sagde min vejleder også. Jeg lyttede heller ikke. |
| `laege` | tre punkter på kurven (sc2.7) | Sådan en kurve lavede en elev i 2003. Hun er læge nu. |
| `dab` | dab efter et særlig godt forsøg (sc6.8) | Det lærte jeg af en 1.g i 2016. |
| `stroem` | lampen, han slukker (sc6.8) | Strømmen går fra kaffebudgettet. |
| `bartender` | kolben rystes første gang (sc8.6) | Jeg rystede cocktails under studiet. Det her er ikke det. |
| `jura` | aubergine (sc8.6) | Aubergine så jeg sidst i 2011. Han læser jura nu. |
| `titrering` | "Rustfrit." (sc8.6) | Min første titrering gav 140 %. Det var en lang nat. |
| `afslag` | glas 7, referencen, får et indgreb (sb2.4) | Mit afslag fra et tidsskrift hænger indrammet. Samme grund. |
| `regnskab3`, `6`, `10` | uheld: heptan, petriskål, varm skål og brand (sc6.9), spild og udsugning (sc6.8, sc2.6), vasken og kolben (sc2.6), spild og varmt glas (sc2.7), buretten og vægten (sc8.6), flammen (sc1.3), overkogningen (sc2.1) | Tredje uheld på den her computer. Det står i regnskabet. |

## Replikker

Vendingerne står i `REPLIKKER` i `kemichael.js` som puljer, ikke rækkefølger.
`K.replik(kategori)` tager en, der ikke er brugt for nylig i samme sidevisning, så
den samme sætning ikke kommer to gange i træk. Et forsøg kan bruge sin egen liste
med `K.replik("ryst", RYST_SVAR)`.

| Pulje | Bruges til |
|-------|------------|
| `prik1` til `prik4` | svarene, når eleven prikker til ham. Det næste klik sender ham ud |
| `gaaUd` | replikken, når han går |
| `forbi`, `stilstand` | baggrundslivet, se nedenfor |
| `ros`, `uheld`, `advarsel` | fælles vendinger, som et forsøg kan bruge, hvis det ikke har sine egne |

### Forsøgets eget katalog (M18)

Han skal lyde som sig selv — men som sig selv **i det her forsøg**. Hver animation
kan derfor lægge sine egne vendinger oven i puljerne. De står i forsøgets
`js/tekst.js` under nøglen `kemichael` med de samme kategorier som `REPLIKKER`
(og uheldenes: `spild`, `rystet`, `vaeltet`, `overloeb`, `knust`), og
`laboratoriet/js/side.js` giver dem videre med `K.katalog(puljer)`. Det koster
ingen kode i forsøget — kun tekst.

```js
"kemichael": {
    stilstand: ["Køler det af? Krystallerne kommer, når de kommer."],
    advarsel:  ["Pb(NO₃)₂ er giftigt. Det står på etiketten og på plakaten."]
}
```

Når han skal sige noget i en kategori, tager han forsøgets egen vending knap
halvdelen af gangene (`0,45`), dagsformen cirka hver tredje af resten, og ellers
den fælles pulje. `K.katalogReplik(kategori)` henter én direkte fra katalogets
pulje og giver `""`, hvis forsøget ikke har nogen — det er den, uheldene bruger
fra anden gang, et uheld af samme slags sker. Mønster:
`../superlab_ny/sc2.7_blyiodid_ny/js/tekst.js` og
`../superlab_ny/sb2.4_jernthiocyanat_ny/js/tekst.js`.

**Han bliver ikke afbrudt.** Et klik på ham preller af, mens taleboblen står, og en
ny scene begynder med at vente, til han er talt færdig. Trinet
`{ taleFaerdig: true }` venter på det samme, så han ikke går fra sin egen replik.
Boblen står 10 % længere end den tid, scenen beder om, og aldrig kortere end det
tager at læse linjen (`K.taleTid`). Lange replikker brydes over flere linjer.

**Boblen tegnes af `../laboratoriet/js/taleboble.js`**, når den er indlæst: den
får munden (`laererMund`) og hovedets mål og finder selv sin plads inden for
scenen, uden om det glas han peger på (`L.undgaa`), uden om hylderne og det,
der står på dem (F78 — ellers kunne boblen dække et pulverglas, så kemikaliet
hverken kunne ses eller klikkes), med halen ved issen i stedet for hen over
ansigtet, og med skriften i læsbar størrelse uanset zoom. **Boblen spærrer
aldrig for arbejdet:** står der en genstand under den, gælder klikket
genstanden; rammer klikket kun boblen, springer det replikken videre (S14).
I animationer, der ikke indlæser laget, tegnes boblen som før her i filen.

## Dagsform

Han har en tilstand for hver sidevisning. Dagsformen lægger sine egne vendinger i
puljerne (cirka hver tredje replik), flytter ansigtet en smule i alle scener og
afgør, hvor mange prik han finder sig i, før han går (tre til fem). Listen står i
`DAGSFORM` i `kemichael.js`.

Tilstandene retter sig efter maskinens rigtige ugedag og klokkeslæt: han taler kun
om fredag om fredagen, og kun om kagen klokken to, hvis klokken ikke er over to.
`naar(t)` i den enkelte tilstand siger, hvornår den overhovedet kan komme, og
`vaegt` (normalt 1), hvor tung den er blandt dem, der passer på tidspunktet.

| Tilstand | Kommer |
|----------|--------|
| `morgen` | hverdag før kl. 8 |
| `soevn` | hverdag kl. 5 til 11 |
| `maskine` | hverdag kl. 6 til 13 |
| `rettebunke` | hverdag kl. 8 til 17 |
| `vikar` | hverdag kl. 11 til 17 |
| `moede` | hverdag kl. 13 til 17 |
| `fredag` | fredag kl. 6 til 16, vægt 3 |
| `weekend` | lørdag og søndag kl. 5 til 22, vægt 3 |
| `aften` | alle dage kl. 17 til 22, vægt 2 |
| `nat` | alle dage kl. 22 til 5, vægt 2 |

`ekstra` må være en funktion af `t`, når vendingerne selv afhænger af klokken
(kagen om fredagen, klokkeslættet om natten). `t` har `ugedag` (0 er søndag),
`navn`, `klokken` (timer med decimaler), `ur` ("23.40"), `hverdag` og `skoletid`.

`K.dagsform()` siger, hvilken tilstand det er, og `K.dagsform("fredag")` vælger en
bestemt, så selvtesten kan regne med den. `K.tid()` er tidsbilledet, og
`K.tidTvang(dato)` låser tiden fast og vælger tilstanden om; `K.tidTvang(null)`
slipper den igen.

## Baggrundsliv

Har eleven ikke rørt noget i 95 sekunder, sker der noget af sig selv: han går
tværs over scenen med en papkasse, eller han kigger ind fra kanten og spørger, om
det står stille. Der går mindst tre minutter mellem to indslag.

* Tiden måles i rigtige sekunder, ikke i forsøgets tid, og tælles fra sidste klik
  eller tastetryk i vinduet. Derfor sker det aldrig i en selvtest, der kører timer
  igennem på få sekunder.
* Indslagene låser ikke forsøget og viger med det samme, hvis eleven rører noget.
* `NK.Kemichael.baggrundsliv(false)` slår dem fra. Det gør alle selvtestene.

## Kaffen

Klik på koppen på hylden er det samme påskeæg alle steder, men det er ikke det
samme, der sker. `KAFFE` i `kemichael.js` har 21 poster: han drikker den kold,
brænder sig, finder den tom, vender den på hovedet, spytter den ud, hælder resten
til kaktussen, tager den med uden for døren eller lader den stå og siger noget om
den i stedet. Posterne vises én ad gangen og gentages først, når de er set alle
sammen (huskes i `localStorage`).

* En post er en liste af trin bygget med `h` (se `KAFFE` i `kemichael.js`):
  `h.sig`, `h.drik`, `h.vip`, `h.sprut`, `h.damp`, `h.udtryk`, `h.vent`, `h.suk`,
  `h.gaa`, `h.glimt`.
* `griber: false` betyder, at han ikke rører koppen. `beholder: true` betyder, at
  den bliver stående, så påskeægget kan komme igen uden et nyt forsøg.
* Ved `krav(tal)` kommer posten kun frem, når det passer. `regnskab` kræver fx, at
  det er tredje kop eller senere.
* Et nyt forsøg stiller koppen tilbage på hylden.
* Fem af posterne rummer et glimt af hans baggrund.

## Bevægelser

Scenerne er lister af trin (formatet står øverst i `kemichael.js`). Ud over at gå,
tale og dreje armen kan han:

* `udtryk`: `vrede`, `humoer`, `roed`, `skeptisk` (højre bryn op, skæv mund),
  `briller` (brillerne glider ned, og han kigger over dem) og `laen` (han læner
  sig ind)
* `K.suk()`: øjnene lukkes, og hovedet synker og kommer op igen
* `{ gaa: K.KANT }`: han kigger kun ind fra venstre kant, fx med `laen: 1`
* damp af ørerne, når han bliver klikket på for mange gange, og når kaffen
  undtagelsesvis er varm (`L.damp` i sekunder)
* `laererSprut(antal, ned)`: dråber ud af munden, fx kaffe, han spytter ud.
  `ned` lader dem falde i stedet for at flyve frem
* `L.kopV`: koppen i hånden vippes, fx på hovedet ved -2,4
* armen: 0 peger lige op, og `K.HAENGER` (2,9) hænger ned. Over 2 tegnes armen
  bag kroppen. Når han tørrer op på bordet til højre for sig, bruges 1,8 med en
  lille svingning (±0,14). `pegVinkel(x, y)` regner den vinkel, armen skal have
  for at pege på et sted på bordet, og `kigVinkel(x)` drejer hovedet lidt
  samme vej

## Bag bordet

Har forsøget givet ham et plan bag bordpladen (`bagBord` i bordets valg —
sb2.4 gør det), taler han bagfra. Han bor ikke der: han er ude det meste af
tiden, som han altid har været, og kommer kun ind, når han har noget at sige.
Så går han ind bag bordet, standser dér, hvor der lige er plads i det rum —
ikke samme sted hver gang — peger på det, replikken handler om, og går ud
igen. Bordpladen dækker hans underkrop, og han tegnes mindre, fordi han er
længere væk.

Reglen er **hænder foran, ord bagved**. Det, der kræver, at han rører noget —
oprydningen efter et uheld, kaffen, flasken der fyldes op igen — og
baggrundslivet foregår foran bordet, præcis som før. Det tekniske står i
`../laboratoriet/README.md` under »Kemichael bag bordet«.

## Uheld

Forkerte handlinger i et forsøg afvises ikke, når det kan undgås. De giver et
uheld, og læreren kommer og rydder op: tørrer op, tænder udsugningen, stopper
eleven ved vasken eller tænder brænderen igen. Scenen står i animationens
`laerer.js` og slutter med `K.uheld()`, så uheldet kommer i regnskabet.

Gik et forsøg godt, slutter ros-scenen med `K.ros()`, som tæller den anden vej.

## Tegneseriens rude om oprydningen

Ryddede han op undervejs, får han en rude i tegneserien: `K.uheldIForsoeget()`
tæller oprydningerne i det forsøg, der kører nu, `K.oprydningsTekst()` giver
teksten, og `K.tegneserieFigur(ctx, valg)` tegner ham i ruden. Valgene er `x`,
`gulv`, `skala` (0,46 passer til en rude på 214 px), `arm`, `udtryk` og
`haand(ctx, hd)`, som tegner det, han holder, fx køkkenrullen. Mønster:
`../superlab/sc6.8_substitution/js/tegneserie.js`.

## Filer

```
kemichael.js        figuren, bevægelserne, taleboblen, kaffen, klik og glimtene
sprites/            krop, hoved, arm og kaffekop
```

| Fil | Indhold | Anker, som koden bruger |
|-----|---------|-------------------------|
| `laerer_krop.svg` | krop i kittel med navneskilt | halsen (110, 18); skulderen (176, 58) |
| `laerer_hoved.svg` | hoved uden øjne, bryn og mund | halsen (55, 126); brillerne om (37, 60) og (73, 60); munden (55, 97) |
| `laerer_arm.svg` | arm med løftet pegefinger | skulderen (28, 142); hånden (28, 36) |
| `kaffekop.svg` | hans kop | bunden (18, 40) |

Ankrene står i `NK.Kemichael.ANKER`. Øjne, bryn, briller, mund, rødme, damp af
ørerne og taleboblen tegnes i koden. Ændres en sprite, skal tallene passe.

## Sådan kommer han med i en animation

1. Indlæs filen efter `sprites.js` og før `scene.js`:
   ```html
   <script src="js/sprites.js"></script>
   <script src="../../kemichael/kemichael.js"></script>
   <script src="js/scene.js"></script>
   ```
2. `sprites.js` henter en post fra dens egen mappe, hvis den har en:
   `(f.mappe || MAPPE) + f.fil`.
3. `scene.js` kopierer ankrene ind lige efter `S.ANKER`:
   ```js
   Object.keys(NK.Kemichael.ANKER).forEach(function (navn) { S.ANKER[navn] = NK.Kemichael.ANKER[navn]; });
   ```
4. `js/laerer.js` kobler ham på forsøget og tilføjer forsøgets egne scener:
   ```js
   NK.Kemichael.paa(NK.Forsoeg.prototype, { kaffeX: 170, fredet: ["brand"] });
   ```
5. Forsøget kalder `laererStart`, `laererNyt`, `opdaterLaerer` og `tegnLaerer`,
   bordet bruger `overLaerer` og `klikLaerer`, og koppen på hylden er genstanden
   `g.kaffekop`, der kalder `klikKop`.
6. `lyd.js` har `mumle`, `brum` og `slurk`. De ligger i animationen, fordi de
   følger dens lydknap, og de er ens alle steder.

Krogene til forsøgets egne tilføjelser står øverst i `kemichael.js`.
