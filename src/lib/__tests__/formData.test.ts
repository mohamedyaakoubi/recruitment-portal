import { countryCodes, countries } from '../formData';

describe('formData', () => {
  describe('countryCodes', () => {
    it('should export an array of country codes', () => {
      expect(Array.isArray(countryCodes)).toBe(true);
      expect(countryCodes.length).toBeGreaterThan(0);
    });

    it('should have correct structure for each country code', () => {
      const sampleCountry = countryCodes[0];
      expect(sampleCountry).toHaveProperty('code');
      expect(sampleCountry).toHaveProperty('country');
      expect(sampleCountry).toHaveProperty('flag');
      expect(sampleCountry).toHaveProperty('iso');
    });

    it('should have valid phone codes starting with +', () => {
      countryCodes.forEach((country) => {
        expect(country.code).toMatch(/^\+\d+$/);
      });
    });

    it('should have 2-letter ISO codes', () => {
      countryCodes.forEach((country) => {
        expect(country.iso).toMatch(/^[A-Z]{2}$/);
      });
    });

    it('should contain common countries', () => {
      const countryNames = countryCodes.map((c) => c.country);
      expect(countryNames).toContain('United States');
      expect(countryNames).toContain('United Kingdom');
      expect(countryNames).toContain('Canada');
      expect(countryNames).toContain('Germany');
    });

    it('should find USA by code', () => {
      const usa = countryCodes.find((c) => c.iso === 'US');
      expect(usa).toBeDefined();
      expect(usa?.code).toBe('+1');
      expect(usa?.country).toBe('United States');
    });
  });

  describe('countries', () => {
    it('should export an array of country names', () => {
      expect(Array.isArray(countries)).toBe(true);
      expect(countries.length).toBeGreaterThan(0);
    });

    it('should contain only strings', () => {
      countries.forEach((country) => {
        expect(typeof country).toBe('string');
      });
    });

    it('should contain common countries', () => {
      expect(countries).toContain('Canada');
      expect(countries).toContain('Germany');
      expect(countries).toContain('France');
      expect(countries).toContain('Japan');
    });

    it('should have reasonable number of countries', () => {
      expect(countries.length).toBeGreaterThan(150);
      expect(countries.length).toBeLessThan(300);
    });

    it('should handle special characters in country names', () => {
      expect(countries).toContain("Côte d'Ivoire");
      expect(countries).toContain('São Tomé and Príncipe');
    });
  });
});
