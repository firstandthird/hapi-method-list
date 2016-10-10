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
    server.methods.topFunction_2Params = (param1, param2) => {};
    server.methods.nestedFunctions = {
      nestedFunction_1Params: function(param1) {},
      nestedFunction_0Params: () => {},
      nestedFunctions2: {
        nestedFunction2_3Params: (param1, param2, param3) => {}
      }
    };
    server.connection({ port: 3000 });
    done();
  });
  lab.test(' loads as a plugin with default options, lists the methods registered with the server as an HTML table', (done) => {
    server.register({
      register: methodLister,
      options: {
        verbose: true,
      },
    }, () => {
      const expectedOutput = `<table><tr><td><b>topFunction_2Params </b></td> <td>param1 </td><td>param2 </td> </tr><tr><td><b>nestedFunctions.nestedFunction_1Params </b></td> <td>param1 </td> </tr><tr><td><b>nestedFunctions.nestedFunction_0Params </b></td>  </tr><tr><td><b>nestedFunctions.nestedFunctions2.nestedFunction2_3Params </b></td> <td>param1 </td><td>param2 </td><td>param3 </td> </tr></table>`;
      server.start(() => {
        // call the route
        server.inject('/api/listMethods', (response) => {
          console.log(response.result)
          code.expect(response.result).to.equal(expectedOutput);
          done();
        });
      });
    });
  });
  lab.test(' loads as a plugin with default options, lists the methods registered with the server as json', (done) => {
    server.register({
      register: methodLister,
      options: {
        verbose: true,
      },
    }, () => {
      const expectedOutput = [{ name: 'topFunction_2Params', params: [ 'param1', 'param2' ] },
        { name: 'nestedFunctions.nestedFunction_1Params', params: ['param1'] },
        { name: 'nestedFunctions.nestedFunction_0Params', params: [] },
        { name: 'nestedFunctions.nestedFunctions2.nestedFunction2_3Params',
          params: ['param1', 'param2', 'param3'] }
      ];
      server.start(() => {
        // call the route
        server.inject('/api/listMethods?asJSON=1', (response) => {
          code.expect(response.result).to.deep.equal(expectedOutput);
          done();
        });
      });
    });
  });
  lab.test(' loads as a plugin with custom options, lists the methods registered with the server', (done) => {
    server.register({
      register: methodLister,
      options: {
        verbose: true,
        route: '/sixtysix'
      },
    }, () => {
      const expectedOutput = [{ name: 'topFunction_2Params', params: [ 'param1', 'param2' ] },
        { name: 'nestedFunctions.nestedFunction_1Params', params: ['param1'] },
        { name: 'nestedFunctions.nestedFunction_0Params', params: [] },
        { name: 'nestedFunctions.nestedFunctions2.nestedFunction2_3Params',
          params: ['param1', 'param2', 'param3'] }
      ];
      server.start(() => {
        // call the route
        server.inject('/sixtysix?asJSON=true', (response) => {
          code.expect(response.result).to.deep.equal(expectedOutput);
          done();
        });
      });
    });
  });
  lab.test(' prevents access if auth is configured to do so', (done) => {
    server.auth.scheme('custom', () => {
      return {
        authenticate: (request, reply) => {
          return reply(null, 'hi there!', {
            credentials: '',
            artifacts: {}
          });
        }
      };
    });
    server.auth.strategy('default', 'custom');
    server.register({
      register: methodLister,
      options: {
        verbose: true,
        route: '/sixtysix',
        auth: 'default'
      },
    }, () => {
      const expectedOutput = [{ name: 'topFunction_2Params', params: ['param1', 'param2'] },
        { name: 'nestedFunctions.nestedFunction_1Params', params: ['param1'] },
        { name: 'nestedFunctions.nestedFunction_0Params', params: [] },
        { name: 'nestedFunctions.nestedFunctions2.nestedFunction2_3Params',
          params: ['param1', 'param2', 'param3'] }
      ];
      server.start(() => {
        // call the route
        server.inject('/sixtysix', (response) => {
          code.expect(response.result).to.equal('hi there!');
          done();
        });
      });
    });
  });
});
