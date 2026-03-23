const game_resources = require('./assets');
const game_utils = require('./utils');
const { key } = require('./key');
const { OBJECT_KEY, OBJECT_TYPE, OBJECT_RANGE, PLAYER_SIDE, SYSTEM_CONTROL } = require('./constants');

const {
    SYSTEM_YAVIN,
    SYSTEM_CORUSCANT,
    MINE,
    ALLIANCE_ARMY_REGIMENT,
    IMPERIAL_ARMY_REGIMENT,
    LUKE_SKYWALKER,
    LEIA_ORGANA,
    HAN_SOLO,
    CHEWBACCA,
    JAN_DODONNA,
    WEDGE_ANTILLES,
    MON_MOTHMA,
    EMPEROR_PALPATINE,
    DARTH_VADER,
    JERJERROD,
    OZZEL,
    PIET,
    VEERS,
    NEEDA,
    FLEET,
    SHIPYARD,
    TRAINING_FACILITY
} = OBJECT_KEY;

const {
    SYSTEM_RIM: SYSTEM_TYPE_RIM,
    SYSTEM_CORE: SYSTEM_TYPE_CORE
} = OBJECT_TYPE;

const {
    ALLIANCE: PLAYER_ALLIANCE,
    EMPIRE: PLAYER_EMPIRE,
    GLOBAL: PLAYER_GLOBAL
} = PLAYER_SIDE;

const {
    NEUTRAL: CONTROL_NEUTRAL,
    ALLIANCE: CONTROL_ALLIANCE,
    EMPIRE: CONTROL_EMPIRE
} = SYSTEM_CONTROL;

function get_player(session) {

    if ('empire' === session.control) {
        return PLAYER_EMPIRE;
    }
    else if ('alliance' === session.control) {
        return PLAYER_ALLIANCE;
    }

    return PLAYER_GLOBAL;
}

function get_galaxy_size(session) {

    switch (session.size) {
        case 'standard':
            return 1;

        case 'large':
            return 2;

        case 'huge':
            return 3;
    }
}

function get_table_entry(table, random) {

    var _node = table[0];

    for (var i = 0; i < table.length; i++) {

        const _entry = table[i];

        if (random < _entry.value) {

            //console.log(_node);
            return _node;
        }
        _node = _entry;
    }
    //console.log(_node);
    return _node;
}

function get_core_system_populated(session) {

    // 7730: Core Systems: Populated systems (%)        = 100

    const _threshold = game_resources.general_param(session, 7730);

    return game_utils.get_random_outcome(_threshold);
}

function get_rim_system_populated(session) {

    // 7731: Core Systems: Populated systems (%)        = 31

    const _threshold = game_resources.general_param(session, 7731);

    return game_utils.get_random_outcome(_threshold);
}

function get_core_system_support_value(session, side, flag) {

    // 7682: Core Sector Owned Systems with support Popularity: Base (%)                a= 60/60 60/60 60/60 e= 60/60 60/60 60/60 m= 60/60
    // 7683: Core Sector Owned Systems with support Popularity: Max Random Extra (%)    a= 30/30 30/30 30/30 e= 30/30 30/30 30/30 m= 30/30
    // 7684: Core Sector Owned Systems without support Popularity: Baset (%)            a= 20/20 20/20 20/20 e= 20/20 20/20 20/20 m= 20/20
    // 7685: Core Sector Owned Systems without support Popularity: Max Random Extra (%) a= 30/30 30/30 30/30 e= 30/30 30/30 30/30 m= 30/30

    // 7764: Core Sector Neutral System support Initial Popularity (%)                  = 18

    const _param_base_id = (0 === flag) ? 7682 : 7684;
    const _param_random_id = (0 === flag) ? 7683 : 7685;
    var _value = 0;
    var _extra = 0;

    switch (side) {

        case 1:
            _extra = game_utils.get_random_number(game_resources.side_param(session, _param_random_id, 0));
            _value = _extra + game_resources.side_param(session, _param_base_id, 0);
            break;

        case 2:
            _extra = game_utils.get_random_number(game_resources.side_param(session, _param_random_id, 1));
            _value = _extra + game_resources.side_param(session, _param_base_id, 1);
            break;

        default:
            _extra = game_resources.general_param(session, 7764);
            _value = game_utils.get_random_number(_extra) + (50 - _extra / 2);
            break;
    }

    return _value;
}

function get_rim_system_support(session) {

    // 7765: Rim Systems: Neutral system support at day 0          = 0

    const _threshold = game_resources.general_param(session, 7765);
    const _random = game_utils.get_random_number(_threshold);
    const _value = _random + (50 - _threshold / 2);

    //console.log('rim_system_support = ' + _threshold + ' outcome = ' + _value);

    return _value;
}

/*
as alliance

_percent_alliance_strong_support = 15
_percent_empire_strong_support = 30
_percent_alliance_weak_support = 0
_percent_empire_weak_support = 10
_alliance_strong = 9
_alliance_weak = 0
_empire_strong = 18
_empire_weak = 6
_neutral = 27

as empire

_percent_alliance_strong_support = 40
_percent_empire_strong_support = 10
_percent_alliance_weak_support = 0
_percent_empire_weak_support = 5
_alliance_strong = 24
_alliance_weak = 0
_empire_strong = 6
_empire_weak = 3
_neutral = 27
*/
function get_core_system_support_params(session, side, support) {

    // 7680: Core Sector Owned Systems with support     a= 10/10 20/25 15/30   e= 10/10 35/10 40/10   m= 10/10
    // 7681: Core Sector Owned Systems without support  a=  0/4   0/10  0/10   e=  0/4   0/10  0/5    m=  0/4

    const _param_id = support ? 7681 : 7680;
    var _value = 0;

    switch (side) {
        case CONTROL_ALLIANCE:
            _value = game_resources.side_param(session, _param_id, 0);
            break;

        case CONTROL_EMPIRE:
            _value = game_resources.side_param(session, _param_id, 1);
            break;

        default: // CONTROL_NEUTRAL
            if (!support) {
                _value = 100 - (game_resources.side_param(session, 7680, 0) + game_resources.side_param(session, 7680, 1) +
                    game_resources.side_param(session, 7681, 0) + game_resources.side_param(session, 7681, 1));
            }
            else {
                _value = support;
            }
            break;
    }

    //console.log(_param_id + ': side = ' + side + ' support = ' + support + ' value = ' + _value);

    return _value;
}

