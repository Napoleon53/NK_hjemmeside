# sc5.2 Formel og aktuel koncentration

Superanimation om ionerne i en saltopløsning: et salt giver sine ioner i
det forhold, formlen angiver, så [ion] = tallet foran ionen ·
c(salt). Kommer en ion fra to salte, lægges bidragene sammen, og blander
man to opløsninger, lægges stofmængderne sammen. Åbn `index.html`. Mappen
henter kun filer inde fra sig selv.
Ingen `fetch` og ingen moduler, så den virker fra harddisken.

## Bestillingen

1. **Pointen:** den formelle koncentration c(salt) er saltets stofmængde
   pr. liter. Ionernes aktuelle koncentration er tallet foran ionen i
   opløsningsskemaet gange c(salt), og tallet kommer fra formlen.
2. **Afløser** `kemi-c-filer/c5.3_animationer_aktuelkonc_master2.html` og
   `kemi-c-filer/c5.4_opgaver_aktuelkonc.html` (brugerens valg 25. sept.
   2026: emne 5 bliver to superanimationer, sc5.1 og sc5.2). Med fra c5.3:
   træk salt ned i vandet og ram en ions koncentration, saltene NaCl,
   Na₂SO₄, FeCl₃, K₃PO₄ og Al₂(SO₄)₃, to salte med en fælles ion og
   søjlerne med ionernes koncentration (fane 2 i den gamle; her står de
   ved siden af glasset). Med fra c5.4: opgaverne fra formel til aktuel
   koncentration (KI, CaCl₂, BaCl₂, Al₂(SO₄)₃), afstemningen af
   opløsningsskemaet, fra masse til ioner (Pb(NO₃)₂ 4,14 g i 250 mL),
   baglæns (Na₃PO₄ med [PO₄³⁻] = 0,15 M) og blandingerne (CaCl₂ og AlCl₃;
   100 mL CaCl₂ og 200 mL NaCl). Ud: bonus-quizzerne med svarmuligheder
   (de er blevet til gæt på fane 1 og forklaringer ved fejl) og
   fortyndingen med ioner (c5.4 opgave 7; fortynding ejes af sc5.1).
   **Rettet:** i den gamle c5.4 opgave 5 blev to opløsninger "blandet", og
   bidragene blev lagt sammen, som om rumfanget ikke ændrede sig. Her er
   den opgave formuleret som to salte i det samme glas, og blandinger af
   to glas regnes med stofmængder og det samlede rumfang.
3. **Naboerne:** `sc5.1_koncentration` ejer c = n / V, opløsningens
   fremstilling og fortynding. `sc2.2` og `sc2.3` ejer, hvordan saltets
   formel bygges af ionerne. `sc2.4` ejer fældning. Her bruges formlen,
   ikke hvordan den dannes.
4. **Loftet:** 3 faner og 15 salte. Fane 1: 6 opgaver, højst 2 krukker og
   5 søjler. Fane 2: 3 niveauer med nye opgaver hver gang. Fane 3: 4
   opgaver med 4 sæt tal hver, højst 3 glas.
5. **Layoutet:** scene plus panel som `sc5.1`.

9. okt. 2026 (brugerens valg): Kemichael ved katederet er taget helt ud
(han hører til i laboratoriet). Scenen har fået hans bånd, og hintknappen
er gul, så eleven altid kan finde hjælpen selv.

**Hint og svar.** Den gule knap i opgavekortet er hjælpen: Giv hint skriver
hintet i linjen lige over knappen, og knappen bliver til Vis svaret (kun et
omrids, så den ikke frister), der skriver svaret og næste skridt i samme
linje. Efter et forkert svar lyser den gule knap stille op, til linjen
skifter igen. Der er ingen Kemichael og ingen knapper til præsentationen.

## Hvad den viser

