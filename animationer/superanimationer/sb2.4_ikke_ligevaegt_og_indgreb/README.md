# sb2.4 Ikke-ligevægt og indgreb

En superanimation i sin egen mappe. Åbn **`index.html`**. Mappen henter kun
filer inde fra sig selv og virker også, når den åbnes direkte fra harddisken.
Der er ingen Kemichael og ingen statuslinje nederst: al tekst står på ét kort
øverst midt i scenen, også hint og den gule hintknap (rammen fra
`sc7.5_staerke_og_svage_syrer`).

Den er bygget fra bunden og afløser ingen gammel animation. Den står i
menuen som nr. 2 i B2 Ligevægt (koden `b2.indgreb`). Den hører til afsnit B2.4 Ikke-ligevægt og indgreb i
Kemibogen B. Nummeret følger bogens afsnit; det frosne forsøg
`../v2/superlab/sb2.4_jernthiocyanat` har koden b2.4 i menuen og er noget
andet.

## Bestillingen (22. oktober 2026)

Brugeren om det nye afsnit B2.4 i Kemibogen: "Jeg synes oxygen i blodet bedre
egner sig til en animation, som man kan lave. Måske kunne man samle nogle
animationer, som ikke er alt for svære. Jeg synes de nuværende 'indgreb i
ligevægte'-animationen forudsætter at man har læst 2.5 om temperatur og tryk.
Måske er der plads til en ny animation, der ligger mere i tråd med
2.4-opgaverne, og blandt andet inddrager det med blod. Måske kan der både være
en kvalitativ og kvantitativ del?" Afsnittet om oxygen i blodet blev samtidig
taget ud af bogen.

1. **Pointen:** Reaktionen går altid den vej, der bringer *Y* hen til *K*, og
   et indgreb, der flytter *Y*, forskydes, så indgrebet bliver modvirket.
2. **Afløser intet.** Udgangspunktet er Kemibogens afsnit B2.4 (tallinjen
   `y-mod-k` og `indgreb-tallinje`, eksemplet med CO og vanddamp, *K* = 4,0)
   og opgaverne B2.4.2 til B2.4.6, og eksemplet med blodet, der stod i
   afsnittet indtil 22. oktober 2026.
3. **Naboerne:** `sb2.1` ejer at skrive reaktionsbrøken (her vælger eleven
   den blandt tre). `sb2.3` ejer beregningerne med *x* (her regnes kun *Y*).
   `kemi-b-filer/b2.2` ejer forsøgene med temperatur og tryk, `b2.6` rumfanget,
   og `b2.5` og det frosne `sb2.4_jernthiocyanat` jern(III)thiocyanat, som
   Kemibogen holder ude, fordi det er brugerens egen øvelse.
4. **Loftet:** tre faner med fem opgaver hver. Én ligevægt på fane 1 (højst
   omkring 36 molekyler i beholderen), én på fane 2 (12 eller 16 Hb og højst 10
   frie O₂ i luppen) og fire reaktioner på fane 3.
5. **Layoutet:** scene plus panel. Kortet øverst, scenen under det og
   tallinjen nederst på alle tre faner.

Stop-listen er overholdt: ingen flasker, intet stativ, intet affald og ingen
uheld. Indgrebene er knapper (+ og −), og blodet sendes af sted med et klik på
lungerne eller musklen.

Formen er Claudes udformning; brugeren har ikke set animationen endnu.

## Fane 1: Indgreb (`#indgreb`)

En lukket beholder med CO(g) + H₂O(g) ⇌ CO₂(g) + H₂(g), *K* = 4,0. Et molekyle
står for 0,025 M. Til højre for beholderen er der en række pr. stof med − og +
(fjern eller pump 0,10 M ind), men kun den knap, opgaven beder om, kan ses.
Under beholderen står reaktionsbrøken og tallinjen med *Y* og *K* som figur 1 i
B2.4: *K* i midten, *Y* < *K* til venstre (orange, mod højre) og *Y* > *K* til
højre (lilla, mod venstre). Efter et indgreb viser en stiplet ring *Y* før
indgrebet, og en pil viser vejen tilbage til *K*, mens reaktionen går. Panelet
viser koncentrationerne og *Y* før indgrebet, lige efter det og nu.