function get_rim_energy(session) {

    // 7713: Systems Buildings slots (Energy) Min              = 0
    // 7714: Systems Buildings slots (Energy) Max              = 15
    // 7725: Rim Systems Buildings slots (Energy) Base         = 1
    // 7726: Rim Systems Buildings slots (Energy) Extra 1      = 4
    // 7727: Rim Systems Buildings slots (Energy) Extra 2      = 9

    const _random1 = game_utils.get_random_number(game_resources.general_param(session, 7726));
    const _random2 = game_utils.get_random_number(game_resources.general_param(session, 7727));
    const _base = _random1 + game_resources.general_param(session, 7725) + _random2;
    const _min = game_resources.general_param(session, 7713);
    const _max = game_resources.general_param(session, 7714);

    return Math.min(_max, Math.max(_min, _base));
}

function get_rim_raw_materials(session, energy) {

    // 7711: Systems Mines slots (Raw Materials) Min            = 0
    // 7712: Systems Mines slots (Raw Materials) Max            = 15
    // 7728: Rim Systems Mines slots (Raw Materials) Base       = 1
    // 7729: Rim Systems Mines slots (Raw Materials) Extra      = 14

    const _random = game_utils.get_random_number(game_resources.general_param(session, 7729));
    const _base = _random + game_resources.general_param(session, 7728);
    const _min = game_resources.general_param(session, 7711);
    const _max = game_resources.general_param(session, 7712);

    const _value = Math.min(_max, Math.max(_min, _base));
    return Math.min(energy, Math.max(_min, _value));
}

function get_core_energy(session) {

    // 7713: Systems Buildings slots (Energy) Min               = 0
    // 7714: Systems Buildings slots (Energy) Max               = 15
    // 7721: Core Systems Buildings slots (Energy) Base         = 10
    // 7722: Core Systems Buildings slots (Energy) Extra        = 4

    const _random = game_utils.get_random_number(game_resources.general_param(session, 7722));
    const _base = _random + game_resources.general_param(session, 7721);
    const _min = game_resources.general_param(session, 7713);
    const _max = game_resources.general_param(session, 7714);

    return Math.min(_max, Math.max(_min, _base));
}

function get_core_raw_materials(session, energy) {

    // 7723: Core Systems Mines slots (Raw Materials) Base     = 5
    // 7724: Core Systems Mines slots (Raw Materials) Extra    = 9
    // 7711: Systems Mines slots (Raw Materials) Min           = 0
    // 7712: Systems Mines slots (Raw Materials) Max           = 15

    const _random = game_utils.get_random_number(game_resources.general_param(session, 7724));
    const _base = _random + game_resources.general_param(session, 7723);
    const _min = game_resources.general_param(session, 7711);
    const _max = game_resources.general_param(session, 7712);

    const _value = Math.min(_max, Math.max(_min, _base));
    return Math.min(energy, Math.max(_min, _value));
}

function seed_alliance_hq(session, system) {

    // 5140: Facilities from faclhq Min    = 1
    // 5141: Facilities from faclhq Max    = 2

    const _table = game_resources.tables.faclhq;
    const _min = game_resources.general_param(session, 5140);
    const _max = game_resources.general_param(session, 5141);

    var _facility_count = 0;

    var _count = _min;
    if (_count <= _max) {

        //console.log('seed_alliance_hq');

        do {

            const _entry = get_table_entry(_table, _count);

            if (_entry && _entry.value === _count) {

                const _list = _entry.items;

                for (const each of _list) {

                    if (each && each.key) {

                        game_utils.update_galaxy(session, PLAYER_ALLIANCE, game_utils.PROP_SYSTEM_ADD_INVENTORY, system.key, {
                            key: each.key,
                            status: 0,
                            cookie: game_utils.get_counter_id(session),
                            control: CONTROL_ALLIANCE
                        });

                        _facility_count++;
                    }
                }
            }

            _count++;
        }
        while (_count <= _max);
    }
    return _facility_count;
}

function seed_empire_hq(session, system) {

    // 5142: Facilities from faclcr Min         = 1
    // 5143: Facilities from faclcr Max         = 1

    const _table = game_resources.tables.faclcr;
    const _min = game_resources.general_param(session, 5142);
    const _max = game_resources.general_param(session, 5143);

    var _facility_count = 0;

    var _count = _min;
    if (_count <= _max) {

        //console.log('seed_empire_hq');

        do {

            const _entry = get_table_entry(_table, _count);

            if (_entry && _entry.value === _count) {

                const _list = _entry.items;

                for (const each of _list) {

                    if (each && each.key) {

                        game_utils.update_galaxy(session, PLAYER_GLOBAL, game_utils.PROP_SYSTEM_ADD_INVENTORY, system.key, {
                            key: each.key,
                            status: 0,
                            cookie: game_utils.get_counter_id(session),
                            control: CONTROL_EMPIRE
                        });

                        _facility_count++;
                    }
                }
            }

            _count++;
        }
        while (_count <= _max);
    }
    return _facility_count;
}

function seed_yavin_units(session, system) {

    // 5130: Common units Yavin from cmunyv Min     = 1
    // 5131: Common units Yavin from cmunyv Max     = 1

    const _table = game_resources.tables.cmunyv;
    const _min = game_resources.general_param(session, 5130);
    const _max = game_resources.general_param(session, 5131);

    var _count = _min;
    if (_count <= _max) {

        //console.log('seed_yavin_units');

        do {

            const _entry = get_table_entry(_table, _count);

            if (_entry && _entry.value === _count) {

                const _list = _entry.items;

                for (const each of _list) {

                    if (each && each.key) {

                        game_utils.update_galaxy(session, PLAYER_GLOBAL, game_utils.PROP_SYSTEM_ADD_INVENTORY, system.key, {
                            key: each.key,
                            status: 0,
                            cookie: game_utils.get_counter_id(session),
                            control: CONTROL_ALLIANCE
                        });
                    }
                }
            }

            _count++;
        }
        while (_count <= _max);
    }
}

