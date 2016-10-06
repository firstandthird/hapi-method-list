'use strict';
const code = require('code');   // assertion library
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const Hapi = require('hapi');
const methodLister = require('../');

lab.experiment('hapi-method-loader', () => {
  let server;
  lab.beforeEach((done) => {
    server = new Hapi.Server({
      debug: {
        log: ['error', 'hapi-method-loader']
      }
    });
    server.connection({ port: 3000 });
    server.register({
      register: methodLister,
      options: {
        verbose: true
      },
    }, (err) => {
      if (err) {
        console.log(err);
        return;
      }
      server.methods.topFunction_2Params = (param1, param2) => {};
      server.methods.nestedFunctions = {
        nestedFunction_1Params: function(param1) {},
        nestedFunction_0Params: () => {},
        nestedFunctions2: {
          nestedFunction2_3Params: (param1, param2, param3) => {}
        }
      };
      done();
    });
  });
  lab.test(' loads as a plugin, lists the methods registered with the server', (done) => {
    const expectedOutput = [{ name: 'topFunction_2Params', params: [ 'param1', 'param2' ] },
      { name: 'nestedFunctions.nestedFunction_1Params', params: ['param1'] },
      { name: 'nestedFunctions.nestedFunction_0Params', params: [] },
      { name: 'nestedFunctions.nestedFunctions2.nestedFunction2_3Params',
        params: ['param1', 'param2', 'param3'] }
    ];
    server.start(() => {
      // call the route
      server.inject('/api/listMethods', (response) => {
        code.expect(response.result).to.deep.equal(expectedOutput);
          // use deepequal here
          done();
      })
    });
  });
});
