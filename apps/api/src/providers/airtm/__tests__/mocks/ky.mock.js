/**
 * Mock for ky module to use in Jest tests.
 * This avoids ESM import issues.
 */
const mockResponse = {
    json: jest.fn(),
};

const mockClient = {
    get: jest.fn().mockReturnValue(mockResponse),
    post: jest.fn().mockReturnValue(mockResponse),
    put: jest.fn().mockReturnValue(mockResponse),
    delete: jest.fn().mockReturnValue(mockResponse),
};

class HTTPError extends Error {
    constructor(message, status) {
        super(message);
        this.name = 'HTTPError';
        this.response = { status };
    }
}

const ky = {
    create: jest.fn().mockReturnValue(mockClient),
};

module.exports = ky;
module.exports.default = ky;
module.exports.HTTPError = HTTPError;