1. **Kun reaktanter:** gæt, fyld beholderen med CO og H₂O, *Y* vokser fra 0.
2. **For meget produkt:** bogens eksempel (*Y* = 9,0), [H₂] falder fra 0,45 M
   til 0,42 M.
3. **Mere CO:** gæt, pump CO ind, hvorfor *Y* blev mindre end *K*.
4. **Mere H₂:** gæt, pump H₂ ind, Le Chatelier: [H₂] ender mellem før (0,20 M)
   og lige efter (0,30 M), nemlig 0,29 M.
5. **Mere H₂ uden H₂:** alle otte knapper; eleven skal finde et indgreb, der
   giver mere H₂ (+CO, +H₂O eller −CO₂). Et forkert indgreb bliver udført og
   forklaret, og beholderen sættes tilbage.

## Fane 2: Oxygen i blodet (`#blod`)

Lungerne til venstre og en muskel til højre. Over luppen løber blodet fra
lungerne til musklen, under den tilbage, og en dråbe viser, hvor den portion
blod, luppen viser, er. Luppen har 12 Hb (ét bindingssted hver, som i bogen) og
de frie O₂. Hb er mørkerødt, HbO₂ lysere rødt med et O₂ på. Under luppen står
Hb + O₂ ⇌ HbO₂, reaktionsbrøken og tallinjen.

1. **I lungerne:** gæt, klik på lungerne; [O₂] stiger, *Y* < *K*, Hb binder O₂.
2. **I musklen:** gæt, klik på musklen; [O₂] falder, *Y* > *K*, mod venstre.
3. **Musklen arbejder:** knappen Løb; [O₂] falder mere, HbO₂ afgiver mere O₂
   (Le Chatelier).
4. **I bjergene:** mindre O₂ i luften; 9 af 12 Hb binder O₂ i lungerne mod 11 ved
   havet.
5. **Højdetræning:** knappen Mere Hb (16 Hb); 12 binder O₂, flere end ved havet.

## Fane 3: Regn på Y (`#regn`)

En tavle i scenen med reaktionsskemaet, *K*, koncentrationerne, reaktionsbrøken
og regnestykket. Trinene er som eksemplet i B2.4: vælg reaktionsbrøken blandt
tre (de forkerte er de typiske fejl: vendt brøk, plus i stedet for gange,
koefficienten som faktor, vand eller det faste stof med), skriv
koncentrationerne i felterne med rigtig brøkstreg (M står efter hvert felt),
regn *Y* ud med enhed, og sammenlign med *K*. Når opgaven er løst, går *Y* hen
til *K* på tallinjen.

1. **CO og vanddamp:** *Y* = 0,50, *K* = 4,0, mod højre.
2. **N₂O₄ og NO₂:** *Y* = 0,80 M, *K* = 0,20 M (som i kapitel B2), mod venstre.
3. **Esteren:** ethansyre, ethanol, ethylethanoat og vand, alle med i brøken;
   *Y* = *K* = 4,0, ligevægt.
4. **Mere N₂O₄:** ligevægt (0,050 M og 0,10 M), pump N₂O₄ ind til 0,10 M,
   *Y* = 0,10 M, mod højre.
5. **Salmiak:** NH₄Cl(s) ⇌ NH₃(g) + HCl(g), *K* = 1,0 · 10⁻⁴ M², pump NH₃ ind
   til 0,030 M, *Y* = 3,0 · 10⁻⁴ M², mod venstre, og mere fast NH₄Cl ændrer
   intet.

Feltet forstår 0,50, 0.5, 3,0 · 10⁻⁴, 3,0*10^-4, 3e-4 og enhederne M, mol/L,
M², M^2 og M2. Beskederne fanger de typiske fejl: tal under det forkerte stof,
brøken på hovedet, det glemte kvadrat, manglende eller overflødig enhed.

## Hjælpen

Som `sc7.5`: kortet øverst siger, hvad eleven skal nu; et gæt er stort og gult;
den gule knap giver tre hint og så svaret; et forkert svar giver en rød linje
på kortet og får knappen til at lyse. Eleven kan kun sætte noget i gang, mens
kortet viser et forsøg; ellers blinker kortet. Det, en tekst handler om
(tallinjen, brøken, panelet, lungerne), får en gul ring. Et klik på et stof i
signaturen eller på et molekyle forklarer, hvad det er.

