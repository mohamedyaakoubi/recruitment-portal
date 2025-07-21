import '@testing-library/jest-dom';
import 'whatwg-fetch';
import { URL } from 'url';
import 'text-encoding';

global.URL = URL;
global.IS_REACT_ACT_ENVIRONMENT = true;