function seed_alliance_hq_units(session, system) {

    // 5132: Common units Alliance HQ from cmunhq Min       = 1
    // 5133: Common units Alliance HQ from cmunhq Max       = 1

    const _table = game_resources.tables.cmunhq;
    const _min = game_resources.general_param(session, 5132);
    const _max = game_resources.general_param(session, 5133);

    var _count = _min;
    if (_count <= _max) {

        //console.log('seed_alliance_hq_units');

        do {

            const _entry = get_table_entry(_table, _count);

            if (_entry && _entry.value === _count) {

                const _list = _entry.items;

                for (const each of _list) {

                    if (each && each.key) {

                        game_utils.update_galaxy(session, PLAYER_ALLIANCE, game_utils.PROP_SYSTEM_ADD_INVENTORY, system.key, {
                            key: each.key,
                            status: 0,
                            cookie: game_utils.get_counter_id(session),
                            control: CONTROL_ALLIANCE
                        });
                    }
                }
            }

            _count++;
        }
        while (_count <= _max);
    }
}

function seed_coruscant_units(session, system) {

    // 5134: Common units Corruscant from cmuncr Min    = 1
    // 5135: Common units Corruscant from cmuncr Max    = 1

    const _table = game_resources.tables.cmuncr;
    const _min = game_resources.general_param(session, 5134);
    const _max = game_resources.general_param(session, 5135);

    var _count = _min;
    if (_count <= _max) {

        //console.log('seed_coruscant_units');

        do {

            const _entry = get_table_entry(_table, _count);

            if (_entry && _entry.value === _count) {

                const _list = _entry.items;

                for (const each of _list) {

                    if (each && each.key) {

                        game_utils.update_galaxy(session, PLAYER_EMPIRE, game_utils.PROP_SYSTEM_ADD_INVENTORY, system.key, {
                            key: each.key,
                            status: 0,
                            cookie: game_utils.get_counter_id(session),
                            control: CONTROL_EMPIRE
                        });
                    }
                }
            }

            _count++;
        }
        while (_count <= _max);
    }
}

function seed_coruscant_test_facility(session, system) {

    game_utils.update_galaxy(session, PLAYER_EMPIRE, game_utils.PROP_SYSTEM_ADD_INVENTORY, system.key, {
        key: SHIPYARD,
        status: 0,
        cookie: game_utils.get_counter_id(session),
    });

    game_utils.update_galaxy(session, PLAYER_EMPIRE, game_utils.PROP_SYSTEM_ADD_INVENTORY, system.key, {
        key: TRAINING_FACILITY,
        status: 0,
        cookie: game_utils.get_counter_id(session)
    });
}

function get_diplomacy_value(datasheet, force) {

    const _extra = game_utils.get_random_number(datasheet.diplomacy_variance);

    if (force) {
        const _value = game_utils.calculate_value((_extra + datasheet.diplomacy_base), force);
        return _value + datasheet.diplomacy_base;
    }

    return _extra + datasheet.diplomacy_base;
}

function get_espionage_value(datasheet, force) {
    const _extra = game_utils.get_random_number(datasheet.espionage_variance);

    if (force) {
        const _value = game_utils.calculate_value(_extra + datasheet.espionage_base, force);
        return _value + datasheet.espionage_base;
    }

    return _extra + datasheet.espionage_base;
}

function get_jedi_force_level(datasheet) {
    const _extra = game_utils.get_random_number(datasheet.jedi_level_variance);
    return datasheet.jedi_level_base + _extra;
}

function get_combat_value(datasheet, force, handicap = 0) {
    const _extra = game_utils.get_random_number(datasheet.combat_variance);

    if (force) {
        const _value = game_utils.calculate_value(_extra + datasheet.combat_base, force);
        return Math.max(0, _value + (datasheet.combat_base - handicap));
    }

    return _extra + datasheet.combat_base;
}

function get_leadership_value(datasheet, bonus) {
    const _extra = game_utils.get_random_number(datasheet.leadership_varianace);

    if (bonus) {
        const _value = game_utils.calculate_value(_extra + datasheet.leadership_base, bonus);
        return datasheet.leadership_base + _value;
    }

    return _extra + datasheet.leadership_base;
}

function get_ship_design_value(datasheet) {
    const _extra = game_utils.get_random_number(datasheet.ship_design_variance);
    return _extra + datasheet.ship_design_base;
}

function get_troop_design_value(datasheet) {
    const _extra = game_utils.get_random_number(datasheet.troop_design_variance);
    return _extra + datasheet.troop_design_base;
}

function get_facility_design_value(datasheet) {
    const _extra = game_utils.get_random_number(datasheet.facility_design_variance);
    return _extra + datasheet.facility_design_base;
}

function setup_character(session, object, datasheet) {

    const _is_seat_of_power = datasheet.empire ? true : false;
    const _param_3076 = game_resources.general_param(session, 3076);

    object.jedi = datasheet.jedi || game_utils.get_random_outcome(datasheet.jedi_probability);

    object.force = get_jedi_force_level(datasheet);

    object.diplomacy = get_diplomacy_value(datasheet, object.jedi ? object.force : null);
    object.espionage = get_espionage_value(datasheet, object.jedi ? object.force : null);
    object.combat = get_combat_value(datasheet, object.jedi ? object.force : null);
    object.leadership_base = get_leadership_value(datasheet, null);
    object.leadership = get_leadership_value(datasheet, _is_seat_of_power ? _param_3076 : null);
    object.ship_design = get_ship_design_value(datasheet);
    object.troop_design = get_troop_design_value(datasheet);
    object.facility_design = get_facility_design_value(datasheet);

    object.rank = 0;

    //console.log(object);
    return object;
}

function seed_yavin_personnel(session, system) {

    const _personnel = [ LEIA_ORGANA, LUKE_SKYWALKER, HAN_SOLO,
        WEDGE_ANTILLES, CHEWBACCA, JAN_DODONNA ];

    for (const each of _personnel) {

        const _datasheet = game_resources.search_tables_by_key(each);

        if (_datasheet) {

            game_utils.update_galaxy(session, PLAYER_GLOBAL, game_utils.PROP_SYSTEM_ADD_INVENTORY, system.key, setup_character(session, {
                key: _datasheet.key,
                status: 0,
                cookie: game_utils.get_counter_id(session),
                control: CONTROL_ALLIANCE
            }, _datasheet));
        }
    }
}

