# sb1.1 Reaktionshastighed

Superanimation om reaktionshastighed (Basiskemi B s. 7-13). Åbn `index.html`.
Mappen henter kun filer inde fra sig selv og fra Kemichael, og den virker
også, når den åbnes direkte fra harddisken.

Den afløser den gamle b1.1, `animationer/kemi-b-filer/b1.1_reaktionshastighed.html`,
når brugeren siger til. Indtil da viser menuen den gamle.

## Bestillingen

1. **Pointen:** reaktionshastigheden er hældningen på koncentrationskurven. Den
   falder undervejs, fordi reaktanterne bliver brugt op og støder sjældnere
   sammen.
2. **Afløser** den gamle b1.1. Med fra den gamle: bogens reaktion med glasset,
   der bliver gult, kurverne for [Br₂] og [BrO₃⁻], afspil og træk i tiden,
   gennemsnitshastighed mellem to tidspunkter, tangenten, v(Br₂) = 3·v(BrO₃⁻),
   sammenstødsmodellen for koncentration og Mg som klump og pulver. Quizzens
   seks spørgsmål er blevet til opgavekort i fanerne. Nyt: eleven drejer selv
   linealen til en tangent, partiklerne reagerer og tegner deres egen kurve,
   og fane 3 med hastighedsudtryk ud fra forsøgsdata.
3. **Naboerne:** b1.2 ejer energidiagram, aktiveringsenergi og temperatur, b1.3
   ejer katalyse. Temperaturknapperne og kortene om katalysator og inhibitor
   fra den gamle er derfor ikke med (brugerens valg); teorien henviser til
   1.2 og 1.3 med én linje.
4. **Loftet:** 3 faner. Én reaktion på fane 1, højst 48 partikler (opløsning)
   eller 90 H⁺ og 36 Mg (metal) på fane 2, 8 reaktioner og højst 6 forsøg ad
   gangen på fane 3.
5. **Layoutet:** scene plus panel på alle tre faner.

## De tre faner

| Fane | Eleven | Pointen |
|------|--------|---------|
| 1 Kurven | afspiller reaktionen, aflæser, lægger en sekant og drejer linealen til en tangent | hastigheden er hældningen, og den falder |
| 2 Sammenstød | skruer på antallet af A og B eller knuser magnesium og tæller sammenstødene | derfor flader kurven ud; koncentration og overflade giver flere sammenstød |
| 3 Hastighedsudtryk | vælger startkoncentrationer, måler v₀ og finder eksponenterne | eksponenterne findes ved forsøg, ikke i reaktionsskemaet |

Direkte links: `#kurve`, `#sammenstoed`, `#udtryk`.

### Fane 1: Kurven

Kurverne tegnes, mens reaktionen afspilles (42 s pr. sekund), eller hvor man
trækker hen. Værktøjet virker på den kurve, der er valgt under "Mål på":

* **Aflæs:** tid og begge koncentrationer.
* **Sekant:** t₁ og t₂ med Δt, Δ[stof] og gennemsnitshastigheden.
* **Tangent:** en lineal gennem punktet, som eleven drejer i enderne. Panelet
  viser linealens hældning og v = hældningen (Br₂) eller v = −hældningen
  (BrO₃⁻). Knappen "Læg linealen som tangent" gør det for én i frit spil.

Opgaverne (én knap: Start opgave → Giv hint → Vis svaret → Ny opgave) kommer
første gang i denne rækkefølge: hvornår hastigheden er størst, gennemsnit
(først bogens 80-120 s), tangenten, koefficienterne, sekant mod tangent og
enheden. Under gennemsnits- og tangentopgaven er værktøjet låst, og facit er
skjult. Tangenten godkendes, når linealens hældning er inden for 10 % af den
rigtige; ellers siger beskeden, om den er for stejl eller for flad.

### Fane 2: Sammenstød

To opstillinger. **To opløste stoffer:** A + B → C med 6, 12 eller 24 af hver.
**Metal i syre:** Mg(s) + 2 H⁺(aq) → Mg²⁺(aq) + H₂(g), hvor de samme 36
Mg-atomer ligger som én klump (6 × 6), fire stykker (3 × 3) eller ni korn
(2 × 2). Kurven til højre tæller produktet, og det forrige forsøg bliver
stående stiplet med sit navn, så man kan sammenligne. Panelet viser
sammenstød pr. sekund over de sidste tre sekunder.

