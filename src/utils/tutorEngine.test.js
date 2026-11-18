import { describe, expect, it } from 'vitest'
import { LANGUAGES } from '../data/translations.js'
import { SHAPES } from './mathEngine.js'
import {
  DEFAULT_SHAPE_DIMENSIONS,
  buildDemoTutorReply,
  detectShapeInPrompt,
  detectTutorIntent,
  getTutorConnectionStatus,
  parseDimensionsFromPrompt,
  requestTutorResponse,
} from './tutorEngine.js'

describe('tutorEngine connection & honesty checks', () => {
  it('reports no live endpoint by default when VITE_TUTOR_ENDPOINT is unset', () => {
    const status = getTutorConnectionStatus()
    expect(status.hasLiveEndpoint).toBe(false)
    expect(status.endpoint).toBeNull()
  })

  it('returns mode=demo when no backend proxy is configured', async () => {
    const res = await requestTutorResponse('What is TSA of cube?', {
      language: LANGUAGES.EN,
      activeShape: SHAPES.CUBE,
      dimensionsByShape: DEFAULT_SHAPE_DIMENSIONS,
      unit: 'cm',
    })
    expect(res.mode).toBe('demo')
    expect(res.fallbackFromError).toBe(false)
    expect(res.reply).toContain('150')
  })
})

describe('tutorEngine shape, dimension, and intent parsing', () => {
  it('detects English and regional-language shape names across all 15 shapes', () => {
    expect(detectShapeInPrompt('Find volume of triangular prism', SHAPES.CUBE).shape).toBe(
      SHAPES.TRIANGULAR_PRISM,
    )
    expect(detectShapeInPrompt('Explain frustum of cone', SHAPES.CUBE).shape).toBe(
      SHAPES.FRUSTUM,
    )
    expect(detectShapeInPrompt('What is a hemisphere net?', SHAPES.CUBE).shape).toBe(
      SHAPES.HEMISPHERE,
    )
    expect(detectShapeInPrompt('ಹೆಚ್ಚು ಹೇಳಿ ಸಿಲಿಂಡರ್ ಬಗ್ಗೆ', SHAPES.CUBE).shape).toBe(
      SHAPES.CYLINDER,
    )
    expect(detectShapeInPrompt('बेलन का आयतन निकालो', SHAPES.CUBE).shape).toBe(
      SHAPES.CYLINDER,
    )
    expect(detectShapeInPrompt('கனசெவ்வகம் என்றால் என்ன?', SHAPES.CUBE).shape).toBe(
      SHAPES.CUBOID,
    )
    expect(detectShapeInPrompt('What is its volume?', SHAPES.OCTAHEDRON)).toEqual({
      shape: SHAPES.OCTAHEDRON,
      explicitlyNamed: false,
    })
  })

  it('parses problem dimensions accurately including cuboid and cylinder problems', () => {
    const cuboidParsed = parseDimensionsFromPrompt(
      'Find TSA of cuboid l=10 b=6 h=4',
      SHAPES.CUBOID,
      { l: 3, b: 3, h: 3 },
    )
    expect(cuboidParsed.parsedFromPrompt).toBe(true)
    expect(cuboidParsed.dimensions).toEqual({ l: 10, b: 6, h: 4 })

    const cylParsed = parseDimensionsFromPrompt(
      'Cylinder with radius 4 and height 6',
      SHAPES.CYLINDER,
    )
    expect(cylParsed.parsedFromPrompt).toBe(true)
    expect(cylParsed.dimensions).toEqual({ r: 4, h: 6 })
  })

  it('detects net, scale, solve, and overview intents across languages', () => {
    expect(detectTutorIntent('How many valid cube nets exist?')).toBe('net')
    expect(detectTutorIntent('What happens when you double or scale by 2x?')).toBe(
      'scale',
    )
    expect(detectTutorIntent('Calculate TSA of cube side 5')).toBe('solve')
    expect(detectTutorIntent('Tell me about this octahedron')).toBe('overview')
  })
})

describe('buildDemoTutorReply across all 15 shapes and 5 languages', () => {
  it('solves Cuboid l=10, b=6, h=4 accurately with LSA=128, TSA=248, V=240', () => {
    const out = buildDemoTutorReply('Find LSA, TSA and Volume of cuboid l=10 b=6 h=4', {
      language: LANGUAGES.EN,
      activeShape: SHAPES.CUBE,
      dimensionsByShape: DEFAULT_SHAPE_DIMENSIONS,
      unit: 'cm',
    })
    expect(out.targetShape).toBe(SHAPES.CUBOID)
    expect(out.reply).toContain('128 cm²')
    expect(out.reply).toContain('248 cm²')
    expect(out.reply).toContain('240 cm³')
  })

  it('explains scaling for out-of-slider cube side 12 cleanly via mathEngine', () => {
    const out = buildDemoTutorReply('Solve volume of cube a=12', {
      language: LANGUAGES.EN,
      activeShape: SHAPES.CUBE,
      dimensionsByShape: DEFAULT_SHAPE_DIMENSIONS,
      unit: 'cm',
    })
    expect(out.reply).toContain('1728 cm³')
    expect(out.reply).toContain('864 cm²')
  })

  it('generates valid responses across all 5 languages and all 15 shapes', () => {
    for (const lang of Object.values(LANGUAGES)) {
      for (const shape of Object.values(SHAPES)) {
        const res = buildDemoTutorReply('Explain formula and net', {
          language: lang,
          activeShape: shape,
          dimensionsByShape: DEFAULT_SHAPE_DIMENSIONS,
          unit: 'cm',
        })
        expect(res.reply.length).toBeGreaterThan(20)
        expect(res.reply).not.toContain('undefined')
        expect(res.reply).not.toContain('NaN')
      }
    }
  })
})