function seed_alliance_hq_personnel(session, system) {

    const _datasheet = game_resources.search_tables_by_key(MON_MOTHMA);

    if (_datasheet) {

        game_utils.update_galaxy(session, PLAYER_ALLIANCE, game_utils.PROP_SYSTEM_ADD_INVENTORY, system.key, setup_character(session, {
            key: _datasheet.key,
            status: 0,
            cookie: game_utils.get_counter_id(session),
            control: CONTROL_ALLIANCE
        }, _datasheet));
    }
}

function seed_coruscant_personnel(session, system) {

    const _datasheet = game_resources.search_tables_by_key(EMPEROR_PALPATINE);

    if (_datasheet) {

        game_utils.update_galaxy(session, PLAYER_EMPIRE, game_utils.PROP_SYSTEM_ADD_INVENTORY, system.key, setup_character(session, {
            key: _datasheet.key,
            status: 0,
            cookie: game_utils.get_counter_id(session),
            control: CONTROL_EMPIRE
        }, _datasheet));
    }
}

function seed_alliance_main_fleet(session, system) {

    // 5129: Fleet 1 location probability: Yavin vs HQ      = 50
    // 5136: Alliance Fleet from cmunaf Min                 = 1
    // 5137: Alliance Fleet from cmunaf Max                 = 2

    const _threshold = game_resources.general_param(session, 5129);
    const _yavin = game_utils.get_random_outcome(_threshold) ? true : false;

    const _table = game_resources.tables.cmunaf;
    const _min = game_resources.general_param(session, 5136);
    const _max = game_resources.general_param(session, 5137);

    console.log('fleet on yavin: ' + _threshold + ' = ' + _yavin);

    var _count = _min;
    if (_count <= _max) {

        const _ships = [];

        //console.log('seed_alliance_main_fleet');

        do {

            const _entry = get_table_entry(_table, _count);

            if (_entry && _entry.value === _count) {

                const _list = _entry.items;
                const _ship = _list[0];
                const _inventory = [];

                for (var i = 1; i < _list.length; i++) {

                    const _contents = _list[i];

                    _inventory.push({
                        key: _contents.key,
                        status: 0,
                        cookie: game_utils.get_counter_id(session),
                        control: CONTROL_ALLIANCE,
                    });
                }

                const _data = game_resources.search_tables_by_key(_ship.key);

                if (_data) {

                    const _new_ship = {
                        key: _ship.key,
                        name: _data.name + ' ' + game_utils.get_counter_id(session, PLAYER_ALLIANCE, _ship.key),
                        inventory: _inventory,
                        status: 0,
                        cookie: game_utils.get_counter_id(session),
                        control: CONTROL_ALLIANCE,
                    };

                    //console.log('alliance: ' + key(_ship.key).toString() + ' = ' + _new_ship.name + ' (cookie=' + _new_ship.cookie + ')');
                    _ships.push(_new_ship);
                }
            }
            _count++;
        }
        while (_count <= _max);

        if (_ships.length) {

            const _key = FLEET;

            const _new_fleet = {
                key: _key,
                name: 'Fleet ' + game_utils.get_counter_id(session, PLAYER_ALLIANCE, _key),
                ships: _ships,
                control: CONTROL_ALLIANCE,
                status: 0,
                cookie: game_utils.get_counter_id(session)
            };

            //console.log('alliance: ' + key(_new_fleet.key).toString() + ' = ' + _new_fleet.name + ' (cookie=' + _new_fleet.cookie + ')');

            game_utils.update_galaxy(session, _yavin ? PLAYER_GLOBAL : PLAYER_ALLIANCE, game_utils.PROP_SYSTEM_ADD_INVENTORY, _yavin ? SYSTEM_YAVIN : system.key, _new_fleet);
        }
    }
}

function seed_coruscant_main_fleet(session, system) {

    // 5138: Coruscant Empire Fleet from cmunef Min         = 1
    // 5139: Coruscant Empire Fleet from cmunef Max         = 1

    const _table = game_resources.tables.cmunef;
    const _min = game_resources.general_param(session, 5138);
    const _max = game_resources.general_param(session, 5139);

    var _count = _min;
    if (_count <= _max) {

        const _ships = [];

        //console.log('seed_coruscant_main_fleet');

        do {

            const _entry = get_table_entry(_table, _count);

            if (_entry && _entry.value === _count) {

                const _list = _entry.items;
                const _ship = _list[0];
                const _inventory = [];

                for (var i = 1; i < _list.length; i++) {

                    const _contents = _list[i];

                    _inventory.push({
                        key: _contents.key,
                        status: 0,
                        cookie: game_utils.get_counter_id(session),
                        control: CONTROL_EMPIRE,
                    });
                }

                const _data = game_resources.search_tables_by_key(_ship.key);

                if (_data) {

                    const _new_ship = {
                        key: _ship.key,
                        name: _data.name + ' ' + game_utils.get_counter_id(session, PLAYER_EMPIRE, _ship.key),
                        inventory: _inventory,
                        status: 0,
                        cookie: game_utils.get_counter_id(session),
                        control: CONTROL_EMPIRE,
                    };

                    //console.log('empire: ' + key(_new_ship.key).toString() + ' = ' + _new_ship.name + ' (cookie=' + _new_ship.cookie + ')');

                    _ships.push(_new_ship);
                }
            }
            _count++;
        }
        while (_count <= _max);

        if (_ships.length) {

            const _key = FLEET;

            const _new_fleet = {
                key: _key,
                name: 'Fleet ' + game_utils.get_counter_id(session, PLAYER_EMPIRE, _key),
                ships: _ships,
                control: CONTROL_EMPIRE,
                status: 0,
                cookie: game_utils.get_counter_id(session)
            };

            //console.log('empire: ' + key(_new_fleet.key).toString() + ' = ' + _new_fleet.name + ' (cookie=' + _new_fleet.cookie + ')');

            game_utils.update_galaxy(session, PLAYER_EMPIRE, game_utils.PROP_SYSTEM_ADD_INVENTORY, system.key, _new_fleet);
        }
    }
}

