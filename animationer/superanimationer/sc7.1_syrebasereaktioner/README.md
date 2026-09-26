# sc7.1 Syre-base-reaktioner

En superanimation i sin egen mappe. Åbn **`index.html`**. Mappen henter kun
filer inde fra sig selv, bortset fra Kemichael, som hentes fra
`../../v2/kemichael/`.

Den afløser `animationer/kemi-c-filer/c7.1_syrebase_reaktioner.html` og er i
menuen fra 26. sept. 2026; den gamle ligger i `kemi-c-filer/arkiv/`.

## Bestillingen (september 2026)

1. **Pointen:** I en syre-base-reaktion flytter én hydron (H⁺) fra syren til
   basen. Syren bliver til sin korresponderende base, og basen til sin
   korresponderende syre.
2. **Afløser c7.1.** Med fra den gamle: de otte reaktioner, spørgsmålet om,
   hvem der er syren, produkterne med en forklaring på hvert forkert svar,
   hydronen, der flyver fra syren til basen, parrene i to farver (blå og
   lilla) og skemaet med alle parrene til sidst. Brugerens ønsker: mere
   træning, og at man selv kan trække hydronen fra syren over til basen.
3. **Naboerne:** pH-skalaen (c7.2), pH-beregninger (c7.3) og titreringen
   (c7.4 og sb3.2) røres ikke. Syrestyrke og pKs vises ikke; tabelværdierne
   bruges kun inde i modellen.
4. **Loftet:** tre faner. To partikler på scenen i fane 1, ti faste
   reaktioner der. Fane 2 og 3 har tre sværhedsgrader og laver selv nye
   reaktioner (Let 10, Middel 30, Svær 33 forskellige).
5. **Layoutet:** scene plus panel. Molekylerne fylder scenen i fane 1, en
   tavle fylder den i fane 2 og 3.

## Tre faner

**1 Hydronen** (`#hydron`). To partikler står som strukturformler med frie
elektronpar (gule prikker, som i sc3.1). Eleven tager fat i et H og slipper
det på den anden partikel. Når H'et løftes, bliver bindingens elektronpar
hjemme som et frit par, og atomet får en minusladning mere: det, der flyver,
er H⁺. Slippes hydronen på basen, lander den på det nærmeste frie par, og
basen får en plusladning mere. Først da kommer produkterne og parrene i
skemaet under scenen. Ti reaktioner fra HCl + H₂O til HCO₃⁻ + OH⁻: de otte
gamle minus HF og HBr (de er i træningen) plus HCl + NH₃, H₃O⁺ + OH⁻ og
CH₃COOH + OH⁻. Kortet Syre-basepar samler parrene fra de løste reaktioner
(den gamle sluttabel, men udfyldt undervejs).

* Et H fra basen sluppet på syren hopper tilbage med en forklaring:
  "NH₃ afgiver ikke en hydron …" eller for en amfolyt "H₂O kan godt afgive
  en hydron, men over for HCl tager den imod en".
* Et H på C (eddikesyre) sidder fast og ryster.
* Knappen: Giv hint → Vis svaret → Næste reaktion. Efter alle ti går den
  videre til fane 2. Tallene 1-10 i kortet springer til en reaktion.

**2 Produkterne** (`#produkter`). En reaktion på tavlen med to tomme
pladser efter pilen. Nederst sidder formler som magneter: de to rigtige og
de fejl, elever laver. Træk (eller klik) dem op. Et forkert svar hopper
tilbage med en forklaring, der passer til fejlen. Tavlen tæller, hvor mange
der er løst i træk uden fejl og uden Vis svaret, og husker rekorden pr.
sværhedsgrad.

**3 Parrene** (`#par`). En hel reaktion på tavlen. Fire mærkater (syre, base,
korresp. base, korresp. syre) skal hen under de rigtige formler, trukket
eller med to klik. Mærkaterne har parrenes farver fra start. Produkterne
står i tilfældig orden, så parrene ikke altid står over hinanden.

Sværhedsgraden er fælles for fane 2 og 3:

| Niveau | Reaktionerne |
|--------|--------------|
| Let | en syre eller en base med vand (HCl, HBr, HF, HNO₃, CH₃COOH, HCOOH, NH₃, CH₃COO⁻, HCOO⁻, F⁻) |
| Middel | en syre og en base uden vand (også H₃O⁺, NH₄⁺ og OH⁻) |
| Svær | svovlsyre, phosphorsyre og kulsyre og deres ioner, med vand, H₃O⁺, OH⁻, NH₃, NH₄⁺ eller eddikesyre |

## Modellen

`js/model.js` regner alt ud af `js/data.js`; intet svar er skrevet i hånden.

* **Stofferne** hedder `familie:n`, fx `po4:3` (H₃PO₄). n er antallet af
  hydroner, og ladningen er n + q0. Den korresponderende base er n − 1.
  Formlen skrives ud fra familien (`NK.Syrebase.formel`).
* **Hvem er syren?** For begge retninger regnes logK = pKs(basens
  korresponderende syre) − pKs(syren). Den største vinder. Selvtesten tjekker,
  at det giver den syre, hver af de ti reaktioner i fane 1 har.
* **Træningens par** (`NK.Syrebase.gyldig`): ikke to fra samme familie
  (undtagen H₃O⁺ + OH⁻); kan begge afgive, skal den ene retning være mindst
  10⁶ gange bedre (derfor er HCO₃⁻ + H₂O ikke med); uden vand skal
  reaktionen forløbe (logK > 0); med vand må den være svag, men ikke under
  logK = −11 (derfor er SO₄²⁻ + H₂O ikke med).
