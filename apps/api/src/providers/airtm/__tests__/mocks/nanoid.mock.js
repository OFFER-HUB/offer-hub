/**
 * Mock for nanoid module to use in Jest tests.
 * This avoids ESM import issues.
 */
let counter = 0;

const nanoid = (size = 21) => {
    counter++;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < size; i++) {
        result += chars.charAt((counter + i) % chars.length);
    }
    return result;
};

const customAlphabet = (alphabet, size) => {
    return () => {
        counter++;
        let result = '';
        for (let i = 0; i < size; i++) {
            result += alphabet.charAt((counter + i) % alphabet.length);
        }
        return result;
    };
};

module.exports = { nanoid, customAlphabet };
module.exports.nanoid = nanoid;
module.exports.customAlphabet = customAlphabet;
