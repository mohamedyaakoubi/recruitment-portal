import { describe, it, expect } from 'vitest';
import { calculateAge } from '../dateUtils';

describe('dateUtils', () => {
    describe('calculateAge', () => {
        it('should correctly calculate age for a past date', () => {
            // Mock today as 2024-01-01 for consistent testing
            const today = new Date('2024-01-01');
            const originalDate = global.Date;

            // @ts-ignore
            global.Date = class extends Date {
                constructor(date?: string) {
                    if (date) {
                        return super(date) as any;
                    }
                    return today;
                }
            };

            expect(calculateAge('1990-01-01')).toBe(34); // 2024 - 1990 = 34 (birthday today)
            expect(calculateAge('1990-01-02')).toBe(33); // Birthday tomorrow
            expect(calculateAge('1990-12-31')).toBe(33); // Birthday later this year

            // Restore Date
            global.Date = originalDate;
        });

        it('should return null for invalid date strings', () => {
            expect(calculateAge('invalid-date')).toBeNull();
            expect(calculateAge('')).toBeNull();
        });

        it('should handle leap years correctly', () => {
            // Mock today as 2024-03-01 (Non-leap year check)
            const today = new Date('2024-03-01');
            const originalDate = global.Date;

            // @ts-ignore
            global.Date = class extends Date {
                constructor(date?: string) {
                    if (date) {
                        return super(date) as any;
                    }
                    return today;
                }
            };

            // Born Feb 29, 2000 (Leap year)
            // Age on Mar 1, 2024 should be 24
            expect(calculateAge('2000-02-29')).toBe(24);

            global.Date = originalDate;
        });
    });
});
