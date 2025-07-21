import '@testing-library/jest-dom';
import 'whatwg-fetch';
import 'text-encoding';

global.URL = URL;
(global as any).IS_REACT_ACT_ENVIRONMENT = true;
