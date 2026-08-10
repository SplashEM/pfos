import { describe, expect, it } from 'vitest';

import { asEntityId } from './entity-id';

describe('asEntityId', () => {
  describe('preserves the identifier exactly', () => {
    const identifiers: readonly string[] = [
      'entity-1',
      '3f2504e0-4f89-11d3-9a0c-0305e82c3301',
      '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      '12345',
      'has spaces',
      '',
    ];

    for (const identifier of identifiers) {
      it(`returns ${identifier === '' ? 'an empty string' : identifier} unchanged`, () => {
        expect(asEntityId(identifier)).toBe(identifier);
      });
    }
  });

  describe('applies no transformation', () => {
    it('does not trim surrounding whitespace', () => {
      expect(asEntityId('  entity-1  ')).toBe('  entity-1  ');
    });

    it('does not change case', () => {
      expect(asEntityId('Entity-ABC')).toBe('Entity-ABC');
    });

    it('does not normalise unicode', () => {
      const decomposed = String.fromCharCode(0x65, 0x0301);
      expect(asEntityId(decomposed).length).toBe(2);
    });

    it('does not parse or interpret the identifier', () => {
      expect(asEntityId('2026-08-10')).toBe('2026-08-10');
    });
  });

  describe('introduces no runtime semantics', () => {
    it('is a plain string at runtime', () => {
      expect(typeof asEntityId('entity-1')).toBe('string');
    });

    it('round-trips through JSON unchanged', () => {
      const identifier = asEntityId('entity-1');
      expect(JSON.parse(JSON.stringify(identifier))).toBe('entity-1');
    });
  });
});