Opgaverne er forudsigelser, som eleven bagefter kan prøve i kassen: fordobl A,
fordobl begge, hvorfor kurven flader ud, klump mod pulver.

### Fane 3: Hastighedsudtryk

En reaktion ad gangen, i rækkefølgen i `D.REAKTIONER`. Eleven vælger 0,10,
0,20 eller 0,30 M af hver reaktant og trykker Mål. Hvert forsøg giver en kurve
for produktet med den stiplede tangent i t = 0, og en række i tabellen. Så
klikkes eksponenterne frem (0, 1, 2), og Tjek svarer på fejlen:

* eksponenterne er koefficienterne fra reaktionsskemaet: det siges direkte
* én eksponent er forkert, og der er to forsøg, hvor kun det stof er ændret:
  "I forsøg 1 og 2 blev [H₂] ganget med 2, og v₀ blev ganget med 2."
* der er ikke sådan et par: eleven bedes lave det

Hintet bygges på samme måde ud fra elevens egne forsøg.

| Reaktion | Hastighedsudtryk |
|----------|------------------|
| 2 NO + 2 H₂ → N₂ + 2 H₂O | v = k·[NO]²·[H₂] |
| H₂ + I₂ → 2 HI | v = k·[H₂]·[I₂] |
| 2 N₂O₅ → 4 NO₂ + O₂ | v = k·[N₂O₅] |
| NO₂ + CO → NO + CO₂ | v = k·[NO₂]² |
| CH₃CH₂Br + OH⁻ → CH₃CH₂OH + Br⁻ | v = k·[CH₃CH₂Br]·[OH⁻] |
| (CH₃)₃CBr + OH⁻ → (CH₃)₃COH + Br⁻ | v = k·[(CH₃)₃CBr] |
| 2 NO + O₂ → 2 NO₂ | v = k·[NO]²·[O₂] |
| 5 Br⁻ + BrO₃⁻ + 6 H⁺ → 3 Br₂ + 3 H₂O | v = k·[Br⁻]·[BrO₃⁻]·[H⁺]² |

Formerne er de kendte fra litteraturen (lærebøger i fysisk kemi; NO₂ + CO
under ca. 225 °C, (CH₃)₃CBr som SN1 og CH₃CH₂Br som SN2).

## Forenklinger

* **Fane 1:** Br⁻ og H⁺ er i stort overskud, så kun [BrO₃⁻] ændrer sig, og
  reaktionen bliver af første orden i BrO₃⁻ med K = 0,0116 s⁻¹. K er overtaget
  fra den gamle b1.1, hvor den var tilpasset bogens eksempel; startværdien er
  [BrO₃⁻] = 1,00·10⁻³ M. Den gamle quiz sagde 3,0·10⁻⁴ M/s for 80-120 s, men
  dens egen graf gav 1,1·10⁻⁵ M/s. Det tal er ikke taget med. Glassets farve
  er en blanding mellem klar og gul efter [Br₂], ikke en målt absorbans.
* **Fane 2:** todimensional kasse, alle partikler med samme fart (samme
  temperatur hele tiden), elastiske stød. Kun 15 % af sammenstødene mellem A og
  B giver C, og kun 6 % af H⁺, der rammer metallet, reagerer. Hvorfor ikke
  alle sammenstød giver reaktion, er emnet i 1.2. Kurven tæller partikler, ikke
  koncentrationer. Metallet svæver midt i syren i stedet for at ligge på bunden,
  så alle sider kan rammes. Der er 90 H⁺ til de 72, der skal bruges.
* **Fane 3:** k er valgt, så starthastigheden ved 0,10 M af alle reaktanter er
  et tal, der er let at regne med. For 2 NO + 2 H₂ er tallene fra kompendiets
  opgave (0,10 M og 0,10 M giver 1,2 mM/s). Kurven regnes ud fra
  hastighedsudtrykket hele vejen, også når en reaktant er ved at slippe op.
  Hastigheden måles på et produkt, så alle kurver starter i 0 og stiger.

