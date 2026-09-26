# sc7.2 pH-skalaen

Superanimation om pH-skalaen: ét pH-trin er en faktor ti. Åbn `index.html`.
Mappen henter kun filer inde fra sig selv, bortset fra Kemichael
(`../../v2/kemichael/kemichael.js`). Ingen `fetch` og ingen moduler, så den
virker fra harddisken.

## Bestillingen

1. **Pointen:** ét pH-trin er en faktor ti. Jo lavere pH, jo flere H₃O⁺ og jo
   færre OH⁻, og skalaen fra 0 til 14 spænder derfor over en faktor 10¹⁴.
2. **Afløser** `kemi-c-filer/c7.2_ph_skalaen.html`. Den gamle talte prikker
   (1 prik = 10⁻⁷ M) og kunne derfor kun dække pH 4 til 10. Med fra den gamle:
   pH-skyderen (nu et mærke på skalaen fra 0 til 14), prikkerne for H₃O⁺ og
   OH⁻ (nu i en lup, der zoomer), koncentrationerne i panelet, øl, blod og
   sæbevand (nu blandt tolv hverdagsstoffer) og quizzens spørgsmål (nu som mål
   i fanerne; vands ionprodukt står i teorien). Ud: vippen med de to glas og
   grafen over summen af ionerne.
3. **Naboerne:** `c7.1` ejer syre-base-reaktionerne, og `c7.3` ejer
   beregningerne med log (find pH, find [H₃O⁺], stærke syrer og baser). Her
   regner eleven ikke med log, men tæller, sammenligner og ganger med 10.
   Brugerens valg (25. sept. 2026): tre faner, Skalaen, Luppen og
   Fortyndingen, og 1 prik = 1 ion i luppen.
4. **Loftet:** 3 faner. Fane 1: 12 stoffer, 6 ad gangen. Fane 2: 1 glas, 1
   lup, zoom i 18 trin, højst 1.000 prikker af hver ion, 5 mål. Fane 3: 2
   flasker, højst 9 fortyndinger af hver, 1 lup, 5 mål.
5. **Layoutet:** scene plus panel, som `sc4.1`, `sc4.2` og `sc4.4`. Skalaen
   står øverst i alle tre faner.

## Hvad den viser

| # | Fane | Hvad man gør | Pointe |
|---|------|--------------|--------|
| 1 | Skalaen | trækker hverdagsstoffer op på skalaen, der hvor man tror, de hører til, og pH-metret måler dem | skalaen går fra stærkt surt til stærkt basisk, og hverdagen spænder over det hele |
| 2 | Luppen | trækker pH-mærket og zoomer i trin af ti; tæller H₃O⁺ og OH⁻ | ét trin er 10 gange flere H₃O⁺ og 10 gange færre OH⁻; fra pH 1 til 13 er 12 klik |
| 3 | Fortyndingen | fortynder saltsyre og natronlud 10 gange ad gangen | 10 gange mere vand er ét trin mod 7, og syren bliver aldrig basisk |

