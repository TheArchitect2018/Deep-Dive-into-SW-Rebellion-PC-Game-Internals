# Utility Functions

This document extracts a small set of utility functions from [utils.js](utils.js).

## `divide_part_by_total`

```js
function divide_part_by_total(part, total) {
    return Math.trunc(part / total);
}
```

Logic:
- Divides `part` by `total`.
- Truncates toward zero with `Math.trunc`.
- Used as the base integer-division helper for percentage and adjusted-value calculations.

## `clamp_value`

```js
clamp_value: (value, min, max) => {
    return Math.min(max, Math.max(min, value));
},
```

Logic:
- Constrains `value` so it never goes below `min` or above `max`.
- If `value` is already in range, it is returned unchanged.

## `clamp_to_percentage_range`

```js
clamp_to_percentage_range: (value) => {
    return clamp_value(value, 0, 100);
},
```

Logic:
- Special-case clamp for percentages.
- Forces a value into the inclusive range `0..100`.

## `compute_adjusted_value`

```js
compute_adjusted_value: (m,b) => {
    return divide_part_by_total((b - 1) + m, b);
},
```

Logic:
- Computes `floor(((b - 1) + m) / b)` using integer truncation.
- This is effectively integer division with a bias that acts like rounding up in many positive-value cases.
- Used where the game wants a stepped adjusted result instead of a plain percentage.

Examples in use:
- Also used in build cost scaling elsewhere in the codebase.