| # | Fane | Hvad man gør | Pointe |
|---|------|--------------|--------|
| 1 | Opløsningen | trækker portioner salt ned i et literglas og ser luppen og søjlerne | et salt giver ionerne i formlens forhold |
| 2 | Ionerne | skriver tallene foran ionerne i skemaet og så ionernes koncentrationer, i tre niveauer | [ion] = tallet foran ionen · c(salt), også baglæns og fra massen |
| 3 | Blandinger | regner en ion, der kommer fra to salte | bidrag i samme glas lægges sammen; ved blanding lægges stofmængderne sammen |

**Opløsningen.** Et literglas med vand (0,50 eller 1,00 L) og én eller to
krukker. En portion er 0,10 mol; den kan trækkes ned i glasset, eller man
kan klikke på krukken. Luppen viser altid lige meget væske: én prik er
0,05 M af en ion. Søjlerne viser saltets koncentration (grå) og hver ions,
og en stiplet linje viser målet. Panelet har kun opgavekortet og
opgavelisten. De seks opgaver: NaCl (én til én), Na₂SO₄ (tre
spørgsmål i små trin), FeCl₃ (tre Cl⁻), K₃PO₄ (tre K⁺ i 0,50 L),
Al₂(SO₄)₃ (gæt, hvilken ion der er flest af) og to salte med Na⁺ til
[Na⁺] = 0,50 M. Opgaveteksten er "Lav en opløsning, hvor [Cl⁻] = 0,30 M."
Er der kommet for meget i, siger linjen hvorfor og Start forfra.

**Beregningen i kortet** (brugerens ønske 4. okt. 2026: der foregik for
meget i panelet, og beregningerne stod akavet i linjen). Kortet Glasset
med skemaet og de løbende tal er taget ud. Når glasset viser målet, står
beregningen under opgaveteksten, skrevet som skolens superberegning
(`beregningHTML` i `js/sim_opl.js`): formlen først (c = n / V med
brøkstreg), så tallene med enheder, det beregnede på venstre side,
lighedstegnene under hinanden, opløsningsskemaet, [ion] = tallet foran ·
c(salt) og til sidst en konklusion i ord (`konklusion` i `D.OPL`). Med to
salte står c = n / V én gang, og skemaerne er udeladt. Linjen under
beregningen roser kort og siger, hvordan et gæt gik; svarknapperne fra
gættet er væk, når opgaven er løst.

**Na₂SO₄ i små trin** (brugerens ønske 29. sept. 2026: "Der indgår 3
forskellige størrelser og et antalsforhold"). Først kommer saltet i
glasset (0,10 mol i 0,50 L), så tre spørgsmål med svarmuligheder, ét ad
gangen (`spm` i `D.OPL`): c(Na₂SO₄) = n / V, hvor mange Na⁺ én Na₂SO₄
giver, og [Na⁺]. Glasset viser kun det, der er svaret på: den grå søjle
efter c, ionerne i luppen efter antallet og ionernes søjler efter [Na⁺].
Beregningen i kortet vokser på samme måde: c(Na₂SO₄), så skemaet, så
[Na⁺]. Linjen roser og siger det næste. Et forkert svar bliver slået fra
og forklaret (0,10 M: det er stofmængden n). Mens spørgsmålene står, kan
der ikke komme mere salt i, og Start forfra er væk.

**Ionerne.** Let: salte med 1 : 1, 1 : 2 og 2 : 1 (NaCl, KI, CaCl₂, MgCl₂,
BaCl₂, Na₂SO₄, K₂SO₄, Na₂CO₃). Middel: 1 : 3, 3 : 1 og 2 : 3 (FeCl₃, AlCl₃,
K₃PO₄, Na₃PO₄, Al₂(SO₄)₃), og hver anden opgave er baglæns: en ions
koncentration er målt, og saltets og den anden ions skal findes. Svær:
fra massen (molarmassen, n = m / M og c = n / V med formlen først) til
ionerne. Første opgave på hvert niveau er den fra den gamle c5.4; Ny
opgave giver et nyt salt og nye tal. Tallene foran ionerne skrives i to
felter i skemaet; beskeden ved en fejl kender fejlene (ladningen i stedet
for antallet, O inde i sulfat-ionen, parentesen). Tavlen viser skemaet og
de pæne beregninger, søjlerne kommer, når tallene er fundet, og luppen
fyldes til sidst. Opgaveteksten giver først tallene og siger så vejen:
"Før ionernes aktuelle koncentrationer kan findes, skal
opløsningsskemaet afstemmes." (brugerens ønske 4. okt. 2026: før stod
"Find ionernes koncentrationer" først, selv om første trin er skemaet).
På Svær skal c(salt) beregnes først, og baglæns nævner linjen c(salt) og
den anden ion.

