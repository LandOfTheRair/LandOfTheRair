// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  server: {
    ws: 'ws://127.0.0.1:6975/'
  },
  client: {
    domain: 'localhost',
    protocol: 'http',
    port: 4567
  },
  assetHashes: {
    creatures: 0,
    decor: 0,
    effects: 0,
    items: 0,
    swimming: 0,
    terrain: 0,
    walls: 0
  },
  stripe: {
    key: 'pk_test_TNxhxgcsao9B4ouQwRXeUnmm'
  },
  version: 'localdev'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/dist/zone-error';  // Included with Angular CLI.