// syfccr:
// 0     0    0   0
// 1     36    2:45 Refinery
// 2     79    1:40 Orbital Shipyard
// 3     82    2:41 Training Facility
// 4     85    3:42 Construction Yard
// 5     88    3:36 GenCore Level I
// 6     96    2:35 LNR Series I
// 7     99    1:34 KDY-150
//
// syfcrm:
// 0     0   0   0
// 1     91    2:45 Refinery
// 2     96    1:40 Orbital Shipyard
// 3     97    2:41 Training Facility
// 4     98    3:42 Construction Yard
// 5     99    3:36 GenCore Level I
// 6    100    2:35 LNR Series I
//
function seed_system_facility(session, system, total_energy, total_raw, core, populated) {

    // 7766: Core Systems multiplier for mines          = 4
    // 7767: Rim Systems multiplier for mines           = 2

    const _all_tables = game_resources.tables;
    const _table = core ? _all_tables.syfccr : _all_tables.syfcrm;
    const _mine_multiplier = game_resources.general_param(session, core ? 7766 : 7767);

    var _count = 0;
    var _facility_count = 0;
    var _mine_count = game_utils.fetch_galaxy(session, get_player(session), game_utils.PROP_SYSTEM_GET_MINE_COUNT, system.key);

    if (!populated) {
        return 0;
    }

    //console.log('seed_system_facility');

    do {

        const _max = (total_raw - _mine_count) * _mine_multiplier;
        const seed_mine = game_utils.get_random_outcome(_max);

        if (seed_mine) {

            game_utils.update_galaxy(session, PLAYER_GLOBAL, game_utils.PROP_SYSTEM_ADD_INVENTORY, system.key, {
                key:    MINE,
                status: 0,
                cookie: game_utils.get_counter_id(session)
            });

            _mine_count++;
            _facility_count++;
        }
        else {

            const _random = game_utils.get_random_number(100);
            const _entry = get_table_entry(_table, _random);

            if (_entry && _entry.key) {

                game_utils.update_galaxy(session, PLAYER_GLOBAL, game_utils.PROP_SYSTEM_ADD_INVENTORY, system.key, {
                    key: _entry.key,
                    status: 0,
                    cookie: game_utils.get_counter_id(session)
                });

                _facility_count++;
            }
        }

        _count++;
    }
    while (_count < total_energy);

    return _facility_count;
}

function get_troop_requirement(session, support) {

    // 7761: Garrison Requirement base          = 60
    // 7762: Garrison Requirement extra         = -10

    const _base = game_resources.general_param(session, 7761);
    const _extra = -game_resources.general_param(session, 7762);

    if (support < _base) {

        const _value = game_utils.compute_adjusted_value(_base - support, _extra);

        return _value;
    }

    return 0;
}

function seed_prevent_uprising(session, system, control) {

    const _support = game_utils.fetch_galaxy(session, get_player(session), game_utils.PROP_SYSTEM_SUPPORT, system.key);
    const _troops_required = get_troop_requirement(session, _support);

    //console.log(system.name + ': _troops_required = ' + _troops_required);

    if (_troops_required) {

        var _count = _troops_required;

        do {

            var _key = null;
            var _target = PLAYER_GLOBAL;
            var _control = 0;

            switch (control) {

                case CONTROL_ALLIANCE:
                    _key = ALLIANCE_ARMY_REGIMENT;
                    _target = PLAYER_ALLIANCE;
                    _control = CONTROL_ALLIANCE;
                    break;

                case CONTROL_EMPIRE:
                    _key = IMPERIAL_ARMY_REGIMENT;
                    _target = PLAYER_EMPIRE;
                    _control = CONTROL_EMPIRE;
                    break;
            }

            if (_target) {
                game_utils.update_galaxy(session, _target, game_utils.PROP_SYSTEM_ADD_INVENTORY, system.key, {
                    key:    _key,
                    status: 0,
                    cookie: game_utils.get_counter_id(session),
                    control: _control
                });
            }

            _count--;
        }
        while (_count);
    }
}

function get_common_units_to_deply(session, side, maintanance) {

    // 5168: standard galaxy seed   a= 33/33 25/38 25/38   e= 33/33 38/25 38/25   m=28/28
    // 5169: large galaxy seed      a= 25/25 20/30 20/30   e= 25/25 30/20 30/20   m=20/20
    // 5170: huge galaxy seed       a= 20/20 15/25 15/20   e= 20/20 25/15 25/15   m=15/15

    var _param_id = 0;

    switch (session.size) {
        case 'standard':
            _param_id = 5168;
            break;

        case 'large':
            _param_id = 5169;
            break;

        case 'huge':
            _param_id = 5170;
            break;
    }

    const _value1 = game_resources.side_param(session, _param_id, PLAYER_EMPIRE === side ? 1 : 0);
    const _value2 = game_utils.calculate_value(maintanance, _value1);

    //console.log('param_id = ' + _param_id + ' value = ' + _value1 + '% units = ' + _value2);
    return _value2;
}


/*
cmunem:                                     cmunal:
1   133:20 Imperial Star Destroyer          1   65:20 Bulk Cruiser
9   132:20 Victory Destroyer                9   68:20 Alliance Escort Carrier
      7:16 Imperial Fleet Regiment               3:28 X-wing
      5:16 TIE Fighter                           4:28 Y-wing
20  133:20 Imperial Star Destroyer          13  69:20 Corellian Corvette
      6:16 Stormtrooper Regiment            27  70:20 Medium Transport
      6:16 Stormtrooper Regiment                 2:16 Alliance Army Regiment
      5:28 TIE Fighter                           2:16 Alliance Army Regiment
      5:28 TIE Fighter                      36  3:28 X-wing
24  142:20 Imperial Dreadnaught             40  4:28 Y-wing
      7:16 Imperial Fleet Regiment          54  1:16 Alliance Fleet Regiment
      5:16 TIE Fighter                      58  2:16 Alliance Army Regiment
29  137:20 Galleon                          89  1:60 Guerrillas
      7:16 Imperial Fleet Regiment          90  2:60 Infiltrators
      7:16 Imperial Fleet Regiment          93  3:60 Longprobe Y-wing Recon Team
39    5:16 TIE Fighter                      97  4:60 Bothan Spies
61    6:16 Stormtrooper Regiment
69    8:16 Carrack Light Cruiser
84    5:60 Imperial Probe Droid
89    6:60 Imperial Espionage Droid
94    7:60 Imperial Commandos
98    8:60 Noghri Death Commandos
*/