**Blandinger.** To salte i ét glas (bidragene lægges sammen), samme
rumfang, forskelligt rumfang og en ion, der kun er i det ene glas.

**To salte i ét glas** (brugerens ønske 29. sept. 2026: eleverne blander c
og n sammen) starter fra saltene: fx 5,55 g CaCl₂ og 4,00 g AlCl₃ ligger
på to vægte ved siden af et bægerglas med 200 mL vand. Syv trin: n af hvert
salt (m / M, molarmassen står på tavlen), c af hvert salt (n / V), bidraget
til [Cl⁻] fra hvert salt og summen. Når n er fundet, står stofmængden over
bunken; når c er fundet, bærer spatlen saltet over i vandet. Masserne er
valgt, så n og c bliver pæne tal (selvtesten tjekker det). Fejlene, der
blander c og n, har egne beskeder: c = stofmængden, c = m / V og et bidrag
regnet med n i stedet for c. I
stofmængden skal tallet foran ionen med: n(Cl⁻) = 2 · c · V for CaCl₂.
Når det samlede rumfang er fundet, hældes A og B i blandingsglasset, og når
koncentrationen er fundet, viser luppen ionerne. De typiske fejl har egne
beskeder: koncentrationerne lagt sammen, kun det ene rumfang, rumfanget i
mL, tallet foran ionen glemt og ionen fra det ene glas, der ikke er
fordelt i det hele.

**Formlen** tjekkes som i sc5.1 ved at regne den ud med faste prøvetal.
[Cl⁻] i firkantet parentes læses som en koncentration, og (A), (B),
V(samlet) og (NaCl) er etiketter. **Tallet** er rigtigt, når det højst er
1 % fra facit (molarmassen 0,06 g/mol).

Direkte links: `index.html#ioner` og `index.html#bland`.

Genveje: <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> faner · <kbd>T</kbd> teori ·
<kbd>H</kbd> rundvisning ·
<kbd>R</kbd> start forfra eller nye tal · <kbd>Enter</kbd> tjek feltet eller
næste opgave · <kbd>Esc</kbd> luk.

## Filer

```
index.html          markup for de tre faner, teorien og rundvisningen
css/stil.css        alt udseende (som sc5.1 plus skemaet med felter). NB: decimaltal med PUNKTUM i CSS
sprites/            literglasset (nyt); bægerglasset, vægten og vejebåden (som sc5.1), flasken
                    (som sc7.2), krukken (som sc4.5), spatlen og luppen (som sc2.1)
js/kerne.js         NK-navnerum, hævet og sænket skrift, hukommelse, lærred, tal (som sc4.5)
js/data.js          atommasserne, ionerne, saltene, opgaverne og niveauerne, regnetrinene og replikkerne
js/kemi.js          glasset på fane 1, opløsningsskemaet og facit på fane 2 og 3
js/tjek.js          skemaet, formlen og tallet i hvert trin, de typiske fejl og de pæne beregninger
js/sprites.js       indlæser SVG-filerne; MAAL har koordinaterne i dem
js/tegning.js       rummet, bordet, tavlen, krukken, spatlen, vægten, glassene, flasken, søjlerne og luppen
js/fane.js          det, fanerne deler (som sc5.1, plus niveauerne på fane 2)
js/regning.js       regnetrinene i kortet (skemaet, formlen og tallet) og tavlen
js/sim_opl.js       fane 1
js/sim_ioner.js     fane 2
js/sim_bland.js     fane 3
js/rundvisning.js   rundvisningen bag ? (koden er sc1.1's)
js/app.js           faneskift, teorien, genveje, tegneløkke
_selvtest.html      udviklerværktøj, indgår ikke i animationen
_sprites.html       udviklerværktøj: viser tegningerne alene
```

