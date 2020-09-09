'use strict';

const assert = require('assert'),
    api = require('../api/api').create(),
    port = api.port + 1,
    mb = require('../mb').create(port),
    path = require('path'),
    isWindows = require('os').platform().indexOf('win') === 0,
    promiseIt = require('../testHelpers').promiseIt,
    baseTimeout = parseInt(process.env.MB_SLOW_TEST_TIMEOUT || 3000),
    timeout = isWindows ? 2 * baseTimeout : baseTimeout,
    fs = require('fs');

describe('--openapi', function () {
    this.timeout(timeout);

    promiseIt('should create an imposter structure from openapi yaml file', function () {
        const args = ['--openapi', path.join(__dirname, 'templates/openapi.yaml')];

        return mb.start(args)
            .then(() => {
                assert.ok(fs.existsSync('OpenApiPetstore.json'));
                fs.unlinkSync('OpenApiPetstore.json');
            })
            .finally(() => mb.stop());
    });

    promiseIt('should create an imposter structure from openapi json file', function () {
        const args = ['--openapi', path.join(__dirname, 'templates/openapi.json')];

        return mb.start(args)
            .then(() => {
                assert.ok(fs.existsSync('OpenApiLink.json'));
                fs.unlinkSync('OpenApiLink.json');
            })
            .finally(() => mb.stop());
    });
});