function get_seed_common_unit(side) {

    const _random = game_utils.get_random_min_max(1, 100);
    const _all_tables = game_resources.tables;
    const _table = PLAYER_EMPIRE === side ? _all_tables.cmunem : _all_tables.cmunal;

    return get_table_entry(_table, _random);
}

function get_total_cost_for_list(list) {

    var _cost = 0;

    for (const each of list) {

        const _datasheet = game_resources.search_tables_by_key(each.key);

//        console.log(_datasheet.name + ': maintenance_cost ' + _datasheet.maintenance_cost);

        _cost += _datasheet ? (_datasheet.maintenance_cost || 0) : 0;
    }

    return _cost;
}

function find_first_occurance(session, side, system, key) {

    const _system_invetory = game_utils.fetch_galaxy(session, side, game_utils.PROP_SYSTEM_GET_INVENTORY, system.key);

    if (_system_invetory) {

        return _system_invetory.find(each => key === each.key);
    }
}

function seed_units(session, side) {

    //console.log(key(system.key).toString() + ': ' + system.name);

    const _total_maintenance = game_utils.fetch_galaxy(session, side, game_utils.PROP_GET_MAINTENANCE);
    const _total_cost = game_utils.fetch_galaxy(session, side, game_utils.PROP_GET_COST);
    const _available = _total_maintenance - _total_cost;

    var _deploy = get_common_units_to_deply(session, side, _available);
    var _used = 0;

    console.log('             for side: ' + side);
    console.log('maintenance     total: ' + _total_maintenance);
    console.log('maintenance      used: ' + _total_cost);
    console.log('maintenance available: ' + _available);
    console.log('maintenance to deploy: ' + _deploy);

    const _system_count = game_utils.fetch_galaxy(session, side, game_utils.PROP_SYSTEM_SEED_GET_COUNT, true);

    do {

        const _random = game_utils.get_random_number(_system_count - 1) ;
        const _system = game_utils.fetch_galaxy(session, side, game_utils.PROP_SYSTEM_SEED_GET_BY_COUNT, _random);

        //console.log(_system.name + ': random = ' + _random);

        const _unit = get_seed_common_unit(_system.control);
        const _side = (SYSTEM_YAVIN === _system.key) ? PLAYER_GLOBAL : side;

        if (_unit) {

            const _unit_cost = get_total_cost_for_list(_unit.items);

            _deploy -= _unit_cost;

            if (_deploy >= 0) {

                _used += _unit_cost;

                const _control = (PLAYER_EMPIRE === side) ? CONTROL_EMPIRE : CONTROL_ALLIANCE;
                const _first = _unit.items[0];

                if (!key(_first.key).is_type(...OBJECT_RANGE.SHIP)) {

                    for (const each of _unit.items) {

                        game_utils.update_galaxy(session, _side, game_utils.PROP_SYSTEM_ADD_INVENTORY, _system.key, {
                            key: each.key,
                            status: 0,
                            cookie: game_utils.get_counter_id(session),
                            control: _control
                        });
                    }
                }
                else {

                    const _list = _unit.items;

                    const _inventory = [];

                    // add to ship inventory
                    for (var i = 1; i < _list.length; i++) {

                        const _contents = _list[i];

                        _inventory.push({
                            key: _contents.key,
                            status: 0,
                            cookie: game_utils.get_counter_id(session),
                            control: _control
                        });
                    }

                    const _datasheet = game_resources.search_tables_by_key(_first.key);

                    if (_datasheet) {

                        const _new_ship = {
                            key: _first.key,
                            name: _datasheet.name + ' ' + game_utils.get_counter_id(session, side, _first.key),
                            inventory: _inventory,
                            status: 0,
                            cookie: game_utils.get_counter_id(session),
                            control: _control
                        };

                        //console.log(side + ': ' + key(_new_ship.key).toString() + ' = ' + _new_ship.name + ' (cookie=' + _new_ship.cookie + ')');

                        const _existing_fleet = find_first_occurance(session, side, _system, FLEET);

                        if (_existing_fleet) {
                            // add to fleet
                            game_utils.update_galaxy(session, _side, game_utils.PROP_FLEET_ADD_INVENTORY, _existing_fleet.cookie, _new_ship);
                        }
                        else {
                            const _new_fleet = {
                                key: FLEET,
                                name: 'Fleet ' + game_utils.get_counter_id(session, side, FLEET),
                                ships: [ _new_ship ],
                                status: 0,
                                cookie: game_utils.get_counter_id(session),
                                control: _control,
                            };

                            //console.log(side + ': ' + key(_new_fleet.key).toString() + ' = ' + _new_fleet.name + ' (cookie=' + _new_fleet.cookie + ')');

                            // create fleet
                            game_utils.update_galaxy(session, _side, game_utils.PROP_SYSTEM_ADD_INVENTORY, _system.key, _new_fleet);
                        }
                    }
                }
            }
        }
        else {
            console.log('seed_units(' + side + ') unit not found');
        }
    }
    while (_deploy >= 0);

    console.log('maintenance      left: ' + (_available - _used));
}

function seed_personnel_randomly(session, side, person_key) {

    const _system_count = game_utils.fetch_galaxy(session, side, game_utils.PROP_SYSTEM_SEED_GET_COUNT);
    const _fleet_count = game_utils.fetch_galaxy(session, side, game_utils.PROP_FLEET_GET_COUNT);

    const _random = game_utils.get_random_number((_fleet_count - 1) + _system_count);
    const _datasheet = game_resources.search_tables_by_key(person_key);
    const _control = PLAYER_EMPIRE === side ? CONTROL_EMPIRE : CONTROL_ALLIANCE;

    if (_random < _system_count) {

        const _system = game_utils.fetch_galaxy(session, side, game_utils.PROP_SYSTEM_SEED_GET_BY_COUNT, _random);

        // seed to planet
        game_utils.update_galaxy(session, side, game_utils.PROP_SYSTEM_ADD_INVENTORY, _system.key, setup_character(session, {
            key: person_key,
            status: 0,
            cookie: game_utils.get_counter_id(session),
            control: _control
        }, _datasheet));
    }
    else {

        const _fleet = game_utils.fetch_galaxy(session, side, game_utils.PROP_FLEET_GET_BY_COUNT, _random - _system_count);
        const _random_ship = game_utils.get_random_number(_fleet.ships.length - 1);
        const _ship = _fleet.ships[_random_ship];

        //console.log('add personnel to fleet ' + _fleet.name + ' ship ' + _ship.name);

        // seed to fleet
        game_utils.update_galaxy(session, side, game_utils.PROP_FLEET_ADD_INVENTORY, _ship.cookie, setup_character(session, {
            key: person_key,
            status: 0,
            cookie: game_utils.get_counter_id(session),
            control: _control
        }, _datasheet));
    }
}