## At rette i den

**Atommasserne** står i `D.ATOMMASSE` i `js/data.js`. **Ionerne** står i
`D.IONER` med navn, ladning og farve i luppen. **Saltene** står i
`D.SALTE`: kationen og anionen og tallet foran hver i skemaet (`kk`, `ka`);
formlen skal have parenteser om sammensatte ioner med et tal efter, fx
`Al2(SO4)3`. **Opgaverne** står i `D.OPL` (fane 1; `spm` er spørgsmålene
efter opløsningen, `regn` de ioner, beregningen viser, og `konklusion`
dens sidste linje), `D.NIV` (fane 2: saltene og tallene, der trækkes
blandt, og den første opgave `std`) og `D.BLAND` (fane 3: sæt af tal; V i
mL, masserne i g). **Beskederne ved fejl** står i `js/tjek.js`
(`T.afstem`, `regler` og `kandidater`).

**`_selvtest.html`** åbner index.html i en iframe og tjekker, at 11
molarmasser passer med tabellen, at ladningerne går lige op i alle 15
salte, og at tallet foran kationen er tallet i formlen, at glasset regner
[ion] rigtigt med to salte, at svaret i fane 1's opgaver rammer målet, at
60 tilfældige opgaver på fane 2 og alle tal på fane 3 kan skrives som
svar, at masserne i fane 3's første opgave giver pæne tal, at 21 fejl i
skemaet, formlerne og tallene giver den rigtige besked, at sproget holder
reglerne, at alle tre faner kan gennemføres med musen og ved at skrive
(også med gæt, spørgsmålene i små trin, for meget salt, hint og svar), at
glasset på fane 1 først viser det, der er svaret på, at beregningen i
kortet har formlen, tallene med enheder og konklusionen (og først kommer,
når opgaven er løst), at opgaveteksten på fane 2 nævner skemaet først, at
saltene først kommer i vandet og glassene først hældes sammen, når det er
regnet, at hint og svar kun kommer fra den gule knap og står i
opgavekortet, at knappen lyser op efter en fejl, og at
layoutet holder fra 520 × 380 til 1500 × 900. Sidst kørt 9. oktober 2026:
ALT OK (116 påstande).

## Forenklinger

* Alle salte regnes som helt opløst og helt delt i ioner. Der er ingen
  hydrolyse (FeCl₃, AlCl₃, Na₂CO₃, Na₃PO₄) og ingen ionpar.
* Rumfanget af en blanding er summen af de to rumfang, og rumfanget af en
  opløsning er rumfanget af vandet.
* Jern(III)chlorid farver opløsningen gul; de andre salte er farveløse.
* Luppen viser én prik for hver 0,05 M af en ion (højst 30, mindst én).
* Atommasserne har to decimaler (som sc4.1). Koncentrationer skrives med
  tre betydende cifre, masser og molarmasser med to decimaler.

## I menuen

I menuen fra 26. sept. 2026 som c5.2 i `kemi-c-filer/samling_c5.html`. De gamle
ligger i
`kemi-c-filer/arkiv/c5.3_animationer_aktuelkonc_master2_oldversion.html` og
`kemi-c-filer/arkiv/c5.4_opgaver_aktuelkonc_oldversion.html`. Mohrtitreringen er
rykket op som c5.3 og er fra 28. sept. 2026 superanimationen `sc5.3_mohrtitrering`
(gamle links med c5.5 finder den).
