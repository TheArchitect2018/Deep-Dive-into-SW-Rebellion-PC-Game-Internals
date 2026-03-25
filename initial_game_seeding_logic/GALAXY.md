# Galaxy Object Model — Structure & Interaction

Everything in the game world is an **object** that must have:

* `key` (u32; hiword = type, loword = id)
* `cookie` (u32; unique per instance)
* `control` (0 = neutral, 1 = alliance, 2 = empire)
* plus any type-specific attributes

Containment implies ownership: when an object owns an array, it is responsible for its contents.

---

## Object Hierarchy

```
galaxy
 ├─ sectors[]                       // galaxy.sectors
 │   └─ systems[]                   // sector.systems
 │       └─ inventory[]             // system.inventory (objects, fleets, missions, etc.)
 │           ├─ object              // personnel / troops / fighters / facilities / fleet / mission
 │           ├─ fleet
 │           │   └─ ships[]         // fleet.ships (ship objects)
 │           │       └─ inventory[] // ship.inventory (objects carried aboard)
 │           └─ mission
 │               ├─ agents[]        // mission.agents (objects; e.g. personnel)
 │               └─ decoys[]        // mission.decoys (objects; e.g. personnel)
 ├─ unknown[]                       // killed or retired personnel (objects)
 ├─ events[]                        // event objects (historical and active)
 ├─ advice[]                        // agent advice objects
 └─ encyclopedia[]                  // galactic encyclopedia entry objects
```

---

## Common Fields (all objects)
- Common required fields (all objects)
   - key (u32; type/id encoded)
   - cookie (u32; unique per instance)
   - control (0 = neutral, 1 = alliance, 2 = empire)
   - status (string/enum; required — object lifecycle/state such as "active", "inactive", "destroyed", "retired", "completed")
   - name (optional display name)

Notes
- .status is mandatory for every object and describes its current lifecycle/state; treat it as part of the canonical serialized object shape.
- All other type-specific attributes remain as before.
```js
{
  key     : 0xTTXXIIII, // bits31..24 = type (8b), bits23..16 = reserved, bits15..0 = id (16b)
  cookie  : 123456789,  // unique instance id
  control : 0,          // 0 = neutral, 1 = alliance, 2 = empire
  name    : 'optional display name',
  // ...type-specific attributes...
}
```

**Notes**

* `key` encodes type/id in a fixed layout (see *Key Layout* below).
* `cookie` uniquely identifies the object globally.
* `control` determines alignment or ownership.


### Status Bitflags

# ITEM_STATUS — Object State Bitmasks

Each item in the game world can have one or more of the following **status flags** applied.
These are bitmask values and may be combined with bitwise operations.

| Name | Value | Description |
|------|--------|-------------|
| **ACTIVE**   | `0x00` | Normal operational state. The object is available and functioning. |
| **ENROUTE**  | `0x02` | Object is traveling to another location (fleet in transit, agent en route, etc.). |
| **BUILDING** | `0x04` | Object is under construction (facilities, ships, or troops being built). |
| **TRAINING** | `0x04` | Same as `BUILDING`; used when training troops or personnel instead of constructing. |
| **INJURED**  | `0x08` | Object (typically a character or ship) is injured or temporarily disabled. |
| **DAMAGED**  | `0x08` | Same as `INJURED`; used for ships or equipment damage instead of wounds. |
| **CAPTURED** | `0x10` | Object is captured by the opposing faction and held as a prisoner or occupied unit. |
| **MISSION**  | `0x20` | Object is currently assigned to a mission and unavailable for other tasks. |
| **RETIRED**  | `0x40` | Object is retired, deactivated, or permanently removed from active duty. |
| **KILLED**   | `0x80` | Object is destroyed or deceased; no longer present in the active game world. |

---

## Usage Examples

```js
import { ITEM_STATUS } from './constants.js';

// Check if an item is on a mission
if (item.status & ITEM_STATUS.MISSION) {
    console.log('Item is currently assigned to a mission.');
}

// Combine flags
item.status = ITEM_STATUS.MISSION | ITEM_STATUS.INJURED;

// Check multiple conditions
if (item.status & (ITEM_STATUS.KILLED | ITEM_STATUS.RETIRED)) {
    console.log('Item is no longer active.');
}
```

---

## Core Containers

### galaxy

* **fields**: `{ key, cookie, control, sectors: [], unknown: [], events: [], advice: [], encyclopedia: [] }`
* **owns**: `sectors[]`, `unknown[]`, `events[]`, `advice[]`, `encyclopedia[]`

### sector

* **fields**: `{ key, cookie, control, name, systems: [] }`
* **owns**: `systems[]`

### system

* **fields**: `{ key, cookie, control, name, inventory: [] }`
* **owns**: `inventory[]`
* **inventory may contain**:

  * normal objects (personnel, troops, fighters, facilities)
  * `fleet` objects (with ships)
  * `mission` objects (with agents/decoys)

### fleet (special system.inventory object)

* **fields**: `{ key, cookie, control, name, ships: [] }`
* **owns**: `ships[]`

### ship (member of fleet.ships)

* **fields**: `{ key, cookie, control, name, inventory: [] }`
* **owns**: `inventory[]` (troops, fighters, personnel)

### mission (object stored in system.inventory)

* **fields**: `{ key, cookie, control, type, agents: [], decoys: [], target?, status? }`
* **owns**: `agents[]`, `decoys[]`

### galaxy.unknown

* **array of objects**: `{ key, cookie, control, cause, timestamp }`
* **description**: all characters that are retired or killed.

### galaxy.events

* **array of objects**: `{ key, cookie, control, type, system, description, timestamp }`
* **description**: historical or active events affecting gameplay.

### galaxy.advice

* **array of objects**: `{ key, cookie, control, advisor, message, priority }`
* **description**: strategic or tactical advice entries from agents.

### galaxy.encyclopedia

* **array of objects**: `{ key, cookie, control, id, title, content, category }`
* **description**: stores all galactic encyclopedia articles and tooltips.

---

## Example Object Types

```js
// personnel
{ key, cookie, control, name, espionage, diplomacy, combat, leadership, jedi }

// troop regiment
{ key, cookie, control  }

// starfighter unit
{ key, cookie, control, squadron_size, damaged }

// facility (mine, refinery, etc.)
{ key, cookie, control }
```

---

## Key Layout (per key class)

* 32-bit unsigned integer
* Bits **31..24**: `type` (8 bits)
* Bits **23..16**: reserved (currently unused)
* Bits **15..0** : `id` (16 bits)

Helper behavior:

* `key(raw).type` = `(raw >>> 24) & 0xFF`
* `key(raw).id`   = `raw & 0xFFFF`
* `key.create(type, id)` = `((type & 0xFF) << 24) | (id & 0xFFFF) >>> 0`
* `is_type(min, max)` compares the 8-bit `type` in `[min, max)` range.

---

## Notes

* `cookie` and `control` are required for all objects, **except for stationary items** such as facilities.
For facilities that are attached to a system, their `control` value is implicitly determined by the system’s own `control` flag.
