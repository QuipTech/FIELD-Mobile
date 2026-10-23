jest.mock('@react-native-community/netinfo', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// App config normally comes from app.config.js `extra`, which Jest doesn't load.
jest.mock('@/lib/env', () => ({
  env: {
    appEnv: 'development',
    apiBaseUrl: 'https://api.test',
    wsUrl: '',
    sentryDsn: '',
    scheme: 'quiptechfield',
    cognito: {
      region: 'ap-southeast-2',
      userPoolId: 'ap-southeast-2_test',
      userPoolClientId: 'test-client',
      hostedUiDomain: 'auth.test',
    },
  },
}));

// Animation and sheet libraries ship Jest mocks for their native parts.
/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
jest.mock('@gorhom/bottom-sheet', () => require('@gorhom/bottom-sheet/mock'));
require('react-native-gesture-handler/jestSetup');
/* eslint-enable @typescript-eslint/no-require-imports */
