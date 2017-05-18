import isRegex from "is-regex";

function expandFormatRepetitions(format) {
    return format.reduce(function __reducePatterns(patterns, nextItem) {
        if (nextItem.repeat > 1 && isRegex(nextItem.char)) {
            const expanded = [];
            for (let i = 0; i < nextItem.repeat; i += 1) {
                expanded.push({ char: nextItem.char });
            }
            return [...patterns, ...expanded];
        }
        return [...patterns, nextItem];
    }, []);
}

/**
 * Format a value for a pattern
 * @param {String} value The value to format
 * @param {Array.<Object>=} formatSpec The formatting specification to apply to the value
 * @returns {String} The formatted value
 */
export function formatValue(value, formatSpec = []) {
    const format = expandFormatRepetitions(formatSpec);
    if (format.length > 0) {
        const characters = value.split("");
        let formattedValue = "";
        while (format.length > 0 && characters.length > 0) {
            const pattern = format.shift();
            if (typeof pattern.char === "object") {
                while (characters.length > 0 && pattern.char.test(characters[0]) !== true) {
                    characters.shift();
                }
                if (characters.length > 0) {
                    formattedValue += characters[0];
                    characters.shift();
                }
            } else if (typeof pattern.exactly === "string") {
                if (pattern.exactly.length !== 1) {
                    throw new Error(`Unable to format value: 'exactly' value should be of length 1: ${pattern.exactly}`);
                }
                formattedValue += pattern.exactly;
                if (pattern.exactly === characters[0]) {
                    characters.shift();
                }
            } else {
                throw new Error(`Unable to format value: Invalid format specification: ${JSON.stringify(pattern)}`);
            }
        }
        return formattedValue;
    }
    return value;
}

/**
 * Check if a regular expression is anchored to the start of the string
 * Checks to see if the first character in the expression is the start-anchor carat ^
 */
function isAnchoredToStart(regex) {
    const rexpStr = regex.toString();
    return /^\/\^/.test(rexpStr);
}
