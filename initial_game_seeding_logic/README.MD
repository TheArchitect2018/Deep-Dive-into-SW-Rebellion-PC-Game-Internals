# Seeding Process

This document describes how [seed.js](./seed.js) initializes the galaxy at game start.

It follows the actual code flow:
1. classify and shuffle systems
2. decide which systems are populated and who controls them
3. assign support, energy, and raw materials
4. seed facilities, garrisons, fleets, and common units
5. seed major characters and extra personnel

## Overview

The top-level seeding entry point is the exported function in `seed.js`.

High-level order:
- count core systems
- compute how many core systems should start as Alliance strong, Alliance weak, Empire strong, Empire weak, and neutral
- shuffle all systems
- seed each system in one pass
- seed common Alliance units
- seed common Empire units
- seed random personnel

## 1. Core System Buckets

Before iterating systems, the seed code computes target counts for core-system control buckets.

For each bucket:

```text
bucket_count = floor(core_count * percent / 100)
```

In code this is:

```text
calculate_value(core_count, percent)
```

where:

```text
calculate_value(m, n) = floor((n * m) / 100)
```

The buckets are:
- Alliance strong support
- Alliance weak support
- Empire strong support
- Empire weak support
- Neutral

Neutral is the remainder:

```text
neutral = core_count
        - alliance_strong
        - alliance_weak
        - empire_strong
        - empire_weak
```

There is one hard-coded correction:
- `Coruscant` is always Empire-controlled, so one Empire strong slot is consumed up front.

## 2. System Iteration Order

The system list is shuffled before seeding:

```text
shuffle_array(session.sectors)
```

This means most non-special systems are assigned from a randomized order rather than by map order.

## 3. Special Systems

Three systems are handled specially:

### Coruscant

`SYSTEM_CORUSCANT` is always:
- populated
- charted
- Empire-controlled
- support `100`

Then it gets:
- Empire HQ facilities
- Coruscant starting units
- Coruscant main fleet
- Emperor Palpatine

### Yavin

`SYSTEM_YAVIN` is always:
- populated
- charted
- Alliance-controlled
- support `100`

Then it gets:
- Yavin starting units
- Yavin starting personnel

### Alliance HQ

The first eligible rim system that is not Yavin becomes the Alliance HQ system.

It is forced to:
- populated
- charted
- Alliance-controlled
- support `100`

Then it gets:
- Alliance HQ facilities
- Alliance HQ starting units
- Alliance main fleet
- Mon Mothma

## 4. Populated vs Unpopulated Systems

### Core Systems

Non-special core systems use:

```text
get_core_system_populated()
```

which is:

```text
random_outcome(param_7730)
```

Comment context:
- `7730 = 100`
- so core systems are commented as always populated in the stock data

If populated, control is assigned by draining the precomputed bucket counts in this order:
- Alliance strong
- Alliance weak
- Empire strong
- Empire weak
- neutral

### Rim Systems

Non-special rim systems use:

```text
get_rim_system_populated()
```

which is:

```text
random_outcome(param_7731)
```

Comment context:
- `7731 = 31`
- so rim systems are much less likely to start populated

If a rim system is not populated:
- it does not get facilities
- it does not get garrison troops
- it gets default support `50`

## 5. Support Values

### Core Support

For populated core systems:

```text
support = base + random(0..extra)
```

using different parameter sets for:
- owned strong support
- owned weak support
- neutral

Comment context from `seed.js` comments:
- `7682` owned-with-support base is shown as `60`
- `7683` owned-with-support random extra is shown as `30`
- `7684` owned-without-support base is shown as `20`
- `7685` owned-without-support random extra is shown as `30`
- `7764` neutral core initial support spread is shown as `18`

Neutral core support uses:

```text
support = random(0..param_7764) + (50 - param_7764 / 2)
```

### Rim Support

Populated rim systems use:

```text
support = random(0..param_7765) + (50 - param_7765 / 2)
```

Comment context:
- `7765 = 0`
- in that commented data set, rim support starts exactly at `50`

Unpopulated rim systems are set to:

```text
support = 50
```

## 6. Energy and Raw Materials

Every system gets energy and raw-material values, even on the rim.

### Core Energy

```text
energy = clamp(param_7721 + random(0..param_7722), min_7713, max_7714)
```

Comment context:
- `7713 = 0`
- `7714 = 15`
- `7721 = 10`
- `7722 = 4`

So the commented core-energy formula is effectively:

```text
energy = clamp(10 + random(0..4), 0, 15)
```