* **De forkerte svar** (`NK.Syrebase.forkerte`): ladningen glemt (Cl, H₃O),
  fortegnet vendt (Cl⁺), rollerne byttet (H₂Cl⁺, OH⁻ fra vandet), to hydroner
  (HPO₄²⁻ fra H₃PO₄) og H₂ eller H⁺. Hver har sin forklaring.
* **Mærkaterne** (`NK.Syrebase.maerkeFejl`): forklaringen afhænger af fejlen:
  syre eller base efter pilen, korresponderende før pilen, syre på en amfolyt,
  der her tager imod, osv.
* **Strukturerne** (`NK.Mol`): atomer og bindinger står i `D.STRUKTUR`. Antallet
  af frie par er (valenselektroner − ladning − bindinger) / 2, og de lægges i
  de største huller mellem bindingerne. Når et H fjernes, falder atomets
  ladning med 1 (parret bliver), og når et H sættes på et frit par, stiger
  basens atoms ladning med 1. Selvtesten tjekker oktetreglen for alle
  strukturer og for alle 34 måder, en hydron kan flyttes på.

## Filer

```
index.html            tre faner, panelerne, teorien og rundvisningen
css/stil.css          alt udseende (som sc6.6 plus tal-knapper, parlisten og
                      sværhedsgraden). NB: decimaltal med PUNKTUM i CSS
js/kerne.js           NK-navnerum, formler, lærred, localStorage (som sc6.6)
js/data.js            familierne, pKs, sværhedsgraderne, strukturerne, de ti
                      reaktioner og Kemichaels replikker
js/model.js           NK.Syrebase (roller, træning, forkerte svar, mærkater)
                      og NK.Mol (strukturerne og de frie par)
js/tegning.js         rum og bord, strukturformler, hydronen, skemaet med
                      klammerne, tavlen, brikker og pladser
js/sprites.js         lageret til Kemichaels sprites (ingen egne sprites)
js/praesentation.js   tilbuddet om præsentationen (ens i alle mapper)
js/tavle.js           det, fane 2 og 3 deler: layout, brikker, sværhedsgrad
js/sim_hydron.js      fane 1
js/sim_produkter.js   fane 2
js/sim_par.js         fane 3
js/laerer.js          Kemichael på de tre faner
js/rundvisning.js     rundvisningen bag "?"
js/app.js             faneskift, teori, tastatur og tegneløkken
_selvtest.html        udviklerværktøj, se nedenfor
```

## At rette i den

* **En ny reaktion i fane 1:** en linje i `D.HYDRON` (a, b, syre, tekst, hint)
  og strukturer i `D.STRUKTUR` for de stoffer, der ikke har en. Koordinaterne
  er i bindingslængder med y nedad. Syrens H og basens frie par vender helst
  mod +x; molekylet til højre spejles.
* **Flere stoffer i træningen:** en familie i `D.FAM`, pKs i `D.PKS` og
  stoffet i en liste i `D.NIVEAUER`. Modellen finder selv de gyldige par.
* **Replikker:** `D.INTRO_*`, `D.HYDRON_FAERDIG`, `D.TI_I_TRAEK`, `D.KAFFE_SUR`.

## Forenklinger

* Alle reaktioner skrives med ⟶. Om en reaktion er en ligevægt, og hvor langt
  den forløber, hører til pH og syrestyrke. pKs bruges kun til at afgøre, hvem
  der er syren, og hvilke par træningen må bruge.
* Strukturerne tegnes plant med frie par som prikpar. Svovl og phosphor tegnes
  med dobbeltbindinger til O (udvidet oktet), og i salpetersyre står NO₂ som
  en gruppe, så der ikke skal vises formelle ladninger.
* Hydronen lander på det frie par, den slippes nærmest. I carboxylat og
  hydrogencarbonat er det altid det negative O.
* I fane 1 flytter kun én hydron pr. reaktion, også i kulsyre og phosphorsyre.

## Kemichael

Han tilbyder at præsentere hver fane (Start præsentation / Nej tak), og mens
han taler, rykker indholdet til højre for ham. Han roser første gang alle ti
reaktioner er løst, og første gang der er ti i træk på fane 2 og 3.
Påskeæg: en hydron sluppet i kaffekoppen på fane 1 ("Min kaffe er sur nok i
forvejen."). Koppen er desuden det fælles påskeæg.

## Genveje

<kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> fane · <kbd>R</kbd> forfra · <kbd>H</kbd> rundvisning ·
<kbd>T</kbd> teori · <kbd>K</kbd> Kemichaels præsentation · <kbd>Enter</kbd> næste ·
<kbd>Esc</kbd> send Kemichael ud

## Selvtest

`_selvtest.html` skal åbnes gennem en lokal server med `animationer/` som rod
(Kemichael hentes derfra). Den tjekker formlerne, rollerne mod pKs, træningens
par, strukturerne før og efter hver mulig overførsel, de forkerte svar, alle
mærkater på alle stoffer, forløbet i de tre faner med musen, Kemichael,
sproget og layoutet fra 520 × 380 til 1500 × 900.
Sidst kørt: ALT OK, 25. september 2026.

## I menuen

I menuen fra 26. sept. 2026 som c7.1 i `kemi-c-filer/samling_c7.html`. Den gamle
ligger i `kemi-c-filer/arkiv/c7.1_syrebase_reaktioner_oldversion.html`.