- Troop requirement seeding in [seed.js:909](seed.js#L909):

```js
const _value = game_utils.compute_adjusted_value(_base - support, _extra);
```

## `calculate_percentage`

```js
calculate_percentage: (m, n, o) => {
    return divide_part_by_total(n * m, o);
},
```

Logic:
- Computes `floor((n * m) / o)`.
- General-purpose proportional scaling helper.
- Example: “take `m` percent of `n`” when `o` is `100`.

Examples in use:
- Also used for facility processing contribution and build progress calculations elsewhere in the codebase.

## `calculate_value`

```js
calculate_value: (m, n) => {
    return calculate_percentage(m, n, 100);
},
```

Logic:
- Thin wrapper around `calculate_percentage`.
- Computes `floor((n * m) / 100)`.
- Used heavily for “percentage of base value” calculations.

Examples in use:
- Also used for travel-time and delivery-time scaling elsewhere in the codebase.

- Maintenance-based unit count in [seed.js:987](seed.js#L987):

```js
const _value2 = game_utils.calculate_value(maintanance, _value1);
```

## `generate_random_in_range`

```js
generate_random_in_range: (max_value) => {
    var _random_value = 0;

    if (max_value > 1) {
        _random_value = Math.floor(Math.random() * max_value);
    }
    return _random_value;
},
```

Logic:
- Returns an integer in the range `0..max_value-1`.
- If `max_value` is `0` or `1`, it just returns `0`.
- This is the low-level random range helper used by the other random functions.

## `get_random_number`

```js
get_random_number: (range = 99) => {

    if (-1 < range) {
        return generate_random_in_range(range + 1);
    }
    return -generate_random_in_range(1 - range);
},
```

Logic:
- For non-negative `range`, returns an integer in `0..range`.
- For negative `range`, returns an integer in `range..0`.
- This gives the code one helper that can produce both positive and negative bounded random values.

Examples in use:
- Core system support variation in [seed.js:128](seed.js#L128):

```js
_extra = game_utils.get_random_number(game_resources.side_param(session, _param_random_id, 0));
```

- Neutral support spread in [seed.js:139](seed.js#L139):

```js
_value = game_utils.get_random_number(_extra) + (50 - _extra / 2);
```

## `get_random_outcome`

```js
get_random_outcome: (threshold) => {
    const _random_value = get_random_number();
    return _random_value < threshold;
},
```

Logic:
- Draws a random integer using the default `get_random_number()` range, which is `0..99`.
- Returns `true` if that random value is less than `threshold`.
- So `threshold` behaves like a percent chance out of `100`.

Examples in use:
- Core system populated chance in [seed.js:99](seed.js#L99):

```js
return game_utils.get_random_outcome(_threshold);
```

- Jedi flag generation in [seed.js:586](seed.js#L586):

```js
object.jedi = datasheet.jedi || game_utils.get_random_outcome(datasheet.jedi_probability);
```

## `get_random_min_max`

```js
get_random_min_max: (min, max) => {
    const _random = get_random_number(max - min);
    return _random + min;
},
```

Logic:
- Returns an integer between `min` and `max`, inclusive.
- It does this by generating a random offset in `0..(max - min)` and shifting it by `min`.

Examples in use:
- Common unit table roll in [seed.js:1022](seed.js#L1022):

```js
const _random = game_utils.get_random_min_max(1, 100);
```

## `calculate_euclidean_distance`

```js
calculate_euclidean_distance: (target_square) => {

    if (target_square <= 0) return 0;
    if (target_square <= 3) return 1;

    var _upper_bound = 2;

    if (target_square > 4) {

        do {
            _upper_bound *= 2;
        }
        while (_upper_bound * _upper_bound < target_square);
    }

    var _potential_result = Math.floor(_upper_bound / 2);
    var _lower_bound = _upper_bound;
    var _mid_point = 0;

    var _has_converged;

    do {

        _mid_point = Math.floor((_potential_result + _lower_bound) / 2);
        const _square_of_mid_point = _mid_point * _mid_point;
        var _next_mid_point = _mid_point;

        if ((_square_of_mid_point - target_square === 0 || _square_of_mid_point < target_square)) {

            if (_square_of_mid_point < target_square) {
                _potential_result = _mid_point;
            }
            _next_mid_point = _lower_bound;
        }

        _has_converged = _mid_point !== _upper_bound;
        _upper_bound = _mid_point;
        _lower_bound = _next_mid_point;

    }
    while (_has_converged);

    return _mid_point;
}
```

Logic:
- Takes a squared distance, `target_square`.
- Returns an integer approximation of `sqrt(target_square)`.
- It first expands an upper bound by doubling until the square is large enough.
- Then it narrows the answer with a binary-search-like loop.
- This avoids using floating-point square root directly and keeps the result in the game’s integer math style.
- In actual system-to-system use, the caller does this first:
  - `dx = system.x - destination.x`
  - `dy = system.y - destination.y`
  - `target_square = dx * dx + dy * dy`
- That means this function is not given two systems directly. It is given the squared straight-line distance between them.
- Example:
  - if one system is at `(10, 20)` and another is at `(13, 24)`, then:
  - `dx = -3`
  - `dy = -4`
  - `target_square = 9 + 16 = 25`
  - `calculate_euclidean_distance(25)` returns `5`
- If the squared value is not a perfect square, the function returns the integer distance produced by its search logic. For example, a squared distance between `16` and `24` maps to `4`, because the true Euclidean distance is between `4` and `5`.
- In practice, this gives the game a tile/map distance measured in whole-number steps, which is then fed into other formulas such as travel time and delivery time.
- So the full mapping from system coordinates to travel math is:
  - compute `dx` and `dy`
  - compute `dx * dx + dy * dy`
  - convert that squared value into an integer Euclidean distance with this function
  - scale that distance into days or cost with helpers like `calculate_value(...)`

Examples in use:
- No direct `seed.js` call site.
- Used elsewhere in the codebase to convert system coordinate deltas into whole-number travel/delivery distances.

## Disclaimer

These functions were mimicked from the game disassembly as a best-effort conversion into JavaScript.

The original game logic relied heavily on integer math, while JavaScript uses floating-point numbers by default. Even where the code tries to preserve integer-style behavior with truncation and similar helpers, there may still be discrepancies between the original game logic and the JavaScript implementation.
