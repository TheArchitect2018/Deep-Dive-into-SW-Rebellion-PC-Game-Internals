const ITEM_STATUS = {
    ACTIVE                            : 0,
    ENROUTE                           : 1 << 1,
    BUILDING                          : 1 << 2,
    TRAINING                          : 1 << 2, // same as under construction
    INJURED                           : 1 << 3,
    DAMAGED                           : 1 << 3, // same as injured
    CAPTURED                          : 1 << 4,
    MISSION                           : 1 << 5,
    RETIRED                           : 1 << 6,
    KILLED                            : 1 << 7
};

const OBJECT_KEY = {
    FLEET                             : 0x08000004,
    ALLIANCE_ARMY_REGIMENT            : 0x10000002,
    IMPERIAL_ARMY_REGIMENT            : 0x10000008,
    SHIPYARD                          : 0x28000001,
    TRAINING_FACILITY                 : 0x29000002,
    ALLIANCE_HQ                       : 0x2a000003,
    MINE                              : 0x2c000001,
    REFINERY                          : 0x2d000002,
    MON_MOTHMA                        : 0x30000240,
    LEIA_ORGANA                       : 0x31000241,
    LUKE_SKYWALKER                    : 0x32000242,
    HAN_SOLO                          : 0x33000243,
    EMPEROR_PALPATINE                 : 0x34000280,
    DARTH_VADER                       : 0x35000281,
    WEDGE_ANTILLES                    : 0x38000341,
    CHEWBACCA                         : 0x38000343,
    JAN_DODONNA                       : 0x38000344,
    JERJERROD                         : 0x38000380,
    OZZEL                             : 0x38000381,
    PIET                              : 0x38000382,
    VEERS                             : 0x38000383,
    NEEDA                             : 0x3800038c,
    SYSTEM_CORUSCANT                  : 0x90000109,
    SYSTEM_YAVIN                      : 0x92000121
};

const OBJECT_TYPE = {
    TROOP                             : 0x10,
    SHIP                              : 0x14,
    FIGHTER                           : 0x1c,
    FACILITY                          : 0x20,
    TRAVEL_UNIT_LIMIT                 : 0x22,
    SHIPYARD                          : 0x28,
    TRAINING_FACILITY                 : 0x29,
    CONSTRUCTION_YARD                 : 0x2a,
    MINE                              : 0x2c,
    REFINERY                          : 0x2d,
    PERSONNEL                         : 0x30,
    RETIRABLE_PERSONNEL               : 0x38,
    SPECIAL_PASSENGER                 : 0x3c,
    MISSION                           : 0x40,
    MISSION_LIMIT                     : 0x80,
    SYSTEM_CORE                       : 0x90,
    SYSTEM_RIM                        : 0x92,
    SYSTEM_LIMIT                      : 0x98
};

const OBJECT_RANGE = {
    TROOP                             : [OBJECT_TYPE.TROOP, OBJECT_TYPE.SHIP],
    SHIP                              : [OBJECT_TYPE.SHIP, OBJECT_TYPE.FIGHTER],
    SHIP_OR_FIGHTER                   : [OBJECT_TYPE.SHIP, OBJECT_TYPE.FACILITY],
    TRAVEL_UNIT                       : [OBJECT_TYPE.SHIP, OBJECT_TYPE.TRAVEL_UNIT_LIMIT],
    FIGHTER                           : [OBJECT_TYPE.FIGHTER, OBJECT_TYPE.FACILITY],
    NON_CONTAINER_TARGET              : [OBJECT_TYPE.FIGHTER, OBJECT_TYPE.MISSION],
    FACILITY                          : [OBJECT_TYPE.FACILITY, OBJECT_TYPE.PERSONNEL],
    CONSTRUCTION_FACILITY             : [OBJECT_TYPE.SHIPYARD, OBJECT_TYPE.MINE],
    ALL_FACILITY                      : [OBJECT_TYPE.SHIPYARD, OBJECT_TYPE.PERSONNEL],
    PERSONNEL                         : [OBJECT_TYPE.PERSONNEL, OBJECT_TYPE.SPECIAL_PASSENGER],
    SHIP_PASSENGER                    : [OBJECT_TYPE.PERSONNEL, OBJECT_TYPE.MISSION],
    SPECIAL_PASSENGER                 : [OBJECT_TYPE.SPECIAL_PASSENGER, OBJECT_TYPE.MISSION],
    RETIRABLE_PERSONNEL               : [OBJECT_TYPE.RETIRABLE_PERSONNEL, OBJECT_TYPE.SPECIAL_PASSENGER],
    RETIRE_GROUP                      : [OBJECT_TYPE.RETIRABLE_PERSONNEL, OBJECT_TYPE.MISSION],
    MISSION                           : [OBJECT_TYPE.MISSION, OBJECT_TYPE.MISSION_LIMIT],
    SYSTEM                            : [OBJECT_TYPE.SYSTEM_CORE, OBJECT_TYPE.SYSTEM_LIMIT]
};

const PLAYER_SIDE = {
    ALLIANCE                          : 1,
    EMPIRE                            : 2,
    GLOBAL                            : 3
};

const SYSTEM_CONTROL = {
    NEUTRAL                           : 0,
    ALLIANCE                          : 1,
    EMPIRE                            : 2
};

module.exports = {
    ITEM_STATUS,
    OBJECT_KEY,
    OBJECT_TYPE,
    OBJECT_RANGE,
    PLAYER_SIDE,
    SYSTEM_CONTROL
};
