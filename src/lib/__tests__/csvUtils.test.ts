import { generateCSV } from '../csvUtils';

describe('csvUtils', () => {
  describe('generateCSV', () => {
    it('should return message when no candidates provided', () => {
      const result = generateCSV([]);
      expect(result).toBe('No candidates found');
    });

    it('should generate CSV with headers for single candidate', () => {
      const candidates = [
        {
          id: '1',
          fullName: 'John Doe',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        },
      ];

      const result = generateCSV(candidates);
      const lines = result.split('\n');

      expect(lines.length).toBe(2);
      expect(lines[0]).toContain('Application ID');
      expect(lines[0]).toContain('Full Name');
      expect(lines[1]).toContain('John Doe');
    });

    it('should escape commas in CSV values', () => {
      const candidates = [
        {
          id: '1',
          fullName: 'Doe, John',
          scoreAnalysis: 'Good candidate, very skilled',
        },
      ];

      const result = generateCSV(candidates);
      expect(result).toContain('"Doe, John"');
      expect(result).toContain('"Good candidate, very skilled"');
    });

    it('should escape double quotes in CSV values', () => {
      const candidates = [
        {
          id: '1',
          fullName: 'John "Johnny" Doe',
        },
      ];

      const result = generateCSV(candidates);
      expect(result).toContain('John ""Johnny"" Doe');
    });

    it('should handle null and undefined values', () => {
      const candidates = [
        {
          id: '1',
          fullName: 'John Doe',
          email: null,
          phoneNumber: undefined,
        },
      ];

      const result = generateCSV(candidates);
      expect(result).toContain(',,');
    });

    it('should handle multiple candidates', () => {
      const candidates = [
        { id: '1', fullName: 'John Doe', email: 'john@example.com' },
        { id: '2', fullName: 'Jane Smith', email: 'jane@example.com' },
        { id: '3', fullName: 'Bob Johnson', email: 'bob@example.com' },
      ];

      const result = generateCSV(candidates);
      const lines = result.split('\n');

      expect(lines.length).toBe(4);
      expect(result).toContain('john@example.com');
      expect(result).toContain('jane@example.com');
      expect(result).toContain('bob@example.com');
    });

    it('should handle special characters', () => {
      const candidates = [
        {
          id: '1',
          fullName: 'José María',
          email: 'josé@example.com',
          city: 'São Paulo',
        },
      ];

      const result = generateCSV(candidates);
      expect(result).toContain('José María');
      expect(result).toContain('São Paulo');
    });
  });
});
