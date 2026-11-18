import { describe, expect, it } from 'vitest'
import {
  LANGUAGES,
  LANGUAGE_OPTIONS,
  TRANSLATIONS,
  getTranslations,
  isSupportedLanguage,
} from './translations.js'
import {
  CLASS_10_PRACTICE_CONFIG,
  CLASS_10_PRACTICE_CONTENT,
} from './class10Practice.js'
import { CLASS_10_PRACTICE_IDS } from '../utils/mathEngine.js'

function collectLeafKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return collectLeafKeys(value, path)
    }
    return [[path, value]]
  })
}

describe('5-language central translations dictionary', () => {
  it('exposes English, Kannada, Tamil, Telugu, and Hindi with valid helpers', () => {
    expect(Object.values(LANGUAGES)).toEqual(['en', 'kn', 'ta', 'te', 'hi'])
    expect(LANGUAGE_OPTIONS).toHaveLength(5)
    expect(LANGUAGE_OPTIONS.map((o) => o.code)).toEqual([
      'en',
      'kn',
      'ta',
      'te',
      'hi',
    ])

    for (const code of Object.values(LANGUAGES)) {
      expect(isSupportedLanguage(code)).toBe(true)
      expect(getTranslations(code)).toBe(TRANSLATIONS[code])
    }
    expect(isSupportedLanguage('fr')).toBe(false)
    expect(getTranslations('fr')).toBe(TRANSLATIONS.en)
  })

  it('maintains 100% key parity and non-empty strings across all 5 languages', () => {
    const enEntries = collectLeafKeys(TRANSLATIONS.en)
    const enKeys = enEntries.map(([k]) => k).sort()

    for (const code of Object.values(LANGUAGES)) {
      const entries = collectLeafKeys(TRANSLATIONS[code])
      const keys = entries.map(([k]) => k).sort()
      expect(keys, `Key mismatch in "${code}"`).toEqual(enKeys)

      for (const [key, val] of entries) {
        expect(typeof val, `${code} key ${key}`).toBe('string')
        expect(val.trim().length, `${code} key ${key}`).toBeGreaterThan(0)
      }
    }
  })

  it('provides complete 10-step NCERT Class 10 solved practice solutions across all 5 languages', () => {
    expect(CLASS_10_PRACTICE_CONFIG.map((cfg) => cfg.id)).toEqual(
      CLASS_10_PRACTICE_IDS
    )
    expect(CLASS_10_PRACTICE_CONFIG).toHaveLength(10)

    const requiredTextFields = [
      'title',
      'question',
      'concept',
      'given',
      'toFind',
      'formula',
      'substitution',
      'finalAnswer',
      'diagramCaption',
    ]

    for (const code of Object.values(LANGUAGES)) {
      const bundle = CLASS_10_PRACTICE_CONTENT[code]
      expect(bundle, `Missing Class 10 bundle for ${code}`).toBeDefined()
      expect(Object.keys(bundle).sort()).toEqual([...CLASS_10_PRACTICE_IDS].sort())

      for (const qId of CLASS_10_PRACTICE_IDS) {
        const entry = bundle[qId]
        for (const field of requiredTextFields) {
          expect(typeof entry[field], `${code}.${qId}.${field}`).toBe('string')
          expect(entry[field].trim().length, `${code}.${qId}.${field}`).toBeGreaterThan(0)
        }
        expect(Array.isArray(entry.derivation), `${code}.${qId}.derivation`).toBe(true)
        expect(entry.derivation.length, `${code}.${qId}.derivation`).toBeGreaterThan(0)
        for (const step of entry.derivation) {
          expect(typeof step).toBe('string')
          expect(step.trim().length).toBeGreaterThan(0)
        }
        expect(Array.isArray(entry.calculations), `${code}.${qId}.calculations`).toBe(true)
        expect(entry.calculations.length, `${code}.${qId}.calculations`).toBeGreaterThan(0)
        for (const step of entry.calculations) {
          expect(typeof step).toBe('string')
          expect(step.trim().length).toBeGreaterThan(0)
        }
      }
    }
  })
})