## Filer

```
index.html            toplinje, tre faner, teori og rundvisning
css/stil.css          alt udseende. NB: decimaltal med PUNKTUM i CSS
js/kerne.js           NK-navnerum, tal med komma og tierpotens, canvas
js/model.js           kemien: bogens reaktion og hastighedsudtrykkene
js/data.js            Kemichaels replikker, opgaverne og de otte reaktioner
js/sprites.js         lageret til bægerglasset og Kemichaels sprites
js/opgave.js          opgavekortet med den ene knap (fane 1 og 2)
js/sim_kurve.js       fane 1
js/sim_sammenstoed.js fane 2
js/sim_udtryk.js      fane 3
js/laerer.js          Kemichaels præsentation af hver fane
js/rundvisning.js     rundvisningen bag ?
js/app.js             faneskift, tastatur, tegneløkke
sprites/              bægerglasset (samme som sc2.2)
_selvtest.html        udviklerværktøj, indgår ikke i animationen
```

## At rette i den

**Opgaverne** på fane 1 og 2 står i `D.KURVE_OPGAVER` og `D.SAM_OPGAVER` i
`js/data.js`. En opgave har en tekst, svarmuligheder med forklaring (de
forkerte er typiske fejl), et hint og `opsaet`, der stiller scenen op.
**Reaktionerne** på fane 3 står i `D.REAKTIONER`: reaktanter med koefficient,
produktet, der måles på, ordenerne og k. **Tallene** for fane 1 står øverst i
`js/model.js`. **Partiklernes** antal, størrelse, fart og sandsynligheder står
øverst i `js/sim_sammenstoed.js`.

## Selvtesten

`_selvtest.html` skal åbnes gennem en lokal server. Den tjekker modellen på
fane 1 (v(Br₂) = 3·v(BrO₃⁻), hældningen mod differenskvotienten, 80-120 s),
at alle opgaver har præcis ét rigtigt svar med forklaring, opgavekortets
knap, låsen og tangenten (også ved at trække i linealen), at flere partikler
og mindre korn giver flere sammenstød, at intet forsvinder i kassen, at de
otte hastighedsudtryk har litteraturens form, at tjek og hint svarer på
fejlen, Kemichaels præsentation og sproget.

## Kemichael

Kemichael præsenterer hver fane første gang, den åbnes i en browser, som i
sc2.3 og sc2.4: han går ind midt på scenen, siger tre korte replikker og går
igen. Under anden replik peger han på det kort i panelet, den handler om, og
det lyser op. Scenen låser ikke. Knappen Spring præsentationen over, to klik
på ham og Esc sender ham ud, og <kbd>K</kbd> viser præsentationen igen.
Replikkerne står i `D.INTRO` i `js/data.js`, og hvad der er vist, huskes under
`nk-sb1.1-intro` i browseren. Figuren kommer fra `../../v2/kemichael/kemichael.js`;
koblingen står i `js/laerer.js`.

## Til menuen

Når brugeren siger til: knappen med `data-emne="b1.1"` i
`animationer/kemi-b-filer/samling_b1.html` skal pege på
`../superanimationer/sb1.1_reaktionshastighed/index.html`, den gamle flyttes
med `git mv` til arkivet med `_oldversion` i navnet (de gamle C-animationer
ligger i `kemi-c-filer/arkiv/`; der er endnu intet arkiv for B), og kolonnen
"I menuen" i superanimationernes README rettes. Navnet i
`FEEDBACK_EMNER` i `animationer/samling_alt_b.html` er allerede
'Reaktionshastighed'.

## Tilbuddet om præsentationen

Siden 24. september 2026 kommer Kemichael ikke af sig selv. Første gang en fane
åbnes, står der Start præsentation og Nej tak midt foroven i scenen. Start
sender ham ind, Nej tak og Esc husker valget, og K viser præsentationen uden at
spørge. Koden er `js/praesentation.js` (samme fil som i sc1.2), som i
`js/app.js` pakker den gamle `startIntro` ind (`NK.Praesentation.pakInd`).
Reglen står i `../README.md` under "Kemichael præsenterer hvert rum".
