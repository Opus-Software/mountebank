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

describe('--wsdl', function () {
    this.timeout(timeout);

    promiseIt('should create an imposter structure from wsdl file', function () {
        const args = ['--wsdl', path.join(__dirname, 'templates/service.wsdl')];

        return mb.start(args)
            .then(() => {
                assert.ok(fs.existsSync('LuhnChecker.json'));
                fs.unlinkSync('LuhnChecker.json');
            })
            .finally(() => mb.stop());
    });
});
