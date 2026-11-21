# T2, runde 3: sc6.2, tydelige glas, en rigtig mikrofigur og en tavle, der ikke er indforstået

Niels har prøvet runde 2 (21. nov. 2026) og svarede:

> Jeg synes at den hvide tavle er forvirrende og indforstået. Jeg kunne godt tænke mig at glassene og bogstaverne er mere tydelige. Jeg synes mikrofiguren er et skridt tilbage i forhold til tidligere animationer. Mikro og makro figuren må gerne være tydeligere. Tavlen gerne rykkes lidt over i højre side.
> Mikrofiguren skal ikke indeholde legender, men være så stor at legenderne ligger inde i ionerne.

Det, der virkede i runde 2, bliver: svarene i kortet, panelet på 300 px, trinene på Blandinger, formel med knapper og tal i kortet i opgave 2-4. Det er udseendet af scenen, der skal laves om. Gælder alle tre faner, så animationen er ens.

## 1. Mikrofiguren (luppen)

Forbilleder, som Niels kender og kan lide. Se dem, før du tegner:
- `sc2.1_salt_i_vand`, fane 1: Na⁺ og Cl⁻ som blanke kugler med navnet inde i kuglen, Cl⁻ større end Na⁺ (skærmbillede: `/tmp/claude-1000/-home-niels/95c0d4ca-c197-4b1d-9c22-13d5b3943284/scratchpad/skud/a/sc2.1_salt_i_vand__0.png`).
- `sc6.3_mohrtitrering`, fane 1: en stor lup med en kegle fra stedet i kolben, Cl⁻ som grønne kugler med navnet inde i (`.../skud/b/sc6.3_mohrtitrering__0.png`). Se, hvordan de tegnes i deres `js/`, og genbrug stilen.

Krav:
- **Ingen legende** under luppen. Hver ion er en kugle med sin formel inde i kuglen (Na⁺, K⁺, Cl⁻, Ca²⁺, SO₄²⁻ osv.), stor nok til at formlen kan læses (mindst 13,5 px skrift). Sammensatte ioner er én kugle med formlen på.
- Luppen er **større** end nu, og en **kegle eller stiplet linje** fra et forstørrelsesglas på glasset viser, hvor luppen kigger (makro og mikro hænger synligt sammen). Det er et tydeligt valg, hvilket glas luppen kigger i.
- Antallet af ioner følger koncentrationen som i dag (luppen viser altid lige meget væske), men med færre og større kugler. Vælg en skala, så der højst er ca. 16-20 kugler i den tætteste opløsning på fanen. Står skalaen i en kort linje over luppen (fx "1 kugle = 0,05 M"), er det fint. Det er ikke en legende.
- Fane 1 (Opløsningen) og fane 2 (Ionerne) får samme lup.

## 2. Makrofiguren (glassene)

- Glassene bliver **større og tydeligere**: tykkere glas, synlig væske (svagt farvet, så man ser, hvor meget der er), og tydelige skalastreger.
- **Etiketter på glassene** i stedet for de små grå tekster under dem: fx en etiket med et stort "A", formlen "NaCl" og "0,200 M". Store, sorte bogstaver på lyst papir, som etiketterne i `sc7.5_staerke_og_svage_syrer`, men større. Blandingsglasset får etiketten "Blandingen".
- "Klik: hæld" står tydeligt ved glassene i trin 1, som i dag.

## 3. Tavlen

- Tavlen rykker over i **højre side** af scenen og bliver **mindre**.
- Den må ikke være indforstået:
  - Ingen "OPGAVENS TAL". Tallene står på glassenes etiketter.
  - Ingen overskrift i versaler. Ingen "N trin mere".
  - Tavlen er tom (eller ikke tegnet), til første linje er fundet. Den vokser linje for linje, ligesom Byg figuren afslører én del ad gangen.
  - Hver linje begynder med et kort navn i ord, så den kan læses alene, og så regnestykket. Fx:
    - "Rumfanget af blandingen: V = 100 mL + 100 mL = 200 mL = 0,200 L"
    - "Cl⁻ fra glas A: n = c · V = 0,200 M · 0,100 L = 0,0200 mol"
    - "Cl⁻ fra glas B: n = c · V = 0,200 M · 0,100 L = 0,0200 mol"
    - "Cl⁻ i blandingen: [Cl⁻] = n / V = 0,0400 mol / 0,200 L = 0,200 M"
  - Den linje, kortet spørger om, står med "?" og gul ramme, som i dag.
- Vurdér, om den hvide, blanke tavle skal være en roligere flade (fx lyst papir som kortet, uden genskin). Det vigtigste er, at den ikke fylder mest i scenen og ikke ser ud som noget, eleven skal gøre noget ved.
- Fane 2 (Ionerne) og tavlen på fane 1 følger samme regler (intet "OPGAVENS TAL", navn i ord foran hver linje).

## Layoutet på fane 3

Kortet øverst i midten. Under det: glassene (A, B og Blandingen) til venstre og i midten, luppen ved blandingsglasset med keglen, tavlen til højre. Intet må overlappe fra 1100 × 620 til 1600 × 950, og intet må hoppe, når en del dukker op eller kortet skifter.

## Det samme som før

Følg `opgave_trin.md` og `opgave_t2_runde2.md` (regler, selvtest uden lempede grænser, ret kun i sc6.2, ingen commit, README). Selvtesten skal desuden dække: ingen legende under luppen, ionernes formel står i kuglerne, glassene har etiketter, tavlen har ingen "OPGAVENS TAL" eller "trin mere" og står i højre side.

Skærmbilleder af fane 3 opgave 1 (alle trin), opgave 2 (ét trin), Ionerne og Opløsningen i `/tmp/claude-1000/-home-niels/95c0d4ca-c197-4b1d-9c22-13d5b3943284/scratchpad/trin/T2c/`, 1400 × 860 og 1100 × 620. Se dem selv, og sammenlign luppen med sc2.1 og sc6.3, før du melder færdig.

Rapport højst 250 ord.
