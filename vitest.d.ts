/// <reference types="vitest" />

import type { TestAPI, ExpectStatic, Vi } from 'vitest';

declare global {
    const describe: TestAPI['describe'];
    const it: TestAPI['it'];
    const test: TestAPI['test'];
    const expect: ExpectStatic;
    const vi: Vi;
    const beforeEach: TestAPI['beforeEach'];
    const afterEach: TestAPI['afterEach'];
    const beforeAll: TestAPI['beforeAll'];
    const afterAll: TestAPI['afterAll'];
}

export { };