## Modellen og forenklingerne

* Fane 1 regner ligevægten ud med halvering på ln *Y* = ln *K* (`js/model.js`),
  og reaktionen nærmer sig den eksponentielt. For hver 0,025 M bliver ét par
  molekyler lavet om, så partiklerne følger koncentrationerne. *K* = 4,0 står
  uden temperatur, som i bogen.
* Fane 2: Hb har kun ét bindingssted (bogens forenkling). Tallene er partikler
  i luppen, ikke M, og *K* = 1,0 pr. partikel. Luften i lungerne og forbruget i
  musklen holder antallet af frie O₂ fast: 10 i lungerne, 3 i lungerne i
  bjergene, 2 i en muskel i hvile og 1 i en muskel, der arbejder. Det giver 91 %,
  75 %, 67 % og 50 % HbO₂, valgt så forskellene kan tælles, ikke målt. Hb sidder i
  virkeligheden i de røde blodlegemer; luppen viser det som frit i blodet.
* Fane 3: *K* = 0,20 M for N₂O₄ og NO₂ er kapitlets tal (omkring 80 °C), *K* =
  4,0 for esteren er lærebogsværdien, og *K* = 1,0 · 10⁻⁴ M² for salmiak er valgt
  uden temperatur.
* Tallinjen er logaritmisk med en tierpotens til hver side af *K*.

## Filer

| Fil | Indhold |
|:--|:--|
| `index.html` | toplinjen, de tre faner, teorien og rundvisningen |
| `css/stil.css` | stilarket fra `sc7.5` og nederst det nye (brøker, tabellen, tavlen, trinene) |
| `js/kerne.js` | fælles hjælpere (fra `sc7.5`) |
| `js/model.js` | kemien: ligevægten med CO, blodet og reaktionsbrøken |
| `js/data.js` | alle mål og tekster; kan rettes uden at røre koden |
| `js/tegning.js` | molekylerne, tallinjen, brøken, knapperne, lungerne, musklen og bjergene |
| `js/fane.js` | det, fanerne har til fælles (fra `sc7.5`, nu også spørgsmål før forsøget) |
| `js/sim_indgreb.js` | fane 1 |
| `js/sim_blod.js` | fane 2 |
| `js/sim_regn.js` | fane 3 |
| `js/rundvisning.js` | rundvisningen bag `?` |
| `js/app.js` | faneskift, teorien, genveje og tegneløkken |
| `_selvtest.html` | selvtesten (udviklerværktøj) |
| `_skaerm.html` | skærmbilleder af et bestemt trin (udviklerværktøj, se kommentaren øverst) |

## Genveje

1, 2 og 3 skifter fane, R begynder opgaven forfra, H viser rundt, T åbner
teorien, Esc lukker. Enter tjekker regnestykket på fane 3 og fylder beholderen
på fane 1. Direkte links: `index.html#indgreb`, `#blod`, `#regn`.

## Selvtest

`_selvtest.html` gennem en lokal server med `animationer/` som rod. 22. oktober
2026: ALT OK (110 påstande) på Linux. Den kontrollerer modellens tal mod
teksterne (0,42 M, 0,29 M, 9, 11, 8 og 12 Hb), at alle 15 mål kan løses selv,
med forkerte svar først og med Vis svaret, låsen, regnefeltets skrivemåder og
fejlbeskeder, tekstlængderne og sproget, og at kortet holder sig i sin zone fra
1100 × 620 til 1600 × 950.

## Menuen

I menuen fra 22. oktober 2026 (brugeren: "ja til det hele"):

* `kemi-b-filer/samling_b2.html`: nr. 2 i B2 Ligevægt, lige efter Ligevægtsloven,
  med koden `data-emne="b2.indgreb"` (b2.4 er forsøget med jernthiocyanat). Knapperne
  efter den rykkede et nummer (Indgreb i ligevægte er nu nr. 3 osv.), men deres
  koder og filnavne er de samme, så gamle links virker.
* `FEEDBACK_EMNER` i `samling_alt_b.html` under B2.
* Kemibogen B: boksen Prøv selv i `b/kapitler/b2-4-ikke-ligevaegt-og-indgreb.qmd`.