### Core Raw Materials

```text
raw = clamp(param_7723 + random(0..param_7724), min_7711, max_7712)
raw = min(raw, energy)
```

Comment context:
- `7711 = 0`
- `7712 = 15`
- `7723 = 5`
- `7724 = 9`

So the commented core-raw formula is:

```text
raw = clamp(5 + random(0..9), 0, 15)
raw = min(raw, energy)
```

### Rim Energy

Rim energy has two random terms:

```text
energy = clamp(
    param_7725
    + random(0..param_7726)
    + random(0..param_7727),
    min_7713,
    max_7714
)
```

Comment context:
- `7713 = 0`
- `7714 = 15`
- `7725 = 1`
- `7726 = 4`
- `7727 = 9`

So the commented rim-energy formula is:

```text
energy = clamp(1 + random(0..4) + random(0..9), 0, 15)
```

### Rim Raw Materials

```text
raw = clamp(param_7728 + random(0..param_7729), min_7711, max_7712)
raw = min(raw, energy)
```

Comment context:
- `7711 = 0`
- `7712 = 15`
- `7728 = 1`
- `7729 = 14`

So the commented rim-raw formula is:

```text
raw = clamp(1 + random(0..14), 0, 15)
raw = min(raw, energy)
```

### Post-adjustment

After facilities are seeded, the code ensures:
- `energy >= used_energy`
- `raw >= mine_count`

If not, it raises the stored system totals to match actual seeded contents.

## 7. Facility Seeding

Facility seeding only happens on populated systems.

The loop runs once per energy slot:

```text
for count in 0 ..< total_energy
```

Each slot either becomes a mine or a non-mine facility.

### Mine Chance

Mine probability is driven by remaining raw-material headroom:

```text
mine_threshold = (total_raw - mine_count) * mine_multiplier
seed_mine = random_outcome(mine_threshold)
```

Where:
- `mine_multiplier = param_7766` for core
- `mine_multiplier = param_7767` for rim

Comment context:
- `7766 = 4`
- `7767 = 2`

So, with the stock comments, core systems are more mine-biased than rim systems at the same raw-material headroom.

If the mine roll succeeds:
- add one `MINE`
- increment `mine_count`

Otherwise:
- roll a weighted facility from `syfccr` for core or `syfcrm` for rim
- add the selected facility

So the expected shape is:
- higher raw-material systems are more likely to get mines
- low-raw systems spend more energy slots on generic facilities

## 8. Garrison Troops To Prevent Uprisings

Every populated non-neutral system may get forced garrison troops.

The requirement is:

```text
if support < base:
    troops_required = compute_adjusted_value(base - support, extra)
else:
    troops_required = 0
```

In code:

```text
base  = param_7761
extra = -param_7762
```

Comment context:
- `7761 = 60`
- `7762 = -10` in the comment block, and the code negates the parameter when loading it

So the code effectively uses:

```text
base = 60
extra = 10
troops_required = floor((support_gap + 9) / 10)
```

Example:
- if support is `35`, the gap is `25`
- `troops_required = floor((25 + 9) / 10) = 3`

And:

```text
compute_adjusted_value(m, b) = floor((m + (b - 1)) / b)
```

The troops added are:
- `ALLIANCE_ARMY_REGIMENT` for Alliance systems
- `IMPERIAL_ARMY_REGIMENT` for Empire systems

## 9. Starting Fleets And Fixed Units

Special systems get scripted starting assets from resource tables:
- Yavin units from `cmunyv`
- Alliance HQ units from `cmunhq`
- Coruscant units from `cmuncr`
- Alliance main fleet from `cmunaf`
- Empire main fleet from `cmunef`

### Alliance Main Fleet Placement

Alliance main fleet has a special location roll:

```text
place_on_yavin = random_outcome(param_5129)
```

Comment context:
- `5129 = 50`
- so Alliance Fleet 1 is a 50/50 Yavin-vs-HQ placement in the commented data

If true, the fleet goes to Yavin. Otherwise it goes to Alliance HQ.

## 10. Common Unit Seeding

After all systems are initialized, `seed_units()` runs once for Alliance and once for Empire.

### Budget

First it computes available maintenance:

```text
available = total_maintenance - total_current_cost
```

Then it computes how much of that budget may be spent on seeded common units:

```text
deploy_budget = floor(available * side_percent / 100)
```

The percentage comes from:
- `5168` for standard
- `5169` for large
- `5170` for huge