function get_personnel_extra(session, side) {

    switch (get_galaxy_size(session)) {
        case 1:
            return game_resources.side_param(session, 5120, PLAYER_EMPIRE === side);
        case 2:
            return game_resources.side_param(session, 5121, PLAYER_EMPIRE === side);
        case 3:
            return game_resources.side_param(session, 5122, PLAYER_EMPIRE === side);
    }
    return 1;
}

function get_major_character(session, side) {

    const _mnchar = game_resources.tables.mnchar;

    var _available_count = 0;

    for (const mnchar of _mnchar) {

        if ((PLAYER_EMPIRE === side && mnchar.empire) || (PLAYER_ALLIANCE === side && mnchar.alliance)) {

            const _exists = game_utils.fetch_galaxy(session, side, game_utils.PROP_PERSONNEL_GET_BY_KEY, mnchar.key);

            if (!_exists) {
                _available_count++;
            }
        }
    }

    const _random = game_utils.get_random_number(_available_count - 1);

    _available_count = 0;
    for (const mnchar of _mnchar) {

        if ((PLAYER_EMPIRE === side && mnchar.empire) || (PLAYER_ALLIANCE === side && mnchar.alliance)) {

            const _exists = game_utils.fetch_galaxy(session, side, game_utils.PROP_PERSONNEL_GET_BY_KEY, mnchar.key);

            if (!_exists) {

                if (_random <= _available_count) {
                    return mnchar;
                }

                _available_count++;
            }
        }
    }
}

function seed_personnel(session) {

    const _empire_main = [ DARTH_VADER, JERJERROD, OZZEL, PIET, VEERS, NEEDA ];

    for (const each of _empire_main) {
        seed_personnel_randomly(session, PLAYER_EMPIRE, each);
    }

    const _empire_extra_count = get_personnel_extra(session, PLAYER_EMPIRE);

    console.log('seed extra empire ' + _empire_extra_count);

    for (var i = 0; i < _empire_extra_count; i++) {

        const _extra = get_major_character(session, PLAYER_EMPIRE);

        if (_extra) {
            console.log('add ' + _extra.name);
            seed_personnel_randomly(session, PLAYER_EMPIRE, _extra.key);
        }
    }

    const _alliance_extra_count = get_personnel_extra(session, PLAYER_ALLIANCE);

    console.log('seed extra alliance ' + _alliance_extra_count);

    for (var i = 0; i < _alliance_extra_count; i++) {

        const _extra = get_major_character(session, PLAYER_ALLIANCE);

        if (_extra) {
            console.log('add ' + _extra.name);
            seed_personnel_randomly(session, PLAYER_ALLIANCE, _extra.key);
        }
    }
}

