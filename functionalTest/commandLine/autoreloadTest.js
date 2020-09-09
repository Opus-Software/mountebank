'use strict';

const assert = require('assert'),
    api = require('../api/api').create(),
    port = api.port + 1,
    mb = require('../mb').create(port),
    path = require('path'),
    isWindows = require('os').platform().indexOf('win') === 0,
    BaseHttpClient = require('../api/http/baseHttpClient'),
    promiseIt = require('../testHelpers').promiseIt,
    baseTimeout = parseInt(process.env.MB_SLOW_TEST_TIMEOUT || 3000),
    timeout = isWindows ? 2 * baseTimeout : baseTimeout,
    http = BaseHttpClient.create('http'),
    fs = require('fs');

describe('autoreload', function () {
    this.timeout(timeout);

    promiseIt('should watch for changes in the included files', function () {
        const args = ['--autoreload', '--configfile', path.join(__dirname, 'nestedInclude/imposters.ejs')];

        return mb.start(args)
            .then(() => http.get('/', 4542))
            .then(response => {
                assert.strictEqual(response.body, 'autoreload test');
            })
            .then(() => {
                return http.get('/', 4545)
                    .then(() => {
                        assert.fail('should not have started the new imposter yet');
                    }).catch(error => {
                        assert.strictEqual('ECONNREFUSED', error.code);
                    });
            })
            .then(() => {
                fs.writeFileSync(path.join(__dirname, 'nestedInclude/services/port.ejs'), '"port": 4545', 'utf-8');
                return http.get('/', 4545);
            })
            .then(response => {
                assert.strictEqual(response.body, 'autoreload test');
            })
            .then(() => {
                return http.get('/', 4542)
                    .then(() => {
                        assert.fail('should not have started imposter on the outdated port');
                    }).catch(error => {
                        assert.strictEqual('ECONNREFUSED', error.code);
                    });
            })
            .then(() => {
                fs.writeFileSync(path.join(__dirname, 'nestedInclude/services/port.ejs'), '"port": 4542', 'utf-8');
            })
            .finally(() => mb.stop());
    });
});