Comment context from the comments in `seed.js`:
- `5168` standard seed:
  - Alliance `33/33`, `25/38`, `25/38`
  - Empire `33/33`, `38/25`, `38/25`
- `5169` large seed:
  - Alliance `25/25`, `20/30`, `20/30`
  - Empire `25/25`, `30/20`, `30/20`
- `5170` huge seed:
  - Alliance `20/20`, `15/25`, `15/20`
  - Empire `20/20`, `25/15`, `25/15`

These are side- and difficulty-dependent percentages that convert available maintenance into seeding budget.

### Picking Systems

Each seeded unit bundle picks a random eligible seeded system for that side:

```text
random_system = fetch_galaxy(... PROP_SYSTEM_SEED_GET_BY_COUNT ...)
```

### Picking Unit Bundles

It then rolls one weighted entry from:
- `cmunal` for Alliance
- `cmunem` for Empire

If the bundle fits in remaining budget, it is added.

### Placement

If the bundle starts with a non-ship object:
- all objects go directly into system inventory

If the bundle starts with a ship:
- the first entry becomes a ship
- remaining entries become ship inventory
- if the system already has a fleet, the ship joins that fleet
- otherwise a new fleet is created

This continues until the budget goes negative on the next attempted bundle.

## 11. Character Generation

`setup_character()` computes each seeded character's stats.

### Jedi / force

```text
jedi = datasheet.jedi || random_outcome(jedi_probability)
force = jedi_level_base + random(0..jedi_level_variance)
```

### Diplomacy / espionage / combat

Without Jedi force:

```text
stat = base + random(0..variance)
```

With Jedi force:

```text
stat = base + floor((base + random(0..variance)) * force / 100)
```

Combat also applies an optional handicap floor:

```text
combat = max(0, boosted_value + (combat_base - handicap))
```

### Leadership

Base leadership:

```text
leadership_base = leadership_base + random(0..leadership_variance)
```

Displayed leadership:
- normal characters use the same plain formula
- Empire characters get the Seat of Power bonus at seed time:

```text
leadership = leadership_base
           + floor((leadership_base + random(0..variance)) * param_3076 / 100)
```

Every seeded character starts with:

```text
rank = 0
```

## 12. Fixed Personnel Placement

Some characters are placed deterministically:

### Yavin
- Leia Organa
- Luke Skywalker
- Han Solo
- Wedge Antilles
- Chewbacca
- Jan Dodonna

### Alliance HQ
- Mon Mothma

### Coruscant
- Emperor Palpatine

## 13. Random Personnel Distribution

After fixed placement, `seed_personnel()` distributes the remaining major characters.

### Empire main list

Always seeded randomly:
- Darth Vader
- Jerjerrod
- Ozzel
- Piett
- Veers
- Needa

### Extra personnel count

Extra major-character count depends on galaxy size:
- `5120` for standard
- `5121` for large
- `5122` for huge

Those values are not spelled out in the nearby comments, but the code uses them as the side-specific counts for extra major personnel beyond the fixed starting lists.

This is computed separately for Alliance and Empire.

### Choosing extra characters

`get_major_character()`:
- scans `mnchar`
- filters to characters valid for that side
- excludes characters already seeded
- picks one random remaining candidate

### Choosing placement location

`seed_personnel_randomly()` chooses between:
- a seeded system
- a fleet ship

The selection space is:

```text
0 .. (system_count + fleet_count - 1)
```

If the random index falls in the system range:
- place the character directly on the planet

Otherwise:
- pick a fleet
- pick a random ship in that fleet
- place the character into that ship's inventory

So personnel are distributed across both:
- owned populated systems
- active fleets

## 14. Final Seeding Order

The full startup order is:

1. compute core political bucket counts
2. shuffle all systems
3. seed each system's population/control/support/resources/facilities
4. add uprising-prevention troops where needed
5. seed common Alliance units
6. seed common Empire units
7. seed random personnel

## 15. Practical Summary

At a gameplay level, the seeding model does this:
- forces a few canonical starting locations
- randomizes most other starting worlds
- creates plausible economic stats from parameter-driven rolls
- converts support deficits into garrison troops
- spends maintenance budget on additional unit bundles
- spreads major characters across systems and fleets

That is the full pipeline from system selection to final personnel distribution.

## Parameter Notes

The numeric examples above come from the inline comments in [seed.js](./seed.js).

They are best read as:
- the default or reference values the reverse-engineered code was written against
- not a guarantee that every loaded scenario or table file uses exactly those same numbers at runtime
