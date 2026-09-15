# Kemichael

Læreren, der går igen i superanimationerne. Figuren, hans sprites, de fælles
påskeæg og glimtene af hans baggrund ligger her, så han ser ens ud og opfører sig
ens alle steder. Hver animation har sine egne scener i sin `js/laerer.js`.

Bruges i sc1.3 Knaldgas, sc2.6 Kobber og dibrom, sc2.7 Blyiodid, sc6.8
Substitution, sc6.9 Fedt i chips og sc8.6 Jern i ståluld. Animationerne henter
filer herfra og skal derfor ligge ved siden af denne mappe. sc2.5 Fældning har en ældre udgave af ham, der kigger op i hjørnet;
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

* Kaffen er hans, og han får den aldrig drukket, mens den er varm.
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

Idéer til senere glimt i samme stil:

* Et indrammet afslag fra et tidsskrift hænger på hans kontor.
* Han gemmer de knuste petriskåle i en kasse "til en kunstinstallation".
* Kitlen er den samme som på hans første lærerdag. Navneskiltet er skiftet tre gange.
* Han har en kaktus i forberedelsesrummet, som hedder Bunsen.
* Han kommer altid til fredagsmøderne. Der er kage.

## Glimt af baggrunden

* Et glimt hører til en bestemt hændelse og står i animationens `laerer.js` som
  `K.glimtTrin(id)`. Replikken står i `GLIMT` i `kemichael.js`.
* Hvert glimt vises én gang pr. browser, og der vises højst ét glimt pr.
  sidevisning. Det huskes i `localStorage` under `nk-kemichael`.
* Regnskabet over uheld (`K.uheld()`) tæller på tværs af animationerne i samme
  browser. Ved 3, 6 og 10 uheld kommer et glimt.
* En replik er højst ca. 60 tegn og uden teori.
* `NK.Kemichael.glimtNulstil()` i konsollen glemmer viste glimt og regnskabet.

| Glimt | Hvornår | Replik |
|-------|---------|--------|
| `navn` | første klik på ham | Michael. Ikke Kemichael. |
| `kaffeKold` | kaffen (sc2.7, sc6.9, sc8.6) | Kold. Som altid. |
| `kaffePause` | kaffen, der tages med ud (sc6.8) | Uden for døren er det en pause. |
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
| `regnskab3`, `6`, `10` | uheld: heptan, petriskål, varm skål og brand (sc6.9), spild og udsugning (sc6.8, sc2.6), vasken og kolben (sc2.6), spild og varmt glas (sc2.7), buretten og vægten (sc8.6), flammen (sc1.3) | Tredje uheld på den her computer. Det står i regnskabet. |

## Bevægelser

Scenerne er lister af trin (formatet står øverst i `kemichael.js`). Ud over at gå,
tale og dreje armen kan han:

* `udtryk`: `vrede`, `humoer`, `roed`, `skeptisk` (højre bryn op, skæv mund),
  `briller` (brillerne glider ned, og han kigger over dem) og `laen` (han læner
  sig ind)
* `K.suk()`: øjnene lukkes, og hovedet synker og kommer op igen
* `{ gaa: K.KANT }`: han kigger kun ind fra venstre kant, fx med `laen: 1`
* damp af ørerne, når han bliver klikket på for mange gange
* armen: 0 peger lige op, og `K.HAENGER` (2,9) hænger ned. Over 2 tegnes armen
  bag kroppen. Når han tørrer op på bordet til højre for sig, bruges 1,8 med en
  lille svingning (±0,14)

## Uheld

Forkerte handlinger i et forsøg afvises ikke, når det kan undgås. De giver et
uheld, og læreren kommer og rydder op: tørrer op, tænder udsugningen, stopper
eleven ved vasken eller tænder brænderen igen. Scenen står i animationens
`laerer.js` og slutter med `K.uheld()`, så uheldet kommer i regnskabet.

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
   <script src="../kemichael/kemichael.js"></script>
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