function shuffle_array(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function system_count_by_type(session, type) {
    var _count = 0;

    for (const sector of session.sectors) {
        if (sector.type === type) {
            _count++;
        }
    }

    return _count;
}

module.exports = function(session) {

    const _core_count = system_count_by_type(session, 144);

    console.log('core count = ' + _core_count);

    const _percent_alliance_strong_support = get_core_system_support_params(session, CONTROL_ALLIANCE, 0);
    const _percent_empire_strong_support = get_core_system_support_params(session, CONTROL_EMPIRE, 0);
    const _percent_alliance_weak_support = get_core_system_support_params(session, CONTROL_ALLIANCE, 1);
    const _percent_empire_weak_support = get_core_system_support_params(session, CONTROL_EMPIRE, 1);

    var _alliance_strong = game_utils.calculate_value(_core_count, _percent_alliance_strong_support);
    var _alliance_weak = game_utils.calculate_value(_core_count, _percent_alliance_weak_support);
    var _empire_strong = game_utils.calculate_value(_core_count, _percent_empire_strong_support);
    var _empire_weak = game_utils.calculate_value(_core_count, _percent_empire_weak_support);

    var _neutral = _core_count - _alliance_strong - _alliance_weak - _empire_strong - _empire_weak;

    var _alliance_hq = false;
    var _system_control = CONTROL_NEUTRAL;

    console.log('percent_alliance_strong_support = ' + _percent_alliance_strong_support);
    console.log('percent_empire_strong_support = ' + _percent_empire_strong_support);
    console.log('percent_alliance_weak_support = ' + _percent_alliance_weak_support);
    console.log('percent_empire_weak_support = ' + _percent_empire_weak_support);

    console.log('alliance_strong = ' + _alliance_strong);
    console.log('alliance_weak = ' + _alliance_weak);
    console.log('empire_strong = ' + _empire_strong);
    console.log('empire_weak = ' + _empire_weak);
    console.log('neutral = ' + _neutral);

    _empire_strong -= 1   // subtract for SYSTEM_CORUSCANT

    const _shuffled = shuffle_array(session.sectors);

    for (var i = 0; i < _shuffled.length; i++) {

        const _system = _shuffled[i];

        var _populated = false;
        var _used_energy = 0;

        //console.log('0x' + system.key.toString(16).padStart(8, '0') + ' ' + _system.name);

        if (SYSTEM_TYPE_CORE === _system.type) {

            if (SYSTEM_CORUSCANT === _system.key) {

                _system_control = CONTROL_EMPIRE;

                game_utils.update_galaxy(session, PLAYER_GLOBAL, game_utils.PROP_SYSTEM_UNCHARTED, _system.key, false);
                game_utils.update_galaxy(session, PLAYER_GLOBAL, game_utils.PROP_SYSTEM_CONTROL, _system.key, _system_control);
                game_utils.update_galaxy(session, PLAYER_GLOBAL, game_utils.PROP_SYSTEM_SUPPORT, _system.key, 100);

                _used_energy += seed_empire_hq(session, _system);

                seed_coruscant_units(session, _system);
                seed_coruscant_main_fleet(session, _system);
                seed_coruscant_personnel(session, _system);
                //seed_coruscant_test_facility(session, _system);

                _populated = true;
            }
            else if (get_core_system_populated(session)) {

                var _support_flag = 0;

                // this matches as close to what the real game does
                if (_alliance_strong > 0) {
                    _system_control = CONTROL_ALLIANCE;
                    _support_flag = 0;
                    _alliance_strong--;
                }
                else if (_alliance_weak > 0) {
                    _system_control = CONTROL_ALLIANCE;
                    _support_flag = 1;
                    _alliance_weak--;
                }
                else if (_empire_strong > 0) {
                    _system_control = CONTROL_EMPIRE;
                    _support_flag = 0;
                    _empire_strong--;
                }
                else if (_empire_weak > 0) {
                    _system_control = CONTROL_EMPIRE;
                    _support_flag = 1;
                    _empire_weak--;
                }
                else {
                    _system_control = CONTROL_NEUTRAL;
                    _neutral--;
                }

                const _support = get_core_system_support_value(session, _system_control, _support_flag);

                game_utils.update_galaxy(session, PLAYER_GLOBAL, game_utils.PROP_SYSTEM_UNCHARTED, _system.key, false);
                game_utils.update_galaxy(session, PLAYER_GLOBAL, game_utils.PROP_SYSTEM_CONTROL, _system.key, _system_control);
                game_utils.update_galaxy(session, PLAYER_GLOBAL, game_utils.PROP_SYSTEM_SUPPORT, _system.key, _support);

                _populated = true;
            }

            if (_populated) {

                var _energy = get_core_energy(session);
                var _raw = get_core_raw_materials(session, _energy);
                const _mine_count = game_utils.fetch_galaxy(session, get_player(session), game_utils.PROP_SYSTEM_GET_MINE_COUNT, _system.key);

                _used_energy += seed_system_facility(session, _system, _energy, _raw, true, true);

                if (_energy < _used_energy) {
                    const _from = _energy;
                    _energy += (_used_energy - _energy);
                    console.log(_system.name + ': adjust energy from ' + _from + ' to ' + _energy);
                }

                if (_raw < _mine_count) {
                    const _from = _raw;
                    _raw += (_mine_count - _raw);
                    console.log(_system.name + ': adjust raw from ' + _from + ' to ' + _raw);
                }

                game_utils.update_galaxy(session, PLAYER_GLOBAL, game_utils.PROP_SYSTEM_TOTAL_ENERGY, _system.key, _energy);
                game_utils.update_galaxy(session, PLAYER_GLOBAL, game_utils.PROP_SYSTEM_RAW_MATERIALS, _system.key, _raw);
            }
        }
        else if (SYSTEM_TYPE_RIM === _system.type) {

            if (SYSTEM_YAVIN === _system.key) {

                _system_control = CONTROL_ALLIANCE;

                game_utils.update_galaxy(session, PLAYER_GLOBAL, game_utils.PROP_SYSTEM_UNCHARTED, _system.key, false);
                game_utils.update_galaxy(session, PLAYER_GLOBAL, game_utils.PROP_SYSTEM_CONTROL, _system.key, _system_control);
                game_utils.update_galaxy(session, PLAYER_GLOBAL, game_utils.PROP_SYSTEM_SUPPORT, _system.key, 100);

                seed_yavin_units(session, _system);
                seed_yavin_personnel(session, _system);

                _populated = true;
            }
            else if (!_alliance_hq) {

                _alliance_hq = true;
                _system_control = CONTROL_ALLIANCE;

                game_utils.update_galaxy(session, PLAYER_ALLIANCE, game_utils.PROP_SYSTEM_UNCHARTED, _system.key, false);
                game_utils.update_galaxy(session, PLAYER_ALLIANCE, game_utils.PROP_SYSTEM_CONTROL, _system.key, _system_control);
                game_utils.update_galaxy(session, PLAYER_ALLIANCE, game_utils.PROP_SYSTEM_SUPPORT, _system.key, 100);

                _used_energy += seed_alliance_hq(session, _system);

                seed_alliance_hq_units(session, _system);
                seed_alliance_main_fleet(session, _system);
                seed_alliance_hq_personnel(session, _system);

                _populated = true;
            }
            else if (get_rim_system_populated(session)) {

                game_utils.update_galaxy(session, PLAYER_GLOBAL, game_utils.PROP_SYSTEM_SUPPORT, _system.key, get_rim_system_support(session));

                _populated = true;
            }

            var _energy = get_rim_energy(session);
            var _raw = get_rim_raw_materials(session, _energy);
            const _mine_count = game_utils.fetch_galaxy(session, get_player(session), game_utils.PROP_SYSTEM_GET_MINE_COUNT, _system.key);

            _used_energy += seed_system_facility(session, _system, _energy, _raw, false, _populated);

            if (_energy < _used_energy) {
                _energy += (_used_energy - _energy);
            }

            if (_raw < _mine_count) {
                _raw += (_mine_count - _raw);
            }

            game_utils.update_galaxy(session, PLAYER_GLOBAL, game_utils.PROP_SYSTEM_TOTAL_ENERGY, _system.key, _energy);
            game_utils.update_galaxy(session, PLAYER_GLOBAL, game_utils.PROP_SYSTEM_RAW_MATERIALS, _system.key, _raw);

            // remove, debug only
            //game_utils.update_galaxy(session, PLAYER_GLOBAL, game_utils.PROP_SYSTEM_UNCHARTED, _system.key, false);
        }

        if (_populated) {

            if (CONTROL_NEUTRAL !== _system_control) {
                seed_prevent_uprising(session, _system, _system_control);
            }

            game_utils.update_galaxy(session, PLAYER_GLOBAL, game_utils.PROP_SYSTEM_POPULATED, _system.key, true);
        }
        else {
            game_utils.update_galaxy(session, PLAYER_GLOBAL, game_utils.PROP_SYSTEM_SUPPORT, _system.key, 50);
        }
    }

    console.log('------------------------------------------------------------')
    seed_units(session, PLAYER_ALLIANCE);
    console.log('------------------------------------------------------------')
    seed_units(session, PLAYER_EMPIRE);
    console.log('------------------------------------------------------------')

    seed_personnel(session);

    return session.sectors;
};