**Skalaen.** Skalaen fra 0 til 14 i universalindikatorens farver står øverst.
På bordet står seks hverdagsstoffer. Eleven trækker et stof op på skalaen og
slipper det der, hvor det tror, stoffet hører til; imens står gættet over
skalaen. Så flyver stoffet hen til pH-metret, elektroden dykker ned, tallet
ruller, og stoffet flyver op til sin rigtige plads over skalaen med pH under
sig. Gættet står som en trekant under skalaen med en bue hen til den rigtige
plads, grøn når det var højst 1 fra. Panelet viser stoffet, gættet, hvor mange
gange så mange H₃O⁺ eller OH⁻ der er som i rent vand ("Ca. 50.000 gange så
mange H₃O⁺ som i rent vand."), og én linje om stoffet. Listen "Gæt og målt"
samler hylden. Hylde 1 er køkkenet (citronsaft, cola, kaffe, mælk, natron i
vand, afløbsrens), hylde 2 er resten (mavesaft, øl, regnvand, blod, sæbevand,
klorin). Hylde 1 bliver stående blegt, mens hylde 2 måles, så skalaen til
sidst har alle tolv. Knappen giver hyldens hint og så svaret (resten måles
uden gæt). En pil viser vejen, så længe intet er målt.

**Luppen.** Et bægerglas med vand og universalindikator og en lup, der viser
et lille rum af væsken. 1 prik = 1 ion: røde er H₃O⁺, blå er OH⁻. Eleven
trækker pH-mærket på skalaen (et klik på skalaen virker også; hele tal
trækker lidt i mærket). Knapperne − og + zoomer ud og ind i trin af ti: rummet
bliver 10 gange større eller mindre, og terningens side vises med noget, der
er lige så stort ("Terning på 1,2 µm, som en bakterie"). Er der over 1.000
ioner af én slags, bliver de til en tåge; er der under én, står gennemsnittet
under luppen. En enkelt ion blandt mange får en gul ring. Fem mål: 10 gange
så mange H₃O⁺ (pH 6), 100 gange så mange OH⁻ (pH 9), zoom ind ved pH 2, find
én OH⁻ ved pH 2 (zoom 12: 10 milliarder H₃O⁺ for hver OH⁻) og fra pH 1 til 13
med 12 klik ud. Et mål er nået, når pH og zoom passer, og mærket er sluppet.

**Fortyndingen.** Skalaen hænger over et langt bord. Saltsyren (0,1 M) står
ved pH 1 og natronluden (0,1 M) ved pH 13. Knappen Fortynd 10 gange under hver
af dem laver et nyt glas: pipetten tager 1 mL fra det sidste glas, og
sprøjteflasken fylder op med 9 mL vand. Det nye glas står under sin pH på
skalaen med en streg op til den, så hver fortynding er ét trin mod 7. Tæt ved
7 står glassene på klodser bag hinanden, syren fra venstre og basen fra højre
(6,79, 6,98, 7,00, 7,00 og 7,21, 7,02, 7,00, 7,00). Et klik på et glas viser
det i luppen. Fem mål: gæt pH efter én fortynding (pH 0,1, 1,1, 2 eller 10),
fortynd til pH 5, hvor mange gange er det (10.000), fortynd til basisk (det
kan ikke lade sig gøre; luppen viser 101 H₃O⁺ mod 100 OH⁻) og natronluden
1.000 gange (pH 16, 13, 10 eller 7).

**Kemichael** præsenterer hver fane, når eleven trykker Start præsentation
(reglen i `../README.md`): skalaen tre replikker (han peger på skalaen og
stofferne), luppen tre (luppen og mærket), fortyndingen tre (skiltet og
knappen). Han går kun ved den store knap, to klik på ham eller Esc. <kbd>K</kbd>
viser præsentationen igen. Ellers roser han tørt efter hver hylde og det
sidste mål i luppen og i fortyndingen, og når syren ikke blev basisk: "Det er
vand nu. Meget dyrt vand." Kaffekoppen på bordet er det fælles påskeæg.
**Påskeæg:** et gæt, der rammer inden for 0,1 ("Præcis. Du har vel ikke smagt
på den?"), og luppen zoomet helt ud.

Direkte links: `index.html#lup` og `index.html#fortynd`.

Genveje: <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> faner · <kbd>T</kbd> teori ·
<kbd>H</kbd> rundvisning · <kbd>K</kbd> Kemichaels præsentation ·
<kbd>R</kbd> forfra eller tøm bordet · <kbd>Enter</kbd> næste eller fortynd ·
<kbd>←</kbd> <kbd>→</kbd> pH ±0,1 og <kbd>↑</kbd> <kbd>↓</kbd> hele tal (fane 2) ·
<kbd>+</kbd> <kbd>−</kbd> zoom · <kbd>F</kbd> fortynd (fane 3) ·
<kbd>Esc</kbd> luk eller send Kemichael ud. Musehjulet over luppen zoomer.

### Det nye i forhold til den gamle animation

* **Hele skalaen** i alle tre faner: fra 0 til 14 i stedet for 4 til 10.
* **Luppen zoomer i trin af ti**, så tællingen virker ved alle pH. Antallet af
  klik er antallet af pH-trin.
* **1 prik = 1 ion** i et rum af en bestemt størrelse, i stedet for 1 prik =
  10⁻⁷ M.
* **Tolv hverdagsstoffer**, som eleven selv placerer, før de måles.
* **Fortyndingen er ny:** ét trin pr. fortynding, og syren bliver aldrig
  basisk, regnet med vandets egne ioner.
* **Quizzen er blevet til mål** i fanerne, og de forkerte svar er de fejl,
  elever laver: to trin er dobbelt så meget, fortynding gør pH mindre, 4
  fortyndinger er 40 gange.
* **Hjælpen er én knap:** Giv hint, så Vis svaret.

## Filer

```
index.html          markup for de tre faner, teorien og rundvisningen
css/stil.css        alt udseende (grundlaget er sc4.4's). NB: decimaltal med PUNKTUM i CSS
sprites/            de tolv hverdagsstoffer, pH-metret, reagensflasken, pipetten og
                    sprøjteflasken (egne tegninger) og bægerglasset (fra sc2.1)
js/kerne.js         NK-navnerum, hævet og sænket skrift, hukommelse, lærred, tal (som sc4.4)
js/kemi.js          modellen: pH, koncentrationer, luppens rum, fortyndet syre og base,
                    universalindikatorens farver og tallene i ord
js/data.js          stofferne og deres pH, hylderne, målene i fane 2 og 3 og replikkerne
js/sprites.js       indlæser SVG-filerne; MAAL har koordinaterne i dem
js/tegning.js       rummet, skalaen og mærket, stofferne, pH-metret, glassene, flasken,
                    pipetten, sprøjteflasken, luppen, ionerne og knapperne
js/lup.js           luppen med prikkerne: fælles for fane 2 og 3
js/praesentation.js tilbuddet om Kemichaels præsentation (samme fil som i sc1.2)
js/sim_skala.js     fane 1
js/sim_lup.js       fane 2
js/sim_fortynd.js   fane 3
js/laerer.js        Kemichael på alle tre faner og påskeæggene
js/rundvisning.js   rundvisningen bag ? (koden er sc1.1's)
js/app.js           faneskift, teorien, genveje, tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen
_sprites.html       udviklerværktøj: viser tegningerne alene
```

## At rette i den

**Stofferne** står i `D.STOFFER` i `js/data.js` med navn, pH, hylde og én
linje (`note`). Et nyt stof skal have en tegning i `sprites/` med samme navn
som `id` (100 × 120, bunden i y 118) og en linje i `MAAL` i `js/sprites.js`.
**Hyldernes hint** står i `D.HYLDER`. **Målene i luppen** står i
`D.LUP_MAAL` med start (pH og zoom) og mål (pH og evt. zMin og zMaks).
**Målene i fortyndingen** står i `D.FORTYND_MAAL`; de forkerte valg har hver
sin forklaring, og tal-opgavens typiske fejl står i `fejl`.

**Modellen** står i `js/kemi.js`. Luppens rum ved zoom z er 10^z / N_A liter,
så antallet af en ion er c · 10^z. Er der over 1.000 af én slags, tegnes de
som tåge (`MAKS` i `js/lup.js`).

**`_selvtest.html`** åbner index.html i en iframe og tjekker vands ionprodukt,
pH for fortyndet saltsyre og natronlud (1, 2, ..., 6,79, 6,98, 7,00) mod
tabelværdierne, at syren aldrig kommer over 7, antallet af ioner i luppen,
terningens størrelse, at tallene skrives rigtigt (10.000, 3,2 millioner, 10
milliarder, 1 billion), at målene kan nås, at 9 skrivemåder af 10.000
godkendes og 7 typiske fejl giver den rigtige besked, at sproget holder
reglerne, at alle tre faner kan gennemføres (fane 1, 2 og 3 også med musen),
at Kemichael kan vises og sendes ud på alle faner, og at layoutet holder fra
520 × 380 til 1500 × 900. Den kræver en lokal server eller Chrome med
`--allow-file-access-from-files`. Den lægger elevens gemte fremskridt tilbage
bagefter. Sidst kørt 25. september 2026: ALT OK (135 påstande).

## Forenklinger

* Alt er ved 25 °C, hvor vands ionprodukt er 1,0 · 10⁻¹⁴ M². Skalaen går fra
  0 til 14; pH under 0 og over 14 findes, men er ikke med.
* Hverdagsstoffernes pH er typiske værdier fra opslagsværker. Den varierer
  fra produkt til produkt (fx afløbsrens 13 til 14, sæbevand 9 til 10).
  Regnvand er ren regn med CO₂ fra luften (5,6). Natron i vand er en 0,1 M
  opløsning af NaHCO₃ (8,3).
* Luppen viser det gennemsnitlige antal ioner, rundet til et helt tal. I et
  rigtigt lille rum svinger antallet. Vandmolekylerne er ikke tegnet.
* Terningens sammenligning ("som en bakterie") er en størrelsesorden.
* Universalindikatorens farver er omtrentlige, og skalaen i den ender i
  samme farve fra 12 til 14.
* Fortyndingen regner saltsyre og natronlud som stærke og fuldstændigt
  protolyserede. Vandets egne ioner er med: [H₃O⁺] = c/2 + √(c²/4 + K<sub>w</sub>)
  for syren og det samme for [OH⁻] for basen. Pipetten tager 1 mL og
  sprøjteflasken 9 mL, men glassene er tegnet lige fulde.
* Klorin er brugt som navn for klorholdigt rengøringsmiddel med
  natriumhydroxid.

## Tilbuddet om præsentationen

Kemichael kommer ikke af sig selv. Første gang en fane åbnes, står der Start
præsentation og Nej tak midt foroven i scenen. Start sender ham ind, Nej tak og
Esc husker valget, og K viser præsentationen uden at spørge. Tilbuddet
forsvinder også, når eleven har gjort noget på fanen. Koden er
`js/praesentation.js` (samme fil som i sc1.2), koblet med
`NK.Praesentation.kobl` i hver `sim_*.js`.

## I menuen

I menuen fra 26. sept. 2026 som c7.2 i `kemi-c-filer/samling_c7.html` (navnet
"pH-skalaen"). Den gamle ligger i
`kemi-c-filer/arkiv/c7.2_ph_skalaen_oldversion.html`.
